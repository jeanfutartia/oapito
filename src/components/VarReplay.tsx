import { useEffect, useMemo, useRef, useState } from 'react';
import type { Incident, Team } from '../types/types';
import { buildScene, extreme, joints, isLight, armAngleDeg, T_SEC } from './replayScene';
import type { Actor, Scene, V } from './replayScene';

interface CamDef { id: string; name: string; short: string; eye: (c: V, f: V) => V; tgt: (c: V, f: V) => V; fov: number }
const CAMS: CamDef[] = [
  { id: 'MASTER', name: 'CÂMERA 1 • LATERAL', short: 'Lateral', eye: c => [c[0] - 4, c[1] - 22, 8], tgt: c => [c[0], c[1], 0.9], fov: 36 },
  { id: 'TACTICAL', name: 'CÂMERA 2 • VISTA DE CIMA', short: 'De cima', eye: (_c, f) => [f[0] - 1.2, f[1], 21], tgt: (_c, f) => [f[0], f[1], 0], fov: 34 },
  { id: 'REVERSE', name: 'CÂMERA 3 • ATRÁS DO GOL', short: 'Atrás do gol', eye: c => [c[0] + 26, c[1], 3.4], tgt: c => [c[0], c[1], 1.2], fov: 30 },
  { id: 'DRONE', name: 'CÂMERA 4 • AÉREA 3D', short: 'Aérea', eye: (_c, f) => [f[0] - 9, f[1] - 12, 8], tgt: (_c, f) => [f[0], f[1], 0.8], fov: 40 },
  { id: 'CLOSE', name: 'CÂMERA 5 • DE PERTO • CÂMERA LENTA', short: 'De perto', eye: (_c, f) => [f[0] - 3.6, f[1] - 7, 2.1], tgt: (_c, f) => [f[0], f[1], 0.9], fov: 30 },
  { id: 'FRONT', name: 'CÂMERA 6 • DE FRENTE (VEJA O ÂNGULO DO BRAÇO)', short: 'De frente', eye: (_c, f) => [f[0] - 6.2, f[1] - 0.9, 1.45], tgt: (_c, f) => [f[0], f[1], 1.15], fov: 28 }
];

interface Tools { lines: boolean; zone: boolean; points: boolean; labels: boolean; traced?: boolean; pick?: boolean }
type P2 = [number, number, number] | null;

function makeCam(eye: V, tgt: V, fov: number, w: number, h: number) {
  const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const nrm = (a: V): V => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const cr = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dt = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const fw = nrm(sub(tgt, eye));
  const rt = nrm(cr(fw, [0, 0, 1]));
  const up = cr(rt, fw);
  const f = (h / 2) / Math.tan((fov * Math.PI) / 360);
  return (v: V): P2 => {
    const d = sub(v, eye);
    const z = dt(d, fw);
    if (z < 0.3) return null;
    return [w / 2 + (dt(d, rt) / z) * f, h / 2 - (dt(d, up) / z) * f, f / z];
  };
}

