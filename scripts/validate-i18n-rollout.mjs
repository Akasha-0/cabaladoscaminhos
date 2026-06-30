#!/usr/bin/env node
// ============================================================================
// validate-i18n-rollout.mjs — CLI para validação CI-grade de traduções W93
// ============================================================================
// Lê src/lib/w93/i18n-rollout-strings.ts via tsx (eval dinâmico) e roda
// validateRolloutTranslations() do engine. Usado em pre-commit + CI.
//
// CHECKS (delegados a validateRolloutTranslations):
//   1. Toda chave em pt-BR existe em en e es
//   2. Nenhuma string vazia
//   3. Nenhum placeholder TODO/FIXME
//   4. Variáveis de interpolação consistentes entre locales
//   5. Para cada X, se existir X+"Plural", vars devem ser consistentes
//
// EXIT CODES:
//   0 = ✅ todos os checks passaram (>=80 keys × 3 locales = 240+ traduções)
//   1 = ❌ um ou mais erros
//   2 = ⚠️  erro de infra (arquivo não encontrado, eval falhou)
//
// USAGE:
//   node scripts/validate-i18n-rollout.mjs
//   node scripts/validate-i18n-rollout.mjs --json
//
// DURABLE PATTERN (cycle W92-C/W93-C):
//   - import dinâmico via tsx se disponível, fallback para child_process
//   - report format amigável para humanos + máquina (JSON opcional)
// ============================================================================

import { existsSync, writeFileSync, unlinkSync, mkdtempSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

const STRINGS_FILE = resolve(PROJECT_ROOT, 'src/lib/w93/i18n-rollout-strings.ts');
const ENGINE_FILE = resolve(PROJECT_ROOT, 'src/lib/w93/i18n-rollout-engine.ts');

const args = new Set(process.argv.slice(2));
const JSON_OUTPUT = args.has('--json');

function log(msg) {
  if (!JSON_OUTPUT) console.log(msg);
}

/**
 * Carrega validateRolloutTranslations() rodando um sub-processo node --import tsx
 * com um script shim que importa e exporta o resultado.
 */
function runValidation() {
  if (!existsSync(STRINGS_FILE)) {
    return { ok: false, infra: true, errors: [`STRINGS file not found: ${STRINGS_FILE}`] };
  }
  if (!existsSync(ENGINE_FILE)) {
    return { ok: false, infra: true, errors: [`ENGINE file not found: ${ENGINE_FILE}`] };
  }

  // Shim que importa validateRolloutTranslations e imprime JSON em stdout.
  // Por que arquivo (e não -e inline): tsx loader só é aplicado a arquivos.
  const tmpDir = mkdtempSync(join(tmpdir(), 'w93-validate-'));
  const shimPath = join(tmpDir, 'validate.mts');
  const shim = `import { validateRolloutTranslations } from ${JSON.stringify(ENGINE_FILE)};\n` +
    `const r = validateRolloutTranslations();\n` +
    `process.stdout.write(JSON.stringify(r));\n`;
  writeFileSync(shimPath, shim, 'utf-8');

  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', shimPath],
    {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 30_000,
      env: { ...process.env, NODE_NO_WARNINGS: '1' },
    },
  );

  // Cleanup do shim (best-effort)
  try { unlinkSync(shimPath); } catch { /* ignore */ }

  if (result.error) {
    return { ok: false, infra: true, errors: [`spawn error: ${result.error.message}`] };
  }
  if (result.status !== 0) {
    return {
      ok: false,
      infra: true,
      errors: [
        `tsc-eval exited with code ${result.status}`,
        `stdout: ${result.stdout?.slice(0, 500) ?? ''}`,
        `stderr: ${result.stderr?.slice(0, 500) ?? ''}`,
      ],
    };
  }

  try {
    return JSON.parse(result.stdout);
  } catch (e) {
    return {
      ok: false,
      infra: true,
      errors: [`Failed to parse validation JSON: ${e instanceof Error ? e.message : String(e)}`],
    };
  }
}

function main() {
  log('');
  log('🌐 W93 i18n Rollout — Validator');
  log('━'.repeat(50));
  log(`📁 Strings:    ${STRINGS_FILE.replace(PROJECT_ROOT + '/', '')}`);
  log(`📁 Engine:     ${ENGINE_FILE.replace(PROJECT_ROOT + '/', '')}`);
  log('');

  const result = runValidation();

  if (result.infra) {
    log('❌ Infrastructure error');
    for (const err of result.errors ?? []) {
      log(`   ${err}`);
    }
    process.exit(2);
  }

  if (result.ok) {
    const stats = result.stats;
    const totalTranslations = stats.totalKeys * stats.locales.length;
    log('✅ All translation checks passed');
    log(`   • ${stats.totalKeys} keys`);
    log(`   • ${stats.locales.length} locales (${stats.locales.join(', ')})`);
    log(`   • ${totalTranslations} traduções curadas (${stats.totalKeys} × ${stats.locales.length})`);
    log('');
    if (JSON_OUTPUT) {
      console.log(JSON.stringify(result, null, 2));
    }
    process.exit(0);
  }

  log('❌ Validation failed');
  log(`   ${result.errors.length} error(s):`);
  log('');
  for (const err of result.errors) {
    log(`   • ${err}`);
  }
  log('');
  if (JSON_OUTPUT) {
    console.log(JSON.stringify(result, null, 2));
  }
  process.exit(1);
}

main();