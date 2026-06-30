// W70 — Node globals stub for spec files (cycle 68 lesson).
// Stripped by node --experimental-strip-types; provides the minimal shape our
// self-running harnesses rely on.
declare const process: { exit(code: number): never; env: Record<string, string | undefined> };
