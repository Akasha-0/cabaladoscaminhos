# `@akasha/mcp` — Akasha MCP Server (Wave 8.4 B.3)

> **STATUS: types + in-memory registry + JSON-RPC 2.0 transport (HTTP)**
> Veja [`docs/adrs/0006-mcp-protocol.md`](../../docs/adrs/0006-mcp-protocol.md) para contexto completo.
>
> **Roadmap**:
> - Wave 7.2: types-only (ADR 0006)
> - Wave 8.4 B.1 (commit `a40cd8c6`): `AkashaMcpServer` stub (in-memory)
> - Wave 8.4 B.2 (commit `9971b7d6`): lazy `@akasha/mcp` import + Mentor fallback
> - **Wave 8.4 B.3 (current)**: real transport + dispatcher + Mentor integration

## O que é MCP?

**Model Context Protocol (MCP)** é um padrão aberto lançado pela Anthropic
em novembro de 2024 que padroniza como aplicações expõem **tools**, **resources**
e **prompts** para modelos de linguagem (e para clientes como Claude Desktop,
Cursor, Zed, Continue, etc).

Spec oficial: <https://modelcontextprotocol.io/specification/2024-11-05>

### Conceitos chave

| Conceito    | O que é                                            | Exemplo no Akasha                                    |
|-------------|----------------------------------------------------|------------------------------------------------------|
| **Tool**    | Função invocável com input tipado                  | `akasha.find_correlations(system, reference)`        |
| **Resource**| Leitura nomeada de dados via URI                   | `akasha://consulente/{id}/perfil`                    |
| **Prompt**  | Template reutilizável com argumentos               | `leitura_mandala({ consulenteId, foco })`            |
| **Transport**| JSON-RPC 2.0 sobre stdio ou HTTP+SSE              | HTTP POST `/api/mcp` (Wave 8.4 B.3)                  |

## O que está dentro (Wave 8.4 B.3)

### Módulos

- `src/index.ts` — barrel: types + classes públicas
- `src/server.ts` — `AkashaMcpServer` (in-memory registry, `registerTool`,
  `registerResource`, `registerPrompt`, `unregisterTool`)
- `src/jsonrpc.ts` — JSON-RPC 2.0 protocol (parse, error codes, helpers)
- `src/dispatcher.ts` — método dispatcher: `initialize`, `ping`,
  `tools/list`, `tools/call`, `resources/list`, `resources/read`,
  `prompts/list`, `prompts/get`
- `src/transport-http.ts` — `HttpMcpTransport` (Next.js-friendly:
  consome `Request` web e devolve `Response`)
- `src/engines.ts` — `registerMentorTools()` (wraps 5 engines
  `@akasha/core` como tools MCP)
- `src/__tests__/` — 44 unit tests + 1 smoke test

### Types públicos

- `AkashaToolContext` — multi-tenant first (zeladorId + caminhadaId)
- `AkashaTool<I, O>` — contrato de uma tool invocável
- `AkashaResource<T>` — leitura nomeada via URI
- `AkashaPrompt<A>` — template com argumentos tipados
- `AkashaJsonSchema` — subset de JSON Schema que usamos
- `AkashaMcpRegistry` — ponto de agregação (populated em runtime)
- `JsonRpcRequest`, `JsonRpcResponse` — JSON-RPC 2.0 envelopes
- `McpToolCallResult`, `McpContentBlock` — MCP canonical types

### Classes / funções runtime

- `AkashaMcpServer` — class
- `mcpServer` — singleton (process-wide)
- `HttpMcpTransport` — class
- `dispatch(server, request, options)` — função pura
- `registerMentorTools(server)` — registra 5 tools de engine
- `getRegisteredToolNames(server)` — introspection helper
- `defaultContextFactory()` — extrai `AkashaToolContext` de params

## Como rodar (B.3)

### 1. Em testes

```bash
pnpm --filter @akasha/mcp test:run
# 44 tests passing
```

### 2. Smoke test standalone

```bash
cd packages/mcp
pnpm exec tsx scripts/smoke-mcp.ts
# imprime initialize / tools/list / tools/call JSON-RPC responses
```

### 3. HTTP endpoint (no portal)

```bash
# Inicia dev server
pnpm --filter akasha-portal dev

# Health check
curl http://localhost:3000/api/mcp

# Initialize
curl -X POST http://localhost:3000/api/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize"}'

# List tools
curl -X POST http://localhost:3000/api/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

# Call a tool
curl -X POST http://localhost:3000/api/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call", \
       "params":{"name":"akasha.calculate_code_of_day","arguments":{}}}'
```

### 4. Do Mentor (in-process)

