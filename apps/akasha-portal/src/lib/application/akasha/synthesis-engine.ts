/**
 * synthesis-engine.ts — Akasha Narrative Synthesis Engine
 *
 * Substitui crossAnalyze() com narrativa de VIDA, não dados técnicos.
 *
 * Inspirado em:
 *  - Gene Keys: Shadow → Gift → Siddhi (frequência de transformação)
 *  - Human Design: Strategy + Authority (decisão prática diária)
 *  - AstroLink: texto em 2ª pessoa, interpretação profunda por área
 *
 * O AkashaSynthesis integra os 5 pilares em 6 áreas de vida
 * (baseado no HologramAggregator) e gera narrativas que respondem:
 *  "O que isso significa na PRÁTICA da minha vida?"
 *
 * NÃO é mais uma correlação matemática de elementos.
 * É uma INTERPRETAÇÃO de vida por área de vida.
 */

import type { AstrologyMap, KabalisticMap, TantricMap, OduBirth } from '@/types';
import type { AkashicHologram } from '@/lib/domain/mapa/hologram-aggregator';

// ─── Life Areas (Maslow + Akasha) ──────────────────────────────────────────

export type LifeArea =
  | 'vitalidadeEnergia'   // Corpo: saúde, sexualidade, energia vital
  | 'conexoesAmor'        // Relações: amor, família, vínculos
  | 'carreiraProsperidade' // Recursos: finanças, carreira, abundância
  | 'oriCabecaQuizilas'   // Mente: intuição, propósito, direção
  | 'missaoDestino'       // Espiritual: missão, destino, transcendência
  | 'desafiosSombras';    // Transformação: sombras, karma, superação

// ─── Frequência (Gene Keys inspired) ───────────────────────────────────────

export type FrequencyLevel = 'shadow' | 'gift' | 'siddhi';

// ─── Decision Framework (Human Design inspired) ─────────────────────────────

export type AkashaStrategy = 'act' | 'wait' | 'observe';
export type AkashaAuthority = 'emotional' | 'sacral' | 'splenic' | 'mental';

export interface DailyDecision {
  strategy: AkashaStrategy;
  strategyExplanation: string;    // "Aguarde. Não force — seu corpo está em ciclo de regeneração."
  authority: AkashaAuthority;
  authorityQuestion: string;        // "Pergunte-se: esta decisão me deixa com sensação de leveza ou peso?"
  recommendation: string;           // "Hoje: não inicie conversas importantes. Deixe que venham até você."
  avoid: string;                   // "Evite: forçar situações de controle no trabalho."
}

// ─── Area Narrative ─────────────────────────────────────────────────────────

export interface AreaNarrative {
  area: LifeArea;
  title: string;
  frequency: FrequencyLevel;
  intensity: 1 | 2 | 3;  // urgência da transformação

  // Padrão Shadow (Gene Keys): o que a pessoa vive quando não sabe
  shadowPattern: string;
  shadowSymptoms: string[];

  // Padrão Gift: o que ela pode se tornar quando transforma
  giftPattern: string;
  giftStrengths: string[];

  // Contribuição de cada pilar para esta área
  pillarContribution: {
    cabala: string;
    tantra: string;
    odus: string;
    astrologia: string;
  };

  // Recomendação PRÁTICA para HOJE
  practicalAdvice: string;
  dailyRitual: {
    title: string;
    instruction: string;
    duration: string;
    element: string;
    color: string;
  };

  // Integração com a frequência de transformação
  transformationPrompt: string;  // Uma pergunta para autoreflectão
}

// ─── Full Synthesis Output ─────────────────────────────────────────────────

export interface AkashaSynthesis {
  // Perfil unificado
  akashaProfile: {
    dominantFrequency: FrequencyLevel;
    overallFrequencyScore: number;  // 0-100
    transformationStage: 'surface' | 'deepening' | 'embodying';
    activeSequence: 'vitality' | 'heart' | 'purpose';
  };

  // Narrativas por área de vida
  areas: Record<LifeArea, AreaNarrative>;

  // Decisão diária
  dailyDecision: DailyDecision;

  // Síntese geral (3-5 frases que resumem o perfil)
  synthesisParagraph: string;

  // A ser implementado: sequência de transformação (Activation/Venus/Pearl)
  transformationSequence?: {
    currentPhase: string;
    nextPhase: string;
    integrationNote: string;
  };
}

// ─── Helpers internos ───────────────────────────────────────────────────────

const FREQUENCY_LABELS: Record<FrequencyLevel, string> = {
  shadow: 'Sombra — padrões inconscientes de sofrimento',
  gift: 'Dom — genialidade e amor inato',
  siddhi: 'Realização — transcendência do padrão',
};

// ─── Engine principal ───────────────────────────────────────────────────────

/**
 * buildAkashaSynthesis — motor de síntese narrativa dos 5 pilares.
 *
 * Lê os 5 mapas + HologramAggregator + data atual e gera:
 *  1. Narrativas por área de vida (6 áreas)
 *  2. Decisão diária (Strategy + Authority Akasha)
 *  3. Síntese geral em 2ª pessoa
 */
