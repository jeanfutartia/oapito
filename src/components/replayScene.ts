import type { Incident, Team } from '../types/types';

export type V = [number, number, number];
export const T_SEC = 4;

export interface Actor {
  x: number; y: number; h: number; speed: number; phase: number;
  kit: string; shorts: string; skin: string; num: number; tag: string;
  pose: 'RUN' | 'STAND' | 'SLIDE' | 'FALL';
  kick?: number;
  armOut?: -1 | 1;
  armAngle?: number;
  armReach?: boolean;
}
export interface Joints {
  head: V; sh: [V, V]; hip: [V, V]; knee: [V, V]; foot: [V, V]; elbow: [V, V]; hand: [V, V];
}
export interface Metric { label: string; value: string; tone?: 'ok' | 'bad' | 'warn' }
export interface Scene {
  kind: 'OFFSIDE' | 'PENALTY' | 'TACKLE' | 'HAND';
  title: string;
  center: V; goalX: number; zoom: number; tk: number;
  actors: (t: number) => Actor[];
  ball: (t: number) => V;
  focus: (t: number) => V;
  contact?: V;
  arm?: { tag: string; side: -1 | 1 };
  metrics: Metric[];
  targetMarginCm?: number;
}

const sat = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (t: number, a: number, b: number) => sat((t - a) / (b - a));
const ease = (t: number) => t * t * (3 - 2 * t);
const SK = ['#f1c9a5', '#d9a273', '#a9724a', '#7a4b2e', '#f6d7bf'];

