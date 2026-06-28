/**
 * Unit Tests — Community Search (Wave 26)
 *
 * Cobre funções puras de src/lib/community/search.ts:
 *   - encodeCursor (CursorData: score + id + type)
 *   - decodeCursor (com validação de tipos)
 *
 * As queries search() / suggestions() requerem Prisma + Postgres full-text
 * — cobertas pelos testes de integração (e2e/search.spec.ts).
 */

import { describe, it, expect } from 'vitest';

import { encodeCursor, decodeCursor } from '@/lib/community/search';

// =============================================================================
// encodeCursor (search-specific)
// =============================================================================

describe('encodeCursor (search)', () => {
  it('gera base64url de {score, id, type}', () => {
    const c = encodeCursor({ score: 0.95, id: 'post-1', type: 'post' });
    expect(typeof c).toBe('string');
    expect(c.length).toBeGreaterThan(0);
    // base64url não tem +, /, =
    expect(c).not.toMatch(/[+/=]/);
  });

  it('round-trip preserva score, id, type', () => {
    const original = { score: 0.8421, id: 'article-xyz', type: 'article' as const };
    const encoded = encodeCursor(original);
    const decoded = decodeCursor(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.score).toBe(original.score);
    expect(decoded!.id).toBe(original.id);
    expect(decoded!.type).toBe(original.type);
  });

  it('cursores diferentes para scores diferentes', () => {
    const a = encodeCursor({ score: 0.1, id: 'x', type: 'post' });
    const b = encodeCursor({ score: 0.9, id: 'x', type: 'post' });
    expect(a).not.toBe(b);
  });

  it('cursores diferentes para ids diferentes', () => {
    const a = encodeCursor({ score: 0.5, id: 'post-1', type: 'post' });
    const b = encodeCursor({ score: 0.5, id: 'post-2', type: 'post' });
    expect(a).not.toBe(b);
  });
});

// =============================================================================
// decodeCursor (search-specific)
// =============================================================================

describe('decodeCursor (search)', () => {
  it('retorna null para base64 inválido', () => {
    expect(decodeCursor('!!!invalid!!!')).toBeNull();
  });

  it('retorna null para base64 válido mas JSON quebrado', () => {
    const garbage = Buffer.from('not json at all').toString('base64url');
    expect(decodeCursor(garbage)).toBeNull();
  });

  it('retorna null se faltar campo score', () => {
    const missing = Buffer.from(JSON.stringify({ id: 'x', type: 'post' })).toString('base64url');
    expect(decodeCursor(missing)).toBeNull();
  });

  it('retorna null se faltar campo id', () => {
    const missing = Buffer.from(JSON.stringify({ score: 0.5, type: 'post' })).toString('base64url');
    expect(decodeCursor(missing)).toBeNull();
  });

  it('retorna null se faltar campo type', () => {
    const missing = Buffer.from(JSON.stringify({ score: 0.5, id: 'x' })).toString('base64url');
    expect(decodeCursor(missing)).toBeNull();
  });

  it('retorna null se score não for número', () => {
    const wrong = Buffer.from(JSON.stringify({ score: '0.5', id: 'x', type: 'post' })).toString('base64url');
    expect(decodeCursor(wrong)).toBeNull();
  });

  it('retorna null se id não for string', () => {
    const wrong = Buffer.from(JSON.stringify({ score: 0.5, id: 123, type: 'post' })).toString('base64url');
    expect(decodeCursor(wrong)).toBeNull();
  });

  it('aceita type como qualquer string (não enum-restrito)', () => {
    // O decoder não enum-checa — só verifica typeof string
    const c = encodeCursor({ score: 0.5, id: 'x', type: 'unknown-type' as never });
    const d = decodeCursor(c);
    expect(d?.type).toBe('unknown-type');
  });

  it('lida com score=0', () => {
    const c = encodeCursor({ score: 0, id: 'x', type: 'post' });
    const d = decodeCursor(c);
    expect(d?.score).toBe(0);
  });

  it('lida com score=1', () => {
    const c = encodeCursor({ score: 1, id: 'x', type: 'article' });
    const d = decodeCursor(c);
    expect(d?.score).toBe(1);
  });
});