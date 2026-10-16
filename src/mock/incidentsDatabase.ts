import type { Incident, Team, IncidentPitchZone, DecisionType } from '../types/types';
import { pickOne } from '../store/careerLogic';

interface Template {
  category: Incident['category'];
  title: (atk: Team, def: Team) => string;
  description: (atk: Team, def: Team) => string;
  context: string;
  recommended: DecisionType;
  acceptable: DecisionType[];
  ifab: string;
  dialogue: string;
  graphicType: 'BOX_PENALTY' | 'SLIDE_TACKLE' | 'HAND_BALL' | 'OFFSIDE_3D';
  metric: string;
  zone: IncidentPitchZone;
  dive?: boolean;
  variant?: string;
}

const OFF_VALID_IFAB = 'Regra do impedimento: o atacante só está em impedimento se qualquer parte da cabeça, corpo ou pés com que se pode marcar estiver mais perto da linha de meta adversária que a bola e o último defensor de linha no momento do passe. Posição alinhada ou atrás é legal.';
const OFF_BAD_IFAB = 'Regra do impedimento: qualquer parte do corpo com a qual se pode marcar gol (exceto braços) adiantada em relação à linha do último defensor de linha no instante do último toque do companheiro configura impedimento.';
const OFF_DIALOGUE = '[VAR]: "O momento do último toque está na linha do tempo. Marque o instante em que o pé toca a bola e as linhas 3D serão fixadas. A análise está à sua disposição."';

const off = (valid: boolean, title: string, desc: string, zone: IncidentPitchZone): Template => ({
  category: 'IMPEDIMENTO_3D',
  title: (a, d) => title.replace('{A}', a.shortName).replace('{D}', d.shortName),
  description: (a, d) => desc.replace('{A}', a.name).replace('{D}', d.name),
  context: 'Checagem de posição no instante do último toque.',
  recommended: valid ? 'GOAL_VALID' : 'GOAL_DISALLOWED',
  acceptable: [valid ? 'GOAL_VALID' : 'GOAL_DISALLOWED'],
  ifab: valid ? OFF_VALID_IFAB : OFF_BAD_IFAB,
  dialogue: OFF_DIALOGUE,
  graphicType: 'OFFSIDE_3D',
  metric: 'Linhas semiautomáticas 3D',
  zone
});

const pen = (rec: DecisionType, acc: DecisionType[], title: string, desc: string, ifab: string, zone: IncidentPitchZone, variant?: string): Template => ({
  category: 'PENALTI_DISPUTA',
  title: (a, d) => title.replace('{A}', a.shortName).replace('{D}', d.shortName),
  description: (a, d) => desc.replace('{A}', a.name).replace('{D}', d.name),
  context: 'Checagem de possível pênalti ou simulação.',
  recommended: rec, acceptable: acc, ifab,
  dialogue: '[VAR]: "Temos câmera master, aérea e close do ponto de contato a 120 FPS. Compare o instante do toque com o início da queda."',
  graphicType: 'BOX_PENALTY', metric: 'Verificação de ponto de contato', zone, variant, dive: variant === 'DIVE'
});

const dogso = (rec: DecisionType, title: string, desc: string, ifab: string, variant?: string): Template => ({
  category: 'DOGSO_CHANCE_CLARA',
  title: (a, d) => title.replace('{A}', a.shortName).replace('{D}', d.shortName),
  description: (a, d) => desc.replace('{A}', a.name).replace('{D}', d.name),
  context: 'Checagem de chance clara de gol dentro da área.',
  recommended: rec, acceptable: [rec], ifab,
  dialogue: '[VAR]: "Critérios da chance clara de gol em análise: distância ao gol, direção do lance, controle da bola e número de defensores. Veja as câmeras."',
  graphicType: 'BOX_PENALTY', metric: 'Critérios de chance clara de gol', variant,
  zone: { xPercent: 85, yPercent: 50, name: 'Grande Área Visitante' }
});

