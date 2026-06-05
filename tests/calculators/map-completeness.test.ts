// tests/calculators/map-completeness.test.ts
// AD-23.6 — Teste-guardiao de completude dos 4 mapas
//
// Garante que cada mapa contem TODOS os campos exigidos pelo Doc 04 2
// e pelo motor de correlacao (Doc 06/09). Qualquer campo ausente falha o gate.
//
// Caso de referencia: Eliane Simao de Almeida, 20/08/1986 (Doc 09 8)
// Coords: Sao Paulo, SP (lat=-23.5505, lon=-46.6333)

import { describe, it, expect } from 'vitest';
import { buildKabalisticMap } from '@akasha/core-cabala';
import { buildTantricMap } from '@akasha/core-tantra';
import { calculateBirthOdu } from '@akasha/core-odus';
import { getBirthChart, type BirthChart } from '@akasha/core-astrology';

const NOME_ELIANE = 'Eliane Simao de Almeida';
const DATA_ELIANE = '20/08/1986';
const DATE_ISO = '1986-08-20';
// Sao Paulo, SP
const LAT_SAOPAULO = -23.5505;
const LON_SAOPAULO = -46.6333;

// ---------------------------------------------------------------------------
// Helper: deep check that a value is not null/undefined
// ---------------------------------------------------------------------------
function isPresent<T>(val: T | null | undefined): val is T {
  return val !== null && val !== undefined;
}

function assertPresent(
  value: unknown,
  path: string
): asserts value is object | string | number | boolean {
  if (value === null || value === undefined) {
    throw new Error(`Campo ausente em ${path}: got ${value}`);
  }
}

function assertArray(
  value: unknown,
  path: string
): asserts value is unknown[] {
  assertPresent(value, path);
  if (!Array.isArray(value)) {
    throw new Error(`Campo nao array em ${path}: got ${typeof value}`);
  }
}

