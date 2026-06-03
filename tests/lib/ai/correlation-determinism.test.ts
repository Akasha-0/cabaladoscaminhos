// tests/lib/ai/correlation-determinism.test.ts
// Doc 19 §4.1 Invariant #1 — Casa 34 isolation test
// Verifies each Mesa Real house pulls ONLY its delegated aspects
// and does NOT leak Ascendente, Lua, or unrelated natal data.

import { describe, it, expect } from 'vitest';
import {
  CORRELATION_MAP,
  extractFromMap,
  getCorrelationEntry,
} from '@/lib/ai/correlation-map';
import { buildConsultContext } from '@/lib/ai/dossier/consult-context';
import { normalizeBirthChart } from '@/lib/ai/dossier/oracle-prompt-builder';
import type { ClientMaps } from '@/lib/ai/dossier/oracle-prompt-builder';
import type { MatrixData } from '@/types';

// ============================================================
// HELPERS
// ============================================================

/**
 * Full natal client in the raw BirthChart nested format.
 *
 * IMPORTANT: buildConsultContext → buildHousePayload calls normalizeBirthChart internally.
 * normalizeBirthChart expects the raw nested format (with chart.planeta, chart.casas).
 * Passing an already-normalized map would destroy data — normalizeBirthChart would find
 * no 'planeta'/'casas' keys and return empty planets/houses objects.
 *
 * Raw BirthChart format consumed by normalizeBirthChart:
 * - chart.planeta: Record<string, PosicaoPlaneta> — Portuguese planet names (sol, lua, ...)
 * - chart.casas: Casa[] — { numero, signo, planetaRegente }
 * - chart.ascendente: degree number
 * - chart.nodes.norte/sul: PosicaoPlaneta
 */
function makeFullClient(): ClientMaps {
  return {
    fullName: 'Test Consulente',
    birthDate: '1990-01-15',
    birthCity: 'São Paulo',
    birthCountry: 'BR',
    astrologyMap: {
      // BirthChart interface top-level fields — ignored by normalizeBirthChart
      // (which reads from chart.planeta / chart.casas instead)
      planets: [],
      houses: [],
      ascendant: 28,
      midheaven: 185,
      aspects: [],
      // Nested internal format — normalizeBirthChart reads from here
      chart: {
        usuarioId: 'test-user',
        dataCalculo: new Date('2024-01-01'),
        planeta: {
          sol: { planeta: 'sol', longitude: 135, latitude: 0, signo: 'leo', casa: 5, grauNoSigno: 15 },
          lua: { planeta: 'lua', longitude: 112, latitude: 0, signo: 'cancer', casa: 4, grauNoSigno: 22 },
          marte: { planeta: 'marte', longitude: 225, latitude: 0, signo: 'escorpio', casa: 8, grauNoSigno: 3 },
          venus: { planeta: 'venus', longitude: 190, latitude: 0, signo: 'libra', casa: 2, grauNoSigno: 10 },
          jupiter: { planeta: 'jupiter', longitude: 247, latitude: 0, signo: 'sagittarius', casa: 9, grauNoSigno: 7 },
          saturno: { planeta: 'saturno', longitude: 298, latitude: 0, signo: 'capricornio', casa: 10, grauNoSigno: 28 },
          mercurio: { planeta: 'mercurio', longitude: 162, latitude: 0, signo: 'virgem', casa: 6, grauNoSigno: 12 },
          urano: { planeta: 'urano', longitude: 13, latitude: 0, signo: 'aquario', casa: 11, grauNoSigno: 4 },
          netuno: { planeta: 'netuno', longitude: 349, latitude: 0, signo: 'peixes', casa: 12, grauNoSigno: 19 },
          plutao: { planeta: 'plutao', longitude: 203, latitude: 0, signo: 'escorpio', casa: 8, grauNoSigno: 2 },
          lilith: { planeta: 'lilith', longitude: 19, latitude: 0, signo: 'aries', casa: 1, grauNoSigno: 9 },
          chiron: { planeta: 'chiron', longitude: 122, latitude: 0, signo: 'leo', casa: 5, grauNoSigno: 21 },
        },
        casas: [
          { numero: 1, signo: 'aries', grauNoSigno: 28, planetaRegente: 'marte' },
          { numero: 2, signo: 'touro', grauNoSigno: 5, planetaRegente: 'venus' },
          { numero: 3, signo: 'gemeos', grauNoSigno: 12, planetaRegente: 'mercurio' },
          { numero: 4, signo: 'cancer', grauNoSigno: 25, planetaRegente: 'lua' },
          { numero: 5, signo: 'leo', grauNoSigno: 15, planetaRegente: 'sol' },
          { numero: 6, signo: 'virgem', grauNoSigno: 8, planetaRegente: 'mercurio' },
          { numero: 7, signo: 'libra', grauNoSigno: 28, planetaRegente: 'venus' },
          { numero: 8, signo: 'escorpio', grauNoSigno: 5, planetaRegente: 'marte' },
          { numero: 9, signo: 'sagittarius', grauNoSigno: 12, planetaRegente: 'jupiter' },
          { numero: 10, signo: 'capricornio', grauNoSigno: 25, planetaRegente: 'saturno' },
          { numero: 11, signo: 'aquario', grauNoSigno: 8, planetaRegente: 'urano' },
          { numero: 12, signo: 'peixes', grauNoSigno: 19, planetaRegente: 'jupiter' },
        ],
        ascendente: 28,
        mediumCoeli: 185,
        nodes: {
          norte: { planeta: 'node_norte', longitude: 63, latitude: 0, signo: 'gemeos', casa: 3, grauNoSigno: 11 },
          sul: { planeta: 'node_sul', longitude: 243, latitude: 0, signo: 'sagittarius', casa: 9, grauNoSigno: 11 },
        },
      },
    },
    kabalisticMap: {
      lifePath: 7,
      expression: 3,
      motivation: 5,
      destiny: 9,
      mission: 1,
      soul: 2,
      challenges: { first: 4, second: 6, main: 8 },
      karmicDebts: [13, 14],
      karmicLessons: [1, 2, 3],
      divineGift: 3,
      divineGiftDescription: 'Dom da comunicação',
      karma: 8,
      karmaDescription: 'Teste de transformação',
      soulDescription: 'Alma comunicativa',
      destinyDescription: 'Destino viajante',
      expressionDescription: 'Expressão criativa',
      motivationDescription: 'Motivação ambiciosa',
      missionDescription: 'Missão de líder',
    },
    tantricMap: {
      tantricPath: 'Shakti',
      soul: 2,
      soulDescription: 'Alma receptiva',
      destiny: 9,
      destinyDescription: 'Destino expansivo',
      karma: 8,
      karmaDescription: 'Karma de transformação',
      divineGift: 3,
      divineGiftDescription: 'Dom da expressão',
    },
    oduBirth: { odu: 'Eji-Ogbe', numero: 1 },
  };
}

