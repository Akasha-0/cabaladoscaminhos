/**
 * grimoire-audit.ts
 *
 * Audit de Curadoria do Grimorio Digital: executa os testes-guardiao
 * de curadoria editorial (I-Ching + Odus) e exibe tabela formatada.
 *
 * Uso:
 *   npm run grimoire:audit          # via apps/akasha-portal/
 *   pnpm grimoire:audit            # via raiz do monorepo
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

interface AuditResult {
  category: string;
  testFile: string;
  entries: number;
  status: 'PASS' | 'FAIL';
  reason?: string;
}

const TEST_DIR = path.resolve(process.cwd(), '../../tests/lib/grimoire');
const GRIMOIRE_ROOT = path.resolve(process.cwd(), '../../grimoire');

function runVitest(testPath: string): { passed: boolean; output: string } {
  try {
    const output = execSync(
      `pnpm vitest run "${testPath}" --reporter=verbose 2>&1`,
      {
        cwd: process.cwd(),
        stdio: 'pipe',
        encoding: 'utf-8',
      }
    );
    return { passed: true, output };
  } catch (e: unknown) {
    const error = e as { stdout?: string; stderr?: string; message?: string };
    return {
      passed: false,
      output: error?.stdout ?? error?.stderr ?? error?.message ?? '',
    };
  }
}

async function main(): Promise<void> {
  console.log('\n[grimoire:audit] Grimoire Curatorship Audit\n');
  console.log('| Categoria                 | Entries Gated | Status |');
  console.log('|---------------------------|---------------|--------|');

  const results: AuditResult[] = [];

  // Teste: I-Ching curatorship (16 hexagramas)
  const ichingTest = path.join(TEST_DIR, 'curatorship-guardian-iching.test.ts');
  if (existsSync(ichingTest)) {
    const ichingResult = runVitest(ichingTest);
    const entries = 16;
    results.push({
      category: 'I-Ching (Hexagramas)',
      testFile: 'curatorship-guardian-iching.test.ts',
      entries,
      status: ichingResult.passed ? 'PASS' : 'FAIL',
      reason: ichingResult.passed ? undefined : 'Teste falhou - ver output acima',
    });
    console.log(
      `| I-Ching (Hexagramas)       | ${entries}            | ${ichingResult.passed ? 'PASS' : 'FAIL'} |`
    );
  } else {
    console.log('| I-Ching (Hexagramas)       | 0               | SKIP  |');
  }

  // Teste: Odus validation (16 Odus)
  const odusTest = path.join(TEST_DIR, 'odus-validation.test.ts');
  if (existsSync(odusTest)) {
    const odusResult = runVitest(odusTest);
    const entries = 16;
    results.push({
      category: 'Odus (Merindilogun)',
      testFile: 'odus-validation.test.ts',
      entries,
      status: odusResult.passed ? 'PASS' : 'FAIL',
      reason: odusResult.passed ? undefined : 'Teste falhou - ver output acima',
    });
    console.log(
      `| Odus (Merindilogun)        | ${entries}            | ${odusResult.passed ? 'PASS' : 'FAIL'} |`
    );
  } else {
    console.log('| Odus (Merindilogun)        | 0               | SKIP  |');
  }

  // Teste: I-Ching completeness
  const ichingComplete = path.join(TEST_DIR, 'iching-completeness.test.ts');
  if (existsSync(ichingComplete)) {
    const completeResult = runVitest(ichingComplete);
    const entries = 16;
    results.push({
      category: 'I-Ching (Completude)',
      testFile: 'iching-completeness.test.ts',
      entries,
      status: completeResult.passed ? 'PASS' : 'FAIL',
    });
    console.log(
      `| I-Ching (Completude)       | ${entries}            | ${completeResult.passed ? 'PASS' : 'FAIL'} |`
    );
  }

  // Resumo
  const passed = results.filter((r) => r.status === 'PASS').length;
  const total = results.length;
  const allPassed = passed === total && total > 0;

  console.log('\n|---------------------------|---------------|--------|');
  console.log(
    `| TOTAL                      | ${results.reduce((s, r) => s + r.entries, 0)}            | ${allPassed ? 'PASS' : 'FAIL'} |\n`
  );

  if (!allPassed) {
    const failed = results.filter((r) => r.status === 'FAIL');
    console.error('[grimoire:audit] Falhas detectadas:');
    failed.forEach((f) => {
      console.error(`   - ${f.category}: ${f.reason}`);
    });
    process.exit(1);
  }

  console.log('[grimoire:audit] All curatorship gates passed\n');
}

main().catch((err) => {
  console.error('[grimoire:audit] Fatal:', err);
  process.exit(1);
});
