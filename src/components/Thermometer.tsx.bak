import { useEffect, useRef, useState } from 'react';

interface Zone { max: number; label: string; icon: string; color: string; hint: string }
const ZONES: Zone[] = [
  { max: 40, label: 'Calmo', icon: '🧊', color: '#38bdf8', hint: 'Jogo sob controle.' },
  { max: 65, label: 'Atenção', icon: '🌡️', color: '#facc15', hint: 'Os ânimos começam a subir.' },
  { max: 80, label: 'Quente', icon: '🔥', color: '#fb923c', hint: 'Use o apito forte se puder.' },
  { max: 101, label: 'Explosivo', icon: '💥', color: '#ef4444', hint: 'Risco de tumulto!' }
];
export const zoneOf = (v: number): Zone => ZONES.find(z => v < z.max) ?? ZONES[ZONES.length - 1];

interface Props { value: number; whistles: number; onStrongWhistle: () => void; playing: boolean }

export const Thermometer = ({ value, whistles, onStrongWhistle, playing }: Props) => {
  const v = Math.max(0, Math.min(100, value));
  const z = zoneOf(v);
  const hist = useRef<number[]>([]);
  const [trend, setTrend] = useState<'UP' | 'DOWN' | 'FLAT'>('FLAT');
  useEffect(() => {
    hist.current = [...hist.current, v].slice(-6);
    const old = hist.current[0];
    setTrend(v - old >= 3 ? 'UP' : v - old <= -3 ? 'DOWN' : 'FLAT');
  }, [v]);

  return (
    <div className="bg-black border border-slate-800 rounded-xl p-2.5 sm:p-3 flex items-center gap-3" aria-label={'Termômetro de pressão: ' + Math.round(v) + '%'}>
      {/* Bulbo + tubo */}
      <div className="flex items-center shrink-0">
        <div className="relative w-8 h-8 rounded-full border-2 border-slate-600 flex items-center justify-center" style={{ background: z.color, boxShadow: '0 0 12px ' + z.color + '88' }}>
          <span className="text-sm leading-none">{z.icon}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="brand-font text-sm sm:text-base" style={{ color: z.color }}>{z.label}</span>
          <span className="font-mono text-xs text-slate-300">
            <b className="text-base text-white">{Math.round(v)}</b>%
            <span className={'ml-1.5 font-bold ' + (trend === 'UP' ? 'text-red-400' : trend === 'DOWN' ? 'text-sky-400' : 'text-slate-500')}>
              {trend === 'UP' ? '▲ subindo' : trend === 'DOWN' ? '▼ esfriando' : '— estável'}
            </span>
          </span>
        </div>
        <div className="relative h-3.5 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(90deg,#38bdf8 0%,#facc15 45%,#fb923c 70%,#ef4444 100%)' }} />
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500" style={{ width: v + '%', background: 'linear-gradient(90deg,#38bdf8,' + z.color + ')', boxShadow: '0 0 8px ' + z.color }} />
          {[40, 65, 80].map(t => <span key={t} className="absolute top-0 bottom-0 w-px bg-black/70" style={{ left: t + '%' }} />)}
        </div>
        <div className="relative h-3 text-[9px] text-slate-500 font-mono">
          {[0, 40, 65, 80, 100].map(t => <span key={t} className="absolute -translate-x-1/2" style={{ left: t + '%', transform: t === 0 ? 'none' : t === 100 ? 'translateX(-100%)' : undefined }}>{t}</span>)}
        </div>
        <span className="text-[10px] text-slate-400">{z.hint}{v >= 80 ? ' Acima de 80% pode estourar um tumulto.' : ''}</span>
      </div>
      {v >= 55 && (
        <button onClick={onStrongWhistle} disabled={whistles >= 5 || !playing} className="shrink-0 px-2.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black text-[11px] font-black leading-tight">
          📢 Apito forte<span className="block text-[9px] font-bold opacity-70">{whistles}/5</span>
        </button>
      )}
    </div>
  );
};
