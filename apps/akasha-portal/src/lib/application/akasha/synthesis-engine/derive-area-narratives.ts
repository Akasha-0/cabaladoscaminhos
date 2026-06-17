/**
 * synthesis-engine/derive-area-narratives.ts
 *
 * Derivações narrativas por área de vida (6 áreas). Cada função monta um
 * AreaNarrative completo integrando os 5 pilares. Split de synthesis-engine.ts.
 */

import type { AstrologyMap, KabalisticMap, TantricMap, OduBirth } from '@akasha/types';
import type { AkashicHologram } from '@/lib/domain/mapa/hologram-aggregator';
import { generateAreaNarrativeFull, buildTransformacaoIChingNarrative } from '../narrative-generator';
import type { AreaNarrative } from './synthesis-types';
import {
  buildAreaRitual,
  buildGiftPattern,
  buildGiftStrengths,
  buildPracticalAdvice,
  buildShadowPattern,
  buildShadowSymptoms,
  buildTransformationPrompt,
} from './area-builders';
import { assessAreaFrequency } from './frequency-analysis';
import { deriveDailyTransitOverlay } from './derive-daily-transit';
import { deriveSexualArchetype } from './derive-sexual-archetype';
import {
  getElementalBodyFocus,
  getElementalMentalMode,
  getJupiterProsperity,
  getKabalisticMotivationRel,
  getLifePathCareer,
  getLifePathGist,
  getLifePathRhythm,
  getLilithHiddenDesire,
  getMasterLifePathGift,
  getMidheavenCareer,
  getMissionDescription,
  getMoonDefensivePattern,
  getMoonEmotionalNeed,
  getTantricDivineGift,
  getTantricPathDescription,
  getTantricSoulBond,
  getTantricVitalityAdvice,
  getTantricVitalityDescription,
  getVenusLoveStyle,
  getVenusNeed,
  getVenusRelationalHabit,
  getExpressionCareer,
} from './semantic-lookups';

// ─── Chain of reasoning (F-230) ───────────────────────────────────────────

