// InputHandler — Handler de input do TUI
import type { Widgets } from 'blessed';
import chalk from 'chalk';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Command {
  name: string;
  description: string;
  aliases?: string[];
  handler: (args: string[]) => void | Promise<void>;
}

export interface InputHandlerOptions {
  commands?: Command[];
  history?: string[];
  maxHistory?: number;
  onSubmit?: (text: string) => void | Promise<void>;
  onCancel?: () => void;
}

// ─── Comandos Padrão ──────────────────────────────────────────────────────────

const DEFAULT_COMMANDS: Command[] = [
  {
    name: 'help',
    description: 'Mostra esta ajuda',
    aliases: ['h', '?'],
    handler: () => {},
  },
  {
    name: 'clear',
    description: 'Limpa o histórico de mensagens',
    aliases: ['cls'],
    handler: () => {},
  },
  {
    name: 'exit',
    description: 'Encerra o chat',
    aliases: ['quit', 'sair'],
    handler: () => process.exit(0),
  },
  {
    name: 'status',
    description: 'Mostra status da sessão',
    aliases: ['st'],
    handler: () => {},
  },
  {
    name: 'reset',
    description: 'Reseta o histórico de conversa',
    aliases: ['new'],
    handler: () => {},
  },
];

// ─── InputHandler ─────────────────────────────────────────────────────────────

export class InputHandler {
  private screen: Widgets.Screen;
  private input: Widgets.TextareaElement;
  private commands: Map<string, Command>;
  private history: string[];
  private historyIndex: number;
  private maxHistory: number;
  private currentText: string;
  private onSubmit?: (text: string) => void | Promise<void>;
  private onCancel?: () => void;
  private renderCallback?: () => void;

  constructor(
    screen: Widgets.Screen,
    input: Widgets.TextareaElement,
    options: InputHandlerOptions = {}
  ) {
    this.screen = screen;
    this.input = input;
    this.history = options.history ?? [];
    this.historyIndex = -1;
    this.maxHistory = options.maxHistory ?? 100;
    this.currentText = '';
    this.onSubmit = options.onSubmit;
    this.onCancel = options.onCancel;

    // Criar mapa de comandos
    this.commands = new Map();
    for (const cmd of DEFAULT_COMMANDS) {
      this.commands.set(cmd.name, cmd);
      if (cmd.aliases) {
        for (const alias of cmd.aliases) {
          this.commands.set(alias, cmd);
        }
      }
    }

    // Comandos customizados
    if (options.commands) {
      for (const cmd of options.commands) {
        this.commands.set(cmd.name, cmd);
        if (cmd.aliases) {
          for (const alias of cmd.aliases) {
            this.commands.set(alias, cmd);
          }
        }
      }
    }

    this.setupKeyBindings();
  }

  setRenderCallback(cb: () => void): void {
    this.renderCallback = cb;
  }

  // ─── Configuração de Keys ───────────────────────────────────────────────────

  private setupKeyBindings(): void {
    // Submit (Enter)
    this.input.key('enter', async () => {
      const text = this.input.getValue().trim();
      this.input.clearValue();

      if (!text) return;

      // Adicionar ao histórico
      this.addToHistory(text);

      // Verificar se é comando
      if (text.startsWith('/')) {
        await this.handleCommand(text);
      } else {
        // Callback de submit
        if (this.onSubmit) {
          await this.onSubmit(text);
        }
      }

      this.render();
    });

    // History navigation (↑/↓)
    this.input.key('up', () => {
      this.navigateHistory(-1);
    });

    this.input.key('down', () => {
      this.navigateHistory(1);
    });

    // Autocomplete (Tab)
    this.input.key('tab', () => {
      this.handleAutocomplete();
    });

    // Cancel (Esc)
    this.input.key('escape', () => {
      if (this.onCancel) {
        this.onCancel();
      }
    });
  }

  // ─── Comandos ───────────────────────────────────────────────────────────────

  async handleCommand(text: string): Promise<boolean> {
    const parts = text.slice(1).split(/\s+/);
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const cmd = this.commands.get(cmdName);
    if (!cmd) {
      this.showError(`Comando desconhecido: /${cmdName}`);
      return false;
    }

    try {
      await cmd.handler(args);
      return true;
    } catch (err) {
      this.showError(`Erro ao executar comando: ${(err as Error).message}`);
      return false;
    }
  }

  registerCommand(command: Command): void {
    this.commands.set(command.name, command);
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.commands.set(alias, command);
      }
    }
  }

  unregisterCommand(name: string): boolean {
    const cmd = this.commands.get(name);
    if (!cmd) return false;

    this.commands.delete(name);
    if (cmd.aliases) {
      for (const alias of cmd.aliases) {
        this.commands.delete(alias);
      }
    }
    return true;
  }

  // ─── Autocomplete ──────────────────────────────────────────────────────────

  private handleAutocomplete(): void {
    const text = this.input.getValue();
    if (!text.startsWith('/')) return;

    const partial = text.slice(1).toLowerCase();
    const matches = Array.from(this.commands.keys())
      .filter((cmd) => cmd.startsWith(partial));

    if (matches.length === 1) {
      this.input.setValue(`/${matches[0]} `);
    } else if (matches.length > 1) {
      // Mostrar sugestões (pode ser melhorado)
      this.showSystemMessage(`Comandos: ${matches.join(', ')}`);
    }
  }

  // ─── Histórico ─────────────────────────────────────────────────────────────

  private addToHistory(text: string): void {
    // Remover duplicatas
    const idx = this.history.indexOf(text);
    if (idx !== -1) {
      this.history.splice(idx, 1);
    }

    // Adicionar ao final
    this.history.push(text);

    // Limitar tamanho
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    // Resetar índice
    this.historyIndex = -1;
  }

  private navigateHistory(direction: number): void {
    if (this.history.length === 0) return;

    const newIndex = this.historyIndex + direction;

    if (newIndex < -1) return;
    if (newIndex >= this.history.length) return;

    this.historyIndex = newIndex;

    if (this.historyIndex === -1) {
      this.input.setValue(this.currentText);
    } else {
      this.input.setValue(this.history[this.historyIndex]);
    }
  }

  // ─── Getters/Setters ────────────────────────────────────────────────────────

  getValue(): string {
    return this.input.getValue();
  }

  setValue(text: string): void {
    this.currentText = text;
    this.input.setValue(text);
  }

  clearValue(): void {
    this.currentText = '';
    this.input.clearValue();
  }

  getHistory(): string[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
    this.historyIndex = -1;
  }

  focus(): void {
    this.input.focus();
    this.render();
  }

  // ─── Helpers de Mensagem ────────────────────────────────────────────────────

  private showError(message: string): void {
    this.showSystemMessage(`${chalk.red('✗')} ${message}`);
  }

  private showSystemMessage(message: string): void {
    if (this.renderCallback) {
      this.renderCallback();
    }
  }

  private render(): void {
    if (this.renderCallback) {
      this.renderCallback();
    }
  }
}

// ─── Funções Factory ──────────────────────────────────────────────────────────

export function createInputHandler(
  screen: Widgets.Screen,
  input: Widgets.TextareaElement,
  options?: InputHandlerOptions
): InputHandler {
  return new InputHandler(screen, input, options);
}
