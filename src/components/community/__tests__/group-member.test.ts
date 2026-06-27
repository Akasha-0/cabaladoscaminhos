// ============================================================================
// GROUP MEMBERSHIP — Tests de comportamento de join/leave/role
// ============================================================================
// Estes testes verificam o comportamento dos helpers de negócio
// (last-admin rule, privacidade, idempotência) — coberto também no
// groups-api.test.ts mas com cenários extras aqui.
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

const groupFindUnique = vi.fn();
const groupCreate = vi.fn();
const groupUpdate = vi.fn();
const memberFindUnique = vi.fn();
const memberFindMany = vi.fn();
const memberCreate = vi.fn();
const memberUpdate = vi.fn();
const memberDelete = vi.fn();
const memberUpsert = vi.fn();
const memberCount = vi.fn();
const transactionFn = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    group: {
      findUnique: (...args: unknown[]) => groupFindUnique(...args),
      create: (...args: unknown[]) => groupCreate(...args),
      update: (...args: unknown[]) => groupUpdate(...args),
      findMany: vi.fn(),
    },
    groupMember: {
      findUnique: (...args: unknown[]) => memberFindUnique(...args),
      findMany: (...args: unknown[]) => memberFindMany(...args),
      create: (...args: unknown[]) => memberCreate(...args),
      update: (...args: unknown[]) => memberUpdate(...args),
      delete: (...args: unknown[]) => memberDelete(...args),
      upsert: (...args: unknown[]) => memberUpsert(...args),
      count: (...args: unknown[]) => memberCount(...args),
    },
    groupInvite: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    notification: { create: vi.fn(), createMany: vi.fn() },
    post: { findMany: vi.fn(), count: vi.fn() },
    $transaction: (...args: unknown[]) => transactionFn(...args),
  },
}));

import {
  joinGroup,
  leaveGroup,
  updateMemberRole,
  removeMember,
  LastAdminError,
  GroupPrivateError,
  GroupNotFoundError,
} from '@/lib/community/groups';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('joinGroup — regras de privacidade', () => {
  it('grupo público: cria membership via upsert + incrementa contador', async () => {
    groupFindUnique.mockResolvedValueOnce({ id: 'g1', isPublic: true });
    transactionFn.mockResolvedValueOnce([{}, {}]);
    await joinGroup({ slug: 'cabala', userId: 'u-novo' });
    expect(transactionFn).toHaveBeenCalled();
  });

  it('grupo privado: lança GroupPrivateError (não cria membership)', async () => {
    groupFindUnique.mockResolvedValueOnce({ id: 'g2', isPublic: false });
    await expect(
      joinGroup({ slug: 'privado', userId: 'u-novo' })
    ).rejects.toBeInstanceOf(GroupPrivateError);
    expect(transactionFn).not.toHaveBeenCalled();
  });

  it('grupo inexistente: lança GroupNotFoundError', async () => {
    groupFindUnique.mockResolvedValueOnce(null);
    await expect(joinGroup({ slug: 'nao-existe', userId: 'u' })).rejects.toBeInstanceOf(
      GroupNotFoundError
    );
  });
});

describe('leaveGroup — last-admin guard', () => {
  it('último ADMIN não pode sair', async () => {
    groupFindUnique.mockResolvedValueOnce({ id: 'g1' });
    memberFindUnique.mockResolvedValueOnce({
      groupId: 'g1',
      userId: 'u1',
      role: 'ADMIN',
      joinedAt: new Date(),
      invitedBy: null,
    });
    memberCount.mockResolvedValueOnce(1); // único admin
    await expect(leaveGroup({ slug: 'g', userId: 'u1' })).rejects.toBeInstanceOf(
      LastAdminError
    );
    expect(memberDelete).not.toHaveBeenCalled();
  });

  it('se há múltiplos admins, ADMIN pode sair', async () => {
    groupFindUnique.mockResolvedValueOnce({ id: 'g1' });
    memberFindUnique.mockResolvedValueOnce({
      groupId: 'g1',
      userId: 'u1',
      role: 'ADMIN',
      joinedAt: new Date(),
      invitedBy: null,
    });
    memberCount.mockResolvedValueOnce(2); // há outro admin
    transactionFn.mockResolvedValueOnce([{}, {}]);
    await leaveGroup({ slug: 'g', userId: 'u1' });
    expect(memberDelete).toHaveBeenCalled();
  });

  it('MODERATOR pode sair sem last-admin guard', async () => {
    groupFindUnique.mockResolvedValueOnce({ id: 'g1' });
    memberFindUnique.mockResolvedValueOnce({
      groupId: 'g1',
      userId: 'u1',
      role: 'MODERATOR',
      joinedAt: new Date(),
      invitedBy: null,
    });
    transactionFn.mockResolvedValueOnce([{}, {}]);
    await leaveGroup({ slug: 'g', userId: 'u1' });
    expect(memberCount).not.toHaveBeenCalled(); // não verifica count
    expect(memberDelete).toHaveBeenCalled();
  });

  it('idempotente: não-membro pode chamar leave sem erro', async () => {
    groupFindUnique.mockResolvedValueOnce({ id: 'g1' });
    memberFindUnique.mockResolvedValueOnce(null);
    await leaveGroup({ slug: 'g', userId: 'u-fora' });
    expect(memberDelete).not.toHaveBeenCalled();
    expect(transactionFn).not.toHaveBeenCalled();
  });
});

