# Análise de Duplicação de Código - Cabala dos Caminhos

> 🗄️ **HISTÓRICO.** Análise de duplicação no código legado B2B. Referência de manutenção do apps/legacy-cockpit. Norte vigente: Doc 25.

**Data:** 2026-06-02  
**Escopo:** Clone groups críticos identificados em fallow-baseline-dupes.json

---

## Resumo Executivo

| Clone Group | Linhas | Instâncias | Prioridade | Ação Recomendada |
|-------------|--------|------------|------------|------------------|
| Schema de validação SPIRITUAL | ~200 | 31+ | **ALTA** | Extrair utilitário compartilhado |
| Tarot Card Definitions | ~72 | 3 | **MÉDIA** | Consolidar interfaces base |
| Chakra Correlation Data | ~29 | 3 | **BAIXA** | Extrair tipos compartilhados |
| Tarot Major Arcana Spiritual | ~220 | 2 | **MÉDIA** | Unificar correlações |

---

## 1. Schema de Validação SPIRITUAL (31+ instâncias)

### Padrão Identificado

Todos os arquivos `src/app/api/*/route.ts` duplicam a definição de schemas Zod:

```typescript
// PADRAO DUPLICADO EM 31+ ARQUIVOS
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);

const ChakraSchema = z.coerce.number().int().min(1).max(7);

const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);
```

### Arquivos Afetados (31+ arquivos)

| Arquivo | Ocorrências |
|---------|-------------|
| src/app/api/progresso/route.ts | 10 |
| src/app/api/notifications/spiritual/route.ts | 9 |
| src/app/api/notifications/preferences/route.ts | 9 |
| src/app/api/lenormand/route.ts | 9 |
| src/app/api/health/metrics/route.ts | 9 |
| src/app/api/favoritos/route.ts | 9 |
| src/app/api/energy/route.ts | 9 |
| src/app/api/divine/connection/route.ts | 8 |
| src/app/api/dashboard/notifications/route.ts | 8 |
| src/app/api/tarot/reading/route.ts | 6 |
| src/app/api/tarot/consulta/route.ts | 6 |
| src/app/api/numerologia/route.ts | 6 |
| src/app/api/astrologia/analise/route.ts | 6 |
| src/app/api/astrologia/transitos/route.ts | 6 |
| ... (+ 18 mais) |

### Impacto

- **Linhas duplicadas:** ~200
- **Manutenção:** Alterar um enum exige mudanças em 31+ arquivos
- **Consistência:** Risco de divergência entre schemas

### Proposta de Solução

Criar `src/lib/validation/schemas.ts`:

```typescript
import { z } from 'zod';

export const SEFIROT = [
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
] as const;

export const SefirotSchema = z.enum(SEFIROT);
export const ChakraSchema = z.coerce.number().int().min(1).max(7);
export const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);
export const OrixaSchema = z.enum([...]);
```

**Status:** Aguardando aprovação para implementar.

---

## 2. Tarot Card Definitions

> ⚠️ **Investigado em 2026-06-03 — informações originais desatualizadas.**

### Arquivos Reais Encontrados

1. `src/lib/tarot/cards.ts` (320 linhas) — **CANÔNICO**  
   Interface `TarotCard` com `upright: string[]`, `reversed: string[]`. 5+ callers ativos. **Manter.**

2. `src/lib/tarot/tarot-deck.ts` — **NÃO EXISTE** (removido/renomeado)

3. `src/lib/tarot/v2/tarot-v2-data.ts` — **NÃO EXISTE** (removido/renomeado)

4. `src/lib/tarot/meanings.ts` (447 linhas) — **INCOMPATÍVEL**  
   Interface `CardMeaning` com `upright: string` (singular). Caller em `mapa-alma.ts`. **Não tocar.**

5. `src/lib/tarot/shared-card-data.ts` (115 linhas) — **DUPLICADO**  
   `TarotCardBase` é clone de `TarotCard`. Refatorar para usar import de `cards.ts`.

**Status:** ✅ Investigação concluída (2026-06-03). Clone real só em `shared-card-data.ts`.

---

## 3. Chakra Correlation Data (~29 linhas, 3 instâncias)

> ✅ **Resolvido em Fase 37 — chakra-base.ts criado.**
