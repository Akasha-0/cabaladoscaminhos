import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SefirotSchema, ChakraSchema, ElementSchema } from '@/lib/api/spiritual-filters';
import { calculateNumerology, numerologyMethods, type NumerologyReport } from '@/lib/numerologia/generator';
// ─── Spiritual filter schemas imported from @/lib/api/spiritual-filters ─────

const NumerologyMethodSchema = z.enum(['pitagorica', 'caldeia', 'cabalistica', 'tantrica', 'destino']);

const NumerologyReadingRequestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  methods: z.array(NumerologyMethodSchema).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const NumerologyReadingResponseSchema = z.object({
  readingId: z.string(),
  name: z.string(),
  date: z.string(),
  report: z.any(),
  createdAt: z.string(),
  spiritualCorrelations: z.object({
    sefirot: z.array(z.string()),
    chakra: z.number(),
    element: z.string(),
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }).optional(),
});

// ─── Spiritual Correlations for Numerology Numbers ──────────────────────────────────────────
const NUMERO_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  '1': { sefirot: ['Kether', 'Gevurah'], chakra: 1, element: 'Fogo', orixa: 'Ogum', affirmation: 'Eu lidero com coragem e propósito', frequency: '528 Hz' },
  '2': { sefirot: ['Chokhmah', 'Binah'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'A cooperação traz harmonia', frequency: '417 Hz' },
  '3': { sefirot: ['Chokhmah', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A criatividade flui através de mim', frequency: '639 Hz' },
  '4': { sefirot: ['Malkuth', 'Yesod'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Construo uma base sólida', frequency: '528 Hz' },
  '5': { sefirot: ['Hod', 'Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'A liberdade me guia', frequency: '741 Hz' },
  '6': { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O amor e a responsabilidade guiam meu caminho', frequency: '528 Hz' },
  '7': { sefirot: ['Binah', 'Hod'], chakra: 6, element: 'Água', orixa: 'Oxalá', affirmation: 'A sabedoria interior me sustenta', frequency: '396 Hz' },
  '8': { sefirot: ['Gevurah', 'Malkuth'], chakra: 3, element: 'Terra', orixa: 'Ogum', affirmation: 'O poder justo flui através de mim', frequency: '528 Hz' },
  '9': { sefirot: ['Tipheret', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Sou um canal de compaixão e serviço', frequency: '528 Hz' },
  '11': { sefirot: ['Kether', 'Chokhmah'], chakra: 6, element: 'Ar', orixa: 'Oxalá', affirmation: 'Minha intuição ilumina o caminho', frequency: '963 Hz' },
  '22': { sefirot: ['Chesed', 'Gevurah'], chakra: 4, element: 'Terra', orixa: 'Ogum', affirmation: 'Transformo visões em realidade', frequency: '528 Hz' },
  '33': { sefirot: ['Tipheret', 'Kether'], chakra: 7, element: 'Fogo', orixa: 'Oxalá', affirmation: 'Sou um canal de amor divino', frequency: '528 Hz' },
};

interface NumerologyReadingRequest {
  name: string;
  date: string;
  methods?: ('pitagorica' | 'caldeia' | 'cabalistica' | 'tantrica' | 'destino')[];
}

interface NumerologyReadingResponse {
  id: string;
  timestamp: string;
  input: {
    name: string;
    date: string;
  };
  report: NumerologyReport;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateReadingId(): string {
  return `numerology_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getCorrelationsForNumber(num: number) {
  // Handle master numbers
  if (num === 11 || num === 22 || num === 33) {
    return NUMERO_SPIRITUAL_CORRELATIONS[num.toString()];
  }
  // For other numbers, reduce to 1-9
  const reduced = ((num - 1) % 9) + 1;
  return NUMERO_SPIRITUAL_CORRELATIONS[reduced.toString()];
}

// fallow-ignore-next-line complexity
function validateInput(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }
  
  const body = data as Record<string, unknown>;
  
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return { valid: false, error: 'Name is required and must be a non-empty string' };
  }
  
  if (!body.date || typeof body.date !== 'string') {
    return { valid: false, error: 'Date is required' };
  }
  
  // Validate date format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(body.date)) {
    return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
  }
  
  // Validate date is real
  const dateObj = new Date(body.date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }
  
  return { valid: true };
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * POST /api/numerology/readings
 * Generate a complete numerology reading
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate input with Zod
    const parseResult = NumerologyReadingRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { name, date, methods } = parseResult.data;

    // Calculate numerology
    const report = calculateNumerology(name, date);

    // Get spiritual correlations based on destiny number
    const destinyNumber = report.destino.numero;
    const spiritualCorrelations = getCorrelationsForNumber(destinyNumber);

    const reading: NumerologyReadingResponse = {
      id: generateReadingId(),
      timestamp: new Date().toISOString(),
      input: { name, date },
      report,
      spiritualCorrelations,
    };

    return NextResponse.json({
      success: true,
      reading,
      spiritualCorrelations,
      meta: {
        methods: methods || ['pitagorica'],
        numberOfCorrelations: 5,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}

/**
 * GET /api/numerology/readings
 * Get available numerology methods and spiritual correlations
// fallow-ignore-next-line complexity
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const numero = searchParams.get('numero');
  const sefirot = searchParams.get('sefirot');
  const chakra = searchParams.get('chakra');
  const element = searchParams.get('element');
  const orixa = searchParams.get('orixa');

  let correlations: Record<string, typeof NUMERO_SPIRITUAL_CORRELATIONS[string]> = { ...NUMERO_SPIRITUAL_CORRELATIONS } as Record<string, typeof NUMERO_SPIRITUAL_CORRELATIONS[string]>;

  // Filter by parameters
  if (numero) {
    const num = parseInt(numero);
    if (NUMERO_SPIRITUAL_CORRELATIONS[num.toString()]) {
      correlations = { [num.toString()]: NUMERO_SPIRITUAL_CORRELATIONS[num.toString()] };
    }
  }

  if (sefirot) {
    const filtered: Record<string, typeof NUMERO_SPIRITUAL_CORRELATIONS[string]> = {};
    Object.entries(NUMERO_SPIRITUAL_CORRELATIONS).forEach(([num, corr]) => {
      if (corr.sefirot.includes(sefirot)) {
        filtered[num] = corr;
      }
    });
    correlations = filtered as typeof correlations;
  }

  if (chakra) {
    const filtered: Record<string, typeof NUMERO_SPIRITUAL_CORRELATIONS[string]> = {};
    Object.entries(NUMERO_SPIRITUAL_CORRELATIONS).forEach(([num, corr]) => {
      if (corr.chakra === parseInt(chakra)) {
        filtered[num] = corr;
      }
    });
    correlations = filtered as typeof correlations;
  }

  if (element) {
    const filtered: Record<string, typeof NUMERO_SPIRITUAL_CORRELATIONS[string]> = {};
    Object.entries(NUMERO_SPIRITUAL_CORRELATIONS).forEach(([num, corr]) => {
      if (corr.element === element) {
        filtered[num] = corr;
      }
    });
    correlations = filtered as typeof correlations;
  }

  if (orixa) {
    const filtered: Record<string, typeof NUMERO_SPIRITUAL_CORRELATIONS[string]> = {};
    Object.entries(NUMERO_SPIRITUAL_CORRELATIONS).forEach(([num, corr]) => {
      if (corr.orixa === orixa) {
        filtered[num] = corr;
      }
    });
    correlations = filtered as typeof correlations;
  }

  // Calculate spiritual stats
  const spiritualStats = {
    bySefirot: Object.entries(correlations).reduce((acc, [num, corr]) => {
      corr.sefirot.forEach(s => {
        acc[s] = (acc[s] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    byChakra: Object.entries(correlations).reduce((acc, [num, corr]) => {
      acc[corr.chakra] = (acc[corr.chakra] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byElement: Object.entries(correlations).reduce((acc, [num, corr]) => {
      acc[corr.element] = (acc[corr.element] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byOrixa: Object.entries(correlations).reduce((acc, [num, corr]) => {
      acc[corr.orixa] = (acc[corr.orixa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return NextResponse.json({
    success: true,
    correlations,
    availableMethods: numerologyMethods,
    count: Object.keys(correlations).length,
    spiritualStats,
 meta: {
      filters: { numero, sefirot, chakra, element, orixa },
    },
  });
}