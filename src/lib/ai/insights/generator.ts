/**
 * AI Insights Generator
 * Generates spiritual insights across multiple traditions with consistent output format.
 *
 * Supported traditions: Odu Ifá, Tarot, Cabala (Sephirot), Orixás
 * Output format (InsightResult):
 *   - title: string
 *   - description: string
 *   - correlations: string[] (connected traditions)
 *   - action: string (recommended ritual/practice)
 *   - frequency: string (if applicable)
 */

import { traditionMapper, ODU_MAPPINGS, TAROT_MAJOR_MAPPINGS, SEPHIROT_MAPPINGS } from '../tradition-mapper';
// fallow-ignore-next-line unresolved-import
import { getDataByCategory } from '../../spiritual-data/spiritual-data'

// ============================================================
// TYPES
// ============================================================

export type SupportedTradition = 'odu' | 'tarot' | 'cabala' | 'orixa';

export interface InsightResult {
  title: string;
  description: string;
  correlations: string[];
  action: string;
  frequency: string;
}

export interface GenerateInsightParams {
  identifier: string | number;
  tradition?: SupportedTradition;
  userContext?: {
    nome?: string;
    dataNascimento?: string;
  };
}

export interface InsightError {
  error: string;
  tradition: SupportedTradition;
  identifier: string | number;
}

// ============================================================
// TRADITION-SPECIFIC INSIGHT GENERATORS
// ============================================================

/**
 * Generate insight for an Odu Ifá
 */
function generateOduInsight(identifier: string): InsightResult {
  const mapping = ODU_MAPPINGS[identifier];

  if (!mapping) {
    return createFallbackInsight(`Odú ${identifier}`, [
      'Consulte um babalawo para orientação especializada'
    ]);
  }

  const correlations: string[] = [
    `Tarot: Arcano ${mapping.tarot.join(', ')}`,
    `Sephirot: ${mapping.sephirot.join(', ')}`,
    `Orixás: ${mapping.orixa.join(', ')}`,
    `Planeta: ${mapping.planeta}`,
    `Elemento: ${mapping.elemento}`,
    `Dia: ${mapping.dia}`,
    `Chakra: ${mapping.chakra}`,
    `Signo: ${mapping.signo}`,
  ];

  const action = generateOduAction(identifier, mapping);

  return {
    title: `${identifier} - ${mapping.descricao.split(' - ')[0] || 'Odú Ifá'}`,
    description: mapping.descricao,
    correlations,
    action,
    frequency: mapping.planeta ? getPlanetaryFrequency(mapping.planeta) : '',
  };
}

/**
 * Generate ritual/practice recommendation for an Odu
 */
function generateOduAction(odu: string, mapping: typeof ODU_MAPPINGS[string]): string {
  const elementActions: Record<string, string> = {
    'Fogo': 'Acenda uma vela vermelha e medite sobre sua vontade interior',
    'Água': 'Faça um ritual de limpeza com água sagrada e sal grosso',
    'Ar': 'Pratique respirações profundas em local ventilado, preferring flow',
    'Terra': 'Conecte-se com a terra tocando-a com as mãos descalças',
  };

  const baseAction = elementActions[mapping.elemento] || 'Reserve um momento em silêncio para reflexão';

  const oduRituals: Record<string, string> = {
    'Ogbe': 'Inicie novos projetos com oração ao Criador',
    'Oyeku': 'Estude textos sagrados e pratique a escuta interior',
    'Iwori': 'Comunique suas verdades com sabedoria e clareza',
    'Odi': 'Honre a fertilidade de seus pensamentos e projetos',
    'Irosun': 'Estabeleça disciplina em sua prática espiritual',
    'Oxossi': 'Busque conhecimento através de um guia espiritual',
    'Obatala': 'Faça escolhas alinhadas com sua essência pura',
    'Ogun': 'Realize um trabalho de proteção e fortalecimento',
    'Ogunda': 'Atue com coragem e precisão em seus propósitos',
    'Osa': 'Busque a iluminação através da introspecção',
    'Ofun': 'Abrace as mudanças como parte de seu destino',
    'Oni': 'Pratique a verdade e a justiça em suas ações',
    'Meji': 'Aceite novos aprendizados com abertura',
    'Ika': 'Permita que velhas estruturas se transformem',
    'Ikate': 'Pratique o equilíbrio e a paciência em todas as coisas',
    'Ikite': 'Reconheça suas sombras para transmutá-las',
  };

  const specificRitual = oduRituals[odu] || baseAction;
  return `${specificRitual}. Dia propício: ${mapping.dia}. Elemento: ${mapping.elemento}`;
}

