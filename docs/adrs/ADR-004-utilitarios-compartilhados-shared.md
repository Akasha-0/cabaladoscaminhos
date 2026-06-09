# ADR-004: Utilitários Compartilhados em `shared/`

**Data:** 2026-06-08
**Status:** Aceito
**Decisor(es):** Arquitetura do Projeto

## Contexto

Durante o desenvolvimento, surgiram utilitários que não pertencem a um domínio específico mas são necessários em múltiplos pontos da aplicação. A questão era: **onde colocar utilitários genéricos que não têm domínio específico?**

Categorias identificadas:
1. Utilitários de parsing/serialização
2. Utilitários de validação genérica
3. Utilitários de manipulação de dados
4. Helpers de query parameters
5. Rate limiting

## Decisão

**Utilitários sem domínio específico devem residir em `shared/`**, mantendo uma estrutura organizada por funcionalidade.

### Estrutura Recomendada

```
shared/
├── query-params/           # Utilitários de query parameters
│   └── query-params.ts
├── rate-limit/             # Utilitários de rate limiting
│   └── rate-limit.ts
├── validators/             # Validadores genéricos
├── parsers/                # Parsers e serializers
└── index.ts                # Barrel file se apropriado
```

### Critérios de Inclusão

Um utilitário deve ir para `shared/` quando:
- ✅ Não pertence a um domínio específico
- ✅ É usado por múltiplos domínios ou camadas
- ✅ Não contém lógica de negócio

### Critérios de Exclusão

Um utilitário deve ficar no domínio quando:
- ❌ Só é usado por um domínio específico
- ❌ Contém lógica de negócio específica
- ❌ Faz parte de um agregado de domínio

## Consequências

### Positivas
- Evitar duplicação de código entre domínios
- Local único para utilitários cross-cutting
- Facilidade de manutenção e testes

### Negativas
- Risco de `shared/` se tornar "lixeira" de código não categorizado
- Necessidade de organizar para evitar acúmulo

### Boas Práticas
- Manter `shared/` focado e organizado
- Criar sub-diretórios por funcionalidade quando apropriado
- Documentar utilitários não óbvios
- Evitar colocar lógica de domínio em `shared/`
