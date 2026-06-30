/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-B — AKASHA PROMPT CONTEXT BUILDER · TYPES
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 82 · 2026-06-30
 * Author: W82-B Coder (Mavis orchestrator session 414743267553428)
 *
 * The Akasha IA chat (built in W79-C, streaming UI) needs a STRUCTURED
 * PROMPT CONTEXT to answer questions about the consulente's Mesa Real reading
 * with surgical specificity.
 *
 * Generic prompts produce generic answers. This engine builds structured
 * context from:
 *   1. A `LeituraSintetizada` (output from W82-A cruzamentoPorCasa: 36
 *      CruzamentoCasa records — one per Mesa Real house).
 *   2. A `PerguntaConsulente` (the consulente's chat question, optionally
 *      with tema + explicit casasCitadas).
 *   3. A `HistoricoChat` (prior turns in the conversation).
 *
 * Output: a `PromptContext` ready to be inserted into the AI system prompt.
 *
 * Branded types cycle 70+ pattern: domain primitives get nominal type
 * separation (CasaNumber ≠ LeituraSintetizadaId ≠ PromptContextId).
 *
 * Imports `CruzamentoCasa` indirectly via inline shape declaration so
 * that W82-B can compile standalone even if W82-A hasn't merged yet. The
 * shape mirrors W82-A's cruzamentoPorCasa output to spec.
 */

// ════════════════════════════════════════════════════════════════════════════
// BRANDED PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

export type Brand<TBase, TBrand extends string> = TBase & { readonly __brand: TBrand };

/** Valid Mesa Real house number — 1..36 (full wheel), branded. */
export type CasaNumber = Brand<number, 'CasaNumber'>;

/** Mesa Real has 36 houses; valid range 1..36. */
export const MESA_REAL_HOUSES_TOTAL: number = 36;

/** First house anchor: O Consulente (consulente identity). */
export const CASA_CONSULENTE: number = 1;
/** Last house anchor: O Retorno (closure / return). */
export const CASA_RETORNO: number = MESA_REAL_HOUSES_TOTAL;

/** Tradition catalog (7 — fixed per Vision). */
export type Tradicao =
  | 'cigano'
  | 'orixas'
  | 'astrologia'
  | 'cabala'
  | 'numerologia'
  | 'tantra'
  | 'tarot';

/** Casa topic — broad domain classification of a Mesa Real house. */
export type TemaCasa =
  | 'identidade'
  | 'sexualidade'
  | 'trabalho'
  | 'familia'
  | 'espiritualidade'
  | 'saude'
  | 'financas'
  | 'relacionamentos'
  | 'comunicacao'
  | 'criatividade'
  | 'viagens'
  | 'amizades'
  | 'autoconhecimento'
  | 'ciclo'
  | 'proposito';

/** Minimum number of casas shown to the AI as relevant (anchors + matches). */
export const MIN_CASAS_RELEVANTES: number = 3;
/** Maximum number of casas shown to the AI as relevant (token budget). */
export const MAX_CASAS_RELEVANTES: number = 7;
/** Approximate characters per AI token — used for rough token estimate. */
export const CHARS_PER_TOKEN: number = 4;

// ════════════════════════════════════════════════════════════════════════════
// CRUZAMENTO CASA — shape mirror of W82-A
// ════════════════════════════════════════════════════════════════════════════
//
// W82-A produces a `CruzamentoCasa` per house. We declare an inline shape so
// W82-B compiles standalone. The shape MUST stay aligned with W82-A's actual
// output (cruzamentoPorCasa engine). If W82-A's shape evolves, update here.

/** A single Cigano (Lenormand) card position in Mesa Real. */
export interface CiganoCardRef {
  id: number;                 // 1..36 (28=Homem/Cigano, 29=Mulher/Cigana)
  nome: string;               // e.g. 'Cavaleiro', 'Cigana', 'Estrela'
  /**
   * Surface reading for this card in this house (1-line).
   * W75-A cycle contract: `surface` field.
   */
  superficie: string;
}

/** Layer from a sister map (astrologia / numerologia / etc). */
export interface Contribuicao {
  /**
   * Tradition this contribution comes from. One of `Tradicao` (lowercase).
   * Note: W82-A may export capitalized labels (e.g. 'Cigano'). We accept
   * any string here and let the engine normalize for sacred-term lookup.
   */
  tradicao: string;
  /**
   * Short label (e.g. 'Casa 8 — Escorpião', 'LifePath 11', 'Ogum', 'Tiphareth').
   * Used for keyword scoring in `casasRelevantes`.
   */
  rotulo: string;
  /**
   * Full contribution text. Used for keyword scoring AND for the AI prompt
   * (surgical specificity — the AI reads exactly what each layer said).
   */
  texto: string;
}