/**
 * Generate insight for a Tarot Major Arcana card
 */
function generateTarotInsight(identifier: number): InsightResult {
  const mapping = TAROT_MAJOR_MAPPINGS[identifier];

  if (!mapping) {
    return createFallbackInsight(`Arcanum ${identifier}`, [
      'Consulte uma interpretação personalizada do baralho'
    ]);
  }

  const cardNames: Record<number, string> = {
    0: 'O Louco', 1: 'O Mago', 2: 'A Alta Sacerdotisa', 3: 'A Imperatriz',
    4: 'O Imperador', 5: 'O Hierofante', 6: 'Os Enamorados', 7: 'O Carro',
    8: 'A Força', 9: 'O Eremita', 10: 'A Roda da Fortuna', 11: 'A Justiça',
    12: 'O Enforcado', 13: 'A Morte', 14: 'A Temperança', 15: 'O Diabo',
    16: 'A Torre', 17: 'A Estrela', 18: 'A Lua', 19: 'O Sol',
    20: 'O Julgamento', 21: 'O Mundo',
  };

  const correlations: string[] = [
    `Odú: ${mapping.odu.join(', ')}`,
    `Sephirah: ${mapping.sephirot}`,
    `Orixás: ${mapping.orixa.join(', ')}`,
    `Planeta: ${mapping.planeta}`,
    `Elemento: ${mapping.elemento}`,
    `Chakra: ${mapping.chakra}`,
  ];

  const action = generateTarotAction(identifier, mapping);

  return {
    title: `${cardNames[identifier] || `Arcano ${identifier}`} - ${mapping.descricao.split(' - ')[0]}`,
    description: mapping.descricao,
    correlations,
    action,
    frequency: mapping.planeta ? getPlanetaryFrequency(mapping.planeta) : '',
  };
}

/**
 * Generate ritual/practice recommendation for a Tarot card
 */
function generateTarotAction(
  _arcanaNumber: number,
  mapping: typeof TAROT_MAJOR_MAPPINGS[number]
): string {
  const elementActions: Record<string, string> = {
    'Fogo': 'Ative sua energia com movimentos conscientes e vigorosos',
    'Água': 'Permita que emoções fluam através de práticas de water ritual',
    'Ar': 'Exprima sua voz através de cantos ou recitações sagradas',
    'Terra': 'Ancore-se com práticas de gardenwork ou caminhada na natureza',
  };

  const elementAction = elementActions[mapping.elemento] || 'Medite sobre o arcano';
  return `${elementAction}. Chakra associado: ${mapping.chakra}. Orixás de força: ${mapping.orixa.join(', ')}`;
}

/**
 * Generate insight for a Sephirah (Cabala)
 */
function generateCabalaInsight(identifier: string): InsightResult {
  const mapping = SEPHIROT_MAPPINGS[identifier];

  if (!mapping) {
    return createFallbackInsight(`Sephirah ${identifier}`, [
      'Consulte um professor de Cabala para orientação'
    ]);
  }

  const correlations: string[] = [
    `Planeta: ${mapping.planeta}`,
    `Signo: ${mapping.signo}`,
    `Orixás: ${mapping.orixa.join(', ')}`,
    `Elemento: ${mapping.elemento}`,
    `Chakra: ${mapping.chakra}`,
    `Caminhos: ${mapping.caminho.join(', ')}`,
  ];

  const action = generateCabalaAction(identifier, mapping);

  return {
    title: `${identifier} - ${mapping.descricao.split(' - ')[0] || 'Sephirah'}`,
    description: mapping.descricao,
    correlations,
    action,
    frequency: mapping.planeta ? getPlanetaryFrequency(mapping.planeta) : '',
  };
}

