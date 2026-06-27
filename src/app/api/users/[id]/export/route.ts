// ============================================================================
// EXPORT USER DATA — /api/users/[id]/export
// ============================================================================
// LGPD Art. 18, V — Direito à portabilidade.
//
// Retorna um JSON completo com TODOS os dados pessoais do usuário em
// formato estruturado e legível por máquina (LGPD art. 18 V + regulamento
// ANPD sobre formato). Inclui:
//
//   - Identidade (User)
//   - Mapa natal
//   - Spiritual profile
//   - Posts (incluindo soft-deletados)
//   - Comentários
//   - Likes / comment-likes / bookmarks
//   - Follows (followed + followers)
//   - Notifications recebidas
//   - AI conversations (sem PII de terceiros)
//   - Push subscriptions
//   - Audit log do próprio usuário
//
// Segurança:
//   - Requer autenticação
//   - `id` no path == userId autenticado (não exporta dados de outros)
//   - Loga DATA_EXPORT_REQUEST + DATA_EXPORT_DELIVERED
//   - Retorna Content-Disposition: attachment (download direto)
//
// Limitações:
//   - Não inclui dados de sessões ativas ou logs de auth (esses ficam
//     em audit_logs mas com hash de IP, não o dado bruto)
//   - Não inclui dados de pagamento Stripe (esses têm export próprio
//     via painel Stripe — fora do escopo do app)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id: targetId } = await context.params;

    let viewer;
    try {
      viewer = await requireViewer();
    } catch (err) {
      const e = err as { statusCode?: number };
      return fail(
        e.statusCode ?? 401,
        ErrorCode.UNAUTHORIZED,
        'Você precisa estar logado'
      );
    }

    if (viewer.id !== targetId) {
      return fail(
        403,
        ErrorCode.FORBIDDEN,
        'Você só pode exportar seus próprios dados'
      );
    }

    // Log de intenção ANTES da query (LGPD — rastro de solicitação)
    await audit.dataExport(viewer.id, {
      ip: _request.headers.get('x-forwarded-for'),
      userAgent: _request.headers.get('user-agent'),
    });

    // Pull paralelo de todas as fontes de dados do usuário
    const [
      user,
      mapaNatal,
      spiritualProfile,
      journalEntries,
      favoritos,
      posts,
      comments,
      likes,
      commentLikes,
      bookmarks,
      followers,
      following,
      notifications,
      aiConversations,
      pushSubscriptions,
      unsubscribeTokens,
      groupMembers,
      groupInvitesReceived,
      auditLogs,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: viewer.id },
        select: {
          id: true,
          email: true,
          nomeCompleto: true,
          dataNascimento: true,
          horaNascimento: true,
          localNascimento: true,
          temaPreferido: true,
          planoAssinatura: true,
          createdAt: true,
          updatedAt: true,
          // NÃO inclui passwordHash nem supabaseUserId (segredos)
          // NÃO inclui stripeCustomerId/SubscriptionId (PCI escopo separado)
        },
      }),
      prisma.mapaNatal.findUnique({ where: { userId: viewer.id } }),
      prisma.spiritualProfile.findUnique({ where: { userId: viewer.id } }).catch(() => null),
      prisma.journalEntry.findMany({
        where: { userId: viewer.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.favorito.findMany({ where: { userId: viewer.id } }),
      prisma.post.findMany({
        where: { authorId: viewer.id },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.comment.findMany({
        where: { authorId: viewer.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.like.findMany({
        where: { userId: viewer.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.commentLike.findMany({
        where: { userId: viewer.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bookmark.findMany({
        where: { userId: viewer.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.follow.findMany({
        where: { followerId: viewer.id },
        select: { followedId: true, createdAt: true },
      }),
      prisma.follow.findMany({
        where: { followedId: viewer.id },
        select: { followerId: true, createdAt: true },
      }),
      prisma.notification.findMany({
        where: { userId: viewer.id },
        orderBy: { createdAt: 'desc' },
        take: 1000, // Limite razoável para export
      }),
      prisma.aiConversation.findMany({
        where: { userId: viewer.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      prisma.pushSubscription.findMany({
        where: { userId: viewer.id },
        // NÃO exporta `auth` e `p256dh` (segredos de criptografia push)
        select: {
          id: true,
          endpoint: true,
          userAgent: true,
          active: true,
          lastSentAt: true,
          createdAt: true,
        },
      }),
      prisma.unsubscribeToken.findMany({
        where: { userId: viewer.id },
        // NÃO exporta o `token` (segredo de unsubscribe)
        select: {
          id: true,
          type: true,
          expiresAt: true,
          usedAt: true,
          createdAt: true,
        },
      }),
      prisma.groupMember.findMany({
        where: { userId: viewer.id },
        select: { groupId: true, role: true, joinedAt: true },
      }),
      prisma.groupInvite.findMany({
        where: { inviteeId: viewer.id },
        select: { groupId: true, inviterId: true, status: true, createdAt: true },
      }),
      prisma.auditLog.findMany({
        where: { actorId: viewer.id },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
    ]);

    const exportPayload = {
      metadata: {
        schemaVersion: '1.0',
        exportedAt: new Date().toISOString(),
        exportedBy: viewer.id,
        legalBasis: 'LGPD Art. 18, V — Direito à portabilidade',
        format: 'application/json (RFC 8259)',
        retention: 'Este arquivo contém seus dados pessoais. Guarde com segurança.',
      },
      identity: user,
      mapaNatal,
      spiritualProfile,
      journalEntries,
      favoritos,
      content: {
        posts,
        comments,
        likes,
        commentLikes,
        bookmarks,
      },
      social: {
        followers,
        following,
        groupMembers,
        groupInvitesReceived,
      },
      notifications,
      ai: {
        conversations: aiConversations,
      },
      devices: {
        pushSubscriptions,
        unsubscribeTokens,
      },
      auditTrail: auditLogs,
    };

    // Log de entrega
    await audit.dataExportDelivered(viewer.id, {
      metadata: {
        sections: Object.keys(exportPayload).length,
        postsCount: posts.length,
        commentsCount: comments.length,
        notificationsCount: notifications.length,
      },
    });

    // Headers de download
    const filename = `cabaladoscaminhos-export-${viewer.id}-${new Date().toISOString().split('T')[0]}.json`;

    const response = NextResponse.json(exportPayload, { status: 200 });
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    // Cache privado — não pode ser cacheado por CDN/proxies
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return response;
  } catch (err) {
    return handleError(err);
  }
}
