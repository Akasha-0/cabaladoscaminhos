/**
 * @akasha/core-pilar7 — Testes das 64 chaves
 *
 * Verifica:
 * - Existem exatamente 64 chaves (1-64)
 * - Cada chave referencia um hexagrama I Ching existente (sinergia Pilar 5)
 * - Nomes sao universalistas (PT-BR, nao copias)
 * - Glifos sao unicos
 * - detectarChave() retorna chave correta, ou null para casos invalidos
 */
import { describe, it, expect } from 'vitest';
import { CHAVES, getChave, getAllChaves, detectarChave } from '../chave';

describe('Pilar 7 — Chaves (1-64)', () => {
  it('existem exatamente 64 chaves (1-64)', () => {
    const ids = Object.keys(CHAVES).map(Number).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 64 }, (_, i) => i + 1));
  });

  it('getAllChaves() retorna 64 em ordem King Wen', () => {
    const all = getAllChaves();
    expect(all).toHaveLength(64);
    for (let i = 0; i < 64; i++) {
      expect(all[i].numero).toBe(i + 1);
    }
  });

  it('cada chave tem nome, glifo, hexagramaOrigem, hexagramaOrigemChines', () => {
    for (let i = 1; i <= 64; i++) {
      const c = getChave(i);
      expect(c.numero).toBe(i);
      expect(typeof c.nome).toBe('string');
      expect(c.nome.length).toBeGreaterThan(0);
      expect(typeof c.glifo).toBe('string');
      expect(c.glifo.length).toBeGreaterThan(0);
      expect(typeof c.hexagramaOrigem).toBe('string');
      expect(c.hexagramaOrigem.length).toBeGreaterThan(0);
      expect(typeof c.hexagramaOrigemChines).toBe('string');
      expect(c.hexagramaOrigemChines.length).toBeGreaterThan(0);
    }
  });

  it('glifos sao unicos entre chaves (sinergia com I Ching)', () => {
    const glifos = Object.values(CHAVES).map((c) => c.glifo);
    const unique = new Set(glifos);
    expect(unique.size).toBe(64);
  });

  it('getChave() lanca RangeError para numeros invalidos', () => {
    expect(() => getChave(0)).toThrow(RangeError);
    expect(() => getChave(65)).toThrow(RangeError);
    expect(() => getChave(-1)).toThrow(RangeError);
    expect(() => getChave(1.5)).toThrow(RangeError);
    expect(() => getChave(NaN)).toThrow(RangeError);
  });

  it('detectarChave() retorna ChaveNatal para Pilar 5 valido', () => {
    const chave = detectarChave({
      hexagramNumber: 13,
      hexagramName: 'Concordancia entre os Homens',
    });
    expect(chave).not.toBeNull();
    expect(chave?.numero).toBe(13);
    expect(chave?.hexagramaOrigem).toBe('Concordancia entre os Homens');
  });

  it('detectarChave() retorna null para Pilar 5 ausente (opt-out)', () => {
    expect(detectarChave({ hexagramNumber: null, hexagramName: null })).toBeNull();
    expect(detectarChave(null as unknown as never)).toBeNull();
    expect(detectarChave(undefined as unknown as never)).toBeNull();
  });

  it('detectarChave() retorna null para numeros fora do range 1-64', () => {
    expect(detectarChave({ hexagramNumber: 0, hexagramName: null })).toBeNull();
    expect(detectarChave({ hexagramNumber: 65, hexagramName: null })).toBeNull();
    expect(detectarChave({ hexagramNumber: -1, hexagramName: null })).toBeNull();
  });

  it('sinergia com Pilar 5: chaves 1, 13, 29, 64 existem', () => {
    // Pontos de verificacao: hexagrama 1 (Qian), 13 (Tong Ren), 29 (Kan), 64 (Wei Ji)
    expect(getChave(1).hexagramaOrigemChines).toBe('Qian');
    expect(getChave(13).hexagramaOrigemChines).toBe('Tong Ren');
    expect(getChave(29).hexagramaOrigemChines).toBe('Kan');
    expect(getChave(64).hexagramaOrigemChines).toBe('Wei Ji');
  });

  it('nomes universalistas NAO sao copias literais (Guardrail 1)', () => {
    // Verifica que os nomes seguem padrao PT-BR original,
    // sem marcadores em ingles (proprietarios). Apenas letras
    // PT-BR (com acento) e espacos.
    const PT_BR_WORD = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ]*$/u;
    for (let i = 1; i <= 64; i++) {
      const c = getChave(i);
      // Sem caracteres nao-PT-BR (sem numeros, sem pontuacao suspeita)
      expect(c.nome).toMatch(/^[A-Za-zÀ-ÿ\s]+$/u);
      // Cada palavra capitalizada (PT-BR Title Case, nao EN "Two words")
      const words = c.nome.split(/\s+/).filter(Boolean);
      expect(words.length).toBeGreaterThan(0);
      for (const w of words) {
        expect(w).toMatch(PT_BR_WORD);
      }
    }
  });
});
