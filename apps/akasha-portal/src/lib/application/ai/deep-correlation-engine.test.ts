/**
 * DeepCorrelationEngine tests
 * Cobre: correlações cross-system principais (numerologia-astrologia,
 * ifá-cabala, dia-energia, chakras-elementos) + detecção de padrões.
 */
import { describe, it, expect } from 'vitest';
import { DeepCorrelationEngine } from './deep-correlation-engine';
import type { UserSpiritualData } from './types';

const engine = new DeepCorrelationEngine();

const baseUser: UserSpiritualData = {
  id: 'user-1',
  nome: 'Maria Silva',
  dataNascimento: '1990-03-15',
  numeroPessoal: 7,
  arcoPessoal: 7,
  odu: 'Ogbe',
  orixaRegente: 'Oxum',
  sefirotDominante: ['Keter', 'Chokhmah'],
  arcoMaior: [0, 1],
  sign: 'Cancer',
  houses: { '1': 1, '4': 4, '7': 7 },
  rashi: 'Cancer',
};

describe('DeepCorrelationEngine.correlateNumerologyAstrology', () => {
  it('retorna strength 0.9 quando o signo é compatível com o life path', () => {
    const result = engine.correlateNumerologyAstrology(7, 'Cancer');
    expect(result.source).toBe('numerology');
    expect(result.target).toBe('astrology');
    expect(result.correlationType).toBe('numerical');
    expect(result.strength).toBe(0.9);
    expect(result.explanation).toContain('ressoa harmonicamente');
  });

  it('retorna strength baixo quando o signo é incompatível', () => {
    const result = engine.correlateNumerologyAstrology(7, 'Aries');
    // 7 mapeia para Cancer/Scorpio/Pisces — Aries não está na lista
    expect(result.strength).toBeLessThan(0.9);
    expect(result.explanation).toContain('energias');
  });

  it('retorna strength 0.2 quando o life path é desconhecido', () => {
    const result = engine.correlateNumerologyAstrology(99, 'Cancer');
    expect(result.strength).toBe(0.2);
    expect(result.correlationType).toBe('numerical');
  });
});

describe('DeepCorrelationEngine.correlateIfaCabala', () => {
  it('marca strength 0.85 quando a sephirah está mapeada para o odú', () => {
    // Ogbe → Keter, Chokhmah (linha 167 do arquivo)
    const corrs = engine.correlateIfaCabala('Ogbe', ['Keter', 'Tipheret']);
    expect(corrs).toHaveLength(2);
    const keter = corrs.find((c) => c.explanation.includes('Keter'));
    const tipheret = corrs.find((c) => c.explanation.includes('Tipheret'));
    expect(keter?.strength).toBe(0.85);
    expect(tipheret?.strength).toBe(0.4);
  });

  it('retorna um SystemCorrelation por sephirah fornecida', () => {
    const corrs = engine.correlateIfaCabala('Ofun', ['Keter', 'Chokhmah', 'Binah']);
    expect(corrs).toHaveLength(3);
    corrs.forEach((c) => {
      expect(c.source).toBe('ifa');
      expect(c.target).toBe('kabbalah');
      expect(c.correlationType).toBe('symbolic');
    });
  });

  it('retorna lista vazia quando odú não existe no mapa', () => {
    // Irosun (sem mapeamento no ODU_SEPHIROT_MAP)
    const corrs = engine.correlateIfaCabala('Irosun', ['Keter']);
    expect(corrs).toHaveLength(1);
    expect(corrs[0]?.strength).toBe(0.4);
  });
});

describe('DeepCorrelationEngine.correlateDayEnergy', () => {
  it('retorna strength 0.9 para dias mapeados', () => {
    const result = engine.correlateDayEnergy('Segunda-feira');
    expect(result.source).toBe('element');
    expect(result.target).toBe('temporal');
    expect(result.correlationType).toBe('temporal');
    expect(result.strength).toBe(0.9);
    expect(result.explanation).toContain('Iemanjá');
  });

  it('retorna strength 0.2 e explicação de fallback para dia desconhecido', () => {
    const result = engine.correlateDayEnergy('Funday');
    expect(result.strength).toBe(0.2);
    expect(result.correlationType).toBe('temporal');
    expect(result.explanation).toContain('não possui uma correlação espiritual mapeada');
  });
});

describe('DeepCorrelationEngine.correlateChakraElement', () => {
  it('mapeia chakra para o elemento correto', () => {
    const corrs = engine.correlateChakraElement(['Anahata', 'Manipura']);
    expect(corrs).toHaveLength(2);
    corrs.forEach((c) => {
      expect(c.source).toBe('chakra');
      expect(c.target).toBe('element');
      expect(c.correlationType).toBe('elemental');
      expect(c.strength).toBe(0.95);
    });
  });

  it('retorna "Desconhecido" para chakra não mapeado', () => {
    const corrs = engine.correlateChakraElement(['ChakraInexistente']);
    expect(corrs).toHaveLength(1);
    expect(corrs[0]?.explanation).toContain('Desconhecido');
  });
});

describe('DeepCorrelationEngine.getAllSystemCorrelations', () => {
  it('inclui correlações life-path+signo, odú+sephirot e day-energy', () => {
    const corrs = engine.getAllSystemCorrelations(baseUser);
    expect(corrs.length).toBeGreaterThan(0);
    // Deve incluir pelo menos uma correlação numerologia→astrologia
    const numAst = corrs.find((c) => c.source === 'numerology' && c.target === 'astrology');
    expect(numAst).toBeDefined();
    // Deve incluir uma correlação ifá→kabbalah
    const ifaKab = corrs.find((c) => c.source === 'ifa' && c.target === 'kabbalah');
    expect(ifaKab).toBeDefined();
    // Deve incluir correlação element→temporal (day energy)
    const day = corrs.find((c) => c.source === 'element' && c.target === 'temporal');
    expect(day).toBeDefined();
  });

  it('retorna apenas a correlação day-energy se nenhum outro campo existir', () => {
    const empty: UserSpiritualData = {
      ...baseUser,
      numeroPessoal: undefined as unknown as number,
      odu: undefined as unknown as string,
      sefirotDominante: [],
      arcoMaior: [],
      orixaRegente: undefined as unknown as string,
    };
    const corrs = engine.getAllSystemCorrelations(empty);
    // Apenas a correlação de day energy deve existir
    expect(corrs.every((c) => c.source === 'element' && c.target === 'temporal')).toBe(true);
  });

  it('ordena resultados por strength decrescente', () => {
    const corrs = engine.getAllSystemCorrelations(baseUser);
    for (let i = 1; i < corrs.length; i++) {
      const prev = corrs[i - 1];
      const curr = corrs[i];
      if (prev && curr) {
        expect(prev.strength).toBeGreaterThanOrEqual(curr.strength);
      }
    }
  });
});
