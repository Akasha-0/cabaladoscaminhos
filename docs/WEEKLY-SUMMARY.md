# 📅 Weekly Summary — Semana de 2026-06-21 a 2026-06-27

> Snapshot semanal criado em 2026-06-27 (UTC) pelo ciclo perpétuo v2

## Esta semana

### Entregas principais

- ✅ **VISION.md v3.0** (12KB) — pivot de B2B para comunidade universalista
- ✅ **ARCHITECTURE.md v3.0** (16KB) — modelo de comunidade + IA como translator
- ✅ **6 docs estratégicos** (STRATEGY, MARKET, UX-RESEARCH, AI-PROMPT, EVIDENCE-MAP, VALIDATION)
- ✅ **Schema community** (13 models novos em `prisma/community.prisma`)
- ✅ **UI da comunidade**: feed, explore, library, notifications, profile, groups, post
- ✅ **Landing `/validacao`** + API waitlist
- ✅ **8 specialized agents criados** (skill+persona workaround para tool wrapper bug)
- ✅ **6 ADRs publicados** + ADR-LINT no CI
- ✅ **DESIGN-SYSTEM.md** (9KB) + 12 components
- ✅ **Notifications system** (27 files: schema + 6 APIs + hook + bell + page + 4 test suites)
- ✅ **Mobile PWA + 3 gestures** + SkipToContent
- ✅ **Search system** (search API + suggestions)
- ✅ **Biblioteca curada** (SQL migration + seed structure)
- ✅ **CI/CD** (pnpm-based + dependabot + auto-merge + ADR-LINT)
- ✅ **QUALITY-STANDARDS.md** + **HONEST-AUDIT-24-7.md** (12KB)
- ✅ **Perpetual loop rodando 24/7** (5 iterações completas + agora v2 self-execute)

### Estatísticas

- 16+ commits na branch `feat/community-platform`
- ~50+ arquivos novos
- ~10000+ linhas de código
- 5 plans team executados (research, wave-2, wave-3, wave-7, perpetual)
- 9 ADRs publicados

## Bloqueios ativos

### Críticos (P0)
- 🔴 **Tool wrapper quebrado** (mavis/team args chegam como `undefined`) — workaround: skill+persona
- 🔴 **Sandbox I/O degradado** (bash/grep/timeout > 5-300s) — workaround: Read tool em `.git/` direto
- 🔴 **2GB RAM OOM** em build/test paralelos — workaround: max_concurrency=1-2

### Importantes (P1)
- 🟡 **Wave-2 branches LOST** (feat/auth-supabase, feat/onboarding-espiritual, feat/posts-api-real, feat/smoke-tests) — sandbox cleanup before push
- 🟡 **Schema migration não aplicada** — `community.prisma` é arquivo separado, não mergeado em schema principal
- 🟡 **FEED mocks ainda ativos** — código novo (posts API real) existe mas não está substituindo mocks
- 🟡 **origin/main divergente** (2114 commits separados) — decisão de merge pendente

### Menores (P2-P3)
- 🟢 CI/CD não validado end-to-end (sandbox não roda GHA)
- 🟢 PR auto-merge config não testado
- 🟢 Detoxify PT-BR não instalado
- 🟢 Backup/restore não configurado

## Decisões tomadas

1. **Pivot para comunidade**: B2B Cockpit Oracular → comunidade universalista + Akasha IA
2. **Akasha IA como translator** (não curator): correlaciona tradição ↔ ciência ↔ experiência humana
3. **PT-BR first, mobile-first, freemium** como targets
4. **Wave strategy**: 7 waves priorizadas (auth/onboarding/content/AI/moderation/analytics/foundation)
5. **24/7 system**: planos team como cron replacements + crons paralelos
6. **6 specialized agents** via skill+persona (designer, pm, qa, security, performance, curator)
7. **Universalist, não proselitismo**: respeitar diferenças, encontrar temas comuns
8. **8 regras éticas da IA**: nunca prescreve, sempre cita, sempre lembra contexto

## Próxima semana (2026-06-28 a 2026-07-04)

### P0 (deve acontecer)
- [ ] **Auth Supabase funcional** — signup/login/logout com middleware
- [ ] **Mesclar community.prisma** no schema principal + migration
- [ ] **Substituir FEED mocks** por API real
- [ ] **Onboarding espiritual** 5 passos (nome, tradições, nascimento, gera mapa)
- [ ] **Fix team tool wrapper** se for bug conhecido do daemon (ou aceitar self-execute)

### P1 (importante)
- [ ] Akasha IA MVP com system prompt + RAG básico
- [ ] Moderação básica (report, hide)
- [ ] Search full-text funcional
- [ ] Mobile polish final
- [ ] Main merge (fast-forward) — após validação

### P2 (nice to have)
- [ ] Detoxify PT-BR
- [ ] PostHog + analytics
- [ ] LGPD compliance audit
- [ ] Renomear `lenormand-cards.ts` → `cartas-ciganas.ts`
- [ ] Adicionar banner deprecation nos 9 docs v1.0

## Aprendizados da semana

1. **Tool wrappers bugs são reais e persistem** — sempre ter workaround documentado
2. **Sandbox I/O degrada** sob uso contínuo — Read tool em `.git/` é mais robusto que bash
3. **2GB RAM é limit** — paralelismo > 2 workers = OOM
4. **Workers perdem work em sandbox cleanup** — sempre commit imediato após task, não esperar batch
5. **Owner self-execute funciona** como fallback — mais lento mas não trava
6. **Crons paralelos são robustos** — 6 crons `akasha-*` rodaram sem depender do team tool
7. **Documentação operacional > aspiracional** — `OPERATIONS.md` com procedimentos reais é melhor que manifesto vago

## Métricas de cadência

- **Commits**: ~3 por dia útil (abaixo da meta de 5/dia)
- **Plans team**: 5 ciclos completos + 1 self-execute
- **Crons paralelos**: 6 ativos, ~3 entregas por dia cada
- **Docs**: 18 arquivos `.md` criados/atualizados
- **Code**: ~10000 linhas (com mocks e infra)
- **Bugs identificados**: 4 P0 (tool wrapper, sandbox I/O, OOM, wave-2 lost)
- **Bugs corrigidos**: 2 (MiniMax via Anthropic, perpetual loop engine)
