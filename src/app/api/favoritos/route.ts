import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const FavoritoTipoSchema = z.enum(['affirmation', 'ritual', 'tarot', 'numerologia']);
const FavoritoSchema = z.object({
  id: z.string(),
  tipo: FavoritoTipoSchema,
  itemId: z.string(),
  createdAt: z.string(),
});
const CreateFavoritoSchema = z.object({
  tipo: FavoritoTipoSchema,
  itemId: z.string().min(1, 'itemId é obrigatório'),
});
const DeleteFavoritoSchema = z.object({
  id: z.string().min(1, 'id é obrigatório'),
});
type FavoritoTipo = z.infer<typeof FavoritoTipoSchema>;
export type Favorito = z.infer<typeof FavoritoSchema>;
const favoritos: Map<string, Favorito> = new Map();
function generateId(): string {
  return `fav_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

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