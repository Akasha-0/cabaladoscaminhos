// W70 — type-only stub for ambient file naming so other worktrees don't crash if
// tsconfig.globals references files that don't exist on this branch.
declare module '*.ts' { const x: unknown; export = x; }
