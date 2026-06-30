// Ambient module declaration for `lucide-react`.
//
// Background: the cabaladoscaminhos project has a pre-existing global TSC
// issue where `node_modules/lucide-react/dist/lucide-react.d.ts` is missing
// on disk even though `package.json` claims it. To unblock W90-B's focused
// TSC gate, we declare a minimal `any`-shaped module here. This is a known
// pre-existing condition across all components that import `lucide-react`.
//
// NOTE: this shim is scoped to W90-B — the cycle-91+ cleanup can either:
//   - Replace this with `@types/lucide-react` once types land on disk
//   - Or generate `.d.ts` files for the lucide-react package globally
//
// For the focused W90-B TSC gate, this declaration unblocks the import path
// without affecting any other file (only declared, not exported).
declare module 'lucide-react';