function assertObject(
  value: unknown,
  path: string
): asserts value is Record<string, unknown> {
  assertPresent(value, path);
  if (typeof value !== 'object') {
    throw new Error(`Campo nao objeto em ${path}: got ${typeof value}`);
  }
}

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
describe('AD-23.6 — Completude dos 4 mapas (guardiao)', () => {
  describe('KabalaMap — campos exigidos (Doc 04 2.2)', () => {
    it('buildKabalisticMap retorna todos os campos de numero', () => {
      const map = buildKabalisticMap(NOME_ELIANE, DATE_ISO);
      assertPresent(map.lifePath, 'lifePath');
      expect(map.lifePath).toBe(7); // Doc 09 8
      expect(typeof map.lifePathMaster).toBe('boolean');
      expect(typeof map.expression).toBe('number');
      expect(typeof map.expressionMaster).toBe('boolean');
      expect(typeof map.motivation).toBe('number');
      expect(typeof map.impression).toBe('number');
      expect(typeof map.nativeDayNumber).toBe('number');
      // desafios
      assertObject(map.challenges, 'challenges');
      expect(typeof map.challenges.first).toBe('number');
      expect(typeof map.challenges.second).toBe('number');
      expect(typeof map.challenges.main).toBe('number');
      expect(typeof map.challenges.last).toBe('number');
      // piculos
      assertObject(map.pinnacles, 'pinnacles');
      expect(typeof map.pinnacles.first.number).toBe('number');
      expect(typeof map.pinnacles.second.number).toBe('number');
      expect(typeof map.pinnacles.third.number).toBe('number');
      expect(typeof map.pinnacles.fourth.number).toBe('number');
      // lições e dividas karmicas
      assertArray(map.karmicLessons, 'karmicLessons');
      assertArray(map.karmicDebts, 'karmicDebts');
      // arcanos regentes
      assertObject(map.rulingArcana, 'rulingArcana');
      expect(typeof map.rulingArcana.lifePath.major).toBe('number');
      expect(typeof map.rulingArcana.expression.major).toBe('number');
      // ciclos de vida
      assertObject(map.lifeCycles, 'lifeCycles');
      expect(typeof map.lifeCycles.first.number).toBe('number');
      // ciclos pessoais
      assertObject(map.personalCycles, 'personalCycles');
      expect(typeof map.personalCycles.personalYear).toBe('number');
      expect(typeof map.personalCycles.personalMonth).toBe('number');
      expect(typeof map.personalCycles.personalDay).toBe('number');
      // campos string e derivados
      expect(typeof map.hebrewLetter).toBe('string');
      expect(typeof map.sefirotPath).toBe('string');
      expect(typeof map.vibrationalNumber).toBe('number');
      expect(typeof map.chaliceNumber).toBe('number');
      expect(typeof map.balanceNumber).toBe('number');
      expect(typeof map.hiddenPassionNumber).toBe('number');
      expect(typeof map.destinyNumber).toBe('number');
      expect(typeof map.soulUrgeNumber).toBe('number');
      expect(typeof map.personalityNumber).toBe('number');
      expect(typeof map.maturityNumber).toBe('number');
      expect(typeof map.personalYear).toBe('number');
      expect(typeof map.personalMonth).toBe('number');
      expect(typeof map.personalDay).toBe('number');
      // ciclos menores
      assertObject(map.minorCycles, 'minorCycles');
      assertArray(map.minorCycles.years, 'minorCycles.years');
      assertArray(map.minorCycles.months, 'minorCycles.months');
      assertArray(map.minorCycles.days, 'minorCycles.days');
      assertArray(map.nameHistory, 'nameHistory');
    });
  });

  describe('TantricMap — campos exigidos (Doc 04 2.3)', () => {
    it('buildTantricMap retorna todos os campos de numero e geometria', () => {
      const map = buildTantricMap(DATE_ISO);
      expect(typeof map.soul).toBe('number');
      expect(typeof map.karma).toBe('number');
      expect(typeof map.divineGift).toBe('number');
      expect(typeof map.destiny).toBe('number');
      expect(typeof map.tantricPath).toBe('number');
      // descricoes derivadas
      expect(typeof map.soulDescription).toBe('string');
      expect(typeof map.karmaDescription).toBe('string');
      expect(typeof map.divineGiftDescription).toBe('string');
      // 5 bodies
      assertObject(map.bodies, 'bodies');
      expect(typeof map.bodies.fisico.number).toBe('number');
      expect(typeof map.bodies.emocional.number).toBe('number');
      expect(typeof map.bodies.mental.number).toBe('number');
      expect(typeof map.bodies.espiritual.number).toBe('number');
      // geometria sagrada
      assertObject(map.sacredGeometry, 'sacredGeometry');
      expect(typeof map.sacredGeometry.merkabaActive).toBe('boolean');
      expect(Array.isArray(map.sacredGeometry.merkabahFields)).toBe(true);
      expect(Array.isArray(map.sacredGeometry.flowerOfLife)).toBe(true);
      assertObject(map.sacredGeometry.torusEnergy, 'sacredGeometry.torusEnergy');
      expect(typeof map.sacredGeometry.torusEnergy.active).toBe('boolean');
      expect(typeof map.sacredGeometry.torusEnergy.frequency).toBe('number');
      expect(typeof map.sacredGeometry.torusEnergy.intensity).toBe('number');
      // chakra states
      assertArray(map.chakraStates, 'chakraStates');
      expect(map.chakraStates.length).toBeGreaterThan(0);
      const firstChakra = map.chakraStates[0];
      expect(typeof firstChakra.chakra).toBe('string');
      expect(typeof firstChakra.name).toBe('string');
      expect(typeof firstChakra.state).toBe('string');
      expect(['balanced', 'overactive', 'underactive']).toContain(firstChakra.state);
      // energy matrix
      assertObject(map.energyMatrix, 'energyMatrix');
      expect(typeof map.energyMatrix.physicalBody).toBe('number');
      expect(typeof map.energyMatrix.emotionalBody).toBe('number');
      expect(typeof map.energyMatrix.mentalBody).toBe('number');
      expect(typeof map.energyMatrix.spiritualBody).toBe('number');
      // element balances
      assertObject(map.elementBalances, 'elementBalances');
      expect(typeof map.elementBalances.fire).toBe('number');
      expect(typeof map.elementBalances.water).toBe('number');
      expect(typeof map.elementBalances.earth).toBe('number');
      expect(typeof map.elementBalances.air).toBe('number');
      expect(typeof map.elementBalances.ether).toBe('number');
      // kundalini state
      assertObject(map.kundaliniState, 'kundaliniState');
      expect(typeof map.kundaliniState.active).toBe('boolean');
      expect(typeof map.kundaliniState.primaryChakra).toBe('string');
      expect(Array.isArray(map.kundaliniState.secondaryChakras)).toBe(true);
    });
  });

  describe('OduBirth — campos exigidos (Doc 04 2.4)', () => {
    it('calculateBirthOdu retorna oduNumber e provisional', () => {
      const odu = calculateBirthOdu(DATA_ELIANE);
      expect(typeof odu.oduNumber).toBe('number');
      expect(odu.oduNumber).toBeGreaterThan(0);
      expect(odu.oduNumber).toBeLessThanOrEqual(16);
      // oduName e o campo string principal; odu pode ser undefined no algorithm default
      if (isPresent(odu.oduName)) {
        expect(typeof odu.oduName).toBe('string');
        expect(odu.oduName.length).toBeGreaterThan(0);
      }
      // provisional deve estar sinalizado enquanto D3 nao vier
      expect(typeof odu.provisional).toBe('boolean');
      expect(odu.provisional).toBe(true); // D3 pendente
      // birthOdu array pode estar presente
      if (isPresent(odu.birthOdu)) {
        assertArray(odu.birthOdu, 'odu.birthOdu');
      }
    });
  });

  describe('AstrologyMap — campos exigidos (Doc 04 2.1)', () => {
    it('getBirthChart retorna planetas, casas, aspectos e campos AD-23.1', () => {
      const chart: BirthChart = getBirthChart({
        birthDate: new Date(`${DATE_ISO}T12:00:00`),
        latitude: LAT_SAOPAULO,
        longitude: LON_SAOPAULO,
      });
      // planetas como array
      assertArray(chart.planets, 'planets');
      expect(chart.planets.length).toBeGreaterThanOrEqual(10);
      // Sol tem longitude e velocidade
      const sol = chart.planets.find(p => p.planet === 'sol');
      assertPresent(sol, 'planets[planet=sol]');
      expect(typeof sol!.longitude).toBe('number');
      expect(typeof sol!.velocity).toBe('number');
      // Chiron e Lilith via chart.planeta (MapaNatal enriquecido)
      assertObject(chart.chart, 'chart');
      assertObject(chart.chart.planeta, 'chart.planeta');
      expect('chiron' in chart.chart.planeta).toBe(true);
      expect('lilith' in chart.chart.planeta).toBe(true);
      // casas (12 cusps)
      assertArray(chart.houses, 'houses');
      expect(chart.houses.length).toBe(12);
      for (const h of chart.houses) {
        expect(typeof h.number).toBe('number');
        expect(typeof h.cusp).toBe('number');
      }
      // ascendente
      expect(typeof chart.ascendant).toBe('number');
      expect(chart.ascendant).toBeGreaterThanOrEqual(0);
      expect(chart.ascendant).toBeLessThan(360);
      // aspectos com nature (AD-23.1)
      assertArray(chart.aspects, 'aspects');
      if (chart.aspects.length > 0) {
        const asp = chart.aspects[0];
        expect(typeof asp.planeta1).toBe('string');
        expect(typeof asp.planeta2).toBe('string');
        expect(typeof asp.tipo).toBe('string');
        expect(typeof asp.orb).toBe('number');
        expect(typeof asp.nature).toBe('string'); // AD-23.1
        expect(['harmony', 'tension', 'neutral']).toContain(asp.nature);
      }
    });

    it('aspectos: nature e harmony para trino/sextil, tension para quadratura/oposicao', () => {
      const chart: BirthChart = getBirthChart({
        birthDate: new Date(`${DATE_ISO}T12:00:00`),
        latitude: LAT_SAOPAULO,
        longitude: LON_SAOPAULO,
      });
      for (const asp of chart.aspects) {
        if (asp.tipo === 'trino' || asp.tipo === 'sextil') {
          expect(asp.nature).toBe('harmony');
        }
        if (asp.tipo === 'quadratura' || asp.tipo === 'oposicao') {
          expect(asp.nature).toBe('tension');
        }
        if (asp.tipo === 'conjuncao') {
          expect(asp.nature).toBe('neutral');
        }
      }
    });
  });

  describe('normalizeBirthChart — planetsInHouses (AD-23.1.2)', () => {
    it('planetsInHouses mapeia casa -> planetas para o correlation engine', async () => {
      const { normalizeBirthChart } = await import('@/lib/ai/dossier/oracle-prompt-builder');
      const chart: BirthChart = getBirthChart({
        birthDate: new Date(`${DATE_ISO}T12:00:00`),
        latitude: LAT_SAOPAULO,
        longitude: LON_SAOPAULO,
      });
      const normalized = normalizeBirthChart(chart as unknown as Record<string, unknown>);
      // planetsInHouses: reverse lookup house -> [planets]
      assertObject(normalized.planetsInHouses, 'planetsInHouses');
      const housesWithPlanets = Object.entries(normalized.planetsInHouses);
      // Com birth time fornecido, deve haver pelo menos algumas casas com planetas
      expect(housesWithPlanets.length).toBeGreaterThan(0);
      for (const [house, planets] of housesWithPlanets) {
        expect(Number(house)).toBeGreaterThan(0);
        expect(Number(house)).toBeLessThanOrEqual(12);
        assertArray(planets, `planetsInHouses[${house}]`);
        for (const planet of planets) {
          expect(typeof planet).toBe('string');
          expect(planet.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
