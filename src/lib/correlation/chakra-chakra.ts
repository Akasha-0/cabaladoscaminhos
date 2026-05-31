/**
 * Chakra-Chakra Spiritual Correlation
 * Maps the paths between the 7 chakras (Muladhara to Sahasrara) in the Kundalini system.
 * Includes Ida, Pingala, Sushumna nadis and inter-chakra relationships.
 * 
 * Based on Cabala dos Caminhos hermetic principles.
 */

export type ChakraName = 
  | 'Muladhara'
  | 'Svadhisthana'
  | 'Manipura'
  | 'Anahata'
  | 'Vishuddha'
  | 'Ajna'
  | 'Sahasrara';

export type PathType = 
  | 'sushumna'      // Central channel - pure consciousness
  | 'ida'           // Left channel - lunar, cooling, feminine
  | 'pingala'       // Right channel - solar, heating, masculine
  | 'ida_pingala'   // Combined ida+pingala balance
  | 'direct'        // Direct path between adjacent chakras
  | 'kundalini';   // Kundalini awakening path through all chakras

export interface ChakraChakraMapping {
  source_chakra: ChakraName;
  target_chakra: ChakraName;
  path_type: PathType;
  spiritual_meaning: string;
  energy_flow: string;
  practices: string[];
}

/**
 * Complete mapping of chakra-to-chakra paths in the Kundalini system.
 * Covers the three main nadis (Ida, Pingala, Sushumna) and key inter-chakra relationships.
 */
