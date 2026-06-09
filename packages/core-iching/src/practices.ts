/**
 * @akasha/core-iching — Práticas Integrativas
 * Conexão entre I-Ching e tradições espirituais (Ifá, Candomblé, Cristaloterapia,
 * Aromaterapia, Cromoterapia).
 *
 * Integra práticas ancestrais com os 64 hexagramas para ampliar
 * o alcance terapêutico e espiritual do sistema oracular.
 */

import type {
  IntegrativePractice,
  Element,
  PracticeCategory,
} from './types';

/** Banco de práticas integrativas. */
const PRACTICES: IntegrativePractice[] = [
  // ── Ifá/Candomblé (5) ─────────────────────────────────────────────────────

  {
    id: 'ewe-oxum',
    name: 'Ewé de Oxum',
    tradition: 'Candomblé',
    category: 'banho_de_ervas',
    associations: {
      element: 'agua',
      orixa: 'Oxum',
      color: 'dourado',
      planet: 'Vênus',
      chakra: 4,
      hexagrams: [5, 60],
    },
    lifeAreas: ['amor', 'prosperidade', 'fertilidade', 'autoestima'],
    howTo: 'Ferva folhas de oxum fresco em 1 litro de água por 15 minutos. Coe e reserve a água. Tome um banho de imersão por 20 minutos ao amanhecer.',
    frequency: 'Uma vez por semana, preferencialmente sextas-feiras.',
    isSafe: true,
  },

  {
    id: 'ewe-ogum',
    name: 'Ewé de Ogum',
    tradition: 'Candomblé',
    category: 'protecao',
    associations: {
      element: 'madeira',
      orixa: 'Ogum',
      color: 'verde',
      planet: 'Marte',
      chakra: 1,
      hexagrams: [26, 18],
    },
    lifeAreas: ['proteção', 'força', 'coragem', 'determinação'],
    howTo: 'Amasse folhas de ogum fresco e faça uma pasta com água de coco. Aplique no corpo da cintura para baixo enquanto mentaliza sua intenção.',
    frequency: 'Diariamente durante 7 dias, ao amanhecer.',
    isSafe: true,
  },

  {
    id: 'abre-alas-iemanja',
    name: 'Abre Alas de Iemanjá',
    tradition: 'Candomblé',
    category: 'abre_alas',
    associations: {
      element: 'agua',
      orixa: 'Iemanjá',
      color: 'azul',
      planet: 'Lua',
      chakra: 6,
      hexagrams: [29, 8],
    },
    lifeAreas: ['amor', 'família', 'proteção', 'realização'],
    howTo: 'Embeber 7 pedras de sal marinho em água de flor de maracujá. Banho de imersão de 30 minutos ao entardecer, mentalizando o caminho se abrindo.',
    frequency: 'Uma vez ao mês, preferencialmente em lua cheia.',
    isSafe: true,
  },

  {
    id: 'defumacao-palo-santo',
    name: 'Defumação de Palo Santo',
    tradition: 'Ifá',
    category: 'defumacao',
    associations: {
      element: 'fogo',
      color: 'branco',
      planet: 'Sol',
      chakra: 7,
      hexagrams: [30, 36],
    },
    lifeAreas: ['limpeza', 'proteção', 'espiritualidade', 'clareza'],
    howTo: 'Acenda o palo santo e deixe a chama formar brasa. Use um lebrê para passar a fumaça pelo ambiente e ao redor do corpo no sentido horário.',
    frequency: 'Ao acordar ou antes de meditação.',
    isSafe: true,
  },

  {
    id: 'banho-sal-alecrim',
    name: 'Banho de Sal e Alecrim',
    tradition: 'Candomblé',
    category: 'banho_de_ervas',
    associations: {
      element: 'terra',
      color: 'verde',
      planet: 'Mercúrio',
      chakra: 3,
      hexagrams: [18, 41],
    },
    lifeAreas: ['proteção', 'purificação', 'prosperidade', 'trabalho'],
    howTo: 'Misture 7 colheres de sal grosso com 1 maço de alecrim fresco em 2 litros de água fervente. Coe e tome banho de chuveiro.',
    frequency: 'Segunda e quinta-feira, durante 21 dias.',
    isSafe: true,
  },

  // ── Cristais (5) ──────────────────────────────────────────────────────────

  {
    id: 'quartzo-rosa',
    name: 'Cristais de Quartzo Rosa',
    tradition: 'Cristaloterapia',
    category: 'cristal',
    associations: {
      element: 'agua',
      color: 'rosa',
      planet: 'Vênus',
      chakra: 4,
      hexagrams: [5, 31],
    },
    lifeAreas: ['amor', 'autoestima', 'cura emocional', 'relações'],
    howTo: 'Segure o quartzo rosa em cada mão durante 10 minutos. Visualize uma luz rosa envolvendo seu coração enquanto respira profundamente.',
    frequency: 'Diariamente ao acordar ou antes de dormir.',
    isSafe: true,
  },

  {
    id: 'ametista',
    name: 'Ametista',
    tradition: 'Cristaloterapia',
    category: 'cristal',
    associations: {
      element: 'agua',
      color: 'roxo',
      planet: 'Netuno',
      chakra: 6,
      hexagrams: [29, 30],
    },
    lifeAreas: ['espiritualidade', 'calma', 'intuição', 'sonhos'],
    howTo: 'Coloque uma ametista sob o travesseiro para dormir ou segure durante meditação. Programar a pedra mentalizando intenção por 3 minutos.',
    frequency: 'Durante meditação diária e no quarto de dormir.',
    isSafe: true,
  },

  {
    id: 'turmalina-negra',
    name: 'Turmalina Negra',
    tradition: 'Cristaloterapia',
    category: 'cristal',
    associations: {
      element: 'terra',
      color: 'preto',
      planet: 'Saturno',
      chakra: 1,
      hexagrams: [2, 18],
    },
    lifeAreas: ['proteção', 'aterramento', 'absorção de energias negativas'],
    howTo: 'Segure a turmalina negra na mão esquerda por 5 minutos ao acordar. Ou placing-a na entrada do ambiente para formar escudo protetor.',
    frequency: 'Diariamente, especialmente em dias de alta energia negativa.',
    isSafe: true,
  },

  {
    id: 'citrino',
    name: 'Citrino',
    tradition: 'Cristaloterapia',
    category: 'cristal',
    associations: {
      element: 'fogo',
      color: 'amarelo',
      planet: 'Sol',
      chakra: 3,
      hexagrams: [14, 26],
    },
    lifeAreas: ['prosperidade', 'abundância', 'confiança', 'realização'],
    howTo: 'Segure o citrino na mão direita enquanto visualiza sua intenção de prosperidade. Mantenha perto da carteira ou cofre.',
    frequency: 'Diariamente, carregando sempre que possível.',
    isSafe: true,
  },

  {
    id: 'quartzo-transparente',
    name: 'Quartzo Transparente',
    tradition: 'Cristaloterapia',
    category: 'cristal',
    associations: {
      element: 'agua',
      color: 'branco',
      planet: 'Lua',
      chakra: 7,
      hexagrams: [1, 30],
    },
    lifeAreas: ['clareza mental', 'amplificação de intenções', 'cura', 'equilíbrio'],
    howTo: 'Segure o quartzo transparente na mão dominante. Projete sua intenção euse-o como amplificador visualizando luz passando pela pedra.',
    frequency: 'Durante meditação e trabalho com outras práticas.',
    isSafe: true,
  },

  // ── Aromaterapia (5) ──────────────────────────────────────────────────────

  {
    id: 'oleo-lavanda',
    name: 'Óleo de Lavanda',
    tradition: 'Aromaterapia',
    category: 'oleo_essencial',
    associations: {
      element: 'agua',
      color: 'roxo',
      planet: 'Mercúrio',
      chakra: 7,
      hexagrams: [29, 51],
    },
    lifeAreas: ['calma', 'sono', 'redução de estresse', 'relaxamento'],
    howTo: 'Misture 3 gotas de óleo essencial de lavanda em 1 colher de óleo base (coco ou amêndoas). Aplique nas têmporas e pulseiras.',
    frequency: 'Antes de dormir ou em momentos de estresse.',
    isSafe: true,
  },

  {
    id: 'oleo-rosa',
    name: 'Óleo de Rosa',
    tradition: 'Aromaterapia',
    category: 'oleo_essencial',
    associations: {
      element: 'agua',
      color: 'rosa',
      planet: 'Vênus',
      chakra: 4,
      hexagrams: [5, 31],
    },
    lifeAreas: ['amor', 'autoestima', 'cura emocional', ' romance'],
    howTo: 'Dilua 2 gotas em 1 colher de óleo base. Aplique no pulso e no coração. Para ambiente, use difusor com 3-5 gotas.',
    frequency: 'Diariamente ou antes de encontros importantes.',
    isSafe: true,
  },

  {
    id: 'oleo-incenso',
    name: 'Óleo de Incenso',
    tradition: 'Aromaterapia',
    category: 'oleo_essencial',
    associations: {
      element: 'fogo',
      color: 'dourado',
      planet: 'Sol',
      chakra: 6,
      hexagrams: [30, 36],
    },
    lifeAreas: ['espiritualidade', 'meditação', 'proteção', 'conexão superior'],
    howTo: 'Dilua 3 gotas em óleo base e aplique no terceiro olho. Ou difunda 5 gotas durante rituals ou meditação.',
    frequency: 'Durante práticas espirituais e meditação.',
    isSafe: true,
  },

  {
    id: 'cha-camomila',
    name: 'Chá de Camomila',
    tradition: 'Aromaterapia',
    category: 'cha',
    associations: {
      element: 'agua',
      color: 'amarelo claro',
      planet: 'Lua',
      chakra: 4,
      hexagrams: [24, 51],
    },
    lifeAreas: ['relaxamento', 'calma', 'digestão', 'sono'],
    howTo: 'Infusion 1 colher de flores de camomila secas em 200ml de água quente por 5-7 minutos. Beba lentamente em ambiente tranquilo.',
    frequency: 'Antes de dormir ou após refeições pesadas.',
    isSafe: true,
  },

  {
    id: 'cha-gengibre',
    name: 'Chá de Gengibre',
    tradition: 'Aromaterapia',
    category: 'cha',
    associations: {
      element: 'fogo',
      color: 'amarelo',
      planet: 'Marte',
      chakra: 3,
      hexagrams: [26, 34],
    },
    lifeAreas: ['energia', 'vitalidade', 'digestão', 'aquecimento'],
    howTo: 'Fatie 3-4 rodelas de gengibre fresco e ferva em 300ml de água por 10 minutos. Adicione mel se desejar.',
    frequency: 'Manhãs ou quando precisar de energia.',
    isSafe: true,
  },

  // ── Cromoterapia (5) ─────────────────────────────────────────────────────

  {
    id: 'luz-amarela',
    name: 'Banho de Luz Amarela',
    tradition: 'Cromoterapia',
    category: 'cromoterapia',
    associations: {
      element: 'fogo',
      color: 'amarelo',
      planet: 'Sol',
      chakra: 3,
      hexagrams: [14, 26],
    },
    lifeAreas: ['prosperidade', 'abundância', 'confiança', 'otimismo'],
    howTo: 'Sente-se em ambiente escuro e exponha-se à luz amarela (lâmpada ou filtro) por 15 minutos. Visualize energia dourada entrando.',
    frequency: 'Manhãs ensolaradas, 3 vezes por semana.',
    isSafe: true,
  },

  {
    id: 'luz-azul',
    name: 'Banho de Luz Azul',
    tradition: 'Cromoterapia',
    category: 'cromoterapia',
    associations: {
      element: 'agua',
      color: 'azul',
      planet: 'Lua',
      chakra: 5,
      hexagrams: [5, 29],
    },
    lifeAreas: ['calma', 'comunicação', 'verdade', 'paz interior'],
    howTo: 'Exponha-se à luz azul por 20 minutos em ambiente tranquilo. Ideal ao entardecer quando há transições de energia.',
    frequency: 'Diariamente ao entardecer por 15-20 dias.',
    isSafe: true,
  },

  {
    id: 'luz-verde',
    name: 'Banho de Luz Verde',
    tradition: 'Cromoterapia',
    category: 'cromoterapia',
    associations: {
      element: 'madeira',
      color: 'verde',
      planet: 'Vênus',
      chakra: 4,
      hexagrams: [20, 57],
    },
    lifeAreas: ['cura', 'equilíbrio', 'crescimento', 'natureza'],
    howTo: 'Sente-se na natureza ou exponha-se à luz verde artificial por 15 minutos. Idealmente ao ar livre, próximo a plantas.',
    frequency: 'Diariamente por 21 dias, preferencialmente manhãs.',
    isSafe: true,
  },

  {
    id: 'luz-vermelha',
    name: 'Banho de Luz Vermelha',
    tradition: 'Cromoterapia',
    category: 'cromoterapia',
    associations: {
      element: 'fogo',
      color: 'vermelho',
      planet: 'Marte',
      chakra: 1,
      hexagrams: [6, 34],
    },
    lifeAreas: ['energia', 'coragem', 'vitalidade', 'força'],
    howTo: 'Exponha-se à luz vermelha por 10 minutos, preferencialmente pela manhã. Não exceder 15 minutos para evitar hiperestimulação.',
    frequency: 'Manhãs, 2-3 vezes por semana.',
    isSafe: true,
  },

  {
    id: 'afirmacao-cor',
    name: 'Afirmação com Cor',
    tradition: 'Cromoterapia',
    category: 'cromoterapia',
    associations: {
      color: 'branco',
      chakra: 7,
      hexagrams: [1, 30],
    },
    lifeAreas: ['alinhamento', 'intenção', 'manifestação', 'propósito'],
    howTo: 'Visualize a cor associada à sua intenção enquanto repete sua afirmação 21 vezes. Por exemplo: "Sou próspero" com visualização dourada.',
    frequency: 'Ao acordar e antes de dormir, por 40 dias.',
    isSafe: true,
  },
];

