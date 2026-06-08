import { describe, it, expect } from 'vitest';
import type { OduInfo } from '@/lib/ifa/calculos';
import { matchOduToRitual } from '@/lib/ifa/matching';

function makeOdu(overrides: Partial<OduInfo> = {}): OduInfo {
  return {
    numero: 1, nome: 'Ogbe', opeCima: { id: 1, nome: 'Omissa' }, opeBaixo: { id: 0, nome: 'Ocon' },
    orixaRegente: 'Exu', elementos: 'Ar', significado: 'Test', ebos: ['Ebó de Proteção'],
    ...overrides,
  };
}

describe('parseEboType', () => {
  const cases: Array<{ text: string; expected: string }> = [
    { text: 'Ebó de Caminho', expected: 'caminho' },
    { text: 'Ebó de Prosperidade', expected: 'prosperidade' },
    { text: 'Ebó de Defesa', expected: 'defesa' },
    { text: 'Ebó de Proteção', expected: 'protecao' },
    { text: 'Ebó de Transmutação', expected: 'transformacao' },
    { text: 'Ebó de Alinhamento', expected: 'alinhamento' },
    { text: 'Ebó de Saúde', expected: 'saude' },
    { text: 'Ebó de Alívio', expected: 'saude' },
    { text: 'Ebó de Justiça', expected: 'justica' },
    { text: 'Ebó de Renovação', expected: 'transformacao' },
    { text: 'Ebó de Agradecimento', expected: 'agradecimento' },
    { text: 'Ebó de Atração', expected: 'atração' },
    { text: 'Ebó de Ouro', expected: 'atração' },
    { text: 'Ebó de Movimento', expected: 'movimento' },
    { text: 'Ebó de Limpeza', expected: 'limpeza' },
    { text: 'Ebó genérico', expected: 'protecao' },
  ];
  cases.forEach(({ text, expected }) => {
    it(`"${text}" → "${expected}"`, () => {
      const odu = makeOdu({ ebos: [text] });
      const result = matchOduToRitual(odu);
      expect(result.ebos[0]?.tipo).toBe(expected);
    });
  });
  it('returns empty ebos array for empty string', () => {
    const odu = makeOdu({ ebos: [''] });
    const result = matchOduToRitual(odu);
    expect(result.ebos).toHaveLength(0);
  });
});