/**
 * Generate ritual/practice recommendation for a Sephirah
 */
function generateCabalaAction(
  sephirah: string,
  mapping: typeof SEPHIROT_MAPPINGS[string]
): string {
  const sephirahPractices: Record<string, string> = {
    'Keter': 'Medite na coroa invisível acima da cabeça, conectando-se à vontade divina',
    'Chokhmah': 'Contemple o primeiro raio de luz da criação em meditação matinal',
    'Binah': 'Pratique o jejum simbólico ou abstinência para purificar o entendimento',
    'Chesed': 'Realize atos de misericórdia e gentileza para com os outros',
    'Gevurah': 'Estabeleça limites sagrados e pratica a disciplina espiritual',
    'Tipheret': 'Busque a harmonia através de práticas de equilíbrio interno',
    'Netzach': 'Celebre a vitória com rituais de gratidão e alegria',
    'Hod': 'Honre a glória através da comunicação sagrada e estudo',
    'Yesod': 'Conecte-se ao mundo astral através de visualizações da lua',
    'Malkuth': 'Ancore-se na terra com práticas de gratidão pela материю',
  };

  const specificPractice = sephirahPractices[sephirah] || `Medite sobre ${sephirah}`;
  return `${specificPractice}. Elemento: ${mapping.elemento}. Signo: ${mapping.signo}. Planeta: ${mapping.planeta}`;
}

/**
 * Generate insight for an Orixá
 */
// fallow-ignore-next-line complexity
function generateOrixaInsight(identifier: string): InsightResult {
  // Normalize identifier (handle case variations)
  const normalizedName = normalizeOrixaName(identifier);

  // Try to find orixa data in spiritual-data
  const orixaDataList = getDataByCategory('orixa');
  const orixaData = orixaDataList.find(
    o => o.name.toLowerCase() === normalizedName.toLowerCase() ||
         o.name.toLowerCase().includes(normalizedName.toLowerCase())
  );

  // Also check tradition-mapper for cross-references
  const crossRefs = findOrixaCrossReferences(normalizedName);

  const correlations: string[] = [];

  if (crossRefs.odu.length > 0) {
    correlations.push(`Odús: ${crossRefs.odu.join(', ')}`);
  }
  if (crossRefs.tarot.length > 0) {
    correlations.push(`Tarot: ${crossRefs.tarot.join(', ')}`);
  }
  if (crossRefs.sephirot.length > 0) {
    correlations.push(`Sephirot: ${crossRefs.sephirot.join(', ')}`);
  }
  if (crossRefs.planet) {
    correlations.push(`Planeta: ${crossRefs.planet}`);
  }

  // Get orixa-specific practices from spiritual-data
  let action = 'Consulte um especialista desta tradição para orientação específica';
  let frequency = '';

  if (orixaData?.properties) {
    const props = orixaData.properties;
    if (props.planet) {
      frequency = getPlanetaryFrequency(props.planet);
    }
    if (props.chakraTarget) {
      action = `Ritual de proteção e alinhamento. Chakra alvo: ${props.chakraTarget}`;
    }
  }

  // Try to find matching data in ODU_MAPPINGS for additional context
  for (const [, oduMapping] of Object.entries(ODU_MAPPINGS)) {
    if (oduMapping.orixa.some(o => normalizeOrixaName(o) === normalizedName)) {
      if (oduMapping.planeta && !frequency) {
        frequency = getPlanetaryFrequency(oduMapping.planeta);
      }
      break;
    }
  }

  return {
    title: normalizedName,
    description: orixaData?.description || `Orixá ${normalizedName} - busque orientação com um sacerdote`,
    correlations,
    action,
    frequency,
  };
}

// ============================================================
// UTILITIES
// ============================================================

/**
 * Normalize orixá name for consistent lookup
 */
