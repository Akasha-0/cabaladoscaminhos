/**
 * synthesis-engine.ts — Akasha Narrative Synthesis Engine (Facade)
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
 *
 * ─── Estrutura (refatorada de monólito de 2200+ linhas) ──────────────────
 *   - ./synthesis-engine/synthesis-types.ts           — tipos e interfaces
 *   - ./synthesis-engine/akasha-types-catalog.ts      — 9 tipos Akasha
 *   - ./synthesis-engine/derive-akasha-type.ts         — F-227 type profile
 *   - ./synthesis-engine/semantic-lookups.ts          — map value→meaning
 *   - ./synthesis-engine/area-builders.ts              — shadow/gift/ritual
 *   - ./synthesis-engine/frequency-analysis.ts         — shadow/gift/siddhi
 *   - ./synthesis-engine/derive-sexual-archetype.ts    — F-225 sexualidade
 *   - ./synthesis-engine/derive-daily-transit.ts       — F-224 trânsitos
 *   - ./synthesis-engine/derive-decision.ts            — strategy/authority
 *   - ./synthesis-engine/derive-area-narratives.ts     — 6 derive* funções
 *   - ./synthesis-engine/synthesis-paragraph.ts        — síntese final
 *
 * Cada módulo tem responsabilidade única e < 600 linhas.
 */

import type { AstrologyMap, KabalisticMap, TantricMap, OduBirth } from '@akasha/types';
import type { AkashicHologram } from '@/lib/domain/mapa/hologram-aggregator';
import { generateSynthesisParagraph as genSynthesisParagraph } from './narrative-generator';
import type { SynthesizedProfile, PilarIChing, PilarCabala, PilarAstrologia, PilarTantrica, PilarOdu } from '@akasha/core';
import { synthesizePrimitives } from '@akasha/core';

// Re-export all public types for backwards compatibility
export type {
  AkashaTypeProfile,
  AkashaAuthority,
  AkashaStrategy,
  AkashaSynthesis,
  AreaNarrative,
  DailyDecision,
  DailyTransitOverlay,
  FrequencyLevel,
  LifeArea,
  SexualArchetype,
  SexualFantasy,
  SexualFetish,
  SexualHiddenDesire,
  TransitAspectOverlay,
} from './synthesis-engine/synthesis-types';

// Re-export the public functions
export { deriveAkashaType } from './synthesis-engine/derive-akasha-type';
export { deriveSexualArchetype } from './synthesis-engine/derive-sexual-archetype';
export { deriveDailyTransitOverlay } from './synthesis-engine/derive-daily-transit';
export {
  deriveDailyDecision,
  deriveStrategy,
  deriveRecommendationAvoid,
} from './synthesis-engine/derive-decision';
export {
  deriveVitalidadeEnergia,
  deriveConexoesAmor,
  deriveCarreiraProsperidade,
  deriveOriCabecaQuizilas,
  deriveMissaoDestino,
  deriveDesafiosSombras,
} from './synthesis-engine/derive-area-narratives';
export {
  assessAreaFrequency,
  computeOverallScore,
  deriveActiveSequence,
  deriveDominantFrequency,
} from './synthesis-engine/frequency-analysis';
export {
  buildAreaRitual,
  buildGiftPattern,
  buildGiftStrengths,
  buildPracticalAdvice,
  buildShadowPattern,
  buildShadowSymptoms,
  buildTransformationPrompt,
} from './synthesis-engine/area-builders';
export { buildSynthesisParagraph } from './synthesis-engine/synthesis-paragraph';

import { deriveAkashaType } from './synthesis-engine/derive-akasha-type';
import {
  deriveCarreiraProsperidade,
  deriveConexoesAmor,
  deriveDesafiosSombras,
  deriveMissaoDestino,
  deriveOriCabecaQuizilas,
  deriveVitalidadeEnergia,
} from './synthesis-engine/derive-area-narratives';
import { deriveDailyDecision } from './synthesis-engine/derive-decision';
import {
  computeOverallScore,
  deriveActiveSequence,
  deriveDominantFrequency,
} from './synthesis-engine/frequency-analysis';
import { buildSynthesisParagraph } from './synthesis-engine/synthesis-paragraph';
import type {
  AkashaSynthesis,
  AreaNarrative,
  FrequencyLevel,
} from './synthesis-engine/synthesis-types';

const FALLBACK_AREA_LABELS: Record<string, string> = {
  vitalidadeEnergia: 'Vitalidade & Energia',
  conexoesAmor: 'Conexões & Amor',
  carreiraProsperidade: 'Carreira & Prosperidade',
  oriCabecaQuizilas: 'Orixá & Quizilas',
  missaoDestino: 'Missão & Destino',
  desafiosSombras: 'Desafios & Sombras',
};

