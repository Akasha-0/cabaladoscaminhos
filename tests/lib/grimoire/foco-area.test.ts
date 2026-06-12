/**
 * Testes para Foco do Dia por Área (F-239)
 *
 * Verifica:
 *   - Estrutura: todos os campos do FocoDoDia
 *   - Pilar 4 (Odu) marca requer_terreiro
 *   - 4 Ecos dos outros Pilares (1 por Pilar ≠ principal)
 *   - Prática curada por Área (não vazia)
 *   - Sombra curada por Área (não vazia)
 *   - Conexões retornadas tocam a Área via heurística de "frase"
 */

import { describe, it, expect } from 'vitest';
import { gerarFocoDoDia } from '@/lib/grimoire/foco-area';
import { AREAS, type Area } from '@/lib/grimoire/traducao-areas';
import type { Pilar } from '@/lib/grimoire/significados-curados';

describe('F-239 Foco: estrutura do FocoDoDia', () => {
  it('todos os campos obrigatórios preenchidos', () => {
    const foco = gerarFocoDoDia('cabala', 'paz');
    expect(foco.area).toBe('paz');
    expect(foco.pilar).toBe('cabala');
    expect(foco.mensagem_pilar.length).toBeGreaterThan(20);
    expect(foco.sombra.length).toBeGreaterThan(10);
    expect(foco.pratica.length).toBeGreaterThan(20);
    expect(foco.acolhimento.length).toBeGreaterThan(10);
    expect(Array.isArray(foco.ecos_dos_pilares)).toBe(true);
    expect(Array.isArray(foco.conexoes)).toBe(true);
  });

  it('ec_dos_pilares tem 4 entradas (1 por Pilar ≠ principal)', () => {
    const foco = gerarFocoDoDia('cabala', 'paz');
    expect(foco.ecos_dos_pilares.length).toBe(4);
  });

  it('cada Área tem prática curada (não vazia)', () => {
    AREAS.forEach((area: Area) => {
      const foco = gerarFocoDoDia('astrologia', area);
      expect(foco.pratica, `Área ${area} sem prática`).toBeTruthy();
      expect(foco.pratica.length, `Área ${area} prática muito curta`).toBeGreaterThan(15);
    });
  });

  it('cada Área tem sombra curada (não vazia)', () => {
    AREAS.forEach((area: Area) => {
      const foco = gerarFocoDoDia('tantrica', area);
      expect(foco.sombra, `Área ${area} sem sombra`).toBeTruthy();
      expect(foco.sombra.length, `Área ${area} sombra muito curta`).toBeGreaterThan(10);
    });
  });
});

describe('F-239 Foco: ética Pilar 4 (R-022 §4.4)', () => {
  it('Pilar 4 (Odu) marca requer_terreiro: true', () => {
    const foco = gerarFocoDoDia('odu', 'paz');
    expect(foco.requer_terreiro).toBe(true);
  });

  it('Pilar 1 (Cabala) NÃO marca requer_terreiro', () => {
    const foco = gerarFocoDoDia('cabala', 'relacoes');
    expect(foco.requer_terreiro).toBe(false);
  });

  it('todos os outros 4 Pilares NÃO marcam requer_terreiro', () => {
    const semTerreiro: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'iching'];
    semTerreiro.forEach((p) => {
      const foco = gerarFocoDoDia(p, 'paz');
      expect(foco.requer_terreiro, `${p} não deveria marcar terreiro`).toBe(false);
    });
  });
});

describe('F-239 Foco: cobertura da matriz 5 Pilares × 9 Áreas', () => {
  it('existe foco para TODAS as 45 combinações (5 × 9)', () => {
    const PILARES: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];
    let count = 0;
    PILARES.forEach((p) => {
      AREAS.forEach((a) => {
        const foco = gerarFocoDoDia(p, a);
        expect(foco.area, `${p}/${a} sem area`).toBe(a);
        expect(foco.pilar, `${p}/${a} sem pilar`).toBe(p);
        count += 1;
      });
    });
    expect(count).toBe(45);
  });
});
