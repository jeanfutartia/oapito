import { useState } from 'react';
import type { MatchReport, Team } from '../types/types';
import { buildNarrative, humanize, DECISION_LABEL } from '../store/careerLogic';
import { ProBadge } from './ProBadge';
import { VarReplay } from './VarReplay';

interface Props {
  report: MatchReport;
  uefaScore: number;
  isEvaluating: boolean;
  readOnly?: boolean;
  onSignAndContinue?: () => void;
  onClose?: () => void;
}
type Tab = 'SUMULA' | 'TIMELINE' | 'MOMENTOS' | 'DOSSIE' | 'STATS' | 'OBSERVER' | 'MEDIA';
const TABS: [Tab, string][] = [['SUMULA', '📄 Súmula oficial'], ['TIMELINE', '🕒 Linha do tempo'], ['MOMENTOS', '⭐ Melhores momentos'], ['DOSSIE', '🔍 Análise dos lances'], ['STATS', '📊 Estatísticas'], ['OBSERVER', '🧑‍⚖️ Observador'], ['MEDIA', '📺 Debate na TV']];

const StatRow = ({ label, a, b }: { label: string; a: number; b: number }) => {
  const total = a + b || 1;
  return (
    <div className="py-2">
      <div className="flex justify-between text-xs mb-1"><b>{a}</b><span className="text-slate-400">{label}</span><b>{b}</b></div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-800">
        <div className="bg-emerald-500" style={{ width: (a / total) * 100 + '%' }} />
        <div className="bg-cyan-500" style={{ width: (b / total) * 100 + '%' }} />
      </div>
    </div>
  );
};

const miniTeam = (id: string, name: string, short: string, color: string): Team => ({
  id, name, shortName: short, tier: 'SERIE_D', primaryColor: color, secondaryColor: '#ffffff', points: 0, played: 0, won: 0, drawn: 0, lost: 0,
  goalsFor: 0, goalsAgainst: 0, aggressionLevel: 5, attackStrength: 70, defenseStrength: 70, stadiumName: '', managerName: ''
});

