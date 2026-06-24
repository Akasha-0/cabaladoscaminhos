import { describe, it, expect } from 'vitest';
import { AkashaMcpServer, mcpServer } from '../server';
import type { AkashaTool } from '../index';

describe('AkashaMcpServer (Wave 8.4 stub)', () => {
  it('registers a tool', () => {
    const server = new AkashaMcpServer({ name: 'test' });
    const tool: AkashaTool = {
      name: 'echo',
      description: 'Echoes input',
      inputSchema: { type: 'object' },
      handler: async (input) => input,
    };
    server.registerTool(tool);
    expect(server.getRegistry().tools.size).toBe(1);
    expect(server.getRegistry().tools.get('echo')?.name).toBe('echo');
  });

  it('re-register replaces existing tool by name', () => {
    const server = new AkashaMcpServer();
    server.registerTool({ name: 't', description: 'v1', inputSchema: { type: 'object', properties: {} }, handler: async () => ({}) });
    server.registerTool({ name: 't', description: 'v2', inputSchema: { type: 'object', properties: {} }, handler: async () => ({}) });
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
    server.registerTool({ name: 'x', description: 'x', inputSchema: { type: 'object', properties: {} }, handler: async () => ({}) });
    const registry = server.getRegistry();
    // Top-level object is frozen
    expect(Object.isFrozen(registry)).toBe(true);
  });
});