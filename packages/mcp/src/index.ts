/**
 * @akasha/mcp — Contrato MCP (Model Context Protocol) do Akasha
 *
 * **STATUS: types-only (Wave 7.2 hardening). Server runtime NÃO implementado.**
 * Veja `docs/adrs/0006-mcp-protocol.md` para contexto e roadmap.
 *
 * Este arquivo exporta APENAS types e interfaces TypeScript que descrevem
 * o contrato do MCP no contexto do Akasha Portal. Nenhuma implementação
 * de servidor, transport ou handler está presente.
 *
 * **Implementação real (server) → Wave 8.**
 * Quando o server for implementado, ele estenderá `Server` de
 * `@modelcontextprotocol/sdk` e usará estes tipos como contratos públicos.
 *
 * ----------------------------------------------------------------------------
 * SOBRE MCP (Model Context Protocol)
 * ----------------------------------------------------------------------------
 *
 * MCP é um padrão aberto lançado pela Anthropic em 2024-11 que define como
 * aplicações expõem tools, resources e prompts para modelos de linguagem
 * (e para clientes como Claude Desktop, Cursor, Zed, etc).
 *
 * Spec: https://modelcontextprotocol.io/specification/2024-11-05
 *
 * **Tools** = funções invocáveis (com JSON Schema de input + tipo de output).
 *   Ex: `search_grimoire(query: string, limit?: number): GrimoireHit[]`
 *
 * **Resources** = leitura nomeada de dados via URI.
 *   Ex: `akasha://consulente/{caminhadaId}/perfil` → JSON do consulente.
 *
 * **Prompts** = templates reutilizáveis com argumentos tipados.
 *   Ex: `leitura_mandala({ consulenteId, foco }): Message[]`
 *
 * **Transport** = JSON-RPC 2.0 sobre stdio (local) ou HTTP+SSE (remoto).
 *
 * ----------------------------------------------------------------------------
 * COMO O AKASHA USA MCP (futuro, Wave 8+)
 * ----------------------------------------------------------------------------
 *
 * O Akasha Portal pretende expor, via MCP:
 *
 * - **Tools internas do Mentor** (RAG, correlação entre mapas, busca no
 *   grafo de conhecimento ADR 0005, cálculo de autoridade F-227).
 * - **Resources do consulente** (perfil, mapas, notas, sessões) — gated
 *   por tenant context (zeladorId + caminhadaId, ver ADR 0004).
 * - **Resources do grimoire** (352 corpus texts indexados).
 * - **Prompts reutilizáveis** (abertura de sessão, integração pós-ritual,
 *   síntese de leitura mandala).
 *
 * Consumidores futuros:
 * - Mentor (packages/mentor/) consumindo tools MCP padronizadas.
 * - Daemon autônomo (akasha-loop-daemon) usando resources MCP em vez de
 *   SQL cru.
 * - Clientes externos (Claude Desktop, IDEs) consumindo Akasha via MCP
 *   autenticado.
 *
 * ----------------------------------------------------------------------------
 * NOTAS DE DESIGN
 * ----------------------------------------------------------------------------
 *
 * 1. **Multi-tenant first**: todo tool/resource recebe `AkashaToolContext`
 *    (zeladorId + caminhadaId + consulenteId opcional). Nunca assuma
 *    "global" — toda chamada é escopada.
 *
 * 2. **LGPD-friendly**: nenhum campo do contexto carrega PII cru. A camada
 *    de implementação (Wave 8) deve aplicar masking em logs e auditoria.
 *
 * 3. **Universalista**: nenhuma string visível ao usuário carrega termo
 *    proprietário (Human Design, Gene Keys, etc). Respeitar ADR 0002
 *    (renomeações).
 *
 * 4. **Versionamento**: este contrato é `0.1.0-types-only`. Breaking
 *    changes são permitidos até `1.0.0` (alinhado com lançamento do
 *    server real em Wave 8).
 */

// ============================================================================
// CONTEXTO (sempre obrigatório em tools/resources)
// ============================================================================

