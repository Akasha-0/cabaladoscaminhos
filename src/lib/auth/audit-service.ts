// src/lib/auth/audit-service.ts
// Fase 21 — Persistent Security Audit Log.
//
// Fire-and-forget: callers nunca bloqueiam no insert de eventos de segurança.
// Errors são logged mas nunca propagam — o auth flow NUNCA pode falhar
// por causa do audit log.
//
// Por que fire-and-forget? O audit log é crítico para SRE e compliance,
// mas não pode ser um ponto de falha para o fluxo de autenticação.
// Se o DB estiver down, o auth continua funcionando normalmente.

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export type { SecurityEventType } from '@prisma/client';

/** Tipo de evento de segurança. Deve ser um dos valores do enum SecurityEventType. */
export type SecurityEventTypeValue =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'REFRESH_REUSE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'PASSWORD_CHANGED'
  | 'SESSION_REVOKED'
  | 'ACCOUNT_LOCKED';

export interface LogSecurityEventParams {
  /** Tipo de evento de segurança. */
  type: SecurityEventTypeValue;
  /** OperatorId quando disponível (null para eventos sem autenticação). */
  operatorId?: string;
  /** IP do cliente (extraído de x-forwarded-for ou x-real-ip). */
  ipAddress?: string;
  /** User-Agent do cliente. */
  userAgent?: string;
  /** Dados extras específicos do tipo de evento. */
  metadata?: Prisma.InputJsonValue;
}

/**
 * Registra um evento de segurança no banco de dados.
 *
 * Comportamento:
 *   - Fire-and-forget: Promise é criada mas não awaited pelo caller.
 *   - Erros são capturados e logged — nunca propagam.
 *   - Se o prisma client falhar (ex: DB down), o auth continua normalmente.
 *
 * Uso:
 *   // Nunca bloqueia o login
 *   logSecurityEvent({ type: 'LOGIN_SUCCESS', operatorId: op.id, ipAddress, userAgent });
 *
 *   // Erro não propaga — caller pode continuar normalmente
 *   logSecurityEvent({ type: 'LOGIN_FAILURE', ipAddress, userAgent, metadata: { emailAttempted } });
 */
export function logSecurityEvent(params: LogSecurityEventParams): void {
  // Fire-and-forget: não awaited pelo caller.
  // Esta função retorna void — o caller não pode depender do resultado.
  void persistSecurityEvent(params);
}

/**
 * Implementação interna — Promise que persiste o evento.
 * Erros são completamente absorvidos para não afetar o caller.
 */
async function persistSecurityEvent(params: LogSecurityEventParams): Promise<void> {
  try {
    await prisma.securityEvent.create({
      data: {
        type: params.type,
        operatorId: params.operatorId ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        // biome-ignore style/noExplicitAny: Prisma 7 JSON null type workaround
        metadata: params.metadata ?? (null as unknown as null),
      },
    });
  } catch (err) {
    // Log para diagnóstico, mas nunca deixa propagar.
    // O auth flow continua normalmente mesmo se o audit log falhar.
    console.error('[audit-service] failed to persist security event', {
      type: params.type,
      operatorId: params.operatorId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
