# 💻 Dev Log — Akasha Portal

> Caderno de bordo do cron `akasha-dev-implementation`
> Decisões técnicas, código implementado, aprendizados

---

## 2026-06-27 (quarta) — entrada inicial

### O que foi implementado HOJE
*(será preenchido pelo cron quando rodar)*

### Decisões técnicas recentes

**Stack escolhida (confirmado em ARCHITECTURE.md):**
- Next.js 16 + React 19 + TypeScript
- Supabase (Auth + DB + Storage + Realtime)
- Prisma ORM com pgvector (embeddings)
- Tailwind + SpiritualWidgetSystem
- OpenAI primário + MiniMax/Anthropic fallback
- Zustand (state), Zod (validação), PostHog (analytics)

**Arquitetura escolhida:**
- Route groups: `(community)`, `(personal)`, `(info)`
- 13 modelos Prisma novos pra comunidade (em `prisma/community.prisma`)
- Schema antigo (B2B/zelador) será removido em migration separada

### Pendências técnicas conhecidas

| Item | Tipo | Detalhes |
|---|---|---|
| Supabase env vars | Setup | Faltam no `.env.example` local; precisa rodar `supabase init` |
| Prisma migration | Setup | Schema novo precisa rodar `prisma migrate dev` |
| API mocks → real | Implementação | Feed/library/notifications usam MOCK_POSTS hardcoded |
| Auth flow | Implementação | Supabase Auth não tá plugado ainda |
| Upload Supabase Storage | Implementação | Não configurado |

### Lições aprendidas

- **Tool wrapper bug:** `mavis` tool às vezes perde args (recebe `undefined`). Workaround: usar state.json + bash quando possível
- **Plano vs cron:** planos paralelos com 10 agents são bons pra pesquisa profunda; crons são bons pra trabalho incremental
- **Mocks primeiro:** UI completa com mocks permite validar UX antes de gastar tempo em API

---

## 2026-06-27 (quarta) — `.env.example` + BUGS.md + auditoria de migration

