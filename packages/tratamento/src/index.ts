/**
 * @akasha/tratamento — barrel export
 *
 * API pública do Synthesis Engine. Veja `types.ts` para shapes.
 */

export type {
  PilarInput,
  RespostaPergunta,
  TextSource,
  Camada,
  CadeiaPensamento,
  SynthesisOutput,
  TextRecord,
  Corpus,
  EngineOptions,
  AreaTratamento,
  EstiloTerapeutico,
} from './types';

export { AREAS_TRATAMENTO } from './types';

export { carregarCorpus, carregarCorpusLazy, limparCacheCorpus } from './corpus-loader';

export { sintetizar, ENGINE_VERSION, DISCLAIMER_TERAPEUTICO } from './engine';

// Re-exporta o tipo público PilarInput como pilarInputSchema para
// consumidores que queiram validar input runtime (zod lives in @akasha/core).
