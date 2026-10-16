import type {
  CareerEvent, DecisionType, Difficulty, DivisionTier, HighlightItem, Incident, MatchReport, PressQuestion,
  Reaction, ReactionPost, Rival, SeasonGoal, Team, Trait
} from '../types/types';

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

// ---------- Dificuldade ----------
export const DIFFICULTY: Record<Difficulty, { label: string; desc: string; heat: number; penalty: number; hints: boolean; lessons: 'ALL' | 'WRONG' | 'NONE'; tips: boolean }> = {
  INICIANTE: { label: 'Iniciante', desc: 'Dicas durante o jogo, explicação de cada lance e partidas mais calmas.', heat: 0.88, penalty: 0.7, hints: true, lessons: 'ALL', tips: true },
  NORMAL: { label: 'Normal', desc: 'Jogo equilibrado. Você vê a explicação quando erra.', heat: 1, penalty: 1, hints: false, lessons: 'WRONG', tips: true },
  ESPECIALISTA: { label: 'Especialista', desc: 'Sem ajuda. Pressão maior e erros custam mais caro.', heat: 1.1, penalty: 1.25, hints: false, lessons: 'NONE', tips: false }
};

export const HINTS: Record<Incident['category'], string> = {
  PENALTI_DISPUTA: 'Veja se houve contato de verdade e se o defensor chegou na bola primeiro. Contato dentro da área pode ser pênalti.',
  MAO_VOLUMETRIA: 'Pergunte: o braço estava longe do corpo? A mão foi até a bola, ou a bola veio na mão sem chance de fugir?',
  IMPEDIMENTO_3D: 'Marque o instante do último toque. O atacante só está impedido se estiver à frente do último defensor naquele momento.',
  FORCA_EXCESSIVA: 'Olhe a altura e a força da entrada. Travas à mostra e contato na canela pedem cartão mais forte.',
  DOGSO_CHANCE_CLARA: 'Se o jogador impediu um gol claro, o cartão pode ser vermelho. Veja se a jogada tinha chance real de gol.',
  GOL_POLÊMICO: 'Antes de validar o gol, veja se houve falta ou mão do atacante na jogada anterior.'
};

export const TIPS: Record<string, string> = {
  start: 'Bem-vindo ao campo! O jogo roda sozinho. Quando aparecer um lance decisivo, ele pausa e você decide.',
  pressure: 'A pressão está subindo. Use o 📢 apito forte, converse com o capitão e seja justo com os dois times para esfriar o jogo.',
  decisive: 'Lance decisivo! Você pode mandar seguir, falar com o VAR ou revisar no monitor. Use as câmeras e as linhas para decidir.',
  captain: 'O capitão veio reclamar. Explicar com calma serve na maioria dos casos. Se o ânimo está muito quente, dê uma advertência.',
  penalty: 'Pênalti! Antes da cobrança, confira se o goleiro está na linha e se ninguém entrou na área.',
  halftime: 'Intervalo. O segundo tempo costuma ser mais quente: fique atento aos jogadores já amarelados.'
};

// ---------- Personalidades ----------
export const TRAIT_LABEL: Record<Trait, string> = { LIDER: 'Capitão', VIOLENTO: 'Jogo duro', PROVOCADOR: 'Provocador', SIMULADOR: 'Cai fácil', NORMAL: '' };
export const TRAIT_ICON: Record<Trait, string> = { LIDER: '🎖️', VIOLENTO: '💢', PROVOCADOR: '😏', SIMULADOR: '🎭', NORMAL: '' };
export const FOUL_WEIGHT: Record<Trait, number> = { LIDER: 0.6, VIOLENTO: 3, PROVOCADOR: 2, SIMULADOR: 0.9, NORMAL: 1 };

