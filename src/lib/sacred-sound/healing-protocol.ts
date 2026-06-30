// ============================================================================
// SACRED SOUND — HEALING PROTOCOLS
// ============================================================================
// Condition → frequency + mantra + duration recommendation catalog.
// 20+ protocols spanning 7 traditions. Lookup by condition, by tradition,
// recommendation engine returns top-3 protocols for a UserState snapshot.
// Custom protocol builder for ad-hoc prescriptions.
// ============================================================================

import type { Tradition, Intention, Chakra } from "./frequencies.ts";
import type { FrequencyId } from "./frequencies.ts";
import type { MantraId } from "./mantras.ts";

export type ProtocolId = string & { readonly __brand: "ProtocolId" };

/** 15+ common emotional / spiritual states. */
export type Condition =
  | "anxiety"
  | "insomnia"
  | "low-energy"
  | "grief"
  | "concentration"
  | "grounding"
  | "heartbreak"
  | "creativity-block"
  | "fear"
  | "anger"
  | "self-doubt"
  | "trauma"
  | "isolation"
  | "sadness"
  | "overwhelm"
  | "compassion-fatigue"
  | "decision-paralysis"
  | "spirituality-disconnect";

export interface Protocol {
  readonly id: ProtocolId;
  readonly condition: Condition;
  readonly frequencies: readonly FrequencyId[];
  readonly mantras: readonly MantraId[];
  readonly duration: number; // seconds
  readonly tradition: Tradition;
  readonly citation: string;
}

export interface UserState {
  readonly currentEmotion?: string;
  readonly intention?: Intention;
  readonly energyLevel?: number; // 1..10
  readonly dominantChakra?: Chakra;
}

export interface CustomProtocolConfig {
  readonly condition: Condition;
  readonly frequencies: readonly FrequencyId[];
  readonly mantras: readonly MantraId[];
  readonly duration: number;
  readonly tradition: Tradition;
  readonly citation?: string;
}

// ============================================================================
// PROTOCOL CATALOG (24 protocols, multi-tradition)
// ============================================================================
function _p(
  id: string,
  condition: Condition,
  frequencies: readonly string[],
  mantras: readonly string[],
  duration: number,
  tradition: Tradition,
  citation: string,
): Protocol {
  return {
    id: id as ProtocolId,
    condition,
    frequencies: frequencies.map((f) => f as FrequencyId),
    mantras: mantras.map((m) => m as MantraId),
    duration,
    tradition,
    citation,
  };
}

