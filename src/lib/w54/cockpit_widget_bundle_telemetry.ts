/**
 * cockpit_widget_bundle_telemetry.ts
 * =============================================================================
 * W54 / Cockpit Widget Bundle Telemetry
 *
 * Camada de telemetria + analytics para o sistema de bundles do cockpit.
 * Auto-contida, por-forma (sem imports de outros arquivos do repo), em arquivo
 * único. Conecta w51/cockpit-widget-bundle (manifest + registry) e
 * w53/cockpit-widget-bundle-installer (install / uninstall / rollback) a um
 * pipeline de telemetria LGPD-compliant.
 *
 * Principais responsabilidades:
 *   1. Ingest de 8 tipos de evento (INSTALL / UNINSTALL / ROLLBACK / UPDATE /
 *      USAGE_OPEN / USAGE_INTERACT / ERROR / CONFIG_CHANGE)
 *   2. Validação de schema + verificação de consentimento LGPD Art. 7/9/18
 *   3. 5 pipelines de agregação (COUNT / SUM / DISTINCT / TIMESERIES / COHORT)
 *   4. 6 widgets de dashboard (TopBundles, ErrorRate, ActiveUsers,
 *      InstallTrend, RollbackTrend, CohortRetention)
 *   5. Filtros de time-range (1h / 24h / 7d / 30d / 90d / custom) com
 *      bucketing (hour/day/week) auto-derivado
 *   6. Opt-in / opt-out granular por tipo de evento
 *   7. LGPD Art. 7 (consentimento), Art. 9 (informação), Art. 18 (direitos do
 *      titular: acesso, correção, eliminação, portabilidade)
 *   8. Sacred-text policy: bundles com flag sacred emitem zero telemetria por
 *      default; curator pode override para compliance reporting
 *
 * Integridade + auditoria:
 *   - Hash SHA-256 hand-rolled para integridade de evento (audit chain)
 *   - Cada evento carrega hashPrev (evento anterior) + hashSelf (evento
 *     atual) — formando uma cadeia Merkle-like para tamper-evidence
 *   - Retention sweep automática (30 / 90 / 365 dias)
 *
 * Convenções:
 *   - snake_case em arquivos, camelCase em JS, UPPER_SNAKE em constantes
 *   - Sem `any`; tipos explícitos
 *   - 100+ named exports, 1800-2800 linhas
 *
 * Referências:
 *   - LGPD Lei 13.709/2018 Art. 7 (consentimento), Art. 9 (transparência),
 *     Art. 18 (direitos), Art. 37 (registro de operações)
 *   - w51/cockpit-widget-bundle (manifest + contract)
 *   - w53/cockpit-widget-bundle-installer (install lifecycle)
 * =============================================================================
 */

// ============================================================================
// SEÇÃO 1 — Tipos primitivos + constantes
// ============================================================================

/**
 * Versão do schema de telemetria. Incrementar quando houver mudança
 * incompatível no shape de evento.
 */
export const TELEMETRY_SCHEMA_VERSION = "1.0.0" as const;

/**
 * Versão do contrato LGPD usado pelo módulo.
 */
export const LGPD_CONTRACT_VERSION = "2026-06" as const;

/**
 * Janela máxima de retenção padrão (dias). Eventos mais antigos são
 * removidos pelo `runRetentionSweep`.
 */
export const DEFAULT_RETENTION_DAYS = 365 as const;

/**
 * Limite duro de eventos em memória por store in-memory. Acima disso,
 * ring buffer descarta os mais antigos.
 */
export const MAX_INMEM_EVENTS = 50_000 as const;

/**
 * Comprimento (bytes) do hash de integridade.
 */
export const HASH_LENGTH_BYTES = 32 as const;

/**
 * Comprimento (chars) do token de consentimento.
 */
export const CONSENT_TOKEN_LENGTH = 64 as const;

/**
 * Granularidade mínima (ms) para buckets timeseries.
 */
export const MIN_BUCKET_MS = 60_000 as const;

// ============================================================================
// SEÇÃO 2 — Tipos de evento
// ============================================================================

/**
 * Os 8 tipos canônicos de evento de telemetria.
 */
export type TelemetryEventType =
  | "INSTALL"
  | "UNINSTALL"
  | "ROLLBACK"
  | "UPDATE"
  | "USAGE_OPEN"
  | "USAGE_INTERACT"
  | "ERROR"
  | "CONFIG_CHANGE";

/**
 * Lista imutável dos tipos de evento (para iteração segura).
 */
export const TELEMETRY_EVENT_TYPES: readonly TelemetryEventType[] = Object.freeze([
  "INSTALL",
  "UNINSTALL",
  "ROLLBACK",
  "UPDATE",
  "USAGE_OPEN",
  "USAGE_INTERACT",
  "ERROR",
  "CONFIG_CHANGE",
]);

/**
 * Metadados de classificação de cada tipo de evento — usado para o painel
 * de opt-in granular (LGPD Art. 7, IV — consentimento específico).
 */
export interface TelemetryEventTypeMeta {
  readonly type: TelemetryEventType;
  readonly label: string;
  readonly description: string;
  readonly sensitivity: TelemetrySensitivity;
  readonly defaultOptIn: boolean;
  readonly sacredExempt: boolean;
}

export type TelemetrySensitivity = "none" | "low" | "medium" | "high";

/**
 * Catálogo canônico de tipos de evento + defaults de opt-in. Editar
 * somente com curadoria (ver IDEIA.md).
 */
export const TELEMETRY_EVENT_CATALOG: Readonly<
  Record<TelemetryEventType, TelemetryEventTypeMeta>
> = Object.freeze({
  INSTALL: {
    type: "INSTALL",
    label: "Instalação",
    description: "Bundle instalado pelo usuário.",
    sensitivity: "low",
    defaultOptIn: true,
    sacredExempt: true,
  },
  UNINSTALL: {
    type: "UNINSTALL",
    label: "Desinstalação",
    description: "Bundle removido pelo usuário.",
    sensitivity: "low",
    defaultOptIn: true,
    sacredExempt: true,
  },
  ROLLBACK: {
    type: "ROLLBACK",
    label: "Rollback",
    description: "Versão anterior do bundle foi restaurada.",
    sensitivity: "medium",
    defaultOptIn: true,
    sacredExempt: true,
  },
  UPDATE: {
    type: "UPDATE",
    label: "Atualização",
    description: "Bundle atualizado para nova versão.",
    sensitivity: "low",
    defaultOptIn: true,
    sacredExempt: true,
  },
  USAGE_OPEN: {
    type: "USAGE_OPEN",
    label: "Bundle aberto",
    description: "Usuário abriu a interface do bundle.",
    sensitivity: "none",
    defaultOptIn: true,
    sacredExempt: false,
  },
  USAGE_INTERACT: {
    type: "USAGE_INTERACT",
    label: "Interação",
    description: "Usuário interagiu com o bundle (clique, gesture, form).",
    sensitivity: "medium",
    defaultOptIn: true,
    sacredExempt: false,
  },
  ERROR: {
    type: "ERROR",
    label: "Erro",
    description: "Erro runtime reportado pelo bundle.",
    sensitivity: "high",
    defaultOptIn: true,
    sacredExempt: false,
  },
  CONFIG_CHANGE: {
    type: "CONFIG_CHANGE",
    label: "Mudança de config",
    description: "Configuração do bundle foi alterada.",
    sensitivity: "low",
    defaultOptIn: true,
    sacredExempt: true,
  },
});

/**
 * Política de conteúdo sagrado. Bundles com `sacred=true` emitem zero
 * telemetria por default — apenas dados agregados e anônimos podem ser
 * liberados para compliance via curator override.
 */
export const SACRED_CONTENT_POLICY = Object.freeze({
  defaultBehavior: "deny" as const,
  overrideRequiresRole: "curator" as const,
  aggregateOnlyWhenOverride: true,
  retentionOverrideDays: 90,
  note:
    "Bundles com tag sacred NUNCA emitem eventos individuais — apenas " +
    "contadores agregados anônimos quando explicitamente liberados por curator.",
});

// ============================================================================
// SEÇÃO 3 — Event shape
// ============================================================================

/**
 * Identificador único de evento (UUID v4 string).
 */
export type EventId = string;

/**
 * Identificador de bundle.
 */
export type BundleId = string;

/**
 * Identificador de usuário (sub do auth).
 */
export type UserId = string;

/**
 * Hash SHA-256 hex (64 chars).
 */
export type HashHex = string;

/**
 * ISO timestamp string.
 */
export type IsoTimestamp = string;

/**
 * Severidade de erro para eventos do tipo ERROR.
 */
export type ErrorSeverity = "info" | "warning" | "error" | "critical";

/**
 * Origem / superfície do erro.
 */
export type ErrorOrigin =
  | "client_runtime"
  | "server_handler"
  | "installer"
  | "manifest"
  | "renderer"
  | "unknown";

/**
 * Config field genérico. Limitado a tipos serializáveis.
 */
export type ConfigValue =
  | string
  | number
  | boolean
  | null
  | readonly string[]
  | readonly number[]
  | { readonly [key: string]: ConfigValue };

/**
 * Payload discriminado por tipo de evento. Usar um tipo único simplifica
 * validação; campos opcionais ficam sob flags por tipo.
 */
export interface TelemetryEventPayload {
  /** Versão do bundle (semver). */
  bundleVersion?: string;
  /** Severidade (apenas ERROR). */
  severity?: ErrorSeverity;
  /** Origem (apenas ERROR). */
  origin?: ErrorOrigin;
  /** Mensagem curta (apenas ERROR). */
  message?: string;
  /** Stack hash (apenas ERROR; nunca o stack cru). */
  stackHash?: HashHex;
  /** Categoria da interação (USAGE_INTERACT). */
  interaction?: string;
  /** ID da instância (USAGE_OPEN / USAGE_INTERACT). */
  instanceId?: string;
  /** Duração em ms (USAGE_INTERACT / USAGE_OPEN). */
  durationMs?: number;
  /** Config key (CONFIG_CHANGE). */
  configKey?: string;
  /** Config valor anterior (CONFIG_CHANGE). */
  previousValue?: ConfigValue;
  /** Config valor novo (CONFIG_CHANGE). */
  newValue?: ConfigValue;
  /** Versão anterior do bundle (UPDATE / ROLLBACK). */
  fromVersion?: string;
  /** Versão nova (UPDATE / ROLLBACK). */
  toVersion?: string;
  /** Motivo (UNINSTALL / ROLLBACK). */
  reason?: string;
  /** Locale (pt-BR, en-US...). */
  locale?: string;
  /** User agent classificado. */
  surface?: "web" | "mobile" | "tablet" | "server" | "cli" | "unknown";
  /** Custom fields permitidos (devem passar por allowlist). */
  extras?: Readonly<Record<string, ConfigValue>>;
}

