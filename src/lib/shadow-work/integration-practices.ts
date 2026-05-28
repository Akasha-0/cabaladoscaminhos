// Integration practices for shadow work
// Healing methods for shadow integration

export interface IntegrationPractice {
  id: string;
  name: string;
  description: string;
  method: string;
  duration: string;
  category: 'contemplative' | 'somatic' | 'creative' | 'relational';
}

const practices: IntegrationPractice[] = [
  {
    id: 'shadow-dialogue',
    name: 'Shadow Dialogue',
    description:
      'Engage in a written conversation with your shadow self. Ask what it needs, listen without judgment.',
    method: 'Journaling',
    duration: '20-30 minutes',
    category: 'contemplative',
  },
  {
    id: 'body-scan-shadow',
    name: 'Somatic Shadow Scan',
    description:
      'Scan the body for tension, numbness, or disowned sensations. Breathe into those areas with curiosity.',
    method: 'Body awareness',
    duration: '15-20 minutes',
    category: 'somatic',
  },
  {
    id: 'shadow-ritual',
    name: 'Dark Moon Ritual',
    description:
      'Perform a ritual during the dark moon to honor rejected parts. Light a candle, speak aloud what you disown.',
    method: 'Ritual',
    duration: '30-45 minutes',
    category: 'contemplative',
  },
  {
    id: 'active-imagination',
    name: 'Active Imagination',
    description:
      'Enter a relaxed state and allow imagery to arise. Let shadow figures speak and unfold their message.',
    method: 'Guided imagery',
    duration: '20-40 minutes',
    category: 'contemplative',
  },
  {
    id: 'projection-retrieval',
    name: 'Projection Retrieval',
    description:
      'Identify a person who triggers strong reactions. Ask: what part of myself do I see in them that I reject?',
    method: 'Inquiry',
    duration: '15-30 minutes',
    category: 'relational',
  },
  {
    id: 'rejected-parts-letter',
    name: 'Letter to Rejected Parts',
    description:
      'Write a letter to the part of yourself you have rejected. Express what you never allowed it to say.',
    method: 'Journaling',
    duration: '20 minutes',
    category: 'creative',
  },
  {
    id: 'breathwork-integration',
    name: 'Breathwork Integration',
    description:
      'Use conscious connected breathing to access held emotions. Allow the body to release what the mind suppressed.',
    method: 'Pranayama',
    duration: '20-30 minutes',
    category: 'somatic',
  },
  {
    id: 'shadow-sculpting',
    name: 'Shadow Sculpting',
    description:
      'Use clay or drawing to give form to your shadow. Notice the impulse to destroy or abandon it.',
    method: 'Art therapy',
    duration: '30-45 minutes',
    category: 'creative',
  },
  {
    id: 'loving-kindness-shadow',
    name: 'Loving-Kindness for the Shadow',
    description:
      'Repeat metta phrases toward your shadow: May I know you. May I hold you. May I be whole with you.',
    method: 'Meditation',
    duration: '15-20 minutes',
    category: 'contemplative',
  },
  {
    id: 'witnessing-practice',
    name: 'Witnessing Practice',
    description:
      'Sit with uncomfortable emotions without trying to fix or suppress. Observe the arising and passing.',
    method: 'Meditation',
    duration: '20-30 minutes',
    category: 'contemplative',
  },
  {
    id: 'ancestor-shadow',
    name: 'Ancestral Shadow Work',
    description:
      'Explore patterns inherited from lineage. Ask: what did my ancestors reject that lives in me?',
    method: 'Genealogy inquiry',
    duration: '30 minutes',
    category: 'relational',
  },
  {
    id: 'dream-shadow',
    name: 'Dream Shadow Work',
    description:
      'Record shadow-related dreams. Interrogate dream figures: what do you want me to see about myself?',
    method: 'Dreamwork',
    duration: '15 minutes + reflection',
    category: 'contemplative',
  },
];

/**
 * Returns all shadow work integration practices.
 */
export function getPractices(): IntegrationPractice[] {
  return practices;
}
