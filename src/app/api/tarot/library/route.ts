import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const ArcanoSchema = z.enum(['maior', 'menor']);
const TarotLibraryQuerySchema = z.object({
  arcano: ArcanoSchema.optional(),
  search: z.string().optional(),
  numero: z.coerce.number().int().min(0).max(21).optional(),
  limit: z.coerce.number().int().positive().max(78).optional(),
});
// Tarot cards complete data
const tarotCards = [

// GET /api/tarot/library - returns all cards
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const arcano = searchParams.get('arcano');
  const search = searchParams.get('search');
  const numero = searchParams.get('numero');

  let cards = tarotCards;

  // Filter by arcano (Maior/Menor)
  if (arcano) {
    cards = cards.filter(card => card.arcano.toLowerCase() === arcano.toLowerCase());
  }

  // Filter by card number
  if (numero !== null) {
    const cardNum = parseInt(numero, 10);
    if (!isNaN(cardNum)) {
      cards = cards.filter(card => card.numero === cardNum);
    }
  }

  // Search by name or keywords
  if (search) {
    const searchLower = search.toLowerCase();
    cards = cards.filter(card =>
      card.nome.toLowerCase().includes(searchLower) ||
      card.keywords.some(k => k.toLowerCase().includes(searchLower)) ||
      card.significadoUpright.toLowerCase().includes(searchLower)
    );
  }

  // Transform cards to include full data
  const result = cards.map(card => ({
    numero: card.numero,
    nome: card.nome,
    arcano: card.arcano,
    significadoUpright: card.significadoUpright,
    significadoReversed: card.significadoReversed,
    keywords: card.keywords,
  }));

  return NextResponse.json({
    cards: result,
    meta: {
      total: result.length,
      arcano: arcano || 'all',
      search: search || null,
      filters: {
        arcano: arcano || null,
        search: search || null,
        numero: numero || null,
      },
    },
  });
}