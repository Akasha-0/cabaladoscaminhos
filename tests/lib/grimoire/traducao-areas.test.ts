/**
 * Testes para Camada de Tradução Pilar → Áreas (F-229)
 *
 * Verifica:
 *   - Matriz completa: 5 Pilares × 8 Áreas = 40 entradas
 *   - Pilar 4 (Odu) marca requer_terreiro em todas as 8 áreas (R-022 §4.4)
 *   - Helpers (traducaoPara, traducoesDaArea, traducoesDoPilar) funcionam
 *   - Cada Área tem exatamente 5 traduções (1 por Pilar)
 *   - Cada Pilar tem exatamente 8 traduções (1 por Área)
 *   - Cobertura estática: 5 Pilares, 8 Áreas
 */

import { describe, it, expect } from 'vitest';
import {
  traducaoPara,
  traducoesDaArea,
  traducoesDoPilar,
  coberturaTraducaoAreas,
  AREAS,
  type Area,
  type Pilar,
} from '@/lib/grimoire/traducao-areas';

const PILARES: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];

describe('traducao-areas: helpers básicos', () => {
  it('traducaoPara resolve combinação Pilar × Área', () => {
    const t = traducaoPara('cabala', 'paz');
    expect(t).toBeDefined();
    expect(t?.pilar).toBe('cabala');
    expect(t?.area).toBe('paz');
    expect(t?.frase.length).toBeGreaterThan(20);
  });

  it('traducoesDaArea devolve 5 traduções (1 por Pilar)', () => {
    AREAS.forEach((area) => {
      const ts = traducoesDaArea(area);
      expect(ts.length, `Área ${area} deveria ter 5 traduções`).toBe(5);
      const pilares = new Set(ts.map((t) => t.pilar));
      expect(pilares.size, `Área ${area} deveria ter 5 Pilares únicos`).toBe(5);
    });
  });

  it('traducoesDoPilar devolve 8 traduções (1 por Área)', () => {
    PILARES.forEach((pilar) => {
      const ts = traducoesDoPilar(pilar);
      expect(ts.length, `Pilar ${pilar} deveria ter 8 traduções`).toBe(8);
      const areas = new Set(ts.map((t) => t.area));
      expect(areas.size, `Pilar ${pilar} deveria ter 8 Áreas únicas`).toBe(8);
    });
  });

  it('coberturaTraducaoAreas reporta métricas estáticas', () => {
    const cob = coberturaTraducaoAreas();
    expect(cob.pilares).toBe(5);
    expect(cob.areas).toBe(8);
    expect(cob.total).toBe(40); // 5 × 8
    expect(cob.com_terreiro).toBe(8); // Pilar 4 × 8 áreas
  });
});

describe('traducao-areas: ética Pilar 4 (R-022 §4.4)', () => {
  it('Pilar 4 (Odu) marca requer_terreiro em TODAS as 8 áreas', () => {
    const ts = traducoesDoPilar('odu');
    expect(ts.length).toBe(8);
    ts.forEach((t) => {
      expect(t.requer_terreiro, `Odu/${t.area} sem requer_terreiro`).toBe(true);
    });
  });

  it('Demais Pilares NÃO marcam requer_terreiro', () => {
    const semTerreiro: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'iching'];
    semTerreiro.forEach((p) => {
      const ts = traducoesDoPilar(p);
      ts.forEach((t) => {
        expect(
          t.requer_terreiro,
          `${p}/${t.area} NÃO deveria ter requer_terreiro`,
        ).toBeUndefined();
      });
    });
  });
});

describe('traducao-areas: campos obrigatórios', () => {
  it('toda entrada tem frase, fonte, pilar, area preenchidos', () => {
    PILARES.forEach((p) => {
      const ts = traducoesDoPilar(p);
      ts.forEach((t) => {
        expect(t.frase, `${p}/${t.area} sem frase`).toBeTruthy();
        expect(t.frase.length, `${p}/${t.area} frase muito curta`).toBeGreaterThan(30);
        expect(t.fonte, `${p}/${t.area} sem fonte`).toBeTruthy();
        expect(t.pilar).toBe(p);
        expect(AREAS).toContain(t.area);
      });
    });
  });
});

describe('traducao-areas: cobertura completa da matriz', () => {
  it('existe tradução para TODAS as 40 combinações Pilar × Área', () => {
    let count = 0;
    PILARES.forEach((p) => {
      const areas: Area[] = [...AREAS];
      areas.forEach((a) => {
        const t = traducaoPara(p, a);
        expect(t, `Faltando ${p}/${a}`).toBeDefined();
        count += 1;
      });
    });
    expect(count).toBe(40);
  });
});
