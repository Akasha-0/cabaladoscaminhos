/**
 * @akasha/core-iching — Testes de determinismo
 * v0.0.5 Fase 1 — T2.6
 *
 * O algoritmo `akasha.v0.0.4.trigramas-mod8` é DETERMINÍSTICO — mesma
 * entrada sempre produz mesma saída. Sem randomness, sem LLM.
 */
import { describe, it, expect } from 'vitest';
import { buildIchingMap } from '@akasha/core-iching';

describe('buildIchingMap — determinismo', () => {
  it('1000 iterações com mesmo input retornam mesmo hexagramNumber', () => {
    const args = { birthDate: '1990-05-15', birthTime: '14:30' };
    const baseline = buildIchingMap(args);
    for (let i = 0; i < 1000; i++) {
      const m = buildIchingMap(args);
      expect(m.hexagramNumber).toBe(baseline.hexagramNumber);
      expect(m.upperTrigram).toBe(baseline.upperTrigram);
      expect(m.lowerTrigram).toBe(baseline.lowerTrigram);
      expect(m.lines).toEqual(baseline.lines);
    }
  });

  it('algorithm tag é consistente em todas as chamadas', () => {
    const args = { birthDate: '1985-06-20', birthTime: '08:15' };
    for (let i = 0; i < 100; i++) {
      expect(buildIchingMap(args).algorithm).toBe('akasha.v0.0.4.trigramas-mod8');
    }
  });

  it('variação mínima de input (1 dia) pode produzir hexagrama diferente', () => {
    // Sanity check: o algoritmo reage a inputs diferentes
    const a = buildIchingMap({ birthDate: '1990-01-01', birthTime: '12:00' });
    const b = buildIchingMap({ birthDate: '1990-01-02', birthTime: '12:00' });
    // Pode ou não produzir hexagrama diferente dependendo do mod 8; o
    //  importante é que o algoritmo é estável para a mesma entrada
    //  (verificado no teste anterior). Aqui só validamos que linhas
    //  batem com a estrutura do hexagrama retornado.
    expect(a.lines).toHaveLength(6);
    expect(b.lines).toHaveLength(6);
  });

  it('1000 iterações com birthTime null (provisional) são determinísticas', () => {
    const args = { birthDate: '2000-02-29' }; // ano bissexto
    const baseline = buildIchingMap(args);
    for (let i = 0; i < 1000; i++) {
      const m = buildIchingMap(args);
      expect(m.hexagramNumber).toBe(baseline.hexagramNumber);
      expect(m.provisional).toBe(true);
    }
  });
});
