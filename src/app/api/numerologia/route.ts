import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calcularPitagorica, calcularCaldeia, calcularCabalistica, calcularTantrica } from '@/lib/numerologia/calculos';
// ─── Zod Schema ───────────────────────────────────────────────────────────
const NumerologiaQuerySchema = z.object({
  tipo: z.enum(['pitagorica', 'caldeia', 'cabalistica', 'tantrica', 'todos']).optional(),
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(200, 'Nome muito longo'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
});
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  // Parse and validate with Zod
  const parseResult = NumerologiaQuerySchema.safeParse({
    tipo: searchParams.get('tipo'),
    nome: searchParams.get('nome'),
    data: searchParams.get('data'),
  });
  if (!parseResult.success) {
    return NextResponse.json(
      { 
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }
  const { tipo, nome, data } = parseResult.data;
  const headers = new Headers();
  headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=7200');

  try {
    const pitagorica = calcularPitagorica(nome);
    const caldeia = calcularCaldeia(nome);
    const cabalistica = calcularCabalistica(nome);
    switch (tipo) {
      case 'pitagorica':
        return NextResponse.json({
          tipo: 'pitagorica',
          numero: pitagorica,
          timestamp: new Date().toISOString()
        }, { headers });
      case 'caldeia':
        return NextResponse.json({
          tipo: 'caldeia',
          numero: caldeia,
          timestamp: new Date().toISOString()
        }, { headers });
      case 'cabalistica':
        return NextResponse.json({
          tipo: 'cabalistica',
          numero: cabalistica,
          timestamp: new Date().toISOString()
        }, { headers });
      case 'tantrica':
        return NextResponse.json({
          tipo: 'tantrica',
          numero: tantrica,
          data: data,
          timestamp: new Date().toISOString()
        }, { headers });
      default:
        return NextResponse.json({
          tipo: 'todos',
          pitagorica,
          caldeia,
          cabalistica,
          tantrica,
          timestamp: new Date().toISOString()
        }, { headers });
    }
  } catch (error) {
    console.error('Erro no cálculo de numerologia:', error);
    return NextResponse.json(
      { error: 'Erro ao processar cálculo numerológico' },
      { status: 500, headers }
    );
  }
}
        );
    }
  } catch (error) {
    console.error('Erro no cálculo de numerologia:', error);
    return NextResponse.json(
      { error: 'Erro ao processar cálculo numerológico' },
      { status: 500, headers }
    );
  }
}
