#!/usr/bin/env tsx
 
// ============================================================================
// Akasha Portal — Bundle Size Budget Check
// ============================================================================
// Mede o tamanho dos chunks gerados pelo `next build` em `.next/static/chunks/`
// e compara contra os budgets definidos em `docs/PERFORMANCE-BUDGETS.md`.
//
//   - Largest JS chunk: < 250 KB (raw)
//   - Total JS chunks:   < 5 MB  (raw)
//
// Uso:
//   pnpm check:bundle                     # usa defaults (250KB / 5MB)
//   pnpm check:bundle --max-chunk=300000  # override budget em bytes
//   pnpm check:bundle --max-total=6000000
//   pnpm check:bundle --dir=.next/static/chunks   # custom dir
//
// Exit codes:
//   0 = dentro do budget
//   1 = budget estourado
//   2 = erro de I/O ou build nao encontrado
//
// Implementacao: usa apenas Node built-ins (fs/path/zlib). Sem deps externas.
// ============================================================================

import { promises as fs } from 'node:fs';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

interface ChunkInfo {
  /** Caminho relativo ao ROOT_DIR, normalizado com forward slashes. */
  relPath: string;
  /** Tamanho em bytes (raw, sem gzip). */
  size: number;
  /** Tamanho gzipped em bytes (informational). */
  gzipped: number;
  /** Tipo inferido pela extensao. */
  kind: 'js' | 'css' | 'map' | 'other';
}

interface BudgetConfig {
  maxChunkBytes: number;
  maxTotalBytes: number;
  rootDir: string;
}

// ----------------------------------------------------------------------------
// Defaults — devem espelhar docs/PERFORMANCE-BUDGETS.md
// ----------------------------------------------------------------------------

const DEFAULT_MAX_CHUNK_BYTES = 250 * 1024; // 250 KB
const DEFAULT_MAX_TOTAL_BYTES = 5 * 1024 * 1024; // 5 MB
const DEFAULT_ROOT_DIR = path.join(process.cwd(), '.next', 'static', 'chunks');

// ----------------------------------------------------------------------------
// CLI args (parsing simples, sem deps)
// ----------------------------------------------------------------------------

function parseArgs(argv: string[]): BudgetConfig {
  const cfg: BudgetConfig = {
    maxChunkBytes: DEFAULT_MAX_CHUNK_BYTES,
    maxTotalBytes: DEFAULT_MAX_TOTAL_BYTES,
    rootDir: DEFAULT_ROOT_DIR,
  };

  for (const arg of argv) {
    if (arg.startsWith('--max-chunk=')) {
      const v = Number(arg.split('=')[1]);
      if (!Number.isFinite(v) || v <= 0) {
        throw new Error(`--max-chunk invalido: ${arg}`);
      }
      cfg.maxChunkBytes = v;
    } else if (arg.startsWith('--max-total=')) {
      const v = Number(arg.split('=')[1]);
      if (!Number.isFinite(v) || v <= 0) {
        throw new Error(`--max-total invalido: ${arg}`);
      }
      cfg.maxTotalBytes = v;
    } else if (arg.startsWith('--dir=')) {
      const v = arg.split('=')[1];
      if (!v) throw new Error(`--dir invalido: ${arg}`);
      cfg.rootDir = path.isAbsolute(v) ? v : path.join(process.cwd(), v);
    }
  }

  return cfg;
}

// ----------------------------------------------------------------------------
// Filesystem walk
// ----------------------------------------------------------------------------

function classifyByExt(filename: string): ChunkInfo['kind'] {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.js') || lower.endsWith('.mjs')) return 'js';
  if (lower.endsWith('.css')) return 'css';
  if (lower.endsWith('.map')) return 'map';
  return 'other';
}

async function gzipSize(filePath: string): Promise<number> {
  // Stream gzip para nao carregar arquivos grandes inteiros na memoria.
  // Para os chunks tipicos (< 5MB) isso e rapido o suficiente.
  const stream = createReadStream(filePath);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }
  return zlib.gzipSync(Buffer.concat(chunks), { level: 6 }).byteLength;
}

async function walkDir(dir: string, rootDir: string): Promise<ChunkInfo[]> {
  const out: ChunkInfo[] = [];

  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(
        `Diretorio nao encontrado: ${dir}\n` +
          `Rode \`pnpm build\` antes de \`pnpm check:bundle\`.`,
      );
    }
    throw err;
  }

  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await walkDir(abs, rootDir);
      out.push(...sub);
    } else if (entry.isFile()) {
      const stat = await fs.stat(abs);
      const rel = path.relative(rootDir, abs).split(path.sep).join('/');
      const kind = classifyByExt(entry.name);
      // Source maps nao sao servidos ao cliente final por padrao
      // (sao source map files; impactam DX, nao bundle wire-size).
      // Pula do budget mas mantem no report para visibilidade.
      const gzipped = kind === 'map' ? 0 : await gzipSize(abs);
      out.push({ relPath: rel, size: stat.size, gzipped, kind });
    }
  }

  return out;
}

// ----------------------------------------------------------------------------
// Reporting
// ----------------------------------------------------------------------------

function fmtKb(bytes: number): string {
  return (bytes / 1024).toFixed(2).padStart(8) + ' KB';
}

function fmtBytes(bytes: number): string {
  return bytes.toString().padStart(10) + ' B';
}

