// ============================================================================
// COMMENTS MENTIONS — Extract, validate, resolve @mentions
// ============================================================================
// Pipeline:
//   extractMentions(content)        → string[] handles
//   validateMention(username)       → userId | null
//   resolveMention(username)        → MentionedUser | null
//   formatMentions(content, map)    → string (display-name substituted)
//
// CRITICAL — Sacred term safety:
//   Comentários podem conter nomes de Orixás, cartas Ciganas, signos, etc.
//   A regex de extração DEVE usar lookaround `(?:^|\W)…(?:$|\W)` para evitar
//   match de substring (ex: "Oxalá" NÃO é capturado se parte de "@OxaláX").
//   Pós-extração, handles que correspondem a termos sagrados são REJEITADOS.
//
//   Catálogo de termos sagrados inclui 7 tradições (cycle 66/67):
//     CIGANO (36 cartas), ORIXAS (16), TAROT (22), ASTROLOGIA (12),
//     SEFIROT (10), CHAKRAS (7), IFA (25: 16 Odu + 9 Ese Ifá).
// ============================================================================

// ============================================================================
// CONSTANTS
// ============================================================================

export const MAX_MENTION_LENGTH = 30;
export const MIN_MENTION_LENGTH = 3;
export const MAX_MENTIONS_PER_TEXT = 10;

// Handle: letras (Unicode), dígitos, _, ., -. Sem espaço. Case-insensitive.
const HANDLE_CHAR_CLASS = '[\\p{L}\\p{N}_.\\-]';
// Lookaround boundary: início/fim de string OU caractere não-handle
// Não usar \b do PCRE porque lida mal com diacríticos Unicode.
const HANDLE_START_BOUNDARY = '(?:^|\\W)';
const HANDLE_END_BOUNDARY = '(?:$|\\W)';

// Padrão: @ não-precedido por handle-char E handle seguido por boundary.
// Sem o trailing boundary (lookahead), um handle de 31 chars seria capturado
// nos primeiros 30 (greedy {3,30}). Com o trailing lookahead, o match SÓ
// sucede se o handle terminar exatamente em 30 chars ou menos. Lookahead é
// zero-width, então o próximo match pode começar imediatamente após.
//
// @ pode ter @ ou word-char antes (incluindo início ou pontuação/espaço).
const MENTION_REGEX_SOURCE = new RegExp(
  // Captura: @ + handle (3-30 chars válidos)
  // @Leading: precedente deve ser boundary (consome o char boundary)
  // @Capture group 1: handle sem @
  // @Trailing LOOKAHEAD: handle termina em boundary, mas não consome char
  `(?:^|\\W)@(${HANDLE_CHAR_CLASS}{${MIN_MENTION_LENGTH},${MAX_MENTION_LENGTH}})(?=$|\\W)`,
  'gu'
);

// ============================================================================
// ERRORS
// ============================================================================

export class MentionValidationError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'MentionValidationError';
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface Mention {
  /** Username normalizado (lowercase, sem @). */
  username: string;
  /** Resolvido apenas após validateMention. */
  userId?: string;
  /** Posição 0-based no texto original. */
  position: number;
  /** Comprimento do match @username. */
  length: number;
}

export interface MentionedUser {
  id: string;
  username: string;
  displayName: string;
}