// Devolve 11 traços (posição 0 = goleiro)
export function assignTraits(): Trait[] {
  const t: Trait[] = Array.from({ length: 11 }, () => 'NORMAL' as Trait);
  const used = new Set<number>();
  const put = (idx: number, tr: Trait) => { if (used.has(idx)) return false; used.add(idx); t[idx] = tr; return true; };
  put(pick([3, 4, 5, 8]), 'LIDER');
  let n = 0;
  while (n < 1) { if (put(rnd(1, 6), 'VIOLENTO')) n++; }
  if (Math.random() < 0.5) put(rnd(1, 7), 'VIOLENTO');
  if (Math.random() < 0.75) put(rnd(5, 10), 'PROVOCADOR');
  if (Math.random() < 0.6) put(rnd(7, 10), 'SIMULADOR');
  return t;
}

// Sorteia quem comete a falta (camisa 2 a 11), com peso por personalidade
export function weightedPlayer(traits: Trait[]): number {
  const w = traits.map((tr, i) => (i === 0 ? 0 : FOUL_WEIGHT[tr]));
  const total = w.reduce((a, b) => a + b, 0);
  let x = Math.random() * total;
  for (let i = 1; i < w.length; i++) { x -= w[i]; if (x <= 0) return i + 1; }
  return 5;
}

export const captainNumber = (traits: Trait[]): number => {
  const i = traits.indexOf('LIDER');
  return i >= 0 ? i + 1 : 4;
};

// Chance de cartão considerando o momento, a reincidência e o perfil do jogador
export function cardChance(base: number, minute: number, playerFouls: number, teamYellows: number, tension: number, trait: Trait): number {
  let p = base;
  p *= 1 + 0.45 * Math.max(0, playerFouls - 1);
  if (minute <= 15) p *= 0.7;
  if (minute >= 80) p *= 1.2;
  p *= 1 + Math.max(0, teamYellows - 2) * 0.08;
  p *= tension > 70 ? 1.3 : tension < 35 ? 0.85 : 1;
  if (trait === 'VIOLENTO') p *= 1.3;
  if (trait === 'PROVOCADOR') p *= 1.1;
  return clamp(p, 0, 0.85);
}

// ---------- Rancor dos clubes ----------
const SEVERITY: Record<DecisionType, number> = { PLAY_ON: 0, FOUL: 1, YELLOW_CARD: 2, PENALTY: 3, PENALTY_YELLOW: 4, RED_CARD: 4, PENALTY_RED: 5, GOAL_VALID: 0, GOAL_DISALLOWED: 0 };

// Quem foi prejudicado por uma decisão errada
export function harmedSide(inc: Incident, decision: DecisionType): 'HOME' | 'AWAY' | null {
  const rec = inc.recommendedVarDecision;
  if (inc.acceptableDecisions.includes(decision)) return null;
  const other = (s: 'HOME' | 'AWAY'): 'HOME' | 'AWAY' => (s === 'HOME' ? 'AWAY' : 'HOME');
  if (rec === 'GOAL_VALID' || rec === 'GOAL_DISALLOWED' || decision === 'GOAL_VALID' || decision === 'GOAL_DISALLOWED') {
    if (decision === 'GOAL_DISALLOWED' || (decision === 'PLAY_ON' && rec === 'GOAL_VALID')) return inc.attackingTeam;
    if (decision === 'GOAL_VALID') return other(inc.attackingTeam);
    return inc.attackingTeam;
  }
  const dv = SEVERITY[decision];
  const rv = SEVERITY[rec];
  if (dv > rv) return inc.offendingTeam;
  if (dv < rv) return inc.attackingTeam;
  return null;
}

export function updateGrudges(prev: Record<string, number>, ids: { HOME: string; AWAY: string }, harmed: ('HOME' | 'AWAY')[], rating: number): Record<string, number> {
  const next: Record<string, number> = {};
  for (const k of Object.keys(prev)) { const v = prev[k] * 0.8; if (v >= 3) next[k] = v; }
  for (const s of harmed) next[ids[s]] = clamp((next[ids[s]] ?? 0) + 22, 0, 100);
  if (rating >= 9) { for (const s of ['HOME', 'AWAY'] as const) if (next[ids[s]]) next[ids[s]] = Math.max(0, next[ids[s]] - 6); }
  return next;
}

