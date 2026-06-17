# UX/UI AUDIT — Akasha Portal
**Data:** 2026-06-17  
**Auditor:** Análise de Sistema  
**Versão:** 1.0

---

## RESUMO EXECUTIVO

O Akasha Portal é um sistema espiritual complexo com 5 pilares astrológicos/esotéricos. Existem problemas CRÍTICOS de UX que fazem o usuário perder-se em textos densos sem saber o que fazer com a informação. O objetivo deve ser **transformar dados em clareza, e clareza em ação**.

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. INFORMAÇÃO SEM CONTEXTUALIZAÇÃO PRÁTICA

**Problema:** O componente `AstrologyInfoPanel.tsx` mostra "Sol em Escorpião" e dados similares SEM explicar o que isso significa para o usuário no dia a dia.

```tsx
// PROBLEMA: Mostra dado técnico sem significado prático
<span>{p.name}</span>  // "Sol"
<span>{formatDegreeToZodiac(p.degree)}</span>  // "27° Escorpião"
```

**Impacto:** O usuário vê "Sol em Escorpião" e pensa "OK... e agora? O que eu faço com isso?"

**Solução:** Criar componente `PlanetContextCard` que transforma:
- **Dado:** "Sol em Escorpião"
- **Prática:** "Hoje sua energia está intensa e transformadora. Evite decisões por impulso — use essa energia para demolir o que não serve mais."

---

### 2. TEXTOS LONGOS SEM HIERARQUIA

**Problema:** Em `SignificadoPilar.tsx`, cada pilar mostra 5 seções de texto (Essência, Missão, Sombra, Prática, Conexão). São ~400 palavras por pilar, 5 pilares = 2000 palavras de uma vez.

**Local:** `apps/akasha-portal/src/components/akasha/SignificadoPilar.tsx:70-386`

**Impacto:** O usuário scrola freneticamente tentando encontrar algo que faça sentido. Cansa. Desiste.

**Solução:** 
- Mostrar APENAS 1-2 frases resumidas inicialmente
- Botão "Ver mais" para detalhes
- Destaque VISUAL para o que é mais importante

---

### 3. JARGÃO TÉCNICO SEM EXPLICAÇÃO

**Problema:** Termos como "Ascendente", "Meio do Céu", "Casa 1-12", "Elemental Balance" não são traduzidos para linguagem compreensível.

**Local:** `AstrologyInfoPanel.tsx:53-104`

```tsx
// PROBLEMA: Termo técnico sem explicação
<Row label="Ascendente — como o mundo te percebe" value={astrology.ascendant} />
// O usuário sabe o que é Ascendente? Não.
// O que significa "como o mundo te percebe"? Talvez.

<Row label="Meio do Céu — seu chamado público" value={astrology.midheaven} />
// "Chamado público" é vago. O que isso muda no meu dia?
```

**Solução:** Criar glossário inline com tooltips e объяснения curtos.

---

### 4. DASHBOARD COM INFORMAÇÃO DEMAIS

**Problema:** O Dashboard mostra TUDO ao mesmo tempo: streaks, progresso, áreas de vida, síntese, ciclos. O usuário não sabe por onde começar.

**Local:** `apps/akasha-portal/src/components/akasha/dashboard/Dashboard.tsx:1-1000`

**Impacto:** Paralisia por análise. O usuário abre o dashboard, vê muitas informações, e fecha sem agir.

**Solução:** 
- Prioridade clara: "A coisa mais importante para hoje"
- CTAs diretos: "3 passos para hoje"
- Não mostrar tudo de uma vez

---

### 5. PÁGINA MANDALA MUITO COMPLEXA

**Problema:** A MandalaChart é visualmente impressionante mas incompreensível. 5 camadas de anéis com pontos, linhas, cores. O que o usuário deve fazer com isso?

**Local:** `apps/akasha-portal/src/components/akasha/MandalaChart.tsx:1-750`

**Impacto:** O usuário olha a mandala,很漂亮 mas não entende nada, vai para outra página.

**Solução:**
- Primeiro: Mostrar apenas 1 mensagem clara
- Segundo: A mandala como visual de fundo, não como informação principal
- Terceiro: Explicar cada camada em um tooltip/accordion

---

## 🟡 PROBLEMAS MÉDIOS

### 6. PÁGINA DIÁRIO COM 5 TELAS DESCONECTADAS

**Problema:** O Diário mostra 5 "telas" uma após a outra (Mandato, Pergunta, Ritual, Significado, Ritual). Parece um formulário, não uma experiência.

**Local:** `apps/akasha-portal/src/app/[locale]/(akasha)/diario/page.tsx:362-610`

**Solução:** Transformar em experiência FLUIDA com progresso claro e transições suaves.

---

### 7. PÁGINA ORÁCULO SEM EXPLICAÇÃO

**Problema:** O Oráculo mostra um campo de texto e espera que o usuário saiba o que perguntar. Não há sugestões, exemplos, ou contexto.

**Local:** `apps/akasha-portal/src/app/[locale]/(akasha)/oraculo/page.tsx:258-313`

```tsx
// Estado vazio atual - não há sugestões do que perguntar
<p style={{ fontStyle: 'italic' }}>
  O que você precisa compreender hoje?
</p>
```

**Solução:** Mostrar 3 sugestões de perguntas comuns baseadas no perfil do usuário.

---

### 8. PÁGINA CONEXÕES SEM VALOR CLARO

**Problema:** A análise de compatibilidade mostra scores e percentuais, mas não explica o que o usuário deve FAZER com essa informação.

**Local:** `apps/akasha-portal/src/components/akasha/ConexoesClient.tsx:1-850`

