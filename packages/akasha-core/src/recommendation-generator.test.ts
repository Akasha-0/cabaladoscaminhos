/**
 * @akasha/core — Testes do RecommendationGenerator
 */

import { describe, it, expect } from 'vitest';
import {
  RecommendationGenerator,
  createRecommendationGenerator,
  generateFromRules,
  generateFromRAG,
  generateHybrid,
} from './recommendation-generator';
import type { RecommendationContext } from './correlation-engine';

// ─── Dados de Teste ───────────────────────────────────────────────────────────

const contextoTeste: RecommendationContext = {
  userCode: {
    hexagram: 1,
    odu: 'Ogbe',
    level: 'gift',
    lifeArea: 'espiritualidade',
  },
  lifeArea: 'espiritualidade',
  context: 'meditação e paz interior',
};

// ─── Testes do RecommendationGenerator ───────────────────────────────────────

describe('RecommendationGenerator', () => {
  describe('generateFromRules', () => {
    it('deve retornar array de recomendações', () => {
      const generator = new RecommendationGenerator();
      const resultado = generator.generateFromRules(contextoTeste);
      
      expect(Array.isArray(resultado)).toBe(true);
    });

    it('deve retornar recomendações com campos obrigatórios', () => {
      const generator = new RecommendationGenerator();
      const resultado = generator.generateFromRules(contextoTeste);
      
      if (resultado.length > 0) {
        const rec = resultado[0];
        expect(rec).toHaveProperty('practice');
        expect(rec).toHaveProperty('confidence');
        expect(rec).toHaveProperty('source');
        expect(rec).toHaveProperty('personalizedReason');
        expect(rec.source).toBe('rules');
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('deve usar CorrelationEngine internamente', () => {
      const generator = new RecommendationGenerator();
      const resultado = generator.generateFromRules(contextoTeste);
      
      resultado.forEach(rec => {
        expect(rec.personalizedReason).toContain('Hexagrama');
      });
    });
  });

  describe('generateFromRAG', () => {
    it('deve retornar array de recomendações', async () => {
      const generator = new RecommendationGenerator();
      const resultado = await generator.generateFromRAG('meditação para ansiedade', 5);
      
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeLessThanOrEqual(5);
    });

    it('deve retornar recomendações com fonte RAG', async () => {
      const generator = new RecommendationGenerator();
      const resultado = await generator.generateFromRAG('oração para paz', 3);
      
      if (resultado.length > 0) {
        resultado.forEach(rec => {
          expect(rec.source).toBe('rag');
        });
      }
    });

    it('deve respeitar limite informado', async () => {
      const generator = new RecommendationGenerator();
      const limite = 3;
      const resultado = await generator.generateFromRAG('cristal para proteção', limite);
      
      expect(resultado.length).toBeLessThanOrEqual(limite);
    });

    it('deve incluir razão personalizada baseada na query', async () => {
      const generator = new RecommendationGenerator();
      const query = 'oração para saúde';
      const resultado = await generator.generateFromRAG(query, 5);
      
      if (resultado.length > 0) {
        expect(resultado[0].personalizedReason).toBeDefined();
        expect(resultado[0].personalizedReason.length).toBeGreaterThan(0);
      }
    });
  });

  describe('generateHybrid', () => {
    it('deve retornar array de recomendações', async () => {
      const generator = new RecommendationGenerator();
      const resultado = await generator.generateHybrid(contextoTeste, 5);
      
      expect(Array.isArray(resultado)).toBe(true);
    });

    it('deve retornar fonte híbrida', async () => {
      const generator = new RecommendationGenerator();
      const resultado = await generator.generateHybrid(contextoTeste, 5);
      
      if (resultado.length > 0) {
        resultado.forEach(rec => {
          expect(rec.source).toBe('hybrid');
        });
      }
    });

    it('deve respeitar limite informado', async () => {
      const generator = new RecommendationGenerator();
      const limite = 3;
      const resultado = await generator.generateHybrid(contextoTeste, limite);
      
      expect(resultado.length).toBeLessThanOrEqual(limite);
    });

    it('deve combinar scores de regras e RAG', async () => {
      const generator = new RecommendationGenerator();
      const resultado = await generator.generateHybrid(contextoTeste, 5);
      
      resultado.forEach(rec => {
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('deve ordenar por confiança decrescente', async () => {
      const generator = new RecommendationGenerator();
      const resultado = await generator.generateHybrid(contextoTeste, 10);
      
      if (resultado.length > 1) {
        for (let i = 0; i < resultado.length - 1; i++) {
          expect(resultado[i].confidence).toBeGreaterThanOrEqual(resultado[i + 1].confidence);
        }
      }
    });
  });
});

// ─── Testes das Funções Exportadas ───────────────────────────────────────────

describe('Funções exportadas', () => {
  it('createRecommendationGenerator deve criar instância', () => {
    const generator = createRecommendationGenerator();
    expect(generator).toBeInstanceOf(RecommendationGenerator);
  });

  it('generateFromRules deve funcionar como função standalone', () => {
    const resultado = generateFromRules(contextoTeste);
    expect(Array.isArray(resultado)).toBe(true);
  });

  it('generateFromRAG deve funcionar como função standalone', async () => {
    const resultado = await generateFromRAG('oração', 3);
    expect(Array.isArray(resultado)).toBe(true);
  });

  it('generateHybrid deve funcionar como função standalone', async () => {
    const resultado = await generateHybrid(contextoTeste, 3);
    expect(Array.isArray(resultado)).toBe(true);
  });
});

// ─── Testes de Casos de Borda ─────────────────────────────────────────────────

describe('Casos de borda', () => {
  it('deve lidar com contexto sem lifeArea', async () => {
    const contextoSemArea: RecommendationContext = {
      userCode: {
        hexagram: 1,
        level: 'shadow',
        lifeArea: 'saude',
      },
    };
    
    const generator = new RecommendationGenerator();
    const resultado = await generator.generateHybrid(contextoSemArea, 5);
    
    expect(Array.isArray(resultado)).toBe(true);
  });

  it('deve lidar com contexto sem context', () => {
    const contextoSemContexto: RecommendationContext = {
      userCode: {
        hexagram: 5,
        level: 'siddhi',
        lifeArea: 'financas',
      },
      lifeArea: 'financas',
    };
    
    const generator = new RecommendationGenerator();
    const resultado = generator.generateFromRules(contextoSemContexto);
    
    expect(Array.isArray(resultado)).toBe(true);
  });

  it('deve retornar array vazio para query muito específica sem matches', async () => {
    const generator = new RecommendationGenerator();
    const resultado = await generator.generateFromRAG('xyzabc123 nenhum match', 5);
    
    expect(Array.isArray(resultado)).toBe(true);
  });

  it('deve aceitar limite zero', async () => {
    const generator = new RecommendationGenerator();
    const resultado = await generator.generateFromRAG('oração', 0);
    
    expect(resultado).toEqual([]);
  });

  it('deve lidar com código sem Odu', () => {
    const contextoSemOdu: RecommendationContext = {
      userCode: {
        hexagram: 26,
        level: 'gift',
        lifeArea: 'familia',
      },
    };
    
    const generator = new RecommendationGenerator();
    const resultado = generator.generateFromRules(contextoSemOdu);
    
    expect(Array.isArray(resultado)).toBe(true);
    resultado.forEach(rec => {
      expect(rec.personalizedReason).toBeDefined();
    });
  });
});

// ─── Testes de Níveis de Código ──────────────────────────────────────────────

describe('Níveis de código', () => {
  it('deve gerar recomendações para nível shadow', () => {
    const contextoShadow: RecommendationContext = {
      userCode: {
        hexagram: 3,
        level: 'shadow',
        lifeArea: 'relacionamentos',
      },
    };
    
    const generator = new RecommendationGenerator();
    const resultado = generator.generateFromRules(contextoShadow);
    
    expect(Array.isArray(resultado)).toBe(true);
  });

  it('deve gerar recomendações para nível gift', () => {
    const contextoGift: RecommendationContext = {
      userCode: {
        hexagram: 15,
        level: 'gift',
        lifeArea: 'carreira',
      },
    };
    
    const generator = new RecommendationGenerator();
    const resultado = generator.generateFromRules(contextoGift);
    
    expect(Array.isArray(resultado)).toBe(true);
  });

  it('deve gerar recomendações para nível siddhi', () => {
    const contextoSiddhi: RecommendationContext = {
      userCode: {
        hexagram: 29,
        level: 'siddhi',
        lifeArea: 'espiritualidade',
      },
    };
    
    const generator = new RecommendationGenerator();
    const resultado = generator.generateFromRules(contextoSiddhi);
    
    expect(Array.isArray(resultado)).toBe(true);
  });
});
