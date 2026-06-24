# 0006 — Adoção do MCP (Model Context Protocol) — Types + Interface Contract

**Status:** accepted (2026-06-24, Wave 7.2 hardening)

**Pesquisa base:** contexto Wave 7 (4 MCPs internos: filesystem, postgres, redis, grimoire); ADR 0004 (multi-tenant consulente MCP — stub). Padrão aberto Anthropic (2024-11).

## Context

O Akasha Portal vem crescendo em superfície de integração com modelos e ferramentas externas:

1. **Mentor (Akashico)** consulta o grimoire (352 corpus texts), o grafo de conhecimento (ADR 0005), e bases canônicas (Cabala, Astrologia, Tantra, Odu, I Ching).
2. **Agentes autônomos** (akasha-loop-daemon) precisam interagir com filesystem, Postgres, Redis e o próprio grimoire de forma padronizada.
3. **Multi-tenant**: cada Zelador precisa de um contexto isolado de consulentes, notas, sessoes (ADR 0004 — `withCaminhanteContext`).
4. **Integrações futuras** (Wave 8+): possivelmente expor capacidades do Akasha como tools para outros agentes (Claude Desktop, IDEs, outros sistemas).

Hoje cada integração é ad-hoc: SQL cru direto, scripts shell, wrappers específicos por ferramenta. Não há contrato padronizado de "tools", "resources" ou "prompts" — o que dificulta composição e auditabilidade.

O **Model Context Protocol (MCP)** é um padrão aberto lançado pela Anthropic em 2024-11 que define:

- **Tools**: funções invocáveis (input schema JSON, output tipado).
- **Resources**: leitura nomeada de dados (URI-based).
- **Prompts**: templates reutilizáveis com argumentos tipados.
- **Transport**: JSON-RPC 2.0 sobre stdio ou HTTP/SSE.
- **Sampling**: requisição de completions do LLM host (futuro).

A adoção do MCP traria interoperabilidade nativa com o ecossistema crescente (Claude Desktop, Cursor, Zed, Continue, etc) e padronizaria como o Mentor e o daemon orquestram tools internas.

## Decision

**Adotar MCP como o protocolo padrão de tools/resources/prompts no Akasha Portal**, mas **apenas nesta Wave 7.2 declarar o contrato** (types + interfaces + skeleton do package `@akasha/mcp`). A **implementação de servidor MCP real é diferida para Wave 8** (escopo separado).

**Escopo da Wave 7.2 (este ADR):**

1. **Criar `packages/mcp/` skeleton** com:
   - `package.json` (workspace, type: module, exports para tipos).
   - `src/index.ts` exportando **apenas types e interfaces TypeScript** que descrevem o contrato: `AkashaTool`, `AkashaResource`, `AkashaPrompt`, `AkashaToolContext`, etc.
   - `README.md` explicando o que é MCP e como o pacote se encaixa na arquitetura.
2. **Não criar server runtime** (sem `Server` class, sem transport handlers, sem connection logic).
3. **Não modificar rotas de produção** (`apps/akasha-portal/src/app/api/mentor/*` permanece intocado — escopo seria grande demais).
4. **Marcar o pacote como `@akasha/mcp@0.1.0-types-only`** — explicitamente "skeleton, no runtime".

**Escopo diferido para Wave 8 (não fazer aqui):**

- Implementação de `AkashaMcpServer` (extends `Server` de `@modelcontextprotocol/sdk`).
- Handlers de transporte (stdio + HTTP/SSE).
- Mapeamento das tools internas (grimoire search, knowledge graph query, perfil do consulente) → tools MCP.
- Middleware de tenant context (injetar `zeladorId`/`caminhadaId` em cada request MCP).
- Auditoria e rate limiting de chamadas MCP.
- Exposição como serviço HTTP autenticado.

## Consequences

**Positivo:**

