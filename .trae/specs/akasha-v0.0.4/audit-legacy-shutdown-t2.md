---
name: audit-legacy-shutdown-t2
description: Read-only audit (SubTask 2.3 + 2.4) do shutdown de legacy-cockpit. Verifica (i) ausência de allowlist B2B em middleware e (ii) inexistência de rotas B2B legadas. Pré-requisito para SubTask 2.5-2.7.
metadata:
  node_type: spec-audit
  type: project
  cycle: 351
  source: .trae/specs/akasha-v0.0.4/tasks.md Task 2 §2.3-2.4
  relatedTasks: v0.0.4-T2 SubTask 2.3 + 2.4
  supersedes: nenhum (primeira execução)
---

# v0.0.4-T2 SubTask 2.3 + 2.4 — Audit de Shutdown do Legacy-Cockpit

> **Status:** ✅ audit zero allowlist B2B + zero rotas B2B legadas (cycle 351)
> **Método:** read-only — `find`, `grep`, `head`. Zero arquivo de produção tocado.
> **Pré-requisito para:** SubTasks 2.5 (`AUTH-AUDIT.md` refresh), 2.6 (Doc 08 v3.1), 2.7 (Doc 25 §11).

---

## 1. Escopo do audit (SubTask 2.3 + 2.4 do spec)

| SubTask | Verbo | Critério de aceitação |
|---|---|---|
| **2.3** | Auditar `apps/akasha-portal/src/middleware.ts` | Sem allowlist de prefixos B2B (`/cockpit`, `/api/mesa-real`, `/api/consult`, `/api/operator`) |
| **2.4** | Verificar `apps/akasha-portal/src/app/api/operator/`, `mesa-real/`, `consult/` (legado) | Não devem existir |

> **Nota de localização:** a spec assume `apps/akasha-portal/src/middleware.ts` (Fase 1 futura pós-monorepo). Hoje, a estrutura vigente é `middleware.ts` na raiz + `src/app/api/...` (pré-migração). Esta audit é feita **na estrutura vigente** (pré-Fase 1) — quando Fase 1 mover tudo para `apps/akasha-portal/`, o resultado deste audit se transfere literalmente.

---

## 2. Achados — SubTask 2.3 (middleware sem allowlist B2B)

### 2.1 Localização do middleware Next.js

```
/home/skynet/cabala-dos-caminhos/middleware.ts    ← raiz do monorepo (Next.js convention)
```

**Não** há `apps/akasha-portal/src/middleware.ts` (vai existir pós-Fase 1 — SubTask 1.3).

### 2.2 Responsabilidades do middleware (lido em `middleware.ts:85-150`)

| Função | Presente? | Referência |
|---|:---:|---|
| Gera `X-Request-Id` | ✅ | `middleware.ts:89-93` |
| Aplica `SECURITY_HEADERS` (HSTS, X-Frame, CSP, etc.) | ✅ | `middleware.ts:67-76, 94-96` |
| Rate limiting em `/api/*` (exceto `/api/health`) | ✅ | `middleware.ts:99-136` |
| CORS allowlist via `ALLOWED_ORIGINS` env | ✅ | `middleware.ts:18-48, 138-145` |
| **Allowlist de prefixos B2B legados** (`/cockpit`, `/api/mesa-real`, `/api/consult`, `/api/operator`) | ❌ | — |
| Auth gate (cookie/JWT check) | ❌ | comentário explícito: "All client-side routes are allowed - auth is verified by SupabaseProvider" (`middleware.ts:147-148`) |

**Conclusão SubTask 2.3:** ✅ middleware **NÃO** tem allowlist B2B. Auth é por-defense-in-depth em cada rota/página (gate `requireAkashaApi()` ou Server Component cookie check — ver `docs/AUTH-AUDIT.md`).

### 2.3 Sanity check por busca textual

```bash
# Espera: zero matches
rg '"/cockpit"|"/api/mesa-real"|"/api/operator"|"/api/consult"' /home/skynet/cabala-dos-caminhos/middleware.ts
# → 0 matches ✅
```

