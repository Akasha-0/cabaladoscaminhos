# Akasha v0.0.10 — Implementar Módulos Ausentes com Sub-Agents

> **Versão:** 0.0.10
> **Status:** Proposta
> **Sucessor de:** `akasha-v0.0.9` (não implementada)
> **Foco:** Dívida técnica — implementar módulos stubs + verificação
> **Método:** Sub-agent-driven-development (5 sub-agents paralelos + 1 reviewer)

---

## Why

A v0.0.9 especificou 5 módulos ausentes mas nunca foi implementada. A v0.0.10 executa as tarefas pendentes usando execução paralela via sub-agents para máxima velocidade.

---

## What Changes

### Módulos a Criar (Herdados da v0.0.9)

| Módulo | Caminho | Exportado | Prioridade |
|--------|---------|-----------|------------|
| `grimoire/sync` | `src/lib/domain/grimoire/sync.ts` | `syncGrimoire` | 🔴 Alta |
| `grimoire/search` | `src/lib/domain/grimoire/search.ts` | `searchGrimoireHybrid`, `GrimoireContext` | 🔴 Alta |
| `logging` | `src/lib/shared/logging.ts` | `generateRequestId` | 🔴 Alta |
| `rate-limit` | `src/lib/shared/rate-limit.ts` | `checkRateLimit` | 🔴 Alta |
| `swarm` | `src/lib/domain/ai/swarm.ts` | `getKnowledgeBase`, `KnowledgeEntry` | 🔴 Alta |

### Estratégia de Execução

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTROLLER (eu)                          │
│  1. Lê tasks.md                                             │
│  2. Cria TodoWrite com todas as tarefas                     │
│  3. Dispara 5 sub-agents em paralelo (T1-T5)               │
│  4. Aguarda conclusões                                      │
│  5. Dispara spec-reviewer para cada resultado                │
│  6. Dispara code-quality-reviewer                           │
│  7. Executa T6 (verificação final)                          │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ┌─────────┐        ┌─────────┐        ┌─────────┐
   │T1 Agent│        │T2 Agent│   ...  │T5 Agent│
   └────┬────┘        └────┬────┘        └────┬────┘
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────┐        ┌─────────┐        ┌─────────┐
   │ Spec    │        │ Spec    │   ...  │ Code   │
   │ Review  │        │ Review  │        │ Review │
   └─────────┘        └─────────┘        └─────────┘
```

---

## Impact

### Affected code

- `src/lib/domain/grimoire/sync.ts` — novo arquivo
- `src/lib/domain/grimoire/search.ts` — novo arquivo
- `src/lib/shared/logging.ts` — novo arquivo
- `src/lib/shared/rate-limit.ts` — novo arquivo
- `src/lib/domain/ai/swarm.ts` — novo arquivo

### Non-Goals

- ❌ Não implementar lógica real dos módulos (stubs)
- ❌ Não modificar funcionalidades existentes
- ❌ Não quebrar backwards compatibility

---

## Critérios de Sucesso

1. **`pnpm test:run`** — testes de grimoire passam
2. **`pnpm typecheck`** — 0 erros
3. **5 commits atômicos** — um por módulo criado
4. **Review approvals** — spec + code quality para cada módulo

---

## Cross-References

- **Spec herdada:** `.trae/specs/akasha-v0.0.9/`
- **Skill:** `subagent-driven-development`
- **Roadmap:** `docs/08_roadmap.md`
