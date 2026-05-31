import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calcularTrânsitosAtivos } from '@/lib/astrologia/trânsitos/calculator';
import { calcularMapaNatal } from '@/lib/astrologia/planetas/posicoes';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const TransitosQuerySchema = z.object({
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  horaNascimento: z.string().regex(/^\d{2}:\d{2}$/, 'Formato: HH:MM').optional().default('12:00'),
  latitude: z.string().regex(/^-?\d+\.?\d*$/, 'Latitude inválida'),
  longitude: z.string().regex(/^-?\d+\.?\d*$/, 'Longitude inválida'),
  dataAtual: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── Transit Spiritual Correlations ──────────────────────────────────────────
const PLANET_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
}> = {
  sol: { sefirot: ['Kether', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxalá', affirmation: 'Eu sou a luz que ilumina meu caminho' },
  lua: { sefirot: ['Yesod', 'Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'A lua reflete minha verdade interior' },
  mercurio: { sefirot: ['Hod', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A comunicação flui claramente através de mim' },
  venus: { sefirot: ['Chesed', 'Netzach'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O amor e a beleza fluem em minha vida' },
  marte: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Tenho força e coragem para agir' },
  jupiter: { sefirot: ['Chokhmah', 'Chesed'], chakra: 6, element: 'Fogo', orixa: 'Oxalá', affirmation: 'A abundância e sabedoria.expandem minha jornada' },
  saturno: { sefirot: ['Malkuth', 'Gevurah'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'A disciplina me leva à mastersia espiritual' },
  urano: { sefirot: ['Chokhmah'], chakra: 6, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Sou um canal de luz para a inovação' },
  netuno: { sefirot: ['Yesod', 'Netzach'], chakra: 7, element: 'Água', orixa: 'Iemanjá', affirmation: 'Dissolvo-me na luz divina com paz' },
  plutao: { sefirot: ['Gevurah', 'Hod'], chakra: 5, element: 'Fogo', orixa: 'Omolu', affirmation: 'A transformação me traz renovação e poder' },
};

const ASPECT_SPIRITUAL_CORRELATIONS: Record<string, {
  meaning: string;
  sefirot: string[];
  recommendation: string;
}> = {
  conjuncao: { meaning: 'União de forças', sefirot: ['Kether'], recommendation: 'Integre as energias com consciência' },
  oposicao: { meaning: 'Tensão criativa', sefirot: ['Gevurah', 'Chesed'], recommendation: 'Busque equilíbrio entre os opostos' },
  trino: { meaning: 'Harmonia natural', sefirot: ['Tipheret'], recommendation: 'Aproveite o fluxo harmonioso' },
  quadratura: { meaning: 'Desafio construtivo', sefirot: ['Gevurah'], recommendation: 'Supere os obstáculos com perseverança' },
  sextil: { meaning: 'Oportunidade', sefirot: ['Netzach'], recommendation: 'Agradeça e aproveite as oportunidades' },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = TransitosQuerySchema.safeParse({
      dataNascimento: searchParams.get('dataNascimento'),
      horaNascimento: searchParams.get('horaNascimento'),
      latitude: searchParams.get('latitude'),
      longitude: searchParams.get('longitude'),
      dataAtual: searchParams.get('dataAtual'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { dataNascimento, horaNascimento, latitude, longitude, dataAtual, sefirot, chakra, element } = parseResult.data;

    const mapaNatal = calcularMapaNatal(
      new Date(dataNascimento),
      horaNascimento,
      parseFloat(latitude),
      parseFloat(longitude)
    );

    const transitos = calcularTrânsitosAtivos(
      mapaNatal,
      dataAtual ? new Date(dataAtual) : new Date()
    );

    // Add spiritual correlations to transits
    const enrichedTransitos = transitos.map(transito => {
      const planetCorr = PLANET_SPIRITUAL_CORRELATIONS[transito.planeta.toLowerCase()];
      const aspectCorr = ASPECT_SPIRITUAL_CORRELATIONS[transito.tipo.toLowerCase()];

      return {
        ...transito,
        spiritualCorrelations: {
          sefirot: planetCorr?.sefirot || [],
          chakra: planetCorr?.chakra,
          element: planetCorr?.element,
          orixa: planetCorr?.orixa,
          affirmation: planetCorr?.affirmation,
          aspectMeaning: aspectCorr?.meaning,
          aspectSefirot: aspectCorr?.sefirot || [],
          recommendation: aspectCorr?.recommendation,
        },
      };
    });

    // Filter by spiritual correlations if requested
    let filteredTransitos = enrichedTransitos;
    if (sefirot) {
      filteredTransitos = filteredTransitos.filter(t =>
        t.spiritualCorrelations.sefirot.includes(sefirot)
      );
    }
    if (chakra) {
      filteredTransitos = filteredTransitos.filter(t =>
        t.spiritualCorrelations.chakra === chakra
      );
    }
    if (element) {
      filteredTransitos = filteredTransitos.filter(t =>
        t.spiritualCorrelations.element === element
      );
    }

    // Statistics
    const stats = {
      byPlanet: enrichedTransitos.reduce((acc, t) => {
        acc[t.planeta] = (acc[t.planeta] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byAspect: enrichedTransitos.reduce((acc, t) => {
        acc[t.tipo] = (acc[t.tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: enrichedTransitos.reduce((acc, t) => {
        const el = t.spiritualCorrelations.element;
        if (el) {
          acc[el] = (acc[el] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      byChakra: enrichedTransitos.reduce((acc, t) => {
        const ch = t.spiritualCorrelations.chakra;
        if (ch) {
          acc[ch] = (acc[ch] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>),
      totalTransitos: enrichedTransitos.length,
    };

    return NextResponse.json(
      {
        success: true,
        transitos: filteredTransitos,
        stats,
        espiritualCorrelations: {
          planets: PLANET_SPIRITUAL_CORRELATIONS,
          aspects: ASPECT_SPIRITUAL_CORRELATIONS,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (_error) {
    console.error('Erro calculando trânsitos:', _error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao calcular trânsitos'
    }, { status: 500 });
  }
}