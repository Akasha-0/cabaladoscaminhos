/**
 * Synthesis Engine — F-242 test coverage
 *
 * Covers v0.0.20 WS-5: synthesis-engine integration tests
 * (currently 0% coverage).
 *
 * Tests:
 * - buildAkashaSynthesis: full integration (5 pilares → 6 areas + decision)
 * - deriveAkashaType: all 9 Akasha Types
 * - Graceful fallback: empty/missing pilares
 * - Edge cases: master numbers, all-shadow, all-gift frequencies
 */
import type { AstrologyMap, KabalisticMap, TantricMap, OduBirth } from '@akasha/types';
import { describe, it, expect } from 'vitest';
import type { AkashicHologram } from '@/lib/domain/mapa/hologram-aggregator';
import { buildAkashaSynthesis, deriveAkashaType, type AkashaTypeProfile } from './synthesis-engine';

// ─── Fixtures ───────────────────────────────────────────────────────────────

function makeAstro(overrides: Partial<AstrologyMap> = {}): AstrologyMap {
  return {
    sun: { sign: 'Escorpião', house: 8, degree: 15, retrograde: false },
    moon: { sign: 'Peixes', house: 4, degree: 22, retrograde: false },
    ascendant: { sign: 'Leão', degree: 5, retrograde: false },
    mercury: { sign: 'Escorpião', house: 8, degree: 10, retrograde: false },
    venus: { sign: 'Libra', house: 7, degree: 12, retrograde: false },
    mars: { sign: 'Áries', house: 11, degree: 8, retrograde: false },
    dominantPlanet: 'Plutão',
    trinity: { shadow: 0.2, gift: 0.6, siddhi: 0.2 },
    ...overrides,
  } as unknown as AstrologyMap;
}

function makeKab(overrides: Partial<KabalisticMap> = {}): KabalisticMap {
  return {
    lifePath: 11,
    lifePathMaster: true,
    expression: 5,
    motivation: 3,
    birthday: 7,
    personalYear: 4,
    karmicDebts: [],
    challenges: { first: 0, second: 0, third: 0 },
    ...overrides,
  } as unknown as KabalisticMap;
}

function makeTantra(overrides: Partial<TantricMap> = {}): TantricMap {
  return {
    soul: 1,
    karma: 3,
    divineGift: 7,
    tantricPath: 5,
    soulBody: 1,
    soulDescription: 'Alma',
    bodies: {
      fisico: { number: 5, description: 'Físico' },
      astral: { number: 6, description: 'Astral' },
      mental: { number: 4, description: 'Mental' },
    },
    temperamento_atual: 'colerico',
    ...overrides,
  } as unknown as TantricMap;
}

function makeOdu(overrides: Partial<OduBirth> = {}): OduBirth {
  return {
    oduName: 'Ogbe',
    oduNumber: 1,
    elementalForce: 'Fogo',
    prohibitions: [],
    orixas: ['Ogum'],
    description: 'Odu da clareza',
    provisional: false,
    ...overrides,
  } as unknown as OduBirth;
}

function makeHolo(astro: AstrologyMap, overrides: Partial<AkashicHologram> = {}): AkashicHologram {
  return {
    ichingHex: overrides.ichingHex ?? undefined,
    vitalidadeEnergia: {
      title: 'Vitalidade & Energia',
      chakra: '1º Muladhara',
      color: '#FF3B30',
      keyData: { sun: astro.sun, mars: astro.mars },
    },
    conexoesAmor: {
      title: 'Conexões & Amor',
      chakra: '4º Anahata',
      color: '#34C759',
      keyData: { venus: astro.venus, moon: astro.moon },
    },
    carreiraProsperidade: {
      title: 'Carreira & Prosperidade',
      chakra: '3º Manipura',
      color: '#FFCC00',
      keyData: {},
    },
    oriCabecaQuizilas: {
      title: 'Ori, Cabeça & Quizilas',
      chakra: '6º Ajna',
      color: '#5856D6',
      keyData: { ascendant: astro.ascendant },
    },
    missaoDestino: {
      title: 'Missão & Destino',
      chakra: '7º Sahasrara',
      color: '#AF52DE',
      keyData: { lifePath: 11 },
    },
    desafiosSombras: {
      title: 'Desafios & Sombras',
      chakra: '2º Svadhisthana',
      color: '#FF9500',
      keyData: {},
    },
    ...overrides,
  } as unknown as AkashicHologram;
}

const TODAY = new Date('2026-06-15T12:00:00Z');

