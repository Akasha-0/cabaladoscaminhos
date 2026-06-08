/**
 * generate-pwa-icons.mjs
 *
 * Gera os ícones PWA do Sistema Akasha a partir de um SVG vetorial.
 * Saídas em apps/akasha-portal/public/icons/:
 *   - icon-192.png
 *   - icon-512.png
 *   - icon-maskable-512.png  (com safe-zone 20% para crop circular)
 *   - apple-touch-icon-180.png
 *
 * Execução (raiz do monorepo):
 *   node apps/akasha-portal/scripts/generate-pwa-icons.mjs
 *
 * Requer `sharp` (já presente em apps/akasha-portal/node_modules).
 */

import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

// `sharp` é dep transitiva de `next` e `@vercel/og` no monorepo pnpm.
// Usamos createRequire apontando para a node_modules do Next para resolvê-lo
// sem precisar adicioná-lo como dep direta.
const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../..');
const nextPkgPath = resolve(
  repoRoot,
  'node_modules/.pnpm/next@16.2.6_@babel+core@7.29.7_@playwright+test@1.60.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next'
);
const requireFromNext = createRequire(pathToFileURL(nextPkgPath + '/package.json').href);
const sharp = requireFromNext('sharp');

const OUT_DIR = resolve(__dirname, '../public/icons');
mkdirSync(OUT_DIR, { recursive: true });

// Identidade Akasha cósmica — Doc 26 §3
const BG = '#06070F';
const VIOLET = '#7C5CFF';
const CYAN = '#2DD4BF';
const GOLD = '#F0B429';

// SVG base: vazio cósmico + Toroide minimal (4 pétalas + anel concêntrico)
// viewBox 0 0 512 512 — centro em (256,256)
function buildSvg({ maskable = false } = {}) {
  // Para maskable: encolhe o desenho para 80% central (safe-zone 20%)
  const scale = maskable ? 0.6 : 1;
  const cx = 256;
  const cy = 256;
  const r1 = 200 * scale;
  const r2 = 150 * scale;
  const r3 = 95 * scale;
  const petalLen = 188 * scale;
  const petalW = 38 * scale;
  const centerDot = 18 * scale;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="g1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#141A33" />
      <stop offset="65%" stop-color="${BG}" />
      <stop offset="100%" stop-color="${BG}" />
    </radialGradient>
    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${VIOLET}" />
      <stop offset="100%" stop-color="${CYAN}" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="${BG}" />
  <rect width="512" height="512" fill="url(#g1)" />
  <g transform="translate(${cx} ${cy})">
    <!-- Anel externo violeta -->
    <circle r="${r1}" fill="none" stroke="${VIOLET}" stroke-opacity="0.55" stroke-width="${4 * scale}" />
    <!-- Anel médio ciano -->
    <circle r="${r2}" fill="none" stroke="${CYAN}" stroke-opacity="0.5" stroke-width="${2 * scale}" />
    <!-- Anel interno dourado (Ori) -->
    <circle r="${r3}" fill="none" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="${1.5 * scale}" />
    <!-- 4 pétalas (toroide) — pontas cardeais -->
    <g fill="url(#g2)" opacity="0.92">
      <ellipse cx="0" cy="${-petalLen / 2}" rx="${petalW / 2}" ry="${petalLen / 2}" />
      <ellipse cx="0" cy="${petalLen / 2}" rx="${petalW / 2}" ry="${petalLen / 2}" />
      <ellipse cx="${-petalLen / 2}" cy="0" rx="${petalLen / 2}" ry="${petalW / 2}" />
      <ellipse cx="${petalLen / 2}" cy="0" rx="${petalLen / 2}" ry="${petalW / 2}" />
    </g>
    <!-- 4 pétalas nas diagonais (mais sutis) -->
    <g fill="${VIOLET}" opacity="0.55">
      <ellipse cx="0" cy="${-petalLen / 2}" transform="rotate(45)" rx="${petalW / 3}" ry="${petalLen / 2.4}" />
      <ellipse cx="0" cy="${petalLen / 2}" transform="rotate(45)" rx="${petalW / 3}" ry="${petalLen / 2.4}" />
      <ellipse cx="${-petalLen / 2}" cy="0" transform="rotate(45)" rx="${petalLen / 2.4}" ry="${petalW / 3}" />
      <ellipse cx="${petalLen / 2}" cy="0" transform="rotate(45)" rx="${petalLen / 2.4}" ry="${petalW / 3}" />
    </g>
    <!-- Núcleo dourado — centelha Ori -->
    <circle r="${centerDot}" fill="${GOLD}" />
    <circle r="${centerDot * 1.8}" fill="none" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="${1.2 * scale}" />
  </g>
</svg>`;
}

const svgStandard = Buffer.from(buildSvg({ maskable: false }));
const svgMaskable = Buffer.from(buildSvg({ maskable: true }));

const targets = [
  { file: 'icon-192.png', size: 192, svg: svgStandard },
  { file: 'icon-512.png', size: 512, svg: svgStandard },
  { file: 'icon-maskable-512.png', size: 512, svg: svgMaskable },
  { file: 'apple-touch-icon-180.png', size: 180, svg: svgStandard },
];

for (const t of targets) {
  const out = resolve(OUT_DIR, t.file);
  await sharp(t.svg).resize(t.size, t.size).png().toFile(out);
  console.log(`✓ ${t.file} (${t.size}px)`);
}
