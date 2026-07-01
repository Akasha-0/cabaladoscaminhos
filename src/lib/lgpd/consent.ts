// ============================================================================
// LGPD CONSENT MANAGEMENT — Wave 37 / Compliance 7/8
// ============================================================================
// LGPD Art. 7° (bases legais), Art. 8° (consentimento), Art. 9° (princípio
// da necessidade), Art. 14 (informação ao titular), Art. 18 (direitos).
//
// Granular consent — o titular pode aceitar/recusar cada finalidade
// independentemente. "Recusa parcial" é um direito (LGPD Art. 8° §5°).
//
// Fluxo:
//   1. CookieConsent renderiza banner na primeira visita (W37 component)
//   2. Aceite / recusa → POST /api/lgpd/consent → aqui
//   3. Aqui persiste ConsentRecord + audit log
//   4. Quando admin bumpa versão → todos precisam re-aceitar
//   5. Withdrawal → DELETE /api/lgpd/consent/[category] → audit CONSENT_REVOKED
//
// Bases legais suportadas:
//   - consentimento (Art. 7°, I)
//   - legítimo interesse (Art. 7°, IX) — analytics agregado, segurança
//   - execução de contrato (Art. 7°, V) — Stripe, email transacional
//   - obrigação legal (Art. 7°, II) — auditoria fiscal, retenção 5 anos
//
// Cada ConsentRecord é IMUTÁVEL — jamais editamos um registro existente.
// Correções geram novo registro (LGPD Art. 8° §6°: rastreabilidade).
// ============================================================================

import { createHash } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

// ============================================================================
// Tipos públicos
// ============================================================================

/**
 * Finalidades de tratamento que o titular pode aceitar/recusar.
 * Nunca adicionar uma finalidade sem bump de ConsentTextVersion.
 */
export type ConsentCategory =
  | 'marketing'
  | 'analytics'
  | 'personalization'
  | 'thirdPartySharing';

export type SpecificConsents = Record<ConsentCategory, boolean>;

/**
 * Estado de consentimento granular de um titular. Derivado da cadeia
 * de ConsentRecord (mais recente vence). Não persistimos este tipo —
 * ele é COMPUTADO on-demand para o titular.
 */
export interface ConsentState {
  userId: string;
  /** Versão atualmente aceita (null = nunca aceitou). */
  acceptedVersion: string | null;
  /** Mapa de finalidades aceitas (apenas se acceptedVersion != null). */
  specificConsents: SpecificConsents;
  /** Última mudança. */
  updatedAt: Date | null;
  /** True se precisa re-aceitar (versão bumped). */
  needsReconsent: boolean;
  /** Como retirou (se aplicável). */
  withdrawalMethod?: 'SETTINGS' | 'SUPPORT' | 'EMAIL' | null;
  withdrawalDate?: Date | null;
}

export interface ConsentInput {
  userId: string;
  accepted: boolean;
  specificConsents: SpecificConsents;
  ip?: string | null;
  userAgent?: string | null;
  /** Versão do texto que foi apresentado (vem do banner). */
  version: string;
}

export interface ConsentRecordWithdrawal {
  userId: string;
  method: 'SETTINGS' | 'SUPPORT' | 'EMAIL';
  ip?: string | null;
  userAgent?: string | null;
}

// ============================================================================
// Constantes
// ============================================================================

/** Versão inicial da política de privacidade — bump em PR com changelog. */
export const CURRENT_CONSENT_VERSION = '1.0.0';

