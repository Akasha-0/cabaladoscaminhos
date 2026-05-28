/**
 * Oracle AI Unit Tests
 *
 * Tests for Oracle AI service including generateOracleResponse,
 * keyword routing, and spiritual context handling.
 */

import { describe, it, expect } from 'vitest';
import {
  generateOracleResponse,
  getOracleSystemPrompt,
  type OracleResponse,
  type OracleContext,
  type CaminhoType,
} from '@/lib/ai/oracle';

// ============================================
// generateOracleResponse Tests
// ============================================

describe('generateOracleResponse', () => {
  it('should return a valid OracleResponse structure', async () => {
    const result = await generateOracleResponse('Ola Oraculo');

    expect(result).toHaveProperty('resposta');
    expect(result).toHaveProperty('referencias');
    expect(result).toHaveProperty('caminho');
    expect(result).toHaveProperty('sefirot');
    expect(result).toHaveProperty('orixas');
    expect(result).toHaveProperty('arcano');
    expect(result).toHaveProperty('affirmation');
  });

  it('should return a non-empty resposta string', async () => {
    const result = await generateOracleResponse('Qual meu destino?');

    expect(typeof result.resposta).toBe('string');
    expect(result.resposta.length).toBeGreaterThan(0);
  });

  it('should return an array of referencias', async () => {
    const result = await generateOracleResponse('Ola Oraculo');

    expect(Array.isArray(result.referencias)).toBe(true);
    expect(result.referencias.length).toBeGreaterThan(0);
  });

  it('should return an array of sefirot', async () => {
    const result = await generateOracleResponse('Ola Oraculo');

    expect(Array.isArray(result.sefirot)).toBe(true);
    expect(result.sefirot.length).toBeGreaterThan(0);
  });

  it('should return an array of orixas', async () => {
    const result = await generateOracleResponse('Ola Oraculo');

    expect(Array.isArray(result.orixas)).toBe(true);
    expect(result.orixas.length).toBeGreaterThan(0);
  });

  it('should return a valid arcano string', async () => {
    const result = await generateOracleResponse('Ola Oraculo');

    expect(typeof result.arcano).toBe('string');
    expect(result.arcano.length).toBeGreaterThan(0);
  });

  it('should return a non-empty affirmation string', async () => {
    const result = await generateOracleResponse('Ola Oraculo');

    expect(typeof result.affirmation).toBe('string');
    expect(result.affirmation.length).toBeGreaterThan(0);
  });
});

// ============================================
// Keyword Routing Tests
// ============================================

describe('Keyword Routing', () => {
  describe('Path and Destiny keywords', () => {
    it('should route "caminho" keyword to path response', async () => {
      const result = await generateOracleResponse('Qual caminho devo seguir?');

      expect(result.resposta).toContain('caminho');
      expect(result.resposta).toContain('Sephirot');
    });

    it('should route "destino" keyword to path response', async () => {
      const result = await generateOracleResponse('Qual e meu destino hoje?');

      expect(result.resposta).toContain('caminho');
      expect(result.resposta).toContain('Sephirot');
    });

    it('should include sefirot in path response', async () => {
      const result = await generateOracleResponse('Fale sobre meu caminho');

      expect(result.resposta).toContain('Sephirot');
      expect(result.sefirot.length).toBeGreaterThan(0);
    });
  });

  describe('Protection keywords', () => {
    it('should route "protecao" keyword to protection response', async () => {
      const result = await generateOracleResponse('Preciso de protecao');

      expect(result.resposta).toContain('Arcanjo');
      expect(result.resposta).toContain('protecao');
    });

    it('should route "proteger" keyword to protection response', async () => {
      const result = await generateOracleResponse('Como me proteger?');

      expect(result.resposta).toContain('Arcanjo');
      expect(result.resposta).toContain('protecao');
    });
  });

  describe('Love and Relationship keywords', () => {
    it('should route "amor" keyword to love response', async () => {
      const result = await generateOracleResponse('Sobre o amor na minha vida');

      expect(result.resposta).toContain('Oxum');
      expect(result.resposta).toContain('amor');
    });

    it('should route "relacao" keyword to love response', async () => {
      const result = await generateOracleResponse('Minha relacao esta estagnada');

      expect(result.resposta).toContain('Oxum');
      expect(result.resposta).toContain('amor');
    });

    it('should include coracao reference in love response', async () => {
      const result = await generateOracleResponse('Fale sobre amor e relacionamentos');

      expect(result.resposta).toContain('amor');
    });
  });

  describe('Prosperity and Money keywords', () => {
    it('should route "dinheiro" keyword to prosperity response', async () => {
      const result = await generateOracleResponse('Preciso de mais dinheiro');

      expect(result.resposta).toContain('Oxossi');
      expect(result.resposta).toMatch(/dinheiro|prosperidade|caminho/i);
    });

    it('should route "prosperidade" keyword to prosperity response', async () => {
      const result = await generateOracleResponse('Como aumentar minha prosperidade?');

      expect(result.resposta).toContain('Oxossi');
    });

    it('should route "trabalho" keyword to prosperity response', async () => {
      const result = await generateOracleResponse('O trabalho esta difficile');

      expect(result.resposta).toContain('Oxossi');
    });
  });

  describe('Health and Healing keywords', () => {
    it('should route "saude" keyword to health response', async () => {
      const result = await generateOracleResponse('Fale sobre minha saude');

      expect(result.resposta).toContain('Omolu');
      expect(result.resposta).toContain('chakra');
    });

    it('should route "cura" keyword to health response', async () => {
      const result = await generateOracleResponse('Preciso de cura spiritual');

      expect(result.resposta).toContain('Omolu');
    });
  });

  describe('Decision and Choice keywords', () => {
    it('should route "decisao" keyword to decision response', async () => {
      const result = await generateOracleResponse('Preciso tomar uma decisao importante');

      expect(result.resposta).toContain('Torre');
      expect(result.resposta).toMatch(/decisao|escolha|inflexao/i);
    });

    it('should route "escolha" keyword to decision response', async () => {
      const result = await generateOracleResponse('Nao sei que escolha fazer');

      expect(result.resposta).toContain('Torre');
    });
  });
});

