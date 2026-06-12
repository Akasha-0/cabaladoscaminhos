# Lesson — F-219 Pilar 4 (Odu) truth-base + PWA cleanup

**Date:** 2026-06-12
**Session:** N+15
**Commits:**
- `16096e1c` — fix(domain): F-219 — getOduByName resolve nomes parentetizados (Pilar 4 truth-base)
- `2da6b204` — chore(portal): remove PwaInstallPrompt UI (portal é web, não PWA)

## Contexto

Reinício de sessão após D-040 (Prisma migration) ficar em `awaiting_human_apply`.
Fila FASE 6 + 7 = 0 itens. Estado da working tree: M/D em PWA files + odu
fix + test já escritos mas não commitados. Nenhum item novo enfileirado.

## Decisões

1. **F-219 é o código real.** Fix de `getOduByName` resolve Pilar 4
   (Odu) truth-base. Sem ele, `buildOduGlossary` retornava `null` e
   o system prompt do Mentor IA ficava sem verdade-base sobre os 16
   Odus — alucinação direta. Risco ético (LGPD art. 37 + Pilar 4
   ethics invariant). Comitar antes de qualquer outra coisa.

2. **Strip parentético é fallback seguro.** O fix tenta lookup
   exato primeiro; só stripa `(\s*\(.*?\)\s*)` se falhar. Não
   inventa correspondência — usa o prefixo canônico já presente em
   ODU_DATABASE. AGENTS.md §5 preservada.

3. **PWA Install Prompt = cleanup paralelo.** O componente estava
   na working tree há >1 sessão (provavelmente ciclo de cleanup de
   F-100 series). Portal Next.js+Vercel ≠ PWA instalável.
   ServiceWorkerRegistrar preserva engine de SW (cache offline).
   Commit separado, escopo limitado, sem renomeação.

4. **Não toquei na D-040.** Migration Prisma awaiting human approval
   per STEP 5.5. Sem signal do humano, não roda. Stays pending.

5. **Pre-existing test pollution NÃO é meu problema.** 477 test
   files falham no suite full (cookies() fora de request scope —
   Next.js test env). L2 lesson: roda isolado, verifica regressão
   própria, segue. Meus 7 testes isolados = 7/7 verde. Nenhuma
   regressão adicionada.

## Padrões identificados (reforçam lessons anteriores)

- **L1 (feature_list.json fragility)** — Usei Python `json.load/dump`
  para adicionar F-219/F-220 ao invés do Edit tool. Round-trip
  preserva formatação JSON, evita abrir `{` sem id (orphan).
  Reforça o instinto: Edit tool em JSON grande = risco.

- **L2 (test pollution)** — Verifiquei F-219 isolado (7/7 verde).
  Suite full pré-existente: 477 fail. Suite full pós-meu-commit:
  477 fail (mesma contagem = zero regressão). Lição: rodar suite
  inteiro confirma zero regressão mas não tenta consertar
  pollution acumulada.

- **Pre-existing infra issues fora de escopo** — `@eslint/js` não
  instalado em `node_modules` (warning MODULE_TYPELESS_PACKAGE_JSON
  no eslint.config.js). Não é minha tarefa. F-100 series
  (refactor/hardening) cobre isto em outra sessão.

## Como aplicar (próxima sessão)

- **Antes de mergulhar na fila**: `git status --short` para
  detectar in-flight edits. Working tree muitas vezes tem 1-2
  fixes já escritos que só precisam ser commitados + testados.

- **Quando Pilar 4 falha truth-base**: sempre verificar
  `getOduByName`/`getOduByNumber` lookup helpers primeiro. O
  AI Mentor system prompt é construído a partir de
  `buildOduGlossary` → se null, IA alucina. Mesma lógica para
  Pilar 1 (numerologia), Pilar 2 (astrologia), Pilar 3
  (tantra/ayurveda), Pilar 5 (I Ching).

- **Não misturar escopos de commit.** F-219 (fix) e F-220
  (chore) foram commits separados, atomicidade preservada.
  Mesmo se "são da mesma sessão", separabilidade = git
  bisect-friendly.
