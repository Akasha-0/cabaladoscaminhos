# Contexto do Projeto

O mapa canonico do repositorio agora vive em `docs/00_README.md`.

- Indice mestre: `docs/00_README.md`
- Visao do produto: `docs/25_visao-akasha.md`
- Arquitetura tecnica: `docs/03_architecture-spec.md`
- Pesquisa consolidada em docs: `docs/pesquisa/README.md`
- Trilha research-first: `.autonomous/VISION.md` e `.autonomous/app_spec.txt`

---

## Glossario de Termos Canonicos

### Mandala Akáshica

A Mandala e o artefato central da experiencia Akasha — uma visualizacao SVG dos 5 Pilares da existencia, onde cada camada representa um sistema oracular. O usuario interage com a Mandala para explorar seu perfil nos 5 sistemas (Odus, Cabala, Tantra, Astrologia, I Ching).

### 5 Pilares (Camadas da Mandala)

| Pilar | Camada SVG | Dominio | Descricao |
|-------|-----------|---------|-----------|
| Pilar 1 | Cabala | Numerologia Cabalistica | Arvore da Vida, Sefirot, Numeros de vida |
| Pilar 2 | Astrologia | Mapa Natal | Signos, planetas, aspectos |
| Pilar 3 | Tantra | Corpos Energeticos | 11 corpos, chakras, Alma/Karma/Destino |
| Pilar 4 | Odus | Ifa/Candomble | Odu de nascimento, Orixa, Preceitos |
| Pilar 5 | I Ching | Oraculo Chines | Hexagrama, trigramas |

### KabalisticMap

O mapa cabalistico e gerado por `buildKabalisticMap()` em `@akasha/core-cabala`. Contem os numeros de vida (Life Path, Expression, Motivation, Mission, Impression) e meta-informacoes cabalisticas (sefira regente, letra hebraica, taro regente).

Campos exportados para a Mandala (Nivel 3):
- Life Path, Expression, Motivation, Mission, Impression
- Sefira Regente, Letra Hebraica, Taro Regente
- 4 Desafios (first, second, main, last)
- 4 Pinalculos (first, second, third, fourth)
- 3 Ciclos de Vida (first, second, third)

### Sefira / Sefirot

As 10 emocoes da Arvore da Vida Cabalistica. Cada Sefira tem: nome, nome divino, cor, anjo regente, qualidade, essencia, letra hebraica, elemento. Mapeadas por numero de Life Path em `SEFIROT_PATHS`.

### ONE Akasha Profile

Sistema de 9 tipos de personalidade derivado da correlacao dos 5 pilares (inspirado em Human Design + Gene Keys). Gerado por `synthesis-engine.ts` + `narrative-generator.ts` (template-based, sem LLM). Mostra: tipo, estrategia, autoridade, diretiva diaria, area de crescimento, armadilha de sombra.

### TantricMap

O mapa tantrico e gerado por `buildTantricMap()` em `@akasha/core-tantra`. Contem Alma, Karma, Dom Divino, Destino, Caminho Tantrico e os 5 corpos numerologicos (fisico, pranico, emocional, mental, espiritual) derivados da data de nascimento. Todos os 11 corpos sao ativos (nao ha logica de atividade/inatividade implementada).

### AstrologyMap

O mapa astrologico e gerado por `getBirthChart()` em `@akasha/core-astrology`. Contem signo ascendente, Meio do Ceu, planeta dominante, posicoes dos 10 planetas e aspectos. Para a Mandala, expomos: ascendente, meio do ceu, planeta dominante, 10 planetas nos signos e 5 aspectos principais.

### OduBirth

O Odu de nascimento e o sistema oracular de Ifa/Candomble. Cada Odu tem: nome, orixa regente, elemento, preceitos, quizilas. O modelo existe em `@akasha/core-odux`.

### Fluxo de Dados da Mandala

```
mandala/page.tsx (Server)
  └─> /api/akasha/mandala/route.ts
       └─> buildKabalisticMap()   [core-cabala]
       └─> getBirthChart()        [core-astrology]
       └─> buildTantricMap()      [core-tantra]
       └─> getBirthOdu()          [core-odux]
       └─> computeBirthHexagram() [core-iching]
       Retorna: MandalaData (formato simplificado)
  └─> MandalaChart.tsx (Client)
       ├─> SVG de 5 camadas concéntricas
       └─> InfoPanels interativos (resumo + expandido)
  └─> MandalaNarrativeLoader
       └─> /api/akasha/daily/route.ts
            └─> buildDailyContent()
                 └─> synthesis-engine.ts (template-based)
```

