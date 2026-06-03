# Análise de Duplicação de Código - Cabala dos Caminhos

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

## 2. Tarot Card Definitions (~72 linhas, 3 instâncias)

### Arquivos Analisados

1. `src/lib/tarot/cards.ts` (301 linhas)
2. `src/lib/tarot/tarot-deck.ts` (132 linhas)
3. `src/lib/tarot/v2/tarot-v2-data.ts` (349 linhas)

### Padrão Identificado

**Interface duplicada em todos os arquivos:**

```typescript
// TODOS OS 3 ARQUIVOS DEFINEM ESTA INTERFACE
export interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: string;
  number?: number;
  element?: string;
  astro?: string;
  upright: string[];
  reversed: string[];
}

export interface TarotDeck {
  cards: TarotCard[];
}
```

### Estrutura de Dados Duplicada

Todos os 3 arquivos contêm definições idênticas de:
- **Major Arcana (22 cards):** The Fool, The Magician, etc.
- **Minor Arcana (56 cards):** Wands, Cups, Swords, Pentacles

### Diferenças entre Versões

| Aspecto | cards.ts | tarot-deck.ts | tarot-v2-data.ts |
|---------|----------|---------------|------------------|
| Interface | TarotCard | TarotCard | TarotCardV2 |
| Funções | shuffle, drawCards, getCard | getDeck | getByArcana, getBySuit, getByElement |
| Exports | MAJOR_ARCANA, MINOR_ARCANA | getDeck() | getMajorArcana(), getMinorArcana() |

### Proposta de Solução

Criar `src/lib/tarot/types.ts`:

```typescript
// Interface base compartilhada
export interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: string;
  number?: number;
  element?: string;
  astro?: string;
  upright: string[];
  reversed: string[];
}

export interface TarotDeck {
  cards: TarotCard[];
}

// Versão v2 com campos adicionais
export interface TarotCardV2 extends TarotCard {
  keywords: string[];
  romanNumeral: string;
}

// Dados canônicos (em arquivo separado, imutável)
export const TAROT_MAJOR_ARCANA_DATA = [...];
export const TAROT_MINOR_ARCANA_DATA = [...];
```

**Status:** Aguardando aprovação para implementar.

---

## 3. Chakra Correlation Data (~29 linhas, 3 instâncias)

### Arquivos Analisados

1. `src/lib/correlation/chakra-day.ts` (374 linhas)
2. `src/lib/correlation/chakra-element.ts` (235 linhas)
3. `src/lib/correlation/chakra-planet.ts` (283 linhas)

### Padrão Identificado

**Tipos duplicados em todos os arquivos:**

```typescript
// TODOS OS 3 ARQUIVOS DEFINEM ChakraName
export type ChakraName = 
  | 'Muladhara'
  | 'Svadhisthana'
  | 'Manipura'
  | 'Anahata'
  | 'Vishuddha'
  | 'Ajna'
  | 'Sahasrara';

// chakra-element.ts E chakra-day.ts definem Elemento
export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

// chakra-planet.ts define Planeta
export type Planeta = 'Sol' | 'Lua' | 'Marte' | 'Mercúrio' | 'Júpiter' | 'Vênus' | 'Saturno';
```

**Função normalizeChakraName duplicada nos 3 arquivos:**

```typescript
// Identical function in all 3 files
function normalizeChakraName(chakra: string): string {
  const normalized = chakra
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  // ... mapping logic
}
```

### Interfaces Relacionadas

```typescript
// chakra-day.ts
export interface ChakraDayMapping {
  chakra: ChakraName;
  day: number;
  element: Elemento;
  sefirot: string[];
  orixa: string;
  affirmation: string;
}

// chakra-element.ts
export interface ChakraElementMapping {
  chakra: ChakraName;
  element: Elemento;
  sefirot: string[];
  planets: string[];
  orixas: string[];
  affirmation: string;
  crystal: string;
  color: string;
}

// chakra-planet.ts
export interface ChakraPlanetMapping {
  chakra: ChakraName;
  planeta: Planeta;
  element: Elemento;
  sefirot: string[];
  orixa: string;
  affirmation: string;
}
```

### Proposta de Solução

Criar `src/lib/correlation/types.ts`:

```typescript
// Tipos canônicos para correlações espirituais
export type ChakraName = 
  | 'Muladhara' | 'Svadhisthana' | 'Manipura'
  | 'Anahata' | 'Vishuddha' | 'Ajna' | 'Sahasrara';

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export type Planeta = 'Sol' | 'Lua' | 'Marte' | 'Mercúrio' | 'Júpiter' | 'Vênus' | 'Saturno';

export type DayNamePt = 
  | 'Domingo' | 'Segunda-feira' | 'Terça-feira'
  | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira' | 'Sábado';

// Função utilitária compartilhada
export function normalizeChakraName(chakra: string): ChakraName {
  // implementation
}

// Interfaces base
export interface BaseChakraMapping {
  chakra: ChakraName;
  sefirot: string[];
  orixa: string;
  affirmation: string;
}
```

