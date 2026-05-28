// Panchakarma practice module

export interface PanchakarmaPractice {
  id: string;
  name: string;
  description: string;
  phase: 'preparation' | 'main' | 'post-treatment';
  duration?: string;
  benefits?: string[];
  contraindications?: string[];
}

const practices: PanchakarmaPractice[] = [
  {
    id: 'snehana',
    name: 'Snehana (Oleation)',
    description: 'Internal and external oleation therapy using medicated ghee or oils to loosen toxins.',
    phase: 'preparation',
    duration: '3-7 days',
    benefits: ['Lubricates tissues', 'Loosens ama (toxins)', 'Prepares body for cleansing'],
  },
  {
    id: 'swedana',
    name: 'Swedana (Sudation)',
    description: 'Therapeutic sweating to open channels and promote toxin elimination.',
    phase: 'preparation',
    duration: '3-7 days',
    benefits: ['Opens pores', 'Promotes sweating', 'Relieves stiffness'],
    contraindications: ['Severe heart conditions', 'Pregnancy'],
  },
  {
    id: 'vamana',
    name: 'Vamana (Therapeutic Emesis)',
    description: 'Controlled therapeutic vomiting to eliminate excess Kapha and toxins from the stomach and respiratory tract.',
    phase: 'main',
    duration: '1-2 days',
    benefits: ['Eliminates Kapha excess', 'Clears respiratory tract', 'Improves digestion'],
    contraindications: ['Cardiac conditions', 'Active menstruation'],
  },
  {
    id: 'virechana',
    name: 'Virechana (Purgation)',
    description: 'Controlled purgation to eliminate Pitta-related toxins from the liver and intestines.',
    phase: 'main',
    duration: '1-3 days',
    benefits: ['Cleanses intestines', 'Eliminates Pitta toxins', 'Improves liver function'],
    contraindications: ['Severe constipation', 'Pregnancy'],
  },
  {
    id: 'basti',
    name: 'Basti (Medicated Enema)',
    description: 'Herbal decoctions and oils administered rectally to eliminate Vata toxins and nourish tissues.',
    phase: 'main',
    duration: '8-30 days',
    benefits: ['Pacifies Vata', 'Nourishes colon', 'Eliminates deep toxins'],
    contraindications: ['Acute abdominal conditions', 'Severe hemorrhoids'],
  },
  {
    id: 'nasya',
    name: 'Nasya (Nasal Administration)',
    description: 'Medicated oils or herbs administered through the nostrils to cleanse the head and neck region.',
    phase: 'main',
    duration: '5-14 days',
    benefits: ['Clears sinuses', 'Improves mental clarity', 'Eliminates toxins from head'],
    contraindications: ['Active nasal infection', 'Pregnancy'],
  },
  {
    id: 'raktamokshana',
    name: 'Raktamokshana (Bloodletting)',
    description: 'Controlled blood purification to address blood-borne toxins and skin conditions.',
    phase: 'main',
    duration: '1 session',
    benefits: ['Purifies blood', 'Addresses skin conditions', 'Relieves localized pain'],
    contraindications: ['Anemia', 'Bleeding disorders', 'Pregnancy'],
  },
  {
    id: 'samsarjni',
    name: 'Samsarjni (Post-treatment Rejuvenation)',
    description: 'Gradual reintroduction of diet and activities with herbal support for recovery.',
    phase: 'post-treatment',
    duration: '7-14 days',
    benefits: ['Restores digestive fire', 'Maintains cleanse', 'Prevents toxin re-accumulation'],
  },
  {
    id: 'rasayana',
    name: 'Rasayana (Rejuvenation)',
    description: 'Herbal and dietary rejuvenation therapy to restore vitality and strengthen tissues.',
    phase: 'post-treatment',
    duration: 'Ongoing',
    benefits: ['Rejuvenates tissues', 'Boosts immunity', 'Promotes longevity'],
  },
];

/**
 * Perform Panchakarma practice
 * @param practiceId - Optional specific practice ID to perform
 * @returns The practice result or list of available practices
 */
export function performPractice(practiceId?: string): PanchakarmaPractice | PanchakarmaPractice[] {
  if (practiceId) {
    const practice = practices.find(p => p.id === practiceId);
    if (!practice) {
      throw new Error(`Panchakarma practice not found: ${practiceId}`);
    }
    return practice;
  }

  return [...practices];
}

/**
 * Get practices by phase
 */
export function getPracticesByPhase(phase: PanchakarmaPractice['phase']): PanchakarmaPractice[] {
  return practices.filter(p => p.phase === phase);
}

/**
 * Get a specific practice by ID
 */
export function getPracticeById(id: string): PanchakarmaPractice | undefined {
  return practices.find(p => p.id === id);
}
