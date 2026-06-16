<!-- NOTE: This document may be outdated. Review needed before relying on it. -->
# ADR-002: Padrão Barrel Files

**Data:** 2026-06-08
**Status:** Aceito
**Decisor(es):** Arquitetura do Projeto

## Contexto

Barrel files (`index.ts` que re-exportam de outros módulos) são um padrão comum em TypeScript para criar pontos de entrada convenientes. No entanto, seu uso indiscriminado pode causar:

- Dificuldade na análise de dependências
- Exportação de módulos não intencionais
- Aumento do tempo de compilação

## Decisão

### Quando USAR Barrel Files

Usar quando há necessidade de **agrupar utilitários relacionados** que são comumente usados juntos:

```typescript
// domain/spiritual-counseling/spiritual-journey/index.ts
export * from './journey-types';
export * from './journey-service';
```

### Quando DELETAR Barrel Files

Deletar barrel files que são **forwarding puro** (apenas re-exportam sem lógica própria):

```typescript
// ❌ NÃO - forwarding puro
export { someFn } from './some-file';
export { otherFn } from './other-file';

// ✅ USAR quando há re-export agrupado
```

### Quando MANTER Arquivos com Lógica

Arquivos `index.ts` que contém **lógica real** (não apenas forwarding) devem ser mantidos como estão.

## Consequências

### Positivas
- Facilita imports para consumidores
- Agrupa exports relacionados logicamente
- Mantém `exports/` ou `index/` limpos

### Negativas
- Pode causar dependências circulares se mal usado
- Requer análise para distinguir forwarding de lógica

### Ação Corretiva
-删除 barrel files de forwarding puro durante manutenções
- Manter barrel files que agrupam utilitários relacionados
