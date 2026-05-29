import { NextRequest, NextResponse } from 'next/server';

interface SpiritualInput {
  birthDate: string;
  name?: string;
}

const SEFIRAH_NAMES = [
  'Keter', 'Chokmah', 'Binah', 'Chesed', 'Gevurah',
  'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth',
];

const PATHS_MEANINGS: Record<string, string> = {
  '1-2': 'Wisdom through intuition',
  '2-3': 'Understanding flows',
  '3-4': 'Mercy meets strength',
  '4-5': 'Judgment balanced',
  '5-6': 'Beauty in harmony',
  '6-7': 'Eternity of victory',
  '7-8': 'Foundation of glory',
  '8-9': 'Divine foundation',
  '9-10': 'Material manifestation',
};

function calculatePathNumbers(birthDate: string): { primaryPath: number; sefirot: string[] } {
  const digits = birthDate.replace(/\D/g, '');
  const sum = digits.split('').reduce((acc, d) => acc + Number(d), 0);
  const reduced = reduceToSingleDigit(sum);
  const secondary = reduceToSingleDigit(sum - 11 > 0 ? sum - 11 : sum + 11);
  const path = reduced * 10 + secondary;

  // Map path to sefirot
  const sefirot = [
    SEFIRAH_NAMES[reduced - 1] || SEFIRAH_NAMES[0],
    SEFIRAH_NAMES[secondary - 1] || SEFIRAH_NAMES[9],
  ];

  return { primaryPath: path, sefirot };
}

function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = String(num).split('').reduce((a, b) => a + Number(b), 0);
  }
  return num;
}

export async function GET() {
  return NextResponse.json({
    endpoints: ['GET /api/spiritual', 'POST /api/spiritual'],
    methods: {
      GET: 'Returns API information',
      POST: 'Calculates spiritual path numbers based on birth date',
    },
    requiredFields: {
      birthDate: 'string (YYYY-MM-DD format)',
      name: 'string (optional)',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: SpiritualInput = await request.json();

    if (!body.birthDate) {
      return NextResponse.json(
        { error: 'Missing required field: birthDate' },
        { status: 400 }
      );
    }

    const { primaryPath, sefirot } = calculatePathNumbers(body.birthDate);

    const pathKey = `${String(primaryPath).charAt(0)}-${String(primaryPath).charAt(1)}`;
    const meaning = PATHS_MEANINGS[pathKey] || 'Walking the tree of life';

    return NextResponse.json({
      birthDate: body.birthDate,
      name: body.name,
      spiritualPath: primaryPath,
      sefirotActive: sefirot,
      meaning,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
