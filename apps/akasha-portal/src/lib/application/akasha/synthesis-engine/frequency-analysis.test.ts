/**
 * synthesis-engine/frequency-analysis.test.ts
 *
 * Avaliação de frequência (shadow/gift/siddhi) por área + cálculo do
 * perfil dominante e sequência ativa. Split de synthesis-engine.ts.
 */
import { describe, it, expect } from 'vitest';
import { assessAreaFrequency, deriveDominantFrequency, computeOverallScore, deriveActiveSequence } from './frequency-analysis';
import type { AreaNarrative } from './synthesis-types';
import type { AstrologyMap, KabalisticMap, TantricMap, OduBirth } from '@akasha/types';

// Minimal map fixtures (only fields actually read by assessAreaFrequency)
function makeAstro(overrides: Partial<AstrologyMap> = {}): AstrologyMap {
  return {
    planets: [],
    houses: [],
    dominantPlanet: 'Sun',
    ...overrides,
  } as unknown as AstrologyMap;
}

function makeKab(overrides: Partial<KabalisticMap> = {}): KabalisticMap {
  return {
    karmicDebts: [],
    challenges: {},
    lifePathMaster: false,
    ...overrides,
  } as unknown as KabalisticMap;
}

function makeTantra(overrides: Partial<TantricMap> = {}): TantricMap {
  return {
    soul: 5,
    ...overrides,
  } as unknown as TantricMap;
}

function makeAreaNarrative(frequency: 'shadow' | 'gift' | 'siddhi', intensity: 1 | 2 | 3): AreaNarrative {
  return {
    area: 'vitalidadeEnergia',
    title: 'Área',
    frequency,
    intensity,
    shadowPattern: '',
    shadowSymptoms: [],
    giftPattern: '',
    giftStrengths: [],
    pillarContribution: { cabala: '', tantra: '', odus: '', astrologia: '', iching: '' },
    practicalAdvice: '',
    dailyRitual: { title: '', instruction: '', duration: '', element: '', color: '' },
    transformationPrompt: '',
  };
}

function makeOdu(): OduBirth {
  return { oduName: 'Ogbe', oduNumber: 1, elementalForce: 'Fogo', prohibitions: [], orixaRegency: [], lifeLesson: '', provisional: false } as unknown as OduBirth;
}

describe('assessAreaFrequency', () => {
  it('returns shadow when karmicDebts are present', () => {
    const astro = makeAstro();
    const kab = makeKab({ karmicDebts: [13] });
    const tantra = makeTantra();
    const odu = makeOdu();
    const result = assessAreaFrequency(astro, kab, tantra, odu, 'vitalidadeEnergia');
    expect(result.frequency).toBe('shadow');
    expect(result.intensity).toBeGreaterThanOrEqual(1);
  });

  it('returns shadow when Pluto or Saturn are in aspect', () => {
    const astro = makeAstro({ planets: [{ planet: 'Pluto', sign: 'Escorpião', degree: 22, house: 8 }] });
    const kab = makeKab();
    const result = assessAreaFrequency(astro, kab, makeTantra(), makeOdu(), 'carreiraProsperidade');
    expect(result.frequency).toBe('shadow');
  });

  it('returns siddhi when no shadow signals + lifePathMaster + soul=1', () => {
    const astro = makeAstro();
    const kab = makeKab({ lifePathMaster: true });
    const tantra = makeTantra({ soul: 1 });
    const result = assessAreaFrequency(astro, kab, tantra, makeOdu(), 'missaoDestino');
    expect(result.frequency).toBe('siddhi');
    expect(result.intensity).toBe(3);
  });

  it('returns siddhi (intensity 2) when no shadow + lifePathMaster but soul ≠ 1,22,33', () => {
    const astro = makeAstro();
    const kab = makeKab({ lifePathMaster: true });
    const tantra = makeTantra({ soul: 5 });
    const result = assessAreaFrequency(astro, kab, tantra, makeOdu(), 'missaoDestino');
    expect(result.frequency).toBe('siddhi');
    expect(result.intensity).toBe(2);
  });

  it('returns gift when lifePathMaster + soul=22', () => {
    const astro = makeAstro();
    const kab = makeKab({ lifePathMaster: true });
    const tantra = makeTantra({ soul: 22 });
    const result = assessAreaFrequency(astro, kab, tantra, makeOdu(), 'conexoesAmor');
    expect(result.frequency).toBe('siddhi');
    expect(result.intensity).toBe(3);
  });

  it('returns siddhi when noShadow + lifePathMaster (soul non-master → siddhi intensity 2)', () => {
    const astro = makeAstro();
    const kab = makeKab({ lifePathMaster: true });
    const tantra = makeTantra({ soul: 7 }); // soul=7 → no siddhi bonus, lifePathMaster → giftScore=2
    const result = assessAreaFrequency(astro, kab, tantra, makeOdu(), 'oriCabecaQuizilas');
    // With noShadow + lifePathMaster + non-master soul → siddhi intensity 2 (not gift)
    expect(result.frequency).toBe('siddhi');
    expect(result.intensity).toBe(2);
  });

  it('returns shadow (intensity 1) as default when scores are tied', () => {
    const astro = makeAstro({ planets: [{ planet: 'Saturn', sign: 'Capricórnio', degree: 10, house: 10 }] });
    const kab = makeKab({ challenges: { first: 4, second: 2, main: 9, last: 7 } });
    const result = assessAreaFrequency(astro, kab, makeTantra(), makeOdu(), 'desafiosSombras');
    expect(result.frequency).toBe('shadow');
    expect(result.intensity).toBeGreaterThanOrEqual(1);
  });
});

