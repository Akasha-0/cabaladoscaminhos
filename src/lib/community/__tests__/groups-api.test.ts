// ============================================================================
// GROUPS API — Tests de comportamento de rotas (com mock do Prisma)
// ============================================================================
// Usa vi.mock para injetar um mock do `@/lib/prisma` antes de importar as
// funções. Testa regras de negócio: privacidade, roles, last-admin, etc.
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock do Prisma — definimos a estrutura antes de importar o módulo sob teste
const groupFindUnique = vi.fn();
const groupFindMany = vi.fn();
const groupCreate = vi.fn();
const groupUpdate = vi.fn();
const groupDelete = vi.fn();
const groupUpsert = vi.fn();
const memberFindUnique = vi.fn();
const memberFindMany = vi.fn();
const memberCreate = vi.fn();
const memberUpdate = vi.fn();
const memberDelete = vi.fn();
const memberUpsert = vi.fn();
const memberCount = vi.fn();
const inviteCreate = vi.fn();
const inviteFindUnique = vi.fn();
const inviteUpdate = vi.fn();
const notificationCreate = vi.fn();
const notificationCreateMany = vi.fn();
const txGroupMember = {
  upsert: vi.fn(),
  create: vi.fn(),
  findUnique: vi.fn(),
};
const txGroup = {
  create: vi.fn(),
  update: vi.fn(),
};
const transactionFn = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    group: {
      findUnique: (...args: unknown[]) => groupFindUnique(...args),
      findMany: (...args: unknown[]) => groupFindMany(...args),
      create: (...args: unknown[]) => groupCreate(...args),
      update: (...args: unknown[]) => groupUpdate(...args),
      delete: (...args: unknown[]) => groupDelete(...args),
      upsert: (...args: unknown[]) => groupUpsert(...args),
      count: vi.fn(),
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
    groupInvite: {
      create: (...args: unknown[]) => inviteCreate(...args),
      findUnique: (...args: unknown[]) => inviteFindUnique(...args),
      update: (...args: unknown[]) => inviteUpdate(...args),
      findMany: vi.fn(),
    },
    notification: {
      create: (...args: unknown[]) => notificationCreate(...args),
      createMany: (...args: unknown[]) => notificationCreateMany(...args),
    },
    post: { findMany: vi.fn(), count: vi.fn() },
    $transaction: (...args: unknown[]) => transactionFn(...args),
  },
}));

// Importa após mock
import {
  listGroups,
  getGroupBySlug,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  listMembers,
  updateMemberRole,
  removeMember,
  createInvite,
  acceptInvite,
  GroupNotFoundError,
  GroupForbiddenError,
  GroupPrivateError,
  LastAdminError,
  InviteNotFoundError,
} from '@/lib/community/groups';

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// LIST GROUPS
// =============================================================================

describe('listGroups', () => {
  it('retorna array vazio quando não há grupos', async () => {
    groupFindMany.mockResolvedValueOnce([]);
    const result = await listGroups();
    expect(result).toEqual([]);
    expect(groupFindMany).toHaveBeenCalled();
  });

  it('filtra por mineOnly usando viewerId', async () => {
    groupFindMany.mockResolvedValueOnce([]);
    await listGroups({ mineOnly: true, viewerId: 'user-1' });
    const args = groupFindMany.mock.calls[0]?.[0];
    expect(args?.where?.members).toEqual({ some: { userId: 'user-1' } });
  });

  it('filtra por search', async () => {
    groupFindMany.mockResolvedValueOnce([]);
    await listGroups({ search: 'cabala' });
    const args = groupFindMany.mock.calls[0]?.[0];
    expect(args?.where?.OR).toBeDefined();
    expect(args.where.OR[0]).toMatchObject({ name: { contains: 'cabala' } });
  });

  it('filtra por tradição', async () => {
    groupFindMany.mockResolvedValueOnce([]);
    await listGroups({ tradition: 'ifa' });
    const args = groupFindMany.mock.calls[0]?.[0];
    expect(args?.where?.tradition).toBe('ifa');
  });
});

