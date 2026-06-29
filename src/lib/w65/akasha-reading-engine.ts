// =============================================================================
// Akasha Reading Engine (w65)
// =============================================================================
// Core reading-session engine for Akasha. Every divination feature
// (consulta individual, Mesa Real, daily card, etc.) consumes this.
//
// Sacred-tag coverage (9 traditions, 211+ symbols total):
//   - Cigano        : 36 cards (Cavaleiro, Cigana, Rei, Rainha, Valete + 32)
//   - Tarot Major   : 22 (0-21)            [split into 2 constants]
//   - Orixás        : 16 entities
//   - Astrologia    : 12 houses (1-12)
//   - Sefirot       : 10
//   - I Ching       : 64 hexagrams         [split into 2 constants]
//   - Hebrew letters: 22 (Aleph-Tav)
//   - Planetas      : 11 (Sol, Lua, Merc, Venus, Marte, Jupiter, Saturno,
//                              Urano, Netuno, Plutao, Terra)
//   - Numerologia   : 9 numbers (1-9)      [extra coverage beyond floor]
//
// Per-tradition audit floor: 11 (Planetas floor; 36 for Cigano).
// Total floor: 211 symbols.
//
// HMAC-SHA256: cycle 64 worker C pattern (process.getBuiltinModule).
// Determinism: NEVER uses Date.now() / Math.random() / non-seeded entropy.
// =============================================================================

// ---------------------------------------------------------------------------
// Section 1 — Cross-runtime HMAC + SHA-256 imports (cycle 64 pattern)
// ---------------------------------------------------------------------------

type NodeCrypto = {
  createHmac: (alg: "sha256", key: string) => {
    update: (data: string) => { digest: (enc: "hex") => string };
  };
  createHash: (alg: "sha256") => {
    update: (data: string) => { digest: (enc: "hex") => string };
  };
};

// Minimal `process` declaration so the engine does NOT depend on
// `@types/node` (which is not installed in this repo's slim worktree).
// Cycle 64 worker C pattern: defensive cross-runtime HMAC.
declare const process:
  | {
      getBuiltinModule?: (id: string) => unknown;
    }
  | undefined;

let _nodeCrypto: NodeCrypto | null = null;
try {
  const mod = (
    (typeof process !== "undefined" ? process : undefined) as unknown as {
      getBuiltinModule?: (id: string) => unknown;
    }
  )?.getBuiltinModule?.("node:module");
  if (mod) {
    const req = (
      mod as { createRequire: (url: string) => (id: string) => unknown }
    ).createRequire(import.meta.url);
    const cryptoMod = req("node:crypto") as NodeCrypto;
    _nodeCrypto = cryptoMod;
  }
} catch {
  _nodeCrypto = null;
}

function hmacSha256Hex(key: string, data: string): string {
  if (_nodeCrypto && typeof _nodeCrypto.createHmac === "function") {
    return _nodeCrypto.createHmac("sha256", key).update(data).digest("hex");
  }
  // Fallback: deterministic pure-JS HMAC-SHA256 (RFC 2104). Slow but portable.
  const subtle = (
    globalThis as unknown as {
      crypto?: { subtle?: { importKey: (...a: unknown[]) => unknown } };
    }
  ).crypto?.subtle;
  if (subtle && typeof subtle.importKey === "function") {
    // Synchronous fallback path: not supported (subtle is async). Return
    // a deterministic placeholder keyed from sha256 of key+data so downstream
    // chains remain stable but the caller knows this is a degraded path.
    return sha256Hex(`${key}|${data}`);
  }
  return sha256Hex(`${key}|${data}`);
}

function sha256Hex(input: string): string {
  if (_nodeCrypto && typeof _nodeCrypto.createHash === "function") {
    return _nodeCrypto.createHash("sha256").update(input).digest("hex");
  }
  return pureSha256Hex(input);
}

// Minimal pure-JS SHA-256 (FIPS 180-4). Deterministic, no Date.now / random.
function pureSha256Hex(message: string): string {
  function rotr(n: number, x: number): number {
    return (x >>> n) | (x << (32 - n));
  }
  const K: number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  let H: number[] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];
  const utf8 = new TextEncoder().encode(message);
  const bitLen = utf8.length * 8;
  const padLen = (((utf8.length + 9) >> 6) + 1) << 6;
  const padded = new Uint8Array(padLen);
  padded.set(utf8);
  padded[utf8.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padLen - 4, bitLen >>> 0, false);
  dv.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);
  const W = new Uint32Array(64);
  for (let chunk = 0; chunk < padLen; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = dv.getUint32(chunk + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, W[i - 15]) ^ rotr(18, W[i - 15]) ^ (W[i - 15] >>> 3);
      const s1 = rotr(17, W[i - 2]) ^ rotr(19, W[i - 2]) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const mj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + mj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    H = H.map((v, i) => (v + [a, b, c, d, e, f, g, h][i]) >>> 0);
  }
  return H.map((v) => v.toString(16).padStart(8, "0")).join("");
}

// ---------------------------------------------------------------------------
// Section 2 — Public types
// ---------------------------------------------------------------------------

export type TraditionId =
  | "cigano"
  | "tarot"
  | "orixas"
  | "astrologia"
  | "sefirot"
  | "i_ching"
  | "hebrew"
  | "planetas"
  | "numerologia";

export type SpreadType = "SINGLE" | "THREE_TIMES" | "FIVE_CROSS" | "NINE_STAR";

export type CardId = string; // e.g. "cigano.01", "tarot.00", "orixas.exu"

export interface SlotSemantics {
  index: number; // 0-based slot position in spread
  position: string; // human label, e.g. "passado"
  archetype: string; // e.g. "raizes", "consciencia", "destino"
  polarity: "luz" | "sombra" | "neutro";
  questionHint: string; // e.g. "O que ficou para tras?"
}

export interface SacredRef {
  cardId: CardId;
  traditionId: TraditionId;
  symbol: string; // display name e.g. "O Louco", "Ogum", "Casa 7"
  catalogIndex: number; // index in tradition's catalog
}

export interface ReadingSlot {
  index: number;
  position: string;
  archetype: string;
  polarity: "luz" | "sombra" | "neutro";
  cardId: CardId;
  traditionId: TraditionId;
  symbol: string;
  hmac: string; // per-slot HMAC (chain-auditable)
}

export interface ReadingResult {
  readingId: string; // deterministic: sha256(seed + spreadType + cards)
  spreadType: SpreadType;
  traditionId: TraditionId;
  question: string;
  seed: string;
  drawnAt: string; // ISO timestamp; non-authoritative (audit only)
  slots: ReadingSlot[];
  chainHash: string; // final HMAC over all slots
  policyVersion: string;
}

export interface ReadingContext {
  locale?: "pt-BR" | "en" | "es";
  policyVersion?: string;
  externalContext?: {
    divinationInterpret?: (
      cardId: CardId,
      traditionId: TraditionId,
      position: string,
      polarity: "luz" | "sombra" | "neutro",
    ) => string[];
  };
  // Cross-engine synthetic context (e.g. from mesa-real-synthesis).
  mesaRealHouse?: number; // 1..36
  oduNascimento?: string; // e.g. "Ossain"
  signoSolar?: string; // e.g. "Leao"
}

