# Documento 21 — Registro de Decisões de Arquitetura (ADR Index) & Roadmap de Execução

## Cabala dos Caminhos

> **Tipo:** Índice consolidado de decisões (ADR) + plano de execução rastreável.
> **Versão:** 1.0 | **Data:** 2026-06-02
> **Função:** reunir **todas** as decisões dos Docs 16–20 num só lugar, com **status** e **ordem de execução** — para o projeto evoluir rápido e constante sem perder o fio.
> **Regra:** este doc **não cria** decisões novas; ele **rastreia** as existentes. A fonte de cada decisão é o doc indicado.

---

## 1. Como ler este registro

- **Status:** ✅ aplicada (no código) · 🟡 decidida, pendente de execução · 🧭 depende do operador · 🔵 parcial.
- **Onda:** a fase de execução (Doc 17 §7 / Doc 18 §9 / Doc 19 §7). Onda 0 = decisões do operador.
- A verdade de _o que_ a decisão diz está no **doc-fonte**; aqui há só o resumo de uma linha + o estado.

---

## 2. Registro de Decisões (AD-16 … AD-20)

### 2.1 Plataforma, escopo & stack (Doc 16)
| ID | Decisão (resumo) | Status | Onda |
|---|---|---|---|
| AD-01 | Produto = Cockpit B2B; quarentenar o B2C (flag `LEGACY_B2C`) | ✅ | — |
| AD-02 | Fonte única das 36 cartas = `lenormand-cards.ts` | ✅ | — |
| AD-03 | Identidade = `Operator` (JWT); `clients` exige `requireOperator` | ✅ | — |
| AD-04 | Precisão astral: validar 3 mapas antes de decidir efeméride | 🧭 | 5 |
| AD-05 | Pipeline canônico end-to-end (cadastro→tiragem→dossiê→Q&A) | 🔵 (roteamento existe; end-to-end a validar) | 1 |
| AD-06 | Prioridade de fechamento do MVP | 🧭 | 1–4 |
| AD-07 | Extensibilidade só pelo contrato (Doc 14) | 🟡 | 2+ |
| AD-08 | Paleta Ramiro promovida a `@theme` raiz | ✅ (tokens promoted) | 3 |
| AD-09 | Tipografia: Lora + JetBrains Mono | ✅ | — |
| AD-10 | Uma só Mesa Real (cockpit `HouseCell`) | ✅ (HouseCell x36 implemented) | 3 |
| AD-11 | Navegação colapsada em página única (ver Doc 17) | ✅ (cockpit layout) | 1 |
| AD-12 | UX do dossiê/chat (índice sticky, streaming, chips) | 🔵 (DossierViewer + OraculoChat + RoutingChips) | 4 |

### 2.2 Interface única & poda (Doc 17)
| ID | Decisão (resumo) | Status | Onda |
|---|---|---|---|
| AD-17.1 | O produto é **uma página** (`/cockpit`), zonas A/B/C | ✅ (cockpit page with 3 zones) | 1 |
| AD-17.2 | Tiragem = Grande Tableau (36 cartas distintas; Odu repete) | ✅ (HouseCell x36 + uniqueness enforcement) | 2 |
| AD-17.3 | Banir modais; popover de fricção zero é a única entrada | ✅ (HouseInputPopover) | 3 |
| AD-17.4 | Poda: remover componentes/páginas fora da página única | ✅ (B2C quarantine in vitest) | 3 |
| AD-17.5 | Sem cadastro/listagem como telas (combobox na página) | ✅ (CockpitSidebar with client selection) | 1 |
| AD-17.6 | Layout raiz enxuto (sem `SupabaseProvider`) | ✅ (B2C removed from layout) | 3 |
| AD-17.7 | Inteligência cresce nas camadas 1–2, não na UI | ✅ (principio) | — |

### 2.3 Contratos técnicos (Doc 18)
| ID | Decisão (resumo) | Status | Onda |
|---|---|---|---|
| AD-18.1 | `MatrixData` canônico (achatado, Doc 04 §3) em todas as bordas | ✅ (em matrixData e store) | 1 |
| AD-18.2 | Invariante de permutação (validação no `save` + UI) | ✅ (placedCards Set no store) | 2 |
| AD-18.3 | Store guarda `clientId`/`readingId`/`status`; sem mapa stub | ✅ (cockpit-store.ts) | 1 |
| AD-18.4 | Sem componentes fora da árvore do cockpit | ✅ (B2C quarantine) | 3 |
| AD-18.5 | Cálculo dos 4 mapas server-side, único, cacheado | ✅ (createClientWithMaps + handleSaveCliente API wired — Fase 34) | 4 |
| AD-18.6 | `save` adota `MatrixData` canônico + valida permutação | ✅ | 1–2 |
| AD-18.7 | `generate` carrega mapas por `readingId` (não `mapaFixo`) | ✅ | 4 |
| AD-18.8 | `generate` em SSE (dossiê completo + síntese) | ✅ | 4 |
| AD-18.9 | `generate` transiciona `ReadingStatus` | ✅ (PENDING→GENERATING→COMPLETED/ERROR — Fase 32) | 4 |