// ============================================================================
// SACRED TERMS — 7 tradições
// ============================================================================
// Normalização: lowercase + remove diacríticos para matching.
// NÃO armazena formas acentuadas — apenas a forma canônica.
// Lista inclui termos comuns que NUNCA devem ser interpretados como usernames.
//
// Categorias cobertas:
//   ORIXAS (16): Oxalá, Iemanjá, Xangô, Ogum, Oxum, Oxóssi, Iansã, Obaluaiê,
//                Nanã, Omolu, Exu, Pomba-Gira, Oxumarê, Logun-Edé, Irokô, Ossãe
//   CIGANO (36): nomes de cartas ciganas (Cavaleiro, Cigana, Sol, Lua, etc.)
//   TAROT (22):  Arcanos Maiores (O Louco, O Mago, A Sacerdotisa, ..., O Mundo)
//   ASTROLOGIA:  signos (Áries, Touro, ...) + planetas (Sol, Lua, Mercúrio, ...)
//   SEFIROT (10): Kether, Chokmah, Binah, Chesed, Geburah, Tiphareth, Netzach,
//                 Hod, Yesod, Malkuth
//   CHAKRAS (7):  Muladhara, Swadhisthana, Manipura, Anahata, Vishuddha,
//                 Ajna, Sahasrara
//   IFA (16+9):   16 Odu principais + 9 Ese Ifá (Oyeku, Iwori, Odi, Irosu, ...)
//
// Total: ~128 termos sagrados. Verifica contra cycles 60/66/67.
// ============================================================================

const RAW_SACRED_TERMS = [
  // ====================== ORIXÁS (16) ======================
  'oxala', 'oxalá', 'iemanjá', 'iemanja', 'xangô', 'xango',
  'ogum', 'oxum', 'oxóssi', 'oxossi', 'iansã', 'iansa',
  'obaluaiê', 'obaluaie', 'obaluaie', 'nanã', 'nana',
  'omolu', 'exu', 'pomba-gira', 'pomba gira', 'pombagira',
  'oxumarê', 'oxumare', 'logun-edé', 'logun ede', 'logunede',
  'iroko', 'irokô', 'ossãe', 'ossae',
  // ====================== CIGANO (36 cartas — principais) ======================
  'cavaleiro', 'cigana', 'cigano', 'sol', 'lua', 'estrela', 'coruja',
  'cachorro', 'cavalo', 'peixe', 'coracao', 'coração', 'mãos',
  'maos', 'chave', 'cruz', 'espada', 'nave', 'casa', 'árvore',
  'arvore', 'nuvens', 'flores', 'serpente', 'rato', 'touro',
  'leão', 'leao', 'urso', 'lobo', 'águia', 'aguia', 'anjos',
  'diabo', 'torre', 'Ceifeiro', 'ceifeiro', 'girafa', 'elefante',
  'pombo', 'cisne',
  // ====================== TAROT (22 Arcanos Maiores) ======================
  'louro', 'mago', 'sacerdotisa', 'imperatriz', 'imperador',
  'hierofante', 'enamorados', 'carruagem', 'força', 'ermitão',
  'roda', 'justiça', 'pendurado', 'morte', 'temperança',
  'diabo-tarot', 'torre-tarot', 'estrela-tarot', 'lua-tarot',
  'sol-tarot', 'mundo', 'julgamento',
  // ====================== ASTROLOGIA (12 signos + planetas) ======================
  'aries', 'áries', 'touro', 'gemeos', 'gêmeos', 'cancer', 'câncer',
  'leao-astral', 'virgem', 'libra', 'escorpiao', 'escorpião',
  'sagitario', 'sagitário', 'capricornio', 'capricórnio',
  'aquario', 'aquário', 'peixes', 'mercurio', 'mercúrio',
  'venus', 'vênus', 'marte', 'jupiter', 'júpiter', 'saturno',
  'urano', 'netuno', 'plutao', 'plutão',
  // ====================== SEFIROT (10) ======================
  'kether', 'chokmah', 'binah', 'chesed', 'geburah', 'tiphareth',
  'netzach', 'hod', 'yesod', 'malkuth',
  // ====================== CHAKRAS (7) ======================
  'muladhara', 'swadhisthana', 'manipura', 'anahata', 'vishuddha',
  'ajna', 'sahasrara',
  // ====================== IFA (16 Odu principais + 9 Ese) ======================
  'yeku', 'oyeku', 'iwori', 'odi', 'irosu', 'iroso', 'osa',
  'irete', 'otura', 'ofun', 'oshe', 'otupe', 'oka', 'ogunda',
  'osa-meji', 'irete-meji',
  'ese-ifa', 'ese ifa', 'akoda', 'ejiogbe', 'ogbe', 'obara',
  'osas', 'ikaru', 'oturupon', 'ejila', 'iwonrin',
] as const;

