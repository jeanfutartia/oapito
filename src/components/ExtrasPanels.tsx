import { useState } from 'react';
import type { Difficulty, Rival, SeasonGoal, Team, Trait, MatchReport } from '../types/types';
import { DIFFICULTY, TRAIT_ICON, TRAIT_LABEL, evaluateGoals, goalProgressText, grudgeColor, grudgeLabel, rankingWith } from '../store/careerExtras';
import { CITY_OPTIONS, cityLabel } from '../mock/geo';
import { SaveButtons } from './SaveCenter';

const Card = ({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>
      {right}
    </div>
    {children}
  </div>
);

export const GoalsPanel = ({ goals, seasonReports, season }: { goals: SeasonGoal[]; seasonReports: MatchReport[]; season: number }) => {
  const st = evaluateGoals(goals, seasonReports, false);
  return (
    <Card title={'🎯 Metas da temporada ' + season}>
      {goals.map(g => {
        const s = st.find(x => x.id === g.id);
        return (
          <div key={g.id} className={'rounded-xl border p-3 text-xs flex flex-col gap-1 ' + (s?.done ? 'border-emerald-600 bg-emerald-950/30' : s?.failed ? 'border-red-800 bg-red-950/20' : 'border-slate-800 bg-slate-950')}>
            <b className="text-sm">{g.label}</b>
            <span className="text-slate-400">{g.hint}</span>
            <div className="flex justify-between text-[11px]"><span className="text-slate-300">{goalProgressText(g, s)}</span><span className="text-amber-300">Prêmio: R$ {g.reward.toLocaleString()} + {g.repReward} reputação</span></div>
          </div>
        );
      })}
      <p className="text-[11px] text-slate-500">Os prêmios são pagos no fim da temporada, quando a sexta rodada termina.</p>
    </Card>
  );
};

export const RivalsPanel = ({ rivals, name, avg }: { rivals: Rival[]; name: string; avg: number }) => {
  const list = rankingWith(rivals, name, avg);
  return (
    <Card title="🏅 Ranking de árbitros" right={<span className="text-[10px] text-slate-500">muda a cada rodada</span>}>
      {list.map((r, i) => (
        <div key={r.name} className={'flex justify-between text-xs py-1 border-b border-slate-800/80 ' + (r.you ? 'text-emerald-300 font-bold' : '')}>
          <span><span className="w-5 inline-block text-slate-500 font-mono">{i + 1}</span>{r.name}{r.you ? ' (você)' : ''}</span>
          <span className="font-mono">{r.avg.toFixed(2)}</span>
        </div>
      ))}
    </Card>
  );
};

export const GrudgeChips = ({ grudges, home, away }: { grudges: Record<string, number>; home: Team; away: Team }) => (
  <div className="flex flex-wrap gap-2 text-[11px]">
    {[home, away].map(t => {
      const v = grudges[t.id] ?? 0;
      return <span key={t.id} className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800" title="O quanto o clube está contrariado com suas últimas decisões">{t.shortName}: <b className={grudgeColor(v)}>{grudgeLabel(v)}</b></span>;
    })}
  </div>
);

export const GrudgePanel = ({ grudges, teams }: { grudges: Record<string, number>; teams: Team[] }) => {
  const list = Object.entries(grudges).map(([id, v]) => ({ t: teams.find(x => x.id === id), v })).filter(x => x.t).sort((a, b) => b.v - a.v).slice(0, 6);
  return (
    <Card title="😠 Relação com os clubes">
      {list.length === 0 ? <p className="text-xs text-slate-400">Nenhum clube está contrariado com você. Continue assim!</p> : list.map(x => (
        <div key={x.t?.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
          <span>{x.t?.name}</span><b className={grudgeColor(x.v)}>{grudgeLabel(x.v)}</b>
        </div>
      ))}
      <p className="text-[11px] text-slate-500">Decisões erradas contra um clube deixam ele contrariado. Isso esquenta os próximos jogos dele e rende perguntas duras na coletiva.</p>
    </Card>
  );
};

export const DifficultyPanel = ({ value, onChange, locked }: { value: Difficulty; onChange: (d: Difficulty) => void; locked: boolean }) => (
  <Card title="🎚️ Nível de dificuldade">
    <div className="grid grid-cols-3 gap-2">
      {(Object.keys(DIFFICULTY) as Difficulty[]).map(d => (
        <button key={d} disabled={locked} onClick={() => onChange(d)} className={'p-2 rounded-lg border text-xs font-bold transition disabled:opacity-50 ' + (value === d ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700')}>{DIFFICULTY[d].label}</button>
      ))}
    </div>
    <p className="text-[11px] text-slate-400">{DIFFICULTY[value].desc}</p>
  </Card>
);

export const SaveFilePanel = ({ onExport, matches, onSaved, onOpenLoad }: { onExport: () => string; matches: number; onSaved: () => void; onOpenLoad: () => void }) => (
  <Card title="💾 Salvar e carregar carreira">
    <p className="text-xs text-slate-400">O jogo já guarda sozinho neste navegador. Para não perder o progresso ou jogar em outro aparelho, clique em <b className="text-slate-200">Salvar</b>: ele baixa um arquivo com o seu nome, a temporada e a data. Depois é só clicar em <b className="text-slate-200">Carregar</b> e escolher esse arquivo.</p>
    <div className="flex flex-wrap gap-2">
      <SaveButtons onExport={onExport} matches={matches} onSaved={onSaved} onOpenLoad={onOpenLoad} />
    </div>
    <span className="text-[10px] text-slate-500">Dica: guarde o arquivo no Google Drive ou no e-mail para ter em qualquer lugar.</span>
  </Card>
);

export const WatchList = ({ roster, traits, foulCounts, yellowCounts, teamName }: {
  roster: string[]; traits: Trait[]; foulCounts: number[]; yellowCounts: number[]; teamName: string;
}) => {
  const rows = traits.map((t, i) => ({ t, i })).filter(x => x.t !== 'NORMAL');
  return (
    <div className="flex flex-col gap-1">
      <b className="text-[11px] text-slate-300">{teamName}</b>
      {rows.map(({ t, i }) => (
        <div key={i} className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
          <span className="truncate">{TRAIT_ICON[t]} {roster[i] ?? 'Camisa ' + (i + 1)} <span className="text-slate-600">#{i + 1}</span></span>
          <span className="shrink-0 text-slate-500">{TRAIT_LABEL[t]}{foulCounts[i] > 0 ? ' • ' + foulCounts[i] + ' falta(s)' : ''}{yellowCounts[i] > 0 ? ' 🟨' : ''}</span>
        </div>
      ))}
    </div>
  );
};


export const ResidencePanel = ({ city, balance, movedThisSeason, onMove }: { city: string; balance: number; movedThisSeason: boolean; onMove: (key: string) => { ok: boolean; msg: string } }) => {
  const [sel, setSel] = useState(city);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-2">
      <h2 className="text-sm font-bold uppercase tracking-wide">🏠 Onde você mora</h2>
      <p className="text-[11px] text-slate-400">Moradia atual: <b className="text-slate-100">{cityLabel(city)}</b>. As viagens são calculadas a partir daqui: até cerca de 450 km vai de carro, acima disso de avião.</p>
      <div className="flex flex-wrap gap-2">
        <select value={sel} onChange={e => { setSel(e.target.value); setMsg(null); }} className="flex-1 min-w-[180px] bg-black border border-slate-700 rounded-lg p-2 text-xs text-slate-100">
          {CITY_OPTIONS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
        <button disabled={movedThisSeason || sel === city || balance < 500} onClick={() => { const r = onMove(sel); setMsg({ ok: r.ok, text: r.msg }); }}
          className="px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-black text-xs font-black">Mudar (R$ 500)</button>
      </div>
      <span className="text-[10px] text-slate-500">{movedThisSeason ? 'Você já se mudou nesta temporada.' : 'Uma mudança por temporada.'}</span>
      {msg && <span className={'text-[11px] font-bold ' + (msg.ok ? 'text-emerald-400' : 'text-red-400')}>{msg.text}</span>}
    </div>
  );
};