function render(ctx: CanvasRenderingContext2D, w: number, h: number, cam: CamDef, sc: Scene, t: number, tools: Tools, full: boolean, markT: number | null) {
  const actors = sc.actors(t);
  const focus = sc.focus(t);
  const eye = cam.eye(sc.center, focus);
  const P = makeCam(eye, cam.tgt(sc.center, focus), cam.fov * sc.zoom, w, h);

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#0a1020');
  bg.addColorStop(0.3, '#0f3a28');
  bg.addColorStop(0.5, '#1b6f40');
  bg.addColorStop(1, '#17603a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const poly = (pts: V[], fill: string) => {
    const q = pts.map(p => P(p));
    if (q.some(p => p === null)) return;
    ctx.fillStyle = fill;
    ctx.strokeStyle = fill;
    ctx.lineWidth = 1;
    ctx.beginPath();
    q.forEach((p, i) => { if (p) { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); } });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  const L3 = (a: V, b: V, wd: number, col: string, dash = false) => {
    ctx.strokeStyle = col;
    ctx.lineCap = 'round';
    ctx.setLineDash(dash ? [6, 5] : []);
    const n = 10;
    for (let i = 0; i < n; i++) {
      const p0 = P([lerpN(a[0], b[0], i / n), lerpN(a[1], b[1], i / n), lerpN(a[2], b[2], i / n)]);
      const p1 = P([lerpN(a[0], b[0], (i + 1) / n), lerpN(a[1], b[1], (i + 1) / n), lerpN(a[2], b[2], (i + 1) / n)]);
      if (!p0 || !p1) continue;
      ctx.lineWidth = Math.max(1, wd * p0[2]);
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
    }
    ctx.setLineDash([]);
  };
  const dot = (p: V, r: number, fill: string, stroke?: string) => {
    const q = P(p);
    if (!q) return;
    ctx.fillStyle = fill;
    ctx.beginPath(); ctx.arc(q[0], q[1], Math.max(1.5, r * q[2]), 0, Math.PI * 2); ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  };

  // Gramado em faixas
  const gx = sc.goalX;
  const x0 = -48;
  const cols = Math.ceil((gx - x0) / 5.5);
  for (let i = 0; i < cols; i++) {
    const xa = x0 + i * 5.5;
    const xb = Math.min(gx, xa + 5.5);
    for (let j = 0; j < 10; j++) {
      const ya = -34 + j * 6.8;
      poly([[xa, ya, 0], [xb, ya, 0], [xb, ya + 6.8, 0], [xa, ya + 6.8, 0]], i % 2 === 0 ? '#1b6f40' : '#238b52');
    }
  }
  // Linhas do campo
  const wl = 0.14;
  const white = 'rgba(255,255,255,0.85)';
  const lines: [V, V][] = [
    [[gx, -34, 0], [gx, 34, 0]], [[x0, -34, 0], [gx, -34, 0]], [[x0, 34, 0], [gx, 34, 0]],
    [[gx - 16.5, -20.16, 0], [gx - 16.5, 20.16, 0]], [[gx - 16.5, -20.16, 0], [gx, -20.16, 0]], [[gx - 16.5, 20.16, 0], [gx, 20.16, 0]],
    [[gx - 5.5, -9.16, 0], [gx - 5.5, 9.16, 0]], [[gx - 5.5, -9.16, 0], [gx, -9.16, 0]], [[gx - 5.5, 9.16, 0], [gx, 9.16, 0]]
  ];
  if (gx > 40) {
    const hx = gx - 52.5;
    lines.push([[hx, -34, 0], [hx, 34, 0]]);
    for (let k = 0; k < 24; k++) {
      const a0 = (k / 24) * Math.PI * 2;
      const a1 = ((k + 1) / 24) * Math.PI * 2;
      lines.push([[hx + Math.cos(a0) * 9.15, Math.sin(a0) * 9.15, 0], [hx + Math.cos(a1) * 9.15, Math.sin(a1) * 9.15, 0]]);
    }
  }
  lines.forEach(([a, b]) => L3(a, b, wl, white));
  if (gx < 40) {
    // Trave e rede
    const net = 'rgba(255,255,255,0.35)';
    L3([gx, -3.66, 0], [gx, -3.66, 2.44], 0.12, '#f8fafc');
    L3([gx, 3.66, 0], [gx, 3.66, 2.44], 0.12, '#f8fafc');
    L3([gx, -3.66, 2.44], [gx, 3.66, 2.44], 0.12, '#f8fafc');
    for (let k = 0; k <= 6; k++) {
      const y = -3.66 + (k * 7.32) / 6;
      L3([gx, y, 2.44], [gx + 2, y * 0.85, 1.8], 0.04, net);
      L3([gx + 2, y * 0.85, 0], [gx + 2, y * 0.85, 1.8], 0.04, net);
    }
  }

  // Overlays de impedimento (abaixo dos jogadores)
  let offAtk: Actor | undefined;
  let offDef: Actor | undefined;
  if (sc.kind === 'OFFSIDE' && markT !== null) {
    const mk = sc.actors(markT);
    offAtk = mk.find(a => a.tag === 'ATACANTE');
    offDef = mk.find(a => a.tag === 'DEFENSOR DA LINHA');
    if (offAtk && offDef) {
      if (Math.abs(t - markT) > 0.0026) {
        ctx.globalAlpha = 0.35;
        drawActor(ctx, P, offAtk, false);
        drawActor(ctx, P, offDef, false);
        ctx.globalAlpha = 1;
      }
      const ea = extreme(offAtk);
      const ed = extreme(offDef);
      const isOff = ea.x > ed.x;
      const col = isOff ? '#ef4444' : '#22c55e';
      if (tools.traced && tools.zone && Math.abs(ea.x - ed.x) > 0.001) {
        poly([[ed.x, -24, 0.01], [ea.x, -24, 0.01], [ea.x, 24, 0.01], [ed.x, 24, 0.01]], isOff ? 'rgba(239,68,68,0.28)' : 'rgba(34,197,94,0.22)');
      }
      if (tools.traced && tools.lines) {
        L3([ed.x, -24, 0.02], [ed.x, 24, 0.02], 0.1, '#38bdf8');
        L3([ea.x, -24, 0.02], [ea.x, 24, 0.02], 0.1, col);
      }
    }
  }

  // Jogadores (do mais longe para o mais perto)
  const sorted = [...actors].sort((a, b) => {
    const da = Math.hypot(a.x - eye[0], a.y - eye[1]);
    const db = Math.hypot(b.x - eye[0], b.y - eye[1]);
    return db - da;
  });
  sorted.forEach(a => drawActor(ctx, P, a, tools.labels && full));

  // Bola
  const b = sc.ball(t);
  const gb = P([b[0], b[1], 0]);
  const pb = P(b);
  if (gb && pb) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(gb[0], gb[1], 0.14 * gb[2], 0.05 * gb[2], 0, 0, Math.PI * 2); ctx.fill();
    dot(b, 0.12, '#ffffff', '#111827');
  }

  // Overlays acima dos jogadores
  if (sc.arm && tools.lines) {
    const aa = actors.find(x => x.tag === sc.arm?.tag);
    if (aa) {
      const j = joints(aa);
      const i = sc.arm.side > 0 ? 1 : 0;
      const sh = j.sh[i];
      const hd = j.hand[i];
      const deg = armAngleDeg(aa, sc.arm.side);
      const hot = deg > 75;
      const col = hot ? '#ef4444' : '#38bdf8';
      // direção lateral do braço (mesma regra do esqueleto)
      const sd = sc.arm.side;
      const hv: V = [-Math.sin(aa.h) * sd, Math.cos(aa.h) * sd, 0];
      const R = 0.62;
      // linha vertical do tronco e linha do ombro (90°)
      L3(sh, [sh[0], sh[1], Math.max(0.05, sh[2] - 0.8)], 0.04, 'rgba(255,255,255,0.85)', true);
      L3(sh, [sh[0] + hv[0] * (R + 0.2), sh[1] + hv[1] * (R + 0.2), sh[2]], 0.03, 'rgba(250,204,21,0.8)', true);
      // setor do ângulo
      const arc: V[] = [sh];
      const steps = 14;
      const rad = (deg * Math.PI) / 180;
      for (let k = 0; k <= steps; k++) {
        const th = (k / steps) * rad;
        arc.push([sh[0] + hv[0] * R * Math.sin(th), sh[1] + hv[1] * R * Math.sin(th), sh[2] - R * Math.cos(th)]);
      }
      poly(arc, hot ? 'rgba(239,68,68,0.30)' : 'rgba(56,189,248,0.28)');
      L3(sh, hd, 0.07, col);
      dot(hd, 0.09, col, '#fff');
      const pl = P([sh[0] + hv[0] * (R + 0.25), sh[1] + hv[1] * (R + 0.25), sh[2] + 0.18]);
      if (pl && full) {
        const txt = deg > 90 ? 'ACIMA DO OMBRO' : deg > 75 ? 'BEM AFASTADO' : deg > 40 ? 'AFASTADO' : 'JUNTO AO CORPO';
        ctx.fillStyle = hot ? '#fca5a5' : '#7dd3fc';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(deg) + '° • ' + txt, pl[0], pl[1] - 6);
        ctx.font = '11px system-ui';
        ctx.fillStyle = 'rgba(250,204,21,0.95)';
        ctx.fillText('linha do ombro = 90°', pl[0], pl[1] + 10);
      }
    }
  }
  if (sc.kind === 'OFFSIDE' && offAtk && offDef) {
    const ea = extreme(offAtk);
    const ed = extreme(offDef);
    const isOff = ea.x > ed.x;
    const col = isOff ? '#ef4444' : '#22c55e';
    if (tools.traced && tools.lines) {
      L3(ed.p, [ed.p[0], ed.p[1], 0.02], 0.04, '#38bdf8', true);
      L3(ea.p, [ea.p[0], ea.p[1], 0.02], 0.04, col, true);
      dot(ed.p, 0.1, '#38bdf8', '#fff');
      dot(ea.p, 0.1, col, '#fff');
    }
    if (tools.pick) {
      dot(ed.p, 0.13, '#38bdf8', '#fff');
      dot(ea.p, 0.13, '#facc15', '#fff');
      if (full) {
        const qa = P(ea.p); const qd = P(ed.p);
        ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
        if (qa) { ctx.fillStyle = '#facc15'; ctx.fillText('ATAQUE • ' + ea.part, qa[0], qa[1] - 14); }
        if (qd) { ctx.fillStyle = '#7dd3fc'; ctx.fillText('DEFESA • ' + ed.part, qd[0], qd[1] + 22); }
      }
    }
    if (tools.points || tools.pick) {
      [offAtk, offDef].forEach(a => {
        const j = joints(a);
        const all: V[] = [j.head, ...j.sh, ...j.hip, ...j.knee, ...j.foot, ...j.elbow, ...j.hand];
        all.forEach(p => dot(p, 0.05, '#facc15'));
      });
    }
    if (markT !== null && Math.abs(t - markT) < 0.0026) {
      const pr = P(b);
      if (pr) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(pr[0], pr[1], 0.5 * pr[2], 0, Math.PI * 2); ctx.stroke();
        if (full) { ctx.fillStyle = '#facc15'; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center'; ctx.fillText('MOMENTO MARCADO', Math.max(60, Math.min(w - 60, pr[0])), pr[1] - 0.7 * pr[2] - 4); }
      }
    }
  } else if (sc.contact && tools.lines && Math.abs(t - sc.tk) < 0.2) {
    const pr = P(sc.contact);
    if (pr) {
      const pulse = 0.25 + ((t - sc.tk + 0.2) % 0.1) * 4;
      ctx.strokeStyle = 'rgba(239,68,68,0.95)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(pr[0], pr[1], pulse * pr[2], 0, Math.PI * 2); ctx.stroke();
      dot(sc.contact, 0.08, '#ef4444', '#fff');
      if (full) { ctx.fillStyle = '#fca5a5'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.fillText('PONTO DE CONTATO', Math.max(70, Math.min(w - 70, pr[0])), pr[1] + (pulse + 0.2) * pr[2] + 14); }
    }
  }
}