### Levels de Profundidade por Pilar

| Pilar | Nivel | Conteudo |
|-------|-------|----------|
| Cabala | 3 | Life Path, Expression, Motivation, Mission, Impression + Sefira, Letra, Taro + Desafios (4) + Pinalculos (4) + Ciclos (3) |
| Astrologia | Planetas+Aspectos | 10 planetas nos signos + 5 aspectos principais + anel zodiacal expandido |
| Tantra | 3 | Alma/Karma/Dom/Destino + significado dos 5 corpos numerologicos |
| Odus | 2 | Odu + Orixa + Elemento + Preceitos + Quizilas + Mythos/Archetype |
| I Ching | 1 | Hexagrama + Trigramas + Linhas |

### Hierarquia de InfoPanel

Cada camada tem dois niveis de detalhe:
- **Resumo** (ao clicar): 4-6 campos principais
- **Expandido** (botao "Ver mais"): Todos os campos do nivel

### Design Visual

Estilo **Elegante/Mistico**: fundo escuro, paleta dourado + cobre, tipografia serifada para titulos, animacoes suaves. Centro da Mandala pulsa com energia do Odu. Animacao de entrada: a Mandala desenha a si mesma ao carregar.

### Implementacao em Fasess

| Fase | Escopo | Dependencias |
|------|--------|-------------|
| 1 | API route: expor todos campos KabalisticMap (Nivel 3) + 10 planetas + aspectos | Nenhuma |
| 2 | MandalaChart: InfoPanels com dois niveis (resumo + expandido) | Fase 1 |
| 3 | SVG Layer 4: anel zodiacal expandido com 10 planetas | Fase 1, 2 |
| 4 | Campos Tantricos: significados reais dos 5 corpos numerologicos | Fase 1 |
| 5 | Orientacao pratica: Mandato + Ritual + Dashboard de energia | Fase 1, 2 |
| 6 | Animacao de entrada + centro respirante | Fase 2 |

---

## Wave Status Log

Historico de decisoes tomadas em sessoes de grill. Cada Wave marca um
marcador duravel: o que foi entregue, o que ficou pendente, e o que
foi decidido para a proxima Wave. Esta secao NAO substitui os
`.hermes/plans/wave-N-plan-actual-*.md` files — esses sao fonte de verdade.
Aqui fica apenas o resumo executivo.

### Wave 7 — fechada 2026-06-24

**Escopo:** 3 fronts paralelos (A=Engine improvements, B=Hardening docs,
C=Hygiene typecheck). 11 cards totais.

**Entregue:** 16 commits merged em `main @ 6ce508bd`. Typecheck 42 → 0.
Tratamento tests 9 → 18. 3 ADRs/legais criados (ADR 0006 MCP, Advogado PI
checklist, LGPD audit). 1 bug de producao corrigido (`ewe-database.ts`
tipo `neutro`).

**Pendencias nao-bloqueantes (Wave 8 follow-up):**
- 62 test failures pre-existentes (Layer2Kabala/Layer4Astrology testes
  desatualizados apos `f45ac426`; auth-jwt fixtures quebrados; prisma
  tests; MandalaInfoPanels; credit-reconciliation)
- LGPD/DPA blockers de producao (DPA Anthropic pendente; DELETE /profile
  com cascata faltando; conexoes sem disclaimer de terceiros)
- ADR 0006 MCP e so types — server real nao implementado
- Brief Advogado PI pronto em `docs/legal/PROTOCOLO_REVISAO_JURIDICA.md`
  (R$ 2-5k, ~5-10h, aguardar contratacao)

### Wave 8 — decidida 2026-06-24 (grill sessao)

**Escopo decidido (root decision):** Fix 62 test failures + LGPD/DPA
blockers tecnicos + MCP server skeleton implementation. 3 fronts paralelos.

**Decomposicao decidida (questao 2 do grill):**
- Wave 8.1 = Front C-a (~30 min): test fixtures quebrados por mudancas
  recentes, especialmente Layer2Kabala/Layer4Astrology apos `f45ac426`.
  Esperado fechar ~30 dos 62 errors. Blocking para Wave 8.2.
- Wave 8.2 = Front C-b (~60 min): investigar e consertar os 32 errors
  restantes. Pode revelar erros arquiteturais (Wave 9 follow-up).

**Pendencias para resolver no grill Wave 8 (questoes restantes):**
- Q3 (em aberto): decompor Front A (LGPD/DPA) e Front B (MCP server)

