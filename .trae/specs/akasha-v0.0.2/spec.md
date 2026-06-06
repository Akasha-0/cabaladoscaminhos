# Akasha — Onda 3 Live + Lançamento — Spec

## Why
O `refactor-akasha-v2` (último spec) está em execução para consolidar o produto no núcleo canônico B2C (Doc 04 §1–5). Após sua conclusão, restam os **gaps do Onda 3 (Oráculo Vivo)** e o **polimento de lançamento** que impedem o Akasha de ser o "Oráculo Vivo" prometido na Doc 25 §3: embeddings inativos, busca híbrida pendente, cronjob de trânsitos não-deployed, Grimório com apenas 16% do conteúdo botânico, sem atmosfera WebGL, sem i18n, e sem reconciliação entre custo de IA e créditos. Sem isso, o produto é "Manifesto PDF + Dashboard estático", não um oráculo vivo que muda com o céu.

Este spec cobre duas fases encadeadas:
- **Fase 1 — Onda 3 Ativa**: embeddings pgvector, busca híbrida, cronjob de trânsitos, conteúdo completo do Grimório, validação RAG-fechado.
- **Fase 2 — Polimento & Lançamento**: Three.js atmosfera da Mandala, i18n EN, PWA + notificações, reconciliação LLM × créditos, runbook VPS, quality gates finais.

> **Premissa**: este spec assume que o `refactor-akasha-v2` está concluído (schema canônico B2C, sem legado B2B, build verde, 0 erros TS). A **Ordem de Execução** no fim deste doc explicita a dependência.

## What Changes
- **Embeddings GrimoireEntry ativos**: ativar a coluna `embedding vector(768)` no DB e validar o pipeline Ollama (`nomic-embed-text`) em produção (Doc 25 §5).
- **Busca híbrida (JSONB + pgvector)**: implementar a Camada 2 do Grimório (Doc 25 §5) — filtro determinístico por tags + similaridade semântica.
- **Motor astrológico diário em produção**: deploy do cronjob de trânsitos (`scripts/daily-transits-cron.ts` já existe) salvando no Redis (`transitos_diarios:AAAA-MM-DD`) (Doc 25 §10).
- **Webhook GitHub grimoire-sync + botão admin de reindexação** (Doc 25 §5, Doc 08 Onda 3.9).
- **Conteúdo do Grimório completo**: 50 ervas, validação dos 16 Odus (D4) e 11 Corpos (D2), curadoria conforme Doc 20.
- **Atmosfera WebGL da Mandala**: camada Three.js (R3F) com Toroide etéreo (Doc 25 §8, AD-25.9).
- **i18n EN**: pt-BR + en via `next-intl` (Doc 25 §9, AD-25.12) — primeiro a UI, depois o conteúdo do Grimório.
- **PWA + service worker + notificações push** (Doc 08 Onda 4.4–4.5).
- **Reconciliação LLM × créditos** (Doc 22 AD-22.5): tokens consumidos × créditos debitados × custo real do modelo.
- **Runbook operacional VPS** (Doc 22 AD-22.11, §9).
- **Quality gates finais** (Doc 19): `npx tsc --noEmit` + `npm run test:run` + `npm run build` + testes-guardião RAG-fechado.

## Impact

### Affected specs (docs/)
- `docs/04_data-model.md` — `GrimoireEntry.embedding` ativo + `DailyReading.ritual.grimoireId` validado
- `docs/06_ai-engine-spec.md` — Camada 2 (busca híbrida) implementada
- `docs/08_roadmap.md` — Onda 3 e Onda 4 fechadas
- `docs/15_glossario-oracular.md` — D4 (16 Odus) e D2 (11 Corpos) validados (remoção do `⚠️ PROVISIONAL`)
- `docs/20_governanca-conteudo-oracular.md` — pipeline de curadoria das 50 ervas registrado
- `docs/22_observabilidade-operacao.md` — `credits.debited` × `llm.call` reconciliados (AD-22.5)
- `docs/25_visao-akasha.md` — AD-25.6, AD-25.7, AD-25.9, AD-25.12 marcados como ✅
- `AUTH-AUDIT.md` — fluxo B2C user-only validado (sem `Operator`)
- `MIGRATIONS.md` — fluxo pgvector ativo

