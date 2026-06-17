import type { Widgets } from 'blessed';
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
export declare class InputHandler {
    private screen;
    private input;
    private commands;
    private history;
    private historyIndex;
    private maxHistory;
    private currentText;
    private onSubmit?;
    private onCancel?;
    private renderCallback?;
    constructor(screen: Widgets.Screen, input: Widgets.TextareaElement, options?: InputHandlerOptions);
    setRenderCallback(cb: () => void): void;
    private setupKeyBindings;
    handleCommand(text: string): Promise<boolean>;
    registerCommand(command: Command): void;
    unregisterCommand(name: string): boolean;
    private handleAutocomplete;
    private addToHistory;
    private navigateHistory;
    getValue(): string;
    setValue(text: string): void;
    clearValue(): void;
    getHistory(): string[];
    clearHistory(): void;
    focus(): void;
    private showError;
    private showSystemMessage;
    private render;
}
export declare function createInputHandler(screen: Widgets.Screen, input: Widgets.TextareaElement, options?: InputHandlerOptions): InputHandler;
//# sourceMappingURL=input.d.ts.map