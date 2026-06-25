---
sidebar_position: 1
title: POST /api/mentor/ask
description: Streaming SSE com resposta do Mentor Akáshico — cobra 1 crédito por mensagem.
---

# `POST /api/mentor/ask`

Envia uma pergunta ao **Mentor Akáshico** e recebe a resposta em
**streaming** (Server-Sent Events). O Mentor orquestra os 5 Pilares
(Cabala, Astrologia, Tantra, Odu, I Ching) e responde de forma
contextual usando os mapas do usuário.

> **⚠️ IDOR fix (v0.85.2)**: o `userId` agora vem **apenas** do token
> autenticado. Versões anteriores aceitavam `userId` no body, permitindo
> impersonation. **Não envie `userId` no body — será ignorado.**

> **ADR-010 — credit gate neutralizado**: o gate de cobrança está
> desabilitado (`CREDIT_GATE_ENABLED=false`). A rota continua
> contabilizando no ledger (`CreditEntry`), mas **não bloqueia**
> requisições sem créditos. Para reativar, ver nota em
> `apps/akasha-portal/src/lib/application/mentor/credits.ts`.

## Autenticação

**Obrigatória**. Cookie `__Host-akasha_session` (JWT access token).

## Request

### Headers

| Header | Obrigatório | Descrição |
| --- | --- | --- |
| `Content-Type` | Sim | `application/json` |
| `Cookie: __Host-akasha_session=<jwt>` | Sim | Token de acesso. |
| `x-akasha-state` | Não | Estado emocional do consulente (mirror do cookie Wave 9.1). Valores: `em paz`, `ansioso`, `triste`, `irritado`, `confuso`, `esperancoso`, `neutro`. **Fallback** caso `emotionalState` não venha no body. |

### Body (JSON)

```json
{
  "question": "Como lidar com ansiedade na próxima lua cheia?",
  "sessionHistory": [
    { "role": "user", "content": "Tenho sentido ansiedade lately" },
    { "role": "mentor", "content": "Vamos olhar o Pilar Cabala..." }
  ],
  "emotionalState": "ansioso"
}
```

| Campo | Tipo | Obrigatório | Validação | Descrição |
| --- | --- | --- | --- | --- |
| `question` | `string` | Sim | `min(1)`, `max(2000)` | Pergunta em PT-BR ou EN. |
| `sessionHistory` | `Array<{ role, content }>` | Não | — | Histórico recente da sessão (apenas memória de curto prazo). |
| `emotionalState` | `string` | Não | Enum | Override explícito do estado emocional. Se ausente, usa `x-akasha-state` ou auto-detecta via regex no texto da pergunta. |

> **Resolução do `emotionalState`** (Wave 9.3, 3 níveis):
> 1. `body.emotionalState` (fonte primária, Zod-validated)
> 2. header `x-akasha-state`
> 3. `detectEmotion(question)` — auto-detect por regex PT-BR

### Valores válidos de `emotionalState`

`em paz` · `ansioso` · `triste` · `irritado` · `confuso` · `esperancoso` · `neutro`

## Response

### Sucesso — `200 OK` (SSE stream)

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no

data: <chunk 1>
data: <chunk 2>
...
data: [DONE]
```

> **Stream**: a resposta é entregue incrementalmente. Cada chunk é
> uma string UTF-8 do texto sendo gerado pelo Mentor. Use um cliente
> SSE ou leia com `fetch().body.getReader()`.

> **Cobrança de crédito**: o crédito (`delta=-1`, `reason='mentor_chat'`)
> é deduzido **após o stream terminar com sucesso**. Se o stream
> falhar no meio, **não há cobrança**.

### Erros

| Status | Body | Quando |
| --- | --- | --- |
| `400` | `{ "error": "question is required" }` | Body sem `question` ou `question.length < 1`. |
| `400` | `{ "error": "Não foi possível carregar os mapas do usuário" }` | Falha ao carregar `Mandala`/`Mapa` do DB (perfil incompleto, etc.). |
| `401` | `{ "error": "Unauthorized" }` | Sem cookie ou JWT inválido. |
| `402` | `{ "error": "Você não tem créditos suficientes..." }` | Saldo de créditos insuficiente. **(Gate neutralizado via ADR-010 — não ocorre em produção atualmente.)** |
| `429` | `{ "error": "Muitas perguntas..." }` | Rate limit excedido (ver `MENTOR_RATE_LIMIT_CONFIG`). |
| `500` | `{ "error": "Internal server error" }` | Erro inesperado fora do handler de stream. |

## Exemplos

### Pergunta simples (curl + streaming)

```bash
curl -N -X POST https://akasha.example.com/api/mentor/ask \
  -H "Content-Type: application/json" \
  -H "Cookie: __Host-akasha_session=eyJ..." \
  -d '{
    "question": "O que meu Pilar Cabala diz sobre o próximo mês?",
    "emotionalState": "em paz"
  }'
```

Resposta (streaming, prefixo `data:` omitido):

```
Olhando para a sua Árvore da Vida...

Sua Sephirah de Tiferet está em destaque este mês...

[DONE]
```

### Com histórico de sessão

```bash
curl -N -X POST https://akasha.example.com/api/akasha/mentor/ask \
  -H "Content-Type: application/json" \
  -H "Cookie: __Host-akasha_session=eyJ..." \
  -d '{
    "question": "E quanto ao Pilar Tantra?",
    "sessionHistory": [
      { "role": "user", "content": "Como meu Pilar Cabala me influencia hoje?" },
      { "role": "mentor", "content": "Sua Tiferet está em destaque..." }
    ],
    "emotionalState": "confuso"
  }'
```

### Sem créditos (402 — comportamento documentado, não ocorre hoje)

```json
{
  "error": "Você não tem créditos suficientes. Adquira mais para continuar usando o Akáshico."
}
```

### Rate limit (429)

```json
{
  "error": "Muitas perguntas ao Mentor. Aguarde alguns minutos antes de tentar novamente."
}
```

## Notas de implementação

- **Streaming SSE**: usa `ReadableStream` do Web Streams API + `TextEncoder`.
- **MCP integration** (Wave 8.4 B.2): a rota tenta carregar tools MCP
  registradas via `getMcpServer().getRegistry()`. Quando há tools
  `mentor.*`, atualmente loga e segue pelo caminho **direct LLM**
  (tool dispatch será ativado em Wave 9+).
- **Auto-detect de emoção** (Wave 9.3): regex PT-BR identifica gatilhos
  como "ansioso", "triste", "perdido" e injeta o estado emocional no
  prompt do LLM.
- **Logs estruturados**: cada request emite logs com `requestId`
  (`x-request-id`), `userId`, `emotion`, `durationMs`.

## Veja também

- [Arquitetura — Mentor pipeline](../../architecture/mentor.md)
- [MCP JSON-RPC](../mcp/tools.md)
