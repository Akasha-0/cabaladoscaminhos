/**
 * @akasha/core-humandesign — Calculator (POC stub)
 *
 * Esta é a **função de entrada pública** do POC. Recebe dados de
 * nascimento e devolve um `BodyGraph` agregado.
 *
 * **STATUS:** POC SKELETON (Wave 16.1). NÃO IMPLEMENTA CÁLCULO REAL.
 * Retorna um BodyGraph com shape válido + zeros/listas vazias + versão
 * 'v0-poc'. A integração com Swiss Ephemeris (que já existe em
 * `@akasha/core-astrology`) e com a tabela de ativação planetária
 * (88° por orb) acontece em Wave 16.2+ ou na migração pra produção
 * (que usa `@akasha/core-pilar6`).
 *
 * **Determinismo:** zero `Math.random()`. Mesma entrada → mesma saída.
 * O timestamp é injetado (default: `new Date()`) para testabilidade
 * via `vi.useFakeTimers()` em vitest.
 *
 * **TODO Wave 16.2+** (próximos passos — fora de escopo deste POC):
 *  1. Integrar com `@akasha/core-astrology/src/swiss-ephemeris.ts`
 *     para calcular posições planetárias tropicais (longitude eclíptica
 *     absoluta 0-360° para 10 planetas + Nodos).
 *  2. Calcular Design date (88° de arco solar) — formula clássica HD.
 *  3. Mapear cada planeta para Gate + Line via tabela de ativação
 *     (Hagen wheel / mandala HD — 64 gates × 6 lines × 12 cores).
 *  4. Derivar Personality gates (mapa consciente — dados de nascimento)
 *     e Design gates (mapa inconsciente — data pré-natal 88°).
 *  5. Detectar Centers defined (gates adjacentes cobrindo o Center).
 *  6. Detectar Channels ativos (pares de Gates cobrindo Centers adjacentes).
 *  7. Detectar Type (canais do Sacral + Throat + G Center + Motor + etc).
 *  8. Detectar Authority (center definitions → 7 variants).
 *  9. Detectar Profile (Personality Sun line / Design Sun line).
 * 10. Recomendar integração com `@akasha/core-cabala` (Sefirot) +
 *     `@akasha/core-iching` (Hexagrams) para metadata adicional
 *     (Gate ↔ Hexagram 1:1, Channel themes ↔ Sefirot paths).
 *
 * Atribuição: Human Design System © Ra Uru Hu (Alan Krakower, 1948-2011).
 * Ver `types.ts` §preamble para fontes públicas.
 */

import type { BirthData, BodyGraph } from './types'

// ============================================================================
// §1 — API pública
// ============================================================================

/**
 * Calcula o BodyGraph do Human Design a partir de dados de nascimento.
 *
 * **POC**: retorna BodyGraph com shape válido, TODOS os campos vazios
 * ou zero (exceto `version: 'v0-poc'` e `calculatedAt`).
 *
 * @param birth - dados de nascimento (date, time, lat, lng, tz)
 * @param agora  - timestamp injetado (default: `new Date()`).
 *                 Injetar permite determinismo nos testes.
 * @returns BodyGraph (POC stub — campos vazios)
 */
export function calculateBodyGraph(
  birth: BirthData,
  agora: Date = new Date(),
): BodyGraph {
  // Validação de input (POC — não exaustiva)
  if (!isValidBirthData(birth)) {
    throw new Error(
      '[core-humandesign] calculateBodyGraph: invalid BirthData — ' +
        'check date (YYYY-MM-DD), time (HH:MM), lat (-90..90), ' +
        'lng (-180..180), tz (number).',
    )
  }

  // POC stub: retorna BodyGraph com shape válido + campos vazios.
  // Em Wave 16.2+ este stub é substituído pelo cálculo real.
  return {
    type: 'Generator', // placeholder (POC)
    strategy: 'To Respond', // placeholder (1:1 com Generator)
    authority: null, // inconclusivo (POC)
    profile: '1/3', // placeholder (POC)
    definedCenters: [], // POC: cálculo real Wave 16.2+
    activeChannels: [], // POC: cálculo real Wave 16.2+
    gateActivations: [], // POC: cálculo real Wave 16.2+
    version: 'v0-poc',
    calculatedAt: agora,
  }
}

// ============================================================================
// §2 — Helpers internos (validação)
// ============================================================================

/**
 * Validação mínima de BirthData. Rejeita NaN, tipos errados, ranges
 * inválidos, formatos errados. Retorna `true` se válido.
 */
function isValidBirthData(birth: BirthData): boolean {
  if (!birth || typeof birth !== 'object') return false

  // date: 'YYYY-MM-DD' (10 chars, posição 4 e 7 são '-')
  if (typeof birth.date !== 'string') return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth.date)) return false

  // time: 'HH:MM' (5 chars, posição 2 é ':')
  if (typeof birth.time !== 'string') return false
  if (!/^\d{2}:\d{2}$/.test(birth.time)) return false

  // lat / lng / tz: number finito
  if (typeof birth.lat !== 'number' || !Number.isFinite(birth.lat)) return false
  if (typeof birth.lng !== 'number' || !Number.isFinite(birth.lng)) return false
  if (typeof birth.tz !== 'number' || !Number.isFinite(birth.tz)) return false

  // lat: -90..90, lng: -180..180
  if (birth.lat < -90 || birth.lat > 90) return false
  if (birth.lng < -180 || birth.lng > 180) return false

  return true
}
