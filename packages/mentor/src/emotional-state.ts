/**
 * @akasha/mentor — Emotional State (Wave 9.3)
 *
 * Tipo e helpers para classificar o estado emocional detectado na fala
 * do consulente. Usado pelo `detectEmotion()` (intent-detector.ts) e
 * pelo `dispatchToolsForEmotion()` (tool-dispatcher.ts) para selecionar
 * tools Akasha relevantes.
 *
 * NOTA ARQUITETURAL:
 *   Este tipo espelha Wave 9.1 (grimoire/akasha-authority.ts) e deve
 *   ser promovido para `@akasha/types` em Wave 9.2 (orquestrador) —
 *   até lá, vive localmente em `@akasha/mentor` para evitar dependência
 *   cruzada prematura.
 *
 * Por que PT-BR primeiro (não 'anxious'/'lost'/'curious'/'centered'):
 *   - Sistema Akasha é PT-BR first (i18n config do portal).
 *   - Logs e audit LGPD vão exibir o estado em PT-BR.
 *   - Mentor responde sempre em PT-BR (grimoire/mentor/system-prompt.md).
 */
import { z } from 'zod';

/** Estados emocionais suportados pelo Akasha Mentor. */
export type EmotionalState = 'centrado' | 'ansioso' | 'perdido' | 'curioso';

/** Zod schema para validação runtime (ex: body de API route). */
export const EmotionalStateSchema = z.enum(['centrado', 'ansioso', 'perdido', 'curioso']);

/**
 * Type guard: checa se um valor desconhecido é um EmotionalState válido.
 *
 * @example
 *   isEmotionalState('ansioso') // true
 *   isEmotionalState('anxious') // false (PT-BR only)
 *   isEmotionalState(null)      // false
 */
export function isEmotionalState(s: unknown): s is EmotionalState {
  return typeof s === 'string' && EmotionalStateSchema.safeParse(s).success;
}

/**
 * Label human-readable para logs/debug (mesma forma que `intentLabel`
 * no intent-detector.ts).
 */
export function emotionalStateLabel(state: EmotionalState): string {
  const labels: Record<EmotionalState, string> = {
    centrado: 'Centrado / Em paz',
    ansioso: 'Ansioso / Preocupado',
    perdido: 'Perdido / Sem direção',
    curioso: 'Curioso / Exploratório',
  };
  return labels[state];
}
