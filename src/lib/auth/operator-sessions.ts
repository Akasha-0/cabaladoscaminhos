// src/lib/auth/operator-sessions.ts
// Gestão de sessões do Operator (B2B) — Fase 13 + Fase 15 (refresh/rotação).
//
// Cada login cria DUAS OperatorSession:
//   - type=ACCESS  com hash do access token (curta duração, 15min)
//   - type=REFRESH com hash do refresh token (longa duração, 30d)
//
// O endpoint /refresh faz rotação: revoga o refresh usado e emite um
// novo par access+refresh. Detecção de reuso de refresh revogado →
// revoga TODAS as sessões do operator (sinal de roubo de cookie).
//
// Logout marca `revokedAt` (soft revoke) — preserva auditoria
// ("quem logou de onde, quando foi revogada") sem expor credenciais.
//
// Trade-off: 1 query extra em /api/operator/auth/me para verificar
// não-revogação. Cockpit B2B não é high-traffic, então OK.

import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import {
  OPERATOR_ACCESS_TTL_SECONDS,
  OPERATOR_REFRESH_TTL_SECONDS,
} from './operator-jwt';

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
// Tipos
// ============================================================================

/** Tipo da OperatorSession espelhando o enum Prisma (Fase 15). */
export type SessionType = 'ACCESS' | 'REFRESH';

// ============================================================================
// Operações básicas
// ============================================================================

/**
 * Cria uma OperatorSession para o token recém-emitido no login.
 * Retorna o `tokenHash` (útil para testes; o cliente usa o cookie).
 *
 * Use `createRefreshSession` para refresh tokens (Fase 15).
 */
export async function createSession(params: {
  operatorId: string;
  token: string;
  type?: SessionType;
  ipAddress?: string | null;
  userAgent?: string | null;
  /** Quando o token expira (unix ms). Default: agora + 15min (access). */
  expiresAt?: Date;
  /** (Fase 15) Quando o refresh correspondente expira. */
  refreshExpiresAt?: Date | null;
}): Promise<{ id: string; tokenHash: string }> {
  const tokenHash = hashOperatorToken(params.token);
  const type = params.type ?? 'ACCESS';
  const expiresAt =
    params.expiresAt ??
    new Date(Date.now() + OPERATOR_ACCESS_TTL_SECONDS * 1000);
  const refreshExpiresAt =
    params.refreshExpiresAt ??
    (type === 'REFRESH'
      ? new Date(Date.now() + OPERATOR_REFRESH_TTL_SECONDS * 1000)
      : null);

  const session = await prisma.operatorSession.create({
    data: {
      operatorId: params.operatorId,
      tokenHash,
      type,
      expiresAt,
      refreshExpiresAt,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    },
    select: { id: true },
  });

  return { id: session.id, tokenHash };
}

// ============================================================================
// Fase 15 — Refresh / Rotação
// ============================================================================

/**
 * Cria OperatorSession de tipo REFRESH.
 * Use no login junto com `createSession({ type: 'ACCESS' })`.
 */
export async function createRefreshSession(params: {
  operatorId: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  /** Quando o refresh expira. Default: agora + 30d. */
  expiresAt?: Date;
}): Promise<{ id: string; tokenHash: string }> {
  return createSession({
    operatorId: params.operatorId,
    token: params.token,
    type: 'REFRESH',
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    expiresAt:
      params.expiresAt ??
      new Date(Date.now() + OPERATOR_REFRESH_TTL_SECONDS * 1000),
    refreshExpiresAt:
      params.expiresAt ??
      new Date(Date.now() + OPERATOR_REFRESH_TTL_SECONDS * 1000),
  });
}

/**
 * Verifica se uma refresh session está ativa (existe, não revogada, não
 * expirada). Usado pelo endpoint /refresh antes de rotacionar.
 */
export async function isRefreshSessionActive(token: string): Promise<boolean> {
  const tokenHash = hashOperatorToken(token);
  const session = await prisma.operatorSession.findUnique({
    where: { tokenHash },
    select: {
      type: true,
      expiresAt: true,
      refreshExpiresAt: true,
      revokedAt: true,
    },
  });

  if (!session) return false;
  if (session.type !== 'REFRESH') return false;
  if (session.revokedAt !== null) return false;
  // Usa refreshExpiresAt (pode ser diferente de expiresAt no futuro).
  const expiry = session.refreshExpiresAt ?? session.expiresAt;
  if (expiry.getTime() < Date.now()) return false;

  return true;
}

/**
 * Resultado da tentativa de refresh.
 *
 *   - 'ok'             → rotação bem-sucedida, novos tokens emitidos
 *   - 'invalid'        → token não é REFRESH válido (404, 401)
 *   - 'reuse-detected' → token REFRESH foi revogado, sinal de roubo
 *                        (revogou TODAS as sessões do operator)
 */
export type RotateResult =
  | { kind: 'ok'; operatorId: string; newAccessToken: string; newRefreshToken: string }
  | { kind: 'invalid' }
  | { kind: 'reuse-detected' };


