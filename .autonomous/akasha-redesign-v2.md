# AKASHA Redesign v2 — Sistema Unificado

## Princípio Central

> O Sistema Akasha NÃO é 5 tradições divididas. É um **novo sistema moderno e unificado**, criado a partir dessas tradições, traduzido em uma linguagem só, para a compreensão profunda do usuário.

**O que o usuário vê**: O Sistema Akasha. Um sistema coeso, moderno, pessoal.
**O que existe por baixo**: 5 tradições ancestrais como fonte de dados, nunca expostas diretamente.

---

## Linguagem Unificada Akasha

### Conceitos Primários (user-facing)

| Conceito Akasha | Descrição | Anteriormente |
|---|---|---|
| **Frequência** | shadow / gift / siddhi | Mantém — já é Akasha-native |
| **Área de Vida** | 6 áreas de vida universais | Mantém, renomeia se necessário |
| **Perfil Akasha** | Tipo + Autoridade + Estratégia | Anteriormente "One Profile / Tipo" |
| **Diário Akasha** | Ritual diário + reflexão | Anteriormente "Meu Dia" |
| **Núcleo** | Dom central da pessoa | Anteriormente "typeName" |
| **Prática** | Ação concreta do dia | Mantém |
| **Ritual** | Prática sagrada do dia | Mantém |

### O que REMOVE da UI

- ❌ "Pilar", "Pilares", "5 Pilares" — NUNCA exposto ao usuário
- ❌ "Cabala", "Astrologia", "Tantra", "Odu", "I Ching" — NUNCA visível ao usuário
- ❌ Labels como "Pilar 1 · Cabala · 4 séries numéricas"
- ❌ "dominantPillar" em qualquer tipo exposto ao usuário
- ❌ "sourceLabel" ou "fonte" que referencie a tradição específica
- ❌ Separações visuais por tradição (tabs, seções, colunas)

### O que MANTÉM internamente (engine only)

- ✅ `Pilar = 'cabala' | 'astrologia' | 'tantrica' | 'odu' | 'iching'` — tipo interno do synthesis engine
- ✅ `significadoPorPilar()` — função interna, não exposta na UI
- ✅ `traducaoPara()` — função interna, não exposta na UI
- ✅ Matriz de 5×9 — fonte de dados, não linguagem

### Padrão de Tradução

Quando o motor deriva um insight de 1+ tradições:
- **Se todas concordam** → "O Akasha diz que..."
- **Se há tensão** → "Há uma tensão entre forças internas: de um lado X, do outro Y. Sua escolha de hoje..."
- **Se uma tradição é mais forte** → "Seu Núcleo Akasha ressoa com a energia de [CONCEITO MODERNO]..."
- **NUNCA** → "A Cabala diz...", "O Odu ensina..."

---

## AkashaDimension — sucessor conceitual do Pilar

```typescript
// Conceito interno — não user-facing
type AkashaDimension = 'cabala' | 'astrologia' | 'tantrica' | 'odu' | 'iching';

// Conceito user-facing — o que o usuário vê
type DimensionTag = 
  | 'Ancestralidade'    // Cabala/Odu
  | 'Movimento Celeste' // Astrologia
  | 'Corpo & Energia'   // Tantra
  | 'Mutação do Caminho' // I Ching
  | 'Akasha';           // Fusão/Convergência (quando 3+ convergem)
```

Para a UI: `DimensionTag` é raramente mostrado. Só aparece no "Núcleo Akasha" expanded, como badge pequeno "源 Mov. Celeste" se o usuário expandir para ver a origem.

---

## AkashaType — DominantPillar → AkashaDimension

No `akasha-types-catalog.ts`:

```typescript
// ANTES (wrong for user-facing):
dominantPillar: 'Astrologia — Odu de criação (Ogbe, Oje, Oros)'

// DEPOIS (Akasha-native):
dominantDimension: 'Movimento Celeste' // apenas para devs/curadores
// No campo user-facing:
corePattern: 'Energia de criação e início — você ativa processos apenas pelo fato de estar presente.' // já é bom, só limpar o dominantPillar
```

