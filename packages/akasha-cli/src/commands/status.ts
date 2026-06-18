import { existsSync } from 'fs';
import { join } from 'path';
import pc from 'picocolors';
import { getConfigStatus } from '../lib/config.js';
import { getPostgresStatus } from '../lib/postgres.js';

const VERSION = '0.0.17';

export interface SystemStatus {
  version: string;
  postgres: 'ok' | 'error' | 'not_found';
  env: 'ok' | 'missing';
  migrations: 'ok' | 'pending' | 'error';
}

async function checkMigrations(): Promise<'ok' | 'pending' | 'error'> {
  try {
    const migrationsDir = join(process.cwd(), 'prisma', 'migrations');
    const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');

    if (!existsSync(schemaPath)) {
      return 'error';
    }

    if (!existsSync(migrationsDir)) {
      return 'pending';
    }

    return 'ok';
  } catch {
    return 'error';
  }
}

export async function getStatus(): Promise<SystemStatus> {
  const [pgStatus, configStatus, migrationsStatus] = await Promise.all([
    getPostgresStatus(),
    getConfigStatus(),
    checkMigrations(),
  ]);

  return {
    version: VERSION,
    env: configStatus.configured ? 'ok' : 'missing',
    postgres: pgStatus.connected ? 'ok' : pgStatus.error ? 'error' : 'not_found',
    migrations: migrationsStatus,
  };
}

export async function status(): Promise<void> {
  const status = await getStatus();

  // Versão
  const versionLine = `  ${pc.dim('Versão:')} ${pc.white(status.version)}`;

  // PostgreSQL
  const pgIcon = status.postgres === 'ok' ? pc.green('✓') : pc.red('✗');
  const pgLabel =
    status.postgres === 'ok'
      ? pc.green('Conectado')
      : status.postgres === 'not_found'
        ? pc.yellow('Não encontrado')
        : pc.red('Erro');
  const pgLine = `  ${pgIcon} ${pc.bold('PostgreSQL:')} ${pgLabel}`;

  // Configuração
  const envIcon = status.env === 'ok' ? pc.green('✓') : pc.red('✗');
  const envLabel = status.env === 'ok' ? pc.green('Configurado') : pc.red('Não configurado');
  const envLine = `  ${envIcon} ${pc.bold('Configuração:')} ${envLabel}`;

  // Migrations
  const migIcon =
    status.migrations === 'ok'
      ? pc.green('✓')
      : status.migrations === 'pending'
        ? pc.yellow('!')
        : pc.red('✗');
  const migLabel =
    status.migrations === 'ok'
      ? pc.green('OK')
      : status.migrations === 'pending'
        ? pc.yellow('Pendentes')
        : pc.red('Erro');
  const migLine = `  ${migIcon} ${pc.bold('Migrations:')} ${migLabel}`;

  const divider = pc.bold(pc.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  const header = [
    '',
    divider,
    pc.bold(pc.cyan('  📊  Status do Sistema Akasha')),
    divider,
    '',
    versionLine,
    '',
    pgLine,
    envLine,
    migLine,
    '',
    divider,
    '',
  ].join('\n');

  process.stdout.write(header + '\n');
}
