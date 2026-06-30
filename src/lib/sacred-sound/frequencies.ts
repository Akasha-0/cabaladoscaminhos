// ============================================================================
// SACRED SOUND — FREQUENCIES
// ============================================================================
// Solfeggio 9 + Chakra 7 + Custom (432Hz, 528Hz, 40Hz Gamma) catalog.
// Frozen records per cycle 60+ lesson 1 (`as const` is not Object.freeze()).
// Lookup helpers are pure (no IO), records live in module scope.
// ============================================================================

/** Branded scalar type for UserId (cycle 65 pattern — phantom type). */
export type UserId = string & { readonly __brand: "UserId" };
/** Branded scalar type for FrequencyId. */
export type FrequencyId = string & { readonly __brand: "FrequencyId" };

/** Seven sacred traditions. Mirrors w69 community-circles enum. */
export type Tradition =
  | "cigano"
  | "orixas"
  | "astrologia"
  | "cabala"
  | "numerologia"
  | "tantra"
  | "tarot";

/** Nine intentions span the spectrum from grounding to awakening. */
export type Intention =
  | "healing"
  | "grounding"
  | "awakening"
  | "protection"
  | "love"
  | "clarity"
  | "transformation"
  | "gratitude"
  | "forgiveness"
  | "intuition"
  | "abundance";

/** Seven chakras of the subtle body. */
export type Chakra =
  | "Muladhara"
  | "Svadhisthana"
  | "Manipura"
  | "Anahata"
  | "Vishuddha"
  | "Ajna"
  | "Sahasrara";

/** A single frequency entry — Solfeggio, chakra, or custom. */
export interface Frequency {
  readonly id: FrequencyId;
  readonly hz: number;
  readonly tradition: Tradition;
  readonly chakra?: Chakra;
  readonly intention: Intention;
  readonly name: string;
  readonly citation: string;
}

// ============================================================================
// SOLFEGGIO 9 (Tonal scale of the Universe — Dr. Joseph Puleo / Dr. Len Horowitz)
// ============================================================================
export const SOLFEGGIO_FREQUENCIES: Readonly<Record<string, Frequency>> =
  Object.freeze({
    "174": {
      id: "174hz" as FrequencyId,
      hz: 174,
      tradition: "tantra",
      chakra: "Muladhara",
      intention: "grounding",
      name: "Foundation Tone",
      citation: "Puleo & Horowitz, Healing Codes for the Biological Apocalypse (1999)",
    },
    "285": {
      id: "285hz" as FrequencyId,
      hz: 285,
      tradition: "tantra",
      chakra: "Muladhara",
      intention: "healing",
      name: "Cellular Regeneration",
      citation: "Puleo & Horowitz (1999) — tissue repair quantum signature",
    },
    "396": {
      id: "396hz" as FrequencyId,
      hz: 396,
      tradition: "cabala",
      chakra: "Muladhara",
      intention: "transformation",
      name: "Liberation from Fear",
      citation: "UT — Re (Ut queant laxis) — root-chakra grief release",
    },
    "417": {
      id: "417hz" as FrequencyId,
      hz: 417,
      tradition: "astrologia",
      chakra: "Svadhisthana",
      intention: "transformation",
      name: "Frequency of Change",
      citation: "Re — transmutation & facilitating change",
    },
    "528": {
      id: "528hz" as FrequencyId,
      hz: 528,
      tradition: "cabala",
      chakra: "Manipura",
      intention: "healing",
      name: "Mi — DNA Repair / Love",
      citation: "Solfeggio Mi — the 'love frequency' (528 Hz mathematical core of DNA)",
    },
    "639": {
      id: "639hz" as FrequencyId,
      hz: 639,
      tradition: "tarot",
      chakra: "Anahata",
      intention: "love",
      name: "Fa — Connection",
      citation: "Fa — harmonizing relationships, heart-coherence",
    },
    "741": {
      id: "741hz" as FrequencyId,
      hz: 741,
      tradition: "tantra",
      chakra: "Vishuddha",
      intention: "clarity",
      name: "Sol — Awakening Intuition",
      citation: "Sol — problem-solving, expression, throat-chakra awakening",
    },
    "852": {
      id: "852hz" as FrequencyId,
      hz: 852,
      tradition: "astrologia",
      chakra: "Ajna",
      intention: "awakening",
      name: "La — Returning to Spirit",
      citation: "La — third-eye awakening, intuitive order",
    },
    "963": {
      id: "963hz" as FrequencyId,
      hz: 963,
      tradition: "cabala",
      chakra: "Sahasrara",
      intention: "awakening",
      name: "Re (Divine) — Cosmic Consciousness",
      citation: "Re-un (9+6+3=18, 1+8=9) — crown-chakra unity",
    },
  });

