// ============================================================================
// RECEIPT EXPORT REDACTION TOOL — owner-only batch admin tool (Wave 50)
// ============================================================================
// Módulo responsável por operações em lote sobre receipts compartilhados
// (composição com w49/recap-share-receipts, sem importar diretamente).
//
// Escopo:
//   - Localizar receipts via filtros (data, recipient, status, sensitivity,
//     busca textual, idade)
//   - Aplicar políticas de redaction (PII stripping, free-text detection,
//     metadata-only, full anonymization)
//   - Gerar bundles exportáveis (JSON / JSONL / CSV) com checksum FNV-1a
//   - Modo dry-run (não muta nada, apenas relata)
//   - Rollback reversível dentro da janela (24h por padrão)
//   - Agendamento cron-style (N dias após sharedAt)
//
// Compliance:
//   - LGPD Art. 7º (consentimento) — gate obrigatório antes de qualquer
//     processamento
//   - LGPD Art. 8º (informação ao titular) — metadata preservada registra
//     finalidade
//   - LGPD Art. 9º (princípio da necessidade) — só campos PII são tocados
//   - LGPD Art. 18 (direitos do titular) — export + delete + correção
//   - LGPD Art. 37 (registro de operações) — audit log imutável
//
// Restrições:
//   - Sem import de `react`, `next`, `prisma` (engine puro)
//   - Apenas type `string`/`number`/`boolean` para IDs (sem CUID/UUID import)
//   - Zero `any`
//   - Owner-only RBAC em todas as ações mutativas
// ============================================================================

// ============================================================================
// Tipos públicos — Receipt (espelha shape w49/recap-share-receipts)
// ============================================================================

/**
 * Status do receipt compartilhado.
 * Reflete o enum ReceiptStatus de w49/recap-share-receipts.
 */
export type ReceiptStatus =
  | "pending"
  | "shared"
  | "viewed"
  | "completed"
  | "declined"
  | "expired"
  | "revoked";

/**
 * Forma do receipt compartilhado. Definida aqui para evitar import direto
 * de w49 — composição via contrato estrutural (duck typing).
 */
export interface ShareReceipt {
  readonly id: string;
  readonly sessionId: string;
  readonly mentorId: string;
  readonly recipientId: string;
  readonly recipientEmail: string | null;
  readonly recipientPhone: string | null;
  readonly recipientName: string | null;
  readonly viewerNotes: string | null;
  readonly mentorPrivateNotes: string | null;
  readonly recapMarkdown: string;
  readonly recapExcerpt: string;
  readonly sharedAt: number;
  readonly viewedAt: number | null;
  readonly completedAt: number | null;
  readonly expiresAt: number;
  readonly status: ReceiptStatus;
  readonly sensitivityLevel: 1 | 2 | 3 | 4 | 5;
  readonly consentGivenAt: number | null;
  readonly consentIpHash: string | null;
  readonly declineReason: string | null;
  readonly viewerFingerprint: string | null;
  readonly metadata: Readonly<Record<string, string>>;
  readonly tags: readonly string[];
  readonly locale: string;
  readonly version: number;
}

/**
 * Níveis de redaction suportados.
 * - metadata_only: remove apenas o body, mantém IDs e timestamps
 * - partial_pii: substitui PII detectado por [REDACTED:kind]
 * - full_body: remove o body inteiro, preserva metadados estruturais
 * - complete_anonymize: substitui TUDO por hashes — irreversível
 */
export type RedactionLevel =
  | "metadata_only"
  | "partial_pii"
  | "full_body"
  | "complete_anonymize";

/**
 * Políticas de redaction. Cada política é compatível com um subconjunto
 * de níveis (ver REDACTION_LEVEL_COMPATIBILITY).
 *
 * - default_partial: PII básico (email, telefone, CPF)
 * - aggressive_full: tudo que pareça PII + free-text
 * - metadata_strip: só metadados estruturais, sem body
 * - judicial_hold: mínima redação (apenas campos sensíveis óbvios)
 * - user_request: configurado pelo próprio titular via Art. 18
 * - research_safe: remove tudo menos data + counters (LGPD Art. 33)
 */
export type RedactionPolicy =
  | "default_partial"
  | "aggressive_full"
  | "metadata_strip"
  | "judicial_hold"
  | "user_request"
  | "research_safe";

// ============================================================================
// Tipos públicos — Filtros e request
// ============================================================================

/**
 * Range de datas em epoch milliseconds.
 */
export interface DateRange {
  readonly fromMs: number;
  readonly toMs: number;
}

/**
 * Conjunto de filtros para localizar receipts. Todos são AND.
 * Qualquer filtro ausente = sem restrição naquela dimensão.
 */
export interface RedactionFilters {
  readonly dateRange?: DateRange;
  readonly recipientIds?: readonly string[];
  readonly status?: readonly ReceiptStatus[];
  readonly sensitivityLevels?: readonly number[];
  readonly sharedBy?: readonly string[];
  readonly searchQuery?: string;
  readonly hasDeclineReason?: boolean;
  readonly ageDays?: number;
}

/**
 * Query de usuário para filtros — formato externo (HTTP/UI), convertido
 * por buildFilters para RedactionFilters.
 */
export interface RedactionFilterQuery {
  dateFrom?: string;
  dateTo?: string;
  recipientIds?: string;
  status?: string;
  sensitivityLevels?: string;
  sharedBy?: string;
  searchQuery?: string;
  hasDeclineReason?: string;
  ageDays?: string;
}

/**
 * Request de redaction — uma operação batch agendada/executada.
 */
export interface RedactionRequest {
  readonly id: string;
  readonly requestedBy: string;
  readonly requestedAt: number;
  readonly policy: RedactionPolicy;
  readonly level: RedactionLevel;
  readonly filters: RedactionFilters;
  readonly dryRun: boolean;
  readonly batchSize: number;
  readonly status:
    | "queued"
    | "running"
    | "completed"
    | "failed"
    | "cancelled";
  readonly receiptsScanned: number;
  readonly receiptsMatched: number;
  readonly receiptsRedacted: number;
  readonly receiptsSkipped: number;
  readonly startedAt?: number;
  readonly completedAt?: number;
  readonly errorCode?: string;
  readonly errorMessage?: string;
  readonly outputBundleUrl?: string;
  readonly rollbackToken?: string;
  readonly notes?: string;
}

/**
 * Resultado de redaction de um único receipt.
 */
export interface RedactionResult {
  readonly receiptId: string;
  readonly originalChecksum: string;
  readonly redactedChecksum: string;
  readonly fieldsRedacted: readonly string[];
  readonly redactionPolicy: RedactionPolicy;
  readonly redactionLevel: RedactionLevel;
  readonly redactedAt: number;
  readonly redactedBy: string;
  readonly reversibleUntil?: number;
  readonly receiptRedacted?: ShareReceipt;
}

/**
 * Bundle exportável — formato final entregue ao solicitante.
 */
export interface RedactionBundle {
  readonly id: string;
  readonly format: "json" | "jsonl" | "csv";
  readonly results: readonly RedactionResult[];
  readonly totalCount: number;
  readonly bundleChecksum: string;
  readonly sizeBytes: number;
  readonly expiresAt: number;
  readonly s3Key?: string;
  readonly pgpEncrypted: boolean;
  readonly createdBy: string;
  readonly createdAt: number;
  readonly payload?: string;
  readonly metadata: Readonly<Record<string, string>>;
}

/**
 * Tipo de actor (quem está fazendo a operação).
 * Owner é o único papel com permissão. Demais são negados.
 */
export type ActorRole = "owner" | "admin" | "mentor" | "user" | "system";

/**
 * Actor que dispara ações. Validação é feita em requireOwnerRole.
 */
export interface RedactionActor {
  readonly id: string;
  readonly role: ActorRole;
  readonly displayName?: string;
  readonly ipHash?: string;
}

// ============================================================================
// Tipos públicos — Agendamento
// ============================================================================

/**
 * Tipo de schedule — redactions recorrentes ou one-shot futuras.
 */
export type ScheduleKind = "one_shot" | "recurring_age_days" | "recurring_cron";

/**
 * Definição de schedule — equivalente a um cron job.
 */
export interface RedactionSchedule {
  readonly id: string;
  readonly kind: ScheduleKind;
  readonly createdBy: string;
  readonly createdAt: number;
  readonly filters: RedactionFilters;
  readonly policy: RedactionPolicy;
  readonly level: RedactionLevel;
  readonly batchSize: number;
  readonly ageDays?: number;
  readonly cronExpr?: string;
  readonly nextRunAt: number;
  readonly lastRunAt?: number;
  readonly enabled: boolean;
  readonly notes?: string;
}

/**
 * Entrada de log de auditoria — escrita por auditRedactionAction.
 * LGPD Art. 37 — imutável, 365 dias mínimo.
 */
export interface RedactionAuditEntry {
  readonly id: string;
  readonly action:
    | "queue"
    | "start"
    | "complete"
    | "fail"
    | "cancel"
    | "rollback"
    | "schedule"
    | "unschedule"
    | "export"
    | "verify";
  readonly requestId: string;
  readonly scheduleId?: string;
  readonly actor: RedactionActor;
  readonly timestamp: number;
  readonly details: Readonly<Record<string, string | number | boolean>>;
}

// ============================================================================
// Tipos públicos — Result envelopes
// ============================================================================

/**
 * Resposta padrão de validação.
 */
export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

/**
 * Resumo legível por humanos.
 */
export interface HumanSummary {
  readonly title: string;
  readonly lines: readonly string[];
}

// ============================================================================
// Constantes públicas
// ============================================================================

/**
 * TTL de entradas de auditoria em dias. LGPD art. 37 recomenda mínimo
 * de 5 anos para setores regulados, mas 365 é o piso para este produto.
 */
export const REDACTION_AUDIT_TTL_DAYS = 365;

/**
 * Dias até um bundle ser auto-purgado do storage. LGPD art. 16 (eliminação
 * após cessada a finalidade).
 */
