# Akasha v0.0.19 — Especificação

**Data:** 2026-06-12
**Versão:** akasha-v0.0.19
**Status:** ⏳ Pronta para implementação
**Base:** `.autonomous/research/synthesis/akasha-evolution-research.md` (pesquisa completa)

---

## Decisões Tomadas

| # | Decisão | Opção | Alternativa |
|---|---------|-------|-------------|
| 1 | Arquitetura de síntese | **A** — 9 dimensões de vida (saúde, dinheiro, trabalho, amor, sexualidade, propósito, família, espiritualidade, superação) | 5 dimensões por pilar |
| 2 | Estrutura "Caixa" | **A** — Uma página com 9 seções accordion | 5 abas por pilar |
| 3 | Homepage diário | **A** — ONE SCREEN mobile redesign | Múltiplas telas |
| 4 | Sexualidade | **A** — Deep dive (11 Corpos + Odus + Astrologia + I Ching + Cabala) | Mínimo viável |
| 5 | Framework decisão | **A** — "Paz vs Ansiedade" (Corpo 3 vs Corpo 4) | Heurístico complexo |
| 6 | Narrativa | **A** — RAG + significados-curados.ts como fonte | LLM puro |
| 7 | Mobile app | **A** — PWA-first + Store listing (avaliação F-228) | Rewriting nativo |

---

## 1. Why — Propósito

O Akasha hoje entrega **5 mapas separados** com conteúdo curado rico mas sem síntese. O usuário recebe "Caminho de Vida: 11" sem entender o que isso significa na prática. O objetivo é criar **UM SISTEMA UNIFICADO** — não uma ferramenta de numerologia nem um app de astrologia, mas o **Akasha**: uma tecnologia espiritual de ponta que traduz 5 tradições em linguagem universal e oferece orientação prática para todas as áreas da vida.

**Visão:** O usuário baixa o app, cadastra nome/data/local, e recebe: "Você é um Canal. Seu número 11 significa que você veio para ser o fio entre o visível e o invisível. Na sexualidade, isso significa..."

---

## 2. What — Escopo

### 2.1 Arquitetura da Síntese

```
Pilares (dados brutos)
├── Cabala (Caminho de Vida, Expressão, etc.)
├── Astrologia (Sol, Lua, Ascendente, planetas)
├── Tantra (11 Corpos)
├── Odu (Odu de nascimento)
└── I Ching (Hexagrama do Nascimento)

         ↓
   
Síntese por Dimensão (9 áreas)
├── Saúde & Vitalidade
├── Dinheiro & Recursos
├── Trabalho & Carreira
├── Amor & Sexualidade
├── Propósito & Destino
├── Família & Ancestralidade
├── Criatividade & Espiritualidade
└── Superação & Desafios

         ↓

Caixa Akasha (1 página unificada)
+ Meu Dia (1 homepage mobile)
```

### 2.2 Entregas

| # | Entrega | Descrição | Prioridade |
|---|---------|-----------|------------|
| 1 | **R-023** Synthesis Framework | Definir linguagem unificada + Akasha Authority | 🔴 |
| 2 | **F-223** Caixa Akasha | Página única com 9 dimensões de vida | 🔴 |
| 3 | **F-224** Meu Dia | Homepage mobile redesign (ONE SCREEN) | 🔴 |
| 4 | **F-225** Sexualidade Deep Dive | Conteúdo expandido em 5 camadas | 🔴 |
| 5 | **F-226** Narrative Generator | Motor de síntese que gera narrativas de vida | 🟡 |
| 6 | **F-227** Akasha Authority | Framework de decisão (paz vs ansiedade) | 🟡 |
| 7 | **F-228** Mobile Strategy | React Native vs PWA vs Expo | 🟡 |

---

## 3. NÃO está no escopo

- Rewriting nativo iOS/Android (F-228 decide; se PWA-first, permanece web)
- Implementação de notifications push nativas (futuro)
- Relacionamento entre 2 usuários (futuro)
- Journal + AI insights (futuro)
- Comparação de mapas (futuro)
- PDF do Manifesto (já existe estrutura em PRD)
- Nova arquitetura de banco de dados (D-040 pendente de aprovação)

---

## 4. Impact — Impacto Esperado

