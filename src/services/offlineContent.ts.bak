// Banco de textos 100% offline. Substitui a IA: não precisa de internet nem de chave.
// Cada função monta o texto com sorteio + dados reais da partida (nomes, placar, acertos e erros).
import type { Team, PreMatchStoryline, MediaMesaRedonda, DecisionVerdictReport, DecisionType, Incident } from '../types/types';
import { DECISION_LABEL } from '../store/careerLogic';

const pickOne = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const fill = (tpl: string, v: Record<string, string | number>) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
const lab = (d: DecisionType | string) => DECISION_LABEL[d] ?? String(d);

// ---------------------------------------------------------------- PRÉ-JOGO
const PRE_HEADLINE = [
  '{home} e {away} jogam sob o olhar atento da arbitragem ({stadium})',
  'Clima quente: {home} x {away} promete e {ref} está no centro das atenções ({stadium})',
  '{home} x {away}: tudo pronto para um jogo que pode ser decidido no apito',
  'Pressão total: {ref} apita {home} x {away} ({stadium})',
  'Torcida lotando {stadium} e muita cobrança por critério no jogo de hoje',
  '{home} e {away} chegam ligados no 220V, e a arbitragem vai ser testada',
  'Jogo grande ({stadium}): a diferença pode estar nos detalhes do apito',
  'Quem ficar com a cabeça fria leva a melhor em {home} x {away}',
  'Todos os olhos em {ref}: {home} x {away} tem tudo para ser nervoso',
  '{away} visita {home} e pede equilíbrio da arbitragem ({stadium})',
  'Rodada de cobrança: {home} x {away} vale muito e o árbitro sabe disso',
  'Bastidores: {ref} se prepara para um {home} x {away} de ânimos exaltados'
];
const PRE_HEADLINE_HOT = [
  'JOGO PEGADO À VISTA: {home} e {away} têm histórico de dividida forte, e {ref} terá trabalho',
  'Cartão no bolso: {home} x {away} promete entradas duras ({stadium})',
  'Clássico de nervos: os dois times jogam duro e {ref} não pode errar a mão'
];
const PRE_HOME = [
  '{mgr}: "Confiamos na arbitragem, mas vamos cobrar o mesmo critério nos lances importantes."',
  '{mgr}: "Em casa, com nossa torcida, queremos um jogo limpo e um árbitro que não se intimide."',
  '{mgr}: "Respeito o árbitro, só peço que mantenha o padrão do começo ao fim."',
  '{mgr}: "O time está preparado. Não queremos favor, só um jogo justo."',
  '{mgr}: "A gente já foi prejudicado antes. Hoje esperamos coerência nos lances de área."',
  '{mgr}: "Vamos jogar bola. Se a arbitragem ajudar a deixar o jogo correr, melhor para todos."',
  '{mgr}: "Cartão a gente aceita, desde que seja igual para os dois lados."',
  '{mgr}: "Esse jogo é decisivo para nós. Peço serenidade de todo mundo, inclusive do apito."',
  '{mgr}: "Meus jogadores sabem que não podem reclamar demais. Em troca, esperamos respeito."',
  '{mgr}: "Preparei o time para um jogo duro. O árbitro precisa controlar o ritmo."'
];
const PRE_AWAY = [
  '{mgr}: "Jogar fora exige um árbitro com personalidade, que não se dobre à pressão da torcida."',
  '{mgr}: "Sabemos que vai ser difícil aqui. Só queremos igualdade de tratamento."',
  '{mgr}: "Não vamos dar desculpa: se tiver pênalti, que seja marcado, para quem for."',
  '{mgr}: "Viemos buscar pontos. A arbitragem não pode se deixar levar pelo ambiente."',
  '{mgr}: "Costumamos sofrer em casa dos outros. Hoje pedimos firmeza no controle do jogo."',
  '{mgr}: "O time viajou bem e está concentrado. Esperamos um jogo sem polêmica."',
  '{mgr}: "Qualquer dúvida, que o VAR ajude. Queremos decisão certa, não decisão rápida."',
  '{mgr}: "Se o árbitro cortar a catimba cedo, o jogo fica bonito para os dois lados."',
  '{mgr}: "Respeitamos o mandante, mas queremos o mesmo cartão para o mesmo lance."',
  '{mgr}: "Vamos competir de cabeça erguida e aceitar o que o árbitro decidir."'
];
const PRE_SCRUTINY = [
  'A comissão de arbitragem acompanha o jogo de perto e {ref} sabe que cada decisão será revista.',
  'Imprensa e torcida estão de olho: lances de área e cartões vão pesar na nota de {ref}.',
  '{ref} vem sendo observado e este jogo pode pesar na próxima escala.',
  'O clima pede cabeça fria. {ref} precisa mostrar autoridade desde o primeiro apito.',
  'Observadores no estádio: qualquer erro de {ref} será analisado depois, quadro a quadro.',
  'Partida de alta tensão. Do árbitro se espera critério, firmeza e boa comunicação com os capitães.',
  'Os dois times pedem equilíbrio. {ref} terá de dosar bem advertências e cartões.',
  'Expectativa grande em torno de {ref}: uma atuação segura pode render pontos de reputação.'
];

