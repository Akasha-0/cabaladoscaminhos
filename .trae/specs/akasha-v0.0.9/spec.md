# Akasha v0.0.9 — Resolver Módulos Ausentes

> **Versão:** 0.0.9
> **Status:** Proposta
> **Sucessor de:** `akasha-v0.0.8` (Limpeza Fallow)
> **Foco:** Dívida técnica — módulos referenciados mas inexistentes

---

## Why

A v0.0.8 reduziu o Fallow de 3168 para 1329 issues, mas a T9 revelou que **tests e typecheck falham** porque módulos são referenciados mas não existem:

1. **`@/lib/grimoire/sync`** — usado em 5+ arquivos de teste
2. **`@/lib/grimoire/search`** — usado em 7+ arquivos de teste
3. **`@/lib/logging`** — usado em `middleware.ts`
4. **`@/lib/rate-limit`** — usado em `middleware.ts` e `rateLimit.ts`
5. **`@/lib/swarm`** — usado em agentes de recomendação

Sem resolver estes módulos, `pnpm test:run` e `pnpm typecheck` continuarão falhando.

---

## What Changes

### Módulos a Criar

| Módulo | Caminho | Exportado | Usado em |
|--------|---------|----------|----------|
| `grimoire/sync` | `src/lib/domain/grimoire/sync.ts` | `syncGrimoire` | Tests + Script |
| `grimoire/search` | `src/lib/domain/grimoire/search.ts` | `searchGrimoireHybrid`, `GrimoireContext` | Tests + Integração |
| `logging` | `src/lib/shared/logging.ts` | `generateRequestId` | middleware.ts |
| `rate-limit` | `src/lib/shared/rate-limit.ts` | `checkRateLimit` | middleware.ts |
| `swarm` | `src/lib/domain/ai/swarm.ts` | `getKnowledgeBase`, `KnowledgeEntry` | Agentes |

### Padrões de Implementação

Cada módulo deve:
1. Respeitar a arquitetura de 5 camadas (ADR-001, ADR-004)
2. Ser um stub funcional (não precisa de implementação real para tests passarem)
3. Exportar as interfaces/tipos esperados pelos consumidores
4. Incluir JSDoc explicando propósito

---

## Impact

### Affected code

- Tests em `tests/lib/grimoire/` voltarão a funcionar
- Typecheck em `middleware.ts` e agentes voltará a passar
- Scripts em `apps/akasha-portal/scripts/` poderão compilar

### Non-Goals

- ❌ Não implementar lógica real dos módulos (stubs são suficientes)
- ❌ Não modificar funcionalidades existentes
- ❌ Não quebrar backwards compatibility
- ❌ Não adicionar features

---

## Critérios de Sucesso

1. **`pnpm test:run`** — testes passam (exceto os que dependem de infra real)
2. **`pnpm typecheck`** — 0 erros relacionados aos módulos ausentes
3. **Commits atômicos** — um por módulo criado

---

## Cross-References

- **Spec anterior:** `.trae/specs/akasha-v0.0.8/`
- **ADR-001:** Tipos em `domain/types/`
- **ADR-004:** Utilitários em `shared/`
- **Roadmap:** `docs/08_roadmap.md`

---

## Source of Truth

- `.trae/specs/akasha-v0.0.9/` — esta spec e tasks
- `tests/` — consumidores dos módulos
- `apps/akasha-portal/middleware.ts` — consumidor de logging/rate-limit
