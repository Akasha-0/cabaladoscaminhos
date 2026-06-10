// ChatScreen — Layout base do TUI
import blessed from 'blessed';
import type { Widgets } from 'blessed';
import chalk from 'chalk';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ChatScreenConfig {
  version?: string;
  tokenUsage?: { used: number; limit: number };
  sessionTime?: string;
}

export interface ChatScreenElements {
  screen: Widgets.Screen;
  header: Widgets.BoxElement;
  messagesBox: Widgets.BoxElement;
  messagesLog: Widgets.Log;
  inputBox: Widgets.BoxElement;
  inputField: Widgets.TextareaElement;
  statusBar: Widgets.BoxElement;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const HEADER_TEMPLATE = '{{title}} v{{version}} │ {{usage}} │ {{progress}} │ {{time}}';
const USAGE_FORMAT = '{{used}}K/{{limit}}K';

// ─── Funções Auxiliares ───────────────────────────────────────────────────────

function formatUsage(used: number, limit: number): string {
  return USAGE_FORMAT.replace('{{used}}', (used / 1000).toFixed(1))
    .replace('{{limit}}', (limit / 1000).toFixed(0));
}

function formatProgress(used: number, limit: number): string {
  const pct = Math.round((used / limit) * 100);
  const filled = Math.round(pct / 10);
  const empty = 10 - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${pct}%`;
}

// ─── ChatScreen ───────────────────────────────────────────────────────────────

export class ChatScreen {
  private screen: Widgets.Screen;
  private header: Widgets.BoxElement;
  private messagesBox: Widgets.BoxElement;
  private messagesLog: Widgets.Log;
  private inputBox: Widgets.BoxElement;
  private inputField: Widgets.TextareaElement;
  private statusBar: Widgets.BoxElement;
  private config: ChatScreenConfig;

  constructor(config: ChatScreenConfig) {
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

  private createHeader(): Widgets.BoxElement {
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

  private createMessagesBox(): Widgets.BoxElement {
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

  private createMessagesLog(): Widgets.Log {
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

  private createInputBox(): Widgets.BoxElement {
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

  private createInputField(): Widgets.TextareaElement {
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

  private createStatusBar(): Widgets.BoxElement {
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

  private mountLayout(): void {
    this.screen.append(this.header);
    this.screen.append(this.messagesBox);
    this.messagesBox.append(this.messagesLog);
    this.screen.append(this.inputBox);
    this.inputBox.append(this.inputField);
    this.screen.append(this.statusBar);
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  get screenElement(): Widgets.Screen {
    return this.screen;
  }

  get messages(): Widgets.Log {
    return this.messagesLog;
  }

  get input(): Widgets.TextareaElement {
    return this.inputField;
  }

  // ─── Métodos de Renderização ────────────────────────────────────────────────

  render(): void {
    this.screen.render();
  }

  cleanup(): void {
    this.screen.destroy();
  }

  updateProgress(used: number, limit: number): void {
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

export function createChatScreen(config?: ChatScreenConfig): ChatScreen {
  return new ChatScreen(config ?? { version: '0.0.17' });
}
