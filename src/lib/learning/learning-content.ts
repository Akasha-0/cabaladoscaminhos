/**
 * Learning Content
 * Core educational content and materials for the Cabala dos Caminhos platform
 */

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: string;
  sections: LearningSection[];
  prerequisites: string[];
  estimatedMinutes: number;
}

export interface LearningSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'interactive' | 'meditation' | 'ritual';
  keyPoints: string[];
}

export interface LearningContent {
  modules: LearningModule[];
  categories: string[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalModules: number;
  };
}

const learningModules: LearningModule[] = [
  {
    id: 'foundations-cabala',
    title: 'Fundamentos da Cabala',
    description: 'Introdução aos conceitos básicos da tradição cabalística',
    category: 'foundations',
    prerequisites: [],
    estimatedMinutes: 45,
    sections: [
      {
        id: 'intro-tree-of-life',
        title: 'A Árvore da Vida',
        content: 'A Árvore da Vida é o mapa central da Cabala, representando a estrutura do universo e a jornada da alma. Composta por dez Sephirot conectadas por vinte e dois caminhos, ela descreve como a energia divina desce e ascende através dos mundos.',
        type: 'text',
        keyPoints: [
          'Dez Sephirot representando diferentes aspectos divinos',
          'Vinte e dois caminhos Letterais conectando as Sephirot',
          'Quatro mundos: Atziluth, Briah, Yetzirah e Assiyah'
        ]
      },
      {
        id: 'sephirot-overview',
        title: 'Visão Geral das Sephirot',
        content: 'As dez Sephirot são os dez atributos ou emanações através dos quais o En Sof (o infinito) se manifesta. Cada uma representa um aspecto específico da divindade e uma qualidade que podemos desenvolver em nossas vidas.',
        type: 'interactive',
        keyPoints: [
          'Keter - Coroa: A vontade divina',
          'Chokhmah - Sabedoria: O primeiro impulso criativo',
          'Binah - Entendimento: A sabedoria receptiva',
          'Daat - Conhecimento: A união das primeiras três'
        ]
      }
    ]
  },
  {
    id: 'sacred-geometry-intro',
    title: 'Geometria Sagrada',
    description: 'A matemática divina presente na criação',
    category: 'geometry',
    prerequisites: ['foundations-cabala'],
    estimatedMinutes: 30,
    sections: [
      {
        id: 'flower-of-life',
        title: 'A Flor da Vida',
        content: 'A Flor da Vida é um símbolo antigo encontrado em todo o mundo, representando a estrutura fundamental do universo. Ela contém todos os cinco sólidos platônicos e a proporção sagrada phi.',
        type: 'text',
        keyPoints: [
          'Padrão de dezenove círculos sobrepostos',
          'Contém a semente da vida, árvore da vida e fruta da vida',
          'Base para a Merkaba e outras formas geométricas sagradas'
        ]
      },
      {
        id: 'metatron-cube',
        title: 'O Cubo de Metatron',
        content: 'O Cubo de Metatron contém todos os cinco sólidos platônicos e representa a energia criativa divina. Metatron, o anjo do trono, usa este cubo para canalizar energia sagrada.',
        type: 'interactive',
        keyPoints: [
          'Treze círculos conectados por linhas',
          'Contém os cinco sólidos platônicos',
          'Usado para proteção e transformação energética'
        ]
      }
    ]
  },
  {
    id: 'astrology-basics',
    title: 'Astrologia Cabalística',
    description: 'A conexão entre astrologia e Cabala',
    category: 'astrology',
    prerequisites: ['foundations-cabala'],
    estimatedMinutes: 40,
    sections: [
      {
        id: 'planets-sephirot',
        title: 'Planetas e Sephirot',
        content: 'Cada planeta do sistema solar corresponde a uma Sephirah específica, carregando sua energia e qualidade particular. Esta correspondência permite uma análise profunda do mapa astral.',
        type: 'text',
        keyPoints: [
          'Sol corresponde a Tiferet - Harmonia e identidade',
          'Lua corresponde a Yesod - Fundamento e inconsciente',
          'Saturno corresponde a Netzach - Vitória e expansão'
        ]
      }
    ]
  },
  {
    id: 'meditation-foundations',
    title: 'Meditação Cabalística',
    description: 'Práticas contemplativas para evolução espiritual',
    category: 'meditation',
    prerequisites: ['foundations-cabala'],
    estimatedMinutes: 25,
    sections: [
      {
        id: 'visualization-tree',
        title: 'Visualização da Árvore',
        content: 'Uma prática de meditação que utiliza a visualização da Árvore da Vida para equilibrar e harmonizar as Sephirot. Esta prática pode ser feita diariamente para promover crescimento espiritual.',
        type: 'meditation',
        keyPoints: [
          'Sentando-se confortavelmente, visualizar a Árvore diante de você',
          'Começando em Keter, permita que a luz desça gradualmente',
          'Permita que a energia preencha cada Sephirah por sua vez'
        ]
      }
    ]
  },
  {
    id: 'numerology-intro',
    title: 'Numerologia Cabalística',
    description: 'O poder dos números na tradição hebraica',
    category: 'numerology',
    prerequisites: ['foundations-cabala'],
    estimatedMinutes: 35,
    sections: [
      {
        id: 'hebrew-letters-numbers',
        title: 'Letras Hebraicas como Números',
        content: 'Na Cabala, cada letra do alfabeto hebraico possui um valor numérico. O sistema Gematria permite decodificar significados ocultos em textos sagrados através de cálculos numéricos.',
        type: 'text',
        keyPoints: [
          'Aleph=1, Beth=2, Gimel=3, até Tav=400',
          'Palavras com mesmo valor numérico têm conexões ocultas',
          'A Gematria revela camadas de significado nos textos'
        ]
      }
    ]
  }
];

/**
 * Get all learning content
 */
export function getContent(): LearningContent {
  const categories = Array.from(new Set(learningModules.map(m => m.category)));
  
  return {
    modules: learningModules,
    categories,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2026-05-28',
      totalModules: learningModules.length
    }
  };
}

/**
 * Get learning modules by category
 */
export function getModulesByCategory(category: string): LearningModule[] {
  return learningModules.filter(m => m.category === category);
}

/**
 * Get a specific module by ID
 */
export function getModuleById(id: string): LearningModule | undefined {
  return learningModules.find(m => m.id === id);
}

/**
 * Get all available categories
 */
export function getCategories(): string[] {
  return Array.from(new Set(learningModules.map(m => m.category)));
}

/**
 * Get modules by prerequisite
 */
export function getModulesByPrerequisite(prerequisiteId: string): LearningModule[] {
  return learningModules.filter(m => m.prerequisites.includes(prerequisiteId));
}