**Q3 (2026-06-24, confirmada):**
- Wave 8.3 = Front A (3 sub-tarefas tecnicas LGPD/DPA) ~60 min single subagente
- A.1 = DELETE /profile com cascata (User + Caminhante + Caminhada + Sessao +
  MapaCalculo + GrimorioPessoal + MapaRelacional) — LGPD Art. 18
- A.2 = docs/legal/DPA_ANTHROPIC.md template + checklist Art. 33
  (transferencia internacional) + auditoria rotas LLM
- A.3 = disclaimer de terceiros em feature Conexoes + verificacao
  consent flow (signup → first Caminhante → first Sessao)
- Subagente DEVE cobrir A.1 com testes (cascade + dry-run + audit log)

**Q4 (2026-06-24, confirmada):**
- Wave 8.4 = Front B (MCP server skeleton + Mentor route integration) ~60 min
- B.1 = packages/mcp/src/server.ts runtime types (AkashaMcpServer class com
  start() lazy, in-process, sem transporte real ainda)
- B.2 = apps/akasha-portal/src/app/api/mentor/ask/route.ts lazy import
  @akasha/mcp + graceful degradation (registry vazio → cai pra LLM direto)
- B.2 inclui 1 teste novo cobrindo "registry empty → fallback direct LLM"
- MCP server permanece STUB (sem stdio/http transport, sem multi-tenant
  context, sem tools reais) — esses sao Wave 9+ quando tools concretas
  forem registradas

**Q4 + P0-1 fix (2026-06-24):**
- 3 reviewers paralelos: schema/DB, code/security, ADR/alignment
- Schema/DB: 0 P0, 3 P1, 3 P2 — READY FOR MERGE
- Code/Security: 1 P0 (consent audit gap em /conexoes), 4 P1, 3 P2
- ADR/Alignment: 0 P0, 0 P1, 3 P2 — READY FOR MERGE (95% spec compliance)
- P0-1 fix aplicado: apps/akasha-portal/src/app/api/akasha/conexoes/route.ts
  chama auditLog('conexao_third_party_consent_declarado') após
  prisma.connection.create. Fecha gap LGPD Art. 37 entre UI disclaimer
  e audit trail técnico.

### Wave 8 — done 2026-06-24

**Entregue:** 18 commits merged em `main @ 52422941` (4 sub-waves + 3 reviewers + P0-1 fix).

**Resultado Wave 8:**
- Typecheck errors: 0 (era 0 pós-Wave-7, mas estabilizou)
- i18n parity: PARITY OK
- Tratamento tests: 18/18 passing
- Total test failures: 62 → 17 (-45, 73% redução)
  - Wave 8.1: 62 → 29 (-33, test fixtures TooltipKey migration)
  - Wave 8.2: 29 → 17 (-12, akasha-jwt +11 + middleware-auth +1)
- LGPD/DPA: DELETE /profile (Art. 18), DPA Anthropic template (Art. 33),
  Conexoes disclaimer + audit log (Art. 37) — todos cobertos com testes
- MCP server skeleton: AkashaMcpServer stub + Mentor route integration
  (ADR 0006). Stub permanece; transporte real em Wave 9+.

**Documentos novos Wave 8:**
- docs/legal/DPA_ANTHROPIC.md (14 cláusulas + checklist + auditoria rotas LLM)
- apps/akasha-portal/src/lib/infrastructure/audit-log.ts (stub JSON-lines)
- apps/akasha-portal/src/app/api/akasha/profile/[id]/route.ts (DELETE)
- packages/mcp/src/server.ts (AkashaMcpServer)
- .hermes/plans/2026-06-24_113000-wave-8-implementation.md (spec)
- .hermes/plans/review-{schema,security,adr}-wave8-2026-06-24.md (3 reviews)

**Pendencias para Wave 9:**
- 17 test failures pre-existentes (prisma.test.ts 3, iching 2, calculators 3,
  credit-reconciliation 4, package-boundaries 1, search 1, traducao-areas 1,
  daily-transits-cron 1, DOX AGENTS.md 'test file' bug 1)
- 6 P1/P2 do schema reviewer (ChatMessage count, double-count chain, snapshot
  pós-delete, audit-log prisma sink, test unitário audit-log, indices Pilar6)
- 4 P1 do security reviewer (DELETE rate limit, CSRF, audit log DB sink,
  cascade counts)
- 3 P2 ADR reviewer (docs/adrs/README.md legado, root AGENTS.md changelog,
  packages/mcp AGENTS.md ausente)
