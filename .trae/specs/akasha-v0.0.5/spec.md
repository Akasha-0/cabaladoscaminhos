# Akasha v0.0.5 — Conteúdo & Profundidade: I-Ching 5º Sistema + Expansão do Grimório + Correlações Enriquecidas — Spec

> **Versão:** 0.0.5
> **Status:** Proposta (aguardando aprovação)
> **Sucessor de:** `akasha-v0.0.4` (em desenvolvimento — Fase 0 deve estar **released** antes do v0.0.5 começar)

---

## Why

O `akasha-v0.0.4` é o release de pós-launch ("Conclusão, Atmosfera & Escala") que está **em desenvolvimento** neste momento. Quando ele fechar (e for released como `v1.0.0-akasha-v2` ou equivalente), o próximo release — **v0.0.5** — abre uma nova onda de **conteúdo/profundidade**, organizada em **três fases encadeadas**:

1. **Fase 1 — I-Ching como 5º sistema oracular** (entrega principal/headline): 16 hexagramas curados (8 trigramas-base + 8 com mapeamento direto à Árvore da Vida), método de cálculo Plum Blossom com leitura cruzada Cabala/Odu, integração em Mandala + `/daily` + `/oraculo`.
2. **Fase 2 — Expansão vegetativa do Grimório**: 4 "Odu de nascimento" (sub-classes: dia, lunar, Saturno, hora — híbrido entry curado + cálculo derivado), 20 ervas da tradição brasileira/afro-brasileira, 4 corpos clássicos para completar a Árvore esotérica.
3. **Fase 3 — Correlações enriquecidas**: o I-Ching entra como 5º hub no cross-engine (× Cabala, × Odu, × Astrologia, × Tarot) + adensamento dos cruzamentos pré-existentes nos 4 sistemas.

**Premissa operacional:** este spec **assume** que `v0.0.4` está **released** (com a Onda 4.8 ✅, a i18n EN do corpo dos 83 entries, o Toroide WebGL, o PWA full-install, o push opt-in LGPD e — opcionalmente — o esqueleto do I-Ching 5º sistema do `tasks.md §T10` do v0.0.4 já entregue). O que não for entregue no v0.0.4 vira **dívida explícita** registrada no `PROGRESS.md` antes do v0.0.5 começar (Fase 0).

**Tese mantida:** "Akasha vira enciclopédia viva" — rigor de curadoria (Doc 20) inegociável, i18n PT-BR + EN desde o nascimento dos novos entries, e o I-Ching **não entra como sistema paralelo**, mas como **5º caminho da Árvore** (mapeamento Cabala × I-Ching é a tese central do v0.0.5).

---

## Decisões de Alinhamento (16 — cristalizadas em sessão de grill)

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Natureza do v0.0.5 | (b) Novo escopo **depois** de v0.0.4 fechar (v0.0.4 segue ciclo normal até released) |
| 2 | Eixo central | (a) Conteúdo/profundidade |
| 3 | Foco dentro do eixo | (d) Combo balanceado (I-Ching + expansão vegetativa + correlações) |
| 4 | Cobertura I-Ching | (b) 16 hexagramas curados (8 trigramas-base + 8 derivados) |
| 5 | Critério editorial I-Ching | (c) **Cabala × Sefirot** — cada um dos 8 derivados escolhido porque ressoa com uma Sefirá |
| 6 | Curadoria/proveniência | (a) **Rigor total** (Doc 20 padrão único para os 44 novos entries) |
| 7 | Critério dos 4 Odus | (b) **Odu de nascimento** (dia, lunar, Saturno, hora) |
| 8 | Critério das 20 ervas | (a) Tradição brasileira/afro-brasileira (Pajelança, Candomblé, Umbanda, indígena) |
| 9 | Critério dos 4 corpos | (a) Completar sistema clássico (teosófico/essotérico) |
| 10 | Escopo das correlações | (c) I-Ching conectado a tudo **+** adensamento dos 4 sistemas |
| 11 | Pontos de contato UI | (c) **Mandala + diária + oráculo** (visibilidade total) |
| 12 | Cálculo do hexagrama natal | (d) **Híbrido Plum Blossom + leitura cruzada** Cabala/Odu |
| 13 | Fases do release | (a) **I-Ching → expansão → correlações** |
| 14 | i18n dos 44 entries | (a) **EN desde o início** (PT-BR + EN, padrão v0.0.4) |
| 15 | Critérios de "done" | (c) Quality gates + contábil + curadoria editorial |
| 16 | Natureza dos 4 "Odu de nascimento" | (c) **Híbrido**: entry curado (narrativa) + cálculo derivado (instância pessoal) |

