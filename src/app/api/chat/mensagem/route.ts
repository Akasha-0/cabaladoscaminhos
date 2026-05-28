import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getCreditos, debitarCreditos, CreditosInsuficientesError } from '@/lib/credits/service';
import { enviarMensagemChat } from '@/lib/chat/service';
import { TemaChat, MensagemChat } from '@/lib/chat/types';
import { getCiclosTemporais } from '@/lib/numerologia/ciclos';
import { getCorrespondenciasDia } from '@/lib/data/spiritual-data';
import { odus } from '@/lib/data/spiritual-data';
import type { UsuarioContext } from '@/lib/ai/prompt-system';
import { checkRateLimit } from '@/lib/rate-limit';

const CUSTO_CHAT = 2;

export async function POST(request: NextRequest) {
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

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userId = request.headers.get('x-user-id') || user.id || ip;
  
  const rateLimitResult = checkRateLimit(userId, { windowMs: 60000, maxRequests: 10 });
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

  try {
    const body = await request.json();
    const { pergunta, tema, historico } = body as {
      pergunta: string;
      tema: TemaChat;
      historico?: MensagemChat[];
    };

    if (!pergunta || typeof pergunta !== 'string') {
      return NextResponse.json(
        { error: 'Pergunta é obrigatória' },
        { status: 400 }
      );
    }

    if (!tema) {
      return NextResponse.json(
        { error: 'Tema é obrigatório' },
        { status: 400 }
      );
    }

    const creditos = await getCreditos(user.id);
    if (creditos < CUSTO_CHAT) {
      return NextResponse.json(
        { error: 'Créditos insuficientes para consultar o guia', saldo: creditos, necessario: CUSTO_CHAT },
        { status: 402 }
      );
    }

    const contexto = await construirContextoUsuario(user.id);

    const resposta = await enviarMensagemChat({
      pergunta,
      tema,
      contextoUsuario: contexto,
      historico: historico?.map(m => ({
        id: m.id,
        tipo: m.tipo as 'usuario' | 'assistente',
        conteudo: m.conteudo,
        tema: m.tema as TemaChat,
        timestamp: new Date(m.timestamp),
      })),
    });

    const debito = await debitarCreditos(user.id, CUSTO_CHAT, 'perguntaChat');

    return NextResponse.json({
      resposta,
      novoSaldo: debito.novoSaldo,
      custo: CUSTO_CHAT,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao processar mensagem de chat:', error);
    if (error instanceof CreditosInsuficientesError) {
      return NextResponse.json(
        { error: error.message, saldoAtual: error.saldoAtual, saldoNecessario: error.saldoNecessario },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erro ao processar sua mensagem. Tente novamente.' },
      { status: 500 }
    );
  }
}

async function construirContextoUsuario(userId: string): Promise<UsuarioContext | undefined> {
  try {
    const { prisma } = await import('@/lib/prisma');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        nomeCompleto: true,
        dataNascimento: true,
        mapaNatal: {
          select: {
            numeroCabalistico: true,
            oduPrincipal: true,
          },
        },
      },
    });

    if (!user) return undefined;

    const ciclos = getCiclosTemporais(user.dataNascimento.toISOString().split('T')[0]);
    const correspondencias = getCorrespondenciasDia();
    const oduData = odus.find(o => o.nome.toLowerCase() === (user.mapaNatal?.oduPrincipal || '').toLowerCase());

    return {
      nome: user.nomeCompleto,
      dataNascimento: user.dataNascimento.toISOString().split('T')[0],
      numeroPessoal: user.mapaNatal?.numeroCabalistico || ciclos.anoPessoal,
      odu: user.mapaNatal?.oduPrincipal || '',
      oduSignificado: oduData?.significado || '',
      ciclos: {
        ano: ciclos.anoPessoal,
        mes: ciclos.mesPessoal,
        dia: ciclos.diaPessoal,
        sefirotAno: ciclos.sefirotAno,
        sefirotMes: ciclos.sefirotMes,
        sefirotDia: ciclos.sefirotDia,
      },
      diaAtual: {
        nome: correspondencias.dia.dia,
        orixas: correspondencias.dia.orixas,
        cores: correspondencias.dia.cores,
        faseLua: correspondencias.faseLua?.fase || '',
        sephirot: correspondencias.dia.sephirot,
      },
    };
  } catch (error) {
    console.error('Erro ao construir contexto do usuário:', error);
    return undefined;
  }
}