import { describe, it, expect } from 'vitest';

import { shouldRefreshAuth } from './middleware-utils';

describe('middleware shouldRefreshAuth', () => {
  it('returns false for public routes', () => {
    expect(shouldRefreshAuth('/')).toBe(false);
    expect(shouldRefreshAuth('/login')).toBe(false);
    expect(shouldRefreshAuth('/pt-BR/login')).toBe(false);
  });

  it('returns true for protected path prefixes', () => {
    expect(shouldRefreshAuth('/dashboard')).toBe(true);
    expect(shouldRefreshAuth('/conta')).toBe(true);
    expect(shouldRefreshAuth('/diario')).toBe(true);
    expect(shouldRefreshAuth('/mandala')).toBe(true);
    expect(shouldRefreshAuth('/oraculo')).toBe(true);
    expect(shouldRefreshAuth('/conexoes')).toBe(true);
    expect(shouldRefreshAuth('/mapa')).toBe(true);
    expect(shouldRefreshAuth('/manifesto')).toBe(true);
    expect(shouldRefreshAuth('/meu-dia')).toBe(true);
    expect(shouldRefreshAuth('/significado-primeiro')).toBe(true);
  });

  it('returns true for /akasha in path', () => {
    expect(shouldRefreshAuth('/akasha/some-path')).toBe(true);
    expect(shouldRefreshAuth('/en/akasha/mapa')).toBe(true);
  });

  it('strips locale prefix before checking protected paths', () => {
    expect(shouldRefreshAuth('/pt-BR/dashboard')).toBe(true);
    expect(shouldRefreshAuth('/en/conta')).toBe(true);
    expect(shouldRefreshAuth('/pt-BR/mapa')).toBe(true);
  });

  it('handles nested paths under protected prefixes', () => {
    expect(shouldRefreshAuth('/diario/foco/today')).toBe(true);
    expect(shouldRefreshAuth('/mapa/significado/details')).toBe(true);
  });

  it('handles edge cases like double slashes and trailing slashes', () => {
    expect(shouldRefreshAuth('/dashboard//')).toBe(true);
    expect(shouldRefreshAuth('//dashboard')).toBe(true);
    expect(shouldRefreshAuth('/akasha/')).toBe(true);
  });

  it('handles empty pathname', () => {
    expect(shouldRefreshAuth('')).toBe(false);
  });
});
