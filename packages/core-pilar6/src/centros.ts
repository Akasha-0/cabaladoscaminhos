/**
 * @akasha/core-pilar6 — detecção dos 9 Centros Energéticos
 *
 * Implementa `detectarCentros(pilares) -> CentroEnergetico[]` e
 * exporta a tabela canônica `CENTROS_ENERGETICOS`.
 *
 * 9 Centros (D-YYY §4) — baseados em I Ching + Cabala + Tantra.
 * NÃO são chakras hindus (Guardrail 1 do ADR 0002). Nomes PT-BR
 * próprios.
 *
 * Tabela canônica de inspiração:
 *
 *   ┌──────────────────┬──────────────────────────────────────┐
 *   │ Centro           │ Inspiração (universalista)           │
 *   ├──────────────────┼──────────────────────────────────────┤
 *   │ 'inspiracao'     │ Cabala (Keter)                       │
 *   │ 'mental'         │ Cabala (Hokhmah / Binah)             │
 *   │ 'manifestacao'   │ I Ching (canais de expressão)        │
 *   │ 'identidade'     │ Astrologia (Ascendente)              │
 *   │ 'vontade'        │ Tantra (Anahata)                     │
 *   │ 'emocoes'        │ Tantra (Manipura)                    │
 *   │ 'vitalidade'     │ Tantra (Svadhisthana)                │
 *   │ 'sobrevivencia'  │ Tantra (Muladhara — instinto)        │
 *   │ 'fundamentacao'  │ Tantra (Muladhara — base)            │
 *   └──────────────────┴──────────────────────────────────────┘
 *
 * Ativação (Wave 4 — stub determinístico):
 *
 *   Cada centro é **definido** (ativo) ou **inativo** com base em
 *   uma combinação simples de Pilar 2 (Astrologia) + Pilar 5 (I Ching)
 *   + Pilar 3 (Tantra) + Pilar 4 (Odu). O algoritmo de Wave 4 é
 *   heurístico (substituível em Wave 5+ a partir de uso real —
 *   ver D-YYY §Risk and Rollback).
 *
 *   Em linhas gerais:
 *   - Pilar 2 define 'identidade' (Ascendente) + ativa 'mental'
 *     (Mercúrio em signo ar) + 'manifestacao' (planetas em Casa 1/5/9)
 *   - Pilar 5 define 'inspiracao' (hexagrama contém ☰) e
 *     'mental' (hexagrama contém ☴ ou ☵)
 *   - Pilar 3 define 'vitalidade' (Pilar 3 corpo 1/2 = Svadhisthana) +
 *     'emocoes' (corpo 3/4 = Manipura) + 'vontade' (corpo 5 = Anahata)
 *   - Pilar 4 define 'sobrevivencia' (Odu de Exu = Ogbe) +
 *     'fundamentacao' (Odu de Obaluaiê = Iami)
 *
 *   Esta é uma simplificação. O algoritmo real будет calibrado em
 *   Wave 5+ com a tradição universalista.
 *
 * Pura: zero dependências externas, zero `Math.random()`.
 *
 * Guardrail ADR 0002:
 *  - 1 (renomear): nomes PT-BR próprios.
 *  - 2 (textos do zero): temas são originais.
 *  - 3 (visualização): este módulo é puro.
 */

import type {
  CentroEnergetico,
  PilarDadosAstrologia,
  PilarDadosIChing,
  PilarDadosOdu,
  PilarDadosTantrica,
  PilaresDados,
} from './types'

// ============================================================================
// §1 — Tabela canônica dos 9 Centros
// ============================================================================

/** Tema + inspiração de cada centro. Textos próprios (Guardrail 2). */
export interface CentroSignificado {
  centro: CentroEnergetico
  /** Tema em PT-BR — texto próprio (do zero). */
  tema: string
  /** Inspiração (universalista) — fonte do nome, não do tema. */
  inspiracao: string
}

/**
 * Tabela canônica dos 9 Centros (D-YYY §4). Ordem é a ordem canônica
 * (top-down, Cabala-inspired: da Inspiração à Fundamentação).
 */
