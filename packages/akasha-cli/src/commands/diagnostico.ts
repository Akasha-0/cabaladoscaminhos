import pc from 'picocolors';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

interface DiagnosticResult {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  suggestion?: string;
}

async function checkNode(): Promise<DiagnosticResult> {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);

  if (major >= 18) {
    return { name: 'Node.js', status: 'ok', message: `v${version.slice(1)}` };
  }
  return {
    name: 'Node.js',
    status: 'error',
    message: `v${version.slice(1)} (mínimo: v18)`,
    suggestion: 'Atualize para Node.js 18+ via nvm ou site oficial'
  };
}

async function checkPnpm(): Promise<DiagnosticResult> {
  try {
    const { stdout } = await execAsync('pnpm --version', { timeout: 5000 });
    const version = stdout.trim();
    const major = parseInt(version.split('.')[0]);

    if (major >= 8) {
      return { name: 'pnpm', status: 'ok', message: `v${version}` };
    }
    return {
      name: 'pnpm',
      status: 'warning',
      message: `v${version} (recomendado: v8+)`,
      suggestion: 'Considere atualizar: npm install -g pnpm'
    };
  } catch {
    return {
      name: 'pnpm',
      status: 'error',
      message: 'Não encontrado',
      suggestion: 'Instale: npm install -g pnpm'
    };
  }
}

async function checkPostgres(): Promise<DiagnosticResult> {
  try {
    const { stdout } = await execAsync('psql --version', { timeout: 5000 });
    const match = stdout.match(/psql \(PostgreSQL\) (\d+)/);
    const version = match ? match[1] : stdout.trim();

    return { name: 'PostgreSQL', status: 'ok', message: `PostgreSQL ${version}` };
  } catch {
    return {
      name: 'PostgreSQL',
      status: 'error',
      message: 'Não encontrado ou não acessível',
      suggestion: 'Execute: akasha setup'
    };
  }
}

async function checkEnvFile(): Promise<DiagnosticResult> {
  const envPath = join(process.cwd(), '.env.local');
  const altEnvPath = join(process.cwd(), '.env');

  const envFile = existsSync(envPath) ? envPath : existsSync(altEnvPath) ? altEnvPath : null;

  if (!envFile) {
    return {
      name: 'Arquivo .env',
      status: 'error',
      message: 'Nenhum arquivo de ambiente encontrado',
      suggestion: 'Execute: akasha setup'
    };
  }

  try {
    const content = readFileSync(envFile, 'utf-8');
    const hasDatabaseUrl = /DATABASE_URL\s*=/.test(content);

    if (hasDatabaseUrl) {
      return { name: 'Arquivo .env', status: 'ok', message: 'DATABASE_URL configurado' };
    }

    return {
      name: 'Arquivo .env',
      status: 'error',
      message: 'DATABASE_URL não encontrado',
      suggestion: 'Adicione DATABASE_URL ao arquivo .env'
    };
  } catch {
    return {
      name: 'Arquivo .env',
      status: 'error',
      message: 'Erro ao ler arquivo',
      suggestion: 'Verifique as permissões do arquivo'
    };
  }
}

async function checkMigrations(): Promise<DiagnosticResult> {
  const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
  const migrationsDir = join(process.cwd(), 'prisma', 'migrations');

  if (!existsSync(schemaPath)) {
    return {
      name: 'Prisma Schema',
      status: 'warning',
      message: 'schema.prisma não encontrado',
      suggestion: 'Verifique se o projeto está configurado corretamente'
    };
  }

  if (!existsSync(migrationsDir)) {
    return {
      name: 'Migrations',
      status: 'warning',
      message: 'Nenhuma migration encontrada',
      suggestion: 'Execute: npx prisma migrate dev --name init'
    };
  }

  return { name: 'Migrations', status: 'ok', message: 'Migrations encontradas' };
}

async function checkDependencies(): Promise<DiagnosticResult> {
  const nodeModulesPath = join(process.cwd(), 'node_modules');

  if (!existsSync(nodeModulesPath)) {
    return {
      name: 'Dependências',
      status: 'error',
      message: 'node_modules não encontrado',
      suggestion: 'Execute: pnpm install'
    };
  }

  try {
    const { stdout } = await execAsync('pnpm list --depth 0 2>/dev/null || echo ""', { timeout: 10000 });
    const depsCount = (stdout.match(/\n/g) || []).length;

    if (depsCount > 0) {
      return { name: 'Dependências', status: 'ok', message: `${depsCount} dependências instaladas` };
    }
    return { name: 'Dependências', status: 'warning', message: 'Verificação inconclusiva' };
  } catch {
    return { name: 'Dependências', status: 'warning', message: 'Verificação inconclusiva' };
  }
}

export async function diagnostico(): Promise<void> {
  console.log();
  console.log(pc.bold(pc.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')));
  console.log(pc.bold(pc.cyan('  🔍  Diagnóstico Completo do Sistema')));
  console.log(pc.bold(pc.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')));
  console.log();

  const results: DiagnosticResult[] = [];

  const checks = [
    checkNode(),
    checkPnpm(),
    checkPostgres(),
    checkEnvFile(),
    checkMigrations(),
    checkDependencies(),
  ];

  for (const check of checks) {
    const result = await check;
    results.push(result);
  }

  // Mostrar resultados
  for (const result of results) {
    const icon = result.status === 'ok' ? pc.green('✓') :
                 result.status === 'warning' ? pc.yellow('!') :
                 pc.red('✗');

    const statusColor = result.status === 'ok' ? pc.green :
                         result.status === 'warning' ? pc.yellow : pc.red;

    console.log(`  ${icon} ${pc.bold(result.name)}`);
    console.log(`     ${statusColor(result.message)}`);
    if (result.suggestion) {
      console.log(`     ${pc.dim('→')} ${pc.cyan(result.suggestion)}`);
    }
    console.log();
  }

  // Resumo
  const errors = results.filter(r => r.status === 'error').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  console.log(pc.bold(pc.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')));
  console.log();

  if (errors === 0 && warnings === 0) {
    console.log(pc.green('  ✅ Sistema OK!'));
  } else if (errors === 0) {
    console.log(pc.yellow(`  ⚠ ${warnings} warning(s) encontrado(s)`));
  } else {
    console.log(pc.red(`  ❌ ${errors} erro(s) e ${warnings} warning(s)`));
  }
  console.log();
}