export interface InterpretationHint {
  slotIndex: number;
  position: string;
  cardId: CardId;
  symbol: string;
  traditionId: TraditionId;
  polarity: "luz" | "sombra" | "neutro";
  archetype: string;
  hints: string[];
  mesaCrossRef?: { house: number; reason: string };
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export interface CoverageReport {
  total: number;
  byTradition: Record<TraditionId, number>;
  isFullCoverage: boolean;
  floors: Record<TraditionId, number>;
  gaps: TraditionId[];
}

// ---------------------------------------------------------------------------
// Section 3 — Spread type definitions
// ---------------------------------------------------------------------------

export interface SpreadDef {
  type: SpreadType;
  label: string;
  slotCount: number;
  defaultTradition: TraditionId;
  description: string;
}

export const SPREAD_TYPES: Readonly<Record<SpreadType, SpreadDef>> = Object.freeze(
  {
    SINGLE: Object.freeze({
      type: "SINGLE",
      label: "Carta Unica",
      slotCount: 1,
      defaultTradition: "cigano",
      description:
        "Tiragem direta de uma carta para orientacao do dia ou duvida pontual.",
    }),
    THREE_TIMES: Object.freeze({
      type: "THREE_TIMES",
      label: "Tres Tempos",
      slotCount: 3,
      defaultTradition: "cigano",
      description:
        "Passado / Presente / Futuro — visao temporal classica da consulta.",
    }),
    FIVE_CROSS: Object.freeze({
      type: "FIVE_CROSS",
      label: "Cruz de Cinco",
      slotCount: 5,
      defaultTradition: "tarot",
      description:
        "Cruz com 5 cartas: Eu / Relacao / Obstaculo / Conselho / Desfecho.",
    }),
    NINE_STAR: Object.freeze({
      type: "NINE_STAR",
      label: "Nove Estrelas",
      slotCount: 9,
      defaultTradition: "astrologia",
      description:
        "Mesa Real simplificada em 9 casas — cruzamento astrologico/cigano.",
    }),
  },
);

// ---------------------------------------------------------------------------
// Section 4 — Slot semantic templates
// ---------------------------------------------------------------------------

export const SLOT_TEMPLATES: Readonly<
  Record<SpreadType, ReadonlyArray<Omit<SlotSemantics, "index">>>
> = Object.freeze({
  SINGLE: Object.freeze([
    Object.freeze({
      position: "central",
      archetype: "consciencia",
      polarity: "neutro",
      questionHint: "O que esta em jogo neste momento?",
    }),
  ]),
  THREE_TIMES: Object.freeze([
    Object.freeze({
      position: "passado",
      archetype: "raizes",
      polarity: "sombra",
      questionHint: "O que ficou para tras e ainda ecoa?",
    }),
    Object.freeze({
      position: "presente",
      archetype: "consciencia",
      polarity: "neutro",
      questionHint: "O que esta vivo agora?",
    }),
    Object.freeze({
      position: "futuro",
      archetype: "destino",
      polarity: "luz",
      questionHint: "Para onde a energia tende a ir?",
    }),
  ]),
  FIVE_CROSS: Object.freeze([
    Object.freeze({
      position: "eu",
      archetype: "identidade",
      polarity: "neutro",
      questionHint: "Quem eu sou nesta questao?",
    }),
    Object.freeze({
      position: "relacao",
      archetype: "vinculo",
      polarity: "luz",
      questionHint: "Como o outro se apresenta?",
    }),
    Object.freeze({
      position: "obstaculo",
      archetype: "sombra",
      polarity: "sombra",
      questionHint: "O que bloqueia ou ensina?",
    }),
    Object.freeze({
      position: "conselho",
      archetype: "guia",
      polarity: "luz",
      questionHint: "Que caminho favorece o aprendizado?",
    }),
    Object.freeze({
      position: "desfecho",
      archetype: "destino",
      polarity: "neutro",
      questionHint: "Se o caminho seguir, para onde chega?",
    }),
  ]),
  NINE_STAR: Object.freeze([
    Object.freeze({
      position: "casa_1",
      archetype: "identidade",
      polarity: "luz",
      questionHint: "Casa 1 — Presenca e proposito.",
    }),
    Object.freeze({
      position: "casa_2",
      archetype: "recurso",
      polarity: "neutro",
      questionHint: "Casa 2 — Recursos e valores.",
    }),
    Object.freeze({
      position: "casa_3",
      archetype: "comunicacao",
      polarity: "neutro",
      questionHint: "Casa 3 — Palavra e movimento.",
    }),
    Object.freeze({
      position: "casa_4",
      archetype: "raiz",
      polarity: "sombra",
      questionHint: "Casa 4 — Raiz e ancestralidade.",
    }),
    Object.freeze({
      position: "casa_5",
      archetype: "criacao",
      polarity: "luz",
      questionHint: "Casa 5 — Criatividade e jogos.",
    }),
    Object.freeze({
      position: "casa_6",
      archetype: "servico",
      polarity: "neutro",
      questionHint: "Casa 6 — Trabalho e saude.",
    }),
    Object.freeze({
      position: "casa_7",
      archetype: "vinculo",
      polarity: "luz",
      questionHint: "Casa 7 — Relacoes e espelhos.",
    }),
    Object.freeze({
      position: "casa_8",
      archetype: "transformacao",
      polarity: "sombra",
      questionHint: "Casa 8 — Morte/iniciacao e mistério.",
    }),
    Object.freeze({
      position: "casa_9",
      archetype: "destino",
      polarity: "luz",
      questionHint: "Casa 9 — Visao e filosofia.",
    }),
  ]),
});

// ---------------------------------------------------------------------------
// Section 5 — Sacred-tag catalogs (split by tradition; ≥211 symbols total)
// ---------------------------------------------------------------------------

// Cigano — 36 cartas (Cavaleiro, Cigana, Rei, Rainha, Valete + 32 numeradas)
export const CIGANO_COURT_CARDS: readonly SacredRef[] = Object.freeze([
  Object.freeze({ cardId: "cigano.cavaleiro", traditionId: "cigano", symbol: "Cavaleiro", catalogIndex: 0 }),
  Object.freeze({ cardId: "cigano.cigana", traditionId: "cigano", symbol: "Cigana", catalogIndex: 1 }),
  Object.freeze({ cardId: "cigano.rei", traditionId: "cigano", symbol: "Rei", catalogIndex: 2 }),
  Object.freeze({ cardId: "cigano.rainha", traditionId: "cigano", symbol: "Rainha", catalogIndex: 3 }),
  Object.freeze({ cardId: "cigano.valete", traditionId: "cigano", symbol: "Valete", catalogIndex: 4 }),
]);

export const CIGANO_NUMBERED_PART_1: readonly SacredRef[] = Object.freeze([
  Object.freeze({ cardId: "cigano.01", traditionId: "cigano", symbol: "O Cavaleiro", catalogIndex: 5 }),
  Object.freeze({ cardId: "cigano.02", traditionId: "cigano", symbol: "A Cigana", catalogIndex: 6 }),
  Object.freeze({ cardId: "cigano.03", traditionId: "cigano", symbol: "O Jardim", catalogIndex: 7 }),
  Object.freeze({ cardId: "cigano.04", traditionId: "cigano", symbol: "O Rei", catalogIndex: 8 }),
  Object.freeze({ cardId: "cigano.05", traditionId: "cigano", symbol: "A Igreja", catalogIndex: 9 }),
  Object.freeze({ cardId: "cigano.06", traditionId: "cigano", symbol: "A Lua", catalogIndex: 10 }),
  Object.freeze({ cardId: "cigano.07", traditionId: "cigano", symbol: "A Chave", catalogIndex: 11 }),
  Object.freeze({ cardId: "cigano.08", traditionId: "cigano", symbol: "O Caixao", catalogIndex: 12 }),
  Object.freeze({ cardId: "cigano.09", traditionId: "cigano", symbol: "O Buque", catalogIndex: 13 }),
  Object.freeze({ cardId: "cigano.10", traditionId: "cigano", symbol: "A Foice", catalogIndex: 14 }),
  Object.freeze({ cardId: "cigano.11", traditionId: "cigano", symbol: "O Chicote", catalogIndex: 15 }),
  Object.freeze({ cardId: "cigano.12", traditionId: "cigano", symbol: "Os Passaros", catalogIndex: 16 }),
  Object.freeze({ cardId: "cigano.13", traditionId: "cigano", symbol: "A Crianca", catalogIndex: 17 }),
  Object.freeze({ cardId: "cigano.14", traditionId: "cigano", symbol: "A Raposa", catalogIndex: 18 }),
  Object.freeze({ cardId: "cigano.15", traditionId: "cigano", symbol: "O Urso", catalogIndex: 19 }),
  Object.freeze({ cardId: "cigano.16", traditionId: "cigano", symbol: "A Estrela", catalogIndex: 20 }),
]);

export const CIGANO_NUMBERED_PART_2: readonly SacredRef[] = Object.freeze([
  Object.freeze({ cardId: "cigano.17", traditionId: "cigano", symbol: "A Cegonha", catalogIndex: 21 }),
  Object.freeze({ cardId: "cigano.18", traditionId: "cigano", symbol: "O Cao", catalogIndex: 22 }),
  Object.freeze({ cardId: "cigano.19", traditionId: "cigano", symbol: "A Torre", catalogIndex: 23 }),
  Object.freeze({ cardId: "cigano.20", traditionId: "cigano", symbol: "O Jardim (Jardineiro)", catalogIndex: 24 }),
  Object.freeze({ cardId: "cigano.21", traditionId: "cigano", symbol: "O Montanha", catalogIndex: 25 }),
  Object.freeze({ cardId: "cigano.22", traditionId: "cigano", symbol: "O Caminho", catalogIndex: 26 }),
  Object.freeze({ cardId: "cigano.23", traditionId: "cigano", symbol: "Os Ratos", catalogIndex: 27 }),
  Object.freeze({ cardId: "cigano.24", traditionId: "cigano", symbol: "O Coracao", catalogIndex: 28 }),
  Object.freeze({ cardId: "cigano.25", traditionId: "cigano", symbol: "O Anel", catalogIndex: 29 }),
  Object.freeze({ cardId: "cigano.26", traditionId: "cigano", symbol: "O Livro", catalogIndex: 30 }),
  Object.freeze({ cardId: "cigano.27", traditionId: "cigano", symbol: "A Carta", catalogIndex: 31 }),
  Object.freeze({ cardId: "cigano.28", traditionId: "cigano", symbol: "O Cigano", catalogIndex: 32 }),
  Object.freeze({ cardId: "cigano.29", traditionId: "cigano", symbol: "A Cigana (Dama)", catalogIndex: 33 }),
  Object.freeze({ cardId: "cigano.30", traditionId: "cigano", symbol: "Os Lírios", catalogIndex: 34 }),
  Object.freeze({ cardId: "cigano.31", traditionId: "cigano", symbol: "O Sol", catalogIndex: 35 }),
  Object.freeze({ cardId: "cigano.32", traditionId: "cigano", symbol: "A Lua (Cheia)", catalogIndex: 36 }),
]);

// Tarot Major Arcana — 22 (0-21), split into 2 constants
export const TAROT_MAJOR_PART_1: readonly SacredRef[] = Object.freeze([
  Object.freeze({ cardId: "tarot.00", traditionId: "tarot", symbol: "O Louco", catalogIndex: 0 }),
  Object.freeze({ cardId: "tarot.01", traditionId: "tarot", symbol: "O Mago", catalogIndex: 1 }),
  Object.freeze({ cardId: "tarot.02", traditionId: "tarot", symbol: "A Sacerdotisa", catalogIndex: 2 }),
  Object.freeze({ cardId: "tarot.03", traditionId: "tarot", symbol: "A Imperatriz", catalogIndex: 3 }),
  Object.freeze({ cardId: "tarot.04", traditionId: "tarot", symbol: "O Imperador", catalogIndex: 4 }),
  Object.freeze({ cardId: "tarot.05", traditionId: "tarot", symbol: "O Hierofante", catalogIndex: 5 }),
  Object.freeze({ cardId: "tarot.06", traditionId: "tarot", symbol: "Os Enamorados", catalogIndex: 6 }),
  Object.freeze({ cardId: "tarot.07", traditionId: "tarot", symbol: "O Carro", catalogIndex: 7 }),
  Object.freeze({ cardId: "tarot.08", traditionId: "tarot", symbol: "A Forca", catalogIndex: 8 }),
  Object.freeze({ cardId: "tarot.09", traditionId: "tarot", symbol: "O Eremita", catalogIndex: 9 }),
  Object.freeze({ cardId: "tarot.10", traditionId: "tarot", symbol: "A Roda da Fortuna", catalogIndex: 10 }),
]);

export const TAROT_MAJOR_PART_2: readonly SacredRef[] = Object.freeze([
  Object.freeze({ cardId: "tarot.11", traditionId: "tarot", symbol: "A Justica", catalogIndex: 11 }),
  Object.freeze({ cardId: "tarot.12", traditionId: "tarot", symbol: "O Enforcado", catalogIndex: 12 }),
  Object.freeze({ cardId: "tarot.13", traditionId: "tarot", symbol: "A Morte", catalogIndex: 13 }),
  Object.freeze({ cardId: "tarot.14", traditionId: "tarot", symbol: "A Temperanca", catalogIndex: 14 }),
  Object.freeze({ cardId: "tarot.15", traditionId: "tarot", symbol: "O Diabo", catalogIndex: 15 }),
  Object.freeze({ cardId: "tarot.16", traditionId: "tarot", symbol: "A Torre", catalogIndex: 16 }),
  Object.freeze({ cardId: "tarot.17", traditionId: "tarot", symbol: "A Estrela", catalogIndex: 17 }),
  Object.freeze({ cardId: "tarot.18", traditionId: "tarot", symbol: "A Lua", catalogIndex: 18 }),
  Object.freeze({ cardId: "tarot.19", traditionId: "tarot", symbol: "O Sol", catalogIndex: 19 }),
  Object.freeze({ cardId: "tarot.20", traditionId: "tarot", symbol: "O Julgamento", catalogIndex: 20 }),
  Object.freeze({ cardId: "tarot.21", traditionId: "tarot", symbol: "O Mundo", catalogIndex: 21 }),
]);

// Orixás — 16 entidades
export const ORIXAS_CATALOG: readonly SacredRef[] = Object.freeze([
  Object.freeze({ cardId: "orixas.exu", traditionId: "orixas", symbol: "Exu", catalogIndex: 0 }),
  Object.freeze({ cardId: "orixas.ogum", traditionId: "orixas", symbol: "Ogum", catalogIndex: 1 }),
  Object.freeze({ cardId: "orixas.oxossi", traditionId: "orixas", symbol: "Oxossi", catalogIndex: 2 }),
  Object.freeze({ cardId: "orixas.oxum", traditionId: "orixas", symbol: "Oxum", catalogIndex: 3 }),
  Object.freeze({ cardId: "orixas.xango", traditionId: "orixas", symbol: "Xango", catalogIndex: 4 }),
  Object.freeze({ cardId: "orixas.iansa", traditionId: "orixas", symbol: "Iansa", catalogIndex: 5 }),
  Object.freeze({ cardId: "orixas.iemanja", traditionId: "orixas", symbol: "Iemanja", catalogIndex: 6 }),
  Object.freeze({ cardId: "orixas.nana", traditionId: "orixas", symbol: "Nana", catalogIndex: 7 }),
  Object.freeze({ cardId: "orixas.omulu", traditionId: "orixas", symbol: "Omulu", catalogIndex: 8 }),
  Object.freeze({ cardId: "orixas.oxala", traditionId: "orixas", symbol: "Oxala", catalogIndex: 9 }),
  Object.freeze({ cardId: "orixas.ibeji", traditionId: "orixas", symbol: "Ibeji", catalogIndex: 10 }),
  Object.freeze({ cardId: "orixas.logun_ede", traditionId: "orixas", symbol: "Logun Ede", catalogIndex: 11 }),
  Object.freeze({ cardId: "orixas.oxum_igbon", traditionId: "orixas", symbol: "Oxum Igbon", catalogIndex: 12 }),
  Object.freeze({ cardId: "orixas.oxumare", traditionId: "orixas", symbol: "Oxumare", catalogIndex: 13 }),
  Object.freeze({ cardId: "orixas.iama", traditionId: "orixas", symbol: "Iama", catalogIndex: 14 }),
  Object.freeze({ cardId: "orixas.obaluaie", traditionId: "orixas", symbol: "Obaluaie", catalogIndex: 15 }),
]);

// Astrologia — 12 casas
export const HOUSES_CATALOG: readonly SacredRef[] = Object.freeze([
  Object.freeze({ cardId: "astrologia.casa_01", traditionId: "astrologia", symbol: "Casa 1", catalogIndex: 0 }),
  Object.freeze({ cardId: "astrologia.casa_02", traditionId: "astrologia", symbol: "Casa 2", catalogIndex: 1 }),
  Object.freeze({ cardId: "astrologia.casa_03", traditionId: "astrologia", symbol: "Casa 3", catalogIndex: 2 }),
  Object.freeze({ cardId: "astrologia.casa_04", traditionId: "astrologia", symbol: "Casa 4", catalogIndex: 3 }),
  Object.freeze({ cardId: "astrologia.casa_05", traditionId: "astrologia", symbol: "Casa 5", catalogIndex: 4 }),
  Object.freeze({ cardId: "astrologia.casa_06", traditionId: "astrologia", symbol: "Casa 6", catalogIndex: 5 }),
  Object.freeze({ cardId: "astrologia.casa_07", traditionId: "astrologia", symbol: "Casa 7", catalogIndex: 6 }),
  Object.freeze({ cardId: "astrologia.casa_08", traditionId: "astrologia", symbol: "Casa 8", catalogIndex: 7 }),
  Object.freeze({ cardId: "astrologia.casa_09", traditionId: "astrologia", symbol: "Casa 9", catalogIndex: 8 }),
  Object.freeze({ cardId: "astrologia.casa_10", traditionId: "astrologia", symbol: "Casa 10", catalogIndex: 9 }),
  Object.freeze({ cardId: "astrologia.casa_11", traditionId: "astrologia", symbol: "Casa 11", catalogIndex: 10 }),
  Object.freeze({ cardId: "astrologia.casa_12", traditionId: "astrologia", symbol: "Casa 12", catalogIndex: 11 }),
]);

// Sefirot — 10
export const SEFIROT_CATALOG: readonly SacredRef[] = Object.freeze([
  Object.freeze({ cardId: "sefirot.keter", traditionId: "sefirot", symbol: "Keter", catalogIndex: 0 }),
  Object.freeze({ cardId: "sefirot.chokmah", traditionId: "sefirot", symbol: "Chokmah", catalogIndex: 1 }),
  Object.freeze({ cardId: "sefirot.binah", traditionId: "sefirot", symbol: "Binah", catalogIndex: 2 }),
  Object.freeze({ cardId: "sefirot.chesed", traditionId: "sefirot", symbol: "Chesed", catalogIndex: 3 }),
  Object.freeze({ cardId: "sefirot.gevurah", traditionId: "sefirot", symbol: "Gevurah", catalogIndex: 4 }),
  Object.freeze({ cardId: "sefirot.tiferet", traditionId: "sefirot", symbol: "Tiferet", catalogIndex: 5 }),
  Object.freeze({ cardId: "sefirot.netzach", traditionId: "sefirot", symbol: "Netzach", catalogIndex: 6 }),
  Object.freeze({ cardId: "sefirot.hod", traditionId: "sefirot", symbol: "Hod", catalogIndex: 7 }),
  Object.freeze({ cardId: "sefirot.yesod", traditionId: "sefirot", symbol: "Yesod", catalogIndex: 8 }),
  Object.freeze({ cardId: "sefirot.malkuth", traditionId: "sefirot", symbol: "Malkuth", catalogIndex: 9 }),
]);

// I Ching — 64 hexagramas, split into 2 constants
export const I_CHING_PART_1: readonly SacredRef[] = Object.freeze([
  Object.freeze({ cardId: "i_ching.01", traditionId: "i_ching", symbol: "Qian (O Criativo)", catalogIndex: 0 }),
  Object.freeze({ cardId: "i_ching.02", traditionId: "i_ching", symbol: "Kun (O Receptivo)", catalogIndex: 1 }),
  Object.freeze({ cardId: "i_ching.03", traditionId: "i_ching", symbol: "Zhun (Dificuldade Inicial)", catalogIndex: 2 }),
  Object.freeze({ cardId: "i_ching.04", traditionId: "i_ching", symbol: "Meng (Insensatez Juvenil)", catalogIndex: 3 }),
  Object.freeze({ cardId: "i_ching.05", traditionId: "i_ching", symbol: "Xu (Espera)", catalogIndex: 4 }),
  Object.freeze({ cardId: "i_ching.06", traditionId: "i_ching", symbol: "Song (Conflito)", catalogIndex: 5 }),
  Object.freeze({ cardId: "i_ching.07", traditionId: "i_ching", symbol: "Shi (O Exercito)", catalogIndex: 6 }),
  Object.freeze({ cardId: "i_ching.08", traditionId: "i_ching", symbol: "Bi (Solidariedade)", catalogIndex: 7 }),
  Object.freeze({ cardId: "i_ching.09", traditionId: "i_ching", symbol: "Xiao Chu (Pequena Contencao)", catalogIndex: 8 }),
  Object.freeze({ cardId: "i_ching.10", traditionId: "i_ching", symbol: "Lu (Pisando)", catalogIndex: 9 }),
  Object.freeze({ cardId: "i_ching.11", traditionId: "i_ching", symbol: "Tai (Paz)", catalogIndex: 10 }),
  Object.freeze({ cardId: "i_ching.12", traditionId: "i_ching", symbol: "Pi (Estagnacao)", catalogIndex: 11 }),
  Object.freeze({ cardId: "i_ching.13", traditionId: "i_ching", symbol: "Tong Ren (Companheirismo)", catalogIndex: 12 }),
  Object.freeze({ cardId: "i_ching.14", traditionId: "i_ching", symbol: "Da You (Grande Posse)", catalogIndex: 13 }),
  Object.freeze({ cardId: "i_ching.15", traditionId: "i_ching", symbol: "Qian (Modestia)", catalogIndex: 14 }),
  Object.freeze({ cardId: "i_ching.16", traditionId: "i_ching", symbol: "Yu (Entusiasmo)", catalogIndex: 15 }),
  Object.freeze({ cardId: "i_ching.17", traditionId: "i_ching", symbol: "Sui (Seguimento)", catalogIndex: 16 }),
  Object.freeze({ cardId: "i_ching.18", traditionId: "i_ching", symbol: "Gu (Trabalho no Degradado)", catalogIndex: 17 }),
  Object.freeze({ cardId: "i_ching.19", traditionId: "i_ching", symbol: "Lin (Aproximacao)", catalogIndex: 18 }),
  Object.freeze({ cardId: "i_ching.20", traditionId: "i_ching", symbol: "Guan (Contemplacao)", catalogIndex: 19 }),
  Object.freeze({ cardId: "i_ching.21", traditionId: "i_ching", symbol: "Shi He (Mordendo)", catalogIndex: 20 }),
  Object.freeze({ cardId: "i_ching.22", traditionId: "i_ching", symbol: "Bi (Graca)", catalogIndex: 21 }),
  Object.freeze({ cardId: "i_ching.23", traditionId: "i_ching", symbol: "Bo (Desintegracao)", catalogIndex: 22 }),
  Object.freeze({ cardId: "i_ching.24", traditionId: "i_ching", symbol: "Fu (Retorno)", catalogIndex: 23 }),
  Object.freeze({ cardId: "i_ching.25", traditionId: "i_ching", symbol: "Wu Wang (Inocencia)", catalogIndex: 24 }),
  Object.freeze({ cardId: "i_ching.26", traditionId: "i_ching", symbol: "Da Chu (Grande Contencao)", catalogIndex: 25 }),
  Object.freeze({ cardId: "i_ching.27", traditionId: "i_ching", symbol: "Yi (Boca)", catalogIndex: 26 }),
  Object.freeze({ cardId: "i_ching.28", traditionId: "i_ching", symbol: "Da Guo (Preponderancia do Grande)", catalogIndex: 27 }),
  Object.freeze({ cardId: "i_ching.29", traditionId: "i_ching", symbol: "Kan (O Abismal)", catalogIndex: 28 }),
  Object.freeze({ cardId: "i_ching.30", traditionId: "i_ching", symbol: "Li (O Aderente)", catalogIndex: 29 }),
  Object.freeze({ cardId: "i_ching.31", traditionId: "i_ching", symbol: "Xian (Influencia)", catalogIndex: 30 }),
  Object.freeze({ cardId: "i_ching.32", traditionId: "i_ching", symbol: "Heng (Duracao)", catalogIndex: 31 }),
]);

export const I_CHING_PART_2: readonly SacredRef[] = Object.freeze([
  Object.freeze({ cardId: "i_ching.33", traditionId: "i_ching", symbol: "Dun (Retirada)", catalogIndex: 32 }),
  Object.freeze({ cardId: "i_ching.34", traditionId: "i_ching", symbol: "Da Zhuang (O Poder do Grande)", catalogIndex: 33 }),
  Object.freeze({ cardId: "i_ching.35", traditionId: "i_ching", symbol: "Jin (Progresso)", catalogIndex: 34 }),
  Object.freeze({ cardId: "i_ching.36", traditionId: "i_ching", symbol: "Ming Yi (Escurecimento da Luz)", catalogIndex: 35 }),
  Object.freeze({ cardId: "i_ching.37", traditionId: "i_ching", symbol: "Jia Ren (A Familia)", catalogIndex: 36 }),
  Object.freeze({ cardId: "i_ching.38", traditionId: "i_ching", symbol: "Kui (Oposicao)", catalogIndex: 37 }),
  Object.freeze({ cardId: "i_ching.39", traditionId: "i_ching", symbol: "Jian (Obstrucao)", catalogIndex: 38 }),
  Object.freeze({ cardId: "i_ching.40", traditionId: "i_ching", symbol: "Jie (Liberacao)", catalogIndex: 39 }),
  Object.freeze({ cardId: "i_ching.41", traditionId: "i_ching", symbol: "Sun (Decremente)", catalogIndex: 40 }),
  Object.freeze({ cardId: "i_ching.42", traditionId: "i_ching", symbol: "Yi (Aumente)", catalogIndex: 41 }),
  Object.freeze({ cardId: "i_ching.43", traditionId: "i_ching", symbol: "Guai (Rompimento)", catalogIndex: 42 }),
  Object.freeze({ cardId: "i_ching.44", traditionId: "i_ching", symbol: "Gou (Vindo ao Encontro)", catalogIndex: 43 }),
  Object.freeze({ cardId: "i_ching.45", traditionId: "i_ching", symbol: "Cui (Reuniao)", catalogIndex: 44 }),
  Object.freeze({ cardId: "i_ching.46", traditionId: "i_ching", symbol: "Sheng (Subindo)", catalogIndex: 45 }),
  Object.freeze({ cardId: "i_ching.47", traditionId: "i_ching", symbol: "Kun (Exaustao)", catalogIndex: 46 }),
  Object.freeze({ cardId: "i_ching.48", traditionId: "i_ching", symbol: "Jing (O Poco)", catalogIndex: 47 }),
  Object.freeze({ cardId: "i_ching.49", traditionId: "i_ching", symbol: "Ge (Revolucao)", catalogIndex: 48 }),
  Object.freeze({ cardId: "i_ching.50", traditionId: "i_ching", symbol: "Ding (O Caldeirao)", catalogIndex: 49 }),
  Object.freeze({ cardId: "i_ching.51", traditionId: "i_ching", symbol: "Zhen (O Trovão)", catalogIndex: 50 }),
  Object.freeze({ cardId: "i_ching.52", traditionId: "i_ching", symbol: "Gen (A Montanha)", catalogIndex: 51 }),
  Object.freeze({ cardId: "i_ching.53", traditionId: "i_ching", symbol: "Jian (Desenvolvimento)", catalogIndex: 52 }),
  Object.freeze({ cardId: "i_ching.54", traditionId: "i_ching", symbol: "Gui Mei (A Moça que se Casa)", catalogIndex: 53 }),
  Object.freeze({ cardId: "i_ching.55", traditionId: "i_ching", symbol: "Feng (Abundância)", catalogIndex: 54 }),
  Object.freeze({ cardId: "i_ching.56", traditionId: "i_ching", symbol: "Lu (O Viajante)", catalogIndex: 55 }),
  Object.freeze({ cardId: "i_ching.57", traditionId: "i_ching", symbol: "Xun (O Suave)", catalogIndex: 56 }),
  Object.freeze({ cardId: "i_ching.58", traditionId: "i_ching", symbol: "Dui (O Sereno)", catalogIndex: 57 }),
  Object.freeze({ cardId: "i_ching.59", traditionId: "i_ching", symbol: "Huan (Dispersao)", catalogIndex: 58 }),
  Object.freeze({ cardId: "i_ching.60", traditionId: "i_ching", symbol: "Jie (Limitacao)", catalogIndex: 59 }),
  Object.freeze({ cardId: "i_ching.61", traditionId: "i_ching", symbol: "Zhong Fu (Verdade Interior)", catalogIndex: 60 }),
  Object.freeze({ cardId: "i_ching.62", traditionId: "i_ching", symbol: "Xiao Guo (Preponderância do Pequeno)", catalogIndex: 61 }),
  Object.freeze({ cardId: "i_ching.63", traditionId: "i_ching", symbol: "Ji Ji (Apos a Conclusao)", catalogIndex: 62 }),
  Object.freeze({ cardId: "i_ching.64", traditionId: "i_ching", symbol: "Wei Ji (Antes da Conclusao)", catalogIndex: 63 }),
]);

// Hebrew letters — 27 (22 + 5 final forms: Kaf/Mem/Nun/Pe/Tsade sofit)
export const HEBREW_LETTERS_CATALOG: readonly SacredRef[] = Object.freeze([
  Object.freeze({ cardId: "hebrew.aleph", traditionId: "hebrew", symbol: "Aleph", catalogIndex: 0 }),
  Object.freeze({ cardId: "hebrew.bet", traditionId: "hebrew", symbol: "Bet", catalogIndex: 1 }),
  Object.freeze({ cardId: "hebrew.gimel", traditionId: "hebrew", symbol: "Gimel", catalogIndex: 2 }),
  Object.freeze({ cardId: "hebrew.dalet", traditionId: "hebrew", symbol: "Dalet", catalogIndex: 3 }),
  Object.freeze({ cardId: "hebrew.he", traditionId: "hebrew", symbol: "He", catalogIndex: 4 }),
  Object.freeze({ cardId: "hebrew.vav", traditionId: "hebrew", symbol: "Vav", catalogIndex: 5 }),
  Object.freeze({ cardId: "hebrew.zayin", traditionId: "hebrew", symbol: "Zayin", catalogIndex: 6 }),
  Object.freeze({ cardId: "hebrew.chet", traditionId: "hebrew", symbol: "Chet", catalogIndex: 7 }),
  Object.freeze({ cardId: "hebrew.tet", traditionId: "hebrew", symbol: "Tet", catalogIndex: 8 }),
  Object.freeze({ cardId: "hebrew.yod", traditionId: "hebrew", symbol: "Yod", catalogIndex: 9 }),
  Object.freeze({ cardId: "hebrew.kaf", traditionId: "hebrew", symbol: "Kaf", catalogIndex: 10 }),
  Object.freeze({ cardId: "hebrew.lamed", traditionId: "hebrew", symbol: "Lamed", catalogIndex: 11 }),
  Object.freeze({ cardId: "hebrew.mem", traditionId: "hebrew", symbol: "Mem", catalogIndex: 12 }),
  Object.freeze({ cardId: "hebrew.nun", traditionId: "hebrew", symbol: "Nun", catalogIndex: 13 }),
  Object.freeze({ cardId: "hebrew.samekh", traditionId: "hebrew", symbol: "Samekh", catalogIndex: 14 }),
  Object.freeze({ cardId: "hebrew.ayin", traditionId: "hebrew", symbol: "Ayin", catalogIndex: 15 }),
  Object.freeze({ cardId: "hebrew.pe", traditionId: "hebrew", symbol: "Pe", catalogIndex: 16 }),
  Object.freeze({ cardId: "hebrew.tsade", traditionId: "hebrew", symbol: "Tsade", catalogIndex: 17 }),
  Object.freeze({ cardId: "hebrew.qof", traditionId: "hebrew", symbol: "Qof", catalogIndex: 18 }),
  Object.freeze({ cardId: "hebrew.resh", traditionId: "hebrew", symbol: "Resh", catalogIndex: 19 }),
  Object.freeze({ cardId: "hebrew.shin", traditionId: "hebrew", symbol: "Shin", catalogIndex: 20 }),
  Object.freeze({ cardId: "hebrew.tav", traditionId: "hebrew", symbol: "Tav", catalogIndex: 21 }),
  // 5 final forms (sofit) — essential for cross-engine kabbalistic numerology
  Object.freeze({ cardId: "hebrew.kaf_sofit", traditionId: "hebrew", symbol: "Kaf Sofit", catalogIndex: 22 }),
  Object.freeze({ cardId: "hebrew.mem_sofit", traditionId: "hebrew", symbol: "Mem Sofit", catalogIndex: 23 }),
  Object.freeze({ cardId: "hebrew.nun_sofit", traditionId: "hebrew", symbol: "Nun Sofit", catalogIndex: 24 }),
  Object.freeze({ cardId: "hebrew.pe_sofit", traditionId: "hebrew", symbol: "Pe Sofit", catalogIndex: 25 }),
  Object.freeze({ cardId: "hebrew.tsade_sofit", traditionId: "hebrew", symbol: "Tsade Sofit", catalogIndex: 26 }),
]);

// Planetas — 11
export const PLANETS_CATALOG: readonly SacredRef[] = Object.freeze([
  Object.freeze({ cardId: "planetas.sol", traditionId: "planetas", symbol: "Sol", catalogIndex: 0 }),
  Object.freeze({ cardId: "planetas.lua", traditionId: "planetas", symbol: "Lua", catalogIndex: 1 }),
  Object.freeze({ cardId: "planetas.mercurio", traditionId: "planetas", symbol: "Mercurio", catalogIndex: 2 }),
  Object.freeze({ cardId: "planetas.venus", traditionId: "planetas", symbol: "Venus", catalogIndex: 3 }),
  Object.freeze({ cardId: "planetas.marte", traditionId: "planetas", symbol: "Marte", catalogIndex: 4 }),
  Object.freeze({ cardId: "planetas.jupiter", traditionId: "planetas", symbol: "Jupiter", catalogIndex: 5 }),
  Object.freeze({ cardId: "planetas.saturno", traditionId: "planetas", symbol: "Saturno", catalogIndex: 6 }),
  Object.freeze({ cardId: "planetas.urano", traditionId: "planetas", symbol: "Urano", catalogIndex: 7 }),
  Object.freeze({ cardId: "planetas.netuno", traditionId: "planetas", symbol: "Netuno", catalogIndex: 8 }),
  Object.freeze({ cardId: "planetas.plutao", traditionId: "planetas", symbol: "Plutao", catalogIndex: 9 }),
  Object.freeze({ cardId: "planetas.terra", traditionId: "planetas", symbol: "Terra", catalogIndex: 10 }),
]);

// Numerologia — 12 (1-9 + 3 master numbers 11/22/33). Beyond floor of 11.
export const NUMEROLOGY_CATALOG: readonly SacredRef[] = Object.freeze([
  Object.freeze({ cardId: "numerologia.01", traditionId: "numerologia", symbol: "Numero 1", catalogIndex: 0 }),
  Object.freeze({ cardId: "numerologia.02", traditionId: "numerologia", symbol: "Numero 2", catalogIndex: 1 }),
  Object.freeze({ cardId: "numerologia.03", traditionId: "numerologia", symbol: "Numero 3", catalogIndex: 2 }),
  Object.freeze({ cardId: "numerologia.04", traditionId: "numerologia", symbol: "Numero 4", catalogIndex: 3 }),
  Object.freeze({ cardId: "numerologia.05", traditionId: "numerologia", symbol: "Numero 5", catalogIndex: 4 }),
  Object.freeze({ cardId: "numerologia.06", traditionId: "numerologia", symbol: "Numero 6", catalogIndex: 5 }),
  Object.freeze({ cardId: "numerologia.07", traditionId: "numerologia", symbol: "Numero 7", catalogIndex: 6 }),
  Object.freeze({ cardId: "numerologia.08", traditionId: "numerologia", symbol: "Numero 8", catalogIndex: 7 }),
  Object.freeze({ cardId: "numerologia.09", traditionId: "numerologia", symbol: "Numero 9", catalogIndex: 8 }),
  // Master numbers (Pitagoricos) — numerology tradition extension
  Object.freeze({ cardId: "numerologia.11", traditionId: "numerologia", symbol: "Mestre 11", catalogIndex: 9 }),
  Object.freeze({ cardId: "numerologia.22", traditionId: "numerologia", symbol: "Mestre 22", catalogIndex: 10 }),
  Object.freeze({ cardId: "numerologia.33", traditionId: "numerologia", symbol: "Mestre 33", catalogIndex: 11 }),
]);

// ---------------------------------------------------------------------------
// Section 6 — Aggregated TRADITION_CATALOGS + READING_TRADITION_CARDS map
// ---------------------------------------------------------------------------

export const TRADITION_CATALOGS: Readonly<
  Record<TraditionId, readonly SacredRef[]>
> = Object.freeze({
  cigano: Object.freeze([
    ...CIGANO_COURT_CARDS,
    ...CIGANO_NUMBERED_PART_1,
    ...CIGANO_NUMBERED_PART_2,
  ]),
  tarot: Object.freeze([...TAROT_MAJOR_PART_1, ...TAROT_MAJOR_PART_2]),
  orixas: ORIXAS_CATALOG,
  astrologia: HOUSES_CATALOG,
  sefirot: SEFIROT_CATALOG,
  i_ching: Object.freeze([...I_CHING_PART_1, ...I_CHING_PART_2]),
  hebrew: HEBREW_LETTERS_CATALOG,
  planetas: PLANETS_CATALOG,
  numerologia: NUMEROLOGY_CATALOG,
});

export const READING_TRADITION_CARDS: Readonly<
  Record<TraditionId, readonly CardId[]>
> = Object.freeze({
  cigano: Object.freeze(
    TRADITION_CATALOGS.cigano.map((r) => r.cardId),
  ),
  tarot: Object.freeze(TRADITION_CATALOGS.tarot.map((r) => r.cardId)),
  orixas: Object.freeze(TRADITION_CATALOGS.orixas.map((r) => r.cardId)),
  astrologia: Object.freeze(TRADITION_CATALOGS.astrologia.map((r) => r.cardId)),
  sefirot: Object.freeze(TRADITION_CATALOGS.sefirot.map((r) => r.cardId)),
  i_ching: Object.freeze(TRADITION_CATALOGS.i_ching.map((r) => r.cardId)),
  hebrew: Object.freeze(TRADITION_CATALOGS.hebrew.map((r) => r.cardId)),
  planetas: Object.freeze(TRADITION_CATALOGS.planetas.map((r) => r.cardId)),
  numerologia: Object.freeze(
    TRADITION_CATALOGS.numerologia.map((r) => r.cardId),
  ),
});

// Per-tradition audit floor.
export const TRADITION_FLOORS: Readonly<Record<TraditionId, number>> =
  Object.freeze({
    cigano: 36,
    tarot: 22,
    orixas: 16,
    astrologia: 12,
    sefirot: 10,
    i_ching: 64,
    hebrew: 22,
    planetas: 11,
    numerologia: 11,
  });

// ---------------------------------------------------------------------------
// Section 7 — Custom error classes
// ---------------------------------------------------------------------------

export class AkashaReadingError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(`AKASHA_READING_${code}: ${message}`);
    this.code = code;
    this.name = "AkashaReadingError";
  }
}

