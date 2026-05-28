import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { buscarConversas, salvarConversa } from '@/lib/chat/service';
import { TemaChat, MensagemChat } from '@/lib/chat/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
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
    const conversas = await buscarConversas(user.id);

    return NextResponse.json({
      conversas: conversas.map(c => ({
        id: c.id,
        tema: c.tema,
        mensagens: c.mensagens.map(m => ({
          tipo: m.tipo,
          conteudo: m.conteudo,
          timestamp: m.createdAt.toISOString(),
        })),
        criadaEm: c.criadaEm.toISOString(),
        atualizadaEm: c.atualizadaEm.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico de conversas' },
      { status: 500 }
    );
  }
}

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

  try {
    const body = await request.json();
    const { tema, mensagens } = body as {
      tema: TemaChat;
      mensagens: MensagemChat[];
    };

    if (!tema || !mensagens || !Array.isArray(mensagens)) {
      return NextResponse.json(
        { error: 'Tema e mensagens são obrigatórios' },
        { status: 400 }
      );
    }

    const mensagensFormatadas: MensagemChat[] = mensagens.map(m => ({
      id: m.id || crypto.randomUUID(),
      tipo: m.tipo as 'usuario' | 'assistente',
      conteudo: m.conteudo,
      tema: m.tema as TemaChat,
      timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
    }));

    const conversa = await salvarConversa(user.id, tema, mensagensFormatadas);

    return NextResponse.json({
      conversa: {
        id: conversa.id,
        tema,
        mensagens: mensagensFormatadas,
      },
    });
  } catch (error) {
    console.error('Erro ao salvar conversa:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar conversa' },
      { status: 500 }
    );
  }
}