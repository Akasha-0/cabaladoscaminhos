/**
 * Audit Log — Wave 8.3 (LGPD Art. 18 + Art. 37) + Wave 14.5 (persistência).
 *
 * Dual-write desde Wave 14.5:
 *  1. INSERT em `audit_logs` (PostgreSQL via Prisma) — queryable pelo
 *     painel /admin/audit-logs. LGPD Art. 37 (demonstrabilidade).
 *  2. Stdout NDJSON (Wave 8.3 stub) — para log pipelines externos
 *     (Loki, Datadog, CloudWatch). Defesa em profundidade.
 *
 * Trade-off (mantido de Wave 8.3):
 *  - Falha no audit log NUNCA bloqueia a ação principal. Cai pro stdout
 *    fallback + warning. Trade-off: priorizamos disponibilidade sobre
 *    rastreabilidade perfeita.
 *
 * LGPD Art. 33:
 *  - IP NUNCA aparece em texto puro. `ipHash` é HMAC-SHA256(JWT_SECRET, IP)
 *    em prod, SHA-256 puro em dev (apenas inspeção local).
 *  - `metadata` é JSON estruturado. NÃO deve conter PII direta
 *    (email, phone, birthDate). Redaction acontece na leitura
 *    (API /admin/audit-logs).
 *
 * Decisão Wave 14.5: assinatura mudou de sync → async.
 *  - 3 callers no monorepo (`conexoes`, `profile/[id]`, `profile/export`)
 *    já em server actions/routes, `await` trivial.
 *  - DB INSERT pode falhar (connection down) — não bloqueia caller.
 */

import { createHash, createHmac } from 'node:crypto';
import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';

export type AuditAction =
  | 'profile_delete_requested'
  | 'profile_delete_completed'
  | 'profile_delete_failed'
  | 'profile_export_requested'
  | 'profile_export_completed'
  | 'conexao_third_party_consent_declarado'
  | 'consent_updated';

export interface AuditLogEntry {
  ts: string; // ISO 8601 UTC
  action: AuditAction;
  userId: string | null;
  requestId?: string;
  ipHash?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Input para `auditLog()` — todos os campos opcionais exceto `action`.
 * `ts` é gerado internamente; `ipHash` é derivado no caller via `hashIpForAudit`.
 */
export interface AuditLogInput {
  action: AuditAction;
  userId?: string | null;
  requestId?: string;
  ipHash?: string;
  metadata?: Record<string, unknown>;
}

/**
 * LGPD Art. 33 — IP hashing para audit log.
 *
 * Estratégia:
 *  - Prod (com JWT_SECRET): HMAC-SHA256(JWT_SECRET, IP). Determinístico
 *    (mesmo IP → mesmo hash) sem reverter ao IP original.
 *  - Dev (sem JWT_SECRET): SHA-256 puro. Apenas para inspeção local.
 *    AVISO explícito no log para evitar confusão.
 *
 * NUNCA retorna o IP puro. Mesmo se chamado com input vazio, retorna
 * o hash de string vazia (que é um valor válido para "IP desconhecido").
 */
export function hashIpForAudit(ip: string | null | undefined): string {
  const safeIp = ip ?? '';
  const secret = process.env.JWT_SECRET;

  if (secret && secret.length >= 32) {
    return createHmac('sha256', secret).update(safeIp).digest('hex');
  }

  // Dev fallback: SHA-256 puro (sem salt). Inseguro para prod — auditoria
  // do código garante que prod sempre tem JWT_SECRET.
  // eslint-disable-next-line no-console
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[audit-log] JWT_SECRET ausente ou curto em prod — IP hash sem salt. ' +
        'Risco LGPD Art. 33.',
    );
  }
  return createHash('sha256').update(safeIp).digest('hex');
}

/**
 * Extrai IP do request respeitando x-forwarded-for / x-real-ip.
 * Nunca lança — retorna 'unknown' se headers ausentes.
 */
export function extractClientIp(headers: {
  get(name: string): string | null;
}): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  const real = headers.get('x-real-ip')?.trim();
  if (real) return real;
  return 'unknown';
}

/**
 * Persiste uma entrada de auditoria.
 *
 * Comportamento (Wave 14.5):
 *  1. Tenta INSERT em `audit_logs`. Em sucesso, retorna.
 *  2. Em falha (Prisma error, DB down, model ainda não aplicado):
 *     - loga warning
 *     - emite NDJSON em stdout (fallback Wave 8.3)
 *     - NÃO lança — caller continua.
 *  3. Sempre emite NDJSON em stdout após o INSERT bem-sucedido
 *     (defesa em profundidade — log pipelines externos recebem mesmo
 *     quando DB está OK).
 *
 * NOTA: schema `audit_logs` é PROPOSAL D-047 (awaiting human approval).
 * Acessamos via dynamic field `(prisma as ...).auditLog` para que
 * typecheck NÃO falhe antes do `pnpm db:generate` rodar.
 */
export async function auditLog(entry: AuditLogInput): Promise<void> {
  const ts = new Date().toISOString();
  const fullEntry: AuditLogEntry = {
    ts,
    action: entry.action,
    userId: entry.userId ?? null,
    requestId: entry.requestId,
    ipHash: entry.ipHash,
    metadata: entry.metadata,
  };

  // 1. Tenta persistir no DB
  let dbPersisted = false;
  try {
    // Acesso dinâmico: `prisma.auditLog` só existe APÓS db:generate rodar
    // (que requer migration aplicada — D-047 awaiting approval).
    // Antes disso, este branch lança e cai pro fallback stdout.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaWithAudit = prisma as unknown as {
      auditLog: {
        create: (args: {
          data: {
            action: AuditAction;
            userId: string | null;
            ipHash: string | null;
            requestId: string | null;
            metadata: Prisma.InputJsonValue | null;
            createdAt: Date;
          };
        }) => Promise<unknown>;
      };
    };

    if (typeof prismaWithAudit.auditLog?.create === 'function') {
      await prismaWithAudit.auditLog.create({
        data: {
          action: entry.action,
          userId: entry.userId ?? null,
          ipHash: entry.ipHash ?? null,
          requestId: entry.requestId ?? null,
          metadata: (entry.metadata ?? null) as Prisma.InputJsonValue | null,
          createdAt: new Date(ts),
        },
      });
      dbPersisted = true;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      '[audit-log] DB persist failed, using stdout fallback:',
      err instanceof Error ? err.message : String(err),
    );
  }

  // 2. Stdout NDJSON (sempre — para log pipelines externos)
  // Mesmo em sucesso de DB, emitimos (defesa em profundidade).
  try {
    process.stdout.write(`[AUDIT] ${JSON.stringify(fullEntry)}\n`);
  } catch {
    // Serialização falhou (circular ref?) — silenciosamente engole.
    // O caller NÃO pode ser bloqueado por isso.
  }

  // Referência `dbPersisted` suprime warning de variável não-usada
  // quando o helper é extendido em testes.
  void dbPersisted;
}
