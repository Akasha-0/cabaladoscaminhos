/**
 * Privacy consent application layer — Wave 19.3.
 *
 * Helper central para ler/escrever decisões de consentimento do usuário.
 * Usado por:
 *   - API route GET/PATCH `/api/account/privacy` — UI /conta/privacidade.
 *   - API route POST `/api/akasha/auth/register` — defaults no signup.
 *
 * Trade-off fundamental vs NotificationPreference (Wave 18.2):
 *
 *   ┌──────────────────────┬────────────────────────┬──────────────────────────┐
 *   │                      │ NotificationPreference │ PrivacyConsent (Wave 19) │
 *   ├──────────────────────┼────────────────────────┼──────────────────────────┤
 *   │ Modelo de storage    │ Upsert (mutável)       │ Append-only (imutável)   │
 *   │ LGPD Art. 37         │ ❌ não preserva hist.  │ ✅ trilha completa       │
 *   │ Linha por toggle     │ 1                      │ N (cada toggle = +1)      │
 *   │ Sobrevive ao delete  │ ❌ cascade             │ ✅ SEM FK (LGPD)          │
 *   └──────────────────────┴────────────────────────┴──────────────────────────┘
 *
 * Default behavior (LGPD Art. 7º, I — consentimento expresso):
 *   - MARKETING           = false (opt-in obrigatório)
 *   - ANALYTICS           = true  (legítimo interesse)
 *   - AI_TRAINING         = false (LGPD Art. 11 — dado sensível, opt-in estrito)
 *   - THIRD_PARTY_SHARING = false (opt-in estrito)
 *
 * Quem NÃO chama este helper: a UI (busca via API route; prefetch em
 * Server Component).
 */

import { prisma } from '@/lib/infrastructure/prisma';
import { getClientIpInfo } from '@/lib/infrastructure/security/ip-hash';
import type { PrivacyConsentType } from '@prisma/client';

// ─── Public types ─────────────────────────────────────────────────────────

/**
 * Lista canônica dos 4 tipos de consentimento suportados.
 *
 * Ordem reflete o que aparece na UI /conta/privacidade (mais relevante
 * primeiro: marketing é a pergunta mais comum; third_party por último).
 */
export const ALL_PRIVACY_CONSENT_TYPES: readonly PrivacyConsentType[] = [
  'MARKETING',
  'ANALYTICS',
  'AI_TRAINING',
  'THIRD_PARTY_SHARING',
] as const;

/**
 * DTO serializado que a API retorna. Mesma forma do model mas com tipos
 * serializáveis (Date → ISO string) para passar pelo Server Component
 * boundary sem hydration warnings.
 *
 * Representa a ÚLTIMA decisão do usuário por tipo (estado vigente).
 * O histórico completo (audit trail) fica em `getUserConsentHistory()`.
 */
export interface PrivacyConsentStateDTO {
  type: PrivacyConsentType;
  granted: boolean;
  /** ISO 8601 do momento da última decisão (grant ou revoke). */
  decidedAt: string;
}

/**
 * DTO de uma entrada do histórico (audit trail imutável).
 */
export interface PrivacyConsentHistoryEntryDTO {
  id: string;
  type: PrivacyConsentType;
  granted: boolean;
  decidedAt: string;
}

/**
 * Defaults aplicados no signup (LGPD Art. 7º, I).
 *
 * IMPORTANTE: este map é a fonte canônica dos defaults no registro. Tanto
 * o helper `getDefaultConsents()` quanto a rota de register consultam-no.
 * Mudar aqui propaga para ambos.
 */
export const DEFAULT_SIGNUP_CONSENTS: Readonly<
  Record<PrivacyConsentType, boolean>
> = {
  MARKETING: false,
  ANALYTICS: true,
  AI_TRAINING: false,
  THIRD_PARTY_SHARING: false,
} as const;

// ─── Read ─────────────────────────────────────────────────────────────────

/**
 * Lê o estado VIGENTE de consentimento do usuário (última decisão por tipo).
 *
 * Algoritmo:
 *   1. Para cada tipo em ALL_PRIVACY_CONSENT_TYPES:
 *      a. Pega a row mais recente (grantedAt DESC, tie-break id DESC).
 *      b. Se existe → granted = row.granted.
 *      c. Se NÃO existe → granted = DEFAULT_SIGNUP_CONSENTS[type].
 *
 * Performance: 1 query `findMany` (não 4). Agrupa em memória.
 *
 * Edge case: user nunca persistiu nenhuma decisão → retorna os defaults
 * de signup (LGPD Art. 7º — defaults sensatos no primeiro contato).
 */
export async function getUserConsentState(
  userId: string
): Promise<PrivacyConsentStateDTO[]> {
  if (!userId) {
    throw new Error('userId é obrigatório');
  }

  const rows = await prisma.privacyConsent.findMany({
    where: { userId },
    orderBy: [{ grantedAt: 'desc' }, { id: 'desc' }],
    select: { type: true, granted: true, grantedAt: true },
  });

  // Index por type para merge O(1). O orderBy garante que a primeira row
  // encontrada (for...of) é a mais recente para aquele type.
  const seen = new Set<PrivacyConsentType>();
  const latest = new Map<PrivacyConsentType, { granted: boolean; grantedAt: Date }>();

  for (const r of rows) {
    if (seen.has(r.type)) continue;
    seen.add(r.type);
    latest.set(r.type, { granted: r.granted, grantedAt: r.grantedAt });
  }

  return ALL_PRIVACY_CONSENT_TYPES.map((type) => {
    const row = latest.get(type);
    if (row) {
      return {
        type,
        granted: row.granted,
        decidedAt: row.grantedAt.toISOString(),
      };
    }
    // Sem decisão prévia → default de signup (LGPD Art. 7º).
    return {
      type,
      granted: DEFAULT_SIGNUP_CONSENTS[type],
      // epoch zero indica "estado de default, nunca decidido pelo user".
      decidedAt: '1970-01-01T00:00:00.000Z',
    };
  });
}

