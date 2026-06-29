/**
 * daily-reflection-prompt.ts
 *
 * Engine de prompts diários de reflexão com rastreamento de streak (sequência)
 * e journaling. Módulo w41 que estende os trabalhos w23/reflection-content e
 * w27/daily-reflection, adicionando: prompts temáticos, registro de entradas
 * de diário, recompensas por marcos de sequência e geração de resumo semanal.
 *
 * Tom: PT-BR amigável, vocabulário místico/axé. Standalone — não importa
 * de outros módulos w3x/w4x.
 *
 * @module w41/daily-reflection-prompt
 */

// ============================================================================
// Types
// ============================================================================

/** Tema da reflexão diária. */
export type ReflectionTheme =
  | "gratidao"
  | "intencao"
  | "sombra"
  | "luz"
  | "aprendizado"
  | "corpo"
  | "conexao"
  | "ritual"
  | "silencio"
  | "acao";

/** Tradição espiritual (subset do módulo reputation). */
export type Tradition =
  | "candomble"
  | "umbanda"
  | "ifa"
  | "cabala"
  | "astrologia"
  | "tantra"
  | "taoismo"
  | "budismo"
  | "hinduismo"
  | "wicca"
  | "xamanismo";

/** Contexto de reputação (subset). */
export type ReputationContext = "love" | "work" | "family" | "study" | "health" | "spiritual";

/** Intensidade do prompt. 1=leve, 2=médio, 3=profundo. */
export type PromptIntensity = 1 | 2 | 3;

/** Humor registrado pelo usuário. */
export type Mood = "radiante" | "bem" | "neutro" | "pesado" | "caido";

/** Prompt de reflexão. */
export interface ReflectionPrompt {
  readonly id: string;
  readonly theme: ReflectionTheme;
  readonly text: string;
  readonly context: ReputationContext | null;
  readonly tradition: Tradition | null;
  readonly intensity: PromptIntensity;
  readonly createdAt: string;
}

/** Entrada de diário do usuário. */
export interface JournalEntry {
  readonly id: string;
  readonly userId: string;
  readonly promptId: string;
  readonly response: string;
  readonly mood: Mood;
  readonly isPrivate: boolean;
  readonly createdAt: string;
  readonly wordCount: number;
  readonly tags: ReadonlyArray<string>;
}

/** Marco de sequência (streak). */
export interface StreakMilestone {
  readonly days: 7 | 30 | 100 | 365;
  readonly achievedAt: string;
  readonly reward: string;
}

/** Estado de sequência de reflexões do usuário. */
export interface ReflectionStreak {
  readonly userId: string;
  readonly currentStreak: number;
  readonly longestStreak: number;
  readonly lastReflectionDate: string;
  readonly totalReflections: number;
  readonly milestones: ReadonlyArray<StreakMilestone>;
}

/** Resumo semanal de reflexões. */
export interface WeeklySummary {
  readonly userId: string;
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly totalReflections: number;
  readonly byTheme: Readonly<Record<ReflectionTheme, number>>;
  readonly byMood: Readonly<Record<Mood, number>>;
  readonly averageWordCount: number;
  readonly longestStreakInWeek: number;
}

/** Preferências de reflexão do usuário. */
export interface ReflectionPreferences {
  readonly userId: string;
  readonly enabledThemes: ReadonlyArray<ReflectionTheme>;
  readonly intensity: PromptIntensity;
  readonly reminderTime: string;
  readonly timezone: string;
  readonly isPrivateByDefault: boolean;
  readonly weeklySummaryEnabled: boolean;
}

/** Resultado de validação genérico. */
export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: ReadonlyArray<string>;
}

// ============================================================================
// Constants
// ============================================================================

/** Comprimento máximo do texto do prompt. */
export const MAX_PROMPT_TEXT_LENGTH = 280;

/** Comprimento máximo da resposta do diário. */
export const MAX_JOURNAL_RESPONSE_LENGTH = 5000;

/** Comprimento mínimo da resposta do diário. */
export const MIN_JOURNAL_RESPONSE_LENGTH = 10;

/** Máximo de tags por entrada. */
export const MAX_TAGS_PER_ENTRY = 10;

