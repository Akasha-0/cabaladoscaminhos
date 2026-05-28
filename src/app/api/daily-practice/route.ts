// ============================================================
// DAILY PRACTICE API - CABALA DOS CAMINHOS
// ============================================================
// GET fetch today's practice
// POST complete/log a practice session
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/error-handling';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface DailyPractice {
  id: string;
  userId: string;
  date: string;
  practiceType: string;
  duration: number;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

interface PracticeTemplate {
  type: string;
  duration: number;
  description: string;
}

// Default daily practice templates
const practiceTemplates: PracticeTemplate[] = [
  { type: 'meditation', duration: 15, description: 'Meditação guiada' },
  { type: 'breathwork', duration: 10, description: 'Respirações conscientes' },
  { type: 'affirmation', duration: 5, description: 'Afirmações positivas' },
  { type: 'gratitude', duration: 5, description: 'Prática de gratidão' },
  { type: 'visualization', duration: 10, description: 'Visualização criativa' },
];

const today = new Date().toISOString().split('T')[0];

export const GET = withErrorHandler(async (req: NextRequest) => {
  const userId = req.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 401 });
  }

  try {
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

    // Fetch user's practices for today
    const { data: practices, error } = await supabase
      .from('daily_practices')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch daily practices:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch practices',
        today,
        templates: practiceTemplates,
        practices: []
      }, { status: 200 });
    }

    // Calculate today's progress
    const completedCount = (practices || []).filter(p => p.completed).length;
    const totalExpected = practiceTemplates.length;
    const progressPercentage = totalExpected > 0 
      ? Math.round((completedCount / totalExpected) * 100) 
      : 0;

    return NextResponse.json({
      date: today,
      templates: practiceTemplates,
      practices: practices || [],
      progress: {
        completed: completedCount,
        total: totalExpected,
        percentage: progressPercentage
      }
    });
  } catch (err) {
    console.error('GET daily-practice error:', err);
    return NextResponse.json({ 
      error: 'Internal server error',
      today,
      templates: practiceTemplates,
      practices: []
    }, { status: 500 });
  }
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const userId = req.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { practiceType, duration, notes, completed = true } = body;

    if (!practiceType) {
      return NextResponse.json({ error: 'Practice type is required' }, { status: 400 });
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

    // Log the practice session
    const { data: practice, error } = await supabase
      .from('daily_practices')
      .insert({
        user_id: userId,
        date: today,
        practice_type: practiceType,
        duration: duration || 0,
        completed,
        notes: notes || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to log practice:', error);
      return NextResponse.json({ error: 'Failed to log practice' }, { status: 500 });
    }

    // Fetch updated practices for today
    const { data: updatedPractices } = await supabase
      .from('daily_practices')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      success: true,
      practice,
      today,
      practices: updatedPractices || [],
      message: 'Prática registrada com sucesso'
    });
  } catch (err) {
    console.error('POST daily-practice error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
