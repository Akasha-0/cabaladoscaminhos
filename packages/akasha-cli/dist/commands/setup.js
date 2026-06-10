import { exec } from 'child_process';
import { promisify } from 'util';
import pc from 'picocolors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export async function setup(options = {}) {
    const { force = false } = options;
    console.log(`${pc.cyan('🔮 [Akasha Setup]')} Iniciando configuração...`);
    console.log();
    if (force) {
        console.log(pc.yellow('⚠ Modo force ativo - recursos existentes serão sobrescritos'));
        console.log();
    }
    const scriptPath = join(__dirname, '../../../../scripts/akasha-setup.sh');
    // Verificar se o script existe
    if (!existsSync(scriptPath)) {
        console.error(pc.red(`❌ Script de setup não encontrado: ${scriptPath}`));
        process.exit(1);
    }
    try {
        console.log(pc.dim(`Executando: ${scriptPath}`));
        console.log();
        const flags = force ? '--force' : '';
        const { stdout, stderr } = await execAsync(`bash "${scriptPath}" ${flags}`.trim(), {
            cwd: join(__dirname, '../../../../'),
        });
        if (stdout) {
            console.log(stdout);
        }
        if (stderr) {
            console.error(pc.yellow(stderr));
        }
        console.log();
        console.log(pc.green('✅ Setup concluído com sucesso!'));
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(pc.red(`❌ Erro ao executar setup: ${errorMessage}`));
        process.exit(1);
    }
}
//# sourceMappingURL=setup.js.map