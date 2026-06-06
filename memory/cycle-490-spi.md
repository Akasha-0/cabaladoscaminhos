# Cycle 490 — Investigação de Engines Paralelas (DIVERGÊNCIAS ESPIRITUAIS)

**Data:** 2026-06-03
**Status:** 🛑 **PAUSADO — AGUARDANDO DECISÃO DE DOMÍNIO**
**Branch:** `claude/docs-refactor-alignment-FOUqN`

---

## ⚠️ Resumo crítico

Eu comecei esta fase achando que era "cleanup de dead code". **Estava errado.**
Achei **2 divergências espirituais ativas** entre engines paralelas que produzem
resultados diferentes para o **mesmo input do mesmo consulente**. Risco real
para `AGENTS.md` §5 ("erros têm impacto real nas pessoas").

**Nenhuma alteração de código foi feita nesta fase.** Este documento é só
mapeamento do problema.

## TL;DR para Gabriel

Você precisa decidir:

1. **Em Numerologia — Life Path 11/22/33:**
   - `numerologia/` retorna: 4 (perde mestre)
   - `calculators/numerology-kabalah.ts` retorna: 22 (preserva mestre)
   - **Quem está certo?**

2. **Em Ifá — Odu 1 (Okaran):**
   - `odus/calculos.ts`: Exu único, 1 preceito, ebó de "Caminho/Limpeza"
   - `ifa/odu-data.ts`: Exu + Omolu, preceitos ricos, ebó rico
   - **Quem está certo? (especialmente: Exu sozinho ou Exu+Omolu?)**

Sem essas decisões, **qualquer consolidação minha pode introduzir o erro
que estou tentando remover**.

---

## Achado 1: Numerologia (cálculo de Life Path)

### Os 2 arquivos

| Aspecto | `src/lib/numerologia/calculos.ts` | `src/lib/calculators/numerology-kabalah.ts` |
|---|---|---|
| Quem importa | 15 arquivos (incluindo `spiritual-engine.ts`) | 1 arquivo em prod (`client-actions.ts`) + 6 test files |
| Algoritmo | `calcularTantrica`: soma todos os dígitos, **não preserva mestre** | `reduceToSingleDigit` com flag `keepMaster=true` |
| Retorno | `number` | `{ number, master }` |
| Outras funções | Expressão, Soul Urge, Personalidade, Pitagórica, Caldeia, Cabalística | Mission, Motivation, Impression, Native Day Gifts, Challenges, Karmic Lessons, Karmic Debts, Pinnacles, Ruling Arcana, Personal Cycles, Life Cycles, buildKabalisticMap |

### Exemplo concreto de divergência

**Data de nascimento: 01/02/1990**

```
Cálculo: 0+1+0+2+1+9+9+0 = 22

numerologia/calculos.ts:
  → calculaTantrica() → somarDigitos(22) → 2+2 = 4 ❌ (perdeu o mestre)

calculators/numerology-kabalah.ts:
  → reduceToSingleDigit(22, keepMaster=true) = 22 ✓ (preserva mestre)
```

**Resultado visível ao consulente**:
- Via cockpit (`spiritual-engine.ts` → `numerologia/`): "Seu caminho de vida é 4"
- Via criação de cliente (`client-actions.ts` → `calculators/`): "Seu caminho de vida é 22 (mestre)"

**Datas onde diverge (amostra de 90+ casos)**:
- 01/02/1990: 4 vs 22
- 01/08/1986: 6 vs 33
- 01/08/2000: 2 vs 11
- 01/11/1990: 4 vs 22
- 20/01/1990: 4 vs 22

**Estimativa**: ~10% das datas de nascimento resultam em número mestre
(11/22/33), e **todas essas pessoas** recebem orientações divergentes
dependendo do fluxo.

### Análise técnica

`calcularTantrica` (em `numerologia/`) tem nome confuso — na verdade
**não é cálculo tântrico**, é soma pitagórica sem preservação de mestre.
O nome sugere que foi "absorvido" de outra tradição mas simplificado.

`calculators/numerology-kabalah.ts` é mais robusto: preserva mestre, tem
return type explícito (`{ number, master }`), tem cobertura de testes.

### Decisão que precisa de você

