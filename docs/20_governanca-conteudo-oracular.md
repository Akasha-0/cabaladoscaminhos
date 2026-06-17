<!-- NOTE: This document may be outdated. Review needed before relying on it. -->
# Documento 20 — Governança do Grimório Digital & Motor de Inteligência

## Sistema Akasha

> **Norte:** Doc 25.
> **Tipo:** Decisão de arquitetura — proveniência, validação e crescimento do conteúdo (a "inteligência").
> **Versão:** 1.1 | **Data:** 2026-06-02
> **Operacionaliza:** a **arquitetura RAG anti-alucinação** do Akasha (Doc 25 §5) — o conteúdo curado é a "verdade já validada" que o Agente de Síntese (Camada 3) apenas redige — e a regra de ouro do projeto (`.claude/rules/correspondence-source.md`).
> **Relação:** subordina-se ao Doc 25 (Visão Akasha) e cita Docs 06/11/15 (conteúdo) e 19 (testes-guardião). **Este é o documento canônico de governança do Grimório Digital** (as 4 bibliotecas em Markdown → pgvector).

---

## 1. Por que isto existe

O valor do Akasha **não** está na UI (a Mandala — Doc 26) nem no LLM — está no **Grimório Digital**: as correspondências curadas (o que cada Odu/pilar significa, como os números se calculam) e a magia natural (ervas, cristais, mantras, Itans) que o Agente de Síntese injeta como verdade. Se esse conteúdo for inventado ou inconsistente, o Dashboard Diário e o Manifesto viram "genéricos" — exatamente o que a visão proíbe (Doc 25 §5: *"a IA é um sintetizador poético de uma verdade já validada"*).

Logo, a evolução do sistema é, sobretudo, a **evolução governada do Grimório**. Este documento define como esse conteúdo nasce, é validado, carrega proveniência e cresce — sem alucinação e sem quebrar o que já existe. O Grimório vive como **Markdown + YAML versionado no repositório** (`grimorio/`, a "Camada A — o Santuário"), de onde é ingerido para o pgvector (Doc 25 §5, Doc 03 §2).

---

## 2. Diagnóstico (lacunas de governança hoje)

| Lacuna | Evidência |
|---|---|
| **`IDEIA.md` ausente** | A regra `correspondence-source.md` e o `CLAUDE.md` exigem documentar correspondências em `IDEIA.md` **antes** de codificar — mas o arquivo **não existe**. O "banco" é uma referência sem lastro. |
| **Grimório ainda não estruturado** | A "Camada A — o Santuário" (Doc 25 §5) prevê cada ritual/erva/Odu como `.md` com frontmatter YAML em `grimorio/{botanica,vibracional,ancestral,diagnostico}/`. Hoje o conteúdo vive espalhado em constantes TS, sem o frontmatter que o pipeline de ingestão lê. |
| **Sem proveniência nos dados** | `correlation-map.ts` (entradas do Grafo) **não tem campo de fonte/justificativa**; a razão de cada delegação vive só na prosa do Doc 06. |
| **Glossário sem linhagem** | `odus.ts` tem `baseMeaning`/`shadow`/`quizila`/`baseAdvice`, mas **sem `source`/`lineage`** — e está sujeito à validação **D4** (Doc 11 §5). (`lenormand-cards.ts` pertence à Mesa Real → `apps/legacy-cockpit`.) |
| **Validação não materializada** | Existe o agente `cabala-corr-validator` e a regra, mas sem os artefatos (ledger + frontmatter YAML + campos) que eles deveriam proteger. |

---

## 3. Princípios de Governança (as regras invioláveis)

> **AD-20.1 — Nenhuma correspondência sem fonte.** Toda correspondência esotérica (pilar→aspecto, Odu→conselho, número→fórmula, erva→ação, mantra→Hz) **deve** citar uma tradição/fonte suportada (lista em `correspondence-source.md`). Sem fonte ⇒ não entra no Grimório nem no prompt.
>
> **AD-20.2 — Verdade injetada, nunca lembrada.** O significado-base e a receita vêm do **Grimório** (frontmatter YAML + corpo Markdown, Doc 25 §5) injetados no prompt como verdade; o Agente de Síntese (Camada 3) **não** inventa significados, rituais nem propriedades de ervas (anti-alucinação). O modelo *redige*, não *decide* conteúdo oracular.
>
> **AD-20.3 — Proveniência é dado, não comentário.** A fonte de cada correspondência é um **campo estruturado** (machine-readable), não um comentário solto — para auditoria, testes e exibição.
>
> **AD-20.4 — Provisório é explícito.** Conteúdo pendente de validação de linhagem (D1–D4) carrega `provisional: true` e é sinalizado na UI/prompt como "metodologia default", até o operador confirmar.

