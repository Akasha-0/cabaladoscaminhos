/**
 * @akasha/core — Testes para práticas-guardrails
 */
import { describe, it, expect } from 'vitest';
import {
  isSafePractice,
  validatePractice,
  GUARDRAILS_PROHIBITED,
  GUARDRAILS_CAUTION,
} from './practices-guardrails';

describe('practices-guardrails', () => {
  describe('isSafePractice', () => {
    it('retorna true para prática segura', () => {
      const safePractice = {
        id: 'test-safe',
        name: 'Prática Segura',
        tradition: 'Teste',
        category: 'banho_de_ervas' as const,
        associations: {},
        lifeAreas: ['teste'],
        howTo: 'Faça algo simples.',
        frequency: 'Diariamente.',
        isSafe: true,
      };

      expect(isSafePractice(safePractice)).toBe(true);
    });

    it('retorna false para prática insegura', () => {
      const unsafePractice = {
        id: 'test-unsafe',
        name: 'Prática Insegura',
        tradition: 'Teste',
        category: 'banho_de_ervas' as const,
        associations: {},
        lifeAreas: ['teste'],
        howTo: 'Faça algo perigoso.',
        frequency: 'Nunca.',
        isSafe: false,
      };

      expect(isSafePractice(unsafePractice)).toBe(false);
    });

    it('trata prática sem isSafe como insegura', () => {
      const practiceWithoutSafeFlag = {
        id: 'test-no-flag',
        name: 'Prática Sem Flag',
        tradition: 'Teste',
        category: 'banho_de_ervas' as const,
        associations: {},
        lifeAreas: ['teste'],
        howTo: 'Faça algo.',
        frequency: 'Às vezes.',
        isSafe: undefined as unknown as boolean,
      };

      expect(isSafePractice(practiceWithoutSafeFlag)).toBe(false);
    });
  });

  describe('validatePractice', () => {
    it('valida prática segura sem warnings', () => {
      const safePractice = {
        id: 'test-safe',
        name: 'Banho de Ervas',
        tradition: 'Candomblé',
        category: 'banho_de_ervas' as const,
        associations: { element: 'agua' },
        lifeAreas: ['limpeza'],
        howTo: 'Ferva ervas e tome banho de imersão por 15 minutos.',
        frequency: 'Semanalmente.',
        isSafe: true,
      };

      const result = validatePractice(safePractice);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('retorna warnings quando prática tem warnings próprios', () => {
      const practiceWithWarnings = {
        id: 'test-warning',
        name: 'Prática com Aviso',
        tradition: 'Teste',
        category: 'banho_de_ervas' as const,
        associations: {},
        lifeAreas: ['teste'],
        howTo: 'Faça algo.',
        frequency: 'Diariamente.',
        isSafe: true,
        warnings: ['Aviso de teste.'],
      };

      const result = validatePractice(practiceWithWarnings);

      expect(result.warnings).toContain('Aviso de teste.');
    });

    it('adiciona código do usuário às recomendações', () => {
      const safePractice = {
        id: 'test-code',
        name: 'Prática Teste',
        tradition: 'Teste',
        category: 'banho_de_ervas' as const,
        associations: {},
        lifeAreas: ['teste'],
        howTo: 'Faça algo simples para testar.',
        frequency: 'Diariamente.',
        isSafe: true,
      };

      const result = validatePractice(safePractice, 'USER-123');

      expect(result.recommendations).toContain('Código de consulta: USER-123');
    });

    it('detecta guardrails de cautela quando aplicável', () => {
      const practiceWithCaution = {
        id: 'test-caution',
        name: 'Prática com Cautela',
        tradition: 'Teste',
        category: 'banho_de_ervas' as const,
        associations: {},
        lifeAreas: ['teste'],
        howTo: 'Faça algo. Uso durante gravidez deve ser evitado.',
        frequency: 'Diariamente.',
        isSafe: true,
      };

      const result = validatePractice(practiceWithCaution);

      expect(result.recommendations.some((r) => r.includes('gravidez'))).toBe(true);
    });

    it('prática insegura retorna isValid false', () => {
      const unsafePractice = {
        id: 'test-unsafe',
        name: 'Prática Perigosa',
        tradition: 'Teste',
        category: 'banho_de_ervas' as const,
        associations: {},
        lifeAreas: ['teste'],
        howTo: 'Faça algo.',
        frequency: 'Nunca.',
        isSafe: false,
      };

      const result = validatePractice(unsafePractice);

      expect(result.isValid).toBe(false);
      expect(result.recommendations).toContain('Consulte um especialista antes de prosseguir.');
    });

    it('detecta guardrails proibidos', () => {
      const practiceWithProhibited = {
        id: 'test-prohibited',
        name: 'Prática Proibida',
        tradition: 'Teste',
        category: 'banho_de_ervas' as const,
        associations: {},
        lifeAreas: ['teste'],
        howTo: 'Faça algo relacionado a cura de doenças.',
        frequency: 'Diariamente.',
        isSafe: true,
      };

      const result = validatePractice(practiceWithProhibited);

      expect(result.isValid).toBe(false);
      expect(result.warnings.some((w) => w.includes('problemática'))).toBe(true);
    });
  });

  describe('GUARDRAILS_PROHIBITED', () => {
    it('contém práticas proibidas definidas', () => {
      expect(GUARDRAILS_PROHIBITED).toContain('cura de doenças');
      expect(GUARDRAILS_PROHIBITED).toContain('manipulação de terceiros');
      expect(GUARDRAILS_PROHIBITED).toContain('previsão de morte');
      expect(GUARDRAILS_PROHIBITED).toContain('pactos com entidades');
      expect(GUARDRAILS_PROHIBITED).toContain('ritual de trabalho sexual');
    });

    it('tem exatamente 5 itens', () => {
      expect(GUARDRAILS_PROHIBITED).toHaveLength(5);
    });
  });

  describe('GUARDRAILS_CAUTION', () => {
    it('contém práticas que requerem cautela', () => {
      expect(GUARDRAILS_CAUTION).toContain('uso durante gravidez');
      expect(GUARDRAILS_CAUTION).toContain('interação com medicamentos');
      expect(GUARDRAILS_CAUTION).toContain('crianças menores de 12 anos');
    });

    it('tem exatamente 3 itens', () => {
      expect(GUARDRAILS_CAUTION).toHaveLength(3);
    });
  });
});