---

## What Changes

- **I-Ching como 5º sistema oracular** — `packages/core-iching/` (novo, agnóstico), algoritmo Plum Blossom determinístico, 16 hexagramas curados, mapeamento Cabala × Sefirot, integração Mandala + `/daily` + `/oraculo`, hexagrama natal persistido em `User.ichingMap`, hexagrama do dia persistido em `DailyReading`, hexagrama sorteável em `Consultation`.
- **Expansão vegetativa do Grimório** — 4 "Odu de nascimento" (híbridos: entry + cálculo), 20 ervas brasileiras/afro-brasileiras, 4 corpos clássicos. Todos com rigor total (Doc 20) e i18n PT-BR + EN.
- **Correlações enriquecidas (Fase 3)** — I-Ching entra no cross-engine (× Cabala, × Odu, × Astrologia, × Tarot); adensamento das correlações pré-existentes nos 4 sistemas (mínimo 3–5 novas correlações por entry existente do Grimório).
- **Schema Prisma** — `User.ichingMap Json?`; `DailyReading.hexagram String?` + `DailyReading.hexagramLines Json?`; `Consultation.hexagram String?`; `User.ichingEnabled Boolean @default(false)` (opt-in para o oráculo sorteável).
- **Curadoria & governança** — `Doc 20` ganha o **teste-guardião da curadoria expandido** (auditoria automática de proveniência + lineage + i18n EN) cobrindo os 60 novos entries (16 hexagramas + 44 expansão). `IDEIA.md` (ledger) recebe entradas para todos os 60.
- **Documentação** — `Doc 14` (extensibilidade oracular) ✅, `Doc 15` (glossário) inclui os 16 hexagramas I-Ching, `Doc 25` (visão Akasha) marca 5º sistema completo, `Doc 08` (roadmap) Onda 6 ✅.

> **Não-removido:** este spec **não remove** nenhuma capability existente. O legado continua desligado, o monorepo segue em `apps/akasha-portal/`, e a Curadoria D4 do v0.0.4 (proveniência dos 16 Odus) é pré-requisito, não retrabalho.

---

## Impact

### Affected specs (`docs/`)

- `docs/04_data-model.md` — incluir `User.ichingMap` + campos correlatos; migration nova
- `docs/06_ai-engine-spec.md` — `PromptBuilder` (Doc 14 Passo 4) passa a extrair `ichingData` condicionalmente; roteador de temas (Passo 5) ganha pilar `iching`
- `docs/08_roadmap.md` — incluir **Onda 6 (v0.0.5)**; bumpar para v3.2 → v3.3
- `docs/14_extensibilidade-oracular.md` — marcar 5 pontos de extensão (AD-14.1–.5) como ✅; "I-Ching como 5º sistema" sai de "Fase 2+ (fora do MVP)" para "implementado"
- `docs/15_glossario-oracular.md` — bump v2.2 → v2.3; incluir **tabela de 16 hexagramas I-Ching** na §1 (8 trigramas-base + 8 Cabala × Sefirot), com `metadata.source` de cada `grimoire/iching/hex-*.md`
- `docs/19_qualidade-processos.md` — **AD-19.4 #4** (teste-guardião da curadoria) estendido para cobrir i18n EN (`## EN` section + `title_en`) e validação automática de proveniência para entries com `metadata.source`/`metadata.lineage` vazios
- `docs/20_governanca-conteudo-oracular.md` — `IDEIA.md` (ledger) atualizado com 60 novas entradas; AD-20.5 atualizado com a rubrica de proveniência I-Ching (fonte chinesa, lineage Taoísta/Confuciana)
- `docs/25_visao-akasha.md` — §0 (Visão Geral) atualizada: "9+ tradições" → "**10 tradições** (Cabala + Odu + Astrologia + Tarot + Orixá + **I-Ching** + …)"; diagrama da §11 mostra 5º hub

### Affected code

