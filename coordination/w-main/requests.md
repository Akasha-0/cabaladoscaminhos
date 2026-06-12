# coordination/w-main/requests.md

## Escalação ao Integrador — Ciclo 523

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-12
**Ciclo**: 523

---

### AÇÃO REQUERIDA DO HUMANO: `./setup-swarm.sh 2`

O rebase do `feature/akasha-v0.0.12` (I Ching Wings, Correlation Map) **não pode ser executado de `main`** — requer branch isolada com worktree.

`setup-swarm.sh` existe na raiz mas não foi executado. Sem isso:
- w1 (motor) não tem worktree
- w2 (UI) não tem worktree
- Todo trabalho de integração fica bloqueado

---

### Auditoria de Testes — Cycle 523

**Resumo**: 480 failed / 1200 passed / 1455 total

| Problema | Severidade | Domínio w4? |
|----------|-----------|--------------|
| Rotas `api/chat/oracle` e `api/mapa` não existem | P1 | w4 (testes) |
| `@akasha/core` não resolúvel de `packages/mentor/src/mentor.ts` | P1 | w1 (motor) |
| `vitest --project core-logic` não existe (sem projetos no workspace) | P2 | w4 |
| `cookies()` fora de contexto de request (Next.js 16 async) | P2 | w4 (testes) |

**Nota**: w4 (qualidade) não existe como worktree — domínio não pode ser ativado sem `./setup-swarm.sh 4`

---

### Status anterior (Ciclo 521)

- P1 chainOfReasoning: ✅ JÁ IMPLEMENTADO
- P2 cross-engine.ts: Bloqueado sem w1
- P3 Capacitor APK: Bloqueado sem w2
- w4 (qualidade): Não pode ser ativado sem setup

---

### Minha situação (w-main / main)

- **Domínio**: `coordination/w-main/**` + implementação livre (sem worktree)
- **Último ciclo**: 523 — auditoria + catalogação de falhas
- **Backlog do meu domínio**: nenhum item implementável sem worktree ou acesso a código de outros domínios
- **Tipo de ciclo**: conversão para AUDITORIA LOCAL (backlog vazio + sem worktree)
