interface Props {
  bpm: number;
  distanceKm: number;
  temperature: number;
  whistles: number;
  onStrongWhistle: () => void;
}

export const SmartRefereeDashboard = ({ bpm, distanceKm, temperature, whistles, onStrongWhistle }: Props) => {
  const hot = temperature > 55;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col gap-3 font-mono text-xs">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <span className="font-black text-emerald-400 uppercase text-[10px] sm:text-[11px] tracking-wider">⌚ Seu desempenho</span>
        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold whitespace-nowrap">RELÓGIO INTELIGENTE</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">BPM</span>
          <span className={'text-base sm:text-lg font-black ' + (bpm > 150 ? 'text-red-400 animate-pulse' : 'text-emerald-400')}>❤️ {bpm}</span>
        </div>
        <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Distância</span>
          <span className="text-base sm:text-lg font-black text-cyan-400">🏃 {distanceKm.toFixed(1)}<span className="text-[10px]"> km</span></span>
        </div>
        <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Pressão</span>
          <span className={'text-base sm:text-lg font-black ' + (hot ? 'text-amber-400' : 'text-slate-300')}>🔥 {Math.round(temperature)}%</span>
        </div>
      </div>

      <button
        onClick={onStrongWhistle}
        disabled={whistles >= 5}
        className={'py-2.5 px-3 rounded-xl font-bold text-[11px] transition flex items-center justify-between gap-2 border ' + (hot ? 'bg-amber-600 hover:bg-amber-500 border-amber-400 text-black' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200') + ' disabled:opacity-40'}
      >
        <span>📢 Apito forte — esfria o jogo</span>
        <span className="font-mono">{whistles}/5</span>
      </button>
      <span className="text-[10px] text-slate-500 leading-snug">
        Acima de 80% de pressão o jogo pode virar tumulto (amarelos e nota). Use o apito forte quando passar de 55%: esfria o jogo e protege sua nota. Intervalo mínimo de 6 minutos.
      </span>
    </div>
  );
};
