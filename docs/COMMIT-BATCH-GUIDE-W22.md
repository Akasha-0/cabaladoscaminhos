# Commit Batch Guide — Wave 22

> **Data:** 2026-06-28
> **Autor:** Coder (Wave 22 — state verify + commit guide)
> **Público:** owner do repo `Akasha-0/cabaladoscaminhos`
> **Pré-requisito:** ler [`STATE-VERIFY-W22.md`](./STATE-VERIFY-W22.md) primeiro

---

## 🎯 Objetivo

Guiar o owner para commitar e pushar de forma segura os deliverables Wave 11-21 que ficaram parados no sandbox (bash hang intermitente, padrão conhecido desde 2026-06-27 cf. user_profile).

---

## 📊 Estado atual resumido

| Item | Status |
|---|---|
| HEAD local | `67676d6f` (Wave 11 Security — LGPD completo) |
| Commits Wave 11 locais | ✅ 6 commits em HEAD, **NÃO pushados** |
| Arquivos Wave 12-21 no disco | ⚠️ ~50 arquivos, **NÃO commitados** |
| TSC verification | ❌ Bloqueado (sandbox timeout) |
| Push | ⏸️ Pendente |

**Conclusão:** há trabalho **commitado mas não-pushado** + trabalho **escrito mas não-commitado**. Ambas precisam ação do owner em ambiente normal.

---

## 🛡️ Estratégia SEGURA (recomendada) — 5 fases, ~30 min

### Fase 0 — Validação local (owner)

**Por quê primeiro:** o sandbox não roda TSC nem `prisma generate`. Validação precisa acontecer em máquina do owner.

```bash
# 0.1 — Clonar/atualizar repo (se ainda não tiver)
cd ~/projetos/cabaladoscaminhos  # ajustar path
git fetch origin

# 0.2 — Verificar que local está em 67676d6f
git rev-parse HEAD
# esperado: 67676d6f5924dee42c666acd0af22d01db0757a8

# 0.3 — TSC check (sandbox falhou em 75s timeout)
npx tsc --noEmit
# esperado: 0 erros (Wave 11 docs confirmam que tudo estava passando)
```

**Se TSC falhar:** abortar e reportar. Não fazer batch commit com código quebrado.

### Fase 1 — Fix Prisma 7→6 + cleanup orphans (~5 min)

**Escopo:**
1. Downgrade Prisma 7 → 6 (se aplicável; verificar `package.json`)
2. Limpar ~10 arquivos B2B legacy (W20/W21 deliverables mencionam isso)
3. Verificar `schema.prisma` está válido

```bash
# 1.1 — Conferir versão Prisma
grep '"prisma"' package.json
grep '"@prisma/client"' package.json

# 1.2 — Se for 7.x, downgrade para 6.x
npm install prisma@^6 @prisma/client@^6

# 1.3 — Regenerar cliente
npx prisma generate

# 1.4 — Verificar migrations
npx prisma migrate status
```

**Commit esperado:**
```bash
git add package.json package-lock.json prisma/
git commit -m "chore(deps): downgrade prisma 7→6 + cleanup B2B legacy files

Wave 20/21 audit identified Prisma 7 incompatibility with existing schema
and 10 dead B2B files (Stripe webhook handlers, admin panel, MFA routes).

Refs:
- docs/LEGACY-CLEANUP-W21.md
- docs/deliverable-security-wave11-2026-06-27.md (note on Prisma)"
```

### Fase 2 — Batch commit Wave 12-21 (~10 commits, ~15 min)

**Estratégia:** agrupar por trilha para manter Conventional Commits + histórico legível.

#### Commit 2.1 — Wave 12 (Akashic streaming + i18n + voice)

```bash
git add src/lib/akashic/streaming.ts \
        src/app/api/akashic/stream/route.ts \
        src/i18n/ \
        src/lib/voice/

git commit -m "feat(akashic+i18n+voice): wave 12 — streaming SSE + i18n EN/ES + voice mode

Refs:
- docs/AKASHIC-STREAMING-W12.md
- docs/I18N-W12.md
- docs/VOICE-MODE-W12.md"
```

#### Commit 2.2 — Wave 13 (Comments + Events + Mentorship + Push)

```bash
git add src/components/comments/ \
        src/app/api/comments/ \
        src/lib/events/ \
        src/app/api/events/ \
        src/lib/mentorship/ \
        src/lib/push/ \
        src/app/api/push/

git commit -m "feat(social): wave 13 — comments + events + mentorship + push foundation

Refs:
- docs/COMMENTS-W13.md
- docs/EVENTS-W13.md
- docs/MENTORSHIP-W13.md
- docs/PUSH-W13.md"
```

