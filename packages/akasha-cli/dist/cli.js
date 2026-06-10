#!/usr/bin/env node
import pc from 'picocolors';
import { chat } from './commands/chat.js';
import { setup } from './commands/setup.js';
import { status } from './commands/status.js';
import { diagnostico } from './commands/diagnostico.js';
const VERSION = '0.0.17';
export function parseArgs(argv) {
    const args = {};
    const commands = argv.slice(2);
    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        if (cmd === '--help' || cmd === '-h') {
            args.help = true;
        }
        else if (cmd === '--version' || cmd === '-v') {
            args.version = true;
        }
        else if (cmd === '--force' || cmd === '-f') {
            args.force = true;
        }
        else if (cmd === '-q' || cmd === '--query') {
            args.query = commands[++i];
        }
        else if (['chat', 'setup', 'status', 'diagnostico', 'version'].includes(cmd)) {
            args.command = cmd;
        }
        else if (cmd.startsWith('-')) {
            console.error(`${pc.red('Erro:')} Opção desconhecida: ${cmd}`);
            process.exit(1);
        }
        else {
            args.command = 'chat';
            args.query = cmd;
        }
    }
    return args;
}
export function printHelp() {
    console.log(`
${pc.bold(pc.cyan('Akasha CLI'))} - Sistema Espiritual Interativo

${pc.bold('Uso:')}
  akasha [comando] [opções]

${pc.bold('Comandos:')}
  ${pc.green('chat')}           Inicia chat interativo (padrão)
  ${pc.green('setup')}          Executa configuração inicial
  ${pc.green('status')}         Mostra status do sistema
  ${pc.green('diagnostico')}    Executa diagnóstico completo
  ${pc.green('version')}        Mostra versão
  ${pc.green('help')}           Mostra esta ajuda

${pc.bold('Opções:')}
  -q, --query <texto>  Executa pergunta em modo one-shot
  -f, --force          Força execução (ex: akasha setup --force)
  -h, --help           Mostra esta ajuda
  -v, --version        Mostra versão

${pc.bold('Exemplos:')}
  akasha                    Inicia chat interativo
  akasha chat               Inicia chat interativo
  akasha -q "Como está meu caminho?"  One-shot
  akasha setup              Executa configuração
  akasha status             Mostra status
`);
}
export async function runCommand(args) {
    if (args.help) {
        printHelp();
        return;
    }
    if (args.version) {
        console.log(`akasha v${VERSION}`);
        return;
    }
    const command = args.command || 'chat';
    switch (command) {
        case 'chat':
            await chat(args.query);
            break;
        case 'setup':
            await setup({ force: args.force });
            break;
        case 'status':
            await status();
            break;
        case 'diagnostico':
            await diagnostico();
            break;
        case 'version':
            console.log(`akasha v${VERSION}`);
            break;
        default:
            console.error(`${pc.red('Erro:')} Comando desconhecido: ${command}`);
            printHelp();
            process.exit(1);
    }
}
export { VERSION };
async function main() {
    const args = parseArgs(process.argv);
    await runCommand(args);
}
main().catch((error) => {
    console.error(`${pc.red('Erro fatal:')} ${error}`);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map