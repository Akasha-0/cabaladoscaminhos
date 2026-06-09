# ADR-003: Resolução da Violação V001 - Camadas de Domínio

**Data:** 2026-06-08
**Status:** Aceito
**Decisor(es):** Arquitetura do Projeto

## Contexto

Durante análise de linting do projeto, foi identificada a **violação V001**: módulos de camada superior importando de camadas inferiores.

### Regra V001
```
domain/   → NÃO pode importar de interface/
application/ → NÃO pode importar de interface/
```

Esta violação representa um **acoplamento indevido** onde regras de domínio e aplicação dependem de detalhes de implementação de interface.

## Decisão

**Corrigir todas as violações V001** realocando dependências para as camadas corretas.

### Estratégia de Correção

1. **Identificar tipos violadores**: Tipos usados em `domain/` ou `application/` que vinham de `interface/`

2. **Mover tipos compartilhados**: Tipos usados por múltiplos módulos foram movidos para `domain/types/`

3. **Redirecionar imports**: Atualizar imports em módulos violadores para usar novos caminhos

4. **Verificar via lint**: Executar `pnpm lint:rules` para confirmar resolução

### Exemplo de Correção

```typescript
// ❌ ANTES (violação V001)
import { SomeType } from '@interface/types';

// ✅ DEPOIS
import { SomeType } from '@domain/types';
```

## Consequências

### Positivas
- Camadas respeitam o Princípio da Dependência
- `domain/` e `application/` não acoplados a `interface/`
- Maior testabilidade e manutenibilidade
- Base sólida para futuras evoluções

### Negativas
- Necessidade de mapear dependências existentes
- Possível refatoração de imports em múltiplos arquivos

### Regras Estabelecidas
| Camada | Pode importar de |
|--------|------------------|
| `interface/` | `domain/`, `application/`, `shared/` |
| `application/` | `domain/`, `shared/` |
| `domain/` | `shared/` |
| `shared/` | (nenhuma camada do projeto) |