export const MatchReportModal = ({ report, uefaScore, isEvaluating, readOnly, onSignAndContinue, onClose }: Props) => {
  const [tab, setTab] = useState<Tab>('SUMULA');
  const [hl, setHl] = useState(0);
  const home = report.homeTeamName;
  const away = report.awayTeamName;
  const hs = report.homeShort ?? home.slice(0, 3).toUpperCase();
  const as2 = report.awayShort ?? away.slice(0, 3).toUpperCase();
  const side = (t: 'HOME' | 'AWAY') => (t === 'HOME' ? hs : as2);
  const yHome = report.cards.filter(c => c.team === 'HOME' && c.cardType === 'YELLOW').length;
  const yAway = report.cards.filter(c => c.team === 'AWAY' && c.cardType === 'YELLOW').length;
  const rHome = report.cards.filter(c => c.team === 'HOME' && c.cardType === 'RED').length;
  const rAway = report.cards.filter(c => c.team === 'AWAY' && c.cardType === 'RED').length;
  const ms = report.matchStats;
  const off = report.officials;
  const lbl = (d: string) => DECISION_LABEL[d] ?? d;
  const nm = (t: 'HOME' | 'AWAY', n: number) => {
    const l = report.lineups?.[t === 'HOME' ? 'home' : 'away']?.[n - 1];
    return l ? ' — ' + l : '';
  };

  const events = [
    ...report.goals.map(g => ({ minute: g.minute, icon: '⚽', cls: 'text-emerald-300', text: (g.isPenalty ? 'Gol de pênalti' : 'Gol') + ' • camisa ' + g.playerNumber + nm(g.team, g.playerNumber) + ' (' + side(g.team) + ')' })),
    ...report.cards.map(c => ({ minute: c.minute, icon: c.cardType === 'RED' ? '🟥' : '🟨', cls: c.cardType === 'RED' ? 'text-red-300' : 'text-yellow-300', text: c.targetLabel + ' (' + side(c.team) + ') — ' + c.reason })),
    ...report.varReviews.map(v => ({ minute: v.minute, icon: '🖥️', cls: 'text-sky-300', text: 'Revisão VAR: ' + v.title + ' → ' + lbl(v.decision) })),
    ...(report.interactionNotes ?? []).map(n => ({ minute: parseInt(n, 10) || 0, icon: '💬', cls: 'text-slate-300', text: n.replace(/^\d+'\s*/, '') })),
    { minute: 45, icon: '⏱️', cls: 'text-slate-500', text: 'Intervalo' },
    { minute: 90, icon: '🏁', cls: 'text-slate-500', text: 'Fim de jogo' }
  ].sort((a, b) => a.minute - b.minute);

  const printSumula = () => {
    setTab('SUMULA');
    setTimeout(() => window.print(), 150);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-start justify-center p-4 z-50 overflow-y-auto">
      <style>{'@media print { body * { visibility: hidden } #sumula-print, #sumula-print * { visibility: visible } #sumula-print { position: absolute; left: 0; top: 0; width: 100%; } }'}</style>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full p-3 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4 font-sans my-6">
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">{readOnly ? 'Arquivo oficial' : 'Pós-jogo homologado'}</span>
            <h2 className="text-lg font-black tracking-tight text-white mt-1">Central do Apito • Súmula e relatório</h2>
            <p className="text-xs text-slate-400">{report.competition ?? 'Campeonato'} • Rodada {report.round ?? '-'} • {report.stadium}</p>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-slate-400 block">Nota final da comissão</span>
            <span className={'text-2xl font-black ' + (uefaScore >= 8.35 ? 'text-emerald-400' : 'text-amber-400')}>{uefaScore.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1"><div className="w-4 h-4 shrink-0 rounded-full border border-white/40" style={{ backgroundColor: report.homeColor ?? '#dc2626' }} /><span className="font-black text-xs sm:text-sm uppercase truncate">{home}</span></div>
          <div className="text-center"><span className="text-2xl sm:text-3xl font-black font-mono tracking-wider">{report.homeScore} x {report.awayScore}</span><span className="block text-[11px] text-emerald-400 font-bold uppercase">{report.dateStr}</span></div>
          <div className="flex items-center justify-end gap-2 min-w-0 flex-1"><span className="font-black text-xs sm:text-sm uppercase truncate">{away}</span><div className="w-4 h-4 shrink-0 rounded-full border border-white/40" style={{ backgroundColor: report.awayColor ?? '#e5e7eb' }} /></div>
        </div>

        {isEvaluating && <div className="bg-indigo-950/70 border border-indigo-700/80 p-3 rounded-xl text-xs text-indigo-200 animate-pulse text-center">⏳ A Central do Apito está analisando a sua atuação…</div>}

        <div className="flex border-b border-slate-800 text-xs font-bold gap-1 overflow-x-auto">
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={'px-3 py-2 border-b-2 whitespace-nowrap transition ' + (tab === id ? 'border-emerald-500 text-emerald-400 bg-slate-800/50 rounded-t' : 'border-transparent text-slate-400 hover:text-slate-200')}>{label}</button>
          ))}
        </div>

        {tab === 'SUMULA' && (
          <div id="sumula-print" className="bg-white text-slate-900 rounded-lg p-3 sm:p-6 text-xs font-serif leading-relaxed overflow-x-auto">
            <div className="text-center border-b-2 border-slate-900 pb-2 mb-3">
              <b className="text-sm tracking-wide">CONFEDERAÇÃO BRASILEIRA DE FUTEBOL • COMISSÃO DE ARBITRAGEM</b><br />
              <b>SÚMULA ELETRÔNICA DA PARTIDA</b>
            </div>
            <table className="w-full mb-3"><tbody>
              <tr><td><b>Competição:</b> {report.competition}</td><td><b>Rodada:</b> {report.round}</td><td><b>Data:</b> {report.dateStr}</td></tr>
              <tr><td><b>Estádio:</b> {report.stadium}</td><td><b>Público:</b> {report.attendance.toLocaleString('pt-BR')}</td><td><b>Resultado:</b> {home} {report.homeScore} x {report.awayScore} {away}</td></tr>
            </tbody></table>
            <b>Equipe de arbitragem</b>
            <table className="w-full mb-3 border border-slate-400"><tbody>
              <tr><td className="border border-slate-300 p-1">Árbitro: <b>{report.refereeName ?? '—'}</b></td><td className="border border-slate-300 p-1">Assistente 1: {off?.assistant1}</td><td className="border border-slate-300 p-1">Assistente 2: {off?.assistant2}</td></tr>
              <tr><td className="border border-slate-300 p-1">Quarto árbitro: {off?.fourth}</td><td className="border border-slate-300 p-1">Árbitro de vídeo (VAR): {off?.var}</td><td className="border border-slate-300 p-1">Assistente do VAR: {off?.avar}</td></tr>
            </tbody></table>
            {report.lineups && (
              <>
                <b>Escalações</b>
                <table className="w-full mb-3 border border-slate-400"><tbody>
                  <tr><td className="border border-slate-300 p-1 font-bold">{home}</td><td className="border border-slate-300 p-1 font-bold">{away}</td></tr>
                  {report.lineups.home.map((n, i) => (
                    <tr key={i}><td className="border border-slate-300 p-1">{i + 1}. {n}</td><td className="border border-slate-300 p-1">{i + 1}. {report.lineups?.away[i]}</td></tr>
                  ))}
                </tbody></table>
              </>
            )}
            <b>Gols</b>
            <table className="w-full mb-3 border border-slate-400"><tbody>
              {report.goals.length === 0 ? <tr><td className="p-1 italic">Sem gols.</td></tr> : report.goals.map((g, i) => (
                <tr key={i}><td className="border border-slate-300 p-1 w-14">{g.minute}'</td><td className="border border-slate-300 p-1">{side(g.team)} — camisa {g.playerNumber}{nm(g.team, g.playerNumber)}</td><td className="border border-slate-300 p-1">{g.isPenalty ? 'Pênalti' : 'Jogo corrido'}</td></tr>
              ))}
            </tbody></table>
            <b>Advertências e expulsões</b>
            <table className="w-full mb-3 border border-slate-400"><tbody>
              {report.cards.length === 0 ? <tr><td className="p-1 italic">Sem cartões.</td></tr> : report.cards.map((c, i) => (
                <tr key={i}><td className="border border-slate-300 p-1 w-14">{c.minute}'</td><td className="border border-slate-300 p-1">{c.cardType === 'RED' ? 'VERMELHO' : 'AMARELO'}</td><td className="border border-slate-300 p-1">{c.targetLabel} ({side(c.team)})</td><td className="border border-slate-300 p-1">{c.reason}</td></tr>
              ))}
            </tbody></table>
            <b>Revisões do VAR</b>
            <table className="w-full mb-3 border border-slate-400"><tbody>
              {report.varReviews.length === 0 ? <tr><td className="p-1 italic">Sem revisões.</td></tr> : report.varReviews.map((v, i) => (
                <tr key={i}><td className="border border-slate-300 p-1 w-14">{v.minute}'</td><td className="border border-slate-300 p-1">{v.title}</td><td className="border border-slate-300 p-1">{lbl(v.decision)}</td></tr>
              ))}
            </tbody></table>
            <b>Relatório do árbitro</b>
            <p className="mb-5 text-justify">{buildNarrative(report)}</p>
            <div className="flex justify-between mt-8 text-center">
              <div className="w-5/12 border-t border-slate-900 pt-1">{report.refereeName ?? 'Árbitro'}<br />Árbitro principal</div>
              <div className="w-5/12 border-t border-slate-900 pt-1">Delegado da partida<br />Comissão de Arbitragem</div>
            </div>
          </div>
        )}

        {tab === 'TIMELINE' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5 max-h-96 overflow-y-auto text-xs">
            {events.map((e, i) => (
              <div key={i} className="flex items-start gap-3 border-b border-slate-800/60 pb-1.5">
                <span className="w-10 font-mono text-slate-500">{e.minute}'</span><span className="w-6">{e.icon}</span><span className={e.cls}>{e.text}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'TIMELINE' && report.matchLog && report.matchLog.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 max-h-72 overflow-y-auto text-xs font-mono">
            <span className="text-[11px] font-black uppercase text-amber-400 mb-1">Narração completa do jogo</span>
            {report.matchLog.map((l, i) => <span key={i} className="text-slate-400">{humanize(l)}</span>)}
          </div>
        )}

        {tab === 'DOSSIE' && (
          <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1 text-xs">
            {report.decisionVerdicts.length === 0 ? <div className="bg-slate-950 p-6 rounded-xl text-center text-slate-500 italic">Nenhum lance decisivo foi julgado nesta partida.</div> : report.decisionVerdicts.map((dv, i) => (
              <div key={i} className={'p-4 rounded-xl border bg-slate-950 flex flex-col gap-2 ' + (dv.isCorrect ? 'border-emerald-800/80' : 'border-red-800/80')}>
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800/80 pb-2">
                  <span className="font-mono"><b className="text-slate-400 mr-2">{dv.minute}'</b><b>{dv.incidentTitle}</b></span>
                  <span className={'px-2.5 py-0.5 rounded text-[10px] font-black ' + (dv.isCorrect ? 'bg-emerald-600' : 'bg-red-600')}>{dv.isCorrect ? '✓ ACERTOU' : '✕ ERRO'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800"><span className="text-slate-400 block text-[10px]">Sua decisão</span><b className="uppercase">{lbl(dv.refereeDecision)}</b></div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800"><span className="text-slate-400 block text-[10px]">Regra oficial</span><b className="text-amber-400 uppercase">{lbl(dv.recommendedDecision)}</b></div>
                </div>
                <p className="text-slate-300 font-mono text-[11px] leading-relaxed">{humanize(dv.geminiAnalysis)}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'STATS' && (
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono">
            <div className="flex justify-between text-xs font-black mb-1"><span className="text-emerald-400">{home}</span><span className="text-cyan-400">{away}</span></div>
            <StatRow label="Posse de bola (%)" a={ms.homePossession} b={ms.awayPossession} />
            <StatRow label="Finalizações" a={ms.homeShots} b={ms.awayShots} />
            <StatRow label="No alvo" a={ms.homeShotsOnTarget} b={ms.awayShotsOnTarget} />
            <StatRow label="Faltas" a={ms.homeFouls} b={ms.awayFouls} />
            <StatRow label="Escanteios" a={ms.homeCorners} b={ms.awayCorners} />
            <StatRow label="Impedimentos" a={ms.homeOffsides} b={ms.awayOffsides} />
            <StatRow label="Cartões amarelos" a={yHome} b={yAway} />
            <StatRow label="Cartões vermelhos" a={rHome} b={rAway} />
          </div>
        )}

        {tab === 'OBSERVER' && (
          <div className="flex flex-col gap-3 text-xs">
            {report.observer ? (
              <>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                  <span className="text-[11px] font-black uppercase text-amber-400">Avaliação por critério • postura: {report.approach?.toLowerCase() ?? '—'}</span>
                  {report.observer.scores.map(s => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="w-44 text-slate-400">{s.label}</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden"><div className={'h-full ' + (s.value >= 8.4 ? 'bg-emerald-500' : s.value >= 7.5 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: s.value * 10 + '%' }} /></div>
                      <b className="w-10 text-right font-mono">{s.value.toFixed(1)}</b>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4"><span className="text-[11px] font-black uppercase text-amber-400 block mb-1">Parecer do observador</span><p className="text-slate-300 leading-relaxed">{report.observer.comment}</p></div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-1"><span className="text-[11px] font-black uppercase text-amber-400 mb-1">Destaques</span>{report.observer.highlights.map((h, i) => <span key={i} className="text-slate-300">• {humanize(h)}</span>)}</div>
              </>
            ) : <div className="bg-slate-950 p-6 rounded-xl text-center text-slate-500 italic">Relatório do observador indisponível para esta partida.</div>}
          </div>
        )}

        {tab === 'MOMENTOS' && (
          <div className="flex flex-col gap-3 text-xs">
            {(report.highlights ?? []).length === 0 ? (
              <div className="bg-slate-950 p-6 rounded-xl text-center text-slate-500 italic">Esta partida não tem melhores momentos gravados.</div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {(report.highlights ?? []).map((h, i) => (
                    <button key={h.id} onClick={() => setHl(i)} className={'px-3 py-1.5 rounded-lg border font-bold transition ' + (hl === i ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700')}>
                      {h.kind === 'GOAL' ? '⚽' : '🖥️'} {h.minute}'
                    </button>
                  ))}
                </div>
                {(() => {
                  const h = (report.highlights ?? [])[Math.min(hl, (report.highlights ?? []).length - 1)];
                  if (!h) return null;
                  return (
                    <>
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3"><b>{h.title}</b><p className="text-slate-400 mt-1">{h.incident.description}</p></div>
                      <VarReplay key={h.id} incident={h.incident}
                        homeTeam={miniTeam('h', home, hs, report.homeColor ?? '#2563eb')}
                        awayTeam={miniTeam('a', away, as2, report.awayColor ?? '#dc2626')} />
                    </>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {tab === 'MEDIA' && (
          <div className="flex flex-col gap-4 text-xs">
            {report.reaction && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-fuchsia-300">Repercussão do jogo</span>
                <p className="text-slate-300">🏟️ {report.reaction.crowd}</p>
                <p className="text-slate-300">📰 {report.reaction.press}</p>
                <div className="flex flex-col gap-1.5 mt-1">
                  {report.reaction.posts.map((p, i) => (
                    <div key={i} className={'rounded-lg border px-3 py-2 ' + (p.tone === 'POSITIVE' ? 'border-emerald-800 bg-emerald-950/20' : p.tone === 'NEGATIVE' ? 'border-red-900 bg-red-950/20' : 'border-slate-800 bg-slate-900')}>
                      <b>{p.who}</b> <span className="text-slate-500">{p.handle}</span>
                      <p className="text-slate-300 mt-0.5">{p.text}</p>
                    </div>
                  ))}
                </div>
                <span className={'font-bold ' + (report.reaction.repDelta >= 0 ? 'text-emerald-400' : 'text-red-400')}>Reputação: {report.reaction.repDelta >= 0 ? '+' : ''}{report.reaction.repDelta}</span>
              </div>
            )}
            {report.mediaMesaRedonda ? (
              <>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">{report.mediaMesaRedonda.programName}</span>
                  <h3 className="text-base font-black text-white italic">"{report.mediaMesaRedonda.headline}"</h3>
                  <span className="text-[11px] font-bold text-emerald-400">Veredito: {report.mediaMesaRedonda.verdictSummary}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><strong className="text-emerald-400">🎙️ Ex-árbitro (Central do Apito)</strong><p className="text-slate-300 leading-relaxed font-mono text-[11px] mt-2">{report.mediaMesaRedonda.refereeExpertAnalysis}</p></div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><strong className="text-cyan-400">📰 Comentarista de TV</strong><p className="text-slate-300 leading-relaxed font-mono text-[11px] mt-2">{report.mediaMesaRedonda.journalistOpinion}</p></div>
                </div>
              </>
            ) : <div className="bg-slate-950 p-6 rounded-xl text-center text-slate-500 italic">Aguardando a bancada esportiva…</div>}
          </div>
        )}

        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button onClick={printSumula} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition">🖨️ Imprimir / salvar PDF <ProBadge label="PRO" /></button>
            <button onClick={() => void navigator.clipboard?.writeText(buildNarrative(report))} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition">📋 Copiar relatório</button>
          </div>
          {readOnly ? (
            <button onClick={onClose} className="w-full sm:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 font-black text-xs uppercase rounded-xl transition">Fechar</button>
          ) : (
            <button onClick={onSignAndContinue} className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-600/30">Assinar súmula e avançar de rodada</button>
          )}
        </div>
      </div>
    </div>
  );
};