- MCP server stub → real transport (stdio/http) + tool registration
- Advogado PI humano precisa revisar e assinar DPA Anthropic (R$ 2-5k)
- Bitwarden credential storage setup (anotado na memoria)

### Wave 9 — entregue 2026-06-24

**Escopo:** polish + arquitetura avançada. 4 sub-waves sequenciais:

- **Wave 9.1 — One-Screen Hub** (commit `f3084cf1`, merge `c496dd2e`).
  `/meu-dia` redesenhado: enum de 4 estados emocionais
  (`centrado | ansioso | perdido | curioso`) persistido em
  localStorage + cookie `akasha_state`. StatePicker (1-click,
  role=radiogroup, 80×80 tiles) + AdaptiveContent dispatcher
  + 4 views especializadas (BreathOrb 4-7-8 para ansioso,
  mini-mandala + 3 practice cards para perdido, 5 Pilar cards
  para curioso, full synthesis para centrado). Mentor CTAs
  já passam `?intencao=<state>` para Wave 9.3 consumir.
  43 testes (StatePicker + AdaptiveContent + BreathOrb + views).
- **Wave 9.3 — Emotion + MCP tool dispatch** (4 commits,
  merge `443dab27`):
  - `packages/mcp/`: registra 5 akasha tools (synthesis.generate,
    iching.cast, odu.lookup, ritual.recommend, authority.derive)
    + `callTool` API.
  - `packages/mentor/`: emotion-aware intent detector (`ansioso`,
    `perdido`, `curioso`, `centrado`) + tool dispatcher que
    roteia intent → tool call → result injection no prompt.
  - `apps/akasha-portal/src/app/api/mentor/ask/route.ts`: wire
    `emotionalState` + tool results no stream de resposta.
  - `packages/mcp/README.md` expandido com full rewrite.
- **Wave 8.4 B.3 — `/api/mcp` HTTP route** (commit `7e9ed377`):
  fecha o gap de transporte HTTP do MCP server (já existia
  stdio-like stub desde Wave 8.4). Permite que tools MCP sejam
  invocadas via POST JSON de qualquer cliente.
- **Wave 9.4 — polish** (Wave 9.4 worktree, este PR):
  - PWA install prompt UX (`PwaInstallPrompt.tsx`) com
    beforeinstallprompt handler + 7-day cooldown localStorage +
    13 testes unitários.
  - i18n: +13 chaves Wave 9.3/9.4 (mentor.emotion.*,
    mentor.dispatching, mentor.toolInsights.label, mcp.health.*,
    mcp.tools.empty, pwa.install.*). 352 → 365 chaves em paridade
    en ↔ pt-BR.
  - MiniMax DPA template (`docs/legal/DPA_MINIMAX.md`) — paralelo
    ao DPA Anthropic (Wave 8.3), cobre LGPD Art. 33 transferência
    CN↔BR + auditoria de tool-calling MCP.
  - Playwright config + 9 E2E specs (4 estados emocionais × full
    + skip-picker variants). Manual por agora — Playwright browser
    binaries não instaladas; path para CI documentado em
    `apps/akasha-portal/tests/e2e/README.md`.

**Resultado Wave 9:**
- Typecheck errors: 22 (todos pré-existentes — Prisma generation
  ausente neste worktree; nenhum erro novo introduzido).
- i18n parity: 365/365 OK (`pnpm i18n:check`).
- Testes Wave 9: 43 (Wave 9.1) + 13 (Wave 9.4 PWA) = 56 testes
  verdes nas unidades modificadas.
- Wave 8 → Wave 9 total test failures delta: 17 → 17 (sem regressão).
- MCP: stub Wave 8.4 → real transport HTTP (Wave 8.4 B.3) + 5 tools
  registradas (Wave 9.3) + emotion-aware dispatcher (Wave 9.3).

**Pendencias para Wave 10+:**
- Advogado PI humano precisa revisar e assinar DPA Anthropic
  (R$ 2-5k, draft `DPA_ANTHROPIC.md`) **e** DPA MiniMax (draft
  `DPA_MINIMAX.md`).
- Playwright CI pipeline (instalar `chromium-headless-shell` ~150MB,
  provisionar Postgres test DB, rodar `pnpm db:seed`).
- Persistência server-side do emotional state (atualmente
  localStorage + cookie — não compartilhado entre devices).
- Auditoria de tool calls MCP (LGPD Art. 37 — cada tool invocada
  via Mentor deve gerar log estruturado separado).
- Reconsentimento transparente ao ativar tool-calling no Mentor.
