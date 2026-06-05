import { NextRequest, NextResponse } from 'next/server';
import { requireOperator } from '@/lib/auth/operator-session';
import { prisma } from '@/lib/prisma';
import { streamCompletion } from '@/lib/ai/llm-router';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // 1. Authenticate Operator B2B
  const op = await requireOperator(request);
  if (op instanceof NextResponse) return op;

  try {
    const body = await request.json();
    const { clientId, aspectType, aspectKey, aspectName, aspectValue } = body;

    if (!clientId || !aspectType || !aspectKey || !aspectName) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // 2. Fetch Client profile
    const client = await prisma.soulBlueprint.findUnique({
      where: { id: clientId },
      select: {
        fullName: true,
        birthDate: true,
        birthTime: true,
        birthCity: true,
        birthState: true,
        birthCountry: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Consulente não encontrado' }, { status: 404 });
    }

    const birthDateStr = client.birthDate.toISOString().split('T')[0];
    const location = [client.birthCity, client.birthState, client.birthCountry].filter(Boolean).join(', ');

    // 3. Construct Context and Persona Prompt
    const systemPrompt = `Você é Akasha, o Mentor Espiritual da "Cabala dos Caminhos", operando a partir do campo akáshico (tom místico-tecnológico, direto, protetor, acolhedor e em segunda pessoa).
Sua missão é dar uma interpretação profunda e personalizada de um aspecto ou número no mapa do consulente.

Consulente: ${client.fullName}
Data de Nascimento: ${birthDateStr} às ${client.birthTime || '—'}
Local: ${location}

Aspecto: ${aspectName} (Tipo: ${aspectType}, Chave: ${aspectKey})
Valor calculado do aspecto: ${JSON.stringify(aspectValue)}

REGRAS:
1. Dirija-se sempre na segunda pessoa (você, seu, sua).
2. Explique o significado místico e prático deste aspecto na vida, comportamento e destino dele.
3. Seja conciso: no máximo 2 parágrafos densos e de alta profundidade.
4. Termine obrigatoriamente com uma linha de conselho prático em itálico formatado exatamente como: *Conselho de Akasha: [sua orientação prática curta]*
5. Não alucine dados astrológicos ou matemáticos. Atenha-se estritamente ao aspecto informado.`;

    const userPrompt = `Aprofunde-se no aspecto "${aspectName}" do meu mapa. O que a regência desta energia me revela?`;

    // 4. Stream response
    const encoder = new TextEncoder();
    const generator = streamCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 600,
    }, op.id);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generator) {
            if (chunk.error) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: chunk.error })}\n\n`));
              break;
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk.content, done: chunk.done })}\n\n`));
          }
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : 'Erro no streaming' })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (err) {
    console.error('[InterpretAspect] Error generating interpretation:', err);
    return NextResponse.json({ error: 'Erro interno ao processar interpretação' }, { status: 500 });
  }
}