function deriveChainOfReasoning(
  area: string,
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null
): string[] {
  const steps: string[] = [];

  if (area === 'vitalidadeEnergia') {
    if (astro?.dominantPlanet) {
      steps.push(`${astro.dominantPlanet} é seu planeta dominante (Akasha) → governa como você canaliza energia`);
    }
    if (astro?.elementalChart) {
      const el = astro.elementalChart;
      const dominant = Object.entries(el).sort((a, b) => b[1] - a[1])[0];
      if (dominant && dominant[1] > 0) {
        steps.push(`Elemento ${dominant[0]} predominante (${dominant[1]}/4) → seu corpo responde ao mundo por ${dominant[0]}`);
      }
    }
    if (tantra?.bodies?.pranic) {
      steps.push(`Corpo Prânico ${tantra.bodies.pranic.number}/11 (Energia) → nível de energia vital funcional`);
    }
    if (tantra?.bodies?.fisico) {
      steps.push(`Corpo Físico ${tantra.bodies.fisico.number}/11 (Energia) → como você habita seu corpo`);
    }
    if (kab?.lifePath) {
      steps.push(`Caminho de Vida ${kab.lifePath} (Akasha) → seu ritmo cíclico de regeneração`);
    }
    if (odu?.elementalForce) {
      steps.push(`Força Elemental ${odu.elementalForce} (Akasha) → o elemento que seu corpo mais precisa nutrir`);
    }
    if (steps.length > 0) {
      steps.push(`${steps.length} sinais convergentes → Vitalidade é sua área de transformação primária neste ciclo`);
    }
  } else if (area === 'conexoesAmor') {
    const venus = astro?.planets?.find(p => p.planet === 'Vênus');
    if (venus) {
      steps.push(`Vênus em ${venus.sign} (Akasha) → como você ama e o que você precisa no vínculo`);
    }
    if (astro?.planets?.find(p => p.planet === 'Lua')) {
      const moon = astro.planets.find(p => p.planet === 'Lua')!;
      steps.push(`Lua em ${moon.sign} (Akasha) → seu mundo emocional e estilo de necessidade de cuidado`);
    }
    if (tantra?.soul) {
      steps.push(`Alma Tântrica ${tantra.soul} (Energia) → seu padrão de vínculo e profundidade emocional`);
    }
    if (kab?.lifePath) {
      steps.push(`Caminho de Vida ${kab.lifePath} (Akasha) → como você coopera ou compete nos relacionamentos`);
    }
    if (odu?.oduName) {
      steps.push(`Odu ${odu.oduName} (Akasha) → sua lição de vida no campo relacional`);
    }
    if (steps.length > 0) {
      steps.push(`${steps.length} sinais convergentes → Conexões é onde sua frequência de transformação se manifesta primeiro`);
    }
  } else if (area === 'carreiraProsperidade') {
    if (astro?.midheaven) {
      steps.push(`Meio do Céu em ${astro.midheaven} (Akasha) → sua vocação pública e caminho de prosperidade`);
    }
    if (kab?.expression) {
      steps.push(`Expressão ${kab.expression} (Akasha) → como você manifesta seus dons no mundo`);
    }
    if (kab?.lifePath) {
      steps.push(`Caminho de Vida ${kab.lifePath} (Akasha) → seu propósito de contribuição`);
    }
    if (tantra?.divineGift) {
      steps.push(`Dom Divino ${tantra.divineGift} (Energia) → talento inato que se expressa no trabalho`);
    }
    if (odu?.lifeLesson) {
      steps.push(`Lição de Vida ${odu.lifeLesson} (Akasha) → o que você está aqui para aprender e ensinar`);
    }
    if (steps.length > 0) {
      steps.push(`${steps.length} sinais convergentes → Carreira é sua área de expressão de propósito`);
    }
  } else if (area === 'oriCabecaQuizilas') {
    if (odu?.oduName) {
      steps.push(`Odu ${odu.oduName} (Akasha) → sua linha de intuição e comando interior`);
    }
    if (odu?.orixaRegency?.length) {
      steps.push(`Orixá ${odu.orixaRegency[0]} (Akasha) → a energia que governa sua cabeça e decisões`);
    }
    if (tantra?.karma) {
      steps.push(`Carma Tântrico ${tantra.karma} (Energia) → padrão que precisa ser consciência antes de ação`);
    }
    if (kab?.lifePath) {
      steps.push(`Caminho de Vida ${kab.lifePath} (Akasha) → o tipo de autoridade que você reconhece`);
    }
    if (astro?.planets?.find(p => p.planet === 'Mercúrio')) {
      const merc = astro.planets.find(p => p.planet === 'Mercúrio')!;
      steps.push(`Mercúrio em ${merc.sign} (Akasha) → como sua mente processa e comunica`);
    }
    if (steps.length > 0) {
      steps.push(`${steps.length} sinais da mente convergem → Ori é sua área de integração do comando`);
    }
  } else if (area === 'missaoDestino') {
    if (kab?.mission) {
      steps.push(`Missão ${kab.mission} (Akasha) → o chamado central da sua jornada`);
    }
    if (kab?.lifePath) {
      steps.push(`Caminho de Vida ${kab.lifePath} (Akasha) → o arco de transformação ao longo da vida`);
    }
    if (tantra?.destiny) {
      steps.push(`Destino Tântrico ${tantra.destiny} (Energia) → o que sua alma veio realizar`);
    }
    if (astro?.planets?.find(p => p.planet === 'Sol')) {
      const sol = astro.planets.find(p => p.planet === 'Sol')!;
      steps.push(`Sol em ${sol.sign} (Akasha) → seu centro de identidade e brilho autêntico`);
    }
    if (odu?.oduName) {
      steps.push(`Odu ${odu.oduName} (Akasha) → seu alinhamento com o destino cósmico`);
    }
    if (steps.length > 0) {
      steps.push(`${steps.length} sinais do destino convergem → Missão é sua área de alinhamento com o propósito maior`);
    }
  } else if (area === 'desafiosSombras') {
    if (astro?.planets?.find((p: { planet: string; sign: string }) => p.planet === 'Saturno')) {
      const sat = astro.planets.find((p: { planet: string; sign: string }) => p.planet === 'Saturno')!;
      steps.push(`Saturno em ${sat.sign} (Akasha) → sua lição de vida e o que cobra de você`);
    }
    if (astro?.planets?.find(p => p.planet === 'Plutão')) {
      const pl = astro.planets.find(p => p.planet === 'Plutão')!;
      steps.push(`Plutão em ${pl.sign} (Akasha) → seu campo de transformação forçada e regeneração`);
    }
    if (kab?.karmicLessons?.length) {
      steps.push(`Lições Kármicas ${kab.karmicLessons.join(', ')} (Akasha) → padrões a serem integrados`);
    }
    if (kab?.challenges?.main) {
      steps.push(`Desafio Principal ${kab.challenges.main} (Akasha) → a sombra que bloqueia seu potencial`);
    }
    if (tantra?.karma) {
      steps.push(`Carma Tântrico ${tantra.karma} (Energia) → padrão tântrico a ser transmutado`);
    }
    if (odu?.lifeLesson) {
      steps.push(`Lição de Vida ${odu.lifeLesson} (Akasha) → o desafio que o Odu coloca para sua evolução`);
    }
    if (steps.length > 0) {
      steps.push(`${steps.length} sinais da sombra convergem → Desafios é onde a transformação precisa acontecer primeiro`);
    }
  }

  return steps;
}

