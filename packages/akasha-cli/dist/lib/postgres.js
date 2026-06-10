import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
function getDatabaseUrl() {
    const configPath = join(process.cwd(), '.env');
    if (!existsSync(configPath)) {
        return undefined;
    }
    try {
        const content = readFileSync(configPath, 'utf-8');
        const match = content.match(/DATABASE_URL=["']?([^"']+)["']?/);
        return match?.[1];
    }
    catch {
        return undefined;
    }
}
function parseDatabaseUrl(url) {
    try {
        const match = url.match(/postgresql:\/\/[^:]+:([^@]+)@([^:]+):(\d+)\/(.+)/);
        if (match) {
            return {
                host: match[2],
                port: parseInt(match[3]),
                database: match[4],
            };
        }
    }
    catch {
        // ignore
    }
    return {};
}
export async function getPostgresStatus() {
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
export async function testConnection() {
    try {
        const status = await getPostgresStatus();
        return status.connected;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=postgres.js.map