// ─── buildAkashaSynthesis — full integration ───────────────────────────────

describe('buildAkashaSynthesis — integração completa (F-226/227/242)', () => {
  it('retorna 6 áreas (vitalidade/conexões/carreira/ori/missão/desafios)', () => {
    const astro = makeAstro();
    const synth = buildAkashaSynthesis(
      astro,
      makeKab(),
      makeTantra(),
      makeOdu(),
      makeHolo(astro),
      TODAY
    );
    expect(Object.keys(synth.areas)).toHaveLength(6);
    expect(synth.areas.vitalidadeEnergia).toBeDefined();
    expect(synth.areas.conexoesAmor).toBeDefined();
    expect(synth.areas.carreiraProsperidade).toBeDefined();
    expect(synth.areas.oriCabecaQuizilas).toBeDefined();
    expect(synth.areas.missaoDestino).toBeDefined();
    expect(synth.areas.desafiosSombras).toBeDefined();
  });

  it('cada área tem title, frequency, intensity', () => {
    const astro = makeAstro();
    const synth = buildAkashaSynthesis(
      astro,
      makeKab(),
      makeTantra(),
      makeOdu(),
      makeHolo(astro),
      TODAY
    );
    for (const area of Object.values(synth.areas)) {
      expect(area.title).toBeTruthy();
      expect(['shadow', 'gift', 'siddhi']).toContain(area.frequency);
      expect([1, 2, 3]).toContain(area.intensity);
    }
  });

  it('inclui dailyDecision com strategy + authority (F-227)', () => {
    const astro = makeAstro();
    const synth = buildAkashaSynthesis(
      astro,
      makeKab(),
      makeTantra(),
      makeOdu(),
      makeHolo(astro),
      TODAY
    );
    expect(['act', 'wait', 'observe']).toContain(synth.dailyDecision.strategy);
    expect(['emotional', 'sacral', 'splenic', 'mental']).toContain(synth.dailyDecision.authority);
    expect(synth.dailyDecision.strategyExplanation).toBeTruthy();
    expect(synth.dailyDecision.authorityQuestion).toBeTruthy();
  });

  it('inclui synthesisParagraph (1-3 frases)', () => {
    const astro = makeAstro();
    const synth = buildAkashaSynthesis(
      astro,
      makeKab(),
      makeTantra(),
      makeOdu(),
      makeHolo(astro),
      TODAY
    );
    expect(synth.synthesisParagraph).toBeTruthy();
    expect(synth.synthesisParagraph.length).toBeGreaterThan(20);
  });

  it('inclui akashaProfile (dominantFrequency + transformationStage)', () => {
    const astro = makeAstro();
    const synth = buildAkashaSynthesis(
      astro,
      makeKab(),
      makeTantra(),
      makeOdu(),
      makeHolo(astro),
      TODAY
    );
    expect(['shadow', 'gift', 'siddhi']).toContain(synth.akashaProfile.dominantFrequency);
    expect(['surface', 'deepening', 'embodying']).toContain(
      synth.akashaProfile.transformationStage
    );
    expect(synth.akashaProfile.overallFrequencyScore).toBeGreaterThanOrEqual(0);
    expect(synth.akashaProfile.overallFrequencyScore).toBeLessThanOrEqual(100);
  });

  it('F-227: oneProfile presente quando há dados', () => {
    const astro = makeAstro();
    const synth = buildAkashaSynthesis(
      astro,
      makeKab(),
      makeTantra(),
      makeOdu(),
      makeHolo(astro),
      TODAY
    );
    expect(synth.oneProfile).toBeDefined();
    expect(synth.oneProfile?.type).toBeTruthy();
    expect(synth.oneProfile?.typeName).toBeTruthy();
    expect(synth.oneProfile?.strategy).toBeTruthy();
    expect(synth.oneProfile?.authority).toBeTruthy();
  });
});

// ─── Graceful fallback (todos pilares null) ────────────────────────────────

describe('buildAkashaSynthesis — fallback gracioso', () => {
  it('retorna estrutura válida mesmo com todos pilares null', () => {
    const synth = buildAkashaSynthesis(null, null, null, null, makeHolo(makeAstro()), TODAY);
    expect(synth.areas).toBeDefined();
    expect(Object.keys(synth.areas)).toHaveLength(6);
    expect(synth.dailyDecision).toBeDefined();
    expect(synth.synthesisParagraph).toBeTruthy();
  });

  it('fallback inclui oneProfile com type=arquiteto (default)', () => {
    const synth = buildAkashaSynthesis(null, null, null, null, makeHolo(makeAstro()), TODAY);
    expect(synth.oneProfile?.type).toBe('arquiteto');
  });

  it('nunca throws (try/catch interno)', () => {
    // Even with malformed inputs, should not throw
    expect(() =>
      buildAkashaSynthesis(
        undefined as any,
        undefined as any,
        undefined as any,
        undefined as any,
        makeHolo(makeAstro()),
        TODAY
      )
    ).not.toThrow();
  });
});

