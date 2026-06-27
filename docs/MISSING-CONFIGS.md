# 🔧 Missing Configs Audit

> Snapshot criado em 2026-06-27 (UTC) pelo ciclo perpétuo v2
> Verificação de gaps em configuração do projeto

## .env.example — STATUS: ✅ Bom

49 linhas, 9 seções cobertas:
- ✅ DATABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_URL + ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ OPENAI_API_KEY + modelo + retry config
- ✅ ANTHROPIC_BASE_URL/TOKEN (alternativa MiniMax)
- ✅ REDIS_URL (opcional)
- ✅ NEXT_PUBLIC_APP_URL
- ✅ NODE_ENV

**Minor:** Falta documentar `POSTHOG_API_KEY` (analytics) e `RESEND_API_KEY` (email) — ambas planejadas no wave-6 mas não no exemplo.

## README.md — STATUS: ✅ Bom

163 linhas, com:
- ✅ Badges (status, stack, license, CI)
- ✅ Seção "O que é" + Propósito
- ✅ Links para VISION.md / docs/ / CONTRIBUTING.md
- ✅ Tech stack

**Verificar:** Seção de "Quick Start" / "Como rodar localmente" não conferida neste snapshot — verificar se tem instruções de `pnpm install && pnpm dev`.

## ESLint — STATUS: ✅ Configurado mas permissivo

22 linhas, `eslint-config-next` + Prettier.
**Issue:** Regras `@typescript-eslint/no-explicit-any: "off"` — desliga proteção contra `any`. Recomendação: P3 — reativar quando projeto tiver type safety forte o suficiente (Fase 2+).

## CI/CD — STATUS: ✅ Bom (5 workflows)

- ✅ `ci.yml` — Lint + TypeCheck + Tests + Build
- ✅ `auto-merge.yml` — Dependabot auto-merge
- ✅ `preview-deploy.yml` — Vercel preview
- ✅ `quality-evals.yml` — Quality gates
- ✅ `security.yml` — Security scan

**Verificar:** Se rodam em pnpm (não npm) — `pnpm-lock.yaml` está no repo.

## AGENTS.md — STATUS: ✅ Existe

Conteúdo: Não verificado neste snapshot, mas o arquivo existe na raiz.

## CONTRIBUTING.md — STATUS: ✅ Existe

Não verificado em detalhe. Arquivo presente.

## Architecture Decision Records (ADR) — STATUS: ✅ Bom

- 6 ADRs criados em `docs/adr/` (Next.js 16, Supabase, pgvector, Akasha IA translator, PT-BR first, Universalist)
- ADR-LINT.yml no CI valida numeração

## Faltando ou incompleto

### P1 (importante)
- [ ] Adicionar `POSTHOG_API_KEY` em `.env.example`
- [ ] Adicionar `RESEND_API_KEY` em `.env.example`
- [ ] Documentar processo de migration Prisma (passos manuais vs `prisma migrate dev`)
- [ ] Verificar se README tem seção "Quick Start" com `pnpm install && pnpm dev`

### P2 (nice to have)
- [ ] Adicionar `vitest.config.ts` comments explicando estratégia de testes
- [ ] Adicionar `.editorconfig` se não existir
- [ ] Adicionar `LICENSE` confirmado (MIT — verificar arquivo)
- [ ] Adicionar `CODE_OF_CONDUCT.md` (comunidade precisa)

### P3 (depois)
- [ ] Storybook config (se virar design system maior)
- [ ] Husky pre-commit hooks
- [ ] lint-staged config

## Verificações adicionais (não executadas por bash degradado)

- [ ] `pnpm-lock.yaml` é o lockfile correto
- [ ] CI roda em Node 20+ (não 18)
- [ ] Vercel deploy funciona (preview deploys via PR)
- [ ] Supabase migrations aplicadas em prod