// ─── Vitalidade & Energia ──────────────────────────────────────────────────

export function deriveVitalidadeEnergia(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  holo: AkashicHologram,
  _synthesizedProfile: import('@akasha/core').SynthesizedProfile | undefined,
  date: Date = new Date()
): AreaNarrative {
  const cabalaStr = kab?.lifePath
    ? `Seu Caminho de Vida Cabalístico ${kab.lifePath} indica que sua energia física opera em ciclos de ${getLifePathRhythm(kab.lifePath)}. Você tende a regenerar melhor quando respeita esses ciclos em vez de forçar continuidade.`
    : '';

  const tantraStr = tantra?.bodies?.fisico
    ? `Seu Corpo Físico Tântrico (${tantra.bodies.fisico.number}/11) revela que sua vitalidade é ${getTantricVitalityDescription(tantra.bodies.fisico.number)} — ${getTantricVitalityAdvice(tantra.bodies.fisico.number)}.`
    : '';

  const oduStr = odu?.elementalForce
    ? `Seu Odu de Nascimento carrega a força elemental ${odu.elementalForce}, o que significa que seu corpo responde especialmente a ${getElementalBodyFocus(odu.elementalForce)}.`
    : '';

  const astroStr = astro?.dominantPlanet
    ? `O planeta ${astro.dominantPlanet} domina seu mapa astral, indicando que sua energia vital é condicionada pela forma como você se expressa em ${astro.dominantPlanet.toLowerCase()}.`
    : '';

  const shadowSymptoms = buildShadowSymptoms(astro, kab, tantra, odu, _synthesizedProfile, 'vitalidade');
  const giftStrengths = buildGiftStrengths(astro, kab, tantra, odu, _synthesizedProfile, 'vitalidade');
  const shadowPattern = buildShadowPattern(astro, kab, tantra, odu, 'vitalidade');
  const giftPattern = buildGiftPattern(astro, kab, tantra, odu, 'vitalidade');
  const { frequency, intensity } = assessAreaFrequency(astro, kab, tantra, odu, 'vitalidade');
  const dailyRitual = buildAreaRitual(astro, kab, tantra, odu, 'vitalidade', holo);
  const transformationPrompt = buildTransformationPrompt(
    astro, kab, tantra, odu, 'vitalidade',
    'Você percebe que vem ignorando os sinais de exaustão do seu corpo? Como seria respeitar seus ciclos de energia hoje?'
  );
  const dailyTransit = deriveDailyTransitOverlay(astro, kab, tantra, odu, 'vitalidadeEnergia', date);
  const sexualidade = deriveSexualArchetype(astro, kab, tantra, odu);
  const expandedNarrative = generateAreaNarrativeFull('vitalidadeEnergia', kab, astro, tantra, odu, holo, _synthesizedProfile);

  return {
    area: 'vitalidadeEnergia',
    title: 'Vitalidade & Energia',
    frequency,
    intensity,
    shadowPattern,
    shadowSymptoms,
    giftPattern,
    giftStrengths,
    pillarContribution: {
      cabala: cabalaStr,
      tantra: tantraStr,
      odus: oduStr,
      astrologia: astroStr,
      iching: buildTransformacaoIChingNarrative(holo, 'vitalidadeEnergia', _synthesizedProfile),
    },
    practicalAdvice: buildPracticalAdvice(astro, kab, tantra, odu, 'vitalidade'),
    dailyRitual,
    transformationPrompt,
    dailyTransit,
    sexualidade,
    expandedNarrative,
    chainOfReasoning: deriveChainOfReasoning('vitalidadeEnergia', astro, kab, tantra, odu),
  };
}

