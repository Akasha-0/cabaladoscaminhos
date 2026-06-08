/**
 * Teste-guardião da Curadoria I-Ching (v0.0.5-Fase 1, T9).
 *
 * Complementa `iching-completeness.test.ts` (que verifica proveniência
 * básica) com gates explícitos de curadoria editorial, todos
 * referenciando a Doc 20 (Governança de Conteúdo Oracular):
 *
 *  - Doc 20 AD-20.3 — `metadata.source` obrigatório
 *  - Doc 20 AD-20.5 — afixação no ledger central (`IDEIA.md §7.2`)
 *  - Doc 20 AD-20.6 — `metadata.lineage` obrigatório
 *  - Doc 25 AD-25.6 — i18n EN (`title_en` + seção `## EN`)
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

// A partir de apps/akasha-portal/, o grimoire está em ../../grimoire
const GRIMOIRE_DIR = path.resolve(process.cwd(), '../../grimoire/iching');
// IDEIA.md vive na raiz do repo (apps/akasha-portal/ → ../../IDEIA.md)
const IDEIA_MD = path.resolve(process.cwd(), '../../IDEIA.md');
const EXPECTED_COUNT = 16;

function listIchingFiles(): string[] {
  if (!fs.existsSync(GRIMOIRE_DIR)) return [];
  return fs
    .readdirSync(GRIMOIRE_DIR)
    .filter((f) => /^hex-\d{2}-.+\.md$/.test(f))
    .sort();
}

describe('v0.0.5 Fase 1 (T9) — Curadoria I-Ching (Doc 20 AD-20.3/5/6 + Doc 25 AD-25.6)', () => {
  it('1. existem exatamente 16 arquivos hex-NN-*.md em grimoire/iching/', () => {
    const files = listIchingFiles();
    expect(
      files.length,
      `Doc 20 AD-20.3 — Esperado 16 hexagramas curados, encontrado ${files.length}: ${files.join(', ')}`
    ).toBe(EXPECTED_COUNT);
  });

  describe('2. cada hexagrama carrega proveniência, lineage, i18n EN e cross-ref no ledger', () => {
    const files = listIchingFiles();
    // Pré-carrega a região §7.2 do IDEIA.md (linhas ~780-820 segundo a spec)
    const ideiaExists = fs.existsSync(IDEIA_MD);
    const ideiaFull = ideiaExists ? fs.readFileSync(IDEIA_MD, 'utf8') : '';
    const ideiaLines = ideiaFull.split('\n');
    // Janela de linhas para o ledger §7.2: cobre header + tabela + decisões
    const LEDGER_START = 780;
    const LEDGER_END = 820;
    const ideiaWindow = ideiaLines
      .slice(Math.max(0, LEDGER_START - 1), Math.min(ideiaLines.length, LEDGER_END))
      .join('\n');

    if (files.length === 0) {
      it.skip('pulando — diretório grimoire/iching vazio', () => {});
      return;
    }
    if (!ideiaExists) {
      it.skip('pulando cross-ref — IDEIA.md não encontrado', () => {});
    }

    files.forEach((file) => {
      describe(file, () => {
        const fullPath = path.join(GRIMOIRE_DIR, file);
        const raw = fs.readFileSync(fullPath, 'utf8');
        const meta = parseFrontmatter(raw);

        it('2a. frontmatter YAML parseável (--- ... ---)', () => {
          expect(
            raw.startsWith('---'),
            `Doc 20 AD-20.3 — ${file}: frontmatter ausente ou malformado (esperado início com "---").`
          ).toBe(true);
        });

        it('2b. metadata.source presente e não-vazio (Doc 20 AD-20.3)', () => {
          const source = meta.source ?? meta['metadata.source'];
          expect(
            typeof source === 'string' && (source as string).trim().length > 0,
            `Doc 20 AD-20.3 — ${file}: source ausente ou vazio. Proveniência é obrigatória.`
          ).toBe(true);
        });

        it('2c. metadata.lineage presente e não-vazio (Doc 20 AD-20.6)', () => {
          const lineage = meta.lineage ?? meta['metadata.lineage'];
          expect(
            typeof lineage === 'string' && (lineage as string).trim().length > 0,
            `Doc 20 AD-20.6 — ${file}: lineage ausente ou vazio. Tradição é obrigatória.`
          ).toBe(true);
        });

        it('2d. title_en presente e não-vazio (Doc 25 AD-25.6, i18n EN)', () => {
          const titleEn = meta.title_en;
          expect(
            typeof titleEn === 'string' && (titleEn as string).trim().length > 0,
            `Doc 25 AD-25.6 — ${file}: title_en ausente ou vazio. i18n EN é obrigatória.`
          ).toBe(true);
        });

        it('2e. seção `## EN` presente e não-vazia no corpo', () => {
          const body = raw.split('---').slice(2).join('---');
          const lines = body.split('\n');
          const enLineIdx = lines.findIndex((l) => /^## EN\s*$/.test(l));
          expect(
            enLineIdx >= 0 && enLineIdx < lines.length - 1,
            `Doc 25 AD-25.6 — ${file}: seção "## EN" ausente no corpo.`
          ).toBe(true);
          // Verifica que há ao menos 1 linha de conteúdo após `## EN`
          // (até a próxima seção `## ` ou fim do arquivo).
          let contentLines = 0;
          for (let i = enLineIdx + 1; i < lines.length; i++) {
            if (/^## /.test(lines[i])) break;
            if (lines[i].trim().length > 0) contentLines++;
          }
          expect(
            contentLines > 0,
            `Doc 25 AD-25.6 — ${file}: seção "## EN" existe mas está vazia.`
          ).toBe(true);
        });

        it('2f. cross-ref no ledger §7.2 de IDEIA.md (Doc 20 AD-20.5)', () => {
          if (!ideiaExists) return; // skip já tratado acima
          // Tabela: linha `| N | `hex-XX-name.md` | …` — busca simples do nome
          // do arquivo dentro da janela §7.2.
          const fileRefPattern = new RegExp(
            '`\\s*' + file.replace(/\./g, '\\.') + '\\s*`'
          );
          const bareRefPattern = new RegExp(
            '(^|[^`])' + file.replace(/\./g, '\\.') + '([^`]|$)'
          );
          const found =
            fileRefPattern.test(ideiaWindow) || bareRefPattern.test(ideiaWindow);
          expect(
            found,
            `Doc 20 AD-20.5 — ${file}: ausente do ledger §7.2 de IDEIA.md ` +
              `(linhas ${LEDGER_START}-${LEDGER_END}). Curadoria deve ` +
              `registrar a entrada na tabela de afixação central.`
          ).toBe(true);
        });
      });
    });
  });
});
