// tests/lib/db/consultation-actions.test.ts
// Testes de integração (Prisma mockado) do consultation-actions (Fase 7).
// Cobre: createConsultation, addChatMessage (transação), getConsultContext,
// getConsultationsByReading.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createConsultation,
  addChatMessage,
  getConsultContext,
  getConsultationsByReading,
  createConsultationSchema,
  addChatMessageSchema,
} from '@/lib/db/consultation-actions';
import { prisma } from '@/lib/prisma';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockReading = {
  id: 'reading-1',
  date: new Date('2026-05-01'),
  status: 'PENDING',
  notes: null,
  matrixData: { 1: { carta: 1, odu: 1 }, 7: { carta: 7, odu: 4 } },
  clientId: 'client-1',
  operatorId: 'op-1',
  createdAt: new Date('2026-05-01'),
  updatedAt: new Date('2026-05-01'),
};

const mockClient = {
  id: 'client-1',
  fullName: 'Maria da Silva',
  birthDate: new Date('1990-05-15'),
  birthTime: '10:30',
  birthCity: 'São Paulo',
  birthState: 'SP',
  birthCountry: 'BR',
  birthLatitude: null,
  birthLongitude: null,
  birthTimezone: null,
  astrologyMap: { sun: { sign: 'Touro' } },
  kabalisticMap: { expression: 5 },
  tantricMap: { domain: 3 },
  oduBirth: { odu: 1 },
  notes: null,
  createdAt: new Date('2026-05-01'),
  updatedAt: new Date('2026-05-01'),
};

const mockReport = {
  id: 'report-1',
  content: { houses: { 1: { interpretation: 'Casa 1: ação imediata' } } },
  llmModel: 'gpt-4o',
  tokensUsed: 500,
  pdfUrl: null,
  readingId: 'reading-1',
  createdAt: new Date('2026-05-01'),
  updatedAt: new Date('2026-05-01'),
};

const mockOperator = {
  id: 'op-1',
  email: 'r@cabala.com',
  name: 'Ramiro',
  passwordHash: 'h',
  role: 'OPERATOR',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockConsultation = {
  id: 'consult-1',
  title: null,
  readingId: 'reading-1',
  operatorId: 'op-1',
  createdAt: new Date('2026-05-01'),
  updatedAt: new Date('2026-05-01'),
};

const mockChatMessage = {
  id: 'msg-1',
  role: 'USER',
  content: 'O que significa a casa 1?',
  routedThemes: [],
  routedHouses: [],
  consultationId: 'consult-1',
  createdAt: new Date('2026-05-01'),
};

// Prisma mockado com transação
const txMock = {
  chatMessage: { create: vi.fn() },
  consultation: { update: vi.fn() },
};

vi.mock('@/lib/prisma', () => {
  const findUnique = vi.fn();
  const findMany = vi.fn();
  const create = vi.fn();
  const $transaction = vi.fn(async (cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock));
  return {
    prisma: {
      reading: { findUnique, create },
      operator: { findUnique: vi.fn() },
      consultation: { findUnique: vi.fn(), findMany, create },
      chatMessage: { create: vi.fn() },
      $transaction,
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// Schema validation
// ============================================================================

describe('schemas (Zod)', () => {
  it('createConsultationSchema accepts valid input', () => {
    expect(() =>
      createConsultationSchema.parse({
        readingId: 'r1',
        operatorId: 'op-1',
      })
    ).not.toThrow();
  });

  it('createConsultationSchema rejects empty readingId', () => {
    expect(() => createConsultationSchema.parse({ readingId: '', operatorId: 'op-1' })).toThrow();
  });

  it('addChatMessageSchema rejects empty content', () => {
    expect(() =>
      addChatMessageSchema.parse({
        consultationId: 'c1',
        role: 'USER',
        content: '',
      })
    ).toThrow();
  });

  it('addChatMessageSchema rejects invalid role', () => {
    expect(() =>
      addChatMessageSchema.parse({
        consultationId: 'c1',
        role: 'ADMIN',
        content: 'oi',
      })
    ).toThrow();
  });
});

// ============================================================================
// createConsultation
// ============================================================================

describe('createConsultation', () => {
  it('creates a consultation when reading and operator exist', async () => {
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'r1' });
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'op-1' });
    (prisma.consultation.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockConsultation);

    const result = await createConsultation({
      readingId: 'r1',
      operatorId: 'op-1',
    });

    expect(result).toEqual(mockConsultation);
    expect(prisma.consultation.create).toHaveBeenCalledWith({
      data: { readingId: 'r1', operatorId: 'op-1', title: undefined },
    });
  });

  it('throws when reading does not exist', async () => {
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'op-1' });

    await expect(createConsultation({ readingId: 'missing', operatorId: 'op-1' })).rejects.toThrow(
      /Reading missing não encontrado/
    );
  });

  it('throws when operator does not exist', async () => {
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'r1' });
    (prisma.operator.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await expect(createConsultation({ readingId: 'r1', operatorId: 'missing' })).rejects.toThrow(
      /Operator missing não encontrado/
    );
  });
});

