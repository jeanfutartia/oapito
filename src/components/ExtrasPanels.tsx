import { useRef, useState } from 'react';
import type { Difficulty, Rival, SeasonGoal, Team, Trait, MatchReport } from '../types/types';
import { DIFFICULTY, TRAIT_ICON, TRAIT_LABEL, evaluateGoals, goalProgressText, grudgeColor, grudgeLabel, rankingWith } from '../store/careerExtras';

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

export const SaveFilePanel = ({ onExport, onImport }: { onExport: () => string; onImport: (json: string) => boolean }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const save = () => {
    try {
      const blob = new Blob([onExport()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'o-apito-carreira-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Arquivo salvo. Guarde-o em um lugar seguro.');
    } catch { setMsg('Não foi possível salvar o arquivo.'); }
  };
  const load = async (f: File | undefined) => {
    if (!f) return;
    const ok = onImport(await f.text());
    setMsg(ok ? 'Carreira carregada com sucesso!' : 'Esse arquivo não é uma carreira válida do O Apito.');
    if (ref.current) ref.current.value = '';
  };
  return (
    <Card title="💾 Salvar carreira em arquivo">
      <p className="text-xs text-slate-400">O jogo já salva sozinho neste navegador. Para não perder o progresso ou jogar em outro aparelho, salve a carreira em um arquivo e carregue depois.</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={save} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold">⬇ Salvar em arquivo</button>
        <button onClick={() => ref.current?.click()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold">⬆ Carregar arquivo</button>
        <input ref={ref} type="file" accept="application/json,.json" className="hidden" onChange={e => { void load(e.target.files?.[0]); }} />
      </div>
      {msg && <span className="text-xs text-amber-300">{msg}</span>}
    </Card>
  );
};

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
