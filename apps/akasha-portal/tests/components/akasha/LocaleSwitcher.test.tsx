/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocaleSwitcher } from '@/components/akasha/LocaleSwitcher';
import { locales } from '@/i18n/config';

// Mock next/navigation so we can inspect router.push calls without
// actually navigating.
const pushMock = vi.fn();
let mockPathname = '/pt-BR/conta';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => mockPathname,
}));

describe('LocaleSwitcher (Doc 25 §9, v0.0.4-T9.10)', () => {
  beforeEach(() => {
    document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    pushMock.mockClear();
  });

  it('renders a button with data-testid="locale-switcher"', () => {
    render(<LocaleSwitcher />);
    expect(screen.getByTestId('locale-switcher')).toBeDefined();
  });

  it('reads initial locale from NEXT_LOCALE cookie', async () => {
    document.cookie = 'NEXT_LOCALE=en; path=/';
    render(<LocaleSwitcher />);
    await waitFor(() => {
      expect(screen.getByTestId('locale-switcher').textContent).toBe('PT');
    });
  });

  it('falls back to default (pt-BR) when no cookie is set', async () => {
    render(<LocaleSwitcher />);
    await waitFor(() => {
      expect(screen.getByTestId('locale-switcher').textContent).toBe('EN');
    });
  });

  it('on click, swaps the cookie and navigates to the new locale preserving the path', async () => {
    mockPathname = '/pt-BR/conta';
    document.cookie = 'NEXT_LOCALE=pt-BR; path=/';
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByTestId('locale-switcher'));
    expect(pushMock).toHaveBeenCalledWith('/en/conta');
    expect(document.cookie).toMatch(/NEXT_LOCALE=en/);
  });

  it('navigates to /{newLocale} when the current path is just a locale', async () => {
    mockPathname = '/en';
    document.cookie = 'NEXT_LOCALE=en; path=/';
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByTestId('locale-switcher'));
    expect(pushMock).toHaveBeenCalledWith('/pt-BR');
  });

  it('strips the locale prefix when the path has nested segments', async () => {
    mockPathname = '/pt-BR/diario?foo=bar';
    document.cookie = 'NEXT_LOCALE=pt-BR; path=/';
    render(<LocaleSwitcher />);
    fireEvent.click(screen.getByTestId('locale-switcher'));
    expect(pushMock).toHaveBeenCalledWith('/en/diario?foo=bar');
  });

  it('supports both configured locales (pt-BR and en)', () => {
    expect(locales).toEqual(['pt-BR', 'en']);
  });
});
