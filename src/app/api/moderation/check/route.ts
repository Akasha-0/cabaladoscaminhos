/**
 * POST /api/moderation/check
 *
 * Avalia um conteúdo (texto + opcionalmente imagem) usando o auto-mod
 * pipeline de 5 estágios. Retorna decisão + audit trail.
 *
 * Body: { targetType, authorId, text, urls?, imageUrls?, tradition? }
 * Resposta: { decision, confidence, primaryReason, stages, language, ... }
 *
 * Autenticação: requer sessão válida; usado também internamente pelo
 * feed/comment API antes de persistir.
 *
 * @see src/lib/moderation/auto-mod-pipeline.ts
 */

import { z } from 'zod';
import { ok, fail, handleError } from '@/lib/community/api';
import {
  runAutoMod,
  recordAuditLog,
  type ModerationTargetType,
} from '@/lib/moderation/auto-mod-pipeline';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  targetType: z.enum(['POST', 'COMMENT', 'MESSAGE', 'ARTICLE', 'PROFILE_BIO']),
  authorId: z.string().min(1).max(64),
  text: z.string().min(1).max(20_000),
  urls: z.array(z.string().url()).max(20).optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
  targetId: z.string().optional(),
  tradition: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return fail(400, 'VALIDATION_ERROR', 'Corpo da requisição inválido', parsed.error.format());
    }

    const result = runAutoMod({
      targetType: parsed.data.targetType as ModerationTargetType,
      authorId: parsed.data.authorId,
      text: parsed.data.text,
      urls: parsed.data.urls,
      imageUrls: parsed.data.imageUrls,
      targetId: parsed.data.targetId,
      tradition: parsed.data.tradition,
    });

    // Audit log assíncrono (não bloqueia resposta)
    void recordAuditLog(result, {
      targetType: parsed.data.targetType as ModerationTargetType,
      authorId: parsed.data.authorId,
      text: parsed.data.text,
      urls: parsed.data.urls,
      targetId: parsed.data.targetId,
    });

    return ok(result, {
      cache: { noStore: true },
    });
  } catch (err) {
    return handleError(err);
  }
}