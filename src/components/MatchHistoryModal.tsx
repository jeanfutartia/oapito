import { useState } from 'react';
import type { MatchReport } from '../types/types';
import { MatchReportModal } from './MatchReportModal';

interface Props { history: MatchReport[]; onClose: () => void }

export const MatchHistoryModal = ({ history, onClose }: Props) => {
  const [open, setOpen] = useState<MatchReport | null>(null);
  return (
    <>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-40 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-3 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4 my-8">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-black text-amber-400">HISTÓRICO OFICIAL DE JOGOS APITADOS</h2>
              <p className="text-xs text-slate-400">{history.length} súmula(s) arquivada(s)</p>
            </div>
            <button onClick={onClose} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition">Fechar</button>
          </div>
          {history.length === 0 ? <div className="py-12 text-center text-slate-500 text-xs italic">Nenhuma partida oficial registrada nesta carreira ainda.</div> : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {history.map(m => (
                <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">{m.competition ?? 'Campeonato'} • Rodada {m.round ?? '-'} • {m.dateStr}</span>
                    <span className={'font-mono font-black text-sm ' + (m.uefaScore >= 8.4 ? 'text-emerald-400' : m.uefaScore >= 7.5 ? 'text-amber-400' : 'text-red-400')}>Nota {m.uefaScore.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-mono">
                    <span className="font-bold text-sm">{m.homeTeamName}</span>
                    <span className="text-xl font-black px-3 py-1 bg-slate-900 rounded border border-slate-800">{m.homeScore} x {m.awayScore}</span>
                    <span className="font-bold text-sm">{m.awayTeamName}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
                    <span>⚽ {m.goals.length} • 🟨 {m.cards.filter(c => c.cardType === 'YELLOW').length} • 🟥 {m.cards.filter(c => c.cardType === 'RED').length} • VAR {m.varReviews.length} • {m.stadium}</span>
                    <button onClick={() => setOpen(m)} className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 rounded-lg font-bold text-white font-sans transition">📄 Ver súmula</button>
                  </div>
                  {m.pressHeadline && <div className="bg-slate-900/80 p-2 rounded text-[11px] text-slate-300 border border-slate-800 italic">{m.pressHeadline}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {open && <MatchReportModal report={open} uefaScore={open.uefaScore} isEvaluating={false} readOnly onClose={() => setOpen(null)} />}
    </>
  );
};
