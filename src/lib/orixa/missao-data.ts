// @ts-nocheck
// SKIP_LINT

/**
 * Missao Data Module
 * Spiritual data for Missao, the sacred path of purpose, destiny, and spiritual mission
 */

export interface MissaoData {
  id: string;
  name: string;
  namePortuguese: string;
  path: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
  archetype: string;
  qualities: string[];
  challenges: string[];
  rulingPlanet: string;
  sacredAnimals: string[];
  plants: string[];
  offerings: string[];
  chants: string[];
  symbols: string[];
  mythology: string;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
}

const MISSAO_DATA: MissaoData[] = [
  {
    id: 'missao-01',
    name: 'Missao',
    namePortuguese: 'Missao',
    path: 'Path of Divine Purpose and Sacred Mission',
    element: 'Fire and Ether',
    colors: ['#FFD700', '#FF8C00', '#FF6347'],
    dayOfWeek: 'Sunday',
    numbersSacred: [1, 7, 11],
    greeting: 'Missao!',
    archetype: 'THE DIVINE CALLING',
    qualities: [
      'Purpose',
      'Destiny',
      'Mission',
      'Calling',
      'Vocation',
      'Direction',
      'Clarity',
      'Divine alignment'
    ],
    challenges: [
      'Indecision',
      'Fear of failure',
      'Ignoring inner voice',
      'Procrastination',
      'Lack of conviction'
    ],
    rulingPlanet: 'Sun',
    sacredAnimals: ['Phoenix', 'Lion', 'Eagle'],
    plants: ['Sunflower', 'Marigold', 'Dandelion', 'Golden sage'],
    offerings: [
      'Golden candles',
      'Honey',
      'Sage incense',
      'Yellow flowers',
      'Gold powder'
    ],
    chants: ['Missao ai', 'Ori mi', 'Alashè'],
    symbols: ['Star', 'Path', 'Flame', 'Crown'],
    mythology:
      'Missao is the sacred principle of destiny and divine vocation. This path represents the energy that connects us with our true life purpose — what we came to accomplish in this world. Through Missao we find clarity about our trajectory, understanding that each being has a unique role in the fabric of the universe. Missao teaches that knowing your divine will is not arrogance, but alignment — for when we live our vocation, we serve not only ourselves but the entire cosmos.',
    spiritualLesson:
      'The true purpose is not found in the exterior, but in the silent listening of the soul',
    affirmation: 'I open my heart to know my divine mission, trusting the wisdom that guides me',
    meditation:
      'Visualize a golden light emanating from your heart, illuminating the path of your true vocation'
  },
  {
    id: 'missao-02',
    name: 'Missao',
    namePortuguese: 'Missao',
    path: 'Path of Service and Selfless Dedication',
    element: 'Water and Fire',
    colors: ['#FFA500', '#FF4500', '#FFD700'],
    dayOfWeek: 'Thursday',
    numbersSacred: [3, 9, 12],
    greeting: 'I serve with love',
    archetype: 'THE SACRED SERVANT',
    qualities: [
      'Service',
      'Dedication',
      'Compassion',
      'Surrender',
      'Humility',
      'Inner strength'
    ],
    challenges: [
      'Martyrdom',
      'Over-giving',
      'Loss of self',
      'Codependency',
      'Expecting recognition'
    ],
    rulingPlanet: 'Jupiter',
    sacredAnimals: ['Dove', 'Horse', 'Stork'],
    plants: ['Lotus', 'Jasmine', 'Chamomile'],
    offerings: [
      'White candles',
      'Rose water',
      'Incense of myrrh',
      'Fresh flowers',
      'Sacred water'
    ],
    chants: ['Ashe', 'Okan Se', 'Ile ai'],
    symbols: ['Hands', 'Heart', 'Crown of thorns', 'Ladder'],
    mythology:
      'Missao as service represents the divine calling to serve others with love and without expectation. This path teaches that true fulfillment comes not from personal gain but from the sincere dedication to the wellbeing of all beings. The sacred servant walks among us, embodying the principle that the greatest among you shall be the servant of all.',
    spiritualLesson:
      'In serving others, we serve the divine; true power lies in the humility of selfless action',
    affirmation: 'I serve with an open heart, knowing that my mission is to uplift all beings',
    meditation:
      'Feel your heart opening like a lotus, allowing compassion to flow through you to all beings in need'
  },
  {
    id: 'missao-03',
    name: 'Missao',
    namePortuguese: 'Missao',
    path: 'Path of Manifestation and Creation',
    element: 'Fire and Earth',
    colors: ['#FF6B35', '#F7C59F', '#EFEFD0'],
    dayOfWeek: 'Tuesday',
    numbersSacred: [4, 8, 10],
    greeting: 'I create with intention',
    archetype: 'THE DIVINE ARCHITECT',
    qualities: [
      'Manifestation',
      'Creation',
      'Intention',
      'Abundance',
      'Material mastery',
      'Strategic vision'
    ],
    challenges: [
      'Greed',
      'Attachment to outcomes',
      'Workaholism',
      'Spiritual bypassing',
      'Material obsession'
    ],
    rulingPlanet: 'Mars',
    sacredAnimals: ['Wolf', 'Bear', 'Beaver'],
    plants: ['Oak', 'Cedar', 'Cinnamon'],
    offerings: [
      'Red candles',
      'Earth from your land',
      'Coins',
      'Spices',
      'Iron tools'
    ],
    chants: ['Eshu Bara', 'Ogun Ye', 'So soo'],
    symbols: ['Hammer', 'Anvil', 'Mountain', 'Builder'],
    mythology:
      'Missao as manifestation is the sacred energy of bringing the divine plan into material form. This path teaches that we are co-creators with the divine, manifesting our destiny through focused intention and aligned action. The divine architect shapes reality with precision, understanding that the form must serve the spirit.',
    spiritualLesson:
      'What we create reflects what we believe; manifest with purity of heart and alignment with divine will',
    affirmation: 'I co-create with the divine, manifesting my highest purpose in every moment',
    meditation:
      'See yourself as a vessel of divine creation, where every thought plants seeds in the garden of reality'
  }
];

export function getData(): MissaoData[] {
  return MISSAO_DATA;
}

function getDataById(id: string): MissaoData | undefined {
  return MISSAO_DATA.find((m) => m.id === id);
}

function searchData(query: string): MissaoData[] {
  const q = query.toLowerCase();
  return MISSAO_DATA.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.path.toLowerCase().includes(q) ||
      m.qualities.some((q) => q.toLowerCase().includes(q)) ||
      m.archetype.toLowerCase().includes(q)
  );
}

function getMissaoByDay(day: string): MissaoData[] {
  return MISSAO_DATA.filter((m) => m.dayOfWeek.toLowerCase().includes(day.toLowerCase()));
}

function getMissaoByElement(element: string): MissaoData[] {
  return MISSAO_DATA.filter((m) => m.element.toLowerCase().includes(element.toLowerCase()));
}