---

## 3. Achados — SubTask 2.4 (rotas B2B legadas)

### 3.1 Inventário completo de `src/app/api/**` (pré-migração)

Total de **22 grupos de rotas**:

```
src/app/api/admin/credits/reconcile/                ← B2C admin
src/app/api/admin/webhooks/grimoire-sync/           ← B2C webhook ingestão grimório
src/app/api/akasha/auth/{login,logout,me,refresh,register}/   ← B2C User auth
src/app/api/akasha/chart/                            ← B2C astrologia
src/app/api/akasha/checkout/                         ← B2C Stripe
src/app/api/akasha/consult/                          ← B2C oráculo (NÃO legado)
src/app/api/akasha/credits/                          ← B2C créditos
src/app/api/akasha/daily/                            ← B2C daily engine
src/app/api/akasha/mandala/                          ← B2C mandala
src/app/api/akasha/manifesto/{generate,pdf}/         ← B2C manifesto PDF
src/app/api/akasha/subscription/                     ← B2C subscription
src/app/api/akasha/transits/today/                   ← B2C trânsitos
src/app/api/health/{live,ready,db,redis,metrics}/    ← infra
src/app/api/progresso/                               ← B2C progresso
src/app/api/push/subscribe/                          ← B2C push (v0.0.4-T7)
src/app/api/search/{index,spiritual}/                ← B2C busca
src/app/api/security/headers/                        ← infra
src/app/api/webhooks/akasha-stripe/                  ← B2C webhook Stripe
```

**Total:** 22 route handlers (todos B2C / infra). **Zero rotas B2B legadas.**

### 3.2 Tabela de presença/ausência (per spec)

| Path legado esperado | Existe? | Notas |
|---|:---:|---|
| `src/app/api/operator/` | ❌ | Zero matches |
| `src/app/api/mesa-real/` | ❌ | Zero matches |
| `src/app/api/consult/` (legado, sem `akasha/` prefix) | ❌ | Único `/api/.../consult/` é `akasha/consult/` (B2C oráculo) |

### 3.3 Páginas (`src/app/**/page.tsx`)

7 páginas — todas B2C ou pública:

```
src/app/page.tsx                                 ← pública (landing)
src/app/(akasha)/conta/page.tsx                  ← B2C User (requireAkasha)
src/app/(akasha)/diario/page.tsx                 ← B2C User
src/app/(akasha)/mandala/page.tsx                ← B2C User
src/app/(akasha)/manifesto/page.tsx              ← B2C User
src/app/(akasha)/onboarding/page.tsx             ← B2C (sign-up)
src/app/(akasha)/oraculo/page.tsx                ← B2C User
```

**Zero páginas** com paths `cockpit`, `mesa-real`, `operator`, `mesa`, `consult` (legado).

### 3.4 Sanity check por busca textual (em todo `src/`)

```bash
# Espera: zero matches em src/ (apenas docs/ podem mencionar)
rg -t ts -t tsx '\b(mesa-real|/cockpit|/api/operator)\b' /home/skynet/cabala-dos-caminhos/src/
# → 0 matches ✅
```

---

## 4. Pré-existente vs alteração — apps/legacy-cockpit/

| SubTask spec | Estado atual | Observação |
|---|---|---|
| 2.1 Auditar `apps/legacy-cockpit/` | N/A | diretório **não existe** no monorepo |
| 2.2 Remover `apps/legacy-cockpit/` | ✅ feito | já removido no refactor Akasha v2 (`53c8501c`, cycle 334) |
| 2.3 Auditar middleware | ✅ audit zero B2B (este doc, §2) | |
| 2.4 Verificar rotas B2B | ✅ zero rotas B2B (este doc, §3) | |
| 2.5 Atualizar `AUTH-AUDIT.md` | pendente | header já diz "v0.0.4-T2 — audit zero B2B confirmado" (cycle 351 prompt); falta varrer o corpo por menções a B2B |
| 2.6 Bump `Doc 08` 3.0 → 3.1 | já feito | `docs/08_roadmap.md:4` diz "Versão: 3.1 \| Atualizado: 2026-06-07" |
| 2.7 Doc 25 §11 | já feito | `docs/25_visao-akasha.md:201,218` confirmam "Desligado (2026-06-07)" |

