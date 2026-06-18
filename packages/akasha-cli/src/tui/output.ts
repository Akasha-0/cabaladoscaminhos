// OutputRenderer — Renderizador de mensagens do TUI
import type { Widgets } from 'blessed';
import chalk from 'chalk';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  role: 'user' | 'mentor' | 'system';
  content: string;
  timestamp?: Date;
}

export interface OutputRendererOptions {
  scrollOnAdd?: boolean;
  maxMessages?: number;
}

// ─── OutputRenderer ────────────────────────────────────────────────────────────

export class OutputRenderer {
  private log: Widgets.Log;
  private messages: Message[] = [];
  private scrollOnAdd: boolean;
  private maxMessages: number;
  private renderCallback?: () => void;

  constructor(log: Widgets.Log, options: OutputRendererOptions = {}) {
    this.log = log;
    this.scrollOnAdd = options.scrollOnAdd ?? true;
    this.maxMessages = options.maxMessages ?? 500;
  }

  setRenderCallback(cb: () => void): void {
    this.renderCallback = cb;
  }

  // ─── Renderização de Mensagens ──────────────────────────────────────────────

  addMessage(message: Message): void {
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

  addUserMessage(content: string): Message {
    const message: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    this.addMessage(message);
    return message;
  }

  addMentorMessage(content: string): Message {
    const message: Message = {
      id: crypto.randomUUID(),
      role: 'mentor',
      content,
      timestamp: new Date(),
    };
    this.addMessage(message);
    return message;
  }

  addSystemMessage(content: string): Message {
    const message: Message = {
      id: crypto.randomUUID(),
      role: 'system',
      content,
      timestamp: new Date(),
    };
    this.addMessage(message);
    return message;
  }

  // ─── Streaming ───────────────────────────────────────────────────────────────

  async streamMessage(
    role: 'user' | 'mentor',
    text: string,
    onChunk?: (chunk: string) => void
  ): Promise<Message> {
    const message: Message = {
      id: crypto.randomUUID(),
      role,
      content: '',
      timestamp: new Date(),
    };

    // Determinar prefixo baseado no role
    const prefix = role === 'user' ? `${chalk.green('>')} Você: ` : `${chalk.cyan('◆')} Akasha: `;

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

  clear(): void {
    this.log.setContent('');
    this.messages = [];
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  getMessages(): Message[] {
    return [...this.messages];
  }

  getLastMessage(): Message | undefined {
    return this.messages[this.messages.length - 1];
  }

  // ─── Métodos Privados ───────────────────────────────────────────────────────

  private renderMessage(message: Message): void {
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

  private scrollToBottom(): void {
    this.log.setScrollPerc(100);
    if (this.renderCallback) {
      this.renderCallback();
    }
  }
}

// ─── Funções Factory ──────────────────────────────────────────────────────────

export function createOutputRenderer(
  log: Widgets.Log,
  options?: OutputRendererOptions
): OutputRenderer {
  return new OutputRenderer(log, options);
}
