/**
 * @akasha/tratamento — corpus-loader.ts
 *
 * Carrega os 352 arquivos JSON do corpus terapêutico em um `Corpus`
 * (Map<string, TextRecord> indexado por `id`). Lazy-load na primeira
 * chamada — chamadas subsequentes retornam o cache em memória.
 *
 * Path default: `packages/tratamento/src/textos/` (relativo ao CWD).
 *
 * Estilo: PT-BR only. Therapeutic-holistic universalist. Nenhuma
 * "criação de dados" — apenas parse e indexação do corpus canônico
 * gerado por Wave 5 prep (commit b5bb3d03).
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Corpus, TextRecord } from './types';

// ─── Cache singleton ─────────────────────────────────────────────────────────

/** Cache singleton do corpus carregado. `null` antes da 1ª carga. */
let corpusCache: Corpus | null = null;

/** Path do corpus carregado no cache (para invalidação). */
let corpusCachePath: string | null = null;

// ─── API pública ─────────────────────────────────────────────────────────────

/**
 * Carrega o corpus completo do disco e retorna um `Corpus`.
 *
 * Idempotente: chamadas subsequentes com o mesmo `basePath` retornam
 * o cache. Para forçar recarga, chame `limparCacheCorpus()` antes.
 *
 * @param basePath Path absoluto do diretório `textos/`. Default:
 *   resolve relativo ao CWD (`packages/tratamento/src/textos`).
 */
export function carregarCorpus(basePath?: string): Corpus {
  const resolved = basePath ?? defaultCorpusPath();

  if (corpusCache && corpusCachePath === resolved) {
    return corpusCache;
  }

  const corpus: Corpus = new Map();
  const arquivos = listarJsonRecursivo(resolved);

  for (const arquivo of arquivos) {
    try {
      const conteudo = readFileSync(arquivo, 'utf8');
      const parsed = JSON.parse(conteudo) as TextRecord;
      if (parsed && typeof parsed === 'object' && parsed.id) {
        corpus.set(parsed.id, parsed);
      }
      // Arquivos sem `id` são ignorados (defensivo — corpus Wave 5
      // sempre tem `id`, mas protege contra mudanças futuras).
    } catch (err) {
      // Falha de parse em 1 arquivo NÃO derruba o corpus inteiro.
      // Loga e continua (graceful degradation).
      console.warn(
        `[tratamento/corpus-loader] Falha ao parsear ${arquivo}:`,
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  corpusCache = corpus;
  corpusCachePath = resolved;
  return corpus;
}

/**
 * Lazy getter — equivalente a `carregarCorpus()` mas explícito sobre
 * a semântica de cache. Útil para callers que querem documentar
 * "primeira chamada carrega; próximas usam cache".
 */
export function carregarCorpusLazy(basePath?: string): Corpus {
  return carregarCorpus(basePath);
}

/** Limpa o cache do corpus. Usar em testes ou após mudar arquivos. */
export function limparCacheCorpus(): void {
  corpusCache = null;
  corpusCachePath = null;
}

// ─── Helpers internos ────────────────────────────────────────────────────────

/** Resolve path default do corpus relativo ao CWD. */
function defaultCorpusPath(): string {
  // Em produção (monorepo), o CWD é a raiz do repo e o corpus vive em
  // `packages/tratamento/src/textos/`. Em testes (vitest), o CWD é a
  // raiz do monorepo também (vitest.config.ts está na raiz).
  return join(process.cwd(), 'packages', 'tratamento', 'src', 'textos');
}

/**
 * Lista recursivamente todos os arquivos `.json` em `dir`, exceto
 * `index.json` e `_generate.py` (metadados do corpus).
 */
function listarJsonRecursivo(dir: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    // Diretório inexistente → corpus vazio (graceful degradation).
    return out;
  }

  for (const entry of entries) {
    if (entry === 'index.json' || entry === 'README.md' || entry === '_generate.py') {
      continue;
    }
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      out.push(...listarJsonRecursivo(full));
    } else if (st.isFile() && entry.endsWith('.json')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Helper de conveniência: converte um path absoluto de arquivo do corpus
 * em path relativo à raiz do monorepo (para incluir em `TextSource.path`).
 * Retorna o path original se a conversão falhar.
 */
export function paraPathRelativo(absPath: string, monorepoRoot?: string): string {
  const root = monorepoRoot ?? process.cwd();
  try {
    return relative(root, absPath);
  } catch {
    return absPath;
  }
}