`dominantPillar` é removido de `AkashaTypeProfile`. Substituído por `dimensionOrigin` (opcional, só para curadores).

---

## Áreas de Vida — Mantém 6, linguagem universal

| Key | Label Atual | Novo Label Akasha | Descrição |
|---|---|---|---|
| vitalidadeEnergia | Corpo & Vitalidade | Corpo & Energia | Saúde, sexualidade, energia vital |
| conexoesAmor | Relações & Amor | Conexões & Amor | Amor, família, vínculos |
| carreiraProsperidade | Carreira & Prosperidade | Recursos & Crescimento | Finanças, carreira, abundância |
| oriCabecaQuizilas | Mente & Propósito | Mente & Direção | Intuição, propósito, direção |
| missaoDestino | Missão & Destino | Missão & Legado | Espiritual, missão, transcendência |
| desafiosSombras | Transformação & Desafios | Transformação | Sombras, karma, superação |

---

## AreaNarrative — Linguagem Unificada

Cada `AreaNarrative` é derivada de múltiplas tradições, MAS:

**No campo `sourceLabel`:**
- ❌ "Cabala · Astrologia"  
- ✅ "Akasha" ou badge discreto com ícone

**No campo `expandedNarrative.integratedNarrative`:**
- Texto JÁ está em linguagem unificada
- Verificar se não contém frases como "a Cabala ensina", "o Odu pede"

---

## UI — Hierarquia Visual

```
Meu Dia (Diário Akasha)
├── Saudação + Data
├── Clima Energético do Dia        ← UNIFICADO (não "Lua em Leão")
├── Frequência Dominante          ← shadow/gift/siddhi
├── Área Prioritária do Dia       ← maior intensity
├── Perfil Akasha (resumo)
│   ├── Tipo + Ícone
│   ├── Estratégia
│   ├── Autoridade
│   └── Diretiva do Dia
├── Prática do Dia
├── Ritual do Dia
└── CTA → Caixa Akasha Completa

Caixa Akasha (Dashboard Completo)
├── Mandala Energético            ← UNIFICADO
├── 6 Áreas de Vida
│   ├── Frequência da Área
│   ├── Intensidade
│   ├── Padrão de Sombra
│   ├── Seu Dom
│   ├── Como chegamos aqui       ← REMOVER "Cabala/Astrologia"
│   ├── Núcleo Akasha             ← tradução unificada, não "Pilar"
│   ├── Trânsito de Hoje          ← UNIFICADO
│   ├── Prática de Hoje
│   ├── Ritual
│   └── Pergunta de Transformação
└── Decisão Diária
```

---

## Componentes a Alterar

### 1. `MyDayScreen.tsx`
- Remove "Hoje no céu" → "Clima Energético do Dia"
- Remove `moonPhase` textual reference to astrology
- Remove `AkashaAuthorityPrompt` pillar references
- Mantém: Practice, Clarity Window, Alert

### 2. `AkashaLifeAreasDashboard.tsx`
- AreaCard: Remove "Núcleo Akasha" sourceLabel pillar reference
- Remove "Como chegamos aqui" chainOfReasoning se contiver nomes de tradições
- Remove "Trânsito de Hoje" que referencia astrologia diretamente
- OneProfileCard: Remove `dominantPillar` display
- ALL labels: "Pilar" → "Origem" ou remover

### 3. `MandalaChart.tsx`
- Remove layer labels that say "Cabala", "Astrologia", etc.
- Show as unified Akasha layers: "Frequência", "Área de Vida", "Tipo"
- Element colors: Mantém, mas semanticamente "Elemento Akasha" não "Elemento Astrológico"

### 4. `akasha-types-catalog.ts`
- Remove `dominantPillar` field
- Add `dimensionOrigin` (optional, internal)
- Clean `corePattern` to not mention specific traditions

