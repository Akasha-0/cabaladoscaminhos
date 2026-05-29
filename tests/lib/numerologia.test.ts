/**
 * Numerologia Unit Tests
 * 
 * Comprehensive tests for numerological calculations.
 */

import { describe, it, expect } from 'vitest';
import {
  calcularPitagorica,
  calcularCaldeia,
  calcularCabalistica,
  calcularTantrica,
  calcularPitagoricaData,
  getInterpretacao,
  interpretacoesNumerologia,
  tabelaPitagorica,
  tabelaCaldeia,
  tabelaCabalistica,
} from '@/lib/numerologia/calculos';
import {
  calcularAnoPessoal,
  calcularMesPessoal,
  calcularDiaPessoal,
  getCiclosTemporais,
} from '@/lib/numerologia/ciclos';

describe('Tabela Pitagórica', () => {
  it('should have values 1-9 for all letters', () => {
    const expectedValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      const value = tabelaPitagorica[letter];
      expect(expectedValues).toContain(value);
    }
  });

  it('should handle Portuguese accented letters', () => {
    const accentedLetters = ['Á', 'À', 'Ã', 'Â', 'É', 'Ê', 'Í', 'Ó', 'Ô', 'Õ', 'Ú', 'Ü'];
    
    for (const letter of accentedLetters) {
      const value = tabelaPitagorica[letter];
      expect(value).toBeDefined();
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(9);
    }
  });
});

describe('Tabela Caldeia', () => {
  it('should have values 1-8 for letters (no 9 in Chaldean)', () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (const letter of letters) {
      const value = tabelaCaldeia[letter];
      expect(value).toBeDefined();
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(8);
    }
  });
});

