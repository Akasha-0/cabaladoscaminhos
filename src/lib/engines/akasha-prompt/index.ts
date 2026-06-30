/**
 * ════════════════════════════════════════════════════════════════════════════
 * W82-B — AKASHA PROMPT CONTEXT BUILDER · INDEX
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Public surface. Consumers should import from here, NOT from the
 * submodule files (which are internal).
 *
 * Example usage:
 *
 *   import { buildContext } from '@/lib/engines/akasha-prompt';
 *
 *   const leitura = cruzamentoPorCasa(...);            // from W82-A
 *   const pergunta = { texto: 'Como fica minha sexualidade?' };
 *   const historico = { mensagens: [], maxTurnos: 8 };
 *
 *   const ctx = buildContext(leitura, pergunta, historico);
 *   await openai.sendSystemPrompt(ctx.promptFinal);
 */

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC EXPORTS — types
// ════════════════════════════════════════════════════════════════════════════

export type {
  Brand,
  CasaNumber,
  Tradicao,
  TemaCasa,
  TemaPergunta,
  FormaPergunta,
  CiganoCardRef,
  Contribuicao,
  CruzamentoCasa,
  LeituraSintetizada,
  PerguntaConsulente,
  MensagemChat,
  HistoricoChat,
  PromptContext,
  PromptContextId,
  BuildContextConfig,
} from './types.ts';

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC EXPORTS — constants
// ════════════════════════════════════════════════════════════════════════════

export {
  AKASHA_PROMPT_VERSION,
  AKASHA_PROMPT_CYCLE,
  MESA_REAL_HOUSES_TOTAL,
  CASA_CONSULENTE,
  CASA_RETORNO,
  MIN_CASAS_RELEVANTES,
  MAX_CASAS_RELEVANTES,
  CHARS_PER_TOKEN,
  DEFAULT_MAX_TURNOS,
} from './types.ts';

export {
  DEFAULT_SYSTEM_ROLE,
  SURGICAL_INSTRUCTION_RULES,
  FORMA_INSTRUCTION_RULES,
  SACRED_TERMS_BY_TRADICAO,
  TRADICAO_LABELS,
  TRADICAO_ORDER,
  MAX_SACRED_TERMS_SURFACED,
  PROMPT_HEADER_LEITURA,
  PROMPT_HEADER_CASAS,
  PROMPT_HEADER_HISTORICO,
  PROMPT_HEADER_PERGUNTA,
  PROMPT_HEADER_SAGRADOS,
  PROMPT_HEADER_REGRAS,
  nfdNormalize,
  shortHex,
} from './constants.ts';

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC EXPORTS — relevance
// ════════════════════════════════════════════════════════════════════════════

export {
  casasRelevantes,
  scoreCasaForTokens,
  tokenizeForRelevance,
  relevanceFingerprint,
} from './relevance.ts';

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC EXPORTS — context builder
// ════════════════════════════════════════════════════════════════════════════

export {
  buildContext,
  CASA_ANCHORS,
  AKASHA_SYSTEM_ROLE,
  AKASHA_MAX_CASAS,
  AKASHA_DEFAULT_TURNOS,
} from './context-builder.ts';
