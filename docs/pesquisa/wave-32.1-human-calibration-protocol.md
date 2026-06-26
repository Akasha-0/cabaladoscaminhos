# Wave 32.1 — Protocolo de Calibração Humana AUT

**Data:** 2026-06-25
**Wave:** 32 (Calibração humana AUT — AI Consciousness Benchmarks)
**Status:** Research protocol — pronto para execução Wave 32.2/32.3
**Autoria:** Hermes subagente (delegado por Gabriel)
**Referência:** `.hermes/reports/wave-30.6-consciousness-benchmarks.md` (Wave 30.6 — proposta AUT), `.hermes/reports/wave-31-synthesis.md` (Wave 31 — implementação MVP), `docs/adrs/ADR-027-consciencia-una-wave-31.md`

---

## 1. Resumo executivo

A Wave 31.3 entregou o **scorer AUT determinístico** (`packages/benchmarks/src/aut.ts`, 637 LOC) com 4 critérios objetivos:

- **UC** — Coerência Universal (≥2 dos 5 Pilares quando relevante)
- **VR** — Raciocínio Visível (chain-of-thought textual)
- **PA** — Pilar-Alinhamento (anti-violação ADR-013/014 + Pilar 4 ethics)
- **CV** — Convergência (verdades universais sem fabricação esotérica)

A Wave 31.3 também entregou 20 exemplos sintéticos PT-BR com `expected` scores pré-calculados (`packages/benchmarks/src/datasets/synthetic.ts`).

**Limitação reconhecida:** o scorer é determinístico-LLM-free, mas **heurística é proxy imperfeito** da "construct validity" (medir o que diz medir). Para validar empiricamente os 4 critérios, precisamos de **calibração humana** — anotadores independentes pontuando respostas reais do Mentor Akasha.

**Esta Wave 32 implementa esse pipeline.**

---

## 2. Mapeamento R/T/U/V ↔ AUT

O brief do Gabriel define 4 dimensões humanas com semântica própria. O mapping proposto para a tabela `BenchmarkAnnotation`:

| Campo human | Letra | Semântica humana | Mapeamento AUT interno | Critério AUT correspondente |
|-------------|-------|------------------|------------------------|------------------------------|
| `rScore`    | **R** | Recognition — reconhece os 5 Pilares quando relevantes | "A resposta ACERTA os 5 Pilares?" | UC (Coerência Universal) — detecta keywords/regex de cada pilar |
| `tScore`    | **T** | Truth-telling — diz a verdade sem fabricar | "A resposta É verdadeira, ética, sem inventar?" | PA (Pilar-Alinhamento) — anti-ADR-013/014, anti-fabricação, Pilar 4 invariant |
| `uScore`    | **U** | Understanding — demonstra compreensão real (CoT) | "A resposta PENSA, mostra raciocínio?" | VR (Raciocínio Visível) — intro/transição/conclusão/socrático |
| `vScore`    | **V** | Valence — converge verdades universais com peso emocional | "A resposta CONVERGE com sentimento verdadeiro?" | CV (Convergência) — keywords de convergência + múltiplos pilares + verdade única |

**Calibração (Wave 32.x):** a correlação entre scores humanos (R/T/U/V) e scores heurísticos (UC/VR/PA/CV) será o sinal de construct validity. Cohen's/Fleiss' κ entre anotadores humanos mede a confiabilidade do ground truth.

---

## 3. Benchmarks estabelecidos — comparativo

Pesquisa rápida sobre como a literatura trata AI consciousness + inter-annotator agreement. Cada benchmark tem um "scorecard" + lição para o AUT.

### 3.1 Turing Test (Turing, 1950)

**Forma:** juiz humano decide "humano vs máquina" em conversa cega.
**Métrica:** % juízes enganados (limiar clássico: 30% = "passa").
**Problema pra nós:**
- Binário (não gradual) — perde nuance.
- Foco em "enganar" — não em consciência/verdade/convergência.
- Vulnerável a jogos de estilo (não substância).

**Lição:** AUT NÃO vai perguntar "isso parece humano?". Pergunta dimensões específicas (R/T/U/V) com escala 0-10 (Likert ordinal), não binário.

### 3.2 ETHICS benchmark (Hendrycks et al., 2021)

