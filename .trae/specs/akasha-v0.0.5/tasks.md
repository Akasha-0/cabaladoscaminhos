# Tasks — Akasha v0.0.5

> **Status:** Proposta (aguardando aprovação)
> **Caminho crítico:** T1 → T2 → T5 → T6 → T10 → T11 → T15 → T18 → T24
> **Premissa absoluta:** Fase 0 (v0.0.4 released) é gate de entrada.

---

## Fase 0 — PRÉ-REQUISITO (verificar, não executar)

> **Esta fase NÃO é executada pelo v0.0.5.** É a confirmação de que o v0.0.4 fechou corretamente e que o v0.0.5 pode começar.

- [ ] **Task 0: Confirmar v0.0.4 released e registrar dívida explícita**
  - [ ] v0.0.4 tagged em git (tag `v1.0.0-akasha-v2` ou equivalente) com commit + release notes
  - [ ] `PROGRESS.md` §3.1 atualizado com as métricas finais do v0.0.4 (testes passando, build OK, QUALITY_SCORE)
  - [ ] `PROGRESS.md §3.3` (Dívida Explícita) criado/atualizado com tudo que ficou pendente no v0.0.4 (qualquer item de `tasks.md` v0.0.4 não-marcado)
  - [ ] `Doc 08` v3.2 (Onda 5 ✅) — release formalizado
  - [ ] `Doc 25 §0` reflete o estado do v0.0.4 released
  - [ ] 8113+ testes passando, 0 falhas
  - [ ] 9 modelos B2C canônicos + schema valid
  - [ ] `apps/akasha-portal/` é o portal ativo (monorepo concluído)
  - [ ] `Doc 15 §1` sem `⚠️ PROVISIONAL (D4)` — proveniência dos 16 Odus ✅
  - [ ] Cobertura EN do corpo dos 83 entries existentes (de T9 do v0.0.4)

> **Gate de entrada da Fase 1:** todos os 11 itens acima verdes. Se qualquer item falhar, **o v0.0.5 não começa** — a dívida é atacada primeiro.

---

## Fase 1 — I-CHING (5º SISTEMA)  [HEADLINE]

> **Objetivo:** entregar o I-Ching como 5º sistema oracular completo (16 hexagramas, Plum Blossom, integração Mandala+daily+oráculo).

### Task 1 — `packages/core-iching` (agnóstico)

- [ ] SubTask 1.1: Criar estrutura `packages/core-iching/{src,tests,package.json,tsconfig.json}` seguindo o padrão de `core-{astrology,cabala,odus,tantra}`
- [ ] SubTask 1.2: Definir tipos em `packages/core-iching/src/types.ts` (Hexagram, Trigram, IchingMap, IchingConfig)
- [ ] SubTask 1.3: Implementar `packages/core-iching/src/trigrams.ts` (8 trigramas-base com nomes PT-BR/EN/ZH)
- [ ] SubTask 1.4: Implementar `packages/core-iching/src/hexagrams.ts` (16 hexagramas curados com proveniência)
- [ ] SubTask 1.5: Configurar `pnpm-workspace.yaml` para incluir `packages/core-iching`
- [ ] Verify: `pnpm --filter @cabala/core-iching build` verde; tipos exportados corretamente

### Task 2 — Algoritmo Plum Blossom + 16 hexagramas curados

- [ ] SubTask 2.1: Implementar `packages/core-iching/src/plum-blossom.ts` (algoritmo determinístico: upper trigram ← ano+mês, lower trigram ← dia+hora)
- [ ] SubTask 2.2: Implementar `packages/core-iching/src/build-iching-map.ts` (entry point público: recebe birthDate+birthTime+timezone, retorna IchingMap)
- [ ] SubTask 2.3: Curar os 16 hexagramas em `packages/core-iching/src/data/hexagrams.ts` (PT-BR + EN + ZH + proveniência Wilhelm/Baynes ou Legge)
- [ ] SubTask 2.4: Implementar mapeamento Cabala × Sefirot em `packages/core-iching/src/cabal-resonance.ts` (8 derivados → 8 Sefirot)
- [ ] SubTask 2.5: Implementar leitura cruzada com Odu de nascimento em `packages/core-iching/src/odu-resonance.ts`
- [ ] SubTask 2.6: ≥ 30 testes unitários em `packages/core-iching/tests/`:
  - 8 trigramas-base (entradas/saídas conhecidas)
  - 8 derivados Sefirot (mapeamento fixo)
  - Casos de borda (00:00, 23:59, GMT-12, GMT+14, horário de verão)
  - Determinismo (mesmo input → mesmo output, 1000x)
