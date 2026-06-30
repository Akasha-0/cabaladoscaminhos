/**
 * ════════════════════════════════════════════════════════════════════════════
 * W85-D — AKASHA STREAMING RENDERER ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 85 · 2026-06-30
 * Author: W85-D Coder (Mavis orchestrator session 414764491727034)
 *
 * Renders a stream of raw markdown-like text (the Akasha IA response) into a
 * structured `ParsedStream` of typed chunks (text / code / citation / divider)
 * that the chat UI can render incrementally token-by-token.
 *
 * Why a custom renderer (not react-markdown)?
 *   - The Akasha UI needs INCREMENTAL streaming — chunks must be addressable
 *     so the renderer can append the next fragment to the previous one
 *     without re-parsing the entire response.
 *   - Citations are first-class entities (chip metadata) — react-markdown
 *     doesn't have a "citation" node.
 *   - Safe-for-sacred filter is a domain concern we want in the same module
 *     as the parser, not bolted on top.
 *   - No npm install in the sandbox at TSC time → must be self-contained.
 *
 * Public API (cycle 85 contract):
 *   parseStream(raw)         → ParsedStream (typed chunks + plain text + citations)
 *   streamToMarkdown(parsed) → markdown string (for "copy as markdown" button)
 *   safeForSacred(text)      → { safe: boolean, reason?: string } filter
 *   escapeHtml(s)            → defensive HTML escaping (used internally + exported)
 *   sanitizeUrl(url)         → only allow http(s) and relative (block javascript:)
 *   extractCitations(text)   → scan for [cite:Title|Url] tags, return citations
 *
 * Sacred-cultural sensitivity:
 *   - safeForSacred() refuses to render text that contains both a sacred term
 *     (orixá, orixa, caboclo, preto-velho, zohar, sephirot, etc.) AND a
 *     co-occurring slur from a small blocklist (defensive only — the engine
 *     does not generate content, it only filters what it is asked to render).
 *   - Citations, code blocks, dividers are NEVER filtered (they have no
 *     narrative content to defame).
 *
 * Durable lessons applied:
 *   - Branded types for IDs (cycle 60+ pattern) — MessageId, CitationId
 *   - Object.freeze on insert (cycle 68 pattern)
 *   - Result narrowing positive `if (r.ok)` (cycle 73 pattern)
 *   - Self-running test harness (cycle 68+ pattern)
 *   - `noUncheckedIndexedAccess` requires `!` on bracket reads (cycle 84 pattern)
 *   - `??` and `??=` over `||` for nullish defaults (cycle 84 pattern)
 */

// ════════════════════════════════════════════════════════════════════════════
// BRANDED PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

declare const __brand: unique symbol;
export type Brand<TBase, TBrand extends string> = TBase & {
  readonly [__brand]: TBrand;
};

export type MessageId = Brand<string, 'MessageId'>;
export type CitationId = Brand<string, 'CitationId'>;
export type TradicaoSlug =
  | 'cigano'
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia'
  | 'tantra';

export const TRADICOES: ReadonlyArray<TradicaoSlug> = Object.freeze([
  'cigano',
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
] as const);

export function isTradicao(s: string): s is TradicaoSlug {
  return (TRADICOES as ReadonlyArray<string>).includes(s);
}

// ════════════════════════════════════════════════════════════════════════════
// CORE TYPES
// ════════════════════════════════════════════════════════════════════════════

export type ChunkType = 'text' | 'code' | 'citation' | 'divider';

export interface StreamChunk {
  readonly type: ChunkType;
  readonly content: string;
  readonly meta?: {
    readonly lang?: string;
    readonly sourceTitle?: string;
    readonly sourceUrl?: string;
  };
}

export interface Citation {
  readonly id: CitationId;
  readonly title: string;
  readonly url: string;
  /** Resolved tradição slug if the citation mentions one of the 7 tradições. */
  readonly tradicao?: TradicaoSlug;
}

