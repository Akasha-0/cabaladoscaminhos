# Tarot Card Definitions — Viabilidade de Deduplicação

## Conclusão: **PARCIAL**

> Os dois arquivos existentes (`cards.ts` e `shared-card-data.ts`) compartilham uma interface `TarotCardBase` quase idêntica a `TarotCard`, mas os dados divergem em tipagem de campo e propósito funcional. A interface `CardMeaning` em `meanings.ts` tem formato radicalmente diferente e não deve ser unificada. A recomendação é extrair o tipo base canônico e refatorar `shared-card-data.ts` para reutilizá-lo, sem tocar nos dados de `cards.ts`.

---

## Análise dos Arquivos

### 1. `src/lib/tarot/cards.ts` (320 linhas) — **EXISTE, CANÔNICO**

**Propósito:** Fonte canônica de dados do baralho + utilitários funcionais (`drawCards`, `shuffle`).

**Interface `TarotCard`:**
```typescript
export interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: string;
  number?: number;
  element?: string;
  astro?: string;
  upright: string[];   // array de keywords
  reversed: string[];  // array de keywords
}

export interface TarotDeck {
  cards: TarotCard[];
}
```

**Dados:** 22 Major Arcana + 56 Minor Arcana (Wands/Cups/Swords/Pentacles). Todos os campos `upright` e `reversed` são `string[]`.

**Funções:** `shuffle()`, `drawCards(n: number): TarotCard[]`.

**Exports:** `MAJOR_ARCANA`, `MINOR_ARCANA`, `TAROT_DECK`, `TAROT_DECK`, `drawCards`.

**Callers (5+ arquivos):**
- `src/app/api/divination/cross-system/route.ts` — importa `TarotCard`, `MAJOR_ARCANA`, `MINOR_ARCANA`
- `src/app/api/search/route.ts` — importa `TAROT_DECK`
- `src/app/api/search/index/route.ts` — importa `TAROT_DECK`
- `src/app/api/tarot/cards/route.ts` — importa `TAROT_DECK`
- `src/app/api/tarot/consulta/route.ts` — importa `drawCards`

**Status:** Ativamente usado. Não deve ter dados alterados.

---

### 2. `src/lib/tarot/tarot-deck.ts` — **NÃO EXISTE**

Este arquivo foi listado no fallow-analysis como existente com 132 linhas. **Não foi encontrado no repositório atual.** O arquivo não existe mais ou foi removido/renomeado. A análise prossegue apenas com os arquivos que existem.

---

### 3. `src/lib/tarot/v2/tarot-v2-data.ts` — **NÃO EXISTE**

Este arquivo foi listado no fallow-analysis como existente com 349 linhas. **Não foi encontrado no repositório atual.** O arquivo não existe mais ou foi removido/renomeado.

---

### 4. `src/lib/tarot/meanings.ts` (447 linhas) — **EXISTE, MAS DIVERGENTE**

**Propósito:** Significados textuais expandidos das cartas para uso no mapa da alma.

**Interface `CardMeaning`:**
```typescript
export interface CardMeaning {
  name: string;
  upright: string;   // texto descritivo único (não array)
  reversed: string;  // texto descritivo único (não array)
}

export interface TarotDeck {       // ⚠️ mesmo nome, estrutura DIFERENTE
  majorArcana: CardMeaning[];
  minorArcana: {
    wands: CardMeaning[];
    cups: CardMeaning[];
    swords: CardMeaning[];
    pentacles: CardMeaning[];
  };
}
```

**Dados:** 78 significados textuais (parágrafos descritivos, não keywords).

**Callers (1 arquivo):**
- `src/lib/engines/types/mapa-alma.ts` — importa `CardMeaning` como tipo.

**Marcado com `fallow-ignore-next-line unused-type`** — mas está em uso real em `mapa-alma.ts`.

**Avaliação:** Incompatível para unificação direta. A tipagem de `upright`/`reversed` é `string` (não `string[]`) e os dados são descrições longas (não keywords). São contratos diferentes com propósitos diferentes. **Manter como está.**

