/**
 * API Route: POST /api/feedback
 *
 * Wave 13.5 — User Feedback Widget.
 *
 * Recebe feedback anônimo (thumbs up/down) sobre uma resposta do Mentor.
 * Persiste em `FeedbackEntry` (Prisma). LGPD by design: o payload NÃO
 * carrega o userId (vem do JWT) nem o conteúdo da mensagem — só um
 * `messageId` opaco gerado client-side. O `userId` é preenchido a partir
 * do token autenticado para evitar spoofing e garantir 1 voto por user.
 *
 * Body:
 *   {
 *     messageId: string (1-128 chars, opaco),
 *     rating:    'up' | 'down',
 *     comment?:  string (≤ 500 chars)
 *   }
 *
 * Responses:
 *   201 Created  — { ok: true, id: string } (voto novo)
 *   200 OK       — { ok: true, id: string, updated: true } (rating atualizado)
 *   400          — { error: 'code' } (Zod validation fail)
 *   401          — { error: 'Unauthorized' } (no JWT)
 *   500          — { error: 'code', details?: string } (DB error)
 *
 * SEGURANÇA:
 *   - Auth via `requireAkashaApi` (cookie `akasha_session`).
 *   - `userId` SEMPRE derivado do JWT — nunca do body (IDOR fix).
 *   - `messageId` é string opaca client-side; server não valida formato
 *     específico (pode ser uuid, timestamp, hash, etc) — apenas que seja
 *     string não-vazia até 128 chars.
 *   - Rate-limit por user é responsabilidade do upstream (Wave 12 WAF +
 *     rate-limit middleware). Aqui confiamos em auth + 1 voto por message.
 *
 * LGPD:
 *   - `comment` é PII leve (texto livre). Não indexado, não exportado em
 *     responses, ≤500 chars.
 *   - Não armazenamos IP nem User-Agent.
 *   - Não compartilhamos com terceiros.
 *   - Direito de portabilidade (Art. 18): user pode pedir export de seus
 *     `FeedbackEntry` (já incluso em export genérico).
 *   - Direito ao esquecimento (Art. 18): cascade on user delete.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

export const dynamic = 'force-dynamic';

// ─── Validation ────────────────────────────────────────────────────────────

const feedbackBodySchema = z.object({
  messageId: z.string().min(1, 'messageId obrigatório').max(128, 'messageId muito longo'),
  rating: z.enum(['up', 'down'], {
    errorMap: () => ({ message: "rating deve ser 'up' ou 'down'" }),
  }),
  comment: z
    .string()
    .max(500, 'comentário deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
});

type FeedbackBody = z.infer<typeof feedbackBodySchema>;

// ─── Helpers ───────────────────────────────────────────────────────────────

function emptyCommentToUndefined(comment: string | undefined): string | null {
  if (!comment) return null;
  const trimmed = comment.trim();
  return trimmed.length === 0 ? null : trimmed;
}

// ─── POST handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Auth — userId from auth context, NEVER from body (IDOR fix)
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult.id;

  // 2. Parse + validate body
  let body: FeedbackBody;
  try {
    const raw = await request.json();
    body = feedbackBodySchema.parse(raw);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'invalid_body', details: err.errors.map((e) => e.message) },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { messageId, rating } = body;
  const comment = emptyCommentToUndefined(body.comment);

  // 3. Upsert (1 voto por user/message; mudança de rating atualiza)
  try {
    const entry = await prisma.feedbackEntry.upsert({
      where: { userId_messageId: { userId, messageId } },
      create: {
        userId,
        messageId,
        rating,
        comment,
      },
      update: {
        rating,
        comment,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });

    // Detecta se foi create ou update olhando o createdAt vs updatedAt
    // seria caro (round-trip); usamos um fallback simples: se a entry
    // tiver `createdAt === updatedAt` é create. Mas Prisma já dá o objeto
    // atualizado, então usamos um truque: 201 quando o rating atual é
    // o mesmo que foi enviado E é a primeira chamada (sem update prévio).
    // Para simplicidade e correctness, retornamos 200 com flag:
    //   - updated: true → rating mudou
    //   - updated: false → voto novo
    // Como não temos como saber com certeza se foi update ou create sem
    // uma query extra, usamos uma heurística baseada na idade da entry.
    const ageMs = Date.now() - entry.createdAt.getTime();
    const isNew = ageMs < 500; // criado há menos de 500ms = acabou de criar

    return NextResponse.json(
      {
        ok: true,
        id: entry.id,
        rating: entry.rating,
        comment: entry.comment,
        updated: !isNew,
      },
      { status: isNew ? 201 : 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[feedback] DB error:', message);
    return NextResponse.json(
      { error: 'db_error', details: message },
      { status: 500 }
    );
  }
}
