// W70 Synastry Engine — shared branded types + types.
// 7 sacred traditions: cigano, tarot, astrologia, numerologia, cabala, orixas, tantra.

export type UserId = string & { readonly __brand: 'UserId' };
export type NatalChartId = string & { readonly __brand: 'NatalChartId' };
export type AspectId = string & { readonly __brand: 'AspectId' };
export type CardKey = string & { readonly __brand: 'CardKey' };

export type Tradition =
  | 'cigano'
  | 'tarot'
  | 'astrologia'
  | 'numerologia'
  | 'cabala'
  | 'orixas'
  | 'tantra';

export type Locale = 'pt-BR' | 'en' | 'es';

export type ZodiacSign =
  | 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo'
  | 'libra' | 'scorpius' | 'sagittarius' | 'capricornius' | 'aquarius' | 'pisces';

export type Planet =
  | 'sol' | 'lua' | 'mercurio' | 'venus' | 'marte' | 'jupiter'
  | 'saturno' | 'urano' | 'netuno' | 'plutao';

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Sephirah =
  | 'kether' | 'chokmah' | 'binah' | 'chesed' | 'geburah'
  | 'tiphareth' | 'netzach' | 'hod' | 'yesod' | 'malkuth';

export type Chakra =
  | 'muladhara' | 'svadhisthana' | 'manipura' | 'anahata'
  | 'vishuddha' | 'ajna' | 'sahasrara';

export type LifePathNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;

export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles';

export interface PlanetPosition {
  readonly planet: Planet;
  readonly sign: ZodiacSign;
  readonly house: HouseNumber;
  readonly degree: number;       // 0..360 in tropical zodiac
  readonly retrograde: boolean;
}

export interface HouseCusp {
  readonly house: HouseNumber;
  readonly sign: ZodiacSign;
  readonly degree: number;       // 0..360, cusp position
}

export interface NatalChart {
  readonly id: NatalChartId;
  readonly planets: readonly PlanetPosition[];
  readonly houses: readonly HouseCusp[];
  readonly ascendant: {
    readonly sign: ZodiacSign;
    readonly degree: number;
  };
}

export interface OduRef {
  readonly oduName: string;          // e.g. "Ogundá", "Eji-Ogundá"
  readonly regentOrixa: string;     // official regent
  readonly requestingOrixa: string; // kinetic requestor
}

export interface UserProfile {
  readonly userId: UserId;
  readonly displayName: string;
  readonly birthDate: string;       // YYYY-MM-DD
  readonly natalChart: NatalChart;
  readonly oduList: readonly OduRef[];
  readonly ciganoBirthCard: CardKey;
  readonly tarotBirthArcana: number;          // 0..21 (0=Fool, 21=World)
  readonly tarotDominantSuit: TarotSuit;
  readonly lifePathNumber: LifePathNumber;
  readonly sephirah: Sephirah;
  readonly dominantChakra: Chakra;
}

// --- id helpers ---
export function asUserId(s: string): UserId { return s as UserId; }
export function asNatalChartId(s: string): NatalChartId { return s as NatalChartId; }
export function asCardKey(s: string): CardKey { return s as CardKey; }

// All 7 traditions ordered as in the IDEIA.md sacred taxonomy.
export const TRADITIONS: readonly Tradition[] = Object.freeze([
  'cigano', 'tarot', 'astrologia', 'numerologia', 'cabala', 'orixas', 'tantra',
] as Tradition[]);

// --- audit: sacred coverage helper (cycle 62 lesson 2 + lesson 12) ---
export interface TraditionCoverage {
  readonly present: boolean;
  readonly fieldsCovered: readonly string[];
}

export interface CatalogCoverageReport {
  readonly totalFields: number;
  readonly presentFields: number;
  readonly minRequired: number;
  readonly passes: boolean;
  readonly coverageByTradition: Readonly<Record<Tradition, TraditionCoverage>>;
}

export function assertCatalogCoverage(profile: UserProfile, minRequired = 7): CatalogCoverageReport {
  const fieldsByTradition: Readonly<Record<Tradition, readonly string[]>> = Object.freeze({
    cigano: profile.ciganoBirthCard ? ['ciganoBirthCard'] : [],
    tarot: profile.tarotBirthArcana !== undefined && profile.tarotDominantSuit
      ? ['tarotBirthArcana', 'tarotDominantSuit'] : [],
    astrologia: profile.natalChart
      ? ['natalChart.planets', 'natalChart.houses', 'natalChart.ascendant']
      : [],
    numerologia: profile.lifePathNumber ? ['lifePathNumber'] : [],
    cabala: profile.sephirah ? ['sephirah'] : [],
    orixas: profile.oduList && profile.oduList.length > 0
      ? ['oduList.regentOrixa', 'oduList.requestingOrixa'] : [],
    tantra: profile.dominantChakra ? ['dominantChakra'] : [],
  });

  const coverageByTradition: Record<Tradition, TraditionCoverage> = {} as Record<Tradition, TraditionCoverage>;
  for (const t of TRADITIONS) {
    const fields = fieldsByTradition[t];
    coverageByTradition[t] = Object.freeze({
      present: fields.length > 0,
      fieldsCovered: Object.freeze([...fields]),
    });
  }

  const presentFields = Object.values(coverageByTradition).reduce((acc, c) => acc + c.fieldsCovered.length, 0);
  return {
    totalFields: 9,
    presentFields,
    minRequired,
    passes: presentFields >= minRequired,
    coverageByTradition: Object.freeze(coverageByTradition),
  };
}
