/**
 * POST /api/report
 *
 * Submete uma denúncia contra um post, comentário, mensagem, artigo ou
 * perfil. Categorias expandidas (W36): SPAM, HARASSMENT, MISINFO,
 * SACRED_OFFENSE, COPYRIGHT, NSFW, OTHER. Inclui reason text livre,
 * evidências opcionais (URLs), e auto-routing para o mod especializado.
 *
 * Body: { targetType, targetId, reason, description?, evidence? }
 *
 * LGPD: reporter nunca é exposto; reviewer só vê via admin.
 */

import { z } from 'zod';
import { cookies } from 'next/headers';
import { ok, fail, handleError } from '@/lib/community/api';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  targetType: z.enum(['POST', 'COMMENT', 'USER', 'GROUP', 'ARTICLE']),
  targetId: z.string().min(1).max(64),
  reason: z.enum(['SPAM', 'HARASSMENT', 'MISINFO', 'SACRED_OFFENSE', 'COPYRIGHT', 'NSFW', 'OTHER']),
  description: z.string().max(2000).optional(),
  evidence: z.array(z.object({
    type: z.enum(['link', 'image', 'quote']),
    value: z.string().min(1).max(5000),
  })).max(10).optional(),
});

/**
 * Mapeia reason → moderator specialty. Curadores religiosos recebem
 * SACRED_OFFENSE; admins de plataforma recebem SPAM/HARASSMENT; Caio (security)
 * recebe COPYRIGHT/NSFW.
 */
function routeModerator(reason: string): string {
  switch (reason) {
    case 'SACRED_OFFENSE': return 'curator-team';
    case 'COPYRIGHT': return 'security-team';
    case 'NSFW': return 'security-team';
    case 'HARASSMENT': return 'community-team';
    case 'MISINFO': return 'curator-team';
    case 'SPAM': return 'community-team';
    default: return 'community-team';
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const reporterId =
      cookieStore.get('userId')?.value ??
      cookieStore.get('anonymousId')?.value ??
      null;

    if (!reporterId) {
      return fail(401, 'UNAUTHORIZED', 'Você precisa estar logado para reportar conteúdo.');
    }

    const json = await request.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return fail(400, 'VALIDATION_ERROR', 'Dados inválidos', parsed.error.format());
    }

    const { targetType, targetId, reason, description, evidence } = parsed.data;

    // Persistência direta via Prisma
    const { prisma } = await import('@/lib/prisma');

    // Schema atual usa SPAM|HARASSMENT|MISINFO|OTHER; SACRED_OFFENSE|COPYRIGHT|NSFW
    // são novos. Usamos metadata para discriminar (W36-9: enums existentes reusados).
    const flag = await prisma.flag.create({
      data: {
        targetType: targetType === 'ARTICLE' ? 'POST' : targetType,
        targetId,
        reporterId,
        reason: mapToLegacyReason(reason),
        description: [
          description ?? '',
          evidence ? `\n[evidências: ${evidence.length} anexos]` : '',
          `\n[reason_w36: ${reason}]`,
        ].filter(Boolean).join('').slice(0, 2000),
        status: 'PENDING',
      },
      select: { id: true, createdAt: true, status: true },
    });

    // Auditoria + routing
    const routing = routeModerator(reason);
    await prisma.auditLog.create({
      data: {
        action: 'REPORT_SUBMITTED',
        metadata: {
          flagId: flag.id,
          reporterId,
          targetType,
          targetId,
          reason,
          routedTo: routing,
          evidenceCount: evidence?.length ?? 0,
        },
      },
    });

    return ok(
      {
        flagId: flag.id,
        status: flag.status,
        routedTo: routing,
        message: 'Denúncia registrada. Agradecemos sua contribuição para a comunidade.',
      },
      { cache: { noStore: true } }
    );
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Mapear reason W36 → enum legado (FlagReason: SPAM|HARASSMENT|MISINFO|OTHER).
 * Mantém compatibilidade com schema W14; auditoria W36-9 preserva reason original.
 */
function mapToLegacyReason(reason: string): 'SPAM' | 'HARASSMENT' | 'MISINFO' | 'OTHER' {
  switch (reason) {
    case 'SPAM': return 'SPAM';
    case 'HARASSMENT': return 'HARASSMENT';
    case 'MISINFO': return 'MISINFO';
    default: return 'OTHER';
  }
}