/** Mapa de práticas por ID para busca rápida. */
const PRACTICES_BY_ID = Object.fromEntries(PRACTICES.map((p) => [p.id, p]));

/** Agrupa práticas por elemento. */
const PRACTICES_BY_ELEMENT: Partial<Record<Element, IntegrativePractice[]>> = {};
for (const p of PRACTICES) {
  const el = p.associations.element;
  if (el) {
    if (!PRACTICES_BY_ELEMENT[el]) PRACTICES_BY_ELEMENT[el] = [];
    PRACTICES_BY_ELEMENT[el]!.push(p);
  }
}

/** Agrupa práticas por tradição. */
const PRACTICES_BY_TRADITION: Record<string, IntegrativePractice[]> = {};
for (const p of PRACTICES) {
  if (!PRACTICES_BY_TRADITION[p.tradition]) PRACTICES_BY_TRADITION[p.tradition] = [];
  PRACTICES_BY_TRADITION[p.tradition].push(p);
}

/** Agrupa práticas por categoria. */
const PRACTICES_BY_CATEGORY: Partial<Record<PracticeCategory, IntegrativePractice[]>> = {};
for (const p of PRACTICES) {
  if (!PRACTICES_BY_CATEGORY[p.category]) PRACTICES_BY_CATEGORY[p.category] = [];
  PRACTICES_BY_CATEGORY[p.category]!.push(p);
}

export { PRACTICES };

/** Retorna uma prática pelo ID. */
export function getPractice(id: string): IntegrativePractice | undefined {
  return PRACTICES_BY_ID[id];
}

/** Retorna todas as práticas de um elemento. */
export function getPracticesByElement(element: Element): IntegrativePractice[] {
  return PRACTICES_BY_ELEMENT[element] ?? [];
}

/** Retorna todas as práticas de uma tradição. */
export function getPracticesByTradition(tradition: string): IntegrativePractice[] {
  return PRACTICES_BY_TRADITION[tradition] ?? [];
}

/** Retorna todas as práticas de uma categoria. */
export function getPracticesByCategory(category: PracticeCategory): IntegrativePractice[] {
  return PRACTICES_BY_CATEGORY[category] ?? [];
}

/** Retorna todas as práticas que afetam uma área da vida. */
export function getPracticesByLifeArea(lifeArea: string): IntegrativePractice[] {
  const normalized = lifeArea.toLowerCase().trim();
  return PRACTICES.filter((p) =>
    p.lifeAreas.some((area) => area.toLowerCase().includes(normalized))
  );
}

/** Retorna todas as 20 práticas integrativas. */
export function getAllPractices(): IntegrativePractice[] {
  return [...PRACTICES];
}
