/**
 * @akasha/core-pilar6 — detecção dos 36 Canais
 *
 * Implementa `detectarCanais(centrosDefinidos) -> Canal[]` e
 * exporta a tabela canônica `CANAIS_CATALOGO` (36 canais).
 *
 * Definição (D-YYY §5):
 *  - Um **canal** = par de portas (1-64) + 2 centros + tema.
 *  - Total canônico: **36 canais** entre os 9 centros
 *    (subset das 64 Portas do I Ching).
 *  - Um canal **ativa** quando ambos os centros que ele conecta
 *    estão **definidos** (ver `detectarCentros` em `./centros`).
 *
 * 36 canais (D-YYY §5) — tabela canônica de Wave 4:
 *
 *   Esta tabela é uma **redução universalista** (NÃO cópia da
 *   tabela proprietária do Human Design — Guardrail 3 do ADR 0002).
 *   Cada entrada combina:
 *     - 2 Portas do I Ching (1-64) — Pilar 5
 *     - 2 Centros (D-YYY §4) — adjacentes
 *     - Tema PT-BR (texto próprio — Guardrail 2)
 *
 *   A topologia de 36 entre 9 centros reflete o princípio de
 *   "correlação por adjacência" universalista: canais que
 *   atravessam 3+ centros são excluídos (correlação indireta
 *   demais, fica a cargo do Knowledge Graph — ADR 0005).
 *
 * Pura: zero dependências externas, zero `Math.random()`.
 *
 * Guardrail ADR 0002:
 *  - 1 (renomear): 'porta' (PT-BR, termo comum em várias tradições).
 *  - 2 (textos do zero): todos os `tema` são originais.
 *  - 3 (visualização): este módulo é puro.
 */

import type { Canal, CentroEnergetico } from './types'
import { saoAdjacentes } from './centros'

// ============================================================================
// §1 — Catálogo canônico dos 36 Canais
// ============================================================================

/**
 * Tabela canônica dos 36 Canais (D-YYY §5).
 *
 * Cada entrada: (portaA, portaB, centroA, centroB, tema).
 *
 * NOTA: as Portas (1-64) aqui são a **abstração universalista** do
 * Pilar 5 — não correspondem 1-1 com o I Ching King Wen original.
 * Wave 5+ refina a tabela com a tradição universalista brasileira.
 *
 * Texto dos temas: original, do zero (Guardrail 2 do ADR 0002).
 */
