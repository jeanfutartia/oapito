import type { CareerEvent } from '../types/types';

interface Props { event: CareerEvent; onChoose: (i: number) => void }

const fx = (n: number, unit: string) => (n === 0 ? '' : (n > 0 ? '+' : '') + n + unit);

export const CareerEventModal = ({ event, onChoose }: Props) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
    <div className="bg-slate-900 border-2 border-violet-500 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
      <div className="border-b border-slate-800 pb-3">
        <span className="text-[10px] font-black tracking-wider uppercase text-violet-300">Acontecimento da carreira</span>
        <h2 className="text-lg font-black mt-1">{event.title}</h2>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{event.body}</p>
      <div className="flex flex-col gap-2">
        {event.options.map((o, i) => (
          <button key={i} onClick={() => onChoose(i)} className="text-left p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs transition flex flex-col gap-1">
            <b className="text-sm">{o.label}</b>
            <span className="text-[11px] text-slate-400">
              {[fx(o.money, ' R$'), fx(o.rep, ' reputação'), fx(o.physical ?? 0, ' físico'), fx(o.rules ?? 0, ' regras'), fx(o.stress ?? 0, ' resistência')].filter(Boolean).join(' • ') || 'Sem custo'}
            </span>
          </button>
        ))}
      </div>
    </div>
  </div>
);
