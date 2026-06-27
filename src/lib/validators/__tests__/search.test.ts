// ============================================================================
// SEARCH VALIDATORS — testes unitários dos Zod schemas de busca
// ============================================================================
// Cobre: SearchQuerySchema, SuggestionQuerySchema, TagPageQuerySchema.
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  SearchQuerySchema,
  SearchTypeSchema,
  SearchSortSchema,
  SuggestionQuerySchema,
  TagPageQuerySchema,
} from '@/lib/validators/search';

describe('search validators', () => {
  describe('SearchTypeSchema', () => {
    it('aceita todos os tipos de busca validos', () => {
      const valid = ['all', 'posts', 'articles', 'users', 'groups', 'tags'];
      valid.forEach((t) => {
        expect(SearchTypeSchema.parse(t)).toBe(t);
      });
    });

    it('rejeita tipo invalido', () => {
      expect(() => SearchTypeSchema.parse('invalid-type')).toThrow();
    });
  });

  describe('SearchSortSchema', () => {
    it('aceita relevance, recent, popular', () => {
      expect(SearchSortSchema.parse('relevance')).toBe('relevance');
      expect(SearchSortSchema.parse('recent')).toBe('recent');
      expect(SearchSortSchema.parse('popular')).toBe('popular');
    });

    it('rejeita sort invalido', () => {
      expect(() => SearchSortSchema.parse('oldest')).toThrow();
    });
  });

  describe('SearchQuerySchema', () => {
    it('parse query minima valida', () => {
      const result = SearchQuerySchema.parse({ q: 'cabala' });
      expect(result.q).toBe('cabala');
      expect(result.type).toBe('all'); // default
      expect(result.sort).toBe('relevance'); // default
      expect(result.limit).toBe(20); // default
    });

    it('rejeita q vazia', () => {
      expect(() => SearchQuerySchema.parse({ q: '' })).toThrow();
    });

    it('rejeita q > 200 chars', () => {
      const longQ = 'a'.repeat(201);
      expect(() => SearchQuerySchema.parse({ q: longQ })).toThrow();
    });

    it('coage limit string para number dentro do range', () => {
      const r1 = SearchQuerySchema.parse({ q: 'cristais', limit: '15' });
      expect(r1.limit).toBe(15);
      expect(typeof r1.limit).toBe('number');
    });

    it('rejeita limit > 50', () => {
      expect(() => SearchQuerySchema.parse({ q: 'x', limit: 100 })).toThrow();
    });

    it('rejeita limit < 1', () => {
      expect(() => SearchQuerySchema.parse({ q: 'x', limit: 0 })).toThrow();
    });

    it('aceita filtros opcionais tradition e tag', () => {
      const r = SearchQuerySchema.parse({
        q: 'umbanda',
        tradition: 'umbanda',
        tag: 'xango',
        cursor: 'eyJpZCI6InIxIn0=',
      });
      expect(r.tradition).toBe('umbanda');
      expect(r.tag).toBe('xango');
      expect(r.cursor).toBe('eyJpZCI6InIxIn0=');
    });

    it('coage strings de data para Date objects', () => {
      const r = SearchQuerySchema.parse({
        q: 'x',
        from: '2026-01-01T00:00:00Z',
        to: '2026-12-31T23:59:59Z',
      });
      expect(r.from).toBeInstanceOf(Date);
      expect(r.to).toBeInstanceOf(Date);
    });
  });

  describe('SuggestionQuerySchema', () => {
    it('parse query de sugestao valida', () => {
      const r = SuggestionQuerySchema.parse({ q: 'ca' });
      expect(r.q).toBe('ca');
      expect(r.limit).toBe(8);
    });

    it('rejeita q > 80 chars (limite de autocomplete)', () => {
      const longQ = 'a'.repeat(81);
      expect(() => SuggestionQuerySchema.parse({ q: longQ })).toThrow();
    });

    it('rejeita limit > 10', () => {
      expect(() => SuggestionQuerySchema.parse({ q: 'x', limit: 20 })).toThrow();
    });
  });

  describe('TagPageQuerySchema', () => {
    it('aceita query vazia com defaults', () => {
      const r = TagPageQuerySchema.parse({});
      expect(r.limit).toBe(20);
      expect(r.type).toBe('all');
    });

    it('aceita type=people', () => {
      const r = TagPageQuerySchema.parse({ type: 'people' });
      expect(r.type).toBe('people');
    });

    it('rejeita type fora do enum', () => {
      expect(() => TagPageQuerySchema.parse({ type: 'comments' })).toThrow();
    });
  });
});