// =============================================================================
// GET GROUP BY SLUG
// =============================================================================

describe('getGroupBySlug', () => {
  it('retorna null quando não existe', async () => {
    groupFindUnique.mockResolvedValueOnce(null);
    const r = await getGroupBySlug('nao-existe');
    expect(r).toBeNull();
  });

  it('retorna DTO com viewerRole correto para ADMIN', async () => {
    groupFindUnique.mockResolvedValueOnce({
      id: 'g1',
      slug: 'cabala',
      name: 'Cabala',
      description: 'desc',
      longDescription: null,
      rules: [],
      iconUrl: null,
      bannerUrl: null,
      tradition: 'cabala',
      isPublic: true,
      requireApproval: false,
      createdBy: 'u1',
      membersCount: 5,
      postsCount: 12,
      createdAt: new Date('2026-06-01'),
      updatedAt: new Date('2026-06-01'),
      members: [{ role: 'ADMIN' }],
    });
    const r = await getGroupBySlug('cabala', 'u1');
    expect(r).not.toBeNull();
    expect(r?.viewerRole).toBe('ADMIN');
    expect(r?.isMember).toBe(true);
    expect(r?.membersCount).toBe(5);
  });

  it('retorna viewerRole null quando usuário não é membro', async () => {
    groupFindUnique.mockResolvedValueOnce({
      id: 'g1',
      slug: 'cabala',
      name: 'Cabala',
      description: 'desc',
      longDescription: null,
      rules: [],
      iconUrl: null,
      bannerUrl: null,
      tradition: 'cabala',
      isPublic: true,
      requireApproval: false,
      createdBy: 'u1',
      membersCount: 5,
      postsCount: 12,
      createdAt: new Date('2026-06-01'),
      updatedAt: new Date('2026-06-01'),
      members: [],
    });
    const r = await getGroupBySlug('cabala', 'u-novo');
    expect(r?.viewerRole).toBeNull();
    expect(r?.isMember).toBe(false);
  });
});

// =============================================================================
// CREATE GROUP — criador vira ADMIN
// =============================================================================

describe('createGroup', () => {
  it('cria grupo com criador como ADMIN (transação)', async () => {
    const txGroupCreated = {
      id: 'g-new',
      slug: 'novo-grupo',
      name: 'Novo Grupo',
      description: 'Descricao valida com mais de 10 caracteres',
      longDescription: null,
      rules: [],
      iconUrl: null,
      bannerUrl: null,
      tradition: 'cabala',
      isPublic: true,
      requireApproval: false,
      createdBy: 'u1',
      membersCount: 1,
      postsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    transactionFn.mockImplementationOnce(async (cb: (tx: unknown) => Promise<unknown>) => {
      // Simula o callback da transação retornando o grupo
      return cb({
        group: {
          create: (...args: unknown[]) => {
            txGroup.create.mockImplementationOnce(() => txGroupCreated);
            return txGroup.create(...args);
          },
        },
        groupMember: {
          create: (...args: unknown[]) => txGroupMember.create(...args),
        },
      });
    });

    // Recarrega após transação
    groupFindUnique.mockResolvedValueOnce({
      ...txGroupCreated,
      members: [{ role: 'ADMIN' }],
    });

    const r = await createGroup({
      slug: 'novo-grupo',
      name: 'Novo Grupo',
      description: 'Descricao valida com mais de 10 caracteres',
      rules: [],
      tradition: 'cabala',
      createdBy: 'u1',
    });

    expect(r.slug).toBe('novo-grupo');
    expect(r.viewerRole).toBe('ADMIN');
    expect(r.isMember).toBe(true);
    expect(txGroupMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'u1', role: 'ADMIN' }),
      })
    );
  });
});

// =============================================================================
// JOIN / LEAVE — regras de privacidade e last-admin
// =============================================================================

