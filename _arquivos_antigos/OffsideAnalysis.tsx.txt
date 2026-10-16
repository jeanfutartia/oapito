import { useEffect, useState } from 'react';
import type { Incident, Team } from '../types/types';
import { PlayerFigure } from './PlayerFigure';

interface Props {
  incident: Incident;
  homeTeam: Team;
  awayTeam: Team;
}

type OffAngle = 'LINES' | 'BROADCAST' | 'BODY' | 'KICK';

const OFF_ANGLES: { id: OffAngle; label: string; cam: string }[] = [
  { id: 'LINES', label: 'Linhas (Aérea)', cam: 'CAM 01 • SKYCAM SEMI-AUTOMÁTICA' },
  { id: 'BROADCAST', label: 'Broadcast 3D', cam: 'CAM 02 • TV VIRTUAL 3D' },
  { id: 'BODY', label: 'Pontos do Corpo', cam: 'CAM 03 • TRACKING DE MEMBROS' },
  { id: 'KICK', label: 'Ponto do Passe', cam: 'CAM 04 • LATERAL 1000 FPS' }
];

const DEF_X = 84;
const gx = (x: number) => (x - 58) * 16;
const gy = (y: number) => 165 + (y - 34) * 16;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const pb = (x: number, y: number) => {
  const u = (x - 58) / 46;
  const v = (y - 23.7) / 20.6;
  const taper = 0.78 + 0.22 * v;
  return { sx: 370 + (u - 0.5) * 740 * taper, sy: 55 + v * 240, k: 0.8 + 0.45 * v };
};