/** MatrixData with only Casa 34 filled. */
function makeMatrixWithCasa34(): MatrixData {
  return {
    '34': {
      carta: 'Os Peixes',
      carta_numero: 34,
      carta_significado: 'Dinheiro, fluxo financeiro, abundância material, negócios',
      carta_base: 'Abundância e fluxos materiais',
      carta_sombra: 'Ilusão financeira e fuga da realidade material',
      odu_tirado: 'Ogbe',
      odu_numero: 1,
      odu_essencia: 'Início e criação',
      odu_quizila: 'Pratique generosidade consciente',
      odu_conselho: 'Honre o fluxo financeiro com GRATIDÃO antes de gastar.',
    },
  };
}

// ============================================================
// DOC 19 §4.1 INVARIANT #1 — Casa 34 ISOLATION
// ============================================================

describe('correlation determinism — Casa 34 isolation (Doc 19 §4.1 Invariant #1)', () => {
  it('Casa 34 extractionKeys do NOT include ascendant or moon', () => {
    const c34 = getCorrelationEntry(34);
    const keys = c34.astrology.extractionKeys;

    // Casa 34 must NOT leak ascendant
    expect(keys).not.toContain('ascendant');

    // Casa 34 must NOT leak moon data
    expect(keys).not.toContain('planets.moon.sign');
    expect(keys).not.toContain('planets.moon.house');
    expect(keys).not.toContain('moon');

    // Verify the inverse — no accidental inclusion anywhere in keys
    const leakedAscendant = keys.some((k) => k.includes('ascendant'));
    const leakedMoon = keys.some((k) => k.includes('moon'));
    expect(leakedAscendant, 'ascendant leaked into Casa 34 extractionKeys').toBe(false);
    expect(leakedMoon, 'moon leaked into Casa 34 extractionKeys').toBe(false);
  });

  it('Casa 34 SHOULD include its delegated aspects — 2ª Casa and Venus', () => {
    const c34 = getCorrelationEntry(34);
    const keys = c34.astrology.extractionKeys;

    // Casa 34 must delegate to 2ª Casa
    expect(keys).toContain('houses.2');

    // Casa 34 must delegate to Venus (sign and house)
    expect(keys).toContain('planets.venus.sign');
    expect(keys).toContain('planets.venus.house');
  });

  it('Casa 34 primaryPlanets contain Venus — not ascendant or moon', () => {
    const c34 = getCorrelationEntry(34);
    expect(c34.astrology.primaryPlanets).toContain('venus');
    expect(c34.astrology.primaryPlanets).not.toContain('ascendant');
    expect(c34.astrology.primaryPlanets).not.toContain('moon');
  });

  it('Casa 34 primaryHouses contain 2 — not 1, 4, or 7', () => {
    const c34 = getCorrelationEntry(34);
    expect(c34.astrology.primaryHouses).toContain(2);
    expect(c34.astrology.primaryHouses).not.toContain(1);
    expect(c34.astrology.primaryHouses).not.toContain(4);
    expect(c34.astrology.primaryHouses).not.toContain(7);
  });

  it('extractFromMap with Casa 34 keys on normalized client — NO leakage', () => {
    const client = makeFullClient();
    const c34 = getCorrelationEntry(34);

    // normalizeBirthChart produces the flat key format extractFromMap expects:
    // { planets: { sun: { sign, house }, venus: { sign, house } }, houses: { '2': ... }, ... }
    const normalizedAstro = normalizeBirthChart(
      client.astrologyMap as Parameters<typeof normalizeBirthChart>[0]
    );
    const extracted = extractFromMap(normalizedAstro, c34.astrology.extractionKeys);
    const extractedKeys = Object.keys(extracted);

    // Must have extracted Venus data
    expect(extractedKeys).toContain('planets.venus.sign');
    expect(extractedKeys).toContain('planets.venus.house');

    // Must have extracted 2nd house data
    expect(extractedKeys).toContain('houses.2');

    // MUST NOT have leaked ascendant
    expect(extractedKeys).not.toContain('ascendant');

    // MUST NOT have leaked moon data
    const moonKeys = extractedKeys.filter((k) => k.includes('moon'));
    expect(moonKeys, 'moon data leaked into Casa 34 extraction').toHaveLength(0);

    // MUST NOT have leaked sun or mars
    expect(extractedKeys).not.toContain('sun');
    expect(extractedKeys).not.toContain('planets.mars.sign');
  });

  it('buildConsultContext with Casa 34 in matrix — natal data only from delegation', () => {
    const client = makeFullClient();
    const matrix = makeMatrixWithCasa34();

    // "finanças" matches the 'dinheiro' theme → primary house 34
    const context = buildConsultContext(
      'Como estão minhas finanças este mês?',
      client,
      matrix
    );

    // Should have routed to Casa 34
    expect(context.drawnHouses.length, 'Should have drawn Casa 34').toBeGreaterThanOrEqual(1);
    const casa34Payload = context.drawnHouses.find((h) => h.casa_numero === 34);
    expect(casa34Payload).toBeDefined();
    expect(casa34Payload!.casa_numero).toBe(34);

    const natalValues = casa34Payload!.dados_natais_consulente.astrologia.valores;
    const natalKeys = Object.keys(natalValues);

    // Must contain Venus
    expect(natalKeys).toContain('planets.venus.sign');
    expect(natalKeys).toContain('planets.venus.house');

    // Must contain 2nd house
    expect(natalKeys).toContain('houses.2');

    // MUST NOT leak ascendant
    expect(natalKeys).not.toContain('ascendant');

    // MUST NOT leak moon data
    const moonLeak = natalKeys.filter((k) => k.includes('moon'));
    expect(moonLeak, 'moon leaked through buildConsultContext for Casa 34').toHaveLength(0);
  });
});

