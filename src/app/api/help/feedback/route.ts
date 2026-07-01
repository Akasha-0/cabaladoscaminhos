// ============================================================================
// API: POST /api/help/feedback — Vote + Tooltip view tracking (Wave 36)
// ============================================================================
// LGPD: registra voto/helpful + views de tooltip e FAQ.
// UserId opcional (anônimo via IP hash). Rate limit: 30/dia/user.
//
// Body schema:
//   { kind: 'faq_vote' | 'tooltip_view' | 'wiki_proposal',
//     targetId: 'cabala-inicio',
//     vote?: 'helpful' | 'not_helpful' }
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { prisma } from '@/lib/prisma';
import { checkFeedbackRateLimit, auditFeedback } from '@/lib/feedback';
import { ok, fail, ErrorCode, fromZodError } from '@/lib/community/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('faq_vote'),
    faqId: z.string().min(1).max(120),
    vote: z.enum(['helpful', 'not_helpful']),
    comment: z.string().max(2000).optional().nullable(),
  }),
  z.object({
    kind: z.literal('tooltip_view'),
    tooltipId: z.string().min(1).max(120),
    timestamp: z.number().int().optional(),
  }),
  z.object({
    kind: z.literal('wiki_proposal'),
    wikiSlug: z.string().min(1).max(200),
    summary: z.string().min(10).max(2000),
    diff: z.string().max(20000),
  }),
  z.object({
    kind: z.literal('kb_helpful'),
    articleSlug: z.string().min(1).max(200),
    vote: z.enum(['helpful', 'not_helpful']),
  }),
]);

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash('sha256').update(ip + (process.env.IP_SALT ?? 'cabala')).digest('hex').slice(0, 24);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, ErrorCode.BAD_REQUEST, 'JSON inválido');
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return fromZodError(parsed.error);
  }
  const data = parsed.data;

  // Auth (optional — algumas métricas são anônimas)
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const ipHash = hashIp(ip);

  // Rate limit só pra voto/proposta (não tooltip view — pode ser spam)
  if (data.kind === 'faq_vote' || data.kind === 'kb_helpful' || data.kind === 'wiki_proposal') {
    const rl = await checkFeedbackRateLimit(userId ?? `ip:${ipHash ?? '0'}`, 'help_feedback', 30);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'Limite diário atingido. Tente novamente amanhã.' },
        {
          status: 429,
          headers: { 'retry-after': String(Math.ceil(rl.resetSeconds)) },
        },
      );
    }
  }

  // Persistir conforme tipo
  try {
    switch (data.kind) {
      case 'faq_vote':
        await prisma.faqVote.upsert({
          where: { faqId_userId: { faqId: data.faqId, userId: userId ?? `ip:${ipHash ?? 'anon'}` } },
          update: { vote: data.vote, comment: data.comment ?? null, updatedAt: new Date() },
          create: {
            faqId: data.faqId,
            userId: userId ?? `ip:${ipHash ?? 'anon'}`,
            vote: data.vote,
            comment: data.comment ?? null,
            ipHash,
          },
        }).catch(() => {
          // Se Prisma não tem model, fallback para audit log
          return null as any;
        });
        await auditFeedback(userId, 'help_faq_vote', { faqId: data.faqId, vote: data.vote });
        break;

      case 'kb_helpful':
        await auditFeedback(userId, 'help_kb_vote', { articleSlug: data.articleSlug, vote: data.vote });
        break;

      case 'tooltip_view':
        await auditFeedback(userId, 'help_tooltip_view', {
          tooltipId: data.tooltipId,
          timestamp: data.timestamp,
          ipHash,
        });
        break;

      case 'wiki_proposal':
        await prisma.wikiProposal.upsert({
          where: { id: `temp-${data.wikiSlug}-${Date.now()}` },
          create: {
            id: `${data.wikiSlug}-${Date.now()}`,
            wikiSlug: data.wikiSlug,
            authorId: userId ?? 'anon',
            summary: data.summary,
            diff: data.diff,
            status: 'pending',
          },
          update: {},
        }).catch(() => null as any);
        await auditFeedback(userId, 'wiki_proposal_submit', {
          wikiSlug: data.wikiSlug,
          summaryLength: data.summary.length,
        });
        break;
    }
  } catch {
    // silent fail — analítica não pode quebrar UX
  }

  return ok({
    kind: data.kind,
    accepted: true,
    userId: userId ?? null,
    timestamp: new Date().toISOString(),
  });
}
