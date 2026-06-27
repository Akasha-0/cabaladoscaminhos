// ============================================================================
// NOTIFICATIONS — Helpers para gerar notificações de grupo
// ============================================================================
// Encapsula a criação de notificações no Prisma de forma centralizada,
// com tipos: NEW_POST_FROM_GROUP, GROUP_INVITE, PROMOTED_TO_MOD.
// Erros são logados mas não quebram o fluxo principal (best-effort).
// ============================================================================

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type NotificationType =
  | 'GROUP_INVITE'
  | 'NEW_POST_FROM_GROUP'
  | 'PROMOTED_TO_MOD'
  | 'GROUP_NEW_MEMBER';

export interface CreateNotificationInput {
  userId: string;        // destinatário
  type: NotificationType;
  actorId?: string | null; // quem gerou (opcional)
  groupId?: string;
  postId?: string;
  payload?: Record<string, unknown>;
}

/**
 * Cria uma notificação. Em caso de erro inesperado (ex.: DB fora),
 * loga mas NÃO propaga — notificações não devem quebrar a UX.
 */
export async function createNotification(input: CreateNotificationInput) {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type as Prisma.NotificationCreateInput['type'],
        actorId: input.actorId ?? null,
        groupId: input.groupId ?? null,
        postId: input.postId ?? null,
        payload: (input.payload ?? null) as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[notifications] falha ao criar:', err);
    }
  }
}

/**
 * Quando alguém posta em um grupo, notifica todos os membros do grupo
 * (exceto o autor). Limitado a 100 destinatários para evitar tempestade.
 */
export async function notifyGroupOnNewPost(input: {
  groupId: string;
  postId: string;
  authorId: string;
}) {
  try {
    const members = await prisma.groupMember.findMany({
      where: {
        groupId: input.groupId,
        userId: { not: input.authorId },
      },
      select: { userId: true },
      take: 100,
    });

    if (members.length === 0) return;

    const data = members.map((m) => ({
      userId: m.userId,
      type: 'NEW_POST_FROM_GROUP' as const,
      actorId: input.authorId,
      groupId: input.groupId,
      postId: input.postId,
      payload: { source: 'group_post' } as Prisma.InputJsonValue,
    }));

    await prisma.notification.createMany({ data });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[notifications] notifyGroupOnNewPost falhou:', err);
    }
  }
}

/**
 * Convite para grupo privado: notifica o usuário convidado (se for por userId).
 */
export async function notifyGroupInvite(input: {
  inviteeUserId: string;
  invitedBy: string;
  groupId: string;
  groupName: string;
}) {
  await createNotification({
    userId: input.inviteeUserId,
    type: 'GROUP_INVITE',
    actorId: input.invitedBy,
    groupId: input.groupId,
    payload: { groupName: input.groupName },
  });
}

/**
 * Promoção a moderador/admin.
 */
export async function notifyPromoted(input: {
  userId: string;
  promotedBy: string;
  groupId: string;
  groupName: string;
  newRole: 'MODERATOR' | 'ADMIN';
}) {
  await createNotification({
    userId: input.userId,
    type: 'PROMOTED_TO_MOD',
    actorId: input.promotedBy,
    groupId: input.groupId,
    payload: { groupName: input.groupName, role: input.newRole },
  });
}

/**
 * Novo membro entrou (útil para admins acompanharem crescimento).
 */
export async function notifyGroupNewMember(input: {
  groupId: string;
  newUserId: string;
}) {
  try {
    const admins = await prisma.groupMember.findMany({
      where: {
        groupId: input.groupId,
        role: { in: ['ADMIN', 'MODERATOR'] },
        userId: { not: input.newUserId },
      },
      select: { userId: true },
      take: 20,
    });
    if (admins.length === 0) return;
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.userId,
        type: 'GROUP_NEW_MEMBER' as const,
        actorId: input.newUserId,
        groupId: input.groupId,
      })),
    });
  } catch {
    // best-effort
  }
}