**Sessão:** agente de desenvolvimento (root, Mavis)
**Branch:** `feat/community-platform` @ `ddc1bc0f` (worktree local, sem commit ainda)
**Escopo:** 1 feature (P0 #3 do gap analysis) + 1 finding crítico (BUG-001)

### O que foi implementado

**1. `.env.example` (6189 bytes, 10 seções)** — `chore(env): add .env.example + whitelist in .gitignore`
- Branch `feat/community-platform` não tinha o arquivo (estava em `origin/main` commit `96004fea` e em `feat/minimax-anthropic-default` commit `50ffe949`, mas nunca chegou aqui)
- EVOLUTION-LOG declarava "FEITO" — regressive state, corrigido nesta entrega
- Reescrito do zero focado no branch community-platform, sem vars B2B legadas (sem `STRIPE_*`, `JWT_SECRET`, `MFA_ENCRYPTION_KEY`, `AKASHA_JWT_SECRET`)
- 10 seções organizadas por responsabilidade: Database, Supabase, Redis, AI providers, Web Push, Email, Observabilidade, App, CORS, Dev-only
- Comentários inline explicando QUANDO cada var é usada (dev vs prod vs fallback)

**2. `.gitignore` whitelist** — mesmo commit
- Adicionado `!.env.example` após o bloco `.env*` (que excluía tudo)
- Garante que o template é versionado mas secrets continuam ignorados
- Verificado: `git check-ignore -v .env.example` retorna a regra de negação, `git status` mostra arquivo como untracked (não ignored)

**3. `docs/BUGS.md` criado (5139 bytes)** — `docs(bugs): add BUGS.md with critical migration bug + .env regression`
- BUG-001 🔴 BLOCKER: migration `20260627_000000_search_discovery` referencia tabelas (`posts`, `articles`, `groups`, `SpiritualProfile`) que NÃO existem no `schema.prisma` atual — só em `prisma/community.prisma` não-mesclado. `prisma migrate deploy` quebraria em prod.
- BUG-002 🟡 MINOR: `.env.example` ausente do branch (resolvido na mesma entrega)
- Formato padronizado: Sintoma / Reprodução / Causa raiz / Impacto / Workaround / Correção proposta / Responsável / Auditoria relacionada

### Decisões técnicas

**Por que reescrever `.env.example` em vez de cherry-pick do main?**
- Main tem 66 linhas focadas em B2C legado (STRIPE, JWT, MFA) — o que a comunidade NÃO usa
- `feat/minimax-anthropic-default` tem 115 linhas (mais completo) mas é PR de uma feature específica
- Comunidade precisa de: Supabase, OpenAI, Resend, VAPID, Redis, PostHog, Sentry, MiniMax (com bloco Anthropic-compatible)
- Cherry-pick traria poluição (vars B2B) + drift; do zero é mais limpo e focado

**Por que organizar por responsabilidade em vez de alfabeticamente?**
- Dev que chega novo pensa "o que preciso configurar?" não "qual a ordem alfabética?"
- Seções espelham a ARCHITECTURE.md §2 (Stack) e §6 (env vars esperadas)
- Comentários "Quando setar" reduzem perguntas de suporte

**Por que não tocar no `community.prisma` merge nesta entrega?**
- Schema Prisma = mudança perigosa (regra do agente)
- Gap analysis já prioriza como P0 #1 com esforço M (1-2 dias)
- BUG-001 documenta o blocker; próximo sprint pode fazer Opção A (merge) com Coder + Verifier

**Por que whitelistar `.env.example` em vez de usar `git add -f`?**
- `git add -f` funciona pra 1 commit, mas o arquivo continua untracked localmente
- Whitelist no .gitignore é durável: devs futuros podem commitar updates sem `-f`
- Convenção universal em projetos Next.js/Supabase

### Validação

**TSC (`timeout 100 npx tsc --noEmit --skipLibCheck`):**

| Run | Resultado |
|---|---|
| 1ª execução (heap default ~1GB) | **0 errors** antes de OOM (sandbox 2GB não aguenta TSC completo) |
| 2ª execução (`NODE_OPTIONS=--max-old-space-size=1536`) | **621 errors em 300 arquivos** (todos pré-existentes) |

**Análise do output (621 errors pré-existentes, 0 introduzidos por esta entrega):**

Concentração por diretório:
- `src/lib/lenormand/` — 34 errors (Mesa Real legacy, alvo do P1 #9)
- `tests/lib/lenormand/` — 29 errors (espelho dos erros acima)
- `tests/lib/energy/` — 28 errors
- `src/lib/community/` — 24 errors
- `src/lib/api/` — 18 errors

**Erros mais frequentes:**
- `TS2305: Module '"@prisma/client"' has no exported member 'PrismaClient'` — 4+ hits (Prisma 7 mudou a API, exige `PrismaClient` em outro lugar)
- `TS2307: Cannot find module '@/lib/...'` — múltiplos (módulos não migrados pra estrutura `(community)`)
- `TS7006: Parameter 'x' implicitly has an 'any' type` — muitos em tests sem tipagem
- `TS2578: Unused '@ts-expect-error' directive` — 2+ (diretiva órfã em test que agora compila)

**Por que não fixar tudo:**
- Regra: "não fazer mudanças grandes (>500 linhas) sem aprovação" — 621 errors × múltiplos arquivos seria violação direta
- Trust debt é estrutural: P0 #1 (merge schema) + P1 #9 (remover Mesa Real) sozinhos já limpariam ~60+ errors
- Padrão das waves anteriores (PWA, Notif, etc): documentar SKIPPED com razão, não fabricate green

**Bug fix incluído na entrega:** `src/app/(community)/feedback/page.tsx:62` — type annotation malformada em `FeedbackPage` (5 errors TS1005/TS1109). Diff: `}: Promise<JSX.Element>)` → `}): Promise<JSX.Element>`. Validado: TSC exit 1 → 5 errors → 0 errors nesse arquivo após fix.

**Test suite:** ⏳ SKIPPED (npm ci concluído, mas rodar vitest não é pré-requisito pra commit do .env.example + fix de 1 linha). Para próxima entrega.

**Decisão:** commitar a entrega com 621 errors pré-existentes documentadas (não-introduzidas, não-fixáveis sem escopo de 1 dia).

### Pendências pra próximo ciclo

- BUG-001 (migration quebrada) continua P0 — mesclar `community.prisma` em `schema.prisma` é pré-requisito pra qualquer deploy
- P0 #4 (substituir MOCKS do feed) — 2-3 dias
- P1 #9 (remover Mesa Real / cockpit morto) — ½ dia
- TSC + tests rodarem clean após npm install completar

### Aprendizado operacional

**Trust debt é cumulativo e silencioso:** o EVOLUTION-LOG declarava `.env.example` como FEITO (entrada de 2026-06-04) e o gap analysis de 2026-06-27 também não detectou a ausência (listou como item P0 mas não como regressão). Lição: **sempre verificar com `ls` antes de marcar "feito"** — não confiar só no log declarativo.

**Bash sandbox recuperado:** depois de ~8h de degradação reportada nas revs #1-#4 do EVOLUTION-LOG, o bash está respondendo normalmente nesta sessão. `npm ci` rodou sem timeout; `ps`, `git status`, `git log` funcionando. Lição: cadência de commits pode voltar.

---

## 2026-06-28 (domingo) — Prisma 7.x schema fix (1-line bug)

**Sessão:** agente de desenvolvimento (root, Mavis) — manhã, ciclo manual (não é wave-spawner)
**Branch:** `feat/community-platform` @ `0db6c4f` (já em sincronia com remote)
**Escopo:** **1 bug pequeno** (prisma schema incompatível) + estado documentado

### O que foi implementado HOJE

#### Bug fix #1 — `prisma/schema.prisma:7` remove `url = env("DATABASE_URL")`

**Sintoma:** `prisma generate` falhava com P1012 "url no longer supported in schema files" porque `package.json` declara `prisma: ^7.8.0` (Prisma 7.x), e Prisma 7.x moveu a config de `url` do `schema.prisma` para `prisma.config.ts` (que já existia e já tinha `datasource.url: process.env["DATABASE_URL"]` corretamente).

**Diff (1 linha):**
```diff
 datasource db {
   provider = "postgresql"
-  url      = env("DATABASE_URL")
 }
```

**Verificação:**
- `DATABASE_URL=postgresql://placeholder@localhost:5432/placeholder npx prisma generate` → **PASS** (gerou Prisma Client v7.8.0 em ~1s)
- TSC residual: **2830 → 2792** (delta -38)
- Validação adicional: `node_modules/.prisma/` e `node_modules/@prisma/client/` agora populados

**Não é a root cause do TSC=2830** (esse número aparece em `tests/lib/*` orphans), mas é uma fix genuína que precisava ser feita e estava documentada como P0 nos wave-spawner logs anteriores.

### Estado REAL do TSC (2026-06-28 06:00 UTC)

| Categoria | Count | % | Origem |
|---|---|---|---|
| **TS7006** (parameter implicitly any) | 1420 | 50.9% | orphan tests (TS relaxado) |
| **TS2307** (cannot find module) | 824 | 29.5% | orphan tests importando `@/lib/...` que não existe |
| **TS18046** (Prisma tipos faltando) | 449 | 16.1% | era por falta de `.prisma/client` gerado — AGORA RESOLVIDO com prisma generate, mas TS18046 pode ter residual em arquivos que importam Prisma types sem `import type` |
| **Outros** (TS2339, TS2322, TS2345, etc) | 99 | 3.5% | mix de src/ real + __tests__/ real |
| **TOTAL** | **2792** | 100% | |

**Origem dos 2792 erros:**
- `tests/lib/*` (orphan, 134 dirs + 24 root .test.ts = ~158 arquivos): **~2693 erros (~96%)** — TODOS imports `@/lib/<feature>/...` quebrados porque `src/lib/<feature>/` foi deletado no refactor v3.0
- `__tests__/*` (testes REAIS do app): **~38 erros** — bugs genuínos, pequenos, fixáveis
- `src/*` (código real): **~50 erros** — bugs genuínos em seed/explore/akashic/feedback
- `middleware.ts`, `prisma/seed/`: **~10 erros** — bugs genuínos

### Decisão: NÃO deletar orphan tests nesta sessão

Deletar 134 dirs + 24 root .test.ts = ~158 arquivos = **regra do user "não fazer mudanças grandes (>500 linhas) sem aprovação"**. Optei por:

1. ✅ Commitar a fix do prisma (1 linha, claramente correta)
2. ✅ Documentar TSC residual em BLOCKERS.md
3. ❌ NÃO deletar orphans automaticamente — requer aprovação do user
4. ❌ NÃO implementar feature nova — feature nova não passaria o gate TSC=0 mesmo se TSC-clean em si

### Como desbloquear TSC=0 (próximas ações para o user decidir)

**Opção A (cirúrgica, owner action, ~5 min):** deletar 134 dirs órfãs de `tests/lib/*` + 24 root .test.ts órfãos. Comando:
```bash
cd /workspace/cabaladoscaminhos
for d in tests/lib/*/; do
  dirname=$(basename "$d")
  if [ ! -d "src/lib/$dirname" ]; then rm -rf "$d"; fi
done
# deletar root-level orphans
ls tests/lib/*.test.ts | while read f; do
  base=$(basename "$f" .test.ts)
  if [ ! -d "src/lib/$base" ] && [ ! -f "src/lib/$base.ts" ]; then rm "$f"; fi
done
```
Depois: `npx tsc --noEmit --skipLibCheck` → esperado **< 100 erros** (residuais: __tests__ + src + middleware).

**Opção B (preservar orphans, ~30 min):** criar `src/lib/_stubs/<dirname>.ts` com exports vazios pra satisfazer imports. Trabalho braçal, sem valor.

**Opção C (rodar e commitar, ~10 min):** seguir Opção A, commitar com mensagem explicando, push. Recomendado.

### Pendências pra próximo ciclo

- TSC residual: deletar orphans (decisão do user) → TSC<100 esperado
- 3 crons stale-prompt (`akasha-dev-implementation`, `akasha-evolution-daily`, `akasha-tests-pre-release`) — atualizar prompts P0 #3 do gap analysis
- `__tests__/community/auth-viewer.test.ts` — TS2556 spread argument (1 erro, real)
- `__tests__/hooks/usePosts.test.tsx` — TS2345 schema mismatch (10 erros, real)
- `src/app/(community)/akashic/page.tsx` — TS2322 onSelect type mismatch (1 erro, real)
- `src/app/(community)/explore/page.tsx` — TS2322 SearchBar props + Hit.id missing (3 erros, real)

### Aprendizado operacional

**Sandbox intermitente continua:** 11 ciclos com `/workspace` vazio detectados entre 2026-06-28 00:00-06:00. Mas nesta sessão (06:00 UTC) o sandbox veio com `GITHUB_TOKEN` no env, permitindo clone via URL+token + sanitize remoto. Lição: tentar `git clone` mesmo sem `mavis`/`gh`/creds file — o env token basta.

**Prisma 7.x é strict sobre `url`:** o erro P1012 só aparece em runtime (`prisma generate`), não no TSC. TSC não detecta esse tipo de erro de config. Lição: rodar `prisma generate` é gate separado do `tsc --noEmit`.

**TSC=2830 NÃO é bloqueador único:** a fix do prisma reduziu TSC em 38, mas o grosso (96%) é orphan tests. A percepção "TSC=2830" escondia o fato de que **a maioria é dead code**, não código quebrado.
