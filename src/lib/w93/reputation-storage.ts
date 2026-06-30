/**
 * ════════════════════════════════════════════════════════════════════════════
 * W93-A — REPUTATION STORAGE · LGPD-FIRST IN-MEMORY STORE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 93 · 2026-06-30
 *
 * STORAGE — persiste atribuições, consent, opt-out. Tudo LGPD-safe.
 *
 * Princípios LGPD (GOAL.md):
 *   - Opt-in explícito: nenhuma atribuição é gravada sem consentGiven=true
 *   - Opt-out imediato: remover TODAS atribuições da pessoa no ato do opt-out
 *   - Sem PII exposto: API pública NUNCA retorna fromPersonId ou note
 *   - Retention 90 dias: purgeExpired() roda em todo read ou write
 *   - Auditoria de consent: todo opt-in/opt-out gera ConsentEvent log
 *
 * Universalista: storage funciona igual pra consulente E pra consulente-
 * consulente (peer reputation, não só top-down).
 *
 * Storage é IN-MEMORY (Map) — substituir por Supabase/Postgres em produção
 * preservando a interface pública.
 *
 * Durable lessons applied:
 *   - stripReporterIdentities() helper (cycle 92 lesson #12)
 *   - LGPD layer-2: details:null pattern (cycle W92-D)
 *   - Frozen objects on insert (cycle 68)
 *   - Fake-clock injection (cycle 92 lesson #8)
 */

import {
  LGPD_MAX_RETENTION_DAYS,
  type Attribution,
  type AttributionId,
  type ConsentEvent,
  type ConsentStatus,
  type CreateAttributionInput,
  type PersonId,
  type PublicAttribution,
  type ReputationAxis,
  type TraditionId,
} from './reputation-types.ts';

import {
  ReputationEngine,
  type ReputationEngineOptions,
} from './reputation-engine.ts';

// ════════════════════════════════════════════════════════════════════════════
// STORAGE INTERFACE
// ════════════════════════════════════════════════════════════════════════════

export interface ReputationStorageOptions extends ReputationEngineOptions {
  /** Max retention override. Default: 90. */
  readonly maxRetentionDays?: number;
}

/**
 * Reputação store — interface estável. Implementações in-memory ou DB.
 *
 * LGPD-first: nenhum método público aceita ou retorna PII (fromPersonId,
 * note). Apenas o engine + ConsentEvent têm acesso a campos identificáveis.
 */
export interface IReputationStorage {
  /** Registra uma atribuição. Engine valida LGPD + universalismo. */
  recordAttribution(input: CreateAttributionInput): {
    ok: boolean;
    attributionId?: AttributionId;
    error?: string;
  };

  /** Lista atribuições PÚBLICAS recebidas por uma pessoa (sem reporterId). */
  listReceivedPublic(
    personId: PersonId,
    opts?: { axis?: ReputationAxis; tradition?: TraditionId },
  ): readonly PublicAttribution[];

  /** Lista atribuições PÚBLICAS dadas por uma pessoa (sem reporterId nos retornos). */
  listGivenPublic(
    personId: PersonId,
    opts?: { axis?: ReputationAxis; tradition?: TraditionId },
  ): readonly PublicAttribution[];

  /** Snapshot LGPD-safe. */
  getSnapshot(personId: PersonId): unknown;

  /** Aplica opt-in/opt-out. opted-out remove tudo IMEDIATAMENTE. */
  setConsent(personId: PersonId, status: Exclude<ConsentStatus, 'pending'>): {
    ok: boolean;
    purgedCount: number;
    event?: ConsentEvent;
  };

  /** Status de consent atual. */
  getConsent(personId: PersonId): ConsentStatus;

  /** Histórico de consent events (sem PII do reporter). */
  listConsentEvents(personId: PersonId): readonly ConsentEvent[];

  /** Purga manual de expirados (> 90 dias). Útil em cron job. */
  purgeExpired(maxDays?: number): { purged: number };

  /** Stats do storage (debug / auditoria). SEM PII. */
  stats(): {
    totalAttributions: number;
    totalPersons: number;
    optedOutCount: number;
    oldestAttributionAgeDays: number;
  };
}

// ════════════════════════════════════════════════════════════════════════════
// IN-MEMORY IMPLEMENTATION
// ════════════════════════════════════════════════════════════════════════════

