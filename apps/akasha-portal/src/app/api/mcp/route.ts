/**
 * API Route: POST/GET /api/mcp
 * HTTP transport for Akasha MCP server (minimal JSON-RPC 2.0).
 *
 * GET  /api/mcp         — health check + server info
 * POST /api/mcp         — JSON-RPC 2.0 dispatch (initialize, tools/list, tools/call, ping)
 *
 * Wave 8.4 B.3 + Wave 9.3: uses AkashaMcpServer from @akasha/mcp.
 * Note: minimal inline JSON-RPC dispatcher (no transport-http.ts dependency).
 */
import { NextRequest } from 'next/server';
import { getMcpServer } from '@akasha/mcp';

// Singleton survives HMR
const globalForMcp = globalThis as unknown as {
  __akashaMcpServerPromise?: Promise<Awaited<ReturnType<typeof getMcpServer>>>;
};

async function server() {
  if (!globalForMcp.__akashaMcpServerPromise) {
    globalForMcp.__akashaMcpServerPromise = getMcpServer();
  }
  return globalForMcp.__akashaMcpServerPromise;
}

// Eagerly initialize so tools are registered
server().catch((err) => console.error('[mcp route] init failed:', err));

export async function GET() {
  try {
    const s = await server();
    return Response.json({
      status: 'ok',
      server: s.constructor.name,
      tools: typeof (s as any).listTools === 'function' ? (s as any).listTools() : [],
      resources: [],
      prompts: [],
      version: '0.2.0-http',
      protocol: 'MCP/JSON-RPC-2.0',
    });
  } catch (error) {
    return Response.json(
      { status: 'error', error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsonrpc, id, method, params } = body ?? {};
    if (jsonrpc !== '2.0') {
      return Response.json(
        { jsonrpc: '2.0', id: id ?? null, error: { code: -32600, message: 'Invalid Request: jsonrpc must be 2.0' } },
        { status: 400 }
      );
    }
    const s = await server();

    // Notification (no id) → return 202 Accepted with no body
    if (id === undefined) {
      return new Response(null, { status: 202 });
    }

    let result: unknown;
    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {}, resources: {}, prompts: {} },
          serverInfo: { name: 'akasha-mcp', version: '0.2.0' },
        };
        break;
      case 'ping':
        result = {};
        break;
      case 'tools/list':
        result = {
          tools: typeof (s as any).listToolsDetailed === 'function'
            ? (s as any).listToolsDetailed()
            : ((s as any).listTools?.() ?? []).map((name: string) => ({ name })),
        };
        break;
      case 'tools/call': {
        const { name, arguments: args } = params ?? {};
        if (!name) {
          return Response.json(
            { jsonrpc: '2.0', id, error: { code: -32602, message: 'Missing tool name' } },
            { status: 400 }
          );
        }
        const toolResult = await (s as any).callTool(name, args ?? {});
        result = toolResult;
        break;
      }
      case 'resources/list':
        result = { resources: [] };
        break;
      case 'resources/read':
        result = { contents: [] };
        break;
      case 'prompts/list':
        result = { prompts: [] };
        break;
      case 'prompts/get':
        return Response.json(
          { jsonrpc: '2.0', id, error: { code: -32601, message: 'Prompt not found' } },
          { status: 404 }
        );
      default:
        return Response.json(
          { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } },
          { status: 404 }
        );
    }

    return Response.json({ jsonrpc: '2.0', id, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bad request';
    return Response.json(
      { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error: ' + message } },
      { status: 400 }
    );
  }
}