### Affected code
- DB / migrations: `prisma/schema.prisma` (GrimoireEntry + embedding), `prisma/migrations/<ts>_grimoire_embedding_active/`
- Pipeline: `src/lib/grimoire/sync.ts` (embeddings Ollama), `src/lib/grimoire/search.ts` (busca híbrida — novo)
- Trânsitos: `scripts/daily-transits-cron.ts` (deploy + Redis SETEX)
- Webhook: `src/app/api/admin/webhooks/grimoire-sync/route.ts` (Doc 25 §5)
- Mandala: `src/components/mandala/MandalaAtmosphere.tsx` (R3F), `src/components/mandala/MandalaChart.tsx` (SVG/D3)
- i18n: `src/i18n/pt-BR.json`, `src/i18n/en.json`, `src/middleware.ts` (locale routing)
- PWA: `public/manifest.json`, `public/sw.js`, `src/lib/push/`
- Reconciliação: `src/lib/billing/reconcile.ts` (novo), `src/lib/db/credit-actions.ts` (instrumentação)
- Runbook: `docs/22_observabilidade-operacao.md` §9 (atualizar), `scripts/cleanup-tokens.ts` (cron systemd)
- Conteúdo: `grimoire/botanica/*.md` (50 ervas), `grimoire/ancestral/*.md` (16 Odus validados), `grimoire/vibracional/*.md` (11 Corpos)

## ADDED Requirements

### Requirement: Embeddings GrimoireEntry ativos em produção
O sistema SHALL manter a coluna `embedding vector(768)` da tabela `grimoire` populada para todas as `GrimoireEntry` e SHALL garantir que a extensão `vector` (pgvector) está instalada e o índice `ivfflat`/`hnsw` criado, conforme Doc MIGRATIONS.

#### Scenario: DB recém-migrado
- **WHEN** um DBA aplica as migrations em um DB vazio
- **THEN** a extensão `vector` existe, a tabela `grimoire` tem a coluna `embedding vector(768)` e o índice `grimoire_embedding_idx` está criado
- **AND** `prisma generate` tipa o client sem erros (a coluna é `Unsupported` no Prisma, populada via `$executeRaw`)

#### Scenario: `npm run grimoire:sync` em produção
- **WHEN** o operador roda `npm run grimoire:sync` no VPS (Ollama rodando em `localhost:11434`)
- **THEN** todos os arquivos `grimoire/**/*.md` são lidos, seus embeddings são gerados via `nomic-embed-text` e persistidos
- **AND** o `Webhook` `/api/admin/webhooks/grimoire-sync` é protegido por `GITHUB_WEBHOOK_SECRET` (HMAC-SHA256) e dispara o mesmo pipeline (Doc 25 §5)

### Requirement: Busca híbrida funcional (Camada 2)
O sistema SHALL implementar busca no Grimório combinando **filtro determinístico JSONB** (tags: `elemento`, `signo`, `corpo`, `odu`) e **similaridade semântica pgvector** (`<=>` cosine distance), conforme Doc 25 §5.

#### Scenario: Consulta do Oráculo
- **WHEN** o Agente de Síntese (Camada 3) precisa de fragmentos do Grimório para o ritual do dia
- **AND** o Ponto de Tensão do dia indica "Lua em Escorpião sobrecarregando o Corpo Tântrico 2 (Mente Negativa)"
- **THEN** a busca retorna apenas `GrimoireEntry` cuja tag `metadata.elemento = 'Agua'` E `metadata.corpos_tantricos_alvo CONTAINS 2`, ordenadas por `<=> embedding` crescente
- **AND** os IDs são injetados no System Prompt da Camada 3 como `grimoireRefs[]` (rastreabilidade anti-alucinação, Doc 25 §5)

#### Scenario: Edge case sem resultado determinístico
- **WHEN** o filtro JSONB retorna 0 entradas
- **THEN** a busca relaxa para `metadata.elemento` apenas (sem `corpos_tantricos_alvo`)
- **AND** registra `event: grimoire.search.fallback` no log

### Requirement: Cronjob de trânsitos diários em produção
O sistema SHALL calcular e cachear os trânsitos astrológicos do dia **uma vez** (à meia-noite UTC) e servi-los do Redis, conforme Doc 25 §10 e AD-25.10.

