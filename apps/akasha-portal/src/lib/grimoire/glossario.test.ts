import { describe, it, expect } from 'vitest';
import {
  glossarioPorSistema,
  buscarGlossario,
  coberturaGlossario,
  GLOSSARIO,
  type SistemaGlossario,
} from './glossario';

describe('glossario', () => {
  describe('GLOSSARIO', () => {
    it('should have entries for every defined sistema', () => {
      const sistemas: SistemaGlossario[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching', 'geral'];
      for (const s of sistemas) {
        const entries = GLOSSARIO.filter((e) => e.sistema === s);
        expect(entries.length, `sistema ${s}`).toBeGreaterThan(0);
      }
    });

    it('each entry should have required fields', () => {
      for (const entry of GLOSSARIO) {
        expect(entry.termo).toBeTruthy();
        expect(entry.definicao).toBeTruthy();
        expect(entry.sistema).toBeTruthy();
        expect(entry.fonte).toBeTruthy();
        expect(Array.isArray(entry.sinonimos)).toBe(true);
      }
    });
  });

  describe('buscarGlossario', () => {
    it('returns entry for exact termo match (case-insensitive)', () => {
      const result = buscarGlossario('Sefirot');
      expect(result).toBeDefined();
      expect(result!.termo).toBe('Sefirot');
    });

    it('returns entry for synonym match', () => {
      // 'Life Path' is a synonym of 'Caminho de Vida (Life Path)'
      const result = buscarGlossario('Life Path');
      expect(result).toBeDefined();
      expect(result!.termo).toBe('Caminho de Vida (Life Path)');
    });

    it('is case-insensitive for termo', () => {
      const upper = buscarGlossario('SEFIROT');
      const lower = buscarGlossario('sefirot');
      expect(upper?.termo).toBe(lower?.termo);
    });

    it('is case-insensitive for synonym', () => {
      const upper = buscarGlossario('ETZ CHAIM');
      const lower = buscarGlossario('etz chaim');
      expect(upper?.termo).toBe(lower?.termo);
    });

    it('returns undefined for unknown term', () => {
      expect(buscarGlossario('foo bar baz')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(buscarGlossario('')).toBeUndefined();
    });
  });

  describe('glossarioPorSistema', () => {
    it('cabala returns only cabala entries', () => {
      const results = glossarioPorSistema('cabala');
      expect(results.length).toBeGreaterThan(0);
      for (const e of results) {
        expect(e.sistema).toBe('cabala');
      }
    });

    it('astrologia returns only astrologia entries', () => {
      const results = glossarioPorSistema('astrologia');
      expect(results.length).toBeGreaterThan(0);
      for (const e of results) {
        expect(e.sistema).toBe('astrologia');
      }
    });

    it('tantrica returns only tantrica entries', () => {
      const results = glossarioPorSistema('tantrica');
      expect(results.length).toBeGreaterThan(0);
      for (const e of results) {
        expect(e.sistema).toBe('tantrica');
      }
    });

    it('odu returns only odu entries', () => {
      const results = glossarioPorSistema('odu');
      expect(results.length).toBeGreaterThan(0);
      for (const e of results) {
        expect(e.sistema).toBe('odu');
      }
    });

    it('iching returns only iching entries', () => {
      const results = glossarioPorSistema('iching');
      expect(results.length).toBeGreaterThan(0);
      for (const e of results) {
        expect(e.sistema).toBe('iching');
      }
    });

    it('geral returns only geral entries', () => {
      const results = glossarioPorSistema('geral');
      expect(results.length).toBeGreaterThan(0);
      for (const e of results) {
        expect(e.sistema).toBe('geral');
      }
    });
  });

  describe('coberturaGlossario', () => {
    it('total equals GLOSSARIO length', () => {
      const result = coberturaGlossario();
      expect(result.total).toBe(GLOSSARIO.length);
    });

    it('sum of por_sistema equals total', () => {
      const result = coberturaGlossario();
      const sum = Object.values(result.por_sistema).reduce((acc, n) => acc + n, 0);
      expect(sum).toBe(result.total);
    });

    it('each sistema count is non-negative', () => {
      const result = coberturaGlossario();
      for (const n of Object.values(result.por_sistema)) {
        expect(n).toBeGreaterThanOrEqual(0);
      }
    });

    it('por_sistema keys match all sistemas', () => {
      const result = coberturaGlossario();
      const sistemas: SistemaGlossario[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching', 'geral'];
      for (const s of sistemas) {
        expect(s in result.por_sistema).toBe(true);
      }
    });
  });
});
