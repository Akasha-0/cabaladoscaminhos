# Architecture Decision Records (ADRs)

Decisões arquiteturais documentadas para referência futura.

## Índice

| ADR | Título | Status | Data |
|-----|--------|--------|------|
| [ADR-001](ADR-001-domain-types-location.md) | Tipos Compartilhados em `domain/types/` | ✅ Aceito | 2026-06-08 |
| [ADR-002](ADR-002-barrel-files-pattern.md) | Padrão Barrel Files | ✅ Aceito | 2026-06-08 |
| [ADR-003](ADR-003-v001-resolution.md) | Resolução da Violação V001 | ✅ Aceito | 2026-06-08 |
| [ADR-004](ADR-004-shared-utilities.md) | Utilitários Compartilhados em `shared/` | ✅ Aceito | 2026-06-08 |

## Quando Criar ADR

Crie um ADR quando:
- Decisão arquitetural afetar múltiplos módulos
- Padrão for estabelecido para uso futuro
- Trade-offs precisarem ser documentados

## Formato

```markdown
# ADR-NNN: Título

## Status
✅ Aceito | ⚠️ Depreciado | 🔄 Em revisão

## Contexto
[Por que esta decisão foi necessária]

## Decisão
[O que foi decidido]

## Consequências

### Positivas
- [Benefício 1]
- [Benefício 2]

### Negativas
- [Trade-off 1]
- [Trade-off 2]

### Ações
- [Ação 1]
- [Ação 2]
```
