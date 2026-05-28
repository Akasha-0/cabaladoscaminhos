import { NextRequest, NextResponse } from 'next/server';
import { getData } from '@/lib/orixa/yemoja-data';

export type YemojaLevel = 'initiate' | 'practitioner' | 'adept' | 'master';

export interface YemojaQuery {
  level?: YemojaLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Yemoja {
  id: string;
  name: string;
  namePortuguese: string;
  path: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
  archetype: string;
  qualities: string[];
  challenges: string[];
  rulingPlanet: string;
  sacredAnimals: string[];
  plants: string[];
  offerings: string[];
  chants: string[];
  symbols: string[];
  mythology: string;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  practices: string[];
  symbol: string;
  rituals: string[];
  level: YemojaLevel;
}

const yemojaData = getData();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level') as YemojaLevel | null;
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  let results = yemojaData.map(d => ({
    ...d,
    level: 'initiate' as YemojaLevel,
    practices: ['Águas sagradas', 'Orações'],
    symbol: '☀',
    rituals: ['Banho de sal']
  }));

  if (level) {
    results = results.filter(e => e.level === level);
  }

  if (search) {
    const term = search.toLowerCase();
    results = results.filter(e =>
      e.name.toLowerCase().includes(term) ||
      e.namePortuguese.toLowerCase().includes(term)
    );
  }

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = results.slice(start, end);

  return NextResponse.json({
    data: paginated,
    total: results.length,
    page,
    limit
  });
}
