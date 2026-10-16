import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  RefereeProfile, Team, Incident, DecisionType, RefereeStyle, MatchReport, DivisionTier,
  ManagerIncident, PreMatchStoryline, MatchLiveStats, GoalAnimationData, Fixture, SeasonRecord, InboxMessage, CaptainTalk, PressQuestion,
  HighlightItem, Trait, Difficulty, SeasonGoal, Rival, CareerEvent
} from '../types/types';
import {
  CHAMPIONSHIP, APPROACH_FACTOR, CAPTAIN_COMPLAINTS, buildSeason, simulateScore, computeStandings, roundDate,
  pickOfficials, buildObserver, pickPress, federationFeedback, tierLabel, makeRosters, pickWeather, fmtMinute, rnd, pickOne,
  SHOT_OFF, SHOT_SAVED, GOAL_STYLES, FOUL_TYPES, INJURY_LINES, stoppageFor, coachName, refereedCounts, pickProfile, PROFILE_INFO,
  SUB_REASONS, benchName, freeKickGoalChance, FK_MISS, DECISION_LABEL
} from './careerLogic';
import type { Weather, MatchProfile } from './careerLogic';
import { buildPreMatchStoryline, buildTwistNarrative, buildPostMatchMedia } from '../services/offlineContent';
import {
  DIFFICULTY, TIPS, assignTraits, weightedPlayer, captainNumber, cardChance, harmedSide, updateGrudges, grudgeHeat, grudgeQuestion,
  GOAL_POOL, buildReaction, makeSeasonGoals, evaluateGoals, initRivals, stepRivals, pickCareerEvent, travelKm, travelCost, isBigMatch, goalHighlight
} from './careerExtras';
import type { Lesson } from './careerExtras';
import { getRandomIncidentsForMatch } from '../mock/incidentsDatabase';
import { soundEffects } from '../services/soundEffects';

const mk = (
  id: string, name: string, shortName: string, tier: DivisionTier, c1: string, c2: string,
  atk: number, def: number, aggr: number, stadiumName: string, managerName: string
): Team => ({
  id, name, shortName, tier, primaryColor: c1, secondaryColor: c2, points: 0, played: 0, won: 0, drawn: 0,
  lost: 0, goalsFor: 0, goalsAgainst: 0, aggressionLevel: aggr, attackStrength: atk, defenseStrength: def,
  stadiumName, managerName
});

const X = (id: string, name: string, short: string, tier: DivisionTier, c1: string, c2: string, atk: number, def: number, aggr: number, stadium: string): Team =>
  mk(id, name, short, tier, c1, c2, atk, def, aggr, stadium, coachName());
const EXTRA_TEAMS: Team[] = [
  X('d5', 'Ituano', 'ITU', 'SERIE_D', '#dc2626', '#111111', 66, 65, 7, 'Novelli Júnior'), X('d6', 'Caxias', 'CAX', 'SERIE_D', '#1d4ed8', '#facc15', 65, 66, 8, 'Centenário'),
  X('d7', 'Tombense', 'TOM', 'SERIE_D', '#dc2626', '#ffffff', 67, 64, 7, 'Soares de Azevedo'), X('d8', 'Manaus FC', 'MAN', 'SERIE_D', '#0f172a', '#facc15', 64, 65, 9, 'Carlos Zamith'),
  X('d9', 'Retrô', 'RET', 'SERIE_D', '#facc15', '#111111', 63, 64, 7, 'Arena Retrô'), X('d10', 'ABC', 'ABC', 'SERIE_D', '#111111', '#ffffff', 66, 66, 8, 'Frasqueirão'),
  X('d11', 'Joinville', 'JEC', 'SERIE_D', '#111111', '#dc2626', 65, 64, 8, 'Arena Joinville'), X('d12', 'Aparecidense', 'APA', 'SERIE_D', '#dc2626', '#ffffff', 62, 65, 7, 'Annibal Batista'),
  X('c5', 'Remo', 'REM', 'SERIE_C', '#1e3a8a', '#ffffff', 74, 72, 8, 'Mangueirão'), X('c6', 'Botafogo-SP', 'BSP', 'SERIE_C', '#dc2626', '#111111', 71, 72, 7, 'Santa Cruz'),
  X('c7', 'Volta Redonda', 'VRE', 'SERIE_C', '#facc15', '#111111', 70, 71, 7, 'Raulino de Oliveira'), X('c8', 'Confiança', 'CON', 'SERIE_C', '#1d4ed8', '#ffffff', 71, 70, 8, 'Batistão'),
  X('c9', 'CSA', 'CSA', 'SERIE_C', '#1d4ed8', '#ffffff', 72, 71, 8, 'Rei Pelé'), X('c10', 'Brusque', 'BRU', 'SERIE_C', '#facc15', '#15803d', 71, 72, 7, 'Augusto Bauer'),
  X('c11', 'Athletic-MG', 'ATH', 'SERIE_C', '#111111', '#ffffff', 70, 70, 7, 'Joaquim Portugal'), X('c12', 'Floresta', 'FLO', 'SERIE_C', '#15803d', '#ffffff', 69, 71, 7, 'Domingão'),
  X('b5', 'Goiás', 'GOI', 'SERIE_B', '#15803d', '#ffffff', 78, 78, 8, 'Serrinha'), X('b6', 'Ceará', 'CEA', 'SERIE_B', '#111111', '#ffffff', 79, 77, 8, 'Castelão'),
  X('b7', 'Juventude', 'JUV', 'SERIE_B', '#15803d', '#ffffff', 76, 77, 7, 'Alfredo Jaconi'), X('b8', 'Criciúma', 'CRI', 'SERIE_B', '#facc15', '#111111', 77, 76, 8, 'Heriberto Hülse'),
  X('b9', 'Chapecoense', 'CHA', 'SERIE_B', '#15803d', '#ffffff', 76, 76, 7, 'Arena Condá'), X('b10', 'Operário-PR', 'OPE', 'SERIE_B', '#111111', '#ffffff', 75, 77, 8, 'Germano Krüger'),
  X('b11', 'Novorizontino', 'NOV', 'SERIE_B', '#facc15', '#111111', 77, 78, 7, 'Jorge Ismael'), X('b12', 'Paysandu', 'PAY', 'SERIE_B', '#1d4ed8', '#ffffff', 76, 75, 8, 'Curuzu'),
  X('a5', 'Corinthians', 'COR', 'SERIE_A', '#111111', '#ffffff', 84, 83, 9, 'Neo Química Arena'), X('a6', 'São Paulo', 'SAO', 'SERIE_A', '#dc2626', '#111111', 85, 84, 7, 'Morumbi'),
  X('a7', 'Santos', 'SAN', 'SERIE_A', '#111111', '#ffffff', 82, 81, 8, 'Vila Belmiro'), X('a8', 'Grêmio', 'GRE', 'SERIE_A', '#1d4ed8', '#111111', 85, 83, 9, 'Arena do Grêmio'),
  X('a9', 'Internacional', 'INT', 'SERIE_A', '#dc2626', '#ffffff', 84, 84, 8, 'Beira-Rio'), X('a10', 'Atlético-MG', 'CAM', 'SERIE_A', '#111111', '#ffffff', 86, 83, 9, 'Arena MRV'),
  X('a11', 'Cruzeiro', 'CRU', 'SERIE_A', '#1d4ed8', '#ffffff', 84, 82, 8, 'Mineirão'), X('a12', 'Vasco', 'VAS', 'SERIE_A', '#111111', '#ffffff', 82, 80, 9, 'São Januário')
];
const ALL_TEAMS: Team[] = [
  mk('d1', 'Santa Cruz', 'STC', 'SERIE_D', '#cc0000', '#111111', 68, 66, 8, 'Estádio do Arruda', 'Marcelo Martelotte'),
  mk('d2', 'Treze da Paraíba', 'TRZ', 'SERIE_D', '#222222', '#ffffff', 67, 68, 9, 'Amigão', 'Waguinho Dias'),
  mk('d3', 'Ferroviária', 'AFE', 'SERIE_D', '#880000', '#ffffff', 70, 72, 7, 'Fonte Luminosa', 'Vinícius Bergantin'),
  mk('d4', 'Maringá FC', 'MFC', 'SERIE_D', '#007733', '#111111', 69, 67, 7, 'Willie Davids', 'Jorge Castilho'),
  mk('c1', 'Ponte Preta', 'PON', 'SERIE_C', '#111111', '#ffffff', 74, 73, 7, 'Moisés Lucarelli', 'Téc. Ricardo Lima'),
  mk('c2', 'Figueirense', 'FIG', 'SERIE_C', '#222222', '#ffffff', 73, 72, 8, 'Orlando Scarpelli', 'Téc. Paulo Mendes'),
  mk('c3', 'Londrina', 'LON', 'SERIE_C', '#3b82f6', '#ffffff', 72, 74, 7, 'Estádio do Café', 'Téc. Luiz Andrade'),
  mk('b1', 'Sport Recife', 'SPO', 'SERIE_B', '#dc2626', '#111111', 79, 78, 8, 'Ilha do Retiro', 'Téc. Marcos Ribeiro'),
  mk('b2', 'Coritiba', 'CFC', 'SERIE_B', '#15803d', '#ffffff', 78, 79, 7, 'Couto Pereira', 'Téc. André Souza'),
  mk('b3', 'Vila Nova', 'VIL', 'SERIE_B', '#dc2626', '#ffffff', 77, 77, 8, 'OBA', 'Téc. Henrique Lopes'),
  mk('a1', 'Botafogo', 'BOT', 'SERIE_A', '#222222', '#ffffff', 86, 85, 7, 'Nilton Santos', 'Artur Jorge'),
  mk('a2', 'Flamengo', 'FLA', 'SERIE_A', '#cc0000', '#000000', 88, 82, 8, 'Maracanã', 'Filipe Luís'),
  mk('a3', 'Palmeiras', 'PAL', 'SERIE_A', '#005544', '#ffffff', 87, 86, 7, 'Allianz Parque', 'Abel Ferreira'),
  mk('c4', 'Náutico', 'NAU', 'SERIE_C', '#dc2626', '#ffffff', 73, 73, 8, 'Aflitos', 'Téc. Sérgio Pires'),
  mk('b4', 'Avaí', 'AVA', 'SERIE_B', '#2563eb', '#ffffff', 78, 77, 7, 'Ressacada', 'Téc. Fábio Neves'),
  mk('a4', 'Fluminense', 'FLU', 'SERIE_A', '#7f1d1d', '#15803d', 85, 83, 7, 'Maracanã', 'Téc. Carlos Medina'),
  ...EXTRA_TEAMS
];