- [ ] Verify: `pnpm --filter @cabala/core-iching test` verde; 100% das funções públicas cobertas

### Task 3 — Schema Prisma: `User.ichingMap` + correlatos

- [ ] SubTask 3.1: Adicionar `User.ichingMap Json?` em `prisma/schema.prisma` (model User)
- [ ] SubTask 3.2: Adicionar `User.ichingEnabled Boolean @default(false)` em `prisma/schema.prisma` (model User)
- [ ] SubTask 3.3: Adicionar `DailyReading.hexagram String?` em `prisma/schema.prisma`
- [ ] SubTask 3.4: Adicionar `DailyReading.hexagramLines Json?` em `prisma/schema.prisma`
- [ ] SubTask 3.5: Adicionar `Consultation.hexagram String?` em `prisma/schema.prisma`
- [ ] SubTask 3.6: Adicionar índice GIN em `User.ichingMap` (PostgreSQL) para queries eficientes
- [ ] SubTask 3.7: Atualizar `packages/types/src/types.ts` com tipos TypeScript dos novos campos
- [ ] Verify: `npx prisma validate` verde; tipos exportados

### Task 4 — Migration `iching`

- [ ] SubTask 4.1: Rodar `npx prisma migrate dev --name iching` (cria `prisma/migrations/<ts>_iching/`)
- [ ] SubTask 4.2: Inspecionar SQL gerado — confirma que defaults (`@default(false)`, `null`) estão preservados
- [ ] SubTask 4.3: Adicionar `prisma/migrations/<ts>_iching/migration.sql` ao git
- [ ] SubTask 4.4: Atualizar `MIGRATIONS.md` com a nova migration
- [ ] SubTask 4.5: Testar rollback (`npx prisma migrate reset` em staging) — `npx prisma migrate dev` aplica limpo
- [ ] Verify: `npx prisma validate` + `npx prisma generate` verdes; migration aplica em dev

### Task 5 — 16 entries `grimoire/iching/` (PT-BR + EN, Doc 20)

- [ ] SubTask 5.1: Criar `grimoire/iching/` com 16 arquivos `hex-NN-*.md` (1 hexagrama por arquivo)
- [ ] SubTask 5.2: Cada frontmatter tem `metadata.source` (Wilhelm/Baynes ou Legge — Doc 20), `metadata.lineage` ("Taoísta/Confuciana"), `title_en`
- [ ] SubTask 5.3: Cada corpo tem:
  - PT-BR (descrição completa, proveniência, simbolismo, cruzamentos)
  - Seção `## EN` traduzida
  - Seção `## Cabala × Sefirot` documentando a Sefirá ecoada
  - Seção `## Odu de Nascimento` documentando o Odu ecoado
- [ ] SubTask 5.4: Atualizar `IDEIA.md` (ledger, Doc 20 AD-20.5) com 16 entradas I-Ching
- [ ] SubTask 5.5: Atualizar `scripts/sync-grimoire.ts` para incluir `grimoire/iching/`
- [ ] SubTask 5.6: Teste `tests/lib/grimoire/iching-completeness.test.ts`:
  - 16/16 arquivos com `metadata.source` não-vazio
  - 16/16 com `metadata.lineage` não-vazio
  - 16/16 com `title_en` não-vazio
  - 16/16 com seção `## EN` não-vazia
  - 16/16 com referência cruzada ao `IDEIA.md`
- [ ] Verify: `npm run grimoire:sync` verde; `GrimoireEntry` indexa 16 novos

### Task 6 — Integração Mandala (5º nó)

