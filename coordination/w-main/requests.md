# coordination/w-main/requests.md

## Escalacao ao Integrador — Ciclo 688 (v0.1.6)

**De**: w-main
**Data**: 2026-06-13
**Ciclo**: 688

---

## SYNTAX ERROR: traducao-areas.ts — CRITICO

**Arquivo**: [traducao-areas.ts](file:///home/skynet/cabala-dos-caminhos/traducao-areas.ts#L298)
**Problema**: O arquivo contém um literal de string delimitado por aspas simples com a contração francesa `d'exigences` sem escape na linha 298. Isso quebra o parsing do ESLint com o erro `Parsing error: ',' expected` (resultando em falha com 5629 erros de parsing).
**Ação**: Necessário que o responsável por conteúdo (w3) ou motor (w1) escape a aspa simples para `d\'exigences` ou converta para aspas duplas/crase.

---

## DEC-009: AMAB Reset Loop — CRITICO [AGUARDANDO HUMANO]

Loop faz reset --hard. 3 opcoes no CHECKPOINT Ciclo 577. 10 ciclos sem resposta.

---

## DEC-004: Gene Keys Attribution — RESOLVIDO ✅

w2 Ciclo 21: atribuicao visivel em producao.

---

## TYPE MISMATCH: LifeArea w1 — REPORTADO A w1

proposito/sexualidade/carreira como LifeArea via cast. Build nao quebra (0 errors).
Runtime potencial bug. Dominio w1.

---

## DEC-008: Swarm sem worktree

./setup-swarm.sh nunca executado.

