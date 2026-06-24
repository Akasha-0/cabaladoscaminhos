/**
 * @akasha/mentor — Detector de Intenção + Emoção
 *
 * Detecta a intenção do usuário (consulta, prática, ritual, orientação)
 * E o estado emocional predominante (ansioso, perdido, curioso, centrado).
 *
 * Wave 9.3 commit 2: adiciona `detectEmotion()` sem alterar `detectIntent()`
 * (back-compat preservada).
 */
import type { ChatIntent } from './types';
import type { EmotionalState } from './emotional-state';

// ─── Padrões de Detecção (Intenção) ──────────────────────────────────────────

const PRACTICE_PATTERNS = [
  'prática',
  'praticar',
  'banho',
  'oração',
  'rezar',
  'medita',
  'exercício',
  'exercicio',
  'exercício espiritual',
  'exercicio espiritual',
  'devoção',
  'devocao',
  'ritual simples',
  'prática do dia',
];

const RITUAL_PATTERNS = [
  'ritual',
  'cerimônia',
  'cerimonia',
  'cerimonial',
  'oferecer',
  '祭',
  '祭祀',
  'sacrifice',
  'oferenda',
  'lança',
  'lumbre',
  'fogo ritual',
];

const GUIDANCE_PATTERNS = [
  'orientação',
  'orientacao',
  'conselho',
  'ajuda',
  'decisão',
  'decisao',
  'não sei',
  'nao sei',
  'perdido',
  'confuso',
  'confusa',
  'o que devo',
  'como devo',
  'o que fazer',
  'como fazer',
  'me indica',
  'indique',
  'sugestão',
  'sugestao',
];

// ─── Padrões de Detecção (Emoção — Wave 9.3) ────────────────────────────────

/**
 * Regex PT-BR case-insensitive para cada EmotionalState.
 * Wave 9.3 — 4 estados; Wave 9.4 pode adicionar 'frustrado', 'triste', etc.
 *
 * Prioridade (Wave 9.3, ordem de match):
 *  1. ansioso  — disparar tools de regulação (code_of_day, build_ritual)
 *  2. perdido  — disparar tools de orientação (find_correlations, interpretar_vida)
 *  3. curioso  — disparar introspection (list_tools)
 *  4. centrado — nenhuma tool extra (estado base)
 *
 * NOTA: 'perdido' e 'ansioso' podem co-ocorrer; a primeira regex que
 * bater vence. Para evitar falsos positivos (ex: 'ansiedade' contém
 * 'ansios'), usamos \b word boundary e formas radicais.
 */
const EMOTION_PATTERNS: Record<EmotionalState, RegExp> = {
  ansioso: /\b(ansios|ansiedad|medo|panico|inquiet|preocupad|nervos|tense)/i,
  perdido: /\b(perdido|confus|sem\s+direcao|sem\s+rumo|sem\s+direção|sem\s+rumo|nao\s+sei\s+o\s+que\s+fazer)/i,
  curioso: /\b(curioso|explorar|descobrir|aprender|entender)/i,
  centrado: /\b(centrado|paz|calmo|tranquil|sossegad)/i,
};

// ─── Funções Auxiliares ──────────────────────────────────────────────────────

function matchesPatterns(text: string, patterns: string[]): boolean {
  const lower = text.toLowerCase();
  return patterns.some((pattern) => {
    const patternLower = pattern.toLowerCase();
    // Tenta encontrar com ou sem acento
    return lower.includes(patternLower);
  });
}

// ─── Detecção de Intenção ───────────────────────────────────────────────────

/**
 * Detecta a intenção do usuário a partir da mensagem.
 *
 * @param message - Mensagem do usuário
 * @returns Intenção detectada ('practice' | 'guidance' | 'ritual' | 'general')
 */
export function detectIntent(message: string): ChatIntent {
  if (!message || message.trim().length === 0) {
    return 'general';
  }

  // Ritual tem prioridade mais alta
  if (matchesPatterns(message, RITUAL_PATTERNS)) {
    return 'ritual';
  }

  // Depois prática
  if (matchesPatterns(message, PRACTICE_PATTERNS)) {
    return 'practice';
  }

  // Depois orientação
  if (matchesPatterns(message, GUIDANCE_PATTERNS)) {
    return 'guidance';
  }

  // Fallback
  return 'general';
}

// ─── Detecção de Emoção (Wave 9.3) ───────────────────────────────────────────

/**
 * Detecta o estado emocional predominante na mensagem.
 *
 * IMPORTANTE: retorna `null` se nenhum padrão bater — diferente de
 * `detectIntent()` que sempre retorna um ChatIntent. Emoção ausente
 * significa "neutro / não classificado" e o caller NÃO deve disparar
 * tools automaticamente.
 *
 * @param text - Texto livre do usuário (mensagem, pergunta, etc)
 * @returns EmotionalState detectado, ou null se nenhum padrão bater
 */
export function detectEmotion(text: string): EmotionalState | null {
  if (!text || text.trim().length === 0) {
    return null;
  }

  // Ordem de prioridade: ansioso → perdido → curioso → centrado
  // (ansioso e perdido são "estado de sofrimento" e devem disparar tools).
  const states: EmotionalState[] = ['ansioso', 'perdido', 'curioso', 'centrado'];
  for (const state of states) {
    if (EMOTION_PATTERNS[state].test(text)) {
      return state;
    }
  }
  return null;
}

// ─── Utilitários ─────────────────────────────────────────────────────────────

/**
 * Descrição legível da intent para logs/debug.
 */
export function intentLabel(intent: ChatIntent): string {
  const labels: Record<ChatIntent, string> = {
    practice: 'Prática Espiritual',
    ritual: 'Ritual/Cerimônia',
    guidance: 'Orientação/Conselho',
    general: 'Conversa Geral',
  };
  return labels[intent];
}
