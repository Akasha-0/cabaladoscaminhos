import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const RitualTypeSchema = z.enum([
  'protection', 'abundance', 'love', 'cleansing', 'ancestral',
  'spiritual_growth', 'healing', 'chakra', 'full_moon',
  'new_moon', 'gratitude', 'seasonal'
]);
const RitualQuerySchema = z.object({
  tipo: RitualTypeSchema.optional(),
  search: z.string().optional(),
  id: z.string().optional(),
  duracao: z.string().optional(),
  element: ElementSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Ritual Type Spiritual Correlations ──────────────────────────────────────────
const RITUAL_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  protection: { sefirot: ['Gevurah', 'Malkuth'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Protejo-me com a luz divina', frequency: '174 Hz' },
  abundance: { sefirot: ['Chesed', 'Malkuth'], chakra: 2, element: 'Terra', orixa: 'Oxum', affirmation: 'A abundância flui em minha vida', frequency: '285 Hz' },
  love: { sefirot: ['Tipheret', 'Netzach'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O amor habita em meu coração', frequency: '528 Hz' },
  cleansing: { sefirot: ['Binah', 'Yesod'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'Purifico-me com águas sagradas', frequency: '639 Hz' },
  ancestral: { sefirot: ['Yesod', 'Malkuth'], chakra: 2, element: 'Água', orixa: 'Nanã', affirmation: 'Honro meus ancestrais', frequency: '285 Hz' },
  spiritual_growth: { sefirot: ['Kether', 'Chokhmah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Cresço espiritualmente a cada dia', frequency: '963 Hz' },
  healing: { sefirot: ['Chesed', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A cura flui através de mim', frequency: '528 Hz' },
  chakra: { sefirot: ['Kether', 'Malkuth'], chakra: 1, element: 'Fogo', orixa: 'Kundalini', affirmation: 'Meus chakras estão equilibrados', frequency: '396 Hz' },
  full_moon: { sefirot: ['Yesod', 'Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Na lua cheia, libero e celebro', frequency: '639 Hz' },
  new_moon: { sefirot: ['Kether', 'Binah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Na lua nova, planto intenções', frequency: '963 Hz' },
  gratitude: { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Sou grato por todas as bênçãos', frequency: '528 Hz' },
  seasonal: { sefirot: ['Chokhmah', 'Netzach'], chakra: 6, element: 'Ar', orixa: 'Oxóssi', affirmation: 'Honro os ciclos da natureza', frequency: '741 Hz' },
};

// ─── Ritual Interface ──────────────────────────────────────────────────────
interface Ritual {
  id: string;
  nome: string;
  tipo: string;
  duracao: string;
  elements: string[];
  spiritualCorrelations?: typeof RITUAL_SPIRITUAL_CORRELATIONS[string];
}

// ─── Ritual Library Data ──────────────────────────────────────────────────────────
const rituals: Ritual[] = [
  // Protection Rituals
  { id: 'prot-001', nome: 'Shield of Light', tipo: 'protection', duracao: '15 min', elements: ['luz', 'fogo'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.protection },
  { id: 'prot-002', nome: 'Guardian Circle', tipo: 'protection', duracao: '20 min', elements: ['terra', 'éter'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.protection },
  { id: 'prot-003', nome: 'Divine Armor', tipo: 'protection', duracao: '10 min', elements: ['fogo', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.protection },
  { id: 'prot-004', nome: 'Sacred Boundary', tipo: 'protection', duracao: '25 min', elements: ['agua', 'terra'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.protection },
  { id: 'prot-005', nome: 'Aurora Protection', tipo: 'protection', duracao: '30 min', elements: ['luz', 'agua'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.protection },
  { id: 'prot-006', nome: 'Spiritual Shield', tipo: 'protection', duracao: '15 min', elements: ['éter', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.protection },
  { id: 'prot-007', nome: 'Cosmic Armor', tipo: 'protection', duracao: '20 min', elements: ['fogo', 'éter'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.protection },
  { id: 'prot-008', nome: 'Heavenly Barrier', tipo: 'protection', duracao: '10 min', elements: ['luz', 'fogo'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.protection },
  { id: 'prot-009', nome: 'Ethereal Shield', tipo: 'protection', duracao: '15 min', elements: ['éter', 'agua'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.protection },
  { id: 'prot-010', nome: 'Light Warriors', tipo: 'protection', duracao: '30 min', elements: ['luz', 'fogo'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.protection },
  // Abundance Rituals
  { id: 'abund-001', nome: 'Abundance Flow', tipo: 'abundance', duracao: '20 min', elements: ['terra', 'agua'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.abundance },
  { id: 'abund-002', nome: 'Prosperity Altar', tipo: 'abundance', duracao: '15 min', elements: ['terra', 'fogo'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.abundance },
  { id: 'abund-003', nome: 'Manifestation Ritual', tipo: 'abundance', duracao: '30 min', elements: ['fogo', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.abundance },
  { id: 'abund-004', nome: 'Wealth Attraction', tipo: 'abundance', duracao: '25 min', elements: ['terra', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.abundance },
  { id: 'abund-005', nome: 'Success Gateway', tipo: 'abundance', duracao: '20 min', elements: ['fogo', 'terra'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.abundance },
  { id: 'abund-006', nome: 'Prosperity Stream', tipo: 'abundance', duracao: '15 min', elements: ['agua', 'terra'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.abundance },
  { id: 'abund-007', nome: 'Abundance Castle', tipo: 'abundance', duracao: '30 min', elements: ['terra', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.abundance },
  { id: 'abund-008', nome: 'Wealth Crystal', tipo: 'abundance', duracao: '25 min', elements: ['crystal', 'terra'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.abundance },
  { id: 'abund-009', nome: 'Money Tree', tipo: 'abundance', duracao: '20 min', elements: ['terra', 'agua'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.abundance },
  { id: 'abund-010', nome: 'Golden Light', tipo: 'abundance', duracao: '15 min', elements: ['luz', 'fogo'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.abundance },
  // Love Rituals
  { id: 'love-001', nome: 'Heart Chakra Opening', tipo: 'love', duracao: '20 min', elements: ['agua', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.love },
  { id: 'love-002', nome: 'Soulmate Attraction', tipo: 'love', duracao: '25 min', elements: ['fogo', 'agua'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.love },
  { id: 'love-003', nome: 'Sacred Union', tipo: 'love', duracao: '30 min', elements: ['fogo', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.love },
  { id: 'love-004', nome: 'Self-Love Ritual', tipo: 'love', duracao: '15 min', elements: ['agua', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.love },
  { id: 'love-005', nome: 'Relationship Healing', tipo: 'love', duracao: '20 min', elements: ['agua', 'éter'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.love },
  { id: 'love-006', nome: 'Love Enchantment', tipo: 'love', duracao: '25 min', elements: ['fogo', 'agua'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.love },
  { id: 'love-007', nome: 'Heart Opening', tipo: 'love', duracao: '15 min', elements: ['luz', 'agua'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.love },
  { id: 'love-008', nome: 'Soul Connection', tipo: 'love', duracao: '30 min', elements: ['fogo', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.love },
  { id: 'love-009', nome: 'Love Magnet', tipo: 'love', duracao: '20 min', elements: ['fogo', 'agua'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.love },
  { id: 'love-010', nome: 'Divine Love', tipo: 'love', duracao: '25 min', elements: ['luz', 'fogo'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.love },
  // Cleansing Rituals
  { id: 'clean-001', nome: 'Smudge Ceremony', tipo: 'cleansing', duracao: '15 min', elements: ['fogo', 'éter'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.cleansing },
  { id: 'clean-002', nome: 'Salt Circle', tipo: 'cleansing', duracao: '20 min', elements: ['terra', 'agua'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.cleansing },
  { id: 'clean-003', nome: 'White Light Purification', tipo: 'cleansing', duracao: '10 min', elements: ['luz', 'éter'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.cleansing },
  { id: 'clean-004', nome: 'Sacred Water Bath', tipo: 'cleansing', duracao: '25 min', elements: ['agua', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.cleansing },
  { id: 'clean-005', nome: 'Aura Cleansing', tipo: 'cleansing', duracao: '20 min', elements: ['luz', 'éter'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.cleansing },
  { id: 'clean-006', nome: 'Smoke Purification', tipo: 'cleansing', duracao: '15 min', elements: ['fogo', 'éter'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.cleansing },
  { id: 'clean-007', nome: 'Salt Bath', tipo: 'cleansing', duracao: '25 min', elements: ['agua', 'terra'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.cleansing },
  { id: 'clean-008', nome: 'Light Cleansing', tipo: 'cleansing', duracao: '10 min', elements: ['luz', 'agua'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.cleansing },
  { id: 'clean-009', nome: 'Spiritual Bath', tipo: 'cleansing', duracao: '30 min', elements: ['agua', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.cleansing },
  { id: 'clean-010', nome: 'Energy Clearing', tipo: 'cleansing', duracao: '20 min', elements: ['éter', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.cleansing },
  // Ancestral Rituals
  { id: 'ancestral-001', nome: 'Ancestral Connection', tipo: 'ancestral', duracao: '30 min', elements: ['agua', 'terra'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.ancestral },
  { id: 'ancestral-002', nome: 'Offerings to Ancestors', tipo: 'ancestral', duracao: '25 min', elements: ['agua', 'fogo'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.ancestral },
  { id: 'ancestral-003', nome: 'Bloodline Healing', tipo: 'ancestral', duracao: '40 min', elements: ['agua', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.ancestral },
  { id: 'ancestral-004', nome: 'Ancestral Wisdom', tipo: 'ancestral', duracao: '35 min', elements: ['éter', 'agua'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.ancestral },
  { id: 'ancestral-005', nome: 'Spirit Guide Connection', tipo: 'ancestral', duracao: '30 min', elements: ['luz', 'éter'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.ancestral },
  // Healing Rituals
  { id: 'healing-001', nome: 'Chakra Healing', tipo: 'healing', duracao: '30 min', elements: ['fogo', 'agua'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.healing },
  { id: 'healing-002', nome: 'Crystal Healing', tipo: 'healing', duracao: '45 min', elements: ['éter', 'terra'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.healing },
  { id: 'healing-003', nome: 'Reiki Session', tipo: 'healing', duracao: '60 min', elements: ['luz', 'éter'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.healing },
  { id: 'healing-004', nome: 'Sound Healing', tipo: 'healing', duracao: '40 min', elements: ['ar', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.healing },
  { id: 'healing-005', nome: 'Flower Remedy', tipo: 'healing', duracao: '20 min', elements: ['agua', 'fogo'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.healing },
  // Full Moon Rituals
  { id: 'fullmoon-001', nome: 'Full Moon Charging', tipo: 'full_moon', duracao: '25 min', elements: ['luz', 'agua'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.full_moon },
  { id: 'fullmoon-002', nome: 'Full Moon Release', tipo: 'full_moon', duracao: '30 min', elements: ['fogo', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.full_moon },
  { id: 'fullmoon-003', nome: 'Full Moon Gratitude', tipo: 'full_moon', duracao: '20 min', elements: ['luz', 'terra'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.full_moon },
  // New Moon Rituals
  { id: 'newmoon-001', nome: 'New Moon Intention', tipo: 'new_moon', duracao: '25 min', elements: ['éter', 'luz'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.new_moon },
  { id: 'newmoon-002', nome: 'New Moon Manifestation', tipo: 'new_moon', duracao: '30 min', elements: ['fogo', 'éter'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.new_moon },
  { id: 'newmoon-003', nome: 'New Moon Planting', tipo: 'new_moon', duracao: '20 min', elements: ['terra', 'agua'], spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS.new_moon },
];

// ─── Orixá Ritual Mapping ──────────────────────────────────────────────────────────
const ORIXA_RITUALS: Record<string, string[]> = {
  'Ogum': rituals.filter(r => r.tipo === 'protection').map(r => r.id),
  'Oxum': rituals.filter(r => r.tipo === 'abundance' || r.tipo === 'love').map(r => r.id),
  'Iemanjá': rituals.filter(r => r.tipo === 'cleansing' || r.tipo === 'full_moon').map(r => r.id),
  'Oxalá': rituals.filter(r => r.tipo === 'new_moon' || r.tipo === 'spiritual_growth').map(r => r.id),
  'Xangô': rituals.filter(r => r.tipo === 'healing').map(r => r.id),
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = RitualQuerySchema.safeParse({
      tipo: searchParams.get('tipo'),
      search: searchParams.get('search'),
      id: searchParams.get('id'),
      duracao: searchParams.get('duracao'),
      element: searchParams.get('element'),
      limit: searchParams.get('limit'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { tipo, search, id, duracao, element, limit, sefirot, chakra, orixa } = parseResult.data;

    let result = [...rituals];

    // Filter by type
    if (tipo) {
      result = result.filter(r => r.tipo === tipo);
    }

    // Filter by ID
    if (id) {
      result = result.filter(r => r.id === id);
    }

    // Search by name
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(r => r.nome.toLowerCase().includes(searchLower));
    }

    // Filter by duration
    if (duracao) {
      result = result.filter(r => r.duracao.includes(duracao));
    }

    // Filter by element
    if (element) {
      result = result.filter(r => r.elements.includes(element.toLowerCase()));
    }

    // Filter by spiritual correlations
    if (sefirot) {
      result = result.filter(r => r.spiritualCorrelations?.sefirot.includes(sefirot));
    }
    if (chakra) {
      result = result.filter(r => r.spiritualCorrelations?.chakra === chakra);
    }
    if (orixa) {
      result = result.filter(r => r.spiritualCorrelations?.orixa === orixa);
    }

    // Apply limit
    if (limit && limit < result.length) {
      result = result.slice(0, limit);
    }

    // Statistics
    const stats = {
      byType: rituals.reduce((acc, r) => {
        acc[r.tipo] = (acc[r.tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: result.reduce((acc, r) => {
        r.elements.forEach(el => {
          acc[el] = (acc[el] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      bySefirot: Object.values(RITUAL_SPIRITUAL_CORRELATIONS).reduce((acc, corr) => {
        corr.sefirot.forEach(sf => {
          acc[sf] = (acc[sf] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byOrixa: Object.values(RITUAL_SPIRITUAL_CORRELATIONS).reduce((acc, corr) => {
        acc[corr.orixa] = (acc[corr.orixa] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      rituals: result,
      count: result.length,
      total: rituals.length,
      meta: {
        filters: { tipo, search, id, duracao, element, limit, sefirot, chakra, orixa },
      },
      stats,
      spiritualCorrelations: RITUAL_SPIRITUAL_CORRELATIONS,
      orixaRituals: ORIXA_RITUALS,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}