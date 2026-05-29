export interface Frequency {
  id: string;
  hz: number;
  note: string;
  name: string;
  color: string;
  chakra: number | null;
  element: string | null;
  sefirot: string | null;
  benefits: string[];
  applications: string[];
  mantra: string;
  description: string;
  divindade?: string;
  poliedro?: string;
  direcao?: string;
  mantram?: string;
}

export interface FrequencyCategory {
  id: string;
  name: string;
  description: string;
  frequencies: Frequency[];
}

export const SOLFEGGIO_FREQUENCIES: Frequency[] = [
  {
    id: 'sol-174',
    hz: 174,
    note: 'F#',
    name: 'Foundation',
    color: '#8B4513',
    chakra: 1,
    element: 'Earth',
    sefirot: 'Malkuth',
    benefits: ['Pain relief', 'Strengthens body tissues', 'Grounding energy'],
    applications: ['Meditation', 'Physical healing', 'Pain management'],
    mantra: 'Om',
    description: 'Known as the foundation frequency, it provides a natural墙角 of the body and acts as an analgesic.',
  },
  {
    id: 'sol-285',
    hz: 285,
    note: 'G',
    name: 'Tissue Regeneration',
    color: '#228B22',
    chakra: 2,
    element: 'Water',
    sefirot: 'Yesod',
    benefits: ['Stimulates tissue regeneration', 'Heals wounds', 'Energizes the body'],
    applications: ['Healing', 'Rejuvenation', 'Energy work'],
    mantra: 'Om Shanti',
    description: 'Signals the body to rebuild itself by energizing damaged organs and tissues.',
  },
  {
    id: 'sol-396',
    hz: 396,
    note: 'G#',
    name: 'Liberação do Medo',
    color: '#8B4513',
    chakra: 1,
    element: 'Terra',
    sefirot: 'Malkuth',
    benefits: ['Dissolução de medos', 'Ancoramento', 'Firmeza material'],
    applications: ['Meditação', 'Cura emocional', 'Trabalho interior'],
    mantra: 'LAM',
    description: 'Liberta a mente do medo e da culpa, facilitando a transformação emocional.',
    divindade: 'ADONAI HA-ARETZ',
    poliedro: 'Cubo',
    direcao: 'Norte',
    mantram: 'LAM',
  },
  {
    id: 'sol-417',
    hz: 417,
    note: 'A',
    name: 'Transformação de Situações',
    color: '#FFA500',
    chakra: 2,
    element: 'Água',
    sefirot: 'Yesod',
    benefits: ['Facilita mudança', 'Dissolve situações difíceis', 'Inovação'],
    applications: ['Transformação', 'Novos começos', 'Resolução de problemas'],
    mantra: 'VAM',
    description: 'Facilita a mudança dissolvendo ocorrências externas e situações que foram difíceis de transformar.',
    divindade: 'ELOHIM GIBOR',
    poliedro: 'Dodecaedro',
    direcao: 'Oeste',
    mantram: 'VAM',
  },
  {
    id: 'sol-528',
    hz: 528,
    note: 'A#',
    name: 'Milagre',
    color: '#FFD700',
    chakra: 3,
    element: 'Fogo',
    sefirot: 'Hod',
    benefits: ['Reparo de DNA', 'Promove milagres', 'Limpa negatividades'],
    applications: ['Cura de DNA', 'Meditação', 'Despertar espiritual'],
    mantra: 'RAM',
    description: 'A frequência do milagre conhecida pelo reparo de DNA e transformação, usada em civilizações antigas.',
    divindade: 'SHADDAI EL CHAI',
    poliedro: 'Tetraedro',
    direcao: 'Sul',
    mantram: 'RAM',
  },
  {
    id: 'sol-639',
    hz: 639,
    note: 'B',
    name: 'Harmonia nas Relações',
    color: '#87CEEB',
    chakra: 4,
    element: 'Ar',
    sefirot: 'Netzach',
    benefits: ['Melhora comunicação', 'Promove harmonia em relacionamentos', 'Reduz tensão'],
    applications: ['Relacionamentos', 'Comunicação', 'Trabalho em equipe'],
    mantra: 'YAM',
    description: 'Melhora a comunicação e promove harmonia em relacionamentos e dinâmica de grupo.',
    divindade: 'YHVH ELOAH VA-DAATH',
    poliedro: 'Octaedro',
    direcao: 'Leste',
    mantram: 'YAM',
  },
  {
    id: 'sol-741',
    hz: 741,
    note: 'C',
    name: 'Despertar da Intuição',
    color: '#9370DB',
    chakra: 5,
    element: 'Éter',
    sefirot: 'Gevurah',
    benefits: ['Purifica células', 'Desperta intuição', 'Expande consciência'],
    applications: ['Despertar espiritual', 'Meditação', 'Desenvolvimento intuitivo'],
    mantra: 'HAM',
    description: 'Desperta a intuição e expande a consciência purificando e despertando a mente.',
    divindade: 'ELOHIM SABAOTH',
    poliedro: 'Icosaedro',
    direcao: 'Sudeste',
    mantram: 'HAM',
  },
  {
    id: 'sol-852',
    hz: 852,
    note: 'C#',
    name: 'Terceiro Olho',
    color: '#4B0082',
    chakra: 6,
    element: 'Luz',
    sefirot: 'Chesed',
    benefits: ['Ativa o terceiro olho', 'Restaura consciência espiritual', 'Promove clareza'],
    applications: ['Prática espiritual', 'Meditação', 'Visão interior'],
    mantra: 'OM',
    description: 'Ativa o terceiro olho e restaura a consciência espiritual, promovendo o conhecimento interior.',
    divindade: 'YAH',
    poliedro: 'Dodecaedro',
    direcao: 'Noroeste',
    mantram: 'OM',
  },
  {
    id: 'sol-963',
    hz: 963,
    note: 'D',
    name: 'Conexão Divina',
    color: '#FFFFFF',
    chakra: 7,
    element: 'Divino',
    sefirot: 'Kether',
    benefits: ['Conecta à fonte divina', 'Restaura estado perfeito', 'Iluminação'],
    applications: ['Iluminação espiritual', 'Conexão divina', 'Unidade'],
    mantra: 'AUM',
    description: 'Conecta diretamente à fonte divina e restaura o estado perfeito da perfeição original.',
    divindade: 'EHEIEH',
    poliedro: 'Esfera',
    direcao: 'Zenit',
    mantram: 'AUM',
  },
];

