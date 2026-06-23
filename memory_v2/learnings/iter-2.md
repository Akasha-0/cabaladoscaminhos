---
name: iter-2-prisma-pilar6
description: Added OduProfile, SomaticMap, RitualConfig to Prisma schema
date: 2026-06-22
commit: 84c32c88
---

## O que foi feito

Adicionados 3 models ao Prisma schema para Pilar 6:

### Prisma Models

**OduProfile** — perfil ancestral de Odu:
- `birthOdu` (Int 1-16)
- `rulingOrixas` (String[] — primário, secundário, ancestral)
- `esquerdaAlign` (String[] — Exu Tranca Ruas, Maria Padilha, etc.)
- `astrologicShadow` (String[] — Lilith, Casa 8)
- `karmicBlockages` (String[])

**SomaticMap** — mapa corpo-espírito:
- `dosha` (Vata/Pitta/Kapha)
- `enneagramType` (1-9)
- `muscleTensions` (String[] — áreas de tensão somatizada)
- `kineticLimits` (String[])
- `subtleChannels` (String[] — Nadis/Chakras afetados)

**RitualConfig** — configurações ritualísticas:
- `firmesEsquerda` (String[] — firmezas de proteção)
- `herbalBaths` (String[] — prescrições de banhos Ewé)
- `ayahuascaStage` (PreAnamnesis/PostCeremony/ActiveIntegration/Fallow)
- `somaticRoutines` (String[] — movimentos cinesioterapêuticos)
- `activeShield` (Boolean)

### Migration

Criada em `prisma/migrations/20260622_add_pilar6_odu_somatic_ritual/migration.sql` — DB não disponível localmente para aplicar.

## O que funcionou

- `prisma validate` → schema válido
- Adicionar campos via `sed` funciona para edits simples no schema

## O que foi aprendido

- Relations bidirecionais precisam ser adicionadas em AMBOS os lados (User e o model novo)
- Migration com `--create-only` não precisa de DB disponível — só o SQL
- Campos compostos de array (`String[]`) são nativos no PostgreSQL

## Prisma relations troubleshooting

Se relation não funciona, verificar:
1. Campo `userId` com `unique` no model novo
2. Campo `user User @relation(...)` no model novo
3. Campo `oduprofile OduProfile?` no model User
4. `prisma validate` sempre antes de commit
