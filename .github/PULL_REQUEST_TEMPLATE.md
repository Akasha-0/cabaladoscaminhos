<!--
  ╔══════════════════════════════════════════════════════════════════╗
  ║  PR Template — Cabala dos Caminhos                              ║
  ║  Preencha TODAS as seções. PRs incompletos podem ser rejeitados. ║
  ╚══════════════════════════════════════════════════════════════════╝
-->

## 📋 Descrição

<!-- Resumo em 1-3 linhas: o que esse PR faz? -->

**Resumo:**

**Motivação:** <!-- Por que essa mudança é necessária? Que problema resolve? Link para issue: Fixes #123 ou Closes #456 -->

## 🏷️ Tipo de Mudança

<!-- Marque com [x] o que se aplica: -->

- [ ] ✨ `feat` — Nova funcionalidade
- [ ] 🐛 `fix` — Correção de bug
- [ ] 🔧 `refactor` — Refatoração sem mudança de comportamento
- [ ] 📚 `docs` — Apenas documentação
- [ ] 🧪 `test` — Apenas testes
- [ ] 🔨 `chore` — Manutenção (deps, build, config)
- [ ] ⚡ `perf` — Melhoria de performance
- [ ] 💄 `style` — Formatação, sem mudança de lógica

## 🌙 Tradição Espiritual Impactada

<!-- Se o PR toca lógica espiritual, marque quais tradições: -->

- [ ] Não aplica (mudança puramente técnica)
- [ ] Cigano
- [ ] Candomblé
- [ ] Umbanda
- [ ] Umbanda
- [ ] Ifá
- [ ] Cabala
- [ ] Astrologia
- [ ] Tantra
- [ ] Outra: ___________

**Detalhes:** <!-- Descreva brevemente como a mudança respeita os princípios éticos da tradição. -->

## 🔒 Compliance LGPD

<!-- Marque TODOS os itens que se aplicam: -->

- [ ] ✅ Nenhum dado pessoal novo é coletado
- [ ] ✅ Mudança não altera política de retenção de dados
- [ ] ✅ Mudança não altera mecanismo de exportação (Art. 18)
- [ ] ✅ Mudança não altera mecanismo de exclusão/anonimização (Art. 18)
- [ ] ✅ Mudança não altera bases legais de tratamento (Art. 7)
- [ ] ⚠️ Esta PR altera tratamento de dados — revisor de segurança **deve** aprovar
- [ ] ⚠️ Esta PR adiciona novo campo/coluna — documente em `prisma/schema.prisma` e migration

**Detalhes:** <!-- Se marcou ⚠️, explique. -->

## 🧪 Testes

<!-- Descreva os testes adicionados ou modificados: -->

- [ ] ✅ Testes unitários adicionados/atualizados
- [ ] ✅ Testes de integração adicionados/atualizados
- [ ] ✅ Testes E2E adicionados/atualizados (Playwright)
- [ ] ✅ Cobertura de testes ≥ 80% para código novo
- [ ] ⏭️ Nenhum teste necessário porque: ___________

**Comandos rodados:**
```bash
pnpm typecheck        # → TSC=0
pnpm lint             # → ESLint pass
pnpm test             # → vitest pass
pnpm test:e2e         # → playwright pass (se aplicável)
```

## 📚 Documentação Atualizada

<!-- Marque TODAS as docs que precisaram ser atualizadas: -->

- [ ] ✅ `README.md` — atualizado
- [ ] ✅ `docs/dev/DEVELOPER-GUIDE.md` — atualizado
- [ ] ✅ `docs/<feature>.md` — atualizado/criado
- [ ] ✅ JSDoc / TSDoc em funções públicas
- [ ] ✅ CHANGELOG.md — entrada adicionada (se user-facing)
- [ ] ⏭️ Nenhuma doc necessária porque: ___________

## 🛡️ Quality Gates

- [ ] ✅ `pnpm typecheck` passa (TSC=0)
- [ ] ✅ `pnpm lint` passa
- [ ] ✅ `pnpm test` passa (vitest)
- [ ] ✅ `pnpm test:e2e` passa (se aplicável)
- [ ] ✅ `pnpm build` passa sem warnings novos
- [ ] ✅ Sem `console.log` de debug esquecido
- [ ] ✅ Sem `any` novo (TypeScript strict mode)
- [ ] ✅ Sem secrets ou tokens commitados

## 📸 Screenshots / Recordings

<!-- Para mudanças visuais (UI/UX), adicione ANTES/DEPOIS. -->

**Antes:**
<!-- screenshot -->

**Depois:**
<!-- screenshot -->

**Screen recording (UX flows):**
<!-- link -->

## 🗄️ Mudanças em Banco / Schema

<!-- Se essa PR altera schema do banco: -->

- [ ] ⏭️ Nenhuma mudança de schema
- [ ] 📝 Migration script em `prisma/migrations/<timestamp>_<name>/migration.sql`
- [ ] 🔄 Migration testada localmente (`pnpm db:migrate`)
- [ ] 🔄 Rollback planejado (documentado em `prisma/migrations/README.md`)
- [ ] 📊 Impacto em produção documentado (downtime esperado, estratégia)

## 🔗 Dependências

<!-- Se adicionou novas deps: -->

- [ ] ⏭️ Nenhuma dep nova
- [ ] 📦 Adicionei `<package>:<version>` — justificativa: ___________
- [ ] ✅ Licença compatível (MIT/Apache-2.0/BSD — sem GPL)
- [ ] ✅ Sem CVE conhecido (verificado via `pnpm audit`)
- [ ] ✅ Bundle size impact avaliado (se client-side)

## 👥 Reviewers

<!-- Quem DEVE revisar conforme CODEOWNERS: -->

- @akasha-ia-team (se toca `src/lib/ai/`)
- @iyá-curator (se toca `src/lib/curation/` ou conteúdo espiritual)
- @community-team (se toca `src/lib/community/`)
- @data-team (se toca `prisma/`)
- @lina-designer (se toca `src/components/ui/v2/`)
- @docs-team (se toca `docs/`)

## ✅ Checklist Final

- [ ] 📝 Commits seguem [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] 🔀 Branch atualizada com `main` (rebase ou merge)
- [ ] 📝 Descrição do PR é clara e completa
- [ ] 🔗 Issues vinculadas (Fixes #, Closes #, Refs #)
- [ ] 🧪 CI está passando
- [ ] 👀 Auto-revisado o próprio diff
- [ ] 🙏 Mensagem de commit respeitosa e profissional

---

## 🌟 Mensagem Espiritual (opcional)

> *Espaço para uma reflexão, mantra ou dedicatória se a mudança foi inspirada por algo maior.*
>
> _Ex: "Que esse código sirva à comunidade de praticantes com respeito e sabedoria."_