export function buildAkashaSynthesis(
  astrologyMap: AstrologyMap | null,
  kabalisticMap: KabalisticMap | null,
  tantricMap: TantricMap | null,
  oduBirth: OduBirth | null,
  hologram: AkashicHologram,
  date: Date = new Date()
): AkashaSynthesis {
  // ── Derivar frequências por área ──────────────────────────────────────

  const areaVitalidade  = deriveVitalidadeEnergia(astrologyMap, kabalisticMap, tantricMap, oduBirth, hologram);
  const areaConexoes    = deriveConexoesAmor(astrologyMap, kabalisticMap, tantricMap, oduBirth, hologram);
  const areaCarreira    = deriveCarreiraProsperidade(astrologyMap, kabalisticMap, tantricMap, oduBirth, hologram);
  const areaOri         = deriveOriCabecaQuizilas(astrologyMap, kabalisticMap, tantricMap, oduBirth, hologram);
  const areaMissao      = deriveMissaoDestino(astrologyMap, kabalisticMap, tantricMap, oduBirth, hologram);
  const areaDesafios    = deriveDesafiosSombras(astrologyMap, kabalisticMap, tantricMap, oduBirth, hologram);

  // ── Decisão diária ───────────────────────────────────────────────────
  const dailyDecision = deriveDailyDecision(
    areaVitalidade,
    areaConexoes,
    areaCarreira,
    areaOri,
    areaMissao,
    areaDesafios,
    astrologyMap,
    kabalisticMap,
    tantricMap,
    oduBirth,
    date
  );

  // ── Síntese geral ─────────────────────────────────────────────────────
  const synthesisParagraph = buildSynthesisParagraph(
    areaVitalidade,
    areaConexoes,
    areaCarreira,
    areaOri,
    areaMissao,
    areaDesafios
  );

  // ── Perfil dominante ───────────────────────────────────────────────────
  const dominantFrequency = deriveDominantFrequency(areaVitalidade, areaConexoes, areaCarreira, areaOri, areaMissao, areaDesafios);
  const overallScore = computeOverallScore(areaVitalidade, areaConexoes, areaCarreira, areaOri, areaMissao, areaDesafios);

  return {
    akashaProfile: {
      dominantFrequency,
      overallFrequencyScore: overallScore,
      transformationStage: overallScore < 40 ? 'surface' : overallScore < 70 ? 'deepening' : 'embodying',
      activeSequence: deriveActiveSequence(areaConexoes, areaMissao, areaCarreira),
    },
    areas: {
      vitalidadeEnergia: areaVitalidade,
      conexoesAmor: areaConexoes,
      carreiraProsperidade: areaCarreira,
      oriCabecaQuizilas: areaOri,
      missaoDestino: areaMissao,
      desafiosSombras: areaDesafios,
    },
    dailyDecision,
    synthesisParagraph,
  };
}

// ─── Derivação por área ────────────────────────────────────────────────────

function deriveVitalidadeEnergia(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  holo: AkashicHologram
): AreaNarrative {
  const data = holo.vitalidadeEnergia.keyData;

  // ── Pillar contributions ──────────────────────────────────────────────
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
    ? `A planet ${astro.dominantPlanet} domina seu mapa astral, indicando que sua energia vital é condicionada pela forma como você se expressa em ${astro.dominantPlanet.toLowerCase()}.`
    : '';

  // ── Shadow pattern ────────────────────────────────────────────────────
  const shadowSymptoms = buildShadowSymptoms(astro, kab, tantra, odu, 'vitalidade');
  const shadowPattern = buildShadowPattern(astro, kab, tantra, odu, 'vitalidade');

  // ── Gift pattern ───────────────────────────────────────────────────────
  const giftStrengths = buildGiftStrengths(astro, kab, tantra, odu, 'vitalidade');
  const giftPattern = buildGiftPattern(astro, kab, tantra, odu, 'vitalidade');

  // ── Frequency & intensity ───────────────────────────────────────────────
  const { frequency, intensity } = assessAreaFrequency(astro, kab, tantra, odu, 'vitalidade');

  // ── Daily ritual ───────────────────────────────────────────────────────
  const dailyRitual = buildAreaRitual(astro, kab, tantra, odu, 'vitalidade', holo);

  // ── Transformation prompt ───────────────────────────────────────────────
  const transformationPrompt = buildTransformationPrompt(astro, kab, tantra, odu, 'vitalidade', 'Você percebe que vem ignorando os sinais de exaustão do seu corpo? Como seria respeitar seus ciclos de energia hoje?');

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
    },
    practicalAdvice: buildPracticalAdvice(astro, kab, tantra, odu, 'vitalidade'),
    dailyRitual,
    transformationPrompt,
  };
}

function deriveConexoesAmor(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  holo: AkashicHologram
): AreaNarrative {
  const data = holo.conexoesAmor.keyData;

  // Venus placement (key relationship planet)
  const venus = data.venus;
  const venusStr = venus
    ? `Vênus em ${venus.sign} na Casa ${venus.house} indica que você ama de forma ${getVenusLoveStyle(venus.sign)} — ${getVenusNeed(venus.sign)}. Seus relacionamentos florescem quando ${getVenusRelationalHabit(venus.sign)}.`
    : '';

  // Moon placement (emotional nature)
  const moon = data.moon;
  const moonStr = moon
    ? `A Lua em ${moon.sign} revela que você precisa de ${getMoonEmotionalNeed(moon.sign)} para se sentir emocionalmente seguro. Sem isso, você recua para padrões de ${getMoonDefensivePattern(moon.sign)}.`
    : '';

  // Lilith (shadow sexuality)
  const lilith = data.lilith;
  const lilithStr = lilith
    ? `Lilith em ${lilith.sign} aponta para um aspecto de sua sexualidade que você escondeu ou que foi punido: ${getLilithHiddenDesire(lilith.sign)}. Isso afeta como você vivencia intimidade.`
    : '';

  // Tantra
  const soulStr = tantra?.soul
    ? `Seu Número de Alma Tântrico ${tantra.soul} indica que seus vínculos mais profundos são formados por ${getTantricSoulBond(tantra.soul)}.`
    : '';

  // Kabalah motivation number
  const motivationStr = kab?.motivation
    ? `Seu Número de Motivação Cabalístico ${kab.motivation} mostra que o que você busca inconscientemente em relações é: ${getKabalisticMotivationRel(kab.motivation)}.`
    : '';

  // Shadow
  const shadowSymptoms = buildShadowSymptoms(astro, kab, tantra, odu, 'conexoes');
  const shadowPattern = buildShadowPattern(astro, kab, tantra, odu, 'conexoes');

  // Gift
  const giftStrengths = buildGiftStrengths(astro, kab, tantra, odu, 'conexoes');
  const giftPattern = buildGiftPattern(astro, kab, tantra, odu, 'conexoes');

  // Frequency
  const { frequency, intensity } = assessAreaFrequency(astro, kab, tantra, odu, 'conexoes');

  // Ritual
  const dailyRitual = buildAreaRitual(astro, kab, tantra, odu, 'conexoes', holo);

  const transformationPrompt = buildTransformationPrompt(astro, kab, tantra, odu, 'conexoes',
    'Você tem traído seus próprios limites emocionais para agradar o outro? O que sua intuição diz sobre esta relação agora?');

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
    },
    practicalAdvice: buildPracticalAdvice(astro, kab, tantra, odu, 'conexoes'),
    dailyRitual,
    transformationPrompt,
  };
}