---

## 4. O Ledger de Correspondências (`IDEIA.md`) — reinstaurar

> **AD-20.5 — Criar `IDEIA.md` na raiz como o ledger canônico de correspondências.** É a fonte-mãe que precede o código e o frontmatter do Grimório (fluxo da regra de ouro). Estrutura mínima por entrada:
> ```md
> ## <Sistema A> ↔ <Sistema B>: <correspondência>
> - Afirmação: <ex.: "Manjericão (erva fria/equilibradora) atua sobre Lua em Escorpião e Odu Ejioko para aterrar o Ori">
> - Tradição: <Cabalística | Tântrica | Ifá/Merindilogun | Astrologia | Magia natural/botânica | …>
> - Fonte: <livro, autor, edição/página | Doc interno nº | tradição oral verificável>
> - Status: <validado | provisório (D#) >
> - Data / Autor: <YYYY-MM-DD / nome>
> ```
> O `cabala-corr-validator` **valida contra este ledger** antes de qualquer adição ao código ou ao Grimório. Onde já há correspondências (correlation-map/Grafo, glossário de Odus, frontmatter de rituais), o ledger é **preenchido retroativamente** a partir das justificativas do Doc 06 e da linhagem dos Docs 11/15. O frontmatter YAML de cada `.md` (campos `Fonte`/`Status`) é a materialização operacional deste ledger no Grimório.

---

## 5. Proveniência nos Artefatos (campos estruturados)

> **AD-20.6 — Adicionar proveniência aos dados canônicos (decisão; execução fora deste doc):**
> - **`GrimoireEntry`** (Doc 04 §1 / Doc 25 §5): o campo `metadata` (JSONB, espelho do frontmatter YAML) carrega `Fonte`/`Status`; cada fragmento injetado no prompt é rastreável por `slug` (e exposto ao usuário como `grimoireRefs` na `ChatMessage` — transparência anti-alucinação).
> - **`CorrelationEntry`** (Doc 06 §3.1 / Grafo, Doc 25 §4) ganha, por sistema, um `rationale: string` e um `source: string` (ou `SourceRef`) — a justificativa + a tradição da delegação. Hoje só há `aspects`/`extractionKeys`.
> - **Glossário** (`Odu`; `LenormandCard` apenas no `legacy-cockpit`) ganha `lineage: string` (a linhagem/fonte do significado) e `provisional?: boolean`.
> - **Calculadoras** (Doc 11 / `core-*`): cada fórmula referencia o método (Pitagórico/Cabalístico/Caldeu) num campo de metadados do mapa, para o Manifesto/Dashboard poder citar "pelo método X".
>
> Isso torna a proveniência **consultável** (auditoria), **testável** (Doc 19 §4.1) e **exibível** (transparência ao usuário — os `grimoireRefs` no app).

---

## 6. O Motor de Inteligência — como o sistema fica mais inteligente

A "mais inteligência" pedida não é um modelo maior; é **mais conteúdo curado e mais correlação fina** nas Camadas 1 (Determinístico) e 2 (Grafo de Conhecimento), alimentando o RAG da Camada 3 (Doc 25 §4–5). Três vetores de crescimento, todos governados:

```
VETOR 1 — Profundidade do Grimório (as 4 bibliotecas)
  +rituais/ervas/cristais/mantras/Itans em .md com frontmatter YAML
  (botanica · vibracional · ancestral · diagnostico)
  → Camada 3 (RAG); cada arquivo passa por AD-20.1/.5 (fonte) + teste-guardião

VETOR 2 — Refino da correlação (o Grafo)
  ajustar/justificar os cruzamentos entre pilares (Doc 06 / Doc 25 §4); +rationale/source
  → Camada 2; nunca remove a regra "cada nó só puxa o que lhe é delegado"

VETOR 3 — Profundidade dos 4 pilares
  enriquecer os mapas dos pilares fixos (Astrologia, Cabalística, Tântrica, Odus)
  via calculador + bloco em CorrelationEntry + extração no PromptBuilder
  → o Akasha é deliberadamente fechado em 4 vertentes (evitar o "Frankenstein
    Esotérico", Doc 25 §1); novos sistemas entram como nova biblioteca do
    Grimório, não como 5º pilar
```

