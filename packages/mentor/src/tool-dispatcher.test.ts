/**
 * @akasha/mentor — Testes para Tool Dispatcher (Wave 9.3)
 *
 * Cobre:
 * - 4 mapeamentos EMOTION_TOOLS (ansioso, perdido, curioso, centrado)
 * - emotion=null → noop (sem dispatch)
 * - graceful failure: MCP client indisponível (callTool=null) não explode
 * - isolamento: uma tool falhando não bloqueia as outras
 * - logging: [mentor] emotion=... emitted
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do mcp-client antes de importar o dispatcher.
// Forçamos callTool a devolver ok para cada tool name configurada,
// e hasTool/listTools a refletir o estado.
const mockCallTool = vi.fn();
const mockHasTool = vi.fn();
const mockListTools = vi.fn();

vi.mock('./mcp-client', () => ({
  callTool: (...args: unknown[]) => mockCallTool(...args),
  hasTool: (...args: unknown[]) => mockHasTool(...args),
  listTools: (...args: unknown[]) => mockListTools(...args),
  _resetMcpClientForTests: vi.fn(),
}));

import {
  EMOTION_TOOLS,
  dispatchToolsForEmotion,
  formatDispatchResultsForLLM,
} from './tool-dispatcher';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('EMOTION_TOOLS mapping (Wave 9.3)', () => {
  it('ansioso → calculate_code_of_day + build_ritual', () => {
    expect(EMOTION_TOOLS.ansioso).toEqual([
      'akasha.calculate_code_of_day',
      'akasha.build_ritual',
    ]);
  });

  it('perdido → find_correlations + interpretar_vida', () => {
    expect(EMOTION_TOOLS.perdido).toEqual([
      'akasha.find_correlations',
      'akasha.interpretar_vida',
    ]);
  });

  it('curioso → list_tools', () => {
    expect(EMOTION_TOOLS.curioso).toEqual(['mentor.list_tools']);
  });

  it('centrado → [] (no extras)', () => {
    expect(EMOTION_TOOLS.centrado).toEqual([]);
  });
});

describe('dispatchToolsForEmotion', () => {
  it('returns [] immediately when emotion is null', async () => {
    const results = await dispatchToolsForEmotion(null);
    expect(results).toEqual([]);
    expect(mockCallTool).not.toHaveBeenCalled();
  });

  it('dispatches 2 tools for ansioso and aggregates ok results', async () => {
    mockCallTool.mockImplementation(async (name: string) => {
      if (name === 'akasha.calculate_code_of_day') {
        return { ok: true, data: { code: { hexagram: 1 }, timestamp: 1 } };
      }
      if (name === 'akasha.build_ritual') {
        return { ok: true, data: { data: '2026-06-24', codigo: {} } };
      }
      return null;
    });

    const results = await dispatchToolsForEmotion('ansioso', { requestId: 'r-1' });

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.tool).sort()).toEqual([
      'akasha.build_ritual',
      'akasha.calculate_code_of_day',
    ]);
    expect(results.every((r) => r.result.ok)).toBe(true);
  });

  it('dispatches 2 tools for perdido', async () => {
    mockCallTool.mockResolvedValue({ ok: true, data: [] });

    const results = await dispatchToolsForEmotion('perdido');

    expect(results).toHaveLength(2);
    expect(mockCallTool).toHaveBeenCalledWith('akasha.find_correlations', {});
    expect(mockCallTool).toHaveBeenCalledWith('akasha.interpretar_vida', {});
  });

  it('dispatches 1 tool (list_tools) for curioso', async () => {
    mockCallTool.mockResolvedValue({
      ok: true,
      data: { tools: ['akasha.find_correlations', 'akasha.build_ritual'] },
    });

    const results = await dispatchToolsForEmotion('curioso');

    expect(results).toHaveLength(1);
    expect(results[0].tool).toBe('mentor.list_tools');
  });

  it('returns [] for centrado (no tools to dispatch)', async () => {
    const results = await dispatchToolsForEmotion('centrado');
    expect(results).toEqual([]);
    expect(mockCallTool).not.toHaveBeenCalled();
  });

  it('graceful failure: skips tool when MCP returns null', async () => {
    // callTool devolve null (MCP indisponível) — não deve explodir
    mockCallTool.mockResolvedValue(null);

    const results = await dispatchToolsForEmotion('ansioso');

    expect(results).toEqual([]); // tools puladas
    expect(mockCallTool).toHaveBeenCalledTimes(2);
  });

  it('isolates failures: one tool failing does not block others', async () => {
    mockCallTool.mockImplementation(async (name: string) => {
      if (name === 'akasha.calculate_code_of_day') {
        return {
          ok: false,
          error: { code: 'HANDLER_ERROR', message: 'boom' },
        };
      }
      if (name === 'akasha.build_ritual') {
        return { ok: true, data: {} };
      }
      return null;
    });

    const results = await dispatchToolsForEmotion('ansioso');

    expect(results).toHaveLength(2);
    const failed = results.find((r) => !r.result.ok);
    const succeeded = results.find((r) => r.result.ok);
    expect(failed?.tool).toBe('akasha.calculate_code_of_day');
    expect(succeeded?.tool).toBe('akasha.build_ritual');
  });

  it('emits [mentor] emotion=X, dispatching tools: ... log line', async () => {
    mockCallTool.mockResolvedValue({ ok: true, data: {} });

    await dispatchToolsForEmotion('ansioso', { requestId: 'req-xyz' });

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        '[mentor] emotion=ansioso, dispatching tools: akasha.calculate_code_of_day, akasha.build_ritual'
      )
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('requestId=req-xyz')
    );
  });
});

describe('formatDispatchResultsForLLM', () => {
  it('returns empty string when no results', () => {
    expect(formatDispatchResultsForLLM('ansioso', [])).toBe('');
  });

  it('formats ok results with data', () => {
    const out = formatDispatchResultsForLLM('ansioso', [
      { tool: 'akasha.calculate_code_of_day', result: { ok: true, data: { hex: 1 } } },
    ]);
    expect(out).toContain('[Tool insights for ansioso]:');
    expect(out).toContain('akasha.calculate_code_of_day');
    expect(out).toContain('"hex":1');
  });

  it('formats error results with code + message', () => {
    const out = formatDispatchResultsForLLM('perdido', [
      {
        tool: 'akasha.find_correlations',
        result: { ok: false, error: { code: 'HANDLER_ERROR', message: 'kapow' } },
      },
    ]);
    expect(out).toContain('akasha.find_correlations');
    expect(out).toContain('HANDLER_ERROR');
    expect(out).toContain('kapow');
  });
});
