/**
 * ============================================================================
 * AUTO-MOD PIPELINE — Cabala dos Caminhos (Wave 36)
 * ============================================================================
 *
 * Pipeline de 5 estágios que decide automaticamente a ação de moderação
 * sobre um post, comentário ou mensagem.
 *
 *   Stage 1: Keyword filter        (banned-content.ts)
 *   Stage 2: Toxicity score         (lexicon-based, no external API)
 *   Stage 3: Spam detection         (URL shortener, external contact, shouting)
 *   Stage 4: Sacred-cultural check  (mercantilização + verificabilidade)
 *   Stage 5: Rate anomaly           (post burst > 5/min)
 *
 * **Saída:** APPROVE / FLAG / HIDE / REMOVE + reason + confidence
 * **Audit:** cada decisão registra os 5 estágios + deltas para auditoria.
 *
 * **LGPD:** este pipeline processa apenas o conteúdo submetido pelo próprio
 * usuário. Não consultamos histórico pessoal nem flags antigas sem consentimento.
 *
 * **Universalismo:** estágios 1, 2, 4 têm listas revisadas por Iyá.
 * Conteúdo tradicional legítimo (ex: "amarração" discutida em contexto
 * histórico) NÃO é bloqueado — apenas padrões mercantilistas (ex: amarração
 * + R$ na mesma frase).
 *
 * @see docs/MODERATION-AUTO-W36.md   — pipeline reference
 * @see src/lib/moderation/banned-content.ts
 * ============================================================================
 */

import {
  findBannedKeywords,
  findBannedPatterns,
  findSacredMercantilism,
  findSacredTerms,
  type BannedCategory,
} from './banned-content';
import { detectLanguage, type LanguageDetection } from './language-detect';

// ============================================================================
// TYPES
// ============================================================================

export type ModerationDecision =
  | 'APPROVE'
  | 'FLAG' // → fila de revisão humana
  | 'HIDE' // → some do feed público, autor vê; revisor decide
  | 'REMOVE'; // → conteúdo bloqueado imediatamente + notifica autor

export type ModerationTargetType =
  | 'POST'
  | 'COMMENT'
  | 'MESSAGE'
  | 'ARTICLE'
  | 'PROFILE_BIO';

export interface ModerationInput {
  /** Tipo de conteúdo sendo avaliado */
  targetType: ModerationTargetType;
  /** ID do autor */
  authorId: string;
  /** Texto bruto submetido */
  text: string;
  /** URLs incluídas (extraídas por servidor) */
  urls?: string[];
  /** Anexos de imagem (URLs já hospedadas) */
  imageUrls?: string[];
  /** ID do conteúdo (post, comment, ...) — pode ser null antes de criar */
  targetId?: string;
  /** Tradição declarada (cabala, ifa, candomble, ...) — guia Stage 4 */
  tradition?: string;
}

export interface StageOutcome {
  stage: 1 | 2 | 3 | 4 | 5;
  name: string;
  /** Score 0..1 (1 = muito sinal) */
  score: number;
  /** Sinais acionados */
  signals: string[];
  /** Tempo de execução (ms) — auditoria de performance */
  durationMs: number;
  /** Erro durante a execução (não-bloqueante) */
  error?: string;
}

export interface ModerationResult {
  decision: ModerationDecision;
  /** Confiança da decisão automática (0..1) */
  confidence: number;
  /** Categoria primária do sinal */
  primaryReason: BannedCategory | 'OK' | 'RATE_ANOMALY' | 'TOXICITY';
  /** Razão humanamente legível */
  reasonText: string;
  /** Detalhamento por estágio */
  stages: StageOutcome[];
  /** Sinaliza se precisa revisão humana */
  needsHumanReview: boolean;
  /** Sugestão para o autor (se não-REMOVE) */
  authorHint?: string;
  /** Detecção de idioma (Wave 36-4) */
  language?: LanguageDetection;
  /** Quando o pipeline foi executado */
  evaluatedAt: string;
}

// ============================================================================
// IN-MEMORY RATE ANOMALY STATE (per user)
// ============================================================================

