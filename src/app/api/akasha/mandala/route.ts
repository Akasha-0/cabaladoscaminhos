import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/auth/akasha-guard';
import { prisma } from '@/lib/prisma';

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

  const chart = await prisma.akashaBirthChart.findUnique({
    where: { userId: auth.id },
  });

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
      personalYear: kabalisticMap?.personalCycles?.personalYear ?? null,
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
      // Planetas principais para marcar no anel
      planets: (astrologyMap?.planets ?? []).slice(0, 10).map((p: any) => ({
        name: p.planet ?? p.name,
        sign: p.sign,
        degree: p.degree ?? 0,
        house: p.house ?? 1,
      })),
      elementalBalance: astrologyMap?.elementalChart ?? { fire: 0, earth: 0, air: 0, water: 0 },
    },
  };

  return NextResponse.json(data);
}
