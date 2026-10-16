import { useEffect, useMemo, useRef, useState } from 'react';
import type { Incident, DecisionType, RadioChatMessage } from '../types/types';
import { PitchRadarMap } from './PitchRadarMap';
import { RADIO_CATS, NOT_UNDERSTOOD, matchQuestion, questionsFor, radioAnswer, radioOpening } from '../mock/varRadioBank';
import type { RadioCat, RadioQuestion } from '../mock/varRadioBank';

interface Props {
  incident: Incident;
  onGoToOFR: () => void;
  onKeepFieldDecision: (decision: DecisionType) => void;
}

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

export const VARRadioModal = ({ incident, onGoToOFR, onKeepFieldDecision }: Props) => {
  const questions = useMemo(() => questionsFor(incident), [incident]);
  const cats = useMemo(() => (Object.keys(RADIO_CATS) as RadioCat[]).filter(c => questions.some(q => q.cat === c)), [questions]);
  const [cat, setCat] = useState<RadioCat>('GERAL');
  const [messages, setMessages] = useState<RadioChatMessage[]>([]);
  const [asked, setAsked] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(true);
  const bottom = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setThinking(true);
    const t = setTimeout(() => { setMessages([{ sender: 'VAR', text: radioOpening(incident) }]); setThinking(false); }, 500);
    return () => clearTimeout(t);
  }, [incident]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);

  const ask = (q: RadioQuestion) => {
    if (thinking) return;
    setAsked(a => (a.includes(q.id) ? a : [...a, q.id]));
    setMessages(m => [...m, { sender: 'REF', text: q.send }]);
    setThinking(true);
    setTimeout(() => { setMessages(m => [...m, { sender: 'VAR', text: radioAnswer(q, incident) }]); setThinking(false); }, 600 + Math.random() * 500);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const typed = text.trim();
    if (!typed || thinking) return;
    setText('');
    const q = matchQuestion(typed, questions);
    if (q) { ask(q); return; }
    setMessages(m => [...m, { sender: 'REF', text: typed }]);
    setThinking(true);
    setTimeout(() => { setMessages(m => [...m, { sender: 'VAR', text: pick(NOT_UNDERSTOOD) }]); setThinking(false); }, 500);
  };

  const list = questions.filter(q => q.cat === (cats.includes(cat) ? cat : cats[0]));
  const done = asked.length >= 3;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[96vh] overflow-y-auto p-4 sm:p-6 shadow-2xl flex flex-col gap-3 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-base font-black tracking-wide text-white uppercase">Falando com o VAR (rádio)</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Canal oficial</span>
        </div>

        <PitchRadarMap zone={incident.pitchZone} />

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 min-h-[150px] max-h-[230px] overflow-y-auto flex flex-col gap-3 font-mono text-xs">
          {messages.map((msg, i) => (
            <div key={i} className={'p-3 rounded-xl max-w-[88%] ' + (msg.sender === 'VAR' ? 'bg-slate-900 border border-slate-800 text-slate-200 self-start' : 'bg-emerald-950/80 border border-emerald-700 text-emerald-100 self-end')}>
              <span className={'block font-bold text-[10px] mb-1 ' + (msg.sender === 'VAR' ? 'text-amber-400' : 'text-emerald-400')}>{msg.sender === 'VAR' ? 'SALA DO VAR:' : 'VOCÊ (ÁRBITRO):'}</span>
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
            </div>
          ))}
          {thinking && (
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl max-w-[80%] self-start flex items-center gap-2 text-amber-300">
              <span className="animate-spin text-sm">⏳</span><span>O VAR está revendo as câmeras...</span>
            </div>
          )}
          <div ref={bottom} />
        </div>

        <div className="flex gap-1.5 overflow-x-auto text-xs font-bold border-b border-slate-800">
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)} className={'px-3 py-2 border-b-2 whitespace-nowrap transition ' + ((cats.includes(cat) ? cat : cats[0]) === c ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200')}>{RADIO_CATS[c]}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {list.map(q => (
            <button key={q.id} disabled={thinking} onClick={() => ask(q)} className={'p-2 rounded-lg text-[11px] font-semibold border text-left transition disabled:opacity-50 ' + (asked.includes(q.id) ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200')}>
              {asked.includes(q.id) ? '✓ ' : ''}{q.send}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex gap-2">
          <input type="text" disabled={thinking} placeholder="Ou digite sua pergunta. Ex.: 'Houve contato?'" value={text} onChange={e => setText(e.target.value)}
            className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono" />
          <button type="submit" disabled={thinking || !text.trim()} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition">Enviar</button>
        </form>
        <p className="text-[10px] text-slate-500">{asked.length} de {questions.length} perguntas feitas{done ? ' • você já tem informação suficiente para decidir.' : '.'}</p>

        <div className="border-t border-slate-800 pt-3 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <button onClick={() => onKeepFieldDecision('PLAY_ON')} className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition border border-slate-700">Manter minha decisão (sem revisão)</button>
          <button onClick={onGoToOFR} className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30">🖥️ Revisar no monitor</button>
        </div>
      </div>
    </div>
  );
};
