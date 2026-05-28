// src/app/api/raja/data/route.ts
// Raja API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export type RajaLevel = 'beginner' | 'intermediate' | 'advanced' | 'master';
export type RajaPath = 'jnana' | 'bhakti' | 'karma' | 'raja';

export interface RajaQuery {
  level?: RajaLevel;
  path?: RajaPath;
  limit?: number;
}

export interface Raja {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  level: RajaLevel;
  path: RajaPath;
  practices: string[];
  benefits: string[];
  duration: string;
}

// ============================================================
// RAJA DATA
// ============================================================

const rajaData: Raja[] = [
  {
    id: 'ashtanga',
    name: 'Ashtanga Yoga',
    namePt: 'Yoga Ashtanga',
    description: 'Dynamic eight-limbed practice combining breath, movement, and meditation',
    descriptionPt: 'Prática dinâmica de oito membros combinando respiração, movimento e meditação',
    level: 'advanced',
    path: 'raja',
    practices: ['vinyasa', 'tristhana', 'mula_bandha', 'uddiyana_bandha', 'jalandhara_bandha'],
    benefits: ['strength', 'flexibility', 'discipline', 'meditative_state'],
    duration: '90-120 min',
  },
  {
    id: 'kundalini',
    name: 'Kundalini Yoga',
    namePt: 'Yoga Kundalini',
    description: 'Yoga of awareness combining breath, movement, and chanting',
    descriptionPt: 'Yoga da consciência combinando respiração, movimento e canto',
    level: 'intermediate',
    path: 'raja',
    practices: ['pranayama', 'kriyas', 'mudras', 'bandhas', 'mantras'],
    benefits: ['energy', 'awakening', 'spinal_health', 'psychic_abilities'],
    duration: '60-90 min',
  },
  {
    id: 'hatha',
    name: 'Hatha Yoga',
    namePt: 'Hatha Yoga',
    description: 'Balanced practice of postures, breathing, and meditation',
    descriptionPt: 'Prática equilibrada de posturas, respiração e meditação',
    level: 'beginner',
    path: 'raja',
    practices: ['asanas', 'pranayama', 'mudras', 'bandhas', 'shavasana'],
    benefits: ['balance', 'flexibility', 'relaxation', 'health'],
    duration: '45-60 min',
  },
  {
    id: 'raja-meditation',
    name: 'Raja Meditation',
    namePt: 'Meditação Raja',
    description: 'Royal meditation practice using concentration and awareness',
    descriptionPt: 'Prática de meditação real usando concentração e consciência',
    level: 'intermediate',
    path: 'raja',
    practices: ['concentration', 'awareness', 'mindfulness', 'transcendence'],
    benefits: ['mental_clarity', 'self_realization', 'inner_peace', 'spiritual_growth'],
    duration: '30-60 min',
  },
  {
    id: 'samadhi-practice',
    name: 'Samadhi Practice',
    namePt: 'Prática de Samadhi',
    description: 'Advanced practice for achieving union and absorption',
    descriptionPt: 'Prática avançada para alcançar União e absorção',
    level: 'master',
    path: 'jnana',
    practices: ['deep_meditation', 'non-dual_awareness', 'self_inquiry'],
    benefits: ['enlightenment', 'unity_consciousness', 'liberation', 'transcendence'],
    duration: '2-4 hours',
  },
  {
    id: 'nada-yoga',
    name: 'Nada Yoga',
    namePt: 'Yoga do Som',
    description: 'Yoga of inner sound and vibration',
    descriptionPt: 'Yoga do som interior e vibração',
    level: 'intermediate',
    path: 'bhakti',
    practices: ['inner_sound', 'chanting', 'breath_awareness', 'meditation'],
    benefits: ['inner_harmony', 'sound_perception', 'spiritual_awakening', 'peace'],
    duration: '30-60 min',
  },
  {
    id: 'karma-yoga',
    name: 'Karma Yoga',
    namePt: 'Karma Yoga',
    description: 'Yoga of selfless action and service',
    descriptionPt: 'Yoga da ação altruísta e serviço',
    level: 'beginner',
    path: 'karma',
    practices: ['detached_action', 'service', 'presencer', 'surrender'],
    benefits: ['purification', 'ego_dissolution', 'selfless_service', 'dharma'],
    duration: 'ongoing practice',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllRaja(): Raja[] {
  return rajaData;
}

function getRajaById(id: string): Raja | undefined {
  return rajaData.find(r => r.id === id);
}

function filterRaja(query: RajaQuery): Raja[] {
  let results = [...rajaData];

  if (query.level) {
    results = results.filter(r => r.level === query.level);
  }

  if (query.path) {
    results = results.filter(r => r.path === query.path);
  }

  if (query.limit && query.limit > 0) {
    results = results.slice(0, query.limit);
  }

  return results;
}

function getLevels(): { level: RajaLevel; count: number }[] {
  const levels: RajaLevel[] = ['beginner', 'intermediate', 'advanced', 'master'];
  return levels.map(level => ({
    level,
    count: rajaData.filter(r => r.level === level).length,
  }));
}

function getPaths(): { path: RajaPath; count: number }[] {
  const paths: RajaPath[] = ['jnana', 'bhakti', 'karma', 'raja'];
  return paths.map(path => ({
    path,
    count: rajaData.filter(r => r.path === path).length,
  }));
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/raja/data
 * Retrieve raja yoga data with optional filtering
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const level = searchParams.get('level') as RajaLevel | null;
  const path = searchParams.get('path') as RajaPath | null;
  const id = searchParams.get('id');
  const limitStr = searchParams.get('limit');
  const limit = limitStr ? parseInt(limitStr, 10) : undefined;

  // Single item lookup
  if (id) {
    const raja = getRajaById(id);
    if (!raja) {
      return NextResponse.json(
        { error: 'Raja practice not found', id },
        { status: 404 }
      );
    }
    return NextResponse.json({ raja });
  }

  // Query filtering
  const query: RajaQuery = {};
  if (level && ['beginner', 'intermediate', 'advanced', 'master'].includes(level)) {
    query.level = level;
  }
  if (path && ['jnana', 'bhakti', 'karma', 'raja'].includes(path)) {
    query.path = path;
  }
  if (limit && limit > 0) {
    query.limit = limit;
  }

  const data = query.level || query.path || limit ? filterRaja(query) : getAllRaja();

  return NextResponse.json({
    data,
    meta: {
      total: data.length,
      levels: getLevels(),
      paths: getPaths(),
    },
  });
}