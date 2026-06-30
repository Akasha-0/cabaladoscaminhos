// ============================================================================
// text-normalizer.ts — Markdown / sacred / URL stripping for TTS (W72-D)
// ============================================================================
// Wave-Spawner Cycle 72 — Worker D.
//
// Before sending text to a TTS engine we strip everything that doesn't
// belong in spoken audio:
//
//   1. [tag:X] and [citation:N] — internal Akasha tokens. SKIP entirely
//      (not "tag of X" — would be confusing in audio). Rationale: the
//      user already sees these in the chat bubble; audio is for prose only.
//   2. Markdown — `**bold**` → `bold`, `*italic*` → `italic`, backticks
//      → unwrap. Keep the content, drop the markers.
//   3. Sacred symbols — `🜂` (fire) → "fogo", `☉` (sun) → "sol", etc.
//      Use a small phonetic lookup; never invent — the table is closed.
//   4. URLs — replace with "link omitido". URL strings read aloud sound
//      like soup ("h-t-t-p-s-colon-slash-slash...").
//   5. Whitespace collapse + 5000-char clamp (defensive — server enforces).
//
// Boundary detection (cycle 60+ lesson): we use \b...\b-style guards on
// sacred-term lookarounds. We do NOT translate "cigano" → anything; it's
// a proper-noun tradition and must stay as the user typed it.
// ============================================================================

// ---------------------------------------------------------------------------
// Sacred symbol lookup — closed table. Add a symbol only when the user has
// confirmed the spoken form.
// ---------------------------------------------------------------------------

const SACRED_SYMBOL_TABLE: Readonly<Record<string, string>> = Object.freeze({
  // Fire / water / air / earth
  '🜂': 'fogo',
  '🜄': 'água',
  '🜁': 'ar',
  '🜃': 'terra',
  // Sun / moon
  '☉': 'sol',
  '☽': 'lua',
  '☾': 'lua',
  // Zodiac (PT-BR)
  '♈': 'áries',
  '♉': 'touro',
  '♊': 'gêmeos',
  '♋': 'câncer',
  '♌': 'leão',
  '♍': 'virgem',
  '♎': 'libra',
  '♏': 'escorpião',
  '♐': 'sagitário',
  '♑': 'capricórnio',
  '♒': 'aquário',
  '♓': 'peixes',
  // Planets (PT-BR, abbreviated phonetic)
  '☿': 'mercúrio',
  '♀': 'vênus',
  '♁': 'terra',
  '♂': 'marte',
  '♃': 'júpiter',
  '♄': 'saturno',
  '♅': 'urano',
  '♆': 'netuno',
  '♇': 'plutão',
  // Sefirot (PT-BR, abbreviated)
  '⚭': 'união',
  // Candomblé / Umbanda — Orixás symbols (only the most common)
  '🪶': 'oxalá',
});

// Build a single regex from the table keys using alternation. Character
// classes are wrong here because surrogate-pair emojis (e.g. 🜂 = U+1F702
// = \uD83C\uDF02) would be treated as two separate code units, splitting
// the emoji. Alternation outside a class matches the full sequence.
const SACRED_SYMBOL_PATTERN = new RegExp(
  '(?:' +
    Object.keys(SACRED_SYMBOL_TABLE)
      // Escape any regex metacharacters in keys.
      .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|') +
    ')',
  'gu'
);

// ---------------------------------------------------------------------------
// Token regexes (precompiled for speed).
// ---------------------------------------------------------------------------

// [tag:X] or [citation:N] — also matches [tag:foo bar] and [citation:1,2].
const TAG_TOKEN_RE = /\[(?:tag|citation):[^\]]+\]/gi;

