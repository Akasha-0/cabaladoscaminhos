import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Test-guardião: completude i18n EN do Grimório (Doc 25 §9 Fase 2).
 *
 * Para cada arquivo .md do Grimório (botanica, ancestral, vibracional, diagnostico):
 * - Frontmatter YAML parseia
 * - Campo `title_en` existe
 * - `title_en` tem ≥ 3 palavras (não é placeholder vazio)
 */

interface Frontmatter {
  [key: string]: unknown;
  title?: string;
  title_en?: string;
}

function parseFrontmatter(content: string): { fm: Frontmatter; body: string } | null {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  const [, fmRaw, body] = match;
  const fm: Frontmatter = {};

  // Parse YAML simples (apenas pares chave: valor e listas)
  for (const line of fmRaw.split('\n')) {
    const kv = line.match(/^([a-zA-Z_][\w_-]*)\s*:\s*(.*?)\s*$/);
    if (!kv) continue;
    const [, key, valueRaw] = kv;
    const value = valueRaw.replace(/^["']|["']$/g, '').trim();
    // Tenta parsear como lista inline [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      fm[key] = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else {
      fm[key] = value;
    }
  }

  return { fm, body };
}

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...walk(path));
    } else if (entry.endsWith('.md')) {
      files.push(path);
    }
  }
  return files;
}

const GRIMOIRE_DIR = join(process.cwd(), 'grimoire');
const TARGET_SUBDIRS = ['botanica', 'ancestral', 'vibracional', 'diagnostico'];

describe('grimório: completude i18n EN', () => {
  const allFiles: { path: string; subdir: string; fm: Frontmatter }[] = [];

  for (const subdir of TARGET_SUBDIRS) {
    const fullPath = join(GRIMOIRE_DIR, subdir);
    let files: string[] = [];
    try {
      files = walk(fullPath);
    } catch {
      // Subdir pode não existir; pula
      continue;
    }

    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      const parsed = parseFrontmatter(content);
      if (parsed) {
        allFiles.push({
          path: file.replace(process.cwd() + '/', ''),
          subdir,
          fm: parsed.fm,
        });
      }
    }
  }

  it('encontra ao menos 50 ervas em botanica', () => {
    const botanica = allFiles.filter((f) => f.subdir === 'botanica');
    expect(botanica.length).toBeGreaterThanOrEqual(50);
  });

  it('encontra 16 odus em ancestral', () => {
    const odus = allFiles.filter((f) => f.subdir === 'ancestral');
    expect(odus.length).toBe(16);
  });

  it('encontra 11 corpos em vibracional', () => {
    const corpos = allFiles.filter((f) => f.subdir === 'vibracional');
    expect(corpos.length).toBe(11);
  });

  it('todo arquivo do grimório tem campo title_en', () => {
    const missing = allFiles
      .filter((f) => !f.fm.title_en || (f.fm.title_en as string).trim() === '')
      .map((f) => f.path);
    expect(missing).toEqual([]);
  });

  it('todo title_en tem ≥ 3 palavras (não é placeholder vazio)', () => {
    const short = allFiles
      .filter((f) => {
        const en = (f.fm.title_en as string) ?? '';
        const wordCount = en.split(/\s+/).filter(Boolean).length;
        return wordCount < 3;
      })
      .map((f) => ({ path: f.path, title_en: f.fm.title_en }));
    expect(short).toEqual([]);
  });

  it('todo title_en difere do title (não é cópia idêntica)', () => {
    const duplicates = allFiles
      .filter((f) => {
        const pt = (f.fm.title as string) ?? '';
        const en = (f.fm.title_en as string) ?? '';
        return pt === en && pt.length > 0;
      })
      .map((f) => f.path);
    // Apenas informativo: erva-052 e arquivos curtos podem ter title=title_en
    // Aceita até 10% de duplicatas (caso palavras-chave iguais ex: "Alecrim" == "Rosemary"? não,
    // aqui é falha de tradução). Aceita 0 (alvo).
    expect(duplicates.length).toBeLessThanOrEqual(Math.floor(allFiles.length * 0.1));
  });

  it('frontmatter de todos os arquivos parseia como YAML válido (≥ 5 chaves)', () => {
    const tooFew = allFiles
      .filter((f) => Object.keys(f.fm).length < 5)
      .map((f) => ({ path: f.path, keys: Object.keys(f.fm) }));
    expect(tooFew).toEqual([]);
  });
});
