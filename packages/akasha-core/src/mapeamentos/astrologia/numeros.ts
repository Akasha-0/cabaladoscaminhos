/**
 * Astrologia — Mapeamentos Planetários
 *
 * Dados curados para os 10 planetas da numerologia esotérica astrológica.
 * Cada planeta recebe frequencia (redux numerológico), elemento,
 * signo que rege, qualidade, arquétipo Jungiano e fonte tradicional.
 *
 * Frequências (redux) baseadas na tradição pitagórica/esotérica:
 *   Sol=1, Lua=2, Mercúrio=5, Vênus=6, Marte=9, Júpiter=3,
 *   Saturno=8, Urano=4, Netuno=7, Plutão=1 (1+0=1)
 *
 * @version 1.0.0
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Planeta =
  | 'Sol'
  | 'Lua'
  | 'Mercúrio'
  | 'Vênus'
  | 'Marte'
  | 'Júpiter'
  | 'Saturno'
  | 'Urano'
  | 'Netuno'
  | 'Plutão';

export type ElementoAstro = 'fogo' | 'terra' | 'ar' | 'água';

export type Qualidade = 'cardinal' | 'fixed' | 'mutable';

export interface PlanetaNumerologia {
  planeta: Planeta;
  /** Redux vibracional (1-9) do número do planeta */
  frequencia: number;
  /** Elemento primário associado */
  elemento: ElementoAstro;
  /** Signo regido primariamente */
  signoRegra: string;
  /** Qualidade do signo que rege (cardinal/fixed/mutable) */
  qualidade: Qualidade;
  /** Arquétipo Jungiano */
  arquetipo: string;
  /** Justificativa tradicional da correspondência */
  fonte: string;
}

// ─── Tabela dos 10 Planetas ───────────────────────────────────────────────────

const PLANETAS_DATA: Record<Planeta, Omit<PlanetaNumerologia, 'planeta'>> = {
  Sol: {
    frequencia: 1,
    elemento: 'fogo',
    signoRegra: 'Leão',
    qualidade: 'fixed',
    arquetipo: 'Consciência/Yo',
    fonte: 'Astrologia Clássica — Sol = centro do sistema, princípio Yang, fogo fixo, regente de Leão, arquétipo do Pai/Yo',
  },
  Lua: {
    frequencia: 2,
    elemento: 'água',
    signoRegra: 'Câncer',
    qualidade: 'cardinal',
    arquetipo: 'Inconsciente/She',
    fonte: 'Astrologia Clássica — Lua = receptividade, princípio Yin, água cardinal, regente de Câncer, arquétipo da Mãe/She',
  },
  Mercúrio: {
    frequencia: 5,
    elemento: 'ar',
    signoRegra: 'Gêmeos',
    qualidade: 'mutable',
    arquetipo: 'Mensageiro',
    fonte: 'Astrologia Clássica — Mercúrio = comunicação, número 5 na tradição pitagórica, ar mutável, regente de Gêmeos',
  },
  Vênus: {
    frequencia: 6,
    elemento: 'terra',
    signoRegra: 'Touro',
    qualidade: 'fixed',
    arquetipo: 'Amor/Afrodite',
    fonte: 'Astrologia Clássica — Vênus = atrativo, número 6 na tradição, terra fixa taurina, arquétipo de Afrodite',
  },
  Marte: {
    frequencia: 9,
    elemento: 'fogo',
    signoRegra: 'Áries',
    qualidade: 'cardinal',
    arquetipo: 'Vontade/Ares',
    fonte: 'Astrologia Clássica — Marte = vontade, número 9 na tradição, fogo cardinal, deus da guerra, arquétipo de Ares',
  },
  Júpiter: {
    frequencia: 3,
    elemento: 'fogo',
    signoRegra: 'Sagitário',
    qualidade: 'mutable',
    arquetipo: 'Expansão/Zeus',
    fonte: 'Astrologia Clássica — Júpiter = expansão, número 3 na tradição pitagórica, fogo mutável, regente de Sagitário, arquétipo de Zeus',
  },
  Saturno: {
    frequencia: 8,
    elemento: 'terra',
    signoRegra: 'Capricórnio',
    qualidade: 'cardinal',
    arquetipo: 'Contenção/Cronos',
    fonte: 'Astrologia Clássica — Saturno = contenção, número 8 na tradição, terra cardinal, deus do tempo, arquétipo de Cronos',
  },
  Urano: {
    frequencia: 4,
    elemento: 'ar',
    signoRegra: 'Aquário',
    qualidade: 'fixed',
    arquetipo: 'Individuação/Hermes',
    fonte: 'Astrologia Moderna — Urano = electricidade, número 4 na numerologia esotérica, ar fixo, regente de Aquário, arquétipo de Hermes/Revolução',
  },
  Netuno: {
    frequencia: 7,
    elemento: 'água',
    signoRegra: 'Peixes',
    qualidade: 'mutable',
    arquetipo: 'Transcendência/Poseidon',
    fonte: 'Astrologia Moderna — Netuno = transcendência, número 7 na numerologia esotérica, água mutável, regente de Peixes, arquétipo de Poseidon',
  },
  Plutão: {
    frequencia: 1,
    elemento: 'água',
    signoRegra: 'Escorpião',
    qualidade: 'fixed',
    arquetipo: 'Metamorfose/Hades',
    fonte: 'Astrologia Moderna — Plutão = transformação profunda, número 1 em numerologia (1+0=1), água fixa, regente de Escorpião, arquétipo de Hades',
  },
};

/**
 * Tabela completa de planetas para numerologia astrológica.
 * Key: nome do planeta (Planeta)
 */
export const PLANETAS_NUMEROLOGIA: Record<Planeta, PlanetaNumerologia> =
  {} as Record<Planeta, PlanetaNumerologia>;

for (const planeta of Object.keys(PLANETAS_DATA) as Planeta[]) {
  PLANETAS_NUMEROLOGIA[planeta] = {
    planeta,
    ...PLANETAS_DATA[planeta],
  } as PlanetaNumerologia;
}

/**
 * Look up a planet's numerological data by name.
 */
export function getPlanetaNumerologia(planeta: Planeta): PlanetaNumerologia {
  return PLANETAS_NUMEROLOGIA[planeta];
}

/**
 * Returns all planets that share the same element.
 */
export function getPlanetasPorElemento(
  elemento: ElementoAstro,
): PlanetaNumerologia[] {
  return Object.values(PLANETAS_NUMEROLOGIA).filter(
    (p) => p.elemento === elemento,
  );
}