describe('joinGroup', () => {
  it('rejeita grupo privado com GroupPrivateError', async () => {
    groupFindUnique.mockResolvedValueOnce({
      id: 'g1',
      isPublic: false,
    });
    await expect(joinGroup({ slug: 'privado', userId: 'u1' })).rejects.toThrow(
      GroupPrivateError
    );
  });

  it('rejeita grupo inexistente', async () => {
    groupFindUnique.mockResolvedValueOnce(null);
    await expect(joinGroup({ slug: 'nao-existe', userId: 'u1' })).rejects.toThrow(
      GroupNotFoundError
    );
  });

  it('permite join em grupo público (transação)', async () => {
    groupFindUnique.mockResolvedValueOnce({ id: 'g1', isPublic: true });
    transactionFn.mockResolvedValueOnce([{}, {}]);

    const r = await joinGroup({ slug: 'cabala', userId: 'u1' });
    expect(r.role).toBe('MEMBER');
    expect(transactionFn).toHaveBeenCalled();
  });
});

describe('leaveGroup', () => {
  it('idempotente: sai silenciosamente se não é membro', async () => {
    groupFindUnique.mockResolvedValueOnce({ id: 'g1' });
    memberFindUnique.mockResolvedValueOnce(null);
    await leaveGroup({ slug: 'g', userId: 'u1' });
    expect(memberDelete).not.toHaveBeenCalled();
  });

  it('rejeita quando último ADMIN tenta sair', async () => {
    groupFindUnique.mockResolvedValueOnce({ id: 'g1' });
    memberFindUnique.mockResolvedValueOnce({
      groupId: 'g1',
      userId: 'u1',
      role: 'ADMIN',
      joinedAt: new Date(),
      invitedBy: null,
    });
    memberCount.mockResolvedValueOnce(1);
    await expect(leaveGroup({ slug: 'g', userId: 'u1' })).rejects.toThrow(LastAdminError);
  });

  it('permite sair para MEMBER', async () => {
    groupFindUnique.mockResolvedValueOnce({ id: 'g1' });
    memberFindUnique.mockResolvedValueOnce({
      groupId: 'g1',
      userId: 'u1',
      role: 'MEMBER',
      joinedAt: new Date(),
      invitedBy: null,
    });
    transactionFn.mockResolvedValueOnce([{}, {}]);
    await leaveGroup({ slug: 'g', userId: 'u1' });
    expect(transactionFn).toHaveBeenCalled();
  });

  it('permite ADMIN sair se houver outros admins', async () => {
    groupFindUnique.mockResolvedValueOnce({ id: 'g1' });
    memberFindUnique.mockResolvedValueOnce({
      groupId: 'g1',
      userId: 'u1',
      role: 'ADMIN',
      joinedAt: new Date(),
      invitedBy: null,
    });
    memberCount.mockResolvedValueOnce(2);
    transactionFn.mockResolvedValueOnce([{}, {}]);
    await leaveGroup({ slug: 'g', userId: 'u1' });
    expect(transactionFn).toHaveBeenCalled();
  });
});

// =============================================================================
// UPDATE / DELETE — somente ADMIN/MODERATOR
// =============================================================================

describe('updateGroup', () => {
  it('rejeita com GroupForbiddenError quando usuário não é admin/mod', async () => {
    groupFindUnique.mockResolvedValueOnce({
      id: 'g1',
      members: [{ role: 'MEMBER' }],
    });
    await expect(
      updateGroup({ slug: 'g', actorId: 'u1', data: { name: 'X' } })
    ).rejects.toThrow(GroupForbiddenError);
  });

  it('permite ADMIN atualizar nome', async () => {
    groupFindUnique
      .mockResolvedValueOnce({
        id: 'g1',
        members: [{ role: 'ADMIN' }],
      })
      .mockResolvedValueOnce({
        id: 'g1',
        slug: 'g',
        name: 'Novo Nome',
        description: 'Descricao valida',
        longDescription: null,
        rules: [],
        iconUrl: null,
        bannerUrl: null,
        tradition: 'cabala',
        isPublic: true,
        requireApproval: false,
        createdBy: 'u1',
        membersCount: 5,
        postsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [{ role: 'ADMIN' }],
      });
    groupUpdate.mockResolvedValueOnce({});
    const r = await updateGroup({
      slug: 'g',
      actorId: 'u1',
      data: { name: 'Novo Nome' },
    });
    expect(r.name).toBe('Novo Nome');
    expect(groupUpdate).toHaveBeenCalled();
  });

  it('permite MODERATOR atualizar', async () => {
    groupFindUnique
      .mockResolvedValueOnce({ id: 'g1', members: [{ role: 'MODERATOR' }] })
      .mockResolvedValueOnce({
        id: 'g1',
        slug: 'g',
        name: 'Atualizado',
        description: 'Descricao valida',
        longDescription: null,
        rules: [],
        iconUrl: null,
        bannerUrl: null,
        tradition: 'cabala',
        isPublic: true,
        requireApproval: false,
        createdBy: 'u1',
        membersCount: 5,
        postsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [{ role: 'MODERATOR' }],
      });
    groupUpdate.mockResolvedValueOnce({});
    await updateGroup({ slug: 'g', actorId: 'u1', data: { name: 'Atualizado' } });
    expect(groupUpdate).toHaveBeenCalled();
  });
});

