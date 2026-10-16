# PROJETO: O APITO - CODIGO COMPLETO

## package.json
```json
{
  "name": "o-apito",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "lucide-react": "^1.52.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "use-sound": "^5.0.0",
    "zustand": "^5.0.15"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@types/canvas-confetti": "^1.9.0",
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.7",
    "@vitejs/plugin-react": "^6.1.1",
    "oxlint": "^1.81.0",
    "typescript": "~6.0.2",
    "vite": "^8.3.0"
  }
}

```

### Arquivo: src/App.css
```css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}

```

### Arquivo: src/App.tsx
```typescript
﻿import { useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { PitchCanvas } from './components/PitchCanvas';
import { VARModal } from './components/VARModal';
import { VARRadioModal } from './components/VARRadioModal';
import { ProfileModal } from './components/ProfileModal';
import { MatchReportModal } from './components/MatchReportModal';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { ManagerIncidentModal } from './components/ManagerIncidentModal';
import { MatchStatsSidebar } from './components/MatchStatsSidebar';
import { GoalCelebrationOverlay } from './components/GoalCelebrationOverlay';
import { SmartRefereeDashboard } from './components/SmartRefereeDashboard';

export function App() {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTwistMenu, setShowTwistMenu] = useState(false);

  const {
    isProfileCreated,
    week,
    actionPoints,
    referee,
    teams,
    geminiValidation,
    matchHistory,
    nextMatchSchedule,
    currentManagerIncident,
    currentGoalAnimation,
    gameTwistUsed,
    isEvaluatingPostMatch,
    homeManagerEjected,
    awayManagerEjected,
    liveStats,
    activeMatch,
    createProfile,
    startScheduledMatch,
    triggerGameTwistAction,
    clearGoalAnimation,
    updateMatchMinute,
    setMatchSpeed,
    triggerInstantFieldDecision,
    openVarRadioIntercom,
    openVarMonitorOFR,
    confirmFinalDecision,
    resolveManagerIncident,
    finishMatch,
    spendActionPoint,
    registerSprayUse
  } = useGameStore();

  useEffect(() => {
    if (!activeMatch || activeMatch.status !== 'FIRST_HALF' || currentManagerIncident) return;
    const intervalMs = Math.max(180, 1000 / activeMatch.matchSpeed);
    const timer = setInterval(() => {
      updateMatchMinute();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [activeMatch?.status, activeMatch?.matchSpeed, activeMatch?.minute, currentManagerIncident, updateMatchMinute]);

  const currentTierTeams = teams.filter(t => t.tier === referee.tier);
  const isGoalOrOffside = activeMatch?.currentIncident?.category === 'IMPEDIMENTO_3D' || activeMatch?.currentIncident?.category === 'GOL_POLÊMICO';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {!isProfileCreated && <ProfileModal onSave={createProfile} />}
      {showHistoryModal && <MatchHistoryModal history={matchHistory} onClose={() => setShowHistoryModal(false)} />}
      
      {currentGoalAnimation && (
        <GoalCelebrationOverlay data={currentGoalAnimation} onClose={clearGoalAnimation} />
      )}

      {currentManagerIncident && (
        <ManagerIncidentModal incident={currentManagerIncident} onResolve={resolveManagerIncident} />
      )}

      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg text-white font-black text-base leading-none">
            ⚽
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">O APITO: SIMULADOR DE ARBITRAGEM</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{referee.federation}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{referee.tier}</span>
              <span>•</span>
              <span>Rodada {week}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-slate-400 block">Árbitro</span>
            <span className="font-bold text-slate-200">{referee.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Nota UEFA</span>
            <span className="font-bold text-emerald-400">{referee.uefaAverageScore.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Saldo</span>
            <span className="font-bold text-amber-400">R$ {referee.bankBalance.toLocaleString()}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {activeMatch ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
              {/* Placar */}
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="font-black text-sm">{activeMatch.homeTeam.name}</span>
                <span className="text-2xl font-black font-mono">{activeMatch.homeScore} - {activeMatch.awayScore} ({activeMatch.minute}')</span>
                <span className="font-black text-sm">{activeMatch.awayTeam.name}</span>
              </div>

              {/* Pitch */}
              <PitchCanvas 
                isPlaying={activeMatch.status === 'FIRST_HALF'} 
                isPausedForKmi={activeMatch.status !== 'FIRST_HALF'}
                temperature={activeMatch.matchTemperature}
              />

              {/* Controles do Lance */}
              {activeMatch.status === 'KMI_PAUSED' && activeMatch.currentIncident && (
                <div className="bg-slate-950 border border-amber-500/80 p-5 rounded-lg flex flex-col gap-4 animate-fade-in shadow-2xl">
                  <span className="text-xs font-black text-amber-400">⚠️ LANCE CAPITAL ({activeMatch.currentIncident.minute}')</span>
                  <p className="text-xs text-slate-200">{activeMatch.currentIncident.description}</p>

                  <div className="flex gap-2">
                    <button onClick={openVarRadioIntercom} className="px-3.5 py-2 bg-indigo-600 rounded text-xs font-bold">
                      📻 Rádio VAR
                    </button>
                    <button onClick={openVarMonitorOFR} className="px-3.5 py-2 bg-red-600 rounded text-xs font-bold">
                      🖥️ Ir ao Monitor (OFR)
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6">
              {nextMatchSchedule && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-white">{nextMatchSchedule.home.name} x {nextMatchSchedule.away.name}</h3>
                    <p className="text-xs text-slate-400">{nextMatchSchedule.stadium}</p>
                  </div>
                  <button onClick={startScheduledMatch} className="px-6 py-3 bg-emerald-600 font-bold rounded-xl">
                    ▶️ Entrar em Campo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dashboard Inteligente e Telemetria Lateral */}
        <div className="flex flex-col gap-6">
          {activeMatch ? (
            <>
              <SmartRefereeDashboard
                bpm={liveStats.refereeBpm}
                distanceKm={liveStats.distanceCoveredKm}
                temperature={activeMatch.matchTemperature}
                onSprayUsed={registerSprayUse}
              />
              <MatchStatsSidebar
                homeTeam={activeMatch.homeTeam}
                awayTeam={activeMatch.awayTeam}
                stats={liveStats}
                homeManagerEjected={homeManagerEjected}
                awayManagerEjected={awayManagerEjected}
              />
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-bold text-slate-100 uppercase mb-3">Tabela de Classificação</h2>
              <div className="space-y-2">
                {currentTierTeams.map(t => (
                  <div key={t.id} className="flex justify-between text-xs py-1 border-b border-slate-800">
                    <span>{t.name}</span>
                    <span className="font-bold">{t.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modais de VAR */}
      {activeMatch?.status === 'VAR_RADIO' && activeMatch.currentIncident && (
        <VARRadioModal
          incident={activeMatch.currentIncident}
          apiKey={referee.geminiApiKey}
          onGoToOFR={openVarMonitorOFR}
          onKeepFieldDecision={triggerInstantFieldDecision}
        />
      )}

      {activeMatch?.status === 'VAR_ACTIVE' && activeMatch.currentIncident && (
        <VARModal 
          incident={activeMatch.currentIncident}
          homeTeam={activeMatch.homeTeam}
          awayTeam={activeMatch.awayTeam}
          initialDecision={activeMatch.initialDecision}
          onConfirm={confirmFinalDecision}
        />
      )}
    </div>
  );
}

export default App;

```

### Arquivo: src/components/AnatomicPlayerFigure.tsx
```typescript
﻿interface AnatomicPlayerFigureProps {
  x: number;
  y: number;
  teamColor: string;
  number: number;
  label: string;
  pose: 'RUNNING_FORWARD' | 'DEFENDER_STANCE' | 'SLIDE_TACKLE' | 'FALLING' | 'HANDBALL_BLOCK';
  highlightExtremePart?: 'OMBRO' | 'JOELHO' | 'PE' | 'CHUTEIRA';
  facingRight?: boolean;
}

export const AnatomicPlayerFigure = ({
  x,
  y,
  teamColor,
  number,
  label,
  pose,
  highlightExtremePart,
  facingRight = true
}: AnatomicPlayerFigureProps) => {
  const flip = facingRight ? 1 : -1;

  return (
    <g transform={`translate(${x}, ${y}) scale(${flip}, 1)`}>
      {/* Sombra no gramado */}
      <ellipse cx="0" cy="115" rx="22" ry="7" fill="rgba(0,0,0,0.4)" />

      {/* Identificação flutuante */}
      <g transform={`scale(${flip}, 1)`}>
        <rect x="-35" y="-38" width="70" height="18" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#475569" strokeWidth="1" />
        <text x="0" y="-25" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold">
          {label} #{number}
        </text>
      </g>

      {/* POSE 1: CORRENDO / PROJETADO AO ATAQUE */}
      {pose === 'RUNNING_FORWARD' && (
        <g>
          {/* Perna Traseira */}
          <path d="M -2 55 L -18 80 L -25 110" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M -25 110 L -35 114" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" /> {/* Chuteira */}

          {/* Tronco & Camisa */}
          <path d="M 0 20 L 15 55 L -5 55 Z" fill={teamColor} stroke="#ffffff" strokeWidth="1.5" />
          <text x="5" y="42" fill="#fff" fontSize="11" fontWeight="900" textAnchor="middle">{number}</text>

          {/* Cabeça */}
          <circle cx="8" cy="8" r="9" fill="#fbcfe8" stroke="#1e293b" strokeWidth="1.5" />
          <path d="M 4 2 Q 8 -2 14 4" stroke="#475569" strokeWidth="3" fill="none" /> {/* Cabelo */}

          {/* Braço de Equilíbrio */}
          <path d="M 4 25 L 20 40 L 32 30" stroke="#fbcfe8" strokeWidth="5" strokeLinecap="round" fill="none" />

          {/* Calção */}
          <rect x="-8" y="52" width="22" height="15" rx="3" fill="#0f172a" />

          {/* Perna Dianteira em arrancada */}
          <path d="M 8 62 L 20 85 L 14 112" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 14 112 L 24 115" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" /> {/* Chuteira */}

          {/* Destaque do Fio de Prumo Se Ativo */}
          {highlightExtremePart === 'OMBRO' && (
            <circle cx="4" cy="22" r="5" fill="#ef4444" stroke="#fff" strokeWidth="2" className="animate-pulse" />
          )}
          {highlightExtremePart === 'JOELHO' && (
            <circle cx="20" cy="85" r="5" fill="#ef4444" stroke="#fff" strokeWidth="2" className="animate-pulse" />
          )}
          {highlightExtremePart === 'PE' && (
            <circle cx="24" cy="115" r="5" fill="#ef4444" stroke="#fff" strokeWidth="2" className="animate-pulse" />
          )}
        </g>
      )}

      {/* POSE 2: DEFENSOR EM POSTURA DE CONTENÇÃO */}
      {pose === 'DEFENDER_STANCE' && (
        <g>
          {/* Perna Esquerda */}
          <path d="M -8 55 L -18 85 L -20 112" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M -20 112 L -10 115" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />

          {/* Tronco */}
          <path d="M -10 20 L 10 20 L 6 55 L -6 55 Z" fill={teamColor} stroke="#ffffff" strokeWidth="1.5" />
          <text x="0" y="42" fill="#fff" fontSize="11" fontWeight="900" textAnchor="middle">{number}</text>

          {/* Cabeça */}
          <circle cx="0" cy="6" r="9" fill="#fed7aa" stroke="#1e293b" strokeWidth="1.5" />

          {/* Braços abertos para equilíbrio */}
          <path d="M -10 24 L -28 38 L -32 50" stroke="#fed7aa" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M 10 24 L 28 38 L 32 50" stroke="#fed7aa" strokeWidth="5" strokeLinecap="round" fill="none" />

          {/* Calção */}
          <rect x="-10" y="52" width="20" height="15" rx="3" fill="#ffffff" />

          {/* Perna Direita (Ponto Extremo no Calcanhar) */}
          <path d="M 6 55 L 16 85 L 22 112" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M 22 112 L 32 114" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />

          {highlightExtremePart === 'CHUTEIRA' && (
            <circle cx="32" cy="114" r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2" className="animate-pulse" />
          )}
          {highlightExtremePart === 'OMBRO' && (
            <circle cx="10" cy="22" r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2" className="animate-pulse" />
          )}
        </g>
      )}

      {/* POSE 3: CARRINHO NO CHÃO */}
      {pose === 'SLIDE_TACKLE' && (
        <g transform="translate(0, 45)">
          <path d="M -40 20 L -10 15 L 35 25" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M 35 25 L 55 25" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" /> {/* Travas expostas */}
          <rect x="-30" y="0" width="30" height="18" rx="4" fill={teamColor} stroke="#fff" />
          <circle cx="-42" cy="-2" r="9" fill="#fbcfe8" />
          <circle cx="55" cy="25" r="14" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,2" />
        </g>
      )}

      {/* POSE 4: QUEDA COM CALÇO NA ÁREA */}
      {pose === 'FALLING' && (
        <g transform="rotate(-30 0 50)">
          <path d="M -10 20 L 10 20 L 5 55 L -5 55 Z" fill={teamColor} stroke="#fff" strokeWidth="1.5" />
          <circle cx="0" cy="6" r="9" fill="#fde047" />
          <path d="M -5 55 L -20 80 L -35 75" stroke="#1e293b" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M 5 55 L 15 90 L 30 100" stroke="#1e293b" strokeWidth="7" fill="none" strokeLinecap="round" />
          <circle cx="-15" cy="80" r="16" fill="rgba(239, 68, 68, 0.4)" stroke="#ef4444" strokeWidth="2" />
        </g>
      )}

      {/* POSE 5: BLOQUEIO COM BRAÇO ABERTO (MÃO) */}
      {pose === 'HANDBALL_BLOCK' && (
        <g>
          <path d="M -10 20 L 10 20 L 6 55 L -6 55 Z" fill={teamColor} stroke="#fff" strokeWidth="1.5" />
          <circle cx="0" cy="6" r="9" fill="#fed7aa" />
          {/* Braço antinatural projetado lateralmente */}
          <path d="M 10 24 L 38 18 L 52 10" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="52" cy="10" r="16" fill="rgba(239, 68, 68, 0.3)" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" />
          <text x="45" y="-10" fill="#ef4444" fontSize="9" fontWeight="bold">VOLUMETRIA</text>
        </g>
      )}
    </g>
  );
};

```

