# AI Architecture - Cabala dos Caminhos

## Estado Atual da Integração IA

### 1. LLMs em Uso

| Serviço | Modelo Padrão | Configurável | Status |
|---------|--------------|--------------|--------|
| OpenAI | `gpt-4-turbo-preview` | ✅ Via `OPENAI_MODEL` | Produzir |

**Versão da SDK:** `openai@6.39.0`

### 2. Arquitetura de Serviços

```
┌─────────────────────────────────────────────────────────────┐
│                        API Routes                           │
│  /api/insights/diario    │    /api/chat/mensagem           │
└────────────┬──────────────────────┬─────────────────────────┘
             │                      │
             ▼                      ▼
┌────────────────────────┐  ┌─────────────────────────────┐
│   Insights Generator   │  │      Chat Service           │
│   (src/lib/ai/)        │  │      (src/lib/chat/)        │
└────────────┬───────────┘  └─────────────┬─────────────────┘
             │                            │
             ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Prompt System                             │
│  • gerarSystemPrompt()      • gerarContextoUsuario()        │
│  • gerarPromptInsight()     • gerarPromptChat()             │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenAI Integration                        │
│  • createChatCompletion()  • sendMessage()                  │
│  • Retry + Backoff         • Circuit Breaker                │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cache Layer                               │
│  • In-Memory Cache (12h TTL)                               │
│  • Per-user, per-day insights                               │
└─────────────────────────────────────────────────────────────┘
```

### 3. Limitações Identificadas

| Categoria | Limitação | Impacto | Prioridade |
|-----------|-----------|---------|-----------|
| **Resiliência** | Sem retry com backoff | Falhas transitórias causam erros | 🔴 Alta |
| **Resiliência** | Sem circuit breaker | Falhas em cascata | 🔴 Alta |
| **Fallback** | Sem fallback para APIs alternativas | Dependência única | 🟡 Média |
| **Cache** | In-memory apenas | Cache perdido em restart | 🟡 Média |
| **Streaming** | Sem suporte a streaming | UX bloqueante | 🟢 Baixa |
| **Custo** | Sem limites por usuário | Custos imprevisíveis | 🟡 Média |
| **Prompts** | Sem versionamento | Dificuldade em iterar | 🟢 Baixa |

### 4. Sistema de Créditos/Tokens

#### Custos por Operação

```typescript
const CUSTOS_OPERACOES = {
  insightRapido:      2,   // tokens ~500
  insightDetalhado:    5,   // tokens ~1000
  relatorioSemanal:   15,  // tokens ~2500
  relatorioMensal:    30,  // tokens ~5000
  perguntaChat:       2,   // tokens ~500
};
```

#### Configurações de Modelo

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `OPENAI_MODEL` | `gpt-4-turbo-preview` | Modelo a usar |
| `OPENAI_MAX_TOKENS` | `1000` | Máx tokens por requisição |
| `OPENAI_TEMPERATURE` | `0.7` | Criatividade (0-1) |
| `OPENAI_MAX_TOKENS_INSIGHT` | `500` | Limite para insights |

#### Fluxo de Débito

```
Usuário faz requisição
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│ Verificar       │────▶│ Créditos     │
│ Créditos        │     │ Suficientes? │
└────────┬────────┘     └───────┬──────┘
         │                       │
    ┌────┴────┐           ┌─────┴─────┐
    │   Sim   │           │   Não     │
    └────┬────┘           └─────┬─────┘
         │                     │
         ▼                     ▼
┌─────────────────┐     ┌──────────────┐
│ Executar IA    │     │ Retornar     │
│ (com retry)    │     │ Erro 402     │
└────────┬───────┘     └──────────────┘
         │
         ▼
┌─────────────────┐
│ Debitar         │
│ Créditos        │
└─────────────────┘
```

### 5. Prompts Definidos

#### Insights Diários
- **System:** Guia espiritual na tradição Cabala/Candomblé/Numerologia
- **Contexto:** Odú, ciclos numerológicos, energia do dia
- **Output Format:** TÍTULO, DESCRIÇÃO, AÇÃO, AFIRMAÇÃO, CORES, ERVAS, RITUAL, SEFIROT