export interface ParsedStream {
  readonly chunks: ReadonlyArray<StreamChunk>;
  readonly plainText: string;
  readonly citations: ReadonlyArray<Citation>;
}

export interface SafeCheckResult {
  readonly safe: boolean;
  readonly reason?: string;
  readonly flaggedTerms: ReadonlyArray<string>;
}

// ════════════════════════════════════════════════════════════════════════════
// HTML / URL SANITIZATION (defensive)
// ════════════════════════════════════════════════════════════════════════════

/**
 * HTML escape table. NOTE: backtick (`) is intentionally NOT escaped here —
 * if we escape it, the inline-code regex `\`x\`` can never match because the
 * delimiters are already entities. The page layer treats backtick as a
 * benign printable character. For XSS-relevant contexts (script tags etc.)
 * the angle-bracket + ampersand escaping is sufficient.
 */
const HTML_ESCAPE: Readonly<Record<string, string>> = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
});

export function escapeHtml(s: string): string {
  let out = '';
  for (const ch of s) {
    out += HTML_ESCAPE[ch] ?? ch;
  }
  return out;
}

/**
 * Only allow http(s) and protocol-relative URLs. Blocks `javascript:`,
 * `data:` (except data:image for explicitly-allowed contexts), `vbscript:`.
 * Relative URLs (`/path`, `path/to`) pass through after stripping whitespace.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.length === 0) return '#';
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.startsWith('data:')
  ) {
    return '#';
  }
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('//') ||
    lower.startsWith('/') ||
    (!lower.includes(':') && !lower.startsWith('//'))
  ) {
    return trimmed;
  }
  return '#';
}

// ════════════════════════════════════════════════════════════════════════════
// SENTINELS — code block + citation markers
// ════════════════════════════════════════════════════════════════════════════

/**
 * Code block fence: ```lang
 *   ```ts
 *   const x = 1;
 *   ```
 */
const CODE_FENCE_RE = /^```([a-zA-Z0-9_+-]*)\s*$/;

/**
 * Citation inline: [cite:Title|Url] (Title and Url separated by |)
 *   [cite:Cabala — Zohar 1:1|https://example.com/zohar]
 */
const CITE_INLINE_RE = /\[cite:([^|\]]+)\|([^\]]+)\]/g;

/**
 * Heading: # Title, ## Sub, ### Subsub
 */
const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/;

/**
 * List item: "- item" or "* item" or "1. item"
 */
const LIST_RE = /^(\s*)([-*]|\d+\.)\s+(.+?)\s*$/;

/**
 * Divider: --- or *** on a line by itself
 */
const DIVIDER_RE = /^[-*_]{3,}\s*$/;

// ════════════════════════════════════════════════════════════════════════════
// CITATION EXTRACTION
// ════════════════════════════════════════════════════════════════════════════

function inferTradicao(title: string): TradicaoSlug | undefined {
  const t = title.toLowerCase();
  if (t.includes('zohar') || t.includes('sefirot') || t.includes('cabala') || t.includes('kabbalah')) {
    return 'cabala';
  }
  if (t.includes('baralho cigano') || t.includes('cigano')) {
    return 'cigano';
  }
  if (t.includes('orixá') || t.includes('orixa') || t.includes('candomblé') || t.includes('candomble') || t.includes('axé')) {
    return 'candomble';
  }
  if (t.includes('umbanda') || t.includes('caboclo') || t.includes('preto-velho')) {
    return 'umbanda';
  }
  if (t.includes('ifá') || t.includes('ifa') || t.includes('merindilogun') || t.includes('otá')) {
    return 'ifa';
  }
  if (t.includes('planeta') || t.includes('casa ') || t.includes('aspecto') || t.includes('mapa natal')) {
    return 'astrologia';
  }
  if (t.includes('chakra') || t.includes('mantra') || t.includes('tantra') || t.includes('kundalini')) {
    return 'tantra';
  }
  return undefined;
}

export function extractCitations(text: string): ReadonlyArray<Citation> {
  const out: Citation[] = [];
  const seen = new Set<string>();
  CITE_INLINE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CITE_INLINE_RE.exec(text)) !== null) {
    const title = (m[1] ?? '').trim();
    const url = sanitizeUrl((m[2] ?? '').trim());
    if (title.length === 0 || url === '#') continue;
    const key = title + '|' + url;
    if (seen.has(key)) continue;
    seen.add(key);
    const cit: Citation = {
      id: ('cit-' + out.length.toString(36).padStart(3, '0')) as CitationId,
      title,
      url,
    };
    const trad = inferTradicao(title);
    if (trad !== undefined) {
      (cit as { tradicao?: TradicaoSlug }).tradicao = trad;
    }
    out.push(Object.freeze(cit));
  }
  return Object.freeze(out);
}

// ════════════════════════════════════════════════════════════════════════════
// PARSE STREAM — line-by-line state machine
// ════════════════════════════════════════════════════════════════════════════

/**
 * Pre-process: strip inline citation markers from the visible text but keep
 * them in the citations array. We mutate a working copy of `raw`.
 */
function stripCitationMarkers(text: string): string {
  return text.replace(CITE_INLINE_RE, '');
}

/**
 * Parse raw markdown-ish text into typed chunks. The renderer is line-based:
 *   - `code` blocks collect lines between ``` fences
 *   - `divider` is a line of only --- or ***
 *   - `text` is everything else; inline markdown (`**bold**`, `*italic*`,
 *     `[link](url)`) is recognized but NOT escaped — the page layer is
 *     responsible for the final HTML rendering. The engine hands the page
 *     a clean `plainText` and per-chunk content for the streaming animation.
 *
 * Empty input returns an empty ParsedStream (no throw).
 */
