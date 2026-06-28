#!/usr/bin/env node
/**
 * generate-splash-screens.mjs — gera splash PNGs a partir do SVG template.
 * ----------------------------------------------------------------------------
 * Wave 24. Requer `sharp` (já vem em next/sharp como dep).
 *
 * Uso:
 *   node scripts/generate-splash-screens.mjs
 *
 * Output:
 *   public/icons/splash-{640x1136,750x1334,...}.png
 *
 * Se você não tem os PNGs, iOS mostra tela preta durante cold start
 * (não é blocker, mas é UX inferior). SVGs como fallback não funcionam
 * em <link rel="apple-touch-startup-image"> porque iOS exige PNG.
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SVG_PATH = path.join(ROOT, 'public/icons/splash-template.svg');
const OUTPUT_DIR = path.join(ROOT, 'public/icons');

// iOS device splash sizes (width × height in CSS px × device pixel ratio)
const SIZES = [
  { name: 'splash-640x1136.png', width: 640, height: 1136 }, // iPhone SE 1st gen
  { name: 'splash-750x1334.png', width: 750, height: 1334 }, // iPhone 8/SE 2nd
  { name: 'splash-828x1792.png', width: 828, height: 1792 }, // iPhone XR/11
  { name: 'splash-1125x2436.png', width: 1125, height: 2436 }, // iPhone X/XS
  { name: 'splash-1170x2532.png', width: 1170, height: 2532 }, // iPhone 12/13/14
  { name: 'splash-1242x2208.png', width: 1242, height: 2208 }, // iPhone 6+/6s+/7+/8+
  { name: 'splash-1284x2778.png', width: 1284, height: 2778 }, // iPhone 14 Pro Max
];

async function main() {
  try {
    await fs.access(SVG_PATH);
  } catch {
    console.error(`❌ Template SVG not found at ${SVG_PATH}`);
    process.exit(1);
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const svgBuffer = await fs.readFile(SVG_PATH);

  console.log(`📐 Generating ${SIZES.length} splash screens from ${path.basename(SVG_PATH)}...`);

  for (const { name, width, height } of SIZES) {
    const outputPath = path.join(OUTPUT_DIR, name);
    await sharp(svgBuffer)
      .resize(width, height, { fit: 'cover', position: 'centre' })
      .png({ compressionLevel: 9 })
      .toFile(outputPath);
    const { size } = await fs.stat(outputPath);
    console.log(`  ✓ ${name} (${width}×${height}) — ${(size / 1024).toFixed(1)} KB`);
  }

  console.log('\n✅ Splash screens generated. Update manifest.json + layout.tsx already reference these paths.');
}

main().catch((err) => {
  console.error('❌ Generation failed:', err);
  process.exit(1);
});
