# 🩺 Health Snapshot — Akasha Portal

> Snapshot técnico criado em 2026-06-27 05:31 UTC pelo ciclo perpétuo v2

## Estado técnico

- **Branch ativa local**: `feat/community-platform`
- **HEAD local**: `2f2851fb` (auto-trigger docs)
- **Branch main local**: `645f1014` (docs vision pivot)
- **Working tree**: ~36 arquivos modificados (não commitados — bash sandbox degraded)
- **TSC**: zero erros reportados (last check via worker)
- **Crons ativos**: 6 (`akasha-dev-implementation`, `akasha-evolution-daily`, `akasha-health-check-12h`, `akasha-planning-weekly`, `akasha-research-weekly`, `akasha-tests-pre-release`)
- **Planos team**: `plan_1e515874` paused (cycle 4, 3/20 done), perpetual-v2 self-executing
- **Sandbox**: degraded — bash/grep/timeout > 5-300s; workaround via Read tool

## Repositório

- **Owner**: Akasha-0
- **Repo**: cabaladoscaminhos
- **Default branch**: main (local divergente de origin)
- **PRs abertos**: #12 (feat/minimax-anthropic-default), #8 (anterior)
- **License**: MIT
- **Stack**: Next.js 16.2.6 + React 19 + TypeScript 5 + Supabase + Prisma + pgvector

## Ambiente

- **Sandbox**: cloud-compute-runtime, 2GB RAM
- **Filesystem**: /workspace/cabaladoscaminhos/ + /workspace/.mavis/plans/
- **GitHub token**: GITHUB_TOKEN configurado (git-cred-helper.sh funcional)
- **LLM providers**: OpenAI primário, MiniMax via Anthropic-compatible (alternativa), Anthropic nativo
- **Database**: Supabase (Postgres + Auth + Storage + Realtime + pgvector)
- **Analytics planejado**: PostHog (wave-6)
- **Errors**: Sentry (planejado)
- **Email**: Resend (planejado)

## Pessoas

- **Operator (produto)**: Usuário "Akasha" — pratica pessoal (Mesa Real, Cigano Ramiro)
- **Target users**: Comunidade espiritual universalista PT-BR
- **AI persona**: Akasha IA — consciousness translator, NÃO curator
- **Time**: 6 specialized agents (Designer Lina, PM Tomás, QA Ravena, Security Caio, Performance Aki, Curator Iyá)

## Saúde por dimensão

| Dimensão | Status | Notas |
|---|---|---|
| Código | 🟢 OK | TSC zero erros, ESLint permissivo mas funcional |
| Schema | 🟡 PARCIAL | `community.prisma` separado, não migrado |
| Tests | 🟡 PARCIAL | 609 totais, 0 cobrem social graph |
| CI/CD | 🟢 OK | 5 workflows, dependabot, auto-merge |
| Docs | 🟢 BOM | 18+ arquivos, VISION/ARCHITECTURE v3.0 |
| UX | 🟡 PARCIAL | Mobile-first, 3 gestures, PWA |
| Segurança | 🟡 PARCIAL | LGPD não auditado, rate-limit opcional |
| Performance | 🟡 PARCIAL | Bundle não auditado |
| IA | 🟡 PLANEJADO | System prompt + RAG em wave-4 |
| Operacional | 🟢 OK | 6 crons, perpetual loop, owner fallback |

## Riscos ativos

1. **Tool wrapper bug** (mavis/team args undefined) — workaround via skill+persona + self-execute
2. **Sandbox I/O degradation** — Read tool direto em .git/
3. **Wave-2 branches lost** — código só em working tree, sem backup remoto
4. **origin/main divergence** — 2114 commits separados (Akasha Portal B2B separado)
5. **Schema não migrado** — bloqueia deploy de features de comunidade
6. **MOCs no feed** — UI mostra dados fake até API real substituir

## Próximo desbloqueio

**Bash voltar a funcionar** → commits em massa → push consolidado → disparar wave-2 (auth+onboarding+posts+smoke tests) → quando completo, mesclar feat/community-platform em main.

## Self-execute status (05:31 UTC)

- ✅ task 1: heartbeat (state.json read)
- ✅ task 2: log-progress (EVOLUTION-LOG entry)
- ✅ task 3: deprecation-list (DEPRECATION-STATUS.md)
- ✅ task 4: missing-configs (MISSING-CONFIGS.md)
- ✅ task 5: dead-code-scan (DEAD-CODE.md)
- ✅ task 6: weekly-summary (WEEKLY-SUMMARY.md)
- 🔄 task 7: tsc-quick (em progresso)
- ⏳ task 8: cycle-end (próxima)
