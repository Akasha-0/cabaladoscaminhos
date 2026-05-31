import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandler } from '@/lib/error-handling';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const LearningEndpointSchema = z.enum([
  'courses', 'course', 'lessons', 'lesson', 'progress', 'categories'
]);
const LearningQuerySchema = z.object({
  endpoint: LearningEndpointSchema,
  id: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── Spiritual Correlations by Category ──────────────────────────────────────────
const CATEGORY_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
}> = {
  cabala: { sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'A sabedoria divina me ilumina' },
  astrologia: { sefirot: ['Chokhmah', 'Gevurah', 'Tipheret'], chakra: 6, element: 'Ar', orixa: 'Oxum', affirmation: 'Os astros revelam meu caminho' },
  numerologia: { sefirot: ['Binah', 'Chokhmah', 'Yesod'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Os números guiam minha jornada' },
  tarot: { sefirot: ['Chokhmah', 'Netzach', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Orunmilá', affirmation: 'As cartas revelam verdades ocultas' },
  orixas: { sefirot: ['Gevurah', 'Chesed', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Ogum', affirmation: 'Honro a sabedoria dos Orixás' },
  chakras: { sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'], chakra: 1, element: 'Fogo', orixa: 'Kundalini', affirmation: 'Meus chakras fluem em harmonia' },
  geometria: { sefirot: ['Kether', 'Malkuth'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'A geometria sagrada molda minha consciência' },
  rituals: { sefirot: ['Chesed', 'Gevurah', 'Tipheret'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Meus rituais abençoam minha jornada' },
};

// ─── Course Spiritual Data ──────────────────────────────────────────
interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  order: number;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessons: Lesson[];
  totalDuration: number;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
  };
}

interface Progress {
  courseId: string;
  completedAt?: string;
}

// In-memory course data
const courses: Course[] = [
  {
    id: 'cabala-fundamentals',
    title: 'Fundamentos da Cabala',
    description: 'Introdução aos princípios básicos da Cabala e das Dez Sephiroth',
    category: 'cabala',
    difficulty: 'beginner',
    totalDuration: 120,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS.cabala,
    lessons: [
      { id: 'sephiroth-overview', title: 'As Dez Sephiroth', description: 'Conhecimento das dez emanações divinas', content: 'As Sephiroth são os dez atributos pelos quais o Criador se manifesta...', duration: 30, order: 1, spiritualCorrelations: { sefirot: ['Kether', 'Chokhmah', 'Binah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Eu compreendo as emanações divinas' } },
      { id: 'tree-of-life', title: 'Árvore da Vida', description: 'Estrutura e significado da Árvore da Vida', content: 'A Árvore da Vida é o mapa fundamental da realidade cabalística...', duration: 45, order: 2, spiritualCorrelations: { sefirot: ['Tipheret', 'Malkuth'], chakra: 6, element: 'Éter', orixa: 'Oxalá', affirmation: 'A árvore da vida guia meu caminho' } },
      { id: 'paths-connections', title: 'Caminhos e Conexões', description: 'Os 22 caminhos entre as Sephiroth', content: 'Os 22 caminhos representam as 22 letras do alfabeto hebraico...', duration: 45, order: 3, spiritualCorrelations: { sefirot: ['Kether', 'Malkuth'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Os caminhos me conectam à fonte' } },
    ],
  },
  {
    id: 'astrology-basics',
    title: 'Astrologia Espiritual',
    description: 'Fundamentos da astrologia no contexto espiritual',
    category: 'astrologia',
    difficulty: 'beginner',
    totalDuration: 90,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS.astrologia,
    lessons: [
      { id: 'planets-meaning', title: 'Os Planetas e seus Significados', description: 'Influência espiritual dos planetas', content: 'Cada planeta representa uma energia arquetípica específica...', duration: 30, order: 1, spiritualCorrelations: { sefirot: ['Chokhmah'], chakra: 6, element: 'Ar', orixa: 'Oxum', affirmation: 'Os planetas iluminam minha jornada' } },
      { id: 'houses-impact', title: 'Casas Astrológicas', description: 'As 12 casas e suas áreas de influência', content: 'As casas representam diferentes áreas da experiência humana...', duration: 30, order: 2, spiritualCorrelations: { sefirot: ['Tipheret'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'As casas astrais refletem minha vida' } },
      { id: 'aspects-energy', title: 'Aspectos Planetários', description: 'Ângulos entre planetas e suas energias', content: 'Os aspectos formam padrões de energia entre os corpos celestes...', duration: 30, order: 3, spiritualCorrelations: { sefirot: ['Gevurah'], chakra: 4, element: 'Fogo', orixa: 'Xangô', affirmation: 'Os aspectos harmonizam minha energia' } },
    ],
  },
  {
    id: 'orixa-foundations',
    title: 'Fundamentos dos Orixás',
    description: 'Conhecimento ancestral dos Orixás e suas energias',
    category: 'orixas',
    difficulty: 'beginner',
    totalDuration: 150,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS.orixas,
    lessons: [
      { id: 'orixa-intro', title: 'Introdução aos Orixás', description: 'O que são os Orixás e sua importância', content: 'Os Orixás são entidades espirituais da tradição afro-brasileira...', duration: 30, order: 1, spiritualCorrelations: { sefirot: ['Chesed'], chakra: 4, element: 'Fogo', orixa: 'Ogum', affirmation: 'Honro os Orixás em minha vida' } },
      { id: 'orixa-elements', title: 'Elementos e Orixás', description: 'Conexão entre elementos e Orixás', content: 'Cada Orixá governa elementos específicos...', duration: 45, order: 2, spiritualCorrelations: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'Os elementos me conectam aos Orixás' } },
      { id: 'orixa-rituals', title: 'Rituais e Oferendas', description: 'Práticas rituais para cada Orixá', content: 'Conheça os rituais apropriados para cada Orixá...', duration: 75, order: 3, spiritualCorrelations: { sefirot: ['Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Meus rituais honram os Orixás' } },
    ],
  },
  {
    id: 'tarot-beginners',
    title: 'Tarot para Iniciantes',
    description: 'Aprenda a usar o Tarot como ferramenta de autoconhecimento',
    category: 'tarot',
    difficulty: 'beginner',
    totalDuration: 100,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS.tarot,
    lessons: [
      { id: 'major-arcana', title: 'Arcanos Maiores', description: 'Os 22 arcanos maiores e seus significados', content: 'Os Arcanos Maiores representam as grandes lições da vida...', duration: 40, order: 1, spiritualCorrelations: { sefirot: ['Chokhmah'], chakra: 6, element: 'Água', orixa: 'Orunmilá', affirmation: 'Os arcanos revelam minha verdade' } },
      { id: 'minor-arcana', title: 'Arcanos Menores', description: 'Os 56 arcanos menores', content: 'Os Arcanos Menores representam situações cotidianas...', duration: 30, order: 2, spiritualCorrelations: { sefirot: ['Netzach'], chakra: 5, element: 'Ar', orixa: 'Oxum', affirmation: 'Cada arcano ilumina meu caminho' } },
      { id: 'spreads', title: 'Espelhos e Leituras', description: 'Como fazer tiragens de Tarot', content: 'Aprenda diferentes espelhos para suas leituras...', duration: 30, order: 3, spiritualCorrelations: { sefirot: ['Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'A leitura me guia com clareza' } },
    ],
  },
  {
    id: 'chakra-awakening',
    title: 'Despertar dos Chakras',
    description: 'Sistema de chakras e sua relação com a espiritualidade',
    category: 'chakras',
    difficulty: 'intermediate',
    totalDuration: 120,
    spiritualCorrelations: CATEGORY_SPIRITUAL_CORRELATIONS.chakras,
    lessons: [
      { id: 'chakra-basics', title: 'Fundamentos dos Chakras', description: 'O que são os chakras e como funcionam', content: 'Os chakras são centros de energia no corpo sutil...', duration: 30, order: 1, spiritualCorrelations: { sefirot: ['Kether'], chakra: 7, element: 'Éter', orixa: 'Kundalini', affirmation: 'Meus chakras estão em equilíbrio' } },
      { id: 'chakra-mapping', title: 'Mapeamento dos 7 Chakras', description: 'Os sete chakras principais', content: 'Cada chakra possui características específicas...', duration: 45, order: 2, spiritualCorrelations: { sefirot: ['Chokhmah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Cada chakra irradia sua energia' } },
      { id: 'chakra-cleansing', title: 'Limpeza e Harmonização', description: 'Práticas para limpar os chakras', content: 'Técnicas de limpeza e harmonização dos chakras...', duration: 45, order: 3, spiritualCorrelations: { sefirot: ['Binah'], chakra: 5, element: 'Fogo', orixa: 'Oxum', affirmation: ' limpo meus chakras com luz' } },
    ],
  },
];

// Progress tracking
const progressStore: Map<string, Progress[]> = new Map();

function getSpiritualCorrelations(category: string) {
  return CATEGORY_SPIRITUAL_CORRELATIONS[category.toLowerCase()] || {
    sefirot: ['Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'O aprendizado ilumina meu caminho',
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = LearningQuerySchema.safeParse({
      endpoint: searchParams.get('endpoint'),
      id: searchParams.get('id'),
      category: searchParams.get('category'),
      difficulty: searchParams.get('difficulty'),
      courseId: searchParams.get('courseId'),
      lessonId: searchParams.get('lessonId'),
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

    const { endpoint, id, category, difficulty, sefirot, chakra, element } = parseResult.data;

    switch (endpoint) {
      case 'courses': {
        let filteredCourses = [...courses];

        if (category) {
          filteredCourses = filteredCourses.filter(c => c.category === category);
        }
        if (difficulty) {
          filteredCourses = filteredCourses.filter(c => c.difficulty === difficulty);
        }
        if (sefirot) {
          filteredCourses = filteredCourses.filter(c =>
            c.spiritualCorrelations?.sefirot.includes(sefirot)
          );
        }
        if (chakra) {
          filteredCourses = filteredCourses.filter(c => c.spiritualCorrelations?.chakra === chakra);
        }
        if (element) {
          filteredCourses = filteredCourses.filter(c => c.spiritualCorrelations?.element === element);
        }

        return NextResponse.json({
          success: true,
          courses: filteredCourses,
          meta: { total: filteredCourses.length, category, difficulty, filters: { sefirot, chakra, element } },
        });
      }

      case 'course': {
        if (!id) {
          return NextResponse.json({ success: false, error: 'ID do curso requerido' }, { status: 400 });
        }
        const course = courses.find(c => c.id === id);
        if (!course) {
          return NextResponse.json({ success: false, error: 'Curso não encontrado' }, { status: 404 });
        }
        return NextResponse.json({ success: true, course });
      }

      case 'lessons': {
        if (!courseId) {
          return NextResponse.json({ success: false, error: 'courseId requerido' }, { status: 400 });
        }
        const course = courses.find(c => c.id === courseId);
        if (!course) {
          return NextResponse.json({ success: false, error: 'Curso não encontrado' }, { status: 404 });
        }
        return NextResponse.json({ success: true, lessons: course.lessons, courseId });
      }

      case 'lesson': {
        if (!lessonId) {
          return NextResponse.json({ success: false, error: 'lessonId requerido' }, { status: 400 });
        }
        for (const course of courses) {
          const lesson = course.lessons.find(l => l.id === lessonId);
          if (lesson) {
            return NextResponse.json({ success: true, lesson, courseId: course.id });
          }
        }
        return NextResponse.json({ success: false, error: 'Lição não encontrada' }, { status: 404 });
      }

      case 'progress': {
        const userId = searchParams.get('userId') || 'default';
        const userProgress = progressStore.get(userId) || [];
        return NextResponse.json({
          success: true,
          progress: userProgress,
          meta: { totalCourses: courses.length, completedCourses: userProgress.length },
        });
      }

      case 'categories': {
        const categories = [...new Set(courses.map(c => c.category))];
        const categoriesWithCorrelations = categories.map(cat => ({
          id: cat,
          name: cat,
          ...getSpiritualCorrelations(cat),
        }));
        return NextResponse.json({ success: true, categories: categoriesWithCorrelations });
      }

      default:
        return NextResponse.json({
          success: true,
          courses: courses.map(c => ({ id: c.id, title: c.title, category: c.category, difficulty: c.difficulty })),
          meta: { total: courses.length },
        });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}

// POST handler for progress tracking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, userId } = body;

    if (!courseId || !userId) {
      return NextResponse.json({ success: false, error: 'courseId e userId requeridos' }, { status: 400 });
    }

    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return NextResponse.json({ success: false, error: 'Curso não encontrado' }, { status: 404 });
    }

    const userProgress = progressStore.get(userId) || [];
    userProgress.push({ courseId, completedAt: new Date().toISOString() });
    progressStore.set(userId, userProgress);

    return NextResponse.json({
      success: true,
      message: 'Progresso registrado',
      spiritualCorrelations: course.spiritualCorrelations,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}