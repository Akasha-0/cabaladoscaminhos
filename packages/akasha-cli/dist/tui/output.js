import chalk from 'chalk';
// ─── OutputRenderer ────────────────────────────────────────────────────────────
export class OutputRenderer {
    log;
    messages = [];
    scrollOnAdd;
    maxMessages;
    renderCallback;
    constructor(log, options = {}) {
        this.log = log;
        this.scrollOnAdd = options.scrollOnAdd ?? true;
        this.maxMessages = options.maxMessages ?? 500;
    }
    setRenderCallback(cb) {
        this.renderCallback = cb;
    }
    // ─── Renderização de Mensagens ──────────────────────────────────────────────
    addMessage(message) {
        this.messages.push(message);
        // Limitar histórico
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(-this.maxMessages);
        }
        // Renderizar
        this.renderMessage(message);
        if (this.scrollOnAdd) {
            this.scrollToBottom();
        }
    }
    addUserMessage(content) {
        const message = {
            id: crypto.randomUUID(),
            role: 'user',
            content,
            timestamp: new Date(),
        };
        this.addMessage(message);
        return message;
    }
    addMentorMessage(content) {
        const message = {
            id: crypto.randomUUID(),
            role: 'mentor',
            content,
            timestamp: new Date(),
        };
        this.addMessage(message);
        return message;
    }
    addSystemMessage(content) {
        const message = {
            id: crypto.randomUUID(),
            role: 'system',
            content,
            timestamp: new Date(),
        };
        this.addMessage(message);
        return message;
    }
    // ─── Streaming ───────────────────────────────────────────────────────────────
    async streamMessage(role, text, onChunk) {
        const message = {
            id: crypto.randomUUID(),
            role,
            content: '',
            timestamp: new Date(),
        };
        // Determinar prefixo baseado no role
        const prefix = role === 'user'
            ? `${chalk.green('>')} Você: `
            : `${chalk.cyan('◆')} Akasha: `;
        // Primeira linha com prefixo
        this.log.add(prefix);
        message.content = text;
        // Simular streaming caractere por caractère
        const chars = text.split('');
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            this.log.add(char);
            if (onChunk) {
                onChunk(text.slice(0, i + 1));
            }
            // Peque pausa para efeito visual (5-15ms)
            await new Promise((r) => setTimeout(r, Math.random() * 10 + 5));
        }
        // Nova linha após mensagem
        this.log.add('\n');
        this.messages.push(message);
        this.scrollToBottom();
        return message;
    }
    // ─── Limpeza ────────────────────────────────────────────────────────────────
    clear() {
        this.log.setContent('');
        this.messages = [];
    }
    // ─── Getters ────────────────────────────────────────────────────────────────
    getMessages() {
        return [...this.messages];
    }
    getLastMessage() {
        return this.messages[this.messages.length - 1];
    }
    // ─── Métodos Privados ───────────────────────────────────────────────────────
    renderMessage(message) {
        const { role, content } = message;
        const lines = content.split('\n');
        for (const line of lines) {
            switch (role) {
                case 'user':
                    this.log.add(`${chalk.green('>')} ${chalk.bold('Você:')} ${line}`);
                    break;
                case 'mentor':
                    this.log.add(`${chalk.cyan('◆')} ${chalk.bold('Akasha:')} ${chalk.yellow(line)}`);
                    break;
                case 'system':
                    this.log.add(`${chalk.dim('[Sistema]')} ${chalk.gray(line)}`);
                    break;
            }
        }
        // Linha em branco após mensagem
        this.log.add('');
    }
    scrollToBottom() {
        this.log.setScrollPerc(100);
        if (this.renderCallback) {
            this.renderCallback();
        }
    }
}
// ─── Funções Factory ──────────────────────────────────────────────────────────
export function createOutputRenderer(log, options) {
    return new OutputRenderer(log, options);
}
//# sourceMappingURL=output.js.map