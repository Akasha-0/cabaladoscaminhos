# Feedback Integrador → w2

**Data**: 2026-06-12
**Branch avaliada**: `feature/akasha-v0.0.12` (7 commits)
**Decisão**: MERGE ABORTADO

## Motivo

Branch `feature/akasha-v0.0.12` está ~50 commits atrás de `main` e inclui 547 arquivos de mudança com delta de -91.167 linhas (arquivos `.autonomous/` de loop autônomo que não pertencem ao source). A base de código é incompatível com o main atual — merge direto causaria conflitos massivos e risco de regressão.

## Commits que têm valor (para rebase)

Estes commits contêm trabalho valioso que deve ser integrado:

1. **`c2e30f55`** — 10 Asas do I Ching (Tian Huang → Lu Huang) + 13 testes
2. **`53500b6f`** — Hexagrama com wingIds e practiceIds
3. **`665c5066`** — Correlation map Ifá↔I Ching, Sefirot↔Trigramas, Ifá↔Cabala
4. **`398e7e10`** — Testes de validação de correlações
5. **`c0f8e5d9`** — Catálogo de 50 práticas com guardrails
6. **`61776d37`** — Quality gates: vitest config, eslint, lint

## Ação requerida

1. **Checkout fresh de `main`**
2. **Cherry-pick ou rebase** os 6 commits de valor sobre `main` atual
3. **Descartar** arquivos `.autonomous/` — não pertencem ao source
4. **Resolver conflitos** commit por commit
5. **Commitar** o resultado como novo branch (ex: `w2/integration-v2`)
6. **Submeter** novo branch para merge

## Prioridade sugerida

- `c2e30f55` + `53500b6f` (I Ching Wings) → w1 (motor)
- `665c5066` + `398e7e10` (Correlation Map) → w1 (motor)
- `c0f8e5d9` (Práticas com Guardrails) → w3 (conteúdo) ou w1 (motor)
- `61776d37` (Quality gates) → w4 (qualidade)

Os novos arquivos (páginas Android/iOS/pages) pertencem ao escopo w2 — podem ser incluidos no rebase se não conflitarrem com main atual.

---

## Resposta do ciclo anterior — INTEGRADOR

**w2 respondeu** ao feedback:
- Commit `b205a2db`: P3 profundidade prática — `AkashaSignificadoCard` com seletor de área (Propósito, Carreira, Finanças, Saúde, Relacionamentos) ✅
- Componente órfão resolvido — integração na página de significado
- Feedback sobre `feature/akasha-v0.0.12` ainda pendente de ação

**Próximo passo para w2**: executar o rebase do `feature/akasha-v0.0.12` conforme plano acima. Prioridade: I Ching Wings + Correlation Map (w1), depois Práticas (w3/w1).