- [ ] SubTask 6.1: Criar `apps/akasha-portal/src/lib/mapa/iching-node.ts` (cálculo da posição do nó na Mandala)
- [ ] SubTask 6.2: Criar `apps/akasha-portal/src/components/mandala/MandalaIchingNode.tsx` (5º nó SVG)
- [ ] SubTask 6.3: Wire-up em `MandalaChart.tsx` — renderizar o nó I-Ching ao lado dos 4 sistemas
- [ ] SubTask 6.4: Renderizar **linha de ressonância** entre o nó I-Ching e a Sefirá mapeada
- [ ] SubTask 6.5: Tooltip/info-popup mostra: número do hexagrama, trigramas (superior/inferior), nome PT-BR + EN
- [ ] SubTask 6.6: Teste `tests/components/mandala/iching-node.test.tsx` (renderiza, tooltip, posição)
- [ ] Verify: Visual em dev — Mandala mostra 5º nó; linha de ressonância visível

### Task 7 — Integração `/daily` (hexagrama do dia)

- [ ] SubTask 7.1: Criar `apps/akasha-portal/src/lib/daily-engine/iching.ts` (cálculo do hexagrama do dia a partir da data atual)
- [ ] SubTask 7.2: Modificar `scripts/daily-transits-cron.ts` para calcular e persistir `DailyReading.hexagram` + `hexagramLines`
- [ ] SubTask 7.3: Criar `apps/akasha-portal/src/app/api/akasha/iching/daily/route.ts` (GET do hexagrama do dia)
- [ ] SubTask 7.4: UI em `/daily` exibe o hexagrama do dia ao lado do orbe solar, Odu do dia, anjo do dia
- [ ] SubTask 7.5: Teste `tests/integration/daily-iching.test.ts` (cronjob gera hexagrama, API retorna, UI renderiza)
- [ ] Verify: Cronjob roda em dev; `DailyReading.hexagram` populado; `/daily` exibe

### Task 8 — Integração `/oraculo` (hexagrama sorteável, opt-in)

- [ ] SubTask 8.1: Criar `apps/akasha-portal/src/lib/oracle/iching-draw.ts` (sorteio com peso: 16 curados com peso 4, 48 restantes com peso 1)
- [ ] SubTask 8.2: Criar `apps/akasha-portal/src/app/api/akasha/oraculo/iching/route.ts` (POST do sorteio, gate `ichingEnabled = true`)
- [ ] SubTask 8.3: Criar `apps/akasha-portal/src/components/oraculo/IchingReading.tsx` (UI do hexagrama sorteado, com leitura cruzada Cabala+Odu)
- [ ] SubTask 8.4: Adicionar toggle "Permitir sorteio de I-Ching" em `/conta` (opt-in LGPD)
- [ ] SubTask 8.5: Modificar `/oraculo` para incluir I-Ching como opção (junto com Tarot, Odu, etc.)
- [ ] SubTask 8.6: Persistir `Consultation.hexagram` quando sorteado
- [ ] SubTask 8.7: Teste `tests/lib/oracle/iching-draw.test.ts` (distribuição de pesos, determinismo com seed)
- [ ] SubTask 8.8: Teste `tests/api/akasha/oraculo/iching.test.ts` (POST/GET, gate de opt-in, dedução de crédito)
- [ ] Verify: Sorteio funciona; opt-in é respeitado; crédito é debitado

### Task 9 — Teste-guardião da curadoria I-Ching

- [ ] SubTask 9.1: Criar `tests/lib/grimoire/curatorship-guardian-iching.test.ts`:
  - 16/16 entries com `metadata.source` válido (livro canônico reconhecível)
  - 16/16 com `metadata.lineage` válido
  - 16/16 com `title_en` e `## EN`
  - 16/16 com referência cruzada ao `IDEIA.md`
- [ ] SubTask 9.2: Falha clara com mensagem `"hex-NN-*.md: <regra> ausente (Doc 20 AD-20.X)"`
- [ ] SubTask 9.3: Adicionar ao CI (workflow `.github/workflows/ci.yml`)
- [ ] Verify: Teste verde com 16 entries atuais; falha com entry "quebrado" simulado

### Task 10 — Quality gates Fase 1

