// ============================================================
// LEARNING CONTENT API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for learning content management
// - Content items and modules
// - Content metadata and categorization
// - Content filtering and search
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const ContentTypeSchema = z.enum(['text', 'video', 'audio', 'interactive', 'ritual', 'meditation']);
const CategorySchema = z.enum([
  'cabala', 'orixa', 'tarot', 'astrologia', 'numerologia',
  ' chakras', 'meditacao', 'ritual', ' ancestral', 'yoga'
]);

const ContentQuerySchema = z.object({
  endpoint: z.enum(['modules', 'module', 'content', 'search', 'filter']).optional(),
  moduleId: z.string().optional(),
  contentId: z.string().optional(),
  courseId: z.string().optional(),
  category: z.string().optional(),
  type: ContentTypeSchema.optional(),
  tags: z.string().optional(),
  q: z.string().optional(),
  orixa: z.string().optional(),
  sefirot: z.string().optional(),
  chakra: z.coerce.number().int().min(1).max(7).optional(),
});

const ContentItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  type: ContentTypeSchema,
  category: z.string(),
  tags: z.array(z.string()),
  duration: z.number().int().positive().optional(),
  order: z.number().int().min(1),
  courseId: z.string(),
  lessonId: z.string().optional(),
  publishedAt: z.string(),
  updatedAt: z.string(),
  // Spiritual correlations
  sefirot: z.array(z.string()).optional(),
  orixa: z.string().optional(),
  chakra: z.array(z.number()).optional(),
  tradicao: z.string().optional(),
  nivel: z.enum(['iniciante', 'intermediario', 'avancado']).optional(),
});

const ContentModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  courseId: z.string(),
  items: z.array(ContentItemSchema),
  totalDuration: z.number().int().positive(),
  sefirot: z.array(z.string()).optional(),
  orixa: z.string().optional(),
});

// ─── Type Definitions ───────────────────────────────────────────────────────
interface ContentItem {
  id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  category: string;
  tags: string[];
  duration?: number;
  order: number;
  courseId: string;
  lessonId?: string;
  publishedAt: string;
  updatedAt: string;
  sefirot?: string[];
  orixa?: string;
  chakra?: number[];
  tradicao?: string;
  nivel?: string;
}

type EnrichedContentItem = ContentItem & { moduleId: string; moduleTitle: string };

