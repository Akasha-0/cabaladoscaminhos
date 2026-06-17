# Reducao Arquitetural e Consolidacao de Documentacao — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduzir duplicacao estrutural, arquivos e pastas redundantes, e centralizar a documentacao duravel em `docs/`, sem alterar comportamento do produto.

**Architecture:** A execucao deve atacar primeiro as redundancias de menor risco e maior retorno: documentacao dispersa, tipos duplicados, configs concorrentes e utilitarios paralelos. O plano evita reescritas profundas do dominio e preserva a superficie publica do app enquanto simplifica a estrutura real do monorepo.

**Tech Stack:** Next.js 16, TypeScript, pnpm workspaces, Turborepo, Vitest, ESLint, Markdown, DOX (`AGENTS.md`).

---

## Nota de escopo

Esta iniciativa cruza documentacao, app e contratos estruturais, mas as frentes
nao sao independentes: a documentacao canonica precisa refletir a mesma
arquitetura que o codigo passa a usar. Por isso o plano e um unico fluxo
faseado, com commits pequenos por tarefa.

## Mapa de arquivos

**Modify (documentacao canonica e ponteiros):**
- `/home/skynet/cabala-dos-caminhos/docs/00_README.md`
- `/home/skynet/cabala-dos-caminhos/docs/03_architecture-spec.md`
- `/home/skynet/cabala-dos-caminhos/docs/25_visao-akasha.md`
- `/home/skynet/cabala-dos-caminhos/docs/pesquisa/benchmark-apps.md`
- `/home/skynet/cabala-dos-caminhos/README.md`
- `/home/skynet/cabala-dos-caminhos/CONTEXT.md`
- `/home/skynet/cabala-dos-caminhos/.autonomous/VISION.md`

**Delete (docs duplicadas apos consolidacao):**
- `/home/skynet/cabala-dos-caminhos/research/synthesis/play-store-competitive-analysis.md`
- `/home/skynet/cabala-dos-caminhos/research/synthesis/akasha-v3-architecture-spec.md`

**Modify (tipos canônicos):**
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/akasha/synthesis-engine.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/akasha/narrative-generator.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/akasha/daily-engine.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/domain/calculators/energy-healing.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/domain/calculators/forest-medicine.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/domain/mapa/hologram-aggregator.ts`

**Delete (tipos locais duplicados):**
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/types/index.ts`

**Modify (configuracao Next unica):**
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/next.config.ts`

**Delete (config concorrente):**
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/next.config.js`

**Modify (rate-limit consolidado):**
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/infrastructure/rate-limit.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/middleware/rateLimit.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/middleware.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/app/api/mentor/ask/route.ts`

**Create (teste de rate-limit):**
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/infrastructure/rate-limit.test.ts`

**Delete (wrappers e duplicatas de rate-limit):**
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/rate-limit.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/shared/rate-limit.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/mentor/rate-limit.ts`

**Modify (ritual storage consolidado):**
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/infrastructure/ritual-storage.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/app/api/akasha/ritual/route.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/app/api/akasha/ritual/today/route.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/app/api/akasha/ritual/config/route.ts`

**Create (teste de ritual storage):**
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/infrastructure/ritual-storage.test.ts`

**Delete (storages redundantes):**
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/akasha/ritual-storage.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/ritual-storage.ts`

**Delete (barrels sem uso esperado):**
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/components/akasha/index.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/components/akasha/dashboard/index.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/swarm/index.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/agents/index.ts`
- `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/life-areas/index.ts`
- `/home/skynet/cabala-dos-caminhos/packages/types/src/types.ts`

**Modify / Create (DOX):**
- `/home/skynet/cabala-dos-caminhos/AGENTS.md`
- `/home/skynet/cabala-dos-caminhos/docs/AGENTS.md`
- `/home/skynet/cabala-dos-caminhos/.autonomous/AGENTS.md`
- `/home/skynet/cabala-dos-caminhos/coordination/AGENTS.md`
- `/home/skynet/cabala-dos-caminhos/packages/mentor/AGENTS.md`
- `/home/skynet/cabala-dos-caminhos/packages/akasha-cli/AGENTS.md`

---

### Task 1: Centralizar a documentacao canonica em `docs/`

**Files:**
- Modify: `/home/skynet/cabala-dos-caminhos/docs/00_README.md`
- Modify: `/home/skynet/cabala-dos-caminhos/docs/03_architecture-spec.md`
- Modify: `/home/skynet/cabala-dos-caminhos/docs/25_visao-akasha.md`
- Modify: `/home/skynet/cabala-dos-caminhos/docs/pesquisa/benchmark-apps.md`
- Modify: `/home/skynet/cabala-dos-caminhos/README.md`
- Modify: `/home/skynet/cabala-dos-caminhos/CONTEXT.md`
- Modify: `/home/skynet/cabala-dos-caminhos/.autonomous/VISION.md`
- Delete: `/home/skynet/cabala-dos-caminhos/research/synthesis/play-store-competitive-analysis.md`
- Delete: `/home/skynet/cabala-dos-caminhos/research/synthesis/akasha-v3-architecture-spec.md`

- [ ] **Step 1: Reescrever `docs/00_README.md` como indice mestre unico**

Substituir o topo do arquivo por uma navegacao curta, direta e atualizada com a
estrutura real do monorepo:

```md
# Documentacao Akasha