// ─── Conexões & Amor ───────────────────────────────────────────────────────
export function deriveConexoesAmor(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  holo: AkashicHologram,
  _synthesizedProfile: import('@akasha/core').SynthesizedProfile | undefined,
  date: Date
): AreaNarrative {
  const data = holo.conexoesAmor.keyData;

  const venus = data.venus;
  const venusStr = venus
    ? `Vênus em ${venus.sign} na Casa ${venus.house} indica que você ama de forma ${getVenusLoveStyle(venus.sign)} — ${getVenusNeed(venus.sign)}. Seus relacionamentos florescem quando ${getVenusRelationalHabit(venus.sign)}.`
    : '';

  const moon = data.moon;
  const moonStr = moon
    ? `A Lua em ${moon.sign} revela que você precisa de ${getMoonEmotionalNeed(moon.sign)} para se sentir emocionalmente seguro. Sem isso, você recua para padrões de ${getMoonDefensivePattern(moon.sign)}.`
    : '';

  const lilith = data.lilith;
  const lilithStr = lilith
    ? `Lilith em ${lilith.sign} aponta para um aspecto de sua sexualidade que você escondeu ou que foi punido: ${getLilithHiddenDesire(lilith.sign)}. Isso afeta como você vivencia intimidade.`
    : '';

  const soulStr = tantra?.soul
    ? `Seu Número de Alma Tântrico ${tantra.soul} indica que seus vínculos mais profundos são formados por ${getTantricSoulBond(tantra.soul)}.`
    : '';

  const motivationStr = kab?.motivation
    ? `Seu Número de Motivação Cabalístico ${kab.motivation} mostra que o que você busca inconscientemente em relações é: ${getKabalisticMotivationRel(kab.motivation)}.`
    : '';
  const shadowSymptoms = buildShadowSymptoms(astro, kab, tantra, odu, _synthesizedProfile, 'conexoes');
  const shadowPattern = buildShadowPattern(astro, kab, tantra, odu, 'conexoes');
  const giftStrengths = buildGiftStrengths(astro, kab, tantra, odu, _synthesizedProfile, 'conexoes');
  const giftPattern = buildGiftPattern(astro, kab, tantra, odu, 'conexoes');
  const { frequency, intensity } = assessAreaFrequency(astro, kab, tantra, odu, 'conexoes');
  const dailyRitual = buildAreaRitual(astro, kab, tantra, odu, 'conexoes', holo);
  const transformationPrompt = buildTransformationPrompt(
    astro, kab, tantra, odu, 'conexoes',
    'Você tem traído seus próprios limites emocionais para agradar o outro? O que sua intuição diz sobre esta relação agora?'
  );
  const dailyTransit = deriveDailyTransitOverlay(astro, kab, tantra, odu, 'conexoesAmor', date);
  const expandedNarrative = generateAreaNarrativeFull('conexoesAmor', kab, astro, tantra, odu, holo, _synthesizedProfile);

  return {
    area: 'conexoesAmor',
    title: 'Conexões & Amor',
    frequency,
    intensity,
    shadowPattern,
    shadowSymptoms,
    giftPattern,
    giftStrengths,
    pillarContribution: {
      cabala: motivationStr,
      tantra: soulStr,
      odus: '',
      astrologia: `${venusStr} ${moonStr} ${lilithStr}`.trim(),
      iching: buildTransformacaoIChingNarrative(holo, 'conexoesAmor', _synthesizedProfile),
    },
    practicalAdvice: buildPracticalAdvice(astro, kab, tantra, odu, 'conexoes'),
    dailyRitual,
    transformationPrompt,
    dailyTransit,
    expandedNarrative,
    chainOfReasoning: deriveChainOfReasoning('conexoesAmor', astro, kab, tantra, odu),
  };
}

// ─── Carreira & Prosperidade ───────────────────────────────────────────────

