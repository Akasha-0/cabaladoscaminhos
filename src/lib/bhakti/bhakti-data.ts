/**
 * Bhakti data module
 * Provides devotional love and divine connection data for the Cabala dos Caminhos system
 */

export interface BhaktiRecord {
  id: string;
  name: string;
  description: string;
  practices: string[];
  associatedPaths: string[];
  emotion: string;
  offering: string[];
}

export interface BhaktiCycle {
  phase: string;
  description: string;
  duration: string;
}

export function getData(): {
  bhaktiRecords: BhaktiRecord[];
  cycles: BhaktiCycle[];
} {
  return {
    bhaktiRecords: [
      {
        id: 'devotion',
        name: 'Devotion (Bhakti)',
        description: 'The path of loving devotion toward the divine, surrendering the ego to cosmic love.',
        practices: ['Chanting', 'Prayer', 'Singing divine names', 'Ritual worship', 'Remembrance'],
        associatedPaths: ['Venus', 'Sefirot: Chesed', 'Moon'],
        emotion: 'Divine love',
        offering: ['Heart', 'Surrender', 'Devotion', 'Trust'],
      },
      {
        id: 'surrender',
        name: 'Surrender (Sharanagati)',
        description: 'Releasing the illusion of separation and surrendering to the divine will.',
        practices: ['Letting go', 'Acceptance', 'Spiritual guidance', 'Humble service'],
        associatedPaths: ['Moon', 'Sefirot: Binah', 'Saturn'],
        emotion: 'Humility',
        offering: ['Will', 'Control', 'Resistance', 'Fear'],
      },
      {
        id: 'love',
        name: 'Divine Love (Prem)',
        description: 'Cultivating unbounded love for the divine and all creation as sacred expressions.',
        practices: ['Loving-kindness meditation', 'Compassion practice', 'Heart opening', 'Unconditional love'],
        associatedPaths: ['Venus', 'Sefirot: Tiferet', 'Jupiter'],
        emotion: 'Love',
        offering: ['Heart', 'Compassion', 'Tenderness', 'Mercy'],
      },
      {
        id: 'worship',
        name: 'Worship (Puja)',
        description: 'Honoring the divine through ritual, offerings, and sacred ceremony.',
        practices: ['Temple worship', 'Altar devotion', 'Offerings', 'Ritual observance', 'Sacred items'],
        associatedPaths: ['Sun', 'Sefirot: Gevurah', 'Mars'],
        emotion: 'Reverence',
        offering: ['Honor', 'Service', 'Ritual', 'Sacrifice'],
      },
      {
        id: 'chanting',
        name: 'Chanting (Kirtan)',
        description: 'Singing divine names and sacred sounds as devotional practice.',
        practices: ['Group chanting', 'Mantra singing', 'Call and response', 'Sacred music', 'Rhythmic devotion'],
        associatedPaths: ['Jupiter', 'Sefirot: Netzach', 'Mercury'],
        emotion: 'Ecstasy',
        offering: ['Voice', 'Song', 'Sound', 'Vibration'],
      },
      {
        id: 'remembrance',
        name: 'Remembrance (Smaran)',
        description: 'Keeping the divine ever present through constant remembrance and mindfulness.',
        practices: ['Japa meditation', 'Sacred remembrance', 'Divine names', 'Mindful awareness', 'Heart focus'],
        associatedPaths: ['Mercury', 'Sefirot: Hod', 'Rahu'],
        emotion: 'Longing',
        offering: ['Attention', 'Memory', 'Awareness', 'Focus'],
      },
      {
        id: 'union',
        name: 'Union (Yoga)',
        description: 'Merging individual consciousness with divine consciousness through love.',
        practices: ['Bhakti meditation', 'Union practice', 'Dissolution of ego', 'Divine absorption', 'Self-offering'],
        associatedPaths: ['Ketu', 'Sefirot: Keter', 'Sun'],
        emotion: 'Oneness',
        offering: ['Self', 'Identity', 'Separation', 'Desire'],
      },
    ],
    cycles: [
      {
        phase: 'Attraction',
        description: 'Drawn toward the divine through beauty and grace',
        duration: 'Until heart opens',
      },
      {
        phase: 'Aspiration',
        description: 'Seeking connection and drawing closer to the divine',
        duration: 'Until devotion deepens',
      },
      {
        phase: 'Connection',
        description: 'Establishing relationship with the divine through practice',
        duration: 'Throughout the journey',
      },
      {
        phase: 'Devotion',
        description: 'Deepening love and surrendering to divine will',
        duration: 'Life-long refinement',
      },
      {
        phase: 'Union',
        description: 'Merging individual love with universal divine love',
        duration: 'The fruit of devotion',
      },
      {
        phase: 'Absorption',
        description: 'Being absorbed in divine love beyond separation',
        duration: 'Eternal communion',
      },
      {
        phase: 'Service',
        description: 'Returning to serve creation from a place of divine love',
        duration: 'As love overflows',
      },
    ],
  };
}