/**
 * Para produção: trocar por Redis (já temos ioredis instalado). Para o MVP,
 * este Map in-memory é suficiente e o cleanup automático evita memory leak.
 *
 * Cada user tem um array de timestamps de publicações (post/comment/article)
 * dentro de uma janela de 60s.
 */

interface RateState {
  timestamps: number[];
}

const RATE_STATE = new Map<string, RateState>();
const RATE_WINDOW_MS = 60_000; // 1 min
const RATE_THRESHOLD = 5; // > 5 publicações / min = anomalia

// Limpeza periódica — evita memory leak em processo longo.
const RATE_CLEANUP = setInterval(() => {
  const now = Date.now();
  for (const [k, v] of RATE_STATE.entries()) {
    const fresh = v.timestamps.filter((t) => now - t < RATE_WINDOW_MS * 2);
    if (fresh.length === 0) RATE_STATE.delete(k);
    else v.timestamps = fresh;
  }
}, 5 * 60_000);
if (typeof RATE_CLEANUP.unref === 'function') RATE_CLEANUP.unref();

function checkRateAnomaly(authorId: string): { isAnomaly: boolean; burstCount: number } {
  const now = Date.now();
  const state = RATE_STATE.get(authorId) ?? { timestamps: [] };
  state.timestamps = state.timestamps.filter((t) => now - t < RATE_WINDOW_MS);
  state.timestamps.push(now);
  RATE_STATE.set(authorId, state);
  return {
    isAnomaly: state.timestamps.length > RATE_THRESHOLD,
    burstCount: state.timestamps.length,
  };
}

// ============================================================================
// TOXICITY LEXICON (W36-2 Akasha Safety — escalado aqui)
// ============================================================================

/**
 * Toxicidade baseada em lexicon + heurística. NÃO chama Perspective API
 * (custo + latência + LGPD com transferência para Google).
 *
 * Heurística: contador de palavras tóxicas + amplificadores + negação
 * (negação ANULA toxicidade se a palavra está em contexto de fala sobre).
 *
 * Score final: 0..1. > 0.5 = toxic, > 0.7 = hide, > 0.9 = remove.
 */

const TOXIC_WORDS_PT = [
  // Agressão direta
  'idiota', 'burro', 'imbecil', 'estúpido', 'retardado', 'lixo', 'porcaria',
  'merda', 'caralho', 'puta', 'fdp', 'desgraça', 'nojo',
  // Desumanização
  'inútil', 'descartável', 'parasita', 'verme',
];

const TOXIC_WORDS_EN = [
  'idiot', 'stupid', 'dumb', 'moron', 'loser', 'trash', 'garbage',
  'useless', 'worthless', 'parasite', 'vermin',
];

const AMPLIFIERS = [
  'muito', 'completamente', 'totalmente', 'absolutamente', 'extremamente',
  'muito', 'super', 'ultra', 'really', 'totally', 'completely', 'extremely',
];

const NEGATIONS = [
  'não', 'nao', 'nunca', 'jamais', 'never', 'not', 'sem',
];

function scoreToxicity(text: string): number {
  const lower = text.toLowerCase();
  const tokens = lower.split(/\s+/);

  // Conta toxic words
  let toxic = 0;
  let amplified = 0;
  let negated = 0;

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i].replace(/[^\p{L}\p{N}]/gu, '');
    if (!tok) continue;

    const prev = tokens[i - 1] ?? '';
    const prevStripped = prev.replace(/[^\p{L}\p{N}]/gu, '');

    const isToxic = TOXIC_WORDS_PT.includes(tok) || TOXIC_WORDS_EN.includes(tok);
    if (!isToxic) continue;

    const isNegated = NEGATIONS.includes(prevStripped) ||
      (tokens[i - 2] && NEGATIONS.includes(tokens[i - 2].replace(/[^\p{L}\p{N}]/gu, '')));
    if (isNegated) { negated++; continue; }

    toxic++;
    if (AMPLIFIERS.includes(prevStripped) || AMPLIFIERS.includes(tok)) amplified++;
  }

  // Score: cada toxic word pesa 0.15, amplificador +0.05, com teto.
  let score = toxic * 0.15 + amplified * 0.05;
  // Negação reduz
  score -= negated * 0.10;
  // Shouting bonus
  const shoutingRatio = (text.match(/[A-Z]/g)?.length ?? 0) / Math.max(1, text.length);
  if (shoutingRatio > 0.5 && toxic > 0) score += 0.15;
  // All-caps word
  const hasCaps = /[A-Z]{4,}/.test(text);
  if (hasCaps && toxic > 0) score += 0.1;

  return Math.max(0, Math.min(1, score));
}

