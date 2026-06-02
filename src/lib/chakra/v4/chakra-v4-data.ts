/**
 * Chakra V4 Data - Traditional Hindu/Spiritual Chakras
 *
 * @module chakra/v4/chakra-v4-data
 */

export interface ChakraV4Data {
  id: string;
  name: string;
  nameSanskrit: string;
  color: string;
  frequency: number;
  element: string;
  meaning: string;
  location: string;
}

const DATA: ChakraV4Data[] = [
  {
    id: 'muladhara',
    name: 'Muladhara',
    nameSanskrit: 'मूलाधार',
    color: '#DC2626', // vermelho
    frequency: 396,
    element: 'terra',
    meaning: 'Raiz, sobrevivência, segurança, estabilidade. Conexão com a terra e os instintos básicos.',
    location: 'Base da coluna vertebral, entre o cóccix e o sacro',
  },
  {
    id: 'svadhisthana',
    name: 'Svadhisthana',
    nameSanskrit: 'स्वाधिष्ठान',
    color: '#EA580C', // laranja
    frequency: 417,
    element: 'água',
    meaning: 'Sexualidade, criatividade, emoções, prazer. Fluxo natural da vida e relacionamentos.',
    location: 'Região sacral, abaixo do umbigo',
  },
  {
    id: 'manipura',
    name: 'Manipura',
    nameSanskrit: 'मणिपूर',
    color: '#CA8A04', // amarelo
    frequency: 528,
    element: 'fogo',
    meaning: 'Poder pessoal, vontade, autonomia, digestão emocional. Centro do fogo interno.',
    location: 'Região do plexo solar, acima do umbigo',
  },
  {
    id: 'anahata',
    name: 'Anahata',
    nameSanskrit: 'अनाहत',
    color: '#16A34A', // verde
    frequency: 639,
    element: 'ar',
    meaning: 'Amor incondicional, compaixão, perdão, conexões. Coração da espiritualidade.',
    location: 'Centro do peito, região do coração',
  },
  {
    id: 'vishuddha',
    name: 'Vishuddha',
    nameSanskrit: 'विशुद्ध',
    color: '#2563EB', // azul
    frequency: 741,
    element: 'éter',
    meaning: 'Comunicação, expressão, verdade, autoexpressão. Portal da voz interior.',
    location: 'Região da garganta',
  },
  {
    id: 'ajna',
    name: 'Ajna',
    nameSanskrit: 'आज्ञा',
    color: '#4338CA', // indigo
    frequency: 852,
    element: 'luz',
    meaning: 'Intuição, percepção, visão interior, terceira via. Olho da sabedoria.',
    location: 'Entre as sobrancelhas, terceiro olho',
  },
  {
    id: 'sahasrara',
    name: 'Sahasrara',
    nameSanskrit: 'सहस्रार',
    color: '#A855F7', // violeta
    frequency: 963,
    element: 'divino',
    meaning: 'Iluminação, consciência cósmica, transcendência, unidade. Milpétalas da alma.',
    location: 'Pico da cabeça, fontanela',
  },
];

export function getData(): ChakraV4Data[] {
  return DATA;
}

/**
 * Retorna o chakra por nome/sanskrit (compatibilidade com ChakraInfo)
 * @deprecated Use getData() diretamente e filtre
 */
export type ChakraInfo = {
  numero: number;
  nome: string;
  estado: 'equilibrado' | 'hiperativo' | 'bloqueado' | 'desbalanceado';
  intensidade: number;
  elemento?: string;
  cor?: string;
};

function getDataAsChakraInfo(): ChakraInfo[] {
  return DATA.map((chakra, index) => ({
    numero: index + 1,
    nome: chakra.nameSanskrit,
    estado: 'equilibrado' as const,
    intensidade: 50,
    elemento: chakra.element,
    cor: chakra.color,
  }));
}