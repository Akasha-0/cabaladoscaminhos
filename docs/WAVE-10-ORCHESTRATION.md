# Wave 10 — Orchestration Log

**Data:** 2026-06-27
**Owner:** Mavis (root session)
**Goal:** Polish v3.0 toward v0.1.0-rc.1 release
**Status:** ACTIVE

---

## Contexto

Wave 9 entregou: feed Para Você, perf budgets CI, mocks eliminados, fixes de imports.
Falta pra v0.1.0-rc.1:
- LGPD + security fixes top 3
- Perf quick wins top 3
- Conteúdo biblioteca (20 mais artigos, total 70)
- Mobile + a11y polish final
- Auth Supabase real (não mock)
- Akasha IA MVP (chat RAG)
- E2E smoke test
- CHANGELOG + release notes

---

## Batch 1 (4 paralelos, ~25min cada) — IN PROGRESS

| Worker | Agent | Trilha | Esperado |
|---|---|---|---|
| Wave10-Security-Fixes | General + Caio skill | LGPD + auth hardening + XSS | 3 fixes implementados + testes |
| Wave10-Perf-Fixes | Coder + Aki skill | LCP/CLS/INP quick wins | 3 otimizações + bundle check |
| Wave10-Content-Expansion | General + Iyá skill | 20 artigos (70 total) | Cobertura igualitária 6+ tradições |
| Wave10-Mobile-A11y-Polish | Coder + Lina skill | Touch + safe-area + ARIA | WCAG AA em 3-5 telas |

**Decisão:** max 4 paralelos (sandbox 2GB RAM). Sequential validation após cada batch.

## Batch 2 (3 paralelos, planejado pós-batch-1)

| Worker | Agent | Trilha | Esperado |
|---|---|---|---|
| Wave10-Auth-Supabase | Coder | Real auth wiring (não mock) | Login → sessão → onboarding flow |
| Wave10-Akasha-IA-MVP | Coder + Caio | Chat RAG endpoint + UI | /akashic chat com pgvector |
| Wave10-E2E-Smoke | General + Ravena skill | Playwright critical flows | login + post + feed |

## Sequência

1. Batch 1 launch (agora)
2. Owner valida TSC + lint após cada worker reportar done
3. Owner merge commits de cada worker (push quando todos OK)
4. Batch 2 launch
5. Validação final + CHANGELOG.md + git tag v0.1.0-rc.1

---

## Métricas alvo v0.1.0-rc.1

- [x] TSC: 0 errors
- [ ] Bundle size < budgets definidos
- [ ] 70 artigos (10+ por tradição principal)
- [ ] 5/5 trilhas mobile (touch, safe-area, focus, ARIA, reduced-motion)
- [ ] LGPD: consentimento + direito ao esquecimento funcionando
- [ ] Auth: fluxo real Supabase (não mock)
- [ ] E2E: 3+ fluxos críticos passando (mesmo sem build, smoke em dev)
- [ ] Akasha IA: chat funcional com RAG

---

## Comandos úteis

```bash
# Status
cd /workspace/cabaladoscaminhos && git log --oneline -20

# TSC check
npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS" | grep -v "csstype"

# Lint check
npx eslint src/ --quiet

# Bundle check
pnpm check:bundle  # quando Supabase configurado
```

---

## Workers status (atualizar conforme reports chegam)

- Wave10-Security-Fixes: ACTIVE (spawn OK)
- Wave10-Perf-Fixes: ACTIVE (spawn OK)
- Wave10-Content-Expansion: ACTIVE (spawn OK)
- Wave10-Mobile-A11y-Polish: ACTIVE (spawn OK)