// ============================================================================
// STAGE 1 — KEYWORD FILTER
// ============================================================================

function runStage1Keyword(text: string): { score: number; signals: string[] } {
  const kwMatches = findBannedKeywords(text);
  const ptMatches = findBannedPatterns(text);

  const signals = [
    ...kwMatches.map((m) => `${m.category}:${m.matched}`),
    ...ptMatches.map((m) => `pattern:${m.reason}`),
  ];

  // Hate e scam = peso alto; spam = médio; sacred = baixo (precisa cruzar)
  let score = 0;
  for (const m of kwMatches) {
    score += m.category === 'hate' ? 0.45 :
      m.category === 'scam' ? 0.35 :
        m.category === 'spam' ? 0.20 : 0.15;
  }
  for (const m of ptMatches) {
    score += m.category === 'hate' ? 0.50 :
      m.category === 'scam' ? 0.40 :
        m.category === 'spam' ? 0.25 : 0.20;
  }
  return { score: Math.min(1, score), signals };
}

// ============================================================================
// STAGE 2 — TOXICITY
// ============================================================================

function runStage2Toxicity(text: string): { score: number; signals: string[] } {
  const score = scoreToxicity(text);
  const signals: string[] = [];
  if (score > 0) signals.push(`toxicity_score:${score.toFixed(2)}`);
  if (score > 0.9) signals.push('severe_toxicity');
  else if (score > 0.5) signals.push('elevated_toxicity');
  return { score, signals };
}

// ============================================================================
// STAGE 3 — SPAM DETECTION
// ============================================================================

function runStage3Spam(text: string, urls: string[] = []): { score: number; signals: string[] } {
  const signals: string[] = [];
  let score = 0;

  // URL shortener = suspeito
  const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd'];
  for (const u of urls) {
    for (const s of shorteners) {
      if (u.includes(s)) {
        signals.push(`url_shortener:${s}`);
        score += 0.30;
      }
    }
    if (/shopee|aliexpress|amazon\.com\/dp|aliexpress\.com\/item/i.test(u)) {
      signals.push('marketplace_link');
      score += 0.20;
    }
  }

  // Repetição de caractere (ex: "!!!???")
  const repChar = /(.)\1{4,}/.test(text);
  if (repChar) { signals.push('repeated_chars'); score += 0.10; }

  // Excesso de emojis (>= 30% dos tokens)
  const emojiRatio = (text.match(/\p{Emoji}/gu)?.length ?? 0) / Math.max(1, text.length / 4);
  if (emojiRatio > 0.3) { signals.push('emoji_overload'); score += 0.15; }

  // Link externo ao final com CTA ("saiba mais", "clique aqui")
  if (urls.length > 0 && /(saiba mais|clique aqui|click here|see more)/i.test(text)) {
    signals.push('cta_with_link');
    score += 0.25;
  }

  // Texto todo em caps com muitas exclamações
  const capsExclaim = /^[A-Z\s!?.]{20,}$/m.test(text);
  if (capsExclaim) { signals.push('caps_block'); score += 0.20; }

  return { score: Math.min(1, score), signals };
}

// ============================================================================
// STAGE 4 — SACRED-CULTURAL CHECK
// ============================================================================

