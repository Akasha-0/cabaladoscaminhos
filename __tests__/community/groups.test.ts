// ============================================================================
// COMMUNITY GROUPS — Testes diretos da lib (sem passar por rotas HTTP)
// ============================================================================
// Foco: regras de negócio que vivem em `src/lib/community/groups.ts`:
//   - createGroup com nome válido (criador vira ADMIN)
//   - createGroup rejeita payload inválido (sem nome)
//   - listGroups filtra por tradição corretamente
//   - listGroupPosts em grupo PRIVADO bloqueia não-membros
//
// Mock strategy: Prisma mockado por spy. Mesmo padrão de
// src/lib/community/__tests__/groups-api.test.ts.
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================================================
// Prisma mock
// ============================================================================

const groupFindUnique = vi.fn();
const groupFindMany = vi.fn();
const groupCreate = vi.fn();
const groupUpdate = vi.fn();
const groupDelete = vi.fn();
const memberFindUnique = vi.fn();
const memberFindMany = vi.fn();
const memberCreate = vi.fn();
const memberUpsert = vi.fn();
const memberCount = vi.fn();
const postFindMany = vi.fn();
const postCount = vi.fn();
const transactionFn = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    group: {
      findUnique: (...args: unknown[]) => groupFindUnique(...args),
      findMany: (...args: unknown[]) => groupFindMany(...args),
      create: (...args: unknown[]) => groupCreate(...args),
      update: (...args: unknown[]) => groupUpdate(...args),
      delete: (...args: unknown[]) => groupDelete(...args),
      count: vi.fn(),
    },
    groupMember: {
      findUnique: (...args: unknown[]) => memberFindUnique(...args),
      findMany: (...args: unknown[]) => memberFindMany(...args),
      create: (...args: unknown[]) => memberCreate(...args),
      upsert: (...args: unknown[]) => memberUpsert(...args),
      count: (...args: unknown[]) => memberCount(...args),
      delete: vi.fn(),
      update: vi.fn(),
    },
    post: {
      findMany: (...args: unknown[]) => postFindMany(...args),
      count: (...args: unknown[]) => postCount(...args),
    },
    $transaction: (...args: unknown[]) => transactionFn(...args),
  },
}));

// Import dinâmico DEPOIS dos mocks
const { createGroup, listGroups, listGroupPosts } = await import(
  '@/lib/community/groups'
);

// ============================================================================
// Fixtures
// ============================================================================

const FIXED_GROUP_ROW = {
  id: 'g1',
  slug: 'caminhos-do-oriente',
  name: 'Caminhos do Oriente',
  description: 'Espaço para discutir Ifá, Cabala e tradições orientais',
  longDescription: null,
  rules: ['Respeito mútuo', 'Sem spam'],
  iconUrl: null,
  bannerUrl: null,
  tradition: 'ifa',
  isPublic: true,
  requireApproval: false,
  createdBy: 'u1',
  membersCount: 42,
  postsCount: 7,
  createdAt: new Date('2026-06-01T00:00:00Z'),
  updatedAt: new Date('2026-06-01T00:00:00Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// createGroup — nome válido
// ============================================================================

describe('createGroup', () => {
  it('criar grupo com nome válido retorna DTO com criador como ADMIN', async () => {
    const txGroupCreated = {
      ...FIXED_GROUP_ROW,
      id: 'g-new',
      slug: 'grupo-valido',
      membersCount: 1,
    };

    // Transação: cria group + adiciona creator como ADMIN
    transactionFn.mockImplementationOnce(
      async (cb: (tx: unknown) => Promise<unknown>) => {
        return cb({
          group: {
            create: (...args: unknown[]) => {
              groupCreate.mockImplementationOnce(() => txGroupCreated);
              return groupCreate(...args);
            },
          },
          groupMember: {
            create: (...args: unknown[]) => memberCreate(...args),
          },
        });
      }
    );

    // Reload com viewer info para DTO
    groupFindUnique.mockResolvedValueOnce({
      ...txGroupCreated,
      members: [{ role: 'ADMIN' }],
    });

    const result = await createGroup({
      slug: 'grupo-valido',
      name: 'Grupo Válido',
      description: 'Descrição com mais de 10 caracteres obrigatórios',
      tradition: 'cabala',
      createdBy: 'u1',
    });

    expect(result.name).toBe('Grupo Válido');
    expect(result.viewerRole).toBe('ADMIN');
    expect(result.isMember).toBe(true);
    expect(memberCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'u1', role: 'ADMIN' }),
      })
    );
  });

  it('criar grupo sem nome retorna erro de validação (Prisma propaga erro)', async () => {
    // Sem nome: Prisma rejeita via constraint NOT NULL → mock lança erro
    groupCreate.mockRejectedValueOnce(
      new Error('Argument `name` is missing.')
    );

    transactionFn.mockImplementationOnce(
      async (cb: (tx: unknown) => Promise<unknown>) => {
        return cb({
          group: {
            create: (...args: unknown[]) => groupCreate(...args),
          },
          groupMember: { create: (...args: unknown[]) => memberCreate(...args) },
        });
      }
    );

    await expect(
      createGroup({
        slug: 'sem-nome',
        // @ts-expect-error — propositalmente sem name para testar erro
        name: undefined,
        description: 'descricao valida',
        tradition: 'cabala',
        createdBy: 'u1',
      })
    ).rejects.toThrow();
  });
});