export const OffsideAnalysis = ({ incident, homeTeam, awayTeam }: Props) => {
  const o = incident.offside;
  const [angle, setAngle] = useState<OffAngle>('LINES');
  const [frame, setFrame] = useState(() => Math.max(0, (incident.offside?.kickFrame ?? 50) - 16));
  const [locked, setLocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.5);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setFrame(f => Math.min(100, f + speed * 2)), 40);
    return () => clearInterval(id);
  }, [playing, speed]);

  useEffect(() => {
    if (playing && frame >= 100) setPlaying(false);
  }, [playing, frame]);

  if (!o) return null;

  const attTeam = incident.attackingTeam === 'HOME' ? homeTeam : awayTeam;
  const defTeam = incident.attackingTeam === 'HOME' ? awayTeam : homeTeam;
  const attColor = attTeam.primaryColor;
  const defColor = defTeam.primaryColor;

  const f = Math.round(frame);
  const delta = o.deltaCmAtKick + (f - o.kickFrame) * o.closingCmPerFrame;
  const isOffside = delta > 0;
  const diff = f - o.kickFrame;
  const ballLeft = diff >= 0;
  const tb = ballLeft ? diff / (100 - o.kickFrame) : 0;
  const ballX = 62.4 + (97 - 62.4) * tb;
  const ballY = 38.2 + (31 - 38.2) * tb;
  const attX = DEF_X + delta / 100;
  const phase = f * 0.35;
  const cam = OFF_ANGLES.find(a => a.id === angle)?.cam ?? '';
  const deltaTxt = `${delta > 0 ? '+' : ''}${delta.toFixed(1)} cm`;

  const kickState =
    diff < 0
      ? { t: `Bola no pé (faltam ${-diff} fr)`, c: 'text-emerald-300' }
      : diff === 0
        ? { t: '⚡ FRAME DO TOQUE', c: 'text-amber-300' }
        : { t: `Bola solta (+${diff} fr)`, c: 'text-red-300' };

  const dot = (key: string, x: number, y: number, color: string, num: number) => (
    <g key={key}>
      <circle cx={gx(x)} cy={gy(y)} r={8} fill={color} stroke="#fff" strokeWidth={1.5} />
      <text x={gx(x)} y={gy(y) + 3.5} textAnchor="middle" fontSize={9} fontWeight={800} fill="#fff">{num}</text>
    </g>
  );

  const stripeRects = Array.from({ length: 9 }, (_, i) => (
    <rect key={i} x={i * 88} y={0} width={88} height={330} fill={i % 2 === 0 ? '#0b3a1e' : '#0e4724'} />
  ));

  const renderLines = () => {
    const lupaOff = clamp(delta * 3, -90, 90);
    return (
      <svg viewBox="0 0 740 330" className="w-full h-[330px]">
        {stripeRects}
        <line x1={gx(88.5)} y1={0} x2={gx(88.5)} y2={330} stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
        <line x1={gx(99.5)} y1={0} x2={gx(99.5)} y2={330} stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
        {locked && (
          <g>
            <polygon points={`${gx(DEF_X)},0 ${gx(attX)},0 ${gx(attX)},330 ${gx(DEF_X)},330`} fill={isOffside ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.3)'} />
            <line x1={gx(DEF_X)} y1={0} x2={gx(DEF_X)} y2={330} stroke="#38bdf8" strokeWidth={2.5} />
            <line x1={gx(attX)} y1={0} x2={gx(attX)} y2={330} stroke="#ef4444" strokeWidth={2.5} strokeDasharray="6 3" />
            <text x={gx(DEF_X) - 6} y={322} textAnchor="end" fontSize={10} fontWeight={700} fill="#38bdf8">LINHA DEFENSOR</text>
            <text x={gx(DEF_X) + 6} y={14} fontSize={10} fontWeight={700} fill="#fca5a5">LINHA ATACANTE</text>
          </g>
        )}
        {ballLeft && <line x1={gx(62.4)} y1={gy(38.2)} x2={gx(ballX)} y2={gy(ballY)} stroke="rgba(250,204,21,0.7)" strokeWidth={2} strokeDasharray="4 4" />}
        {dot('passer', 62, 38, attColor, o.passerNumber)}
        {dot('o1', 80, 25, defColor, 2)}
        {dot('o2', 81.5, 42, defColor, 5)}
        {dot('o3', 77, 35, defColor, 6)}
        {dot('a11', 79, 44, attColor, 11)}
        {dot('def', DEF_X - 0.4, 29, defColor, o.defenderNumber)}
        {dot('att', attX - 0.4, 31.5, attColor, o.attackerNumber)}
        {dot('gk', 103.5, 34, '#16a34a', 1)}
        <circle cx={gx(ballX)} cy={gy(ballY)} r={4.5} fill="#fff" stroke="#111" strokeWidth={1.5} />
        {Math.abs(diff) <= 1 && <circle cx={gx(ballX)} cy={gy(ballY)} r={14} fill="none" stroke="#facc15" strokeWidth={2} strokeDasharray="3 3" />}

        <g transform="translate(515 8)">
          <rect width={218} height={128} rx={8} fill="rgba(2,6,23,0.95)" stroke="#38bdf8" strokeWidth={1.5} />
          <text x={10} y={16} fontSize={10} fontWeight={800} fill="#38bdf8">LUPA 8x • PONTO DO PASSE</text>
          {locked ? (
            <g>
              <line x1={109} y1={26} x2={109} y2={104} stroke="#38bdf8" strokeWidth={2} />
              <line x1={109 + lupaOff} y1={26} x2={109 + lupaOff} y2={104} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" />
              <ellipse cx={109 - 16} cy={88} rx={16} ry={6} fill={defColor} stroke="#fff" />
              <ellipse cx={109 + lupaOff - 16} cy={52} rx={16} ry={6} fill={attColor} stroke="#fff" />
              <text x={10} y={120} fontSize={11} fontWeight={800} fill={isOffside ? '#f87171' : '#4ade80'}>Δ {deltaTxt}</text>
              <text x={208} y={120} textAnchor="end" fontSize={9} fill="#94a3b8">{isOffside ? 'IMPEDIDO' : 'REGULAR'}</text>
            </g>
          ) : (
            <text x={109} y={70} textAnchor="middle" fontSize={10} fill="#94a3b8">Trace as linhas para medir</text>
          )}
        </g>
      </svg>
    );
  };

  const renderBroadcast = () => {
    const stripes = Array.from({ length: 9 }, (_, i) => {
      const x0 = 58 + i * 5.5;
      const pts = [
        [x0, 23.7],
        [x0 + 5.5, 23.7],
        [x0 + 5.5, 44.3],
        [x0, 44.3]
      ]
        .map(([x, y]) => `${pb(x, y).sx},${pb(x, y).sy}`)
        .join(' ');
      return <polygon key={i} points={pts} fill={i % 2 === 0 ? '#14532d' : '#1a6a35'} />;
    });
    const quad = (xa: number, xb: number) =>
      [
        [xa, 23.7],
        [xb, 23.7],
        [xb, 44.3],
        [xa, 44.3]
      ]
        .map(([x, y]) => `${pb(x, y).sx},${pb(x, y).sy}`)
        .join(' ');
    const actors = [
      { id: 'passer', x: 62, y: 38, n: o.passerNumber, c: attColor, dir: 1 as const },
      { id: 'o1', x: 80, y: 25, n: 2, c: defColor, dir: -1 as const },
      { id: 'o2', x: 81.5, y: 42, n: 5, c: defColor, dir: -1 as const },
      { id: 'def', x: DEF_X - 0.4, y: 29, n: o.defenderNumber, c: defColor, dir: -1 as const },
      { id: 'att', x: attX - 0.4, y: 31.5, n: o.attackerNumber, c: attColor, dir: 1 as const }
    ]
      .map(a => ({ ...a, ...pb(a.x, a.y) }))
      .sort((a, b) => a.sy - b.sy);
    const dl = pb(DEF_X, 23.7);
    const dl2 = pb(DEF_X, 44.3);
    const al = pb(attX, 23.7);
    const al2 = pb(attX, 44.3);
    const bp = pb(ballX, ballY);
    return (
      <svg viewBox="0 0 740 330" className="w-full h-[330px]">
        <rect width={740} height={330} fill="#0b1220" />
        {stripes}
        {locked && <polygon points={quad(DEF_X, attX)} fill={isOffside ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.35)'} />}
        {locked && (
          <g>
            <line x1={dl.sx} y1={dl.sy} x2={dl2.sx} y2={dl2.sy} stroke="#38bdf8" strokeWidth={3} />
            <line x1={al.sx} y1={al.sy} x2={al2.sx} y2={al2.sy} stroke="#ef4444" strokeWidth={3} strokeDasharray="6 3" />
          </g>
        )}
        {actors.map(a => (
          <PlayerFigure key={a.id} sx={a.sx} sy={a.sy} h={78 * a.k} color={a.c} number={a.n} dir={a.dir} phase={phase + a.n} highlight={locked && (a.id === 'att' || a.id === 'def')} />
        ))}
        <circle cx={bp.sx} cy={bp.sy - 8} r={5} fill="#fff" stroke="#111" strokeWidth={1.5} />
        {locked && (
          <g transform="translate(250 6)">
            <rect width={240} height={34} rx={6} fill="rgba(2,6,23,0.92)" stroke={isOffside ? '#ef4444' : '#22c55e'} strokeWidth={2} />
            <text x={120} y={22} textAnchor="middle" fontSize={15} fontWeight={900} fill={isOffside ? '#f87171' : '#4ade80'}>
              {isOffside ? 'IMPEDIMENTO' : 'POSIÇÃO REGULAR'} • {deltaTxt}
            </text>
          </g>
        )}
      </svg>
    );
  };

  const renderBody = () => {
    const pxCm = 200 / Math.max(40, Math.abs(delta) + 30);
    const x0 = 340;
    const xa = clamp(x0 + delta * pxCm, 80, 700);
    const bestAtt = Math.max(...o.attackerParts.filter(p => p.legal).map(p => p.offsetCm));
    return (
      <svg viewBox="0 0 740 330" className="w-full h-[330px]">
        <rect width={740} height={330} fill="#0f172a" />
        <PlayerFigure sx={48} sy={140} h={100} color={defColor} number={o.defenderNumber} />
        <PlayerFigure sx={48} sy={262} h={100} color={attColor} number={o.attackerNumber} />
        <text x={90} y={30} fontSize={11} fontWeight={800} fill="#38bdf8">DEFENSOR #{o.defenderNumber} — último ponto jogável</text>
        <text x={90} y={170} fontSize={11} fontWeight={800} fill="#fca5a5">ATACANTE #{o.attackerNumber} — ponto mais avançado legal</text>
        <line x1={x0} y1={20} x2={x0} y2={290} stroke="#38bdf8" strokeWidth={2.5} />
        <line x1={xa} y1={20} x2={xa} y2={290} stroke="#ef4444" strokeWidth={2.5} strokeDasharray="6 3" />
        {o.defenderParts.map((p, i) => {
          const x = x0 + p.offsetCm * pxCm;
          return (
            <g key={p.name}>
              <circle cx={x} cy={95} r={7} fill="#38bdf8" stroke="#fff" strokeWidth={1.5} />
              <text x={x} y={i % 2 === 0 ? 78 : 119} textAnchor="middle" fontSize={9} fill="#bae6fd">{p.name}</text>
            </g>
          );
        })}
        {o.attackerParts.map((p, i) => {
          const x = xa + (p.offsetCm - bestAtt) * pxCm;
          const best = p.legal && p.offsetCm === bestAtt;
          return (
            <g key={p.name}>
              <circle cx={x} cy={215} r={best ? 9 : 7} fill={p.legal ? (best ? '#ef4444' : '#f97316') : '#475569'} stroke="#fff" strokeWidth={1.5} />
              <text x={x} y={i % 2 === 0 ? 195 : 241} textAnchor="middle" fontSize={9} fill={p.legal ? '#fed7aa' : '#94a3b8'}>
                {p.name}{!p.legal ? ' (não conta)' : ''}
              </text>
            </g>
          );
        })}
        {locked && (
          <g>
            <line x1={x0} y1={308} x2={xa} y2={308} stroke={isOffside ? '#ef4444' : '#22c55e'} strokeWidth={4} />
            <text x={(x0 + xa) / 2} y={324} textAnchor="middle" fontSize={13} fontWeight={900} fill={isOffside ? '#f87171' : '#4ade80'}>Δ {deltaTxt}</text>
          </g>
        )}
      </svg>
    );
  };

  const renderKick = () => {
    const ksx = 230;
    const ksy = 300;
    const bX = ballLeft ? ksx + 70 + diff * 11 : ksx + 70;
    const bY = ballLeft ? ksy - 16 - Math.min(diff * 1.4, 40) : ksy - 16;
    return (
      <svg viewBox="0 0 740 330" className="w-full h-[330px]">
        <rect width={740} height={330} fill="#0a2e19" />
        <rect y={300} width={740} height={30} fill="#14532d" />
        <line x1={0} y1={300} x2={740} y2={300} stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
        <PlayerFigure sx={ksx} sy={ksy} h={250} color={attColor} number={o.passerNumber} label="PASSADOR" phase={phase} />
        <circle cx={bX} cy={bY} r={14} fill="#fff" stroke="#111" strokeWidth={2} />
        {diff === 0 && <circle cx={bX} cy={bY} r={26} fill="none" stroke="#facc15" strokeWidth={3} strokeDasharray="5 4" className="animate-pulse" />}
        <text x={720} y={30} textAnchor="end" fontSize={14} fontWeight={900} fill={diff < 0 ? '#6ee7b7' : diff === 0 ? '#fcd34d' : '#fca5a5'}>
          {kickState.t}
        </text>
        <text x={720} y={50} textAnchor="end" fontSize={10} fill="#94a3b8">Ache o primeiro frame em que a bola deixa o pé</text>
      </svg>
    );
  };

  return (
    <div className="w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col select-none font-mono">
      <div className="flex flex-wrap justify-between items-center text-xs bg-slate-950/90 p-2.5 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[10px] tracking-wider">{cam}</span>
          <span className="text-emerald-400 font-bold">Frame {f}</span>
        </div>
        <span className={`font-bold text-[11px] ${kickState.c}`}>{kickState.t}</span>
        <span className="text-[11px] text-slate-400">
          ATAQUE: <strong className="text-red-300">{attTeam.shortName}</strong> • DEFESA: <strong className="text-blue-300">{defTeam.shortName}</strong>
        </span>
      </div>

      {angle === 'LINES' && renderLines()}
      {angle === 'BROADCAST' && renderBroadcast()}
      {angle === 'BODY' && renderBody()}
      {angle === 'KICK' && renderKick()}

      <div className="bg-slate-900/95 border-t border-slate-800 p-3 flex flex-col gap-2 text-xs">
        <div className="flex flex-wrap gap-1.5">
          {OFF_ANGLES.map(a => (
            <button
              key={a.id}
              onClick={() => setAngle(a.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                angle === a.id ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { if (frame >= 100) setFrame(0); setPlaying(p => !p); }} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded font-bold">
            {playing ? '⏸' : '▶'}
          </button>
          <button onClick={() => { setPlaying(false); setFrame(v => Math.max(0, Math.round(v) - 1)); }} className="px-2 py-1 bg-slate-800 rounded font-bold border border-slate-700">◀ -1 fr</button>
          <button onClick={() => { setPlaying(false); setFrame(v => Math.min(100, Math.round(v) + 1)); }} className="px-2 py-1 bg-slate-800 rounded font-bold border border-slate-700">+1 fr ▶</button>
          {[0.25, 0.5, 1].map(s => (
            <button key={s} onClick={() => setSpeed(s)} className={`px-2 py-1 rounded font-bold border ${speed === s ? 'bg-amber-500 text-black border-amber-300' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              {s}x
            </button>
          ))}
          <button onClick={() => { setPlaying(false); setFrame(o.kickFrame); }} className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 rounded font-bold">🎯 Sincronizar toque (auto)</button>
          <button
            onClick={() => setLocked(l => !l)}
            className={`px-3 py-1 rounded font-bold ${locked ? 'bg-emerald-700 text-white' : 'bg-amber-500 text-black'}`}
          >
            {locked ? '✓ Linhas traçadas (limpar)' : '📐 Traçar linhas'}
          </button>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={f}
          onChange={e => { setPlaying(false); setFrame(Number(e.target.value)); }}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />

        {locked ? (
          <div className={`p-2.5 rounded-lg border text-[11px] font-bold ${isOffside ? 'bg-red-950/70 border-red-700 text-red-200' : 'bg-emerald-950/70 border-emerald-700 text-emerald-200'}`}>
            {isOffside ? `IMPEDIMENTO: atacante ${deltaTxt} à frente da linha.` : `POSIÇÃO REGULAR: atacante ${deltaTxt} em relação à linha.`}
            {diff !== 0 && (
              <span className="block text-amber-300 mt-1">
                ⚠ Frame {f} difere do toque detectado ({o.kickFrame}). O resultado muda a cada frame; confirme o ponto do passe.
              </span>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400">
            1) Ache o frame do passe • 2) Trace as linhas • 3) Decida. Mão e braço não contam; ombro, joelho e pé contam.
          </div>
        )}
      </div>
    </div>
  );
};
