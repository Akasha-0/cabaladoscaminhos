/**
 * @akasha/mentor — MCP Client (Wave 9.3 commit 2)
 *
 * Singleton lazy que envolve `getMcpServer()` de `@akasha/mcp` e expõe
 * API ergonômica para o mentor:
 *
 * - `callTool(name, input)`  → invoca e devolve result; null se MCP indisponível
 * - `hasTool(name)`           → bool, sem throw
 * - `listTools()`             → array de nomes (vazio se MCP indisponível)
 *
 * Falha graceful: se `@akasha/mcp` não puder ser importado (peer dep
 * opcional, package separado), o client loga warning uma vez e todas as
 * operações devolvem `null` / `false` / `[]` em vez de throw.
 *
 * Por que singleton lazy:
 * - Não força resolução de `@akasha/mcp` no module load (peer dep opcional)
 * - Permite que testes mockem o client via vi.mock sem afetar imports reais
 * - Compartilha instância entre múltiplos call sites no mesmo request
 */

import type { AkashaToolResult } from '@akasha/mcp';

export type ToolResult = AkashaToolResult<unknown>;

/** Estado interno do singleton — preenchido lazy na primeira chamada. */
interface McpClientState {
  server: { callTool: (name: string, input: unknown) => Promise<ToolResult> } | null;
  available: boolean;
  warned: boolean;
}

let _state: McpClientState | null = null;

/**
 * Lazy init: tenta resolver `@akasha/mcp` na primeira chamada.
 * Se falhar, marca `available: false` e loga warning uma vez.
 */
async function _ensureLoaded(): Promise<McpClientState> {
  if (_state) return _state;

  const state: McpClientState = {
    server: null,
    available: false,
    warned: false,
  };

  try {
    const mcpModule = await import('@akasha/mcp');
    const server = await mcpModule.getMcpServer();
    state.server = {
      callTool: (name, input) => server.callTool(name, input),
    };
    state.available = true;
  } catch (err) {
    if (!state.warned) {
      const msg = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.warn(`[mentor-mcp-client] @akasha/mcp unavailable: ${msg}`);
      state.warned = true;
    }
  }

  _state = state;
  return state;
}

/**
 * Reseta o singleton — apenas para testes. Não usar em código de produção.
 */
export function _resetMcpClientForTests(): void {
  _state = null;
}

/**
 * Invoca uma tool Akasha via MCP.
 *
 * @returns `AkashaToolResult` em caso de sucesso/dispatch, ou `null` se o
 *          MCP server não está disponível (peer dep ausente). O caller
 *          deve checar `result.ok` para distinguir hit/miss/error.
 */
export async function callTool(
  name: string,
  input: unknown
): Promise<ToolResult | null> {
  const state = await _ensureLoaded();
  if (!state.server) return null;
  return state.server.callTool(name, input);
}

/**
 * Checagem rápida: o MCP server tem uma tool com este nome?
 *
 * Implementação atual: chama `callTool` e checa `TOOL_NOT_FOUND` no result.
 * Wave 9.4 pode adicionar um método `hasTool(name)` direto no server
 * (evita o overhead de invocar + retornar erro).
 */
export async function hasTool(name: string): Promise<boolean> {
  const result = await callTool(name, {});
  if (!result) return false;
  if (result.ok) return true;
  // TOOL_NOT_FOUND = ferramenta não existe. Outros erros (HANDLER_ERROR)
  // significam que a ferramenta existe mas falhou — ainda assim, hasTool=true.
  return result.error.code !== 'TOOL_NOT_FOUND';
}

/**
 * Lista os nomes das tools Akasha registradas no MCP server.
 *
 * Implementação atual: chama `mentor.list_tools` (tool de introspection
 * registrada em Wave 9.3). Se MCP indisponível, devolve array vazio.
 */
export async function listTools(): Promise<string[]> {
  const result = await callTool('mentor.list_tools', {});
  if (!result || !result.ok) return [];
  const data = result.data as { tools?: string[] } | undefined;
  return data?.tools ?? [];
}
