// Estrutura preparada para uma possível venda futura de funcionalidades.
// IMPORTANTE: por enquanto NADA é cobrado. Todas as funções que já existem estão liberadas.
export const BILLING_ENABLED = false;

export type PlanId = 'FREE' | 'PRO' | 'ELITE';
export type FeatureStatus = 'DISPONIVEL' | 'EM_BREVE';

export interface Feature { id: string; icon: string; name: string; description: string; plan: PlanId; status: FeatureStatus }
export interface Plan { id: PlanId; name: string; tagline: string; price: string; highlight?: boolean }

export const PLANS: Plan[] = [
  { id: 'FREE', name: 'Básico', tagline: 'Tudo para começar a apitar', price: 'Grátis' },
  { id: 'PRO', name: 'Pro', tagline: 'Para quem quer ir mais fundo', price: 'Em breve', highlight: true },
  { id: 'ELITE', name: 'Elite', tagline: 'Para quem quer jogar com amigos e ir além', price: 'Em breve' }
];

export const FEATURES: Feature[] = [
  { id: 'career', icon: '🏆', name: 'Carreira, calendário e tabela', description: 'Temporadas de 6 jogos com promoção e queda.', plan: 'FREE', status: 'DISPONIVEL' },
  { id: 'match', icon: '⚽', name: 'Partidas com lances e decisões', description: 'Pênaltis, faltas, cartões e conversas com capitães e técnicos.', plan: 'FREE', status: 'DISPONIVEL' },
  { id: 'replay3d', icon: '🎥', name: 'Replay 3D com 5 câmeras', description: 'Revise impedimentos, mãos na bola e faltas por vários ângulos.', plan: 'PRO', status: 'DISPONIVEL' },
  { id: 'report-pdf', icon: '📄', name: 'Súmula para imprimir ou salvar em PDF', description: 'Relatório completo de cada partida.', plan: 'PRO', status: 'DISPONIVEL' },
  { id: 'observer', icon: '🧑‍⚖️', name: 'Avaliação detalhada do observador', description: 'Notas por critério e parecer sobre sua atuação.', plan: 'PRO', status: 'DISPONIVEL' },
  { id: 'radio', icon: '📻', name: 'Rádio do VAR, notícias e debate na TV', description: 'Centenas de textos próprios que mudam a cada jogo, sem precisar de internet.', plan: 'FREE', status: 'DISPONIVEL' },
  { id: 'highlights', icon: '⭐', name: 'Melhores momentos em 3D', description: 'Reveja gols e lances do VAR depois do jogo.', plan: 'PRO', status: 'DISPONIVEL' },
  { id: 'rivalry', icon: '😠', name: 'Relação com clubes e reações das redes', description: 'Decisões têm consequências nos próximos jogos.', plan: 'PRO', status: 'DISPONIVEL' },
  { id: 'savefile', icon: '💾', name: 'Salvar carreira em arquivo', description: 'Leve seu progresso para outro aparelho.', plan: 'FREE', status: 'DISPONIVEL' },
  { id: 'stats', icon: '📊', name: 'Estatísticas avançadas da carreira', description: 'Gráficos de evolução, comparação entre temporadas e mais.', plan: 'PRO', status: 'EM_BREVE' },
  { id: 'world', icon: '🌍', name: 'Copas e competições internacionais', description: 'Mata-mata, Libertadores e Copa do Mundo.', plan: 'ELITE', status: 'EM_BREVE' },
  { id: 'friends', icon: '👥', name: 'Ranking online e desafios entre amigos', description: 'Compare sua nota com a de outros árbitros.', plan: 'ELITE', status: 'EM_BREVE' },
  { id: 'cosmetics', icon: '🎽', name: 'Uniformes e temas exclusivos', description: 'Personalize seu árbitro e as cores do jogo.', plan: 'ELITE', status: 'EM_BREVE' },
  { id: 'custom', icon: '🛠️', name: 'Crie seu próprio campeonato', description: 'Escolha clubes, regras e número de rodadas.', plan: 'ELITE', status: 'EM_BREVE' }
];

/** Hoje todas as funções existentes estão liberadas (acesso antecipado). */
export const hasFeature = (_id: string): boolean => true;
