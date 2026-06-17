/**
 * area-builders — test coverage
 *
 * Builders de blocos narrativos reutilizáveis por área:
 *  - buildShadowSymptoms / buildShadowPattern
 *  - buildGiftStrengths / buildGiftPattern
 *  - buildPracticalAdvice (área-aware)
 *  - buildAreaRitual (chakra-aware)
 *  - buildTransformationPrompt (default passthrough)
 *
 * Cobre: casos com dados ricos, dados parciais, todos os pilares null,
 * edge cases de planet lookup, mapping de chackras e áreas desconhecidas.
 */

import { describe, it, expect } from 'vitest';
import {
  buildShadowSymptoms,
  buildShadowPattern,
  buildGiftStrengths,
  buildGiftPattern,
  buildPracticalAdvice,
  buildAreaRitual,
  buildTransformationPrompt,
} from '../area-builders';
import type { AstrologyMap, KabalisticMap, TantricMap, OduBirth } from '@akasha/types';
import type { AkashicHologram } from '@/lib/domain/mapa/hologram-aggregator';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeAstro(overrides: Partial<AstrologyMap> = {}): AstrologyMap {
  return {
    planets: [],
    houses: [],
    ascendant: 'Leão',
    midheaven: 'Áries',
    lunarPhase: 'cheia',
    elementalChart: { fire: 0.25, earth: 0.25, air: 0.25, water: 0.25 },
    modality: { cardinal: 0.33, fixed: 0.33, mutable: 0.34 },
    quality: { individual: 0, relational: 0, transform: 0, social: 0, traditional: 0 },
    dominantPlanet: 'Sol',
    signRuler: 'Sol',
    houseRuler: 'Sol',
    ...overrides,
  } as unknown as AstrologyMap;
}

function makeKab(overrides: Partial<KabalisticMap> = {}): KabalisticMap {
  return {
    lifePath: 7,
    lifePathMaster: false,
    expression: 3,
    ...overrides,
  } as unknown as KabalisticMap;
}

function makeTantra(overrides: Partial<TantricMap> = {}): TantricMap {
  return {
    soul: 5,
    divineGift: 11,
    ...overrides,
  } as unknown as TantricMap;
}

function makeOdu(overrides: Partial<OduBirth> = {}): OduBirth {
  return {
    oduName: 'Ogbe',
    oduNumber: 1,
    elementalForce: 'Fogo',
    prohibitions: [],
    orixaRegency: ['Ogum'],
    lifeLesson: 'Clareza',
    provisional: false,
    ...overrides,
  } as unknown as OduBirth;
}

function makeHolo(overrides: Partial<AkashicHologram> = {}): AkashicHologram {
  const base = {
    vitalidadeEnergia: { title: 'Vitalidade', chakra: '1º Muladhara (Básico)', color: '#FF3B30', keyData: {} },
    conexoesAmor: { title: 'Conexões', chakra: '4º Anahata (Cardíaco)', color: '#34C759', keyData: {} },
    carreiraProsperidade: { title: 'Carreira', chakra: '3º Manipura (Plexo Solar)', color: '#FFCC00', keyData: {} },
    oriCabecaQuizilas: { title: 'Ori', chakra: '6º Ajna (Terceiro Olho)', color: '#5856D6', keyData: {} },
    missaoDestino: { title: 'Missão', chakra: '7º Sahasrara (Coronário)', color: '#AF52DE', keyData: {} },
    desafiosSombras: { title: 'Desafios', chakra: '2º Svadhisthana (Umbilical)', color: '#FF9500', keyData: {} },
  } as unknown as AkashicHologram;
  return { ...base, ...overrides } as AkashicHologram;
}

// ─── buildShadowSymptoms ─────────────────────────────────────────────────────