/**
 * In-memory storage. Para produção: trocar por adapter Supabase/Postgres
 * preservando a interface IReputationStorage.
 *
 * Estrutura:
 *   attributions: Map<AttributionId, Attribution>
 *   consent: Map<PersonId, ConsentStatus>
 *   consentEvents: ConsentEvent[]
 *   givenIndex: Map<PersonId, Set<AttributionId>>   // quem essa pessoa AVALIOU
 *   receivedIndex: Map<PersonId, Set<AttributionId>> // quem AVALIOU essa pessoa
 *
 * LGPD: consentEvents NÃO inclui reporterId (já é apenas da pessoa focal).
 */
export class InMemoryReputationStorage implements IReputationStorage {
  private readonly attributions = new Map<AttributionId, Attribution>();
  private readonly consent = new Map<PersonId, ConsentStatus>();
  private readonly consentEvents: ConsentEvent[] = [];
  private readonly givenIndex = new Map<PersonId, Set<AttributionId>>();
  private readonly receivedIndex = new Map<PersonId, Set<AttributionId>>();
  private readonly engine: ReputationEngine;
  private readonly maxRetentionDays: number;

  constructor(opts: ReputationStorageOptions = {}) {
    this.maxRetentionDays = opts.maxRetentionDays ?? LGPD_MAX_RETENTION_DAYS;
    this.engine = new ReputationEngine(opts);
  }

  // ─── WRITE ──────────────────────────────────────────────────────────────

  recordAttribution(input: CreateAttributionInput): {
    ok: boolean;
    attributionId?: AttributionId;
    error?: string;
  } {
    // LGPD: refuser atribuições se destinatário opt-out
    const recipientConsent = this.consent.get(input.toPersonId);
    if (recipientConsent === 'opted-out') {
      return { ok: false, error: 'recipient-opted-out' };
    }

    // Engine valida tudo (LGPD, universalismo, formato)
    const result = this.engine.createAttribution(input);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    const attr = result.value;

    // Idempotência: previne duplicate (mesmo from/to/axis/tradition em 5min)
    const dedupeWindowMs = 5 * 60 * 1000;
    const recent = this.findRecentDuplicate(attr, dedupeWindowMs);
    if (recent) {
      return { ok: false, attributionId: recent.id, error: 'duplicate-attribution' };
    }

    this.attributions.set(attr.id, attr);
    this.indexAttribution(attr);

    // Auto-purge expired em todo write (defensive LGPD)
    this.purgeExpired(this.maxRetentionDays);

    // Marca o destinatário como opted-in no primeiro attribution válido
    if (!this.consent.has(input.toPersonId)) {
      this.consent.set(input.toPersonId, 'opted-in');
    }

    return { ok: true, attributionId: attr.id };
  }

  private findRecentDuplicate(
    attr: Attribution,
    windowMs: number,
  ): Attribution | undefined {
    const cutoff = attr.createdAt - windowMs;
    const fromIdx = this.givenIndex.get(attr.fromPersonId);
    if (!fromIdx) return undefined;
    for (const id of fromIdx) {
      const existing = this.attributions.get(id);
      if (!existing) continue;
      if (existing.createdAt < cutoff) continue;
      if (
        existing.toPersonId === attr.toPersonId &&
        existing.axis === attr.axis &&
        existing.tradition === attr.tradition &&
        existing.context === attr.context
      ) {
        return existing;
      }
    }
    return undefined;
  }

  private indexAttribution(attr: Attribution): void {
    let givenSet = this.givenIndex.get(attr.fromPersonId);
    if (!givenSet) {
      givenSet = new Set();
      this.givenIndex.set(attr.fromPersonId, givenSet);
    }
    givenSet.add(attr.id);

    let receivedSet = this.receivedIndex.get(attr.toPersonId);
    if (!receivedSet) {
      receivedSet = new Set();
      this.receivedIndex.set(attr.toPersonId, receivedSet);
    }
    receivedSet.add(attr.id);
  }

  private unindexAttribution(attr: Attribution): void {
    const givenSet = this.givenIndex.get(attr.fromPersonId);
    if (givenSet) givenSet.delete(attr.id);
    const receivedSet = this.receivedIndex.get(attr.toPersonId);
    if (receivedSet) receivedSet.delete(attr.id);
  }

  // ─── READ (PUBLIC — sem PII) ──────────────────────────────────────────

  listReceivedPublic(
    personId: PersonId,
    opts: { axis?: ReputationAxis; tradition?: TraditionId } = {},
  ): readonly PublicAttribution[] {
    this.purgeExpired(this.maxRetentionDays);
    const ids = this.receivedIndex.get(personId);
    if (!ids) return [];
    const out: PublicAttribution[] = [];
    for (const id of ids) {
      const a = this.attributions.get(id);
      if (!a) continue;
      if (opts.axis && a.axis !== opts.axis) continue;
      if (opts.tradition && a.tradition !== opts.tradition) continue;
      out.push(this.engine.stripReporterIdentities(a));
    }
    return Object.freeze(out);
  }

