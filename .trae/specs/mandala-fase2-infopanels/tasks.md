# Tasks — Mandala Fase 2: InfoPanels Completos

## Dependências

- [`mandala-fase1-api-route`](file:///home/skynet/cabala-dos-caminhos/.trae/specs/mandala-fase1-api-route/spec.md) — API route expandida (completo ✓)

---

## Task 1: Expandir KabalaPanel (Camada 2)

Completar o InfoPanel da Camada 2 para exibir todos os dados Kabalísticos disponíveis.

- [ ] Task 1.1: Adicionar campos `impression` e `mission` ao KabalaPanel (abaixo de Motivação)
- [ ] Task 1.2: Adicionar campos `personalMonth` e `personalDay` ao KabalaPanel (abaixo de personalYear)
- [ ] Task 1.3: Adicionar `sefira` e `hebrewLetter` com Labels "Sefira" e "Letra Hebraica"
- [ ] Task 1.4: Adicionar `tarotCard` com Label "Carta de Tarot" mostrando nome e significado
- [ ] Task 1.5: Adicionar seção "Desafios" com 4 valores (Primeiro, Segundo, Principal, Último)
- [ ] Task 1.6: Adicionar seção "Pináculos" com 4 valores incluindo idade final e significado
- [ ] Task 1.7: Adicionar seção "Ciclos de Vida" com 3 valores incluindo idades

**Verificação**: Typecheck passa, KabalaPanel exibe todos os campos quando Camada 2 ativa

---

## Task 2: Expandir AstrologyPanel (Camada 4)

Adicionar os 5 aspectos astrológicos com interpretação ao InfoPanel da Camada 4.

- [ ] Task 2.1: Adicionar seção "Aspectos Principais" com os 5 primeiros aspectos
- [ ] Task 2.2: Cada aspecto exibido como: `{planeta1} {símbolo_aspecto} {planeta2}: {interpretação_curta}`
- [ ] Task 2.3: Usar símbolos corretos: ☌ (Conjunção), ☍ (Oposição), △ (Trígono), □ (Quadratura), ⚹ (Quintil)

**Verificação**: AstrologyPanel exibe aspectos quando Camada 4 ativa

---

## Task 3: Verificação Final

- [ ] Task 3.1: Rodar `pnpm --filter akasha-portal typecheck`
- [ ] Task 3.2: Verificar visualmente que todos os panels funcionam
- [ ] Task 3.3: Atualizar checklist.md com checkboxes marcados

---

## Ordem de Implementação

Task 1 e Task 2 podem ser implementadas em paralelo (são componentes independentes no mesmo arquivo).

Task 3 deve ser executada após Tasks 1 e 2.
