# Refatoração Akasha v2 (Doc-driven) — Spec

## Why
O código e o schema atual misturam múltiplas “linhas de produto” (B2B Operator/Mesa Real + B2C + Akasha*) e divergem do alvo definido na documentação (Docs 03/04/25). Isso gera duplicação de modelos, rotas e regras de auth, dificultando evolução e auditoria.

## What Changes
- Consolidar o projeto para a **visão Akasha v2** conforme a documentação em `docs/` (fonte de verdade).
- Refatorar o **schema Prisma** para o **núcleo B2C canônico** (Doc 04 §1–5), removendo totalmente o legado B2B.
- Tornar a migração **destrutiva** (drop/recriar) conforme decisão: não preservar dados B2B.
- Remover rotas/páginas/libs/testes do Cockpit/Operator (B2B) e qualquer dependência associada.
- Atualizar a documentação que ainda menciona “legado/quarentena” para refletir a remoção total do B2B.

## Impact
- Affected specs: Doc 03 (Arquitetura), Doc 04 (Modelo de Dados), AUTH-AUDIT, MIGRATIONS, Doc 25 (Visão Akasha) como norte.
- Affected code:
  - Banco: `prisma/schema.prisma`, `prisma/migrations/*`, `prisma/seed.ts`, `prisma.config.ts`
  - Auth/rotas: `src/app/api/operator/**`, `src/app/cockpit/**`, `src/lib/auth/operator-*`, `src/lib/auth/operator-*`, `src/lib/auth/operator-guard.ts`
  - Akasha B2C: `src/app/api/akasha/**`, `src/lib/akasha/**`, `src/lib/db/**`, `src/lib/prisma.ts`
  - Testes: `tests/**` que cobrem B2B (Operator/Mesa Real) e seus helpers

## ADDED Requirements
### Requirement: Prisma schema canônico Akasha v2
O sistema SHALL expor um schema Prisma que contenha apenas o núcleo B2C definido no Doc 04 §1–5:
- `User`, `BirthChart`, `Subscription`, `CreditEntry`, `Manifesto`, `DailyReading`, `RitualCompletion`, `Consultation`, `ChatMessage`, `GrimoireEntry`
- Enums: `UserRole`, `Plan`, `SubStatus`, `ChatRole`

#### Scenario: Novo ambiente (DB vazio)
- **WHEN** o desenvolvedor aplica as migrations em um banco vazio
- **THEN** somente tabelas do núcleo B2C existem (sem tabelas Operator/Client/Reading/Report)
- **AND** o `prisma generate` tipa corretamente o client para o núcleo B2C

### Requirement: Remoção completa do B2B (sem legado)
O sistema SHALL remover completamente o domínio B2B (Operator/Mesa Real) do produto e do repositório executável.

#### Scenario: Rota B2B removida
- **WHEN** alguém chama uma rota antiga `/api/operator/*` ou acessa uma página `/cockpit/*`
- **THEN** a aplicação não deve expor essas superfícies (rota inexistente/404)

## MODIFIED Requirements
### Requirement: Documentação sem “quarentena/legado”
**Doc 03**, **Doc 04**, **AUTH-AUDIT** e **MIGRATIONS** SHALL ser atualizados para remover qualquer dependência do “legacy-cockpit” e qualquer seção que trate B2B como parte do sistema.

## REMOVED Requirements
### Requirement: Cockpit/Mesa Real (B2B)
**Reason**: decisão do produto: “não deixar em quarentena e nem legado; isso não será utilizado”.
**Migration**: migração destrutiva do DB; remoção de rotas/páginas/libs/testes; atualização da documentação.