describe('buildShadowSymptoms', () => {
  it('retorna fallback quando todos os pilares são null', () => {
    const result = buildShadowSymptoms(null, null, null, null, undefined, 'vitalidadeEnergia');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatch(/sombra|não identificado|autocompaixão/i);
  });

  it('inclui dívidas kármicas quando kab.karmicDebts está presente', () => {
    const kab = makeKab({ karmicDebts: [4, 13] });
    const result = buildShadowSymptoms(null, kab, null, null, undefined, 'vitalidadeEnergia');
    expect(result.some((s) => s.includes('Dívida kármica'))).toBe(true);
    expect(result.some((s) => s.includes('4') && s.includes('13'))).toBe(true);
  });

  it('inclui desafio principal quando kab.challenges.first é definido', () => {
    const kab = makeKab({ challenges: { first: 5, second: 2, main: 7, last: 3 } });
    const result = buildShadowSymptoms(null, kab, null, null, undefined, 'vitalidadeEnergia');
    expect(result.some((s) => s.includes('Desafio principal') && s.includes('5'))).toBe(true);
  });

  it('inclui mensagem de Saturno quando planeta está no mapa', () => {
    const astro = makeAstro({
      planets: [{ planet: 'Saturn', sign: 'Capricórnio', degree: 10, house: 10 }],
    });
    const result = buildShadowSymptoms(astro, null, null, null, undefined, 'vitalidadeEnergia');
    expect(result.some((s) => s.includes('Saturno') && s.includes('Capricórnio'))).toBe(true);
  });

  it('aceita tanto "Saturn" quanto "Saturno" como identificador', () => {
    const astro = makeAstro({
      planets: [{ planet: 'Saturno', sign: 'Aquário', degree: 5, house: 11 }],
    });
    const result = buildShadowSymptoms(astro, null, null, null, undefined, 'vitalidadeEnergia');
    expect(result.some((s) => s.includes('Saturno'))).toBe(true);
  });

  it('inclui mensagem de Plutão quando planeta está no mapa', () => {
    const astro = makeAstro({
      planets: [{ planet: 'Pluto', sign: 'Escorpião', degree: 22, house: 8 }],
    });
    const result = buildShadowSymptoms(astro, null, null, null, undefined, 'vitalidadeEnergia');
    expect(result.some((s) => s.includes('Plutão') && s.includes('Escorpião'))).toBe(true);
  });

  it('inclui proibições do Odu', () => {
    const odu = makeOdu({ prohibitions: ['comida com sal', 'cores escuras'] });
    const result = buildShadowSymptoms(null, null, null, odu, undefined, 'oriCabecaQuizilas');
    expect(result.some((s) => s.includes('Proibições') && s.includes('comida com sal'))).toBe(true);
  });

  it('combina múltiplos sintomas quando há dados em vários pilares', () => {
    const astro = makeAstro({
      planets: [
        { planet: 'Saturn', sign: 'Capricórnio', degree: 10, house: 10 },
        { planet: 'Pluto', sign: 'Escorpião', degree: 22, house: 8 },
      ],
    });
    const kab = makeKab({ karmicDebts: [13] });
    const odu = makeOdu({ prohibitions: ['algo'] });
    const result = buildShadowSymptoms(astro, kab, null, odu, undefined, 'vitalidadeEnergia');
    expect(result.length).toBeGreaterThanOrEqual(4);
  });
});

// ─── buildShadowPattern ──────────────────────────────────────────────────────