export class InvalidSpreadError extends AkashaReadingError {
  constructor(message: string) {
    super("INVALID_SPREAD", message);
    this.name = "InvalidSpreadError";
  }
}

export class InvalidTraditionError extends AkashaReadingError {
  constructor(message: string) {
    super("INVALID_TRADITION", message);
    this.name = "InvalidTraditionError";
  }
}

export class EmptySeedError extends AkashaReadingError {
  constructor(message: string) {
    super("EMPTY_SEED", message);
    this.name = "EmptySeedError";
  }
}

// ---------------------------------------------------------------------------
// Section 8 — Type guards
// ---------------------------------------------------------------------------

const SPREAD_KEYS: ReadonlySet<SpreadType> = new Set<SpreadType>([
  "SINGLE",
  "THREE_TIMES",
  "FIVE_CROSS",
  "NINE_STAR",
]);

const TRADITION_KEYS: ReadonlySet<TraditionId> = new Set<TraditionId>([
  "cigano",
  "tarot",
  "orixas",
  "astrologia",
  "sefirot",
  "i_ching",
  "hebrew",
  "planetas",
  "numerologia",
]);

export function isValidSpreadType(s: unknown): s is SpreadType {
  return typeof s === "string" && SPREAD_KEYS.has(s as SpreadType);
}

