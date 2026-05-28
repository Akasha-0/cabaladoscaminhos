// ============================================================
// HABITS DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET/POST endpoints for habits management
// - Retrieve habits data
// - Create new habits
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// In-memory habits store (replace with database in production)
const habits: Array<{
  id: string;
  name: string;
  description: string;
  frequency: string;
  createdAt: string;
  updatedAt: string;
}> = [];

// GET /api/habits/data - Get all habits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const habit = habits.find((h) => h.id === id);
      if (!habit) {
        return NextResponse.json(
          { success: false, error: 'Habit not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: habit });
    }

    return NextResponse.json({ success: true, data: habits });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch habits',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/habits/data - Create a new habit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, frequency } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const habit = {
      id: `habit_${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || '',
      frequency: frequency || 'daily',
      createdAt: now,
      updatedAt: now,
    };

    habits.push(habit);

    return NextResponse.json({ success: true, data: habit }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create habit',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
