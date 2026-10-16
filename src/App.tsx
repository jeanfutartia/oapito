import { useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { PitchCanvas } from './components/PitchCanvas';
import { VARModal } from './components/VARModal';
import { VARRadioModal } from './components/VARRadioModal';
import { ProfileModal } from './components/ProfileModal';
import { MatchReportModal } from './components/MatchReportModal';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { ManagerIncidentModal } from './components/ManagerIncidentModal';
import { CaptainTalkModal } from './components/CaptainTalkModal';
import { PressConferenceModal } from './components/PressConferenceModal';
import { MatchStatsSidebar } from './components/MatchStatsSidebar';
import { GoalCelebrationOverlay } from './components/GoalCelebrationOverlay';
import { SmartRefereeDashboard } from './components/SmartRefereeDashboard';
import { PenaltyKickModal } from './components/PenaltyKickModal';
import { HelpModal } from './components/HelpModal';
import { GuidePage, Logo } from './components/GuidePage';
import { PlansModal } from './components/PlansModal';
import { BriefingPanel, CalendarPanel, CareerPanel, InboxPanel, TablePanel, TrainingPanel } from './components/HomePanels';
import { CareerEventModal } from './components/CareerEventModal';
import { TipBanner, LessonCard } from './components/GuideWidgets';
import { GoalsPanel, RivalsPanel, GrudgeChips, GrudgePanel, DifficultyPanel, SaveFilePanel, WatchList } from './components/ExtrasPanels';
import { HINTS, DIFFICULTY } from './store/careerExtras';
import { CHAMPIONSHIP, roundDate, tierLabel, fmtMinute, WEATHER_LABEL, humanize } from './store/careerLogic';
import { soundEffects } from './services/soundEffects';

const TWISTS = ['Invasão de campo por torcedor', 'Confusão generalizada entre jogadores', 'Objetos arremessados da arquibancada'];
type Tab = 'INICIO' | 'CALENDARIO' | 'TABELA' | 'CARREIRA' | 'GUIA';
const TABS: [Tab, string][] = [['INICIO', '🏠 Início'], ['CALENDARIO', '📅 Calendário'], ['TABELA', '🏆 Tabela'], ['CARREIRA', '🧑‍⚖️ Carreira'], ['GUIA', '📘 Guia e Sobre']];

export function App() {
  const [showHistory, setShowHistory] = useState(false);
  const [tab, setTab] = useState<Tab>('INICIO');
  const [muted, setMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [paused, setPaused] = useState(true);
  const [showPlans, setShowPlans] = useState(false);
  const {
    isProfileCreated, season, seasonGame, actionPoints, referee, teams, fixtures, seasonHistory, inbox, approach, matchHistory,
    nextMatchSchedule, careerNews, currentManagerIncident, captainTalk, pressConference, currentGoalAnimation, gameTwistUsed,
    isEvaluatingPostMatch, homeManagerEjected, awayManagerEjected, liveStats, activeMatch, pitchFx, penaltyKick,
    grudges, difficulty, seasonGoals, rivals, careerEvent, tip, lesson, declinesUsed,
    setDifficulty, answerCareerEvent, dismissTip, dismissLesson, declineAssignment, exportCareer, importCareer,
    createProfile, startScheduledMatch, startSecondHalf, triggerGameTwistAction, clearGoalAnimation, updateMatchMinute, setMatchSpeed,
    triggerInstantFieldDecision, openVarRadioIntercom, openVarMonitorOFR, confirmFinalDecision, resolveManagerIncident,
    resolveCaptainTalk, answerPress, markInboxRead, setApproach, finishMatch, spendActionPoint, strongWhistle, fixPenalty, kickPenalty, drawNextSchedule, resetCareer
  } = useGameStore();

  const status = activeMatch?.status;
  const speed = activeMatch?.matchSpeed ?? 1;
  useEffect(() => {
    if (status !== 'PLAYING' || currentManagerIncident || currentGoalAnimation || captainTalk || penaltyKick || showHelp || lesson || paused) return;
    const timer = setInterval(updateMatchMinute, Math.max(120, 700 / speed));
    return () => clearInterval(timer);
  }, [status, speed, currentManagerIncident, currentGoalAnimation, captainTalk, penaltyKick, showHelp, lesson, paused, updateMatchMinute]);

  const matchKey = activeMatch ? activeMatch.homeTeam.id + '-' + activeMatch.awayTeam.id + '-' + season + '-' + seasonGame : '';
  useEffect(() => { setPaused(true); }, [matchKey]);

  useEffect(() => {
    if (isProfileCreated && !nextMatchSchedule && !activeMatch) void drawNextSchedule();
  }, [isProfileCreated, nextMatchSchedule, activeMatch, drawNextSchedule]);

  const hasMatch = !!activeMatch && activeMatch.status !== 'FINISHED';
  useEffect(() => {
    if (!activeMatch) return;
    try {
      if (!window.localStorage.getItem('o-apito-help')) {
        window.localStorage.setItem('o-apito-help', '1');
        setShowHelp(true);
      }
    } catch { /* sem armazenamento: ignora */ }
  }, [activeMatch]);
  const temp = activeMatch?.matchTemperature ?? 0;
  useEffect(() => {
    if (hasMatch) soundEffects.startCrowd();
    else soundEffects.stopCrowd();
    return () => soundEffects.stopCrowd();
  }, [hasMatch]);
  useEffect(() => { if (hasMatch) soundEffects.setCrowdIntensity(temp); }, [hasMatch, temp]);
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEffects.setMuted(next);
    if (!next && hasMatch) soundEffects.startCrowd();
  };

  const sc = nextMatchSchedule;
  const seasonReports = matchHistory.filter(x => x.season === season);
  const unread = inbox.filter(m => !m.read).length;

  return (
    <div className="app-bg min-h-screen text-slate-100 flex flex-col font-sans">
      {!isProfileCreated && <ProfileModal onSave={createProfile} />}
      {showHistory && <MatchHistoryModal history={matchHistory} onClose={() => setShowHistory(false)} />}
      {currentGoalAnimation && activeMatch && (
        <GoalCelebrationOverlay
          data={currentGoalAnimation}
          homeName={activeMatch.homeTeam.name} awayName={activeMatch.awayTeam.name}
          homeColor={activeMatch.homeTeam.primaryColor} awayColor={activeMatch.awayTeam.primaryColor}
          homeScore={activeMatch.homeScore} awayScore={activeMatch.awayScore} onClose={clearGoalAnimation}
        />
      )}
      {currentManagerIncident && <ManagerIncidentModal incident={currentManagerIncident} onResolve={resolveManagerIncident} />}
      {captainTalk && <CaptainTalkModal talk={captainTalk} onResolve={resolveCaptainTalk} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showPlans && <PlansModal onClose={() => setShowPlans(false)} />}
      {penaltyKick && activeMatch && (
        <PenaltyKickModal
          pk={penaltyKick}
          atkName={penaltyKick.attackSide === 'HOME' ? activeMatch.homeTeam.name : activeMatch.awayTeam.name}
          defName={penaltyKick.attackSide === 'HOME' ? activeMatch.awayTeam.name : activeMatch.homeTeam.name}
          onFix={fixPenalty} onKick={kickPenalty}
        />
      )}
      {lesson && activeMatch && <LessonCard lesson={lesson} onClose={dismissLesson} />}
      {careerEvent && !pressConference && !activeMatch && <CareerEventModal event={careerEvent} onChoose={answerCareerEvent} />}
      {pressConference && !activeMatch && (
        <PressConferenceModal question={pressConference.questions[pressConference.index]} index={pressConference.index} total={pressConference.questions.length} onAnswer={answerPress} />
      )}

      <header className="bg-black/95 backdrop-blur border-b-2 border-amber-400/70 px-3 sm:px-6 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-4 sm:sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Logo size={44} className="shadow-lg shadow-amber-500/20 border border-amber-400/40" />
          <div>
            <h1 className="brand-font text-lg sm:text-xl text-white">O <span className="text-amber-400">APITO</span> <span className="hidden sm:inline text-slate-500 text-xs normal-case tracking-widest">SIMULADOR DE ÁRBITRO DE FUTEBOL</span></h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{referee.federation}</span><span>•</span>
              <span className="text-emerald-400 font-bold">{tierLabel(referee.tier)}</span><span>•</span>
              <span>Temporada {season} • Jogo {seasonGame}/6</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 sm:flex items-center gap-2 sm:gap-5 text-[11px] sm:text-xs w-full sm:w-auto">
          <div><span className="text-slate-400 block">Árbitro</span><span className="font-bold">{referee.name}</span></div>
          <div><span className="text-slate-400 block">Nota média</span><span className="font-bold text-emerald-400">{referee.uefaAverageScore.toFixed(2)}</span></div>
          <div><span className="text-slate-400 block">Reputação</span><span className="font-bold text-cyan-400">{referee.reputation}</span></div>
          <div><span className="text-slate-400 block">Saldo</span><span className="font-bold text-amber-400">R$ {referee.bankBalance.toLocaleString()}</span></div>
          <div className="col-span-4 flex gap-2 sm:contents">
          <button onClick={() => setShowPlans(true)} className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-lg font-black border border-amber-400 transition" title="Planos e acesso antecipado">⭐ Planos</button>
            <button onClick={() => setShowHelp(true)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold border border-slate-700 transition" title="Como jogar">❓ Ajuda</button>
            <button onClick={() => setShowHistory(true)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold border border-slate-700 transition">📜 Súmulas</button>
          <button onClick={() => { if (window.confirm('Apagar a carreira e começar do zero?')) resetCareer(); }} className="px-3 py-1.5 bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-300 rounded-lg border border-slate-800 transition">Nova carreira</button>
          </div>
        </div>
      </header>

      {activeMatch ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 shadow-xl">
              <div className="flex items-center justify-between gap-2 bg-slate-950 p-2 sm:p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 min-w-0 flex-1"><span className="w-3 h-3 shrink-0 rounded-full border border-white/50" style={{ backgroundColor: activeMatch.homeTeam.primaryColor }} /><span className="font-black text-xs sm:text-sm truncate">{activeMatch.homeTeam.name}</span></div>
                <div className="text-center">
                  <span className="text-2xl sm:text-3xl font-black font-mono whitespace-nowrap">{activeMatch.homeScore} - {activeMatch.awayScore}</span>
                  <span className="block text-[11px] text-emerald-400 font-mono font-bold">
                    {activeMatch.status === 'HALF_TIME' ? 'INTERVALO' : activeMatch.status === 'FINISHED' ? 'FIM DE JOGO' : fmtMinute(activeMatch.minute, activeMatch.half) + ' • ' + activeMatch.half + 'º TEMPO' + (paused || lesson ? ' • ⏸ PAUSADO' : '')}
                  </span>
                  <span className="hidden sm:block text-[10px] text-slate-500">{CHAMPIONSHIP[referee.tier]} • Rodada {seasonGame} • postura {activeMatch.approach.toLowerCase()}</span>
                </div>
                <div className="flex items-center justify-end gap-2 min-w-0 flex-1"><span className="font-black text-xs sm:text-sm truncate">{activeMatch.awayTeam.name}</span><span className="w-3 h-3 shrink-0 rounded-full border border-white/50" style={{ backgroundColor: activeMatch.awayTeam.primaryColor }} /></div>
              </div>

              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-[11px] font-mono text-slate-400 bg-slate-950/60 rounded-lg py-1.5 border border-slate-800">
                <span>Faltas <b className="text-slate-200">{liveStats.homeFouls} x {liveStats.awayFouls}</b></span>
                <span>🟨 <b className="text-yellow-300">{activeMatch.report.cards.filter(c => c.team === 'HOME' && c.cardType === 'YELLOW').length} x {activeMatch.report.cards.filter(c => c.team === 'AWAY' && c.cardType === 'YELLOW').length}</b></span>
                <span>🟥 <b className="text-red-400">{activeMatch.homeRedCards} x {activeMatch.awayRedCards}</b></span>
                <span>Escanteios <b className="text-slate-200">{liveStats.homeCorners} x {liveStats.awayCorners}</b></span>
                <span>{WEATHER_LABEL[activeMatch.weather]}</span>
                <button onClick={toggleMute} className="px-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700" title="Som da torcida">{muted ? '🔇' : '🔊'}</button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPaused(p => !p)} disabled={activeMatch.status !== 'PLAYING'} className={'px-3 py-1 rounded-lg font-black border transition disabled:opacity-40 ' + (paused ? 'bg-amber-400 text-black border-amber-300' : 'bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700')}>{paused ? '▶ Continuar' : '⏸ Pausar'}</button>
                  <span className="text-slate-400">Velocidade:</span>
                  {[1, 2, 4, 8].map(v => (
                    <button key={v} onClick={() => setMatchSpeed(v)} className={'px-2.5 py-1 rounded-lg font-bold border transition ' + (activeMatch.matchSpeed === v ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700')}>{v}x</button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-400">Reviravolta:</span>
                  {TWISTS.map(t => (
                    <button key={t} disabled={gameTwistUsed || activeMatch.status !== 'PLAYING'} onClick={() => triggerGameTwistAction(t)} className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-35 transition">{t}</button>
                  ))}
                </div>
              </div>

              {tip && <TipBanner text={tip} onClose={dismissTip} />}

              {activeMatch.status === 'PLAYING' && activeMatch.matchTemperature >= 70 && (
                <div className={'rounded-xl border p-2.5 text-xs flex flex-wrap items-center justify-between gap-2 ' + (activeMatch.matchTemperature >= 80 ? 'border-red-600 bg-red-950/50 text-red-200 animate-pulse' : 'border-amber-600 bg-amber-950/40 text-amber-200')}>
                  <span>🔥 Pressão {Math.round(activeMatch.matchTemperature)}% — {activeMatch.matchTemperature >= 80 ? 'risco de tumulto!' : 'os ânimos esquentam.'}</span>
                  <button onClick={strongWhistle} disabled={activeMatch.whistles >= 5} className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black">📢 Apito forte ({activeMatch.whistles}/5)</button>
                </div>
              )}

              <div className="relative">
              <PitchCanvas
                isPlaying={activeMatch.status === 'PLAYING' && !paused} isPausedForKmi={activeMatch.status !== 'PLAYING' || paused} temperature={activeMatch.matchTemperature}
                homeColor={activeMatch.homeTeam.primaryColor} awayColor={activeMatch.awayTeam.primaryColor}
                homeRedCards={activeMatch.homeRedCards} awayRedCards={activeMatch.awayRedCards} speed={activeMatch.matchSpeed}
                weather={activeMatch.weather} fx={pitchFx ?? undefined}
              />
              {paused && activeMatch.status === 'PLAYING' && !lesson && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 rounded-xl">
                  <button onClick={() => setPaused(false)} className="brand-font text-xl sm:text-2xl px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black shadow-2xl shadow-amber-500/30">{activeMatch.minute === 0 && activeMatch.half === 1 ? '▶ Iniciar partida' : '▶ Continuar'}</button>
                </div>
              )}
              </div>

              {activeMatch.status === 'HALF_TIME' && (
                <div className="bg-slate-950 border border-emerald-600/70 p-5 rounded-xl flex items-center justify-between gap-4">
                  <div><span className="text-xs font-black text-emerald-400">☕ INTERVALO</span><p className="text-xs text-slate-300 mt-1">Respire fundo. Os vestiários estão agitados e o segundo tempo promete.</p></div>
                  <button onClick={startSecondHalf} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition">▶️ Iniciar 2º Tempo</button>
                </div>
              )}

              {activeMatch.status === 'KMI_PAUSED' && activeMatch.currentIncident && (
                <div className="bg-slate-950 border border-amber-500/80 p-5 rounded-xl flex flex-col gap-3 shadow-2xl">
                  <span className="text-xs font-black text-amber-400">⚠️ LANCE DECISIVO ({activeMatch.currentIncident.minute}')</span>
                  <p className="text-xs text-slate-200 leading-relaxed">{activeMatch.currentIncident.description}</p>
                  {DIFFICULTY[difficulty].hints && <p className="text-[11px] text-sky-200 bg-sky-950/50 border border-sky-800 rounded-lg p-2">💡 {HINTS[activeMatch.currentIncident.category]}</p>}
                  <div className="flex flex-wrap gap-2">
                    <button onClick={openVarRadioIntercom} className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition">📻 Falar com o VAR</button>
                    <button onClick={openVarMonitorOFR} className="px-3.5 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition">🖥️ Revisar no monitor</button>
                    <button onClick={() => triggerInstantFieldDecision('PLAY_ON')} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold transition">Mandar seguir</button>
                  </div>
                </div>
              )}

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-40 overflow-y-auto font-mono text-[11px] flex flex-col gap-1">
                {activeMatch.ticker.map((t, i) => <div key={i} className={i === 0 ? 'text-amber-300 font-bold' : 'text-slate-400'}>{humanize(t)}</div>)}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <SmartRefereeDashboard bpm={liveStats.refereeBpm} distanceKm={liveStats.distanceCoveredKm} temperature={activeMatch.matchTemperature} whistles={activeMatch.whistles} onStrongWhistle={strongWhistle} />
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wide">👀 Fique de olho</h2>
              <WatchList teamName={activeMatch.homeTeam.name} roster={activeMatch.roster.HOME} traits={activeMatch.traits.HOME}
                foulCounts={activeMatch.roster.HOME.map((_, i) => activeMatch.fouls['HOME' + (i + 1)] ?? 0)} yellowCounts={activeMatch.roster.HOME.map((_, i) => activeMatch.yellows['HOME' + (i + 1)] ?? 0)} />
              <WatchList teamName={activeMatch.awayTeam.name} roster={activeMatch.roster.AWAY} traits={activeMatch.traits.AWAY}
                foulCounts={activeMatch.roster.AWAY.map((_, i) => activeMatch.fouls['AWAY' + (i + 1)] ?? 0)} yellowCounts={activeMatch.roster.AWAY.map((_, i) => activeMatch.yellows['AWAY' + (i + 1)] ?? 0)} />
              <p className="text-[10px] text-slate-500">🎖️ capitão • 💢 jogo duro • 😏 provocador • 🎭 cai fácil</p>
            </div>
            <MatchStatsSidebar homeTeam={activeMatch.homeTeam} awayTeam={activeMatch.awayTeam} stats={liveStats} homeManagerEjected={homeManagerEjected} awayManagerEjected={awayManagerEjected} />
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-6 flex flex-col gap-4 sm:gap-5">
          <div className="flex gap-1 border-b border-slate-800 text-sm font-bold overflow-x-auto">
            {TABS.map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={'px-4 py-2.5 border-b-2 whitespace-nowrap transition ' + (tab === id ? 'border-amber-400 text-amber-400 bg-black rounded-t-lg' : 'border-transparent text-slate-400 hover:text-slate-200')}>
                {label}{id === 'INICIO' && unread > 0 && <span className="ml-2 text-[10px] bg-amber-500 text-black rounded-full px-1.5 py-0.5">{unread}</span>}
              </button>
            ))}
          </div>

          {tab === 'INICIO' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 flex flex-col gap-5">
                {careerNews.length > 0 && <div className="bg-amber-950/60 border border-amber-700/70 text-amber-200 rounded-xl p-3 text-xs font-bold">📣 {careerNews[0]}</div>}
                {sc && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-xl">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <span className="text-[10px] font-black tracking-wider uppercase text-amber-400">{CHAMPIONSHIP[referee.tier]} • Rodada {seasonGame} • {roundDate(season, seasonGame)} • risco {sc.derbyRisk}</span>
                        <h3 className="text-xl font-black text-white mt-1">{sc.home.name} x {sc.away.name}</h3>
                        <p className="text-xs text-slate-400">{sc.stadium} • público previsto: {sc.attendance.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <button onClick={startScheduledMatch} className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition whitespace-nowrap">▶️ Entrar em campo</button>
                        {declinesUsed < 1 && seasonGame < 6 && (
                          <button onClick={() => { if (window.confirm('Recusar esta escala? Você perde a rodada e 2 pontos de reputação. Só dá para recusar uma vez por temporada.')) void declineAssignment(); }} className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition">Recusar escala</button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      {sc.big && <span className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/60 text-amber-300 font-bold">⭐ Jogo grande: pagamento +30%, mais pressão</span>}
                      {sc.km !== undefined && <span className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">✈️ Viagem de {sc.km} km • custo R$ {(sc.travelCost ?? 0).toLocaleString()}</span>}
                    </div>
                    <GrudgeChips grudges={grudges} home={sc.home} away={sc.away} />
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 text-xs flex flex-col gap-2">
                      <strong className="text-sm text-white italic">"{sc.storyline.pressHeadline}"</strong>
                      <span className="text-slate-400">{sc.storyline.homeManagerQuote}</span>
                      <span className="text-slate-400">{sc.storyline.awayManagerQuote}</span>
                      <span className="text-slate-500">{sc.storyline.scrutinyContext}</span>
                    </div>
                  </div>
                )}
                <DifficultyPanel value={difficulty} onChange={setDifficulty} locked={false} />
                <BriefingPanel approach={approach} onChange={setApproach} />
                <TrainingPanel referee={referee} points={actionPoints} onSpend={spendActionPoint} />
              </div>
              <div className="flex flex-col gap-5">
                <InboxPanel inbox={inbox} onRead={markInboxRead} />
                <GoalsPanel goals={seasonGoals} seasonReports={seasonReports} season={season} />
                <TablePanel fixtures={fixtures} teams={teams} tier={referee.tier} season={season} compact />
              </div>
            </div>
          )}

          {tab === 'GUIA' && <GuidePage />}
          {tab === 'CALENDARIO' && <CalendarPanel fixtures={fixtures} teams={teams} round={seasonGame} season={season} />}
          {tab === 'TABELA' && <TablePanel fixtures={fixtures} teams={teams} tier={referee.tier} season={season} />}
          {tab === 'CARREIRA' && (
            <div className="flex flex-col gap-5">
              <CareerPanel referee={referee} history={matchHistory} seasons={seasonHistory} />
              <GoalsPanel goals={seasonGoals} seasonReports={seasonReports} season={season} />
              <RivalsPanel rivals={rivals} name={referee.name} avg={referee.uefaAverageScore} />
              <GrudgePanel grudges={grudges} teams={teams} />
              <SaveFilePanel onExport={exportCareer} onImport={importCareer} />
            </div>
          )}
        </main>
      )}

      <footer className="text-center text-[11px] text-slate-500 py-4 px-3">
        O Apito • Acesso antecipado — tudo gratuito por enquanto •{' '}
        <button onClick={() => setShowPlans(true)} className="underline hover:text-slate-300">ver planos</button>
      </footer>

      {activeMatch?.status === 'FINISHED' && (
        <MatchReportModal
          report={{ ...activeMatch.report, homeScore: activeMatch.homeScore, awayScore: activeMatch.awayScore, matchStats: liveStats }}
          uefaScore={activeMatch.matchRating} isEvaluating={isEvaluatingPostMatch} onSignAndContinue={finishMatch}
        />
      )}
      {activeMatch?.status === 'VAR_RADIO' && activeMatch.currentIncident && (
        <VARRadioModal incident={activeMatch.currentIncident} onGoToOFR={openVarMonitorOFR} onKeepFieldDecision={triggerInstantFieldDecision} />
      )}
      {activeMatch?.status === 'VAR_ACTIVE' && activeMatch.currentIncident && (
        <VARModal incident={activeMatch.currentIncident} homeTeam={activeMatch.homeTeam} awayTeam={activeMatch.awayTeam} initialDecision={activeMatch.initialDecision} onConfirm={confirmFinalDecision} />
      )}
    </div>
  );
}

export default App;
