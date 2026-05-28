import { NextRequest, NextResponse } from 'next/server';
import { generateMeditation, MeditationTheme } from '@/lib/ai/meditation';

const VALID_THEMES: MeditationTheme[] = ['cura', 'proteção', 'prosperidade', 'amor', 'sabedoria'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { duration, theme } = body;

    // Validate duration
    if (typeof duration !== 'number' || duration < 1 || duration > 60) {
      return NextResponse.json(
        { error: 'Duration must be a number between 1 and 60 minutes' },
        { status: 400 }
      );
    }

    // Validate theme
    if (!theme || !VALID_THEMES.includes(theme)) {
      return NextResponse.json(
        { error: `Invalid theme. Choose one of: ${VALID_THEMES.join(', ')}` },
        { status: 400 }
      );
    }

    const meditation = generateMeditation(duration, theme);

    return NextResponse.json(meditation, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}