const TIERS: DivisionTier[] = ['SERIE_D', 'SERIE_C', 'SERIE_B', 'SERIE_A'];
const PAY: Record<string, number> = { SERIE_D: 800, SERIE_C: 1500, SERIE_B: 3000, SERIE_A: 6000, FIFA_INTERNACIONAL: 12000 };

const INITIAL_STATS: MatchLiveStats = {
  homePossession: 50, awayPossession: 50, homeShots: 0, awayShots: 0, homeShotsOnTarget: 0, awayShotsOnTarget: 0,
  homeFouls: 0, awayFouls: 0, homeCorners: 0, awayCorners: 0, homeOffsides: 0, awayOffsides: 0,
  refereeBpm: 110, distanceCoveredKm: 0
};

const MANAGER_LINES: Record<ManagerIncident['intensity'], { reason: string; quote: string }[]> = {
  MODERADA: [
    { reason: 'Reclamação excessiva da área técnica', quote: 'Isso foi falta, árbitro! Olha o lance!' },
    { reason: 'Gesticulação repetida contra a arbitragem', quote: 'Mesmo critério para os dois lados, por favor!' }
  ],
  ACINTOSA: [
    { reason: 'Saiu da área técnica para protestar', quote: 'Está marcando tudo contra a gente hoje!' },
    { reason: 'Aplaudiu ironicamente a decisão', quote: 'Parabéns, ótima atuação! Só que não!' }
  ],
  HOSTIL: [
    { reason: 'Ofensa direta à equipe de arbitragem', quote: 'Isso é uma vergonha! Você está queimando o jogo!' },
    { reason: 'Invadiu o gramado e confrontou o quarto árbitro', quote: 'Eu entro aí e resolvo isso agora!' }
  ]
};

export interface PenaltyKick { minute: number; attackSide: 'HOME' | 'AWAY'; shooter: string; keeper: string; gkOff: boolean; playersIn: boolean; fixedGk: boolean; fixedPlayers: boolean }
export interface PitchFx { id: number; kind: 'GOAL' | 'SHOT' | 'FOUL' | 'YELLOW' | 'RED'; team?: 0 | 1 }
export type MatchStatus = 'PLAYING' | 'HALF_TIME' | 'FINISHED' | 'KMI_PAUSED' | 'VAR_RADIO' | 'VAR_ACTIVE';
export interface DecisionEntry { incident: Incident; initial: DecisionType; final: DecisionType; isCorrect: boolean }
export interface ActiveMatch {
  homeTeam: Team; awayTeam: Team; homeScore: number; awayScore: number; homeRedCards: number; awayRedCards: number;
  minute: number; half: 1 | 2; status: MatchStatus; matchSpeed: number; matchTemperature: number; ticker: string[];
  scheduledIncidents: Incident[]; currentIncident: Incident | null; initialDecision: DecisionType | null;
  finalDecision: DecisionType | null; matchRating: number; decisionsHistory: DecisionEntry[];
  managerIncidents: number; captainTalks: number; approach: RefereeStyle; weather: Weather; roster: { HOME: string[]; AWAY: string[] };
  yellows: Record<string, number>; stoppage1: number | null; stoppage2: number | null; injuries: number;
  brawls: number; profile: MatchProfile; whistles: number; lastWhistleMin: number; freeKicks: number; subsDone: number; report: MatchReport;
  traits: { HOME: Trait[]; AWAY: Trait[] }; fouls: Record<string, number>; highlights: HighlightItem[];
  wrongHarm: ('HOME' | 'AWAY')[]; big: boolean; grudgeBonus: number;
}
export interface NextScheduleData {
  home: Team; away: Team; stadium: string; derbyRisk: 'BAIXO' | 'MÉDIO' | 'EXTREMO'; attendance: number; storyline: PreMatchStoryline; km?: number; travelCost?: number; big?: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Cópia de trabalho: pode ser mutada à vontade sem tocar no estado
// Marca um cartão num jogador (2º amarelo vira vermelho) e devolve o tipo aplicado
function bookPlayer(d: ActiveMatch, side: 'HOME' | 'AWAY', num: number, minute: number, reason: string): 'YELLOW' | 'RED' {
  const key = side + num;
  const prev = d.yellows[key] ?? 0;
  d.yellows[key] = prev + 1;
  const red = prev >= 1;
  const name = d.roster[side][num - 1] ?? 'Camisa ' + num;
  d.report.cards.push({ minute, team: side, targetType: 'PLAYER', targetLabel: name + ' (#' + num + ')', cardType: red ? 'RED' : 'YELLOW', reason: red ? 'Segundo amarelo (' + reason + ')' : reason });
  if (red) { if (side === 'HOME') d.homeRedCards += 1; else d.awayRedCards += 1; }
  return red ? 'RED' : 'YELLOW';
}

function draft(a: ActiveMatch): ActiveMatch {
  return {
    ...a,
    ticker: [...a.ticker],
    decisionsHistory: [...a.decisionsHistory],
    yellows: { ...a.yellows },
    fouls: { ...a.fouls },
    highlights: [...a.highlights],
    wrongHarm: [...a.wrongHarm],
    report: { ...a.report, goals: [...a.report.goals], cards: [...a.report.cards], varReviews: [...a.report.varReviews] }
  };
}

function addGoal(d: ActiveMatch, team: 'HOME' | 'AWAY', minute: number, pen: boolean, style?: string): GoalAnimationData {
  const t = team === 'HOME' ? d.homeTeam : d.awayTeam;
  const num = 7 + Math.floor(Math.random() * 4);
  const who = d.roster[team][num - 1] ?? 'Camisa ' + num;
  if (team === 'HOME') d.homeScore += 1; else d.awayScore += 1;
  d.matchTemperature = Math.min(100, d.matchTemperature + 3);
  d.report.goals.push({ minute, team, playerNumber: num, isPenalty: pen });
  d.highlights.push(goalHighlight({ id: 'g' + d.report.goals.length + '-' + minute, minute, team, teamName: t.name, shooter: who, pen }));
  d.ticker.unshift(fmtMinute(minute, d.half) + ' ⚽ ' + (pen ? 'GOL de pênalti' : 'GOL') + ' do ' + t.name + '! ' + who + ' (#' + num + ')' + (pen ? '.' : ' ' + (style ?? pickOne(GOAL_STYLES)) + '.'));
  soundEffects.playWhistle('SHORT');
  soundEffects.playGoalRoar();
  return { teamName: t.name, teamColor: t.primaryColor, minute, playerNumber: num, isPenalty: pen };
}

const tipFor = (st: { difficulty: Difficulty; tipsSeen: string[] }, id: string): { tip?: string; tipsSeen?: string[] } => {
  if (!DIFFICULTY[st.difficulty].tips || st.tipsSeen.includes(id) || !TIPS[id]) return {};
  return { tip: TIPS[id], tipsSeen: [...st.tipsSeen, id] };
};
function reactionFor(m: ActiveMatch) {
  const hh = m.wrongHarm.filter(x => x === 'HOME').length;
  const harmedName = m.wrongHarm.length === 0 ? null : hh >= m.wrongHarm.length - hh ? m.homeTeam.name : m.awayTeam.name;
  return buildReaction({
    homeName: m.homeTeam.name, awayName: m.awayTeam.name, homeScore: m.homeScore, awayScore: m.awayScore, rating: Number(m.matchRating.toFixed(2)),
    decTotal: m.decisionsHistory.length, decCorrect: m.decisionsHistory.filter(x => x.isCorrect).length,
    reds: m.report.cards.filter(c => c.cardType === 'RED').length, brawls: m.brawls, harmedName, big: m.big
  });
}

interface GameState {
  isProfileCreated: boolean;
  week: number;
  actionPoints: number;
  referee: RefereeProfile;
  teams: Team[];
  matchHistory: MatchReport[];
  nextMatchSchedule: NextScheduleData | null;
  careerNews: string[];
  resolvedIncidentIds: string[];
  currentManagerIncident: ManagerIncident | null;
  currentGoalAnimation: GoalAnimationData | null;
  gameTwistUsed: boolean;
  isEvaluatingPostMatch: boolean;
  homeManagerEjected: boolean;
  awayManagerEjected: boolean;
  liveStats: MatchLiveStats;
  activeMatch: ActiveMatch | null;
  season: number;
  seasonGame: number;
  fixtures: Fixture[];
  seasonHistory: SeasonRecord[];
  inbox: InboxMessage[];
  approach: RefereeStyle;
  captainTalk: CaptainTalk | null;
  pitchFx: PitchFx | null;
  penaltyKick: PenaltyKick | null;
  pressConference: { questions: PressQuestion[]; index: number } | null;
  grudges: Record<string, number>;
  difficulty: Difficulty;
  seasonGoals: SeasonGoal[];
  rivals: Rival[];
  careerEvent: CareerEvent | null;
  lastEventId: string | null;
  tip: string | null;
  tipsSeen: string[];
  lesson: Lesson | null;
  declinesUsed: number;

