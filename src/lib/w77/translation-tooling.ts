/**
 * W77-C Translation Tooling Engine (cycle 77, 06:00 UTC)
 * ---------------------------------------------------------------------------
 * Sacred term dictionary + 3-mode translation pipeline (preserve / translate /
 * transliterate) with audit trail + canonical-JSON SHA-256 cache keys.
 *
 * Public API:
 *   - translateText(input: TranslateInput): TranslateResult
 *   - lookupTerm(term: SacredTermId | string, targetLang: LangCode): TranslationResult
 *   - registerCustomTranslation(term, lang, translation): void
 *   - getSacredDictionary(lang: LangCode): readonly SacredTermEntry[]
 *   - validateTranslation(text, sourceLang, targetLang): ValidationResult
 *   - exportAudit(): readonly TranslationRecord[]
 *   - hashCacheKey(input: TranslateInput): string
 *
 * Traditions (7): candomble | umbanda | ifa | cabala | astrologia | tantra | cigano
 * Languages (3): pt-BR (default) | en | es
 *
 * Cycle 77 design choices (reusable lessons):
 *   1. SHA-256 over canonical-JSON (cycle 67 lesson) — deterministic cache keys.
 *   2. Idempotent translation — re-translating into the same target lang is a no-op.
 *   3. Three modes per (term, lang) pair, NOT a global mode — encoded directly
 *      into each dictionary entry so `lookupTerm` is a single Map.get.
 *   4. Audit log is `ReadonlyArray<TranslationRecord>` — `Object.freeze` both
 *      the array slice AND every record (cycle 75 lesson #6).
 *   5. Branded types via `string & { readonly __brand: 'X' }` (cycle 73+) to
 *      prevent accidental string mixing between termIds, langs, traditions.
 *
 * IMPORTANT — sacred care:
 *   This engine stores and translates real sacred terms across Candomblé,
 *   Umbanda, Ifá, Cabala, Astrologia, Tantra, and Cigano (Tarot Cigano / Lenormand)
 *   traditions. Diacritics are PRESERVED in preserve and translate modes;
 *   transliterate mode strips them per the source tradition's needs.
 *
 * The dictionary never invents sacred facts — terms are drawn from the same
 * 30-entries-per-tradition canon used by the w71 i18n multilang engine and the
 * project's IDEIA.md source-of-truth glossary.
 */

// ===========================================================================
// 1. Brand types & aliases
// ===========================================================================

declare const __sacredBrand: unique symbol;
declare const __langBrand: unique symbol;
declare const __traditionBrand: unique symbol;
declare const __termIdBrand: unique symbol;

export type LangCode = 'pt-BR' | 'en' | 'es';
export type Tradition =
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia'
  | 'tantra'
  | 'cigano';
export type TranslationMode = 'preserve' | 'translate' | 'transliterate';

export type SacredTermId = string & { readonly [__termIdBrand]: true };
export type Lang = LangCode & { readonly [__langBrand]: true };
export type Trad = Tradition & { readonly [__traditionBrand]: true };

/** Factory: SacredTermId — only accepts non-empty, trimmed strings. */
export function sacredTermId(raw: string): SacredTermId {
  if (typeof raw !== 'string') throw new TypeError('sacredTermId: expected string');
  const trimmed = raw.trim();
  if (trimmed.length === 0) throw new RangeError('sacredTermId: empty');
  if (trimmed.length > 120) throw new RangeError('sacredTermId: too long');
  return trimmed as SacredTermId;
}

/** Factory: Lang — only accepts the 3 supported languages. */
export function langCode(raw: string): Lang {
  if (raw === 'pt-BR' || raw === 'en' || raw === 'es') return raw as Lang;
  throw new RangeError(`langCode: unsupported lang "${raw}"`);
}

/** Factory: Tradition — only accepts the 7 supported traditions. */
export function traditionCode(raw: string): Trad {
  const valid: readonly string[] = [
    'candomble',
    'umbanda',
    'ifa',
    'cabala',
    'astrologia',
    'tantra',
    'cigano',
  ];
  if (valid.indexOf(raw) >= 0) return raw as Trad;
  throw new RangeError(`traditionCode: unsupported tradition "${raw}"`);
}

/** Default language when none specified. */
export const DEFAULT_LANG: LangCode = 'pt-BR';
const SUPPORTED_LANGS: readonly LangCode[] = Object.freeze(['pt-BR', 'en', 'es']);
const SUPPORTED_TRADITIONS: readonly Tradition[] = Object.freeze([
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
  'cigano',
]);

// ===========================================================================
// 2. Core type definitions
// ===========================================================================

/** A single dictionary entry: how to surface one canonical term in one lang. */
export interface SacredTermEntry {
  readonly termId: SacredTermId;
  readonly term: string;           // surface form in this lang
  readonly lang: LangCode;
  readonly tradition: Tradition;
  readonly mode: TranslationMode;
  readonly aliases: readonly string[];  // alternative writings (e.g. without diacritics)
  readonly notes: string;
}

/** Compact shape used inside the dictionary builder. */
interface RawTerm {
  readonly canonical: SacredTermId;   // canonical PT-BR form
  readonly tradition: Tradition;
  readonly modeInPt: TranslationMode; // how to treat when lang=pt-BR
  readonly en: string | null;         // null = preserve original surface
  readonly modeInEn: TranslationMode;
  readonly es: string | null;
  readonly modeInEs: TranslationMode;
  readonly aliases: readonly string[];
  readonly notes: string;
}

export interface TranslateInput {
  readonly text: string;
  readonly sourceLang: LangCode;
  readonly targetLang: LangCode;
  /** When true, scan term boundaries with Unicode lookaround (default true). */
  readonly unicodeAware?: boolean;
  /** Honor pre-existing cache; defaults to true. */
  readonly useCache?: boolean;
}

export interface TranslateResult {
  readonly output: string;
  readonly cacheKey: string;
  readonly hits: readonly TranslationHit[];
  readonly sourceLang: LangCode;
  readonly targetLang: LangCode;
  readonly cached: boolean;
}

export interface TranslationResult {
  readonly found: boolean;
  readonly entry: SacredTermEntry | null;
  readonly canonical: SacredTermId | null;
  readonly mode: TranslationMode | null;
}

export interface TranslationHit {
  readonly termId: SacredTermId;
  readonly canonical: SacredTermId;
  readonly sourceSurface: string;
  readonly targetSurface: string;
  readonly mode: TranslationMode;
  readonly tradition: Tradition;
}

export interface TranslationRecord {
  readonly cacheKey: string;
  readonly sourceLang: LangCode;
  readonly targetLang: LangCode;
  readonly inputText: string;
  readonly outputText: string;
  readonly hitsCount: number;
  readonly at: string; // ISO-8601
  readonly cacheHit: boolean;
}

export interface ValidationIssue {
  readonly severity: 'info' | 'warn' | 'error';
  readonly code: string;
  readonly message: string;
  readonly surface?: string;
}

export interface ValidationResult {
  readonly ok: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly untranslatedSacred: readonly string[];
}

// ===========================================================================
// 3. Sacred Term Dictionary — 30+ terms per tradition × 7 traditions × 3 langs
// ===========================================================================

/**
 * We seed the dictionary directly with hand-curated, tradition-accurate terms.
 * For each canonical term we store PT-BR / EN / ES surfaces and the mode that
 * applies for that surface.
 *
 * Mode semantics:
 *   - 'preserve'   → surface is identical to the original (e.g. "Oxalá" en/pt-BR/es)
 *   - 'translate'  → surface is a calibrated equivalent in the target language
 *   - 'transliterate' → surface is the phonetic Latin transcription (e.g. "Ifa")
 */
