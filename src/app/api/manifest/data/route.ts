// ============================================================
// MANIFEST DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET/POST endpoints for manifestation data
// - Retrieve all manifestation entries
// - Create new manifestation entry
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface ManifestEntry {
  id: string;
  intention: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'achieved' | 'archived';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
}

// In-memory store for demonstration (replace with database in production)
const manifestStore: ManifestEntry[] = [
  {
    id: '1',
    intention: 'Find inner peace and clarity',
    category: 'spiritual',
    priority: 'high',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['peace', 'clarity'],
  },
  {
    id: '2',
    intention: 'Manifest abundance in all forms',
    category: 'material',
    priority: 'medium',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['abundance', 'prosperity'],
  },
  {
    id: '3',
    intention: 'Strengthen relationships',
    category: 'relationships',
    priority: 'medium',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['love', 'connection'],
  },
];

// GET /api/manifest/data - Get all or filtered manifestation entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ManifestEntry['status'] | null;
    const category = searchParams.get('category');
    const id = searchParams.get('id');

    // Single entry by ID
    if (id) {
      const entry = manifestStore.find((e) => e.id === id);
      if (!entry) {
        return NextResponse.json(
          { success: false, error: 'Manifest entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: entry });
    }

    // Filter by status
    if (status) {
      const validStatuses: ManifestEntry['status'][] = ['active', 'achieved', 'archived'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status provided' },
          { status: 400 }
        );
      }
      const filtered = manifestStore.filter((e) => e.status === status);
      return NextResponse.json({ success: true, data: filtered });
    }

    // Filter by category
    if (category) {
      const filtered = manifestStore.filter((e) => e.category === category);
      return NextResponse.json({ success: true, data: filtered });
    }

    // Return all
    return NextResponse.json({ success: true, data: manifestStore });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch manifestation data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/manifest/data - Create new manifestation entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { intention, category, priority, notes, tags } = body;

    // Validate required fields
    if (!intention || typeof intention !== 'string' || intention.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Intention is required' },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }

    // Validate priority if provided
    if (priority) {
      const validPriorities: ManifestEntry['priority'][] = ['high', 'medium', 'low'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { success: false, error: 'Invalid priority. Must be: high, medium, or low' },
          { status: 400 }
        );
      }
    }

    // Create new entry
    const newEntry: ManifestEntry = {
      id: Date.now().toString(),
      intention: intention.trim(),
      category,
      priority: priority || 'medium',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: notes?.trim() || undefined,
      tags: tags || [],
    };

    manifestStore.push(newEntry);

    return NextResponse.json(
      { success: true, data: newEntry },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create manifestation entry',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}