export const isLight = (hex: string) => {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(f, 16);
  return (((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) > 150;
};

// Esqueleto simplificado em metros (x = direção do ataque, z = altura)
export function joints(a: Actor): Joints {
  const mv = Math.min(1, a.speed / 5.5);
  const sw = Math.sin(a.phase) * mv;
  const slide = a.pose === 'SLIDE';
  const fall = a.pose === 'FALL';
  const lean = slide ? -1.1 : fall ? -1.35 : 0.14 * mv;
  const hz = slide ? 0.36 : fall ? 0.42 : 0.95;
  const c = Math.cos(a.h);
  const s = Math.sin(a.h);
  const L = (f: number, l: number, z: number): V => [a.x + f * c - l * s, a.y + f * s + l * c, Math.max(0.02, z)];
  const shF = Math.sin(lean) * 0.52;
  const shZ = hz + Math.cos(lean) * 0.52;
  const leg = (sd: -1 | 1) => {
    let ta = 0.75 * sw * sd;
    let bend = 0.95 * Math.max(0, -sd * sw);
    if (slide) { ta = sd > 0 ? 1.38 : 1.0; bend = sd > 0 ? 0.04 : 1.1; }
    else if (fall) { ta = sd > 0 ? 0.8 : -0.25; bend = 0.3; }
    else if (a.kick !== undefined && sd > 0) { ta = lerp(-0.55, 1.2, a.kick); bend = 0; }
    const sa = ta - bend;
    const kf = Math.sin(ta) * 0.46;
    const kz = hz - Math.cos(ta) * 0.46;
    return { kn: L(kf, sd * 0.1, kz), ft: L(kf + Math.sin(sa) * 0.44, sd * 0.1, kz - Math.cos(sa) * 0.44) };
  };
  const arm = (sd: -1 | 1) => {
    if (a.armReach) return { el: L(shF + 0.22, sd * 0.2, shZ - 0.06), hd: L(shF + 0.52, sd * 0.14, shZ + 0.02) };
    if (a.armOut === sd) {
      const an = a.armAngle ?? 1.45;
      const sn = Math.sin(an);
      const cs = Math.cos(an);
      return { el: L(shF + 0.04, sd * (0.2 + sn * 0.28), shZ - cs * 0.28), hd: L(shF + 0.08, sd * (0.2 + sn * 0.54), shZ - cs * 0.54) };
    }
    const aa = -0.7 * sw * sd + (slide ? 1.2 : fall ? 1.4 : 0);
    const ef = shF + Math.sin(aa) * 0.28;
    const ez = shZ - Math.cos(aa) * 0.28;
    return { el: L(ef, sd * 0.24, ez), hd: L(ef + Math.sin(aa + 0.5) * 0.26, sd * 0.24, ez - Math.cos(aa + 0.5) * 0.26) };
  };
  const l0 = leg(-1); const l1 = leg(1); const a0 = arm(-1); const a1 = arm(1);
  return {
    head: L(shF + Math.sin(lean) * 0.18, 0, shZ + 0.2),
    sh: [L(shF, -0.2, shZ), L(shF, 0.2, shZ)],
    hip: [L(0, -0.12, hz), L(0, 0.12, hz)],
    knee: [l0.kn, l1.kn], foot: [l0.ft, l1.ft], elbow: [a0.el, a1.el], hand: [a0.hd, a1.hd]
  };
}

// Ponto do corpo (sem braços) mais próximo do gol adversário (+X) — regra do impedimento
export function extreme(a: Actor): { x: number; part: string; p: V } {
  const j = joints(a);
  const c: [string, V][] = [
    ['CABEÇA', j.head], ['OMBRO', j.sh[0]], ['OMBRO', j.sh[1]], ['QUADRIL', j.hip[0]], ['QUADRIL', j.hip[1]],
    ['JOELHO', j.knee[0]], ['JOELHO', j.knee[1]], ['PÉ', j.foot[0]], ['PÉ', j.foot[1]]
  ];
  let b = c[0];
  for (const q of c) if (q[1][0] > b[1][0]) b = q;
  return { x: b[1][0], part: b[0], p: b[1] };
}

function shiftScene(sc: Scene, dx: number, dy: number): Scene {
  return {
    ...sc,
    center: [sc.center[0] + dx, sc.center[1] + dy, 0],
    actors: t => sc.actors(t).map(a => ({ ...a, x: a.x + dx, y: a.y + dy })),
    ball: t => { const b = sc.ball(t); return [b[0] + dx, b[1] + dy, b[2]]; },
    focus: t => { const f = sc.focus(t); return [f[0] + dx, f[1] + dy, f[2]]; },
    contact: sc.contact ? [sc.contact[0] + dx, sc.contact[1] + dy, sc.contact[2]] : undefined
  };
}

// Ângulo (graus) entre o braço e o tronco, medido nas juntas do esqueleto
export function armAngleDeg(a: Actor, side: -1 | 1): number {
  const j = joints(a);
  const i = side > 0 ? 1 : 0;
  const v: V = [j.hand[i][0] - j.sh[i][0], j.hand[i][1] - j.sh[i][1], j.hand[i][2] - j.sh[i][2]];
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return (Math.acos(Math.max(-1, Math.min(1, -v[2] / len))) * 180) / Math.PI;
}

export function buildScene(inc: Incident, atkTeam: Team, defTeam: Team): Scene {
  const seed = [...inc.id].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const r = (n: number) => Math.abs(Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453) % 1;
  const snap = (v: number) => Math.round(v / 0.005) * 0.005;
  const A = atkTeam.primaryColor;
  const D = defTeam.primaryColor;
  const mk = (t: number, x: number, y: number, h: number, speed: number, side: 'A' | 'D', num: number, tag: string, extra: Partial<Actor> = {}): Actor => {
    const kit = side === 'A' ? A : D;
    return {
      x, y, h, speed, phase: t * T_SEC * 9.4 + num * 1.3, kit, shorts: isLight(kit) ? '#111827' : '#f8fafc',
      skin: SK[num % SK.length], num, tag, pose: 'RUN', ...extra
    };
  };
  const rec = inc.recommendedVarDecision;
  const cat = inc.category;
  const kickAnim = (t: number, at: number, w = 0.09) => (Math.abs(t - at) < w ? 1 - Math.abs(t - at) / w : undefined);

  // ---------- IMPEDIMENTO ----------
  if (cat === 'IMPEDIMENTO_3D') {
    const valid = rec === 'GOAL_VALID';
    const margin = valid ? -(0.01 + r(1) * 0.09) : 0.03 + r(1) * 0.11;
    const tk = snap(0.34 + r(3) * 0.16);
    const vR = 4.8 + r(2) * 2.2;
    const side = r(4) < 0.5 ? -1 : 1;
    const ry = side * (2 + r(5) * 4.5);
    const pY = -side * (6 + r(6) * 6);
    const pX0 = -(17 + r(7) * 5);
    const pH = Math.atan2(ry - pY, 20);
    const gkY = (r(8) - 0.5) * 3;
    const gen = (t: number, rx: number, dx: number): Actor[] => {
      const s = (t - tk) * T_SEC;
      return [
        mk(t, rx + vR * s, ry, 0.05, vR, 'A', 9, 'ATACANTE'),
        mk(t, dx + (1.2 + r(9) * 1.4) * s, ry * 0.4, 2.6, 2.2, 'D', 3, 'DEFENSOR DA LINHA'),
        mk(t, pX0 + t * 5, pY, pH, 3.2, 'A', 8, 'PASSADOR', { kick: kickAnim(t, tk) }),
        mk(t, -3.5 - r(10) * 2 + 1.2 * s, -side * (8 + r(11) * 3), 2.8, 2, 'D', 4, 'DEFESA'),
        mk(t, -4.5 - r(12) * 2 + 1.2 * s, side * (9 + r(13) * 3), 3.0, 2, 'D', 2, 'DEFESA'),
        mk(t, -7 + 4.5 * s, -side * 15, 0.1, 4.5, 'A', 11, 'ATAQUE'),
        mk(t, 19.5, gkY, Math.PI, 0.2, 'D', 1, 'GOLEIRO', { pose: 'STAND' })
      ];
    };
    const base = gen(tk, 0, 0);
    const rx = margin - (extreme(base[0]).x - extreme(base[1]).x);
    const rr = (tt: number) => rx + vR * (tt - tk) * T_SEC;
    const footAt = (t: number): V => [pX0 + t * 5 + 0.9 * Math.cos(pH), pY + 0.9 * Math.sin(pH), 0.11];
    return {
      kind: 'OFFSIDE', title: 'Impedimento • Tecnologia de linhas 3D', center: [-3, ry * 0.4, 0], goalX: 24, zoom: 1.15, tk,
      actors: t => gen(t, rx, 0),
      ball: t => {
        if (t < tk) return footAt(t);
        const K = footAt(tk);
        const Q: V = [rr(tk + 0.3) + 1.1, ry, 0.11];
        if (t < tk + 0.3) {
          const u = ease(seg(t, tk, tk + 0.3));
          return [lerp(K[0], Q[0], u), lerp(K[1], Q[1], u), 0.11 + 0.55 * Math.sin(Math.PI * u)];
        }
        if (t < 0.8) return [rr(t) + 1.1, ry, 0.11];
        const u = ease(seg(t, 0.8, 0.93));
        return [lerp(rr(0.8) + 1.1, 24.4, u), lerp(ry, 0.8, u), lerp(0.11, 1.0, u)];
      },
      focus: t => [extreme(gen(t, rx, 0)[1]).x, ry, 1],
      metrics: [
        { label: 'Rastreamento do corpo', value: '29 pontos por jogador' },
        { label: 'Câmeras da linha', value: '12 ativas' },
        { label: 'Sensor dentro da bola', value: 'ativo' }
      ],
      targetMarginCm: margin * 100
    };
  }

  // ---------- ENTRADA DE CARRINHO ----------
  if (cat === 'FORCA_EXCESSIVA') {
    const mode = rec === 'RED_CARD' ? 'RED' : rec === 'YELLOW_CARD' ? 'YELLOW' : rec === 'PLAY_ON' ? 'LEGIT' : 'FOUL';
    const tc = snap(0.44 + r(12) * 0.14);
    const sd = r(14) < 0.5 ? -1 : 1;
    const ax = (t: number) => (t < tc ? lerp(-14, 0, t / tc) : mode === 'LEGIT' ? 3.5 * (t - tc) * T_SEC : 2.2 * ease(seg(t, tc, tc + 0.3)));
    const dpos = (t: number): [number, number] => {
      if (t < tc) { const u = seg(t, 0, tc); return [lerp(-16, -0.5, u), lerp(-7 * sd, -0.6 * sd, u)]; }
      const u = ease(seg(t, tc, tc + 0.28));
      return [-0.5 + 2.8 * u, -0.6 * sd + 0.9 * sd * u];
    };
    const m = { RED: [26 + r(15) * 12, 29 + r(16) * 4], YELLOW: [12 + r(15) * 8, 22 + r(16) * 5], FOUL: [6 + r(15) * 6, 16 + r(16) * 4], LEGIT: [5 + r(15) * 5, 18 + r(16) * 5] }[mode];
    const bad = mode === 'RED' ? 'bad' : mode === 'LEGIT' ? 'ok' : 'warn';
    const sc: Scene = {
      kind: 'TACKLE', title: 'Entrada de carrinho • Disputa de bola', center: [0, 0, 0], goalX: 52.5, zoom: 1, tk: tc,
      actors: t => {
        const [dx, dy] = dpos(t);
        const sliding = t >= tc - 0.06;
        return [
          mk(t, ax(t), 0, 0, t < tc ? 14 / (tc * T_SEC) : mode === 'LEGIT' ? 3.5 : 0.5, 'A', 10, 'MEIA', { pose: mode !== 'LEGIT' && t >= tc + 0.03 ? 'FALL' : 'RUN' }),
          mk(t, dx, dy, 0.39 * sd, sliding ? 0.5 : 8, 'D', 5, 'VOLANTE', { pose: sliding ? 'SLIDE' : 'RUN' }),
          mk(t, 6 + 8 * t, -9 * sd, 0, 6, 'A', 7, 'ATAQUE'),
          mk(t, 5 + 3 * t, 9 * sd, Math.PI, 3, 'D', 8, 'DEFESA'),
          mk(t, -12 + 6 * t, 11 * sd, 0, 5, 'A', 4, 'APOIO')
        ];
      },
      ball: t => {
        if (t < tc) return [ax(t) + 0.9, 0, 0.11];
        const u = ease(seg(t, tc, tc + 0.5));
        return mode === 'LEGIT' ? [ax(tc) + 0.9 - 4 * u, sd * 6 * u, 0.11] : [ax(tc) + 0.9 + 9 * u, 1.5 * u, 0.11];
      },
      focus: () => [ax(tc) + 0.2, 0, 0.5],
      contact: [ax(tc) + 0.2, 0, 0.3],
      metrics: [
        { label: 'Altura das travas', value: m[0].toFixed(0) + ' cm', tone: bad },
        { label: 'Velocidade da entrada', value: m[1].toFixed(1).replace('.', ',') + ' km/h', tone: bad },
        { label: 'Travas expostas', value: mode === 'RED' ? 'SIM' : mode === 'YELLOW' ? 'Parcial' : 'Não', tone: bad },
        { label: 'Ponto de contato', value: mode === 'RED' ? 'Canela (acima do tornozelo)' : mode === 'YELLOW' ? 'Tornozelo' : mode === 'FOUL' ? 'Panturrilha' : 'Apenas na bola' },
        { label: 'Bola disputada', value: mode === 'LEGIT' ? 'Sim, primeiro' : 'Não — chegou após o contato', tone: mode === 'LEGIT' ? 'ok' : 'warn' }
      ]
    };
    return shiftScene(sc, (r(10) - 0.5) * 16, (r(11) - 0.5) * 20);
  }

  // ---------- TOQUE DE MÃO ----------
  if (cat === 'MAO_VOLUMETRIA' || cat === 'GOL_POLÊMICO') {
    type HV = 'ABERTO' | 'ACIMA_OMBRO' | 'NATURAL' | 'DESVIO' | 'CURTA' | 'ATACANTE_GOL';
    const v = (inc.variant as HV | undefined) ?? (cat === 'GOL_POLÊMICO' ? 'ATACANTE_GOL' : rec === 'PLAY_ON' ? 'NATURAL' : 'ABERTO');
    const s: -1 | 1 = r(20) < 0.5 ? -1 : 1;
    const tk = snap(0.24 + r(21) * 0.1);
    const tHit = snap(tk + 0.2 + r(22) * 0.08);
    const dx = 16.2 + r(23) * 2.4;
    const dy = (r(24) - 0.5) * 3;
    const deg = { ABERTO: 70 + r(28) * 18, ACIMA_OMBRO: 105 + r(28) * 35, NATURAL: 10 + r(28) * 22, DESVIO: 55 + r(28) * 25, CURTA: 42 + r(28) * 18, ATACANTE_GOL: 60 + r(28) * 35 }[v];
    const armRad = (deg * Math.PI) / 180;
    const attackerHand = v === 'ATACANTE_GOL';
    const handTag = attackerHand ? 'ATACANTE' : 'DEFENSOR';
    const handHeading = attackerHand ? 0.1 : Math.PI;
    // O braço se move: sai do corpo e abre até o ângulo final antes do contato com a bola
    const armAt = (t: number) => {
      if (v === 'NATURAL') return armRad + 0.05 * Math.sin(t * 9);
      const quick = v === 'DESVIO' || v === 'CURTA';
      return lerp(0.18, armRad, ease(seg(t, quick ? tk : tk - 0.14, quick ? tk + 0.12 : tk + 0.08)));
    };
    const armer = (t: number) => mk(t, dx, dy, handHeading, 0.4, attackerHand ? 'A' : 'D', attackerHand ? 9 : 4, handTag, { pose: 'STAND', armOut: s, armAngle: armAt(t) });
    const handPos = joints(armer(tHit)).hand[s > 0 ? 1 : 0];
    const measured = armAngleDeg(armer(tHit), s);
    const near = v === 'CURTA' ? 1.8 + r(26) * 1.2 : 8 + r(26) * 6;
    const sx0 = v === 'CURTA' ? dx - near - 0.9 - 1.2 * tk : 3 + r(25) * 3;
    const sy = v === 'CURTA' ? dy - s * (0.8 + r(27) * 0.6) : -s * (5.5 + r(27) * 3);
    const K: V = [sx0 + 1.2 * tk + 0.9, sy, 0.11];
    const thigh: V = [dx - 0.05, dy + 0.1 * s, 0.55];
    const dist = Math.hypot(handPos[0] - K[0], handPos[1] - K[1]);
    const reaction = v === 'DESVIO' ? 0.08 + r(30) * 0.06 : v === 'CURTA' ? 0.1 + r(30) * 0.08 : 0.26 + r(30) * 0.14;
    const toward = v === 'ABERTO' || v === 'ACIMA_OMBRO' || v === 'ATACANTE_GOL';
    const bad = (deg > 75 && v !== 'DESVIO' && v !== 'CURTA') || v === 'ATACANTE_GOL';
    const metrics: Metric[] = [
      { label: 'Ângulo do braço', value: Math.round(measured) + '°', tone: bad ? 'bad' : measured > 40 ? 'warn' : 'ok' },
      { label: 'Braço acima do ombro', value: measured > 90 ? 'SIM' : 'Não', tone: measured > 90 ? 'bad' : 'ok' },
      { label: 'Ampliação do corpo', value: '+' + Math.round((Math.min(measured, 120) / 90) * 34) + '%', tone: bad ? 'bad' : 'ok' },
      { label: 'Distância do chute', value: dist.toFixed(1).replace('.', ',') + ' m', tone: dist < 3 ? 'ok' : undefined },
      { label: 'Tempo de reação', value: reaction.toFixed(2).replace('.', ',') + ' s', tone: reaction < 0.2 ? 'ok' : undefined },
      { label: 'Braço em direção à bola', value: toward ? 'SIM' : 'Não', tone: toward ? 'bad' : 'ok' },
      { label: 'Bola desviou antes (corpo próprio)', value: v === 'DESVIO' ? 'SIM' : 'Não', tone: v === 'DESVIO' ? 'ok' : undefined }
    ];
    if (attackerHand) {
      metrics.push({ label: 'Gol logo após o toque de mão', value: 'SIM (infração do atacante)', tone: 'bad' }, { label: 'Controle da bola com o braço', value: 'SIM', tone: 'bad' });
    }
    const crossFrom: V = [8 + r(25) * 3, -s * (9 + r(26) * 3), 0.11];
    return {
      kind: 'HAND', title: attackerHand ? 'Mão do atacante antes do gol' : 'Toque de mão • Posição do braço', center: [15, 0, 0], goalX: 24, zoom: 1, tk: tHit,
      arm: { tag: handTag, side: s },
      actors: t => {
        const kk = Math.abs(t - tk) < 0.09 ? 1 - Math.abs(t - tk) / 0.09 : undefined;
        const list: Actor[] = [armer(t)];
        if (attackerHand) {
          const ks = seg(t, 0.8, 0.9);
          list.push(
            mk(t, crossFrom[0] + 1.2 * t, crossFrom[1], 0.55, 2, 'A', 7, 'CRUZAMENTO', { kick: kk }),
            mk(t, dx - 1.5 + 4 * seg(t, tHit, 1), dy - s * 1.4, Math.PI * 0.9, 4, 'D', 4, 'DEFENSOR'),
            mk(t, 22, 0, Math.PI, 0.2, 'D', 1, 'GOLEIRO', { pose: 'STAND' })
          );
          list[0] = { ...list[0], kick: ks > 0 && ks < 1 ? 1 - Math.abs(ks - 0.5) * 2 : undefined };
        } else {
          list.push(
            mk(t, sx0 + 1.2 * t, sy, Math.atan2(dy - sy, dx - sx0), 2.2, 'A', 10, 'ATACANTE', { kick: kk }),
            mk(t, 21.5, 0, Math.PI, 0.2, 'D', 1, 'GOLEIRO', { pose: 'STAND' }),
            mk(t, 11, -s * 6, 0.4, 3.5, 'A', 9, 'ATAQUE')
          );
        }
        return list;
      },
      ball: t => {
        if (attackerHand) {
          if (t < tk) return [crossFrom[0] + 1.2 * t + 0.9, crossFrom[1], 0.11];
          if (t < tHit) { const u = ease(seg(t, tk, tHit)); return [lerp(crossFrom[0] + 1.2 * tk + 0.9, handPos[0], u), lerp(crossFrom[1], handPos[1], u), lerp(0.11, handPos[2], u)]; }
          if (t < 0.8) { const u = ease(seg(t, tHit, 0.8)); return [lerp(handPos[0], dx + 0.5, u), lerp(handPos[1], dy, u), lerp(handPos[2], 0.11, u)]; }
          const u = ease(seg(t, 0.8, 0.93));
          return [lerp(dx + 0.5, 24.4, u), lerp(dy, 0.6, u), lerp(0.11, 0.9, u)];
        }
        if (t < tk) return [sx0 + 1.2 * t + 0.9, sy, 0.11];
        if (v === 'DESVIO' && t < tHit) {
          const mid = tk + (tHit - tk) * 0.55;
          if (t < mid) { const u = ease(seg(t, tk, mid)); return [lerp(K[0], thigh[0], u), lerp(K[1], thigh[1], u), lerp(0.11, thigh[2], u)]; }
          const u = ease(seg(t, mid, tHit));
          return [lerp(thigh[0], handPos[0], u), lerp(thigh[1], handPos[1], u), lerp(thigh[2], handPos[2], u)];
        }
        if (t < tHit) { const u = ease(seg(t, tk, tHit)); return [lerp(K[0], handPos[0], u), lerp(K[1], handPos[1], u), lerp(0.11, handPos[2], u)]; }
        const u = ease(seg(t, tHit, 0.75));
        return [lerp(handPos[0], 19.6, u), lerp(handPos[1], -s * 4.2, u), 0.2 + 0.7 * Math.sin(Math.PI * u)];
      },
      focus: () => handPos,
      contact: handPos,
      metrics
    };
  }

  // ---------- DISPUTA NA ÁREA / DOGSO (faltas) ----------
  type PV = 'TRIP' | 'HOLD' | 'PUSH' | 'CHARGE' | 'LEGIT' | 'DIVE';
  const dogso = cat === 'DOGSO_CHANCE_CLARA';
  const pv: PV = (inc.variant as PV | undefined) ?? (rec === 'PLAY_ON' ? 'LEGIT' : rec === 'YELLOW_CARD' ? 'DIVE' : 'TRIP');
  const isFoul = pv === 'TRIP' || pv === 'HOLD' || pv === 'PUSH' || pv === 'CHARGE';
  const s = r(31) < 0.5 ? -1 : 1;
  const tc = snap(0.46 + r(32) * 0.16);
  const fallAt = pv === 'LEGIT' ? tc + 0.14 : tc + 0.02;
  const apos = (t: number): [number, number] => {
    if (t < tc) { const u = seg(t, 0, tc); return [lerp(5, 18.2, u), lerp(-8 * s, 0.8 * s, u)]; }
    const u = ease(seg(t, tc, tc + 0.35));
    return [18.2 + 1.3 * u, 0.8 * s + 1.0 * s * u];
  };
  const dEnd = pv === 'DIVE' ? 3.4 * s : 1.6 * s;
  const dpos = (t: number): [number, number] => {
    if (pv === 'HOLD') { const [ax, ay] = apos(t); const u = seg(t, 0, tc); return [ax - lerp(3.5, 0.75, u), ay]; }
    const u = seg(t, 0, tc);
    const v = ease(seg(t, tc, tc + 0.3));
    return [lerp(10, 17.6, u) + 1.4 * v, lerp(9 * s, dEnd, u) + (pv === 'DIVE' ? 1.5 * s * v : 0)];
  };
  const inten = isFoul ? 62 + r(33) * 28 : pv === 'LEGIT' ? 8 + r(33) * 14 : 0;
  const hAtk = Math.atan2(8.8 * s, 13.2);
  const typeLabel: Record<PV, string> = { TRIP: 'Rasteira na perna de apoio', HOLD: 'Puxão na camisa', PUSH: 'Empurrão nas costas', CHARGE: 'Carga imprudente de lado', LEGIT: 'Disputa legal, ombro a ombro', DIVE: 'Simulação (queda sem contato)' };
  const contactPt: Record<PV, string> = { TRIP: 'Perna de apoio', HOLD: 'Camisa, altura do ombro', PUSH: 'Costas', CHARGE: 'Lateral do tronco', LEGIT: 'Ombro (marginal)', DIVE: 'Nenhum' };
  const metrics: Metric[] = [
    { label: 'Tipo de infração', value: typeLabel[pv], tone: isFoul ? 'bad' : pv === 'DIVE' ? 'warn' : 'ok' },
    { label: 'Intensidade do contato', value: pv === 'DIVE' ? '0% (sem contato)' : Math.round(inten) + (isFoul ? '% (forte)' : '% (leve)'), tone: isFoul ? 'bad' : 'ok' },
    { label: 'Queda após o toque', value: pv === 'LEGIT' ? '+0,14 s (tardia)' : pv === 'DIVE' ? 'Queda sem toque' : '+0,02 s (imediata)', tone: isFoul ? 'bad' : 'warn' },
    { label: 'Impediu a progressão', value: isFoul ? 'SIM' : 'Não', tone: isFoul ? 'bad' : 'ok' },
    { label: 'Bola jogada primeiro', value: pv === 'LEGIT' ? 'Sim, pelo defensor' : 'Não', tone: pv === 'LEGIT' ? 'ok' : 'bad' },
    { label: 'Ponto de contato', value: contactPt[pv] },
    { label: 'Posição do lance', value: 'Dentro da grande área' }
  ];
  if (dogso) {
    metrics.push(
      { label: 'Último defensor', value: 'SIM', tone: 'bad' },
      { label: 'Defensores entre bola e gol', value: '0 (apenas o goleiro)', tone: 'bad' },
      { label: 'Direção do lance', value: 'Direto ao gol', tone: 'bad' },
      { label: 'Tentativa de jogar a bola', value: rec === 'PENALTY_RED' ? 'NÃO' : 'Sim', tone: rec === 'PENALTY_RED' ? 'bad' : 'warn' }
    );
  }
  return {
    kind: 'PENALTY', title: dogso ? 'Chance clara de gol' : 'Disputa na área • Análise da falta', center: [17, 2 * s, 0], goalX: 24, zoom: 1, tk: tc,
    actors: t => {
      const [ax, ay] = apos(t);
      const [dx, dy] = dpos(t);
      const kk = pv === 'TRIP' ? (Math.abs(t - tc) < 0.1 ? 1 - Math.abs(t - tc) / 0.1 : undefined) : undefined;
      const reach = (pv === 'HOLD' || pv === 'PUSH') && t >= tc - 0.14 && t <= tc + 0.3;
      const list = [
        mk(t, ax, ay, hAtk, t < fallAt ? 6 : 0.5, 'A', 9, 'ATACANTE', { pose: t >= fallAt ? 'FALL' : 'RUN' }),
        mk(t, dx, dy, pv === 'HOLD' ? hAtk : -0.77 * s, t < tc ? 6.3 : 1.5, 'D', 4, 'DEFENSOR', { kick: kk, armReach: reach }),
        mk(t, 23, 0, Math.PI, 0.2, 'D', 1, 'GOLEIRO', { pose: 'STAND' }),
        mk(t, 12 + 2 * t, -9 * s, 0.4, 4, 'A', 11, 'ATAQUE')
      ];
      if (!dogso) list.push(mk(t, 14, 11 * s, Math.PI, 2, 'D', 3, 'DEFESA'));
      return list;
    },
    ball: t => {
      const [ax, ay] = apos(t);
      if (t < tc) return [ax + 0.9, ay + 0.3 * s, 0.11];
      const u = ease(seg(t, tc, tc + 0.5));
      return pv === 'LEGIT' ? [18.9 - 6 * u, s * (1.1 + 5 * u), 0.11] : [ax + 0.9 + 2 * u, ay + s * (0.3 + 1.2 * u), 0.11];
    },
    focus: () => [18.0, 1.1 * s, 0.6],
    contact: pv === 'DIVE' ? undefined : [18.0, 1.0 * s, pv === 'HOLD' || pv === 'PUSH' ? 1.1 : 0.45],
    metrics
  };
}