function deriveCarreiraProsperidade(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  holo: AkashicHologram
): AreaNarrative {
  const data = holo.carreiraProsperidade.keyData;

  // Life path and expression (career talents)
  const lifePathStr = kab?.lifePath
    ? `Com Caminho de Vida Cabalístico ${kab.lifePath}, seu trabalho ideal é aquele que permite ${getLifePathCareer(kab.lifePath)}. Você prospera quando sente que está construindo algo que dura.`
    : '';

  const expressionStr = kab?.expression
    ? `Seu Número de Expressão ${kab.expression} revela que você se comunica e se destaca por ${getExpressionCareer(kab.expression)}. Esta é sua rota mais natural para reconhecimento e abundância.`
    : '';

  // Midheaven (career direction)
  const midheaven = data.midheaven;
  const midheavenStr = midheaven
    ? `Seu Meio-do-Céu em ${midheaven} indica que sua vocação pública指向 é realizada através de ${getMidheavenCareer(midheaven)}.`
    : '';

  // Jupiter (expansion, abundance)
  const jupiter = data.jupiter;
  const jupiterStr = jupiter
    ? `Júpiter em ${jupiter.sign} na Casa ${jupiter.house} mostra que sua prosperidade se expande quando você ${getJupiterProsperity(jupiter.sign)}.`
    : '';

  // Tantra divine gift
  const divineGiftStr = tantra?.divineGift
    ? `Seu Dom Divino Tântrico ${tantra.divineGift} indica que você tem um talento inato para ${getTantricDivineGift(tantra.divineGift)} — isso é o que você pode oferecer ao mundo com facilidade e alegria.`
    : '';

  // Shadow
  const shadowSymptoms = buildShadowSymptoms(astro, kab, tantra, odu, 'carreira');
  const shadowPattern = buildShadowPattern(astro, kab, tantra, odu, 'carreira');

  // Gift
  const giftStrengths = buildGiftStrengths(astro, kab, tantra, odu, 'carreira');
  const giftPattern = buildGiftPattern(astro, kab, tantra, odu, 'carreira');

  const { frequency, intensity } = assessAreaFrequency(astro, kab, tantra, odu, 'carreira');
  const dailyRitual = buildAreaRitual(astro, kab, tantra, odu, 'carreira', holo);
  const transformationPrompt = buildTransformationPrompt(astro, kab, tantra, odu, 'carreira',
    'Você tem adiado uma decisão profissional por medo de não ser bom o suficiente? O que aconteceria se você agisse como se já fosse?');

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
      cabala: `${lifePathStr} ${expressionStr}`.trim(),
      tantra: divineGiftStr,
      odus: '',
      astrologia: `${midheavenStr} ${jupiterStr}`.trim(),
    },
    practicalAdvice: buildPracticalAdvice(astro, kab, tantra, odu, 'carreira'),
    dailyRitual,
    transformationPrompt,
  };
}

function deriveOriCabecaQuizilas(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  holo: AkashicHologram
): AreaNarrative {
  const data = holo.oriCabecaQuizilas.keyData;

  // Odu de nascimento
  const oduStr = odu?.oduName && odu?.oduNumber
    ? `Seu Odu de Nascimento é ${odu.oduName} (${odu.oduNumber}), regido por ${(odu.orixaRegency || []).join(', ')}. Sua lição de vida é: "${odu.lifeLesson || 'aprender a direção correta'}". ${(odu.prohibitions || []).length > 0 ? `As proibições deste Odu incluem: ${odu.prohibitions?.join(', ')}.` : ''}`
    : '';

  // Elemental force
  const elementalStr = odu?.elementalForce
    ? `A força elemental ${odu.elementalForce} domina sua intuição. Isso significa que sua mente opera principalmente através de ${getElementalMentalMode(odu.elementalForce)}.`
    : '';

  // Soul purpose (Tantra)
  const purposeStr = tantra?.destiny
    ? `Seu Destino Tântrico indica que você veio ao mundo para ${tantra.destiny}.`
    : '';

  // Shadow
  const shadowSymptoms = buildShadowSymptoms(astro, kab, tantra, odu, 'ori');
  const shadowPattern = buildShadowPattern(astro, kab, tantra, odu, 'ori');

  // Gift
  const giftStrengths = buildGiftStrengths(astro, kab, tantra, odu, 'ori');
  const giftPattern = buildGiftPattern(astro, kab, tantra, odu, 'ori');

  const { frequency, intensity } = assessAreaFrequency(astro, kab, tantra, odu, 'ori');
  const dailyRitual = buildAreaRitual(astro, kab, tantra, odu, 'ori', holo);
  const transformationPrompt = buildTransformationPrompt(astro, kab, tantra, odu, 'ori',
    'Você tem confiado mais em Outside opiniões do que em sua própria percepção? Quando foi a última vez que você seguiu sua intuição e foi surpreendido positivamente?');

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
    },
    practicalAdvice: buildPracticalAdvice(astro, kab, tantra, odu, 'ori'),
    dailyRitual,
    transformationPrompt,
  };
}

