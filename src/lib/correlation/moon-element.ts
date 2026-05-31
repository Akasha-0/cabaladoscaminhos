/**
 * Moon-Element Spiritual Correlation Module
 * Maps lunar phases to elements with spiritual meanings and elemental properties.
 * Based on Cabala dos Caminhos hermetic principles and lunar elemental alchemy.
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export type FaseLua =
  | 'lua-nova'
  | 'lua-crescente'
  | 'quarto-crescente'
  | 'lua-cheia'
  | 'quarto-minguante'
  | 'lua-minguante'
  | 'quarto-descrescente'
  | 'lua-velha';

export interface MoonElementMapping {
  fase: string;
  nome_fase: string;
  elemento: Elemento;
  qualidade_elemental: {
    natureza: string;
    energia: string;
    manifesto_em: string[];
  };
  significado_espiritual: {
    core: string;
    aprendizado: string;
    advertencia: string;
    ritual_sugerido: string;
  };
  correspondencias: {
    orixa_regente: string;
    chakra: string;
    direcao_cardinal: string;
    estacao: string;
  };
}

/**
 * Complete mapping of lunar phases to elements.
 * Each phase carries the elemental signature that defines its spiritual nature.
 * Based on lunar elemental alchemy and traditional hermetic correspondences.
 */
