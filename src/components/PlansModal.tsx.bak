import { useState } from 'react';
import { PLANS, FEATURES, BILLING_ENABLED } from '../config/features';
import type { PlanId } from '../config/features';

interface Props { onClose: () => void }
const KEY = 'o-apito-interest';

const load = (): PlanId[] => {
  try { return JSON.parse(window.localStorage.getItem(KEY) ?? '[]') as PlanId[]; } catch { return []; }
};

export const PlansModal = ({ onClose }: Props) => {
  const [interest, setInterest] = useState<PlanId[]>(load);
  const toggle = (p: PlanId) => {
    const next = interest.includes(p) ? interest.filter(x => x !== p) : [...interest, p];
    setInterest(next);
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* sem armazenamento */ }
  };
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[60] font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-black text-amber-400">⭐ Planos e acesso antecipado</h2>
            <p className="text-xs text-slate-400">Veja o que o jogo oferece hoje e o que pode virar plano no futuro.</p>
          </div>
          <button onClick={onClose} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold">Fechar</button>
        </div>

        <div className="rounded-xl border border-emerald-700 bg-emerald-950/40 p-3 text-xs text-emerald-100 leading-relaxed">
          🎁 <b>Acesso antecipado:</b> {BILLING_ENABLED ? 'os planos abaixo estão ativos.' : 'por enquanto nada é cobrado. Tudo que o jogo já tem está liberado de graça, sem cadastro e sem cartão.'}
          {' '}Os planos mostram o que <b>poderá</b> ser pago mais para a frente — as funções marcadas “Em breve” ainda não existem.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PLANS.map(p => {
            const list = FEATURES.filter(f => f.plan === p.id);
            return (
              <div key={p.id} className={'rounded-2xl border p-4 flex flex-col gap-3 ' + (p.highlight ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 bg-slate-950')}>
                <div>
                  {p.highlight && <span className="text-[10px] font-black bg-amber-500 text-black rounded px-1.5 py-0.5">MAIS PROCURADO</span>}
                  <h3 className="text-base font-black mt-1">{p.name}</h3>
                  <p className="text-[11px] text-slate-400">{p.tagline}</p>
                  <p className="text-2xl font-black mt-1">{p.price}</p>
                </div>
                <ul className="flex flex-col gap-2 text-xs flex-1">
                  {list.map(f => (
                    <li key={f.id} className="flex items-start gap-2">
                      <span>{f.icon}</span>
                      <span>
                        <b>{f.name}</b>
                        <span className="block text-[10px] text-slate-400">{f.description}</span>
                        <span className={'inline-block mt-0.5 text-[9px] font-bold rounded px-1.5 py-0.5 ' + (f.status === 'DISPONIVEL' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-300')}>
                          {f.status === 'DISPONIVEL' ? (p.id === 'FREE' ? 'Disponível' : 'Disponível • grátis agora') : 'Em breve'}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                {p.id === 'FREE' ? (
                  <span className="text-[11px] text-emerald-300 font-bold text-center">✓ Seu plano atual</span>
                ) : (
                  <button onClick={() => toggle(p.id)} className={'py-2 rounded-xl text-xs font-bold transition border ' + (interest.includes(p.id) ? 'bg-emerald-700 border-emerald-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700')}>
                    {interest.includes(p.id) ? '✓ Interesse registrado neste aparelho' : 'Tenho interesse'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-500 text-center">Sem cobrança • sem cartão • o registro de interesse fica salvo só neste aparelho.</p>
      </div>
    </div>
  );
};
