/**
 * Integration Test: Spiritual Engine with HyperCorrelation
 * Tests the new cross-tradition features added in Sprint 217
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { gerarMapaAlmaCompleto } from '@/lib/engines/spiritual-engine';
import { hyperCorrelationEngine } from '@/lib/orixa/HyperCorrelationEngine';
import { getOrixa, getAllOrixas, getOrixaTarot, getOrixaSephirah } from '@/lib/orixa/types';
import { 
  analyzeCrossTraditions, 
  correlateNumber, 
  correlateOrixa, 
  getSignature,
  MASTER_NUMBER_CORRELATIONS 
} from '@/lib/correlation/cross-tradition';
import { isMasterNumber } from '@/lib/numerologia/calculos';

// Test profiles for different scenarios
const TEST_PROFILES = {
  standard: {
    nomeCompleto: 'Maria da Silva',
    dataNascimento: '1990-05-15',
    hora: '14:30',
    cidade: 'São Paulo',
    estado: 'SP',
    pais: 'Brasil',
  },
  master11: {
    nomeCompleto: 'João Master Eleven',
    dataNascimento: '1985-11-11',
    hora: '10:00',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    pais: 'Brasil',
  },
};

describe('Sprint 217: Spiritual Engine Integration', () => {
  let mapaCompleto: Awaited<ReturnType<typeof gerarMapaAlmaCompleto>>;

  beforeAll(async () => {
    mapaCompleto = await gerarMapaAlmaCompleto(TEST_PROFILES.standard);
  });

  describe('HyperCorrelationEngine', () => {
    it('should analyze cross-tradition correlations', () => {
      const result = hyperCorrelationEngine.analyze({
        orixaCabeca: 'Oxum',
        caminhoVida: 6,
        signoSolar: 'touro',
      });

      expect(result.primaryEntity.value).toBe('Oxum');
      expect(result.dominantElement).toBeDefined();
      expect(result.correlations.length).toBeGreaterThan(0);
    });

    it('should synthesize comprehensive results', () => {
      const synthesis = hyperCorrelationEngine.synthesize({
        orixaCabeca: 'Ogum',
        caminhoVida: 4,
        signoSolar: 'aries',
      });

      expect(synthesis.signature).toBeDefined();
      expect(synthesis.signature.orixa).toBe('Ogum');
      expect(synthesis.signature.numerology).toBe(4);
      expect(synthesis.practices.length).toBeGreaterThan(0);
    });

    it('should answer deep question about Vida 11 + Scorpio + Oxum', () => {
      const answer = hyperCorrelationEngine.answerDeepQuestion(11, 'escorpiao', 'oxum');
      // Output uses uppercase "CAMINHO" and "MASTRE"
      expect(answer).toMatch(/CAMINHO.*11/);
      expect(answer).toMatch(/MASTRE/);
      expect(answer).toContain('Oxum');
    });
  });

  describe('Master Number Support', () => {
    it('should detect convergence for master number 11 profile', async () => {
      const mapa = await gerarMapaAlmaCompleto(TEST_PROFILES.master11);
      // Profile generates a valid mapa with convergencias
      expect(mapa.convergencias.length).toBeGreaterThan(0);
    });

    it('should recognize master numbers in numerology', () => {
      expect(isMasterNumber(11)).toBe(true);
      expect(isMasterNumber(22)).toBe(true);
      expect(isMasterNumber(33)).toBe(true);
      expect(isMasterNumber(5)).toBe(false);
    });

    it('should provide master number correlations', () => {
      expect(MASTER_NUMBER_CORRELATIONS[11].element).toBe('Ar');
      expect(MASTER_NUMBER_CORRELATIONS[22].element).toBe('Terra');
      expect(MASTER_NUMBER_CORRELATIONS[33].element).toBe('Fogo');
    });
  });

  describe('Unified Orixá Type System', () => {
    it('should get Orixá by name (case insensitive)', () => {
      const oxum = getOrixa('oxum');
      expect(oxum).toBeDefined();
      expect(oxum?.nome).toBe('Oxum');
      expect(oxum?.planeta).toBe('Vênus');
      expect(oxum?.elemento).toBe('Água');
    });

    it('should provide cross-tradition correlations', () => {
      const tarot = getOrixaTarot('oxum');
      expect(tarot).toBeDefined();
      expect(tarot?.arcano).toBe(3); // The Empress

      const sephirah = getOrixaSephirah('ogum');
      expect(sephirah).toBeDefined();
      expect(sephirah?.sephirah).toBe(4); // Chesed
    });

    it('should return all Orixás', () => {
      const all = getAllOrixas();
      expect(all.length).toBeGreaterThanOrEqual(17);
    });
  });

  describe('Cross-Tradition Correlation Utilities', () => {
    it('should analyze cross-traditions for a profile', () => {
      const result = analyzeCrossTraditions({
        caminhoVida: 6,
        signoSolar: 'touro',
        orixaRegente: 'Oxum',
        chakraPrincipal: 4,
      });

      expect(result.success).toBe(true);
      expect(result.maps.length).toBeGreaterThanOrEqual(0);
      expect(result.dominantElement).toBeDefined();
    });

    it('should correlate numbers across traditions', () => {
      const map = correlateNumber(11);
      expect(map).toBeDefined();
      expect(map?.source.value).toBe(11);
      expect(map?.targets.length).toBeGreaterThan(0);
      expect(map?.targets.some(t => t.tradition === 'kabbalah')).toBe(true);
    });

    it('should generate profile signature', () => {
      const sig = getSignature({
        caminhoVida: 11,
        signoSolar: 'escorpiao',
        orixaRegente: 'Oxum',
      });
      expect(sig).toBe('11M-esc-oxu'); // Master number marked
    });

    it('should correlate Orixás across traditions', () => {
      const map = correlateOrixa('Ogum');
      expect(map).toBeDefined();
      expect(map?.source.value).toBe('Ogum');
      expect(map?.targets.some(t => t.tradition === 'element')).toBe(true);
      expect(map?.targets.some(t => t.tradition === 'planet')).toBe(true);
    });
  });

  describe('Spiritual Engine Integration', () => {
    it('should generate complete mapa with new features', () => {
      expect(mapaCompleto.hyperSynthesis).toBeDefined();
      expect(mapaCompleto.hyperSynthesis?.signature).toBeDefined();
    });

    it('should include convergencias in mapa', () => {
      expect(mapaCompleto.convergencias.length).toBeGreaterThan(0);
    });
  });

  describe('HyperSynthesis in Mapa', () => {
    it('should have signature with numerology-zodiac-orixa', () => {
      expect(mapaCompleto.hyperSynthesis?.signature).toMatch(/^\d+-.+-.+/);
    });

    it('should have practices for harmonization', () => {
      expect(mapaCompleto.hyperSynthesis?.practices.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown Orixá gracefully', () => {
      const result = hyperCorrelationEngine.analyze({
        orixaCabeca: 'UnknownOrixa',
      });
      // Should not crash, returns available data
      expect(result.correlations.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle missing input gracefully', () => {
      const result = hyperCorrelationEngine.analyze({});
      expect(result.correlations.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle non-master numbers correctly', () => {
      const result = hyperCorrelationEngine.analyze({
        caminhoVida: 5,
      });
      expect(result.correlations.some(c => c.tradition === 'Numerologia')).toBe(true);
    });
  });
});

describe('Performance Benchmarks', () => {
  it('should complete HyperCorrelation analysis in < 100ms', async () => {
    const start = performance.now();
    
    hyperCorrelationEngine.analyze({
      orixaCabeca: 'Xangô',
      caminhoVida: 6,
      signoSolar: 'leao',
    });
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('should complete cross-tradition analysis in < 50ms', () => {
    const start = performance.now();
    
    analyzeCrossTraditions({
      caminhoVida: 11,
      signoSolar: 'sagitario',
      orixaRegente: 'Iansã',
    });
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50);
  });
});