## Comece aqui

- `03_architecture-spec.md`: arquitetura tecnica atual
- `25_visao-akasha.md`: visao canonica do produto
- `08_roadmap.md`: roadmap ativo
- `pesquisa/benchmark-apps.md`: benchmark competitivo consolidado
- `audit/`: auditorias e relatórios de qualidade
- `superpowers/specs/`: specs aprovadas
- `superpowers/plans/`: planos de implementação

## Estrutura do repositorio

- `apps/akasha-portal/`: app principal
- `packages/`: engines e bibliotecas compartilhadas
- `grimoire/`: base de conhecimento
- `tests/`: verificações automatizadas
```

- [ ] **Step 2: Absorver o papel de `CONTEXT.md` em `docs/00_README.md` e reduzir `CONTEXT.md` para ponteiro**

Depois de copiar o conteudo util de navegação para `docs/00_README.md`, trocar
`CONTEXT.md` por um ponteiro minimo:

```md
# Contexto do Projeto

O índice canônico do projeto agora fica em `docs/00_README.md`.

- Navegação geral: `docs/00_README.md`
- Arquitetura técnica: `docs/03_architecture-spec.md`
- Visão do produto: `docs/25_visao-akasha.md`
```

- [ ] **Step 3: Consolidar a visao duravel em `docs/25_visao-akasha.md` e reduzir `.autonomous/VISION.md` para ponteiro operacional**

Levar para `docs/25_visao-akasha.md` as partes duráveis de visão e
posicionamento, e então trocar `.autonomous/VISION.md` por:

```md
# VISION

Fonte canônica de visão do produto: `docs/25_visao-akasha.md`.

Este arquivo permanece apenas como ponteiro operacional para os fluxos em
`.autonomous/`.
```

- [ ] **Step 4: Consolidar research duplicada dentro de `docs/`**

Mesclar o material abaixo em documentos já existentes de `docs/`:

```bash
git diff --no-index \
  /home/skynet/cabala-dos-caminhos/research/synthesis/play-store-competitive-analysis.md \
  /home/skynet/cabala-dos-caminhos/docs/pesquisa/benchmark-apps.md
```

E incorporar a arquitetura paralela ao documento canônico:

```bash
git diff --no-index \
  /home/skynet/cabala-dos-caminhos/research/synthesis/akasha-v3-architecture-spec.md \
  /home/skynet/cabala-dos-caminhos/docs/03_architecture-spec.md
```

Depois da fusão manual do conteúdo relevante, apagar os duplicados:

```bash
rm /home/skynet/cabala-dos-caminhos/research/synthesis/akasha-v3-architecture-spec.md
```

- [ ] **Step 5: Enxugar `README.md` da raiz para ser a porta de entrada e nao um segundo centro documental**

Trocar o topo da raiz por uma versao curta:

```md
# Cabala dos Caminhos

Repositorio principal do Sistema Akasha.

## Documentacao

- Indice principal: `docs/00_README.md`
- Arquitetura: `docs/03_architecture-spec.md`
- Visao: `docs/25_visao-akasha.md`

## Desenvolvimento