// ============================================
// Spiritual Context Tests
// ============================================

describe('Spiritual Context', () => {
  describe('Caminho Type Handling', () => {
    it('should apply caminho-do-meio flourish', async () => {
      const context: OracleContext = { caminho: 'caminho-do-meio' };
      const result = await generateOracleResponse('Ola Oraculo', context);

      expect(result.caminho).toBe('caminho-do-meio');
      expect(result.resposta).toContain('intuicao');
    });

    it('should apply caminho-da-mao-direita flourish', async () => {
      const context: OracleContext = { caminho: 'caminho-da-mao-direita' };
      const result = await generateOracleResponse('Ola Oraculo', context);

      expect(result.caminho).toBe('caminho-da-mao-direita');
      expect(result.resposta).toContain('luz');
      expect(result.resposta).toContain('Oxala');
    });

    it('should apply caminho-da-mao-esquerda flourish', async () => {
      const context: OracleContext = { caminho: 'caminho-da-mao-esquerda' };
      const result = await generateOracleResponse('Ola Oraculo', context);

      expect(result.caminho).toBe('caminho-da-mao-esquerda');
      expect(result.resposta).toContain('poder');
      expect(result.resposta).toContain('sombras');
    });

    it('should default to caminho-do-meio when no caminho provided', async () => {
      const result = await generateOracleResponse('Ola Oraculo');

      expect(result.caminho).toBe('caminho-do-meio');
    });
  });

  describe('Odu Context', () => {
    it('should include odu in response when provided', async () => {
      const context: OracleContext = { odu: 'Oxum' };
      const result = await generateOracleResponse('Fale sobre protecao', context);

      expect(result.resposta).toContain('Oxum');
    });
  });

  describe('Referencias', () => {
    it('should return biblical references', async () => {
      const result = await generateOracleResponse('Ola Oraculo');

      expect(result.referencias.length).toBeGreaterThan(0);
      result.referencias.forEach((ref: string) => {
        expect(typeof ref).toBe('string');
        expect(ref.length).toBeGreaterThan(0);
      });
    });

    it('should return between 2 and 4 references', async () => {
      const result = await generateOracleResponse('Ola Oraculo');

      expect(result.referencias.length).toBeGreaterThanOrEqual(2);
      expect(result.referencias.length).toBeLessThanOrEqual(4);
    });
  });

  describe('Sefirot and Aromas', () => {
    it('should return sefirot array with valid structure', async () => {
      const result = await generateOracleResponse('Ola Oraculo');

      expect(result.sefirot).toBeInstanceOf(Array);
      result.sefirot.forEach((sefira: string) => {
        expect(typeof sefira).toBe('string');
        expect(sefira.length).toBeGreaterThan(0);
      });
    });

    it('should return orixas array with valid structure', async () => {
      const result = await generateOracleResponse('Ola Oraculo');

      expect(result.orixas).toBeInstanceOf(Array);
      result.orixas.forEach((orixa: string) => {
        expect(typeof orixa).toBe('string');
        expect(orixa.length).toBeGreaterThan(0);
      });
    });
  });
});

// ============================================
// getOracleSystemPrompt Tests
// ============================================

describe('getOracleSystemPrompt', () => {
  it('should return a non-empty string', () => {
    const prompt = getOracleSystemPrompt();

    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('should contain Oraculo reference', () => {
    const prompt = getOracleSystemPrompt();

    expect(prompt).toContain('Oraculo');
  });

  it('should contain Cabala reference', () => {
    const prompt = getOracleSystemPrompt();

    expect(prompt).toMatch(/Cabala|cabala/i);
  });

  it('should be consistent across multiple calls', () => {
    const prompt1 = getOracleSystemPrompt();
    const prompt2 = getOracleSystemPrompt();

    expect(prompt1).toBe(prompt2);
  });
});

// ============================================
// Integration Tests
// ============================================

describe('Oracle Integration', () => {
  it('should handle empty prompt gracefully', async () => {
    const result = await generateOracleResponse('');

    expect(result).toHaveProperty('resposta');
    expect(result.resposta.length).toBeGreaterThan(0);
  });

  it('should handle special characters in prompt', async () => {
    const result = await generateOracleResponse('Qual é o @caminho🔥?');

    expect(result).toHaveProperty('resposta');
    expect(result.resposta.length).toBeGreaterThan(0);
  });

  it('should handle repeated calls without errors', async () => {
    const calls = [
      generateOracleResponse('Fale sobre caminho'),
      generateOracleResponse('Fale sobre amor'),
      generateOracleResponse('Fale sobre protecao'),
    ];

    const results = await Promise.all(calls);

    results.forEach((result) => {
      expect(result).toHaveProperty('resposta');
      expect(result).toHaveProperty('arcano');
    });
  });

  it('should handle complex context with all fields', async () => {
    const context: OracleContext = {
      dataNascimento: '1990-01-15',
      numeroPessoal: 7,
      odu: 'Oxum',
      caminho: 'caminho-da-mao-direita',
      faseLua: 'Lua Cheia',
    };

    const result = await generateOracleResponse('Fale comigo', context);

    expect(result).toHaveProperty('resposta');
    expect(result.caminho).toBe('caminho-da-mao-direita');
  });
});
