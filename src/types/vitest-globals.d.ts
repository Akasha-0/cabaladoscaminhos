// Shim for vitest/globals type definitions
// Real vitest is installed in dev environments (npm/pnpm install).
// This shim covers sandboxed TSC runs where node_modules is absent.
// Declares the standard vitest globals as `any` so TSC can type-check
// files that reference describe/it/expect/vi in test contexts.
//
// If you want strict types in test files, run `npm install` (or pnpm install)
// in your dev env — the real vitest globals types will shadow this shim.
declare global {
  // Vitest lifecycle + assertion globals (typed as any to keep TSC happy
  // without the real vitest package; real types come from the installed
  // vitest package in dev environments).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const describe: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const it: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const test: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expect: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const beforeAll: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afterAll: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const beforeEach: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afterEach: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vi: any;
}

export {};
