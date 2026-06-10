// ChatScreen — Layout base do TUI
import blessed from 'blessed';
import chalk from 'chalk';
// ─── Constantes ───────────────────────────────────────────────────────────────
const HEADER_TEMPLATE = '{{title}} v{{version}} │ {{usage}} │ {{progress}} │ {{time}}';
const USAGE_FORMAT = '{{used}}K/{{limit}}K';
// ─── Funções Auxiliares ───────────────────────────────────────────────────────
function formatUsage(used, limit) {
    return USAGE_FORMAT.replace('{{used}}', (used / 1000).toFixed(1))
        .replace('{{limit}}', (limit / 1000).toFixed(0));
}
function formatProgress(used, limit) {
    const pct = Math.round((used / limit) * 100);
    const filled = Math.round(pct / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${pct}%`;
}
// ─── ChatScreen ───────────────────────────────────────────────────────────────
export class ChatScreen {
    screen;
    header;
    messagesBox;
    messagesLog;
    inputBox;
    inputField;
    statusBar;
    config;
    constructor(config) {
        this.config = {
            version: '0.0.17',
            tokenUsage: { used: 12400, limit: 200000 },
            sessionTime: '15m',
            ...config,
        };
        // Verificar se é TTY
        if (!process.stdin.isTTY) {
            throw new Error('Este comando requer um terminal interativo (TTY). Use akasha -q para modo não-interativo.');
        }
        // Criar screen
        this.screen = blessed.screen({
            smartCSR: true,
            dockBorders: true,
            ignoreDockContrast: true,
            fullUnicode: true,
        });
        // Criar componentes
        this.header = this.createHeader();
        this.messagesBox = this.createMessagesBox();
        this.messagesLog = this.createMessagesLog();
        this.inputBox = this.createInputBox();
        this.inputField = this.createInputField();
        this.statusBar = this.createStatusBar();
        // Montar layout
        this.mountLayout();
        // Configurar exit
        this.screen.key(['C-c'], () => {
            this.cleanup();
            process.exit(0);
        });
        // Focar no input
        this.inputField.focus();
    }
    createHeader() {
        const { version, tokenUsage, sessionTime } = this.config;
        const used = tokenUsage?.used ?? 0;
        const limit = tokenUsage?.limit ?? 200000;
        const content = HEADER_TEMPLATE
            .replace('{{title}}', chalk.cyan('⚕ Akasha'))
            .replace('{{version}}', chalk.bold(version))
            .replace('{{usage}}', formatUsage(used, limit))
            .replace('{{progress}}', formatProgress(used, limit))
            .replace('{{time}}', chalk.dim(sessionTime ?? '--'));
        return blessed.box({
            parent: this.screen,
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            border: { type: 'line' },
            style: {
                border: { fg: 'cyan' },
                fg: 'white',
            },
            content,
        });
    }
    createMessagesBox() {
        return blessed.box({
            parent: this.screen,
            top: 3,
            left: 0,
            right: 0,
            bottom: 8,
            border: { type: 'line' },
            style: {
                border: { fg: 'cyan' },
            },
            scrollable: true,
            alwaysScroll: true,
        });
    }
    createMessagesLog() {
        return blessed.log({
            parent: this.messagesBox,
            top: 1,
            left: 2,
            right: 2,
            bottom: 0,
            scrollable: true,
            alwaysScroll: true,
            scrollbar: {
                ch: '│',
                track: { bg: 'black' },
                style: { inverse: true },
            },
            style: {
                fg: 'white',
            },
        });
    }
    createInputBox() {
        return blessed.box({
            parent: this.screen,
            bottom: 4,
            left: 0,
            right: 0,
            height: 4,
            border: { type: 'line' },
            style: {
                border: { fg: 'cyan' },
            },
        });
    }
    createInputField() {
        return blessed.textarea({
            parent: this.inputBox,
            top: 1,
            left: 2,
            right: 2,
            height: 1,
            value: '',
            style: {
                fg: 'white',
                bg: 'black',
                focus: { border: { fg: 'green' } },
            },
            inputOnFocus: true,
            placeholder: 'Digite sua mensagem ou /help para comandos...',
        });
    }
    createStatusBar() {
        return blessed.box({
            parent: this.screen,
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            style: {
                fg: 'white',
                bg: 'black',
            },
            content: chalk.dim('>') + ' Enter para enviar | ' + chalk.dim('Shift+Enter') + ' para nova linha | ' + chalk.dim('/help') + ' para comandos',
            tags: false,
        });
    }
    mountLayout() {
        this.screen.append(this.header);
        this.screen.append(this.messagesBox);
        this.messagesBox.append(this.messagesLog);
        this.screen.append(this.inputBox);
        this.inputBox.append(this.inputField);
        this.screen.append(this.statusBar);
    }
    // ─── Getters ────────────────────────────────────────────────────────────────
    get screenElement() {
        return this.screen;
    }
    get messages() {
        return this.messagesLog;
    }
    get input() {
        return this.inputField;
    }
    // ─── Métodos de Renderização ────────────────────────────────────────────────
    render() {
        this.screen.render();
    }
    cleanup() {
        this.screen.destroy();
    }
    updateProgress(used, limit) {
        const content = HEADER_TEMPLATE
            .replace('{{title}}', chalk.cyan('⚕ Akasha'))
            .replace('{{version}}', chalk.bold(this.config.version))
            .replace('{{usage}}', formatUsage(used, limit))
            .replace('{{progress}}', formatProgress(used, limit))
            .replace('{{time}}', chalk.dim(this.config.sessionTime ?? '--'));
        this.header.setContent(content);
        this.render();
    }
}
// ─── Função Factory ───────────────────────────────────────────────────────────
export function createChatScreen(config) {
    return new ChatScreen(config ?? { version: '0.0.17' });
}
//# sourceMappingURL=interface.js.map