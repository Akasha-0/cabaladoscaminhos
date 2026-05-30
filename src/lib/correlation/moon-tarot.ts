/**
 * Moon-Tarot Spiritual Correlation Module
 * Maps lunar phases to Tarot Major Arcana with spiritual meanings
 * Source: Cabala dos Caminhos - lunar mystical traditions
 */

/**
 * Lunar phase type - all 8 traditional phases
 */
export type FaseLua =
  | 'lua-nova'
  | 'lua-crescente'
  | 'quarto-crescente'
  | 'lua-cheia'
  | 'quarto-minguante'
  | 'lua-minguante'
  | 'quarto-descrescente'
  | 'lua-velha';

/**
 * Represents the spiritual correlation between a lunar phase and its Tarot Major Arcana
 */
export interface MoonTarotMapping {
  /** The lunar phase identifier (slug format) */
  fase: string;
  /** Human-readable phase name in Portuguese */
  nome_fase: string;
  /** The associated Major Arcana card name in Portuguese */
  arcano: string;
  /** The card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** Primary element associated with this phase-arcano correlation */
  elemento_primario: string;
  /** Secondary elements supporting the correlation */
  elementos_secundarios: string[];
  /** Connection description between moon phase and arcano */
  conexao: string;
  /** Spiritual meaning and archetype interpretation */
  significado_espiritual: string;
  /** Ritual guidance for this lunar-arcano alignment */
  ritual: {
    /** Meditation practices */
    meditacao: string[];
    /** Ritual activities */
    rituais: string[];
    /** Recommended colors */
    cores: string[];
    /** Associated crystals */
    cristais: string[];
  };
}

// ─── Moon Phase to Tarot Major Arcana Mapping ─────────────────────────────────
// Each lunar phase corresponds to a specific Major Arcana card based on:
// - Energy alignment (growth, peak, decline cycles)
// - Elemental correspondence (earth, water, fire, air, ether)
// - Mystical symbolism and traditional esoteric interpretations

