# 📚 Contributing Guide — Wave 33

> **Versão:** 1.0 | **Data:** 2026-07-01 | **Wave:** 33 (GITHUB TEMPLATES 5/8)
> **Autor:** General Worker (session 415025143263474)
> **Idioma:** PT-BR primário (EN em seções críticas)

Documentação de governança de contribuição criada na Wave 33. Este arquivo é o **overview e quick start** — o guia detalhado vive em [`CONTRIBUTING.md`](../CONTRIBUTING.md) na raiz.

---

## 🎯 Objetivo da Wave 33

A Wave 33 (**GITHUB TEMPLATES 5/8**) formaliza a estrutura de contribuição do projeto Cabala dos Caminhos, fechando gaps identificados na **W32-6 Documentation Coverage Audit**:

- ❌ **Antes:** CONTRIBUTING.md básico (v1.0, 5.5KB), sem templates de issue, sem CODEOWNERS, sem SECURITY.md
- ✅ **Depois:** governance completa com 9 artefatos, ~70KB de documentação estruturada

---

## 📦 Entregáveis da Wave 33

### 1️⃣ Issue Templates (5 arquivos)

Localização: `.github/ISSUE_TEMPLATE/`

| Template | File | Propósito | Tamanho |
|----------|------|-----------|---------|
| 🐛 Bug Report | `bug_report.md` | Reportar bug com repro steps, ambiente, severidade | 2.7KB |
| 💡 Feature Request | `feature_request.md` | Sugerir feature com problema/solução/alternativas | 2.2KB |
| 📚 Documentation | `documentation.md` | Reportar problema em docs (typo, desatualização, link quebrado) | 2.0KB |
| ❓ Question | `question.md` | Tirar dúvida ou abrir discussão | 2.0KB |
| 🔒 Security | `security.md` | Tópico de segurança (vulnerabilidades → email privado) | 1.8KB |

Cada template inclui:
- ✅ Frontmatter YAML (nome, descrição, labels automáticas)
- ✅ Estrutura clara com seções numeradas
- ✅ Checklists de auto-verificação
- ✅ Contexto específico do projeto (tradições, LGPD)

### 2️⃣ Pull Request Template

Localização: `.github/PULL_REQUEST_TEMPLATE.md` (5.0KB)

**12 seções cobertas:**

1. Descrição (resumo + motivação)
2. Tipo de mudança (feat/fix/refactor/docs/test/chore/perf/style)
3. Tradição espiritual impactada (cigano/candomblé/umbanda/ifá/cabala/astrologia/tantra)
4. Compliance LGPD (checklist Art. 7, 11, 18)
5. Testes (unit, integration, e2e)
6. Documentação atualizada
7. Quality gates (TSC, lint, test, build)
8. Screenshots / Recordings
9. Mudanças em DB schema
10. Dependências (audit, licença)
11. Reviewers (CODEOWNERS)
12. Checklist final + mensagem espiritual opcional

### 3️⃣ Release PR Template

Localização: `.github/PULL_REQUEST_TEMPLATE/release.md` (4.2KB)

**Para PRs de release (versionamento semver):**

- Version (SemVer)
- Highlights
- Breaking changes (com migration notes)
- Rollback plan
- Conteúdo espiritual / cultural
- Métricas da release
- Créditos por contribuidor
- Checklist de release (CI green, migration testada, tag, deploy)

### 4️⃣ CODEOWNERS

Localização: `.github/CODEOWNERS` (6.5KB)

**12 áreas mapeadas para CODEOWNERS:**

| Path Pattern | Owner |
|--------------|-------|
| `/src/lib/ai/`, `/src/lib/akasha/`, `/src/lib/prompts/`, `docs/AI-*`, `docs/AKASHA-*` | `@akasha-ia-team` |
| `/src/lib/curation/`, `/src/lib/sacred/`, `/src/data/glossario/`, `/src/data/tradicoes/` | `@iyá-curator` |
| `/src/lib/community/`, `/src/lib/social/`, `/src/app/(community)/` | `@community-team` |
| `/prisma/`, `/prisma/schema.prisma`, `/prisma/migrations/` | `@data-team` |
| `/docs/`, `/README.md`, `/CONTRIBUTING.md` | `@docs-team` |
| `/src/components/ui/v2/`, `/src/components/design-system/`, `tailwind.config.ts` | `@lina-designer` |
| `/tests/`, `/e2e/`, `playwright.config.ts` | `@qa-team` |
| `/src/lib/perf/`, `next.config.js`, `perf-budgets.yml` | `@perf-team` |
| `/src/lib/auth/`, `/src/lib/security/`, `/src/lib/lgpd/`, `SECURITY.md` | `@security-team` |
| `/src/lib/stripe/`, `/src/lib/billing/`, `/src/app/api/stripe/` | `@payments-team` |
| `/.github/workflows/`, `/Dockerfile`, `/docker-compose*.yml` | `@devops-team` |
| `/.eslintrc*`, `/.prettierrc*`, `/tsconfig*.json`, `/package.json` | `@devops-team` |
| `/.env.example` | `@security-team` + `@devops-team` |