const lerpN = (a: number, b: number, t: number) => a + (b - a) * t;

function drawActor(ctx: CanvasRenderingContext2D, P: (v: V) => P2, a: Actor, labels: boolean) {
  const j = joints(a);
  const g = P([a.x, a.y, 0]);
  if (!g) return;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(g[0], g[1], 0.55 * g[2], 0.2 * g[2], 0, 0, Math.PI * 2); ctx.fill();
  const line = (p: V, q: V, wd: number, col: string) => {
    const A = P(p);
    const B = P(q);
    if (!A || !B) return;
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, wd * A[2]); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
  };
  const sock = a.kit;
  const cx = Math.cos(a.h) * 0.22;
  const cy = Math.sin(a.h) * 0.22;
  for (const s of [0, 1]) {
    line(j.hip[s], j.knee[s], 0.16, a.shorts);
    line(j.knee[s], j.foot[s], 0.11, sock);
    line(j.foot[s], [j.foot[s][0] + cx, j.foot[s][1] + cy, j.foot[s][2]], 0.13, '#0b0f19');
  }
  line(j.hip[0], j.hip[1], 0.24, a.shorts);
  const tq = [j.sh[0], j.sh[1], j.hip[1], j.hip[0]].map(p => P(p));
  if (!tq.some(p => p === null)) {
    ctx.fillStyle = a.kit; ctx.strokeStyle = 'rgba(15,23,42,0.8)'; ctx.lineWidth = 1;
    ctx.beginPath();
    tq.forEach((p, i) => { if (p) { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); } });
    ctx.closePath(); ctx.fill(); ctx.stroke();
    const mid = P([(j.sh[0][0] + j.hip[1][0]) / 2, (j.sh[0][1] + j.hip[1][1]) / 2, (j.sh[0][2] + j.hip[1][2]) / 2]);
    if (mid) {
      ctx.fillStyle = isLight(a.kit) ? '#0f172a' : '#ffffff';
      ctx.font = 'bold ' + Math.max(6, 0.3 * mid[2]) + 'px system-ui';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(a.num), mid[0], mid[1]);
    }
  }
  for (const s of [0, 1]) { line(j.sh[s], j.elbow[s], 0.08, a.skin); line(j.elbow[s], j.hand[s], 0.07, a.skin); }
  const hp = P(j.head);
  if (hp) {
    ctx.fillStyle = a.skin;
    ctx.beginPath(); ctx.arc(hp[0], hp[1], 0.12 * hp[2], 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1b1b1b';
    ctx.beginPath(); ctx.arc(hp[0], hp[1] - 0.01 * hp[2], 0.125 * hp[2], Math.PI, 0); ctx.fill();
    if (labels) {
      const txt = a.tag + ' #' + a.num;
      ctx.font = 'bold 10px system-ui';
      const tw = ctx.measureText(txt).width + 8;
      const ly = hp[1] - 0.3 * hp[2] - 12 - (a.tag === 'DEFENSOR DA LINHA' ? 17 : 0);
      ctx.fillStyle = 'rgba(15,23,42,0.85)';
      ctx.fillRect(hp[0] - tw / 2, ly, tw, 15);
      ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(txt, hp[0], ly + 8);
    }
  }
}

