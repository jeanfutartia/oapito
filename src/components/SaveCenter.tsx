import { useRef, useState } from 'react';
import { downloadSave, fmtDate, lastSaved, markSaved, summarizeSave } from '../services/saveFile';
import type { SaveSummary } from '../services/saveFile';

interface BtnProps { onExport: () => string; matches: number; onSaved: () => void; onOpenLoad: () => void; compact?: boolean }

// Botões sempre à mão: Salvar (baixa o arquivo na hora) e Carregar (abre a janela de carregamento).
export const SaveButtons = ({ onExport, matches, onSaved, onOpenLoad, compact }: BtnProps) => {
  const [toast, setToast] = useState('');
  const save = () => {
    try {
      const name = downloadSave(onExport());
      markSaved(matches);
      onSaved();
      setToast('✓ Salvo: ' + name + ' (veja na pasta Downloads)');
      setTimeout(() => setToast(''), 6000);
    } catch { setToast('Não foi possível salvar o arquivo.'); }
  };
  const base = compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs';
  return (
    <>
      <button onClick={save} className={base + ' rounded-lg font-black bg-amber-400 hover:bg-amber-300 text-black'} title="Baixa um arquivo com a sua carreira">💾 Salvar</button>
      <button onClick={onOpenLoad} className={base + ' rounded-lg font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700'} title="Carrega uma carreira de um arquivo">📂 Carregar</button>
      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[80] max-w-[92vw] bg-black border border-amber-400 text-amber-200 text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl">{toast}</div>}
    </>
  );
};

// Aviso na tela inicial quando há jogos ainda não salvos.
export const SaveReminder = ({ matches, onExport, onSaved }: { matches: number; onExport: () => string; onSaved: () => void }) => {
  const last = lastSaved();
  const pending = matches - (last?.matches ?? 0);
  if (matches <= 0 || pending <= 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-400/60 bg-amber-400/10 px-3 py-2 text-xs">
      <span className="text-amber-200">💾 {last ? 'Você apitou ' + pending + ' jogo(s) desde o último arquivo salvo.' : 'Sua carreira ainda não foi salva em arquivo.'} Salve para não perder o progresso.</span>
      <button onClick={() => { downloadSave(onExport()); markSaved(matches); onSaved(); }} className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-black">Salvar agora</button>
    </div>
  );
};

// Janela de carregamento: escolher ou arrastar o arquivo, conferir o resumo e confirmar.
export const LoadDialog = ({ onImport, onClose, hasCareer }: { onImport: (json: string) => boolean; onClose: () => void; hasCareer: boolean }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [json, setJson] = useState<string | null>(null);
  const [sum, setSum] = useState<SaveSummary | null>(null);
  const [err, setErr] = useState('');
  const [drag, setDrag] = useState(false);

  const read = async (f: File | undefined) => {
    if (!f) return;
    const text = await f.text();
    const s = summarizeSave(text);
    if (!s) { setErr('Esse arquivo não é uma carreira válida do O Apito.'); setJson(null); setSum(null); return; }
    setErr(''); setJson(text); setSum(s);
  };
  const confirm = () => {
    if (json && onImport(json)) {
      markSaved(sum?.matches ?? 0);
      onClose();
    } else setErr('Não foi possível carregar este arquivo.');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-[70]" onClick={onClose}>
      <div className="bg-slate-950 border-2 border-amber-400/60 rounded-2xl max-w-md w-full p-4 sm:p-5 text-slate-100 flex flex-col gap-3 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="brand-font text-lg text-white">📂 Carregar <span className="text-amber-400">carreira</span></h2>
          <button onClick={onClose} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold">Fechar</button>
        </div>
        {!sum ? (
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); void read(e.dataTransfer.files?.[0]); }}
            onClick={() => ref.current?.click()}
            className={'cursor-pointer rounded-xl border-2 border-dashed p-6 text-center text-xs transition ' + (drag ? 'border-amber-400 bg-amber-400/10' : 'border-slate-600 hover:border-amber-400/60')}>
            <div className="text-3xl mb-1">📄</div>
            <b className="text-sm text-white">Arraste o arquivo aqui</b>
            <div className="text-slate-400 mt-1">ou clique para escolher o arquivo salvo (.json)</div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-700 bg-black p-3 text-xs flex flex-col gap-1">
            <b className="text-base text-amber-400">{sum.name}</b>
            <span className="text-slate-300">{sum.tier} • Temporada {sum.season} • Jogo {Math.min(6, sum.seasonGame)}/6</span>
            <span className="text-slate-400">{sum.matches} jogo(s) apitado(s) • nota média {sum.avg.toFixed(2)}</span>
            <span className="text-slate-500">Salvo em {fmtDate(sum.savedAt)}</span>
          </div>
        )}
        <input ref={ref} type="file" accept="application/json,.json" className="hidden" onChange={e => { void read(e.target.files?.[0]); if (ref.current) ref.current.value = ''; }} />
        {err && <span className="text-xs font-bold text-red-400">{err}</span>}
        {sum && hasCareer && <span className="text-[11px] text-amber-300">Atenção: isso substitui a carreira que está aberta agora. Salve ela antes se quiser guardar.</span>}
        <div className="flex gap-2">
          {sum && <button onClick={confirm} className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-sm">Carregar esta carreira</button>}
          {sum && <button onClick={() => { setSum(null); setJson(null); }} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold">Outro arquivo</button>}
        </div>
      </div>
    </div>
  );
};