describe('deleteGroup', () => {
  it('rejeita se não for ADMIN/MODERATOR', async () => {
    groupFindUnique.mockResolvedValueOnce({
      id: 'g1',
      members: [{ role: 'MEMBER' }],
    });
    await expect(deleteGroup({ slug: 'g', actorId: 'u1' })).rejects.toThrow(
      GroupForbiddenError
    );
  });

  it('permite ADMIN deletar', async () => {
    groupFindUnique.mockResolvedValueOnce({
      id: 'g1',
      members: [{ role: 'ADMIN' }],
    });
    groupDelete.mockResolvedValueOnce({});
    await deleteGroup({ slug: 'g', actorId: 'u1' });
    expect(groupDelete).toHaveBeenCalledWith({ where: { slug: 'g' } });
  });
});

// =============================================================================
// LIST MEMBERS
// =============================================================================

describe('listMembers', () => {
  it('retorna DTOs com displayName heurístico', async () => {
    groupFindUnique.mockResolvedValueOnce({ id: 'g1' });
    memberFindMany.mockResolvedValueOnce([
      {
        groupId: 'g1',
        userId: 'seed-author-1',
        role: 'ADMIN',
        joinedAt: new Date('2026-06-01'),
        invitedBy: null,
      },
      {
        groupId: 'g1',
        userId: 'real-user-id',
        role: 'MEMBER',
        joinedAt: new Date('2026-06-02'),
        invitedBy: 'u1',
      },
    ]);
    const r = await listMembers({ slug: 'g' });
    expect(r).toHaveLength(2);
    expect(r[0]?.role).toBe('ADMIN');
    expect(r[0]?.displayName).toMatch(/Membro/);
  });

  it('lança GroupNotFoundError se grupo não existe', async () => {
    groupFindUnique.mockResolvedValueOnce(null);
    await expect(listMembers({ slug: 'g' })).rejects.toThrow(GroupNotFoundError);
  });
});

// =============================================================================
// UPDATE MEMBER ROLE
// =============================================================================

describe('updateMemberRole', () => {
  it('rejeita se ator não é admin/mod', async () => {
    groupFindUnique.mockResolvedValueOnce({
      id: 'g1',
      members: [{ role: 'MEMBER' }],
    });
    await expect(
      updateMemberRole({ slug: 'g', actorId: 'u1', targetUserId: 'u2', role: 'MODERATOR' })
    ).rejects.toThrow(GroupForbiddenError);
  });

  it('rejeita rebaixar último ADMIN', async () => {
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
      updateMemberRole({ slug: 'g', actorId: 'u1', targetUserId: 'u2', role: 'MEMBER' })
    ).rejects.toThrow(LastAdminError);
  });

  it('promove MEMBER → MODERATOR com sucesso', async () => {
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
      actorId: 'u1',
      targetUserId: 'u2',
      role: 'MODERATOR',
    });
    expect(r.role).toBe('MODERATOR');
    expect(memberUpdate).toHaveBeenCalled();
  });
});