export const CENTROS_ENERGETICOS: ReadonlyArray<CentroSignificado> =
  Object.freeze([
    {
      centro: 'inspiracao',
      tema: 'Recepção de ideias e direção superior; a pressão sutil que chega antes do pensamento.',
      inspiracao: 'Cabala (Keter)',
    },
    {
      centro: 'mental',
      tema: 'Processamento, análise, conceitualização. Onde as ideias se tornam forma.',
      inspiracao: 'Cabala (Hokhmah / Binah)',
    },
    {
      centro: 'manifestacao',
      tema: 'Expressão e materialização. O falar, o criar, o trazer para o mundo.',
      inspiracao: 'I Ching (canais de expressão)',
    },
    {
      centro: 'identidade',
      tema: 'Direção de vida e ambiente. "Quem sou eu, e onde me sinto em casa?"',
      inspiracao: 'Astrologia (Ascendente)',
    },
    {
      centro: 'vontade',
      tema: 'Coração-força. Vontade sustentada, propósito, valor próprio.',
      inspiracao: 'Tantra (Anahata)',
    },
    {
      centro: 'emocoes',
      tema: 'Ondas emocionais, sentimentos, profundidade afetiva. Pede clarify após o sono.',
      inspiracao: 'Tantra (Manipura)',
    },
    {
      centro: 'vitalidade',
      tema: 'Energia sustentada do corpo — a força que responde e trabalha.',
      inspiracao: 'Tantra (Svadhisthana)',
    },
    {
      centro: 'sobrevivencia',
      tema: 'Instinto, presença, alerta corporal. Resposta imediata, não sustentada.',
      inspiracao: 'Tantra (Muladhara — instinto)',
    },
    {
      centro: 'fundamentacao',
      tema: 'Base, raiz, pressão. Onde a vida "empurra para cima" antes de qualquer coisa.',
      inspiracao: 'Tantra (Muladhara — base)',
    },
  ])

// ============================================================================
// §2 — Helpers de ativação (Wave 4 — stub determinístico)
// ============================================================================

/** Sinais de fogo/ár (reuso de `tipo.ts` para evitar duplicação). */
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

/** Sinais de terra/água (complementares a fogo/ar). */
const SIGNOS_TERRA_AGUA: ReadonlySet<string> = new Set([
  'Touro',
  'Virgem',
  'Capricórnio',
  'Capricornio',
  'Câncer',
  'Cancer',
  'Escorpião',
  'Escorpiao',
  'Peixes',
])

/** Verifica se o ascendente está em signo de fogo/ar. */
function ascendenteFogoAr(asc: string | null): boolean {
  if (!asc) return false
  return SIGNOS_FOGO_AR.has(asc)
}

/** Verifica se o ascendente está em signo de terra/água. */
function ascendenteTerraAgua(asc: string | null): boolean {
  if (!asc) return false
  return SIGNOS_TERRA_AGUA.has(asc)
}

/**
 * Centro da Identidade é definido pelo Ascendente astrológico.
 * - Ascendente presente (qualquer signo) → 'identidade' definido.
 * - Ascendente ausente (hora desconhecida) → 'identidade' inativo.
 */
function ativarIdentidade(astrologia: PilarDadosAstrologia): boolean {
  return astrologia.asc_signo !== null && astrologia.asc_signo.length > 0
}

/**
 * Centro Mental é definido por Mercúrio em signo de fogo/ar (mente
 * ágil) OU por hexagrama com trigrama ☴ (Vento) ou ☵ (Água) acima.
 *
 * Stub Wave 4: usamos apenas o ascendente como proxy (mental ativo
 * quando ascendente em fogo/ar OU em terra/água, e o Pilar 5 traz
 * hexagrama com linhas mutáveis na 4ª/5ª).
 */
function ativarMental(
  astrologia: PilarDadosAstrologia,
  iching: PilarDadosIChing,
): boolean {
  if (ascendenteFogoAr(astrologia.asc_signo)) return true
  // Hexagrama 1-64 com trigrama ☴ (Vento) = Wen → 1, 11, 26, 34, 5, 9, 14, 43
  //   (King Wen sequence simplificada para Wave 4)
  const TRIGRAMAS_VENTO: ReadonlySet<number> = new Set([1, 11, 26, 34, 5, 9, 14, 43])
  return TRIGRAMAS_VENTO.has(iching.hexagrama_natal)
}