### 5. `traducao-areas.ts`
- `TRADUCOES_DETALHADO` needs CABALA and TANTRICA filled (currently empty `{}`)
- Add helper `akashaNarrative(area)` that returns unified narrative, not per-pillar

### 6. `synthesis-engine.ts` + `area-builders.ts`
- Remove `sourceLabel` that exposes pillar name
- Replace with `dimensionTag` (AkashaDimension badge, optional)

---

## Status: O que já existe vs. o que precisa ser feito

### Já existe (bom)
- ✅ 9 AkashaTypes com language moderna
- ✅ Frequency shadow/gift/siddhi (bem nomeado)
- ✅ 6 life areas (boa estrutura)
- ✅ `integratedNarrative` em AreaNarrative (já unificado)
- ✅ `AkashaSynthesis` aggregate (bom nome)
- ✅ Narrative generator com `buildKabalaNarrative`, `buildAstrologyNarrative` etc. — ESSES precisam de nomes novos: `buildFrequenciaNarrative`, `buildAncestralidadeNarrative`, etc.

### Precisa mudar
- ❌ `dominantPillar` em AkashaTypeProfile
- ❌ Labels de "Pilar" em toda UI
- ❌ `sourceLabel` que diz "Cabala · Astrologia"
- ❌ `buildKabalaNarrative`, `buildAstrologyNarrative` — nomes que expõem tradição
- ❌ TRDADUCOES_DETALHADO vazio para CABALA e TANTRICA
- ❌ MyDayScreen "Hoje no céu" (específico demais)
- ❌ MandalaChart com labels de pilar
- ❌ AreaCard "Como chegamos aqui" com nomes de tradições

---

## Fase de Implementação

**Fase 1: Data Model** (sem risco de breaking)
1. Preencher TRADUCOES_DETALHADO para CABALA e TANTRICA
2. Remover `dominantPillar` de AkashaTypeProfile, adicionar `dimensionOrigin`

**Fase 2: UI — MyDayScreen** (baixo risco)
3. Limpar MyDayScreen — remover "Hoje no céu", manter estrutura

**Fase 3: UI — Dashboard** (médio risco)
4. AreaCard — limpar sourceLabel e chainOfReasoning
5. OneProfileCard — remover dominantPillar

**Fase 4: UI — Mandala** (baixo risco)
6. MandalaChart — relabel layers

**Fase 5: Engine** (verificar depois de UI)
7. synthesis-engine — garantir que não vaza pillar names
8. Narrative generators — renomear internamente

**Fase 6: Typecheck + Fix**
<!-- UPDATED 2026-06-16: v2 loop completed -->
## Status Atualizado 2026-06-16

### Feito pelo v2 loop
 dominantPillar → dimensionOrigin em todos os tipos/UI ✅
 PILAR_NOME → DIMENSAO_NOME em InsightDoDiaPanel, SignificadoPilar, FocoDoDiaPanel, TraducaoAreaPanel ✅
 Labels Cabala/Astrologia/Tantra/Odu/I Ching removidos da UI user-facing ✅
 sintese dos 5 Pilares → síntese Akasha ✅
 Narrative generators renomeados: buildAncestralidadeNarrative, buildMovimentoCelesteNarrative, buildCorpoEnergiaNarrative, buildAncestralidadeOduNarrative ✅
 MandalaNarrative badge usa dimensionOrigin com nomes Akasha-native ✅
 Typecheck clean ✅
 AreaCard chainOfReasoning usa cleanTraditionName() ✅
 MyDayScreen já tem Clima Energético ✅

### Em progresso
 TRADUCOES_DETALHADO: astrologia, odu, iching (27 entradas) — agente em execução

### Observações
 MandalaChart tooltip 5 Koshas (Tantra Védica): educational, mantida como referência terbuka
 sourceLabel em narrative-generator: dados internos (CV numbers, planetary), não exposto diretamente
 buildPerspectivasV3: strings internas com nomes de tradições, usado pelo motor de síntese
