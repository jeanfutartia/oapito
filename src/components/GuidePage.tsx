import { useState } from 'react';
import { GLOSSARY } from '../store/careerLogic';

export const Logo = ({ size = 40, className = '' }: { size?: number; className?: string }) => (
  <img src="/logo.jpg" alt="O Apito" width={size} height={size} className={'rounded-lg object-cover ' + className} draggable={false} />
);

type Block = { icon: string; title: string; text: React.ReactNode };
type Section = { id: string; label: string; icon: string; intro: string; blocks: Block[] };

const SECTIONS: Section[] = [
  {
    id: 'comecar', label: 'Começar', icon: '🚀',
    intro: 'Em 1 minuto você entende o jogo.',
    blocks: [
      { icon: '🎯', title: 'Seu objetivo', text: 'Apite 6 jogos por temporada. A média das notas decide: acima de 9,0 você sobe de divisão; abaixo de 7,0 você desce. Cada erro, tumulto ou conduta ruim derruba a nota.' },
      { icon: '1️⃣', title: 'Passo 1 · Escolha a postura', text: 'Antes do jogo, escolha como você apita: Dialogador (conversa muito), Preventivo, Disciplinador ou Rigoroso (cartão fácil). Cada postura muda quantos protestos e cartões você terá.' },
      { icon: '2️⃣', title: 'Passo 2 · Conduza a partida', text: 'O jogo corre sozinho. Use a velocidade, o apito forte e os botões de cartão. Quando aparecer um lance decisivo, o jogo pausa e você decide.' },
      { icon: '3️⃣', title: 'Passo 3 · Decida com calma', text: 'No lance do VAR, veja as câmeras, escolha a decisão e confirme. O jogo só volta quando você terminar de ler.' },
      { icon: '4️⃣', title: 'Passo 4 · Veja a súmula', text: 'No fim, você recebe a nota, a súmula, os melhores momentos em 3D, a repercussão na mídia e o prêmio em dinheiro.' },
    ],
  },
  {
    id: 'partida', label: 'Na partida', icon: '⚽',
    intro: 'O que acontece em campo e o que você controla.',
    blocks: [
      { icon: '🌡️', title: 'Termômetro de pressão', text: 'Fica acima do campo e mostra a temperatura do jogo: Calmo (até 40%), Atenção (até 65%), Quente (até 80%) e Explosivo (acima disso, com risco de tumulto). A seta mostra se está subindo ou esfriando.' },
      { icon: '🔥', title: 'Pressão e apito forte', text: <>Faltas, cartões e gols aumentam a pressão. Acima de 80% pode estourar um <b>tumulto</b>. Use o <b>📢 apito forte</b> quando passar de 55% para esfriar o jogo (máximo 5 vezes, com intervalo de 6 minutos).</> },
      { icon: '🟨', title: 'Cartões', text: 'Amarelo para falta dura ou reclamação. Dois amarelos viram vermelho. O vermelho direto é raro e vem de lances graves. Quem já fez muitas faltas tem cartão mais provável.' },
      { icon: '⚽', title: 'Pênaltis', text: 'Depois de marcar, confira o goleiro e a área: mande o goleiro voltar à linha e afaste os jogadores antes de apitar a cobrança. Irregularidade custa nota.' },
      { icon: '👀', title: 'Jogadores com personalidade', text: 'Cada time tem 🎖️ capitão, 💢 jogo duro, 😏 provocador e 🎭 quem cai fácil. Veja o painel "Fique de olho" para saber quem merece atenção.' },
      { icon: '🗣️', title: 'Capitães e técnicos', text: 'Durante o jogo, capitães e técnicos vão falar com você. Explique com calma, advirta ou puna, conforme a gravidade.' },
    ],
  },
  {
    id: 'var', label: 'VAR', icon: '🖥️',
    intro: 'Como revisar os lances decisivos.',
    blocks: [
      { icon: '📍', title: 'Impedimento', text: <>São 3 passos: (1) ande quadro a quadro até o pé tocar a bola e clique em <b>📍 Marcar frame do passe</b>; (2) confira os pontos mais adiantados do atacante e do defensor e confirme; (3) clique em <b>📏 Traçar linhas</b> para ver a margem.</> },
      { icon: '🖐️', title: 'Mão na bola', text: 'Observe a posição do braço (aberto ou junto ao corpo) e a distância do chute. Braço aberto e chute perto pesam contra o jogador.' },
      { icon: '📻', title: 'Rádio do VAR', text: 'A cabine do VAR sugere uma decisão por rádio. Você pode ir ver o lance no monitor ou manter a sua decisão de campo. Confiar demais ou de menos tem consequência na nota.' },
      { icon: '🎥', title: 'Câmeras', text: 'Troque entre as câmeras (lateral, frontal, alta) para entender o lance antes de decidir.' },
    ],
  },
  {
    id: 'carreira', label: 'Carreira', icon: '🧑‍⚖️',
    intro: 'Do estadual à elite: como você evolui.',
    blocks: [
      { icon: '🏆', title: 'Divisões', text: 'Cada divisão tem 12 clubes. Você apita um jogo por rodada, com rodízio de equipes. Suba de divisão com boas notas.' },
      { icon: '🎯', title: 'Metas da temporada', text: 'Cada temporada traz 3 metas com prêmio em dinheiro e reputação.' },
      { icon: '😠', title: 'Relação com os clubes', text: 'Se você erra contra um clube, ele fica Desconfiado, Irritado ou Furioso. Nos próximos jogos o clima esquenta e a coletiva traz perguntas duras. Bons jogos acalmam os clubes aos poucos.' },
      { icon: '🏠', title: 'Onde você mora', text: 'Você escolhe a cidade onde mora ao criar o árbitro. A distância e o custo de cada viagem saem da sua cidade até o estádio: até cerca de 450 km vai de carro, acima disso de avião. Na aba Carreira dá para se mudar (R$ 500, uma vez por temporada).' },
      { icon: '✈️', title: 'Escalas e viagens', text: 'Jogos grandes pagam mais. Viagens custam dinheiro, descontado do seu pagamento. Você pode recusar uma escala por temporada, perdendo reputação.' },
      { icon: '📰', title: 'Eventos e mídia', text: 'Entre os jogos surgem cursos, boatos e convites. Depois de cada partida, a mídia comenta o seu trabalho.' },
      { icon: '💾', title: 'Salvar carreira', text: 'Na aba Carreira você salva a carreira em um arquivo e carrega depois, para não perder o progresso.' },
    ],
  },
  {
    id: 'dificuldade', label: 'Dificuldade', icon: '🎚️',
    intro: 'Escolha o nível de ajuda.',
    blocks: [
      { icon: '🟢', title: 'Iniciante', text: 'Mostra dicas e explica cada lance. Esquenta menos e perdoa mais os erros. Ideal para aprender.' },
      { icon: '🟡', title: 'Normal', text: 'Explica quando você erra. Equilíbrio entre desafio e ajuda.' },
      { icon: '🔴', title: 'Especialista', text: 'Sem ajuda, esquenta mais e pune mais os erros. Para quem já domina o jogo.' },
    ],
  },
  {
    id: 'sobre', label: 'Sobre', icon: 'ℹ️',
    intro: 'O jogo, a ideia e o que vem por aí.',
    blocks: [
      { icon: '🎮', title: 'O que é O Apito', text: 'Um simulador de carreira de árbitro de futebol. Você vive a pressão do apito: decide lances, convive com jogadores, técnicos, VAR e imprensa, e constrói sua reputação.' },
      { icon: '🧠', title: 'Feito para ser realista', text: 'Cartões, faltas e pressão seguem uma lógica próxima da realidade. Nem todo jogo tem expulsão, e nem todo lance é fácil.' },
      { icon: '📱', title: 'Celular e computador', text: 'O jogo funciona no navegador do computador e do celular. O progresso fica salvo no seu aparelho.' },
      { icon: '⭐', title: 'Planos e novidades', text: 'Por enquanto, tudo é gratuito. No botão Planos você acompanha o que está por vir.' },
    ],
  },
];