function buildFallbackArea(area: string): AreaNarrative {
  return {
    area: area as AreaNarrative['area'],
    title: FALLBACK_AREA_LABELS[area] ?? area,
    frequency: 'shadow' as FrequencyLevel,
    intensity: 2 as 1 | 2 | 3,
    shadowPattern: 'Área em carregamento. O sistema está sendo corrigido.',
    shadowSymptoms: [],
    giftPattern: '',
    giftStrengths: [],
    pillarContribution: { cabala: '', tantra: '', odus: '', astrologia: '' },
    practicalAdvice: 'Aguarde a correção do sistema.',
    dailyRitual: { title: 'Aguardar', instruction: 'Aguarde', duration: '5 min', element: 'ar', color: '#888888' },
    transformationPrompt: 'O sistema está corrigindo esta área.',
  };
}
// ─── Pilar converters (map data → synthesizePrimitives types) ──────────────────

function toPilarIChing(holo: AkashicHologram | null): PilarIChing | null {
  if (!holo || holo.ichingHex == null) return null;
  return {
    hexagrama_natal: holo.ichingHex,
    hexagrama_dia: holo.ichingHex,
    level: 'gift' as const,
  };
}

function toPilarCabala(kab: KabalisticMap | null): PilarCabala | null {
  if (!kab) return null;
  return {
    life_path: kab.lifePath ?? 1,
    birthday: (kab.lifePath != null ? kab.lifePath % 9 : 0) || 1,
    expression: kab.expression ?? kab.lifePath ?? 1,
    ano_pessoal: kab.lifePath ?? 1,
  };
}

function toPilarAstrologia(astro: AstrologyMap | null): PilarAstrologia | null {
  if (!astro) return null;
  const sol = astro.planets?.find(p => p.planet === 'Sol' || p.planet === 'Sun');
  const lua = astro.planets?.find(p => p.planet === 'Lua' || p.planet === 'Moon');
  const normalize = (s: string) =>
    (s ?? 'desconhecido').toLowerCase().normalize('NFD').replace(/[áéíóú]/g, m => ({á:'a',é:'e',í:'i',ó:'o',ú:'u'}[m] ?? m));
  const luaFase: PilarAstrologia['lua_fase'] = 'cheia';
  return {
    sol_signo: normalize(sol?.sign ?? 'desconhecido'),
    asc_signo: astro.ascendant ? normalize(astro.ascendant) : null,
    lua_signo: normalize(lua?.sign ?? 'desconhecido'),
    lua_fase: luaFase,
    hora_desconhecida: !astro.ascendant,
    trinity: { sombra: 0, dom: 1, graca: 0 },
    trinity_dominante: 'dom' as const,
    lilith_signo: null,
    casa_8_signo: null,
  };
}

function toPilarTantrica(tantra: TantricMap | null): PilarTantrica | null {
  if (!tantra) return null;
  const corpo = tantra.soul ?? 1;
  const trigemeo: PilarTantrica['trigemeo'] =
    corpo <= 4 ? 'fisico' : corpo <= 8 ? 'astral' : 'mental';
  return {
    corpo_predominante: corpo,
    trigemeo,
    ciclo_anos: 7,
    temperamento_atual: 'sanguineo' as const,
  };
}