// ============================================================================
// listGroups — filtro por tradição
// ============================================================================

describe('listGroups', () => {
  it('filtra por tradição corretamente', async () => {
    groupFindMany.mockResolvedValueOnce([
      { ...FIXED_GROUP_ROW, tradition: 'cabala' },
      { ...FIXED_GROUP_ROW, id: 'g2', slug: 'outro', tradition: 'cabala' },
    ]);

    const result = await listGroups({ tradition: 'cabala' });

    expect(result).toHaveLength(2);
    expect(result.every((g) => g.tradition === 'cabala')).toBe(true);

    // Confere que o WHERE do Prisma recebeu a tradição
    const callArgs = groupFindMany.mock.calls[0]?.[0];
    expect(callArgs?.where?.tradition).toBe('cabala');
  });

  it('retorna múltiplas tradições sem filtro', async () => {
    groupFindMany.mockResolvedValueOnce([
      { ...FIXED_GROUP_ROW, tradition: 'cabala' },
      { ...FIXED_GROUP_ROW, id: 'g2', slug: 'ifa', tradition: 'ifa' },
    ]);

    const result = await listGroups();

    expect(result).toHaveLength(2);
    const traditions = result.map((g) => g.tradition).sort();
    expect(traditions).toEqual(['cabala', 'ifa']);

    const callArgs = groupFindMany.mock.calls[0]?.[0];
    expect(callArgs?.where?.tradition).toBeUndefined();
  });
});

// ============================================================================
// listGroupPosts — privacidade (não-membro não vê posts de grupo privado)
// ============================================================================

describe('listGroupPosts', () => {
  it('não-membro recebe GroupForbiddenError ao listar posts de grupo privado', async () => {
    // 1ª chamada: lookup do grupo (privado)
    groupFindUnique.mockResolvedValueOnce({
      id: 'g-privado',
      slug: 'circulo-interno',
      name: 'Círculo Interno',
      isPublic: false,
    });
    // 2ª chamada: checagem de membership → NÃO é membro
    memberFindUnique.mockResolvedValueOnce(null);

    await expect(
      listGroupPosts({
        slug: 'circulo-interno',
        viewerId: 'u-estranho',
      })
    ).rejects.toThrow('Grupo privado');

    // Garantia: post.findMany NUNCA deve ser chamado para não-membro em grupo privado
    expect(postFindMany).not.toHaveBeenCalled();
  });

  it('membro de grupo privado consegue listar posts', async () => {
    groupFindUnique.mockResolvedValueOnce({
      id: 'g-privado',
      slug: 'circulo-interno',
      name: 'Círculo Interno',
      isPublic: false,
    });
    // Viewer É membro
    memberFindUnique.mockResolvedValueOnce({
      groupId: 'g-privado',
      userId: 'u-membro',
    });

    postFindMany.mockResolvedValueOnce([
      {
        id: 'p1',
        authorId: 'u-membro',
        content: 'Conteúdo privado',
        createdAt: new Date('2026-06-15T00:00:00Z'),
        likesCount: 3,
        commentsCount: 0,
      },
    ]);

    const result = await listGroupPosts({
      slug: 'circulo-interno',
      viewerId: 'u-membro',
    });

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0]?.content).toBe('Conteúdo privado');
    expect(result.groupSlug).toBe('circulo-interno');
  });
});