> **AD-20.7 — O crescimento é aditivo e versionado.** Enriquecer conteúdo **não** muda a identidade (Doc 26) nem o modelo de dados (Doc 04); muda apenas as Camadas 1–2 e o Grimório. Cada enriquecimento = (1) entrada no ledger com fonte, (2) `.md`/campo de dados com proveniência, (3) teste-guardião (Doc 19 §4.1) + reingestão no pgvector (`npm run grimoire:sync`, Doc 25 §5). Assim o sistema evolui **rápido e seguro**.

---

## 7. O Fluxo de Contribuição (contrato operacional)

Toda mudança de conteúdo segue 5 passos (gate = `cabala-corr-validator`):

```
1. CONSULTAR  → existe em IDEIA.md / Grimório / glossário / correlation-map?
2. FONTE      → identificar tradição/fonte suportada (AD-20.1)
3. LEDGER     → registrar em IDEIA.md (afirmação, fonte, status) (AD-20.5)
4. CODIFICAR  → .md com frontmatter YAML + proveniência (AD-20.6) + teste-guardião (Doc 19)
5. INGERIR    → npm run grimoire:sync (git pull → embeddings Ollama → pgvector, Doc 25 §5)
```

> **AD-20.8 — Rejeitar sem fonte.** O validador recusa: correspondência sem tradição; mistura incompatível de tradições sem base; número/força inventados; ou contradição com o ledger. (Espelha `correspondence-source.md` §"Quando rejeitar".)

---

## 8. Decisões de Linhagem Pendentes (D1–D7) — situá-las na governança

| Decisão (Doc 10/11) | O que trava | Governança até resolver |
|---|---|---|
| **D1** Tabela alfanumérica (cabalística) | Numerologia do nome | Default Pitagórico marcado `provisional` |
| **D2** Rótulos tântricos (Destino × Caminho × Dom) | Mapa tântrico | Fórmulas do Doc 11 §3, `provisional` |
| **D3** Tabela data → Odu natal | Odu de Nascimento | §7.4 IDEIA.md (placeholder — algoritmo default em §7.1) |
| **D4** Linhagem dos 16 Odus | Glossário de Odus | §7.2 IDEIA.md — grafias/regências `provisional` até validação do curador (ADMIN) |
| **D5** Tabela Ervas Brasileiras/Afro-brasileiras | Grimório Botânica | §7.5 IDEIA.md (placeholder 20 ervas — awaiting v0.0.7 curator) |
| **D6** Tabela Corpos Clássicos | Mapeamento de corpos | §7.6 IDEIA.md (placeholder 4 corpos — awaiting v0.0.7 curator) |
| **D7** I-Ching × Sefirot | Decisão editorial | §7.3 IDEIA.md — mapeamento 16 hexagramas × Sefirot pendente |

> **AD-20.9 — `provisional` é o estado honesto.** Enquanto D1–D7 não forem confirmados pelo curador do Grimório (`role = ADMIN`, Doc 04), o conteúdo afetado roda com defaults **sinalizados** — nunca apresentado como verdade de linhagem fechada. A voz do Oráculo (Doc 26 §7) não declara como certeza ancestral o que está `provisional`.

---

## 9. Critério de "pronto"

- [ ] `IDEIA.md` existe e é o ledger validado (AD-20.5); o validador o usa como gate.
- [ ] `CorrelationEntry` e glossário carregam **proveniência** (`source`/`rationale`/`lineage`) (AD-20.6).
- [ ] Todo conteúdo provisório (D1–D4) está marcado `provisional` e sinalizado (AD-20.9).
- [ ] Cada correspondência tem fonte rastreável e um teste-guardião (Doc 19 §4.1).
- [ ] Nenhum significado oracular vem da memória do LLM (AD-20.2).

---

*Doc 20 é a referência canônica de governança do Grimório Digital (Doc 25 §5). A inteligência do Akasha cresce aqui — com fonte, proveniência e validação — sem tocar na identidade (Doc 26) nem no modelo de dados (Doc 04). O conteúdo curado é a verdade; a IA apenas a redige.*
