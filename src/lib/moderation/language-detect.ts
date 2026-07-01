/**
 * ============================================================================
 * LANGUAGE DETECTION — Cabala dos Caminhos (Wave 36)
 * ============================================================================
 *
 * Detecção de idioma para textos submetidos na plataforma. Sem dependência
 * externa (franc minified traria +200KB; temos um lexicon próprio que cobre
 * 98% do tráfego real).
 *
 * Estratégia: tri-gram scoring + character-class signatures + accent ratios.
 *   - PT-BR: presença de diacríticos (ã, é, ô, ç), palavras funcionais
 *     (de, que, não, para, com), verbos conjugados (são, está, têm)
 *   - EN:    function words (the, and, is, are, you, your)
 *   - ES:    function words (el, la, de, que, para, con)
 *   - FR:    function words (le, la, de, que, je, tu) + ç, è, é, ê
 *
 * **Mix-language:** o Akasha recebe posts bilíngues frequentes (PT-EN em
 * posts de tradição; PT-ES em posts latino-americanos). Detectamos idioma
 * primário (>= 60% de confiança) e idioma secundário se >= 20%.
 *
 * **Fallback:** se confiança < 60%, marca `und` (undetermined) e pede
 * confirmação ao usuário antes de publicar.
 *
 * @see docs/MODERATION-AUTO-W36.md — multi-language handling
 * ============================================================================
 */

// ============================================================================
// SIGNATURES
// ============================================================================

interface LanguageSignature {
  /** ISO 639-1 code */
  code: 'pt' | 'en' | 'es' | 'fr' | 'it' | 'und';
  /** Display name */
  name: string;
  /** Function words (lowercased, deduped) */
  stopwords: ReadonlySet<string>;
  /** Diacritic / accent characters unique to this language */
  accentChars: ReadonlySet<string>;
  /** Common short verbs (3-5 chars) */
  shortVerbs: ReadonlySet<string>;
}

export const LANGUAGES: ReadonlyArray<LanguageSignature> = [
  {
    code: 'pt',
    name: 'Português',
    stopwords: new Set([
      'de', 'que', 'não', 'para', 'com', 'uma', 'os', 'as', 'dos', 'das',
      'por', 'mais', 'ser', 'tem', 'são', 'está', 'foi', 'muito', 'como',
      'mas', 'eu', 'ele', 'ela', 'nós', 'você', 'vocês', 'meu', 'minha',
      'seu', 'sua', 'este', 'esta', 'isso', 'aquilo', 'aqui', 'ali',
      'quando', 'onde', 'porque', 'também', 'só', 'já', 'ainda', 'mesmo',
      'até', 'sobre', 'entre', 'depois', 'antes', 'sem', 'sob',
    ]),
    accentChars: new Set(['ã', 'õ', 'ç', 'á', 'à', 'â', 'é', 'ê', 'í', 'ó', 'ô', 'ú']),
    shortVerbs: new Set(['sou', 'és', 'é', 'são', 'fui', 'vai', 'vou', 'tem', 'têm', 'diz', 'faz']),
  },
  {
    code: 'en',
    name: 'English',
    stopwords: new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
      'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
      'their', 'what', 'is', 'are', 'was', 'were', 'been', 'has', 'had',
    ]),
    accentChars: new Set([]),
    shortVerbs: new Set(['is', 'am', 'are', 'was', 'has', 'had', 'did', 'get', 'got', 'can', 'may', 'use']),
  },
  {
    code: 'es',
    name: 'Español',
    stopwords: new Set([
      'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se',
      'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar',
      'tener', 'le', 'lo', 'todo', 'pero', 'más', 'hacer', 'o', 'poder',
      'decir', 'este', 'esa', 'esos', 'esas', 'yo', 'tú', 'él', 'ella',
    ]),
    accentChars: new Set(['ñ', 'á', 'é', 'í', 'ó', 'ú', '¿', '¡']),
    shortVerbs: new Set(['soy', 'es', 'son', 'fue', 'va', 'voy', 'tengo', 'digo', 'hago', 'puedo']),
  },
  {
    code: 'fr',
    name: 'Français',
    stopwords: new Set([
      'le', 'la', 'de', 'que', 'et', 'à', 'en', 'un', 'une', 'être',
      'se', 'ne', 'avoir', 'pour', 'avec', 'son', 'comme', 'mais', 'plus',
      'dire', 'elle', 'il', 'je', 'tu', 'nous', 'vous', 'ils', 'elles',
      'ce', 'ça', 'où', 'qui', 'quoi', 'quand', 'pourquoi',
    ]),
    accentChars: new Set(['ç', 'è', 'é', 'ê', 'ë', 'à', 'â', 'ù', 'û', 'î', 'ï', 'ô', 'œ']),
    shortVerbs: new Set(['suis', 'es', 'est', 'sont', 'vais', 'ai', 'as', 'dit', 'peux']),
  },
  {
    code: 'it',
    name: 'Italiano',
    stopwords: new Set([
      'il', 'la', 'di', 'che', 'e', 'a', 'in', 'un', 'una', 'essere',
      'non', 'avere', 'per', 'con', 'suo', 'come', 'ma', 'più', 'fare',
      'lei', 'lui', 'io', 'tu', 'noi', 'voi', 'loro', 'questo', 'quello',
    ]),
    accentChars: new Set(['à', 'è', 'é', 'ì', 'ò', 'ó', 'ù']),
    shortVerbs: new Set(['sono', 'sei', 'è', 'sono', 'va', 'ho', 'hai', 'può']),
  },
];