#### Scenario: 00:00 UTC diário
- **WHEN** o cronjob systemd `cabala-transits.service` executa
- **THEN** ele invoca `scripts/daily-transits-cron.ts` que chama `core-astrology` (Swiss Ephemeris) e salva o resultado em Redis como `transitos_diarios:YYYY-MM-DD` com TTL 86400s
- **AND** falha no cronjob NÃO derruba a app — `readiness` sinaliza ausência do céu, Dashboard degrada com mensagem clara (Doc 22 AD-22.8)

#### Scenario: Abertura do app às 07:00
- **WHEN** o usuário abre o Dashboard Diário
- **THEN** o sistema busca `transitos_diarios:YYYY-MM-DD` no Redis
- **AND** cruza com o mapa natal persistido (Camada 1 determinística) sem recalcular efeméride
- **AND** a latência percebida é < 100ms (Redis hit)

### Requirement: Conteúdo do Grimório completo (50 ervas + 16 Odus validados + 11 Corpos)
O sistema SHALL ter pelo menos **50 entradas** de botânica, **16 entradas** de Odus validadas (D4) e **11 entradas** de corpos tântricos validadas (D2) no Grimório, com proveniência e `source`/`lineage` conforme Doc 20 (AD-20.3/.6).

#### Scenario: Botânica curada
- **WHEN** o operador verifica `grimoire/botanica/*.md`
- **THEN** existem ≥ 50 arquivos `.md` com frontmatter YAML (Doc 25 §5) e corpo (sabedoria, lendas, modo de preparo)
- **AND** cada um foi validado por ≥ 1 referência (livro, tradição oral, base agroecológica) — registrado no `metadata.fonte`

#### Scenario: D4 (16 Odus) validado
- **WHEN** o operador confirma a linhagem dos 16 Odus
- **THEN** o `⚠️ PROVISIONAL (D4)` em `docs/15_glossario-oracular.md §2` é removido
- **AND** cada `grimoire/ancestral/odu_*.md` tem `metadata.lineage` e `metadata.source`
- **AND** `oduBirth.provisional = false` no schema e na Camada 1 (`core-odus`)

### Requirement: Atmosfera WebGL da Mandala (Three.js / R3F)
O sistema SHALL renderizar uma camada de atmosfera WebGL (Toroide etéreo em wireframe/partículas) sob a Mandala SVG/D3, conforme Doc 25 §8 e AD-25.9.

#### Scenario: Mobile-first
- **WHEN** um usuário abre o app no celular
- **THEN** o Toroide WebGL renderiza em `60fps` no mínimo (R3F + `dpr={[1, 2]}`)
- **AND** não interfere com a interação dos nós SVG (sem raycasting cruzado — camadas separadas)
- **AND** desabilita automaticamente em `prefers-reduced-motion: reduce` (acessibilidade)

#### Scenario: Desktop
- **WHEN** o usuário acessa o Centro de Comando (deep study)
- **THEN** a atmosfera WebGL está com efeitos completos (rotação mais rápida, mais partículas)
- **AND** o "Painel de Sintonia" ilumina caminhos abertos e curto-circuitos (Doc 25 §2)

### Requirement: Internacionalização pt-BR + en (next-intl)
O sistema SHALL expor a UI em **português (pt-BR)** e **inglês (en)** via `next-intl`, com fallback pt-BR e detecção automática via header `Accept-Language`, conforme Doc 25 §9 e AD-25.12.

#### Scenario: Primeiro acesso
- **WHEN** um novo usuário acessa o app com `Accept-Language: en`
- **THEN** a UI é servida em inglês (rotas `/(en)/...`)
- **AND** o Grimório exibe conteúdo em pt-BR com flag de "Tradução em breve" (Doc 25 §9 Fase 1 vs Fase 2)

#### Scenario: Troca manual de idioma
- **WHEN** o usuário clica no toggle pt-BR ↔ en
- **THEN** a preferência é persistida em cookie httpOnly e a UI recarrega sem perder sessão
- **AND** a URL preserva a rota (sem redirect para `/`)

### Requirement: PWA + notificações push
O sistema SHALL ser instalável como PWA no iOS/Android (sem loja) e SHALL enviar push notification diária ("Seu ritual de hoje está pronto") conforme Doc 25 §8 e AD-25.9.

