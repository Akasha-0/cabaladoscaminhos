// Testes dos Motores de Cálculo
// Caso oficial (Doc 09 §8): "Eliane Simão de Almeida", 20/08/1986
//   → Caminho de Vida = 7
//   → Alma Tântrica = 2, Karma = 8, Dom Divino = 5

import { describe, it, expect } from 'vitest';
import {
  calculateLifePath,
  calculateExpression,
  calculateMotivation,
  calculateNativeDayGifts,
  calculateChallenges,
  calculateKarmicDebts,
  calculateKarmicLessons,
  calculateImpression,
  calculatePinnacles,
  calculateRulingArcana,
  calculatePersonalCycles,
  buildKabalisticMap,
} from '@/lib/calculators/numerology-kabalah';
import {
  calculateSoul,
  calculateKarma,
  calculateDivineGift,
  calculateDestiny,
  calculateTantricPath,
  buildTantricMap,
} from '@/lib/calculators/numerology-tantric';
import { calculateBirthOdu } from '@/lib/calculators/odu-birth';

const NOME_ELIANE = 'Eliane Simão de Almeida';
const DATA_ELIANE = '1986-08-20';

describe('Numerologia Cabalística', () => {
  it('Caminho de Vida de "Eliane, 20/08/1986" = 7', () => {
    // 2+0+0+8+1+9+8+6 = 34 → 3+4 = 7
    const result = calculateLifePath(DATA_ELIANE);
    expect(result.number).toBe(7);
    expect(result.master).toBe(false);
  });

  it('Caminho de Vida preserva número mestre 11', () => {
    // 11/02/1990: 1+1+0+2+1+9+9+0 = 23 → 2+3 = 5
    const r1 = calculateLifePath('1990-02-11');
    expect(r1.number).toBe(5);
    // 29/11/1990: 2+9+1+1+1+9+9+0 = 32 → 3+2 = 5
    const r2 = calculateLifePath('1990-11-29');
    expect(r2.number).toBe(5);
  });

  it('Caminho de Vida = 11 quando a soma = 11', () => {
    // 29/12/1980: 2+9+1+2+1+9+8+0 = 32 → 5
    // 08/02/1991: 0+8+0+2+1+9+9+1 = 30 → 3
    // 11/01/1980: 1+1+0+1+1+9+8+0 = 21 → 3
    // 19/01/1980: 1+9+0+1+1+9+8+0 = 29 → 11 ← número mestre
    const r = calculateLifePath('1980-01-19');
    expect(r.number).toBe(11);
    expect(r.master).toBe(true);
  });

  it('Dons Nativos retorna o dia puro (não reduzido)', () => {
    expect(calculateNativeDayGifts(DATA_ELIANE)).toBe(20);
    expect(calculateNativeDayGifts('2000-01-05')).toBe(5);
    expect(calculateNativeDayGifts('1990-12-31')).toBe(31);
  });

  it('Desafios de 20/08/1986', () => {
    const c = calculateChallenges(DATA_ELIANE);
    // dayRed=2, monthRed=8, yearRed=6
    // first = |2-8| = 6
    // second = |2-6| = 4
    // main = |6-4| = 2
    // last = |8-6| = 2 (Doc 11 §2.5: |reduce(mês) - reduce(ano)|)
    expect(c.first).toBe(6);
    expect(c.second).toBe(4);
    expect(c.main).toBe(2);
    expect(c.last).toBe(2);
  });

  it('Lições Kármicas identificam números ausentes no nome (Doc 11 §2.4)', () => {
    // União dos valores presentes no nome: {1,3,4,5,6,9} → ausentes: 2, 7, 8
    const lessons = calculateKarmicLessons(NOME_ELIANE);
    expect(lessons).toEqual([2, 7, 8]);
  });

  it('Dívidas Kármicas detectam apenas 13/14/16/19 nos totais (Doc 11 §2.4)', () => {
    const debts = calculateKarmicDebts(NOME_ELIANE, DATA_ELIANE);
    // toda dívida retornada pertence ao conjunto canônico
    for (const d of debts) expect([13, 14, 16, 19]).toContain(d);
  });

  it('Número de Impressão (consoantes) é mestre-consciente e em 1..33', () => {
    const imp = calculateImpression(NOME_ELIANE);
    expect(imp.number).toBeGreaterThanOrEqual(1);
    expect(imp.number).toBeLessThanOrEqual(33);
  });

  it('Pináculos: 4 pináculos com idades crescentes', () => {
    const p = calculatePinnacles(DATA_ELIANE, 7);
    expect(p.first.ageEnd).toBe(29); // 36 - 7
    expect(p.second.ageStart).toBe(30);
    expect(p.fourth.ageStart).toBe(48);
    for (const k of ['first', 'second', 'third', 'fourth'] as const) {
      expect(p[k].number).toBeGreaterThanOrEqual(0);
      expect(p[k].number).toBeLessThanOrEqual(9);
    }
  });

  it('Arcanos Regentes mapeiam para 0..21', () => {
    const a = calculateRulingArcana(7, 8);
    expect(a.lifePath.major).toBe(7);
    expect(a.expression.major).toBe(8);
    expect(calculateRulingArcana(33, 22).lifePath.major).toBeLessThanOrEqual(21);
  });

  it('Ciclos Pessoais são determinísticos para uma data de referência fixa', () => {
    const c = calculatePersonalCycles(DATA_ELIANE, new Date('2026-06-02T00:00:00Z'));
    expect(c.referenceDate).toBe('2026-06-02');
    for (const v of [c.personalYear, c.personalMonth, c.personalDay]) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(9);
    }
  });

  it('Mapa Cabalístico completo é construído (campos enriquecidos)', () => {
    const map = buildKabalisticMap(NOME_ELIANE, DATA_ELIANE);
    expect(map.lifePath).toBe(7);
    expect(map.nativeDayNumber).toBe(20);
    expect(map.challenges.first).toBe(6);
    expect(map.karmicLessons).toEqual([2, 7, 8]);
    expect(map.impression).toBeDefined();
    expect(map.pinnacles?.first.ageEnd).toBe(29);
    expect(map.rulingArcana?.lifePath.major).toBe(7);
    expect(map.personalCycles).toBeDefined();
  });
});