export function buildPreMatchStoryline(home: Team, away: Team, _tier: string, refName: string): PreMatchStoryline {
  const hot = (home.aggressionLevel ?? 5) + (away.aggressionLevel ?? 5) >= 14;
  const v = { home: home.name, away: away.name, stadium: home.stadiumName, ref: refName };
  return {
    pressHeadline: fill(hot && Math.random() < 0.6 ? pickOne(PRE_HEADLINE_HOT) : pickOne(PRE_HEADLINE), v).toUpperCase(),
    homeManagerQuote: fill(pickOne(PRE_HOME), { mgr: home.managerName }),
    awayManagerQuote: fill(pickOne(PRE_AWAY), { mgr: away.managerName }),
    scrutinyContext: fill(pickOne(PRE_SCRUTINY), v)
  };
}

// ---------------------------------------------------------------- REVIRAVOLTA
const TWIST: Record<string, { lines: string[]; heat: number }> = {
  'Invasão de campo por torcedor': {
    heat: 20,
    lines: [
      'Um torcedor invade o gramado e corre em direção aos jogadores! A segurança entra em campo!',
      'Invasão! Um torcedor pula o alambrado e tenta chegar perto de um atleta. Jogo parado.',
      'O jogo é interrompido: torcedor em campo, seguranças correm atrás e os jogadores se afastam.',
      'Torcedor no gramado! Os atletas pedem providência e o árbitro precisa retomar o controle.',
      'Confusão nas laterais: um invasor entra em campo e a partida perde o ritmo.',
      'A segurança segura o invasor perto da área. A torcida vaia, os jogadores reclamam do atraso.'
    ]
  },
  'Confusão generalizada entre jogadores': {
    heat: 28,
    lines: [
      'Empurra-empurra! Jogadores dos dois times se juntam no meio-campo e o árbitro corre para separar.',
      'Confusão generalizada! Reservas entram em campo e o clima fica explosivo.',
      'Começou com uma dividida e virou tumulto: vários jogadores trocam empurrões e xingamentos.',
      'O capitão tenta acalmar, mas a discussão não para. Os ânimos estão no limite!',
      'Jogadores se encaram, o banco de reservas levanta e o árbitro pede calma com firmeza.',
      'Briga em campo! Há gente de todos os lados na confusão e o estádio inteiro reage.'
    ]
  },
  'Objetos arremessados da arquibancada': {
    heat: 24,
    lines: [
      'Objetos caem no gramado! O árbitro avisa o delegado e o jogo pode ser paralisado.',
      'Torcedores arremessam copos e garrafas perto do escanteio. O jogo é interrompido.',
      'Chuva de objetos vinda da arquibancada: o locutor pede calma pelo alto-falante.',
      'O goleiro é atingido por um copo e pede ao árbitro que tome providência.',
      'Isqueiros e copos voam das arquibancadas. A segurança entra e o árbitro olha para o delegado.',
      'Arremesso de objetos! O estádio fica tenso e o árbitro precisa decidir se segue o jogo.'
    ]
  }
};
const TWIST_GENERIC = ['Um fato inesperado esquenta o jogo e o árbitro precisa agir com calma.', 'Situação fora do comum em campo: os ânimos sobem e o jogo perde o ritmo.'];