const tackle = (rec: DecisionType, acc: DecisionType[], title: string, desc: string, ifab: string, zone: IncidentPitchZone): Template => ({
  category: 'FORCA_EXCESSIVA',
  title: (a, d) => title.replace('{A}', a.shortName).replace('{D}', d.shortName),
  description: (a, d) => desc.replace('{A}', a.name).replace('{D}', d.name),
  context: 'Checagem disciplinar de entrada.',
  recommended: rec, acceptable: acc, ifab,
  dialogue: '[VAR]: "Câmera reversa e close em câmera lenta prontos. Avalie altura das travas, velocidade e ponto de contato."',
  graphicType: 'SLIDE_TACKLE', metric: 'Velocidade e altura da entrada', zone
});

const hand = (rec: DecisionType, acc: DecisionType[], title: string, desc: string, ifab: string, variant?: string, goal = false): Template => ({
  category: goal ? 'GOL_POLÊMICO' : 'MAO_VOLUMETRIA',
  title: (a, d) => title.replace('{A}', a.shortName).replace('{D}', d.shortName),
  description: (a, d) => desc.replace('{A}', a.name).replace('{D}', d.name),
  context: 'Checagem de toque de mão na área.',
  recommended: rec, acceptable: acc, ifab,
  dialogue: '[VAR]: "Visão biomecânica sincronizada. Analise o ângulo do braço em relação ao tronco e se o jogador ampliou o corpo."',
  graphicType: 'HAND_BALL', metric: 'Medição do ângulo do braço', variant,
  zone: goal ? { xPercent: 84, yPercent: 46, name: 'Grande Área Visitante' } : { xPercent: 86, yPercent: 52, name: 'Grande Área Visitante' }
});

const Z = (x: number, y: number, name: string): IncidentPitchZone => ({ xPercent: x, yPercent: y, name });
const R12 = 'Regra das faltas: avaliar se houve imprudência, falta de cuidado ou uso de força excessiva, e a intensidade do contato.';
const R12_PEN = 'Regra das faltas: cabe avaliar se houve rasteira, empurrão ou contato suficiente para a queda — e se o atleta iniciou a queda antes do toque.';
const R12_DOGSO = 'Regra da chance clara de gol: considera-se distância ao gol, direção do lance, probabilidade de manter ou ganhar o controle e número/posição dos defensores. Tentativa de jogar a bola com pênalti marcado rebaixa a punição para amarelo.';
const R12_HAND = 'Regra das faltas: avaliar se o braço estava em posição natural de equilíbrio ou se ampliou o corpo de forma antinatural, e a distância e o tempo de reação.';