export const grudgeLabel = (v: number) => (v >= 70 ? 'Furioso' : v >= 45 ? 'Irritado' : v >= 20 ? 'Desconfiado' : 'Tranquilo');
export const grudgeColor = (v: number) => (v >= 70 ? 'text-red-400' : v >= 45 ? 'text-orange-400' : v >= 20 ? 'text-amber-300' : 'text-emerald-400');
export const grudgeHeat = (v: number) => Math.round(v / 14);

export function grudgeQuestion(teamName: string, v: number): PressQuestion {
  const furious = v >= 70;
  return {
    journalist: 'Programa Bola na Rede',
    question: furious
      ? 'A diretoria do ' + teamName + ' diz que o clube vem sendo prejudicado pela sua arbitragem. O que responde?'
      : 'O ' + teamName + ' reclamou de decisões recentes suas. Há algo a dizer ao clube?',
    options: [
      { label: 'Revi os lances e sigo aberto ao diálogo com o clube.', reply: 'Tom humilde e profissional. A pressão diminui.', reputation: 2 },
      { label: 'Minhas decisões seguem as regras e a análise do VAR.', reply: 'Resposta técnica, mas o clube não se convence.', reputation: 0 },
      { label: 'Reclamar faz parte do jogo. Não vou discutir.', reply: 'A frase irrita a diretoria e esquenta a polêmica.', reputation: -3 }
    ]
  };
}

// ---------- Reação de torcida, imprensa e redes ----------
export function buildReaction(p: {
  homeName: string; awayName: string; homeScore: number; awayScore: number; rating: number; decTotal: number; decCorrect: number;
  reds: number; brawls: number; harmedName: string | null; big: boolean;
}): Reaction {
  const good = p.rating >= 8.8;
  const bad = p.rating < 8.0;
  const winner = p.homeScore > p.awayScore ? p.homeName : p.awayScore > p.homeScore ? p.awayName : null;
  const crowd = good
    ? pick(['A torcida aplaudiu a arbitragem ao fim do jogo.', 'O estádio reconheceu o bom trabalho da equipe de arbitragem.', 'Poucas vaias: a arquibancada acompanhou o jogo com respeito.'])
    : bad
      ? pick(['O estádio inteiro vaiou o árbitro na saída de campo.', 'Gritos de protesto acompanharam o apito final.', 'A torcida reclamou durante boa parte do segundo tempo.'])
      : pick(['Algumas vaias isoladas, mas nada fora do normal.', 'Torcida dividida: houve vaias e alguns aplausos.', 'Clima morno na saída de campo.']);
  const press = good
    ? pick(['A imprensa elogiou a firmeza e a coerência dos critérios.', 'Colunistas destacaram o controle do jogo.', 'Os comentaristas deram nota alta para a arbitragem.'])
    : bad
      ? pick(['Os comentaristas criticaram erros em lances importantes.', 'A mesa redonda abriu o programa falando da arbitragem.', 'Jornais questionaram a atuação do árbitro.'])
      : pick(['A imprensa avaliou a arbitragem como regular.', 'Houve elogios e críticas na cobertura do jogo.']);
  const posts: ReactionPost[] = [];
  const add = (who: string, handle: string, text: string, tone: ReactionPost['tone']) => posts.push({ who, handle, text, tone });
  if (good) add('Torcedor do Apito', '@torcedor_apito', 'Hoje o árbitro mandou bem. Jogo limpo do começo ao fim.', 'POSITIVE');
  if (p.brawls > 0) add('Voz da Arquibancada', '@voz_da_arquibancada', 'Faltou controle: teve tumulto em campo e o árbitro demorou a reagir.', 'NEGATIVE');
  if (p.harmedName) add('Fã Número 12', '@fa_numero12', 'O ' + p.harmedName + ' foi prejudicado hoje. Não dá pra aceitar esse erro!', 'NEGATIVE');
  if (p.reds > 0 && !bad) add('Resenha Esportiva', '@resenha_esportiva', 'A expulsão foi correta. Pelo menos nisso, o árbitro acertou.', 'NEUTRAL');
  if (winner && posts.length < 4) add('Resenha Esportiva', '@resenha_esportiva', 'Vitória do ' + winner + '. A arbitragem não decidiu o jogo.', 'NEUTRAL');
  if (p.decTotal > 0 && posts.length < 4) add('Dados do Apito', '@dados_do_apito', 'Acertos em lances decisivos: ' + p.decCorrect + ' de ' + p.decTotal + '.', p.decCorrect === p.decTotal ? 'POSITIVE' : 'NEUTRAL');
  if (posts.length < 3) add('Torcedor Raiz', '@torcedor_raiz', bad ? 'Quero ver o árbitro estudando regra essa semana.' : 'Jogo de bom nível, sem grandes polêmicas.', bad ? 'NEGATIVE' : 'NEUTRAL');
  let delta = good ? 2 : bad ? -3 : 0;
  if (p.harmedName) delta -= 1;
  if (p.brawls > 0) delta -= 1;
  if (p.decTotal > 0 && p.decCorrect === p.decTotal) delta += 1;
  if (p.big) delta = Math.round(delta * 1.5);
  return { crowd, press, posts: posts.slice(0, 4), repDelta: clamp(delta, -5, 4) };
}

