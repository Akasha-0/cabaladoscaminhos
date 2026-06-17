# Mandala Fase 1 — API Route (Fundação de Dados)

## Status

✅ **CLOSED** — implemented in earlier cycle (pre-cycle 510). The API route
`/api/akasha/mandala` was extended to expose the full KabalisticMap Nível 3
fields: Sefira regente, letra hebraica, tarô regente, 4 Desafios, 4 Pináculos,
3 Ciclos de Vida, all 10 planets, and 5 main aspects. See cycle history in
`memory/cycle-510..518.md` for the implementation details.

## Why

A API route `/api/akasha/mandala` currently returns a simplified `MandalaData` structure that lacks critical fields needed for the Phase 2-6 UI work. The `buildKabalisticMap()` and `findAspects()` functions already calculate all required data — they just need to be exposed.

## What Changes

- Extender `MandalaData` na API route para incluir todos os campos do KabalisticMap Nível 3
- Expor Sefira regente, letra hebraica e tarô regente do Life Path
- Expor 4 Desafios e 4 Pináculos
- Expor 3 Ciclos de Vida com anos de início/fim
- Remover limite de 5 planetas — expor todos os 10 planetas astrológicos
- Adicionar array de 5 aspectos principais com interpretação
- Atualizar tipos TypeScript correspondentes

## Impact

- Affected specs: akasha-v0.0.19 (MandalaChart InfoPanels)
- Affected code:
  - `apps/akasha-portal/src/app/api/akasha/mandala/route.ts`
  - `packages/types/src/types.ts`

## ADDED Requirements

### Requirement: KabalisticMap Nível 3 Completo
A API SHALL retornar todos os campos calculados por `buildKabalisticMap()`.

#### Scenario: GET /api/akasha/mandala
- **WHEN** cliente chama a API com birthDate, birthTime, birthPlace
- **THEN** a resposta inclui `kabala.mission`, `kabala.impression`, `kabala.personalMonth`, `kabala.personalDay`, `kabala.sefira`, `kabala.hebrewLetter`, `kabala.tarotCard`, `kabala.challenges`, `kabala.pinnacles`, `kabala.lifeCycles`

### Requirement: Astrologia Completa (10 Planetas)
A API SHALL retornar todos os planetas disponíveis, sem limite artificial.

#### Scenario: Planets array
- **WHEN** cliente obtém dados astrológicos
- **THEN** o array `planets` contém todos os 10 planetas do BirthChart (Sol, Lua, Mercúrio, Vênus, Marte, Júpiter, Saturno, Urano, Netuno, Plutão)

### Requirement: Aspectos Astrológicos
A API SHALL retornar os 5 aspectos principais com interpretação.

#### Scenario: Aspects array
- **WHEN** cliente obtém dados astrológicos
- **THEN** existe `astrology.aspects` com array de até 5 aspectos (conjunction, opposition, trine, square, sextile)
- **AND** cada aspecto tem `planet1`, `planet2`, `aspect`, `orb`, `interpretation`

## MODIFIED Requirements

### Requirement: MandalaData Type
**Modified**: Expandir interface `MandalaData` em `types.ts` para incluir novos campos kabala.

## REMOVED Requirements

### Requirement: Limite de 5 Planetas
**Reason**: A API limitava arbitrariamente a `slice(0, 10)` quando BirthChart já retorna todos.
**Migration**: Remover slice — usar array completo.
