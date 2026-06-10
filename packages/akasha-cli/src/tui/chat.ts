// ChatSession — Componente principal do TUI Chat
import chalk from 'chalk';
import { ChatScreen, createChatScreen, type ChatScreenConfig } from './interface.js';
import { OutputRenderer, createOutputRenderer, type Message } from './output.js';
import { InputHandler, createInputHandler, type Command } from './input.js';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ChatSessionConfig {
  version?: string;
  mentorUrl?: string;
  userId?: string;
  userCode?: string;
  welcomeMessage?: string;
}

export interface ChatSessionOptions {
  onExit?: () => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const WELCOME_MESSAGE = `⚕ ${chalk.cyan('Akasha CLI')} - Sistema Espiritual Interativo

{chalk.dim('─'.repeat(50))}

${chalk.green('>')} Como posso te ajudar hoje?

Digite ${chalk.yellow('/help')} para ver os comandos disponíveis
ou ${chalk.yellow('/clear')} para limpar a tela.

${chalk.dim('─'.repeat(50))}`;

const HELP_MESSAGE = `
${chalk.bold('Comandos disponíveis:')}

${chalk.green('/help')}     - Mostra esta ajuda
${chalk.green('/clear')}    - Limpa o histórico de mensagens
${chalk.green('/reset')}    - Reseta a conversa
${chalk.green('/status')}    - Mostra status da sessão
${chalk.green('/exit')}      - Encerra o chat

${chalk.dim('Navegação:')}
${chalk.dim('↑/↓')}  - Navegar histórico
${chalk.dim('Tab')}  - Autocomplete de comandos
${chalk.dim('Esc')}  - Cancelar
`;

// ─── ChatSession ───────────────────────────────────────────────────────────────

export class ChatSession {
  private screen: ChatScreen;
  private output: OutputRenderer;
  private input: InputHandler;
  private messages: Message[];
  private config: ChatSessionConfig;
  private sessionStart: Date;
  private tokenUsage: { used: number; limit: number };

  constructor(config: ChatSessionConfig = {}, options: ChatSessionOptions = {}) {
    this.config = {
      version: '0.0.17',
      mentorUrl: process.env.MENTOR_API_URL ?? 'http://localhost:3000',
      welcomeMessage: WELCOME_MESSAGE,
      ...config,
    };
    this.messages = [];
    this.sessionStart = new Date();
    this.tokenUsage = { used: 0, limit: 200000 };

    // Criar interface
    const screenConfig: ChatScreenConfig = {
      version: this.config.version ?? '0.0.17',
      tokenUsage: this.tokenUsage,
      sessionTime: this.calculateSessionTime(),
    };

    this.screen = createChatScreen(screenConfig);

    // Criar output renderer
    this.output = createOutputRenderer(this.screen.messages, {
      scrollOnAdd: true,
      maxMessages: 500,
    });
    this.output.setRenderCallback(() => this.screen.render());

    // Criar input handler com comandos customizados
    const commands: Command[] = [
      {
        name: 'help',
        description: 'Mostra esta ajuda',
        aliases: ['h', '?'],
        handler: () => this.showHelp(),
      },
      {
        name: 'clear',
        description: 'Limpa o histórico de mensagens',
        aliases: ['cls'],
        handler: () => this.output.clear(),
      },
      {
        name: 'reset',
        description: 'Reseta a conversa',
        aliases: ['new'],
        handler: () => this.resetConversation(),
      },
      {
        name: 'status',
        description: 'Mostra status da sessão',
        aliases: ['st'],
        handler: () => this.showStatus(),
      },
      {
        name: 'exit',
        description: 'Encerra o chat',
        aliases: ['quit', 'sair'],
        handler: () => this.exit(),
      },
    ];

    this.input = createInputHandler(this.screen.screenElement, this.screen.input, {
      commands,
      onSubmit: (text) => this.handleMessage(text),
      onCancel: () => this.input.focus(),
    });
    this.input.setRenderCallback(() => this.screen.render());

    // Configurar teclas globais
    this.setupGlobalKeys();
  }

  // ─── Ciclo de Vida ───────────────────────────────────────────────────────────

