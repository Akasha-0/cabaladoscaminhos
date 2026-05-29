// ============================================================
// MANIFESTO DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for manifesto data access
// - Retrieve user manifesto entries
// - Get manifesto statistics
// - Access manifesto history
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface ManifestoEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  author?: string;
  tags?: string[];
}

interface ManifestoData {
  entries: ManifestoEntry[];
  total: number;
  activeCount: number;
  completedCount: number;
}

// GET /api/manifesto/data - Get manifesto data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Demo data - replace with database queries in production
    const allEntries: ManifestoEntry[] = [
      {
        id: '1',
        title: 'Caminho da Transformação',
        description: 'Documentar a jornada de desenvolvimento pessoal e espiritual.',
        category: 'spiritual',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'user-1',
        tags: ['transformacao', 'espiritual'],
      },
      {
        id: '2',
        title: 'Princípios de Harmonia',
        description: 'Estabelecer diretrizes para equilíbrio interior.',
        category: 'personal',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'user-1',
        tags: ['harmonia', 'equilibrio'],
      },
      {
        id: '3',
        title: 'Visão de Futuro',
        description: 'Alinhar objetivos de vida com propósito maior.',
        category: 'vision',
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'user-1',
        tags: ['visao', 'proposito'],
      },
    ];

    // Apply filters if provided
    let filteredEntries = allEntries;
    if (status) {
      filteredEntries = filteredEntries.filter((e) => e.status === status);
    }
    if (category) {
      filteredEntries = filteredEntries.filter((e) => e.category === category);
    }

    const responseData: ManifestoData = {
      entries: filteredEntries,
      total: filteredEntries.length,
      activeCount: allEntries.filter((e) => e.status === 'active').length,
      completedCount: allEntries.filter((e) => e.status === 'completed').length,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}