describe('updateMemberRole — regras de hierarquia', () => {
  it('ADMIN pode promover MEMBER → MODERATOR', async () => {
    groupFindUnique.mockResolvedValueOnce({
      id: 'g1',
      members: [{ role: 'ADMIN' }],
    });
    memberUpdate.mockResolvedValueOnce({
      groupId: 'g1',
      userId: 'u2',
      role: 'MODERATOR',
      joinedAt: new Date(),
      invitedBy: null,
    });
    const r = await updateMemberRole({
      slug: 'g',
      actorId: 'admin',
      targetUserId: 'u2',
      role: 'MODERATOR',
    });
    expect(r.role).toBe('MODERATOR');
  });

  it('rebaixar último ADMIN para MEMBER é bloqueado', async () => {
    groupFindUnique.mockResolvedValueOnce({
      id: 'g1',
      members: [{ role: 'ADMIN' }],
    });
    memberFindUnique.mockResolvedValueOnce({
      groupId: 'g1',
      userId: 'u2',
      role: 'ADMIN',
      joinedAt: new Date(),
      invitedBy: null,
    });
    memberCount.mockResolvedValueOnce(1);
    await expect(
      updateMemberRole({
        slug: 'g',
        actorId: 'admin',
        targetUserId: 'u2',
        role: 'MEMBER',
      })
    ).rejects.toBeInstanceOf(LastAdminError);
  });

  it('promover MODERATOR → ADMIN é permitido', async () => {
    groupFindUnique.mockResolvedValueOnce({
      id: 'g1',
      members: [{ role: 'ADMIN' }],
    });
    memberUpdate.mockResolvedValueOnce({
      groupId: 'g1',
      userId: 'u2',
      role: 'ADMIN',
      joinedAt: new Date(),
      invitedBy: null,
    });
    const r = await updateMemberRole({
      slug: 'g',
      actorId: 'admin',
      targetUserId: 'u2',
      role: 'ADMIN',
    });
    expect(r.role).toBe('ADMIN');
  });
});

describe('removeMember — last-admin guard', () => {
  it('remover último ADMIN é bloqueado', async () => {
    groupFindUnique.mockResolvedValueOnce({
      id: 'g1',
      members: [{ role: 'ADMIN' }],
    });
    memberFindUnique.mockResolvedValueOnce({
      groupId: 'g1',
      userId: 'u2',
      role: 'ADMIN',
      joinedAt: new Date(),
      invitedBy: null,
    });
    memberCount.mockResolvedValueOnce(1);
    await expect(
      removeMember({ slug: 'g', actorId: 'admin', targetUserId: 'u2' })
    ).rejects.toBeInstanceOf(LastAdminError);
    expect(memberDelete).not.toHaveBeenCalled();
  });

  it('remover MEMBER decrementa contador', async () => {
    groupFindUnique.mockResolvedValueOnce({
      id: 'g1',
      members: [{ role: 'ADMIN' }],
    });
    memberFindUnique.mockResolvedValueOnce({
      groupId: 'g1',
      userId: 'u2',
      role: 'MEMBER',
      joinedAt: new Date(),
      invitedBy: null,
    });
    await removeMember({ slug: 'g', actorId: 'admin', targetUserId: 'u2' });
    expect(memberDelete).toHaveBeenCalled();
    expect(groupUpdate).toHaveBeenCalledWith({
      where: { id: 'g1' },
      data: { membersCount: { decrement: 1 } },
    });
  });
});
