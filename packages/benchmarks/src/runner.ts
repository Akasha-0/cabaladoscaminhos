#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * @akasha/benchmarks — runner.ts (CLI)
 *
 * Akasha Universalism Test (AUT) — Wave 31.3 MVP.
 *
 * Uso:
 *   pnpm exec benchmarks run [--verbose] [--json] [--filter <substring>] [--threshold <n>]
 *
 * Saída:
 *   - tabela com score por exemplo (id, composite, criteria)
 *   - aggregate (média, min/max, taxa de aprovação)
 *   - exit code 0 se AUT ≥ threshold (default 60), 1 caso contrário
 */

import { SYNTHETIC_DATASET, runDataset, type AutExample } from './datasets/synthetic';
import { aggregateAutResults, type AutScore } from './aut';

// -----------------------------------------------------------------------------
// Argument parsing
// -----------------------------------------------------------------------------

interface CliOptions {
  verbose: boolean;
  json: boolean;
  filter: string | null;
  threshold: number;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    verbose: false,
    json: false,
    filter: null,
    threshold: 60,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--verbose' || arg === '-v') opts.verbose = true;
    else if (arg === '--json') opts.json = true;
    else if (arg === '--filter' && argv[i + 1]) {
      opts.filter = argv[i + 1];
      i++;
    } else if (arg === '--threshold' && argv[i + 1]) {
      const t = Number.parseInt(argv[i + 1], 10);
      if (!Number.isNaN(t)) opts.threshold = t;
      i++;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  return opts;
}

function printHelp(): void {
  console.log(`akasha-benchmarks — AUT (Akasha Universalism Test) runner

Uso:
  akasha-benchmarks run [--verbose] [--json] [--filter <substring>] [--threshold <n>]

Opções:
  --verbose, -v        Exibe todos os critérios + evidências
  --json               Saída em JSON (parseável)
  --filter <substring> Roda apenas exemplos cujo id contém <substring>
  --threshold <n>      Score mínimo para aprovação (default 60)
  --help, -h           Esta ajuda
`);
}

// -----------------------------------------------------------------------------
// Formatação
// -----------------------------------------------------------------------------

function pad(s: string | number, n: number, right = false): string {
  const str = String(s);
  if (str.length >= n) return str;
  const fill = ' '.repeat(n - str.length);
  return right ? fill + str : str + fill;
}

function colorScore(n: number): string {
  if (n >= 80) return '\x1b[32m' + n + '\x1b[0m'; // green
  if (n >= 60) return '\x1b[33m' + n + '\x1b[0m'; // yellow
  return '\x1b[31m' + n + '\x1b[0m'; // red
}

function printTable(
  results: AutScore[],
  examples: Map<string, AutExample>,
  opts: CliOptions,
): void {
  const header = [
    pad('ID', 36),
    pad('UC', 5, true),
    pad('VR', 5, true),
    pad('PA', 5, true),
    pad('CV', 5, true),
    pad('COMP', 6, true),
    pad('STATUS', 8),
  ].join(' ');
  console.log(header);
  console.log('-'.repeat(header.length));
  for (const r of results) {
    const ex = examples.get(
      // Recover id by matching response/input (best effort)
      findExampleIdByResponse(examples, r.response),
    );
    const id = ex?.id ?? '(unknown)';
    const uc = r.criteria.coerencia_universal.score100;
    const vr = r.criteria.raciocinio_visivel.score100;
    const pa = r.criteria.pilar_alinhamento.score100;
    const cv = r.criteria.convergencia.score100;
    const comp = r.composite100;
    const status = comp >= opts.threshold ? 'PASS' : 'FAIL';
    console.log(
      [
        pad(id, 36),
        pad(colorScore(uc), 5 + (uc >= 10 ? 9 : 10), true),
        pad(colorScore(vr), 5 + (vr >= 10 ? 9 : 10), true),
        pad(colorScore(pa), 5 + (pa >= 10 ? 9 : 10), true),
        pad(colorScore(cv), 5 + (cv >= 10 ? 9 : 10), true),
        pad(colorScore(comp), 6 + (comp >= 10 ? 9 : 10), true),
        pad(status, 8),
      ].join(' '),
    );
  }
  console.log('-'.repeat(header.length));

  if (opts.verbose) {
    console.log('\nDetalhes:');
    for (const r of results) {
      const ex = examples.get(findExampleIdByResponse(examples, r.response));
      console.log(`\n[${ex?.id ?? '?'}] composite=${r.composite100}`);
      for (const c of Object.values(r.criteria)) {
        console.log(
          `  ${pad(c.name, 22)} ${c.score100}/100  evidence=${c.evidence.length}  violations=${c.violations.length}`,
        );
        for (const e of c.evidence) console.log(`     + ${e}`);
        for (const v of c.violations) console.log(`     ! ${v}`);
      }
    }
  }
}

function findExampleIdByResponse(
  examples: Map<string, AutExample>,
  response: string,
): string {
  for (const [id, ex] of examples) {
    if (ex.response === response) return id;
  }
  return '(unknown)';
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const opts = parseArgs(argv);

  // Subcommand "run" é default; aceita também sem subcommand
  let dataset = SYNTHETIC_DATASET;
  if (argv[0] && argv[0] !== 'run') {
    console.error(`Unknown subcommand: ${argv[0]}`);
    printHelp();
    process.exit(2);
  }

  if (opts.filter) {
    dataset = dataset.filter((ex) => ex.id.includes(opts.filter!));
    if (dataset.length === 0) {
      console.error(`No examples match filter: ${opts.filter}`);
      process.exit(2);
    }
  }

  const { results, exampleMap } = runDataset(dataset);

  if (opts.json) {
    const report = {
      threshold: opts.threshold,
      aggregate: aggregateAutResults(results, opts.threshold),
      results,
    };
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\n🌀 AUT — Akasha Universalism Test (Wave 31.3 MVP)`);
    console.log(`   ${results.length} exemplos | threshold=${opts.threshold}\n`);
    printTable(results, exampleMap, opts);
    const agg = aggregateAutResults(results, opts.threshold);
    console.log(`\n📊 Agregado:`);
    console.log(`   composite  mean=${agg.compositeMean}  min=${agg.compositeMin}  max=${agg.compositeMax}`);
    console.log(
      `   critérios  UC=${agg.criteriaMeans.coerencia_universal.toFixed(1)}  VR=${agg.criteriaMeans.raciocinio_visivel.toFixed(1)}  PA=${agg.criteriaMeans.pilar_alinhamento.toFixed(1)}  CV=${agg.criteriaMeans.convergencia.toFixed(1)}`,
    );
    console.log(
      `   aprovação  ${agg.passedAtThreshold}/${agg.count} passaram  |  ${agg.totalViolations} violações totais`,
    );

    if (agg.compositeMean >= opts.threshold) {
      console.log(`\n✅ PASS — composite mean ≥ threshold (${opts.threshold})`);
      process.exit(0);
    } else {
      console.log(`\n❌ FAIL — composite mean < threshold (${opts.threshold})`);
      process.exit(1);
    }
  }
}

// ESM/tsx detection
const isDirectRun =
  typeof require !== 'undefined' && require.main === module;
if (isDirectRun) {
  main().catch((err) => {
    console.error('Runner failed:', err);
    process.exit(2);
  });
}

export { main, parseArgs };