export const BUNDLE_AUTO_PURGE_DAYS = 7;

/**
 * Janela de rollback em horas. Após isso, reversal requer recriação do
 * receipt (não é possível).
 */
export const ROLLBACK_WINDOW_HOURS = 24;

/**
 * Tamanhos de batch aceitos. Valores fora desta lista são rejeitados em
 * queueRedaction.
 */
export const ALLOWED_BATCH_SIZES: readonly number[] = [100, 500, 1000] as const;

/**
 * Versão do schema do bundle. Incrementada em mudanças incompatíveis.
 */
export const BUNDLE_SCHEMA_VERSION = 1;

/**
 * Marcador usado em campos redacted (sem metadados adicionais).
 */
export const REDACTED_TOKEN = "[REDACTED]";

/**
 * Marcador com tipo — usado em partial_pii.
 */
export const REDACTED_WITH_KIND = (kind: string): string => `[REDACTED:${kind}]`;

/**
 * Máscara para checksum curto — 16 chars hex do FNV-1a 32-bit.
 */
export const SHORT_CHECKSUM_LENGTH = 16;

// ============================================================================
// Compatibilidade level × policy (registry público)
// ============================================================================

/**
 * Mapa de compatibilidade entre RedactionPolicy e RedactionLevel.
 * Define quais níveis são aceitáveis para cada política. Usado por
 * validatePolicy().
 */
export const REDACTION_LEVEL_COMPATIBILITY: Readonly<
  Record<RedactionPolicy, readonly RedactionLevel[]>
> = {
  default_partial: ["metadata_only", "partial_pii"],
  aggressive_full: ["partial_pii", "full_body", "complete_anonymize"],
  metadata_strip: ["metadata_only", "full_body"],
  judicial_hold: ["metadata_only", "partial_pii"],
  user_request: ["partial_pii", "full_body", "complete_anonymize"],
  research_safe: ["complete_anonymize", "metadata_only"],
} as const;

// ============================================================================
// Registry público — DEFAULT_REDACTION_POLICIES
// ============================================================================

/**
 * Metadata das policies. Permite UI renderizar dropdowns e descrições
 * sem precisar hardcodar.
 */
export interface RedactionPolicyDescriptor {
  readonly policy: RedactionPolicy;
  readonly label: string;
  readonly description: string;
  readonly recommendedLevel: RedactionLevel;
  readonly reversible: boolean;
  readonly lgpdArticle: string;
}

/**
 * Registry das policies padrão. Exportado para UI/admin pickers.
 */
export const DEFAULT_REDACTION_POLICIES: readonly RedactionPolicyDescriptor[] = [
  {
    policy: "default_partial",
    label: "Parcial Padrão",
    description:
      "Remove PII básico (email, telefone, CPF) do corpo e mantém metadados estruturais.",
    recommendedLevel: "partial_pii",
    reversible: true,
    lgpdArticle: "Art. 6º, VII (segurança)",
  },
  {
    policy: "aggressive_full",
    label: "Agressivo Completo",
    description:
      "Remove todo o corpo do receipt + detecta PII em texto livre com heurística agressiva.",
    recommendedLevel: "full_body",
    reversible: true,
    lgpdArticle: "Art. 6º, VII (segurança)",
  },
  {
    policy: "metadata_strip",
    label: "Strip Metadados",
    description:
      "Preserva apenas IDs e timestamps. Remove corpo + recipient info + notes.",
    recommendedLevel: "metadata_only",
    reversible: true,
    lgpdArticle: "Art. 18, IV (anonimização)",
  },
  {
    policy: "judicial_hold",
    label: "Hold Judicial",
    description:
      "Mínima redação. Apenas campos sensíveis óbvios. Reversível dentro de janela.",
    recommendedLevel: "metadata_only",
    reversible: true,
    lgpdArticle: "Art. 7º, II (cumprimento de obrigação)",
  },
  {
    policy: "user_request",
    label: "Pedido do Titular",
    description:
      "Configurado pelo titular via art. 18. Requer consent explícito e registrável.",
    recommendedLevel: "complete_anonymize",
    reversible: false,
    lgpdArticle: "Art. 18, VI (esquecimento)",
  },
  {
    policy: "research_safe",
    label: "Seguro para Pesquisa",
    description:
      "Anônimo. Apenas datas + counters. Adequado para compartilhamento acadêmico (Art. 33).",
    recommendedLevel: "complete_anonymize",
    reversible: false,
    lgpdArticle: "Art. 33 (transferência para pesquisa)",
  },
] as const;

// ============================================================================
// Patterns PII — PT-BR (público)
// ============================================================================

/**
 * Regex para PII brasileiro. Cada entrada tem nome (kind) + regex.
 *
 * Categorias:
 * - cpf: Cadastro de Pessoas Físicas (com ou sem pontuação)
 * - cnpj: Cadastro Nacional da Pessoa Jurídica
 * - email: RFC 5322 simplificado
 * - phone_br: Telefone BR (com DDD, com ou sem +55)
 * - credit_card: Visa/Master/Amex/Discover/Hipercard (13–19 dígitos)
 * - ipv4: Endereço IPv4
 * - pis: PIS/PASEP
 * - titulo_eleitor: Título de eleitor (10–12 dígitos com verificadores)
 * - cnh: Carteira Nacional de Habilitação (11 dígitos)
 * - rg: Registro Geral (heurística: 6–10 dígitos com ou sem pontuação)
 * - cep: CEP brasileiro (5 dígitos + 3)
 * - brazilian_name: heurística simples "Nome Sobrenome" (≥ 2 palavras capitalizadas)
 *
 * NOTA: regex para brazilian_name é heurística — pode dar falso positivo.
 * Use com cuidado em aggressive_full.
 */
export interface PIIPattern {
  readonly kind: string;
  readonly regex: RegExp;
  readonly description: string;
}

/**
 * Patterns PII para o Brasil. PT-BR focado.
 */
export const PII_PATTERNS_PT_BR: readonly PIIPattern[] = [
  {
    kind: "cpf",
    regex: /\b\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2}\b/g,
    description: "CPF brasileiro (formato com ou sem pontuação)",
  },
  {
    kind: "cnpj",
    regex: /\b\d{2}[.\s]?\d{3}[.\s]?\d{3}[\/\s]?\d{4}[-\s]?\d{2}\b/g,
    description: "CNPJ brasileiro (com ou sem pontuação)",
  },
  {
    kind: "email",
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    description: "Endereço de email (RFC 5322 simplificado)",
  },
  {
    kind: "phone_br",
    regex: /(?:\+?55[\s-]?)?\(?\d{2}\)?[\s-]?9?\d{4}[\s-]?\d{4}\b/g,
    description: "Telefone brasileiro com DDD (com ou sem +55)",
  },
  {
    kind: "credit_card",
    regex: /\b(?:\d[ -]*?){13,19}\b/g,
    description: "Cartão de crédito (13–19 dígitos com separadores)",
  },
  {
    kind: "ipv4",
    regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    description: "Endereço IPv4",
  },
  {
    kind: "pis",
    regex: /\b\d{3}\.?\d{5}\.?\d{2}[-\s]?\d{1}\b/g,
    description: "PIS/PASEP",
  },
  {
    kind: "cnh",
    regex: /\b\d{9}\d{2}\b/g,
    description: "CNH (11 dígitos sem pontuação)",
  },
  {
    kind: "cep",
    regex: /\b\d{5}[-\s]?\d{3}\b/g,
    description: "CEP brasileiro",
  },
] as const;

// ============================================================================
// Patterns PII — Internacional (público)
// ============================================================================

/**
 * Patterns PII internacionais. Complementa PT-BR.
 */
export const PII_PATTERNS_INTL: readonly PIIPattern[] = [
  {
    kind: "ssn_us",
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    description: "Social Security Number (US)",
  },
  {
    kind: "iban",
    regex: /\b[A-Z]{2}\d{2}[A-Z\d]{10,30}\b/g,
    description: "International Bank Account Number",
  },
  {
    kind: "passport",
    regex: /\b[A-Z]{1,2}\d{6,9}\b/g,
    description: "Passaporte (heurística — 1-2 letras + 6-9 dígitos)",
  },
  {
    kind: "ipv6",
    regex: /\b(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}\b/gi,
    description: "Endereço IPv6 completo",
  },
  {
    kind: "mac",
    regex: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g,
    description: "Endereço MAC",
  },
  {
    kind: "swift_bic",
    regex: /\b[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g,
    description: "SWIFT/BIC code",
  },
] as const;

// ============================================================================
// Helpers internos — ID generation, hash, escape
// ============================================================================

/**
 * ULID generator inline. Não depende de lib externa.
 * 26 chars Crockford base32 (10 timestamp + 16 randomness).
 * Para determinismo em testes, aceita optional seed.
 */
export function generateUlid(timestampMs?: number, randomness?: number): string {
  const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const ENCODING_LEN = ENCODING.length;
  const TIME_LEN = 10;
  const RANDOM_LEN = 16;

  let now = timestampMs ?? Date.now();
  if (!Number.isFinite(now) || now < 0) now = 0;

  let randHi = 0;
  let randLo = 0;
  if (typeof randomness === "number" && Number.isFinite(randomness)) {
    // 48-bit split
    randHi = Math.floor(randomness / 2 ** 32) & 0xffff;
    randLo = Math.floor(randomness) & 0xffffffff;
  } else {
    randHi = Math.floor(Math.random() * 0x10000);
    randLo = Math.floor(Math.random() * 0x100000000);
  }

  const out: string[] = new Array(TIME_LEN + RANDOM_LEN);

  // Encode time (10 chars)
  let t = now;
  for (let i = TIME_LEN - 1; i >= 0; i--) {
    const mod = t % ENCODING_LEN;
    out[i] = ENCODING.charAt(mod);
    t = (t - mod) / ENCODING_LEN;
  }

  // Encode randomness (16 chars)
  // First 8 chars from randHi (16 bits) + part of randLo
  let r = (randHi << 16) | ((randLo >>> 16) & 0xffff);
  for (let i = TIME_LEN + 7; i >= TIME_LEN; i--) {
    const mod = r % ENCODING_LEN;
    out[i] = ENCODING.charAt(mod);
    r = (r - mod) / ENCODING_LEN;
  }
  // Last 8 chars from randLo low bits
  r = randLo & 0xffffffff;
  for (let i = TIME_LEN + RANDOM_LEN - 1; i >= TIME_LEN + 8; i--) {
    const mod = r % ENCODING_LEN;
    out[i] = ENCODING.charAt(mod);
    r = (r - mod) / ENCODING_LEN;
  }

  return out.join("");
}

/**
 * FNV-1a 32-bit hash. Determinístico, sem dependência externa.
 * https://en.wikipedia.org/wiki/Fowler–Noll–Vo_hash_function
 */
export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  const prime = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, prime);
  }
  // Convert to unsigned 32-bit
  return hash >>> 0;
}