function runStage4Sacred(text: string, tradition?: string): { score: number; signals: string[] } {
  const signals: string[] = [];
  let score = 0;

  // 4a. Mercantilização de termos sagrados
  const merc = findSacredMercantilism(text);
  if (merc.length > 0) {
    signals.push(`sacred_mercantilism:${merc[0]!.term}`);
    score += 0.4 * Math.min(3, merc.length);
  }

  // 4b. Conteúdo verificável (tradições exigem fonte para afirmações de cura)
  const claimPatterns = [
    /cur[ae]\s+(cancer|cânc|diabete|autismo|depress)/i,
    /tratamento\s+definitivo/i,
    /garanto\s+\d+\s*%\s+de\s+(cura|eficácia)/i,
  ];
  for (const pat of claimPatterns) {
    if (pat.test(text)) { signals.push(`unverified_cure_claim:${pat.source}`); score += 0.40; }
  }

  // 4c. Declaração de afiliação a tradição sem consent (vulto falso de autoridade)
  const falseAuthority = /(eu\s+sou|m[eê]s[ao])\s+(mestre|bruxo|bruxa|og[ãa]|pai\s+de\s+santo|mãe\s+de\s+santo|zelador)/i;
  if (falseAuthority.test(text) && /(aceito|procuro|clientes|consulta)/i.test(text)) {
    signals.push('false_authority_commercial');
    score += 0.30;
  }

  // 4d. Tradição declarada vs. conteúdo (sanity check — flag apenas, não bloqueia)
  if (tradition) {
    const sacredHits = findSacredTerms(text);
    if (sacredHits.length === 0) {
      // Sem termos sagrados + tradição declarada = pode ser OK (pergunta, dúvida)
      // Não pontua negativo.
    } else if (tradition === 'cabala' && /preto\s*velho|gira\s+de\s+caboclo/i.test(text)) {
      signals.push('tradition_mismatch:cabala');
      score += 0.20;
    }
  }

  return { score: Math.min(1, score), signals };
}

// ============================================================================
// STAGE 5 — RATE ANOMALY
// ============================================================================

function runStage5Rate(authorId: string): { score: number; signals: string[]; burst: number } {
  const { isAnomaly, burstCount } = checkRateAnomaly(authorId);
  const signals: string[] = [];
  if (isAnomaly) signals.push(`burst:${burstCount}_in_60s`);
  const score = isAnomaly ? 0.7 : 0;
  return { score, signals, burst: burstCount };
}

// ============================================================================
// DECISION AGGREGATION
// ============================================================================

/**
 * Converte os 5 scores em uma decisão final.
 * - Qualquer stage >= 0.9 → REMOVE (toxicidade severa ou hate explícito)
 * - Hate > 0.5 → REMOVE imediato
 * - Spam > 0.7 → HIDE
 * - Sacred-merc > 0.6 → FLAG (humano decide)
 * - Rate anomaly → FLAG
 * - Somatório > 0.8 → HIDE
 * - Caso contrário → APPROVE
 */