/**
 * Centro da Manifestação é definido por planetas em Casas de
 * expressão (1, 5, 9) ou por hexagrama com trigrama superior ☱
 * (Lago) — palavra falada.
 *
 * Stub Wave 4: usamos o ascendente como proxy (manifestação ativa
 * quando ascendente em signo de fogo OU quando hexagrama_natal
 * está em trigrama ☰/☱).
 */
function ativarManifestacao(
  astrologia: PilarDadosAstrologia,
  iching: PilarDadosIChing,
): boolean {
  if (ascendenteFogoAr(astrologia.asc_signo)) return true
  // Trigrama ☰ (Céu) = Qian → 1, 11, 26, 34, 5, 9, 14, 43 (proxy)
  // Trigrama ☱ (Lago) = Dui → 10, 15, 17, 28, 45, 58, 60, 61
  const TRIGRAMAS_PALAVRA: ReadonlySet<number> = new Set([
    1, 11, 26, 34, 5, 9, 14, 43, 10, 15, 17, 28, 45, 58, 60, 61,
  ])
  return TRIGRAMAS_PALAVRA.has(iching.hexagrama_natal)
}

/**
 * Centro da Inspiração é definido por hexagrama com trigrama superior
 * ☰ (Céu) — pressão sutil, direção.
 *
 * Stub Wave 4: hexagrama_natal em trigrama ☰/☴ ativa inspiração.
 */
function ativarInspiracao(iching: PilarDadosIChing): boolean {
  // Trigrama ☰ (Céu) = Qian
  const TRIGRAMAS_CEU: ReadonlySet<number> = new Set([1, 11, 26, 34, 5, 9, 14, 43])
  return TRIGRAMAS_CEU.has(iching.hexagrama_natal)
}

/**
 * Centro da Vontade é definido pelo Pilar 3 quando o corpo
 * predominante é 5 (Anahata).
 */
function ativarVontade(tantrica: PilarDadosTantrica): boolean {
  return tantrica.corpo_predominante === 5
}

/**
 * Centro das Emoções é definido pelo Pilar 3 quando o corpo
 * predominante é 3 ou 4 (Manipura / região abdominal alta).
 */
function ativarEmocoes(tantrica: PilarDadosTantrica): boolean {
  return tantrica.corpo_predominante === 3 || tantrica.corpo_predominante === 4
}

/**
 * Centro da Vitalidade é definido pelo Pilar 3 quando o corpo
 * predominante é 1 ou 2 (Svadhisthana / região pélvica).
 */
function ativarVitalidade(tantrica: PilarDadosTantrica): boolean {
  return tantrica.corpo_predominante === 1 || tantrica.corpo_predominante === 2
}

/**
 * Centro da Sobrevivência é definido pelo Pilar 4 quando o Odu
 * principal é de Exu (Ogbe) — instinto, presença, alerta.
 */
function ativarSobrevivencia(odu: PilarDadosOdu): boolean {
  return odu.odu_principal === 'Ogbe' || odu.odu_principal === 'Okaran'
}

/**
 * Centro da Fundamentação é definido pelo Pilar 4 quando o Odu
 * principal é de Obaluaiê (Iami) — base, raiz, pressão.
 */
function ativarFundamentacao(odu: PilarDadosOdu): boolean {
  return (
    odu.odu_principal === 'Iami' ||
    odu.odu_principal === 'Obaluaiê' ||
    odu.odu_principal === 'Obaluaye'
  )
}

// ============================================================================
// §3 — API pública
// ============================================================================

