---
name: iter-1-pilar6-engine
description: Created Aláfia engine, 16 Odus archetypes, and Ewé botanica for Pilar 6
date: 2026-06-22
commit: ec0a5a9e
---

## O que foi feito

Criado o Pilar 6 (Raiz & Esquerda) do Prisma de 6 Pilares:

### `lib/odu/` — Motor de Aláfia e 16 Odus
- `types.ts` — enum AlafiaPolarity (0-4), enum Odu (1-16), tipos OduArchetype
- `alafia.ts` — calculateAlafia(), interpretAlafia(), simulateAlafiaThrow()
- `odus.ts` — todos os 16 Odus com archetypes, orixás, somaticAreas, esquerdaAlign
- `alafia-odu-matrix.ts` — combineAlafiaOdu() para leitura combinada
- `index.ts` — exports públicos

### `lib/grimoire/botanica/` — Ewé e Ayahuasca
- `types.ts` — EweLeaf, AyahuascaProtocol
- `ewe-database.ts` — 15 folhas sagradas classificadas por orixá e elemento
- `ayahuasca-protocols.ts` — 3 stages: PreAnamnesis, PostCeremony, ActiveIntegration
- `index.ts` — exports públicos

## O que funcionou

- TypeScript strict mode compliance: zero erros nos novos arquivos
- Estrutura de diretórios segue o padrão existente do grimoire/
- Usar `import type` + `import { Enum }` separados resolve erro TS1361

## O que foi aprendido

- Element types compostos (Terra/Agua) precisam ser declarados no union type explicitamente
- Odus já existentes em `grimoire/traducao-areas.odu.ts` são traduções de superfície — não são o engine de cálculo
- `packages/core-odus/` já existe com cálculos de Odu de nascimento — PRONTO PARA INTEGRAR

## Prisma schema (próximo passo)

Precisa adicionar OduProfile, SomaticMap, RitualConfig ao schema.prisma

## Decisões

- Firmezas de Esquerda específicas por Odu (Exu Tranca Ruas → Ejionile, Maria Padilha → Din/Eyeolla)
- Elementos compostos aceitos no type system (TerraAgua, FogoAgua, Ferro)