#### Scenario: Instalação
- **WHEN** o usuário acessa o app no celular pela 2ª vez
- **THEN** o browser exibe o prompt "Adicione à Tela Inicial"
- **AND** o `manifest.json` declara `name`, `short_name`, `icons[192/512]`, `start_url`, `display: standalone`, `theme_color`

#### Scenario: Notificação diária
- **WHEN** o cronjob de trânsitos roda (00:00 UTC) e gera o `daily_readings` para o user
- **THEN** o servidor envia push via Web Push API (chave VAPID em env) para todos os users com `pushEnabled = true`
- **AND** a notificação NÃO inclui conteúdo do ritual (privacidade, Doc 22 AD-22.2) — apenas "Seu ritual de hoje está pronto"

### Requirement: Reconciliação LLM × créditos
O sistema SHALL reconciliar o custo de tokens por `consultationId` com o `CreditEntry.delta`, conforme Doc 22 AD-22.5.

#### Scenario: Consulta respondida
- **WHEN** o Agente Oracular responde e debita créditos
- **THEN** existe um par `ChatMessage{tokensUsed, creditCost}` + `CreditEntry{delta, reason, consultationId}` no mesmo request
- **AND** a relação é `tokensUsed / 1000 × modelPrice` ≈ `creditCost × creditUnitPrice` (margem ≥ 0 para Akasha)
- **AND** falha de LLM NÃO debita crédito (Doc 22 AD-22.5 — "Nenhum crédito é debitado em falha")

#### Scenario: Painel admin
- **WHEN** o `role = ADMIN` acessa `/admin/reconcile`
- **THEN** vê tabela: dia | tokens consumidos | créditos debitados | custo real USD | margem
- **AND** alerta se margem < 0 (custo de IA > receita de créditos)

### Requirement: Runbook operacional VPS
O sistema SHALL ter um runbook versionado com: backup/restore, deploy, rollback, troubleshooting de Ollama/Redis/pgvector, conforme Doc 22 §9 e AD-22.11.

#### Scenario: Falha de Ollama
- **WHEN** o healthcheck detecta `Ollama: down` por 3 healthchecks consecutivos
- **THEN** o `mkdocs`/`README` de runbook contém seção exata "Ollama offline → embeddings fallback para OpenAI + degradação no RAG"
- **AND** o alerta aparece em `#akasha-ops` (Slack) e em `/admin/health`

## MODIFIED Requirements
(nenhuma — este spec é greenfield sobre a base canônica do `refactor-akasha-v2`)

## REMOVED Requirements
(nenhuma — este spec não remove nada; o `refactor-akasha-v2` já removeu o B2B)

---

## Ordem de Execução (dependências entre tasks)

```
Fase 0 — PRÉ-REQUISITO
  └─ [refactor-akasha-v2: Tasks 1-7] — schema canônico B2C, sem legado B2B
                                            (verificar com quality gates verdes)

Fase 1 — ONDA 3 ATIVA
  ├─ T1. Ativar embeddings GrimoireEntry (DB + migration)
  ├─ T2. Pipeline embeddings Ollama em produção (sync + webhook)
  ├─ T3. Busca híbrida (JSONB + pgvector) — Camada 2
  ├─ T4. Cronjob de trânsitos diários (deploy + Redis)
  ├─ T5. Conteúdo do Grimório (50 ervas + 16 Odus D4 + 11 corpos D2)
  ├─ T6. Validação RAG-fechado end-to-end (testes-guardião)
  └─ T7. Quality gates Fase 1

Fase 2 — POLIMENTO & LANÇAMENTO
  ├─ T8.  Three.js atmosfera da Mandala (R3F)
  ├─ T9.  i18n pt-BR + en (next-intl)
  ├─ T10. PWA (manifest + service worker)
  ├─ T11. Notificações push (Web Push API + VAPID)
  ├─ T12. Reconciliação LLM × créditos (painel admin)
  ├─ T13. Runbook operacional VPS (Doc 22 §9)
  └─ T14. Quality gates finais + i18n EN completa do Grimório
```

> **Caminho crítico:** Fase 0 → T1 → T2 → T3 → T4 (Onda 3 não está "viva" sem todas estas). T5 pode rodar em paralelo com T3/T4. T8-T14 são polimento após a Onda 3 estar verde.
