# Tasks — Akasha v0.0.9

## Ordem de Execução

```
T1 → T2 → T3 → T4 → T5 → T6
```

**Dependências:**
- T1-T5 podem rodar em paralelo (cada módulo é independente)
- T6 é gate final (verificação)

---

## T1: Criar `grimoire/sync`

**Responsável:** Agente de domínio
**Prioridade:** 🔴 Alta

### Análise de Consumidores

| Arquivo | Import |
|---------|--------|
| `tests/lib/grimoire/sync.test.ts` | `syncGrimoire` |
| `tests/api/admin/grimoire-sync.test.ts` | mock de `syncGrimoire` |
| `apps/akasha-portal/scripts/sync-grimoire.ts` | `syncGrimoire` |

### Implementação

- [ ] Criar `src/lib/domain/grimoire/sync.ts`
- [ ] Exportar `syncGrimoire(options?: SyncOptions): Promise<SyncResult>`
- [ ] Incluir tipos `SyncOptions` e `SyncResult`
- [ ] JSDoc explicando que é stub para a Onda 3

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

export function syncGrimoire(options?: SyncOptions): Promise<SyncResult>;
```

---

## T2: Criar `grimoire/search`

**Responsável:** Agente de domínio
**Prioridade:** 🔴 Alta

### Análise de Consumidores

| Arquivo | Import |
|---------|--------|
| `tests/lib/grimoire/search.test.ts` | `searchGrimoireHybrid` |
| `tests/lib/ai/prompt-builder-iching.test.ts` | `GrimoireContext` (type) |
| `tests/integration/oraculo-rag-fechado.test.ts` | `GrimoireContext` (type) |

### Implementação

- [ ] Criar `src/lib/domain/grimoire/search.ts`
- [ ] Exportar `searchGrimoireHybrid(query, filters): Promise<SearchResult>`
- [ ] Exportar tipo `GrimoireContext`
- [ ] Incluir tipos `SearchQuery`, `SearchFilters`, `SearchResult`
- [ ] JSDoc explicando que é stub para a Onda 3

### Interface Esperada

```typescript
export interface GrimoireContext {
  library: string;
  entries: KnowledgeEntry[];
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
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

export function searchGrimoireHybrid(
  query: SearchQuery,
  filters?: SearchFilters
): Promise<SearchResult>;
```

---

## T3: Criar `logging`

**Responsável:** Agente de infraestrutura
**Prioridade:** 🔴 Alta

### Análise de Consumidores

| Arquivo | Import |
|---------|--------|
| `apps/akasha-portal/middleware.ts` | `generateRequestId` |

### Implementação

- [ ] Criar `src/lib/shared/logging.ts`
- [ ] Exportar `generateRequestId(): string`
- [ ] JSDoc explicando propósito

### Interface Esperada

```typescript
/**
 * Gera um ID único para cada request (para tracing/logging)
 */
export function generateRequestId(): string;
```

---

## T4: Criar `rate-limit`

**Responsável:** Agente de infraestrutura
**Prioridade:** 🔴 Alta

### Análise de Consumidores

| Arquivo | Import |
|---------|--------|
| `apps/akasha-portal/middleware.ts` | `checkRateLimit` |
| `apps/akasha-portal/src/middleware/rateLimit.ts` | `checkRateLimit` |

### Implementação

- [ ] Criar `src/lib/shared/rate-limit.ts`
- [ ] Exportar `checkRateLimit(ip: string, action: string): Promise<RateLimitResult>`
- [ ] Incluir tipo `RateLimitResult`
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
 */
export function checkRateLimit(
  ip: string,
  action: string
): Promise<RateLimitResult>;
```

---

## T5: Criar `swarm`

**Responsável:** Agente de IA
**Prioridade:** 🔴 Alta

### Análise de Consumidores

| Arquivo | Import |
|---------|--------|
| `apps/akasha-portal/src/lib/application/agents/agent-prompts-v2.ts` | `KnowledgeEntry` (type) |
| `apps/akasha-portal/src/lib/application/agents/recommendation-engine-v2.ts` | `getKnowledgeBase`, `KnowledgeEntry` |

### Implementação

- [ ] Criar `src/lib/domain/ai/swarm.ts`
- [ ] Exportar tipo `KnowledgeEntry` (já definido em T2, reutilizar)
- [ ] Exportar `getKnowledgeBase(library?: string): Promise<KnowledgeEntry[]>`
- [ ] JSDoc explicando que é stub para Onda 3 (Grimório)

### Interface Esperada

```typescript
export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
}

/**
 * Retorna a base de conhecimento do Grimório para RAG
 */
export function getKnowledgeBase(library?: string): Promise<KnowledgeEntry[]>;
```

---

## T6: Verificação Final

**Responsável:** CI/Gates
**Prioridade:** 🔴 Alta

- [ ] `pnpm test:run` — verificar quais testes passam/agora
- [ ] `pnpm typecheck` — verificar erros restantes
- [ ] `pnpm fallow` — verificar issues relacionadas
- [ ] Documentar módulos que precisam de implementação real (Onda 3)