/**
 * Detecta os Centros Energéticos **definidos** (ativos) a partir
 * dos 5 Pilares canônicos.
 *
 * Algoritmo (Wave 4 — stub determinístico — D-YYY §Risk and Rollback):
 *  - `inspiracao`     ← Pilar 5 (hexagrama)
 *  - `mental`         ← Pilar 2 + Pilar 5
 *  - `manifestacao`   ← Pilar 2 + Pilar 5
 *  - `identidade`     ← Pilar 2 (Ascendente)
 *  - `vontade`        ← Pilar 3 (corpo predominante = 5)
 *  - `emocoes`        ← Pilar 3 (corpo predominante = 3/4)
 *  - `vitalidade`     ← Pilar 3 (corpo predominante = 1/2)
 *  - `sobrevivencia`  ← Pilar 4 (Odu de Exu)
 *  - `fundamentacao`  ← Pilar 4 (Odu de Obaluaiê)
 *
 * Determinístico: mesmos Pilares → mesmos centros. Retorna entre
 * 0 e 9 centros (subset dos 9 canônicos).
 *
 * @param pilares - agregado dos 5 Pilares canônicos
 * @returns array de centros definidos (subset dos 9)
 */
export function detectarCentros(pilares: PilaresDados): CentroEnergetico[] {
  const definidos: CentroEnergetico[] = []

  if (ativarInspiracao(pilares.iching)) {
    definidos.push('inspiracao')
  }
  if (ativarMental(pilares.astrologia, pilares.iching)) {
    definidos.push('mental')
  }
  if (ativarManifestacao(pilares.astrologia, pilares.iching)) {
    definidos.push('manifestacao')
  }
  if (ativarIdentidade(pilares.astrologia)) {
    definidos.push('identidade')
  }
  if (ativarVontade(pilares.tantrica)) {
    definidos.push('vontade')
  }
  if (ativarEmocoes(pilares.tantrica)) {
    definidos.push('emocoes')
  }
  if (ativarVitalidade(pilares.tantrica)) {
    definidos.push('vitalidade')
  }
  if (ativarSobrevivencia(pilares.odu)) {
    definidos.push('sobrevivencia')
  }
  if (ativarFundamentacao(pilares.odu)) {
    definidos.push('fundamentacao')
  }

  return definidos
}

// ============================================================================
// §4 — Adjacência de centros (usado por canais.ts)
// ============================================================================

/**
 * Tabela canônica de adjacências entre os 9 centros (D-YYY §5).
 * Um canal entre centroA e centroB só é possível se essa adjacência
 * estiver na tabela. 36 canais = soma das adjacências.
 *
 * Esta é uma redução universalista (NÃO cópia da topologia
 * proprietária do Human Design — Guardrail 3). Wave 5+ pode refinar.
 */
export const ADJACENCIAS_CENTROS: ReadonlyArray<
  readonly [CentroEnergetico, CentroEnergetico]
> = Object.freeze([
  // Cabeça (Inspiração + Mental) ↔ Manifestação
  ['inspiracao', 'mental'],
  ['mental', 'manifestacao'],
  ['inspiracao', 'manifestacao'],
  // Identidade como nó central (giro de direção)
  ['identidade', 'manifestacao'],
  ['identidade', 'vontade'],
  ['identidade', 'mental'],
  ['identidade', 'inspiracao'],
  // Vontade ↔ Emoções
  ['vontade', 'emocoes'],
  // Emoções ↔ Vitalidade
  ['emocoes', 'vitalidade'],
  // Vitalidade ↔ Sobrevivência
  ['vitalidade', 'sobrevivencia'],
  // Vitalidade ↔ Fundamentação
  ['vitalidade', 'fundamentacao'],
  // Sobrevivência ↔ Fundamentação
  ['sobrevivencia', 'fundamentacao'],
  // Manifestação ↔ Vontade
  ['manifestacao', 'vontade'],
  // Manifestação ↔ Emoções
  ['manifestacao', 'emocoes'],
  // Mental ↔ Vontade
  ['mental', 'vontade'],
  // Inspiração ↔ Identidade (já em cima)
])

/**
 * Verifica se 2 centros são adjacentes (tabela canônica acima).
 * Usado por `canais.ts` para validar pares.
 */
export function saoAdjacentes(
  a: CentroEnergetico,
  b: CentroEnergetico,
): boolean {
  return ADJACENCIAS_CENTROS.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a),
  )
}

// Helper exportado para testes — silencia warning de "unused" se a
// função for usada só em outros lugares.
export const _internals = {
  ascendenteFogoAr,
  ascendenteTerraAgua,
}