| Opção | Significado | Trade-off |
|---|---|---|
| **A) Adotar `calculators/` como canônico** | Migrar `spiritual-engine.ts` e APIs para `calculators/numerology-kabalah.ts`. Preserva mestre em todos os fluxos. | Corrigido: mestre 11/22/33 vira regra. Risco: 15 imports mudam. |
| **B) Adotar `numerologia/` como canônico** | Marcar `calculators/` `@deprecated`, simplificar para perder mestre em todos os fluxos. | Mais simples, 1 import muda. Risco: 10% de consulentes perdem info de mestre. |
| **C) Manter ambos com flag explícita** | `calculateLifePath(date, { preserveMaster: true })`. UI e API declaram intenção. | Mais código, mais explícito. Risco: 2 implementações continuam. |
| **D) Outra** | Você tem fonte de autoridade (GOAL.md, IDEIA.md, fonte oral, etc.) | — |

---

## Achado 2: Ifá / Odu (Merindilogun)

### Os 2 arquivos

| Aspecto | `src/lib/odus/calculos.ts` | `src/lib/ifa/odu-data.ts` |
|---|---|---|
| Quem importa (prod) | 5 arquivos: `/api/ifa`, `/api/odus`, `/api/divination/cross-system`, `spiritual-engine.ts`, `ifa/matching.ts`, `ifa/timeline.ts` | 4 arquivos UI: `CockpitOracular.tsx`, `HouseInputPopover.tsx`, `cockpit-store.ts`, mais |
| Tipo `OduInfo` | `orixaRegente: string`, `preceitos: string[]`, `ebos: string[]` | `orixas: string[]`, `preceitos: string`, `ebo: string` |
| Cobertura | 17 odus | 18 odus |
| Quem "regula" o consulente | API + engines | UI + store |

### Exemplo concreto de divergência (Odu 1 — Okaran)

| Campo | `odus/calculos.ts` | `ifa/odu-data.ts` |
|---|---|---|
| Regentes | "Exu" (singular) | "Exu", "Omolu" (plural) |
| Preceitos | `["Cultivar a paciência", "Não agir por impulso", "Cuidar rigorosamente de Exu e dos antepassados"]` | `"Cultivar a paciência; não agir por impulso; cuidar rigorosamente de Exu e dos antepassados."` |
| Ebó | `"Ebó de Caminho/Limpeza: Despachos em encruzilhadas, moedas, pipoca e panos escuros para abrir caminhos"` | `"Ebó de Caminho/Limpeza: Despachos em encruzilhadas, moedas, pipoca e panos escuros para abrir caminhos."` |
| Elementos | "Terra/Fogo" (sem espaço) | "Terra / Fogo" (com espaço) |
| Quizilas | "Carne de porco", "Cachaça em excesso", "Andar na rua ao meio-dia" | "Carne de porco", "Cachaça em excesso", "Andar na rua ao meio-dia ou meia-noite" |

### Odu 2 — Ejiokô (suspeita de erro de copy-paste)

| Campo | `odus/calculos.ts` | `ifa/odu-data.ts` |
|---|---|---|
| Regentes | "Ibeji" | "Ibeji", "Ogum" |
| Ebó | **"Ebó de Caminho/Limpeza: Despachos em encruzilhadas, moedas, pipoca e panos escuros para abrir caminhos"** (idêntico ao Odu 1 — provável erro) | **"Ebó de Prosperidade: Doces, frutas para Ibeji, e comidas leves em praças ou jardins."** (específico para Ibeji) |

**Suspeita forte**: o ebó do Odu 2 em `odus/calculos.ts` é **idêntico ao Odu 1**,
sinal claro de copy-paste não revisado. O consulente que recebe Odu 2 via API
recebe orientação de "encruzilhadas/Exu" (que é do Odu 1, Okaran), não de
"docures/Ibeji" (que seria correto para Ejiokô).

### Decisão que precisa de você

| Opção | Significado | Trade-off |
|---|---|---|
| **A) Adotar `ifa/odu-data.ts` como canônico** | Migrar `odus/calculos.ts` e APIs para `ifa/`. Tem orixás[] plural, ebó do Odu 2 correto, etc. | Cobertura: 18 vs 17 odus. Risco: precisa portar `calcularOduNascimento`, `getQuizilasPorOdu` etc. |
| **B) Adotar `odus/calculos.ts` como canônico** | Marcar `ifa/odu-data.ts` `@deprecated`, unificar para `orixaRegente: string`. | 1 import muda. Risco: **ebó do Odu 2 errado se mantém**, consulentes recebem orientação de Exu em vez de Ibeji. |
| **C) Verificar fonte de autoridade primeiro** | Você consulta GOAL.md, IDEIA.md, ou fonte oral (terreiro, babalaô) para decidir. | Mais seguro. Bloqueia consolidação até resposta. |
| **D) Outra** | — | — |

