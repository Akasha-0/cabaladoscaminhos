import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Teste-guardião da Curadoria D4 (v0.0.4-T3.6).
 *
 * Garante que os 16 Odus em `grimoire/ancestral/odu-*.md` carregam proveniência
 * rastreável (Doc 20 AD-20.3) e flag explícita de provisoriedade (AD-20.4).
 *
 * Falhas bloqueiam merge (CI gate) até curadoria editorial resolver.
 *
 * Regra de proveniência (Doc 20 AD-20.8 — "rejeitar sem fonte"):
 *   - `source`    — obra/autor/edição/página OU tradição oral verificável
 *   - `lineage`   — linhagem declarada (Yorubá, Ifá, Candomblé, Umbanda, etc.)
 *   - `provisional` — true se conteúdo pendente de validação; false se validado
 *
 * Parser local idêntico ao `parseFrontmatter` em `src/lib/grimoire/sync.ts`
 * (mantido duplicado para evitar side-effects de import do sync.ts).
 */

interface Frontmatter {
  [key: string]: string | number | boolean | string[] | number[] | undefined;
}

function parseFrontmatter(markdown: string): Frontmatter {
  const parts = markdown.split('---');
  if (parts.length < 3) return {};
  const yaml = parts[1];
  const metadata: Frontmatter = {};
  yaml.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    if (!key) return;
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.substring(1, value.length - 1);
    }
    if (value === '') {
      metadata[key] = undefined;
    } else if (value === 'true') {
      metadata[key] = true;
    } else if (value === 'false') {
      metadata[key] = false;
    } else if (value.startsWith('[') && value.endsWith(']')) {
      // Arrays simples: [A, B] ou ["A", "B"]
      const inner = value.slice(1, -1).trim();
      if (inner === '') {
        metadata[key] = [];
      } else {
        metadata[key] = inner
          .split(',')
          .map((v) => v.trim().replace(/^["']|["']$/g, ''))
          .filter((v) => v.length > 0);
      }
    } else {
      const num = Number(value);
      metadata[key] = !isNaN(num) && value !== '' ? num : value;
    }
  });
  return metadata;
}

const GRIMOIRE_DIR = path.resolve(process.cwd(), 'grimoire/ancestral');
const EXPECTED_COUNT = 16;

function listOduFiles(): string[] {
  if (!fs.existsSync(GRIMOIRE_DIR)) return [];
  return fs
    .readdirSync(GRIMOIRE_DIR)
    .filter((f) => /^odu-\d{2}-.+\.md$/.test(f))
    .sort();
}

describe('Curadoria D4 — proveniência dos 16 Odus (Doc 20 AD-20.3 + AD-20.4)', () => {
  it('existem exatamente 16 arquivos odu-NN-*.md em grimoire/ancestral/', () => {
    const files = listOduFiles();
    expect(
      files.length,
      `Esperado 16 Odus, encontrado ${files.length}: ${files.join(', ')}`
    ).toBe(EXPECTED_COUNT);
  });

  describe('cada Odu carrega `source` + `lineage` + `provisional` no frontmatter', () => {
    const files = listOduFiles();

    if (files.length === 0) {
      it.skip('pulando — diretório grimoire/ancestral vazio', () => {});
      return;
    }

    files.forEach((file) => {
      describe(file, () => {
        const fullPath = path.join(GRIMOIRE_DIR, file);
        const raw = fs.readFileSync(fullPath, 'utf8');
        const meta = parseFrontmatter(raw);

        it('frontmatter YAML parseável (--- ... ---)', () => {
          expect(raw.startsWith('---')).toBe(true);
        });

        it('campo `source` presente e não-vazio (Doc 20 AD-20.3)', () => {
          const source = meta.source;
          expect(
            typeof source === 'string' && source.trim().length > 0,
            `${file}: metadata.source ausente ou vazio (Doc 20 AD-20.3) — \
curadoria editorial precisa indicar obra/autor/edição/página ou tradição oral verificável.`
          ).toBe(true);
        });

        it('campo `lineage` presente e não-vazio (Doc 20 AD-20.6)', () => {
          const lineage = meta.lineage;
          expect(
            typeof lineage === 'string' && lineage.trim().length > 0,
            `${file}: metadata.lineage ausente ou vazio (Doc 20 AD-20.6) — \
curadoria editorial precisa indicar linhagem (Yorubá/Ifá/Candomblé/Umbanda/etc.).`
          ).toBe(true);
        });

        it('campo `provisional` presente e boolean (Doc 20 AD-20.4)', () => {
          const provisional = meta.provisional;
          expect(
            typeof provisional === 'boolean',
            `${file}: metadata.provisional ausente ou não-boolean (Doc 20 AD-20.4) — \
conteúdo pendente de validação deve carregar \`provisional: true\` explicitamente.`
          ).toBe(true);
        });
      });
    });
  });
});
