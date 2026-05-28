// ============================================================
// LEARNING CONTENT API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for learning content management
// - Content items and modules
// - Content metadata and categorization
// - Content filtering and search
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/error-handling';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'text' | 'video' | 'audio' | 'interactive';
  category: string;
  tags: string[];
  duration?: number;
  order: number;
  courseId: string;
  lessonId?: string;
  publishedAt: string;
  updatedAt: string;
}

type EnrichedContentItem = ContentItem & { moduleId: string; moduleTitle: string };

interface ContentModule {
  id: string;
  title: string;
  description: string;
  courseId: string;
  items: ContentItem[];
  totalDuration: number;
}

// In-memory content data
const contentModules: ContentModule[] = [
  {
    id: 'mod-cabala-intro',
    title: 'Introdução à Cabala',
    description: 'Módulo introdutório sobre os fundamentos da Cabala',
    courseId: 'cabala-fundamentals',
    totalDuration: 45,
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
      },
      {
        id: 'cnt-cab-003',
        title: 'Meditação Cabalística',
        description: 'Prática de meditação baseada na tradição',
        content: 'A meditação cabalística conecta o praticante com as energias divinas...',
        type: 'audio',
        category: 'cabala',
        tags: ['meditação', 'prática', 'audio'],
        duration: 10,
        order: 3,
        courseId: 'cabala-fundamentals',
        lessonId: 'tree-of-life',
        publishedAt: '2024-01-17T10:00:00Z',
        updatedAt: '2024-01-17T10:00:00Z',
      },
    ],
  },
  {
    id: 'mod-astro-intro',
    title: 'Fundamentos da Astrologia Espiritual',
    description: 'Introdução aos conceitos astrológicos no contexto espiritual',
    courseId: 'astrology-basics',
    totalDuration: 60,
    items: [
      {
        id: 'cnt-ast-001',
        title: 'O Zodíaco Espiritual',
        description: 'Os signos do zodíaco e sua significação espiritual',
        content: 'O zodíaco representa ciclos cósmicos de transformação...',
        type: 'text',
        category: 'astrologia',
        tags: ['zodíaco', 'signos', 'fundamentos'],
        duration: 20,
        order: 1,
        courseId: 'astrology-basics',
        lessonId: 'planets-meaning',
        publishedAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-02-01T10:00:00Z',
      },
      {
        id: 'cnt-ast-002',
        title: 'Os Planetas e Suas Vibrações',
        description: 'Entendendo a energia planetária',
        content: 'Cada planeta emite uma frequência vibracional única...',
        type: 'video',
        category: 'astrologia',
        tags: ['planetas', 'vídeo', 'energia'],
        duration: 25,
        order: 2,
        courseId: 'astrology-basics',
        lessonId: 'planets-meaning',
        publishedAt: '2024-02-02T10:00:00Z',
        updatedAt: '2024-02-02T10:00:00Z',
      },
      {
        id: 'cnt-ast-003',
        title: 'Aspectos Cósmicos',
        description: 'Os ângulos entre planetas e suas influências',
        content: 'Os aspectos formam padrões de energia que afetam nossa vida...',
        type: 'interactive',
        category: 'astrologia',
        tags: ['aspectos', 'interativo', 'padrões'],
        duration: 15,
        order: 3,
        courseId: 'astrology-basics',
        lessonId: 'aspects-energy',
        publishedAt: '2024-02-03T10:00:00Z',
        updatedAt: '2024-02-03T10:00:00Z',
      },
    ],
  },
  {
    id: 'mod-meditacao-sagrada',
    title: 'Práticas de Meditação Sagrada',
    description: 'Técnicas meditativas avançadas',
    courseId: 'meditation-sacred',
    totalDuration: 50,
    items: [
      {
        id: 'cnt-med-001',
        title: 'Respiração Pranayama',
        description: 'Técnica de respiração yogi',
        content: 'O pranayama controla o prana através da respiração...',
        type: 'audio',
        category: 'meditacao',
        tags: ['respiração', 'pranayama', 'técnica'],
        duration: 15,
        order: 1,
        courseId: 'meditation-sacred',
        lessonId: 'breath-work',
        publishedAt: '2024-03-01T10:00:00Z',
        updatedAt: '2024-03-01T10:00:00Z',
      },
      {
        id: 'cnt-med-002',
        title: 'Visualização da Árvore da Vida',
        description: 'Meditação guiada para conexão com a Árvore',
        content: 'Visualize as Dez Sephiroth formando uma árvore luminosa...',
        type: 'audio',
        category: 'meditacao',
        tags: ['visualização', 'árvore da vida', 'guiada'],
        duration: 20,
        order: 2,
        courseId: 'meditation-sacred',
        lessonId: 'visualization',
        publishedAt: '2024-03-02T10:00:00Z',
        updatedAt: '2024-03-02T10:00:00Z',
      },
      {
        id: 'cnt-med-003',
        title: 'Mantras de Poder',
        description: 'Sons sagrados para transformação',
        content: 'Os mantras são sons que ativam centros de energia...',
        type: 'audio',
        category: 'meditacao',
        tags: ['mantras', 'sons', 'transformação'],
        duration: 15,
        order: 3,
        courseId: 'meditation-sacred',
        lessonId: 'mantras-sounds',
        publishedAt: '2024-03-03T10:00:00Z',
        updatedAt: '2024-03-03T10:00:00Z',
      },
    ],
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const moduleId = searchParams.get('moduleId');
  const contentId = searchParams.get('contentId');
  const courseId = searchParams.get('courseId');
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const tags = searchParams.get('tags')?.split(',').filter(Boolean);

  if (!endpoint) {
    return NextResponse.json(
      {
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
        },
      },
      { status: 200 }
    );
  }

  switch (endpoint) {
    case 'modules': {
      let filteredModules = contentModules;

      if (courseId) {
        filteredModules = filteredModules.filter((m) => m.courseId === courseId);
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
          })),
          total: filteredModules.length,
        },
      });
    }

    case 'module': {
      if (!moduleId) {
        return NextResponse.json(
          { success: false, error: { message: 'Module ID is required', code: 2002 } },
          { status: 400 }
        );
      }

      const module = contentModules.find((m) => m.id === moduleId);
      if (!module) {
        return NextResponse.json(
          { success: false, error: { message: 'Content module not found', code: 3001 } },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: module,
      });
    }

    case 'content': {
      if (!contentId) {
        return NextResponse.json(
          { success: false, error: { message: 'Content ID is required', code: 2002 } },
          { status: 400 }
        );
      }

      for (const module of contentModules) {
        const item = module.items.find((i) => i.id === contentId);
        if (item) {
          const itemIndex = module.items.findIndex((i) => i.id === contentId);
          return NextResponse.json({
            success: true,
            data: {
              ...item,
              moduleId: module.id,
              moduleTitle: module.title,
              nextContent: module.items[itemIndex + 1] || null,
              previousContent: module.items[itemIndex - 1] || null,
            },
          });
        }
      }

      return NextResponse.json(
        { success: false, error: { message: 'Content not found', code: 3001 } },
        { status: 404 }
      );
    }

    case 'search': {
      const query = searchParams.get('q')?.toLowerCase() || '';
      
      if (!query) {
        return NextResponse.json(
          { success: false, error: { message: 'Search query is required', code: 2002 } },
          { status: 400 }
        );
      }

      const results: EnrichedContentItem[] = [];
      for (const mod of contentModules) {
        for (const item of mod.items) {
          if (
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query) ||
            item.tags.some((tag) => tag.toLowerCase().includes(query))
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

          if (matches) {
            filteredItems.push(enrichedItem);
          }
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          items: filteredItems,
          total: filteredItems.length,
          filters: { courseId, category, type, tags },
        },
      });
    }

    default:
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Unknown endpoint: ${endpoint}`,
            code: 2003,
          },
        },
        { status: 400 }
      );
  }
}
