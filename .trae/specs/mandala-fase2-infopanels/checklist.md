# Checklist — Mandala Fase 2: InfoPanels Completos

## KabalaPanel (Camada 2)

- [x] Campo `impression` exibido no KabalaPanel
- [x] Campo `mission` exibido no KabalaPanel
- [x] Campo `personalMonth` exibido no KabalaPanel
- [x] Campo `personalDay` exibido no KabalaPanel
- [x] Campo `sefira` exibido com label "Sefira"
- [x] Campo `hebrewLetter` exibido com label "Letra Hebraica"
- [x] Campo `tarotCard` exibido com nome e significado
- [x] Seção "Desafios" com 4 valores (Primeiro, Segundo, Principal, Último)
- [x] Seção "Pináculos" com 4 valores incluindo idade e significado
- [x] Seção "Ciclos de Vida" com 3 valores incluindo idades
- [x] Indicador ★ Mestre aparece quando `lifePathMaster` ou `expressionMaster` é true

## AstrologyPanel (Camada 4)

- [x] Seção "Aspectos Principais" visível no painel
- [x] Exibe até 5 aspectos principais
- [x] Cada aspecto mostra: planeta1 símbolo planeta2
- [x] Interpretação do aspecto exibida de forma legível
- [x] Símbolos dos aspectos corretos (☌ ☍ △ □ ⚹)

## Verificação Técnica

- [x] `pnpm --filter akasha-portal typecheck` passa sem erros
- [x] Nenhum campo null causa crash (verificar com dados incompletos)
- [x] Layout consistente com outros InfoPanels existentes
- [x] Responsivo em telas menores

## Constraints Verificados

- [x] Aviso "requer consentimento + terreiro" presente no OdusPanel (via `SignificadoEmbed` quando `significado.requer_terreiro`)
- [x] Sem exposição de PII (datas de nascimento completas)
- [x] Nenhuma correspondência esotérica inventada