export const MOON_ELEMENT_MAP: Record<FaseLua, MoonElementMapping> = {
  'lua-nova': {
    fase: 'lua-nova',
    nome_fase: 'Lua Nova',
    elemento: 'Terra',
    qualidade_elemental: {
      natureza: 'Ancoradora e fecunda',
      energia: 'Potencial adormecido, semente invisível',
      manifesto_em: ['plantio', 'fundação', 'ancoramento', 'proteção'],
    },
    significado_espiritual: {
      core: 'O vazio fértil onde toda manifestação começa',
      aprendizado: 'Confiança no invisível e no ciclo que retorna',
      advertencia: 'Resistência ao silêncio e à espera cria bloqueios',
      ritual_sugerido: 'Defumação com alecrim, oração de proteção, visualização de raízes',
    },
    correspondencias: {
      orixa_regente: 'Exu',
      chakra: '1º Básico (Muladhara)',
      direcao_cardinal: 'Norte',
      estacao: 'Inverno',
    },
  },
  'lua-crescente': {
    fase: 'lua-crescente',
    nome_fase: 'Lua Crescente',
    elemento: 'Água',
    qualidade_elemental: {
      natureza: 'Purificadora e flutuante',
      energia: 'Fluxo ascendente, limpeza e abertura',
      manifesto_em: ['purificação', 'limpeza', 'fluidez', 'sensibilidade'],
    },
    significado_espiritual: {
      core: 'O movimento que dissolvem barreiras e atrai prosperidade',
      aprendizado: 'Permitir o fluxo natural e confiar na correnteza',
      advertencia: 'Apreensão excessiva atrai o que se teme',
      ritual_sugerido: 'Banho de ervas, defumação de palo santo, visualization de chuva purificadora',
    },
    correspondencias: {
      orixa_regente: 'Oxóssi',
      chakra: '2º Sacro (Svadhisthana)',
      direcao_cardinal: 'Nordeste',
      estacao: 'Primavera',
    },
  },
  'quarto-crescente': {
    fase: 'quarto-crescente',
    nome_fase: 'Quarto Crescente',
    elemento: 'Fogo',
    qualidade_elemental: {
      natureza: 'Transformadora e guerreira',
      energia: 'Ação determinada, coragem ativa',
      manifesto_em: ['ação', 'coragem', 'determinação', 'quebra de barreiras'],
    },
    significado_espiritual: {
      core: 'A chama que consome o medo e forja a vontade',
      aprendizado: 'A verdadeira força está na ação alinhada com o propósito',
      advertencia: 'Impaciência e agressividade consomem energia vital',
      ritual_sugerido: 'Queima de ervas secas, banhos de limpeza forte, caminhadas em fogo',
    },
    correspondencias: {
      orixa_regente: 'Ogum',
      chakra: '3º Plexo Solar (Manipura)',
      direcao_cardinal: 'Leste',
      estacao: 'Primavera',
    },
  },
  'lua-cheia': {
    fase: 'lua-cheia',
    nome_fase: 'Lua Cheia',
    elemento: 'Ar',
    qualidade_elemental: {
      natureza: 'Iluminada e expansiva',
      energia: 'Culminação, plenitude, amor incondicional',
      manifesto_em: ['culminação', 'gratidão', 'magia', 'iluminação'],
    },
    significado_espiritual: {
      core: 'O espelho que reflete a verdade interior e atrai o que ressoa',
      aprendizado: 'Gratidão atrai abundância e amplia a percepção',
      advertencia: 'Excesso de luz sem base cria ilusão e dispersão',
      ritual_sugerido: 'Bênção com incenso, oferendas ao ar livre, dança ritual',
    },
    correspondencias: {
      orixa_regente: 'Oxalá',
      chakra: '4º Cardíaco (Anahata)',
      direcao_cardinal: 'Sul',
      estacao: 'Verão',
    },
  },
  'quarto-minguante': {
    fase: 'quarto-minguante',
    nome_fase: 'Quarto Minguante',
    elemento: 'Ar',
    qualidade_elemental: {
      natureza: 'Dissolutiva e libertadora',
      energia: 'Dispersão do que não serve, vento purificador',
      manifesto_em: ['libertação', 'purificação', 'comunicação', 'expressão'],
    },
    significado_espiritual: {
      core: 'O vento que leva o que precisa partir',
      aprendizado: 'Soltar é tão poderoso quanto conquistar',
      advertencia: 'Segurar o que deve partir causa estagnação e peso',
      ritual_sugerido: 'Escrita e queima de papéis, defumação com sábina, canto libertador',
    },
    correspondencias: {
      orixa_regente: 'Iansã',
      chakra: '5º Laríngeo (Vishuddha)',
      direcao_cardinal: 'Oeste',
      estacao: 'Outono',
    },
  },
  'lua-minguante': {
    fase: 'lua-minguante',
    nome_fase: 'Lua Minguante',
    elemento: 'Éter',
    qualidade_elemental: {
      natureza: 'Reveladora e transmutadora',
      energia: 'Dissolução no invisível, visão clara',
      manifesto_em: ['revelação', 'intuição', 'visão profunda', 'transmutação'],
    },
    significado_espiritual: {
      core: 'A fumaça que revela verdades ocultas nos cantos escuros',
      aprendizado: 'A sabedoria verdadeira vem do silêncio interior',
      advertencia: 'Visões sem ação são ilusões que paralisam',
      ritual_sugerido: 'Meditação no escuro, trabalho com третьее око, revelação de verdades',
    },
    correspondencias: {
      orixa_regente: 'Omolu',
      chakra: '6º Frontal (Ajna)',
      direcao_cardinal: 'Sudoeste',
      estacao: 'Outono',
    },
  },
  'quarto-descrescente': {
    fase: 'quarto-descrescente',
    nome_fase: 'Quarto Descrescente',
    elemento: 'Éter',
    qualidade_elemental: {
      natureza: 'Integradora e reflexiva',
      energia: 'Consolidação do aprendizado, perdão',
      manifesto_em: ['integração', 'perdão', 'sabedoria', 'unidade'],
    },
    significado_espiritual: {
      core: 'A raiz que consolida o que foi aprendido no ciclo',
      aprendizado: 'O perdão liberta mais quem perdoa que quem é perdoado',
      advertencia: 'Ressentimento guarda o que deveria ser solto',
      ritual_sugerido: 'Oração silenciosa, sacramentos, contemplação da natureza',
    },
    correspondencias: {
      orixa_regente: 'Nanã',
      chakra: '7º Coronário (Sahasrara)',
      direcao_cardinal: 'Noroeste',
      estacao: 'Inverno',
    },
  },
  'lua-velha': {
    fase: 'lua-velha',
    nome_fase: 'Lua Velha',
    elemento: 'Éter',
    qualidade_elemental: {
      natureza: 'Ancestral e limiar',
      energia: 'Comunicação entre mundos, sabedoria antiga',
      manifesto_em: ['ancestralidade', 'limiar', 'sabedoria', 'transição'],
    },
    significado_espiritual: {
      core: 'O véu entre ciclos onde a sabedoria dos antigos sussurra',
      aprendizado: 'Os ancestrais guardam respostas para perguntas ainda não formuladas',
      advertencia: 'Obsessão pelo passado impede o novo ciclo de nascer',
      ritual_sugerido: 'Rituais de despedida, oferendas aos mortos, preparo para Lua Nova',
    },
    correspondencias: {
      orixa_regente: 'Omolu',
      chakra: '7º Coronário (Sahasrara)',
      direcao_cardinal: 'Centro',
      estacao: 'Inverno',
    },
  },
};

