// Nirvana practice

export interface NirvanaPracticeParams {
  userId?: string;
  duration?: number; // seconds
  approach?: 'emptiness' | 'compassion' | 'wisdom' | 'liberation';
  timestamp?: number;
}

export interface NirvanaPracticeResult {
  practiceId: string;
  completed: boolean;
  liberationLevel: number; // 0-100
  awakeningMoments: number;
  insights: string[];
  state: 'seeking' | 'practicing' | 'realization' | 'liberation';
}

const insightPool = [
  'Nirvana is not a place to reach, but the end of seeking.',
  'The extinction of craving is the birth of freedom.',
  'What is not born cannot die — realize the unconditioned.',
  'Letting go of self is the ultimate letting go.',
  'The flame that burns out leaves no trace, yet illuminates.',
  'Silence the mind to hear the silence that listens.',
  'All phenomena dissolve into emptiness — emptiness itself is form.',
  'The path to nirvana is the path that has no path.',
  'Beyond happiness and suffering lies the peace that passes understanding.',
  'The river enters the ocean and the ocean is not changed.',
];

export async function performPractice(params: NirvanaPracticeParams = {}): Promise<NirvanaPracticeResult> {
  const { userId = 'anon', duration = 30, approach = 'emptiness', timestamp = Date.now() } = params;

  // Generate practice ID
  const practiceId = `nirvana-${userId}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`;

  // Duration-based liberation level
  const approachMultiplier: Record<string, number> = {
    emptiness: 1.3,
    compassion: 1.2,
    wisdom: 1.4,
    liberation: 1.5,
  };
  const multiplier = approachMultiplier[approach] || 1.0;
  const liberationLevel = Math.min(100, Math.floor((duration / 60 * 80 + Math.random() * 20) * multiplier));

  // Awakening moments based on approach
  const awakeningMap: Record<string, number> = {
    liberation: 4,
    emptiness: 3,
    wisdom: 3,
    compassion: 2,
  };
  const awakeningMoments = awakeningMap[approach] || 2;

  // Determine state based on liberation level
  let state: NirvanaPracticeResult['state'] = 'seeking';
  if (liberationLevel >= 85) {
    state = 'liberation';
  } else if (liberationLevel >= 65) {
    state = 'realization';
  } else if (liberationLevel >= 35) {
    state = 'practicing';
  } else if (duration > 0) {
    state = 'seeking';
  }

  // Select insights
  const insightCount = Math.min(4, Math.floor(liberationLevel / 25) + 1);
  const insights = insightPool
    .sort(() => Math.random() - 0.5)
    .slice(0, insightCount);

  // Remove duplicates
  const uniqueInsights: string[] = [];
  for (const insight of insights) {
    if (!uniqueInsights.includes(insight)) {
      uniqueInsights.push(insight);
    }
  }

  return {
    practiceId,
    completed: true,
    liberationLevel,
    awakeningMoments,
    insights: uniqueInsights,
    state,
  };
}