#### Chat Temático

| Tema | Foco |
|------|------|
| `relacionamento` | Cabala + Candomblé |
| `trabalho` | Cabala + Numerologia |
| `dinheiro` | Cabala + Candomblé |
| `saude` | Cabala + Candomblé |
| `espiritualidade` | Cabala + Umbanda |
| `proposito` | Cabala + Numerologia |

### 6. Fallback e Resiliência

**Fallback Atual:**
- Insights: `criarInsightFallback()` - resposta genérica em português
- Chat: Erro 500 sem resposta alternativa

**Retry Atual:**
- `gerarInsightComRetry()` - máximo 2 tentativas, sem backoff

---

## Possibilidades de IA Agentica

### 1. Agente de Análisis Espiritual

**Responsabilidade:** Análise automática de mapas natais

```
┌──────────────────────────────────────────────────────────┐
│              Agente Análisis Espiritual                  │
├──────────────────────────────────────────────────────────┤
│ Entrada:                                                  │
│   • Data/Hora/Local nascimento                           │
│   • Nome + Odú de nascimento                             │
│                                                          │
│ Processamento:                                           │
│   1. Calcular posição planetária (Swiss Eph)            │
│   2. Gerar análise de casas astrológicas                │
│   3. Correlacionar com Odú e Sefirot                    │
│   4. Gerar relatório personalizado                      │
│                                                          │
│ Saída:                                                   │
│   • Mapa Natal Visual (SVG)                             │
│   • Relatório em português (~2000 tokens)               │
│   • Recomendações personalizadas                        │
│                                                          │
│ Custo Estimado: 30 créditos                              │
└──────────────────────────────────────────────────────────┘
```

**Ferramentas Necessárias:**
- Swiss Ephemeris para cálculos astronômicos
- Agente Orchestrator para coordenar múltiplas chamadas
- Cache inteligente para mapas já calculados

### 2. Agente de Rituales

**Responsabilidade:** Geração de rituales personalizados

```
┌──────────────────────────────────────────────────────────┐
│                Agente de Rituales                         │
├──────────────────────────────────────────────────────────┤
│ Entrada:                                                  │
│   • Objetivo do ritual (proteção, prosperidade, etc)     │
│   • Odú do consultante                                  │
│   • Data/Hora atual                                      │
│                                                          │
│ Processamento:                                           │
│   1. Consultar correspondências (cores, ervas, orixás)  │
│   2. Verificar quizilas do Odú                          │
│   3. Calcular momento astrológico ideal                 │
│   4. Gerar ritual personalizado                          │
│                                                          │
│ Saída:                                                   │
│   • Ritual completo com passos                          │
│   • Ingredientes necessários                             │
│   • Orações recomendadas                                 │
│   • Mantras específicos                                 │
│                                                          │
│ Custo Estimado: 5-10 créditos                            │
└──────────────────────────────────────────────────────────┘
```

### 3. Agente de Prognósticos

**Responsabilidade:** Previsões baseadas em trânsitos

```
┌──────────────────────────────────────────────────────────┐
│              Agente de Prognósticos                      │
├──────────────────────────────────────────────────────────┤
│ Entrada:                                                  │
│   • Mapa Natal do usuário                               │
│   • Período desejado (semana/mês/ano)                  │
│                                                          │
│ Processamento:                                           │
│   1. Calcular trânsitos planetários                    │
│   2. Identificar aspectos significativos                │
│   3. Correlacionar com ciclos numerológicos             │
│   4. Analisar impacto por casa astrológica              │
│                                                          │
│ Saída:                                                   │
│   • Cronograma de eventos significativos                │
│   • Períodos favoráveis/desfavoráveis                   │
│   • Ações recomendadas por período                       │
│   • Avisos de atenção (quizilas)                        │
│                                                          │
│ Custo Estimado: 15-30 créditos                           │
└──────────────────────────────────────────────────────────┘
```

### 4. Agente de Conselheiro

**Responsabilidade:** Chat espiritual inteligente com memória

