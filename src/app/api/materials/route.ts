import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const MaterialTypeSchema = z.enum([
  'elemental',
  'essence',
  'crystal',
  'herb',
  'ritual',
  'symbolic',
  'offering',
]);
const RaritySchema = z.enum([
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
]);
const MaterialQuerySchema = z.object({
  type: MaterialTypeSchema.optional(),
  rarity: RaritySchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
// ─── TYPE DEFINITIONS ───────────────────────────────────────────────────────
interface Material {
  id: string;
  name: string;
  type: string;
  rarity: string;
  properties?: {
    element?: string;
    chakra?: string[];
    orixa?: string[];
    sefirah?: string;
  };
  description?: string;
}
// ─── MATERIAL DATA ──────────────────────────────────────────────────────────
const MATERIALS: Material[] = [
  { id: '1', name: 'Aether', type: 'elemental', rarity: 'legendary', properties: { element: 'eter' }, description: 'Quintessência espiritual' },
  { id: '2', name: 'Spirit Dust', type: 'essence', rarity: 'rare', properties: { chakra: ['coroa', 'terceiro-olho'] }, description: 'Pó de essência espiritual' },
  { id: '3', name: 'Celestial Shard', type: 'crystal', rarity: 'epic', properties: { element: 'luz' }, description: 'Fragmento celestial' },
  { id: '4', name: 'Sacred Herbs', type: 'herb', rarity: 'common', properties: { orixa: ['Oxum', 'Iemanjá'] }, description: 'Ervas sagradas' },
  { id: '5', name: 'Ritual Water', type: 'ritual', rarity: 'uncommon', properties: { element: 'agua', orixa: ['Oxum'] }, description: 'Água ritualística' },
];
// GET /api/materials - List all materials
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = MaterialQuerySchema.safeParse({
      type: searchParams.get('type'),
      rarity: searchParams.get('rarity'),
      limit: searchParams.get('limit'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { type, rarity, limit } = parseResult.data;
    let materials = [...MATERIALS];
    if (type) {
      materials = materials.filter(m => m.type === type);
    }
    if (rarity) {
      materials = materials.filter(m => m.rarity === rarity);
    }
    if (limit) {
      materials = materials.slice(0, limit);
    }
    return NextResponse.json({
      materials,
      count: materials.length,
      totalAvailable: MATERIALS.length,
    });
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar materiais',
    }, { status: 500 });
  }
}