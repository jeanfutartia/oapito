export type DecisionType = 'PLAY_ON' | 'FOUL' | 'YELLOW_CARD' | 'RED_CARD' | 'PENALTY' | 'PENALTY_YELLOW' | 'PENALTY_RED' | 'GOAL_VALID' | 'GOAL_DISALLOWED';
export type RefereeStyle = 'RIGOROSO' | 'DIALOGADOR' | 'DISCIPLINADOR' | 'PREVENTIVO';
export type DivisionTier = 'SERIE_D' | 'SERIE_C' | 'SERIE_B' | 'SERIE_A' | 'FIFA_INTERNACIONAL';
export interface RefereeAttributes { physicalCondition: number; stressResistance: number; authority: number; ruleKnowledge: number; integrity: number }
export interface RefereeProfile { name: string; age: number; federation: string; style: RefereeStyle; tier: DivisionTier; bankBalance: number; weeklyExpenses: number; reputation: number; uefaAverageScore: number; geminiApiKey?: string; attributes: RefereeAttributes; stats: { matches: number; yellowCards: number; redCards: number; penalties: number; varInterventions: number } }
export interface Team { id: string; name: string; shortName: string; tier: DivisionTier; primaryColor: string; secondaryColor: string; points: number; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; aggressionLevel: number; attackStrength: number; defenseStrength: number; stadiumName: string; managerName: string }
export interface IncidentFrame { frameIndex: 0 | 1 | 2; label: string; timecode: string; subtitle: string; svgGraphicType: 'BOX_PENALTY' | 'SLIDE_TACKLE' | 'HAND_BALL' | 'OFFSIDE_3D'; attackerNumber: number; defenderNumber: number; speedKmh: number; metricDetail: string }
export interface IncidentPitchZone { xPercent: number; yPercent: number; name: string }
export interface Incident { variant?: string; id: string; minute: number; category: 'PENALTI_DISPUTA' | 'MAO_VOLUMETRIA' | 'IMPEDIMENTO_3D' | 'FORCA_EXCESSIVA' | 'DOGSO_CHANCE_CLARA' | 'GOL_POLÊMICO'; title: string; description: string; context: string; pitchZone: IncidentPitchZone; offendingTeam: 'HOME' | 'AWAY'; attackingTeam: 'HOME' | 'AWAY'; offendingPlayerNumber: number; victimPlayerNumber: number; recommendedVarDecision: DecisionType; acceptableDecisions: DecisionType[]; ifabExplanation: string; defaultVarDialogue: string; frames: IncidentFrame[] }
export interface PreMatchStoryline { pressHeadline: string; homeManagerQuote: string; awayManagerQuote: string; scrutinyContext: string }
export interface ManagerIncident { minute: number; team: 'HOME' | 'AWAY'; managerName: string; teamName: string; reason: string; quote: string; intensity: 'MODERADA' | 'ACINTOSA' | 'HOSTIL' }
export interface MatchLiveStats { homePossession: number; awayPossession: number; homeShots: number; awayShots: number; homeShotsOnTarget: number; awayShotsOnTarget: number; homeFouls: number; awayFouls: number; homeCorners: number; awayCorners: number; homeOffsides: number; awayOffsides: number; refereeBpm: number; distanceCoveredKm: number }
export interface GoalAnimationData { teamName: string; teamColor: string; minute: number; playerNumber: number; isPenalty: boolean }
export interface MatchReportGoal { minute: number; team: 'HOME' | 'AWAY'; playerNumber: number; isPenalty: boolean }
export interface MatchReportCard { minute: number; team: 'HOME' | 'AWAY'; targetType: 'PLAYER' | 'MANAGER'; targetLabel: string; cardType: 'YELLOW' | 'RED'; reason: string }
export interface MatchReportVarEvent { minute: number; title: string; decision: DecisionType; overturned: boolean }
export interface DecisionVerdictReport { minute: number; incidentTitle: string; refereeDecision: DecisionType; recommendedDecision: DecisionType; isCorrect: boolean; geminiAnalysis: string }
export interface MediaMesaRedonda { programName: string; headline: string; refereeExpertAnalysis: string; journalistOpinion: string; verdictSummary: string }
export interface MatchReport { season?: number; highlights?: HighlightItem[]; reaction?: Reaction; extra?: MatchExtra; matchLog?: string[]; lineups?: { home: string[]; away: string[] }; competition?: string; round?: number; refereeName?: string; homeColor?: string; awayColor?: string; homeShort?: string; awayShort?: string; approach?: RefereeStyle; officials?: Officials; observer?: ObserverReport; interactionNotes?: string[]; id: string; week: number; tier: DivisionTier; stadium: string; homeTeamName: string; awayTeamName: string; homeScore: number; awayScore: number; uefaScore: number; dateStr: string; attendance: number; pressHeadline: string; matchStats: MatchLiveStats; mediaMesaRedonda?: MediaMesaRedonda; decisionVerdicts: DecisionVerdictReport[]; goals: MatchReportGoal[]; cards: MatchReportCard[]; varReviews: MatchReportVarEvent[] }
export interface RadioChatMessage { sender: 'VAR' | 'REF'; text: string }
export interface Officials { assistant1: string; assistant2: string; fourth: string; var: string; avar: string }
export interface ObserverReport { scores: { label: string; value: number }[]; comment: string; highlights: string[] }
export interface Fixture { id: string; round: number; homeId: string; awayId: string; played: boolean; homeScore: number; awayScore: number; refMatch: boolean }
export interface SeasonRecord { season: number; tier: DivisionTier; champion: string; avg: number; matches: number; outcome: 'PROMOVIDO' | 'REBAIXADO' | 'MANTIDO' }
export interface InboxMessage { id: string; week: number; from: string; subject: string; body: string; tone: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'; read: boolean }
export interface CaptainTalk { minute: number; team: 'HOME' | 'AWAY'; teamName: string; captainName: string; complaint: string; heat: 1 | 2 | 3 }
export interface PressOption { label: string; reply: string; reputation: number }
export interface PressQuestion { question: string; journalist: string; options: PressOption[] }

export type Trait = 'LIDER' | 'VIOLENTO' | 'PROVOCADOR' | 'SIMULADOR' | 'NORMAL';
export type Difficulty = 'INICIANTE' | 'NORMAL' | 'ESPECIALISTA';
export interface HighlightItem { id: string; minute: number; kind: 'GOAL' | 'VAR'; title: string; team: 'HOME' | 'AWAY'; incident: Incident }
export interface ReactionPost { who: string; handle: string; text: string; tone: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' }
export interface Reaction { crowd: string; press: string; posts: ReactionPost[]; repDelta: number }
export interface SeasonGoal { id: string; label: string; hint: string; target: number; reward: number; repReward: number }
export interface Rival { name: string; avg: number; matches: number }
export interface CareerEventOption { label: string; result: string; money: number; rep: number; physical?: number; stress?: number; rules?: number }
export interface CareerEvent { id: string; title: string; body: string; options: CareerEventOption[] }
export interface MatchExtra { brawls: number; decTotal: number; decCorrect: number; endTemp: number; difficulty: Difficulty }