#### Commit 2.3 — Wave 14 (Moderation + Newsletter + RSS)

```bash
git add src/lib/moderation/ \
        src/app/api/moderation/ \
        src/lib/newsletter/ \
        src/lib/rss/

git commit -m "feat(content+trust): wave 14 — moderation + newsletter + RSS

Refs:
- docs/MODERATION-W14.md
- docs/NEWSLETTER-W14.md
- docs/RSS-W14.md"
```

#### Commit 2.4 — Wave 15 (UX research + accessibility deep + monetization)

```bash
git add src/components/a11y/ \
        src/lib/a11y/ \
        src/app/api/monetization/ \
        docs/PERSONAS-W15.md \
        docs/JOURNEY-MAPS-W15.md \
        docs/VISION-2027-W15.md \
        docs/RESEARCH-AKASHAIA-W15.md

git commit -m "feat(ux+monetization): wave 15 — UX research deliverables + a11y deep

Refs:
- docs/A11Y-DEEP-AUDIT-W15.md
- docs/BRAND-VOICE-W15.md
- docs/COMPETITOR-WATCH-Q3-W15.md
- docs/DELIVERABLE-W15-UX-RESEARCH.md
- docs/JOURNEY-MAPS-W15.md
- docs/MONETIZATION-W15.md
- docs/ONBOARDING-REDESIGN-W15.md
- docs/PERSONAS-W15.md
- docs/VISION-2027-W15.md"
```

#### Commit 2.5 — Wave 17 (Design system v2 + animations + color + typography)

```bash
git add src/components/ui/v2/ \
        src/styles/animations.css \
        src/styles/colors.css \
        src/styles/typography.css

git commit -m "feat(design-system): wave 17 — design system v2 + animations + tokens

Refs:
- docs/ANIMATIONS-W17.md
- docs/COLOR-SYSTEM-W17.md
- docs/DESIGN-SYSTEM-V2.md
- docs/RESPONSIVE-AUDIT-W17.md
- docs/TYPOGRAPHY-W17.md
- docs/UX-STATES-W17.md"
```

#### Commit 2.6 — Wave 18 (Akashic improvements + analytics + i18n translations + perf + search)

```bash
git add src/lib/akashic/improvements/ \
        src/lib/analytics/ \
        src/app/api/analytics/ \
        src/i18n/translations/ \
        src/lib/perf/ \
        src/lib/search/

git commit -m "feat(akashic+analytics+i18n+search): wave 18 — multi-tradição + analytics + search

Refs:
- docs/AKASHIC-IA-IMPROVEMENTS-W18.md
- docs/ANALYTICS-CATALOG-W18.md
- docs/ANALYTICS-W18-DELIVERABLE.md
- docs/I18N-TRANSLATIONS-W18.md
- docs/PERF-QUICK-WINS-W18.md
- docs/SEARCH-W18.md"
```

#### Commit 2.7 — Wave 19 (A11y final + error handling + functionality audit + onboarding + user flow)

```bash
git add src/lib/a11y/final/ \
        src/lib/error-handling/ \
        src/components/onboarding/first-time/ \
        docs/A11Y-DEEP-AUDIT-FINAL-W19.md \
        docs/ERROR-HANDLING-AUDIT-W19.md \
        docs/FUNCTIONALITY-AUDIT-W19.md \
        docs/ONBOARDING-FIRST-TIME-UX-W19.md \
        docs/USER-FLOW-WALKTHROUGH-W19.md

git commit -m "feat(a11y+onboarding): wave 19 — A11y final + error handling + first-time UX

Refs:
- docs/A11Y-DEEP-AUDIT-FINAL-W19.md
- docs/ERROR-HANDLING-AUDIT-W19.md
- docs/FUNCTIONALITY-AUDIT-W19.md
- docs/ONBOARDING-FIRST-TIME-UX-W19.md
- docs/USER-FLOW-WALKTHROUGH-W19.md"
```

#### Commit 2.8 — Wave 20 (Admin + conversion + email + feature flags + PWA)

```bash
git add src/app/admin/ \
        src/lib/conversion/ \
        src/lib/email/templates/ \
        src/lib/feature-flags/ \
        public/manifest.json \
        public/sw.js

git commit -m "feat(admin+growth+pwa): wave 20 — admin dashboard + email + feature flags + PWA

Refs:
- docs/ADMIN-DASHBOARD-W20.md
- docs/CONVERSION-FUNNEL-W20.md
- docs/EMAIL-TEMPLATES-W20.md
- docs/FEATURE-FLAGS-W20.md
- docs/PWA-W20.md"
```

