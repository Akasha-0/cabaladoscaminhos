# Akasha v0.0.19 — Tarefas

## Fase 9: Evolução do Sistema (Unificação + Mobile)

### R-023 — Akasha Synthesis Framework (P0, 90min)

**Objetivo:** Definir a linguagem universal que unifica 5 Pilares em 1 sistema.

**Tarefas:**
1. Documentar 9 dimensões de vida (saúde, dinheiro, trabalho, amor, sexualidade, propósito, família, espiritualidade, superação)
2. Definir matriz de contribuição (qual pilar contribui para qual dimensão)
3. Definir "Akasha Authority" — regra de decisão: paz vs ansiedade (Corpo 3 vs 4)
4. Documentar o fluxo: dados brutos → síntese → narrativa → ação
5. Criar `.autonomous/research/synthesis/akasha-synthesis-framework.md`

**Critério:** 1 documento com framework completo, 9 dimensões, matriz de contribuição, Akasha Authority.

---

### F-223 — A "Caixa" Akasha (P0, 120min)

**Objetivo:** Página única com 9 dimensões de vida, síntese dos 5 pilares.

**Tarefas:**
1. Criar componente `components/akasha/CaixaUnificada/`
   - `DimensaoCard.tsx` — 1 card expansível por dimensão
   - `SinteseNarrativa.tsx` — mostra contribuição de cada pilar + síntese
   - `PilarBadge.tsx` — mostra qual pilar contribuiu
2. Criar página `/minha-caixa` (`app/[locale]/(akasha)/minha-caixa/page.tsx`)
3. Implementar accordion mobile-first (9 seções)
4. Desktop: grid 3x3
5. Cada dimensão busca em `significados-curados.ts` + `traducao-areas.ts`
6. Integrar com `hologram-aggregator.ts` existente

**Critério:** Usuário vê 9 dimensões com síntese prática, não 5 mapas separados.

---

### F-224 — "Meu Dia" Homepage Mobile (P0, 90min)

**Objetivo:** ONE SCREEN mobile redesign — homepage que mostra o dia sem navegação.

**Tarefas:**
1. Criar página `/meu-dia` (`app/[locale]/(akasha)/meu-dia/page.tsx`)
2. Desenhar ONE SCREEN com:
   - Saudação personalizada (nome + posição astral atual)
   - Clima energético (1 frase)
   - Prática do dia (baseada no Corpo Tântrico em tensão HOJE)
   - Janela de clareza (horário favorável hoje)
   - Alerta (o que evitar)
3. Botão "Ver minha Caixa" → link para `/minha-caixa`
4. Remover abas/navegação — tudo visível no scroll
5. Inspiração: Co-Star daily + AstroSage daily guidance

**Critério:** Homepage mobile é ONE SCREEN sem navegação entre mapas.

---

### F-225 — Sexualidade Deep Dive (P0, 120min)

**Objetivo:** Expandir conteúdo de Sexualidade de 1 frase/pilar para análise completa.

**Tarefas:**
1. Criar `lib/grimoire/sexualidade-curados.ts`
2. Expandir conteúdo por pilar:
   - **Tantra:** 11 Corpos × Sexualidade (Corpo 2 = desejo root, Corpo 6 = relacionamento, etc.)
   - **Cabala:** Números Mestres (11/22/33) + energia sexual amplificada
   - **Odu:** Padrão sexual por Odu (Ejioko = transformação profunda, etc.)
   - **Astrologia:** Venus + Marte + Lilith + Casa 8 separados + interpretação prática
   - **I Ching:** Hexagramas relevantes (Xu=31, Gen=52, Gui Mei=54)
3. Criar componente de renderização `components/akasha/SexualidadePanel/`
4. Integrar na Caixa (F-223) como dimensão "Amor & Sexualidade"

**Critério:** Sexualidade tem análise completa em todas as 5 camadas.

---

### F-226 — Narrative Generator (P1, 150min)

**Objetivo:** Motor de síntese que conecta dados brutos → narrativa de vida.

**Tarefas:**
1. Criar `lib/grimoire/narrativa-generator.ts`
2. Implementar geração de parágrafos narrativos por dimensão:
   - Input: dados brutos do mapa (life path 11, sol escorpião, etc.)
   - Output: "Você é um Canal. Seu 11 significa..."
3. Usar RAG (pgvector + Ollama) + significados-curados.ts como fonte
4. Integrar com F-223 (Caixa) — cada dimensão usa narrativa generator
5. NÃO inventa conteúdo — só sintetiza o que existe no grimoire

**Critério:** Usuário recebe parágrafo narrativo, não só números.

---

### F-227 — Akasha Authority (P1, 60min)

**Objetivo:** Framework de decisão: paz = aja, ansiedade = espere.

**Tarefas:**
1. Criar `lib/grimoire/akasha-authority.ts`
2. Implementar regra: se Corpo 4 (Mente Negativa) em tensão → "espere"
3. Criar componente UI `components/akasha/AkashaAuthorityPrompt/`
4. Mostrar antes de ações importantes (decisão de compra, decisão relacional)
5. Integrar no "Meu Dia" (F-224) como linha de orientação
6. Possível: notificação quando corpo 4 em tensão elevada

**Critério:** Usuário tem regra clara para decisões: paz vs ansiedade.

---

### F-228 — Mobile App Strategy (P1, 30min)

**Objetivo:** Decidir: PWA-first vs React Native vs Expo vs Flutter.

**Tarefas:**
1. Avaliar custo de implementação para cada opção
2. Considerar: público brasileiro (baixa renda) — Store ou web?
3. Avaliar notifications push nativas vs web push
4. Avaliar 30% fee App Store vs benefícios de discovery
5. Documentar recomendação + próximos passos

**Critério:** Decisão clara: continuar PWA ou investir em nativo.

---

## Ordem de Execução

```
R-023 → F-223 → F-224 → F-225 → F-226 → F-227 → F-228
        ↑                    ↑
        └────────────────────┘
              (F-223 antes de F-225)
```

R-023 (framework) habilita F-223 (Caixa) que usa F-225 (Sexualidade).
F-224 (Meu Dia) pode rodar em paralelo após F-223.
F-226 (Narrativa) depende de F-223.
F-227 (Authority) depende de F-224.
F-228 (Strategy) é independente.
