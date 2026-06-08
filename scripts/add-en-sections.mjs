#!/usr/bin/env node
// Add minimal `## EN` section to every grimoire file that doesn't have one.
// Each `## EN` section includes the `title_en` (from frontmatter) + a TODO
// placeholder for future native translation. Surgical: appends only.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CATEGORIES = ['botanica', 'ancestral', 'vibracional', 'diagnostico'];

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { front: null, body: text };
  return { front: m[1], body: m[2] };
}

function getTitleEn(front) {
  if (!front) return null;
  const m = front.match(/^title_en:\s*"?([^"\n]+?)"?\s*$/m);
  return m ? m[1] : null;
}

function buildEnSection(titleEn) {
  const heading = titleEn ?? '(English title pending)';
  return `\n## EN\n\n> **Translation status:** Title + structural placeholder only. Full EN body translation is a follow-up cycle (Doc 25 §9 Fase 2).\n\n### ${heading}\n\n*English body translation pending — see Doc 25 §9 for the full plan.*\n`;
}

async function processFile(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  if (/^## EN\b/m.test(text)) return { status: 'skip', file: filePath };
  const { front, body } = parseFrontmatter(text);
  const titleEn = getTitleEn(front);
  const enSection = buildEnSection(titleEn);
  const newText = text.trimEnd() + '\n' + enSection;
  await fs.writeFile(filePath, newText, 'utf8');
  return { status: 'added', file: filePath, titleEn };
}

async function main() {
  const results = { added: [], skipped: [] };
  for (const cat of CATEGORIES) {
    const dir = path.join(ROOT, 'grimoire', cat);
    let files;
    try {
      files = await fs.readdir(dir);
    } catch (e) {
      console.error(`Skip ${cat}: ${e.message}`);
      continue;
    }
    for (const f of files) {
      if (!f.endsWith('.md')) continue;
      const r = await processFile(path.join(dir, f));
      if (r.status === 'added') results.added.push(r);
      else results.skipped.push(r.file);
    }
  }
  console.log(`Added ## EN to ${results.added.length} files; skipped ${results.skipped.length} (already had it).`);
  if (results.added.length > 0) {
    console.log('Sample:', results.added.slice(0, 3).map((r) => r.file).join('\n  '));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