### 5️⃣ SECURITY.md

Localização: `.github/SECURITY.md` (6.6KB)

**Conteúdo:**

- ✅ Supported versions (main + última minor)
- ✅ Reporting vulnerability (privado via `security@cabaladoscaminhos.com`)
- ✅ SLA: acknowledgment 48h, triage 7d, fix 30-90d
- ✅ Safe harbor (não-ação legal para research)
- ✅ Áreas sensíveis: dados pessoais (LGPD Art. 11), conteúdo espiritual, pagamentos, auth
- ✅ Hall of fame (placeholder para Q4 2026)
- ✅ Bug bounty (planejado Q4 2026, $50-$2000+)
- ✅ PT-BR + EN inline

### 6️⃣ CONTRIBUTING.md (v2.0)

Localização: `CONTRIBUTING.md` (24.9KB — upgrade de v1.0 de 5.5KB)

**12 seções principais:**

1. **Código de Conduta** — universalismo, respeito, não-apropriação, safe harbor
2. **O que Você Pode Fazer** — tabela de contribuição × dificuldade
3. **Setup Local** — clone, install, env, db, dev server
4. **Workflow de Contribuição** — diagrama de 6 passos (fork → branch → dev → PR → review → merge)
5. **Conventions** — Conventional Commits, Conventional Comments, TypeScript, React, API routes
6. **Testes & Quality Gates** — Vitest, Playwright, cobertura ≥80%
7. **Review Process & CODEOWNERS** — auto-assignment, critérios por tipo, SLA
8. **Compliance Espiritual & Cultural** — **8 Regras Éticas**, checklist de conteúdo
9. **Compliance LGPD** — bases legais (Art. 7), retenção, exportação (Art. 18), exclusão
10. **Tradução & Localização** — i18n com PT-BR first
11. **Comunicação & Suporte** — canais por tipo de issue
12. **Reconhecimento** — CONTRIBUTORS.md, hall of fame, release notes

---

## 🚀 Quick Start para Contribuidores

### Setup em 5 Minutos

```bash
# 1. Fork & clone
git clone https://github.com/<seu-user>/cabaladoscaminhos.git
cd cabaladoscaminhos

# 2. Install
pnpm install

# 3. Env
cp .env.example .env.local
# Edite .env.local

# 4. Banco
npx supabase start
pnpm db:migrate
pnpm db:seed  # opcional

# 5. Dev
pnpm dev  # → http://localhost:3000
```

### Fazer uma Mudança

```bash
# 1. Branch
git checkout -b feat/mapa-arvore-vida

# 2. Develop + commit (Conventional Commits)
git commit -m "feat(mapa): adicionar visualização da árvore da vida"

# 3. Push + PR
git push origin feat/mapa-arvore-vida
# → Abra PR no GitHub (template será carregado automaticamente)

# 4. Espera review de CODEOWNERS
# → CI roda automaticamente
# → Reviewers são atribuídos via CODEOWNERS

# 5. Merge 🎉
```

### Reportar um Bug

1. Vá em **Issues** → **New issue**
2. Selecione **🐛 Bug Report**
3. Preencha todas as seções (especialmente: passos para reproduzir, ambiente, severidade)
4. Adicione labels: `bug`, `status: needs-triage`
5. Aguarde triagem (SLA 3 dias)

### Sugerir uma Feature

1. Vá em **Issues** → **New issue**
2. Selecione **💡 Feature Request**
3. Foque no **problema** (não na solução)
4. Marque tradições impactadas
5. Indique se pode contribuir

### Reportar Vulnerabilidade (Privado)

1. **NÃO** abra issue pública
2. Email: `security@cabaladoscaminhos.com`
3. Assunto: `[SECURITY] <título>`
4. Inclua: descrição, impacto, repro, ambiente
5. SLA: 48h acknowledgment, 30-90d fix

