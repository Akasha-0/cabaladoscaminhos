# Tasks — Mandala Fase 1: API Route

## Tarefa 1: Explorar código existente
- [ ] 1.1: Ler `/apps/akasha-portal/src/app/api/akasha/mandala/route.ts` — entender estrutura atual
- [ ] 1.2: Ler `/packages/core-cabala/src/numerology-kabalah.ts` — localizar `buildKabalisticMap()` e campos disponíveis
- [ ] 1.3: Ler `/packages/core-astrology/src/aspect-finder.ts` — entender `findAspects()`
- [ ] 1.4: Ler `/packages/types/src/types.ts` — localizar `MandalaData` e `KabalisticMap`

## Tarefa 2: Expandir tipos TypeScript
- [ ] 2.1: Expandir interface `KabalisticMap` com campos: `mission`, `impression`, `personalMonth`, `personalDay`, `sefira`, `hebrewLetter`, `tarotCard`, `challenges`, `pinnacles`, `lifeCycles`
- [ ] 2.2: Adicionar tipo `AstrologyAspect` com campos: `planet1`, `planet2`, `aspect`, `orb`, `interpretation`
- [ ] 2.3: Expandir `MandalaData` para incluir `aspects` no campo `astrology`

## Tarefa 3: Implementar campos Kabala na API Route
- [ ] 3.1: Mapear `kabalisticMap.mission` e `kabalisticMap.impression`
- [ ] 3.2: Mapear `kabalisticMap.personalCycles.personalMonth` e `personalDay`
- [ ] 3.3: Adicionar `sefira`, `hebrewLetter`, `tarotCard` via mapeamento SEFIROT_PATHS
- [ ] 3.4: Mapear `kabalisticMap.challenges` (4 desafios)
- [ ] 3.5: Mapear `kabalisticMap.pinnacles` (4 pináculos)
- [ ] 3.6: Mapear `kabalisticMap.lifeCycles` com anos de início/fim calculados

## Tarefa 4: Implementar aspectos astrológicos
- [ ] 4.1: Chamar `findAspects()` com dados do BirthChart
- [ ] 4.2: Filtrar apenas os 5 aspectos principais (conjunction, opposition, trine, square, sextile)
- [ ] 4.3: Adicionar interpretação textual breve para cada aspecto

## Tarefa 5: Remover limite de planetas
- [ ] 5.1: Remover `.slice(0, 10)` do array de planetas — usar todos disponíveis

## Tarefa 6: Verificação
- [ ] 6.1: Executar `pnpm --filter akasha-portal typecheck` — deve passar sem erros
- [ ] 6.2: Executar `pnpm --filter akasha-portal test:run` — deve passar

## Task Dependencies
- Tarefa 2 depende de Tarefa 1 (saber estrutura dos tipos)
- Tarefa 3 depende de Tarefa 2 (tipos definidos)
- Tarefa 4 depende de Tarefa 1 (entender findAspects)
- Tarefa 5 depende de Tarefa 1 (ver onde está o slice)
- Tarefa 6 depende de Tarefas 2, 3, 4, 5
