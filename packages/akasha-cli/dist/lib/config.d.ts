interface Config {
    databaseUrl?: string;
    openaiApiKey?: string;
}
export interface ConfigStatus {
    ok: boolean;
    configured: boolean;
    configPath?: string;
    error?: string;
    message?: string;
}
export declare function getConfigStatus(): Promise<ConfigStatus>;
export declare function getConfig(): Config | null;
export declare function isConfigured(): boolean;
export {};
//# sourceMappingURL=config.d.ts.map