### Arquivo: src/components/GoalCelebrationOverlay.tsx
```typescript
﻿import type { GoalAnimationData } from '../types/types';

interface Props {
  data: GoalAnimationData;
  onClose: () => void;
}

export const GoalCelebrationOverlay = ({ data, onClose }: Props) => {
  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center cursor-pointer animate-fade-in select-none"
    >
      {/* Efeito de flash e iluminação de estádio */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-amber-950/40 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-xl mx-auto">
        
        {/* Badge do Minuto */}
        <div className="bg-amber-500 text-black font-black text-xs px-4 py-1 rounded-full uppercase tracking-widest mb-3 shadow-lg">
          {data.minute}' MINUTO • {data.isPenalty ? 'GOL DE PÊNALTI' : 'GOL VÁLIDO'}
        </div>

        {/* Banner Gigante de GOOOOL */}
        <h1 
          className="text-6xl sm:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-amber-400 drop-shadow-[0_10px_25px_rgba(250,204,21,0.6)] animate-bounce"
        >
          GOOOOOOL!
        </h1>

        {/* Informações do Time e Autor */}
        <div className="mt-4 flex items-center gap-3 bg-slate-900/90 border border-slate-700 px-6 py-3 rounded-2xl shadow-2xl">
          <div 
            className="w-5 h-5 rounded-full border-2 border-white shadow" 
            style={{ backgroundColor: data.teamColor }} 
          />
          <div className="text-left font-mono">
            <span className="block text-lg font-black text-white">{data.teamName}</span>
            <span className="text-xs text-emerald-400 font-bold">Camisa nº {data.playerNumber} estufa as redes!</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 font-mono mt-6">
          Clique em qualquer lugar para continuar a partida
        </span>
      </div>
    </div>
  );
};

```

### Arquivo: src/components/IncidentFrameVisualizer.tsx
```typescript
﻿import { useState } from 'react';
import type { IncidentFrame, Team } from '../types/types';
import { AnatomicPlayerFigure } from './AnatomicPlayerFigure';

interface Props {
  frame: IncidentFrame;
  activeFrameIndex: number;
  homeTeam: Team;
  awayTeam: Team;
  attackingTeamType: 'HOME' | 'AWAY';
}

export const IncidentFrameVisualizer = ({
  frame,
  activeFrameIndex,
  homeTeam,
  awayTeam,
  attackingTeamType
}: Props) => {
  const [kickFrameSlider, setKickFrameSlider] = useState<number>(50);
  const [isKickPointLocked, setIsKickPointLocked] = useState<boolean>(false);
  const [attackerExtremePart, setAttackerExtremePart] = useState<'OMBRO' | 'JOELHO' | 'PE'>('OMBRO');
  const [defenderExtremePart, setDefenderExtremePart] = useState<'CHUTEIRA' | 'OMBRO'>('CHUTEIRA');

  const attackingTeam = attackingTeamType === 'HOME' ? homeTeam : awayTeam;
  const defendingTeam = attackingTeamType === 'HOME' ? awayTeam : homeTeam;
  const isOffside = frame.svgGraphicType === 'OFFSIDE_3D';

  const attackerPartOffset = attackerExtremePart === 'OMBRO' ? 0 : (attackerExtremePart === 'JOELHO' ? 10 : 16);
  const defenderPartOffset = defenderExtremePart === 'CHUTEIRA' ? 0 : -8;

  const ballProgress = Math.max(0, (kickFrameSlider - 50) * 5);
  const attackerRunProgress = (kickFrameSlider - 50) * 1.8;
  const defenderStepProgress = (kickFrameSlider - 50) * 0.9;

  return (
    <div className="relative w-full h-[450px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col justify-between p-4 select-none font-mono">
      {/* Scanline CRT Broadcast Profissional */}
      <div 
        className="absolute inset-0 pointer-events-none z-30 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.6) 50%)',
          backgroundSize: '100% 4px'
        }}
      />

      {/* HUD de Transmissão */}
      <div className="flex flex-wrap justify-between items-center text-xs z-20 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
            {activeFrameIndex === 0 && 'CAM 01 • MASTER WIDE'}
            {activeFrameIndex === 1 && (isOffside ? 'CAM 04 • HAWK-EYE 3D VOLUMETRIC' : 'CAM 04 • CONTACT FREEZE')}
            {activeFrameIndex === 2 && 'CAM 07 • ULTRA SLOW-MO 1000 FPS'}
          </span>
          <span className="text-emerald-400 font-bold text-xs">{frame.timecode}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 bg-red-950/80 border border-red-700 px-2 py-0.5 rounded-lg">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: attackingTeam.primaryColor }} />
            <span className="text-red-300 font-bold">ATAQUE: {attackingTeam.shortName}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-700 px-2 py-0.5 rounded-lg">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: defendingTeam.primaryColor }} />
            <span className="text-blue-300 font-bold">DEFESA: {defendingTeam.shortName}</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-300 font-bold">
          VELOCIDADE: <span className="text-amber-400">{frame.speedKmh} km/h</span>
        </div>
      </div>

      {/* Renderização Central com Bonecos Anatômicos */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 740 330">
          <defs>
            <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0d381e" />
              <stop offset="100%" stopColor="#061c0e" />
            </linearGradient>
            <linearGradient id="offsideBeam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.45)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0.05)" />
            </linearGradient>
          </defs>

          {/* Gramado com listras cortadas e linhas de perspectiva */}
          <rect width="740" height="330" fill="url(#grassGrad)" />
          <g stroke="rgba(255,255,255,0.08)" strokeWidth="1.5">
            <line x1="50" y1="310" x2="270" y2="30" />
            <line x1="210" y1="310" x2="350" y2="30" />
            <line x1="380" y1="310" x2="440" y2="30" />
            <line x1="550" y1="310" x2="530" y2="30" />
            <line x1="710" y1="310" x2="620" y2="30" />
          </g>

          {isOffside ? (
            <g>
              {/* Passador Real */}
              <AnatomicPlayerFigure
                x={120}
                y={150}
                teamColor={attackingTeam.primaryColor}
                number={8}
                label="PASSADOR"
                pose="RUNNING_FORWARD"
                facingRight={true}
              />

              {/* Bola e Vetor de Trajetória */}
              <g transform={`translate(${160 + ballProgress * 1.8}, ${220 - ballProgress * 0.4})`}>
                <circle cx="0" cy="0" r="7" fill="#ffffff" stroke="#111" strokeWidth="1.5" />
                {kickFrameSlider >= 48 && kickFrameSlider <= 52 && (
                  <circle cx="0" cy="0" r="16" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="3,3" />
                )}
              </g>

              {/* Defensor Real */}
              <AnatomicPlayerFigure
                x={430 + defenderStepProgress + defenderPartOffset}
                y={120}
                teamColor={defendingTeam.primaryColor}
                number={3}
                label="DEFENSOR"
                pose="DEFENDER_STANCE"
                highlightExtremePart={defenderExtremePart}
                facingRight={false}
              />

              {/* Atacante Receptor Real */}
              <AnatomicPlayerFigure
                x={415 + attackerRunProgress + attackerPartOffset}
                y={150}
                teamColor={attackingTeam.primaryColor}
                number={9}
                label="ATACANTE"
                pose="RUNNING_FORWARD"
                highlightExtremePart={attackerExtremePart}
                facingRight={true}
              />

              {/* Fio de Prumo e Linhas de Tolerância 3D */}
              {isKickPointLocked && (
                <g>
                  {/* Linha Azul do Defensor no Chão */}
                  <line 
                    x1={430 + defenderStepProgress + defenderPartOffset + 32} 
                    y1="40" 
                    x2={430 + defenderStepProgress + defenderPartOffset + 32} 
                    y2="280" 
                    stroke="#3b82f6" 
                    strokeWidth="2.5" 
                  />

                  {/* Linha Vermelha do Atacante no Chão */}
                  <line 
                    x1={415 + attackerRunProgress + attackerPartOffset + 24} 
                    y1="40" 
                    x2={415 + attackerRunProgress + attackerPartOffset + 24} 
                    y2="280" 
                    stroke="#ef4444" 
                    strokeWidth="2.5" 
                    strokeDasharray="4,2" 
                  />

                  {/* Feixe volumétrico da Projeção */}
                  <polygon 
                    points={`
                      ${415 + attackerRunProgress + attackerPartOffset + 24},40
                      ${430 + defenderStepProgress + defenderPartOffset + 32},40
                      ${430 + defenderStepProgress + defenderPartOffset + 32},280
                      ${415 + attackerRunProgress + attackerPartOffset + 24},280
                    `}
                    fill="url(#offsideBeam)"
                  />

                  {/* Painel Hawk-Eye */}
                  <g transform="translate(500, 20)">
                    <rect width="210" height="75" rx="8" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x="14" y="22" fill="#38bdf8" fontSize="10" fontWeight="bold">HAWK-EYE 3D TOLERANCE</text>
                    <text x="14" y="44" fill="#ffffff" fontSize="11">
                      Delta Ortogonal: <tspan fill="#f87171" fontWeight="bold">+{attackerPartOffset - 4} cm</tspan>
                    </text>
                    <text x="14" y="62" fill="#94a3b8" fontSize="9">Linhas semi-automáticas calibradas</text>
                  </g>
                </g>
              )}
            </g>
          ) : frame.svgGraphicType === 'BOX_PENALTY' ? (
            <g>
              <AnatomicPlayerFigure x={310} y={150} teamColor={attackingTeam.primaryColor} number={9} label="ATACANTE" pose="FALLING" facingRight={true} />
              <AnatomicPlayerFigure x={370} y={140} teamColor={defendingTeam.primaryColor} number={4} label="DEFENSOR" pose="DEFENDER_STANCE" facingRight={false} />
            </g>
          ) : frame.svgGraphicType === 'SLIDE_TACKLE' ? (
            <g>
              <AnatomicPlayerFigure x={320} y={130} teamColor={attackingTeam.primaryColor} number={10} label="MEIA" pose="RUNNING_FORWARD" facingRight={true} />
              <AnatomicPlayerFigure x={350} y={120} teamColor={defendingTeam.primaryColor} number={5} label="VOLANTE" pose="SLIDE_TACKLE" facingRight={false} />
            </g>
          ) : (
            <g>
              <AnatomicPlayerFigure x={360} y={130} teamColor={defendingTeam.primaryColor} number={4} label="DEFENSOR" pose="HANDBALL_BLOCK" facingRight={true} />
            </g>
          )}
        </svg>
      </div>

      {/* Controles de Calibração */}
      <div className="z-20 bg-slate-900/95 border border-slate-700 p-3 rounded-xl text-xs flex flex-col gap-2">
        {isOffside ? (
          <>
            <div className="flex flex-wrap justify-between items-center text-[11px] gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-red-400 font-bold">Extremo Atacante:</span>
                {(['OMBRO', 'JOELHO', 'PE'] as const).map(part => (
                  <button
                    key={part}
                    onClick={() => setAttackerExtremePart(part)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                      attackerExtremePart === part ? 'bg-red-600 text-white border-red-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {part}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-blue-400 font-bold">Extremo Defensor:</span>
                {(['CHUTEIRA', 'OMBRO'] as const).map(part => (
                  <button
                    key={part}
                    onClick={() => setDefenderExtremePart(part)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                      defenderExtremePart === part ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {part}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="font-bold text-amber-400">PONTO DO PASSE: Frame {kickFrameSlider}%</span>
              <button
                onClick={() => setIsKickPointLocked(!isKickPointLocked)}
                className={`px-3 py-1 rounded font-bold text-[10px] transition ${
                  isKickPointLocked ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-black'
                }`}
              >
                {isKickPointLocked ? '✓ Linhas Fixadas' : '🔒 Traçar Projeção 3D'}
              </button>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={kickFrameSlider}
              onChange={(e) => setKickFrameSlider(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </>
        ) : (
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold text-amber-400">{frame.label}: </span>
              <span>{frame.subtitle}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">{frame.metricDetail}</span>
          </div>
        )}
      </div>
    </div>
  );
};

```

