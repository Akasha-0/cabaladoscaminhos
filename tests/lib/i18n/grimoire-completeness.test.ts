import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';

const CATEGORIES = ['botanica', 'ancestral', 'vibracional', 'diagnostico'] as const;

// Grimoire lives at the monorepo root. This test runs from either
// `apps/akasha-portal/` (when pnpm --filter is used) or the repo root
// (when vitest is invoked directly). Try cwd-relative first, then a
// path anchored at the source file (tests/lib/i18n/), which is stable
// across cwd: 3 `..` lands at the repo root.
function findGrimoireRoot(): string {
  const candidates = [
    path.resolve(process.cwd(), 'grimoire'),
    path.resolve(process.cwd(), '..', '..', 'grimoire'),
    path.resolve(__dirname, '..', '..', '..', 'grimoire'),
  ];
  for (const c of candidates) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('node:fs').accessSync(c);
      return c;
    } catch {
      // try next
    }
  }
  return candidates[0];
}

const GRIMOIRE_ROOT = findGrimoireRoot();

async function listAllGrimoire(): Promise<string[]> {
  const all: string[] = [];
  for (const cat of CATEGORIES) {
    const dir = path.join(GRIMOIRE_ROOT, cat);
    try {
      const files = await fs.readdir(dir);
      for (const f of files) {
        // Exclude AGENTS.md — it's a DOX doc, not a grimoire entry.
        if (f.endsWith('.md') && f !== 'AGENTS.md') all.push(path.join(dir, f));
      }
    } catch {
      // category dir missing is acceptable
    }
  }
  return all;
}

describe('Grimoire EN completeness (Doc 25 §9, v0.0.4-T9)', () => {
  it('every grimoire file has a `## EN` section with substantive body (>200 chars after title)', async () => {
    const files = await listAllGrimoire();
    expect(files.length).toBeGreaterThanOrEqual(80);

    const missing: string[] = [];
    const thin: string[] = [];
    for (const f of files) {
      const content = await fs.readFile(f, 'utf-8');
      const enMatch = content.match(/## EN\s*([\s\S]*?)(?=\n##\s|\s*$)/m);
      if (!enMatch) {
        missing.push(path.basename(f));
        continue;
      }
      // Body after the H3 title line should be > 200 chars (substantive)
      const bodyAfterTitle = enMatch[1].replace(/^.*?###.*?\n/m, '').trim();
      if (bodyAfterTitle.length < 200) {
        thin.push(`${path.basename(f)} (${bodyAfterTitle.length} chars)`);
      }
    }
    expect(missing, `Files missing ## EN: ${missing.join(', ')}`).toEqual([]);
    expect(thin, `Files with thin ## EN bodies: ${thin.join(', ')}`).toEqual([]);
  });

  it('every grimoire file has a non-empty `title_en` in frontmatter', async () => {
    const files = await listAllGrimoire();
    const missing: string[] = [];
    for (const f of files) {
      const content = await fs.readFile(f, 'utf-8');
      const fm = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fm) {
        missing.push(`${path.basename(f)}: no frontmatter`);
        continue;
      }
      const m = fm[1].match(/^title_en:\s*"?([^"\n]+?)"?\s*$/m);
      if (!m || !m[1].trim()) missing.push(`${path.basename(f)}: no title_en`);
    }
    expect(missing, `Files missing title_en: ${missing.join(', ')}`).toEqual([]);
  });
});
