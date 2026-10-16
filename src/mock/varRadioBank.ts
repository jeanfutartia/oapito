import type { Incident } from '../types/types';

// Banco de conversas do rádio com a cabine do VAR. Funciona 100% sem internet e sem IA.
export type RadioCat = 'GERAL' | 'CAMERAS' | 'CONTATO' | 'CARTAO' | 'MAO' | 'IMPEDIMENTO';
export const RADIO_CATS: Record<RadioCat, string> = {
  GERAL: '💬 Geral', CAMERAS: '🎥 Câmeras', CONTATO: '🦵 Contato', CARTAO: '🟨 Cartão', MAO: '✋ Mão na bola', IMPEDIMENTO: '🚩 Impedimento'
};

type Cat = Incident['category'];
export interface RadioQuestion {
  id: string; cat: RadioCat; send: string; keys: string[]; only?: Cat[];
  yes?: string[]; no?: string[]; any?: string[]; byVariant?: Record<string, string[]>;
}

const FOUL: Cat[] = ['PENALTI_DISPUTA', 'FORCA_EXCESSIVA', 'DOGSO_CHANCE_CLARA'];
const HAND: Cat[] = ['MAO_VOLUMETRIA', 'GOL_POLÊMICO'];
const OFF: Cat[] = ['IMPEDIMENTO_3D'];
const CARD: Cat[] = ['FORCA_EXCESSIVA', 'DOGSO_CHANCE_CLARA', 'PENALTI_DISPUTA'];

const Q = (id: string, cat: RadioCat, send: string, keys: string[], rest: Partial<RadioQuestion> = {}): RadioQuestion => ({ id, cat, send, keys, ...rest });

