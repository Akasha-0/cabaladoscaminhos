// ============================================================
// MANIFESTATION API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const ManifestationStatusSchema = z.enum(['active', 'manifested', 'released']);
const PriorityLevelSchema = z.enum(['high', 'medium', 'low']);

const ManifestationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  intention: z.string(),
  description: z.string(),
  status: ManifestationStatusSchema,
  priority: PriorityLevelSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  targetDate: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()),
  affirmations: z.array(z.string()),
  gratitudeStatements: z.array(z.string()),
  actionSteps: z.array(z.string()),
  progress: z.number(),
  lastReinforced: z.string().optional(),
  reinforcementCount: z.number(),
  sefirot: z.array(SefirotSchema).optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.array(z.string()).optional(),
});

const CreateManifestationSchema = z.object({
  intention: z.string().min(1, 'Intenção é obrigatória'),
  description: z.string().optional(),
  priority: PriorityLevelSchema.optional().default('medium'),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  affirmations: z.array(z.string()).optional(),
  gratitudeStatements: z.array(z.string()).optional(),
  actionSteps: z.array(z.string()).optional(),
  sefirot: z.array(SefirotSchema).optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.array(z.string()).optional(),
});

const ManifestationQuerySchema = z.object({
  userId: z.string().optional(),
  status: ManifestationStatusSchema.optional(),
  priority: PriorityLevelSchema.optional(),
  category: z.string().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Type aliases ─────────────────────────────────────────────────────────
type ManifestationStatus = z.infer<typeof ManifestationStatusSchema>;
type PriorityLevel = z.infer<typeof PriorityLevelSchema>;
type Manifestation = z.infer<typeof ManifestationSchema>;

// ─── Const enums ──────────────────────────────────────────────────────────
const MANIFESTATION_STATUS = {
  ACTIVE: 'active',
  MANIFESTED: 'manifested',
  RELEASED: 'released',
} as const;

const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

// ─── Manifestation Categories with Spiritual Correlations ──────────────────────────────────────────
const MANIFESTATION_CATEGORIES = [
  {
    id: 'amor',
    name: 'Amor',
    namePt: 'Amor',
    element: 'Fogo',
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    orixa: ['Oxum', 'Iemanjá'],
    description: 'Manifestações relacionadas a relacionamentos, amor próprio e conexões afetivas.',
    affirmations: ['Eu sou digno de amor', 'O amor flui em minha vida naturalmente'],
  },
  {
    id: 'saude',
    name: 'Saúde',
    namePt: 'Saúde',
    element: 'Terra',
    sefirot: ['Chesed', 'Gevurah'],
    chakra: 3,
    orixa: ['Omolu', 'Oxum'],
    description: 'Manifestações relacionadas à saúde física, mental e espiritual.',
    affirmations: [' Meu corpo é saudável e forte', 'A vitalidade flui através de mim'],
  },
  {
    id: 'prosperidade',
    name: 'Prosperidade',
    namePt: 'Prosperidade',
    element: 'Fogo',
    sefirot: ['Chesed', 'Netzach'],
    chakra: 2,
    orixa: ['Oxum', 'Oxóssi'],
    description: 'Manifestações relacionadas a abundância financeira e material.',
    affirmations: ['A abundância é meu direito divino', 'Dinheiro flui para mim facilmente'],
  },
  {
    id: 'sabedoria',
    name: 'Sabedoria',
    namePt: 'Sabedoria',
    element: 'Ar',
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    orixa: ['Orunmilá', 'Oxalá'],
    description: 'Manifestações relacionadas a conhecimento, aprendizado e discernimento.',
    affirmations: ['A sabedoria divina guia meus passos', 'Eu sou um receptáculo de luz e verdade'],
  },
  {
    id: 'protecao',
    name: 'Proteção',
    namePt: 'Proteção',
    element: 'Terra',
    sefirot: ['Gevurah', 'Malkuth'],
    chakra: 1,
    orixa: ['Ogum', 'Oxalá'],
    description: 'Manifestações relacionadas a segurança, proteção e encerramento de ciclos.',
    affirmations: ['Sou protegido por forças светлые', 'Nenhuma energia negativa pode me tocar'],
  },
  {
    id: 'cura',
    name: 'Cura',
    namePt: 'Cura',
    element: 'Água',
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    orixa: ['Omolu', 'Oxum', 'Iemanjá'],
    description: 'Manifestações relacionadas a cura emocional, física ou espiritual.',
    affirmations: ['Sou completamente curado', 'A luz divina restaura cada célula do meu ser'],
  },
  {
    id: 'proposito',
    name: 'Propósito',
    namePt: 'Propósito',
    element: 'Éter',
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    orixa: ['Oxalá', 'Orunmilá'],
    description: 'Manifestações relacionadas a missão de vida e propósito existencial.',
    affirmations: ['Conheço meu propósito divino', 'Cada passo que dou está alinhado com minha missão'],
  },
  {
    id: 'paz',
    name: 'Paz',
    namePt: 'Paz',
    element: 'Água',
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    orixa: ['Oxalá', 'Iemanjá'],
    description: 'Manifestações relacionadas a serenidade, equilíbrio e harmonia interior.',
    affirmations: ['Paz habita em meu coração', 'A serenidade é meu estado natural'],
  },
];

// ─── Priority Correlations ──────────────────────────────────────────────
const PRIORITY_CORRELATIONS: Record<PriorityLevel, { sefirot: string[], chakra: number, element: string }> = {
  high: { sefirot: ['Gevurah', 'Kether'], chakra: 3, element: 'Fogo' },
  medium: { sefirot: ['Tipheret', 'Yesod'], chakra: 5, element: 'Ar' },
  low: { sefirot: ['Malkuth', 'Chesed'], chakra: 1, element: 'Terra' },
};

// ─── In-memory manifestation store ──────────────────────────────────────
interface Manifestation {
  id: string;
  userId: string;
  intention: string;
  description: string;
  status: ManifestationStatus;
  priority: PriorityLevel;
  createdAt: string;
  updatedAt: string;
  targetDate?: string;
  category?: string;
  tags: string[];
  affirmations: string[];
  gratitudeStatements: string[];
  actionSteps: string[];
  progress: number;
  lastReinforced?: string;
  reinforcementCount: number;
  sefirot?: string[];
  chakra?: number;
  element?: string;
  orixa?: string[];
}

interface ManifestationRequest {
  intention: string;
  description?: string;
  priority?: PriorityLevel;
  targetDate?: string;
  category?: string;
  tags?: string[];
  affirmations?: string[];
  gratitudeStatements?: string[];
  actionSteps?: string[];
  sefirot?: string[];
  chakra?: number;
  element?: string;
  orixa?: string[];
}

const manifestationStore: Map<string, Manifestation[]> = new Map();

// ─── Helper Functions ──────────────────────────────────────────────────────
function generateId(): string {
  return `manifest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getUserManifestations(userId: string): Manifestation[] {
  return manifestationStore.get(userId) || [];
}

function findCategoryCorrelations(category: string) {
  return MANIFESTATION_CATEGORIES.find(c =>
    c.id === category.toLowerCase() ||
    c.namePt.toLowerCase() === category.toLowerCase()
  );
}

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams();

    const parseResult = ManifestationQuerySchema.safeParse({
      userId: searchParams.get('userId'),
      status: searchParams.get('status'),
      priority: searchParams.get('priority'),
      category: searchParams.get('category'),
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

    const { userId, status, priority, category, sefirot, chakra, element, orixa } = parseResult.data;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId é obrigatório',
      }, { status: 400 });
    }

    let manifestations = getUserManifestations(userId);

    // Filter by status
    if (status) {
      manifestations = manifestations.filter(m => m.status === status);
    }

    // Filter by priority
    if (priority) {
      manifestations = manifestations.filter(m => m.priority === priority);
    }

    // Filter by category
    if (category) {
      manifestations = manifestations.filter(m => m.category === category);
    }

    // Filter by spiritual correlations
    if (sefirot) {
      manifestations = manifestations.filter(m => m.sefirot?.includes(sefirot));
    }
    if (chakra) {
      manifestations = manifestations.filter(m => m.chakra === chakra);
    }
    if (element) {
      manifestations = manifestations.filter(m => m.element === element);
    }
    if (orixa) {
      manifestations = manifestations.filter(m => m.orixa?.some(o => o.toLowerCase().includes(orixa.toLowerCase())));
    }

    // Statistics
    const stats = {
      byStatus: manifestations.reduce((acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPriority: manifestations.reduce((acc, m) => {
        acc[m.priority] = (acc[m.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: manifestations.reduce((acc, m) => {
        if (m.category) {
          acc[m.category] = (acc[m.category] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      byElement: manifestations.reduce((acc, m) => {
        if (m.element) {
          acc[m.element] = (acc[m.element] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      totalManifestations: manifestations.length,
      activeCount: manifestations.filter(m => m.status === 'active').length,
      manifestedCount: manifestations.filter(m => m.status === 'manifested').length,
    };

    return NextResponse.json({
      success: true,
      manifestations,
      categories: MANIFESTATION_CATEGORIES,
      total: manifestations.length,
      stats,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = CreateManifestationSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const {
      intention,
      description,
      priority,
      targetDate,
      category,
      tags,
      affirmations,
      gratitudeStatements,
      actionSteps,
      sefirot,
      chakra,
      element,
      orixa,
    } = parseResult.data;

    // Find category correlations
    const categoryCorr = category ? findCategoryCorrelations(category) : undefined;

    // Get priority correlations
    const priorityCorr = PRIORITY_CORRELATIONS[priority || 'medium'];

    // Create manifestation
    const now = new Date().toISOString();
    const manifestation: Manifestation = {
      id: generateId(),
      userId: crypto.randomUUID(),
      intention,
      description: description || '',
      status: 'active',
      priority: priority || 'medium',
      createdAt: now,
      updatedAt: now,
      targetDate,
      category,
      tags: tags || [],
      affirmations: affirmations || [],
      gratitudeStatements: gratitudeStatements || [],
      actionSteps: actionSteps || [],
      progress: 0,
      reinforcementCount: 0,
      sefirot: sefirot || categoryCorr?.sefirot || priorityCorr.sefirot,
      chakra: chakra || categoryCorr?.chakra || priorityCorr.chakra,
      element: element || categoryCorr?.element || priorityCorr.element,
      orixa: orixa || categoryCorr?.orixa,
    };

    // Store manifestation
    const userId = manifestation.userId;
    const userManifestations = getUserManifestations(userId);
    userManifestations.push(manifestation);
    manifestationStore.set(userId, userManifestations);

    return NextResponse.json({
      success: true,
      manifestation,
      spiritualCorrelations: {
        sefirot: manifestation.sefirot,
        chakra: manifestation.chakra,
        element: manifestation.element,
        orixa: manifestation.orixa,
        categoryCorrelations: categoryCorr,
      },
    }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, progress, reinforcementCount } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'id é obrigatório',
      }, { status: 400 });
    }

    // Find and update manifestation
    let found = false;
    for (const [userId, manifestations] of manifestationStore.entries()) {
      const index = manifestations.findIndex(m => m.id === id);
      if (index !== -1) {
        if (status) manifestations[index].status = status;
        if (progress !== undefined) manifestations[index].progress = progress;
        if (reinforcementCount !== undefined) manifestations[index].reinforcementCount = reinforcementCount;
        manifestations[index].updatedAt = new Date().toISOString();
        found = true;
        break;
      }
    }

    if (!found) {
      return NextResponse.json({
        success: false,
        error: 'Manifestação não encontrada',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Manifestação atualizada',
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}