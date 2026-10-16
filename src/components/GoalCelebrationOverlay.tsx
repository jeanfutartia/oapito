import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import type { GoalAnimationData } from '../types/types';

interface Props {
  data: GoalAnimationData;
  homeName: string;
  awayName: string;
  homeColor: string;
  awayColor: string;
  homeScore: number;
  awayScore: number;
  onClose: () => void;
}

const AUTO_MS = 7000;

export const GoalCelebrationOverlay = ({ data, homeName, awayName, homeColor, awayColor, homeScore, awayScore, onClose }: Props) => {
  const [pct, setPct] = useState(0);
  const scoringHome = data.teamName === homeName;

  useEffect(() => {
    const colors = [data.teamColor, '#ffffff', '#facc15'];
    const burst = () => {
      void confetti({ particleCount: 70, angle: 60, spread: 70, origin: { x: 0, y: 0.75 }, colors });
      void confetti({ particleCount: 70, angle: 120, spread: 70, origin: { x: 1, y: 0.75 }, colors });
    };
    burst();
    const id = setInterval(burst, 900);
    const stop = setTimeout(() => clearInterval(id), 3600);
    return () => { clearInterval(id); clearTimeout(stop); };
  }, [data.teamColor]);

  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => {
      const p = Math.min(100, ((performance.now() - start) / AUTO_MS) * 100);
      setPct(p);
      if (p >= 100) onClose();
    }, 80);
    return () => clearInterval(id);
  }, [onClose]);

  return (
    <div onClick={onClose} className="goal-overlay fixed inset-0 z-50 flex items-center justify-center cursor-pointer select-none overflow-hidden bg-black/90 backdrop-blur-md">
      <style>{`
        @keyframes goalPop { 0% { transform: scale(0.2) rotate(-6deg); opacity: 0 } 60% { transform: scale(1.15) rotate(2deg); opacity: 1 } 100% { transform: scale(1) rotate(0) } }
        @keyframes goalBeam { from { transform: rotate(-18deg) } to { transform: rotate(18deg) } }
        @keyframes scoreBump { 0% { transform: scale(1) } 35% { transform: scale(1.7); color: #facc15 } 100% { transform: scale(1) } }
        @keyframes ballIn { 0% { transform: translate(-160px, 70px) scale(0.5) rotate(0) } 70% { transform: translate(0, -6px) scale(1) rotate(540deg) } 100% { transform: translate(0, 0) scale(1) rotate(720deg) } }
        @keyframes netShake { 0%,100% { transform: scaleX(1) } 30% { transform: scaleX(1.08) } 60% { transform: scaleX(0.97) } }
        @keyframes rise { from { transform: translateY(24px); opacity: 0 } to { transform: none; opacity: 1 } }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-40 h-[140%] origin-top opacity-25 blur-md" style={{ background: 'linear-gradient(#fff, transparent)', animation: 'goalBeam 2.2s ease-in-out infinite alternate' }} />
        <div className="absolute -top-40 right-1/4 w-40 h-[140%] origin-top opacity-25 blur-md" style={{ background: 'linear-gradient(#fde68a, transparent)', animation: 'goalBeam 2.8s ease-in-out infinite alternate-reverse' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 60%, ' + data.teamColor + '55, transparent 60%)' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center gap-5 p-6 max-w-2xl w-full">
        <div className="bg-amber-500 text-black font-black text-xs px-4 py-1 rounded-full uppercase tracking-widest shadow-lg" style={{ animation: 'rise 0.4s both' }}>
          {data.minute}' minuto • {data.isPenalty ? 'Gol de pênalti' : 'Gol'}
        </div>

        <h1 className="text-5xl sm:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-amber-400 drop-shadow-[0_10px_30px_rgba(250,204,21,0.6)]"
          style={{ animation: 'goalPop 0.7s cubic-bezier(.2,1.4,.4,1) both' }}>
          GOOOOOL!
        </h1>

        <div className="w-full bg-slate-900/95 border border-slate-700 rounded-2xl px-3 sm:px-5 py-3 sm:py-4 shadow-2xl flex items-center justify-between gap-2 sm:gap-3" style={{ animation: 'rise 0.5s 0.25s both' }}>
          <div className="flex-1 min-w-0 flex items-center justify-end gap-2">
            <span className={'truncate font-black text-xs sm:text-base ' + (scoringHome ? 'text-white' : 'text-slate-400')}>{homeName}</span>
            <span className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: homeColor }} />
          </div>
          <div className="flex items-center gap-3 font-mono font-black text-4xl sm:text-5xl">
            <span style={scoringHome ? { animation: 'scoreBump 0.9s 0.6s both' } : undefined}>{homeScore}</span>
            <span className="text-slate-600 text-3xl">x</span>
            <span style={!scoringHome ? { animation: 'scoreBump 0.9s 0.6s both' } : undefined}>{awayScore}</span>
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: awayColor }} />
            <span className={'truncate font-black text-xs sm:text-base ' + (!scoringHome ? 'text-white' : 'text-slate-400')}>{awayName}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5" style={{ animation: 'rise 0.5s 0.45s both' }}>
          <svg width="90" height="90" viewBox="0 0 90 90" aria-hidden="true">
            <path d="M12 76 L20 26 Q45 12 70 26 L78 76 Z" fill={data.teamColor} stroke="#fff" strokeWidth="3" />
            <path d="M36 21 Q45 33 54 21" fill="none" stroke="#fff" strokeWidth="3" />
            <text x="45" y="62" textAnchor="middle" fontSize="30" fontWeight="900" fill="#fff" stroke="#0f172a" strokeWidth="1.2">{data.playerNumber}</text>
          </svg>
          <div className="text-left">
            <span className="block text-xs text-slate-400 uppercase tracking-wider">Marcou para</span>
            <span className="block text-2xl font-black text-white">{data.teamName}</span>
            <span className="block text-sm text-emerald-400 font-bold">Camisa nº {data.playerNumber}</span>
          </div>
          <div className="relative w-28 h-16 overflow-hidden" style={{ animation: 'netShake 0.5s 0.9s' }}>
            <div className="absolute inset-0 border-4 border-white/80 border-b-0 rounded-t-sm" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 2px, transparent 2px 9px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.25) 0 2px, transparent 2px 9px)' }} />
            <span className="absolute left-1/2 bottom-1 -ml-3 text-2xl" style={{ animation: 'ballIn 0.9s 0.1s both' }}>⚽</span>
          </div>
        </div>

        <div className="w-full max-w-xs flex flex-col items-center gap-1">
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400" style={{ width: pct + '%' }} />
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Clique para continuar a partida</span>
        </div>
      </div>
    </div>
  );
};