### Arquivo: src/components/ManagerIncidentModal.tsx
```typescript
﻿import type { ManagerIncident } from '../types/types';

interface Props {
  incident: ManagerIncident;
  onResolve: (action: 'VERBAL_WARNING' | 'YELLOW_CARD' | 'RED_CARD') => void;
}

export const ManagerIncidentModal = ({ incident, onResolve }: Props) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-5">
        
        {/* Topo do Alerta */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-black font-black text-xs px-2.5 py-1 rounded uppercase tracking-wider">
              ÁREA TÉCNICA • {incident.minute}' MINUTO
            </span>
            <span className="text-xs text-red-400 font-bold font-mono">INSUBORDINAÇÃO DETECTADA</span>
          </div>
          <span className="text-xs text-slate-400">{incident.teamName}</span>
        </div>

        {/* Citação do Técnico */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Técnico: <strong className="text-white text-sm">{incident.managerName}</strong></span>
            <span className="text-red-400 font-bold uppercase">{incident.intensity}</span>
          </div>
          <p className="text-amber-300 font-mono text-sm italic bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            {incident.quote}
          </p>
          <span className="text-[11px] text-slate-400">
            Relatório do 4º Árbitro: {incident.reason}
          </span>
        </div>

        {/* Escolha da Punição pelo Árbitro Principal */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
            Sua Conduta Disciplinar como Árbitro Principal:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onResolve('VERBAL_WARNING')}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex flex-col items-center gap-1 transition"
            >
              <span className="text-base">🗣️</span>
              <span>Advertência Verbal</span>
              <span className="text-[10px] text-slate-400 font-normal">Acalma sem cartão</span>
            </button>

            <button
              onClick={() => onResolve('YELLOW_CARD')}
              className="p-3 bg-amber-600/90 hover:bg-amber-500 text-black rounded-xl text-xs font-black border border-amber-400 flex flex-col items-center gap-1 transition"
            >
              <span className="text-base">🟨</span>
              <span>Cartão Amarelo</span>
              <span className="text-[10px] text-black/80 font-normal">Punir invasão na súmula</span>
            </button>

            <button
              onClick={() => onResolve('RED_CARD')}
              className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black border border-red-400 flex flex-col items-center gap-1 transition"
            >
              <span className="text-base">🟥</span>
              <span>Cartão Vermelho</span>
              <span className="text-[10px] text-white/80 font-normal">Expulso aos vestiários</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

```

### Arquivo: src/components/MatchHistoryModal.tsx
```typescript
﻿import type { MatchReport } from '../types/types';

interface Props {
  history: MatchReport[];
  onClose: () => void;
}

export const MatchHistoryModal = ({ history, onClose }: Props) => {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-5 my-8">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-black text-amber-400">HISTÓRICO OFICIAL DE JOGOS APITADOS</h2>
            <p className="text-xs text-slate-400">Registro cumulativo de súmulas e avaliações federativas</p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition"
          >
            Fechar
          </button>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs italic">
            Nenhuma partida oficial registrada nesta carreira ainda.
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {history.map((match) => (
              <div key={match.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-slate-300">
                    {match.dateStr} • {match.stadium} ({match.tier})
                  </span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    Nota UEFA: {match.uefaScore.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center font-mono">
                  <span className="font-bold text-sm text-slate-200">{match.homeTeamName}</span>
                  <span className="text-xl font-black text-white px-3 py-1 bg-slate-900 rounded border border-slate-800">
                    {match.homeScore} x {match.awayScore}
                  </span>
                  <span className="font-bold text-sm text-slate-200">{match.awayTeamName}</span>
                </div>

                <div className="text-xs text-slate-400 flex flex-wrap gap-4 font-mono">
                  <span>Gols: <strong className="text-slate-200">{match.goals.length}</strong></span>
                  <span>Cartões: <strong className="text-amber-400">{match.cards.length}</strong></span>
                  <span>Revisões VAR: <strong className="text-red-400">{match.varReviews.length}</strong></span>
                  <span>Público: <strong className="text-slate-200">{match.attendance.toLocaleString()}</strong></span>
                </div>

                {match.pressHeadline && (
                  <div className="bg-slate-900/80 p-2.5 rounded text-[11px] text-slate-300 border border-slate-800 italic">
                    {match.pressHeadline}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

```

