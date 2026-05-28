export interface PlanetaryCorrespondence {
  name: string;
  namePt: string;
  symbol: string;
  glyph: string;
  day: string;
  metal: string;
  stone: string[];
  color: string;
  colorHex: string;
  element: string;
  qualities: string[];
  keywords: string[];
  chakra: string;
  tarotCard?: string;
  orb?: string;
  domicile: string;
  exaltation: string;
  fall: string;
  detriment: string;
  description: string;
  descriptionPt: string;
}

const planetaryCorrespondences: PlanetaryCorrespondence[] = [
  {
    name: 'Sol',
    namePt: 'Sol',
    symbol: '☉',
    glyph: 'circle with dot',
    day: 'Domingo',
    metal: 'Ouro',
    stone: ['Heliotrópio', 'Diamante', 'Âmbar'],
    color: 'Amarelo dourado',
    colorHex: '#FFD700',
    element: 'Fogo',
    qualities: ['Cardinal', 'Diurno', 'Quente', 'Seco', 'Masculino'],
    keywords: ['consciência', ' ego', 'vitalidade', 'espírito', 'autoridade', 'criatividade'],
    chakra: 'Manipura',
    tarotCard: 'O Sol (XIX)',
    orb: '1°',
    domicile: 'Leão',
    exaltation: 'Áries',
    fall: 'Libra',
    detriment: 'Aquário',
    description: 'Represents the conscious mind, ego, vitality, and spirit. The center of the solar system symbolizes the core self and life force.',
    descriptionPt: 'Representa a mente consciente, o ego, a vitalidade e o espírito. O centro do sistema solar simboliza o eu central e a força vital.',
  },
  {
    name: 'Lua',
    namePt: 'Lua',
    symbol: '☽',
    glyph: 'crescent moon',
    day: 'Segunda-feira',
    metal: 'Prata',
    stone: ['Pérola', 'Moonstone', 'Selenite', 'Crisocola'],
    color: 'Branco prateado',
    colorHex: '#C0C0C0',
    element: 'Água',
    qualities: ['Cardinal', 'Noturno', 'Frio', 'Úmido', 'Feminino'],
    keywords: ['emoção', 'intuição', 'memória', 'subconsciente', 'nutrição', 'ciclos'],
    chakra: 'Svadhisthana',
    tarotCard: 'A Lua (XVIII)',
    orb: '12°',
    domicile: 'Câncer',
    exaltation: 'Touro',
    fall: 'Escorpião',
    detriment: 'Capricórnio',
    description: 'Represents the emotional nature, intuition, memory, and the subconscious. Governs the rhythm of life and nurturing instincts.',
    descriptionPt: 'Representa a natureza emocional, a intuição, a memória e o subconsciente. Governa o ritmo da vida e os instintos de nutrição.',
  },
  {
    name: 'Mercúrio',
    namePt: 'Mercúrio',
    symbol: '☿',
    glyph: 'circle with crescent above',
    day: 'Quarta-feira',
    metal: 'Mercúrio',
    stone: ['Ágata', 'Cornalina', 'Turquesa'],
    color: 'Amarelo',
    colorHex: '#FFFF00',
    element: 'Ar',
    qualities: ['Comum', 'Diurno', 'Quente', 'Úmido', 'Masculino'],
    keywords: ['comunicação', 'inteligência', 'comércio', 'viagem', 'habilidade', 'juventude'],
    chakra: 'Vishuddha',
    tarotCard: 'O Mago (I)',
    orb: '7°',
    domicile: 'Gêmeos, Virgem',
    exaltation: 'Virgem',
    fall: 'Peixes',
    detriment: 'Sagitário',
    description: 'Governs communication, intelligence, commerce, travel, and mental agility. The messenger of the gods mediates between worlds.',
    descriptionPt: 'Governa a comunicação, a inteligência, o comércio, as viagens e a agilidade mental. O mensageiro dos deuses media entre os mundos.',
  },
  {
    name: 'Vênus',
    namePt: 'Vênus',
    symbol: '♀',
    glyph: 'circle with cross below',
    day: 'Sexta-feira',
    metal: 'Cobre',
    stone: ['Turquesa', 'Malaquita', 'Jade', 'Quartzo Rosa'],
    color: 'Verde claro',
    colorHex: '#90EE90',
    element: 'Terra',
    qualities: ['Comum', 'Noturno', 'Frio', 'Úmido', 'Feminino'],
    keywords: ['amor', 'beleza', 'arte', 'harmonia', 'prazer', 'relacionamento'],
    chakra: 'Anahata',
    tarotCard: 'A Imperatriz (III)',
    orb: '7°',
    domicile: 'Touro, Libra',
    exaltation: 'Peixes',
    fall: 'Virgem',
    detriment: 'Escorpião',
    description: 'Represents love, beauty, art, harmony, and pleasure. Governs relationships and aesthetic appreciation.',
    descriptionPt: 'Representa o amor, a beleza, a arte, a harmonia e o prazer. Governa os relacionamentos e a apreciação estética.',
  },
  {
    name: 'Marte',
    namePt: 'Marte',
    symbol: '♂',
    glyph: 'circle with arrow',
    day: 'Terça-feira',
    metal: 'Ferro',
    stone: ['Cornalina', 'Rubi', 'Olho de Tigre', 'Hematita'],
    color: 'Vermelho',
    colorHex: '#FF0000',
    element: 'Fogo',
    qualities: ['Cardinal', 'Noturno', 'Quente', 'Seco', 'Masculino'],
    keywords: ['ação', 'energia', 'força', 'assertividade', 'paixão', 'conflito'],
    chakra: 'Manipura',
    tarotCard: 'O Imperador (IV)',
    orb: '7°',
    domicile: 'Áries, Escorpião',
    exaltation: 'Capricórnio',
    fall: 'Câncer',
    detriment: 'Libra',
    description: 'Represents action, energy, force, and assertiveness. The god of war embodies passion, drive, and conflict.',
    descriptionPt: 'Representa a ação, a energia, a força e a assertividade. O deus da guerra embodies paixão, drive e conflito.',
  },
  {
    name: 'Júpiter',
    namePt: 'Júpiter',
    symbol: '♃',
    glyph: 'circle with cross above and two curves',
    day: 'Quinta-feira',
    metal: 'Estanho',
    stone: ['Lápis-lazúli', 'Ametista', 'Turquesa'],
    color: 'Azul royal',
    colorHex: '#4169E1',
    element: 'Fogo',
    qualities: ['Mútavel', 'Noturno', 'Quente', 'Úmido', 'Masculino'],
    keywords: ['expansão', 'abundância', 'sabedoria', 'otimismo', 'justiça', 'religião'],
    chakra: 'Sahasrara',
    tarotCard: 'A Temperança (XIV)',
    orb: '9°',
    domicile: 'Sagitário, Peixes',
    exaltation: 'Câncer',
    fall: 'Capricórnio',
    detriment: 'Gêmeos',
    description: 'Represents expansion, abundance, wisdom, and optimism. The greatest benefic symbolizes growth and higher learning.',
    descriptionPt: 'Representa a expansão, a abundância, a sabedoria e o otimismo. O maior benéfico simboliza crescimento e aprendizado superior.',
  },
  {
    name: 'Saturno',
    namePt: 'Saturno',
    symbol: '♄',
    glyph: 'circle with cross below and curve',
    day: 'Sábado',
    metal: 'Chumbo',
    stone: ['Ônix', 'Granada', 'Turmalina Negra'],
    color: 'Preto',
    colorHex: '#1C1C1C',
    element: 'Terra',
    qualities: ['Cardinal', 'Diurno', 'Frio', 'Seco', 'Masculino'],
    keywords: ['limite', 'estrutura', 'disciplina', 'karma', 'tempo', 'responsabilidade'],
    chakra: 'Muladhara',
    tarotCard: 'O Mundo (XXI)',
    orb: '9°',
    domicile: 'Capricórnio, Aquário',
    exaltation: 'Libra',
    fall: 'Áries',
    detriment: 'Câncer',
    description: 'Represents limitation, structure, discipline, and karma. The taskmaster teaches through restrictions and time.',
    descriptionPt: 'Representa a limitação, a estrutura, a disciplina e o carma. O mestre de obras ensina através de restrições e tempo.',
  },
  {
    name: 'Urano',
    namePt: 'Urano',
    symbol: '♅',
    glyph: 'circle with H and rays',
    day: 'Domingo',
    metal: 'Uranium/Platinum',
    stone: ['Moldavita', 'Ametista', 'Citrino'],
    color: 'Azul elétrico',
    colorHex: '#00BFFF',
    element: 'Ar',
    qualities: ['Fixo', 'Diurno', 'Quente', 'Elétrico', 'Masculino'],
    keywords: ['revolução', 'libertad', 'inovação', 'originalidade', 'ruptura', 'genialidade'],
    chakra: 'Ajna',
    tarotCard: 'A Estrela (XVII)',
    orb: '5°',
    domicile: 'Aquário',
    exaltation: 'Escorpião',
    fall: 'Touro',
    detriment: 'Leão',
    description: 'Represents revolution, freedom, innovation, and originality. The great awakener breaks old patterns for new paradigms.',
    descriptionPt: 'Representa a revolução, a liberdade, a inovação e a originalidade. O grande despertador quebra padrões antigos para novos paradigmas.',
  },
  {
    name: 'Netuno',
    namePt: 'Netuno',
    symbol: '♆',
    glyph: 'circle with trident',
    day: 'Segunda-feira',
    metal: 'Bronze',
    stone: ['Aguamarinha', 'Alexandrita', 'Ambar'],
    color: 'Azul marinho',
    colorHex: '#000080',
    element: 'Água',
    qualities: ['Fixo', 'Noturno', 'Frio', 'Úmido', 'Feminino'],
    keywords: ['transcendência', 'sonho', 'intuição', 'ilusão', 'espírito', 'música'],
    chakra: 'Sahasrara',
    tarotCard: 'A Lua (XVIII)',
    orb: '5°',
    domicile: 'Peixes',
    exaltation: 'Câncer',
    fall: 'Capricórnio',
    detriment: 'Virgem',
    description: 'Represents transcendence, dreams, intuition, and illusion. The god of the sea dissolves boundaries into spiritual unity.',
    descriptionPt: 'Representa a transcendência, os sonhos, a intuição e a ilusão. O deus do mar dissolve fronteiras em unidade espiritual.',
  },
  {
    name: 'Plutão',
    namePt: 'Plutão',
    symbol: '♇',
    glyph: 'circle with P and L interlaced',
    day: 'Terça-feira',
    metal: 'Titânio',
    stone: ['Obsidiana', 'Turmalina', 'Dumortierita'],
    color: 'Índigo',
    colorHex: '#4B0082',
    element: 'Água',
    qualities: ['Fixo', 'Noturno', 'Frio', 'Seco', 'Masculino'],
    keywords: ['transformação', 'regeneração', 'morte', 'renascimento', 'poder', 'subconsciente'],
    chakra: 'Muladhara',
    tarotCard: 'A Morte (XIII)',
    orb: '5°',
    domicile: 'Escorpião',
    exaltation: 'Touro',
    fall: 'Escorpião',
    detriment: 'Touro',
    description: 'Represents transformation, regeneration, death, and rebirth. The god of the underworld governs profound psychological depths.',
    descriptionPt: 'Representa a transformação, a regeneração, a morte e o renascimento. O deus do mundo inferior governa profundezas psicológicas profundas.',
  },
];

