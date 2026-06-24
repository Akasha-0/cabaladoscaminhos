import { describe, it, expect } from 'vitest';
import { AkashaMcpServer, mcpServer } from '../server';
import type { AkashaTool, AkashaToolResult } from '../index';

const EMPTY_SCHEMA = { type: 'object' as const, properties: {}, additionalProperties: true };

// Helper: cria handler tipado corretamente (ctx + input) que devolve o
// resultado fornecido — usado nos testes de callTool.
function okHandler<T>(data: T) {
  return async (): Promise<AkashaToolResult<T>> => ({ ok: true, data });
}

describe('AkashaMcpServer (Wave 8.4 stub)', () => {
  it('registers a tool', () => {
    const server = new AkashaMcpServer({ name: 'test' });
    const tool: AkashaTool = {
      name: 'echo',
      description: 'Echoes input',
      inputSchema: EMPTY_SCHEMA,
      handler: async (_ctx, input: unknown): Promise<AkashaToolResult<unknown>> => ({
        ok: true,
        data: input,
      }),
    };
    server.registerTool(tool);
    expect(server.getRegistry().tools.size).toBe(1);
    expect(server.getRegistry().tools.get('echo')?.name).toBe('echo');
  });

  it('re-register replaces existing tool by name', () => {
    const server = new AkashaMcpServer();
    server.registerTool({
      name: 't',
      description: 'v1',
      inputSchema: EMPTY_SCHEMA,
      handler: okHandler({}),
    });
    server.registerTool({
      name: 't',
      description: 'v2',
      inputSchema: EMPTY_SCHEMA,
      handler: okHandler({}),
    });
    expect(server.getRegistry().tools.size).toBe(1);
    expect(server.getRegistry().tools.get('t')?.description).toBe('v2');
  });

  it('start/stop are no-ops in stub mode', async () => {
    const server = new AkashaMcpServer();
    await expect(server.start()).resolves.toBeUndefined();
    await expect(server.stop()).resolves.toBeUndefined();
  });

  it('default singleton mcpServer exists and has empty registry', () => {
    expect(mcpServer).toBeDefined();
    expect(mcpServer.getRegistry().tools.size).toBe(0);
    expect(mcpServer.getRegistry().resources.size).toBe(0);
    expect(mcpServer.getRegistry().prompts.size).toBe(0);
  });

  it('getRegistry returns frozen/immutable snapshot', () => {
    const server = new AkashaMcpServer();
    server.registerTool({
      name: 'x',
      description: 'x',
      inputSchema: EMPTY_SCHEMA,
      handler: okHandler({}),
    });
    const registry = server.getRegistry();
    // Top-level object is frozen
    expect(Object.isFrozen(registry)).toBe(true);
  });
});

describe('AkashaMcpServer.callTool (Wave 9.3)', () => {
  it('invokes a registered tool and returns its result (hit)', async () => {
    const server = new AkashaMcpServer();
    server.registerTool({
      name: 'echo',
      description: 'echoes input',
      inputSchema: EMPTY_SCHEMA,
      handler: async (_ctx, input: unknown): Promise<AkashaToolResult<unknown>> => ({
        ok: true,
        data: { echoed: input },
      }),
    });

    const result = await server.callTool<{ value: number }, { echoed: { value: number } }>(
      'echo',
      { value: 42 }
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.echoed.value).toBe(42);
    }
  });

  it('returns TOOL_NOT_FOUND when name is not registered (miss)', async () => {
    const server = new AkashaMcpServer();
    server.registerTool({
      name: 'other',
      description: 'different tool',
      inputSchema: EMPTY_SCHEMA,
      handler: okHandler({}),
    });

    const result = await server.callTool('does-not-exist', { foo: 'bar' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('TOOL_NOT_FOUND');
      expect(result.error.message).toContain('does-not-exist');
    }
  });

  it('returns HANDLER_ERROR when handler throws', async () => {
    const server = new AkashaMcpServer();
    server.registerTool({
      name: 'boom',
      description: 'always throws',
      inputSchema: EMPTY_SCHEMA,
      handler: async () => {
        throw new Error('kapow');
      },
    });

    const result = await server.callTool('boom', {});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('HANDLER_ERROR');
      expect(result.error.message).toContain('kapow');
      // Não vaza stack trace
      expect(result.error.message).not.toContain('at ');
    }
  });
});
