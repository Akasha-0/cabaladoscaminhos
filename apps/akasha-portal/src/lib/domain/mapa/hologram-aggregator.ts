import type {
  AstrologyMap,
  KabalisticMap,
  TantricMap,
  OduBirth,
  ForestMedicineMap,
  EnergyHealingMap
} from '@akasha/types';

export interface HologramDimension {
  title: string;
  chakra: string;
  keyData: Record<string, any>;
  color: string; // Tailwind glow border color or HSL
}

export interface AkashicHologram {
  /** Hexagrama I Ching natal (1-64) — preenchido pelo caller com dados do PilarIChing. */
  ichingHex?: number | null;
  vitalidadeEnergia: HologramDimension;
  conexoesAmor: HologramDimension;
  carreiraProsperidade: HologramDimension;
  oriCabecaQuizilas: HologramDimension;
  missaoDestino: HologramDimension;
  desafiosSombras: HologramDimension;
}

export function aggregateHologram(maps: {
  astrologyMap?: AstrologyMap | null;
  kabalisticMap?: KabalisticMap | null;
  tantricMap?: TantricMap | null;
  oduBirth?: OduBirth | null;
  forestMedicineMap?: ForestMedicineMap | null;
  energyHealingMap?: EnergyHealingMap | null;
  ichingHex?: number | null;
}): AkashicHologram {
  const astro = maps.astrologyMap || {} as Record<string, unknown>;
  const kabalah = maps.kabalisticMap || {} as Record<string, unknown>;
  const tantric = maps.tantricMap || {} as Record<string, unknown>;
  const odu = maps.oduBirth || {} as Record<string, unknown>;
  const forest = maps.forestMedicineMap || {} as Record<string, unknown>;
  const healing = maps.energyHealingMap || {} as Record<string, unknown>;

  // Helper to find planet position
  const findPlanet = (name: string) =>
    ((astro.planets as Array<Record<string, unknown>> | undefined) || [])
      .find((p) => (p.planet as string)?.toLowerCase() === name.toLowerCase()) || null;

  // Helper to find house position
  const findHouse = (num: number) =>
    ((astro.houses as Array<Record<string, unknown>> | undefined) || [])
      .find((h) => h.house === num) || null;

  return {
    ichingHex: maps.ichingHex ?? null,
    vitalidadeEnergia: {
      title: 'Vitalidade & Energia',
      chakra: '1º Muladhara (Básico)',
      color: '#FF3B30', // Vermelho
      keyData: {
        elementalChart: astro.elementalChart || null,
        dominantPlanet: astro.dominantPlanet || null,
        pranicBody: (tantric.bodies as Record<string, unknown> | undefined)?.pranic || null,
        physicalBody: (tantric.bodies as Record<string, unknown> | undefined)?.fisico || null,
        reikiSymbols: ((healing.reikiSymbols as Array<Record<string, unknown>> | undefined) || [])
          .filter((s: Record<string, unknown>) =>
            (s.chakraTarget as string | undefined)?.includes('Básico')) || [],
        groundingProtocol: healing.groundingProtocol || null,
        forestMedicine: forest || null,
      }
    },
    conexoesAmor: {
      title: 'Conexões & Amor',
      chakra: '4º Anahata (Cardíaco)',
      color: '#34C759', // Verde / Rosa (Anahata)
      keyData: {
        venus: findPlanet('Venus') || findPlanet('Vênus'),
        moon: findPlanet('Moon') || findPlanet('Lua'),
        lilith: findPlanet('Lilith'),
        house5: findHouse(5),
        house7: findHouse(7),
        reikiSymbols: ((healing.reikiSymbols as Array<Record<string, unknown>> | undefined) || [])
          .filter((s: Record<string, unknown>) =>
            (s.chakraTarget as string | undefined)?.includes('Cardíaco') ||
            (s.chakraTarget as string | undefined)?.includes('Plexo')) || [],
      }
    },
    carreiraProsperidade: {
      title: 'Carreira & Prosperidade',
      chakra: '3º Manipura (Plexo Solar)',
      color: '#FFCC00', // Amarelo
      keyData: {
        midheaven: astro.midheaven || null,
        jupiter: findPlanet('Jupiter') || findPlanet('Júpiter'),
        house2: findHouse(2),
        house6: findHouse(6),
        house10: findHouse(10),
        lifePath: kabalah.lifePath || null,
        expression: kabalah.expression || null,
        motivation: kabalah.motivation || null,
        impression: kabalah.impression || null,
        divineGift: tantric.divineGift || null,
      }
    },
    oriCabecaQuizilas: {
      title: 'Ori, Cabeça & Quizilas',
      chakra: '6º Ajna (Terceiro Olho)',
      color: '#5856D6', // Índigo / Azul Escuro
      keyData: {
        oduNumber: odu.oduNumber || null,
        oduName: odu.oduName || null,
        orixaRegency: odu.orixaRegency || [],
        elementalForce: odu.elementalForce || null,
        prohibitions: odu.prohibitions || [],
        lifeLesson: odu.lifeLesson || null,
        reikiSymbols: ((healing.reikiSymbols as Array<Record<string, unknown>> | undefined) || [])
          .filter((s: Record<string, unknown>) =>
            (s.chakraTarget as string | undefined)?.includes('Terceiro Olho') ||
            (s.chakraTarget as string | undefined)?.includes('Coronário')) || [],
      }
    },
    missaoDestino: {
      title: 'Missão & Destino',
      chakra: '7º Sahasrara (Coronário)',
      color: '#AF52DE', // Violeta
      keyData: {
        lifePath: kabalah.lifePath || null,
        mission: kabalah.mission || null,
        rulingArcana: kabalah.rulingArcana || null,
        pinnacles: kabalah.pinnacles || null,
        tantricPath: tantric.tantricPath || null,
        destiny: tantric.destiny || null,
      }
    },
    desafiosSombras: {
      title: 'Desafios & Sombras',
      chakra: '2º Svadhisthana (Umbilical)',
      color: '#FF9500', // Laranja
      keyData: {
        saturn: findPlanet('Saturn') || findPlanet('Saturno'),
        pluto: findPlanet('Pluto') || findPlanet('Plutão'),
        karmicLessons: kabalah.karmicLessons || [],
        karmicDebts: kabalah.karmicDebts || [],
        challenges: kabalah.challenges || null,
        karma: tantric.karma || null,
      }
    }
  };
}