// Markdown emphasis: **bold**, *italic*, `code`. We strip the markers,
// keeping the inner text.
const MARKDOWN_BOLD_RE = /\*\*([^*]+)\*\*/g;
const MARKDOWN_ITALIC_RE = /(^|[^*])\*([^*\n]+)\*/g;
const MARKDOWN_CODE_RE = /`([^`]+)`/g;

// URLs — http(s)://... and www....
const URL_RE = /\bhttps?:\/\/\S+|\bwww\.\S+/gi;

// Markdown link [text](url) → keep text, drop url.
const MARKDOWN_LINK_RE = /\[([^\]]+)\]\((?:https?:\/\/[^)]+|\/\S+)\)/g;

// Whitespace collapse.
const WHITESPACE_RE = /\s+/g;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Normalize text for TTS. Idempotent — calling twice is a no-op.
 * Returns "" for empty / whitespace-only input.
 */
export function normalizeForTTS(input: string, opts: NormalizeOpts = {}): string {
  if (typeof input !== 'string') return '';
  const maxChars = opts.maxChars ?? 5000;
  let text = input;

  // 1. Strip [tag:X] / [citation:N] tokens entirely.
  text = text.replace(TAG_TOKEN_RE, '');

  // 2. Strip markdown links first (otherwise the [text] inside looks like
  //    a tag-token to the TAG_TOKEN_RE).
  text = text.replace(MARKDOWN_LINK_RE, '$1');

  // 3. Markdown emphasis — keep content.
  text = text.replace(MARKDOWN_BOLD_RE, '$1');
  text = text.replace(MARKDOWN_ITALIC_RE, '$1$2');
  text = text.replace(MARKDOWN_CODE_RE, '$1');

  // 4. Replace URLs.
  text = text.replace(URL_RE, 'link omitido');

  // 5. Sacred symbols → phonetic.
  text = text.replace(SACRED_SYMBOL_PATTERN, (sym) => SACRED_SYMBOL_TABLE[sym] ?? sym);

  // 6. Whitespace collapse.
  text = text.replace(WHITESPACE_RE, ' ').trim();

  // 7. Defensive clamp (server also enforces).
  if (text.length > maxChars) {
    text = text.slice(0, maxChars).trim() + '…';
  }

  return text;
}

export interface NormalizeOpts {
  /** Max chars to return. Default 5000. */
  maxChars?: number;
}

/**
 * Split text into sentence-bounded chunks for streaming TTS. We do NOT
 * split mid-word. Boundary characters: `. `, `! `, `? `, newline,
 * and the end of the string. Returns empty array for empty input.
 *
 * Important: we apply the symbol + URL + tag normalizations FIRST but
 * preserve newlines so they can act as sentence boundaries. Whitespace
 * collapse happens AFTER the split, sentence-by-sentence.
 */
export function splitSentences(input: string): string[] {
  if (typeof input !== 'string' || input.length === 0) return [];

  // Step 1: prep normalization that preserves newlines.
  let text = input
    .replace(TAG_TOKEN_RE, '')
    .replace(MARKDOWN_LINK_RE, '$1')
    .replace(MARKDOWN_BOLD_RE, '$1')
    .replace(MARKDOWN_ITALIC_RE, '$1$2')
    .replace(MARKDOWN_CODE_RE, '$1')
    .replace(URL_RE, 'link omitido')
    .replace(SACRED_SYMBOL_PATTERN, (sym) => SACRED_SYMBOL_TABLE[sym] ?? sym);

  // Step 2: split on sentence boundaries (newlines + . ! ?).
  const re = /[^.!?\n]+(?:[.!?\n]+|$)/g;
  const out: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const sentence = match[0].replace(WHITESPACE_RE, ' ').trim();
    if (sentence.length > 0) out.push(sentence);
  }
  return out;
}

/**
 * Audit the normalizer — counts how many rules transformed a sample.
 * Used by the smoke harness.
 */
export function auditNormalization(
  input: string
): {
  input_length: number;
  output_length: number;
  stripped_tags: number;
  stripped_markdown: number;
  replaced_urls: number;
  replaced_symbols: number;
  had_clamp: boolean;
} {
  if (typeof input !== 'string') input = '';
  const tagMatches = input.match(TAG_TOKEN_RE);
  const mdBold = input.match(MARKDOWN_BOLD_RE);
  const mdItalic = input.match(MARKDOWN_ITALIC_RE);
  const mdCode = input.match(MARKDOWN_CODE_RE);
  const urls = input.match(URL_RE);
  const syms = input.match(SACRED_SYMBOL_PATTERN);

  const out = normalizeForTTS(input);
  return {
    input_length: input.length,
    output_length: out.length,
    stripped_tags: tagMatches?.length ?? 0,
    stripped_markdown: (mdBold?.length ?? 0) + (mdItalic?.length ?? 0) + (mdCode?.length ?? 0),
    replaced_urls: urls?.length ?? 0,
    replaced_symbols: syms?.length ?? 0,
    had_clamp: out.endsWith('…'),
  };
}

// Test-only export of the symbol table for the smoke harness.
export const __SACRED_SYMBOL_TABLE = SACRED_SYMBOL_TABLE;