export const GuidePage = () => {
  const [sec, setSec] = useState(SECTIONS[0].id);
  const [showGloss, setShowGloss] = useState(false);
  const cur = SECTIONS.find(s => s.id === sec) ?? SECTIONS[0];
  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-black">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(135deg, #facc15 0 2px, transparent 2px 18px)' }} />
        <div className="relative flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-6">
          <Logo size={150} className="shrink-0 shadow-2xl shadow-amber-500/20" />
          <div className="text-center sm:text-left">
            <h2 className="brand-font text-3xl sm:text-4xl text-white">GUIA DO <span className="text-amber-400">APITO</span></h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">Tudo para você começar bem: como jogar, o que significa cada coisa e como crescer na carreira.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSec(s.id)}
            className={'brand-font text-sm px-3 py-2 rounded-lg border whitespace-nowrap transition ' + (sec === s.id ? 'bg-amber-400 text-black border-amber-300' : 'bg-black text-slate-300 border-slate-700 hover:border-amber-400/60')}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div>
        <h3 className="brand-font text-xl text-amber-400">{cur.icon} {cur.label}</h3>
        <p className="text-xs text-slate-400 mb-3">{cur.intro}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cur.blocks.map(b => (
            <div key={b.title} className="bg-black border border-slate-800 border-l-4 border-l-amber-400 rounded-xl p-3">
              <b className="brand-font text-base text-white">{b.icon} {b.title}</b>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">{b.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black border border-slate-800 rounded-xl p-3">
        <button onClick={() => setShowGloss(v => !v)} className="brand-font text-base text-white w-full text-left flex justify-between">
          <span>📖 Glossário rápido</span><span className="text-amber-400">{showGloss ? '▲' : '▼'}</span>
        </button>
        {showGloss && (
          <dl className="mt-2 flex flex-col gap-1.5 text-xs">
            {GLOSSARY.map(([term, def]) => (
              <div key={term}><dt className="inline font-bold text-amber-300">{term}: </dt><dd className="inline text-slate-300">{def}</dd></div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
};
