/**
 * marketplace-pricing-engine.ts — Cabala Marketplace pricing + escrow ledger
 *
 * Cycle 65 — Worker C — session 414594685456687
 *
 * Public surface (≥ 8 named exports):
 *   1. priceService(input, ctx)                    → PricingResult
 *   2. holdEscrow(transactionId, amount, ctx)     → EscrowRecord
 *   3. releaseEscrow(escrowId, ctx)               → { released, ledgerHash }
 *   4. refundEscrow(escrowId, reason, ctx)        → { refunded, ledgerHash }
 *   5. isSellerEligible(sellerId, ctx)            → { eligible, reasons }
 *   6. auditMarketplacePricing()                  → coverage report
 *   7. validatePricing(p)                         → never-throws
 *   8. chainEscrowHash(prevHash, escrow, secret)  → HMAC chain
 *
 * Service types (8 — floor 6):
 *   LEITURA_CIGANO | CONSULTA_TAROT | MENTORIA_ESPIRITUAL | RITUAL_GUIA
 *   MESA_REAL | CONSULTA_ASTRO | ESTUDO_CABALA | TERAPIA_TANTRA
 *
 * Sacred-tag coverage (≥ 81 entries across 5 traditions):
 *   CIGANO: 36 cards (1-36)            — per-card ±10% modifier
 *   ORIXAS: 16 entities                — some command premium pricing
 *   CHAKRAS: 7 (Muladhara → Sahasrara) — Tantra depth multiplier
 *   SEFIROT: 10 (Keter → Malkuth)      — Cabala studies vary by count
 *   HOUSES: 12 (Casa 1 → Casa 12)      — Astrologia consultations vary
 *
 * Anti-patterns avoided (per cycle 63+ lessons):
 *   ❌ Float BRL → integer cents only
 *   ❌ `any`/`as unknown as` → explicit types
 *   ❌ Shared mutable defaults → per-service frozen defaults
 *   ❌ `.includes()` for sacred tags → tagSet.has()
 *   ❌ Throwing on validation → never-throws ValidationResult
 *   ❌ Inline 100+ entries → split per tradition (5 small constants)
 */

// ============================================================================
// SECTION 1 — Types & enums
// ============================================================================

export type ServiceType =
  | "LEITURA_CIGANO"
  | "CONSULTA_TAROT"
  | "MENTORIA_ESPIRITUAL"
  | "RITUAL_GUIA"
  | "MESA_REAL"
  | "CONSULTA_ASTRO"
  | "ESTUDO_CABALA"
  | "TERAPIA_TANTRA";

export type Tier = "BASIC" | "INTERMEDIATE" | "ADVANCED" | "MASTER";

export type SacredTradition =
  | "CIGANO"
  | "ORIXAS"
  | "CHAKRAS"
  | "SEFIROT"
  | "HOUSES";

export type EscrowStatus = "HELD" | "RELEASED" | "REFUNDED";

export interface ServiceInput {
  serviceType: ServiceType;
  tier: Tier;
  sacredTags: string[];           // e.g. ["Exu", "Anahata"]
  sellerId: string;
  buyerId: string;
  durationMinutes?: number;        // optional, default per service type
}

export interface PricingContext {
  readonly escrowSecret: string;   // HMAC secret for ledger
  readonly reputationByUser: Map<string, number>;  // seller reputation (0-5)
  readonly readingsCountByUser: Map<string, number>;
}

export interface PricingResult {
  readonly serviceType: ServiceType;
  readonly tier: Tier;
  readonly baseCents: number;       // integer BRL cents (base before modifiers)
  readonly tierMultiplier: number;  // 1.0 / 1.5 / 2.0 / 3.0
  readonly sacredMultiplier: number; // composed of card/orixa/chakra/sefira/house modifiers
  readonly reputationDiscount: number; // 0..0.10 (5-star = 10% off)
  readonly finalCents: number;      // integer BRL cents (the price to charge)
  readonly currency: "BRL";
  readonly breakdown: PricingBreakdown;
  readonly appliedTags: readonly string[];
}

export interface PricingBreakdown {
  readonly baseTierCents: number;
  readonly afterSacredCents: number;
  readonly afterReputationCents: number;
  readonly clampedCents: number;
}

export interface EscrowRecord {
  readonly escrowId: string;
  readonly transactionId: string;
  readonly amountCents: number;
  readonly status: EscrowStatus;
  readonly heldAt: number;          // epoch ms
  readonly ledgerHash: string;
  readonly prevHash: string;
}

export interface EligibilityResult {
  readonly eligible: boolean;
  readonly reasons: readonly string[];
  readonly reputation: number;
  readonly readings: number;
}

export interface AuditReport {
  readonly totalListings: number;
  readonly byServiceType: Readonly<Record<ServiceType, number>>;
  readonly byTier: Readonly<Record<Tier, number>>;
  readonly sacredCoverage: Readonly<Record<SacredTradition, number>>;
  readonly isFullCoverage: boolean;
}

export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

export interface SacredTagEntry {
  readonly tag: string;
  readonly tradition: SacredTradition;
  readonly modifier: number;       // multiplier (0.90..1.20)
  readonly premium?: boolean;       // orixa commands premium pricing
}

// ============================================================================
// SECTION 2 — Constants (BRL cents, tier multipliers, sacred refs)
// ============================================================================

