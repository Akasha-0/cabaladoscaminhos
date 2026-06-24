/**
 * @akasha/mcp — Engines registry (Wave 9.3 commit 1)
 *
 * Registra 5 tools Akasha no MCP server. Cada handler é um **stub** que
 * devolve um shape vazio consistente com o que `@akasha/core` retornaria,
 * para que contratos e call sites (route, mentor tool-dispatcher) já
 * funcionem em Wave 9.3. Wave 9.4 substituirá os stubs pelos wrappers
 * reais para `findCorrelations`, `buildRitual`, `calculateCodeOfDay`,
 * `interpretarVida` e adicionará logging de auditoria.
 *
 * Por que stubs em Wave 9.3:
 * - Permite que o mentor tool-dispatcher execute end-to-end (hit + miss)
 *   sem quebrar contrato.
 * - Permite que o route handler teste wiring sem dependência de DB real.
 * - Ganha cobertura de teste de integração Wave 9.4 → Wave 9.5.
 *
 * STUB_NOTE: handler bodies marcados com `Wave 9.4 will wire real impl`.
 */
import type {
  AkashaJsonSchema,
  AkashaTool,
  AkashaToolContext,
  AkashaToolResult,
} from './index';

// ─── Helpers de schema ──────────────────────────────────────────────────────

/** Helper para construir object property schemas sem repetir boilerplate. */
function objProp(description: string): { type: 'object'; description: string; properties: Record<string, never>; additionalProperties: true } {
  return {
    type: 'object',
    description,
    properties: {},
    additionalProperties: true,
  };
}

/**
 * STUB handler factory: devolve `ok: true` com shape vazio consistente.
 * Cada tool tem o seu próprio `data` shape stub para que consumidores
 * possam testar guard clauses sem quebrar.
 */
function stubOk<T>(data: T): AkashaToolResult<T> {
  return { ok: true, data };
}

// ─── akasha.find_correlations ────────────────────────────────────────────────

/**
 * Wrapper de `findCorrelations` de `@akasha/core`. Input esperado:
 * `{ tradition: 'ifa' | 'iching' | 'cabala' | 'tantra', archetype: number | string }`.
 */
export const findCorrelationsTool: AkashaTool<
  { tradition?: string; archetype?: number | string },
  unknown[]
> = {
  name: 'akasha.find_correlations',
  description:
    'Encontra correlações entre tradições oraculares (Cabala, Ifá, I-Ching) para um arquétipo dado. Retorna lista de CrossTraditionCorrelation.',
  inputSchema: {
    type: 'object',
    properties: {
      tradition: {
        type: 'string',
        enum: ['ifa', 'iching', 'cabala', 'tantra'],
        description: 'Tradição de origem do arquétipo.',
      },
      archetype: {
        type: 'string',
        description: 'Identificador do arquétipo (número ou nome do Odú/hexagrama/sefirá).',
      },
    },
    required: [],
    additionalProperties: false,
  },
  handler: async (
    _ctx: AkashaToolContext,
    input: { tradition?: string; archetype?: number | string }
  ): Promise<AkashaToolResult<unknown[]>> => {
    // STUB: Wave 9.4 will wire to real findCorrelations(tradition, archetype)
    // For now, return empty list shape to keep contracts valid.
    if (!input.tradition || input.archetype === undefined) {
      return {
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'tradition e archetype são obrigatórios',
        },
      };
    }
    return stubOk([]);
  },
};

// ─── akasha.build_ritual ────────────────────────────────────────────────────

/**
 * Wrapper de `buildRitual`. Input: `RitualConfig` + `AkashaCode`.
 */
export const buildRitualTool: AkashaTool<
  { config?: Record<string, unknown>; code?: Record<string, unknown> },
  Record<string, unknown>
> = {
  name: 'akasha.build_ritual',
  description:
    'Monta o ritual diário Akasha a partir da configuração do consulente e do código do dia. Retorna RitualResponse.',
  inputSchema: {
    type: 'object',
    properties: {
      config: objProp('RitualConfig do consulente (horario, timezone, componentes).'),
      code: objProp('AkashaCode do dia (hexagrama/level/lifeArea).'),
    },
    required: [],
    additionalProperties: false,
  },
  handler: async (_ctx, _input): Promise<AkashaToolResult<Record<string, unknown>>> => {
    // STUB: shape vazio coerente com RitualResponse (Wave 9.4 wires real buildRitual).
    return stubOk({
      data: new Date().toISOString(),
      codigo: { hexagrama: {}, nivel: 'gift' },
      pratica: {},
      quizilas: [],
      afirmacao: '',
      oracao: '',
    });
  },
};

