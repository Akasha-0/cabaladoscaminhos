/**
 * @akasha/core-pilar6 — detecção de Tipo Energético
 *
 * Implementa `detectarTipo(pilares, mc) -> TipoEnergetico`.
 *
 * Algoritmo (Wave 4 — stub heurístico):
 *   Combina 3 sinais para escolher 1 dos 4 tipos:
 *     1. Pilar 4 (Odu) — `odu_principal` (1-16)
 *     2. Pilar 2 (Astrologia) — `asc_signo` (12 signos)
 *     3. MandalaCaminho (D-041) — `centroVitalidadeAtivo` (boolean)
 *
 *   Heurística de Wave 4 (substituível em Wave 5+ por algoritmo
 *   calibrado com uso real — ver D-YYY §Risk and Rollback):
 *
 *     ┌────────────────────┬───────────────────────────────────┐
 *     │ Vitalidade ativa?  │ Tipo resultante                   │
 *     ├────────────────────┼───────────────────────────────────┤
 *     │ Sim                │ 'iniciador' (sustentado, responde)│
 *     │ Não + fogo/ár      │ 'iniciador_aberto' (impacta)      │
 *     │ Não + terra/água   │ 'guia' (focal, orienta)           │
 *     │ Odu lunar (16)     │ 'refletor' (amostra ambientes)    │
 *     └────────────────────┴───────────────────────────────────┘
 *
 *   - `iniciador` predomina quando o Centro da Vitalidade (Pilar 3 +
 *     D-041) está ativo — é a "energia sustentada que responde".
 *   - `iniciador_aberto` (sem Centro da Vitalidade + ascendente em
 *     signo de fogo/ár) — energia de começar, impacta primeiro.
 *   - `guia` (sem Centro da Vitalidade + ascendente em signo de
 *     terra/água) — energia focal, guia outros.
 *   - `refletor` (Odu lunar — Odu 16, Eji-Ogbè ou correspondente
 *     lunar) — energia lunar, amostra ambientes (ciclo de 29 dias).
 *
 * Stub aceitável para Wave 4 (D-YYY §Risk). O contrato do output é
 * estável; o algoritmo será refinado em Wave 5+ a partir de uso
 * real e consulta teológica com a tradição universalista
 * (Cumino / Saraceni / Camargo).
 *
 * Guardrails ADR 0002:
 *  - Guardrail 1 (renomear): usamos 'iniciador' | 'guia' |
 *    'iniciador_aberto' | 'refletor' — sem nomes proprietários.
 *  - Guardrail 3 (visualização): este módulo é puro (sem SVG).
 */

import type { MandalaCaminho, PilaresDados, TipoEnergetico } from './types'

// ─── Helpers internos (PT-BR) ──────────────────────────────────────────────

/**
 * Sinais de fogo/ár no zodíaco ocidental (PT-BR).
 * Usado para discriminar `iniciador_aberto` (fogo/ár) de `guia`
 * (terra/água) quando o Centro da Vitalidade está inativo.
 */
const SIGNOS_FOGO_AR: ReadonlySet<string> = new Set([
  'Áries',
  'Aries',
  'Leão',
  'Leao',
  'Sagitário',
  'Sagitario',
  'Aquário',
  'Aquario',
  'Gêmeos',
  'Gemeos',
  'Libra',
])

/**
 * Odu lunar canônico (Merindilogun) — nomes em PT-BR.
 * 16 Odus, dos quais **um** é considerado "lunar" (Refletor na
 * tradução universalista do D-YYY §1). Mantemos o nome tradicional
 * em PT-BR e adicionamos aliases canônicos da tradição.
 *
 * NOTA: o Odu 16 (Eji-Ogbè) é a contraparte lunar do Ifá/Candomblé
 * segundo a linhagem canônica do D-044 (15 Odus). Em Wave 5+, esse
 * mapeamento deve ser revisado com a tradição.
 */
const ODUS_LUNARES: ReadonlySet<string> = new Set([
  'Eji-Ogbe',
  'Eji-Ogbè',
  'Eji Ogbe',
  'Eji Ogbè',
  // Normalizado (lower + sem acento)
  'eji-ogbe',
  'eji-ogbè',
])

/** Normaliza string para comparação (lowercase + sem acentos). */
function normalizar(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/** Verifica se o Odu principal é "lunar" (Refletor). */
function oduELunar(oduPrincipal: string): boolean {
  return ODUS_LUNARES.has(normalizar(oduPrincipal))
}

/** Verifica se o ascendente é de fogo/ár. */
function ascendenteE_FogoAr(ascendente: string | null): boolean {
  if (!ascendente) return false
  return SIGNOS_FOGO_AR.has(ascendente)
}

// ─── API pública ──────────────────────────────────────────────────────────

/**
 * Detecta o Tipo Energético (1 dos 4) a partir dos Pilares + MC.
 *
 * Algoritmo de Wave 4 (stub heurístico — D-YYY §Risk):
 *  1. Se `odu_principal` for lunar → `refletor`.
 *  2. Senão, se `centroVitalidadeAtivo` (D-041) → `iniciador`.
 *  3. Senão (sem vitalidade), se `ascendente` é fogo/ár → `iniciador_aberto`.
 *  4. Senão (sem vitalidade + ascendente terra/água) → `guia`.
 *
 * Determinístico: mesma entrada → mesmo tipo. Não usa Math.random().
 * Não acessa rede, DB, ou LLM. Puro.
 *
 * @param pilares - agregado dos 5 Pilares canônicos
 * @param mc - MandalaCaminho canônico (D-041)
 * @returns 1 dos 4 `TipoEnergetico`
 */
export function detectarTipo(
  pilares: PilaresDados,
  mc: MandalaCaminho,
): TipoEnergetico {
  // 1) Odu lunar → Refletor (energia lunar de amostragem)
  if (oduELunar(pilares.odu.odu_principal)) {
    return 'refletor'
  }

  // 2) Centro da Vitalidade ativo (D-041) → Iniciador (responde)
  if (mc.centroVitalidadeAtivo === true) {
    return 'iniciador'
  }

  // 3) Sem vitalidade + ascendente fogo/ár → Iniciador Aberto
  if (ascendenteE_FogoAr(pilares.astrologia.asc_signo)) {
    return 'iniciador_aberto'
  }

  // 4) Caso padrão (sem vitalidade + ascendente terra/água ou
  //    ascendente ausente) → Guia (orienta outros)
  return 'guia'
}
