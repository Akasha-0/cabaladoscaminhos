/**
 * AkashaMcpServer — runtime.
 *
 * Wave 8.4 stub: aceitava registry de AkashaTool/AkashaResource, holds
 * in-memory, NO transporte real (stdio/http) ainda.
 *
 * Wave 9.3 (commit 1) adiciona:
 * - `callTool(name, input, ctx?)` — invoca handler por nome com try/catch
 *   e devolve `AkashaToolResult`. Códigos de erro estáveis:
 *     - `TOOL_NOT_FOUND` — tool com este nome não está registrada
 *     - `HANDLER_ERROR` — handler lançou exceção
 * - `getMcpServer()` — singleton lazy que auto-registra as 5 tools Akasha
 *   (engines.ts) na primeira chamada. Auto-registro é tolerante a falha:
 *   se `@akasha/core` não estiver disponível, sobe server sem tools e
 *   `callTool` devolve TOOL_NOT_FOUND.
 *
 * Wave 9+ implementa:
 * - stdio transport (CLI integration)
 * - HTTP transport (web client)
 * - Multi-tenant context (zeladorId + caminhadaId)
 */
import type {
  AkashaMcpRegistry,
  AkashaPrompt,
  AkashaResource,
  AkashaResourceUri,
  AkashaTool,
  AkashaToolContext,
  AkashaToolResult,
} from './index';

export interface AkashaMcpServerOptions {
  name?: string;
  version?: string;
}

type MutableRegistry = {
  -readonly [K in keyof AkashaMcpRegistry]: AkashaMcpRegistry[K] extends ReadonlyMap<infer K2, infer V>
    ? Map<K2, V>
    : AkashaMcpRegistry[K];
};

export class AkashaMcpServer {
  private readonly name: string;
  private readonly version: string;
  private readonly tools: Map<string, AkashaTool<unknown, unknown>> = new Map();
  private readonly resources: Map<AkashaResourceUri, AkashaResource<unknown>> = new Map();
  private readonly prompts: Map<string, AkashaPrompt<Record<string, unknown>>> = new Map();

  constructor(options: AkashaMcpServerOptions = {}) {
    this.name = options.name ?? 'akasha-mcp';
    this.version = options.version ?? '0.1.0-types-only';
  }

  /** Register a tool. Idempotent (re-register replaces by name). */
  registerTool(tool: AkashaTool): this {
    this.tools.set(tool.name, tool as AkashaTool<unknown, unknown>);
    return this;
  }

  /** Get current registry snapshot (frozen Maps, safe to pass around). */
  getRegistry(): Readonly<AkashaMcpRegistry> {
    const snapshot: MutableRegistry = {
      tools: new Map(this.tools),
      resources: new Map(this.resources),
      prompts: new Map(this.prompts),
      schemaVersion: '2024-11-05',
      serverName: this.name,
      serverVersion: this.version,
    };
    return Object.freeze(snapshot) as Readonly<AkashaMcpRegistry>;
  }

  /**
   * Wave 9.3 — invoca uma tool pelo nome.
   *
   * @param name  Identificador da tool (snake_case, escopado ao namespace)
   * @param input Input validado pelo caller (schema já conferiu shape)
   * @param ctx   Contexto MCP (opcional — handlers stub não precisam; tools
   *              reais vão usar para multi-tenant + audit log)
   * @returns     AkashaToolResult<T> com `ok: true | false`.
   *              Em falha, retorna `{ ok: false, error: { code, message } }`:
   *              - `TOOL_NOT_FOUND` se não houver tool com este nome
   *              - `HANDLER_ERROR`  se o handler lançar exceção
   */
  async callTool<I = unknown, O = unknown>(
    name: string,
    input: I,
    ctx?: AkashaToolContext
  ): Promise<AkashaToolResult<O>> {
    const tool = this.tools.get(name) as AkashaTool<I, O> | undefined;
    if (!tool) {
      return {
        ok: false,
        error: {
          code: 'TOOL_NOT_FOUND',
          message: `Tool '${name}' não registrada no MCP server '${this.name}'`,
        },
      };
    }

    // ctx é opcional para handlers stub; se ausente, usamos um placeholder
    // LGPD-safe (sem PII) para satisfazer a assinatura do handler.
    const safeCtx: AkashaToolContext =
      ctx ??
      ({
        zeladorId: 'anonymous',
        requestId: `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      } as AkashaToolContext);

    try {
      return await tool.handler(safeCtx, input);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Não vaza stack trace — apenas mensagem human-readable.
      return {
        ok: false,
        error: {
          code: 'HANDLER_ERROR',
          message: `Handler '${name}' falhou: ${message}`,
          details: { toolName: name },
        },
      };
    }
  }

  /** Start the server (STUB in Wave 8.4 — logs only). */
  async start(): Promise<void> {
    console.log(
      `[akasha-mcp] server started (name=${this.name}, version=${this.version}, ` +
      `tools=${this.tools.size}, resources=${this.resources.size})`
    );
  }

  /** Stop the server (STUB in Wave 8.4 — no-op). */
  async stop(): Promise<void> {
    // no-op
  }
}

// ─── Singleton lazy com auto-registro de tools Akasha ───────────────────────

/**
 * Promise que rastreia o auto-registro das 5 tools Akasha no singleton.
 * Lazy porque `@akasha/core` pode não estar disponível no host — se falhar,
 * singleton sobe sem tools e `callTool` devolve TOOL_NOT_FOUND.
 */
let _registrationPromise: Promise<AkashaMcpServer> | null = null;

/**
 * Retorna o singleton MCP server com as 5 tools Akasha auto-registradas
 * (Wave 9.3 — ver `engines.ts`).
 *
 * Em contraste com o const `mcpServer` (eager, sem tools), esta função:
 * - Aguarda engines.ts ser carregado (dynamic import de `@akasha/core`)
 * - Se `@akasha/core` não estiver disponível, registra server sem tools
 *   e loga warning. Callers devem tratar TOOL_NOT_FOUND gracefully.
 */
export function getMcpServer(): Promise<AkashaMcpServer> {
  if (!_registrationPromise) {
    _registrationPromise = (async () => {
      const server = new AkashaMcpServer();
      try {
        const engines = await import('./engines');
        for (const tool of engines.getAkashaToolDefinitions()) {
          server.registerTool(tool);
        }
      } catch (err) {
        // @akasha/core ausente → server sem tools. Loga warning uma vez.
        const message = err instanceof Error ? err.message : String(err);
        console.warn(
          `[akasha-mcp] auto-register falhou (server sem tools): ${message}`
        );
      }
      return server;
    })();
  }
  return _registrationPromise;
}

/**
 * @deprecated Use `getMcpServer()` em vez do singleton eager.
 * Mantido para back-compat com Wave 8.4 — versão eager sem tools
 * registradas. Wave 9.4 vai remover esta exportação.
 */
export const mcpServer = new AkashaMcpServer();