export function buildTwistNarrative(twist: string, home: string, away: string, score: string, minute: number): { narration: string; temperatureDelta: number } {
  const t = TWIST[twist];
  const line = pickOne(t ? t.lines : TWIST_GENERIC);
  const delta = (t ? t.heat : 22) + Math.floor(Math.random() * 5) - 2;
  const tail = pickOne([
    '', '', ' O estádio está em ebulição!', ' O clima ficou pesado.', ' O árbitro precisa de pulso firme agora.', ' ' + home + ' ' + score.replace('-', ' x ') + ' ' + away + ', mas o foco saiu do jogo.'
  ]);
  return { narration: minute + "' ⚡ " + line + tail, temperatureDelta: delta };
}

// ---------------------------------------------------------------- PÓS-JOGO (MESA REDONDA)
type Tier = 'ELOGIO' | 'BOM' | 'REGULAR' | 'CRITICA';
const tierOf = (r: number): Tier => (r >= 9 ? 'ELOGIO' : r >= 8.2 ? 'BOM' : r >= 7 ? 'REGULAR' : 'CRITICA');

const PROGRAMS = ['Mesa Redonda • Debate Pós-Jogo', 'Central do Apito • Análise Oficial', 'Linha de Passe • Arbitragem em Foco', 'Bola na Rede • Papo de Árbitro', 'Resenha do Apito • Bancada'];