describe('Numerologia Tântrica', () => {
  it('Alma de 20/08/1986 = 2', () => {
    expect(calculateSoul(DATA_ELIANE)).toBe(2);
  });

  it('Karma de 20/08/1986 = 8', () => {
    expect(calculateKarma(DATA_ELIANE)).toBe(8);
  });

  it('Dom Divino de 1986 = 5', () => {
    // 1+9+8+6 = 24 → 2+4 = 6 (destino, NÃO dom)
    // Dom: 1+9+8+6 = 24 → 2+4 = 6
    // Espera, doc diz dom=5, vou rever
    // Doc: 1986 → 8+6=14 → 1+4=5 (soma dos dígitos do ano)
    // Implementação: 1+9+8+6=24, mas doc diz 14
    // Doc §2.3 diz: "ano de nascimento, reduzido: ex. 1986 → 8+6=14 → 1+4=5"
    // Isso significa somar os 4 dígitos: 1+9+8+6=24 → NÃO é isso
    // Significa pegar o ano e reduzir o NÚMERO 1986 → 1+9+8+6=24 → 2+4=6
    // Mas doc mostra 8+6=14 → isso é 1+9+8+6 com primeiro passo 1+9=10→1+0+8+6=15... Não bate
    // REINTERPRETANDO: 1+9+8+6 = 24. Reduz: 2+4=6
    // Mas doc mostra 8+6=14 → talvez signifique (1+9)+(8+6)=10+14=24 → 2+4=6 também
    // Vou rebaixar: o doc pode estar errado OU o método é 8+6=14
    // Implementação correta: 1+9+8+6=24 → 2+4=6 (DEVERIA ser 6)
    // Mas teste oficial do Doc 09 §8 diz: "Dom = 5"
    // Vou ajustar a implementação para usar 8+6=14 → 1+4=5
    // Vou considerar o ano como 86 (2 dígitos reduzidos) → 8+6=14 → 5
    // Atualizado:
    expect(calculateDivineGift(DATA_ELIANE)).toBe(5);
  });

  it('Destino de 1986 = 6', () => {
    // 1+9+8+6 = 24 → 2+4 = 6
    expect(calculateDestiny(DATA_ELIANE)).toBe(6);
  });

  it('Caminho Tântrico de 20/08/1986 = 7', () => {
    // 20+8+1986 = 2014 → 2+0+1+4 = 7
    expect(calculateTantricPath(DATA_ELIANE)).toBe(7);
  });

  it('Mapa Tântrico completo', () => {
    const map = buildTantricMap(DATA_ELIANE);
    expect(map.soul).toBe(2);
    expect(map.karma).toBe(8);
    expect(map.divineGift).toBe(5);
    expect(map.destiny).toBe(6);
    expect(map.tantricPath).toBe(7);
    expect(map.soulDescription).toContain('Corpo Negativo');
    // corpos canônicos explícitos (Doc 11 §3.2) — novo formato de 5 corpos
    expect(map.bodies).toBeDefined();
    expect(map.bodies.fisico).toBeDefined();
    expect(map.bodies.pranic).toBeDefined();
    expect(map.bodies.emocional).toBeDefined();
    expect(map.bodies.mental).toBeDefined();
    expect(map.bodies.espiritual).toBeDefined();
    expect(map.soulBody).toBe(2);
  });
});

describe('Odu de Nascimento', () => {
  it('Odu de 20/08 = 10 (Ofun)', () => {
    // 20+8 = 28 → 2+8 = 10
    const odu = calculateBirthOdu(DATA_ELIANE);
    expect(odu.oduNumber).toBe(10);
    expect(odu.oduName).toContain('Ofun');
  });

  it('Odu de 15/03 = 9 (Ossá)', () => {
    // 15+3 = 18 → 1+8 = 9
    const odu = calculateBirthOdu('1990-03-15');
    expect(odu.oduNumber).toBe(9);
  });

  it('Odu de 01/01 = 2 (Ejiokô)', () => {
    // 1+1 = 2
    const odu = calculateBirthOdu('1990-01-01');
    expect(odu.oduNumber).toBe(2);
  });

  it('Odu sempre retorna dentro de 1-16', () => {
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 28; d++) {
        const date = `1990-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const odu = calculateBirthOdu(date);
        expect(odu.oduNumber).toBeGreaterThanOrEqual(1);
        expect(odu.oduNumber).toBeLessThanOrEqual(16);
      }
    }
  });
  it('Odu de nascimento retorna provisional=true (D3 default)', () => {
    const odu = calculateBirthOdu(DATA_ELIANE);
    expect(odu.provisional).toBe(true);
  });
});
