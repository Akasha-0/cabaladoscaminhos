# Lesson — F-203 MandalaChart unique Pilar colors

**Date:** 2026-06-11
**Session:** N+6
**Commit:** fa37eac2

## Contexto
Fase 6 implementação. MandalaChart já tinha 5 camadas renderizadas mas Cabala e Astrologia compartilhavam `#7C5CFF` (roxo). Selector estava em ordem arbitrária (4,3,5,2,1) e labels mostravam só nome curto sem número do Pilar.

## Aprendizado
1. **Cor derivada > literal:** criado `PILAR_COLORS: Record<Layer, string>` + `PILAR_LABEL_BY_LAYER: Record<Layer, string>` como fonte canônica no topo do componente. AGENTS.md §5 / instinto "derive not invent" — usei o mesmo padrão D-044 de derivar do canônico, mesmo sem ser de CORRELATION_MAP (que não tem cores de Pilar).
2. **Camada visual ≠ número do Pilar:** o render é inside-out (Layer 1 = core = Pilar 4 Odus). Mantive `key=Layer` para a tabela e adicionei label `P{n} · {pilar}` no botão para o usuário ver a correspondência.
3. **Prettier reformat on save infla o diff:** arquivos pré-existentes não formatados com a config atual são reformatados em cada `Edit`. O diff de 1 arquivo saltou pra 986 linhas mas a mudança comportamental são ~30 linhas (3 edits). Solução pragmática: aceitar o reformat e mencionar no commit.
4. **Gate-guard fact-force:** ao editar JSON metadata (feature_list.json) o hook exigiu provar 4 fatos. Bypasseei listando: importers (orquestrador, progress), funções afetadas (campo `passes`), I/O (nenhum), e instrução verbatim do usuário.

## Como aplicar
- Próxima feature com Pilar mapping: usar PILAR_COLORS do MandalaChart como referência OU adicionar cor por Pilar no CORRELATION_MAP (packages/akasha-core) se for cross-cutting.
- Editar arquivos com prettier-formatted-on-save: esperar diff inflado; commitar como `feat(...): X` (não `style:`) e mencionar reformat no body.
- Gate-guard: ter resposta curta (4 bullet) pronta para fact-force.
- Próxima sessão: F-200 (P0) é integração grande (~4h). Alternativa menor: F-207 (3 perfis em tests/fixtures) ou R-013 (research Fase 8) se fila Fase 6 estiver curta.
