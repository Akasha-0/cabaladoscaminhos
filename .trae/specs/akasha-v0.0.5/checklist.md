# Checklist — Akasha v0.0.5 (Conteúdo & Profundidade: I-Ching 5º Sistema + Expansão do Grimório + Correlações Enriquecidas)

> **Status:** Proposta (aguardando aprovação)
> **Critério de "done":** quality gates (Doc 19 §5) + métricas quantitativas (44 entries curados + 16 hexagramas) + teste-guardião da curadoria (Doc 19 AD-19.4 #4 expandido) + avaliação editorial da narrativa.
> **Premissa absoluta:** Fase 0 (v0.0.4 released) é gate de entrada.

---

## Fase 0 — PRÉ-REQUISITO (verificar, não executar)

- [ ] v0.0.4 tagged em git (tag `v1.0.0-akasha-v2` ou equivalente) com commit + release notes
- [ ] `PROGRESS.md` §3.1 atualizado com métricas finais do v0.0.4
- [ ] `PROGRESS.md §3.3` (Dívida Explícita) criado/atualizado com tudo que ficou pendente no v0.0.4
- [ ] `Doc 08` v3.2 (Onda 5 ✅) — release formalizado
- [ ] `Doc 25 §0` reflete o estado do v0.0.4 released
- [ ] 8113+ testes passando, 0 falhas
- [ ] 9 modelos B2C canônicos + schema valid (`npx prisma validate`)
- [ ] `apps/akasha-portal/` é o portal ativo (monorepo concluído)
- [ ] `Doc 15 §1` sem `⚠️ PROVISIONAL (D4)` — proveniência dos 16 Odus ✅
- [ ] Cobertura EN do corpo dos 83 entries existentes (de T9 do v0.0.4)

> **Gate de entrada da Fase 1:** todos os 11 itens acima verdes. Se qualquer item falhar, **o v0.0.5 não começa** — a dívida é atacada primeiro.

---

## Fase 1 — I-CHING (5º SISTEMA)  [HEADLINE]

### Task 1 — `packages/core-iching` (agnóstico)

- [ ] Estrutura `packages/core-iching/{src,tests,package.json,tsconfig.json}` criada
- [ ] Tipos definidos em `packages/core-iching/src/types.ts` (Hexagram, Trigram, IchingMap, IchingConfig)
- [ ] `packages/core-iching/src/trigrams.ts` com 8 trigramas-base (PT-BR/EN/ZH)
- [ ] `packages/core-iching/src/hexagrams.ts` com 16 hexagramas curados
- [ ] `pnpm-workspace.yaml` inclui `packages/core-iching`
- [ ] `pnpm --filter @cabala/core-iching build` verde
- [ ] Tipos exportados e importáveis de outros packages

### Task 2 — Algoritmo Plum Blossom + 16 hexagramas curados

- [ ] `packages/core-iching/src/plum-blossom.ts` (algoritmo determinístico)
- [ ] `packages/core-iching/src/build-iching-map.ts` (entry point público)
- [ ] `packages/core-iching/src/data/hexagrams.ts` (16 hexagramas curados com proveniência)
- [ ] `packages/core-iching/src/cabal-resonance.ts` (8 derivados → 8 Sefirot)
- [ ] `packages/core-iching/src/odu-resonance.ts` (leitura cruzada com Odu)
- [ ] ≥ 30 testes unitários em `packages/core-iching/tests/`:
  - 8 trigramas-base
  - 8 derivados Sefirot
  - Casos de borda (00:00, 23:59, GMT-12, GMT+14, horário de verão)
  - Determinismo (mesmo input → mesmo output, 1000x)
- [ ] `pnpm --filter @cabala/core-iching test` verde
- [ ] 100% das funções públicas cobertas

### Task 3 — Schema Prisma

- [ ] `User.ichingMap Json?` adicionado em `prisma/schema.prisma`
- [ ] `User.ichingEnabled Boolean @default(false)` adicionado
- [ ] `DailyReading.hexagram String?` adicionado
- [ ] `DailyReading.hexagramLines Json?` adicionado
- [ ] `Consultation.hexagram String?` adicionado
- [ ] Índice GIN em `User.ichingMap` (PostgreSQL)
- [ ] `packages/types/src/types.ts` atualizado com tipos TypeScript
- [ ] `npx prisma validate` verde

### Task 4 — Migration `iching`

- [ ] `npx prisma migrate dev --name iching` executa sem erros
- [ ] SQL gerado preserva defaults (`@default(false)`, `null`)
- [ ] `prisma/migrations/<ts>_iching/migration.sql` commitado
- [ ] `MIGRATIONS.md` atualizado com a nova migration
- [ ] Rollback testado em staging (`prisma migrate reset`)
- [ ] `npx prisma validate` + `npx prisma generate` verdes

### Task 5 — 16 entries `grimoire/iching/`

- [ ] 16 arquivos `grimoire/iching/hex-NN-*.md` criados (1 hexagrama por arquivo)
- [ ] Cada frontmatter tem `metadata.source` (Wilhelm/Baynes ou Legge), `metadata.lineage` ("Taoísta/Confuciana"), `title_en`
- [ ] Cada corpo tem PT-BR + `## EN` + `## Cabala × Sefirot` + `## Odu de Nascimento`
- [ ] `IDEIA.md` (ledger) atualizado com 16 entradas I-Ching
- [ ] `scripts/sync-grimoire.ts` inclui `grimoire/iching/`
- [ ] `tests/lib/grimoire/iching-completeness.test.ts` verde:
  - 16/16 com `metadata.source` não-vazio
  - 16/16 com `metadata.lineage` não-vazio
  - 16/16 com `title_en` não-vazio
  - 16/16 com seção `## EN` não-vazia
  - 16/16 com referência cruzada ao `IDEIA.md`
- [ ] `npm run grimoire:sync` verde; `GrimoireEntry` indexa 16 novos

### Task 6 — Integração Mandala (5º nó)

- [ ] `apps/akasha-portal/src/lib/mapa/iching-node.ts` criado
- [ ] `apps/akasha-portal/src/components/mandala/MandalaIchingNode.tsx` criado
- [ ] Wire-up em `MandalaChart.tsx` (5º nó ao lado dos 4 sistemas)
- [ ] Linha de ressonância entre o nó I-Ching e a Sefirá mapeada
- [ ] Tooltip mostra: número do hexagrama, trigramas, nome PT-BR + EN
- [ ] `tests/components/mandala/iching-node.test.tsx` verde
- [ ] Visual em dev: Mandala mostra 5º nó + linha de ressonância

### Task 7 — Integração `/daily` (hexagrama do dia)

- [ ] `apps/akasha-portal/src/lib/daily-engine/iching.ts` criado
- [ ] `scripts/daily-transits-cron.ts` calcula e persiste `DailyReading.hexagram` + `hexagramLines`
- [ ] `apps/akasha-portal/src/app/api/akasha/iching/daily/route.ts` criado
- [ ] UI em `/daily` exibe o hexagrama do dia
- [ ] `tests/integration/daily-iching.test.ts` verde
- [ ] Cronjob roda em dev; `DailyReading.hexagram` populado

### Task 8 — Integração `/oraculo` (hexagrama sorteável)

- [ ] `apps/akasha-portal/src/lib/oracle/iching-draw.ts` criado (sorteio com peso: 16 curados × 4, 48 restantes × 1)
- [ ] `apps/akasha-portal/src/app/api/akasha/oraculo/iching/route.ts` criado (gate `ichingEnabled = true`)
- [ ] `apps/akasha-portal/src/components/oraculo/IchingReading.tsx` criado
- [ ] Toggle "Permitir sorteio de I-Ching" em `/conta` (opt-in LGPD)
- [ ] `/oraculo` inclui I-Ching como opção
- [ ] `Consultation.hexagram` persistido quando sorteado
- [ ] `tests/lib/oracle/iching-draw.test.ts` verde (distribuição, determinismo com seed)
- [ ] `tests/api/akasha/oraculo/iching.test.ts` verde (POST/GET, gate, dedução de crédito)
- [ ] Sorteio funciona; opt-in respeitado; crédito debitado

### Task 9 — Teste-guardião da curadoria I-Ching

- [ ] `tests/lib/grimoire/curatorship-guardian-iching.test.ts` criado
- [ ] 16/16 entries com `metadata.source` válido (livro canônico)
- [ ] 16/16 com `metadata.lineage` válido
- [ ] 16/16 com `title_en` e `## EN`
- [ ] 16/16 com referência cruzada ao `IDEIA.md`
- [ ] Falha clara com `"hex-NN-*.md: <regra> ausente (Doc 20 AD-20.X)"`
- [ ] Adicionado ao CI (`.github/workflows/ci.yml`)
- [ ] Teste verde com 16 entries atuais

### Task 10 — Quality gates Fase 1

- [ ] `npx prisma validate` + `npx prisma generate` verdes
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run test:run` → ≥ 8400 testes passando, 0 falhas
- [ ] `npm run build` → OK
- [ ] `npm run lint` → sem novos warnings
- [ ] `npm run quality` (fallow) → 0 issues novas
- [ ] `pnpm --filter @cabala/core-iching test` → 100% verde
- [ ] Lighthouse mobile: Performance ≥ 90, A11y ≥ 95 (não regredir)
- [ ] `PROGRESS.md` §3.1 atualizado com métricas da Fase 1
- [ ] Commit + tag intermediária `v0.0.5-fase-1`

> **Gate de saída da Fase 1:** I-Ching 5º sistema completo + 16 entries curados + 8400+ testes passando.

---

## Fase 2 — EXPANSÃO VEGETATIVA

### Task 11 — 4 Odu de nascimento (entry + cálculo)

- [ ] 4 arquivos `grimoire/ancestral/odu-nascimento-{dia,lunar,saturno,hora}.md` criados
- [ ] Cada frontmatter tem `metadata.source` (livro de Ifá/Candomblé), `metadata.lineage`, `title_en`
- [ ] Cada corpo tem PT-BR + `## EN` + referência aos 16 Odus canônicos possíveis
- [ ] `packages/core-odus/src/build-odu-nascimento.ts` implementado:
  - `dia` ← dia da semana → 1 dos 16 Odus
  - `lunar` ← fase lunar → 1 dos 16 Odus
  - `saturno` ← posição de Saturno (usa `core-astrology`) → 1 dos 16 Odus
  - `hora` ← hora local → 1 dos 16 Odus
- [ ] ≥ 8 testes unitários para `buildOduNascimento` (4 entradas conhecidas por sub-classe)
- [ ] `IDEIA.md` atualizado com 4 entradas
- [ ] `pnpm --filter @cabala/core-odus test` verde

### Task 12 — 20 ervas brasileiras/afro-brasileiras

- [ ] 20 ervas selecionadas (lista curada com `metadata.source` definido):
  - 5 da Pajelança/Encantaria
  - 5 do Candomblé
  - 5 da Umbanda
  - 5 da medicina indígena brasileira
- [ ] 20 arquivos `grimoire/botanica/erva-053-*.md` … `erva-072-*.md` criados
- [ ] Cada frontmatter tem `metadata.source`, `metadata.lineage` (tradição específica), `title_en`
- [ ] Cada corpo tem PT-BR + `## EN` + cobertura (uso ritual, preparação, contexto)
- [ ] `IDEIA.md` atualizado com 20 entradas
- [ ] `tests/lib/grimoire/herbs-validation.test.ts` estendido:
  - 70+ arquivos (52 + 20)
  - 20 novos com proveniência completa
- [ ] `npm run grimoire:sync` verde

### Task 13 — 4 corpos clássicos (completar Árvore)

- [ ] 4 corpos selecionados para completar a Árvore esotérica (taxonomia Leadbeater/Powell/Besant)
- [ ] 4 arquivos `grimoire/vibracional/corpo-12-*.md` … `corpo-15-*.md` criados
- [ ] Cada frontmatter tem `metadata.source` (livro teosófico), `metadata.lineage`, `title_en`
- [ ] Cada corpo tem PT-BR + `## EN` + posição na Árvore + cruzamentos
- [ ] `IDEIA.md` atualizado com 4 entradas
- [ ] `tests/lib/grimoire/bodies-validation.test.ts`:
  - 15+ arquivos (11 + 4)
  - Numeração canônica respeitada
  - 4 novos com proveniência completa
- [ ] Árvore completa (15 corpos)

### Task 14 — Exibição dos Odu de nascimento na Mandala/daily

- [ ] `MandalaChart.tsx` mostra 4 sub-camadas no nó "Odu" (dia, lunar, Saturno, hora)
- [ ] Cada sub-camada é clicável e abre o entry curado
- [ ] `/daily` inclui "Odu de nascimento" no card de leitura
- [ ] `tests/components/mandala/odu-nascimento.test.tsx` verde
- [ ] `tests/integration/daily-odu-nascimento.test.ts` verde
- [ ] Mandala mostra 4 sub-camadas; daily inclui Odu

### Task 15 — Atualização `IDEIA.md` (60 novas entradas)

- [ ] 16 entradas I-Ching adicionadas
- [ ] 4 entradas Odu de nascimento adicionadas
- [ ] 20 entradas de ervas adicionadas
- [ ] 4 entradas de corpos adicionadas
- [ ] Cada entrada tem `source`, `lineage`, `cross_ref`
- [ ] `tests/lib/governance/ideia-ledger.test.ts` verde (60 entradas com 3 campos)
- [ ] `IDEIA.md` tem 60+ entradas; ledger test verde

### Task 16 — Teste-guardião da curadoria (expansão)

- [ ] `tests/lib/grimoire/curatorship-guardian.test.ts` estendido para 143+ entries:
  - Ervas (52 + 20 = 72)
  - Odus (16 + 4 = 20)
  - Corpos (11 + 4 = 15)
  - I-Ching (16)
  - **Total: 143+ entries**
- [ ] Regras de validação:
  - `metadata.source` não-vazio
  - `metadata.lineage` não-vazio
  - `title_en` não-vazio
  - Seção `## EN` não-vazia
  - Referência cruzada com `IDEIA.md` (ledger)
  - Frontmatter YAML parseável
- [ ] Falhas explícitas com referência à regra violada
- [ ] `npm run grimoire:audit` (gera `logs/grimoire-audit-<date>.md`)
- [ ] Teste verde com 143 entries; CI bloqueia regressão

### Task 17 — Quality gates Fase 2

- [ ] `npx prisma validate` + `npx prisma generate` verdes
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run test:run` → ≥ 8500 testes passando, 0 falhas
- [ ] `npm run build` → OK
- [ ] `npm run lint` → sem novos warnings
- [ ] `npm run quality` (fallow) → 0 issues novas
- [ ] `npm run grimoire:audit` → 0 entries com ❌
- [ ] `PROGRESS.md` §3.1 atualizado com métricas da Fase 2
- [ ] Commit + tag intermediária `v0.0.5-fase-2`

> **Gate de saída da Fase 2:** 44 entries v0.0.5 (16 + 28) + 143+ entries totais; 8500+ testes passando.

---

## Fase 3 — CORRELAÇÕES ENRIQUECIDAS

### Task 18 — I-Ching × Cabala (8 Sefirot)

- [ ] `apps/akasha-portal/src/lib/correlation/iching-cabala.ts` criado (8 derivados × 8 Sefirot)
- [ ] `correlateIchingCabala(hexagramNumber): Sefira` determinística
- [ ] ≥ 8 testes unitários (1 por Sefirá)
- [ ] Proveniência documentada no `Doc 14`

### Task 19 — I-Ching × Odu (16 + 4)

- [ ] `apps/akasha-portal/src/lib/correlation/iching-odu.ts` criado (20 correspondências)
- [ ] `correlateIchingOdu(hexagramNumber): OduCanônico` determinística
- [ ] ≥ 20 testes unitários
- [ ] Proveniência documentada no `Doc 14`

### Task 20 — I-Ching × Astrologia (12 signos + 10 planetas)

- [ ] `apps/akasha-portal/src/lib/correlation/iching-astrologia.ts` criado (22 correspondências)
- [ ] `correlateIchingAstrologia(hexagramNumber): { signo, planeta }` determinística
- [ ] ≥ 22 testes unitários
- [ ] Proveniência documentada no `Doc 14`

### Task 21 — I-Ching × Tarot (22 Arcanos Maiores)

- [ ] `apps/akasha-portal/src/lib/correlation/iching-tarot.ts` criado (22 correspondências)
- [ ] `correlateIchingTarot(hexagramNumber): Arcano` determinística
- [ ] ≥ 22 testes unitários
- [ ] Proveniência documentada no `Doc 14`

### Task 22 — Adensamento de correlações nos 4 sistemas

- [ ] Auditoria inicial: `lib/correlation/` — listar densidade atual por entry
- [ ] Ervas (72): 3–5 × 72 = 216–360 novas correlações
- [ ] Odus (20): 3–5 × 20 = 60–100 novas correlações
- [ ] Corpos (15): 3–5 × 15 = 45–75 novas correlações
- [ ] I-Ching (16): 3–5 × 16 = 48–80 novas correlações
- [ ] **Total: ≥ 250–415 novas correlações** (Decisão Q10c)
- [ ] Cada nova correlação tem `provenance` e `tradition`
- [ ] `tests/lib/correlation/density.test.ts` verde:
  - Média ≥ 6 correlações por entry
  - ≥ 80% dos entries com ≥ 5 correlações
- [ ] Densidade medida; correlações curadas (não inventadas)

### Task 23 — Atualização documental (Doc 14, 15, 25, 08, 19, 20)

- [ ] `Doc 14` — AD-14.1 a AD-14.5 marcados como ✅; "I-Ching 5º sistema" sai de Fase 2+ para "Implementado"
- [ ] `Doc 15 §1` v2.2 → v2.3 — tabela dos 16 hexagramas I-Ching
- [ ] `Doc 25 §0` — "10 tradições" (adicionar I-Ching)
- [ ] `Doc 25 §11` (diagrama) — 5º hub (I-Ching) conectado aos 4 sistemas
- [ ] `Doc 08` v3.2 → v3.3 — Onda 6 (v0.0.5) ✅
- [ ] `Doc 19 AD-19.4 #4` — estendido para i18n EN + ledger ref
- [ ] `Doc 20 AD-20.5` — rubrica de proveniência I-Ching
- [ ] Cross-references entre docs consistentes

### Task 24 — Quality gates finais + release v0.0.5

- [ ] `npx prisma validate` + `npx prisma generate` verdes
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run test:run` → ≥ 8600 testes passando, 0 falhas
- [ ] `npm run build` → OK, 0 warnings novos
- [ ] `npm run lint` → 0 warnings novos
- [ ] `npm run quality` (fallow) → 0 issues
- [ ] `npm run grimoire:audit` → 0 entries com ❌
- [ ] Lighthouse mobile: Performance ≥ 90, PWA ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 90
- [ ] `PROGRESS.md` §2 e §3.1 atualizados com métricas da Fase 3
- [ ] `PROGRESS.md` §3.3 (Dívida Explícita) — v0.0.5 não gera nova dívida
- [ ] `Doc 08` v3.3 (Onda 6 ✅)
- [ ] `Doc 14`, `Doc 15`, `Doc 25` atualizados
- [ ] `IDEIA.md` (ledger) — 60+ novas entradas confirmadas
- [ ] Commit final + push + tag de release `v1.1.0-akasha` (ou equivalente)
- [ ] Release notes publicadas com: 16 hexagramas I-Ching, 28 entries curados, 60 entries totais v0.0.5, 4 I-Ching × sistemas conexões, 250+ novas correlações

> **Gate de saída do v0.0.5:** todos os itens acima verdes; release taggeada; release notes publicadas.

---

## Critérios de Sucesso Globais (v0.0.5)

> Estes são os **5 critérios não-negociáveis** que o release v0.0.5 deve cumprir para ser considerado "done" (Decisão Q15).

### 1. I-Ching 5º sistema completo

- [ ] 16 hexagramas curados com proveniência (Wilhelm/Baynes ou Legge) e i18n PT-BR + EN
- [ ] Algoritmo Plum Blossom determinístico com ≥ 30 testes (incluindo casos de borda)
- [ ] Integração em Mandala (5º nó + linha de ressonância), `/daily` (hexagrama do dia), `/oraculo` (sorteio opt-in)
- [ ] `User.ichingMap` persistido no onboarding
- [ ] Mapeamento Cabala × Sefirot (8 derivados) ativo e testado

### 2. Expansão vegetativa do Grimório

- [ ] 4 "Odu de nascimento" curados (entry + cálculo híbrido) com i18n
- [ ] 20 ervas brasileiras/afro-brasileiras curadas com proveniência completa
- [ ] 4 corpos clássicos esotéricos (completar Árvore) com proveniência
- [ ] 28 entries da Fase 2 + 16 I-Ching da Fase 1 = **44 entries v0.0.5**

### 3. i18n completo

- [ ] 60 novos entries (16 + 4 + 20 + 4 + 16 derivações) com `## EN` válida + `title_en`
- [ ] 143+ entries totais (83 v0.0.4 + 60 v0.0.5) com cobertura EN completa
- [ ] UI com chaves novas em `messages/pt-BR.json` + `en.json`

### 4. Correlações enriquecidas

- [ ] I-Ching conectado a todos os 4 sistemas (Cabala, Odu, Astrologia, Tarot) — ≥ 72 correlações canônicas
- [ ] Adensamento dos 4 sistemas existentes: ≥ 250 novas correlações (média ≥ 6 por entry)
- [ ] Densidade total: ≥ 6 correlações por entry (Q10c, era ~3 no v0.0.4)
- [ ] ≥ 80% dos entries com ≥ 5 correlações
- [ ] Cada correlação tem `provenance` e `tradition` (Doc 20 §3)

### 5. Curadoria editorial & governança

- [ ] Teste-guardião da curadoria expandido (Doc 19 AD-19.4 #4) cobre 100% dos 143+ entries
- [ ] 0 entries com ❌ no `npm run grimoire:audit`
- [ ] `IDEIA.md` (ledger) com 60+ entradas (16 I-Ching + 4 Odus + 20 ervas + 4 corpos + 16 derivações Sefirot)
- [ ] Avaliação editorial: cada entry tem narrativa coerente com a tradição (não é tradução literal)
- [ ] Doc 14, 15, 19, 20, 25, 08 atualizados com a release v0.0.5

---

## Métricas-Alvo (v0.0.5 released)

| Métrica | Antes (v0.0.4) | Alvo (v0.0.5) | Incremento |
|---------|----------------|---------------|------------|
| Testes passando | 8113 | ≥ 8600 | +487 (~+6%) |
| Entries do Grimório | 83 | ≥ 127 | +44 (16 I-Ching + 28 expansão) |
| Tradições suportadas | 9+ | 10 | +1 (I-Ching) |
| Média de correlações/entry | ~3 | ≥ 6 | +3 (+100%) |
| Cobertura EN (Grimório) | 83/83 (100%) | 143/143 (100%) | +60 entries EN |
| Pacotes `core-*` | 5 (astrology, cabala, odus, tantra, types) | 6 (+ iching) | +1 |
| QUALITY_SCORE | ≥ 0.91 | ≥ 0.91 | mantido |
| Build OK | ✅ | ✅ | mantido |
| Lighthouse PWA | (v0.0.4 deliverable) | ≥ 90 | mantido |
| Dívida explícita v0.0.4 | n/a | registrada em `PROGRESS.md §3.3` | — |
| Dívida nova v0.0.5 | — | **0** (v0.0.5 não gera dívida) | meta |

---

## Dívida Explícita — registro de pendências v0.0.4 (Fase 0)

> Itens do `akasha-v0.0.4/tasks.md` que **não foram entregues** quando o v0.0.4 fechou, mas que **não bloqueiam** o v0.0.5. Devem ser registrados em `PROGRESS.md §3.3` antes do v0.0.5 começar (Decisão Q1: v0.0.5 = novo escopo após v0.0.4 fechar).

- [ ] _(preencher quando o v0.0.4 fechar — copiar itens não-marcados de `akasha-v0.0.4/tasks.md` que não foram entregues)_

**Categorias sugeridas de dívida:**

- **Ataque imediato (P0):** itens críticos que impedem o v0.0.5 de começar (Curadoria D4, build OK, etc.)
- **Backlog (P1):** itens importantes mas não-bloqueantes (algum item da Fase 2 ou 3 do v0.0.4 que não fechou)
- **Desejável (P2):** nice-to-have que pode ser re-priorizado no v0.0.6+ (algum item opcional do v0.0.4)

**Tratamento pelo v0.0.5:** v0.0.5 **não ataca** essa dívida automaticamente. A decisão de atacar P0 antes ou em paralelo com o v0.0.5 é registrada em `PROGRESS.md §3.3` e pode gerar um spec adicional (v0.0.5.1 ou v0.0.6).

---

## Premissas Absolutas (gate de entrada)

1. **v0.0.4 released** com tag + release notes + PROGRESS.md atualizado.
2. **Curadoria D4 ✅** — proveniência dos 16 Odus preenchida; `Doc 15 §1` sem `⚠️ PROVISIONAL`.
3. **Monorepo funcional** — `apps/akasha-portal/` é o portal ativo.
4. **8113+ testes passando** — base mantida.
5. **i18n EN do corpo dos 83 entries** — T9 do v0.0.4 entregue (ou registrado como dívida).

Se qualquer premissa falhar, **o v0.0.5 não começa**. A dívida é atacada primeiro, com registro em `PROGRESS.md §3.3`.

---

## Out-of-Scope (v0.0.5)

> Itens explicitamente **fora** do escopo do v0.0.5, mesmo que relacionados.

- **I-Ching com 64 hexagramas curados** — fora do v0.0.5 (apenas 16 com peso 4 no sorteio; 48 restantes com peso 1; os 64 do canon só são curados no v0.0.6+)
- **Hexagram reader (visualizador interativo)** — fora do v0.0.5 (apenas exibição estática do hexagrama + leitura cruzada)
- **Tradições adicionais** (Runas, Geomancia, Astrologia Hindu/Védica, etc.) — fora do v0.0.5 (vai para v0.0.6+)
- **Mobile app nativo** (Capacitor/Tauri/Expo) — fora do v0.0.5 (vai para v0.0.6+ ou v0.1.0)
- **Comunidade, social, B2B-lite, marketplace** — fora do v0.0.5 (vai para v0.0.6+ ou v0.1.0)
- **Planos anuais, gift cards, B2B** — fora do v0.0.5 (vai para v0.0.6+ ou v0.1.0)
- **Migração `apps/akasha-portal/` (T1 do v0.0.4)** — pré-requisito, não retrabalho
- **PWA full-install, push notifications, Toroide WebGL (v0.0.4)** — pré-requisitos, não retrabalho
- **i18n EN do corpo dos 83 entries existentes (T9 do v0.0.4)** — pré-requisito, não retrabalho

---

## Próximos Passos (após aprovação do v0.0.5)

1. **Fase 0:** Verificar v0.0.4 released; registrar dívida em `PROGRESS.md §3.3`.
2. **Fase 1:** Começar com T1 (packages/core-iching) — caminho crítico.
3. **Tag intermediária `v0.0.5-fase-1`** ao final da Fase 1.
4. **Tag intermediária `v0.0.5-fase-2`** ao final da Fase 2.
5. **Tag de release `v1.1.0-akasha`** ao final da Fase 3 (T24).

**Estimativa de duração total:** 13–19 semanas (3–4.5 meses), com 1 desenvolvedor full-time no caminho crítico. Paralelização pode reduzir para 10–14 semanas com 2–3 desenvolvedores.