| Métrica | Antes | Depois |
|---------|-------|--------|
| Páginas do mapa | 5 separadas | 1 unificada |
| Conteúdo sexualidade | 1 frase/pilar | Análise completa |
| Narrative | "Caminho de Vida: 11" | "Você é um Canal..." |
| Homepage mobile | 5 mapas | ONE SCREEN |
| Tom | Dados brutos | Orientação prática |

---

## 5. Critérios de Sucesso

- [ ] R-023: Framework de síntese com 9 dimensões + Akasha Authority documentado
- [ ] F-223: Página "Caixa" mostra 9 dimensões com síntese de 5 pilares
- [ ] F-224: Homepage mobile é ONE SCREEN, não tem abas
- [ ] F-225: Sexualidade tem análise por pilar (5 camadas)
- [ ] F-226: Narrative Generator conecta dados → parágrafo narrativo
- [ ] F-227: Akasha Authority aparece antes de decisões importantes
- [ ] Typecheck passa
- [ ] Tests passam (suite atual verde)

---

## 6. Definições

| Termo | Definição |
|-------|-----------|
| **Caixa** | Página única com 9 dimensões de vida, síntese dos 5 pilares |
| **Meu Dia** | Homepage mobile ONE SCREEN com clima/prática/alerta do dia |
| **Akasha Authority** | Regra de decisão: "paz = aja, ansiedade = espere" (Corpo 3 vs 4) |
| **Narrative Generator** | Motor RAG que transforma dados brutos em narrativa de vida |
| **9 Dimensões** | Saúde, Dinheiro, Trabalho, Amor, Sexualidade, Propósito, Família, Espiritualidade, Superação |

---

## 7. Notas Técnicas

### 7.1 Estrutura de Arquivos

```
apps/akasha-portal/src/
├── app/[locale]/(akasha)/
│   ├── minha-caixa/           # [NOVO] /minha-caixa (F-223)
│   │   └── page.tsx          # Uma página, 9 accordion sections
│   └── meu-dia/              # [NOVO] /meu-dia (F-224) — substitui /diario
│       └── page.tsx          # ONE SCREEN mobile redesign
├── components/akasha/
│   ├── CaixaUnificada/       # [NOVO] F-223
│   │   ├── DimensaoCard.tsx  # 1 card por dimensão
│   │   └── SinteseNarrativa.tsx # RAG narrative
│   └── SexualidadeDeep/      # [NOVO] F-225
│       └── (expanded content)
├── lib/grimoire/
│   ├── sexualidade-curados.ts # [NOVO] F-225 - conteúdo expandido
│   ├── narrativa-generator.ts  # [NOVO] F-226
│   └── akasha-authority.ts   # [NOVO] F-227
```

### 7.2 Dependências

| Dependência | Uso | Status |
|-------------|-----|---------|
| pgvector (existing) | RAG para narrativa | 📦 Existe |
| Ollama (existing) | Embeddings locais | 📦 Existe |
| significados-curados.ts | Fonte de conteúdo curado | 📦 Existe |
| traducao-areas.ts | Fonte de tradução por área | 📦 Existe |

---

## 8. Referências

| Recurso | Localização | Uso |
|---------|-------------|-----|
| Pesquisa completa | `.autonomous/research/synthesis/akasha-evolution-research.md` | Base da especificação |
| Conteúdo curado | `apps/akasha-portal/src/lib/grimoire/significados-curados.ts` | 1,841 linhas de conteúdo |
| Tradução áreas | `apps/akasha-portal/src/lib/grimoire/traducao-areas.ts` | 9 áreas × 5 pilares |
| Hologram Aggregator | `apps/akasha-portal/src/lib/domain/mapa/hologram-aggregator.ts` | Framework de unificação |
| Reverse-Eng HD | `.autonomous/research/synthesis/hd-reverse-engineering.md` | R-014 como referência |
| Reverse-Eng GK | `.autonomous/research/synthesis/gk-reverse-engineering.md` | R-015 como referência |

---

## 9. Perguntas em Aberto

| # | Pergunta | Decisão Adiada Para |
|---|----------|---------------------|
| 1 | F-228 decide: PWA-first ou nativo? | Após R-028 |
| 2 | notifications push nativas? | Após F-228 |
| 3 | Relacionamento entre 2 usuários? | v0.1.0 |
