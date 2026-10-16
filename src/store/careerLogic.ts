import type {
  Team, Fixture, DivisionTier, MatchReport, RefereeStyle, Officials, ObserverReport, InboxMessage, PressQuestion
} from '../types/types';

export const CHAMPIONSHIP: Record<string, string> = {
  SERIE_D: 'Campeonato Brasileiro Série D', SERIE_C: 'Campeonato Brasileiro Série C',
  SERIE_B: 'Campeonato Brasileiro Série B', SERIE_A: 'Campeonato Brasileiro Série A', FIFA_INTERNACIONAL: 'Competições Internacionais'
};
export const tierLabel = (t: DivisionTier | string) => t.replace('SERIE_', 'Série ').replace('FIFA_INTERNACIONAL', 'Internacional');
export const APPROACH_FACTOR: Record<RefereeStyle, number> = { DIALOGADOR: 0.7, PREVENTIVO: 0.85, DISCIPLINADOR: 1.0, RIGOROSO: 1.15 };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T,>(arr: T[]): T[] => {
  const x = [...arr];
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
};

// ---------- Calendário ----------
export function buildSeason(tier: DivisionTier, teams: Team[], season: number, seen: Record<string, number> = {}): Fixture[] {
  let arr = shuffle(teams.filter(t => t.tier === tier).map(t => t.id));
  if (arr.length % 2 === 1) arr = arr.slice(0, -1);
  const n = arr.length;
  if (n < 4) return [];
  const rounds = Math.min(6, n - 1);
  const fx: Fixture[] = [];
  const local: Record<string, number> = { ...seen };
  for (let r = 0; r < rounds; r++) {
    const round: Fixture[] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      const flip = (r + i) % 2 === 0;
      round.push({
        id: 's' + season + '-r' + (r + 1) + '-' + i, round: r + 1, homeId: flip ? a : b, awayId: flip ? b : a,
        played: false, homeScore: 0, awayScore: 0, refMatch: false
      });
    }
    // rodízio: escolhe o jogo cujas equipes foram menos apitadas (histórico + temporada atual)
    let best = 0;
    let bestScore = Infinity;
    round.forEach((f, i) => {
      const score = (local[f.homeId] ?? 0) + (local[f.awayId] ?? 0) + Math.random() * 0.9;
      if (score < bestScore) { bestScore = score; best = i; }
    });
    round[best].refMatch = true;
    local[round[best].homeId] = (local[round[best].homeId] ?? 0) + 1;
    local[round[best].awayId] = (local[round[best].awayId] ?? 0) + 1;
    fx.push(...round);
    arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
  }
  return fx;
}

/** Quantas vezes cada clube já foi apitado nas últimas súmulas (por id de time). */
export function refereedCounts(history: MatchReport[], teams: Team[], last = 24): Record<string, number> {
  const byName = new Map(teams.map(t => [t.name, t.id]));
  const out: Record<string, number> = {};
  history.slice(0, last).forEach(h => {
    [h.homeTeamName, h.awayTeamName].forEach(nm => {
      const id = byName.get(nm);
      if (id) out[id] = (out[id] ?? 0) + 1;
    });
  });
  return out;
}

const poisson = (lambda: number) => {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do { k++; p *= Math.random(); } while (p > L && k < 9);
  return k - 1;
};
export const simulateScore = (h: Team, a: Team): [number, number] => [
  poisson(clamp(1.3 + (h.attackStrength - a.defenseStrength) / 45, 0.3, 3.2)),
  poisson(clamp(1.0 + (a.attackStrength - h.defenseStrength) / 45, 0.3, 3.2))
];

export function roundDate(season: number, round: number): string {
  const d = new Date(Date.UTC(2026 + season - 1, 1, 1));
  while (d.getUTCDay() !== 6) d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCDate(d.getUTCDate() + (round - 1) * 7);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
}

