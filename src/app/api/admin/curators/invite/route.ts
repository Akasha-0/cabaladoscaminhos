// ============================================================================
// POST /api/admin/curators/invite — Wave 35 (2026-07-01)
// ============================================================================// Admin/Iyá convida um novo curador para uma tradição focada.
// Cria um CuratorInvitation PENDING + dispara email (best-effort).
//
// Auth:
//   - requireAdmin() (inclui Iyá via ADMIN_EMAILS ou IYA_EMAIL escape hatch)
//   - Reforço: role=IYA ou ADMIN pode usar a rota
//
// Body:
//   {
//     email: string,
//     displayName: string,
//     tradition: string,
//     curatorRole?: 'CURATOR_CABALA' | 'CURATOR_IFA' | ... ,
//     personalMessage?: string
//   }
//
// Retorna: { invitationId, acceptUrl, expiresAt }
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, ErrorCode, handleError } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import {
  generateInviteToken,
  inviteExpiresAt,
  traditionLabel,
  defaultPermissionsFor,
  resolveUserRole,
} from '@/lib/curators/service';
import { renderCuratorInvite } from '@/lib/email/templates/curator-invite';
import { sendEmail } from '@/lib/email/send';

export const runtime = 'nodejs';

const BodySchema = z.object({
  email: z.string().email().max(200),
  displayName: z.string().min(2).max(100),
  tradition: z.string().min(2).max(50).regex(/^[a-z0-9_-]+$/, 'slug canônico'),
  curatorRole: z.enum([
    'CURATOR_CABALA',
    'CURATOR_IFA',
    'CURATOR_TANTRA',
    'CURATOR_ASTROLOGIA',
    'GUEST_CURATOR',
  ]).default('CURATOR_CABALA'),
  personalMessage: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(ErrorCode.FORBIDDEN, `Admin/Iyá required (${session.reason})`, 403);
    }

    const role = await resolveUserRole(session.userId, session.email);
    if (role !== 'ADMIN' && role !== 'IYA') {
      return fail(ErrorCode.FORBIDDEN, `Apenas admin ou Iyá (atual=${role})`, 403);
    }

    const json = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const { email, displayName, tradition, curatorRole, personalMessage } = parsed.data;

    // Idempotência: não emitir dois convites pendentes idênticos
    const existing = await prisma.curatorInvitation.findFirst({
      where: { email: email.toLowerCase(), status: 'PENDING' },
      select: { id: true, expiresAt: true, acceptToken: true },
    });
    if (existing && existing.expiresAt.getTime() > Date.now()) {
      return fail(
        ErrorCode.CONFLICT,
        `Já existe convite PENDING ativo para ${email}; revogue ou espere expirar`,
        409
      );
    }

    const token = generateInviteToken();
    const expiresAt = inviteExpiresAt();
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const acceptUrl = `${origin}/curator/convite/${token}`;

    const inviterRow = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { nomeCompleto: true, email: true },
    });
    const inviterName = inviterRow?.nomeCompleto || session.email;
    const inviterRole = role === 'IYA' ? 'Curadora-chefe' : 'Admin';

    const invitation = await prisma.curatorInvitation.create({
      data: {
        email: email.toLowerCase(),
        displayName,
        tradition,
        curatorRole,
        acceptToken: token,
        status: 'PENDING',
        invitedById: session.userId,
        invitedByName: inviterName,
        personalMessage: personalMessage ?? null,
        expiresAt,
      },
      select: { id: true, createdAt: true },
    });

    await logAudit({
      action: 'CURATOR_INVITED',
      actorId: session.userId,
      targetId: invitation.id,
      metadata: {
        tradition,
        curatorRole,
        inviteeEmail: email.toLowerCase(),
        acceptUrl,
      },
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    // Best-effort envio de email (não bloqueia a resposta)
    let emailSent = false;
    let emailError: string | null = null;
    try {
      const tpl = renderCuratorInvite({
        displayName,
        inviterName,
        inviterRole,
        tradition,
        traditionLabel: traditionLabel(tradition),
        curatorRole:
          curatorRole === 'GUEST_CURATOR'
            ? 'Curador(a) temporário(a)'
            : `Curador(a) convidado(a) de ${traditionLabel(tradition)}`,
        acceptUrl,
        expiresAt,
        personalMessage,
      });
      const sent = await sendEmail({
        to: email.toLowerCase(),
        templateId: 'curator-invite',
        data: {
          displayName,
          inviterName,
          inviterRole,
          tradition,
          traditionLabel: traditionLabel(tradition),
          curatorRole:
            curatorRole === 'GUEST_CURATOR'
              ? 'Curador(a) temporário(a)'
              : `Curador(a) convidado(a) de ${traditionLabel(tradition)}`,
          acceptUrl,
          expiresAt,
          personalMessage,
        },
      });
      emailSent = sent.ok;
      if (!sent.ok) emailError = sent.error ?? null;
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err);
    }

    return ok({
      invitationId: invitation.id,
      acceptUrl,
      expiresAt: expiresAt.toISOString(),
      tradition,
      traditionLabel: traditionLabel(tradition),
      curatorRole,
      emailSent,
      emailError,
      defaultPermissions: defaultPermissionsFor(curatorRole),
    });
  } catch (err) {
    return handleError(err, 'POST /api/admin/curators/invite');
  }
}