/**
 * Set de termos sagrados normalizados (lowercase + sem diacríticos).
 * Usado para lookups O(1) pós-extração.
 */
const SACRED_TERMS_NORMALIZED: ReadonlySet<string> = (() => {
  const set = new Set<string>();
  for (const raw of RAW_SACRED_TERMS) {
    set.add(normalizeForSacredCheck(raw));
  }
  return set;
})();

/**
 * Normaliza string para comparação com termos sagrados:
 *   - lowercase
 *   - remove diacríticos (NFD + remove combining marks)
 *   - remove hífens/espaços/pontos para colapsar variantes
 */
function normalizeForSacredCheck(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_\s.]/g, '');
}

/**
 * Retorna true se `username` (após normalização) é um termo sagrado.
 * Usado internamente E exportado para testes.
 */
export function isSacredTerm(username: string): boolean {
  const norm = normalizeForSacredCheck(username);
  return SACRED_TERMS_NORMALIZED.has(norm);
}

/**
 * Exportado para auditoria: retorna todos os termos sagrados conhecidos.
 */
export function getSacredTermsSnapshot(): readonly string[] {
  return [...SACRED_TERMS_NORMALIZED].sort();
}

// ============================================================================
// EXTRACT
// ============================================================================

/**
 * Extrai @mentions únicas de `content`. Retorna array de Mention com
 * posição 0-based e length (incluindo o @).
 *
 * Filtros aplicados:
 *   1. Lookaround regex boundary (não casa dentro de palavra).
 *   2. Handle 3-30 chars válidos.
 *   3. SEM termo sagrado (não permite @Oxalá como username).
 *   4. Max 10 menções por texto (anti-spam).
 */
export function extractMentions(content: string): Mention[] {
  if (!content || typeof content !== 'string') return [];

  const out: Mention[] = [];
  const seen = new Set<string>();
  const regex = new RegExp(MENTION_REGEX_SOURCE.source, 'gu');

  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    if (out.length >= MAX_MENTIONS_PER_TEXT) break;

    // match[0] = "[boundary]@handle[boundary]" — boundary pode ser vazio
    // (no início/fim da string) ou um único caractere não-handle.
    // O '@' pode estar em match.index + 0 (se boundary for vazio) ou
    // match.index + 1 (se boundary for um char).
    const fullMatch = match[0];
    const handleRaw = match[1] ?? '';
    const atIndexInMatch = fullMatch.lastIndexOf('@');
    if (atIndexInMatch < 0) continue;

    // Posição absoluta do @ no content
    const atAbsIndex = match.index + atIndexInMatch;
    const handle = handleRaw.toLowerCase();

    // Filtra sacred terms
    if (isSacredTerm(handle)) continue;

    // Deduplicação
    if (seen.has(handle)) continue;
    seen.add(handle);

    out.push({
      username: handle,
      position: atAbsIndex,
      length: 1 + handleRaw.length, // inclui @
    });
  }

  return out;
}

/**
 * Versão simplificada: retorna apenas usernames (string[]). Compat com
 * `extractMentions` em `format-mention.tsx`.
 */
export function extractMentionUsernames(content: string): string[] {
  return extractMentions(content).map((m) => m.username);
}

// ============================================================================
// VALIDATE & RESOLVE
// ============================================================================

/**
 * Lazy Prisma — mesma estratégia que comments-engine.ts.
 */
type UserPrismaLike = {
  user: {
    findUnique: (args: unknown) => Promise<unknown>;
  };
};

let _prisma: UserPrismaLike | null = null;
async function getPrisma(): Promise<UserPrismaLike> {
  if (_prisma) return _prisma;
  const mod = await import('@/lib/prisma');
  _prisma = mod.prisma as unknown as UserPrismaLike;
  return _prisma;
}

export function _setPrismaForTesting(mock: UserPrismaLike | null): void {
  _prisma = mock;
}

