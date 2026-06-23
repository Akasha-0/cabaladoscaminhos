/**
 * @akasha/core-pilar6 — Pilar 6: Mapa Energetico Integrado
 *
 * Traducao universalista do Human Design (ver ADR 0002 §Guardrails + D-YYY).
 * Captura a funcao pratica (correlacionar tipo + estrategia + autoridade +
 * centros) sem copiar terminologia, estrutura ou visualizacao proprietarias.
 *
 * 4 guardrails do ADR 0002:
 *   1. Renomear todos os termos (4 tipos renomeados)
 *   2. Textos escritos do zero (sem copyright)
 *   3. Visualizacao propria (Guardrail 3)
 *   4. Disclaimer legal (Guardrail 4)
 */

// Tipos canonicos do Pilar 6 (mirror do schema.prisma).
// Mantidos em sync com apps/akasha-portal/prisma/schema.prisma
// (TipoEnergetico, EstrategiaEnergetica, AutoridadeEnergetica, CentroEnergetico).
export type {
  TipoEnergetico,
  EstrategiaEnergetica,
  AutoridadeEnergetica,
  CentroEnergetico,
  Pilar6Input,
  Pilar6Resultado,
} from './types';

// Detector de Tipo Energetico (D-YYY §1.1).
export { detectarTipoEnergetico } from './tipo';

// Derivador de Estrategia (D-YYY §1.2).
export { derivarEstrategia } from './estrategia';

// Inferidor de Autoridade (D-YYY §1.3).
export { inferirAutoridade } from './autoridade';

// Calculo dos 9 Centros Energeticos (D-YYY §1.4).
export { calcularCentros, CENTROS_9 } from './centros';

// Orquestrador principal do Pilar 6.
export { calcularPilar6 } from './calcular';

// Versao do calculo — incrementa quando algoritmo muda.
export const VERSAO_CALCULO = 'v1';