// ---------- Metas da temporada ----------
export const GOAL_POOL: SeasonGoal[] = [
  { id: 'AVG', label: 'Fechar a temporada com nota média 8,8 ou mais', hint: 'Mantenha a consistência em todos os jogos.', target: 8.8, reward: 1500, repReward: 4 },
  { id: 'ACC', label: 'Acertar 80% dos lances decisivos', hint: 'Use as câmeras e o VAR com calma.', target: 80, reward: 1200, repReward: 3 },
  { id: 'CALM', label: 'Fazer 3 jogos sem nenhum tumulto', hint: 'Controle a pressão do jogo.', target: 3, reward: 1000, repReward: 3 },
  { id: 'BEST', label: 'Tirar nota 9,0 ou mais em algum jogo', hint: 'Uma boa atuação já resolve.', target: 9.0, reward: 800, repReward: 2 }
];
export const makeSeasonGoals = (): SeasonGoal[] => shuffle(GOAL_POOL).slice(0, 3);

export interface GoalStatus { id: string; progress: number; done: boolean; failed: boolean }
export function evaluateGoals(goals: SeasonGoal[], reports: MatchReport[], final: boolean): GoalStatus[] {
  const n = reports.length;
  const avg = n ? reports.reduce((a, r) => a + r.uefaScore, 0) / n : 0;
  const decT = reports.reduce((a, r) => a + (r.extra?.decTotal ?? 0), 0);
  const decC = reports.reduce((a, r) => a + (r.extra?.decCorrect ?? 0), 0);
  const acc = decT ? (decC / decT) * 100 : 100;
  const calm = reports.filter(r => (r.extra?.brawls ?? 0) === 0).length;
  const best = reports.reduce((a, r) => Math.max(a, r.uefaScore), 0);
  return goals.map(g => {
    switch (g.id) {
      case 'AVG': return { id: g.id, progress: avg, done: final && n > 0 && avg >= g.target, failed: final && avg < g.target };
      case 'ACC': return { id: g.id, progress: acc, done: final && n > 0 && acc >= g.target, failed: final && acc < g.target };
      case 'CALM': return { id: g.id, progress: calm, done: calm >= g.target, failed: final && calm < g.target };
      default: return { id: g.id, progress: best, done: best >= g.target, failed: final && best < g.target };
    }
  });
}
export function goalProgressText(g: SeasonGoal, s: GoalStatus | undefined): string {
  if (!s) return '';
  if (s.done) return 'Cumprida ✓';
  if (s.failed) return 'Não cumprida ✕';
  switch (g.id) {
    case 'AVG': return 'Média atual: ' + s.progress.toFixed(2).replace('.', ',');
    case 'ACC': return 'Acerto atual: ' + Math.round(s.progress) + '%';
    case 'CALM': return s.progress + ' de ' + g.target + ' jogos calmos';
    default: return 'Melhor nota: ' + s.progress.toFixed(2).replace('.', ',');
  }
}