- [ ] `npx prisma validate` + `npx prisma generate` verdes
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run test:run` → ≥ 8400 testes passando (8113 + 287 novos), 0 falhas
- [ ] `npm run build` → OK
- [ ] `npm run lint` → sem novos warnings
- [ ] `npm run quality` (fallow) → 0 issues novas
- [ ] `pnpm --filter @cabala/core-iching test` → 100% verde
- [ ] Lighthouse mobile: Performance ≥ 90, A11y ≥ 95 (não regredir)
- [ ] `PROGRESS.md` §3.1 atualizado com métricas da Fase 1
- [ ] Commit + tag intermediária `v0.0.5-fase-1`

> **Gate de saída da Fase 1:** I-Ching 5º sistema completo (16 hexagramas, Plum Blossom, integração Mandala+daily+oráculo), 16 entries curados, 8400+ testes passando.

---

## Fase 2 — EXPANSÃO VEGETATIVA

> **Objetivo:** engrossar o Grimório com 28 entries curados (4 Odu de nascimento + 20 ervas + 4 corpos), todos com rigor total (Doc 20) e i18n PT-BR + EN.

### Task 11 — 4 Odu de nascimento (entry + cálculo)

- [ ] SubTask 11.1: Criar 4 arquivos `grimoire/ancestral/odu-nascimento-{dia,lunar,saturno,hora}.md`
- [ ] SubTask 11.2: Cada frontmatter tem `metadata.source` (livro de Ifá/Candomblé), `metadata.lineage` ("Yorubá/Ifá/Candomblé"), `title_en`
- [ ] SubTask 11.3: Cada corpo tem PT-BR + `## EN` + referência aos 16 Odus canônicos possíveis
- [ ] SubTask 11.4: Implementar `packages/core-odus/src/build-odu-nascimento.ts`:
  - `dia` ← dia da semana (0–6) → mapeamento para 1 dos 16 Odus
  - `lunar` ← fase lunar (calculada por algoritmo determinístico) → mapeamento
  - `saturno` ← posição de Saturno na roda zodiacal (usa `core-astrology`) → mapeamento
  - `hora` ← hora local (0–23) → mapeamento
- [ ] SubTask 11.5: ≥ 8 testes unitários para `buildOduNascimento` (4 entradas conhecidas por sub-classe)
- [ ] SubTask 11.6: Atualizar `IDEIA.md` com 4 entradas Odu de nascimento
- [ ] Verify: `pnpm --filter @cabala/core-odus test` verde

### Task 12 — 20 ervas brasileiras/afro-brasileiras

- [ ] SubTask 12.1: Selecionar 20 ervas da tradição brasileira/afro-brasileira (lista curada com `metadata.source` definido)
  - 5 da Pajelança/Encantaria
  - 5 do Candomblé
  - 5 da Umbanda
  - 5 da medicina indígena brasileira
- [ ] SubTask 12.2: Criar 20 arquivos `grimoire/botanica/erva-053-*.md` … `erva-072-*.md`
- [ ] SubTask 12.3: Cada frontmatter tem `metadata.source` (livro/autor/edição), `metadata.lineage` (tradição específica), `title_en`
- [ ] SubTask 12.4: Cada corpo tem PT-BR + `## EN` + cobertura (uso ritual, preparação, contexto)
- [ ] SubTask 12.5: Atualizar `IDEIA.md` com 20 entradas
- [ ] SubTask 12.6: Teste `tests/lib/grimoire/herbs-validation.test.ts` estendido:
  - 70+ arquivos (52 + 20)
  - 20 novos com proveniência completa
- [ ] Verify: `npm run grimoire:sync` verde; cobertura ampliada em ≥ 35%

### Task 13 — 4 corpos clássicos (completar Árvore)

- [ ] SubTask 13.1: Selecionar 4 corpos para completar a Árvore esotérica (lista curada):
  - Identificar a taxonomia canônica (Leadbeater, Powell, Besant, ou similar — Doc 20)
  - Escolher 4 que completem os 11 existentes (provavelmente os 4 mais altos: Atma, Buddhi, Manas Superior, ou similar)
- [ ] SubTask 13.2: Criar 4 arquivos `grimoire/vibracional/corpo-12-*.md` … `corpo-15-*.md`
- [ ] SubTask 13.3: Cada frontmatter tem `metadata.source` (livro teosófico reconhecível), `metadata.lineage` ("Esotérico ocidental" ou "Teosófico"), `title_en`
- [ ] SubTask 13.4: Cada corpo tem PT-BR + `## EN` + posição na Árvore + cruzamentos
- [ ] SubTask 13.5: Atualizar `IDEIA.md` com 4 entradas
- [ ] SubTask 13.6: Teste `tests/lib/grimoire/bodies-validation.test.ts`:
  - 15+ arquivos (11 + 4)
  - Numeração canônica respeitada
  - 4 novos com proveniência completa
