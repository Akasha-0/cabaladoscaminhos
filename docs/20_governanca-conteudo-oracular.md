# Documento 20 — Governança de Conteúdo Oracular & Motor de Inteligência

## Cabala dos Caminhos

> **Tipo:** Decisão de arquitetura — proveniência, validação e crescimento do conteúdo (a "inteligência").
> **Versão:** 1.0 | **Data:** 2026-06-02
> **Operacionaliza:** o **AD-17.7** ("a inteligência cresce nas camadas 1–2, não na UI") e a regra de ouro do projeto (`.claude/rules/correspondence-source.md`).
> **Relação:** subordina-se ao Doc 17 (visão) e cita Docs 06/11/14/15 (conteúdo) e 19 (testes-guardião).

---

## 1. Por que isto existe

O valor do produto **não** está na UI (uma página — Doc 17) nem no LLM — está nas **correspondências curadas**: o que cada casa delega, o que cada carta/Odu significa, como os números se calculam. Se esse conteúdo for inventado ou inconsistente, o dossiê vira "genérico" — exatamente o que a visão proíbe (Doc 06).

Logo, a evolução do sistema é, sobretudo, a **evolução governada do conteúdo**. Este documento define como esse conteúdo nasce, é validado, carrega proveniência e cresce — sem alucinação e sem quebrar o que já existe.

---

## 2. Diagnóstico (lacunas de governança hoje)

| Lacuna | Evidência |
|---|---|
| **`IDEIA.md` ausente** | A regra `correspondence-source.md` e o `CLAUDE.md` exigem documentar correspondências em `IDEIA.md` **antes** de codificar — mas o arquivo **não existe**. O "banco" é uma referência sem lastro. |
| **Sem proveniência nos dados** | `correlation-map.ts` (36 entradas) **não tem campo de fonte/justificativa**; a razão de cada delegação vive só na prosa do Doc 06. |
| **Glossário sem linhagem** | `lenormand-cards.ts`/`odus.ts` têm `baseMeaning`/`shadow`/`quizila`/`baseAdvice`, mas **sem `source`/`lineage`** — e estão sujeitos à validação **D4** (Doc 11 §5). |
| **Validação não materializada** | Existe o agente `cabala-corr-validator` e a regra, mas sem os artefatos (ledger + campos) que eles deveriam proteger. |

---

## 3. Princípios de Governança (as regras invioláveis)

> **AD-20.1 — Nenhuma correspondência sem fonte.** Toda correspondência esotérica (casa→aspecto, carta→significado, Odu→conselho, número→fórmula) **deve** citar uma tradição/fonte suportada (lista em `correspondence-source.md`). Sem fonte ⇒ não entra no código nem no prompt.
>
> **AD-20.2 — Verdade injetada, nunca lembrada.** O significado-base vem do **glossário** (Doc 15) injetado no prompt como verdade; o LLM **não** inventa significados (anti-alucinação). O modelo *redige*, não *decide* conteúdo oracular.
>
> **AD-20.3 — Proveniência é dado, não comentário.** A fonte de cada correspondência é um **campo estruturado** (machine-readable), não um comentário solto — para auditoria, testes e exibição.
>
> **AD-20.4 — Provisório é explícito.** Conteúdo pendente de validação de linhagem (D1–D4) carrega `provisional: true` e é sinalizado na UI/prompt como "metodologia default", até o operador confirmar.

---

## 4. O Ledger de Correspondências (`IDEIA.md`) — reinstaurar

> **AD-20.5 — Criar `IDEIA.md` na raiz como o ledger canônico de correspondências.** É a fonte-mãe que precede o código (fluxo da regra de ouro). Estrutura mínima por entrada:
> ```md
> ## <Sistema A> ↔ <Sistema B>: <correspondência>
> - Afirmação: <ex.: "Casa 24 (O Coração) delega Vênus + Lua + 5ª Casa">
> - Tradição: <Cabalística | Lenormand | Ifá/Merindilogun | Astrologia | …>
> - Fonte: <livro, autor, edição/página | Doc interno nº | tradição oral verificável>
> - Status: <validado | provisório (D#) >
> - Data / Autor: <YYYY-MM-DD / nome>
> ```
> O `cabala-corr-validator` **valida contra este ledger** antes de qualquer adição a código. Onde o código já tem correspondências (correlation-map, glossário), o ledger é **preenchido retroativamente** a partir das justificativas do Doc 06 e da linhagem dos Docs 11/15.

---

## 5. Proveniência nos Artefatos (campos estruturados)

