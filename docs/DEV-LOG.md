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
