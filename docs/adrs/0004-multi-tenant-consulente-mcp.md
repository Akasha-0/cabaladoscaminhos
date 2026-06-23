# 0004 — Multi-tenant consulente-MCP (arquitetura)

**Status:** accepted (2026-06-23, vision realignment session + research approval)

**Research basis:** `/home/skynet/cabala-dos-caminhos/.hermes/plans/research-rag-multitenant-2026-06-23.md` (607 lines, 9 sections + citations).

## Stack Tecnica Aprovada (do Research 1)

### Vector store: **pgvector** (ja em producao)

**Razao:** Tabela `grimoire` ja tem `vector(768)` embeddings em producao (migration `20260611000000_init_akasha_v3/`). Migrar para Qdrant/Weaviate adiciona servico + complexidade LGPD-sync sem ganho.

### Embeddings: **`@xenova/transformers`** (self-hosted)

**Razao:** Consulentes tem dados sensiveis (anamnese, Orixa, saude relevante). Enviar pra OpenAI API = transferencia internacional de dado = LGPD violation. `@xenova/transformers` roda localmente em Node.js sem chamar API externa.

**Modelo recomendado:** `Xenova/multilingual-e5-base` ou `Xenova/paraphrase-multilingual-mpnet-base-v2` (768d, multilingue incluindo PT-BR).

**Trade-off:** ~250MB de model download no deploy. Aceitavel (one-time cost).

### Multi-tenant isolation: **App-layer `withCaminhanteContext()` proxy**

**Razao:** ADR 0004 ja rejeitou Postgres RLS (decisao tua). Helper de aplicacao e mais simples de auditar e menos propenso a bugs de permissao.

```typescript
// Pseudocodigo
const prisma = new PrismaClient()
  .$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query, operation, model }) {
          // Injeta zeladorId + caminhanteId em toda query
          const ctx = getCaminhanteContext()
          if (!ctx) throw new Error('Caminhante context required')
          
          // Bloqueia acesso cross-tenant
          if (args.where) {
            args.where.zeladorId = ctx.zeladorId
            if (modelHasCaminhanteId(model)) {
              args.where.caminhanteId = ctx.caminhanteId
            }
          }
          return query(args)
        },
      },
    },
  })
```

### Chat framework: **Vercel AI SDK `streamUI`**

**Razao:** ADR 0003 requer chain-of-thought visivel ao Zelador. `streamUI` renderiza resposta em 2 partes: raciocinio colapsavel + resposta final. Compat com Next.js 16 App Router.

### Retrieval: **Weighted UNION ALL** (em vez de grafo real)

```sql
-- Pesos:
-- grimorio pessoal do consulente: 1.0
-- historico de sessoes: 0.8
-- grimoire global (comum): 0.4

SELECT 
  chunk_text,
  1 - (embedding <=> $query_embedding) AS score,
  'grimorio_pessoal' AS source
FROM grimorio_pessoal_chunks
WHERE zeladorId = $1 AND caminhanteId = $2
  AND 1 - (embedding <=> $query_embedding) > 0.7

UNION ALL

SELECT chunk_text, ... * 0.8, 'sessao'
FROM sessao_chunks
WHERE zeladorId = $1 AND caminhanteId = $2
  AND ...

UNION ALL

SELECT chunk_text, ... * 0.4, 'grimoire_global'
FROM grimoire_chunks
WHERE 1 - (embedding <=> $query_embedding) > 0.6

ORDER BY score DESC LIMIT 10;
```

## Modelos de Dados (Wave 2 — design proposal D-XXX)

**Estende D-041 (Caminhante + Caminhada ja deployed):**

- `Sessao` — cada consulta/chat com o Zelador. Vinculada a `Caminhada`.
- `SessaoChunk` — chunks embeddings da sessao (768d vector).
- `GrimorioPessoal` — notas, observacoes, prescricoes do Zelador sobre o consulente.
- `MapaCalculo` — cache dos 7 Pilares calculados (evita recalcular).
- `MapaRelacional` — relacoes entre consulentes (familia, trabalho). Wave 3+.

## Contexto

Apos realignment (Akasha = ferramenta do Zelador, nao SaaS pra usuario final), o modelo de dados precisa suportar:

1. **Multi-tenant**: o Zelador atende N consulentes. Cada consulente tem dados isolados (anamnese, 7 Pilares calculados, historico de sessoes, grimorios pessoais). Consulta a um consulente NAO pode vazar dados de outro.
2. **Consulente = MCP (logico)**: na interface chat, quando o Zelador clica num consulente, esse consulente vira um "MCP server logico" — o chat carrega automaticamente os grimorios pessoais, historico e prescricoes previas daquele consulente.
3. **Reuso de D-041**: D-041 ja modelou `Caminhante` (pessoa atendida pelo Zelador, sem login) + `Caminhada` (relacao) + migration aplicada em 2026-06-22. **Nao criar schema novo pra consulentes** — reusar e estender.

