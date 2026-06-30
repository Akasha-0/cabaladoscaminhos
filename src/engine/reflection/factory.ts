// ============================================================================
// W87-D — Reflection/Daily Prompt Engine · factory
// ----------------------------------------------------------------------------
// Fachada de alto nível. Recebe um `ReflectionAdapter` (memory | http |
// supabase) e expõe as regras de negócio:
//
//   - `getTodayPrompt` — prompt baseado em hash(YYYY-MM-DD) % 7
//     (rotação determinística: mesma data → mesmo prompt)
//   - 7 dias consecutivos cobrem as 7 tradições
//   - `getPromptByDate` — busca direta por data (engine calcula o
//     prompt esperado e faz lookup por id)
//   - `saveEntry` — LGPD consent é OBRIGATÓRIO (throws se false)
//   - `listRecentEntries` — ordem desc por createdAt, limit default 7
// ============================================================================

import {
  JOURNAL_BODY_MAX,
  JOURNAL_BODY_MIN,
  LGPD_VERSION_REFLECTION,
  RECENT_ENTRIES_DEFAULT_LIMIT,
  TRADIÇÃO_LABEL,
  toEntryId,
  type EntryId,
  type JournalEntry,
  type ReflectionAdapter,
  type ReflectionEngine,
  type ReflectionPrompt,
  type Tradição,
  type UserId,
} from './types';

const ALL_TRADIÇÕES: ReadonlyArray<Tradição> = [
  'cigano',
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
];

// ============================================================
// Helpers
// ============================================================

function nowIso(): string {
  return new Date().toISOString();
}

/** Date local → 'YYYY-MM-DD' */
function todayLocalDate(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Hash determinístico simples de uma string (djb2). Suficiente para
 *  rotação diária — não é criptográfico. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Escolhe a tradição da rotação: hash(YYYY-MM-DD) % 7.
 *  Como cada tradição tem 4 prompts, depois hash % 4 escolhe o prompt. */
function pickTradição(date: string): Tradição {
  const h = hashString(date);
  return ALL_TRADIÇÕES[h % ALL_TRADIÇÕES.length] as Tradição;
}

function pickPromptIdForTradição(tr: Tradição, date: string): string {
  const h = hashString(`${date}|${tr}`);
  const n = (h % 4) + 1; // 1..4
  return `prompt-${tr}-${n}`;
}

function newEntryId(): EntryId {
  return toEntryId(
    `entry-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
}

// ============================================================
// Errors
// ============================================================

export class ReflectionError extends Error {
  readonly kind: string;
  constructor(kind: string, message: string) {
    super(message);
    this.kind = kind;
    this.name = 'ReflectionError';
  }
}

// ============================================================
// Factory
// ============================================================================

export function createReflectionEngine(
  adapter: ReflectionAdapter
): ReflectionEngine {
  return {
    async getTodayPrompt(tradição?: Tradição): Promise<ReflectionPrompt> {
      const date = todayLocalDate();
      if (tradição) {
        // Quando `tradição` é passada explicitamente, usamos a pool dela
        // mas ainda determinística via hash
        const id = pickPromptIdForTradição(tradição, date);
        const p = await adapter.getPrompt(id as ReflectionPrompt['id']);
        if (!p) {
          throw new ReflectionError(
            'prompt_not_found',
            `Prompt "${id}" não encontrado no adapter.`
          );
        }
        return { ...p, date };
      }
      // Rotação padrão — uma tradição por dia (mesma data → mesma tradição)
      const tr = pickTradição(date);
      const id = pickPromptIdForTradição(tr, date);
      const p = await adapter.getPrompt(id as ReflectionPrompt['id']);
      if (!p) {
        throw new ReflectionError(
          'prompt_not_found',
          `Prompt "${id}" não encontrado no adapter.`
        );
      }
      return { ...p, date };
    },

    async getPromptByDate(date: string): Promise<ReflectionPrompt> {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new ReflectionError(
          'invalid_date',
          `Data inválida: "${date}". Use YYYY-MM-DD.`
        );
      }
      // Se a data for fornecida explicitamente, inferir a tradição
      // (regra do `getTodayPrompt` é determinística por hash)
      const tr = pickTradição(date);
      const id = pickPromptIdForTradição(tr, date);
      const p = await adapter.getPrompt(id as ReflectionPrompt['id']);
      if (!p) {
        throw new ReflectionError(
          'prompt_not_found',
          `Prompt "${id}" para a data ${date} não encontrado.`
        );
      }
      return { ...p, date };
    },

    async saveEntry(
      userId: UserId,
      promptId: ReflectionPrompt['id'],
      body: string,
      lgpdConsent: boolean
    ): Promise<JournalEntry> {
      // 1. LGPD consent é OBRIGATÓRIO (throws)
      if (!lgpdConsent) {
        throw new ReflectionError(
          'lgpd_required',
          `É necessário aceitar a versão ${LGPD_VERSION_REFLECTION} do termo de consentimento LGPD para salvar a reflexão.`
        );
      }

      // 2. Body validation
      const trimmed = body.trim();
      if (trimmed.length < JOURNAL_BODY_MIN) {
        throw new ReflectionError(
          'body_empty',
          'A reflexão não pode estar vazia.'
        );
      }
      if (trimmed.length > JOURNAL_BODY_MAX) {
        throw new ReflectionError(
          'body_too_long',
          `A reflexão ultrapassou o limite de ${JOURNAL_BODY_MAX} caracteres.`
        );
      }

      // 3. Prompt existe? (validação de integridade)
      const prompt = await adapter.getPrompt(promptId);
      if (!prompt) {
        throw new ReflectionError(
          'prompt_not_found',
          `Prompt "${promptId}" não encontrado.`
        );
      }

      const entry: JournalEntry = {
        id: newEntryId(),
        userId,
        promptId,
        body: trimmed,
        createdAt: nowIso(),
        lgpdConsent: true,
      };
      await adapter.saveEntry(entry);
      return entry;
    },

    async listRecentEntries(
      userId: UserId,
      limit: number = RECENT_ENTRIES_DEFAULT_LIMIT
    ): Promise<ReadonlyArray<JournalEntry>> {
      if (limit < 1) {
        throw new ReflectionError(
          'invalid_limit',
          'O limite deve ser >= 1.'
        );
      }
      return adapter.listEntriesByUser(userId, limit);
    },
  };
}

// ============================================================
// Helpers exported para test/smoke
// ============================================================================

/** Test helper: pega a data local em formato YYYY-MM-DD */
export function getTodayDate(now?: Date): string {
  return todayLocalDate(now);
}

/** Test helper: dada uma data, qual a tradição da rotação */
export function pickTradiçãoForDate(date: string): Tradição {
  return pickTradição(date);
}

/** Test helper: dada uma data e tradição, qual o id do prompt */
export function pickPromptIdFor(tradição: Tradição, date: string): string {
  return pickPromptIdForTradição(tradição, date);
}

/** Re-exporta constante útil */
export { ALL_TRADIÇÕES, LGPD_VERSION_REFLECTION, TRADIÇÃO_LABEL };
