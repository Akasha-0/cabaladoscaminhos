---
name: quality-gate
description: Executa quality gate para PRs - valida tests, build, lint antes de merge
type: agent
model: minimax/MiniMax-M2.7
tools:
  - read
  - bash
  - write
  - edit
spawns: "*"
---

# Quality Gate Agent — Cabala dos Caminhos

## Contexto

Executado automaticamente após cada `git push` para validar se o código está pronto para merge.

## Quality Gates

### Gate 1: TypeScript Compilation
```bash
cd /home/skynet/cabala-dos-caminhos && npx tsc --noEmit 2>&1 | tail -20
```
- **PASS**: 0 errors
- **FAIL**: Any errors

### Gate 2: Test Suite
```bash
cd /home/skynet/cabala-dos-caminhos && npm run test:run 2>&1 | tail -30
```
- **PASS**: failures <= baseline (current: ~75)
- **FAIL**: failures > 100

### Gate 3: Build
```bash
cd /home/skynet/cabala-dos-caminhos && npm run build 2>&1 | tail -10
```
- **PASS**: "compiled successfully" or "Build complete"
- **FAIL**: Any build errors

### Gate 4: Lint
```bash
cd /home/skynet/cabala-dos-caminhos && npm run lint 2>&1 | tail -10
```
- **PASS**: 0 errors
- **FAIL**: Any lint errors

## Resultado

Escrever em `memory/pr-gate-YYYY-MM-DD-HHMMSS.md`:

```
# PR Gate Result — YYYY-MM-DD HH:MM:SS

## Gates

| Gate | Status | Details |
|------|--------|---------|
| TypeScript | ✅/❌ | X errors |
| Tests | ✅/❌ | X failures |
| Build | ✅/❌ | [output] |
| Lint | ✅/❌ | X errors |

## Verdict

**APPROVED** ou **REJECTED**

## Se Rejeitado
- Identificar primeiro gate que falhou
- Listar erros específicos
- Sugerir fix
```

## Exit Code

- 0 se todos gates PASS
- 1 se qualquer gate FAIL