/** A single Mesa Real house crossed with 4 sister maps + 7 traditions. */
export interface CruzamentoCasa {
  /** 1..36 — branded to prevent accidental arithmetic with raw numbers. */
  numero: CasaNumber;
  /** Broad topic of the house. */
  tema: TemaCasa;
  /** Cigano card at this house position. */
  cartaCigana: CiganoCardRef;
  /**
   * Other traditions (astrologia, numerologia, orixás, cabala, tantra, tarot).
   * May be empty for some houses (data gap is allowed).
   */
  contribuicoes: ReadonlyArray<Contribuicao>;
  /**
   * One-paragraph synthesis — what the cruzamento engine concluded for this
   * house combining all layers. This is the AI's primary reading material.
   */
  sintese: string;
}

/**
 * Full Mesa Real reading — 36 CruzamentoCasa entries, ordered by numero.
 * W82-A contract: returns this from `cruzamentoPorCasa(consulenteInput)`.
 */
export type LeituraSintetizada = ReadonlyArray<CruzamentoCasa>;

// ════════════════════════════════════════════════════════════════════════════
// CHAT INPUT TYPES
// ════════════════════════════════════════════════════════════════════════════

/** A single theme tag the consulente can attach to their question. */
export type TemaPergunta =
  | 'sexualidade'
  | 'trabalho'
  | 'familia'
  | 'saude'
  | 'espiritualidade'
  | 'financas'
  | 'relacionamentos'
  | 'comunicacao'
  | 'criatividade'
  | 'viagens'
  | 'amizades'
  | 'autoconhecimento';

/** Tags for non-domain ways the consulente might frame a question. */
export type FormaPergunta =
  | 'conselho'
  | 'previsao'
  | 'explicacao'
  | 'ritual'
  | 'alerta';

/** The consulente's current question. */
export interface PerguntaConsulente {
  /** Raw text typed by the consulente (already trimmed). */
  texto: string;
  /** Optional topic tag (helps keyword matching). */
  tema?: TemaPergunta;
  /** Optional forma tag (changes which instruction rules fire). */
  forma?: FormaPergunta;
  /** Optional explicit house numbers the consulente referenced in the chat. */
  casasCitadas?: ReadonlyArray<number>;
}

/** Single chat message — either from the user or from Akasha (assistant). */
export interface MensagemChat {
  /** 'user' = consulente; 'assistant' = Akasha IA. */
  role: 'user' | 'assistant';
  /** Message body. */
  texto: string;
  /** Unix ms timestamp. */
  ts: number;
  /** Optional: which house numbers the assistant mentioned (assistant only). */
  casasCitadas?: ReadonlyArray<number>;
}

/** Bounded rolling window of the chat conversation. */
export interface HistoricoChat {
  /** All messages, time-ordered ascending. */
  mensagens: ReadonlyArray<MensagemChat>;
  /** Cap on turns included in the prompt. Default 8 (≈ 16 messages). */
  maxTurnos: number;
}

/** Default max turns if caller doesn't provide one. */
export const DEFAULT_MAX_TURNOS: number = 8;

// ════════════════════════════════════════════════════════════════════════════
// PROMPT CONTEXT — OUTPUT
// ════════════════════════════════════════════════════════════════════════════

/** The full structured prompt context, ready for the AI system prompt. */
export interface PromptContext {
  /** Fixed Akasha persona + surgery rules. */
  systemRole: string;
  /** 3-5 line summary of the full reading. */
  leituraResumo: string;
  /** 3-7 CruzamentoCasa entries most relevant to the pergunta. */
  casasRelevantes: ReadonlyArray<CruzamentoCasa>;
  /** Cleaned question text (always ends with '?', lowercased). */
  perguntaAtual: string;
  /** Conversation memory — last maxTurnos turns. */
  contextoConversa: string;
  /** Auto-detected sacred terms to honor (NFD-deduped, ≤12). */
  termosSagrados: ReadonlyArray<string>;
  /** Surgical-specificity instruction rules. */
  instrucoes: ReadonlyArray<string>;
  /** Fully assembled prompt, ready to ship. */
  promptFinal: string;
  /** Rough token estimate (len / 4 ceiling). */
  tokensEstimados: number;
  /** Branded id for cache key. */
  meta: {
    brand: 'W82-B';
    cycle: 82;
    version: '1.0.0';
    cacheKey: string;
    generatedAt: string;
  };
}

/** Branded PromptContext id (for hashCacheKey). */
export type PromptContextId = Brand<string, 'PromptContextId'>;

// ════════════════════════════════════════════════════════════════════════════
// ENGINE CONFIG
// ════════════════════════════════════════════════════════════════════════════

export interface BuildContextConfig {
  /** Overrides DEFAULT_MAX_TURNOS for the historico slice. */
  maxTurnos?: number;
  /** Overrides the default system role. Use only if persona has evolved. */
  systemRoleOverride?: string;
  /** Skip sacred-term detection (useful for tests). */
  noSacredDetect?: boolean;
  /**
   * Add extra instruction rules — e.g. experimental "cite numerology
   * master numbers explicitly".
   */
  instrucoesExtras?: ReadonlyArray<string>;
}

export const AKASHA_PROMPT_VERSION = '1.0.0';
export const AKASHA_PROMPT_CYCLE = 82;
