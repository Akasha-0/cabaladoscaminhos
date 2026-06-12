import { describe, it, expect, beforeEach } from 'vitest';
import type { IntegrativePractice } from '../../core-iching/src/types';
import {
  CorrelationEngine,
  createCorrelationEngine,
  quickScore,
  type AkashaCode,
  type LifeArea,
  type RecommendationContext,
} from './correlation-engine';

// ─── Dados de Teste ───────────────────────────────────────────────────────────

const makePractice = (overrides: Partial<IntegrativePractice> = {}): IntegrativePractice => ({
  id: 'test-1',
  name: 'Teste de Prática',
  tradition: 'I Ching',
  category: 'banho_de_ervas',
  associations: {},
  lifeAreas: ['espiritualidade'],
  howTo: 'Faça um banho de ervas simples.',
  frequency: 'Semanalmente',
  isSafe: true,
  ...overrides,
});

const defaultCode: AkashaCode = {
  hexagram: 1,
  odu: 'Oyekun',
  level: 'gift',
  lifeArea: 'espiritualidade',
};

const defaultContext: RecommendationContext = {
  userCode: defaultCode,
  lifeArea: 'espiritualidade',
  context: 'Teste',
};

// ─── Testes: CorrelationEngine Instanciação ────────────────────────────────────

describe('CorrelationEngine - Instanciação', () => {
  it('cria instância com contexto válido', () => {
    const engine = new CorrelationEngine(defaultContext);
    expect(engine).toBeDefined();
  });

  it('cria instância via createCorrelationEngine', () => {
    const engine = createCorrelationEngine(defaultContext);
    expect(engine).toBeInstanceOf(CorrelationEngine);
  });

  it('aceita código sem Odu', () => {
    const context: RecommendationContext = {
      userCode: { hexagram: 5, level: 'shadow', lifeArea: 'saude' },
    };
    const engine = new CorrelationEngine(context);
    expect(engine).toBeDefined();
  });
});

// ─── Testes: findCorrelations ────────────────────────────────────────────────

describe('CorrelationEngine - findCorrelations', () => {
  let engine: CorrelationEngine;

  beforeEach(() => {
    engine = new CorrelationEngine(defaultContext);
  });

  it('retorna correlações para hexagrama 1', () => {
    const correlations = engine.findCorrelations();
    expect(correlations.length).toBeGreaterThan(0);
  });

  it('correlações incluem I Ching', () => {
    const correlations = engine.findCorrelations();
    const hasIching = correlations.some(c => 
      c.source.tradition === 'iching' || c.target.tradition === 'iching'
    );
    expect(hasIching).toBe(true);
  });

  it('correlações incluem Ifá quando Odu disponível', () => {
    const correlations = engine.findCorrelations();
    const hasIfa = correlations.some(c =>
      c.source.tradition === 'ifa' || c.target.tradition === 'ifa'
    );
    expect(hasIfa).toBe(true);
  });

  it('correlações têm estrutura válida', () => {
    const correlations = engine.findCorrelations();
    for (const corr of correlations) {
      expect(corr).toHaveProperty('id');
      expect(corr).toHaveProperty('source');
      expect(corr).toHaveProperty('target');
      expect(corr).toHaveProperty('correlationType');
      expect(corr).toHaveProperty('strength');
      expect(corr).toHaveProperty('description');
    }
  });

  it('força de correlação é válida', () => {
    const correlations = engine.findCorrelations();
    const validStrengths = ['strong', 'medium', 'weak'];
    for (const corr of correlations) {
      expect(validStrengths).toContain(corr.strength);
    }
  });
});

// ─── Testes: scorePractice ───────────────────────────────────────────────────

