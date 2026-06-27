// ============================================================================
// COMMUNITY GROUPS — Backend helpers (Prisma → API DTO mapping, queries)
// ============================================================================
// Funções que ficam entre os route handlers e o Prisma.
// Centralizam: queries, transformações, mutações (join/leave/role), invites.
// ============================================================================

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// ============================================================================
// DTOs (o que vai pra API / UI)
// ============================================================================

export type GroupDto = {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string | null;
  rules: string[];
  iconUrl: string | null;
  bannerUrl: string | null;
  tradition: string;
  isPublic: boolean;
  requireApproval: boolean;
  createdBy: string | null;
  membersCount: number;
  postsCount: number;
  // Quando viewerId é informado, marca se o usuário é membro/admin/moderador
  viewerRole: 'ADMIN' | 'MODERATOR' | 'MEMBER' | null;
  isMember: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GroupMemberDto = {
  userId: string;
  displayName: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: string;
  invitedBy: string | null;
};

export type GroupInviteDto = {
  id: string;
  token: string;
  groupId: string;
  groupSlug: string;
  groupName: string;
  invitedBy: string;
  inviteeUserId: string | null;
  inviteeEmail: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REVOKED';
  expiresAt: string;
  createdAt: string;
};

// ============================================================================
// DTO mapping
// ============================================================================

type GroupWithViewer = Prisma.GroupGetPayload<{
  include: {
    members: { where: { userId: string }; select: { role: true } };
  };
}>;

type GroupWithMembers = Prisma.GroupGetPayload<{
  include: {
    members: true;
  };
}>;

function groupToDto(
  group: GroupWithViewer,
  fallbackRole: GroupDto['viewerRole'] = null
): GroupDto {
  const memberRow = group.members?.[0] ?? null;
  const role = memberRow?.role ?? fallbackRole;
  return {
    id: group.id,
    slug: group.slug,
    name: group.name,
    description: group.description,
    longDescription: group.longDescription ?? null,
    rules: group.rules ?? [],
    iconUrl: group.iconUrl ?? null,
    bannerUrl: group.bannerUrl ?? null,
    tradition: group.tradition,
    isPublic: group.isPublic,
    requireApproval: group.requireApproval,
    createdBy: group.createdBy ?? null,
    membersCount: group.membersCount,
    postsCount: group.postsCount,
    viewerRole: role,
    isMember: role !== null,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  };
}

function memberToDto(m: Prisma.GroupMemberGetPayload<{}>): GroupMemberDto {
  return {
    userId: m.userId,
    displayName: extractDisplayName(m.userId),
    role: m.role,
    joinedAt: m.joinedAt.toISOString(),
    invitedBy: m.invitedBy ?? null,
  };
}

/**
 * Heurística determinística de display name a partir do userId.
 * No MVP, os profiles espirituais têm `birthName` mas não temos garantia
 * de fetch eager aqui. Em produção, trocar por join com SpiritualProfile.
 */
function extractDisplayName(userId: string): string {
  if (!userId) return 'Anônimo';
  if (userId.startsWith('seed-')) {
    return `Membro ${userId.slice(-6).toUpperCase()}`;
  }
  return `Membro ${userId.slice(-4)}`;
}

// ============================================================================
// LIST GROUPS
// ============================================================================

export interface ListGroupsOptions {
  tradition?: string | null;
  search?: string | null;
  isPublic?: boolean | null;
  /** Quando true, filtra grupos onde o viewer é membro. */
  mineOnly?: boolean;
  viewerId?: string | null;
  limit?: number;
}

export async function listGroups(
  opts: ListGroupsOptions = {}
): Promise<GroupDto[]> {
  const where: Prisma.GroupWhereInput = {};
  if (opts.tradition) where.tradition = opts.tradition;
  if (opts.isPublic !== undefined && opts.isPublic !== null) {
    where.isPublic = opts.isPublic;
  }
  if (opts.search) {
    where.OR = [
      { name: { contains: opts.search, mode: 'insensitive' } },
      { description: { contains: opts.search, mode: 'insensitive' } },
      { tradition: { contains: opts.search, mode: 'insensitive' } },
    ];
  }
  if (opts.mineOnly && opts.viewerId) {
    where.members = { some: { userId: opts.viewerId } };
  }

  const rows = await prisma.group.findMany({
    where,
    include: opts.viewerId
      ? { members: { where: { userId: opts.viewerId }, select: { role: true } } }
      : { members: { where: { userId: '__none__' }, select: { role: true } } },
    orderBy: [{ membersCount: 'desc' }, { name: 'asc' }],
    take: opts.limit ?? 30,
  });

  return rows.map((g) => groupToDto(g));
}

// ============================================================================
// GET GROUP BY SLUG
// ============================================================================

export async function getGroupBySlug(
  slug: string,
  viewerId?: string | null
): Promise<GroupDto | null> {
  const row = await prisma.group.findUnique({
    where: { slug },
    include: viewerId
      ? { members: { where: { userId: viewerId }, select: { role: true } } }
      : { members: { where: { userId: '__none__' }, select: { role: true } } },
  });
  if (!row) return null;
  return groupToDto(row);
}

// ============================================================================
// CREATE GROUP — criador vira ADMIN automaticamente
// ============================================================================

export async function createGroup(input: {
  slug: string;
  name: string;
  description: string;
  longDescription?: string | null;
  rules?: string[];
  iconUrl?: string | null;
  bannerUrl?: string | null;
  tradition: string;
  isPublic?: boolean;
  requireApproval?: boolean;
  createdBy: string;
}): Promise<GroupDto> {
  const created = await prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description,
        longDescription: input.longDescription ?? null,
        rules: input.rules ?? [],
        iconUrl: input.iconUrl ?? null,
        bannerUrl: input.bannerUrl ?? null,
        tradition: input.tradition,
        isPublic: input.isPublic ?? true,
        requireApproval: input.requireApproval ?? false,
        createdBy: input.createdBy,
        membersCount: 1, // criador conta como membro
      },
    });

    await tx.groupMember.create({
      data: {
        groupId: group.id,
        userId: input.createdBy,
        role: 'ADMIN',
        invitedBy: input.createdBy,
      },
    });

    return group;
  });

  // Recarrega com include de viewer para DTO coerente
  const fresh = await prisma.group.findUnique({
    where: { id: created.id },
    include: {
      members: { where: { userId: input.createdBy }, select: { role: true } },
    },
  });
  if (!fresh) throw new Error('Falha ao recarregar grupo criado');
  return groupToDto(fresh);
}

