import { Logo } from './GuidePage';
import { TIER_NAME } from '../services/saveFile';

interface Props {
  hasCareer: boolean;
  name: string; tier: string; season: number; seasonGame: number; matches: number; avg: number;
  onContinue: () => void;
  onNew: () => void;
  onLoad: () => void;
  onHelp: () => void;
  onGuide: () => void;
}

const Big = ({ onClick, children, primary }: { onClick: () => void; children: React.ReactNode; primary?: boolean }) => (
  <button onClick={onClick}
    className={'w-full py-3.5 rounded-xl brand-font text-base sm:text-lg transition active:scale-[0.98] ' + (primary
      ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-500/25'
      : 'bg-black/70 hover:bg-slate-900 border border-slate-600 hover:border-amber-400/70 text-white')}>
    {children}
  </button>
);

export const StartScreen = ({ hasCareer, name, tier, season, seasonGame, matches, avg, onContinue, onNew, onLoad, onHelp, onGuide }: Props) => (
  <div className="relative min-h-[100dvh] bg-black text-slate-100 flex flex-col items-center justify-center overflow-hidden px-4 py-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
    <div className="absolute inset-0 opacity-[0.13] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(135deg, #facc15 0 2px, transparent 2px 22px)' }} />
    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(250,204,21,0.14), transparent 60%)' }} />
    <div className="relative w-full max-w-sm flex flex-col items-center gap-5">
      <Logo size={260} className="w-[min(68vw,260px)] h-auto aspect-square mix-blend-screen rounded-none" />
      <div className="w-full flex flex-col gap-2.5">
        {hasCareer ? (
          <>
            <div className="rounded-xl border border-amber-400/40 bg-black/70 px-3 py-2.5 text-xs flex flex-col gap-0.5">
              <b className="text-amber-400 text-sm">{name}</b>
              <span className="text-slate-300">{TIER_NAME[tier] ?? 'Série D'} • Temporada {season} • Jogo {Math.min(6, seasonGame)}/6</span>
              <span className="text-slate-500">{matches} jogo(s) apitado(s) • nota média {avg.toFixed(2)}</span>
            </div>
            <Big primary onClick={onContinue}>▶ Continuar carreira</Big>
            <Big onClick={onNew}>Nova carreira</Big>
          </>
        ) : (
          <Big primary onClick={onNew}>▶ Novo jogo</Big>
        )}
        <Big onClick={onLoad}>📂 Carregar arquivo salvo</Big>
        <div className="grid grid-cols-2 gap-2.5">
          <Big onClick={onGuide}>📘 Como jogar</Big>
          <Big onClick={onHelp}>❓ Ajuda rápida</Big>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 text-center">Grátis • roda no navegador • seu progresso fica salvo neste aparelho</p>
    </div>
  </div>
);
