// tests/lib/mesa-real/mesa-real-duplicate-cards.test.ts
// AD-19.4 §3: Guardian — Permutation Invariant (resistência a duplicação)
// Valida que o Grande Tableau (36 casas) exige exatamente 36 cartas
// únicas (1–36), cada uma aparecendo em no máximo uma casa.
//
// Este teste protege contra alucinação do sistema: se a validação
// falhar, cartas duplicadas seriam persistidas na base de dados,
// corrompendo a leitura e invalidando correlações downstream.
//
// Refs: Doc 04 §1, Doc 06, AD-17.2 (duplicate-card guard no backend)

import { describe, it, expect } from 'vitest';
import { validateCardUniqueness, DuplicateCardError } from '@/app/api/mesa-real/save/route';

type CasaData = {
  carta: { numero: number; nome: string; significado: string } | null;
  odu: { numero: number; nome: string; significado: string } | null;
};

type MatrixData = Record<number, CasaData | null>;

// Helper — build minimal MatrixData for a single house
function house(cartaNum: number, oduNum: number): CasaData {
  return {
    carta: { numero: cartaNum, nome: `Carta${cartaNum}`, significado: 'x' },
    odu: { numero: oduNum, nome: `Odu${oduNum}`, significado: 'x' },
  };
}

function empty(): CasaData {
  return { carta: null, odu: null };
}

// MatrixData com casas de 1 a N preenchidas sequencialmente
function buildMatrix(assignments: Array<{ casa: number; carta: number; odu: number }>): MatrixData {
  const data: MatrixData = {};
  for (let i = 1; i <= 36; i++) data[i] = empty();
  for (const { casa, carta, odu } of assignments) {
    if (casa >= 1 && casa <= 36) data[casa] = house(carta, odu);
  }
  return data;
}

describe('validateCardUniqueness — AD-17.2 / AD-19.4 §3', () => {
  it('retorna válido para 36 cartas distintas', () => {
    const assignments = Array.from({ length: 36 }, (_, i) => ({
      casa: i + 1,
      carta: i + 1,   // carta N na casa N → 36 cartas únicas
      odu: i + 1,
    }));
    const result = validateCardUniqueness(buildMatrix(assignments));
    expect(result.valid).toBe(true);
    expect(result.duplicates).toHaveLength(0);
  });

  it('retorna inválido quando uma carta aparece em duas casas', () => {
    // Carta 5 aparece nas casas 3 e 17
    const data = buildMatrix([
      { casa: 3, carta: 5, odu: 3 },
      { casa: 5, carta: 7, odu: 5 },
      { casa: 17, carta: 5, odu: 17 }, // duplicata
    ]);
    const result = validateCardUniqueness(data);
    expect(result.valid).toBe(false);
    expect(result.duplicates).toHaveLength(1);
    expect(result.duplicates[0]).toBeInstanceOf(DuplicateCardError);
    expect(result.duplicates[0].cardNumber).toBe(5);
    expect(result.duplicates[0].houses).toEqual([3, 17]);
  });

  it('retorna inválido quando uma carta aparece em três casas', () => {
    // Carta 12 aparece em casas 4, 18 e 31
    const data = buildMatrix([
      { casa: 4, carta: 12, odu: 4 },
      { casa: 18, carta: 12, odu: 18 },
      { casa: 31, carta: 12, odu: 31 },
      { casa: 7, carta: 3, odu: 7 },
    ]);
    const result = validateCardUniqueness(data);
    expect(result.valid).toBe(false);
    expect(result.duplicates).toHaveLength(1);
    expect(result.duplicates[0].houses).toEqual([4, 18, 31]);
  });

  it('detecta múltiplas cartas duplicadas simultaneamente', () => {
    // Carta 8 duplicada (casas 2 e 20) + carta 22 duplicada (casas 9 e 33)
    const data = buildMatrix([
      { casa: 2, carta: 8, odu: 2 },
      { casa: 9, carta: 22, odu: 9 },
      { casa: 20, carta: 8, odu: 20 },
      { casa: 33, carta: 22, odu: 33 },
    ]);
    const result = validateCardUniqueness(data);
    expect(result.valid).toBe(false);
    expect(result.duplicates).toHaveLength(2);
    const cardNums = result.duplicates.map((d) => d.cardNumber).sort();
    expect(cardNums).toEqual([8, 22]);
  });

  it('casas vazias (carta/odu null) são ignoradas', () => {
    // Casa 3 tem carta null — não causa problema
    const data = buildMatrix([
      { casa: 3, carta: 7, odu: 3 },
      { casa: 7, carta: 7, odu: 7 }, // duplicata real
    ]);
    const result = validateCardUniqueness(data);
    expect(result.valid).toBe(false);
    expect(result.duplicates[0].cardNumber).toBe(7);
  });

  it('ignora casas com apenas carta (odu null) — não duplica', () => {
    const data: MatrixData = {};
    for (let i = 1; i <= 36; i++) data[i] = empty();
    data[5] = { carta: { numero: 1, nome: 'X', significado: 'x' }, odu: null };
    data[12] = { carta: { numero: 2, nome: 'Y', significado: 'x' }, odu: null };
    // nenhuma carta é duplicada — casas sem odu são válidas
    const result = validateCardUniqueness(data);
    expect(result.valid).toBe(true);
  });

  it('é permutation-invariant: mesma carta em casa diferente causa erro', () => {
    // Ordem diferente — resultado idêntico
    const result1 = validateCardUniqueness(buildMatrix([
      { casa: 1, carta: 5, odu: 1 },
      { casa: 2, carta: 10, odu: 2 },
      { casa: 3, carta: 5, odu: 3 }, // duplicata
    ]));
    const result2 = validateCardUniqueness(buildMatrix([
      { casa: 3, carta: 5, odu: 3 }, // duplicata — ordem invertida
      { casa: 2, carta: 10, odu: 2 },
      { casa: 1, carta: 5, odu: 1 },
    ]));
    expect(result1).toEqual(result2);
    expect(result1.valid).toBe(false);
    expect(result1.duplicates[0].cardNumber).toBe(5);
  });

  it('DuplicateCardError expõe cardNumber, cardName e houses', () => {
    const data = buildMatrix([
      { casa: 6, carta: 9, odu: 6 },
      { casa: 22, carta: 9, odu: 22 },
    ]);
    const result = validateCardUniqueness(data);
    const err = result.duplicates[0];
    expect(err.cardNumber).toBe(9);
    expect(err.cardName).toBe('Carta9');
    expect(err.houses).toEqual([6, 22]);
    expect(err.message).toMatch(/Carta9/);
  });
});