- [ ] Verify: Árvore completa (15 corpos); `npm run grimoire:sync` verde

### Task 14 — Exibição dos Odu de nascimento na Mandala/daily

- [ ] SubTask 14.1: Modificar `MandalaChart.tsx` para mostrar 4 sub-camadas no nó "Odu" (dia, lunar, Saturno, hora)
- [ ] SubTask 14.2: Cada sub-camada é clicável e abre o entry curado correspondente
- [ ] SubTask 14.3: Modificar `/daily` para incluir "Odu de nascimento" no card de leitura
- [ ] SubTask 14.4: Teste `tests/components/mandala/odu-nascimento.test.tsx`
- [ ] SubTask 14.5: Teste `tests/integration/daily-odu-nascimento.test.ts`
- [ ] Verify: Mandala mostra 4 sub-camadas; daily inclui Odu de nascimento

### Task 15 — Atualização `IDEIA.md` (60 novas entradas)

- [ ] SubTask 15.1: Adicionar 16 entradas I-Ching (Fase 1)
- [ ] SubTask 15.2: Adicionar 4 entradas Odu de nascimento
- [ ] SubTask 15.3: Adicionar 20 entradas de ervas
- [ ] SubTask 15.4: Adicionar 4 entradas de corpos
- [ ] SubTask 15.5: Cada entrada tem `source` (livro/autor/edição/página), `lineage` (tradição), `cross_ref` (arquivo `grimoire/`)
- [ ] SubTask 15.6: Teste `tests/lib/governance/ideia-ledger.test.ts` (60 entradas, todas com `source` + `lineage` + `cross_ref`)
- [ ] Verify: `IDEIA.md` tem 60+ entradas; ledger test verde

### Task 16 — Teste-guardião da curadoria (expansão)

- [ ] SubTask 16.1: Estender `tests/lib/grimoire/curatorship-guardian.test.ts` para cobrir:
  - Ervas (52 atuais + 20 novos = 72)
  - Odus (16 canônicos + 4 de nascimento = 20)
  - Corpos (11 + 4 = 15)
  - I-Ching (16)
  - **Total: 143+ entries**
- [ ] SubTask 16.2: Regras de validação:
  - `metadata.source` não-vazio
  - `metadata.lineage` não-vazio
  - `title_en` não-vazio
  - Seção `## EN` não-vazia
  - Referência cruzada com `IDEIA.md` (ledger)
  - Frontmatter YAML parseável
- [ ] SubTask 16.3: Falhas explícitas com referência à regra violada
- [ ] SubTask 16.4: Adicionar `npm run grimoire:audit` (gera `logs/grimoire-audit-<date>.md`)
- [ ] Verify: Teste verde com 143 entries; CI bloqueia regressão

### Task 17 — Quality gates Fase 2