function printHeader(cfg: BudgetConfig) {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   AKASHA PORTAL — Bundle Size Budget Check                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Root:           ${cfg.rootDir}`);
  console.log(`  Max chunk:      ${fmtKb(cfg.maxChunkBytes)}  (${cfg.maxChunkBytes.toLocaleString()} bytes)`);
  console.log(`  Max total:      ${fmtKb(cfg.maxTotalBytes)}  (${cfg.maxTotalBytes.toLocaleString()} bytes)`);
  console.log('');
}

function printTopChunks(chunks: ChunkInfo[], n: number) {
  const top = [...chunks].sort((a, b) => b.size - a.size).slice(0, n);

  console.log(`  Top ${top.length} maiores chunks (raw size):`);
  console.log('');
  console.log('    ' + 'Rank'.padEnd(6) + 'Raw'.padStart(14) + 'Gzipped'.padStart(14) + '  Kind  Path');
  console.log('    ' + '─'.repeat(6).padEnd(6) + '─'.repeat(14).padStart(14) + '─'.repeat(14).padStart(14) + '  ────  ────');

  top.forEach((c, i) => {
    const rank = `#${i + 1}`.padEnd(6);
    const raw = (c.size / 1024).toFixed(2).padStart(8) + ' KB';
    const gz = c.kind === 'map' ? '      (map)' : (c.gzipped / 1024).toFixed(2).padStart(8) + ' KB';
    console.log(`    ${rank}${raw.padStart(14)}${gz.padStart(14)}  ${c.kind.padEnd(4)}  ${c.relPath}`);
  });
  console.log('');
}

function printSummary(
  jsChunks: ChunkInfo[],
  totalSize: number,
  largest: ChunkInfo | null,
  cfg: BudgetConfig,
): { ok: boolean; failures: string[] } {
  const failures: string[] = [];

  console.log('  Resumo (apenas arquivos .js/.mjs):');
  console.log(`    Total chunks: ${jsChunks.length}`);
  console.log(`    Soma total:   ${fmtKb(totalSize)} (${fmtBytes(totalSize)})`);
  if (largest) {
    console.log(`    Maior chunk:  ${fmtKb(largest.size)}  —  ${largest.relPath}`);
  }
  console.log('');

  // Check largest chunk
  if (largest && largest.size > cfg.maxChunkBytes) {
    const over = largest.size - cfg.maxChunkBytes;
    failures.push(
      `Largest chunk ${largest.relPath} = ${fmtKb(largest.size)} ` +
        `(budget: ${fmtKb(cfg.maxChunkBytes)}, over by ${fmtKb(over)})`,
    );
  }

  // Check total
  if (totalSize > cfg.maxTotalBytes) {
    const over = totalSize - cfg.maxTotalBytes;
    failures.push(
      `Total JS bundles = ${fmtKb(totalSize)} ` +
        `(budget: ${fmtKb(cfg.maxTotalBytes)}, over by ${fmtKb(over)})`,
    );
  }

  if (failures.length === 0) {
    console.log('  ✅ DENTRO DO BUDGET');
    if (largest) {
      const headroom = ((1 - largest.size / cfg.maxChunkBytes) * 100).toFixed(1);
      console.log(`     Headroom no maior chunk: ${headroom}%`);
    }
    const totalHeadroom = ((1 - totalSize / cfg.maxTotalBytes) * 100).toFixed(1);
    console.log(`     Headroom no total: ${totalHeadroom}%`);
    return { ok: true, failures };
  }

  console.log('  ❌ BUDGET ESTOURADO:');
  for (const f of failures) {
    console.log(`     - ${f}`);
  }
  return { ok: false, failures };
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

async function main() {
  let cfg: BudgetConfig;
  try {
    cfg = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`❌ Erro nos argumentos: ${(err as Error).message}`);
    console.error('');
    console.error('Uso: pnpm check:bundle [--max-chunk=BYTES] [--max-total=BYTES] [--dir=PATH]');
    // Encerrar com exit 2 = erro de uso (distinto de budget overflow = 1)
    process.exit(2);
    return;
  }

  printHeader(cfg);

  let all: ChunkInfo[];
  try {
    all = await walkDir(cfg.rootDir, cfg.rootDir);
  } catch (err) {
    console.error(`❌ ${(err as Error).message}`);
    process.exit(2);
    return;
  }

  if (all.length === 0) {
    console.error(`❌ Nenhum arquivo encontrado em ${cfg.rootDir}`);
    console.error('   Rode `pnpm build` antes de `pnpm check:bundle`.');
    process.exit(2);
    return;
  }

  // Budget aplica apenas a .js/.mjs (CSS tem budget separado, fora deste gate).
  const jsChunks = all.filter((c) => c.kind === 'js');
  const totalSize = jsChunks.reduce((acc, c) => acc + c.size, 0);
  const largest = jsChunks.length > 0
    ? jsChunks.reduce((max, c) => (c.size > max.size ? c : max), jsChunks[0])
    : null;

  // Print top 5 maiores (de TODOS os arquivos, incluindo CSS/maps para visibilidade)
  printTopChunks(all, 5);

  const { ok } = printSummary(jsChunks, totalSize, largest, cfg);
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error('❌ Erro inesperado:', err);
  process.exit(2);
});