describe('CorrelationEngine - scorePractice', () => {
  let engine: CorrelationEngine;

  beforeEach(() => {
    engine = new CorrelationEngine(defaultContext);
  });

  it('retorna ScoredPractice válido', () => {
    const practice = makePractice();
    const scored = engine.scorePractice(practice);

    expect(scored).toHaveProperty('practice');
    expect(scored).toHaveProperty('score');
    expect(scored).toHaveProperty('reason');
    expect(scored).toHaveProperty('correlation');
  });

  it('score está entre 0 e 100', () => {
    const practice = makePractice();
    const scored = engine.scorePractice(practice);

    expect(scored.score).toBeGreaterThanOrEqual(0);
    expect(scored.score).toBeLessThanOrEqual(100);
  });

  it('prática segura tem score > 0', () => {
    const safePractice = makePractice({ isSafe: true });
    const scored = engine.scorePractice(safePractice);
    expect(scored.score).toBeGreaterThan(0);
  });

  it('prática insegura tem score penalizado', () => {
    const unsafePractice = makePractice({ isSafe: false });
    const safePractice = makePractice({ isSafe: true });
    
    const scoredUnsafe = engine.scorePractice(unsafePractice);
    const scoredSafe = engine.scorePractice(safePractice);
    
    // Prática insegura deve ter score menor que segura equivalente
    expect(scoredUnsafe.score).toBeLessThan(scoredSafe.score);
  });

  it('razão menciona área de vida quando aplicável', () => {
    const practice = makePractice({
      lifeAreas: ['espiritualidade'],
    });
    const scored = engine.scorePractice(practice);
    expect(scored.reason.toLowerCase()).toContain('espiritualidade');
  });

  it('razão menciona hexagrama quando correlacionado', () => {
    const practice = makePractice({
      associations: { hexagrams: [1] },
    });
    const scored = engine.scorePractice(practice);
    expect(scored.reason).toContain('1');
  });
});

// ─── Testes: scorePractices (múltiplas) ───────────────────────────────────────

describe('CorrelationEngine - scorePractices', () => {
  let engine: CorrelationEngine;

  beforeEach(() => {
    engine = new CorrelationEngine(defaultContext);
  });

  it('retorna array de ScoredPractice', () => {
    const practices = [
      makePractice({ id: 'p1' }),
      makePractice({ id: 'p2' }),
    ];
    const scored = engine.scorePractices(practices);

    expect(scored).toHaveLength(2);
    expect(scored[0]).toHaveProperty('score');
    expect(scored[1]).toHaveProperty('score');
  });

  it('preserva ordem das práticas', () => {
    const practices = [
      makePractice({ id: 'p1', name: 'Primeira' }),
      makePractice({ id: 'p2', name: 'Segunda' }),
    ];
    const scored = engine.scorePractices(practices);

    expect(scored[0].practice.id).toBe('p1');
    expect(scored[1].practice.id).toBe('p2');
  });

  it('array vazio retorna array vazio', () => {
    const scored = engine.scorePractices([]);
    expect(scored).toEqual([]);
  });
});

// ─── Testes: quickScore ───────────────────────────────────────────────────────