const TEMPLATES: Template[] = [
  // Impedimentos — gols legais
  off(true, 'Gol de contra-ataque: ataque do {A} vs defesa do {D}', 'Contra-ataque rápido do {A}: lançamento em profundidade e finalização na saída do goleiro do {D}. A sala do VAR confere a linha defensiva no último toque.', Z(24, 42, 'Linha Defensiva / Bico da Área')),
  off(true, 'Gol após cruzamento rasteiro do {A}', 'Cruzamento rasteiro pela direita e conclusão para o gol. O atacante parte exatamente da linha do último defensor de linha do {D}.', Z(78, 38, 'Corredor Direito / Grande Área')),
  off(true, 'Bola longa nas costas da defesa: {A}', 'Lançamento longo do {A} e atacante aparece livre. O alinhamento com a defesa do {D} é decidido por centímetros.', Z(30, 48, 'Entrada da Área')),
  off(true, 'Gol com passe de calcanhar: {A}', 'Troca de passes na entrada da área seguida de passe de calcanhar e gol do {A}. Checagem do alinhamento no toque original.', Z(80, 45, 'Meia-Lua')),
  // Impedimentos — gols anulados
  off(false, 'Gol sob suspeita de impedimento: {A}', 'Finalização convertida pelo {A}. A sala do VAR busca o instante do passe para medir o atacante contra a linha do {D}.', Z(82, 40, 'Grande Área / Linha Defensiva')),
  off(false, 'Passe em profundidade: ombro adiantado — {A}', 'Passe em profundidade e gol. Possível ombro ou joelho do atacante do {A} à frente do último defensor de linha.', Z(76, 46, 'Linha Defensiva')),
  off(false, 'Bola nas costas da zaga do {D}', 'Atacante do {A} parte antes da bola ser tocada. A defesa do {D} reclama de impedimento.', Z(28, 50, 'Corredor Central')),
  off(false, 'Gol de contra-ataque anulado? {A}', 'Contra-ataque em velocidade, passe longo e gol. A linha do {D} subiu no momento do toque.', Z(70, 35, 'Lateral da Grande Área')),
  // Faltas na área (variantes: rasteira, puxão, empurrão, carga, legal, simulação)
  pen('PENALTY', ['PENALTY', 'PENALTY_YELLOW'], 'Rasteira na área: {A} vs {D}', 'Atacante do {A} é derrubado por rasteira clara dentro da área do {D}.', R12_PEN, Z(15, 48, 'Grande Área Mandante'), 'TRIP'),
  pen('PENALTY', ['PENALTY', 'PENALTY_YELLOW'], 'Puxão de camisa no cruzamento: {D}', 'Defensor do {D} segura a camisa do atacante do {A} e o impede de chegar na bola.', R12_PEN + ' Segurar o adversário com as mãos é infração.', Z(86, 46, 'Grande Área Visitante'), 'HOLD'),
  pen('PENALTY', ['PENALTY', 'PENALTY_YELLOW'], 'Puxão por trás ao receber lançamento: {A}', 'Atacante do {A} domina na área e é agarrado pelas costas pelo defensor do {D}.', R12_PEN, Z(15, 55, 'Grande Área Mandante'), 'HOLD'),
  pen('PENALTY', ['PENALTY', 'PENALTY_YELLOW'], 'Empurrão nas costas na disputa: {D}', 'Defensor do {D} empurra o atacante do {A} nas costas durante a corrida.', R12_PEN, Z(84, 52, 'Grande Área Visitante'), 'PUSH'),
  pen('PENALTY', ['PENALTY', 'PENALTY_YELLOW'], 'Carga imprudente de lado: {D}', 'Defensor do {D} atinge o atacante do {A} com carga lateral sem disputar a bola.', R12_PEN, Z(14, 42, 'Grande Área Mandante'), 'CHARGE'),
  pen('PLAY_ON', ['PLAY_ON', 'YELLOW_CARD'], 'Disputa de ombro na área: {A} vs {D}', 'Ombro a ombro dentro da área. Atacante do {A} cai e pede pênalti.', R12_PEN, Z(15, 55, 'Grande Área Mandante'), 'LEGIT'),
  pen('PLAY_ON', ['PLAY_ON', 'YELLOW_CARD'], 'Defensor toca na bola primeiro: {D}', 'Defensor do {D} desarma e depois há contato leve. Atacante do {A} reclama.', R12_PEN, Z(84, 44, 'Grande Área Visitante'), 'LEGIT'),
  pen('YELLOW_CARD', ['YELLOW_CARD', 'PLAY_ON'], 'Suspeita de simulação do {A}', 'Atacante do {A} se joga na área sem que o defensor do {D} o toque.', 'Regra das faltas: simular para enganar a arbitragem é infração punida com cartão amarelo.', Z(14, 50, 'Grande Área Mandante'), 'DIVE'),
  pen('YELLOW_CARD', ['YELLOW_CARD', 'PLAY_ON'], 'Queda sem contato: {A}', 'Lance rápido na área do {D}: queda suspeita do atacante do {A}, defensor recuando.', 'Regra das faltas: simulação é punida com amarelo, e o jogo é reiniciado com tiro livre indireto.', Z(88, 52, 'Grande Área Visitante'), 'DIVE'),
  // DOGSO
  dogso('PENALTY_RED', 'Último defensor agarra atacante: {A}', 'Atacante do {A} sai em direção ao gol e é agarrado pelo último defensor do {D}, sem tentar jogar a bola.', R12_DOGSO, 'HOLD'),
  dogso('PENALTY_RED', 'Chance clara anulada por falta: {D}', 'Lançamento deixa atacante do {A} sozinho. O zagueiro do {D} o derruba por trás, longe da bola.', R12_DOGSO, 'TRIP'),
  dogso('PENALTY_YELLOW', 'Defensor tenta a bola e derruba: {D}', 'O defensor do {D} desliza para jogar a bola, mas atinge o atacante do {A} com chance clara.', R12_DOGSO, 'TRIP'),
  dogso('PENALTY_YELLOW', 'Disputa de bola com chance clara: {A}', 'Atacante do {A} é derrubado ao disputar a bola com o defensor do {D}, que visava a bola.', R12_DOGSO, 'CHARGE'),
  // Entradas
  tackle('RED_CARD', ['RED_CARD', 'YELLOW_CARD'], 'Solada alta na canela: {D}', 'Jogador do {D} entra de carrinho com solada na altura da canela do meia do {A}.', R12 + ' Solada alta com travas expostas é conduta violenta.', Z(50, 50, 'Círculo Central')),
  tackle('RED_CARD', ['RED_CARD', 'YELLOW_CARD'], 'Entrada por trás com travas expostas: {D}', 'Volante do {D} chega atrasado por trás, travas expostas no tornozelo do atleta do {A}.', R12, Z(38, 62, 'Meio-campo Mandante')),
  tackle('YELLOW_CARD', ['YELLOW_CARD', 'FOUL'], 'Entrada imprudente no meio-campo: {D}', 'Carrinho forte do {D} no meio-campo, sem bola e com contato no tornozelo.', R12, Z(55, 30, 'Lateral do Meio-campo')),
  tackle('PLAY_ON', ['PLAY_ON', 'FOUL'], 'Carrinho limpo, bola primeiro: {D}', 'Carrinho do {D} pega a bola antes do contato com o meia do {A}, que cai.', R12, Z(48, 70, 'Lateral Direita')),
  tackle('FOUL', ['FOUL', 'YELLOW_CARD'], 'Falta tática em contra-ataque: {D}', 'Jogador do {D} corta o contra-ataque do {A} com falta no meio-campo.', R12, Z(52, 45, 'Meio-campo')),
  // Mão na bola (critérios: posição natural, ampliação do corpo, distância, reação, desvio, braço acima do ombro)
  hand('PENALTY', ['PENALTY'], 'Braço aberto bloqueia finalização: {D}', 'Finalização do {A} é bloqueada pelo braço aberto do defensor do {D} dentro da área.', R12_HAND, 'ABERTO'),
  hand('PENALTY', ['PENALTY'], 'Mão na bola após cruzamento: {D}', 'Cruzamento do {A} bate na mão do defensor do {D} que tenta bloquear com o braço afastado.', R12_HAND, 'ABERTO'),
  hand('PENALTY', ['PENALTY'], 'Braço acima do ombro: {D}', 'Defensor do {D} bloqueia o chute com o braço acima da linha do ombro.', R12_HAND, 'ACIMA_OMBRO'),
  hand('PLAY_ON', ['PLAY_ON'], 'Bola no braço colado ao corpo: {D}', 'Chute do {A} bate no braço colado ao corpo do defensor do {D}.', R12_HAND, 'NATURAL'),
  hand('PLAY_ON', ['PLAY_ON'], 'Braço em posição natural na corrida: {D}', 'Defensor do {D} corre com os braços em posição natural e a bola o atinge.', R12_HAND, 'NATURAL'),
  hand('PLAY_ON', ['PLAY_ON'], 'Rebote na coxa e depois no braço: {D}', 'A bola desvia na coxa e atinge o braço do defensor do {D} sem tempo de reação.', R12_HAND, 'DESVIO'),
  hand('PLAY_ON', ['PLAY_ON'], 'Desvio no próprio corpo antes do braço: {D}', 'Chute do {A} resvala no corpo do defensor do {D} e só depois toca o braço.', R12_HAND, 'DESVIO'),
  hand('PLAY_ON', ['PLAY_ON'], 'Bola à queima-roupa no braço: {D}', 'Chute do {A} a poucos metros atinge o braço do defensor do {D}, sem chance de reação.', R12_HAND, 'CURTA'),
  hand('GOAL_DISALLOWED', ['GOAL_DISALLOWED'], 'Mão do atacante antes do gol: {A}', 'Atacante do {A} domina a bola com o braço antes de finalizar e marcar. A sala do VAR revisa a jogada.', 'Regra das faltas: se um atacante marca gol imediatamente após tocar a bola com a mão ou braço, mesmo que acidentalmente, o gol não é válido.', 'ATACANTE_GOL', true),
  // ---- Mais impedimentos
  off(true, 'Gol em bola parada rápida: {A}', 'Cobrança rápida do {A} encontra o atacante bem posicionado. A sala do VAR confere o alinhamento com a defesa do {D}.', Z(74, 44, 'Linha Defensiva')),
  off(true, 'Passe de cabeça e gol legal: {A}', 'Prolongamento de cabeça do {A} e finalização. O atacante parte exatamente alinhado ao último defensor do {D}.', Z(80, 50, 'Entrada da Área')),
  off(false, 'Atacante antecipa a corrida: {A}', 'Cruzamento rasteiro do {A} e gol. O atacante parece ter arrancado cedo demais contra a linha do {D}.', Z(76, 42, 'Corredor Esquerdo')),
  off(false, 'Linha defensiva mal coordenada: {D}', 'A linha do {D} se desorganiza e o {A} marca. A sala do VAR mede o último toque na bola.', Z(26, 52, 'Linha Defensiva')),
  // ---- Mais faltas na área
  pen('PENALTY', ['PENALTY', 'PENALTY_YELLOW'], 'Pisão no calcanhar na entrada da área: {D}', 'Defensor do {D} pisa no calcanhar do atacante do {A}, que cai dentro da área.', R12_PEN, Z(14, 46, 'Grande Área Mandante'), 'TRIP'),
  pen('PENALTY', ['PENALTY', 'PENALTY_YELLOW'], 'Agarrão em cobrança de escanteio: {D}', 'Na disputa de escanteio, defensor do {D} agarra a camisa do atacante do {A}.', R12_PEN, Z(88, 44, 'Pequena Área Visitante'), 'HOLD'),
  pen('PENALTY', ['PENALTY', 'PENALTY_YELLOW'], 'Empurrão no cabeceio: {D}', 'Defensor do {D} empurra o atacante do {A} no momento do cabeceio.', R12_PEN, Z(87, 50, 'Pequena Área Visitante'), 'PUSH'),
  pen('PENALTY', ['PENALTY', 'PENALTY_YELLOW'], 'Carga lateral sem disputar a bola: {D}', 'Defensor do {D} atinge o atacante do {A} com o corpo, sem tentar jogar a bola.', R12_PEN, Z(13, 56, 'Grande Área Mandante'), 'CHARGE'),
  pen('PLAY_ON', ['PLAY_ON', 'YELLOW_CARD'], 'Carga ombro a ombro em cruzamento: {A}', 'Disputa de bola alta com contato legal entre os jogadores do {A} e do {D}.', R12_PEN, Z(85, 48, 'Grande Área Visitante'), 'LEGIT'),
  pen('YELLOW_CARD', ['YELLOW_CARD', 'PLAY_ON'], 'Queda teatral em cruzamento: {A}', 'Atacante do {A} se joga ao ser marcado de longe pelo defensor do {D}.', 'Regra das faltas: simulação é infração punida com amarelo.', Z(15, 52, 'Grande Área Mandante'), 'DIVE'),
  // ---- Mais DOGSO
  dogso('PENALTY_RED', 'Goleiro derruba atacante sozinho: {D}', 'Atacante do {A} passa pelo goleiro do {D} e é derrubado, sem chance de o goleiro jogar a bola.', R12_DOGSO, 'HOLD'),
  dogso('PENALTY_YELLOW', 'Carrinho para a bola e leva o atacante: {D}', 'Zagueiro do {D} desliza buscando a bola, mas leva o atacante do {A} que saía na cara do gol.', R12_DOGSO, 'TRIP'),
  // ---- Mais entradas
  tackle('RED_CARD', ['RED_CARD', 'YELLOW_CARD'], 'Carrinho duplo com travas na perna: {D}', 'Jogador do {D} entra de carrinho com as duas pernas e acerta a perna do atleta do {A}.', R12 + ' Entrada com as duas pernas é conduta violenta.', Z(46, 38, 'Meio-campo Mandante')),
  tackle('YELLOW_CARD', ['YELLOW_CARD', 'FOUL'], 'Carrinho forte pelo lado: {D}', 'Lateral do {D} desliza com força e acerta o adversário do {A}, sem chegar na bola.', R12, Z(60, 20, 'Corredor Esquerdo')),
  tackle('PLAY_ON', ['PLAY_ON', 'FOUL'], 'Disputa dividida com contato leve: {D}', 'Bola dividida entre o volante do {D} e o meia do {A}, com contato leve após o toque na bola.', R12, Z(52, 60, 'Meio-campo')),
  tackle('FOUL', ['FOUL', 'YELLOW_CARD'], 'Carrinho por trás sem perigo: {D}', 'Defensor do {D} derruba o atacante do {A} por trás, em jogada sem grande perigo.', R12, Z(40, 55, 'Meio-campo Mandante')),
  // ---- Mais mãos na bola
  hand('PENALTY', ['PENALTY'], 'Braço esticado no bloqueio de cruzamento: {D}', 'Defensor do {D} estica o braço para bloquear o cruzamento do {A} dentro da área.', R12_HAND, 'ABERTO'),
  hand('PLAY_ON', ['PLAY_ON'], 'Braço junto ao corpo em bloqueio: {D}', 'Chute do {A} bate no braço colado ao corpo do defensor do {D} na área.', R12_HAND, 'NATURAL'),
  hand('PLAY_ON', ['PLAY_ON'], 'Desvia na cabeça e vai no braço: {D}', 'A bola desvia na cabeça do defensor do {D} e depois toca o braço, sem chance de reação.', R12_HAND, 'DESVIO'),
  hand('PLAY_ON', ['PLAY_ON'], 'Cabeceio de curta distância no braço: {D}', 'Cabeceio do {A} a poucos metros atinge o braço do defensor do {D}.', R12_HAND, 'CURTA'),
];

