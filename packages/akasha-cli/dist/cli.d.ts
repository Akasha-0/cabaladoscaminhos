#!/usr/bin/env node
declare const VERSION = "0.0.17";
type Command = 'chat' | 'setup' | 'status' | 'diagnostico' | 'version' | 'help';
export interface CLIArgs {
    command?: Command;
    query?: string;
    help?: boolean;
    version?: boolean;
    force?: boolean;
}
export declare function parseArgs(argv: string[]): CLIArgs;
export declare function printHelp(): void;
export declare function runCommand(args: CLIArgs): Promise<void>;
export { VERSION };
//# sourceMappingURL=cli.d.ts.map