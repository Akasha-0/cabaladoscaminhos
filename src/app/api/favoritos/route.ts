import { NextRequest, NextResponse } from 'next/server';

export type FavoritoTipo = 'affirmation' | 'ritual' | 'tarot' | 'numerologia';

export interface Favorito {
  id: string;
  tipo: FavoritoTipo;
  itemId: string;
  createdAt: string;
}

const favoritos: Map<string, Favorito> = new Map();

function generateId(): string {
  return `fav_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function GET() {
  return NextResponse.json(Array.from(favoritos.values()));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, itemId } = body as { tipo: FavoritoTipo; itemId: string };

    if (!tipo || !itemId) {
      return NextResponse.json({ error: 'tipo and itemId are required' }, { status: 400 });
    }

    const validTipos: FavoritoTipo[] = ['affirmation', 'ritual', 'tarot', 'numerologia'];
    if (!validTipos.includes(tipo)) {
      return NextResponse.json({ error: `tipo must be one of: ${validTipos.join(', ')}` }, { status: 400 });
    }

    const existing = Array.from(favoritos.values()).find(
      f => f.tipo === tipo && f.itemId === itemId
    );
    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const favorito: Favorito = {
      id: generateId(),
      tipo,
      itemId,
      createdAt: new Date().toISOString(),
    };

    favoritos.set(favorito.id, favorito);
    return NextResponse.json(favorito, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body as { id: string };

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    if (!favoritos.has(id)) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
    }

    favoritos.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}