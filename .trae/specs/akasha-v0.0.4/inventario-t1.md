---
name: inventario-t1-v0.0.4
description: Inventário read-only (SubTask 1.1) dos arquivos a mover para apps/akasha-portal/ na migração monorepo v0.0.4-T1. Captura realidade da branch vs spec escrita.
metadata:
  node_type: spec
  type: project
  originTask: v0.0.4-T1 SubTask 1.1
  sourceSpec: .trae/specs/akasha-v0.0.4/tasks.md §26
  relatedCycle: 350
  supersedes: nenhum (primeira execução)
---

# v0.0.4-T1 SubTask 1.1 — Inventário de arquivos a mover

> **Status:** ✅ baseline inventariado (cycle 350)
> **Método:** read-only — `find`, `wc`, `grep`. Zero arquivo de produção tocado.
> **Pré-requisito para:** SubTasks 1.2 a 1.7.

---

## 1. Estado atual do monorepo (realidade)

| Item | Valor | Spec dizia |
|---|---|---|
| `apps/akasha-portal/` | existe mas **vazio** (só `.next/cache` stale) | — |
| `pnpm-workspace.yaml` | ✅ já inclui `apps/*` e `packages/*` | — |
| `turbo.json` | ✅ já configurado (build, test, test:run, lint, typecheck) | — |
| `packages/*` | ✅ 5 packages (types, core-astrology, core-cabala, core-odus, core-tantra) | — |
| `prisma/schema.prisma` | raiz (`/prisma/schema.prisma`) | mover para `apps/akasha-portal/prisma/` (T1.4) |
| `prisma.config.ts` | raiz (`/prisma.config.ts`) | ajustar em T1.4 |

---

## 2. Inventário por path (spec §26 vs realidade)

### 2.1 `src/app/(akasha)/` — ✅ existe

8 arquivos, 2.465 LOC:

```
src/app/(akasha)/layout.tsx
src/app/(akasha)/conta/page.tsx
src/app/(akasha)/conta/ContaClient.tsx
src/app/(akasha)/diario/page.tsx
src/app/(akasha)/mandala/page.tsx
src/app/(akasha)/manifesto/page.tsx
src/app/(akasha)/onboarding/page.tsx
src/app/(akasha)/oraculo/page.tsx
```

→ **Mover tudo** para `apps/akasha-portal/src/app/(akasha)/`.

### 2.2 `src/app/api/akasha/` — ✅ existe

15 route handlers, 1.085 LOC:

```
src/app/api/akasha/auth/{login,logout,me,refresh,register}/route.ts
src/app/api/akasha/chart/route.ts
src/app/api/akasha/checkout/route.ts
src/app/api/akasha/consult/route.ts
src/app/api/akasha/credits/route.ts
src/app/api/akasha/daily/route.ts
src/app/api/akasha/mandala/route.ts
src/app/api/akasha/manifesto/{generate,pdf}/route.ts
src/app/api/akasha/subscription/route.ts
src/app/api/akasha/transits/today/route.ts
```

→ **Mover tudo** para `apps/akasha-portal/src/app/api/akasha/`.

### 2.3 `src/app/api/admin/webhooks/grimoire-sync/` — ✅ existe (1 arquivo)

`route.ts` — webhook de ingestão do grimório. Importa `@/lib/grimoire/sync`.

→ **Mover** para `apps/akasha-portal/src/app/api/admin/webhooks/grimoire-sync/`.
   ⚠️ **Decisão pendente:** mantém path `admin/webhooks/...` ou renomeia para `akasha/webhooks/grimoire-sync/`? Ver §4 (open questions).

### 2.4 `src/lib/akasha/` — ✅ existe

6 arquivos, 1.394 LOC:

```
src/lib/akasha/cross-engine.ts
src/lib/akasha/daily-engine.ts
src/lib/akasha/glossary.ts
src/lib/akasha/manifesto-builder.ts
src/lib/akasha/odu-data.ts
src/lib/akasha/stripe-akasha.ts
```

→ **Mover tudo** para `apps/akasha-portal/src/lib/akasha/`.

### 2.5 `src/lib/grimoire/` — ✅ existe

3 arquivos, 526 LOC:

```
src/lib/grimoire/search.ts
src/lib/grimoire/sync.ts
src/lib/grimoire/types.ts
```

→ **Mover tudo** para `apps/akasha-portal/src/lib/grimoire/`.

### 2.6 `src/lib/stripe-akasha/` — ❌ NÃO EXISTE (diverge da spec)

A spec lista `src/lib/stripe-akasha/` mas o código vive em **`src/lib/akasha/stripe-akasha.ts`** (consolidado em 2.4).

→ **Nenhuma ação** — spec está desatualizada.

### 2.7 `src/components/mandala/` — ❌ NÃO EXISTE (diverge da spec)