// ============================================================================
// CHAKRA 7 (color-frequency alignment — Western yoga/Indian tantra)
// ============================================================================
export const CHAKRA_FREQUENCIES: Readonly<Record<Chakra, Frequency>> =
  Object.freeze({
    Muladhara: SOLFEGGIO_FREQUENCIES["396"]!,
    Svadhisthana: SOLFEGGIO_FREQUENCIES["417"]!,
    Manipura: SOLFEGGIO_FREQUENCIES["528"]!,
    Anahata: SOLFEGGIO_FREQUENCIES["639"]!,
    Vishuddha: SOLFEGGIO_FREQUENCIES["741"]!,
    Ajna: SOLFEGGIO_FREQUENCIES["852"]!,
    Sahasrara: SOLFEGGIO_FREQUENCIES["963"]!,
  });

// ============================================================================
// CUSTOM FREQUENCIES (non-Solfeggio but historically revered)
// ============================================================================
export const CUSTOM_FREQUENCIES: Readonly<Record<string, Frequency>> =
  Object.freeze({
    "432hz": {
      id: "432hz" as FrequencyId,
      hz: 432,
      tradition: "astrologia",
      intention: "grounding",
      name: "Verdi Tuning / Earth Resonance",
      citation:
        "Verdi's A=432 Hz; C=256 Hz (C256) — Pythagorean mathematical harmony",
    },
    "440hz": {
      id: "440hz" as FrequencyId,
      hz: 440,
      tradition: "astrologia",
      intention: "clarity",
      name: "ISO 16 Concert Pitch",
      citation:
        "ISO 16:1975 — modern orchestral tuning reference (informational baseline)",
    },
    "40hz": {
      id: "40hz" as FrequencyId,
      hz: 40,
      tradition: "tantra",
      intention: "awakening",
      name: "Gamma 40 Hz — Neural Binding",
      citation:
        "Cutsworth & Cardeña (2018) — gamma-band binding, meditation, lucid awareness",
    },
    "111hz": {
      id: "111hz" as FrequencyId,
      hz: 111,
      tradition: "numerologia",
      intention: "awakening",
      name: "Angelic 111 Hz",
      citation:
        "111 Hz = 3 × 37, master number 111 — numerological angelic frequency",
    },
    "222hz": {
      id: "222hz" as FrequencyId,
      hz: 222,
      tradition: "numerologia",
      intention: "love",
      name: "Twin Flame 222 Hz",
      citation:
        "222 Hz = 2 × 111 — twin flame + balanced partnership",
    },
    "333hz": {
      id: "333hz" as FrequencyId,
      hz: 333,
      tradition: "numerologia",
      intention: "clarity",
      name: "Trinity 333 Hz",
      citation:
        "333 Hz — Ascended Masters frequency, ascended-master triad",
    },
    "888hz": {
      id: "888hz" as FrequencyId,
      hz: 888,
      tradition: "numerologia",
      intention: "gratitude",
      name: "Abundance 888 Hz",
      citation:
        "888 Hz — financial abundance, infinite flow (Pythagorean)",
    },
    "808hz": {
      id: "808hz" as FrequencyId,
      hz: 808,
      tradition: "orixas",
      intention: "grounding",
      name: "Iansã 808 Hz — Storm Pulse",
      citation:
        "808 Hz — Iansã/Oya storm-wind rhythm, also panic-state grounding",
    },
    "727hz": {
      id: "727hz" as FrequencyId,
      hz: 727,
      tradition: "orixas",
      intention: "healing",
      name: "Oxalá 727 Hz — Father Healing",
      citation:
        "727 Hz — Oxalá father-frequency for grief & ancestral healing",
    },
    "136hz": {
      id: "136hz" as FrequencyId,
      hz: 136,
      tradition: "cigano",
      intention: "grounding",
      name: "OM Cigano 136.1 Hz",
      citation:
        "136.1 Hz (OM tuned to C#) — cigano adaptation, cosmic OM frequency",
    },
    "194hz": {
      id: "194hz" as FrequencyId,
      hz: 194,
      tradition: "cigano",
      intention: "protection",
      name: "Cigano Wanderer 194 Hz",
      citation:
        "194 Hz — caminho cigano (gypsy road) protection",
    },
    "318hz": {
      id: "318hz" as FrequencyId,
      hz: 318,
      tradition: "cigano",
      intention: "love",
      name: "Santa Sara 318 Hz",
      citation:
        "318 Hz — Santa Sara Kali, patroness of the Romani people",
    },
  });

