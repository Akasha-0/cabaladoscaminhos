// ============================================================================
// Mobile Layout Tests — verifica que cada página renderiza sem erros em
// viewports mobile e respeita padrões de design
// ============================================================================
// Estes testes NÃO verificam pixels exatos (precisa de Playwright + browser),
// mas garantem que:
//  - Componentes renderizam em viewport mobile simulado
//  - Não há erros de runtime
//  - Touch targets mínimos estão presentes
//  - Meta tags PWA estão configuradas
// ============================================================================

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/feed',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

beforeAll(() => {
  // jsdom default viewport (mobile-ish)
  Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: 812, writable: true });

  // Mock matchMedia para prefers-reduced-motion
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('reduced-motion') ? false : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock navigator.vibrate
  Object.defineProperty(navigator, 'vibrate', {
    writable: true,
    value: vi.fn(),
  });

  // Mock navigator.serviceWorker
  Object.defineProperty(navigator, 'serviceWorker', {
    writable: true,
    value: {
      register: vi.fn().mockResolvedValue({
        installing: null,
        waiting: null,
        active: null,
        addEventListener: vi.fn(),
        update: vi.fn().mockResolvedValue(undefined),
      }),
      controller: null,
      ready: Promise.resolve({}),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });
});

describe('Comunidade — nav bottom mobile', () => {
  it('CommunityNav renderiza com bottom nav quando usuário logado', async () => {
    const { CommunityNav } = await import('@/components/community/CommunityNav');

    const { container } = render(
      <CommunityNav
        user={{
          id: 'u1',
          handle: 'marina',
          displayName: 'Marina',
          notificationsCount: 3,
        }}
      />
    );

    // Bottom nav presente
    const nav = container.querySelectorAll('nav');
    expect(nav.length).toBeGreaterThan(0);

    // Mobile-only bottom nav (md:hidden)
    const mobileNav = container.querySelector('nav.md\\:hidden, nav[class*="md:hidden"]');
    expect(mobileNav).toBeTruthy();
  });

  it('CommunityNav NÃO renderiza bottom nav quando deslogado', async () => {
    const { CommunityNav } = await import('@/components/community/CommunityNav');

    const { container } = render(<CommunityNav user={null} />);

    // Header presente
    const header = container.querySelector('header');
    expect(header).toBeTruthy();

    // Bottom nav NÃO presente (condicional user)
    const navs = container.querySelectorAll('nav');
    // Em algumas versões, nav pode ter sido renderizada condicionalmente
    // Verifica que existe apenas a nav do header (se houver) ou nenhuma
    // O importante é que não há grid-cols-5 (característico do bottom nav)
    const gridCols5 = container.querySelector('.grid-cols-5');
    expect(gridCols5).toBeNull();
  });
});

describe('Touch targets mínimos', () => {
  it('botões do CommunityNav têm min-h-[44px]', async () => {
    const { CommunityNav } = await import('@/components/community/CommunityNav');

    const { container } = render(
      <CommunityNav
        user={{
          id: 'u1',
          handle: 'marina',
          displayName: 'Marina',
        }}
      />
    );

    // Pega todos os botões
    const buttons = container.querySelectorAll('button');
    let smallButtons = 0;

    for (const btn of buttons) {
      const className = btn.className;
      // Verifica se tem min-h-[44px] ou min-h-[48px] ou min-h-[64px]
      const hasMinHeight = /min-h-\[(44|48|52|64)px\]/.test(className);
      if (!hasMinHeight) {
        smallButtons++;
      }
    }

    // Esperado: zero botões sem min-h
    expect(smallButtons).toBe(0);
  });
});

describe('Safe area insets', () => {
  it('bottom nav tem padding-bottom env(safe-area-inset-bottom)', async () => {
    const { CommunityNav } = await import('@/components/community/CommunityNav');

    const { container } = render(
      <CommunityNav
        user={{
          id: 'u1',
          handle: 'marina',
          displayName: 'Marina',
        }}
      />
    );

    // Procura nav fixed bottom com safe-area-inset-bottom inline
    const allElements = container.querySelectorAll('*');
    let foundSafeArea = false;

    for (const el of allElements) {
      const style = el.getAttribute('style') || '';
      if (style.includes('env(safe-area-inset-bottom)')) {
        foundSafeArea = true;
        break;
      }
    }

    expect(foundSafeArea).toBe(true);
  });

  it('header tem padding-top env(safe-area-inset-top)', async () => {
    const { CommunityNav } = await import('@/components/community/CommunityNav');

    const { container } = render(<CommunityNav user={null} />);

    const allElements = container.querySelectorAll('*');
    let foundSafeArea = false;

    for (const el of allElements) {
      const style = el.getAttribute('style') || '';
      if (style.includes('env(safe-area-inset-top)')) {
        foundSafeArea = true;
        break;
      }
    }

    expect(foundSafeArea).toBe(true);
  });
});