describe('removeMember', () => {
  it('rejeita remover último ADMIN', async () => {
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
      removeMember({ slug: 'g', actorId: 'u1', targetUserId: 'u2' })
    ).rejects.toThrow(LastAdminError);
  });

  it('permite remover MEMBER', async () => {
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
    await removeMember({ slug: 'g', actorId: 'u1', targetUserId: 'u2' });
    expect(memberDelete).toHaveBeenCalled();
    expect(groupUpdate).toHaveBeenCalledWith({
      where: { id: 'g1' },
      data: { membersCount: { decrement: 1 } },
    });
  });
});

// =============================================================================
// INVITES
// =============================================================================

describe('createInvite', () => {
  it('cria invite com token e expiração', async () => {
    groupFindUnique
      .mockResolvedValueOnce({
        id: 'g1',
        members: [{ role: 'ADMIN' }],
      })
      .mockResolvedValueOnce({ slug: 'g', name: 'Grupo' });
    inviteCreate.mockResolvedValueOnce({
      id: 'inv-1',
      token: 'abcdef123456',
      groupId: 'g1',
      invitedBy: 'u1',
      inviteeUserId: 'u-target',
      inviteeEmail: null,
      status: 'PENDING',
      expiresAt: new Date('2026-07-01'),
      createdAt: new Date(),
    });
    const r = await createInvite({
      slug: 'g',
      invitedBy: 'u1',
      inviteeUserId: 'u-target',
    });
    expect(r.token).toBe('abcdef123456');
    expect(r.status).toBe('PENDING');
    expect(r.groupSlug).toBe('g');
  });

  it('rejeita se ator não é admin/mod', async () => {
    groupFindUnique.mockResolvedValueOnce({
      id: 'g1',
      members: [{ role: 'MEMBER' }],
    });
    await expect(
      createInvite({ slug: 'g', invitedBy: 'u1', inviteeUserId: 'u2' })
    ).rejects.toThrow(GroupForbiddenError);
  });
});

describe('acceptInvite', () => {
  it('lança InviteNotFoundError se token não existe', async () => {
    inviteFindUnique.mockResolvedValueOnce(null);
    await expect(acceptInvite({ token: 'invalido', userId: 'u1' })).rejects.toThrow(
      InviteNotFoundError
    );
  });

  it('rejeita token vinculado a outro usuário', async () => {
    inviteFindUnique.mockResolvedValueOnce({
      id: 'inv-1',
      token: 'tok',
      groupId: 'g1',
      invitedBy: 'u-admin',
      inviteeUserId: 'u-outro',
      inviteeEmail: null,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      createdAt: new Date(),
      group: { id: 'g1', slug: 'g', isPublic: false },
    });
    await expect(
      acceptInvite({ token: 'tok', userId: 'u1' })
    ).rejects.toThrow(/destinado a outro/);
  });

  it('rejeita convite expirado', async () => {
    inviteFindUnique.mockResolvedValueOnce({
      id: 'inv-1',
      token: 'tok',
      groupId: 'g1',
      invitedBy: 'u-admin',
      inviteeUserId: null,
      inviteeEmail: null,
      status: 'PENDING',
      expiresAt: new Date(Date.now() - 1000), // expirado
      createdAt: new Date(),
      group: { id: 'g1', slug: 'g', isPublic: false },
    });
    await expect(
      acceptInvite({ token: 'tok', userId: 'u1' })
    ).rejects.toThrow(/expirado/);
  });

  it('aceita convite válido e cria membership', async () => {
    inviteFindUnique.mockResolvedValueOnce({
      id: 'inv-1',
      token: 'tok',
      groupId: 'g1',
      invitedBy: 'u-admin',
      inviteeUserId: 'u1',
      inviteeEmail: null,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      createdAt: new Date(),
      group: { id: 'g1', slug: 'g', isPublic: false },
    });
    transactionFn.mockResolvedValueOnce([{}, {}, {}]);
    const r = await acceptInvite({ token: 'tok', userId: 'u1' });
    expect(r.groupSlug).toBe('g');
    expect(r.role).toBe('MEMBER');
  });
});