// ============================================================
// ALL 36 HOUSES — extraction key integrity
// ============================================================

describe('all 36 houses have non-empty extraction keys', () => {
  it('every house 1-36 has non-empty extractionKeys', () => {
    for (let house = 1; house <= 36; house++) {
      const entry = getCorrelationEntry(house);
      expect(
        entry.astrology.extractionKeys.length,
        `House ${house} (${entry.houseName}) has no extractionKeys`
      ).toBeGreaterThan(0);
    }
  });

  it('every house 1-36 has non-empty primaryHouses or primaryPlanets', () => {
    for (let house = 1; house <= 36; house++) {
      const entry = getCorrelationEntry(house);
      const hasPrimaryData =
        entry.astrology.primaryHouses.length > 0 ||
        entry.astrology.primaryPlanets.length > 0;
      expect(hasPrimaryData, `House ${house} has no primaryHouses or primaryPlanets`).toBe(true);
    }
  });

  it('extractionKeys cover every primaryPlanet declared in the entry', () => {
    for (let house = 1; house <= 36; house++) {
      const entry = getCorrelationEntry(house);
      for (const planet of entry.astrology.primaryPlanets) {
        // Special cases: ascendant and nodes are flat top-level keys in the normalized output,
        // not nested under planets.*
        const isSpecialCase =
          planet === 'ascendant' || planet === 'northNode' || planet === 'southNode';
        if (isSpecialCase) {
          // ascendant → key is 'ascendant'; northNode/southNode → keys are 'northNode', 'southNode'
          const hasFlatKey = entry.astrology.extractionKeys.some(
            (k) =>
              k === planet ||
              k === `${planet}.sign` ||
              k === `${planet}.house` ||
              k === `${planet}.signo` ||
              k === `${planet}.casa`
          );
          expect(
            hasFlatKey,
            `House ${house}: special primaryPlanet "${planet}" has no matching key in extractionKeys`
          ).toBe(true);
          continue;
        }

        // Regular planets: must have planets.{planet}.sign or planets.{planet}.house
        const hasSign = entry.astrology.extractionKeys.some(
          (k) => k === `planets.${planet}.sign` || k === `${planet}.sign`
        );
        const hasHouse = entry.astrology.extractionKeys.some(
          (k) => k === `planets.${planet}.house` || k === `${planet}.house`
        );
        expect(
          hasSign || hasHouse,
          `House ${house}: primaryPlanet "${planet}" is declared but has no sign or house in extractionKeys`
        ).toBe(true);
      }
    }
  });
});

