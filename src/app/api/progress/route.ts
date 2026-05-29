// ============================================================
// PROGRESS API - CABALA DOS CAMINHOS
// ============================================================
// GET user progress data
// POST track progress updates
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/error-handling';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface ProgressEntry {
  id: string;
  userId: string;
  type: string;
  category: string;
  value: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface ProgressSummary {
  totalEntries: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  recentEntries: ProgressEntry[];
  streak: number;
  lastActivity: string | null;
}

// In-memory progress tracking
const progressStore: Map<string, ProgressEntry[]> = new Map();

function getUserProgress(userId: string): ProgressEntry[] {
  return progressStore.get(userId) || [];
}

function calculateProgressSummary(userId: string): ProgressSummary {
  const entries = getUserProgress(userId);
  
  const byCategory: Record<string, number> = {};
  const byType: Record<string, number> = {};
  
  for (const entry of entries) {
    byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
    byType[entry.type] = (byType[entry.type] || 0) + 1;
  }
  
  // Calculate streak (consecutive days with activity)
  let streak = 0;
  if (entries.length > 0) {
    const sortedDates = [...new Set(entries.map(e => e.createdAt.split('T')[0]))].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      streak = sortedDates.filter((date, i) => {
        const expected = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        return date === expected;
      }).length;
    }
  }
  
  const recentEntries = entries
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);
  
  return {
    totalEntries: entries.length,
    byCategory,
    byType,
    recentEntries,
    streak,
    lastActivity: entries.length > 0 
      ? entries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].updatedAt 
      : null,
  };
}

function addProgressEntry(
  userId: string,
  type: string,
  category: string,
  value: number,
  metadata?: Record<string, unknown>
): ProgressEntry {
  const now = new Date().toISOString();
  const entry: ProgressEntry = {
    id: crypto.randomUUID(),
    userId,
    type,
    category,
    value,
    metadata,
    createdAt: now,
    updatedAt: now,
  };
  
  const userEntries = getUserProgress(userId);
  userEntries.push(entry);
  progressStore.set(userId, userEntries);
  
  return entry;
}

export const GET = withErrorHandler(async (req: NextRequest) => {
  const userId = req.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID required' },
      { status: 401 }
    );
  }
  
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  
  let entries = getUserProgress(userId);
  
  if (category) {
    entries = entries.filter(e => e.category === category);
  }
  
  if (type) {
    entries = entries.filter(e => e.type === type);
  }
  
  // Sort by most recent
  entries = entries.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const total = entries.length;
  const paginatedEntries = entries.slice(offset, offset + limit);
  
  // Also try to fetch from Supabase if configured
  let supabaseData = null;
  try {
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (!error && data) {
      supabaseData = data;
    }
  } catch {
    // Supabase not configured, continue with in-memory data
  }
  
  const summary = calculateProgressSummary(userId);
  
  return NextResponse.json({
    entries: paginatedEntries,
    summary,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
    source: supabaseData ? 'supabase' : 'memory',
  });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const userId = req.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID required' },
      { status: 401 }
    );
  }
  
  try {
    const body = await req.json();
    const { type, category, value, metadata } = body;
    
    if (!type || !category) {
      return NextResponse.json(
        { error: 'Type and category are required' },
        { status: 400 }
      );
    }
    
    const progressValue = typeof value === 'number' ? value : 1;
    const entry = addProgressEntry(userId, type, category, progressValue, metadata);
    
    // Also try to store in Supabase if configured
    try {
      const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);
      await supabase.from('user_progress').insert({
        user_id: userId,
        type,
        category,
        value: progressValue,
        metadata,
      });
    } catch {
      // Supabase not configured, continue with in-memory data
    }
    
    const summary = calculateProgressSummary(userId);
    
    return NextResponse.json({
      entry,
      summary,
      success: true,
    }, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
});