/**
 * Lê o histórico (audit trail) de decisões do usuário, mais recente primeiro.
 *
 * Limit default: 50 (cobre ~3 meses de toggles para o usuário mais ativo).
 * LIMIT 200 — acima disso, paginação deveria ser adicionada.
 *
 * Uso: UI /conta/privacidade "Histórico de decisões".
 */
export async function getUserConsentHistory(
  userId: string,
  limit = 50
): Promise<PrivacyConsentHistoryEntryDTO[]> {
  if (!userId) {
    throw new Error('userId é obrigatório');
  }
  if (limit < 1 || limit > 200) {
    throw new Error('limit deve estar entre 1 e 200');
  }

  const rows = await prisma.privacyConsent.findMany({
    where: { userId },
    orderBy: [{ grantedAt: 'desc' }, { id: 'desc' }],
    take: limit,
    select: { id: true, type: true, granted: true, grantedAt: true },
  });

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    granted: r.granted,
    decidedAt: r.grantedAt.toISOString(),
  }));
}

// ─── Write ────────────────────────────────────────────────────────────────

/**
 * Parâmetros para registrar uma decisão de consentimento.
 *
 * `request` é usado APENAS para extrair IP hash + user agent (LGPD Art. 37
 * — contexto da coleta). Em testes, pode-se omitir e passar os campos
 * diretamente.
 */
export interface RecordConsentDecisionInput {
  userId: string;
  type: PrivacyConsentType;
  granted: boolean;
  ipHash: string;
  userAgent: string;
}

/**
 * Helper que extrai IP hash + user agent de um NextRequest.
 * Garante consistência entre register (signup) e PATCH /privacy (toggle).
 */
export function extractConsentContext(
  request: { headers: { get(name: string): string | null } }
): { ipHash: string; userAgent: string } {
  const { hash: ipHash } = getClientIpInfo(request);
  const userAgent = request.headers.get('user-agent') ?? 'unknown';
  return { ipHash, userAgent };
}

/**
 * Registra UMA decisão de consentimento — APPEND-ONLY.
 *
 * NUNCA atualiza uma row existente. Cada chamada cria uma nova row no
 * audit trail (LGPD Art. 37 — registro das operações de tratamento).
 *
 * @returns DTO da decisão recém-criada (com id e timestamp do banco).
 */
export async function recordConsentDecision(
  input: RecordConsentDecisionInput
): Promise<PrivacyConsentHistoryEntryDTO> {
  if (!input.userId) throw new Error('userId é obrigatório');
  if (!ALL_PRIVACY_CONSENT_TYPES.includes(input.type)) {
    throw new Error(`type inválido: ${input.type}`);
  }
  if (!input.ipHash) throw new Error('ipHash é obrigatório (LGPD)');
  if (!input.userAgent) throw new Error('userAgent é obrigatório (LGPD)');

  const created = await prisma.privacyConsent.create({
    data: {
      userId: input.userId,
      type: input.type,
      granted: input.granted,
      ipHash: input.ipHash,
      userAgent: input.userAgent,
    },
    select: {
      id: true,
      type: true,
      granted: true,
      grantedAt: true,
    },
  });

  return {
    id: created.id,
    type: created.type,
    granted: created.granted,
    decidedAt: created.grantedAt.toISOString(),
  };
}

/**
 * Atalho para signup: cria os 4 defaults de uma vez (batch insert).
 *
 * Performance: 1 `createMany` (não 4 inserts). Idempotência: se chamado
 * duas vezes (race condition), gera 8 rows — esperado, é audit trail.
 *
 * Quem chama: `apps/akasha-portal/src/app/api/akasha/auth/register/route.ts`
 * (Wave 19.3 modificou essa rota para criar os defaults no signup).
 */
export async function recordDefaultConsents(
  userId: string,
  context: { ipHash: string; userAgent: string }
): Promise<{ inserted: number }> {
  if (!userId) throw new Error('userId é obrigatório');
  if (!context.ipHash) throw new Error('ipHash é obrigatório (LGPD)');
  if (!context.userAgent) throw new Error('userAgent é obrigatório (LGPD)');

  const data = ALL_PRIVACY_CONSENT_TYPES.map((type) => ({
    userId,
    type,
    granted: DEFAULT_SIGNUP_CONSENTS[type],
    ipHash: context.ipHash,
    userAgent: context.userAgent,
  }));

  const result = await prisma.privacyConsent.createMany({ data });
  return { inserted: result.count };
}

/**
 * Helper para checar rapidamente se um user tem um consentimento ATIVO.
 * (Última decisão do tipo é `granted: true`.)
 *
 * Quem chama (futuro): gate de features — ex: bloqueia envio de marketing
 * email se `MARKETING` está revogado.
 */
export async function isConsentGranted(
  userId: string,
  type: PrivacyConsentType
): Promise<boolean> {
  if (!userId) return false;
  if (!ALL_PRIVACY_CONSENT_TYPES.includes(type)) return false;

  const row = await prisma.privacyConsent.findFirst({
    where: { userId, type },
    orderBy: [{ grantedAt: 'desc' }, { id: 'desc' }],
    select: { granted: true },
  });

  if (row) return row.granted;
  // Sem row → default de signup
  return DEFAULT_SIGNUP_CONSENTS[type];
}