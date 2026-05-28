import { NextRequest, NextResponse } from 'next/server';
import { generateMeditation, MeditationTheme } from '@/lib/ai/meditation';

const VALID_THEMES: MeditationTheme[] = ['cura', 'proteção', 'prosperidade', 'amor', 'sabedoria'];
const VALID_CATEGORIES = ['cura', 'foco', 'sono', 'energia'] as const;
type Category = typeof VALID_CATEGORIES[number];

// Map categories to meditation themes
const CATEGORY_THEME_MAP: Record<Category, MeditationTheme> = {
  cura: 'cura',
  foco: 'sabedoria',
  sono: 'proteção',
  energia: 'prosperidade',
};

// Category metadata for GET responses
const CATEGORY_META: Record<Category, { title: string; description: string; duration: number }> = {
  cura: {
    title: 'Meditação de Cura',
    description: 'Restaure seu corpo e mente com esta meditação de cura guiada',
    duration: 10,
  },
  foco: {
    title: 'Meditação de Foco',
    description: 'Aguce sua mente e amplie sua concentração com esta prática',
    duration: 15,
  },
  sono: {
    title: 'Meditação para Sono',
    description: 'Relaxe profundamente e prepare-se para um sono reparador',
    duration: 20,
  },
  energia: {
    title: 'Meditação de Energia',
    description: 'Desperte sua energia vital e Vitalize seu ser',
    duration: 10,
  },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') as Category | null;
  const durationParam = searchParams.get('duration');
  const duration = durationParam ? parseInt(durationParam, 10) : null;

  // If no category specified, return all available categories
  if (!category) {
    const categories = VALID_CATEGORIES.map((cat) => ({
      id: cat,
      title: CATEGORY_META[cat].title,
      description: CATEGORY_META[cat].description,
      suggestedDuration: CATEGORY_META[cat].duration,
    }));
    return NextResponse.json({
      categories,
      message: 'Available meditation categories. Provide ?category=<id> to get a meditation.',
    });
  }

  // Validate category
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json(
      {
        error: 'Invalid category',
        validCategories: VALID_CATEGORIES,
      },
      { status: 400 }
    );
  }

  // Validate duration if provided
  if (duration !== null) {
    if (isNaN(duration) || duration < 1 || duration > 60) {
      return NextResponse.json(
        { error: 'Duration must be a number between 1 and 60 minutes' },
        { status: 400 }
      );
    }
  }

  // Use category metadata for defaults
  const meta = CATEGORY_META[category];
  const meditationDuration = duration ?? meta.duration;
  const theme = CATEGORY_THEME_MAP[category];

  try {
    const meditation = generateMeditation(meditationDuration, theme);

    return NextResponse.json({
      category,
      ...meta,
      theme: meditation.theme,
      duration: meditation.duration,
      phases: meditation.phases,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
