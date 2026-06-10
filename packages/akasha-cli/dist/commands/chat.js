import pc from 'picocolors';
import { runChat } from '../tui/chat.js';
export async function chat(query) {
    if (query) {
        console.log(`${pc.cyan('[Akasha]')} ${pc.bold('Modo one-shot')}`);
        console.log(`${pc.dim('Pergunta:')} ${query}`);
        console.log(`${pc.yellow('[Resposta stubs - implementação futura com streaming]')}`);
        return;
    }
    // Modo interativo TUI
    try {
        await runChat({ version: '0.0.17' });
    }
    catch (error) {
        if (error.message.includes('TTY')) {
            console.error(`${pc.red('Erro:')} Este comando requer um terminal interativo.`);
            console.log(`${pc.dim('Use: akasha -q "sua pergunta"')} para modo não-interativo.`);
            process.exit(1);
        }
        throw error;
    }
}
//# sourceMappingURL=chat.js.map