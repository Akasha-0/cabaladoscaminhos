import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCiclosTemporais, calcularAnoPessoal, calcularMesPessoal, calcularDiaPessoal } from '@/lib/numerologia/ciclos';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CiclosQuerySchema = z.object({
  tipo: z.enum(['ano', 'mes', 'dia', 'todos']).optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
});
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams();
  const parseResult = CiclosQuerySchema.safeParse({
    tipo: searchParams.get('tipo'),
    data: searchParams.get('data'),
  });
  if (!parseResult.success) {
    return NextResponse.json({
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }
  const { tipo, data: dataNascimento } = parseResult.data;
  const headers = new Headers();
  headers.set('Cache-Control', 'private, max-age=43200, stale-while-revalidate=86400');
  const date = new Date(dataNascimento);
  if (isNaN(date.getTime())) {
    return NextResponse.json(
      { error: 'Data inválida' },
      { status: 400, headers }
    );
  }
  try {
    switch (tipo?.toLowerCase()) {
      case 'ano':
        return NextResponse.json({
          tipo: 'ano',
          ...calcularAnoPessoal(dataNascimento),
          timestamp: new Date().toISOString()
        }, { headers });
      case 'mes':
        const anoInfo = calcularAnoPessoal(dataNascimento);
        return NextResponse.json({
          tipo: 'mes',
          ...calcularMesPessoal(anoInfo.numero),
          timestamp: new Date().toISOString()
        }, { headers });
      case 'dia':
        const anoInfo2 = calcularAnoPessoal(dataNascimento);
        return NextResponse.json({
          tipo: 'dia',
          ...calcularDiaPessoal(dataNascimento, anoInfo2.numero),
          timestamp: new Date().toISOString()
        }, { headers });
      case 'todos':
      case undefined:
        return NextResponse.json({
          tipo: 'todos',
          ciclos: getCiclosTemporais(dataNascimento),
          timestamp: new Date().toISOString()
        }, { headers });
      default:
        return NextResponse.json(
          { error: `Tipo "${tipo}" não reconhecido. Tipos disponíveis: ano, mes, dia, todos` },
          { status: 400, headers }
        );
    }
  } catch (error) {
    console.error('Erro no cálculo de ciclos:', error);
    return NextResponse.json(
      { error: 'Erro ao processar cálculo de ciclos temporais' },
      { status: 500, headers }
    );
  }
}