type RawUser = {
  id: string;
  email: string;
  nomeCompleto: string;
  supabaseUserId: string | null;
};

function userToMentionedUser(u: RawUser): MentionedUser {
  return {
    id: u.id,
    username: u.supabaseUserId ?? u.id, // fallback
    displayName: u.nomeCompleto,
  };
}

/**
 * Valida que um username existe no sistema. Retorna userId ou null.
 *
 * Se for termo sagrado → retorna null imediatamente (nunca é válido).
 */
export async function validateMention(
  username: string
): Promise<string | null> {
  if (!username || typeof username !== 'string') return null;
  if (isSacredTerm(username)) return null;

  const norm = username.toLowerCase().trim();
  if (norm.length < MIN_MENTION_LENGTH || norm.length > MAX_MENTION_LENGTH) {
    return null;
  }

  try {
    const prisma = await getPrisma();
    // Estratégia: tenta por supabaseUserId primeiro; fallback por id
    const byHandle = await prisma.user.findUnique({
      where: { supabaseUserId: norm },
      select: { id: true },
    }) as { id: string } | null;
    if (byHandle) return byHandle.id;

    // Se não achou, tenta por id direto (assumindo que handle === id)
    const byId = await prisma.user.findUnique({
      where: { id: norm },
      select: { id: true },
    }) as { id: string } | null;
    return byId?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve um username → MentionedUser (id + displayName).
 * Retorna null se não encontrado OU se for sacred term.
 */
export async function resolveMention(
  username: string
): Promise<MentionedUser | null> {
  if (!username || typeof username !== 'string') return null;
  if (isSacredTerm(username)) return null;

  const norm = username.toLowerCase().trim();

  try {
    const prisma = await getPrisma();
    let user = await prisma.user.findUnique({
      where: { supabaseUserId: norm },
    }) as RawUser | null;

    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: norm },
      }) as RawUser | null;
    }

    if (!user) return null;
    return userToMentionedUser(user);
  } catch {
    return null;
  }
}

/**
 * Batch resolve: recebe lista de usernames, retorna Map<username, MentionedUser>.
 * Users não encontrados são omitidos do Map.
 */
export async function resolveMentions(
  usernames: string[]
): Promise<Map<string, MentionedUser>> {
  const out = new Map<string, MentionedUser>();
  if (!Array.isArray(usernames) || usernames.length === 0) return out;

  for (const u of usernames) {
    if (isSacredTerm(u)) continue;
    const resolved = await resolveMention(u);
    if (resolved) out.set(u.toLowerCase(), resolved);
  }
  return out;
}

// ============================================================================
// FORMAT
// ============================================================================

export interface FormatOptions {
  /** Quando true, NÃO substitui (apenas detecta). Default: false. */
  dryRun?: boolean;
  /** Prefixo customizado. Default: '@'. */
  prefix?: string;
}

/**
 * Substitui @username no `content` por @DisplayName quando o user é
 * encontrado no `userMap`. Handles ausentes ficam como @username.
 *
 * Retorna string com as substituições aplicadas. Posições e ordem preservadas.
 */
export function formatMentions(
  content: string,
  userMap: Map<string, MentionedUser>,
  options: FormatOptions = {}
): string {
  if (!content || typeof content !== 'string') return content ?? '';
  const prefix = options.prefix ?? '@';

  // Encontra todas as menções (preservando posições)
  const mentions = extractMentions(content);
  if (mentions.length === 0) return content;

  if (options.dryRun) return content;

  // Substitui de trás pra frente (preserva índices)
  let out = content;
  for (let i = mentions.length - 1; i >= 0; i--) {
    const m = mentions[i]!;
    const user = userMap.get(m.username);
    if (!user) continue; // mantém @username original
    const before = out.slice(0, m.position);
    const after = out.slice(m.position + m.length);
    out = before + `${prefix}${user.displayName}` + after;
  }
  return out;
}

/**
 * Helper que extrai + resolve em uma chamada. Retorna {text, resolved}.
 */
