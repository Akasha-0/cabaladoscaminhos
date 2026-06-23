/**
 * @akasha/core-pilar6 — orquestrador
 *
 * Implementa `calcular(pilares, mc) -> Pilar6Resultado`.
 *
 * Esta é a **função de entrada pública** do Pilar 6. Recebe os
 * 5 Pilares canônicos + o MC do D-041 e devolve o Pilar 6 completo:
 *
 *   - Tipo (1 dos 4)
 *   - Estratégia (1:1 com tipo)
 *   - Autoridade (1 das 6, ou null se inconclusivo)
 *   - Centros definidos (subset dos 9)
 *   - Canais ativos (subset dos 36)
 *   - Versão do cálculo (sempre 'v1' em Wave 4)
 *   - Timestamp (injetado para testabilidade)
 *
 * A função é **pura** (zero efeitos colaterais, zero `Math.random()`,
 * zero I/O, zero rede). Determinística: mesma entrada → mesma saída.
 *
 * Comentários em PT-BR (i18n config).
 *
 * Guardrail ADR 0002:
 *  - 1 (renomear): tipos PT-BR próprios.
 *  - 2 (textos do zero): não há texto longo no output (apenas enums).
 *  - 3 (visualização): este módulo é puro.
 *  - 4 (disclaimer): fora de escopo (Wave 4 Task 4).
 */

import { detectarCanais } from './canais'
import { detectarCentros } from './centros'
import { detectarEstrategia } from './estrategia'
import { detectarTipo } from './tipo'
import { detectarAutoridade } from './autoridade'
import type { MandalaCaminho, Pilar6Resultado, PilaresDados } from './types'

// ============================================================================
// §1 — API pública
// ============================================================================

/**
 * Calcula o Pilar 6 completo a partir dos 5 Pilares + MC.
 *
 * Algoritmo (Wave 4 — stub determinístico — D-YYY §Risk and Rollback):
 *   1. Detecta o **Tipo** (combina Pilar 4 + Pilar 2 + MC)
 *   2. Detecta a **Estratégia** (1:1 com tipo)
 *   3. Detecta a **Autoridade** (reutiliza D-041)
 *   4. Detecta os **Centros definidos** (subset dos 9)
 *   5. Detecta os **Canais ativos** (pares de centros adjacentes definidos)
 *
 * @param pilares - agregado dos 5 Pilares canônicos
 * @param mc - MandalaCaminho (D-041) com `centroVitalidadeAtivo` + `autoridadeMC`
 * @param agora - timestamp injetado (default: `new Date()`).
 *                Injetar permite determinismo nos testes
 *                (ver `vi.useFakeTimers()` em vitest).
 * @returns Pilar6Resultado completo
 */
export function calcular(
  pilares: PilaresDados,
  mc: MandalaCaminho,
  agora: Date = new Date(),
): Pilar6Resultado {
  // 1) Tipo — combina Pilar 4 (Odu) + Pilar 2 (Ascendente) + MC
  const tipo = detectarTipo(pilares, mc)

  // 2) Estratégia — 1:1 com tipo
  const estrategia = detectarEstrategia(tipo)

  // 3) Autoridade — reusa detecção canônica do D-041 (MC)
  const autoridade = detectarAutoridade(mc)

  // 4) Centros definidos (subset dos 9)
  const centrosDefinidos = detectarCentros(pilares)

  // 5) Canais ativos (pares de centros adjacentes definidos)
  const canais = detectarCanais(centrosDefinidos)

  return {
    tipo,
    estrategia,
    autoridade,
    centrosDefinidos,
    canais,
    versaoCalculo: 'v1',
    calculadoEm: agora,
  }
}