describe('buildShadowPattern', () => {
  it('retorna padrão kármico quando há debt + challenge', () => {
    const kab = makeKab({
      karmicDebts: [13],
      challenges: { first: 4, second: 5, main: 9, last: 7 },
    });
    const result = buildShadowPattern(null, kab, null, null, 'vitalidadeEnergia');
    expect(result).toContain('13');
    expect(result).toContain('dívida');
    expect(result).toContain('4');
  });

  it('retorna padrão do Odu quando há prohibition mas sem debt+challenge', () => {
    const odu = makeOdu({ prohibitions: ['Comer carne de porco'] });
    const result = buildShadowPattern(null, null, null, odu, 'oriCabecaQuizilas');
    expect(result.toLowerCase()).toContain('proíbe');
    expect(result.toLowerCase()).toContain('comer carne de porco');
  });

  it('retorna padrão genérico quando não há debt, challenge ou prohibition', () => {
    const result = buildShadowPattern(null, null, null, null, 'carreiraProsperidade');
    expect(result).toContain('Shadow');
    expect(result).toContain('carreiraProsperidade');
  });

  it('prioriza karmic debt+challenge sobre prohibition', () => {
    const kab = makeKab({
      karmicDebts: [16],
      challenges: { first: 7, second: 3, main: 4, last: 5 },
    });
    const odu = makeOdu({ prohibitions: ['X'] });
    const result = buildShadowPattern(null, kab, null, odu, 'vitalidade');
    expect(result).toContain('16');
    // Não deve conter "X" porque o caminho kármico tem prioridade
    expect(result).not.toContain('O seu Odu proíbe');
  });
});

// ─── buildGiftStrengths ──────────────────────────────────────────────────────

describe('buildGiftStrengths', () => {
  it('retorna fallback quando todos os pilares são null', () => {
    const result = buildGiftStrengths(null, null, null, null, undefined, 'vitalidade');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatch(/Dom|dom|presente|propósito/i);
  });

  it('marca como Número Mestre quando lifePathMaster é true', () => {
    const kab = makeKab({ lifePathMaster: true });
    const result = buildGiftStrengths(null, kab, null, null, undefined, 'vitalidade');
    expect(result.some((s) => s.toLowerCase().includes('mestre'))).toBe(true);
  });

  it('marca como Alma 1 quando tantra.soul === 1', () => {
    const tantra = makeTantra({ soul: 1 });
    const result = buildGiftStrengths(null, null, tantra, null, undefined, 'vitalidade');
    expect(result.some((s) => s.toLowerCase().includes('alma'))).toBe(true);
  });

  it('não marca como Alma 1 quando tantra.soul !== 1', () => {
    const tantra = makeTantra({ soul: 5 });
    const result = buildGiftStrengths(null, null, tantra, null, undefined, 'vitalidade');
    expect(result.some((s) => s.toLowerCase().includes('alma em número 1'))).toBe(false);
  });

  it('marca expressão impactante quando expression > 5', () => {
    const kab = makeKab({ expression: 7 });
    const result = buildGiftStrengths(null, kab, null, null, undefined, 'vitalidade');
    expect(result.some((s) => s.toLowerCase().includes('expressão'))).toBe(true);
    expect(result.some((s) => s.includes('7'))).toBe(true);
  });

  it('NÃO marca expressão impactante quando expression <= 5', () => {
    const kab = makeKab({ expression: 5 });
    const result = buildGiftStrengths(null, kab, null, null, undefined, 'vitalidade');
    expect(result.some((s) => s.toLowerCase().includes('expressão') && s.includes('5'))).toBe(false);
  });

  it('inclui nome do Odu quando definido', () => {
    const odu = makeOdu({ oduName: 'Irosun' });
    const result = buildGiftStrengths(null, null, null, odu, undefined, 'vitalidade');
    expect(result.some((s) => s.includes('Irosun'))).toBe(true);
  });

  it('inclui Júpiter quando planeta está no mapa', () => {
    const astro = makeAstro({
      planets: [{ planet: 'Jupiter', sign: 'Sagitário', degree: 15, house: 9 }],
    });
    const result = buildGiftStrengths(astro, null, null, null, undefined, 'carreira');
    expect(result.some((s) => s.includes('Júpiter') && s.includes('Sagitário'))).toBe(true);
  });

  it('combina múltiplas forças', () => {
    const astro = makeAstro({
      planets: [{ planet: 'Jupiter', sign: 'Leão', degree: 5, house: 5 }],
    });
    const kab = makeKab({ lifePathMaster: true, expression: 9 });
    const tantra = makeTantra({ soul: 1 });
    const odu = makeOdu({ oduName: 'Ejila' });
    const result = buildGiftStrengths(astro, kab, tantra, odu, undefined, 'vitalidade');
    expect(result.length).toBeGreaterThanOrEqual(4);
  });
});

