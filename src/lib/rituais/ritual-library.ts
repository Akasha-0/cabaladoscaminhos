// Auto-generated — skip linting and formatting

// Extended RitualCategory type with Orixá-specific categories
export type ExtendedRitualCategory =
  | "protection"
  | "prosperity"
  | "love"
  | "healing"
  | "clarity"
  | "transformation"
  | "manifestation"
  | "release"
  | "communication"
  | "hunting"
  | "war"
  | "ancestral"
  | "life"
  | "innocence"
  | "wisdom";

export interface RitualStep {
  ordem: number;
  titulo: string;
  descricao: string;
  duracaoMinutos?: number;
}

export interface Ritual {
  id: string;
  nome: string;
  categoria: ExtendedRitualCategory;
  proposito: string;
  passos: RitualStep[];
  elementos: string[];
  cuidados: string[];
  horarios: string[];
  faseLua?: 'new' | 'waxing' | 'full' | 'waning';
  orixa?: string;
  duracaoMinutos?: number;
  materiais?: string[];
  intencoes: string[];
}

/**
 * Get all available rituals
 */
export function getRituals(): Ritual[] {
  return [
    {
      id: 'abertura-caminho',
      nome: 'Abertura de Caminho',
      categoria: 'manifestation',
      proposito: 'Abrir novos caminhos e remover obstáculos',
      passos: [
        { ordem: 1, titulo: 'Preparação', descricao: 'Escolha um espaço limpo e silencioso', duracaoMinutos: 5 },
        { ordem: 2, titulo: 'Invocação', descricao: 'Faça uma prece aos Orixás pedindo abertura', duracaoMinutos: 10 },
        { ordem: 3, titulo: 'Oferenda', descricao: 'Ofereça fumo, velas e ervas sagradas', duracaoMinutos: 10 },
        { ordem: 4, titulo: 'Gratidão', descricao: 'Agradeça pelas bênçãos recebidas', duracaoMinutos: 5 },
      ],
      elementos: ['fumo', 'vela', 'agua', 'terra'],
      cuidados: ['Respeite os horarios sagrados', 'Mantenha intenções puras'],
      horarios: ['amanhecer', 'entardecer'],
      faseLua: 'new',
      duracaoMinutos: 30,
      materiais: ['fumo branco', 'vela dourada', 'agua de cheiro'],
      intencoes: ['novos caminhos', 'remocao de obstáculos', 'prosperidade'],
    },
    {
      id: 'limpeza-energetica',
      nome: 'Limpeza Energética',
      categoria: 'protection',
      proposito: 'Remover energias negativas e proteger o espaço sagrado',
      passos: [
        { ordem: 1, titulo: 'Banimento', descricao: 'Acenda fumo e passe pelos ambientes', duracaoMinutos: 15 },
        { ordem: 2, titulo: 'Aspersão', descricao: 'Borrife agua consagrada nos cantos', duracaoMinutos: 10 },
        { ordem: 3, titulo: 'Defumação', descricao: 'Use ervas de proteção: alecrim, arruda, pau-brasil', duracaoMinutos: 10 },
        { ordem: 4, titulo: 'Proteção', descricao: 'Coloque Sal grosso nos cantos da casa', duracaoMinutos: 5 },
      ],
      elementos: ['fumo', 'agua', 'sal', 'velas'],
      cuidados: ['Nao faca em caso de doença grave', 'Evite periodos de luto'],
      horarios: ['amanhecer', 'meio-dia'],
      faseLua: 'waning',
      duracaoMinutos: 40,
      materiais: ['fumo de carvao', 'agua de cheiro', 'sal grosso', 'velas brancas'],
      intencoes: ['limpeza', 'protecao', 'renovacao'],
    },
    {
      id: 'ebum-exu',
      nome: 'Ebum a Exu',
      categoria: 'communication',
      proposito: 'Homenagear Exu e abrir os caminhos da comunicação',
      passos: [
        { ordem: 1, titulo: 'Preparo', descricao: 'Monte a mesa de Exu com respeito', duracaoMinutos: 10 },
        { ordem: 2, titulo: 'Pintura', descricao: 'Trace o ponto de Exu na testa se desejar', duracaoMinutos: 5 },
        { ordem: 3, titulo: 'Oferenda', descricao: 'Ofereca bebida, comida e fumo', duracaoMinutos: 15 },
        { ordem: 4, titulo: 'Pedido', descricao: 'Faça seu pedido com clareza e respeito', duracaoMinutos: 10 },
        { ordem: 5, titulo: 'Despedida', descricao: 'Agradea e despeca-se de Exu', duracaoMinutos: 5 },
      ],
      elementos: ['bebida', 'comida', 'fumo', 'vela'],
      cuidados: ['Respeite sempre Exu', 'Nunca faça em horário noturno'],
      horarios: ['entardecer'],
      orixa: 'Exu',
      duracaoMinutos: 45,
      materiais: ['bebida alcoólica', 'pão', 'fumo', 'vela preta'],
      intencoes: ['abertura de caminhos', 'comunicacao', 'agilidade'],
    },
    {
      id: 'ebum-oxum',
      nome: 'Ebum a Oxum',
      categoria: 'love',
      proposito: 'Homenagear Oxum e invocar amor e prosperidade',
      passos: [
        { ordem: 1, titulo: 'Banho', descricao: 'Tome um banho com flores e perfume', duracaoMinutos: 10 },
        { ordem: 2, titulo: 'Mesa', descricao: 'Monte a mesa de Oxum com dourado', duracaoMinutos: 10 },
        { ordem: 3, titulo: 'Oferenda', descricao: 'Oferea mel, flores amarelas e perfume', duracaoMinutos: 15 },
        { ordem: 4, titulo: 'Canto', descricao: 'Cante ou ouça alabês de Oxum', duracaoMinutos: 10 },
        { ordem: 5, titulo: 'Pedido', descricao: 'Pea com o coração aberto', duracaoMinutos: 10 },
      ],
      elementos: ['agua doce', 'flores', 'ouro', 'perfume'],
      cuidados: ['Mantenha pureza de intenção', 'Evite ambientes tumultuados'],
      horarios: ['amanhecer'],
      faseLua: 'waxing',
      orixa: 'Oxum',
      duracaoMinutos: 55,
      materiais: ['mel', 'flores amarelas', 'perfume', 'vela dourada', 'espelho'],
      intencoes: ['amor', 'prosperidade', 'fertilidade', 'beleza'],
    },
    {
      id: 'ebum-oxossi',
      nome: 'Ebum a Oxóssi',
      categoria: 'hunting',
      proposito: 'Homenagear Oxóssi e buscar sabedoria e abundância',
      passos: [
        { ordem: 1, titulo: 'Floresta', descricao: 'Se possível, vá a um local natural', duracaoMinutos: 15 },
        { ordem: 2, titulo: 'Arco', descricao: 'Faça symbolically um gesto de caça', duracaoMinutos: 5 },
        { ordem: 3, titulo: 'Oferenda', descricao: 'Oferea fumo, mel e sementes', duracaoMinutos: 15 },
        { ordem: 4, titulo: 'Pedido', descricao: 'Pea sabedoria para suas caçadas', duracaoMinutos: 10 },
        { ordem: 5, titulo: 'Gratidão', descricao: 'Agradea por toda caça obtida', duracaoMinutos: 5 },
      ],
      elementos: ['floresta', 'arco', 'setas', 'ervas'],
      cuidados: ['Respeite a natureza', 'Nunca mate por sport'],
      horarios: ['amanhecer', 'entardecer'],
      faseLua: 'full',
      orixa: 'Oxóssi',
      duracaoMinutos: 50,
      materiais: ['fumo', 'mel', 'sementes', 'vela verde', 'copo de água'],
      intencoes: ['sabedoria', 'abundancia', 'conhecimento', 'justiça'],
    },
    {
      id: 'ebum-ogum',
      nome: 'Ebum a Ogum',
      categoria: 'war',
      proposito: 'Homenagear Ogum e vencer batalhas e desafios',
      passos: [
        { ordem: 1, titulo: 'Armas', descricao: 'Prepare ferramentas ou imágenes de Ogum', duracaoMinutos: 5 },
        { ordem: 2, titulo: 'Fogo', descricao: 'Acenda velas vermelhas e faca o lume', duracaoMinutos: 10 },
        { ordem: 3, titulo: 'Batismo', descricao: 'Faça um banho de ervas de proteção', duracaoMinutos: 15 },
        { ordem: 4, titulo: 'Oferenda', descricao: 'Oferea carne, dendê e fumo', duracaoMinutos: 15 },
        { ordem: 5, titulo: 'Jura', descricao: 'Faça sua jura de luta e coragem', duracaoMinutos: 10 },
      ],
      elementos: ['ferro', 'fogo', 'carne', 'dendê'],
      cuidados: ['Lute com justicia', 'Defenda os fracos'],
      horarios: ['amanhecer', 'meio-dia'],
      faseLua: 'waxing',
      orixa: 'Ogum',
      duracaoMinutos: 55,
      materiais: ['vela vermelha', 'fumo', 'carne', 'dendê', 'ferro'],
      intencoes: ['forca', 'coragem', 'vitoria', 'justica'],
    },
    {
      id: 'ebum-ioruba',
      nome: 'Ebum aos Iorubás',
      categoria: 'ancestral',
      proposito: 'Homenagear os ancestrais e fortalecer a conexão com a lineage',
      passos: [
        { ordem: 1, titulo: 'Memória', descricao: 'Lembre de seus ancestrais com respeito', duracaoMinutos: 10 },
        { ordem: 2, titulo: 'Senzala', descricao: 'Monte um espaço para os ancestrais', duracaoMinutos: 10 },
        { ordem: 3, titulo: 'Alimentação', descricao: 'Oferea comida que eles gostavam', duracaoMinutos: 15 },
        { ordem: 4, titulo: 'Prece', descricao: 'Faça preces pedindo bênçãos', duracaoMinutos: 15 },
        { ordem: 5, titulo: 'Comunhão', descricao: 'Participe da comida em comunidade', duracaoMinutos: 10 },
      ],
      elementos: ['comida', 'bebida', 'flores', 'velas'],
      cuidados: ['Respeite as tradições', 'Mantenha o espaço limpo'],
      horarios: ['entardecer', 'noite'],
      faseLua: 'full',
      duracaoMinutos: 60,
      materiais: ['comida favorita', 'bebida', 'flores brancas', 'vela branca', 'agua'],
      intencoes: ['ancestralidade', 'protecao', 'guia', 'sabedoria ancestral'],
    },
    {
      id: 'ebum-axe',
      nome: 'Ebum a Axé',
      categoria: 'life',
      proposito: 'Invocar e honor the life force that animates all',
      passos: [
        { ordem: 1, titulo: 'Respiração', descricao: 'Pratique respiração profunda', duracaoMinutos: 10 },
        { ordem: 2, titulo: 'Movimento', descricao: 'Dance ou mova-se ritmicamente', duracaoMinutos: 15 },
        { ordem: 3, titulo: 'Canto', descricao: 'Cante ou ouça músicas sagradas', duracaoMinutos: 10 },
        { ordem: 4, titulo: 'Gratidão', descricao: 'Agradea por toda a vida', duracaoMinutos: 10 },
        { ordem: 5, titulo: 'Partilha', descricao: 'Compartilhe energia com outros', duracaoMinutos: 10 },
      ],
      elementos: ['movimento', 'som', 'respiracao', 'luz'],
      cuidados: ['Sinta seu corpo', 'Nao force além do limite'],
      horarios: ['qualquer'],
      faseLua: 'full',
      duracaoMinutos: 55,
      materiais: ['musica sagrada', 'incenso', 'vela dourada'],
      intencoes: ['vida', 'energia', 'vitalidade', 'alegria'],
    },
    {
      id: 'ebum-ibeira',
      nome: 'Ebum a Ibeyis',
      categoria: 'innocence',
      proposito: 'Homenagear as Ibejis e proteger as crianças',
      passos: [
        { ordem: 1, titulo: 'Inocência', descricao: 'Lembre-se de sua criança interior', duracaoMinutos: 10 },
        { ordem: 2, titulo: 'Jogos', descricao: 'Brinque ou observe crianças brincando', duracaoMinutos: 15 },
        { ordem: 3, titulo: 'Oferenda', descricao: 'Oferea doces, frutas e leite', duracaoMinutos: 10 },
        { ordem: 4, titulo: 'Proteção', descricao: 'Pea proteção para as crianças', duracaoMinutos: 10 },
        { ordem: 5, titulo: 'Saudação', descricao: 'Saudacao tripla como as Ibejis', duracaoMinutos: 5 },
      ],
      elementos: ['doces', 'frutas', 'leite', 'flores'],
      cuidados: ['Ame as crianças', 'Mantenha espíritu de innocência'],
      horarios: ['qualquer'],
      faseLua: 'new',
      duracaoMinutos: 50,
      materiais: ['doces coloridos', 'frutas', 'leite', 'flores brancas', 'vela branca'],
      intencoes: ['protecao infantil', 'inocencia', 'alegria', 'saude das crianças'],
    },
    {
      id: 'ebum-nana',
      nome: 'Ebum a Nanã',
      categoria: 'wisdom',
      proposito: 'Homenagear Nanã e buscar sabedoria antiga',
      passos: [
        { ordem: 1, titulo: 'Reverência', descricao: 'Demonstre respeito pela ancianidade', duracaoMinutos: 10 },
        { ordem: 2, titulo: 'Água', descricao: 'Use agua de fontes ou represas', duracaoMinutos: 10 },
        { ordem: 3, titulo: 'Oferenda', descricao: 'Oferea acarajé, dendê e fumo', duracaoMinutos: 15 },
        { ordem: 4, titulo: 'Meditação', descricao: 'Medite sobre a sabedoria dos antigos', duracaoMinutos: 15 },
        { ordem: 5, titulo: 'Aprendizado', descricao: 'Commit to learning from elders', duracaoMinutos: 10 },
      ],
      elementos: ['agua', 'lama', 'acaraje', 'dendê'],
      cuidados: ['Respeite os anciãos', 'Valorize a tradição'],
      horarios: ['amanhecer'],
      faseLua: 'waning',
      orixa: 'Nanã',
      duracaoMinutos: 60,
      materiais: ['agua de fonte', 'acarajé', 'dendê', 'fumo', 'vela roxa'],
      intencoes: ['sabedoria', 'ancestralidade', 'respeito', 'longevidade'],
    },
  ];
}

/**
 * Get a ritual by ID
 */
export function getRitualById(id: string): Ritual | undefined {
  return getRituals().find((r) => r.id === id);
}

/**
 * Get rituals by category
 */
export function getRitualsByCategory(categoria: ExtendedRitualCategory): Ritual[] {
  return getRituals().filter((r) => r.categoria === categoria);
}

/**
 * Get rituals by Orixá
 */
export function getRitualsByOrixa(orixa: string): Ritual[] {
  return getRituals().filter((r) => r.orixa?.toLowerCase() === orixa.toLowerCase());
}

/**
 * Get rituals by moon phase
 */
export function getRitualsByMoonPhase(faseLua: Ritual['faseLua']): Ritual[] {
  return getRituals().filter((r) => r.faseLua === faseLua);
}