describe('quickScore', () => {
  it('retorna número entre 0 e 100', () => {
    const practice = makePractice();
    const score = quickScore(practice, defaultCode);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('aceita lifeArea opcional', () => {
    const practice = makePractice();
    const score = quickScore(practice, defaultCode, 'espiritualidade');
    expect(typeof score).toBe('number');
  });
});

// ─── Testes: Níveis de Código ────────────────────────────────────────────────

describe('CorrelationEngine - Níveis de Código', () => {
  it('nível siddhi', () => {
    const code: AkashaCode = { hexagram: 1, level: 'siddhi', lifeArea: 'espiritualidade' };
    const engine = new CorrelationEngine({ userCode: code });

    const practice = makePractice({ category: 'oracao' });
    const scored = engine.scorePractice(practice);

    expect(scored.score).toBeGreaterThan(0);
  });

  it('nível gift', () => {
    const code: AkashaCode = { hexagram: 1, level: 'gift', lifeArea: 'espiritualidade' };
    const engine = new CorrelationEngine({ userCode: code });

    const practice = makePractice({ category: 'cromoterapia' });
    const scored = engine.scorePractice(practice);

    expect(scored.score).toBeGreaterThan(0);
  });

  it('nível shadow', () => {
    const code: AkashaCode = { hexagram: 1, level: 'shadow', lifeArea: 'espiritualidade' };
    const engine = new CorrelationEngine({ userCode: code });

    const practice = makePractice({ category: 'banho_de_ervas' });
    const scored = engine.scorePractice(practice);

    expect(scored.score).toBeGreaterThan(0);
  });
});

// ─── Testes: Áreas de Vida ────────────────────────────────────────────────────

describe('CorrelationEngine - Áreas de Vida', () => {
  const areas: LifeArea[] = ['saude', 'financas', 'relacionamentos', 'carreira', 'espiritualidade', 'familia', 'criatividade'];

  it.each(areas)('funciona com área de vida: %s', (area) => {
    const code: AkashaCode = { hexagram: 1, level: 'gift', lifeArea: area };
    const context: RecommendationContext = { userCode: code, lifeArea: area };
    const engine = new CorrelationEngine(context);

    const practice = makePractice({ lifeAreas: [area] });
    const scored = engine.scorePractice(practice);

    expect(scored.score).toBeGreaterThan(0);
  });

  it('prática com área de vida matching tem score mais alto', () => {
    const code: AkashaCode = { hexagram: 1, level: 'gift', lifeArea: 'saude' };
    const context: RecommendationContext = { userCode: code, lifeArea: 'saude' };
    const engine = new CorrelationEngine(context);

    const practiceMatch = makePractice({ lifeAreas: ['saude'] });
    const practiceNoMatch = makePractice({ lifeAreas: ['relacionamentos'] });

    const scoredMatch = engine.scorePractice(practiceMatch);
    const scoredNoMatch = engine.scorePractice(practiceNoMatch);

    expect(scoredMatch.score).toBeGreaterThan(scoredNoMatch.score);
  });
});

// ─── Testes: Validação de Práticas ──────────────────────────────────────────

describe('CorrelationEngine - Validação de Práticas', () => {
  it('prática sem warnings tem score mais alto', () => {
    const code: AkashaCode = { hexagram: 1, level: 'gift', lifeArea: 'espiritualidade' };
    const engine = new CorrelationEngine({ userCode: code });

    const practiceSemWarnings = makePractice();
    const practiceComWarnings = makePractice({ warnings: ['Cuidado'] });

    const scoredSem = engine.scorePractice(practiceSemWarnings);
    const scoredCom = engine.scorePractice(practiceComWarnings);

    expect(scoredSem.score).toBeGreaterThan(scoredCom.score);
  });

  it('prática com hexagrama correlacionado tem reason específica', () => {
    const code: AkashaCode = { hexagram: 1, level: 'gift', lifeArea: 'espiritualidade' };
    const engine = new CorrelationEngine({ userCode: code });

    const practice = makePractice({ associations: { hexagrams: [1] } });
    const scored = engine.scorePractice(practice);

    expect(scored.reason).toContain('1');
  });
});

// ─── Testes: recommend ───────────────────────────────────────────────────────

describe('CorrelationEngine - recommend', () => {
  it('retorna array de recomendações', () => {
    const engine = new CorrelationEngine(defaultContext);
    const recommendations = engine.recommend(5);

    expect(Array.isArray(recommendations)).toBe(true);
  });

  it('respecta limite de count', () => {
    const engine = new CorrelationEngine(defaultContext);
    const recommendations = engine.recommend(3);

    expect(recommendations.length).toBeLessThanOrEqual(3);
  });

  it('count 0 retorna array vazio', () => {
    const engine = new CorrelationEngine(defaultContext);
    const recommendations = engine.recommend(0);

    expect(recommendations).toEqual([]);
  });

  it('cada recomendação tem estrutura válida', () => {
    const engine = new CorrelationEngine(defaultContext);
    const recommendations = engine.recommend(1);

    for (const rec of recommendations) {
      expect(rec).toHaveProperty('practice');
      expect(rec).toHaveProperty('score');
      expect(rec).toHaveProperty('reason');
      expect(rec).toHaveProperty('correlations');
      expect(rec).toHaveProperty('validation');
      expect(rec.validation).toHaveProperty('isValid');
      expect(rec.validation).toHaveProperty('warnings');
      expect(rec.validation).toHaveProperty('recommendations');
    }
  });
});