// ============================================================
// extractFromMap — deterministic boundary
// ============================================================

describe('extractFromMap — deterministic boundary (no silent leakage)', () => {
  it('returns ONLY the requested keys, even when map has extra fields', () => {
    const fakeMap: Record<string, unknown> = {
      ascendant: 'aries',
      sun: 'leo',
      moon: 'cancer',
      mars: 'aries',
      venus: 'libra',
      jupiter: 'sagittarius',
      saturn: 'capricorn',
      extraField: 'should not appear',
      anotherExtra: 999,
    };
    const result = extractFromMap(fakeMap, ['venus']);
    expect(Object.keys(result)).toEqual(['venus']);
    expect(result).not.toHaveProperty('extraField');
    expect(result).not.toHaveProperty('ascendant');
    expect(result).not.toHaveProperty('moon');
  });

  it('returns empty object for null/undefined map', () => {
    expect(extractFromMap(null, ['venus'])).toEqual({});
    expect(extractFromMap(undefined, ['venus'])).toEqual({});
  });

  it('returns empty object for empty keys array', () => {
    const fakeMap: Record<string, unknown> = { ascendant: 'aries', sun: 'leo' };
    expect(extractFromMap(fakeMap, [])).toEqual({});
  });

  it('gracefully skips missing keys without throwing', () => {
    const fakeMap: Record<string, unknown> = { ascendant: 'aries' };
    const result = extractFromMap(fakeMap, ['venus', 'moon', 'ascendant']);
    expect(Object.keys(result)).toContain('ascendant');
    expect(Object.keys(result)).not.toContain('venus');
    expect(Object.keys(result)).not.toContain('moon');
  });
});

// ============================================================
// CROSS-HOUSE LEAKAGE — spot checks
// ============================================================

describe('cross-house leakage spot checks', () => {
  // House 7 (Serpente) should NOT have sun or moon
  it('House 7 (Serpente) does not inject sun or moon', () => {
    const entry = getCorrelationEntry(7);
    expect(entry.astrology.primaryPlanets).toContain('lilith');
    expect(entry.astrology.primaryPlanets).not.toContain('sun');
    expect(entry.astrology.primaryPlanets).not.toContain('moon');
    expect(entry.astrology.extractionKeys).not.toContain('sun');
    expect(entry.astrology.extractionKeys).not.toContain('moon');
  });

  // House 4 (Casa) should NOT have ascendant
  it('House 4 (A Casa) does not inject ascendant', () => {
    const entry = getCorrelationEntry(4);
    expect(entry.astrology.primaryPlanets).toContain('moon');
    expect(entry.astrology.primaryPlanets).not.toContain('ascendant');
    expect(entry.astrology.extractionKeys).not.toContain('ascendant');
  });

  // House 1 (Cavaleiro) should NOT have venus or jupiter
  it('House 1 (Cavaleiro) does not inject venus or jupiter', () => {
    const entry = getCorrelationEntry(1);
    expect(entry.astrology.primaryPlanets).toContain('ascendant');
    expect(entry.astrology.primaryPlanets).not.toContain('venus');
    expect(entry.astrology.primaryPlanets).not.toContain('jupiter');
    expect(entry.astrology.extractionKeys).not.toContain('planets.venus.sign');
    expect(entry.astrology.extractionKeys).not.toContain('planets.jupiter.sign');
  });

  // House 24 (O Coração) SHOULD have both venus and moon — love/emotions
  it('House 24 (O Coração) includes both Venus and Moon (love + emotions)', () => {
    const entry = getCorrelationEntry(24);
    expect(entry.astrology.primaryPlanets).toContain('venus');
    expect(entry.astrology.primaryPlanets).toContain('moon');
    expect(entry.astrology.extractionKeys).toContain('planets.venus.sign');
    expect(entry.astrology.extractionKeys).toContain('planets.moon.sign');
  });
});
