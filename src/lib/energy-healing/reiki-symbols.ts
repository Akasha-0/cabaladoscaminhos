/**
 * Reiki Symbols — Usui Shiki Ryoho lineage
 * Each symbol includes its Japanese name, transliteration, purpose, and
 * the mantras/chants used when drawing/activating it.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ReikiSymbol {
  id: string;
  name: string;
  nameJa: string;
  meaning: string;
  purpose: string;
  mantras: string[];
  notes: string;
}

const SYMBOLS: ReikiSymbol[] = [
  {
    id: "cho-ku-rei",
    name: "Cho Ku Rei",
    nameJa: "魂孔霊",
    meaning: "The Power Symbol — 'Place the power of the universe here'",
    purpose:
      "Amplifies spiritual energy; used to power up hands, objects, rooms, food, water, and intentions. First symbol taught in Reiki II.",
    mantras: ["CHO", "KU", "REI"],
    notes:
      "Drawn as a spiral from the outside inward, then outward again. Can be placed on any other symbol to amplify it.",
  },
  {
    id: "sei-hei-ki",
    name: "Sei Hei Ki",
    nameJa: "聖霊契",
    meaning: "The Emotional / Mental Symbol — 'The jewel descends from heaven'",
    purpose:
      "Cleanses and harmonizes the emotional and mental bodies. Used for emotional healing, trauma release, clearing negative thought patterns, and accessing higher states of consciousness.",
    mantras: ["SEI", "HEI", "KI"],
    notes:
      "Often drawn as a large curved line with smaller hooks branching downward. Associated with the brow and heart chakras.",
  },
  {
    id: "hon-sha-ze-sho-nen",
    name: "Hon Sha Ze Sho Nen",
    nameJa: "本源是常念",
    meaning: "The Distance Symbol — 'The Buddha nature within me connects to the Buddha nature within you across all distance and time'",
    purpose:
      "Enables healing to be sent across any distance — physical, emotional, temporal, or dimensional. The foundation for absent/remote healing.",
    mantras: ["HON", "SHA", "ZE", "SHO", "NEN"],
    notes:
      "Can be used for past-life healing, future intentions, and distant relationships. Drawn with the three-part pattern that anchors the intention.",
  },
  {
    id: "dai-ko-myo",
    name: "Dai Ko Myo",
    nameJa: "大光明",
    meaning: "The Master Symbol — 'Great bright shining light'",
    purpose:
      "The most powerful symbol; represents the light of divine wisdom and the ascension energy. Used for spiritual awakening, karmic healing, and connecting to the highest source.",
    mantras: ["DAI", "KO", "MYO"],
    notes:
      "Reserved for Master-level practitioners. Draws the aura of enlightenment. Often used in conjunction with Cho Ku Rei for maximum amplification.",
  },
  {
    id: "raku",
    name: "Raku",
    nameJa: "楽",
    meaning: "The Fire Serpent Symbol — 'Lightning path to enlightenment'",
    purpose:
      "Used during the Master attunement process to awaken the fire serpent (Kundalini) energy and create a direct channel for Reiki flow.",
    mantras: ["RA", "KU"],
    notes:
      "Drawn as a lightning bolt or zigzag line. Not used during treatments, only during attunement ceremonies.",
  },
  {
    id: "shanti",
    name: "Shanti",
    nameJa: "禅息",
    meaning: "The Peace Symbol — 'Peace, peace, peace'",
    purpose:
      "Brings deep peace and tranquility. Used to seal sessions, calm the environment, and support restful states.",
    mantras: ["SHAN", "TI"],
    notes:
      "Often placed at the end of a healing session. Can be used on pillows or sleeping areas for restful sleep.",
  },
  {
    id: "karuna",
    name: "Karuna",
    nameJa: "救荒",
    meaning: "The Compassion Symbol — 'Action of compassion'",
    purpose:
      "A newer symbol in the Reiki lineage (introduced by William Rand). Invokes compassionate action to relieve suffering, used for deep trauma and crisis intervention.",
    mantras: ["RA", "MA", "SA", "TA", "VA", "YA"],
    notes:
      "Part of the Karuna Reiki system. More action-oriented than Usui symbols; encourages the practitioner to take compassionate action in the world.",
  },
];

/**
 * Returns the complete list of standard Usui Shiki Ryoho Reiki symbols.
 */
export function getSymbols(): ReikiSymbol[] {
  return SYMBOLS;
}