- **Contrato declarado e versionado**: outros pacotes e a comunidade podem implementar contra os tipos `@akasha/mcp` sem aguardar Wave 8.
- **Posicionamento futuro-proofing**: quando o servidor real for implementado em Wave 8, a API pública (types) já estará estável.
- **Onboarding mais fácil**: devs novos entendem o papel do MCP no Akasha via `packages/mcp/README.md`.
- **Sem regressão**: nenhum código de produção é alterado nesta wave — risco zero de quebrar comportamento existente.
- **Alinhamento com ecossistema**: Claude Desktop, Cursor e outros clientes MCP podem consumir Akasha (futuro) sem adapter custom.

**Negativo:**

- **Skeleton pode parecer "morto"**: package sem implementação real. Mitigação: `README.md` deixa claro "types-only, server em Wave 8".
- **Tipos podem divergir da implementação real**: quando Wave 8 chegar, ajustes nos tipos podem ser breaking change. Mitigação: marcar `@akasha/mcp@0.x` como `0.1.0-types-only` no `package.json` para sinalizar instabilidade.
- **Possível overhead conceitual**: devs precisam entender MCP para contribuir. Mitigação: ADR + README explicam o mínimo necessário.
- **Não cobre auth/multi-tenant**: o contrato atual não inclui `AkashaAuthContext`. Diferido para Wave 8 quando o server real for desenhado.

## Alternatives Considered

- **Não adotar MCP, manter integrações ad-hoc**: rejeitada — cresce complexidade, perde interoperabilidade com ecossistema crescente.
- **Implementar MCP server completo agora (Wave 7.2)**: rejeitada — escopo grande demais (transport, tenant context, auditoria, error handling). Wave 7.2 é hardening (~30 min), Wave 8 tem 2-3 dias alocados para MCP server.
- **Adotar protocolo diferente (LangChain Tools, OpenAI Function Calling, etc)**: rejeitada — esses são formatos de chamada isolados, não protocolos de transporte. MCP é o único padrão aberto de cliente-servidor para tools/resources.
- **Criar apenas `types/mcp.ts` dentro de `@akasha/types`**: rejeitada — pacote dedicado facilita tree-shaking e versionamento independente. `@akasha/types` é para tipos canônicos de domínio (núcleo), não para contratos de infraestrutura.

## Open Follow-ups

- **Wave 8 — MCP server runtime**: implementar `AkashaMcpServer`, transport handlers, tool registry. Bloqueado: este ADR.
- **Wave 8 — Tenant context injection**: como passar `zeladorId`/`caminhadaId` para tools MCP sem vazar entre tenants.
- **Wave 8 — Auditoria**: cada chamada MCP deve ser logada (LGPD + debug).
- **Wave 9+ — Cliente MCP no Mentor**: substituir chamadas internas do Mentor por invocações MCP padronizadas (auto-descobrimento de tools).
- **Wave 9+ — Federation**: múltiplos servidores Akasha (por Zelador?) compondo em um host MCP único.

## Reversibility

**Easy to reverse** (1 de 3 condições):
1. Pacote ainda não tem consumidores — deletar `@akasha/mcp` é trivial.
2. Sem acoplamento com produção — zero linhas de código de produção dependem deste pacote hoje.
3. Decisão puramente arquitetural — pode ser revertida com ADR reverso + remoção do diretório.

**Pode ser revertido** com ADR reverso + `git rm -r packages/mcp/`. Custo: ~30 min.

## References

- [MCP Specification (Anthropic, 2024-11)](https://modelcontextprotocol.io/specification/2024-11-05) — protocolo aberto, JSON-RPC 2.0.
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) — SDK oficial, será dependência de runtime em Wave 8.
- ADR 0004 — Multi-tenant consulente MCP (stub conceitual prévio).
- ADR 0005 — Grafo de conhecimento (futuro resource MCP).
- ADR 0002 — Pilares 6/7 (renomeações universalistas que o MCP deve respeitar).
- `packages/mcp/README.md` — explicação operacional do pacote.
