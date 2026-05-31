/**
 * Lenormand Mesa Real API
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LENORMAND_CARDS, getCardByNumero, CASAS_TEMATICAS } from '@/lib/lenormand/data';
import { realizarLeitura, MESA_REAL_SPREADS } from '@/lib/lenormand/mesa-real';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const LenormandFormatSchema = z.enum(['8x4+4', '9x4']);
const CardPositionSchema = z.object({
  posicao: z.number().int().min(1),
  carta: z.number().int().min(1).max(36),
  nome: z.string(),
  significado: z.string(),
  orientacao: z.enum(['normal', 'invertida']).optional().default('normal'),
});
const LenormandReadingSchema = z.object({
  format: z.string(),
  cards: z.array(CardPositionSchema),
  timestamp: z.string(),
  seed: z.number().optional(),
});
const LenormandQuerySchema = z.object({
  format: LenormandFormatSchema.optional(),
  includeCards: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});
const LenormandBodySchema = z.object({
  format: LenormandFormatSchema.optional().default('8x4+4'),
  seed: z.number().optional(),
  pergunta: z.string().optional(),
});
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = LenormandQuerySchema.safeParse({
      format: searchParams.get('format'),
      includeCards: searchParams.get('includeCards'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { format, includeCards } = parseResult.data;
    const spreads = Object.entries(MESA_REAL_SPREADS).map(([key, s]) => ({
      id: key,
      format: s,
      positions: s.positions?.length ?? 0,
    }));
    const response: Record<string, unknown> = {
      success: true,
      totalCards: LENORMAND_CARDS.length,
      spreads,
      thematicHouses: CASAS_TEMATICAS,
    };
    if (includeCards || !format) {
      response.cardNames = LENORMAND_CARDS.map((nome, i) => ({
        numero: i + 1,
        nome,
        tipo: 'cigano',
      }));
    }
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao processar lenormand' }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = LenormandBodySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { format, seed, pergunta } = parseResult.data;
    if (!MESA_REAL_SPREADS[format]) {
      return NextResponse.json({
        success: false,
        error: 'Invalid format',
        validFormats: Object.keys(MESA_REAL_SPREADS),
      }, { status: 400 });
    }
    const reading = realizarLeitura(format, seed);
    return NextResponse.json({
      success: true,
      format,
      pergunta,
      cards: reading,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Reading error' }, { status: 500 });
  }
}