- **Schema/migration:** `prisma/schema.prisma` (novos campos), `prisma/migrations/<ts>_iching/`
- **Novo package:** `packages/core-iching/` (agnóstico, mesmo padrão de `core-{astrology,cabala,odus,tantra}`)
- **Portal B2C (em `apps/akasha-portal/src/`):**
  - `lib/akasha/iching/` — `plum-blossom.ts` (algoritmo), `natal-hexagram.ts`, `daily-hexagram.ts`, `oracle-hexagram.ts`, `correlator.ts` (cruzamento com Cabala/Odu)
  - `lib/mapa/iching-node.ts` — nó da Mandala
  - `lib/daily-engine/iching.ts` — hexagrama do dia
  - `lib/oracle/iching-draw.ts` — sorteio
  - `lib/correlation/` — adensamento de entradas existentes
  - `lib/grimoire/iching-sync.ts` — sincronização dos 16 entries I-Ching
  - `components/mandala/MandalaIchingNode.tsx` — 5º nó da Mandala
  - `components/oraculo/IchingReading.tsx` — UI do hexagrama sorteado
  - `app/api/akasha/iching/natal/route.ts` — GET/PUT do hexagrama natal
  - `app/api/akasha/iching/daily/route.ts` — GET do hexagrama do dia
  - `app/api/akasha/oraculo/iching/route.ts` — POST do sorteio
  - `messages/pt-BR.json` + `en.json` — chaves novas para UI do I-Ching
- **Grimório (novo diretório + entries):**
  - `grimoire/iching/hex-01-*.md` … `hex-16-*.md` (16 arquivos)
  - `grimoire/ancestral/odu-nascimento-{dia,lunar,saturno,hora}.md` (4 arquivos)
  - `grimoire/botanica/erva-053-*.md` … `erva-072-*.md` (20 arquivos)
  - `grimoire/vibracional/corpo-12-*.md` … `corpo-15-*.md` (4 arquivos)
- **Testes:** reorganizar / estender em `tests/lib/core-iching/`, `tests/api/akasha/iching/`, `tests/lib/grimoire/iching/`, `tests/lib/correlation/`, `tests/integration/iching-rag-fechado.test.ts`

---

## ADDED Requirements

### Requirement: 5º sistema I-Ching (Fase 1) — 16 hexagramas curados

O sistema SHALL entregar o I-Ching como **5º sistema oracular completo** do Akasha, com 16 hexagramas curados (8 trigramas-base + 8 derivados por mapeamento Cabala × Sefirot), método de cálculo Plum Blossom determinístico, e leitura cruzada com Cabala (Caminho de Vida) e Odu de nascimento. O I-Ching SHALL aparecer em **todos os pontos de contato** onde os 4 sistemas existentes aparecem: Mandala, `/daily`, `/oraculo`. (Decisões 3, 4, 5, 11, 12)

#### Scenario: Hexagrama natal persistido no onboarding
- **WHEN** o usuário conclui o onboarding com `birthDate` + `birthTime` válidos
- **THEN** o sistema calcula o hexagrama natal via Plum Blossom (upper trigram ← ano+mês, lower trigram ← dia+hora)
- **AND** o resultado é persistido em `User.ichingMap` (Json: `{ hexagramNumber, trigrams, lines, lifePathResonance, oduResonance }`)
- **AND** o hexagrama aparece na Mandala como **5º nó** ao lado dos 4 sistemas existentes

#### Scenario: Hexagrama do dia na leitura diária
- **WHEN** o cronjob `cabala-transits.service` gera `daily_readings` para a data atual
- **THEN** cada `DailyReading.hexagram` é calculado com Plum Blossom usando a data atual (e persiste em `hexagramLines` a estrutura binária)
- **AND** a `/daily` exibe o hexagrama do dia ao lado do orbe solar, Odu do dia, anjo do dia, etc.

#### Scenario: Hexagrama sorteável no oráculo
- **WHEN** o consulente com `ichingEnabled = true` faz uma consulta oracular e seleciona "I-Ching"
- **THEN** o sistema sorteia 1 dos 16 hexagramas curados (com peso uniforme) ou 1 dos 64 do canon (com peso maior para os 16)
- **AND** retorna o hexagrama com a leitura cruzada Cabala (Sefirá ecoada) + Odu (Odu de nascimento ecoado)

