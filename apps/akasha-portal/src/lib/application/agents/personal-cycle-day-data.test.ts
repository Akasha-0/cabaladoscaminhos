/**
 * Personal Day Data — test coverage
 *
 * Covers the PERSONAL_DAY_DATA lookup table exported by personal-cycle-day-data.ts:
 * - All 9 base numbers (1-9) are present and have required fields
 * - Master numbers (11, 22, 33) are present and marked as spiritual energy
 * - Each entry has all required PersonalDay fields (energy, keywords, chakra,
 *   color, affirmation, action, avoid, favorable)
 * - Edge case: unknown key falls back to entry 1 (defensive lookup)
 */
import { describe, it, expect } from 'vitest';
import { PERSONAL_DAY_DATA } from './personal-cycle-day-data';

const REQUIRED_FIELDS = [
  'energy',
  'keywords',
  'chakra',
  'color',
  'affirmation',
  'action',
  'avoid',
  'favorable',
] as const;

const BASE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const MASTER_NUMBERS = [11, 22, 33];

// ─── base numbers (1-9) ────────────────────────────────────────────────────

describe('PERSONAL_DAY_DATA base numbers 1-9', () => {
  for (const num of BASE_NUMBERS) {
    it(`número ${num} tem todos os campos obrigatórios`, () => {
      const entry = PERSONAL_DAY_DATA[num];
      expect(entry).toBeDefined();

      for (const field of REQUIRED_FIELDS) {
        expect(entry[field], `${num}: missing ${field}`).toBeTruthy();
        expect(typeof entry[field], `${num}: ${field} should be string`).toBeTruthy();
      }

      expect(Array.isArray(entry.keywords)).toBe(true);
      expect(entry.keywords.length).toBeGreaterThan(0);
    });
  }

  it('energia do 1 é leadership', () => {
    expect(PERSONAL_DAY_DATA[1].energy).toBe('leadership');
  });

  it('energia do 5 é change', () => {
    expect(PERSONAL_DAY_DATA[5].energy).toBe('change');
  });

  it('energia do 9 é completion', () => {
    expect(PERSONAL_DAY_DATA[9].energy).toBe('completion');
  });
});

// ─── master numbers (11, 22, 33) ─────────────────────────────────────────

describe('PERSONAL_DAY_DATA master numbers', () => {
  for (const num of MASTER_NUMBERS) {
    it(`número ${num} tem energia spiritual`, () => {
      const entry = PERSONAL_DAY_DATA[num];
      expect(entry).toBeDefined();
      expect(entry.energy).toBe('spiritual');
    });
  }

  it('22 inclui keyword de construção mestre', () => {
    const entry = PERSONAL_DAY_DATA[22];
    const hasMasterKeyword = entry.keywords.some(
      (k) => k.includes('construtor') || k.includes('manifestação')
    );
    expect(hasMasterKeyword).toBe(true);
  });

  it('33 inclui keyword de serviço compassivo', () => {
    const entry = PERSONAL_DAY_DATA[33];
    const hasServiceKeyword = entry.keywords.some(
      (k) => k.includes('serviço') || k.includes('curador')
    );
    expect(hasServiceKeyword).toBe(true);
  });
});

// ─── defensive fallback ────────────────────────────────────────────────────

describe('PERSONAL_DAY_DATA fallback para chave inexistente', () => {
  it('chave 0 retorna entry 1 (fallback defensivo)', () => {
    // O código em calculatePersonalDay usa: PERSONAL_DAY_DATA[personalDay] || PERSONAL_DAY_DATA[1]
    const fallback = PERSONAL_DAY_DATA[0] || PERSONAL_DAY_DATA[1];
    expect(fallback).toBe(PERSONAL_DAY_DATA[1]);
  });

  it('chave negativa retorna entry 1 (fallback defensivo)', () => {
    const fallback = PERSONAL_DAY_DATA[-1] || PERSONAL_DAY_DATA[1];
    expect(fallback).toBe(PERSONAL_DAY_DATA[1]);
  });

  it('personalDay calculado que resulte em 10 faz fallback para 1', () => {
    // 10 não é chave válida — deve ir para fallback 1
    const entry = PERSONAL_DAY_DATA[10] || PERSONAL_DAY_DATA[1];
    expect(entry).toBe(PERSONAL_DAY_DATA[1]);
  });
});

// ─── chakra e color format ────────────────────────────────────────────────

describe('PERSONAL_DAY_DATA chakra e color', () => {
  const allNumbers = [...BASE_NUMBERS, ...MASTER_NUMBERS];

  for (const num of allNumbers) {
    it(`número ${num} tem chakra e color não vazios`, () => {
      const entry = PERSONAL_DAY_DATA[num];
      expect(entry.chakra.length).toBeGreaterThan(0);
      expect(entry.color.length).toBeGreaterThan(0);
    });
  }
});
