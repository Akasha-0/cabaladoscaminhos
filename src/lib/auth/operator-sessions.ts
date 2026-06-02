// src/lib/auth/operator-sessions.ts
// Gestão de sessões do Operator (B2B) — Fase 13.
//
// Cada login cria uma OperatorSession com o hash SHA-256 do JWT.
// Logout marca `revokedAt` (soft revoke) — preserva auditoria
// ("quem logou de onde, quando foi revogada") sem expor credenciais.
//
// Trade-off: 1 query extra em /api/operator/auth/me para verificar
// não-revogação. Cockpit B2B não é high-traffic, então OK.

import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { OPERATOR_TOKEN_TTL_SECONDS } from './operator-jwt';

// ============================================================================
// Hash do token
// ============================================================================

/**
 * Hash SHA-256 do JWT — usado como chave da OperatorSession.
 * NUNCA armazenar o token em si (risco de comprometimento do DB).
 */
export function hashOperatorToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ============================================================================
// Operações
// ============================================================================

/**
 * Cria uma OperatorSession para o token recém-emitido no login.
 * Retorna o `tokenHash` (útil para testes; o cliente usa o cookie).
 *
 * `meta` é opcional (ipAddress, userAgent) — coletados do request
 * no route handler.
 */
export async function createSession(params: {
  operatorId: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  /** Quando o token expira (unix ms). Default: agora + 7d (TTL do JWT). */
  expiresAt?: Date;
}): Promise<{ id: string; tokenHash: string }> {
  const tokenHash = hashOperatorToken(params.token);
  const expiresAt =
    params.expiresAt ?? new Date(Date.now() + OPERATOR_TOKEN_TTL_SECONDS * 1000);

  const session = await prisma.operatorSession.create({
    data: {
      operatorId: params.operatorId,
      tokenHash,
      expiresAt,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    },
    select: { id: true },
  });

  return { id: session.id, tokenHash };
}

/**
 * Verifica se um token está autorizado (existe, não expirado, não revogado).
 * Usado por `requireOperator` antes de retornar o Operator.
 */
export async function isSessionActive(token: string): Promise<boolean> {
  const tokenHash = hashOperatorToken(token);
  const session = await prisma.operatorSession.findUnique({
    where: { tokenHash },
    select: {
      expiresAt: true,
      revokedAt: true,
    },
  });

  if (!session) return false;
  if (session.revokedAt !== null) return false;
  if (session.expiresAt.getTime() < Date.now()) return false;

  return true;
}

/**
 * Revoga a sessão de um token (soft revoke — mantém o registro para
 * auditoria). Idempotente: revogar um token já revogado é no-op.
 */
export async function revokeSession(token: string): Promise<{ revoked: boolean }> {
  const tokenHash = hashOperatorToken(token);
  const session = await prisma.operatorSession.findUnique({
    where: { tokenHash },
    select: { id: true, revokedAt: true },
  });

  if (!session) return { revoked: false };
  if (session.revokedAt !== null) return { revoked: true }; // já estava revogada

  await prisma.operatorSession.update({
    where: { id: session.id },
    data: { revokedAt: new Date() },
  });

  return { revoked: true };
}

/**
 * Revoga TODAS as sessões ativas de um Operator (botão "sair de
 * todos os dispositivos"). Útil para "minha conta foi comprometida".
 */
export async function revokeAllOperatorSessions(operatorId: string): Promise<{ count: number }> {
  const result = await prisma.operatorSession.updateMany({
    where: { operatorId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return { count: result.count };
}

/**
 * Remove sessões já expiradas e/ou revogadas há mais de `olderThanDays`.
 * Útil como job de manutenção; não afeta a request hot path.
 */
export async function cleanupExpiredSessions(olderThanDays = 30): Promise<{ count: number }> {
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
  const result = await prisma.operatorSession.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { AND: [{ revokedAt: { not: null } }, { revokedAt: { lt: cutoff } }] },
      ],
    },
  });
  return { count: result.count };
}
