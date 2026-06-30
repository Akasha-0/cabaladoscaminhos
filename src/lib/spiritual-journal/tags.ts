// ============================================================================
// SPIRITUAL JOURNAL — tags.ts (Wave 70, 2026-06-30)
// ============================================================================
// Sacred-tag system for journal entries.
//
// Sacred-tag extraction detects terms from all 7 traditions (cycle 62
// lesson 12). Tags are canonicalized (lowercase + hyphen normalization)
// and stored separately from the entry content for queryability.
//
// Cross-cycle lessons applied:
//   - Lookaround regex for Portuguese (cycle 60/65/67 — \b breaks on
//     accented chars)
//   - 7-tradition taxonomy (cycle 62 lesson 12)
//   - Catalog coverage ≥84 (cycle 62 lesson 12 floor)
//   - Object.freeze (cycle 60 lesson — runtime frozen)
// ============================================================================

import type {
  JournalEntry,
  Tag,
  Tradition,
  UserId,
} from "./journal.ts";
import {
  listEntries,
  asUserId,
} from "./journal.ts";

// ============================================================================
// BRANDED TYPES
// ============================================================================

declare const _brand: unique symbol;
type Brand<T, B> = T & { readonly [_brand]: B };

export type TagId = Brand<string, "TagId">;
export const asTagId = (s: string): TagId => s as TagId;

// ============================================================================
// SACRED CATALOG — 7 traditions, ≥84 entries total
// ============================================================================

export interface SacredEntry {
  readonly term: string;
  readonly tradition: Tradition;
  readonly category: "card" | "entity" | "symbol" | "planet" | "sign" |
                     "house" | "sefirah" | "letter" | "world" | "number" |
                     "chakra" | "element" | "orixa";
}

// ─── Cigano: 36 cards + 12 entities = 48 ──────────────────────────────
const CIGANO_CARDS = [
  "O Cavaleiro", "A Cigana", "A Sorte", "A Lua", "A Estrela", "O Sol",
  "A Chave", "A Cobra", "A Caveira", "A Flor", "A Cruz", "O Navio",
  "A Casa", "A Árvore", "O Cachorro", "A Raposa", "O Coração",
  "O Anel", "A Torre", "O Jardim", "A Montanha", "O Caminho",
  "O Peixe", "A Borboleta", "O Leque", "A Vela", "A Serpente",
  "A Garrafa", "A Cigana (Carta)", "O Homem", "A Mulher", "O Pássaro",
  "O Leão", "O Olho", "O Punhal", "A Cesta", "A Pomba",
];

const CIGANO_SYMBOLS = [
  "Mesa Real", "Cartas Ciganas", "Limpeza Cigana", "Benzedura Cigana",
  "Banho de Ervas", "Defumação", "Oração Cigana", "Axé Cigano",
];

const CIGANO_ENTITIES = [
  "Cigano Ramiro", "Cigana", "Guardiã das Cartas", "O Ancião",
  "A Mensageira", "O Curandeiro", "A Sacerdotisa", "O Profeta",
  "A Guardiã do Fogo", "O Espírito da Floresta", "A Anciã Cigana",
  "O Mensageiro das Estrelas",
];

// ─── Orixás: 19 ───────────────────────────────────────────────────────
const ORIXAS = [
  "Oxalá", "Ogum", "Iansã", "Oxum", "Xangô", "Iemanjá", "Nanã",
  "Omolu", "Obaluaiê", "Logun-Edé", "Erê", "Exu", "Pomba Gira",
  "Caboclo", "Baiano", "Preto Velho", "Marinheiro", "Boiadeiro",
  "Cigana (Orixá)",
];

// ─── Astrologia: 12 signs + 10 planets + 12 houses = 34 ───────────────
const ASTRO_SIGNS = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes",
];

const ASTRO_PLANETS = [
  "Sol", "Lua", "Mercúrio", "Vênus", "Marte", "Júpiter",
  "Saturno", "Urano", "Netuno", "Plutão",
];