- [ ] `npx prisma validate` + `npx prisma generate` verdes
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run test:run` → ≥ 8500 testes passando (8400 + 100 novos), 0 falhas
- [ ] `npm run build` → OK
- [ ] `npm run lint` → sem novos warnings
- [ ] `npm run quality` (fallow) → 0 issues novas
- [ ] `npm run grimoire:audit` → 0 entries com ❌
- [ ] `PROGRESS.md` §3.1 atualizado com métricas da Fase 2
- [ ] Commit + tag intermediária `v0.0.5-fase-2`

> **Gate de saída da Fase 2:** 28 entries curados (4 + 20 + 4) + 16 I-Ching da Fase 1 = 44 entries v0.0.5; 143+ entries totais no Grimório; 8500+ testes passando.

---

## Fase 3 — CORRELAÇÕES ENRIQUECIDAS

> **Objetivo:** I-Ching entra como 5º hub no cross-engine + adensamento dos 4 sistemas existentes.

### Task 18 — I-Ching × Cabala (8 Sefirot)

- [ ] SubTask 18.1: Criar `apps/akasha-portal/src/lib/correlation/iching-cabala.ts` (mapeamento canônico: 8 derivados × 8 Sefirot superiores)
- [ ] SubTask 18.2: Função `correlateIchingCabala(hexagramNumber): Sefira` determinística
- [ ] SubTask 18.3: ≥ 8 testes unitários (1 por Sefirá mapeada)
- [ ] SubTask 18.4: Documentar proveniência no Doc 14 (atualizado)
- [ ] Verify: Testes verdes; mapeamento documentado

### Task 19 — I-Ching × Odu (16 + 4 de nascimento)

- [ ] SubTask 19.1: Criar `apps/akasha-portal/src/lib/correlation/iching-odu.ts` (16+4 = 20 correspondências)
- [ ] SubTask 19.2: Função `correlateIchingOdu(hexagramNumber): OduCanônico` determinística
- [ ] SubTask 19.3: ≥ 20 testes unitários
- [ ] SubTask 19.4: Documentar proveniência (Doc 14)
- [ ] Verify: Testes verdes; 20 mapeamentos curados

### Task 20 — I-Ching × Astrologia (12 signos + 10 planetas)

- [ ] SubTask 20.1: Criar `apps/akasha-portal/src/lib/correlation/iching-astrologia.ts` (12 signos + 10 planetas = 22 correspondências)
- [ ] SubTask 20.2: Função `correlateIchingAstrologia(hexagramNumber): { signo, planeta }` determinística
- [ ] SubTask 20.3: ≥ 22 testes unitários
- [ ] SubTask 20.4: Documentar proveniência (Doc 14)
- [ ] Verify: Testes verdes; 22 mapeamentos curados

### Task 21 — I-Ching × Tarot (22 Arcanos Maiores)

- [ ] SubTask 21.1: Criar `apps/akasha-portal/src/lib/correlation/iching-tarot.ts` (22 Arcanos = 22 correspondências)
- [ ] SubTask 21.2: Função `correlateIchingTarot(hexagramNumber): Arcano` determinística
- [ ] SubTask 21.3: ≥ 22 testes unitários
- [ ] SubTask 21.4: Documentar proveniência (Doc 14)
- [ ] Verify: Testes verdes; 22 mapeamentos curados

### Task 22 — Adensamento de correlações nos 4 sistemas (≥ 3–5 novas por entry)

- [ ] SubTask 22.1: Auditar `lib/correlation/` (motores atuais) — listar densidade atual por entry
- [ ] SubTask 22.2: Para cada entry do Grimório (143+), adicionar 3–5 novas correlações:
  - Ervas (72): 3–5 × 72 = 216–360 correlações
  - Odus (20): 3–5 × 20 = 60–100
  - Corpos (15): 3–5 × 15 = 45–75
  - I-Ching (16): 3–5 × 16 = 48–80
  - **Total: ≥ 250–415 novas correlações** (Q10c)
- [ ] SubTask 22.3: Cada nova correlação tem `provenance` (qual entry a originou) e `tradition` (qual sistema)
- [ ] SubTask 22.4: Teste `tests/lib/correlation/density.test.ts`:
  - Média ≥ 6 correlações por entry
  - ≥ 80% dos entries com ≥ 5 correlações
- [ ] Verify: Densidade medida; correlações curadas (não inventadas)

### Task 23 — Atualização documental (Doc 14, 15, 25)

- [ ] SubTask 23.1: `Doc 14` — marcar AD-14.1 a AD-14.5 como ✅; mover "I-Ching 5º sistema" de Fase 2+ para "Implementado"
- [ ] SubTask 23.2: `Doc 15 §1` v2.2 → v2.3 — incluir tabela dos 16 hexagramas I-Ching
- [ ] SubTask 23.3: `Doc 25 §0` — atualizar para "10 tradições" (adicionar I-Ching)
- [ ] SubTask 23.4: `Doc 25 §11` (diagrama) — mostrar 5º hub (I-Ching) conectado aos 4 sistemas
- [ ] SubTask 23.5: `Doc 08` v3.2 → v3.3 — incluir Onda 6 (v0.0.5) ✅
- [ ] SubTask 23.6: `Doc 19 AD-19.4 #4` — estendido para cobrir i18n EN + ledger ref
- [ ] SubTask 23.7: `Doc 20 AD-20.5` — rubrica de proveniência I-Ching
- [ ] Verify: Todos os docs atualizados; cross-references consistentes

### Task 24 — Quality gates finais + release v0.0.5

- [ ] `npx prisma validate` + `npx prisma generate` verdes
- [ ] `npx tsc --noEmit` → 0 erros
- [ ] `npm run test:run` → ≥ 8600 testes passando (8500 + 100 novos da Fase 3), 0 falhas
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
- [ ] Release notes com: 16 hexagramas I-Ching, 28 entries curados, 60 entries totais v0.0.5, 4 I-Ching × sistemas conexões, 250+ novas correlações

