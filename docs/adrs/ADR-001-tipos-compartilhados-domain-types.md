<!-- NOTE: This document may be outdated. Review needed before relying on it. -->
# ADR-001: Tipos Compartilhados em `domain/types/`

**Data:** 2026-06-08
**Status:** Aceito
**Decisor(es):** Arquitetura do Projeto

## Contexto

Durante a evolução do projeto Cabala dos Caminhos, identificou-se a necessidade de compartilhar tipos entre diferentes módulos do domínio. A questão central era: **onde devem residir tipos que são usados por múltiplos módulos de domínio?**

Duas abordagens foram consideradas:
1. **`interface/`** - já existente para contratos de entrada/saída
2. **`domain/types/`** - novo diretório para tipos compartilhados entre domínios

## Decisão

**Tipos compartilhados entre módulos de domínio devem residir em `domain/types/`**, não em `interface/`.

### Justificativa

- **`interface/`** deve ser reservada para contratos de entrada/saída da aplicação (API, CLI)
- **`domain/types/`** é o local apropriado para tipos que pertencem ao domínio e são compartilhados entre módulos internos

### Exemplos Aplicados

```
domain/types/
├── spiritual-correlations.ts   # Tipos para correlação espiritual
├── spiritual-filters.ts        # Tipos para filtros espirituais
└── ...
```

## Consequências

### Positivas
- Separação clara de responsabilidades
- Tipos de domínio permanecem no domínio
- `interface/` não poluída com tipos internos

### Negativas
- Requer disciplina da equipe para não adicionar tipos em locais incorretos
- Necessidade de configurar path aliases em `tsconfig.json` (ex: `@domain/types`)

### Riscos Mitigados
- Acoplamento entre `interface/` e `domain/` que causava a violação V001
