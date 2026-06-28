/**
 * Visual Regression Helper — Wave 26 (Lina / Designer)
 *
 * Helpers compartilhados entre os 8 visual specs:
 *   - Theme switching (light/dark)
 *   - Viewport detection (desktop/tablet/mobile)
 *   - State forcing (loading/error/empty)
 *   - Auth mocking (visual specs não precisam de auth real)
 *
 * Por que este arquivo existe:
 *   - Reduz duplicação entre 8 specs × 6 screenshots = 48 baselines
 *   - Padroniza thresholds (maxDiffPixels: 100, threshold: 0.2)
 *   - Documenta o "contrato" visual do projeto
 */

import { type Page, type BrowserContext, expect } from '@playwright/test';

// ============================================
// VIEWPORTS — 3 baselines canônicos
// ============================================

export const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const;

export type ViewportName = keyof typeof VIEWPORTS;

// ============================================
// THEMES — light + dark
// ============================================

export type Theme = 'light' | 'dark';

export const THEMES: Record<Theme, 'light' | 'dark'> = {
  light: 'light',
  dark: 'dark',
};

// ============================================
// SCREENSHOT MODES
// ============================================

export type ScreenshotMode = 'default' | 'loading' | 'error' | 'empty';

/**
 * Screenshot options padrão para visual regression.
 * - fullPage: true para capturar toda a página (incluindo scroll)
 * - animations: disabled (já vem do config, mas garante)
 * - caret: hide (esconde cursor piscante em inputs)
 */
export const SCREENSHOT_OPTIONS = {
  fullPage: true,
  animations: 'disabled' as const,
  caret: 'hide' as const,
  maxDiffPixels: 100,
  threshold: 0.2,
};

// ============================================
// HELPER: Theme switching
// ============================================

/**
 * Aplica tema (light/dark) via atributo data-theme + classe .dark.
 *
 * O Akasha Portal usa:
 *   - Tailwind dark mode = 'class' (.dark no <html>)
 *   - next-themes opcionalmente (atributo data-theme)
 *
 * Estratégia robusta: ambos os mecanismos para garantir.
 */
export async function setTheme(page: Page, theme: Theme): Promise<void> {
  await page.evaluate((t: Theme) => {
    const html = document.documentElement;
    if (t === 'dark') {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    }
    // Persiste em localStorage pra próximo reload
    try {
      localStorage.setItem('theme', t);
    } catch {
      // localStorage pode falhar em contexto privado
    }
  }, theme);
}

// ============================================
// HELPER: Viewport detection
// ============================================

/**
 * Detecta qual viewport está ativo baseado no viewport size do Playwright.
 * Usado para nomear screenshots: feed-desktop-light vs feed-mobile-dark.
 */
export function getViewportName(page: Page): ViewportName {
  const { width } = page.viewportSize() ?? { width: 1280 };
  if (width >= 1024) return 'desktop';
  if (width >= 640) return 'tablet';
  return 'mobile';
}

// ============================================
// HELPER: Screenshot naming
// ============================================

/**
 * Gera nome padronizado: <page>-<viewport>-<theme>-<mode>.png
 * Ex: feed-desktop-light-default.png
 *
 * Mantém naming determinístico — visual diff só funciona com nomes estáveis.
 */
export function screenshotName(
  page: string,
  viewport: ViewportName,
  theme: Theme,
  mode: ScreenshotMode = 'default',
): string {
  return `${page}-${viewport}-${theme}-${mode}.png`;
}

// ============================================
// HELPER: Loading state forcing
// ============================================

/**
 * Força loading state atrasando a resposta de APIs principais.
 * Útil pra capturar spinners/skeletons durante data fetch.
 *
 * Estratégia: mock rotas comuns (/api/posts, /api/notifications, etc)
 * com delay de 30s pra que o loading state apareça no screenshot.
 */
export async function forceLoadingState(
  context: BrowserContext,
  paths: string[] = ['**/api/posts**', '**/api/notifications**', '**/api/feed**'],
): Promise<void> {
  for (const path of paths) {
    await context.route(path, async (route) => {
      // Delay 30s — suficiente pro loading renderizar + screenshot capturar
      await new Promise((resolve) => setTimeout(resolve, 30_000));
      await route.continue();
    });
  }
}

// ============================================
// HELPER: Error state forcing
// ============================================

/**
 * Força 500 em rotas específicas pra capturar error UI (error.tsx, error boundaries).
 *
 * Por padrão: força 500 em APIs de dados principais.
 * Custom paths: passar via parâmetro.
 */
export async function forceErrorState(
  context: BrowserContext,
  paths: string[] = ['**/api/posts**', '**/api/notifications**', '**/api/feed**', '**/api/library**'],
  status: number = 500,
): Promise<void> {
  for (const path of paths) {
    await context.route(path, async (route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal Server Error',
          code: 'FORCED_FOR_VISUAL_TEST',
        }),
      });
    });
  }
}

// ============================================
// HELPER: Empty state forcing
// ============================================

/**
 * Força empty state retornando array vazio das APIs.
 * Captura UI de "nenhum post / nenhuma notificação / nenhum grupo".
 */
export async function forceEmptyState(
  context: BrowserContext,
  paths: string[] = ['**/api/posts**', '**/api/notifications**', '**/api/feed**', '**/api/library**', '**/api/groups**'],
): Promise<void> {
  for (const path of paths) {
    await context.route(path, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
  }
}

// ============================================
// HELPER: Wait for visual stability
// ============================================

/**
 * Aguarda a página "estabilizar visualmente":
 * - networkidle: sem requests pendentes
 * - 500ms extra: garante fonts/images loaded
 * - sem animations: já bloqueado via context option
 *
 * Importante: visual diff é sensível a TTF/2ms de diferença.
 */
export async function waitForVisualStability(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle').catch(() => {
    // networkidle pode timeoutar em conexões SSE — ignora
  });
  await page.waitForTimeout(500);
}

// ============================================
// RE-EXPORT: expect com screenshot options
// ============================================

export { expect, type Page, type BrowserContext };