// ============================================================================
// UPDATE GROUP (PATCH)
// ============================================================================

export async function updateGroup(input: {
  slug: string;
  actorId: string;
  data: {
    name?: string;
    description?: string;
    longDescription?: string | null;
    rules?: string[];
    iconUrl?: string | null;
    bannerUrl?: string | null;
    tradition?: string;
    isPublic?: boolean;
    requireApproval?: boolean;
  };
}): Promise<GroupDto> {
  await assertCanManageGroup(input.slug, input.actorId);

  const updated = await prisma.group.update({
    where: { slug: input.slug },
    data: input.data,
  });

  const fresh = await prisma.group.findUnique({
    where: { id: updated.id },
    include: {
      members: { where: { userId: input.actorId }, select: { role: true } },
    },
  });
  if (!fresh) throw new GroupNotFoundError();
  return groupToDto(fresh);
}

// ============================================================================
// DELETE GROUP (somente ADMIN pode)
// ============================================================================

export async function deleteGroup(input: { slug: string; actorId: string }) {
  await assertCanManageGroup(input.slug, input.actorId);

  await prisma.group.delete({ where: { slug: input.slug } });
}

// ============================================================================
// JOIN / LEAVE
// ============================================================================

export async function joinGroup(input: {
  slug: string;
  userId: string;
}): Promise<{ role: 'MEMBER' }> {
  const group = await prisma.group.findUnique({
    where: { slug: input.slug },
    select: { id: true, isPublic: true },
  });
  if (!group) throw new GroupNotFoundError();

  // Privacidade: grupo privado exige invite (route trata isso).
  // Aqui só bloqueamos quando explicitamente privado.
  if (!group.isPublic) {
    throw new GroupPrivateError();
  }

  await prisma.$transaction([
    prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: input.userId } },
      update: {}, // idempotente: já é membro
      create: {
        groupId: group.id,
        userId: input.userId,
        role: 'MEMBER',
      },
    }),
    prisma.group.update({
      where: { id: group.id },
      data: { membersCount: { increment: 1 } },
    }),
  ]);

  return { role: 'MEMBER' };
}