export function deriveCarreiraProsperidade(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  holo: AkashicHologram,
  _synthesizedProfile: import('@akasha/core').SynthesizedProfile | undefined,
  date: Date
): AreaNarrative {
  const data = holo.carreiraProsperidade.keyData;

  const lifePathStr = kab?.lifePath
    ? `Com Caminho de Vida Cabalístico ${kab.lifePath}, seu trabalho ideal é aquele que permite ${getLifePathCareer(kab.lifePath)}. Você prospera quando sente que está construindo algo que dura.`
    : '';

  const expressionStr = kab?.expression
    ? `Seu Número de Expressão ${kab.expression} revela que você se comunica e se destaca por ${getExpressionCareer(kab.expression)}. Esta é sua rota mais natural para reconhecimento e abundância.`
    : '';

  const midheaven = data.midheaven;
  const midheavenStr = midheaven
    ? `Seu Meio-do-Céu em ${midheaven} indica que sua vocação pública é realizada através de ${getMidheavenCareer(midheaven)}.`
    : '';

  const jupiter = data.jupiter;
  const jupiterStr = jupiter
    ? `Júpiter em ${jupiter.sign} na Casa ${jupiter.house} mostra que sua prosperidade se expande quando você ${getJupiterProsperity(jupiter.sign)}.`
    : '';

  const divineGiftStr = tantra?.divineGift
    ? `Seu Dom Divino Tântrico ${tantra.divineGift} indica que você tem um talento inato para ${getTantricDivineGift(tantra.divineGift)} — isso é o que você pode oferecer ao mundo com facilidade e alegria.`
    : '';
  const shadowSymptoms = buildShadowSymptoms(astro, kab, tantra, odu, _synthesizedProfile, 'carreira');
  const shadowPattern = buildShadowPattern(astro, kab, tantra, odu, 'carreira');
  const giftStrengths = buildGiftStrengths(astro, kab, tantra, odu, _synthesizedProfile, 'carreira');
  const giftPattern = buildGiftPattern(astro, kab, tantra, odu, 'carreira');
  const { frequency, intensity } = assessAreaFrequency(astro, kab, tantra, odu, 'carreira');
  const dailyRitual = buildAreaRitual(astro, kab, tantra, odu, 'carreira', holo);
  const transformationPrompt = buildTransformationPrompt(
    astro, kab, tantra, odu, 'carreira',
    'Você tem adiado uma decisão profissional por medo de não ser bom o suficiente? O que aconteceria se você agisse como se já fosse?'
  );
  const dailyTransit = deriveDailyTransitOverlay(astro, kab, tantra, odu, 'carreiraProsperidade', date);
  const expandedNarrative = generateAreaNarrativeFull('carreiraProsperidade', kab, astro, tantra, odu, holo, _synthesizedProfile);

  return {
    area: 'carreiraProsperidade',
    title: 'Carreira & Prosperidade',
    frequency,
    intensity,
    shadowPattern,
    shadowSymptoms,
    giftPattern,
    giftStrengths,
    pillarContribution: {
      cabala: lifePathStr || expressionStr,
      tantra: divineGiftStr,
      odus: '',
      astrologia: midheavenStr || jupiterStr,
      iching: buildTransformacaoIChingNarrative(holo, 'carreiraProsperidade', _synthesizedProfile),
    },
    practicalAdvice: buildPracticalAdvice(astro, kab, tantra, odu, 'carreira'),
    dailyRitual,
    transformationPrompt,
    dailyTransit,
    expandedNarrative,
    chainOfReasoning: deriveChainOfReasoning('carreiraProsperidade', astro, kab, tantra, odu),
  };
}

// ─── Ori, Cabeça & Quizilas ────────────────────────────────────────────────