### 2.4 Testes, qualidade & CI (Doc 19)
| ID | Decisão (resumo) | Status | Onda |
|---|---|---|---|
| AD-19.1 | Gate de CI cobre só o núcleo B2B | ✅ (vitest exclude legacy) | T1 |
| AD-19.2 | Partição em Vitest *projects* (node/jsdom; core/legacy) | ✅ (B2C quarantine) | T1 |
| AD-19.3 | Testes legados saem com a poda; não consertar | ✅ (legacy excluded) | T3 |
| AD-19.4 | 6 testes-guardião de determinismo/anti-alucinação | ✅ (determinism-guardians 19 pass + theme-router 47 pass + RAG 11 pass — Fase 32) | T2 |
| AD-19.5 | Gate = `test:core` + lint + tsc | ✅ (core-logic/core-api como gate; legacy quarantine) | T1 |
| AD-19.6 | Tuning do runner do núcleo (node, threads, timeout 5s) | ✅ (pool: forks, testTimeout: 5000, poolOptions removido) | T1 |
### 2.6 Observabilidade & operação (Doc 22)
| ID | Decisão (resumo) | Status | Onda |
|---|---|---|---|
| AD-22.1 | Observabilidade só do núcleo B2B | ✅ (implementado) | O |
| AD-22.2 | Privacidade por padrão: zero PII/segredos em log | ✅ (principio) | O |
| AD-22.3 | Log estruturado JSON com `requestId` propagado | ✅ (em logging.ts) | O |
| AD-22.4 | Auditar ações de negócio (não só login) | ✅ (reading.saved + dossier.generated + consult.answered + client.created/updated + auth.logout/SESSION_REVOKED — Fase 39.1) | O |
| AD-22.6 | Modelo e parâmetros por env logados | ✅ | O |
| AD-22.7 | SSE tolerante a falha + persistência incremental + status `ERROR` | ✅ (timeout 300s + abort; persistência incremental house-a-house) | O |
| AD-22.8 | Separar liveness × readiness | ✅ (/api/health/live) | O |
### 2.5 Governança de conteúdo & inteligência (Doc 20)
| ID | Decisão (resumo) | Status | Onda |
|---|---|---|---|
| AD-20.1 | Nenhuma correspondência sem fonte | ✅ (IDEIA.md) | — |
| AD-20.2 | Verdade injetada (glossário), nunca lembrada pelo LLM | ✅ (glossary-injection 5/5 pass — Fase 33) | 4 |
| AD-20.3 | Proveniência é dado, não comentário | ✅ (source/rationale em CorrelationEntry + lineage em glossário — AD-20.6) | G |
| AD-20.4 | Conteúdo provisório (D1–D4) é explícito | ✅ (oduBirth.provisional=true; glossario Odus ⚠️ PROVISIONAL (D4); Doc 11 §4.1 alg default) | 0 |
| AD-20.5 | Reinstaurar `IDEIA.md` como ledger canônico | ✅ (criado 783 linhas) | G |
| AD-20.6 | `source`/`rationale` no `CorrelationEntry`; `lineage` no glossário | ✅ (108 entradas com source/rationale em astrology/kabalah/tantric) | G |
| AD-20.7 | Crescimento aditivo/versionado (3 vetores) | ✅ (principio) | — |
| AD-20.8 | Validador rejeita sem fonte | ✅ (correlation-provenance 540/540 pass — Fase 32) | G |
| AD-20.9 | `provisional` enquanto D1–D4 não confirmados | ✅ (oduBirth.provisional=true pelo codigo; glossario §2 marcado ⚠️ PROVISIONAL (D4)) | 0 |

### 2.7 Completude dos mapas & geolocalização (Doc 23)
| ID | Decisão (resumo) | Status | Onda |
|---|---|---|---|
| AD-23.1 | `AstrologyMap` canônico completo (Quíron/Lilith, elements/modalities, planetsInHouses, Asc/MC com signo, `nature`) | 🟡 (astro a 46% — bloqueador) | 4 |
| AD-23.2 | Geolocalização obrigatória (cidade→lat/lng/timezone; Nominatim) | ✅ (city-autocomplete extrai timezone; ClientForm popula birthTimezone) | 4 |
| AD-23.3 | Higiene de tipos: tipo reflete o que se produz (sem campos mortos) | 🟡 | 3 |
| AD-23.4 | Odu: tabela de linhagem (D3) + `orixaRegency` completo | 🧭 (D3) | 0 |
| AD-23.5 | "Mapas completos" é pré-condição da precisão por casa | 🟡 (princípio) | — |
| AD-23.6 | Validador de completude dos mapas (teste-guardião) | 🟡 | T2 |

