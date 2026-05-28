/**
 * Creator data for the spiritual system.
 */

export interface CreatorData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  archetype: string;
  domain: string;
  qualities: string[];
  symbols: string[];
  practices: string[];
  description: string;
  descriptionPt: string;
  sacredNumber: number;
  element: string;
  plane: string;
}

const creatorData: CreatorData[] = [
  {
    id: 'creator-01',
    name: 'Logos',
    namePt: 'Verbo',
    nameEn: 'Word',
    archetype: 'Divine Architect',
    domain: 'creation-word',
    qualities: ['intention', 'manifestation', 'expression', 'clarity', 'purpose'],
    symbols: ['spoken word', 'light', 'sound vibration'],
    practices: ['sacred speech', 'affirmation', 'declaration', 'chanting'],
    description: 'The creative force through divine utterance. Every reality begins with a thought made manifest through the Word.',
    descriptionPt: 'A força criativa através da palavra divina. Toda realidade começa com um pensamento tornado manifesto através do Verbo.',
    sacredNumber: 1,
    element: 'ether',
    plane: 'divine',
  },
  {
    id: 'creator-02',
    name: 'Architect',
    namePt: 'Arquiteto',
    nameEn: 'Architect',
    archetype: 'Cosmic Builder',
    domain: 'creation-structure',
    qualities: ['design', 'order', 'balance', 'harmony', 'precision'],
    symbols: ['compass', 'square', 'blueprint', 'geometric patterns'],
    practices: ['sacred geometry', 'blueprint meditation', 'structure visualization'],
    description: 'The divine intelligence that designs the architecture of existence. Creates order from chaos through mathematical precision.',
    descriptionPt: 'A inteligência divina que projeta a arquitetura da existência. Cria ordem do caos através de precisão matemática.',
    sacredNumber: 4,
    element: 'earth',
    plane: 'cosmic',
  },
  {
    id: 'creator-03',
    name: 'Alchemist',
    namePt: 'Alquimista',
    nameEn: 'Alchemist',
    archetype: 'Transformer',
    domain: 'creation-transmutation',
    qualities: ['transformation', 'purification', 'wisdom', 'patience', 'mastery'],
    symbols: ['philosophers stone', 'retort', 'caduceus', 'mercury'],
    practices: ['transmutation ritual', 'elemental work', 'inner alchemy', 'pranaayama'],
    description: 'The master of transformation who transmutes base matter into gold and Lead consciousness into enlightenment.',
    descriptionPt: 'O mestre da transformação que transmutas chumbo em ouro e consciência de chumbo em iluminação.',
    sacredNumber: 7,
    element: 'fire',
    plane: 'mental',
  },
  {
    id: 'creator-04',
    name: 'Dreamer',
    namePt: 'Sonhador',
    nameEn: 'Dreamer',
    archetype: 'Reality Weaver',
    domain: 'creation-imagination',
    qualities: ['vision', 'imagination', 'possibility', 'creativity', 'reverie'],
    symbols: ['dreamcatcher', 'nebula', 'water', 'mirror'],
    practices: ['lucid dreaming', 'visualization', 'imagination cultivation', 'active dreaming'],
    description: 'The consciousness that dreams reality into being. All manifestation begins in the space between sleep and waking.',
    descriptionPt: 'A consciência que sonha a realidade em existência. Toda manifestação começa no espaço entre o sono e a vigília.',
    sacredNumber: 3,
    element: 'water',
    plane: 'astral',
  },
  {
    id: 'creator-05',
    name: 'Singer',
    namePt: 'Cantor',
    nameEn: 'Singer',
    archetype: 'Cosmic Musician',
    domain: 'creation-vibration',
    qualities: ['harmony', 'resonance', 'frequency', 'beauty', 'resonance'],
    symbols: ['harp', 'flute', 'om symbol', 'sound waves'],
    practices: ['sacred music', 'tone healing', 'chanting', 'sound meditation'],
    description: 'The celestial musician whose song weaves the fabric of space-time and gives rhythm to all creation.',
    descriptionPt: 'O músico celestial cuja canção tece o tecido do espaço-tempo e dá ritmo a toda criação.',
    sacredNumber: 8,
    element: 'air',
    plane: 'celestial',
  },
  {
    id: 'creator-06',
    name: 'Painter',
    namePt: 'Pintor',
    nameEn: 'Painter',
    archetype: 'Color Artisan',
    domain: 'creation-form',
    qualities: ['beauty', 'aesthetics', 'perception', 'form', 'color'],
    symbols: ['palette', 'brush', 'rainbow', 'mandala'],
    practices: ['color meditation', 'art therapy', 'visual contemplation', 'mandala creation'],
    description: 'The divine artist who paints existence with color and form, creating beauty that awakens the soul.',
    descriptionPt: 'O artista divino que pinta a existência com cor e forma, criando beleza que desperta a alma.',
    sacredNumber: 6,
    element: 'light',
    plane: 'causal',
  },
  {
    id: 'creator-07',
    name: 'Tender',
    namePt: 'Cultivador',
    nameEn: 'Tender',
    archetype: 'Life Gardener',
    domain: 'creation-nurturing',
    qualities: ['patience', 'growth', 'tenderness', ' nurturing', 'bloom'],
    symbols: ['garden', 'seed', 'sprout', 'watering can'],
    practices: ['seed planting ritual', 'garden meditation', 'growth visualization', 'tenderness practice'],
    description: 'The sacred gardener who tends the seeds of potential, nurturing growth with loving care and patience.',
    descriptionPt: 'O jardineiro sagrado que cultiva as sementes do potencial, nutrindo o crescimento com cuidado amoroso e paciência.',
    sacredNumber: 5,
    element: 'water',
    plane: 'etheric',
  },
];

export function getData(): CreatorData[] {
  return creatorData;
}

export function getCreatorDataById(id: string): CreatorData | undefined {
  return creatorData.find((c) => c.id === id);
}