/**
 * Freeze the mapping object to prevent modifications
 */
Object.freeze(MOON_ELEMENT_MAP);
Object.values(MOON_ELEMENT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Returns the complete moon-element mapping for a given lunar phase.
 * @param fase - The lunar phase identifier (slug format: lua-nova, lua-crescente, etc.)
 * @returns The MoonElementMapping or null if phase not found
 */
export function getMoonElement(fase: string): MoonElementMapping | null {
  const key = fase.toLowerCase().trim();
  if (key in MOON_ELEMENT_MAP) {
    return MOON_ELEMENT_MAP[key as FaseLua] ?? null;
  }
  return null;
}

/**
 * Get the element corresponding to a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The element name or null if not found
 */
export function getElementMoon(fase: string): Elemento | null {
  return getMoonElement(fase)?.elemento ?? null;
}

/**
 * Get all moon-element mappings.
 * @returns Array of all MoonElementMapping
 */
export function getAllMoonElements(): MoonElementMapping[] {
  return Object.values(MOON_ELEMENT_MAP);
}

/**
 * Get the elemental nature for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The elemental nature or null if not found
 */
export function getNaturezaElemental(fase: string): string | null {
  return getMoonElement(fase)?.qualidade_elemental.natureza ?? null;
}

/**
 * Get the spiritual core meaning for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The core spiritual meaning or null if not found
 */
export function getSignificadoCore(fase: string): string | null {
  return getMoonElement(fase)?.significado_espiritual.core ?? null;
}

/**
 * Get the Orixá regente for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The Orixá name or null if not found
 */
export function getOrixaByMoon(fase: string): string | null {
  return getMoonElement(fase)?.correspondencias.orixa_regente ?? null;
}

/**
 * Get the chakra associated with a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The chakra name or null if not found
 */
export function getChakraByMoon(fase: string): string | null {
  return getMoonElement(fase)?.correspondencias.chakra ?? null;
}

/**
 * Get the cardinal direction for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The direction or null if not found
 */
export function getDirecaoByMoon(fase: string): string | null {
  return getMoonElement(fase)?.correspondencias.direcao_cardinal ?? null;
}

/**
 * Get the associated season for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The season or null if not found
 */
export function getEstacaoByMoon(fase: string): string | null {
  return getMoonElement(fase)?.correspondencias.estacao ?? null;
}

/**
 * Get all moon phases for a specific element.
 * @param elemento - The element name
 * @returns Array of MoonElementMapping
 */
export function getMoonsByElement(elemento: string): MoonElementMapping[] {
  return Object.values(MOON_ELEMENT_MAP).filter((m) => m.elemento === elemento);
}

/**
 * Get all available lunar phases.
 * @returns Array of phase identifiers
 */
export function getAvailablePhases(): FaseLua[] {
  return Object.keys(MOON_ELEMENT_MAP) as FaseLua[];
}

/**
 * Get all available elements.
 * @returns Array of unique element names
 */
export function getAvailableElements(): Elemento[] {
  const elements = new Set(Object.values(MOON_ELEMENT_MAP).map((m) => m.elemento));
  return Array.from(elements) as Elemento[];
}