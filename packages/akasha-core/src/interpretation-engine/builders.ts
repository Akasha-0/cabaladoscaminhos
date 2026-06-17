/**
 * @akasha/core — Interpretation Engine: builders
 *
 * Helpers que montam objetos AreaInterpretation a partir de conteúdo
 * estruturado (NumeroContent) ou de fallbacks genéricos.
 *
 * Separado de interpretation-engine.ts para reduzir o tamanho do
 * motor de interpretação e isolar a lógica de construção.
 */

import type { AreaInterpretation, AkashaLevel } from '@akasha/types';
import type { NumeroContent } from './types';

/**
 * Constrói a base de uma interpretação (campos compartilhados
 * por todas as áreas: codigo, dado, nivel).
 */
export function baseInterpretation(
  n: number,
  isMaster: boolean,
  nivel: AkashaLevel,
): Pick<AreaInterpretation, 'nivel' | 'codigo' | 'dado'> {
  const suffix = isMaster ? ` (Master ${n})` : '';
  return {
    nivel,
    codigo: `vida-${n}-${nivel}`,
    dado: `Seu Número de Vida é ${n}${suffix}.`,
  };
}

/**
 * Constrói uma interpretação completa para um nível (shadow/gift/siddhi)
 * a partir do conteúdo estruturado de um número.
 */
export function buildInterpretation(
  n: number,
  isMaster: boolean,
  content: NumeroContent,
  nivel: AkashaLevel,
): AreaInterpretation {
  const nivelContent = content.levels[nivel];
  return {
    ...baseInterpretation(n, isMaster, nivel),
    tituloPool: nivelContent.tituloPool,
    significado: nivelContent.significado,
    padrao: nivelContent.padrao,
    aplicacao: nivelContent.aplicacao,
    area: 'proposito',
    afirmacao: nivelContent.afirmacao,
  };
}

/**
 * Constrói uma interpretação genérica (fallback) usada quando o
 * número não está coberto pelo conteúdo profundo.
 */
export function buildFallback(n: number, nivel: AkashaLevel): AreaInterpretation {
  const labels: Record<AkashaLevel, string> = {
    shadow: 'O Desafio do Número',
    gift: 'O Dom do Número',
    siddhi: 'A Frequência do Número',
  };
  return {
    area: 'proposito',
    nivel,
    codigo: `vida-${n}-${nivel}`,
    tituloPool: labels[nivel],
    dado: `Seu Número de Vida é ${n}.`,
    significado: `O número ${n} carrega uma energia única que convida você a uma jornada de autoconhecimento. A interpretação específica para este número ainda está sendo desenvolvida — enquanto isso, as energias gerais do número ${n} se aplicam.`,
    padrao: `Com o Número de Vida ${n}, você está em um caminho de descoberta. A interpretação profunda deste número será liberada em breve. Enquanto isso, as qualidades gerais de ${n} — sua energia fundamental — convidam você a observar como este número se manifesta na sua vida.`,
    aplicacao: {
      proposito: `Observe como a energia do ${n} se manifesta no seu dia a dia. Onde você sente que ${n} é um recurso? Onde ele é um desafio?`,
    },
    afirmacao: `Eu estou descobrindo o significado profundo do meu número de vida ${n}.`,
  };
}