function deriveMissaoDestino(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  holo: AkashicHologram
): AreaNarrative {
  const data = holo.missaoDestino.keyData;

  // Mission from Kabalah
  const missionStr = kab?.mission
    ? `Seu Número de Missão Cabalístico ${kab.mission} indica que sua missão de vida envolve ${getMissionDescription(kab.mission)}.`
    : '';

  // Life path master number
  const lifePathStr = kab?.lifePath && kab?.lifePathMaster
    ? `Por ser um Caminho de Vida ${kab.lifePath} (número mestre), você tem uma missão espiritual mais elevada que a maioria. O mundo precisa que você expresse ${getMasterLifePathGift(kab.lifePath)}.`
    : kab?.lifePath
    ? `Seu Caminho de Vida ${kab.lifePath} indica que você está aqui para desenvolver ${getLifePathGist(kab.lifePath)}.`
    : '';

  // Tantric path
  const tantricPathStr = tantra?.tantricPath
    ? `Seu Caminho Tântrico ${tantra.tantricPath} revela que sua jornada espiritual segue através de ${getTantricPathDescription(tantra.tantricPath)}.`
    : '';

  // Destiny from Tantra
  const destinyStr = tantra?.destiny
    ? `Seu destino é: ${tantra.destiny}.`
    : '';

  // Shadow
  const shadowSymptoms = buildShadowSymptoms(astro, kab, tantra, odu, 'missao');
  const shadowPattern = buildShadowPattern(astro, kab, tantra, odu, 'missao');

  // Gift
  const giftStrengths = buildGiftStrengths(astro, kab, tantra, odu, 'missao');
  const giftPattern = buildGiftPattern(astro, kab, tantra, odu, 'missao');

  const { frequency, intensity } = assessAreaFrequency(astro, kab, tantra, odu, 'missao');
  const dailyRitual = buildAreaRitual(astro, kab, tantra, odu, 'missao', holo);
  const transformationPrompt = buildTransformationPrompt(astro, kab, tantra, odu, 'missao',
    'Você tem adiado viver sua missão autêntica por medo de não ser aceito? O que você faria se soubesse que não pode falhar?');

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
    },
    practicalAdvice: buildPracticalAdvice(astro, kab, tantra, odu, 'missao'),
    dailyRitual,
    transformationPrompt,
  };
}

function deriveDesafiosSombras(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  holo: AkashicHologram
): AreaNarrative {
  // This area is about transformation — the Shadow is the入口
  const shadowSymptoms = buildShadowSymptoms(astro, kab, tantra, odu, 'desafios');
  const shadowPattern = buildShadowPattern(astro, kab, tantra, odu, 'desafios');
  const giftStrengths = buildGiftStrengths(astro, kab, tantra, odu, 'desafios');
  const giftPattern = buildGiftPattern(astro, kab, tantra, odu, 'desafios');
  const { frequency, intensity } = assessAreaFrequency(astro, kab, tantra, odu, 'desafios');
  const dailyRitual = buildAreaRitual(astro, kab, tantra, odu, 'desafios', holo);
  const transformationPrompt = buildTransformationPrompt(astro, kab, tantra, odu, 'desafios',
    'Você está fugindo de uma dor que precisa ser abraçada? Qual seria o primeiro passo para olhar para este padrão de frente?');

  // Karmic debts and challenges
  const karmicDebtsStr = kab?.karmicDebts && kab.karmicDebts.length > 0
    ? `Dívidas kármicas Cabalísticas: ${kab.karmicDebts.join(', ')}.`
    : '';

  const challengesStr = kab?.challenges?.first || kab?.challenges?.second
    ? `Seus desafios são: ${[kab.challenges?.first, kab.challenges?.second].filter(Boolean).join(' e ')}.`
    : '';

  // Saturn and Pluto (shadow planets)
  const data = holo.desafiosSombras.keyData;
  const saturnStr = data.saturn
    ? `Saturno em ${data.saturn.sign} na Casa ${data.saturn.house} é onde você sente的限制 e exigência. Onde há Saturno, há lição kármica.`
    : '';

  const plutoStr = data.pluto
    ? `Plutão em ${data.pluto.sign} na Casa ${data.pluto.house} é onde você transforma dolorosamente. É também onde está seu maior poder de renascimento.`
    : '';

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
      tantra: tantra?.karma ? `Karma Tântrico ${tantra.karma}: você carrega padrões que precisam ser conscientemente transmutados.` : '',
      odus: '',
      astrologia: `${saturnStr} ${plutoStr}`.trim(),
    },
    practicalAdvice: buildPracticalAdvice(astro, kab, tantra, odu, 'desafios'),
    dailyRitual,
    transformationPrompt,
  };
}

// ─── Daily Decision Engine ───────────────────────────────────────────────────