const HEADLINE: Record<Tier, string[]> = {
  ELOGIO: [
    'AULA DE ARBITRAGEM: {ref} dá show em {home} {score} {away}',
    'NOTA ALTA: {ref} conduz {home} {score} {away} com segurança e autoridade',
    'Sem polêmica! {ref} comanda {home} {score} {away} e recebe elogios',
    'Apito firme e critério claro: {ref} é o destaque de {home} {score} {away}',
    'Imprensa aprova: {ref} faz atuação de nível alto em {home} {score} {away}'
  ],
  BOM: [
    'ARBITRAGEM SEGURA: {ref} controla {home} {score} {away} sem grandes sustos',
    'Boa atuação de {ref} em {home} {score} {away}, com pequenos detalhes a corrigir',
    '{ref} entrega jogo equilibrado em {home} {score} {away}',
    'Sem grandes reclamações: {ref} conduz bem {home} {score} {away}',
    'Jogo sob controle: {ref} cumpre bem a missão em {home} {score} {away}'
  ],
  REGULAR: [
    'ATUAÇÃO IRREGULAR: {ref} divide opiniões em {home} {score} {away}',
    'Altos e baixos: {ref} tem noite de acertos e erros em {home} {score} {away}',
    'Debate aberto: lances de {home} {score} {away} rendem discussão sobre {ref}',
    '{ref} termina {home} {score} {away} com críticas pontuais',
    'Nem tão bem, nem tão mal: o apito de {ref} gera conversa em {home} {score} {away}'
  ],
  CRITICA: [
    'DEBATE FERVE: decisões de {ref} geram revolta em {home} {score} {away}',
    'Noite para esquecer: {ref} é muito criticado após {home} {score} {away}',
    'Erros pesam: {ref} perde o controle em {home} {score} {away}',
    'Pressão sobre {ref}: lances de {home} {score} {away} serão revistos pela comissão',
    'Arbitragem na berlinda: {ref} é alvo de críticas após {home} {score} {away}'
  ]
};
const EXPERT: Record<Tier, string[]> = {
  ELOGIO: [
    'Ex-árbitro: "Foi uma atuação de alto nível. Leu bem cada lance, manteve o critério e usou a comunicação com os capitães na hora certa."',
    'Ex-árbitro: "Posicionamento exemplar e decisões firmes. Quando o VAR chamou, a revisão só confirmou o que ele já tinha visto."',
    'Ex-árbitro: "Esse é o padrão que a gente quer ver. Pouca reclamação porque o critério ficou claro desde o início."',
    'Ex-árbitro: "Controlou a temperatura do jogo sem aparecer mais que os jogadores. Isso é arbitragem de verdade."'
  ],
  BOM: [
    'Ex-árbitro: "Jogo bem conduzido. Teve um ou outro detalhe de posicionamento, mas as decisões principais foram corretas."',
    'Ex-árbitro: "Boa leitura de jogo e bom controle disciplinar. Faltou só um pouco mais de antecipação em duas faltas."',
    'Ex-árbitro: "Mostrou personalidade nos lances capitais e manteve o jogo dentro das regras da IFAB."',
    'Ex-árbitro: "Atuação segura. Com mais atenção na gestão dos cartões, seria nota máxima."'
  ],
  REGULAR: [
    'Ex-árbitro: "Houve acertos importantes, mas também decisões em que faltou critério. O jogo pedia mais firmeza no começo."',
    'Ex-árbitro: "Em alguns lances a decisão de campo ficou distante da regra. Precisa rever a leitura de contato e de intensidade."',
    'Ex-árbitro: "Variou o critério ao longo do jogo, e isso gera reclamação. A consistência é o ponto de melhora."',
    'Ex-árbitro: "Não foi uma má atuação, mas deixou o jogo esquentar além do necessário. Faltou usar melhor o apito."'
  ],
  CRITICA: [
    'Ex-árbitro: "Foi uma atuação abaixo do esperado. Os erros nos lances capitais pesaram e o jogo escapou do controle."',
    'Ex-árbitro: "Decisões contrárias à regra e pouca comunicação. Quando o critério falha, os jogadores percebem na hora."',
    'Ex-árbitro: "Faltou leitura de jogo. Ele precisa estudar esses lances com calma, porque o protocolo era claro."',
    'Ex-árbitro: "Perdeu a autoridade ao longo do jogo. Para a próxima escala, precisa de um recomeço mais firme."'
  ]
};
const JOURNALIST: Record<Tier, string[]> = {
  ELOGIO: [
    'Comentarista de TV: "Raro ver uma arbitragem tão tranquila em jogo tão nervoso. Ninguém saiu falando do árbitro, e isso é o maior elogio."',
    'Comentarista de TV: "O jogo foi decidido pelos jogadores. Quando o apito some do noticiário, é sinal de trabalho bem feito."',
    'Comentarista de TV: "Teve pressão da torcida, teve reclamação, e ele não se intimidou. Parabéns pela atuação."'
  ],
  BOM: [
    'Comentarista de TV: "Foi um bom trabalho. Teve um lance ou outro para discutir, mas nada que manche a atuação."',
    'Comentarista de TV: "Jogo nervoso, árbitro firme. Pequenos deslizes, mas a conta fecha no azul."',
    'Comentarista de TV: "Não deu margem para grandes polêmicas e manteve a legitimidade do resultado."'
  ],
  REGULAR: [
    'Comentarista de TV: "O torcedor vai reclamar de uns dois lances, e com razão. Mas também teve decisão corajosa que merece reconhecimento."',
    'Comentarista de TV: "Uma arbitragem que dividiu a mesa. Dá para defender e dá para criticar, e essa já é a notícia."',
    'Comentarista de TV: "Faltou padrão. Um cartão aqui, um perdão ali, e o clima foi esquentando."'
  ],
  CRITICA: [
    'Comentarista de TV: "Não dá para esconder: o árbitro foi o assunto do jogo, e pelos motivos errados. A comissão vai ter muito o que rever."',
    'Comentarista de TV: "Os clubes têm razão de reclamar. Os lances decisivos foram mal resolvidos e isso muda o resultado."',
    'Comentarista de TV: "Noite difícil para a arbitragem. Quando a dúvida vira erro, o preço é a credibilidade."'
  ]
};
const VERDICT: Record<Tier, string[]> = {
  ELOGIO: ['APROVADO COM LOUVOR', 'NOTA MÁXIMA DA MESA', 'ATUAÇÃO EXEMPLAR'],
  BOM: ['APROVADO PELA CRÍTICA', 'BOA ATUAÇÃO, COM RESSALVAS', 'JOGO BEM CONDUZIDO'],
  REGULAR: ['ATUAÇÃO IRREGULAR', 'NOTA DIVIDIDA PELA MESA', 'PRECISA MELHORAR'],
  CRITICA: ['SOB FORTE ESCRUTÍNIO DA IMPRENSA', 'CRÍTICAS SEVERAS DA MESA', 'ATUAÇÃO ABAIXO DO ESPERADO']
};
const CLOSING_ACC = [
  (n: number, ok: number) => ' Dos ' + n + ' lance' + (n === 1 ? '' : 's') + ' decisivo' + (n === 1 ? '' : 's') + ', acertou ' + ok + '.',
  (n: number, ok: number) => ' Foram ' + n + ' lance' + (n === 1 ? '' : 's') + ' de peso, com ' + ok + ' acerto' + (ok === 1 ? '' : 's') + '.',
  (n: number, ok: number) => ' Nos lances capitais (' + n + '), a decisão correta saiu ' + ok + ' vez' + (ok === 1 ? '' : 'es') + '.'
];
const CLOSING_CARDS = [
  (y: number, r: number) => ' Foram ' + y + ' amarelo' + (y === 1 ? '' : 's') + ' e ' + r + ' vermelho' + (r === 1 ? '' : 's') + ' no jogo.',
  (y: number, r: number) => ' O jogo terminou com ' + y + ' amarelo' + (y === 1 ? '' : 's') + ' e ' + r + ' expulsão' + (r === 1 ? '' : 'ões') + '.'
];

