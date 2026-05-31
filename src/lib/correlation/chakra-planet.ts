/**
 * Chakra-Planet Spiritual Correlation
 * Maps the 7 chakras (Muladhara to Sahasrara) to their planetary correspondences,
 * astrological properties, spiritual meanings, and aligned esoteric traditions.
 *
 * Based on traditional Vedic astrology and Cabala dos Caminhos hermetic principles.
 */

export type Planeta = 'Sol' | 'Lua' | 'Marte' | 'Mercúrio' | 'Júpiter' | 'Vênus' | 'Saturno';

export type ChakraName =
  | 'Muladhara'
  | 'Svadhisthana'
  | 'Manipura'
  | 'Anahata'
  | 'Vishuddha'
  | 'Ajna'
  | 'Sahasrara';

export interface ChakraPlanetMapping {
  chakra: ChakraName;
  chakra_numero: string;
  planeta: Planeta;
  propriedades_astrologicas: {
    signo_regente: string;
    dia_semana: string;
    natureza: 'Sadio' | 'Misto' | 'Maléfico';
    exaltação: string;
  };
  significado_espiritual: {
    qualidades: string;
    lições_kármicas: string;
    natureza_planetária: string;
  };
  prática_espiritual: {
    tipo: string;
    descrição: string;
    mudras: string[];
    cores: string[];
  };
}

/**
 * Complete mapping of the 7 chakras to their planetary correspondences.
 * Based on traditional Vedic astrology and esoteric traditions.
 */
export const CHAKRA_PLANET_MAPPINGS: Record<ChakraName, ChakraPlanetMapping> = {
  Muladhara: {
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    planeta: 'Saturno',
    propriedades_astrologicas: {
      signo_regente: 'Capricórnio',
      dia_semana: 'Sábado',
      natureza: 'Maléfico',
      exaltação: 'Libra',
    },
    significado_espiritual: {
      qualidades: 'Ancoramento, estrutura, disciplina, paciência',
      lições_kármicas: 'Trabalhar questões de sobrevivência e segurança material',
      natureza_planetária: 'Karma, limitação, mestria através do esforço',
    },
    prática_espiritual: {
      tipo: 'Aterramento e dissolução de medos',
      descrição: 'Conexão com a energia terrena para dissolver medos de carência e estabelecer firmeza espiritual',
      mudras: ['Mudra de ancoramento', 'Mudra de Saturno'],
      cores: ['Vermelho', 'Marrom'],
    },
  },

  Svadhisthana: {
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacro',
    planeta: 'Júpiter',
    propriedades_astrologicas: {
      signo_regente: 'Sagitário',
      dia_semana: 'Quinta-feira',
      natureza: 'Sadio',
      exaltação: 'Câncer',
    },
    significado_espiritual: {
      qualidades: 'Expansão, sabedoria, abundância, criatividade',
      lições_kármicas: 'Expansão através da expressão criativa e busca por verdade',
      natureza_planetária: 'Filosofia, abundância, ensino, expansão espiritual',
    },
    prática_espiritual: {
      tipo: 'Transmutação criativa',
      descrição: 'Transformação de traumas através da fluidez emocional e expressão criativa sagrada',
      mudras: ['Mudra de Júpiter', 'Mudra de expansão'],
      cores: ['Laranja', 'Amarelo'],
    },
  },

  Manipura: {
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    planeta: 'Marte',
    propriedades_astrologicas: {
      signo_regente: 'Áries',
      dia_semana: 'Terça-feira',
      natureza: 'Maléfico',
      exaltação: 'Capricórnio',
    },
    significado_espiritual: {
      qualidades: 'Força, coragem, ação, transformação, poder pessoal',
      lições_kármicas: 'Dominar a vontade e transformar medos em ação positively',
      natureza_planetária: 'Energia, competição, coragem, ação decisiva',
    },
    prática_espiritual: {
      tipo: 'Quebra de medos e ativação',
      descrição: 'Ativação do poder pessoal através da transformação da força de vontade e superação de medos',
      mudras: ['Mudra de ativação', 'Mudra de Marte'],
      cores: ['Amarelo', 'Dourado'],
    },
  },

  Anahata: {
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    planeta: 'Vênus',
    propriedades_astrologicas: {
      signo_regente: 'Touro',
      dia_semana: 'Sexta-feira',
      natureza: 'Sadio',
      exaltação: 'Peixes',
    },
    significado_espiritual: {
      qualidades: 'Amor, compaixão, harmonia, equilíbrio, relationships',
      lições_kármicas: 'Desenvolver amor incondicional e curar feridas emocionais',
      natureza_planetária: 'Amor, beleza, arte, relacionamentos, prazer',
    },
    prática_espiritual: {
      tipo: 'Abertura do coração',
      descrição: 'Desenvolvimento do amor incondicional e cura de feridas emocionais do passado',
      mudras: ['Mudra do coração', 'Mudra de Vênus'],
      cores: ['Verde', 'Rosa'],
    },
  },

  Vishuddha: {
    chakra: 'Vishuddha',
    chakra_numero: '5º Laríngeo',
    planeta: 'Mercúrio',
    propriedades_astrologicas: {
      signo_regente: 'Gêmeos',
      dia_semana: 'Quarta-feira',
      natureza: 'Misto',
      exaltação: 'Virgem',
    },
    significado_espiritual: {
      qualidades: 'Comunicação, expressão, verdade, autenticidade',
      lições_kármicas: 'Encontrar voz autêntica e expressar verdades mais elevadas',
      natureza_planetária: 'Comunicação, inteligência, comércio, adaptação',
    },
    prática_espiritual: {
      tipo: 'Liberação da voz',
      descrição: 'Desbloqueio da comunicação autêntica e expressão da verdade interior',
      mudras: ['Mudra de comunicação', 'Mudra de Mercúrio'],
      cores: ['Azul claro', 'Turquesa'],
    },
  },

  Ajna: {
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    planeta: 'Lua',
    propriedades_astrologicas: {
      signo_regente: 'Câncer',
      dia_semana: 'Segunda-feira',
      natureza: 'Sadio',
      exaltação: 'Touro',
    },
    significado_espiritual: {
      qualidades: 'Intuição, clareza, percepção, sabedoria interior',
      lições_kármicas: 'Desenvolver percepção além dos sentidos e acessar a sabedoria interior',
      natureza_planetária: 'Mente, emoção, intuição,想象力, inconsciente',
    },
    prática_espiritual: {
      tipo: 'Desenvolvimento da intuição',
      descrição: 'Expansão da percepção através da conexão com a mente intuitiva e sabedoria interior',
      mudras: ['Mudra de intuição', 'Mudra da Lua'],
      cores: ['Índigo', 'Roxo claro'],
    },
  },

  Sahasrara: {
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    planeta: 'Sol',
    propriedades_astrologicas: {
      signo_regente: 'Leão',
      dia_semana: 'Domingo',
      natureza: 'Sadio',
      exaltação: 'Áries',
    },
    significado_espiritual: {
      qualidades: 'Iluminação, unidade, consciência cósmica, transcendência',
      lições_kármicas: 'Realizar a fusão com a consciência divina e alcançar iluminação',
      natureza_planetária: 'Espírito, vida, consciência,主子, poder criativo',
    },
    prática_espiritual: {
      tipo: 'Conscientização cósmica',
      descrição: 'Expansão da consciência para além do ego e conexão com a sabedoria universal',
      mudras: ['Mudra de sabedoria', 'Mudra do Sol'],
      cores: ['Branco', 'Dourado', 'Violeta'],
    },
  },
};