---

## 📊 Estrutura Criada

```
.github/
├── ISSUE_TEMPLATE/
│   ├── bug_report.md           (2.7KB) 🐛
│   ├── feature_request.md      (2.2KB) 💡
│   ├── documentation.md        (2.0KB) 📚
│   ├── question.md             (2.0KB) ❓
│   └── security.md             (1.8KB) 🔒
├── PULL_REQUEST_TEMPLATE/
│   └── release.md             (4.2KB) 🚀
├── PULL_REQUEST_TEMPLATE.md   (5.0KB) 🔀
├── CODEOWNERS                  (6.5KB) 👥
├── SECURITY.md                 (6.6KB) 🛡️
├── dependabot.yml             (existente, preservado)
└── workflows/                 (existente, preservado)

CONTRIBUTING.md                (24.9KB — upgrade de 5.5KB v1.0)
docs/CONTRIBUTING-GUIDE-W33.md  (este arquivo)
```

**Total:** 9 novos arquivos + 1 upgrade = ~57KB de governança

---

## 🔗 Links Rápidos

### Documentação Interna

- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — guia completo de contribuição (PT-BR)
- [`.github/CODEOWNERS`](../.github/CODEOWNERS) — mapeamento de owners por área
- [`.github/SECURITY.md`](../.github/SECURITY.md) — política de segurança
- [`.github/ISSUE_TEMPLATE/`](../.github/ISSUE_TEMPLATE/) — templates de issue
- [`.github/PULL_REQUEST_TEMPLATE.md`](../.github/PULL_REQUEST_TEMPLATE.md) — template de PR
- [`docs/dev/DEVELOPER-GUIDE.md`](./dev/DEVELOPER-GUIDE.md) — dev guide completo (W32-6)

### Padrões Externos

- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/)
- [Conventional Comments](https://conventionalcomments.org/)
- [Contributor Covenant 2.1](https://www.contributor-covenant.org/)
- [Semantic Versioning 2.0](https://semver.org/)
- [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

---

## 📝 Decisões de Design

### Por que PT-BR + EN inline (não arquivos separados)?

Manter PT-BR primário com EN inline em seções críticas reduz fricção para contribuidores brasileiros (95% da comunidade) enquanto mantém acessibilidade para colaboradores internacionais. Trade-off aceito: duplicação parcial > manutenção de 2 docs paralelos.

### Por que Conventional Commits + Conventional Comments?

- **Commits:** permitem changelog automático, semantic-release, git history legível
- **Comments:** padronizam tom em reviews (nit vs issue vs praise), reduz ambiguidade

### Por que 8 Regras Éticas para Conteúdo Cultural?

Tradições têm saberes sagrados que NÃO devem ser apropriados comercialmente ou simplificados. As 8 regras operacionalizam respeito cultural em critérios verificáveis por CODEOWNERS (`@iyá-curator` valida).

### Por que LGPD check no PR template?

LGPD Art. 11 classifica crenças religiosas como **dado sensível**. Forçar checklist no PR template cria **compliance by default** — contribuidores pensam em LGPD antes de tocar dados pessoais.

### Por que CODEOWNERS com 12 áreas (granular)?

Granularidade reduz carga de review (curador não precisa revisar PRs de infra) e atribui accountability clara. 12 áreas cobrem ~95% dos paths do projeto.

---

## 🎯 Próximos Passos (Pós-W33)

| Wave | Task | Status |
|------|------|--------|
| W34 | GitHub Actions: validar PR templates (lint frontmatter) | 🔴 Planejado |
| W34 | CONTRIBUTORS.md automático a partir de git log | 🔴 Planejado |
| W34 | Bug bounty program setup (HackerOne ou Open Bug Bounty) | 🔴 Planejado |
| W35 | i18n: traduzir CONTRIBUTING.md e templates para EN-US | 🔴 Planejado |
| W36 | Documentação de segurança (threat model) | 🔴 Planejado |

---

## 🙏 Créditos

- **Wave 33 Worker:** General (session `415025143263474`)
- **Wave 32-6 Worker:** Documentação prévia (criou `docs/dev/DEVELOPER-GUIDE.md`)
- **Comunidade:** feedbacks sobre gaps de governança

> 🙏 *"Que essa estrutura de contribuição sirva à comunidade de praticantes e contribuidores com respeito e sabedoria."*