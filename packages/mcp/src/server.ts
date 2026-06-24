/**
 * AkashaMcpServer — skeleton runtime.
 *
 * Wave 8.4 stub: aceita registry de AkashaTool/AkashaResource, holds
 * in-memory, NO transporte real (stdio/http) ainda. Wave 9+ implementa:
 * - stdio transport (CLI integration)
 * - HTTP transport (web client)
 * - Multi-tenant context (zeladorId + caminhadaId)
 * - Tool invocation dispatch
 */
import type {
  AkashaMcpRegistry,
  AkashaPrompt,
  AkashaResource,
  AkashaResourceUri,
  AkashaTool,
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

export const mcpServer = new AkashaMcpServer();