interface Props { incident: Incident; homeTeam: Team; awayTeam: Team }

export const VarReplay = ({ incident, homeTeam, awayTeam }: Props) => {
  const atk = incident.attackingTeam === 'HOME' ? homeTeam : awayTeam;
  const def = incident.attackingTeam === 'HOME' ? awayTeam : homeTeam;
  const scene = useMemo(() => buildScene(incident, atk, def), [incident, atk, def]);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [cam, setCam] = useState(scene.kind === 'OFFSIDE' ? 1 : scene.kind === 'HAND' ? 5 : 0);
  const [tools, setTools] = useState<Tools>({ lines: true, zone: true, points: false, labels: true });
  const [marked, setMarked] = useState<number | null>(null);
  const [pointsOk, setPointsOk] = useState(false);
  const [traced, setTraced] = useState(false);
  const tRef = useRef(0);
  const eff: Tools = { ...tools, traced, pick: marked !== null && !pointsOk && !traced };
  const live = useRef({ playing, speed, cam, tools: eff, marked });
  live.current = { playing, speed, cam, tools: eff, marked };
  const mainRef = useRef<HTMLCanvasElement | null>(null);
  const thumbs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let n = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = live.current;
      if (s.playing) {
        tRef.current = Math.min(1, tRef.current + (dt * s.speed) / T_SEC);
        if (tRef.current >= 1) setPlaying(false);
      }
      const mc = mainRef.current?.getContext('2d');
      if (mc) render(mc, 960, 540, CAMS[s.cam], scene, tRef.current, s.tools, true, s.marked);
      thumbs.current.forEach((cv, i) => {
        const c = cv?.getContext('2d');
        if (c) render(c, 224, 126, CAMS[i], scene, tRef.current, s.tools, false, s.marked);
      });
      if (n++ % 2 === 0) setT(tRef.current);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [scene]);

  const goTo = (v: number) => { const c = Math.max(0, Math.min(1, v)); tRef.current = c; setT(c); };
  const step = (d: number) => { setPlaying(false); goTo(Math.round(tRef.current / 0.005) * 0.005 + d); };
  const snapKick = () => { setPlaying(false); goTo(scene.tk); };
  const pickCam = (i: number) => { setCam(i); if (CAMS[i].id === 'CLOSE') setSpeed(0.25); };

  const fmtT = (v: number) => {
    const sec = v * T_SEC;
    return incident.minute + ':' + String(Math.floor(sec)).padStart(2, '0') + '.' + String(Math.floor((sec % 1) * 1000)).padStart(3, '0');
  };
  const tcode = fmtT(t);
  const isOffside = scene.kind === 'OFFSIDE';
  const macts = isOffside ? scene.actors(marked ?? t) : [];
  const ma = macts.find(x => x.tag === 'ATACANTE');
  const md = macts.find(x => x.tag === 'DEFENSOR DA LINHA');
  const off = ma && md ? (() => { const ea = extreme(ma); const ed = extreme(md); return { cm: (ea.x - ed.x) * 100, ap: ea.part, dp: ed.part }; })() : null;
  const pas = isOffside ? scene.actors(t).find(x => x.tag === 'PASSADOR') : undefined;
  const ballNow = scene.ball(t);
  const ballPrev = scene.ball(Math.max(0, t - 0.005));
  const ballSpeed = Math.hypot(ballNow[0] - ballPrev[0], ballNow[1] - ballPrev[1], ballNow[2] - ballPrev[2]) / (0.005 * T_SEC);
  const footDist = pas ? Math.min(...joints(pas).foot.map(fp => Math.hypot(fp[0] - ballNow[0], fp[1] - ballNow[1], fp[2] - ballNow[2]))) : 0;
  const markNow = () => { setMarked(Math.round(tRef.current / 0.005) * 0.005); setPointsOk(false); setTraced(false); setPlaying(false); };
  const resetCalib = () => { setMarked(null); setPointsOk(false); setTraced(false); };
  const stage = marked === null ? 1 : !pointsOk ? 2 : !traced ? 3 : 4;

  const toolBtn = (k: keyof Tools, label: string) => (
    <button key={k} onClick={() => setTools({ ...tools, [k]: !tools[k] })}
      className={'px-2.5 py-2 sm:py-1 rounded-lg text-[11px] font-bold border transition ' + (tools[k] ? 'bg-sky-700 border-sky-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400')}>
      {label}
    </button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 font-mono">
      <div className="lg:col-span-2 flex flex-col gap-2">
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black">
          <canvas ref={mainRef} width={960} height={540} className="w-full h-auto block" />
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-wrap items-center gap-1 sm:gap-2 text-[9px] sm:text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded tracking-wider">{CAMS[cam].name}</span>
            <span className="bg-black/70 text-emerald-300 font-bold px-2 py-0.5 rounded">{tcode}</span>
            {speed < 1 && <span className="bg-black/70 text-amber-300 font-bold px-2 py-0.5 rounded">CÂMERA LENTA {speed}x</span>}
          </div>
          <div className="hidden sm:block absolute top-2 right-2 text-[10px] bg-black/70 text-slate-200 font-bold px-2 py-0.5 rounded">VAR • {scene.title}</div>
          {off && (
            <div className="sm:absolute sm:bottom-2 sm:left-2 bg-slate-950/90 border-t sm:border border-sky-500/60 sm:rounded-lg px-3 py-2 text-[11px] flex flex-col gap-0.5">
              <span className="text-sky-300 font-black tracking-wider">TECNOLOGIA DE IMPEDIMENTO</span>
              <span className="text-slate-200">Atacante: <b className="text-red-300">{off.ap}</b> • Defensor: <b className="text-sky-300">{off.dp}</b></span>
              {traced ? (
                <span className={'text-lg font-black ' + (off.cm > 0 ? 'text-red-400' : 'text-emerald-400')}>
                  {off.cm > 0 ? '+' : ''}{off.cm.toFixed(1)} cm {off.cm > 0 ? 'EM IMPEDIMENTO' : 'POSIÇÃO LEGAL'}
                </span>
              ) : (
                <span className="text-amber-300 font-bold">{['', 'Passo 1 de 3: ache o frame do passe e marque', 'Passo 2 de 3: confira os pontos mais adiantados', 'Passo 3 de 3: trace as linhas'][stage]}</span>
              )}
              <span className={marked !== null ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                {marked !== null ? '✓ Passe marcado em ' + fmtT(marked) + (pointsOk ? ' • ✓ pontos' : '') : 'Passe: não marcado'}
              </span>
            </div>
          )}
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button onClick={() => { goTo(0); setPlaying(true); }} className="px-2.5 py-2 sm:py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold hover:bg-slate-700">⏮</button>
            <button onClick={() => step(-0.005)} className="px-2.5 py-2 sm:py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold hover:bg-slate-700">◀ quadro</button>
            <button onClick={() => { if (t >= 1) goTo(0); setPlaying(!playing); }} className="px-3 py-2 sm:py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-black">{playing ? '⏸ Pausar' : '▶ Reproduzir'}</button>
            <button onClick={() => step(0.005)} className="px-2.5 py-2 sm:py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold hover:bg-slate-700">quadro ▶</button>
            {isOffside ? (
              <>
                {stage <= 2 && <button onClick={markNow} className={'px-3 py-2 sm:py-1 rounded-lg text-xs font-black ' + (stage === 1 ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-slate-800 border border-slate-700 hover:bg-slate-700')}>📍 {stage === 1 ? '1. Marcar frame do passe aqui' : 'Remarcar passe aqui'}</button>}
                {stage === 2 && <button onClick={() => setPointsOk(true)} className="px-3 py-2 sm:py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black">🎯 2. Confirmar pontos</button>}
                {stage === 3 && <button onClick={() => setTraced(true)} className="px-3 py-2 sm:py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black">📏 3. Traçar linhas</button>}
                {stage >= 2 && <button onClick={resetCalib} className="px-2.5 py-2 sm:py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold hover:bg-slate-700">↺ Refazer</button>}
              </>
            ) : (
              <button onClick={snapKick} className="px-3 py-2 sm:py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black">🎯 Ir ao momento-chave</button>
            )}
            <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-400">
              Velocidade
              {[1, 0.5, 0.25].map(v => (
                <button key={v} onClick={() => setSpeed(v)} className={'px-2 py-2 sm:py-1 rounded-lg border font-bold ' + (speed === v ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300')}>{v}x</button>
              ))}
            </span>
          </div>
          <div className="relative">
            <input type="range" min={0} max={1} step={0.005} value={t}
              onChange={e => { setPlaying(false); goTo(Number(e.target.value)); }}
              className="w-full h-7 sm:h-2 accent-emerald-500 cursor-pointer" />
            {!isOffside && <span className="absolute -top-1 w-0.5 h-4 bg-amber-400 pointer-events-none" style={{ left: 'calc(' + scene.tk * 100 + '% - 1px)' }} title="Lance-chave" />}
            {isOffside && marked !== null && <span className="absolute -top-1 w-0.5 h-4 bg-cyan-300 pointer-events-none" style={{ left: 'calc(' + marked * 100 + '% - 1px)' }} title="Toque marcado" />}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {scene.kind === 'OFFSIDE' && toolBtn('lines', '📏 Linhas 3D')}
            {scene.kind === 'OFFSIDE' && toolBtn('zone', '🟥 Faixa')}
            {scene.kind !== 'OFFSIDE' && toolBtn('lines', '🎯 Marcador de contato')}
            {toolBtn('points', '🦴 Pontos do corpo')}
            {toolBtn('labels', '🏷️ Nomes')}
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {CAMS.map((c, i) => (
            <button key={c.id} onClick={() => pickCam(i)}
              className={'relative shrink-0 w-[112px] sm:w-auto sm:flex-1 rounded-lg overflow-hidden border-2 transition ' + (cam === i ? 'border-emerald-400' : 'border-slate-700 hover:border-slate-500')}>
              <canvas ref={el => { thumbs.current[i] = el; }} width={224} height={126} className="w-full h-auto block bg-black" />
              <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[10px] font-bold py-0.5 text-slate-200">{c.short}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 text-xs">
          <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">Dados do lance</span>
          {off && (
            <>
              <Row label="Margem no frame do passe" value={traced ? (off.cm > 0 ? '+' : '') + off.cm.toFixed(1) + ' cm' : 'trace as linhas'} tone={!traced ? 'warn' : off.cm > 0 ? 'bad' : 'ok'} />
              <Row label="Ponto avançado • ataque" value={off.ap} />
              <Row label="Ponto avançado • defesa" value={off.dp} />
              <Row label="Frame do passe" value={marked !== null ? fmtT(marked) : 'NÃO MARCADO'} tone={marked !== null ? 'ok' : 'warn'} />
              <Row label="Pontos confirmados" value={pointsOk ? 'SIM' : 'NÃO'} tone={pointsOk ? 'ok' : 'warn'} />
              <Row label="Velocidade da bola" value={ballSpeed.toFixed(1) + ' m/s'} />
              <Row label="Distância pé–bola (passador)" value={(footDist * 100).toFixed(0) + ' cm'} />
            </>
          )}
          {scene.metrics.map(m => <Row key={m.label} label={m.label} value={m.value} tone={m.tone} />)}
        </div>
        {scene.kind === 'OFFSIDE' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed">
            <b className="text-slate-200">Como medir, em 3 passos:</b> (1) ande quadro a quadro até o instante em que o pé do passador toca a bola — a bola ganha velocidade e a distância pé–bola é mínima — e clique em 📍 para marcar o frame do passe. (2) Confira os pontos mais adiantados do atacante (amarelo) e do defensor (azul) e confirme. (3) Só então trace as linhas 3D: elas ficam fixadas nesse frame.
            Um momento errado muda a margem em dezenas de centímetros. Confira nas outras câmeras antes de decidir.
          </div>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'bad' | 'warn' }) => (
  <div className="flex justify-between gap-2 border-b border-slate-800/70 pb-1">
    <span className="text-slate-400">{label}</span>
    <span className={'font-bold text-right ' + (tone === 'bad' ? 'text-red-400' : tone === 'ok' ? 'text-emerald-400' : tone === 'warn' ? 'text-amber-300' : 'text-slate-100')}>{value}</span>
  </div>
);