  async start(): Promise<void> {
    // Mostrar boas-vindas
    this.showWelcome();

    // Atualizar tempo de sessão periodicamente
    this.startSessionTimer();

    // Renderizar
    this.screen.render();
  }

  stop(): void {
    this.screen.cleanup();
  }

  // ─── Tratamento de Mensagens ────────────────────────────────────────────────

  private async handleMessage(text: string): Promise<void> {
    // Adicionar mensagem do usuário
    this.output.addUserMessage(text);
    this.messages.push({
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    });

    // Simular resposta do mentor (placeholder para integração real)
    const response = await this.getMentorResponse(text);

    // Streamar resposta
    await this.output.streamMessage('mentor', response);

    // Atualizar tokens
    this.updateTokenUsage(response.length);

    this.screen.render();
  }

  private async getMentorResponse(_question: string): Promise<string> {
    // Placeholder: Em produção, integrar com MentorEngine
    // Por enquanto, retornar resposta simulada

    const responses = [
      'Compreendo sua busca espiritual. O campo Akasha contém todas as memórias cósmicas que ressoam com sua intenção.',
      'A energia do momento convida à reflexão sobre seus caminhos percorridos e aqueles ainda por trilhar.',
      'Permita-me consultar os registros akáshicos sobre sua questão... As sincronicidades se alinham em seu favor.',
      'O código do dia revela uma oportunidade de expansão consciência. Preste atenção aos sinais.',
      'A sabedoria ancestral dos sistemas integrativos aponta para uma transformação necessária em sua jornada.',
    ];

    // Simular delay de API
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 1000));

    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ─── Comandos ────────────────────────────────────────────────────────────────

  private showWelcome(): void {
    const msg = this.config.welcomeMessage ?? WELCOME_MESSAGE;
    this.output.addSystemMessage(msg);
  }

  private showHelp(): void {
    this.output.addSystemMessage(HELP_MESSAGE);
  }

  private showStatus(): void {
    const sessionTime = this.calculateSessionTime();
    const status = `
${chalk.bold('Status da Sessão')}

${chalk.green('Versão:')} ${this.config.version}
${chalk.green('Sessão:')} ${sessionTime}
${chalk.green('Mensagens:')} ${this.messages.length}
${chalk.green('Tokens usados:')} ${(this.tokenUsage.used / 1000).toFixed(1)}K / ${(this.tokenUsage.limit / 1000).toFixed(0)}K
${chalk.green('Mentor:')} ${this.config.mentorUrl}
`;
    this.output.addSystemMessage(status);
  }

  private resetConversation(): void {
    this.messages = [];
    this.output.clear();
    this.input.clearHistory();
    this.showWelcome();
  }

  private exit(): void {
    this.output.addSystemMessage(`${chalk.green('✓')} Encerrando sessão...`);
    this.screen.render();
    setTimeout(() => {
      this.stop();
      process.exit(0);
    }, 500);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private updateTokenUsage(responseLength: number): void {
    // Estimar tokens (4 caracteres = 1 token aproximadamente)
    const tokens = Math.ceil(responseLength / 4);
    this.tokenUsage.used += tokens;
    this.screen.updateProgress(this.tokenUsage.used, this.tokenUsage.limit);
  }

  private calculateSessionTime(): string {
    const diff = Date.now() - this.sessionStart.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  private startSessionTimer(): void {
    setInterval(() => {
      this.screen.updateProgress(this.tokenUsage.used, this.tokenUsage.limit);
    }, 60000); // Atualizar a cada minuto
  }

  private setupGlobalKeys(): void {
    // Ctrl+C já configurado no ChatScreen
    // Escape para cancelar input
    this.screen.screenElement.key('escape', () => {
      this.input.focus();
    });
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  getMessages(): Message[] {
    return [...this.messages];
  }

  getInputHandler(): InputHandler {
    return this.input;
  }

  getOutputRenderer(): OutputRenderer {
    return this.output;
  }
}

// ─── Função Factory ───────────────────────────────────────────────────────────

export function createChatSession(
  config?: ChatSessionConfig,
  options?: ChatSessionOptions
): ChatSession {
  return new ChatSession(config, options);
}

// ─── Função de convenience ─────────────────────────────────────────────────────

export async function runChat(config?: ChatSessionConfig): Promise<void> {
  const session = createChatSession(config);
  await session.start();
}
