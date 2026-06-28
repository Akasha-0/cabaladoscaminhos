/**
 * Unit Tests — i18n (Wave 26)
 *
 * Cobre:
 *   - src/lib/i18n/pt-BR.ts      (Translations type, chaves esperadas)
 *   - src/lib/i18n/locales/*.ts  (paridade entre pt-BR, en, es)
 *   - src/lib/i18n/index.ts      (availableLocales, Locale type, fallback logic)
 *
 * Os hooks React (useI18n, useT) não são testáveis aqui — cobertos em
 * tests/hooks/useI18n*.test.ts. Aqui focamos em constantes e invariantes
 * dos catálogos de tradução.
 */

import { describe, it, expect } from 'vitest';

import { ptBR as ptBRDirect } from '@/lib/i18n/pt-BR';
import { ptBR as ptBRLocale } from '@/lib/i18n/locales/pt-BR';
import { en } from '@/lib/i18n/locales/en';
import { es } from '@/lib/i18n/locales/es';
import { availableLocales, type Locale } from '@/lib/i18n';

// =============================================================================
// Catalog paridade (pt-BR === en === es em estrutura)
// =============================================================================

function flattenKeys(obj: unknown, prefix = ''): string[] {
  const out: string[] = [];
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object') {
        out.push(...flattenKeys(v, path));
      } else {
        out.push(path);
      }
    }
  }
  return out;
}

describe('i18n catalogs — paridade estrutural', () => {
  it('pt-BR (legacy file) === pt-BR (locales file)', () => {
    const a = flattenKeys(ptBRDirect).sort();
    const b = flattenKeys(ptBRLocale).sort();
    expect(a).toEqual(b);
  });

  it('en tem as mesmas chaves top-level que pt-BR', () => {
    const ptKeys = flattenKeys(ptBRLocale);
    const enKeys = flattenKeys(en);
    expect(enKeys.sort()).toEqual(ptKeys.sort());
  });

  it('es tem as mesmas chaves top-level que pt-BR', () => {
    const ptKeys = flattenKeys(ptBRLocale);
    const esKeys = flattenKeys(es);
    expect(esKeys.sort()).toEqual(ptKeys.sort());
  });

  it('en e es têm a mesma quantidade de chaves', () => {
    expect(flattenKeys(en).length).toBe(flattenKeys(es).length);
  });
});

// =============================================================================
// Conteúdo essencial por idioma
// =============================================================================

describe('i18n — conteúdo essencial', () => {
  it('pt-BR: tem nav.home e nav.searchPlaceholder', () => {
    // @ts-expect-error — runtime check
    expect(ptBRLocale.nav?.home).toBeTruthy();
    // @ts-expect-error — runtime check
    expect(ptBRLocale.nav?.searchPlaceholder).toBeTruthy();
  });

  it('pt-BR: tem common.buttons.submit', () => {
    // @ts-expect-error — runtime check
    expect(ptBRLocale.common?.buttons?.submit).toBe('Enviar');
  });

  it('en: nav.home em inglês', () => {
    // @ts-expect-error — runtime check
    const home = en.nav?.home as string;
    expect(home).toBeTruthy();
    expect(home.toLowerCase()).not.toBe('feed'); // não é tradução literal do pt
  });

  it('es: usa español neutro (não "vosotros")', () => {
    const allText = JSON.stringify(es).toLowerCase();
    expect(allText).not.toContain('vosotros');
  });

  it('en: mantém termos culturais preservados (Akasha, Candomblé, etc)', () => {
    const allText = JSON.stringify(en);
    expect(allText).toContain('Akasha');
  });
});

// =============================================================================
// availableLocales
// =============================================================================

describe('availableLocales', () => {
  it('contém pt-BR, en, es', () => {
    expect(availableLocales).toContain('pt-BR');
    expect(availableLocales).toContain('en');
    expect(availableLocales).toContain('es');
  });

  it('tem exatamente 3 locales', () => {
    expect(availableLocales.length).toBe(3);
  });

  it('Locale type inclui os 3 locales', () => {
    const locales: Locale[] = ['pt-BR', 'en', 'es'];
    expect(locales).toEqual(availableLocales);
  });
});

// =============================================================================
// Validação de strings não-vazias
// =============================================================================

describe('Validação de traduções (não-vazias)', () => {
  it('pt-BR: nenhuma string é vazia', () => {
    const allText = JSON.stringify(ptBRLocale);
    // Procura por ": \"\"" (string vazia como valor)
    const emptyValues = allText.match(/:\s*""/g);
    expect(emptyValues).toBeNull();
  });

  it('en: nenhuma string é vazia', () => {
    const allText = JSON.stringify(en);
    const emptyValues = allText.match(/:\s*""/g);
    expect(emptyValues).toBeNull();
  });

  it('es: nenhuma string é vazia', () => {
    const allText = JSON.stringify(es);
    const emptyValues = allText.match(/:\s*""/g);
    expect(emptyValues).toBeNull();
  });
});

// =============================================================================
// pt-BR legacy (src/lib/i18n/pt-BR.ts) — snapshot
// =============================================================================

describe('ptBR legacy export', () => {
  it('exporta objeto com chaves esperadas', () => {
    expect(ptBRDirect).toBeDefined();
    expect(typeof ptBRDirect).toBe('object');
    // @ts-expect-error — runtime
    expect(ptBRDirect.common).toBeDefined();
  });

  it('legado tem botões de auth esperados', () => {
    // @ts-expect-error — runtime
    expect(ptBRDirect.common?.buttons?.login).toBe('Entrar');
    // @ts-expect-error — runtime
    expect(ptBRDirect.common?.buttons?.register).toBe('Cadastrar');
  });
});