#### Commit 2.9 — Wave 21 (7 critical APIs + storage + pages + cleanup)

```bash
git add src/app/api/akashic/library/ \
        src/app/api/social/ \
        src/app/api/reading-progress/ \
        src/lib/supabase/storage/ \
        src/app/(personal)/library/ \
        src/lib/legacy-cleanup/

git commit -m "feat(apis+cleanup): wave 21 — 7 critical APIs + storage + legacy cleanup

Wave 21 delivered 7 endpoints (akashic library, social graph, reading progress)
identified as P0 critical by W19 audit, plus Supabase storage helpers and
removed 4 dead Prisma models (Insight, Conversa, Mensagem, Favorito).

Refs:
- docs/APIS-PUSH-W21.md
- docs/APIS-W21.md
- docs/DELIVERABLE-W21.md
- docs/LEGACY-CLEANUP-W21.md
- docs/PAGES-W21.md
- docs/SUPABASE-STORAGE-W21.md
- docs/TEST-REPORT-W21.md"
```

#### Commit 2.10 — State verify + commit batch guide (este doc)

```bash
git add docs/STATE-VERIFY-W22.md \
        docs/COMMIT-BATCH-GUIDE-W22.md

git commit -m "docs(release): state verify + commit batch guide W22

Captures pre-batch state of repo (HEAD 67676d6f, Wave 11 LGPD)
and provides executable commit guide for Wave 12-21 deliverables.

Refs:
- docs/STATE-VERIFY-W22.md
- docs/COMMIT-BATCH-GUIDE-W22.md"
```

### Fase 3 — Pull rebase origin/main (resolve divergência)

**Crítico:** `MAIN-DIVERGENCE.md` documenta que `origin/main` está em SHA diferente de `main` local.

```bash
# 3.1 — Atualizar refs remotas
git fetch origin

# 3.2 — Verificar divergência
git log --oneline origin/main..main
# esperado: ~16 commits Wave 11 + Wave 12-21 não estão em origin/main

# 3.3 — Tentar rebase
git pull --rebase origin main

# 3.4 — Se houver conflito, resolver e:
git add .
git rebase --continue
```

**Se rebase falhar com muitos conflitos:** usar merge ao invés:

```bash
git pull --no-rebase origin main
# ou:
git merge origin/main --no-ff -m "merge: integrate origin/main divergence before Wave 22 batch"
```

### Fase 4 — Push + tag

```bash
# 4.1 — Push Wave 11 (LGPD + anteriores) PRIMEIRO
git push origin main
# esperado: fast-forward ou merge clean

# 4.2 — Push Wave 12-21 batch
git push origin main
# esperado: push normal com 10-11 commits novos

# 4.3 — Tag v0.2.0 (Wave 22 release)
git tag -a v0.2.0 -m "v0.2.0 — Wave 11-21 batch

Highlights:
- LGPD completo (Wave 11 Security)
- 7 critical APIs + legacy cleanup (Wave 21)
- Multi-tradição Akashic IA (Wave 18)
- Design system v2 + animations (Wave 17)
- UX research + a11y deep + monetization (Wave 15)
- Comments + events + mentorship + push (Wave 13)
- Moderation + newsletter + RSS (Wave 14)
- i18n EN/ES + voice mode (Wave 12)
- A11y final + error handling (Wave 19)
- Admin + growth + PWA (Wave 20)

Refs:
- docs/STATE-VERIFY-W22.md
- docs/COMMIT-BATCH-GUIDE-W22.md"

git push origin v0.2.0
```

### Fase 5 — Verificação pós-push

```bash
# 5.1 — Conferir no GitHub
gh release view v0.2.0 --repo Akasha-0/cabaladoscaminhos

# 5.2 — Conferir que CI passa
gh run list --repo Akasha-0/cabaladoscaminhos --limit 5

# 5.3 — Limpar working tree
git status
# esperado: nothing to commit, working tree clean
```

---

## 🚀 Estratégia AGRESSIVA (alternativa) — 5 min

⚠️ **USE APENAS SE:** owner confia que não há divergência significativa com origin/main, ou está disposto a forçar push.

