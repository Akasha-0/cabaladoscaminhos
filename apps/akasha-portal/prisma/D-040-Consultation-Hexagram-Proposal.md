# D-040: Consultation Hexagram Type Change

## Justificativa
O campo `Consultation.hexagram` está como `String?`, enquanto `DailyReading.hexagram` já está como `Int?`. Esta mudança visa padronizar o tipo do I-Ching no banco de dados para `Int?` (range 1-64), garantindo maior type safety e consistência com a spec IFA/D-044.

## Diff do Schema
```diff
- hexagram String?
+ hexagram Int?
```

## Riscos
1. Dados existentes na coluna `hexagram` da tabela `consultations` podem ser strings não numéricas, o que causará erro na migração.
2. A aplicação pode ter código que espera `String` em vez de `Int`.

## Plano de Rollback
1. Reverter o schema.prisma para `String?`.
2. Rodar a migração de rollback.
3. Restaurar dados (se a migração não tiver preservado o formato original).
