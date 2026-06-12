# Lesson — F-206 Tooltip Mandala (5 Pilares) via SVG `<title>`

**Date:** 2026-06-12
**Session:** N+17
**Commit:** `aeeeefab`

## Contexto
MandalaChart (1176 linhas, 5 anéis SVG) já tinha onClick para
selecionar Pilar, mas zero affordance de hover. Usuário precisava
clicar pra abrir painel lateral + rolar até SignificadoEmbed inline.
Fricção alta pra preview rápido. F-206 no backlog Fase 6 P2.

## Aprendizado

**1. SVG `<title>` é a resposta certa pra tooltip de baixo risco.**
- Browser-native: hover (desktop) + long-press (mobile) automáticos.
- Zero dep, zero state, zero a11y extra.
- Já usado no projeto (planet dots linha 505) — só faltava aplicar nos 5 anéis.
- Não compete com `onClick` — coexistem (click pra selecionar, hover pra preview).

**2. Reaproveitar `resolveSig()` do F-221 é o atalho crítico.**
- SignificadoEmbed (linhas 18-48) já chama `significadoPorPilar`/`significadoGenericoDoPilar`.
- Mesma curadoria, mesma fonte, mesmo formato — usuário vê no hover exatamente
  o que vai ver na Tela 04 do Diário. Consistência de produto de graça.

**3. Mapeamento layer→Pilar é INVERTIDO vs visual, intencional.**
- Pilar comments (linhas 139-142) já documentam o shuffle:
  Layer 1=Odus=Pilar 4 / Layer 2=Cabala=Pilar 1 / Layer 3=Tantra=Pilar 3 /
  Layer 4=Astro=Pilar 2 / Layer 5=I-Ching=Pilar 5.
- Reaproveitar o dict, não reinventar — o tooltip text é uma `Record<Layer, string>`
  que encapsula a inversão num único lugar (princípio DRY).

**4. Pilar 5 tem fallback explícito para "I Ching indisponível".**
- data.iching.available false → texto "Hex do dia (requer Pilar 5)".
- Não alucina hexagrama. Honra o invariant "nunca inventar correspondência
  esotérica sem curadoria" (AGENTS.md §5 / D-044 lesson).

**5. Triad verificação rápida confirmou: 0 regressão, 0 typecheck.**
- Baseline pre-existing: 235 fail (test pollution, conhecido desde cycle 102).
- Confirmado via `git stash` + re-run: 235 fail COM e SEM meu diff.
- Conclusão: mudança puramente aditiva, não toca fluxo de teste existente.

## Como aplicar

- **Próximo Mandala/UI com affordance de preview**: começar SEMPRE por SVG `<title>`
  nativo antes de adicionar lib de tooltip (Radix, HeadlessUI, etc.).
- **Próximo F-207 (3 perfis reais)**: usar `tooltipByLayer` para validar que o
  hover mostra o Pilar certo para cada perfil — é um teste de fumaça grátis.
- **Próximo F-200/F-204 (loadEngines real)**: a tooltip já consome `resolveSig`
  que aceita null → quando o engine retorna null, o tooltip mostra o genérico
  em vez de quebrar. Cobre Pilar 4 sem Odu definido, Pilar 5 sem hexagrama, etc.
- **Cuidado de pollution**: SEMPRE comparar baseline antes de declarar vitória.
  Stash+test é o atalho mais rápido pra confirmar zero regressão.
