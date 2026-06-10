export interface PostgresStatus {
    ok: boolean;
    connected: boolean;
    host?: string;
    port?: number;
    database?: string;
    error?: string;
    message?: string;
}
export declare function getPostgresStatus(): Promise<PostgresStatus>;
export declare function testConnection(): Promise<boolean>;
//# sourceMappingURL=postgres.d.ts.map