```
┌──────────────────────────────────────────────────────────┐
│              Agente Conselheiro Espiritual               │
├──────────────────────────────────────────────────────────┤
│ Características:                                          │
│   • Memória de conversa (últimas 10 interações)        │
│   • Contexto espiritual persistente do usuário          │
│   • Streaming de respostas                               │
│   • Capacidade de fazer perguntas clarificadoras        │
│                                                          │
│ Modos:                                                   │
│   1. Consultas Rápidas (pergunta única)                 │
│   2. Sessão Guiada (múltiplas trocas)                  │
│   3. Acompanhamento (follow-up de insights)            │
│                                                          │
│ Melhorias Futuras:                                       │
│   • Tool use para buscar dados do usuário               │
│   • Capacidade de gerar rituais via tool               │
│   • Histórico de consultas para contexto                │
│                                                          │
│ Custo Estimado: 2 créditos por pergunta                  │
└──────────────────────────────────────────────────────────┘
```

---

## Plano de Implementação Gradual

### Fase 1: Estabilidade (Semana 1-2)
**Objetivo:** Tornar a integração existente confiável

- [x] ~~Retry com exponential backoff~~ **(IMPLEMENTADO)**
- [ ] Circuit breaker para OpenAI
- [ ] Fallback para resposta em cache
- [ ] Rate limiting mais granular
- [ ] Logging estruturado de requisições

### Fase 2: Resiliência (Semana 3-4)
**Objetivo:** Suportar falhas e otimizar custos

- [ ] Implementar Redis cache (compartilhado)
- [ ] Fallback para modelo mais barato (gpt-3.5-turbo)
- [ ] Ajustar dynamic limits baseado em saldo de créditos
- [ ] Queue para requisições pesadas

### Fase 3: Streaming (Semana 5-6)
**Objetivo:** Melhorar UX do chat

- [ ] Streaming de respostas na API
- [ ] UI de streaming no frontend
- [ ] Indicador de "digitando..."

### Fase 4: Agente Básico (Semana 7-8)
**Objetivo:** Introduzir capacidades agenticas

- [ ] Agente Conselheiro com memória
- [ ] Tool use básico (buscar dados do usuário)
- [ ] Context injection para sessões

### Fase 5: Agentes Avançados (Semana 9+)
**Objetivo:** Funcionalidades completas

- [ ] Agente de Rituales
- [ ] Agente de Prognósticos
- [ ] Agente de Análisis Espiritual

---

## Considerações de Custo/Benefício

### Custos Estimados (OpenAI GPT-4o)

| Operação | Input Tokens | Output Tokens | Custo Aproximado |
|---------|--------------|---------------|-----------------|
| Insight Diário | ~800 | ~300 | $0.01 |
| Chat Simples | ~600 | ~200 | $0.008 |
| Ritual Gerado | ~1000 | ~500 | $0.02 |
| Relatório Semanal | ~2000 | ~1000 | $0.04 |
| Mapa Natal | ~1500 | ~1500 | $0.05 |

### Estratégias de Otimização

1. **Cache Aggressivo:** Insights diários cacheados 12h
2. **Modelo Adequado:** gpt-4o-mini para tarefas simples
3. **Prompt Compression:** Reduzir contexto quando possível
4. **Batch Processing:** Agrupar análises similares

### ROI por Funcionalidade

| Funcionalidade | Custo Dev | Custo Operacional | Valor para Usuário |
|---------------|-----------|-------------------|-------------------|
| Retry/Backoff | Baixo | Nenhum | Alta |
| Circuit Breaker | Baixo | Redução de custos | Alta |
| Streaming | Médio | Similar | Muito Alta |
| Cache Redis | Médio | ~$10/mês | Alta |
| Agente Conselheiro | Alto | $0.008/msg | Muito Alta |
| Agente Rituales | Alto | $0.02/ritual | Alta |
| Agente Prognósticos | Muito Alto | $0.05/análise | Alta |

---

## Recomendações

1. **Priorizar Fase 1** antes de funcionalidades agenticas
2. **Usar gpt-4o-mini** para tarefas não-críticas
3. **Implementar cache Redis** antes de agentes avançados
4. **Monitorar custos** por usuário e por feature
5. **A/B testing** de prompts antes de escalar