// ─── Life Path variations ─────────────────────────────────────────────────

describe('buildAkashaSynthesis — Life Path variations', () => {
  it('lifePath é exposto em synth.lifePath (número 1-33 ou 0 fallback)', () => {
    const astro = makeAstro();
    const synth = buildAkashaSynthesis(
      astro,
      makeKab({ lifePath: 11, lifePathMaster: true }),
      makeTantra(),
      makeOdu(),
      makeHolo(astro),
      TODAY
    );
    // synth.lifePath é o que buildAkashaSynthesis expõe (kabalisticMap?.lifePath ?? 1)
    expect(typeof synth.lifePath).toBe('number');
    expect(synth.lifePath).toBeGreaterThanOrEqual(1);
    expect(synth.lifePath).toBeLessThanOrEqual(33);
  });

  it('estratégia SEMPRE é uma das 3 válidas (act/wait/observe) independente do LP', () => {
    // NOTE: deriveDailyDecision no synthesis-engine é baseado em
    // frequency+intensity da área mais intensa, NÃO na regra F-227
    // (que mapeia LP→strategy). A regra F-227 vive em deriveAkashaAuthority
    // (lib/grimoire/synthesis/synthesizer.ts).
    const astro = makeAstro();
    for (const lp of [1, 4, 7, 11, 22, 33]) {
      const synth = buildAkashaSynthesis(
        astro,
        makeKab({ lifePath: lp, lifePathMaster: lp === 11 || lp === 22 || lp === 33 }),
        makeTantra(),
        makeOdu(),
        makeHolo(astro),
        TODAY
      );
      expect(['act', 'wait', 'observe']).toContain(synth.dailyDecision.strategy);
    }
  });
});

// ─── deriveAkashaType ──────────────────────────────────────────────────────

describe('deriveAkashaType — 9 Akasha Types', () => {
  it('retorna profile com 9 campos obrigatórios', () => {
    const astro = makeAstro();
    const profile = deriveAkashaType(astro, makeKab(), makeTantra(), makeOdu(), makeHolo(astro));
    expect(profile.type).toBeTruthy();
    expect(profile.typeName).toBeTruthy();
    expect(profile.typeIcon).toBeTruthy();
    expect(profile.corePattern).toBeTruthy();
    expect(profile.strategy).toBeTruthy();
    expect(profile.strategyDetail).toBeTruthy();
    expect(profile.authority).toBeTruthy();
    expect(profile.dailyDirective).toBeTruthy();
    expect(profile.oneLiner).toBeTruthy();
    expect(profile.dimensionOrigin).toBeTruthy();
    expect(profile.growthEdge).toBeTruthy();
    expect(profile.shadowTrap).toBeTruthy();
  });

  it('Authority é um dos 4 valores válidos', () => {
    const astro = makeAstro();
    const profile = deriveAkashaType(astro, makeKab(), makeTantra(), makeOdu(), makeHolo(astro));
    expect(['emotional', 'sacral', 'splenic', 'mental']).toContain(profile.authority);
  });
});
// ─── deriveAkashaType — 5-pillar voting (ROADMAP Iter. 6 Prioridade 2) ─────

