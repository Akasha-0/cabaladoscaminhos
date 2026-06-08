/**
 * I-Ching prompt coverage tests (v0.0.5 T11 — fechar gap 8500 testes)
 * Cobre: formatIchingSection para todos os casos edge.
 */
import { describe, it, expect } from 'vitest';
import { formatIchingSection } from '@/lib/ai/iching-prompt';

const baseMap = {
  hexagramNumber: 1 as number,
  hexagramName: 'O Criativo',
  hexagramChineseName: 'Qian',
  upperTrigram: 1 as number,
  upperTrigramName: 'Céu',
  lowerTrigram: 1 as number,
  lowerTrigramName: 'Céu',
  lines: [true, true, true, true, true, true] as boolean[],
  aspects: ['liderança', 'criatividade', 'yang puro'] as string[],
  birthDate: '1990-01-01',
  birthTime: '12:00',
  algorithm: 'akasha.v0.0.4.trigramas-mod8' as const,
  provisional: false,
};

describe('formatIchingSection — edge cases', () => {
  it('renderiza hexagrama 1 (Qian) corretamente', () => {
    const out = formatIchingSection(baseMap);
    expect(out).toContain('1');
    expect(out).toContain('O Criativo');
    expect(out).toContain('Qian');
  });

  it('renderiza hexagrama 64 (Wei Ji) corretamente', () => {
    const m = { ...baseMap, hexagramNumber: 64, hexagramName: 'Antes da Conclusão', hexagramChineseName: 'Wei Ji' };
    const out = formatIchingSection(m);
    expect(out).toContain('64');
    expect(out).toContain('Antes da Conclusão');
    expect(out).toContain('Wei Ji');
  });

  it('renderiza hexagrama 29 (Kan — O Abismal) corretamente', () => {
    const m = { ...baseMap, hexagramNumber: 29, hexagramName: 'O Abismal', hexagramChineseName: 'Kan', upperTrigram: 3, upperTrigramName: 'Água', lowerTrigram: 3, lowerTrigramName: 'Água' };
    const out = formatIchingSection(m);
    expect(out).toContain('29');
    expect(out).toContain('Kan');
    expect(out).toContain('Água');
  });

  it('inclui seção "## Hexagrama Natal"', () => {
    const out = formatIchingSection(baseMap);
    expect(out).toMatch(/Hexagrama.*Natal/i);
  });

  it('inclui ambos os trigramas', () => {
    const out = formatIchingSection(baseMap);
    expect(out).toContain('superior');
    expect(out).toContain('inferior');
  });

  it('inclui os aspectos (lista)', () => {
    const out = formatIchingSection(baseMap);
    expect(out).toContain('liderança');
    expect(out).toContain('criatividade');
  });

  it('não inclui dados privados (ex: birthDate, birthTime)', () => {
    const out = formatIchingSection(baseMap);
    expect(out).not.toContain('1990-01-01');
    expect(out).not.toContain('12:00');
  });

  it('lida com aspects vazio sem quebrar', () => {
    const m = { ...baseMap, aspects: [] };
    expect(() => formatIchingSection(m)).not.toThrow();
  });

  it('lida com aspects com 1 item', () => {
    const m = { ...baseMap, aspects: ['sabedoria'] };
    const out = formatIchingSection(m);
    expect(out).toContain('sabedoria');
  });

  it('lida com aspects com 10+ itens', () => {
    const aspects = Array.from({ length: 12 }, (_, i) => `aspect-${i}`);
    const m = { ...baseMap, aspects };
    const out = formatIchingSection(m);
    expect(out).toContain('aspect-0');
    expect(out).toContain('aspect-11');
  });

  it('não inclui linhas (lines array) na output (são detalhe técnico)', () => {
    const out = formatIchingSection(baseMap);
    // lines should not appear in textual output
    expect(out).not.toContain('true,true,true');
  });

  it('inclui tag "akasha.v0.0.4.trigramas-mod8"? Não (LGPD) ou Sim (transparência)?', () => {
    const out = formatIchingSection(baseMap);
    // Decision: não incluir (não é útil pro consulente, é audit)
    expect(out).not.toContain('akasha.v0.0.4.trigramas-mod8');
  });

  it('renderiza hexagrama com hexagramNumber=0 sem quebrar (edge defensivo)', () => {
    const m = { ...baseMap, hexagramNumber: 0 };
    const out = formatIchingSection(m);
    // Não esperamos string vazia (0 é um número válido, mesmo que fora do range 1-64).
    // Só verificamos que não crasha.
    expect(out).toBeTruthy();
    expect(out).toContain('Hexagrama');
  });

  it('renderiza hexagrama com hexagramNumber=999 (out-of-range, defensivo)', () => {
    const m = { ...baseMap, hexagramNumber: 999 };
    const out = formatIchingSection(m);
    expect(out).toBeTruthy(); // não crasha
    expect(out).toContain('999');
  });

  it('lida com nome em chinês ausente (null)', () => {
    const m = { ...baseMap, hexagramChineseName: null as any };
    const out = formatIchingSection(m);
    expect(out).toContain('O Criativo');
  });

  it('lida com nome em chinês ausente (string vazia)', () => {
    const m = { ...baseMap, hexagramChineseName: '' };
    const out = formatIchingSection(m);
    expect(out).toContain('O Criativo');
  });

  it('lida com upper trigram id válido (1-8)', () => {
    for (let i = 1; i <= 8; i++) {
      const m = { ...baseMap, upperTrigram: i };
      expect(() => formatIchingSection(m)).not.toThrow();
    }
  });

  it('lida com lower trigram id válido (1-8)', () => {
    for (let i = 1; i <= 8; i++) {
      const m = { ...baseMap, lowerTrigram: i };
      expect(() => formatIchingSection(m)).not.toThrow();
    }
  });

  it('trigrama 0 ou 9 (out-of-range) ainda renderiza (defensivo)', () => {
    const m = { ...baseMap, upperTrigram: 0 as any, lowerTrigram: 9 as any };
    const out = formatIchingSection(m);
    expect(out).toBeTruthy(); // não crasha
  });
});