function normalizeOrixaName(name: string): string {
  const normalizationMap: Record<string, string> = {
    'xangô': 'Xangô', 'shango': 'Xangô', 'xango': 'Xangô',
    'ogum': 'Ogum', 'ogun': 'Ogum',
    'iemanja': 'Iemanjá', 'yemaja': 'Iemanjá', 'yemanjá': 'Iemanjá',
    'oxum': 'Oxum',
    'obatala': 'Obatalá', 'obatalá': 'Obatalá',
    'ioruba': 'Olodumare',
    'olodumare': 'Olodumare', 'olodumaré': 'Olodumare',
    'oxossi': 'Oxossi', 'oxos': 'Oxossi',
    'nanã': 'Nanã', 'nanã buruquê': 'Nanã',
    'iansã': 'Iansã', 'iansan': 'Iansã', 'oyá': 'Iansã',
    'omulu': 'Omulu', 'obaluaiê': 'Omulu', 'obaluaê': 'Omulu',
    'eshu': 'Eshu', 'exu': 'Eshu',
    'oxumar': 'Oxumar',
  };

  const lower = name.toLowerCase().trim();
  return normalizationMap[lower] || name;
}

/**
 * Find cross-references for an orixá across traditions
 */
function findOrixaCrossReferences(orixaName: string): {
  odu: string[];
  tarot: number[];
  sephirot: string[];
  planet?: string;
} {
  const result = { odu: [] as string[], tarot: [] as number[], sephirot: [] as string[], planet: undefined as string | undefined };

  // Search ODU_MAPPINGS
  for (const [oduName, mapping] of Object.entries(ODU_MAPPINGS)) {
    if (mapping.orixa.some(o => normalizeOrixaName(o) === orixaName)) {
      result.odu.push(oduName);
      if (mapping.planeta && !result.planet) {
        result.planet = mapping.planeta;
      }
    }
  }

  // Search TAROT_MAJOR_MAPPINGS
  for (const [arcanoStr, mapping] of Object.entries(TAROT_MAJOR_MAPPINGS)) {
    if (mapping.orixa.some(o => normalizeOrixaName(o) === orixaName)) {
      result.tarot.push(parseInt(arcanoStr, 10));
    }
  }

  // Search SEPHIROT_MAPPINGS
  for (const [sephirah, mapping] of Object.entries(SEPHIROT_MAPPINGS)) {
    if (mapping.orixa.some(o => normalizeOrixaName(o) === orixaName)) {
      result.sephirot.push(sephirah);
      if (mapping.planeta && !result.planet) {
        result.planet = mapping.planeta;
      }
    }
  }

  return result;
}

/**
 * Get planetary frequency (Solfeggio-based approximation)
 */
function getPlanetaryFrequency(planet: string): string {
  const planetaryFrequencies: Record<string, string> = {
    'Sol': '528 Hz - Frequência do amor e regeneração',
    'Lua': '396 Hz - Libertação de medos e culpas',
    'Mercúrio': '417 Hz - Facilitação da mudança',
    'Vênus': '528 Hz - Harmonia e relacionamentos',
    'Marte': '639 Hz - Harmonia em conflitos',
    'Júpiter': '741 Hz - Despertar da intuição',
    'Saturno': '396 Hz - Transformação e limites',
    'Plutão': '963 Hz - Conexão com o divino',
    'Terra': '432 Hz - Harmonia com a natureza',
    'Netuno': '852 Hz - Despertar da consciência',
    'Urano': '639 Hz - Liberdade e originalidade',
  };

  return planetaryFrequencies[planet] || '432 Hz - Frequência base de harmonia';
}

/**
 * Create a fallback insight when no mapping is found
 */
function createFallbackInsight(
  identifier: string,
  actions: string[]
): InsightResult {
  return {
    title: `${identifier} - Insight Espiritual`,
    description: 'Esta energia ainda não possui mapeamento completo em nosso sistema. Busque orientação com um especialista desta tradição.',
    correlations: [],
    action: actions.join('. ') || 'Pratique a introspecção e meditação',
    frequency: '',
  };
}

// ============================================================
// MAIN API
// ============================================================

/**
 * Main function to generate insight for a specific tradition
 *
 * @param tradition - One of: 'odu', 'tarot', 'cabala', 'orixa'
 * @param params - Object containing:
 *   - identifier: string | number (depends on tradition)
 *   - userContext?: { nome?: string; dataNascimento?: string }
 *
 * @returns InsightResult with consistent format:
 *   - title: string
 *   - description: string
 *   - correlations: string[]
 *   - action: string
 *   - frequency: string
 */
