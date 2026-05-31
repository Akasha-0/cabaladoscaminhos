// ============================================================
// MANIFESTATION API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
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
});
const ManifestationQuerySchema = z.object({
  userId: z.string().optional(),
  status: ManifestationStatusSchema.optional(),
  priority: PriorityLevelSchema.optional(),
  category: z.string().optional(),
});
// Type aliases
type ManifestationStatus = z.infer<typeof ManifestationStatusSchema>;
type PriorityLevel = z.infer<typeof PriorityLevelSchema>;
type Manifestation = z.infer<typeof ManifestationSchema>;
// Const enums
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
} as const;

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
}

// In-memory manifestation store (in production, use database)
const manifestationStore: Map<string, Manifestation[]> = new Map();

// Generate unique ID
function generateId(): string {
  return `manifest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get user's manifestations
function getUserManifestations(userId: string): Manifestation[] {
  return manifestationStore.get(userId) || [];
}

// Calculate manifestation progress based on various factors
function calculateProgress(manifestation: Manifestation): number {
  let progress = 0;
  
  // Base progress from reinforcement count (max 30%)
  progress += Math.min(30, manifestation.reinforcementCount * 5);
  
  // Progress from action steps completed (max 40%)
  if (manifestation.actionSteps.length > 0) {
    const completedSteps = manifestation.actionSteps.filter(step => step.startsWith('[x]')).length;
    progress += (completedSteps / manifestation.actionSteps.length) * 40;
  }
  
  // Progress from affirmations written (max 15%)
  if (manifestation.affirmations.length > 0) {
    progress += Math.min(15, manifestation.affirmations.length * 3);
  }
  
  // Progress from gratitude statements (max 15%)
  if (manifestation.gratitudeStatements.length > 0) {
    progress += Math.min(15, manifestation.gratitudeStatements.length * 3);
  }
  
  return Math.min(100, Math.round(progress));
}

// Generate manifestation insights
function generateInsights(manifestations: Manifestation[]): {
  activeCount: number;
  manifestedCount: number;
  averageProgress: number;
  categoryBreakdown: Record<string, number>;
  oldestActive?: Manifestation;
  mostProgressed?: Manifestation;
} {
  const active = manifestations.filter(m => m.status === MANIFESTATION_STATUS.ACTIVE);
  const manifested = manifestations.filter(m => m.status === MANIFESTATION_STATUS.MANIFESTED);
  
  const totalProgress = manifestations.reduce((sum, m) => sum + m.progress, 0);
  
  const categoryBreakdown: Record<string, number> = {};
  manifestations.forEach(m => {
    const category = m.category || 'uncategorized';
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
  });
  
  const sortedByAge = [...active].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  const sortedByProgress = [...active].sort((a, b) => b.progress - a.progress);
  
  return {
    activeCount: active.length,
    manifestedCount: manifested.length,
    averageProgress: manifestations.length > 0 ? Math.round(totalProgress / manifestations.length) : 0,
    categoryBreakdown,
    oldestActive: sortedByAge[0],
    mostProgressed: sortedByProgress[0],
  };
}

// GET - Fetch user manifestations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');
    const status = searchParams.get('status') as ManifestationStatus | null;
    const category = searchParams.get('category');
    const includeInsights = searchParams.get('includeInsights') === 'true';

    // For demo purposes, use a default userId if not provided
    const effectiveUserId = userId || 'demo_user';
    
    let manifestations = getUserManifestations(effectiveUserId);
    
    // Filter by specific ID
    if (id) {
      const found = manifestations.find(m => m.id === id);
      if (!found) {
        return NextResponse.json(
          { error: 'Manifestation not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ manifestation: found });
    }
    
    // Filter by status
    if (status) {
      manifestations = manifestations.filter(m => m.status === status);
    }
    
    // Filter by category
    if (category) {
      manifestations = manifestations.filter(m => m.category === category);
    }
    
    // Sort by creation date (newest first)
    manifestations.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const response: Record<string, unknown> = { manifestations };
    
    if (includeInsights) {
      response.insights = generateInsights(getUserManifestations(effectiveUserId));
    }
    
    return NextResponse.json(response);
    
 } catch (_error) {
    console.error('Error fetching manifestations:', _error);
    return NextResponse.json(
      { error: 'Failed to fetch manifestations' },
      { status: 500 }
    );
  }
}

// POST - Create or update manifestation
export async function POST(request: NextRequest) {
  try {
    const body: ManifestationRequest & { userId?: string; id?: string; action?: string } = await request.json();
    
    const {
      intention,
      description = '',
      priority = PRIORITY_LEVELS.MEDIUM,
      targetDate,
      category,
      tags = [],
      affirmations = [],
      gratitudeStatements = [],
      actionSteps = [],
      userId: requestUserId,
      id,
      action,
    } = body;
    
    if (!intention) {
      return NextResponse.json(
        { error: 'Intention is required' },
        { status: 400 }
      );
    }
    
    const effectiveUserId = requestUserId || 'demo_user';
    const manifestations = getUserManifestations(effectiveUserId);
    
    // Handle different actions
    if (action === 'reinforce' && id) {
      // Reinforce an existing manifestation
      const index = manifestations.findIndex(m => m.id === id);
      if (index === -1) {
        return NextResponse.json(
          { error: 'Manifestation not found' },
          { status: 404 }
        );
      }
      
      const updated: Manifestation = {
        ...manifestations[index],
        reinforcementCount: manifestations[index].reinforcementCount + 1,
        lastReinforced: new Date().toISOString(),
        progress: calculateProgress({
          ...manifestations[index],
          reinforcementCount: manifestations[index].reinforcementCount + 1,
        }),
        updatedAt: new Date().toISOString(),
      };
      
      manifestations[index] = updated;
      manifestationStore.set(effectiveUserId, manifestations);
      
      return NextResponse.json({ manifestation: updated });
    }
    
    if (action === 'update' && id) {
      // Update existing manifestation
      const index = manifestations.findIndex(m => m.id === id);
      if (index === -1) {
        return NextResponse.json(
          { error: 'Manifestation not found' },
          { status: 404 }
        );
      }
      
      const existing = manifestations[index];
      const updated: Manifestation = {
        ...existing,
        intention: intention || existing.intention,
        description: description || existing.description,
        priority: priority || existing.priority,
        targetDate: targetDate || existing.targetDate,
        category: category || existing.category,
        tags: tags.length > 0 ? tags : existing.tags,
        affirmations: affirmations.length > 0 ? affirmations : existing.affirmations,
        gratitudeStatements: gratitudeStatements.length > 0 ? gratitudeStatements : existing.gratitudeStatements,
        actionSteps: actionSteps.length > 0 ? actionSteps : existing.actionSteps,
        progress: calculateProgress({
          ...existing,
          affirmations: affirmations.length > 0 ? affirmations : existing.affirmations,
          gratitudeStatements: gratitudeStatements.length > 0 ? gratitudeStatements : existing.gratitudeStatements,
          actionSteps: actionSteps.length > 0 ? actionSteps : existing.actionSteps,
        }),
        updatedAt: new Date().toISOString(),
      };
      
      manifestations[index] = updated;
      manifestationStore.set(effectiveUserId, manifestations);
      
      return NextResponse.json({ manifestation: updated });
    }
    
    if (action === 'complete' && id) {
      // Mark manifestation as manifested
      const index = manifestations.findIndex(m => m.id === id);
      if (index === -1) {
        return NextResponse.json(
          { error: 'Manifestation not found' },
          { status: 404 }
        );
      }
      
      const updated: Manifestation = {
        ...manifestations[index],
        status: MANIFESTATION_STATUS.MANIFESTED,
        progress: 100,
        updatedAt: new Date().toISOString(),
      };
      
      manifestations[index] = updated;
      manifestationStore.set(effectiveUserId, manifestations);
      
      return NextResponse.json({ manifestation: updated });
    }
    
    if (action === 'release' && id) {
      // Release/let go of manifestation
      const index = manifestations.findIndex(m => m.id === id);
      if (index === -1) {
        return NextResponse.json(
          { error: 'Manifestation not found' },
          { status: 404 }
        );
      }
      
      const updated: Manifestation = {
        ...manifestations[index],
        status: MANIFESTATION_STATUS.RELEASED,
        updatedAt: new Date().toISOString(),
      };
      
      manifestations[index] = updated;
      manifestationStore.set(effectiveUserId, manifestations);
      
      return NextResponse.json({ manifestation: updated });
    }
    
    // Create new manifestation
    const newManifestation: Manifestation = {
      id: generateId(),
      userId: effectiveUserId,
      intention,
      description,
      status: MANIFESTATION_STATUS.ACTIVE,
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      targetDate,
      category,
      tags,
      affirmations,
      gratitudeStatements,
      actionSteps,
      progress: calculateProgress({
        id: '',
        userId: effectiveUserId,
        intention,
        description,
        status: MANIFESTATION_STATUS.ACTIVE,
        priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        targetDate,
        category,
        tags,
        affirmations,
        gratitudeStatements,
        actionSteps,
        progress: 0,
        reinforcementCount: 0,
      }),
      reinforcementCount: 0,
    };
    
    manifestations.push(newManifestation);
    manifestationStore.set(effectiveUserId, manifestations);
    
    return NextResponse.json({ 
      manifestation: newManifestation,
      message: 'Manifestation created successfully' 
    }, { status: 201 });
    
 } catch (_error) {
    console.error('Error creating manifestation:', _error);
    return NextResponse.json(
      { error: 'Failed to create manifestation' },
      { status: 500 }
    );
  }
}
