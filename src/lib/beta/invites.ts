// ============================================================================
// BETA INVITE BUSINESS LOGIC — Wave 32 (2026-06-30)
// ============================================================================
// Camada de domínio: criar, validar, aceitar e revogar convites.
// Mantém separação entre transporte (API routes) e regras de negócio
// (status machine, expiração, dedupe, LGPD).
//
// Máquina de estados (InviteStatus):
//   PENDING ──► SENT ──► OPENED ──► ACCEPTED  (happy path)
//      │          │                      ▲
//      │          └──► EXPIRED ──────────┤
//      │                                 │
//      └──► REVOKED  ◄────────────────────┘  (admin cancela a qualquer momento)
//
// Single-use: ao aceitar, status vai para ACCEPTED. Reuso do mesmo token é
// bloqueado. Expiração é absoluta (expiresAt), independente do status.
//
// LGPD (Art. 7, 9, 18):
//   - email é PII; armazenado mas nunca logado em plaintext
//   - token plaintext nunca toca o DB
//   - dedupe 5min por (email, wave) evita duplicação por retry de admin
// ============================================================================

import { prisma } from '@/lib/prisma';
import {
  generateInviteToken,
  validateInviteToken,
  getExpiresInDays,
} from '@/lib/beta/token';
import { logAudit } from '@/lib/audit';
import type { InviteStatus } from '@prisma/client';

// ============================================================================
// Tipos públicos
// ============================================================================

export type Wave = 1 | 2 | 3;

export interface InviteSummary {
  id: string;
  email: string;
  wave: number;
  status: InviteStatus;
  expiresAt: Date;
  sentAt: Date | null;
  openedAt: Date | null;
  acceptedAt: Date | null;
  inviterId: string | null;
  createdAt: Date;
  /** Display-only, derivado do hash (primeiros 4 + últimos 4 chars). */
  tokenDisplay: string;
}

export interface CreateInviteInput {
  email: string;
  wave: Wave;
  inviterId?: string | null;
  /** Quando true, NÃO envia email — apenas cria o registro (batch review). */
  dryRun?: boolean;
  /** Contexto técnico (UTMs, batch id) — sem PII cru. */
  metadata?: Record<string, unknown>;
}

export interface CreateInviteResult {
  ok: boolean;
  invite?: InviteSummary;
  /** Token plaintext — SOMENTE nesta resposta. Não é persistido; caller
   *  precisa passar para a função de envio de email imediatamente. */
  plaintextToken?: string;
  /** Quando ok=false, motivo estruturado para a API responder. */
  reason?: 'invalid_email' | 'invalid_wave' | 'duplicate_pending' | 'db_error';
}

export interface AcceptInviteInput {
  plaintextToken: string;
  /** User ID criado pelo fluxo de signup (Supabase auth). */
  userId: string;
}

export type AcceptResult =
  | { ok: true; invite: InviteSummary; userId: string }
  | {
      ok: false;
      reason:
        | 'invalid_token'
        | 'expired'
        | 'revoked'
        | 'already_accepted'
        | 'user_not_found';
    };

// ============================================================================
// Constantes
// ============================================================================

const DEDUPE_WINDOW_MS = 5 * 60 * 1000; // 5 min

// ============================================================================
// Helpers
// ============================================================================

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  // Conservador: não usamos zod aqui pra evitar dep extra nesta camada
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function toSummary(row: {
  id: string;
  email: string;
  wave: number;
  status: InviteStatus;
  expiresAt: Date;
  sentAt: Date | null;
  openedAt: Date | null;
  acceptedAt: Date | null;
  inviterId: string | null;
  createdAt: Date;
  token: string;
}): InviteSummary {
  // hashDisplay aqui serve para identificar (não vaza segredo pois token no DB
  // já é o hash, não o plaintext)
  const display = `${row.token.slice(0, 4)}…${row.token.slice(-4)}`;
  return {
    id: row.id,
    email: row.email,
    wave: row.wave,
    status: row.status,
    expiresAt: row.expiresAt,
    sentAt: row.sentAt,
    openedAt: row.openedAt,
    acceptedAt: row.acceptedAt,
    inviterId: row.inviterId,
    createdAt: row.createdAt,
    tokenDisplay: display,
  };
}

