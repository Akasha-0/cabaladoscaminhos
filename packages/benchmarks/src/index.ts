/**
 * @akasha/benchmarks — barrel export
 *
 * Akasha Universalism Test (AUT) — Wave 31.3 MVP.
 */

export {
  FIVE_PILARS,
  AUT_WEIGHTS,
  CANONICAL_ODUS,
  CANONICAL_SEFIROT,
  CANONICAL_HEXAGRAMS,
  CANONICAL_TANTRA_BODIES,
  CANONICAL_SIGNS,
  detectPilars,
  countPilars,
  detectReasoning,
  detectEthics,
  detectConvergence,
  evaluateAutResponse,
  aggregateAutResults,
} from './aut';

export type {
  Pilar,
  PilarSignals,
  ReasoningSignals,
  EthicsSignals,
  ConvergenceSignals,
  CriterionScore,
  AutScore,
  AutSuiteReport,
} from './aut';

export { SYNTHETIC_DATASET, runDataset } from './datasets/synthetic';

export type { AutExample, AutExpected } from './datasets/synthetic';