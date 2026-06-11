/**
 * F-209: Tríade Sombra/Dom/Graça (R-015 D2)
 *
 * Implementa a tríade de Rudd 2009 (Gene Keys) com nomenclatura
 * Akasha PT-BR. Cada Pilar 2 (Astrologia) tem 3 sub-níveis
 * de expressão baseados nos aspectos planetários:
 *
 * - Sombra  (frequência baixa)  — aspectos tensos (quadratura, oposição)
 * - Dom     (frequência média)  — aspectos harmoniosos (trígono, sextil)
 * - Graça   (frequência alta)   — alinhamentos exatos (conjunção Sol, etc.)
 *
 * Inspirado por:
 * - R-015 §2.1 Tríade Shadow → Gift → Siddhi
 * - R-015 §6.3 Vocabulário proposto: Sombra/Dom/Graça
 * - R-022 §3.1 Tom contemplativo (não prescritivo)
 *
 * Nomenclatura Akasha (não Rudd):
 * - Sombra  (não Shadow)  — universal em PT-BR
 * - Dom     (não Gift)    — mais direto
 * - Graça   (não Siddhi)  — mais universal
 *
 * @see .autonomous/research/synthesis/gk-reverse-engineering.md §2.1 §6.3
 */

import type { Aspecto, AspectoTipo } from './tipos';

/**
 * Os 3 sub-estados de um Pilar 2 (Astrologia).
 * Nomenclatura PT-BR (R-015 D2), não Rudd (Shadow/Gift/Siddhi).
 */
export type TrinityLevel = 'sombra' | 'dom' | 'graca';

/**
 * Resultado da análise tríade para um mapa astral.
 * Conta quantos aspectos estão em cada nível.
 */
export interface TrinityCount {
  sombra: number;
  dom: number;
  graca: number;
}

/**
 * Classifica um aspecto astrológico no nível tríade correspondente.
 *
 * Lógica:
 * - Conjunção, trígono, sextil → Dom (harmonia)
 * - Quadratura, oposição → Sombra (tensão)
 * - Conjunção exata com Sol/Lua (orbe < 1°) → Graça (alinhamento raro)
 *
 * @param aspect Aspecto astrológico do Pilar 2
 * @returns Nível tríade: 'sombra' | 'dom' | 'graca'
 */
export function classifyAspect(aspect: Aspecto): TrinityLevel {
  // Graça: conjunção exata com luminares (Sol/Lua) é alinhamento raro
  if (
    aspect.tipo === 'conjunção' &&
    aspect.orbe < 1.0 &&
    (aspect.planeta1 === 'sol' || aspect.planeta1 === 'lua' ||
     aspect.planeta2 === 'sol' || aspect.planeta2 === 'lua')
  ) {
    return 'graca';
  }

  // Sombra: aspectos tensos
  const tensos: AspectoTipo[] = ['quadratura', 'oposicao'];
  if (tensos.includes(aspect.tipo)) {
    return 'sombra';
  }

  // Dom: aspectos harmoniosos (default)
  return 'dom';
}

/**
 * Conta quantos aspectos estão em cada nível tríade.
 *
 * @param aspects Lista de aspectos do mapa astral
 * @returns Contagem por nível
 */
export function countTrinity(aspects: Aspecto[]): TrinityCount {
  const count: TrinityCount = { sombra: 0, dom: 0, graca: 0 };
  for (const aspect of aspects) {
    const level = classifyAspect(aspect);
    count[level]++;
  }
  return count;
}

/**
 * Determina o "nível dominante" de um mapa astral —
 * o sub-estado mais frequente na tríade.
 *
 * @param count Contagem por nível
 * @returns Nível dominante ('sombra' | 'dom' | 'graca')
 */
export function dominantTrinity(count: TrinityCount): TrinityLevel {
  if (count.graca > count.dom && count.graca > count.sombra) return 'graca';
  if (count.dom >= count.sombra) return 'dom';
  return 'sombra';
}
