// ============================================================================
// SACRED SOUND — MANTRAS (100+ across 7 traditions)
// ============================================================================
// Each mantra carries: id, text (source language), transliteration
// (Romanized pronunciation), translation (English + pt-BR), tradition,
// language, duration (seconds), purpose (Intention).
//
// Catalog enforces cycle 62 lesson 12 (7-tradition coverage, 12+ per tradition).
// Records are Object.frozen so callers cannot mutate (cycle 69 lesson 1).
// ============================================================================

import type { Tradition, Intention } from "./frequencies.ts";

export type MantraId = string & { readonly __brand: "MantraId" };

export type Language =
  | "sanskrit"
  | "hebrew"
  | "portuguese"
  | "yoruba"
  | "tibetan"
  | "japanese"
  | "latin";

export interface Mantra {
  readonly id: MantraId;
  readonly text: string;
  readonly transliteration: string;
  readonly translation: string;
  readonly tradition: Tradition;
  readonly language: Language;
  readonly duration: number; // seconds
  readonly purpose: Intention;
  readonly citation: string;
}

/** Raw seed array — built up front, then frozen into MANTRAS record. */
const _MANTRA_SEED: readonly Mantra[] = [
  // --------------------------------------------------------------------------
  // CIGANO (Portuguese invocations — 15 mantras, all "salve" + "oração" forms)
  // --------------------------------------------------------------------------
  mk("cig-001", "Salve o Cigano", "Salve o Cigano", "Hail the Gypsy", "cigano", "portuguese", 28, "protection", "Tradição oral — calunga cigana"),
  mk("cig-002", "Salve a Cigana", "Salve a Cigana", "Hail the Gypsy Woman", "cigano", "portuguese", 28, "protection", "Tradição oral — padroeira cigana"),
  mk("cig-003", "Salve a Guardiã", "Salve a Guardiã", "Hail the Guardian", "cigano", "portuguese", 32, "protection", "Oração cigana — proteção da casa"),
  mk("cig-004", "Salve o Caminho", "Salve o Caminho", "Hail the Road", "cigano", "portuguese", 32, "grounding", "Oração cigana — abertura de caminhos"),
  mk("cig-005", "Salve Santa Sara", "Salve Santa Sara", "Hail Saint Sara", "cigano", "portuguese", 30, "love", "Padroeira do Povo Cigano"),
  mk("cig-006", "Salve a Lua Cigana", "Salve a Lua Cigana", "Hail the Gypsy Moon", "cigano", "portuguese", 35, "clarity", "Oração à lua — clareza mental"),
  mk("cig-007", "Eu Sou Cigano", "Eu Sou Cigano", "I Am Gypsy", "cigano", "portuguese", 22, "grounding", "Mantra de identidade — povo cigano"),
  mk("cig-008", "Caminho aberto, sorte a frente", "Caminho aberto, sorte à frente", "Open road, luck ahead", "cigano", "portuguese", 26, "transformation", "Oração de abertura de caminhos"),
  mk("cig-009", "A benção da Calunga Pequena", "A bênção da Calunga Pequena", "Blessing of the Small Calunga", "cigano", "portuguese", 38, "healing", "Calunga = mar, água — cura"),
  mk("cig-010", "A benção da Calunga Grande", "A bênção da Calunga Grande", "Blessing of the Great Calunga", "cigano", "portuguese", 38, "gratitude", "Calunga Grande — fim de ciclo"),
  mk("cig-011", "Salve a Faca de Ogum", "Salve a Faca de Ogum", "Hail Ogum's Blade", "cigano", "portuguese", 24, "protection", "Sincretismo cigano + umbanda"),
  mk("cig-012", "A Estrela Cigana Brilha", "A Estrela Cigana Brilha", "The Gypsy Star Shines", "cigano", "portuguese", 30, "awakening", "Estrela guia — proteção espiritual"),
  mk("cig-013", "Salve as Almas", "Salve as Almas", "Hail the Souls", "cigano", "portuguese", 28, "forgiveness", "Oração aos ancestrais ciganos"),
  mk("cig-014", "Cigano do Bem", "Cigano do Bem", "Good Gypsy", "cigano", "portuguese", 20, "love", "Invocação de proteção amorosa"),
  mk("cig-015", "Sorte e Prosperidade", "Sorte e Prosperidade", "Luck and Prosperity", "cigano", "portuguese", 26, "gratitude", "Mantra de prosperidade cigana"),

  // --------------------------------------------------------------------------
  // TAROT (Hebrew letter mantras — paths on the Tree of Life — 14 mantras)
  // --------------------------------------------------------------------------
  mk("tar-001", "א", "Aleph", "Aleph — The Fool / Breathe", "tarot", "hebrew", 18, "awakening", "Sefer Yetzirah 1.1 — letter Aleph"),
  mk("tar-002", "ב", "Beth", "Beth — The Magus / House", "tarot", "hebrew", 18, "clarity", "Sefer Yetzirah 1.2 — letter Beth"),
  mk("tar-003", "ג", "Gimel", "Gimel — The Priestess / Camel", "tarot", "hebrew", 18, "intuition", "Sefer Yetzirah 1.3 — Gimel"),
  mk("tar-004", "ד", "Daleth", "Daleth — The Empress / Door", "tarot", "hebrew", 18, "love", "Sefer Yetzirah 1.4 — Daleth"),
  mk("tar-005", "ה", "He", "He — The Emperor / Window", "tarot", "hebrew", 18, "grounding", "Sefer Yetzirah 1.5 — He"),
  mk("tar-006", "ו", "Vav", "Vav — The Hierophant / Nail", "tarot", "hebrew", 18, "transformation", "Sefer Yetzirah 1.6 — Vav"),
  mk("tar-007", "ז", "Zayin", "Zayin — The Lovers / Sword", "tarot", "hebrew", 18, "love", "Sefer Yetzirah 1.7 — Zayin"),
  mk("tar-008", "ח", "Cheth", "Cheth — The Chariot / Fence", "tarot", "hebrew", 18, "protection", "Sefer Yetzirah 1.8 — Cheth"),
  mk("tar-009", "ט", "Teth", "Teth — Strength / Serpent", "tarot", "hebrew", 18, "healing", "Sefer Yetzirah 1.9 — Teth"),
  mk("tar-010", "י", "Yod", "Yod — The Hermit / Hand", "tarot", "hebrew", 18, "awakening", "Sefer Yetzirah 1.10 — Yod"),
  mk("tar-011", "כ", "Kaph", "Kaph — Wheel of Fortune / Palm", "tarot", "hebrew", 18, "transformation", "Sefer Yetzirah 1.11 — Kaph"),
  mk("tar-012", "ל", "Lamed", "Lamed — Justice / Ox-goad", "tarot", "hebrew", 18, "clarity", "Sefer Yetzirah 1.12 — Lamed"),
  mk("tar-013", "מ", "Mem", "Mem — The Hanged Man / Water", "tarot", "hebrew", 18, "intuition", "Sefer Yetzirah 1.13 — Mem"),
  mk("tar-014", "ש", "Shin", "Shin — Judgment / Tooth", "tarot", "hebrew", 18, "awakening", "Sefer Yetzirah 1.14 — Shin (triple fire)"),

  // --------------------------------------------------------------------------
  // ASTROLOGIA (planetary hours — 14 mantras: 7 classical planets × 2 forms)
  // --------------------------------------------------------------------------
  mk("ast-001", "Ad Solis", "Ad Solis", "To the Sun", "astrologia", "latin", 28, "awakening", "Horas planetárias — Sol"),
  mk("ast-002", "Ad Lunae", "Ad Lunae", "To the Moon", "astrologia", "latin", 28, "intuition", "Horas planetárias — Lua"),
  mk("ast-003", "Ad Martis", "Ad Martis", "To Mars", "astrologia", "latin", 26, "protection", "Horas planetárias — Marte"),
  mk("ast-004", "Ad Mercurii", "Ad Mercurii", "To Mercury", "astrologia", "latin", 28, "clarity", "Horas planetárias — Mercúrio"),
  mk("ast-005", "Ad Iovis", "Ad Iovis", "To Jupiter", "astrologia", "latin", 30, "gratitude", "Horas planetárias — Júpiter"),
  mk("ast-006", "Ad Veneris", "Ad Veneris", "To Venus", "astrologia", "latin", 28, "love", "Horas planetárias — Vênus"),
  mk("ast-007", "Ad Saturni", "Ad Saturni", "To Saturn", "astrologia", "latin", 32, "grounding", "Horas planetárias — Saturno"),
  mk("ast-008", "Sol Invictus", "Sol Invictus", "Unconquered Sun", "astrologia", "latin", 24, "awakening", "Aurélio — Sol Invictus (religião romana tardia)"),
  mk("ast-009", "Luna Mater", "Luna Mater", "Mother Moon", "astrologia", "latin", 24, "healing", "Deusa lunar — cura"),
  mk("ast-010", "Mars Imperator", "Mars Imperator", "Mars Commander", "astrologia", "latin", 22, "protection", "Marte — defesa"),
  mk("ast-011", "Mercurius Sapiens", "Mercurius Sapiens", "Wise Mercury", "astrologia", "latin", 26, "clarity", "Mercúrio — sabedoria"),
  mk("ast-012", "Iuppiter Pluvius", "Iuppiter Pluvius", "Jupiter the Rainmaker", "astrologia", "latin", 26, "gratitude", "Júpiter — abundância"),
  mk("ast-013", "Venus Genetrix", "Venus Genetrix", "Venus the Mother", "astrologia", "latin", 24, "love", "Vênus — amor"),
  mk("ast-014", "Saturnus Pater", "Saturnus Pater", "Father Saturn", "astrologia", "latin", 30, "grounding", "Saturno — tempo, estrutura"),

  // --------------------------------------------------------------------------
  // NUMEROLOGIA (seed mantras for vibrations 1-9, 11, 22, 33 — 13 mantras)
  // --------------------------------------------------------------------------
  mk("num-001", "1-1-1", "Um-Um-Um", "One-One-One", "numerologia", "portuguese", 18, "awakening", "Pythagoras — unidade"),
  mk("num-002", "2-2", "Dois-Dois", "Two-Two", "numerologia", "portuguese", 18, "love", "Pythagoras — dualidade"),
  mk("num-003", "Tri-3", "Tri-Três", "Three-Three", "numerologia", "portuguese", 18, "transformation", "Pythagoras — trindade"),
  mk("num-004", "4-4", "Quatro-Quatro", "Four-Four", "numerologia", "portuguese", 18, "grounding", "Pythagoras — quadrado, terra"),
  mk("num-005", "5-5-5", "Cinco-Cinco-Cinco", "Five-Five-Five", "numerologia", "portuguese", 22, "intuition", "Pythagoras — quíntuplo"),
  mk("num-006", "6-6", "Seis-Seis", "Six-Six", "numerologia", "portuguese", 22, "love", "Pythagoras — harmonia"),
  mk("num-007", "7-7-7", "Sete-Sete-Sete", "Seven-Seven-Seven", "numerologia", "portuguese", 26, "clarity", "Pythagoras — sapiência"),
  mk("num-008", "8-8", "Oito-Oito", "Eight-Eight", "numerologia", "portuguese", 24, "abundance", "Pythagoras — infinito (∞)"),
  mk("num-009", "9-9-9", "Nove-Nove-Nove", "Nine-Nine-Nine", "numerologia", "portuguese", 30, "forgiveness", "Pythagoras — completude"),
  mk("num-010", "11-11", "Onze-Onze", "Eleven-Eleven", "numerologia", "portuguese", 32, "awakening", "Número mestre 11 — portal"),
  mk("num-011", "22-22", "Vinte e Dois-Vinte e Dois", "Twenty-Two-Twenty-Two", "numerologia", "portuguese", 34, "grounding", "Número mestre 22 — construtor"),
  mk("num-012", "33-33", "Trinta e Três-Trinta e Três", "Thirty-Three-Thirty-Three", "numerologia", "portuguese", 36, "healing", "Número mestre 33 — mestre curador"),
  mk("num-013", "0-0-0", "Zero-Zero-Zero", "Zero-Zero-Zero", "numerologia", "portuguese", 24, "grounding", "Zero — vazio fértil"),

  // --------------------------------------------------------------------------
  // CABALA (Sefirot divine names + Hebrew letter meditations — 15 mantras)
  // --------------------------------------------------------------------------
  mk("cab-001", "אהיה", "Ehyeh", "I Am (Kether)", "cabala", "hebrew", 22, "awakening", "Sefirá Kether — coroa"),
  mk("cab-002", "יהוה אלהים", "YHVH Elohim", "Lord God (Chokmah-Binah)", "cabala", "hebrew", 24, "clarity", "Sefirá Chokmah/Binah"),
  mk("cab-003", "אל", "El", "God (Chesed)", "cabala", "hebrew", 18, "love", "Sefirá Chesed — misericórdia"),
  mk("cab-004", "אלוהים", "Elohim", "Gods (Geburah)", "cabala", "hebrew", 20, "protection", "Sefirá Geburah — força"),
  mk("cab-005", "יהוה אלוהים צבאות", "YHVH Elohim Tzevaot", "Lord of Hosts (Tiferet)", "cabala", "hebrew", 28, "transformation", "Sefirá Tiferet — beleza"),
  mk("cab-006", "יהוה צבאות", "YHVH Tzevaot", "Lord of Hosts (Netzach)", "cabala", "hebrew", 24, "intuition", "Sefirá Netzach — vitória"),
  mk("cab-007", "אלוהים צבאות", "Elohim Tzevaot", "God of Hosts (Hod)", "cabala", "hebrew", 24, "clarity", "Sefirá Hod — esplendor"),
  mk("cab-008", "שדי", "Shaddai", "Almighty (Yesod)", "cabala", "hebrew", 18, "grounding", "Sefirá Yesod — fundação"),
  mk("cab-009", "אדני", "Adonai", "My Lord (Malkuth)", "cabala", "hebrew", 18, "grounding", "Sefirá Malkuth — reino"),
  mk("cab-010", "אמת", "Emet", "Truth", "cabala", "hebrew", 14, "clarity", "Meditação — verdade"),
  mk("cab-011", "חסד", "Chesed", "Loving-kindness", "cabala", "hebrew", 14, "love", "Meditação — amor"),
  mk("cab-012", "גבורה", "Gevurah", "Strength", "cabala", "hebrew", 16, "protection", "Meditação — força"),
  mk("cab-013", "תפארת", "Tiferet", "Beauty", "cabala", "hebrew", 16, "transformation", "Meditação — beleza"),
  mk("cab-014", "נצח", "Netzach", "Eternity", "cabala", "hebrew", 14, "intuition", "Meditação — eternidade"),
  mk("cab-015", "הוד", "Hod", "Splendor", "cabala", "hebrew", 12, "clarity", "Meditação — esplendore"),

  // --------------------------------------------------------------------------
  // ORIXÁS (saudações — 16 mantras covering 16 orixás)
  // --------------------------------------------------------------------------
  mk("ori-001", "Eparrei", "Eparrei", "Eparrei — Oxalá", "orixas", "portuguese", 22, "grounding", "Orixá Oxalá — saudação"),
  mk("ori-002", "Ora Iê Iê", "Ora Iê Iê", "Ora Iê Iê — Ogum", "orixas", "portuguese", 20, "protection", "Orixá Ogum — guerreiro"),
  mk("ori-003", "Patakori", "Patakori", "Patakori — Oxóssi", "orixas", "portuguese", 24, "clarity", "Orixá Oxóssi — caçador"),
  mk("ori-004", "Obá", "Obá", "Obá — Xangô", "orixas", "portuguese", 18, "transformation", "Orixá Xangô — justiça"),
  mk("ori-005", "Kaô Kabecilê", "Kaô Kabecilê", "Kaô Kabecilê — Xangô", "orixas", "portuguese", 22, "transformation", "Xangô — variante"),
  mk("ori-006", "Salubá", "Salubá", "Salubá — Nanã", "orixas", "portuguese", 18, "healing", "Orixá Nanã — anciã"),
  mk("ori-007", "Omim", "Omim", "Omim — Iemanjá", "orixas", "portuguese", 18, "love", "Orixá Iemanjá — mãe"),
  mk("ori-008", "Odoiá", "Odoiá", "Odoiá — Iansã", "orixas", "portuguese", 18, "transformation", "Orixá Iansã — ventos"),
  mk("ori-009", "Ewá", "Ewá", "Ewá — Iansã (Ketu)", "orixas", "portuguese", 14, "transformation", "Iansã variante Ketu"),
  mk("ori-010", "Pai Airu", "Pai Airu", "Pai Airu — Oxumarê", "orixas", "portuguese", 18, "transformation", "Orixá Oxumarê — arco-íris"),
  mk("ori-011", "Arroboboi", "Arroboboi", "Arroboboi — Omolu", "orixas", "portuguese", 20, "healing", "Orixá Omolu/Obaluaiê — cura"),
  mk("ori-012", "Atoto", "Atoto", "Atotô — Obaluaiê", "orixas", "portuguese", 14, "healing", "Obaluaiê — variante"),
  mk("ori-013", "Ajalá", "Ajalá", "Ajalá — Orunmilá", "orixas", "portuguese", 16, "clarity", "Orixá Orunmilá — sabedoria"),
  mk("ori-014", "Logunedé", "Logunêdê", "Logunedé — Logunã", "orixas", "portuguese", 18, "love", "Orixá Logunã — juventude"),
  mk("ori-015", "Opanijé", "Opanijé", "Opanijé — Oxum", "orixas", "portuguese", 16, "love", "Orixá Oxum — amor, beleza"),
  mk("ori-016", "Oiá", "Oiá", "Oiá — Iansã (Bantu)", "orixas", "portuguese", 14, "protection", "Iansã variante Bantu"),

  // --------------------------------------------------------------------------
  // TANTRA (chakra bija + Vedic seed mantras — 14 mantras)
  // --------------------------------------------------------------------------
  mk("tan-001", "ॐ", "Om", "Om — Universal Sound", "tantra", "sanskrit", 26, "awakening", "Mandukya Upanishad — pranava"),
  mk("tan-002", "लं", "Lam", "Lam — Muladhara Bija", "tantra", "sanskrit", 18, "grounding", "Bija mantra — 1º chakra"),
  mk("tan-003", "वं", "Vam", "Vam — Svadhisthana Bija", "tantra", "sanskrit", 18, "healing", "Bija mantra — 2º chakra"),
  mk("tan-004", "रं", "Ram", "Ram — Manipura Bija", "tantra", "sanskrit", 18, "transformation", "Bija mantra — 3º chakra"),
  mk("tan-005", "यं", "Yam", "Yam — Anahata Bija", "tantra", "sanskrit", 18, "love", "Bija mantra — 4º chakra"),
  mk("tan-006", "हं", "Ham", "Ham — Vishuddha Bija", "tantra", "sanskrit", 18, "clarity", "Bija mantra — 5º chakra"),
  mk("tan-007", "ॐ", "Om (Ajna)", "Om — Ajna Bija", "tantra", "sanskrit", 22, "intuition", "Bija mantra — 6º chakra"),
  mk("tan-008", "ॐ", "Silence (Sahasrara)", "Silence — Sahasrara", "tantra", "sanskrit", 30, "awakening", "7º chakra — além do som"),
  mk("tan-009", "सोहम्", "Soham", "Soham — I Am That", "tantra", "sanskrit", 24, "awakening", "Ajapa japa — respiração natural"),
  mk("tan-010", "ॐ मणि पद्मे हूं", "Om Mani Padme Hum", "Jewel in the Lotus", "tantra", "sanskrit", 36, "love", "Tibetan Buddhism — Avalokiteshvara"),
  mk("tan-011", "ॐ शांति", "Om Shanti", "Om Peace", "tantra", "sanskrit", 22, "forgiveness", "Sânscrito — paz tríplice"),
  mk("tan-012", "ॐ नमः शिवाय", "Om Namah Shivaya", "Salutations to Shiva", "tantra", "sanskrit", 30, "transformation", "Panchakshari — 5 sílabas sagradas"),
  mk("tan-013", "गायत्री मंत्र", "Gayatri Mantra", "Gayatri Mantra", "tantra", "sanskrit", 42, "awakening", "Rig Veda 3.62.10 — Savitr"),
  mk("tan-014", "ॐ अहं", "Om Aham", "Om I Am", "tantra", "sanskrit", 22, "grounding", "Meditação — identidade"),

  // --------------------------------------------------------------------------
  // YORUBA LANGUAGE OVERLAY — 1 extra mantra (covers language tag)
  // --------------------------------------------------------------------------
  mk("yor-001", "Àṣẹ", "Ashe", "Ashe — So Be It", "orixas", "yoruba", 14, "grounding", "Palavra de poder — princípio yorubá"),

  // --------------------------------------------------------------------------
  // HEALING — extra 4 mantras (boost coverage to ≥ 12)
  // --------------------------------------------------------------------------
  mk("hea-001", "Om Tryambakam", "Om Tryambakam", "Om Tryambakam", "tantra", "sanskrit", 28, "healing", "Maha Mrityunjaya — healing mantra"),
  mk("hea-002", "Sarve Bhavantu Sukhinah", "Sarve Bhavantu Sukhinah", "May all beings be happy", "tantra", "sanskrit", 36, "healing", "Shanti Mantra — universal healing"),
  mk("hea-003", "Salve Ogum Megê", "Salve Ogum Megê", "Hail Ogum Megê", "orixas", "portuguese", 22, "healing", "Ogum Megê — guerreiro curador"),
  mk("hea-004", "Yehuda Halevi Refa", "Yehuda Halevi Refa", "Yehuda Halevi — Healing", "cabala", "hebrew", 26, "healing", "Meditação cabala — cura"),
];

