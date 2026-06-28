// ============================================================================
// POST /api/akashic/tts — Server-side TTS placeholder (Wave 25 — 2026-06-28)
// ============================================================================
// Endpoint preparado para futura integração com ElevenLabs / OpenAI TTS.
// Por enquanto, devolve 501 Not Implemented com payload explicativo para que
// o VoicePlayer (Wave 25) saiba que o backend ainda não está plugado e
// continue usando a Web Speech API como caminho primário.
//
// Por que placeholder (não já integrado):
//   - Decisão consciente: W25 é wave de UX (botão + atalho + multilíngue).
//   - Integração com ElevenLabs exige ELEVENLABS_API_KEY + cache strategy
//     (S3/R2) — escopo separado para evitar bloat em uma wave só.
//   - Web Speech API já cobre 95%+ dos usuários desktop+mobile.
//
// Quando for ligar (Wave 26+ roadmap):
//   1. Adicionar env ELEVENLABS_API_KEY (já tem padrão em .env.example).
//   2. Implementar cache: hash(text+voice) → URL no R2/S3.
//   3. Substituir o 501 abaixo por stream de áudio.
//   4. VoicePlayer já tem fallback pronto — basta passar `endpoint`.
//
// Resposta atual:
//   - 501 + { error, code: 'NOT_IMPLEMENTED', hint }
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TTSSchema = z.object({
  text: z.string().min(1).max(5000),
  locale: z.enum(['pt-BR', 'en-US', 'es-ES']).default('pt-BR'),
  voiceId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // ─── Rate limit (reusa infraestrutura do projeto) ─────────────────
  // 30 req/min por IP — mais do que suficiente pra narração (1 req por
  // mensagem da Akasha). Em produção, ajustar pra 5/min se virar alvo.
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'anonymous';

  const rl = checkRateLimit(`akashic-tts:${ip}`, {
    windowMs: 60_000,
    maxRequests: 30,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Muitas requisições de narração. Aguarde um instante.',
          retryAfterSec: Math.ceil(rl.resetIn / 1000),
        },
      },
      { status: 429 },
    );
  }

  // ─── Validate payload ─────────────────────────────────────────────
  let payload: z.infer<typeof TTSSchema>;
  try {
    const raw = await req.json();
    payload = TTSSchema.parse(raw);
  } catch (err) {
    return NextResponse.json(
      {
        error: 'invalid_payload',
        message: err instanceof Error ? err.message : 'payload inválido',
      },
      { status: 400 },
    );
  }

  // ─── Placeholder response (server-side TTS ainda não integrado) ──
  return NextResponse.json(
    {
      error: 'not_implemented',
      code: 'NOT_IMPLEMENTED',
      message:
        'Server-side TTS ainda não está plugado. Usando fallback Web Speech API no cliente.',
      hint:
        'Quando integrarmos ElevenLabs / OpenAI TTS, este endpoint devolverá { audioUrl, duration }.',
      received: {
        textLength: payload.text.length,
        locale: payload.locale,
        voiceId: payload.voiceId ?? null,
      },
    },
    { status: 501 },
  );
}

// ─── GET → health check rápido ────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/akashic/tts',
    methods: ['POST'],
    status: 'placeholder',
    message: 'Server-side TTS ainda não implementado. Use Web Speech API no cliente.',
  });
}