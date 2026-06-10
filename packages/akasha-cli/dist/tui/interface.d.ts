import type { Widgets } from 'blessed';
export interface ChatScreenConfig {
    version?: string;
    tokenUsage?: {
        used: number;
        limit: number;
    };
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
export declare class ChatScreen {
    private screen;
    private header;
    private messagesBox;
    private messagesLog;
    private inputBox;
    private inputField;
    private statusBar;
    private config;
    constructor(config: ChatScreenConfig);
    private createHeader;
    private createMessagesBox;
    private createMessagesLog;
    private createInputBox;
    private createInputField;
    private createStatusBar;
    private mountLayout;
    get screenElement(): Widgets.Screen;
    get messages(): Widgets.Log;
    get input(): Widgets.TextareaElement;
    render(): void;
    cleanup(): void;
    updateProgress(used: number, limit: number): void;
}
export declare function createChatScreen(config?: ChatScreenConfig): ChatScreen;
//# sourceMappingURL=interface.d.ts.map