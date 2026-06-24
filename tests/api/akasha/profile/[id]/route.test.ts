/**
 * Integration tests for DELETE /api/akasha/profile/[id]
 *
 * Wave 8.3 (LGPD Art. 18 — direito ao esquecimento).
 *
 * Cobre:
 *  - Auth (401 unauthorized)
 *  - Permissão (403 quando user não-dono e não-admin)
 *  - Permissão admin (200 quando admin deleta outro user)
 *  - Not found (404 quando userId inexistente)
 *  - Dry-run NÃO deleta (counts retornados, zero mutações)
 *  - Delete real cascata (prisma.user.delete chamado)
 *  - Falha no delete retorna 500
 *
 * Padrão de mock: `requireAkashaApi` mockado (não toca DB real); `prisma`
 * mockado com `vi.fn()` por model.auditLog é importado direto (stub
 * stdout-only — não precisa mock).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockRequireAkashaApi = vi.fn();

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: mockRequireAkashaApi,
}));

// Mock granular do Prisma: cada model tem sua `.count` e `delete`/`findUnique`.
// Cada teste configura o que precisa.
const mockUser = {
  findUnique: vi.fn(),
  delete: vi.fn(),
};

const mockBirthChart = { count: vi.fn() };
const mockSubscription = { count: vi.fn() };
const mockManifesto = { count: vi.fn() };
const mockCreditEntry = { count: vi.fn() };
const mockDailyReading = { count: vi.fn() };
const mockConsultation = { count: vi.fn() };
const mockRitualCompletion = { count: vi.fn() };
const mockPushSubscription = { count: vi.fn() };
const mockConnection = { count: vi.fn() };
const mockCycleSnapshot = { count: vi.fn() };
const mockAreaHistoryEntry = { count: vi.fn() };
const mockExerciseCompletion = { count: vi.fn() };
const mockCaminhante = { count: vi.fn() };
const mockCaminhada = { count: vi.fn() };
const mockSessao = { count: vi.fn() };
const mockSessaoChunk = { count: vi.fn() };
const mockGrimorioPessoal = { count: vi.fn() };
const mockNotasConsulente = { count: vi.fn() };
const mockMapaCalculo = { count: vi.fn() };
const mockPilar6Calculo = { count: vi.fn() };
const mockPilar7Calculo = { count: vi.fn() };
const mockPilar7Estagio = { count: vi.fn() };

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    user: mockUser,
    birthChart: mockBirthChart,
    subscription: mockSubscription,
    manifesto: mockManifesto,
    creditEntry: mockCreditEntry,
    dailyReading: mockDailyReading,
    consultation: mockConsultation,
    ritualCompletion: mockRitualCompletion,
    pushSubscription: mockPushSubscription,
    connection: mockConnection,
    cycleSnapshot: mockCycleSnapshot,
    areaHistoryEntry: mockAreaHistoryEntry,
    exerciseCompletion: mockExerciseCompletion,
    caminhante: mockCaminhante,
    caminhada: mockCaminhada,
    sessao: mockSessao,
    sessaoChunk: mockSessaoChunk,
    grimorioPessoal: mockGrimorioPessoal,
    notasConsulente: mockNotasConsulente,
    mapaCalculo: mockMapaCalculo,
    pilar6Calculo: mockPilar6Calculo,
    pilar7Calculo: mockPilar7Calculo,
    pilar7Estagio: mockPilar7Estagio,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  // Default: auth válido, role=MEMBER
  mockRequireAkashaApi.mockResolvedValue({
    id: 'user-owner',
    email: 'owner@test.com',
    name: 'Owner',
  });
  // Default: role lookup retorna MEMBER
  mockUser.findUnique.mockResolvedValue({ role: 'MEMBER' });
  // Default: counts = 0 (todos vazios)
  const allCounts = [
    mockBirthChart,
    mockSubscription,
    mockManifesto,
    mockCreditEntry,
    mockDailyReading,
    mockConsultation,
    mockRitualCompletion,
    mockPushSubscription,
    mockConnection,
    mockCycleSnapshot,
    mockAreaHistoryEntry,
    mockExerciseCompletion,
    mockCaminhante,
    mockCaminhada,
    mockSessao,
    mockSessaoChunk,
    mockGrimorioPessoal,
    mockNotasConsulente,
    mockMapaCalculo,
    mockPilar6Calculo,
    mockPilar7Calculo,
    mockPilar7Estagio,
  ];
  for (const m of allCounts) {
    m.count.mockResolvedValue(0);
  }
  // Default: user delete succeeds
  mockUser.delete.mockResolvedValue({ id: 'user-owner' });
});

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function makeDeleteRequest(
  id: string,
  query: Record<string, string> = {},
): Request {
  const url = new URL(`http://localhost/api/akasha/profile/${id}`);
  for (const [k, v] of Object.entries(query)) {
    url.searchParams.set(k, v);
  }
  return new Request(url.toString(), {
    method: 'DELETE',
    headers: { cookie: 'akasha_session=fake-token' },
  });
}

// ----------------------------------------------------------------------------
// Testes
// ----------------------------------------------------------------------------

describe('DELETE /api/akasha/profile/[id] (Wave 8.3 — LGPD Art. 18)', () => {
  const routeImportPath =
    '@/app/api/akasha/profile/[id]/route';

  it('retorna 401 quando usuário não autenticado', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    );

    const { DELETE } = await import(/* @vite-ignore */ routeImportPath);
    const res = await DELETE(makeDeleteRequest('user-owner'), {
      params: Promise.resolve({ id: 'user-owner' }),
    });

    expect(res.status).toBe(401);
    // Importante: NÃO deve chamar prisma.user.delete se não autenticado
    expect(mockUser.delete).not.toHaveBeenCalled();
  });

  it('retorna 403 quando user não-dono e não-admin tenta deletar outro perfil', async () => {
    mockUser.findUnique.mockResolvedValue({ role: 'MEMBER' });

    const { DELETE } = await import(/* @vite-ignore */ routeImportPath);
    const res = await DELETE(makeDeleteRequest('outro-user'), {
      params: Promise.resolve({ id: 'outro-user' }),
    });

    expect(res.status).toBe(403);
    expect(mockUser.delete).not.toHaveBeenCalled();
  });

  it('permite admin deletar perfil de outro user (200, com cascata)', async () => {
    mockRequireAkashaApi.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      name: 'Admin',
    });
    mockUser.findUnique
      .mockResolvedValueOnce({ role: 'ADMIN' }) // role check do actor
      .mockResolvedValueOnce({ id: 'target', email: 'target@test.com' }); // existência do target
    // Conta cascata ANTES do delete: 3 caminhantes, 2 sessões, etc.
    mockCaminhante.count.mockResolvedValue(3);
    mockSessao.count.mockResolvedValue(2);
    mockBirthChart.count.mockResolvedValue(1);

    const { DELETE } = await import(/* @vite-ignore */ routeImportPath);
    const res = await DELETE(makeDeleteRequest('target-user'), {
      params: Promise.resolve({ id: 'target-user' }),
    });

    expect(res.status).toBe(200);
    expect(mockUser.delete).toHaveBeenCalledWith({ where: { id: 'target-user' } });
  });

  it('retorna 404 quando perfil alvo não existe (admin bypassa 403)', async () => {
    // Admin tenta deletar user inexistente: passa o 403 (admin override),
    // chega no check de existência e retorna 404.
    mockRequireAkashaApi.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      name: 'Admin',
    });
    mockUser.findUnique
      .mockResolvedValueOnce({ role: 'ADMIN' }) // role check
      .mockResolvedValueOnce(null); // target user not found

    const { DELETE } = await import(/* @vite-ignore */ routeImportPath);
    const res = await DELETE(makeDeleteRequest('inexistente'), {
      params: Promise.resolve({ id: 'inexistente' }),
    });

    expect(res.status).toBe(404);
    expect(mockUser.delete).not.toHaveBeenCalled();
  });

  it('dry-run retorna counts sem deletar nada', async () => {
    // Conta cascata ANTES: 5 sessoes, 2 caminhantes
    mockSessao.count.mockResolvedValue(5);
    mockCaminhante.count.mockResolvedValue(2);
    mockBirthChart.count.mockResolvedValue(1);

    const { DELETE } = await import(/* @vite-ignore */ routeImportPath);
    const res = await DELETE(
      makeDeleteRequest('user-owner', { dryRun: 'true' }),
      { params: Promise.resolve({ id: 'user-owner' }) },
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dryRun).toBe(true);
    expect(body.deleted).toBe(false);
    expect(body.cascaded.sessoes).toBe(5);
    expect(body.cascaded.caminhantes).toBe(2);
    expect(body.cascaded.birthChart).toBe(1);
    expect(body.warning).toMatch(/Nenhum dado foi deletado/);
    // CRÍTICO: dry-run NÃO chama delete
    expect(mockUser.delete).not.toHaveBeenCalled();
  });

  it('delete real propaga cascata para TODAS as relations (zeladorId + userId)', async () => {
    // Verifica que o handler faz count em TODOS os models antes/depois
    const allCounts = [
      mockBirthChart,
      mockSubscription,
      mockManifesto,
      mockCreditEntry,
      mockDailyReading,
      mockConsultation,
      mockRitualCompletion,
      mockPushSubscription,
      mockConnection,
      mockCycleSnapshot,
      mockAreaHistoryEntry,
      mockExerciseCompletion,
      mockCaminhante,
      mockCaminhada,
      mockSessao,
      mockSessaoChunk,
      mockGrimorioPessoal,
      mockNotasConsulente,
      mockMapaCalculo,
      mockPilar6Calculo,
      mockPilar7Calculo,
      mockPilar7Estagio,
    ];

    const { DELETE } = await import(/* @vite-ignore */ routeImportPath);
    const res = await DELETE(makeDeleteRequest('user-owner'), {
      params: Promise.resolve({ id: 'user-owner' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.deleted).toBe(true);
    expect(body.message).toMatch(/LGPD Art\. 18/);
    // Cada model.count deve ter sido chamado pelo menos uma vez
    for (const m of allCounts) {
      expect(m.count).toHaveBeenCalled();
    }
    expect(mockUser.delete).toHaveBeenCalledWith({ where: { id: 'user-owner' } });
  });

  it('retorna 500 quando prisma.user.delete falha', async () => {
    mockUser.delete.mockRejectedValueOnce(new Error('DB connection lost'));

    const { DELETE } = await import(/* @vite-ignore */ routeImportPath);
    const res = await DELETE(makeDeleteRequest('user-owner'), {
      params: Promise.resolve({ id: 'user-owner' }),
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/Falha ao deletar/);
  });

  it('retorna 400 quando id é vazio/inválido', async () => {
    const { DELETE } = await import(/* @vite-ignore */ routeImportPath);
    const res = await DELETE(makeDeleteRequest(''), {
      params: Promise.resolve({ id: '' }),
    });

    expect(res.status).toBe(400);
  });
});