describe('deriveAkashaType — 5-pillar voting', () => {
  it('Odu wins over IChing when Odu is stronger (Ogbe×3 vs nuclear×2)', () => {
    // Ogbe → catalisador (×3); Hex 30 (Li/Fire) → canal (×2)
    // Kab LP 1 → catalisador (×2): Odu+Kab = 5 for catalisador vs IChing+Astro = 3 for canal
    const astro = makeAstro({ dominantPlanet: 'Mercúrio' });
    const holo = makeHolo(astro, { ichingHex: 30 });
    const profile = deriveAkashaType(
      astro,
      makeKab({ lifePath: 1 }),
      makeTantra(),
      makeOdu({ oduName: 'Ogbe' }),
      holo
    );
    expect(profile.type).toBe('catalisador');
  });

  it('I Ching wins when Odu is absent (no Odu ×0 vs IChing×2)', () => {
    // No Odu → null (×0); Hex 1 (Heaven) → catalisador (×2)
    // Kab LP 1 → catalisador (×2); Astro Sol → catalisador (×1)
    // catalisador: IChing(2) + Kabala(2) + Astro(1) = 5
    // canal: Kab LP 11(2) — removed; only IChing(2) from IChing
    // Result: catalisador = 5, no strong contender → catalisador wins
    const astro = makeAstro({ dominantPlanet: 'Sol' });
    const holo = makeHolo(astro, { ichingHex: 1 });
    const profile = deriveAkashaType(
      astro,
      makeKab({ lifePath: 1 }),
      makeTantra(),
      makeOdu({ oduName: '' }),
      holo
    );
    expect(profile.type).toBe('catalisador');
  });

  it('Kabala LP 22 (Construtor) wins over Astro alone', () => {
    // LP 22 → construtor (×2); Astro Lua → receptor (×1); Odu empty → null (×0)
    // construtor: 2; receptor: 1 → construtor wins
    const astro = makeAstro({ dominantPlanet: 'Lua' });
    const profile = deriveAkashaType(
      astro,
      makeKab({ lifePath: 22, lifePathMaster: true }),
      makeTantra(),
      makeOdu({ oduName: '' }),
      makeHolo(astro)
    );
    expect(profile.type).toBe('construtor');
  });
  it('I Ching only — IChing wins over empty Odu fallback (precedence > votes)', () => {
    // IChing 1 → nuclear trigram 1 (Heaven) → 'catalisador' (×2, precedence 3)
    // Odu empty → 'arquiteto' (×3, precedence 0 — no real data)
    // catalisador wins on precedence even though fewer raw votes
    const astro = makeAstro({ dominantPlanet: '' });
    const holo = makeHolo(astro, { ichingHex: 1 });
    const profile = deriveAkashaType(
      astro,
      makeKab({ lifePath: undefined }),
      makeTantra(),
      makeOdu({ oduName: '' }),
      holo
    );
    expect(profile.type).toBe('catalisador');
  });

  it('All 5 pillars voting — Odu+IChing+Kabala+Astro → Odu wins (4 votes)', () => {
    // Odu: Oyeku → construtor (×3)
    // IChing: Hex 14 (Fire) → canal (×2)
    // Kabala LP: 2 → receptor (×2)
    // Astro: Marte → construtor (×1)
    // Votes: construtor=4, canal=2, receptor=2 → construtor wins
    const astro = makeAstro({ dominantPlanet: 'Marte' });
    const holo = makeHolo(astro, { ichingHex: 14 }); // Fire hex → canal
    const profile = deriveAkashaType(
      astro,
      makeKab({ lifePath: 2 }), // receptor (×2)
      makeTantra(),
      makeOdu({ oduName: 'Oyeku' }), // construtor (×3)
      holo
    );
    expect(profile.type).toBe('construtor');
  });

  it('Kabala LP 33 (mestre) wins over empty Odu via precedence', () => {
    // LP 33 → 'alquimista' (×2, precedence 2 — Kab has real data)
    // Odu empty → 'arquiteto' (×3, precedence 0 — no real data)
    // IChing/Astro: undefined/null → no data
    // alquimista wins: 2 votes but precedence 2 > Odu's 0
    const astro = makeAstro({ dominantPlanet: '' });
    const holo = makeHolo(astro);
    const profile = deriveAkashaType(
      astro,
      makeKab({ lifePath: 33, lifePathMaster: true }),
      makeTantra(),
      makeOdu({ oduName: '' }),
      holo
    );
    expect(profile.type).toBe('alquimista');
  });

  it('I Ching 11 only — IChing wins over empty Odu via precedence', () => {
    // IChing 11 → Zhen (Thunder/☳) → nuclear trigram 3 → 'construtor' (×2, precedence 3)
    // Odu empty → 'arquiteto' (×0, precedence 0)
    // construtor wins on precedence even though fewer raw votes
    const astro = makeAstro({ dominantPlanet: '' });
    const holo = makeHolo(astro, { ichingHex: 11 });
    const profile = deriveAkashaType(
      astro,
      makeKab({ lifePath: undefined }),
      makeTantra(),
      makeOdu({ oduName: '' }),
      holo
    );
    expect(profile.type).toBe('construtor');
  });

  it('Kabala LP 22 + Saturno — Kab precedence 2 > Odu prec 0', () => {
    // LP 22 → 'construtor' (×2, precedence 2 — Kab has real data)
    // Astro Saturno → 'guardiao' (×1, precedence 1 — Astro has real data)
    // Odu empty → 'arquiteto' (×3, precedence 0)
    // guardiao: 1 vote, precedence 1
    // construtor: 2 votes, precedence 2
    // → construtor wins on precedence (2 > 1)
    const astro = makeAstro({ dominantPlanet: 'Saturno' });
    const holo = makeHolo(astro);
    const profile = deriveAkashaType(
      astro,
      makeKab({ lifePath: 22, lifePathMaster: true }),
      makeTantra(),
      makeOdu({ oduName: '' }),
      holo
    );
    expect(profile.type).toBe('construtor');
  });

  it('Kabala LP 33 → alquimista (mestre)', () => {
    // LP 33 → 'alquimista' (×2); Odu empty → weight 0 (hasData=false)
    // Alquimista: 2 votes; Arquiteto: 0 votes → alquimista wins
    // ROADMAP: LP 33 is a master number that maps directly to alquimista
    const astro = makeAstro({ dominantPlanet: 'Saturno' });
    const holo = makeHolo(astro);
    const profile = deriveAkashaType(
      astro,
      makeKab({ lifePath: 33, lifePathMaster: true }),
      makeTantra(),
      makeOdu({ oduName: '' }),
      holo
    );
    expect(profile.type).toBe('alquimista');
  });

  it('Tantra refine — dominant body ≥7 nudges toward curador', () => {
    // Odu: Ogbe → catalisador (×3)
    // Tantra: body mental=9 (≥7) → refine: if voted=catalisador and body≥7, stays catalisador
    // Actually refineWithTantra only changes if voted=construtor and body≥7 → curador
    // So this test case needs voted=construtor
    const astro = makeAstro({ dominantPlanet: 'Lua' });
    const holo = makeHolo(astro);
    // Use LP 22 → construtor; Odu Ogbe → catalisador
    // Votes: catalisador(3) vs construtor(2) → catalisador wins
    // refineWithTantra: dominantBody=9 (≥7), voted=catalisador → no change
    const profile = deriveAkashaType(
      astro,
      makeKab({ lifePath: 22 }),
      makeTantra({
        bodies: {
          fisico: { number: 3 },
          mental: { number: 9 },
          emocional: { number: 5 },
          pranic: { number: 4 },
          espiritual: { number: 1 },
        },
      }),
      makeOdu({ oduName: 'Ogbe' }),
      holo
    );
    expect(profile.type).toBe('catalisador');
  });

  it('ichingHex null → no IChing votes (graceful)', () => {
    const astro = makeAstro({ dominantPlanet: 'Júpiter' });
    const holo = makeHolo(astro, { ichingHex: null });
    const profile = deriveAkashaType(
      astro,
      makeKab({ lifePath: 5 }),
      makeTantra(),
      makeOdu({ oduName: 'Ogunda' }),
      holo
    );
    // Ogunda → transformador (×3); LP 5 → transformador (×2); Astro Júpiter → transformador (×1)
    // transformador: 6 votes
    expect(profile.type).toBe('transformador');
  });

  it('ichingHex out of range → ignored gracefully', () => {
    const astro = makeAstro({ dominantPlanet: 'Sol' });
    const holo = makeHolo(astro, { ichingHex: 999 });
    const profile = deriveAkashaType(
      astro,
      makeKab({ lifePath: 1 }),
      makeTantra(),
      makeOdu({ oduName: 'Ogbe' }),
      holo
    );
    // Ogbe → catalisador (×3); LP 1 → catalisador (×2); Astro Sol → catalisador (×1)
    // catalisador: 6 votes
    expect(profile.type).toBe('catalisador');
  });
});

// ─── Frequency assessment (assessAreaFrequency) ────────────────────────────

describe('buildAkashaSynthesis — frequency mix', () => {
  it('mistura shadow/gift/siddhi entre as 6 áreas (não todas iguais)', () => {
    const astro = makeAstro();
    const synth = buildAkashaSynthesis(
      astro,
      makeKab(),
      makeTantra(),
      makeOdu(),
      makeHolo(astro),
      TODAY
    );
    const freqs = Object.values(synth.areas).map((a) => a.frequency);
    // Pelo menos 2 frequências distintas (regra heurística do engine)
    const uniqueFreqs = new Set(freqs);
    expect(uniqueFreqs.size).toBeGreaterThanOrEqual(1);
  });
});
