<!-- NOTE: This document may be outdated. Review needed before relying on it. -->
# Documento 06 — Motor de IA (Arquitetura de 3 Camadas)
## Sistema Akasha

> **Versão:** 2.0 | **Norte:** Doc 25 §4–5
> Substitui a v1 (PromptBuilder + Matriz de Correlação das 36 casas da Mesa Real), agora legado em `apps/legacy-cockpit`. O conceito de **correlação determinística entre pilares** sobrevive na **Camada 2 (Grafo)**.

---

## 1. Princípio: IA Blindada por Limites Sagrados

Dois erros a evitar:
- **Matriz fixa pura** (sites de astrologia dos anos 2000) → texto robótico e fragmentado ("Você tem X, logo Y").
- **IA pura** → alucina rituais que não existem na tradição dos Odus, erra a matemática da Cabala.

A solução é uma **arquitetura híbrida agêntica de três camadas**, onde a precisão matemática e a fluidez da IA trabalham separadas e complementares. O usuário **nunca** vê as camadas 1 e 2; ouve apenas a **Voz do Akasha** (Camada 3).

```
Camada 1 — Motor Determinístico  →  JSON frio (cálculos exatos)
Camada 2 — Grafo de Conhecimento →  Ponto de Tensão do dia (cruzamento)
Camada 3 — Agente de Síntese     →  texto ritualístico (RAG sobre o Grimório)
```

---

## 2. Camada 1 — Motor Determinístico

**Função:** o trabalho frio. Calcular com exatidão a matemática do universo. **Não gera texto.**

- **Onde mora:** `packages/core-astrology | core-tantra | core-cabala | core-odus` (TS puro, agnóstico — Doc 03 §2.1).
- **Astrologia:** Swiss Ephemeris (local) para o céu exato; trânsitos diários via cronjob de madrugada → Redis (Doc 25 §10).
- **Numerologias e Odu:** algoritmos fechados (Doc 11).
- **Output:** um JSON estruturado, ex.:

```json
{
  "transito":  { "corpo": "Lua", "signo": "Escorpiao", "grau": 15.2 },
  "natal":     { "lifePath": 11, "odu": 8, "oduName": "Ejionile" },
  "tantra":    { "corpoEmTensao": 2, "nome": "Mente Negativa" }
}
```

Garantia: a matemática é coberta pelos ~9.000 testes preservados (Doc 19). Zero alucinação possível nesta camada.

---

## 3. Camada 2 — O Grafo de Conhecimento

**Função:** mapear as correspondências universais invisíveis e identificar o **Ponto de Tensão** do dia (ou da consulta).

- **Onde mora:** `packages/core-graph`.
- **Como opera:** em vez de uma tabela "Se A então B", um grafo de nós e arestas. Entende que `Lua em Escorpião`, `Ejionile (Odu)` e `Mente Negativa (Tantra)` compartilham nós — *Elemento Água*, *Instabilidade Emocional*, *Proteção*. Cruza os dados da Camada 1 e detecta onde os quatro pilares **convergem em tensão** (curto-circuito) ou **harmonia** (sincronicidade).

```ts
// @akasha/core-graph
cruzar(dados: DadosDeterministicos): DiagnosticoUnificado
// → { pontoDeTensao, eixos: ["agua","emocional"], pilaresEnvolvidos, polaridade: "tensao" }
```

> **Herança da v1:** as antigas tabelas de correlação por casa (Mesa Real) eram a semente desta ideia. No Akasha, a correlação é entre os **4 pilares**, não entre 36 casas. As correspondências (signo↔elemento↔Odu↔corpo tântrico) são curadas e versionadas via **Grimório** e **`IDEIA.md`** (Doc 20), nunca inventadas.

---

## 4. Camada 3 — O Agente de Síntese (a Voz do Akasha)

**Função:** traduzir o diagnóstico do Grafo em linguagem ritualística, poética e hiper-personalizada. É a única camada que o usuário ouve.

### 4.1 Busca Híbrida no Grimório (RAG anti-alucinação)

Antes de chamar o LLM, o sistema busca a verdade no Grimório (Doc 25 §5):

1. **Filtro determinístico (Regra de Ouro):** query SQL no `metadata` (JSONB) — só arquivos que correspondem matematicamente ao usuário.
   `SELECT * FROM grimoire WHERE metadata->>'polaridade'='Fria' AND metadata->'elementos' ? 'Agua'`