export const MOON_TAROT_MAPPINGS: Record<FaseLua, MoonTarotMapping> = {
  'lua-nova': {
    fase: 'lua-nova',
    nome_fase: 'Lua Nova',
    arcano: 'O Louco',
    numero_carta: 0,
    elemento_primario: 'Éter',
    elementos_secundarios: ['Terra'],
    conexao:
      'A Lua Nova representa o potencial puro e não manifestado, assim como O Louco symboliza o salto de fé antes da jornada começar. Ambos representam o ponto zero da criação - o momento antes do primeiro passo onde tudo é possível.',
    significado_espiritual:
      'Iniciação pura, o antes da jornada, potencial adormecido. O Louco ensina que novos começos exigem confiança no desconhecido. A Lua Nova é o momento de plantar intenções que germinarão no próximo ciclo. É o silêncio antes da primeira palavra, a página em branco antes da primeira frase.',
    ritual: {
      meditacao: [
        'Meditação de renovação - visualize um novo eu emergindo',
        'Visualização da semente de intenção plantada na escuridão',
        'Conexão com o vazio fértil que contém todas as possibilidades',
      ],
      rituais: [
        'Plantar sementes de intenções para o novo ciclo',
        'Rituais de novos começos e limpezas kármicas',
        'Assentamento de novos projetos e parcerias',
      ],
      cores: ['Branco', 'Preto', 'Prata'],
      cristais: ['Cristal de rocha', 'Diamante', 'Moldavita'],
    },
  },
  'lua-crescente': {
    fase: 'lua-crescente',
    nome_fase: 'Lua Crescente',
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    elemento_primario: 'Água',
    elementos_secundarios: ['Lua'],
    conexao:
      'A Lua Crescente traz a primeira luz refletida, simbolizando o despertar da intuição após a escuridão da Lua Nova. A Sacerdotisa guarda os mistérios ocultos e conhece as verdades além do véu - a mesma sabedoria oculta que cresce com a luz lunar.',
    significado_espiritual:
      'Despertar da intuição, sabedoria oculta, o mistério além do véu. A Sacerdotisa representa o conhecimento secreto que emerge quando a luz da consciência ilumina os cantos escuros da mente. A Lua Crescente nutre esse despertar com energia aquosa de percepção profunda.',
    ritual: {
      meditacao: [
        'Meditação lunar com velas prateadas',
        'Diálogo interior com a guardiã dos mistérios',
        'Abertura do terceiro olho sob a luz crescente',
      ],
      rituais: [
        'Rituais de desenvolvimento da intuição',
        'Leitura de oráculos e baralhos divinatórios',
        'Ativações do chakra coronário e terceiro olho',
      ],
      cores: ['Azul escuro', 'Prata', 'Roxo'],
      cristais: ['Ametista', 'Lápis-lazúli', 'Sodalita'],
    },
  },
  'quarto-crescente': {
    fase: 'quarto-crescente',
    nome_fase: 'Quarto Crescente',
    arcano: 'O Carro',
    numero_carta: 7,
    elemento_primario: 'Fogo',
    elementos_secundarios: ['Água'],
    conexao:
      'O Quarto Crescente representa a energia de crescimento activo, a determinação de manifestar despite obstáculos. O Carro simboliza a vitória conquistada pela força de vontade, a carruagem que avanza através do caos em direção ao destino. A energia de ambos é de ação decisiva.',
    significado_espiritual:
      'Determinação, vitória, conquista dos obstáculos. O Carro ensina que a vontade disciplinada supera qualquer resistência. O Quarto Crescente é o momento de agir com ousadia, de dirigir a energia crescente para manifestar objetivos com precisão e foco de guerreiro.',
    ritual: {
      meditacao: [
        'Meditação de fortalecimento da vontade',
        'Visualização da carruagem da alma avançando',
        'Pranayama de fogo para ativar a energia de ação',
      ],
      rituais: [
        'Rituais de abertura de caminhos',
        'Magia de ação e manifestação rápida',
        'Conquistas de objetivos bloqueados',
      ],
      cores: ['Vermelho', 'Ouro', 'Laranja'],
      cristais: ['Citrino', 'Cornalina', 'Pirita'],
    },
  },
  'lua-cheia': {
    fase: 'lua-cheia',
    nome_fase: 'Lua Cheia',
    arcano: 'A Lua',
    numero_carta: 18,
    elemento_primario: 'Água',
    elementos_secundarios: ['Éter', 'Lua'],
    conexao:
      'A Lua Cheia e A Lua são uma única essência - a culminação perfeita onde o astro está plenamente iluminado e seu poder está no ápice. Este arcano mostra dois perros - um selvagem (inconsciente) e um domesticado (consciente) - diante do luar, entre a ilusão e a verdade. A Lua Cheia amplifica essa duality.',
    significado_espiritual:
      'Ilusão e verdade, o inconsciente iluminado, duality da psique. A Lua ensina que nem tudo é o que parece - existem níveis de realidade além da percepção comum. A Lua Cheia é o momento de alta intensidade emocional e intuitiva, onde os sonhos se manifestam e os segredos são revelados.',
    ritual: {
      meditacao: [
        'Banho de luar com olhos abertos para o céu',
        'Meditação das águas - conexão com o inconsciente',
        'Sonhos lúcidos e interpretação de visões noturnas',
      ],
      rituais: [
        'Rituais de adivinhação e clarividência',
        'Magia de manifesting de sonhos e visões',
        'Libertação de medos e cura emocional profunda',
      ],
      cores: ['Prata', 'Branco', 'Azul lunar'],
      cristais: ['Pedra da lua', 'Selenita', 'Clarity quartz'],
    },
  },
  'quarto-minguante': {
    fase: 'quarto-minguante',
    nome_fase: 'Quarto Minguante',
    arcano: 'A Torre',
    numero_carta: 16,
    elemento_primario: 'Fogo',
    elementos_secundarios: ['Ar'],
    conexao:
      'O Quarto Minguante inicia a fase de dissolução, a luz que começa a recuar preparando a renovação. A Torre representa a estrutura que precisa ruir para que algo novo possa nascer - a destruição necessária que o processo minguante exige. Ambos carregam a energia de transformação através da ruptura.',
    significado_espiritual:
      'Ruptura libertadora, destruição das ilusões, despertar forçado. A Torre é o raio que desce do céu para quebrar as estruturas falsas. O Quarto Minguante é quando identificamos o que não serve mais e temos a força interior para deixar ir, sacrificando o conforto da velha forma pela liberdade do novo.',
    ritual: {
      meditacao: [
        'Meditação de libertação de crenças limitantes',
        'Visualização do raio de luz destruindo estruturas internas',
        'Respiração de fogo para purificação interior',
      ],
      rituais: [
        'Rituais de rompimento de patrones negativos',
        'Quebra de dívidas kármicas e contratos energéticos',
        'Limpeza de ambientes e aura',
      ],
      cores: ['Vermelho escuro', 'Preto', 'Laranja flamejante'],
      cristais: ['Obsidiana', 'Fogo quartz', 'Turmalina negra'],
    },
  },
  'lua-minguante': {
    fase: 'lua-minguante',
    nome_fase: 'Lua Minguante',
    arcano: 'A Justiça',
    numero_carta: 11,
    elemento_primario: 'Ar',
    elementos_secundarios: ['Terra'],
    conexao:
      'A Lua Minguante traz a energia de avaliação e conclusão, quando a luz restantes permite ver com clareza o que foi criado e o que precisa ser encerrado. A Justiça representa o equilíbrio cósmico entre ações e consequências - a lei que governa todos os ciclos de crescimento e declínio.',
    significado_espiritual:
      'Equilíbrio cósmico, lei de causa e efeito, julgamento interior. A Justiça lembra que cada ação tem uma consequência proporcional. A Lua Minguante é o momento de reflexão honesta - de olhar para o ciclo que se encerra com olhos claros e aceitar o veredito do universo sobre nossas escolhas.',
    ritual: {
      meditacao: [
        'Meditação da balança - equilíbrio entre dar e receber',
        'Avaliação honesta das ações do ciclo lunar',
        'Conexão com a lei cósmica da reciprocidade',
      ],
      rituais: [
        'Rituais de perdão e reconciliação',
        'Balanceamento de contas kármicas',
        'Aceitação e compreensão de verdades difíceis',
      ],
      cores: ['Azul', 'Verde', 'Amarelo claro'],
      cristais: ['Aventurina', 'Amazonita', 'Gemas azuis'],
    },
  },
  'quarto-descrescente': {
    fase: 'quarto-descrescente',
    nome_fase: 'Quarto Descrescente',
    arcano: 'O Eremita',
    numero_carta: 9,
    elemento_primario: 'Terra',
    elementos_secundarios: ['Água'],
    conexao:
      'O Quarto Descrescente é a fase de recolhimento, quando a escuridão avança e a introspecção se aprofunda. O Eremita representa a sabedoria que se encontra na solidão, a luz interior que brilha mais intensamente na escuridão. Ambos pedem recolhimento para encontrar a verdadeira orientação.',
    significado_espiritual:
      'Sabedoria interior, solidão sagrada, a luz na escuridão. O Eremita ensina que às vezes precisamos caminhar sozinhos para encontrar a nossa própria verdade. O Quarto Descrescente convida ao recolhimento, à busca interior, ao diálogo com a alma através do silêncio.',
    ritual: {
      meditacao: [
        'Meditação em silêncio absoluto no escuro',
        'Busca interior e escuta da voz da alma',
        'Visualização da lanterna iluminando o caminho interior',
      ],
      rituais: [
        'Rituais de introspecção e autoconhecimento',
        'Busca de orientação interior para decisões importantes',
        'Abertura dos olhos interiores através da meditação profunda',
      ],
      cores: ['Azul escuro', 'Branco', 'Dourado suave'],
      cristais: ['Quartzo transparente', 'Howlite', 'Cristal fumaça'],
    },
  },
  'lua-velha': {
    fase: 'lua-velha',
    nome_fase: 'Lua Velha',
    arcano: 'A Morte',
    numero_carta: 13,
    elemento_primario: 'Água',
    elementos_secundarios: ['Fogo', 'Éter'],
    conexao:
      'A Lua Velha é a última fase do ciclo lunar, a escuridão quase completa antes do renascimento. A Morte representa a transformação final de um ciclo - a passagem necessária para que algo novo possa nascer. Ambos trabalham com o mistério da endings que são beginnings.',
    significado_espiritual:
      'Transformação final, fim de ciclos, renascimento através da morte. A Morte não é destruição, mas metamorfose - a borboleta que emerge da crisálida. A Lua Velha é o momento de honrar o que está terminando, de fazer luto sagrado, de se preparar espiritualmente para o novo ciclo que nasce da escuridão.',
    ritual: {
      meditacao: [
        'Meditação sobre os ciclos de transformação',
        'Visualização da morte do eu antigo e nascimento do novo',
        'Rituais de release e despedidas sagradas',
      ],
      rituais: [
        'Rituais de fim de ciclo e despedidas',
        'Cura de luto e aceitação de transformações',
        'Preparação espiritual para o novo ciclo lunar',
      ],
      cores: ['Preto', 'Roxo escuro', 'Vermelho escuro'],
      cristais: ['Ônix', 'Coral negro', 'Jade negro'],
    },
  },
};

