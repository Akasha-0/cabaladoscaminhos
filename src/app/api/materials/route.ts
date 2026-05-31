import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const MaterialTypeSchema = z.enum([
  'elemental', 'essence', 'crystal', 'herb', 'ritual', 'symbolic', 'offering'
]);
const RaritySchema = z.enum([
  'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'
]);
const MaterialQuerySchema = z.object({
  type: MaterialTypeSchema.optional(),
  rarity: RaritySchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Material Spiritual Correlations ──────────────────────────────────────────
const MATERIAL_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'Aether': { sefirot: ['Kether', 'Binah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'O éter conecta todos os elementos', frequency: '963 Hz' },
  'Spirit Dust': { sefirot: ['Chokhmah', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'O pó espiritual limpa a consciência', frequency: '639 Hz' },
  'Celestial Shard': { sefirot: ['Tipheret', 'Netzach'], chakra: 5, element: 'Fogo', orixa: 'Xangô', affirmation: 'O fragmento celestial traz luz', frequency: '528 Hz' },
  'Sacred Herbs': { sefirot: ['Chesed', 'Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'As ervas sagradas curam e protegem', frequency: '396 Hz' },
  'Ritual Water': { sefirot: ['Binah', 'Yesod'], chakra: 2, element: 'Água', orixa: 'Oxum', affirmation: 'A água ritual lava impurezas', frequency: '639 Hz' },
};

// ─── TYPE DEFINITIONS ──────────────────────────────────────────────────────
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
  spiritualCorrelations?: typeof MATERIAL_SPIRITUAL_CORRELATIONS[string];
}

// ─── Extended Material Data ──────────────────────────────────────────────────────────
const MATERIALS: Material[] = [
  { id: '1', name: 'Aether', type: 'elemental', rarity: 'legendary', properties: { element: 'eter' }, description: 'Quintessência espiritual', spiritualCorrelations: MATERIAL_SPIRITUAL_CORRELATIONS['Aether'] },
  { id: '2', name: 'Spirit Dust', type: 'essence', rarity: 'rare', properties: { chakra: ['coroa', 'terceiro-olho'] }, description: 'Pó de essência espiritual', spiritualCorrelations: MATERIAL_SPIRITUAL_CORRELATIONS['Spirit Dust'] },
  { id: '3', name: 'Celestial Shard', type: 'crystal', rarity: 'epic', properties: { element: 'luz' }, description: 'Fragmento celestial', spiritualCorrelations: MATERIAL_SPIRITUAL_CORRELATIONS['Celestial Shard'] },
  { id: '4', name: 'Sacred Herbs', type: 'herb', rarity: 'common', properties: { orixa: ['Oxum', 'Iemanjá'] }, description: 'Ervas sagradas', spiritualCorrelations: MATERIAL_SPIRITUAL_CORRELATIONS['Sacred Herbs'] },
  { id: '5', name: 'Ritual Water', type: 'ritual', rarity: 'uncommon', properties: { element: 'agua', orixa: ['Oxum'] }, description: 'Água ritualística', spiritualCorrelations: MATERIAL_SPIRITUAL_CORRELATIONS['Ritual Water'] },
  { id: '6', name: 'Obsidiana', type: 'crystal', rarity: 'epic', properties: { element: 'terra' }, description: 'Pedra de proteção ancestral', spiritualCorrelations: { sefirot: ['Malkuth', 'Gevurah'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'A obsidiana protege contra negatividades', frequency: '174 Hz' } },
  { id: '7', name: 'Salvio', type: 'herb', rarity: 'common', properties: { element: 'fogo' }, description: 'Erva de purificação e sabedoria', spiritualCorrelations: { sefirot: ['Hod', 'Netzach'], chakra: 5, element: 'Fogo', orixa: 'Oxalá', affirmation: 'O salvio purifica meu espaço', frequency: '741 Hz' } },
  { id: '8', name: 'Incenso de Palo Santo', type: 'ritual', rarity: 'rare', properties: { element: 'ar' }, description: 'Fumação sagrada para limpeza energética', spiritualCorrelations: { sefirot: ['Chokhmah', 'Kether'], chakra: 7, element: 'Ar', orixa: 'Oxalá', affirmation: 'O palo santo eleva minha vibração', frequency: '852 Hz' } },
  { id: '9', name: 'Cristal de Quartzo', type: 'crystal', rarity: 'uncommon', properties: { element: 'eter' }, description: 'Amplificador de energia espiritual', spiritualCorrelations: { sefirot: ['Kether', 'Binah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'O quartzo amplifica minha intenção', frequency: '963 Hz' } },
  { id: '10', name: 'Mel de Oxum', type: 'offering', rarity: 'legendary', properties: { element: 'agua', orixa: ['Oxum'] }, description: 'Oferta sagrada para Oxum', spiritualCorrelations: { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Água', orixa: 'Oxum', affirmation: 'O mel atrai prosperidade e amor', frequency: '528 Hz' } },
  { id: '11', name: 'Ferrro de Ogum', type: 'symbolic', rarity: 'epic', properties: { element: 'terra', orixa: ['Ogum'] }, description: 'Ferramenta ritual de Ogum', spiritualCorrelations: { sefirot: ['Malkuth', 'Gevurah'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'O ferro abre todos os caminhos', frequency: '174 Hz' } },
  { id: '12', name: 'Vela Branca', type: 'ritual', rarity: 'common', properties: { element: 'fogo', orixa: ['Oxalá'] }, description: 'Vela de paz e proteção', spiritualCorrelations: { sefirot: ['Kether', 'Tipheret'], chakra: 7, element: 'Fogo', orixa: 'Oxalá', affirmation: 'A vela branca ilumina meu caminho', frequency: '963 Hz' } },
];

// ─── Orixá Materials Mapping ──────────────────────────────────────────────────────────
const ORIXA_MATERIALS: Record<string, string[]> = {
  'Oxalá': ['1', '8', '9', '12'], // Aether, Incenso, Quartzo, Vela Branca
  'Ogum': ['6', '11'], // Obsidiana, Ferro
  'Oxum': ['4', '5', '10'], // Sacred Herbs, Ritual Water, Mel
  'Iemanjá': ['2', '4', '5'], // Spirit Dust, Herbs, Water
  'Xangô': ['3', '7'], // Celestial Shard, Salvio
};

// ─── Element Materials Mapping ──────────────────────────────────────────────────────────
const ELEMENT_MATERIALS: Record<string, string[]> = {
  'Fogo': ['3', '7', '12'], // Celestial Shard, Salvio, Vela
  'Água': ['2', '5', '10'], // Spirit Dust, Water, Mel
  'Terra': ['6', '11'], // Obsidiana, Ferro
  'Ar': ['8', '9'], // Incenso, Quartzo
  'Éter': ['1', '9'], // Aether, Quartzo
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams();
    const parseResult = MaterialQuerySchema.safeParse({
      type: searchParams.get('type'),
      rarity: searchParams.get('rarity'),
      limit: searchParams.get('limit'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, rarity, limit, sefirot, chakra, element, orixa } = parseResult.data;

    let materials = [...MATERIALS];

    // Filter by type
    if (type) {
      materials = materials.filter(m => m.type === type);
    }

    // Filter by rarity
    if (rarity) {
      materials = materials.filter(m => m.rarity === rarity);
    }

    // Filter by spiritual correlations
    if (sefirot) {
      materials = materials.filter(m => m.spiritualCorrelations?.sefirot.includes(sefirot));
    }
    if (chakra) {
      materials = materials.filter(m => m.spiritualCorrelations?.chakra === chakra);
    }
    if (element) {
      materials = materials.filter(m => m.spiritualCorrelations?.element === element);
    }
    if (orixa) {
      materials = materials.filter(m => m.spiritualCorrelations?.orixa === orixa);
    }

    // Apply limit
    if (limit && limit < materials.length) {
      materials = materials.slice(0, limit);
    }

    // Statistics
    const stats = {
      byType: materials.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byRarity: materials.reduce((acc, m) => {
        acc[m.rarity] = (acc[m.rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: materials.reduce((acc, m) => {
        const el = m.spiritualCorrelations?.element || 'Unknown';
        acc[el] = (acc[el] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byChakra: materials.reduce((acc, m) => {
        const ch = m.spiritualCorrelations?.chakra || 0;
        if (ch) acc[ch] = (acc[ch] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      byOrixa: materials.reduce((acc, m) => {
        const ox = m.spiritualCorrelations?.orixa || 'Unknown';
        acc[ox] = (acc[ox] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      materials,
      count: materials.length,
      totalAvailable: MATERIALS.length,
      meta: {
        filters: { type, rarity, sefirot, chakra, element, orixa },
      },
      stats,
      orixaMaterials: ORIXA_MATERIALS,
      elementMaterials: ELEMENT_MATERIALS,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}

// POST handler for adding custom materials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, rarity, element, chakra, orixa, description } = body;

    if (!name || !type) {
      return NextResponse.json({ success: false, error: 'Nome e tipo requeridos' }, { status: 400 });
    }

    const newMaterial: Material = {
      id: `custom-${Date.now()}`,
      name,
      type,
      rarity: rarity || 'common',
      properties: { element, chakra: chakra ? [chakra] : undefined },
      description: description || '',
      spiritualCorrelations: {
        sefirot: sefirot ? [sefirot] : ['Malkuth'],
        chakra: chakra || 1,
        element: element || 'Terra',
        orixa: orixa || 'Ogum',
        affirmation: `O material ${name} serve ao meu propósito espiritual`,
        frequency: '432 Hz',
      },
    };

    return NextResponse.json({
      success: true,
      material: newMaterial,
      message: 'Material adicionado com sucesso',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}