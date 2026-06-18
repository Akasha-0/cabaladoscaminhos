/**
 * @akasha/core — Guardrails para Práticas Integrativas
 * Validação e segurança para práticas espirituais e integrativas.
 */
import type { IntegrativePractice, PracticeCategory } from '../../core-iching/src/types';

/**
 * Prática integrativa canônica.
 */
export interface Practice {
  id: string;
  name: string;
  tradition: string;
  category: PracticeCategory;
  associations: {
    element?: string;
    orixa?: string;
    color?: string;
    planet?: string;
    chakra?: number;
    hexagrams?: number[];
  };
  lifeAreas: string[];
  howTo: string;
  frequency: string;
  isSafe: boolean;
  warnings?: string[];
}

/**
 * Resultado de validação de prática.
 */
export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
}

/** Guardrails - práticas absolutamente proibidas. */
export const GUARDRAILS_PROHIBITED = [
  'cura de doenças',
  'manipulação de terceiros',
  'previsão de morte',
  'pactos com entidades',
  'ritual de trabalho sexual',
] as const;

/** Guardrails - práticas que requerem cautela. */
export const GUARDRAILS_CAUTION = [
  'uso durante gravidez',
  'interação com medicamentos',
  'crianças menores de 12 anos',
] as const;

/**
 * Verifica se uma prática é segura.
 * @param practice - Prática a ser verificada
 * @returns true se a prática é segura
 */
export function isSafePractice(practice: IntegrativePractice | Practice): boolean {
  return practice.isSafe === true;
}

/**
 * Valida uma prática contra os guardrails.
 * @param practice - Prática a ser validada
 * @param userCode - Código do usuário (opcional, para contexto adicional)
 * @returns Resultado da validação
 */
export function validatePractice(
  practice: IntegrativePractice | Practice,
  userCode?: string
): ValidationResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Verifica se a prática é marcada como segura
  if (!practice.isSafe) {
    warnings.push('Esta prática não é marcada como segura.');
    recommendations.push('Consulte um especialista antes de prosseguir.');
    return { isValid: false, warnings, recommendations };
  }

  // Verifica warnings da própria prática
  if (practice.warnings && practice.warnings.length > 0) {
    warnings.push(...practice.warnings);
  }

  // Verifica guardrails de cautela
  for (const caution of GUARDRAILS_CAUTION) {
    const hasCaution =
      practice.howTo.toLowerCase().includes(caution) ||
      practice.warnings?.some((w) => w.toLowerCase().includes(caution));

    if (hasCaution) {
      recommendations.push(`Tenha cautela: ${caution}.`);
    }
  }

  // Verifica guardrails proibidos
  for (const prohibited of GUARDRAILS_PROHIBITED) {
    const isProhibited =
      practice.howTo.toLowerCase().includes(prohibited) ||
      practice.name.toLowerCase().includes(prohibited);

    if (isProhibited) {
      warnings.push(`Prática potencialmente problemática: "${prohibited}".`);
      recommendations.push('Esta prática não é recomendada pelo sistema Akasha.');
    }
  }

  // Adiciona recomendações baseadas no contexto
  if (userCode) {
    recommendations.push(`Código de consulta: ${userCode}`);
  }

  // Verifica se a prática tem instruções claras
  if (!practice.howTo || practice.howTo.length < 10) {
    warnings.push('Instruções de como realizar a prática são incompletas.');
  }

  // Verifica se a prática tem frequência definida
  if (!practice.frequency || practice.frequency.length < 5) {
    warnings.push('Frequência recomendada não está claramente definida.');
  }

  const isValid = warnings.length === 0 || warnings.every((w) => !w.includes('problemática'));

  return { isValid, warnings, recommendations };
}