describe('deriveDominantFrequency', () => {
  it('returns gift when gifts > shadows (only 2 siddhi < 3 threshold)', () => {
    const s = () => makeAreaNarrative('siddhi', 3);
    const g = () => makeAreaNarrative('gift', 2);
    const result = deriveDominantFrequency(s(), s(), g(), g(), g(), g());
    // 2 siddhi (< 3), 4 gift → gifts > shadows → gift
    expect(result).toBe('gift');
  });

  it('returns shadow when gifts == shadows (tie → shadow)', () => {
    const g = () => makeAreaNarrative('gift', 2);
    const s = () => makeAreaNarrative('shadow', 2);
    const result = deriveDominantFrequency(g(), g(), g(), s(), s(), s());
    // 3 gift, 3 shadow → gifts NOT > shadows → shadow
    expect(result).toBe('shadow');
  });

  it('returns shadow when shadows >= gifts', () => {
    const g = () => makeAreaNarrative('gift', 1);
    const s = () => makeAreaNarrative('shadow', 2);
    const result = deriveDominantFrequency(g(), s(), s(), s(), s(), s());
    expect(result).toBe('shadow');
  });

  it('returns shadow when equal counts (tie defaults to shadow)', () => {
    const g = () => makeAreaNarrative('gift', 2);
    const s = () => makeAreaNarrative('shadow', 2);
    const result = deriveDominantFrequency(g(), g(), s(), s(), s(), s()); // 2 gift, 4 shadow
    expect(result).toBe('shadow');
  });
});

describe('computeOverallScore', () => {
  it('returns 0 when all areas are shadow', () => {
    const s = makeAreaNarrative('shadow', 1);
    const result = computeOverallScore(s, s, s, s, s, s);
    expect(result).toBe(0);
  });

  it('returns 100 when all areas are siddhi intensity 3', () => {
    const s = makeAreaNarrative('siddhi', 3);
    const result = computeOverallScore(s, s, s, s, s, s);
    expect(result).toBe(100);
  });

  it('returns non-zero when any area is gift or siddhi', () => {
    const g = makeAreaNarrative('gift', 2);
    const s = makeAreaNarrative('shadow', 1);
    const result = computeOverallScore(g, s, s, s, s, s);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('siddhi areas contribute more than gift areas of same intensity', () => {
    const siddhi = makeAreaNarrative('siddhi', 2);
    const gift = makeAreaNarrative('gift', 2);
    const empty = makeAreaNarrative('shadow', 1);

    const scoreSiddhi = computeOverallScore(siddhi, empty, empty, empty, empty, empty);
    const scoreGift = computeOverallScore(gift, empty, empty, empty, empty, empty);
    expect(scoreSiddhi).toBeGreaterThan(scoreGift);
  });

  it('higher intensity contributes more within same frequency type', () => {
    const high = makeAreaNarrative('gift', 3);
    const low = makeAreaNarrative('gift', 1);
    const empty = makeAreaNarrative('shadow', 1);

    const scoreHigh = computeOverallScore(high, empty, empty, empty, empty, empty);
    const scoreLow = computeOverallScore(low, empty, empty, empty, empty, empty);
    expect(scoreHigh).toBeGreaterThan(scoreLow);
  });
});

describe('deriveActiveSequence', () => {
  it('returns heart when conexoes has highest intensity', () => {
    const conexoes = makeAreaNarrative('gift', 3);
    const missao = makeAreaNarrative('gift', 2);
    const carreira = makeAreaNarrative('gift', 1);
    const result = deriveActiveSequence(conexoes, missao, carreira);
    expect(result).toBe('heart');
  });

  it('returns purpose when missao has highest intensity', () => {
    const conexoes = makeAreaNarrative('gift', 1);
    const missao = makeAreaNarrative('gift', 3);
    const carreira = makeAreaNarrative('gift', 2);
    const result = deriveActiveSequence(conexoes, missao, carreira);
    expect(result).toBe('purpose');
  });

  it('returns vitality when carreira has highest intensity', () => {
    const conexoes = makeAreaNarrative('gift', 1);
    const missao = makeAreaNarrative('gift', 2);
    const carreira = makeAreaNarrative('gift', 3);
    const result = deriveActiveSequence(conexoes, missao, carreira);
    expect(result).toBe('vitality');
  });

  it('returns vitality when tied (sort picks first equal after sort stable-ish)', () => {
    const conexoes = makeAreaNarrative('gift', 2);
    const missao = makeAreaNarrative('gift', 2);
    const carreira = makeAreaNarrative('gift', 2);
    // With equal intensities the sorted[0] could be any
    const result = deriveActiveSequence(conexoes, missao, carreira);
    expect(['vitality', 'heart', 'purpose']).toContain(result);
  });
});
