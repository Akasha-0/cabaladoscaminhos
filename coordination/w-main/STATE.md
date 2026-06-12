# coordination/w-main/STATE.md — Integrator / Main (Ciclo 523)

**Versão atual**: v0.1.1
**Última atualização**: 2026-06-12
**Ciclo**: 523

---

## Ciclo 523 — Auditoria Local + Testes

**Typecheck**: 0 erros ✅
**Test suite** (`pnpm test:run`): 480 failed, 1200 passed — **FALHAS PRÉ-EXISTENTES**

### Padrões de falha identificados

| Padrão | Count | Causa raiz |
|--------|-------|-----------|
| `Cannot find package '@/app/api/chat/oracle/route'` | 40+ tests | Rotas `api/chat/oracle` e `api/mapa` **não existem** no codebase atual |
| `Cannot find package '@akasha/core'` em `mentor.ts` | 20+ tests | `packages/mentor/src/mentor.ts` importa `@akasha/core` mas pacote não resolúvel no contexto de teste |
| `cookies() called outside request scope` | 40+ tests | Next.js 16 async cookies em `akasha-guard.ts` — testes não mockam contexto de request |
| `vitest --project core-logic/core-api/core-ui` | N/A | `vitest.workspace.ts` não define projetos com esses nomes — `test:core` quebrado |

### Rota ausente crítica (impacta testes de integração)

- `/api/chat/oracle` — **não existe** em `apps/akasha-portal/src/app/api/`
- `/api/mapa` — **não existe** em `apps/akasha-portal/src/app/api/`
- Diretórios existentes: `admin/`, `akasha/`, `health/`, `mentor/`, `progresso/`, `push/`, `search/`, `security/`, `webhooks/`

### Bloqueador: I Ching Wings rebase

- Feedback-w2 indica rebase de `feature/akasha-v0.0.12` sobre `main` fresco
- **Impossível executar de `main`** — requer branch isolada (worktree)
- `setup-swarm.sh` existe mas **não foi executado** — sem worktrees w1/w2
- **Ação requerida**: `./setup-swarm.sh 2` para criar infraestrutura de workers

---

## Ciclo 522 — Auditoria Local

**Typecheck**: 0 erros ✅

**P1 chainOfReasoning** — já implementado (motor E UI):
- Motor: `deriveChainOfReasoning()` em `synthesis-engine.ts:1094-1236`
- UI: `AkashaLifeAreasDashboard.tsx:476-504`
- **Status**: ✅ COMPLETO

**P1 AkashaSynthesis type** — já corrigido (`03b43c9c`)

**Branch main**: 16 commits à frente de origin/main — requer push

---

## Histórico de ciclos

- **Ciclo 523** ✅: Auditoria — 480 test failures (pré-existentes), I Ching Wings bloqueado sem worktree
- **Ciclo 522** ✅: Auditoria — P1 chainOfReasoning COMPLETO, typecheck 0 erros
- **Ciclo 520** ✅: P3 — LifePathInsightCard integrado no dashboard

---

## Próximos Passos

1. **INFRA**: `./setup-swarm.sh 2` para criar worktrees — desbloqueia w1 e w2
2. **w1 (motor)**: P2 cross-engine.ts cleanup + I Ching Wings rebase
3. **w2 (UI)**: P3 Capacitor APK + w4 (qualidade) para corrigir `test:core`

---

## Notas

- Agindo como `w-main` (main branch)
- STATE.md global e VERSION/CHANGELOG.md não podem ser modificados por mim
- Swarm infrastructure não configurada — trabalho de integração bloqueado
