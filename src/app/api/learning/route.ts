// ============================================================
// LEARNING API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for spiritual learning content
// - Courses and lessons
// - Progress tracking
// - Quiz management
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandler } from '@/lib/error-handling';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
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
});
interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number; // in minutes
  order: number;
}
interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessons: Lesson[];
  totalDuration: number;
}
interface Progress {
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}
  content: string;
  duration: number; // in minutes
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessons: Lesson[];
  totalDuration: number;
}

interface Progress {
  courseId: string;
  lessonId: string;
  completed: boolean;
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
    lessons: [
      {
        id: 'sephiroth-overview',
        title: 'As Dez Sephiroth',
        description: 'Conhecimento das dez emanações divinas',
        content: 'As Sephiroth são os dez atributos pelos quais o Criador se manifesta...',
        duration: 30,
        order: 1,
      },
      {
        id: 'tree-of-life',
        title: 'Árvore da Vida',
        description: 'Estrutura e significado da Árvore da Vida',
        content: 'A Árvore da Vida é o mapa fundamental da realidade cabalística...',
        duration: 45,
        order: 2,
      },
      {
        id: 'paths-connections',
        title: 'Caminhos e Conexões',
        description: 'Os 22 caminhos entre as Sephiroth',
        content: 'Os 22 caminhos representam as 22 letras do alfabeto hebraico...',
        duration: 45,
        order: 3,
      },
    ],
  },
  {
    id: 'astrology-basics',
    title: 'Astrologia Espiritual',
    description: 'Fundamentos da astrologia no contexto espiritual',
    category: 'astrologia',
    difficulty: 'beginner',
    totalDuration: 90,
    lessons: [
      {
        id: 'planets-meaning',
        title: 'Os Planetas e seus Significados',
        description: 'Influência espiritual dos planetas',
        content: 'Cada planeta representa uma energia arquetípica específica...',
        duration: 30,
        order: 1,
      },
      {
        id: 'houses-impact',
        title: 'Casas Astrológicas',
        description: 'As 12 casas e suas áreas de influência',
        content: 'As casas representam diferentes áreas da experiência humana...',
        duration: 30,
        order: 2,
      },
      {
        id: 'aspects-energy',
        title: 'Aspectos Planetários',
        description: 'Ângulos entre planetas e suas energias',
        content: 'Os aspectos formam padrões de energia entre os corpos celestes...',
        duration: 30,
        order: 3,
      },
    ],
  },
  {
    id: 'meditation-sacred',
    title: 'Meditação Sagrada',
    description: 'Práticas meditativas baseadas em tradições sagradas',
    category: 'meditacao',
    difficulty: 'intermediate',
    totalDuration: 60,
    lessons: [
      {
        id: 'breath-work',
        title: 'Trabalho com a Respiração',
        description: 'Técnicas respiratórias sagradas',
        content: 'A respiração é a ponte entre o corpo e o espírito...',
        duration: 20,
        order: 1,
      },
      {
        id: 'visualization',
        title: 'Visualização Criativa',
        description: 'Usando a imaginação para transformação',
        content: 'A visualização é uma ferramenta poderosa de manifestação...',
        duration: 20,
        order: 2,
      },
      {
        id: 'mantras-sounds',
        title: 'Mantras e Sons Sagrados',
        description: 'O poder dos sons e vibrações',
        content: 'Os mantras são sons que carregam energia espiritual específica...',
        duration: 20,
        order: 3,
      },
    ],
  },
];

// In-memory progress tracking
const progressStore: Map<string, Progress[]> = new Map();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Learning API endpoints',
          available: [
            'GET /api/learning?endpoint=courses - List all courses',
            'GET /api/learning?endpoint=course&id={id} - Get specific course',
            'GET /api/learning?endpoint=lessons - List all lessons',
            'GET /api/learning?endpoint=lesson&id={id} - Get specific lesson',
            'GET /api/learning?endpoint=progress - Get user progress',
            'GET /api/learning?endpoint=categories - List categories',
          ],
        },
      },
      { status: 200 }
    );
  }

  switch (endpoint) {
    case 'courses': {
      const { category, difficulty } = Object.fromEntries(searchParams);
      let filteredCourses = courses;

      if (category) {
        filteredCourses = filteredCourses.filter((c) => c.category === category);
      }
      if (difficulty) {
        filteredCourses = filteredCourses.filter((c) => c.difficulty === difficulty);
      }

      return NextResponse.json({
        success: true,
        data: {
          courses: filteredCourses.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            category: c.category,
            difficulty: c.difficulty,
            lessonCount: c.lessons.length,
            totalDuration: c.totalDuration,
          })),
          total: filteredCourses.length,
        },
      });
    }

    case 'course': {
      const courseId = searchParams.get('id');
      if (!courseId) {
        return NextResponse.json(
          { success: false, error: { message: 'Course ID is required', code: 2002 } },
          { status: 400 }
        );
      }

      const course = courses.find((c) => c.id === courseId);
      if (!course) {
        return NextResponse.json(
          { success: false, error: { message: 'Course not found', code: 3001 } },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: course,
      });
    }

    case 'lessons': {
      const { courseId } = Object.fromEntries(searchParams);
      let lessons: Lesson[] = [];

      if (courseId) {
        const course = courses.find((c) => c.id === courseId);
        if (course) {
          lessons = course.lessons;
        }
      } else {
        lessons = courses.flatMap((c) =>
          c.lessons.map((l) => ({
            ...l,
            courseId: c.id,
            courseTitle: c.title,
          }))
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          lessons,
          total: lessons.length,
        },
      });
    }

    case 'lesson': {
      const lessonId = searchParams.get('id');
      if (!lessonId) {
        return NextResponse.json(
          { success: false, error: { message: 'Lesson ID is required', code: 2002 } },
          { status: 400 }
        );
      }

      for (const course of courses) {
        const lesson = course.lessons.find((l) => l.id === lessonId);
        if (lesson) {
          return NextResponse.json({
            success: true,
            data: {
              ...lesson,
              courseId: course.id,
              courseTitle: course.title,
              courseCategory: course.category,
              nextLesson: course.lessons.find((l) => l.order === lesson.order + 1) || null,
              previousLesson: course.lessons.find((l) => l.order === lesson.order - 1) || null,
            },
          });
        }
      }

      return NextResponse.json(
        { success: false, error: { message: 'Lesson not found', code: 3001 } },
        { status: 404 }
      );
    }

    case 'progress': {
      const userId = searchParams.get('userId') || 'anonymous';
      const userProgress = progressStore.get(userId) || [];

      // Calculate completion stats
      const totalLessons = courses.reduce((acc, c) => acc + c.lessons.length, 0);
      const completedLessons = userProgress.filter((p) => p.completed).length;
      const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return NextResponse.json({
        success: true,
        data: {
          userId,
          progress: userProgress,
          stats: {
            totalLessons,
            completedLessons,
            completionRate,
            inProgressLessons: userProgress.filter((p) => !p.completed).length,
          },
        },
      });
    }

    case 'categories': {
      const categories = [...new Set(courses.map((c) => c.category))];

      return NextResponse.json({
        success: true,
        data: {
          categories: categories.map((cat) => ({
            id: cat,
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            courseCount: courses.filter((c) => c.category === cat).length,
          })),
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