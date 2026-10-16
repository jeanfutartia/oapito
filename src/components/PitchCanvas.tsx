import { useEffect, useRef } from 'react';

interface PitchCanvasProps {
  isPlaying: boolean;
  isPausedForKmi: boolean;
  temperature?: number;
  homeColor?: string;
  awayColor?: string;
  homeRedCards?: number;
  awayRedCards?: number;
  speed?: number; // matchSpeed do store
  weather?: 'SOL' | 'CHUVA' | 'NOITE';
  fx?: { id: number; kind: 'GOAL' | 'SHOT' | 'FOUL' | 'YELLOW' | 'RED'; team?: 0 | 1 };
}

type Role = 'GK' | 'DF' | 'MF' | 'FW';
interface P {
  team: 0 | 1;
  role: Role;
  num: number;
  hx: number; // posição tática (0..1 a partir do próprio gol)
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}
interface Ball {
  x: number;
  y: number;
  owner: P | null;
  target: { x: number; y: number; to: P | null; shot: boolean } | null;
  hold: number;
  lastTeam: 0 | 1;
  forceGoal?: boolean;
  forceShot?: boolean;
}

const W = 840;
const H = 520;
const M = 28;
const PW = W - M * 2;
const PH = H - M * 2;
const MAX_SPEED: Record<Role, number> = { GK: 60, DF: 88, MF: 98, FW: 106 };
const FOLLOW: Record<Role, number> = { GK: 0.03, DF: 0.28, MF: 0.42, FW: 0.36 };

// 4-4-2: [papel, x, y]
const FORMATION: [Role, number, number][] = [
  ['GK', 0.04, 0.5],
  ['DF', 0.22, 0.12], ['DF', 0.2, 0.37], ['DF', 0.2, 0.63], ['DF', 0.22, 0.88],
  ['MF', 0.48, 0.14], ['MF', 0.44, 0.38], ['MF', 0.44, 0.62], ['MF', 0.48, 0.86],
  ['FW', 0.72, 0.36], ['FW', 0.72, 0.64]
];

const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);
const toX = (team: 0 | 1, nx: number) => (team === 0 ? M + nx * PW : W - M - nx * PW);
const dirOf = (team: 0 | 1) => (team === 0 ? 1 : -1);

function buildPlayers(): P[] {
  const list: P[] = [];
  ([0, 1] as const).forEach(team => {
    FORMATION.forEach(([role, nx, ny], i) => {
      const x = toX(team, nx);
      const y = M + ny * PH;
      list.push({ team, role, num: i + 1, hx: nx, hy: ny, x, y, vx: 0, vy: 0, active: true });
    });
  });
  return list;
}

function kickoff(ball: Ball, players: P[], team: 0 | 1) {
  players.forEach(p => {
    p.x = toX(p.team, p.hx * 0.9);
    p.y = M + p.hy * PH;
    p.vx = p.vy = 0;
  });
  const starter = players.filter(p => p.team === team && p.role === 'FW' && p.active)[0];
  ball.owner = starter ?? null;
  ball.target = null;
  ball.hold = 0.8;
  ball.lastTeam = team;
  if (starter) {
    starter.x = W / 2 - dirOf(team) * 6;
    starter.y = H / 2;
  }
  ball.x = W / 2;
  ball.y = H / 2;
}