const HEALING_FREQUENCIES: Frequency[] = [
  {
    id: 'heal-70',
    hz: 70,
    note: 'C2',
    name: 'Earth Frequency',
    color: '#8B4513',
    chakra: 1,
    element: 'Earth',
    sefirot: 'Malkuth',
    benefits: ['Deep grounding', 'Earth connection', 'Stability'],
    applications: ['Grounding', 'Nature meditation', 'Physical balance'],
    mantra: 'Om Lam',
    description: 'Resonates with the natural frequency of Earth, providing deep grounding and stability.',
  },
  {
    id: 'heal-110',
    hz: 110,
    note: 'A2',
    name: 'Heart Frequency',
    color: '#228B22',
    chakra: 4,
    element: 'Heart',
    sefirot: 'Tiferet',
    benefits: ['Heart health', 'Emotional balance', 'Compassion'],
    applications: ['Heart healing', 'Emotional wellness', 'Love meditation'],
    mantra: 'Om Yam',
    description: 'Resonates with the healthy heart frequency, promoting cardiovascular wellness and emotional balance.',
  },
  {
    id: 'heal-136.1',
    hz: 136.1,
    note: 'C3',
    name: 'Om Frequency',
    color: '#4169E1',
    chakra: 7,
    element: 'Cosmic',
    sefirot: 'Kether',
    benefits: ['Deep meditation', 'Stress relief', 'Spiritual connection'],
    applications: ['Om chanting', 'Deep meditation', 'Stress reduction'],
    mantra: 'Om',
    description: 'The fundamental frequency of the Om mantra, promoting deep meditation and spiritual connection.',
  },
  {
    id: 'heal-285',
    hz: 285,
    note: 'D3',
    name: 'Healing Frequency',
    color: '#FFA500',
    chakra: 2,
    element: 'Water',
    sefirot: 'Yesod',
    benefits: ['Cellular healing', 'Organ health', 'Vitality'],
    applications: ['Healing', 'Rejuvenation', 'Energy work'],
    mantra: 'Om Shanti',
    description: 'Stimulates healing and regeneration at the cellular level.',
  },
  {
    id: 'heal-396',
    hz: 396,
    note: 'G3',
    name: 'Liberation Frequency',
    color: '#FFD700',
    chakra: 1,
    element: 'Earth',
    sefirot: 'Malkuth',
    benefits: ['Releases fear', 'Clears guilt', 'Liberation'],
    applications: ['Emotional healing', 'Letting go', 'Inner work'],
    mantra: 'Om Gam',
    description: 'Liberates the mind from fear and guilt, facilitating emotional transformation.',
  },
  {
    id: 'heal-417',
    hz: 417,
    note: 'A3',
    name: 'Transformation Frequency',
    color: '#87CEEB',
    chakra: 2,
    element: 'Water',
    sefirot: 'Yesod',
    benefits: ['Facilitates change', 'Dissolves blockages', 'New beginnings'],
    applications: ['Transformation', 'Change', 'Renewal'],
    mantra: 'Om Ram',
    description: 'Facilitates change and transformation, dissolving situations that have been difficult to resolve.',
  },
  {
    id: 'heal-528',
    hz: 528,
    note: 'A#3',
    name: 'Love Frequency',
    color: '#FF69B4',
    chakra: 4,
    element: 'Heart',
    sefirot: 'Tiferet',
    benefits: ['DNA repair', 'Love induction', 'Miracle working'],
    applications: ['DNA healing', 'Heart healing', 'Spiritual awakening'],
    mantra: 'Om Yam',
    description: 'Known as the love frequency and miracle frequency, promoting DNA repair and transformation.',
  },
  {
    id: 'heal-639',
    hz: 639,
    note: 'D#4',
    name: 'Harmony Frequency',
    color: '#9370DB',
    chakra: 4,
    element: 'Air',
    sefirot: 'Netzach',
    benefits: ['Relationship harmony', 'Communication', 'Understanding'],
    applications: ['Relationships', 'Communication', 'Teamwork'],
    mantra: 'Om Hum',
    description: 'Promotes harmony in relationships and enhances communication.',
  },
  {
    id: 'heal-741',
    hz: 741,
    note: 'F#4',
    name: 'Awakening Frequency',
    color: '#4B0082',
    chakra: 6,
    element: 'Light',
    sefirot: 'Chesed',
    benefits: ['Intuition awakening', 'Expression', 'Expansion'],
    applications: ['Intuitive development', 'Self-expression', 'Awakening'],
    mantra: 'Om Ksham',
    description: 'Awakens intuition and expands consciousness.',
  },
  {
    id: 'heal-852',
    hz: 852,
    note: 'A#4',
    name: 'Third Eye Frequency',
    color: '#000080',
    chakra: 6,
    element: 'Light',
    sefirot: 'Binah',
    benefits: ['Third eye activation', 'Spiritual awareness', 'Inner vision'],
    applications: ['Third eye meditation', 'Spiritual practice', 'Clarity'],
    mantra: 'Om Om',
    description: 'Activates the third eye and restores spiritual awareness.',
  },
  {
    id: 'heal-963',
    hz: 963,
    note: 'B5',
    name: 'Divine Frequency',
    color: '#FFFFFF',
    chakra: 7,
    element: 'Divine',
    sefirot: 'Kether',
    benefits: ['Divine connection', 'Perfection restoration', 'Enlightenment'],
    applications: ['Divine connection', 'Spiritual enlightenment', 'Oneness'],
    mantra: 'Om Namah Shivaya',
    description: 'Connects to the divine source and restores original perfection.',
  },
  {
    id: 'heal-432',
    hz: 432,
    note: 'A4',
    name: 'Natural Frequency',
    color: '#228B22',
    chakra: 4,
    element: 'Nature',
    sefirot: 'Tiferet',
    benefits: ['Natural healing', 'Stress reduction', 'Harmony'],
    applications: ['Relaxation', 'Nature connection', 'Wellness'],
    mantra: 'Om',
    description: 'The natural frequency of the universe, promoting harmony and natural healing.',
  },
  {
    id: 'heal-440',
    hz: 440,
    note: 'A4',
    name: 'Standard Tuning',
    color: '#FF6347',
    chakra: 4,
    element: 'Air',
    sefirot: 'Netzach',
    benefits: ['Mental clarity', 'Focus', 'Standard tuning'],
    applications: ['Tuning', 'Focus', 'Clarity'],
    mantra: 'Om',
    description: 'The standard tuning frequency used in modern music.',
  },
  {
    id: 'heal-444',
    hz: 444,
    note: 'A#4',
    name: 'Higher Awareness',
    color: '#9370DB',
    chakra: 6,
    element: 'Light',
    sefirot: 'Hod',
    benefits: ['Higher awareness', 'Spiritual growth', 'Healing'],
    applications: ['Spiritual practice', 'Healing', 'Awakening'],
    mantra: 'Om',
    description: 'A frequency associated with higher spiritual awareness and healing.',
  },
  {
    id: 'heal-528-2',
    hz: 528,
    note: 'A#4',
    name: 'DNA Repair',
    color: '#FFD700',
    chakra: 4,
    element: 'Light',
    sefirot: 'Tiferet',
    benefits: ['DNA repair', 'Miracle working', 'Transformation'],
    applications: ['DNA healing', 'Meditation', 'Spiritual work'],
    mantra: 'Om Yam',
    description: 'The frequency of miracles, known for DNA repair and transformation capabilities.',
  },
];