A spec lista `src/components/mandala/` mas o diretório não existe nesta branch (verificado em cycle 350). Mandala provavelmente é server-rendered dentro de `src/app/(akasha)/mandala/page.tsx`.

→ **Nenhuma ação** — spec desatualizada. Mandala é resolvida na rota, sem componente client isolado.

### 2.8 `src/middleware/` (apenas parte Akasha) — ⚠️ parcialmente aplicável

1 arquivo, 37 LOC:

```
src/middleware/rateLimit.ts
```

Usado por rotas Akasha (potencialmente todas). Não é exclusiva da Akasha.

→ **Bloqueio de decisão:** ver §4.2 (rate limit é Akasha-only ou compartilhado?).

### 2.9 `src/hooks/akasha*` — ❌ NÃO EXISTE

Verificado: zero arquivos `akasha*` em `src/hooks/`.

→ **Nenhuma ação** — spec desatualizada.

### 2.10 `src/types/akasha*` — ❌ NÃO EXISTE

Verificado: zero arquivos `akasha*` em `src/types/`.

→ **Nenhuma ação** — types vivem em `packages/types/` (já em monorepo, alias `@akasha/types`).

---

## 3. Imports cruzados (path alias `@/lib/akasha` / `@/lib/grimoire`)

11 declarações de import, 6 arquivos distintos em `src/`, 2 em `tests/`:

**src/ (6 arquivos):**
- `src/app/api/webhooks/akasha-stripe/route.ts` → `@/lib/akasha/stripe-akasha`
- `src/app/api/akasha/checkout/route.ts` → `@/lib/akasha/stripe-akasha`
- `src/app/api/akasha/daily/route.ts` → `@/lib/akasha/daily-engine`
- `src/app/api/akasha/consult/route.ts` → `@/lib/grimoire/search`, `@/lib/akasha/glossary`
- `src/app/api/akasha/manifesto/generate/route.ts` → `@/lib/akasha/manifesto-builder`
- `src/app/api/admin/webhooks/grimoire-sync/route.ts` → `@/lib/grimoire/sync`

**tests/ (2 arquivos):**
- `tests/lib/ai/glossary-injection.test.ts` → `@/lib/akasha/manifesto-builder`, `daily-engine`, `glossary`
- `tests/integration/oraculo-rag-fechado.test.ts` → `@/lib/grimoire/search` (type-only)

**tsconfig.json path alias atual:**
```json
"@/*": ["./src/*"]
```

→ **Após T1.3:** alias deve passar a apontar para `./apps/akasha-portal/src/*` dentro do escopo da app OU o `tsconfig.json` da app deve redefinir o alias. Decisão: ver §4.3.

---

## 4. Open questions (bloqueiam T1.2-T1.7)

### 4.1 Prisma é compartilhado — qual escopo mover?

`src/lib/prisma.ts` (PrismaClient singleton) é importado por **20+ arquivos**, divididos em:

**Akasha-only (9):** akasha/auth/{login,me,refresh,register}/route.ts, akasha/{chart,checkout,consult,credits,daily,mandala,manifesto/generate,subscription}/route.ts, webhooks/akasha-stripe, lib/akasha/stripe-akasha, lib/auth/akasha-guard.

**Shared com legacy B2B (8+):** admin/credits/reconcile, admin/webhooks/grimoire-sync (também Akasha), health/{db,ready,route}, push/subscribe, lib/admin/credit-reconciliation, lib/payments/service, lib/push/push-subscription-service, tests/api/stripe-webhook.

**Implicação:** T1.4 diz "Mover `prisma/schema.prisma` para `apps/akasha-portal/prisma/schema.prisma`". Se mover, o cliente precisa ser **duplicado** OU as rotas legacy precisam virar código morto (legado pós-Onda 4).

→ **Decisão Gabriel:** apagar rotas legacy B2B? Ou duplicar PrismaClient em `apps/akasha-portal/src/lib/prisma.ts` mantendo root para legacy?

### 4.2 `src/middleware/rateLimit.ts` é Akasha-only ou shared? ✅ Resolvido (cycle 374)

1 arquivo, 37 LOC.

→ **Audit (cycle 374):** `grep -rE "middleware/rateLimit" **/*.{ts,tsx,js,mjs}` retorna **1 hit** — apenas `src/middleware.ts:4: import { extractIdentifier } from '@/middleware/rateLimit';`. **SHARED**: o middleware raiz (`src/middleware.ts`) serve rotas Akasha + legadas, então `rateLimit.ts` não pode mover para `apps/akasha-portal/src/middleware/` sem quebrar o middleware raiz.

→ **Solução proposta (T1.3c, fora do escopo quick):** extrair `rateLimit.ts` para `packages/auth-rate-limit/` (mesmo padrão dos packages Fase A) — agnóstico, sem imports `@/lib/*`, compartilhado por ambos os apps. OU duplicar em `apps/akasha-portal/src/middleware/rateLimit.ts` mantendo a raiz para o legado (T1.3a pragmatica).