export async function leaveGroup(input: { slug: string; userId: string }) {
  const group = await prisma.group.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  });
  if (!group) throw new GroupNotFoundError();

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: input.userId } },
  });
  if (!existing) return; // idempotente

  // Não permitir que o último ADMIN saia sem promover alguém
  if (existing.role === 'ADMIN') {
    const adminCount = await prisma.groupMember.count({
      where: { groupId: group.id, role: 'ADMIN' },
    });
    if (adminCount <= 1) {
      throw new LastAdminError();
    }
  }

  await prisma.$transaction([
    prisma.groupMember.delete({
      where: {
        groupId_userId: { groupId: group.id, userId: input.userId },
      },
    }),
    prisma.group.update({
      where: { id: group.id },
      data: { membersCount: { decrement: 1 } },
    }),
  ]);
}

// ============================================================================
// LIST MEMBERS
// ============================================================================

export interface ListMembersOptions {
  slug: string;
  limit?: number;
  role?: 'ADMIN' | 'MODERATOR' | 'MEMBER';
}

export async function listMembers(
  opts: ListMembersOptions
): Promise<GroupMemberDto[]> {
  const group = await prisma.group.findUnique({
    where: { slug: opts.slug },
    select: { id: true },
  });
  if (!group) throw new GroupNotFoundError();

  const rows = await prisma.groupMember.findMany({
    where: {
      groupId: group.id,
      ...(opts.role ? { role: opts.role } : {}),
    },
    orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    take: opts.limit ?? 100,
  });

  return rows.map(memberToDto);
}

// ============================================================================
// UPDATE MEMBER ROLE (promote/demote) — somente ADMIN pode
// ============================================================================

export async function updateMemberRole(input: {
  slug: string;
  actorId: string;
  targetUserId: string;
  role: 'MEMBER' | 'MODERATOR' | 'ADMIN';
}): Promise<GroupMemberDto> {
  await assertCanManageGroup(input.slug, input.actorId);

  const group = await prisma.group.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  });
  if (!group) throw new GroupNotFoundError();

  // Não permitir rebaixar o último ADMIN
  if (input.role !== 'ADMIN') {
    const target = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId: group.id, userId: input.targetUserId },
      },
    });
    if (target?.role === 'ADMIN') {
      const adminCount = await prisma.groupMember.count({
        where: { groupId: group.id, role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        throw new LastAdminError();
      }
    }
  }

  const updated = await prisma.groupMember.update({
    where: {
      groupId_userId: { groupId: group.id, userId: input.targetUserId },
    },
    data: { role: input.role },
  });
  return memberToDto(updated);
}

export async function removeMember(input: {
  slug: string;
  actorId: string;
  targetUserId: string;
}) {
  await assertCanManageGroup(input.slug, input.actorId);

  const group = await prisma.group.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  });
  if (!group) throw new GroupNotFoundError();

  // Não permitir remover o último ADMIN
  const target = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: { groupId: group.id, userId: input.targetUserId },
    },
  });
  if (target?.role === 'ADMIN') {
    const adminCount = await prisma.groupMember.count({
      where: { groupId: group.id, role: 'ADMIN' },
    });
    if (adminCount <= 1) {
      throw new LastAdminError();
    }
  }

  await prisma.groupMember.delete({
    where: {
      groupId_userId: { groupId: group.id, userId: input.targetUserId },
    },
  });
  await prisma.group.update({
    where: { id: group.id },
    data: { membersCount: { decrement: 1 } },
  });
}