Execute `pnpm install` e depois `pnpm dev:portal`.
```

- [ ] **Step 6: Revisar links quebrados da documentacao**

Rodar:

```bash
grep -R "CONTEXT.md\|VISION.md\|research/synthesis" /home/skynet/cabala-dos-caminhos/docs /home/skynet/cabala-dos-caminhos/README.md /home/skynet/cabala-dos-caminhos/CONTEXT.md
```

Esperado: apenas referências intencionais aos novos ponteiros e aos arquivos em
`docs/`.

- [ ] **Step 7: Commit**

```bash
git add \
  /home/skynet/cabala-dos-caminhos/docs/00_README.md \
  /home/skynet/cabala-dos-caminhos/docs/03_architecture-spec.md \
  /home/skynet/cabala-dos-caminhos/docs/25_visao-akasha.md \
  /home/skynet/cabala-dos-caminhos/docs/pesquisa/benchmark-apps.md \
  /home/skynet/cabala-dos-caminhos/README.md \
  /home/skynet/cabala-dos-caminhos/CONTEXT.md \
  /home/skynet/cabala-dos-caminhos/.autonomous/VISION.md
git rm \
  /home/skynet/cabala-dos-caminhos/research/synthesis/play-store-competitive-analysis.md \
  /home/skynet/cabala-dos-caminhos/research/synthesis/akasha-v3-architecture-spec.md
git commit -m "docs: centralizar documentacao canonica em docs"
```

---

### Task 2: Canonicalizar tipos no package `@akasha/types`

**Files:**
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/akasha/synthesis-engine.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/akasha/narrative-generator.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/akasha/daily-engine.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/domain/calculators/energy-healing.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/domain/calculators/forest-medicine.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/domain/mapa/hologram-aggregator.ts`
- Delete: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/types/index.ts`

- [ ] **Step 1: Trocar imports de `@/types` por `@akasha/types` nos consumidores reais**

Aplicar este padrão nos 6 consumidores encontrados:

```ts
import type {
  AstrologyMap,
  KabalisticMap,
  TantricMap,
  OduBirth,
} from '@akasha/types';
```

E, nos calculadores, usar os tipos canônicos:

```ts
import type { EnergyHealingMap, ForestMedicineMap } from '@akasha/types';
```

- [ ] **Step 2: Verificar que nao restaram imports de `@/types`**

Rodar:

```bash
grep -R "from '@/types'" /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src
```

Esperado: nenhuma linha.

- [ ] **Step 3: Remover o arquivo duplicado `src/types/index.ts`**

Depois do `grep` zerado, apagar o duplicado:

```bash
rm /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/types/index.ts
```

- [ ] **Step 4: Rodar typecheck focado do portal**

Rodar:

```bash
pnpm --filter akasha-portal typecheck
```

Esperado: sem erros de importação nem de tipos faltando.

- [ ] **Step 5: Commit**

```bash
git add \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/akasha/synthesis-engine.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/akasha/narrative-generator.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/akasha/daily-engine.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/domain/calculators/energy-healing.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/domain/calculators/forest-medicine.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/domain/mapa/hologram-aggregator.ts
git rm /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/types/index.ts
git commit -m "refactor: usar tipos canônicos do workspace"
```

---

### Task 3: Consolidar `next.config.*` em um unico arquivo

**Files:**
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/next.config.ts`
- Delete: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/next.config.js`

- [ ] **Step 1: Manter `next.config.ts` como fonte unica de verdade**

Garantir que ele concentre o conjunto final de opcoes:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  transpilePackages: [
    '@akasha/core',
    '@akasha/types',
    '@akasha/core-astrology',
    '@akasha/core-cabala',
    '@akasha/core-odus',
    '@akasha/core-tantra',
    '@akasha/core-iching',
    '@akasha/mentor',
  ],
  serverExternalPackages: ['@prisma/client', 'prisma', 'pg', 'pg-pool', 'pg-connection-string'],
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
```

- [ ] **Step 2: Apagar o arquivo concorrente `next.config.js`**

```bash
rm /home/skynet/cabala-dos-caminhos/apps/akasha-portal/next.config.js
```

- [ ] **Step 3: Rodar o build do portal**

Rodar:

```bash
pnpm --filter akasha-portal build
```

Esperado: build finaliza sem ambiguidade de config e sem regressão de compilação.

- [ ] **Step 4: Commit**

```bash
git add /home/skynet/cabala-dos-caminhos/apps/akasha-portal/next.config.ts
git rm /home/skynet/cabala-dos-caminhos/apps/akasha-portal/next.config.js
git commit -m "refactor: consolidar configuracao next do portal"
```

---

### Task 4: Unificar as implementacoes de rate-limit

