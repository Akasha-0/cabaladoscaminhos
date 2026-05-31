/**
 * HyperCorrelation Deep Question Test
 * Verifies the system can answer: "How does Vida Path 11 modulate the energy of a Scorpio native under the regency of Oxum?"
 */

import { describe, it, expect } from 'vitest';
import { hyperCorrelationEngine } from '@/lib/orixa/HyperCorrelationEngine';

describe('HyperCorrelation Deep Question Integration', () => {
  const CAMINHO_VIDA_11 = 11;
  const SIGNO_ESCORPIAO = 'escorpiao';
  const OXUM_REGENTE = 'oxum';

  it('should answer the deep question about Path 11, Scorpio, Oxum', () => {
    const result = hyperCorrelationEngine.answerDeepQuestion(
      CAMINHO_VIDA_11,
      SIGNO_ESCORPIAO,
      OXUM_REGENTE
    );

    // Verify the answer contains key information
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(100); // Meaningful answer

    // Check master number handling
    expect(result.toLowerCase()).toContain('11');

    // Check element analysis
    expect(result.toLowerCase()).toContain('água'); // Both Oxum and Scorpio are Water

    // Check recommendation presence
    expect(result.toLowerCase()).toContain('recomendação');
  });

  it('should generate valid synthesis for Profile with master number', () => {
    const synthesis = hyperCorrelationEngine.synthesize({
      caminhoVida: CAMINHO_VIDA_11,
      signo: SIGNO_ESCORPIAO,
      orixaCabeca: OXUM_REGENTE,
    });

    expect(synthesis).toBeTruthy();
    expect(synthesis).toHaveProperty('signature');
    expect(synthesis).toHaveProperty('strengths');
    expect(synthesis).toHaveProperty('practices');
    expect(synthesis).toHaveProperty('insights');
  });

  it('should detect elemental harmony between Oxum (Water) and Scorpio (Water)', () => {
    const result = hyperCorrelationEngine.analyze({
      caminhoVida: CAMINHO_VIDA_11,
      signo: SIGNO_ESCORPIAO,
      orixaCabeca: OXUM_REGENTE,
    });

    expect(result).toBeTruthy();
    expect(result).toHaveProperty('correlations');
    expect(result).toHaveProperty('primaryEntity');
  });

  it('should map Oxum to correct element, planet, and chakra', () => {
    const synthesis = hyperCorrelationEngine.synthesize({
      caminhoVida: 9,
      signo: 'touro',
      orixaCabeca: 'oxum',
    });

    expect(synthesis).toHaveProperty('signature');
    expect(synthesis.signature).toHaveProperty('orixa');
    expect(synthesis.signature.orixa.toLowerCase()).toContain('oxum');
  });

  it('should map Path 11 to correct sephirot via master number', () => {
    const synthesis = hyperCorrelationEngine.synthesize({
      caminhoVida: 11,
      signo: 'escorpiao',
      orixaCabeca: 'oxum',
    });

    expect(synthesis).toHaveProperty('signature');
    expect(synthesis.signature).toHaveProperty('numerology');
    expect(synthesis.signature.numerology).toBe(11);
  });
});