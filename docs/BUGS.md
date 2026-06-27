# 🐛 BUGS — Akasha Portal

> Alertas críticos que bloqueiam deploy, validação, ou operação em prod.
> Criado em 2026-06-27. Severidade: 🔴 blocker | 🟠 major | 🟡 minor.

---

## BUG-001 — Migration `20260627_000000_search_discovery` referencia tabelas inexistentes 🔴 BLOCKER

**Data:** 2026-06-27
**Branch:** `feat/community-platform` (HEAD: `ddc1bc0f`)
**Severidade:** 🔴 **BLOCKER** — qualquer tentativa de `prisma migrate deploy` em prod falha imediatamente.

### Sintoma

A migration SQL em `prisma/migrations/20260627_000000_search_discovery/migration.sql` (212 linhas) tenta fazer:

```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "searchVector" tsvector;
CREATE TRIGGER posts_search_vector_trigger ON posts ...;
CREATE INDEX posts_search_vector_idx ON posts USING GIN ("searchVector");
-- (idem para articles, groups, "SpiritualProfile")
```

Mas o `prisma/schema.prisma` ativo no branch **NÃO define** os models `Post`, `Article`, `Group`, ou `SpiritualProfile` — eles existem apenas em `prisma/community.prisma` (arquivo separado, 661 linhas, nunca mesclado).

### Reprodução

```bash
cd /workspace/cabaladoscaminhos
npx prisma migrate deploy    # ou db:push contra um DB vazio
# → ERROR: relation "posts" does not exist
# → migração 20260627_000000_search_discovery falha
```

### Causa raiz

Workflow Prisma foi quebrado: alguém (provavelmente durante sprint wave-2) escreveu a migration full-text search diretamente em SQL **antes** de mesclar `community.prisma` em `schema.prisma`. A migration ficou órfã — sem o schema correspondente, ela não pode ser aplicada.

Cross-check: `find_in_files prisma/schema.prisma` para `model Post|model Article|model Group|model SpiritualProfile` → **0 resultados**. Os 4 models só existem em `prisma/community.prisma`.

### Impacto

- **CI/CD quebrado:** qualquer pipeline que rode `prisma migrate deploy` antes de merge quebra
- **Staging/prod fora do ar:** não há como promover a base pra Fase 1 da comunidade
- **Trust debt:** código de search_discovery está no repo mas não é executável

### Workaround atual

**Não aplicar a migration** até que `community.prisma` seja mesclado em `schema.prisma`. Para o feed rodar em dev, usar `prisma db push --accept-data-loss` (apaga tabelas se houver divergência) — **NUNCA em prod**.

### Correção proposta (próximo sprint)

**Opção A — Merge completo (preferida):**
1. Mesclar `prisma/community.prisma` em `prisma/schema.prisma` (resolver conflitos de enums duplicados se houver)
2. Deletar 12 models B2B/Zelador do schema (`Operator, Client, Reading, Report, Assinatura, Credito, TransacaoCredito, Empresa, Reminder, BirthChart, SynastryResult, LeituraHistorico`)
3. Rodar `npx prisma migrate dev --name merge_community_schema` para regenerar migration limpa
4. Deletar `prisma/migrations/20260627_000000_search_discovery/` (substituída pela nova)
5. Validar com `npx prisma migrate status` (deve mostrar migration limpa, 0 drift)

**Opção B — Conservadora (se Opção A for arriscada demais):**
1. Mover `20260627_000000_search_discovery/` para `prisma/migrations/_disabled_20260627_search_discovery/`
2. Criar ADR explicando por que a migration foi desabilitada
3. Reabrir o trabalho de full-text search como Onda 13, dependente de schema merge

**Esforço Opção A:** M (1-2 dias)
**Esforço Opção B:** P (½ dia)
**Risco Opção A:** Médio (mexer no schema é sempre perigoso)
**Risco Opção B:** Baixo (só desabilita)

### Responsável

Backlog do agente de desenvolvimento. **NÃO tentar fix sozinho** — o P0 #1 do gap analysis (`docs/EVOLUTION-LOG.md` 2026-06-27) já tem isso priorizado. Aguardar janela do agent Coder com QUALITY-STANDARDS aplicado.

### Auditoria relacionada

- `docs/EVOLUTION-LOG.md` — entrada "gap analysis rigoroso 2026-06-27", P0 #1
- `docs/ARCHITECTURE.md` §3 — define que schema deve ser refatorado (B2B removido, community mesclado)
- `prisma/community.prisma` — fonte canônica dos 13 models da comunidade
- `prisma/migrations/README.md` — workflow esperado (migrations vêm DEPOIS do schema)

---

## BUG-002 — `.env.example` ausente do branch (corrigido nesta entrega) 🟡 MINOR

**Data:** 2026-06-27 (criado) / 2026-06-27 (corrigido)
**Branch:** `feat/community-platform`
**Severidade:** 🟡 **MINOR** — bloqueia onboarding de novos devs, mas não impede build.

### Sintoma

`cp .env.example .env.local` falhava com "No such file or directory". O arquivo existia em `origin/main` (commit `96004fea`, 66 linhas) e tinha sido atualizado em `feat/minimax-anthropic-default` (commit `50ffe949`, 115 linhas), mas **NÃO** foi trazido pra `feat/community-platform`.

### Impacto

- Novos devs não conseguem rodar `pnpm dev` sem adivinhar env vars
- O EVOLUTION-LOG declarava "FEITO" mas o arquivo não existia no branch
- Mascarava outras decisões (tipo: "como configuro Resend pra notificações?")

### Correção

Commit desta entrega: `chore(env): add .env.example + whitelist in .gitignore`. Arquivo criado do zero focado no branch community-platform (6.189 bytes, 10 seções, sem vars B2B legadas). `.gitignore` ajustado com `!.env.example` para garantir tracking.

### Responsável

✅ Resolvido em 2026-06-27 (esta entrega).