const CATEGORIES: FrequencyCategory[] = [
  {
    id: 'solfeggio',
    name: 'Solfeggio Frequencies',
    description: 'The original six solfeggio frequencies used for healing and transformation.',
    frequencies: SOLFEGGIO_FREQUENCIES,
  },
  {
    id: 'healing',
    name: 'Healing Frequencies',
    description: 'Additional frequencies used for various healing and spiritual purposes.',
    frequencies: HEALING_FREQUENCIES,
  },
];

export const FREQUENCY_DATA: FrequencyCategory[] = CATEGORIES;

export function getData(): FrequencyCategory[] {
  return FREQUENCY_DATA;
}

export function getAllFrequencies(): Frequency[] {
  return [...SOLFEGGIO_FREQUENCIES, ...HEALING_FREQUENCIES];
}

export function getFrequencyById(id: string): Frequency | undefined {
  return getAllFrequencies().find(f => f.id === id);
}

export function getFrequenciesByChakra(chakra: number): Frequency[] {
  return getAllFrequencies().filter(f => f.chakra === chakra);
}

export function getFrequenciesByElement(element: string): Frequency[] {
  return getAllFrequencies().filter(f => f.element === element);
}

export function getFrequenciesBySefirot(sefirot: string): Frequency[] {
  return getAllFrequencies().filter(f => f.sefirot === sefirot);
}

export function getCategoryById(id: string): FrequencyCategory | undefined {
  return CATEGORIES.find(c => c.id === id);
}

export function getFrequenciesByHz(hz: number): Frequency[] {
  return getAllFrequencies().filter(f => f.hz === hz);
}

export function getFrequencyRange(minHz: number, maxHz: number): Frequency[] {
  return getAllFrequencies().filter(f => f.hz >= minHz && f.hz <= maxHz);
}
