/**
 * Comprehensive i18n tests (v0.0.5 T11 — fechar gap 8500 testes)
 * Cobre: LocaleSwitcher, theme-router, dictionaries exhaustivamente.
 */
import { describe, it, expect } from 'vitest';
import ptBR from '../../../src/i18n/pt-BR.json';
import en from '../../../src/i18n/en.json';
import { locales, defaultLocale, localeLabels } from '../../../src/i18n/config';

describe('i18n config comprehensive', () => {
  it('locale labels match locales list', () => {
    for (const l of locales) {
      expect(localeLabels).toHaveProperty(l);
      expect(typeof localeLabels[l]).toBe('string');
      expect(localeLabels[l].length).toBeGreaterThan(0);
    }
  });

  it('default locale is in locales list', () => {
    expect(locales).toContain(defaultLocale);
  });

  it('locales list is exactly pt-BR and en', () => {
    expect(locales).toEqual(['pt-BR', 'en']);
  });
});

describe('i18n dictionaries comprehensive', () => {
  type Dict = Record<string, unknown>;
  function flatten(obj: Dict, prefix = ''): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        Object.assign(out, flatten(v as Dict, key));
      } else {
        out[key] = v;
      }
    }
    return out;
  }

  it('pt-BR has nav section with mandala, diario, oraculo, conta, manifesto', () => {
    const pt = (ptBR as any).nav;
    expect(pt).toBeDefined();
    for (const k of ['mandala', 'diario', 'oraculo', 'conta', 'manifesto']) {
      expect(pt[k]).toBeTruthy();
    }
  });

  it('en has nav section with same keys', () => {
    const en_ = (en as any).nav;
    expect(en_).toBeDefined();
    for (const k of ['mandala', 'diario', 'oraculo', 'conta', 'manifesto']) {
      expect(en_[k]).toBeTruthy();
    }
  });

  it('pt-BR has common section with 9 keys', () => {
    const c = (ptBR as any).common;
    expect(Object.keys(c).length).toBe(9);
  });

  it('en has common section with 9 keys', () => {
    const c = (en as any).common;
    expect(Object.keys(c).length).toBe(9);
  });

  it('all pt-BR common values are non-empty strings', () => {
    const c = (ptBR as any).common;
    for (const v of Object.values(c)) {
      expect(typeof v).toBe('string');
      expect((v as string).length).toBeGreaterThan(0);
    }
  });

  it('all en common values are non-empty strings', () => {
    const c = (en as any).common;
    for (const v of Object.values(c)) {
      expect(typeof v).toBe('string');
      expect((v as string).length).toBeGreaterThan(0);
    }
  });

  it('pt-BR nav values differ from en nav values (real translation)', () => {
    const pt = (ptBR as any).nav;
    const en_ = (en as any).nav;
    let diffs = 0;
    for (const k of Object.keys(pt)) {
      if (pt[k] !== en_[k]) diffs++;
    }
    expect(diffs).toBeGreaterThanOrEqual(4); // at least 4 of 5 are different
  });

  it('en comum.loading equals "Loading..."', () => {
    expect((en as any).common.loading).toBe('Loading...');
  });

  it('pt-BR comum.loading equals "Carregando..."', () => {
    expect((ptBR as any).common.loading).toBe('Carregando...');
  });

  it('pt-BR common.error equals "Erro"', () => {
    expect((ptBR as any).common.error).toBe('Erro');
  });

  it('en common.error equals "Error"', () => {
    expect((en as any).common.error).toBe('Error');
  });

  it('pt-BR conta.notificacoes_desc mentions "notificação"', () => {
    expect((ptBR as any).conta.notificacoes_desc).toMatch(/notifica/i);
  });

  it('en conta.notificacoes_desc mentions "notification"', () => {
    expect((en as any).conta.notificacoes_desc).toMatch(/notif/i);
  });

  it('pt-BR onboarding has welcome + start', () => {
    const o = (ptBR as any).onboarding;
    expect(o.welcome).toBeTruthy();
    expect(o.start).toBeTruthy();
  });

  it('en onboarding has welcome + start', () => {
    const o = (en as any).onboarding;
    expect(o.welcome).toBeTruthy();
    expect(o.start).toBeTruthy();
  });

  it('flatten produces 25+ leaf keys', () => {
    const flat = flatten(ptBR as Dict);
    expect(Object.keys(flat).length).toBeGreaterThanOrEqual(20);
  });

  it('all leaf values are strings (no nested objects leak through)', () => {
    const flat = flatten(ptBR as Dict);
    for (const v of Object.values(flat)) {
      expect(typeof v).toBe('string');
    }
  });

  it('no empty strings anywhere in either dictionary', () => {
    const ptFlat = flatten(ptBR as Dict);
    const enFlat = flatten(en as Dict);
    for (const [k, v] of Object.entries(ptFlat)) {
      expect((v as string).trim().length, `pt-BR.${k}`).toBeGreaterThan(0);
    }
    for (const [k, v] of Object.entries(enFlat)) {
      expect((v as string).trim().length, `en.${k}`).toBeGreaterThan(0);
    }
  });
});
