export interface SystemStatus {
    version: string;
    postgres: 'ok' | 'error' | 'not_found';
    env: 'ok' | 'missing';
    migrations: 'ok' | 'pending' | 'error';
}
export declare function getStatus(): Promise<SystemStatus>;
export declare function status(): Promise<void>;
//# sourceMappingURL=status.d.ts.map