**Status:** Aguardando aprovação para implementar.

---

## 4. Spiritual Correlation Data (200+ linhas, 28 instâncias)

### Arquivos com Correlações Espirituais Duplicadas

| Arquivo | Tamanho | Tipo de Correlação |
|---------|---------|-------------------|
| src/app/api/tarot/reading/route.ts | ~522 linhas | MAJOR_ARCANA_SPIRITUAL_CORRELATIONS |
| src/app/api/tarot/consulta/route.ts | ~405 linhas | MAJOR_ARCANA_SPIRITUAL_CORRELATIONS |
| src/app/api/astrologia/analise/route.ts | ~503 linhas | SIGN/PLANET/ASPECT/HOUSE correlations |
| src/app/api/numerologia/route.ts | ~229 linhas | NUMERO_SPIRITUAL_CORRELATIONS |

### Padrão de Correlação Espiritual

```typescript
// Exemplo do padrão usado em tarot/reading/route.ts
const MAJOR_ARCANA_SPIRITUAL_CORRELATIONS: Record<number, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
}> = {
  0: { sefirot: ['Kether'], chakra: 7, element: 'Ar', orixa: 'Oxalá', affirmation: '...' },
  // ... 22 entradas idênticas
};

// Similar em tarot/consulta/route.ts
const MAJOR_ARCANA_SPIRITUAL_CORRELATIONS: Record<number, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
}> = {
  0: { sefirot: ['Kether'], chakra: 7, element: 'Ar', orixa: 'Oxalá', affirmation: '...' },
  // ... 22 entradas idênticas
};
```

### Proposta de Solução

Criar `src/lib/correlation/tarot-spiritual.ts`:

```typescript
// Dados canônicos de correlação espiritual para Tarot
export const TAROT_SPIRITUAL_CORRELATIONS: Record<number, {
  sefirot: readonly string[];
  chakra: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  element: Elemento;
  orixa: string;
  affirmation: string;
}> = {
  0: { sefirot: ['Kether'], chakra: 7, element: 'Ar', orixa: 'Oxalá', affirmation: '...' },
  // ...
};
```

**Status:** Aguardando aprovação para implementar.

---

## 5. Date/Filtro Parse (79 linhas, 4 instâncias)

### Padrão Identificado

```typescript
// Padrão repetido em energia/route.ts, favoritos/route.ts, stats/route.ts
function parseDateFilters(searchParams: URLSearchParams) {
  const dataInicio = searchParams.get('dataInicio');
  const dataFim = searchParams.get('dataFim');
  const periodo = searchParams.get('periodo');
  
  // Conversão e validação de datas
  // ...
}

function parseSpiritualFilters(searchParams: URLSearchParams) {
  const tipo = searchParams.get('tipo');
  const elemento = searchParams.get('elemento');
  const chakra = searchParams.get('chakra');
  // ...
}
```

### Arquivos Afetados

- src/app/api/energy/route.ts
- src/app/api/favoritos/route.ts
- src/app/api/stats/route.ts
- src/app/api/energy/work/route.ts

**Status:** Aguardando aprovação para implementar.

---

## NÃO MODIFICAR - Arquivos de Dados de Odús

Os seguintes arquivos contêm dados espirituais canônicos e **NÃO devem ser modificados:**

- src/lib/meji-*/meji-*-data.ts (todos os arquivos meji-*)
- src/lib/ifa/odu-data.ts (dados de Odús do Ifá)

---

## Priorização Recomendada

| **1 - CRÍTICA** | Schema de validação (31 arquivos) | Manutenção difícil | Médio |
| **2 - ALTA** | Tarot Card Definitions (3 arquivos) | Evolução de API | Médio |
| **3 - MÉDIA** | Chakra Types (3 arquivos) | Consistência | Baixo |
| **4 - BAIXA** | Spiritual Correlations (tarot) | ~200 linhas | ✅ Fase 36 |
| **5 - BAIXA** | Date/Filtro Parse (4 arquivos) | parseDateFilters duplicado | Baixo |

---

## Riscos de Refatoração

1. **Quebra de API:** Alterações em schemas podem quebrar rotas dependentes
2. **Testes:** Necessidade de atualizar testes unitários
3. **Versão:** Manter compatibilidade com APIs existentes

## Recomendações

1. **Antes de refatorar:** Executar `npm run test:run` para baseline
2. **Incremental:** Implementar um clone group por vez
3. **Testes:** Adicionar testes unitários para utilitários extraídos
4. **Versionamento:** Considerar exports com namespacing (e.g., `spiritual.schemas`)

---

*Documento gerado automaticamente. Última atualização: 2026-06-02*