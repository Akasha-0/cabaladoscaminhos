// ============================================================================
// FEATURE FLAG EVALUATOR — getFlag / isFlagEnabled (Wave 20)
// ============================================================================
// Lógica de avaliação pública. Combina:
//   1. Definição da flag (registry imutável)
//   2. Override do storage (admin pode ligar/desligar/ajustar %)
//   3. Hash determinístico do userId (para percentage rollout)
//
// Uso server-side:
//   const enabled = await isFlagEnabled('onboarding-redesign-v2', userId);
//
// Uso client-side: ver @/hooks/use-flag (wrapper React deste módulo)
//
// Garantias:
//   - Determinístico: mesmo userId + mesma flag = mesmo resultado
//   - Fail-safe: erro de I/O → retorna defaultValue (nunca crasha)
//   - Auditável: o storage registra updatedBy + updatedAt
// ============================================================================

import { getFlagDefinition, type FeatureFlagDefinition } from './flags';
import { readFlags, type FlagState } from './storage';

// ============================================================================
// Hash determinístico (FNV-1a 32-bit) — estável entre runtimes
// ============================================================================

export function hashUserId(userId: string, salt: string): number {
  let hash = 0x811c9dc5;
  const input = `${salt}::${userId}`;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0; // unsigned 32-bit
}

/** Mapeia hash (0..2^32) para percentil 0-99 */
function hashToPercentile(hash: number): number {
  return hash % 100;
}

// ============================================================================
// Resolved state — merge de definition + storage override
// ============================================================================

export interface ResolvedFlag {
  key: string;
  enabled: boolean;
  definition: FeatureFlagDefinition;
  state: FlagState | null;
  /** Por que esta decisão foi tomada (audit/debug) */
  reason: 'forced-off' | 'forced-on' | 'whitelist' | 'percentage' | 'default';
}

/**
 * Resolve o estado efetivo de uma flag para um user específico (ou anônimo).
 *
 * @param key     chave da flag
 * @param userId  opcional; sem userId, percentage rollout sempre retorna false
 */
export async function getFlag(
  key: string,
  userId?: string
): Promise<ResolvedFlag> {
  const def = getFlagDefinition(key);
  if (!def) {
    // Flag desconhecida — fail-safe
    return {
      key,
      enabled: false,
      definition: {
        key,
        type: 'boolean',
        defaultValue: false,
        description: 'Flag desconhecida',
        owner: 'system',
      },
      state: null,
      reason: 'default',
    };
  }

  let state: FlagState | null = null;
  try {
    const snapshot = await readFlags();
    state = snapshot[key] ?? null;
  } catch (err) {
    // Falha de I/O — usa default, loga
    console.error(`[feature-flags] erro ao ler storage para ${key}:`, err);
  }

  // 1. Override explícito (enabled !== null) tem prioridade absoluta
  if (state?.enabled === true) {
    return { key, enabled: true, definition: def, state, reason: 'forced-on' };
  }
  if (state?.enabled === false) {
    return { key, enabled: false, definition: def, state, reason: 'forced-off' };
  }

  // 2. Whitelist bypass (para type='percentage')
  if (state?.whitelist && userId && state.whitelist.includes(userId)) {
    return { key, enabled: true, definition: def, state, reason: 'whitelist' };
  }
  if (def.whitelist && userId && def.whitelist.includes(userId)) {
    return { key, enabled: true, definition: def, state, reason: 'whitelist' };
  }

  // 3. Percentage rollout (apenas com userId; sem userId → false)
  if (def.type === 'percentage') {
    if (!userId) {
      return { key, enabled: false, definition: def, state, reason: 'default' };
    }
    const rollout = state?.rolloutPercent ?? def.rolloutPercent ?? 0;
    const hash = hashUserId(userId, key);
    const percentile = hashToPercentile(hash);
    const enabled = percentile < rollout;
    return { key, enabled, definition: def, state, reason: 'percentage' };
  }

  // 4. Default da definição
  return {
    key,
    enabled: def.defaultValue,
    definition: def,
    state,
    reason: 'default',
  };
}

/** Shorthand booleano para checks rápidos */
export async function isFlagEnabled(key: string, userId?: string): Promise<boolean> {
  return (await getFlag(key, userId)).enabled;
}
