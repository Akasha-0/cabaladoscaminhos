import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const AncestralQuerySchema = z.object({
  userId: z.string().optional(),
  linhagem: z.string().optional(),
  geracao: z.coerce.number().int().positive().optional(),
});
const AncestralBodySchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  linhagem: z.string().min(1, 'Linhagem é obrigatória'),
  geracao: z.number().int().positive().optional(),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  dataFalecimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  orixa: z.string().optional(),
  qualities: z.array(z.string()).optional(),
  historia: z.string().optional(),
});
// GET /api/ancestral - Ancestral guidance endpoint
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = AncestralQuerySchema.safeParse({
      userId: searchParams.get('userId'),
      linhagem: searchParams.get('linhagem'),
      geracao: searchParams.get('geracao'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { userId, linhagem, geracao } = parseResult.data;
    // Return ancestral guidance based on lineage
    return NextResponse.json({
      status: 'ok',
      userId,
      linhagem,
      geracao,
      ancestralGuidance: {
        message: 'Conexão ancestral estabelecida',
        traditions: ['Candomblé', 'Umbanda', 'Jurema', 'Tupi'],
        orixas: ['Oxum', 'Oxumar', 'Iansã', 'Ogum', 'Xangô', 'Iemanjá'],
      },
    });
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar ancestral',
    }, { status: 500 });
  }
}
// POST /api/ancestral - Record ancestral connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = AncestralBodySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    return NextResponse.json({
      status: 'ok',
      message: 'Ancestral registrado',
      ancestral: {
        id: crypto.randomUUID(),
        ...parseResult.data,
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar ancestral',
    }, { status: 500 });
  }
}