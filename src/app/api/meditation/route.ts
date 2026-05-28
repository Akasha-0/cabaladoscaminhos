import { NextRequest, NextResponse } from 'next/server';

const VALID_TYPES = ['guided', 'breathing', 'body-scan', 'visualization', 'sleep'] as const;
type MeditationType = typeof VALID_TYPES[number];

const TYPE_META: Record<MeditationType, { title: string; description: string; duration: number }> = {
  guided: { title: 'Guided Meditation', description: 'Voice-guided session with prompts', duration: 10 },
  breathing: { title: 'Breathing Exercise', description: 'Focused breathing techniques', duration: 5 },
  'body-scan': { title: 'Body Scan', description: 'Progressive relaxation from head to toe', duration: 15 },
  visualization: { title: 'Visualization', description: 'Guided imagery and visualization', duration: 10 },
  sleep: { title: 'Sleep Meditation', description: 'Deep relaxation for better sleep', duration: 20 },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') as MeditationType | null;
  const durationParam = searchParams.get('duration');
  const duration = durationParam ? parseInt(durationParam, 10) : null;

  if (!type) {
    return NextResponse.json({
      types: VALID_TYPES.map(t => ({
        type: t,
        ...TYPE_META[t],
      })),
    });
  }

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: 'Invalid meditation type', validTypes: VALID_TYPES },
      { status: 400 }
    );
  }

  if (duration !== null && (isNaN(duration) || duration < 1 || duration > 60)) {
    return NextResponse.json(
      { error: 'Duration must be between 1 and 60 minutes' },
      { status: 400 }
    );
  }

  const meta = TYPE_META[type];
  const meditationDuration = duration ?? meta.duration;

  return NextResponse.json({
    type,
    title: meta.title,
    description: meta.description,
    duration: meditationDuration,
    instructions: generateInstructions(type, meditationDuration),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, duration, focus } = body;

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid meditation type', validTypes: VALID_TYPES },
        { status: 400 }
      );
    }

    const meditationDuration = duration && !isNaN(duration) && duration >= 1 && duration <= 60
      ? duration
      : TYPE_META[type as keyof typeof TYPE_META]?.duration || 10;

    const session = {
      id: crypto.randomUUID(),
      type,
      title: TYPE_META[type as keyof typeof TYPE_META]?.title || "Meditation",
      description: TYPE_META[type as keyof typeof TYPE_META]?.description || "",
      duration: meditationDuration,
      focus: focus || null,
      createdAt: new Date().toISOString(),
      instructions: generateInstructions(type, meditationDuration),
    };

    return NextResponse.json(session, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

function generateInstructions(type: MeditationType, duration: number): string[] {
  const baseInstructions: Record<MeditationType, string[]> = {
    guided: [
      'Find a comfortable seated position',
      'Close your eyes and relax your body',
      'Follow the guidance and breathe naturally',
      'Let go of any thoughts that arise',
      'Gradually return your awareness to the room',
    ],
    breathing: [
      'Sit upright with relaxed shoulders',
      'Inhale deeply through your nose',
      'Hold your breath briefly',
      'Exhale slowly through your mouth',
      'Repeat for the session duration',
    ],
    'body-scan': [
      'Lie down in a comfortable position',
      'Bring awareness to your toes',
      'Slowly move attention up through each body part',
      'Release tension in each area as you go',
      'Rest in complete relaxation',
    ],
    visualization: [
      'Close your eyes and breathe deeply',
      'Imagine a peaceful place',
      'Engage all your senses in the visualization',
      'Stay in this space for the duration',
      'Slowly bring your awareness back',
    ],
    sleep: [
      'Lie down in your sleeping position',
      'Let your body feel heavy and relaxed',
      'Focus only on your breath',
      'Release any effort to stay awake',
      'Let sleep naturally overtake you',
    ],
  };

  const instructions = [...baseInstructions[type]];
  const repeatCount = Math.floor(duration / 5);
  if (repeatCount > 1 && type === 'breathing') {
    instructions.push(`Continue breathing pattern for ${duration} minutes`);
  }

  return instructions;
}