### Arquivo: src/components/MatchReportModal.tsx
```typescript
﻿import { useState } from 'react';
import type { Team, MatchReport } from '../types/types';

interface Props {
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  report: MatchReport;
  uefaScore: number;
  isEvaluating: boolean;
  onSignAndContinue: () => void;
}

export const MatchReportModal = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  report,
  uefaScore,
  isEvaluating,
  onSignAndContinue
}: Props) => {
  const [activeTab, setActiveTab] = useState<'MEDIA' | 'DECISIONS' | 'STATS' | 'SUMULA'>('MEDIA');

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-5 font-sans my-8">
        
        {/* Cabeçalho */}
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                PÓS-JOGO HOMOLOGADO
              </span>
              <h2 className="text-lg font-black tracking-tight text-white">CENTRAL DO APITO & SÚMULA OFICIAL</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {report.stadium} • {report.tier}
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-slate-400 block">Nota Final da Comissão</span>
            <span className={`text-xl font-black ${uefaScore >= 8.35 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {uefaScore.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Placar Oficial */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: homeTeam.primaryColor }} />
            <span className="font-black text-sm uppercase">{homeTeam.name}</span>
          </div>
          <div className="text-center">
            <span className="text-3xl font-black font-mono tracking-widest">{homeScore} x {awayScore}</span>
            <span className="block text-[11px] text-emerald-400 font-bold uppercase mt-0.5">Resultado Final</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-black text-sm uppercase">{awayTeam.name}</span>
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: awayTeam.primaryColor }} />
          </div>
        </div>

        {/* Indicador de Processamento do Gemini */}
        {isEvaluating && (
          <div className="bg-indigo-950/70 border border-indigo-700/80 p-3 rounded-xl flex items-center justify-center gap-3 text-xs text-indigo-200 animate-pulse">
            <span className="animate-spin text-base">⏳</span>
            <span>A Central do Apito e os comentaristas de TV estão debatendo a sua atuação com a IA...</span>
          </div>
        )}

        {/* Abas */}
        <div className="flex border-b border-slate-800 text-xs font-bold gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('MEDIA')}
            className={`px-4 py-2 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'MEDIA'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/50 rounded-t'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📺 Mesa Redonda (Gemini)</span>
          </button>
          <button
            onClick={() => setActiveTab('DECISIONS')}
            className={`px-4 py-2 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'DECISIONS'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/50 rounded-t'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🔍 Dossiê dos Lances ({report.decisionVerdicts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('STATS')}
            className={`px-4 py-2 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'STATS'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/50 rounded-t'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📊 Estatísticas Oficiais</span>
          </button>
          <button
            onClick={() => setActiveTab('SUMULA')}
            className={`px-4 py-2 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SUMULA'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/50 rounded-t'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📋 Súmula Disciplinar</span>
          </button>
        </div>

        {/* ABA 1: MESA REDONDA */}
        {activeTab === 'MEDIA' && (
          <div className="flex flex-col gap-4 animate-fade-in text-xs">
            {report.mediaMesaRedonda ? (
              <>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    {report.mediaMesaRedonda.programName}
                  </span>
                  <h3 className="text-base font-black text-white italic">
                    "{report.mediaMesaRedonda.headline}"
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-400">
                    Veredito: {report.mediaMesaRedonda.verdictSummary}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🎙️</span>
                      <strong className="text-emerald-400">Ex-Árbitro (Central do Apito):</strong>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                      {report.mediaMesaRedonda.refereeExpertAnalysis}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📰</span>
                      <strong className="text-cyan-400">Comentarista de TV (Mesa Redonda):</strong>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                      {report.mediaMesaRedonda.journalistOpinion}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-950 p-6 rounded-xl text-center text-slate-500 italic">
                Aguardando consolidação dos dados da bancada esportiva...
              </div>
            )}
          </div>
        )}

        {/* ABA 2: DOSSIÊ LANCE A LANCE */}
        {activeTab === 'DECISIONS' && (
          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1 animate-fade-in text-xs font-sans">
            {report.decisionVerdicts.length === 0 ? (
              <div className="bg-slate-950 p-6 rounded-xl text-center text-slate-500 italic">
                Nenhum lance capital de KMI foi registrado ou submetido a julgamento nesta partida.
              </div>
            ) : (
              report.decisionVerdicts.map((dv, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                    dv.isCorrect ? 'bg-slate-950 border-emerald-800/80' : 'bg-slate-950 border-red-800/80'
                  }`}
                >
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400 font-bold">{dv.minute}'</span>
                      <span className="font-bold text-white text-xs">{dv.incidentTitle}</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black tracking-wider ${
                      dv.isCorrect ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {dv.isCorrect ? '✓ ACERTOU O LANCE' : '✕ ERRO DE ARBITRAGEM'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Sua Decisão em Campo:</span>
                      <strong className="text-white uppercase">{dv.refereeDecision}</strong>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Recomendação Oficial IFAB:</span>
                      <strong className="text-amber-400 uppercase">{dv.recommendedDecision}</strong>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800/90 text-slate-300 font-mono text-[11px] leading-relaxed">
                    <span className="text-amber-400 font-bold block mb-1">
                      🔍 Veredito da Central do Apito (Gemini):
                    </span>
                    {dv.geminiAnalysis}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ABA 3: ESTATÍSTICAS OFICIAIS NA SÚMULA */}
        {activeTab === 'STATS' && (
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-4 font-mono text-xs animate-fade-in">
            <h3 className="font-black text-amber-400 uppercase text-xs tracking-wider">
              📊 DADOS TÉCNICOS E TELEMETRIA DA PARTIDA
            </h3>
            
            <div className="divide-y divide-slate-800/80 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-black text-emerald-400 text-sm">{report.matchStats.homePossession}%</span>
                <span className="text-slate-400 uppercase font-bold">Posse de Bola</span>
                <span className="font-black text-cyan-400 text-sm">{report.matchStats.awayPossession}%</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-bold text-white">{report.matchStats.homeShots} ({report.matchStats.homeShotsOnTarget})</span>
                <span className="text-slate-400">Finalizações Totais (No Alvo)</span>
                <span className="font-bold text-white">({report.matchStats.awayShotsOnTarget}) {report.matchStats.awayShots}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-bold text-white">{report.matchStats.homeFouls}</span>
                <span className="text-slate-400">Faltas Cometidas</span>
                <span className="font-bold text-white">{report.matchStats.awayFouls}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-bold text-white">{report.matchStats.homeCorners}</span>
                <span className="text-slate-400">Escanteios</span>
                <span className="font-bold text-white">{report.matchStats.awayCorners}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-bold text-white">{report.matchStats.homeOffsides}</span>
                <span className="text-slate-400">Impedimentos Assinalados</span>
                <span className="font-bold text-white">{report.matchStats.awayOffsides}</span>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: SÚMULA DISCIPLINAR CLÁSSICA */}
        {activeTab === 'SUMULA' && (
          <div className="flex flex-col gap-4 animate-fade-in text-xs">
            {/* Gols */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-2">⚽ Gols Registrados</h3>
              {report.goals.length === 0 ? (
                <p className="text-slate-500 italic">Nenhum gol na partida.</p>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {report.goals.map((g, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between items-center font-mono">
                      <span>{g.minute}' Camisa nº {g.playerNumber} ({g.team === 'HOME' ? homeTeam.shortName : awayTeam.shortName})</span>
                      <span className="text-slate-400 text-[11px]">{g.isPenalty ? 'Pênalti Convertido (75%)' : 'Bola Rolando'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cartões com registro de técnicos e jogadores */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-2">📋 Cartões Aplicados</h3>
              {report.cards.length === 0 ? (
                <p className="text-slate-500 italic">Sem advertências com cartão.</p>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {report.cards.map((c, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-start font-mono gap-3">
                      <div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-black mr-2 ${
                          c.cardType === 'RED' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'
                        }`}>
                          {c.cardType}
                        </span>
                        <span>{c.targetLabel} ({c.team === 'HOME' ? homeTeam.shortName : awayTeam.shortName})</span>
                      </div>
                      <span className="text-slate-400 italic text-[11px] text-right">{c.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rodapé e Assinatura */}
        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-slate-400 font-mono">
            <span>Homologação Oficial • CBF/IFAB 2026</span>
          </div>
          <button
            onClick={onSignAndContinue}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-600/30"
          >
            Assinar Súmula e Avançar de Rodada
          </button>
        </div>

      </div>
    </div>
  );
};

```

### Arquivo: src/components/MatchStatsSidebar.tsx
```typescript
﻿import type { Team, MatchLiveStats } from '../types/types';

interface Props {
  homeTeam: Team;
  awayTeam: Team;
  stats: MatchLiveStats;
  homeManagerEjected: boolean;
  awayManagerEjected: boolean;
}

export const MatchStatsSidebar = ({
  homeTeam,
  awayTeam,
  stats,
  homeManagerEjected,
  awayManagerEjected
}: Props) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4 font-mono text-xs">
      
      {/* Topo do Widget */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="font-black text-amber-400 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
          📊 TELEMETRIA & ESTATÍSTICAS AO VIVO
        </span>
        <span className="text-[10px] text-emerald-400 font-bold animate-pulse">● LIVE</span>
      </div>

      {/* Status da Área Técnica (Técnicos Presentes ou Expulsos) */}
      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-2">
        <span className="text-[10px] text-slate-400 font-bold uppercase">Status da Área Técnica:</span>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-300 truncate max-w-[120px]">{homeTeam.shortName}:</span>
          {homeManagerEjected ? (
            <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-black text-[10px]">
              🟥 TÉCNICO EXPULSO
            </span>
          ) : (
            <span className="text-emerald-400 font-bold text-[10px]">Área Técnica Ativa</span>
          )}
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-300 truncate max-w-[120px]">{awayTeam.shortName}:</span>
          {awayManagerEjected ? (
            <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-black text-[10px]">
              🟥 TÉCNICO EXPULSO
            </span>
          ) : (
            <span className="text-emerald-400 font-bold text-[10px]">Área Técnica Ativa</span>
          )}
        </div>
      </div>

      {/* Barra de Posse de Bola */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="font-bold text-slate-300">{stats.homePossession}%</span>
          <span className="text-slate-400 font-bold uppercase text-[10px]">Posse de Bola</span>
          <span className="font-bold text-slate-300">{stats.awayPossession}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${stats.homePossession}%` }} />
          <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${stats.awayPossession}%` }} />
        </div>
      </div>

      {/* Grid de Estatísticas Comparativas */}
      <div className="divide-y divide-slate-800/80 text-[11px]">
        <div className="py-2 flex justify-between items-center">
          <span className="font-bold text-slate-200">{stats.homeShots} ({stats.homeShotsOnTarget})</span>
          <span className="text-slate-400 text-[10px]">Finalizações (No Alvo)</span>
          <span className="font-bold text-slate-200">({stats.awayShotsOnTarget}) {stats.awayShots}</span>
        </div>

        <div className="py-2 flex justify-between items-center">
          <span className="font-bold text-slate-200">{stats.homeFouls}</span>
          <span className="text-slate-400 text-[10px]">Faltas Cometidas</span>
          <span className="font-bold text-slate-200">{stats.awayFouls}</span>
        </div>

        <div className="py-2 flex justify-between items-center">
          <span className="font-bold text-slate-200">{stats.homeCorners}</span>
          <span className="text-slate-400 text-[10px]">Escanteios</span>
          <span className="font-bold text-slate-200">{stats.awayCorners}</span>
        </div>

        <div className="py-2 flex justify-between items-center">
          <span className="font-bold text-slate-200">{stats.homeOffsides}</span>
          <span className="text-slate-400 text-[10px]">Impedimentos</span>
          <span className="font-bold text-slate-200">{stats.awayOffsides}</span>
        </div>
      </div>

      <div className="bg-slate-950 p-2 rounded-lg text-[10px] text-slate-500 text-center">
        Dados homologados pelo centro de métricas da federação
      </div>

    </div>
  );
};

```

### Arquivo: src/components/PitchCanvas.tsx
```typescript
﻿import { useEffect, useRef } from 'react';

interface PitchCanvasProps {
  isPlaying: boolean;
  isPausedForKmi: boolean;
  temperature: number;
  homeRedCards?: number;
  awayRedCards?: number;
}

export const PitchCanvas = ({
  isPlaying,
  isPausedForKmi,
  homeRedCards = 0,
  awayRedCards = 0
}: PitchCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += isPlaying && !isPausedForKmi ? 0.03 : 0;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Gramado listrado
      const stripeCount = 10;
      const stripeWidth = width / stripeCount;
      for (let i = 0; i < stripeCount; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#1b5e20' : '#236b28';
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, height);
      }

      // 2. Linhas de campo
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      ctx.beginPath();
      ctx.moveTo(width / 2, 20);
      ctx.lineTo(width / 2, height - 20);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 45, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeRect(20, height / 2 - 60, 70, 120);
      ctx.strokeRect(width - 90, height / 2 - 60, 70, 120);

      // Deslocamento da bola baseado em quem tem mais jogadores
      const momentumShift = (homeRedCards - awayRedCards) * 60;
      const ballX = isPausedForKmi
        ? width - 80
        : Math.max(80, Math.min(width - 80, width / 2 + Math.sin(t) * (width * 0.32) - momentumShift));
      const ballY = isPausedForKmi
        ? height / 2 + 10
        : height / 2 + Math.cos(t * 1.5) * (height * 0.28);

      // Renderiza Mandantes (remove pontos se tiver expulsos)
      const homePlayerCount = Math.max(7, 10 - homeRedCards);
      ctx.fillStyle = '#dc2626';
      for (let i = 0; i < homePlayerCount; i++) {
        const px = 60 + i * (width * 0.075) + Math.sin(t + i) * 12;
        const py = 40 + (i % 3) * (height * 0.35) + Math.cos(t + i) * 8;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Renderiza Visitantes (remove pontos se tiver expulsos)
      const awayPlayerCount = Math.max(7, 10 - awayRedCards);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < awayPlayerCount; i++) {
        const px = width - 60 - i * (width * 0.075) - Math.cos(t + i) * 12;
        const py = 40 + (i % 3) * (height * 0.35) - Math.sin(t + i) * 8;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Renderiza Árbitro
      const refX = ballX - 35;
      const refY = ballY + 25;
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(refX, refY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Linha de visão
      ctx.strokeStyle = isPausedForKmi ? 'rgba(239, 68, 68, 0.8)' : 'rgba(250, 204, 21, 0.3)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(refX, refY);
      ctx.lineTo(ballX, ballY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bola
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, isPausedForKmi, homeRedCards, awayRedCards]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-slate-700 shadow-2xl bg-black">
      <canvas ref={canvasRef} width={720} height={360} className="w-full h-auto block" />
    </div>
  );
};

```

### Arquivo: src/components/PitchRadarMap.tsx
```typescript
﻿import type { IncidentPitchZone } from '../types/types';

interface Props {
  zone: IncidentPitchZone;
}

export const PitchRadarMap = ({ zone }: Props) => {
  return (
    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1.5 font-mono text-xs">
      <div className="flex justify-between items-center text-[11px] text-slate-400">
        <span className="font-bold text-slate-300">LOCALIZAÇÃO EM CAMPO</span>
        <span className="text-amber-400 font-bold">{zone.name}</span>
      </div>

      <div className="relative w-full h-24 bg-gradient-to-r from-emerald-950 via-green-950 to-emerald-950 rounded-lg border border-emerald-800/80 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Linhas demarcatórias oficiais em SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
          {/* Borda */}
          <rect x="4" y="4" width="192" height="92" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          {/* Meio-campo */}
          <line x1="100" y1="4" x2="100" y2="96" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <circle cx="100" cy="50" r="18" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          {/* Grande Área Mandante */}
          <rect x="4" y="24" width="32" height="52" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <rect x="4" y="36" width="14" height="28" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          {/* Grande Área Visitante */}
          <rect x="164" y="24" width="32" height="52" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <rect x="182" y="36" width="14" height="28" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        </svg>

        {/* Radar Pulsante exatamente nas coordenadas X% e Y% do lance */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${zone.xPercent}%`, top: `${zone.yPercent}%` }}
        >
          <div className="w-6 h-6 rounded-full bg-red-500/30 animate-ping absolute -top-1 -left-1" />
          <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

```

### Arquivo: src/components/ProfileModal.tsx
```typescript
﻿import { useState } from 'react';
import type { RefereeStyle } from '../types/types';
import { testGeminiApiKey } from '../services/geminiService';

interface Props {
  onSave: (data: { name: string; age: number; federation: string; style: RefereeStyle; apiKey: string }) => void;
}

export const ProfileModal = ({ onSave }: Props) => {
  const [name, setName] = useState('Carlos Silva');
  const [age, setAge] = useState(26);
  const [federation, setFederation] = useState('Federação Paulista de Futebol (FPF)');
  const [style, setStyle] = useState<RefereeStyle>('DIALOGADOR');
  const [apiKey, setApiKey] = useState('');
  const [testingKey, setTestingKey] = useState(false);
  const [validationResult, setValidationResult] = useState<{ tested: boolean; success: boolean; msg: string }>({
    tested: false,
    success: false,
    msg: ''
  });

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setValidationResult({ tested: true, success: false, msg: 'Informe a chave antes de testar.' });
      return;
    }
    setTestingKey(true);
    const res = await testGeminiApiKey(apiKey.trim());
    setTestingKey(false);
    setValidationResult({ tested: true, success: res.success, msg: res.message });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, age, federation, style, apiKey });
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-4 font-sans">
        
        <div className="border-b border-slate-800 pb-3">
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
            CADASTRO OFICIAL CBF / IFAB
          </span>
          <h2 className="text-lg font-black text-white mt-1">FICHA DO ÁRBITRO • INÍCIO NA SÉRIE D</h2>
          <p className="text-xs text-slate-400">Configure sua identidade profissional antes da estreia</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Idade de Estreia</label>
              <input
                type="number"
                min={21}
                max={48}
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Estilo de Conduta</label>
              <select
                value={style}
                onChange={e => setStyle(e.target.value as RefereeStyle)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="DIALOGADOR">Dialogador (Conversa)</option>
                <option value="RIGOROSO">Rigoroso (Cartão Fácil)</option>
                <option value="DISCIPLINADOR">Disciplinador (Firme)</option>
                <option value="PREVENTIVO">Preventivo (Apito Rápido)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Federação de Origem</label>
            <input
              type="text"
              value={federation}
              onChange={e => setFederation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Área com Validação Real da Chave do Gemini */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-amber-400 font-bold">Chave de API do Gemini (Google AI)</label>
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testingKey}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded font-bold border border-slate-700 transition"
              >
                {testingKey ? 'Testando...' : '🔍 Validar Chave'}
              </button>
            </div>

            <input
              type="password"
              placeholder="Cole sua API Key do Gemini aqui..."
              value={apiKey}
              onChange={e => {
                setApiKey(e.target.value);
                setValidationResult({ tested: false, success: false, msg: '' });
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
            />

            {validationResult.tested && (
              <div className={`p-2 rounded text-[11px] font-bold ${
                validationResult.success 
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300' 
                  : 'bg-red-950 border border-red-600 text-red-300'
              }`}>
                {validationResult.success ? '✓ ' : '✕ '} {validationResult.msg}
              </div>
            )}

            <span className="text-[10px] text-slate-500">
              Gera rádio VAR, narrações e pré-jogo dinâmicos. Caso não insira, o simulador usa geradores automáticos sem travar.
            </span>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/30"
          >
            Confirmar e Iniciar Temporada na Série D
          </button>
        </form>

      </div>
    </div>
  );
};

```

### Arquivo: src/components/SmartRefereeDashboard.tsx
```typescript
﻿import { useState } from 'react';
import { soundEffects } from '../services/soundEffects';

interface Props {
  bpm: number;
  distanceKm: number;
  temperature: number;
  onSprayUsed: () => void;
}

export const SmartRefereeDashboard = ({ bpm, distanceKm, temperature, onSprayUsed }: Props) => {
  const [sprayActive, setSprayActive] = useState(false);
  const [sprayLineDrawn, setSprayLineDrawn] = useState(false);

  const handleUseSpray = () => {
    soundEffects.playWhistle('SHORT');
    setSprayActive(true);
    setTimeout(() => {
      setSprayLineDrawn(true);
      setSprayActive(false);
      onSprayUsed();
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-black text-emerald-400 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
          ⌚ TELEMETRIA BIOMÉTRICA DO ÁRBITRO
        </span>
        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">SMARTWATCH FIFA</span>
      </div>

      {/* Grid Biométrico */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Cardio (BPM)</span>
          <span className={`text-lg font-black ${bpm > 150 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
            ❤️ {bpm}
          </span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Distância</span>
          <span className="text-lg font-black text-cyan-400">
            🏃 {distanceKm.toFixed(2)} km
          </span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5">Pressão do Jogo</span>
          <span className={`text-lg font-black ${temperature > 70 ? 'text-amber-400' : 'text-slate-300'}`}>
            🔥 {temperature}%
          </span>
        </div>
      </div>

      {/* Ferramentas de Campo do Árbitro */}
      <div className="border-t border-slate-800 pt-2 flex items-center justify-between gap-2">
        <button
          onClick={handleUseSpray}
          disabled={sprayActive}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1.5 ${
            sprayLineDrawn 
              ? 'bg-slate-800 text-emerald-400 border border-emerald-700/50' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
          }`}
        >
          <span>💨</span>
          <span>{sprayActive ? 'Demarcando Barreira (9,15m)...' : sprayLineDrawn ? 'Barreira Demarcada ✓' : 'Traçar Linha do Spray'}</span>
        </button>

        <button
          onClick={() => soundEffects.playWhistle('LONG')}
          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 font-bold text-[11px] transition flex items-center gap-1"
        >
          <span>📢</span>
          <span>Apito Forte</span>
        </button>
      </div>
    </div>
  );
};

```

### Arquivo: src/components/VARModal.tsx
```typescript
﻿import { useState } from 'react';
import type { Incident, DecisionType, Team } from '../types/types';
import { IncidentFrameVisualizer } from './IncidentFrameVisualizer';
import { PitchRadarMap } from './PitchRadarMap';

interface VARModalProps {
  incident: Incident;
  homeTeam: Team;
  awayTeam: Team;
  initialDecision: DecisionType | null;
  onConfirm: (decision: DecisionType) => void;
}

export const VARModal = ({ incident, homeTeam, awayTeam, onConfirm }: VARModalProps) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState<0 | 1 | 2>(1);

  const activeFrame = incident.frames[currentFrameIndex] || incident.frames[0];
  const isGoalOrOffside = incident.category === 'IMPEDIMENTO_3D' || incident.category === 'GOL_POLÊMICO';
  const isPenaltyContext = incident.category === 'DOGSO_CHANCE_CLARA' || incident.category === 'PENALTI_DISPUTA' || incident.category === 'MAO_VOLUMETRIA';

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl flex flex-col gap-4 text-slate-100 my-6">
        
        {/* Topo do Monitor */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white font-extrabold px-3 py-1 rounded text-xs tracking-wider animate-pulse">
              ON-FIELD REVIEW (OFR)
            </span>
            <h2 className="text-base font-bold text-slate-100">{incident.title}</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Minuto {incident.minute}' | Protocolo IFAB</span>
        </div>

        {/* Mini Radar do Campo */}
        <PitchRadarMap zone={incident.pitchZone} />

        {/* Visualizador de Frame com Toque na Bola Ajustável e Identificação de Ataque/Defesa */}
        <IncidentFrameVisualizer
          frame={activeFrame}
          activeFrameIndex={currentFrameIndex}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          attackingTeamType={incident.attackingTeam}
        />

        {/* Botões de Troca de Frame 1, 2 e 3 */}
        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-mono">Selecione o Ângulo do Replay:</span>
          <div className="flex gap-2 font-mono">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => setCurrentFrameIndex(idx as 0 | 1 | 2)}
                className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  currentFrameIndex === idx
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span>Frame {idx + 1}</span>
                <span className="text-[10px] opacity-75">
                  {idx === 0 && '(Ampla)'}
                  {idx === 1 && '(Contato/Linha)'}
                  {idx === 2 && '(Lupa 4x)'}
                </span>
              </button>
            ))}
          </div>
          <span className="text-amber-400 font-mono text-[11px]">
            {activeFrame.label}
          </span>
        </div>

        {/* Diretriz Neutra IFAB */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-300">
          <strong className="text-slate-100">Critério Regulatória IFAB: </strong>
          {incident.ifabExplanation}
        </div>

        {/* Botoeira com Decisões Oficiais */}
        <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Sua Decisão Final após Análise da Imagem:</span>
          
          {isGoalOrOffside ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-bold text-xs">
              <button
                onClick={() => onConfirm('GOAL_VALID')}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
              >
                <span>⚽</span>
                <span>CONFIRMAR GOL (POSIÇÃO REGULAR)</span>
              </button>
              <button
                onClick={() => onConfirm('GOAL_DISALLOWED')}
                className="py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition"
              >
                <span>🚫</span>
                <span>ANULAR GOL (IMPEDIMENTO 3D)</span>
              </button>
              <button
                onClick={() => onConfirm('FOUL')}
                className="py-3 px-4 bg-amber-900/80 hover:bg-amber-800 text-amber-200 rounded-xl border border-amber-600 flex items-center justify-center gap-2 transition"
              >
                <span>⚠️</span>
                <span>ANULAR GOL (FALTA DE ATAQUE NA FASE APP)</span>
              </button>
            </div>
          ) : isPenaltyContext ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
              <button
                onClick={() => onConfirm('PENALTY_YELLOW')}
                className="py-3 px-3 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl shadow flex flex-col items-center gap-0.5 transition"
              >
                <span className="text-sm font-black">🟨 Pênalti + Amarelo</span>
                <span className="text-[10px] opacity-80">(DOGSO com disputa)</span>
              </button>
              <button
                onClick={() => onConfirm('PENALTY_RED')}
                className="py-3 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow flex flex-col items-center gap-0.5 transition"
              >
                <span className="text-sm font-black">🟥 Pênalti + Vermelho</span>
                <span className="text-[10px] opacity-80">(Sem disputa / Agressão)</span>
              </button>
              <button
                onClick={() => onConfirm('PENALTY')}
                className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow flex flex-col items-center gap-0.5 transition"
              >
                <span className="text-sm font-black">⚽ Pênalti Simples</span>
                <span className="text-[10px] opacity-80">(Sem cartão)</span>
              </button>
              <button
                onClick={() => onConfirm('PLAY_ON')}
                className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex flex-col items-center gap-0.5 transition"
              >
                <span className="text-sm font-black">Mandar Seguir</span>
                <span className="text-[10px] text-slate-400">(Contato legal / Simulação)</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 font-bold text-xs">
              <button
                onClick={() => onConfirm('PLAY_ON')}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition"
              >
                Mandar Seguir
              </button>
              <button
                onClick={() => onConfirm('FOUL')}
                className="py-2.5 px-3 bg-amber-900/60 hover:bg-amber-800 text-amber-200 rounded-lg border border-amber-700 transition"
              >
                Falta Simples
              </button>
              <button
                onClick={() => onConfirm('YELLOW_CARD')}
                className="py-2.5 px-3 bg-yellow-600 hover:bg-yellow-500 text-black rounded-lg transition"
              >
                Cartão Amarelo
              </button>
              <button
                onClick={() => onConfirm('RED_CARD')}
                className="py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
              >
                Cartão Vermelho
              </button>
              <button
                onClick={() => onConfirm('PENALTY')}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
              >
                Pênalti (75%)
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

```

### Arquivo: src/components/VARRadioModal.tsx
```typescript
﻿import { useState, useEffect, useRef } from 'react';
import type { Incident, DecisionType, RadioChatMessage } from '../types/types';
import { sendInteractiveVarRadioMessage } from '../services/geminiService';
import { PitchRadarMap } from './PitchRadarMap';

interface Props {
  incident: Incident;
  apiKey?: string;
  onGoToOFR: () => void;
  onKeepFieldDecision: (decision: DecisionType) => void;
}

export const VARRadioModal = ({
  incident,
  apiKey,
  onGoToOFR,
  onKeepFieldDecision
}: Props) => {
  const [messages, setMessages] = useState<RadioChatMessage[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsThinking(true);
    const timer = setTimeout(() => {
      setMessages([
        { 
          sender: 'VAR', 
          text: `Árbitro, estamos revisando o lance ocorrido aos ${incident.minute}' (${incident.title}) na região: ${incident.pitchZone.name}. As imagens estão disponíveis para sua análise.` 
        }
      ]);
      setIsThinking(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [incident]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;
    const updatedHistory: RadioChatMessage[] = [...messages, { sender: 'REF', text: text.trim() }];
    setMessages(updatedHistory);
    setCustomInput('');
    setIsThinking(true);

    const varResponse = await sendInteractiveVarRadioMessage(incident, updatedHistory, apiKey);
    setIsThinking(false);
    setMessages([...updatedHistory, { sender: 'VAR', text: varResponse }]);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl flex flex-col gap-4 text-slate-100">
        
        {/* Topo */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-base font-black tracking-wide text-white uppercase">
              RÁDIO VAR • COMUNICAÇÃO OFICIAL TÉCNICA
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Canal 446.1 MHz (FIFA/CBF)</span>
        </div>

        {/* Mini Radar do Campo */}
        <PitchRadarMap zone={incident.pitchZone} />

        {/* Chat / Transcrição Interativa Neutra */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[190px] max-h-[250px] overflow-y-auto flex flex-col gap-3 font-mono text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl max-w-[85%] ${
                msg.sender === 'VAR'
                  ? 'bg-slate-900 border border-slate-800 text-slate-200 self-start'
                  : 'bg-emerald-950/80 border border-emerald-700 text-emerald-100 self-end'
              }`}
            >
              <span className={`block font-bold text-[10px] mb-1 ${msg.sender === 'VAR' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {msg.sender === 'VAR' ? 'CABINE DO VAR (EVIDÊNCIA TÉCNICA):' : 'ÁRBITRO EM CAMPO (VOCÊ):'}
              </span>
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
            </div>
          ))}

          {isThinking && (
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl max-w-[80%] self-start flex items-center gap-2 text-amber-300">
              <span className="animate-spin text-sm">⏳</span>
              <span>Cabine do VAR verificando feeds de câmeras e telemetria...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Campo de Texto Livre para Falar com a Cabine */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(customInput);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            disabled={isThinking}
            placeholder="Fale no rádio: ex: 'Tem imagem do pé de apoio?', 'Qual é a intensidade do choque?'..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="submit"
            disabled={isThinking || !customInput.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition"
          >
            Falar no Rádio
          </button>
        </form>

        {/* Botões Neutros Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            disabled={isThinking}
            onClick={() => handleSendMessage("Quais câmeras têm a tomada mais nítida do ponto de contato?")}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-700 text-left transition"
          >
            "Quais câmeras têm o melhor ângulo?"
          </button>
          <button
            disabled={isThinking}
            onClick={() => handleSendMessage("O que a telemetria indica sobre a intensidade do choque?")}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-700 text-left transition"
          >
            "Qual é a intensidade do choque?"
          </button>
          <button
            disabled={isThinking}
            onClick={() => handleSendMessage("A fase de ataque (APP) foi checada? Houve alguma infração antes?")}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-700 text-left transition"
          >
            "A fase de ataque anterior está limpa?"
          </button>
        </div>

        {/* Decisão */}
        <div className="border-t border-slate-800 pt-3 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <button
            onClick={() => onKeepFieldDecision('PLAY_ON')}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition border border-slate-700"
          >
            Bancar Decisão de Campo (Sem Revisão)
          </button>
          <button
            onClick={onGoToOFR}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30"
          >
            🖥️ Ir ao Monitor de Campo (OFR)
          </button>
        </div>

      </div>
    </div>
  );
};

```

### Arquivo: src/index.css
```css
﻿body {
  margin: 0;
  background-color: #0b0f19;
  color: #f3f4f6;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
}

```

### Arquivo: src/main.tsx
```typescript
﻿import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

```

### Arquivo: src/mock/incidentsDatabase.ts
```typescript
﻿import type { Incident, Team, IncidentPitchZone } from '../types/types';

interface Template {
  category: Incident['category'];
  title: (h: Team, a: Team) => string;
  description: (h: Team, a: Team) => string;
  context: string;
  recommended: Incident['recommendedVarDecision'];
  acceptable: Incident['acceptableDecisions'];
  ifab: string;
  dialogue: string;
  graphicType: 'BOX_PENALTY' | 'SLIDE_TACKLE' | 'HAND_BALL' | 'OFFSIDE_3D';
  metric: string;
  pitchZone: IncidentPitchZone;
}

const NEUTRAL_TEMPLATES: Template[] = [
  // 1. IMPEDIMENTO 3D AJUSTÁVEL (GOL LEGAL - POSIÇÃO REGULAR)
  {
    category: 'IMPEDIMENTO_3D',
    title: (h, a) => `Checagem Factual de Gol: Ataque do ${h.shortName} vs Defesa do ${a.shortName}`,
    description: (h, a) => `A bola entrou no gol do ${a.name}. A cabine do VAR sincroniza o frame do último toque na bola pelo passador para traçar as linhas ortogonais entre o ombro do atacante e a chuteira do penúltimo defensor.`,
    context: 'Checagem de linhas 3D semi-automáticas.',
    recommended: 'GOAL_VALID',
    acceptable: ['GOAL_VALID'],
    ifab: 'Regra 11: Se houver sobreposição das linhas semi-automáticas de tolerância (+1.8 cm) no momento exato do passe, o lance é legal.',
    dialogue: `[VAR]: "Frame do último toque na bola sincronizado. Câmeras prontas para calibração das linhas 3D. A análise da imagem está à sua disposição."`,
    graphicType: 'OFFSIDE_3D',
    metric: 'Offset de tolerância: +1.8 cm',
    pitchZone: { xPercent: 24, yPercent: 42, name: 'Linha Defensiva / Bico da Área' }
  },

  // 2. IMPEDIMENTO 3D AJUSTÁVEL (GOL ANULADO)
  {
    category: 'IMPEDIMENTO_3D',
    title: (h, a) => `Checagem Factual de Gol: Ataque do ${a.shortName} vs Defesa do ${h.shortName}`,
    description: (h, a) => `Finalização convertida em gol pelo ${a.name}. A cabine busca o ponto exato de impacto na bola para verificar o alinhamento da linha defensiva do ${h.name}.`,
    context: 'Verificação da posição do penúltimo defensor.',
    recommended: 'GOAL_DISALLOWED',
    acceptable: ['GOAL_DISALLOWED'],
    ifab: 'Regra 11: Qualquer parte do corpo com a qual se possa marcar gol adiantada em relação à linha do penúltimo defensor no momento do passe configura impedimento.',
    dialogue: `[VAR]: "Ponto de impacto na bola selecionado. Linhas traçadas na projeção vertical. Avalie o alinhamento na tela."`,
    graphicType: 'OFFSIDE_3D',
    metric: 'Offset de projeção: -4.2 cm',
    pitchZone: { xPercent: 82, yPercent: 40, name: 'Grande Área / Linha Defensiva' }
  },

  // 3. DISPUTA NA ÁREA (PÊNALTI / SIMULAÇÃO NEUTRO)
  {
    category: 'PENALTI_DISPUTA',
    title: (h, a) => `Checagem de Área: Disputa entre Atacante do ${h.shortName} e Defensor do ${a.shortName}`,
    description: (h, a) => `Infiltração na grande área. O atacante camisa 9 cai ao solo em disputa física com o defensor camisa 4.`,
    context: 'Checagem de possível penalidade máxima ou simulação.',
    recommended: 'PLAY_ON',
    acceptable: ['PLAY_ON', 'YELLOW_CARD', 'PENALTY'],
    ifab: 'Regra 12: Cabe avaliar se houve calço faltoso, carga excessiva ou se o contato foi marginal e decorrente do movimento natural dos atletas.',
    dialogue: `[VAR]: "Temos a câmera master ampla e o ponto de contato em 120 FPS. Observe se houve alavanca que causou a queda ou se o atleta iniciou o movimento antes do toque."`,
    graphicType: 'BOX_PENALTY',
    metric: 'Verificação de ponto de contato',
    pitchZone: { xPercent: 15, yPercent: 48, name: 'Grande Área Mandante' }
  },

  // 4. CARRINHO NO MEIO-CAMPO (DISCIPLINAR NEUTRO)
  {
    category: 'FORCA_EXCESSIVA',
    title: (h, a) => `Checagem Disciplinar: Entrada de Carrinho no Meio-Campo`,
    description: (h, a) => `Disputa de bola no círculo central. O atleta camisa 5 entra de carrinho com as pernas projetadas na disputa contra o meia camisa 10.`,
    context: 'Checagem para possível cartão amarelo por temeridade ou vermelho por força excessiva.',
    recommended: 'RED_CARD',
    acceptable: ['RED_CARD', 'YELLOW_CARD'],
    ifab: 'Regra 12: Avaliar a altura do contato, velocidade de aproximação, uso de travas expostas e se o lance colocou em perigo a integridade física.',
    dialogue: `[VAR]: "Câmera reversa pronta. Avalie no monitor a altura das travas em relação ao solo e o ponto de contato na perna do adversário."`,
    graphicType: 'SLIDE_TACKLE',
    metric: 'Telemetria de velocidade e altura',
    pitchZone: { xPercent: 50, yPercent: 50, name: 'Círculo Central' }
  },

  // 5. TOQUE DE MÃO NA ÁREA (VOLUMETRIA NEUTRO)
  {
    category: 'MAO_VOLUMETRIA',
    title: (h, a) => `Checagem de Área: Possível Toque de Mão do Defensor de ${a.shortName}`,
    description: (h, a) => `Finalização em direção à baliza interceptada pelo corpo do defensor camisa 4 dentro da grande área.`,
    context: 'Checagem de pênalti por bloqueio com a mão.',
    recommended: 'PENALTY',
    acceptable: ['PENALTY', 'PLAY_ON'],
    ifab: 'Regra 12: Avaliar se o braço estava em posição natural de equilíbrio ou se ampliou deliberadamente o espaço corporal de bloqueio.',
    dialogue: `[VAR]: "Câmera de trás do gol e visão biomecânica sincronizadas. Analise o ângulo do braço em relação ao tronco no momento do chute."`,
    graphicType: 'HAND_BALL',
    metric: 'Medição angular de volumetria',
    pitchZone: { xPercent: 86, yPercent: 52, name: 'Grande Área Visitante' }
  }
];

export function getRandomIncidentsForMatch(home: Team, away: Team): Incident[] {
  const shuffled = [...NEUTRAL_TEMPLATES].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  const minutes = [
    Math.floor(Math.random() * 22) + 16,
    Math.floor(Math.random() * 20) + 52,
    Math.floor(Math.random() * 12) + 79
  ];

  return selected.map((tpl, idx) => {
    const isHomeOffender = Math.random() < 0.5;
    const offendingTeam = isHomeOffender ? 'HOME' : 'AWAY';
    const attackingTeam = isHomeOffender ? 'AWAY' : 'HOME';
    const min = minutes[idx];

    return {
      id: `incident-${Date.now()}-${idx}`,
      minute: min,
      category: tpl.category,
      title: tpl.title(home, away),
      description: tpl.description(home, away),
      context: tpl.context,
      pitchZone: tpl.pitchZone,
      offendingTeam,
      attackingTeam,
      offendingPlayerNumber: isHomeOffender ? 4 : 5,
      victimPlayerNumber: isHomeOffender ? 10 : 9,
      recommendedVarDecision: tpl.recommended,
      acceptableDecisions: tpl.acceptable,
      ifabExplanation: tpl.ifab,
      defaultVarDialogue: tpl.dialogue,
      frames: [
        {
          frameIndex: 0,
          label: 'Câmera Master Lateral (Ampla)',
          timecode: `${min}:14.020`,
          subtitle: 'Visão de transmissão no momento da jogada',
          svgGraphicType: tpl.graphicType,
          attackerNumber: 9,
          defenderNumber: 3,
          speedKmh: 31.4,
          metricDetail: tpl.metric
        },
        {
          frameIndex: 1,
          label: 'Ponto de Impacto & Linhas 3D',
          timecode: `${min}:14.240`,
          subtitle: 'Congelamento no ponto de contato / calibração',
          svgGraphicType: tpl.graphicType,
          attackerNumber: 9,
          defenderNumber: 3,
          speedKmh: 28.1,
          metricDetail: tpl.metric
        },
        {
          frameIndex: 2,
          label: 'Lupa Ultra Close-up / Reversa',
          timecode: `${min}:14.480`,
          subtitle: 'Ampliação microscópica de 4x com telemetria',
          svgGraphicType: tpl.graphicType,
          attackerNumber: 9,
          defenderNumber: 3,
          speedKmh: 14.0,
          metricDetail: tpl.metric
        }
      ]
    };
  });
}

```

### Arquivo: src/services/geminiService.ts
```typescript
﻿import type { Incident, DecisionType, MatchReport, Team, PreMatchStoryline, RadioChatMessage, MediaMesaRedonda, DecisionVerdictReport } from '../types/types';

// Modelo oficial do Google AI Studio
const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-2.0-flash'];

async function requestGemini(prompt: string, apiKey: string): Promise<string | null> {
  if (!apiKey || !apiKey.trim()) return null;

  for (const model of FALLBACK_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch {
      // tenta fallback
    }
  }
  return null;
}

export async function testGeminiApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Informe a chave de API antes de testar.' };
  }

  for (const model of FALLBACK_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Responda estritamente: CONECTADO' }] }]
        })
      });

      if (response.ok) {
        return { success: true, message: `Conexão validada com sucesso via ${model}!` };
      } else {
        const errData = await response.json().catch(() => ({}));
        const errorMsg = errData?.error?.message;
        if (errorMsg && errorMsg.includes('is no longer available')) {
          continue;
        }
        return { success: false, message: errorMsg || `Erro HTTP ${response.status} em ${model}` };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na conexão de rede';
      return { success: false, message: msg };
    }
  }

  return { success: false, message: 'Não foi possível validar nos modelos testados.' };
}