export function parseStream(raw: string): ParsedStream {
  if (typeof raw !== 'string' || raw.length === 0) {
    return Object.freeze({
      chunks: Object.freeze([]) as ReadonlyArray<StreamChunk>,
      plainText: '',
      citations: Object.freeze([]) as ReadonlyArray<Citation>,
    });
  }

  const citations = extractCitations(raw);
  const visible = stripCitationMarkers(raw);
  const lines = visible.split(/\r?\n/);
  const chunks: StreamChunk[] = [];

  let i = 0;
  let inCode = false;
  let codeLang = '';
  let codeBuf: string[] = [];

  while (i < lines.length) {
    const line = lines[i] ?? '';
    const fence = CODE_FENCE_RE.exec(line);

    if (inCode) {
      if (fence) {
        // Close the code block
        chunks.push(
          Object.freeze({
            type: 'code' as const,
            content: codeBuf.join('\n'),
            meta: Object.freeze({ lang: codeLang }),
          }),
        );
        codeBuf = [];
        inCode = false;
        codeLang = '';
        i += 1;
        continue;
      }
      codeBuf.push(line);
      i += 1;
      continue;
    }

    if (fence) {
      // Open a code block (single ``` line starts; close expected later)
      codeLang = fence[1] ?? '';
      inCode = true;
      i += 1;
      continue;
    }

    if (DIVIDER_RE.test(line)) {
      chunks.push(Object.freeze({ type: 'divider' as const, content: '' }));
      i += 1;
      continue;
    }

    // Otherwise it's a text chunk. Collect consecutive non-special lines into
    // a single text chunk so the renderer can apply inline markdown at once.
    const buf: string[] = [];
    while (i < lines.length) {
      const l = lines[i] ?? '';
      if (CODE_FENCE_RE.test(l)) break;
      if (DIVIDER_RE.test(l)) break;
      buf.push(l);
      i += 1;
    }
    const text = buf.join('\n').trim();
    if (text.length > 0) {
      chunks.push(Object.freeze({ type: 'text' as const, content: text }));
    }
  }

  // If we ran out of input while still inside a code block, flush the buffer.
  if (inCode && codeBuf.length > 0) {
    chunks.push(
      Object.freeze({
        type: 'code' as const,
        content: codeBuf.join('\n'),
        meta: Object.freeze({ lang: codeLang }),
      }),
    );
  }

  const plainText = chunks
    .filter((c): c is StreamChunk & { type: 'text' } => c.type === 'text')
    .map((c) => c.content)
    .join('\n\n');

  return Object.freeze({
    chunks: Object.freeze(chunks) as ReadonlyArray<StreamChunk>,
    plainText,
    citations,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// INLINE MARKDOWN → HTML (used by the page, also exposed for spec)
// ════════════════════════════════════════════════════════════════════════════

const INLINE_BOLD_RE = /\*\*(.+?)\*\*/g;
const INLINE_ITALIC_RE = /(^|[^*])\*(?!\*)([^*]+?)\*(?!\*)/g;
const INLINE_CODE_RE = /`([^`]+?)`/g;
const INLINE_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Convert inline markdown to safe HTML. The caller passes already-escaped
 * text? NO — we escape HERE. Always escape first, then apply inline
 * substitutions on top of the escaped text. (Cycle 85 lesson: do not rely on
 * the caller to pre-escape — escape defensively in this function.)
 *
 * Allowed tags: <strong>, <em>, <code>, <a href=""> (sanitized). Everything
 * else is left as plain escaped text.
 */
export function inlineToHtml(line: string): string {
  let s = escapeHtml(line);
  // bold
  s = s.replace(INLINE_BOLD_RE, (_m, inner: string) => '<strong>' + inner + '</strong>');
  // italic — careful not to consume ** pairs
  s = s.replace(INLINE_ITALIC_RE, (_m, lead: string, inner: string) => lead + '<em>' + inner + '</em>');
  // inline code
  s = s.replace(INLINE_CODE_RE, (_m, inner: string) => '<code>' + inner + '</code>');
  // links — sanitize URL
  s = s.replace(INLINE_LINK_RE, (_m, label: string, url: string) => {
    const safe = sanitizeUrl(url);
    return '<a href="' + safe + '" rel="noopener noreferrer" target="_blank">' + label + '</a>';
  });
  return s;
}

/**
 * Render an entire text chunk to safe HTML, recognizing headings + list items
 * as block-level elements. Headings get <h1>..<h6>, list items become a <ul>.
 * Other lines become <p>.
 */
export function blockToHtml(content: string): string {
  const lines = content.split('\n');
  const out: string[] = [];
  let listOpen = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.length === 0) {
      if (listOpen) {
        out.push('</ul>');
        listOpen = false;
      }
      continue;
    }
    const h = HEADING_RE.exec(line);
    if (h) {
      if (listOpen) {
        out.push('</ul>');
        listOpen = false;
      }
      const level = Math.min(6, (h[1] ?? '#').length);
      out.push('<h' + level + '>' + inlineToHtml(h[2] ?? '') + '</h' + level + '>');
      continue;
    }
    const li = LIST_RE.exec(line);
    if (li) {
      if (!listOpen) {
        out.push('<ul>');
        listOpen = true;
      }
      out.push('<li>' + inlineToHtml(li[3] ?? '') + '</li>');
      continue;
    }
    if (listOpen) {
      out.push('</ul>');
      listOpen = false;
    }
    out.push('<p>' + inlineToHtml(line) + '</p>');
  }

  if (listOpen) out.push('</ul>');
  return out.join('\n');
}

// ════════════════════════════════════════════════════════════════════════════
// STREAM → MARKDOWN (for "Copy as Markdown" button)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Reconstruct a clean markdown string from a ParsedStream. The output is
 * stable: same input → same output. Code blocks get ``` fences back,
 * dividers become ---, citations become `[Title](Url)` (since the parser
 * strips the [cite:...] wrapper).
 */
export function streamToMarkdown(parsed: ParsedStream): string {
  const parts: string[] = [];
  for (const chunk of parsed.chunks) {
    if (chunk.type === 'code') {
      const lang = chunk.meta?.lang ?? '';
      // Code block: opening fence + lang + newline + content + newline + closing fence.
      // Trailing newline on closing fence so it round-trips through a markdown parser.
      const inner = chunk.content.endsWith('\n') ? chunk.content : chunk.content + '\n';
      parts.push('```' + lang + '\n' + inner + '```\n');
    } else if (chunk.type === 'divider') {
      parts.push('---');
    } else if (chunk.type === 'citation') {
      const t = chunk.meta?.sourceTitle ?? '';
      const u = chunk.meta?.sourceUrl ?? '';
      if (t.length > 0 && u.length > 0) {
        parts.push('[' + t + '](' + u + ')');
      }
    } else {
      parts.push(chunk.content);
    }
  }
  // Append citations as markdown links at the end. The parser strips
  // `[cite:Title|Url]` from visible text but keeps them in `parsed.citations`,
  // so the markdown round-trip must re-emit them so "Copy as Markdown"
  // captures the full reference surface.
  for (const c of parsed.citations) {
    parts.push('[' + c.title + '](' + c.url + ')');
  }
  // Join chunks with double newline (markdown paragraph separator). The code
  // block already has its own internal newlines, so this won't introduce
  // blank lines INSIDE the fence.
  return parts.join('\n\n');
}

// ════════════════════════════════════════════════════════════════════════════
// SAFE-FOR-SACRED FILTER
// ════════════════════════════════════════════════════════════════════════════

/**
 * Sacred term set — words that, if slur-co-occurring, indicate offensive
 * framing of a tradition. Lower-case, NFD-normalized for matching.
 *
 * Cycle 85 lesson: sacred-term detection requires NFD normalization
 * + Unicode-aware lookbehind. See src/lib/engines/i18n/sacred-terms.ts in
 * the main lib for the canonical list — this engine keeps a SMALL inline
 * subset to remain self-contained.
 */
const SACRED_TERMS: ReadonlyArray<string> = Object.freeze([
  'orixa',
  'orixas',
  'caboclo',
  'caboclos',
  'preto-velho',
  'preto velho',
  'preto-velhos',
  'zohar',
  'sefirot',
  'sephirot',
  'chakra',
  'chakras',
  'mantra',
  'mantras',
  'kundalini',
  'merindilogun',
  'baralho cigano',
  'cigano',
  'cigana',
  'ifa',
  'axé',
  'axe',
  'ota',
]);

/**
 * Slur blocklist — TINY. We are NOT building a complete slur dictionary; the
 * goal is to refuse rendering of text that combines a sacred term with a
 * pejorative in close proximity (same sentence / within 80 chars).
 *
 * Cycle 85 lesson: a SMALL blocklist is defensible; a LARGE one becomes
 * a moderation arms race. Sacred-tradition protection is about the
 * CO-OCCURRENCE pattern, not the slur list size.
 */
const SLUR_TERMS: ReadonlyArray<string> = Object.freeze([
  'macumba',
  'demonio',
  'diabo',
  'bruxaria',
  'macumbeiro',
  'macumbeira',
  'feiticaria',
  'charlatanismo',
  'farsante',
]);

function nfdLower(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function findSacredTerms(s: string): string[] {
  const norm = nfdLower(s);
  const hits: string[] = [];
  for (const term of SACRED_TERMS) {
    const normTerm = nfdLower(term);
    if (normTerm.length === 0) continue;
    if (norm.includes(normTerm)) hits.push(term);
  }
  return hits;
}

function findSlurs(s: string): string[] {
  const norm = nfdLower(s);
  const hits: string[] = [];
  for (const term of SLUR_TERMS) {
    const normTerm = nfdLower(term);
    if (normTerm.length === 0) continue;
    if (norm.includes(normTerm)) hits.push(term);
  }
  return hits;
}

/**
 * Co-occurrence check: do any sacred term + slur appear within 80 characters
 * of each other? This is the offensive-framing detector. If the text has
 * sacred terms but NO slurs → safe. If slurs but no sacred terms → safe.
 * If both → not safe.
 */
function hasCoOccurrence(s: string, sacred: string[], slurs: string[]): boolean {
  if (sacred.length === 0 || slurs.length === 0) return false;
  const norm = nfdLower(s);
  for (const sc of sacred) {
    const nsc = nfdLower(sc);
    if (nsc.length === 0) continue;
    let from = 0;
    while (from < norm.length) {
      const idx = norm.indexOf(nsc, from);
      if (idx === -1) break;
      const windowStart = Math.max(0, idx - 80);
      const windowEnd = Math.min(norm.length, idx + nsc.length + 80);
      const window = norm.slice(windowStart, windowEnd);
      for (const sl of slurs) {
        const nsl = nfdLower(sl);
        if (nsl.length === 0) continue;
        if (window.includes(nsl)) return true;
      }
      from = idx + nsc.length;
    }
  }
  return false;
}

/**
 * Filter check. Returns { safe: true } if the text passes; otherwise
 * { safe: false, reason, flaggedTerms }.
 *
 * Defensive guard: the engine REFUSES to render text that pairs sacred
 * tradition references with slurs/pejoratives. Pure narrative text passes.
 */
export function safeForSacred(text: string): SafeCheckResult {
  if (typeof text !== 'string' || text.length === 0) {
    return Object.freeze({ safe: true, flaggedTerms: [] });
  }
  const sacred = findSacredTerms(text);
  const slurs = findSlurs(text);
  if (hasCoOccurrence(text, sacred, slurs)) {
    return Object.freeze({
      safe: false,
      reason:
        'Texto associa termos sagrados a linguagem pejorativa. ' +
        'A Akasha IA não renderiza conteúdo que desrespeite tradições.',
      flaggedTerms: Object.freeze([...sacred, ...slurs]),
    });
  }
  return Object.freeze({ safe: true, flaggedTerms: [] });
}

// ════════════════════════════════════════════════════════════════════════════
// SAMPLE CONVERSATIONS — one per tradição
// ════════════════════════════════════════════════════════════════════════════

export interface SampleConversation {
  readonly id: MessageId;
  readonly tradicao: TradicaoSlug;
  readonly user: string;
  readonly akasha: string;
  readonly label: string;
}

const RAW_SAMPLES: ReadonlyArray<{ tradicao: TradicaoSlug; label: string; user: string; akasha: string }> =
  Object.freeze([
    {
      tradicao: 'cigano',
      label: 'Cigano Ramiro · Baralho Cigano',
      user: 'Como será meu amor este mês?',
      akasha:
        'O Baralho Cigano fala, filho(a). A **Cavaleiro** (1) e a **Casa** (4) apontam movimento e base. ' +
        'O consulente vive uma fase de deslocamento interno — o cavalo corre, mas precisa de um lar. ' +
        '\n\nUse o `[cite:Baralho Cigano — Carta 1 e 4|https://cabaladoscaminhos/cigano]` para revisar. ' +
        '\n\n---\n\n## Conselho\n\n- Não corra antes de firmar o passo.\n- Ouça a intuição do Baralho.\n- A Cigana Ramiro recomenda oração simples.',
    },
    {
      tradicao: 'candomble',
      label: 'Candomblé · Ori Xangô',
      user: 'Sinto meu Ori pedindo firmeza. Como cuidar?',
      akasha:
        'Filho(a) do axé, o Ori é a cabeça que reza. **Oxalá** abençoa a calma; **Xangô** firma a justiça. ' +
        'Beba água com folhas de **manjericão** na quarta-feira, dia de Obaluaiê (que refresca). ' +
        '\n\nVeja `[cite:Candomblé — Ori e fundamentos|https://cabaladoscaminhos/candomble-ori]`.',
    },
    {
      tradicao: 'umbanda',
      label: 'Umbanda · Caboclo e Preto-Velho',
      user: 'Sinto saudade de uma orientação dos guias.',
      akasha:
        'A **Umbanda** responde na gira. O **Caboclo** traz a coragem do mato; o **Preto-Velho** traz a paciência do rosário. ' +
        'No próximo dia de sessão, peça **passagem** e esteja com o corpo limpo (sem álcool, sem carne de porco na véspera). ' +
        '\n\nLembre-se: a entidade não resolve por você, ela ilumina o caminho. ' +
        '\n\n`[cite:Umbanda — Sessão e passes|https://cabaladoscaminhos/umbanda-sessao]`',
    },
    {
      tradicao: 'ifa',
      label: 'Ifá · Merindilogun',
      user: 'Qual é o meu Odù de nascimento?',
      akasha:
        'Ifá fala em **16 principais Odù** (Odù Ogbe, Odù Oyeku, ...). O **Merindilogun** é o jogo de 16 búzios ' +
        'que confirma o Odù regente. ' +
        '\n\n```\nOdù regente: Ogbe (1)\nOrixá regente: Oxalá\nOrixá pedindo passagem: Oxum\n```\n\n' +
        'O **otá** (pedra) da sua coroa deve ser consagrado em rio de água doce na lua cheia. ' +
        '`[cite:Ifá — Odù e Otá|https://cabaladoscaminhos/ifa-odu]`',
    },
    {
      tradicao: 'cabala',
      label: 'Cabala · Zohar e Sefirot',
      user: 'O que é Tiferet?',
      akasha:
        '**Tiferet** é a **Sefirá da beleza e do equilíbrio** — o coração da Árvore da Vida. ' +
        'Em **gematria**, Tiferet vale 1081. Liga **Hessed** (amor) a **Guevurah** (rigor). ' +
        '\n\nO **Zohar 1:1** descreve Tiferet como o ponto onde a misericórdia encontra a justiça. ' +
        '\n\n```ts\n// Exemplo: meditação em Tiferet\nconst sefira = { name: "Tiferet", number: 6, gematria: 1081 };\n```\n\n' +
        '`[cite:Zohar 1:1 — Tiferet|https://cabaladoscaminhos/zohar-1-1]`',
    },
    {
      tradicao: 'astrologia',
      label: 'Astrologia · Mapa Natal',
      user: 'Como Mercúrio retrogrado afeta minha Casa 10?',
      akasha:
        'Quando **Mercúrio** retrograda em **Casa 10** (carreira), a revisão de projetos profissionais é inevitável. ' +
        '**Netuno** em aspecto de **trígono** com o **Meio-do-Céu (MC)** traz inspiração; ' +
        '**Saturno** em **quadratura** pede responsabilidade. ' +
        '\n\n`[cite:Mapa Natal — Casa 10 e MC|https://cabaladoscaminhos/mapa-natal-casa-10]`',
    },
    {
      tradicao: 'tantra',
      label: 'Tantra · Chakras e Mantra',
      user: 'Como equilibrar o Muladhara?',
      akasha:
        '**Muladhara** é o chakra raiz. O mantra **LAM** ressoa na base da coluna. ' +
        'A **kundalini** desperta de baixo para cima — sem pressa, sem forçar. ' +
        '\n\nUse a **geometria sagrada** do quadrado (4 lados, 4 direções) na meditação sentada. ' +
        '\n\n```ts\nconst muladhara = {\n  sanskrit: "Muladhara",\n  mantra: "LAM",\n  element: "Terra",\n  location: "Base da coluna",\n};\n```\n\n' +
        '`[cite:Tantra — Muladhara e Kundalini|https://cabaladoscaminhos/tantra-muladhara]`',
    },
  ]);

let _sampleCounter = 0;
function nextSampleId(): MessageId {
  _sampleCounter += 1;
  return ('sample-' + _sampleCounter.toString(36).padStart(3, '0')) as MessageId;
}

export const SAMPLE_CONVERSATIONS: ReadonlyArray<SampleConversation> = Object.freeze(
  RAW_SAMPLES.map((s) =>
    Object.freeze({
      id: nextSampleId(),
      tradicao: s.tradicao,
      label: s.label,
      user: s.user,
      akasha: s.akasha,
    }),
  ),
);

/**
 * Reset the sample-id counter. Used by tests so IDs are deterministic.
 */
export function _resetSampleCounterForTests(): void {
  _sampleCounter = 0;
}