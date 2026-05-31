import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const KarmaQuerySchema = z.object({
  action: z.enum(['status', 'history', 'calculate']).optional(),
  userId: z.string().optional(),
  ciclo: z.coerce.number().int().positive().optional(),
});
const KarmaBodySchema = z.object({
  acao: z.string().min(1, 'Ação é obrigatória'),
  tipo: z.enum(['positiva', 'negativa', 'neutra']),
  descricao: z.string().optional(),
  impacto: z.number().min(1).max(10).optional(),
});
// GET /api/karma - Karma analysis endpoint
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = KarmaQuerySchema.safeParse({
      action: searchParams.get('action'),
      userId: searchParams.get('userId'),
      ciclo: searchParams.get('ciclo'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { action, userId, ciclo } = parseResult.data;
    switch (action) {
      case 'status': {
        return NextResponse.json({
          status: 'ok',
          action: 'status',
          userId,
          ciclo,
          message: 'Karma status retrieved',
        });
      }
      case 'history': {
        return NextResponse.json({
          status: 'ok',
          action: 'history',
          userId,
          history: [],
          message: 'Karma history retrieved',
        });
      }
      case 'calculate': {
        return NextResponse.json({
          status: 'ok',
          action: 'calculate',
          userId,
          message: 'Karma calculation retrieved',
        });
      }
      default: {
        return NextResponse.json({
          status: 'ok',
          endpoints: [
            'GET /api/karma?action=status&userId=<id> - Get karma status',
            'GET /api/karma?action=history&userId=<id> - Get karma history',
            'GET /api/karma?action=calculate&userId=<id> - Calculate karma',
          ],
        });
      }
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 500 }
    );
  }
}
// POST /api/karma - Record karma action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = KarmaBodySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    return NextResponse.json({
      status: 'ok',
      message: 'Karma action recorded',
      record: {
        id: crypto.randomUUID(),
        ...parseResult.data,
        timestamp: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Erro ao processar karma' },
      { status: 500 }
    );
  }
}