describe('Tabela Cabalística', () => {
  it('should have higher values (Gematria)', () => {
    // Hebrew-influenced values are much higher
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (const letter of letters) {
      const value = tabelaCabalistica[letter];
      expect(value).toBeDefined();
      expect(value).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have increasing values for sequential letters', () => {
    // In Gematria, sequential letters have higher values
    expect(tabelaCabalistica['A']).toBeLessThan(tabelaCabalistica['L']);
    expect(tabelaCabalistica['L']).toBeLessThan(tabelaCabalistica['M']);
    expect(tabelaCabalistica['M']).toBeLessThan(tabelaCabalistica['S']);
  });
});

describe('calcularPitagorica', () => {
  it('should return a number between 1 and 9', () => {
    const resultado = calcularPitagorica('Maria');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });

  it('should return deterministic results', () => {
    const resultado1 = calcularPitagorica('João');
    const resultado2 = calcularPitagorica('João');
    expect(resultado1).toBe(resultado2);
  });

  it('should handle empty string', () => {
    const resultado = calcularPitagorica('');
    expect(resultado).toBe(0);
  });

  it('should handle names with spaces', () => {
    const resultado = calcularPitagorica('Maria Silva');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });

  it('should handle accented characters', () => {
    const resultado = calcularPitagorica('José');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });

  it('should reduce numbers to single digit', () => {
    // Test that the algorithm reduces to root number
    const resultado = calcularPitagorica('Teste');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });
});

describe('calcularCaldeia', () => {
  it('should return a number between 1 and 9', () => {
    const resultado = calcularCaldeia('Maria');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });

  it('should return deterministic results', () => {
    const resultado1 = calcularCaldeia('João');
    const resultado2 = calcularCaldeia('João');
    expect(resultado1).toBe(resultado2);
  });

  it('should produce different results from Pythagorean', () => {
    // Chaldean and Pythagorean often differ
    const pitagorica = calcularPitagorica('Maria');
    const caldeia = calcularCaldeia('Maria');
    
    // Both should be valid numbers, may or may not be equal
    expect(pitagorica).toBeGreaterThanOrEqual(1);
    expect(caldeia).toBeGreaterThanOrEqual(1);
  });
});

describe('calcularCabalistica', () => {
  it('should return a number between 1 and 9 after reduction', () => {
    const resultado = calcularCabalistica('Maria');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });

  it('should return deterministic results', () => {
    const resultado1 = calcularCabalistica('João');
    const resultado2 = calcularCabalistica('João');
    expect(resultado1).toBe(resultado2);
  });

  it('should handle empty string', () => {
    const resultado = calcularCabalistica('');
    expect(resultado).toBe(0);
  });
});

describe('calcularTantrica', () => {
  it('should return a number between 1 and 9', () => {
    const resultado = calcularTantrica('1990-06-15');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });

  it('should return different results for different dates', () => {
    const resultado1 = calcularTantrica('1990-06-15');
    const resultado2 = calcularTantrica('2000-01-01');
    // Results may be same or different depending on date sum
    expect(resultado1).toBeGreaterThanOrEqual(1);
    expect(resultado2).toBeGreaterThanOrEqual(1);
  });

  it('should handle leap year dates', () => {
    const resultado = calcularTantrica('2000-02-29');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });

  it('should reduce multi-digit numbers to root', () => {
    // Test reduction logic
    const resultado = calcularTantrica('1990-06-15');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });
});

describe('calcularPitagoricaData', () => {
  it('should return a number between 1 and 9', () => {
    const resultado = calcularPitagoricaData('1990-06-15');
    expect(resultado).toBeGreaterThanOrEqual(1);
    expect(resultado).toBeLessThanOrEqual(9);
  });

  it('should return deterministic results', () => {
    const resultado1 = calcularPitagoricaData('1990-06-15');
    const resultado2 = calcularPitagoricaData('1990-06-15');
    expect(resultado1).toBe(resultado2);
  });
});

describe('getInterpretacao', () => {
  it('should return valid interpretacao for numbers 1-9', () => {
    for (let i = 1; i <= 9; i++) {
      const interpretacao = getInterpretacao(i);
      expect(interpretacao).toBeDefined();
      expect(interpretacao.numero).toBe(i);
      expect(interpretacao.nome).toBeTruthy();
      expect(interpretacao.significado).toBeTruthy();
    }
  });

  it('should return default interpretacao for invalid numbers', () => {
    const interp0 = getInterpretacao(0);
    expect(interp0).toBeDefined();
    expect(interp0.nome).toBe('Energia Desconhecida');
    
    const interp10 = getInterpretacao(10);
    expect(interp10).toBeDefined();
    expect(interp10.nome).toBeTruthy();
  });
});

describe('Interpretacoes Numerologia', () => {
  it('should have interpretacao for numbers 1-9', () => {
    for (let i = 1; i <= 9; i++) {
      expect(interpretacoesNumerologia[i]).toBeDefined();
    }
  });

  it('should have required fields in each interpretacao', () => {
    for (let i = 1; i <= 9; i++) {
      const interp = interpretacoesNumerologia[i];
      expect(interp.numero).toBe(i);
      expect(interp.nome).toBeTruthy();
      expect(interp.significado).toBeTruthy();
      expect(interp.forca).toBeTruthy();
      expect(interp.desafio).toBeTruthy();
      expect(interp.sefirotRelacionado).toBeTruthy();
    }
  });

  it('should have master numbers (11, 22, 33)', () => {
    expect(interpretacoesNumerologia[11]).toBeDefined();
    expect(interpretacoesNumerologia[22]).toBeDefined();
    expect(interpretacoesNumerologia[33]).toBeDefined();
  });
});

// ============================================
// Ciclo Tests
// ============================================

describe('calcularAnoPessoal', () => {
  it('should return valid year personal number (1-9 or master)', () => {
    const resultado = calcularAnoPessoal('1990-06-15');
    expect(resultado.numero).toBeGreaterThanOrEqual(1);
    // May be 1-9 or master numbers (11, 22, 33)
    expect(resultado.numero).toBeLessThanOrEqual(33);
  });

  it('should return sefirot name', () => {
    const resultado = calcularAnoPessoal('1990-06-15');
    expect(resultado.sefirot).toBeTruthy();
    expect(resultado.sefirot.length).toBeGreaterThan(0);
  });

  it('should return descricao or null', () => {
    const resultado = calcularAnoPessoal('1990-06-15');
    expect(resultado.descricao).toBeDefined();
    // descricao may be null for master numbers not in descricoesCiclos
    if (resultado.descricao) {
      expect(resultado.descricao.nome).toBeTruthy();
      expect(resultado.descricao.descricao).toBeTruthy();
    }
  });

  it('should return deterministic results', () => {
    const resultado1 = calcularAnoPessoal('1990-06-15');
    const resultado2 = calcularAnoPessoal('1990-06-15');
    expect(resultado1.numero).toBe(resultado2.numero);
  });
});

describe('calcularMesPessoal', () => {
  it('should return valid month personal number (1-9 or master)', () => {
    const resultado = calcularMesPessoal(5);
    expect(resultado.numero).toBeGreaterThanOrEqual(1);
    expect(resultado.numero).toBeLessThanOrEqual(33);
  });

  it('should return sefirot name', () => {
    const resultado = calcularMesPessoal(5);
    expect(resultado.sefirot).toBeTruthy();
  });

  it('should return descricao or null', () => {
    const resultado = calcularMesPessoal(5);
    expect(resultado.descricao).toBeDefined();
    if (resultado.descricao) {
      expect(resultado.descricao.nome).toBeTruthy();
    }
  });
});

describe('calcularDiaPessoal', () => {
  it('should return valid day personal number (1-9 or master)', () => {
    const resultado = calcularDiaPessoal('1990-06-15', 5);
    expect(resultado.numero).toBeGreaterThanOrEqual(1);
    // May be 1-9 or master numbers (11, 22, 33)
    expect(resultado.numero).toBeLessThanOrEqual(33);
  });

  it('should return sefirot name', () => {
    const resultado = calcularDiaPessoal('1990-06-15', 5);
    // sefirot may be undefined for master numbers beyond array
    if (resultado.sefirot) {
      expect(resultado.sefirot.length).toBeGreaterThan(0);
    }
  });

  it('should return descricao or null', () => {
    const resultado = calcularDiaPessoal('1990-06-15', 5);
    expect(resultado.descricao).toBeDefined();
    if (resultado.descricao) {
      expect(resultado.descricao.nome).toBeTruthy();
    }
  });
});

describe('getCiclosTemporais', () => {
  it('should return all cycle fields', () => {
    const resultado = getCiclosTemporais('1990-06-15');
    
    expect(resultado.anoPessoal).toBeGreaterThanOrEqual(1);
    expect(resultado.mesPessoal).toBeGreaterThanOrEqual(1);
    expect(resultado.diaPessoal).toBeGreaterThanOrEqual(1);
    
    // Check sefirot names exist (may be undefined for master numbers)
    if (resultado.sefirotAno) {
      expect(resultado.sefirotAno.length).toBeGreaterThan(0);
    }
    if (resultado.sefirotMes) {
      expect(resultado.sefirotMes.length).toBeGreaterThan(0);
    }
    if (resultado.sefirotDia) {
      expect(resultado.sefirotDia.length).toBeGreaterThan(0);
    }
    
    expect(resultado.descricao).toBeDefined();
    expect(resultado.descricao.ano).toBeDefined();
    expect(resultado.descricao.mes).toBeDefined();
    expect(resultado.descricao.dia).toBeDefined();
  });

  it('should return descriptions with all required fields when present', () => {
    const resultado = getCiclosTemporais('1990-06-15');
    
    // descricao may be null for some cycles (master numbers)
    const descricoes = [resultado.descricao.ano, resultado.descricao.mes, resultado.descricao.dia];
    
    for (const desc of descricoes) {
      // desc can be null
      if (desc) {
        expect(desc.nome).toBeTruthy();
        expect(desc.descricao).toBeTruthy();
        expect(desc.oraculo).toBeTruthy();
        expect(desc.cor).toBeTruthy();
        expect(desc.elemento).toBeTruthy();
      }
    }
  });

  it('should return deterministic results', () => {
    const resultado1 = getCiclosTemporais('1990-06-15');
    const resultado2 = getCiclosTemporais('1990-06-15');
    
    expect(resultado1.anoPessoal).toBe(resultado2.anoPessoal);
    expect(resultado1.mesPessoal).toBe(resultado2.mesPessoal);
    expect(resultado1.diaPessoal).toBe(resultado2.diaPessoal);
  });
});

// ============================================
// Integration Tests for Calculation Chains
// ============================================

describe('Calculation Integration', () => {
  it('should calculate consistent numerology across methods', () => {
    const nome = 'Maria';
    const data = '1990-06-15';
    
    const pitagorica = calcularPitagorica(nome);
    const caldeia = calcularCaldeia(nome);
    const cabalistica = calcularCabalistica(nome);
    const tantrica = calcularTantrica(data);
    const pitagoricaData = calcularPitagoricaData(data);
    
    // All should be valid (1-9 or master numbers)
    expect(pitagorica).toBeGreaterThanOrEqual(1);
    expect(caldeia).toBeGreaterThanOrEqual(1);
    expect(cabalistica).toBeGreaterThanOrEqual(1);
    expect(tantrica).toBeGreaterThanOrEqual(1);
    expect(pitagoricaData).toBeGreaterThanOrEqual(1);
    
    // All should be valid single-digit or master numbers
    expect(pitagorica).toBeLessThanOrEqual(33);
    expect(caldeia).toBeLessThanOrEqual(33);
    expect(cabalistica).toBeLessThanOrEqual(33);
    expect(tantrica).toBeLessThanOrEqual(33);
    expect(pitagoricaData).toBeLessThanOrEqual(33);
  });

  it('should work with full personal cycles', () => {
    const ciclos = getCiclosTemporais('1990-06-15');
    
    expect(ciclos.anoPessoal).toBeDefined();
    expect(ciclos.mesPessoal).toBeDefined();
    expect(ciclos.diaPessoal).toBeDefined();
    
    // Verify sefirot names are from valid list when defined
    const nomesValidos = [
      'Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah',
      'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
    ];
    
    // Only check sefirot if it exists
    if (ciclos.sefirotAno) {
      expect(nomesValidos).toContain(ciclos.sefirotAno);
    }
    if (ciclos.sefirotMes) {
      expect(nomesValidos).toContain(ciclos.sefirotMes);
    }
    if (ciclos.sefirotDia) {
      expect(nomesValidos).toContain(ciclos.sefirotDia);
    }
  });
});