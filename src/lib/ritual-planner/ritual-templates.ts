/**
 * Ritual Templates
 *
 * Pre-defined ritual templates for Cabala dos Caminhos practice.
 */

export interface RitualTemplate {
  id: string;
  name: string;
  description: string;
  category: 'protection' | 'prosperity' | 'love' | 'healing' | 'clarity' | 'transformation' | 'manifestation' | 'release';
  duration: number; // minutes
  moonPhase?: 'new' | 'waxing' | 'full' | 'waning';
  orixa?: string;
  steps: RitualStep[];
  materials?: string[];
  intentions: string[];
}

export interface RitualStep {
  order: number;
  title: string;
  description: string;
  duration: number; // minutes
  action: 'meditation' | 'prayer' | 'candle_lighting' | 'smudge' | 'water' | 'crystal' | 'affirmation' | 'breathing' | 'journaling' | 'symbol';
}

const templates: RitualTemplate[] = [
  {
    id: 'dawn-protection',
    name: 'Proteção ao Amanhecer',
    description: 'Ritual de proteção para iniciar o dia com segurança e clareza mental.',
    category: 'protection',
    duration: 30,
    moonPhase: 'new',
    orixa: 'Oxum',
    steps: [
      { order: 1, title: 'Purificação', description: 'Acenda incenso de alecrim e permita que a fumaça purifique seu espaço.', duration: 5, action: 'smudge' },
      { order: 2, title: 'Meditação de Centelhamento', description: 'Sente-se em silêncio e visualize uma luz dourada envolvendo seu corpo.', duration: 10, action: 'meditation' },
      { order: 3, title: 'Afirmação de Proteção', description: 'Repita: "Sou protegido(a) por forças luminosas que guiam meus passos."', duration: 5, action: 'affirmation' },
      { order: 4, title: 'Encerramento', description: 'Agradeça aos guias espirituais e permita que a energia do ritual se assente.', duration: 10, action: 'breathing' },
    ],
    materials: ['incenso de alecrim', 'vela dourada', 'cristal de quartzo'],
    intentions: ['proteção', 'clareza', 'força interior'],
  },
  {
    id: 'full-moon-prosperity',
    name: 'Lua Cheia de Abundância',
    description: 'Ritual de manifestação de prosperidade alinhado com a energia da lua cheia.',
    category: 'prosperity',
    duration: 45,
    moonPhase: 'full',
    orixa: 'Oxum',
    steps: [
      { order: 1, title: 'Preparação', description: 'Organize seu espaço com uma vela dourada, água fluente e pedras de conhecimento.', duration: 5, action: 'smudge' },
      { order: 2, title: 'Conexão Lunar', description: 'Sente-se diante da lua (ou imagem) e visualize a luz prateada entrando em você.', duration: 10, action: 'meditation' },
      { order: 3, title: 'Ritual da Água', description: 'Coloque suas mãos na água enquanto declara suas intenções de prosperidade.', duration: 10, action: 'water' },
      { order: 4, title: 'Carregamento de Cristal', description: 'Segure o cristal dizendo: "Esta pedra carrega a essência da abundância que flui para mim."', duration: 10, action: 'crystal' },
      { order: 5, title: 'Agradecimento', description: 'Agradeça a Oxum pela abundância que está a caminho.', duration: 10, action: 'affirmation' },
    ],
    materials: ['vela dourada', 'quartzo transparente', 'bacia com água', 'incenso de lavanda'],
    intentions: ['abundância', 'prosperidade', 'fluxo financeiro', 'oportunidades'],
  },
  {
    id: 'waxing-love',
    name: 'Amor que Manifesta',
    description: 'Ritual para abrir o coração ao amor próprio e às conexões sagradas.',
    category: 'love',
    duration: 40,
    moonPhase: 'waxing',
    orixa: 'Iemanjá',
    steps: [
      { order: 1, title: 'Purificação', description: 'Queime sálvia branca enquanto visualiza sua aura sendo limpa.', duration: 5, action: 'smudge' },
      { order: 2, title: 'Ritual das Águas', description: 'Mergulhe os pés em água salgada enquanto faz respirações profundas.', duration: 10, action: 'water' },
      { order: 3, title: 'Meditação do Coração', description: 'Coloque uma pedra rosa sobre o coração e visualize uma luz cor-de-rosa emanando.', duration: 15, action: 'meditation' },
      { order: 4, title: 'Pedido Sagrado', description: 'Escreva no papel o amor que deseja manifestar, depois queime com segurança.', duration: 10, action: 'journaling' },
    ],
    materials: ['sálvia branca', 'pedra rosa', 'sal marinho', 'papel e caneta', 'bacia'],
    intentions: ['amor próprio', 'amor romântico', 'harmonia emocional', 'cura do coração'],
  },
  {
    id: 'new-moon-transformation',
    name: 'Renascimento na Lua Nova',
    description: 'Ritual de renovação e start limpo para novos começos.',
    category: 'transformation',
    duration: 35,
    moonPhase: 'new',
    orixa: 'Ogum',
    steps: [
      { order: 1, title: 'Libertação', description: 'Escreva em papel o que deseja abandonar e queime simbolicamente.', duration: 8, action: 'journaling' },
      { order: 2, title: 'Corte de Laços', description: 'Com uma faca ritual, corte um fio vermelho simbolizando a libertação do karma.', duration: 5, action: 'symbol' },
      { order: 3, title: 'Respiração Renovadora', description: 'Pratique 21 respirações profundas, visualizando ar fresco preenchendo seu ser.', duration: 7, action: 'breathing' },
      { order: 4, title: 'Invocação de Ogum', description: 'Ore a Ogum pedindo coragem para o novo caminho.', duration: 10, action: 'prayer' },
      { order: 5, title: 'Compromisso', description: 'Escreva 3 ações que tomará na próxima lua nova.', duration: 5, action: 'journaling' },
    ],
    materials: ['papel e caneta', 'fio vermelho', 'vela vermelha', 'fósforo', 'faca ritual'],
    intentions: ['renovação', 'coragem', 'novos começos', 'libertação'],
  },
  {
    id: 'healing-earth',
    name: 'Cura da Terra Mãe',
    description: 'Ritual de cura energética utilizando a conexão com a terra.',
    category: 'healing',
    duration: 50,
    moonPhase: 'full',
    orixa: 'Oxum',
    steps: [
      { order: 1, title: 'Aterramento', description: 'Sente-se descalço(a) na terra ou use terra em vasinho, sentindo a conexão.', duration: 10, action: 'meditation' },
      { order: 2, title: 'Ritual da Terra', description: 'Segure terra na mão esquerda enquanto visualiza energias densas saindo de você.', duration: 10, action: 'water' },
      { order: 3, title: 'Banho de Cura', description: 'Se possível, tome banho de ervas (arruda, guiné) visualizando cura profunda.', duration: 15, action: 'water' },
      { order: 4, title: 'Oração de Cura', description: 'Repita: "Meu corpo é templo sagrado, minha energia é pura e curada."', duration: 5, action: 'affirmation' },
      { order: 5, title: 'Integração', description: 'Descanse em silêncio por 10 minutos absorvendo a cura recebida.', duration: 10, action: 'breathing' },
    ],
    materials: ['terra (vasinho)', 'ervas de cura (arruda, guiné)', 'vela verde', 'água filtrada'],
    intentions: ['cura física', 'cura emocional', 'renovação celular', 'limpeza energética'],
  },
  {
    id: 'clarity-meditation',
    name: 'Clareza Mental',
    description: 'Prática para limpar a mente e obter insights espirituais.',
    category: 'clarity',
    duration: 25,
    moonPhase: 'new',
    orixa: 'Oxalá',
    steps: [
      { order: 1, title: 'Preparação', description: 'Sente-se confortavelmente com coluna reta, acenda vela branca.', duration: 3, action: 'candle_lighting' },
      { order: 2, title: 'Respiração Sagrada', description: 'Pratique 3 rodadas de respiração 4-7-8.', duration: 5, action: 'breathing' },
      { order: 3, title: 'Visualização de Clareza', description: 'Imagine uma névoa cinza (pensamentos) se dissipando, revelando um céu azul.', duration: 10, action: 'meditation' },
      { order: 4, title: 'Mantra de Oxalá', description: 'Repita silenciosamente: "Oxalá, dá-me a sabedoria do silêncio."', duration: 5, action: 'prayer' },
      { order: 5, title: 'Registro', description: 'Anote insights ou sensações que surgiram.', duration: 2, action: 'journaling' },
    ],
    materials: ['vela branca', 'caderno', 'caneta'],
    intentions: ['clareza mental', 'discernimento', 'sabedoria', 'foco'],
  },
  {
    id: 'release-fullmoon',
    name: 'Solução de Culpa',
    description: 'Ritual para soltar mágoas, culpas e padrões que não servem mais.',
    category: 'release',
    duration: 40,
    moonPhase: 'full',
    orixa: 'Iemanjá',
    steps: [
      { order: 1, title: 'Preparação', description: 'Escreva uma lista de ressentimentos, mágoas e culpas que carrega.', duration: 8, action: 'journaling' },
      { order: 2, title: 'Ritual da Água', description: 'Mergulhe o papel na água salgada enquanto diz: "Libero com amor."', duration: 10, action: 'water' },
      { order: 3, title: 'Queima Simbólica', description: 'Com segurança, queime o papel sobre a chama da vela, visualizando a libertação.', duration: 5, action: 'candle_lighting' },
      { order: 4, title: 'Lágrimas de Iemanjá', description: 'Com as mãos na água, permita que as emoções fluam. Tudo é sagrado.', duration: 12, action: 'water' },
      { order: 5, title: 'Novos Passos', description: 'Escreva uma afirmação: "Eu me perdoo e escolho a paz."', duration: 5, action: 'affirmation' },
    ],
    materials: ['papel', 'caneta', 'bacia com água', 'sal marinho', 'vela branca', 'fósforo'],
    intentions: ['perdão', 'libertação emocional', 'cura de traumas', 'paz interior'],
  },
  {
    id: 'manifestation-waxing',
    name: 'Manifestação de Intenções',
    description: 'Ritual poderoso para manifestar seus desejos mais verdadeiros.',
    category: 'manifestation',
    duration: 45,
    moonPhase: 'waxing',
    orixa: 'Oxum',
    steps: [
      { order: 1, title: 'Alinhamento', description: 'Desenhe o símbolo da Árvore da Vida na terra ou papel, conectando-se com a energia criadora.', duration: 8, action: 'symbol' },
      { order: 2, title: 'Ritual do Mel', description: 'Unte as mãos com mel enquanto declara: "Doce é a vida que eu manifesto."', duration: 5, action: 'prayer' },
      { order: 3, title: 'Visualização Criativa', description: 'Feche os olhos e viva mentalmente o momento da realização do seu desejo.', duration: 15, action: 'meditation' },
      { order: 4, title: 'Carregamento da Vela', description: 'Olhe para a vela dourada e sinta sua intenção sendo queimada na chama, magnetizando o universo.', duration: 10, action: 'candle_lighting' },
      { order: 5, title: 'Ação Terrena', description: 'Escreva 3 ações concretas que você tomará nos próximos 7 dias.', duration: 7, action: 'journaling' },
    ],
    materials: ['papel e caneta', 'vela dourada', 'mel', 'incenso de ylang-ylang', 'quartzo citrino'],
    intentions: ['manifestação', 'realização', 'propósito', 'dedicação'],
  },
];

/**
 * Get all available ritual templates.
 */
export function getTemplates(): RitualTemplate[] {
  return [...templates];
}

/**
 * Get a template by ID.
 */
export function getTemplateById(id: string): RitualTemplate | undefined {
  return templates.find((t) => t.id === id);
}

/**
 * Get templates by category.
 */
export function getTemplatesByCategory(category: RitualTemplate['category']): RitualTemplate[] {
  return templates.filter((t) => t.category === category);
}

/**
 * Get templates by moon phase.
 */
export function getTemplatesByMoonPhase(moonPhase: RitualTemplate['moonPhase']): RitualTemplate[] {
  return templates.filter((t) => t.moonPhase === moonPhase);
}

/**
 * Get templates by Orixá.
 */
export function getTemplatesByOrixa(orixa: string): RitualTemplate[] {
  return templates.filter((t) => t.orixa?.toLowerCase() === orixa.toLowerCase());
}
