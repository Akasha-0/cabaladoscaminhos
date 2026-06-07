/**
 * Orixá-Numerology Correlation Module
 * Correlates Orixás with their sacred numbers 1-13, elements, and spiritual meanings
 * Based on IDEIA.md Cabala dos Caminhos framework
 */

/**
 * Orixá-Numerology correlation for an Orixá
 */
export interface OrixaNumerology {
  /** Orixá name */
  orixa: string;
  /** The sacred number associated (1-13) */
  numero: number;
  /** Element associated with this Orixá */
  elemento: string;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
}

/**
 * Orixá list with their numerological attributes
 */
const ORIXAS_NUMEROLOGY: OrixaNumerology[] = [
  {
    orixa: 'Exu',
    numero: 1,
    elemento: 'Fogo',
    significado_espiritual: 'O Iniciador, O Mensageiro - O começo de tudo, a força primal de criação, o impulso de iniciar e abrir caminhos',
  },
  {
    orixa: 'Okaran',
    numero: 1,
    elemento: 'Fogo',
    significado_espiritual: 'Abertura de caminhos, proteção nas decisões importantes',
  },
  {
    orixa: 'Ibeji',
    numero: 2,
    elemento: 'Água',
    significado_espiritual: 'O Par, Os Gêmeos - A dualidade, os caminhos duplos, a união após grandes lutas e o equilíbrio entre opostos',
  },
  {
    orixa: 'Ejiokô',
    numero: 2,
    elemento: 'Água',
    significado_espiritual: 'Equilíbrio, integração dos opostos, harmonicidade',
  },
  {
    orixa: 'Ogum',
    numero: 3,
    elemento: 'Terra',
    significado_espiritual: 'O Guerreiro, O Criador de Ferramentas - A força física, a criação, a lei e a abertura de caminhos por força de vontade',
  },
  {
    orixa: 'Etaogundá',
    numero: 3,
    elemento: 'Terra',
    significado_espiritual: 'Lei, ordem, disciplina, conquista',
  },
  {
    orixa: 'Iemanjá',
    numero: 4,
    elemento: 'Água',
    significado_espiritual: 'A Mãe, A Estrutura - A estabilidade emocional, a geração, a proteção das raízes e o cuidado maternal',
  },
  {
    orixa: 'Irosun',
    numero: 4,
    elemento: 'Água',
    significado_espiritual: 'Proteção maternal, estabilidade emocional, intuição',
  },
  {
    orixa: 'Oxum',
    numero: 5,
    elemento: 'Água',
    significado_espiritual: 'A Amada, O Ouro - A doçura, a feitiçaria natural, o magnetismo pessoal e a sabedoria adquirida pela experiência',
  },
  {
    orixa: 'Oxé',
    numero: 5,
    elemento: 'Água',
    significado_espiritual: 'Prosperidade, amor, fertilidade, magnetismo',
  },
  {
    orixa: 'Xangô',
    numero: 6,
    elemento: 'Fogo',
    significado_espiritual: 'O Rei, O Justo - A riqueza, a sabedoria, a surpresa e o equilíbrio entre ação e justiça divina',
  },
  {
    orixa: 'Obará',
    numero: 6,
    elemento: 'Fogo',
    significado_espiritual: 'Justiça, equilíbrio, poder, retidão',
  },
  {
    orixa: 'Iansã',
    numero: 7,
    elemento: 'Fogo',
    significado_espiritual: 'A Tempestade, A Transmutadora - Os ventos, as transformações rápidas, a sabedoria oculta e a coragem de atravessar provações',
  },
  {
    orixa: 'Odi',
    numero: 7,
    elemento: 'Fogo',
    significado_espiritual: 'Transformação, coragem, libertação, sabedoria oculta',
  },
  {
    orixa: 'Oxalá',
    numero: 8,
    elemento: 'Éter',
    significado_espiritual: 'O Criador, O Paz - A cabeça (Ori) no topo do mundo, a liderança espiritual, a paz absoluta e o silêncio sagrado',
  },
  {
    orixa: 'EjiOníle',
    numero: 8,
    elemento: 'Éter',
    significado_espiritual: 'Paz interior, comando da mente sobre a matéria, silêncio sagrado',
  },
  {
    orixa: 'Ossá',
    numero: 9,
    elemento: 'Água',
    significado_espiritual: 'O Sábio, O Integrador - A sabedoria além da matéria, a compaixão universal, o fim de ciclos e a iluminação espiritual',
  },
  {
    orixa: 'Ofun',
    numero: 10,
    elemento: 'Terra',
    significado_espiritual: 'O Renovador, A Mudança - A transformação profunda, o retorno ao eixo central, o fim de um ciclo e o começo de outro',
  },
  {
    orixa: 'Alafia',
    numero: 11,
    elemento: 'Éter',
    significado_espiritual: 'O Canalizador, O Desperto - A intuição elevada, a espiritualidade profunda, o alinhamento completo com o divino',
  },
  {
    orixa: 'Orunmilá',
    numero: 11,
    elemento: 'Éter',
    significado_espiritual: 'Intuição, destino, confirmação divina, sabedoria oracular',
  },
  {
    orixa: 'Ejilsebora',
    numero: 12,
    elemento: 'Fogo',
    significado_espiritual: 'A Justiça, O Fogo Purificador - A guerra justa, a transformação por provações, o equilíbrio entre razão e emoção',
  },
  {
    orixa: 'Olobón',
    numero: 13,
    elemento: 'Terra',
    significado_espiritual: 'A Evolução, A Morte e Renascimento - O fim de ciclos, a transformação física e espiritual, o recolhimento para novo começo',
  },
  {
    orixa: 'Nanã',
    numero: 13,
    elemento: 'Terra',
    significado_espiritual: 'Decantação das águas interiores, sabedoria anciã, fim de ciclos',
  },
  {
    orixa: 'Omolu',
    numero: 13,
    elemento: 'Terra',
    significado_espiritual: 'Transformação física e espiritual, saúde, recolhimento',
  },
];

