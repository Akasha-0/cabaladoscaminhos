/**
 * synthesis-engine/derive-decision.ts
 *
 * Decisão diária (Strategy + Authority) baseada na área mais intensa do
 * perfil. Split de synthesis-engine.ts.
 */

import type { AstrologyMap, KabalisticMap, TantricMap, OduBirth } from '@akasha/types';
import type {
  AkashaAuthority,
  AkashaStrategy,
  AreaNarrative,
  DailyDecision,
} from './synthesis-types';

export function deriveStrategy(
  area: AreaNarrative,
  _astro: AstrologyMap | null,
  _kab: KabalisticMap | null,
  _tantra: TantricMap | null,
  _odu: OduBirth | null,
  _date: Date
): { type: AkashaStrategy; explanation: string } {
  if (area.frequency === 'shadow' && area.intensity >= 2) {
    if (area.area === 'vitalidadeEnergia') {
      return {
        type: 'wait',
        explanation: `Seu corpo está pedindo que você diminua o ritmo. A área de ${area.title} está em modo Shadow — forçar agora traz exaustão.`,
      };
    }
    if (area.area === 'conexoesAmor') {
      return {
        type: 'observe',
        explanation: `Você não deve agir emocionalmente hoje. Observe como se sente antes de reagir — seus relacionamentos pedem que você espere a resposta visceral.`,
      };
    }
    if (area.area === 'carreiraProsperidade') {
      return {
        type: 'wait',
        explanation: `A prosperidade não vem de forçar. Hoje é dia de preparar terreno — não de colher. Confie no processo.`,
      };
    }
    if (area.area === 'desafiosSombras') {
      return {
        type: 'observe',
        explanation: `Você está face a face com um padrão antigo. Não lute, não fuja — observe e anote o que surge.`,
      };
    }
    return {
      type: 'wait',
      explanation: `A área de ${area.title} está em tensão. Hoje não é dia de forçar — é dia de compreender.`,
    };
  }

  if (area.frequency === 'gift' && area.intensity <= 2) {
    return {
      type: 'act',
      explanation: `${area.title} está em Gift — você tem energia para agir. Este é um bom dia para tomar decisões nesta área.`,
    };
  }

  return {
    type: 'observe',
    explanation: `Equilíbrio. Há tensão e graça coexistindo. Hoje: observe mais, julgue menos, deixe que as coisas se revelem.`,
  };
}

function getAuthorityQuestion(authority: AkashaAuthority): string {
  switch (authority) {
    case 'emotional':
      return 'Quando você pensa nesta decisão: sente calor no peito ou peso no estômago?';
    case 'sacral':
      return 'Quando você considera esta escolha: sente uma resposta de "sim" ou "não" no seu corpo (abaixo do umbigo)?';
    case 'splenic':
      return 'Você tem um "click" de intuição agora ou é só ruído mental?';
    case 'mental':
      return 'Você está decidindo com a mente ou com o coração? A mente pode estar te enganando.';
  }
}

export function deriveRecommendationAvoid(
  mostIntense: AreaNarrative,
  _allAreas: AreaNarrative[]
): { recommendation: string; avoid: string } {
  switch (mostIntense.area) {
    case 'vitalidadeEnergia':
      return {
        recommendation: mostIntense.practicalAdvice || 'Respeite seus ciclos de energia — descanse se precisar.',
        avoid: 'Evite forçar atividades físicas intensas ou ignorar sinais de fadiga.',
      };
    case 'conexoesAmor':
      return {
        recommendation: mostIntense.practicalAdvice || 'Hoje: esteja presente com quem você ama sem expectativa.',
        avoid: 'Evite iniciar conflitos emocionais ou tomar decisões sobre relacionamentos hoje.',
      };
    case 'carreiraProsperidade':
      return {
        recommendation: mostIntense.practicalAdvice || 'Prepare terreno: revise planos, organize prioridades, sonhe com o futuro.',
        avoid: 'Evite fechar contratos importantes ou fazer grandes gastos hoje.',
      };
    case 'oriCabecaQuizilas':
      return {
        recommendation: mostIntense.practicalAdvice || 'Confie mais na sua intuição e menos em opiniões externas.',
        avoid: 'Evite tomar decisões baseadas em medo ou pressão de outros.',
      };
    case 'missaoDestino':
      return {
        recommendation: mostIntense.practicalAdvice || 'Pergunte-se: estou vivendo minha verdade ou estou vivendo o esperado?',
        avoid: 'Evite fugir de sua autenticidade para agradar ou pertencer.',
      };
    case 'desafiosSombras':
      return {
        recommendation: mostIntense.practicalAdvice || 'Olhe para o padrão com compaixão, não julgamento.',
        avoid: 'Evite fugir da dor ou usar substâncias/distrações para evitar o confronto.',
      };
  }
}

/**
 * Deriva a decisão diária (strategy + authority + recommendation + avoid)
 * baseada nas 6 áreas e na área mais intensa.
 */
export function deriveDailyDecision(
  areaVitalidade: AreaNarrative,
  areaConexoes: AreaNarrative,
  areaCarreira: AreaNarrative,
  areaOri: AreaNarrative,
  areaMissao: AreaNarrative,
  areaDesafios: AreaNarrative,
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  date: Date = new Date()
): DailyDecision {
  const areas = [areaVitalidade, areaConexoes, areaCarreira, areaOri, areaMissao, areaDesafios];
  const mostIntense = areas.reduce(
    (max, a) => (a.intensity > max.intensity ? a : max),
    areas[0]
  );

  const strategy = deriveStrategy(mostIntense, astro, kab, tantra, odu, date);
  const authority = deriveAkashaAuthorityForDecision(astro, kab, tantra, odu);
  const { recommendation, avoid } = deriveRecommendationAvoid(mostIntense, areas);

  return {
    strategy: strategy.type,
    strategyExplanation: strategy.explanation,
    authority,
    authorityQuestion: getAuthorityQuestion(authority),
    recommendation,
    avoid,
  };
}

function deriveAkashaAuthorityForDecision(
  _astro: AstrologyMap | null,
  _kab: KabalisticMap | null,
  tantra: TantricMap | null,
  _odu: OduBirth | null
): AkashaAuthority {
  // Re-export decision-specific authority resolution; the original logic
  // for full profile lives in derive-akasha-type.ts.
  const bodies = tantra?.bodies;
  if (bodies) {
    const numbers: Array<{ key: string; number: number }> = [
      { key: 'fisico', number: bodies.fisico?.number ?? 0 },
      { key: 'pranic', number: bodies.pranic?.number ?? 0 },
      { key: 'emocional', number: bodies.emocional?.number ?? 0 },
      { key: 'mental', number: bodies.mental?.number ?? 0 },
      { key: 'espiritual', number: bodies.espiritual?.number ?? 0 },
    ];
    numbers.sort((a, b) => b.number - a.number);
    const dominant = numbers[0]?.number;
    if (dominant !== undefined && dominant > 0) {
      if (dominant >= 7) return 'mental';
      if (dominant >= 4) return 'emotional';
      return 'sacral';
    }
  }
  return 'sacral';
}