const _PROTOCOL_SEED: readonly Protocol[] = [
  // Anxiety — Cabala + Tantra: heart-opening + calming
  _p("proto-anxiety-001", "anxiety", ["528hz", "285hz"], ["tan-011", "cab-003"], 1200, "cabala", "Solfeggio 528 + 'Om Shanti' — parasympathetic activation"),
  // Insomnia — Tantra + Cabala
  _p("proto-insomnia-001", "insomnia", ["174hz", "285hz"], ["tan-009", "cab-002"], 1800, "tantra", "Foundation tones + Soham — yogic sleep induction"),
  // Low-energy — Astrologia (Sol)
  _p("proto-low-energy-001", "low-energy", ["528hz", "963hz"], ["ast-001", "tan-001"], 900, "astrologia", "Ad Solis + Om — solar plexus activation"),
  // Grief — Orixás + Cabala
  _p("proto-grief-001", "grief", ["396hz", "528hz"], ["ori-006", "cab-007"], 1500, "orixas", "Nanã Buruque + Elohim Tzevaot — ancestral mourning"),
  // Concentration — Numerologia + Tarot
  _p("proto-concentration-001", "concentration", ["741hz", "852hz"], ["num-007", "tar-012"], 900, "numerologia", "7-7-7 + Lamed (Justice) — analytical clarity"),
  // Grounding — Tantra (Muladhara)
  _p("proto-grounding-001", "grounding", ["174hz", "432hz"], ["tan-002", "tan-014"], 1200, "tantra", "Lam + Om Aham — root chakra stabilization"),
  // Heartbreak — Cabala + Orixás (Oxum)
  _p("proto-heartbreak-001", "heartbreak", ["528hz", "639hz"], ["cab-011", "ori-015"], 1800, "cabala", "Chesed + Oxum — Anahata healing + love deity"),
  // Creativity-block — Astrologia (Mercury)
  _p("proto-creativity-001", "creativity-block", ["741hz", "852hz"], ["ast-004", "num-005"], 1500, "astrologia", "Ad Mercurii + 5-5-5 — Mercurial eloquence"),
  // Fear — Cabala (Geburah)
  _p("proto-fear-001", "fear", ["396hz", "285hz"], ["cab-012", "tan-012"], 1200, "cabala", "Gevurah + Om Namah Shivaya — liberation from fear"),
  // Anger — Orixás (Ogum) + Cigano
  _p("proto-anger-001", "anger", ["285hz", "741hz"], ["ori-002", "cig-011"], 900, "orixas", "Ogum + Salve Cigano — warrior transmutation"),
  // Self-doubt — Tarot + Cabala
  _p("proto-self-doubt-001", "self-doubt", ["528hz", "741hz"], ["tar-006", "cab-013"], 1200, "tarot", "Vav + Tiferet — beauty & willpower"),
  // Trauma — Cabala + Orixás
  _p("proto-trauma-001", "trauma", ["174hz", "528hz"], ["cab-009", "ori-011"], 1800, "cabala", "Adonai + Omolu — cellular repair + ancestral healing"),
  // Isolation — Cigano + Cabala
  _p("proto-isolation-001", "isolation", ["639hz", "528hz"], ["cig-005", "cab-001"], 1500, "cigano", "Santa Sara + Ehyeh — community + divine I-Am"),
  // Sadness — Numerologia (9 = completude)
  _p("proto-sadness-001", "sadness", ["528hz", "963hz"], ["num-009", "tan-010"], 1500, "numerologia", "9-9-9 + Om Mani Padme Hum — completion + compassion"),
  // Overwhelm — Tantra
  _p("proto-overwhelm-001", "overwhelm", ["174hz", "396hz"], ["tan-011", "tan-009"], 1800, "tantra", "4-7-8 breathing + Soham — parasympathetic reset"),
  // Compassion-fatigue — Tantra (Avalokiteshvara)
  _p("proto-compassion-fatigue-001", "compassion-fatigue", ["528hz", "963hz"], ["tan-010", "tan-014"], 1800, "tantra", "Om Mani Padme Hum + Om Aham — replenish the giver"),
  // Decision-paralysis — Numerologia (11=portal)
  _p("proto-decision-001", "decision-paralysis", ["741hz", "852hz"], ["num-010", "tar-005"], 900, "numerologia", "11-11 + He (Emperor) — clear-cut decision"),
  // Spirituality-disconnect — Cabala (Kether)
  _p("proto-spirituality-001", "spirituality-disconnect", ["963hz", "852hz"], ["cab-001", "tan-013"], 1800, "cabala", "Ehyeh + Gayatri — crown reconnection"),
  // Bonus: Anxiety — Tantra variant
  _p("proto-anxiety-002", "anxiety", ["285hz", "396hz"], ["tan-002", "tan-005"], 1500, "tantra", "Lam + Yam — Muladhara + Anahata grounding"),
  // Bonus: Insomnia — Cigano
  _p("proto-insomnia-002", "insomnia", ["285hz", "528hz"], ["cig-009", "cig-012"], 1800, "cigano", "Calunga Pequena + Estrela Cigana — gentle sleep"),
  // Bonus: Low-energy — Orixás (Oxalá)
  _p("proto-low-energy-002", "low-energy", ["528hz", "741hz"], ["ori-001", "ori-002"], 900, "orixas", "Oxalá + Ogum — father energy + warrior activation"),
  // Bonus: Concentration — Tarot variant
  _p("proto-concentration-002", "concentration", ["852hz", "963hz"], ["tar-010", "tar-014"], 1200, "tarot", "Yod + Shin — hermit meditation + judgment"),
  // Bonus: Grief — Cigano
  _p("proto-grief-002", "grief", ["396hz", "528hz"], ["cig-013", "cig-010"], 1500, "cigano", "Salve as Almas + Calunga Grande — ancestral farewell"),
  // Bonus: Heartbreak — Tantra
  _p("proto-heartbreak-002", "heartbreak", ["528hz", "639hz"], ["tan-005", "tan-010"], 1500, "tantra", "Yam + Om Mani Padme Hum — Anahata + Avalokiteshvara"),
];

export const PROTOCOLS: Readonly<Record<ProtocolId, Protocol>> = Object.freeze(
  Object.fromEntries(_PROTOCOL_SEED.map((p) => [p.id, p])),
);

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

/** Get the FIRST protocol matching a condition (deterministic — sorted by id). */
export function getProtocolForCondition(
  condition: Condition,
): Protocol | undefined {
  const candidates = _PROTOCOL_SEED.filter((p) => p.condition === condition);
  if (candidates.length === 0) return undefined;
  // Sort by id for determinism (cycle 67 lesson 5 — HMAC-friendly deterministic JSON).
  const sorted = [...candidates].sort((a, b) => a.id.localeCompare(b.id));
  return sorted[0];
}

/** Get ALL protocols matching a condition. */
export function getProtocolsForCondition(
  condition: Condition,
): readonly Protocol[] {
  return [..._PROTOCOL_SEED.filter((p) => p.condition === condition)].sort(
    (a, b) => a.id.localeCompare(b.id),
  );
}

/** Get protocols belonging to a tradition. */
export function getProtocolsByTradition(
  tradition: Tradition,
): readonly Protocol[] {
  return [..._PROTOCOL_SEED.filter((p) => p.tradition === tradition)].sort(
    (a, b) => a.id.localeCompare(b.id),
  );
}