## Decision

**Reusar `Caminhante` (D-041) como modelo de consulente** + estender com:

### Modelo de Dados (extensoes a D-041)

- `Caminhante` (existente): pessoa atendida, sem login. Campos: nome, dataNascimento, horaNascimento, localNascimento, consents LGPD/Pilar 4.
- `Caminhada` (existente): relacao Zelador ↔ Caminhante. Container de longo prazo.
- **Novos (a definir em design proposal):**
  - `Sessao` — cada consulta/chat com o Zelador. Vinculada a `Caminhada`. Campos: data, tipo (Apresentacao/Leitura/Ritual/Aconselhamento/Integracao — D-043), notas privadas do Zelador.
  - `MapaCalculo` — cache dos 7 Pilares calculados pra aquele `Caminhante` (para evitar recalcular em cada consulta).
  - `GrimorioPessoal` — notas, observacoes, prescricoes do Zelador sobre aquele `Caminhante` (nao compartilhado com outros Zeladores).
  - `MapaRelacional` — relacoes entre Caminhantes (ex: "Maria e mae de Joao", "Pedro e colega de trabalho de Joao"). Usado pelo Mentor pra entender contexto familiar/profissional.

### Isolamento Multi-tenant

**Toda query precisa do filtro `zeladorId` + `caminhanteId` automaticamente.** Implementacao:

- **Camada de aplicacao**: helper `withCaminhanteContext(zeladorId, caminhanteId)` que injeta os filtros em todas as queries Prisma.
- **Camada de tipos**: `CaminhanteScopedQuery<T>` que exige `caminhanteId` em compile-time.
- **Testes de regressao**: suite automatica que tenta acessar dados de Caminhante X com contexto de Caminhante Y e espera erro.

### MCP Logico (chat)

**Cada `Caminhante` e um "MCP server logico"**. Quando o Zelador clica no consulente, o chat:

1. Carrega `GrimorioPessoal` do Caminhante
2. Carrega historico das ultimas N `Sessao`
3. Carrega `MapaCalculo` (cache dos 7 Pilares)
4. Injeta tudo no prompt do Mentor como contexto

**Nao usar MCP real** (Model Context Protocol do Anthropic) por enquanto — complexidade desnecessaria. "MCP logico" e apenas um pattern de carregamento de contexto.

## Consequences

**Positivo:**
- Reuso de D-041 evita criar schema paralelo (menos codigo morto).
- Isolamento multi-tenant via helper de aplicacao e' simples de auditar (1 ponto de entrada).
- "MCP logico" simplifica implementacao vs MCP real (complexo, requer protocolo).

**Negativo:**
- Helper de aplicacao e' propenso a bugs (se Zelador esquecer de usar, query vaza). Mitigacao: testes de regressao + review obrigatorio.
- `MapaRelacional` e' uma feature nova que pode ter complexidade inesperada (grafo de relacoes entre consulentes). Pode ser Wave 3+.
- **Mudanca no modelo de auth**: o Zelador precisa de login (User ja existe). Consulentes nao logam. Mas o chat precisa saber qual Zelador e qual Caminhante — contexto injetado pela UI.

## Alternatives Considered

- **Criar schema novo pra consulentes (separado de Caminhante)**: rejeitada — duplica modelo.
- **Usar MCP real (Anthropic Model Context Protocol)**: rejeitada — complexidade prematura. Pode ser Wave 4+.
- **Multi-tenant via Postgres RLS (Row Level Security)**: rejeitada — adiciona complexidade operacional sem ganho claro (helper de aplicacao ja cobre).
- **Multi-tenant via schema separado por Zelador**: rejeitada — overkill para MVP.

## Open Follow-ups

- **Design proposal** para `Sessao`, `MapaCalculo`, `GrimorioPessoal`, `MapaRelacional`. Wave 2.
- **Implementacao** do helper `withCaminhanteContext` em `apps/akasha-portal/src/lib/application/`. Wave 3.
- **Suite de testes** de regressao multi-tenant. Wave 3.
- **MCP real** (Anthropic) quando o sistema estiver maduro. Wave 4+.

## Reversibility

**Hard to reverse** (3 de 3 condicoes):
1. Mudar depois exige refazer schema + helper + testes — caro.
2. Decisao de "MCP logico vs real" nao e obvia — leitor futuro pode nao entender por que escolhemos um caminho mais simples.
3. Trade-off real entre "MCP real" (compliance com padrao Anthropic) e "MCP logico" (simplicidade).

**Pode ser revertido** com ADR reverso + migration de cleanup.