interface ContentModule {
  id: string;
  title: string;
  description: string;
  courseId: string;
  items: ContentItem[];
  totalDuration: number;
  sefirot?: string[];
  orixa?: string;
// ─── Content Spiritual Correlations ──────────────────────────────────────────────────
const CONTENT_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'cabala': { sefirot: ['Kether', 'Chokhmah', 'Binah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'A sabedoria da Cabala ilumina minha alma', frequency: '963 Hz' },
  'orixa': { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A energia do Orixá flui através de mim', frequency: '528 Hz' },
  'tarot': { sefirot: ['Chokhmah', 'Hod'], chakra: 6, element: 'Ar', orixa: 'Oxalá', affirmation: 'Os símbolos do Tarot revelam minha verdade', frequency: '528 Hz' },
  'astrologia': { sefirot: ['Kether', 'Tipheret'], chakra: 6, element: 'Fogo', orixa: 'Iemanjá', affirmation: 'Os astros guiam meu caminho', frequency: '639 Hz' },
  'numerologia': { sefirot: ['Chokhmah', 'Binah'], chakra: 6, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Os números revelam minha jornada de alma', frequency: '741 Hz' },
  'chakras': { sefirot: ['Tipheret', 'Kether'], chakra: 7, element: 'Fogo', orixa: 'Oxalá', affirmation: 'Meus chakras fluem em harmonia perfeita', frequency: '528 Hz' },
  'meditacao': { sefirot: ['Kether', 'Binah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'No silêncio, encontro minha essência', frequency: '963 Hz' },
  'ritual': { sefirot: ['Chesed', 'Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'O ritual sagrado transforma minha realidade', frequency: '528 Hz' },
  'ancestral': { sefirot: ['Binah', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'A linhagem ancestral me sustenta', frequency: '639 Hz' },
  'yoga': { sefirot: ['Malkuth', 'Yesod'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'O corpo é templo do espírito', frequency: '396 Hz' },
};

function enrichContentItem(item: ContentItem & Record<string, unknown>, modTitle: string) {
  const categoryKey = (item.category || '').toLowerCase().replace(/[^a-z]/g, '');
  const corr = CONTENT_SPIRITUAL_CORRELATIONS[categoryKey] || CONTENT_SPIRITUAL_CORRELATIONS['cabala'];
  return {
    ...item,
    moduleTitle: modTitle,
    spiritualCorrelations: {
      sefirot: corr.sefirot,
      chakra: corr.chakra,
      element: corr.element,
      orixa: corr.orixa,
      affirmation: corr.affirmation,
      frequency: corr.frequency,
    },
  };
}

export const dynamic = 'force-dynamic';

// ─── In-memory Content Data ─────────────────────────────────────────────────────
const contentModules: ContentModule[] = [
  {
    id: 'mod-cabala-intro',
    title: 'Introdução à Cabala',
    description: 'Módulo introdutório sobre os fundamentos da Cabala',
    courseId: 'cabala-fundamentals',
    totalDuration: 45,
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    orixa: 'Oxalá',
    items: [
      {
        id: 'cnt-cab-001',
        title: 'O Que é a Cabala?',
        description: 'Uma visão geral da tradição cabalística',
        content: 'A Cabala é uma tradição mística judaica que busca compreender a natureza divina...',
        type: 'text',
        category: 'cabala',
        tags: ['introdução', 'história', 'tradição'],
        duration: 15,
        order: 1,
        courseId: 'cabala-fundamentals',
        lessonId: 'sephiroth-overview',
        publishedAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        sefirot: ['Kether'],
        tradicao: 'Cabala',
        nivel: 'iniciante',
      },
      {
        id: 'cnt-cab-002',
        title: 'Os Símbolos da Cabala',
        description: 'Entendendo os símbolos fundamentais',
        content: 'A Cabala utiliza diversos símbolos para representar conceitos espirituais...',
        type: 'interactive',
        category: 'cabala',
        tags: ['símbolos', 'interativo', 'aprendizado'],
        duration: 20,
        order: 2,
        courseId: 'cabala-fundamentals',
        lessonId: 'sephiroth-overview',
        publishedAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z',
        sefirot: ['Chokhmah', 'Binah'],
        tradicao: 'Cabala',
        nivel: 'iniciante',
      },
      {
        id: 'cnt-cab-003',
        title: 'Meditação Cabalística',
        description: 'Prática de meditação baseada na tradição',
        content: 'A meditação cabalística conecta o praticante com as energias divinas...',
        type: 'meditation',
        category: 'meditacao',
        tags: ['meditação', 'prática', 'spiritual'],
        duration: 30,
        order: 3,
        courseId: 'cabala-fundamentals',
        publishedAt: '2024-01-17T10:00:00Z',
        updatedAt: '2024-01-17T10:00:00Z',
        sefirot: ['Kether', 'Tipheret'],
        tradicao: 'Cabala',
        nivel: 'intermediario',
      },
    ],
  },
  {
    id: 'mod-orixa-fundamentals',
    title: 'Fundamentos dos Orixás',
    description: 'Aprenda sobre os orixás e suas energias',
    courseId: 'orixa-studies',
    totalDuration: 60,
    orixa: 'Oxalá',
    sefirot: ['Tipheret', 'Malkuth'],
    items: [
      {
        id: 'cnt-orx-001',
        title: 'O que são Orixás?',
        description: 'Introdução aos orixás do Candomblé',
        content: 'Os orixás são divindades da tradição afro-brasileira...',
        type: 'text',
        category: 'orixa',
        tags: ['orixás', 'candomblé', 'introdução'],
        duration: 20,
        order: 1,
        courseId: 'orixa-studies',
        publishedAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-02-01T10:00:00Z',
        orixa: 'Oxalá',
        chakra: [6, 7],
        tradicao: 'Candomblé',
        nivel: 'iniciante',
      },
      {
        id: 'cnt-orx-002',
        title: 'Ritual de Oferenda',
        description: 'Como realizar oferendas aos orixás',
        content: 'As oferendas são essenciais na relação com os orixás...',
        type: 'ritual',
        category: 'ritual',
        tags: ['ritual', 'oferenda', 'prática'],
        duration: 25,
        order: 2,
        courseId: 'orixa-studies',
        publishedAt: '2024-02-02T10:00:00Z',
        updatedAt: '2024-02-02T10:00:00Z',
        orixa: 'Oxum',
        chakra: [4],
        tradicao: 'Candomblé',
        nivel: 'intermediario',
      },
      {
        id: 'cnt-orx-003',
        title: 'Banhos de Ervas Sagradas',
        description: 'Prática de banhos com ervas dos orixás',
        content: 'Os banhos de ervas são rituais de purificação...',
        type: 'ritual',
        category: 'ritual',
        tags: ['ervas', 'banho', 'purificação'],
        duration: 15,
        order: 3,
        courseId: 'orixa-studies',
        publishedAt: '2024-02-03T10:00:00Z',
        updatedAt: '2024-02-03T10:00:00Z',
        orixa: 'Ogum',
        chakra: [1, 3],
        tradicao: 'Candomblé',
        nivel: 'avancado',
      },
    ],
  },
  {
    id: 'mod-tarot-intro',
    title: 'Introdução ao Tarot',
    description: 'Aprenda os fundamentos do Tarot Egípcio',
    courseId: 'tarot-studies',
    totalDuration: 50,
    sefirot: ['Tipheret'],
    items: [
      {
        id: 'cnt-tar-001',
        title: 'História do Tarot',
        description: 'Origens e evolução do Tarot',
        content: 'O Tarot tem raízes antigas que remontam ao Egito...',
        type: 'text',
        category: 'tarot',
        tags: ['história', 'origens', 'tradição'],
        duration: 15,
        order: 1,
        courseId: 'tarot-studies',
        publishedAt: '2024-03-01T10:00:00Z',
        updatedAt: '2024-03-01T10:00:00Z',
        sefirot: ['Binah'],
        tradicao: 'Tarot Egípcio',
        nivel: 'iniciante',
      },
      {
        id: 'cnt-tar-002',
        title: 'Os Arcanos Maiores',
        description: 'Estudo dos 22 Arcanos Maiores',
        content: 'Os Arcanos Maiores representam os princípios fundamentais...',
        type: 'interactive',
        category: 'tarot',
        tags: ['arcanos maiores', 'cartas', 'estudo'],
        duration: 20,
        order: 2,
        courseId: 'tarot-studies',
        publishedAt: '2024-03-02T10:00:00Z',
        updatedAt: '2024-03-02T10:00:00Z',
        sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
        tradicao: 'Tarot Egípcio',
        nivel: 'intermediario',
      },
      {
        id: 'cnt-tar-003',
        title: 'Leitura de Cartas',
        description: 'Prática de leitura e interpretação',
        content: 'A leitura de cartas requer intuição e conhecimento...',
        type: 'interactive',
        category: 'tarot',
        tags: ['leitura', 'interpretação', 'prática'],
        duration: 15,
        order: 3,
        courseId: 'tarot-studies',
        publishedAt: '2024-03-03T10:00:00Z',
        updatedAt: '2024-03-03T10:00:00Z',
        sefirot: ['Tipheret'],
        tradicao: 'Tarot Egípcio',
        nivel: 'avancado',
      },
    ],
  },
];

// ─── API Route ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parseResult = ContentQuerySchema.safeParse({
      endpoint: searchParams.get('endpoint'),
      moduleId: searchParams.get('moduleId'),
      contentId: searchParams.get('contentId'),
      courseId: searchParams.get('courseId'),
      category: searchParams.get('category'),
      type: searchParams.get('type'),
      tags: searchParams.get('tags'),
      q: searchParams.get('q'),
      orixa: searchParams.get('orixa'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { endpoint, moduleId, contentId, courseId, category, type, tags, q, orixa, sefirot, chakra } = parseResult.data;

    if (!endpoint) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'Learning Content API endpoints',
          available: [
            'GET /api/learning/content?endpoint=modules - List all content modules',
            'GET /api/learning/content?endpoint=module&moduleId={id} - Get specific module',
            'GET /api/learning/content?endpoint=content&contentId={id} - Get specific content item',
            'GET /api/learning/content?endpoint=search&q={query} - Search content',
            'GET /api/learning/content?endpoint=filter - Filter content by criteria',
          ],
          spiritualFilters: ['orixa', 'sefirot', 'chakra'],
        },
      }, { status: 200 });
    }

    switch (endpoint) {
      case 'modules': {
        let filteredModules = contentModules;

        if (courseId) {
          filteredModules = filteredModules.filter((m) => m.courseId === courseId);
        }

        if (orixa) {
          filteredModules = filteredModules.filter((m) =>
            m.orixa?.toLowerCase().includes(orixa.toLowerCase())
          );
        }

        if (sefirot) {
          filteredModules = filteredModules.filter((m) =>
            m.sefirot?.some(sf => sf.toLowerCase().includes(sefirot.toLowerCase()))
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            modules: filteredModules.map((m) => ({
              id: m.id,
              title: m.title,
              description: m.description,
              courseId: m.courseId,
              itemCount: m.items.length,
              totalDuration: m.totalDuration,
              sefirot: m.sefirot,
              orixa: m.orixa,
            })),
            total: filteredModules.length,
          },
        });
      }

      case 'module': {
        if (!moduleId) {
          return NextResponse.json({
            success: false,
            error: { message: 'Module ID is required', code: 2002 }
          }, { status: 400 });
        }

        const foundModule = contentModules.find((m) => m.id === moduleId);
        if (!foundModule) {
          return NextResponse.json({
            success: false,
            error: { message: 'Content module not found', code: 3001 }
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          data: foundModule,
        });
      }

      case 'content': {
        if (!contentId) {
          return NextResponse.json({
            success: false,
            error: { message: 'Content ID is required', code: 2002 }
          }, { status: 400 });
        }

        for (const mod of contentModules) {
          const item = mod.items.find((i) => i.id === contentId);
          if (item) {
            const itemIndex = mod.items.findIndex((i) => i.id === contentId);
            return NextResponse.json({
              success: true,
              data: {
                ...item,
                moduleId: mod.id,
                moduleTitle: mod.title,
                nextContent: mod.items[itemIndex + 1] || null,
                previousContent: mod.items[itemIndex - 1] || null,
              },
            });
          }
        }

        return NextResponse.json({
          success: false,
          error: { message: 'Content not found', code: 3001 }
        }, { status: 404 });
      }

      case 'search': {
        const query = q?.toLowerCase() || '';
        
        if (!query) {
          return NextResponse.json({
            success: false,
            error: { message: 'Search query is required', code: 2002 }
          }, { status: 400 });
        }

        const results: EnrichedContentItem[] = [];
        for (const mod of contentModules) {
          for (const item of mod.items) {
            if (
              item.title.toLowerCase().includes(query) ||
              item.description.toLowerCase().includes(query) ||
              item.content.toLowerCase().includes(query) ||
              item.tags.some((tag) => tag.toLowerCase().includes(query)) ||
              item.sefirot?.some(sf => sf.toLowerCase().includes(query)) ||
              item.orixa?.toLowerCase().includes(query)
            ) {
              results.push({
                ...item,
                moduleId: mod.id,
                moduleTitle: mod.title,
              });
            }
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            query,
            results,
            total: results.length,
          },
        });
      }

      case 'filter': {
        const filteredItems: EnrichedContentItem[] = [];

        for (const mod of contentModules) {
          for (const item of mod.items) {
            const enrichedItem: EnrichedContentItem = {
              ...item,
              moduleId: mod.id,
              moduleTitle: mod.title,
            };
            
            let matches = true;

            if (courseId && enrichedItem.courseId !== courseId) matches = false;
            if (category && enrichedItem.category !== category) matches = false;
            if (type && enrichedItem.type !== type) matches = false;
            if (tags && tags.length > 0 && !tags.some((t) => enrichedItem.tags.includes(t))) matches = false;
            if (orixa && !enrichedItem.orixa?.toLowerCase().includes(orixa.toLowerCase())) matches = false;
            if (sefirot && !enrichedItem.sefirot?.some(sf => sf.toLowerCase().includes(sefirot.toLowerCase()))) matches = false;
            if (chakra && !enrichedItem.chakra?.includes(chakra)) matches = false;

            if (matches) {
              filteredItems.push(enrichedItem);
            }
          }
        }

        // Statistics
        const stats = {
          byCategory: contentModules.flatMap(m => m.items).reduce((acc, i) => {
            acc[i.category] = (acc[i.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byType: contentModules.flatMap(m => m.items).reduce((acc, i) => {
            acc[i.type] = (acc[i.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byOrixa: contentModules.flatMap(m => m.items).reduce((acc, i) => {
            if (i.orixa) acc[i.orixa] = (acc[i.orixa] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byTradicao: contentModules.flatMap(m => m.items).reduce((acc, i) => {
            if (i.tradicao) acc[i.tradicao] = (acc[i.tradicao] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        };

        return NextResponse.json({
          success: true,
          data: {
            items: filteredItems,
            total: filteredItems.length,
            filters: { courseId, category, type, tags, orixa, sefirot, chakra },
            stats,
          },
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: {
            message: `Unknown endpoint: ${endpoint}`,
            code: 2003,
          },
        }, { status: 400 });
    }
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}