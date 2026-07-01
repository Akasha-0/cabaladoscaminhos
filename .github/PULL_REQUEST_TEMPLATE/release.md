<!--
  ╔══════════════════════════════════════════════════════════════════╗
  ║  Release PR Template                                           ║
  ║  Usado para PRs de release (versionamento semver)              ║
  ║                                                                  ║
  ║  Título do PR deve seguir o padrão:                             ║
  ║    release(vX.Y.Z): título curto                                ║
  ║                                                                  ║
  ║  Exemplo: release(v0.6.0): Beta launch + community features    ║
  ╚══════════════════════════════════════════════════════════════════╝
-->

# 🚀 Release vX.Y.Z

> **Versão:** X.Y.Z (MAJOR.MINOR.PATCH — [SemVer](https://semver.org/))
> **Data prevista:** YYYY-MM-DD
> **Wave:** (referência interna)
> **Mantenedor do release:** @akasha-maintainers

---

## 📋 Resumo da Release

<!-- 1-3 frases: o que essa release entrega? Qual o tema central? -->

## ✨ Highlights

<!-- Liste 3-7 destaques principais. Use bullet points impactantes. -->

- 🌟 **[Feature 1]** — descrição curta
- 🧘 **[Feature 2]** — descrição curta
- 🔒 **[Segurança/LGPD]** — descrição curta
- ⚡ **[Performance]** — descrição curta
- 🛠️ **[DX/DevEx]** — descrição curta

## 💥 Breaking Changes

<!-- ATENÇÃO: marque [x] se houver breaking changes. Documente cada uma com: -->

- [ ] ⏭️ Nenhuma breaking change

Se houver:

### 🔴 BREAKING: `<título da mudança>`

**O que muda:** <!-- ex: API `/api/v1/mapa` removida -->

**Por que:** <!-- ex: refatoração para nova estrutura -->

**Como migrar:** <!-- ex: clients devem usar `/api/v2/mapa` -->

**Impacto:** <!-- ex: 100% dos clientes mobile precisam de update -->

---

## 📝 Notas de Migração

<!-- Passo-a-passo para atualizar de vX.Y.Z-1 para vX.Y.Z. -->

```bash
# 1. Atualizar deps
pnpm update cabaladoscaminhos@X.Y.Z

# 2. Rodar migrations
pnpm db:migrate

# 3. Atualizar variáveis de ambiente (se houver)
#    + NEW_ENV_VAR=<valor>

# 4. Rebuild
pnpm build
```

**Rollback plan:** <!-- Como voltar para vX.Y.Z-1 se necessário? -->

## 🌙 Conteúdo Espiritual / Cultural

<!-- Se essa release adiciona ou modifica conteúdo de tradições: -->

- **Tradições cobertas:** [cigano / candomblé / umbanda / ifá / cabala / astrologia / tantra]
- **Revisão cultural:** @iyá-curator validou precisão e respeito
- **Novos termos em glossário:** [ex: "Oxalá", "Hekau", "Kether"]
- **Compliance LGPD:** [ex: nova política de retenção de mapas natais]

## 📊 Métricas da Release

<!-- Estatísticas que importam: -->

| Métrica | Valor |
|---------|-------|
| Commits desde última release | ___ |
| PRs merged | ___ |
| Issues closed | ___ |
| Contributors únicos | ___ |
| Coverage de testes | ___% |
| Bundle size (gzip) | ___ KB |
| Lighthouse score | ___ |
| Tempo de build | ___ min |

## 🙏 Créditos

<!-- Reconheça contribuidores. Use @ para mencionar. -->

### Core Team
- @akasha-maintainers — coordenação geral

### Contribuidores
- @contributor1 — feature X
- @contributor2 — bug fix Y
- @contributor3 — doc Z

### Tradições e Consultores Culturais
- @iyá-curator — validação cultural
- @[consultor cigano] — revisão de conteúdo cigano
- @[consultor candomblé] — revisão de conteúdo candomblé

### Agradecimentos Especiais
- Comunidade de praticantes beta testers
- Contribuidores de issues e feedback

## 🔗 Links

- **CHANGELOG.md:** [ver entrada completa](./CHANGELOG.md)
- **Migration guide completo:** [docs/MIGRATION-vX.Y.md](./docs/MIGRATION-vX.Y.md)
- **Blog post / release notes:** [link]
- **Demo / Preview:** [link]

## ✅ Checklist de Release

- [ ] Todos os PRs da wave merged em `main`
- [ ] `main` está green (CI passa)
- [ ] Versão bumped em `package.json`
- [ ] CHANGELOG.md atualizado
- [ ] Migration script testado em staging
- [ ] Release notes publicadas
- [ ] Stakeholders notificados
- [ ] Tag git criada: `git tag vX.Y.Z`
- [ ] Deploy em produção executado
- [ ] Post-deploy smoke tests passaram

---

## 🕉️ Dedicatória

> _Espaço para uma dedicatória opcional da release — pode ser um agradecimento à comunidade, um mantra, ou uma reflexão._

> "Cada release é um portal. Que essa porta se abra com respeito e sabedoria."

🙏 **Que essa versão sirva à comunidade.**