export interface MediaExtra { yellows: number; reds: number; brawls: number }

export function buildPostMatchMedia(
  homeTeam: string, awayTeam: string, score: string, rating: number, refName: string,
  history: { incident: Incident; initial: DecisionType; final: DecisionType; isCorrect: boolean }[],
  extra?: MediaExtra
): { mediaMesaRedonda: MediaMesaRedonda; decisionVerdicts: DecisionVerdictReport[] } {
  const tier = tierOf(rating);
  const v = { home: homeTeam, away: awayTeam, score: score.replace('-', ' x '), ref: refName };
  const ok = history.filter(h => h.isCorrect).length;
  let expert = pickOne(EXPERT[tier]);
  if (history.length > 0) expert += pickOne(CLOSING_ACC)(history.length, ok);
  let journalist = pickOne(JOURNALIST[tier]);
  if (extra) {
    if (extra.brawls > 0) journalist += ' O tumulto em campo também pesou na avaliação.';
    else if (extra.reds > 0) journalist += pickOne(CLOSING_CARDS)(extra.yellows, extra.reds);
    else if (extra.yellows >= 6) journalist += ' Foram muitos cartões para um jogo só.';
  }
  const mediaMesaRedonda: MediaMesaRedonda = {
    programName: pickOne(PROGRAMS),
    headline: fill(pickOne(HEADLINE[tier]), v),
    refereeExpertAnalysis: expert,
    journalistOpinion: journalist,
    verdictSummary: pickOne(VERDICT[tier])
  };

  const GOOD = [
    'Acerto: a decisão "{final}" estava de acordo com a regra. O lance exigia leitura rápida do contato e você não se deixou levar pela encenação.',
    'Boa decisão ({final}). A regra da IFAB sustenta a marcação, e o VAR confirmaria a mesma leitura. {rule}',
    'Leitura correta: "{final}" é o que o protocolo pede nesse lance. Posicionamento e decisão no tempo certo.',
    'Decisão certa. Em {title}, o critério era claro e você aplicou {final} com segurança.',
    'Sem dúvida nesse lance: {final}. Mostra domínio das regras e boa gestão da pressão.'
  ];
  const BAD = [
    'Erro de arbitragem: marcar "{final}" divergiu do protocolo. O lance pedia "{rec}". {rule}',
    'A decisão "{final}" não se sustenta à luz da regra. O correto seria "{rec}". {rule}',
    'Lance mal resolvido: o VAR indicava "{rec}", e a decisão de campo foi "{final}". Vale rever a leitura desse tipo de contato.',
    'Equívoco em {title}: a regra apontava "{rec}". Esse tipo de erro pesa na nota técnica.',
    'Faltou critério: "{final}" não era a resposta certa aqui. Para esse lance, o certo era "{rec}". {rule}'
  ];
  const decisionVerdicts: DecisionVerdictReport[] = history.map(h => ({
    minute: h.incident.minute,
    incidentTitle: h.incident.title,
    refereeDecision: h.final,
    recommendedDecision: h.incident.recommendedVarDecision,
    isCorrect: h.isCorrect,
    geminiAnalysis: fill(pickOne(h.isCorrect ? GOOD : BAD), {
      final: lab(h.final), rec: lab(h.incident.recommendedVarDecision), title: h.incident.title, rule: h.incident.ifabExplanation ?? ''
    }).trim()
  }));
  return { mediaMesaRedonda, decisionVerdicts };
}
