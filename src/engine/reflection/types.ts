// ============================================================================
// W87-D — Reflection/Daily Prompt Engine · types
// ----------------------------------------------------------------------------
// Modelo de domínio para a feature NOVA de reflexão diária. Tema fresh —
// não depende de nenhum outro engine. Aqui definimos:
//
//   - 7 tradições (mesmas do portal: cigano, candomblé, umbanda, ifá, cabala,
//     astrologia, tantra)
//   - 28 prompts de reflexão (4 por tradição × 7 tradições)
//   - Journal entries com LGPD consent obrigatório
//   - Rotação diária por hash(YYYY-MM-DD) % 7 tradições
//
// Decisões:
//   - `ReflectionPrompt.date` é `YYYY-MM-DD` (local time, sem offset) —
//     a rotação é determinística: mesma data → mesmo prompt
//   - IDs branded types (string & { __brand }) para evitar mix-ups
//     entre PromptId, EntryId, UserId
//   - LGPD consent é obrigatório no saveEntry (senão throws)
//   - `JournalEntry.lgpdConsent: true` é persistido para auditoria
//   - Citação + autor por prompt: 28 citações respeitosas com fontes
//     reconhecidas (música, filosofia, tradição oral)
//   - `body` do journal: texto livre; tamanho máximo 5000 caracteres
// ============================================================================

/** 7 tradições suportadas pela feature reflection */
export type Tradição =
  | 'cigano'
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia'
  | 'tantra';

/** Símbolo textual (Unicode) por tradição — announcement-friendly */
export const TRADIÇÃO_SYMBOL: Readonly<Record<Tradição, string>> = Object.freeze({
  cigano: '✦',
  candomble: '🪶',
  umbanda: '☩',
  ifa: '◈',
  cabala: '☸',
  astrologia: '☉',
  tantra: '☬',
});

/** Label humana (pt-BR) por tradição */
export const TRADIÇÃO_LABEL: Readonly<Record<Tradição, string>> = Object.freeze({
  cigano: 'Cigano',
  candomble: 'Candomblé',
  umbanda: 'Umbanda',
  ifa: 'Ifá',
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
});

/** Branded IDs — evita mix-ups entre prompt, entry e user */
export type PromptId = string & { readonly __promptId: unique symbol };
export type EntryId = string & { readonly __entryId: unique symbol };
export type UserId = string & { readonly __userId: unique symbol };

/** Conversores seguros — runtime é só `value as X` */
export const toPromptId = (value: string): PromptId => value as PromptId;
export const toEntryId = (value: string): EntryId => value as EntryId;
export const toUserId = (value: string): UserId => value as UserId;

/** Prompt de reflexão para uma data específica */
export interface ReflectionPrompt {
  readonly id: PromptId;
  /** ISO 8601 calendar date: 'YYYY-MM-DD' (sem hora, sem offset) */
  readonly date: string;
  readonly tradição: Tradição;
  /** Pergunta principal da reflexão — máximo 280 caracteres */
  readonly pergunta: string;
  /** Citação complementar — fonte respeitosa */
  readonly citacao: string;
  /** Autor da citação (ou fonte: "Tradição oral", "Atribuído a...") */
  readonly autor: string;
}

/** Entrada de journal (reflexão livre do usuário) */
export interface JournalEntry {
  readonly id: EntryId;
  readonly userId: UserId;
  readonly promptId: PromptId;
  /** Texto livre (markdown simples, sem HTML) — máximo 5000 caracteres */
  readonly body: string;
  /** ISO 8601 timestamp da criação */
  readonly createdAt: string;
  /** LGPD consent obrigatório — `true` se aceitou os termos */
  readonly lgpdConsent: boolean;
}

/** Adapter — fonte de dados (memory | http | supabase | ...) */
export interface ReflectionAdapter {
  /** Lista todos os prompts seed (sem filtro) */
  listPrompts(): Promise<ReadonlyArray<ReflectionPrompt>>;
  /** Busca prompt pelo ID */
  getPrompt(id: PromptId): Promise<ReflectionPrompt | null>;
  /** Salva nova journal entry */
  saveEntry(entry: JournalEntry): Promise<void>;
  /** Lista entradas recentes de um usuário */
  listEntriesByUser(
    userId: UserId,
    limit: number
  ): Promise<ReadonlyArray<JournalEntry>>;
}

/** Engine — fachada de alto nível */
export interface ReflectionEngine {
  /** Retorna o prompt do dia (today = local). Se `tradição` passada, filtra o pool daquela tradição */
  getTodayPrompt(tradição?: Tradição): Promise<ReflectionPrompt>;
  /** Retorna o prompt de uma data específica */
  getPromptByDate(date: string): Promise<ReflectionPrompt>;
  /** Salva uma entrada de journal. LGPD consent OBRIGATÓRIO, senão throws */
  saveEntry(
    userId: UserId,
    promptId: PromptId,
    body: string,
    lgpdConsent: boolean
  ): Promise<JournalEntry>;
  /** Lista entradas recentes de um usuário (ordem desc por createdAt) */
  listRecentEntries(
    userId: UserId,
    limit?: number
  ): Promise<ReadonlyArray<JournalEntry>>;
}

/** Constantes */
export const JOURNAL_BODY_MAX = 5000 as const;
export const JOURNAL_BODY_MIN = 1 as const;
export const PROMPT_PERGUNTA_MAX = 280 as const;
export const LGPD_VERSION_REFLECTION = '2026-01' as const;
export const RECENT_ENTRIES_DEFAULT_LIMIT = 7 as const;
export const SCHEMA_VERSION = '1.0.0' as const;

/** Helper: type guard para Tradição */
export function isTradição(value: unknown): value is Tradição {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(TRADIÇÃO_LABEL, value)
  );
}

/** Helper: validar formato YYYY-MM-DD */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
}
