import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { findAspects, type Aspecto } from '@akasha/core-astrology';

const MAIN_ASPECT_TYPES = ['conjunção', 'oposição', 'trino', 'quadratura', 'sextil'];

// Interpretações简短的 para aspectos principais
const ASPECT_INTERPRETATIONS: Record<string, string> = {
  conjunção: 'União de energias — potencial para ação concentrada ou conflito dependendo dos planetas envolvidos.',
  oposição: 'Tensão entre duas forças — oportunidade para integração e equilíbrio através do autoconhecimento.',
  trino: 'Fluxo harmonioso de energias — facilidade, talento natural e oportunidades favoráveis.',
  quadratura: 'Tensão construtiva — fonte de dinamismo, desafios que exigem superação para crescimento.',
  sextil: 'Oportunidades discretas — ângulos favoráveis para ação e pequenos avanços.',
};

function interpretAspect(aspect: Aspecto): string {
  const base = ASPECT_INTERPRETATIONS[aspect.tipo] ?? 'Aspecto astrológico.';
  const planets = `${aspect.planeta1}–${aspect.planeta2}`;
  const nature = aspect.nature === 'harmony' ? 'Harmonioso' : aspect.nature === 'tension' ? 'Tensivo' : 'Neutro';
  return `${nature}: ${base} Planetas: ${planets}.`;
}

// Os 11 nomes dos Corpos Tântricos (Kundalini Yoga / Yogi Bhajan)
const TANTRIC_BODY_NAMES = [
  'Corpo da Alma',
  'Mente Negativa',
  'Mente Positiva',
  'Mente Neutra',
  'Corpo Físico',
  'Linha do Arco',
  'Aura',
  'Corpo Prânico',
  'Corpo Sutil',
  'Corpo Radiante',
  'Mente Divina',
];

