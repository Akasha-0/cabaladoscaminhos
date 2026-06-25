---
sidebar_position: 1
title: GET/POST /api/mcp
description: HTTP transport para o servidor MCP (Model Context Protocol) via JSON-RPC 2.0.
---

# `GET` / `POST /api/mcp`

Endpoint público que expõe o **Akasha MCP Server** (Model Context
Protocol) sobre HTTP. Suporta dois padrões de uso:

- **`GET /api/mcp`** → health check + info do servidor (tools/resources/prompts registrados).
- **`POST /api/mcp`** → dispatcher JSON-RPC 2.0 (`initialize`, `ping`,
  `tools/list`, `tools/call`, `resources/list`, `resources/read`,
  `prompts/list`).

> **Wave 8.4 + Wave 12.5**: HTTP transport minimalista (sem
> `transport-http.ts`). Rate limit strict de **100 req/min por IP** para
> proteger contra abuso (endpoint público, sem auth).

## Autenticação

**Não requerida.** MCP é exposto publicamente para que agentes externos
(claudes, IDEs com MCP, etc.) possam descobrir e invocar tools Akasha.
Rate limit por IP é a única proteção.

## `GET /api/mcp`

Health check + info do servidor.

### Response

#### Sucesso — `200 OK`

```json
{
  "status": "ok",
  "server": "AkashaMcpServer",
  "tools": [
    {
      "name": "mentor.consult",
      "description": "Consulta o Mentor Akáshico com pergunta livre",
      "inputSchema": { /* JSON Schema */ }
    }
  ],
  "resources": [],
  "prompts": [],
  "version": "0.2.0-http",
  "protocol": "MCP/JSON-RPC-2.0"
}
```

#### Erros

| Status | Body | Quando |
| --- | --- | --- |
| `429` | `{ "error": "...", "retryAfterSeconds": <int> }` | Rate limit excedido. |
| `500` | `{ "status": "error", "error": "<msg>" }` | Falha ao inicializar servidor MCP. |

### Exemplo

```bash
curl https://akasha.example.com/api/mcp
```

Resposta:

```json
{
  "status": "ok",
  "server": "AkashaMcpServer",
  "tools": [],
  "resources": [],
  "prompts": [],
  "version": "0.2.0-http",
  "protocol": "MCP/JSON-RPC-2.0"
}
```

---

## `POST /api/mcp`

JSON-RPC 2.0 dispatcher. Body deve seguir o spec
[JSON-RPC 2.0](https://www.jsonrpc.org/specification).

### Request body

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `jsonrpc` | `"2.0"` | Sim | Versão do protocolo. |
| `id` | `string \| number \| null` | Não | Se ausente → **notification** (servidor responde `202` sem body). |
| `method` | `string` | Sim | Nome do método JSON-RPC. |
| `params` | `object` | Depende | Parâmetros específicos do método. |

### Métodos suportados

#### `initialize`

Handshake inicial. Retorna capabilities do servidor.

**Request:**

```json
{ "jsonrpc": "2.0", "id": 1, "method": "initialize" }
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": { "tools": {}, "resources": {}, "prompts": {} },
    "serverInfo": { "name": "akasha-mcp", "version": "0.2.0" }
  }
}
```

#### `ping`

Health check leve (não retorna erro).

**Request:** `{ "jsonrpc": "2.0", "id": 2, "method": "ping" }`

**Response:** `{ "jsonrpc": "2.0", "id": 2, "result": {} }`

#### `tools/list`

Lista tools registradas no servidor MCP.

**Request:** `{ "jsonrpc": "2.0", "id": 3, "method": "tools/list" }`

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "tools": [
      {
        "name": "mentor.consult",
        "description": "Consulta o Mentor Akáshico",
        "inputSchema": {
          "type": "object",
          "properties": {
            "question": { "type": "string", "minLength": 1, "maxLength": 2000 }
          },
          "required": ["question"]
        }
      }
    ]
  }
}
```

#### `tools/call`

Invoca uma tool registrada.

**Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "mentor.consult",
    "arguments": { "question": "O que é Tiferet?" }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Tiferet é a Sephirah da Beleza e Harmonia..."
      }
    ]
  }
}
```

#### `resources/list`, `resources/read`, `prompts/list`

Stubs no momento — retornam arrays vazios.

```json
// resources/list
{ "jsonrpc": "2.0", "id": 5, "result": { "resources": [] } }

// resources/read
{ "jsonrpc": "2.0", "id": 6, "result": { "contents": [] } }

// prompts/list
{ "jsonrpc": "2.0", "id": 7, "result": { "prompts": [] } }
```

### Códigos de erro JSON-RPC

| Code | Message | Quando |
| --- | --- | --- |
| `-32700` | `Parse error` | Body não é JSON válido. |
| `-32600` | `Invalid Request` | `jsonrpc !== "2.0"`. |
| `-32601` | `Method not found` | `method` desconhecido. |
| `-32602` | `Invalid params` | Params faltando ou inválidos (ex: `tools/call` sem `name`). |

### Erros HTTP

| Status | Quando |
| --- | --- |
| `202` | Notification (request sem `id`) — servidor processou e silenciou. |
| `400` | Body inválido ou `jsonrpc !== "2.0"`. |
| `404` | `method` desconhecido ou `prompts/get` de prompt inexistente. |
| `429` | Rate limit (100 req/min por IP). |

## Exemplos

### `initialize` + `tools/list`

```bash
# 1. Initialize
curl -X POST https://akasha.example.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize"}'

# 2. List tools
curl -X POST https://akasha.example.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

### `tools/call`

```bash
curl -X POST https://akasha.example.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "mentor.consult",
      "arguments": { "question": "O que significa Tiferet?" }
    }
  }'
```

Resposta:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{ "type": "text", "text": "Tiferet..." }]
  }
}
```

### Método desconhecido

```bash
curl -X POST https://akasha.example.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":99,"method":"foo/bar"}'
```

Resposta:

```
HTTP/1.1 404 Not Found

{
  "jsonrpc": "2.0",
  "id": 99,
  "error": { "code": -32601, "message": "Method not found: foo/bar" }
}
```

### Notification (sem `id`)

```bash
# Servidor responde 202 Accepted sem body — notification é processada silenciosamente
curl -i -X POST https://akasha.example.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"ping"}'
```

```
HTTP/1.1 202 Accepted
```

## Notas de segurança

- **Sem auth**: MCP é exposto publicamente. Considere isto ao registrar
  tools que expõem PII ou mutam dados.
- **Rate limit por IP**: 100 req/min. Identifier HMAC-hashed (LGPD-safe).
- **Singleton across HMR**: o `getMcpServer()` é cacheado em
  `globalThis.__akashaMcpServerPromise` para sobreviver a hot-reloads
  em dev.
- **HTTP, não stdio**: este endpoint é para clientes HTTP-based. Para
  integração stdio (Claude Desktop, etc.), use o pacote `@akasha/mcp`
  diretamente.

## Veja também

- [ADR — MCP server integration](../../adrs/adr-mcp.md)
- [`POST /api/mentor/ask`](../mentor/ask.md) — consumido pela tool `mentor.consult`