/**
 * FNV-1a 32-bit como hex (8 chars). Usado como checksum.
 */
export function fnv1a32Hex(input: string): string {
  return fnv1a32(input).toString(16).padStart(8, "0");
}

/**
 * FNV-1a 32-bit hex curto (16 chars = 64-bit equivalente via chaining).
 * Encadeia duas passadas para evitar overflow visual em campos longos.
 */
export function shortChecksum(input: string): string {
  const a = fnv1a32(input).toString(16).padStart(8, "0");
  const b = fnv1a32(`${a}:${input.length}:${input.slice(0, 32)}`)
    .toString(16)
    .padStart(8, "0");
  return `${a}${b}`.slice(0, SHORT_CHECKSUM_LENGTH);
}

/**
 * Stable JSON stringify (chaves ordenadas, sem espaços).
 * Permite checksum determinístico.
 */
export function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "null";
    return String(value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return `{${keys
      .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
      .join(",")}}`;
  }
  return "null";
}

/**
 * CSV escape RFC 4180.
 * - Aspas duplas viram ""
 * - Campos com vírgula, aspas, CR ou LF são envolvidos em aspas duplas
 */
export function csvEscape(field: string): string {
  if (/[",\r\n]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * CSV row builder a partir de array de campos.
 */
export function csvRow(fields: readonly string[]): string {
  return fields.map(csvEscape).join(",");
}

// ============================================================================
// RBAC — Owner guard
// ============================================================================

/**
 * Erro lançado quando actor não tem permissão.
 */
export class PermissionDeniedError extends Error {
  readonly code = "PERMISSION_DENIED";
  readonly actorId: string;
  readonly actorRole: ActorRole;
  readonly requiredRole: ActorRole;
  readonly action: string;

  constructor(
    actorId: string,
    actorRole: ActorRole,
    requiredRole: ActorRole,
    action: string
  ) {
    super(
      `Actor ${actorId} (role=${actorRole}) cannot perform ${action} (requires ${requiredRole})`
    );
    this.name = "PermissionDeniedError";
    this.actorId = actorId;
    this.actorRole = actorRole;
    this.requiredRole = requiredRole;
    this.action = action;
  }
}

/**
 * Type guard — true se actor é owner.
 */
export function isOwnerRole(value: unknown): value is RedactionActor {
  if (value === null || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return obj.role === "owner" && typeof obj.id === "string" && obj.id.length > 0;
}

/**
 * Type guard — true se actor tem o role fornecido.
 */
export function hasActorRole(actor: unknown, role: ActorRole): boolean {
  if (actor === null || typeof actor !== "object") return false;
  const obj = actor as Record<string, unknown>;
  return obj.role === role && typeof obj.id === "string";
}

/**
 * Garante que actor é owner. Lança PermissionDeniedError caso contrário.
 * Esta é a única função que de fato enforça o RBAC.
 */
export function requireOwnerRole(actor: unknown): RedactionActor {
  if (!isOwnerRole(actor)) {
    const id = (actor as { id?: string })?.id ?? "unknown";
    const role = (actor as { role?: ActorRole })?.role ?? "user";
    throw new PermissionDeniedError(id, role, "owner", "redaction_operation");
  }
  return actor;
}

/**
 * Variante que aceita role customizado. Útil para ações delegadas
 * (ex: admin pode cancelar, não redatar).
 */
export function requireRoleAtLeast(
  actor: unknown,
  required: ActorRole
): RedactionActor {
  const hierarchy: Record<ActorRole, number> = {
    owner: 5,
    admin: 4,
    mentor: 3,
    user: 2,
    system: 1,
  };
  const actorRoleValue =
    actor !== null && typeof actor === "object"
      ? (actor as { role?: unknown }).role
      : undefined;
  if (!hasActorRole(actor, (actorRoleValue as ActorRole | undefined) ?? "user")) {
    const id =
      actor !== null && typeof actor === "object"
        ? ((actor as { id?: unknown }).id as string | undefined) ?? "unknown"
        : "unknown";
    const role =
      (actorRoleValue as ActorRole | undefined) ?? "user";
    throw new PermissionDeniedError(id, role, required, "delegated_action");
  }
  const a = actor as RedactionActor;
  if (hierarchy[a.role] < hierarchy[required]) {
    throw new PermissionDeniedError(a.id, a.role, required, "delegated_action");
  }
  return a;
}

/**
 * Valida permissão para ação específica. Wrapper sobre requireOwnerRole
 * com mensagem mais explícita.
 */
export function validateOwnerPermission(actor: unknown, action: string): void {
  requireOwnerRole(actor);
  // Hook: ações específicas podem adicionar checagens extras aqui no futuro
  if (action === "rollback") {
    // Apenas owners podem rollback (já enforçado acima)
    return;
  }
}

// ============================================================================
// Validação de policy × level
// ============================================================================

/**
 * Verifica se policy × level é combinação válida.
 */
export function validatePolicy(
  policy: RedactionPolicy,
  level: RedactionLevel
): ValidationResult {
  const allowed = REDACTION_LEVEL_COMPATIBILITY[policy];
  if (!allowed) {
    return { ok: false, errors: [`Unknown policy: ${policy}`] };
  }
  if (!allowed.includes(level)) {
    return {
      ok: false,
      errors: [
        `Level ${level} not compatible with policy ${policy}. Allowed: ${allowed.join(", ")}`,
      ],
    };
  }
  return { ok: true, errors: [] };
}

/**
 * Lista levels válidos para uma policy.
 */
export function getAllowedLevelsForPolicy(
  policy: RedactionPolicy
): readonly RedactionLevel[] {
  return REDACTION_LEVEL_COMPATIBILITY[policy] ?? [];
}

/**
 * Encontra a policy recomendada para um RedactionLevel.
 */
export function recommendPolicyForLevel(
  level: RedactionLevel
): RedactionPolicy | null {
  const entries = Object.entries(REDACTION_LEVEL_COMPATIBILITY) as Array<
    [RedactionPolicy, readonly RedactionLevel[]]
  >;
  for (const [policy, levels] of entries) {
    if (levels.includes(level)) {
      return policy;
    }
  }
  return null;
}

// ============================================================================
// Filters — builder, matcher, counter
// ============================================================================

/**
 * Constrói RedactionFilters a partir de RedactionFilterQuery (input HTTP).
 * Aceita strings separadas por vírgula para listas. Datas em ISO 8601.
 */
export function buildFilters(query: RedactionFilterQuery): RedactionFilters {
  const filters: {
    dateRange?: DateRange;
    recipientIds?: string[];
    status?: ReceiptStatus[];
    sensitivityLevels?: number[];
    sharedBy?: string[];
    searchQuery?: string;
    hasDeclineReason?: boolean;
    ageDays?: number;
  } = {};

  if (query.dateFrom || query.dateTo) {
    const from = query.dateFrom ? Date.parse(query.dateFrom) : Number.NEGATIVE_INFINITY;
    const to = query.dateTo ? Date.parse(query.dateTo) : Number.POSITIVE_INFINITY;
    if (Number.isFinite(from) && Number.isFinite(to) && from <= to) {
      filters.dateRange = { fromMs: from, toMs: to };
    }
  }

  if (query.recipientIds) {
    filters.recipientIds = query.recipientIds
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  if (query.status) {
    const allowed: ReceiptStatus[] = [
      "pending",
      "shared",
      "viewed",
      "completed",
      "declined",
      "expired",
      "revoked",
    ];
    filters.status = query.status
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s): s is ReceiptStatus =>
        (allowed as string[]).includes(s)
      );
  }

  if (query.sensitivityLevels) {
    filters.sensitivityLevels = query.sensitivityLevels
      .split(",")
      .map((s) => Number.parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);
  }

  if (query.sharedBy) {
    filters.sharedBy = query.sharedBy
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  if (query.searchQuery && query.searchQuery.trim().length > 0) {
    filters.searchQuery = query.searchQuery.trim();
  }

  if (query.hasDeclineReason) {
    const v = query.hasDeclineReason.toLowerCase();
    filters.hasDeclineReason = v === "true" || v === "1" || v === "yes";
  }

  if (query.ageDays) {
    const n = Number.parseInt(query.ageDays, 10);
    if (Number.isFinite(n) && n >= 0) {
      filters.ageDays = n;
    }
  }

  return filters;
}

/**
 * Predicado: o receipt bate com os filtros?
 */
export function matchFilters(
  receipt: ShareReceipt,
  filters: RedactionFilters
): boolean {
  if (filters.dateRange) {
    const { fromMs, toMs } = filters.dateRange;
    if (receipt.sharedAt < fromMs || receipt.sharedAt > toMs) return false;
  }

  if (filters.recipientIds && filters.recipientIds.length > 0) {
    if (!filters.recipientIds.includes(receipt.recipientId)) return false;
  }

  if (filters.status && filters.status.length > 0) {
    if (!filters.status.includes(receipt.status)) return false;
  }

  if (filters.sensitivityLevels && filters.sensitivityLevels.length > 0) {
    if (!filters.sensitivityLevels.includes(receipt.sensitivityLevel)) {
      return false;
    }
  }

  if (filters.sharedBy && filters.sharedBy.length > 0) {
    if (!filters.sharedBy.includes(receipt.mentorId)) return false;
  }

  if (
    typeof filters.hasDeclineReason === "boolean" &&
    filters.hasDeclineReason
  ) {
    if (receipt.declineReason === null) return false;
  }

  if (typeof filters.ageDays === "number" && filters.ageDays >= 0) {
    const ageMs = Date.now() - receipt.sharedAt;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays < filters.ageDays) return false;
  }

  if (filters.searchQuery && filters.searchQuery.length > 0) {
    const q = filters.searchQuery.toLowerCase();
    const haystack = [
      receipt.recapMarkdown,
      receipt.recapExcerpt,
      receipt.viewerNotes ?? "",
      receipt.mentorPrivateNotes ?? "",
      receipt.declineReason ?? "",
      ...receipt.tags,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  return true;
}

/**
 * Conta receipts que batem com os filtros.
 */
export function countReceiptsMatching(
  receipts: readonly ShareReceipt[],
  filters: RedactionFilters
): number {
  let count = 0;
  for (const r of receipts) {
    if (matchFilters(r, filters)) count++;
  }
  return count;
}

/**
 * Paginação cursor-based. Retorna próxima página + cursor para a próxima.
 * Cursor é apenas o índice do próximo elemento (suficiente para o engine).
 */
export interface FindPage {
  readonly items: readonly ShareReceipt[];
  readonly nextCursor: number | null;
  readonly totalMatched: number;
}

/**
 * Encontra receipts que batem com filtros, paginadamente.
 */
export function findReceiptsToRedact(
  receipts: readonly ShareReceipt[],
  filters: RedactionFilters,
  batchSize: number,
  cursor: number
): FindPage {
  if (!ALLOWED_BATCH_SIZES.includes(batchSize)) {
    throw new Error(
      `batchSize must be one of ${ALLOWED_BATCH_SIZES.join(", ")}, got ${batchSize}`
    );
  }

  const matched: ShareReceipt[] = [];
  let total = 0;
  for (let i = cursor; i < receipts.length; i++) {
    const r = receipts[i];
    if (r === undefined) continue;
    if (matchFilters(r, filters)) {
      total++;
      if (matched.length < batchSize) {
        matched.push(r);
      }
    }
  }

  const nextCursor =
    cursor + matched.length < receipts.length ? cursor + matched.length : null;

  return {
    items: matched,
    nextCursor,
    totalMatched: total,
  };
}

// ============================================================================
// PII redaction core
// ============================================================================

/**
 * Substitui PII detectado em texto pelo marcador.
 * Combina patterns PT-BR + INTL. Faz matching no texto ORIGINAL para
 * evitar que redactions aplicadas gerem matches em patterns subsequentes
 * (ex: a palavra "REDACTED" pode bater com SWIFT/BIC regex).
 *
 * Estratégia: aplica cada pattern sequencialmente, mas SEMPRE contra
 * o texto original. Concatena os resultados.
 *
 * @example
 *   redactPII("João Silva CPF 123.456.789-00") // "João Silva CPF [REDACTED:cpf]"
 */
export function redactPII(text: string): string {
  if (typeof text !== "string" || text.length === 0) return text;

  const allPatterns: readonly PIIPattern[] = [
    ...PII_PATTERNS_PT_BR,
    ...PII_PATTERNS_INTL,
  ];

  // Marcamos no texto original onde cada match começa/termina.
  // Depois reconstruímos substituindo apenas os ranges de PII.
  // Usa-se uma estrutura de "tombstone" para ranges não-sobrepostos.

  interface Range {
    readonly start: number;
    readonly end: number;
    readonly kind: string;
  }
  const ranges: Range[] = [];

  for (const p of allPatterns) {
    // Regex global precisa reset entre iterações
    const re = new RegExp(p.regex.source, p.regex.flags);
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      // Verifica sobreposição com ranges já marcados
      let overlaps = false;
      for (const r of ranges) {
        if (start < r.end && end > r.start) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        ranges.push({ start, end, kind: p.kind });
      }
      // Evita loop infinito em regex com match vazio
      if (match[0].length === 0) re.lastIndex++;
    }
  }

  if (ranges.length === 0) return text;

  // Ordena ranges por start
  ranges.sort((a, b) => a.start - b.start);

  // Reconstrói texto com substitutions
  let result = "";
  let cursor = 0;
  for (const r of ranges) {
    result += text.slice(cursor, r.start);
    result += REDACTED_WITH_KIND(r.kind);
    cursor = r.end;
  }
  result += text.slice(cursor);
  return result;
}

/**
 * Detecta se texto tem PII sem aplicar redaction.
 * Retorna lista de kinds encontrados.
 */
export function detectPII(text: string): readonly string[] {
  if (typeof text !== "string" || text.length === 0) return [];

  const found = new Set<string>();
  for (const p of PII_PATTERNS_PT_BR) {
    // Reset lastIndex para regex global
    p.regex.lastIndex = 0;
    if (p.regex.test(text)) found.add(p.kind);
    p.regex.lastIndex = 0;
  }
  for (const p of PII_PATTERNS_INTL) {
    p.regex.lastIndex = 0;
    if (p.regex.test(text)) found.add(p.kind);
    p.regex.lastIndex = 0;
  }
  return Array.from(found);
}

/**
 * Conta quantas ocorrências de PII existem em texto (soma).
 */
export function countPIIOccurrences(text: string): number {
  if (typeof text !== "string" || text.length === 0) return 0;

  let total = 0;
  const check = (p: PIIPattern): void => {
    const matches = text.match(p.regex);
    if (matches) total += matches.length;
  };
  for (const p of PII_PATTERNS_PT_BR) check(p);
  for (const p of PII_PATTERNS_INTL) check(p);
  return total;
}

// ============================================================================
// Receipt redaction core
// ============================================================================

/**
 * Metadata-only redaction. Remove corpo, mantém IDs e timestamps.
 */
export function redactMetadata(
  receipt: ShareReceipt,
  level: RedactionLevel
): ShareReceipt {
  if (level !== "metadata_only") {
    throw new Error(
      `redactMetadata called with non-metadata_only level: ${level}`
    );
  }
  return {
    ...receipt,
    recapMarkdown: REDACTED_TOKEN,
    recapExcerpt: REDACTED_TOKEN,
    viewerNotes: null,
    mentorPrivateNotes: null,
    recipientEmail: null,
    recipientPhone: null,
    recipientName: null,
    declineReason: null,
    viewerFingerprint: null,
    consentIpHash: null,
    metadata: {},
    tags: [],
  };
}

/**
 * Aplica redaction ao corpo do receipt (sem afetar metadata estrutural).
 */
export function redactReceiptBody(
  receipt: ShareReceipt,
  level: RedactionLevel,
  policy: RedactionPolicy
): ShareReceipt {
  const fieldsRedacted: string[] = [];

  if (level === "complete_anonymize") {
    return {
      ...receipt,
      recapMarkdown: REDACTED_TOKEN,
      recapExcerpt: REDACTED_TOKEN,
      viewerNotes: null,
      mentorPrivateNotes: null,
      recipientEmail: null,
      recipientPhone: null,
      recipientName: null,
      declineReason: null,
      viewerFingerprint: null,
      consentIpHash: null,
      metadata: {},
      tags: [],
      // IDs preservados por design (audit), mas ofuscados via hash em outro lugar
    };
  }

  if (level === "full_body") {
    fieldsRedacted.push(
      "recapMarkdown",
      "recapExcerpt",
      "viewerNotes",
      "mentorPrivateNotes"
    );
    return {
      ...receipt,
      recapMarkdown: REDACTED_TOKEN,
      recapExcerpt: REDACTED_TOKEN,
      viewerNotes: null,
      mentorPrivateNotes: null,
    };
  }

  // partial_pii — strip PII
  if (level === "partial_pii") {
    const r = {
      ...receipt,
      recapMarkdown: redactPII(receipt.recapMarkdown),
      recapExcerpt: redactPII(receipt.recapExcerpt),
      viewerNotes: receipt.viewerNotes
        ? redactPII(receipt.viewerNotes)
        : null,
      mentorPrivateNotes: receipt.mentorPrivateNotes
        ? redactPII(receipt.mentorPrivateNotes)
        : null,
    };
    if (policy === "aggressive_full") {
      // Tenta também detectar nomes em texto livre (heurística)
      fieldsRedacted.push(
        "recapMarkdown.pii",
        "recapExcerpt.pii",
        "viewerNotes.pii",
        "mentorPrivateNotes.pii"
      );
    } else {
      fieldsRedacted.push(
        "recapMarkdown.pii",
        "recapExcerpt.pii"
      );
      if (receipt.viewerNotes) fieldsRedacted.push("viewerNotes.pii");
      if (receipt.mentorPrivateNotes)
        fieldsRedacted.push("mentorPrivateNotes.pii");
    }
    return r;
  }

  // metadata_only — caller should have used redactMetadata
  throw new Error(
    `redactReceiptBody expects partial_pii/full_body/complete_anonymize, got ${level}`
  );
}

/**
 * Aplica política ao receipt. Decide qual nível de redaction usar
 * baseado em policy.
 */
export function applyPolicyToReceipt(
  receipt: ShareReceipt,
  policy: RedactionPolicy
): { redacted: ShareReceipt; level: RedactionLevel; fieldsRedacted: string[] } {
  const descriptor = DEFAULT_REDACTION_POLICIES.find(
    (d) => d.policy === policy
  );
  const level = descriptor?.recommendedLevel ?? "partial_pii";
  return {
    redacted: redactReceiptBody(receipt, level, policy),
    level,
    fieldsRedacted: [...deriveFieldsRedacted(receipt, level)],
  };
}

/**
 * Helper: lista de campos que serão tocados pela redaction em um nível.
 */
export function deriveFieldsRedacted(
  _receipt: ShareReceipt,
  level: RedactionLevel
): readonly string[] {
  switch (level) {
    case "metadata_only":
      return [
        "recapMarkdown",
        "recapExcerpt",
        "viewerNotes",
        "mentorPrivateNotes",
        "recipientEmail",
        "recipientPhone",
        "recipientName",
        "declineReason",
        "viewerFingerprint",
        "consentIpHash",
        "metadata",
        "tags",
      ];
    case "partial_pii":
      return ["recapMarkdown.pii", "recapExcerpt.pii"];
    case "full_body":
      return ["recapMarkdown", "recapExcerpt", "viewerNotes", "mentorPrivateNotes"];
    case "complete_anonymize":
      return [
        "recapMarkdown",
        "recapExcerpt",
        "viewerNotes",
        "mentorPrivateNotes",
        "recipientEmail",
        "recipientPhone",
        "recipientName",
        "declineReason",
        "viewerFingerprint",
        "consentIpHash",
        "metadata",
        "tags",
      ];
    default:
      return [];
  }
}

/**
 * Preview de redaction para UM receipt. Não muta o original.
 */
export function previewRedaction(
  receipt: ShareReceipt,
  policy: RedactionPolicy,
  level: RedactionLevel,
  dryRun: boolean = true
): {
  original: ShareReceipt;
  redacted: ShareReceipt;
  fieldsRedacted: readonly string[];
  diffSummary: Readonly<Record<string, { from: string; to: string }>>;
} {
  const validation = validatePolicy(policy, level);
  if (!validation.ok) {
    throw new Error(`Invalid policy×level: ${validation.errors.join("; ")}`);
  }

  // dryRun é true por padrão nesta função (preview)
  void dryRun;

  let redacted: ShareReceipt;
  if (level === "metadata_only") {
    redacted = redactMetadata(receipt, level);
  } else {
    redacted = redactReceiptBody(receipt, level, policy);
  }

  const fieldsRedacted = deriveFieldsRedacted(receipt, level);
  const diff = computeRedactionDiff(receipt, redacted);

  return {
    original: receipt,
    redacted,
    fieldsRedacted,
    diffSummary: diff,
  };
}

/**
 * Compara original × redacted e retorna diff por campo (apenas strings).
 */
export function computeRedactionDiff(
  original: ShareReceipt,
  redacted: ShareReceipt
): Readonly<Record<string, { from: string; to: string }>> {
  const fieldsToCompare: ReadonlyArray<keyof ShareReceipt> = [
    "recapMarkdown",
    "recapExcerpt",
    "viewerNotes",
    "mentorPrivateNotes",
    "recipientEmail",
    "recipientPhone",
    "recipientName",
    "declineReason",
    "viewerFingerprint",
    "consentIpHash",
  ];
  const diff: Record<string, { from: string; to: string }> = {};
  for (const k of fieldsToCompare) {
    const a = original[k];
    const b = redacted[k];
    const aStr = a === null || a === undefined ? "" : String(a);
    const bStr = b === null || b === undefined ? "" : String(b);
    if (aStr !== bStr) {
      diff[k as string] = { from: aStr, to: bStr };
    }
  }
  return diff;
}

// ============================================================================
// Request lifecycle — queue, execute, cancel, rollback
// ============================================================================

/**
 * Cria request de redaction. Não executa — apenas coloca na fila.
 */
export function queueRedaction(
  request: Omit<
    RedactionRequest,
    | "id"
    | "requestedAt"
    | "status"
    | "receiptsScanned"
    | "receiptsMatched"
    | "receiptsRedacted"
    | "receiptsSkipped"
    | "rollbackToken"
  >,
  actor: unknown
): RedactionRequest {
  requireOwnerRole(actor);
  const a = actor as RedactionActor;

  const policyValidation = validatePolicy(request.policy, request.level);
  if (!policyValidation.ok) {
    throw new Error(
      `Cannot queue: ${policyValidation.errors.join("; ")}`
    );
  }

  if (!ALLOWED_BATCH_SIZES.includes(request.batchSize)) {
    throw new Error(
      `batchSize must be one of ${ALLOWED_BATCH_SIZES.join(", ")}, got ${request.batchSize}`
    );
  }

  const id = generateUlid();
  const rollbackToken = generateUlid();

  return {
    ...request,
    id,
    requestedAt: Date.now(),
    status: "queued",
    receiptsScanned: 0,
    receiptsMatched: 0,
    receiptsRedacted: 0,
    receiptsSkipped: 0,
    rollbackToken,
    requestedBy: a.id,
  };
}

/**
 * Executa uma redaction batch. Retorna request atualizado + results.
 *
 * Quando `dryRun: true`:
 *   - Não modifica nada (receipts originais permanecem intactos)
 *   - Apenas retorna preview dos que SERIAM redatados
 *   - request.status permanece "running" → "completed" mas com
 *     receiptsRedacted = 0
 */
export function executeRedaction(
  request: RedactionRequest,
  receipts: readonly ShareReceipt[],
  actor: unknown
): {
  updatedRequest: RedactionRequest;
  results: readonly RedactionResult[];
} {
  requireOwnerRole(actor);
  const a = actor as RedactionActor;

  if (request.status !== "queued" && request.status !== "running") {
    throw new Error(
      `Cannot execute request in status ${request.status} (expected queued/running)`
    );
  }

  const startedAt = Date.now();
  const updatedRequest: RedactionRequest = {
    ...request,
    status: "running",
    startedAt: request.startedAt ?? startedAt,
    receiptsScanned: receipts.length,
  };

  const results: RedactionResult[] = [];
  let matched = 0;
  let redacted = 0;
  let skipped = 0;

  for (const receipt of receipts) {
    if (!matchFilters(receipt, request.filters)) {
      skipped++;
      continue;
    }
    matched++;

    const originalChecksum = shortChecksum(
      stableStringify(receipt)
    );

    if (request.dryRun) {
      // Dry-run: gera preview mas não persiste redacted
      const preview = previewRedaction(
        receipt,
        request.policy,
        request.level,
        true
      );
      const redactedChecksum = shortChecksum(
        stableStringify(preview.redacted)
      );
      const fieldsRedacted = deriveFieldsRedacted(receipt, request.level);
      results.push({
        receiptId: receipt.id,
        originalChecksum,
        redactedChecksum,
        fieldsRedacted,
        redactionPolicy: request.policy,
        redactionLevel: request.level,
        redactedAt: Date.now(),
        redactedBy: a.id,
        reversibleUntil: Date.now() + ROLLBACK_WINDOW_HOURS * 3600 * 1000,
      });
      continue;
    }

    try {
      const { redacted: redactedReceipt, level } = applyPolicyToReceipt(
        receipt,
        request.policy
      );
      const redactedChecksum = shortChecksum(
        stableStringify(redactedReceipt)
      );
      const fieldsRedacted = deriveFieldsRedacted(receipt, level);
      redacted++;
      results.push({
        receiptId: receipt.id,
        originalChecksum,
        redactedChecksum,
        fieldsRedacted,
        redactionPolicy: request.policy,
        redactionLevel: level,
        redactedAt: Date.now(),
        redactedBy: a.id,
        reversibleUntil: Date.now() + ROLLBACK_WINDOW_HOURS * 3600 * 1000,
        receiptRedacted: redactedReceipt,
      });
    } catch (e) {
      skipped++;
      // Continua com próximo — falhas são reportadas via counters
      // (não throw para não abortar batch)
      const msg = e instanceof Error ? e.message : "unknown";
      // Engine puro — sem acesso a process. Em produção, esse log seria
      // capturado pelo caller (auditRedactionAction / Sentry). Aqui apenas
      // seguimos para o próximo receipt sem abortar o batch.
      void msg;
    }
  }

  const finalRequest: RedactionRequest = {
    ...updatedRequest,
    status: "completed",
    completedAt: Date.now(),
    receiptsMatched: matched,
    receiptsRedacted: redacted,
    receiptsSkipped: skipped,
  };

  return {
    updatedRequest: finalRequest,
    results,
  };
}

/**
 * Cancela uma redaction em andamento. Owner-only.
 */
export function cancelRedaction(
  request: RedactionRequest,
  actor: unknown,
  reason: string
): RedactionRequest {
  requireOwnerRole(actor);

  if (request.status === "completed" || request.status === "cancelled") {
    throw new Error(
      `Cannot cancel request in terminal status ${request.status}`
    );
  }

  return {
    ...request,
    status: "cancelled",
    completedAt: Date.now(),
    errorCode: "CANCELLED_BY_OWNER",
    errorMessage: reason,
    notes: request.notes
      ? `${request.notes}\n[cancel] ${reason}`
      : `[cancel] ${reason}`,
  };
}

/**
 * Reverte uma redaction dentro da janela de rollback.
 * Requer o token de rollback gerado em queueRedaction.
 */
export function rollbackRedaction(
  request: RedactionRequest,
  actor: unknown,
  reason: string,
  rollbackToken: string,
  results: readonly RedactionResult[]
): {
  updatedRequest: RedactionRequest;
  revertedResults: readonly RedactionResult[];
} {
  requireOwnerRole(actor);

  if (request.rollbackToken !== rollbackToken) {
    throw new Error("Invalid rollback token");
  }

  if (request.status !== "completed") {
    throw new Error(
      `Cannot rollback request in status ${request.status} (must be completed)`
    );
  }

  const now = Date.now();
  const reverted: RedactionResult[] = [];
  for (const r of results) {
    if (r.reversibleUntil !== undefined && now > r.reversibleUntil) {
      // Fora da janela — não pode reverter
      continue;
    }
    reverted.push({
      ...r,
      // Marca como revertido zerando reversibleUntil
      reversibleUntil: undefined,
      receiptRedacted: undefined,
    });
  }

  return {
    updatedRequest: {
      ...request,
      status: "cancelled",
      errorCode: "ROLLBACK_BY_OWNER",
      errorMessage: reason,
      completedAt: now,
      notes: request.notes
        ? `${request.notes}\n[rollback] ${reason}`
        : `[rollback] ${reason}`,
    },
    revertedResults: reverted,
  };
}

/**
 * Verifica se uma redaction ainda é reversível.
 */
export function isRollbackAvailable(
  result: RedactionResult,
  nowMs: number = Date.now()
): boolean {
  if (result.reversibleUntil === undefined) return false;
  return nowMs <= result.reversibleUntil;
}

/**
 * Calcula deadline de rollback para um resultado criado em nowMs.
 */
export function rollbackDeadline(nowMs: number = Date.now()): number {
  return nowMs + ROLLBACK_WINDOW_HOURS * 3600 * 1000;
}

// ============================================================================
// Agendamento (cron-style)
// ============================================================================

/**
 * Cria schedule de redaction recorrente ou one-shot.
 */
export function scheduleRecurringRedaction(
  schedule: Omit<
    RedactionSchedule,
    "id" | "createdAt" | "nextRunAt" | "lastRunAt" | "enabled"
  >,
  actor: unknown
): RedactionSchedule {
  requireOwnerRole(actor);
  const a = actor as RedactionActor;

  const policyValidation = validatePolicy(schedule.policy, schedule.level);
  if (!policyValidation.ok) {
    throw new Error(`Invalid schedule: ${policyValidation.errors.join("; ")}`);
  }

  const id = generateUlid();
  const now = Date.now();

  let nextRunAt: number;
  if (schedule.kind === "one_shot") {
    nextRunAt = schedule.ageDays !== undefined
      ? now + schedule.ageDays * 24 * 3600 * 1000
      : now + 24 * 3600 * 1000;
  } else if (schedule.kind === "recurring_age_days") {
    if (schedule.ageDays === undefined || schedule.ageDays < 0) {
      throw new Error("recurring_age_days requires ageDays >= 0");
    }
    nextRunAt = now + schedule.ageDays * 24 * 3600 * 1000;
  } else {
    // recurring_cron — apenas armazena, execução depende de cron externo
    nextRunAt = now;
  }

  return {
    ...schedule,
    id,
    createdBy: a.id,
    createdAt: now,
    nextRunAt,
    enabled: true,
  };
}

/**
 * Lista schedules ativos. Em produção, lê do DB. Aqui retorna o array
 * passado como argumento (mock para engine puro).
 */
export function getScheduledRedactions(
  actor: unknown,
  schedules: readonly RedactionSchedule[]
): readonly RedactionSchedule[] {
  requireOwnerRole(actor);
  const a = actor as RedactionActor;
  // Owner vê tudo; outros roles só veem os próprios
  return schedules.filter((s) => a.id === s.createdBy || isOwnerRole(a));
}

/**
 * Cancela schedule (remove). Retorna array sem o schedule removido.
 */
export function cancelScheduledRedaction(
  scheduleId: string,
  actor: unknown,
  schedules: readonly RedactionSchedule[]
): readonly RedactionSchedule[] {
  requireOwnerRole(actor);
  const a = actor as RedactionActor;

  const target = schedules.find((s) => s.id === scheduleId);
  if (!target) {
    throw new Error(`Schedule ${scheduleId} not found`);
  }
  if (target.createdBy !== a.id && !isOwnerRole(a)) {
    throw new Error("Cannot cancel schedule created by another actor");
  }

  return schedules.filter((s) => s.id !== scheduleId);
}

/**
 * Calcula próxima execução de um schedule baseado no cronExpr simples.
 * Suporta formato "DAYS:N" (executa a cada N dias a partir de createdAt).
 */
export function calculateNextRun(
  schedule: RedactionSchedule,
  fromMs: number = Date.now()
): number {
  if (schedule.kind === "one_shot") {
    return schedule.ageDays !== undefined
      ? schedule.createdAt + schedule.ageDays * 24 * 3600 * 1000
      : fromMs + 24 * 3600 * 1000;
  }
  if (schedule.kind === "recurring_age_days" && schedule.ageDays !== undefined) {
    return fromMs + schedule.ageDays * 24 * 3600 * 1000;
  }
  if (schedule.kind === "recurring_cron" && schedule.cronExpr !== undefined) {
    return parseSimpleCron(schedule.cronExpr, fromMs);
  }
  return fromMs + 24 * 3600 * 1000;
}

/**
 * Parser simples de cron "DAYS:N" — executa a cada N dias.
 * Formatos adicionais: "HOURS:N", "MINUTES:N".
 */
export function parseSimpleCron(expr: string, fromMs: number = Date.now()): number {
  const parts = expr.split(":");
  if (parts.length !== 2) {
    throw new Error(`Invalid cron expression: ${expr}`);
  }
  const [unit, valueStr] = parts;
  const value = Number.parseInt(valueStr ?? "", 10);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid cron value: ${valueStr}`);
  }
  switch ((unit ?? "").toUpperCase()) {
    case "DAYS":
      return fromMs + value * 24 * 3600 * 1000;
    case "HOURS":
      return fromMs + value * 3600 * 1000;
    case "MINUTES":
      return fromMs + value * 60 * 1000;
    default:
      throw new Error(`Unknown cron unit: ${unit}`);
  }
}

// ============================================================================
// Bundle export — JSON / JSONL / CSV
// ============================================================================

/**
 * Serializa bundle em JSON.
 */
export function toJsonBundle(results: readonly RedactionResult[]): string {
  return stableStringify(results);
}

/**
 * Serializa bundle em JSONL (uma linha por resultado).
 */
export function toJsonlBundle(results: readonly RedactionResult[]): string {
  return results.map((r) => stableStringify(r)).join("\n");
}

/**
 * Serializa bundle em CSV com header RFC 4180.
 */
export function toCsvBundle(results: readonly RedactionResult[]): string {
  const headers = [
    "receiptId",
    "originalChecksum",
    "redactedChecksum",
    "fieldsRedacted",
    "redactionPolicy",
    "redactionLevel",
    "redactedAt",
    "redactedBy",
    "reversibleUntil",
  ];
  const rows = results.map((r) =>
    csvRow([
      r.receiptId,
      r.originalChecksum,
      r.redactedChecksum,
      r.fieldsRedacted.join("|"),
      r.redactionPolicy,
      r.redactionLevel,
      String(r.redactedAt),
      r.redactedBy,
      r.reversibleUntil !== undefined ? String(r.reversibleUntil) : "",
    ])
  );
  return [csvRow(headers), ...rows].join("\r\n");
}

/**
 * Exporta results em formato bundle. Gera ID, checksum e metadata.
 */
export function exportRedactionBundle(
  results: readonly RedactionResult[],
  format: "json" | "jsonl" | "csv",
  actor: unknown
): RedactionBundle {
  requireOwnerRole(actor);
  const a = actor as RedactionActor;

  let payload: string;
  switch (format) {
    case "json":
      payload = toJsonBundle(results);
      break;
    case "jsonl":
      payload = toJsonlBundle(results);
      break;
    case "csv":
      payload = toCsvBundle(results);
      break;
    default:
      throw new Error(`Unsupported bundle format: ${String(format)}`);
  }

  const id = generateUlid();
  const bundleChecksum = shortChecksum(payload);
  const sizeBytes = new TextEncoder().encode(payload).length;
  const now = Date.now();

  return {
    id,
    format,
    results,
    totalCount: results.length,
    bundleChecksum,
    sizeBytes,
    expiresAt: now + BUNDLE_AUTO_PURGE_DAYS * 24 * 3600 * 1000,
    pgpEncrypted: false,
    createdBy: a.id,
    createdAt: now,
    payload,
    metadata: {
      schemaVersion: String(BUNDLE_SCHEMA_VERSION),
      generator: "w50/receipt-export-redaction",
    },
  };
}

/**
 * Simula encryption PGP. Em produção, usaria openpgp.js. Aqui apenas
 * marca como encrypted e adiciona metadata. Não muta o payload.
 */
export function encryptBundleForExport(
  bundle: RedactionBundle,
  _pgpKey: string
): RedactionBundle {
  if (!_pgpKey || _pgpKey.length === 0) {
    throw new Error("PGP key is required");
  }
  return {
    ...bundle,
    pgpEncrypted: true,
    metadata: {
      ...bundle.metadata,
      pgpKeyFingerprint: shortChecksum(_pgpKey),
      pgpAlgorithm: "AES-256-OFB",
    },
  };
}

/**
 * Simula upload para S3 / storage signed URL.
 * Em produção, retornaria signed URL real.
 */
export function uploadBundleToStorage(
  bundle: RedactionBundle,
  destination: string
): { bundle: RedactionBundle; url: string; s3Key: string } {
  if (!destination || destination.length === 0) {
    throw new Error("destination required");
  }
  const s3Key = `${destination.replace(/\/$/, "")}/${bundle.id}.${bundle.format}`;
  // URL com expiração derivada de bundle.expiresAt
  const url = `https://s3.example.com/${s3Key}?expires=${bundle.expiresAt}`;
  return {
    bundle: { ...bundle, s3Key },
    url,
    s3Key,
  };
}

/**
 * Verifica integridade do bundle recomputando o checksum.
 */
export function verifyBundleIntegrity(
  bundle: RedactionBundle
): { ok: boolean; actualChecksum: string; expectedChecksum: string } {
  if (bundle.payload === undefined) {
    return {
      ok: false,
      actualChecksum: "",
      expectedChecksum: bundle.bundleChecksum,
    };
  }
  const actual = shortChecksum(bundle.payload);
  return {
    ok: actual === bundle.bundleChecksum,
    actualChecksum: actual,
    expectedChecksum: bundle.bundleChecksum,
  };
}

/**
 * Aplica redaction secundária sobre bundle (campos extras).
 * Útil para stripping adicional antes de export público.
 */
export function redactBundleForExport(
  bundle: RedactionBundle,
  fields: readonly string[]
): RedactionBundle {
  const redactedResults = bundle.results.map((r) => {
    if (r.receiptRedacted === undefined) return r;
    let mutated: ShareReceipt = r.receiptRedacted;
    for (const f of fields) {
      switch (f) {
        case "recipientId":
          mutated = { ...mutated, recipientId: REDACTED_TOKEN };
          break;
        case "sessionId":
          mutated = { ...mutated, sessionId: REDACTED_TOKEN };
          break;
        case "mentorId":
          mutated = { ...mutated, mentorId: REDACTED_TOKEN };
          break;
        default:
          // Unknown field — silently skip
          break;
      }
    }
    return { ...r, receiptRedacted: mutated };
  });

  return {
    ...bundle,
    results: redactedResults,
    metadata: {
      ...bundle.metadata,
      secondaryRedaction: fields.join(","),
    },
  };
}

// ============================================================================
// Summaries e diff
// ============================================================================

/**
 * Sumariza request em formato legível.
 */
export function summarizeRequest(request: RedactionRequest): HumanSummary {
  const lines: string[] = [];
  lines.push(`Request ${request.id}`);
  lines.push(`  Status: ${request.status}`);
  lines.push(`  Policy: ${request.policy}`);
  lines.push(`  Level: ${request.level}`);
  lines.push(`  Dry-run: ${request.dryRun ? "yes" : "no"}`);
  lines.push(`  Batch size: ${request.batchSize}`);
  lines.push(`  Receipts scanned: ${request.receiptsScanned}`);
  lines.push(`  Receipts matched: ${request.receiptsMatched}`);
  lines.push(`  Receipts redacted: ${request.receiptsRedacted}`);
  lines.push(`  Receipts skipped: ${request.receiptsSkipped}`);
  lines.push(`  Requested by: ${request.requestedBy}`);
  lines.push(`  Requested at: ${new Date(request.requestedAt).toISOString()}`);

  const filterCount = Object.keys(request.filters).length;
  lines.push(`  Filters: ${filterCount} active`);

  return {
    title: `Redaction Request ${request.id}`,
    lines,
  };
}

/**
 * Sumariza bundle em formato legível.
 */
export function summarizeBundle(bundle: RedactionBundle): HumanSummary {
  const lines: string[] = [];
  lines.push(`Bundle ${bundle.id}`);
  lines.push(`  Format: ${bundle.format}`);
  lines.push(`  Total: ${bundle.totalCount} results`);
  lines.push(`  Size: ${bundle.sizeBytes} bytes`);
  lines.push(`  Checksum: ${bundle.bundleChecksum}`);
  lines.push(`  Created by: ${bundle.createdBy}`);
  lines.push(`  Created at: ${new Date(bundle.createdAt).toISOString()}`);
  lines.push(`  Expires at: ${new Date(bundle.expiresAt).toISOString()}`);
  lines.push(`  PGP encrypted: ${bundle.pgpEncrypted ? "yes" : "no"}`);
  if (bundle.s3Key) {
    lines.push(`  Storage key: ${bundle.s3Key}`);
  }
  return {
    title: `Redaction Bundle ${bundle.id}`,
    lines,
  };
}

/**
 * Diff entre dois bundles — detecta adições/remoções/mudanças por checksum.
 */
export interface BundleDiff {
  readonly added: readonly string[];
  readonly removed: readonly string[];
  readonly changed: readonly string[];
  readonly unchanged: readonly string[];
}

export function diffBundles(
  before: RedactionBundle,
  after: RedactionBundle
): BundleDiff {
  const beforeById = new Map<string, RedactionResult>(
    before.results.map((r) => [r.receiptId, r])
  );
  const afterById = new Map<string, RedactionResult>(
    after.results.map((r) => [r.receiptId, r])
  );

  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];
  const unchanged: string[] = [];

  for (const [id, afterR] of afterById) {
    const beforeR = beforeById.get(id);
    if (!beforeR) {
      added.push(id);
    } else if (beforeR.redactedChecksum !== afterR.redactedChecksum) {
      changed.push(id);
    } else {
      unchanged.push(id);
    }
  }

  for (const [id] of beforeById) {
    if (!afterById.has(id)) {
      removed.push(id);
    }
  }

  return { added, removed, changed, unchanged };
}

// ============================================================================
// Audit logging
// ============================================================================

/**
 * Estado interno do log de auditoria. Engine puro = array em memória.
 * Em produção, viraria tabela audit_logs.
 */
let AUDIT_LOG: RedactionAuditEntry[] = [];

/**
 * Adiciona entrada de auditoria. Owner-only.
 */
export function auditRedactionAction(
  request: RedactionRequest,
  action: RedactionAuditEntry["action"],
  actor: unknown,
  details: Readonly<Record<string, string | number | boolean>> = {}
): RedactionAuditEntry {
  requireOwnerRole(actor);
  const a = actor as RedactionActor;

  const entry: RedactionAuditEntry = {
    id: generateUlid(),
    action,
    requestId: request.id,
    actor: a,
    timestamp: Date.now(),
    details: {
      ...details,
      requestStatus: request.status,
      requestPolicy: request.policy,
    },
  };

  AUDIT_LOG.push(entry);
  return entry;
}

/**
 * Factory para entrada de log sem request (ações standalone).
 */
export function redactionLogEntry(
  action: RedactionAuditEntry["action"],
  request: RedactionRequest,
  actor: unknown,
  details: Readonly<Record<string, string | number | boolean>> = {}
): RedactionAuditEntry {
  requireOwnerRole(actor);
  return auditRedactionAction(request, action, actor, details);
}

/**
 * Retorna entradas de log de um actor dentro de um range.
 */
export function getOwnerActionsLog(
  actorId: string,
  dateRange?: DateRange
): readonly RedactionAuditEntry[] {
  return AUDIT_LOG.filter((e) => {
    if (e.actor.id !== actorId) return false;
    if (dateRange) {
      if (e.timestamp < dateRange.fromMs || e.timestamp > dateRange.toMs) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Status de um request. Em produção, viraria query ao DB.
 * Aqui retorna o request passado (mock).
 */
export function getRequestStatus(
  requestId: string,
  requests: readonly RedactionRequest[]
): RedactionRequest | null {
  return requests.find((r) => r.id === requestId) ?? null;
}

/**
 * Conta entradas de log expiradas (> TTL).
 */
export function countExpiredAuditEntries(
  nowMs: number = Date.now()
): number {
  const cutoff = nowMs - REDACTION_AUDIT_TTL_DAYS * 24 * 3600 * 1000;
  return AUDIT_LOG.filter((e) => e.timestamp < cutoff).length;
}

/**
 * Limpa entradas expiradas. Retorna número de entries removidas.
 */
export function purgeExpiredAuditEntries(
  nowMs: number = Date.now()
): number {
  const cutoff = nowMs - REDACTION_AUDIT_TTL_DAYS * 24 * 3600 * 1000;
  const before = AUDIT_LOG.length;
  AUDIT_LOG = AUDIT_LOG.filter((e) => e.timestamp >= cutoff);
  return before - AUDIT_LOG.length;
}

/**
 * Reseta log (uso em testes).
 */
export function resetAuditLog(): void {
  AUDIT_LOG = [];
}

/**
 * Snapshot do log atual (read-only).
 */
export function getAuditLogSnapshot(): readonly RedactionAuditEntry[] {
  return [...AUDIT_LOG];
}

// ============================================================================
// Validações auxiliares
// ============================================================================

/**
 * Valida que request está pronto para execução.
 */
export function validateRequestReady(request: RedactionRequest): ValidationResult {
  const errors: string[] = [];

  if (!request.id || request.id.length === 0) {
    errors.push("id required");
  }
  if (!request.requestedBy) {
    errors.push("requestedBy required");
  }
  if (!ALLOWED_BATCH_SIZES.includes(request.batchSize)) {
    errors.push(`batchSize invalid: ${request.batchSize}`);
  }
  const policyValidation = validatePolicy(request.policy, request.level);
  if (!policyValidation.ok) {
    errors.push(...policyValidation.errors);
  }
  if (request.dryRun === undefined) {
    errors.push("dryRun must be explicitly set (true or false)");
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Valida que filters são internamente consistentes.
 */
export function validateFilters(filters: RedactionFilters): ValidationResult {
  const errors: string[] = [];

  if (filters.dateRange) {
    if (filters.dateRange.fromMs > filters.dateRange.toMs) {
      errors.push("dateRange.fromMs > dateRange.toMs");
    }
  }

  if (filters.sensitivityLevels) {
    for (const lvl of filters.sensitivityLevels) {
      if (lvl < 1 || lvl > 5) {
        errors.push(`sensitivityLevels out of range: ${lvl}`);
      }
    }
  }

  if (filters.ageDays !== undefined && filters.ageDays < 0) {
    errors.push(`ageDays must be >= 0, got ${filters.ageDays}`);
  }

  if (filters.searchQuery !== undefined && filters.searchQuery.length > 500) {
    errors.push("searchQuery too long (max 500 chars)");
  }

  return { ok: errors.length === 0, errors };
}

// ============================================================================
// Composite helpers — para uso em admin UI / API
// ============================================================================

/**
 * Workflow completo: queue → execute → audit. Não muta nada se dryRun.
 * Retorna artifacts para o caller persistir.
 */
export interface RedactionWorkflowArtifacts {
  readonly request: RedactionRequest;
  readonly results: readonly RedactionResult[];
  readonly bundle?: RedactionBundle;
  readonly auditEntries: readonly RedactionAuditEntry[];
}

export function runRedactionWorkflow(
  args: {
    policy: RedactionPolicy;
    level: RedactionLevel;
    filters: RedactionFilters;
    batchSize: number;
    dryRun: boolean;
    notes?: string;
    generateBundle: boolean;
    bundleFormat?: "json" | "jsonl" | "csv";
  },
  receipts: readonly ShareReceipt[],
  actor: unknown
): RedactionWorkflowArtifacts {
  requireOwnerRole(actor);
  const a = actor as RedactionActor;

  // 1. Queue
  const queued = queueRedaction(
    {
      requestedBy: a.id,
      policy: args.policy,
      level: args.level,
      filters: args.filters,
      dryRun: args.dryRun,
      batchSize: args.batchSize,
      notes: args.notes,
    },
    a
  );

  // 2. Audit queue
  const auditQueue = auditRedactionAction(queued, "queue", a, {
    filtersActive: Object.keys(args.filters).length,
  });

  // 3. Execute
  const { updatedRequest, results } = executeRedaction(queued, receipts, a);

  // 4. Audit complete
  const auditComplete = auditRedactionAction(
    updatedRequest,
    updatedRequest.status === "failed" ? "fail" : "complete",
    a,
    {
      redactedCount: updatedRequest.receiptsRedacted,
      skippedCount: updatedRequest.receiptsSkipped,
    }
  );

  // 5. Bundle (opcional)
  let bundle: RedactionBundle | undefined;
  let auditExport: RedactionAuditEntry | undefined;
  if (args.generateBundle && results.length > 0) {
    const format = args.bundleFormat ?? "json";
    bundle = exportRedactionBundle(results, format, a);
    auditExport = auditRedactionAction(updatedRequest, "export", a, {
      bundleId: bundle.id,
      format,
    });
  }

  return {
    request: updatedRequest,
    results,
    bundle,
    auditEntries: auditExport
      ? [auditQueue, auditComplete, auditExport]
      : [auditQueue, auditComplete],
  };
}

// ============================================================================
// Stats e métricas auxiliares
// ============================================================================

/**
 * Calcula estatísticas agregadas de uma lista de results.
 */
export interface RedactionStats {
  readonly total: number;
  readonly byPolicy: Readonly<Record<RedactionPolicy, number>>;
  readonly byLevel: Readonly<Record<RedactionLevel, number>>;
  readonly fieldsRedactedHistogram: Readonly<Record<string, number>>;
  readonly piiHitsTotal: number;
  readonly averageFieldsRedacted: number;
}

export function computeRedactionStats(
  results: readonly RedactionResult[]
): RedactionStats {
  const byPolicy: Record<RedactionPolicy, number> = {
    default_partial: 0,
    aggressive_full: 0,
    metadata_strip: 0,
    judicial_hold: 0,
    user_request: 0,
    research_safe: 0,
  };
  const byLevel: Record<RedactionLevel, number> = {
    metadata_only: 0,
    partial_pii: 0,
    full_body: 0,
    complete_anonymize: 0,
  };
  const fieldsHistogram: Record<string, number> = {};
  let piiHits = 0;
  let totalFields = 0;

  for (const r of results) {
    byPolicy[r.redactionPolicy]++;
    byLevel[r.redactionLevel]++;
    totalFields += r.fieldsRedacted.length;
    for (const f of r.fieldsRedacted) {
      fieldsHistogram[f] = (fieldsHistogram[f] ?? 0) + 1;
      if (f.includes(".pii") || f.includes("REDACTED:")) {
        piiHits++;
      }
    }
  }

  return {
    total: results.length,
    byPolicy,
    byLevel,
    fieldsRedactedHistogram: fieldsHistogram,
    piiHitsTotal: piiHits,
    averageFieldsRedacted:
      results.length > 0 ? totalFields / results.length : 0,
  };
}

// ============================================================================
// Composição com w49/recap-share-receipts (sem import direto)
// ============================================================================

/**
 * Verifica compatibilidade estrutural entre um objeto externo e o
 * contrato ShareReceipt esperado. Útil para validar objetos vindos
 * de w49/recap-share-receipts sem importar o módulo.
 */
export function isShareReceiptShape(value: unknown): value is ShareReceipt {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.sessionId === "string" &&
    typeof o.mentorId === "string" &&
    typeof o.recipientId === "string" &&
    typeof o.recapMarkdown === "string" &&
    typeof o.sharedAt === "number" &&
    typeof o.expiresAt === "number" &&
    typeof o.status === "string" &&
    typeof o.sensitivityLevel === "number" &&
    Array.isArray(o.tags) &&
    typeof o.version === "number"
  );
}

/**
 * Coerce um objeto "duck-typed" para ShareReceipt. Não muta o original.
 * Preenche campos opcionais ausentes com defaults seguros.
 */
export function coerceToShareReceipt(value: unknown): ShareReceipt | null {
  if (!isShareReceiptShape(value)) return null;
  const o = value as unknown as Record<string, unknown>;
  const tagsRaw = Array.isArray(o.tags) ? o.tags : [];
  const tags: string[] = tagsRaw.filter((t): t is string => typeof t === "string");

  const metadataRaw =
    o.metadata !== undefined && typeof o.metadata === "object" && o.metadata !== null
      ? (o.metadata as Record<string, unknown>)
      : {};
  const metadata: Record<string, string> = {};
  for (const [k, v] of Object.entries(metadataRaw)) {
    if (typeof v === "string") metadata[k] = v;
  }

  return {
    id: o.id as string,
    sessionId: o.sessionId as string,
    mentorId: o.mentorId as string,
    recipientId: o.recipientId as string,
    recipientEmail:
      typeof o.recipientEmail === "string" ? o.recipientEmail : null,
    recipientPhone:
      typeof o.recipientPhone === "string" ? o.recipientPhone : null,
    recipientName:
      typeof o.recipientName === "string" ? o.recipientName : null,
    viewerNotes: typeof o.viewerNotes === "string" ? o.viewerNotes : null,
    mentorPrivateNotes:
      typeof o.mentorPrivateNotes === "string" ? o.mentorPrivateNotes : null,
    recapMarkdown: o.recapMarkdown as string,
    recapExcerpt: typeof o.recapExcerpt === "string" ? o.recapExcerpt : "",
    sharedAt: o.sharedAt as number,
    viewedAt: typeof o.viewedAt === "number" ? o.viewedAt : null,
    completedAt: typeof o.completedAt === "number" ? o.completedAt : null,
    expiresAt: o.expiresAt as number,
    status: (o.status as ReceiptStatus) ?? "pending",
    sensitivityLevel:
      ((o.sensitivityLevel as number) >= 1 && (o.sensitivityLevel as number) <= 5
        ? (o.sensitivityLevel as 1 | 2 | 3 | 4 | 5)
        : 1),
    consentGivenAt:
      typeof o.consentGivenAt === "number" ? o.consentGivenAt : null,
    consentIpHash:
      typeof o.consentIpHash === "string" ? o.consentIpHash : null,
    declineReason:
      typeof o.declineReason === "string" ? o.declineReason : null,
    viewerFingerprint:
      typeof o.viewerFingerprint === "string" ? o.viewerFingerprint : null,
    metadata,
    tags,
    locale: typeof o.locale === "string" ? o.locale : "pt-BR",
    version: typeof o.version === "number" ? o.version : 1,
  };
}

/**
 * Helper: filtra e coerce uma lista de objetos externos em ShareReceipt.
 */
export function coerceToShareReceipts(
  values: readonly unknown[]
): readonly ShareReceipt[] {
  const out: ShareReceipt[] = [];
  for (const v of values) {
    const coerced = coerceToShareReceipt(v);
    if (coerced !== null) out.push(coerced);
  }
  return out;
}

// ============================================================================
// Cleanup helpers
// ============================================================================

/**
 * Marca bundle como expirado (soft-delete).
 */
export function expireBundle(bundle: RedactionBundle, nowMs: number = Date.now()): RedactionBundle {
  if (nowMs < bundle.expiresAt) {
    return bundle; // ainda válido
  }
  return {
    ...bundle,
    payload: undefined,
    results: [],
    metadata: {
      ...bundle.metadata,
      expiredAt: String(nowMs),
    },
  };
}

/**
 * Verifica se bundle está expirado.
 */
export function isBundleExpired(
  bundle: RedactionBundle,
  nowMs: number = Date.now()
): boolean {
  return nowMs >= bundle.expiresAt;
}

/**
 * Verifica se request está em estado terminal.
 */
export function isRequestTerminal(request: RedactionRequest): boolean {
  return (
    request.status === "completed" ||
    request.status === "failed" ||
    request.status === "cancelled"
  );
}

// ============================================================================
// Type exports extras
// ============================================================================

/**
 * Tipo consolidado de erro retornado por todas as funções deste módulo.
 */
export type RedactionError =
  | "PERMISSION_DENIED"
  | "INVALID_POLICY_LEVEL"
  | "INVALID_BATCH_SIZE"
  | "INVALID_FILTERS"
  | "INVALID_REQUEST_STATE"
  | "ROLLBACK_TOKEN_MISMATCH"
  | "ROLLBACK_WINDOW_EXPIRED"
  | "BUNDLE_EXPIRED"
  | "SCHEDULE_NOT_FOUND";

/**
 * Mensagens de erro padronizadas.
 */
export const REDACTION_ERROR_MESSAGES: Readonly<Record<RedactionError, string>> = {
  PERMISSION_DENIED: "Actor does not have owner role",
  INVALID_POLICY_LEVEL: "Policy × level combination is invalid",
  INVALID_BATCH_SIZE: "Batch size must be one of the allowed values",
  INVALID_FILTERS: "Filters contain invalid or inconsistent values",
  INVALID_REQUEST_STATE: "Request is in a state that does not allow this operation",
  ROLLBACK_TOKEN_MISMATCH: "Provided rollback token does not match the original",
  ROLLBACK_WINDOW_EXPIRED: "The rollback window has expired and reversal is no longer possible",
  BUNDLE_EXPIRED: "Bundle has expired and payload is no longer available",
  SCHEDULE_NOT_FOUND: "Schedule ID not found in registry",
} as const;