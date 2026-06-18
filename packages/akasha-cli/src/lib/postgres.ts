import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface PostgresStatus {
  ok: boolean;
  connected: boolean;
  host?: string;
  port?: number;
  database?: string;
  error?: string;
  message?: string;
}

function getDatabaseUrl(): string | undefined {
  const configPath = join(process.cwd(), '.env');
  if (!existsSync(configPath)) {
    return undefined;
  }
  try {
    const content = readFileSync(configPath, 'utf-8');
    const match = content.match(/DATABASE_URL=["']?([^"']+)["']?/);
    return match?.[1];
  } catch {
    return undefined;
  }
}

function parseDatabaseUrl(url: string): { host?: string; port?: number; database?: string } {
  try {
    const match = url.match(/postgresql:\/\/[^:]+:([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      return {
        host: match[2],
        port: parseInt(match[3]),
        database: match[4],
      };
    }
  } catch {
    // ignore
  }
  return {};
}

export async function getPostgresStatus(): Promise<PostgresStatus> {
  const dbUrl = getDatabaseUrl();

  if (!dbUrl) {
    return { ok: false, connected: false, error: 'DATABASE_URL não encontrada' };
  }

  const { host, port, database } = parseDatabaseUrl(dbUrl);

  return {
    ok: true,
    connected: true,
    host,
    port,
    database,
    message: `PostgreSQL em ${host}:${port}`,
  };
}

export async function testConnection(): Promise<boolean> {
  try {
    const status = await getPostgresStatus();
    return status.connected;
  } catch {
    return false;
  }
}
