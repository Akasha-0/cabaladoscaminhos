/**
 * Reincarnation data module
 * Provides reincarnation wisdom and soul journey data for the Cabala dos Caminhos system
 */

export interface ReincarnationRecord {
  id: string;
  name: string;
  description: string;
  cycle: string;
  associatedPaths: string[];
  lessons: string[];
  integrationFocus: string;
}

export interface SoulCycle {
  phase: string;
  description: string;
  duration: string;
}

export interface PastLifeArchetype {
  id: string;
  name: string;
  characteristics: string[];
  karmicTheme: string;
}

export function getData(): {
  reincarnationRecords: ReincarnationRecord[];
  soulCycles: SoulCycle[];
  archetypes: PastLifeArchetype[];
} {
  return {
    reincarnationRecords: [
      {
        id: 'soul-descent',
        name: 'Soul Descent',
        description: 'The incarnation process where the soul descends from spirit into form.',
        cycle: 'Entry',
        associatedPaths: ['Spirit', 'Form', 'Descent'],
        lessons: ['Surrender to the journey', 'Accept incarnation with grace'],
        integrationFocus: 'Embracing physical embodiment',
      },
      {
        id: 'early-life',
        name: 'Early Life Learning',
        description: 'Soul awakens through childhood experiences and initial karmic encounters.',
        cycle: 'Awakening',
        associatedPaths: ['Childhood', 'Family', 'First Lessons'],
        lessons: ['Trust the learning process', 'Accept guidance from caregivers'],
        integrationFocus: 'Opening to instruction and growth',
      },
      {
        id: 'karmic-patterns',
        name: 'Karmic Patterns',
        description: 'Recognizing and transforming repetitive patterns from past lives.',
        cycle: 'Recognition',
        associatedPaths: ['Karma', 'Pattern Recognition', 'Transformation'],
        lessons: ['See patterns with compassion', 'Choose differently this time'],
        integrationFocus: 'Breaking unconscious cycles',
      },
      {
        id: 'soul-purpose',
        name: 'Soul Purpose Discovery',
        description: 'Uncovering the unique mission and gifts the soul brings to this life.',
        cycle: 'Discovery',
        associatedPaths: ['Purpose', 'Calling', 'Mission'],
        lessons: ['Listen to inner guidance', 'Follow your unique path'],
        integrationFocus: 'Living from authentic purpose',
      },
      {
        id: 'life-review',
        name: 'Life Review',
        description: 'Soul evaluates experiences, relationships, and growth achieved.',
        cycle: 'Integration',
        associatedPaths: ['Reflection', 'Wisdom', 'Synthesis'],
        lessons: ['Learn from every experience', 'Honor your journey'],
        integrationFocus: 'Integrating life lessons',
      },
      {
        id: 'transition',
        name: 'Spiritual Transition',
        description: 'Deepening spiritual practice and transcending ego attachments.',
        cycle: 'Transcendence',
        associatedPaths: ['Spirit', 'Transcendence', 'Unity'],
        lessons: ['Release ego identifications', 'Merge with higher purpose'],
        integrationFocus: 'Spiritual maturity',
      },
      {
        id: 'homecoming',
        name: 'Homecoming',
        description: 'Soul prepares to return to spirit, completing the incarnation cycle.',
        cycle: 'Return',
        associatedPaths: ['Spirit', 'Home', 'Eternity'],
        lessons: ['Complete unfinished business', 'Bless your experiences'],
        integrationFocus: 'Peaceful return to source',
      },
    ],
    soulCycles: [
      {
        phase: 'Entry',
        description: 'Soul chooses incarnation and descends into physical form',
        duration: 'At conception/birth',
      },
      {
        phase: 'Awakening',
        description: 'Emerging consciousness through childhood and early experiences',
        duration: 'Infancy to early adulthood',
      },
      {
        phase: 'Recognition',
        description: 'Awareness of soul journey and karmic imprints',
        duration: 'Throughout adult life',
      },
      {
        phase: 'Discovery',
        description: 'Uncovering soul purpose and life mission',
        duration: 'Key transformative periods',
      },
      {
        phase: 'Integration',
        description: 'Synthesizing experiences into wisdom',
        duration: 'Mature years',
      },
      {
        phase: 'Transcendence',
        description: 'Transcending limitations and embodying higher Self',
        duration: 'Spiritual maturity',
      },
      {
        phase: 'Return',
        description: 'Completing the cycle and returning to source',
        duration: 'At physical death and beyond',
      },
    ],
    archetypes: [
      {
        id: 'seeker',
        name: 'The Seeker',
        characteristics: ['Questioning', 'Exploring', 'Searching for truth', 'Independent'],
        karmicTheme: 'Finding meaning and purpose',
      },
      {
        id: 'healer',
        name: 'The Healer',
        characteristics: ['Compassionate', 'Nurturing', 'Restorative', 'Intuitive'],
        karmicTheme: 'Alleviating suffering and restoring balance',
      },
      {
        id: 'warrior',
        name: 'The Warrior',
        characteristics: ['Brave', 'Determined', 'Protective', 'Strategic'],
        karmicTheme: 'Defending the vulnerable and overcoming obstacles',
      },
      {
        id: 'sage',
        name: 'The Sage',
        characteristics: ['Wise', 'Teaching', 'Philosophical', 'Authoritative'],
        karmicTheme: 'Sharing wisdom and guiding others',
      },
      {
        id: 'lover',
        name: 'The Lover',
        characteristics: ['Passionate', 'Harmonizing', 'Creating beauty', 'Devoted'],
        karmicTheme: 'Cultivating love and creating unions',
      },
      {
        id: 'creator',
        name: 'The Creator',
        characteristics: ['Innovative', 'Imaginative', 'Expressive', 'Visionary'],
        karmicTheme: 'Bringing new realities into existence',
      },
      {
        id: 'ruler',
        name: 'The Ruler',
        characteristics: ['Responsible', 'Organizing', 'Leading', 'Decisive'],
        karmicTheme: 'Establishing order and governing wisely',
      },
      {
        id: 'innocent',
        name: 'The Innocent',
        characteristics: ['Pure', 'Trusting', 'Joyful', 'Optimistic'],
        karmicTheme: 'Experiencing wonder and maintaining faith',
      },
    ],
  };
}
