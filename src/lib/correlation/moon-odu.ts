/**
 * Moon-Odú Ifá Spiritual Correlation Module
 * Maps the 8 lunar phases to Odú Ifá (Merindilogun) with spiritual meanings
 * 
 * Based on Cabala dos Caminhos hermetic principles and Ifá lunar correspondences.
 * Each moon phase resonates with specific Odus that carry the energy of that lunar moment.
 */

import type { FaseLua } from './moon-element';

// Re-export FaseLua for convenience
export type { FaseLua } from './moon-element';

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra';

export interface OduCorrespondence {
  /** Odu name in Portuguese */
  odu: string;
  /** Odu number (1-16) */
  numero: number;
  /** Element correspondence */
  elemento: Elemento;
}

export interface MoonOduMapping {
  fase: string;
  nome_fase: string;
  /** Odu regente (primary Odu for this phase) */
  odu_primario: OduCorrespondence;
  /** Odu secundario (secondary/supporting Odu) */
  odu_secundario: OduCorrespondence;
  /** Element alignment */
  elemento: Elemento;
  /** Polarity of this phase-Odu combination */
  polaridade: 'Yang' | 'Yin' | 'Equilibrado';
  /** Spiritual meaning for this moon-odú correlation */
  significado_espiritual: string;
  /** Orixá connected to this correlation */
  orixa: string;
  /** Ritual guidance */
  ritual: {
    tipo: string;
    descricao: string;
  };
  /** Recommended practices */
  praticas: string[];
  /** Sacred colors for this correlation */
  cores: string[];
}

/**
 * Complete mapping of lunar phases to Odú Ifá.
 * Based on traditional Ifá lunar wisdom and Cabala dos Caminhos spiritual system.
 */