export interface StandingRow {
  team: Team; p: number; w: number; d: number; l: number; gf: number; ga: number; gd: number; pts: number; form: ('W' | 'D' | 'L')[];
}
export function computeStandings(fixtures: Fixture[], teams: Team[]): StandingRow[] {
  const ids = new Set<string>();
  fixtures.forEach(f => { ids.add(f.homeId); ids.add(f.awayId); });
  const rows = new Map<string, StandingRow>();
  teams.filter(t => ids.has(t.id)).forEach(t => rows.set(t.id, { team: t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: [] }));
  [...fixtures].filter(f => f.played).sort((a, b) => a.round - b.round).forEach(f => {
    const h = rows.get(f.homeId);
    const a = rows.get(f.awayId);
    if (!h || !a) return;
    h.p++; a.p++; h.gf += f.homeScore; h.ga += f.awayScore; a.gf += f.awayScore; a.ga += f.homeScore;
    if (f.homeScore > f.awayScore) { h.w++; a.l++; h.pts += 3; h.form.push('W'); a.form.push('L'); }
    else if (f.homeScore < f.awayScore) { a.w++; h.l++; a.pts += 3; a.form.push('W'); h.form.push('L'); }
    else { h.d++; a.d++; h.pts++; a.pts++; h.form.push('D'); a.form.push('D'); }
  });
  return [...rows.values()].map(r => ({ ...r, gd: r.gf - r.ga, form: r.form.slice(-5) }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.name.localeCompare(b.team.name));
}

// ---------- Súmula ----------
const MALE_FIRST = ['Rafael', 'Bruno', 'Thiago', 'Marcelo', 'Eduardo', 'Felipe', 'Rodrigo', 'Gustavo', 'Leandro', 'Daniel', 'Lucas', 'Mateus', 'Gabriel', 'Pedro', 'João', 'Vinícius', 'Diego', 'Caio', 'Renan', 'Henrique', 'Leonardo', 'Fábio', 'Márcio', 'André', 'Ricardo', 'Alexandre', 'Wesley', 'Anderson', 'Jefferson', 'Douglas', 'Cláudio', 'Samuel', 'Nathan', 'Igor', 'Murilo', 'Everton', 'Ronaldo', 'Fernando', 'Paulo', 'Sérgio', 'Danilo', 'Willian', 'Tiago', 'Yuri', 'Otávio', 'Raul', 'Hugo', 'Jonathan', 'Kleber', 'Luan', 'Emerson', 'Adriano', 'Victor', 'Bernardo', 'Elias', 'Ítalo', 'Jorge', 'Carlos', 'Matheus', 'Cauã', 'Davi', 'Enzo', 'Joaquim', 'Wagner', 'Reinaldo', 'Maicon'];
const LAST = ['Almeida', 'Barbosa', 'Cardoso', 'Duarte', 'Esteves', 'Fontes', 'Guedes', 'Lacerda', 'Macedo', 'Nogueira', 'Pacheco', 'Queiroz', 'Rangel', 'Siqueira', 'Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Ribeiro', 'Carvalho', 'Gomes', 'Martins', 'Rocha', 'Ferreira', 'Araújo', 'Barros', 'Moreira', 'Teixeira', 'Moura', 'Cavalcante', 'Monteiro', 'Freitas', 'Vieira', 'Nascimento', 'Mendes', 'Lopes', 'Dias', 'Campos', 'Correia', 'Pinto', 'Azevedo', 'Farias', 'Medeiros', 'Ramos', 'Torres', 'Borges', 'Castro', 'Machado', 'Prado', 'Tavares', 'Viana', 'Xavier', 'Amaral', 'Bastos', 'Coelho', 'Franco', 'Leite', 'Marques', 'Nunes', 'Peixoto', 'Reis', 'Sampaio', 'Telles', 'Vasques'];
const person = () => pick(MALE_FIRST) + ' ' + pick(LAST);
export const coachName = () => 'Téc. ' + person();
export const pickOfficials = (): Officials => ({ assistant1: person(), assistant2: person(), fourth: person(), var: person(), avar: person() });

export function buildObserver(p: {
  rating: number; decisions: { correct: boolean; title: string; minute: number }[]; temperature: number; physical: number;
  approach: RefereeStyle; notes: string[]; cards: number; reds: number;
}): ObserverReport {
  const total = p.decisions.length;
  const wrong = p.decisions.filter(d => !d.correct).length;
  const good = p.notes.filter(n => n.endsWith('✓')).length;
  const bad = p.notes.filter(n => n.endsWith('✕')).length;
  const scores = [
    { label: 'Aplicação das regras', value: total === 0 ? 8.6 : clamp(10 - (wrong / total) * 5.5, 4, 10) },
    { label: 'Controle disciplinar', value: clamp(p.rating + 0.2, 4, 10) },
    { label: 'Controle de jogo', value: clamp(10 - (p.temperature - 30) / 12, 5, 9.8) },
    { label: 'Condição física', value: clamp(5 + p.physical / 20, 5, 9.8) },
    { label: 'Comunicação', value: clamp(7.4 + (p.approach === 'DIALOGADOR' ? 0.6 : 0) + good * 0.4 - bad * 0.5, 4, 10) }
  ].map(s => ({ ...s, value: Number(s.value.toFixed(1)) }));
  const comment = p.rating >= 9 ? 'Atuação de nível internacional: leitura de jogo precisa, decisões firmes e comunicação exemplar com os capitães.'
    : p.rating >= 8.4 ? 'Atuação sólida. Manteve o critério ao longo do jogo e controlou os momentos de maior tensão.'
    : p.rating >= 7.5 ? 'Atuação regular, com oscilações de critério em alguns lances capitais. Há espaço claro para evolução.'
    : 'Atuação abaixo do esperado. Decisões importantes divergiram do protocolo e o controle do jogo foi comprometido.';
  const highlights = p.decisions.map(d => d.minute + "' " + d.title + ': ' + (d.correct ? 'decisão correta ✓' : 'decisão diferente da regra oficial ✕'));
  if (p.reds > 0) highlights.push(p.reds + ' expulsão(ões) aplicada(s) na partida.');
  if (highlights.length === 0) highlights.push('Sem lances capitais submetidos ao VAR nesta partida.');
  return { scores, comment, highlights };
}

export function buildNarrative(r: MatchReport): string {
  const y = r.cards.filter(c => c.cardType === 'YELLOW').length;
  const rd = r.cards.filter(c => c.cardType === 'RED').length;
  const pens = r.goals.filter(g => g.isPenalty).length;
  return 'Realizou-se, no ' + r.stadium + ', a partida entre ' + r.homeTeamName + ' e ' + r.awayTeamName + ', válida pela ' + (r.round ?? '?') + 'ª rodada do ' + (r.competition ?? 'campeonato') +
    ', com público de ' + r.attendance.toLocaleString('pt-BR') + ' pessoas. A partida terminou ' + r.homeScore + ' x ' + r.awayScore + ', com ' + r.goals.length + ' gol(s)' + (pens ? ' (sendo ' + pens + ' de pênalti)' : '') +
    '. Foram exibidos ' + y + ' cartão(ões) amarelo(s) e ' + rd + ' vermelho(s). A arbitragem de vídeo revisou ' + r.varReviews.length + ' lance(s). ' +
    (r.interactionNotes && r.interactionNotes.length ? 'Registram-se ocorrências de interação com capitães e comissões técnicas, descritas na linha do tempo. ' : 'Não houve ocorrências disciplinares fora de campo. ') +
    'Nada mais havendo a relatar, encerra-se esta súmula.';
}

// ---------- Interações ----------
export const CAPTAIN_COMPLAINTS: { text: string; heat: 1 | 2 | 3 }[] = [
  { text: 'Árbitro, esse critério está mudando o tempo todo. Pode explicar?', heat: 1 },
  { text: 'Faltou conversa com o time do outro lado, eles estão provocando!', heat: 1 },
  { text: 'Você está deixando bater demais, alguém vai se machucar!', heat: 2 },
  { text: 'A torcida está em cima e você está ignorando as faltas contra a gente!', heat: 2 },
  { text: 'Isso é um absurdo! Você está prejudicando a gente o jogo inteiro!', heat: 3 }
];

const PRESS: PressQuestion[] = [
  { journalist: 'Repórter do Esporte TV', question: 'Houve críticas ao seu critério disciplinar hoje. Como responde?', options: [
    { label: 'Mantive o mesmo critério para as duas equipes.', reply: 'Resposta equilibrada. A imprensa registra a firmeza.', reputation: 2 },
    { label: 'Os atletas precisam respeitar mais a arbitragem.', reply: 'A frase gera polêmica nas redes, mas mostra personalidade.', reputation: 0 },
    { label: 'Prefiro não comentar sobre critérios.', reply: 'A fuga da pergunta passa insegurança.', reputation: -2 }] },
  { journalist: 'Rádio Bola Quente', question: 'O VAR foi acionado mais de uma vez. Você se sentiu pressionado?', options: [
    { label: 'O VAR é uma ferramenta e a decisão final é sempre minha.', reply: 'Resposta madura, bem vista pela comissão.', reputation: 2 },
    { label: 'Foi uma noite difícil, não vou negar.', reply: 'Honestidade valorizada, mas expõe fragilidade.', reputation: 1 },
    { label: 'Eu estava no controle de tudo.', reply: 'A arrogância é criticada pelos comentaristas.', reputation: -2 }] },
  { journalist: 'Portal Lance Capital', question: 'O técnico reclamou muito. Pretende relatar à federação?', options: [
    { label: 'Tudo que ocorreu consta na súmula.', reply: 'Postura profissional e transparente.', reputation: 2 },
    { label: 'Foi um desabafo normal de jogo, já passou.', reply: 'Conciliador, mas alguns acham frouxo.', reputation: 0 },
    { label: 'Vou pedir punição exemplar.', reply: 'A declaração incendeia o debate.', reputation: -1 }] },
  { journalist: 'Mesa Redonda FM', question: 'Qual foi o momento mais difícil da partida?', options: [
    { label: 'A tomada de decisão nos lances capitais, com todas as câmeras.', reply: 'Mostra preparo técnico.', reputation: 2 },
    { label: 'Controlar a temperatura do jogo no segundo tempo.', reply: 'Boa leitura de jogo.', reputation: 1 },
    { label: 'Nenhum, foi tranquilo.', reply: 'Parece desconectado da realidade.', reputation: -1 }] },
  { journalist: 'Jornal do Apito', question: 'Algum recado para os clubes sobre a arbitragem?', options: [
    { label: 'Respeito mútuo e diálogo constroem melhores jogos.', reply: 'Declaração elogiada pela federação.', reputation: 3 },
    { label: 'Estudem mais as regras.', reply: 'Soa arrogante para parte da imprensa.', reputation: -1 },
    { label: 'Sem recados.', reply: 'Neutro, sem repercussão.', reputation: 0 }] }
];
export const pickPress = (): PressQuestion[] => shuffle(PRESS).slice(0, 2);

export function federationFeedback(rating: number, round: number, week: number, report: MatchReport): InboxMessage {
  const tone = rating >= 8.4 ? 'POSITIVE' : rating >= 7.5 ? 'NEUTRAL' : 'NEGATIVE';
  return {
    id: 'msg-' + Date.now() + '-' + round, week, from: 'Comissão de Arbitragem', tone, read: false,
    subject: 'Avaliação da rodada ' + round + ' • nota ' + rating.toFixed(2),
    body: tone === 'POSITIVE' ? 'Parabéns pela atuação em ' + report.homeTeamName + ' x ' + report.awayTeamName + '. Mantenha o nível para ser considerado para escalas maiores.'
      : tone === 'NEUTRAL' ? 'Sua atuação em ' + report.homeTeamName + ' x ' + report.awayTeamName + ' foi dentro do esperado. Revise os lances capitais com o instrutor.'
      : 'A comissão identificou falhas em ' + report.homeTeamName + ' x ' + report.awayTeamName + '. Recomendamos reciclagem de regras antes da próxima escala.'
  };
}

export function computeAchievements(history: MatchReport[], seasons: { outcome: string }[]) {
  const perfect = history.some(h => h.decisionVerdicts.length >= 2 && h.decisionVerdicts.every(v => v.isCorrect));
  return [
    { id: 'first', icon: '🥇', title: 'Primeiro apito', desc: 'Complete sua primeira partida.', unlocked: history.length >= 1 },
    { id: 'ten', icon: '🔟', title: 'Dez jogos', desc: 'Apite 10 partidas na carreira.', unlocked: history.length >= 10 },
    { id: 'nine', icon: '⭐', title: 'Nota 9', desc: 'Receba nota 9,00 ou mais em um jogo.', unlocked: history.some(h => h.uefaScore >= 9) },
    { id: 'var', icon: '🖥️', title: 'VAR perfeito', desc: 'Acerte todos os lances capitais de um jogo (2+).', unlocked: perfect },
    { id: 'red', icon: '🟥', title: 'Mão firme', desc: 'Aplique um cartão vermelho.', unlocked: history.some(h => h.cards.some(c => c.cardType === 'RED')) },
    { id: 'season', icon: '📅', title: 'Temporada completa', desc: 'Conclua uma temporada de 6 jogos.', unlocked: seasons.length >= 1 },
    { id: 'promo', icon: '🚀', title: 'Subiu de divisão', desc: 'Seja promovido ao fim de uma temporada.', unlocked: seasons.some(s => s.outcome === 'PROMOVIDO') }
  ];
}

// ---------- Clima, elencos e acréscimos ----------
export type Weather = 'SOL' | 'CHUVA' | 'NOITE';
export const WEATHER_LABEL: Record<Weather, string> = { SOL: '☀️ Sol', CHUVA: '🌧️ Chuva', NOITE: '🌙 Noite' };
export const pickWeather = (): Weather => pick<Weather>(['SOL', 'SOL', 'NOITE', 'NOITE', 'CHUVA']);
// Dois elencos masculinos: nenhum primeiro nome repete (nem entre as equipes) e não há sobrenome repetido no mesmo time
export const makeRosters = (): { HOME: string[]; AWAY: string[] } => {
  const firsts = shuffle(MALE_FIRST);
  let fi = 0;
  const build = (): string[] => {
    const lasts = new Set<string>();
    const out: string[] = [];
    while (out.length < 11) {
      let last = pick(LAST);
      while (lasts.has(last)) last = pick(LAST);
      lasts.add(last);
      out.push(firsts[fi++ % firsts.length] + ' ' + last);
    }
    return out;
  };
  return { HOME: build(), AWAY: build() };
};
export const fmtMinute = (minute: number, half: 1 | 2) => (half === 1 && minute > 45 ? '45+' + (minute - 45) : half === 2 && minute > 90 ? '90+' + (minute - 90) : String(minute)) + "'";
export const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
export const pickOne = pick;

export const SHOT_OFF = [
  '{n} chuta cruzado e a bola passa perto da trave.', '{n} arrisca de longe, por cima do gol.', '{n} perde uma grande chance! Bola para fora.',
  '{n} tenta de primeira e manda para a arquibancada.'
];
export const SHOT_SAVED = [
  '{n} bate forte e o goleiro faz grande defesa!', '{n} finaliza e o goleiro espalma para escanteio.', '{n} cabeceia, mas o goleiro agarra firme.',
  '{n} chuta rasteiro e o goleiro se estica para defender.'
];
export const GOAL_STYLES = ['de cabeça', 'de fora da área', 'em chute rasteiro', 'de primeira', 'após jogada ensaiada', 'em contra-ataque'];
export const FOUL_TYPES = ['por trás, no meio-campo', 'em disputa pelo alto', 'em carrinho', 'com a mão no rosto do rival', 'segurando a camisa', 'em carga pelas costas'];
export const INJURY_LINES = ['{n} fica caído e recebe atendimento médico.', '{n} sente a coxa e o jogo é paralisado.', '{n} leva pancada e o departamento médico entra em campo.'];

export function stoppageFor(half: 1 | 2, varReviews: number, cards: number, injuries: number, goals: number): number {
  const base = half === 1 ? 1 : 2;
  return Math.min(8, base + varReviews + Math.floor(cards / 3) + injuries + Math.floor(goals / 2) + rnd(0, 2));
}

// ---------- Perfis de partida, reservas e bola parada ----------
export type MatchProfile = 'EQUILIBRADO' | 'TRUNCADO' | 'ABERTO' | 'TENSO' | 'TRANQUILO';
export const PROFILE_INFO: Record<MatchProfile, { label: string; shots: number; goals: number; fouls: number; heat: number; text: string }> = {
  EQUILIBRADO: { label: 'Equilibrado', shots: 1, goals: 1, fouls: 1, heat: 0, text: '📋 Duelo equilibrado, sem favorito claro.' },
  TRUNCADO: { label: 'Truncado', shots: 0.7, goals: 0.8, fouls: 1.5, heat: 4, text: '📋 Jogo faltoso e truncado, com muitas paradas.' },
  ABERTO: { label: 'Aberto', shots: 1.4, goals: 1.3, fouls: 0.8, heat: 0, text: '📋 Jogo aberto, com chances dos dois lados.' },
  TENSO: { label: 'Tensão alta', shots: 1, goals: 1, fouls: 1.2, heat: 10, text: '📋 Clima pesado e torcida pressionando a arbitragem.' },
  TRANQUILO: { label: 'Tranquilo', shots: 0.9, goals: 0.9, fouls: 0.7, heat: -6, text: '📋 Partida tranquila e bem disputada.' }
};
export const pickProfile = (): MatchProfile => pick<MatchProfile>(['EQUILIBRADO', 'EQUILIBRADO', 'TRUNCADO', 'ABERTO', 'TENSO', 'TRANQUILO']);
export const SUB_REASONS = ['por opção técnica', 'por cansaço', 'por estratégia', 'após levar amarelo', 'para ganhar velocidade'];
export const benchName = (exclude: string[]): string => {
  let n = pick(MALE_FIRST) + ' ' + pick(LAST);
  let guard = 0;
  while (exclude.includes(n) && guard++ < 20) n = pick(MALE_FIRST) + ' ' + pick(LAST);
  return n;
};
export const WALL_DISTANCE = 9.15;
/** Chance de gol numa falta direta, pela distância (m) até o gol. */
export const freeKickGoalChance = (dist: number) => clamp(0.17 - (dist - 18) * 0.009, 0.03, 0.14);
export const FK_MISS = ['A bola bate na barreira.', 'O goleiro espalma para escanteio!', 'A bola passa por cima do travessão.', 'Chute rente à trave, para fora.', 'O goleiro encaixa firme.'];

// ---------- Linguagem simples ----------
export const DECISION_LABEL: Record<string, string> = {
  PLAY_ON: 'Mandar seguir', FOUL: 'Falta', YELLOW_CARD: 'Cartão amarelo', RED_CARD: 'Cartão vermelho', PENALTY: 'Pênalti',
  PENALTY_YELLOW: 'Pênalti + amarelo', PENALTY_RED: 'Pênalti + vermelho', GOAL_VALID: 'Gol válido', GOAL_DISALLOWED: 'Gol anulado'
};
const HUMAN_RULES: [RegExp, string][] = [
  [/\b(PENALTY_YELLOW|PENALTY_RED|YELLOW_CARD|RED_CARD|GOAL_VALID|GOAL_DISALLOWED|PLAY_ON|PENALTY|FOUL)\b/g, '\u0000'],
  [/na fase de ataque \(APP\)/gi, 'na jogada anterior'], [/fase de ataque \(APP\)/gi, 'jogada anterior'], [/do protocolo IFAB/gi, 'da regra oficial'], [/protocolo IFAB/gi, 'regra oficial'], [/diretrizes da IFAB/gi, 'regras oficiais'],
  [/\bIFAB\b/g, 'regras oficiais'], [/\bDOGSO\b/g, 'chance clara de gol'], [/\bOFR\b/g, 'o monitor'], [/\bAPP\b/g, 'jogada anterior'],
  [/\bKMI\b/g, 'lance decisivo'], [/lances capitais/gi, 'lances decisivos'], [/lance capital/gi, 'lance decisivo'],
  [/cabine do VAR/gi, 'sala do VAR'], [/\bcabine\b/gi, 'sala do VAR'], [/telemetria/gi, 'dados'], [/volumetria/gi, 'posição do braço'],
  [/\bAVAR\b/g, 'assistente do VAR'], [/Hawk-Eye/gi, 'tecnologia de linhas']
];
/** Troca códigos técnicos e jargões por palavras que qualquer torcedor entende. */
export function humanize(text: string): string {
  let out = text.replace(HUMAN_RULES[0][0], m => DECISION_LABEL[m] ?? m);
  for (let i = 1; i < HUMAN_RULES.length; i++) out = out.replace(HUMAN_RULES[i][0], HUMAN_RULES[i][1]);
  return out;
}
export const GLOSSARY: [string, string][] = [
  ['VAR', 'O árbitro de vídeo: uma equipe que revê os lances nas câmeras e ajuda o árbitro em campo.'],
  ['Súmula', 'O relatório oficial da partida: gols, cartões, equipe de arbitragem e ocorrências.'],
  ['Impedimento', 'O atacante está à frente do último defensor de linha (sem contar o goleiro) quando a bola é passada.'],
  ['Chance clara de gol', 'Quando uma falta tira de um atacante a chance muito provável de marcar. Pode render cartão vermelho.'],
  ['Pressão', 'O quanto o jogo está “quente”. Muita pressão pode virar tumulto.'],
  ['Postura', 'Seu jeito de arbitrar (conversador, preventivo, firme ou rigoroso). Muda quantos protestos e cartões aparecem.'],
  ['Acréscimos', 'Minutos extras no fim de cada tempo, por paradas e atendimentos.'],
  ['Nota de arbitragem', 'A avaliação da comissão sobre sua atuação, de 4 a 10. A média da temporada define promoção ou queda.']
];
