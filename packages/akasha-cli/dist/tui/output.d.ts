import type { Widgets } from 'blessed';
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
export declare class OutputRenderer {
    private log;
    private messages;
    private scrollOnAdd;
    private maxMessages;
    private renderCallback?;
    constructor(log: Widgets.Log, options?: OutputRendererOptions);
    setRenderCallback(cb: () => void): void;
    addMessage(message: Message): void;
    addUserMessage(content: string): Message;
    addMentorMessage(content: string): Message;
    addSystemMessage(content: string): Message;
    streamMessage(role: 'user' | 'mentor', text: string, onChunk?: (chunk: string) => void): Promise<Message>;
    clear(): void;
    getMessages(): Message[];
    getLastMessage(): Message | undefined;
    private renderMessage;
    private scrollToBottom;
}
export declare function createOutputRenderer(log: Widgets.Log, options?: OutputRendererOptions): OutputRenderer;
//# sourceMappingURL=output.d.ts.map