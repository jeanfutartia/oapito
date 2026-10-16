import type { Fixture, Team, InboxMessage, SeasonRecord, MatchReport, RefereeProfile, RefereeStyle } from '../types/types';
import { computeStandings, computeAchievements, roundDate, CHAMPIONSHIP, tierLabel } from '../store/careerLogic';
import type { StandingRow } from '../store/careerLogic';

const Card = ({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>
      {right}
    </div>
    {children}
  </div>
);

const FormChip = ({ r }: { r: 'W' | 'D' | 'L' }) => (
  <span className={'w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white ' + (r === 'W' ? 'bg-emerald-600' : r === 'D' ? 'bg-slate-500' : 'bg-red-600')}>
    {r === 'W' ? 'V' : r === 'D' ? 'E' : 'D'}
  </span>
);

export const StandingsTable = ({ rows, compact }: { rows: StandingRow[]; compact?: boolean }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs font-mono">
      <thead>
        <tr className="text-slate-500 text-[10px] uppercase">
          <th className="text-left py-1 w-6">#</th><th className="text-left">Clube</th>
          <th>J</th>{!compact && <><th>V</th><th>E</th><th>D</th><th className="hidden sm:table-cell">GP</th><th className="hidden sm:table-cell">GC</th></>}<th>SG</th><th>Pts</th>{!compact && <th className="text-left pl-3 hidden md:table-cell">Forma</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.team.id} className={'border-t border-slate-800/80 text-center ' + (i === 0 ? 'bg-amber-500/10' : i === rows.length - 1 ? 'bg-red-500/10' : '')}>
            <td className="text-left py-1.5 text-slate-500">{i + 1}</td>
            <td className="text-left font-sans font-semibold">
              <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle border border-white/30" style={{ backgroundColor: r.team.primaryColor }} />
              {compact ? r.team.shortName : r.team.name}
            </td>
            <td>{r.p}</td>
            {!compact && <><td>{r.w}</td><td>{r.d}</td><td>{r.l}</td><td className="hidden sm:table-cell">{r.gf}</td><td className="hidden sm:table-cell">{r.ga}</td></>}
            <td className={r.gd > 0 ? 'text-emerald-400' : r.gd < 0 ? 'text-red-400' : ''}>{r.gd > 0 ? '+' : ''}{r.gd}</td>
            <td className="font-black text-white">{r.pts}</td>
            {!compact && <td className="text-left pl-3 hidden md:table-cell"><span className="flex gap-1">{r.form.map((f, k) => <FormChip key={k} r={f} />)}</span></td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const TablePanel = ({ fixtures, teams, tier, season, compact }: { fixtures: Fixture[]; teams: Team[]; tier: string; season: number; compact?: boolean }) => {
  const rows = computeStandings(fixtures, teams);
  const played = fixtures.filter(f => f.played).length;
  return (
    <Card title={compact ? 'Classificação • ' + tierLabel(tier) : CHAMPIONSHIP[tier] + ' • Temporada ' + season}
      right={<span className="text-[10px] text-slate-500 font-mono">{played}/{fixtures.length} jogos</span>}>
      <StandingsTable rows={rows} compact={compact} />
      {!compact && (
        <div className="flex gap-4 text-[10px] text-slate-500">
          <span><span className="inline-block w-2 h-2 bg-amber-500/60 mr-1" />Líder</span>
          <span><span className="inline-block w-2 h-2 bg-red-500/60 mr-1" />Lanterna</span>
        </div>
      )}
    </Card>
  );
};

export const CalendarPanel = ({ fixtures, teams, round, season }: { fixtures: Fixture[]; teams: Team[]; round: number; season: number }) => {
  const byId = (id: string) => teams.find(t => t.id === id);
  const rounds = [1, 2, 3, 4, 5, 6];
  return (
    <Card title={'Calendário • Temporada ' + season} right={<span className="text-xs text-emerald-400 font-bold">Rodada atual: {round}/6</span>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rounds.map(rn => {
          const list = fixtures.filter(f => f.round === rn);
          const done = list.length > 0 && list.every(f => f.played);
          const current = rn === round;
          return (
            <div key={rn} className={'rounded-xl border p-3 flex flex-col gap-1.5 ' + (current ? 'border-emerald-500 bg-emerald-950/30' : 'border-slate-800 bg-slate-950')}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-black">Rodada {rn} <span className="text-slate-500 font-mono font-normal">• {roundDate(season, rn)}</span></span>
                <span className={'text-[10px] font-bold px-2 py-0.5 rounded ' + (done ? 'bg-slate-800 text-slate-400' : current ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500')}>
                  {done ? 'Concluída' : current ? 'Próxima' : 'Futura'}
                </span>
              </div>
              {list.map(f => {
                const h = byId(f.homeId);
                const a = byId(f.awayId);
                return (
                  <div key={f.id} className={'flex items-center justify-between text-xs rounded-lg px-2 py-1.5 ' + (f.refMatch ? 'bg-amber-500/10 border border-amber-600/50' : 'bg-slate-900')}>
                    <span className="flex-1 text-right truncate">{h?.name}</span>
                    <span className="mx-2 font-mono font-black w-14 text-center">{f.played ? f.homeScore + ' x ' + f.awayScore : 'x'}</span>
                    <span className="flex-1 truncate">{a?.name}</span>
                    {f.refMatch && <span title="Você apita" className="ml-1">🏁</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <span className="text-[10px] text-slate-500">🏁 = partida que você apita • demais resultados são simulados pela federação</span>
    </Card>
  );
};

const APPROACHES: { id: RefereeStyle; icon: string; title: string; desc: string }[] = [
  { id: 'DIALOGADOR', icon: '🗣️', title: 'Dialogador', desc: 'Conversa antes de punir. Reduz protestos de técnicos e capitães (-30%).' },
  { id: 'PREVENTIVO', icon: '⏱️', title: 'Preventivo', desc: 'Apito rápido corta o jogo sujo cedo. Menos protestos (-15%).' },
  { id: 'DISCIPLINADOR', icon: '🧱', title: 'Disciplinador', desc: 'Firme e neutro. Protestos em frequência normal.' },
  { id: 'RIGOROSO', icon: '🟨', title: 'Rigoroso', desc: 'Cartão fácil. Mais protestos (+15%), mas passa autoridade.' }
];

export const BriefingPanel = ({ approach, onChange }: { approach: RefereeStyle; onChange: (a: RefereeStyle) => void }) => (
  <Card title="📋 Conversa antes do jogo" right={<span className="text-[10px] text-slate-500">Escolha como você vai arbitrar</span>}>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {APPROACHES.map(a => (
        <button key={a.id} onClick={() => onChange(a.id)}
          className={'p-3 rounded-xl border text-left transition ' + (approach === a.id ? 'border-emerald-500 bg-emerald-950/40' : 'border-slate-800 bg-slate-950 hover:border-slate-600')}>
          <span className="block text-sm font-bold">{a.icon} {a.title}</span>
          <span className="block text-[10px] text-slate-400 mt-1 leading-snug">{a.desc}</span>
        </button>
      ))}
    </div>
  </Card>
);

export const InboxPanel = ({ inbox, onRead }: { inbox: InboxMessage[]; onRead: () => void }) => {
  const unread = inbox.filter(m => !m.read).length;
  return (
    <Card title={'📬 Caixa de entrada' + (unread ? ' (' + unread + ')' : '')}
      right={unread ? <button onClick={onRead} className="text-[10px] px-2 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700">Marcar como lidas</button> : undefined}>
      {inbox.length === 0 ? <p className="text-xs text-slate-500 italic">Nenhuma mensagem ainda. Apite sua primeira partida!</p> : (
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {inbox.slice(0, 8).map(m => (
            <div key={m.id} className={'rounded-xl border p-3 text-xs ' + (m.tone === 'POSITIVE' ? 'border-emerald-800 bg-emerald-950/30' : m.tone === 'NEGATIVE' ? 'border-red-900 bg-red-950/30' : 'border-slate-800 bg-slate-950')}>
              <div className="flex justify-between gap-2">
                <strong>{!m.read && <span className="text-amber-400 mr-1">●</span>}{m.subject}</strong>
                <span className="text-slate-500 whitespace-nowrap">Sem. {m.week}</span>
              </div>
              <span className="text-[10px] text-slate-500">{m.from}</span>
              <p className="text-slate-300 mt-1 leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

const RIVALS: [string, number][] = [['Anderson Vidal', 9.12], ['Leandro Prado', 8.94], ['Marcos Teixeira', 8.71], ['Rogério Faria', 8.55], ['Diego Nunes', 8.32], ['Eduardo Brandão', 8.1], ['Tiago Moura', 7.85]];
export const RankingPanel = ({ name, avg }: { name: string; avg: number }) => {
  const list = [...RIVALS, [name, avg] as [string, number]].sort((a, b) => b[1] - a[1]);
  return (
    <Card title="🏅 Ranking de árbitros">
      {list.map(([n, v], i) => (
        <div key={n} className={'flex justify-between text-xs py-1 border-b border-slate-800/80 ' + (n === name ? 'text-emerald-300 font-bold' : '')}>
          <span><span className="w-5 inline-block text-slate-500 font-mono">{i + 1}</span>{n}</span>
          <span className="font-mono">{v.toFixed(2)}</span>
        </div>
      ))}
    </Card>
  );
};

const TRAINING = [
  { id: 'PHYSICAL', label: '🏃 Físico', hint: '+3 condição física' },
  { id: 'RULES', label: '📖 Regras', hint: '+3 conhecimento' },
  { id: 'PSYCHOLOGY', label: '🧠 Psicologia', hint: '+3 resistência, +1 autoridade' },
  { id: 'REST', label: '😴 Descanso', hint: '+1 físico, +2 resistência' }
] as const;

const Bar = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-2 text-[11px]">
    <span className="w-32 text-slate-400">{label}</span>
    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all" style={{ width: value + '%' }} /></div>
    <span className="w-7 text-right font-mono text-slate-300">{value}</span>
  </div>
);

export const TrainingPanel = ({ referee, points, onSpend }: { referee: RefereeProfile; points: number; onSpend: (t: 'PHYSICAL' | 'RULES' | 'PSYCHOLOGY' | 'REST') => void }) => (
  <Card title="Treino da semana" right={<span className="text-xs font-mono text-amber-400">{points} ponto(s) de ação</span>}>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {TRAINING.map(t => (
        <button key={t.id} disabled={points <= 0} onClick={() => onSpend(t.id)} className="p-3 bg-slate-950 border border-slate-800 hover:border-emerald-600 disabled:opacity-40 rounded-xl text-left transition">
          <span className="block text-xs font-bold">{t.label}</span><span className="block text-[10px] text-slate-500">{t.hint}</span>
        </button>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
      <Bar label="Condição física" value={referee.attributes.physicalCondition} />
      <Bar label="Conhec. de regras" value={referee.attributes.ruleKnowledge} />
      <Bar label="Resist. ao estresse" value={referee.attributes.stressResistance} />
      <Bar label="Autoridade" value={referee.attributes.authority} />
      <Bar label="Integridade" value={referee.attributes.integrity} />
    </div>
  </Card>
);

export const CareerPanel = ({ referee, history, seasons }: { referee: RefereeProfile; history: MatchReport[]; seasons: SeasonRecord[] }) => {
  const ach = computeAchievements(history, seasons);
  const last = [...history].slice(0, 10).reverse();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 flex flex-col gap-5">
        <Card title="Perfil do árbitro">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center text-3xl">🧑‍⚖️</div>
            <div>
              <h3 className="text-lg font-black">{referee.name}</h3>
              <p className="text-xs text-slate-400">{referee.age} anos • {referee.federation} • estilo {referee.style.toLowerCase()}</p>
              <p className="text-xs text-emerald-400 font-bold">{tierLabel(referee.tier)} • reputação {referee.reputation}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs font-mono">
            {[['Jogos', referee.stats.matches], ['🟨', referee.stats.yellowCards], ['🟥', referee.stats.redCards], ['Pênaltis', referee.stats.penalties], ['VAR', referee.stats.varInterventions]].map(([l, v]) => (
              <div key={String(l)} className="bg-slate-950 border border-slate-800 rounded-xl py-2"><span className="block text-slate-500 text-[10px]">{l}</span><b className="text-base">{v}</b></div>
            ))}
          </div>
        </Card>
        <Card title="Evolução das notas (últimos 10 jogos)">
          {last.length === 0 ? <p className="text-xs text-slate-500 italic">Sem jogos ainda.</p> : (
            <div className="flex items-end gap-2 h-28">
              {last.map(h => (
                <div key={h.id} className="flex-1 flex flex-col items-center gap-1" title={h.homeTeamName + ' x ' + h.awayTeamName}>
                  <span className="text-[10px] font-mono text-slate-400">{h.uefaScore.toFixed(1)}</span>
                  <div className={'w-full rounded-t ' + (h.uefaScore >= 8.4 ? 'bg-emerald-500' : h.uefaScore >= 7.5 ? 'bg-amber-500' : 'bg-red-500')} style={{ height: Math.max(8, (h.uefaScore - 4) * 14) + 'px' }} />
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Temporadas">
          {seasons.length === 0 ? <p className="text-xs text-slate-500 italic">Conclua 6 jogos para fechar a primeira temporada.</p> : seasons.map(s => (
            <div key={s.season} className="flex items-center justify-between text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
              <span><b>Temporada {s.season}</b> • {tierLabel(s.tier)} • campeão: {s.champion}</span>
              <span className="font-mono">média {s.avg.toFixed(2)} <span className={'ml-2 font-black ' + (s.outcome === 'PROMOVIDO' ? 'text-emerald-400' : s.outcome === 'REBAIXADO' ? 'text-red-400' : 'text-slate-400')}>{s.outcome}</span></span>
            </div>
          ))}
        </Card>
      </div>
      <Card title={'🏆 Conquistas (' + ach.filter(a => a.unlocked).length + '/' + ach.length + ')'}>
        {ach.map(a => (
          <div key={a.id} className={'flex items-center gap-3 rounded-xl border px-3 py-2 text-xs ' + (a.unlocked ? 'border-amber-600/60 bg-amber-500/10' : 'border-slate-800 bg-slate-950 opacity-50')}>
            <span className="text-xl">{a.unlocked ? a.icon : '🔒'}</span>
            <div><b className="block">{a.title}</b><span className="text-[10px] text-slate-400">{a.desc}</span></div>
          </div>
        ))}
      </Card>
    </div>
  );
};