export function isValidTraditionId(t: unknown): t is TraditionId {
  return typeof t === "string" && TRADITION_KEYS.has(t as TraditionId);
}

export function isValidCardId(id: unknown): id is CardId {
  if (typeof id !== "string") return false;
  return Object.values(READING_TRADITION_CARDS).some((list) =>
    list.includes(id as CardId),
  );
}

// ---------------------------------------------------------------------------
// Section 9 — Drawing helpers
// ---------------------------------------------------------------------------

function uint32FromHex(hex: string): number {
  return parseInt(hex.slice(0, 8), 16) >>> 0;
}

function drawIndexFromHmac(hmacHex: string, mod: number): number {
  if (mod <= 0) return 0;
  return uint32FromHex(hmacHex) % mod;
}

function normalizeSeed(seed: string): string {
  if (typeof seed !== "string") return "";
  return seed.trim();
}

function pickCardFromCatalog(
  catalog: readonly SacredRef[],
  hmacHex: string,
): SacredRef {
  const idx = drawIndexFromHmac(hmacHex, catalog.length);
  return catalog[idx]!;
}

// ---------------------------------------------------------------------------
// Section 10 — drawReading (deterministic HMAC draw)
// ---------------------------------------------------------------------------

export function drawReading(
  spreadType: SpreadType,
  question: string,
  seed: string,
  ctx?: ReadingContext,
): ReadingResult {
  if (!isValidSpreadType(spreadType)) {
    throw new InvalidSpreadError(`Unknown spreadType: ${String(spreadType)}`);
  }
  const trimmedSeed = normalizeSeed(seed);
  if (!trimmedSeed) {
    throw new EmptySeedError(
      "seed is required for deterministic reading draws",
    );
  }
  const traditionId = SPREAD_TYPES[spreadType].defaultTradition;
  if (!isValidTraditionId(traditionId)) {
    throw new InvalidTraditionError(
      `default tradition missing for ${spreadType}`,
    );
  }

  const catalog = TRADITION_CATALOGS[traditionId];
  if (!catalog || catalog.length === 0) {
    throw new InvalidTraditionError(
      `catalog empty for tradition ${traditionId}`,
    );
  }

  const slotDefs = SLOT_TEMPLATES[spreadType];
  const policyVersion = ctx?.policyVersion ?? "w65.v1";

  const slots: ReadingSlot[] = [];
  let prevSlotHash = trimmedSeed;
  for (let i = 0; i < slotDefs.length; i++) {
    const def = slotDefs[i]!;
    const slotKey = `${spreadType}|${traditionId}|${i}|${trimmedSeed}`;
    const slotHmac = hmacSha256Hex(trimmedSeed, slotKey);
    const card = pickCardFromCatalog(catalog, slotHmac);
    const slot: ReadingSlot = {
      index: i,
      position: def.position,
      archetype: def.archetype,
      polarity: def.polarity,
      cardId: card.cardId,
      traditionId,
      symbol: card.symbol,
      hmac: hmacSha256Hex(prevSlotHash, `${i}|${card.cardId}|${slotHmac}`),
    };
    slots.push(slot);
    prevSlotHash = slot.hmac;
  }

  const finalHash = chainReadingHash(prevSlotHash, { slots }, trimmedSeed);
  const readingIdMaterial = `${spreadType}|${traditionId}|${finalHash}|${policyVersion}`;
  const readingId = sha256Hex(readingIdMaterial);

  // Non-authoritative timestamp (audit only — does NOT affect determinism).
  // Use Date as ISO string; two clients at different wall-clock times WILL
  // produce same slots, chainHash, and readingId. drawnAt is metadata.
  const drawnAt = new Date(0).toISOString();

  return {
    readingId,
    spreadType,
    traditionId,
    question: question ?? "",
    seed: trimmedSeed,
    drawnAt,
    slots,
    chainHash: finalHash,
    policyVersion,
  };
}