export async function GET(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const [chart, user] = await Promise.all([
    prisma.birthChart.findUnique({ where: { userId: auth.id } }),
    prisma.user.findUnique({
      where: { id: auth.id },
      select: { ichingMap: true, birthDate: true, birthTime: true },
    }),
  ]);

  // Se não tem chart, retornar 404 para redirecionar ao onboarding
  if (!chart) {
    return NextResponse.json({ error: 'Mapa natal não calculado' }, { status: 404 });
  }

  // Formatar dados para o componente SVG
  // Os campos são JSON armazenados — fazemos cast
  const astrologyMap = chart.astrologyMap as any;
  const kabalisticMap = chart.kabalisticMap as any;
  const tantricMap = chart.tantricMap as any;
  const oduBirth = chart.oduBirth as any;
  const ichingMap = (user?.ichingMap ?? null) as any;
  const userBirthDate = user?.birthDate ?? null;
  const userBirthTime = user?.birthTime ?? null;

  // Preparar dados astrológicos para cálculo de aspectos
  const rawPlanets: Record<string, any> = astrologyMap?.planeta ?? {};
  const planetPositions = Object.values(rawPlanets);

  // Calcular aspectos astrológicos
  const allAspects = findAspects(planetPositions);
  const mainAspects = allAspects
    .filter((a) => MAIN_ASPECT_TYPES.includes(a.tipo))
    .slice(0, 5)
    .map((a) => ({
      planet1: a.planeta1,
      planet2: a.planeta2,
      aspect: a.tipo,
      orb: Math.round(a.orb * 100) / 100,
      interpretation: interpretAspect(a),
    }));

  // Retornar estrutura MandalaData
  const data = {
    incomplete: chart.incomplete,

    // Núcleo — Odus (Layer 1)
    odus: {
      oduName: oduBirth?.oduName ?? oduBirth?.birthOdu?.[0]?.meaning ?? 'Ori',
      oduNumber: oduBirth?.oduNumber ?? null,
      orixaRegency: oduBirth?.orixaRegency ?? [],
      elementalForce: oduBirth?.elementalForce ?? null,
      provisional: oduBirth?.provisional ?? true,
      preceitos: oduBirth?.preceitos ?? [],
      quizilas: oduBirth?.quizilas ?? [],
    },

    // Kabala (Layer 2)
    kabala: {
      lifePath: kabalisticMap?.lifePath ?? null,
      lifePathMaster: kabalisticMap?.lifePathMaster ?? false,
      expression: kabalisticMap?.expression ?? null,
      expressionMaster: kabalisticMap?.expressionMaster ?? false,
      motivation: kabalisticMap?.motivation ?? null,
      impression: kabalisticMap?.impression ?? null,
      mission: kabalisticMap?.mission ?? null,
      personalYear: kabalisticMap?.personalCycles?.personalYear ?? null,
      personalMonth: kabalisticMap?.personalCycles?.personalMonth ?? null,
      personalDay: kabalisticMap?.personalCycles?.personalDay ?? null,
      sefira: kabalisticMap?.sefirotPath ?? null,
      hebrewLetter: kabalisticMap?.hebrewLetter ?? null,
      tarotCard: kabalisticMap?.rulingArcana?.lifePath ?? null,
      challenges: kabalisticMap?.challenges ?? null,
      pinnacles: kabalisticMap?.pinnacles ?? null,
      lifeCycles: kabalisticMap?.lifeCycles ?? null,
    },

    // Tântrica (Layer 3) — 11 Corpos
    tantra: {
      soul: tantricMap?.soul ?? null,
      karma: tantricMap?.karma ?? null,
      divineGift: tantricMap?.divineGift ?? null,
      destiny: tantricMap?.destiny ?? null,
      tantricPath: tantricMap?.tantricPath ?? null,
      // Se tantricBodies existir, usar; senão gerar placeholders
      bodies: tantricMap?.tantricBodies
        ? Object.entries(tantricMap.tantricBodies).map(([k, v]: [string, any]) => ({
            index: parseInt(k) || 0,
            name: v?.name ?? `Corpo ${k}`,
            active: v?.active !== false,
          }))
        : Array.from({ length: 11 }, (_, i) => ({
            index: i + 1,
            name: TANTRIC_BODY_NAMES[i] ?? `Corpo ${i + 1}`,
            active: true,
          })),
    },

    // Astrologia (Layer 4)
    astrology: {
      ascendant: astrologyMap?.ascendant ?? null,
      midheaven: astrologyMap?.midheaven ?? null,
      dominantPlanet: astrologyMap?.dominantPlanet ?? null,
      // Todos os planetas disponíveis (sem limite artificial)
      planets: Object.values(rawPlanets).map((p: any) => ({
        name: p.planeta ?? p.name,
        sign: p.signo ?? p.sign,
        degree: p.grauNoSigno ?? p.degree ?? 0,
        // Mandala Fase 3 (spec mandala-fase3-zodiac-tantra): passar longitude absoluta
        // (0-360°) para que o MandalaChart posicione os planetas na eclíptica correta.
        // Antes desta mudança, o MandalaChart usava `degree` (0-30° = grau dentro do
        // signo), clusterizando todos os planetas no arco 0-30°.
        absoluteLongitude: typeof p.longitude === 'number' ? p.longitude : null,
        retrograde: Boolean(p.retrograde ?? p.retrogrado ?? false),
        house: p.casa ?? p.house ?? 1,
      })),
      aspects: mainAspects,
      elementalBalance: astrologyMap?.elementalChart ?? { fire: 0, earth: 0, air: 0, water: 0 },
    },

    // I-Ching (Layer 5) — v0.0.5 T6
    iching: {
      hexagramNumber: ichingMap?.hexagramNumber ?? null,
      hexagramName: ichingMap?.hexagramName ?? null,
      hexagramChineseName: ichingMap?.hexagramChineseName ?? null,
      upperTrigram: ichingMap?.upperTrigram ?? null,
      lowerTrigram: ichingMap?.lowerTrigram ?? null,
      upperTrigramName: ichingMap?.upperTrigramName ?? null,
      lowerTrigramName: ichingMap?.lowerTrigramName ?? null,
      lines: Array.isArray(ichingMap?.lines) ? ichingMap.lines : [],
      algorithm: ichingMap?.algorithm ?? null,
      provisional: ichingMap?.provisional ?? true,
      birthDate: ichingMap?.birthDate ?? null,
      birthTime: ichingMap?.birthTime ?? null,
      available: !!ichingMap && !ichingMap.error,
      error: ichingMap?.error ?? null,
    },

    // birthDate/birthTime do User (apenas para computeIchingNode no front)
    _user: {
      birthDate: userBirthDate ? userBirthDate.toISOString() : null,
      birthTime: userBirthTime ?? null,
    },
  };

  return NextResponse.json(data);
}