/**
 * Get the moon-Tarot correlation mapping for a given lunar phase.
 * @param fase - The lunar phase identifier (slug format: lua-nova, lua-crescente, etc.)
 * @returns The MoonTarotMapping or null if phase not found
 */
export function getMoonTarot(fase: string): MoonTarotMapping | null {
  const normalizedFase = fase.toLowerCase().trim() as FaseLua;
  return MOON_TAROT_MAPPINGS[normalizedFase] ?? null;
}

/**
 * Get the lunar phase corresponding to a Tarot Major Arcana card.
 * @param arcano - The arcano name (e.g., 'O Louco', 'A Lua', 'A Morte')
 * @returns The lunar phase identifier or null if not found
 */
export function getTarotMoon(arcano: string): string | null {
  const normalizedArcano = arcano.trim();
  for (const [fase, mapping] of Object.entries(MOON_TAROT_MAPPINGS)) {
    if (mapping.arcano === normalizedArcano) {
      return fase;
    }
  }
  return null;
}

/**
 * Get the arcano name for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The arcano name or null if not found
 */
export function getArcanoByPhase(fase: string): string | null {
  return getMoonTarot(fase)?.arcano ?? null;
}

/**
 * Get the card number for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The card number (0-21) or null if not found
 */
export function getCardNumberByPhase(fase: string): number | null {
  return getMoonTarot(fase)?.numero_carta ?? null;
}