// ============================================================================
// INVITES — para grupos privados
// ============================================================================

function generateInviteToken(): string {
  // 24 chars base64url ≈ 144 bits de entropia, suficiente p/ MVP
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2)
  ).slice(0, 32);
}

export async function createInvite(input: {
  slug: string;
  invitedBy: string;
  inviteeUserId?: string | null;
  inviteeEmail?: string | null;
  expiresInDays?: number;
}): Promise<GroupInviteDto> {
  await assertCanManageGroup(input.slug, input.invitedBy);

  const group = await prisma.group.findUnique({
    where: { slug: input.slug },
    select: { id: true, slug: true, name: true },
  });
  if (!group) throw new GroupNotFoundError();

  const expiresAt = new Date(
    Date.now() + (input.expiresInDays ?? 7) * 24 * 60 * 60 * 1000
  );

  const invite = await prisma.groupInvite.create({
    data: {
      groupId: group.id,
      token: generateInviteToken(),
      invitedBy: input.invitedBy,
      inviteeUserId: input.inviteeUserId ?? null,
      inviteeEmail: input.inviteeEmail ?? null,
      expiresAt,
      status: 'PENDING',
    },
  });

  return inviteToDto(invite, group.slug, group.name);
}

export async function acceptInvite(input: {
  token: string;
  userId: string;
}): Promise<{ groupSlug: string; role: 'MEMBER' }> {
  const invite = await prisma.groupInvite.findUnique({
    where: { token: input.token },
    include: { group: { select: { id: true, slug: true, isPublic: true } } },
  });
  if (!invite) throw new InviteNotFoundError();
  if (invite.status !== 'PENDING') {
    throw new InviteInvalidError('Convite já utilizado');
  }
  if (invite.expiresAt < new Date()) {
    throw new InviteInvalidError('Convite expirado');
  }
  // Se inviteeUserId foi fixado, só esse user pode aceitar
  if (invite.inviteeUserId && invite.inviteeUserId !== input.userId) {
    throw new InviteInvalidError('Convite destinado a outro usuário');
  }

  await prisma.$transaction([
    prisma.groupMember.upsert({
      where: {
        groupId_userId: { groupId: invite.groupId, userId: input.userId },
      },
      update: {},
      create: {
        groupId: invite.groupId,
        userId: input.userId,
        role: 'MEMBER',
        invitedBy: invite.invitedBy,
      },
    }),
    prisma.groupInvite.update({
      where: { id: invite.id },
      data: {
        status: 'ACCEPTED',
        acceptedBy: input.userId,
        acceptedAt: new Date(),
      },
    }),
    prisma.group.update({
      where: { id: invite.groupId },
      data: { membersCount: { increment: 1 } },
    }),
  ]);

  return { groupSlug: invite.group.slug, role: 'MEMBER' };
}

function inviteToDto(
  i: Prisma.GroupInviteGetPayload<{}>,
  groupSlug: string,
  groupName: string
): GroupInviteDto {
  return {
    id: i.id,
    token: i.token,
    groupId: i.groupId,
    groupSlug,
    groupName,
    invitedBy: i.invitedBy,
    inviteeUserId: i.inviteeUserId,
    inviteeEmail: i.inviteeEmail,
    status: i.status,
    expiresAt: i.expiresAt.toISOString(),
    createdAt: i.createdAt.toISOString(),
  };
}

// ============================================================================
// HELPERS internos
// ============================================================================

async function assertCanManageGroup(slug: string, userId: string) {
  const group = await prisma.group.findUnique({
    where: { slug },
    select: {
      id: true,
      members: {
        where: { userId },
        select: { role: true },
      },
    },
  });
  if (!group) throw new GroupNotFoundError();
  const role = group.members[0]?.role;
  if (role !== 'ADMIN' && role !== 'MODERATOR') {
    throw new GroupForbiddenError(
      'Você precisa ser ADMIN ou MODERATOR para gerenciar este grupo'
    );
  }
}

// ============================================================================
// POSTS — lista posts de um grupo
// ============================================================================

