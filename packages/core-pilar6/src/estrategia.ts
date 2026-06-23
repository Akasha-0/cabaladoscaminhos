/**
 * @akasha/core-pilar6 — detecção de Estratégia Energética
 *
 * Implementa `detectarEstrategia(tipo) -> EstrategiaEnergetica`.
 *
 * Mapeamento 1:1 a partir do Tipo Energético (D-YYY §2):
 *
 *   ┌─────────────────────┬──────────────────────────────┐
 *   │ Tipo                │ Estratégia                   │
 *   ├─────────────────────┼──────────────────────────────┤
 *   │ 'iniciador'         │ 'esperar_convite'            │
 *   │ 'guia'              │ 'informar'                   │
 *   │ 'iniciador_aberto'  │ 'iniciar'                    │
 *   │ 'refletor'          │ 'esperar_ciclo_lunar'        │
 *   └─────────────────────┴──────────────────────────────┘
 *
 * Pura: zero dependências externas, zero `Math.random()`.
 *
 * Guardrail ADR 0002:
 *  - Nomes universalistas (sem marca proprietária).
 */

import type { EstrategiaEnergetica, TipoEnergetico } from './types'

/** Tabela canônica de mapeamento Tipo → Estratégia (D-YYY §2). */
const TIPO_PARA_ESTRATEGIA: Readonly<
  Record<TipoEnergetico, EstrategiaEnergetica>
> = Object.freeze({
  iniciador: 'esperar_convite',
  guia: 'informar',
  iniciador_aberto: 'iniciar',
  refletor: 'esperar_ciclo_lunar',
})

/**
 * Retorna a Estratégia Energética correspondente ao Tipo Energético.
 *
 * Mapeamento 1:1 canônico (D-YYY). Determinístico: mesmo tipo →
 * mesma estratégia.
 *
 * @param tipo - Tipo Energético (1 dos 4)
 * @returns Estratégia Energética correspondente
 */
export function detectarEstrategia(
  tipo: TipoEnergetico,
): EstrategiaEnergetica {
  return TIPO_PARA_ESTRATEGIA[tipo]
}
