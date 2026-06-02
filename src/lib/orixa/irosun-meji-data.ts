// @ts-nocheck
// SKIP_LINT

/**
 * Irosun Meji Data
 * Odu of introspection, spiritual awakening, and the power of silence
 * The moment when the spirit turns inward to receive divine wisdom
 */

// Irosun Meji represents the duality of spiritual reflection
// where two mirrors face each other to reveal hidden truths
// Governed by the forces of introspection and divine revelation
// Element: Fire/Earth
// Represents spiritual vision, ancestral connection, and inner knowing

export interface IrosunMejiOdu {
  id: string;
  name: string;
  portugueseName: string;
  order: number;
  polarity: 'masculine' | 'feminine';
  element: string;
  planets: string[];
  sephirot: string[];
  sign: string;
  dayOfWeek: string;
  direction: string;
  colors: string[];
  offerings: string[];
  ebos: Ebo[];
  quizilas: string[];
  strengths: string[];
  weaknesses: string[];
  health: string[];
  meanings: string[];
  ifaMessage: string;
  orixas: string[];
  sacredFrequencies: string[];
  chakra: string;
  herbs: string[];
  affirmations: string[];
  meditation: string;
}

export interface Ebo {
  type: string;
  description: string;
  ingredients: string[];
  timing: string;
  intention: string;
}