export function getCorrespondences(): PlanetaryCorrespondence[] {
  return planetaryCorrespondences;
}

export function getCorrespondencesByName(name: string): PlanetaryCorrespondence | undefined {
  return planetaryCorrespondences.find(
    (p) => p.name.toLowerCase() === name.toLowerCase() ||
          p.namePt.toLowerCase() === name.toLowerCase() ||
          p.symbol === name
  );
}

export function getCorrespondencesByDay(day: string): PlanetaryCorrespondence | undefined {
  return planetaryCorrespondences.find(
    (p) => p.day.toLowerCase() === day.toLowerCase()
  );
}

export function getCorrespondencesByChakra(chakra: string): PlanetaryCorrespondence[] {
  return planetaryCorrespondences.filter(
    (p) => p.chakra.toLowerCase() === chakra.toLowerCase()
  );
}

export function getCorrespondencesByElement(element: string): PlanetaryCorrespondence[] {
  return planetaryCorrespondences.filter(
    (p) => p.element.toLowerCase() === element.toLowerCase()
  );
}

export function getDomicilePlanets(sign: string): PlanetaryCorrespondence[] {
  return planetaryCorrespondences.filter(
    (p) => p.domicile.toLowerCase().includes(sign.toLowerCase())
  );
}

export function getExaltationPlanets(sign: string): PlanetaryCorrespondence[] {
  return planetaryCorrespondences.filter(
    (p) => p.exaltation.toLowerCase() === sign.toLowerCase()
  );
}