**Solução:** Focar em: "Vocês se equilibram em X. Para fortalecer: faça Y juntos."

---

### 9. INCONSISTÊNCIA DE DESIGN

**Problema:** Algumas páginas usam estilos inline, outras usam Tailwind, outras usam componentes do design system.

```tsx
// Exemplo: diario/page.tsx usa estilos inline
<div style={cardStyle(pilarInfo.cor)}>

// Enquanto dashboard usa Tailwind
<div className={"rounded-2xl border overflow-hidden..."}
```

**Solução:** Migrar para o sistema de design `Typography.tsx` e componentes reutilizáveis.

---

### 10. FALTA DE ESTADOS VAZIOS ÚTEIS

**Problema:** Quando dados estão faltando, os componentes mostram placeholders técnicos ou nada.

**Exemplo:** Se `astrology.ascendant` é null, nada é mostrado. O usuário não sabe se é um erro ou se falta dado.

---

## 🟢 SUGESTÕES DE MELHORIA

### PRIORIDADE 1: COMPONENTE "INSIGHT DO DIA"

Criar componente `InsightDoDiaPanel` que mostra:

```
┌─────────────────────────────────────────┐
│  ✦ HOJE                               │
│                                         │
│  "Sua energia está intensa e            │
│   transformadora. Use para              │
│   demolir o que não serve."             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ⚡ Ação: Demonstre affection     │   │
│  │    de forma concreta hoje.       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Ver por que] [O que evitar]          │
└─────────────────────────────────────────┘
```

**Dados:** Baseado no signo solar + planeta dominante + aspekte do dia.

---

### PRIORIDADE 2: COMPONENTE "PLAIN ENGLISH PLANET"

Transformar:

```tsx
// ANTES
"Sol em Escorpião — sua vontade central que ilumina"

// DEPOIS
"Sol em Escorpião — Você tem força de vontade poderosa hoje. 
 Use para transformar, não para competir.
 Evite: manipulação, ciúmes."
```

---

### PRIORIDADE 3: SISTEMA DE NAVEGAÇÃO "PRÓXIMO PASSO"

Cada página deve responder:
1. O que eu preciso saber HOJE? (1 frase)
2. O que eu devo FAZER? (1-3 ações)
3. Onde posso explorar mais? (opcional)

---

### PRIORIDADE 4: COMPONENTE "QUICK READ"

Para textos longos, criar componente que mostra:

```
┌─────────────────────────────────────────┐
│ 📖 Resumo Rápido                        │
│                                         │
│ • Ponto principal 1                     │
│ • Ponto principal 2                     │
│ • Ponto principal 3                     │
│                                         │
│ [Ler matéria completa ▼]                │
└─────────────────────────────────────────┘
```

---

## 📊 MATRIZ DE PRIORIDADE

| Problema | Impacto | Esforço | Prioridade |
|----------|---------|---------|------------|
| Info sem contexto | CRÍTICO | MÉDIO | P1 |
| Textos longos | CRÍTICO | ALTO | P1 |
| Jargão técnico | ALTO | BAIXO | P2 |
| Dashboard sobrecarregado | CRÍTICO | ALTO | P1 |
| Mandala confusa | ALTO | MÉDIO | P2 |
| Diário fragmentado | MÉDIO | ALTO | P3 |
| Oráculo sem guidance | ALTO | BAIXO | P2 |
| Conexões sem ação | MÉDIO | MÉDIO | P3 |
| Inconsistência design | MÉDIO | ALTO | P3 |
| Estados vazios | BAIXO | BAIXO | P4 |

---

## 🎯 COMPONENTES A CRIAR

### 1. `InsightDoDiaPanel.tsx`
- Props: `insight: string, action: string, why: string`
- Visual: Card com destaque, ícone, CTA

### 2. `PlainEnglishPlanet.tsx`
- Props: `planet: PlanetData`
- Transforma dados técnicos em linguagem prática

### 3. `QuickReadCard.tsx`
- Props: `title, bullets: string[], fullContent: string`
- Estados: collapsed (bullets), expanded (full)

### 4. `NextStepNavigator.tsx`
- Props: `steps: Step[], currentIndex: number`
- Mostra progresso e próximo passo claro

### 5. `SuggestedQuestions.tsx`
- Props: `profile: UserProfile, count: number`
- Gera 3 perguntas relevantes para o Oráculo

---

## 📝 PLANO DE AÇÃO

### FASE 1: Quick Wins (1-2 dias)
1. Adicionar tooltips com explicações em `AstrologyInfoPanel`
2. Criar `SuggestedQuestions` para Oráculo
3. Simplificar texto do Dashboard hero

### FASE 2: Componentes Novos (3-5 dias)
1. Criar `InsightDoDiaPanel`
2. Criar `PlainEnglishPlanet`
3. Criar `QuickReadCard`
4. Implementar no Dashboard

### FASE 3: Refatoração (1-2 semanas)
1. Simplificar MandalaChart
2. Refatorar Diário para experiência fluida
3. Consistente применение design system
4. Adicionar estados vazios úteis

---

## CHECKLIST DE VERIFICAÇÃO

Para cada componente novo, verificar:

- [ ] "O que o usuário deve FAZER após ver isso?"
- [ ] "Se o usuário ler apenas 5 segundos, o que ele lembra?"
- [ ] "Existe jargão que precisa de explicação?"
- [ ] "O texto cabe em 3 segundos de leitura?"
- [ ] "Há um CTA claro?"
- [ ] "O design segue o sistema?"

---

*Documento gerado via análise automática do codebase Akasha Portal*