export const CHAKRA_CHAKRA_MAPPINGS: ChakraChakraMapping[] = [
  // Sushumna - Central channel (ascending pure consciousness)
  {
    source_chakra: 'Muladhara',
    target_chakra: 'Svadhisthana',
    path_type: 'sushumna',
    spiritual_meaning: 'Ascension from base survival to creative fluidity; grounding transforms into emotional flow',
    energy_flow: 'Ascendente - Terra para Água',
    practices: ['Meditação de ancoramento', 'Pranayama dasarana'],
  },
  {
    source_chakra: 'Svadhisthana',
    target_chakra: 'Manipura',
    path_type: 'sushumna',
    spiritual_meaning: 'Emotional transformation into personal power; feelings become will',
    energy_flow: 'Ascendente - Água para Fogo',
    practices: ['Pranayama agni sara', 'Visualização de energia ascendente'],
  },
  {
    source_chakra: 'Manipura',
    target_chakra: 'Anahata',
    path_type: 'sushumna',
    spiritual_meaning: 'Personal power transforms into unconditional love; willpower becomes compassion',
    energy_flow: 'Ascendente - Fogo para Ar',
    practices: ['Anahata mantra YAM', 'Prática de compaixão'],
  },
  {
    source_chakra: 'Anahata',
    target_chakra: 'Vishuddha',
    path_type: 'sushumna',
    spiritual_meaning: 'Heart-centered love expresses as authentic truth; compassion becomes communication',
    energy_flow: 'Ascendente - Ar para Ar (purificação)',
    practices: ['Pranayama do som', 'Japa do mantra HAM'],
  },
  {
    source_chakra: 'Vishuddha',
    target_chakra: 'Ajna',
    path_type: 'sushumna',
    spiritual_meaning: 'Truth speaking opens third eye; communication becomes clear perception',
    energy_flow: 'Ascendente - Ar para Éter',
    practices: ['Meditação no terceiro olho', 'Trataka'],
  },
  {
    source_chakra: 'Ajna',
    target_chakra: 'Sahasrara',
    path_type: 'sushumna',
    spiritual_meaning: 'Intuition merges with divine consciousness; perception becomes unity',
    energy_flow: 'Ascendente - Éter para Transcendência',
    practices: ['Samadhi meditation', 'Shiva pranayama'],
  },

  // Ida nadi - Left lunar channel (feminine, cooling, receptive)
  {
    source_chakra: 'Muladhara',
    target_chakra: 'Svadhisthana',
    path_type: 'ida',
    spiritual_meaning: 'Lunar path of emotional nurturing and feminine receptive energy; survival instinct softens',
    energy_flow: 'Esquerda - Energia lunar cooling',
    practices: ['Nadi shodhana (início)', 'Chandra pranayama', 'Meditação lunar'],
  },
  {
    source_chakra: 'Svadhisthana',
    target_chakra: 'Anahata',
    path_type: 'ida',
    spiritual_meaning: 'Creative emotional energy flows to heart; lunar emotional intelligence develops',
    energy_flow: 'Esquerda - Fluidez emocional',
    practices: ['Yoga lunar', 'Nadi shodhana (meio)', 'Visualização de energia esquerda'],
  },
  {
    source_chakra: 'Anahata',
    target_chakra: 'Vishuddha',
    path_type: 'ida',
    spiritual_meaning: 'Heart love expressed through lunar speech; compassionate communication flows',
    energy_flow: 'Esquerda - Expressão amorosa',
    practices: ['Pranayama lunar', 'Chant deOM lunar', 'Satsanga'],
  },
  {
    source_chakra: 'Vishuddha',
    target_chakra: 'Ajna',
    path_type: 'ida',
    spiritual_meaning: 'Lunar wisdom through speech becomes intuitive knowing; moon energy governs perception',
    energy_flow: 'Esquerda - Sabedoria intuitiva',
    practices: ['Meditação no lado esquerdo', 'Pranayama nadi shodhana'],
  },
  {
    source_chakra: 'Ajna',
    target_chakra: 'Sahasrara',
    path_type: 'ida',
    spiritual_meaning: 'Lunar intuition dissolves into cosmic consciousness; feminine wisdom attains liberation',
    energy_flow: 'Esquerda - Dissolução lunar',
    practices: ['Yoga nidra', 'Meditação da lua interior'],
  },

  // Pingala nadi - Right solar channel (masculine, heating, active)
  {
    source_chakra: 'Muladhara',
    target_chakra: 'Manipura',
    path_type: 'pingala',
    spiritual_meaning: 'Solar path of personal power and active transformation; survival instinct becomes will',
    energy_flow: 'Direita - Energia solar heating',
    practices: ['Kapalabhati', 'Surya pranayama', 'Fogo interno visualization'],
  },
  {
    source_chakra: 'Manipura',
    target_chakra: 'Anahata',
    path_type: 'pingala',
    spiritual_meaning: 'Personal power expressed as active compassion; solar strength serves heart',
    energy_flow: 'Direita - Poder cardíaco',
    practices: ['Pranayama surya', 'Fire walking', 'Agni sara'],
  },
  {
    source_chakra: 'Anahata',
    target_chakra: 'Vishuddha',
    path_type: 'pingala',
    spiritual_meaning: 'Heart power expressed through solar speech; active truth emerges',
    energy_flow: 'Direita - Verdade ativa',
    practices: ['Pranayama surya bhedana', 'Poder da palavra'],
  },
  {
    source_chakra: 'Vishuddha',
    target_chakra: 'Ajna',
    path_type: 'pingala',
    spiritual_meaning: 'Solar speech activates third eye; active perception and insight arise',
    energy_flow: 'Direita - Visão ativa',
    practices: ['Pranayama right nostril', ' Trataka solar', 'Meditation'],
  },
  {
    source_chakra: 'Ajna',
    target_chakra: 'Sahasrara',
    path_type: 'pingala',
    spiritual_meaning: 'Solar insight merges with cosmic light; masculine clarity achieves illumination',
    energy_flow: 'Direita - Iluminação solar',
    practices: ['Surya dhyana', 'Pranayama surya'],
  },

  // Ida-Pingala balance path
  {
    source_chakra: 'Muladhara',
    target_chakra: 'Anahata',
    path_type: 'ida_pingala',
    spiritual_meaning: 'Integration of feminine and masculine paths from base to heart; balance of earth and air elements',
    energy_flow: 'Balanceado - Ida+Pingala convergem',
    practices: ['Nadi shodhana pranayama', 'Meditação do equilibrio', 'Mudra阴阳'],
  },
  {
    source_chakra: 'Svadhisthana',
    target_chakra: 'Vishuddha',
    path_type: 'ida_pingala',
    spiritual_meaning: 'Creative-emotional mastery balanced with truthful expression; water flows to air',
    energy_flow: 'Balanceado - Criação para expressão',
    practices: ['Chandra-Surya dhyana', 'Yoga da lua e sol'],
  },
  {
    source_chakra: 'Manipura',
    target_chakra: 'Ajna',
    path_type: 'ida_pingala',
    spiritual_meaning: 'Personal power integrated with intuitive vision; fire illuminates ether',
    energy_flow: 'Balanceado - Poder para visão',
    practices: ['Pranayama equilibrado', 'Visualização de energia central'],
  },
  {
    source_chakra: 'Anahata',
    target_chakra: 'Sahasrara',
    path_type: 'ida_pingala',
    spiritual_meaning: 'Heart love transcends to divine unity; compassion merges with cosmic consciousness',
    energy_flow: 'Balanceado - Coração para coroa',
    practices: ['Anahata-Sahasrara japa', 'Meditação de unidade', 'Devoção'],
  },

  // Direct adjacent paths (internal kundalini flow)
  {
    source_chakra: 'Muladhara',
    target_chakra: 'Svadhisthana',
    path_type: 'direct',
    spiritual_meaning: 'Ground consciousness ascends to creative potential; seed unfolds into emotion',
    energy_flow: 'Direto - Kundalini desperta',
    practices: ['Muladhara bandha', 'Mula bandha'],
  },
  {
    source_chakra: 'Svadhisthana',
    target_chakra: 'Manipura',
    path_type: 'direct',
    spiritual_meaning: 'Emotional creativity transforms into personal will; feeling becomes doing',
    energy_flow: 'Direto - Transmutação emocional',
    practices: ['Svadhisthana bandha', 'Uddiyana bandha'],
  },
  {
    source_chakra: 'Manipura',
    target_chakra: 'Anahata',
    path_type: 'direct',
    spiritual_meaning: 'Personal will expands into heart love; ego transforms into heart-centered being',
    energy_flow: 'Direto - Expansão cardíaca',
    practices: ['Manipura activation', 'Manipura japa'],
  },
  {
    source_chakra: 'Anahata',
    target_chakra: 'Vishuddha',
    path_type: 'direct',
    spiritual_meaning: 'Heart love expresses through authentic voice; compassion becomes truth',
    energy_flow: 'Direto - Expressão autêntica',
    practices: ['Anahata-Vishuddha pranayama', 'Sahaja'],
  },
  {
    source_chakra: 'Vishuddha',
    target_chakra: 'Ajna',
    path_type: 'direct',
    spiritual_meaning: 'Truth spoken becomes inner sight; speech activates intuition',
    energy_flow: 'Direto -Intuição verbal',
    practices: ['Vishuddha japa', 'Ajna Trataka'],
  },
  {
    source_chakra: 'Ajna',
    target_chakra: 'Sahasrara',
    path_type: 'direct',
    spiritual_meaning: 'Third eye opens to crown; perception becomes omniscient awareness',
    energy_flow: 'Direto - Iluminação',
    practices: ['Ajna dhyana', 'Sahasrara japa'],
  },

  // Full Kundalini awakening paths (Muladhara to Sahasrara)
  {
    source_chakra: 'Muladhara',
    target_chakra: 'Sahasrara',
    path_type: 'kundalini',
    spiritual_meaning: 'Kundalini shakti rises from base to crown through all seven chakras; complete spiritual awakening',
    energy_flow: 'Ascendente total - Sushumna completo',
    practices: [
      'Kundalini yoga',
      'Mula bandha',
      'Pranayama avançado',
      'Sahaja samadhi',
      'Kriya yoga',
      'Shaktipat',
    ],
  },
  {
    source_chakra: 'Muladhara',
    target_chakra: 'Sahasrara',
    path_type: 'sushumna',
    spiritual_meaning: 'Pure consciousness path through central channel; kundalini rises without duality',
    energy_flow: 'Centro - Sushumna puro',
    practices: ['Shiva pranayama', 'Shambhavi mudra', 'Samadhi practice'],
  },
  {
    source_chakra: 'Muladhara',
    target_chakra: 'Sahasrara',
    path_type: 'ida',
    spiritual_meaning: 'Lunar kundalini rises through ida nadi; feminine awakening path',
    energy_flow: 'Esquerda - Kundalini lunar',
    practices: ['Nadi shodhana', 'Chandra kriya', 'Lunar yoga'],
  },
  {
    source_chakra: 'Muladhara',
    target_chakra: 'Sahasrara',
    path_type: 'pingala',
    spiritual_meaning: 'Solar kundalini rises through pingala nadi; masculine awakening path',
    energy_flow: 'Direita - Kundalini solar',
    practices: ['Kapalabhati', 'Surya kriya', 'Solar yoga'],
  },
];