export const MOON_ODU_MAPPINGS: Record<FaseLua, MoonOduMapping> = {
  'lua-nova': {
    fase: 'lua-nova',
    nome_fase: 'Lua Nova',
    odu_primario: {
      odu: 'Okaran',
      numero: 1,
      elemento: 'Terra',
    },
    odu_secundario: {
      odu: 'Alafia',
      numero: 16,
      elemento: 'Ar',
    },
    elemento: 'Terra',
    polaridade: 'Yin',
    significado_espiritual:
      'Lua Nova com Okaran traz o poder da semente-planta - a terra que ancora o novo início. Este é o momento de plantar intenções profundas, de enterrar o que precisa morrer para renascer. Okaran ensina que todo começo nasce da escuridão fértil. Omolu rege este momento limiar entre ciclos.',
    orixa: 'Omolu',
    ritual: {
      tipo: 'Plântula de Intenção',
      descricao: 'Rituais de novos começos, assentamentos de intenção, trabalho com ancestrais na escuridão',
    },
    praticas: [
      'Meditação de ancoramento na terra',
      'Plantar sementes de intenção',
      'Trabalho com Omolu para proteção de novos ciclos',
      'Rituais ancestrais na escuridão',
    ],
    cores: ['Preto', 'Marrom', 'Verde escuro'],
  },
  'lua-crescente': {
    fase: 'lua-crescente',
    nome_fase: 'Lua Crescente',
    odu_primario: {
      odu: 'Oxé',
      numero: 5,
      elemento: 'Água',
    },
    odu_secundario: {
      odu: 'Ejiokô',
      numero: 2,
      elemento: 'Ar',
    },
    elemento: 'Água',
    polaridade: 'Yang',
    significado_espiritual:
      'Lua Crescente com Oxé traz o magnetismo da água corrente - a doçura que atrai prosperidade. Este é o momento de abrir caminhos, de utilizar a energia de crescimento para manifestar desejos. Oxé confere o carisma que atrai oportunidades. Iemanjá abençoa esta fase de crescimento.',
    orixa: 'Iemanjá',
    ritual: {
      tipo: 'Abertura de Caminhos',
      descricao: 'Rituais de prosperidade, banhos de Oxé, oferendas aquáticas para abrir trilhas',
    },
    praticas: [
      'Banhos de Oxé (mel e flores)',
      'Rituais de abertura de caminhos',
      'Trabalho com Iemanjá para abundância',
      'Oferendas de frutas na água',
    ],
    cores: ['Azul claro', 'Rosa', 'Verde'],
  },
  'quarto-crescente': {
    fase: 'quarto-crescente',
    nome_fase: 'Quarto Crescente',
    odu_primario: {
      odu: 'Ejilsebora',
      numero: 12,
      elemento: 'Fogo',
    },
    odu_secundario: {
      odu: 'Etaogundá',
      numero: 3,
      elemento: 'Fogo',
    },
    elemento: 'Fogo',
    polaridade: 'Yang',
    significado_espiritual:
      'Quarto Crescente com Ejilsebora traz a força do fogo guerreiro - a coragem de quebrar obstáculos. Este é o momento de ação decisiva, de utilizar a chama interior para superar desafios. Ejilsebora representa a guerra justa e a determinação. Ogum comanda esta energia de conquista.',
    orixa: 'Ogum',
    ritual: {
      tipo: 'Guerra Justa',
      descricao: 'Rituais de defesa, quebra de demandas, ativação da vontade e força de vontade',
    },
    praticas: [
      'Rituais de proteção com Ogum',
      'Quebra de dívidas e bloqueios',
      'Meditação do plexo solar',
      'Trabalho com espadas e ferramentas',
    ],
    cores: ['Vermelho', 'Laranja', 'Amarelo'],
  },
  'lua-cheia': {
    fase: 'lua-cheia',
    nome_fase: 'Lua Cheia',
    odu_primario: {
      odu: 'Ofun',
      numero: 10,
      elemento: 'Água',
    },
    odu_secundario: {
      odu: 'Obará',
      numero: 6,
      elemento: 'Fogo',
    },
    elemento: 'Água',
    polaridade: 'Equilibrado',
    significado_espiritual:
      'Lua Cheia com Ofun traz a cura das águas profundas - o sopro divino que suaviza e renova. Este é o momento de culminação, de gratidão e de alta magia manifestadora. Ofun ensina a paciência sagrada e a sabedoria do silêncio. Oxalá ilumina esta fase de plenitude.',
    orixa: 'Oxalá',
    ritual: {
      tipo: 'Alta Magia',
      descricao: 'Consagrações, rituais de cura, magia de Lua Cheia, trabalho com Oxalá',
    },
    praticas: [
      'Banho de Lua Cheia',
      'Rituais de gratidão',
      'Trabalho com Oxalá para paz',
      'Consagrações de objetos sagrados',
    ],
    cores: ['Branco', 'Prata', 'Azul lunar'],
  },
  'quarto-minguante': {
    fase: 'quarto-minguante',
    nome_fase: 'Quarto Minguante',
    odu_primario: {
      odu: 'Ossá',
      numero: 9,
      elemento: 'Ar',
    },
    odu_secundario: {
      odu: 'Iká',
      numero: 14,
      elemento: 'Terra',
    },
    elemento: 'Ar',
    polaridade: 'Yang',
    significado_espiritual:
      'Quarto Minguante com Ossá traz a transformação rápida do ar - o poder das Iyami Ayo. Este é o momento de limpeza profunda, de sacudir o que não serve mais. Ossá representa as mudanças aceleradas e a magia das bruxas ancestrais. Iansã corta e transforma com seu raio.',
    orixa: 'Iansã',
    ritual: {
      tipo: 'Descarrego',
      descricao: 'Rituais de limpeza, sacudimentos, trabalho com Iansã para cortar e transformar',
    },
    praticas: [
      'Rituais de descarga e limpeza',
      'Banhos de folhas de fumo',
      'Trabalho com Iansã para cortar obstáculos',
      'Sacudimentos energéticos',
    ],
    cores: ['Cinza', 'Lavanda', 'Roxo'],
  },
  'lua-minguante': {
    fase: 'lua-minguante',
    nome_fase: 'Lua Minguante',
    odu_primario: {
      odu: 'Odi',
      numero: 7,
      elemento: 'Água',
    },
    odu_secundario: {
      odu: 'Olobón',
      numero: 13,
      elemento: 'Terra',
    },
    elemento: 'Terra',
    polaridade: 'Yin',
    significado_espiritual:
      'Lua Minguante com Odi traz o poder do poço profundo - a sabedoria oculta das águas transmutadoras. Este é o momento de revelação, de acessar os mistérios escondidos no inconsciente. Odi ensina que nas profundezas escuras habitam as maiores verdades. Omolu guarda estes segredos.',
    orixa: 'Omolu',
    ritual: {
      tipo: 'Revelação',
      descricao: 'Rituais de cura profunda, mergulho no inconsciente, trabalho com Omolu nos mistérios',
    },
    praticas: [
      'Meditação profunda nas águas interiores',
      'Rituais de cura de feridas antigas',
      'Trabalho com Omolu para revelação',
      'Banhos de lama para transmutação',
    ],
    cores: ['Índigo', 'Roxo profundo', 'Preto azulado'],
  },
  'quarto-descrescente': {
    fase: 'quarto-descrescente',
    nome_fase: 'Quarto Descrescente',
    odu_primario: {
      odu: 'Alafia',
      numero: 16,
      elemento: 'Ar',
    },
    odu_secundario: {
      odu: 'Okaran',
      numero: 1,
      elemento: 'Terra',
    },
    elemento: 'Terra',
    polaridade: 'Yin',
    significado_espiritual:
      'Quarto Descrescente com Alafia traz a paz absoluta - o pensamento elevado que equilibra. Este é o momento de integração e perdão, de preparar o terreno para o próximo ciclo. Alafia confirma a proteção dos Deuses e traz harmonia. Nanã oferece sua sabedoria maternal.',
    orixa: 'Nanã',
    ritual: {
      tipo: 'Perdão',
      descricao: 'Rituais de integração, perdão, preparo para novo ciclo, trabalho com Nanã para maturidade',
    },
    praticas: [
      'Rituais de perdão e soltura',
      'Meditação de integração',
      'Trabalho com Nanã para sabedoria',
      'Enterro de mágoas',
    ],
    cores: ['Marrom', 'Lilás', 'Verde musgo'],
  },
  'lua-velha': {
    fase: 'lua-velha',
    nome_fase: 'Lua Velha',
    odu_primario: {
      odu: 'Olobón',
      numero: 13,
      elemento: 'Terra',
    },
    odu_secundario: {
      odu: 'Okaran',
      numero: 1,
      elemento: 'Terra',
    },
    elemento: 'Terra',
    polaridade: 'Equilibrado',
    significado_espiritual:
      'Lua Velha com Olobón traz a sabedoria do fim - a compreensão de que a doença pode ser cura. Este é o momento de despedidas sagradas, de preparar a travessia para o próximo mundo. Olobón ensina que o fim é também começo. Omolu abre as portas da transição.',
    orixa: 'Omolu',
    ritual: {
      tipo: 'Transição',
      descricao: 'Rituais de despedida, fim de ciclos, transição entre mundos, trabalho com Omolu na escuridão',
    },
    praticas: [
      'Rituais de despedida e luto sagrado',
      'Trabalho com Omolu para transição',
      'Comunicação com ancestrais',
      'Descarrego final antes da renovação',
    ],
    cores: ['Preto', 'Cinza escuro', 'Branco spectral'],
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(MOON_ODU_MAPPINGS);
// Freeze nested objects
Object.values(MOON_ODU_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the moon-odú correlation mapping for a given lunar phase.
 * @param fase - The lunar phase identifier (slug format: lua-nova, lua-crescente, etc.)
 * @returns The MoonOduMapping or null if phase not found
 */
export function getMoonOdu(fase: string): MoonOduMapping | null {
  const faseNormalizada = fase.toLowerCase().trim() as FaseLua;
  return MOON_ODU_MAPPINGS[faseNormalizada] || null;
}

/**
 * Get the Odu for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The primary Odu correspondence or null if not found
 */
export function getOduMoon(fase: string): OduCorrespondence | null {
  const mapping = getMoonOdu(fase);
  return mapping?.odu_primario || null;
}

/**
 * Get all moon-odú mappings.
 * @returns Array of all MoonOduMapping
 */
export function getAllMoonOdus(): MoonOduMapping[] {
  return Object.values(MOON_ODU_MAPPINGS);
}

/**
 * Get all available lunar phases.
 * @returns Array of phase identifiers
 */
export function getAvailablePhases(): FaseLua[] {
  return Object.keys(MOON_ODU_MAPPINGS) as FaseLua[];
}

/**
 * Get the secondary Odu for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The secondary Odu correspondence or null if not found
 */
export function getSecondaryOdu(fase: string): OduCorrespondence | null {
  const mapping = getMoonOdu(fase);
  return mapping?.odu_secundario || null;
}

/**
 * Get the element for a given lunar phase from moon-odú mapping.
 * @param fase - The lunar phase identifier
 * @returns The element or null if not found
 */
export function getOduElement(fase: string): Elemento | null {
  const mapping = getMoonOdu(fase);
  return mapping?.elemento || null;
}

/**
 * Get the Orixá for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The Orixá or null if not found
 */
export function getOrixaMoon(fase: string): string | null {
  const mapping = getMoonOdu(fase);
  return mapping?.orixa || null;
}

/**
 * Get the ritual guidance for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The ritual object or null if not found
 */
export function getRitualMoon(fase: string): MoonOduMapping['ritual'] | null {
  const mapping = getMoonOdu(fase);
  return mapping?.ritual || null;
}

/**
 * Get the spiritual meaning for a given lunar phase.
 * @param fase - The lunar phase identifier
 * @returns The spiritual meaning or null if not found
 */
export function getSpiritualMeaning(fase: string): string | null {
  const mapping = getMoonOdu(fase);
  return mapping?.significado_espiritual || null;
}

/**
 * Get all mappings for a specific Odu.
 * @param odu - The Odu name
 * @returns Array of MoonOduMapping where the Odu is primary or secondary
 */
export function getMoonByOdu(odu: string): MoonOduMapping[] {
  return getAllMoonOdus().filter(
    mapping =>
      mapping.odu_primario.odu === odu || mapping.odu_secundario.odu === odu
  );
}

/**
 * Get all mappings for a specific Orixá.
 * @param orixa - The Orixá name
 * @returns Array of MoonOduMapping
 */
export function getMoonByOrixa(orixa: string): MoonOduMapping[] {
  return getAllMoonOdus().filter(mapping => mapping.orixa === orixa);
}

/**
 * Get all mappings for a specific element.
 * @param elemento - The element name
 * @returns Array of MoonOduMapping
 */
export function getMoonByElement(elemento: string): MoonOduMapping[] {
  return getAllMoonOdus().filter(mapping => mapping.elemento === elemento);
}

export default {
  getMoonOdu,
  getOduMoon,
  getAllMoonOdus,
  getAvailablePhases,
  getSecondaryOdu,
  getOduElement,
  getOrixaMoon,
  getRitualMoon,
  getSpiritualMeaning,
  getMoonByOdu,
  getMoonByOrixa,
  getMoonByElement,
  MOON_ODU_MAPPINGS,
};
