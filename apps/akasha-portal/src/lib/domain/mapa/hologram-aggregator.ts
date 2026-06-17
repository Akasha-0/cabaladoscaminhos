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
  color: string; // Tailwind glow border color or HSL
  keyData: Record<string, any>;
}

export interface AkashicHologram {
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
}): AkashicHologram {
  const astro = maps.astrologyMap || {} as any;
  const kabalah = maps.kabalisticMap || {} as any;
  const tantric = maps.tantricMap || {} as any;
  const odu = maps.oduBirth || {} as any;
  const forest = maps.forestMedicineMap || {} as any;
  const healing = maps.energyHealingMap || {} as any;

  // Helper to find planet position
  const findPlanet = (name: string) => 
    astro.planets?.find((p: any) => p.planet?.toLowerCase() === name.toLowerCase()) || null;

  // Helper to find house position
  const findHouse = (num: number) => 
    astro.houses?.find((h: any) => h.house === num) || null;

  return {
    vitalidadeEnergia: {
      title: 'Vitalidade & Energia',
      chakra: '1º Muladhara (Básico)',
      color: '#FF3B30', // Vermelho
      keyData: {
        elementalChart: astro.elementalChart || null,
        dominantPlanet: astro.dominantPlanet || null,
        pranicBody: tantric.bodies?.pranic || null,
        physicalBody: tantric.bodies?.fisico || null,
        reikiSymbols: healing.reikiSymbols?.filter((s: any) => s.chakraTarget?.includes('Básico')) || [],
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
        reikiSymbols: healing.reikiSymbols?.filter((s: any) => s.chakraTarget?.includes('Cardíaco') || s.chakraTarget?.includes('Plexo')) || [],
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
        reikiSymbols: healing.reikiSymbols?.filter((s: any) => s.chakraTarget?.includes('Terceiro Olho') || s.chakraTarget?.includes('Coronário')) || [],
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