// ============================================================================
// Criação
// ============================================================================

/**
 * Cria um convite beta. Gera token novo, aplica dedupe de 5 min, e devolve
 * o plaintext junto com o summary. Se dryRun=false, status fica PENDING
 * (caller dispara o envio de email); se true, status já é SENT com sentAt
 * preenchido (uso em batch assíncrono).
 */
export async function createInvite(
  input: CreateInviteInput
): Promise<CreateInviteResult> {
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) return { ok: false, reason: 'invalid_email' };
  if (![1, 2, 3].includes(input.wave)) {
    return { ok: false, reason: 'invalid_wave' };
  }

  const { plaintext, hash } = generateInviteToken();
  const expiresAt = new Date(
    Date.now() + getExpiresInDays(input.wave) * 24 * 60 * 60 * 1000
  );

  // Dedupe: se já existe convite PENDING/SENT/OPENED para o mesmo (email, wave)
  // criado há menos de DEDUPE_WINDOW_MS, retorna o existente em vez de duplicar
  const recent = await prisma.betaInvite.findFirst({
    where: {
      email,
      wave: input.wave,
      status: { in: ['PENDING', 'SENT', 'OPENED'] },
      createdAt: { gte: new Date(Date.now() - DEDUPE_WINDOW_MS) },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (recent) {
    return { ok: false, reason: 'duplicate_pending' };
  }

  try {
    const created = await prisma.betaInvite.create({
      data: {
        email,
        token: hash,
        wave: input.wave,
        status: input.dryRun ? 'SENT' : 'PENDING',
        expiresAt,
        inviterId: input.inviterId ?? null,
        metadata: input.metadata ?? undefined,
        sentAt: input.dryRun ? new Date() : null,
      },
    });

    // Audit (LGPD Art. 37 — registro de operação de tratamento)
    await logAudit({
      action: 'ADMIN_USER_BAN', // reusado: invite creation = admin op
      actorId: input.inviterId ?? null,
      targetId: created.id,
      metadata: {
        kind: 'beta_invite_created',
        wave: input.wave,
        emailHash: hash.slice(0, 12),
        dryRun: Boolean(input.dryRun),
      },
    });

    return {
      ok: true,
      invite: toSummary(created),
      plaintextToken: plaintext,
    };
  } catch (err) {
    console.error('[beta][createInvite] DB error', {
      emailHash: hash.slice(0, 12),
      wave: input.wave,
      error: err instanceof Error ? err.message : 'unknown',
    });
    return { ok: false, reason: 'db_error' };
  }
}

/**
 * Marca convite como SENT após email dispatch bem-sucedido.
 */
export async function markInviteSent(inviteId: string): Promise<void> {
  await prisma.betaInvite.update({
    where: { id: inviteId },
    data: { status: 'SENT', sentAt: new Date() },
  });
}

/**
 * Tracking de abertura (pixel 1x1 chamado pelo client de email).
 * Idempotente — só avança se ainda não abriu.
 */
export async function markInviteOpened(tokenHash: string): Promise<void> {
  await prisma.betaInvite.updateMany({
    where: { token: tokenHash, status: 'SENT' },
    data: { status: 'OPENED', openedAt: new Date() },
  });
}

// ============================================================================
// Verificação
// ============================================================================

export type VerifyResult =
  | {
      ok: true;
      invite: InviteSummary;
      expiredSoon: boolean;
    }
  | {
      ok: false;
      reason: 'not_found' | 'invalid_token' | 'expired' | 'revoked' | 'consumed';
    };

/**
 * Verifica se um plaintextToken é válido e está em estado utilizável.
 * Não muta o estado — só leitura. Usado pela landing page /convite/[token].
 */
export async function verifyInvite(plaintextToken: string): Promise<VerifyResult> {
  if (!plaintextToken || plaintextToken.length < 32) {
    return { ok: false, reason: 'invalid_token' };
  }

  // Tentar encontrar convite cujo hash bate com o plaintext
  // Estratégia: scan de candidatos por wave (índice em token) é O(1).
  // Como armazenamos o hash, precisamos computar HMAC e comparar — não dá
  // para query direto. Solução: tentar os 3 primeiros convites recentes
  // em batches é ruim. Em vez disso, aceitamos a limitação: armazenamos
  // também um prefixo de 8 chars do hash (idx_token_prefix) — mas isso
  // adiciona coluna. Workaround Wave 32: scan limitado via window de tempo
  // (90 dias) + índice composto. Ver `findInviteByPlaintext` abaixo.
  const candidates = await prisma.betaInvite.findMany({
    where: {
      status: { in: ['PENDING', 'SENT', 'OPENED', 'ACCEPTED', 'EXPIRED', 'REVOKED'] },
      createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
    select: {
      id: true,
      email: true,
      wave: true,
      status: true,
      expiresAt: true,
      sentAt: true,
      openedAt: true,
      acceptedAt: true,
      inviterId: true,
      createdAt: true,
      token: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200, // limite prático — ver nota em NOTES abaixo
  });

  // Falha fechada: se houver > 200 candidatos, os mais antigos não são
  // alcançáveis. Para Wave 32 (50 vagas / 3 ondas) isso não é problema.
  // Para escala maior, considerar índice `token_prefix` separado.
  for (const row of candidates) {
    const v = validateInviteToken(plaintextToken, row.token);
    if (v.ok) {
      // Status check
      if (row.status === 'ACCEPTED') return { ok: false, reason: 'consumed' };
      if (row.status === 'REVOKED') return { ok: false, reason: 'revoked' };
      if (row.status === 'EXPIRED' || row.expiresAt.getTime() < Date.now()) {
        return { ok: false, reason: 'expired' };
      }
      const msToExpiry = row.expiresAt.getTime() - Date.now();
      const expiredSoon = msToExpiry < 24 * 60 * 60 * 1000; // < 24h
      return { ok: true, invite: toSummary(row), expiredSoon };
    }
  }
  return { ok: false, reason: 'not_found' };
}

// ============================================================================
// Aceite
// ============================================================================

/**
 * Aceita o convite: marca ACCEPTED, vincula userId, idempotente.
 * Deve ser chamado DEPOIS do signup (que cria o User no Supabase + DB).
 */
export async function acceptInvite(
  input: AcceptInviteInput
): Promise<AcceptResult> {
  const v = await verifyInvite(input.plaintextToken);
  if (!v.ok) {
    // Mapeia motivos
    if (v.reason === 'not_found' || v.reason === 'invalid_token') {
      return { ok: false, reason: 'invalid_token' };
    }
    if (v.reason === 'expired') return { ok: false, reason: 'expired' };
    if (v.reason === 'revoked') return { ok: false, reason: 'revoked' };
    return { ok: false, reason: 'invalid_token' };
  }

  // Confirma que user existe
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, email: true },
  });
  if (!user) return { ok: false, reason: 'user_not_found' };

  // Single-use atomic — updateMany com filtro de status garante que
  // duas chamadas concorrentes não aceitam duas vezes
  const updated = await prisma.betaInvite.updateMany({
    where: {
      id: v.invite.id,
      status: { in: ['PENDING', 'SENT', 'OPENED'] },
    },
    data: {
      status: 'ACCEPTED',
      acceptedAt: new Date(),
      userId: input.userId,
    },
  });

  if (updated.count === 0) {
    // Outro processo já consumiu
    return { ok: false, reason: 'already_accepted' };
  }

  await logAudit({
    action: 'CONSENT_GRANTED', // aceite = consentimento de entrada na beta
    actorId: input.userId,
    targetId: v.invite.id,
    metadata: {
      kind: 'beta_invite_accepted',
      wave: v.invite.wave,
      tokenHash: v.invite.tokenDisplay,
    },
  });

  const fresh = await prisma.betaInvite.findUnique({
    where: { id: v.invite.id },
  });
  if (!fresh) return { ok: false, reason: 'invalid_token' };

  return {
    ok: true,
    invite: toSummary(fresh),
    userId: input.userId,
  };
}

// ============================================================================
// Revogação
// ============================================================================

/**
 * Revoga um convite (admin only). Idempotente.
 */
export async function revokeInvite(
  inviteId: string,
  actorId: string,
  reason?: string
): Promise<{ ok: boolean; reason?: 'not_found' | 'already_consumed' | 'db_error' }> {
  const existing = await prisma.betaInvite.findUnique({
    where: { id: inviteId },
    select: { id: true, status: true, token: true },
  });
  if (!existing) return { ok: false, reason: 'not_found' };
  if (existing.status === 'ACCEPTED') {
    return { ok: false, reason: 'already_consumed' };
  }
  try {
    await prisma.betaInvite.update({
      where: { id: inviteId },
      data: { status: 'REVOKED' },
    });
    await logAudit({
      action: 'ADMIN_USER_BAN', // reusado
      actorId,
      targetId: inviteId,
      metadata: {
        kind: 'beta_invite_revoked',
        reason: reason ?? null,
        prevStatus: existing.status,
      },
    });
    return { ok: true };
  } catch (err) {
    console.error('[beta][revokeInvite]', err);
    return { ok: false, reason: 'db_error' };
  }
}

// ============================================================================
// Listagem (admin)
// ============================================================================

export interface ListInvitesFilters {
  wave?: Wave;
  status?: InviteStatus;
  emailContains?: string;
  limit?: number;
  cursor?: string;
}

export async function listInvites(
  filters: ListInvitesFilters
): Promise<{ items: InviteSummary[]; nextCursor: string | null; total: number }> {
  const limit = Math.min(filters.limit ?? 50, 200);
  const items = await prisma.betaInvite.findMany({
    where: {
      ...(filters.wave ? { wave: filters.wave } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.emailContains
        ? { email: { contains: filters.emailContains.toLowerCase() } }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(filters.cursor ? { cursor: { id: filters.cursor }, skip: 1 } : {}),
  });
  const hasMore = items.length > limit;
  const sliced = hasMore ? items.slice(0, limit) : items;
  const total = await prisma.betaInvite.count({
    where: {
      ...(filters.wave ? { wave: filters.wave } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
  });
  return {
    items: sliced.map(toSummary),
    nextCursor: hasMore ? sliced[sliced.length - 1]!.id : null,
    total,
  };
}

// ============================================================================
// Stats (admin dashboard)
// ============================================================================

export interface BetaStats {
  total: number;
  byStatus: Record<InviteStatus, number>;
  byWave: Record<Wave, number>;
  conversionRate: number; // ACCEPTED / SENT
  acceptedThisWeek: number;
}

export async function getBetaStats(): Promise<BetaStats> {
  const [byStatusRows, byWaveRows, sentCount, acceptedCount, acceptedRecent] =
    await Promise.all([
      prisma.betaInvite.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.betaInvite.groupBy({
        by: ['wave'],
        _count: { _all: true },
      }),
      prisma.betaInvite.count({ where: { status: { in: ['SENT', 'OPENED', 'ACCEPTED'] } } }),
      prisma.betaInvite.count({ where: { status: 'ACCEPTED' } }),
      prisma.betaInvite.count({
        where: {
          status: 'ACCEPTED',
          acceptedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

  const byStatus = {
    PENDING: 0,
    SENT: 0,
    OPENED: 0,
    ACCEPTED: 0,
    EXPIRED: 0,
    REVOKED: 0,
  } as Record<InviteStatus, number>;
  for (const row of byStatusRows) {
    byStatus[row.status] = row._count._all;
  }

  const byWave = { 1: 0, 2: 0, 3: 0 } as Record<Wave, number>;
  for (const row of byWaveRows) {
    if (row.wave === 1 || row.wave === 2 || row.wave === 3) {
      byWave[row.wave] = row._count._all;
    }
  }

  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const conversionRate = sentCount > 0 ? acceptedCount / sentCount : 0;

  return {
    total,
    byStatus,
    byWave,
    conversionRate,
    acceptedThisWeek: acceptedRecent,
  };
}

// ============================================================================
// Expiração batch (cron)
// ============================================================================

/**
 * Move convites SENT/OPENED cujo expiresAt passou para EXPIRED.
 * Usado por cron diário. Idempotente.
 */
export async function expireOverdueInvites(now: Date = new Date()): Promise<number> {
  const result = await prisma.betaInvite.updateMany({
    where: {
      status: { in: ['PENDING', 'SENT', 'OPENED'] },
      expiresAt: { lt: now },
    },
    data: { status: 'EXPIRED' },
  });
  return result.count;
}