export async function sendInteractiveVarRadioMessage(
  incident: Incident,
  history: RadioChatMessage[],
  apiKey?: string
): Promise<string> {
  const dynamicFallbacks = [
    `"Analisamos o ponto exato do lance na região: ${incident.pitchZone.name}. Há evidência clara no Frame 2. A recomendação da cabine é que você venha ao monitor (OFR)."`,
    `"Checamos a jogada com as linhas da cabine. A intensidade do impacto no atleta número ${incident.victimPlayerNumber} foi excessiva. Se mantiver a decisão de campo, confirme agora."`,
    `"Verificamos a origem na fase de ataque (APP). Não encontramos irregularidades anteriores. A avaliação da gravidade disciplinar cabe a você no monitor."`
  ];

  if (!apiKey || !apiKey.trim()) {
    return dynamicFallbacks[Math.floor(Math.random() * dynamicFallbacks.length)];
  }

  const conversationHistory = history
    .map(h => `${h.sender === 'VAR' ? '[CABINE DO VAR]' : '[ÁRBITRO EM CAMPO]'}: "${h.text}"`)
    .join('\n');

  const prompt = `Você é o ÁRBITRO ASSISTENTE DE VÍDEO (VAR) oficial conversando em tempo real pelo canal de rádio com o árbitro principal em campo.
LANCE ATUAL: "${incident.title}" no minuto ${incident.minute}'
REGIÃO: ${incident.pitchZone.name}
DETALHES: ${incident.description}
REGRA IFAB: ${incident.ifabExplanation}

HISTÓRICO DA CONVERSA:
${conversationHistory}

Responda diretamente à última colocação do árbitro com jargão profissional FIFA/CBF. Máximo 2 frases curtas sem prefixos.`;

  const res = await requestGemini(prompt, apiKey);
  return res ? res.trim().replace(/^[VAR]:\s*/i, '').replace(/^"|"$/g, '') : dynamicFallbacks[0];
}