```typescript
import { mcpMentorClient } from '@akasha/mentor/mcp';

const result = await mcpMentorClient.callTool(
  'akasha.find_correlations',
  { system: 'iching', reference: '1' }
);

if (result.ok) {
  console.log(result.data);
} else {
  console.error(result.error.code, result.error.message);
}
```

## Tools registradas (B.3 default)

| Nome                             | Descrição                                                              |
|----------------------------------|------------------------------------------------------------------------|
| `mentor.list_tools`              | Introspection: lista tools registradas no server                       |
| `akasha.find_correlations`       | Cross-tradition correlations via `findCorrelations()`                  |
| `akasha.build_ritual`            | Daily ritual para um hexagrama e nível (gift/shadow/siddhi)            |
| `akasha.calculate_code_of_day`   | AkashaCode do dia (ritmo cósmico, hexagrama diário, área de vida)      |
| `akasha.interpretar_vida`        | Interpretação simbólica da vida para um hexagrama                      |

Mais tools serão adicionadas em Wave 9+ (RAG, autoridade F-227, grafo
ADR 0005, etc). Para registrar uma tool nova:

```typescript
import { mcpServer, type AkashaTool } from '@akasha/mcp';

const myTool: AkashaTool = {
  name: 'meu.pacote.minha_tool',
  description: 'Faz algo útil',
  inputSchema: { type: 'object', properties: { ... } },
  handler: async (ctx, input) => ({ ok: true, data: { ... } }),
};
mcpServer.registerTool(myTool);
```

## Convenções

1. **Multi-tenant first**: todo handler recebe `AkashaToolContext`. Nunca
   assuma "global".
2. **LGPD-friendly**: nenhuma string carrega PII cru. Logs e auditoria
   devem fazer masking na implementação runtime.
3. **Universalista**: nenhuma string visível ao usuário carrega termo
   proprietário (Human Design, Gene Keys, etc). Respeitar ADR 0002.
4. **Graceful degradation**: engines são lazy-imported. Se
   `@akasha/core` não estiver disponível, tools retornam
   `{ ok: false, error: { code: 'CORE_UNAVAILABLE' } }` em vez de throw.
5. **JSON-RPC 2.0 strict**: notifications (request sem `id`) recebem
   `202 Accepted` sem body. Erros de transporte (parse) são envelopados
   em JSON-RPC error. Erros de tool (handler-level) usam `isError: true`
   no `result`.

## Roadmap Wave 9+

- Stdio transport (CLI integration)
- Auth via `Authorization: Bearer *** (ver ADR 0004 §3.2)
- Tenant scoping real (zeladorId + caminhadaId em todos os tools)
- `notifications/tools/list_changed` para hot-reload
- Adapter fino sobre `@modelcontextprotocol/sdk` oficial (se a SDK
  for adicionada ao monorepo)
- Métricas: contador de tool calls, latência, errors

## Local Contracts

- `AkashaMcpServer.getRegistry()` retorna snapshot **frozen** (Maps
  internos copiados, top-level `Object.freeze`). Não mutar.
- `dispatch()` é função pura (sem I/O). Para HTTP use
  `HttpMcpTransport`; para stdio (Wave 9+), basta chamar `dispatch`
  diretamente.
- `parseJsonRpc()` aceita apenas requests únicos (sem batch). Batch
  fica para Wave 9+ se houver demanda.

## Work Guidance

- **1 feature = 1 commit** (conventional commits, PT-BR)
- **TypeScript estrito** (zero `any` em código novo, exceto o
  necessário para lazy imports cross-package)
- **Tests co-located**: `src/__tests__/*.test.ts`
- **Smoke test** antes de merge: `pnpm exec tsx scripts/smoke-mcp.ts`
- **Atualizar este README** quando adicionar uma tool ou mudar
  o contrato público

## Verification

```bash
# Per-package
pnpm --filter @akasha/mcp typecheck
pnpm --filter @akasha/mcp test:run    # 44 tests

# Smoke script
cd packages/mcp && pnpm exec tsx scripts/smoke-mcp.ts

# Portal integration
pnpm --filter akasha-portal typecheck
pnpm --filter akasha-portal test:run tests/api/mcp/
```

## Related Files

- `apps/akasha-portal/src/app/api/mcp/route.ts` — Next.js route handler
- `packages/mentor/src/mcp-client.ts` — Mentor in-process client
- `packages/mentor/src/api/ask/route.ts` — Mentor route (B.3 integration)
- `docs/adrs/0006-mcp-protocol.md` — ADR original (Wave 7.2)

## Child DOX Index

(Nenhum — módulo flat)
