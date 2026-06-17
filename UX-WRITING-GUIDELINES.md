# UX Writing Guidelines — Akasha Portal

## Princípios Fundamentais

### 1. DADOS TÊM SIGNIFICADO, NÃO SÃO SÓ DADOS
**Regra:** Cada informação astrológica deve ser traduzida para linguagem prática.

```tsx
// ❌ ERRADO: Dado técnico sem contexto
"Sol em Escorpião"
"Ascendente: 27° Escorpião"

// ✅ CERTO: Dado com significado prático
"Sol em Escorpião — Sua energia está intensa e transformadora hoje. 
 Use para transformar, não para competir."
```

### 2. TEXTO CURTO É REGR.A
**Regra:** O usuário deve entender em 3 segundos ou menos.

- Frases: máximo 15 palavras
- Parágrafos: máximo 3 linhas
- Use bullet points para listas
- Destaque palavras-chave com negrito

```tsx
// ❌ ERRADO: Texto denso
"Hoje é um dia de reflexão profunda onde você deve considerar cuidadosamente 
todas as opções antes de tomar qualquer decisão importante que afetará 
seu futuro a longo prazo."

// ✅ CERTO: Texto condensado
"Hoje: reflita antes de decidir.
 • Suas opções estão claras
 • Apresse-se lentamente
 • Escolha o que transforma"
```

### 3. SEMPRE TENHA UM CTA
**Regra:** Após cada informação, o usuário deve saber o que FAZER.

```tsx
// ❌ ERRADO: Só mostra dado
"Sol em Escorpião"

// ✅ CERTO: Dado + ação
"Sol em Escorpião — Use sua intensidade para transformar algo que não serve.
 → Prática: Escreva o que você quer demolir"
```

### 4. JARGÃO PRECISA DE TRADUÇÃO
**Regra:** Termos técnicos precisam de解释ação inline.

```tsx
// ❌ ERRADO: Termo técnico sem explicação
"Ascendente — como o mundo te percebe"
"Meio do Céu — seu chamado público"

// ✅ CERTO: Termo com explicação prática
"Ascendente (como te enxergam) — Leões te veem como confiante.
 Como você quer ser visto hoje?"
```

## Regras de Estilo

### Tom de Voz
- **Espiritual mas não místico demais** — Use linguagem acessível
- **Inspirador mas prático** — Não seja vago
- **Direto** —省略 palavras desnecessárias

### Hierarquia Visual
```
TÍTULO (H1/H2): 1 frase, máximo 8 palavras
SUBTÍTULO: 1 frase, máximo 12 palavras
CORPO: 2-3 frases por parágrafo
BULLETS: 1 frase por item
CTA: Verbo no infinitivo + ação específica
```

### Formatação
```tsx
// Use: Citações em itálico
<p style={{ fontStyle: 'italic' }}>
  "Sua energia está transformadora hoje"
</p>

// Use: Labels em uppercase
<span style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
  → AÇÃO
</span>

// Use: Destaque com cor para palavras-chave
<strong style={{ color: '#7C5CFF' }}>
  transformação
</strong>
```

## Padrões Comuns

### Card de Insight
```tsx
┌─────────────────────────────────────────┐
│ ✦ INSIGHT DO DIA                        │
│                                         │
│ "Sua energia está intensa e             │
│  transformadora."                       │
│                                         │
│ → Hoje: Use para transformar,           │
│   não para competir.                    │
│                                         │
│ [Ver por que]                           │
└─────────────────────────────────────────┘
```

### Tooltip Explicativo
```tsx
// Hover/tap para ver explicação
<QuestionMarkIcon /> 
// Tooltip:
// "Ascendente: como as pessoas te enxergam na primeira impressão"
```

### Lista de Ações
```tsx
// Estrutura: Ícone + Verbo + Detalhe
• ⚡ Agir: Demonstre affection de forma concreta
• 💭 Refletir: Pergunte-se o que você está evitando
• 🧘 Preservar: Não reaja ao provocações internas
```

## Anti-Padrões (NUNCA USE)

### 1. "Você é [Signo]" sem contexto
```tsx
// ❌ NUNCA
<p>Você é Sol em Escorpião</p>

// ✅ SEMPRE
<p>Seu Sol em Escorpião está ativo: você tem força para transformar,
 mas cuidado com a intensidade excessiva.</p>
```

### 2. Texto técnico sem explicação
```tsx
// ❌ NUNCA
<p>Elemental Balance: Fire 3, Earth 2, Air 1, Water 4</p>

// ✅ SEMPRE
<p>Seus elementos: Fogo forte (ação), Água dominante (emoção).
 Equilibre: mais ar para clareza mental.</p>
```

### 3. Informação sem ação
```tsx
// ❌ NUNCA
<p>Sua Lua está em Capricórnio</p>

// ✅ SEMPRE
<p>Lua em Capricórnio — suas emoções pedem estrutura.
 Hoje: organize um espaço físico para acalmar a mente.</p>
```

### 4. Parágrafos longos
```tsx
// ❌ NUNCA
<p>Muito texto aqui que continua e continua sem parar 
e cansa o usuário e ele desiste de ler...</p>

// ✅ SEMPRE - Use bullets ou dividindo em partes
<ul>
  <li>Ponto 1</li>
  <li>Ponto 2</li>
  <li>Ponto 3</li>
</ul>
```

## Checklist de Verificação

Antes de commitar textos no UI, verifique:

- [ ] O usuário sabe o que FAZER após ler?
- [ ] O texto cabe em 3 segundos de leitura?
- [ ] Termos técnicos têm explicação?
- [ ] Há um CTA claro?
- [ ] O design segue hierarquia visual?
- [ ] O texto é inspirador mas prático?
- [ ] Não há jargão desnecessário?

## Recursos

### Componentes de UX Recomendados

1. **`PlainEnglishPlanet`** — Transforma dados astrológicos em linguagem prática
2. **`QuickReadCard`** — Texto longo com bullets e expandível
3. **`NextStepNavigator`** — Passos claros com progresso
4. **`SuggestedQuestions`** — Perguntas sugeridas para Oráculo
5. **`DailyInsightCard`** — Insight principal do dia com CTA

### Arquivos de Referência

- `UX-UI-AUDIT.md` — Análise completa de UX/UI
- `SuggestedQuestions.tsx` — Componente de perguntas sugeridas
- `PlainEnglishPlanet.tsx` — Tradução de planetas para linguagem prática
- `QuickReadCard.tsx` — Texto longo com expand/collapse
- `NextStepNavigator.tsx` — Sistema de navegação por passos
- `DailyInsightCard.tsx` — Card de insight com CTA

---

*Guidelines mantidos pelo time Akasha Portal*
*Última atualização: 2026-06-17*