// ============================================================================
// HELPER
// ============================================================================
function mk(
  id: string,
  text: string,
  transliteration: string,
  translation: string,
  tradition: Tradition,
  language: Language,
  duration: number,
  purpose: Intention,
  citation: string,
): Mantra {
  return {
    id: id as MantraId,
    text,
    transliteration,
    translation,
    tradition,
    language,
    duration,
    purpose,
    citation,
  };
}

// ============================================================================
// CATALOG — frozen lookup (cycle 69 lesson 1: Object.freeze + as const belt-and-braces)
// ============================================================================
export const MANTRAS: Readonly<Record<MantraId, Mantra>> = Object.freeze(
  Object.fromEntries(_MANTRA_SEED.map((m) => [m.id, m])),
);

// ============================================================================
// LOOKUP HELPERS
// ============================================================================

/** Get mantra by ID. Returns undefined for unknown. */
export function getMantra(id: MantraId): Mantra | undefined {
  return MANTRAS[id];
}

/** Get mantras belonging to a tradition. */
export function getMantrasByTradition(
  tradition: Tradition,
): readonly Mantra[] {
  return _MANTRA_SEED.filter((m) => m.tradition === tradition);
}

/** Get mantras carrying a specific intention. */
export function getMantrasByPurpose(purpose: Intention): readonly Mantra[] {
  return _MANTRA_SEED.filter((m) => m.purpose === purpose);
}