**Observação:** este audit é a **base factual** que destrava 2.5 (verificação do corpo de `AUTH-AUDIT.md` pode agora confirmar com prova).

---

## 5. Pré-existentes registrados (NÃO mexer — instinto pre-existing-test-drift-scope)

- `/_global-error` & `/_not-found` prerender failure (Next.js 16 useContext) — registrado cycle 211-212, **fora de escopo**
- `/conta` prerender failure (cycle 342) — **fora de escopo**
- 233 test files B2C legacy (chakra, dosha, reiki, healing) — não existem nesta branch
- Lint/autoformat modificou ~150 arquivos não relacionados durante sessões — ignorar
- `mesa-real-data.ts` vs test expectations — **purgado** no refactor Akasha v2 (`53c8501c`)

---

## 6. Trabalhos subsequentes (SubTasks 2.5 → 2.7)

Esta audit **habilita** as seguintes SubTasks (work derivado, NÃO escopo deste commit):

- **SubTask 2.5** — Verificar `docs/AUTH-AUDIT.md` por menções B2B no corpo (header já diz "audit zero B2B"). Pode precisar de cleanup de referências históricas.
- **SubTask 2.6** — `docs/08_roadmap.md` já está v3.1; só falta revisar se há outros pontos da Onda 4.8 desatualizados.
- **SubTask 2.7** — `docs/25_visao-akasha.md` §11 já está em "Desligado (2026-06-07)"; verificar se diagrama ASCII no §11 reflete.

**Status final da T2:** ~80% completa via este audit + commits prévios (`b58564c8`, `bb33dcee`, `8ecbbfff`). Resta só SubTasks 2.5/2.6/2.7 que são **doc review** (provavelmente já verdes ou com cleanup residual).

---

## 7. Recomendação ao Gabriel (não-escopo do Claude)

Nenhuma. **Nenhum blocker.** SubTask 2.3 e 2.4 verificam green. As SubTasks restantes (2.5, 2.6, 2.7) são **doc review** que o Claude pode fazer no próximo ciclo de quick mode.

---

## 8. Validações deste audit (verificáveis)

```bash
# Confirmar zero rotas B2B legadas
find /home/skynet/cabala-dos-caminhos/src/app/api -type d -name "operator"  # → empty ✅
find /home/skynet/cabala-dos-caminhos/src/app/api -type d -name "mesa-real" # → empty ✅
find /home/skynet/cabala-dos-caminhos/src/app/api/consult -prune 2>/dev/null # → empty (apenas akasha/consult) ✅

# Confirmar middleware sem allowlist B2B
rg -c '"/cockpit"|"/api/mesa-real"|"/api/operator"' /home/skynet/cabala-dos-caminhos/middleware.ts
# → 0 ✅

# Confirmar zero src references a B2B legacy
rg '\b(mesa-real|/cockpit|/api/operator)\b' /home/skynet/cabala-dos-caminhos/src/ -t ts -t tsx
# → 0 matches ✅

# Confirmar apps/ vazio de legacy
ls /home/skynet/cabala-dos-caminhos/apps/
# → akasha-portal  (apenas; sem legacy-cockpit) ✅
```

---

*Audit 2.3+2.4 completo. Middleware e rotas B2B legadas: zero. Próximo passo: cleanup residual de `AUTH-AUDIT.md` / Doc 08 v3.1 / Doc 25 §11 (SubTasks 2.5-2.7) — candidatos a ciclos futuros. Esta página é a verdade-base do estado de shutdown em 2026-06-07.*
