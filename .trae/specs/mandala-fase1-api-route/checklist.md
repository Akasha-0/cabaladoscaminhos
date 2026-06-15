# Checklist — Mandala Fase 1: API Route

## Tipos TypeScript
- [x] Interface `KabalisticMap` expandida com campos: `mission`, `impression`, `personalMonth`, `personalDay`, `sefira`, `hebrewLetter`, `tarotCard`, `challenges`, `pinnacles`, `lifeCycles`
- [x] Tipo `AstrologyAspect` criado com campos: `planet1`, `planet2`, `aspect`, `orb`, `interpretation`
- [x] `MandalaData` inclui `aspects` no campo `astrology`

## Campos Kabala Expostos na API
- [x] `kabala.mission` exposto
- [x] `kabala.impression` exposto
- [x] `kabala.personalMonth` exposto
- [x] `kabala.personalDay` exposto
- [x] `kabala.sefira` (nome da Sefira do Life Path) exposto
- [x] `kabala.hebrewLetter` (letra hebraica da Sefira) exposto
- [x] `kabala.tarotCard` (tarô regente do Life Path) exposto
- [x] `kabala.challenges` (4 desafios: first, second, main, last) exposto
- [x] `kabala.pinnacles` (4 pináculos: first, second, third, fourth) exposto
- [x] `kabala.lifeCycles` (3 ciclos com anos de início/fim) exposto

## Campos Astrológicos
- [x] Array `planets` contém todos os 10 planetas (sem limite artificial)
- [x] `astrology.aspects` existe com array de aspectos principais
- [x] Cada aspecto tem: `planet1`, `planet2`, `aspect`, `orb`, `interpretation`

## Verificação
- [x] `pnpm --filter akasha-portal typecheck` passa sem erros
- [x] `pnpm --filter akasha-portal test:run` passa sem quebra (testes falhando por razões pré-existentes: conexão BD e grimoire)