export async function generateComprehensivePostMatchMedia(
  homeTeam: string,
  awayTeam: string,
  score: string,
  uefaScore: number,
  refereeName: string,
  decisionsHistory: { incident: Incident; initial: DecisionType; final: DecisionType; isCorrect: boolean }[],
  apiKey?: string
): Promise<{ mediaMesaRedonda: MediaMesaRedonda; decisionVerdicts: DecisionVerdictReport[] }> {
  
  const fallbackMesa: MediaMesaRedonda = {
    programName: 'Mesa Redonda • Debate Pós-Jogo',
    headline: uefaScore >= 8.35 
      ? `ARBITRAGEM SEGURA: ${refereeName} domina os ânimos no clássico ${homeTeam} ${score} ${awayTeam}!`
      : `DEBATE FERVE: Decisões polêmicas de ${refereeName} geram revolta em ${homeTeam} ${score} ${awayTeam}!`,
    refereeExpertAnalysis: `Central do Apito: "O árbitro teve uma atuação de alto nível de exigência. Mostrou personalidade nas intervenções capitais e manteve o critério disciplinar alinhado às diretrizes da IFAB."`,
    journalistOpinion: `Bancada de Debates: "Jogo de nervos à flor da pele. O árbitro não se acovardou diante da pressão das arquibancadas e garantiu a legitimidade do resultado esportivo."`,
    verdictSummary: uefaScore >= 8.35 ? 'APROVADO COM ELOGIOS PELA CRÍTICA' : 'SOB FORTE ESCRUTÍNIO DA IMPRENSA'
  };

  const fallbackVerdicts: DecisionVerdictReport[] = decisionsHistory.map(dh => ({
    minute: dh.incident.minute,
    incidentTitle: dh.incident.title,
    refereeDecision: dh.final,
    recommendedDecision: dh.incident.recommendedVarDecision,
    isCorrect: dh.isCorrect,
    geminiAnalysis: dh.isCorrect
      ? `Acerto do árbitro: A decisão de aplicar "${dh.final}" foi perfeita à luz da regra oficial. O lance exigia leitura rápida do ponto de contato e o juiz não se deixou levar pela encenação.`
      : `Erro de arbitragem: A marcação de "${dh.final}" divergiu do protocolo IFAB. O lance demandava interpretação contrária (${dh.incident.recommendedVarDecision}), comprometendo a nota técnica.`
  }));

  if (!apiKey || !apiKey.trim()) {
    return { mediaMesaRedonda: fallbackMesa, decisionVerdicts: fallbackVerdicts };
  }

  const decisionsListText = decisionsHistory.map((dh, idx) => 
    `Lance ${idx + 1} (${dh.incident.minute}'): "${dh.incident.title}". Decisão tomada: "${dh.final}". Decisão recomendada: "${dh.incident.recommendedVarDecision}". Resultado: ${dh.isCorrect ? 'ACERTO' : 'ERRO'}. Regra IFAB: ${dh.incident.ifabExplanation}`
  ).join('\n');

  const prompt = `Você é a bancada esportiva do programa "Central do Apito / Linha de Passe".
Analise a atuação do árbitro principal ${refereeName} no jogo ${homeTeam} ${score} ${awayTeam}.
Nota técnica da comissão: ${uefaScore.toFixed(2)}.

LANCES JULGADOS:
${decisionsListText || 'Sem lances capitais.'}

Retorne estritamente um JSON com a estrutura:
{
  "mediaMesaRedonda": {
    "programName": "Central do Apito • Análise Oficial",
    "headline": "manchete sobre o árbitro",
    "refereeExpertAnalysis": "relato do ex-árbitro comentarista sobre o critério geral",
    "journalistOpinion": "opinião do comentarista de TV",
    "verdictSummary": "APROVADO COM LOUVOR ou SOB CRÍTICAS SEVERAS"
  },
  "decisionVerdicts": [
    {
      "minute": número_do_minuto,
      "incidentTitle": "título do lance",
      "refereeDecision": "decisão tomada",
      "recommendedDecision": "decisão correta",
      "isCorrect": true_ou_false,
      "geminiAnalysis": "relato detalhado de 2 a 3 frases explicando o porquê do acerto ou erro."
    }
  ]
}
Apenas o JSON puro, sem markdown.`;

  const raw = await requestGemini(prompt, apiKey);
  if (!raw) return { mediaMesaRedonda: fallbackMesa, decisionVerdicts: fallbackVerdicts };

  try {
    const text = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(text);
    return {
      mediaMesaRedonda: parsed.mediaMesaRedonda || fallbackMesa,
      decisionVerdicts: parsed.decisionVerdicts?.length ? parsed.decisionVerdicts : fallbackVerdicts
    };
  } catch {
    return { mediaMesaRedonda: fallbackMesa, decisionVerdicts: fallbackVerdicts };
  }
}