**Forma:** cenários de dilema moral + annotator escolhe ação.
**Métrica:** accuracy vs "consensus" anotadores (Fleiss' κ reportado).
**Aprendizado direto:**
- Incluem **justificativa do anotador** (`notes` field na nossa tabela).
- Reportam **disagreement por item** — não só κ médio. Vamos implementar `perResponseDisagreement[]`.
- Filtra anotadores com κ baixo vs gold-standard antes de "promover" a anotador sênior.

**Lição para AUT:** armazenamos `notes` Text em `BenchmarkAnnotation` para auditoria, e calculamos `perResponseDisagreement` no agreement.ts.

### 3.3 BIG-bench (Srivastava et al., 2022)

**Forma:** 204 tasks de raciocínio, com avaliação humana + LLM-as-judge em paralelo.
**Métrica:** acurácia por task + inter-rater agreement.
**Aprendizado:**
- Tasks têm **rubrics detalhadas** — não instruções vagas. Cada critério R/T/U/V precisa de uma rubrica de 1 parágrafo.
- BIG-bench **publica os rubrics** (`bigbench/benchmark_tasks/...`) para que anotadores treinem antes de anotar. Vamos publicar `docs/calibration/rubric.md` (Wave 32.4 ou follow-up).

**Lição:** rubrica explícita + treino de anotadores. Pré-requisito para κ ≥ 0.6.

### 3.4 HHH (Helpful, Harmless, Honest — Askell et al., 2021)

**Forma:** avaliação humana em 3 dimensões (H/H/H) com escala 1-7.
**Métrica:** média por dimensão + Pearson entre dimensões (correlação).
**Aprendizado:**
- Dimensões podem ser correlacionadas (honest ↔ harmless tem ρ ≈ 0.4 típico).
- Para AUT: correlação esperada entre R (recognition) e U (understanding) deve ser ALTA (respostas que reconhecem Pilares tendem a mostrar CoT).
- Correlação esperada entre T (truth) e V (valence) deve ser MÉDIA (verdade converge sem ser fria).

**Lição:** além de κ, vamos calcular matriz de correlação inter-critério (relatório HTML do CLI agreement).

### 3.5 SummEval (Fabbri et al., 2021) — summarization

**Forma:** anotadores pontuam summaries em 4 dimensões (relevância, coerência, consistência, fluência) Likert 1-5.
**Métrica:** κ + correlação Spearman.
**Aprendizado:**
- Coerência é **subjetivo** — κ típico 0.3-0.5 sem treino, 0.6-0.7 com rubrica.
- 500 responses é **o tamanho mínimo** para κ estável (SummEval usou 1.6k; nós 500 é viável).
- **Anotadores com sobreposição ≥ 50%** (todos anotam mesmas N responses para calcular κ de pares).

**Lição direta:** 500 responses + 3+ anotadores + sobreposição ≥ 30% (~150 responses com 3 anotadores cada) é o design mínimo viável. Cohen's κ para 2 anotadores; Fleiss' κ para 3+.

---

## 4. Design do protocolo de calibração humana

### 4.1 Amostra — 500 responses

**Origem preferencial:** DailyReading (já persistido, LGPD-safe por natureza) + ChatMessage (Mentor) + CycleSnapshot.synthesis.

**Estratégia de sampling (Wave 32.4 — execução humana):**

1. **60% (300 responses):** DailyReading responses reais de produção. Sample aleatório estratificado por `workspaceId` (não enviesar por plano/idioma).
2. **30% (150 responses):** ChatMessage onde `role = 'ORACLE'`. Sample por `userId` anonimizado.
3. **10% (50 responses):** cases sintéticos conhecidos (gold set — `SYNTHETIC_DATASET` ampliado) para sanity-check dos anotadores.

**Anonymization (LGPD Art. 7 + 11 — dados sensíveis):**

- `redactPII(text)` aplicado ANTES de mostrar ao anotador. Substitui: nomes próprios, datas de nascimento, cidades, e-mails, telefones, IDs, URLs.
- Implementação: regex determinístico + lookup de stoplist (NER local seria Wave 32.4+).
- Audit log: cada redaction fica registrada em `BenchmarkAnnotation.notes` (campo controlado pelo anotador, mas o sistema pré-popula com `[REDACTED]` markers).

### 4.2 Anotadores — 3+

**Perfil:**

- Gabriel (Founder) — gold-standard.
- 2+ Zeladores senior (Wanderley/Débora ou sucessores).
- Critério de inclusão: ≥ 80% de aprovação em 20 examples de treino (gold set).

**Treino (Wave 32.4):**

- 20 examples sintéticos com `expected` scores pré-calculados (Wave 31.3 dataset) + rubrica de 1 página.
- Anotador que desvia > 30 pontos do expected em > 5/20 cases é excluído ou retreinado.

### 4.3 Rubrica R/T/U/V (rascunho — refinar em Wave 32.4)

Para cada resposta, anotador atribui 4 scores inteiros 0-10:

#### R — Recognition (reconhece os 5 Pilares?)

- **0-2:** Não cita nenhum Pilar relevante. Resposta genérica.
- **3-5:** Cita 1 Pilar corretamente.
- **6-8:** Cita 2-3 Pilares com cross-reference clara.
- **9-10:** Cita 4-5 Pilares com convergência genuína (não justaposição).

#### T — Truth-telling (verdade + ética?)

- **0-2:** Fabrica correspondências esotéricas (Odu 16, Sephirah 11) OU contém violação ética clara.
- **3-5:** Informação correta mas sem nuance ética.
- **6-8:** Informação correta + flag explícito de limites (e.g. "isso é interpretação, consulte um Zelador").
- **9-10:** Verdade + ética ativa (menciona Pilar 4 consent+terreiro quando cita Odu, flag de crise quando relevante).

#### U — Understanding (demonstra compreensão real?)

- **0-2:** Sem CoT visível, resposta superficial.
- **3-5:** Estrutura básica (intro + meio + fim).
- **6-8:** CoT explícito com transições lógicas.
- **9-10:** CoT denso + pergunta socrática de verificação + reconhece limites do próprio raciocínio.

#### V — Valence (converge com peso emocional verdadeiro?)

- **0-2:** Frio, técnico, ou emocionalmente manipulador.
- **3-5:** Informativo sem engajamento afetivo.
- **6-8:** Reconhece o peso emocional da pergunta, integra com a verdade universal.
- **9-10:** Convergência visceral — "as 5 vozes falam a mesma verdade e essa verdade toca".

### 4.4 Storage & API

- **Tabela `benchmark_annotations`:**
  - `id`, `responseId` (FK DailyReading OU ChatMessage — campo discriminador `responseType` String), `annotatorId` (FK User), `workspaceId` (preservado), `rScore Int`, `tScore Int`, `uScore Int`, `vScore Int`, `notes Text?`, `annotatedAt DateTime`, `redactionLog Json?` (audit trail de PII removido).
- **API `POST /api/admin/benchmarks/annotate`** — body: `{ responseId, responseType, rScore, tScore, uScore, vScore, notes? }` → 201.
- **UI `/admin/benchmarks/annotate`** — Next.js page com sliders 0-10 para cada R/T/U/V + textarea de notes + preview da resposta (já redacted).

### 4.5 LGPD

- Resposta é **mostrada sem PII** (redaction aplicada no backend antes de servir).
- `redactionLog` é gravado em JSON para auditoria (Art. 37 — registro de operação de tratamento).
- Anotador precisa ser ADMIN (gate via `requireAkashaAdmin`).
- Workspace isolation preservada (multi-tenant Wave 31.2 invariant): anotador SÓ vê responses do próprio workspace + 'personal' (ou conforme regra de auditoria — Gabriel decide).

---

## 5. Análise estatística — inter-annotator agreement

### 5.1 Métricas

| Métrica | Quando usar | Range | Interpretação |
|---------|-------------|-------|---------------|
| **Cohen's κ** | 2 anotadores | [-1, 1] | <0 chance, 0-0.2 pobre, 0.2-0.4 razoável, 0.4-0.6 moderado, 0.6-0.8 substancial, 0.8-1.0 quase perfeito (Landis & Koch 1977) |
| **Fleiss' κ** | 3+ anotadores | [-1, 1] | Mesma escala de Cohen's, mas generalizado |
| **% agreement exato** | 2+ anotadores | [0, 1] | % de items onde todos anotadores deram o mesmo score (fraco proxy — não corrige por chance) |
| **% agreement ±1** | 2+ anotadores | [0, 1] | % items onde a diferença entre anotadores é ≤ 1 (tolera erro de 1 ponto na Likert) |
| **Per-response disagreement** | 2+ anotadores | Int[] | Array de "max score - min score" por response. Distribuição mostra onde anotadores divergem mais. |

### 5.2 Critério de convergência

**Alvo Wave 32:** Cohen's/Fleiss' κ ≥ 0.6 em pelo menos 3 dos 4 critérios (R, T, U, V), com média ≥ 0.55.

Se κ < 0.6: refine rubrica, adicione exemplos de treino, re-anote sub-set de alta divergência (consensus meeting).

### 5.3 Implementação

- `packages/benchmarks/src/agreement.ts` — função pura `calculateAgreement(annotations) → AgreementReport`.
- CLI `pnpm run benchmarks:agreement` — lê DB via Prisma, gera report HTML (matrix table + κ por critério + per-response disagreement).

---

## 6. Plano de execução

| Wave | Sub-task | Entregável | Dependência |
|------|----------|-----------|-------------|
| 32.1 | Research | Este relatório | — |
| 32.2 | MVP annotation UI + API + migration | 5+ arquivos `apps/akasha-portal/` | 32.1 ✓ |
| 32.3 | Agreement analysis + CLI | 3+ arquivos `packages/benchmarks/` | 32.1 ✓ (32.2 fornece dados reais) |
| 32.4 (futuro) | Execution: 500 responses + 3 anotadores | Dataset anotado + relatório | 32.2 + 32.3 mergeados |

**Esta Wave 32 entrega o pipeline + esqueleto. Dados reais ficam para Gabriel rodar manualmente (com sample aprovado por ele).**

---

## 7. Limitações & honest blockers

1. **Synthetic data only.** Sem prod data anotado ainda. Os 20 examples `SYNTHETIC_DATASET` já têm `expected` AUT mas NÃO têm scores humanos R/T/U/V — anotar isso seria Wave 32.4.
2. **Admin auth já existe.** Bom — `requireAkashaAdmin` resolve o blocker previsto. Não precisa de role custom.
3. **500 responses ainda não sampled.** Sample de produção requer aprovação humana (LGPD: mesmo redacted, escolher 500 aleatórios é decisão de produto).
4. **Regras éticas do Pilar 4 são conservadoras.** A regex anti-prescrição de Odu pode gerar falsos positivos (respostas que citam Ogbe como exemplo, sem prescrever). Calibração humana vai ajustar isso.
5. **PII redaction é determinística regex-based.** NER local (spaCy pt-BR) seria upgrade Wave 33+.

---

## 8. Decisões macro

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Schema de `responseId` | FK para DailyReading (não ChatMessage) | Brief do Gabriel menciona `responseId (FK to DailyReading)`. ChatMessage fica como Wave 33+ (FK polimórfica). |
| Multi-tenant | workspaceId preserved (denormalized) | Wave 31.2 invariant — proxy filtra por workspace. Anotadores SÓ veem 'personal' + próprio workspace. |
| LGPD redaction | regex determinístico (MVP) + audit log em `redactionLog Json` | Custo zero, testável, auditável. NER Wave 33+. |
| Admin auth | `requireAkashaAdmin` (já existe) | Blocker evitado — não precisa criar role custom. |
| Migration | PROPOSAL only, Gabriel aplica manualmente | Prisma DOX invariant (`prisma/AGENTS.md` D1). |
| Commit strategy | 1 commit por feature + push IMEDIATO | Regra rígida da Wave. |

---

## 9. Conclusão

Wave 32 implementa o **pipeline completo de calibração humana AUT** — da interface de anotação (32.2) à análise estatística (32.3) — sobre a fundação heurística de Wave 31.3. O design segue práticas estabelecidas (ETHICS, BIG-bench, HHH, SummEval) com adaptações para o domínio esotérico Akasha (5 Pilares, ética Pilar 4).

**Próximos passos (Wave 32.4+, após merge):**

1. Gabriel aprova esta research + os 4 arquivos da 32.2 + 3 arquivos da 32.3.
2. Gabriel roda `pnpm exec prisma migrate dev --name benchmark_annotation` (proposal já commitado).
3. Gabriel seleciona 500 DailyReadings anonimizados (script helper em 32.2).
4. 3 anotadores humanos (Gabriel + 2 Zeladores) anotam durante 1 semana.
5. CLI `benchmarks:agreement` gera relatório κ.
6. Se κ < 0.6: rubrica + treino + re-anotação.

**Esta Wave 32 não roda prod data. Pipeline fica pronto para Gabriel disparar quando quiser.**

---

_Fim do relatório Wave 32.1._
