/**
 * Maps wrapper — carrega os 4 mapas do usuário a partir dos cores existentes.
 */
import { getBirthChart, type BirthChart } from '@akasha/core-astrology';
import { buildKabalisticMap } from '@akasha/core-cabala';
import { calculateBirthOdu } from '@akasha/core-odus';
import { buildTantricMap } from '@akasha/core-tantra';
import type {
  UserMaps,
  CabalaMap,
  OduMap,
  AstrologyMap,
  TantraMap,
  CabalaData,
  AstrologyData,
} from './types';

export interface MapLoaderConfig {
  prisma: any; // PrismaClient
  userId: string;
}

// ============================================================================
// Signo dos planetas — extrai signo do BirthChart
// ============================================================================
function extractPlanetSign(chart: BirthChart, planet: string): string {
  const pos = chart.planets.find((p) => p.planet === planet);
  if (!pos) return 'desconhecido';
  const signIndex = Math.floor(pos.longitude / 30);
  const signs = [
    'aries',
    'touro',
    'gemeos',
    'cancer',
    'leao',
    'virgem',
    'libra',
    'escorpio',
    'sagitario',
    'capricornio',
    'aquario',
    'peixes',
  ];
  return signs[signIndex % 12] ?? 'desconhecido';
}

// ============================================================================
// Descrição do caminho de vida
// ============================================================================
const LIFE_PATH_DESCRIPTIONS: Record<number, string> = {
  1: 'Iniciativa, liderança, independência, originalidade, pioneirismo',
  2: 'Parceria, cooperação, diplomacia, sensibilidade, equilíbrio',
  3: 'Expressão, criatividade, comunicação, otimismo, inspiração',
  4: 'Estabilidade, estrutura, trabalho árduo, organização, fundamento',
  5: 'Liberdade, mudança, aventura, versatilidade, adaptação',
  6: 'Responsabilidade, família, lar, harmonia, serviço',
  7: 'Análise, introspecção, espiritualidade, solidão, conhecimento',
  8: 'Poder, autoridade, riqueza material, ambição, sabedoria prática',
  9: 'Compaixão, humanitarismo, encerramento, generosidade, iluminação',
  11: 'Iluminação espiritual, intuição elevada, mestre, visão profética',
  22: 'Mestre construtor, realizações práticas em grande escala',
  33: 'Mestre professor, serviço espiritual sem ego, cura em massa',
};

const SEFIROT_PATHS: Record<number, string> = {
  1: 'Keter (Coroa)',
  2: 'Chokhmah (Sabedoria)',
  3: 'Binah (Compreensão)',
  4: 'Chesed (Misericórdia)',
  5: 'Gevurah (Força)',
  6: 'Tiferet (Beleza)',
  7: 'Netzach (Vitória)',
  8: 'Hod (Glória)',
  9: 'Yesod (Fundação)',
  10: 'Malkuth (Reino)',
};