const SKINS = ['#f1c9a5', '#d9a273', '#a9724a', '#7a4b2e', '#f6d7bf'];
const HAIRS = ['#1b1b1b', '#3b2a1a', '#6b4a2b', '#c9a24d', '#111111'];
const CROWD = ['#ef4444', '#f8fafc', '#3b82f6', '#facc15', '#22c55e', '#94a3b8', '#f97316'];
const hsh = (n: number) => Math.abs(Math.sin(n * 127.1) * 43758.5453) % 1;
const light = (hex: string) => {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(f, 16);
  return (((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) > 150;
};

export const PitchCanvas = ({
  isPlaying,
  isPausedForKmi,
  homeColor = '#dc2626',
  awayColor = '#f8fafc',
  homeRedCards = 0,
  awayRedCards = 0,
  speed = 1,
  weather = 'SOL',
  fx
}: PitchCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef({ isPlaying, isPausedForKmi, homeColor, awayColor, homeRedCards, awayRedCards, speed, weather, fx });
  propsRef.current = { isPlaying, isPausedForKmi, homeColor, awayColor, homeRedCards, awayRedCards, speed, weather, fx };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const players = buildPlayers();
    const ball: Ball = { x: W / 2, y: H / 2, owner: null, target: null, hold: 0, lastTeam: 0 };
    const ref = { x: W / 2 - 40, y: H / 2 + 40, vx: 0, vy: 0 };
    kickoff(ball, players, 0);

    // Efeitos sincronizados com o jogo (gols, finalizações, faltas, cartões)
    let lastFxId = propsRef.current.fx?.id ?? -1;
    let pauseUntil = 0;
    let fxState: { kind: string; t0: number; x: number; y: number } | null = null;
    const applyFx = (f: { id: number; kind: string; team?: 0 | 1 }, nowMs: number) => {
      const tm: 0 | 1 = f.team ?? 0;
      if (f.kind === 'GOAL' || f.kind === 'SHOT') {
        const field = players.filter(p => p.team === tm && p.active && p.role !== 'GK');
        const sc = field.filter(p => p.role === 'FW')[0] ?? field[0];
        if (sc) {
          sc.x = toX(tm, f.kind === 'GOAL' ? 0.8 : 0.72);
          sc.y = H / 2 + (Math.random() - 0.5) * 140;
          sc.vx = 0;
          sc.vy = 0;
          ball.owner = sc;
          ball.target = null;
          ball.hold = 0.15;
          ball.lastTeam = tm;
          ball.forceShot = true;
          ball.forceGoal = f.kind === 'GOAL';
        }
      } else {
        pauseUntil = nowMs + (f.kind === 'FOUL' ? 1100 : 1900);
      }
      fxState = { kind: f.kind, t0: nowMs, x: ball.x, y: ball.y };
    };

    let raf = 0;
    let last = performance.now();
    let clock = 0;

    const setActive = () => {
      const { homeRedCards: hr, awayRedCards: ar } = propsRef.current;
      ([0, 1] as const).forEach(team => {
        const outfield = players.filter(p => p.team === team && p.role !== 'GK');
        const reds = Math.min(team === 0 ? hr : ar, 4);
        outfield.forEach((p, i) => {
          p.active = i < outfield.length - reds;
        });
      });
    };

    const steer = (p: P, tx: number, ty: number, max: number, dt: number) => {
      const d = dist(p.x, p.y, tx, ty);
      const k = Math.min(1, d / 36);
      const dx = d > 0.001 ? ((tx - p.x) / d) * max * k : 0;
      const dy = d > 0.001 ? ((ty - p.y) / d) * max * k : 0;
      const a = Math.min(1, dt * 5);
      p.vx += (dx - p.vx) * a;
      p.vy += (dy - p.vy) * a;
    };

    const pickPass = (from: P): P | null => {
      const d = dirOf(from.team);
      let best: P | null = null;
      let bestScore = -1e9;
      players.forEach(q => {
        if (q === from || q.team !== from.team || !q.active) return;
        const dd = dist(from.x, from.y, q.x, q.y);
        if (dd < 50 || dd > 320) return;
        const progress = (q.x - from.x) * d;
        const nearestOpp = Math.min(
          ...players.filter(o => o.team !== from.team && o.active).map(o => dist(o.x, o.y, q.x, q.y))
        );
        const score = progress * 0.6 + nearestOpp * 0.9 - dd * 0.25 + Math.random() * 45;
        if (score > bestScore) {
          bestScore = score;
          best = q;
        }
      });
      return best;
    };

    const step = (dt: number) => {
      setActive();
      const poss: 0 | 1 = ball.owner ? ball.owner.team : ball.lastTeam;

      // Quem pressiona: os 2 marcadores de linha mais próximos da bola
      const chasers = new Set<P>();
      players
        .filter(p => p.active && p.role !== 'GK' && (p.team !== poss || !ball.owner))
        .sort((a, b) => dist(a.x, a.y, ball.x, ball.y) - dist(b.x, b.y, ball.x, ball.y))
        .slice(0, 2)
        .forEach(p => chasers.add(p));

      players.forEach(p => {
        if (!p.active) return;
        const d = dirOf(p.team);
        let tx: number;
        let ty: number;
        let max = MAX_SPEED[p.role];

        if (ball.owner === p) {
          // condutor: avança em direção ao gol, desviando de marcadores
          const goalX = p.team === 0 ? W - M : M;
          const threat = players
            .filter(o => o.team !== p.team && o.active && dist(o.x, o.y, p.x, p.y) < 55)
            .sort((a, b) => dist(a.x, a.y, p.x, p.y) - dist(b.x, b.y, p.x, p.y))[0];
          tx = p.x + d * 80;
          ty = p.y + (H / 2 - p.y) * 0.25 + (threat ? (p.y > threat.y ? 40 : -40) : 0);
          tx = Math.max(M, Math.min(W - M, tx));
          ty = Math.max(M + 10, Math.min(H - M - 10, ty));
          max *= 0.9;
          if (Math.abs(goalX - p.x) < 8) max = 0;
        } else if (ball.target?.to === p || chasers.has(p) || (ball.owner === null && !ball.target && p.role !== 'GK')) {
          tx = ball.target ? ball.target.x : ball.x;
          ty = ball.target ? ball.target.y : ball.y;
          if (chasers.has(p)) max *= 1.05;
        } else {
          // posição tática: bloco desliza com a bola; time com a posse sobe
          const push = p.team === poss ? d * 55 * (p.role === 'GK' ? 0 : 1) : -d * 15;
          const baseX = toX(p.team, p.hx);
          tx = baseX + (ball.x - baseX) * FOLLOW[p.role] + push;
          ty = M + p.hy * PH + (ball.y - (M + p.hy * PH)) * 0.22;
          if (p.role === 'GK') tx = toX(p.team, p.hx);
        }
        steer(p, tx, ty, max, dt);
      });

      // separação para ninguém se sobrepor
      for (let i = 0; i < players.length; i++) {
        const a = players[i];
        if (!a.active) continue;
        for (let j = i + 1; j < players.length; j++) {
          const b = players[j];
          if (!b.active) continue;
          const dd = dist(a.x, a.y, b.x, b.y);
          if (dd > 0 && dd < 18) {
            const push = (18 - dd) * 0.5;
            const nx = (a.x - b.x) / dd;
            const ny = (a.y - b.y) / dd;
            a.x += nx * push;
            a.y += ny * push;
            b.x -= nx * push;
            b.y -= ny * push;
          }
        }
      }
      players.forEach(p => {
        if (!p.active) return;
        p.x = Math.max(M - 6, Math.min(W - M + 6, p.x + p.vx * dt));
        p.y = Math.max(M - 6, Math.min(H - M + 6, p.y + p.vy * dt));
      });

      // bola
      if (ball.owner) {
        const o = ball.owner;
        const sp = Math.hypot(o.vx, o.vy) || 1;
        const bx = o.x + (o.vx / sp) * 11;
        const by = o.y + (o.vy / sp) * 11 + 2;
        ball.x += (bx - ball.x) * Math.min(1, dt * 14);
        ball.y += (by - ball.y) * Math.min(1, dt * 14);
        ball.lastTeam = o.team;
        ball.hold -= dt;

        // desarme
        const tackler = players.find(
          q => q.team !== o.team && q.active && dist(q.x, q.y, ball.x, ball.y) < 13
        );
        if (tackler && Math.random() < dt * 0.9) {
          ball.owner = tackler;
          ball.hold = 0.6 + Math.random() * 0.5;
          return;
        }

        if (ball.hold <= 0) {
          const goalX = o.team === 0 ? W - M : M;
          const nearGoal = Math.abs(goalX - o.x) < 190;
          if (ball.forceShot || (nearGoal && o.role !== 'GK' && Math.random() < 0.55)) {
            ball.forceShot = false;
            ball.target = { x: goalX, y: H / 2 + (Math.random() - 0.5) * 70, to: null, shot: true };
            ball.owner = null;
          } else {
            const q = pickPass(o);
            if (q) {
              ball.target = { x: q.x + q.vx * 0.5, y: q.y + q.vy * 0.5, to: q, shot: false };
              ball.owner = null;
            } else {
              ball.hold = 0.5;
            }
          }
        }
      } else if (ball.target) {
        const t = ball.target;
        if (t.to) {
          t.x = t.to.x + t.to.vx * 0.3;
          t.y = t.to.y + t.to.vy * 0.3;
        }
        const sp = t.shot ? 520 : 330;
        const d = dist(ball.x, ball.y, t.x, t.y);
        const mv = sp * dt;
        if (d <= mv) {
          ball.x = t.x;
          ball.y = t.y;
          if (t.shot) {
            const defTeam: 0 | 1 = ball.lastTeam === 0 ? 1 : 0;
            if (ball.forceGoal) {
              ball.forceGoal = false;
              kickoff(ball, players, defTeam); // gol: recomeço
            } else {
              ball.owner = players.find(p => p.team === defTeam && p.role === 'GK') ?? null;
              ball.target = null;
              ball.hold = 1.2;
            }
          } else {
            ball.owner = t.to;
            ball.target = null;
            ball.hold = 0.5 + Math.random() * 0.9;
          }
        } else {
          ball.x += ((t.x - ball.x) / d) * mv;
          ball.y += ((t.y - ball.y) / d) * mv;
          // interceptação
          const thief = players.find(
            q => q.active && q.team !== ball.lastTeam && dist(q.x, q.y, ball.x, ball.y) < 11
          );
          if (thief && Math.random() < 0.06) {
            ball.owner = thief;
            ball.target = null;
            ball.hold = 0.5;
          }
        }
      }

      // árbitro: fica na diagonal, fora da linha de passe
      const side = ball.y < H / 2 ? 1 : -1;
      const rx = ball.x - dirOf(ball.owner?.team ?? ball.lastTeam) * 38;
      const ry = ball.y + side * 34;
      steer(ref as unknown as P, rx, Math.max(M, Math.min(H - M, ry)), 82, dt);
      ref.x += ref.vx * dt;
      ref.y += ref.vy * dt;
    };

    const drawPitch = () => {
      const stripes = 14;
      for (let i = 0; i < stripes; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#1b6f40' : '#22854f';
        ctx.fillRect((W / stripes) * i, 0, W / stripes + 1, H);
      }
      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.65);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.38)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      // arquibancadas ao redor do gramado
      const bands: [number, number, number, number][] = [[0, 0, W, M - 6], [0, H - M + 6, W, M - 6], [0, 0, M - 6, H], [W - M + 6, 0, M - 6, H]];
      bands.forEach(([bx, by, bw, bh], k) => {
        ctx.fillStyle = '#0b1220';
        ctx.fillRect(bx, by, bw, bh);
        const n = Math.floor((bw * bh) / 34);
        for (let i = 0; i < n; i++) {
          ctx.fillStyle = CROWD[Math.floor(hsh(i * 1.3 + k) * CROWD.length)];
          ctx.fillRect(bx + hsh(i + k * 1000) * bw, by + hsh(i * 3.7 + k * 77) * bh, 2.2, 2.2);
        }
      });

      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 2;
      ctx.strokeRect(M, M, PW, PH);
      ctx.beginPath();
      ctx.moveTo(W / 2, M);
      ctx.lineTo(W / 2, H - M);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 56, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      ([0, 1] as const).forEach(team => {
        const s = team === 0 ? 1 : -1;
        const gx = team === 0 ? M : W - M;
        ctx.strokeRect(team === 0 ? gx : gx - 123, H / 2 - 150, 123, 300);
        ctx.strokeRect(team === 0 ? gx : gx - 41, H / 2 - 68, 41, 136);
        ctx.beginPath();
        ctx.arc(gx + s * 82, H / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(gx + s * 82, H / 2, 68, team === 0 ? -0.93 : Math.PI - 0.93, team === 0 ? 0.93 : Math.PI + 0.93);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.strokeRect(team === 0 ? gx - 14 : gx, H / 2 - 34, 14, 68);
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      });
    };

    let fs = 1;
    interface Fig {
      kit: string; shorts: string; socks: string; skin: string; hair: string; face: number; phase: number;
      moving: number; num?: number; numColor?: string; ring?: boolean;
    }
    // Jogador "em pé" com ciclo de corrida (pernas e braços balançam) e escala de perspectiva
    const drawFigure = (x: number, y: number, o: Fig) => {
      const s = (0.78 + (y / H) * 0.4) * fs;
      const sw = Math.sin(o.phase) * 6 * o.moving;
      const lift = Math.abs(Math.cos(o.phase)) * 1.4 * o.moving;
      const f = o.face;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath();
      ctx.ellipse(0, 1, 10, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      if (o.ring) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 1, 14, 5.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.lineCap = 'round';
      // pernas + chuteiras
      ctx.strokeStyle = o.socks;
      ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.moveTo(-2, -10); ctx.lineTo(-2 + sw * f, -1 - lift); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(2, -10); ctx.lineTo(2 - sw * f, -1); ctx.stroke();
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(-2 + sw * f - 2 + (f > 0 ? 1 : -1), -2.5 - lift, 4.5, 2.5);
      ctx.fillRect(2 - sw * f - 2 + (f > 0 ? 1 : -1), -2.5, 4.5, 2.5);
      // braços
      ctx.strokeStyle = o.skin;
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(-5, -19.5); ctx.lineTo(-6 - sw * 0.5 * f, -12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(5, -19.5); ctx.lineTo(6 + sw * 0.5 * f, -12); ctx.stroke();
      // calção e camisa
      ctx.fillStyle = o.shorts;
      ctx.fillRect(-4.8, -13, 9.6, 5);
      ctx.fillStyle = o.kit;
      ctx.fillRect(-5.2, -21, 10.4, 9);
      ctx.strokeStyle = 'rgba(15,23,42,0.7)';
      ctx.lineWidth = 0.9;
      ctx.strokeRect(-5.2, -21, 10.4, 9);
      if (o.num !== undefined) {
        ctx.fillStyle = o.numColor ?? '#fff';
        ctx.font = 'bold 6.5px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(o.num), 0, -16);
      }
      // cabeça + cabelo
      ctx.fillStyle = o.skin;
      ctx.beginPath(); ctx.arc(0, -25, 4.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = o.hair;
      ctx.beginPath(); ctx.arc(0, -25.6, 4.4, Math.PI, 0); ctx.fill();
      ctx.restore();
    };

    const drawPlayer = (p: P, color: string, isOwner: boolean) => {
      const gk = p.role === 'GK';
      const kit = gk ? '#22d3ee' : color;
      const bright = light(kit);
      drawFigure(p.x, p.y, {
        kit,
        shorts: gk ? '#0f172a' : bright ? '#111827' : '#f8fafc',
        socks: gk ? '#0f172a' : kit,
        skin: SKINS[(p.num * 3 + p.team * 2) % SKINS.length],
        hair: HAIRS[(p.num + p.team * 3) % HAIRS.length],
        num: p.num,
        numColor: bright ? '#0f172a' : '#ffffff',
        face: Math.abs(p.vx) > 6 ? Math.sign(p.vx) : dirOf(p.team),
        phase: (p.x + p.y * 0.5) / 5.5,
        moving: Math.min(1, Math.hypot(p.vx, p.vy) / 70),
        ring: isOwner
      });
    };

    const render = (now: number) => {
      const pr = propsRef.current;
      fs = Math.max(1, Math.min(2, 720 / (canvas.clientWidth || W)));
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (pr.fx && pr.fx.id !== lastFxId) {
        lastFxId = pr.fx.id;
        applyFx(pr.fx, now);
      }
      const running = pr.isPlaying && !pr.isPausedForKmi && now >= pauseUntil;
      if (running) {
        const sim = dt * Math.max(1, pr.speed);
        clock += sim;
        step(sim);
      }

      ctx.clearRect(0, 0, W, H);
      drawPitch();

      // linha de visão do árbitro
      ctx.strokeStyle = pr.isPausedForKmi ? 'rgba(239,68,68,0.9)' : 'rgba(250,204,21,0.28)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ref.x, ref.y);
      ctx.lineTo(ball.x, ball.y);
      ctx.stroke();
      ctx.setLineDash([]);

      [...players]
        .filter(p => p.active)
        .sort((a, b) => a.y - b.y)
        .forEach(p => drawPlayer(p, p.team === 0 ? pr.homeColor : pr.awayColor, ball.owner === p));

      // árbitro (camisa amarela, calção preto)
      drawFigure(ref.x, ref.y, {
        kit: '#facc15', shorts: '#111827', socks: '#111827', skin: SKINS[1], hair: '#222222',
        face: ball.x >= ref.x ? 1 : -1, phase: (ref.x + ref.y * 0.5) / 5.5,
        moving: Math.min(1, Math.hypot(ref.vx, ref.vy) / 70)
      });

      // bola (com altura nos passes)
      const flying = !ball.owner && ball.target;
      const lift = flying ? Math.sin(clock * 14) * 0 + 4 : 0;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(ball.x, ball.y + 4, 5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y - lift, 5 * Math.min(1.7, fs), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // pausa para lance capital: anel pulsante
      if (pr.isPausedForKmi) {
        const pulse = 14 + Math.sin(now / 160) * 4;
        ctx.strokeStyle = 'rgba(239,68,68,0.9)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // clima
      if (pr.weather === 'CHUVA') {
        ctx.fillStyle = 'rgba(8,24,48,0.16)';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(200,220,255,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 110; i++) {
          const rx = ((hsh(i * 1.7) * (W + 80) + now * 0.12) % (W + 80)) - 40;
          const ry = (hsh(i * 2.9) * H + now * 0.75) % H;
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 5, ry + 13);
        }
        ctx.stroke();
      } else if (pr.weather === 'NOITE') {
        const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, W * 0.62);
        g.addColorStop(0, 'rgba(0,0,30,0)');
        g.addColorStop(1, 'rgba(0,0,30,0.45)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      // efeitos de evento: apito, cartão levantado, flash de gol
      if (fxState) {
        const age = now - fxState.t0;
        if (fxState.kind === 'FOUL' && age < 1100) {
          const k = age / 1100;
          ctx.strokeStyle = 'rgba(250,250,250,' + (1 - k) * 0.9 + ')';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(fxState.x, fxState.y, 12 + k * 46, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,' + (1 - k) + ')';
          ctx.font = 'bold 13px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('APITO!', ref.x, ref.y - 26 - k * 10);
        } else if ((fxState.kind === 'YELLOW' || fxState.kind === 'RED') && age < 1900) {
          const rise = Math.min(1, age / 250);
          ctx.globalAlpha = Math.max(0, age > 1500 ? 1 - (age - 1500) / 400 : 1);
          ctx.fillStyle = fxState.kind === 'RED' ? '#dc2626' : '#facc15';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          const cy = ref.y - 30 - rise * 24;
          ctx.fillRect(ref.x + 8, cy - 22, 15, 22);
          ctx.strokeRect(ref.x + 8, cy - 22, 15, 22);
          ctx.globalAlpha = 1;
        } else if (fxState.kind === 'GOAL' && age < 700) {
          ctx.fillStyle = 'rgba(255,255,255,' + 0.3 * (1 - age / 700) + ')';
          ctx.fillRect(0, 0, W, H);
        }
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-black">
      <canvas ref={canvasRef} className="w-full h-auto block" style={{ aspectRatio: `${W} / ${H}` }} />
    </div>
  );
};