#### Scenario: 16 hexagramas curados no Grimório
- **WHEN** o operador executa `npm run grimoire:sync`
- **THEN** os 16 arquivos `grimoire/iching/hex-*.md` são indexados em `GrimoireEntry` (com `metadata.source`, `metadata.lineage`, `## EN` section, `title_en`)
- **AND** `tests/lib/grimoire/iching-completeness.test.ts` passa (16/16 com proveniência + i18n)

#### Scenario: Mapeamento Cabala × Sefirot
- **WHEN** o hexagrama natal é calculado
- **THEN** o `ichingMap.cabalResonance` indica qual Sefirá ressoa com o hexagrama (mapeamento curado dos 8 derivados: 1 hexagrama por Sefirá superior; 8 trigramas-base mantêm ressoância triádica)
- **AND** a Mandala desenha uma **linha de ressonância** entre o nó do I-Ching e a Sefirá correspondente

---

### Requirement: `packages/core-iching` agnóstico (Fase 1)

O sistema SHALL implementar `packages/core-iching/` seguindo o padrão dos demais `core-*` (astrology, cabala, odus, tantra, types), com funções determinísticas puras, sem dependências de UI ou Next.js, retornando tipos do `packages/types`. Cobertura mínima: 100% das funções públicas testadas com casos conhecidos (trigramas, hexagramas derivados, edge cases de horário de nascimento). (Decisão 12)

#### Scenario: Plum Blossom puro
- **WHEN** o `buildIchingMap({ birthDate: '1990-05-15', birthTime: '14:30', ... })` é chamado
- **THEN** retorna `{ hexagramNumber: number, trigrams: [upper, lower], lines: number[6], derivedAt: ISO }` determinístico
- **AND** o mesmo input sempre produz o mesmo output (sem randomness, sem LLM)
- **AND** ≥ 30 testes unitários cobrem: 8 trigramas-base, 8 derivados Sefirot, casos de borda (00:00, 23:59, fuso, horário de verão)

#### Scenario: Compatibilidade com `packages/types`
- **WHEN** o `core-iching` importa tipos
- **THEN** importa de `@cabala/types` (workspace), nunca de `apps/akasha-portal/`
- **AND** nenhum import de `next/*`, `react/*` ou `@/lib/akasha/*` aparece em `packages/core-iching/src/`

---

### Requirement: Schema `User.ichingMap` + correlatos (Fase 1)

O sistema SHALL estender o schema Prisma com:
- `User.ichingMap Json?` — hexagrama natal persistido `{ hexagramNumber, trigrams, lines, cabalResonance, oduResonance, derivedAt }`
- `User.ichingEnabled Boolean @default(false)` — opt-in para sorteio no oráculo
- `DailyReading.hexagram String?` — hexagrama do dia
- `DailyReading.hexagramLines Json?` — estrutura binária (6 linhas)
- `Consultation.hexagram String?` — hexagrama sorteado (se aplicável)

Migration nova: `prisma/migrations/<ts>_iching/`.

#### Scenario: Migration limpa
- **WHEN** o desenvolvedor roda `npx prisma migrate dev --name iching`
- **THEN** a migration aplica sem erros
- **AND** `npx prisma validate` retorna OK
- **AND** `npx prisma generate` regenera o client com os novos tipos

#### Scenario: Backfill de usuários existentes
- **WHEN** a migration aplica em produção
- **THEN** todos os `User` existentes recebem `ichingEnabled = false` (default)
- **AND** o `ichingMap` permanece `null` (preenchido lazily no primeiro acesso ao hexagrama natal)

---

### Requirement: 4 "Odu de nascimento" — híbrido entry + cálculo (Fase 2)

O sistema SHALL entregar 4 "Odu de nascimento" como sub-classes para leitura natal: **Odu do dia, Odu lunar, Odu de Saturno, Odu da hora**. Cada um SHALL ter (a) **entry curado** em `grimoire/ancestral/odu-nascimento-*.md` com proveniência + lineage + narrativa + i18n, e (b) **função de cálculo** em `packages/core-odus/` que retorna o Odu canônico (1 dos 16) correspondente aos dados natais. (Decisões 7, 16)