export async function generateGameTwistNarrative(
  twistPrompt: string,
  homeTeam: string,
  awayTeam: string,
  score: string,
  minute: number,
  apiKey?: string
): Promise<{ narration: string; temperatureDelta: number }> {
  const fallback = {
    narration: `REVIRAVOLTA DRAMÁTICA (${minute}'): ${twistPrompt}! O clima no estádio ferve e os ânimos se exaltam em campo!`,
    temperatureDelta: 25
  };

  if (!apiKey || !apiKey.trim()) return fallback;

  const prompt = `Narrador esportivo. Jogo: ${homeTeam} ${score} ${awayTeam} (${minute} min).
Reviravolta: "${twistPrompt}". Crie narração jornalística de impacto imediato (máximo 18 palavras).`;

  const res = await requestGemini(prompt, apiKey);
  return {
    narration: res ? `${minute}' - ⚡ ${res.trim().replace(/^"|"$/g, '')}` : fallback.narration,
    temperatureDelta: 25
  };
}

export async function generatePreMatchStoryline(
  home: Team,
  away: Team,
  tier: string,
  refereeName: string,
  apiKey?: string
): Promise<PreMatchStoryline> {
  const fallback: PreMatchStoryline = {
    pressHeadline: `DECISÃO EM ${home.stadiumName.toUpperCase()}: ${home.name} e ${away.name} duelam sob olhar atento da arbitragem!`,
    homeManagerQuote: `"${home.managerName}: 'Confiamos na comissão de arbitragem, mas vamos cobrar critério igual nos lances capitais.'"`,
    awayManagerQuote: `"${away.managerName}: 'Jogar fora de casa exige um árbitro com personalidade firme que não se dobre à torcida.'"`,
    scrutinyContext: `Partida classificada com alto nível de tensão. Árbitro ${refereeName} sob observação da comissão técnica.`
  };

  if (!apiKey || !apiKey.trim()) return fallback;

  const prompt = `Jornalismo esportivo cobrindo pré-jogo de ${home.name} x ${away.name} (${tier}) apitada por ${refereeName}.
Gere um JSON puro com:
"pressHeadline": manchete de impacto
"homeManagerQuote": frase do técnico ${home.managerName}
"awayManagerQuote": frase do técnico ${away.managerName}
"scrutinyContext": contexto de cobrança sobre o árbitro.`;

  const raw = await requestGemini(prompt, apiKey);
  if (!raw) return fallback;

  try {
    const text = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export async function generateMatchNarration(
  eventDescription: string,
  homeTeam: string,
  awayTeam: string,
  score: string,
  minute: number,
  apiKey?: string
): Promise<string> {
  if (!apiKey || !apiKey.trim()) return `${minute}' - ${eventDescription}`;

  const prompt = `Narrador dinâmico de futebol brasileiro. Jogo: ${homeTeam} ${score} ${awayTeam} (${minute} min).
Evento: "${eventDescription}". Crie narração curta e enérgica (máximo 15 palavras).`;

  const res = await requestGemini(prompt, apiKey);
  return res ? `${minute}' - ${res.trim()}` : `${minute}' - ${eventDescription}`;
}

```

### Arquivo: src/store/useGameStore.ts
```typescript
﻿import { create } from 'zustand';
import type { RefereeProfile, Team, Incident, DecisionType, RefereeStyle, MatchReport, DivisionTier, ManagerIncident, PreMatchStoryline, MatchLiveStats, GoalAnimationData } from '../types/types';
import { generateMatchNarration, generatePreMatchStoryline, testGeminiApiKey, generateGameTwistNarrative, generateComprehensivePostMatchMedia } from '../services/geminiService';
import { getRandomIncidentsForMatch } from '../mock/incidentsDatabase';
import { soundEffects } from '../services/soundEffects';

const ALL_TEAMS_DATABASE: Team[] = [
  { id: 'd1', name: 'Santa Cruz', shortName: 'STC', tier: 'SERIE_D', primaryColor: '#c00', secondaryColor: '#111', points: 18, played: 10, won: 5, drawn: 3, lost: 2, goalsFor: 14, goalsAgainst: 9, aggressionLevel: 8, attackStrength: 68, defenseStrength: 66, stadiumName: 'Estádio do Arruda', managerName: 'Marcelo Martelotte' },
  { id: 'd2', name: 'Treze da Paraíba', shortName: 'TRZ', tier: 'SERIE_D', primaryColor: '#111', secondaryColor: '#fff', points: 19, played: 10, won: 6, drawn: 1, lost: 3, goalsFor: 15, goalsAgainst: 10, aggressionLevel: 9, attackStrength: 67, defenseStrength: 68, stadiumName: 'Amigão', managerName: 'Waguinho Dias' },
  { id: 'd3', name: 'Ferroviária', shortName: 'AFE', tier: 'SERIE_D', primaryColor: '#800', secondaryColor: '#fff', points: 21, played: 10, won: 6, drawn: 3, lost: 1, goalsFor: 13, goalsAgainst: 6, aggressionLevel: 7, attackStrength: 70, defenseStrength: 72, stadiumName: 'Fonte Luminosa', managerName: 'Vinícius Bergantin' },
  { id: 'd4', name: 'Maringá FC', shortName: 'MFC', tier: 'SERIE_D', primaryColor: '#073', secondaryColor: '#111', points: 17, played: 10, won: 5, drawn: 2, lost: 3, goalsFor: 14, goalsAgainst: 11, aggressionLevel: 7, attackStrength: 69, defenseStrength: 67, stadiumName: 'Willie Davids', managerName: 'Jorge Castilho' },
  { id: 'a1', name: 'Botafogo', shortName: 'BOT', tier: 'SERIE_A', primaryColor: '#222', secondaryColor: '#fff', points: 40, played: 19, won: 12, drawn: 4, lost: 3, goalsFor: 32, goalsAgainst: 14, aggressionLevel: 7, attackStrength: 86, defenseStrength: 85, stadiumName: 'Nilton Santos', managerName: 'Artur Jorge' },
  { id: 'a2', name: 'Flamengo', shortName: 'FLA', tier: 'SERIE_A', primaryColor: '#c00', secondaryColor: '#000', points: 37, played: 19, won: 11, drawn: 4, lost: 4, goalsFor: 34, goalsAgainst: 19, aggressionLevel: 8, attackStrength: 88, defenseStrength: 82, stadiumName: 'Maracanã', managerName: 'Filipe Luís' },
  { id: 'a3', name: 'Palmeiras', shortName: 'PAL', tier: 'SERIE_A', primaryColor: '#054', secondaryColor: '#fff', points: 36, played: 19, won: 11, drawn: 3, lost: 5, goalsFor: 29, goalsAgainst: 15, aggressionLevel: 7, attackStrength: 87, defenseStrength: 86, stadiumName: 'Allianz Parque', managerName: 'Abel Ferreira' }
];

export interface NextScheduleData {
  home: Team;
  away: Team;
  stadium: string;
  derbyRisk: 'BAIXO' | 'MÉDIO' | 'EXTREMO';
  attendance: number;
  storyline: PreMatchStoryline;
}

const INITIAL_STATS: MatchLiveStats = {
  homePossession: 50,
  awayPossession: 50,
  homeShots: 0,
  awayShots: 0,
  homeShotsOnTarget: 0,
  awayShotsOnTarget: 0,
  homeFouls: 0,
  awayFouls: 0,
  homeCorners: 0,
  awayCorners: 0,
  homeOffsides: 0,
  awayOffsides: 0,
  refereeBpm: 110,
  distanceCoveredKm: 0
};

interface GameState {
  isProfileCreated: boolean;
  geminiValidation: { tested: boolean; valid: boolean; message: string };
  week: number;
  actionPoints: number;
  referee: RefereeProfile;
  teams: Team[];
  lastPlayedTeamIds: string[];
  resolvedIncidentIds: string[];
  matchHistory: MatchReport[];
  nextMatchSchedule: NextScheduleData | null;
  currentManagerIncident: ManagerIncident | null;
  currentGoalAnimation: GoalAnimationData | null;
  gameTwistUsed: boolean;
  isEvaluatingPostMatch: boolean;
  homeManagerEjected: boolean;
  awayManagerEjected: boolean;
  liveStats: MatchLiveStats;
  activeMatch: {
    homeTeam: Team;
    awayTeam: Team;
    homeScore: number;
    awayScore: number;
    homeRedCards: number;
    awayRedCards: number;
    minute: number;
    status: 'NOT_STARTED' | 'FIRST_HALF' | 'FINISHED' | 'KMI_PAUSED' | 'VAR_RADIO' | 'VAR_ACTIVE';
    matchSpeed: number;
    matchTemperature: number;
    ticker: string[];
    scheduledIncidents: Incident[];
    currentIncident: Incident | null;
    initialDecision: DecisionType | null;
    finalDecision: DecisionType | null;
    matchRating: number;
    decisionsHistory: { incident: Incident; initial: DecisionType; final: DecisionType; isCorrect: boolean }[];
    report: MatchReport;
  } | null;

  createProfile: (profile: { name: string; age: number; federation: string; style: RefereeStyle; apiKey: string }) => Promise<void>;
  validateApiKey: (apiKey: string) => Promise<boolean>;
  drawNextSchedule: () => Promise<void>;
  startScheduledMatch: () => void;
  triggerGameTwistAction: (twistText: string) => Promise<void>;
  clearGoalAnimation: () => void;
  updateMatchMinute: () => Promise<void>;
  setMatchSpeed: (speed: number) => void;
  triggerInstantFieldDecision: (decision: DecisionType) => Promise<void>;
  openVarRadioIntercom: () => void;
  openVarMonitorOFR: () => void;
  confirmFinalDecision: (decision: DecisionType) => Promise<void>;
  resolveManagerIncident: (action: 'VERBAL_WARNING' | 'YELLOW_CARD' | 'RED_CARD') => void;
  finishMatch: () => Promise<void>;
  spendActionPoint: (actionType: 'PHYSICAL' | 'RULES' | 'PSYCHOLOGY' | 'REST') => void;
  advanceWeek: () => void;
  registerSprayUse: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  isProfileCreated: false,
  geminiValidation: { tested: false, valid: false, message: 'Não testado' },
  week: 1,
  actionPoints: 3,
  referee: {
    name: 'Carlos Silva',
    age: 26,
    federation: 'Federação Paulista (FPF)',
    style: 'DIALOGADOR',
    tier: 'SERIE_D',
    bankBalance: 1200,
    weeklyExpenses: 350,
    reputation: 60,
    uefaAverageScore: 8.40,
    geminiApiKey: '',
    attributes: {
      physicalCondition: 72,
      stressResistance: 65,
      authority: 68,
      ruleKnowledge: 75,
      integrity: 95,
    },
    stats: {
      matches: 0,
      yellowCards: 0,
      redCards: 0,
      penalties: 0,
      varInterventions: 0,
    }
  },
  teams: ALL_TEAMS_DATABASE,
  lastPlayedTeamIds: [],
  resolvedIncidentIds: [],
  matchHistory: [],
  nextMatchSchedule: null,
  currentManagerIncident: null,
  currentGoalAnimation: null,
  gameTwistUsed: false,
  isEvaluatingPostMatch: false,
  homeManagerEjected: false,
  awayManagerEjected: false,
  liveStats: INITIAL_STATS,
  activeMatch: null,

  validateApiKey: async (apiKey: string) => {
    const res = await testGeminiApiKey(apiKey);
    set({ geminiValidation: { tested: true, valid: res.success, message: res.message } });
    return res.success;
  },

  createProfile: async ({ name, age, federation, style, apiKey }) => {
    let isValid = false;
    if (apiKey && apiKey.trim() !== '') {
      const res = await testGeminiApiKey(apiKey);
      isValid = res.success;
      set({ geminiValidation: { tested: true, valid: res.success, message: res.message } });
    }

    set(state => ({
      isProfileCreated: true,
      referee: {
        ...state.referee,
        name: name.trim() || 'Árbitro Oficial',
        age: age || 26,
        federation: federation.trim() || 'CBF',
        style,
        tier: 'SERIE_D',
        geminiApiKey: isValid ? apiKey.trim() : ''
      }
    }));

    await get().drawNextSchedule();
  },

  drawNextSchedule: async () => {
    const currentTier = get().referee.tier;
    const tierTeams = get().teams.filter(t => t.tier === currentTier);
    const home = tierTeams[0] || ALL_TEAMS_DATABASE[0];
    const away = tierTeams[1] || ALL_TEAMS_DATABASE[1];
    const storyline = await generatePreMatchStoryline(home, away, currentTier, get().referee.name, get().referee.geminiApiKey);

    set({
      nextMatchSchedule: {
        home,
        away,
        stadium: home.stadiumName,
        derbyRisk: 'EXTREMO',
        attendance: 12500,
        storyline
      }
    });
  },

  startScheduledMatch: () => {
    const schedule = get().nextMatchSchedule;
    if (!schedule) return;

    soundEffects.playWhistle('LONG');
    const incidents = getRandomIncidentsForMatch(schedule.home, schedule.away);

    set({
      gameTwistUsed: false,
      currentManagerIncident: null,
      currentGoalAnimation: null,
      isEvaluatingPostMatch: false,
      homeManagerEjected: false,
      awayManagerEjected: false,
      resolvedIncidentIds: [],
      liveStats: { ...INITIAL_STATS },
      activeMatch: {
        homeTeam: schedule.home,
        awayTeam: schedule.away,
        homeScore: 0,
        awayScore: 0,
        homeRedCards: 0,
        awayRedCards: 0,
        minute: 0,
        status: 'FIRST_HALF',
        matchSpeed: 1,
        matchTemperature: 45,
        ticker: [`Apito inicial no confronto entre ${schedule.home.name} e ${schedule.away.name}!`],
        scheduledIncidents: incidents,
        currentIncident: null,
        initialDecision: null,
        finalDecision: null,
        matchRating: 8.40,
        decisionsHistory: [],
        report: {
          id: `match-${Date.now()}`,
          week: get().week,
          tier: get().referee.tier,
          stadium: schedule.stadium,
          homeTeamName: schedule.home.name,
          awayTeamName: schedule.away.name,
          homeScore: 0,
          awayScore: 0,
          uefaScore: 8.40,
          dateStr: `Semana ${get().week} - Temporada Oficial`,
          attendance: schedule.attendance,
          pressHeadline: '',
          matchStats: { ...INITIAL_STATS },
          decisionVerdicts: [],
          goals: [],
          cards: [],
          varReviews: []
        }
      }
    });
  },

  clearGoalAnimation: () => set({ currentGoalAnimation: null }),

  registerSprayUse: () => {
    const active = get().activeMatch;
    if (active) {
      set({
        activeMatch: {
          ...active,
          matchTemperature: Math.max(25, active.matchTemperature - 5),
          ticker: [`[SPRAY OFICIAL] Árbitro demarca o distanciamento regulamentar de 9,15m. Barreira alinhada.`, ...active.ticker]
        }
      });
    }
  },

  setMatchSpeed: (speed) => {
    const active = get().activeMatch;
    if (active) set({ activeMatch: { ...active, matchSpeed: speed } });
  },

  triggerGameTwistAction: async (twistText: string) => {
    const state = get();
    const active = state.activeMatch;
    if (!active || state.gameTwistUsed) return;

    soundEffects.playWhistle('TRIPLE');
    const result = await generateGameTwistNarrative(
      twistText,
      active.homeTeam.name,
      active.awayTeam.name,
      `${active.homeScore}-${active.awayScore}`,
      active.minute,
      state.referee.geminiApiKey
    );

    set({
      gameTwistUsed: true,
      activeMatch: {
        ...active,
        matchTemperature: Math.min(100, active.matchTemperature + result.temperatureDelta),
        ticker: [result.narration, ...active.ticker]
      }
    });
  },

  updateMatchMinute: async () => {
    const state = get();
    const active = state.activeMatch;
    if (!active || active.status !== 'FIRST_HALF' || state.currentManagerIncident) return;

    const nextMinute = active.minute + 1;
    let newTicker = [...active.ticker];
    let curStats = { ...state.liveStats };

    // Telemetria Biométrica Dinâmica
    curStats.distanceCoveredKm += 0.12;
    curStats.refereeBpm = Math.floor(115 + (active.matchTemperature * 0.5) + (Math.sin(nextMinute) * 6));

    const incident = active.scheduledIncidents.find(i => i.minute === nextMinute && !state.resolvedIncidentIds.includes(i.id));
    if (incident) {
      soundEffects.playRadioBeep();
      newTicker.unshift(`[LANCE CAPITAL - ${nextMinute}'] ${incident.title}`);
      set({
        liveStats: curStats,
        activeMatch: {
          ...active,
          minute: nextMinute,
          ticker: newTicker,
          status: 'KMI_PAUSED',
          currentIncident: incident,
          matchTemperature: Math.min(100, active.matchTemperature + 20)
        }
      });
      return;
    }

    if (nextMinute >= 90) {
      soundEffects.playWhistle('TRIPLE');
      newTicker.unshift(`90+4' Fim de partida! Apito final.`);
      set({
        liveStats: curStats,
        activeMatch: {
          ...active,
          minute: 90,
          ticker: newTicker,
          status: 'FINISHED'
        }
      });
      return;
    }

    set({
      liveStats: curStats,
      activeMatch: {
        ...active,
        minute: nextMinute,
        ticker: newTicker
      }
    });
  },

  triggerInstantFieldDecision: async (decision) => {
    const state = get();
    const active = state.activeMatch;
    if (!active || !active.currentIncident) return;

    soundEffects.playWhistle(decision === 'RED_CARD' ? 'TRIPLE' : 'SHORT');
    set({
      resolvedIncidentIds: [...state.resolvedIncidentIds, active.currentIncident.id],
      activeMatch: {
        ...active,
        status: 'FIRST_HALF',
        currentIncident: null,
        ticker: [`Decisão em campo: ${decision}`, ...active.ticker]
      }
    });
  },

  openVarRadioIntercom: () => {
    soundEffects.playRadioBeep();
    const active = get().activeMatch;
    if (active) set({ activeMatch: { ...active, status: 'VAR_RADIO' } });
  },

  openVarMonitorOFR: () => {
    const active = get().activeMatch;
    if (active) set({ activeMatch: { ...active, status: 'VAR_ACTIVE' } });
  },

  confirmFinalDecision: async (decision) => {
    const state = get();
    const active = state.activeMatch;
    if (!active || !active.currentIncident) return;

    soundEffects.playWhistle('LONG');
    set({
      resolvedIncidentIds: [...state.resolvedIncidentIds, active.currentIncident.id],
      activeMatch: {
        ...active,
        status: 'FIRST_HALF',
        currentIncident: null,
        ticker: [`Decisão após revisão VAR: ${decision}`, ...active.ticker]
      }
    });
  },

  resolveManagerIncident: (action) => {
    const active = get().activeMatch;
    if (!active) return;
    soundEffects.playWhistle(action === 'RED_CARD' ? 'TRIPLE' : 'SHORT');
    set({
      currentManagerIncident: null,
      activeMatch: {
        ...active,
        ticker: [`Área técnica resolvida com ${action}`, ...active.ticker]
      }
    });
  },

  finishMatch: async () => {
    set({ activeMatch: null, week: get().week + 1 });
    await get().drawNextSchedule();
  },

  spendActionPoint: (actionType) => {
    const { actionPoints, referee } = get();
    if (actionPoints <= 0) return;
    set({ actionPoints: actionPoints - 1 });
  },

  advanceWeek: () => {
    set({ week: get().week + 1, actionPoints: 3 });
    get().drawNextSchedule();
  }
}));

