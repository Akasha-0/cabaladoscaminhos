import { describe, it, expect } from 'vitest';
import { LENORMAND_CARDS, getLenormandCardById } from '@/lib/constants/lenormand-cards';
import { ODUS, getOduById } from '@/lib/constants/odus';

describe('Glossário Oracular Canônico — 36 cartas (Doc 15 §1)', () => {
  it('tem 36 cartas, todas com baseMeaning e shadow não-vazios', () => {
    expect(LENORMAND_CARDS).toHaveLength(36);
    for (const c of LENORMAND_CARDS) {
      expect(c.baseMeaning.length, `carta ${c.id} sem baseMeaning`).toBeGreaterThan(0);
      expect(c.shadow.length, `carta ${c.id} sem shadow`).toBeGreaterThan(0);
    }
  });

  it('ids são sequenciais 1..36', () => {
    LENORMAND_CARDS.forEach((c, i) => expect(c.id).toBe(i + 1));
  });

  it('getLenormandCardById entrega a verdade-base canônica', () => {
    expect(getLenormandCardById(34)?.baseMeaning).toContain('fluxo financeiro');
    expect(getLenormandCardById(8)?.baseMeaning).toContain('fim');
  });
});

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
