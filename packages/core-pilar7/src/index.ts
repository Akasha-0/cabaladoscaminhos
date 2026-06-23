/**
 * @akasha/core-pilar7 — Public barrel
 *
 * Pilar 7 (Espectro de Transformacao) do Akasha OS.
 * Engine deterministico, sem framework. Sinergia com Pilar 5 (I Ching).
 *
 * Veja AGENTS.md para guardrails e contratos canonicos.
 */

// Tipos publicos
export type {
  EstagioTransformacao,
  FaseVida,
  IChingData,
  ChaveNatal,
  SequenceVenusiana,
  CaminhoDourado,
  PilaresDados,
  Pilar7Result,
} from './types';

// Chave (1-64)
export { CHAVES, getChave, getAllChaves, detectarChave } from './chave';

// Espectro (sombra/dom/siddhi)
export {
  detectarEstagio,
  isFaseVida,
  inferirFaseVida,
} from './espectro';

// Sequence Venusiana (22 chaves)
export {
  SEQUENCE_VENUS_LENGTH,
  detectarSequenceVenusiana,
} from './sequence';

// Caminho Dourado (11 chaves)
export {
  CAMINHO_DOURADO_LENGTH,
  detectarCaminhoDourado,
} from './pathway';

// Orquestrador
export { calcular, VERSAO_CALCULO } from './calcular';