export async function listGroupPosts(input: {
  slug: string;
  viewerId?: string | null;
  cursor?: string | null;
  limit?: number;
}): Promise<{
  groupSlug: string;
  groupName: string;
  posts: Array<{
    id: string;
    authorId: string;
    content: string;
    createdAt: string;
    likesCount: number;
    commentsCount: number;
  }>;
  nextCursor: string | null;
}> {
  const group = await prisma.group.findUnique({
    where: { slug: input.slug },
    select: { id: true, slug: true, name: true, isPublic: true },
  });
  if (!group) throw new GroupNotFoundError();
  // Grupo privado exige membership para ver posts (mesmo listados por URL)
  if (!group.isPublic && input.viewerId) {
    const isMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId: group.id, userId: input.viewerId },
      },
      select: { userId: true },
    });
    if (!isMember) throw new GroupForbiddenError('Grupo privado');
  }

  const limit = input.limit ?? 20;
  const where: Prisma.PostWhereInput = {
    groupId: group.id,
    deletedAt: null,
  };
  if (input.cursor) {
    const decoded = decodeCursor(input.cursor);
    if (decoded) {
      where.OR = [
        { createdAt: { lt: decoded.createdAt } },
        {
          AND: [{ createdAt: decoded.createdAt }, { id: { lt: decoded.id } }],
        },
      ];
    }
  }

  const rows = await prisma.post.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    select: {
      id: true,
      authorId: true,
      content: true,
      createdAt: true,
      likesCount: true,
      commentsCount: true,
    },
  });

  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore
    ? encodeCursor({
        createdAt: slice[slice.length - 1]!.createdAt,
        id: slice[slice.length - 1]!.id,
      })
    : null;

  return {
    groupSlug: group.slug,
    groupName: group.name,
    posts: slice.map((p) => ({
      id: p.id,
      authorId: p.authorId,
      content: p.content,
      createdAt: p.createdAt.toISOString(),
      likesCount: p.likesCount,
      commentsCount: p.commentsCount,
    })),
    nextCursor,
  };
}

// ============================================================================
// Cursor helpers (reuso dos de posts.ts seria ideal; copiamos para autonomia)
// ============================================================================

interface Cursor {
  createdAt: Date;
  id: string;
}

function encodeCursor(cursor: Cursor): string {
  return Buffer.from(
    JSON.stringify({ t: cursor.createdAt.toISOString(), i: cursor.id })
  ).toString('base64url');
}

function decodeCursor(raw: string): Cursor | null {
  try {
    const json = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (!json || typeof json.t !== 'string' || typeof json.i !== 'string') {
      return null;
    }
    return { createdAt: new Date(json.t), id: json.i };
  } catch {
    return null;
  }
}

// ============================================================================
// Errors
// ============================================================================

export class GroupNotFoundError extends Error {
  constructor() {
    super('Grupo não encontrado');
    this.name = 'GroupNotFoundError';
  }
}

export class GroupForbiddenError extends Error {
  constructor(msg = 'Acesso negado ao grupo') {
    super(msg);
    this.name = 'GroupForbiddenError';
  }
}

export class GroupPrivateError extends Error {
  constructor() {
    super('Grupo privado — convite necessário');
    this.name = 'GroupPrivateError';
  }
}

export class LastAdminError extends Error {
  constructor() {
    super(
      'Não é possível remover/rebaixar o último ADMIN do grupo. Promova outro ADMIN primeiro.'
    );
    this.name = 'LastAdminError';
  }
}

export class InviteNotFoundError extends Error {
  constructor() {
    super('Convite não encontrado');
    this.name = 'InviteNotFoundError';
  }
}

export class InviteInvalidError extends Error {
  constructor(msg = 'Convite inválido') {
    super(msg);
    this.name = 'InviteInvalidError';
  }
}

// ============================================================================
// INTERNAL — re-exported para uso em testes
// ============================================================================

export const __internal = {
  memberToDto,
  groupToDto,
  generateInviteToken,
  encodeCursor,
  decodeCursor,
};

export type { GroupWithViewer, GroupWithMembers };
