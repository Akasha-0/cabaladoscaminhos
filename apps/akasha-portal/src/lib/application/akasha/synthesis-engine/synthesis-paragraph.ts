/**
 * synthesis-engine/synthesis-paragraph.ts
 *
 * Geração do parágrafo-síntese final integrando todas as áreas.
 * Split de synthesis-engine.ts.
 */

import type { AreaNarrative } from './synthesis-types';

/**
 * Constrói o parágrafo-síntese integrando as 6 áreas: áreas em Dom brilham,
 * áreas em Sombra pedem atenção, a área mais intensa vira a chamada do dia.
 */
export function buildSynthesisParagraph(
  vitalidade: AreaNarrative,
  conexoes: AreaNarrative,
  carreira: AreaNarrative,
  ori: AreaNarrative,
  missao: AreaNarrative,
  desafios: AreaNarrative
): string {
  const areas = [vitalidade, conexoes, carreira, ori, missao, desafios];
  const shadowAreas = areas.filter(a => a.frequency === 'shadow');
  const giftAreas = areas.filter(a => a.frequency === 'gift');
  const mostIntense = areas.reduce(
    (max, a) => (a.intensity > max.intensity ? a : max),
    areas[0]
  );

  const intro = 'Você nasceu com um perfil de vida raro:';
  const mid = giftAreas.length > 0
    ? `Quando você está no seu Dom, você brilha por ${giftAreas[0].giftStrengths?.[0] ?? 'sua capacidade de transformar'}.`
    : shadowAreas.length > 0
    ? `O padrão que mais pede atenção agora é: ${shadowAreas[0].shadowPattern.split('.')[0]}.`
    : `Continue o trabalho interior — você está em transformação.`;
  const action = `Hoje, a área que mais precisa de você é ${mostIntense.title} — ${mostIntense.practicalAdvice.split('.')[0]}.`;

  return `${intro} ${mid} ${action}`;
}