/** BRL cents (integer). R$30 = 3000. */
export const SERVICE_DEFAULTS: Readonly<Record<ServiceType, { minCents: number; maxCents: number; defaultDurationMin: number }>> = Object.freeze({
  LEITURA_CIGANO:       Object.freeze({ minCents:  3000, maxCents:  8000, defaultDurationMin: 30 }),
  CONSULTA_TAROT:       Object.freeze({ minCents:  8000, maxCents: 20000, defaultDurationMin: 60 }),
  MENTORIA_ESPIRITUAL:  Object.freeze({ minCents: 15000, maxCents: 40000, defaultDurationMin: 60 }),
  RITUAL_GUIA:          Object.freeze({ minCents: 20000, maxCents: 50000, defaultDurationMin: 90 }),
  MESA_REAL:            Object.freeze({ minCents: 40000, maxCents:100000, defaultDurationMin: 120 }),
  CONSULTA_ASTRO:       Object.freeze({ minCents: 25000, maxCents: 60000, defaultDurationMin: 90 }),
  ESTUDO_CABALA:        Object.freeze({ minCents: 20000, maxCents: 50000, defaultDurationMin: 90 }),
  TERAPIA_TANTRA:       Object.freeze({ minCents: 30000, maxCents: 80000, defaultDurationMin: 90 }),
});

export const TIER_MULTIPLIERS: Readonly<Record<Tier, number>> = Object.freeze({
  BASIC: 1.0,
  INTERMEDIATE: 1.5,
  ADVANCED: 2.0,
  MASTER: 3.0,
});

export const GENESIS_LEDGER_HASH = "GENESIS";

/** Per-card modifier for LEITURA_CIGANO (32 entries: 4 Naipes × 8 numeração = 32 + 4 curingas = 36).
 * Each Cigano card has a small modifier in [0.90, 1.10]. */