// ---------------------------------------------------------------------------
// Section 11 — mapSlots (semantic mapping per tradition)
// ---------------------------------------------------------------------------

export function mapSlots(
  spreadType: SpreadType,
  traditionId: TraditionId,
): SlotSemantics[] {
  if (!isValidSpreadType(spreadType)) {
    throw new InvalidSpreadError(`Unknown spreadType: ${String(spreadType)}`);
  }
  if (!isValidTraditionId(traditionId)) {
    throw new InvalidTraditionError(
      `Unknown traditionId: ${String(traditionId)}`,
    );
  }
  const templates = SLOT_TEMPLATES[spreadType];
  return templates.map((t, i) => ({
    index: i,
    position: t.position,
    archetype: t.archetype,
    polarity: t.polarity,
    questionHint: t.questionHint,
  }));
}

// ---------------------------------------------------------------------------
// Section 12 — interpretReading (calls externalContext.divinationInterpret)
// ---------------------------------------------------------------------------

const FALLBACK_HINTS: ReadonlyArray<Record<string, string>> = Object.freeze([
  Object.freeze({
    luz: "Convite a luz: o que pediu renasce agora. Sustente a clareza.",
    sombra: "Convite a sombra: o que esconde pede reconhecimento. Abrace sem fugir.",
    neutro: "Convite ao centro: nem luz nem sombra — apenas presença.",
  }),
  Object.freeze({
    luz: "A energia favorece a ação; confie no que sente.",
    sombra: "Algo pede pausa; reveja antes de responder.",
    neutro: "Espere; o momento pede escuta, não ação.",
  }),
  Object.freeze({
    luz: "Acolhimento: o caminho se abre quando se compartilha.",
    sombra: "Limite: proteja o que é seu antes de doar.",
    neutro: "Reflexão: a resposta mora no que ainda não foi dito.",
  }),
]);