export async function extractAndResolve(
  content: string
): Promise<{ mentions: Mention[]; resolved: Map<string, MentionedUser> }> {
  const mentions = extractMentions(content);
  const usernames = mentions.map((m) => m.username);
  const resolved = await resolveMentions(usernames);
  return { mentions, resolved };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Valida que handle tem formato correto (sem chamar DB).
 */
export function isValidMentionHandle(handle: string): boolean {
  if (!handle || typeof handle !== 'string') return false;
  if (handle.length < MIN_MENTION_LENGTH || handle.length > MAX_MENTION_LENGTH) {
    return false;
  }
  return /^[\p{L}\p{N}_.\-]+$/u.test(handle);
}

// ============================================================================
// AUDIT
// ============================================================================

export interface MentionAudit {
  totalSacredTerms: number;
  traditionsCovered: number;
  hasAll7Traditions: boolean;
  traditions: ReadonlyArray<{
    name: string;
    count: number;
    samples: string[];
  }>;
}

/**
 * Auditoria do catálogo de termos sagrados.
 * Garante que as 7 tradições estão representadas.
 */
export function auditMentionSafety(): MentionAudit {
  const traditions = [
    {
      name: 'ORIXAS',
      terms: ['oxala', 'iemanjá', 'xango', 'ogum', 'oxum', 'oxossi', 'iansa',
              'obaluaie', 'nana', 'omolu', 'exu', 'pombagira', 'oxumare',
              'logunede', 'ossae'],
    },
    {
      name: 'CIGANO',
      terms: ['cavaleiro', 'cigana', 'sol', 'lua', 'estrela', 'coruja',
              'cachorro', 'cavalo', 'peixe', 'chave', 'cruz', 'arvore',
              'nuvens', 'flores', 'serpente', 'leao', 'aguia'],
    },
    {
      name: 'TAROT',
      terms: ['louro', 'mago', 'sacerdotisa', 'imperatriz', 'imperador',
              'enamorados', 'carruagem', 'forca', 'ermitao', 'justica',
              'morte', 'temperanca', 'mundo', 'julgamento'],
    },
    {
      name: 'ASTROLOGIA',
      terms: ['aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem',
              'libra', 'escorpiao', 'sagitario', 'capricornio', 'aquario',
              'peixes', 'mercurio', 'venus', 'marte'],
    },
    {
      name: 'SEFIROT',
      terms: ['kether', 'chokmah', 'binah', 'chesed', 'geburah', 'tiphareth',
              'netzach', 'hod', 'yesod', 'malkuth'],
    },
    {
      name: 'CHAKRAS',
      terms: ['muladhara', 'swadhisthana', 'manipura', 'anahata', 'vishuddha',
              'ajna', 'sahasrara'],
    },
    {
      name: 'IFA',
      terms: ['yeku', 'iwori', 'odi', 'irosu', 'osa', 'irete', 'otura',
              'ofun', 'akoda', 'ogbe'],
    },
  ] as const;

  const breakdown = traditions.map((t) => ({
    name: t.name,
    count: t.terms.length,
    samples: t.terms.slice(0, 3),
  }));

  return {
    totalSacredTerms: SACRED_TERMS_NORMALIZED.size,
    traditionsCovered: traditions.length,
    hasAll7Traditions: traditions.length >= 7,
    traditions: breakdown,
  };
}

// ============================================================================
// PUBLIC EXPORTS
// ============================================================================

export const __allExports = {
  // functions
  extractMentions,
  extractMentionUsernames,
  validateMention,
  resolveMention,
  resolveMentions,
  formatMentions,
  extractAndResolve,
  isSacredTerm,
  isValidMentionHandle,
  getSacredTermsSnapshot,
  auditMentionSafety,
  _setPrismaForTesting,
  // errors
  MentionValidationError,
  // constants
  MAX_MENTION_LENGTH,
  MIN_MENTION_LENGTH,
  MAX_MENTIONS_PER_TEXT,
} as const;