const IROSUN_MEJI_DATA: IrosunMejiOdu = {
  id: 'irosun-meji',
  name: 'Irosun Meji',
  portugueseName: 'Irosun Meji',
  order: 8,
  polarity: 'feminine',
  element: 'Fogo e Terra',
  planets: ['Sol', 'Mercúrio'],
  sephirot: ['Chokmah', 'Hod', 'Netzach'],
  sign: 'Oxumar, Ossaim',
  dayOfWeek: 'Domingo',
  direction: 'Leste',
  colors: ['Vermelho', 'Preto', 'Dourado'],
  offerings: [
    'Eru',
    'Opon Ifá',
    'Akара',
    'Mel',
    'Pалм wine',
    'Pombas',
    'Djin djin',
    'Coconut water'
  ],
  ebos: [
    {
      type: 'Iropesi',
      description: 'Offering to open spiritual vision and receive ancestral messages',
      ingredients: [
        'Pombas brancas',
        'Mel',
        'Pалм wine',
        'Eru',
        'Coconut oil',
        'White cloth',
        'Mirror'
      ],
      timing: 'Sunday at dawn or during new moon',
      intention: 'To awaken inner sight and connect with ancestral wisdom'
    },
    {
      type: 'IROSUN',
      description: 'Spiritual cleansing to remove obstacles from spiritual path',
      ingredients: [
        'Guia',
        'Eru',
        'Pombas',
        'Omi gidigbo',
        'Ishu',
        'Miracle leaf',
        'Perfume'
      ],
      timing: 'Wednesday night or during spiritual consultations',
      intention: 'To cleanse spiritual blockages and open the path to success'
    },
    {
      type: 'Itutu',
      description: 'Cooling ritual to pacify spirits and remove spiritual heat',
      ingredients: [
        'Coconut water',
        'White cloth',
        'Perfume',
        'White flowers',
        'Pombas brancas',
        'Eru'
      ],
      timing: 'During periods of spiritual agitation or before important decisions',
      intention: 'To cool spiritual heat and bring peace to the spirit'
    },
    {
      type: 'Ibi',
      description: 'Ritual to appease angry spirits and remove spiritual obstacles',
      ingredients: [
        'Black hen',
        'Eru',
        'Palm oil',
        'Ishu',
        'Yam flour',
        'Salt'
      ],
      timing: 'When facing spiritual opposition or during difficult times',
      intention: 'To appease spirits and remove obstacles from life path'
    }
  ],
  quizilas: [
    'Never refuse to help someone in spiritual need',
    'Never break an oath made to your ancestors',
    'Never speak negatively about the dead',
    'Never ignore the signs from dreams',
    'Never refuse to give alms to the poor',
    'Never be disrespectful to elders',
    'Never make important decisions without consulting Ifa',
    'Never neglect your spiritual obligations'
  ],
  strengths: [
    'Strong spiritual vision and intuition',
    'Deep connection to ancestral wisdom',
    'Ability to see what others cannot see',
    'Powerful healing abilities',
    'Natural mediumistic capacity',
    'Wisdom in spiritual matters',
    'Ability to interpret signs and omens',
    'Strong connection to the spirit world'
  ],
  weaknesses: [
    'Tendency to be too introspective',
    'Can become too focused on the spiritual realm',
    'May neglect practical matters',
    'Vulnerable to spiritual attacks',
    'Can be too sensitive to criticism',
    'May struggle with indecision',
    'Can become isolated from others',
    'Prone to spiritual anxiety'
  ],
  health: [
    'Eye problems and vision disturbances',
    'Nervous system imbalances',
    'Spiritual anxiety and restlessness',
    'Digestive issues related to stress',
    'Sleep disorders and dream disturbances',
    'Headaches related to spiritual overexertion',
    'Throat and neck tensions',
    'Blood pressure irregularities'
  ],
  meanings: [
    'The need for deep spiritual introspection',
    'Warning against spiritual complacency',
    'Call to awaken inner vision and wisdom',
    'Message about the power of silence and listening',
    'Indication of hidden truths waiting to be revealed',
    'Warning about spiritual dangers and enemies',
    'Opportunity for spiritual transformation and growth',
    'Call to honor your ancestral connections'
  ],
  ifaMessage: 'Irosun Meji speaks of the power that lies in silence and introspection. When this Odu appears, it is a reminder that true wisdom comes from within. The practitioner must learn to listen to the still small voice that speaks from the depths of the spirit. There are hidden truths that can only be seen when we turn our gaze inward. This is a time for spiritual cleansing, for honoring your ancestors, and for preparing to receive divine revelation. The spirits are watching, and they will reveal their secrets to those who approach with humility and respect.',
  orixas: ['Oxumar', 'Ossaim', 'Obatalá', 'Orunmila'],
  sacredFrequencies: [
    '432 Hz - Spiritual awakening frequency',
    '528 Hz - Transformation and miracles',
    '639 Hz - Connection and harmony',
    '741 Hz - Intuition and spiritual expression',
    '852 Hz - Third eye activation'
  ],
  chakra: 'Ajna (Third Eye)',
  herbs: [
    'Eru (Pterocarpus soyauxii)',
    'Ewe Oyin (Honey leaf)',
    'Ewe Irosun (Sacred herb)',
    'Ewe Efin (Wild herbs)',
    'Ewe Owu (Cotton leaf)',
    'Ewe Arun (Miracle leaf)',
    'Ewe Parami (Guinea hen weed)',
    'Ewe Alabukun (Clove leaf)',
    'Ewe Ewuro (Bitter leaf)',
    'Ewe Opoto (Sour grass)'
  ],
  affirmations: [
    'I open my inner vision to see the truth',
    'My spirit speaks with wisdom and clarity',
    'I honor my ancestors and receive their blessing',
    'I am connected to divine wisdom and guidance',
    'My spiritual sight is clear and true',
    'I release all obstacles from my spiritual path',
    'I am a vessel for divine revelation',
    'My introspection leads me to truth and understanding'
  ],
  meditation: 'Find a quiet place where you will not be disturbed. Sit in a comfortable position with your spine straight. Close your eyes and begin to notice your breath. As you breathe, imagine that you are looking into two mirrors facing each other, creating an infinite reflection of your inner self. With each breath, go deeper into your own reflection. Ask your ancestors to reveal the truths that you need to see. Listen for their response in the silence. When you receive their message, hold it close to your heart. Slowly bring your awareness back to the room, carrying the wisdom you have received with you.'
};

export function getData(): IrosunMejiOdu {
  return IROSUN_MEJI_DATA;
}

function getDataById(id: string): IrosunMejiOdu | undefined {
  return id === 'irosun-meji' ? IROSUN_MEJI_DATA : undefined;
}

function getHerbs(): string[] {
  return IROSUN_MEJI_DATA.herbs;
}

function getRituals(): Ebo[] {
  return IROSUN_MEJI_DATA.ebos;
}

function getOrixas(): string[] {
  return IROSUN_MEJI_DATA.orixas;
}

function getQuizilas(): string[] {
  return IROSUN_MEJI_DATA.quizilas;
}

function getSacredFrequencies(): string[] {
  return IROSUN_MEJI_DATA.sacredFrequencies;
}

function getAffirmations(): string[] {
  return IROSUN_MEJI_DATA.affirmations;
}

function getMeditation(): string {
  return IROSUN_MEJI_DATA.meditation;
}

export default getData;