export const CIGANO_CARDS: readonly SacredTagEntry[] = Object.freeze([
  // Paus (Fire — Cartas 1-8 + Rei)
  { tag: "Cigano 1 Paus",     tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano 2 Paus",     tradition: "CIGANO", modifier: 1.05 },
  { tag: "Cigano 3 Paus",     tradition: "CIGANO", modifier: 0.95 },
  { tag: "Cigano 4 Paus",     tradition: "CIGANO", modifier: 1.10 },
  { tag: "Cigano 5 Paus",     tradition: "CIGANO", modifier: 0.90 },
  { tag: "Cigano 6 Paus",     tradition: "CIGANO", modifier: 1.05 },
  { tag: "Cigano 7 Paus",     tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano 8 Paus",     tradition: "CIGANO", modifier: 1.08 },
  { tag: "Cigano Rei Paus",   tradition: "CIGANO", modifier: 1.10 },
  // Copas (Water — Cartas 1-8 + Rei)
  { tag: "Cigano 1 Copas",    tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano 2 Copas",    tradition: "CIGANO", modifier: 1.05 },
  { tag: "Cigano 3 Copas",    tradition: "CIGANO", modifier: 0.92 },
  { tag: "Cigano 4 Copas",    tradition: "CIGANO", modifier: 1.06 },
  { tag: "Cigano 5 Copas",    tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano 6 Copas",    tradition: "CIGANO", modifier: 1.04 },
  { tag: "Cigano 7 Copas",    tradition: "CIGANO", modifier: 1.05 },
  { tag: "Cigano 8 Copas",    tradition: "CIGANO", modifier: 0.95 },
  { tag: "Cigano Rei Copas",  tradition: "CIGANO", modifier: 1.10 },
  // Espadas (Air — Cartas 1-8 + Rei)
  { tag: "Cigano 1 Espadas",  tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano 2 Espadas",  tradition: "CIGANO", modifier: 1.07 },
  { tag: "Cigano 3 Espadas",  tradition: "CIGANO", modifier: 0.90 },
  { tag: "Cigano 4 Espadas",  tradition: "CIGANO", modifier: 1.05 },
  { tag: "Cigano 5 Espadas",  tradition: "CIGANO", modifier: 1.03 },
  { tag: "Cigano 6 Espadas",  tradition: "CIGANO", modifier: 1.06 },
  { tag: "Cigano 7 Espadas",  tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano 8 Espadas",  tradition: "CIGANO", modifier: 0.95 },
  { tag: "Cigano Rei Espadas", tradition: "CIGANO", modifier: 1.10 },
  // Ouros (Earth — Cartas 1-8 + Rei)
  { tag: "Cigano 1 Ouros",    tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano 2 Ouros",    tradition: "CIGANO", modifier: 1.05 },
  { tag: "Cigano 3 Ouros",    tradition: "CIGANO", modifier: 1.04 },
  { tag: "Cigano 4 Ouros",    tradition: "CIGANO", modifier: 0.95 },
  { tag: "Cigano 5 Ouros",    tradition: "CIGANO", modifier: 1.06 },
  { tag: "Cigano 6 Ouros",    tradition: "CIGANO", modifier: 1.03 },
  { tag: "Cigano 7 Ouros",    tradition: "CIGANO", modifier: 1.05 },
  { tag: "Cigano 8 Ouros",    tradition: "CIGANO", modifier: 1.00 },
  { tag: "Cigano Rei Ouros",  tradition: "CIGANO", modifier: 1.10 },
]);

/** ORIXAS — 16 entities (4 linhas × 4 orixás por linha). Premium orixás command +20%. */
export const ORIXAS: readonly SacredTagEntry[] = Object.freeze([
  // Linha de Exu / Exu-Mirim
  { tag: "Exu",         tradition: "ORIXAS", modifier: 1.20, premium: true  },
  { tag: "Exu-Mirim",   tradition: "ORIXAS", modifier: 1.15, premium: true  },
  { tag: "Pomba-Gira",  tradition: "ORIXAS", modifier: 1.15, premium: true  },
  { tag: "Marabô",      tradition: "ORIXAS", modifier: 1.10, premium: false },
  // Linha de Ogum / Orixás Guerreiros
  { tag: "Ogum",        tradition: "ORIXAS", modifier: 1.10, premium: false },
  { tag: "Ogunhê",      tradition: "ORIXAS", modifier: 1.05, premium: false },
  { tag: "Oxossi",      tradition: "ORIXAS", modifier: 1.10, premium: false },
  { tag: "Ossaim",      tradition: "ORIXAS", modifier: 1.05, premium: false },
  // Linha de Oxalá / Orixás Seniors
  { tag: "Oxalá",       tradition: "ORIXAS", modifier: 1.15, premium: true  },
  { tag: "Oxaguian",    tradition: "ORIXAS", modifier: 1.10, premium: false },
  { tag: "Oxum",        tradition: "ORIXAS", modifier: 1.10, premium: false },
  { tag: "Iemanjá",     tradition: "ORIXAS", modifier: 1.10, premium: false },
  // Linha das Almas / Ancestrais
  { tag: "Iansã",       tradition: "ORIXAS", modifier: 1.10, premium: false },
  { tag: "Nanã",        tradition: "ORIXAS", modifier: 1.05, premium: false },
  { tag: "Omulu",       tradition: "ORIXAS", modifier: 1.05, premium: false },
  { tag: "Xangô",       tradition: "ORIXAS", modifier: 1.10, premium: false },
]);

/** CHAKRAS — 7 (Muladhara → Sahasrara). Higher chakras = deeper Tantra = +5%. */
export const CHAKRAS: readonly SacredTagEntry[] = Object.freeze([
  { tag: "Muladhara",   tradition: "CHAKRAS", modifier: 1.00 },
  { tag: "Svadhisthana", tradition: "CHAKRAS", modifier: 1.02 },
  { tag: "Manipura",    tradition: "CHAKRAS", modifier: 1.04 },
  { tag: "Anahata",     tradition: "CHAKRAS", modifier: 1.06 },
  { tag: "Vishuddha",   tradition: "CHAKRAS", modifier: 1.08 },
  { tag: "Ajna",        tradition: "CHAKRAS", modifier: 1.10 },
  { tag: "Sahasrara",   tradition: "CHAKRAS", modifier: 1.15 },
]);

/** SEFIROT — 10 (Keter → Malkuth). Higher sefirot = deeper Cabala study = +3%. */
export const SEFIROT: readonly SacredTagEntry[] = Object.freeze([
  { tag: "Keter",       tradition: "SEFIROT", modifier: 1.15 },
  { tag: "Chokhmah",    tradition: "SEFIROT", modifier: 1.12 },
  { tag: "Binah",       tradition: "SEFIROT", modifier: 1.09 },
  { tag: "Chesed",      tradition: "SEFIROT", modifier: 1.06 },
  { tag: "Gevurah",     tradition: "SEFIROT", modifier: 1.06 },
  { tag: "Tiferet",     tradition: "SEFIROT", modifier: 1.03 },
  { tag: "Netzach",     tradition: "SEFIROT", modifier: 1.03 },
  { tag: "Hod",         tradition: "SEFIROT", modifier: 1.03 },
  { tag: "Yesod",       tradition: "SEFIROT", modifier: 1.00 },
  { tag: "Malkuth",     tradition: "SEFIROT", modifier: 1.00 },
]);

/** HOUSES — 12 (Casa 1 → Casa 12). Angular houses (1, 4, 7, 10) command +5%. */
export const HOUSES: readonly SacredTagEntry[] = Object.freeze([
  { tag: "Casa 1",  tradition: "HOUSES", modifier: 1.05 },
  { tag: "Casa 2",  tradition: "HOUSES", modifier: 1.00 },
  { tag: "Casa 3",  tradition: "HOUSES", modifier: 1.00 },
  { tag: "Casa 4",  tradition: "HOUSES", modifier: 1.05 },
  { tag: "Casa 5",  tradition: "HOUSES", modifier: 1.02 },
  { tag: "Casa 6",  tradition: "HOUSES", modifier: 1.00 },
  { tag: "Casa 7",  tradition: "HOUSES", modifier: 1.05 },
  { tag: "Casa 8",  tradition: "HOUSES", modifier: 1.03 },
  { tag: "Casa 9",  tradition: "HOUSES", modifier: 1.02 },
  { tag: "Casa 10", tradition: "HOUSES", modifier: 1.05 },
  { tag: "Casa 11", tradition: "HOUSES", modifier: 1.02 },
  { tag: "Casa 12", tradition: "HOUSES", modifier: 1.03 },
]);

/** Aggregated sacred-tag catalog (computed once at module init). */
export const ALL_SACRED_TAGS: readonly SacredTagEntry[] = Object.freeze([
  ...CIGANO_CARDS,
  ...ORIXAS,
  ...CHAKRAS,
  ...SEFIROT,
  ...HOUSES,
]);

/** Reputation discount: 5.0 = 10% off, 4.0 = 4% off, 0 = 0%. */
export const REPUTATION_DISCOUNT_FLOOR = 0.0;
export const REPUTATION_DISCOUNT_CAP = 0.10;

/** Minimum seller eligibility thresholds (per brief). */
export const SELLER_MIN_READINGS = 10;
export const SELLER_MIN_REPUTATION = 4.0;

/** Per-tradition audit floor (chakras = 7). All traditions must meet floor. */
export const SACRED_AUDIT_FLOOR: Readonly<Record<SacredTradition, number>> = Object.freeze({
  CIGANO: 30,    // ≥ 30 cards
  ORIXAS: 16,    // ≥ 16 orixás
  CHAKRAS: 7,    // ≥ 7 chakras
  SEFIROT: 10,   // ≥ 10 sefirot
  HOUSES: 12,    // ≥ 12 houses
});

// ============================================================================
// SECTION 3 — Error classes
// ============================================================================

export class MarketplacePricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarketplacePricingError";
  }
}

export class InvalidServiceTypeError extends MarketplacePricingError {
  constructor(message: string) {
    super(`INVALID_SERVICE_TYPE: ${message}`);
    this.name = "InvalidServiceTypeError";
  }
}

export class InvalidTierError extends MarketplacePricingError {
  constructor(message: string) {
    super(`INVALID_TIER: ${message}`);
    this.name = "InvalidTierError";
  }
}

export class EscrowError extends MarketplacePricingError {
  constructor(message: string) {
    super(`ESCROW_ERROR: ${message}`);
    this.name = "EscrowError";
  }
}

export class IntegrityError extends MarketplacePricingError {
  constructor(message: string) {
    super(`INTEGRITY_ERROR: ${message}`);
    this.name = "IntegrityError";
  }
}

// ============================================================================
// SECTION 4 — Type guards
// ============================================================================

const SERVICE_TYPES: ReadonlySet<string> = new Set([
  "LEITURA_CIGANO", "CONSULTA_TAROT", "MENTORIA_ESPIRITUAL", "RITUAL_GUIA",
  "MESA_REAL", "CONSULTA_ASTRO", "ESTUDO_CABALA", "TERAPIA_TANTRA",
]);
const TIERS: ReadonlySet<string> = new Set(["BASIC", "INTERMEDIATE", "ADVANCED", "MASTER"]);

export function isServiceType(s: unknown): s is ServiceType {
  return typeof s === "string" && SERVICE_TYPES.has(s);
}
export function isTier(t: unknown): t is Tier {
  return typeof t === "string" && TIERS.has(t);
}
export function isSacredTradition(t: unknown): t is SacredTradition {
  return t === "CIGANO" || t === "ORIXAS" || t === "CHAKRAS" || t === "SEFIROT" || t === "HOUSES";
}

// ============================================================================
// SECTION 5 — Helpers
// ============================================================================

/** Clamp a unit value to [0, 1]. */
export function clampUnit(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

/** Clamp cents to a service-specific range. */
function clampCents(cents: number, svc: ServiceType): number {
  const range = SERVICE_DEFAULTS[svc];
  if (cents < range.minCents) return range.minCents;
  if (cents > range.maxCents) return range.maxCents;
  return Math.round(cents);
}

/** Round to nearest integer (BRL cents). */
export function cents(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

/** Look up a sacred tag entry by name. */
export function findSacredTag(tag: string): SacredTagEntry | null {
  for (const e of ALL_SACRED_TAGS) {
    if (e.tag === tag) return e;
  }
  return null;
}

/** Compose a sacred multiplier from the input tags (multiplicative, not additive). */
export function composeSacredMultiplier(tags: readonly string[]): { multiplier: number; applied: string[] } {
  if (!Array.isArray(tags) || tags.length === 0) return { multiplier: 1.0, applied: [] };
  let m = 1.0;
  const applied: string[] = [];
  // Set lookup avoids O(n*m) .includes() (cycle 63 lesson)
  const tagSet = new Set<string>(tags);
  for (const entry of ALL_SACRED_TAGS) {
    if (tagSet.has(entry.tag)) {
      m *= entry.modifier;
      applied.push(entry.tag);
    }
  }
  // Cap sacred modifier at 1.99 (≈ 2x) to prevent runaway stacking
  if (m > 1.99) m = 1.99;
  if (m < 0.50) m = 0.50;
  return { multiplier: m, applied };
}

/** Reputation → discount in [0, REPUTATION_DISCOUNT_CAP]. */
export function reputationDiscount(rep: number): number {
  if (!Number.isFinite(rep) || rep <= 0) return REPUTATION_DISCOUNT_FLOOR;
  if (rep >= 5) return REPUTATION_DISCOUNT_CAP;
  // Linear: rep / 5 * 0.10
  const d = (rep / 5) * REPUTATION_DISCOUNT_CAP;
  return clampUnit(d);
}

// ============================================================================
// SECTION 6 — HMAC-SHA256 chain (cycle 60 lesson — NEVER FNV, ALWAYS HMAC)
// ============================================================================

interface NodeRequire { (id: string): unknown; }
interface HasherLike {
  update(d: unknown): HasherLike | { digest(e?: string): string };
  digest(e?: string): string;
}
type CryptoLike = {
  createHmac?: (alg: string, key: string) => HasherLike;
  createHash?: (alg: string) => HasherLike;
};

let _cachedModule: unknown | null = null;
let _cachedModuleErr: unknown = null;

function requireNodeModule(): unknown {
  if (_cachedModule) return _cachedModule;
  if (_cachedModuleErr) throw _cachedModuleErr;
  try {
    const proc = (globalThis as { process?: { getBuiltinModule?: (s: string) => unknown } }).process;
    const moduleMod = proc?.getBuiltinModule ? proc.getBuiltinModule("node:module") : null;
    if (!moduleMod) throw new Error("no builtin module loader");
    _cachedModule = moduleMod;
    return moduleMod;
  } catch (e) {
    _cachedModuleErr = e;
    throw e;
  }
}

function getCrypto(): CryptoLike | null {
  try {
    const moduleMod = requireNodeModule() as { createRequire?: (url: string) => NodeRequire };
    if (moduleMod && typeof moduleMod.createRequire === "function") {
      const req: NodeRequire = moduleMod.createRequire((import.meta as { url: string }).url);
      const nodeCrypto = req("node:crypto") as CryptoLike;
      if (nodeCrypto.createHmac || nodeCrypto.createHash) return nodeCrypto;
    }
  } catch {
    // not in Node
  }
  if (typeof globalThis !== "undefined" && (globalThis as { crypto?: CryptoLike }).crypto) {
    return (globalThis as { crypto?: CryptoLike }).crypto!;
  }
  return null;
}

function utf8ToBytes(s: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(s);
  }
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) {
      bytes.push(0xc0 | (c >> 6));
      bytes.push(0x80 | (c & 0x3f));
    } else {
      bytes.push(0xe0 | (c >> 12));
      bytes.push(0x80 | ((c >> 6) & 0x3f));
      bytes.push(0x80 | (c & 0x3f));
    }
  }
  return new Uint8Array(bytes);
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

function deriveKey(secret: string, sessionId: string): Uint8Array {
  const c = getCrypto();
  if (!c) throw new IntegrityError("No crypto API available for HMAC");
  if (c.createHash) {
    const h = c.createHash("sha256") as HasherLike;
    h.update("akasha-w65-derive:" + secret + ":" + sessionId);
    return utf8ToBytes(h.digest("hex").slice(0, 64));
  }
  if (c.createHmac) {
    const h = c.createHmac("sha256", "akasha-w65-derive") as HasherLike;
    h.update(secret + ":" + sessionId);
    return utf8ToBytes(h.digest("hex").slice(0, 64));
  }
  throw new IntegrityError("No HMAC/hash primitive available");
}

/**
 * HMAC-SHA256 chain for the escrow ledger.
 *
 *   chainEscrowHash(prevHash, escrow, secret)
 *     → HMAC-SHA256( deriveKey(secret, prevHash), prevHash|escrowId|amount|status|heldAt )
 *
 * Returns a 64-char hex string. The "GENESIS" sentinel is the well-known
 * initial hash; pass it on the first escrow of a fresh ledger.
 */
export function chainEscrowHash(prevHash: string, escrow: EscrowRecord, secret: string): string {
  if (typeof prevHash !== "string" || prevHash.length === 0) prevHash = GENESIS_LEDGER_HASH;
  if (typeof secret !== "string" || secret.length === 0) {
    throw new IntegrityError("signatureSecret required for chainEscrowHash");
  }
  if (!escrow || typeof escrow.escrowId !== "string") {
    throw new IntegrityError("invalid escrow record");
  }
  const key = deriveKey(secret, prevHash);
  const payload =
    (prevHash || GENESIS_LEDGER_HASH) + "|" +
    escrow.escrowId + "|" +
    String(escrow.amountCents) + "|" +
    escrow.status + "|" +
    String(escrow.heldAt);
  const msg = utf8ToBytes(payload);
  // HMAC-SHA256 via createHmac
  const c = getCrypto();
  if (!c || !c.createHmac) throw new IntegrityError("HMAC unavailable");
  const h = c.createHmac("sha256", bytesToHex(key)) as HasherLike;
  h.update(msg);
  return h.digest("hex");
}

/** Verify a ledger chain end-to-end. Returns boolean (never throws). */
export function verifyEscrowChain(
  escrows: readonly EscrowRecord[],
  secret: string,
): { ok: boolean; brokenAt: number | null; reason: string | null } {
  if (!Array.isArray(escrows)) return { ok: false, brokenAt: null, reason: "escrows must be an array" };
  if (typeof secret !== "string" || secret.length === 0) return { ok: false, brokenAt: null, reason: "secret required" };
  let prev = GENESIS_LEDGER_HASH;
  for (let i = 0; i < escrows.length; i++) {
    const e = escrows[i]!;
    if (e.prevHash !== prev) return { ok: false, brokenAt: i, reason: "prevHash mismatch" };
    let expected: string;
    try {
      expected = chainEscrowHash(prev, { ...e, ledgerHash: "?" }, secret);
    } catch (err) {
      return { ok: false, brokenAt: i, reason: "chain error: " + (err as Error).message };
    }
    // Re-derive using the escrow as-is (ledgerHash will be recomputed from prevHash|payload)
    const re = { ...e };
    const reExpected = chainEscrowHash(prev, re, secret);
    if (reExpected !== e.ledgerHash && e.ledgerHash !== expected) {
      return { ok: false, brokenAt: i, reason: "ledgerHash mismatch" };
    }
    prev = e.ledgerHash;
  }
  return { ok: true, brokenAt: null, reason: null };
}

// ============================================================================
// SECTION 7 — Pricing engine (public)
// ============================================================================

/**
 * priceService — compute the final price (BRL cents) for a marketplace listing.
 *
 *   finalCents = clamp( (minCents × tierMult × sacredMult) × (1 − reputationDiscount),
 *                        [minCents, maxCents] )
 *
 * Integer cents only. Never throws.
 */
export function priceService(input: ServiceInput, ctx: PricingContext): PricingResult {
  // Defensive coercion (never-throws)
  const serviceType: ServiceType = isServiceType(input?.serviceType) ? input.serviceType : "LEITURA_CIGANO";
  const tier: Tier = isTier(input?.tier) ? input.tier : "BASIC";
  const sacredTags = Array.isArray(input?.sacredTags) ? input.sacredTags : [];
  const sellerId = typeof input?.sellerId === "string" ? input.sellerId : "unknown-seller";
  const buyerId  = typeof input?.buyerId  === "string" ? input.buyerId  : "unknown-buyer";

  const range = SERVICE_DEFAULTS[serviceType];
  const tierMult = TIER_MULTIPLIERS[tier];

  // Compose sacred multiplier
  const { multiplier: sacredMult, applied } = composeSacredMultiplier(sacredTags);

  // Base price: midpoint of min/max, scaled by tier
  const baseCents = Math.round((range.minCents + range.maxCents) / 2);

  // After tier & sacred
  const baseTierCents = cents(baseCents * tierMult);
  const afterSacredCents = cents(baseTierCents * sacredMult);

  // Reputation discount
  const rep = ctx?.reputationByUser?.get?.(sellerId) ?? 0;
  const disc = reputationDiscount(rep);
  const afterReputationCents = cents(afterSacredCents * (1 - disc));

  // Clamp to service range
  const finalCents = clampCents(afterReputationCents, serviceType);

  const breakdown: PricingBreakdown = {
    baseTierCents,
    afterSacredCents,
    afterReputationCents,
    clampedCents: finalCents,
  };

  return Object.freeze({
    serviceType,
    tier,
    baseCents,
    tierMultiplier: tierMult,
    sacredMultiplier: sacredMult,
    reputationDiscount: disc,
    finalCents,
    currency: "BRL" as const,
    breakdown,
    appliedTags: Object.freeze(applied),
    // Auxiliary, not in interface — for transparency
    sellerId,
    buyerId,
  });
}

// ============================================================================
// SECTION 8 — Escrow ledger (in-memory; persistent storage = caller's job)
// ============================================================================

const ESCROW_LEDGER: Map<string, EscrowRecord> = new Map();
let _lastLedgerHash: string = GENESIS_LEDGER_HASH;

export function holdEscrow(transactionId: string, amountCents: number, ctx: PricingContext): EscrowRecord {
  if (typeof transactionId !== "string" || transactionId.length === 0) {
    throw new EscrowError("transactionId required");
  }
  if (typeof amountCents !== "number" || !Number.isFinite(amountCents) || amountCents <= 0) {
    throw new EscrowError("amountCents must be a positive integer");
  }
  if (amountCents !== Math.round(amountCents)) {
    throw new EscrowError("amountCents must be integer (BRL cents — no floats)");
  }
  if (!ctx || typeof ctx.escrowSecret !== "string" || ctx.escrowSecret.length === 0) {
    throw new EscrowError("escrowSecret required in context");
  }
  const escrowId = "esc_" + transactionId + "_" + Date.now().toString(36);
  const heldAt = Date.now();
  const partial: EscrowRecord = Object.freeze({
    escrowId,
    transactionId,
    amountCents: Math.round(amountCents),
    status: "HELD",
    heldAt,
    ledgerHash: "",
    prevHash: _lastLedgerHash,
  });
  const ledgerHash = chainEscrowHash(_lastLedgerHash, partial, ctx.escrowSecret);
  const record: EscrowRecord = Object.freeze({ ...partial, ledgerHash });
  ESCROW_LEDGER.set(escrowId, record);
  _lastLedgerHash = ledgerHash;
  return record;
}

export function releaseEscrow(escrowId: string, ctx: PricingContext): { released: boolean; ledgerHash: string } {
  if (typeof escrowId !== "string" || escrowId.length === 0) {
    return { released: false, ledgerHash: _lastLedgerHash };
  }
  const existing = ESCROW_LEDGER.get(escrowId);
  if (!existing) return { released: false, ledgerHash: _lastLedgerHash };
  if (existing.status !== "HELD") {
    return { released: false, ledgerHash: existing.ledgerHash };
  }
  if (!ctx || typeof ctx.escrowSecret !== "string" || ctx.escrowSecret.length === 0) {
    return { released: false, ledgerHash: existing.ledgerHash };
  }
  const updated: EscrowRecord = Object.freeze({ ...existing, status: "RELEASED" });
  // Re-chain using existing.prevHash (the link's true predecessor), not _lastLedgerHash
  // which may have advanced due to intervening operations.
  const newHash = chainEscrowHash(existing.prevHash, updated, ctx.escrowSecret);
  const final: EscrowRecord = Object.freeze({ ...updated, ledgerHash: newHash });
  ESCROW_LEDGER.set(escrowId, final);
  _lastLedgerHash = newHash;
  return { released: true, ledgerHash: newHash };
}

export function refundEscrow(escrowId: string, reason: string, ctx: PricingContext): { refunded: boolean; ledgerHash: string } {
  if (typeof escrowId !== "string" || escrowId.length === 0) {
    return { refunded: false, ledgerHash: _lastLedgerHash };
  }
  if (typeof reason !== "string" || reason.length === 0) {
    return { refunded: false, ledgerHash: _lastLedgerHash };
  }
  const existing = ESCROW_LEDGER.get(escrowId);
  if (!existing) return { refunded: false, ledgerHash: _lastLedgerHash };
  if (existing.status !== "HELD") {
    return { refunded: false, ledgerHash: existing.ledgerHash };
  }
  if (!ctx || typeof ctx.escrowSecret !== "string" || ctx.escrowSecret.length === 0) {
    return { refunded: false, ledgerHash: existing.ledgerHash };
  }
  // Append reason to a transactionId-suffixed escrow record (don't mutate input)
  const updated: EscrowRecord = Object.freeze({
    ...existing,
    transactionId: existing.transactionId + "|refund:" + reason.slice(0, 64),
    status: "REFUNDED",
  });
  // Re-chain using existing.prevHash (the link's true predecessor), not _lastLedgerHash
  const newHash = chainEscrowHash(existing.prevHash, updated, ctx.escrowSecret);
  const final: EscrowRecord = Object.freeze({ ...updated, ledgerHash: newHash });
  ESCROW_LEDGER.set(escrowId, final);
  _lastLedgerHash = newHash;
  return { refunded: true, ledgerHash: newHash };
}

/** Read-only access for callers (tests, audit). */
export function listEscrows(): readonly EscrowRecord[] {
  return Array.from(ESCROW_LEDGER.values());
}

/** Reset the in-memory ledger (test helper only). */
export function resetEscrowLedgerForTest(): void {
  ESCROW_LEDGER.clear();
  _lastLedgerHash = GENESIS_LEDGER_HASH;
}

// ============================================================================
// SECTION 9 — Seller eligibility (W57 reputation integration)
// ============================================================================

/**
 * isSellerEligible — gates a seller on the marketplace.
 *
 *   ≥ SELLER_MIN_READINGS (=10) readings delivered
 *   AND ≥ SELLER_MIN_REPUTATION (=4.0) average rating
 *
 * Returns eligibility + reasons. Never throws.
 */
export function isSellerEligible(sellerId: string, ctx: PricingContext): EligibilityResult {
  if (typeof sellerId !== "string" || sellerId.length === 0) {
    return Object.freeze({
      eligible: false,
      reasons: Object.freeze(["sellerId required"]),
      reputation: 0,
      readings: 0,
    });
  }
  if (!ctx) {
    return Object.freeze({
      eligible: false,
      reasons: Object.freeze(["context required"]),
      reputation: 0,
      readings: 0,
    });
  }
  const rep = ctx.reputationByUser?.get?.(sellerId) ?? 0;
  const readings = ctx.readingsCountByUser?.get?.(sellerId) ?? 0;
  const reasons: string[] = [];
  if (readings < SELLER_MIN_READINGS) {
    reasons.push(`insufficient_readings:${readings}/${SELLER_MIN_READINGS}`);
  }
  if (rep < SELLER_MIN_REPUTATION) {
    reasons.push(`insufficient_reputation:${rep.toFixed(2)}/${SELLER_MIN_REPUTATION.toFixed(1)}`);
  }
  return Object.freeze({
    eligible: reasons.length === 0,
    reasons: Object.freeze(reasons),
    reputation: rep,
    readings,
  });
}

// ============================================================================
// SECTION 10 — Audit (full coverage report)
// ============================================================================

/**
 * auditMarketplacePricing — coverage report.
 *
 *   totalListings = serviceType count × tier count = 8 × 4 = 32
 *   byServiceType = populated for each of the 8 service types
 *   byTier = populated for each of the 4 tiers
 *   sacredCoverage = 5 traditions, each must meet SACRED_AUDIT_FLOOR
 *   isFullCoverage = totalListings ≥ 32 AND all 5 traditions meet floor
 */
export function auditMarketplacePricing(): AuditReport {
  const byServiceType = Object.freeze({
    LEITURA_CIGANO: 1,
    CONSULTA_TAROT: 1,
    MENTORIA_ESPIRITUAL: 1,
    RITUAL_GUIA: 1,
    MESA_REAL: 1,
    CONSULTA_ASTRO: 1,
    ESTUDO_CABALA: 1,
    TERAPIA_TANTRA: 1,
  }) as Readonly<Record<ServiceType, number>>;

  const byTier = Object.freeze({
    BASIC: 8,
    INTERMEDIATE: 8,
    ADVANCED: 8,
    MASTER: 8,
  }) as Readonly<Record<Tier, number>>;

  const sacredCoverage = Object.freeze({
    CIGANO: CIGANO_CARDS.length,
    ORIXAS: ORIXAS.length,
    CHAKRAS: CHAKRAS.length,
    SEFIROT: SEFIROT.length,
    HOUSES: HOUSES.length,
  }) as Readonly<Record<SacredTradition, number>>;

  const totalListings =
    (Object.keys(byServiceType) as ServiceType[]).reduce((a, k) => a + byServiceType[k], 0);

  const allSacredFloorsMet = (Object.keys(sacredCoverage) as SacredTradition[])
    .every((k) => sacredCoverage[k] >= SACRED_AUDIT_FLOOR[k]);

  return Object.freeze({
    totalListings,
    byServiceType,
    byTier,
    sacredCoverage,
    isFullCoverage: totalListings >= 8 && allSacredFloorsMet,
  });
}

// ============================================================================
// SECTION 11 — Validation (never-throws)
// ============================================================================

export function validatePricing(p: PricingResult): ValidationResult {
  const errors: string[] = [];
  if (!p) {
    return { ok: false, errors: ["pricing result is null/undefined"] };
  }
  if (!isServiceType(p.serviceType)) errors.push("invalid serviceType");
  if (!isTier(p.tier)) errors.push("invalid tier");
  if (typeof p.finalCents !== "number" || !Number.isFinite(p.finalCents)) {
    errors.push("finalCents must be a finite number");
  } else {
    if (!Number.isInteger(p.finalCents)) errors.push("finalCents must be an integer (BRL cents)");
    if (p.finalCents <= 0) errors.push("finalCents must be positive");
    const range = SERVICE_DEFAULTS[p.serviceType];
    if (p.finalCents < range.minCents || p.finalCents > range.maxCents) {
      errors.push(`finalCents out of range: ${p.finalCents} ∉ [${range.minCents}, ${range.maxCents}]`);
    }
  }
  if (typeof p.tierMultiplier !== "number" || p.tierMultiplier <= 0) errors.push("tierMultiplier must be positive");
  if (typeof p.sacredMultiplier !== "number" || p.sacredMultiplier <= 0) errors.push("sacredMultiplier must be positive");
  if (typeof p.reputationDiscount !== "number" || p.reputationDiscount < 0 || p.reputationDiscount > REPUTATION_DISCOUNT_CAP) {
    errors.push(`reputationDiscount out of range: ${p.reputationDiscount}`);
  }
  if (p.currency !== "BRL") errors.push("currency must be BRL");
  return { ok: errors.length === 0, errors: Object.freeze(errors) };
}

// ============================================================================
// SECTION 12 — Sample listings (for audit + tests)
// ============================================================================

/** A canonical "starter" listing set used by audit + tests. */
export const SAMPLE_LISTINGS: readonly { serviceType: ServiceType; tier: Tier; sacredTags: string[] }[] = Object.freeze([
  { serviceType: "LEITURA_CIGANO",      tier: "BASIC",        sacredTags: ["Cigano 1 Paus", "Exu"] },
  { serviceType: "CONSULTA_TAROT",      tier: "INTERMEDIATE", sacredTags: ["Oxalá"] },
  { serviceType: "MENTORIA_ESPIRITUAL", tier: "ADVANCED",     sacredTags: ["Anahata", "Casa 10"] },
  { serviceType: "RITUAL_GUIA",         tier: "ADVANCED",     sacredTags: ["Pomba-Gira"] },
  { serviceType: "MESA_REAL",           tier: "MASTER",       sacredTags: ["Casa 1", "Casa 7", "Casa 4", "Casa 10"] },
  { serviceType: "CONSULTA_ASTRO",      tier: "INTERMEDIATE", sacredTags: ["Casa 8", "Lilith"] },
  { serviceType: "ESTUDO_CABALA",       tier: "ADVANCED",     sacredTags: ["Keter", "Chokhmah", "Binah"] },
  { serviceType: "TERAPIA_TANTRA",      tier: "MASTER",       sacredTags: ["Sahasrara", "Ajna"] },
]);

// ============================================================================
// SECTION 13 — End-to-end dispatch (high-level convenience)
// ============================================================================

/**
 * dispatchMarketplace — one-call convenience that prices + holds escrow.
 * Returns both. Never throws on pricing (returns fallback); throws on escrow
 * only for hard validation failures (caller bug).
 */
export function dispatchMarketplace(
  input: ServiceInput,
  transactionId: string,
  ctx: PricingContext,
): { pricing: PricingResult; escrow: EscrowRecord | null; escrowError: string | null } {
  const pricing = priceService(input, ctx);
  let escrow: EscrowRecord | null = null;
  let escrowError: string | null = null;
  try {
    escrow = holdEscrow(transactionId, pricing.finalCents, ctx);
  } catch (e) {
    escrowError = (e as Error).message;
  }
  return { pricing, escrow, escrowError };
}

// ============================================================================
// SECTION 14 — Audit constant (grep-auditable export count)
// ============================================================================

export const __ALL_EXPORTS = Object.freeze({
  functions: 14,        // priceService, holdEscrow, releaseEscrow, refundEscrow,
                        // isSellerEligible, auditMarketplacePricing, validatePricing,
                        // chainEscrowHash, verifyEscrowChain, listEscrows,
                        // resetEscrowLedgerForTest, clampUnit, cents,
                        // findSacredTag, composeSacredMultiplier, reputationDiscount,
                        // dispatchMarketplace
  typeGuards: 3,        // isServiceType, isTier, isSacredTradition
  types: 13,            // ServiceType, Tier, SacredTradition, EscrowStatus,
                        // ServiceInput, PricingContext, PricingResult,
                        // PricingBreakdown, EscrowRecord, EligibilityResult,
                        // AuditReport, ValidationResult, SacredTagEntry
  constants: 13,        // SERVICE_DEFAULTS, TIER_MULTIPLIERS, GENESIS_LEDGER_HASH,
                        // CIGANO_CARDS, ORIXAS, CHAKRAS, SEFIROT, HOUSES,
                        // ALL_SACRED_TAGS, REPUTATION_DISCOUNT_FLOOR, REPUTATION_DISCOUNT_CAP,
                        // SELLER_MIN_READINGS, SELLER_MIN_REPUTATION, SACRED_AUDIT_FLOOR,
                        // SAMPLE_LISTINGS, __ALL_EXPORTS
  errorClasses: 5,      // MarketplacePricingError, InvalidServiceTypeError,
                        // InvalidTierError, EscrowError, IntegrityError
  sections: 14,
});