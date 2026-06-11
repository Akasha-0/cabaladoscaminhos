/**
 * GET /api/akasha/mandato-do-dia
 * Retorna o Mandato do Dia (MandatoEsqueleto) calculado pelo
 * @akasha/core `calcular()` para o usuário autenticado.
 *
 * Referência: .autonomous/research/synthesis/synthesis_v1.md §5 (Mandato)
 * F-201 — P0 da Fase 6.
 *
 * Query params:
 *   intencao?: string  (default: "buscar clareza para o dia")
 *
 * Response 200 (Mandato do Dia):
 *   {
 *     date: 'YYYY-MM-DD',
 *     escala: 'D' | 'S' | 'Z' | 'V',
 *     pilares_relevantes: string[],
 *     redacao_bruta: string,
 *     cita_fontes: string[],
 *     mentor_hook: { intencao, crise_detectada, recurso }
 *   }
 *
 * Erros:
 *   400 — dados natais incompletos ou input inválido
 *   401 — sem sessão
 *   404 — sem Mapa Natal persistido (redireciona ao onboarding)
 *   500 — falha inesperada de cálculo
 *
 * IMPORTANTE (Ethics Charter §5 — Pilar 3):
 *   Se a intenção do usuário dispara o detector de crise, o endpoint
 *   retorna 200 normalmente, mas o `mentor_hook.recurso` vem como
 *   'CVV-188' e o cliente deve EXIBIR a sugestão de recurso humano
 *   em vez de renderizar `redacao_bruta` no Mentor.
 */
import { AkashaInputSchema, calcular, type MandatoEsqueleto } from '@akasha/core';
import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

// Intent default — primeira chamada sem query param.
const INTENCAO_DEFAULT = 'buscar clareza para o dia';

function formatISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function parseHora(time: string | null | undefined): string | undefined {
  if (!time) return undefined;
  // Aceita "HH:MM" ou "HH:MM:SS"; normaliza para "HH:MM".
  const m = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(time);
  if (!m) return undefined;
  return `${m[1]}:${m[2]}`;
}

export async function GET(request: NextRequest) {
  // 1. Autenticar.
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId, name } = authResult;

  // 2. Resolver intent (query param → default validado).
  const rawIntencao = request.nextUrl.searchParams.get('intencao')?.trim() ?? INTENCAO_DEFAULT;

  // 3. Carregar birthChart + dados natais do usuário.
  const [birthChart, user] = await Promise.all([
    prisma.birthChart.findUnique({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { birthDate: true, birthTime: true, birthCity: true },
    }),
  ]);

  if (!birthChart) {
    return NextResponse.json(
      { error: 'Mapa natal não encontrado — conclua o onboarding' },
      { status: 404 }
    );
  }

  if (!user?.birthDate) {
    return NextResponse.json(
      { error: 'Dados natais incompletos — atualize seu perfil' },
      { status: 400 }
    );
  }

  // 4. Construir AkashaInput validado por Zod.
  const inputParse = AkashaInputSchema.safeParse({
    nome: name,
    data_nascimento: formatISODate(user.birthDate),
    hora_nascimento: parseHora(user.birthTime),
    local_nascimento: user.birthCity ?? 'local não informado',
    intencao_inicial: rawIntencao,
  });

  if (!inputParse.success) {
    return NextResponse.json(
      { error: 'Entrada inválida para cálculo do Mandato', details: inputParse.error.flatten() },
      { status: 400 }
    );
  }

  // 5. Calcular Mandato via orquestrador R-030.
  let leitura;
  try {
    leitura = await calcular(inputParse.data);
  } catch (err) {
    console.error('[mandato-do-dia] calcular() falhou', err);
    return NextResponse.json({ error: 'Falha ao calcular Mandato do Dia' }, { status: 500 });
  }

  // 6. Devolver apenas o Mandato (PII mínima) + hook do Mentor.
  const { mandato, mentor_hook } = leitura;
  const date = formatISODate(new Date());

  const response: {
    date: string;
    mandato: MandatoEsqueleto;
    mentor_hook: typeof mentor_hook;
  } = { date, mandato, mentor_hook };

  return NextResponse.json(response);
}