/**
 * Returns the complete chakra-planet mapping for a given chakra name.
 */
export function getChakraPlanet(chakra: string): ChakraPlanetMapping | null {
  const normalizedChakra = normalizeChakraName(chakra);
  return CHAKRA_PLANET_MAPPINGS[normalizedChakra as ChakraName] ?? null;
}

/**
 * Returns the chakra associated with a given planet.
 */
export function getPlanetChakra(planeta: string): ChakraPlanetMapping | null {
  const normalizedPlanet = normalizePlanetName(planeta);
  const entry = Object.values(CHAKRA_PLANET_MAPPINGS).find(
    mapping => mapping.planeta === normalizedPlanet
  );
  return entry ?? null;
}

/**
 * Returns all chakra-planet mappings.
 */
export function getAllChakraPlanets(): ChakraPlanetMapping[] {
  return Object.values(CHAKRA_PLANET_MAPPINGS);
}

/**
 * Normalizes chakra name to match ChakraName type.
 */
function normalizeChakraName(chakra: string): string {
  const chakraMap: Record<string, string> = {
    'muladhara': 'Muladhara',
    'svadhisthana': 'Svadhisthana',
    'manipura': 'Manipura',
    'anahata': 'Anahata',
    'vishuddha': 'Vishuddha',
    'ajna': 'Ajna',
    'sahasrara': 'Sahasrara',
    '1º básico': 'Muladhara',
    '1º Básico': 'Muladhara',
    '2º sacro': 'Svadhisthana',
    '2º Sacro': 'Svadhisthana',
    '3º plexo solar': 'Manipura',
    '3º Plexo Solar': 'Manipura',
    '4º cardíaco': 'Anahata',
    '4º Cardíaco': 'Anahata',
    '5º laríngeo': 'Vishuddha',
    '5º Laríngeo': 'Vishuddha',
    '6º frontal': 'Ajna',
    '6º Frontal': 'Ajna',
    '7º coronário': 'Sahasrara',
    '7º Coronário': 'Sahasrara',
  };
  return chakraMap[chakra.toLowerCase()] ?? chakra;
}

/**
 * Normalizes planet name to match Planeta type.
 */
function normalizePlanetName(planeta: string): Planeta {
  const planetMap: Record<string, Planeta> = {
    'sol': 'Sol',
    'lua': 'Lua',
    'marte': 'Marte',
    'mercúrio': 'Mercúrio',
    'mercurio': 'Mercúrio',
    'júpiter': 'Júpiter',
    'jupiter': 'Júpiter',
    'vênus': 'Vênus',
    'venus': 'Vênus',
    'saturno': 'Saturno',
  };
  return planetMap[planeta.toLowerCase()] ?? planeta as Planeta;
}