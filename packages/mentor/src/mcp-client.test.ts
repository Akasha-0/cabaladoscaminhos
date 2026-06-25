/**
 * @akasha/mentor — Testes para MCP Client (Wave 11.2)
 *
 * Cobre:
 * - Happy path: MCP disponível → callTool/hasTool/listTools funcionam
 * - Lazy init: primeira chamada carrega o módulo, chamadas seguintes reusam
 * - Falha graceful: @akasha/mcp ausente → null / false / []
 * - hasTool: TOOL_NOT_FOUND → false; outros erros → true
 * - listTools: parse do data.tools quando MCP responde
 * - Singleton: estado compartilhado entre call sites
 * - Reset: _resetMcpClientForTests() permite re-init
 *
 * @akasha/mcp é uma peer dep opcional (Wave 9.3 commit 2). Os testes usam
 * `vi.mock('@akasha/mcp')` para controlar o comportamento do servidor.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockCallTool = vi.fn();
const mockGetMcpServer = vi.fn();

vi.mock('@akasha/mcp', () => ({
  getMcpServer: (...args: unknown[]) => mockGetMcpServer(...args),
}));

// Mock console.warn para que os warnings de MCP ausente não poluam a saída.
const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

async function loadModule() {
  vi.resetModules();
  return import('./mcp-client');
}

beforeEach(() => {
  // mockReset APAGA as implementações queueadas e o histórico. Usamos no
  // beforeEach para isolar testes — cada teste configura suas próprias
  // mockResolvedValueOnce().
  mockCallTool.mockReset();
  mockGetMcpServer.mockReset();
  warnSpy.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('MCP client — lazy init', () => {
  it('não importa @akasha/mcp até a primeira chamada', async () => {
    // Carregar o módulo NÃO deve chamar getMcpServer.
    mockGetMcpServer.mockReset();
    const m = await loadModule();

    // Antes de qualquer callTool, getMcpServer ainda não foi invocado.
    expect(mockGetMcpServer).not.toHaveBeenCalled();
    expect(m).toBeDefined();
  });

  it('chama getMcpServer na primeira operação (lazy load)', async () => {
    mockGetMcpServer.mockResolvedValue({
      callTool: mockCallTool,
    });
    const { callTool } = await loadModule();

    await callTool('tool.x', { foo: 'bar' });

    expect(mockGetMcpServer).toHaveBeenCalledOnce();
    expect(mockCallTool).toHaveBeenCalledWith('tool.x', { foo: 'bar' });
  });

  it('reusa o servidor após carregar (não recarrega)', async () => {
    mockGetMcpServer.mockResolvedValue({ callTool: mockCallTool });
    const { callTool, hasTool, listTools } = await loadModule();

    await callTool('a', {});
    await hasTool('b');
    await listTools();
    await callTool('c', {});

    // Singleton: getMcpServer invocado só na primeira operação.
    expect(mockGetMcpServer).toHaveBeenCalledOnce();
    expect(mockCallTool).toHaveBeenCalledTimes(4);
  });
});

describe('callTool()', () => {
  it('devolve o resultado do servidor quando ok=true', async () => {
    const result = { ok: true as const, data: { items: [1, 2, 3] } };
    mockGetMcpServer.mockResolvedValue({ callTool: mockCallTool });
    mockCallTool.mockResolvedValue(result);

    const { callTool } = await loadModule();
    const out = await callTool('list_items', { limit: 3 });

    expect(out).toEqual(result);
    expect(mockCallTool).toHaveBeenCalledWith('list_items', { limit: 3 });
  });

  it('propaga erro estruturado do servidor', async () => {
    const errResult = {
      ok: false as const,
      error: { code: 'HANDLER_ERROR' as const, message: 'boom' },
    };
    mockGetMcpServer.mockResolvedValue({ callTool: mockCallTool });
    mockCallTool.mockResolvedValue(errResult);

    const { callTool } = await loadModule();
    const out = await callTool('bad_tool', {});

    expect(out).toEqual(errResult);
    if (out && !out.ok) {
      expect(out.error.code).toBe('HANDLER_ERROR');
      expect(out.error.message).toBe('boom');
    }
  });

  it('devolve null quando @akasha/mcp não pode ser importado', async () => {
    mockGetMcpServer.mockRejectedValue(new Error('Cannot find module @akasha/mcp'));

    const { callTool } = await loadModule();
    const out = await callTool('whatever', {});

    expect(out).toBeNull();
    // Warning emitido uma vez.
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy.mock.calls[0][0]).toContain('[mentor-mcp-client]');
  });

  it('não reemite warning em chamadas subsequentes quando MCP ausente', async () => {
    mockGetMcpServer.mockRejectedValue(new Error('MCP missing'));

    const { callTool } = await loadModule();
    await callTool('a', {});
    await callTool('b', {});
    await callTool('c', {});

    // Apenas o primeiro call aciona o warning (warned: true persiste).
    expect(warnSpy).toHaveBeenCalledOnce();
  });
});

describe('hasTool()', () => {
  it('devolve true quando callTool retorna ok=true', async () => {
    mockGetMcpServer.mockResolvedValue({ callTool: mockCallTool });
    mockCallTool.mockResolvedValue({ ok: true, data: { status: 'ok' } });

    const { hasTool } = await loadModule();
    expect(await hasTool('foo.bar')).toBe(true);
  });

  it('devolve false quando callTool retorna TOOL_NOT_FOUND', async () => {
    mockGetMcpServer.mockResolvedValue({ callTool: mockCallTool });
    mockCallTool.mockResolvedValue({
      ok: false,
      error: { code: 'TOOL_NOT_FOUND', message: 'not found' },
    });

    const { hasTool } = await loadModule();
    expect(await hasTool('missing.tool')).toBe(false);
  });

  it('devolve true quando callTool retorna erro != TOOL_NOT_FOUND (tool existe mas falhou)', async () => {
    mockGetMcpServer.mockResolvedValue({ callTool: mockCallTool });
    mockCallTool.mockResolvedValue({
      ok: false,
      error: { code: 'HANDLER_ERROR', message: 'crash' },
    });

    const { hasTool } = await loadModule();
    // A tool existe; o erro é da execução dela, não do registro.
    expect(await hasTool('flaky.tool')).toBe(true);
  });

  it('devolve false quando MCP está ausente', async () => {
    mockGetMcpServer.mockRejectedValue(new Error('MCP missing'));

    const { hasTool } = await loadModule();
    expect(await hasTool('anything')).toBe(false);
  });
});

describe('listTools()', () => {
  it('parseia data.tools quando o servidor responde ok', async () => {
    mockGetMcpServer.mockResolvedValue({ callTool: mockCallTool });
    mockCallTool.mockResolvedValue({
      ok: true,
      data: { tools: ['akasha.foo', 'akasha.bar', 'mentor.list_tools'] },
    });

    const { listTools } = await loadModule();
    const tools = await listTools();

    expect(tools).toEqual(['akasha.foo', 'akasha.bar', 'mentor.list_tools']);
    expect(mockCallTool).toHaveBeenCalledWith('mentor.list_tools', {});
  });

  it('devolve [] quando result.data.tools é undefined', async () => {
    mockGetMcpServer.mockResolvedValue({ callTool: mockCallTool });
    mockCallTool.mockResolvedValue({ ok: true, data: {} });

    const { listTools } = await loadModule();
    expect(await listTools()).toEqual([]);
  });

  it('devolve [] quando result.data é undefined', async () => {
    mockGetMcpServer.mockResolvedValue({ callTool: mockCallTool });
    mockCallTool.mockResolvedValue({ ok: true, data: undefined });

    const { listTools } = await loadModule();
    expect(await listTools()).toEqual([]);
  });

  it('devolve [] quando result é null (MCP ausente)', async () => {
    mockGetMcpServer.mockRejectedValue(new Error('MCP missing'));

    const { listTools } = await loadModule();
    expect(await listTools()).toEqual([]);
  });

  it('devolve [] quando result.ok=false', async () => {
    mockGetMcpServer.mockResolvedValue({ callTool: mockCallTool });
    mockCallTool.mockResolvedValue({
      ok: false,
      error: { code: 'TOOL_NOT_FOUND', message: 'nope' },
    });

    const { listTools } = await loadModule();
    expect(await listTools()).toEqual([]);
  });
});

describe('_resetMcpClientForTests()', () => {
  it('permite resetar o singleton para testar fallback', async () => {
    // 1ª fase: MCP disponível.
    mockGetMcpServer.mockResolvedValueOnce({ callTool: mockCallTool });
    mockCallTool.mockResolvedValueOnce({ ok: true, data: { x: 1 } });

    const m1 = await loadModule();
    const r1 = await m1.callTool('foo', {});
    expect(r1).toEqual({ ok: true, data: { x: 1 } });

    // Reset → próxima chamada carrega novamente.
    m1._resetMcpClientForTests();

    // 2ª fase: MCP ausente.
    mockGetMcpServer.mockRejectedValueOnce(new Error('down'));
    const r2 = await m1.callTool('foo', {});
    expect(r2).toBeNull();
  });
});

describe('integração leve entre callTool / hasTool / listTools', () => {
  it('hasTool(true) + listTools() coexistem sem reset', async () => {
    mockGetMcpServer.mockResolvedValue({ callTool: mockCallTool });

    // hasTool('a') → ok
    mockCallTool.mockResolvedValueOnce({ ok: true, data: {} });
    // hasTool('b') → TOOL_NOT_FOUND
    mockCallTool.mockResolvedValueOnce({
      ok: false,
      error: { code: 'TOOL_NOT_FOUND', message: 'x' },
    });
    // listTools → ok com 2 tools
    mockCallTool.mockResolvedValueOnce({
      ok: true,
      data: { tools: ['akasha.foo', 'akasha.bar'] },
    });

    const { hasTool, listTools } = await loadModule();

    expect(await hasTool('a')).toBe(true);
    expect(await hasTool('b')).toBe(false);
    expect(await listTools()).toEqual(['akasha.foo', 'akasha.bar']);
  });
});