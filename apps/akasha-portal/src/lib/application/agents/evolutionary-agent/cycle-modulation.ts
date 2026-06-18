/**
 * cycle-modulation.ts
 *
 * Cycle area-alignment helpers extracted from evolutionary-agent/index.ts.
 * Calculates how each life area aligns with the current personal cycle.
 */

import type { PersonalCycleSnapshot } from '@/lib/application/agents/personal-cycle-engine';
import type { CycleModulation } from './area-history';

// ─── Alignment Data ────────────────────────────────────────────────────────────

const YEAR_AREA_ALIGNMENT: Record<number, string[]> = {
  1: ['missaoDestino', 'oriCabecaQuizilas', 'carreiraProsperidade'],
  2: ['conexoesAmor', 'vitalidadeEnergia'],
  3: ['vitalidadeEnergia', 'conexoesAmor', 'carreiraProsperidade'],
  4: ['carreiraProsperidade', 'desafiosSombras'],
  5: ['missaoDestino', 'desafiosSombras', 'vitalidadeEnergia'],
  6: ['conexoesAmor', 'vitalidadeEnergia', 'carreiraProsperidade'],
  7: ['missaoDestino', 'oriCabecaQuizilas'],
  8: ['carreiraProsperidade', 'vitalidadeEnergia'],
  9: ['desafiosSombras', 'missaoDestino'],
  11: ['missaoDestino', 'oriCabecaQuizilas'],
  22: ['carreiraProsperidade', 'missaoDestino'],
};

const AREA_LABELS: Record<string, string> = {
  vitalidadeEnergia: 'Vitalidade e Energia',
  conexoesAmor: 'Conexões e Amor',
  carreiraProsperidade: 'Carreira e Prosperidade',
  oriCabecaQuizilas: 'Ori e Cabeça (Propósito)',
  missaoDestino: 'Missão e Destino',
  desafiosSombras: 'Desafios e Sombras',
};

// ─── Core Function ─────────────────────────────────────────────────────────────

/**
 * Calcula como cada área de vida se alinha com o ciclo pessoal actual.
 */
export function deriveCycleModulation(snapshot: PersonalCycleSnapshot): CycleModulation[] {
  const { personalYear, currentPinnacle } = snapshot;
  const yearNum = personalYear.number;
  const alignedAreas = YEAR_AREA_ALIGNMENT[yearNum] ?? [];

  const areas = [
    'vitalidadeEnergia',
    'conexoesAmor',
    'carreiraProsperidade',
    'oriCabecaQuizilas',
    'missaoDestino',
    'desafiosSombras',
  ];

  return areas.map((area) => {
    const isAligned = alignedAreas.includes(area);
    const alignmentScore = isAligned ? 80 : 40;
    const suggestedBoost: CycleModulation['suggestedBoost'] =
      alignmentScore >= 80 ? 'increase' : alignmentScore <= 40 ? 'decrease' : 'maintain';

    const rationale = isAligned
      ? `Ano pessoal ${yearNum} (${personalYear.theme}) favorece a área de ${AREA_LABELS[area]}. Pináculo ${currentPinnacle.number}: ${currentPinnacle.keyQuestion} — priorize esta área para alinhamento máximo.`
      : `Ano pessoal ${yearNum} (${personalYear.theme}) chama a atenção para outras áreas. A área de ${AREA_LABELS[area]} pode funcionar em modo de suporte — ${suggestedBoost === 'decrease' ? 'reduza o investimento directo' : suggestedBoost === 'increase' ? 'aumente a atenção' : 'mantenha o ritmo actual'}.`;

    return { area, alignmentScore, suggestedBoost, rationale };
  });
}
