# Akasha OS v0.0.12 — Especificação

**Data:** 2026-06-09
**Versão:** akasha-v0.0.12
**Status:** Draft

---

## 1. Why — Propósito

Criar o **Akasha OS** — o primeiro sistema operacional espiritual unificado que traduz múltiplas tradições místicas (Ifá, Cabala, I Ching, Astrologia, Tantra, Hermetismo) em recomendações práticas de vida para o usuário.

**Visão:** Ser o "Jarvis Espiritual" — um mentor diário que:
- Calcula o Código do usuário (64 arquétipos × 3 níveis)
- Indica práticas integrativas (ewé, cristais, óleos, cromoterapia)
- Entrega ritual matinal + consultas on-demand
- Sempre focado no bem-estar, alinhamento vibracional e abertura de caminhos

**Diferencial:** Não é leitura — é **orientação prática daily** baseada em guardrails éticos.

---

## 2. What — Escopo

### 2.1 Arquitetura do Sistema

```
┌─────────────────────────────────────────────┐
│               AKASHA OS                     │
│           "Jarvis Espiritual"               │
├─────────────────────────────────────────────┤
│  CÓDIGO (Raiz Espiritual)                  │
│  64 Arquétipos × 3 Níveis                 │
│  Shadow → Dom → Libertação                 │
├─────────────────────────────────────────────┤
│  SISTEMA OPERACIONAL                       │
│  Espiritualidade como tecnologia           │
│  Quizilas, preceitos, alinhamento          │
├─────────────────────────────────────────────┤
│  11 ÁREAS DE VIDA                         │
│  Mente, Emoções, Saúde, Finanças,         │
│  Trabalho, Relacionamentos, Criatividade,   │
│  Bem-estar, Paz, Propósito                 │
├─────────────────────────────────────────────┤
│  PRÁTICAS INTEGRATIVAS                     │
│  Ewé, cristais, óleos, cromoterapia        │
│  Defumação, chás, banhos, rituais         │
│  Guardrails: SIM (proteção) / NÃO (dano)  │
├─────────────────────────────────────────────┤
│  ENTREGA                                   │
│  Morning Ritual + On-Demand Chat           │
│  Motor: Híbrido (Regras + RAG)            │
└─────────────────────────────────────────────┘
```

### 2.2 Entregas Principais (3 Sprints)

| Sprint | Entrega | Descrição |
|--------|---------|-----------|
| **Sprint 1** | Código | Expandir `core-iching` com 10 Asas + dados de práticas |
| **Sprint 2** | Correlação | Criar mapa Ifá↔Hexagramas↔Sefirot↔Trigramas |
| **Sprint 3** | Práticas | Catalogar primeiras 50 práticas integrativas |

### 2.3 NÃO está no escopo

- Diagnóstico médico
- Previsão de morte/acidentes
- Manipulação de terceiros
- Pactos com entidades
- Ritual de trabalho sexual

---

## 3. Impact — Impacto Esperado

| Métrica | Antes | Depois |
|---------|-------|--------|
| Sistema de práticas | Nenhum | 50+ práticas curadas |
| Correlação entre tradições | Parcial | Mapa completo |
| Entrega ao usuário | Mentor (texto) | Ritual diário + Práticas |
| Base do Akasha OS | Frontal | Fundacional |

---

## 4. Modelo de Dados

### 4.1 Código (Raiz Espiritual)

```typescript
interface AkashaCode {
  // 64 Arquétipos (base: I Ching)
  archetype: Hexagram;           // 1-64

  // 3 Níveis de Frequência
  level: 'shadow' | 'gift' | 'siddhi';

  // Área de vida principal
  lifeArea: LifeArea;

  // Correlação com outras tradições
  correlations: {
    odu?: Odu;
    sefirah?: Sephirah;
    planet?: Planet;
    chakra?: Chakra;
  };
}

type LifeArea =
  | 'Mente'
  | 'Emoções'
  | 'Saúde'
  | 'Finanças'
  | 'Trabalho'
  | 'Relacionamentos'
  | 'Criatividade'
  | 'Bem-estar'
  | 'Paz'
  | 'Propósito';
```

### 4.2 Prática Integrativa

```typescript
interface IntegrativePractice {
  id: string;
  name: string;
  tradition: string;           // 'Ifá', 'Candomblé', 'Hermetismo', etc.
  category: PracticeCategory;

  // Correlações
  associations: {
    element?: Element;
    orixa?: string;
    color?: string;
    planet?: string;
    chakra?: number;
  };

  // Aplicação
  lifeAreas: LifeArea[];
  howTo: string;              // Como fazer
  frequency: string;           // Diário, semanal, etc.

  // Guardrails
  isSafe: boolean;
  warnings?: string[];
}

type PracticeCategory =
  | 'banho_de_ervas'
  | 'cha'
  | 'defumacao'
  | 'cristal'
  | 'cromoterapia'
  | 'oleo_essencial'
  | 'oracao'
  | 'abre_alas'
  | 'protecao';
```

