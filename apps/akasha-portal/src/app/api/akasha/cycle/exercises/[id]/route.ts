import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAkashaApi(req);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Exercise id is required' }, { status: 400 });
  }

  try {
    // Mark the exercise as completed
    const updated = await prisma.exerciseCompletion.updateMany({
      where: {
        id,
        userId: user.id, // security: only own exercises
      },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id, completed: true });
  } catch (err) {
    console.error('[cycle/exercises PATCH] error:', err);
    return NextResponse.json(
      { error: 'Failed to mark exercise complete' },
      { status: 500 }
    );
  }
}

// GET: retrieve completions for a user (optionally filtered by area / date)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAkashaApi(req);
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  // For GET /exercises/[id] — return one record
  const { id } = await params;

  try {
    const record = await prisma.exerciseCompletion.findFirst({
      where: { id, userId: user.id },
    });

    if (!record) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: record.id,
      exerciseId: record.exerciseId,
      area: record.area,
      title: record.title,
      completed: record.completed,
      completedAt: record.completedAt,
      snapshotDate: record.snapshotDate,
    });
  } catch (err) {
    console.error('[cycle/exercises GET] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
