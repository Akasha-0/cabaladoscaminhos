import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const MeditationTypeSchema = z.enum(['guided', 'breathing', 'body-scan', 'visualization', 'sleep']);
const MeditationQuerySchema = z.object({
  type: MeditationTypeSchema.optional(),
  duration: z.coerce.number().int().min(1).max(60).optional(),
  orixa: z.string().optional(),
});
const MeditationBodySchema = z.object({
  type: MeditationTypeSchema,
  duration: z.number().int().min(1).max(60).optional(),
  orixa: z.string().optional(),
  focus: z.string().optional(),
});
type MeditationType = z.infer<typeof MeditationTypeSchema>;
const VALID_TYPES = ['guided', 'breathing', 'body-scan', 'visualization', 'sleep'] as const;
const TYPE_META: Record<MeditationType, { title: string; description: string; duration: number }> = {
  guided: { title: 'Guided Meditation', description: 'Voice-guided session with prompts', duration: 10 },
  breathing: { title: 'Breathing Exercise', description: 'Focused breathing techniques', duration: 5 },
  'body-scan': { title: 'Body Scan', description: 'Progressive relaxation from head to toe', duration: 15 },
  visualization: { title: 'Visualization', description: 'Guided imagery and visualization', duration: 10 },
  sleep: { title: 'Sleep Meditation', description: 'Deep relaxation for better sleep', duration: 20 },
};
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = MeditationQuerySchema.safeParse({
    type: searchParams.get('type'),
    duration: searchParams.get('duration'),
    orixa: searchParams.get('orixa'),
  });
  if (!parseResult.success) {
    return NextResponse.json({
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }
  const { type, duration, orixa } = parseResult.data;
  if (!type) {
    return NextResponse.json({
      error: 'Parâmetro "type" é obrigatório',
      validTypes: [...VALID_TYPES],
    }, { status: 400 });
  }
  const meta = TYPE_META[type];
  const meditationDuration = duration ?? meta.duration;
  return NextResponse.json({
    meditation: {
      type,
      title: meta.title,
      description: meta.description,
      duration: meditationDuration,
      orixa,
    },
  });
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = MeditationBodySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { type, duration, orixa, focus } = parseResult.data;
    const meta = TYPE_META[type];
    const meditationDuration = duration ?? meta.duration;
    return NextResponse.json({
      meditation: {
        id: crypto.randomUUID(),
        type,
        title: meta.title,
        description: meta.description,
        duration: meditationDuration,
        orixa,
        focus,
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar meditação',
    }, { status: 500 });
  }
}
function generateInstructions(type: MeditationType, duration: number): string[] {
  const baseInstructions: Record<MeditationType, string[]> = {
    guided: ['Find a comfortable position', 'Close your eyes gently', 'Follow the guidance'],
    breathing: ['Inhale deeply', 'Hold your breath', 'Exhale slowly', 'Repeat'],
    'body-scan': ['Focus on your toes', 'Slowly move awareness upward', 'Release tension in each body part'],
    visualization: ['Imagine a peaceful place', 'Engage all your senses', 'Hold the image gently'],
    sleep: ['Let your body relax completely', 'Release all thoughts', ' drift into peaceful sleep'],
  };
  const instructions = [...baseInstructions[type]];
  const repeatCount = Math.floor(duration / 5);
  if (repeatCount > 1 && type === 'breathing') {
    instructions.push(`Continue breathing pattern for ${duration} minutes`);
  }
  return instructions;
}
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
