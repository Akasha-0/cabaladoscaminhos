// ============================================================================
// AUDIT LOG HELPER — Wave 11 / LGPD Art. 37
// ============================================================================
// Centraliza a escrita de eventos sensíveis para a tabela `audit_logs`.
//
// Por que existe:
//   - LGPD art. 37 exige registro de operações de tratamento (logs de
//     acesso, alteração, exclusão, exportação)
//   - OWASP A09 (Security Logging Failures) requer trilha para investigar
//     incidentes
//   - Direito do titular (art. 18) precisa de evidência de consentimento,
//     export e delete
//
// Convenção:
//   - `actorId` = quem fez (subject)
//   - `targetId` = sobre quem (para ações admin: actorId=admin, targetId=user)
//   - `metadata` = contexto técnico (sem PII). Use `ipHash` se precisar
//     correlacionar requests, **nunca** IP cru.
//   - Erros no log **nunca** quebram a request principal. LGPD e UX
//     pedem que um log falho não bloqueie o usuário.
// ============================================================================

import { headers } from 'next/headers';
import { createHash } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import type { AuditAction, Prisma } from '@prisma/client';

// ============================================================================
// Tipos
// ============================================================================

export interface AuditEvent {
  action: AuditAction;
  actorId?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  requestId?: string | null;
  /** IP cru (será hashed internamente; não persiste raw). */
  ip?: string | null;
  /** User-Agent (limpo a 256 chars). */
  userAgent?: string | null;
}

// ============================================================================
// Salt — usado para hash de IP. Em produção, defina AUDIT_IP_SALT via env.
// ============================================================================

const IP_SALT =
  process.env.AUDIT_IP_SALT ??
  (process.env.NODE_ENV === 'production'
    ? '__SET_AUDIT_IP_SALT_IN_PROD__'
    : 'dev-salt-not-for-prod');

function hashIp(ip: string): string {
  return createHash('sha256').update(`${IP_SALT}:${ip}`).digest('hex').slice(0, 32);
}

// ============================================================================
// Core: logAudit
// ============================================================================

/**
 * Persiste um evento de auditoria. **Não lança** em falha — retorna
 * `{ ok: false }` e loga no console. O fluxo principal do request
 * nunca deve quebrar por causa de log.
 *
 * @example
 *   await logAudit({
 *     action: 'LOGIN_SUCCESS',
 *     actorId: user.id,
 *     ip: request.headers.get('x-forwarded-for'),
 *     userAgent: request.headers.get('user-agent'),
 *   });
 */
export async function logAudit(
  event: AuditEvent
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const { action, actorId, targetId, metadata, requestId, ip, userAgent } = event;

    // Sanitiza metadata — remove chaves comuns que podem vazar PII por engano
    const sanitized: Record<string, unknown> = { ...(metadata ?? {}) };
    for (const k of ['password', 'token', 'sessionToken', 'email', 'cpf']) {
      if (k in sanitized) sanitized[k] = '[REDACTED]';
    }

    // Hash do IP em vez de armazenar cru (LGPD art. 46)
    if (ip) {
      sanitized.ipHash = hashIp(ip);
    }
    if (userAgent) {
      sanitized.userAgent = userAgent.slice(0, 256);
    }

    // Tenta extrair requestId do header se não foi passado
    let reqId = requestId ?? null;
    if (!reqId) {
      try {
        const h = await headers();
        reqId = h.get('x-request-id');
      } catch {
        // headers() só funciona em request context — fora dele, é null
      }
    }

    const row = await prisma.auditLog.create({
      data: {
        action,
        actorId: actorId ?? null,
        targetId: targetId ?? null,
        metadata: sanitized as Prisma.InputJsonValue,
        requestId: reqId ?? null,
      },
      select: { id: true },
    });

    return { ok: true, id: row.id };
  } catch (err) {
    // Falha nunca quebra o request — apenas loga
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[audit] logAudit failed:', { action: event.action, err });
    }
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

// ============================================================================
// Helpers semânticos — use estes em vez de chamar logAudit() cru
// ============================================================================