#### Scenario: Entry curado
- **WHEN** o operador consulta `grimoire/ancestral/odu-nascimento-dia.md`
- **THEN** o frontmatter tem `metadata.source` (livro/autor/edição), `metadata.lineage` ("Yorubá/Ifá/Candomblé"), `title_en`
- **AND** o corpo tem seção `## EN` traduzida
- **AND** o `tests/grimoire/odus-nascimento-validation.test.ts` passa

#### Scenario: Cálculo determinístico
- **WHEN** o `buildOduNascimento({ birthDate, birthTime, ... })` é chamado
- **THEN** retorna `{ dia: 'Ogundá', lunar: 'Okana', saturno: 'Ejioko', hora: 'Iwori' }` com base em regras curadas (dia da semana, fase lunar, posição de Saturno na roda, hora)
- **AND** o mesmo input sempre produz o mesmo output
- **AND** cada valor retornado é um dos 16 Odus canônicos (validado por teste)

#### Scenario: Exibição na Mandala
- **WHEN** o consulente acessa a Mandala
- **THEN** o nó "Odu" mostra os 4 Odu de nascimento em sub-camadas (dia, lunar, Saturno, hora)
- **AND** cada sub-camada tem link para o entry curado correspondente no Grimório

---

### Requirement: 20 ervas brasileiras/afro-brasileiras (Fase 2)

O sistema SHALL curar 20 novas ervas no Grimório seguindo o critério **tradição brasileira/afro-brasileira** (Pajelança, Candomblé, Umbanda, medicina indígena brasileira). Cada erva SHALL ter: frontmatter YAML com `metadata.source` + `metadata.lineage` + `title_en`; corpo em PT-BR; seção `## EN` traduzida; cobertura de proveniência no `IDEIA.md` (ledger). (Decisões 6, 8, 14)

#### Scenario: Cobertura completa
- **WHEN** o `tests/lib/grimoire/herbs-validation.test.ts` executa
- **THEN** ≥ 70 arquivos `grimoire/botanica/erva-*.md` existem (52 atuais + 20 novos)
- **AND** os 20 novos têm `metadata.source` não-vazio, `metadata.lineage` não-vazio, `title_en` não-vazio
- **AND** a seção `## EN` está presente em todos os 20

#### Scenario: Proveniência no `IDEIA.md`
- **WHEN** o operador consulta `IDEIA.md` (ledger, Doc 20 AD-20.5)
- **THEN** há 20 entradas novas correspondentes aos 20 novos ervas, com `source` (livro/autor/página) e `lineage` (tradição)
- **AND** cada entrada tem referência cruzada ao arquivo `grimoire/botanica/erva-*.md`

---

### Requirement: 4 corpos clássicos (completar Árvore) (Fase 2)

O sistema SHALL adicionar 4 corpos vibracionais para **completar a Árvore clássica esotérica** (teosófica/essotérica ocidental). Cada corpo SHALL ter: frontmatter com proveniência (livros clássicos de Leadbeater, Powell, Besant, ou similar — Doc 20), lineage ("Esotérico ocidental" ou "Teosófico"), `title_en`; corpo em PT-BR; seção `## EN` traduzida. (Decisões 6, 9, 14)

#### Scenario: Cobertura completa
- **WHEN** o `tests/lib/grimoire/bodies-validation.test.ts` executa
- **THEN** ≥ 15 arquivos `grimoire/vibracional/corpo-*.md` existem (11 atuais + 4 novos)
- **AND** os 4 novos têm `metadata.source`, `metadata.lineage`, `title_en`, seção `## EN`

#### Scenario: Numeração canônica
- **WHEN** o sistema ordena os corpos por sua posição na Árvore
- **THEN** a sequência de 15 corpos (11 + 4) reflete a taxonomia canônica esotérica (do mais denso ao mais sutil, ou inverso)
- **AND** o `Doc 15 §Vibracional` (se aplicável) ou `IDEIA.md` lista a Árvore completa

---

### Requirement: i18n EN desde o início (60 novos entries)

Todos os **60 novos entries** (16 hexagramas + 4 Odu de nascimento + 20 ervas + 4 corpos + 16 derivações complementares de Sefirot no `correlator.ts` documentadas) SHALL nascer com **seção `## EN`** válida e `title_en` no frontmatter, seguindo o mesmo padrão do v0.0.4. (Decisão 14)