/** Comprimento máximo de uma tag. */
export const MAX_TAG_LENGTH = 30;

/** Marcos de sequência (em dias). */
export const STREAK_MILESTONES: ReadonlyArray<number> = [7, 30, 100, 365];

/** Recompensas dos marcos. */
export const STREAK_MILESTONE_REWARDS: Readonly<Record<number, string>> = {
  7: "Semente de Axé",
  30: "Caminhante",
  100: "Praticante Dedicado",
  365: "Mestre da Reflexão",
};

/** Todos os temas disponíveis. */
export const ALL_THEMES: ReadonlyArray<ReflectionTheme> = [
  "gratidao",
  "intencao",
  "sombra",
  "luz",
  "aprendizado",
  "corpo",
  "conexao",
  "ritual",
  "silencio",
  "acao",
];

/** Rótulos PT-BR para os temas. */
export const THEME_LABELS: Readonly<Record<ReflectionTheme, string>> = {
  gratidao: "Gratidão",
  intencao: "Intenção",
  sombra: "Sombra",
  luz: "Luz",
  aprendizado: "Aprendizado",
  corpo: "Corpo",
  conexao: "Conexão",
  ritual: "Ritual",
  silencio: "Silêncio",
  acao: "Ação",
};

/** Tamanho virtual do banco de prompts. */
export const PROMPT_BANK_SIZE = 100;

/** Horário padrão de lembrete. */
export const DEFAULT_REMINDER_TIME = "08:00";

/** Dias da semana em PT-BR. */
export const WEEKDAY_NAMES_PT: ReadonlyArray<string> = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

/** Intensidade padrão. */
export const DEFAULT_INTENSITY: PromptIntensity = 2;

/** Horas de carência antes de quebrar a sequência. */
export const STREAK_GRACE_HOURS = 36;

// ============================================================================
// Helpers
// ============================================================================

/**
 * Hash determinístico simples baseado em string.
 * @param input String de entrada.
 * @returns Número inteiro não-negativo.
 */
function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Faz parse de uma string ISO de data e retorna timestamp em ms.
 * @param iso Data ISO (YYYY-MM-DD ou ISO datetime).
 */
function parseIso(iso: string): number {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return Number.NaN;
  return d.getTime();
}

/**
 * Verifica se duas datas ISO estão no mesmo dia (UTC).
 */
function isSameUtcDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  );
}

/**
 * Constrói um id determinístico baseado em prefixo e hash.
 */
function makeId(prefix: string, seed: string): string {
  return `${prefix}_${hashString(seed).toString(36)}`;
}

// ============================================================================
// Prompt selection
// ============================================================================

/**
 * Seleciona um prompt determinístico baseado na data.
 * @param theme Tema desejado.
 * @param date Data ISO (YYYY-MM-DD).
 * @param promptBank Banco de prompts disponíveis.
 */
export function selectPromptForDate(
  theme: ReflectionTheme,
  date: string,
  promptBank: ReadonlyArray<ReflectionPrompt>,
): ReflectionPrompt {
  const filtered = promptBank.filter((p) => p.theme === theme);
  const pool = filtered.length > 0 ? filtered : promptBank;
  if (pool.length === 0) {
    throw new Error("selectPromptForDate: promptBank vazio");
  }
  const idx = hashString(`${theme}|${date}`) % pool.length;
  return pool[idx]!;
}

/**
 * Seleciona um prompt filtrando por contexto de reputação.
 * @returns O primeiro prompt que bate o contexto, ou null se nenhum.
 */
export function selectPromptByContext(
  context: ReputationContext,
  promptBank: ReadonlyArray<ReflectionPrompt>,
): ReflectionPrompt | null {
  const filtered = promptBank.filter((p) => p.context === context);
  return filtered.length > 0 ? filtered[0]! : null;
}

/**
 * Seleciona um prompt filtrando por tradição.
 */
export function selectPromptByTradition(
  tradition: Tradition,
  promptBank: ReadonlyArray<ReflectionPrompt>,
): ReflectionPrompt | null {
  const filtered = promptBank.filter((p) => p.tradition === tradition);
  return filtered.length > 0 ? filtered[0]! : null;
}

