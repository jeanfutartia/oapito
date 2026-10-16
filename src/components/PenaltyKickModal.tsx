import type { PenaltyKick } from '../store/useGameStore';

interface Props {
  pk: PenaltyKick;
  atkName: string;
  defName: string;
  onFix: (what: 'GK' | 'PLAYERS') => void;
  onKick: () => void;
}

export const PenaltyKickModal = ({ pk, atkName, defName, onFix, onKick }: Props) => {
  const gkAhead = pk.gkOff && !pk.fixedGk;
  const inside = pk.playersIn && !pk.fixedPlayers;
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <span className="bg-amber-500 text-black font-black text-xs px-2.5 py-1 rounded uppercase tracking-wider">⚽ Pênalti • {pk.minute}'</span>
          <span className="text-xs text-slate-400">{pk.shooter} ({atkName}) x {pk.keeper} ({defName})</span>
        </div>

        <svg viewBox="0 0 320 200" className="w-full rounded-xl border border-slate-800">
          <rect width="320" height="200" fill="#14532d" />
          {[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x={i * 53.4} y="0" width="26.7" height="200" fill="rgba(255,255,255,0.04)" />)}
          <rect x="70" y="0" width="180" height="96" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          <path d="M 120 96 A 50 50 0 0 0 200 96" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          <rect x="125" y="2" width="70" height="10" fill="none" stroke="#fff" strokeWidth="2" />
          <line x1="125" y1="12" x2="195" y2="12" stroke="#facc15" strokeWidth="2" />
          <circle cx="160" cy="66" r="2.5" fill="#fff" />
          <g style={{ transform: 'translate(0px, ' + (gkAhead ? 26 : 0) + 'px)', transition: 'transform .6s ease' }}>
            <circle cx="160" cy="14" r="7" fill="#22d3ee" stroke={gkAhead ? '#ef4444' : '#fff'} strokeWidth="2" />
          </g>
          {[[100, 40], [212, 52], [190, 82]].map(([x, y], i) => (
            <g key={i} style={{ transform: 'translate(0px, ' + (inside ? 0 : 130 - y) + 'px)', transition: 'transform .7s ease' }}>
              <circle cx={x} cy={y} r="6" fill="#e5e7eb" stroke={inside ? '#ef4444' : '#fff'} strokeWidth="2" />
            </g>
          ))}
          <circle cx="160" cy="76" r="6" fill="#facc15" stroke="#111" strokeWidth="1.5" />
          <circle cx="160" cy="66" r="3.5" fill="#fff" stroke="#111" strokeWidth="1" />
        </svg>

        <div className={'rounded-xl border p-3 text-xs ' + (gkAhead || inside ? 'border-red-700 bg-red-950/40 text-red-200' : 'border-emerald-700 bg-emerald-950/40 text-emerald-200')}>
          {gkAhead && <span className="block">⚠️ O goleiro está adiantado, fora da linha do gol.</span>}
          {inside && <span className="block">⚠️ Há jogadores dentro da grande área antes da cobrança.</span>}
          {!gkAhead && !inside && <span>Tudo regular: goleiro na linha e área livre. Pode apitar.</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button onClick={() => onFix('GK')} disabled={!gkAhead} className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition">
            <span className="text-base">🧤 Goleiro</span><span className="text-[10px] font-normal opacity-80">Mandar voltar à linha</span>
          </button>
          <button onClick={() => onFix('PLAYERS')} disabled={!inside} className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition">
            <span className="text-base">🚷 Jogadores</span><span className="text-[10px] font-normal opacity-80">Afastar da área</span>
          </button>
          <button onClick={onKick} className="p-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition shadow-lg shadow-emerald-600/30">
            <span className="text-base">📢 Apitar</span><span className="text-[10px] font-normal opacity-80">Autorizar a cobrança</span>
          </button>
        </div>
      </div>
    </div>
  );
};
