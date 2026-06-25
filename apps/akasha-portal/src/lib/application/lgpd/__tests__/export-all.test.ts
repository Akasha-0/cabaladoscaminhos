/**
 * export-all — testes do helper (Wave 19.2)
 *
 * Cobre:
 *   - buildAllExport: retorna ReadableStream (tar.gz)
 *   - Conteúdo do tar.gz inclui os 8 arquivos esperados
 *   - profile.json NÃO contém passwordHash, currentRefreshTokenJti, stripeCustomerId
 *   - audit log: export_all_requested + export_all_completed
 *   - exportAllFile constants
 *   - buildExportFilename formato
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Readable } from 'node:stream';
import { createGunzip } from 'node:zlib';

const mockAuditLog = vi.fn();
const mockUserFindUnique = vi.fn();
const mockBirthChartFindUnique = vi.fn();
const mockSubscriptionFindUnique = vi.fn();
const mockManifestoFindUnique = vi.fn();
const mockDailyReadingFindMany = vi.fn();
const mockConsultationFindMany = vi.fn();
const mockRitualCompletionFindMany = vi.fn();
const mockCreditEntryFindMany = vi.fn();
const mockConnectionFindMany = vi.fn();
const mockCycleSnapshotFindMany = vi.fn();
const mockAreaHistoryEntryFindMany = vi.fn();
const mockExerciseCompletionFindMany = vi.fn();
const mockNotificationFindMany = vi.fn();
const mockAuditLogFindMany = vi.fn();

vi.mock('@/lib/infrastructure/audit-log', () => ({
  auditLog: (...args: unknown[]) => mockAuditLog(...args),
  hashIpForAudit: (ip: string) => `hash:${ip}`,
  extractClientIp: () => '127.0.0.1',
}));

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    user: { findUnique: (...args: unknown[]) => mockUserFindUnique(...args) },
    birthChart: {
      findUnique: (...args: unknown[]) => mockBirthChartFindUnique(...args),
    },
    subscription: {
      findUnique: (...args: unknown[]) => mockSubscriptionFindUnique(...args),
    },
    manifesto: {
      findUnique: (...args: unknown[]) => mockManifestoFindUnique(...args),
    },
    dailyReading: {
      findMany: (...args: unknown[]) => mockDailyReadingFindMany(...args),
    },
    consultation: {
      findMany: (...args: unknown[]) => mockConsultationFindMany(...args),
    },
    ritualCompletion: {
      findMany: (...args: unknown[]) => mockRitualCompletionFindMany(...args),
    },
    creditEntry: {
      findMany: (...args: unknown[]) => mockCreditEntryFindMany(...args),
    },
    connection: {
      findMany: (...args: unknown[]) => mockConnectionFindMany(...args),
    },
    cycleSnapshot: {
      findMany: (...args: unknown[]) => mockCycleSnapshotFindMany(...args),
    },
    areaHistoryEntry: {
      findMany: (...args: unknown[]) => mockAreaHistoryEntryFindMany(...args),
    },
    exerciseCompletion: {
      findMany: (...args: unknown[]) => mockExerciseCompletionFindMany(...args),
    },
    notification: {
      findMany: (...args: unknown[]) => mockNotificationFindMany(...args),
    },
    auditLog: {
      findMany: (...args: unknown[]) => mockAuditLogFindMany(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();

  // Defaults: user válido
  mockUserFindUnique.mockResolvedValue({
    id: 'u-export-1',
    email: 'export@test.com',
    emailVerified: true,
    name: 'Export User',
    locale: 'pt-BR',
    role: 'MEMBER',
    birthDate: new Date('1990-05-15'),
    birthTime: '14:30',
    birthCity: 'São Paulo',
    birthLatitude: -23.55,
    birthLongitude: -46.63,
    birthTimezone: 'America/Sao_Paulo',
    ichingMap: null,
    ichingEnabled: false,
    intentionProfile: null,
    consentAt: new Date('2026-01-01'),
    pushEnabled: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-06-01'),
  });
  mockBirthChartFindUnique.mockResolvedValue({
    id: 'bc-1',
    astrologyMap: { sun: 'Touro' },
    kabalisticMap: { resumo: 'Cabalista' },
    tantricMap: null,
    oduBirth: null,
    ichingMap: null,
    incomplete: false,
  });
  mockSubscriptionFindUnique.mockResolvedValue(null);
  mockManifestoFindUnique.mockResolvedValue({
    id: 'm-1',
    content: 'Meu manifesto',
    llmModel: 'gpt-4o-mini',
    tokensUsed: 1500,
  });
  mockDailyReadingFindMany.mockResolvedValue([
    { id: 'dr-1', date: new Date('2026-06-24'), hexagram: '1', climate: 'Criativo' },
    { id: 'dr-2', date: new Date('2026-06-23'), hexagram: '2', climate: 'Receptivo' },
  ]);
  mockConsultationFindMany.mockResolvedValue([
    {
      id: 'c-1',
      prompt: 'Pergunta do usuário',
      response: 'Resposta do mentor',
      llmModel: 'gpt-4o-mini',
      tokensUsed: 800,
      createdAt: new Date('2026-06-15'),
    },
  ]);
  mockRitualCompletionFindMany.mockResolvedValue([]);
  mockCreditEntryFindMany.mockResolvedValue([]);
  mockConnectionFindMany.mockResolvedValue([]);
  mockCycleSnapshotFindMany.mockResolvedValue([]);
  mockAreaHistoryEntryFindMany.mockResolvedValue([]);
  mockExerciseCompletionFindMany.mockResolvedValue([]);
  mockNotificationFindMany.mockResolvedValue([]);
  mockAuditLogFindMany.mockResolvedValue([]);
});

describe('EXPORT_ALL_FILES', () => {
  it('lista os 8 arquivos esperados', async () => {
    const { EXPORT_ALL_FILES } = await import('../export-all');
    expect(EXPORT_ALL_FILES).toEqual([
      'profile.json',
      'mandala.json',
      'manifestos.json',
      'diario.json',
      'chat_history.jsonl',
      'feedback.json',
      'audit_trail.json',
      'README.txt',
    ]);
  });
});

describe('buildExportFilename', () => {
  it('formato: akasha-export-{userId8chars}-{YYYYMMDD}.tar.gz', async () => {
    const { buildExportFilename } = await import('../export-all');
    const userId = 'abcd1234efgh5678ijkl';
    const date = new Date('2026-06-24T10:00:00Z');
    const filename = buildExportFilename(userId, date);
    expect(filename).toBe('akasha-export-abcd1234-20260624.tar.gz');
  });
});

describe('buildAllExport', () => {
  it('retorna ReadableStream do tar.gz + audit log requested/completed', async () => {
    const { buildAllExport } = await import('../export-all');
    const auth = { id: 'u-export-1', email: 'export@test.com', name: 'Export User' };

    const result = await buildAllExport({ auth });

    expect(result.stream).toBeDefined();
    expect(result.piiBytesExported).toBeGreaterThan(0);
    expect(result.files).toHaveLength(8);

    // audit log
    const actions = mockAuditLog.mock.calls.map((c) => c[0].action);
    expect(actions).toContain('export_all_requested');
    expect(actions).toContain('export_all_completed');
  });

  it('tar.gz contém todos os 8 arquivos esperados', async () => {
    const { buildAllExport } = await import('../export-all');
    const auth = { id: 'u-export-1', email: 'export@test.com', name: 'Export User' };

    const result = await buildAllExport({ auth });

    // Converte Web ReadableStream → Node Readable → descompacta gzip → concatena
    const nodeStream = Readable.fromWeb(result.stream as never);
    const gunzip = createGunzip();
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      nodeStream
        .pipe(gunzip)
        .on('data', (c: Buffer) => chunks.push(c))
        .on('end', () => resolve())
        .on('error', reject);
    });

    const tarContent = Buffer.concat(chunks).toString('utf8');

    // tar header de cada arquivo (entry name + '\0')
    // profile.json, mandala.json, manifestos.json, diario.json,
    // chat_history.jsonl, feedback.json, audit_trail.json, README.txt
    expect(tarContent).toContain('profile.json');
    expect(tarContent).toContain('mandala.json');
    expect(tarContent).toContain('manifestos.json');
    expect(tarContent).toContain('diario.json');
    expect(tarContent).toContain('chat_history.jsonl');
    expect(tarContent).toContain('feedback.json');
    expect(tarContent).toContain('audit_trail.json');
    expect(tarContent).toContain('README.txt');

    // Conteúdo do README
    expect(tarContent).toContain('Akasha');
    expect(tarContent).toContain('LGPD');

    // Conteúdo do profile.json inclui nome do user
    expect(tarContent).toContain('Export User');
    expect(tarContent).toContain('export@test.com');
  });

  it('profile.json NÃO contém passwordHash, stripeCustomerId ou currentRefreshTokenJti', async () => {
    const { buildAllExport } = await import('../export-all');
    const auth = { id: 'u-private', email: 'priv@test.com', name: 'Private' };

    // Mock com campos sensíveis — verifica que NÃO vazam.
    // Importante: o mock deve SIMULAR o comportamento do Prisma — `select`
    // filtra os campos retornados. Sem o filter, o teste seria circular
    // (mock devolve o que colocamos, select não tem efeito).
    mockUserFindUnique.mockImplementation(({ select }: { select?: Record<string, boolean> } = {}) => {
      const fullUser = {
        id: 'u-private',
        email: 'priv@test.com',
        name: 'Private',
        passwordHash: 'SECRET_HASH_SHOULD_NEVER_LEAK',
        currentRefreshTokenJti: 'SECRET_JTI_SHOULD_NEVER_LEAK',
        locale: 'pt-BR',
        role: 'MEMBER',
        birthDate: null,
        birthTime: null,
        birthCity: null,
        birthLatitude: null,
        birthLongitude: null,
        birthTimezone: null,
        ichingMap: null,
        ichingEnabled: false,
        intentionProfile: null,
        consentAt: null,
        pushEnabled: false,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (!select) return Promise.resolve(fullUser);
      // Aplica o select
      const filtered: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(select)) {
        if (v) filtered[k] = fullUser[k as keyof typeof fullUser];
      }
      return Promise.resolve(filtered);
    });

    mockSubscriptionFindUnique.mockImplementation(({ select }: { select?: Record<string, boolean> } = {}) => {
      const fullSub = {
        id: 'sub-1',
        plan: 'PREMIUM',
        status: 'ACTIVE',
        monthlyCreditQuota: 100,
        currentPeriodEnd: new Date(),
        dashboardUntil: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        stripeCustomerId: 'cus_SECRET_SHOULD_NEVER_LEAK',
        stripeSubscriptionId: 'sub_SECRET_SHOULD_NEVER_LEAK',
      };
      if (!select) return Promise.resolve(fullSub);
      const filtered: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(select)) {
        if (v) filtered[k] = fullSub[k as keyof typeof fullSub];
      }
      return Promise.resolve(filtered);
    });

    const result = await buildAllExport({ auth });

    const nodeStream = Readable.fromWeb(result.stream as never);
    const gunzip = createGunzip();
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      nodeStream
        .pipe(gunzip)
        .on('data', (c: Buffer) => chunks.push(c))
        .on('end', () => resolve())
        .on('error', reject);
    });

    const tarContent = Buffer.concat(chunks).toString('utf8');

    // NUNCA devem vazar
    expect(tarContent).not.toContain('SECRET_HASH_SHOULD_NEVER_LEAK');
    expect(tarContent).not.toContain('SECRET_JTI_SHOULD_NEVER_LEAK');
    expect(tarContent).not.toContain('cus_SECRET_SHOULD_NEVER_LEAK');
    expect(tarContent).not.toContain('sub_SECRET_SHOULD_NEVER_LEAK');
  });

  it('audit_trail.json contém entradas do próprio user', async () => {
    const { buildAllExport } = await import('../export-all');
    const auth = { id: 'u-audit', email: 'a@x.com', name: 'A' };

    mockAuditLogFindMany.mockResolvedValue([
      {
        id: 'al-1',
        action: 'consent_updated',
        userId: 'u-audit',
        ipHash: 'hash:127.0.0.1',
        requestId: 'req-1',
        metadata: { source: 'settings' },
        createdAt: new Date('2026-06-01'),
      },
    ]);

    const result = await buildAllExport({ auth });

    const nodeStream = Readable.fromWeb(result.stream as never);
    const gunzip = createGunzip();
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      nodeStream
        .pipe(gunzip)
        .on('data', (c: Buffer) => chunks.push(c))
        .on('end', () => resolve())
        .on('error', reject);
    });

    const tarContent = Buffer.concat(chunks).toString('utf8');

    // audit_trail.json deve aparecer
    expect(tarContent).toContain('audit_trail.json');
    // Conteúdo do audit log
    expect(tarContent).toContain('consent_updated');
    expect(tarContent).toContain('al-1');
  });

  it('chat_history.jsonl inclui consultations', async () => {
    const { buildAllExport } = await import('../export-all');
    const auth = { id: 'u-chat', email: 'c@x.com', name: 'C' };

    mockConsultationFindMany.mockResolvedValue([
      {
        id: 'c-1',
        prompt: 'Meu mapa',
        response: 'Sol em Touro',
        createdAt: new Date(),
      },
    ]);

    const result = await buildAllExport({ auth });

    const nodeStream = Readable.fromWeb(result.stream as never);
    const gunzip = createGunzip();
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      nodeStream
        .pipe(gunzip)
        .on('data', (c: Buffer) => chunks.push(c))
        .on('end', () => resolve())
        .on('error', reject);
    });

    const tarContent = Buffer.concat(chunks).toString('utf8');

    expect(tarContent).toContain('chat_history.jsonl');
    expect(tarContent).toContain('Meu mapa');
    expect(tarContent).toContain('Sol em Touro');
  });
});