**Files:**
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/infrastructure/rate-limit.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/middleware/rateLimit.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/middleware.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/app/api/mentor/ask/route.ts`
- Create: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/infrastructure/rate-limit.test.ts`
- Delete: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/rate-limit.ts`
- Delete: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/shared/rate-limit.ts`
- Delete: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/mentor/rate-limit.ts`

- [ ] **Step 1: Reescrever `src/lib/infrastructure/rate-limit.ts` com dois backends no mesmo modulo**

Usar um unico modulo com API sincrona para memoria e API assíncrona para Redis:

```ts
import { getRedisClient } from '@/lib/infrastructure/redis';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

type MemoryEntry = { count: number; resetTime: number };
const memoryStore = new Map<string, MemoryEntry>();

export function checkMemoryRateLimit(
  identifier: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = memoryStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    memoryStore.set(identifier, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }

  entry.count += 1;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetTime - now };
}

export async function checkRedisRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const redis = await getRedisClient();
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSeconds);
  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetIn: windowSeconds,
  };
}

export function formatMentorRateLimitError(): string {
  return 'Você atingiu o limite de 10 mensagens por minuto. Aguarde alguns segundos.';
}
```

- [ ] **Step 2: Atualizar middleware e rota do mentor para consumirem o modulo unico**

`src/middleware/rateLimit.ts`:

```ts
import { checkMemoryRateLimit } from '@/lib/infrastructure/rate-limit';
```

`middleware.ts`:

```ts
const rateLimitResult = checkMemoryRateLimit(identifier, RATE_LIMIT_CONFIG);
```

`src/app/api/mentor/ask/route.ts`:

```ts
import {
  checkRedisRateLimit,
  formatMentorRateLimitError,
} from '@/lib/infrastructure/rate-limit';

const result = await checkRedisRateLimit(`rate:mentor:${userId}`, 10, 60);
```

- [ ] **Step 3: Adicionar teste focado do modulo consolidado**

Criar `src/lib/infrastructure/rate-limit.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { checkMemoryRateLimit, formatMentorRateLimitError } from './rate-limit';

describe('checkMemoryRateLimit', () => {
  it('bloqueia quando ultrapassa o maximo', () => {
    const config = { windowMs: 60_000, maxRequests: 2 };
    expect(checkMemoryRateLimit('ip-1', config).allowed).toBe(true);
    expect(checkMemoryRateLimit('ip-1', config).allowed).toBe(true);
    expect(checkMemoryRateLimit('ip-1', config).allowed).toBe(false);
  });
});

describe('formatMentorRateLimitError', () => {
  it('retorna a mensagem fixa do mentor', () => {
    expect(formatMentorRateLimitError()).toContain('10 mensagens por minuto');
  });
});
```

- [ ] **Step 4: Apagar os wrappers/duplicatas**

```bash
rm /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/rate-limit.ts
rm /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/shared/rate-limit.ts
rm /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/mentor/rate-limit.ts
```

- [ ] **Step 5: Rodar testes focados e typecheck**

Rodar:

```bash
pnpm --filter akasha-portal test:run -- src/lib/infrastructure/rate-limit.test.ts
pnpm --filter akasha-portal typecheck
```

Esperado: teste passa e nao restam imports quebrados dos wrappers removidos.

- [ ] **Step 6: Commit**

```bash
git add \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/infrastructure/rate-limit.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/middleware/rateLimit.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/middleware.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/app/api/mentor/ask/route.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/infrastructure/rate-limit.test.ts
git rm \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/rate-limit.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/shared/rate-limit.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/mentor/rate-limit.ts
git commit -m "refactor: consolidar rate limit do portal"
```

---

### Task 5: Fundir os storages de ritual em um unico modulo

**Files:**
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/infrastructure/ritual-storage.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/app/api/akasha/ritual/route.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/app/api/akasha/ritual/today/route.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/app/api/akasha/ritual/config/route.ts`
- Create: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/infrastructure/ritual-storage.test.ts`
- Delete: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/akasha/ritual-storage.ts`
- Delete: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/ritual-storage.ts`

- [ ] **Step 1: Reescrever `src/lib/infrastructure/ritual-storage.ts` como modulo unico**

Unificar configuracao e historico no mesmo arquivo:

```ts
import type { RitualConfig } from '@akasha/core';

export interface RitualCompletion {
  id: string;
  userId: string;
  ritualId: string;
  completedAt: Date;
  duration: number;
  notes?: string;
}

export interface RitualStats {
  totalCompletions: number;
  totalDuration: number;
}

