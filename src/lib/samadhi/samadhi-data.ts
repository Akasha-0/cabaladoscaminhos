// Samadhi data - states of meditative absorption and spiritual unity

export interface SamadhiLevel {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  description: string;
  descriptionPt: string;
  descriptionEn: string;
  characteristics: string[];
  stage: number;
}

export interface SamadhiData {
  name: string;
  description: string;
  descriptionPt: string;
  descriptionEn: string;
  levels: SamadhiLevel[];
}

const samadhiLevels: SamadhiLevel[] = [
  {
    id: 'savikalpa',
    name: 'Savikalpa Samadhi',
    namePt: 'Samadhi com suporte',
    nameEn: 'Samadhi with support',
    description: 'State of meditative absorption with subtle distinctions.',
    descriptionPt: 'Estado de absorção meditativa com distinções sutis.',
    descriptionEn: 'State of meditative absorption with subtle distinctions.',
    characteristics: [
      'concentração profunda',
      'unificação parcial da mente',
      'percepção de formas e sons',
      'mantém consciência do eu',
    ],
    stage: 1,
  },
  {
    id: 'nirvikalpa',
    name: 'Nirvikalpa Samadhi',
    namePt: 'Samadhi sem suporte',
    nameEn: 'Samadhi without support',
    description: 'State of pure absorption beyond all distinctions.',
    descriptionPt: 'Estado de absorção pura além de todas as distinções.',
    descriptionEn: 'State of pure absorption beyond all distinctions.',
    characteristics: [
      'unificação completa da mente',
      'transcendência das dualidades',
      'unidade com o absoluto',
      'dissolução do ego',
    ],
    stage: 2,
  },
  {
    id: 'sahaja',
    name: 'Sahaja Samadhi',
    namePt: 'Samadhi natural',
    nameEn: 'Natural Samadhi',
    description: 'Effortless state of union maintained in daily life.',
    descriptionPt: 'Estado de união sem esforço mantido na vida diária.',
    descriptionEn: 'Effortless state of union maintained in daily life.',
    characteristics: [
      'equilíbrio constante',
      'presença espontânea',
      'ação sem apego',
      'sabedoria natural',
    ],
    stage: 3,
  },
  {
    id: 'kaivalya',
    name: 'Kaivalya Samadhi',
    namePt: 'Samadhi de isolamento',
    nameEn: 'Isolation Samadhi',
    description: 'Complete isolation from worldly existence.',
    descriptionPt: 'Isolamento completo da existência mundana.',
    descriptionEn: 'Complete isolation from worldly existence.',
    characteristics: [
      'libertação total',
      'unidade com a consciência pura',
      'ausência de identificação',
      'paz eterna',
    ],
    stage: 4,
  },
];

/**
 * Get all Samadhi data
 */
export function getData(): SamadhiData {
  return {
    name: 'Samadhi',
    description: 'States of meditative absorption, unity, and spiritual enlightenment.',
    descriptionPt: 'Estados de absorção meditativa, unidade e iluminação espiritual.',
    descriptionEn: 'States of meditative absorption, unity, and spiritual enlightenment.',
    levels: samadhiLevels,
  };
}

/**
 * Get Samadhi level by id
 */
export function getLevelById(id: string): SamadhiLevel | undefined {
  return samadhiLevels.find((l) => l.id === id);
}
