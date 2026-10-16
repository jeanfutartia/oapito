import { useState } from 'react';
import type { RefereeStyle } from '../types/types';
import { Logo } from './GuidePage';

interface Props {
  onSave: (data: { name: string; age: number; federation: string; style: RefereeStyle }) => void;
}

const STYLES: [RefereeStyle, string, string][] = [
  ['DIALOGADOR', 'Dialogador', 'Conversa muito e dá poucos cartões'],
  ['PREVENTIVO', 'Preventivo', 'Apita cedo para evitar confusão'],
  ['DISCIPLINADOR', 'Disciplinador', 'Firme, com cartão quando precisa'],
  ['RIGOROSO', 'Rigoroso', 'Cartão fácil e pouca conversa']
];

export const ProfileModal = ({ onSave }: Props) => {
  const [name, setName] = useState('Carlos Silva');
  const [age, setAge] = useState(26);
  const [federation, setFederation] = useState('Federação Paulista de Futebol (FPF)');
  const [style, setStyle] = useState<RefereeStyle>('DIALOGADOR');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, age, federation, style });
  };

  const field = 'w-full bg-black border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400';

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-950 border-2 border-amber-400/60 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4 font-sans">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <Logo size={64} className="shrink-0" />
          <div>
            <h2 className="brand-font text-xl text-white">Crie seu <span className="text-amber-400">árbitro</span></h2>
            <p className="text-xs text-slate-400">Escolha seu nome e seu estilo antes do primeiro jogo. Você começa na Série D.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Nome</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className={field} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Idade</label>
              <input type="number" min={21} max={48} value={age} onChange={e => setAge(Number(e.target.value))} className={field} />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Federação</label>
              <input type="text" value={federation} onChange={e => setFederation(e.target.value)} className={field} />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-bold mb-1">Seu estilo de apitar</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STYLES.map(([id, label, desc]) => (
                <button key={id} type="button" onClick={() => setStyle(id)}
                  className={'text-left p-2.5 rounded-lg border transition ' + (style === id ? 'border-amber-400 bg-amber-400/10' : 'border-slate-700 bg-black hover:border-slate-500')}>
                  <b className={style === id ? 'text-amber-400' : 'text-slate-100'}>{label}</b>
                  <span className="block text-[11px] text-slate-400">{desc}</span>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full mt-1 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black rounded-xl transition shadow-lg shadow-amber-500/20 brand-font text-base">
            Começar a temporada na Série D
          </button>
        </form>
      </div>
    </div>
  );
};