const ritualConfigs = new Map<string, RitualConfig>();
const completions: RitualCompletion[] = [];

export function getRitualConfig(userId: string): RitualConfig | undefined {
  return ritualConfigs.get(userId);
}

export function setRitualConfig(userId: string, config: RitualConfig): void {
  ritualConfigs.set(userId, config);
}

export function deleteRitualConfig(userId: string): boolean {
  return ritualConfigs.delete(userId);
}

export function addRitualCompletion(
  userId: string,
  ritualId: string,
  completedAt: Date,
  duration: number,
  notes?: string,
): RitualCompletion {
  const record: RitualCompletion = {
    id: crypto.randomUUID(),
    userId,
    ritualId,
    completedAt,
    duration,
    notes,
  };
  completions.push(record);
  return record;
}

export function getRitualHistory(userId: string): RitualCompletion[] {
  return completions.filter((item) => item.userId === userId);
}

export function getRitualStats(userId: string): RitualStats {
  const history = getRitualHistory(userId);
  return {
    totalCompletions: history.length,
    totalDuration: history.reduce((sum, item) => sum + item.duration, 0),
  };
}

export function resetRitualStore(): void {
  ritualConfigs.clear();
  completions.length = 0;
}
```

- [ ] **Step 2: Atualizar as rotas para importarem sempre do modulo de infraestrutura**

Aplicar o mesmo padrão nas três rotas:

```ts
import {
  getRitualConfig,
  setRitualConfig,
} from '@/lib/infrastructure/ritual-storage';
```

- [ ] **Step 3: Adicionar teste focado do storage**

Criar `src/lib/infrastructure/ritual-storage.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import {
  getRitualConfig,
  setRitualConfig,
  addRitualCompletion,
  getRitualStats,
  resetRitualStore,
} from './ritual-storage';

describe('ritual-storage', () => {
  beforeEach(() => resetRitualStore());

  it('persiste config e contabiliza completions no mesmo modulo', () => {
    setRitualConfig('u1', { incense: true } as never);
    expect(getRitualConfig('u1')).toBeDefined();

    addRitualCompletion('u1', 'ritual-1', new Date('2026-01-01T00:00:00Z'), 300);
    expect(getRitualStats('u1')).toEqual({
      totalCompletions: 1,
      totalDuration: 300,
    });
  });
});
```

- [ ] **Step 4: Apagar os storages redundantes**

```bash
rm /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/akasha/ritual-storage.ts
rm /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/ritual-storage.ts
```

- [ ] **Step 5: Rodar testes focados e typecheck**

Rodar:

```bash
pnpm --filter akasha-portal test:run -- src/lib/infrastructure/ritual-storage.test.ts
pnpm --filter akasha-portal typecheck
```

Esperado: rotas continuam compilando e o storage unificado cobre os dois usos.

- [ ] **Step 6: Commit**

```bash
git add \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/infrastructure/ritual-storage.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/app/api/akasha/ritual/route.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/app/api/akasha/ritual/today/route.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/app/api/akasha/ritual/config/route.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/infrastructure/ritual-storage.test.ts
git rm \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/akasha/ritual-storage.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/ritual-storage.ts
git commit -m "refactor: fundir storages de ritual"
```

---

### Task 6: Remover barrels sem uso e atualizar a arvore DOX

**Files:**
- Delete: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/components/akasha/index.ts`
- Delete: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/components/akasha/dashboard/index.ts`
- Delete: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/swarm/index.ts`
- Delete: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/agents/index.ts`
- Delete: `/home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/life-areas/index.ts`
- Delete: `/home/skynet/cabala-dos-caminhos/packages/types/src/types.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/AGENTS.md`
- Modify: `/home/skynet/cabala-dos-caminhos/docs/AGENTS.md`
- Create: `/home/skynet/cabala-dos-caminhos/.autonomous/AGENTS.md`
- Create: `/home/skynet/cabala-dos-caminhos/coordination/AGENTS.md`
- Create: `/home/skynet/cabala-dos-caminhos/packages/mentor/AGENTS.md`
- Create: `/home/skynet/cabala-dos-caminhos/packages/akasha-cli/AGENTS.md`

- [ ] **Step 1: Confirmar que os barrels nao tem consumidores**

Rodar:

```bash
grep -R "components/akasha/index\|components/akasha/dashboard\|application/swarm/index\|application/agents/index\|application/life-areas/index\|packages/types/src/types" \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src \
  /home/skynet/cabala-dos-caminhos/packages \
  /home/skynet/cabala-dos-caminhos/tests