export const audit = {
  loginSuccess: (actorId: string, meta?: AuditEvent) =>
    logAudit({ action: 'LOGIN_SUCCESS', actorId, ...meta }),

  loginFail: (email: string, meta?: AuditEvent) =>
    // email vai em metadata como actorId=null + contexto
    logAudit({ action: 'LOGIN_FAIL', actorId: null, metadata: { emailHint: email.slice(0, 4) + '***' }, ...meta }),

  logout: (actorId: string, meta?: AuditEvent) =>
    logAudit({ action: 'LOGOUT', actorId, ...meta }),

  accountDeleteRequest: (actorId: string, meta?: AuditEvent) =>
    logAudit({ action: 'ACCOUNT_DELETE_REQUEST', actorId, targetId: actorId, ...meta }),

  accountDeleteConfirmed: (actorId: string, meta?: AuditEvent) =>
    logAudit({ action: 'ACCOUNT_DELETE_CONFIRMED', actorId, targetId: actorId, ...meta }),

  dataExport: (actorId: string, meta?: AuditEvent) =>
    logAudit({ action: 'DATA_EXPORT_REQUEST', actorId, targetId: actorId, ...meta }),

  dataExportDelivered: (actorId: string, meta?: AuditEvent) =>
    logAudit({ action: 'DATA_EXPORT_DELIVERED', actorId, targetId: actorId, ...meta }),

  consentGranted: (actorId: string | null, categories: string[], meta?: AuditEvent) =>
    logAudit({
      action: 'CONSENT_GRANTED',
      actorId,
      metadata: { categories },
      ...meta,
    }),

  consentRevoked: (actorId: string | null, categories: string[], meta?: AuditEvent) =>
    logAudit({
      action: 'CONSENT_REVOKED',
      actorId,
      metadata: { categories },
      ...meta,
    }),

  postCreated: (actorId: string, postId: string, meta?: AuditEvent) =>
    logAudit({ action: 'POST_CREATED', actorId, targetId: postId, ...meta }),

  commentCreated: (actorId: string, commentId: string, meta?: AuditEvent) =>
    logAudit({ action: 'COMMENT_CREATED', actorId, targetId: commentId, ...meta }),
};

// ============================================================================
// Retenção — função utilitária para job de purge (cron)
// ============================================================================

export interface RetentionConfig {
  authDays: number; // default 365
  lgpdDays: number; // default 730
}

export const DEFAULT_RETENTION: RetentionConfig = {
  authDays: 365,
  lgpdDays: 730,
};

/**
 * Remove audit logs mais antigos que o período de retenção.
 * Use em cron diário (Wave 11 backlog).
 */
export async function purgeOldAuditLogs(
  config: RetentionConfig = DEFAULT_RETENTION
): Promise<{ deleted: number; error?: string }> {
  try {
    const authCutoff = new Date(Date.now() - config.authDays * 24 * 60 * 60 * 1000);
    const lgpdCutoff = new Date(Date.now() - config.lgpdDays * 24 * 60 * 60 * 1000);

    // Auth/CONTENT = retenção curta; LGPD/ADMIN = retenção longa
    const result = await prisma.auditLog.deleteMany({
      where: {
        OR: [
          {
            action: {
              in: ['LOGIN_SUCCESS', 'LOGIN_FAIL', 'LOGOUT', 'POST_CREATED', 'POST_DELETED', 'COMMENT_CREATED', 'COMMENT_DELETED'],
            },
            createdAt: { lt: authCutoff },
          },
          {
            action: {
              in: ['DATA_EXPORT_REQUEST', 'DATA_EXPORT_DELIVERED', 'CONSENT_GRANTED', 'CONSENT_REVOKED', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_SUCCESS', 'ACCOUNT_DELETE_REQUEST', 'ACCOUNT_DELETE_CONFIRMED', 'ADMIN_USER_BAN', 'ADMIN_CONTENT_REMOVE'],
            },
            createdAt: { lt: lgpdCutoff },
          },
        ],
      },
    });

    return { deleted: result.count };
  } catch (err) {
    return { deleted: 0, error: err instanceof Error ? err.message : 'unknown' };
  }
}
