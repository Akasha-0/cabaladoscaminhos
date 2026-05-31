import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const GuidanceTypeSchema = z.enum([
  'tarot', 'numerology', 'astrology', 'cabala',
  'ifa', 'orixa', 'chakras', 'meditation', 'ritual',
]);
const GuidanceQuerySchema = z.object({
  type: GuidanceTypeSchema.optional(),
  includeDetails: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});
// ─── TYPE DEFINITIONS ───────────────────────────────────────────────────────
interface GuidanceType {
  id: string;
  name: string;
  description: string;
  icon: string;
  traditions?: string[];
  elements?: string[];
  chakras?: string[];
  sefirot?: string[];
}
// ─── GUIDANCE TYPES DATA ────────────────────────────────────────────────────
const GUIDANCE_TYPES: GuidanceType[] = [
  {
    id: 'tarot',
    name: 'Tarot',
    description: 'Guidance through tarot card readings',
    icon: 'cards',
    traditions: ['Egípcia', 'Cabalística', 'Hermética'],
    elements: ['Ar', 'Fogo', 'Água', 'Terra'],
    chakras: ['coroa', 'terceiro-olho'],
  },
  {
    id: 'numerology',
    name: 'Numerologia',
    description: 'Guidance through numerological analysis',
    icon: 'numbers',
    traditions: ['Pitagórica', 'Cabala', 'Tântrica'],
    elements: ['Número-mestre 11, 22, 33'],
    sefirot: ['Keter', 'Chokhmah', 'Binah'],
  },
  {
    id: 'astrology',
    name: 'Astrologia',
    description: 'Guidance through astrological insights',
    icon: 'stars',
    traditions: ['Ocidental', 'Védica', 'Chinesa'],
    elements: ['Fogo', 'Terra', 'Ar', 'Água'],
    chakras: ['todos'],
  },
  {
    id: 'cabala',
    name: 'Cabala',
    description: 'Guidance through kabbalistic wisdom',
    icon: 'tree',
    traditions: ['Judaica', 'Hermética', 'Cristã'],
    elements: ['Éter'],
    sefirot: ['Keter', 'Chokhmah', 'Binah', 'Daat', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkut'],
  },
  {
    id: 'ifa',
    name: 'Ifa',
    description: 'Guidance through Ifa divination',
    icon: 'oracle',
    traditions: ['Yorubá', 'Candomblé', 'Umbanda'],
    elements: ['Água', 'Fogo'],
    orixa: ['Orunmila', 'Obatalá'],
  },
  {
    id: 'orixa',
    name: 'Orixás',
    description: 'Guidance through Orixá energy',
    icon: 'orixa',
    traditions: ['Candomblé', 'Umbanda', 'Yorubá'],
    elements: ['Todos os elementos'],
    orixa: ['Oxum', 'Ogum', 'Iemanjá', 'Xangô', 'Iansã', 'Oxóssi', 'Nanã', 'Omolu', 'Obá', 'Logunede'],
  },
  {
    id: 'chakras',
    name: 'Chakras',
    description: 'Guidance through chakra healing',
    icon: 'chakra',
    traditions: ['Yoga', 'Tantra', 'Tântrica'],
    elements: ['Sete elementos'],
    chakras: ['raiz', 'sacral', 'plexo-solar', 'cardíaco', 'garanta', 'terceiro-olho', 'coroa'],
  },
  {
    id: 'meditation',
    name: 'Meditação',
    description: 'Guidance through sacred meditation',
    icon: 'lotus',
    traditions: ['Budista', 'Hindu', 'Sufi'],
    elements: ['Éter'],
    chakras: ['coroa', 'terceiro-olho'],
  },
  {
    id: 'ritual',
    name: 'Ritual',
    description: 'Guidance through spiritual rituals',
    icon: 'ritual',
    traditions: ['Mágica', 'Religiosa', 'Espiritual'],
    elements: ['Todos os elementos'],
  },
];
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = GuidanceQuerySchema.safeParse({
      type: searchParams.get('type'),
      includeDetails: searchParams.get('includeDetails'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { type, includeDetails } = parseResult.data;
    let types = [...GUIDANCE_TYPES];
    if (type) {
      types = types.filter(t => t.id === type);
    }
    return NextResponse.json({
      types: includeDetails ? types : types.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        icon: t.icon,
      })),
      count: types.length,
      totalAvailable: GUIDANCE_TYPES.length,
    });
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar tipos de orientação',
    }, { status: 500 });
  }
}