/**
 * Moon-Element Spiritual Correlation Module
 * Maps the 8 lunar phases to the 5 elements (Fogo, Água, Ar, Terra, Éter)
 * with spiritual qualities and elemental correspondences.
 * 
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
  elemento_primario: Elemento;
  elementos_secundarios: Elemento[];
  qualidades_espirituais: {
    energia: string;
    polaridade: 'Yang' | 'Yin' | 'Equilibrado';
    vibração: string;
    manifesto: string;
  };
  praticas_elementais: {
    meditacao: string[];
    ritual: string[];
    cores: string[];
    cristais: string[];
    aromas: string[];
  };
  orixa_regente: string;
  orixa_secundario: string;
}

/**
 * Complete mapping of lunar phases to elements and spiritual qualities.
 * Derived from lunar elemental alchemy and hermetic correspondences.
 */
export const MOON_ELEMENT_MAPPINGS: Record<FaseLua, MoonElementMapping> = {
  'lua-nova': {
    fase: 'lua-nova',
    nome_fase: 'Lua Nova',
    elemento_primario: 'Terra',
    elementos_secundarios: ['Éter'],
    qualidades_espirituais: {
      energia: 'Receptiva e silenciosa',
      polaridade: 'Yin',
      vibração: 'Semente - potencial adormecido',
      manifesto: 'Intuição profunda, novos inícios, proteção',
    },
    praticas_elementais: {
      meditacao: ['Meditação de земля (terra) - ancoramento', 'Visualização de raízes', 'Conexão com ancestrais'],
      ritual: ['Plântulas de intenciones', 'Cerimônias de novos começos', 'Assentamentos'],
      cores: ['Marrom', 'Preto', 'Verde escuro'],
      cristais: ['Obsidiana', 'Turmalina negra', 'Pedra-mãe'],
      aromas: ['Patchouli', 'Mirra', 'Benjoim'],
    },
    orixa_regente: 'Exu',
    orixa_secundario: 'Omolu',
  },
  'lua-crescente': {
    fase: 'lua-crescente',
    nome_fase: 'Lua Crescente',
    elemento_primario: 'Água',
    elementos_secundarios: ['Terra'],
    qualidades_espirituais: {
      energia: 'Crescente e nutridora',
      polaridade: 'Yang',
      vibração: 'Broto - crescimento vital',
      manifesto: 'Prosperidade, atração, movimento',
    },
    praticas_elementais: {
      meditacao: ['Meditação de água corrente', 'Visualização de chuva fertilizante', 'Lágrimas de alegria'],
      ritual: ['Rituais de abertura de caminhos', 'Banhos de prosperidade', 'Oferendas aquáticas'],
      cores: ['Azul claro', 'Verde', 'Prata'],
      cristais: ['Água-marinha', 'Jade', 'Esmeralda'],
      aromas: ['Jasmim', 'Rosa', 'Verbena'],
    },
    orixa_regente: 'Oxóssi',
    orixa_secundario: 'Ogum',
  },
  'quarto-crescente': {
    fase: 'quarto-crescente',
    nome_fase: 'Quarto Crescente',
    elemento_primario: 'Fogo',
    elementos_secundarios: ['Ar'],
    qualidades_espirituais: {
      energia: 'Ativa e desafiadora',
      polaridade: 'Yang',
      vibração: 'Chama - força transformadora',
      manifesto: 'Coragem, ação, quebra de obstáculos',
    },
    praticas_elementais: {
      meditacao: ['Meditação de ла flamme (fogo)', 'Visualização solar', 'Pranayama de fogo'],
      ritual: ['Rituais de defesa', 'Quebra de demandas', 'Ativação da vontade'],
      cores: ['Vermelho', 'Laranja', 'Amarelo'],
      cristais: ['Rubi', 'Heliólita', 'Ágata de fogo'],
      aromas: ['Canela', 'Gengibre', 'Alecrim'],
    },
    orixa_regente: 'Ogum',
    orixa_secundario: 'Xangô',
  },
  'lua-cheia': {
    fase: 'lua-cheia',
    nome_fase: 'Lua Cheia',
    elemento_primario: 'Água',
    elementos_secundarios: ['Éter'],
    qualidades_espirituais: {
      energia: 'Manifestadora e iluminada',
      polaridade: 'Equilibrado',
      vibração: 'Oceano - plenitude absoluta',
      manifesto: 'Culminação, gratidão, magia Manifesta',
    },
    praticas_elementais: {
      meditacao: ['Meditação sob a lua cheia', 'Banho de luar', 'Lágrimas de libertação'],
      ritual: ['Alta magia de atração', 'Consagrações', 'Rituais de amor e cura'],
      cores: ['Branco', 'Prata', 'Azul lunar'],
      cristais: ['Selenita', 'Quartzo lunar', 'Moldavita'],
      aromas: ['Lavanda', 'Sândalo', 'Lótus'],
    },
    orixa_regente: 'Oxalá',
    orixa_secundario: 'Oxum',
  },
  'quarto-minguante': {
    fase: 'quarto-minguante',
    nome_fase: 'Quarto Minguante',
    elemento_primario: 'Ar',
    elementos_secundarios: ['Fogo'],
    qualidades_espirituais: {
      energia: 'Dissolutiva e libertadora',
      polaridade: 'Yang',
      vibração: 'Vento - dispersão do que não serve',
      manifesto: 'Libertação, purificação, transformação',
    },
    praticas_elementais: {
      meditacao: ['Meditação de ар vent (ar)', 'Pranayama de libertação', 'Sopro de transformação'],
      ritual: ['Rituais de limpeza', 'Descarrego', 'Dissolução de padrões'],
      cores: ['Cinza', 'Lavanda', 'Roxo claro'],
      cristais: ['Amethyst', 'Fluorite', 'Charoíte'],
      aromas: ['Salvia', 'Lavanda', 'Eucalipto'],
    },
    orixa_regente: 'Iansã',
    orixa_secundario: 'Omolu',
  },
  'lua-minguante': {
    fase: 'lua-minguante',
    nome_fase: 'Lua Minguante',
    elemento_primario: 'Éter',
    elementos_secundarios: ['Terra'],
    qualidades_espirituais: {
      energia: 'Transmutadora e reveladora',
      polaridade: 'Yin',
      vibração: 'Fumaça - dissolução no invisível',
      manifesto: 'Revelação de verdades ocultas, cura de feridas antigas',
    },
    praticas_elementais: {
      meditacao: ['Meditação de éter - espaço vazio', 'Visualização de dissolução', 'Silêncio profundo'],
      ritual: ['Rituais de cura profunda', 'Descomplicação kármica', 'Mergulho no inconsciente'],
      cores: ['Índigo', 'Roxo profundo', 'Preto azulado'],
      cristais: ['Amatrolite', 'Lápis-lazúli', 'Charoíte'],
      aromas: ['Incenso de olíbano', 'Mirra', 'Aspa'],
    },
    orixa_regente: 'Omolu',
    orixa_secundario: 'Nanã',
  },
  'quarto-descrescente': {
    fase: 'quarto-descrescente',
    nome_fase: 'Quarto Descrescente',
    elemento_primario: 'Terra',
    elementos_secundarios: ['Água'],
    qualidades_espirituais: {
      energia: 'Integradora e reflexiva',
      polaridade: 'Yin',
      vibração: 'Raiz - consolidação do aprendizado',
      manifesto: 'Integração, perdão, preparação para novo ciclo',
    },
    praticas_elementais: {
      meditacao: ['Meditação de terra fértil', 'Grounding profundo', 'Conexão com a Terra Mãe'],
      ritual: ['Rituais de perdão', 'Enterro de mágoas', 'Sementeira para o próximo ciclo'],
      cores: ['Marrom', 'Creme', 'Verde musgo'],
      cristais: ['Mookaíta', 'Septária', 'Ágata musgo'],
      aromas: ['Ylang-ylang', 'Bergamota', 'Baunilha'],
    },
    orixa_regente: 'Nanã',
    orixa_secundario: 'Iansã',
  },
  'lua-velha': {
    fase: 'lua-velha',
    nome_fase: 'Lua Velha',
    elemento_primario: 'Éter',
    elementos_secundarios: ['Ar'],
    qualidades_espirituais: {
      energia: 'Ancestral e limiar',
      polaridade: 'Equilibrado',
      vibração: 'Limiar - entre mundos',
      manifesto: 'Comunicação com ancestrais, sabedoria dos antigos, preparo para renascimento',
    },
    praticas_elementais: {
      meditacao: ['Meditação de limiar', 'Viagem xamânica', 'Comunicação ancestral'],
      ritual: ['Rituais de descarrego final', 'Despedidas', 'Transição entre ciclos'],
      cores: ['Preto', 'Cinza escuro', 'Branco spectral'],
      cristais: ['Obsidiana', 'Shungite', 'Turmalina negra'],
      aromas: ['Absinto', 'Artemísia', 'Lavanda seca'],
    },
    orixa_regente: 'Omolu',
    orixa_secundario: 'Exu',
  },
};