export const RADIO_QUESTIONS: RadioQuestion[] = [
  // ---------- GERAL ----------
  Q('g1', 'GERAL', 'Pode resumir o que vocês estão vendo?', ['resumir', 'resumo', 'repetir', 'viu'], {
    any: ['Estamos revisando: {titulo}, aos {min} minutos, na região {zona}. Ainda checando as imagens.', 'O lance é "{titulo}". Aconteceu na região {zona} e já separamos as melhores câmeras.', 'Resumindo: {titulo}. Estamos com as imagens na tela e analisando quadro a quadro.'] }),
  Q('g2', 'GERAL', 'Vocês recomendam revisar no monitor?', ['recomendam', 'revisar', 'monitor', 'revisão'], {
    yes: ['Sim, recomendamos olhar no monitor. Há indícios de erro.', 'Recomendamos a revisão. Pelas imagens, vale você conferir.'],
    no: ['Não vemos erro claro. Pode manter sua decisão se quiser.', 'Pelo que vemos, o lance não pede revisão. Mas o monitor está à sua disposição.'] }),
  Q('g3', 'GERAL', 'Qual decisão vocês tomariam?', ['decisão', 'tomariam', 'decidir', 'qual'], {
    any: ['A decisão é sua, árbitro. Nós só passamos o que as imagens mostram.', 'Não podemos decidir por você. Pergunte sobre contato, câmera ou regra e respondemos.', 'Quem decide é o árbitro. Podemos ajudar com os fatos.'] }),
  Q('g4', 'GERAL', 'Quanto tempo a revisão vai demorar?', ['tempo', 'demorar', 'demora', 'quanto'], {
    any: ['Cerca de um minuto. Já estamos com as imagens separadas.', 'Rápido: menos de um minuto, se você for ao monitor.', 'A revisão leva pouco tempo. O tempo perdido será somado no acréscimo.'] }),
  Q('g5', 'GERAL', 'Quantas câmeras pegaram o lance?', ['quantas', 'câmeras', 'cameras', 'cobrem'], {
    any: ['Temos 5 ângulos disponíveis: lateral, de cima, atrás do gol, aérea e de perto.', 'Cinco câmeras cobrem o lance, mais a de cima com linhas.', 'Todas as câmeras principais pegaram. Nenhuma ficou sem visão.'] }),
  Q('g6', 'GERAL', 'A bola estava em jogo?', ['bola', 'jogo', 'parada', 'em jogo'], {
    any: ['Sim, a bola estava em jogo normalmente.', 'Estava em jogo. Nada de interrupção antes do lance.', 'Confirmado: bola em jogo desde antes da jogada.'] }),
  Q('g7', 'GERAL', 'Onde foi o lance exatamente?', ['onde', 'local', 'região', 'zona', 'área'], {
    any: ['O lance foi na região: {zona}.', 'Foi em {zona}, aos {min} minutos.', 'Região do lance: {zona}. Já marcamos no mapa.'] }),
  Q('g8', 'GERAL', 'Quem estava envolvido na jogada?', ['quem', 'envolvido', 'jogador', 'jogadores'], {
    any: ['Um atacante e o defensor mais próximo, na região {zona}.', 'Dois jogadores principais: o atacante com a bola e o defensor marcando.', 'O lance envolve o atacante e o defensor, com outros jogadores ao redor.'] }),
  Q('g9', 'GERAL', 'A fase de ataque anterior está limpa?', ['ataque', 'anterior', 'antes', 'infração', 'limpa'], {
    yes: ['Há um ponto de atenção na jogada anterior. Vale olhar o replay desde o início.', 'Existe algo que merece olhar antes do lance principal. Veja no monitor.'],
    no: ['A jogada anterior está limpa. Nada irregular antes.', 'Revisamos desde o começo da jogada. Não há infração antes.'] }),
  Q('g10', 'GERAL', 'Os jogadores estão reclamando muito?', ['reclamando', 'reclamação', 'protesto', 'cercaram'], {
    any: ['Alguns jogadores pedem o VAR, mas nada fora do normal.', 'Há protestos dos dois lados. O estádio está atento.', 'Estão reclamando, mas já se afastaram. Você tem tempo.'] }),
  Q('g11', 'GERAL', 'Esse lance pode mudar o placar?', ['placar', 'gol', 'resultado', 'muda'], {
    any: ['Pode influenciar, sim. Por isso a revisão é importante.', 'Dependendo da decisão, o placar muda. Vale conferir com calma.', 'É um lance importante para o resultado. Sem pressa.'] }),
  Q('g12', 'GERAL', 'Você está seguro da sua leitura?', ['seguro', 'certeza', 'confiança', 'tem certeza'], {
    any: ['Temos boa confiança, mas só o monitor mostra todos os detalhes.', 'Estamos seguros do que vemos, mas a decisão final é sua.', 'Confiança média. Vale confirmar pelas linhas e câmeras.'] }),

  // ---------- CÂMERAS ----------
  Q('c1', 'CAMERAS', 'Qual câmera tem o melhor ângulo?', ['melhor', 'ângulo', 'angulo', 'câmera'], {
    only: FOUL, any: ['A câmera de perto e a lateral mostram bem o ponto de contato.', 'A lateral mostra a altura da perna; a de perto mostra o contato.', 'Use a de perto em câmera lenta. É a mais clara.'] }),
  Q('c1b', 'CAMERAS', 'Qual câmera tem o melhor ângulo?', ['melhor', 'ângulo', 'angulo', 'câmera'], {
    only: HAND, any: ['A câmera de frente mostra o ângulo do braço com clareza.', 'Para a mão, use a câmera de frente e depois a lateral.', 'A de frente é a melhor: dá para medir o braço em relação ao corpo.'] }),
  Q('c1c', 'CAMERAS', 'Qual câmera tem o melhor ângulo?', ['melhor', 'ângulo', 'angulo', 'câmera'], {
    only: OFF, any: ['Use a visão de cima com as linhas 3D. É a mais precisa.', 'A câmera de cima mostra bem as linhas. Compare com a aérea.', 'De cima, com o último toque marcado, fica claro.'] }),
  Q('c2', 'CAMERAS', 'Dá para ver em câmera lenta?', ['lenta', 'slow', 'devagar', 'quadro'], {
    any: ['Sim, pode andar quadro a quadro. Use a câmera de perto em 0,25x.', 'Câmera lenta disponível: avance quadro a quadro no monitor.', 'Pode usar 0,25x e passar frame por frame.'] }),
  Q('c3', 'CAMERAS', 'Tem imagem de trás do gol?', ['trás', 'atrás', 'gol', 'trave'], {
    any: ['Temos, sim. A câmera de trás do gol mostra a profundidade do lance.', 'A câmera atrás do gol pegou bem. Dá para ver quem estava mais à frente.', 'Sim, a câmera do gol mostra a distância entre os jogadores.'] }),
  Q('c4', 'CAMERAS', 'Tem a visão de cima?', ['cima', 'tática', 'tatica', 'aérea'], {
    any: ['Sim, a visão de cima mostra as posições de todos.', 'A câmera tática está disponível e mostra o desenho da jogada.', 'De cima dá para ver a posição de todos no lance.'] }),
  Q('c5', 'CAMERAS', 'Dá para dar zoom no ponto de contato?', ['zoom', 'ampliar', 'contato', 'aproximar'], {
    any: ['Dá, sim. Use o marcador de contato no monitor.', 'O zoom está disponível. O marcador de contato destaca o ponto exato.', 'Podemos ampliar. No monitor, ative o marcador de contato.'] }),
  Q('c6', 'CAMERAS', 'Alguma câmera ficou sem visão?', ['sem visão', 'bloqueada', 'tampada', 'obstruída'], {
    any: ['Uma câmera pegou o lance de longe, mas as outras compensam.', 'Todas pegaram. Só uma ficou parcialmente tampada por um jogador.', 'Nenhuma ficou sem visão. Temos o lance completo.'] }),
  Q('c7', 'CAMERAS', 'Tem imagem dos pés dos jogadores?', ['pés', 'pe', 'pisada', 'travas'], {
    only: FOUL, any: ['Sim, a câmera de perto pega os pés muito bem.', 'Temos imagem dos pés em boa resolução, sem obstrução.', 'Os pés aparecem na câmera de perto e na lateral.'] }),

  // ---------- CONTATO ----------
  Q('t1', 'CONTATO', 'Houve contato?', ['contato', 'tocou', 'encostou', 'toque'], {
    only: FOUL, yes: ['Sim, houve contato. Dá para ver na câmera de perto.', 'Contato confirmado. O defensor atinge o atacante.'], no: ['Não vemos contato relevante. O atacante cai antes ou sem ser tocado.', 'Contato mínimo, quase nada. Vale revisar com calma.'] }),
  Q('t2', 'CONTATO', 'Qual a intensidade do choque?', ['intensidade', 'choque', 'força', 'forte'], {
    only: FOUL, yes: ['A intensidade é considerável. A telemetria mostra impacto forte.', 'Impacto acima do normal. Dá para ver o atacante perder o equilíbrio.'], no: ['Impacto leve, dentro do esperado numa disputa.', 'Intensidade baixa. A telemetria mostra pouca força.'] }),
  Q('t3', 'CONTATO', 'Onde foi o contato no corpo?', ['onde', 'corpo', 'perna', 'tornozelo', 'canela'], {
    only: FOUL, yes: ['Na perna do atacante, na altura da canela.', 'No tornozelo, pelo que a câmera de perto mostra.'], no: ['Quase só na bola. O toque no jogador é mínimo.', 'Pegou de raspão na perna, sem força.'] }),
  Q('t4', 'CONTATO', 'O defensor chegou na bola primeiro?', ['bola', 'primeiro', 'chegou', 'jogou'], {
    only: FOUL, yes: ['Não, o contato no jogador vem antes da bola.', 'A bola só é tocada depois do contato no atacante.'], no: ['Sim, ele toca na bola primeiro. O contato vem depois.', 'A bola é jogada antes. O contato é consequência da disputa.'] }),
  Q('t5', 'CONTATO', 'Havia pé de apoio no chão?', ['apoio', 'pé de apoio', 'equilíbrio', 'chão'], {
    only: FOUL, any: ['O pé de apoio do atacante estava no chão no momento do contato.', 'O atacante tinha o pé de apoio firme. O contato o desequilibrou.', 'Sim, o apoio estava no gramado. Dá para ver na lateral.'] }),
  Q('t6', 'CONTATO', 'Parece simulação do atacante?', ['simulação', 'simulou', 'cavou', 'fingiu', 'mergulho'], {
    only: FOUL, byVariant: { DIVE: ['Sim, parece simulação: a queda vem antes de qualquer contato.', 'Muito provável simulação. Quase nenhum contato e queda exagerada.'] }, yes: ['Não parece. A queda combina com a força do contato.', 'Pelas imagens, o atacante foi realmente atingido.'], no: ['Há dúvida: a queda parece exagerada para o contato.', 'O atacante cai com pouco contato. Vale olhar de perto.'] }),
  Q('t7', 'CONTATO', 'A entrada foi com as travas à mostra?', ['travas', 'sola', 'chuteira', 'à mostra'], {
    only: ['FORCA_EXCESSIVA'], yes: ['Sim, as travas ficam à mostra e na altura da canela.', 'Travas expostas, pelo que a câmera de perto mostra.'], no: ['Não, ele entra de lado, sem expor as travas.', 'A entrada é com a parte de dentro do pé. Sem travas.'] }),
  Q('t8', 'CONTATO', 'Qual a velocidade da entrada?', ['velocidade', 'rápida', 'entrada', 'carrinho'], {
    only: ['FORCA_EXCESSIVA'], yes: ['A entrada é rápida e com bastante força.', 'Velocidade alta. O defensor vem lançado.'], no: ['Entrada em velocidade normal, sem exagero.', 'A velocidade é baixa. Disputa comum.'] }),
  Q('t9', 'CONTATO', 'Houve empurrão ou puxão?', ['empurrão', 'empurrou', 'puxão', 'puxou', 'segurou', 'camisa'], {
    only: ['PENALTI_DISPUTA'], byVariant: {
      PUSH: ['Sim, há um empurrão nas costas. Dá para ver na lateral.', 'Empurrão visível, o atacante perde o equilíbrio.'],
      HOLD: ['Sim, o defensor segura a camisa por alguns segundos.', 'Há puxão na camisa, visível na câmera de perto.'],
      LEGIT: ['Não, a disputa é de corpo, sem puxão nem empurrão.', 'Nada de empurrão ou puxão. Disputa limpa.'],
      DIVE: ['Não vemos empurrão nem puxão. O atacante cai sozinho.', 'Sem empurrão. A queda parece exagerada.'] },
    yes: ['Sim, há contato irregular com as mãos ou o corpo.', 'Existe um puxão ou empurrão que pode ser infração.'], no: ['Não vemos empurrão ou puxão.', 'A disputa é de corpo, sem uso irregular das mãos.'] }),
  Q('t10', 'CONTATO', 'A falta foi dentro da área?', ['área', 'dentro', 'linha', 'fora da área'], {
    only: ['PENALTI_DISPUTA', 'DOGSO_CHANCE_CLARA'], any: ['O contato acontece dentro da área, segundo a linha da câmera de cima.', 'Pela câmera de cima, o ponto de contato está dentro da área.', 'Dentro da área: a linha mostra que o contato é depois da marca.'] }),

  // ---------- CARTÃO ----------
  Q('k1', 'CARTAO', 'Para você, o lance é de amarelo?', ['amarelo', 'cartão amarelo', 'advertência'], {
    only: CARD, byVariant: { DIVE: ['Para o atacante, sim: pode ser amarelo por simulação.', 'O cartão seria para quem simulou, não para o defensor.'] }, yes: ['Tecnicamente, há infração imprudente. Cabe amarelo, no mínimo.', 'A intensidade combina com cartão amarelo.'], no: ['Não vemos motivo para cartão neste lance.', 'Não parece cartão. No máximo, uma falta.'] }),
  Q('k2', 'CARTAO', 'Pode ser vermelho?', ['vermelho', 'expulsão', 'expulsar', 'cartão vermelho'], {
    only: CARD, yes: ['Pode ser. Veja a força, as travas e se havia chance clara de gol.', 'Há elementos de jogo brusco ou de chance clara. Confira no monitor.'], no: ['Não vemos elementos para vermelho.', 'Pelo que vemos, vermelho seria exagero.'] }),
  Q('k3', 'CARTAO', 'Era chance clara de gol?', ['chance', 'clara', 'gol', 'dogso'], {
    only: ['DOGSO_CHANCE_CLARA', 'PENALTI_DISPUTA'], yes: ['Sim, o atacante ia sozinho em direção ao gol.', 'Era chance clara: a bola estava dominada e o gol à frente.'], no: ['Não era chance clara. Havia cobertura e o ângulo era ruim.', 'Chance razoável, mas não clara. Tinha defensores por perto.'] }),
  Q('k4', 'CARTAO', 'Havia outro defensor na cobertura?', ['cobertura', 'defensor', 'zagueiro', 'recuperar'], {
    only: ['DOGSO_CHANCE_CLARA'], yes: ['Havia, um defensor estava perto e poderia recuperar.', 'Sim, tinha cobertura na jogada.'], no: ['Não, o atacante estava livre. Só o goleiro à frente.', 'Nenhum defensor próximo. A jogada ficou sem cobertura.'] }),
  Q('k5', 'CARTAO', 'O jogador ia em direção ao gol?', ['direção', 'direcao', 'rumo', 'trajetória'], {
    only: ['DOGSO_CHANCE_CLARA'], any: ['Sim, o atacante conduzia a bola direto ao gol.', 'A trajetória era em direção ao gol, sem desvio.', 'Ia para o gol, em linha reta.'] }),
  Q('k6', 'CARTAO', 'A distância até o gol era pequena?', ['distância', 'distancia', 'longe', 'perto do gol'], {
    only: ['DOGSO_CHANCE_CLARA'], any: ['Estava a uns 20 metros do gol.', 'Distância curta: dava para finalizar em seguida.', 'Perto da área, com caminho aberto.'] }),
  Q('k7', 'CARTAO', 'A falta foi imprudente ou temerária?', ['imprudente', 'temerária', 'temeraria', 'brusco', 'violento'], {
    only: ['FORCA_EXCESSIVA'], yes: ['Foi além do normal: força desproporcional, risco para o rival.', 'Intensidade alta e sem controle. Pode ser vista como temerária.'], no: ['Foi uma disputa dura, mas com controle.', 'Imprudência leve. Sem risco sério ao rival.'] }),

  // ---------- MÃO NA BOLA ----------
  Q('m1', 'MAO', 'O braço estava em posição natural?', ['natural', 'posição', 'braço', 'junto ao corpo'], {
    only: HAND, yes: ['Não, o braço estava afastado do corpo.', 'Posição pouco natural, o braço ocupa mais espaço.'], no: ['Sim, o braço estava junto ao corpo.', 'Posição natural para o movimento do jogador.'] }),
  Q('m2', 'MAO', 'O braço estava acima do ombro?', ['acima', 'ombro', 'levantado', 'alto'], {
    only: HAND, yes: ['O braço estava alto, perto da linha do ombro ou acima.', 'Sim, bem elevado. A câmera de frente mostra isso.'], no: ['Não, o braço estava abaixo do ombro.', 'Abaixo do ombro, sem elevar.'] }),
  Q('m3', 'MAO', 'A mão foi na bola ou a bola na mão?', ['mão foi', 'bola na mão', 'intencional', 'proposital', 'intencionalmente'], {
    only: HAND, yes: ['O braço vai na direção da bola. Parece movimento ativo.', 'O jogador abre o braço em direção à bola.'], no: ['A bola vem na mão. O jogador não tem tempo de tirar.', 'Sem movimento do braço em direção à bola. Foi a bola que bateu.'] }),
  Q('m4', 'MAO', 'Qual a distância do chute até a mão?', ['distância', 'chute', 'perto', 'longe'], {
    only: HAND, byVariant: { CURTA: ['Muito perto: menos de 3 metros. Quase sem tempo de reação.', 'Distância curta, cerca de 2 metros.'] }, any: ['Entre 8 e 14 metros: tempo de reação suficiente.', 'A bola vem de média distância, mais de 8 metros.', 'Distância suficiente para ele se proteger.'] }),
  Q('m5', 'MAO', 'A bola desviou em outra parte do corpo antes?', ['desviou', 'desvio', 'antes', 'rebote', 'coxa'], {
    only: HAND, byVariant: { DESVIO: ['Sim, a bola bate na coxa antes de chegar à mão.', 'Há desvio no corpo do próprio jogador antes do toque de mão.'] }, any: ['Não, a bola vai direto ao braço.', 'Sem desvio: o toque na mão é o primeiro.', 'Direto na mão, sem tocar em outra parte antes.'] }),
  Q('m6', 'MAO', 'O jogador aumentou o tamanho do corpo?', ['aumentou', 'ampliou', 'volume', 'corpo'], {
    only: HAND, yes: ['Sim, o braço aberto amplia bastante o corpo.', 'O braço afastado aumenta a área de bloqueio.'], no: ['Não, o corpo não foi ampliado.', 'Sem ampliar o corpo. O braço fica junto.'] }),
  Q('m7', 'MAO', 'Houve mão do atacante antes do gol?', ['gol', 'atacante', 'antes', 'mão do atacante'], {
    only: ['GOL_POLÊMICO'], yes: ['Sim, o atacante usa a mão antes do gol. Ele controla a bola com o braço.', 'Há toque de mão do atacante na jogada do gol.'], no: ['Não vemos mão do atacante. O gol parece regular.', 'Jogada limpa até o gol, sem toque de mão.'] }),
  Q('m8', 'MAO', 'Qual o ângulo do braço?', ['ângulo', 'angulo', 'graus', 'medida'], {
    only: HAND, yes: ['O ângulo passa de 70 graus. Use a câmera de frente e veja a linha.', 'Bem afastado do corpo, algo entre 70 e 100 graus.'], no: ['O ângulo é pequeno, menos de 40 graus.', 'Braço próximo do corpo, ângulo baixo.'] }),

  // ---------- IMPEDIMENTO ----------
  Q('i1', 'IMPEDIMENTO', 'Qual a margem do impedimento?', ['margem', 'centímetros', 'cm', 'diferença'], {
    only: OFF, yes: ['O atacante está alguns centímetros à frente do defensor.', 'Margem pequena, mas contra o atacante. Confirme com as linhas.'], no: ['O atacante está alinhado ou atrás da linha. Margem a favor dele.', 'Pelas linhas, ele está em posição legal.'] }),
  Q('i2', 'IMPEDIMENTO', 'O momento do último toque foi identificado?', ['último toque', 'momento', 'passe', 'toque'], {
    only: OFF, any: ['Sim, o instante do passe está marcado. Ande quadro a quadro e fixe o frame.', 'Identificado. Use o marcador de último toque no monitor.', 'O passe está na linha do tempo. Marque o frame em que o pé toca a bola.'] }),
  Q('i3', 'IMPEDIMENTO', 'Qual parte do corpo está adiantada?', ['parte', 'corpo', 'pé', 'cabeça', 'ombro'], {
    only: OFF, yes: ['O pé da frente é a parte mais adiantada.', 'O ombro e o pé estão à frente da linha.'], no: ['Nenhuma parte passa a linha do defensor.', 'O pé fica atrás da linha. Sem vantagem do atacante.'] }),
  Q('i4', 'IMPEDIMENTO', 'Quem é o último defensor da linha?', ['último defensor', 'defensor', 'zagueiro', 'linha'], {
    only: OFF, any: ['O zagueiro mais recuado, sem contar o goleiro. A linha está desenhada.', 'O defensor da linha é o zagueiro do lado do lance.', 'A linha passa pelo último defensor, que está marcado em azul.'] }),
  Q('i5', 'IMPEDIMENTO', 'O atacante interferiu na jogada?', ['interferiu', 'interferência', 'participou', 'finalizou'], {
    only: OFF, yes: ['Sim, ele recebe a bola e finaliza. Está na jogada.', 'Ele participa diretamente: a bola vem para ele.'], no: ['Ele chega a participar, mas em posição legal.', 'Sim, mas sem estar à frente da linha no passe.'] }),
  Q('i6', 'IMPEDIMENTO', 'A bola desviou em algum defensor?', ['desviou', 'defensor', 'rebote', 'tocou'], {
    only: OFF, any: ['Não houve desvio, o passe foi limpo.', 'A bola não tocou em defensor. Foi passe direto.', 'Sem desvio: o passe vem do companheiro.'] }),
  Q('i7', 'IMPEDIMENTO', 'As linhas estão calibradas?', ['calibradas', 'linhas', 'calibração', 'sistema', 'tecnologia'], {
    only: OFF, any: ['Sim, calibradas antes do jogo. As câmeras da linha estão funcionando.', 'As linhas foram checadas hoje. Podem ser usadas.', 'Calibração confirmada. O sistema rastreia 29 pontos por jogador.'] }),
  Q('i8', 'IMPEDIMENTO', 'Dá para ver isso a olho nu?', ['olho', 'nu', 'visível', 'claro'], {
    only: OFF, any: ['Não, a diferença é pequena. Só as linhas mostram bem.', 'Muito apertado para o olho. Confie nas linhas.', 'A olho nu é difícil. Use a tecnologia.'] })
];