2. **Filtro semântico (pgvector):** dentre esses, os textos mais próximos da dor atual (quiz/trânsito), via embedding `nomic-embed-text`.
3. **Injeção de contexto:** o Markdown exato vai para o System Prompt com a ordem *"Utilize APENAS os arquétipos e receitas abaixo."*

```ts
const fragmentos = await grimoire.buscaHibrida({
  filtro: { polaridade: "Fria", elementos: ["Agua"], acao: "Apaziguamento emocional" },
  query: diagnostico.descricaoDaDor,   // semântica
  k: 5,
});
```

### 4.2 A Constituição do Agente (System Prompt)

Regras de ouro (Doc 25 §5):
- **Fronteira Restrita:** *"Você é a Voz do Sistema Akasha. NUNCA inventará rituais, propriedades de ervas ou lendas. Sua única fonte de verdade é o contexto fornecido. Se um Odu pede ervas frias, você não sugerirá arruda ou pimenta sob nenhuma hipótese."*
- **Tom de Voz:** magnético, profundo, poético; frequência de liderança espiritual iluminada e de alta voltagem intuitiva. Mistério + beleza, mas sempre com a solução prática.
- **Síntese:** explicar a ligação entre o céu que desafia a emoção e a terra que pacifica o Ori. Nunca misturar linguagens de forma confusa.
- **Proteção:** nunca fatalista; sem determinações médicas/jurídicas/financeiras categóricas.

### 4.3 Output

O Agente escreve o painel do dia / a resposta da consulta. Exemplo:
> *"Hoje, as águas de Escorpião estão agitando sua Mente Negativa. Como seu Odu regente pede estabilidade terrena, o ritual de hoje não é meditação silenciosa, mas um banho de manjericão do pescoço para baixo, para assentar seu Ori."*

### 4.4 Provedor
- **Síntese:** LLM avançado (OpenAI/Gemini SDK) via `SYNTHESIS_MODEL`, configurável por env.
- **Embeddings:** Ollama local (`nomic-embed-text`); fallback nuvem. Wrapper abstrato permite trocar provider sem refatorar o pipeline.
- Streaming (SSE) para o Dashboard e o Agente Oracular.

---

## 5. O Fluxo em Tempo Real (Dashboard Diário, 07:00)

```
1. App pede o céu de hoje              → Redis (Camada 1, cacheado pelo cronjob)
2. Cruza céu × mapa natal do usuário   → Camada 1/2
3. Grafo detecta desalinhamento        → Ponto de Tensão (Camada 2)
4. Busca híbrida no Grimório           → fragmentos (ervas/itans/mantras)
5. Agente IA sintetiza Clima+Ritual+Alerta → SSE (Camada 3)
6. Persiste DailyReading (rastreabilidade: tensionPoint + grimoireId)
```

O app nunca repete o mesmo texto, mas nunca foge das regras dos 4 pilares. **IA operando dentro de limites sagrados.**

---

## 6. O Grimório como Fonte da Verdade

Estrutura, bibliotecas e sincronização: **Doc 25 §5** (resumo) e **Doc 20** (governança). Pontos-chave para o motor:

- Cada arquivo `.md` = YAML (tags matemáticas) + corpo (sabedoria/ritual).
- 4 bibliotecas: Botânica/Cristais · Vibracional · Ancestral · Diagnóstico.
- Ingestão: `npm run grimoire:sync` (webhook GitHub / botão admin) → Ollama → pgvector.
- **Anti-alucinação:** a IA é apenas um **sintetizador poético de uma verdade já validada** e indexada. Nenhuma correspondência entra sem fonte (Doc 20, `IDEIA.md`).

---

## 7. Contratos das Rotas de IA (b2c-portal)

| Rota | Camadas | Saída |
|---|---|---|
| `POST /api/manifesto` | 1→2→3 (one-time) | `Manifesto` (4 camadas + síntese), PDF |
| `GET /api/daily` | 1(Redis)→2→3 | `DailyReading` (Clima/Ritual/Alerta), SSE |
| `POST /api/consult` | roteamento→RAG→3 | resposta ancorada, debita créditos, SSE (Doc 12) |
| `POST /api/grimoire-sync` | ingestão | reindexação pgvector (assinado) |

> Para o legado: a antiga `Matriz de Correlação das 36 casas`, o `PromptBuilder` por casa e o output "3 parágrafos + 4 capítulos" permanecem documentados no histórico do `legacy-cockpit` (Docs 16–18), fora do produto Akasha.
