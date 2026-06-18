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
    const output = execSync(`pnpm vitest run "${testPath}" --reporter=verbose 2>&1`, {
      cwd: process.cwd(),
      stdio: 'pipe',
      encoding: 'utf-8',
    });
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
  const results: AuditResult[] = [];

  // Teste: I-Ching curatorship (16 hexagramas)
  const ichingTest = path.join(TEST_DIR, 'curatorship-guardian-iching.test.ts');
  if (existsSync(ichingTest)) {
    const ichingResult = runVitest(ichingTest);
    results.push({
      category: 'I-Ching (Hexagramas)',
      testFile: 'curatorship-guardian-iching.test.ts',
      entries: 16,
      status: ichingResult.passed ? 'PASS' : 'FAIL',
      reason: ichingResult.passed ? undefined : 'Teste falhou - ver output acima',
    });
  }

  // Teste: Odus validation (16 Odus)
  const odusTest = path.join(TEST_DIR, 'odus-validation.test.ts');
  if (existsSync(odusTest)) {
    const odusResult = runVitest(odusTest);
    results.push({
      category: 'Odus (Merindilogun)',
      testFile: 'odus-validation.test.ts',
      entries: 16,
      status: odusResult.passed ? 'PASS' : 'FAIL',
      reason: odusResult.passed ? undefined : 'Teste falhou - ver output acima',
    });
  }

  // Teste: I-Ching completeness
  const ichingComplete = path.join(TEST_DIR, 'iching-completeness.test.ts');
  if (existsSync(ichingComplete)) {
    const completeResult = runVitest(ichingComplete);
    results.push({
      category: 'I-Ching (Completude)',
      testFile: 'iching-completeness.test.ts',
      entries: 16,
      status: completeResult.passed ? 'PASS' : 'FAIL',
    });
  }

  const passed = results.filter((r) => r.status === 'PASS').length;
  const total = results.length;
  const allPassed = passed === total && total > 0;

  if (!allPassed) {
    const failed = results.filter((r) => r.status === 'FAIL');
    console.error('[grimoire:audit] Falhas detectadas:');
    failed.forEach((f) => {
      console.error(`   - ${f.category}: ${f.reason}`);
    });
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[grimoire:audit] Fatal:', err);
  process.exit(1);
});
