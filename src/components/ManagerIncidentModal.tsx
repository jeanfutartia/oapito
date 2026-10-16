import type { ManagerIncident } from '../types/types';

interface Props {
  incident: ManagerIncident;
  onResolve: (action: 'VERBAL_WARNING' | 'YELLOW_CARD' | 'RED_CARD') => void;
}

export const ManagerIncidentModal = ({ incident, onResolve }: Props) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-5">
        
        {/* Topo do Alerta */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-black font-black text-xs px-2.5 py-1 rounded uppercase tracking-wider">
              ÁREA TÉCNICA • {incident.minute}' MINUTO
            </span>
            <span className="text-xs text-red-400 font-bold font-mono">TÉCNICO PROTESTANDO</span>
          </div>
          <span className="text-xs text-slate-400">{incident.teamName}</span>
        </div>

        {/* Citação do Técnico */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Técnico: <strong className="text-white text-sm">{incident.managerName}</strong></span>
            <span className="text-red-400 font-bold uppercase">{incident.intensity}</span>
          </div>
          <p className="text-amber-300 font-mono text-sm italic bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            {incident.quote}
          </p>
          <span className="text-[11px] text-slate-400">
            Aviso do quarto árbitro: {incident.reason}
          </span>
        </div>

        {/* Escolha da Punição pelo Árbitro Principal */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
            O que você faz?
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onResolve('VERBAL_WARNING')}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex flex-col items-center gap-1 transition"
            >
              <span className="text-base">🗣️</span>
              <span>Advertência Verbal</span>
              <span className="text-[10px] text-slate-400 font-normal">Acalma sem cartão</span>
            </button>

            <button
              onClick={() => onResolve('YELLOW_CARD')}
              className="p-3 bg-amber-600/90 hover:bg-amber-500 text-black rounded-xl text-xs font-black border border-amber-400 flex flex-col items-center gap-1 transition"
            >
              <span className="text-base">🟨</span>
              <span>Cartão Amarelo</span>
              <span className="text-[10px] text-black/80 font-normal">Registra na súmula</span>
            </button>

            <button
              onClick={() => onResolve('RED_CARD')}
              className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black border border-red-400 flex flex-col items-center gap-1 transition"
            >
              <span className="text-base">🟥</span>
              <span>Cartão Vermelho</span>
              <span className="text-[10px] text-white/80 font-normal">Expulso aos vestiários</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
