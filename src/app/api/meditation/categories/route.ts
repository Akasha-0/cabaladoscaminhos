import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const MeditationCategoriesQuerySchema = z.object({
  id: z.string().optional(),
  popular: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});
export interface MeditationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  meditationCount: number;
  popular: boolean;
}
const categories: MeditationCategory[] = [
  {
    id: 'focused',
    name: 'Focused Attention',
    description: 'Cultivate deep concentration and mindfulness',
    icon: 'target',
    color: '#8b5cf6',
    meditationCount: 24,
    popular: true,
  },
  {
  {
    id: 'breathing',
    name: 'Breathing Exercises',
    description: 'Focused breathing techniques for stress relief',
    icon: 'wind',
    color: '#06b6d4',
    meditationCount: 18,
    popular: true,
  },
  {
    id: 'body-scan',
    name: 'Body Scan',
    description: 'Progressive relaxation from head to toe',
    icon: 'scan',
    color: '#10b981',
    meditationCount: 12,
    popular: false,
  },
  {
    id: 'visualization',
    name: 'Visualization',
    description: 'Guided imagery and creative visualization',
    icon: 'eye',
    color: '#8b5cf6',
    meditationCount: 15,
    popular: true,
  },
  {
    id: 'sleep',
    name: 'Sleep Meditation',
    description: 'Deep relaxation for better sleep quality',
    icon: 'moon',
    color: '#3b82f6',
    meditationCount: 20,
    popular: true,
  },
  {
    id: 'focus',
    name: 'Focus & Concentration',
    description: 'Enhance mental clarity and concentration',
    icon: 'target',
    color: '#f59e0b',
    meditationCount: 10,
    popular: false,
  },
  {
    id: 'compassion',
    name: 'Compassion & Love',
    description: 'Loving-kindness and compassion practices',
    icon: 'heart',
    color: '#ec4899',
    meditationCount: 8,
    popular: false,
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Present moment awareness practices',
    icon: 'leaf',
    color: '#84cc16',
    meditationCount: 16,
    popular: true,
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get('id');
  const popularOnly = searchParams.get('popular') === 'true';

  if (categoryId) {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(category);
  }

  let filteredCategories = [...categories];

  if (popularOnly) {
    filteredCategories = filteredCategories.filter((c) => c.popular);
  }

  const total = categories.length;

  return NextResponse.json({
    categories: filteredCategories,
    total,
    popularCount: categories.filter((c) => c.popular).length,
  });
}