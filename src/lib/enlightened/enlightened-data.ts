/**
 * Enlightened Data - Spiritual enlightenment data for Cabala dos Caminhos
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface EnlightenedData {
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
  descriptionEn: string;
  timestamp: number;
}

const enlightenedData: EnlightenedData[] = [
  {
    id: 'enlightenment-awakening',
    name: 'Despertar da Iluminação',
    namePt: 'Despertar da Iluminação',
    nameEn: 'Enlightenment Awakening',
    value: 0,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Nível de despertar espiritual e conexão com a luz interior',
    descriptionPt: 'Nível de despertar espiritual e conexão com a luz interior',
    descriptionEn: 'Level of spiritual awakening and connection with inner light',
    timestamp: Date.now(),
  },
  {
    id: 'inner-light',
    name: 'Luz Interior',
    namePt: 'Luz Interior',
    nameEn: 'Inner Light',
    value: 50,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Brilho da chama divina dentro do ser',
    descriptionPt: 'Brilho da chama divina dentro do ser',
    descriptionEn: 'Brightness of the divine flame within the being',
    timestamp: Date.now(),
  },
  {
    id: 'wisdom-integration',
    name: 'Integração da Sabedoria',
    namePt: 'Integração da Sabedoria',
    nameEn: 'Wisdom Integration',
    value: 0,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Capacidade de integrar sabedorias ancestrais na vida diária',
    descriptionPt: 'Capacidade de integrar sabedorias ancestrais na vida diária',
    descriptionEn: 'Ability to integrate ancestral wisdoms into daily life',
    timestamp: Date.now(),
  },
  {
    id: 'transparency',
    name: 'Transparência Espiritual',
    namePt: 'Transparência Espiritual',
    nameEn: 'Spiritual Transparency',
    value: 0,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Grau de purificação e transparência da alma',
    descriptionPt: 'Grau de purificação e transparência da alma',
    descriptionEn: 'Degree of purification and transparency of the soul',
    timestamp: Date.now(),
  },
  {
    id: 'oneness',
    name: 'Unidade com o Todo',
    namePt: 'Unidade com o Todo',
    nameEn: 'Oneness with the All',
    value: 0,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Sensação de conexão com toda a criação',
    descriptionPt: 'Sensação de conexão com toda a criação',
    descriptionEn: 'Feeling of connection with all creation',
    timestamp: Date.now(),
  },
  {
    id: 'clarity',
    name: 'Clareza Mental',
    namePt: 'Clareza Mental',
    nameEn: 'Mental Clarity',
    value: 50,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Nível de clareza e lucidez mental',
    descriptionPt: 'Nível de clareza e lucidez mental',
    descriptionEn: 'Level of mental clarity and lucidity',
    timestamp: Date.now(),
  },
  {
    id: 'compassion',
    name: 'Compaixão Universal',
    namePt: 'Compaixão Universal',
    nameEn: 'Universal Compassion',
    value: 0,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Capacidade de sentir compaixão por todos os seres',
    descriptionPt: 'Capacidade de sentir compaixão por todos os seres',
    descriptionEn: 'Ability to feel compassion for all beings',
    timestamp: Date.now(),
  },
  {
    id: 'presence',
    name: 'Presença Plena',
    namePt: 'Presença Plena',
    nameEn: 'Full Presence',
    value: 0,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Grau de presença no momento presente',
    descriptionPt: 'Grau de presença no momento presente',
    descriptionEn: 'Degree of presence in the present moment',
    timestamp: Date.now(),
  },
  {
    id: 'truth',
    name: 'Busca da Verdade',
    namePt: 'Busca da Verdade',
    nameEn: 'Search for Truth',
    value: 50,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Dedicação à busca pela verdade absoluta',
    descriptionPt: 'Dedicação à busca pela verdade absoluta',
    descriptionEn: 'Dedication to the search for absolute truth',
    timestamp: Date.now(),
  },
  {
    id: 'surrender',
    name: 'Entrega Espiritual',
    namePt: 'Entrega Espiritual',
    nameEn: 'Spiritual Surrender',
    value: 0,
    min: 0,
    max: 100,
    unit: '%',
    description: 'Capacidade de se entregar ao fluxo divino',
    descriptionPt: 'Capacidade de se entregar ao fluxo divino',
    descriptionEn: 'Ability to surrender to the divine flow',
    timestamp: Date.now(),
  },
];

/**
 * Get all enlightened data entries
 */
export function getData(): EnlightenedData[] {
  return enlightenedData;
}

/**
 * Get enlightened data entry by id
 */
export function getDataById(id: string): EnlightenedData | undefined {
  return enlightenedData.find((d) => d.id === id);
}

/**
 * Get enlightened data by category based on id prefix
 */
export function getDataByCategory(category: string): EnlightenedData[] {
  return enlightenedData.filter((d) => d.id.startsWith(category));
}