// ─── buildGiftPattern ────────────────────────────────────────────────────────

describe('buildGiftPattern', () => {
  it('retorna padrão com summary quando há dados de todos os pilares', () => {
    const kab = makeKab({ lifePath: 11, expression: 7 });
    const tantra = makeTantra({ divineGift: 9 });
    const result = buildGiftPattern(null, kab, tantra, null, 'vitalidade');
    expect(result.toLowerCase()).toContain('caminho de vida 11');
    expect(result.toLowerCase()).toContain('expressão 7');
    expect(result.toLowerCase()).toContain('dom divino tântrico 9');
  });

  it('retorna summary genérico quando não há dados', () => {
    const result = buildGiftPattern(null, null, null, null, 'vitalidade');
    expect(result.toLowerCase()).toContain('seus mapas');
  });

  it('inclui apenas lifePath quando é o único dado', () => {
    const kab = makeKab({ lifePath: 5, expression: undefined });
    const result = buildGiftPattern(null, kab, null, null, 'vitalidade');
    expect(result.toLowerCase()).toContain('caminho de vida 5');
    expect(result.toLowerCase()).not.toContain('expressão');
    expect(result.toLowerCase()).not.toContain('dom divino');
  });

  it('contém mensagem de "fluxo" e "presença nutritiva"', () => {
    const result = buildGiftPattern(null, null, null, null, 'vitalidade');
    expect(result.toLowerCase()).toContain('fluxo');
    expect(result.toLowerCase()).toContain('nutritiva');
  });
});

// ─── buildPracticalAdvice ────────────────────────────────────────────────────

describe('buildPracticalAdvice', () => {
  it('retorna conselho específico para vitalidade', () => {
    const result = buildPracticalAdvice(null, null, null, null, 'vitalidade');
    expect(result.toLowerCase()).toContain('água');
  });

  it('retorna conselho específico para conexoes', () => {
    const result = buildPracticalAdvice(null, null, null, null, 'conexoes');
    expect(result.toLowerCase()).toContain('10 minutos');
  });

  it('retorna conselho específico para carreira', () => {
    const result = buildPracticalAdvice(null, null, null, null, 'carreira');
    expect(result.toLowerCase()).toContain('3 meses');
  });

  it('retorna conselho específico para ori', () => {
    const result = buildPracticalAdvice(null, null, null, null, 'ori');
    expect(result.toLowerCase()).toContain('medite');
  });

  it('retorna conselho específico para missao', () => {
    const result = buildPracticalAdvice(null, null, null, null, 'missao');
    expect(result.toLowerCase()).toContain('8 anos');
  });

  it('retorna conselho específico para desafios', () => {
    const result = buildPracticalAdvice(null, null, null, null, 'desafios');
    expect(result.toLowerCase()).toContain('padrão');
  });

  it('retorna conselho default para área desconhecida', () => {
    const result = buildPracticalAdvice(null, null, null, null, 'area-inexistente');
    expect(result.toLowerCase()).toContain('5 minutos');
    expect(result.toLowerCase()).toContain('silêncio');
  });

  it('ignora os argumentos de mapas (só usa area)', () => {
    const a = buildPracticalAdvice(makeAstro(), makeKab(), makeTantra(), makeOdu(), 'vitalidade');
    const b = buildPracticalAdvice(null, null, null, null, 'vitalidade');
    expect(a).toBe(b);
  });
});

// ─── buildAreaRitual ─────────────────────────────────────────────────────────

