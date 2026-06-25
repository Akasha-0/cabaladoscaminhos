/**
 * @akasha/core-humandesign — Barrel / public API
 *
 * POC skeleton (Wave 16.1). Para produção, usar `@akasha/core-pilar6`
 * (tradução universalista, ADR 0002 guardrails).
 *
 * Atribuição: Human Design System © Ra Uru Hu (Alan Krakower, 1948-2011).
 * Ver `types.ts` §preamble para fontes públicas e notas de IP.
 */

// Tipos públicos
export type {
  BirthData,
  BodyGraph,
  GateActivation,
  HDAuthority,
  HDCenter,
  HDChannel,
  HDGate,
  HDLine,
  HDProfile,
  HDStrategy,
  HDType,
} from './types'

// API pública
export { calculateBodyGraph } from './calculator'