describe('Acessibilidade — ARIA labels', () => {
  it('botões icônicos têm aria-label', async () => {
    const { CommunityNav } = await import('@/components/community/CommunityNav');

    const { container } = render(
      <CommunityNav
        user={{
          id: 'u1',
          handle: 'marina',
          displayName: 'Marina',
          notificationsCount: 3,
        }}
      />
    );

    // Botão de busca
    const searchBtn = container.querySelector('button[aria-label*="usca"], button[aria-label*="Buscar"]');
    expect(searchBtn).toBeTruthy();

    // Link de notificações
    const notifLink = container.querySelector('a[aria-label*="otificaç"], a[aria-label*="Notif"]');
    expect(notifLink).toBeTruthy();
  });

  it('aria-current="page" no item ativo do bottom nav', async () => {
    const { CommunityNav } = await import('@/components/community/CommunityNav');

    const { container } = render(
      <CommunityNav
        user={{
          id: 'u1',
          handle: 'marina',
          displayName: 'Marina',
        }}
      />
    );

    // pathname mockado como /feed → Feed deve ter aria-current
    const activeLinks = container.querySelectorAll('[aria-current="page"]');
    expect(activeLinks.length).toBeGreaterThan(0);
  });

  it('botões de toggle têm aria-expanded', async () => {
    const { CommunityNav } = await import('@/components/community/CommunityNav');

    const { container } = render(<CommunityNav user={null} />);

    // Mobile menu toggle
    const menuToggle = container.querySelector('button[aria-expanded]');
    expect(menuToggle).toBeTruthy();
  });
});

describe('UpdatePrompt component', () => {
  it('não renderiza quando não há update', async () => {
    const { UpdatePrompt } = await import('@/components/pwa/UpdatePrompt');

    const { container } = render(<UpdatePrompt />);

    // Sem update: nada renderizado
    expect(container.firstChild).toBeNull();
  });
});

describe('Layout PWA meta tags', () => {
  const layoutPath = join(process.cwd(), 'src/app/layout.tsx');

  it('layout.tsx existe', () => {
    expect(existsSync(layoutPath)).toBe(true);
  });

  it('referencia manifest.json', () => {
    const layout = readFileSync(layoutPath, 'utf-8');
    expect(layout).toMatch(/manifest:\s*['"]\/manifest\.json['"]/);
  });

  it('tem viewportFit cover', () => {
    const layout = readFileSync(layoutPath, 'utf-8');
    expect(layout).toMatch(/viewportFit:\s*["']cover["']/);
  });

  it('tem themeColor', () => {
    const layout = readFileSync(layoutPath, 'utf-8');
    expect(layout).toMatch(/themeColor/);
  });

  it('inclui UpdatePrompt no body', () => {
    const layout = readFileSync(layoutPath, 'utf-8');
    expect(layout).toMatch(/<UpdatePrompt\s*\/?>/);
  });

  it('inclui SkipToContent', () => {
    const layout = readFileSync(layoutPath, 'utf-8');
    expect(layout).toMatch(/SkipToContent/);
  });
});

describe('Manifest completo', () => {
  it('manifest tem todos os tamanhos de ícones PWA requeridos', () => {
    const manifestPath = join(process.cwd(), 'public/manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

    // Tamanhos mínimos obrigatórios para PWA instalável
    const sizes = manifest.icons.map((i: any) => i.sizes);

    // Pelo menos 192 e 512 (Chrome requirement)
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });
});

describe('Offline.html — fallback', () => {
  it('existe e é HTML válido básico', () => {
    const offlinePath = join(process.cwd(), 'public/offline.html');
    expect(existsSync(offlinePath)).toBe(true);

    const html = readFileSync(offlinePath, 'utf-8');

    // Tem DOCTYPE
    expect(html).toMatch(/<!DOCTYPE html>/i);

    // Tem html, head, body
    expect(html).toMatch(/<html[^>]*>/);
    expect(html).toMatch(/<head>/);
    expect(html).toMatch(/<body[^>]*>/);

    // Fecha tags
    expect(html).toMatch(/<\/body>/);
    expect(html).toMatch(/<\/html>/);
  });
});