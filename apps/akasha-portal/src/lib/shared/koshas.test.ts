import { describe, expect, it } from 'vitest';
import { KOSHAS } from './koshas';

// Mandala Fase 4 (spec mandala-fase3-zodiac-tantra)
// Requisito 4.3: KOSHAS é puramente dado, 5 entries, IDs únicos

describe('KOSHAS', () => {
  it('tem exatamente 5 entradas (pancha-kosha)', () => {
    expect(KOSHAS).toHaveLength(5);
  });

  it('IDs únicos e na ordem correta', () => {
    const ids = KOSHAS.map((k) => k.id);
    expect(ids).toEqual(['anna', 'prana', 'mano', 'vijnana', 'ananda']);
  });

  it('cada kosha tem nome em 3 idiomas (pt, en, sanskrit)', () => {
    for (const k of KOSHAS) {
      expect(k.name.pt).toBeTruthy();
      expect(k.name.en).toBeTruthy();
      expect(k.name.sanskrit).toBeTruthy();
      expect(k.name.sanskrit).toMatch(/-maya$/); // sufixo sânscrito padrão
    }
  });

  it('cada kosha tem cor hexadecimal válida', () => {
    for (const k of KOSHAS) {
      expect(k.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('cada kosha tem descrição em pt e en', () => {
    for (const k of KOSHAS) {
      expect(k.description.pt).toBeTruthy();
      expect(k.description.en).toBeTruthy();
      expect(k.description.pt.length).toBeGreaterThan(20);
    }
  });
});
