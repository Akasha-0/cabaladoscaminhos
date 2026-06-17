/**
 * @akasha/core — Interpretation Engine: queries
 *
 * Funções públicas do motor de interpretação que consultam o conteúdo
 * profundo (VIDA_CONTENT) e devolvem VidaInterpretation / AreaInterpretation
 * para a aplicação.
 *
 * Separado de interpretation-engine.ts para isolar a API pública do motor
 * do catálogo de dados (que domina o tamanho do arquivo principal).
 *
 * Dependências:
 *  - `../interpretation-engine`: VIDA_CONTENT (catálogo) + MASTER_NUMBERS
 *    (apenas leitura em runtime — circular mas seguro porque os valores
 *    só são consumidos dentro dos corpos das funções).
 *  - `./builders`: monta AreaInterpretation a partir de NumeroContent.
 */

import type {
  AreaInterpretation,
  VidaInterpretation,
  AkashaLevel,
  LifeArea,
} from '@akasha/types';
import { buildInterpretation, buildFallback } from './builders';
import { MASTER_NUMBERS, VIDA_CONTENT } from '../interpretation-engine';

/**
 * Gera a interpretação profunda de um Número de Vida.
 *
 * @param numero - número de vida (1-9, 11, 22, 33)
 * @returns VidaInterpretation completa com 3 níveis (shadow/gift/siddhi)
 *          para cada uma das 9 áreas da vida.
 *
 * PILOTO: esta função é a primeira implementação do motor de interpretação
 * Akasha. Estende a shallow "descrição de número" para o modelo de 4 camadas:
 *   dado → significado → padrão → aplicação
 *
 * Os níveis shadow/gift/siddhi seguem o modelo Gene Keys adaptado para Akasha.
 */
export function interpretarVida(numero: number): VidaInterpretation {
  // Normalizar master numbers
  const n = numero;
  const isMaster = MASTER_NUMBERS.has(n);

  // Fallback para números fora do intervalo coberto
  if (!VIDA_CONTENT[n]) {
    return {
      numero: n,
      isMaster: false,
      levels: {
        shadow: buildFallback(n, 'shadow'),
        gift: buildFallback(n, 'gift'),
        siddhi: buildFallback(n, 'siddhi'),
      },
      mandato: `Seu Número de Vida é ${n}. Este número carrega uma energia única que convida você a descobrir seu significado através da experiência.`,
      arquetipoAkasha: `Número ${n}`,
    };
  }

  const content = VIDA_CONTENT[n];
  return {
    numero: n,
    isMaster,
    levels: {
      shadow: buildInterpretation(n, isMaster, content, 'shadow'),
      gift: buildInterpretation(n, isMaster, content, 'gift'),
      siddhi: buildInterpretation(n, isMaster, content, 'siddhi'),
    },
    mandato: content.mandato,
    arquetipoAkasha: content.arquetipoAkasha,
  };
}

/**
 * Gera a interpretação para uma área de vida específica de um Número de Vida.
 * Útil para mostrar apenas uma área (ex: "como este número afeta meus relacionamentos?").
 *
 * @param numero - número de vida
 * @param area - área de vida desejada
 * @param nivel - nível de profundidade (shadow | gift | siddhi)
 */
export function interpretarVidaArea(
  numero: number,
  area: LifeArea,
  nivel: AkashaLevel = 'gift',
): AreaInterpretation | null {
  const vida = interpretarVida(numero);
  const interp = vida.levels[nivel];
  if (!interp) return null;

  // Se a área existe na aplicação, usar
  if (interp.aplicacao[area]) {
    return interp;
  }
  return interp;
}
