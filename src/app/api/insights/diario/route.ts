import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getCreditos, usarCreditos } from '@/lib/credits/service';
import { getCiclosTemporais } from '@/lib/numerologia/ciclos';
import { gerarInsightDiario } from '@/lib/ai/insights/generator';
import type { UsuarioContext } from '@/lib/ai/prompt-system';
import { getCorrespondenciasDia } from '@/lib/data/spiritual-data';
import { odus } from '@/lib/data/spiritual-data';
import { checkRateLimit } from '@/lib/rate-limit';

const CUSTO_INSIGHT = 1;

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userId = request.headers.get('x-user-id') || ip;
  
  const rateLimitResult = checkRateLimit(userId, { windowMs: 60000, maxRequests: 5 });
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit excedido', retryAfter: Math.ceil(rateLimitResult.resetIn / 1000) },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimitResult.resetIn / 1000).toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
        }
      }
    );
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Usuário não autenticado' },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const dataNascimento = searchParams.get('data');
    const nome = searchParams.get('nome');
    const odu = searchParams.get('odu');
    const numeroPessoal = searchParams.get('numero');

    if (!dataNascimento || !nome || !odu) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: data, nome, odu' },
        { status: 400 }
      );
    }

    const creditos = await getCreditos(user.id);
    if (creditos < CUSTO_INSIGHT) {
      return NextResponse.json(
        { error: 'Créditos insuficientes para gerar insight', saldo: creditos },
        { status: 402 }
      );
    }

    const ciclos = getCiclosTemporais(dataNascimento);
    const correspondencias = getCorrespondenciasDia();
    const oduData = odus.find(o => o.nome.toLowerCase() === odu.toLowerCase());

    const contexto: UsuarioContext = {
      nome,
      dataNascimento,
      numeroPessoal: parseInt(numeroPessoal || '1', 10),
      odu,
      oduSignificado: oduData?.significado || '',
      ciclos: {
        ano: ciclos.anoPessoal,
        mes: ciclos.mesPessoal,
        dia: ciclos.diaPessoal,
        sefirotAno: ciclos.sefirotAno,
        sefirotMes: ciclos.sefirotMes,
        sefirotDia: ciclos.sefirotDia
      },
      diaAtual: {
        nome: correspondencias.dia.dia,
        orixas: correspondencias.dia.orixas,
        cores: correspondencias.dia.cores,
        faseLua: correspondencias.faseLua?.fase || '',
        sephirot: correspondencias.dia.sephirot
      }
    };

    const insight = await gerarInsightDiario(contexto);

    await usarCreditos(user.id, CUSTO_INSIGHT, 'insight_diario');

    return NextResponse.json({
      insight,
      ciclos,
      diaAtual: correspondencias,
      creditosRestantes: creditos - CUSTO_INSIGHT,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao gerar insight:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar insight diário' },
      { status: 500 }
    );
  }
}
