import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const OracleQuerySchema = z.object({
  type: z.enum(['tarot', 'lenormand', 'ifc', 'both']).optional().default('tarot'),
  question: z.string().optional(),
});
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = OracleQuerySchema.safeParse({
      type: searchParams.get('type'),
      question: searchParams.get('question'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { type } = parseResult.data;
    const systems = {
      tarot: { available: true, cards: 78 },
      lenormand: { available: true, cards: 36 },
      ifc: { available: true, decks: 16 },
    };
    return NextResponse.json({
      message: 'Oracle divination API',
      availableSystems: systems,
      activeSystem: type,
    });
  } catch {
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}