const MEMORY = 22;
const ORIGINS = ['A jogada nasce de uma bola parada.', 'A jogada começa pelo lado direito do ataque.', 'A jogada começa pelo lado esquerdo.', 'Tudo parte de um erro de passe na saída de bola.', 'A jogada vem de uma troca de passes rápida.', 'O lance acontece após um lançamento longo.', 'A jogada nasce em contra-ataque.', 'A jogada vem de uma bola recuperada na pressão.', 'O lance surge logo depois de uma cobrança de lateral.', 'A jogada é individual, após drible na entrada da área.']
let recent: number[] = [];

const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = <T,>(arr: T[]): T[] => {
  const x = [...arr];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
};

export function getRandomIncidentsForMatch(home: Team, away: Team): Incident[] {
  const roll = Math.random();
  const count = roll < 0.5 ? 3 : roll < 0.87 ? 4 : 5;
  // Expulsão direta é rara no futebol real: só uma parte dos jogos pode ter um lance de vermelho (no máximo 1)
  const isRed = (t: Template) => t.recommended === 'RED_CARD' || t.recommended === 'PENALTY_RED';
  const allowRed = Math.random() < 0.14;
  const pool = shuffle(TEMPLATES.map((t, i) => ({ t, i })).filter(x => !recent.includes(x.i) && (allowRed || !isRed(x.t))));
  const chosen: { t: Template; i: number }[] = [];
  const cats = new Set<string>();
  let reds = 0;
  const take = (x: { t: Template; i: number }) => { chosen.push(x); cats.add(x.t.category); if (isRed(x.t)) reds++; };
  pool.forEach(x => { if (chosen.length < count && !cats.has(x.t.category) && (!isRed(x.t) || reds < 1)) take(x); });
  pool.forEach(x => { if (chosen.length < count && !chosen.includes(x) && (!isRed(x.t) || reds < 1)) take(x); });
  recent = [...recent, ...chosen.map(c => c.i)].slice(-MEMORY);

  const spread = (n: number, lo: number, hi: number, gap: number): number[] => {
    for (let tries = 0; tries < 60; tries++) {
      const xs = Array.from({ length: n }, () => rnd(lo, hi)).sort((x, y) => x - y);
      if (xs.every((x, i) => i === 0 || x - xs[i - 1] >= gap)) return xs;
    }
    return Array.from({ length: n }, (_, i) => lo + Math.floor(((hi - lo) / Math.max(1, n)) * i));
  };
  const nFirst = count === 3 ? rnd(1, 2) : 2;
  const minutes = [...spread(nFirst, 8, 43, 7), ...spread(count - nFirst, 50, 89, 7)];

  return chosen.map(({ t, i }, idx) => {
    const attackingTeam: 'HOME' | 'AWAY' = Math.random() < 0.5 ? 'HOME' : 'AWAY';
    const defendingTeam: 'HOME' | 'AWAY' = attackingTeam === 'HOME' ? 'AWAY' : 'HOME';
    const atk = attackingTeam === 'HOME' ? home : away;
    const def = attackingTeam === 'HOME' ? away : home;
    const min = minutes[idx];
    const jitter = (v: number) => Math.max(8, Math.min(92, v + rnd(-4, 4)));
    const frame = (n: 0 | 1 | 2, label: string, off: number, speed: number) => ({
      frameIndex: n, label, timecode: min + ':' + (14 + off) + '.020', subtitle: label, svgGraphicType: t.graphicType,
      attackerNumber: 9, defenderNumber: 3, speedKmh: speed, metricDetail: t.metric
    });
    return {
      id: 'incident-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).slice(2, 7) + '-t' + i,
      minute: min,
      category: t.category,
      title: t.title(atk, def),
      description: t.description(atk, def) + ' ' + pickOne(ORIGINS),
      context: t.context,
      pitchZone: { ...t.zone, xPercent: jitter(t.zone.xPercent), yPercent: jitter(t.zone.yPercent) },
      variant: t.variant,
      offendingTeam: t.dive || t.category === 'GOL_POLÊMICO' ? attackingTeam : defendingTeam,
      attackingTeam,
      offendingPlayerNumber: rnd(2, 8),
      victimPlayerNumber: rnd(7, 11),
      recommendedVarDecision: t.recommended,
      acceptableDecisions: t.acceptable,
      ifabExplanation: t.ifab,
      defaultVarDialogue: t.dialogue,
      frames: [frame(0, 'Câmera lateral', 0, 31.4), frame(1, 'Ponto de Impacto', 2, 28.1), frame(2, 'De perto, em câmera lenta', 4, 14)]
    };
  });
}
