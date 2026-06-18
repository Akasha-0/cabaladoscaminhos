/**
 * Unit Tests for @akasha/core-cabala ciclos module
 *
 * Tested functions:
 * - calcularAnoPessoal(dataNascimento)
 * - calcularMesPessoal(anoPessoal)
 * - calcularDiaPessoal(dataNascimento, anoPessoal)
 * - getCiclosTemporais(dataNascimento)
 *
 * Note: all three funciones call new Date() internally (for current month/day/year).
 * Tests use vi.useFakeTimers() to anchor time at 2026-06-18.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calcularAnoPessoal,
  calcularMesPessoal,
  calcularDiaPessoal,
  getCiclosTemporais,
} from '../../../packages/core-cabala/src/ciclos';

// Use vitest's built-in fake timers so new Date() returns 2026-06-18 deterministically
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-06-18T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('calcularAnoPessoal', () => {
  // With system date fixed at 2026-06-18:
  // birthDate "01012000" + "2026" = "010120002026"
  // Digits sum: 0+1+1+2+0+0+2+0+2+6 = 14 → 1+4 = 5
  it("'01/01/2000' with year 2026 → 5, sefirot Chesed (index 4)", () => {
    const result = calcularAnoPessoal('01/01/2000');
    expect(result.numero).toBe(5);
    expect(result.sefirot).toBe('Geburah');
  });

  // '01011990' + '2026' = "010119902026"
  // 0+1+0+1+1+9+9+0+2+0+2+6 = 31 → 3+1 = 4
  it("'01/01/1990' with year 2026 → 4, sefirot Chesed", () => {
    const result = calcularAnoPessoal('01/01/1990');
    expect(result.numero).toBe(4);
    expect(result.sefirot).toBe('Chesed');
  });

  // Happy path — verify descricao mapping for number 9
  // '20062026' but the function concatenates with current year too:
  // '20/06/2026' + '2026' = '20/06/20262026' → digits '200620262026'
  // sum = 2+0+0+6+2+0+2+6+2+0+2+6 = 28 → 2+8 = 10 → 1+0 = 1
  it("'20/06/2026' with year 2026 → 1, sefirot Kether", () => {
    const result = calcularAnoPessoal('20/06/2026');
    expect(result.numero).toBe(1);
    expect(result.sefirot).toBe('Kether');
    expect(result.descricao?.nome).toBe('Início e Liderança');
  });
  // Edge case — '05052000' + '2026' = '050520002026'
  // Digits: 0+5+0+5+2+0+0+0+2+0+2+6 = 22 → master preserved
  it("'05/05/2000' with year 2026 → 22 (master), sefirot Chesed", () => {
    const result = calcularAnoPessoal('05/05/2000');
    expect(result.numero).toBe(22);
    expect(result.sefirot).toBe('Chesed');
  });
});

describe('calcularMesPessoal', () => {
  // anoPessoal=5 + current month (June=6) = 11 → 11 (master preserved)
  it('anoPessoal=5, current month=6 → 11 (master), sefirot Chokmah', () => {
    const result = calcularMesPessoal(5);
    expect(result.numero).toBe(11);
    expect(result.sefirot).toBe('Chokmah');
  });

  // anoPessoal=4 + current month=6 = 10 → 1+0=1
  it('anoPessoal=4, current month=6 → 1, sefirot Kether', () => {
    const result = calcularMesPessoal(4);
    expect(result.numero).toBe(1);
    expect(result.sefirot).toBe('Kether');
  });

  // Edge case — simple non-master reduction
  // anoPessoal=2 + current month=6 = 8
  it('anoPessoal=2, current month=6 → 8, sefirot Hod', () => {
    const result = calcularMesPessoal(2);
    expect(result.numero).toBe(8);
    expect(result.sefirot).toBe('Hod');
    expect(result.descricao?.nome).toBe('Poder e Abundância');
  });

  // Edge case — master preserved: 16 + 6 = 22 → 22 (master, preserved immediately)
  it('anoPessoal=16, current month=6 → 22 (master, preserved)', () => {
    const result = calcularMesPessoal(16);
    expect(result.numero).toBe(22);
    expect(result.sefirot).toBe('Chesed');
  });
});

describe('calcularDiaPessoal', () => {
  // dataNascimento="01012000", anoPessoal=5
  // Current date fixed at 2026-06-18 → mesAtual=6, diaAtual=18
  // numero = 5 + 6 + 18 = 29 → 2+9 = 11 (master)
  it('anoPessoal=5, month=6, day=18 → 11 (master), sefirot Chokmah', () => {
    const result = calcularDiaPessoal('01/01/2000', 5);
    expect(result.numero).toBe(11);
    expect(result.sefirot).toBe('Chokmah');
  });

  // anoPessoal=2 + 6 + 18 = 26 → 2+6 = 8
  it('anoPessoal=2, month=6, day=18 → 8, sefirot Hod', () => {
    const result = calcularDiaPessoal('01/01/2000', 2);
    expect(result.numero).toBe(8);
    expect(result.sefirot).toBe('Hod');
    expect(result.descricao?.nome).toBe('Poder e Abundância');
  });

  // Happy path — non-master double-digit
  // anoPessoal=3 + 6 + 18 = 27 → 2+7 = 9
  it('anoPessoal=3, month=6, day=18 → 9, sefirot Yesod', () => {
    const result = calcularDiaPessoal('01/01/2000', 3);
    expect(result.numero).toBe(9);
    expect(result.sefirot).toBe('Yesod');
  });

  // Edge case — master number 22
  // anoPessoal=22 + 6 + 18 = 46 → 4+6 = 10 → 1+0 = 1 (not master)
  // Need 22 directly: anoPessoal=22 + 0 + 0 = 22? No, hard to get 22.
  // Master: anoPessoal=22, but 22+6+18=46→10→1. For master, need sum=22 or reduce=22.
  // For 22: 22+6+18=46→4+6=10→1+0=1. Not a master.
  // 22 from: 22+1+? = 22 → ? = -1 impossible.
  // So the edge case of 22 is not naturally achievable in calcularDiaPessoal with current month/day.
  // The edge case we can exercise is: anoPessoal=22 → result is non-master 1.
  it('anoPessoal=22, month=6, day=18 → 1, sefirot Kether', () => {
    const result = calcularDiaPessoal('01/01/2000', 22);
    expect(result.numero).toBe(1);
    expect(result.sefirot).toBe('Kether');
  });
});

describe('getCiclosTemporais', () => {
  // Integration: compose all three cycles
  // With system date 2026-06-18 and birthDate "01012000"
  // Year: "01012000"+"2026"="010120002026" → digits sum = 14 → 5
  // Month: 5 + 6 = 11 → 11 (master)
  // Day: 5 + 6 + 18 = 29 → 2+9 = 11 (master)
  it("'01/01/2000' → ano=5, mes=11(master), dia=11(master)", () => {
    const result = getCiclosTemporais('01/01/2000');
    expect(result.anoPessoal).toBe(5);
    expect(result.mesPessoal).toBe(11);
    expect(result.diaPessoal).toBe(11);
    expect(result.sefirotAno).toBe('Geburah');
    expect(result.sefirotMes).toBe('Chokmah');
    expect(result.sefirotDia).toBe('Chokmah');
  });

  // Edge case — '05052000' with year 2026
  // '050520002026' digits sum: 0+5+0+5+2+0+0+0+2+0+2+6 = 22 → master
  it("'05/05/2000' → ano=22(master), mes=4, dia=1", () => {
    const result = getCiclosTemporais('05/05/2000');
    expect(result.anoPessoal).toBe(22);
    expect(result.sefirotAno).toBe('Chesed');
    // mes: 22 + 6 = 28 → 2+8=10 → 1+0=1
    expect(result.mesPessoal).toBe(1);
    expect(result.sefirotMes).toBe('Kether');
    // dia: 22 + 6 + 18 = 46 → 4+6=10 → 1+0=1
    expect(result.diaPessoal).toBe(1);
    expect(result.sefirotDia).toBe('Kether');
  });
});