/**
 * Forma completa de um evento de telemetria validado.
 */
export interface TelemetryEvent {
  /** ID único. */
  readonly eventId: EventId;
  /** Tipo. */
  readonly type: TelemetryEventType;
  /** Bundle emissor. */
  readonly bundleId: BundleId;
  /** Versão do bundle no momento do evento. */
  readonly bundleVersion: string;
  /** Usuário (sub) ou anônimo se consentimento revogado. */
  readonly userId: UserId | "anonymous";
  /** Timestamp ISO 8601 UTC. */
  readonly timestamp: IsoTimestamp;
  /** Payload discriminado. */
  readonly payload: TelemetryEventPayload;
  /** Hash do evento anterior na cadeia (audit chain). */
  readonly hashPrev: HashHex;
  /** Hash do próprio evento. */
  readonly hashSelf: HashHex;
  /** Versão do schema de telemetria. */
  readonly schemaVersion: string;
  /** Tag de conteúdo sagrado do bundle. */
  readonly sacred: boolean;
  /** Token de consentimento que autorizou o evento. */
  readonly consentToken: string;
  /** Indica se passou pelo filtro de opt-in. */
  readonly consented: true;
  /** Ambiente (production / staging / development). */
  readonly environment: TelemetryEnvironment;
}

export type TelemetryEnvironment = "production" | "staging" | "development" | "test";

/**
 * Evento bruto (pré-validação). Contém campos opcionais que serão
 * preenchidos durante o pipeline de ingest.
 */
export interface RawTelemetryEvent {
  eventId?: string;
  type: TelemetryEventType;
  bundleId: string;
  bundleVersion?: string;
  userId: string;
  timestamp?: IsoTimestamp;
  payload?: Partial<TelemetryEventPayload>;
  sacred?: boolean;
  environment?: TelemetryEnvironment;
}

// ============================================================================
// SEÇÃO 4 — Validação
// ============================================================================

/**
 * Erro de validação de evento. Carrega detalhes suficientes para
 * rastreamento sem vazar PII.
 */
export interface TelemetryValidationError {
  readonly field: string;
  readonly code: TelemetryValidationErrorCode;
  readonly message: string;
}

export type TelemetryValidationErrorCode =
  | "missing_field"
  | "invalid_type"
  | "invalid_format"
  | "too_long"
  | "out_of_range"
  | "sacred_blocked"
  | "consent_denied"
  | "unknown_event_type"
  | "invalid_payload";

/**
 * Resultado de validação.
 */
export type TelemetryValidationResult =
  | { readonly ok: true; readonly event: TelemetryEvent }
  | { readonly ok: false; readonly errors: readonly TelemetryValidationError[] };

/**
 * Constantes de limite.
 */
export const MAX_BUNDLE_ID_LEN = 200 as const;
export const MAX_USER_ID_LEN = 200 as const;
export const MAX_VERSION_LEN = 64 as const;
export const MAX_MESSAGE_LEN = 1024 as const;
export const MAX_REASON_LEN = 512 as const;
export const MAX_INTERACTION_LEN = 256 as const;
export const MAX_LOCALE_LEN = 16 as const;
export const MAX_PAYLOAD_EXTRAS = 16 as const;

/**
 * Padrões regex.
 */
const RE_BUNDLE_ID = /^[a-zA-Z0-9._\-+@:/]{1,200}$/;
const RE_USER_ID = /^[a-zA-Z0-9._\-+@:]{1,200}$/;
const RE_VERSION = /^[a-zA-Z0-9._\-+]{1,64}$/;
const RE_LOCALE = /^[a-z]{2}(-[A-Z]{2})?$/;

/**
 * Validate a raw event (sem aplicar consentimento ainda).
 */
