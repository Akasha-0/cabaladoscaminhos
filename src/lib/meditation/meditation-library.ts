export type MeditationType = 'breathing' | 'body-scan' | 'visualization' | 'loving-kindness' | 'mindfulness' | 'transcendental';

export interface Meditation {
  id: string;
  title: string;
  type: MeditationType;
  duration: number; // minutes
  description: string;
  instructions: string[];
  audioUrl?: string;
}

const meditations: Meditation[] = [
  {
    id: 'breath-awareness-1',
    title: 'Conscious Breathing',
    type: 'breathing',
    duration: 10,
    description: 'Focus on the natural rhythm of your breath to anchor awareness in the present moment.',
    instructions: [
      'Find a comfortable seated position',
      'Close your eyes and relax your body',
      'Notice the sensation of breath entering your nostrils',
      'Follow the breath as it fills your lungs',
      'Observe the pause at the top of each inhale',
      'Feel the breath leaving your body naturally',
      'Continue observing without controlling your breath',
    ],
  },
  {
    id: 'body-scan-1',
    title: 'Full Body Scan',
    type: 'body-scan',
    duration: 15,
    description: 'Systematically bring awareness to each part of your body, releasing tension and cultivating presence.',
    instructions: [
      'Lie down or sit comfortably',
      'Take three deep breaths to settle in',
      'Bring attention to your toes — notice any sensations',
      'Slowly move awareness up through feet, ankles, calves',
      'Progress through knees, thighs, hips',
      'Shift focus to abdomen, chest, back',
      'Move attention to shoulders, arms, hands',
      'Finally, bring awareness to face, scalp, and crown',
    ],
  },
  {
    id: 'loving-kindness-1',
    title: 'Metta Practice',
    type: 'loving-kindness',
    duration: 12,
    description: 'Cultivate compassion and warmth for yourself and others through traditional metta phrases.',
    instructions: [
      'Settle into a comfortable seated position',
      'Bring to mind someone you feel grateful for',
      'Repeat silently: "May you be happy. May you be healthy."',
      'Extend these wishes to yourself: "May I be happy. May I be healthy."',
      'Gradually include loved ones, neutral people, and all beings',
      'Let feelings of warmth grow with each repetition',
    ],
  },
  {
    id: 'visualization-1',
    title: 'Sacred Space',
    type: 'visualization',
    duration: 20,
    description: 'Create an inner sanctuary of peace through guided imagery and visualization techniques.',
    instructions: [
      'Close your eyes and take several slow breaths',
      'Imagine a place of perfect safety and tranquility',
      'Engage all senses — what do you see, hear, smell?',
      'Build detailed elements: light, colors, textures',
      'Feel the temperature and atmosphere of your space',
      'Allow yourself to simply rest in this visualized sanctuary',
      'When ready, gently bring awareness back to the room',
    ],
  },
  {
    id: 'mindfulness-1',
    title: 'Present Moment Awareness',
    type: 'mindfulness',
    duration: 8,
    description: 'Develop keen awareness of the present moment through observing thoughts and sensations.',
    instructions: [
      'Sit with spine straight but relaxed',
      'Notice what is arising in this exact moment',
      'Observe thoughts as passing clouds — no attachment',
      'Notice sounds as background and foreground layers',
      'Feel physical sensations without judgment',
      'Return gently to the breath whenever the mind wanders',
      'Cultivate a sense of curiosity about each moment',
    ],
  },
  {
    id: 'transcendental-1',
    title: 'Mantra Meditation',
    type: 'transcendental',
    duration: 15,
    description: 'Use a mantra to transcend ordinary thinking and access deeper states of consciousness.',
    instructions: [
      'Sit comfortably with eyes closed',
      'Silently repeat your chosen mantra',
      'Allow the mantra to arise and fade naturally',
      'If thoughts appear, gently return to the mantra',
      'Let the mantra become increasingly subtle',
      'Rest in the space between thoughts',
      'After the session, sit quietly before opening eyes',
    ],
  },
  {
    id: 'breathing-2',
    title: '4-7-8 Breathing',
    type: 'breathing',
    duration: 7,
    description: 'A calming breath technique that activates the parasympathetic nervous system.',
    instructions: [
      'Sit or lie in a comfortable position',
      'Place the tip of your tongue against the ridge behind your upper teeth',
      'Exhale completely through your mouth with a whoosh sound',
      'Inhale quietly through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Exhale through your mouth for 8 counts',
      'Repeat for 3-4 cycles',
    ],
  },
  {
    id: 'body-scan-2',
    title: 'Progressive Relaxation',
    type: 'body-scan',
    duration: 12,
    description: 'Systematically tense and release muscle groups to dissolve physical tension and promote deep rest.',
    instructions: [
      'Lie down in a comfortable position',
      'Start by tensing your feet — hold for 5 seconds, then release',
      'Move to calves, tensing and releasing',
      'Progress through thighs, abdomen, chest',
      'Tense shoulders and hold, then drop heavily',
      'Make fists, squeeze, then open hands wide',
      'Contract facial muscles, then let the face go slack',
      'Scan for any remaining tension and release',
    ],
  },
];

export function getMeditations(type?: MeditationType): Meditation[] {
  if (!type) return [...meditations];
  return meditations.filter(m => m.type === type);
}

export function getMeditationById(id: string): Meditation | undefined {
  return meditations.find(m => m.id === id);
}

export function getMeditationTypes(): MeditationType[] {
  return ['breathing', 'body-scan', 'visualization', 'loving-kindness', 'mindfulness', 'transcendental'];
}