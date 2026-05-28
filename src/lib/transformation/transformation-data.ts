/**
 * Transformation Data - Spiritual transformation data for Cabala dos Caminhos
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TransformationData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  description: string;
  descriptionPt: string;
  timestamp: number;
}

const transformationData: TransformationData[] = [
  {
    id: "spiritual-growth",
    name: "Crescimento Espiritual",
    namePt: "Crescimento Espiritual",
    nameEn: "Spiritual Growth",
    value: 70,
    min: 0,
    max: 100,
    unit: "%",
    description: "Level of spiritual evolution and growth",
    descriptionPt: "Nível de evolução e crescimento espiritual",
    timestamp: Date.now(),
  },
  {
    id: "inner-peace",
    name: "Paz Interior",
    namePt: "Paz Interior",
    nameEn: "Inner Peace",
    value: 65,
    min: 0,
    max: 100,
    unit: "%",
    description: "State of inner calm and tranquility",
    descriptionPt: "Estado de calma e tranquilidade interior",
    timestamp: Date.now(),
  },
  {
    id: "self-awareness",
    name: "Autoconsciência",
    namePt: "Autoconsciência",
    nameEn: "Self Awareness",
    value: 75,
    min: 0,
    max: 100,
    unit: "%",
    description: "Level of self-knowledge and consciousness",
    descriptionPt: "Nível de autoconhecimento e consciência",
    timestamp: Date.now(),
  },
  {
    id: "emotional-balance",
    name: "Equilíbrio Emocional",
    namePt: "Equilíbrio Emocional",
    nameEn: "Emotional Balance",
    value: 60,
    min: 0,
    max: 100,
    unit: "%",
    description: "Emotional stability and equilibrium",
    descriptionPt: "Estabilidade e equilíbrio emocional",
    timestamp: Date.now(),
  },
  {
    id: "enlightenment",
    name: "Iluminação",
    namePt: "Iluminação",
    nameEn: "Enlightenment",
    value: 45,
    min: 0,
    max: 100,
    unit: "%",
    description: "State of spiritual enlightenment",
    descriptionPt: "Estado de iluminação espiritual",
    timestamp: Date.now(),
  },
  {
    id: "transformation-rate",
    name: "Taxa de Transformação",
    namePt: "Taxa de Transformação",
    nameEn: "Transformation Rate",
    value: 55,
    min: 0,
    max: 100,
    unit: "%",
    description: "Speed of personal transformation process",
    descriptionPt: "Velocidade do processo de transformação pessoal",
    timestamp: Date.now(),
  },
  {
    id: "consciousness-expansion",
    name: "Expansão da Consciência",
    namePt: "Expansão da Consciência",
    nameEn: "Consciousness Expansion",
    value: 68,
    min: 0,
    max: 100,
    unit: "%",
    description: "Level of expanded consciousness awareness",
    descriptionPt: "Nível de expansão da consciência",
    timestamp: Date.now(),
  },
  {
    id: "soul-integration",
    name: "Integração da Alma",
    namePt: "Integração da Alma",
    nameEn: "Soul Integration",
    value: 72,
    min: 0,
    max: 100,
    unit: "%",
    description: "Integration of soul aspects and fragments",
    descriptionPt: "Integração dos aspectos e fragmentos da alma",
    timestamp: Date.now(),
  },
  {
    id: "karma-resolution",
    name: "Resolução de Karma",
    namePt: "Resolução de Karma",
    nameEn: "Karma Resolution",
    value: 58,
    min: 0,
    max: 100,
    unit: "%",
    description: "Progress in resolving karmic patterns",
    descriptionPt: "Progresso na resolução de padrões cármicos",
    timestamp: Date.now(),
  },
  {
    id: "divine-connection",
    name: "Conexão Divina",
    namePt: "Conexão Divina",
    nameEn: "Divine Connection",
    value: 80,
    min: 0,
    max: 100,
    unit: "%",
    description: "Connection to divine source energy",
    descriptionPt: "Conexão com a energia fonte divina",
    timestamp: Date.now(),
  },
];

/**
 * Get all transformation data entries
 */
export function getData(): TransformationData[] {
  return transformationData;
}

/**
 * Get transformation data entry by id
 */
export function getDataById(id: string): TransformationData | undefined {
  return transformationData.find((d) => d.id === id);
}

/**
 * Get transformation data by category based on id prefix
 */
export function getDataByCategory(category: string): TransformationData[] {
  return transformationData.filter((d) => d.id.startsWith(category));
}
