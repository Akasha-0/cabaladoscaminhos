import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Test-guardião: proveniência D4 dos 16 Odus (Doc 20 AD-20.3, Doc 25 §5).
 *
 * Para cada arquivo `grimoire/ancestral/odu-*.md`:
 * - Frontmatter YAML parseia
 * - Bloco `metadata:` existe
 * - `metadata.source` não é vazio (livro/autor/edição/página)
 * - `metadata.lineage` não é vazio (tradição: Yorubá/Ifá/Candomblé/...)
 * - `metadata.validated_at` não é vazio (data ISO)
 */

interface OduFrontmatter {
  id?: string;
  metadata?: {
    source?: string;
    lineage?: string;
    validated_at?: string;
  };
}

const EXPECTED_ODUS = 16;

function parseFrontmatter(content: string): OduFrontmatter {
  const fm: OduFrontmatter & Record<string, unknown> = {};
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return fm;

  const lines = match[1].split('\n');
  let currentNested: Record<string, unknown> | null = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const nested = line.match(/^(\s+)([a-zA-Z_][\w_-]*)\s*:\s*(.*?)\s*$/);
    const top = line.match(/^([a-zA-Z_][\w_-]*)\s*:\s*(.*?)\s*$/);

    if (nested && currentNested) {
      const [, , key, valueRaw] = nested;
      const value = valueRaw.replace(/^["']|["']$/g, '').trim();
      (currentNested as Record<string, unknown>)[key] = value || true;
      continue;
    }

    if (top) {
      const [, key, valueRaw] = top;
      const value = valueRaw.replace(/^["']|["']$/g, '').trim();

      // Detect "key:" with empty value → open a nested block
      if (value === '' || value === '|' || value === '>') {
        currentNested = {};
        (fm as Record<string, unknown>)[key] = currentNested;
        continue;
      }

      currentNested = null;

      if (value.startsWith('[') && value.endsWith(']')) {
        (fm as Record<string, unknown>)[key] = value
          .slice(1, -1)
          .split(',')
          .map((v) => v.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      } else {
        (fm as Record<string, unknown>)[key] = value;
      }
    }
  }

  return fm;
}

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      files.push(...walk(p));
    } else if (entry.startsWith('odu-') && entry.endsWith('.md')) {
      files.push(p);
    }
  }
  return files;
}

const GRIMOIRE_ODUS_DIR = join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  '..',
  'grimoire',
  'ancestral'
);

describe('odús: proveniência D4 (16 Odus)', () => {
  const oduFiles = walk(GRIMOIRE_ODUS_DIR);
  const parsed = oduFiles.map((file) => {
    const content = readFileSync(file, 'utf8');
    return {
      file: file.replace(process.cwd() + '/', ''),
      fm: parseFrontmatter(content),
    };
  });

  it('encontra exatamente 16 arquivos odu-*.md em grimoire/ancestral/', () => {
    expect(oduFiles.length).toBe(EXPECTED_ODUS);
  });

  it('cada Odu possui metadata.source não vazio', () => {
    const failures: string[] = [];
    for (const { file, fm } of parsed) {
      const source = fm.metadata?.source;
      if (!source || source.trim().length === 0) {
        failures.push(file);
      }
    }
    expect(failures, `Odus sem metadata.source: ${failures.join(', ')}`).toEqual([]);
  });

  it('cada Odu possui metadata.lineage não vazio', () => {
    const failures: string[] = [];
    for (const { file, fm } of parsed) {
      const lineage = fm.metadata?.lineage;
      if (!lineage || lineage.trim().length === 0) {
        failures.push(file);
      }
    }
    expect(failures, `Odus sem metadata.lineage: ${failures.join(', ')}`).toEqual([]);
  });

  it('cada Odu possui metadata.validated_at não vazio', () => {
    const failures: string[] = [];
    for (const { file, fm } of parsed) {
      const validatedAt = fm.metadata?.validated_at;
      if (!validatedAt || validatedAt.trim().length === 0) {
        failures.push(file);
      }
    }
    expect(
      failures,
      `Odus sem metadata.validated_at: ${failures.join(', ')}`
    ).toEqual([]);
  });

  it('cada Odu possui metadata.lineage mencionando Yorubá/Ifá/Merindilogun/Candomblé', () => {
    const failures: string[] = [];
    for (const { file, fm } of parsed) {
      const lineage = (fm.metadata?.lineage || '').toLowerCase();
      const ok =
        lineage.includes('yorubá') ||
        lineage.includes('yoruba') ||
        lineage.includes('nagô') ||
        lineage.includes('nago') ||
        lineage.includes('ifá') ||
        lineage.includes('ifa') ||
        lineage.includes('merindilogun') ||
        lineage.includes('candomblé') ||
        lineage.includes('candomble');
      if (!ok) failures.push(`${file} → "${fm.metadata?.lineage}"`);
    }
    expect(
      failures,
      `Odus com lineage fora do escopo Yorubá/Ifá/Merindilogun/Candomblé: ${failures.join('; ')}`
    ).toEqual([]);
  });

  it('cada Odu possui id e metadata simultaneamente', () => {
    const failures: string[] = [];
    for (const { file, fm } of parsed) {
      if (!fm.id || !fm.metadata) failures.push(file);
    }
    expect(failures, `Odus sem id/metadata: ${failures.join(', ')}`).toEqual([]);
  });
});