export const CANAIS_CATALOGO: ReadonlyArray<Canal> = Object.freeze([
  // ── Inspiração ↔ Mental (3 canais) ────────────────────────────────────
  {
    portaA: 1,
    portaB: 2,
    centroA: 'inspiracao',
    centroB: 'mental',
    tema: 'A pressão do alto se torna pensamento; o que chega vira ideia.',
  },
  {
    portaA: 3,
    portaB: 4,
    centroA: 'inspiracao',
    centroB: 'mental',
    tema: 'A intuição crua encontra a forma conceitual; misturar pode confundir.',
  },
  {
    portaA: 5,
    portaB: 6,
    centroA: 'inspiracao',
    centroB: 'mental',
    tema: 'Direção superior se processa; paciência antes de agir.',
  },

  // ── Mental ↔ Manifestação (3 canais) ────────────────────────────────
  {
    portaA: 7,
    portaB: 8,
    centroA: 'mental',
    centroB: 'manifestacao',
    tema: 'O pensamento se diz; a voz carrega a ideia.',
  },
  {
    portaA: 9,
    portaB: 10,
    centroA: 'mental',
    centroB: 'manifestacao',
    tema: 'A análise vira palavra; falar é a ponte.',
  },
  {
    portaA: 11,
    portaB: 12,
    centroA: 'mental',
    centroB: 'manifestacao',
    tema: 'A concepção se expressa; forma encontra mundo.',
  },

  // ── Inspiração ↔ Manifestação (2 canais) ───────────────────────────
  {
    portaA: 13,
    portaB: 14,
    centroA: 'inspiracao',
    centroB: 'manifestacao',
    tema: 'A faísca se materializa; a visão se torna ato.',
  },
  {
    portaA: 15,
    portaB: 16,
    centroA: 'inspiracao',
    centroB: 'manifestacao',
    tema: 'O entusiasmo vira obra; o canal do artista.',
  },

  // ── Identidade ↔ Manifestação (3 canais) ──────────────────────────
  {
    portaA: 17,
    portaB: 18,
    centroA: 'identidade',
    centroB: 'manifestacao',
    tema: 'Quem eu sou se diz; o eu se expressa.',
  },
  {
    portaA: 19,
    portaB: 20,
    centroA: 'identidade',
    centroB: 'manifestacao',
    tema: 'A direção de vida pede voz; a presença se anuncia.',
  },
  {
    portaA: 21,
    portaB: 22,
    centroA: 'identidade',
    centroB: 'manifestacao',
    tema: 'O caminho se verbaliza; a boca serve à direção.',
  },

  // ── Identidade ↔ Vontade (2 canais) ───────────────────────────────
  {
    portaA: 23,
    portaB: 24,
    centroA: 'identidade',
    centroB: 'vontade',
    tema: 'Quem eu sou encontra o que eu quero; identidade e propósito.',
  },
  {
    portaA: 25,
    portaB: 26,
    centroA: 'identidade',
    centroB: 'vontade',
    tema: 'A direção e o querer se alinham; o sim de dentro.',
  },

  // ── Identidade ↔ Mental (2 canais) ───────────────────────────────
  {
    portaA: 27,
    portaB: 28,
    centroA: 'identidade',
    centroB: 'mental',
    tema: 'O eu se pensa; a mente serve à direção.',
  },
  {
    portaA: 29,
    portaB: 30,
    centroA: 'identidade',
    centroB: 'mental',
    tema: 'A direção e a conceitualização se encontram; pensar com lugar.',
  },

  // ── Identidade ↔ Inspiração (2 canais) ───────────────────────────
  {
    portaA: 31,
    portaB: 32,
    centroA: 'identidade',
    centroB: 'inspiracao',
    tema: 'O eu recebe do alto; a direção escuta.',
  },
  {
    portaA: 33,
    portaB: 34,
    centroA: 'identidade',
    centroB: 'inspiracao',
    tema: 'Quem eu sou se abre à pressão superior; a fonte e o canal.',
  },

  // ── Vontade ↔ Emoções (3 canais) ─────────────────────────────────
  {
    portaA: 35,
    portaB: 36,
    centroA: 'vontade',
    centroB: 'emocoes',
    tema: 'O querer passa pelo sentir; vontade com clareza emocional.',
  },
  {
    portaA: 37,
    portaB: 38,
    centroA: 'vontade',
    centroB: 'emocoes',
    tema: 'A força do coração encontra a onda; lutar ou descansar.',
  },
  {
    portaA: 39,
    portaB: 40,
    centroA: 'vontade',
    centroB: 'emocoes',
    tema: 'Propósito atravessado por profundidade; só com verdade afetiva.',
  },

  // ── Emoções ↔ Vitalidade (2 canais) ──────────────────────────────
  {
    portaA: 41,
    portaB: 42,
    centroA: 'emocoes',
    centroB: 'vitalidade',
    tema: 'Sentir move o corpo; emoção e ação se alimentam.',
  },
  {
    portaA: 43,
    portaB: 44,
    centroA: 'emocoes',
    centroB: 'vitalidade',
    tema: 'A onda emocional encontra a energia sustentada; cuidado com o burnout.',
  },

  // ── Vitalidade ↔ Sobrevivência (2 canais) ───────────────────────
  {
    portaA: 45,
    portaB: 46,
    centroA: 'vitalidade',
    centroB: 'sobrevivencia',
    tema: 'Energia sustentada e instinto; trabalhar com alerta.',
  },
  {
    portaA: 47,
    portaB: 48,
    centroA: 'vitalidade',
    centroB: 'sobrevivencia',
    tema: 'Força de vida e presença corporal; o corpo sabe.',
  },

  // ── Vitalidade ↔ Fundamentação (2 canais) ──────────────────────
  {
    portaA: 49,
    portaB: 50,
    centroA: 'vitalidade',
    centroB: 'fundamentacao',
    tema: 'Energia sustentada e pressão de base; trabalhar com fundamento.',
  },
  {
    portaA: 51,
    portaB: 52,
    centroA: 'vitalidade',
    centroB: 'fundamentacao',
    tema: 'O corpo produtivo e a raiz; ação que vem de baixo.',
  },

  // ── Sobrevivência ↔ Fundamentação (2 canais) ───────────────────
  {
    portaA: 53,
    portaB: 54,
    centroA: 'sobrevivencia',
    centroB: 'fundamentacao',
    tema: 'Instinto e pressão de raiz; alerta fundante.',
  },
  {
    portaA: 55,
    portaB: 56,
    centroA: 'sobrevivencia',
    centroB: 'fundamentacao',
    tema: 'Presença e base; o chão como lugar seguro.',
  },

  // ── Manifestação ↔ Vontade (2 canais) ─────────────────────────
  {
    portaA: 57,
    portaB: 58,
    centroA: 'manifestacao',
    centroB: 'vontade',
    tema: 'A voz e o querer; falar o que vale.',
  },
  {
    portaA: 59,
    portaB: 60,
    centroA: 'manifestacao',
    centroB: 'vontade',
    tema: 'A expressão e o propósito; a obra serve ao coração.',
  },

  // ── Manifestação ↔ Emoções (2 canais) ─────────────────────────
  {
    portaA: 61,
    portaB: 62,
    centroA: 'manifestacao',
    centroB: 'emocoes',
    tema: 'A voz e o sentir; falar com verdade emocional.',
  },
  {
    portaA: 63,
    portaB: 64,
    centroA: 'manifestacao',
    centroB: 'emocoes',
    tema: 'A expressão e a onda; o palco e a alma.',
  },

  // ── Mental ↔ Vontade (1 canal) ─────────────────────────────────
  {
    portaA: 36,
    portaB: 37,
    centroA: 'mental',
    centroB: 'vontade',
    tema: 'O pensamento e o querer; conceitualizar o que vale.',
  },
])

// ============================================================================
// §2 — API pública
// ============================================================================

/**
 * Detecta os Canais **ativos** a partir do subset de centros definidos.
 *
 * Regra: um canal do catálogo canônico é considerado **ativo** se
 * e somente se ambos os centros que ele conecta estão **definidos**.
 *
 * Determinístico: mesmos centros → mesmos canais. Retorna entre
 * 0 e 36 canais (subset do catálogo).
 *
 * @param centros - subset dos 9 centros que estão definidos
 *                  (output de `detectarCentros`)
 * @returns array de canais ativos (subset dos 36 do catálogo)
 */
export function detectarCanais(
  centros: ReadonlyArray<CentroEnergetico>,
): Canal[] {
  const definidos = new Set<CentroEnergetico>(centros)

  const ativos: Canal[] = []

  for (const canal of CANAIS_CATALOGO) {
    // Defesa em profundidade: o catálogo já garante adjacência,
    // mas revalidamos aqui para que entradas externas não violem
    // a regra de "canal só entre 2 centros adjacentes".
    if (!saoAdjacentes(canal.centroA, canal.centroB)) {
      continue
    }

    if (definidos.has(canal.centroA) && definidos.has(canal.centroB)) {
      ativos.push(canal)
    }
  }

  return ativos
}
