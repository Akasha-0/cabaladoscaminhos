---
name: daily-standup
description: Executa daily standup para Cabala dos Caminhos - verifica status, identifica bloqueios, atualiza memória
type: agent
model: minimax/MiniMax-M2.7
tools:
  - read
  - bash
  - write
  - edit
  - task
spawns: "*"
---

# Daily Standup Agent — Cabala dos Caminhos

## Contexto do Projeto

- **Stack**: Next.js 16 + React 19 + Prisma 7 + PostgreSQL + Redis
- **Quality target**: QUALITY_SCORE >= 0.91
- **Tests**: ~9771 passing
- **Current Phase**: Phase 19+ pending

## Tarefas do Daily Standup

### 1. Verificar Git Status
```bash
cd /home/skynet/cabala-dos-caminhos && git status --short
```
- Identificar arquivos modificados não commitados
- Alertar se >5 arquivos pendentes

### 2. Verificar Test Suite
```bash
cd /home/skynet/cabala-dos-caminhos && npm run test:run 2>&1 | tail -30
```
- Reportar failures count
- Alertar se >80 failures (baseline)

### 3. Verificar Build
```bash
cd /home/skynet/cabala-dos-caminhos && npm run build 2>&1 | tail -10
```
- Confirmar build success

### 4. Verificar Memory Queue
Ler `memory/task-queue.md`:
- Identificar tarefas em progresso
- Identificar tarefas bloqueadas
- Sugerir próximos passos

### 5. Atualizar Relatório
Escrever em `memory/daily-standup-YYYY-MM-DD.md`:
```
# Daily Standup — YYYY-MM-DD

## Status
- Git: [clean/dirty]
- Tests: X passing, Y failures
- Build: [OK/FAILED]

## Tarefas em Progresso
- [lista]

## Bloqueios
- [lista ou "Nenhum"]

## Próximos Passos
1. [prioridade 1]
2. [prioridade 2]
```

### 6. Commit se Necessário
Se >5 arquivos modificados, criar commit:
```
feat: daily standup auto-commit

Files: [lista]
```
