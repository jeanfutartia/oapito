import type { Incident, DecisionType, Team } from '../types/types';
import { VarReplay } from './VarReplay';
import { ProBadge } from './ProBadge';
import { PitchRadarMap } from './PitchRadarMap';

interface VARModalProps {
  incident: Incident;
  homeTeam: Team;
  awayTeam: Team;
  initialDecision: DecisionType | null;
  onConfirm: (decision: DecisionType) => void;
}

const Btn = ({ onClick, cls, title, sub }: { onClick: () => void; cls: string; title: string; sub?: string }) => (
  <button onClick={onClick} className={'py-3 px-3 rounded-xl font-bold text-xs flex flex-col items-center gap-0.5 transition shadow ' + cls}>
    <span className="text-sm font-black">{title}</span>
    {sub && <span className="text-[10px] opacity-80">{sub}</span>}
  </button>
);

export const VARModal = ({ incident, homeTeam, awayTeam, onConfirm }: VARModalProps) => {
  const isGoalOrOffside = incident.category === 'IMPEDIMENTO_3D' || incident.category === 'GOL_POLÊMICO';
  const isDispute = incident.category === 'PENALTI_DISPUTA';
  const isHandGoal = incident.category === 'GOL_POLÊMICO';
  // Pênalti só existe se o lance foi dentro da grande área (as pontas do campo, nos dois lados).
  const inBox = (incident.pitchZone.xPercent <= 20 || incident.pitchZone.xPercent >= 80) && incident.pitchZone.yPercent >= 18 && incident.pitchZone.yPercent <= 82;
  const isPenaltyContext = incident.category === 'DOGSO_CHANCE_CLARA' || incident.category === 'PENALTI_DISPUTA' || incident.category === 'MAO_VOLUMETRIA';

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-start justify-center p-4 z-50 overflow-y-auto font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-6xl w-full p-3 sm:p-5 shadow-2xl flex flex-col gap-3 text-slate-100 my-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white font-extrabold px-3 py-1 rounded text-xs tracking-wider animate-pulse">REVISÃO NO MONITOR (VAR)</span>
            <h2 className="text-sm font-bold text-slate-100">{incident.title}</h2>
            <ProBadge label="REPLAY 3D" />
          </div>
          <span className="text-xs text-slate-400 font-mono">Minuto {incident.minute}' | Regras oficiais</span>
        </div>

        <PitchRadarMap zone={incident.pitchZone} />

        <VarReplay incident={incident} homeTeam={homeTeam} awayTeam={awayTeam} />

        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-300">
          <strong className="text-slate-100">Regra oficial: </strong>{incident.ifabExplanation}
        </div>

        <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Sua decisão final após analisar todas as câmeras:</span>
          {isGoalOrOffside ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Btn onClick={() => onConfirm('GOAL_VALID')} cls="bg-emerald-600 hover:bg-emerald-500 text-white" title="⚽ CONFIRMAR GOL" sub={isHandGoal ? 'Sem mão no ataque' : 'Posição legal'} />
              <Btn onClick={() => onConfirm('GOAL_DISALLOWED')} cls="bg-red-600 hover:bg-red-500 text-white" title="🚫 ANULAR GOL" sub={isHandGoal ? 'Mão do atacante' : 'Impedimento'} />
              <Btn onClick={() => onConfirm('FOUL')} cls="bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-600" title="⚠️ ANULAR GOL" sub="Falta de ataque na fase anterior" />
            </div>
          ) : isPenaltyContext ? (
            <div className={'grid grid-cols-2 gap-3 ' + (isDispute ? 'sm:grid-cols-5' : 'sm:grid-cols-4')}>
              <Btn onClick={() => onConfirm('PENALTY_YELLOW')} cls="bg-amber-600 hover:bg-amber-500 text-black" title="🟨 Pênalti + Amarelo" sub="Chance clara, tentou a bola" />
              <Btn onClick={() => onConfirm('PENALTY_RED')} cls="bg-red-600 hover:bg-red-500 text-white" title="🟥 Pênalti + Vermelho" sub="Sem disputa / agressão" />
              <Btn onClick={() => onConfirm('PENALTY')} cls="bg-emerald-600 hover:bg-emerald-500 text-white" title="⚽ Pênalti simples" sub="Sem cartão" />
              <Btn onClick={() => onConfirm('PLAY_ON')} cls="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700" title="Mandar seguir" sub="Contato legal" />
              {isDispute && <Btn onClick={() => onConfirm('YELLOW_CARD')} cls="bg-yellow-600 hover:bg-yellow-500 text-black" title="🟨 Simulação" sub="Amarelo ao atacante" />}
            </div>
          ) : (
            <div className={'grid grid-cols-2 gap-2 ' + (inBox ? 'md:grid-cols-5' : 'md:grid-cols-4')}>
              <Btn onClick={() => onConfirm('PLAY_ON')} cls="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" title="Seguir" />
              <Btn onClick={() => onConfirm('FOUL')} cls="bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700" title="Falta simples" />
              <Btn onClick={() => onConfirm('YELLOW_CARD')} cls="bg-yellow-600 hover:bg-yellow-500 text-black" title="🟨 Amarelo" />
              <Btn onClick={() => onConfirm('RED_CARD')} cls="bg-red-600 hover:bg-red-500 text-white" title="🟥 Vermelho" />
              {inBox && <Btn onClick={() => onConfirm('PENALTY')} cls="bg-emerald-600 hover:bg-emerald-500 text-white" title="Pênalti" sub="Só dentro da área" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