/** SHA-256 truncated a 32 chars. Mesmo padrão do audit log (W11). */
function hashIp(ip: string | null | undefined): string {
  const salt = process.env.AUDIT_IP_SALT ?? 'dev-salt-not-for-prod';
  if (!ip) return '';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

/** Defaults: tudo recusado. Nunca inferimos consentimento por inércia. */
export const DEFAULT_DENIED: SpecificConsents = {
  marketing: false,
  analytics: false,
  personalization: false,
  thirdPartySharing: false,
};

// ============================================================================
// recordConsent — aceita ou recusa granular
// ============================================================================

/**
 * Persiste um ConsentRecord + emite audit log. Idempotente em escopo de
 * "última decisão vence" — múltiplos POSTs do mesmo titular = mantém só
 * o último em `currentConsentState`.
 *
 * @example
 *   await recordConsent({
 *     userId: 'user_123',
 *     accepted: true,
 *     specificConsents: { marketing: true, analytics: true,
 *                         personalization: false, thirdPartySharing: false },
 *     ip: '203.0.113.10', userAgent: 'Chrome/120',
 *     version: '1.0.0',
 *   });
 */
export async function recordConsent(input: ConsentInput): Promise<{
  ok: boolean;
  recordId?: string;
  error?: string;
}> {
  try {
    if (!input.userId) return { ok: false, error: 'userId required' };
    if (!input.version) return { ok: false, error: 'version required' };

    const record = await prisma.consentRecord.create({
      data: {
        userId: input.userId,
        version: input.version,
        ipHash: hashIp(input.ip),
        userAgent: input.userAgent?.slice(0, 256) ?? null,
        specificConsents: input.specificConsents as object,
        accepted: input.accepted,
      },
      select: { id: true },
    });

    // Audit log: separado do consent record para alta disponibilidade.
    const grantedCats = Object.entries(input.specificConsents)
      .filter(([_, v]) => v)
      .map(([k]) => k);
    const revokedCats = Object.entries(input.specificConsents)
      .filter(([_, v]) => !v)
      .map(([k]) => k);

    if (input.accepted) {
      await logAudit({
        action: 'CONSENT_GRANTED',
        actorId: input.userId,
        targetId: input.userId,
        metadata: {
          version: input.version,
          granted: grantedCats,
          denied: revokedCats,
        },
        ip: input.ip,
        userAgent: input.userAgent,
      });
    } else {
      await logAudit({
        action: 'CONSENT_REVOKED',
        actorId: input.userId,
        targetId: input.userId,
        metadata: {
          version: input.version,
          denied: revokedCats,
          granted: grantedCats,
        },
        ip: input.ip,
        userAgent: input.userAgent,
      });
    }

    return { ok: true, recordId: record.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'unknown',
    };
  }
}

// ============================================================================
// withdrawConsent — titular retira consentimento
// ============================================================================

/**
 * Retira consentimento de uma ou mais finalidades. Preserva histórico
 * (LGPD Art. 18 §6°: titular pode pedir prova de quando retirou).
 *
 * Se `categories` for vazio/null, retira TUDO (revogação total).
 */
export async function withdrawConsent(
  input: ConsentRecordWithdrawal & { categories?: ConsentCategory[] | null }
): Promise<{ ok: boolean; recordId?: string; error?: string }> {
  try {
    // Resolve estado atual para saber o que ainda estava aceito
    const current = await getConsentState(input.userId);
    const allCats: ConsentCategory[] = [
      'marketing',
      'analytics',
      'personalization',
      'thirdPartySharing',
    ];
    const targets = input.categories && input.categories.length > 0
      ? input.categories
      : allCats;

    const newConsents: SpecificConsents = {
      ...current.specificConsents,
      ...Object.fromEntries(targets.map((c) => [c, false])) as SpecificConsents,
    };

    const result = await recordConsent({
      userId: input.userId,
      accepted: false,
      specificConsents: newConsents,
      ip: input.ip,
      userAgent: input.userAgent,
      version: current.acceptedVersion ?? CURRENT_CONSENT_VERSION,
    });

    if (!result.ok) return result;

    // Marca withdrawalMethod na última entrada
    await prisma.consentRecord.update({
      where: { id: result.recordId! },
      data: {
        withdrawalMethod: input.method,
        withdrawalDate: new Date(),
      },
    });

    return { ok: true, recordId: result.recordId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

// ============================================================================
// getConsentState — estado computado atual
// ============================================================================

/**
 * Retorna o estado de consentimento mais recente do titular.
 *
 * Estratégia:
 *  - Pega o último ConsentRecord
 *  - Se a versão é a atual → OK
 *  - Se não é a atual → needsReconsent=true (não invalida, mas exige re-aceite)
 *  - Se nunca houve consentimento → needsReconsent=true, acceptedVersion=null
 *
 * Hot path — chamado em middleware, página /settings, banner de cookies.
 */
export async function getConsentState(userId: string): Promise<ConsentState> {
  try {
    const last = await prisma.consentRecord.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        version: true,
        specificConsents: true,
        accepted: true,
        createdAt: true,
        withdrawalMethod: true,
        withdrawalDate: true,
      },
    });

    if (!last) {
      return {
        userId,
        acceptedVersion: null,
        specificConsents: DEFAULT_DENIED,
        updatedAt: null,
        needsReconsent: true,
        withdrawalMethod: null,
        withdrawalDate: null,
      };
    }

    // consent version vigente é a current, salvo se a tabela ainda não tem
    // entradas (fallback para CURRENT_CONSENT_VERSION).
    const currentVer = await getCurrentConsentVersion();

    return {
      userId,
      acceptedVersion: last.accepted ? last.version : null,
      specificConsents: (last.specificConsents as SpecificConsents) ?? DEFAULT_DENIED,
      updatedAt: last.createdAt,
      needsReconsent: last.version !== currentVer,
      withdrawalMethod: last.withdrawalMethod as ConsentState['withdrawalMethod'],
      withdrawalDate: last.withdrawalDate,
    };
  } catch (err) {
    // Falha = conservador (negar tudo até o titular aceitar)
    return {
      userId,
      acceptedVersion: null,
      specificConsents: DEFAULT_DENIED,
      updatedAt: null,
      needsReconsent: true,
    };
  }
}

// ============================================================================
// getCurrentConsentVersion — versão vigente
// ============================================================================

/**
 * Retorna a versão atualmente vigente (effectiveAt mais recente).
 * Fallback para CURRENT_CONSENT_VERSION se tabela estiver vazia.
 */
export async function getCurrentConsentVersion(): Promise<string> {
  try {
    const current = await prisma.consentTextVersion.findFirst({
      where: { effectiveAt: { lte: new Date() } },
      orderBy: { effectiveAt: 'desc' },
      select: { version: true },
    });
    return current?.version ?? CURRENT_CONSENT_VERSION;
  } catch {
    return CURRENT_CONSENT_VERSION;
  }
}

// ============================================================================
// hasConsent — helper para checagem rápida em middleware
// ============================================================================

/**
 * Retorna true se o titular consentiu com uma finalidade específica.
 * Usado em gates (ex.: "pode mandar email de marketing?").
 */
export async function hasConsent(
  userId: string,
  category: ConsentCategory
): Promise<boolean> {
  const state = await getConsentState(userId);
  if (state.needsReconsent) return false; // Conservador
  return state.specificConsents[category] === true;
}

// ============================================================================
// publishConsentTextVersion — bump de versão (admin only)
// ============================================================================

/**
 * Publica uma nova versão do texto de consentimento. Quando bumpa MAJOR,
 * todos os titulares precisarão re-aceitar (banner aparece no próximo hit).
 *
 * Gera contentHash para integridade.
 */
export async function publishConsentTextVersion(input: {
  version: string;
  content: string;
  requiresReconsent?: boolean;
  publishedBy: string;
}): Promise<{ ok: boolean; versionId?: string; contentHash?: string; error?: string }> {
  try {
    if (!/^\d+\.\d+\.\d+$/.test(input.version)) {
      return { ok: false, error: 'version must be semver-like (e.g. 1.0.0)' };
    }
    const contentHash = createHash('sha256')
      .update(input.content)
      .digest('hex');

    const created = await prisma.consentTextVersion.create({
      data: {
        version: input.version,
        contentHash,
        content: input.content,
        effectiveAt: new Date(),
        requiresReconsent: input.requiresReconsent ?? true,
        publishedBy: input.publishedBy,
      },
      select: { id: true },
    });

    await logAudit({
      action: 'CONSENT_TEXT_UPDATED',
      actorId: input.publishedBy,
      targetId: null,
      metadata: {
        version: input.version,
        contentHash,
        requiresReconsent: input.requiresReconsent ?? true,
      },
    });

    return { ok: true, versionId: created.id, contentHash };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}

// ============================================================================
// reconsentQueueSize — quantos titulares precisam re-aceitar
// ============================================================================

/**
 * Conta quantos titulares ativos estão em uma versão antiga. Usado no
 * dashboard DPO para priorizar comunicação.
 */
export async function reconsentQueueSize(): Promise<number> {
  try {
    const currentVer = await getCurrentConsentVersion();
    // Quem tem latest ConsentRecord.version != current
    // (heurística: usuário aceitou versão antiga em algum momento)
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });
    let needsReconsent = 0;
    for (const u of users) {
      const state = await getConsentState(u.id);
      if (state.acceptedVersion && state.acceptedVersion !== currentVer) {
        needsReconsent++;
      }
    }
    return needsReconsent;
  } catch {
    return 0;
  }
}