```

### Arquivo: src/types/types.ts
```typescript
﻿export type DecisionType = 
  | 'PLAY_ON' 
  | 'FOUL' 
  | 'YELLOW_CARD' 
  | 'RED_CARD' 
  | 'PENALTY' 
  | 'PENALTY_YELLOW'
  | 'PENALTY_RED'
  | 'GOAL_VALID' 
  | 'GOAL_DISALLOWED';

export type RefereeStyle = 'RIGOROSO' | 'DIALOGADOR' | 'DISCIPLINADOR' | 'PREVENTIVO';

export type DivisionTier = 'SERIE_D' | 'SERIE_C' | 'SERIE_B' | 'SERIE_A' | 'FIFA_INTERNACIONAL';

export interface RefereeAttributes {
  physicalCondition: number;
  stressResistance: number;
  authority: number;
  ruleKnowledge: number;
  integrity: number;
}

export interface RefereeProfile {
  name: string;
  age: number;
  federation: string;
  style: RefereeStyle;
  tier: DivisionTier;
  bankBalance: number;
  weeklyExpenses: number;
  reputation: number;
  uefaAverageScore: number;
  geminiApiKey?: string;
  attributes: RefereeAttributes;
  stats: {
    matches: number;
    yellowCards: number;
    redCards: number;
    penalties: number;
    varInterventions: number;
  };
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  tier: DivisionTier;
  primaryColor: string;
  secondaryColor: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  aggressionLevel: number;
  attackStrength: number;
  defenseStrength: number;
  stadiumName: string;
  managerName: string;
}

export interface IncidentFrame {
  frameIndex: 0 | 1 | 2;
  label: string;
  timecode: string;
  subtitle: string;
  svgGraphicType: 'BOX_PENALTY' | 'SLIDE_TACKLE' | 'HAND_BALL' | 'OFFSIDE_3D';
  attackerNumber: number;
  defenderNumber: number;
  speedKmh: number;
  metricDetail: string;
}

export interface IncidentPitchZone {
  xPercent: number;
  yPercent: number;
  name: string;
}

export interface Incident {
  id: string;
  minute: number;
  category: 'PENALTI_DISPUTA' | 'MAO_VOLUMETRIA' | 'IMPEDIMENTO_3D' | 'FORCA_EXCESSIVA' | 'DOGSO_CHANCE_CLARA' | 'GOL_POLÊMICO';
  title: string;
  description: string;
  context: string;
  pitchZone: IncidentPitchZone;
  offendingTeam: 'HOME' | 'AWAY';
  attackingTeam: 'HOME' | 'AWAY';
  offendingPlayerNumber: number;
  victimPlayerNumber: number;
  recommendedVarDecision: DecisionType;
  acceptableDecisions: DecisionType[];
  ifabExplanation: string;
  defaultVarDialogue: string;
  frames: IncidentFrame[];
}

export interface PreMatchStoryline {
  pressHeadline: string;
  homeManagerQuote: string;
  awayManagerQuote: string;
  scrutinyContext: string;
}

export interface ManagerIncident {
  minute: number;
  team: 'HOME' | 'AWAY';
  managerName: string;
  teamName: string;
  reason: string;
  quote: string;
  intensity: 'MODERADA' | 'ACINTOSA' | 'HOSTIL';
}

export interface MatchLiveStats {
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeFouls: number;
  awayFouls: number;
  homeCorners: number;
  awayCorners: number;
  homeOffsides: number;
  awayOffsides: number;
  refereeBpm: number;
  distanceCoveredKm: number;
}

export interface GoalAnimationData {
  teamName: string;
  teamColor: string;
  minute: number;
  playerNumber: number;
  isPenalty: boolean;
}

export interface MatchReportGoal {
  minute: number;
  team: 'HOME' | 'AWAY';
  playerNumber: number;
  isPenalty: boolean;
}

export interface MatchReportCard {
  minute: number;
  team: 'HOME' | 'AWAY';
  targetType: 'PLAYER' | 'MANAGER';
  targetLabel: string;
  cardType: 'YELLOW' | 'RED';
  reason: string;
}

export interface MatchReportVarEvent {
  minute: number;
  title: string;
  decision: DecisionType;
  overturned: boolean;
}

export interface DecisionVerdictReport {
  minute: number;
  incidentTitle: string;
  refereeDecision: DecisionType;
  recommendedDecision: DecisionType;
  isCorrect: boolean;
  geminiAnalysis: string;
}

export interface MediaMesaRedonda {
  programName: string;
  headline: string;
  refereeExpertAnalysis: string;
  journalistOpinion: string;
  verdictSummary: string;
}

export interface MatchReport {
  id: string;
  week: number;
  tier: DivisionTier;
  stadium: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  uefaScore: number;
  dateStr: string;
  attendance: number;
  pressHeadline: string;
  matchStats: MatchLiveStats;
  mediaMesaRedonda?: MediaMesaRedonda;
  decisionVerdicts: DecisionVerdictReport[];
  goals: MatchReportGoal[];
  cards: MatchReportCard[];
  varReviews: MatchReportVarEvent[];
}

export interface RadioChatMessage {
  sender: 'VAR' | 'REF';
  text: string;
}

```

### Arquivo: src/vite-env.d.ts
```typescript
﻿/// <reference types="vite/client" />
declare module '*.css';

```