/**
 * Returns the chakra-to-chakra mapping for a given source and target chakra.
 */
export function getChakraChakra(
  sourceChakra: string,
  targetChakra: string
): ChakraChakraMapping | null {
  return (
    CHAKRA_CHAKRA_MAPPINGS.find(
      (mapping) =>
        mapping.source_chakra === sourceChakra &&
        mapping.target_chakra === targetChakra
    ) || null
  );
}

export function getAllChakraPaths(
  sourceChakra: string,
  targetChakra: string
): ChakraChakraMapping[] {
  const normalizedSource = getChakraByName(sourceChakra);
  const normalizedTarget = getChakraByName(targetChakra);
  if (!normalizedSource || !normalizedTarget) {
    return [];
  }
  return CHAKRA_CHAKRA_MAPPINGS.filter(
    (mapping) =>
      (mapping.source_chakra === normalizedSource &&
        mapping.target_chakra === normalizedTarget) ||
      (mapping.source_chakra === normalizedTarget &&
        mapping.target_chakra === normalizedSource)
  );
}

/**
 * Returns all chakra-chakra mappings for a specific chakra.
 */
export function getChakraByLevel(level: number): ChakraChakraMapping[] {
  const chakraNames: ChakraName[] = [
    'Muladhara',
    'Svadhisthana',
    'Manipura',
    'Anahata',
    'Vishuddha',
    'Ajna',
    'Sahasrara',
  ];

  if (level < 1 || level > 7) {
    return [];
  }

  const chakraName = chakraNames[level - 1];
  return CHAKRA_CHAKRA_MAPPINGS.filter(
    (mapping) =>
      mapping.source_chakra === chakraName || mapping.target_chakra === chakraName
  );
}