export function deriveOriCabecaQuizilas(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  holo: AkashicHologram,
  _synthesizedProfile: import('@akasha/core').SynthesizedProfile | undefined,
  date: Date
): AreaNarrative {
  const oduStr = odu?.oduName && odu?.oduNumber
    ? `Seu Odu de Nascimento é ${odu.oduName} (${odu.oduNumber}), regido por ${(odu.orixaRegency || []).join(', ')}. Sua lição de vida é: "${odu.lifeLesson || 'aprender a direção correta'}". ${(odu.prohibitions || []).length > 0 ? `As proibições deste Odu incluem: ${odu.prohibitions?.join(', ')}.` : ''}`
    : '';

  const elementalStr = odu?.elementalForce
    ? `A força elemental ${odu.elementalForce} domina sua intuição. Isso significa que sua mente opera principalmente através de ${getElementalMentalMode(odu.elementalForce)}.`
    : '';

  const purposeStr = tantra?.destiny
    ? `Seu Destino Tântrico indica que você veio ao mundo para ${tantra.destiny}.`
    : '';

  const shadowSymptoms = buildShadowSymptoms(astro, kab, tantra, odu, _synthesizedProfile, 'ori');
  const shadowPattern = buildShadowPattern(astro, kab, tantra, odu, 'ori');
  const giftStrengths = buildGiftStrengths(astro, kab, tantra, odu, _synthesizedProfile, 'ori');
  const giftPattern = buildGiftPattern(astro, kab, tantra, odu, 'ori');
  const { frequency, intensity } = assessAreaFrequency(astro, kab, tantra, odu, 'ori');
  const dailyRitual = buildAreaRitual(astro, kab, tantra, odu, 'ori', holo);
  const transformationPrompt = buildTransformationPrompt(
    astro, kab, tantra, odu, 'ori',
    'Você tem confiado mais em opiniões externas do que em sua própria percepção? Quando foi a última vez que você seguiu sua intuição e foi surpreendido positivamente?'
  );
  const dailyTransit = deriveDailyTransitOverlay(astro, kab, tantra, odu, 'oriCabecaQuizilas', date);
  const expandedNarrative = generateAreaNarrativeFull('oriCabecaQuizilas', kab, astro, tantra, odu, holo, _synthesizedProfile);

  return {
    area: 'oriCabecaQuizilas',
    title: 'Ori, Cabeça & Quizilas',
    frequency,
    intensity,
    shadowPattern,
    shadowSymptoms,
    giftPattern,
    giftStrengths,
    pillarContribution: {
      cabala: '',
      tantra: purposeStr,
      odus: `${oduStr} ${elementalStr}`.trim(),
      astrologia: '',
      iching: buildTransformacaoIChingNarrative(holo, 'oriCabecaQuizilas', _synthesizedProfile),
    },
    practicalAdvice: buildPracticalAdvice(astro, kab, tantra, odu, 'ori'),
    dailyRitual,
    transformationPrompt,
    dailyTransit,
    chainOfReasoning: deriveChainOfReasoning('oriCabecaQuizilas', astro, kab, tantra, odu),
  };
}

// ─── Missão & Destino ──────────────────────────────────────────────────────

export function deriveMissaoDestino(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  holo: AkashicHologram,
  _synthesizedProfile: import('@akasha/core').SynthesizedProfile | undefined,
  date: Date
): AreaNarrative {
  const missionStr = kab?.mission
    ? `Seu Número de Missão Cabalístico ${kab.mission} indica que sua missão de vida envolve ${getMissionDescription(kab.mission)}.`
    : '';

  const lifePathStr = kab?.lifePath && kab?.lifePathMaster
    ? `Por ser um Caminho de Vida ${kab.lifePath} (número mestre), você tem uma missão espiritual mais elevada que maioria. O mundo precisa que você expresse ${getMasterLifePathGift(kab.lifePath)}.`
    : kab?.lifePath
    ? `Seu Caminho de Vida ${kab.lifePath} indica que você está aqui para desenvolver ${getLifePathGist(kab.lifePath)}.`
    : '';

  const tantricPathStr = tantra?.tantricPath
    ? `Seu Caminho Tântrico ${tantra.tantricPath} revela que sua jornada espiritual segue através de ${getTantricPathDescription(tantra.tantricPath)}.`
    : '';

  const destinyStr = tantra?.destiny
    ? `Seu destino é: ${tantra.destiny}.`
    : '';

  const shadowSymptoms = buildShadowSymptoms(astro, kab, tantra, odu, _synthesizedProfile, 'missao');
  const shadowPattern = buildShadowPattern(astro, kab, tantra, odu, 'missao');
  const giftStrengths = buildGiftStrengths(astro, kab, tantra, odu, _synthesizedProfile, 'missao');
  const giftPattern = buildGiftPattern(astro, kab, tantra, odu, 'missao');
  const { frequency, intensity } = assessAreaFrequency(astro, kab, tantra, odu, 'missao');
  const dailyRitual = buildAreaRitual(astro, kab, tantra, odu, 'missao', holo);
  const transformationPrompt = buildTransformationPrompt(
    astro, kab, tantra, odu, 'missao',
    'Você está vivendo uma vida alinhada com quem você realmente é, ou tem vivido para validar expectativas externas?'
  );
  const dailyTransit = deriveDailyTransitOverlay(astro, kab, tantra, odu, 'missaoDestino', date);
  const expandedNarrative = generateAreaNarrativeFull('missaoDestino', kab, astro, tantra, odu, holo, _synthesizedProfile);

  return {
    area: 'missaoDestino',
    title: 'Missão & Destino',
    frequency,
    intensity,
    shadowPattern,
    shadowSymptoms,
    giftPattern,
    giftStrengths,
    pillarContribution: {
      cabala: `${missionStr} ${lifePathStr}`.trim(),
      tantra: `${tantricPathStr} ${destinyStr}`.trim(),
      odus: '',
      astrologia: '',
      iching: buildTransformacaoIChingNarrative(holo, 'missaoDestino', _synthesizedProfile),
    },
    practicalAdvice: buildPracticalAdvice(astro, kab, tantra, odu, 'missao'),
    dailyRitual,
    transformationPrompt,
    dailyTransit,
    expandedNarrative,
    chainOfReasoning: deriveChainOfReasoning('missaoDestino', astro, kab, tantra, odu),
  };
}