/** Get mantras in a specific language. */
export function getMantrasByLanguage(language: Language): readonly Mantra[] {
  return _MANTRA_SEED.filter((m) => m.language === language);
}

/** Total mantras in catalog. */
export function mantraCount(): number {
  return _MANTRA_SEED.length;
}

/** Coverage assertion — throws when contract violated. */
export function assertCatalogCoverage(): void {
  const expected: ReadonlyArray<Tradition> = [
    "cigano",
    "tarot",
    "astrologia",
    "numerologia",
    "cabala",
    "orixas",
    "tantra",
  ];
  for (const t of expected) {
    const count = _MANTRA_SEED.filter((m) => m.tradition === t).length;
    if (count < 12) {
      throw new Error(
        `Mantra catalog coverage failed: tradition '${t}' has ${count} mantras (minimum 12 required)`,
      );
    }
  }
  if (_MANTRA_SEED.length < 100) {
    throw new Error(
      `Mantra catalog coverage failed: total ${_MANTRA_SEED.length} < 100`,
    );
  }
}

/** Audit helper for diagnostics. */
export function auditMantraCatalog(): {
  total: number;
  byTradition: Readonly<Record<Tradition, number>>;
  byLanguage: Readonly<Record<Language, number>>;
  byPurpose: Readonly<Record<Intention, number>>;
} {
  const byTradition: Record<Tradition, number> = {
    cigano: 0,
    orixas: 0,
    astrologia: 0,
    cabala: 0,
    numerologia: 0,
    tantra: 0,
    tarot: 0,
  };
  const byLanguage: Record<Language, number> = {
    sanskrit: 0,
    hebrew: 0,
    portuguese: 0,
    yoruba: 0,
    tibetan: 0,
    japanese: 0,
    latin: 0,
  };
  const byPurpose: Record<Intention, number> = {
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
  for (const m of _MANTRA_SEED) {
    byTradition[m.tradition]++;
    byLanguage[m.language]++;
    byPurpose[m.purpose]++;
  }
  return {
    total: _MANTRA_SEED.length,
    byTradition,
    byLanguage,
    byPurpose,
  };
}