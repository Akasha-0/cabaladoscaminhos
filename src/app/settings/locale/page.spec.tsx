/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-C — /settings/locale PAGE SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Vitest test for the page. Since this is a 'use client' component, we use
 * React Testing Library to render and assert.
 *
 * Covers:
 *   - Page renders without throwing
 *   - LocaleSwitcher is present (testid + role=radiogroup)
 *   - 3 preview cards render (one per locale)
 *   - All 3 locale native names appear in the DOM
 *   - Sacred terms appear in preview cards
 *
 * Run: npx vitest run src/app/settings/locale
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import LocaleSettingsPage from './page';

describe('/settings/locale page (W86-C)', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders without throwing', () => {
    render(<LocaleSettingsPage />);
  });

  it('renders the LocaleSwitcher (data-testid)', () => {
    render(<LocaleSettingsPage />);
    expect(screen.getByTestId('locale-switcher')).toBeTruthy();
  });

  it('renders a radiogroup with role="radiogroup"', () => {
    render(<LocaleSettingsPage />);
    const radios = screen.getAllByRole('radiogroup');
    expect(radios.length).toBeGreaterThanOrEqual(1);
  });

  it('renders 3 radio options (one per locale)', () => {
    render(<LocaleSettingsPage />);
    const radioInputs = screen.getAllByRole('radio');
    expect(radioInputs.length).toBe(3);
  });

  it('renders 3 preview cards (one per locale)', () => {
    render(<LocaleSettingsPage />);
    expect(screen.getByTestId('preview-card-pt-BR')).toBeTruthy();
    expect(screen.getByTestId('preview-card-en')).toBeTruthy();
    expect(screen.getByTestId('preview-card-es')).toBeTruthy();
  });

  it('preview grid has data-testid="preview-grid"', () => {
    render(<LocaleSettingsPage />);
    expect(screen.getByTestId('preview-grid')).toBeTruthy();
  });

  it('all 3 locale native names appear in the DOM', () => {
    render(<LocaleSettingsPage />);
    // PT-BR (current locale) is the default; the switcher + preview cards
    // always show all 3 locales regardless of active.
    expect(screen.getAllByText(/English/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Espa\u00f1ol/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Portugu\u00eas/).length).toBeGreaterThanOrEqual(1);
  });

  it('default locale is pt-BR (first radio is checked)', () => {
    render(<LocaleSettingsPage />);
    const checked = screen.getAllByRole('radio', { checked: true });
    expect(checked.length).toBe(1);
    expect(checked[0]?.getAttribute('data-locale')).toBe('pt-BR');
  });

  it('sacred term "Caboclo" appears in DOM (verbatim across locales)', () => {
    render(<LocaleSettingsPage />);
    const cabocloNodes = screen.getAllByText(/Caboclo/);
    // 1 occurrence in the preview card for each of the 3 cards
    expect(cabocloNodes.length).toBeGreaterThanOrEqual(3);
  });

  it('sacred term "Orix\u00e1" appears in DOM', () => {
    render(<LocaleSettingsPage />);
    expect(screen.getAllByText(/Orix\u00e1/).length).toBeGreaterThanOrEqual(3);
  });

  it('sacred term "Tar\u00f4" appears in DOM', () => {
    render(<LocaleSettingsPage />);
    expect(screen.getAllByText(/Tar\u00f4/).length).toBeGreaterThanOrEqual(3);
  });

  it('page has main landmark', () => {
    render(<LocaleSettingsPage />);
    expect(screen.getByRole('main')).toBeTruthy();
  });

  it('page has h1 with the locale title', () => {
    render(<LocaleSettingsPage />);
    const h1 = screen.getAllByRole('heading', { level: 1 });
    expect(h1.length).toBeGreaterThanOrEqual(1);
    expect(h1[0]?.textContent).toMatch(/Idioma|Language/);
  });

  it('locale switcher radios have aria-checked attribute', () => {
    render(<LocaleSettingsPage />);
    const radios = screen.getAllByRole('radio');
    for (const r of radios) {
      expect(r.hasAttribute('aria-checked')).toBe(true);
    }
  });

  it('locale switcher wrapper has aria-label', () => {
    render(<LocaleSettingsPage />);
    const wrapper = screen.getByTestId('locale-switcher');
    expect(wrapper.getAttribute('aria-label')).toBe('Selecionar idioma');
  });
});
