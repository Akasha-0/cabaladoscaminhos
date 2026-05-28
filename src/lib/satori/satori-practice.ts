export interface SatoriPracticeParams {
  userId?: string;
  duration?: number; // seconds
  focus?: 'breath' | 'sound' | 'silence' | 'movement';
  timestamp?: number;
}

export interface SatoriPracticeResult {
  practiceId: string;
  completed: boolean;
  awakeningLevel: number; // 0-100
  breakthroughMoments: number;
  insights: string[];
  state: 'prepared' | 'in-practice' | 'satori' | 'integration';
}

const insightPool = [
  'The mind that seeks cannot find what is already here.',
  'Sudden awakening arises in the pause between thoughts.',
  'Enlightenment is not a destination but the path itself.',
  'Presence reveals the spaciousness beneath apparent form.',
  'The observer and observed are one awareness.',
  'Clarity emerges when we stop trying to become clear.',
  'Letting go of seeking is itself the doorway.',
  'The light you search for is the light that searches.',
  'Resting in open awareness, every moment becomes liberation.',
  'The breakthrough moments are not extraordinary — they are ordinary seen clearly.',
];

export async function performPractice(params: SatoriPracticeParams = {}): Promise<SatoriPracticeResult> {
  const { userId = 'anon', duration = 30, focus = 'breath', timestamp = Date.now() } = params;

  // Generate practice ID
  const practiceId = `satori-${userId}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`;

  // Duration-based awakening level (shorter, focused sessions can be more effective)
  const focusedDuration = focus === 'silence' ? duration * 1.3 : duration;
  const awakeningLevel = Math.min(100, Math.floor(focusedDuration / 60 * 75 + Math.random() * 25));

  // Breakthrough moments based on focus type
  const breakthroughMap: Record<string, number> = {
    silence: 3,
    breath: 2,
    sound: 2,
    movement: 1,
  };
  const breakthroughMoments = breakthroughMap[focus] || 1;

  // Determine state based on awakening level
  let state: SatoriPracticeResult['state'] = 'prepared';
  if (awakeningLevel >= 80) {
    state = 'satori';
  } else if (awakeningLevel >= 50) {
    state = focus === 'silence' ? 'satori' : 'in-practice';
  } else if (duration > 0) {
    state = 'in-practice';
  }

  // Select insights
  const insightCount = Math.min(4, Math.floor(awakeningLevel / 30) + 1);
  const insights = insightPool
    .sort(() => Math.random() - 0.5)
    .slice(0, insightCount);

  // Remove duplicates
  const uniqueInsights = [...new Set(insights)];

  return {
    practiceId,
    completed: true,
    awakeningLevel,
    breakthroughMoments,
    insights: uniqueInsights,
    state,
  };
}