/**
 * Contexto de invocação MCP no Akasha.
 *
 * Toda tool/resource recebe este objeto como primeiro parâmetro, garantindo
 * isolamento por Zelador e (opcionalmente) por consulente. A camada de
 * transporte (Wave 8) é responsável por popular este contexto a partir da
 * autenticação e headers MCP.
 *
 * Não carrega PII (nome, email, data nascimento). Apenas IDs.
 */
export interface AkashaToolContext {
  /** ID do Zelador (dono da conta). Obrigatório. */
  readonly zeladorId: string;

  /**
   * ID da Caminhada (consulente). Opcional — tools globais (ex: listar
   * todos os consulentes do Zelador) operam sem caminhada.
   */
  readonly caminhadaId?: string;

  /**
   * ID do consulente específico (se diferente de `caminhadaId`). Usado
   * em tools que referenciam uma terceira pessoa (ex: comparação entre
   * dois consulentes).
   */
  readonly consulenteId?: string;

  /**
   * Request ID para tracing e auditoria. Gerado pelo transport MCP.
   */
  readonly requestId: string;

  /**
   * Locale do cliente (ex: 'pt-BR'). Usado para i18n de mensagens de erro
   * e formatação de datas/números.
   */
  readonly locale?: string;
}

// ============================================================================
// TOOLS (funções invocáveis)
// ============================================================================

/**
 * Definição de uma Tool MCP no padrão Akasha.
 *
 * Inspirado em JSON Schema para `input` e em tipos TypeScript para `output`.
 * A implementação runtime (Wave 8) converterá para `Tool` do SDK MCP.
 */
export interface AkashaTool<I = unknown, O = unknown> {
  /** Identificador único (snake_case, escopado ao namespace Akasha). */
  readonly name: string;

  /** Descrição legível por LLM (1-3 frases, em PT-BR por padrão). */
  readonly description: string;

  /** JSON Schema do input. Usar `zod-to-json-schema` na implementação. */
  readonly inputSchema: AkashaJsonSchema;

  /** Função executora. Recebe contexto validado + input validado. */
  readonly handler: (ctx: AkashaToolContext, input: I) => Promise<AkashaToolResult<O>>;
}

/**
 * Resultado de uma tool. MCP exige estrutura JSON-serializável.
 */
export type AkashaToolResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AkashaToolError };

/**
 * Erro estruturado de uma tool. Não vaza stack traces ao cliente.
 */
export interface AkashaToolError {
  /** Código de erro estável (snake_case). Ex: `CONSULENTE_NOT_FOUND`. */
  readonly code: string;

  /** Mensagem human-readable, localizada em `ctx.locale`. */
  readonly message: string;

  /**
   * Detalhes adicionais estruturados (ex: campo que falhou validação).
   * Nunca incluir PII cru ou stack traces.
   */
  readonly details?: Record<string, unknown>;
}

// ============================================================================
// RESOURCES (leitura nomeada via URI)
// ============================================================================

/**
 * Identificador URI de um resource MCP no Akasha.
 *
 * Convenção:
 * - `akasha://consulente/{caminhadaId}/perfil` → perfil completo.
 * - `akasha://consulente/{caminhadaId}/mapas` → 5 mapas calculados.
 * - `akasha://grimoire/{corpusId}` → texto do corpus (352 disponíveis).
 * - `akasha://grafoconexoes/{zeladorId}` → grafo ADR 0005.
 *
 * Implementação Wave 8 deve validar que o `zeladorId` do contexto tem
 * permissão sobre o resource (multi-tenant).
 */
export type AkashaResourceUri = string;

/**
 * Definição de um Resource MCP.
 */
export interface AkashaResource<T = unknown> {
  /** URI canônica do resource (ver `AkashaResourceUri`). */
  readonly uri: AkashaResourceUri;

  /** Nome human-readable (PT-BR por padrão). */
  readonly name: string;

  /** Descrição para clientes LLM. */
  readonly description?: string;