/**
 * Get the lunar phase corresponding to an arcano number.
 * @param numero - The Major Arcana card number (0-21)
 * @returns The lunar phase identifier or null if not found
 */
export function getPhaseByNumber(numero: number): string | null {
  for (const [fase, mapping] of Object.entries(MOON_TAROT_MAPPINGS)) {
    if (mapping.numero_carta === numero) {
      return fase;
    }
  }
  return null;
}

/**
 * Get all moon-Tarot correlation mappings.
 * @returns Array of all MoonTarotMapping
 */
export function getAllMoonTarots(): MoonTarotMapping[] {
  return Object.values(MOON_TAROT_MAPPINGS);
}

/**
 * Get all available lunar phases.
 * @returns Array of phase identifiers
 */
export function getAvailablePhases(): FaseLua[] {
  return Object.keys(MOON_TAROT_MAPPINGS) as FaseLua[];
}

/**
 * Get all arcano names.
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.values(MOON_TAROT_MAPPINGS).map((m) => m.arcano);
}

/**
 * Get the element connection for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The primary element or null if not found
 */
export function getElementByPhase(fase: string): string | null {
  return getMoonTarot(fase)?.elemento_primario ?? null;
}

/**
 * Get the spiritual meaning for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The spiritual meaning or null if not found
 */
export function getSpiritualMeaning(fase: string): string | null {
  return getMoonTarot(fase)?.significado_espiritual ?? null;
}

/**
 * Check if a phase exists in the mapping.
 * @param fase - The lunar phase identifier to check
 * @returns True if phase exists
 */
export function hasMoonTarot(fase: string): boolean {
  return getMoonTarot(fase) !== null;
}

/**
 * Get the connection description for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The connection description or null if not found
 */
export function getConexaoByPhase(fase: string): string | null {
  return getMoonTarot(fase)?.conexao ?? null;
}

/**
 * Get ritual guidance for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The ritual guidance or null if not found
 */
export function getRitualByPhase(fase: string): MoonTarotMapping['ritual'] | null {
  return getMoonTarot(fase)?.ritual ?? null;
}