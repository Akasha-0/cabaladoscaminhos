/**
 * ============================================================================
 * TRENDING + VIRAL DETECTION — Cabala dos Caminhos (Wave 36)
 * ============================================================================
 *
 * Detecção de trending/viral baseado em engagement velocity
 * (views + reactions + comments per minute) e cross-posting (mesmo conteúdo
 * enviado por múltiplos usuários em janela curta).
 *
 * Aplicações:
 *   1. /comunidade/explore → trending posts (auto-mod review se score muito alto)
 *   2. Auto-flag de viral suspeito (possível scam coordenado)
 *   3. Anti-spam: cross-posting entre contas = coordinated inauthentic behavior
 *
 * Estado é in-memory para MVP; trocar por Redis sorted sets em produção.
 *
 * @see docs/MODERATION-AUTO-W36.md — viral detection + spike handling
 * ============================================================================
 */

// ============================================================================
// TYPES
// ============================================================================

export interface EngagementEvent {
  /** Tipo de engajamento */
  kind: 'view' | 'reaction' | 'comment' | 'share' | 'bookmark';
  /** ID do post */
  postId: string;
  /** ID do autor do engajamento (anonymous para views) */
  actorId: string | null;
  /** Timestamp */
  at: number;
}

export interface PostEngagementSummary {
  postId: string;
  authorId: string;
  totalViews: number;
  totalReactions: number;
  totalComments: number;
  totalShares: number;
  totalBookmarks: number;
  /** Janela 60s mais recente */
  last60s: { views: number; reactions: number; comments: number; shares: number; bookmarks: number };
  /** Janela 5 min */
  last5m: { views: number; reactions: number; comments: number; shares: number; bookmarks: number };
  /** Tempo desde o post (em minutos) */
  ageMin: number;
  /** Pontuação ponderada */
  trendingScore: number;
  /** Categoria */
  trendingBucket: 'fresh' | 'rising' | 'trending' | 'viral' | 'decay';
  /** Anomalia detectada */
  anomaly: AnomalySignal | null;
}

export interface AnomalySignal {
  type: 'viral_spike' | 'cross_posting' | 'coordinated_reactions' | 'view_bombing';
  /** Confiança 0..1 */
  confidence: number;
  /** Reason humanamente legível */
  reason: string;
  /** Sugestão de ação para auto-mod */
  suggestedAction: 'MONITOR' | 'FLAG' | 'HIDE';
}

// ============================================================================
// IN-MEMORY STATE
// ============================================================================

interface PostState {
  postId: string;
  authorId: string;
  createdAt: number;
  events: EngagementEvent[];
}

const POSTS = new Map<string, PostState>();

// Cross-posting detection: hash simples do texto → posts
const CONTENT_HASH_TO_POSTS = new Map<string, { postId: string; authorId: string; at: number }[]>();

const MAX_EVENTS_PER_POST = 500;
const EVENT_RETENTION_MS = 60 * 60 * 1000; // 1h
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

const CLEANUP = setInterval(() => {
  const now = Date.now();
  for (const [k, v] of POSTS.entries()) {
    v.events = v.events.filter((e) => now - e.at < EVENT_RETENTION_MS);
    if (now - v.createdAt > EVENT_RETENTION_MS && v.events.length === 0) {
      POSTS.delete(k);
    }
  }
  for (const [k, v] of CONTENT_HASH_TO_POSTS.entries()) {
    const fresh = v.filter((e) => now - e.at < EVENT_RETENTION_MS);
    if (fresh.length === 0) CONTENT_HASH_TO_POSTS.delete(k);
    else CONTENT_HASH_TO_POSTS.set(k, fresh);
  }
}, CLEANUP_INTERVAL_MS);
if (typeof CLEANUP.unref === 'function') CLEANUP.unref();

// ============================================================================
// CONTENT HASHING (para cross-posting)
// ============================================================================

/**
 * Hash simples de conteúdo normalizado. Não é crypto-seguro; é para
 * detecção de duplicatas.
 */
