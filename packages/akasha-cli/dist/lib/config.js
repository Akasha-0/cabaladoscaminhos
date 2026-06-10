import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
function getConfigPath() {
    return join(homedir(), '.akasha', 'config.json');
}
function loadConfig() {
    const configPath = getConfigPath();
    if (!existsSync(configPath)) {
        return null;
    }
    try {
        const content = readFileSync(configPath, 'utf-8');
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
export async function getConfigStatus() {
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
export function getConfig() {
    return loadConfig();
}
export function isConfigured() {
    return existsSync(getConfigPath());
}
//# sourceMappingURL=config.js.map