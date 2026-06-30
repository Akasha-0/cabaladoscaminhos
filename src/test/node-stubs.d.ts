// node-stubs.d.ts — ambient types for spec runtime without @types/node
// Mirrors the W82 mentorship-ui pattern (cycle 82).

declare const process: {
  exit(code?: number): never;
  env: Record<string, string | undefined>;
  cwd(): string;
};

declare function setTimeout(handler: () => void, ms: number): NodeJS.Timeout;
declare function clearTimeout(handle: NodeJS.Timeout): void;

declare namespace NodeJS {
  interface Timeout {
    unref(): void;
    ref(): void;
  }
}