const RAW_TERMS: ReadonlyArray<RawTerm> = Object.freeze([
  // ------------------------------ CANDOMBLÉ -----------------------------------
  { canonical: sacredTermId('Oxalá'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Oxalá', modeInEn: 'preserve',
    es: 'Oxalá', modeInEs: 'preserve',
    aliases: ['Obatalá'], notes: 'Orixá da criação; pai de todos os Orixás.' },
  { canonical: sacredTermId('Iemanjá'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Yemanjá', modeInEn: 'transliterate',
    es: 'Yemayá', modeInEs: 'transliterate',
    aliases: ['Janaina'], notes: 'Orixá dos mares e mãe dos Orixás.' },
  { canonical: sacredTermId('Xangô'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Xangô', modeInEn: 'preserve',
    es: 'Shangó', modeInEs: 'transliterate',
    aliases: ['Xango'], notes: 'Orixá da justiça, dos raios e do trovão.' },
  { canonical: sacredTermId('Ogum'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Ogum', modeInEn: 'preserve',
    es: 'Ogún', modeInEs: 'preserve',
    aliases: ['Ogún'], notes: 'Orixá do ferro, da guerra e do trabalho.' },
  { canonical: sacredTermId('Oxum'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Oxum', modeInEn: 'preserve',
    es: 'Oxúm', modeInEs: 'preserve',
    aliases: ['Ochun'], notes: 'Orixá das águas doces, do amor e da fertilidade.' },
  { canonical: sacredTermId('Iansã'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Iansã', modeInEn: 'preserve',
    es: 'Iansã', modeInEs: 'preserve',
    aliases: ['Oiá', 'Iansa'], notes: 'Orixá dos ventos e das tempestades.' },
  { canonical: sacredTermId('Exu'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Exu', modeInEn: 'preserve',
    es: 'Exú', modeInEs: 'preserve',
    aliases: ['Eshu', 'Exú'], notes: 'Orixá mensageiro, guardião dos caminhos.' },
  { canonical: sacredTermId('Nanã'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Nanã', modeInEn: 'preserve',
    es: 'Nanã', modeInEs: 'preserve',
    aliases: ['Nana', 'Nanan'], notes: 'Orixá da ancestralidade e da lama primordial.' },
  { canonical: sacredTermId('Omolu'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Omolu', modeInEn: 'preserve',
    es: 'Omolu', modeInEs: 'preserve',
    aliases: ['Obaluaye'], notes: 'Orixá da cura e das doenças da pele.' },
  { canonical: sacredTermId('Ossãe'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Ossãe', modeInEn: 'preserve',
    es: 'Ossain', modeInEs: 'transliterate',
    aliases: ['Ossain'], notes: 'Orixá das folhas e da cura herbal.' },
  { canonical: sacredTermId('Logunedé'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Logunedé', modeInEn: 'preserve',
    es: 'Logun Edé', modeInEs: 'preserve',
    aliases: ['Logun-Edé'], notes: 'Orixá da juventude, filho de Oxum e Oxalá.' },
  { canonical: sacredTermId('Ewá'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Ewá', modeInEn: 'preserve',
    es: 'Ewá', modeInEs: 'preserve',
    aliases: [], notes: 'Orixá das coisas não criadas e das fontes.' },
  { canonical: sacredTermId('Oxumaré'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Oxumaré', modeInEn: 'preserve',
    es: 'Oxumaré', modeInEs: 'preserve',
    aliases: ['Oxumare'], notes: 'Orixá do arco-íris e da prosperidade.' },
  { canonical: sacredTermId('Obá'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Obá', modeInEn: 'preserve',
    es: 'Obá', modeInEs: 'preserve',
    aliases: [], notes: 'Orixá guerreira, primeira esposa de Xangô.' },
  { canonical: sacredTermId('Iroko'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Iroko', modeInEn: 'preserve',
    es: 'Iroko', modeInEs: 'preserve',
    aliases: [], notes: 'Árvore sagrada e entidade do tronco.' },
  { canonical: sacredTermId('Egun'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Egun', modeInEn: 'preserve',
    es: 'Egun', modeInEs: 'preserve',
    aliases: ['Egum'], notes: 'Espíritos dos ancestrais.' },
  { canonical: sacredTermId('Bori'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Bori', modeInEn: 'preserve',
    es: 'Bori', modeInEs: 'preserve',
    aliases: [], notes: 'Ritual de sacralização da cabeça.' },
  { canonical: sacredTermId('Ebó'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Ebó', modeInEn: 'preserve',
    es: 'Ebó', modeInEs: 'preserve',
    aliases: [], notes: 'Oferenda sacrificial de limpeza e equilíbrio.' },
  { canonical: sacredTermId('Axé'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Axé', modeInEn: 'preserve',
    es: '¡Ashé!', modeInEs: 'translate',
    aliases: ['Ashe', 'Ashé'], notes: 'Força vital que permeia tudo; saudação ritual.' },
  { canonical: sacredTermId('Queto'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Ketu', modeInEn: 'transliterate',
    es: 'Ketu', modeInEs: 'transliterate',
    aliases: ['Ketu'], notes: 'Nação Ketu; corte real dos Orixás.' },
  { canonical: sacredTermId('Jeje'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Jeje', modeInEn: 'preserve',
    es: 'Jeje', modeInEs: 'preserve',
    aliases: [], notes: 'Nação Jeje, das águas e da ancestralidade Mahi.' },
  { canonical: sacredTermId('Nagô'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Nagô', modeInEn: 'preserve',
    es: 'Nagô', modeInEs: 'preserve',
    aliases: ['Nago'], notes: 'Nação Nagô Iorubá.' },
  { canonical: sacredTermId('Orixá'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Orixá', modeInEn: 'preserve',
    es: 'Oricha', modeInEs: 'transliterate',
    aliases: ['Orisha', 'Oricha'], notes: 'Divindade / entidade espiritual do panteão Yorubá.' },
  { canonical: sacredTermId('Babalorixá'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Babalaorixá', modeInEn: 'transliterate',
    es: 'Babalao', modeInEs: 'transliterate',
    aliases: ['Babalaô'], notes: 'Sacerdote do Candomblé (homem).' },
  { canonical: sacredTermId('Yalorixá'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Yalorixá', modeInEn: 'preserve',
    es: 'Yalorixa', modeInEs: 'transliterate',
    aliases: ['Ialorixá'], notes: 'Sacerdotisa do Candomblé.' },
  { canonical: sacredTermId('Ponto de Cantiga'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Ritual chant', modeInEn: 'translate',
    es: 'Punto de canto', modeInEs: 'translate',
    aliases: [], notes: 'Cantiga sagrada que invoca o Orixá.' },
  { canonical: sacredTermId('Atabaque'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Atabaque', modeInEn: 'preserve',
    es: 'Atabaque', modeInEs: 'preserve',
    aliases: [], notes: 'Tambor sagrado do Candomblé.' },
  { canonical: sacredTermId('Erê'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Erê', modeInEn: 'preserve',
    es: 'Erê', modeInEs: 'preserve',
    aliases: ['Ere'], notes: 'Linha infantil; primeira manifestação do Orixá.' },
  { canonical: sacredTermId('Cabula'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Cabula', modeInEn: 'preserve',
    es: 'Cábula', modeInEs: 'transliterate',
    aliases: [], notes: 'Linha de Cabula, raízes bantu-ameríndias.' },
  { canonical: sacredTermId('Tambor de Mina'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Tambor de Mina', modeInEn: 'preserve',
    es: 'Tambor de Mina', modeInEs: 'preserve',
    aliases: [], notes: 'Casa de Mina Maranhão; Tradição Jeje.' },
  { canonical: sacredTermId('Sacerdotisa'), tradition: 'candomble', modeInPt: 'preserve',
    en: 'Priestess', modeInEn: 'translate',
    es: 'Sacerdotisa', modeInEs: 'preserve',
    aliases: ['Mãe-de-Santo'], notes: 'Mãe de Santo; liderança feminina do terreiro.' },

  // ------------------------------ UMBANDA ------------------------------------
  { canonical: sacredTermId('Caboclo'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Caboclo', modeInEn: 'preserve',
    es: 'Caboclo', modeInEs: 'preserve',
    aliases: [], notes: 'Linha dos caboclos; espíritos indígenas.' },
  { canonical: sacredTermId('Preto-Velho'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Preto-Velho', modeInEn: 'preserve',
    es: 'Preto Viejo', modeInEs: 'preserve',
    aliases: ['Preto Velho'], notes: 'Linha dos Pretos-Velhos; espíritos de ancestrais escravizados.' },
  { canonical: sacredTermId('Pomba-Gira'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Pomba-Gira', modeInEn: 'preserve',
    es: 'Pomba-Gira', modeInEs: 'preserve',
    aliases: ['Pomba Gira'], notes: 'Linha das Pomba-Giras; empoderamento feminino.' },
  { canonical: sacredTermId('Baiano'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Baiano', modeInEn: 'preserve',
    es: 'Bahiano', modeInEs: 'transliterate',
    aliases: [], notes: 'Caboclo Baiano; soldado da Umbanda.' },
  { canonical: sacredTermId('Cigano de Umbanda'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Gypsy of Umbanda', modeInEn: 'translate',
    es: 'Gitano de Umbanda', modeInEs: 'translate',
    aliases: [], notes: 'Cigano que trabalha na linha da Umbanda.' },
  { canonical: sacredTermId('Marinheiro'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Sailor', modeInEn: 'translate',
    es: 'Marinero', modeInEs: 'translate',
    aliases: [], notes: 'Linha do Mar; espírito de marinheiros.' },
  { canonical: sacredTermId('Boiadeiro'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Cattle-driver', modeInEn: 'translate',
    es: 'Vaquero', modeInEs: 'translate',
    aliases: [], notes: 'Caboclo Boiadeiro; sertão e matas.' },
  { canonical: sacredTermId('Exu Tranca-Ruas'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Exu Tranca-Ruas', modeInEn: 'preserve',
    es: 'Exu Tranca-Ruas', modeInEs: 'preserve',
    aliases: [], notes: 'Exu protetor; guardião dos caminhos.' },
  { canonical: sacredTermId('Mestre'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Master', modeInEn: 'translate',
    es: 'Maestro', modeInEs: 'translate',
    aliases: [], notes: 'Mestre da Corrente; dirigente do terreiro.' },
  { canonical: sacredTermId('Mestra'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Mistress', modeInEn: 'translate',
    es: 'Maestra', modeInEs: 'translate',
    aliases: [], notes: 'Mestra do terreiro.' },
  { canonical: sacredTermId('Cambono'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Cambono', modeInEn: 'preserve',
    es: 'Cambono', modeInEs: 'preserve',
    aliases: [], notes: 'Assistente do médium nas giras.' },
  { canonical: sacredTermId('Gira'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Gira', modeInEn: 'preserve',
    es: 'Gira', modeInEs: 'preserve',
    aliases: [], notes: 'Trabalho espiritual público da Umbanda.' },
  { canonical: sacredTermId('Ponto de Umbanda'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Umbanda chant', modeInEn: 'translate',
    es: 'Punto de Umbanda', modeInEs: 'translate',
    aliases: [], notes: 'Cantiga específica da Umbanda.' },
  { canonical: sacredTermId('Sete Linhas'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Seven Lines', modeInEn: 'translate',
    es: 'Siete Líneas', modeInEs: 'translate',
    aliases: [], notes: 'As sete linhas ou falanges da Umbanda.' },
  { canonical: sacredTermId('Ponto Riscado'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Point marked', modeInEn: 'translate',
    es: 'Punto Rayado', modeInEs: 'translate',
    aliases: [], notes: 'Defesa energética riscada no chão.' },
  { canonical: sacredTermId('Defumador'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Smoker', modeInEn: 'translate',
    es: 'Defumador', modeInEs: 'preserve',
    aliases: [], notes: 'Utensílio de defumação; limpeza energética.' },
  { canonical: sacredTermId('Defumação'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Smudging', modeInEn: 'translate',
    es: 'Defumación', modeInEs: 'translate',
    aliases: [], notes: 'Ritual de purificação com ervas.' },
  { canonical: sacredTermId('Terreiro'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Terreiro', modeInEn: 'preserve',
    es: 'Terreiro', modeInEs: 'preserve',
    aliases: [], notes: 'Casa de culto da Umbanda / Candomblé.' },
  { canonical: sacredTermId('Guia'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Guide', modeInEn: 'translate',
    es: 'Guía', modeInEs: 'translate',
    aliases: [], notes: 'Guia espiritual; ou contas de proteção.' },
  { canonical: sacredTermId('Fio de Contas'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Bead strand', modeInEn: 'translate',
    es: 'Hilo de Cuentas', modeInEs: 'translate',
    aliases: [], notes: 'Guia de contas consagrada; colar sagrado.' },
  { canonical: sacredTermId('Oferenda'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Offering', modeInEn: 'translate',
    es: 'Ofrenda', modeInEs: 'translate',
    aliases: [], notes: 'Presente ritual; oferenda alimentar.' },
  { canonical: sacredTermId('Passe'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Energy pass', modeInEn: 'translate',
    es: 'Pase', modeInEs: 'translate',
    aliases: [], notes: 'Transmissão de energia curativa.' },
  { canonical: sacredTermId('Corrente'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Current', modeInEn: 'translate',
    es: 'Corriente', modeInEs: 'translate',
    aliases: [], notes: 'A corrente mediúnica de um terreiro.' },
  { canonical: sacredTermId('Médium'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Medium', modeInEn: 'translate',
    es: 'Médium', modeInEs: 'preserve',
    aliases: [], notes: 'Pessoa que incorpora entidades.' },
  { canonical: sacredTermId('Encantado'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Enchanted one', modeInEn: 'translate',
    es: 'Encantado', modeInEs: 'preserve',
    aliases: [], notes: 'Estado de incorporação do espírito.' },
  { canonical: sacredTermId('Linha de Xangô'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Xangô Line', modeInEn: 'preserve',
    es: 'Línea de Shangó', modeInEs: 'preserve',
    aliases: [], notes: 'Linha esquerda; justiça na Umbanda.' },
  { canonical: sacredTermId('Linha de Iansã'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Iansã Line', modeInEn: 'preserve',
    es: 'Línea de Iansã', modeInEs: 'preserve',
    aliases: [], notes: 'Linha dos ventos e tempestades.' },
  { canonical: sacredTermId('Abaixo de Assemelhação'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Under the standard', modeInEn: 'translate',
    es: 'Bajo la Bandera', modeInEs: 'translate',
    aliases: [], notes: 'Posição ritual de respeito; curvado sob a bandeira.' },
  { canonical: sacredTermId('Bandeira'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Banner', modeInEn: 'translate',
    es: 'Bandera', modeInEs: 'translate',
    aliases: [], notes: 'Bandeira do santo; insígnia da gira.' },
  { canonical: sacredTermId('Sala de Gongá'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Gongá room', modeInEn: 'translate',
    es: 'Sala de Gongá', modeInEs: 'preserve',
    aliases: [], notes: 'Sala de incorporação mediúnica.' },
  { canonical: sacredTermId('Cambono de Pemba'), tradition: 'umbanda', modeInPt: 'preserve',
    en: 'Pemba assistant', modeInEn: 'translate',
    es: 'Cambono de Pemba', modeInEs: 'preserve',
    aliases: [], notes: 'Auxiliar do sacerdote nos pontos riscados.' },

  // -------------------------------- IFÁ --------------------------------------
  { canonical: sacredTermId('Orunmila'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Orunmila', modeInEn: 'preserve',
    es: 'Orula', modeInEs: 'transliterate',
    aliases: ['Orula'], notes: 'Orixá da sabedoria e do destino; patrono de Ifá.' },
  { canonical: sacredTermId('Ifá'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Ifa', modeInEn: 'transliterate',
    es: 'Ifá', modeInEs: 'preserve',
    aliases: ['Ifa'], notes: 'Sistema oracular Yorubá; corpo de conhecimento.' },
  { canonical: sacredTermId('Odù'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Odu', modeInEn: 'transliterate',
    es: 'Odu', modeInEs: 'transliterate',
    aliases: ['Odu', 'Odu Ifa'], notes: 'Os 16 (ou 256) signos oraculares de Ifá.' },
  { canonical: sacredTermId('Ogbe'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Ogbe', modeInEn: 'preserve',
    es: 'Ogbe', modeInEs: 'preserve',
    aliases: [], notes: 'Odù Ogbe; primeiro dos 16 sinais básicos.' },
  { canonical: sacredTermId('Oyeku'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Oyeku', modeInEn: 'preserve',
    es: 'Oyeku', modeInEs: 'preserve',
    aliases: [], notes: 'Odù Oyeku Meji; o último dos 16.' },
  { canonical: sacredTermId('Iwori'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Iwori', modeInEn: 'preserve',
    es: 'Iwori', modeInEs: 'preserve',
    aliases: [], notes: 'Odù Iwori; transformação interior.' },
  { canonical: sacredTermId('Odi'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Odi', modeInEn: 'preserve',
    es: 'Odi', modeInEs: 'preserve',
    aliases: [], notes: 'Odù Odi; contenção e sigilo.' },
  { canonical: sacredTermId('Irosu'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Irosu', modeInEn: 'preserve',
    es: 'Irosu', modeInEs: 'preserve',
    aliases: [], notes: 'Odù Irosu; prosperidade e renovação.' },
  { canonical: sacredTermId('Otura'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Otura', modeInEn: 'preserve',
    es: 'Otura', modeInEs: 'preserve',
    aliases: [], notes: 'Odù Otura; força e decisão.' },
  { canonical: sacredTermId('Ofun'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Ofun', modeInEn: 'preserve',
    es: 'Ofun', modeInEs: 'preserve',
    aliases: [], notes: 'Odù Ofun; poder espiritual profundo.' },
  { canonical: sacredTermId('Opón Ifá'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Opon Ifá', modeInEn: 'preserve',
    es: 'Tablero de Ifá', modeInEs: 'translate',
    aliases: ['Opon Ifá'], notes: 'Tábua sagrada sobre a qual se joga Ifá.' },
  { canonical: sacredTermId('Ikin'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Ikin', modeInEn: 'preserve',
    es: 'Ikin', modeInEs: 'preserve',
    aliases: [], notes: 'Sementes sagradas usadas no jogo de Ifá.' },
  { canonical: sacredTermId('Oráculo de Ifá'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Ifá Oracle', modeInEn: 'preserve',
    es: 'Oráculo de Ifá', modeInEs: 'preserve',
    aliases: [], notes: 'Sistema oracular completo.' },
  { canonical: sacredTermId('Bàbá'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Baba', modeInEn: 'transliterate',
    es: 'Bàbá', modeInEs: 'preserve',
    aliases: [], notes: 'Sacerdote de Ifá; pai-do-segredo.' },
  { canonical: sacredTermId('Apetebi'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Apetebi', modeInEn: 'preserve',
    es: 'Apetebi', modeInEs: 'preserve',
    aliases: [], notes: 'Esposa espiritual do Bàbá.' },
  { canonical: sacredTermId('Awo'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Awo', modeInEn: 'preserve',
    es: 'Awo', modeInEs: 'preserve',
    aliases: [], notes: 'Iniciado de Ifá.' },
  { canonical: sacredTermId('Esentaiye'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Esentaiye', modeInEn: 'preserve',
    es: 'Esentaiye', modeInEs: 'preserve',
    aliases: [], notes: 'Saudação ritual; "eu rendo minha cabeça à terra".' },
  { canonical: sacredTermId('Ebo'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Ebo', modeInEn: 'preserve',
    es: 'Ebo', modeInEs: 'preserve',
    aliases: [], notes: 'Oferenda prescrita pelo Odù.' },
  { canonical: sacredTermId('Tablero'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Wooden board', modeInEn: 'translate',
    es: 'Tablero', modeInEs: 'preserve',
    aliases: [], notes: 'Tablero de Ifá; madeira sagrada.' },
  { canonical: sacredTermId('Ikole'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Ikole', modeInEn: 'preserve',
    es: 'Ikole', modeInEs: 'preserve',
    aliases: [], notes: 'Pastoral divina do jogo de Ifá.' },
  { canonical: sacredTermId('Odu de Nascimento'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Birth Odu', modeInEn: 'preserve',
    es: 'Odu de Nacimiento', modeInEs: 'translate',
    aliases: [], notes: 'Odu regente do nascimento; signo fundamental da pessoa.' },
  { canonical: sacredTermId('Orixá Regente'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Ruling Orixá', modeInEn: 'preserve',
    es: 'Oricha Regente', modeInEs: 'transliterate',
    aliases: [], notes: 'Orixá que governa a cabeça do consulente.' },
  { canonical: sacredTermId('Orixá Pedindo Atenção'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Orixá demanding attention', modeInEn: 'translate',
    es: 'Oricha pidiendo atención', modeInEs: 'translate',
    aliases: [], notes: 'Orixá que o jogo de Ifá indica como foco.' },
  { canonical: sacredTermId('Oponente no Jogo'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Game opponent', modeInEn: 'translate',
    es: 'Oponente del Juego', modeInEs: 'translate',
    aliases: [], notes: 'Força adversária apontada pelo jogo de Ifá.' },
  { canonical: sacredTermId('Pataki'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Pataki', modeInEn: 'preserve',
    es: 'Pataki', modeInEs: 'preserve',
    aliases: ['Itan'], notes: 'Narrativa mítica que fundamenta o Odù.' },
  { canonical: sacredTermId('Eleda'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Eleda', modeInEn: 'preserve',
    es: 'Eleda', modeInEs: 'preserve',
    aliases: [], notes: 'Orixá interno; o que mora na cabeça.' },
  { canonical: sacredTermId('Aiyé'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Aiyé', modeInEn: 'preserve',
    es: 'Aiyé', modeInEs: 'preserve',
    aliases: ['Aiye'], notes: 'O mundo físico; contrapõe-se a Orun.' },
  { canonical: sacredTermId('Orun'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Orun', modeInEn: 'preserve',
    es: 'Orun', modeInEs: 'preserve',
    aliases: [], notes: 'O mundo espiritual; contrapõe-se a Aiyé.' },
  { canonical: sacredTermId('Ori'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Ori', modeInEn: 'preserve',
    es: 'Ori', modeInEs: 'preserve',
    aliases: [], notes: 'A cabeça interna; destino individual.' },
  { canonical: sacredTermId('Akoda'), tradition: 'ifa', modeInPt: 'preserve',
    en: 'Akoda', modeInEn: 'preserve',
    es: 'Akoda', modeInEs: 'preserve',
    aliases: [], notes: 'Discípulo direto do Babalorixá.' },

  // ------------------------------- CABALA ------------------------------------
  { canonical: sacredTermId('Kether'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Kether', modeInEn: 'preserve',
    es: 'Kether', modeInEs: 'preserve',
    aliases: ['Coroa'], notes: 'Primeira Sephirah; vontade divina.' },
  { canonical: sacredTermId('Chokmah'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Chokmah', modeInEn: 'preserve',
    es: 'Chokmah', modeInEs: 'preserve',
    aliases: ['Chochmah'], notes: 'Segunda Sephirah; sabedoria primordial.' },
  { canonical: sacredTermId('Binah'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Binah', modeInEn: 'preserve',
    es: 'Binah', modeInEs: 'preserve',
    aliases: [], notes: 'Terceira Sephirah; entendimento.' },
  { canonical: sacredTermId('Chesed'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Chesed', modeInEn: 'preserve',
    es: 'Jésed', modeInEs: 'transliterate',
    aliases: ['Jésed', 'Guedulá'], notes: 'Quarta Sephirah; misericórdia.' },
  { canonical: sacredTermId('Guevurah'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Gevurah', modeInEn: 'transliterate',
    es: 'Guevurá', modeInEs: 'transliterate',
    aliases: ['Gevurah', 'Guedulá'], notes: 'Quinta Sephirah; severidade.' },
  { canonical: sacredTermId('Tiferet'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Tiferet', modeInEn: 'preserve',
    es: 'Tiferet', modeInEs: 'preserve',
    aliases: ['Tiphéret'], notes: 'Sexta Sephirah; equilíbrio e beleza.' },
  { canonical: sacredTermId('Netzach'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Netzach', modeInEn: 'preserve',
    es: 'Nétsaj', modeInEs: 'transliterate',
    aliases: ['Netsach'], notes: 'Sétima Sephirah; vitória e eternidade.' },
  { canonical: sacredTermId('Hod'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Hod', modeInEn: 'preserve',
    es: 'Hod', modeInEs: 'preserve',
    aliases: [], notes: 'Oitava Sephirah; splendor e intelecto.' },
  { canonical: sacredTermId('Yesod'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Yesod', modeInEn: 'preserve',
    es: 'Yesod', modeInEs: 'preserve',
    aliases: ['Jessod'], notes: 'Nona Sephirah; fundamento.' },
  { canonical: sacredTermId('Malkuth'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Malkuth', modeInEn: 'preserve',
    es: 'Malkuth', modeInEs: 'preserve',
    aliases: ['Malchut'], notes: 'Décima Sephirah; o reino manifesto.' },
  { canonical: sacredTermId('Sephirot'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Sephirot', modeInEn: 'preserve',
    es: 'Sefirot', modeInEs: 'translate',
    aliases: ['Sefirot'], notes: 'As dez emanações divinas.' },
  { canonical: sacredTermId('Árvore da Vida'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Tree of Life', modeInEn: 'translate',
    es: 'Árbol de la Vida', modeInEs: 'translate',
    aliases: ['Etz Chaim'], notes: 'O diagrama cabalístico das dez Sephirot.' },
  { canonical: sacredTermId('Zohar'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Zohar', modeInEn: 'preserve',
    es: 'Zohar', modeInEs: 'preserve',
    aliases: [], notes: 'Livro do Esplendor; texto místico central.' },
  { canonical: sacredTermId('Sefer Yetzirah'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Book of Creation', modeInEn: 'translate',
    es: 'Séfer Ietzirá', modeInEs: 'translate',
    aliases: [], notes: 'Livro da Criação; texto cabalístico fundamental.' },
  { canonical: sacredTermId('Ein Sof'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Ein Sof', modeInEn: 'preserve',
    es: 'Ein Sof', modeInEs: 'preserve',
    aliases: ['En Sof'], notes: 'A infinitude divina antes da emanação.' },
  { canonical: sacredTermId('Olam'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Olam', modeInEn: 'preserve',
    es: 'Olam', modeInEs: 'preserve',
    aliases: [], notes: 'Mundo / era; um dos quatro níveis de existência.' },
  { canonical: sacredTermId('Atziluth'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Atziluth', modeInEn: 'preserve',
    es: 'Atzilut', modeInEs: 'transliterate',
    aliases: [], notes: 'Mundo da emanação; primeiro dos quatro mundos.' },
  { canonical: sacredTermId('Beriah'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Beriah', modeInEn: 'preserve',
    es: 'Beriá', modeInEs: 'transliterate',
    aliases: ['Beri\'ah'], notes: 'Mundo da criação; segundo mundo.' },
  { canonical: sacredTermId('Yetzirah'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Yetzirah', modeInEn: 'preserve',
    es: 'Ietzirá', modeInEs: 'transliterate',
    aliases: [], notes: 'Mundo da formação; terceiro mundo.' },
  { canonical: sacredTermId('Assiah'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Assiah', modeInEn: 'preserve',
    es: 'Assiá', modeInEs: 'transliterate',
    aliases: [], notes: 'Mundo da ação; quarto mundo.' },
  { canonical: sacredTermId('Cabala'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Kabbalah', modeInEn: 'transliterate',
    es: 'Cábala', modeInEs: 'preserve',
    aliases: ['Kabbalah'], notes: 'Tradição mística judaica.' },
  { canonical: sacredTermId('Hermetismo'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Hermeticism', modeInEn: 'translate',
    es: 'Hermetismo', modeInEs: 'preserve',
    aliases: [], notes: 'Tradição hermética ocidental; afinada com a Cabala.' },
  { canonical: sacredTermId('Merkavah'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Merkavah', modeInEn: 'preserve',
    es: 'Merkavá', modeInEs: 'transliterate',
    aliases: [], notes: 'O carro místico; tradição merkavá.' },
  { canonical: sacredTermId('Misticismo'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Mysticism', modeInEn: 'translate',
    es: 'Misticismo', modeInEs: 'translate',
    aliases: [], notes: 'Tradição mística geral.' },
  { canonical: sacredTermId('Tikun'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Tikkun', modeInEn: 'transliterate',
    es: 'Tikkún', modeInEs: 'transliterate',
    aliases: ['Tikkun'], notes: 'Reparo cósmico; correção das almas.' },
  { canonical: sacredTermId('Nefesh'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Nefesh', modeInEn: 'preserve',
    es: 'Néfesh', modeInEs: 'transliterate',
    aliases: [], notes: 'Alma animal; o primeiro dos cinco níveis.' },
  { canonical: sacredTermId('Ruach'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Ruach', modeInEn: 'preserve',
    es: 'Rúaj', modeInEs: 'transliterate',
    aliases: [], notes: 'Alma emocional / vital.' },
  { canonical: sacredTermId('Neshamah'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Neshamah', modeInEn: 'preserve',
    es: 'Neshamá', modeInEs: 'transliterate',
    aliases: [], notes: 'Alma superior; intelecto.' },
  { canonical: sacredTermId('Chayah'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Chayah', modeInEn: 'preserve',
    es: 'Jaiá', modeInEs: 'transliterate',
    aliases: [], notes: 'Alma da vontade pura.' },
  { canonical: sacredTermId('Yechidah'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Yechidah', modeInEn: 'preserve',
    es: 'Iejidá', modeInEs: 'transliterate',
    aliases: [], notes: 'A centelha; aspecto mais elevado da alma.' },
  { canonical: sacredTermId('Gematria'), tradition: 'cabala', modeInPt: 'preserve',
    en: 'Gematria', modeInEn: 'preserve',
    es: 'Gematria', modeInEs: 'preserve',
    aliases: [], notes: 'Sistema de análise numérica das palavras.' },

  // ---------------------------- ASTROLOGIA -----------------------------------
  { canonical: sacredTermId('Ascendente'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Ascendant', modeInEn: 'translate',
    es: 'Ascendente', modeInEs: 'preserve',
    aliases: ['ASC'], notes: 'Signo no horizonte leste no nascimento.' },
  { canonical: sacredTermId('Meio-do-Céu'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Midheaven', modeInEn: 'translate',
    es: 'Medio Cielo', modeInEs: 'translate',
    aliases: ['MC', 'Medio Cielo'], notes: 'Ponto culminante do mapa; vocação pública.' },
  { canonical: sacredTermId('Nodo Lunar'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Lunar Node', modeInEn: 'translate',
    es: 'Nodo Lunar', modeInEs: 'preserve',
    aliases: [], notes: 'Norte ou Sul; eixos de evolução kármica.' },
  { canonical: sacredTermId('Lilith'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Lilith', modeInEn: 'preserve',
    es: 'Lilith', modeInEs: 'preserve',
    aliases: ['Lua Negra'], notes: 'Ponto da sombra; sexualidade reprimida.' },
  { canonical: sacredTermId('Quíron'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Chiron', modeInEn: 'transliterate',
    es: 'Quirón', modeInEs: 'preserve',
    aliases: ['Chiron'], notes: 'O curador ferido; ferida e dom.' },
  { canonical: sacredTermId('Plutão'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Pluto', modeInEn: 'translate',
    es: 'Plutón', modeInEs: 'preserve',
    aliases: ['Plutão'], notes: 'Planeta da transformação profunda.' },
  { canonical: sacredTermId('Saturno'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Saturn', modeInEn: 'translate',
    es: 'Saturno', modeInEs: 'preserve',
    aliases: [], notes: 'Planeta da estrutura, disciplina e tempo.' },
  { canonical: sacredTermId('Júpiter'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Jupiter', modeInEn: 'translate',
    es: 'Júpiter', modeInEs: 'preserve',
    aliases: [], notes: 'Planeta da expansão, sorte e sabedoria.' },
  { canonical: sacredTermId('Vênus'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Venus', modeInEn: 'translate',
    es: 'Venus', modeInEs: 'preserve',
    aliases: [], notes: 'Planeta do amor, beleza e valores.' },
  { canonical: sacredTermId('Marte'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Mars', modeInEn: 'translate',
    es: 'Marte', modeInEs: 'preserve',
    aliases: [], notes: 'Planeta da ação, guerreiro e impulso.' },
  { canonical: sacredTermId('Mercúrio'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Mercury', modeInEn: 'translate',
    es: 'Mercurio', modeInEs: 'translate',
    aliases: [], notes: 'Planeta da mente, comunicação e comércio.' },
  { canonical: sacredTermId('Sol'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Sun', modeInEn: 'translate',
    es: 'Sol', modeInEs: 'preserve',
    aliases: [], notes: 'Identidade, ego, brilho essencial.' },
  { canonical: sacredTermId('Lua'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Moon', modeInEn: 'translate',
    es: 'Luna', modeInEs: 'translate',
    aliases: [], notes: 'Emoções, instinto e maternagem.' },
  { canonical: sacredTermId('Casa 1'), tradition: 'astrologia', modeInPt: 'preserve',
    en: '1st House', modeInEn: 'translate',
    es: 'Casa 1', modeInEs: 'preserve',
    aliases: [], notes: 'Casa do eu; identidade física.' },
  { canonical: sacredTermId('Casa 4'), tradition: 'astrologia', modeInPt: 'preserve',
    en: '4th House', modeInEn: 'translate',
    es: 'Casa 4', modeInEs: 'preserve',
    aliases: [], notes: 'Casa do lar e da família de origem.' },
  { canonical: sacredTermId('Casa 7'), tradition: 'astrologia', modeInPt: 'preserve',
    en: '7th House', modeInEn: 'translate',
    es: 'Casa 7', modeInEs: 'preserve',
    aliases: [], notes: 'Casa das parcerias e do matrimônio.' },
  { canonical: sacredTermId('Casa 8'), tradition: 'astrologia', modeInPt: 'preserve',
    en: '8th House', modeInEn: 'translate',
    es: 'Casa 8', modeInEs: 'preserve',
    aliases: [], notes: 'Casa da sexualidade, transformação e herança.' },
  { canonical: sacredTermId('Casa 10'), tradition: 'astrologia', modeInPt: 'preserve',
    en: '10th House', modeInEn: 'translate',
    es: 'Casa 10', modeInEs: 'preserve',
    aliases: [], notes: 'Casa da carreira e da vocação pública.' },
  { canonical: sacredTermId('Casa 12'), tradition: 'astrologia', modeInPt: 'preserve',
    en: '12th House', modeInEn: 'translate',
    es: 'Casa 12', modeInEs: 'preserve',
    aliases: [], notes: 'Casa do inconsciente e da transcendência.' },
  { canonical: sacredTermId('Aspecto'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Aspect', modeInEn: 'translate',
    es: 'Aspecto', modeInEs: 'preserve',
    aliases: [], notes: 'Ângulo entre planetas no mapa.' },
  { canonical: sacredTermId('Conjunção'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Conjunction', modeInEn: 'translate',
    es: 'Conjunción', modeInEs: 'translate',
    aliases: [], notes: 'Aspecto de 0 grau.' },
  { canonical: sacredTermId('Oposição'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Opposition', modeInEn: 'translate',
    es: 'Oposición', modeInEs: 'translate',
    aliases: [], notes: 'Aspecto de 180 graus.' },
  { canonical: sacredTermId('Trígono'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Trine', modeInEn: 'translate',
    es: 'Trígono', modeInEs: 'preserve',
    aliases: [], notes: 'Aspecto de 120 graus; harmonia.' },
  { canonical: sacredTermId('Quadratura'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Square', modeInEn: 'translate',
    es: 'Cuadratura', modeInEs: 'translate',
    aliases: [], notes: 'Aspecto de 90 graus; tensão.' },
  { canonical: sacredTermId('Sextil'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Sextile', modeInEn: 'translate',
    es: 'Sextil', modeInEs: 'preserve',
    aliases: [], notes: 'Aspecto de 60 graus; oportunidade.' },
  { canonical: sacredTermId('Retrógrado'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Retrograde', modeInEn: 'translate',
    es: 'Retrógrado', modeInEs: 'preserve',
    aliases: [], notes: 'Aparente movimento inverso de planeta.' },
  { canonical: sacredTermId('Carneiro'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Aries', modeInEn: 'translate',
    es: 'Aries', modeInEs: 'preserve',
    aliases: ['Áries', 'Aries'], notes: 'Signo de fogo; primeiro do zodíaco.' },
  { canonical: sacredTermId('Touro'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Taurus', modeInEn: 'translate',
    es: 'Tauro', modeInEs: 'translate',
    aliases: [], notes: 'Signo de terra; segundo do zodíaco.' },
  { canonical: sacredTermId('Escorpião'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Scorpio', modeInEn: 'translate',
    es: 'Escorpio', modeInEs: 'translate',
    aliases: [], notes: 'Signo de água; oitavo do zodíaco.' },
  { canonical: sacredTermId('Leão'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Leo', modeInEn: 'translate',
    es: 'Leo', modeInEs: 'translate',
    aliases: [], notes: 'Signo de fogo; quinto do zodíaco.' },
  { canonical: sacredTermId('Peixes'), tradition: 'astrologia', modeInPt: 'preserve',
    en: 'Pisces', modeInEn: 'translate',
    es: 'Piscis', modeInEs: 'translate',
    aliases: [], notes: 'Signo de água; décimo segundo do zodíaco.' },

  // ------------------------------- TANTRA ------------------------------------
  { canonical: sacredTermId('Kundalini'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Kundalini', modeInEn: 'preserve',
    es: 'Kundalini', modeInEs: 'preserve',
    aliases: [], notes: 'Energia adormecida na base da coluna.' },
  { canonical: sacredTermId('Mantra'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Mantra', modeInEn: 'preserve',
    es: 'Mantra', modeInEs: 'preserve',
    aliases: [], notes: 'Sílaba ou frase sagrada repetida.' },
  { canonical: sacredTermId('Yantra'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Yantra', modeInEn: 'preserve',
    es: 'Yantra', modeInEs: 'preserve',
    aliases: [], notes: 'Diagrama geométrico de meditação.' },
  { canonical: sacredTermId('Chakra'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Chakra', modeInEn: 'preserve',
    es: 'Chakra', modeInEs: 'preserve',
    aliases: [], notes: 'Centro energético sutil do corpo.' },
  { canonical: sacredTermId('Muladhara'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Muladhara', modeInEn: 'preserve',
    es: 'Muladhara', modeInEs: 'preserve',
    aliases: [], notes: 'Primeiro chakra; base da coluna.' },
  { canonical: sacredTermId('Svadhisthana'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Svadhisthana', modeInEn: 'preserve',
    es: 'Svadhisthana', modeInEs: 'preserve',
    aliases: [], notes: 'Segundo chakra; região sacral.' },
  { canonical: sacredTermId('Manipura'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Manipura', modeInEn: 'preserve',
    es: 'Manipura', modeInEs: 'preserve',
    aliases: [], notes: 'Terceiro chakra; plexo solar.' },
  { canonical: sacredTermId('Anahata'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Anahata', modeInEn: 'preserve',
    es: 'Anahata', modeInEs: 'preserve',
    aliases: [], notes: 'Quarto chakra; coração.' },
  { canonical: sacredTermId('Vishuddha'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Vishuddha', modeInEn: 'preserve',
    es: 'Vishuddha', modeInEs: 'preserve',
    aliases: [], notes: 'Quinto chakra; garganta.' },
  { canonical: sacredTermId('Ajna'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Ajna', modeInEn: 'preserve',
    es: 'Ajna', modeInEs: 'preserve',
    aliases: [], notes: 'Sexto chakra; terceiro olho.' },
  { canonical: sacredTermId('Sahasrara'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Sahasrara', modeInEn: 'preserve',
    es: 'Sahasrara', modeInEs: 'preserve',
    aliases: [], notes: 'Sétimo chakra; coroa.' },
  { canonical: sacredTermId('Sushumna'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Sushumna', modeInEn: 'preserve',
    es: 'Sushumna', modeInEs: 'preserve',
    aliases: [], notes: 'Canal central da coluna; passa pelos chakras.' },
  { canonical: sacredTermId('Ida'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Ida', modeInEn: 'preserve',
    es: 'Ida', modeInEs: 'preserve',
    aliases: [], notes: 'Nadi lunar; canal esquerdo.' },
  { canonical: sacredTermId('Pingala'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Pingala', modeInEn: 'preserve',
    es: 'Pingala', modeInEs: 'preserve',
    aliases: [], notes: 'Nadi solar; canal direito.' },
  { canonical: sacredTermId('Pranayama'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Pranayama', modeInEn: 'preserve',
    es: 'Pranayama', modeInEs: 'preserve',
    aliases: [], notes: 'Controle da respiração vital.' },
  { canonical: sacredTermId('Asana'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Asana', modeInEn: 'preserve',
    es: 'Asana', modeInEs: 'preserve',
    aliases: [], notes: 'Postura de meditação ou ioga.' },
  { canonical: sacredTermId('Mudra'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Mudra', modeInEn: 'preserve',
    es: 'Mudra', modeInEs: 'preserve',
    aliases: [], notes: 'Gesto sagrado.' },
  { canonical: sacredTermId('Bandha'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Bandha', modeInEn: 'preserve',
    es: 'Bandha', modeInEs: 'preserve',
    aliases: [], notes: 'Tranca energética; selo do corpo.' },
  { canonical: sacredTermId('Dhyana'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Dhyana', modeInEn: 'preserve',
    es: 'Dhyana', modeInEs: 'preserve',
    aliases: [], notes: 'Meditação profunda.' },
  { canonical: sacredTermId('Samadhi'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Samadhi', modeInEn: 'preserve',
    es: 'Samadhi', modeInEs: 'preserve',
    aliases: [], notes: 'Estado de absorção total.' },
  { canonical: sacredTermId('Guru'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Guru', modeInEn: 'preserve',
    es: 'Gurú', modeInEs: 'preserve',
    aliases: [], notes: 'Mestre espiritual.' },
  { canonical: sacredTermId('Bodhisattva'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Bodhisattva', modeInEn: 'preserve',
    es: 'Bodhisattva', modeInEs: 'preserve',
    aliases: [], notes: 'Ser iluminado que se demora para ensinar.' },
  { canonical: sacredTermId('Mandala'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Mandala', modeInEn: 'preserve',
    es: 'Mándala', modeInEs: 'transliterate',
    aliases: [], notes: 'Diagrama cósmico circular.' },
  { canonical: sacredTermId('Namastê'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Namaste', modeInEn: 'transliterate',
    es: 'Namasté', modeInEs: 'preserve',
    aliases: ['Namaste'], notes: 'Saudação à divindade interior.' },
  { canonical: sacredTermId('Shakti'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Shakti', modeInEn: 'preserve',
    es: 'Shakti', modeInEs: 'preserve',
    aliases: [], notes: 'Energia feminina primordial.' },
  { canonical: sacredTermId('Shiva'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Shiva', modeInEn: 'preserve',
    es: 'Shiva', modeInEs: 'preserve',
    aliases: [], notes: 'Princípio masculino da consciência.' },
  { canonical: sacredTermId('Atman'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Atman', modeInEn: 'preserve',
    es: 'Atman', modeInEs: 'preserve',
    aliases: [], notes: 'O eu interior; si-mesmo verdadeiro.' },
  { canonical: sacredTermId('Moksha'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Moksha', modeInEn: 'preserve',
    es: 'Moksha', modeInEs: 'preserve',
    aliases: [], notes: 'Liberação final.' },
  { canonical: sacredTermId('Dharma'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Dharma', modeInEn: 'preserve',
    es: 'Dharma', modeInEs: 'preserve',
    aliases: [], notes: 'Lei cósmica; dever verdadeiro.' },
  { canonical: sacredTermId('Karma'), tradition: 'tantra', modeInPt: 'preserve',
    en: 'Karma', modeInEn: 'preserve',
    es: 'Karma', modeInEs: 'preserve',
    aliases: [], notes: 'Causalidade moral das ações.' },

  // -------------------------------- CIGANO -----------------------------------
  { canonical: sacredTermId('Cigano'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Gypsy', modeInEn: 'translate',
    es: 'Gitano', modeInEs: 'translate',
    aliases: [], notes: 'Povo cigano; nômade da tradição esotérica.' },
  { canonical: sacredTermId('Cigana'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Gypsy woman', modeInEn: 'translate',
    es: 'Gitana', modeInEs: 'translate',
    aliases: [], notes: 'Mulher cigana; muitas vezes a leitora do baralho.' },
  { canonical: sacredTermId('Carta 28'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Card 28', modeInEn: 'translate',
    es: 'Carta 28', modeInEs: 'preserve',
    aliases: [], notes: 'A carta do Cigano; casa, ancestralidade.' },
  { canonical: sacredTermId('Carta 29'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Card 29', modeInEn: 'translate',
    es: 'Carta 29', modeInEs: 'preserve',
    aliases: [], notes: 'A carta da Cigana; maternidade, cuidado.' },
  { canonical: sacredTermId('A Estrela'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'The Star', modeInEn: 'translate',
    es: 'La Estrella', modeInEs: 'translate',
    aliases: [], notes: 'Carta do Tarô Cigano.' },
  { canonical: sacredTermId('O Coração'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'The Heart', modeInEn: 'translate',
    es: 'El Corazón', modeInEs: 'translate',
    aliases: [], notes: 'Carta do amor.' },
  { canonical: sacredTermId('O Cavaleiro'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'The Rider', modeInEn: 'translate',
    es: 'El Caballero', modeInEs: 'translate',
    aliases: [], notes: 'Carta do mensageiro e da notícia.' },
  { canonical: sacredTermId('A Torre'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'The Tower', modeInEn: 'translate',
    es: 'La Torre', modeInEs: 'translate',
    aliases: [], notes: 'Carta da mudança abrupta.' },
  { canonical: sacredTermId('O Sol'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'The Sun', modeInEn: 'translate',
    es: 'El Sol', modeInEs: 'translate',
    aliases: [], notes: 'Carta da alegria e do sucesso.' },
  { canonical: sacredTermId('A Lua'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'The Moon', modeInEn: 'translate',
    es: 'La Luna', modeInEs: 'translate',
    aliases: [], notes: 'Carta do inconsciente e dos amores.' },
  { canonical: sacredTermId('A Sorte'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'The Luck', modeInEn: 'translate',
    es: 'La Suerte', modeInEs: 'translate',
    aliases: [], notes: 'Carta da fortuna e do acaso.' },
  { canonical: sacredTermId('O Dinheiro'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'The Money', modeInEn: 'translate',
    es: 'El Dinero', modeInEs: 'translate',
    aliases: [], notes: 'Carta da prosperidade material.' },
  { canonical: sacredTermId('A Chave'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'The Key', modeInEn: 'translate',
    es: 'La Llave', modeInEs: 'translate',
    aliases: [], notes: 'Carta das soluções e aberturas.' },
  { canonical: sacredTermId('A Cruz'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'The Cross', modeInEn: 'translate',
    es: 'La Cruz', modeInEs: 'translate',
    aliases: [], notes: 'Carta do destino e do peso kármico.' },
  { canonical: sacredTermId('O Navio'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'The Ship', modeInEn: 'translate',
    es: 'El Barco', modeInEs: 'translate',
    aliases: [], notes: 'Carta de viagens e mudança.' },
  { canonical: sacredTermId('Os Anjos'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'The Angels', modeInEn: 'translate',
    es: 'Los Ángeles', modeInEs: 'translate',
    aliases: [], notes: 'Carta da proteção espiritual.' },
  { canonical: sacredTermId('A Cigana Sorte'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'The Lucky Gypsy', modeInEn: 'translate',
    es: 'La Gitana Suerte', modeInEs: 'translate',
    aliases: [], notes: 'Carta aberta da sorte cigana.' },
  { canonical: sacredTermId('Tarô Cigano'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Gypsy Tarot', modeInEn: 'translate',
    es: 'Tarot Gitano', modeInEs: 'translate',
    aliases: ['Tarot Cigano'], notes: 'Baralho cigano tradicional de 36 cartas.' },
  { canonical: sacredTermId('Lenormand'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Lenormand', modeInEn: 'preserve',
    es: 'Lenormand', modeInEs: 'preserve',
    aliases: [], notes: 'O baralho cigano também chamado Lenormand.' },
  { canonical: sacredTermId('Mesa Real'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Royal Table', modeInEn: 'translate',
    es: 'Mesa Real', modeInEs: 'preserve',
    aliases: [], notes: 'Disposição das 36 cartas em formato real.' },
  { canonical: sacredTermId('Bainha'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Sheath', modeInEn: 'translate',
    es: 'Vaina', modeInEs: 'translate',
    aliases: [], notes: 'Casa 28 das 36 da Mesa Real.' },
  { canonical: sacredTermId('Manto'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Mantle', modeInEn: 'translate',
    es: 'Manto', modeInEs: 'preserve',
    aliases: [], notes: 'Cobertura mística de uma casa da Mesa Real.' },
  { canonical: sacredTermId('Consulente'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Querent', modeInEn: 'translate',
    es: 'Consultante', modeInEs: 'translate',
    aliases: [], notes: 'A pessoa que pede a leitura.' },
  { canonical: sacredTermId('Cartomante'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Card reader', modeInEn: 'translate',
    es: 'Cartómanta', modeInEs: 'translate',
    aliases: [], notes: 'Leitora do baralho cigano.' },
  { canonical: sacredTermId('Jogo'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Reading', modeInEn: 'translate',
    es: 'Juego', modeInEs: 'translate',
    aliases: [], notes: 'Uma leitura completa.' },
  { canonical: sacredTermId('Cruzamento'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Crossing', modeInEn: 'translate',
    es: 'Cruce', modeInEs: 'translate',
    aliases: [], notes: 'Cruzamento entre cartas ou casas da Mesa Real.' },
  { canonical: sacredTermId('Casa da Mesa Real'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Royal Table House', modeInEn: 'translate',
    es: 'Casa de Mesa Real', modeInEs: 'preserve',
    aliases: [], notes: 'Uma das 36 casas da Mesa Real.' },
  { canonical: sacredTermId('Mandala Cigana'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Gypsy Mandala', modeInEn: 'translate',
    es: 'Mándala Gitana', modeInEs: 'translate',
    aliases: [], notes: 'Disposição circular das cartas.' },
  { canonical: sacredTermId('Baralho Cigano'), tradition: 'cigano', modeInPt: 'preserve',
    en: 'Gypsy Deck', modeInEn: 'translate',
    es: 'Baraja Gitana', modeInEs: 'translate',
    aliases: [], notes: 'O conjunto de 36 cartas.' },
  { canonical: sacredTermId('Leitura das 36'), tradition: 'cigano', modeInPt: 'preserve',
    en: '36-card reading', modeInEn: 'translate',
    es: 'Lectura de las 36', modeInEs: 'translate',
    aliases: [], notes: 'Leitura tradicional das 36 cartas.' },
]);

// ===========================================================================
// 4. Dictionary expansion + lookup tables
// ===========================================================================

interface CompiledEntry {
  readonly entry: SacredTermEntry;
  /** Surface form, normalized — used for matching WITHOUT diacritics. */
  readonly normalized: string;
}

/**
 * Build the entire dictionary. For each raw term we generate 3 entries
 * (PT-BR / EN / ES) with their respective mode. We also build a fast lookup
 * index keyed by `(lang, surface|alias)` so detection in translateText is O(1).
 */
function buildEntries(): readonly SacredTermEntry[] {
  const out: SacredTermEntry[] = [];
  for (const raw of RAW_TERMS) {
    // PT-BR — surface = canonical (preserve), or override; mode = modeInPt
    const ptSurface = raw.canonical;
    out.push(Object.freeze({
      termId: raw.canonical,
      term: ptSurface,
      lang: 'pt-BR',
      tradition: raw.tradition,
      mode: raw.modeInPt,
      aliases: Object.freeze([...raw.aliases]),
      notes: raw.notes,
    }));
    // EN — surface = en if non-null else raw.canonical; mode = modeInEn
    if (raw.en !== null) {
      out.push(Object.freeze({
        termId: raw.canonical,
        term: raw.en,
        lang: 'en',
        tradition: raw.tradition,
        mode: raw.modeInEn,
        aliases: Object.freeze([...raw.aliases]),
        notes: raw.notes,
      }));
    }
    // ES — surface = es if non-null else raw.canonical; mode = modeInEs
    if (raw.es !== null) {
      out.push(Object.freeze({
        termId: raw.canonical,
        term: raw.es,
        lang: 'es',
        tradition: raw.tradition,
        mode: raw.modeInEs,
        aliases: Object.freeze([...raw.aliases]),
        notes: raw.notes,
      }));
    }
  }
  return Object.freeze(out);
}

const DICTIONARY: ReadonlyArray<SacredTermEntry> = buildEntries();
const ENTRIES_BY_LANG: Readonly<Record<LangCode, readonly SacredTermEntry[]>> = Object.freeze({
  'pt-BR': Object.freeze(DICTIONARY.filter((e) => e.lang === 'pt-BR')),
  en: Object.freeze(DICTIONARY.filter((e) => e.lang === 'en')),
  es: Object.freeze(DICTIONARY.filter((e) => e.lang === 'es')),
});

/**
 * Index by language: for each (lang, surface-form) → list of entries.
 * Multiple terms can share the same surface in different languages, so we
 * store an array. Aliases are indexed too.
 */
function buildSurfaceIndex(): ReadonlyMap<string, readonly SacredTermEntry[]> {
  const map = new Map<string, SacredTermEntry[]>();
  for (const entry of DICTIONARY) {
    const key = surfaceKey(entry.lang, entry.term);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
    for (const alias of entry.aliases) {
      const aKey = surfaceKey(entry.lang, alias);
      if (!map.has(aKey)) map.set(aKey, []);
      map.get(aKey)!.push(entry);
    }
  }
  const out = new Map<string, ReadonlyArray<SacredTermEntry>>();
  for (const [k, v] of map) out.set(k, Object.freeze(v));
  return out;
}

function surfaceKey(lang: LangCode, surface: string): string {
  return `${lang}::${normalize(surface)}`;
}

/** Strip diacritics + lowercase for matching purposes. */
function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Build a Unicode-aware word-boundary regex for a single surface. */
function buildSurfaceRegex(surface: string): RegExp {
  const escaped = surface.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^\\p{L}\\p{N}_])(${escaped})(?=$|[^\\p{L}\\p{N}_])`, 'giu');
}

const SURFACE_INDEX: ReadonlyMap<string, readonly SacredTermEntry[]> = buildSurfaceIndex();

/** Find entries in a given lang whose surface or alias matches `surface` (normalized). */
function lookupBySurface(lang: LangCode, surface: string): readonly SacredTermEntry[] {
  return SURFACE_INDEX.get(surfaceKey(lang, surface)) ?? [];
}

/** Get all entries for a canonical term across the 3 languages. */
function getAllEntriesForTerm(termId: SacredTermId): readonly SacredTermEntry[] {
  return Object.freeze(DICTIONARY.filter((e) => e.termId === termId));
}

/** Get entry for a canonical term in a specific lang (null if missing). */
function getEntryForTermLang(termId: SacredTermId, lang: LangCode): SacredTermEntry | null {
  return DICTIONARY.find((e) => e.termId === termId && e.lang === lang) ?? null;
}

// ===========================================================================
// 5. Custom translation override layer (per-engine instance)
// ===========================================================================

type CustomMap = Map<SacredTermId, Map<LangCode, SacredTermEntry>>;

function buildEmptyCustom(): CustomMap {
  return new Map();
}

// ===========================================================================
// 6. Engine state + factory
// ===========================================================================

export interface TranslationEngine {
  translateText(input: TranslateInput): TranslateResult;
  lookupTerm(term: SacredTermId | string, targetLang: LangCode): TranslationResult;
  registerCustomTranslation(term: SacredTermId, lang: LangCode, entry: Omit<SacredTermEntry, 'termId' | 'lang'>): void;
  getSacredDictionary(lang: LangCode): readonly SacredTermEntry[];
  validateTranslation(text: string, sourceLang: LangCode, targetLang: LangCode): ValidationResult;
  exportAudit(): readonly TranslationRecord[];
  hashCacheKey(input: TranslateInput): string;
  clearCache(): void;
  /** TEST ONLY — resets mutable per-instance state (custom map + audit log + cache). */
  _resetForTest(): void;
}

function freezeRecord(r: TranslationRecord): TranslationRecord {
  return Object.freeze({
    cacheKey: r.cacheKey,
    sourceLang: r.sourceLang,
    targetLang: r.targetLang,
    inputText: r.inputText,
    outputText: r.outputText,
    hitsCount: r.hitsCount,
    at: r.at,
    cacheHit: r.cacheHit,
  });
}

export function createTranslationEngine(opts?: { readonly readonly?: boolean }): TranslationEngine {
  const custom: CustomMap = buildEmptyCustom();
  // Audit log of translations performed (capped to prevent unbounded growth).
  const AUDIT_CAP = 1024;
  const auditRaw: TranslationRecord[] = [];
  // In-memory cache: keyed by `hashCacheKey(input) → TranslateResult`
  const cache = new Map<string, TranslateResult>();

  function nowIso(): string {
    // ISO-8601 UTC; deterministic enough for tests that don't mock Date.
    return new Date().toISOString();
  }

  function appendAudit(rec: TranslationRecord): void {
    auditRaw.push(rec);
    if (auditRaw.length > AUDIT_CAP) {
      auditRaw.splice(0, auditRaw.length - AUDIT_CAP);
    }
  }

  function listEntries(lang: LangCode): readonly SacredTermEntry[] {
    const base = ENTRIES_BY_LANG[lang];
    const overrides: SacredTermEntry[] = [];
    for (const [, perLang] of custom) {
      const e = perLang.get(lang);
      if (e) overrides.push(e);
    }
    return Object.freeze([...base, ...overrides]);
  }

  function getEntryEffective(termId: SacredTermId, lang: LangCode): SacredTermEntry | null {
    const ov = custom.get(termId)?.get(lang);
    if (ov) return ov;
    return getEntryForTermLang(termId, lang);
  }

  function resolveLookup(term: SacredTermId | string, targetLang: LangCode): TranslationResult {
    const tid = (typeof term === 'string') ? sacredTermId(term) : term;
    const entry = getEntryEffective(tid, targetLang);
    if (!entry) return { found: false, entry: null, canonical: tid, mode: null };
    return { found: true, entry, canonical: tid, mode: entry.mode };
  }

  function findCandidateTermsInSource(text: string, sourceLang: LangCode): readonly { canonical: SacredTermId; sourceEntry: SacredTermEntry; surface: string }[] {
    // We iterate ALL entries in sourceLang (and their aliases) and try matching.
    // For each canonical, we find the source entry, then see if any of its
    // surface forms OR aliases appear (possibly with diacritic variations).
    const out: { canonical: SacredTermId; sourceEntry: SacredTermEntry; surface: string }[] = [];
    const seen = new Set<SacredTermId>();
    // Use the SOURCE entries (any lang equal to sourceLang, OR canonical via
    // alias cross-walk) — easier: scan lang-specific entries + check custom.
    const sourceEntries: SacredTermEntry[] = [];
    for (const e of ENTRIES_BY_LANG[sourceLang]) sourceEntries.push(e);
    for (const [, perLang] of custom) {
      const e = perLang.get(sourceLang);
      if (e) sourceEntries.push(e);
    }

    for (const entry of sourceEntries) {
      if (seen.has(entry.termId)) continue;
      const allCandidates: string[] = [entry.term, ...entry.aliases];
      for (const surf of allCandidates) {
        if (surf.length === 0) continue;
        // Compile per-surface regex (could be cached but small overhead for short texts).
        const regex = buildSurfaceRegex(surf);
        if (regex.test(text)) {
          seen.add(entry.termId);
          out.push({ canonical: entry.termId, sourceEntry: entry, surface: surf });
          break;
        }
      }
    }
    return out;
  }

  function detectAllCandidates(text: string): readonly { canonical: SacredTermId; lang: LangCode; surface: string }[] {
    const out: { canonical: SacredTermId; lang: LangCode; surface: string }[] = [];
    const seen = new Set<string>();
    // Walk every lang × every entry to find ANY match. For 3 langs × ~210 entries
    // it's still < 700 regex tests.
    for (const lang of SUPPORTED_LANGS) {
      const entries = ENTRIES_BY_LANG[lang];
      for (const entry of entries) {
        if (entry.term.length === 0) continue;
        const regex = buildSurfaceRegex(entry.term);
        if (regex.test(text)) {
          const k = `${entry.termId}|${entry.term}`;
          if (!seen.has(k)) {
            seen.add(k);
            out.push({ canonical: entry.termId, lang, surface: entry.term });
          }
        }
        for (const alias of entry.aliases) {
          if (alias.length === 0) continue;
          const regex2 = buildSurfaceRegex(alias);
          if (regex2.test(text)) {
            const k = `${entry.termId}|${alias}`;
            if (!seen.has(k)) {
              seen.add(k);
              out.push({ canonical: entry.termId, lang, surface: alias });
            }
          }
        }
      }
    }
    return out;
  }

  function applyTranslation(surface: string, sourceLang: LangCode, targetLang: LangCode, unicodeAware: boolean): {
    readonly output: string;
    readonly hits: readonly TranslationHit[];
  } {
    // Find which entry in sourceLang owns this surface (or alias).
    const sourceMatches = lookupBySurface(sourceLang, surface);
    if (sourceMatches.length === 0) {
      // No known term in source lang — return as-is.
      return { output: surface, hits: [] };
    }
    const hits: TranslationHit[] = [];
    const replacedSurfaces: SacredTermEntry[] = [];
    for (const srcEntry of sourceMatches) {
      const tgtEntry = getEntryEffective(srcEntry.termId, targetLang);
      if (!tgtEntry) continue;
      replacedSurfaces.push(srcEntry);
      hits.push(Object.freeze({
        termId: tgtEntry.termId,
        canonical: srcEntry.termId,
        sourceSurface: srcEntry.term,
        targetSurface: tgtEntry.term,
        mode: tgtEntry.mode,
        tradition: tgtEntry.tradition,
      }));
    }
    if (hits.length === 0) {
      return { output: surface, hits: [] };
    }
    // Replace all matched surfaces in the surface text using the canonical PT/EN/ES form of target.
    // Since `surface` may be a single term, just return the target surface of the first match.
    const primary = hits[0]!;
    return { output: primary.targetSurface, hits };
  }

  function translateInternal(input: TranslateInput): TranslateResult {
    const {
      text,
      sourceLang,
      targetLang,
      unicodeAware = true,
      useCache = true,
    } = input;

    if (typeof text !== 'string') throw new TypeError('translateText: text must be string');
    if (sourceLang === targetLang) {
      // Idempotent — same input → same output.
      const cacheKey = hashCacheKeyInternal(input);
      return Object.freeze({
        output: text,
        cacheKey,
        hits: Object.freeze([]),
        sourceLang,
        targetLang,
        cached: false,
      });
    }

    const cacheKey = hashCacheKeyInternal(input);
    if (useCache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        // Return a NEW frozen object with `cached: true` so the caller can
        // distinguish the hit from the original (which had `cached: false`).
        // The fields are deep-read from the cached result.
        const fresh: TranslateResult = Object.freeze({
          output: cached.output,
          cacheKey: cached.cacheKey,
          hits: cached.hits,
          sourceLang: cached.sourceLang,
          targetLang: cached.targetLang,
          cached: true,
        });
        const rec = freezeRecord({
          cacheKey,
          sourceLang,
          targetLang,
          inputText: text,
          outputText: cached.output,
          hitsCount: cached.hits.length,
          at: nowIso(),
          cacheHit: true,
        });
        appendAudit(rec);
        return fresh;
      }
    }

    // Detect candidates in sourceLang only (deterministic).
    const candidates = findCandidateTermsInSource(text, sourceLang);
    let output = text;
    const allHits: TranslationHit[] = [];

    if (unicodeAware) {
      // Replace longest surface first to avoid prefix overlap (e.g. "Casa 1" before "Casa").
      // We track "detected" via the regex .test() — a hit is recorded whenever
      // the regex matches at least once, regardless of whether the surface
      // visually changes (preserve mode legitimately keeps the same surface
      // but is still a sacred term the engine recognized).
      const sorted = [...candidates].sort((a, b) => b.surface.length - a.surface.length);
      for (const cand of sorted) {
        const tgtEntry = getEntryEffective(cand.canonical, targetLang);
        if (!tgtEntry) continue;
        const re = buildSurfaceRegex(cand.surface);
        if (re.test(output)) {
          // Replace ALL occurrences (compile a fresh regex with lastIndex reset).
          const replRe = buildSurfaceRegex(cand.surface);
          output = output.replace(replRe, (_match, prefix) => `${prefix}${tgtEntry.term}`);
          allHits.push(Object.freeze({
            termId: tgtEntry.termId,
            canonical: cand.canonical,
            sourceSurface: cand.surface,
            targetSurface: tgtEntry.term,
            mode: tgtEntry.mode,
            tradition: tgtEntry.tradition,
          }));
        }
      }
    } else {
      // Non-unicode: simple per-term replacement (uses \b ASCII word boundaries).
      // Detection via regex .test() — same as unicode branch.
      for (const cand of candidates) {
        const tgtEntry = getEntryEffective(cand.canonical, targetLang);
        if (!tgtEntry) continue;
        const escaped = cand.surface.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`\\b${escaped}\\b`, 'gi');
        if (re.test(output)) {
          const replRe = new RegExp(`\\b${escaped}\\b`, 'gi');
          output = output.replace(replRe, tgtEntry.term);
          allHits.push(Object.freeze({
            termId: tgtEntry.termId,
            canonical: cand.canonical,
            sourceSurface: cand.surface,
            targetSurface: tgtEntry.term,
            mode: tgtEntry.mode,
            tradition: tgtEntry.tradition,
          }));
        }
      }
    }

    const result: TranslateResult = Object.freeze({
      output,
      cacheKey,
      hits: Object.freeze(allHits),
      sourceLang,
      targetLang,
      cached: false,
    });

    if (useCache) cache.set(cacheKey, result);

    const rec = freezeRecord({
      cacheKey,
      sourceLang,
      targetLang,
      inputText: text,
      outputText: output,
      hitsCount: allHits.length,
      at: nowIso(),
      cacheHit: false,
    });
    appendAudit(rec);
    return result;
  }

  function hashCacheKeyInternal(input: TranslateInput): string {
    const canonical = canonicalJson({
      text: input.text,
      sourceLang: input.sourceLang,
      targetLang: input.targetLang,
      unicodeAware: input.unicodeAware ?? true,
    });
    return sha256Hex(canonical);
  }

  function validateInternal(text: string, sourceLang: LangCode, targetLang: LangCode): ValidationResult {
    const issues: ValidationIssue[] = [];
    const untranslated: string[] = [];
    if (typeof text !== 'string') {
      issues.push({ severity: 'error', code: 'TYPE', message: 'text must be string' });
      return { ok: false, issues: Object.freeze(issues), untranslatedSacred: Object.freeze([]) };
    }
    if (text.length === 0) {
      issues.push({ severity: 'warn', code: 'EMPTY', message: 'empty input' });
      return { ok: true, issues: Object.freeze(issues), untranslatedSacred: Object.freeze([]) };
    }
    // Find sacred terms detected in source that were NOT replaced.
    const candidates = detectAllCandidates(text);
    if (candidates.length === 0) {
      issues.push({ severity: 'info', code: 'NO_SACRED', message: 'no sacred terms detected' });
    }
    for (const cand of candidates) {
      const srcEntry = getEntryEffective(cand.canonical, sourceLang) ?? getEntryForTermLang(cand.canonical, sourceLang);
      const tgtEntry = getEntryEffective(cand.canonical, targetLang) ?? getEntryForTermLang(cand.canonical, targetLang);
      if (!tgtEntry) {
        untranslated.push(cand.surface);
        issues.push({
          severity: 'warn',
          code: 'NO_TARGET_ENTRY',
          message: `no target entry for canonical=${cand.canonical} in lang=${targetLang}`,
          surface: cand.surface,
        });
        continue;
      }
      if (srcEntry && srcEntry.term === tgtEntry.term && srcEntry.lang === sourceLang) {
        // Same surface across langs → ok but mark "preserved" for the report.
        issues.push({
          severity: 'info',
          code: 'IDENTICAL_SURFACE',
          message: `surface identical across ${sourceLang}→${targetLang}`,
          surface: cand.surface,
        });
      }
    }
    const errors = issues.filter((i) => i.severity === 'error');
    return {
      ok: errors.length === 0,
      issues: Object.freeze(issues),
      untranslatedSacred: Object.freeze(untranslated),
    };
  }

  return Object.freeze({
    translateText(input: TranslateInput): TranslateResult {
      return translateInternal(input);
    },
    lookupTerm(term: SacredTermId | string, targetLang: LangCode): TranslationResult {
      return resolveLookup(term, targetLang);
    },
    registerCustomTranslation(
      term: SacredTermId,
      lang: LangCode,
      partial: Omit<SacredTermEntry, 'termId' | 'lang'>,
    ): void {
      if (opts?.readonly) throw new Error('engine is readonly');
      const entry: SacredTermEntry = Object.freeze({
        termId: term,
        lang,
        term: partial.term,
        tradition: partial.tradition,
        mode: partial.mode,
        aliases: Object.freeze([...partial.aliases]),
        notes: partial.notes,
      });
      if (!custom.has(term)) custom.set(term, new Map());
      custom.get(term)!.set(lang, entry);
      // Invalidate cache when override changes behavior.
      cache.clear();
    },
    getSacredDictionary(lang: LangCode): readonly SacredTermEntry[] {
      return listEntries(lang);
    },
    validateTranslation(text: string, sourceLang: LangCode, targetLang: LangCode): ValidationResult {
      return validateInternal(text, sourceLang, targetLang);
    },
    exportAudit(): readonly TranslationRecord[] {
      return Object.freeze(auditRaw.map(freezeRecord));
    },
    hashCacheKey(input: TranslateInput): string {
      return hashCacheKeyInternal(input);
    },
    clearCache(): void {
      cache.clear();
    },
    _resetForTest(): void {
      custom.clear();
      auditRaw.length = 0;
      cache.clear();
    },
  });
}

/**
 * Default singleton engine — lazy-initialized; tests can call `_resetForTest`
 * via the factory if needed.
 */
let _defaultEngine: TranslationEngine | null = null;
export function defaultTranslationEngine(): TranslationEngine {
  if (!_defaultEngine) _defaultEngine = createTranslationEngine();
  return _defaultEngine;
}

// ===========================================================================
// 7. Canonical-JSON + SHA-256 (worktree-isolated Node crypto stub)
// ===========================================================================

/**
 * Deterministically serialize an object: keys are sorted recursively so
 * `JSON.stringify` produces the same bytes regardless of property insertion
 * order. Per cycle 67 lesson (canonical JSON for cache keys).
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const out: Record<string, unknown> = {};
    for (const k of keys) out[k] = sortKeys(obj[k]);
    return out;
  }
  return value;
}

/** SHA-256 hex digest using Node's `crypto` module when available. */
export function sha256Hex(input: string): string {
  const cryptoMod = resolveNodeCrypto();
  if (cryptoMod) {
    const hash = cryptoMod.createHash('sha256');
    hash.update(input, 'utf8');
    return hash.digest('hex');
  }
  return pureJsSha256Hex(input);
}

interface NodeCryptoLike {
  createHash(alg: string): {
    update(data: string | Uint8Array, enc?: string): unknown;
    digest(enc?: string): string;
  };
}

function resolveNodeCrypto(): NodeCryptoLike | null {
  // We avoid importing node:crypto at top level so the module parses even
  // when @types/node is not in the worktree-isolated `types: []` config.
  try {
    const rt = globalThis as { require?: (id: string) => unknown };
    if (typeof rt.require === 'function') {
      const mod = rt.require('node:crypto');
      if (mod && typeof mod === 'object' && 'createHash' in (mod as Record<string, unknown>)) {
        return mod as NodeCryptoLike;
      }
    }
  } catch {
    /* fall through to pure JS */
  }
  return null;
}

// ---- pure-JS SHA-256 fallback ----------------------------------------------
// Cycle 75 lesson: --experimental-strip-types may not expose require() at
// runtime depending on Node version. We embed a small SHA-256 implementation
// so hashCacheKey always works.
function pureJsSha256Hex(input: string): string {
  // Convert string to UTF-8 bytes.
  const utf8: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code < 0x80) utf8.push(code);
    else if (code < 0x800) utf8.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if ((code & 0xfc00) === 0xd800 && i + 1 < input.length) {
      const next = input.charCodeAt(i + 1);
      if ((next & 0xfc00) === 0xdc00) {
        i++;
        const cp = 0x10000 + (((code & 0x3ff) << 10) | (next & 0x3ff));
        utf8.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
        continue;
      }
    } else utf8.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
  }
  const len = utf8.length;
  // SHA-256 constants
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  let H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a;
  let H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;
  const padded = new Uint8Array(Math.ceil((len + 9) / 64) * 64);
  padded.set(utf8);
  padded[len] = 0x80;
  // length in bits (big-endian 64-bit)
  const bitLen = len * 8;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, bitLen >>> 0, false);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);
  for (let off = 0; off < padded.length; off += 64) {
    const W = new Uint32Array(64);
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(off + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15]!, 7) ^ rotr(W[i - 15]!, 18) ^ (W[i - 15]! >>> 3);
      const s1 = rotr(W[i - 2]!, 17) ^ rotr(W[i - 2]!, 19) ^ (W[i - 2]! >>> 10);
      W[i] = (W[i - 16]! + s0 + W[i - 7]! + s1) >>> 0;
    }
    let a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i]! + W[i]!) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const mj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + mj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H0 = (H0 + a) >>> 0; H1 = (H1 + b) >>> 0; H2 = (H2 + c) >>> 0; H3 = (H3 + d) >>> 0;
    H4 = (H4 + e) >>> 0; H5 = (H5 + f) >>> 0; H6 = (H6 + g) >>> 0; H7 = (H7 + h) >>> 0;
  }
  return [H0, H1, H2, H3, H4, H5, H6, H7].map((v) => v.toString(16).padStart(8, '0')).join('');
}
function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

// ===========================================================================
// 8. Convenience top-level wrappers (use the default engine instance)
// ===========================================================================

export function translateText(input: TranslateInput): TranslateResult {
  return defaultTranslationEngine().translateText(input);
}
export function lookupTerm(term: SacredTermId | string, targetLang: LangCode): TranslationResult {
  return defaultTranslationEngine().lookupTerm(term, targetLang);
}
export function registerCustomTranslation(
  term: SacredTermId,
  lang: LangCode,
  entry: Omit<SacredTermEntry, 'termId' | 'lang'>,
): void {
  return defaultTranslationEngine().registerCustomTranslation(term, lang, entry);
}
export function getSacredDictionary(lang: LangCode): readonly SacredTermEntry[] {
  return defaultTranslationEngine().getSacredDictionary(lang);
}
export function validateTranslation(text: string, sourceLang: LangCode, targetLang: LangCode): ValidationResult {
  return defaultTranslationEngine().validateTranslation(text, sourceLang, targetLang);
}
export function exportAudit(): readonly TranslationRecord[] {
  return defaultTranslationEngine().exportAudit();
}
export function hashCacheKey(input: TranslateInput): string {
  return defaultTranslationEngine().hashCacheKey(input);
}

// ===========================================================================
// 9. Inventory constants — exported for tests / docs
// ===========================================================================

export const SACRED_LANGS: readonly LangCode[] = SUPPORTED_LANGS;
export const SACRED_TRADITIONS: readonly Tradition[] = SUPPORTED_TRADITIONS;
export function dictSize(): number {
  return DICTIONARY.length;
}
export function dictSizeByLang(lang: LangCode): number {
  return ENTRIES_BY_LANG[lang].length;
}
export function termCountByTradition(): Readonly<Record<Tradition, number>> {
  const out: Record<string, number> = {};
  for (const t of SUPPORTED_TRADITIONS) out[t] = 0;
  for (const raw of RAW_TERMS) out[raw.tradition] = (out[raw.tradition] ?? 0) + 1;
  return Object.freeze(out);
}