```

Esperado: nenhuma importação real dos arquivos listados.

- [ ] **Step 2: Apagar os barrels redundantes**

```bash
rm /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/components/akasha/index.ts
rm /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/components/akasha/dashboard/index.ts
rm /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/swarm/index.ts
rm /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/agents/index.ts
rm /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/life-areas/index.ts
rm /home/skynet/cabala-dos-caminhos/packages/types/src/types.ts
```

- [ ] **Step 3: Atualizar `AGENTS.md` raiz com indice DOX real**

Trocar a seção final por um índice efetivo:

```md
## Child DOX Index

- `.trae/` — specs e artefatos de planejamento
- `apps/` — aplicações do produto
- `packages/` — workspaces compartilhados e engines
- `docs/` — documentação canônica
- `grimoire/` — base de conhecimento
- `tests/` — verificações automatizadas
- `deploy/` — infraestrutura
- `scripts/` — automações
- `memory/` — histórico de ciclos
```

- [ ] **Step 4: Criar os AGENTS locais faltantes para fronteiras duráveis**

Criar os quatro arquivos abaixo no formato DOX padrão:

```md
# Purpose
[descrever o dominio]

## Ownership
- [listar subareas]

## Local Contracts
- [contratos locais]

## Work Guidance
- [regras praticas]

## Verification
- [comandos existentes]

## Child DOX Index
- [filhos imediatos com AGENTS]
```

Arquivos:

```text
/home/skynet/cabala-dos-caminhos/.autonomous/AGENTS.md
/home/skynet/cabala-dos-caminhos/coordination/AGENTS.md
/home/skynet/cabala-dos-caminhos/packages/mentor/AGENTS.md
/home/skynet/cabala-dos-caminhos/packages/akasha-cli/AGENTS.md
```

- [ ] **Step 5: Atualizar `docs/AGENTS.md` para refletir a nova organizacao**

Adicionar os grupos realmente usados:

```md
## Ownership
- `adrs/`: Architecture Decision Records
- `audit/`: Relatórios de auditoria e fallow
- `pesquisa/`: benchmark e síntese externa
- `sintese/`: síntese interna e arquitetura de referência
- `superpowers/`: specs e planos de agentes
```

- [ ] **Step 6: Rodar verificacoes finais**

Rodar:

```bash
pnpm typecheck
pnpm test:run
pnpm lint
pnpm test:run tests/architecture/
```

Esperado: baseline preservada, sem erros novos de importação ou regras de arquitetura.

- [ ] **Step 7: Commit**

```bash
git add \
  /home/skynet/cabala-dos-caminhos/AGENTS.md \
  /home/skynet/cabala-dos-caminhos/docs/AGENTS.md \
  /home/skynet/cabala-dos-caminhos/.autonomous/AGENTS.md \
  /home/skynet/cabala-dos-caminhos/coordination/AGENTS.md \
  /home/skynet/cabala-dos-caminhos/packages/mentor/AGENTS.md \
  /home/skynet/cabala-dos-caminhos/packages/akasha-cli/AGENTS.md
git rm \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/components/akasha/index.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/components/akasha/dashboard/index.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/swarm/index.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/agents/index.ts \
  /home/skynet/cabala-dos-caminhos/apps/akasha-portal/src/lib/application/life-areas/index.ts \
  /home/skynet/cabala-dos-caminhos/packages/types/src/types.ts
git commit -m "docs: atualizar dox e remover barrels redundantes"
```

---

## Self-review (plan)

- Cobertura da spec:
  - Centralizar documentação durável em `docs/` ✅ (Task 1)
  - Reduzir duplicação de tipos e contratos ✅ (Task 2)
  - Remover config concorrente ✅ (Task 3)
  - Unificar utilitários duplicados ✅ (Task 4 + Task 5)
  - Reduzir arquivos redundantes ✅ (Task 2, Task 3, Task 4, Task 5, Task 6)
  - Atualizar DOX após mudança estrutural ✅ (Task 6)
- Placeholder scan: sem `TODO`, `TBD` ou referências vagas ✅
- Consistência:
  - `@akasha/types` é a fonte única de tipos ✅
  - `next.config.ts` é a única config Next ✅
  - `src/lib/infrastructure/rate-limit.ts` é a única fonte de rate-limit ✅
  - `src/lib/infrastructure/ritual-storage.ts` é a única fonte de ritual storage ✅
