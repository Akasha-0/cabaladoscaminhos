/**
 * Aláfia Engine — Cálculo das polaridades do Jogo de Búzios
 *
 * Sistema Oracular v1 (canônico). Ver CONTEXT.md §Oráculo / §Sistema Oracular.
 * Fontes: tradição oral iorubá / Merindilogun (Verger, Saraceni).
 */

import { AlafiaPolarity, ALAFIA_INTERPRETATIONS, ALAFIA_LABELS } from './types';

/**
 * Calcula a polaridade de Aláfia dado o número de búzios abertos (0-4).
 */
export function calculateAlafia(buziosOpen: number): AlafiaPolarity {
  if (buziosOpen < 0 || buziosOpen > 4) {
    throw new Error(`Aláfia: número de búzios deve ser 0-4, recebeu ${buziosOpen}`);
  }
  return buziosOpen as AlafiaPolarity;
}

/**
 * Interpretação da polaridade de Aláfia para uso no frontend.
 */
export function interpretAlafia(polarity: AlafiaPolarity): {
  label: string;
  interpretation: string;
  isYes: boolean;
  action: string;
} {
  const isYes = polarity >= AlafiaPolarity.EJIIFE;

  const actions: Record<AlafiaPolarity, string> = {
    [AlafiaPolarity.ALAFIA]: 'Proceder com certeza — o caminho está aberto',
    [AlafiaPolarity.ETAWA]: 'Proceder, mas clarificar os elementos duvidosos primeiro',
    [AlafiaPolarity.EJIIFE]: 'Confirma dupla — seguir com firmeza',
    [AlafiaPolarity.OKANRAN]: 'Parar e investigar antes de prosseguir',
    [AlafiaPolarity.OPIRA]: 'Corte — não forçar este caminho agora',
  };

  return {
    label: ALAFIA_LABELS[polarity],
    interpretation: ALAFIA_INTERPRETATIONS[polarity],
    isYes,
    action: actions[polarity],
  };
}

/**
 * Simula uma tirada de Aláfia (para testes e desenvolvimento).
 * Em produção, a tirada vem do input do usuário.
 */
export function simulateAlafiaThrow(): { polarity: AlafiaPolarity; buziosOpen: number } {
  // 5 resultados possíveis (0-4)
  const buziosOpen = Math.floor(Math.random() * 5);
  return {
    buziosOpen,
    polarity: calculateAlafia(buziosOpen),
  };
}