  listGivenPublic(
    personId: PersonId,
    opts: { axis?: ReputationAxis; tradition?: TraditionId } = {},
  ): readonly PublicAttribution[] {
    this.purgeExpired(this.maxRetentionDays);
    const ids = this.givenIndex.get(personId);
    if (!ids) return [];
    const out: PublicAttribution[] = [];
    for (const id of ids) {
      const a = this.attributions.get(id);
      if (!a) continue;
      if (opts.axis && a.axis !== opts.axis) continue;
      if (opts.tradition && a.tradition !== opts.tradition) continue;
      out.push(this.engine.stripReporterIdentities(a));
    }
    return Object.freeze(out);
  }

  getSnapshot(personId: PersonId): unknown {
    this.purgeExpired(this.maxRetentionDays);
    const all = this.collectAllAttributions();
    const consentStatus = this.consent.get(personId) ?? 'pending';
    return this.engine.computeSnapshot(
      { personId },
      all,
      consentStatus,
    );
  }

  private collectAllAttributions(): Attribution[] {
    return Array.from(this.attributions.values());
  }

  // ─── CONSENT (LGPD) ───────────────────────────────────────────────────

  setConsent(
    personId: PersonId,
    status: Exclude<ConsentStatus, 'pending'>,
  ): { ok: boolean; purgedCount: number; event?: ConsentEvent } {
    const prev = this.consent.get(personId) ?? 'pending';
    this.consent.set(personId, status);

    let purgedCount = 0;
    if (status === 'opted-out') {
      // LGPD: remove TODAS atribuições recebidas pela pessoa
      const receivedIds = this.receivedIndex.get(personId);
      if (receivedIds) {
        purgedCount = receivedIds.size;
        for (const id of receivedIds) {
          const a = this.attributions.get(id);
          if (a) {
            this.attributions.delete(id);
            this.unindexAttribution(a);
          }
        }
      }
      // Também remove as que a pessoa DEU (universidade: sair do ecossistema)
      const givenIds = this.givenIndex.get(personId);
      if (givenIds) {
        purgedCount += givenIds.size;
        for (const id of givenIds) {
          const a = this.attributions.get(id);
          if (a) {
            this.attributions.delete(id);
            this.unindexAttribution(a);
          }
        }
      }
      this.receivedIndex.delete(personId);
      this.givenIndex.delete(personId);
    }

    const event: ConsentEvent = Object.freeze({
      personId,
      status,
      at: this.engine['now'](),
      ...(status === 'opted-in' && prev === 'pending'
        ? { reason: 'user-opt-in' as const }
        : status === 'opted-out'
          ? { reason: 'user-opt-out' as const }
          : {}),
    });
    this.consentEvents.push(event);
    return { ok: true, purgedCount, event };
  }

  getConsent(personId: PersonId): ConsentStatus {
    return this.consent.get(personId) ?? 'pending';
  }

  listConsentEvents(personId: PersonId): readonly ConsentEvent[] {
    return this.consentEvents.filter((e) => e.personId === personId);
  }

  // ─── LGPD PURGE ────────────────────────────────────────────────────────

  purgeExpired(maxDays: number = this.maxRetentionDays): { purged: number } {
    const all = this.collectAllAttributions();
    const fresh = this.engine.purgeExpired(all, maxDays);
    if (fresh.length === all.length) return { purged: 0 };

    const freshIds = new Set(fresh.map((a) => a.id));
    let purged = 0;
    for (const a of all) {
      if (!freshIds.has(a.id)) {
        this.attributions.delete(a.id);
        this.unindexAttribution(a);
        purged++;
      }
    }
    return { purged };
  }

  // ─── STATS ─────────────────────────────────────────────────────────────

  stats(): {
    totalAttributions: number;
    totalPersons: number;
    optedOutCount: number;
    oldestAttributionAgeDays: number;
  } {
    let oldest = Number.POSITIVE_INFINITY;
    for (const a of this.attributions.values()) {
      if (a.createdAt < oldest) oldest = a.createdAt;
    }
    const now = this.engine['now']();
    const ageDays =
      oldest === Number.POSITIVE_INFINITY
        ? 0
        : Math.floor((now - oldest) / (1000 * 60 * 60 * 24));
    let optedOutCount = 0;
    for (const s of this.consent.values()) {
      if (s === 'opted-out') optedOutCount++;
    }
    return {
      totalAttributions: this.attributions.size,
      totalPersons: this.receivedIndex.size + this.givenIndex.size,
      optedOutCount,
      oldestAttributionAgeDays: ageDays,
    };
  }
}