/** Get a protocol by ID. */
export function getProtocol(id: ProtocolId): Protocol | undefined {
  return PROTOCOLS[id];
}

/** Count protocols in catalog. */
export function protocolCount(): number {
  return _PROTOCOL_SEED.length;
}

// ============================================================================
// RECOMMENDATION ENGINE — top-3 protocols for a UserState snapshot
// ============================================================================

/**
 * Heuristic scoring: condition match (exact or related), intention match,
 * energy-level coherence (low energy ↔ grounding protocols), chakra match.
 * Returns top-3 by descending score; ties broken by id (deterministic).
 */
export function recommendProtocol(userState: UserState): readonly Protocol[] {
  const scores: Array<{ protocol: Protocol; score: number }> = [];
  const emotion = userState.currentEmotion?.toLowerCase().trim() ?? "";
  const intention = userState.intention;
  const energy = userState.energyLevel;
  const chakra = userState.dominantChakra;

  for (const p of _PROTOCOL_SEED) {
    let score = 0;
    if (emotion && p.condition.toLowerCase() === emotion) score += 5;
    if (emotion && p.condition.toLowerCase().includes(emotion)) score += 2;
    // Energy-level heuristics
    if (energy !== undefined && energy <= 3 && p.condition === "low-energy") {
      score += 3;
    }
    if (energy !== undefined && energy >= 8 && p.condition === "grounding") {
      score += 2;
    }
    // Tradition/intention resonance
    if (intention !== undefined) {
      // Tantra conditions default to awakening/grounding
      if (
        (intention === "awakening" && p.tradition === "tantra") ||
        (intention === "grounding" && p.tradition === "tantra")
      ) {
        score += 1;
      }
      if (intention === "love" && p.condition === "heartbreak") score += 2;
      if (intention === "clarity" && p.condition === "concentration") score += 2;
      if (intention === "healing" && p.condition === "trauma") score += 2;
      if (intention === "forgiveness" && p.condition === "grief") score += 2;
    }
    // Chakra-aware nudge (light)
    if (chakra !== undefined) {
      if (chakra === "Anahata" && p.condition === "heartbreak") score += 1;
      if (chakra === "Muladhara" && p.condition === "grounding") score += 1;
      if (chakra === "Ajna" && p.condition === "concentration") score += 1;
    }
    if (score > 0) {
      scores.push({ protocol: p, score });
    }
  }
  scores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.protocol.id.localeCompare(b.protocol.id);
  });
  return scores.slice(0, 3).map((s) => s.protocol);
}

// ============================================================================
// CUSTOM PROTOCOL BUILDER
// ============================================================================

/** Build a one-off custom protocol from arbitrary inputs. */
export function customProtocol(config: CustomProtocolConfig): Protocol {
  if (config.frequencies.length === 0) {
    throw new Error("customProtocol: at least one frequency required");
  }
  if (config.mantras.length === 0) {
    throw new Error("customProtocol: at least one mantra required");
  }
  if (!Number.isInteger(config.duration) || config.duration < 30 || config.duration > 7200) {
    throw new Error(
      `customProtocol: invalid duration ${config.duration}s (30..7200)`,
    );
  }
  // Use both high-resolution time and a process-unique counter + random suffix
  // to guarantee uniqueness even under synchronous burst creation in the same
  // millisecond (e.g., vitest's t.beforeEach loops).
  const idStr = `custom-${config.condition}-${Date.now().toString(36)}-${process.hrtime.bigint().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const proto: Protocol = {
    id: idStr as ProtocolId,
    condition: config.condition,
    frequencies: [...config.frequencies],
    mantras: [...config.mantras],
    duration: config.duration,
    tradition: config.tradition,
    citation: config.citation ?? "User-defined custom protocol",
  };
  return proto;
}

// ============================================================================
// AUDIT
// ============================================================================

/** Coverage diagnostics — does catalog span all conditions? */
export function auditProtocolCatalog(): {
  total: number;
  byCondition: Readonly<Record<Condition, number>>;
  byTradition: Readonly<Record<Tradition, number>>;
} {
  const byCondition: Record<Condition, number> = {
    anxiety: 0,
    insomnia: 0,
    "low-energy": 0,
    grief: 0,
    concentration: 0,
    grounding: 0,
    heartbreak: 0,
    "creativity-block": 0,
    fear: 0,
    anger: 0,
    "self-doubt": 0,
    trauma: 0,
    isolation: 0,
    sadness: 0,
    overwhelm: 0,
    "compassion-fatigue": 0,
    "decision-paralysis": 0,
    "spirituality-disconnect": 0,
  };
  const byTradition: Record<Tradition, number> = {
    cigano: 0,
    orixas: 0,
    astrologia: 0,
    cabala: 0,
    numerologia: 0,
    tantra: 0,
    tarot: 0,
  };
  for (const p of _PROTOCOL_SEED) {
    byCondition[p.condition]++;
    byTradition[p.tradition]++;
  }
  return {
    total: _PROTOCOL_SEED.length,
    byCondition,
    byTradition,
  };
}