  setDifficulty: (d: Difficulty) => void;
  answerCareerEvent: (i: number) => void;
  dismissTip: () => void;
  dismissLesson: () => void;
  declineAssignment: () => Promise<void>;
  exportCareer: () => string;
  importCareer: (json: string) => boolean;
  createProfile: (p: { name: string; age: number; federation: string; style: RefereeStyle }) => Promise<void>;
  drawNextSchedule: () => Promise<void>;
  startScheduledMatch: () => void;
  startSecondHalf: () => void;
  triggerGameTwistAction: (twistText: string) => Promise<void>;
  clearGoalAnimation: () => void;
  updateMatchMinute: () => void;
  setMatchSpeed: (speed: number) => void;
  triggerInstantFieldDecision: (decision: DecisionType) => void;
  openVarRadioIntercom: () => void;
  openVarMonitorOFR: () => void;
  confirmFinalDecision: (decision: DecisionType) => void;
  resolveManagerIncident: (action: 'VERBAL_WARNING' | 'YELLOW_CARD' | 'RED_CARD') => void;
  evaluatePostMatch: () => Promise<void>;
  finishMatch: () => Promise<void>;
  spendActionPoint: (t: 'PHYSICAL' | 'RULES' | 'PSYCHOLOGY' | 'REST') => void;
  fixPenalty: (what: 'GK' | 'PLAYERS') => void;
  kickPenalty: () => void;
  strongWhistle: () => void;
  setApproach: (a: RefereeStyle) => void;
  resolveCaptainTalk: (c: 'EXPLAIN' | 'WARN' | 'IGNORE') => void;
  answerPress: (optionIndex: number) => void;
  markInboxRead: () => void;
  resetCareer: () => void;
}

const persistPart = (s: GameState) => ({
  isProfileCreated: s.isProfileCreated, week: s.week, actionPoints: s.actionPoints, referee: s.referee,
  season: s.season, seasonGame: s.seasonGame, fixtures: s.fixtures, seasonHistory: s.seasonHistory, inbox: s.inbox, approach: s.approach,
  teams: s.teams, matchHistory: s.matchHistory, nextMatchSchedule: s.nextMatchSchedule, careerNews: s.careerNews,
  grudges: s.grudges, difficulty: s.difficulty, seasonGoals: s.seasonGoals, rivals: s.rivals, tipsSeen: s.tipsSeen,
  declinesUsed: s.declinesUsed, lastEventId: s.lastEventId, careerEvent: s.careerEvent
});

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => {
      // Aplica a decisão do árbitro a um lance capital
      const settle = (decision: DecisionType, viaVar: boolean) => {
        const state = get();
        const a = state.activeMatch;
        if (!a || !a.currentIncident) return;
        const inc = a.currentIncident;
        const d = draft(a);
        const ok = inc.acceptableDecisions.includes(decision);
        const stats = { ...state.liveStats };
        let anim: GoalAnimationData | null = null;

        const addCard = (type: 'YELLOW' | 'RED') => {
          d.report.cards.push({
            minute: inc.minute, team: inc.offendingTeam, targetType: 'PLAYER',
            targetLabel: 'Camisa ' + inc.offendingPlayerNumber + ' — ' + (a.roster[inc.offendingTeam][inc.offendingPlayerNumber - 1] ?? ''), cardType: type, reason: inc.title
          });
          if (type === 'RED') {
            if (inc.offendingTeam === 'HOME') d.homeRedCards += 1; else d.awayRedCards += 1;
          }
        };
        let penaltyPending: PenaltyKick | null = null;
        const penalty = () => {
          const atk = inc.attackingTeam;
          const dfn: 'HOME' | 'AWAY' = atk === 'HOME' ? 'AWAY' : 'HOME';
          const shooter = d.roster[atk][rnd(6, 10)] ?? 'Camisa 9';
          penaltyPending = { minute: inc.minute, attackSide: atk, shooter, keeper: d.roster[dfn][0] ?? 'Goleiro', gkOff: Math.random() < 0.4, playersIn: Math.random() < 0.3, fixedGk: false, fixedPlayers: false };
          d.ticker.unshift(fmtMinute(inc.minute, d.half) + ' ⚽ Pênalti marcado! ' + shooter + ' vai para a cobrança.');
        };

        switch (decision) {
          case 'GOAL_VALID': anim = addGoal(d, inc.attackingTeam, inc.minute, false); break;
          case 'YELLOW_CARD': addCard('YELLOW'); break;
          case 'RED_CARD': addCard('RED'); break;
          case 'PENALTY': penalty(); break;
          case 'PENALTY_YELLOW': addCard('YELLOW'); penalty(); break;
          case 'PENALTY_RED': addCard('RED'); penalty(); break;
          default: break;
        }
        if (decision !== 'PLAY_ON' && decision !== 'GOAL_VALID' && decision !== 'GOAL_DISALLOWED') {
          if (inc.offendingTeam === 'HOME') stats.homeFouls += 1; else stats.awayFouls += 1;
        }
        if (viaVar) {
          d.report.varReviews.push({ minute: inc.minute, title: inc.title, decision, overturned: decision !== 'PLAY_ON' });
        }
        d.decisionsHistory.push({ incident: inc, initial: a.initialDecision ?? 'PLAY_ON', final: decision, isCorrect: ok });
        const cfg = DIFFICULTY[state.difficulty];
        if (!ok) { const hs = harmedSide(inc, decision); if (hs) d.wrongHarm.push(hs); }
        d.highlights.push({ id: 'v-' + inc.id, minute: inc.minute, kind: 'VAR', title: inc.title, team: inc.attackingTeam, incident: inc });
        d.matchRating = clamp(a.matchRating + (ok ? 0.15 : -0.6 * cfg.penalty), 4, 10);
        d.ticker.unshift((viaVar ? 'Decisão após revisão do VAR: ' : 'Decisão em campo: ') + (DECISION_LABEL[decision] ?? decision) + (ok ? ' ✓' : ' ✕'));
        d.matchTemperature = clamp(a.matchTemperature + (ok ? -6 : 10), 20, 100);
        d.status = 'PLAYING';
        d.currentIncident = null;
        d.finalDecision = decision;
        const fxKind: PitchFx['kind'] | null = anim ? 'GOAL' : decision.includes('RED') ? 'RED' : decision.includes('YELLOW') ? 'YELLOW' : decision === 'FOUL' ? 'FOUL' : null;
        const fxTeam: 0 | 1 = (anim ? inc.attackingTeam : inc.offendingTeam) === 'HOME' ? 0 : 1;
        soundEffects.playWhistle(decision === 'RED_CARD' || decision === 'PENALTY_RED' ? 'TRIPLE' : 'LONG');
        set({
          resolvedIncidentIds: [...state.resolvedIncidentIds, inc.id],
          liveStats: stats,
          activeMatch: d,
          ...(anim ? { currentGoalAnimation: anim } : {}),
          ...(fxKind ? { pitchFx: { id: Date.now() + Math.random(), kind: fxKind, team: fxTeam } } : {}),
          ...(penaltyPending ? { penaltyKick: penaltyPending as PenaltyKick, ...tipFor(state, 'penalty') } : {}),
          lesson: cfg.lessons === 'ALL' || (cfg.lessons === 'WRONG' && !ok)
            ? { title: inc.title, ok, yours: DECISION_LABEL[decision] ?? decision, correct: DECISION_LABEL[inc.recommendedVarDecision] ?? inc.recommendedVarDecision, text: inc.ifabExplanation }
            : null
        });
      };

      return {
        isProfileCreated: false,
        week: 1,
        actionPoints: 3,
        referee: {
          name: 'Carlos Silva', age: 26, federation: 'Federação Paulista (FPF)', style: 'DIALOGADOR', tier: 'SERIE_D',
          bankBalance: 1200, weeklyExpenses: 350, reputation: 60, uefaAverageScore: 8.4, geminiApiKey: '',
          attributes: { physicalCondition: 72, stressResistance: 65, authority: 68, ruleKnowledge: 75, integrity: 95 },
          stats: { matches: 0, yellowCards: 0, redCards: 0, penalties: 0, varInterventions: 0 }
        },
        teams: ALL_TEAMS,
        matchHistory: [],
        nextMatchSchedule: null,
        careerNews: [],
        resolvedIncidentIds: [],
        currentManagerIncident: null,
        currentGoalAnimation: null,
        gameTwistUsed: false,
        isEvaluatingPostMatch: false,
        homeManagerEjected: false,
        awayManagerEjected: false,
        liveStats: INITIAL_STATS,
        activeMatch: null,
        season: 1,
        seasonGame: 1,
        fixtures: [],
        seasonHistory: [],
        inbox: [],
        approach: 'DIALOGADOR',
        captainTalk: null,
        pitchFx: null,
        penaltyKick: null,
        pressConference: null,
        grudges: {},
        difficulty: 'NORMAL',
        seasonGoals: makeSeasonGoals(),
        rivals: initRivals(),
        careerEvent: null,
        lastEventId: null,
        tip: null,
        tipsSeen: [],
        lesson: null,
        declinesUsed: 0,

        createProfile: async ({ name, age, federation, style }) => {
          set(s => ({
            isProfileCreated: true,
            referee: {
              ...s.referee,
              name: name.trim() || 'Árbitro Oficial', age: age || 26, federation: federation.trim() || 'CBF',
              style, tier: 'SERIE_D'
            }
          }));
          set(s => ({ fixtures: buildSeason('SERIE_D', s.teams, s.season, refereedCounts(s.matchHistory, s.teams)), approach: style }));
          await get().drawNextSchedule();
        },

        drawNextSchedule: async () => {
          const st = get();
          let fixtures = st.fixtures;
          if (fixtures.length === 0) { fixtures = buildSeason(st.referee.tier, st.teams, st.season, refereedCounts(st.matchHistory, st.teams)); set({ fixtures }); }
          const fx = fixtures.find(f => f.round === st.seasonGame && f.refMatch) ?? fixtures[0];
          const home = st.teams.find(t => t.id === fx?.homeId) ?? st.teams[0];
          const away = st.teams.find(t => t.id === fx?.awayId) ?? st.teams[1];
          const storyline = buildPreMatchStoryline(home, away, st.referee.tier, st.referee.name);
          set({
            nextMatchSchedule: {
              home, away, stadium: home.stadiumName,
              derbyRisk: pick<'BAIXO' | 'MÉDIO' | 'EXTREMO'>(['BAIXO', 'MÉDIO', 'EXTREMO']),
              attendance: 8000 + Math.floor(Math.random() * 30000), storyline,
              km: travelKm(home, away), travelCost: travelCost(travelKm(home, away)), big: isBigMatch(home, away)
            }
          });
        },

        startScheduledMatch: () => {
          const { nextMatchSchedule: sc, week, referee } = get();
          if (!sc) return;
          soundEffects.playWhistle('LONG');
          const incidents = getRandomIncidentsForMatch(sc.home, sc.away);
          const wx = pickWeather();
          const roster = makeRosters();
          const profile = pickProfile();
          const stats = { ...INITIAL_STATS };
          const traits = { HOME: assignTraits(), AWAY: assignTraits() };
          const gr = get().grudges;
          const gb = Math.round((grudgeHeat(gr[sc.home.id] ?? 0) + grudgeHeat(gr[sc.away.id] ?? 0)) * 0.7);
          const big = sc.big ?? isBigMatch(sc.home, sc.away);
          set({
            lesson: null, ...tipFor(get(), 'start'),
            pitchFx: null, penaltyKick: null, gameTwistUsed: false, currentManagerIncident: null, currentGoalAnimation: null, isEvaluatingPostMatch: false,
            homeManagerEjected: false, awayManagerEjected: false, resolvedIncidentIds: [], liveStats: stats,
            activeMatch: {
              homeTeam: sc.home, awayTeam: sc.away, homeScore: 0, awayScore: 0, homeRedCards: 0, awayRedCards: 0,
              minute: 0, half: 1, status: 'PLAYING', matchSpeed: 1, matchTemperature: Math.round((45 + PROFILE_INFO[profile].heat) * DIFFICULTY[get().difficulty].heat) + gb + (big ? 4 : 0) + (sc.derbyRisk === 'EXTREMO' ? 10 : sc.derbyRisk === 'MÉDIO' ? 4 : 0) + (wx === 'CHUVA' ? 3 : 0),
              ticker: ['Apito inicial: ' + sc.home.name + ' x ' + sc.away.name + '!', PROFILE_INFO[profile].text],
              scheduledIncidents: incidents, currentIncident: null, initialDecision: null, finalDecision: null,
              matchRating: 8.4, decisionsHistory: [], managerIncidents: 0, captainTalks: 0, approach: get().approach, weather: wx, roster, yellows: {}, stoppage1: null, stoppage2: null, injuries: 0, brawls: 0, profile, whistles: 0, lastWhistleMin: -99, freeKicks: 0, subsDone: 0,
              traits, fouls: {}, highlights: [], wrongHarm: [], big, grudgeBonus: gb,
              report: {
                id: 'match-' + Date.now(), season: get().season, week, tier: referee.tier, stadium: sc.stadium, homeTeamName: sc.home.name,
                awayTeamName: sc.away.name, homeScore: 0, awayScore: 0, uefaScore: 8.4,
                dateStr: roundDate(get().season, get().seasonGame), attendance: sc.attendance,
                pressHeadline: sc.storyline.pressHeadline, matchStats: stats, decisionVerdicts: [], goals: [], cards: [], varReviews: [],
                competition: CHAMPIONSHIP[referee.tier], round: get().seasonGame, refereeName: referee.name, homeColor: sc.home.primaryColor,
                awayColor: sc.away.primaryColor, homeShort: sc.home.shortName, awayShort: sc.away.shortName, approach: get().approach,
                officials: pickOfficials(), interactionNotes: [], lineups: { home: roster.HOME, away: roster.AWAY }
              }
            }
          });
        },

        startSecondHalf: () => {
          const a = get().activeMatch;
          if (!a || a.status !== 'HALF_TIME') return;
          soundEffects.playWhistle('SHORT');
          set({ activeMatch: { ...a, minute: 45, status: 'PLAYING', half: 2, ticker: ["46' Começa o segundo tempo!", ...a.ticker] } });
        },

        clearGoalAnimation: () => set({ currentGoalAnimation: null }),

        setMatchSpeed: speed => {
          const a = get().activeMatch;
          if (a) set({ activeMatch: { ...a, matchSpeed: speed } });
        },

        triggerGameTwistAction: async twistText => {
          const s = get();
          const a = s.activeMatch;
          if (!a || s.gameTwistUsed) return;
          set({ gameTwistUsed: true });
          soundEffects.playWhistle('TRIPLE');
          const r = buildTwistNarrative(twistText, a.homeTeam.name, a.awayTeam.name, a.homeScore + '-' + a.awayScore, a.minute);
          const cur = get().activeMatch;
          if (!cur) return;
          set({ activeMatch: { ...cur, matchTemperature: Math.min(100, cur.matchTemperature + r.temperatureDelta), ticker: [r.narration, ...cur.ticker] } });
        },

        updateMatchMinute: () => {
          const state = get();
          const a = state.activeMatch;
          if (!a || a.status !== 'PLAYING' || state.currentManagerIncident || state.currentGoalAnimation || state.captainTalk || state.penaltyKick || state.lesson) return;

          const d = draft(a);
          d.minute = a.minute + 1;
          d.matchTemperature = clamp(a.matchTemperature + ((45 + PROFILE_INFO[a.profile].heat) * DIFFICULTY[state.difficulty].heat + a.grudgeBonus * 0.5 - a.matchTemperature) * 0.04, 20, 100);
          const m = d.minute;
          const stats = { ...state.liveStats };
          const phys = state.referee.attributes.physicalCondition;
          stats.distanceCoveredKm += 0.12;
          stats.refereeBpm = Math.floor(115 + a.matchTemperature * 0.5 - (phys - 70) * 0.3 + Math.sin(m) * 6);

          // Fluxo de jogo
          const diff = (a.homeTeam.attackStrength - a.awayTeam.attackStrength) / 200;
          stats.homePossession = Math.round(clamp(50 + diff * 40 + Math.sin(m / 9) * 7, 35, 65));
          stats.awayPossession = 100 - stats.homePossession;
          const momentum = Math.sin(m / 7 + a.homeTeam.attackStrength) * 0.08;
          const homeAct = Math.random() < 0.5 + diff + momentum;
          const actSide: 'HOME' | 'AWAY' = homeAct ? 'HOME' : 'AWAY';
          const actTeam = homeAct ? a.homeTeam : a.awayTeam;
          const nm = (side: 'HOME' | 'AWAY', num: number) => d.roster[side][num - 1] ?? 'Camisa ' + num;
          const shortOf = (side: 'HOME' | 'AWAY') => (side === 'HOME' ? a.homeTeam.shortName : a.awayTeam.shortName);
          const idx01 = (side: 'HOME' | 'AWAY'): 0 | 1 => (side === 'HOME' ? 0 : 1);
          const rain = a.weather === 'CHUVA' ? 1.15 : 1;
          const mtxt = fmtMinute(m, a.half);
          let anim: GoalAnimationData | null = null;
          const fxs: PitchFx[] = [];
          if (Math.random() < 0.17 * PROFILE_INFO[a.profile].shots) {
            const who = nm(actSide, rnd(7, 11));
            if (homeAct) stats.homeShots += 1; else stats.awayShots += 1;
            if (Math.random() < 0.42) {
              if (homeAct) stats.homeShotsOnTarget += 1; else stats.awayShotsOnTarget += 1;
              if (Math.random() < 0.3 * rain * PROFILE_INFO[a.profile].goals) {
                anim = addGoal(d, actSide, m, false);
                fxs.push({ id: 0, kind: 'GOAL', team: idx01(actSide) });
              } else {
                d.ticker.unshift(mtxt + ' ' + pickOne(SHOT_SAVED).replace('{n}', who));
                fxs.push({ id: 0, kind: 'SHOT', team: idx01(actSide) });
              }
            } else {
              d.ticker.unshift(mtxt + ' ' + pickOne(SHOT_OFF).replace('{n}', who));
              fxs.push({ id: 0, kind: 'SHOT', team: idx01(actSide) });
            }
          }
          let fkTrigger: { foulSide: 'HOME' | 'AWAY'; name: string } | null = null;
          if (Math.random() < (0.1 + a.matchTemperature * 0.0012) * rain * PROFILE_INFO[a.profile].fouls) {
            const ha = a.homeTeam.aggressionLevel;
            const foulSide: 'HOME' | 'AWAY' = Math.random() < ha / (ha + a.awayTeam.aggressionLevel) ? 'HOME' : 'AWAY';
            if (foulSide === 'HOME') stats.homeFouls += 1; else stats.awayFouls += 1;
            const fNum = weightedPlayer(d.traits[foulSide]);
            const fName = nm(foulSide, fNum);
            const fTrait: Trait = d.traits[foulSide][fNum - 1] ?? 'NORMAL';
            const fKey = foulSide + fNum;
            d.fouls[fKey] = (d.fouls[fKey] ?? 0) + 1;
            d.ticker.unshift(mtxt + ' Falta de ' + fName + ' (' + shortOf(foulSide) + ') ' + pickOne(FOUL_TYPES) + '.');
            fxs.push({ id: 0, kind: 'FOUL', team: idx01(foulSide) });
            d.matchTemperature = Math.min(100, d.matchTemperature + 1.5);
            if (fTrait === 'PROVOCADOR') { d.matchTemperature = Math.min(100, d.matchTemperature + 1.5); d.ticker.unshift(mtxt + ' 😏 ' + fName + ' provoca o rival depois da falta.'); }
            soundEffects.playWhistle('SHORT');
            if (a.freeKicks < 4 && Math.random() < 0.3) fkTrigger = { foulSide, name: fName };
            const teamY = d.report.cards.filter(c => c.team === foulSide && c.cardType === 'YELLOW').length;
            const pCard = cardChance({ RIGOROSO: 0.17, DISCIPLINADOR: 0.14, PREVENTIVO: 0.11, DIALOGADOR: 0.1 }[a.approach], m, d.fouls[fKey], teamY, a.matchTemperature, fTrait);
            if (Math.random() < pCard * ((d.yellows[foulSide + fNum] ?? 0) >= 1 ? 0.1 : 1)) {
              const key = foulSide + fNum;
              const prev = d.yellows[key] ?? 0;
              const label = fName + ' (#' + fNum + ')';
              if (prev >= 1) {
                d.report.cards.push({ minute: m, team: foulSide, targetType: 'PLAYER', targetLabel: label, cardType: 'RED', reason: 'Segundo cartão amarelo' });
                if (foulSide === 'HOME') d.homeRedCards += 1; else d.awayRedCards += 1;
                d.ticker.unshift(mtxt + ' 🟥 Segundo amarelo! ' + fName + ' está expulso.');
                d.matchTemperature = Math.min(100, d.matchTemperature + 8);
                fxs.push({ id: 0, kind: 'RED', team: idx01(foulSide) });
              } else {
                d.yellows[key] = 1;
                d.report.cards.push({ minute: m, team: foulSide, targetType: 'PLAYER', targetLabel: label, cardType: 'YELLOW', reason: d.fouls[fKey] >= 2 ? 'Faltas repetidas' : 'Jogo faltoso' });
                d.ticker.unshift(mtxt + ' 🟨 Cartão amarelo para ' + fName + '.');
                d.matchTemperature = Math.min(100, d.matchTemperature + 3);
                fxs.push({ id: 0, kind: 'YELLOW', team: idx01(foulSide) });
              }
            }
          }
          if (Math.random() < 0.06) {
            if (homeAct) stats.homeCorners += 1; else stats.awayCorners += 1;
            d.ticker.unshift(mtxt + ' Escanteio para ' + actTeam.name + '.');
          }
          if (Math.random() < 0.04) {
            if (homeAct) stats.homeOffsides += 1; else stats.awayOffsides += 1;
            d.ticker.unshift(mtxt + ' Bandeira levantada: impedimento do ' + actTeam.shortName + '.');
          }
          if (Math.random() < 0.012) {
            const sSide: 'HOME' | 'AWAY' = Math.random() < 0.5 ? 'HOME' : 'AWAY';
            const si = d.traits[sSide].indexOf('SIMULADOR');
            if (si >= 0) d.ticker.unshift(mtxt + ' 🎭 ' + nm(sSide, si + 1) + ' cai pedindo falta, mas o contato foi leve. Você manda seguir ✓');
          }
          if (Math.random() < 0.012) {
            d.injuries += 1;
            const injSide: 'HOME' | 'AWAY' = Math.random() < 0.5 ? 'HOME' : 'AWAY';
            d.ticker.unshift(mtxt + ' 🚑 ' + pickOne(INJURY_LINES).replace('{n}', nm(injSide, rnd(2, 11))));
            fxs.push({ id: 0, kind: 'FOUL', team: idx01(injSide) });
          }
          if (m >= 58 && d.subsDone < 8 && Math.random() < 0.08) {
            const subSide: 'HOME' | 'AWAY' = Math.random() < 0.5 ? 'HOME' : 'AWAY';
            const outName = nm(subSide, rnd(2, 11));
            const inName = benchName([...d.roster.HOME, ...d.roster.AWAY]);
            d.subsDone += 1;
            d.ticker.unshift(mtxt + ' 🔁 Substituição no ' + shortOf(subSide) + ': sai ' + outName + ', entra ' + inName + ' (' + pickOne(SUB_REASONS) + ').');
          }
          if (d.matchTemperature >= 85 && d.brawls < 1 && Math.random() < 0.1) {
            d.brawls += 1;
            d.matchRating = clamp(d.matchRating - 0.25, 4, 10);
            const h = bookPlayer(d, 'HOME', rnd(2, 11), m, 'Tumulto');
            const w = bookPlayer(d, 'AWAY', rnd(2, 11), m, 'Tumulto');
            d.ticker.unshift(mtxt + ' 🥊 Tumulto em campo! Os dois times se empurram: ' + (h === 'RED' || w === 'RED' ? 'há expulsão.' : 'dois amarelos.') + ' Faltou controle da pressão ✕');
            d.report.interactionNotes = [...(d.report.interactionNotes ?? []), mtxt + ' Tumulto por falta de controle da pressão ✕'];
            d.matchTemperature = clamp(d.matchTemperature - 12, 20, 100);
            fxs.push({ id: 0, kind: 'FOUL', team: 0 });
          }
          const rank: Record<PitchFx['kind'], number> = { GOAL: 5, RED: 4, YELLOW: 3, FOUL: 2, SHOT: 1 };
          const top = [...fxs].sort((x, y) => rank[y.kind] - rank[x.kind])[0];
          const goalPatch = {
            ...(anim ? { currentGoalAnimation: anim } : {}),
            ...(top ? { pitchFx: { ...top, id: Date.now() + Math.random() } } : {})
          };

          const incident = a.scheduledIncidents.find(i => i.minute === m && !state.resolvedIncidentIds.includes(i.id));
          if (incident) {
            soundEffects.playRadioBeep();
            d.ticker.unshift('[LANCE DECISIVO - ' + m + "'] " + incident.title);
            d.status = 'KMI_PAUSED';
            d.currentIncident = incident;
            d.matchTemperature = Math.min(100, a.matchTemperature + 20);
            set({ liveStats: stats, activeMatch: d, ...goalPatch, ...tipFor(state, 'decisive') });
            return;
          }
          if (a.half === 1 && m >= 45) {
            let stop = a.stoppage1;
            if (stop === null) {
              stop = stoppageFor(1, d.report.varReviews.filter(v => v.minute <= 45).length, d.report.cards.filter(c => c.minute <= 45).length, d.injuries, d.report.goals.filter(g => g.minute <= 45).length);
              d.stoppage1 = stop;
              d.ticker.unshift("45' O quarto árbitro indica " + stop + ' minuto(s) de acréscimo.');
              soundEffects.playWhistle('SHORT');
            }
            if (m >= 45 + stop) {
              soundEffects.playWhistle('TRIPLE');
              d.status = 'HALF_TIME';
              d.ticker.unshift(fmtMinute(m, 1) + ' Fim do primeiro tempo. Intervalo.');
              set({ liveStats: stats, activeMatch: d, ...goalPatch, ...tipFor(state, 'halftime') });
              return;
            }
          }
          if (a.half === 2 && m >= 90) {
            let stop = a.stoppage2;
            if (stop === null) {
              stop = stoppageFor(2, d.report.varReviews.filter(v => v.minute > 45).length, d.report.cards.filter(c => c.minute > 45).length, d.injuries, d.report.goals.filter(g => g.minute > 45).length);
              d.stoppage2 = stop;
              d.ticker.unshift("90' O quarto árbitro indica " + stop + ' minuto(s) de acréscimo.');
              soundEffects.playWhistle('SHORT');
            }
            if (m >= 90 + stop) {
              soundEffects.playWhistle('TRIPLE');
              d.status = 'FINISHED';
              d.ticker.unshift(fmtMinute(m, 2) + ' Fim de partida! Apito final.');
              d.report = {
                ...d.report,
                matchLog: [...d.ticker].reverse(),
                highlights: d.highlights.slice(0, 12),
                reaction: reactionFor(d),
                extra: {
                  brawls: d.brawls,
                  decTotal: d.decisionsHistory.length, decCorrect: d.decisionsHistory.filter(x => x.isCorrect).length,
                  endTemp: Math.round(d.matchTemperature), difficulty: state.difficulty
                },
                observer: buildObserver({
                  rating: d.matchRating,
                  decisions: d.decisionsHistory.map(x => ({ correct: x.isCorrect, title: x.incident.title, minute: x.incident.minute })),
                  temperature: d.matchTemperature, physical: state.referee.attributes.physicalCondition, approach: d.approach,
                  notes: d.report.interactionNotes ?? [], cards: d.report.cards.length, reds: d.report.cards.filter(c => c.cardType === 'RED').length
                })
              };
              set({ liveStats: stats, activeMatch: d, ...goalPatch });
              void get().evaluatePostMatch();
              return;
            }
          }

          // Técnico se exaltando
          const ejected = { HOME: state.homeManagerEjected, AWAY: state.awayManagerEjected };
          if (m > 10 && a.managerIncidents < 2 && Math.random() < (0.015 + (a.matchTemperature / 100) * 0.03) * APPROACH_FACTOR[a.approach]) {
            const team: 'HOME' | 'AWAY' = Math.random() < 0.5 ? 'HOME' : 'AWAY';
            if (!ejected[team]) {
              const t = team === 'HOME' ? a.homeTeam : a.awayTeam;
              const intensity = pick<ManagerIncident['intensity']>(['MODERADA', 'ACINTOSA', 'HOSTIL']);
              const line = pick(MANAGER_LINES[intensity]);
              d.managerIncidents += 1;
              soundEffects.playWhistle('SHORT');
              set({
                liveStats: stats, activeMatch: d, ...goalPatch,
                currentManagerIncident: { minute: m, team, managerName: t.managerName, teamName: t.name, reason: line.reason, quote: line.quote, intensity }
              });
              return;
            }
          }
          if (m > 12 && a.captainTalks < 1 && Math.random() < (0.012 + (a.matchTemperature / 100) * 0.025) * APPROACH_FACTOR[a.approach]) {
            const team: 'HOME' | 'AWAY' = Math.random() < 0.5 ? 'HOME' : 'AWAY';
            const tm = team === 'HOME' ? a.homeTeam : a.awayTeam;
            const c = pick(CAPTAIN_COMPLAINTS);
            d.captainTalks += 1;
            soundEffects.playWhistle('SHORT');
            set({
              liveStats: stats, activeMatch: d, ...goalPatch, ...tipFor(state, 'captain'),
              captainTalk: { minute: m, team, teamName: tm.name, captainName: d.roster[team][captainNumber(d.traits[team]) - 1] ?? 'Capitão', complaint: c.text, heat: c.heat }
            });
            return;
          }
          if (fkTrigger) {
            const attackSide: 'HOME' | 'AWAY' = fkTrigger.foulSide === 'HOME' ? 'AWAY' : 'HOME';
            const dist = rnd(17, 31);
            const atkTeam = attackSide === 'HOME' ? a.homeTeam : a.awayTeam;
            const fkIdx: 0 | 1 = attackSide === 'HOME' ? 0 : 1;
            d.freeKicks += 1;
            d.ticker.unshift(mtxt + ' 🎯 Falta perigosa para o ' + atkTeam.name + ', a ' + dist + ' m do gol.');
            let fkAnim: GoalAnimationData | null = null;
            if (Math.random() < freeKickGoalChance(dist)) fkAnim = addGoal(d, attackSide, m, false, 'de falta, a ' + dist + ' m');
            else d.ticker.unshift(mtxt + ' Cobrança do ' + atkTeam.name + ': ' + pickOne(FK_MISS));
            if (attackSide === 'HOME') stats.homeShots += 1; else stats.awayShots += 1;
            set({
              liveStats: stats, activeMatch: d, ...goalPatch, ...(fkAnim ? { currentGoalAnimation: fkAnim } : {}),
              pitchFx: { id: Date.now() + Math.random(), kind: fkAnim ? 'GOAL' : 'SHOT', team: fkIdx }
            });
            return;
          }
          set({ liveStats: stats, activeMatch: d, ...goalPatch, ...(d.matchTemperature >= 62 ? tipFor(state, 'pressure') : {}) });
        },

        triggerInstantFieldDecision: decision => settle(decision, false),
        confirmFinalDecision: decision => settle(decision, true),

        openVarRadioIntercom: () => {
          soundEffects.playRadioBeep();
          const a = get().activeMatch;
          if (a) set({ activeMatch: { ...a, status: 'VAR_RADIO' } });
        },
        openVarMonitorOFR: () => {
          const a = get().activeMatch;
          if (a) set({ activeMatch: { ...a, status: 'VAR_ACTIVE' } });
        },

        resolveManagerIncident: action => {
          const { currentManagerIncident: mi, activeMatch: a } = get();
          if (!mi || !a) return;
          const expected = mi.intensity === 'HOSTIL' ? 'RED_CARD' : mi.intensity === 'ACINTOSA' ? 'YELLOW_CARD' : 'VERBAL_WARNING';
          const ok = action === expected;
          const d = draft(a);
          if (action !== 'VERBAL_WARNING') {
            d.report.cards.push({
              minute: mi.minute, team: mi.team, targetType: 'MANAGER', targetLabel: 'Téc. ' + mi.managerName,
              cardType: action === 'RED_CARD' ? 'RED' : 'YELLOW', reason: mi.reason
            });
          }
          d.matchRating = clamp(a.matchRating + (ok ? 0.1 : -0.4), 4, 10);
          d.matchTemperature = clamp(a.matchTemperature + (ok ? -8 : 8), 20, 100);
          d.ticker.unshift('Área técnica: ' + action + (ok ? ' ✓' : ' ✕'));
          d.report.interactionNotes = [...(d.report.interactionNotes ?? []), mi.minute + "' Técnico " + mi.managerName + ': ' + action + (ok ? ' ✓' : ' ✕')];
          soundEffects.playWhistle(action === 'RED_CARD' ? 'TRIPLE' : 'SHORT');
          set(s => ({
            currentManagerIncident: null,
            activeMatch: d,
            homeManagerEjected: action === 'RED_CARD' && mi.team === 'HOME' ? true : s.homeManagerEjected,
            awayManagerEjected: action === 'RED_CARD' && mi.team === 'AWAY' ? true : s.awayManagerEjected
          }));
        },

        evaluatePostMatch: async () => {
          const s = get();
          const a = s.activeMatch;
          if (!a) return;
          set({ isEvaluatingPostMatch: true });
          const res = buildPostMatchMedia(
            a.homeTeam.name, a.awayTeam.name, a.homeScore + '-' + a.awayScore, a.matchRating, s.referee.name,
            a.decisionsHistory,
            { yellows: a.report.cards.filter(c => c.cardType === 'YELLOW').length, reds: a.report.cards.filter(c => c.cardType === 'RED').length, brawls: a.brawls }
          );
          const cur = get().activeMatch;
          if (!cur || cur.status !== 'FINISHED') { set({ isEvaluatingPostMatch: false }); return; }
          set({
            isEvaluatingPostMatch: false,
            activeMatch: {
              ...cur,
              report: { ...cur.report, mediaMesaRedonda: res.mediaMesaRedonda, decisionVerdicts: res.decisionVerdicts, pressHeadline: res.mediaMesaRedonda.headline }
            }
          });
        },

        finishMatch: async () => {
          const s = get();
          const m = s.activeMatch;
          if (!m) return;
          const rating = Number(m.matchRating.toFixed(2));
          const reaction = m.report.reaction ?? reactionFor(m);
          const report: MatchReport = { ...m.report, homeScore: m.homeScore, awayScore: m.awayScore, uefaScore: rating, matchStats: s.liveStats, reaction };
          const grudges = updateGrudges(s.grudges, { HOME: m.homeTeam.id, AWAY: m.awayTeam.id }, m.wrongHarm, rating);

          // Resultados da rodada: o jogo do árbitro e a simulação dos demais
          const round = s.seasonGame;
          const fixtures = s.fixtures.map(f => {
            if (f.round !== round || f.played) return f;
            if (f.refMatch) return { ...f, played: true, homeScore: m.homeScore, awayScore: m.awayScore };
            const h = s.teams.find(t => t.id === f.homeId);
            const a = s.teams.find(t => t.id === f.awayId);
            if (!h || !a) return { ...f, played: true };
            const [hs, ga] = simulateScore(h, a);
            return { ...f, played: true, homeScore: hs, awayScore: ga };
          });

          const r = s.referee;
          const n = r.stats.matches + 1;
          const avg = Number(((r.uefaAverageScore * r.stats.matches + rating) / n).toFixed(2));
          const seasonEnd = round >= 6;
          const allReports = [report, ...s.matchHistory];
          const inSeason = allReports.filter(x => x.season === s.season);
          const expected = Math.max(1, Math.min(round - s.declinesUsed, allReports.length));
          const last6 = inSeason.length >= expected ? inSeason : allReports.slice(0, expected);
          const seasonAvg = Number((last6.reduce((acc, x) => acc + x.uefaScore, 0) / last6.length).toFixed(2));
          const news: string[] = [];
          const inbox: InboxMessage[] = [federationFeedback(rating, round, s.week, report)];
          let tier = r.tier;
          let outcome: SeasonRecord['outcome'] = 'MANTIDO';
          const idx = TIERS.indexOf(r.tier);
          if (seasonEnd) {
            news.push('Fim da temporada ' + s.season + '! Média no ano: ' + seasonAvg.toFixed(2) + '. Bônus de R$ 2.000.');
            if (seasonAvg > 9.0 && idx >= 0 && idx < TIERS.length - 1) {
              tier = TIERS[idx + 1]; outcome = 'PROMOVIDO';
              news.unshift('PROMOÇÃO! Você subiu para a ' + tierLabel(tier) + '.');
            } else if (seasonAvg < 7 && idx > 0) {
              tier = TIERS[idx - 1]; outcome = 'REBAIXADO';
              news.unshift('REBAIXAMENTO: você voltou para a ' + tierLabel(tier) + '.');
            }
            const champion = computeStandings(fixtures, s.teams)[0]?.team.name ?? '-';
            inbox.unshift({
              id: 'season-' + s.season, week: s.week, from: 'Presidência da Federação', read: false,
              tone: outcome === 'PROMOVIDO' ? 'POSITIVE' : outcome === 'REBAIXADO' ? 'NEGATIVE' : 'NEUTRAL',
              subject: 'Balanço da temporada ' + s.season + ' • ' + outcome,
              body: 'O campeão da ' + tierLabel(r.tier) + ' foi o ' + champion + '. Sua média no ano foi ' + seasonAvg.toFixed(2) + (outcome === 'MANTIDO' ? '. Você segue na mesma divisão.' : '. Resultado: ' + outcome.toLowerCase() + '.')
            });
          }
          let goalBonus = 0;
          let goalRep = 0;
          if (seasonEnd && s.seasonGoals.length > 0) {
            const gs = evaluateGoals(s.seasonGoals, last6, true);
            const won = s.seasonGoals.filter(g => gs.find(x => x.id === g.id)?.done);
            goalBonus = won.reduce((acc, g) => acc + g.reward, 0);
            goalRep = won.reduce((acc, g) => acc + g.repReward, 0);
            news.push(won.length + ' de ' + s.seasonGoals.length + ' metas cumpridas' + (goalBonus ? ': bônus de R$ ' + goalBonus.toLocaleString() + '.' : '.'));
            inbox.unshift({
              id: 'goals-' + s.season, week: s.week, from: 'Comissão de Arbitragem', read: false, tone: won.length >= 2 ? 'POSITIVE' : won.length === 1 ? 'NEUTRAL' : 'NEGATIVE',
              subject: 'Metas da temporada ' + s.season + ': ' + won.length + '/' + s.seasonGoals.length,
              body: s.seasonGoals.map(g => (gs.find(x => x.id === g.id)?.done ? '✓ ' : '✕ ') + g.label).join('\n') + (goalBonus ? '\nBônus recebido: R$ ' + goalBonus.toLocaleString() + '.' : '')
            });
          }
          const pay = Math.round((PAY[r.tier] ?? 800) * (m.big ? 1.3 : 1)) + (seasonEnd ? 2000 : 0) + goalBonus - (s.nextMatchSchedule?.travelCost ?? 0);
          const gHome = grudges[m.homeTeam.id] ?? 0;
          const gAway = grudges[m.awayTeam.id] ?? 0;
          const gMax = Math.max(gHome, gAway);
          const pressQs = gMax >= 45 ? [grudgeQuestion(gHome >= gAway ? m.homeTeam.name : m.awayTeam.name, gMax), ...pickPress().slice(0, 1)] : pickPress();
          const champ = seasonEnd ? computeStandings(fixtures, s.teams)[0]?.team.name ?? '-' : '';
          set({
            fixtures: seasonEnd ? buildSeason(tier, s.teams, s.season + 1, refereedCounts([report, ...s.matchHistory], s.teams)) : fixtures,
            seasonHistory: seasonEnd ? [...s.seasonHistory, { season: s.season, tier: r.tier, champion: champ, avg: seasonAvg, matches: last6.length, outcome }] : s.seasonHistory,
            inbox: [...inbox, ...s.inbox].slice(0, 30),
            matchHistory: [report, ...s.matchHistory],
            careerNews: [...news, ...s.careerNews].slice(0, 5),
            referee: {
              ...r, tier, uefaAverageScore: avg,
              bankBalance: r.bankBalance + pay - r.weeklyExpenses,
              reputation: clamp(r.reputation + (rating >= 8.4 ? 1 : -1) + reaction.repDelta + goalRep, 0, 100),
              stats: {
                matches: n,
                yellowCards: r.stats.yellowCards + report.cards.filter(c => c.cardType === 'YELLOW').length,
                redCards: r.stats.redCards + report.cards.filter(c => c.cardType === 'RED').length,
                penalties: r.stats.penalties + report.goals.filter(g => g.isPenalty).length,
                varInterventions: r.stats.varInterventions + report.varReviews.length
              }
            },
            activeMatch: null, currentGoalAnimation: null, currentManagerIncident: null, captainTalk: null, penaltyKick: null,
            pressConference: { questions: pressQs, index: 0 },
            grudges,
            rivals: seasonEnd ? initRivals() : stepRivals(s.rivals),
            seasonGoals: seasonEnd ? makeSeasonGoals() : s.seasonGoals,
            declinesUsed: seasonEnd ? 0 : s.declinesUsed,
            careerEvent: pickCareerEvent(s.lastEventId),
            lesson: null, tip: null,
            week: s.week + 1, actionPoints: 3,
            season: seasonEnd ? s.season + 1 : s.season, seasonGame: seasonEnd ? 1 : s.seasonGame + 1
          });
          await get().drawNextSchedule();
        },

        spendActionPoint: type => {
          const s = get();
          if (s.actionPoints <= 0) return;
          const at = { ...s.referee.attributes };
          if (type === 'PHYSICAL') at.physicalCondition = clamp(at.physicalCondition + 3, 0, 100);
          if (type === 'RULES') at.ruleKnowledge = clamp(at.ruleKnowledge + 3, 0, 100);
          if (type === 'PSYCHOLOGY') { at.stressResistance = clamp(at.stressResistance + 3, 0, 100); at.authority = clamp(at.authority + 1, 0, 100); }
          if (type === 'REST') { at.physicalCondition = clamp(at.physicalCondition + 1, 0, 100); at.stressResistance = clamp(at.stressResistance + 2, 0, 100); }
          set({ actionPoints: s.actionPoints - 1, referee: { ...s.referee, attributes: at } });
        },

        fixPenalty: what => {
          const pk = get().penaltyKick;
          if (!pk) return;
          set({ penaltyKick: what === 'GK' ? { ...pk, fixedGk: true } : { ...pk, fixedPlayers: true } });
        },

        kickPenalty: () => {
          const s = get();
          const pk = s.penaltyKick;
          const a = s.activeMatch;
          if (!pk || !a) return;
          const d = draft(a);
          const mtxt = fmtMinute(pk.minute, d.half);
          const gkBad = pk.gkOff && !pk.fixedGk;
          const inBad = pk.playersIn && !pk.fixedPlayers;
          let delta = 0;
          let note = 'cobrança regular';
          let verdict = '~';
          if (gkBad || inBad) { delta = -0.15; note = gkBad && inBad ? 'goleiro adiantado e invasão da área' : gkBad ? 'goleiro adiantado' : 'invasão da área'; verdict = '✕'; }
          else if (pk.gkOff || pk.playersIn) { delta = 0.1; note = 'irregularidades corrigidas antes da cobrança'; verdict = '✓'; }
          const chance = 0.75 - (gkBad ? 0.15 : 0);
          let anim: GoalAnimationData | null = null;
          const idx: 0 | 1 = pk.attackSide === 'HOME' ? 0 : 1;
          let fx: PitchFx;
          if (Math.random() < chance) {
            anim = addGoal(d, pk.attackSide, pk.minute, true);
            fx = { id: Date.now() + Math.random(), kind: 'GOAL', team: idx };
          } else {
            d.ticker.unshift(mtxt + ' ' + pk.keeper + ' defende a cobrança de ' + pk.shooter + '!');
            fx = { id: Date.now() + Math.random(), kind: 'SHOT', team: idx };
          }
          d.matchRating = clamp(a.matchRating + delta, 4, 10);
          d.report.interactionNotes = [...(d.report.interactionNotes ?? []), mtxt + ' Pênalti: ' + note + ' ' + verdict];
          soundEffects.playWhistle('SHORT');
          set({ penaltyKick: null, activeMatch: d, pitchFx: fx, ...(anim ? { currentGoalAnimation: anim } : {}) });
        },

        strongWhistle: () => {
          const a = get().activeMatch;
          if (!a || a.status !== 'PLAYING') return;
          const d = draft(a);
          if (a.whistles >= 5) { d.ticker.unshift('📢 Você já usou o apito forte 5 vezes: o efeito se perdeu.'); set({ activeMatch: d }); return; }
          if (a.minute - a.lastWhistleMin < 6) { d.ticker.unshift('📢 Aguarde alguns minutos para usar o apito forte de novo.'); set({ activeMatch: d }); return; }
          d.whistles += 1;
          d.lastWhistleMin = a.minute;
          if (a.matchTemperature > 55) {
            d.matchTemperature = clamp(a.matchTemperature - 12, 20, 100);
            d.matchRating = clamp(a.matchRating + 0.03, 4, 10);
            d.ticker.unshift(fmtMinute(a.minute, a.half) + ' 📢 Apito forte e firme: o jogo esfria e volta ao controle ✓');
          } else {
            d.matchRating = clamp(a.matchRating - 0.05, 4, 10);
            d.ticker.unshift(fmtMinute(a.minute, a.half) + ' 📢 Apito forte sem necessidade: os jogadores reclamam ✕');
          }
          soundEffects.playWhistle('LONG');
          set({ activeMatch: d });
        },

        setApproach: a => set({ approach: a }),

        resolveCaptainTalk: choice => {
          const { captainTalk: ct, activeMatch: a } = get();
          if (!ct || !a) return;
          const best = ct.heat >= 3 ? 'WARN' : 'EXPLAIN';
          const okay = choice === best || (ct.heat === 2 && choice !== 'IGNORE') || (ct.heat === 1 && choice === 'IGNORE');
          const delta = choice === best ? 0.1 : okay ? 0.03 : -0.3;
          const d = draft(a);
          d.matchRating = clamp(a.matchRating + delta, 4, 10);
          d.matchTemperature = clamp(a.matchTemperature + (choice === 'EXPLAIN' ? -7 : choice === 'WARN' ? -3 : okay ? 0 : 9), 20, 100);
          const label = choice === 'EXPLAIN' ? 'explicou com calma' : choice === 'WARN' ? 'deu advertência firme' : 'ignorou o protesto';
          d.report.interactionNotes = [...(d.report.interactionNotes ?? []), ct.minute + "' Capitão " + ct.captainName + ' (' + ct.teamName + '): árbitro ' + label + (choice === best ? ' ✓' : okay ? ' ~' : ' ✕')];
          d.ticker.unshift(ct.minute + "' Conversa com o capitão: " + label + (choice === best ? ' ✓' : okay ? ' ~' : ' ✕'));
          soundEffects.playWhistle('SHORT');
          set({ captainTalk: null, activeMatch: d });
        },

        answerPress: optionIndex => {
          const s = get();
          const pc = s.pressConference;
          if (!pc) return;
          const q = pc.questions[pc.index];
          const opt = q?.options[optionIndex];
          const rep = opt ? clamp(s.referee.reputation + opt.reputation, 0, 100) : s.referee.reputation;
          set({
            referee: { ...s.referee, reputation: rep },
            pressConference: pc.index + 1 < pc.questions.length ? { ...pc, index: pc.index + 1 } : null
          });
        },

        setDifficulty: d => set({ difficulty: d }),
        dismissTip: () => set({ tip: null }),
        dismissLesson: () => set({ lesson: null }),

        answerCareerEvent: i => {
          const s = get();
          const ev = s.careerEvent;
          const o = ev?.options[i];
          if (!ev || !o) return;
          const at = { ...s.referee.attributes };
          if (o.physical) at.physicalCondition = clamp(at.physicalCondition + o.physical, 0, 100);
          if (o.stress) at.stressResistance = clamp(at.stressResistance + o.stress, 0, 100);
          if (o.rules) at.ruleKnowledge = clamp(at.ruleKnowledge + o.rules, 0, 100);
          set({
            careerEvent: null, lastEventId: ev.id,
            careerNews: [ev.title.replace(/^\S+\s/, '') + ': ' + o.result, ...s.careerNews].slice(0, 5),
            referee: { ...s.referee, bankBalance: s.referee.bankBalance + o.money, reputation: clamp(s.referee.reputation + o.rep, 0, 100), attributes: at }
          });
        },

        declineAssignment: async () => {
          const s = get();
          if (s.activeMatch || !s.nextMatchSchedule || s.declinesUsed >= 1 || s.seasonGame >= 6) return;
          const round = s.seasonGame;
          const fixtures = s.fixtures.map(f => {
            if (f.round !== round || f.played) return f;
            const h = s.teams.find(t => t.id === f.homeId);
            const aw = s.teams.find(t => t.id === f.awayId);
            if (!h || !aw) return { ...f, played: true };
            const [hs, as2] = simulateScore(h, aw);
            return { ...f, played: true, homeScore: hs, awayScore: as2 };
          });
          set({
            fixtures, seasonGame: round + 1, week: s.week + 1, actionPoints: 3, declinesUsed: s.declinesUsed + 1, nextMatchSchedule: null,
            careerNews: ['Você recusou a escala da rodada ' + round + '. A federação anotou.', ...s.careerNews].slice(0, 5),
            referee: { ...s.referee, reputation: clamp(s.referee.reputation - 2, 0, 100) }
          });
          await get().drawNextSchedule();
        },

        exportCareer: () => JSON.stringify({ app: 'o-apito', version: 6, savedAt: new Date().toISOString(), state: persistPart(get()) }),

        importCareer: json => {
          try {
            const o = JSON.parse(json) as { app?: string; state?: Record<string, unknown> };
            const ref = o.state?.referee as { name?: unknown } | undefined;
            if (o.app !== 'o-apito' || !o.state || !ref || typeof ref.name !== 'string') return false;
            set({
              ...(o.state as Partial<GameState>), activeMatch: null, pressConference: null, penaltyKick: null, captainTalk: null,
              currentManagerIncident: null, currentGoalAnimation: null, lesson: null, tip: null
            });
            void get().drawNextSchedule();
            return true;
          } catch { return false; }
        },

        markInboxRead: () => set(s => ({ inbox: s.inbox.map(x => ({ ...x, read: true })) })),

        resetCareer: () => {
          localStorage.removeItem('o-apito-v5');
          window.location.reload();
        }
      };
    },
    {
      name: 'o-apito-v5',
      partialize: persistPart,
      merge: (persisted, current) => {
        const m = { ...current, ...(persisted as Partial<GameState>) };
        const valid = GOAL_POOL.map(g => g.id);
        const goals = (m.seasonGoals ?? []).filter(g => valid.includes(g.id));
        return { ...m, seasonGoals: goals.length > 0 ? goals : makeSeasonGoals() };
      }
    }
  )
);
