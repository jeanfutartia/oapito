import { useEffect, useState } from 'react';
import type { CameraAngleId, Incident, ScenePlayer, Team } from '../types/types';
import { PlayerFigure } from './PlayerFigure';

interface Props {
  incident: Incident;
  homeTeam: Team;
  awayTeam: Team;
}

const ANGLES: { id: CameraAngleId; label: string; cam: string }[] = [
  { id: 'MASTER', label: 'Master Lateral', cam: 'CAM 01 • MASTER WIDE' },
  { id: 'TACTICAL', label: 'Tática Aérea', cam: 'CAM 02 • SKYCAM 2D' },
  { id: 'BEHIND_GOAL', label: 'Atrás do Gol', cam: 'CAM 03 • BEHIND GOAL' },
  { id: 'REVERSE', label: 'Reversa', cam: 'CAM 05 • REVERSA' },
  { id: 'CLOSEUP', label: 'Lupa Slow-Mo', cam: 'CAM 07 • ULTRA SLOW-MO 1000 FPS' }
];

const FIELD_LINES: [number, number, number, number][] = [
  [105, 0, 105, 68],
  [88.5, 13.84, 88.5, 54.16],
  [88.5, 13.84, 105, 13.84],
  [88.5, 54.16, 105, 54.16],
  [99.5, 24.84, 99.5, 43.16],
  [99.5, 24.84, 105, 24.84],
  [99.5, 43.16, 105, 43.16],
  [52.5, 0, 52.5, 68],
  [0, 0, 105, 0],
  [0, 68, 105, 68]
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function project(angle: CameraAngleId, x: number, y: number, fx: number, fy: number) {
  switch (angle) {
    case 'MASTER':
      return { sx: 380 + (x - fx) * 34, sy: 235 + (y - fy) * 7, k: 34 * (1 + (y - fy) * 0.012) };
    case 'REVERSE':
      return { sx: 380 - (x - fx) * 34, sy: 215 - (y - fy) * 7, k: 34 * (1 - (y - fy) * 0.012) };
    case 'CLOSEUP':
      return { sx: 380 + (x - fx) * 80, sy: 275 + (y - fy) * 16, k: 80 };
    case 'BEHIND_GOAL': {
      const d = Math.max(3, 118 - x);
      const k = 800 / (d + 4);
      return { sx: 380 - (y - fy) * k, sy: 95 + 2300 / (d + 4), k };
    }
    default:
      return { sx: 380 + (x - fx) * 21, sy: 170 + (y - fy) * 21, k: 21 };
  }
}

export const IncidentFrameVisualizer = ({ incident, homeTeam, awayTeam }: Props) => {
  const scene = incident.scene;
  const [angle, setAngle] = useState<CameraAngleId>('MASTER');
  const [frame, setFrame] = useState(() => Math.max(0, (incident.scene?.contactFrame ?? 50) - 30));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.5);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setFrame(f => Math.min(100, f + speed * 2));
    }, 40);
    return () => clearInterval(id);
  }, [playing, speed]);

  useEffect(() => {
    if (playing && frame >= 100) setPlaying(false);
  }, [playing, frame]);

  if (!scene) return null;

  const attTeam = incident.attackingTeam === 'HOME' ? homeTeam : awayTeam;
  const defTeam = incident.attackingTeam === 'HOME' ? awayTeam : homeTeam;
  const t = frame / 100;
  const contact = scene.contactFrame;
  const focusPlayer = scene.players.find(p => p.id === scene.focusPlayerId) ?? scene.players[0];
  const fx = lerp(focusPlayer.from[0], focusPlayer.to[0], contact / 100);
  const fy = lerp(focusPlayer.from[1], focusPlayer.to[1], contact / 100);

  const posOf = (p: ScenePlayer): [number, number] => [lerp(p.from[0], p.to[0], t), lerp(p.from[1], p.to[1], t)];
  const progress = (p: ScenePlayer) => {
    if (!p.reacts) return 0;
    const lead = p.reacts === 'SLIDE' ? 10 : p.reacts === 'ARM' ? 5 : 0;
    return clamp((frame - (contact - lead)) / 14, 0, 1);
  };

  const items = scene.players
    .map(p => {
      const [x, y] = posOf(p);
      return { p, x, y, ...project(angle, x, y, fx, fy) };
    })
    .sort((a, b) => a.sy - b.sy);

  const bx = lerp(scene.ballFrom[0], scene.ballTo[0], t);
  const by = lerp(scene.ballFrom[1], scene.ballTo[1], t);
  const bp = project(angle, bx, by, fx, fy);
  const bz = 0.15 + 0.5 * Math.sin(Math.PI * t);
  const ballY = angle === 'TACTICAL' ? bp.sy : bp.sy - bz * bp.k;
  const ballR = Math.max(4, bp.k * 0.14);

  const [fpx, fpy] = posOf(focusPlayer);
  const fProj = project(angle, fpx, fpy, fx, fy);
  const nearContact = Math.abs(frame - contact) <= 5;
  const cam = ANGLES.find(a => a.id === angle)?.cam ?? '';
  const flip = angle === 'REVERSE' ? -1 : 1;
  const stripes = Array.from({ length: 12 }, (_, i) => 40 + i * 5.5);

  return (
    <div className="relative w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col select-none font-mono">
      <div className="flex flex-wrap justify-between items-center text-xs z-20 bg-slate-950/90 p-2.5 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[10px] tracking-wider">{cam}</span>
          <span className="text-emerald-400 font-bold">
            {incident.minute}:14.{String(200 + Math.round(frame) * 4).padStart(3, '0')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1.5 bg-red-950/80 border border-red-700 px-2 py-0.5 rounded-lg text-red-300 font-bold">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: attTeam.primaryColor }} />
            ATAQUE: {attTeam.shortName}
          </span>
          <span className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-700 px-2 py-0.5 rounded-lg text-blue-300 font-bold">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: defTeam.primaryColor }} />
            DEFESA: {defTeam.shortName}
          </span>
        </div>
      </div>

      <svg className="w-full h-[340px]" viewBox="0 0 760 340">
        <rect width="760" height="340" fill="#0a2e19" />
        {stripes.map((x0, i) => {
          const pts = [
            [x0, 0],
            [x0 + 5.5, 0],
            [x0 + 5.5, 68],
            [x0, 68]
          ]
            .map(([x, y]) => {
              const p = project(angle, x, y, fx, fy);
              return `${p.sx},${p.sy}`;
            })
            .join(' ');
          return <polygon key={i} points={pts} fill={i % 2 === 0 ? '#14532d' : '#166534'} />;
        })}
        {angle !== 'TACTICAL' && (
          <g>
            <rect width="760" height={angle === 'BEHIND_GOAL' ? 80 : 34} fill="#0b1220" />
            <rect y={angle === 'BEHIND_GOAL' ? 70 : 24} width="760" height="10" fill="#1e293b" />
          </g>
        )}
        {FIELD_LINES.map(([x1, y1, x2, y2], i) => {
          const a = project(angle, x1, y1, fx, fy);
          const b = project(angle, x2, y2, fx, fy);
          return <line key={i} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy} stroke="rgba(255,255,255,0.75)" strokeWidth={2} />;
        })}

        {angle === 'BEHIND_GOAL' && (() => {
          const l = project(angle, 105, 30.34, fx, fy);
          const r = project(angle, 105, 37.66, fx, fy);
          const top = 2.44 * l.k;
          return (
            <g>
              <rect x={Math.min(l.sx, r.sx)} y={l.sy - top} width={Math.abs(r.sx - l.sx)} height={top} fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth={3} />
            </g>
          );
        })()}

        {items.map(({ p, sx, sy, k }) =>
          angle === 'TACTICAL' ? (
            <g key={p.id}>
              <circle cx={sx} cy={sy} r={10} fill={p.gk ? '#16a34a' : p.side === 'ATT' ? attTeam.primaryColor : defTeam.primaryColor} stroke={p.id === scene.focusPlayerId ? '#facc15' : '#fff'} strokeWidth={2} />
              <text x={sx} y={sy + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">{p.number}</text>
            </g>
          ) : (
            <PlayerFigure
              key={p.id}
              sx={sx}
              sy={sy}
              h={1.85 * k}
              color={p.side === 'ATT' ? attTeam.primaryColor : defTeam.primaryColor}
              number={p.number}
              label={p.id === scene.focusPlayerId || angle === 'CLOSEUP' ? p.role : undefined}
              dir={(p.side === 'ATT' ? flip : -flip) as 1 | -1}
              phase={p.gk ? 0 : frame * 0.4 + p.number}
              reacts={p.reacts}
              reactProgress={progress(p)}
              highlight={p.id === scene.focusPlayerId && nearContact}
              gk={p.gk}
            />
          )
        )}

        {angle !== 'TACTICAL' && <ellipse cx={bp.sx} cy={bp.sy} rx={ballR} ry={ballR * 0.35} fill="rgba(0,0,0,0.4)" />}
        <circle cx={bp.sx} cy={ballY} r={ballR} fill="#fff" stroke="#111" strokeWidth={1.5} />

        {nearContact && (
          <g>
            <circle cx={fProj.sx} cy={angle === 'TACTICAL' ? fProj.sy : fProj.sy - fProj.k * 0.9} r={Math.max(22, fProj.k * 1.1)} fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth={3} strokeDasharray="6 4" className="animate-pulse" />
            <text x={fProj.sx} y={(angle === 'TACTICAL' ? fProj.sy : fProj.sy - fProj.k * 2.6) - 8} textAnchor="middle" fontSize={13} fontWeight={900} fill="#fca5a5">⚡ CONTATO</text>
          </g>
        )}
      </svg>

      <div className="bg-slate-900/95 border-t border-slate-800 p-3 flex flex-col gap-2 text-xs">
        <div className="flex flex-wrap gap-1.5">
          {ANGLES.map(a => (
            <button
              key={a.id}
              onClick={() => setAngle(a.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                angle === a.id ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (frame >= 100) setFrame(0);
              setPlaying(p => !p);
            }}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded font-bold"
          >
            {playing ? '⏸ Pausar' : '▶ Reproduzir'}
          </button>
          <button onClick={() => { setPlaying(false); setFrame(f => Math.max(0, f - 1)); }} className="px-2 py-1 bg-slate-800 rounded font-bold border border-slate-700">◀ -1</button>
          <button onClick={() => { setPlaying(false); setFrame(f => Math.min(100, f + 1)); }} className="px-2 py-1 bg-slate-800 rounded font-bold border border-slate-700">+1 ▶</button>
          {[0.25, 0.5, 1].map(s => (
            <button key={s} onClick={() => setSpeed(s)} className={`px-2 py-1 rounded font-bold border ${speed === s ? 'bg-amber-500 text-black border-amber-300' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              {s}x
            </button>
          ))}
          <button onClick={() => { setPlaying(false); setFrame(contact); }} className="px-2.5 py-1 bg-red-700 hover:bg-red-600 rounded font-bold">🎯 Ir ao contato</button>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(frame)}
          onChange={e => { setPlaying(false); setFrame(Number(e.target.value)); }}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">Frame {Math.round(frame)}/100 • contato no frame {contact}</span>
          <span className={nearContact ? 'text-red-300 font-bold' : 'text-slate-500'}>{nearContact ? scene.contactLabel : 'Arraste a linha do tempo para analisar'}</span>
        </div>
      </div>
    </div>
  );
};
