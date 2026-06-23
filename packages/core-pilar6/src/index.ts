/**
 * @akasha/core-pilar6 — Barrel
 *
 * Motor determinístico do Pilar 6 (Mapa Energético Integrado).
 * Veja AGENTS.md para o overview e os 4 guardrails do ADR 0002.
 */

// Tipos públicos
export type {
  // §1 — PilaresDados (shape mínimo)
  PilarDadosCabala,
  PilarDadosAstrologia,
  PilarDadosTantrica,
  PilarDadosOdu,
  PilarDadosIChing,
  PilaresDados,
  // §2 — MandalaCaminho
  MandalaCaminho,
  // §3 — Enums e saída
  TipoEnergetico,
  EstrategiaEnergetica,
  AutoridadeEnergetica,
  CentroEnergetico,
  Canal,
  Pilar6Resultado,
} from './types'

// Funções de detecção
export { detectarTipo } from './tipo'
export { detectarEstrategia } from './estrategia'
export { detectarAutoridade } from './autoridade'
export {
  detectarCentros,
  CENTROS_ENERGETICOS,
  type CentroSignificado,
} from './centros'
export { detectarCanais, CANAIS_CATALOGO } from './canais'

// Orquestrador
export { calcular } from './calcular'
