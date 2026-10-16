import type { IncidentPitchZone } from '../types/types';

interface Props {
  zone: IncidentPitchZone;
}

export const PitchRadarMap = ({ zone }: Props) => {
  return (
    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1.5 font-mono text-xs">
      <div className="flex justify-between items-center text-[11px] text-slate-400">
        <span className="font-bold text-slate-300">LOCALIZAÇÃO EM CAMPO</span>
        <span className="text-amber-400 font-bold">{zone.name}</span>
      </div>

      <div className="relative w-full h-24 bg-gradient-to-r from-emerald-950 via-green-950 to-emerald-950 rounded-lg border border-emerald-800/80 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Linhas demarcatórias oficiais em SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
          {/* Borda */}
          <rect x="4" y="4" width="192" height="92" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          {/* Meio-campo */}
          <line x1="100" y1="4" x2="100" y2="96" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <circle cx="100" cy="50" r="18" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          {/* Grande Área Mandante */}
          <rect x="4" y="24" width="32" height="52" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <rect x="4" y="36" width="14" height="28" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          {/* Grande Área Visitante */}
          <rect x="164" y="24" width="32" height="52" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <rect x="182" y="36" width="14" height="28" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        </svg>

        {/* Radar Pulsante exatamente nas coordenadas X% e Y% do lance */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${zone.xPercent}%`, top: `${zone.yPercent}%` }}
        >
          <div className="w-6 h-6 rounded-full bg-red-500/30 animate-ping absolute -top-1 -left-1" />
          <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
          </div>
        </div>
      </div>
    </div>
  );
};