/** Master catalog — union of all frequency sources, indexed by FrequencyId. */
export const ALL_FREQUENCIES: Readonly<Record<FrequencyId, Frequency>> =
  Object.freeze(
    Object.fromEntries([
      ...Object.values(SOLFEGGIO_FREQUENCIES),
      ...Object.values(CUSTOM_FREQUENCIES),
    ].map((f) => [f.id, f])),
  );

// ============================================================================
// LOOKUP HELPERS — pure, side-effect free
// ============================================================================

/** Get a frequency by its ID. Returns undefined when unknown. */
export function getFrequency(id: FrequencyId): Frequency | undefined {
  return ALL_FREQUENCIES[id];
}

/** Get frequencies belonging to a tradition (deduplicated). */
export function getFrequenciesByTradition(
  tradition: Tradition,
): readonly Frequency[] {
  const out: Frequency[] = [];
  const seen = new Set<FrequencyId>();
  for (const f of Object.values(ALL_FREQUENCIES)) {
    if (f.tradition === tradition && !seen.has(f.id)) {
      out.push(f);
      seen.add(f.id);
    }
  }
  return out;
}

/** Get frequencies mapped to a specific chakra. */
export function getFrequenciesByChakra(chakra: Chakra): readonly Frequency[] {
  const out: Frequency[] = [];
  for (const f of Object.values(ALL_FREQUENCIES)) {
    if (f.chakra === chakra) out.push(f);
  }
  return out;
}

/** Get frequencies carrying a specific intention. */
export function getFrequenciesByIntention(
  intention: Intention,
): readonly Frequency[] {
  const out: Frequency[] = [];
  for (const f of Object.values(ALL_FREQUENCIES)) {
    if (f.intention === intention) out.push(f);
  }
  return out;
}

/** Get a frequency by its Hertz value (rounded to int). */
export function getFrequencyByHz(hz: number): Frequency | undefined {
  for (const f of Object.values(ALL_FREQUENCIES)) {
    if (f.hz === hz) return f;
  }
  return undefined;
}

/** Audit helper — returns counts for diagnostics. */
export function auditFrequencyCatalog(): {
  total: number;
  solfeggio: number;
  chakra: number;
  custom: number;
  traditions: Readonly<Record<Tradition, number>>;
  intentions: Readonly<Record<Intention, number>>;
} {
  const all = Object.values(ALL_FREQUENCIES);
  const traditions: Record<Tradition, number> = {
    cigano: 0,
    orixas: 0,
    astrologia: 0,
    cabala: 0,
    numerologia: 0,
    tantra: 0,
    tarot: 0,
  };
  const intentions: Record<Intention, number> = {
    healing: 0,
    grounding: 0,
    awakening: 0,
    protection: 0,
    love: 0,
    clarity: 0,
    transformation: 0,
    gratitude: 0,
    forgiveness: 0,
    intuition: 0,
    abundance: 0,
  };
  for (const f of all) {
    traditions[f.tradition]++;
    intentions[f.intention]++;
  }
  return {
    total: all.length,
    solfeggio: Object.keys(SOLFEGGIO_FREQUENCIES).length,
    chakra: Object.keys(CHAKRA_FREQUENCIES).length,
    custom: Object.keys(CUSTOM_FREQUENCIES).length,
    traditions,
    intentions,
  };
}