### 4.3 Path alias `@/lib/akasha` em apps/akasha-portal

Spec §T1.3 diz: "`@/lib/akasha/*` deve resolver para `apps/akasha-portal/src/lib/akasha/*`".

→ **Implementação prática:** o `tsconfig.json` do `apps/akasha-portal/` precisa de `"baseUrl": "."` + `"paths": { "@/*": ["./src/*"] }`. O tsconfig raiz deve deixar de incluir o escopo movido no escopo de resolução (ou conviver com dois aliases paralelos via webpack/turbo).

### 4.4 `src/app/api/webhooks/akasha-stripe/` — não listada na spec

A spec §26 não menciona `src/app/api/webhooks/akasha-stripe/` (vive fora de `api/akasha/`), mas é Akasha e importa `@/lib/akasha/stripe-akasha`.

→ **Ação:** incluir no escopo de T1.2 — mover para `apps/akasha-portal/src/app/api/akasha/webhooks/akasha-stripe/` (renomear para uniformizar com `api/akasha/`).

### 4.5 `tests/lib/i18n/grimoire-completeness.test.ts` — não-Akasha ✅ Resolvido (cycle 374)

Test em `tests/lib/i18n/` valida completeness do grimório.

→ **Audit (cycle 374):** `grep -E '@/lib/grimoire' tests/lib/i18n/grimoire-completeness.test.ts` → **0 hits**. O teste usa apenas `fs` (`readFileSync`/`readdirSync`/`statSync`) + `path` (`join`) — sem imports de `@/lib/grimoire/*`. É um teste **puramente filesystem-driven** sobre os arquivos `.md` do Grimório.

→ **Conclusão:** **NÃO precisa mover** com T1.7. Pode ficar na raiz `tests/lib/i18n/`. Movê-lo para `apps/akasha-portal/tests/` sem necessidade apenas cria fricção de path-alias para o gate de CI.

---

## 5. Resumo numérico (pronto para T1.2)

| Categoria | Arquivos | LOC |
|---|---:|---:|
| `src/app/(akasha)/` | 8 | 2.465 |
| `src/app/api/akasha/` | 15 | 1.085 |
| `src/app/api/admin/webhooks/grimoire-sync/` | 1 | (não contado) |
| `src/app/api/webhooks/akasha-stripe/` ⓘ | 1 | (não contado) |
| `src/lib/akasha/` | 6 | 1.394 |
| `src/lib/grimoire/` | 3 | 526 |
| `src/middleware/rateLimit.ts` ⓘ | 1 | 37 |
| **Total production code Akasha** | **35** | **5.507+** |
| `tests/api/akasha*` | 2 | — |
| `tests/lib/grimoire*` | 3 | — |
| `tests/integration/oraculo-rag-fechado*` | 1 | — |
| `tests/integration/daily-engine-rag*` | 1 | — |
| `tests/lib/ai/glossary-injection*` ⓘ | 1 | — |
| `tests/api/admin/grimoire-sync*` ⓘ | 1 | — |
| `tests/lib/i18n/grimoire-completeness*` ⓘ | 1 | — |
| **Total tests Akasha** | **10** | — |

ⓘ = path não listado na spec original, identificado neste inventário.

---

## 6. Pré-condições para T1.2 (criar estrutura)

Antes de criar `apps/akasha-portal/{src,public,prisma}/`, **resolver §4.1-§4.5**:
- §4.1: Prisma compartilhado — decisão Gabriel
- §4.2: rateLimit escopo
- §4.3: alias `@/lib/akasha` em apps/akasha-portal
- §4.4: renomear `webhooks/akasha-stripe/` → `akasha/webhooks/akasha-stripe/`
- §4.5: tests/grimório-completeness escopo

---

## 7. Comandos de auto-validação (re-execução)

```bash
# Re-listar tudo
find src/app/\(akasha\) src/app/api/akasha src/lib/akasha src/lib/grimoire -type f | sort

# Contar LOC total
find src/app/\(akasha\) src/app/api/akasha src/lib/akasha src/lib/grimoire -type f -exec cat {} + | wc -l

# Reimports
grep -rE "from ['\"]@/lib/(akasha|grimoire)" src/ tests/

# Re-confirmar paths ausentes na spec
ls src/components/mandala src/lib/stripe-akasha src/hooks/akasha* src/types/akasha* 2>&1 | head
```

---

## 8. Métricas

- **Arquivos inventariados:** 35 production + 10 tests
- **LOC production:** 5.507+
- **Path-spec mismatches:** 4 (`components/mandala`, `lib/stripe-akasha`, `hooks/akasha*`, `types/akasha*`)
- **Open questions:** 5 (bloqueiam T1.2)
- **Duração:** ~10 min (read-only)
- **Zero diff em produção** — `git diff --stat` deve mostrar 1 file.