#### Scenario: Auditoria de cobertura
- **WHEN** o `tests/i18n/grimoire-completeness-v0.0.5.test.ts` executa
- **THEN** ≥ 143 arquivos do Grimório (83 atuais + 60 novos) têm seção `## EN` não-vazia
- **AND** `title_en` está presente em todos os 143

---

### Requirement: I-Ching conectado a todos os 4 sistemas (Fase 3)

O sistema SHALL implementar correlações **I-Ching × Cabala**, **I-Ching × Odu**, **I-Ching × Astrologia** e **I-Ching × Tarot** no `lib/correlation/`, com 8 entradas canônicas (uma por Sefirá mapeada) + correspondências com os 16 Odus + 12 signos + 22 Arcanos Maiores. (Decisão 10)

#### Scenario: Cross-engine I-Ching
- **WHEN** o `crossEngine({ user, system: 'iching' })` é chamado
- **THEN** retorna objeto com `cabala: Sefira`, `odu: OduCanônico`, `astrologia: Signo | Planeta`, `tarot: Arcano`
- **AND** o cross-engine respeita a navegação horária do sistema (não mistura tradições incompativeis)
- **AND** ≥ 30 testes unitários cobrem as combinações canônicas (8 Sefirot × I-Ching, 16 Odus × I-Ching, 12 signos × I-Ching, 22 Arcanos × I-Ching)

#### Scenario: `PromptBuilder` extrai I-Ching
- **WHEN** o `PromptBuilder.build()` é invocado com `user.ichingMap` preenchido
- **THEN** o bloco `ichingData` é adicionado ao prompt do LLM com proveniência (Doc 20 AD-20.3) — `fonte: grimoire/iching/hex-NN-*.md`
- **AND** o bloco é omitido se `ichingMap` é null (compatibilidade com usuários antigos)

---

### Requirement: Adensamento de correlações nos 4 sistemas (Fase 3)

O sistema SHALL adensar as correlações pré-existentes nos 4 sistemas (Cabala, Odu, Astrologia, Tarot) — mínimo **3–5 novas correlações por entry existente do Grimório** (52 ervas + 16 Odus + 11 corpos + 4 diagnósticos = 83 entries), totalizando ≥ 250–415 novas correlações. (Decisão 10)

#### Scenario: Densidade medida
- **WHEN** o `tests/lib/correlation/density.test.ts` executa
- **THEN** a média de correlações por entry do Grimório é ≥ 6 (antes era 3, segundo Doc 14 §3)
- **AND** ≥ 80% dos entries têm pelo menos 5 correlações

#### Scenario: Curadoria das novas correlações
- **WHEN** o operador consulta `lib/correlation/` (motores)
- **THEN** cada nova correlação tem `provenance` (qual entry a originou) e `tradition` (qual sistema)
- **AND** correlações frouxas ou inventadas são proibidas (Doc 20 §3)

---

### Requirement: Teste-guardião da curadoria expandido (Doc 19 AD-19.4 #4)

