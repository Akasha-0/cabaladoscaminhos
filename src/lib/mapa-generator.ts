// ============================================================
// MAPA GENERATOR — Mapa Espiritual Inicial
// ============================================================
// Gera o mapa inicial do usuário após completar o Onboarding
// Espiritual de 5 passos.
//
// Composição:
//   - Numerologia Cabalística (caminho de vida, expressão, motivação)
//   - Numerologia Tântrica (alma, karma, dom, destino, corpos)
//   - Odu de Nascimento (regente + orixá)
//   - Astrologia (signo solar + ascendente, placeholder se sem hora)
//   - Tradições de interesse (carry-over do onboarding)
//
// Não usa dependências externas: é determinístico e roda client-side
// OU server-side. Usado tanto pela server action do onboarding quanto
// pelo endpoint /api/onboarding.
// ============================================================

import {
  calculateLifePath,
  calculateExpression,
  calculateMotivation,
  buildKabalisticMap,
  type KabalisticMap,
} from '@/lib/calculators/numerology-kabalah';

import {
  buildTantricMap,
  getTantricBody,
  type TantricMap,
} from '@/lib/calculators/numerology-tantric';

import { calculateBirthOdu, type OduBirth } from '@/lib/calculators/odu-birth';

import { calcularSol, getSigno } from '@/lib/astrologia/swiss-ephemeris';

import type { SpiritualProfileInput } from '@/lib/schemas/onboarding';

// ============================================================
// TYPES
// ============================================================

export type Signo = ReturnType<typeof getSigno>;

export type AstrologyInicial = {
  /** Signo solar (sempre presente). */
  signoSolar: Signo;
  /** Signo ascendente. Placeholder se hora ausente. */
  ascendente: Signo;
  /** Placeholder quando hora não foi informada. */
  ascendenteEstimado: boolean;
  /** Longitude aparente do sol em graus [0, 360). */
  longitudeSolar: number;
};

export type MapaEspiritual = {
  perfil: {
    fullName: string;
    birthDate: string;
    birthTime: string | null;
    birthCity: string;
    birthState: string;
    birthCountry: string;
    traditions: SpiritualProfileInput['traditions'];
  };
  numerologiaCabalistica: KabalisticMap & {
    /** Resumo em uma frase para preview no onboarding. */
    resumoCaminho: string;
  };
  numerologiaTantrica: TantricMap & {
    /** Descrição curta do corpo tântrico dominante. */
    chakraDominante: string;
  };
  odu: OduBirth;
  astrologia: AstrologyInicial;
  dataCalculo: string;
  versao: '1.0.0';
};

// ============================================================
// TRADUÇÃO DE NÚMEROS PARA TEXTO CURTO
// ============================================================
const CAMINHO_RESUMO: Record<number, string> = {
  1: 'Liderança e pioneirismo — você veio para iniciar caminhos.',
  2: 'Cooperação e sensibilidade — o diplomata do plano espiritual.',
  3: 'Expressão criativa — traga sua luz através da palavra e da arte.',
  4: 'Construção sólida — estabilidade é sua oferenda ao mundo.',
  5: 'Liberdade e movimento — sua alma respira na mudança.',
  6: 'Amor e responsabilidade — o cuidador da harmonia.',
  7: 'Intuição e saber — o buscador da verdade interior.',
  8: 'Poder e realização — o mestre do mundo material.',
  9: 'Completude e serviço — a consciência universal.',
  11: 'Mestre da iluminação — intuição como ofício de vida.',
  22: 'Mestre construtor — grandes obras em benefício coletivo.',
  33: 'Mestre curador — o amor em sua frequência mais pura.',
};

export function getCaminhoResumo(numero: number): string {
  return CAMINHO_RESUMO[numero] ?? 'Número com vibração única em descoberta.';
}

// ============================================================
// ASTROLOGIA INICIAL
// ============================================================

/**
 * Calcula signo solar e ascendente (placeholder) a partir da data.
 * Se `birthTime` estiver ausente, ascendente fica como `aries`
 * com flag `ascendenteEstimado = true` (regra de fallback do projeto).
 */
export function calculateAstrologyInicial(
  birthDate: string,
  birthTime?: string | null
): AstrologyInicial {
  // Data-hora de referência para cálculo solar (UTC midday é seguro)
  const ref = birthTime
    ? new Date(`${birthDate}T${birthTime}:00`)
    : new Date(`${birthDate}T12:00:00`);
  const safeDate = Number.isNaN(ref.getTime())
    ? new Date(`${birthDate}T12:00:00`)
    : ref;

  const sol = calcularSol(safeDate);
  const signoSolar = getSigno(sol.longitude);

  if (birthTime) {
    // Sem coordenadas geográficas precisas neste fluxo, usamos
    // uma estimativa simplificada: a cada 2h após o nascer do sol,
    // um signo ascende (regra de bolso). Para o onboarding basta
    // mostrar um placeholder correto o suficiente para o preview.
    const hour = Number(birthTime.split(':')[0]);
    const offset = Math.floor((hour - 6) / 2);
    const ascendingLongitude = (sol.longitude + 90 + offset * 30 + 360) % 360;
    return {
      signoSolar,
      ascendente: getSigno(ascendingLongitude),
      ascendenteEstimado: false,
      longitudeSolar: sol.longitude,
    };
  }

  return {
    signoSolar,
    ascendente: 'aries',
    ascendenteEstimado: true,
    longitudeSolar: sol.longitude,
  };
}

// ============================================================
// GERADOR PRINCIPAL
// ============================================================

/**
 * Gera o mapa espiritual inicial a partir do SpiritualProfile
 * validado pelo Zod schema de onboarding.
 */
export function generateMapaEspiritual(
  profile: SpiritualProfileInput
): MapaEspiritual {
  const kabalistic = buildKabalisticMap(profile.fullName, profile.birthDate);
  const tantric = buildTantricMap(profile.birthDate);
  const odu = calculateBirthOdu(profile.birthDate);
  const astrology = calculateAstrologyInicial(
    profile.birthDate,
    profile.birthTime || null
  );

  return {
    perfil: {
      fullName: profile.fullName,
      birthDate: profile.birthDate,
      birthTime: profile.birthTime || null,
      birthCity: profile.birthCity,
      birthState: profile.birthState,
      birthCountry: profile.birthCountry,
      traditions: profile.traditions,
    },
    numerologiaCabalistica: {
      ...kabalistic,
      resumoCaminho: getCaminhoResumo(kabalistic.lifePath),
    },
    numerologiaTantrica: {
      ...tantric,
      chakraDominante: getTantricBody(tantric.soul),
    },
    odu,
    astrologia: astrology,
    dataCalculo: new Date().toISOString(),
    versao: '1.0.0',
  };
}

// ============================================================
// HELPERS UTILITÁRIOS (re-exportados para os componentes)
// ============================================================

export {
  calculateLifePath,
  calculateExpression,
  calculateMotivation,
};