const ORIXA_NUMEROLOGY_MAP: Record<string, OrixaNumerology> = Object.fromEntries(
  ORIXAS_NUMEROLOGY.map((o) => [o.orixa.toLowerCase(), o])
);

/**
 * Returns the Orixá-Numerology correlation for a given Orixá name
 * @param orixa - The Orixá name to look up (case-insensitive)
 * @returns OrixaNumerology object with all correlations
 * @throws Error if Orixá is not found
 */
export function getOrixaNumerology(orixa: string): OrixaNumerology {
  const key = orixa.toLowerCase();
  const result = ORIXA_NUMEROLOGY_MAP[key];
  if (!result) {
    const validOrixas = ORIXAS_NUMEROLOGY.map((o) => o.orixa).join(', ');
    throw new Error(`Orixá não encontrado: "${orixa}". Orixás válidos: ${validOrixas}`);
  }
  return result;
}

/**
 * Get all Orixá-Numerology mappings keyed by Orixá name
 * @returns Record mapping Orixá names to their OrixaNumerology objects
 */
export function getNumerologyOrixa(): Record<string, OrixaNumerology> {
  return { ...ORIXA_NUMEROLOGY_MAP };
}

/**
 * Get all Orixá-Numerology mappings
 * @returns Array of all OrixaNumerology objects
 */
export function getAllOrixaNumerology(): OrixaNumerology[] {
  return [...ORIXAS_NUMEROLOGY].sort((a, b) => a.numero - b.numero);
}
export function getAllOrixaNumerologies(): OrixaNumerology[] {
  return getAllOrixaNumerology();
}
/**
 * Get Orixás filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar, Éter)
 * @returns Array of OrixaNumerology objects matching the element
 */
export function getOrixaByElement(elemento: string): OrixaNumerology[] {
  return getAllOrixaNumerology().filter(
    (m) => m.elemento.toLowerCase() === elemento.toLowerCase()
  );
}

/**
 * Get Orixás filtered by number
 * @param numero - Number to filter by (1-13)
 * @returns Array of OrixaNumerology objects matching the number
 */
export function getOrixaByNumber(numero: number): OrixaNumerology[] {
  return getAllOrixaNumerology().filter((m) => m.numero === numero);
}

/**
 * Get unique elements in the correlation system
 * @returns Array of unique element names
 */
export function getAllElements(): string[] {
  const elements = new Set(ORIXAS_NUMEROLOGY.map((o) => o.elemento));
  return Array.from(elements).sort();
}

/**
 * Get unique numbers in the correlation system
 * @returns Array of unique numbers
 */
export function getAllNumbers(): number[] {
  const numbers = new Set(ORIXAS_NUMEROLOGY.map((o) => o.numero));
  return Array.from(numbers).sort((a, b) => a - b);
}