// ---------- Árbitros rivais ----------
const RIVAL_NAMES = ['Anderson Vidal', 'Leandro Prado', 'Marcos Teixeira', 'Rogério Faria', 'Diego Nunes', 'Eduardo Brandão', 'Tiago Moura'];
const skillOf = (name: string) => 7.9 + (hash(name) % 10) / 10 * 0.9;
export function initRivals(): Rival[] {
  return RIVAL_NAMES.map(name => ({ name, avg: Number((skillOf(name) + (Math.random() - 0.5) * 0.3).toFixed(2)), matches: 1 }));
}
export function stepRivals(rivals: Rival[]): Rival[] {
  return rivals.map(r => {
    const score = clamp(0.5 * skillOf(r.name) + 0.5 * r.avg + (Math.random() - 0.5) * 1.5, 6.5, 9.8);
    const m = Math.min(r.matches, 12);
    return { ...r, avg: Number(((r.avg * m + score) / (m + 1)).toFixed(2)), matches: r.matches + 1 };
  });
}
export function rankingWith(rivals: Rival[], name: string, avg: number): { name: string; avg: number; you: boolean }[] {
  return [...rivals.map(r => ({ name: r.name, avg: r.avg, you: false })), { name, avg, you: true }].sort((a, b) => b.avg - a.avg);
}

// ---------- Eventos de carreira ----------
export const CAREER_EVENTS: CareerEvent[] = [
  { id: 'intl', title: '🌍 Convite para curso internacional', body: 'A federação indicou seu nome para um curso de arbitragem no exterior. Você precisa pagar a viagem.', options: [
    { label: 'Aceitar o convite', result: 'Você volta mais preparado e com o nome em evidência.', money: -400, rep: 3, rules: 3 },
    { label: 'Recusar por enquanto', result: 'A federação entende, mas a vaga vai para outro árbitro.', money: 0, rep: 0 }] },
  { id: 'rumor', title: '📰 Boato na imprensa', body: 'Um blog diz que você favoreceu um clube no último jogo. Não há prova, mas o assunto está circulando.', options: [
    { label: 'Desmentir com calma', result: 'A nota oficial acalma os ânimos.', money: 0, rep: 1 },
    { label: 'Ignorar o assunto', result: 'O boato cresce por alguns dias e machuca sua imagem.', money: 0, rep: -2 },
    { label: 'Contratar advogado', result: 'O blog retira a notícia. Foi caro, mas funcionou.', money: -300, rep: 2 }] },
  { id: 'injury', title: '🩹 Dor na coxa', body: 'Depois do último jogo, você sentiu uma dor na coxa. Dá pra seguir, mas com cuidado.', options: [
    { label: 'Fazer fisioterapia', result: 'Você se recupera bem e volta ainda mais forte.', money: -250, rep: 0, physical: 2 },
    { label: 'Seguir assim mesmo', result: 'A dor atrapalha seu preparo físico nesta semana.', money: 0, rep: 0, physical: -6 }] },
  { id: 'sponsor', title: '👟 Proposta de patrocínio', body: 'Uma marca de material esportivo quer vestir você. Vão pagar bem, mas isso pode pegar mal.', options: [
    { label: 'Aceitar o contrato', result: 'O dinheiro entra, mas alguns dizem que você virou garoto-propaganda.', money: 600, rep: -1 },
    { label: 'Recusar', result: 'Imagem imparcial preservada. A federação gosta.', money: 0, rep: 1 }] },
  { id: 'course', title: '📖 Curso de atualização de regras', body: 'A federação abriu inscrições para uma atualização das regras do jogo.', options: [
    { label: 'Fazer o curso', result: 'Você aprende detalhes novos sobre mão na bola e impedimento.', money: -200, rep: 1, rules: 4 },
    { label: 'Estudar sozinho', result: 'Você revisa algumas regras por conta própria.', money: 0, rep: 0, rules: 1 }] },
  { id: 'tv', title: '📺 Convite para comentar arbitragem na TV', body: 'Um canal de esportes quer você como comentarista convidado na rodada.', options: [
    { label: 'Aceitar', result: 'Você vai bem na TV e ganha um cachê.', money: 500, rep: 2, stress: -1 },
    { label: 'Recusar', result: 'Você prefere se manter longe dos holofotes.', money: 0, rep: 0 }] }
];
export function pickCareerEvent(lastId: string | null): CareerEvent | null {
  if (Math.random() > 0.35) return null;
  const pool = CAREER_EVENTS.filter(e => e.id !== lastId);
  return pick(pool);
}