  /** MIME type do conteúdo. Default: `application/json`. */
  readonly mimeType?: string;

  /** Função de leitura. Pode retornar streaming no futuro. */
  readonly reader: (ctx: AkashaToolContext) => Promise<T>;
}

// ============================================================================
// PROMPTS (templates reutilizáveis)
// ============================================================================

/**
 * Argumentos tipados de um prompt.
 *
 * Diferente de tools (executam ações), prompts retornam mensagens para
 * o LLM host (Claude, GPT, etc) preencher o contexto.
 */
export interface AkashaPrompt<A = Record<string, unknown>> {
  /** Identificador único (snake_case). */
  readonly name: string;

  /** Descrição do quando usar este prompt. */
  readonly description: string;

  /** Lista de argumentos tipados (nome, descrição, required). */
  readonly arguments: ReadonlyArray<AkashaPromptArgument>;

  /**
   * Renderizador. Recebe os argumentos e retorna mensagens no formato
   * MCP (array de `{ role, content }`).
   */
  readonly renderer: (args: A) => ReadonlyArray<AkashaPromptMessage>;
}

export interface AkashaPromptArgument {
  readonly name: string;
  readonly description: string;
  readonly required: boolean;
}

export interface AkashaPromptMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
}

// ============================================================================
// JSON SCHEMA (subset que usamos)
// ============================================================================

/**
 * Subset de JSON Schema que usamos para descrever input de tools.
 *
 * Não é um JSON Schema completo — é o mínimo necessário para validação
 * via Zod + geração de descrições para LLMs.
 */
export interface AkashaJsonSchema {
  readonly type: 'object';
  readonly properties: Record<string, AkashaJsonSchemaProperty>;
  readonly required?: ReadonlyArray<string>;
  readonly additionalProperties?: boolean;
}

export type AkashaJsonSchemaProperty =
  | { type: 'string'; description?: string; minLength?: number; maxLength?: number; pattern?: string; enum?: ReadonlyArray<string> }
  | { type: 'number' | 'integer'; description?: string; minimum?: number; maximum?: number }
  | { type: 'boolean'; description?: string }
  | { type: 'array'; description?: string; items: AkashaJsonSchemaProperty; minItems?: number; maxItems?: number }
  | { type: 'object'; description?: string; properties: Record<string, AkashaJsonSchemaProperty>; required?: ReadonlyArray<string> };

// ============================================================================
// SERVER REGISTRY (ponto de agregação para Wave 8)
// ============================================================================

/**
 * Registry de tools/resources/prompts do Akasha.
 *
 * **NÃO IMPLEMENTADO** — types-only. Em Wave 8, este registry será populado
 * por cada package (`@akasha/core`, `@akasha/mentor`, etc) e consumido pelo
 * `AkashaMcpServer` para expor tudo via JSON-RPC.
 */
export interface AkashaMcpRegistry {
  /** Tools registradas (nome → definição). */
  readonly tools: ReadonlyMap<string, AkashaTool<unknown, unknown>>;

  /** Resources registrados (URI → definição). */
  readonly resources: ReadonlyMap<AkashaResourceUri, AkashaResource<unknown>>;

  /** Prompts registrados (nome → definição). */
  readonly prompts: ReadonlyMap<string, AkashaPrompt<Record<string, unknown>>>;

  /** Versão do schema MCP que estamos implementando (ex: '2024-11-05'). */
  readonly schemaVersion: string;

  /** Nome do servidor exposto. */
  readonly serverName: string;

  /** Versão do servidor (semver). */
  readonly serverVersion: string;
}

// ============================================================================
// NOTA SOBRE EXPORTS
// ============================================================================
// Todos os tipos e interfaces acima já são exportados via `export interface`
// e `export type` inline. Não há bloco de re-export no fim para evitar
// conflitos TS2484 (declaração duplicada). Importadores devem usar:
//   import type { AkashaTool, AkashaToolContext } from '@akasha/mcp';
