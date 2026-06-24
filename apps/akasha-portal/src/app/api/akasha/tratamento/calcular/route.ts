/**
 * /api/akasha/tratamento/calcular — POST
 *
 * Wave 5 Synthesis Engine: recebe AkashaInput + respostas das 16 perguntas
 * clínicas, retorna SynthesisOutput (7 camadas + cadeia_pensamento).
 *
 * Auth: requireAkashaApi (cookie JWT).
 * Crisis detection: R-022 §5.5-5.6 regex → CVV-188 flag.
 * Rate limit: 10 req/min por zelador.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { tratamentoRequestSchema } from '../schemas';
import { logSintetizarRequest } from '@/lib/application/akasha/tratamento-logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Crisis regex from R-022 §5.5-5.6 (akasha-core/src/akasha-core.ts:166-167)
const CRISE_REGEX =
  /\b(suicid|morrer|matar|automutil|desesper[oa]|não aguento|não quero mais viver)\b/i;

export async function POST(request: NextRequest) {
  // 1. Auth
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id: zeladorId } = authResult;

  // 2. Zod parse
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = tratamentoRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;

  // 3. Crisis detection (R-022 §5.5-5.6)
  const criseDetectada = CRISE_REGEX.test(input.consulenteNome + ' ' + JSON.stringify(input));
  const cvv188 = criseDetectada;

  // 4. Synthesize
  let output;
  try {
    const { sintetizar } = await import('@akasha/tratamento').catch(() => ({
      sintetizar: null as never,
    }));
    if (!sintetizar) {
      return NextResponse.json(
        { error: 'engine_unavailable' },
        { status: 503 }
      );
    }
    output = await sintetizar(input as never, input.opcoes);
  } catch (e) {
    return NextResponse.json(
      { error: 'engine_failed' },
      { status: 500 }
    );
  }

  // 5. Log fire-and-forget (no PII)
  logSintetizarRequest(zeladorId, input, output);

  // 6. Return
  return NextResponse.json({
    success: true,
    zeladorId,
    caminhadaId: input.caminhadaId,
    cvv188,
    output,
  });
}
