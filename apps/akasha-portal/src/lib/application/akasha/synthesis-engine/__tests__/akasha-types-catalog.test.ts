/**
 * akasha-types-catalog — test coverage
 *
 * The catalog is the data source for the 9 Akasha Type profiles.
 * Each type defines its strategy, dominant pillar, growth edge and shadow trap.
 *
 * Tests:
 *  - Structural integrity (9 types, all fields populated)
 *  - Uniqueness of type identifiers
 *  - Default export shape
 *  - Content sanity checks (icons, typeName patterns, etc.)
 */

import { describe, it, expect } from 'vitest';
import AKASHA_TYPES from '../akasha-types-catalog';
import type { AkashaTypeProfile } from '../synthesis-types';

const EXPECTED_TYPES = [
  'catalisador',
  'receptor',
  'construtor',
  'transformador',
  'guardiao',
  'curador',
  'canal',
  'alquimista',
  'arquiteto',
] as const;

const REQUIRED_BASE_FIELDS: Array<keyof Omit<AkashaTypeProfile, 'authority' | 'authorityPractice' | 'dailyDirective' | 'oneLiner'>> = [
  'type',
  'typeName',
  'typeIcon',
  'corePattern',
  'strategy',
  'strategyDetail',
  'dominantPillar',
  'growthEdge',
  'shadowTrap',
];

describe('akasha-types-catalog — estrutura', () => {
  it('é exportado como default', () => {
    expect(AKASHA_TYPES).toBeDefined();
    expect(typeof AKASHA_TYPES).toBe('object');
    expect(AKASHA_TYPES).not.toBeNull();
  });

  it('contém exatamente os 9 tipos Akasha esperados', () => {
    const keys = Object.keys(AKASHA_TYPES);
    expect(keys).toHaveLength(9);
    for (const expected of EXPECTED_TYPES) {
      expect(keys).toContain(expected);
    }
  });

  it('não tem tipos duplicados', () => {
    const keys = Object.keys(AKASHA_TYPES);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });

  it('cada tipo possui todos os campos base obrigatórios', () => {
    for (const [typeKey, typeData] of Object.entries(AKASHA_TYPES)) {
      for (const field of REQUIRED_BASE_FIELDS) {
        expect(typeData, `tipo ${typeKey} deve ter campo ${field}`).toHaveProperty(field);
        const value = (typeData as Record<string, unknown>)[field];
        expect(value, `tipo ${typeKey}.${String(field)} não pode ser vazio`).toBeTruthy();
      }
    }
  });

  it('campos type/typeName são strings não vazias em todos os tipos', () => {
    for (const [typeKey, typeData] of Object.entries(AKASHA_TYPES)) {
      expect(typeof typeData.type).toBe('string');
      expect(typeData.type.length).toBeGreaterThan(0);
      expect(typeof typeData.typeName).toBe('string');
      expect(typeData.typeName.length).toBeGreaterThan(0);
      expect(typeData.typeName.startsWith('O '), `typeName de ${typeKey} deve começar com "O "`).toBe(true);
    }
  });

  it('campos typeIcon são strings curtas (emojis ou símbolos)', () => {
    for (const [typeKey, typeData] of Object.entries(AKASHA_TYPES)) {
      expect(typeof typeData.typeIcon).toBe('string');
      expect(typeData.typeIcon.length, `icon de ${typeKey} deve ser curto`).toBeLessThan(8);
      expect(typeData.typeIcon.length).toBeGreaterThan(0);
    }
  });
});

describe('akasha-types-catalog — qualidade do conteúdo', () => {
  it('typeName é único entre os 9 tipos', () => {
    const names = Object.values(AKASHA_TYPES).map((t) => t.typeName);
    expect(new Set(names).size).toBe(names.length);
  });

  it('dominantPillar referencia pelo menos uma das 4 fontes (cabala/tantra/odus/astrologia)', () => {
    for (const [typeKey, typeData] of Object.entries(AKASHA_TYPES)) {
      const pillar = typeData.dominantPillar.toLowerCase();
      const hasKnownPillar =
        pillar.includes('cabala') ||
        pillar.includes('tantra') ||
        pillar.includes('odu') ||
        pillar.includes('astrologia');
      expect(hasKnownPillar, `dominantPillar de ${typeKey} deve referenciar uma fonte conhecida`).toBe(true);
    }
  });

  it('strategy e strategyDetail não são idênticos (detail é uma expansão)', () => {
    for (const [typeKey, typeData] of Object.entries(AKASHA_TYPES)) {
      expect(
        typeData.strategy,
        `${typeKey}.strategy deve ser mais concisa que strategyDetail`
      ).not.toBe(typeData.strategyDetail);
      expect(typeData.strategyDetail.length).toBeGreaterThan(typeData.strategy.length);
    }
  });

  it('shadowTrap e growthEdge são strings distintos e informativos', () => {
    for (const [typeKey, typeData] of Object.entries(AKASHA_TYPES)) {
      expect(typeData.shadowTrap).not.toBe(typeData.growthEdge);
      expect(typeData.shadowTrap.length).toBeGreaterThan(10);
      expect(typeData.growthEdge.length).toBeGreaterThan(10);
    }
  });
});

describe('akasha-types-catalog — tipo arquiteto (referência)', () => {
  it('arquiteto é o último tipo da lista (default fallback)', () => {
    const last = EXPECTED_TYPES[EXPECTED_TYPES.length - 1];
    expect(last).toBe('arquiteto');
    const arquiteto = AKASHA_TYPES.arquiteto;
    expect(arquiteto.typeName).toBe('O Arquiteto');
    expect(arquiteto.dominantPillar.toLowerCase()).toContain('cabala');
  });
});

describe('akasha-types-catalog — tipos individuais', () => {
  it('catalisador tem ícone de fogo', () => {
    expect(AKASHA_TYPES.catalisador.typeIcon).toBe('🔥');
  });

  it('receptor tem ícone de água', () => {
    expect(AKASHA_TYPES.receptor.typeIcon).toBe('🌊');
  });

  it('canal tem ícone de antena/transmissão', () => {
    expect(AKASHA_TYPES.canal.typeIcon).toBe('📡');
  });

  it('transformador tem ícone de raio/transformação', () => {
    expect(AKASHA_TYPES.transformador.typeIcon).toBe('⚡');
  });

  it('todos os tipos contêm a palavra "você" (linguagem em 2ª pessoa)', () => {
    for (const [typeKey, typeData] of Object.entries(AKASHA_TYPES)) {
      const allText = [
        typeData.corePattern,
        typeData.strategyDetail,
        typeData.growthEdge,
        typeData.shadowTrap,
      ].join(' ');
      const hasVoce = allText.toLowerCase().includes('você') || allText.toLowerCase().includes('voce');
      expect(
        hasVoce,
        `${typeKey} deve usar linguagem em 2ª pessoa`
      ).toBe(true);
    }
  });
});

describe('akasha-types-catalog — imutabilidade', () => {
  it('o catálogo é uma referência de objeto (não array)', () => {
    expect(Array.isArray(AKASHA_TYPES)).toBe(false);
  });
});
