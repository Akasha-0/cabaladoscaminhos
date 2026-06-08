import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';

const CATEGORIES = ['botanica', 'ancestral', 'vibracional', 'diagnostico'] as const;

// Grimoire lives at the monorepo root; tests run from apps/akasha-portal/tests.
// Search upward for a `grimoire/` directory from cwd (vitest sets cwd to the
// repo root when invoked from the worktree, but tests/ is also searched first).
function findGrimoireRoot(): string {
  // Try the canonical monorepo location first.
  const candidates = [
    path.resolve(process.cwd(), 'grimoire'),
    path.resolve(__dirname, '..', '..', '..', '..', '..', 'grimoire'),
    path.resolve(__dirname, '..', '..', '..', '..', 'grimoire'),
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
        if (f.endsWith('.md')) all.push(path.join(dir, f));
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
