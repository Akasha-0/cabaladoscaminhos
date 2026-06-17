import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

// Request body shape
interface CycleSnapshotPayload {
  // Full cycle data computed by the evolutionary agent
  snapshot: {
    birthDate: string;
    currentDate: string;
    age: number;
    lifePath: number;
    personalDay: Record<string, unknown>;
    personalMonth: Record<string, unknown>;
    personalYear: Record<string, unknown>;
    universalYear: Record<string, unknown>;
    currentPinnacle: Record<string, unknown>;
    challenges: Record<string, unknown>;
    karmicLessons: Record<string, unknown>;
    maturity: Record<string, unknown>;
    synthesis: string;
    overallEnergy: number;
  };
  // Per-area alignment data from deriveCycleModulation
  modulation: Array<{
    area: string;
    alignmentScore: number;
    suggestedBoost: string;
    rationale: string;
  }>;
  // Exercises shown to the user this cycle
  exercises: Array<{
    id: string;
    area: string;
    title: string;
    instruction: string;
    duration: string;
    difficulty: string;
    type: string;
  }>;
  // Area synthesis data (for AreaHistoryEntry derivation)
  areas: Record<string, {
    frequency: string;
    intensity: number;
    pillarContribution: Record<string, string>;
  }>;
}

export async function POST(req: NextRequest) {
  // Authenticate
  const authResult = await requireAkashaApi(req);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  // Parse body
  let body: CycleSnapshotPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { snapshot, modulation, exercises, areas } = body;

  if (!snapshot?.currentDate) {
    return NextResponse.json({ error: 'snapshot.currentDate is required' }, { status: 400 });
  }

  const snapshotDate = new Date(snapshot.currentDate);
  if (isNaN(snapshotDate.getTime())) {
    return NextResponse.json({ error: 'Invalid snapshot.currentDate' }, { status: 400 });
  }

  try {
    // ── Upsert CycleSnapshot ────────────────────────────────────────────────
    const savedSnapshot = await prisma.cycleSnapshot.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: snapshotDate,
        },
      },
      update: {
        personalDay: snapshot.personalDay as never,
        personalMonth: snapshot.personalMonth as never,
        personalYear: snapshot.personalYear as never,
        universalYear: snapshot.universalYear as never,
        currentPinnacle: snapshot.currentPinnacle as never,
        challenges: snapshot.challenges as never,
        karmicLessons: snapshot.karmicLessons as never,
        maturity: snapshot.maturity as never,
        modulation: modulation as never,
        synthesis: snapshot.synthesis,
        overallEnergy: snapshot.overallEnergy,
        exercisesJson: exercises as never,
      },
      create: {
        userId: user.id,
        date: snapshotDate,
        personalDay: snapshot.personalDay as never,
        personalMonth: snapshot.personalMonth as never,
        personalYear: snapshot.personalYear as never,
        universalYear: snapshot.universalYear as never,
        currentPinnacle: snapshot.currentPinnacle as never,
        challenges: snapshot.challenges as never,
        karmicLessons: snapshot.karmicLessons as never,
        maturity: snapshot.maturity as never,
        modulation: modulation as never,
        synthesis: snapshot.synthesis,
        overallEnergy: snapshot.overallEnergy,
        exercisesJson: exercises as never,
      },
    });

    // ── Upsert AreaHistoryEntry for each area ──────────────────────────────
    if (areas) {
      const areaKeys = Object.keys(areas);
      await Promise.all(
        areaKeys.map(async (area) => {
          const areaData = areas[area];
          // Find modulation for this area
          const modEntry = modulation?.find((m) => m.area === area);

          // Determine dominant pillar from pillarContribution
          const pillarContrib = areaData.pillarContribution ?? {};
          let dominantPillar: string | null = null;
          let maxLen = 0;
          for (const [pillar, text] of Object.entries(pillarContrib)) {
            if (typeof text === 'string' && text.length > maxLen) {
              maxLen = text.length;
              dominantPillar = pillar;
            }
          }

          return prisma.areaHistoryEntry.upsert({
            where: {
              userId_date_area: {
                userId: user.id,
                date: snapshotDate,
                area,
              },
            },
            update: {
              dominantFrequency: areaData.frequency ?? 'shadow',
              intensity: areaData.intensity ?? 1,
              cycleBoost: modEntry?.suggestedBoost ?? null,
              alignmentScore: modEntry?.alignmentScore ?? null,
              dominantPillar,
            },
            create: {
              userId: user.id,
              date: snapshotDate,
              area,
              dominantFrequency: areaData.frequency ?? 'shadow',
              intensity: areaData.intensity ?? 1,
              cycleBoost: modEntry?.suggestedBoost ?? null,
              alignmentScore: modEntry?.alignmentScore ?? null,
              dominantPillar,
            },
          });
        })
      );
    }

    // ── Upsert ExerciseCompletion records (not completed yet) ───────────────
    if (exercises?.length) {
      await Promise.all(
        exercises.map(async (ex) =>
          prisma.exerciseCompletion.upsert({
            where: {
              id: `${user.id}-${snapshotDate.toISOString().split('T')[0]}-${ex.id}`,
            },
            update: {},
            create: {
              id: `${user.id}-${snapshotDate.toISOString().split('T')[0]}-${ex.id}`,
              userId: user.id,
              exerciseId: ex.id,
              area: ex.area,
              title: ex.title,
              snapshotDate,
              snapshotId: savedSnapshot.id,
              completed: false,
            },
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      snapshotId: savedSnapshot.id,
      date: snapshot.currentDate,
      areasSaved: areas ? Object.keys(areas).length : 0,
      exercisesSaved: exercises?.length ?? 0,
    });
  } catch (err) {
    console.error('[cycle/snapshot] DB error:', err);
    return NextResponse.json(
      { error: 'Failed to persist cycle snapshot' },
      { status: 500 }
    );
  }
}

// GET /api/akasha/cycle/snapshot?days=30&area=vitalidadeEnergia
// Returns cycle snapshots and area history for pattern detection
export async function GET(req: NextRequest) {
  const authResult = await requireAkashaApi(req);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') ?? '30', 10);
  const area = searchParams.get('area');
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - Math.min(days, 365));

  try {
    // Fetch recent cycle snapshots
    const snapshots = await prisma.cycleSnapshot.findMany({
      where: {
        userId: user.id,
        date: { gte: fromDate },
      },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        modulation: true,
        overallEnergy: true,
        synthesis: true,
        exercisesJson: true,
      },
    });

    // Fetch area history
    const areaWhere: Record<string, unknown> = {
      userId: user.id,
      date: { gte: fromDate },
    };
    if (area) areaWhere.area = area;

    const areaHistory = await prisma.areaHistoryEntry.findMany({
      where: areaWhere,
      orderBy: { date: 'desc' },
    });

    // Fetch exercise completions
    const exercises = await prisma.exerciseCompletion.findMany({
      where: {
        userId: user.id,
        snapshotDate: { gte: fromDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      snapshots,
      areaHistory,
      exercises,
      meta: {
        userId: user.id,
        fromDate: fromDate.toISOString().split('T')[0],
        days,
        area,
      },
    });
  } catch (err) {
    console.error('[cycle/snapshot GET] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
