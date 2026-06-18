import { NextRequest, NextResponse } from 'next/server';
import {
  deriveExercisesFromSnapshot,
  deriveCycleModulation,
} from '@/lib/application/agents/evolutionary-agent';
import type {
  CycleExerciseSet,
  CycleModulation,
} from '@/lib/application/agents/evolutionary-agent';
import { buildCycleSnapshot } from '@/lib/application/agents/personal-cycle-engine';
import type { PersonalCycleSnapshot } from '@/lib/application/agents/personal-cycle-engine';
import { buildDailyContent } from '@/lib/application/akasha/daily-engine';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { computeDailyHexagram } from '@/lib/domain/iching';
import { prisma } from '@/lib/infrastructure/prisma';

// Cast stored JSON maps to engine types
interface AstrologyMap {
  birthDate?: string;
  lifePathNumber?: number;
  expression?: number;
  [key: string]: unknown;
}
interface KabalisticMap {
  birthDate?: string;
  lifePath?: number;
  expression?: number;
  [key: string]: unknown;
}
interface BodyMap {
  [key: string]: unknown;
}
interface OduMap {
  [key: string]: unknown;
}

// ─── Cycle snapshot UI type (mirrored in useAkashaSynthesis.ts) ──────────────

export interface CycleSnapshotUI {
  snapshot: {
    birthDate: string;
    currentDate: string;
    age: number;
    lifePath: number;
    personalDay: {
      number: number;
      energy: string;
      keywords: string[];
      action: string;
      avoid: string;
      favorable: string;
      chakra: string;
      color: string;
    };
    personalMonth: {
      number: number;
      energy: string;
      theme: string;
      focus: string;
      keywords: string[];
      opportunities: string[];
      warnings: string[];
    };
    personalYear: {
      number: number;
      theme: string;
      majorLessons: string[];
      keyAction: string;
      opportunities: string[];
      warnings: string[];
      startDate: string;
      endDate: string;
      duration: string;
    };
    universalYear: {
      year: number;
      number: number;
      theme: string;
      globalEnergy: string;
    };
    currentPinnacle: {
      number: number;
      period: string;
      theme: string;
      opportunities: string[];
      challenges: string[];
      keyQuestion: string;
    };
    karmicLessons: Array<{
      missing: number;
      description: string;
      howToLearn: string;
      lifeArea: string;
    }>;
    maturity: {
      number: number;
      year: number;
      theme: string;
      description: string;
      gifts: string[];
      challenges: string[];
    };
    synthesis: string;
    overallEnergy: number;
  };
  exercises: {
    prioritizedExercises: Array<{
      type: string;
      title: string;
      description: string;
      area: string;
      difficulty: string;
      duration: string;
      phase?: string;
    }>;
    personalDay: Array<{
      type: string;
      title: string;
      description: string;
      area: string;
      difficulty: string;
      duration: string;
    }>;
    personalMonth: Array<{
      type: string;
      title: string;
      description: string;
      area: string;
      difficulty: string;
      duration: string;
    }>;
    personalYear: Array<{
      type: string;
      title: string;
      description: string;
      area: string;
      difficulty: string;
      duration: string;
    }>;
    pinnacle: Array<{
      type: string;
      title: string;
      description: string;
      area: string;
      difficulty: string;
      duration: string;
    }>;
    karmicLessons: Array<{
      type: string;
      title: string;
      description: string;
      area: string;
      difficulty: string;
      duration: string;
    }>;
    lunar: Array<{
      type: string;
      title: string;
      description: string;
      area: string;
      difficulty: string;
      duration: string;
      phase: string;
    }>;
  };
  modulation: Array<{
    area: string;
    alignmentScore: number;
    suggestedBoost: string;
    rationale: string;
  }>;
}

function toCycleSnapshotUI(
  raw: PersonalCycleSnapshot,
  exercises: CycleExerciseSet,
  modulation: CycleModulation[]
): CycleSnapshotUI {
  return {
    snapshot: {
      birthDate: raw.birthDate,
      currentDate: raw.currentDate,
      age: raw.age,
      lifePath: raw.lifePath,
      personalDay: raw.personalDay,
      personalMonth: raw.personalMonth,
      personalYear: raw.personalYear,
      universalYear: raw.universalYear,
      currentPinnacle: raw.currentPinnacle,
      karmicLessons: raw.karmicLessons,
      maturity: raw.maturity,
      synthesis: raw.synthesis,
      overallEnergy: raw.overallEnergy,
    },
    exercises: {
      prioritizedExercises: exercises.prioritizedExercises.map((e) => ({
        type: e.type,
        title: e.title,
        description: e.instruction,
        area: e.area,
        difficulty: e.difficulty,
        duration: e.duration,
      })),
      personalDay: exercises.personalDay.map((e) => ({
        type: e.type,
        title: e.title,
        description: e.instruction,
        area: e.area,
        difficulty: e.difficulty,
        duration: e.duration,
      })),
      personalMonth: exercises.personalMonth.map((e) => ({
        type: e.type,
        title: e.title,
        description: e.instruction,
        area: e.area,
        difficulty: e.difficulty,
        duration: e.duration,
      })),
      personalYear: exercises.personalYear.map((e) => ({
        type: e.type,
        title: e.title,
        description: e.instruction,
        area: e.area,
        difficulty: e.difficulty,
        duration: e.duration,
      })),
      pinnacle: exercises.pinnacle.map((e) => ({
        type: e.type,
        title: e.title,
        description: e.instruction,
        area: e.area,
        difficulty: e.difficulty,
        duration: e.duration,
      })),
      karmicLessons: exercises.karmicLessons.map((e) => ({
        type: e.type,
        title: e.title,
        description: e.instruction,
        area: e.area,
        difficulty: e.difficulty,
        duration: e.duration,
      })),
      lunar: exercises.lunar.map((e) => ({
        type: e.type,
        title: e.title,
        description: e.instruction,
        area: e.area,
        difficulty: e.difficulty,
        duration: e.duration,
        phase: e.cycleAnchor?.lunar ? (raw.currentDate ?? '') : '',
      })),
    },
    modulation: modulation.map((m) => ({
      area: m.area,
      alignmentScore: m.alignmentScore,
      suggestedBoost: m.suggestedBoost,
      rationale: m.rationale,
    })),
  };
}