function deriveDailyDecision(
  vitalidade: AreaNarrative,
  conexoes: AreaNarrative,
  carreira: AreaNarrative,
  ori: AreaNarrative,
  missao: AreaNarrative,
  desafios: AreaNarrative,
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  date: Date
): DailyDecision {
  // Most intense area drives the strategy
  const areas = [vitalidade, conexoes, carreira, ori, missao, desafios];
  const mostIntense = areas.reduce((max, a) => a.intensity > max.intensity ? a : max, areas[0]);

  const strategy = deriveStrategy(mostIntense, astro, kab, tantra, odu, date);
  const authority = deriveAuthority(astro, kab, tantra, odu);
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

function deriveStrategy(
  area: AreaNarrative,
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  date: Date
): { type: AkashaStrategy; explanation: string } {
  // Base strategy on frequency and intensity
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
        explanation: `Você não deve agir emocionalmente hoje. Observe como se sente antes de reagir — seus relacionamentos pedem que você等待 a resposta visceral.`,
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

  // Default: observe
  return {
    type: 'observe',
    explanation: `Equilíbrio. Há tensão e graça coexistindo. Hoje: observe mais, julgue menos, deixe que as coisas se revelem.`,
  };
}

function deriveAuthority(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null
): AkashaAuthority {
  // Tantric body determines authority type — find highest-numbered body
  let dominantBody: number | undefined;
  if (tantra?.bodies) {
    const bodies = tantra.bodies;
    const bodyNumbers: Array<{ key: string; number: number }> = [
      { key: 'fisico', number: bodies.fisico?.number ?? 0 },
      { key: 'pranic', number: bodies.pranic?.number ?? 0 },
      { key: 'emocional', number: bodies.emocional?.number ?? 0 },
      { key: 'mental', number: bodies.mental?.number ?? 0 },
      { key: 'espiritual', number: bodies.espiritual?.number ?? 0 },
    ];
    bodyNumbers.sort((a, b) => b.number - a.number);
    dominantBody = bodyNumbers[0]?.number;
  }

  if (dominantBody !== undefined && dominantBody > 0) {
    if (dominantBody >= 7) return 'mental';    // Higher bodies → mental authority
    if (dominantBody >= 4) return 'emotional'; // Mid bodies → emotional
    return 'sacral';                           // Lower bodies → sacral
  }

  // Moon in water sign → emotional
  const moon = astro?.planets?.find(p => p.planet === 'Moon' || p.planet === 'Lua');
  if (moon && ['cancer', 'escorpio', 'peixes', 'câncer', 'escorpião', 'peixes'].includes(moon.sign?.toLowerCase() ?? '')) {
    return 'emotional';
  }

  // Default
  return 'sacral';
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

function deriveRecommendationAvoid(
  mostIntense: AreaNarrative,
  allAreas: AreaNarrative[]
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
        avoid: 'Evite iniciar conflitos emocionais ou tomar decisões sobre relationships hoje.',
      };
    case 'carreiraProsperidade':
      return {
        recommendation: mostIntense.practicalAdvice || 'Prepare terreno: revise planos, organize prioridades,sonhe com o futuro.',
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

// ─── Synthesis Paragraph ───────────────────────────────────────────────────

function buildSynthesisParagraph(
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
  const mostIntense = areas.reduce((max, a) => a.intensity > max.intensity ? a : max, areas[0]);

  const intro = 'Você nasceu com um perfil de vida raro:';
  const mid = giftAreas.length > 0
    ? `Quando você está no seu Dom, você brilha por ${giftAreas[0].giftStrengths?.[0] ?? 'sua capacidade de transformar'.toLowerCase()}.`
    : shadowAreas.length > 0
    ? `O padrão que mais pede atenção agora é: ${shadowAreas[0].shadowPattern.split('.')[0]}.`
    : `Continue o trabalho interior — você está em transformação.`;
  const action = `Hoje, a área que mais precisa de você é ${mostIntense.title} — ${mostIntense.practicalAdvice.split('.')[0]}.`;

  return `${intro} ${mid} ${action}`;
}

// ─── Frequency Analysis ─────────────────────────────────────────────────────

function assessAreaFrequency(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  area: string
): { frequency: FrequencyLevel; intensity: 1 | 2 | 3 } {
  // Heuristic: karmic debts/challenges → Shadow high intensity
  // Master numbers, good aspects → Gift
  // Transit indicators → current state

  let shadowScore = 0;
  let giftScore = 0;

  if (kab?.karmicDebts?.length) shadowScore += kab.karmicDebts.length;
  if (kab?.challenges?.first) shadowScore += 1;
  if (kab?.challenges?.second) shadowScore += 1;

  const pluto = astro?.planets?.find(p => p.planet === 'Pluto' || p.planet === 'Plutão');
  if (pluto) shadowScore += 1;

  const saturn = astro?.planets?.find(p => p.planet === 'Saturn' || p.planet === 'Saturno');
  if (saturn) shadowScore += 1;

  if (kab?.lifePathMaster) giftScore += 2;
  if (tantra?.soul === 1 || tantra?.soul === 22) giftScore += 1;

  if (shadowScore > giftScore && shadowScore >= 2) {
    return { frequency: 'shadow', intensity: Math.min(3, shadowScore) as 1 | 2 | 3 };
  }
  if (giftScore > shadowScore && giftScore >= 2) {
    return { frequency: 'gift', intensity: Math.min(3, giftScore) as 1 | 2 | 3 };
  }
  return { frequency: 'shadow', intensity: 1 };
}

function deriveDominantFrequency(
  v: AreaNarrative,
  c: AreaNarrative,
  car: AreaNarrative,
  o: AreaNarrative,
  m: AreaNarrative,
  d: AreaNarrative
): FrequencyLevel {
  const areas = [v, c, car, o, m, d];
  const shadows = areas.filter(a => a.frequency === 'shadow').length;
  const gifts = areas.filter(a => a.frequency === 'gift').length;
  if (gifts > shadows) return 'gift';
  return 'shadow';
}

function computeOverallScore(
  v: AreaNarrative,
  c: AreaNarrative,
  car: AreaNarrative,
  o: AreaNarrative,
  m: AreaNarrative,
  d: AreaNarrative
): number {
  const areas = [v, c, car, o, m, d];
  let giftCount = 0;
  areas.forEach(a => {
    if (a.frequency === 'gift') giftCount += 1;
    giftCount += (a.intensity - 1) * 0.3;
  });
  return Math.min(100, Math.round((giftCount / areas.length) * 100));
}

function deriveActiveSequence(
  conexoes: AreaNarrative,
  missao: AreaNarrative,
  carreira: AreaNarrative
): 'vitality' | 'heart' | 'purpose' {
  // Sequence is driven by the area with highest intensity
  const seq = [conexoes, missao, carreira].sort((a, b) => b.intensity - a.intensity)[0];
  if (seq === conexoes) return 'heart';
  if (seq === missao) return 'purpose';
  return 'vitality';
}

// ─── Helper functions (semantic — map values to life meanings) ─────────────

function getLifePathRhythm(n: number): string {
  const map: Record<number, string> = {
    1: 'iniciação e depois reflexão', 2: 'parceria e depois solitude',
    3: 'expressão e depois introspecção', 4: 'construção e depois soltura',
    5: 'liberdade e depois ancora', 6: 'responsabilidade e depois play',
    7: '探查 (pesquisa) e depois compartilhamento', 8: 'poder e depois serviço',
    9: 'humanitarismo e depois paz', 11: 'iluminação e depois concretização',
    22: 'master builder e depois inspiração', 33: 'sacrifício e depois transcendência',
  };
  return map[n] ?? 'crescimento contínuo com momentos de integração';
}

function getTantricVitalityDescription(body: number): string {
  if (body <= 3) return 'sensorial e intensamente física';
  if (body <= 6) return 'emocional e energeticamente responsiva';
  if (body <= 9) return 'mental e intuitivamente clara';
  return 'espiritualmente radiante';
}

function getTantricVitalityAdvice(body: number): string {
  if (body <= 3) return 'você precisa de contato físico regular e movimento corporal';
  if (body <= 6) return 'você precisa de rituais emocionais e conexões profundas';
  if (body <= 9) return 'você precisa de silêncio e tempo sozinho para processar';
  return 'você precisa de práticas contemplativas e serviço aos outros';
}

function getElementalBodyFocus(element: string): string {
  const map: Record<string, string> = {
    fogo: 'atividades físicas intensas e exposição ao sol',
    água: 'hidratação, banhos e tempo perto da água',
    terra: '接地 ( groundedness ), trabalho manual e natureza',
    ar: 'respiração profunda, ventilação e espaços abertos',
  };
  return map[element.toLowerCase()] ?? 'rotinas regulares e consistentes';
}

function getVenusLoveStyle(sign: string): string {
  const map: Record<string, string> = {
    aries: 'apaixonada e direta', taurus: 'sensual e devota',
    gemini: 'curiosa e intelectual', cancer: 'emocional e protetora',
    leo: 'dramática e magnética', virgo: 'prática e cuidadosa',
    libra: 'harmoniosa e encantadora', scorpio: 'intensa e transformadora',
    sagittarius: 'avventurosa e livre', capricorn: 'ambiciosa e fiel',
    aquarius: 'independente e unik', pisces: 'romântica e sonhadora',
  };
  return map[sign?.toLowerCase()] ?? 'expressiva e única';
}

function getVenusNeed(sign: string): string {
  const map: Record<string, string> = {
    aries: 'precisa sentir que é desejada', taurus: 'precisa de estabilidade e prazer sensory',
    gemini: 'precisa deStimulação mental', cancer: 'precisa se sentir em casa com o outro',
    leo: 'precisa ser admirada', virgo: 'precisa de gestos pequenos e concretos',
    libra: 'precisa de harmonia e beleza', scorpio: 'precisa de profundidade e intimidade total',
    sagittarius: 'precisa de aventura e liberdade', capricorn: 'precisa de compromisso e segurança',
    aquarius: 'precisa de amizade e espaço', pisces: 'precisa de conexão espiritual e fantasia',
  };
  return map[sign?.toLowerCase()] ?? 'precisa ser estimada';
}

function getVenusRelationalHabit(sign: string): string {
  const map: Record<string, string> = {
    aries: 'demonstra afeto', taurus: 'valoriza gestos concretos de cuidado',
    gemini: 'conversa profundamente', cancer: 'cuida antes de ser cuidada',
    leo: 'celebra publicamente', virgo: 'organiza a vida do outro com amor',
    libra: 'diplomacy para evitar conflitos', scorpio: 'vai ao fundo das coisas',
    sagittarius: 'diverte-se e expande horizontes', capricorn: 'construir um futuro juntos',
    aquarius: 'resgata sua individualidade', pisces: 'se conecta soul-to-soul',
  };
  return map[sign?.toLowerCase()] ?? 'demonstra apreço de forma única';
}

function getMoonEmotionalNeed(sign: string): string {
  const map: Record<string, string> = {
    cancer: 'segurança emocional e lar', scorpio: 'profundidade e transformação',
    pisces: 'conexão espiritual e fantasia', taurus: 'estabilidade e prazer',
    virgo: 'ordem e utilidade', gemini: 'variedade e comunicação',
  };
  return map[sign?.toLowerCase()] ?? 'compreensão e paciência';
}

function getMoonDefensivePattern(sign: string): string {
  const map: Record<string, string> = {
    cancer: 'superação e afastamento', scorpio: 'controle e vingança',
    pisces: 'fuga e fantasia', taurus: 'teimosia e possessividade',
    virgo: 'crítica e análise excessiva', gemini: 'superficialidade e mudança constante',
  };
  return map[sign?.toLowerCase()] ?? 'proteção e defesa';
}

function getLilithHiddenDesire(sign: string): string {
  const map: Record<string, string> = {
    aries: 'ser livre para agir sem pedir permissão',
    scorpio: 'experimentar profundidade emocional sem julgamento',
    taurus: 'usar seu corpo e recursos para seu prazer sem culpa',
    leo: 'ser vista e admirada sem moderação',
    aquarius: 'pertencer a um grupo que aceita sua怪异',
  };
  return map[sign?.toLowerCase()] ?? 'expressar uma parte de você que foi punida ou escondida';
}

function getTantricSoulBond(soul: number): string {
  const map: Record<number, string> = [
    'laços de destino e transformação mútua',
    'complementaridade e interdependência sagrada',
    'progressão espiritual compartilhada',
    'aliança kármica e cura coletiva',
    'companheirismo com propósito comum',
    'união de forças opostas',
    'reflexo espelhado de sombras e luzes',
    'libertação de padrões antigos em conjunto',
    'dedicação à jornada de alma',
    'acolhimento incondicional',
    'comunhão espiritual e transcendência',
  ];
  return map[soul - 1] ?? 'conexão de alma profunda e rara';
}

function getKabalisticMotivationRel(n: number): string {
  const map: Record<number, string> = {
    1: 'ser reconhecido como indivíduo único',
    2: 'pertencer e ser aceito pelo outro',
    3: 'expressar sua criatividade e alegria',
    4: 'construir segurança e estrutura de vida',
    5: 'experimentar liberdade e variedade',
    6: 'amar e ser admirado por sua dedicação',
    7: 'entender a verdade profunda da vida',
    8: 'ter poder e controle sobre seus recursos',
    9: 'servir à humanidade e transcender o ego',
  };
  return map[n] ?? 'vínculos que reflectem quem você realmente é';
}

function getLifePathCareer(n: number): string {
  const map: Record<number, string> = {
    1: 'liderar, criar e inovar', 2: 'mediar, parcerias e diplomacy',
    3: 'comunicar, entreter e inspirar', 4: 'construir sistemas duráveis',
    5: 'ensinar, viajar e expandir horizontes', 6: 'cuidar, servir e educar',
    7: 'pesquisar, analisar e revelar verdades', 8: 'empreender, gerir recursos e impactar',
    9: 'curar, aconselhar e transformar', 11: 'inspirar e liderar espiritual',
    22: 'construir em grande escala com propósito', 33: 'servir a humanidade com sacrifício sagrado',
  };
  return map[n] ?? 'expressar sua essência única no mundo';
}

function getExpressionCareer(n: number): string {
  const map: Record<number, string> = {
    1: 'sua voz única e capacidade de liderar', 2: 'sua habilidade de harmonizar e mediar',
    3: 'sua criatividade e poder de encantar', 4: 'sua praticidade e habilidade de construir',
    5: 'sua versatile e ability de entreter', 6: 'sua responsabilidade e cuidado com os outros',
    7: 'sua profundidade intelectual e análise', 8: 'seu senso de abundância e gestão',
    9: 'sua compaixão e visão humanitária',
  };
  return map[n] ?? 'seu dom de se expressar autênticamente';
}

function getMidheavenCareer(sign: string): string {
  const map: Record<string, string> = {
    aries: 'iniciativas de liderança e competição', taurus: 'finanças, propriedades e valores',
    gemini: 'comunicação, mídia e comércio', cancer: 'cuidado, lar e família',
    leo: 'arte, entretenimento e children', virgo: 'saúde, serviço e detalhes',
    libra: 'justice, relationships e estética', scorpio: 'transformação e investigação profunda',
    sagittarius: 'filosofia, viagem e ensino', capricorn: 'negócios, status e achievement',
    aquarius: 'inovação social e coletividades', pisces: 'espiritualidade, arte e cura',
  };
  return map[sign?.toLowerCase()] ?? 'algo significativo para você';
}

function getJupiterProsperity(sign: string): string {
  const map: Record<string, string> = {
    aries: 'atravessa desafios com otimismo', taurus: 'acumula com paciência e prazer',
    gemini: 'expande através de conexões e ideias', cancer: 'prospera em lar e família',
    leo: 'generosity traz mais abundância', virgo: 'serve aos outros com excelência',
    libra: 'cria parcerias abundantes', scorpio: 'transforma crise em oportunidade',
    sagittarius: 'expand beliefs e horizontes', capricorn: 'construi estrutura com disciplina',
    aquarius: 'inova para o bem comum', pisces: 'confia no fluxo do universo',
  };
  return map[sign?.toLowerCase()] ?? 'abraça a abundância com gratidão';
}

function getTantricDivineGift(n: number): string {
  const map: Record<number, string> = [
    'compaixão profunda e capacidade de curar', 'visão estratégica e poder de realização',
    'expressão criativa e comunicação magnética', 'praticidade e habilidade de construir',
    'liberté e capacidade de inspirar mudança', 'cuidado e capacidade de nutrir',
    'sabedoria e capacidade de ensino', 'abundância e capacidade de gerar prosperidade',
    'transformação e capacidade de renascimento', 'conexão espiritual e cura energética',
    'liderança carismática e propósito elevado', 'transcendência e iluminação',
  ];
  return map[n - 1] ?? 'um talento único que serve ao mundo';
}

function getElementalMentalMode(element: string): string {
  const map: Record<string, string> = {
    fogo: 'imaginação e inspiração visionária',
    água: 'intuição profunda e percepção emocional',
    terra: 'memória e pragmatismo',
    ar: 'lógica e comunicação',
  };
  return map[element.toLowerCase()] ?? 'pensamento claro e objetivo';
}

function getMissionDescription(n: number): string {
  const map: Record<number, string> = {
    1: 'ser pioneiro e mostrar o caminho com sua presença',
    2: 'ser ponte entre pessoas, ideias e mundos',
    3: 'trazer luz, beleza e alegria onde quer que vá',
    4: 'construir uma base sólida para você e outros',
    5: 'libertar você e outros de crenças limitantes',
    6: 'cuidar, ensinar e elevar sua comunidade',
    7: 'revealar verdades ocultas e iluminar caminhos',
    8: 'usar seu poder para transformar e gerar impacto',
    9: 'curar, humanizar e expandir a consciência coletiva',
  };
  return map[n] ?? 'realizar seu potencial único no mundo';
}

function getMasterLifePathGift(n: number): string {
  const map: Record<number, string> = {
    11: 'iluminação, intuição e inspiração espiritual',
    22: 'master builder, capacidade de realizar o impossível',
    33: 'sacrifício sagrado, cura espiritual e master teaching',
  };
  return map[n] ?? 'algo extraordinário para o mundo';
}

function getLifePathGist(n: number): string {
  const map: Record<number, string> = {
    1: 'independência e auto-liderança', 2: 'cooperação e equilíbrio',
    3: 'autenticidade e expressão criativa', 4: 'disciplina e construção de legado',
    5: 'adaptabilidade e liberdade interior', 6: 'responsabilidade e cuidado',
    7: 'discernimento e busca da verdade', 8: 'abundância e integridade',
    9: 'compaixão e serviço genuíno',
  };
  return map[n] ?? 'seu caminho de crescimento e realização';
}

function getTantricPathDescription(n: number): string {
  const map: Record<number, string> = {
    1: 'a jornada do guerreiro — superar obstáculos com coragem',
    2: 'a jornada do parceiro — unir opostos em harmonia',
    3: 'a jornada do comunicador — revelar verdades com arte',
    4: 'a jornada do builder — criar estruturas que duram',
    5: 'a jornada do andarilho — liberar a mente e o corpo',
    6: 'a jornada do servidor — amar com sacrifício sagrado',
    7: 'a jornada do sábio — buscar a verdade além das aparências',
    8: 'a jornada do líder — transformar poder em serviço',
    9: 'a jornada do curador — aliviar o sofrimento humano',
  };
  return map[n] ?? 'uma jornada de desenvolvimento pessoal e espiritual';
}

// ─── Area-specific builders ────────────────────────────────────────────────

function buildShadowSymptoms(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  area: string
): string[] {
  const symptoms: string[] = [];

  if (kab?.karmicDebts?.length) {
    symptoms.push(`Dívida kármica ${kab.karmicDebts.join(', ')}`);
  }
  if (kab?.challenges?.first) {
    symptoms.push(`Desafio principal: ${kab.challenges.first}`);
  }

  const saturn = astro?.planets?.find(p => p.planet === 'Saturn' || p.planet === 'Saturno');
  if (saturn) {
    symptoms.push(`Saturno em ${saturn.sign} trazendoLições de limite e paciência`);
  }

  const pluto = astro?.planets?.find(p => p.planet === 'Pluto' || p.planet === 'Plutão');
  if (pluto) {
    symptoms.push(`Plutão em ${pluto.sign} gerando transformações profundas e às vezes dolorosas`);
  }

  if (odu?.prohibitions?.length) {
    symptoms.push(`Proibições do Odu que causam tensão: ${odu.prohibitions.join(', ')}`);
  }

  return symptoms.length > 0 ? symptoms : ['Padrão de sombra não identificado — mantenha autocompaixão'];
}

function buildShadowPattern(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  area: string
): string {
  // This is the core shadow narrative — the story the person lives when unconscious
  const karmicDebt = kab?.karmicDebts?.[0];
  const challenge = kab?.challenges?.first;
  const oduProhibition = odu?.prohibitions?.[0];

  if (karmicDebt && challenge !== undefined) {
    return `Você carrega a dívida de não ter expressado seu ${karmicDebt} em vidas anteriores. Isso se manifesta como um desafio interno (número ${challenge}) — você repete o padrão sem entender por quê. Quando você aceita a existência desta dívida com compaixão, o ciclo começa a se quebrar.`;
  }

  if (oduProhibition) {
    return `O seu Odu proíbe ${oduProhibition.toLowerCase()}. Isso gera um ciclo de frustração quando você tenta transgressar a regra — e uma sensação de vazio quando a obedece sem entender o porquê. A compreensão vem quando você aceita que esta proibição é um guardião da sua energia.`;
  }

  return `Quando você opera no Shadow, você vive em reação aos outros e às circunstâncias, em vez de crear ativamente sua vida. Este é o padrão inconsciente que limita sua experiência na área de ${area}.`;
}

function buildGiftStrengths(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  area: string
): string[] {
  const strengths: string[] = [];

  if (kab?.lifePathMaster) {
    strengths.push('Número mestre — você tem acesso a capacidades acima da média');
  }
  if (tantra?.soul === 1) {
    strengths.push('Alma em número 1 — você é um gerador de vida e energia');
  }
  if (kab?.expression && kab.expression > 5) {
    strengths.push(`Número de expressão ${kab.expression} — sua comunicação é particularmente impactante`);
  }
  if (odu?.oduName) {
    strengths.push(`Odu ${odu.oduName} — você tem proteção e sabedoria ancestral`);
  }

  const jupiter = astro?.planets?.find(p => p.planet === 'Jupiter' || p.planet === 'Júpiter');
  if (jupiter) {
    strengths.push(`Júpiter em ${jupiter.sign} — você tem capacidade natural de expandir o que toca`);
  }

  return strengths.length > 0
    ? strengths
    : ['Quando no Dom, você opera com clareza e propósito nesta área'];
}

function buildGiftPattern(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  area: string
): string {
  const lifePath = kab?.lifePath;
  const expression = kab?.expression;
  const divineGift = tantra?.divineGift;

  const parts: string[] = [];
  if (lifePath) parts.push(`Caminho de Vida ${lifePath}`);
  if (expression) parts.push(`Expressão ${expression}`);
  if (divineGift) parts.push(`Dom Divino Tântrico ${divineGift}`);

  const summary = parts.length > 0 ? parts.join(' + ') : 'seus mapas';

  return `Quando você opera no Dom, ${summary.toLowerCase()} se alinham naturalmente. Você não precisa forçar — as coisas acontecem. Esta é a frequência onde você está no fluxo, onde sua vida funciona e onde outras pessoas sentem sua presença como nutritiva e inspiradora.`;
}

function buildPracticalAdvice(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  area: string
): string {
  switch (area) {
    case 'vitalidade':
      return 'Hoje: beba água antes de qualquer decisão importante. Seu corpo precisa de hidratação para processar energia.';
    case 'conexoes':
      return 'Hoje: antes de enviar qualquer mensagem emocional, espere 10 minutos. Deixe seu corpo informar, não sua mente.';
    case 'carreira':
      return 'Hoje: faça uma lista do que você quer criar nos próximos 3 meses. Não edite — apenas escreva.';
    case 'ori':
      return 'Hoje:medite 10 minutos em silêncio antes de tomar qualquer decisão sobre seu futuro.';
    case 'missao':
      return 'Hoje: pergunte-se: estou vivendo uma vida que minha versão de 8 anos old aprovaria?';
    case 'desafios':
      return 'Hoje: escreva em um papel o padrão que você tem evitado. Sem julgamento — apenas nomeie.';
    default:
      return 'Hoje: reserve 5 minutos para respirar antes de qualquer ação. Sua sabedoria está no silêncio.';
  }
}

function buildAreaRitual(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  area: string,
  holo: AkashicHologram
): AreaNarrative['dailyRitual'] {
  const element = holo.vitalidadeEnergia?.chakra?.toLowerCase() ?? 'agua';
  const elementMap: Record<string, { color: string; element: string; instruction: string }> = {
    muladhara: { color: '#FF3B30', element: 'terra', instruction: 'Fique descalço na terra por 5 minutos' },
    svadhisthana: { color: '#FF9500', element: 'agua', instruction: 'Beba um copo de água olhando para a lua' },
    manipura: { color: '#FFCC00', element: 'fogo', instruction: 'Acuenda uma vela e olhe para a chama por 3 minutos' },
    anahata: { color: '#34C759', element: 'ar', instruction: 'Respire fundo 5x antes de dormir' },
    vishuddha: { color: '#007AFF', element: 'éter', instruction: 'Cante ou humme por 3 minutos' },
    ajna: { color: '#5856D6', element: 'luz', instruction: 'Feche os olhos e visualize uma luz branca sobre seu terceiro olho' },
    sahasrara: { color: '#AF52DE', element: 'consciência', instruction: 'Sente em silêncio e observe seus pensamentos sem interagir' },
  };

  const chakraName = holo.vitalidadeEnergia?.chakra ?? '';
  const chakraKey = chakraName.toLowerCase().replace(/[0-9º°]/g, '').replace(/\s*\(/g, '').trim();
  const ritual = elementMap[chakraKey] ?? { color: '#5856D6', element: 'silêncio', instruction: 'Sente em silêncio por 5 minutos' };

  return {
    title: `Ritual de ${ritual.element.charAt(0).toUpperCase() + ritual.element.slice(1)}`,
    instruction: ritual.instruction,
    duration: '5-10 minutos',
    element: ritual.element,
    color: ritual.color,
  };
}

function buildTransformationPrompt(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  area: string,
  defaultPrompt: string
): string {
  return defaultPrompt;
}