---

## Estado da Fase 490a (numerologia cleanup)

**NÃO vou fazer 490a** (deletar `calculators/numerology-{kabalah,tantric}.ts`)
porque descobri que:
- 1 arquivo de produção (`client-actions.ts`) usa via dynamic import
- 6 test files testam funcionalidades ativas
- knip/fallow erraram ao marcar como "unused" (não rastreiam dynamic imports)

Esses calculators **são engines de domínio ativas**, não dead code.

---

## Estado da worktree

```
$ git status --short
?? .claude/
?? tests/calculators/birth-chart-precision.test.ts
```

Nenhuma alteração minha pendente. Working tree limpo.

## O que precisa acontecer antes de Fase 490b

1. **Você** consulta GOAL.md / IDEIA.md / fonte externa para decidir as
   opções A/B/C/D de cada divergência
2. **Eu** implemento a consolidação baseada na sua decisão
3. **Testes**: criar `tests/integration/same-input-same-output.test.ts` que
   prova equivalência (ou documenta divergência intencional)
4. **Migrations**: portar todos os imports para o canônico

## Sugestão de próxima ação

Se você puder consultar GOAL.md/IDEIA.md/GOAL.md e responder às 2 perguntas
(Life Path mestre, Odu 1 regente), eu retomo a Fase 490b com plano cirúrgico.
Se não puder agora, recomendo deixar como Fase 490b pendente e eu seguir
para Fase 491 (refactoring targets do fallow), que é puramente técnico
sem risco espiritual.

---

## Anexos: código exato

### `src/lib/numerologia/calculos.ts:calculateLifePath`

```typescript
export function calculateLifePath(dataNascimento: string): number {
  return calcularTantrica(dataNascimento);
}

export function calcularTantrica(dataNascimento: string): number {
  const numeros = dataNascimento.replace(/\D/g, '');
  let soma = 0;
  for (const digito of numeros) {
    soma += parseInt(digito, 10);
  }
  return somarDigitos(soma);
}
```

### `src/lib/calculators/numerology-kabalah.ts:calculateLifePath`

```typescript
export function calculateLifePath(birthDate: string): { number: number; master: boolean } {
  const digits = birthDate.replace(/\D/g, '');
  const sum = digits.split('').reduce((s, d) => s + parseInt(d, 10), 0);
  const reduced = reduceToSingleDigit(sum);
  return { number: reduced, master: isMaster(reduced) };
}

function reduceToSingleDigit(n: number, keepMaster = true): number {
  if (n <= 0) return 0;
  if (n <= 9) return n;
  if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
  // ... loop de redução
}
```

### `src/lib/odus/calculos.ts:OduInfo` (Odu 1)

```typescript
{
  numero: 1,
  nome: 'Okaran',
  significado: 'O começo, a dúvida, a insubordinação. Caminho difícil, mas de grande aprendizado.',
  elementos: 'Terra/Fogo',
  orixaRegente: 'Exu',
  quizilas: ['Carne de porco', 'Cachaça em excesso', 'Andar na rua ao meio-dia'],
  preceitos: ['Cultivar a paciência', 'Não agir por impulso', 'Cuidar rigorosamente de Exu e dos antepassados'],
  ebos: ['Ebó de Caminho/Limpeza: ...']
}
```

### `src/lib/ifa/odu-data.ts:OduInfo` (Odu 1)

```typescript
{
  numero: 1,
  nome: "Okaran",
  significado: "O começo, a dúvida, a insubordinação. ...",
  elementos: "Terra / Fogo",
  orixas: ["Exu", "Omolu"],
  quizilas: ["Carne de porco", "Cachaça em excesso", "Andar na rua ao meio-dia ou meia-noite"],
  preceitos: "Cultivar a paciência; não agir por impulso; cuidar rigorosamente de Exu e dos antepassados.",
  ebo: "Ebó de Caminho/Limpeza: ..."
}
```
