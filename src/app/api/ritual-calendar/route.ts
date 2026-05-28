// ============================================================
// RITUAL CALENDAR API - CABALA DOS CAMINHOS
// ============================================================
// GET/POST endpoints for ritual calendar management
// - Ritual scheduling and tracking
// - Personal ritual history
// - Sacred date reminders
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface RitualEntry {
  id: string;
  userId?: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  duration?: number; // minutes
  type: 'new-moon' | 'full-moon' | 'solstice' | 'equinox' | 'personal' | 'orixa' | 'cleansing' | 'gratitude';
  orixa?: string;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'ether';
  intentions: string[];
  completed: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface RitualCalendarResponse {
  rituals: RitualEntry[];
  upcomingRituals: RitualEntry[];
  pastRituals: RitualEntry[];
  totalCount: number;
}

interface CreateRitualInput {
  title: string;
  description?: string;
  date: string;
  time?: string;
  duration?: number;
  type: RitualEntry['type'];
  orixa?: string;
  element?: RitualEntry['element'];
  intentions: string[];
}

interface UpdateRitualInput {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  duration?: number;
  type?: RitualEntry['type'];
  orixa?: string;
  element?: RitualEntry['element'];
  intentions?: string[];
  completed?: boolean;
  notes?: string;
}

// In-memory storage for demo (replace with DB in production)
const ritualStorage = new Map<string, RitualEntry>();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateId(): string {
  return `ritual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function validateRitualInput(input: CreateRitualInput): { valid: boolean; error?: string } {
  if (!input.title || input.title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { valid: false, error: 'Valid date (YYYY-MM-DD) is required' };
  }
  if (!input.type) {
    return { valid: false, error: 'Ritual type is required' };
  }
  if (!Array.isArray(input.intentions)) {
    return { valid: false, error: 'Intentions must be an array' };
  }
  return { valid: true };
}

function sortRitualsByDate(rituals: RitualEntry[], ascending = true): RitualEntry[] {
  return [...rituals].sort((a, b) => {
    const comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    return ascending ? comparison : -comparison;
  });
}

function getRitualsByDateRange(rituals: RitualEntry[], startDate: string, endDate: string): RitualEntry[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return rituals.filter(r => {
    const ritualDate = new Date(r.date).getTime();
    return ritualDate >= start && ritualDate <= end;
  });
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const type = searchParams.get('type') || undefined;
    const orixa = searchParams.get('orixa') || undefined;
    const completed = searchParams.get('completed');
    const upcoming = searchParams.get('upcoming') === 'true';

    let rituals = Array.from(ritualStorage.values());

    // Filter by date range
    if (startDate && endDate) {
      rituals = getRitualsByDateRange(rituals, startDate, endDate);
    }

    // Filter by type
    if (type) {
      rituals = rituals.filter(r => r.type === type);
    }

    // Filter by orixa
    if (orixa) {
      rituals = rituals.filter(r => r.orixa === orixa);
    }

    // Filter by completion status
    if (completed !== null) {
      const isCompleted = completed === 'true';
      rituals = rituals.filter(r => r.completed === isCompleted);
    }

    // Sort by date
    rituals = sortRitualsByDate(rituals);

    const now = new Date().toISOString().split('T')[0];
    const upcomingRituals = rituals.filter(r => r.date >= now && !r.completed);
    const pastRituals = rituals.filter(r => r.date < now);

    const response: RitualCalendarResponse = {
      rituals,
      upcomingRituals: upcoming ? upcomingRituals.slice(0, 10) : [],
      pastRituals: upcoming ? pastRituals.slice(-10).reverse() : [],
      totalCount: rituals.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateRitualInput = await request.json();

    // Validate input
    const validation = validateRitualInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const id = generateId();

    const newRitual: RitualEntry = {
      id,
      title: body.title.trim(),
      description: body.description?.trim() || '',
      date: body.date,
      time: body.time,
      duration: body.duration,
      type: body.type,
      orixa: body.orixa,
      element: body.element,
      intentions: body.intentions,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    ritualStorage.set(id, newRitual);

    return NextResponse.json(newRitual, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Ritual ID is required' },
        { status: 400 }
      );
    }

    const existing = ritualStorage.get(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Ritual not found' },
        { status: 404 }
      );
    }

    const updates: Partial<UpdateRitualInput> = await request.json();
    const updated: RitualEntry = {
      ...existing,
      title: updates.title?.trim() ?? existing.title,
      description: updates.description?.trim() ?? existing.description,
      date: updates.date ?? existing.date,
      time: updates.time ?? existing.time,
      duration: updates.duration ?? existing.duration,
      type: updates.type ?? existing.type,
      orixa: updates.orixa ?? existing.orixa,
      element: updates.element ?? existing.element,
      intentions: updates.intentions ?? existing.intentions,
      completed: updates.completed ?? existing.completed,
      notes: updates.notes ?? existing.notes,
      updatedAt: new Date().toISOString(),
    };

    ritualStorage.set(id, updated);

    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Ritual ID is required' },
        { status: 400 }
      );
    }

    if (!ritualStorage.has(id)) {
      return NextResponse.json(
        { error: 'Ritual not found' },
        { status: 404 }
      );
    }

    ritualStorage.delete(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}