export function generateInsight(
  tradition: SupportedTradition,
  params: GenerateInsightParams
): InsightResult {
  const { identifier, userContext } = params;

  try {
    switch (tradition) {
      case 'odu':
        return generateOduInsight(String(identifier));

      case 'tarot':
        const arcanoNum = typeof identifier === 'number' ? identifier : parseInt(String(identifier), 10);
        if (isNaN(arcanoNum) || arcanoNum < 0 || arcanoNum > 21) {
          return createFallbackInsight(`Arcano ${identifier}`, ['Verifique o número do arcano (0-21)']);
        }
        return generateTarotInsight(arcanoNum);

      case 'cabala':
        const normalizedSephirah = normalizeSephirahName(String(identifier));
        return generateCabalaInsight(normalizedSephirah);

      case 'orixa':
        return generateOrixaInsight(String(identifier));

      default:
        return createFallbackInsight(`${tradition}:${identifier}`, [
          'Tradição não reconhecida',
          'Use: odu, tarot, cabala, orixa'
        ]);
    }
  } catch (error) {
    console.error(`[InsightGenerator] Error generating ${tradition} insight for ${identifier}:`, error);
    return createFallbackInsight(`${tradition}:${identifier}`, [
      'Erro ao processar Insight',
      'Tente novamente mais tarde'
    ]);
  }
}

/**
 * Normalize Sephirah name
 */
function normalizeSephirahName(name: string): string {
  const normalizationMap: Record<string, string> = {
    'keter': 'Keter', 'kéter': 'Keter',
    'chokhmah': 'Chokhmah', 'chokmá': 'Chokhmah', 'cohmah': 'Chokhmah',
    'binah': 'Binah', 'biná': 'Binah',
    'chesed': 'Chesed', 'cheséd': 'Chesed',
    'gevurah': 'Gevurah', 'gevurá': 'Gevurah', 'geburah': 'Gevurah',
    'tipheret': 'Tipheret', 'tiferet': 'Tipheret', 'tiphéret': 'Tipheret',
    'netzach': 'Netzach', 'netsach': 'Netzach',
    'hod': 'Hod',
    'yesod': 'Yesod', 'iésod': 'Yesod',
    'malkuth': 'Malkuth', 'malcut': 'Malkuth', 'malcuth': 'Malkuth',
  };

  const lower = name.toLowerCase().trim();
  return normalizationMap[lower] || name;
}

/**
 * Batch generate insights for multiple traditions
 */
export function generateMultiTraditionInsight(
  identifiers: GenerateInsightParams[]
): InsightResult[] {
  return identifiers.map(params => generateInsight(params.tradition || 'odu' as SupportedTradition, params));
}

/**
 * Get available identifiers for a tradition
 */
export function getAvailableIdentifiers(tradition: SupportedTradition): string[] {
  switch (tradition) {
    case 'odu':
      return Object.keys(ODU_MAPPINGS);

    case 'tarot':
      return Object.keys(TAROT_MAJOR_MAPPINGS).map(n => `Arcano ${n}`);

    case 'cabala':
      return Object.keys(SEPHIROT_MAPPINGS);

    case 'orixa':
      // Gather all orixás from mappings
      const orixas = new Set<string>();
      for (const mapping of Object.values(ODU_MAPPINGS)) {
        mapping.orixa.forEach(o => orixas.add(normalizeOrixaName(o)));
      }
      for (const mapping of Object.values(TAROT_MAJOR_MAPPINGS)) {
        mapping.orixa.forEach(o => orixas.add(normalizeOrixaName(o)));
      }
      for (const mapping of Object.values(SEPHIROT_MAPPINGS)) {
        mapping.orixa.forEach(o => orixas.add(normalizeOrixaName(o)));
      }
      return Array.from(orixas).sort();

    default:
      return [];
  }
}

// ============================================================
// RE-EXPORTS FROM TRADITION-MAPPER
// ============================================================
export { traditionMapper, ODU_MAPPINGS, TAROT_MAJOR_MAPPINGS, SEPHIROT_MAPPINGS } from '../tradition-mapper';