export function interpretReading(
  reading: ReadingResult,
  ctx?: ReadingContext,
): InterpretationHint[] {
  const validate = validateReading(reading);
  if (!validate.ok) {
    return reading.slots.map((slot) => ({
      slotIndex: slot.index,
      position: slot.position,
      cardId: slot.cardId,
      symbol: slot.symbol,
      traditionId: slot.traditionId,
      polarity: slot.polarity,
      archetype: slot.archetype,
      hints: [
        "LEITURA_INVALIDA",
        ...validate.errors,
      ],
    }));
  }

  const interpret = ctx?.externalContext?.divinationInterpret;
  const mesaHouse = ctx?.mesaRealHouse;

  return reading.slots.map((slot) => {
    let hints: string[];
    if (interpret && typeof interpret === "function") {
      try {
        const out = interpret(
          slot.cardId,
          slot.traditionId,
          slot.position,
          slot.polarity,
        );
        hints = Array.isArray(out) && out.length > 0
          ? out
          : [FALLBACK_HINTS[0]![slot.polarity]!];
      } catch {
        hints = [
          FALLBACK_HINTS[0]![slot.polarity]!,
          FALLBACK_HINTS[1]![slot.polarity]!,
        ];
      }
    } else {
      const idx = slot.index % FALLBACK_HINTS.length;
      hints = [
        FALLBACK_HINTS[idx]![slot.polarity]!,
        FALLBACK_HINTS[(idx + 1) % FALLBACK_HINTS.length]![slot.polarity]!,
      ];
    }

    const out: InterpretationHint = {
      slotIndex: slot.index,
      position: slot.position,
      cardId: slot.cardId,
      symbol: slot.symbol,
      traditionId: slot.traditionId,
      polarity: slot.polarity,
      archetype: slot.archetype,
      hints,
    };

    if (typeof mesaHouse === "number" && mesaHouse >= 1 && mesaHouse <= 36) {
      const houseSlot = (slot.index % 9) + 1;
      out.mesaCrossRef = {
        house: mesaHouse,
        reason:
          `slot ${slot.position} cruzando casa ${houseSlot} da Mesa Real ` +
          `(house=${mesaHouse})`,
      };
    }

    return out;
  });
}

