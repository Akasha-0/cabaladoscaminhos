import { describe, it, expect } from 'vitest';
import { ODUS, getOduById } from '@/lib/constants/odus';

describe('Glossário Oracular Canônico — 16 Odus (Doc 15 §2)', () => {
  it('tem 16 Odus, todos com quizila e baseAdvice não-vazios', () => {
    expect(ODUS).toHaveLength(16);
    for (const o of ODUS) {
      expect(o.quizila.length, `odu ${o.id} sem quizila`).toBeGreaterThan(0);
      expect(o.baseAdvice.length, `odu ${o.id} sem baseAdvice`).toBeGreaterThan(0);
    }
  });

  it('getOduById entrega quizila e conselho-base', () => {
    const ejionile = getOduById(8);
    expect(ejionile?.name).toBe('Ejionile');
    expect(ejionile?.quizila).toContain('injusto');
    expect(ejionile?.baseAdvice).toContain('justiça');
  });
});