describe('buildAreaRitual', () => {
  it('retorna ritual de muladhara quando chakra é muladhara', () => {
    const holo = makeHolo({
      vitalidadeEnergia: { title: 'V', chakra: 'muladhara', color: '#FF3B30', keyData: {} },
    });
    const result = buildAreaRitual(null, null, null, null, 'vitalidade', holo);
    expect(result.element).toBe('terra');
    expect(result.color).toBe('#FF3B30');
    expect(result.instruction.toLowerCase()).toContain('descalço');
  });

  it('retorna ritual de anahata quando chakra é anahata', () => {
    const holo = makeHolo({
      vitalidadeEnergia: { title: 'V', chakra: 'anahata', color: '#34C759', keyData: {} },
    });
    const result = buildAreaRitual(null, null, null, null, 'vitalidade', holo);
    expect(result.element).toBe('ar');
    expect(result.color).toBe('#34C759');
  });

  it('retorna ritual de sahasrara quando chakra é sahasrara', () => {
    const holo = makeHolo({
      vitalidadeEnergia: { title: 'V', chakra: 'sahasrara', color: '#AF52DE', keyData: {} },
    });
    const result = buildAreaRitual(null, null, null, null, 'vitalidade', holo);
    expect(result.element).toBe('consciência');
  });

  it('retorna ritual default (silêncio) para chakra desconhecido', () => {
    const holo = makeHolo({
      vitalidadeEnergia: { title: 'V', chakra: 'chakra-inexistente', color: '#000', keyData: {} },
    });
    const result = buildAreaRitual(null, null, null, null, 'vitalidade', holo);
    expect(result.element).toBe('silêncio');
    expect(result.instruction.toLowerCase()).toContain('silêncio');
  });

  it('lida com chakra vazio', () => {
    const holo = makeHolo({
      vitalidadeEnergia: { title: 'V', chakra: '', color: '#000', keyData: {} },
    });
    const result = buildAreaRitual(null, null, null, null, 'vitalidade', holo);
    expect(result.element).toBe('silêncio');
  });

  it('capitaliza a primeira letra do element no title', () => {
    const holo = makeHolo({
      vitalidadeEnergia: { title: 'V', chakra: 'manipura', color: '#FFCC00', keyData: {} },
    });
    const result = buildAreaRitual(null, null, null, null, 'vitalidade', holo);
    expect(result.title).toBe('Ritual de Fogo');
  });

  it('inclui duration "5-10 minutos"', () => {
    const holo = makeHolo({
      vitalidadeEnergia: { title: 'V', chakra: 'ajna', color: '#5856D6', keyData: {} },
    });
    const result = buildAreaRitual(null, null, null, null, 'vitalidade', holo);
    expect(result.duration).toBe('5-10 minutos');
  });

  it('normaliza chakra name removendo números e caracteres especiais', () => {
    // '1º Muladhara' é normalizado para ' muladhara' que casa com 'muladhara'
    const holo = makeHolo({
      vitalidadeEnergia: { title: 'V', chakra: '1º Muladhara', color: '#FF3B30', keyData: {} },
    });
    const result = buildAreaRitual(null, null, null, null, 'vitalidade', holo);
    expect(result.element).toBe('terra');
  });
});

// ─── buildTransformationPrompt ───────────────────────────────────────────────

describe('buildTransformationPrompt', () => {
  it('retorna o defaultPrompt recebido (pass-through)', () => {
    const result = buildTransformationPrompt(null, null, null, null, 'vitalidade', 'meu-prompt-custom');
    expect(result).toBe('meu-prompt-custom');
  });

  it('retorna string vazia quando defaultPrompt é vazio', () => {
    const result = buildTransformationPrompt(null, null, null, null, 'vitalidade', '');
    expect(result).toBe('');
  });

  it('ignora dados de mapas (só retorna defaultPrompt)', () => {
    const withData = buildTransformationPrompt(
      makeAstro(),
      makeKab({ lifePath: 22 }),
      makeTantra({ soul: 9 }),
      makeOdu({ oduName: 'Owonrin' }),
      'missao',
      'fixed-prompt'
    );
    const withoutData = buildTransformationPrompt(null, null, null, null, 'missao', 'fixed-prompt');
    expect(withData).toBe(withoutData);
    expect(withData).toBe('fixed-prompt');
  });
});