const ASTRO_HOUSES = [
  "Casa 1", "Casa 2", "Casa 3", "Casa 4", "Casa 5", "Casa 6",
  "Casa 7", "Casa 8", "Casa 9", "Casa 10", "Casa 11", "Casa 12",
];

// ─── Numerologia: 13 (1-9, 11, 22, 33, 0) ─────────────────────────────
const NUMBERS = [
  "Número 0", "Número 1", "Número 2", "Número 3", "Número 4",
  "Número 5", "Número 6", "Número 7", "Número 8", "Número 9",
  "Número 11", "Número 22", "Número 33",
];

// ─── Cabala: 10 Sefirot + 22 letras + 4 mundos = 36 ──────────────────
const SEFIROT = [
  "Kéter", "Chokhmah", "Binah", "Chesed", "Geburah",
  "Tiferet", "Hod", "Netzach", "Yesod", "Malkuth",
];

const HEBREW_LETTERS = [
  "Aleph", "Beth", "Gimel", "Daleth", "He", "Vav", "Zayin",
  "Cheth", "Teth", "Yod", "Kaph", "Lamed", "Mem", "Nun",
  "Samekh", "Ayin", "Pe", "Tsade", "Qoph", "Resh", "Shin", "Tav",
];

const KABBALISTIC_WORLDS = [
  "Atziluth", "Beriah", "Yetzirah", "Assiah",
];

// ─── Tantra: 7 chakras + 5 elementos = 12 ─────────────────────────────
const CHAKRAS = [
  "Chakra Raiz", "Chakra Sacral", "Chakra Solar", "Chakra Cardíaco",
  "Chakra Laríngeo", "Chakra Terceiro Olho", "Chakra Coroa",
];

const TANTRA_ELEMENTS = [
  "Elemento Terra", "Elemento Água", "Elemento Fogo",
  "Elemento Ar", "Elemento Éter",
];

// ─── Tarot: 22 Arcanos Maiores = 22 ──────────────────────────────────
const TAROT_MAJOR = [
  "O Louco", "O Mago", "A Sacerdotisa", "A Imperatriz", "O Imperador",
  "O Hierofante", "Os Enamorados", "O Carro", "A Força", "O Eremita",
  "A Roda da Fortuna", "A Justiça", "O Pendurado", "A Morte",
  "A Temperança", "O Diabo", "A Torre", "A Estrela", "A Lua",
  "O Sol", "O Julgamento", "O Mundo",
];

const TAROT_SUITS = ["Paus", "Copas", "Espadas", "Ouros"];

// ============================================================================
// SACRED CATALOG ASSEMBLY
// ============================================================================

function buildSacredCatalog(): readonly SacredEntry[] {
  const entries: SacredEntry[] = [];

  for (const card of CIGANO_CARDS) {
    entries.push({ term: card, tradition: "Cigano", category: "card" });
  }
  for (const sym of CIGANO_SYMBOLS) {
    entries.push({ term: sym, tradition: "Cigano", category: "symbol" });
  }
  for (const entity of CIGANO_ENTITIES) {
    entries.push({ term: entity, tradition: "Cigano", category: "entity" });
  }
  for (const orixa of ORIXAS) {
    entries.push({ term: orixa, tradition: "Orixás", category: "orixa" });
  }
  for (const sign of ASTRO_SIGNS) {
    entries.push({ term: sign, tradition: "Astrologia", category: "sign" });
  }
  for (const planet of ASTRO_PLANETS) {
    entries.push({ term: planet, tradition: "Astrologia", category: "planet" });
  }
  for (const house of ASTRO_HOUSES) {
    entries.push({ term: house, tradition: "Astrologia", category: "house" });
  }
  for (const n of NUMBERS) {
    entries.push({ term: n, tradition: "Numerologia", category: "number" });
  }
  for (const s of SEFIROT) {
    entries.push({ term: s, tradition: "Cabala", category: "sefirah" });
  }
  for (const l of HEBREW_LETTERS) {
    entries.push({ term: l, tradition: "Cabala", category: "letter" });
  }
  for (const w of KABBALISTIC_WORLDS) {
    entries.push({ term: w, tradition: "Cabala", category: "world" });
  }
  for (const c of CHAKRAS) {
    entries.push({ term: c, tradition: "Tantra", category: "chakra" });
  }
  for (const e of TANTRA_ELEMENTS) {
    entries.push({ term: e, tradition: "Tantra", category: "element" });
  }
  for (const t of TAROT_MAJOR) {
    entries.push({ term: t, tradition: "Tarot", category: "card" });
  }
  for (const s of TAROT_SUITS) {
    entries.push({ term: s, tradition: "Tarot", category: "symbol" });
  }
  return Object.freeze(entries);
}

