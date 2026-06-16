/**
 * Run Quality Evals - Executa todos os evals e gera relatório
 * NOTE: Run with: ./node_modules/.bin/tsx scripts/run-quality-eval.ts
 */

import { runAllEvals } from '../src/lib/quality/runner.js'

async function main() {
  const report = await runAllEvals({
    output: 'console',
    verbose: false,
  })

  if (report) {
    if (report.score < 70) {
      process.exit(1)
    }
  } else {
    console.error('\n❌ Falha ao gerar relatório')
    process.exit(1)
  }
}

main().catch(console.error)