/**
 * Returns all chakra-chakra mappings.
 */
export function getAllChakraChakra(): ChakraChakraMapping[] {
  return CHAKRA_CHAKRA_MAPPINGS;
}

/**
 * Returns paths of a specific type (sushumna, ida, pingala, kundalini, etc.)
 */
export function getPathsByType(pathType: PathType): ChakraChakraMapping[] {
  return CHAKRA_CHAKRA_MAPPINGS.filter(
    (mapping) => mapping.path_type === pathType
  );
}

/**
 * Returns the chakra by its name or number.
 */
export function getChakraByName(name: string): ChakraName | null {
  const chakraNames: ChakraName[] = [
    'Muladhara',
    'Svadhisthana',
    'Manipura',
    'Anahata',
    'Vishuddha',
    'Ajna',
    'Sahasrara',
  ];

  // Direct match
  if (chakraNames.includes(name as ChakraName)) {
    return name as ChakraName;
  }

  // Number match (e.g., "1º Básico")
  const numMatch = name.match(/^(\d+)º?\s*Básico|Sacro|Plexo|Cardíaco|Laríngeo|Frontal|Coronário/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    if (num >= 1 && num <= 7) {
      return chakraNames[num - 1];
    }
  }

  // Keyword match
  const nameLower = name.toLowerCase();
  if (
    nameLower.includes('base') ||
    nameLower.includes('raiz') ||
    nameLower.includes('muladhara')
  ) {
    return 'Muladhara';
  }
  if (
    nameLower.includes('sacro') ||
    nameLower.includes('svadhisthana') ||
    nameLower.includes('sexual')
  ) {
    return 'Svadhisthana';
  }
  if (
    nameLower.includes('plexo') ||
    nameLower.includes('manipura') ||
    nameLower.includes('solar')
  ) {
    return 'Manipura';
  }
  if (
    nameLower.includes('card') ||
    nameLower.includes('anahat') ||
    nameLower.includes('coração')
  ) {
    return 'Anahata';
  }
  if (
    nameLower.includes('lar') ||
    nameLower.includes('vishuddha') ||
    nameLower.includes('garganta')
  ) {
    return 'Vishuddha';
  }
  if (
    nameLower.includes('terceiro') ||
    nameLower.includes('ajna') ||
    nameLower.includes('frontal') ||
    nameLower.includes('olho')
  ) {
    return 'Ajna';
  }
  if (
    nameLower.includes('coroa') ||
    nameLower.includes('sahasrara') ||
    nameLower.includes('coron')
  ) {
    return 'Sahasrara';
  }

  return null;
}