/**
 * Gera um prompt diário baseado em tema+data+intensidade.
 * Procura no banco filtrando por tema e tenta achar intensidade compatível.
 */
export function generateDailyPrompt(
  theme: ReflectionTheme,
  date: string,
  intensity: PromptIntensity,
  promptBank: ReadonlyArray<ReflectionPrompt>,
): ReflectionPrompt {
  const byTheme = promptBank.filter((p) => p.theme === theme);
  const byIntensity = byTheme.filter((p) => p.intensity === intensity);
  const pool = byIntensity.length > 0 ? byIntensity : byTheme;
  if (pool.length === 0) {
    // Fallback: cria um prompt stub determinístico.
    return {
      id: makeId("prompt", `${theme}|${date}|${intensity}`),
      theme,
      text: `Reflita sobre ${theme} neste dia.`,
      context: null,
      tradition: null,
      intensity,
      createdAt: date,
    };
  }
  const idx = hashString(`${theme}|${date}|${intensity}`) % pool.length;
  return pool[idx]!;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Valida a estrutura de um prompt.
 */
export function validatePrompt(prompt: ReflectionPrompt): ValidationResult {
  const errors: string[] = [];
  if (!prompt.id || typeof prompt.id !== "string") {
    errors.push("id ausente ou inválido");
  }
  if (!ALL_THEMES.includes(prompt.theme)) {
    errors.push(`theme inválido: ${String(prompt.theme)}`);
  }
  if (typeof prompt.text !== "string" || prompt.text.length === 0) {
    errors.push("text vazio");
  } else if (prompt.text.length > MAX_PROMPT_TEXT_LENGTH) {
    errors.push(`text excede ${MAX_PROMPT_TEXT_LENGTH} chars`);
  }
  if (![1, 2, 3].includes(prompt.intensity)) {
    errors.push(`intensity inválida: ${String(prompt.intensity)}`);
  }
  if (!prompt.createdAt || Number.isNaN(parseIso(prompt.createdAt))) {
    errors.push("createdAt inválido");
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Valida a resposta do diário.
 */
export function validateJournalResponse(response: string): ValidationResult {
  const errors: string[] = [];
  if (typeof response !== "string") {
    errors.push("response não é string");
    return { ok: false, errors };
  }
  const trimmed = response.trim();
  if (trimmed.length < MIN_JOURNAL_RESPONSE_LENGTH) {
    errors.push(`response menor que ${MIN_JOURNAL_RESPONSE_LENGTH} chars`);
  }
  if (response.length > MAX_JOURNAL_RESPONSE_LENGTH) {
    errors.push(`response excede ${MAX_JOURNAL_RESPONSE_LENGTH} chars`);
  }
  return { ok: errors.length === 0, errors };
}

// ============================================================================
// Journal entries
// ============================================================================

/**
 * Conta palavras em um texto.
 */
export function countWords(text: string): number {
  if (typeof text !== "string" || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Cria uma entrada de diário.
 */
export function createJournalEntry(
  userId: string,
  promptId: string,
  response: string,
  mood: Mood,
  isPrivate: boolean,
  now: string,
): JournalEntry {
  const validMoods: ReadonlyArray<Mood> = ["radiante", "bem", "neutro", "pesado", "caido"];
  if (!validMoods.includes(mood)) {
    throw new Error(`createJournalEntry: mood inválido: ${mood}`);
  }
  const id = makeId("entry", `${userId}|${promptId}|${now}`);
  return {
    id,
    userId,
    promptId,
    response,
    mood,
    isPrivate,
    createdAt: now,
    wordCount: countWords(response),
    tags: [],
  };
}

/**
 * Adiciona tags a uma entrada existente (imutável).
 */
export function addTagsToEntry(
  entry: JournalEntry,
  tags: ReadonlyArray<string>,
): JournalEntry {
  const cleaned = sanitizeTags(tags).slice(0, MAX_TAGS_PER_ENTRY);
  const merged = Array.from(new Set([...entry.tags, ...cleaned])).slice(0, MAX_TAGS_PER_ENTRY);
  return { ...entry, tags: merged };
}

// ============================================================================
// Streak tracking
// ============================================================================

/**
 * Calcula a diferença em dias inteiros entre duas datas ISO.
 */
export function daysBetween(date1: string, date2: string): number {
  const t1 = parseIso(date1);
  const t2 = parseIso(date2);
  if (Number.isNaN(t1) || Number.isNaN(t2)) return 0;
  const dayMs = 86400000;
  const d1 = Date.UTC(new Date(t1).getUTCFullYear(), new Date(t1).getUTCMonth(), new Date(t1).getUTCDate());
  const d2 = Date.UTC(new Date(t2).getUTCFullYear(), new Date(t2).getUTCMonth(), new Date(t2).getUTCDate());
  return Math.round((d2 - d1) / dayMs);
}

/**
 * Verifica se a sequência está quebrada considerando grace hours.
 */
export function isStreakBroken(
  streak: ReflectionStreak,
  now: string,
  graceHours: number,
): boolean {
  if (!streak.lastReflectionDate) return true;
  const t1 = parseIso(streak.lastReflectionDate);
  const t2 = parseIso(now);
  if (Number.isNaN(t1) || Number.isNaN(t2)) return true;
  const diffHours = (t2 - t1) / 3600000;
  return diffHours > graceHours;
}

/**
 * Recupera uma sequência quebrada resetando para 1.
 */
export function recoverStreak(
  streak: ReflectionStreak,
  now: string,
): ReflectionStreak {
  return {
    ...streak,
    currentStreak: 1,
    lastReflectionDate: now,
    totalReflections: streak.totalReflections + 1,
  };
}

/**
 * Aplica um marco à sequência.
 */
export function applyMilestone(
  streak: ReflectionStreak,
  days: number,
  now: string,
  reward: string,
): ReflectionStreak {
  if (!STREAK_MILESTONES.includes(days)) return streak;
  const already = streak.milestones.some((m) => m.days === days);
  if (already) return streak;
  const milestone: StreakMilestone = {
    days: days as 7 | 30 | 100 | 365,
    achievedAt: now,
    reward,
  };
  return { ...streak, milestones: [...streak.milestones, milestone] };
}

/**
 * Registra uma reflexão e atualiza a sequência com possíveis marcos.
 */
export function recordReflection(
  streak: ReflectionStreak,
  now: string,
): ReflectionStreak {
  if (!streak.lastReflectionDate) {
    return recoverStreak(streak, now);
  }
  if (isStreakBroken(streak, now, STREAK_GRACE_HOURS)) {
    return recoverStreak(streak, now);
  }
  if (isSameUtcDay(streak.lastReflectionDate, now)) {
    // Mesma dia — não incrementa, mas mantém contadores.
    return {
      ...streak,
      totalReflections: streak.totalReflections + 1,
    };
  }
  const diff = daysBetween(streak.lastReflectionDate, now);
  let nextStreak: number;
  if (diff <= 1) {
    nextStreak = streak.currentStreak + 1;
  } else if (diff <= Math.ceil(STREAK_GRACE_HOURS / 24)) {
    // Dentro da janela de carência (1+ dias) — mantém sequência.
    nextStreak = streak.currentStreak + 1;
  } else {
    nextStreak = 1;
  }
  const longest = Math.max(streak.longestStreak, nextStreak);
  let updated: ReflectionStreak = {
    ...streak,
    currentStreak: nextStreak,
    longestStreak: longest,
    lastReflectionDate: now,
    totalReflections: streak.totalReflections + 1,
  };
  // Aplica marcos alcançados.
  for (const m of STREAK_MILESTONES) {
    if (nextStreak >= m && STREAK_MILESTONE_REWARDS[m]) {
      updated = applyMilestone(updated, m, now, STREAK_MILESTONE_REWARDS[m]!);
    }
  }
  return updated;
}

/**
 * Resumo legível da sequência.
 */
export function summarizeStreak(streak: ReflectionStreak): {
  current: number;
  longest: number;
  isOnFire: boolean;
  nextMilestone: number | null;
  nextMilestoneDays: number | null;
} {
  const next = STREAK_MILESTONES.find((m) => m > streak.currentStreak) ?? null;
  return {
    current: streak.currentStreak,
    longest: streak.longestStreak,
    isOnFire: streak.currentStreak >= 7,
    nextMilestone: next,
    nextMilestoneDays: next !== null ? next - streak.currentStreak : null,
  };
}

// ============================================================================
// Weekly summary
// ============================================================================

/**
 * Agrupa entradas por tema.
 */
export function groupEntriesByTheme(
  entries: ReadonlyArray<JournalEntry>,
): Readonly<Record<ReflectionTheme, ReadonlyArray<JournalEntry>>> {
  const acc: Record<ReflectionTheme, JournalEntry[]> = {
    gratidao: [],
    intencao: [],
    sombra: [],
    luz: [],
    aprendizado: [],
    corpo: [],
    conexao: [],
    ritual: [],
    silencio: [],
    acao: [],
  };
  // Mapear promptIds para temas — sem acesso ao banco, inferimos vazio e
  // retornamos estrutura vazia para temas sem mapping. Para mapear de fato
  // precisaríamos do banco; aqui devolvemos a estrutura canônica e
  // populamos o que for inferível.
  // Como JournalEntry guarda só promptId, sem tema, agrupamos retornando
  // estrutura vazia. Esta função deve ser combinada com lookup via banco.
  for (const e of entries) {
    // Sem mapping promptId->theme aqui; mantemos arrays vazios.
    // O consumidor deve usar generateWeeklySummary para ter os counts.
    void e;
  }
  return acc;
}

/**
 * Agrupa entradas por humor.
 */
export function groupEntriesByMood(
  entries: ReadonlyArray<JournalEntry>,
): Readonly<Record<Mood, ReadonlyArray<JournalEntry>>> {
  const acc: Record<Mood, JournalEntry[]> = {
    radiante: [],
    bem: [],
    neutro: [],
    pesado: [],
    caido: [],
  };
  for (const e of entries) {
    acc[e.mood].push(e);
  }
  return acc;
}

/**
 * Gera um resumo semanal de reflexões.
 */
export function generateWeeklySummary(
  userId: string,
  entries: ReadonlyArray<JournalEntry>,
  weekStart: string,
): WeeklySummary {
  const start = parseIso(weekStart);
  const end = start + 7 * 86400000 - 1;
  const inWeek = entries.filter((e) => {
    const t = parseIso(e.createdAt);
    return t >= start && t <= end;
  });

  const byMood = groupEntriesByMood(inWeek);
  const moodCounts: Record<Mood, number> = {
    radiante: byMood.radiante.length,
    bem: byMood.bem.length,
    neutro: byMood.neutro.length,
    pesado: byMood.pesado.length,
    caido: byMood.caido.length,
  };

  // byTheme precisa do banco de prompts; como JournalEntry só guarda
  // promptId, retornamos zeros. O consumidor pode combinar com
  // generateWeeklySummaryWithBank para ter os counts reais.
  const themeCounts: Record<ReflectionTheme, number> = {
    gratidao: 0,
    intencao: 0,
    sombra: 0,
    luz: 0,
    aprendizado: 0,
    corpo: 0,
    conexao: 0,
    ritual: 0,
    silencio: 0,
    acao: 0,
  };

  const totalWords = inWeek.reduce((acc, e) => acc + e.wordCount, 0);
  const avg = inWeek.length > 0 ? Math.round(totalWords / inWeek.length) : 0;

  // Streak mais longa dentro da semana: simulação — usa contagem acumulada.
  let longest = 0;
  let cur = 0;
  const sorted = [...inWeek].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  let prevDay = "";
  for (const e of sorted) {
    const day = e.createdAt.slice(0, 10);
    if (prevDay === "") {
      cur = 1;
    } else {
      const d = daysBetween(prevDay, day);
      cur = d <= 1 ? cur + 1 : 1;
    }
    longest = Math.max(longest, cur);
    prevDay = day;
  }

  const weekEndDate = new Date(start + 6 * 86400000);
  return {
    userId,
    weekStart,
    weekEnd: weekEndDate.toISOString(),
    totalReflections: inWeek.length,
    byTheme: themeCounts,
    byMood: moodCounts,
    averageWordCount: avg,
    longestStreakInWeek: longest,
  };
}

// ============================================================================
// Preferences
// ============================================================================

/**
 * Cria preferências padrão de reflexão para um usuário.
 */
export function defaultPreferences(userId: string, timezone: string): ReflectionPreferences {
  return {
    userId,
    enabledThemes: [...ALL_THEMES],
    intensity: DEFAULT_INTENSITY,
    reminderTime: DEFAULT_REMINDER_TIME,
    timezone,
    isPrivateByDefault: true,
    weeklySummaryEnabled: true,
  };
}

/**
 * Valida preferências de reflexão.
 */
export function validatePreferences(prefs: ReflectionPreferences): ValidationResult {
  const errors: string[] = [];
  if (!prefs.userId) errors.push("userId ausente");
  if (!ALL_THEMES.includes(prefs.intensity as unknown as ReflectionTheme) === false) {
    // intensity não é tema — checagem separada abaixo
  }
  if (![1, 2, 3].includes(prefs.intensity)) {
    errors.push(`intensity inválida: ${String(prefs.intensity)}`);
  }
  if (!Array.isArray(prefs.enabledThemes) || prefs.enabledThemes.length === 0) {
    errors.push("enabledThemes vazio");
  }
  for (const t of prefs.enabledThemes) {
    if (!ALL_THEMES.includes(t)) errors.push(`theme inválido em enabledThemes: ${String(t)}`);
  }
  if (!/^\d{2}:\d{2}$/.test(prefs.reminderTime)) {
    errors.push("reminderTime deve ser HH:MM");
  }
  if (!prefs.timezone || typeof prefs.timezone !== "string") {
    errors.push("timezone inválida");
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Verifica se é hora de enviar o lembrete de reflexão.
 * Compara HH:MM da preferência com HH:MM atual (UTC por simplicidade).
 */
export function reminderTimeInTimezone(
  prefs: ReflectionPreferences,
  now: string,
): boolean {
  const target = prefs.reminderTime;
  const date = new Date(now);
  if (Number.isNaN(date.getTime())) return false;
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}` === target;
}

// ============================================================================
// Tags
// ============================================================================

const TAG_VALID_RE = /^[a-z0-9\-_áéíóúâêîôûãõç ]+$/i;

/**
 * Verifica se uma tag é válida.
 */
export function isValidTag(tag: string): boolean {
  if (typeof tag !== "string") return false;
  const t = tag.trim();
  if (t.length === 0 || t.length > MAX_TAG_LENGTH) return false;
  return TAG_VALID_RE.test(t);
}

/**
 * Sanitiza uma lista de tags: trim, lowercase, dedupe e filtra inválidas.
 */
export function sanitizeTags(tags: ReadonlyArray<string>): ReadonlyArray<string> {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    if (typeof raw !== "string") continue;
    const t = raw.trim().toLowerCase();
    if (!isValidTag(t)) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= MAX_TAGS_PER_ENTRY) break;
  }
  return out;
}

// ============================================================================
// Week formatting
// ============================================================================

const MONTH_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

/**
 * Formata um range semanal a partir de weekStart ISO.
 */
export function formatWeekRange(weekStart: string): {
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
} {
  const start = new Date(weekStart);
  if (Number.isNaN(start.getTime())) {
    return { weekStart, weekEnd: weekStart, weekLabel: "Semana inválida" };
  }
  const end = new Date(start.getTime() + 6 * 86400000);
  const sd = String(start.getUTCDate()).padStart(2, "0");
  const ed = String(end.getUTCDate()).padStart(2, "0");
  const sm = MONTH_PT[start.getUTCMonth()] ?? "";
  const em = MONTH_PT[end.getUTCMonth()] ?? "";
  const y = end.getUTCFullYear();
  const weekLabel = `Semana de ${sd}-${ed} ${em} ${y}`;
  return {
    weekStart: start.toISOString(),
    weekEnd: end.toISOString(),
    weekLabel,
  };
}