// ============================================================================
// Load User Maps
// ============================================================================
export async function loadUserMaps(config: MapLoaderConfig): Promise<UserMaps> {
  const user = await config.prisma.user.findUnique({
    where: { id: config.userId },
    select: { birthDate: true, name: true, location: true },
  });

  if (!user) throw new Error('User not found');

  const birthDate = user.birthDate;
  const name = user.name;
  const location = user.location ?? '';

  // Cabala
  const kabala = buildKabalisticMap(name, birthDate);
  const cabala: CabalaMap = {
    lifePath: kabala.lifePath ?? 1,
    lifePathMaster: kabala.lifePathMaster ?? false,
    description: LIFE_PATH_DESCRIPTIONS[kabala.lifePath ?? 1] ?? 'Energia do caminho de vida',
    sefirot: kabala.lifePath ? [SEFIROT_PATHS[kabala.lifePath] ?? 'Keter'] : [],
  };

  // CabalaData
  const cabalaData: CabalaData = {
    lifePath: kabala.lifePath,
    lifePathMaster: kabala.lifePathMaster,
    dominantSefira: kabala.lifePath ? SEFIROT_PATHS[kabala.lifePath] : undefined,
    description: LIFE_PATH_DESCRIPTIONS[kabala.lifePath ?? 1],
    sefirot: kabala.lifePath ? [SEFIROT_PATHS[kabala.lifePath] ?? 'Keter'] : [],
  };

  // Odus
  const oduBirth = calculateBirthOdu(birthDate);
  const odu: OduMap = {
    primary: oduBirth.oduName ?? 'Ogbe (Oxé)',
    secondary: undefined,
    sign: oduBirth.sign ?? '',
  };

  // Astrologia
  const birthDateObj = new Date(birthDate);
  const chart = getBirthChart({
    birthDate: birthDateObj,
    latitude: location ? parseLocationLat(location) : undefined,
    longitude: location ? parseLocationLon(location) : undefined,
  });
  const astrology: AstrologyMap = {
    sun: extractPlanetSign(chart, 'sol'),
    moon: extractPlanetSign(chart, 'lua'),
    rising: extractPlanetSign(chart, 'ascendente'),
    planets: {
      sol: extractPlanetSign(chart, 'sol'),
      lua: extractPlanetSign(chart, 'lua'),
      mercurio: extractPlanetSign(chart, 'mercurio'),
      venus: extractPlanetSign(chart, 'venus'),
      marte: extractPlanetSign(chart, 'marte'),
      jupiter: extractPlanetSign(chart, 'jupiter'),
      saturno: extractPlanetSign(chart, 'saturno'),
    },
  };

  const astrologyData: AstrologyData = {
    sign: extractPlanetSign(chart, 'sol'),
    moon: extractPlanetSign(chart, 'lua'),
    rising: extractPlanetSign(chart, 'ascendente'),
    planets: astrology.planets,
    houses: {},
    rashi: extractPlanetSign(chart, 'ascendente'),
  };

  // Tantra
  const tantric = buildTantricMap(birthDate);
  const tantra: TantraMap = {
    primary: tantric.soulDescription ?? 'Corpo da Alma',
    secondary: tantric.karmaDescription ?? 'Corpo Negativo',
    bodies: [
      tantric.soulDescription ?? 'Corpo da Alma',
      tantric.karmaDescription ?? 'Corpo Negativo',
      tantric.divineGiftDescription ?? 'Corpo Positivo',
    ],
  };

  return { cabala: cabalaData, astrology: astrologyData, odus: odu, tantra };
}

// ============================================================================
// Parse location helper
// ============================================================================
function parseLocationLat(loc: string): number | undefined {
  // Formato esperado: "lat,lon" ou "latitude, longitude"
  const match = loc.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : undefined;
}

function parseLocationLon(loc: string): number | undefined {
  const match = loc.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  return match ? parseFloat(match[2]) : undefined;
}

// ============================================================================
// Format Maps Summary — CLI
// ============================================================================
export function formatMapsSummary(maps: UserMaps): string {
  const cabala = maps.cabala as CabalaData | undefined;
  const astrology = maps.astrology as AstrologyData | undefined;
  const odu = maps.odus;
  const tantra = maps.tantra;

  return `
📊 SEUS MAPAS:
• Caminho de Vida: ${cabala?.lifePath ?? 'N/A'} (${cabala?.description ?? 'N/A'})
• Odu Regente: ${odu?.primary ?? 'N/A'}
• Sol: ${astrology?.sign ?? 'N/A'}
• Corpo Tântrico: ${tantra?.primary ?? 'N/A'}
  `.trim();
}

// ============================================================================
// Maps to Prompt Context — LLM
// ============================================================================
export function mapsToPromptContext(maps: UserMaps): string {
  const cabala = maps.cabala as CabalaData | undefined;
  const astrology = maps.astrology as AstrologyData | undefined;
  const odu = maps.odus;
  const tantra = maps.tantra;

  return `
MAPAS ESPIRITUAIS DO USUÁRIO:
1. CABALA - Caminho de Vida: ${cabala?.lifePath ?? 'N/A'}
   Descrição: ${cabala?.description ?? 'N/A'}
   Sefirot: ${cabala?.sefirot?.join(', ') ?? 'N/A'}

2. IFÁ - Odu Regente: ${odu?.primary ?? 'N/A'}
   ${odu?.secondary ? `Odu Secundário: ${odu.secondary}` : ''}
   Sign: ${odu?.sign ?? 'N/A'}

3. ASTROLOGIA - Sol: ${astrology?.sign ?? 'N/A'}
   Lua: ${astrology?.moon ?? 'N/A'}
   Ascendente: ${astrology?.rising ?? 'N/A'}
   Planetas: ${
     astrology?.planets
       ? Object.entries(astrology.planets)
           .map(([k, v]) => `${k}: ${v}`)
           .join(', ')
       : 'N/A'
   }

4. TANTRA - Corpo Primário: ${tantra?.primary ?? 'N/A'}
   Corpo Secundário: ${tantra?.secondary ?? 'N/A'}
   Corpos: ${tantra?.bodies?.join(', ') ?? 'N/A'}
  `.trim();
}