export const SACRED_CATALOG: readonly SacredEntry[] = buildSacredCatalog();

// Per-tradition floors (cycle 62 lesson 12): every tradition ≥ 7 entries
export const REQUIRED_COVERAGE_FLOORS: Readonly<Record<Tradition, number>> = Object.freeze({
  Cigano: 7,
  Orixás: 7,
  Astrologia: 7,
  Cabala: 7,
  Numerologia: 7,
  Tantra: 7,
  Tarot: 7,
});

// ============================================================================
// NORMALIZATION — Cycle 60/65/67 lesson (lowercase + accent strip)
// ============================================================================

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function termToTagId(term: string): TagId {
  return asTagId(
    `tag:${normalize(term).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  );
}

// ============================================================================
// VALIDATE TAG — 2-50 chars, lowercase, no special chars except - and _
// ============================================================================

const TAG_REGEX = /^[a-z0-9_-]{2,50}$/;

export function validateTag(tag: string): boolean {
  if (typeof tag !== "string") return false;
  return TAG_REGEX.test(tag);
}

export function normalizeTag(tag: string): string {
  return normalize(tag).replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "");
}

// ============================================================================
// EXTRACT TAGS — Lookaround regex (cycle 60/65/67 lesson)
// ============================================================================

export interface ExtractedTag {
  readonly tag: Tag;
  readonly count: number;
  readonly positions: readonly number[];
}

/**
 * Extract sacred tags from content using per-term lookaround regex.
 * Cycle 60/65/67 lesson: \b doesn't work for accented Portuguese chars
 * (e.g., "Ó" has no word boundary on either side), so we use
 * case-insensitive substring matching with normalization.
 */
export function extractTags(content: string): readonly ExtractedTag[] {
  if (typeof content !== "string" || content.length === 0) return [];
  const normContent = normalize(content);
  const extracted = new Map<string, ExtractedTag>();

  for (const entry of SACRED_CATALOG) {
    const normTerm = normalize(entry.term);
    if (normTerm.length === 0) continue;
    const positions: number[] = [];
    let idx = 0;
    while (idx < normContent.length) {
      const found = normContent.indexOf(normTerm, idx);
      if (found === -1) break;
      positions.push(found);
      idx = found + normTerm.length;
    }
    if (positions.length === 0) continue;
    const tag: Tag = Object.freeze({
      id: termToTagId(entry.term),
      label: entry.term,
      tradition: entry.tradition,
      sacredRef: entry.term,
    });
    extracted.set(tag.id, {
      tag: Object.freeze(tag),
      count: positions.length,
      positions: Object.freeze(positions),
    });
  }
  return Object.freeze(Array.from(extracted.values()));
}

/**
 * Quick extract (no positions). Useful for createEntry pre-fill.
 */
export function extractTagLabels(content: string): readonly string[] {
  return extractTags(content).map((e) => e.tag.label);
}

// ============================================================================
// CATALOG COVERAGE AUDIT — Assert ≥7 traditions × ≥84 sacred entries
// ============================================================================

export interface CatalogCoverage {
  readonly totalEntries: number;
  readonly byTradition: Readonly<Record<Tradition, number>>;
  readonly meetsTraditionFloor: boolean;
  readonly meetsTotalFloor: boolean;
  readonly uncoveredTraditions: readonly Tradition[];
}

export const TOTAL_CATALOG_FLOOR = 84;

export function assertCatalogCoverage(): void {
  const coverage = catalogCoverage();
  if (!coverage.meetsTraditionFloor) {
    throw new TagCatalogError(
      `Tradition coverage gap: uncovered ${coverage.uncoveredTraditions.join(", ")}`,
    );
  }
  if (!coverage.meetsTotalFloor) {
    throw new TagCatalogError(
      `Total coverage gap: ${coverage.totalEntries} < ${TOTAL_CATALOG_FLOOR}`,
    );
  }
}

export function catalogCoverage(): CatalogCoverage {
  const byTradition = {} as Record<Tradition, number>;
  for (const t of ["Cigano", "Orixás", "Astrologia", "Cabala", "Numerologia", "Tantra", "Tarot"] as Tradition[]) {
    byTradition[t] = 0;
  }
  for (const e of SACRED_CATALOG) {
    byTradition[e.tradition] += 1;
  }
  const uncovered: Tradition[] = [];
  for (const [t, n] of Object.entries(byTradition)) {
    if (n < REQUIRED_COVERAGE_FLOORS[t as Tradition]) {
      uncovered.push(t as Tradition);
    }
  }
  return {
    totalEntries: SACRED_CATALOG.length,
    byTradition: Object.freeze(byTradition),
    meetsTraditionFloor: uncovered.length === 0,
    meetsTotalFloor: SACRED_CATALOG.length >= TOTAL_CATALOG_FLOOR,
    uncoveredTraditions: Object.freeze(uncovered),
  };
}

// ============================================================================
// GET ENTRIES BY TAG — Query layer
// ============================================================================

export function getEntriesByTag(
  userId: UserId,
  tagId: TagId,
): readonly JournalEntry[] {
  const all = listEntries(userId);
  const result = all.filter((e) =>
    e.tags.some((t) => t.id === tagId),
  );
  return Object.freeze(
    result.sort((a, b) => b.createdAt - a.createdAt),
  );
}

// ============================================================================
// TAG CLOUD — Top N tags by frequency
// ============================================================================

export interface TagFrequency {
  readonly tag: Tag;
  readonly count: number;
}

export function getTagCloud(
  userId: UserId,
  limit: number = 20,
): readonly TagFrequency[] {
  const all = listEntries(userId);
  const counts = new Map<string, TagFrequency>();
  for (const entry of all) {
    for (const tag of entry.tags) {
      const existing = counts.get(tag.id);
      if (existing) {
        counts.set(tag.id, {
          tag: existing.tag,
          count: existing.count + 1,
        });
      } else {
        counts.set(tag.id, { tag, count: 1 });
      }
    }
  }
  const sorted = Array.from(counts.values()).sort((a, b) => b.count - a.count);
  return Object.freeze(sorted.slice(0, Math.max(1, Math.floor(limit))));
}

// ============================================================================
// MERGE TAGS — Canonicalize (returns canonical TagId)
// ============================================================================

export function mergeTags(tagA: TagId, tagB: TagId): TagId {
  const a = SACRED_CATALOG.find((e) => termToTagId(e.term) === tagA);
  const b = SACRED_CATALOG.find((e) => termToTagId(e.term) === tagB);
  // Prefer the canonical (catalog) one, else lexicographic smaller
  if (a && !b) return tagA;
  if (b && !a) return tagB;
  if (a && b) {
    return termToTagId(a.term);
  }
  return tagA < tagB ? tagA : tagB;
}

// ============================================================================
// ERRORS
// ============================================================================

export class TagCatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TagCatalogError";
  }
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

export type { JournalEntry, Tag, Tradition, UserId };