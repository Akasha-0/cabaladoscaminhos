import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/auth/akasha-guard';
import { prisma } from '@/lib/prisma';
import type { ManifestoContent } from '@/components/akasha/ManifestoPDF';

export async function POST(request: NextRequest) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  // Retornar manifesto existente se já gerado
  const existing = await prisma.akashaManifesto.findUnique({
    where: { userId: auth.id },
    select: { id: true, content: true },
  });
  if (existing) {
    return NextResponse.json({ manifestoId: existing.id, content: existing.content });
  }

  const [user, chart] = await Promise.all([
    prisma.akashaUser.findUnique({ where: { id: auth.id }, select: { fullName: true } }),
    prisma.akashaBirthChart.findUnique({ where: { userId: auth.id } }),
  ]);

  if (!user || !chart) {
    return NextResponse.json({ error: 'Mapa natal não encontrado. Complete o onboarding.' }, { status: 404 });
  }

  const astro = chart.astrologyMap as Record<string, unknown>;
  const kab = chart.kabalisticMap as Record<string, unknown>;
  const tantra = chart.tantricMap as Record<string, unknown>;
  const odu = chart.oduBirth as Record<string, unknown>;

  const content: ManifestoContent = {
    userName: user.fullName,
    generatedAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),

    odus: {
      title: 'Bússola Ancestral',
      oduName: (odu?.oduName as string) ?? ((odu?.birthOdu as Array<{ meaning: string }>)?.[0]?.meaning ?? 'Ori'),
      oduNumber: (odu?.oduNumber as number) ?? null,
      orixas: (odu?.orixaRegency as string[]) ?? [],
      elementalForce: (odu?.elementalForce as string) ?? null,
      description: buildOduDescription(odu),
      provisional: (odu?.provisional as boolean) ?? true,
    },
    kabala: {
      title: 'O Verbo',
      lifePath: (kab?.lifePath as number) ?? null,
      lifePathMaster: (kab?.lifePathMaster as boolean) ?? false,
      expression: (kab?.expression as number) ?? null,
      motivation: (kab?.motivation as number) ?? null,
      personalYear: ((kab?.personalCycles as Record<string, unknown>)?.personalYear as number) ?? null,
      description: buildKabalaDescription(kab),
    },
    tantra: {
      title: 'Anatomia Sutil',
      soul: (tantra?.soul as number) ?? null,
      karma: (tantra?.karma as number) ?? null,
      divineGift: (tantra?.divineGift as number) ?? null,
      tantricPath: (tantra?.tantricPath as number) ?? null,
      description: buildTantraDescription(tantra),
    },
    astrology: {
      title: 'Mapa de Bordo',
      ascendant: (astro?.ascendant as string) ?? null,
      dominantPlanet: (astro?.dominantPlanet as string) ?? null,
      mainPlanets: ((astro?.planets as Array<Record<string, string>>) ?? []).slice(0, 7).map((p) => ({
        name: (p.planet ?? p.name ?? '') as string,
        sign: (p.sign ?? '') as string,
      })),
      description: buildAstroDescription(astro),
    },
  };

  const manifesto = await prisma.akashaManifesto.create({
    data: { userId: auth.id, content: content as unknown as Parameters<typeof prisma.akashaManifesto.create>[0]['data']['content'] },
    select: { id: true },
  });

  return NextResponse.json({ manifestoId: manifesto.id, content }, { status: 201 });
}

function buildOduDescription(odu: Record<string, unknown> | null | undefined): string {
  if (!odu || odu.error) return 'Seu Odu de nascimento carrega as forças ancestrais que moldaram sua encarnação. Cada Odu é um arquétipo de existência — um conjunto de histórias, lições e poderes transmitidos pela linhagem iorubá-nagô.';
  const parts: string[] = [];
  if (odu.lifeLesson) parts.push(`Lição de vida: ${odu.lifeLesson}.`);
  if (odu.elementalForce) parts.push(`Sua força elemental é ${odu.elementalForce}, que guia sua capacidade de agir e criar no mundo material.`);
  parts.push('Este Odu delineia os rituais de alinhamento do seu Ori — a centelha divina que guia suas escolhas e atrai o destino.');
  return parts.join(' ');
}

function buildKabalaDescription(kab: Record<string, unknown> | null | undefined): string {
  if (!kab || kab.error) return 'A Numerologia Cabalística decodifica a frequência do seu nome e data de nascimento, revelando o contrato de alma que você firmou antes desta encarnação.';
  const parts: string[] = [];
  if (kab.lifePath) parts.push(`Seu Caminho de Vida ${kab.lifePath}${kab.lifePathMaster ? ' (Número Mestre)' : ''} é a espinha dorsal da sua jornada — a lição central que você veio dominar.`);
  if (kab.expression) parts.push(`Expressão ${kab.expression}: como você manifesta seu propósito no mundo.`);
  const karmicLessons = kab.karmicLessons as string[] | undefined;
  if (karmicLessons?.length) parts.push(`Lições kármicas a integrar: ${karmicLessons.join(', ')}.`);
  return parts.join(' ') || 'Seus números cabalísticos revelam o propósito oculto desta encarnação.';
}

function buildTantraDescription(tantra: Record<string, unknown> | null | undefined): string {
  if (!tantra || tantra.error) return 'Os 11 Corpos Espirituais da Numerologia Tântrica mapeiam a anatomia sutil do seu ser — onde a energia flui com facilidade e onde ela encontra resistência.';
  const parts: string[] = [];
  if (tantra.soul) parts.push(`Corpo da Alma ${tantra.soul}: a frequência do seu Eu eterno.`);
  if (tantra.karma) parts.push(`Karma ${tantra.karma}: o padrão ancestral que você veio transmutar.`);
  if (tantra.divineGift) parts.push(`Dom Divino ${tantra.divineGift}: sua habilidade natural de elevar o campo ao redor.`);
  return parts.join(' ') || 'Os 11 Corpos revelam onde sua energia está em fluxo e onde precisa de alinhamento.';
}

function buildAstroDescription(astro: Record<string, unknown> | null | undefined): string {
  if (!astro || astro.error || astro.note) return 'Seu mapa astral natal registra o céu exato no momento do seu nascimento — uma impressão cósmica única que não se repete. Forneça seu local de nascimento para o cálculo completo.';
  const parts: string[] = [];
  if (astro.ascendant) parts.push(`Ascendente em ${astro.ascendant}: a máscara que o mundo vê e o portal pelo qual você se apresenta.`);
  if (astro.dominantPlanet) parts.push(`${astro.dominantPlanet} como planeta dominante amplifica os temas deste regente em todos os ciclos da sua vida.`);
  if (astro.lunarPhase) parts.push(`Lua nascida em ${astro.lunarPhase} — ritmo emocional e padrões inconscientes.`);
  return parts.join(' ') || 'O céu natal é sua impressão cósmica — única e irrepetível.';
}
