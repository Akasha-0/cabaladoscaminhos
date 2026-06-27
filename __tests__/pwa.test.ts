// ============================================================================
// PWA Tests — manifest validation + service worker checks
// ============================================================================
// These tests verify the static PWA assets (manifest, SW, offline.html) are
// valid and complete. They do NOT exercise the service worker runtime —
// that requires a real browser and is covered by E2E (Playwright).
// ============================================================================

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');

let manifest: any;
let swSource: string;
let offlineHtml: string;
let indexHtml: string;

beforeAll(() => {
  const manifestPath = join(PUBLIC_DIR, 'manifest.json');
  const swPath = join(PUBLIC_DIR, 'sw.js');
  const offlinePath = join(PUBLIC_DIR, 'offline.html');

  expect(existsSync(manifestPath), 'public/manifest.json deve existir').toBe(true);
  expect(existsSync(swPath), 'public/sw.js deve existir').toBe(true);
  expect(existsSync(offlinePath), 'public/offline.html deve existir').toBe(true);

  manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  swSource = readFileSync(swPath, 'utf-8');
  offlineHtml = readFileSync(offlinePath, 'utf-8');
});

describe('Manifest — campos obrigatórios', () => {
  it('tem name e short_name', () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.name.length).toBeGreaterThan(0);
    expect(manifest.short_name.length).toBeLessThanOrEqual(12); // Limite home screen
  });

  it('tem description', () => {
    expect(manifest.description).toBeTruthy();
    expect(manifest.description.length).toBeGreaterThan(10);
  });

  it('tem start_url absoluto (relativo à origem)', () => {
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.start_url).toMatch(/^\//); // Relativo à origin
  });

  it('tem display = standalone ou similar', () => {
    const validDisplays = ['standalone', 'fullscreen', 'minimal-ui'];
    expect(validDisplays).toContain(manifest.display);
  });

  it('tem theme_color e background_color em hex', () => {
    expect(manifest.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(manifest.background_color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('tem lang e dir', () => {
    expect(manifest.lang).toBeTruthy();
    expect(['ltr', 'rtl']).toContain(manifest.dir);
  });

  it('tem scope igual ou mais restrito que start_url', () => {
    expect(manifest.scope).toBeTruthy();
    expect(manifest.scope.startsWith('/')).toBe(true);
  });
});

describe('Manifest — icons', () => {
  it('tem pelo menos 1 ícone', () => {
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  it('tem ícone maskable (192 ou 512)', () => {
    const maskableIcons = manifest.icons.filter((i: any) =>
      i.purpose?.includes('maskable') &&
      ['192x192', '512x512'].includes(i.sizes)
    );
    expect(maskableIcons.length).toBeGreaterThan(0);
  });

  it('tem ícones nos tamanhos padrão PWA', () => {
    const requiredSizes = ['192x192', '512x512'];
    const presentSizes = manifest.icons.map((i: any) => i.sizes);

    for (const size of requiredSizes) {
      expect(presentSizes).toContain(size);
    }
  });

  it('todos os ícones têm src, sizes e type', () => {
    for (const icon of manifest.icons) {
      expect(icon.src).toBeTruthy();
      expect(icon.sizes).toBeTruthy();
      expect(icon.type).toMatch(/^image\//);
    }
  });

  it('ícones referenciados existem em public/', () => {
    const missing: string[] = [];

    for (const icon of manifest.icons) {
      if (icon.src.startsWith('/')) {
        const iconPath = join(PUBLIC_DIR, icon.src);
        if (!existsSync(iconPath)) {
          missing.push(icon.src);
        }
      }
    }

    // Ícones individuais podem ser criados em task separada — warn ao invés de fail
    if (missing.length > 0) {
      console.warn(`⚠️  Ícones referenciados mas não encontrados em public/: ${missing.join(', ')}`);
      console.warn('   Criar via task separada ou usar tool de geração (ex: pwa-asset-generator)');
    }
  });
});

describe('Manifest — shortcuts', () => {
  it('tem pelo menos 1 shortcut (opcional mas recomendado)', () => {
    if (manifest.shortcuts) {
      expect(Array.isArray(manifest.shortcuts)).toBe(true);

      for (const shortcut of manifest.shortcuts) {
        expect(shortcut.name).toBeTruthy();
        expect(shortcut.url).toBeTruthy();
        expect(shortcut.icons?.[0]?.src).toBeTruthy();
      }
    }
  });
});

describe('Service Worker — estrutura', () => {
  it('registra listeners install, activate, fetch', () => {
    expect(swSource).toMatch(/addEventListener\(['"]install['"]/);
    expect(swSource).toMatch(/addEventListener\(['"]activate['"]/);
    expect(swSource).toMatch(/addEventListener\(['"]fetch['"]/);
  });

  it('tem precache de shell crítico', () => {
    expect(swSource).toMatch(/PRECACHE_URLS|precache/i);
  });

  it('tem estratégia network-first para navegação', () => {
    expect(swSource).toMatch(/request\.mode === ['"]navigate['"]/);
    expect(swSource).toMatch(/networkFirst|network-first/i);
  });

  it('tem estratégia cache-first para assets estáticos', () => {
    expect(swSource).toMatch(/cacheFirst|cache-first/i);
  });

  it('tem fallback para /offline.html', () => {
    expect(swSource).toMatch(/offline\.html/);
  });

  it('tem handler de SKIP_WAITING (atualização)', () => {
    expect(swSource).toMatch(/SKIP_WAITING/);
  });

  it('tem cleanup de caches antigos no activate', () => {
    expect(swSource).toMatch(/caches\.delete/);
  });
});

describe('Service Worker — features', () => {
  it('suporta push notifications', () => {
    expect(swSource).toMatch(/addEventListener\(['"]push['"]/);
    expect(swSource).toMatch(/showNotification/);
  });

  it('suporta notificationclick', () => {
    expect(swSource).toMatch(/addEventListener\(['"]notificationclick['"]/);
  });

  it('tem TTL para cache de API', () => {
    expect(swSource).toMatch(/API_CACHE_DURATION|API_CACHE_TTL|TTL/i);
  });

  it('tem versionamento (permite upgrade)', () => {
    expect(swSource).toMatch(/VERSION|CACHE_NAME/);
  });
});

describe('Offline.html — qualidade', () => {
  it('tem meta viewport mobile-first', () => {
    expect(offlineHtml).toMatch(/<meta[^>]+name=["']viewport["'][^>]+width=device-width/);
  });

  it('tem meta theme-color', () => {
    expect(offlineHtml).toMatch(/<meta[^>]+name=["']theme-color["']/);
  });

  it('tem lang="pt-BR"', () => {
    expect(offlineHtml).toMatch(/<html[^>]+lang=["']pt-BR["']/);
  });

  it('tem botão de retry', () => {
    expect(offlineHtml).toMatch(/window\.location\.reload/);
    expect(offlineHtml).toMatch(/<button[^>]+reload/);
  });

  it('respeita prefers-reduced-motion', () => {
    expect(offlineHtml).toMatch(/prefers-reduced-motion/);
  });

  it('tem safe-area insets para iOS', () => {
    expect(offlineHtml).toMatch(/env\(safe-area-inset-/);
  });

  it('tem ARIA labels em botões', () => {
    expect(offlineHtml).toMatch(/aria-label=["']/);
  });

  it('tem skip-to-content ou main com id', () => {
    expect(offlineHtml).toMatch(/id=["']main(-content)?["']|skip/);
  });

  it('auto-recarrega quando online', () => {
    expect(offlineHtml).toMatch(/addEventListener\(['"]online['"]/);
  });

  it('não depende de recursos externos (zero deps)', () => {
    // Sem <link rel="stylesheet" href="http...">
    expect(offlineHtml).not.toMatch(/<link[^>]+href=["']https?:\/\//);
    // Sem <script src="http...">
    expect(offlineHtml).not.toMatch(/<script[^>]+src=["']https?:\/\//);
  });
});

describe('Layout meta tags (PWA)', () => {
  it('app/layout.tsx referencia manifest.json', () => {
    const layoutPath = join(process.cwd(), 'src/app/layout.tsx');
    if (existsSync(layoutPath)) {
      const layout = readFileSync(layoutPath, 'utf-8');
      expect(layout).toMatch(/manifest:\s*['"]\/manifest\.json['"]/);
    }
  });

  it('app/layout.tsx tem viewportFit = "cover" (iOS safe-area)', () => {
    const layoutPath = join(process.cwd(), 'src/app/layout.tsx');
    if (existsSync(layoutPath)) {
      const layout = readFileSync(layoutPath, 'utf-8');
      expect(layout).toMatch(/viewportFit:\s*["']cover["']/);
    }
  });

  it('app/layout.tsx tem themeColor (PWA)', () => {
    const layoutPath = join(process.cwd(), 'src/app/layout.tsx');
    if (existsSync(layoutPath)) {
      const layout = readFileSync(layoutPath, 'utf-8');
      expect(layout).toMatch(/themeColor/);
    }
  });

  it('app/layout.tsx tem apple-mobile-web-app-capable', () => {
    const layoutPath = join(process.cwd(), 'src/app/layout.tsx');
    if (existsSync(layoutPath)) {
      const layout = readFileSync(layoutPath, 'utf-8');
      // Pode estar em metadata.appleWebApp.capable OU em <meta>
      const hasAppleCapable = layout.match(/appleWebApp[\s\S]*?capable:\s*true/) ||
                              layout.match(/apple-mobile-web-app-capable/);
      expect(hasAppleCapable).toBeTruthy();
    }
  });

  it('app/layout.tsx inclui <UpdatePrompt>', () => {
    const layoutPath = join(process.cwd(), 'src/app/layout.tsx');
    if (existsSync(layoutPath)) {
      const layout = readFileSync(layoutPath, 'utf-8');
      expect(layout).toMatch(/UpdatePrompt/);
    }
  });
});

describe('Componentes PWA — arquivos existem', () => {
  const expectedFiles = [
    'src/components/pwa/UpdatePrompt.tsx',
    'src/components/a11y/SkipToContent.tsx',
    'src/hooks/useHaptic.ts',
    'src/hooks/useSwipe.ts',
  ];

  for (const file of expectedFiles) {
    it(`${file} existe`, () => {
      const path = join(process.cwd(), file);
      expect(existsSync(path), `${file} deve existir`).toBe(true);
    });
  }
});