---

### 5. `src/lib/tarot/shared-card-data.ts` (115 linhas) — **EXISTE, DUPLICADO**

**Propósito:** Utilitários de numerologia para cartas tarot (funções puras: `reduceToSingleDigit`, `getMasterNumbers`, `getNumerologyElement`, `getNumerologyChakra`, `getElementKeywords`, `calculateCardNumerology`).

**Interface `TarotCardBase`:**
```typescript
// ⚠️ Quase idêntica a TarotCard em cards.ts — só muda: AstroType vs string
export interface TarotCardBase {
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
```

**Diferença real vs `TarotCard`:** Nenhuma diferença de estrutura de dados. O clone group do fallow identifica "72 linhas, 3 instâncias" — o número de linhas corresponde a esta interface.

**Marcado com `fallow-ignore-next-line unused-type`** — aparentemente não tem callers externos além dos utilitários internos.

**Avaliação:** `TarotCardBase` é um clone exato de `TarotCard` exceto pelo nome. A duplicação é real mas de baixo impacto funcional. Recomenda-se refatorar para usar `TarotCard` de `cards.ts` em vez de manter a interface local.

---

## Tipos Encontrados

| Nome | Arquivo | Campos | Status |
|------|---------|--------|--------|
| `TarotCard` | `cards.ts` | `id, name, arcana, suit?, number?, element?, astro?, upright: string[], reversed: string[]` | **Canônico** — usado em 5+ rotas |
| `TarotDeck` | `cards.ts` | `{ cards: TarotCard[] }` | **Canônico** — usado em 3+ rotas |
| `TarotCardBase` | `shared-card-data.ts` | **Idêntico a TarotCard** | **Duplicado** — não usado ativamente |
| `TarotDeck` | `meanings.ts` | `{ majorArcana: CardMeaning[], minorArcana: {...} }` | **Incompatível** — formato diferente |
| `CardMeaning` | `meanings.ts` | `name, upright: string, reversed: string` | **Incompatível** — tipos diferentes |

---

## Recomendação

### Ação 1: `shared-card-data.ts` → usar `TarotCard` de `cards.ts`

**Arquivo:** `src/lib/tarot/shared-card-data.ts`

Substituir `TarotCardBase` por um import de `TarotCard` de `cards.ts`:
```typescript
import type { TarotCard } from './cards';
```

Remover a definição de `TarotCardBase` local. Se `TarotCardNumerology` precisar de referência, usar `TarotCard['id']` ou um alias.

**Impacto:** Baixo — `shared-card-data.ts` não tem callers externos evidentes. Verificar antes de mudar.

### Ação 2: NÃO tocar em `meanings.ts`

A interface `CardMeaning` e `TarotDeck` em `meanings.ts` usam tipos incompatíveis (`string` vs `string[]` para `upright`/`reversed`). Unificar quebraria os callers existentes em `mapa-alma.ts`. Manter como está.

### Ação 3: NÃO criar `types.ts` canônico agora

`cards.ts` já serve como fonte canônica. Não há necessidade de criar um arquivo `types.ts` intermediário que adicionaria mais uma camada de indireção. A simplicidade atual é preferível.

### Resumo da Viabilidade

| Opção | Viável? | Motivo |
|-------|---------|--------|
| Unificar `TarotCard` e `TarotCardBase` | ✅ Sim | Estrutura idêntica — só renomear e importar |
| Unificar `TarotDeck` de `cards.ts` com `meanings.ts` | ❌ Não | Formatos incompatíveis (`cards[]` vs nested) |
| Extrair tipo base compartilhado para `types.ts` | ⚠️ Parcial | Adiciona indireção desnecessária; `cards.ts` já funciona |
| Touchar nos dados de `cards.ts` | ❌ Não | 5+ callers ativos; dados canônicos |

**Conclusão final: PARCIAL.** Apenas a duplicação de `TarotCardBase` em `shared-card-data.ts` é recuperável via simples refatoração de import. Os demais são padrões distintos com propósitos diferentes que não devem ser unificados.
