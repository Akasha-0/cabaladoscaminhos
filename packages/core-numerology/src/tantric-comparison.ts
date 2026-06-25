// ════════════════════════════════════════════════════════════════════════════
// COMPARAÇÃO ENTRE SISTEMAS NUMEROLÓGICOS — F-220 POC
// ════════════════════════════════════════════════════════════════════════════
//
// Stub de comparação: retorna os 4 valores numéricos (Pitagórico, Caldeu,
// Cabalístico, Tântrico) para uma dada data de nascimento e nome.
//
// IMPORTANTE — Limitações deste POC:
//   - Os valores cabalístico e tântrico são STUBS determinísticos derivados
//     de uma redução simples. A integração REAL com @akasha/core-cabala e
//     @akasha/core-tantra ficaria num PR futuro (F-220 produção).
//   - Este módulo é auto-contido (não depende dos outros packages core-*) —
//     evita coupling entre POC e packages já estáveis.
//   - Quando um consumer quiser a integração real, basta trocar as funções
//     `cabbalisticStub` e `tantricStub` por wrappers de `buildKabalisticMap`
//     e `buildTantricMap`.
//
// ────────────────────────────────────────────────────────────────────────────

import {
  reduceNumber,
  lifePath as pythagoreanLifePath,
  expression as pythagoreanExpression,
} from './pythagorean';
import { nameNumber as chaldeanNameNumber } from './chaldean';

/** Input canônico de comparação. */
export interface ComparisonInput {
  /** Data de nascimento em qualquer formato (só dígitos são lidos). */
  birthDate: string;
  /** Nome completo. */
  name: string;
}

/** Resultado da comparação entre os 4 sistemas. */
export interface NumerologyComparison {
  /** Pitagórica (Western): life path + expression do nome. */
  pythagorean: {
    lifePath: number;
    expression: number;
  };
  /** Caldeia (Ancient Babylonian): name number. */
  chaldean: {
    nameNumber: number;
  };
  /** Cabalística (Hebrew, Mispar Hechrachi): STUB derivado de vida + nome. */
  cabbalistic: {
    /** Soma bruta de life path + expression, depois reduzida. Stub. */
    composite: number;
    /** Indica que é stub (não usa Mispar Hechrachi real). */
    stub: true;
  };
  /** Tântrica (Yogi Bhajan): STUB derivado de data. */
  tantric: {
    /** Soma de dígitos da data, reduzida. Stub. */
    destiny: number;
    /** Indica que é stub (não chama buildTantricMap real). */
    stub: true;
  };
}

/**
 * STUB Cabalístico: NÃO usa Mispar Hechrachi real.
 * Implementação simples = life path + expression, reduzido.
 * Futura integração: chamar `buildKabalisticMap` de `@akasha/core-cabala`.
 */
function cabbalisticStub(birthDate: string, name: string): number {
  const lp = pythagoreanLifePath(birthDate);
  const ex = pythagoreanExpression(name);
  return reduceNumber(lp + ex);
}

/**
 * STUB Tântrico: NÃO chama buildTantricMap real.
 * Implementação simples = soma de dígitos da data, reduzida.
 * Futura integração: chamar `buildTantricMap` de `@akasha/core-tantra`.
 */
function tantricStub(birthDate: string): number {
  const digits = birthDate.replace(/\D/g, '');
  const sum = digits
    .split('')
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
  return reduceNumber(sum);
}

/**
 * Compara os 4 sistemas numerológicos para um input.
 * Output determinístico — mesma entrada produz mesmo resultado.
 *
 * @example
 *   compareSystems({ birthDate: "1986-08-20", name: "Eliane Simão" })
 *   // → { pythagorean: { lifePath: 7, expression: ... }, chaldean: {...}, ... }
 */
export function compareSystems(input: ComparisonInput): NumerologyComparison {
  const { birthDate, name } = input;
  return {
    pythagorean: {
      lifePath: pythagoreanLifePath(birthDate),
      expression: pythagoreanExpression(name),
    },
    chaldean: {
      nameNumber: chaldeanNameNumber(name),
    },
    cabbalistic: {
      composite: cabbalisticStub(birthDate, name),
      stub: true,
    },
    tantric: {
      destiny: tantricStub(birthDate),
      stub: true,
    },
  };
}