// Perguntas aplicáveis ao lance
export function questionsFor(inc: Incident): RadioQuestion[] {
  const seen = new Set<string>();
  return RADIO_QUESTIONS.filter(q => {
    if (q.only && !q.only.includes(inc.category)) return false;
    const k = q.cat + q.send;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const OPEN: Record<string, string[]> = {
  default: ['Árbitro, estamos revisando o lance dos {min}\' ({titulo}), na região {zona}. As imagens estão na tela.', 'Cabine do VAR na escuta. Revisando "{titulo}" ({min}\'). Pergunte o que precisar.', 'Copiado, árbitro. Estamos com "{titulo}" na tela. Em que podemos ajudar?'],
  IMPEDIMENTO_3D: ['Árbitro, estamos checando a posição do atacante aos {min}\'. As linhas 3D estão sendo montadas.', 'VAR na escuta. Verificando o impedimento ({titulo}). As câmeras da linha estão prontas.'],
  MAO_VOLUMETRIA: ['Árbitro, checando possível toque de mão aos {min}\'. Já temos a câmera de frente do braço.', 'VAR na escuta. Analisando a posição do braço em "{titulo}".'],
  GOL_POLÊMICO: ['Árbitro, vamos conferir a jogada do gol antes de validar. Revisando "{titulo}".', 'VAR na escuta. Checando a jogada do gol desde o começo, árbitro.'],
  PENALTI_DISPUTA: ['Árbitro, analisando possível pênalti aos {min}\'. Já temos o contato na câmera de perto.', 'VAR na escuta. Revisando o contato dentro da área em "{titulo}".'],
  FORCA_EXCESSIVA: ['Árbitro, revisando a entrada aos {min}\'. Câmera de perto pronta para ver a intensidade.', 'VAR na escuta. Checando a força da entrada em "{titulo}".'],
  DOGSO_CHANCE_CLARA: ['Árbitro, checando se era chance clara de gol aos {min}\'. Já temos a visão de cima.', 'VAR na escuta. Revisando a interrupção da chance em "{titulo}".']
};
const PREFIX = ['Copiado. ', 'Entendido. ', 'Positivo, árbitro. ', 'Um momento... ', ''];
const VAGUE = ['Está muito apertado para afirmar pelo rádio. Só o monitor mostra com certeza.', 'Difícil dizer daqui, árbitro. Recomendamos conferir no monitor.', 'A imagem ainda não é conclusiva. Veja você mesmo, quadro a quadro.'];
export const NOT_UNDERSTOOD = ['Não entendi bem a pergunta, árbitro. Escolha uma das opções sugeridas.', 'Repita, por favor. Use uma das perguntas da lista, assim respondo mais rápido.'];

const fill = (t: string, inc: Incident) => t.replace(/\{min\}/g, String(inc.minute)).replace(/\{zona\}/g, inc.pitchZone.name).replace(/\{titulo\}/g, inc.title);
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

export const radioOpening = (inc: Incident): string => fill(pick(Math.random() < 0.6 && OPEN[inc.category] ? OPEN[inc.category] : OPEN.default), inc);

export function radioAnswer(q: RadioQuestion, inc: Incident): string {
  const rec = inc.recommendedVarDecision;
  const base = rec !== 'PLAY_ON' && rec !== 'GOAL_VALID';
  const card = rec.includes('YELLOW') || rec.includes('RED');
  const red = rec.includes('RED');
  const infraction = inc.variant === 'DIVE' ? false : q.id === 'k1' || q.id === 'k7' ? card : q.id === 'k2' ? red : q.id === 'k3' ? (red || (inc.category === 'DOGSO_CHANCE_CLARA' && base)) : base;
  const truthy = !!(q.yes || q.no) && !q.any;
  const byV = inc.variant ? q.byVariant?.[inc.variant] : undefined;
  let lines = byV ?? (infraction ? q.yes : q.no) ?? q.any ?? [];
  if (lines.length === 0) lines = q.any ?? q.yes ?? q.no ?? VAGUE;
  const useVague = truthy && !byV && Math.random() < 0.18;
  return pick(PREFIX) + fill(pick(useVague ? VAGUE : lines), inc);
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
// Procura a pergunta mais parecida com o que foi digitado
export function matchQuestion(text: string, list: RadioQuestion[]): RadioQuestion | null {
  const t = norm(text);
  if (t.trim().length < 3) return null;
  let best: RadioQuestion | null = null;
  let score = 0;
  for (const q of list) {
    let sc = 0;
    for (const k of q.keys) if (t.includes(norm(k))) sc += norm(k).length > 4 ? 2 : 1;
    for (const w of norm(q.send).split(/\W+/)) if (w.length > 4 && t.includes(w)) sc += 1;
    if (sc > score) { score = sc; best = q; }
  }
  return score >= 2 ? best : null;
}
