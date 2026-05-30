/**
 * Element-Odú Ifá Correlation Mapping
 * Based on IDEIA.md Cabala dos Caminhos spiritual system
 * Aligns the four classical elements with their corresponding Odu Ifá (Merindilogun)
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra';

export interface OduInfo {
  numero: number;
  nome: string;
}

export interface ElementOduMapping {
  /** Element name (Portuguese) */
  elemento: Elemento;
  /** Primary corresponding Odu Ifá */
  odu_principal: OduInfo;
  /** Secondary corresponding Odu(s) */
  odus_secundarios: OduInfo[];
  /** Elemental qualities (hermetic) */
  qualidades: {
    temperatura: 'Quente' | 'Frio' | 'Neutro';
    umidade: 'Seco' | 'Úmido';
    polaridade: 'Yang' | 'Yin' | 'Equilibrado';
  };
  /** Energy alignment description */
  alinhamento_energetico: string;
  /** Spiritual significance */
  significado_espiritual: string;
  /** Orixá correspondent */
  orixa: string;
  /** Sacred day */
  dia_sagrado: string;
  /** Traditional colors */
  cores: string[];
  /** Chakra correspondent */
  chakra: string;
  /** Sephirah correspondence (Cabala) */
  sephirah: string;
  /** Elemental Odú associations */
  associacoes_rituais: {
    ebos: string[];
    elementos: string[];
    direcoes: string[];
    cores: string[];
  };
  /** Spiritual associations */
  associacoes_espirituais: string[];
  /** Affinities with body/mind */
  afinidades: string[];
}

// ─── Element-to-Odú Ifá Mapping ─────────────────────────────────────────────────