/**
 * Helper para gerar novo par access+refresh. Recebe o operator (com
 * id+role) e retorna os tokens assinados — usado tanto em rotação
 * quanto em criação inicial (login).
// fallow-ignore-next-line unused-export
export async function issueNewTokenPair(operator: {
  id: string;
  role: 'OPERATOR' | 'ADMIN';
}): Promise<{ accessToken: string; refreshToken: string }> {
  const { signOperatorAccessToken, signOperatorRefreshToken } = await import('./operator-jwt');
  return {
    accessToken: signOperatorAccessToken(operator),
    refreshToken: signOperatorRefreshToken(operator),
  };
}

/**
 * Rotaciona o refresh token: revoga o refresh usado e emite um novo
 * par access+refresh. Detecta reuso de refresh revogado → revoga
 * TODAS as sessões do operator.
 *
 * Fluxo:
 *   1) Hash do token recebido
 *   2) Procura session por tokenHash
 *   3) Se não existe / não é REFRESH / expirou → invalid
 *   4) Se está revogada → reuse-detected (revoga tudo)
 *   5) Caso contrário → revoga o refresh, emite novo par, retorna ok
 */
export async function rotateRefreshToken(params: {
  refreshToken: string;
  signAccess: (operator: { id: string; role: 'OPERATOR' | 'ADMIN' }) => string;
  signRefresh: (operator: { id: string; role: 'OPERATOR' | 'ADMIN' }) => string;
  loadOperator: (id: string) => Promise<{ id: string; role: 'OPERATOR' | 'ADMIN' } | null>;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<RotateResult> {
  const tokenHash = hashOperatorToken(params.refreshToken);

  // 1) Procura a refresh session pelo hash
  const session = await prisma.operatorSession.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      operatorId: true,
      type: true,
      expiresAt: true,
      refreshExpiresAt: true,
      revokedAt: true,
    },
  });

  // 2) Não existe OU não é REFRESH OU expirou → invalid
  if (!session) return { kind: 'invalid' };
  if (session.type !== 'REFRESH') return { kind: 'invalid' };
  const expiry = session.refreshExpiresAt ?? session.expiresAt;
  if (expiry.getTime() < Date.now()) {
    // Marca como revogada pra não confundir com reuso
    if (!session.revokedAt) {
      await prisma.operatorSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
    }
    return { kind: 'invalid' };
  }

  // 3) Refresh revogado → REUSO DETECTADO (roubo de cookie)
  if (session.revokedAt !== null) {
    await revokeAllOperatorSessions(session.operatorId);
    return { kind: 'reuse-detected' };
  }

  // 4) Carrega operator para emitir novo par
  const operator = await params.loadOperator(session.operatorId);
  if (!operator) return { kind: 'invalid' };

  // 5) Revoga a refresh atual + emite novo par
  const newAccess = params.signAccess(operator);
  const newRefresh = params.signRefresh(operator);

  // Em uma transação: revoga a antiga, cria novas
  await prisma.$transaction([
    prisma.operatorSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    }),
    prisma.operatorSession.create({
      data: {
        operatorId: operator.id,
        tokenHash: hashOperatorToken(newAccess),
        type: 'ACCESS',
        expiresAt: new Date(Date.now() + OPERATOR_ACCESS_TTL_SECONDS * 1000),
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
      select: { id: true },
    }),
    prisma.operatorSession.create({
      data: {
        operatorId: operator.id,
        tokenHash: hashOperatorToken(newRefresh),
        type: 'REFRESH',
        expiresAt: new Date(Date.now() + OPERATOR_REFRESH_TTL_SECONDS * 1000),
        refreshExpiresAt: new Date(Date.now() + OPERATOR_REFRESH_TTL_SECONDS * 1000),
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
      select: { id: true },
    }),
  ]);

  return {
    kind: 'ok',
    operatorId: operator.id,
    newAccessToken: newAccess,
    newRefreshToken: newRefresh,
  };
}

// ============================================================================
// Operações de verificação
// ============================================================================

/**
 * Verifica se um token está autorizado (existe, não expirado, não revogado).
 * Usado por `requireOperator` antes de retornar o Operator.
 */
export async function isSessionActive(token: string): Promise<boolean> {
  const tokenHash = hashOperatorToken(token);
  const session = await prisma.operatorSession.findUnique({
    where: { tokenHash },
    select: {
      type: true,
      expiresAt: true,
      refreshExpiresAt: true,
      revokedAt: true,
    },
  });

  if (!session) return false;
  if (session.revokedAt !== null) return false;
  // Access usa expiresAt, refresh usa refreshExpiresAt
  const expiry =
    session.type === 'REFRESH'
      ? session.refreshExpiresAt ?? session.expiresAt
      : session.expiresAt;
  if (expiry.getTime() < Date.now()) return false;

  return true;
}

// ============================================================================
// Operações de revogação
// ============================================================================

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
 * todos os dispositivos"). Útil para "minha conta foi comprometida"
 * e para detecção de reuso de refresh token (Fase 15).
 */
// fallow-ignore-next-line unused-export
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
// fallow-ignore-next-line unused-export
export async function cleanupExpiredSessions(olderThanDays = 30): Promise<{ count: number }> {
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
  const result = await prisma.operatorSession.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { refreshExpiresAt: { lt: new Date() } },
        { AND: [{ revokedAt: { not: null } }, { revokedAt: { lt: cutoff } }] },
      ],
    },
  });
  return { count: result.count };
}
