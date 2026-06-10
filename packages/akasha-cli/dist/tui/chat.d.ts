import { OutputRenderer, type Message } from './output.js';
import { InputHandler } from './input.js';
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
export declare class ChatSession {
    private screen;
    private output;
    private input;
    private messages;
    private config;
    private sessionStart;
    private tokenUsage;
    constructor(config?: ChatSessionConfig, options?: ChatSessionOptions);
    start(): Promise<void>;
    stop(): void;
    private handleMessage;
    private getMentorResponse;
    private showWelcome;
    private showHelp;
    private showStatus;
    private resetConversation;
    private exit;
    private updateTokenUsage;
    private calculateSessionTime;
    private startSessionTimer;
    private setupGlobalKeys;
    getMessages(): Message[];
    getInputHandler(): InputHandler;
    getOutputRenderer(): OutputRenderer;
}
export declare function createChatSession(config?: ChatSessionConfig, options?: ChatSessionOptions): ChatSession;
export declare function runChat(config?: ChatSessionConfig): Promise<void>;
//# sourceMappingURL=chat.d.ts.map