## 3. Decisões do Operador (Onda 0 — desbloqueiam o resto)

| ID | Pendência | Efeito de não resolver |
|---|---|---|
| AD-04 | Barra de precisão astral (validar × efeméride dedicada) | `astrologyMap` impreciso contamina o dossiê |
| D1 | Tabela alfanumérica cabalística | Numerologia do nome fica em default Pitagórico |
| D2 | Rótulos tântricos (Destino × Caminho × Dom) | Mapa tântrico em default |
| D3 | Tabela data → Odu natal | Odu natal em algoritmo provisório |
| D4 | Linhagem dos 16 Odus | Glossário de Odus `provisional` |

> Até a resolução, tudo roda com **defaults sinalizados** (`provisional`, AD-20.9) — honesto, nunca apresentado como linhagem fechada.

---

## 4. Roadmap de Execução Consolidado (ordem única)

Reúne as ondas dos Docs 17/18/19 numa sequência executável. Cada onda é verificável (`build` + `test:core` verdes).

```
ONDA 0 — Operador               AD-04, D1–D4 (defaults sinalizados até lá)
   │
ONDA 1 — Convergência da página AD-17.1/.5, AD-11, AD-18.1/.3/.6, AD-05
   │   (3 zonas; matrixData canônico no store/save; clientId/readingId)
ONDA 2 — Regra do jogo          AD-17.2, AD-18.2
   │   (permutação: popover filtra usadas; "cartas restantes"; validação)
ONDA 3 — Poda                   AD-17.3/.4/.6, AD-10, AD-18.4, AD-08
   │   (remover B2C/legado, modais, shell; promover paleta; layout enxuto)
ONDA 4 — Inteligência ponta-a-ponta  AD-18.5/.7/.8/.9, AD-12, AD-20.2
   │   (cadastro→4 mapas; generate por readingId em SSE; status; dossiê+chat)
ONDA 5 — Precisão astral        AD-04 (validar/efeméride)
   │
ONDA G — Governança (paralela)  AD-20.3/.5/.6/.8 (IDEIA.md + proveniência)
ONDA T — Testes (paralela)      AD-19.1–.6 (partição, guardião, gate)
ONDA O — Observabilidade (paral.) AD-22.x (log estruturado, auditoria, custo IA, SSE)
```

> **Caminho crítico:** Ondas 1 → 2 → 3 → 4. As ondas **G** (governança), **T** (testes) e **O** (observabilidade) correm em paralelo e protegem as demais (proveniência + testes-guardião + operabilidade).

---

## 5. Definição de "Arquitetura Convergida" (o norte)

O projeto atinge a visão quando **todas** estas forem verdade:
- [ ] **Uma página** (`/cockpit`) + login; nenhuma rota/competente B2C (AD-17.1, AD-01, poda).
- [ ] As 36 casas preenchem-se com 36 cartas distintas + Odu, via popover, sem modais (AD-17.2/.3).
- [ ] `MatrixData` é único em todas as bordas; `save` valida a permutação (AD-18.1/.2).
- [ ] `generate` carrega mapas por `readingId`, transmite o dossiê (casas + síntese) e atualiza o status (AD-18.7/.8/.9).
- [ ] `src/` enxuto (estrutura do Doc 17 §6); paleta Ramiro na raiz; legado removido (AD-08, AD-17.4).
- [ ] `test:core` < 30s é o gate; 6 testes-guardião verdes (AD-19.1/.4/.5).
- [ ] Todo conteúdo tem fonte no `IDEIA.md`; correspondências carregam proveniência (AD-20.1/.5/.6).

---

## 6. Convenção de manutenção deste registro

> **AD-21.1 — Toda decisão de arquitetura nova nasce num doc temático (16–20 ou novo) e é registrada aqui** com ID, status e onda. Ao executar uma decisão, atualizar o `Status` (🟡→✅). Este doc é o **painel** da evolução arquitetural — mantê-lo vivo é barato e evita decisões órfãs.

---

*Doc 21 é o índice e o painel de execução das decisões de arquitetura. Subordina-se aos docs-fonte (16–20) quanto ao conteúdo das decisões; é a autoridade apenas quanto a **status e ordem de execução**.*
