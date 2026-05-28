/**
 * Dharma data module
 * Provides dharma wisdom and virtuous path data for the Cabala dos Caminhos system
 */

export interface DharmaRecord {
  id: string;
  name: string;
  description: string;
  principles: string[];
  associatedPaths: string[];
  virtue: string;
  lessons: string[];
}

export interface DharmaCycle {
  phase: string;
  description: string;
  duration: string;
}

export function getData(): {
  dharmaRecords: DharmaRecord[];
  cycles: DharmaCycle[];
} {
  return {
    dharmaRecords: [
      {
        id: 'truth',
        name: 'Truth (Satya)',
        description: 'Living in alignment with cosmic truth and speaking with integrity.',
        principles: ['Honesty', 'Integrity', 'Authenticity', 'Clarity'],
        associatedPaths: ['Jupiter', 'Sefirot: Chesed', 'Mercury'],
        virtue: 'Truthfulness',
        lessons: ['Speak only what serves the highest good', 'Live in alignment with your deepest knowing'],
      },
      {
        id: 'nonviolence',
        name: 'Non-violence (Ahimsa)',
        description: 'Practicing harmlessness in thought, word, and deed.',
        principles: ['Compassion', 'Gentleness', 'Peace', 'Reverence for all life'],
        associatedPaths: ['Venus', 'Sefirot: Tiferet', 'Moon'],
        virtue: 'Compassion',
        lessons: ['Cultivate kindness in every interaction', 'Choose peace over conflict'],
      },
      {
        id: 'righteousness',
        name: 'Righteousness (Dharma)',
        description: 'Walking the path of right action and ethical living.',
        principles: ['Justice', 'Fairness', 'Duty', 'Service'],
        associatedPaths: ['Mars', 'Sefirot: Gevurah', 'Sun'],
        virtue: 'Righteousness',
        lessons: ['Act in accordance with your highest self', 'Serve others with humility'],
      },
      {
        id: 'compassion',
        name: 'Compassion (Karuna)',
        description: 'Feeling with others and responding to suffering with love.',
        principles: ['Empathy', 'Understanding', 'Support', 'Nurturing'],
        associatedPaths: ['Moon', 'Sefirot: Binah', 'Venus'],
        virtue: 'Compassion',
        lessons: ['See yourself in every being', 'Offer help without expectation'],
      },
      {
        id: 'detachment',
        name: 'Detachment (Vairagya)',
        description: 'Holding lightly to outcomes while acting with full commitment.',
        principles: ['Letting go', 'Equanimity', 'Freedom', 'Inner peace'],
        associatedPaths: ['Saturn', 'Sefirot: Hod', 'Ketu'],
        virtue: 'Equanimity',
        lessons: ['Do your part, release the rest', 'Find freedom in impermanence'],
      },
      {
        id: 'discernment',
        name: 'Discernment (Viveka)',
        description: 'Discriminating between the real and the unreal, the lasting and the fleeting.',
        principles: ['Wisdom', 'Discrimination', 'Clarity', 'Insight'],
        associatedPaths: ['Mercury', 'Sefirot: Daat', 'Rahu'],
        virtue: 'Wisdom',
        lessons: ['Seek the truth beneath appearances', 'Choose what endures'],
      },
      {
        id: 'contentment',
        name: 'Contentment (Santosha)',
        description: 'Finding peace and fulfillment in the present moment.',
        principles: ['Gratitude', 'Acceptance', 'Satisfaction', 'Inner wealth'],
        associatedPaths: ['Jupiter', 'Sefirot: Netzach', 'Venus'],
        virtue: 'Contentment',
        lessons: ['Appreciate what is', 'True wealth is inner'],
      },
    ],
    cycles: [
      {
        phase: 'Awakening',
        description: 'Recognition of dharmic duty and spiritual purpose',
        duration: 'Until clarity emerges',
      },
      {
        phase: 'Practice',
        description: 'Living virtuously through conscious action',
        duration: 'Ongoing throughout life',
      },
      {
        phase: 'Service',
        description: 'Serving others aligned with one\'s dharma',
        duration: 'Natural expression when ready',
      },
      {
        phase: 'Integration',
        description: ' embodying dharma as second nature',
        duration: 'Life-long refinement',
      },
      {
        phase: 'Transcendence',
        description: 'Beyond duty, acting from pure essence',
        duration: 'The fruit of devoted practice',
      },
      {
        phase: 'Liberation',
        description: 'Moksha through perfect dharmic action',
        duration: 'Eternal',
      },
      {
        phase: 'Return',
        description: 'Returning to serve from liberated state',
        duration: 'As needed by the world',
      },
    ],
  };
}