> **Gate de saída do v0.0.5:** todos os itens acima verdes; release taggeada; release notes publicadas.

---

## Task Dependencies

```
Fase 0 (verificar) — gate de entrada
  ↓
Fase 1 — I-CHING (sequencial crítico)
  T1 → T2 → T5 → T6 → T10
  T3 ║ T4 (paralelo com T1/T2)
  T7 → T8 (após T5; paralelos entre si)
  T9 (após T5; paralelo com T6/T7/T8)
  ↓
Fase 2 — EXPANSÃO (sequencial crítico)
  T11 → T15 → T16
  T12, T13 (paralelos entre si; após T11)
  T14 (após T11)
  T17 (após todos da Fase 2)
  ↓
Fase 3 — CORRELAÇÕES (paralelos)
  T18, T19, T20, T21 (paralelos entre si)
  T22 (após T18–T21)
  T23 (paralelo com T22)
  T24 (após todos da Fase 3)
  ↓
Release v0.0.5
```

### Caminho Crítico (gargalo)

```
T1 → T2 → T5 → T6 → T10 → T11 → T15 → T18 → T24
```

- **T1 → T2** (4–6 semanas): packages/core-iching + Plum Blossom
- **T2 → T5** (4–6 semanas): curadoria dos 16 hexagramas I-Ching
- **T5 → T6** (1–2 semanas): integração Mandala
- **T6 → T10** (1 semana): quality gates Fase 1
- **T10 → T11** (3–4 semanas): 4 Odu de nascimento (entry + cálculo)
- **T11 → T15** (1 semana): ledger update
- **T15 → T18** (3–4 semanas): I-Ching × Cabala
- **T18 → T24** (3–4 semanas): quality gates finais + release

**Total estimado do caminho crítico:** 18–27 semanas (4.5–6.5 meses), assumindo 1 desenvolvedor full-time.

### Trabalho Paralelo (não-crítico)

- T7 (daily engine) pode rodar em paralelo com T6 (Mandala)
- T8 (oráculo) pode rodar em paralelo com T7
- T12 (ervas), T13 (corpos) podem rodar em paralelo entre si
- T19, T20, T21 (correlações específicas) podem rodar em paralelo entre si

---

## Resumo Quantitativo

| Fase | Tasks | Entries criados | Testes adicionados | Duração estimada |
|------|-------|-----------------|---------------------|------------------|
| 0 | 1 | 0 | 0 | 0 (verificar) |
| 1 | 10 | 16 (I-Ching) | ~287 | 6–9 semanas |
| 2 | 7 | 28 (4 Odus + 20 ervas + 4 corpos) | ~100 | 4–6 semanas |
| 3 | 7 | 0 (correlações) + 60 ledger updates | ~100 | 3–4 semanas |
| **Total** | **25** | **44 entries v0.0.5** | **~487 novos** | **13–19 semanas** |

**Total cumulativo pós-v0.0.5:**
- Grimório: 83 (v0.0.4) + 44 (v0.0.5) = **127+ entries curados** (na verdade 83 + 16 I-Ching + 28 = 127)
- Testes: 8113 (v0.0.4) + 487 (v0.0.5) = **8600+ testes passando**
- Tradições: 9+ (v0.0.4) → **10** (v0.0.5 com I-Ching)
- Correlações: ~3 média (v0.0.4) → **≥ 6 média** (v0.0.5)

---

## Premissas e Riscos (resumo)

**Premissas:**
- v0.0.4 released (gate de entrada)
- Algoritmo Plum Blossom é determinístico e reproduzível
- 16 hexagramas cabem em 8 Sefirot disponíveis
- Cross-engine é estritamente aditivo

**Riscos principais:**
- Scope creep (60 entries + 16 hexagramas + correlações) — mitigado por gates intermediários
- Plum Blossom em fusos de borda — mitigado por testes
- I-Ching "paralelo" ao resto — mitigado por teste de cross-reading
- i18n EN gargalo — mitigado por tradução assistida + revisão editorial
- Conflito com Curadoria D4 — mitigado por gate de entrada na Fase 0

(Ver `spec.md` para detalhes completos.)
