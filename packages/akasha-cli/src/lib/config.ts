import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

interface Config {
  databaseUrl?: string;
  openaiApiKey?: string;
}

export interface ConfigStatus {
  ok: boolean;
  configured: boolean;
  configPath?: string;
  error?: string;
  message?: string;
}

function getConfigPath(): string {
  return join(homedir(), '.akasha', 'config.json');
}

function loadConfig(): Config | null {
  const configPath = getConfigPath();
  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function getConfigStatus(): Promise<ConfigStatus> {
  const configPath = getConfigPath();
  const exists = existsSync(configPath);

  return {
    ok: exists,
    configured: exists,
    configPath,
    message: exists ? 'Configuração encontrada' : undefined,
    error: exists ? undefined : 'Arquivo de configuração não encontrado',
  };
}

export function getConfig(): Config | null {
  return loadConfig();
}

export function isConfigured(): boolean {
  return existsSync(getConfigPath());
}