export async function GET(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id: userId } = authResult;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.dailyReading.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (existing) {
    // Cached — compute synthesis on the fly since it's not stored
    const birthChart = await prisma.birthChart.findUnique({ where: { userId } });
    if (!birthChart) return NextResponse.json({ error: 'Mapa não encontrado' }, { status: 404 });

    const content = buildDailyContent(
      birthChart.astrologyMap as AstrologyMap,
      birthChart.kabalisticMap as KabalisticMap,
      birthChart.tantricMap as BodyMap,
      birthChart.oduBirth as OduMap,
      today
    );

    // ── Cycle snapshot (always fresh — not cached) ───────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, birthDate: true },
    });
    const astroMap = birthChart.astrologyMap as AstrologyMap;
    const kabMap = birthChart.kabalisticMap as KabalisticMap;
    const rawBirthDate0 = user?.birthDate ?? kabMap?.birthDate;
    let birthDate = rawBirthDate0 ? new Date(rawBirthDate0) : today;
    if (!birthDate || Number.isNaN(birthDate.getTime())) birthDate = today;
    const lifePath = astroMap?.lifePathNumber ?? kabMap?.lifePath ?? 1;
    const expression = astroMap?.expression ?? kabMap?.expression ?? lifePath;
    const fullName = user?.name ?? '';
    const cycleSnapshot = buildCycleSnapshot(birthDate, lifePath, expression, fullName, today);
    const moonPhase = content.moonPhase ?? 'nova';
    const exercises = deriveExercisesFromSnapshot(cycleSnapshot, moonPhase);
    const modulation = deriveCycleModulation(cycleSnapshot);
    const cycle = toCycleSnapshotUI(cycleSnapshot, exercises, modulation);

    return NextResponse.json({
      date: existing.date.toISOString().split('T')[0],
      climate: existing.climate,
      ritual: existing.ritual,
      alert: existing.alert,
      tensionPoint: existing.tensionPoint,
      hexagram: existing.hexagram,
      hexagramLines: existing.hexagramLines,
      synthesis: content.synthesis ?? null,
      cycle,
    });
  }

  const birthChart = await prisma.birthChart.findUnique({
    where: { userId },
  });

  if (!birthChart) {
    return NextResponse.json({ error: 'Mapa natal não encontrado' }, { status: 404 });
  }

  const content = buildDailyContent(
    birthChart.astrologyMap as AstrologyMap,
    birthChart.kabalisticMap as KabalisticMap,
    birthChart.tantricMap as BodyMap,
    birthChart.oduBirth as OduMap,
    today
  );

  // v0.0.5 T7: hexagrama do dia (5º sistema oracular) — fallback se o
  // cronjob diário ainda não persistiu o registro (GET antes da meia-noite UTC).
  const dailyHex = computeDailyHexagram(today);

  const record = await prisma.dailyReading.create({
    data: {
      userId,
      date: today,
      climate: content.climate,
      ritual: content.ritual as object,
      alert: content.alert,
      tensionPoint: content.tensionPoint as object,
      hexagram: String(dailyHex.hexagramNumber),
      hexagramLines: dailyHex.lines as object,
    },
  });

  // ── Cycle snapshot ─────────────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, birthDate: true },
  });
  const astroMap = birthChart.astrologyMap as AstrologyMap;
  const kabMap = birthChart.kabalisticMap as KabalisticMap;
  const rawBirthDate = user?.birthDate ?? kabMap?.birthDate;
  let birthDate = rawBirthDate ? new Date(rawBirthDate) : today;
  if (!birthDate || Number.isNaN(birthDate.getTime())) {
    // Fallback to today if birthDate is missing or invalid (e.g. empty string)
    birthDate = today;
  }
  const lifePath = astroMap?.lifePathNumber ?? kabMap?.lifePath ?? 1;
  const expression = astroMap?.expression ?? kabMap?.expression ?? lifePath;
  const fullName = user?.name ?? '';
  const cycleSnapshot = buildCycleSnapshot(birthDate, lifePath, expression, fullName, today);
  const moonPhase = content.moonPhase ?? 'nova';
  const exercises = deriveExercisesFromSnapshot(cycleSnapshot, moonPhase);
  const modulation = deriveCycleModulation(cycleSnapshot);
  const cycle = toCycleSnapshotUI(cycleSnapshot, exercises, modulation);

  return NextResponse.json({
    date: record.date.toISOString().split('T')[0],
    climate: record.climate,
    ritual: record.ritual,
    alert: record.alert,
    tensionPoint: record.tensionPoint,
    hexagram: record.hexagram,
    hexagramLines: record.hexagramLines,
    /** §SYNTHESIS-F1: síntese narrativa Akasha — 6 áreas de vida + decisão diária */
    synthesis: content.synthesis ?? null,
    /** §P4: ciclo pessoal + exercícios evolutivos */
    cycle,
  });
}
