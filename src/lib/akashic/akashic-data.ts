/**
 * Akashic data module
 * Provides Akashic records and cosmic memory data for the Cabala dos Caminhos system
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AkashicRecord {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  associatedPaths: string[];
  category: string;
  accessMethods: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AkashicDimension {
  dimension: string;
  description: string;
  frequency: number;
}

export function getData(): {
  records: AkashicRecord[];
  dimensions: AkashicDimension[];
} {
  return {
    records: [
      {
        id: 'cosmic-akashic',
        name: 'Cosmic Akashic Record',
        description: 'The universal library containing all cosmic events and energies.',
        characteristics: [
          'Universal memory',
          'Cosmic events record',
          'Star system histories',
          'Galactic evolution',
          'Multidimensional awareness'
        ],
        associatedPaths: ['cosmic', 'infinite', 'source'],
        category: 'universal',
        accessMethods: [
          'Deep meditation states',
          'Cosmic consciousness expansion',
          'Star gate activation'
        ]
      },
      {
        id: 'soul-akashic',
        name: 'Soul Akashic Record',
        description: 'The personal chronicle of a souls journey through incarnations.',
        characteristics: [
          'Soul journey timeline',
          'Past life memories',
          'Karmic patterns',
          'Spiritual evolution',
          'Soul purpose'
        ],
        associatedPaths: ['soul', 'reincarnation', 'karma'],
        category: 'personal',
        accessMethods: [
          'Past life regression',
          'Soul retrieval',
          'Inner child healing'
        ]
      },
      {
        id: 'planetary-akashic',
        name: 'Planetary Akashic Record',
        description: 'Earths collective memory and the history of civilizations.',
        characteristics: [
          'Earth memory',
          'Civilization records',
          'Ancestral wisdom',
          'Earth healing frequencies',
          'Gaia consciousness'
        ],
        associatedPaths: ['earth', 'ancestor', 'wisdom'],
        category: 'planetary',
        accessMethods: [
          'Earth-based rituals',
          'Ancestral connection',
          'Gaia meditation'
        ]
      },
      {
        id: 'celestial-akashic',
        name: 'Celestial Akashic Record',
        description: 'The cosmic archives of celestial beings and divine plans.',
        characteristics: [
          'Divine blueprint',
          'Celestial being histories',
          'Angelic records',
          'Ascended master teachings',
          'Light language'
        ],
        associatedPaths: ['divine', 'light', 'ascension'],
        category: 'celestial',
        accessMethods: [
          'Divine channeling',
          'Light language activation',
          'Ascended master connection'
        ]
      },
      {
        id: 'crystal-akashic',
        name: 'Crystal Akashic Record',
        description: 'The dimensional memory stored in crystal matrices and sacred geometry.',
        characteristics: [
          'Crystal memory storage',
          'Sacred geometry patterns',
          'Frequency encoding',
          'Light codes',
          'Geometric consciousness'
        ],
        associatedPaths: ['crystal', 'geometry', 'lightbody'],
        category: 'dimensional',
        accessMethods: [
          'Crystal healing sessions',
          'Sacred geometry meditation',
          'Light code activation'
        ]
      },
      {
        id: 'timeline-akashic',
        name: 'Timeline Akashic Record',
        description: 'The branching paths of possibility and actualized futures.',
        characteristics: [
          'Future possibilities',
          'Timeline convergence',
          'Probability fields',
          'Choice consequences',
          'Destiny pathways'
        ],
        associatedPaths: ['destiny', 'choice', 'manifest'],
        category: 'temporal',
        accessMethods: [
          'Timeline journeying',
          'Probability meditation',
          'Future self connection'
        ]
      }
    ],
    dimensions: [
      {
        dimension: 'dimensional-akashic',
        description: 'Records existing across multiple dimensions and realities simultaneously',
        frequency: 888
      },
      {
        dimension: 'frequency-akashic',
        description: 'Information stored as pure vibrational frequencies and light codes',
        frequency: 999
      },
      {
        dimension: 'consciousness-akashic',
        description: 'Akashic data encoded within the fabric of consciousness itself',
        frequency: 777
      },
      {
        dimension: 'eternal-akashic',
        description: 'Timeless records existing before the concept of time was created',
        frequency: 555
      }
    ]
  };
}