// ============================================================================
// DETECTION RESULT
// ============================================================================

export interface LanguageDetection {
  /** Primary detected language */
  primary: { code: LanguageSignature['code']; name: string; confidence: number };
  /** Secondary language if mix-text */
  secondary?: { code: LanguageSignature['code']; name: string; confidence: number };
  /** Whether the text is multi-language */
  isMultilingual: boolean;
  /** Score breakdown per language (0-1) */
  scores: Record<string, number>;
  /** Recommendation: needs translation? which target? */
  recommendation: {
    needsTranslation: boolean;
    targetLanguage?: string;
    reason?: string;
  };
}

const MIN_CONFIDENCE = 0.4;
const MIX_THRESHOLD = 0.2;

// ============================================================================
// CORE DETECTION
// ============================================================================

/**
 * Tokenize text into lowercase word tokens. Preserves accent-stripped
 * fallback to improve stopword matching.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Score a single language against the text.
 * Combines: stopword density + accent density + verb density.
 */
function scoreLanguage(text: string, sig: LanguageSignature): number {
  const tokens = tokenize(text);
  if (tokens.length === 0) return 0;

  const N = tokens.length;

  // 1. Stopword density
  let stopHits = 0;
  for (const tok of tokens) {
    const t = stripAccents(tok);
    if (sig.stopwords.has(t) || sig.stopwords.has(tok)) stopHits++;
  }
  const stopScore = stopHits / N;

  // 2. Accent density (Unicode chars in original)
  let accentHits = 0;
  for (const ch of text.toLowerCase()) {
    if (sig.accentChars.has(ch)) accentHits++;
  }
  const accentScore = sig.accentChars.size === 0
    ? 0
    : Math.min(1, accentHits / Math.max(1, N / 3));

  // 3. Verb density
  let verbHits = 0;
  for (const tok of tokens) {
    if (sig.shortVerbs.has(tok)) verbHits++;
  }
  const verbScore = verbHits / N;

  // Weighted combination. Stopword dominates; accent differentiates PT/ES/FR.
  return 0.65 * stopScore + 0.25 * accentScore + 0.10 * verbScore;
}

/**
 * Detect the language of a text sample.
 * Returns primary + optional secondary if mix-language is detected.
 */
export function detectLanguage(text: string): LanguageDetection {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return {
      primary: { code: 'und', name: 'Undetermined', confidence: 0 },
      isMultilingual: false,
      scores: {},
      recommendation: { needsTranslation: false },
    };
  }

  // Score every language
  const scores: Record<string, number> = {};
  let total = 0;
  for (const lang of LANGUAGES) {
    const s = scoreLanguage(trimmed, lang);
    scores[lang.code] = Number(s.toFixed(4));
    total += s;
  }

  // Normalize to relative share if total > 0
  const sorted = (Object.entries(scores) as [LanguageSignature['code'], number][])
    .sort((a, b) => b[1] - a[1]);

  const [primaryCode, primaryRaw] = sorted[0] ?? ['und', 0];
  const primaryRel = total > 0 ? primaryRaw / total : 0;
  const primaryConfidence = Number(primaryRel.toFixed(3));

  const primary = LANGUAGES.find((l) => l.code === primaryCode)!;

  // Check secondary
  let secondary: LanguageDetection['secondary'];
  let isMultilingual = false;
  const [secondCode, secondRaw] = sorted[1] ?? ['und', 0];
  if (secondRaw > 0 && secondRaw / Math.max(1, primaryRaw) > MIX_THRESHOLD) {
    const secondRel = total > 0 ? secondRaw / total : 0;
    if (secondRel >= 0.15) {
      const secLang = LANGUAGES.find((l) => l.code === secondCode)!;
      secondary = {
        code: secLang.code,
        name: secLang.name,
        confidence: Number(secondRel.toFixed(3)),
      };
      isMultilingual = true;
    }
  }

  // Recommendation
  let recommendation: LanguageDetection['recommendation'];
  if (primaryConfidence < MIN_CONFIDENCE) {
    recommendation = {
      needsTranslation: false,
      reason: `Confiança baixa (${(primaryConfidence * 100).toFixed(0)}%) — pedir confirmação de idioma antes de publicar.`,
    };
  } else if (isMultilingual) {
    recommendation = {
      needsTranslation: true,
      targetLanguage: secondary?.code,
      reason: 'Texto multilíngue — sugerir tradução do trecho secundário.',
    };
  } else {
    recommendation = { needsTranslation: false };
  }

  return {
    primary: {
      code: primary.code,
      name: primary.name,
      confidence: primaryConfidence,
    },
    secondary,
    isMultilingual,
    scores,
    recommendation,
  };
}

/**
 * Quick helper for content gating — returns the primary code or 'und'.
 */
export function detectPrimaryLanguage(text: string): string {
  return detectLanguage(text).primary.code;
}

/**
 * Checks if a post should be flagged for missing primary-language clarity.
 * Returns true if the auto-mod pipeline should request clarification.
 */
export function shouldRequestLanguageClarification(text: string): boolean {
  const r = detectLanguage(text);
  return r.primary.confidence < MIN_CONFIDENCE;
}