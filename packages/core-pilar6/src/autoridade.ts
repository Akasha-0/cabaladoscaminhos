/**
 * @akasha/core-pilar6 — detecção de Autoridade Energética
 *
 * Implementa `detectarAutoridade(mc) -> AutoridadeEnergetica | null`.
 *
 * REUTILIZA a detecção canônica do D-041 (Caminhante) — Pilar 6
 * **não** duplica modelagem. O MC já carrega, no agregado
 * `MandalaCaminho`, a autoridade interna (1 das 6) que o Zelador
 * detecta na prática clínica.
 *
 * Esta função existe como ponto de integração: ela **lê** o campo
 * `autoridadeMC` (opcional) do MC e o devolve como
 * `AutoridadeEnergetica`. Quando o MC não traz a autoridade (D-041
 * em construção / Caminhante sem MC calculado), retorna `null` —
 * conforme o contrato `Pilar6Resultado.autoridade: ... | null`.
 *
 * Mapeamento D-041 (autoridade interna do Caminhante) ↔ Pilar 6
 * (AutoridadeEnergetica):
 *
 *   ┌─────────────────────┬────────────────────────────┐
 *   │ D-041 (MC)          │ Pilar 6                    │
 *   ├─────────────────────┼────────────────────────────┤
 *   │ 'emocional'         │ 'emocional'                │
 *   │ 'sacral'            │ 'sacral'                   │
 *   │ 'esplenica'         │ 'esplenica'                │
 *   │ 'cardiaca'          │ 'cardiaca'                 │
 *   │ 'identidade'        │ 'identidade'               │
 *   │ 'lunar'             │ 'lunar'                    │
 *   │ ausente             │ null                       │
 *   └─────────────────────┴────────────────────────────┘
 *
 * Pura: zero dependências externas, zero `Math.random()`.
 *
 * Guardrail ADR 0002:
 *  - Nomes PT-BR próprios ('emocional', 'sacral', etc), sem
 *    termos proprietários do Human Design.
 */

import type { AutoridadeEnergetica, MandalaCaminho } from './types'

/**
 * Conjunto de autoridades canônicas (D-YYY §3).
 * Usado para validar o valor vindo do MC.
 */
const AUTORIDADES_VALIDAS: ReadonlySet<AutoridadeEnergetica> = new Set<
  AutoridadeEnergetica
>(['emocional', 'sacral', 'esplenica', 'cardiaca', 'identidade', 'lunar'])

/**
 * Detecta a Autoridade Energética a partir do MC (D-041).
 *
 * Estratégia Wave 4: o MC canônico (D-041) é a fonte da verdade para
 * autoridade interna. Pilar 6 apenas **reutiliza** essa detecção.
 *
 * @param mc - MandalaCaminho (pode ou não trazer `autoridadeMC`)
 * @returns Autoridade Energética (1 das 6) ou `null` se inconclusivo
 */
export function detectarAutoridade(
  mc: MandalaCaminho,
): AutoridadeEnergetica | null {
  // O MC canônico carrega `autoridadeMC` (D-041) como string livre.
  // Pilar 6 valida e normaliza para o enum AutoridadeEnergetica.
  const autoridadeMC = (mc as MandalaCaminho & { autoridadeMC?: unknown })
    .autoridadeMC

  if (typeof autoridadeMC !== 'string' || autoridadeMC.length === 0) {
    return null
  }

  // Normalização simples (lowercase + sem acento)
  const normalizada = autoridadeMC
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

  if (AUTORIDADES_VALIDAS.has(normalizada as AutoridadeEnergetica)) {
    return normalizada as AutoridadeEnergetica
  }

  // Valor fora do enum canônico → inconclusivo
  return null
}
