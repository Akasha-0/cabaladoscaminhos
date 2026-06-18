/**
 * @akasha/mentor — Detector de Intenção
 *
 * Detecta a intenção do usuário para direcionar
 * a resposta do mentor para prática, ritual, etc.
 */
import type { ChatIntent } from './types';

// ─── Padrões de Detecção ─────────────────────────────────────────────────────

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