function hashContent(text: string): string {
  const normalized = text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .sort()
    .slice(0, 50) // 50 palavras mais significativas
    .join('|');

  // Simple hash (FNV-1a)
  let h = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i++) {
    h ^= normalized.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// ============================================================================
// TRACKING
// ============================================================================

/**
 * Registra um post criado. Chamado no momento da criação.
 */
export function trackPostCreated(postId: string, authorId: string, contentText: string): void {
  POSTS.set(postId, {
    postId,
    authorId,
    createdAt: Date.now(),
    events: [],
  });

  const hash = hashContent(contentText);
  if (!CONTENT_HASH_TO_POSTS.has(hash)) CONTENT_HASH_TO_POSTS.set(hash, []);
  CONTENT_HASH_TO_POSTS.get(hash)!.push({ postId, authorId, at: Date.now() });
}

/**
 * Registra um evento de engajamento.
 */
export function trackEngagement(event: EngagementEvent): void {
  let state = POSTS.get(event.postId);
  if (!state) {
    state = { postId: event.postId, authorId: 'unknown', createdAt: event.at, events: [] };
    POSTS.set(event.postId, state);
  }
  state.events.push(event);
  // Cap de retenção
  if (state.events.length > MAX_EVENTS_PER_POST) {
    state.events = state.events.slice(-MAX_EVENTS_PER_POST);
  }
}

// ============================================================================
// SCORING
// ============================================================================

function countInWindow(events: EngagementEvent[], windowMs: number): {
  views: number; reactions: number; comments: number; shares: number; bookmarks: number;
} {
  const now = Date.now();
  const out = { views: 0, reactions: 0, comments: 0, shares: 0, bookmarks: 0 };
  for (const e of events) {
    if (now - e.at > windowMs) continue;
    out[e.kind]++;
  }
  return out;
}

/**
 * Calcula o trending score combinando pesos + decay temporal.
 * Fórmula:
 *   score = (views * 0.1 + reactions * 2 + comments * 5 + shares * 8 + bookmarks * 3)
 *           * exp(-ageMin / 60)
 *
 * Onde exp(-ageMin / 60) dá decay de ~63% a cada hora.
 */
export function calculateTrendingScore(summary: PostEngagementSummary): number {
  const ageHours = summary.ageMin / 60;
  const decay = Math.exp(-ageHours);
  const base = (
    summary.totalViews * 0.1 +
    summary.totalReactions * 2 +
    summary.totalComments * 5 +
    summary.totalShares * 8 +
    summary.totalBookmarks * 3
  );
  return Number((base * decay).toFixed(3));
}

function bucketFor(score: number, ageMin: number): PostEngagementSummary['trendingBucket'] {
  if (ageMin < 5) return 'fresh';
  if (score < 50) return 'decay';
  if (score < 200) return 'rising';
  if (score < 1000) return 'trending';
  return 'viral';
}

// ============================================================================
// ANOMALY DETECTION
// ============================================================================

/**
 * Detecta cross-posting (mesmo conteúdo por múltiplos autores em janela curta).
 * Sinal clássico de coordinated inauthentic behavior ou copy-paste scam.
 */
export function detectCrossPosting(postId: string, text: string): AnomalySignal | null {
  const hash = hashContent(text);
  const entries = CONTENT_HASH_TO_POSTS.get(hash) ?? [];
  const distinctAuthors = new Set(entries.map((e) => e.authorId));
  if (entries.length >= 3 && distinctAuthors.size >= 2) {
    return {
      type: 'cross_posting',
      confidence: Math.min(1, entries.length / 10),
      reason: `Conteúdo duplicado em ${entries.length} posts de ${distinctAuthors.size} autores diferentes`,
      suggestedAction: entries.length >= 5 ? 'FLAG' : 'MONITOR',
    };
  }
  return null;
}

/**
 * Detecta coordinated reactions (muitos atores diferentes reagindo em janela curta).
 */
export function detectCoordinatedReactions(state: PostState): AnomalySignal | null {
  const now = Date.now();
  const window = 60_000; // 1 min
  const recentReactions = state.events.filter(
    (e) => e.kind === 'reaction' && now - e.at < window && e.actorId !== null
  );
  const distinctActors = new Set(recentReactions.map((e) => e.actorId!));
  if (recentReactions.length >= 10 && distinctActors.size >= 8) {
    return {
      type: 'coordinated_reactions',
      confidence: Math.min(1, recentReactions.length / 30),
      reason: `${recentReactions.length} reações de ${distinctActors.size} usuários em 60s`,
      suggestedAction: recentReactions.length >= 20 ? 'FLAG' : 'MONITOR',
    };
  }
  return null;
}

/**
 * Detecta view bombing (pico de views sem engajamento real — possível bot).
 */
export function detectViewBombing(state: PostState): AnomalySignal | null {
  const now = Date.now();
  const last5m = state.events.filter((e) => e.kind === 'view' && now - e.at < 5 * 60_000);
  const last5mEngage = state.events.filter(
    (e) => (e.kind === 'reaction' || e.kind === 'comment' || e.kind === 'share') && now - e.at < 5 * 60_000
  );

  if (last5m.length >= 50 && last5mEngage.length < 3) {
    return {
      type: 'view_bombing',
      confidence: Math.min(1, last5m.length / 200),
      reason: `${last5m.length} views com apenas ${last5mEngage.length} engajamentos em 5min`,
      suggestedAction: 'MONITOR',
    };
  }
  return null;
}

/**
 * Detecta spike viral (crescimento explosivo em janela curta).
 */
export function detectViralSpike(state: PostState): AnomalySignal | null {
  const last1m = countInWindow(state.events, 60_000);
  const total = state.events.length;
  if (total < 20) return null;

  const last1mWeight = last1m.views * 0.1 + last1m.reactions * 2 + last1m.comments * 5 + last1m.shares * 8;
  const totalWeight = (
    state.events.filter((e) => e.kind === 'view').length * 0.1 +
    state.events.filter((e) => e.kind === 'reaction').length * 2 +
    state.events.filter((e) => e.kind === 'comment').length * 5 +
    state.events.filter((e) => e.kind === 'share').length * 8
  );

  const recentShare = last1mWeight / Math.max(1, totalWeight);
  if (recentShare > 0.6 && last1mWeight > 30) {
    return {
      type: 'viral_spike',
      confidence: Number(Math.min(1, recentShare).toFixed(2)),
      reason: `Pico viral: ${(recentShare * 100).toFixed(0)}% do engajamento ocorreu no último minuto`,
      suggestedAction: last1mWeight > 200 ? 'FLAG' : 'MONITOR',
    };
  }
  return null;
}

function detectAnomaly(state: PostState, text: string): AnomalySignal | null {
  return (
    detectCrossPosting(state.postId, text) ||
    detectViralSpike(state) ||
    detectCoordinatedReactions(state) ||
    detectViewBombing(state)
  );
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Retorna resumo de engajamento + trending + anomalia de um post.
 */
export function getPostEngagementSummary(
  postId: string,
  textFallback?: string
): PostEngagementSummary | null {
  const state = POSTS.get(postId);
  if (!state) return null;

  const events = state.events;
  const total = {
    views: events.filter((e) => e.kind === 'view').length,
    reactions: events.filter((e) => e.kind === 'reaction').length,
    comments: events.filter((e) => e.kind === 'comment').length,
    shares: events.filter((e) => e.kind === 'share').length,
    bookmarks: events.filter((e) => e.kind === 'bookmark').length,
  };

  const last60s = countInWindow(events, 60_000);
  const last5m = countInWindow(events, 5 * 60_000);
  const ageMin = Math.max(0.1, (Date.now() - state.createdAt) / 60_000);

  const summary: PostEngagementSummary = {
    postId: state.postId,
    authorId: state.authorId,
    totalViews: total.views,
    totalReactions: total.reactions,
    totalComments: total.comments,
    totalShares: total.shares,
    totalBookmarks: total.bookmarks,
    last60s,
    last5m,
    ageMin,
    trendingScore: 0,
    trendingBucket: 'fresh',
    anomaly: null,
  };

  summary.trendingScore = calculateTrendingScore(summary);
  summary.trendingBucket = bucketFor(summary.trendingScore, ageMin);
  summary.anomaly = detectAnomaly(state, textFallback ?? '');

  return summary;
}

/**
 * Retorna top N posts trending.
 */
export function getTrendingPosts(limit = 20): PostEngagementSummary[] {
  const out: PostEngagementSummary[] = [];
  for (const state of POSTS.values()) {
    const s = getPostEngagementSummary(state.postId);
    if (s && s.trendingScore > 0) out.push(s);
  }
  out.sort((a, b) => b.trendingScore - a.trendingScore);
  return out.slice(0, limit);
}

/**
 * Lista posts com anomalia (para fila de revisão).
 */
export function getAnomalousPosts(limit = 50): PostEngagementSummary[] {
  const out: PostEngagementSummary[] = [];
  for (const state of POSTS.values()) {
    const s = getPostEngagementSummary(state.postId);
    if (s && s.anomaly) out.push(s);
  }
  out.sort((a, b) => (b.anomaly?.confidence ?? 0) - (a.anomaly?.confidence ?? 0));
  return out.slice(0, limit);
}

/**
 * Reset estado (apenas para testes).
 */
export function _resetTrendingStateForTests(): void {
  POSTS.clear();
  CONTENT_HASH_TO_POSTS.clear();
}