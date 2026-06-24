/**
 * @akasha/mentor — Tool Dispatcher (Wave 9.3 commit 2)
 *
 * Mapeia estado emocional → tools Akasha relevantes e as executa via MCP.
 *
 * Estratégia de mapeamento (Wave 9.3):
 *
 *   ansioso  → calculate_code_of_day, build_ritual
 *              (regulação: ritual curto + código do dia como âncora)
 *
 *   perdido  → find_correlations, interpretar_vida
 *              (orientação: cross-tradition correlations + leitura
 *               profunda do número de vida)
 *
 *   curioso  → list_tools
 *              (introspection: mostra capabilities para o usuário
 *               descobrir o que o sistema pode fazer)
 *
 *   centrado → [] (estado base, sem tools extras)
 *
 * Isolamento de falhas: cada tool call tem try/catch próprio — uma falha
 * NÃO bloqueia as outras. O resultado agregado é logado para observabilidade.
 *
 * Não invente correspondências esotéricas (AGENTS.md §5): os mapeamentos
 * acima refletem decisões de design Wave 9.3; Wave 9.4+ pode revisar.
 */
import type { EmotionalState } from './emotional-state';
import { callTool, type ToolResult } from './mcp-client';

/**
 * Mapa emotion → tools Akasha.
 *
 * Wave 9.3 — frozen record; modificável via Object.freeze para previnir
 * mutação acidental em runtime.
 */
export const EMOTION_TOOLS: Readonly<Record<EmotionalState, ReadonlyArray<string>>> =
  Object.freeze({
    ansioso: Object.freeze([
      'akasha.calculate_code_of_day',
      'akasha.build_ritual',
    ]),
    perdido: Object.freeze([
      'akasha.find_correlations',
      'akasha.interpretar_vida',
    ]),
    curioso: Object.freeze(['mentor.list_tools']),
    centrado: Object.freeze([]),
  });

/** Tools que retornam dados consumíveis (não apenas logs). */
export interface DispatchResult {
  tool: string;
  result: ToolResult;
}

/** Contexto opcional passado para logging/auditoria. */
export interface DispatchContext {
  /** ID do request (para tracing). */
  requestId?: string;
  /** ID do consulente (LGPD-safe, sem PII). */
  consulenteId?: string;
}

/**
 * Despacha todas as tools Akasha relevantes para um estado emocional.
 *
 * Comportamento:
 * - `emotion === null` → retorna [] (nenhuma tool disparada).
 * - Cada tool call tem try/catch isolado. Falha de uma NÃO bloqueia as outras.
 * - Se o MCP client está indisponível (`callTool` retorna null), a tool
 *   é pulada silenciosamente e logged com warning.
 * - Logs estruturados: `[mentor] emotion=X, dispatching tools: A, B`
 *
 * @returns Array de DispatchResult (um por tool tentada). Tools que falharam
 *          antes mesmo do dispatch (MCP indisponível) NÃO aparecem no array.
 */
export async function dispatchToolsForEmotion(
  emotion: EmotionalState | null,
  ctx: DispatchContext = {}
): Promise<DispatchResult[]> {
  if (emotion === null) {
    return [];
  }

  const tools = EMOTION_TOOLS[emotion];
  if (tools.length === 0) {
    // 'centrado' cai aqui — sem logs, é o caminho feliz.
    return [];
  }

  // Log estruturado: indica intenção de dispatch (mesmo se tools falharem depois).
  // eslint-disable-next-line no-console
  console.log(
    `[mentor] emotion=${emotion}, dispatching tools: ${tools.join(', ')}` +
      (ctx.requestId ? ` (requestId=${ctx.requestId})` : '')
  );

  const results: DispatchResult[] = [];

  // Dispatch paralelo: cada tool é independente. Wave 9.3 usa Promise.all
  // mas isola erros por tool. Wave 9.4 pode serializar se necessário.
  const settled = await Promise.allSettled(
    tools.map(async (toolName) => {
      try {
        const result = await callTool(toolName, {});
        if (result === null) {
          // MCP indisponível. Log warning mas não falha o dispatch.
          // eslint-disable-next-line no-console
          console.warn(
            `[mentor] tool '${toolName}' skipped: MCP client unavailable`
          );
          return null;
        }
        return { tool: toolName, result };
      } catch (err) {
        // Try/catch redundante (callTool já tem interno), mas defesa em
        // profundidade — nunca deixa um erro vazar.
        const message = err instanceof Error ? err.message : String(err);
        // eslint-disable-next-line no-console
        console.error(`[mentor] tool '${toolName}' crashed: ${message}`);
        return null;
      }
    })
  );

  for (const s of settled) {
    if (s.status === 'fulfilled' && s.value !== null) {
      results.push(s.value);
    }
  }

  return results;
}

/**
 * Helper para formatar resultados de dispatch como bloco de contexto
 * para injeção no system prompt do LLM.
 *
 * Retorna string vazia se `results` for vazio (sem bloco injetado).
 */
export function formatDispatchResultsForLLM(
  emotion: EmotionalState,
  results: DispatchResult[]
): string {
  if (results.length === 0) {
    return '';
  }

  const lines: string[] = [`[Tool insights for ${emotion}]:`];
  for (const { tool, result } of results) {
    if (result.ok) {
      lines.push(`- ${tool}: ${JSON.stringify(result.data).slice(0, 500)}`);
    } else {
      lines.push(`- ${tool}: ERROR ${result.error.code} — ${result.error.message}`);
    }
  }
  return lines.join('\n');
}