> **AD-20.6 — Adicionar proveniência aos dados canônicos (decisão; execução fora deste doc):**
> - **`CorrelationEntry`** (Doc 06 §3.1) ganha, por sistema, um `rationale: string` e um `source: string` (ou `SourceRef`) — a justificativa + a tradição da delegação. Hoje só há `aspects`/`extractionKeys`.
> - **Glossário** (`LenormandCard`, `Odu`) ganha `lineage: string` (a linhagem/fonte do significado) e `provisional?: boolean`.
> - **Calculadoras** (Doc 11): cada fórmula referencia o método (Pitagórico/Cabalístico/Caldeu) num campo de metadados do mapa, para o dossiê poder citar "pelo método X".
>
> Isso torna a proveniência **consultável** (auditoria), **testável** (Doc 19 §4.1) e **exibível** (transparência ao operador).

---

## 6. O Motor de Inteligência — como o sistema fica mais inteligente

A "mais inteligência" pedida não é um modelo maior; é **mais conteúdo curado e mais correlação fina**, nas camadas 1–2 (Doc 17 §5). Três vetores de crescimento, todos governados:

```
VETOR 1 — Profundidade do glossário
  +baseMeaning/shadow mais ricos, +combinações (carta×casa, Odu×tema)
  → camada 1; cada adição passa por AD-20.1/.5 (fonte) + teste-guardião

VETOR 2 — Refino da correlação
  ajustar/justificar delegações por casa (Doc 06); +rationale/source
  → camada 2; nunca remove a regra "cada casa só puxa o seu" (Doc 06)

VETOR 3 — Novos sistemas oraculares (I-Ching, etc.)
  pelo contrato do Doc 14 (5 pontos): campo Map no Client, calculador,
  bloco em CorrelationEntry, extração no PromptBuilder, entrada no roteador
  → campos opcionais não quebram as 36 entradas; entra como Fase 2+
```

> **AD-20.7 — O crescimento é aditivo e versionado.** Enriquecer conteúdo **não** muda a interface (Doc 17) nem os contratos (Doc 18); muda apenas as camadas 1–2. Cada enriquecimento = (1) entrada no ledger com fonte, (2) campo de dados com proveniência, (3) teste-guardião (Doc 19 §4.1). Assim o sistema evolui **rápido e seguro**.

---

## 7. O Fluxo de Contribuição (contrato operacional)

Toda mudança de conteúdo segue 4 passos (gate = `cabala-corr-validator`):

```
1. CONSULTAR  → existe em IDEIA.md / glossário / correlation-map?
2. FONTE      → identificar tradição/fonte suportada (AD-20.1)
3. LEDGER     → registrar em IDEIA.md (afirmação, fonte, status) (AD-20.5)
4. CODIFICAR  → dado + proveniência (AD-20.6) + teste-guardião (Doc 19)
```

> **AD-20.8 — Rejeitar sem fonte.** O validador recusa: correspondência sem tradição; mistura incompatível de tradições sem base; número/força inventados; ou contradição com o ledger. (Espelha `correspondence-source.md` §"Quando rejeitar".)

---

## 8. Decisões de Linhagem Pendentes (D1–D4) — situá-las na governança

| Decisão (Doc 10/11) | O que trava | Governança até resolver |
|---|---|---|
| **D1** Tabela alfanumérica (cabalística) | Numerologia do nome | Default Pitagórico marcado `provisional` |
| **D2** Rótulos tântricos (Destino × Caminho × Dom) | Mapa tântrico | Fórmulas do Doc 11 §3, `provisional` |
| **D3** Tabela data → Odu natal | Odu de Nascimento | Algoritmo default do Doc 11 §4.1, `provisional` |
| **D4** Linhagem dos 16 Odus | Glossário de Odus | Grafias/regências atuais, `provisional` até validação do operador |

> **AD-20.9 — `provisional` é o estado honesto.** Enquanto D1–D4 não forem confirmados pelo operador, o conteúdo afetado roda com defaults **sinalizados** — nunca apresentado como verdade de linhagem fechada.

---

## 9. Critério de "pronto"

- [ ] `IDEIA.md` existe e é o ledger validado (AD-20.5); o validador o usa como gate.
- [ ] `CorrelationEntry` e glossário carregam **proveniência** (`source`/`rationale`/`lineage`) (AD-20.6).
- [ ] Todo conteúdo provisório (D1–D4) está marcado `provisional` e sinalizado (AD-20.9).
- [ ] Cada correspondência tem fonte rastreável e um teste-guardião (Doc 19 §4.1).
- [ ] Nenhum significado oracular vem da memória do LLM (AD-20.2).

---

*Doc 20 é a referência canônica de governança de conteúdo. A inteligência do produto cresce aqui — com fonte, proveniência e validação — sem tocar na interface (Doc 17) nem nos contratos (Doc 18).*
