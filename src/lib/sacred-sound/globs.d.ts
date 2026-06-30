// Module declarations + minimal Node global typings for the self-running
// spec entry-points. The worktree-local tsconfig sets `types: []` so we
// cannot rely on @types/node. Provide only what the harness + specs need.

declare const process: {
  readonly argv: string[];
  readonly env: NodeJS.ProcessEnv;
  readonly platform: string;
  readonly versions: NodeJS.ProcessVersions;
  readonly pid: number;
  readonly cwd: () => string;
  readonly exit: (code?: number) => never;
  readonly hrtime: {
    bigint: () => bigint;
    (): [number, number];
  };
};

declare module "./__tests__/frequencies.spec.ts" {
  export function runFrequenciesSpec(h: import("./__tests__/harness.ts").Harness): Promise<void>;
}
declare module "./__tests__/mantras.spec.ts" {
  export function runMantrasSpec(h: import("./__tests__/harness.ts").Harness): Promise<void>;
}
declare module "./__tests__/play-session.spec.ts" {
  export function runPlaySessionSpec(h: import("./__tests__/harness.ts").Harness): Promise<void>;
}
declare module "./__tests__/healing-protocol.spec.ts" {
  export function runHealingProtocolSpec(h: import("./__tests__/harness.ts").Harness): Promise<void>;
}