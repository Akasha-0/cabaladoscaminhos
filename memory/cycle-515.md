# Cycle 515 — Monorepo Extraction & Import Redirection (Fase A)

**Date:** 2026-06-05
**Type:** Refactor
**Branch:** claude/docs-refactor-alignment-FOUqN

## Contexto

Este ciclo representa a conclusão da **Fase A — Fundações do Monorepo** do blueprint do **Sistema Akasha**. O objetivo foi isolar a lógica de cálculo espiritual em pacotes isolados no diretório `packages/` e atualizar o código e os testes legados para usar os novos pacotes `@akasha/core-*` e `@akasha/types`, preservando a lógica determinística e a totalidade da cobertura de testes.

## Mudanças

### Criação de Pacotes Monorepo (pnpm workspaces)
* **`@akasha/types`**: Contratos de tipos de dados compartilhados.
* **`@akasha/core-astrology`**: Módulos de trânsitos, aspect finder, e posições planetárias baseadas em epemérides.
* **`@akasha/core-cabala`**: Motores de cálculo de numerologia cabalística e correspondências das Sefirot da Árvore da Vida.
* **`@akasha/core-tantra`**: Motores de cálculo de numerologia tântrica e 11 corpos energéticos.
* **`@akasha/core-odus`**: Módulos de cálculo de Odus Ifá (natal), ebós, quizilas, preceitos, e linha do tempo de progresso.

### Redirecionamento de Referências e Cleanup
* Substituição de todos os caminhos locais no diretório `src/` e `tests/` para usar `@akasha/core-*` e `@akasha/types` em vez de referências internas relativas.
* Remoção dos diretórios locais redundantes `src/lib/astrologia`, `src/lib/numerologia`, `src/lib/odus`, `src/lib/ifa` e suas calculadoras duplicadas.
* Exposição pública de `NUMEROLOGY_ODU_CORRELATIONS` e `getInterpretacao` no entrypoint de `@akasha/core-cabala`.

### Correções de Importações na Suíte de Testes
* Correção de importações quebradas em `tests/api/numerologia.test.ts`, `tests/lib/engines/hyper-correlation.integration.test.ts` e `tests/lib/engines/mapa-alma.test.ts` que apontavam para caminhos locais de numerologia deletados, direcionando-os para os novos pacotes do workspace.

## Validação

* `npx tsc --noEmit` → **0 erros**
* `npm run test:run` → **8780 testes passando** (29 skipped)
* `npm run build` → Next.js build concluído com sucesso (tanto a compilação quanto a geração de páginas estáticas e dinâmicas)

## Lições

* **Modularização Limpa em Sistemas Legados**: Isolar componentes determinísticos sem estado (pure functions de cálculo espiritual) em pacotes separados no monorepo é uma estratégia eficaz para preparar a transição de um sistema B2B obsoleto para uma UI B2C moderna, mantendo a suíte de testes robusta e sem quebras de integridade.
