/**
 * Teste-guardião do Grimoire I-Ching (v0.0.5-T5.6, Doc 19 AD-19.4 #4).
 *
 * Garante que os 16 hexagramas curados em `grimoire/iching/hex-*.md`
 * carregam proveniência rastreável (Doc 20 AD-20.3), i18n EN
 * (title_en + ## EN section) e validação explícita (validated_at).
 *
 * Falhas bloqueiam merge (CI gate) até curadoria editorial resolver.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

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

// grimoire/iching/ is at the monorepo root alongside tests/
const GRIMOIRE_DIR = path.resolve(process.cwd(), 'grimoire/iching');
const EXPECTED_COUNT = 16;

function listIchingFiles(): string[] {
  if (!fs.existsSync(GRIMOIRE_DIR)) return [];
  return fs
    .readdirSync(GRIMOIRE_DIR)
    .filter((f) => /^hex-\d{2}-.+\.md$/.test(f))
    .sort();
}

describe('v0.0.5 — Grimoire I-Ching (Doc 20 AD-20.3 + i18n EN)', () => {
  it('existem exatamente 16 arquivos hex-NN-*.md em grimoire/iching/', () => {
    const files = listIchingFiles();
    expect(
      files.length,
      `Esperado 16 hexagramas, encontrado ${files.length}: ${files.join(', ')}`
    ).toBe(EXPECTED_COUNT);
  });

  describe('cada hexagrama carrega proveniência + i18n EN + validação', () => {
    const files = listIchingFiles();

    if (files.length === 0) {
      it.skip('pulando — diretório grimoire/iching vazio', () => {});
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

        it('campo `title_en` presente e não-vazio (i18n Doc 25 AD-25.6)', () => {
          const titleEn = meta.title_en;
          expect(
            typeof titleEn === 'string' && titleEn.trim().length > 0,
            `${file}: title_en ausente ou vazio.`
          ).toBe(true);
        });

        it('seção `## EN` presente e não-vazia (i18n EN)', () => {
          // Verifica que existe uma seção `## EN` (h2) e que tem
          // conteúdo (algum caractere além do próprio cabeçalho).
          const body = raw.split('---').slice(2).join('---');
          // Pega a primeira ocorrência de "## EN" no início de linha e
          // verifica que existe conteúdo após o cabeçalho.
          const lines = body.split('\n');
          const enLineIdx = lines.findIndex((l) => /^## EN\s*$/.test(l));
          expect(
            enLineIdx >= 0 && enLineIdx < lines.length - 1,
            `${file}: seção "## EN" ausente.`
          ).toBe(true);
          // Verifica que há ao menos 1 linha de conteúdo após `## EN`
          // (até encontrar outra seção `## ` ou fim do arquivo).
          let contentLines = 0;
          for (let i = enLineIdx + 1; i < lines.length; i++) {
            if (/^## /.test(lines[i])) break;
            if (lines[i].trim().length > 0) contentLines++;
          }
          expect(
            contentLines > 0,
            `${file}: seção "## EN" existe mas está vazia.`
          ).toBe(true);
        });

        it('metadata.source presente e não-vazio (Doc 20 AD-20.3)', () => {
          // Suporta tanto `metadata.source` (aninhado) quanto `source` (top-level)
          const source = meta.source ?? meta['metadata.source'];
          expect(
            typeof source === 'string' && (source as string).trim().length > 0,
            `${file}: metadata.source ausente ou vazio (Doc 20 AD-20.3).`
          ).toBe(true);
        });

        it('metadata.lineage presente e não-vazio (Doc 20 AD-20.6)', () => {
          const lineage = meta.lineage ?? meta['metadata.lineage'];
          expect(
            typeof lineage === 'string' && (lineage as string).trim().length > 0,
            `${file}: metadata.lineage ausente ou vazio (Doc 20 AD-20.6).`
          ).toBe(true);
        });

        it('metadata.validated_at presente (data de curadoria explícita)', () => {
          const validated = meta.validated_at ?? meta['metadata.validated_at'];
          expect(
            typeof validated === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(validated as string),
            `${file}: metadata.validated_at ausente ou mal-formatado (esperado YYYY-MM-DD).`
          ).toBe(true);
        });
      });
    });
  });
});
