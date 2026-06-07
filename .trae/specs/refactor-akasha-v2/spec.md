# refactor-akasha-v2 — Spec

> Spec materializada em 2026-06-06 a partir do working memory do IDE. Origem: revisão do estado do repositório pré-refactor e da decisão de alinhar o projeto ao **Doc 04 (data-model) canônico** removendo o B2B legacy.

## Contexto

O repositório `cabaladoscaminhos` (Next.js + Prisma + Postgres + pgvector) vinha acumulando dois domínios no mesmo banco:

1. **B2C Akasha v2** (canônico, alvo do produto): User/BirthChart/Subscription/CreditEntry/Manifesto/DailyReading/RitualCompletion/Consultation/ChatMessage/GrimoireEntry + enums UserRole/Plan/SubStatus/ChatRole.
2. **B2B legacy** (a ser removido): Operator/Client/Reading/Report, rotas `/api/operator/*`, páginas `/cockpit/*`, libs `operator-*`, `lenormand`, `pdf/dossier-pdf`, `ai/dossier/*`, scripts `find-operators`, `cleanup-tokens`, `test-llm-settings`.

A coexistência gerava: rotas mortas, `akasha-` prefixo poluindo imports, schema inchado (~38 models), migrations legadas impedindo `migrate dev` limpo, código órfão (e.g. `consult-context-rag`, `hologram-prompt-builder`), e 3 docs (03/04/AUTH-AUDIT/MIGRATIONS) com seções de "legado/quarentena" que ninguém mantinha.

## Objetivo

Reduzir o repositório ao **núcleo B2C Akasha v2** (Doc 04 §1-5) e nada mais. Limpar o caminho para o lançamento público (Fase L Onda 3) sem manter a complexidade do B2B.

## Escopo (7 tasks)

1. **Auditoria / gap list** — levantar o que é B2B/legado a remover.
2. **Schema canônico** — reescrever `prisma/schema.prisma` com apenas 10 models B2C + 4 enums (mais `PushSubscription` da Fase Q).
3. **Migrations destrutivas + seed canônico** — apagar 16 migrations legadas, criar baseline `20260606000000_init_akasha_v2` (com pgvector + ivfflat) + `20260606000001_add_user_consent_at` (LGPD) + `20260606000010_push_subscriptions` (Fase Q). Reescrever `prisma/seed.ts` para criar apenas o admin canônico.
4. **APIs no canônico** — refatorar `src/app/api/akasha/**` para usar apenas models canônicos (sem prefixo `Akasha*`). Remover rotas/páginas/libs/scripts B2B.
5. **Tests/scripts** — remover testes B2B (operator-*, mesa-real-*, cockpit-*) e scripts B2B.
6. **Docs sem "quarentena/legado"** — reescrever 03_architecture-spec, 04_data-model, AUTH-AUDIT, MIGRATIONS sem qualquer menção a B2B/legado/cockpit.
7. **Quality gates** — `prisma validate`, `prisma generate`, `tsc --noEmit`, `npm run test:run`, `npm run build` todos verdes.

## Decisões

- **Opção A (destrutiva)**: apagar o histórico de migrations e começar de novo. Justificativa: schema legado nunca esteve em produção, e o projeto está em pré-lançamento.
- **Sem allowlist B2B no middleware**: removida, já que as rotas B2B não existem mais.
- **`grimoire_entries` (nome de tabela) → `grimoire`** (definido em `@@map`): alinhamento com a forma como o sync insere/atualiza.
- **PushSubscription adicionado ao schema canônico** (não B2B): feature canônica do PWA (Fase Q).
- **i18n stub (Fase K)** permanece mesmo sem consumidores — é feature em evolução, não código morto.

## Não-objetivos

- Não migrar dados de produção (não há produção ainda).
- Não renomear arquivos/páginas `(akasha)` (convenção de route group é legítima).
- Não tocar em features PWA (Fase Q), i18n (Fase K), RAG-fechado (Fase O), Manifesto PDF (Fase P) — apenas garantir que usam models canônicos.

## Critérios de pronto

- `npx prisma validate` exit 0
- `npx prisma generate` exit 0
- `npx tsc --noEmit` exit 0
- `npm run test:run` 0 failed
- `npm run build` exit 0
- `git diff main..HEAD --name-only` não contém: `**/operator-*`, `**/cockpit/**`, `**/lenormand/**`, `**/dossier-*`, `migrations/2026060[2-5]*/**`
- `grep -rE "cockpit|mesa-real|operator-|lenormand|dossier" src/` retorna 0 matches (exceto `--font-dossier` em `globals.css` que é alias de fonte Lora, sem relação com B2B)
- `grep -iE "cockpit|legacy-cockpit|operator|mesa.real|quarentena|legado|b2b" docs/03_architecture-spec.md docs/04_data-model.md docs/AUTH-AUDIT.md docs/MIGRATIONS.md` retorna 0 matches