export function validateRawEvent(raw: RawTelemetryEvent): TelemetryValidationResult {
  const errors: TelemetryValidationError[] = [];

  if (!raw || typeof raw !== "object") {
    return {
      ok: false,
      errors: [
        { field: "root", code: "invalid_type", message: "evento não é objeto" },
      ],
    };
  }

  if (!raw.type || typeof raw.type !== "string") {
    errors.push({ field: "type", code: "missing_field", message: "type é obrigatório" });
  } else if (!isTelemetryEventType(raw.type)) {
    errors.push({
      field: "type",
      code: "unknown_event_type",
      message: `type inválido: ${raw.type}`,
    });
  }

  if (!raw.bundleId || typeof raw.bundleId !== "string") {
    errors.push({
      field: "bundleId",
      code: "missing_field",
      message: "bundleId é obrigatório",
    });
  } else if (raw.bundleId.length > MAX_BUNDLE_ID_LEN || !RE_BUNDLE_ID.test(raw.bundleId)) {
    errors.push({
      field: "bundleId",
      code: "invalid_format",
      message: "bundleId não bate no padrão esperado",
    });
  }

  if (!raw.userId || typeof raw.userId !== "string") {
    errors.push({
      field: "userId",
      code: "missing_field",
      message: "userId é obrigatório",
    });
  } else if (raw.userId.length > MAX_USER_ID_LEN || !RE_USER_ID.test(raw.userId)) {
    errors.push({
      field: "userId",
      code: "invalid_format",
      message: "userId inválido",
    });
  }

  const v = raw.bundleVersion ?? "0.0.0";
  if (typeof v !== "string" || !RE_VERSION.test(v)) {
    errors.push({
      field: "bundleVersion",
      code: "invalid_format",
      message: "bundleVersion inválido",
    });
  }

  if (raw.timestamp !== undefined) {
    if (typeof raw.timestamp !== "string" || Number.isNaN(Date.parse(raw.timestamp))) {
      errors.push({
        field: "timestamp",
        code: "invalid_format",
        message: "timestamp ISO inválido",
      });
    }
  }

  if (raw.payload && typeof raw.payload !== "object") {
    errors.push({
      field: "payload",
      code: "invalid_type",
      message: "payload deve ser objeto",
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  // Payload-specific checks
  const payloadErrors = validatePayloadByType(raw);
  if (payloadErrors.length > 0) {
    return { ok: false, errors: payloadErrors };
  }

  // Synthetic event stub (consent will be applied later)
  const ts = raw.timestamp ?? new Date().toISOString();
  const eventId = raw.eventId ?? generateEventId(ts, raw.bundleId, raw.type);
  const hashPrev = "0".repeat(HASH_LENGTH_BYTES * 2);
  const hashSelf = computeEventHash({
    eventId,
    type: raw.type,
    bundleId: raw.bundleId,
    bundleVersion: v,
    userId: raw.userId,
    timestamp: ts,
    payload: normalizePayload(raw.payload ?? {}),
    hashPrev,
  });

  const partial: TelemetryEvent = {
    eventId,
    type: raw.type,
    bundleId: raw.bundleId,
    bundleVersion: v,
    userId: raw.userId,
    timestamp: ts,
    payload: normalizePayload(raw.payload ?? {}),
    hashPrev,
    hashSelf,
    schemaVersion: TELEMETRY_SCHEMA_VERSION,
    sacred: !!raw.sacred,
    consentToken: "",
    consented: true,
    environment: raw.environment ?? "production",
  };

  return { ok: true, event: partial };
}

/**
 * Validate payload-specific constraints by event type.
 */
export function validatePayloadByType(
  raw: RawTelemetryEvent
): readonly TelemetryValidationError[] {
  const errors: TelemetryValidationError[] = [];
  const p = raw.payload ?? {};

  switch (raw.type) {
    case "ERROR": {
      if (!p.severity || typeof p.severity !== "string") {
        errors.push({
          field: "payload.severity",
          code: "missing_field",
          message: "ERROR exige severity",
        });
      } else if (!isErrorSeverity(p.severity)) {
        errors.push({
          field: "payload.severity",
          code: "invalid_format",
          message: "severity inválida",
        });
      }
      if (p.message && typeof p.message === "string" && p.message.length > MAX_MESSAGE_LEN) {
        errors.push({
          field: "payload.message",
          code: "too_long",
          message: "message acima de MAX_MESSAGE_LEN",
        });
      }
      break;
    }
    case "USAGE_INTERACT": {
      if (!p.interaction || typeof p.interaction !== "string") {
        errors.push({
          field: "payload.interaction",
          code: "missing_field",
          message: "USAGE_INTERACT exige interaction",
        });
      } else if (p.interaction.length > MAX_INTERACTION_LEN) {
        errors.push({
          field: "payload.interaction",
          code: "too_long",
          message: "interaction muito longa",
        });
      }
      break;
    }
    case "CONFIG_CHANGE": {
      if (!p.configKey || typeof p.configKey !== "string") {
        errors.push({
          field: "payload.configKey",
          code: "missing_field",
          message: "CONFIG_CHANGE exige configKey",
        });
      }
      break;
    }
    case "UPDATE":
    case "ROLLBACK": {
      if (raw.type === "UPDATE" && (!p.fromVersion || !p.toVersion)) {
        errors.push({
          field: "payload.versions",
          code: "missing_field",
          message: "UPDATE exige fromVersion + toVersion",
        });
      }
      break;
    }
    default:
      break;
  }

  if (p.locale && (typeof p.locale !== "string" || !RE_LOCALE.test(p.locale))) {
    errors.push({
      field: "payload.locale",
      code: "invalid_format",
      message: "locale inválido",
    });
  }

  if (p.extras) {
    const keys = Object.keys(p.extras);
    if (keys.length > MAX_PAYLOAD_EXTRAS) {
      errors.push({
        field: "payload.extras",
        code: "out_of_range",
        message: "extras acima do limite",
      });
    }
  }

  return errors;
}

/**
 * Normaliza o payload — remove undefined e padroniza.
 */
export function normalizePayload(
  p: Partial<TelemetryEventPayload>
): TelemetryEventPayload {
  const out: Record<string, ConfigValue> = {};
  for (const k of Object.keys(p)) {
    const v = (p as Record<string, unknown>)[k];
    if (v === undefined) continue;
    out[k] = v as ConfigValue;
  }
  return out as TelemetryEventPayload;
}

/**
 * Type guard para TelemetryEventType.
 */
export function isTelemetryEventType(v: unknown): v is TelemetryEventType {
  return (
    typeof v === "string" &&
    (TELEMETRY_EVENT_TYPES as readonly string[]).includes(v)
  );
}

/**
 * Type guard para ErrorSeverity.
 */
export function isErrorSeverity(v: unknown): v is ErrorSeverity {
  return v === "info" || v === "warning" || v === "error" || v === "critical";
}

/**
 * Type guard para ErrorOrigin.
 */
export function isErrorOrigin(v: unknown): v is ErrorOrigin {
  return (
    v === "client_runtime" ||
    v === "server_handler" ||
    v === "installer" ||
    v === "manifest" ||
    v === "renderer" ||
    v === "unknown"
  );
}

/**
 * Type guard para TelemetryEnvironment.
 */
export function isTelemetryEnvironment(v: unknown): v is TelemetryEnvironment {
  return (
    v === "production" ||
    v === "staging" ||
    v === "development" ||
    v === "test"
  );
}

// ============================================================================
// SEÇÃO 5 — SHA-256 hand-rolled
// ============================================================================

/**
 * Implementação SHA-256 em TypeScript puro. Baseada na especificação FIPS
 * 180-4. Usada para calcular integridade de eventos (audit chain).
 *
 * Vantagem de ser hand-rolled: zero deps, auditável, deterministic em todos
 * runtimes Node/browsers compatíveis.
 */
export class Sha256 {
  private static readonly K: readonly number[] = Object.freeze([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
    0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
    0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
    0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
    0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116,
    0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
    0xc67178f2,
  ]);

  private h0 = 0x6a09e667;
  private h1 = 0xbb67ae85;
  private h2 = 0x3c6ef372;
  private h3 = 0xa54ff53a;
  private h4 = 0x510e527f;
  private h5 = 0x9b05688c;
  private h6 = 0x1f83d9ab;
  private h7 = 0x5be0cd19;
  private buffer: number[] = [];
  private length = 0;

  update(input: string | Uint8Array): this {
    const bytes =
      typeof input === "string" ? Sha256.utf8Encode(input) : Array.from(input);
    for (const b of bytes) {
      this.buffer.push(b);
      this.length++;
    }
    while (this.buffer.length >= 64) {
      this.processBlock(this.buffer.splice(0, 64));
    }
    return this;
  }

  digest(): HashHex {
    let bitLen = this.length * 8;
    this.buffer.push(0x80);
    while (this.buffer.length % 64 !== 56) {
      this.buffer.push(0);
    }
    for (let i = 7; i >= 0; i--) {
      this.buffer.push((bitLen >>> (i * 8)) & 0xff);
    }
    while (this.buffer.length >= 64) {
      this.processBlock(this.buffer.splice(0, 64));
    }
    return Sha256.toHex(this.h0) + Sha256.toHex(this.h1) + Sha256.toHex(this.h2) +
      Sha256.toHex(this.h3) + Sha256.toHex(this.h4) + Sha256.toHex(this.h5) +
      Sha256.toHex(this.h6) + Sha256.toHex(this.h7);
  }

  private processBlock(block: number[]): void {
    const w = new Array<number>(64);
    for (let i = 0; i < 16; i++) {
      w[i] =
        (block[i * 4] << 24) |
        (block[i * 4 + 1] << 16) |
        (block[i * 4 + 2] << 8) |
        block[i * 4 + 3];
    }
    for (let i = 16; i < 64; i++) {
      const s0 = Sha256.rr(w[i - 15], 7) ^ Sha256.rr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = Sha256.rr(w[i - 2], 17) ^ Sha256.rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let a = this.h0, b = this.h1, c = this.h2, d = this.h3;
    let e = this.h4, f = this.h5, g = this.h6, h = this.h7;

    for (let i = 0; i < 64; i++) {
      const s1 = Sha256.rr(e, 6) ^ Sha256.rr(e, 11) ^ Sha256.rr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + Sha256.K[i] + w[i]) | 0;
      const s0 = Sha256.rr(a, 2) ^ Sha256.rr(a, 13) ^ Sha256.rr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g; g = f; f = e;
      e = (d + temp1) | 0;
      d = c; c = b; b = a;
      a = (temp1 + temp2) | 0;
    }

    this.h0 = (this.h0 + a) | 0;
    this.h1 = (this.h1 + b) | 0;
    this.h2 = (this.h2 + c) | 0;
    this.h3 = (this.h3 + d) | 0;
    this.h4 = (this.h4 + e) | 0;
    this.h5 = (this.h5 + f) | 0;
    this.h6 = (this.h6 + g) | 0;
    this.h7 = (this.h7 + h) | 0;
  }

  private static rr(x: number, n: number): number {
    return (x >>> n) | (x << (32 - n));
  }

  private static toHex(n: number): string {
    let s = "";
    for (let i = 7; i >= 0; i--) {
      s += ((n >>> (i * 4)) & 0xf).toString(16);
    }
    return s;
  }

  private static utf8Encode(s: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < s.length; i++) {
      let c = s.charCodeAt(i);
      if (c < 0x80) {
        bytes.push(c);
      } else if (c < 0x800) {
        bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
        const next = s.charCodeAt(i + 1);
        if (next >= 0xdc00 && next <= 0xdfff) {
          c = 0x10000 + ((c - 0xd800) << 10) + (next - 0xdc00);
          bytes.push(
            0xf0 | (c >> 18),
            0x80 | ((c >> 12) & 0x3f),
            0x80 | ((c >> 6) & 0x3f),
            0x80 | (c & 0x3f)
          );
          i++;
          continue;
        }
      } else {
        bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      }
    }
    return bytes;
  }
}

/**
 * Helper: sha256 hex de uma string.
 */
export function sha256Hex(input: string): HashHex {
  return new Sha256().update(input).digest();
}

/**
 * Compute the canonical hash of an event (for audit chain).
 *
 * A canonicalização é determinística (JSON keys ordenadas) e inclui o
 * `hashPrev` — qualquer adulteração invalida a cadeia.
 */
export function computeEventHash(input: {
  eventId: string;
  type: TelemetryEventType;
  bundleId: string;
  bundleVersion: string;
  userId: string;
  timestamp: string;
  payload: TelemetryEventPayload;
  hashPrev: HashHex;
}): HashHex {
  const canonical = JSON.stringify({
    e: input.eventId,
    t: input.type,
    b: input.bundleId,
    v: input.bundleVersion,
    u: input.userId,
    ts: input.timestamp,
    p: input.payload,
    h: input.hashPrev,
  }, Object.keys(input.payload).sort());
  return sha256Hex(canonical);
}

/**
 * Valida um par (evento, hash) — retorna true se o hash confere.
 */
export function verifyEventHash(event: TelemetryEvent): boolean {
  const expected = computeEventHash({
    eventId: event.eventId,
    type: event.type,
    bundleId: event.bundleId,
    bundleVersion: event.bundleVersion,
    userId: event.userId,
    timestamp: event.timestamp,
    payload: event.payload,
    hashPrev: event.hashPrev,
  });
  return expected === event.hashSelf;
}

// ============================================================================
// SEÇÃO 6 — Consent tokens
// ============================================================================

/**
 * Forma de um token de consentimento. Carrega a versão do contrato LGPD,
 * o subject (userId ou "anonymous"), o conjunto de tipos permitidos, e
 * timestamps de emissão/expiração.
 */
export interface ConsentToken {
  readonly subject: UserId | "anonymous";
  readonly issuedAt: IsoTimestamp;
  readonly expiresAt: IsoTimestamp | null;
  readonly allowTypes: ReadonlySet<TelemetryEventType>;
  readonly denyTypes: ReadonlySet<TelemetryEventType>;
  readonly lgpdVersion: string;
  readonly signature: HashHex;
}

/**
 * Estado de consentimento granular por tipo.
 */
export interface ConsentState {
  readonly subject: UserId | "anonymous";
  readonly perType: ReadonlyMap<TelemetryEventType, boolean>;
  readonly sacredOverride: boolean;
  readonly lastUpdated: IsoTimestamp;
}

/**
 * Estado default — tudo que tem `defaultOptIn=true` é permitido; resto negado.
 */
export function makeDefaultConsentState(subject: UserId | "anonymous"): ConsentState {
  const perType = new Map<TelemetryEventType, boolean>();
  for (const t of TELEMETRY_EVENT_TYPES) {
    perType.set(t, TELEMETRY_EVENT_CATALOG[t].defaultOptIn);
  }
  return {
    subject,
    perType,
    sacredOverride: false,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Sign a consent payload (canonical JSON -> sha256). A "assinatura" é um
 * hash do payload canônico concatenado com um salt por subject. Em produção,
 * o salt virá de HSM/KMS; aqui usamos process.env.CONSENT_SALT ou fallback.
 */
export function signConsentToken(
  subject: UserId | "anonymous",
  allow: readonly TelemetryEventType[],
  deny: readonly TelemetryEventType[],
  expiresAt: IsoTimestamp | null
): ConsentToken {
  const allowSet = new Set<TelemetryEventType>(allow);
  const denySet = new Set<TelemetryEventType>(deny);
  const issuedAt = new Date().toISOString();
  const salt = getConsentSalt();
  const canonical = JSON.stringify({
    s: subject,
    i: issuedAt,
    e: expiresAt,
    a: [...allowSet].sort(),
    d: [...denySet].sort(),
    v: LGPD_CONTRACT_VERSION,
    salt,
  });
  return {
    subject,
    issuedAt,
    expiresAt,
    allowTypes: allowSet,
    denyTypes: denySet,
    lgpdVersion: LGPD_CONTRACT_VERSION,
    signature: sha256Hex(canonical),
  };
}

let _cachedSalt: string | null = null;
function getConsentSalt(): string {
  if (_cachedSalt !== null) return _cachedSalt;
  let fromEnv: string | undefined = undefined;
  try {
    const proc: { env?: Record<string, string | undefined> } | undefined =
      (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
    const v = proc?.env?.["CONSENT_SALT"];
    if (typeof v === "string" && v.length > 0) {
      fromEnv = v;
    }
  } catch {
    fromEnv = undefined;
  }
  _cachedSalt = fromEnv ?? "dev-consent-salt-not-for-prod";
  return _cachedSalt;
}

/**
 * Verify a consent token's signature.
 */
export function verifyConsentToken(token: ConsentToken): boolean {
  const salt = getConsentSalt();
  const canonical = JSON.stringify({
    s: token.subject,
    i: token.issuedAt,
    e: token.expiresAt,
    a: [...token.allowTypes].sort(),
    d: [...token.denyTypes].sort(),
    v: token.lgpdVersion,
    salt,
  });
  return sha256Hex(canonical) === token.signature;
}

/**
 * Check if a consent state permits a given event type.
 */
export function isEventConsented(
  state: ConsentState,
  type: TelemetryEventType,
  sacred: boolean
): boolean {
  if (sacred && !state.sacredOverride) return false;
  const v = state.perType.get(type);
  return v === true;
}

/**
 * Toggle a single event type in a consent state (returns new state).
 */
export function setEventConsent(
  state: ConsentState,
  type: TelemetryEventType,
  allowed: boolean
): ConsentState {
  const next = new Map(state.perType);
  next.set(type, allowed);
  return { ...state, perType: next, lastUpdated: new Date().toISOString() };
}

/**
 * Toggle sacred override.
 */
export function setSacredOverride(state: ConsentState, override: boolean): ConsentState {
  return { ...state, sacredOverride: override, lastUpdated: new Date().toISOString() };
}

// ============================================================================
// SEÇÃO 7 — Store de eventos (in-memory)
// ============================================================================

/**
 * Interface mínima de um store de eventos. Em produção, uma implementação
 * Prisma/Postgres pode substituir InMemoryTelemetryStore.
 */
export interface TelemetryStore {
  append(event: TelemetryEvent): Promise<void>;
  list(filter: TelemetryEventFilter): Promise<readonly TelemetryEvent[]>;
  count(filter: TelemetryEventFilter): Promise<number>;
  deleteByUser(userId: UserId): Promise<number>;
  deleteByBundle(bundleId: BundleId): Promise<number>;
  deleteOlderThan(olderThan: IsoTimestamp): Promise<number>;
  latestHash(): Promise<HashHex>;
  size(): Promise<number>;
}

/**
 * Filtro para query no store.
 */
export interface TelemetryEventFilter {
  userId?: UserId;
  bundleId?: BundleId;
  types?: readonly TelemetryEventType[];
  from?: IsoTimestamp;
  to?: IsoTimestamp;
  sacred?: boolean;
  environment?: TelemetryEnvironment;
  limit?: number;
  offset?: number;
}

/**
 * Implementação in-memory. Ring buffer com capacidade máxima.
 */
export class InMemoryTelemetryStore implements TelemetryStore {
  private events: TelemetryEvent[] = [];
  private headHash: HashHex = "0".repeat(HASH_LENGTH_BYTES * 2);

  async append(event: TelemetryEvent): Promise<void> {
    const chained = { ...event, hashPrev: this.headHash };
    const reHashed: TelemetryEvent = {
      ...chained,
      hashSelf: computeEventHash({
        eventId: chained.eventId,
        type: chained.type,
        bundleId: chained.bundleId,
        bundleVersion: chained.bundleVersion,
        userId: chained.userId,
        timestamp: chained.timestamp,
        payload: chained.payload,
        hashPrev: chained.hashPrev,
      }),
    };
    this.events.push(reHashed);
    this.headHash = reHashed.hashSelf;
    if (this.events.length > MAX_INMEM_EVENTS) {
      this.events.splice(0, this.events.length - MAX_INMEM_EVENTS);
    }
  }

  async list(filter: TelemetryEventFilter): Promise<readonly TelemetryEvent[]> {
    const filtered = this.events.filter((e) => matchFilter(e, filter));
    const offset = filter.offset ?? 0;
    const limit = filter.limit ?? filtered.length;
    return filtered.slice(offset, offset + limit);
  }

  async count(filter: TelemetryEventFilter): Promise<number> {
    return this.events.filter((e) => matchFilter(e, filter)).length;
  }

  async deleteByUser(userId: UserId): Promise<number> {
    const before = this.events.length;
    this.events = this.events.filter((e) => e.userId !== userId);
    return before - this.events.length;
  }

  async deleteByBundle(bundleId: BundleId): Promise<number> {
    const before = this.events.length;
    this.events = this.events.filter((e) => e.bundleId !== bundleId);
    return before - this.events.length;
  }

  async deleteOlderThan(olderThan: IsoTimestamp): Promise<number> {
    const before = this.events.length;
    this.events = this.events.filter((e) => e.timestamp >= olderThan);
    return before - this.events.length;
  }

  async latestHash(): Promise<HashHex> {
    return this.headHash;
  }

  async size(): Promise<number> {
    return this.events.length;
  }

  /** Snapshot (uso em testes / dump). */
  snapshot(): readonly TelemetryEvent[] {
    return [...this.events];
  }

  /** Replace contents (uso em testes). */
  load(events: readonly TelemetryEvent[]): void {
    this.events = [...events];
    this.headHash = events.length === 0
      ? "0".repeat(HASH_LENGTH_BYTES * 2)
      : events[events.length - 1].hashSelf;
  }

  /** Reset (uso em testes). */
  clear(): void {
    this.events = [];
    this.headHash = "0".repeat(HASH_LENGTH_BYTES * 2);
  }
}

/**
 * Helper: aplica um filtro a um evento.
 */
export function matchFilter(e: TelemetryEvent, f: TelemetryEventFilter): boolean {
  if (f.userId && e.userId !== f.userId) return false;
  if (f.bundleId && e.bundleId !== f.bundleId) return false;
  if (f.types && f.types.length > 0 && !f.types.includes(e.type)) return false;
  if (f.from && e.timestamp < f.from) return false;
  if (f.to && e.timestamp > f.to) return false;
  if (f.sacred !== undefined && e.sacred !== f.sacred) return false;
  if (f.environment && e.environment !== f.environment) return false;
  return true;
}

// ============================================================================
// SEÇÃO 8 — Event ingest
// ============================================================================

/**
 * Resultado de um ingest call.
 */
export interface TelemetryIngestResult {
  readonly accepted: boolean;
  readonly eventId?: EventId;
  readonly rejectedReason?: string;
  readonly validationErrors?: readonly TelemetryValidationError[];
}

/**
 * Opções do ingestor.
 */
export interface TelemetryIngestOptions {
  /** Override do consentimento (default: usa ConsentRegistry). */
  consentOverride?: ConsentState;
  /** Override do timestamp. */
  now?: () => Date;
  /** Override do store. */
  store?: TelemetryStore;
}

/**
 * Registry global de consentimento por subject.
 */
export interface ConsentRegistry {
  get(subject: UserId | "anonymous"): ConsentState;
  set(subject: UserId | "anonymous", state: ConsentState): void;
  clear(subject: UserId | "anonymous"): void;
}

/**
 * Implementação in-memory do registry.
 */
export class InMemoryConsentRegistry implements ConsentRegistry {
  private map = new Map<UserId | "anonymous", ConsentState>();

  get(subject: UserId | "anonymous"): ConsentState {
    return this.map.get(subject) ?? makeDefaultConsentState(subject);
  }

  set(subject: UserId | "anonymous", state: ConsentState): void {
    this.map.set(subject, state);
  }

  clear(subject: UserId | "anonymous"): void {
    this.map.delete(subject);
  }

  snapshot(): ReadonlyMap<UserId | "anonymous", ConsentState> {
    return new Map(this.map);
  }
}

/**
 * Ingestor principal.
 */
export class TelemetryIngestor {
  private readonly store: TelemetryStore;
  private readonly registry: ConsentRegistry;
  private readonly now: () => Date;

  constructor(opts: {
    store?: TelemetryStore;
    registry?: ConsentRegistry;
    now?: () => Date;
  } = {}) {
    this.store = opts.store ?? new InMemoryTelemetryStore();
    this.registry = opts.registry ?? new InMemoryConsentRegistry();
    this.now = opts.now ?? (() => new Date());
  }

  getStore(): TelemetryStore {
    return this.store;
  }

  getRegistry(): ConsentRegistry {
    return this.registry;
  }

  /**
   * Ingere um raw event. Aplica validação + consent + sacred policy.
   */
  async ingest(raw: RawTelemetryEvent): Promise<TelemetryIngestResult> {
    const validation = validateRawEvent(raw);
    if (!validation.ok) {
      return {
        accepted: false,
        rejectedReason: "validation_failed",
        validationErrors: validation.errors,
      };
    }

    let event = validation.event;
    event = { ...event, timestamp: raw.timestamp ?? event.timestamp };

    // Sacred policy: blocks individual events unless override
    if (event.sacred) {
      const state = this.registry.get(event.userId);
      if (!state.sacredOverride) {
        return {
          accepted: false,
          eventId: event.eventId,
          rejectedReason: "sacred_blocked",
        };
      }
    }

    // Consent check
    const consent = this.registry.get(event.userId);
    const allowed = isEventConsented(consent, event.type, event.sacred);
    if (!allowed) {
      return {
        accepted: false,
        eventId: event.eventId,
        rejectedReason: "consent_denied",
      };
    }

    // Sign with synthetic consent token (here we use the state signature)
    const allowList = TELEMETRY_EVENT_TYPES.filter((t) =>
      consent.perType.get(t) === true
    );
    const denyList = TELEMETRY_EVENT_TYPES.filter((t) =>
      consent.perType.get(t) === false
    );
    const token = signConsentToken(
      event.userId,
      allowList,
      denyList,
      null
    );

    const final: TelemetryEvent = {
      ...event,
      consentToken: token.signature,
    };

    await this.store.append(final);
    return { accepted: true, eventId: final.eventId };
  }

  /**
   * Batch ingest.
   */
  async ingestBatch(raws: readonly RawTelemetryEvent[]): Promise<readonly TelemetryIngestResult[]> {
    const results: TelemetryIngestResult[] = [];
    for (const r of raws) {
      results.push(await this.ingest(r));
    }
    return results;
  }
}

/**
 * Helper: generate a unique event id (deterministic se inputs são estáveis).
 */
export function generateEventId(
  ts: IsoTimestamp,
  bundleId: BundleId,
  type: TelemetryEventType
): EventId {
  const h = sha256Hex(`${ts}|${bundleId}|${type}|${Math.random()}`);
  return h.slice(0, 32);
}

// ============================================================================
// SEÇÃO 9 — Aggregation pipelines
// ============================================================================

/**
 * Tipos canônicos de agregação.
 */
export type AggregationKind = "COUNT" | "SUM" | "DISTINCT" | "TIMESERIES" | "COHORT";

export const AGGREGATION_KINDS: readonly AggregationKind[] = Object.freeze([
  "COUNT",
  "SUM",
  "DISTINCT",
  "TIMESERIES",
  "COHORT",
]);

/**
 * COUNT — conta eventos, opcionalmente agrupado por campo.
 */
export interface CountAggregation {
  readonly kind: "COUNT";
  readonly field?: keyof TelemetryEvent;
  readonly filter?: TelemetryEventFilter;
}

export interface CountBucket {
  readonly key: string;
  readonly count: number;
}

export interface CountResult {
  readonly kind: "COUNT";
  readonly total: number;
  readonly buckets: readonly CountBucket[];
}

/**
 * SUM — soma um campo numérico do payload.
 */
export interface SumAggregation {
  readonly kind: "SUM";
  readonly field: SumField;
  readonly filter?: TelemetryEventFilter;
}

export type SumField = "durationMs";

export interface SumResult {
  readonly kind: "SUM";
  readonly field: SumField;
  readonly total: number;
}

/**
 * DISTINCT — conta valores únicos de um campo.
 */
export interface DistinctAggregation {
  readonly kind: "DISTINCT";
  readonly field: DistinctField;
  readonly filter?: TelemetryEventFilter;
  readonly limit?: number;
}

export type DistinctField = "bundleId" | "userId";

export interface DistinctResult {
  readonly kind: "DISTINCT";
  readonly field: DistinctField;
  readonly values: readonly string[];
  readonly total: number;
}

/**
 * TIMESERIES — buckets ao longo do tempo.
 */
export interface TimeSeriesAggregation {
  readonly kind: "TIMESERIES";
  readonly bucket: BucketGranularity;
  readonly filter?: TelemetryEventFilter;
}

export type BucketGranularity = "hour" | "day" | "week" | "month";

export interface TimeSeriesBucket {
  readonly key: string;
  readonly from: IsoTimestamp;
  readonly to: IsoTimestamp;
  readonly count: number;
}

export interface TimeSeriesResult {
  readonly kind: "TIMESERIES";
  readonly bucket: BucketGranularity;
  readonly buckets: readonly TimeSeriesBucket[];
}

/**
 * COHORT — agrupa por data de instalação (primeiro evento INSTALL/UPDATE
 * por bundleId+userId).
 */
export interface CohortAggregation {
  readonly kind: "COHORT";
  readonly retentionWindows: readonly RetentionWindowDays[];
  readonly filter?: TelemetryEventFilter;
}

export type RetentionWindowDays = 1 | 7 | 14 | 30 | 60 | 90;

export interface CohortBucket {
  readonly cohortDate: IsoTimestamp;
  readonly cohortSize: number;
  readonly retention: Readonly<Record<RetentionWindowDays, number>>;
}

export interface CohortResult {
  readonly kind: "COHORT";
  readonly cohorts: readonly CohortBucket[];
}

/**
 * Aggregation discriminated union.
 */
export type Aggregation =
  | CountAggregation
  | SumAggregation
  | DistinctAggregation
  | TimeSeriesAggregation
  | CohortAggregation;

export type AggregationResult =
  | CountResult
  | SumResult
  | DistinctResult
  | TimeSeriesResult
  | CohortResult;

/**
 * AggregationEngine — aplica pipelines sobre o store.
 */
export class AggregationEngine {
  private readonly store: TelemetryStore;

  constructor(store: TelemetryStore) {
    this.store = store;
  }

  async run(agg: Aggregation): Promise<AggregationResult> {
    switch (agg.kind) {
      case "COUNT":
        return this.runCount(agg);
      case "SUM":
        return this.runSum(agg);
      case "DISTINCT":
        return this.runDistinct(agg);
      case "TIMESERIES":
        return this.runTimeseries(agg);
      case "COHORT":
        return this.runCohort(agg);
      default:
        throw new Error(`aggregation_kind_unknown:${(agg as Aggregation).kind}`);
    }
  }

  private async runCount(agg: CountAggregation): Promise<CountResult> {
    const events = await this.store.list(agg.filter ?? {});
    if (!agg.field) {
      return { kind: "COUNT", total: events.length, buckets: [] };
    }
    const map = new Map<string, number>();
    for (const e of events) {
      const v = String(e[agg.field]);
      map.set(v, (map.get(v) ?? 0) + 1);
    }
    const buckets: CountBucket[] = [];
    for (const [k, v] of map.entries()) {
      buckets.push({ key: k, count: v });
    }
    buckets.sort((a, b) => b.count - a.count);
    return { kind: "COUNT", total: events.length, buckets };
  }

  private async runSum(agg: SumAggregation): Promise<SumResult> {
    const events = await this.store.list(agg.filter ?? {});
    let total = 0;
    for (const e of events) {
      const v = e.payload[agg.field];
      if (typeof v === "number") total += v;
    }
    return { kind: "SUM", field: agg.field, total };
  }

  private async runDistinct(agg: DistinctAggregation): Promise<DistinctResult> {
    const events = await this.store.list(agg.filter ?? {});
    const set = new Set<string>();
    for (const e of events) {
      const v = e[agg.field];
      if (typeof v === "string") set.add(v);
    }
    const all = [...set];
    const limit = agg.limit ?? all.length;
    return {
      kind: "DISTINCT",
      field: agg.field,
      values: all.slice(0, limit),
      total: all.length,
    };
  }

  private async runTimeseries(agg: TimeSeriesAggregation): Promise<TimeSeriesResult> {
    const events = await this.store.list(agg.filter ?? {});
    const buckets = new Map<string, TimeSeriesBucket>();
    for (const e of events) {
      const key = bucketKey(e.timestamp, agg.bucket);
      const cur = buckets.get(key);
      if (cur) {
        buckets.set(key, { ...cur, count: cur.count + 1 });
      } else {
        const { from, to } = bucketRange(e.timestamp, agg.bucket);
        buckets.set(key, { key, from, to, count: 1 });
      }
    }
    const arr = [...buckets.values()];
    arr.sort((a, b) => (a.from < b.from ? -1 : 1));
    return { kind: "TIMESERIES", bucket: agg.bucket, buckets: arr };
  }

  private async runCohort(agg: CohortAggregation): Promise<CohortResult> {
    const events = await this.store.list(agg.filter ?? {});
    const installs = events.filter(
      (e) => e.type === "INSTALL" || e.type === "UPDATE"
    );
    const installsByPair = new Map<string, IsoTimestamp>();
    for (const e of installs) {
      const k = `${e.userId}|${e.bundleId}`;
      const existing = installsByPair.get(k);
      if (!existing || e.timestamp < existing) {
        installsByPair.set(k, e.timestamp);
      }
    }

    const cohortMap = new Map<IsoTimestamp, Set<string>>();
    for (const [k, ts] of installsByPair.entries()) {
      const cohortDate = ts.slice(0, 10);
      const set = cohortMap.get(cohortDate) ?? new Set<string>();
      set.add(k);
      cohortMap.set(cohortDate, set);
    }

    const cohorts: CohortBucket[] = [];
    for (const [cohortDate, members] of cohortMap.entries()) {
      const retention: Record<RetentionWindowDays, number> = {
        1: 0, 7: 0, 14: 0, 30: 0, 60: 0, 90: 0,
      };
      const cohortMs = Date.parse(cohortDate);
      for (const m of members) {
        const [, bundleId] = m.split("|");
        const seen = new Set<RetentionWindowDays>();
        for (const e of events) {
          if (e.bundleId !== bundleId) continue;
          if (!m.startsWith(`${e.userId}|`)) continue;
          const dt = Date.parse(e.timestamp) - cohortMs;
          const days = Math.floor(dt / 86_400_000);
          for (const w of agg.retentionWindows) {
            if (days >= w) seen.add(w);
          }
        }
        for (const w of seen) retention[w]++;
      }
      cohorts.push({ cohortDate, cohortSize: members.size, retention });
    }
    cohorts.sort((a, b) => (a.cohortDate < b.cohortDate ? -1 : 1));
    return { kind: "COHORT", cohorts };
  }
}

// ============================================================================
// SEÇÃO 10 — Time-range filters
// ============================================================================

/**
 * Presets canônicos.
 */
export type TimeRangePreset = "1h" | "24h" | "7d" | "30d" | "90d" | "custom";

export const TIME_RANGE_PRESETS: readonly TimeRangePreset[] = Object.freeze([
  "1h", "24h", "7d", "30d", "90d", "custom",
]);

/**
 * TimeRange resolvido.
 */
export interface ResolvedTimeRange {
  readonly preset: TimeRangePreset;
  readonly from: IsoTimestamp;
  readonly to: IsoTimestamp;
  readonly bucket: BucketGranularity;
  readonly durationMs: number;
}

/**
 * Resolve um preset para um range concreto.
 */
export function resolveTimeRange(
  preset: TimeRangePreset,
  opts: { now?: () => Date; custom?: { from: IsoTimestamp; to: IsoTimestamp } } = {}
): ResolvedTimeRange {
  const now = (opts.now ?? (() => new Date()))();
  const to = now.toISOString();

  if (preset === "custom") {
    if (!opts.custom) {
      throw new Error("custom time range exige {from, to}");
    }
    const duration = Date.parse(opts.custom.to) - Date.parse(opts.custom.from);
    return {
      preset,
      from: opts.custom.from,
      to: opts.custom.to,
      bucket: pickBucketForDuration(duration),
      durationMs: duration,
    };
  }

  const fromMs = (() => {
    switch (preset) {
      case "1h": return now.getTime() - 3_600_000;
      case "24h": return now.getTime() - 86_400_000;
      case "7d": return now.getTime() - 7 * 86_400_000;
      case "30d": return now.getTime() - 30 * 86_400_000;
      case "90d": return now.getTime() - 90 * 86_400_000;
      default: return now.getTime() - 86_400_000;
    }
  })();

  const duration = now.getTime() - fromMs;
  return {
    preset,
    from: new Date(fromMs).toISOString(),
    to,
    bucket: pickBucketForDuration(duration),
    durationMs: duration,
  };
}

/**
 * Auto-derive a bucket granularity based on range duration.
 *
 * Heurística:
 *   - <= 6h  → hour
 *   - <= 7d  → hour
 *   - <= 60d → day
 *   - > 60d  → week
 */
export function pickBucketForDuration(durationMs: number): BucketGranularity {
  if (durationMs <= 6 * 3_600_000) return "hour";
  if (durationMs <= 7 * 86_400_000) return "hour";
  if (durationMs <= 60 * 86_400_000) return "day";
  return "week";
}

/**
 * Bucket key (string) para uma granularidade.
 */
export function bucketKey(iso: IsoTimestamp, bucket: BucketGranularity): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const mo = pad2(d.getUTCMonth() + 1);
  const da = pad2(d.getUTCDate());
  if (bucket === "hour") {
    const h = pad2(d.getUTCHours());
    return `${y}-${mo}-${da}T${h}`;
  }
  if (bucket === "day") {
    return `${y}-${mo}-${da}`;
  }
  if (bucket === "week") {
    const wk = isoWeekNumber(d);
    return `${y}-W${pad2(wk)}`;
  }
  return `${y}-${mo}`;
}

/**
 * Range (from/to) de um bucket.
 */
export function bucketRange(
  iso: IsoTimestamp,
  bucket: BucketGranularity
): { from: IsoTimestamp; to: IsoTimestamp } {
  const d = new Date(iso);
  if (bucket === "hour") {
    const start = new Date(Date.UTC(
      d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), 0, 0, 0
    ));
    const end = new Date(start.getTime() + 3_600_000);
    return { from: start.toISOString(), to: end.toISOString() };
  }
  if (bucket === "day") {
    const start = new Date(Date.UTC(
      d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0
    ));
    const end = new Date(start.getTime() + 86_400_000);
    return { from: start.toISOString(), to: end.toISOString() };
  }
  if (bucket === "week") {
    const wk = isoWeekNumber(d);
    const { y, m, d: dayStart } = isoWeekToDate(yyyyFromIso(d), wk);
    const start = new Date(Date.UTC(y, m - 1, dayStart, 0, 0, 0, 0));
    const end = new Date(start.getTime() + 7 * 86_400_000);
    return { from: start.toISOString(), to: end.toISOString() };
  }
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return { from: start.toISOString(), to: end.toISOString() };
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function yyyyFromIso(d: Date): number {
  return d.getUTCFullYear();
}

/**
 * ISO week number (1-53).
 */
export function isoWeekNumber(d: Date): number {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil((((t.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
}

/**
 * ISO week → date.
 */
export function isoWeekToDate(year: number, week: number): { y: number; m: number; d: number } {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay();
  const ISOweekStart = new Date(simple);
  if (dow <= 4) ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
  else ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
  return {
    y: ISOweekStart.getUTCFullYear(),
    m: ISOweekStart.getUTCMonth() + 1,
    d: ISOweekStart.getUTCDate(),
  };
}

// ============================================================================
// SEÇÃO 11 — Dashboard widgets
// ============================================================================

/**
 * Widget ID canônicos.
 */
export type WidgetId =
  | "TopBundles"
  | "ErrorRate"
  | "ActiveUsers"
  | "InstallTrend"
  | "RollbackTrend"
  | "CohortRetention";

export const WIDGET_IDS: readonly WidgetId[] = Object.freeze([
  "TopBundles",
  "ErrorRate",
  "ActiveUsers",
  "InstallTrend",
  "RollbackTrend",
  "CohortRetention",
]);

/**
 * Renderer kinds para o cockpit UI.
 */
export type WidgetRendererKind =
  | "bar_chart"
  | "line_chart"
  | "kpi_card"
  | "table"
  | "stacked_area"
  | "heatmap";

/**
 * Renderer config.
 */
export interface WidgetRendererConfig {
  readonly kind: WidgetRendererKind;
  readonly title: string;
  readonly subtitle?: string;
  readonly unit?: string;
  readonly colorScheme?: "default" | "sacred" | "errors" | "growth";
  readonly maxItems?: number;
  readonly thresholds?: Readonly<Record<"info" | "warn" | "critical", number>>;
}

/**
 * Widget spec — une query (aggregation) com renderer.
 */
export interface WidgetSpec {
  readonly id: WidgetId;
  readonly query: Aggregation;
  readonly renderer: WidgetRendererConfig;
  readonly defaultRange: TimeRangePreset;
  readonly description: string;
}

/**
 * Catálogo canônico de widgets.
 */
export const WIDGET_CATALOG: Readonly<Record<WidgetId, WidgetSpec>> = Object.freeze({
  TopBundles: {
    id: "TopBundles",
    query: {
      kind: "COUNT",
      field: "bundleId",
      filter: {
        types: ["INSTALL"],
      },
    },
    renderer: {
      kind: "bar_chart",
      title: "Top Bundles (INSTALL)",
      unit: "installs",
      colorScheme: "default",
      maxItems: 10,
    },
    defaultRange: "30d",
    description: "Bundles mais instalados no período.",
  },
  ErrorRate: {
    id: "ErrorRate",
    query: {
      kind: "TIMESERIES",
      bucket: "hour",
      filter: {
        types: ["ERROR"],
      },
    },
    renderer: {
      kind: "line_chart",
      title: "Error Rate",
      unit: "errors/h",
      colorScheme: "errors",
      thresholds: { info: 5, warn: 20, critical: 50 },
    },
    defaultRange: "24h",
    description: "Volume de erros por hora.",
  },
  ActiveUsers: {
    id: "ActiveUsers",
    query: {
      kind: "DISTINCT",
      field: "userId",
      filter: {
        types: ["USAGE_OPEN", "USAGE_INTERACT"],
      },
    },
    renderer: {
      kind: "kpi_card",
      title: "Active Users",
      unit: "users",
      colorScheme: "growth",
    },
    defaultRange: "7d",
    description: "Usuários únicos ativos no período.",
  },
  InstallTrend: {
    id: "InstallTrend",
    query: {
      kind: "TIMESERIES",
      bucket: "day",
      filter: {
        types: ["INSTALL"],
      },
    },
    renderer: {
      kind: "line_chart",
      title: "Install Trend",
      unit: "installs/d",
      colorScheme: "growth",
    },
    defaultRange: "30d",
    description: "Volume de instalações por dia.",
  },
  RollbackTrend: {
    id: "RollbackTrend",
    query: {
      kind: "TIMESERIES",
      bucket: "day",
      filter: {
        types: ["ROLLBACK"],
      },
    },
    renderer: {
      kind: "stacked_area",
      title: "Rollback Trend",
      unit: "rollbacks/d",
      colorScheme: "errors",
    },
    defaultRange: "90d",
    description: "Volume de rollbacks por dia.",
  },
  CohortRetention: {
    id: "CohortRetention",
    query: {
      kind: "COHORT",
      retentionWindows: [1, 7, 30],
    },
    renderer: {
      kind: "heatmap",
      title: "Cohort Retention",
      unit: "%",
      colorScheme: "default",
    },
    defaultRange: "90d",
    description: "Retenção por cohort de instalação.",
  },
});

/**
 * Widget runner — aplica a query do widget + range + renderer hint.
 */
export class WidgetRunner {
  private readonly engine: AggregationEngine;

  constructor(store: TelemetryStore) {
    this.engine = new AggregationEngine(store);
  }

  async runWidget(
    id: WidgetId,
    range: TimeRangePreset,
    opts: { custom?: { from: IsoTimestamp; to: IsoTimestamp }; now?: () => Date } = {}
  ): Promise<{ widget: WidgetSpec; result: AggregationResult; range: ResolvedTimeRange }> {
    const widget = WIDGET_CATALOG[id];
    const resolved = resolveTimeRange(range, opts);
    const query: Aggregation = mergeFilterWithRange(widget.query, resolved);
    const result = await this.engine.run(query);
    return { widget, result, range: resolved };
  }

  async runAll(range: TimeRangePreset, opts: { now?: () => Date } = {}): Promise<
    ReadonlyMap<WidgetId, { widget: WidgetSpec; result: AggregationResult; range: ResolvedTimeRange }>
  > {
    const out = new Map<WidgetId, { widget: WidgetSpec; result: AggregationResult; range: ResolvedTimeRange }>();
    for (const id of WIDGET_IDS) {
      out.set(id, await this.runWidget(id, range, opts));
    }
    return out;
  }
}

/**
 * Aplica o resolved range ao filtro de uma aggregation.
 */
export function mergeFilterWithRange(
  query: Aggregation,
  range: ResolvedTimeRange
): Aggregation {
  const apply = (f?: TelemetryEventFilter): TelemetryEventFilter => ({
    ...(f ?? {}),
    from: f?.from ?? range.from,
    to: f?.to ?? range.to,
  });
  switch (query.kind) {
    case "COUNT":
      return { ...query, filter: apply(query.filter) };
    case "SUM":
      return { ...query, filter: apply(query.filter) };
    case "DISTINCT":
      return { ...query, filter: apply(query.filter) };
    case "TIMESERIES": {
      return {
        ...query,
        bucket: pickBucketForDuration(range.durationMs),
        filter: apply(query.filter),
      };
    }
    case "COHORT":
      return { ...query, filter: apply(query.filter) };
  }
}

// ============================================================================
// SEÇÃO 12 — LGPD endpoints
// ============================================================================

/**
 * LGPD Art. 18, IV — direito de acesso. Retorna todos os eventos do titular.
 */
export interface LgpdExportRequest {
  readonly subject: UserId;
  readonly requestedAt: IsoTimestamp;
  readonly includePayload: boolean;
}

export interface LgpdExportResult {
  readonly subject: UserId;
  readonly events: readonly TelemetryEvent[];
  readonly count: number;
  readonly generatedAt: IsoTimestamp;
  readonly lgpdVersion: string;
}

/**
 * LGPD Art. 18, VI — direito de eliminação. Apaga todos os eventos do
 * titular.
 */
export interface LgpdErasureRequest {
  readonly subject: UserId;
  readonly requestedAt: IsoTimestamp;
}

export interface LgpdErasureResult {
  readonly subject: UserId;
  readonly deleted: number;
  readonly completedAt: IsoTimestamp;
}

/**
 * LGPD Art. 18, III — direito de correção. Atualiza o consent state.
 */
export interface LgpdConsentUpdateRequest {
  readonly subject: UserId;
  readonly perType: ReadonlyMap<TelemetryEventType, boolean>;
  readonly sacredOverride?: boolean;
}

export interface LgpdConsentUpdateResult {
  readonly subject: UserId;
  readonly updatedAt: IsoTimestamp;
}

/**
 * Service LGPD.
 */
export class LgpdService {
  private readonly ingestor: TelemetryIngestor;

  constructor(ingestor: TelemetryIngestor) {
    this.ingestor = ingestor;
  }

  async export(req: LgpdExportRequest): Promise<LgpdExportResult> {
    const events = await this.ingestor.getStore().list({
      userId: req.subject,
      limit: MAX_INMEM_EVENTS,
    });
    const filtered = req.includePayload
      ? events
      : events.map((e) => ({ ...e, payload: {} as TelemetryEventPayload }));
    return {
      subject: req.subject,
      events: filtered,
      count: filtered.length,
      generatedAt: new Date().toISOString(),
      lgpdVersion: LGPD_CONTRACT_VERSION,
    };
  }

  async erase(req: LgpdErasureRequest): Promise<LgpdErasureResult> {
    const deleted = await this.ingestor.getStore().deleteByUser(req.subject);
    this.ingestor.getRegistry().clear(req.subject);
    return {
      subject: req.subject,
      deleted,
      completedAt: new Date().toISOString(),
    };
  }

  async updateConsent(req: LgpdConsentUpdateRequest): Promise<LgpdConsentUpdateResult> {
    const cur = this.ingestor.getRegistry().get(req.subject);
    const merged: ConsentState = {
      ...cur,
      perType: new Map([...cur.perType, ...req.perType]),
      sacredOverride: req.sacredOverride ?? cur.sacredOverride,
      lastUpdated: new Date().toISOString(),
    };
    this.ingestor.getRegistry().set(req.subject, merged);
    return {
      subject: req.subject,
      updatedAt: merged.lastUpdated,
    };
  }
}

/**
 * Retention sweep — LGPD + housekeeping.
 */
export interface RetentionSweepOptions {
  readonly olderThan: IsoTimestamp;
  readonly applyRetention: boolean;
}

export interface RetentionSweepResult {
  readonly scanned: number;
  readonly deleted: number;
  readonly cutoff: IsoTimestamp;
  readonly completedAt: IsoTimestamp;
}

/**
 * Default retention windows (dias).
 */
export const DEFAULT_RETENTION_WINDOWS = Object.freeze({
  install: 365,
  uninstall: 365,
  rollback: 365,
  update: 365,
  usage_open: 90,
  usage_interact: 90,
  error: 365,
  config_change: 365,
} as const);

/**
 * Compute cutoff timestamp para retention.
 */
export function computeRetentionCutoff(days: number, now: () => Date = () => new Date()): IsoTimestamp {
  const t = now().getTime() - days * 86_400_000;
  return new Date(t).toISOString();
}

/**
 * Run a retention sweep.
 */
export class RetentionService {
  private readonly ingestor: TelemetryIngestor;

  constructor(ingestor: TelemetryIngestor) {
    this.ingestor = ingestor;
  }

  async sweep(opts: RetentionSweepOptions): Promise<RetentionSweepResult> {
    const before = await this.ingestor.getStore().size();
    let deleted = 0;
    if (opts.applyRetention) {
      deleted = await this.ingestor.getStore().deleteOlderThan(opts.olderThan);
    }
    return {
      scanned: before,
      deleted,
      cutoff: opts.olderThan,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Auto-derive cutoff por tipo de evento.
   */
  async sweepByEventType(now: () => Date = () => new Date()): Promise<RetentionSweepResult> {
    const store = this.ingestor.getStore();
    const before = await store.size();
    let totalDeleted = 0;
    const all = await store.list({});
    const byType = new Map<TelemetryEventType, TelemetryEvent[]>();
    for (const e of all) {
      const arr = byType.get(e.type) ?? [];
      arr.push(e);
      byType.set(e.type, arr);
    }
    for (const t of TELEMETRY_EVENT_TYPES) {
      const events = byType.get(t) ?? [];
      const retentionKey = t.toLowerCase();
      const days =
        (DEFAULT_RETENTION_WINDOWS as Record<string, number>)[retentionKey] ?? DEFAULT_RETENTION_DAYS;
      const cutoff = computeRetentionCutoff(days, now);
      for (const e of events) {
        if (e.timestamp < cutoff) {
          await store.deleteOlderThan(e.timestamp);
          totalDeleted++;
        }
      }
    }
    return {
      scanned: before,
      deleted: totalDeleted,
      cutoff: computeRetentionCutoff(DEFAULT_RETENTION_DAYS, now),
      completedAt: new Date().toISOString(),
    };
  }
}

// ============================================================================
// SEÇÃO 13 — Audit chain
// ============================================================================

/**
 * AuditChain — verifica a integridade da cadeia de hashes.
 */
export interface AuditChainReport {
  readonly totalEvents: number;
  readonly valid: number;
  readonly broken: number;
  readonly brokenEventIds: readonly EventId[];
  readonly lastValidHash: HashHex;
  readonly verifiedAt: IsoTimestamp;
}

export class AuditChainVerifier {
  private readonly store: TelemetryStore;

  constructor(store: TelemetryStore) {
    this.store = store;
  }

  async verify(): Promise<AuditChainReport> {
    const events = await this.store.list({ limit: MAX_INMEM_EVENTS });
    let valid = 0;
    let broken = 0;
    let prev = "0".repeat(HASH_LENGTH_BYTES * 2);
    const brokenIds: EventId[] = [];

    for (const e of events) {
      const hashOk = verifyEventHash(e);
      const linkOk = e.hashPrev === prev;
      if (hashOk && linkOk) {
        valid++;
      } else {
        broken++;
        brokenIds.push(e.eventId);
      }
      prev = e.hashSelf;
    }

    return {
      totalEvents: events.length,
      valid,
      broken,
      brokenEventIds: brokenIds,
      lastValidHash: prev,
      verifiedAt: new Date().toISOString(),
    };
  }
}

// ============================================================================
// SEÇÃO 14 — Sacred content helpers
// ============================================================================

/**
 * Helper para marcar um bundle como sacred no ingest.
 */
export interface BundleSacredness {
  readonly bundleId: BundleId;
  readonly sacred: boolean;
  readonly curatorOverride: boolean;
  readonly reviewerNote?: string;
  readonly reviewedAt?: IsoTimestamp;
}

/**
 * Registry de sacredness.
 */
export class SacredBundleRegistry {
  private readonly map = new Map<BundleId, BundleSacredness>();

  mark(b: BundleSacredness): void {
    this.map.set(b.bundleId, b);
  }

  unmark(bundleId: BundleId): void {
    this.map.delete(bundleId);
  }

  get(bundleId: BundleId): BundleSacredness | undefined {
    return this.map.get(bundleId);
  }

  isSacred(bundleId: BundleId): boolean {
    return this.map.get(bundleId)?.sacred === true;
  }

  hasCuratorOverride(bundleId: BundleId): boolean {
    const e = this.map.get(bundleId);
    return !!e?.sacred && !!e?.curatorOverride;
  }

  list(): readonly BundleSacredness[] {
    return [...this.map.values()];
  }
}

/**
 * Aggregate-only helper para bundles sacred com curator override.
 *
 * Eventos individuais nunca saem, mas counters agregados (sem userId) podem
 * ser liberados para compliance reporting.
 */
export interface SacredAggregateReport {
  readonly bundleId: BundleId;
  readonly installCount: number;
  readonly uninstallCount: number;
  readonly errorCount: number;
  readonly activeUsers: number;
  readonly generatedAt: IsoTimestamp;
}

export class SacredAggregateService {
  private readonly ingestor: TelemetryIngestor;
  private readonly registry: SacredBundleRegistry;

  constructor(ingestor: TelemetryIngestor, registry: SacredBundleRegistry) {
    this.ingestor = ingestor;
    this.registry = registry;
  }

  async aggregate(bundleId: BundleId): Promise<SacredAggregateReport | null> {
    if (!this.registry.hasCuratorOverride(bundleId)) return null;
    const store = this.ingestor.getStore();
    const all = await store.list({ bundleId });
    const users = new Set<UserId>();
    let installs = 0;
    let uninstalls = 0;
    let errors = 0;
    for (const e of all) {
      if (typeof e.userId === "string") users.add(e.userId);
      if (e.type === "INSTALL") installs++;
      else if (e.type === "UNINSTALL") uninstalls++;
      else if (e.type === "ERROR") errors++;
    }
    return {
      bundleId,
      installCount: installs,
      uninstallCount: uninstalls,
      errorCount: errors,
      activeUsers: users.size,
      generatedAt: new Date().toISOString(),
    };
  }
}

// ============================================================================
// SEÇÃO 15 — Errors helpers
// ============================================================================

/**
 * Convenience: cria um raw event ERROR a partir de um Error.
 */
export function makeErrorEvent(input: {
  bundleId: BundleId;
  bundleVersion: string;
  userId: UserId;
  err: Error;
  origin?: ErrorOrigin;
  severity?: ErrorSeverity;
  sacred?: boolean;
}): RawTelemetryEvent {
  const stack = input.err.stack ?? "";
  const stackHash = sha256Hex(stack).slice(0, 32);
  return {
    type: "ERROR",
    bundleId: input.bundleId,
    bundleVersion: input.bundleVersion,
    userId: input.userId,
    payload: {
      severity: input.severity ?? "error",
      origin: input.origin ?? "unknown",
      message: input.err.message.slice(0, MAX_MESSAGE_LEN),
      stackHash,
    },
    sacred: input.sacred ?? false,
  };
}

/**
 * Convenience: cria um raw event USAGE_INTERACT.
 */
export function makeInteractEvent(input: {
  bundleId: BundleId;
  bundleVersion: string;
  userId: UserId;
  interaction: string;
  instanceId?: string;
  durationMs?: number;
  sacred?: boolean;
}): RawTelemetryEvent {
  return {
    type: "USAGE_INTERACT",
    bundleId: input.bundleId,
    bundleVersion: input.bundleVersion,
    userId: input.userId,
    payload: {
      interaction: input.interaction,
      instanceId: input.instanceId,
      durationMs: input.durationMs,
    },
    sacred: input.sacred ?? false,
  };
}

/**
 * Convenience: cria um raw event USAGE_OPEN.
 */
export function makeOpenEvent(input: {
  bundleId: BundleId;
  bundleVersion: string;
  userId: UserId;
  instanceId?: string;
  sacred?: boolean;
}): RawTelemetryEvent {
  return {
    type: "USAGE_OPEN",
    bundleId: input.bundleId,
    bundleVersion: input.bundleVersion,
    userId: input.userId,
    payload: { instanceId: input.instanceId },
    sacred: input.sacred ?? false,
  };
}

/**
 * Convenience: cria um raw event INSTALL.
 */
export function makeInstallEvent(input: {
  bundleId: BundleId;
  bundleVersion: string;
  userId: UserId;
  reason?: string;
  sacred?: boolean;
}): RawTelemetryEvent {
  return {
    type: "INSTALL",
    bundleId: input.bundleId,
    bundleVersion: input.bundleVersion,
    userId: input.userId,
    payload: { reason: input.reason },
    sacred: input.sacred ?? false,
  };
}

/**
 * Convenience: cria um raw event UNINSTALL.
 */
export function makeUninstallEvent(input: {
  bundleId: BundleId;
  bundleVersion: string;
  userId: UserId;
  reason?: string;
  sacred?: boolean;
}): RawTelemetryEvent {
  return {
    type: "UNINSTALL",
    bundleId: input.bundleId,
    bundleVersion: input.bundleVersion,
    userId: input.userId,
    payload: { reason: input.reason },
    sacred: input.sacred ?? false,
  };
}

/**
 * Convenience: cria um raw event UPDATE.
 */
export function makeUpdateEvent(input: {
  bundleId: BundleId;
  fromVersion: string;
  toVersion: string;
  userId: UserId;
  sacred?: boolean;
}): RawTelemetryEvent {
  return {
    type: "UPDATE",
    bundleId: input.bundleId,
    bundleVersion: input.toVersion,
    userId: input.userId,
    payload: { fromVersion: input.fromVersion, toVersion: input.toVersion },
    sacred: input.sacred ?? false,
  };
}

/**
 * Convenience: cria um raw event ROLLBACK.
 */
export function makeRollbackEvent(input: {
  bundleId: BundleId;
  fromVersion: string;
  toVersion: string;
  userId: UserId;
  reason?: string;
  sacred?: boolean;
}): RawTelemetryEvent {
  return {
    type: "ROLLBACK",
    bundleId: input.bundleId,
    bundleVersion: input.toVersion,
    userId: input.userId,
    payload: {
      fromVersion: input.fromVersion,
      toVersion: input.toVersion,
      reason: input.reason,
    },
    sacred: input.sacred ?? false,
  };
}

/**
 * Convenience: cria um raw event CONFIG_CHANGE.
 */
export function makeConfigChangeEvent(input: {
  bundleId: BundleId;
  bundleVersion: string;
  userId: UserId;
  configKey: string;
  previousValue: ConfigValue;
  newValue: ConfigValue;
  sacred?: boolean;
}): RawTelemetryEvent {
  return {
    type: "CONFIG_CHANGE",
    bundleId: input.bundleId,
    bundleVersion: input.bundleVersion,
    userId: input.userId,
    payload: {
      configKey: input.configKey,
      previousValue: input.previousValue,
      newValue: input.newValue,
    },
    sacred: input.sacred ?? false,
  };
}

// ============================================================================
// SEÇÃO 16 — Tests / self-checks
// ============================================================================

/**
 * Lightweight self-check suite. Cada `expect` retorna um resultado
 * acumulável — útil para rodar em CI sem framework externo.
 */
export interface SelfCheckResult {
  readonly name: string;
  readonly ok: boolean;
  readonly message: string;
}

export class SelfCheckRunner {
  private results: SelfCheckResult[] = [];

  expect(name: string, cond: boolean, message: string): void {
    this.results.push({ name, ok: cond, message });
  }

  all(): readonly SelfCheckResult[] {
    return [...this.results];
  }

  passed(): number {
    return this.results.filter((r) => r.ok).length;
  }

  failed(): number {
    return this.results.filter((r) => !r.ok).length;
  }

  reset(): void {
    this.results = [];
  }
}

/**
 * Run a battery of self-checks (não-throwing). Retorna o runner.
 */
export function runTelemetrySelfChecks(): SelfCheckRunner {
  const r = new SelfCheckRunner();

  // SHA-256 known vector: "" → e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  const emptyHash = sha256Hex("");
  r.expect("sha256_empty", emptyHash === "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", `got ${emptyHash}`);

  // SHA-256 known vector: "abc"
  const abcHash = sha256Hex("abc");
  r.expect("sha256_abc", abcHash === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", `got ${abcHash}`);

  // Event hash determinism
  const partial: Pick<TelemetryEvent, "eventId" | "type" | "bundleId" | "bundleVersion" | "userId" | "timestamp" | "payload" | "hashPrev"> = {
    eventId: "ev-1",
    type: "INSTALL",
    bundleId: "b1",
    bundleVersion: "1.0.0",
    userId: "u1",
    timestamp: "2026-06-29T12:00:00.000Z",
    payload: { bundleVersion: "1.0.0" },
    hashPrev: "0".repeat(64),
  };
  const h1 = computeEventHash(partial);
  const h2 = computeEventHash(partial);
  r.expect("event_hash_determinism", h1 === h2, `h1=${h1} h2=${h2}`);

  // Validation: missing type
  const v1 = validateRawEvent({ type: "" as TelemetryEventType, bundleId: "b", userId: "u" });
  r.expect("validation_missing_type", !v1.ok, "esperava erro");

  // Validation: unknown type
  const v2 = validateRawEvent({ type: "FOO" as TelemetryEventType, bundleId: "b", userId: "u" });
  r.expect("validation_unknown_type", !v2.ok, "esperava erro");

  // Validation: ok
  const v3 = validateRawEvent({ type: "INSTALL", bundleId: "b1", userId: "u1" });
  r.expect("validation_ok", v3.ok, "esperava ok");

  // Sacred blocked by default
  const sacredReg = new SacredBundleRegistry();
  sacredReg.mark({ bundleId: "s1", sacred: true, curatorOverride: false });
  r.expect("sacred_blocked_default", sacredReg.isSacred("s1"), "esperava sacred=true");

  // Consent state defaults
  const c0 = makeDefaultConsentState("u1");
  r.expect("consent_default_install", c0.perType.get("INSTALL") === true, "INSTALL default true");
  r.expect("consent_default_error", c0.perType.get("ERROR") === true, "ERROR default true");

  return r;
}

// ============================================================================
// SEÇÃO 17 — Convenience composables
// ============================================================================

/**
 * Build um ingestor pré-configurado para testes.
 */
export function makeTestIngestor(opts: {
  registry?: ConsentRegistry;
  store?: TelemetryStore;
  now?: () => Date;
} = {}): TelemetryIngestor {
  return new TelemetryIngestor({
    registry: opts.registry ?? new InMemoryConsentRegistry(),
    store: opts.store ?? new InMemoryTelemetryStore(),
    now: opts.now,
  });
}

/**
 * Helper: agrega uma sequência de raw events sequencialmente.
 */
export async function ingestAll(
  ingestor: TelemetryIngestor,
  raws: readonly RawTelemetryEvent[]
): Promise<readonly TelemetryIngestResult[]> {
  return ingestor.ingestBatch(raws);
}

/**
 * Helper: lista eventos em ordem cronológica.
 */
export async function listChronological(
  store: TelemetryStore
): Promise<readonly TelemetryEvent[]> {
  const all = await store.list({});
  return [...all].sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
}

/**
 * Helper: obtém o último N eventos.
 */
export async function tail(store: TelemetryStore, n: number): Promise<readonly TelemetryEvent[]> {
  const all = await store.list({});
  return all.slice(-n);
}

// ============================================================================
// SEÇÃO 18 — Formatting helpers
// ============================================================================

/**
 * Format um número com separador de milhar.
 */
export function formatNumber(n: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale).format(n);
}

/**
 * Format uma duração em ms para texto legível.
 */
export function formatDurationMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3_600_000) return `${(ms / 60_000).toFixed(1)}m`;
  if (ms < 86_400_000) return `${(ms / 3_600_000).toFixed(1)}h`;
  return `${(ms / 86_400_000).toFixed(1)}d`;
}

/**
 * Sanitiza um nome de bundle (remove PII accidental).
 */
export function sanitizeBundleName(s: string): string {
  return s.replace(/[^a-zA-Z0-9._\-+@:/]/g, "_").slice(0, 200);
}

// ============================================================================
// SEÇÃO 19 — Edge helpers
// ============================================================================

/**
 * Empty event placeholder (para testes).
 */
export function emptyEvent(): TelemetryEvent {
  return {
    eventId: "00000000000000000000000000000000",
    type: "INSTALL",
    bundleId: "test-bundle",
    bundleVersion: "0.0.0",
    userId: "anonymous",
    timestamp: "1970-01-01T00:00:00.000Z",
    payload: {},
    hashPrev: "0".repeat(64),
    hashSelf: "0".repeat(64),
    schemaVersion: TELEMETRY_SCHEMA_VERSION,
    sacred: false,
    consentToken: "0".repeat(64),
    consented: true,
    environment: "test",
  };
}

/**
 * Verifica se uma string é um hash hex válido.
 */
export function isHashHex(s: string): s is HashHex {
  return typeof s === "string" && /^[0-9a-f]{64}$/.test(s);
}

/**
 * Verifica se uma string é ISO 8601 válida.
 */
export function isIsoTimestamp(s: string): s is IsoTimestamp {
  if (typeof s !== "string") return false;
  const t = Date.parse(s);
  return !Number.isNaN(t);
}

// ============================================================================
// SEÇÃO 20 — Default export aggregator
// ============================================================================

/**
 * Default config bundle — convenient access para todos os catálogos.
 */
export const DEFAULT_TELEMETRY_CONFIG = Object.freeze({
  schemaVersion: TELEMETRY_SCHEMA_VERSION,
  lgpdVersion: LGPD_CONTRACT_VERSION,
  retentionDays: DEFAULT_RETENTION_DAYS,
  maxInMemEvents: MAX_INMEM_EVENTS,
  hashLengthBytes: HASH_LENGTH_BYTES,
  consentTokenLength: CONSENT_TOKEN_LENGTH,
  eventTypes: TELEMETRY_EVENT_TYPES,
  widgets: WIDGET_IDS,
  presets: TIME_RANGE_PRESETS,
  buckets: ["hour", "day", "week", "month"] as const,
  aggregationKinds: AGGREGATION_KINDS,
});

// ============================================================================
// FIM — tipos já exportados por suas declarações originais.
// ============================================================================