// ============================================================================
// addChatMessage (transação)
// ============================================================================

describe('addChatMessage', () => {
  it('creates message and bumps consultation.updatedAt in a transaction', async () => {
    txMock.chatMessage.create.mockResolvedValue(mockChatMessage);
    txMock.consultation.update.mockResolvedValue({ ...mockConsultation, updatedAt: new Date() });

    const result = await addChatMessage({
      consultationId: 'consult-1',
      role: 'USER',
      content: 'O que significa a casa 1?',
    });

    expect(result).toEqual(mockChatMessage);
    expect(txMock.chatMessage.create).toHaveBeenCalledWith({
      data: {
        consultationId: 'consult-1',
        role: 'USER',
        content: 'O que significa a casa 1?',
        routedThemes: [],
        routedHouses: [],
      },
    });
    expect(txMock.consultation.update).toHaveBeenCalledWith({
      where: { id: 'consult-1' },
      data: { updatedAt: expect.any(Date) },
    });
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('persists routing metadata for ORACLE messages', async () => {
    txMock.chatMessage.create.mockResolvedValue({ ...mockChatMessage, role: 'ORACLE' });
    txMock.consultation.update.mockResolvedValue(mockConsultation);

    await addChatMessage({
      consultationId: 'consult-1',
      role: 'ORACLE',
      content: 'Veja casas 1 e 7',
      routedThemes: ['amor', 'decisao'],
      routedHouses: [1, 7],
    });

    expect(txMock.chatMessage.create).toHaveBeenCalledWith({
      data: {
        consultationId: 'consult-1',
        role: 'ORACLE',
        content: 'Veja casas 1 e 7',
        routedThemes: ['amor', 'decisao'],
        routedHouses: [1, 7],
      },
    });
  });
});

// ============================================================================
// getConsultContext
// ============================================================================

describe('getConsultContext', () => {
  it('returns null when reading does not exist', async () => {
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await getConsultContext('missing');

    expect(result).toBeNull();
  });

  it('returns full context with client maps and report', async () => {
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockReading,
      client: mockClient,
      report: mockReport,
      consultations: [],
    });

    const result = await getConsultContext('reading-1');

    expect(result).not.toBeNull();
    expect(result!.readingId).toBe('reading-1');
    expect(result!.client.fullName).toBe('Maria da Silva');
    expect(result!.client.maps.astrology).toEqual({ sun: { sign: 'Touro' } });
    expect(result!.client.maps.kabalistic).toEqual({ expression: 5 });
    expect(result!.client.maps.tantric).toEqual({ domain: 3 });
    expect(result!.client.maps.oduBirth).toEqual({ odu: 1 });
    expect(result!.matrixData).toEqual({
      1: { carta: 1, odu: 1 },
      7: { carta: 7, odu: 4 },
    });
    expect(result!.filledHouseNumbers).toEqual([1, 7]);
    expect(result!.report).toEqual({
      id: 'report-1',
      content: { houses: { 1: { interpretation: 'Casa 1: ação imediata' } } },
    });
  });
  it('handles reading without a report', async () => {
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockReading,
      client: mockClient,
      report: null,
      consultations: [],
    });

    const result = await getConsultContext('reading-1');

    expect(result!.report).toBeNull();
  });

  it('handles client with null maps (degraded context)', async () => {
    const clientWithoutMaps = {
      ...mockClient,
      astrologyMap: null,
      kabalisticMap: null,
      tantricMap: null,
      oduBirth: null,
    };
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockReading,
      client: clientWithoutMaps,
      report: null,
      consultations: [],
    });

    const result = await getConsultContext('reading-1');

    expect(result!.client.maps.astrology).toBeNull();
    expect(result!.client.maps.kabalistic).toBeNull();
  });
  // AD-12: routing info tests
  it('returns empty messages array when no consultations exist', async () => {
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockReading,
      client: mockClient,
      report: null,
      consultations: [],
    });
    const result = await getConsultContext('reading-1');
    expect(result!.messages).toEqual([]);
  });
  it('returns routedThemes and routedHouses from chatMessages', async () => {
    const oracleMessage = {
      id: 'msg-oracle-1',
      role: 'ORACLE',
      content: 'A Casa 1 representa o EU, ação imediata.',
      routedThemes: ['amor', 'decisao'],
      routedHouses: [1],
      consultationId: 'consult-1',
      createdAt: new Date('2026-05-01T10:00:00Z'),
    };
    const userMessage = {
      id: 'msg-user-1',
      role: 'USER',
      content: 'E a casa 7?',
      routedThemes: [] as string[],
      routedHouses: [] as number[],
      consultationId: 'consult-1',
      createdAt: new Date('2026-05-01T10:01:00Z'),
    };
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockReading,
      client: mockClient,
      report: null,
      consultations: [
        {
          ...mockConsultation,
          messages: [userMessage, oracleMessage],
        },
      ],
    });
    const result = await getConsultContext('reading-1');
    expect(result!.messages).toHaveLength(2);
    // USER message: routing fields are empty arrays
    const userMsg = result!.messages[0];
    expect(userMsg.id).toBe('msg-user-1');
    expect(userMsg.role).toBe('USER');
    expect(userMsg.routedThemes).toEqual([]);
    expect(userMsg.routedHouses).toEqual([]);
    // ORACLE message: routing fields carry house/theme routing (AD-12)
    const oracleMsg = result!.messages[1];
    expect(oracleMsg.id).toBe('msg-oracle-1');
    expect(oracleMsg.role).toBe('ORACLE');
    expect(oracleMsg.routedThemes).toEqual(['amor', 'decisao']);
    expect(oracleMsg.routedHouses).toEqual([1]);
    expect(oracleMsg.content).toBe('A Casa 1 representa o EU, ação imediata.');
  });
  it('aggregates messages from multiple consultations ordered by createdAt', async () => {
    const consult1Msg = {
      id: 'msg-c1',
      role: 'USER',
      content: 'Pergunta 1',
      routedThemes: [] as string[],
      routedHouses: [] as number[],
      consultationId: 'consult-1',
      createdAt: new Date('2026-05-01T10:00:00Z'),
    };
    const consult2Msg = {
      id: 'msg-c2',
      role: 'ORACLE',
      content: 'Resposta 1',
      routedThemes: ['financas'],
      routedHouses: [2],
      consultationId: 'consult-2',
      createdAt: new Date('2026-05-01T09:00:00Z'),
    };
    (prisma.reading.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockReading,
      client: mockClient,
      report: null,
      consultations: [
        { ...mockConsultation, id: 'consult-2', messages: [consult2Msg] },
        { ...mockConsultation, id: 'consult-1', messages: [consult1Msg] },
      ],
    });
    const result = await getConsultContext('reading-1');
    // Messages are flat-mapped from all consultations and ordered by createdAt asc
    expect(result!.messages).toHaveLength(2);
    expect(result!.messages[0].id).toBe('msg-c2'); // earlier timestamp
    expect(result!.messages[0].routedHouses).toEqual([2]);
    expect(result!.messages[1].id).toBe('msg-c1'); // later timestamp
  });
});
// ============================================================================
// getConsultationsByReading
// ============================================================================

describe('getConsultationsByReading', () => {
  it('returns consultations ordered by updatedAt desc with message count', async () => {
    const list = [
      { ...mockConsultation, _count: { messages: 5 } },
      { ...mockConsultation, id: 'consult-2', _count: { messages: 2 } },
    ];
    (prisma.consultation.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(list);

    const result = await getConsultationsByReading('reading-1');

    expect(result).toHaveLength(2);
    expect(prisma.consultation.findMany).toHaveBeenCalledWith({
      where: { readingId: 'reading-1' },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    });
  });
});