/**
 * Returns the complete moon-element mapping for a given lunar phase.
 * @param fase - The lunar phase identifier (slug format: lua-nova, lua-crescente, etc.)
 * @returns The MoonElementMapping or null if phase not found
 */
export function getMoonElement(fase: string): MoonElementMapping | null {
  const faseNormalizada = fase.toLowerCase().trim() as FaseLua;
  return MOON_ELEMENT_MAPPINGS[faseNormalizada] || null;
}

/**
 * Get the primary element for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The primary element or null if not found
 */
export function getElementMoon(fase: string): Elemento | null {
  const mapping = getMoonElement(fase);
  return mapping?.elemento_primario || null;
}

/**
 * Get secondary elements for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns Array of secondary elements or null if not found
 */
export function getSecondaryElements(fase: string): Elemento[] | null {
  const mapping = getMoonElement(fase);
  return mapping?.elementos_secundarios || null;
}

/**
 * Get spiritual qualities for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The spiritual qualities or null if not found
 */
export function getSpiritualQualities(fase: string): MoonElementMapping['qualidades_espirituais'] | null {
  const mapping = getMoonElement(fase);
  return mapping?.qualidades_espirituais || null;
}

/**
 * Get elemental practices for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The elemental practices or null if not found
 */
export function getElementalPractices(fase: string): MoonElementMapping['praticas_elementais'] | null {
  const mapping = getMoonElement(fase);
  return mapping?.praticas_elementais || null;
}