function aggregateDecision(stages: StageOutcome[]): {
  decision: ModerationDecision;
  confidence: number;
  primaryReason: ModerationResult['primaryReason'];
  reasonText: string;
} {
  const [s1, s2, s3, s4, s5] = stages;

  // Hard veto: hate
  const hateSignal = s1.signals.some((sig) => sig.startsWith('hate:'));
  if (hateSignal) {
    return {
      decision: 'REMOVE',
      confidence: 0.95,
      primaryReason: 'hate',
      reasonText: 'Discurso de ódio detectado. Conteúdo bloqueado automaticamente.',
    };
  }

  // Hard veto: severe toxicity
  if (s2.score >= 0.9) {
    return {
      decision: 'REMOVE',
      confidence: 0.9,
      primaryReason: 'TOXICITY',
      reasonText: 'Toxicidade severa. Conteúdo bloqueado automaticamente.',
    };
  }

  // Hard veto: scam crítico (carteira cripto + garantia absoluta)
  const hasCrypto = s1.signals.some((sig) => sig.startsWith('scam:bitcoin') || sig.startsWith('pattern:endereço'));
  const hasAbsoluteGuarantee = s1.signals.some((sig) => sig.includes('garantia absoluta') || sig.includes('ausência total de risco'));
  if (hasCrypto && hasAbsoluteGuarantee) {
    return {
      decision: 'REMOVE',
      confidence: 0.95,
      primaryReason: 'scam',
      reasonText: 'Padrão claro de golpe financeiro. Conteúdo bloqueado.',
    };
  }

  // Spammy → HIDE
  if (s3.score >= 0.7) {
    return {
      decision: 'HIDE',
      confidence: 0.8,
      primaryReason: 'spam',
      reasonText: 'Padrão de spam detectado. Conteúdo escondido do feed público.',
    };
  }

  // Sacred-mercantilism crítico → FLAG
  if (s4.score >= 0.6) {
    return {
      decision: 'FLAG',
      confidence: 0.7,
      primaryReason: 'sacred',
      reasonText: 'Possível mercantilização de termo sagrado. Encaminhado para revisão cultural.',
    };
  }

  // Rate anomaly → FLAG
  if (s5.score >= 0.7) {
    return {
      decision: 'FLAG',
      confidence: 0.7,
      primaryReason: 'RATE_ANOMALY',
      reasonText: 'Pico de publicações detectado. Encaminhado para revisão.',
    };
  }

  // Toxicidade elevada → FLAG
  if (s2.score >= 0.5) {
    return {
      decision: 'FLAG',
      confidence: 0.6,
      primaryReason: 'TOXICITY',
      reasonText: 'Toxicidade elevada. Encaminhado para revisão.',
    };
  }

  // Somatório ponderado
  const total = 0.30 * s1.score + 0.20 * s2.score + 0.20 * s3.score + 0.20 * s4.score + 0.10 * s5.score;
  if (total >= 0.6) {
    return {
      decision: 'FLAG',
      confidence: Number(total.toFixed(2)),
      primaryReason: s1.score > 0 ? 'spam' : s4.score > 0 ? 'sacred' : 'OK',
      reasonText: 'Sinais múltiplos detectados. Revisão manual recomendada.',
    };
  }

  if (total >= 0.3) {
    return {
      decision: 'APPROVE',
      confidence: 1 - total,
      primaryReason: 'OK',
      reasonText: 'Conteúdo aprovado com ressalvas menores. Monitoramento contínuo.',
    };
  }

  return {
    decision: 'APPROVE',
    confidence: 0.95,
    primaryReason: 'OK',
    reasonText: 'Conteúdo aprovado automaticamente.',
  };
}

// ============================================================================
// PUBLIC ENTRYPOINT
// ============================================================================

/**
 * Avalia um conteúdo e retorna a decisão + audit trail.
 *
 * @example
 * const result = await runAutoMod({
 *   targetType: 'POST',
 *   authorId: 'user_123',
 *   text: 'Clique aqui e ganhe dinheiro agora!!!',
 *   urls: ['https://bit.ly/abc'],
 * });
 * // → { decision: 'HIDE', primaryReason: 'spam', ... }
 */