// ─── Desafios & Sombras ────────────────────────────────────────────────────
export function deriveDesafiosSombras(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  holo: AkashicHologram,
  _synthesizedProfile: import('@akasha/core').SynthesizedProfile | undefined,
  date: Date
): AreaNarrative {
  const shadowSymptoms = buildShadowSymptoms(astro, kab, tantra, odu, _synthesizedProfile, 'desafios');
  const shadowPattern = buildShadowPattern(astro, kab, tantra, odu, 'desafios');
  const giftStrengths = buildGiftStrengths(astro, kab, tantra, odu, _synthesizedProfile, 'desafios');
  const giftPattern = buildGiftPattern(astro, kab, tantra, odu, 'desafios');
  const { frequency, intensity } = assessAreaFrequency(astro, kab, tantra, odu, 'desafios');
  const dailyRitual = buildAreaRitual(astro, kab, tantra, odu, 'desafios', holo);
  const transformationPrompt = buildTransformationPrompt(
    astro, kab, tantra, odu, 'desafios',
    'Você está fugindo de uma dor que precisa ser abraçada? Qual seria o primeiro passo para olhar para este padrão de frente?'
  );

  const karmicDebtsStr = kab?.karmicDebts && kab.karmicDebts.length > 0
    ? `Dívidas kármicas Cabalísticas: ${kab.karmicDebts.join(', ')}.`
    : '';

  const challengesStr = kab?.challenges?.first || kab?.challenges?.second
    ? `Seus desafios são: ${[kab.challenges?.first, kab.challenges?.second].filter(Boolean).join(' e ')}.`
    : '';

  const data = holo.desafiosSombras.keyData;
  const saturnStr = data.saturn
    ? `Saturno em ${data.saturn.sign} na Casa ${data.saturn.house} é onde você sente limite e exigência. Onde há Saturno, há lição kármica.`
    : '';

  const plutoStr = data.pluto
    ? `Plutão em ${data.pluto.sign} na Casa ${data.pluto.house} é seu campo de transformação forçada. Plutão não pede permissão — ele dissolve.`
    : '';

  const dailyTransit = deriveDailyTransitOverlay(astro, kab, tantra, odu, 'desafiosSombras', date);
  const expandedNarrative = generateAreaNarrativeFull('desafiosSombras', kab, astro, tantra, odu, holo, _synthesizedProfile);

  return {
    area: 'desafiosSombras',
    title: 'Desafios & Sombras',
    frequency,
    intensity,
    shadowPattern,
    shadowSymptoms,
    giftPattern,
    giftStrengths,
    pillarContribution: {
      cabala: `${karmicDebtsStr} ${challengesStr}`.trim(),
      tantra: tantra?.karma ? `Seu Carma Tântrico ${tantra.karma} indica padrões a serem transmutados nesta vida.` : '',
      odus: odu?.lifeLesson ? `Lição de Vida Ifá: ${odu.lifeLesson}.` : '',
      astrologia: `${saturnStr} ${plutoStr}`.trim(),
      iching: buildTransformacaoIChingNarrative(holo, 'desafiosSombras', _synthesizedProfile),
    },
    practicalAdvice: buildPracticalAdvice(astro, kab, tantra, odu, 'desafios'),
    dailyRitual,
    transformationPrompt,
    dailyTransit,
    expandedNarrative,
    chainOfReasoning: deriveChainOfReasoning('desafiosSombras', astro, kab, tantra, odu),
  };
}