### 4.3 Quizila/Preceito

```typescript
interface Quizila {
  odu: Odu;
  userId: string;
  prohibitions: string[];      // O que evitar
  obligations: string[];       // O que fazer
  origin: string;              // Tradição de origem
  warnings: string[];          // Consequências se desrespeitado
}
```

---

## 5. Motor de Correlação

### 5.1 Arquitetura Híbrida

```
┌─────────────────────────────────────────────────────┐
│              MOTOR DE CORRELAÇÃO                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐     ┌─────────────┐              │
│  │ GUARDRAILS  │     │    RAG      │              │
│  │  (Regras)   │     │   (IA)      │              │
│  └──────┬──────┘     └──────┬──────┘              │
│         │                    │                     │
│         └────────┬───────────┘                     │
│                  ▼                                  │
│         ┌─────────────────┐                        │
│         │  CORRELATOR     │                        │
│         │  ENGINE         │                        │
│         └────────┬─────────┘                        │
│                  ▼                                  │
│         ┌─────────────────┐                        │
│         │ RECOMMENDATION  │                        │
│         │ GENERATOR       │                        │
│         └─────────────────┘                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5.2 Fluxo de Recomendação

1. **Input:** Código do usuário + Área de vida + Contexto
2. **Guardrails:** Valida se prática é segura
3. **RAG:** Busca práticas mais relevantes
4. **Output:** Lista ordenada de práticas com justificativa

---

## 6. Entrega ao Usuário

### 6.1 Morning Ritual

- **Horário:** Configurável pelo usuário
- **Conteúdo:**
  - Código do dia
  - Prática principal
  - Quizilas aplicáveis
  - Afirmação do dia

### 6.2 Chat On-Demand

- Resposta a perguntas específicas
- Consulta contextual
- Recomendação de práticas

---

## 7. Guardrails Éticos

### 7.1 PERMITIDO ✅

- Banhos de ervas, chás, defumação
- Cristais, cromoterapia, aromaterapia
- Orações, afirmações
- Alinhamento de quizilas e preceitos
- Abre-alas, proteção de campo
- Práticas de abertura de caminhos

### 7.2 PROIBIDO ❌

- "Cura" de doenças (remissão médica)
- Manipulação de terceiros (feitiçaria)
- Previsão de morte ou acidentes
- Pactos com entidades
- Ritual de trabalho sexual

---

## 8. Pesquisa de Sistemas Modernos

### 8.1 Referências

| Sistema | Combinação | Padrão Relevante |
|---------|------------|------------------|
| Human Design | I Ching + Kabbalah + Astrologia | 64 gates |
| Gene Keys | I Ching + Astrologia | Shadow→Gift→Siddhi |
| Universal Structure | 15 sistemas + Razão Áurea | Taxonomia |

### 8.2 Padrões Adaptados

- **64 Arquétipos:** Base universal (já existe em I Ching)
- **3 Níveis:** Shadow → Gift → Siddhi (adaptado para Bloqueio → Dom → Libertação)
- **Práticas:** Diferencial do Akasha OS (não existe em sistemas modernos)

---

## 9. Roadmap de Implementação

| Fase | Sprint | Entrega | Status |
|------|--------|---------|--------|
| **1** | Sprint 1 | Expansão `core-iching` (10 Asas + práticas) | Pending |
| **1** | Sprint 2 | Mapa de correlações | Pending |
| **1** | Sprint 3 | Catálogo de 50 práticas | Pending |
| **2** | Sprint 4 | Motor de correlação (híbrido) | Future |
| **2** | Sprint 5 | Morning Ritual (UI) | Future |
| **3** | Sprint 6 | Chat on-demand | Future |

---

## 10. Definições

| Termo | Definição |
|-------|-----------|
| **Akasha OS** | Sistema operacional espiritual unificado |
| **Código** | Raiz espiritual do usuário (64 arquétipos × 3 níveis) |
| **Espiritualidade** | Tecnologia de busca interior |
| **Prática Integrativa** | Ritual prático de uma ou mais tradições |
| **Quizila** | Preceito/obrigação de um Odú |
| **Guardrail** | Regra inegociável de segurança |

---

## 11. Dependências

| Componente | Status |
|------------|--------|
| `packages/core-iching` | ✅ Existente (precisa expansão) |
| `packages/core-odus` | ✅ Existente |
| `packages/core-cabala` | ✅ Existente |
| `packages/core-astrology` | ✅ Existente |
| `packages/mentor` | ✅ Existente |
| RAG (embeddings) | ⚠️ Parcial |
| Grimoire de práticas | ❌ A criar |

---

## 12. Critérios de Sucesso

- [ ] `core-iching` expandido com 10 Asas
- [ ] Mapa de correlações Ifá↔Hexagrama↔Sefirot implementado
- [ ] Catálogo de 50 práticas integrativas com guardrails
- [ ] Motor de correlação híbrida funcionando
- [ ] Testes passando (`pnpm test:run`)
- [ ] Typecheck limpo (`pnpm typecheck`)