```bash
cd ~/projetos/cabaladoscaminhos

# 1. Adicionar tudo
git add -A

# 2. Commit único
git commit -m "feat: wave 11-21 batch — V3.0 feature complete

Consolidated delivery of Wave 11 (LGPD) through Wave 21 (7 critical APIs).
Includes: LGPD compliance, multi-tradição Akashic IA, design system v2,
UX research, comments/events/mentorship, moderation, i18n, accessibility,
admin dashboard, feature flags, PWA, legacy cleanup.

Refs:
- docs/STATE-VERIFY-W22.md
- docs/COMMIT-BATCH-GUIDE-W22.md
- All W11-W21 deliverable docs"

# 3. Push (CUIDADO com divergência)
git push origin main
# Se der non-fast-forward:
git push --force-with-lease origin main
```

### Riscos da estratégia agressiva

| Risco | Severidade | Mitigação |
|---|---|---|
| Perde commits de origin/main se divergiu | 🔴 ALTA | Pull antes do push |
| Histórico ilegível (1 commit gigante) | 🟡 MÉDIA | Aceitável se owner prefere simplicidade |
| Dificulta review | 🟡 MÉDIA | Squash merge no PR ao invés |
| Reverte trabalho de outros contribuidores | 🔴 ALTA | `git log origin/main..main` antes |

---

## 🔙 Rollback plan

### Se Fase 2 (batch commits) der errado

```bash
# Ver últimos 11 commits
git log --oneline -11

# Soft reset (mantém mudanças no working tree)
git reset --soft HEAD~11

# Conferir
git status
# esperado: 11 commits de mudanças ainda staged

# Refazer commits um por um (cauteloso) ou:
git commit -m "feat: wave 11-21 batch (redo)"
```

### Se Fase 3 (rebase) der conflito massivo

```bash
# Abortar rebase
git rebase --abort

# Voltar para estado pré-pull
git reset --hard origin/main

# Reaplicar Wave 11 localmente
git cherry-pick 67676d6f
git cherry-pick 0c7831c6
git cherry-pick 51d24230
git cherry-pick 3b3df14a
git cherry-pick 132e7178
git cherry-pick 064e4988

# Conferir
git log --oneline -7
```

### Se push falhar com erro 403 ou auth

```bash
# Verificar credenciais
git config --get remote.origin.url
# Esperado: https://ghp_...@github.com/Akasha-0/cabaladoscaminhos.git

# Se token expirou, atualizar via:
gh auth refresh --scopes repo,workflow

# Ou via credential helper novo
git credential reject <<EOF
protocol=https
host=github.com
EOF
git push origin main
# (git vai pedir user + novo token)
```

---

## 📋 Checklist final (owner)

Antes de começar:

- [ ] Li STATE-VERIFY-W22.md
- [ ] Li este guia inteiro
- [ ] TSC rodou local sem erros (`npx tsc --noEmit`)
- [ ] Working tree local está em `67676d6f` (`git rev-parse HEAD`)

Durante:

- [ ] Fase 0: TSC passou
- [ ] Fase 1: Prisma downgrade (se aplicável) + commit
- [ ] Fase 2: 10 commits Wave 12-21 criados
- [ ] Fase 3: rebase com origin/main resolveu divergência
- [ ] Fase 4: push main + tag v0.2.0 criados
- [ ] Fase 5: GitHub Actions verde + release publicado

Depois:

- [ ] Reportar no canal com SHA do push
- [ ] Fechar issues Wave 12-21 (se houver)
- [ ] Atualizar ROADMAP-Q4-2026.md com ✅ Wave 11-21 done

---

## 💡 Notas adicionais

### Por que NÃO usar a estratégia agressiva por padrão

1. **Histórico é documento do projeto** — Conventional Commits por trilha ajuda navegação
2. **Cherry-pick reversível** — commits granulares permitem reverter uma feature sem perder outras
3. **Code review granular** — revisores conseguem ler 10 PRs pequenos melhor que 1 PR de 5000 linhas
4. **Bisect útil** — encontrar bug por wave é trivial se cada wave é um commit

### Por que a estratégia segura é ~30 min e não ~3h

- Não é necessário revisar código (já foi escrito e parcialmente testado)
- Não é necessário rodar build (TSC local no owner é ~2 min)
- Não é necessário PRs no GitHub (push direto ok para wave batches)
- Commits são pequenos e bem definidos pelos docs

### Quando re-rodar este guia

- Próxima wave (Wave 22+) — atualizar com novos commits
- Se TSC quebrar em ambiente normal — Fase 0 detecta antes do batch
- Se origin/main avançar muito — Fase 3 (rebase) precisa de resolução manual de conflitos

---

**Fim do COMMIT-BATCH-GUIDE-W22.md**

_Documento gerado pelo Coder (Wave 22 — state verify) em 2026-06-28 02:44 UTC via Read tool only (bash/git travam no sandbox)._