O sistema SHALL estender o **teste-guardião da curadoria** (Doc 19 AD-19.4 #4) para cobrir: (a) `metadata.source` + `metadata.lineage` não-vazios; (b) `title_en` + seção `## EN`; (c) referência cruzada com `IDEIA.md` (ledger); (d) frontmatter YAML parseável. Aplica-se a todos os 143+ entries do Grimório. (Decisão 15)

#### Scenario: Falha clara
- **WHEN** um novo entry é adicionado sem `metadata.lineage`
- **THEN** `tests/lib/grimoire/curatorship-guardian.test.ts` falha com mensagem explícita: `"erva-073-novo.md: metadata.lineage ausente (Doc 20 AD-20.2)"`
- **AND** o CI bloqueia o merge

#### Scenario: Relatório de auditoria
- **WHEN** o `npm run grimoire:audit` é executado
- **THEN** gera relatório em `logs/grimoire-audit-<date>.md` com tabela: `entry | source | lineage | title_en | ## EN | ledger_ref | status`
- **AND** entries com status ❌ são listados com a regra violada

---

## MODIFIED Requirements

### Requirement: `Doc 08` (Roadmap) — incluir Onda 6

**`Doc 08`** SHALL ser bumparado para v3.3 e SHALL incluir a **Onda 6 (v0.0.5 — Conteúdo & Profundidade)** com as 3 fases (I-Ching 5º sistema, Expansão Vegetativa, Correlações Enriquecidas), critérios de sucesso (≥ 8500 testes passando, 60 entries curados, 16 hexagramas integrados), e referência ao critério de "done" expandido (Q15).

### Requirement: `Doc 14` (Extensibilidade Oracular) — marcar I-Ching como ✅

**`Doc 14`** SHALL marcar os 5 pontos de extensão (AD-14.1 campo `User.ichingMap`; AD-14.2 `packages/core-iching`; AD-14.3 bloco `CorrelationEntry.iching`; AD-14.4 extração no `PromptBuilder`; AD-14.5 roteador de temas) como **✅** e SHALL mover "I-Ching como 5º sistema" de "Fase 2+ (fora do MVP)" para "**Implementado no v0.0.5**".

### Requirement: `Doc 15` (Glossário) — incluir 16 hexagramas

**`Doc 15 §1`** SHALL ser bumparado para v2.3 e SHALL incluir **tabela de 16 hexagramas I-Ching** (8 trigramas-base: Qian, Kun, Zhen, Xun, Kan, Li, Gen, Dui; 8 Cabala × Sefirot: a definir na Fase 1 conforme mapeamento curado), com referência ao `metadata.source` de cada `grimoire/iching/hex-*.md`.

### Requirement: `Doc 19` (Qualidade) — AD-19.4 #4 expandido

**`Doc 19 AD-19.4 #4`** SHALL ser estendido para cobrir: (a) proveniência (`source` + `lineage`); (b) i18n EN (`title_en` + `## EN`); (c) referência cruzada com `IDEIA.md` (ledger); (d) frontmatter YAML parseável. Aplicação: 100% dos 143+ entries.

### Requirement: `Doc 20` (Governança) — rubrica I-Ching

**`Doc 20 AD-20.5`** SHALL incluir a **rubrica de proveniência I-Ching**: `source` (livro clássico: I Ching — Wilhelm/Baynes, I Ching — Legge, ou similar — Doc 14), `lineage` ("Taoísta/Confuciana" ou "I-Ching clássico"), `tradition` ("5º sistema oracular"). `IDEIA.md` (ledger) SHALL ser atualizado com 60 novas entradas (16 I-Ching + 4 Odu de nascimento + 20 ervas + 4 corpos + 16 derivações Sefirot documentadas).

### Requirement: `Doc 25` (Visão Akasha) — 10 tradições

**`Doc 25 §0`** SHALL atualizar a lista de "9+ tradições" para "**10 tradições** (Cabala + Odu Ifá + Astrologia Ocidental + Tarot + Orixás + Chakras + I-Ching + Geometria Sagrada + Frequências Solfeggio + Ervas/Saberes tradicionais)". §11 (diagrama) SHALL mostrar o **5º hub** (I-Ching) conectado aos 4 sistemas.

---

## REMOVED Requirements

_Nenhum requisito removido._ O v0.0.5 é aditivo puro: o legado segue desligado, o monorepo segue em `apps/akasha-portal/`, e a Curadoria D4 do v0.0.4 é pré-requisito (não retrabalho).

---

## Ordem de Execução (dependências internas)

```
Fase 0 — PRÉ-REQUISITO (verificar, não executar)
  - v0.0.4 RELEASED (commit + tag + PROGRESS.md atualizado)
  - Dívida explícita do v0.0.4 registrada em PROGRESS.md §3.3
  - 8113+ testes passando
  - 9 modelos B2C canônicos + schema valid
  - Doc 15 §1 sem ⚠️ PROVISIONAL (D4)

Fase 1 — I-CHING (5º SISTEMA)  [HEADLINE]
  T1. packages/core-iching (agnóstico)
  T2. Algoritmo Plum Blossom + 16 hexagramas curados
  T3. Schema: User.ichingMap, DailyReading.hexagram, Consultation.hexagram
  T4. Migration iching
  T5. 16 entries grimoire/iching/ (PT-BR + EN, Doc 20)
  T6. Integração Mandala (5º nó)
  T7. Integração /daily (hexagrama do dia via cronjob)
  T8. Integração /oraculo (hexagrama sorteável, opt-in)
  T9. Teste-guardião da curadoria I-Ching
  T10. Quality gates Fase 1

Fase 2 — EXPANSÃO VEGETATIVA
  T11. 4 Odu de nascimento (entry + cálculo)
  T12. 20 ervas brasileiras/afro-brasileiras
  T13. 4 corpos clássicos (completar Árvore)
  T14. Exibição dos Odu de nascimento na Mandala/daily
  T15. Atualização IDEIA.md (60 novas entradas)
  T16. Teste-guardião da curadoria (expansão)
  T17. Quality gates Fase 2

Fase 3 — CORRELAÇÕES ENRIQUECIDAS
  T18. I-Ching × Cabala (8 Sefirot)
  T19. I-Ching × Odu (16 + 4 de nascimento)
  T20. I-Ching × Astrologia (12 signos + 10 planetas)
  T21. I-Ching × Tarot (22 Arcanos Maiores)
  T22. Adensamento de correlações nos 4 sistemas (≥ 3–5 novas por entry)
  T23. Atualização Doc 14 (5 pontos ✅), Doc 15 (tabela 16 hexagramas), Doc 25 (10 tradições)
  T24. Quality gates finais + release
```

> **Caminho crítico:** T1 → T2 → T5 → T6 → T10 → T11 → T15 → T18 → T24. T3/T4 (schema) podem rodar em paralelo com T1/T2. T7/T8 (UI) podem rodar após T5. T19/T20/T21 (correlações específicas) podem rodar em paralelo entre si na Fase 3.
>
> **Premissa absoluta:** T0 (v0.0.4 released) é gate de entrada. Se v0.0.4 não estiver released, o v0.0.5 não começa. Dívida explícita é registrada em `PROGRESS.md §3.3` antes do gate ser destravado.

---

## Premissas, Riscos e Trade-offs

### Premissas

1. v0.0.4 fecha antes do v0.0.5 começar (Fase 0 é gate de entrada).
2. Os 16 hexagramas curados cabem em ~8 Sefirot disponíveis (10 Sefirot; 2 reservadas para Kether/Chokmah como "trono" dos trigramas-base).
3. A curadoria I-Ching tem fonte chinesa reconhecida (Wilhelm/Baynes ou Legge) com proveniência verificável.
4. O algoritmo Plum Blossom é determinístico e reproduzível (sem dependência de LLM).
5. O cross-engine (Fase 3) não conflita com o `correlation-engine.ts` existente; é estritamente aditivo.

### Riscos

| Risco | Mitigação |
|-------|-----------|
| Curadoria I-Ching viesa (interpretação Wilhelm não é a única) | **Múltiplas fontes** no `metadata.source`; rubric explícita no `Doc 20 AD-20.5` |
| Scope creep (60 entries + 16 hexagramas + correlações) | **Gate de saída** em cada fase (qualidade); **dívida explícita** se algo não fechar |
| Plum Blossom em fusos horários de borda | Testes com casos de borda (00:00, 23:59, horário de verão, GMT-12, GMT+14) |
| I-Ching vira "sistema paralelo" e não se integra | **Teste de cross-reading**: se `ichingData` não aparecer no prompt, T24 falha |
| i18n EN das 60 entries vira gargalo | **Tradução assistida por IA + revisão editorial** (Q6: curadoria editorial, não IA solta) |
| Conflito com Curadoria D4 do v0.0.4 (16 Odus sem proveniência) | Fase 0 trava — D4 ✅ é pré-requisito |

### Trade-offs Aceitos

- **+60 entries** com rigor total = ~6–9 meses de trabalho (Fases 1–3) — é a aposta "enciclopédia viva".
- **Plum Blossom canônico** vs. método Akasha proprietário (Q12) — abrimos mão da "reinvenção proprietária" em favor do rigor tradicional.
- **Fases sequenciais** (I-Ching → expansão → correlações) — o headline sai primeiro, mas o release completo demora mais.
- **i18n EN desde o início** — ~30% de trabalho extra por entry, mas zera o passivo de i18n (Q14).
- **Curadoria editorial** (Q15) — mais lento que "passa/não passa", mas mantém a tese de "enciclopédia curada".

---

## Anexos

- **Decisões de alinhamento (16):** ver tabela no início deste spec.
- **Tasks detalhadas:** ver `tasks.md`.
- **Quality gates e checklist:** ver `checklist.md`.
- **Dívida explícita do v0.0.4:** a ser registrada em `PROGRESS.md §3.3` antes do v0.0.5 começar (Fase 0).