/**
 * Get the Orixá regente for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The Orixá regente or null if not found
 */
export function getOrixaRegente(fase: string): string | null {
  const mapping = getMoonElement(fase);
  return mapping?.orixa_regente || null;
}

/**
 * Get all moon-element mappings.
 * @returns Array of all MoonElementMapping
 */
export function getAllMoonElements(): MoonElementMapping[] {
  return Object.values(MOON_ELEMENT_MAPPINGS);
}

/**
 * Get all available lunar phases.
 * @returns Array of phase identifiers
 */
export function getAvailablePhases(): FaseLua[] {
  return Object.keys(MOON_ELEMENT_MAPPINGS) as FaseLua[];
}

/**
 * Get all mappings for a specific element.
 * @param elemento - The element to filter by
 * @returns Array of MoonElementMapping where the element is primary
 */
export function getMoonByElement(elemento: string): MoonElementMapping[] {
  return getAllMoonElements().filter(
    (mapping) =>
      mapping.elemento_primario === elemento ||
      mapping.elementos_secundarios.includes(elemento as Elemento)
  );
}

/**
 * Get the element mapping for a given Orixá.
 * Useful for correlating moon-element-orixá chains.
 * @param orixa - The Orixá name
 * @returns The MoonElementMapping or null if not found
 */
export function getElementByOrixa(orixa: string): MoonElementMapping | null {
  return getAllMoonElements().find(
    (mapping) =>
      mapping.orixa_regente === orixa || mapping.orixa_secundario === orixa
  ) || null;
}

/**
 * Get polarity energy for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The polarity or null if not found
 */
export function getPolarity(fase: string): 'Yang' | 'Yin' | 'Equilibrado' | null {
  const mapping = getMoonElement(fase);
  return mapping?.qualidades_espirituais.polaridade || null;
}