// ---------- Escala e viagem ----------
export function travelKm(home: Team, away: Team): number {
  return 60 + (hash(home.id + away.id) % 1700);
}
export const travelCost = (km: number): number => Math.round((km * 0.12) / 10) * 10;
const BIG_LIMIT: Record<DivisionTier, number> = { SERIE_D: 68, SERIE_C: 73.5, SERIE_B: 78.5, SERIE_A: 84.5, FIFA_INTERNACIONAL: 86 };
export function isBigMatch(home: Team, away: Team): boolean {
  const avg = (home.attackStrength + home.defenseStrength + away.attackStrength + away.defenseStrength) / 4;
  return avg >= BIG_LIMIT[home.tier];
}

// ---------- Melhores momentos ----------
export function goalHighlight(p: { id: string; minute: number; team: 'HOME' | 'AWAY'; teamName: string; shooter: string; pen: boolean }): HighlightItem {
  const other: 'HOME' | 'AWAY' = p.team === 'HOME' ? 'AWAY' : 'HOME';
  const title = (p.pen ? 'Gol de pênalti' : 'Gol') + ' do ' + p.teamName + ' — ' + p.shooter;
  const rec: DecisionType = p.pen ? 'PENALTY' : 'GOAL_VALID';
  const frame = (i: 0 | 1 | 2, label: string, sub: string) => ({
    frameIndex: i, label, timecode: i === 0 ? '-0:03' : i === 1 ? '-0:01' : '0:00', subtitle: sub,
    svgGraphicType: (p.pen ? 'BOX_PENALTY' : 'OFFSIDE_3D') as 'BOX_PENALTY' | 'OFFSIDE_3D', attackerNumber: 9, defenderNumber: 4, speedKmh: 24, metricDetail: 'Replay do gol'
  });
  const incident: Incident = {
    id: 'hl-' + p.id, minute: p.minute, category: p.pen ? 'PENALTI_DISPUTA' : 'IMPEDIMENTO_3D', title,
    description: 'Melhor momento da partida: ' + title + ' aos ' + p.minute + ' minutos.', context: 'Replay do gol.',
    pitchZone: { xPercent: 85, yPercent: 50, name: p.pen ? 'Área' : 'Frente do gol' },
    offendingTeam: other, attackingTeam: p.team, offendingPlayerNumber: 4, victimPlayerNumber: 9,
    recommendedVarDecision: rec, acceptableDecisions: [rec], variant: p.pen ? 'TRIP' : undefined,
    ifabExplanation: p.pen ? 'Pênalti marcado dentro da área e cobrado com sucesso.' : 'Gol confirmado: o atacante estava em posição legal no momento do passe.',
    defaultVarDialogue: '', frames: [frame(0, 'Antes', 'A jogada começa'), frame(1, 'Durante', 'A finalização'), frame(2, 'Depois', 'A bola entra')]
  };
  return { id: incident.id, minute: p.minute, kind: 'GOAL', title, team: p.team, incident };
}

// ---------- Aula do lance ----------
export interface Lesson { title: string; ok: boolean; yours: string; correct: string; text: string }
