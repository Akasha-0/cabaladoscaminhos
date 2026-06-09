# Tasks — Akasha v0.0.10

## Sub-agent-driven-development

```
T1 ─┬─→ Spec Review ──→ Code Quality Review
T2 ─┤
T3 ─┼─→ (paralelo) ──→ T6 (verificação final)
T4 ─┤
T5 ─┘
```

**Dependências:**
- T1-T5 podem rodar em paralelo (cada módulo é independente)
- T6 é gate final (verificação após todos os T1-T5)

---

## T1: Criar `grimoire/sync`

**Responsável:** general_purpose_task sub-agent
**Prioridade:** 🔴 Alta

### Contexto
- Consumidores: `tests/lib/grimoire/sync.test.ts`, `apps/akasha-portal/scripts/sync-grimoire.ts`
- Módulo anterior: `v0.0.9/T1` (pendente)

### Implementação

Criar arquivo `apps/akasha-portal/src/lib/domain/grimoire/sync.ts`:
- [ ] Exportar `syncGrimoire(options?: SyncOptions): Promise<SyncResult>`
- [ ] Definir tipos `SyncOptions` e `SyncResult`
- [ ] JSDoc explicando que é stub para Onda 3

### Interface Esperada

```typescript
export interface SyncOptions {
  force?: boolean;
  library?: 'all' | 'tarot' | 'iching' | 'odas' | 'ervas';
}

export interface SyncResult {
  synced: number;
  errors: string[];
  timestamp: Date;
}

export async function syncGrimoire(options?: SyncOptions): Promise<SyncResult> {
  // Stub: retorna resultado vazio
  return { synced: 0, errors: [], timestamp: new Date() };
}
```

---

## T2: Criar `grimoire/search`

**Responsável:** general_purpose_task sub-agent
**Prioridade:** 🔴 Alta

### Contexto
- Consumidores: `tests/lib/grimoire/search.test.ts`, `tests/lib/ai/prompt-builder-iching.test.ts`
- Módulo anterior: `v0.0.9/T2` (pendente)

### Implementação

Criar arquivo `apps/akasha-portal/src/lib/domain/grimoire/search.ts`:
- [ ] Exportar `searchGrimoireHybrid(query, filters?): Promise<SearchResult>`
- [ ] Exportar tipo `GrimoireContext`
- [ ] Definir tipos `SearchQuery`, `SearchFilters`, `SearchResult`, `KnowledgeEntry`
- [ ] JSDoc explicando que é stub para Onda 3

### Interface Esperada

```typescript
export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
}

export interface GrimoireContext {
  library: string;
  entries: KnowledgeEntry[];
}

export interface SearchQuery {
  text: string;
  library?: string;
}

export interface SearchFilters {
  tags?: string[];
  source?: string;
}

export interface SearchResult {
  entries: KnowledgeEntry[];
  context: GrimoireContext;
}

export async function searchGrimoireHybrid(
  query: SearchQuery,
  filters?: SearchFilters
): Promise<SearchResult> {
  // Stub: retorna resultado vazio
  return {
    entries: [],
    context: { library: query.library || 'all', entries: [] }
  };
}
```

---

## T3: Criar `logging`

**Responsável:** general_purpose_task sub-agent
**Prioridade:** 🔴 Alta

### Contexto
- Consumidores: `apps/akasha-portal/middleware.ts`
- Módulo anterior: `v0.0.9/T3` (pendente)

### Implementação

Criar arquivo `apps/akasha-portal/src/lib/shared/logging.ts`:
- [ ] Exportar `generateRequestId(): string`
- [ ] JSDoc explicando propósito

### Interface Esperada

```typescript
/**
 * Gera um ID único para cada request (para tracing/logging)
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
```

---

## T4: Criar `rate-limit`

**Responsável:** general_purpose_task sub-agent
**Prioridade:** 🔴 Alta

### Contexto
- Consumidores: `apps/akasha-portal/middleware.ts`, `apps/akasha-portal/src/middleware/rateLimit.ts`
- Módulo anterior: `v0.0.9/T4` (pendente)

### Implementação

Criar arquivo `apps/akasha-portal/src/lib/shared/rate-limit.ts`:
- [ ] Exportar `checkRateLimit(ip: string, action: string): Promise<RateLimitResult>`
- [ ] Definir tipo `RateLimitResult`
- [ ] JSDoc explicando propósito

### Interface Esperada

```typescript
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Verifica rate limit para uma ação/IP específico
 * Stub: sempre permite (implementação real virá na Onda 4)
 */
export async function checkRateLimit(
  ip: string,
  action: string
): Promise<RateLimitResult> {
  return { allowed: true, remaining: 100, resetAt: new Date() };
}
```

---

## T5: Criar `swarm`

**Responsável:** general_purpose_task sub-agent
**Prioridade:** 🔴 Alta

### Contexto
- Consumidores: `apps/akasha-portal/src/lib/application/agents/recommendation-engine-v2.ts`
- Módulo anterior: `v0.0.9/T5` (pendente)

### Implementação

Criar arquivo `apps/akasha-portal/src/lib/domain/ai/swarm.ts`:
- [ ] Exportar tipo `KnowledgeEntry` (reutilizar de grimoire/search)
- [ ] Exportar `getKnowledgeBase(library?: string): Promise<KnowledgeEntry[]>`
- [ ] JSDoc explicando que é stub para Onda 3

### Interface Esperada

```typescript
import type { KnowledgeEntry } from '../grimoire/search';

export type { KnowledgeEntry };

/**
 * Retorna a base de conhecimento do Grimório para RAG
 * Stub: retorna array vazio (implementação real virá na Onda 3)
 */
export async function getKnowledgeBase(library?: string): Promise<KnowledgeEntry[]> {
  return [];
}
```

---

## T6: Verificação Final

**Responsável:** Controller (eu)
**Prioridade:** 🔴 Alta

### Verificações

- [ ] `pnpm test:run` — verificar quais testes passam/agora
- [ ] `pnpm typecheck` — verificar erros restantes
- [ ] `pnpm lint` — verificar lint
- [ ] `pnpm fallow` — verificar issues relacionadas

### Documentação

- [ ] Atualizar `docs/08_roadmap.md` (v0.0.10 ✅)
