/**
 * synthesis-engine/area-builders.ts
 *
 * Builders de blocos narrativos reutilizáveis por área: shadow, gift,
 * conselho prático, ritual diário, prompt de transformação.
 *
 * Split de synthesis-engine.ts para isolar peças de composição narrativa.
 */

import type { AstrologyMap, KabalisticMap, TantricMap, OduBirth } from '@akasha/types';
import type { AkashicHologram } from '@/lib/domain/mapa/hologram-aggregator';
import type { AreaNarrative } from './synthesis-types';

// ─── Shadow ────────────────────────────────────────────────────────────────

export function buildShadowSymptoms(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  _tantra: TantricMap | null,
  odu: OduBirth | null,
  _area: string
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
    symptoms.push(`Saturno em ${saturn.sign} trazendo lições de limite e paciência`);
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

export function buildShadowPattern(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  _tantra: TantricMap | null,
  odu: OduBirth | null,
  area: string
): string {
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

// ─── Gift ──────────────────────────────────────────────────────────────────

export function buildGiftStrengths(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null,
  _area: string
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

export function buildGiftPattern(
  astro: AstrologyMap | null,
  kab: KabalisticMap | null,
  tantra: TantricMap | null,
  _odu: OduBirth | null,
  _area: string
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

// ─── Practical Advice + Ritual + Prompt ────────────────────────────────────

export function buildPracticalAdvice(
  _astro: AstrologyMap | null,
  _kab: KabalisticMap | null,
  _tantra: TantricMap | null,
  _odu: OduBirth | null,
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
      return 'Hoje: medite 10 minutos em silêncio antes de tomar qualquer decisão sobre seu futuro.';
    case 'missao':
      return 'Hoje: pergunte-se: estou vivendo uma vida que minha versão de 8 anos old aprovaria?';
    case 'desafios':
      return 'Hoje: escreva em um papel o padrão que você tem evitado. Sem julgamento — apenas nomeie.';
    default:
      return 'Hoje: reserve 5 minutos para respirar antes de qualquer ação. Sua sabedoria está no silêncio.';
  }
}

export function buildAreaRitual(
  _astro: AstrologyMap | null,
  _kab: KabalisticMap | null,
  _tantra: TantricMap | null,
  _odu: OduBirth | null,
  _area: string,
  holo: AkashicHologram
): AreaNarrative['dailyRitual'] {
  const elementMap: Record<string, { color: string; element: string; instruction: string }> = {
    muladhara: { color: '#FF3B30', element: 'terra', instruction: 'Fique descalço na terra por 5 minutos' },
    svadhisthana: { color: '#FF9500', element: 'agua', instruction: 'Beba um copo de água olhando para a lua' },
    manipura: { color: '#FFCC00', element: 'fogo', instruction: 'Acenda uma vela e olhe para a chama por 3 minutos' },
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

export function buildTransformationPrompt(
  _astro: AstrologyMap | null,
  _kab: KabalisticMap | null,
  _tantra: TantricMap | null,
  _odu: OduBirth | null,
  _area: string,
  defaultPrompt: string
): string {
  return defaultPrompt;
}
