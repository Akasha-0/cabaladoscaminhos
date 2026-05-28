import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const level = searchParams.get('level');

  const techniques = [
    {
      id: 'breath-awareness',
      name: 'Breath Awareness',
      category: 'mindfulness',
      level: 'beginner',
      duration: { min: 5, max: 30 },
      description: 'Focus on the natural rhythm of your breath to cultivate present-moment awareness.',
      instructions: [
        'Find a comfortable seated position',
        'Close your eyes and relax your body',
        'Notice the sensation of breathing',
        'Follow each inhale and exhale',
        'When mind wanders, gently return to breath',
      ],
      benefits: ['Reduced stress', 'Improved focus', 'Emotional regulation'],
    },
    {
      id: 'body-scan',
      name: 'Body Scan',
      category: 'relaxation',
      level: 'intermediate',
      duration: { min: 10, max: 45 },
      description: 'Systematically bring attention to different parts of the body, releasing tension.',
      instructions: [
        'Lie down or sit comfortably',
        'Start at the top of your head',
        'Slowly move attention down through each body part',
        'Notice sensations without judgment',
        'Spend a few breaths on each area',
      ],
      benefits: ['Deep relaxation', 'Body awareness', 'Tension release'],
    },
    {
      id: 'loving-kindness',
      name: 'Loving Kindness (Metta)',
      category: 'compassion',
      level: 'intermediate',
      duration: { min: 10, max: 30 },
      description: 'Cultivate feelings of warmth and compassion toward yourself and others.',
      instructions: [
        'Sit in a comfortable position',
        'Bring to mind someone you care about',
        'Silently repeat: "May you be happy, may you be healthy"',
        'Extend to yourself, then neutral people, then all beings',
        'Let feelings of warmth grow naturally',
      ],
      benefits: ['Self-compassion', 'Emotional openness', 'Reduced self-criticism'],
    },
    {
      id: 'transcendental',
      name: 'Transcendental Meditation',
      category: 'transcendental',
      level: 'advanced',
      duration: { min: 15, max: 20 },
      description: 'Use a mantra to settle the mind into deep rest while maintaining wakefulness.',
      instructions: [
        'Sit comfortably with eyes closed',
        'Repeat your mantra silently',
        'Let the mantra become effortless',
        'Allow thoughts to come and go',
        'Experience restful alertness',
      ],
      benefits: ['Deep rest', 'Creativity', 'Stress reduction'],
    },
    {
      id: 'vipassana',
      name: 'Vipassana',
      category: 'insight',
      level: 'advanced',
      duration: { min: 30, max: 60 },
      description: 'Develop clear insight into the true nature of reality through observation.',
      instructions: [
        'Sit with a straight spine',
        'Observe sensations arising and passing',
        'Note them with equanimity',
        'Stay with the present moment',
        'Investigate the nature of experience',
      ],
      benefits: ['Wisdom development', 'Clarity', 'Liberation from suffering'],
    },
    {
      id: 'zen-breathing',
      name: 'Zen Breathing (Zazen)',
      category: 'zen',
      level: 'beginner',
      duration: { min: 5, max: 45 },
      description: 'Simple seated meditation from the Zen tradition, focusing on posture and breath.',
      instructions: [
        'Sit in half-lotus or seiza position',
        'Keep the spine straight',
        'Hands in cosmic mudra',
        'Count breaths from 1 to 10, then restart',
        'Focus on the hara (lower abdomen)',
      ],
      benefits: ['Concentration', 'Inner peace', 'Present-moment awareness'],
    },
    {
      id: ' visualization-abundance',
      name: 'Abundance Visualization',
      category: 'visualization',
      level: 'intermediate',
      duration: { min: 10, max: 25 },
      description: 'Create vivid mental images of your desired outcomes to manifest abundance.',
      instructions: [
        'Enter a relaxed state',
        'Visualize your goal in vivid detail',
        'Engage all senses in the visualization',
        'Feel the emotions as if already achieved',
        'Release with gratitude',
      ],
      benefits: ['Goal clarity', 'Motivation', 'Manifestation'],
    },
    {
      id: 'grounding',
      name: 'Grounding',
      category: 'grounding',
      level: 'beginner',
      duration: { min: 5, max: 15 },
      description: 'Connect with the earth and present moment through sensory awareness.',
      instructions: [
        'Stand or sit with feet on the ground',
        'Feel the weight of your body',
        'Imagine roots extending into the earth',
        'Breathe deeply, exchanging energy',
        'Feel centered and stable',
      ],
      benefits: ['Stability', 'Present-moment focus', 'Energy grounding'],
    },
    {
      id: 'chakra-activation',
      name: 'Chakra Activation',
      category: 'energy',
      level: 'intermediate',
      duration: { min: 15, max: 45 },
      description: 'Balance and activate the body energy centers for vitality and spiritual growth.',
      instructions: [
        'Sit or lie down comfortably',
        'Begin at the root chakra (base of spine)',
        'Visualize a spinning wheel of light',
        'Move up through each chakra',
        'Balance and harmonize each center',
      ],
      benefits: ['Energy balance', 'Spiritual alignment', 'Emotional harmony'],
    },
    {
      id: 'silent-sitting',
      name: 'Silent Sitting',
      category: 'mindfulness',
      level: 'beginner',
      duration: { min: 10, max: 60 },
      description: 'Simply sit in silence, allowing whatever arises without intervention.',
      instructions: [
        'Find a comfortable seated position',
        'Close your eyes',
        'Allow silence to fill the space',
        'Notice any sounds, sensations, or thoughts',
        'Return to silence whenever you notice engagement',
      ],
      benefits: ['Mental clarity', 'Acceptance', 'Inner quiet'],
    },
  ];

  let filtered = techniques;

  if (category) {
    filtered = filtered.filter(t => t.category === category);
  }

  if (level) {
    filtered = filtered.filter(t => t.level === level);
  }

  return NextResponse.json({
    techniques: filtered,
    total: filtered.length,
    categories: [...new Set(techniques.map(t => t.category))],
    levels: [...new Set(techniques.map(t => t.level))],
  });
}