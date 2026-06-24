# `@akasha/mcp` — Contrato MCP (Model Context Protocol)

> **STATUS: types-only (Wave 7.2 hardening). Server runtime NÃO implementado.**
> Veja [`docs/adrs/0006-mcp-protocol.md`](../../docs/adrs/0006-mcp-protocol.md) para contexto completo.

## O que é MCP?

**Model Context Protocol (MCP)** é um padrão aberto lançado pela Anthropic
em novembro de 2024 que padroniza como aplicações expõem **tools**, **resources**
e **prompts** para modelos de linguagem (e para clientes como Claude Desktop,
Cursor, Zed, Continue, etc).

Spec oficial: <https://modelcontextprotocol.io/specification/2024-11-05>

### Conceitos chave

| Conceito | O que é | Exemplo no Akasha |
|---|---|---|
| **Tool** | Função invocável com input tipado | `search_grimoire(query, limit?)` |
| **Resource** | Leitura nomeada de dados via URI | `akasha://consulente/{id}/perfil` |
| **Prompt** | Template reutilizável com argumentos | `leitura_mandala({ consulenteId, foco })` |
| **Transport** | JSON-RPC 2.0 sobre stdio ou HTTP+SSE | Definido em Wave 8 |

## Status atual (Wave 7.2)

Este pacote exporta **apenas types e interfaces TypeScript** que descrevem o
contrato. **Não há implementação de servidor.** Não há transport. Não há
handler. Não há dependência de `@modelcontextprotocol/sdk` instalada.

```ts
// ✓ Pode usar AGORA (types-only)
import type {
  AkashaTool,
  AkashaToolContext,
  AkashaResource,
  AkashaPrompt,
} from '@akasha/mcp';

// ✗ NÃO pode usar ainda (server não existe)
import { AkashaMcpServer } from '@akasha/mcp'; // → Wave 8
```

### O que está dentro

- `AkashaToolContext` — multi-tenant first (zeladorId + caminhadaId).
- `AkashaTool<I, O>` — contrato de uma tool invocável.
- `AkashaResource<T>` — leitura nomeada via URI.
- `AkashaPrompt<A>` — template com argumentos tipados.
- `AkashaMcpRegistry` — ponto de agregação (populado em Wave 8).
- `AkashaJsonSchema` — subset de JSON Schema que usamos.

### O que NÃO está dentro (Wave 8+)

- `AkashaMcpServer` (extends `Server` do SDK oficial).
- Transport handlers (stdio + HTTP/SSE).
- Mapeamento automático Zod → JSON Schema.
- Middleware de tenant context.
- Auditoria e rate limiting.
- Autenticação.

## Por que só types agora?

1. **Estabilidade do contrato**: outros packages podem implementar contra os
   tipos sem aguardar Wave 8.
2. **Documentação executável**: os types servem como contrato vivo entre
   pacotes e contribuidores.
3. **Onboarding**: devs novos entendem o papel do MCP sem precisar ler a
   spec completa.
4. **Risco zero**: nenhum código de produção depende deste pacote hoje.

## Roadmap

| Wave | Entrega |
|---|---|
| **7.2 (agora)** | Skeleton types-only + ADR 0006 |
| 8 | Server runtime + transport + tenant context |
| 9+ | Mentor consumindo tools MCP via auto-descobrimento |
| 9+ | Federação de servidores Akasha (multi-Zelador) |

## Como contribuir (antes de Wave 8)

Você pode:

- Adicionar novos types ao `src/index.ts` se necessário (ex: `AkashaAuthContext`).
- Atualizar o ADR 0006 com novas considerações.
- Criar mock tools/resources em `src/__examples__/` (Wave 8 vai puxar).

Você **não** pode (ainda):

- Adicionar dependência de runtime (`@modelcontextprotocol/sdk`).
- Criar classes ou funções executáveis (mantenha types-only).
- Modificar rotas de produção (`apps/akasha-portal/src/app/api/mentor/*`).

## Convenções

1. **Multi-tenant first**: todo handler recebe `AkashaToolContext`. Nunca
   assuma "global".
2. **LGPD-friendly**: nenhuma string carrega PII cru. Logs e auditoria
   devem fazer masking na implementação runtime.
3. **Universalista**: nenhuma string visível ao usuário carrega termo
   proprietário (Human Design, Gene Keys, etc). Respeitar ADR 0002.
4. **Snake_case**: nomes de tools/resources/prompts em `snake_case`.
5. **PT-BR first**: descrições e mensagens em PT-BR por padrão.

## Referências

- [ADR 0006 — Adoção do MCP](../../docs/adrs/0006-mcp-protocol.md)
- [ADR 0004 — Multi-tenant consulente MCP](../types/AGENTS.md)
- [MCP Spec](https://modelcontextprotocol.io/specification/2024-11-05)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