export const ELEMENT_ODU_MAPPINGS: Record<Elemento, ElementOduMapping> = {
  Fogo: {
    elemento: 'Fogo',
    odu_principal: {
      numero: 12,
      nome: 'Ejilsebora',
    },
    odus_secundarios: [
      { numero: 6, nome: 'Obará' },
      { numero: 3, nome: 'Etaogundá' },
    ],
    qualidades: {
      temperatura: 'Quente',
      umidade: 'Seco',
      polaridade: 'Yang',
    },
    alinhamento_energetico: 'Quente / Ígneo / Radiante',
    significado_espiritual:
      'O Fogo representa a força vital, a transformação e a purificação. Ejilsebora traz a energia do fogo purificador e da guerra justa. Obará confere brilho pessoal e prosperidade (energia solar). Etaogundá representa a criação de ferramentas e o poder de cortar para construir. O Fogo é o elemento da vontade, da determinação e do brilho interior que transforma o caos em ordem.',
    orixa: 'Xangô',
    dia_sagrado: 'Quarta-feira / Domingo',
    cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    chakra: '3º Plexo Solar',
    sephirah: 'Tiphereth',
    associacoes_rituais: {
      ebos: [
        'Firmezas com pedras de raio (meteoritos/quartzo marrom)',
        'Amalá bem quente com folhas de fumo para Xangô',
        'Oferendas de seis tipos de frutas para Obará',
        'Inhames assados para Etaogundá',
        'Rituais de fogo e purificação',
      ],
      elementos: ['Fogo', 'Ar'],
      direcoes: ['Oeste', 'Centro'],
      cores: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    },
    associacoes_espirituais: [
      'Vitalidade e energia vital',
      'Transformação e purificação',
      'Vontade e determinação',
      'Brilho pessoal e carisma',
      'Fogo sagrado da criação',
      'Justiça divina e equilíbrio',
    ],
    afinidades: [
      'Coração e sistema circulatório',
      'Plexo Solar (Manipura)',
      'Sistema metabólico',
      'Temperamento bilioso',
      'Espírito de liderança',
    ],
  },
  Água: {
    elemento: 'Água',
    odu_principal: {
      numero: 10,
      nome: 'Ofun',
    },
    odus_secundarios: [
      { numero: 5, nome: 'Oxé' },
      { numero: 7, nome: 'Odi' },
    ],
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Úmido',
      polaridade: 'Yin',
    },
    alinhamento_energetico: 'Frio / Receptivo / Profundo',
    significado_espiritual:
      'A Água representa as emoções, a intuição e a sabedoria profunda. Ofun traz o sopro divino e a cura através da paciência e do silêncio. Oxé confere magnetismo, doçura e a energia da feitiçaria natural (magia ritual). Odi conecta ao poço profundo dos mistérios ocultos e à transmutação. A Água é o elemento da sensibilidade, da nutrição e das águas geradoras que sustentam a vida.',
    orixa: 'Iemanjá',
    dia_sagrado: 'Segunda-feira / Sábado',
    cores: ['Azul Escuro', 'Branco', 'Transparente', 'Rosa'],
    chakra: '6º Frontal',
    sephirah: 'Yesod',
    associacoes_rituais: {
      ebos: [
        'Rezas mansas e frutas brancas para Ofun',
        'Banhos de leite de cabra ou ervas calmas',
        'Banhos de mel e caldas de frutas para Oxé',
        'Pipoca (Deburu) para Odi/Omolu',
        'Banhos de lama ou argila para transmutação',
      ],
      elementos: ['Água', 'Terra'],
      direcoes: ['Norte', 'Sul'],
      cores: ['Azul Escuro', 'Branco', 'Rosa', 'Azul-celeste'],
    },
    associacoes_espirituais: [
      'Emoção e sensibilidade',
      'Intuição e sabedoria interior',
      'Maternidade e nutrição',
      'Ciclos e mudanças',
      'Águas profundas do inconsciente',
      'Cura e alívio',
    ],
    afinidades: [
      'Sistema linfático',
      'Chakra Frontal (Ajna)',
      'Sistema hormonal',
      'Temperamento fleumático',
      'Sensibilidade emocional',
    ],
  },
  Ar: {
    elemento: 'Ar',
    odu_principal: {
      numero: 16,
      nome: 'Alafia',
    },
    odus_secundarios: [
      { numero: 2, nome: 'Ejiokô' },
      { numero: 9, nome: 'Ossá' },
    ],
    qualidades: {
      temperatura: 'Neutro',
      umidade: 'Seco',
      polaridade: 'Equilibrado',
    },
    alinhamento_energetico: 'Neutro / Equilibrado / Elevado',
    significado_espiritual:
      'O Ar representa a mente, a comunicação e a transformação espiritual. Alafia traz a paz absoluta e a confirmação dos Deuses, representando o elemento mais elevado do pensamento iluminado. Ejiokô ensina sobre dualidade e os caminhos duplos, equilibrando opostos. Ossá traz as transformações rápidas e o poder feminino das Iyami (bruxas ancestrais). O Ar é o elemento do intelecto, da respiração vital e da flexibilidade que permite adaptação aos ciclos.',
    orixa: 'Oxumaré',
    dia_sagrado: 'Quarta-feira / Terça-feira',
    cores: ['Arco-íris', 'Amarelo', 'Verde', 'Branco'],
    chakra: '5º Laríngeo',
    sephirah: 'Hod',
    associacoes_rituais: {
      ebos: [
        'Flores brancas e oferendas de frutas doces para Alafia',
        'Acentender lâmpadas e velas brancas',
        'Arroz doce para Oxumaré',
        'Oferendas de arco-íris',
        'Sacudimentos com folhas de fumo para Ossá',
      ],
      elementos: ['Ar', 'Fogo'],
      direcoes: ['Leste', 'Centro'],
      cores: ['Arco-íris', 'Amarelo', 'Verde', 'Branco'],
    },
    associacoes_espirituais: [
      'Mente e intelecto',
      'Comunicação e expressão',
      'Flexibilidade e adaptação',
      'Ciclos de transformação',
      'Movimento e respiração',
      'Paz e harmonia',
    ],
    afinidades: [
      'Sistema respiratório',
      'Chakra Laríngeo (Vishuddha)',
      'Sistema nervoso',
      'Temperamento melancólico',
      'Capacidade de comunicação',
    ],
  },
  Terra: {
    elemento: 'Terra',
    odu_principal: {
      numero: 1,
      nome: 'Okaran',
    },
    odus_secundarios: [
      { numero: 13, nome: 'Olobón' },
      { numero: 14, nome: 'Iká' },
    ],
    qualidades: {
      temperatura: 'Frio',
      umidade: 'Seco',
      polaridade: 'Yin',
    },
    alinhamento_energetico: 'Denso / Aterrador / Transformador',
    significado_espiritual:
      'A Terra representa a matéria, a estruturação e os ciclos de vida e morte. Okaran traz o começo difícil, a dúvida e a prova que fortalece a vontade de criar. Olobón conecta à transformação física, às doenças que curam e ao fim de ciclos necessários. Iká revela a sabedoria oculta da serpente, a traição que renova e a capacidade de descascar o velho para revelar o novo. A Terra é o elemento do ancoramento, da paciência e da sabedoria ancestral que sustenta todos os outros.',
    orixa: 'Omolu',
    dia_sagrado: 'Segunda-feira',
    cores: ['Preto', 'Branco', 'Vermelho', 'Preto e Branco'],
    chakra: '1º Básico',
    sephirah: 'Malkuth',
    associacoes_rituais: {
      ebos: [
        'Despachos em encruzilhadas para Okaran',
        'Moedas e pipoca para abrir caminhos',
        'Oferendas na lama ou mangue para Olobón',
        'Ebó com feijão preto e velas lilases',
        'Amarrar fitas coloridas (7 cores) para Iká',
      ],
      elementos: ['Terra', 'Fogo'],
      direcoes: ['Norte', 'Centro'],
      cores: ['Preto', 'Branco', 'Vermelho', 'Lilás'],
    },
    associacoes_espirituais: [
      'Aterramento e estabilidade',
      'Ancestralidade e tradição',
      'Transformação física e cura',
      'Estrutura e fundamentação',
      'Ciclos de vida e morte',
      'Raizes e ancoramento',
    ],
    afinidades: [
      'Sistema ósseo',
      'Chakra Básico (Muladhara)',
      'Sistema digestivo',
      'Temperamento melancólico',
      'Conexão com a natureza',
    ],
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(ELEMENT_ODU_MAPPINGS);
// Freeze nested objects
Object.values(ELEMENT_ODU_MAPPINGS).forEach(mapping => Object.freeze(mapping));

/**
 * Get the element-to-Odú Ifá correlation mapping
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra')
 * @returns The correlation mapping or null if not found
 */
export function getElementOdu(elemento: string): ElementOduMapping | null {
  return ELEMENT_ODU_MAPPINGS[elemento as Elemento] ?? null;
}

/**
 * Get the Odu-to-element reverse mapping
 * @param oduNome - Odu name (e.g., 'Ejilsebora', 'Ofun', 'Alafia', 'Okaran')
 * @returns The element name or null if not found
 */
export function getOduElement(oduNome: string): Elemento | null {
  for (const [, mapping] of Object.entries(ELEMENT_ODU_MAPPINGS)) {
    if (
      mapping.odu_principal.nome === oduNome ||
      mapping.odus_secundarios.some(odu => odu.nome === oduNome)
    ) {
      return mapping.elemento;
    }
  }
  return null;
}

/**
 * Get all available element-Odú mappings
 * @returns Array of all correlation mappings
 */
export function getAllElementOdus(): ElementOduMapping[] {
  return Object.values(ELEMENT_ODU_MAPPINGS);
}

/**
 * Get all element names
 * @returns Array of element names (sorted alphabetically)
 */
export function getAllElements(): Elemento[] {
  return Object.keys(ELEMENT_ODU_MAPPINGS) as Elemento[];
}

/**
 * Check if an element exists in the mapping
 * @param elemento - Element name to check
 * @returns True if element exists in mapping
 */
export function hasElementOdu(elemento: string): boolean {
  return elemento in ELEMENT_ODU_MAPPINGS;
}

/**
 * Get all Odu names for a specific element
 * @param elemento - Element name
 * @returns Array of all Odu names (principal first, then secondary)
 */
export function getOdusForElement(elemento: string): string[] {
  const mapping = ELEMENT_ODU_MAPPINGS[elemento as Elemento];
  if (!mapping) return [];
  return [mapping.odu_principal.nome, ...mapping.odus_secundarios.map(o => o.nome)];
}

/**
 * Get Odu by number
 * @param numero - Odu number (1-16)
 * @returns The element mapping associated with that Odu number, or null if not found
 */
export function getOduByNumber(numero: number): ElementOduMapping | null {
  for (const [, mapping] of Object.entries(ELEMENT_ODU_MAPPINGS)) {
    if (mapping.odu_principal.numero === numero) {
      return mapping;
    }
    if (mapping.odus_secundarios.some(odu => odu.numero === numero)) {
      return mapping;
    }
  }
  return null;
}

export default {
  getElementOdu,
  getOduElement,
  getAllElementOdus,
  getAllElements,
  hasElementOdu,
  getOdusForElement,
  getOduByNumber,
  ELEMENT_ODU_MAPPINGS,
};