export function runAutoMod(input: ModerationInput): ModerationResult {
  const evaluatedAt = new Date().toISOString();

  // ──────── STAGE 1 ────────
  const t1 = Date.now();
  let s1: StageOutcome;
  try {
    const { score, signals } = runStage1Keyword(input.text);
    s1 = { stage: 1, name: 'keyword_filter', score, signals, durationMs: Date.now() - t1 };
  } catch (e) {
    s1 = { stage: 1, name: 'keyword_filter', score: 0, signals: [], durationMs: 0, error: String(e) };
  }

  // ──────── STAGE 2 ────────
  const t2 = Date.now();
  let s2: StageOutcome;
  try {
    const { score, signals } = runStage2Toxicity(input.text);
    s2 = { stage: 2, name: 'toxicity_score', score, signals, durationMs: Date.now() - t2 };
  } catch (e) {
    s2 = { stage: 2, name: 'toxicity_score', score: 0, signals: [], durationMs: 0, error: String(e) };
  }

  // ──────── STAGE 3 ────────
  const t3 = Date.now();
  let s3: StageOutcome;
  try {
    const { score, signals } = runStage3Spam(input.text, input.urls);
    s3 = { stage: 3, name: 'spam_detection', score, signals, durationMs: Date.now() - t3 };
  } catch (e) {
    s3 = { stage: 3, name: 'spam_detection', score: 0, signals: [], durationMs: 0, error: String(e) };
  }

  // ──────── STAGE 4 ────────
  const t4 = Date.now();
  let s4: StageOutcome;
  try {
    const { score, signals } = runStage4Sacred(input.text, input.tradition);
    s4 = { stage: 4, name: 'sacred_cultural', score, signals, durationMs: Date.now() - t4 };
  } catch (e) {
    s4 = { stage: 4, name: 'sacred_cultural', score: 0, signals: [], durationMs: 0, error: String(e) };
  }

  // ──────── STAGE 5 ────────
  const t5 = Date.now();
  let s5: StageOutcome;
  try {
    const { score, signals } = runStage5Rate(input.authorId);
    s5 = { stage: 5, name: 'rate_anomaly', score, signals, durationMs: Date.now() - t5 };
  } catch (e) {
    s5 = { stage: 5, name: 'rate_anomaly', score: 0, signals: [], durationMs: 0, error: String(e) };
  }

  const stages: StageOutcome[] = [s1, s2, s3, s4, s5];
  const agg = aggregateDecision(stages);

  // Language detection — não pesa na decisão mas informa autor
  let language: LanguageDetection | undefined;
  try {
    language = detectLanguage(input.text);
  } catch {
    // best-effort
  }

  // Hint para o autor
  let authorHint: string | undefined;
  if (agg.decision === 'FLAG') {
    authorHint = 'Sua publicação foi marcada para revisão. Pode levar até 24h para aprovação.';
  } else if (agg.decision === 'HIDE') {
    authorHint = 'Sua publicação foi escondida temporariamente. Entre em contato se discordar.';
  } else if (agg.primaryReason !== 'OK') {
    authorHint = 'Conteúdo aprovado, mas com observações. Ajuste para evitar moderação futura.';
  }

  // Necessita revisão humana?
  const needsHumanReview = agg.decision !== 'APPROVE';

  return {
    decision: agg.decision,
    confidence: agg.confidence,
    primaryReason: agg.primaryReason,
    reasonText: agg.reasonText,
    stages,
    needsHumanReview,
    authorHint,
    language,
    evaluatedAt,
  };
}

// ============================================================================
// AUDIT LOG
// ============================================================================

/**
 * Persiste o resultado do pipeline em AuditLog (LGPD-safe: só metadados).
 * Falha silenciosa para não bloquear o fluxo de post.
 */
export async function recordAuditLog(
  result: ModerationResult,
  input: ModerationInput
): Promise<void> {
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.auditLog.create({
      data: {
        action: 'AUTO_MOD_DECISION',
        metadata: {
          targetType: input.targetType,
          targetId: input.targetId ?? null,
          authorId: input.authorId,
          decision: result.decision,
          confidence: result.confidence,
          primaryReason: result.primaryReason,
          stages: result.stages.map((s) => ({
            stage: s.stage,
            name: s.name,
            score: s.score,
            signals: s.signals,
            durationMs: s.durationMs,
          })),
          language: result.language?.primary.code ?? 'und',
          evaluatedAt: result.evaluatedAt,
        },
      },
    });
  } catch (err) {
    // LGPD + resiliência: falha de audit não bloqueia publicação.
    // Em produção, enviar para PostHog/Datadog via Sentry.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[auto-mod] audit log failed:', err);
    }
  }
}

// ============================================================================
// QUICK HELPERS
// ============================================================================

/** Helper para testes / dry-run. */
export function quickCheck(text: string, authorId = 'anon'): ModerationDecision {
  return runAutoMod({ targetType: 'POST', text, authorId }).decision;
}

/** Thresholds exportados para configuração externa. */
export const THRESHOLDS = {
  REMOVE: 0.9,
  HIDE: 0.7,
  FLAG: 0.5,
  APPROVE: 0.0,
  RATE_BURST_PER_MIN: RATE_THRESHOLD,
} as const;