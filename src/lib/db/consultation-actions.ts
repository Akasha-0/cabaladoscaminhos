// src/lib/db/consultation-actions.ts
// Persistência de Consultas Interativas (Q&A) — Doc 12 §3.
//
// Camada de DB para o motor de Q&A da Fase 4. Estas funções são
// "action helpers" puros (mesmo padrão de reading-actions.ts /
// client-actions.ts): input validado por Zod, retorno direto do Prisma.

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { ChatRole, Consultation, ChatMessage } from '@prisma/client';

// ============================================================================
// Schemas (Zod)
// ============================================================================

export const createConsultationSchema = z.object({
  readingId: z.string().min(1, 'readingId é obrigatório'),
  operatorId: z.string().min(1, 'operatorId é obrigatório'),
  title: z.string().max(200).optional(),
});

export const addChatMessageSchema = z.object({
  consultationId: z.string().min(1, 'consultationId é obrigatório'),
  role: z.enum(['USER', 'ORACLE']),
  content: z.string().min(1, 'Mensagem vazia').max(8000),
  routedThemes: z.array(z.string()).optional(),
  routedHouses: z.array(z.number().int().positive()).optional(),
});

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
export type AddChatMessageInput = z.infer<typeof addChatMessageSchema>;

// ============================================================================
// Tipos públicos
// ============================================================================

/**
 * Pacote de contexto carregado para alimentar o Q&A em RAG fechado.
 * Tudo que o motor de Q&A precisa para responder (Doc 12 §5):
 *   - Reading com sua matrix
 *   - Client com seus mapas (astrology/kabalah/tantric/odubirth)
 *   - Report (se já gerado) com seu conteúdo interpretativo
 *   - Lista de casas já preenchidas (para enriquecer o prompt)
 */
export interface ConsultContext {
  readingId: string;
  client: {
    id: string;
    fullName: string;
    birthDate: Date;
    maps: {
      astrology: Record<string, unknown> | null;
      kabalistic: Record<string, unknown> | null;
      tantric: Record<string, unknown> | null;
      oduBirth: Record<string, unknown> | null;
    };
  };
  matrixData: Record<number, { carta: number; odu: number }>;
  report: { id: string; content: Record<string, unknown> } | null;
  filledHouseNumbers: number[];
}

// ============================================================================
// Operações
// ============================================================================

/**
 * Cria uma nova thread de Q&A ancorada a uma leitura.
 * Garante que o Reading e o Operator existam antes de criar.
 */
export async function createConsultation(
  input: CreateConsultationInput
): Promise<Consultation> {
  const data = createConsultationSchema.parse(input);

  // Verifica existência para devolver 404-friendly (route layer trata).
  const [reading, operator] = await Promise.all([
    prisma.reading.findUnique({ where: { id: data.readingId }, select: { id: true } }),
    prisma.operator.findUnique({ where: { id: data.operatorId }, select: { id: true } }),
  ]);
  if (!reading) throw new Error(`Reading ${data.readingId} não encontrado`);
  if (!operator) throw new Error(`Operator ${data.operatorId} não encontrado`);

  return prisma.consultation.create({
    data: {
      readingId: data.readingId,
      operatorId: data.operatorId,
      title: data.title,
    },
  });
}

/**
 * Adiciona uma mensagem à thread e atualiza o `updatedAt` da consultation
 * (para ordenação de threads ativas).
 */
export async function addChatMessage(
  input: AddChatMessageInput
): Promise<ChatMessage> {
  const data = addChatMessageSchema.parse(input);

  // Transação: cria a mensagem e bumpa o updatedAt da thread.
  return prisma.$transaction(async (tx) => {
    const message = await tx.chatMessage.create({
      data: {
        consultationId: data.consultationId,
        role: data.role as ChatRole,
        content: data.content,
        routedThemes: data.routedThemes ?? [],
        routedHouses: data.routedHouses ?? [],
      },
    });
    await tx.consultation.update({
      where: { id: data.consultationId },
      data: { updatedAt: new Date() },
    });
    return message;
  });
}

/**
 * Carrega o contexto RAG-fechado para uma leitura:
 *   - Reading.matrixData
 *   - Client com seus 4 mapas cacheados
 *   - Report (se existir) com seu conteúdo
 * Retorna `null` se o Reading não existir.
 */
export async function getConsultContext(
  readingId: string
): Promise<ConsultContext | null> {
  const reading = await prisma.reading.findUnique({
    where: { id: readingId },
    include: {
      client: true,
      report: true,
    },
  });

  if (!reading) return null;

  const matrixData = (reading.matrixData ?? {}) as Record<
    number,
    { carta: number; odu: number }
  >;
  const filledHouseNumbers = Object.keys(matrixData)
    .map((k) => Number(k))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  return {
    readingId: reading.id,
    client: {
      id: reading.client.id,
      fullName: reading.client.fullName,
      birthDate: reading.client.birthDate,
      maps: {
        astrology: (reading.client.astrologyMap as Record<string, unknown> | null) ?? null,
        kabalistic: (reading.client.kabalisticMap as Record<string, unknown> | null) ?? null,
        tantric: (reading.client.tantricMap as Record<string, unknown> | null) ?? null,
        oduBirth: (reading.client.oduBirth as Record<string, unknown> | null) ?? null,
      },
    },
    matrixData,
    report: reading.report
      ? {
          id: reading.report.id,
          content: (reading.report.content ?? {}) as Record<string, unknown>,
        }
      : null,
    filledHouseNumbers,
  };
}

/**
 * Lista todas as consultations de uma leitura (mais recente primeiro).
 * Útil para a UI do Cockpit mostrar threads por leitura.
 */
export async function getConsultationsByReading(
  readingId: string
): Promise<(Consultation & { _count?: { messages: number } })[]> {
  return prisma.consultation.findMany({
    where: { readingId },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { messages: true } } },
  });
}