function toPilarOdu(odu: OduBirth | null): PilarOdu | null {
  if (!odu) return null;
  return {
    odu_principal: odu.oduName ?? 'desconhecido',
    odu_secundario: null,
    fonte: 'Ifá' as const,
    aviso: 'requer consentimento + terreiro' as const,
  };
}

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
  let _synthesizedProfile: SynthesizedProfile | undefined;
  try {
  // === synthesizePrimitives integration ====================================
    const perfil = synthesizePrimitives({
      iching: toPilarIChing(hologram) ?? { hexagrama_natal: 1, hexagrama_dia: 1, level: 'gift' as const },
      cabala: toPilarCabala(kabalisticMap) ?? { life_path: 1, birthday: 1, expression: 1, ano_pessoal: 1 },
      astrologia: toPilarAstrologia(astrologyMap) ?? { sol_signo: 'desconhecido', asc_signo: null, lua_signo: 'desconhecido', lua_fase: 'cheia', hora_desconhecida: true, trinity: { sombra: 0, dom: 0, graca: 0 }, trinity_dominante: 'dom' as const, lilith_signo: null, casa_8_signo: null },
      tantrica: toPilarTantrica(tantricMap) ?? { corpo_predominante: 1, trigemeo: 'fisico' as const, ciclo_anos: 7, temperamento_atual: 'sanguineo' as const },
      odu: toPilarOdu(oduBirth) ?? { odu_principal: 'desconhecido', odu_secundario: null, fonte: 'Ifá' as const, aviso: 'requer consentimento + terreiro' as const },
    });
    _synthesizedProfile = perfil;
  } catch (_err) {
  }

  try {
    const areaVitalidade = deriveVitalidadeEnergia(astrologyMap, kabalisticMap, tantricMap, oduBirth, hologram, _synthesizedProfile, date);
    const areaConexoes = deriveConexoesAmor(astrologyMap, kabalisticMap, tantricMap, oduBirth, hologram, _synthesizedProfile, date);
    const areaCarreira = deriveCarreiraProsperidade(astrologyMap, kabalisticMap, tantricMap, oduBirth, hologram, _synthesizedProfile, date);
    const areaOri = deriveOriCabecaQuizilas(astrologyMap, kabalisticMap, tantricMap, oduBirth, hologram, _synthesizedProfile, date);
    const areaMissao = deriveMissaoDestino(astrologyMap, kabalisticMap, tantricMap, oduBirth, hologram, _synthesizedProfile, date);
    const areaDesafios = deriveDesafiosSombras(astrologyMap, kabalisticMap, tantricMap, oduBirth, hologram, _synthesizedProfile, date);

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

    const oneProfile = deriveAkashaType(astrologyMap, kabalisticMap, tantricMap, oduBirth, hologram);

    const synthesisParagraph = genSynthesisParagraph(kabalisticMap, astrologyMap, tantricMap, oduBirth, oneProfile.typeName);

    const dominantFrequency = deriveDominantFrequency(areaVitalidade, areaConexoes, areaCarreira, areaOri, areaMissao, areaDesafios);
    const overallScore = computeOverallScore(areaVitalidade, areaConexoes, areaCarreira, areaOri, areaMissao, areaDesafios);

    return {
      akashaProfile: {
        dominantFrequency,
        overallFrequencyScore: overallScore,
        transformationStage: overallScore < 40 ? 'surface' : overallScore < 70 ? 'deepening' : 'embodying',
        activeSequence: deriveActiveSequence(areaConexoes, areaMissao, areaCarreira),
      },
      oneProfile,
      lifePath: kabalisticMap?.lifePath ?? 1,
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
      synthesizedProfile: _synthesizedProfile,
    };
  } catch (err) {
    // Log error so we can fix it, but return a graceful fallback so dashboard still shows content
    console.error('[buildAkashaSynthesis] Error building synthesis — returning minimal fallback:', err);
    return {
      akashaProfile: {
        dominantFrequency: 'shadow' as const,
        overallFrequencyScore: 50,
        transformationStage: 'deepening' as const,
        activeSequence: 'vitality' as const,
      },
      oneProfile: {
        type: 'arquiteto',
        typeName: 'O Arquiteto',
        typeIcon: '🔮',
        corePattern: 'Você é O Arquiteto — cria estruturas de significado onde antes só havia caos.',
        strategy: 'Aguardar',
        strategyDetail: 'Aguarde até que a situação se revele completamente antes de agir.',
        authority: 'mental',
        authorityPractice: 'Diário: questione a urgência do pensamento. Pergunte — isto é verdade ou só ruído familiar?',
        dailyDirective: 'Hoje: preste atenção no que sua intuição sussurra.',
        oneLiner: 'Você é O Arquiteto. Sua mente constrói pontes entre mundos — você vê o que outros não veem antes de ter provas.',
        dimensionOrigin: 'Estrutura Numérica',
        growthEdge: 'Agir mais, pensar menos.',
        shadowTrap: 'Paralisia por análise excessiva.',
      },
      lifePath: 1,
      areas: {
        vitalidadeEnergia: buildFallbackArea('vitalidadeEnergia'),
        conexoesAmor: buildFallbackArea('conexoesAmor'),
        carreiraProsperidade: buildFallbackArea('carreiraProsperidade'),
        oriCabecaQuizilas: buildFallbackArea('oriCabecaQuizilas'),
        missaoDestino: buildFallbackArea('missaoDestino'),
        desafiosSombras: buildFallbackArea('desafiosSombras'),
      },
      dailyDecision: {
        strategy: 'observe',
        strategyExplanation: 'O sistema de síntese encontrou um erro técnico. Retorne em breve para sua síntese completa.',
        authority: 'mental',
        authorityQuestion: 'O que sua mente está tentando dizer sobre esta situação?',
        recommendation: 'Continue seu dia normalmente.',
        avoid: 'Decisões importantes baseadas em informação incompleta.',
      },
      synthesisParagraph: 'O sistema Akasha está atualizando. Retorne em alguns minutos para sua síntese completa.',
      synthesizedProfile: undefined,
    };
  }
}
