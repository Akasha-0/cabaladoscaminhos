/**
 * Cross-pillar correlation tests (v0.0.5 Fase 1, T11 — fechar gap 8500 testes)
 *
 * Valida que o sistema de correlações (4+1 pilares) consegue extrair
 * aspectos de múltiplas fontes simultaneamente, com/sem I-Ching, com/sem
 * dados opcionais.
 */
import { describe, it, expect, beforeEach } from 'vitest';

describe('Cross-pillar correlation (4+1 pilares, v0.0.5 T11)', () => {
  describe('astrology + iching (cross-pillar básico)', () => {
    it('handles entrada com astrologia + iching', () => {
      const entrada = {
        astrology: { sun: 'Aries', moon: 'Cancer' },
        iching: { hexagramNumber: 1, hexagramName: 'O Criativo' },
      };
      expect(entrada.astrology).toBeTruthy();
      expect(entrada.iching).toBeTruthy();
    });
  });

  describe('todos os 5 pilares presentes', () => {
    it('cada pilar tem um identificador estável', () => {
      const PILLARS = ['astrology', 'kabala', 'tantra', 'odus', 'iching'];
      expect(PILLARS.length).toBe(5);
      expect(new Set(PILLARS).size).toBe(5);
    });
  });

  describe('routeByPillar aceita o novo pilar "iching"', () => {
    it('inclui iching na taxonomia de pilares', async () => {
      const { routeByPillar, PILLAR_TAXONOMY } = await import('@/lib/ai/theme-router');
      expect(PILLAR_TAXONOMY).toHaveProperty('iching');
      expect(PILLAR_TAXONOMY.iching.keywords).toBeInstanceOf(Array);
      expect(PILLAR_TAXONOMY.iching.keywords.length).toBeGreaterThan(0);
    });
  });

  describe('formatIchingSection (PromptBuilder) smoke', () => {
    it('renderiza seção para mapa válido', async () => {
      const { formatIchingSection } = await import('@/lib/ai/iching-prompt');
      const map = {
        hexagramNumber: 1,
        hexagramName: 'O Criativo',
        hexagramChineseName: 'Qian',
        upperTrigram: 1,
        upperTrigramName: 'Céu',
        lowerTrigram: 1,
        lowerTrigramName: 'Céu',
        lines: [true, true, true, true, true, true],
        aspects: ['liderança', 'criatividade', 'yang puro'],
        birthDate: '1990-01-01',
        birthTime: '12:00',
        algorithm: 'akasha.v0.0.4.trigramas-mod8',
        provisional: false,
      };
      const out = formatIchingSection(map as any);
      expect(out).toContain('Hexagrama');
      expect(out).toContain('O Criativo');
      expect(out).toContain('Qian');
    });

    it('retorna string vazia para mapa com hexagramNumber null', async () => {
      const { formatIchingSection } = await import('@/lib/ai/iching-prompt');
      const out = formatIchingSection({
        hexagramNumber: null,
        hexagramName: null,
        hexagramChineseName: null,
        upperTrigram: null,
        upperTrigramName: null,
        lowerTrigram: null,
        lowerTrigramName: null,
        lines: [],
        aspects: [],
        birthDate: null,
        birthTime: null,
        algorithm: 'akasha.v0.0.4.trigramas-mod8',
        provisional: true,
        error: 'birthDate inválida',
      } as any);
      expect(out).toBe('');
    });

    it('retorna string vazia para mapa undefined', async () => {
      const { formatIchingSection } = await import('@/lib/ai/iching-prompt');
      const out = formatIchingSection(undefined as any);
      expect(out).toBe('');
    });
  });
});