// ─── akasha.calculate_code_of_day ───────────────────────────────────────────

/**
 * Wrapper de `calculateCodeOfDay`. Input: `{ date: ISO string, timezone?: string }`.
 */
export const calculateCodeOfDayTool: AkashaTool<
  { date?: string; timezone?: string },
  Record<string, unknown>
> = {
  name: 'akasha.calculate_code_of_day',
  description:
    'Calcula o Código Akasha do dia (hexagrama I-Ching + nível + área de vida). Retorna CodeOfDayResult.',
  inputSchema: {
    type: 'object',
    properties: {
      date: { type: 'string', description: 'Data ISO (ex: 2026-06-24).' },
      timezone: { type: 'string', description: 'Timezone IANA (ex: America/Sao_Paulo).' },
    },
    required: [],
    additionalProperties: false,
  },
  handler: async (_ctx, _input): Promise<AkashaToolResult<Record<string, unknown>>> => {
    // STUB: shape coerente com CodeOfDayResult.
    return stubOk({
      code: { hexagram: 1, level: 'gift', lifeArea: 'espiritualidade' },
      timestamp: Date.now(),
    });
  },
};

// ─── akasha.interpretar_vida ────────────────────────────────────────────────

/**
 * Wrapper de `interpretarVida`. Input: `{ numero: number }`.
 */
export const interpretarVidaTool: AkashaTool<
  { numero?: number },
  Record<string, unknown>
> = {
  name: 'akasha.interpretar_vida',
  description:
    'Interpretação profunda do Número de Vida (Cabala) com 3 níveis (shadow/gift/siddhi) e 9 áreas de vida.',
  inputSchema: {
    type: 'object',
    properties: {
      numero: { type: 'integer', minimum: 1, maximum: 33, description: 'Número de vida 1-33.' },
    },
    required: [],
    additionalProperties: false,
  },
  handler: async (
    _ctx,
    input: { numero?: number }
  ): Promise<AkashaToolResult<Record<string, unknown>>> => {
    if (typeof input.numero !== 'number') {
      return {
        ok: false,
        error: { code: 'INVALID_INPUT', message: 'numero é obrigatório e deve ser number' },
      };
    }
    // STUB: shape vazio coerente com VidaInterpretation.
    return stubOk({
      numero: input.numero,
      isMaster: false,
      levels: { shadow: {}, gift: {}, siddhi: {} },
      mandato: '',
      arquetipoAkasha: '',
    });
  },
};

// ─── mentor.list_tools ──────────────────────────────────────────────────────

/**
 * Introspection tool: lista as tools registradas no MCP server.
 * Útil para que LLMs clientes possam descobrir capabilities em runtime.
 */
export const listToolsTool: AkashaTool<Record<string, never>, { tools: string[] }> = {
  name: 'mentor.list_tools',
  description:
    'Lista todas as tools Akasha registradas no MCP server. Útil para introspection por LLMs clientes.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  handler: async (
    _ctx,
    _input
  ): Promise<AkashaToolResult<{ tools: string[] }>> => {
    // STUB: retornamos lista vazia. Em Wave 9.4, este handler consultará
    // o `mcpServer.getRegistry()` para devolver nomes reais.
    return stubOk({ tools: [] });
  },
};

// ─── Registry helper ────────────────────────────────────────────────────────

/**
 * Lista canônica das 5 tools Akasha. Permite que outros módulos (route,
 * tool-dispatcher) importem os nomes sem hardcodar strings.
 */
export const AKASHA_TOOL_NAMES = [
  'akasha.find_correlations',
  'akasha.build_ritual',
  'akasha.calculate_code_of_day',
  'akasha.interpretar_vida',
  'mentor.list_tools',
] as const;

export type AkashaToolName = (typeof AKASHA_TOOL_NAMES)[number];

/** Retorna as 5 AkashaTool definitions (typed as `unknown` para aceitar a variância). */
export function getAkashaToolDefinitions(): AkashaTool<unknown, unknown>[] {
  return [
    findCorrelationsTool as unknown as AkashaTool<unknown, unknown>,
    buildRitualTool as unknown as AkashaTool<unknown, unknown>,
    calculateCodeOfDayTool as unknown as AkashaTool<unknown, unknown>,
    interpretarVidaTool as unknown as AkashaTool<unknown, unknown>,
    listToolsTool as unknown as AkashaTool<unknown, unknown>,
  ];
}