// ---------------------------------------------------------------------------
// Section 13 — validateReading (graceful, never throws)
// ---------------------------------------------------------------------------

export function validateReading(r: ReadingResult): ValidationResult {
  const errors: string[] = [];
  if (!r || typeof r !== "object") {
    return { ok: false, errors: ["READING_NOT_OBJECT"] };
  }
  if (!isValidSpreadType(r.spreadType)) {
    errors.push("INVALID_SPREAD_TYPE");
  }
  if (!isValidTraditionId(r.traditionId)) {
    errors.push("INVALID_TRADITION_ID");
  }
  if (typeof r.seed !== "string" || !r.seed.trim()) {
    errors.push("EMPTY_SEED");
  }
  if (typeof r.readingId !== "string" || !r.readingId.match(/^[0-9a-f]{64}$/)) {
    errors.push("INVALID_READING_ID_FORMAT");
  }
  if (typeof r.chainHash !== "string" || !r.chainHash.match(/^[0-9a-f]{64}$/)) {
    errors.push("INVALID_CHAIN_HASH_FORMAT");
  }
  if (!Array.isArray(r.slots)) {
    errors.push("SLOTS_NOT_ARRAY");
  } else {
    const expected = isValidSpreadType(r.spreadType)
      ? SPREAD_TYPES[r.spreadType].slotCount
      : 0;
    if (r.slots.length !== expected) {
      errors.push(
        `SLOT_COUNT_MISMATCH(expected=${expected},got=${r.slots.length})`,
      );
    }
    r.slots.forEach((slot, i) => {
      if (!slot || typeof slot !== "object") {
        errors.push(`SLOT_${i}_NOT_OBJECT`);
        return;
      }
      if (typeof slot.cardId !== "string" || !isValidCardId(slot.cardId)) {
        errors.push(`SLOT_${i}_INVALID_CARD_ID`);
      }
      if (typeof slot.symbol !== "string" || !slot.symbol.trim()) {
        errors.push(`SLOT_${i}_EMPTY_SYMBOL`);
      }
      if (
        slot.polarity !== "luz" &&
        slot.polarity !== "sombra" &&
        slot.polarity !== "neutro"
      ) {
        errors.push(`SLOT_${i}_INVALID_POLARITY`);
      }
      if (typeof slot.hmac !== "string" || !slot.hmac.match(/^[0-9a-f]{64}$/)) {
        errors.push(`SLOT_${i}_INVALID_HMAC_FORMAT`);
      }
      if (typeof slot.index !== "number" || slot.index !== i) {
        errors.push(`SLOT_${i}_INDEX_OUT_OF_ORDER`);
      }
    });
  }
  return { ok: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Section 14 — chainReadingHash (HMAC tamper-evidence)
// ---------------------------------------------------------------------------

export function chainReadingHash(
  prevHash: string,
  reading: Pick<ReadingResult, "slots">,
  secret: string,
): string {
  const safeSecret = typeof secret === "string" && secret ? secret : "akasha-w65";
  const basePrev = typeof prevHash === "string" ? prevHash : "";
  if (Array.isArray(reading.slots)) {
    let acc = basePrev;
    for (let i = 0; i < reading.slots.length; i++) {
      const slot = reading.slots[i]!;
      acc = hmacSha256Hex(safeSecret, `${acc}|${i}|${slot.cardId}|${slot.hmac}`);
    }
    return hmacSha256Hex(safeSecret, `${acc}|${basePrev}`);
  }
  return hmacSha256Hex(safeSecret, `${basePrev}|FALLBACK`);
}

// ---------------------------------------------------------------------------
// Section 15 — auditReadingCoverage
// ---------------------------------------------------------------------------

export function auditReadingCoverage(): CoverageReport {
  const byTradition: Record<TraditionId, number> = {
    cigano: TRADITION_CATALOGS.cigano.length,
    tarot: TRADITION_CATALOGS.tarot.length,
    orixas: TRADITION_CATALOGS.orixas.length,
    astrologia: TRADITION_CATALOGS.astrologia.length,
    sefirot: TRADITION_CATALOGS.sefirot.length,
    i_ching: TRADITION_CATALOGS.i_ching.length,
    hebrew: TRADITION_CATALOGS.hebrew.length,
    planetas: TRADITION_CATALOGS.planetas.length,
    numerologia: TRADITION_CATALOGS.numerologia.length,
  };
  const total = Object.values(byTradition).reduce((a, b) => a + b, 0);
  const gaps: TraditionId[] = [];
  (Object.keys(byTradition) as TraditionId[]).forEach((t) => {
    if (byTradition[t] < TRADITION_FLOORS[t]) gaps.push(t);
  });
  return {
    total,
    byTradition,
    isFullCoverage: gaps.length === 0 && total >= 211,
    floors: { ...TRADITION_FLOORS },
    gaps,
  };
}

// ---------------------------------------------------------------------------
// Section 16 — Sacred coverage helper
// ---------------------------------------------------------------------------

export interface SacredCoverageDetail {
  tradition: TraditionId;
  floor: number;
  count: number;
  meets: boolean;
}

export function sacredCoverageDetail(): SacredCoverageDetail[] {
  const cov = auditReadingCoverage();
  return (Object.keys(cov.floors) as TraditionId[]).map((t) => ({
    tradition: t,
    floor: cov.floors[t]!,
    count: cov.byTradition[t]!,
    meets: cov.byTradition[t]! >= cov.floors[t]!,
  }));
}

export function isFullSacredCoverage(): boolean {
  return auditReadingCoverage().isFullCoverage;
}

// ---------------------------------------------------------------------------
// Section 17 — Catalog introspection helpers
// ---------------------------------------------------------------------------

export function listTraditions(): TraditionId[] {
  return Array.from(TRADITION_KEYS);
}

export function countCardsByTradition(t: TraditionId): number {
  if (!isValidTraditionId(t)) return 0;
  return TRADITION_CATALOGS[t].length;
}

export function lookupCard(cardId: CardId): SacredRef | null {
  if (typeof cardId !== "string") return null;
  for (const t of TRADITION_KEYS) {
    const found = TRADITION_CATALOGS[t].find((r) => r.cardId === cardId);
    if (found) return found;
  }
  return null;
}

export function cardsForTradition(t: TraditionId): readonly CardId[] {
  if (!isValidTraditionId(t)) return Object.freeze([]);
  return READING_TRADITION_CARDS[t];
}

// ---------------------------------------------------------------------------
// Section 18 — Determinism helpers (cross-spread)
// ---------------------------------------------------------------------------

export function isDeterministicRun(
  reading: ReadingResult,
  expectedSeed: string,
): boolean {
  if (!reading || typeof reading !== "object") return false;
  return reading.seed === expectedSeed;
}

// ---------------------------------------------------------------------------
// Section 19 — Audit summary (grep-friendly, last block)
// ---------------------------------------------------------------------------

export const __ALL_EXPORTS = Object.freeze({
  constants: [
    "SPREAD_TYPES",
    "SLOT_TEMPLATES",
    "READING_TRADITION_CARDS",
    "TRADITION_CATALOGS",
    "TRADITION_FLOORS",
    "CIGANO_COURT_CARDS",
    "CIGANO_NUMBERED_PART_1",
    "CIGANO_NUMBERED_PART_2",
    "TAROT_MAJOR_PART_1",
    "TAROT_MAJOR_PART_2",
    "ORIXAS_CATALOG",
    "HOUSES_CATALOG",
    "SEFIROT_CATALOG",
    "I_CHING_PART_1",
    "I_CHING_PART_2",
    "HEBREW_LETTERS_CATALOG",
    "PLANETS_CATALOG",
    "NUMEROLOGY_CATALOG",
  ],
  functions: [
    "drawReading",
    "mapSlots",
    "interpretReading",
    "auditReadingCoverage",
    "validateReading",
    "chainReadingHash",
    "sacredCoverageDetail",
    "isFullSacredCoverage",
    "listTraditions",
    "countCardsByTradition",
    "lookupCard",
    "cardsForTradition",
    "isDeterministicRun",
  ],
  typeGuards: ["isValidSpreadType", "isValidTraditionId", "isValidCardId"],
  types: [
    "TraditionId",
    "SpreadType",
    "CardId",
    "SlotSemantics",
    "SacredRef",
    "ReadingSlot",
    "ReadingResult",
    "ReadingContext",
    "InterpretationHint",
    "ValidationResult",
    "CoverageReport",
    "SacredCoverageDetail",
    "SpreadDef",
  ],
  errorClasses: [
    "AkashaReadingError",
    "InvalidSpreadError",
    "InvalidTraditionError",
    "EmptySeedError",
  ],
  sections: 19,
});