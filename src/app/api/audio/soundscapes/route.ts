import { NextRequest, NextResponse } from 'next/server';

export interface Soundscape {
  id: string;
  name: string;
  description: string;
  duration: number;
  category: string;
  elements: string[];
  tags: string[];
  bpm: number;
  frequency: string;
  mood: string;
  url?: string;
  previewUrl?: string;
  format: string;
  size: number;
  createdAt: string;
}

const soundscapes: Soundscape[] = [
  {
    id: 'sc-001',
    name: 'Floresta Sagrada',
    description: 'Uma jornada sonora através de uma floresta mística ao amanhecer',
    duration: 1800,
    category: 'nature',
    elements: ['wind', 'birds', 'leaves', 'stream'],
    tags: ['natureza', 'floresta', 'tranquilidade', 'manhã', 'sagrado'],
    bpm: 60,
    frequency: '432Hz',
    mood: 'peaceful',
    format: 'mp3',
    size: 28500000,
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'sc-002',
    name: 'Templo Tibetano',
    description: 'Sinais de sinos tibetanos e cânticos meditativos em um templo古老的',
    duration: 2400,
    category: 'spiritual',
    elements: ['bells', 'chanting', 'silence', 'wind'],
    tags: ['tibete', 'meditação', 'sagrado', 'reino', 'transformação'],
    bpm: 50,
    frequency: '432Hz',
    mood: 'transcendent',
    format: 'mp3',
    size: 36000000,
    createdAt: '2025-01-20T14:30:00Z',
  },
  {
    id: 'sc-003',
    name: 'Oceano Cósmico',
    description: 'Ondas do oceano misturadas com frequências cósmicas e drones ancestrais',
    duration: 3600,
    category: 'ambient',
    elements: ['waves', 'cosmic', 'drone', 'whales'],
    tags: ['oceano', 'cosmos', 'expansivo', 'meditação profunda', 'abismo'],
    bpm: 40,
    frequency: '396Hz',
    mood: 'expansive',
    format: 'mp3',
    size: 54000000,
    createdAt: '2025-02-01T08:00:00Z',
  },
  {
    id: 'sc-004',
    name: 'Chuva de Cristais',
    description: 'Fontes cristalinas e sinos em uma chuva suave e purificadora',
    duration: 1200,
    category: 'healing',
    elements: ['crystals', 'rain', 'chimes', 'breathing'],
    tags: ['cura', 'cristais', 'purificação', 'reflexão', 'harmonia'],
    bpm: 55,
    frequency: '528Hz',
    mood: 'healing',
    format: 'mp3',
    size: 18000000,
    createdAt: '2025-02-10T16:00:00Z',
  },
  {
    id: 'sc-005',
    name: 'Noite Estrelada',
    description: 'Céu noturno com sons de corujas, vento e silêncios cósmicos',
    duration: 2700,
    category: 'nature',
    elements: ['night', 'owls', 'wind', 'stars'],
    tags: ['noite', 'estrelas', 'mistério', 'introspecção', 'descoberta'],
    bpm: 45,
    frequency: '417Hz',
    mood: 'mysterious',
    format: 'mp3',
    size: 40500000,
    createdAt: '2025-02-15T22:00:00Z',
  },
  {
    id: 'sc-006',
    name: 'Mantras de Shiva',
    description: 'Cânticos sagrados de Shiva para prática de Kundalini',
    duration: 2100,
    category: 'spiritual',
    elements: ['drums', 'chanting', 'temple', 'fire'],
    tags: ['shiva', 'kundalini', 'mantra', 'energia', 'transformação'],
    bpm: 65,
    frequency: '432Hz',
    mood: 'powerful',
    format: 'mp3',
    size: 31500000,
    createdAt: '2025-02-20T18:30:00Z',
  },
  {
    id: 'sc-007',
    name: 'Deserto Interior',
    description: 'Ventos do deserto e silêncios profundos para autoexploração',
    duration: 3000,
    category: 'ambient',
    elements: ['wind', 'silence', 'dunes', 'journey'],
    tags: ['deserto', 'introspecção', 'vazio', 'transformação', 'caminho'],
    bpm: 35,
    frequency: '396Hz',
    mood: 'contemplative',
    format: 'mp3',
    size: 45000000,
    createdAt: '2025-03-01T12:00:00Z',
  },
  {
    id: 'sc-008',
    name: 'Jardim de Lucidez',
    description: ' Sons de jardim zen com água, pássaros e sinos de vento',
    duration: 1500,
    category: 'healing',
    elements: ['fountain', 'birds', 'wind-chimes', 'meditation'],
    tags: ['zen', 'paz', 'jardin', 'equilíbrio', 'harmonia'],
    bpm: 50,
    frequency: '432Hz',
    mood: 'serene',
    format: 'mp3',
    size: 22500000,
    createdAt: '2025-03-05T09:00:00Z',
  },
];

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatSize(bytes: number): string {
  if (bytes >= 1000000) {
    return `${(bytes / 1000000).toFixed(1)}MB`;
  }
  return `${(bytes / 1000).toFixed(0)}KB`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const category = searchParams.get('category');
  const mood = searchParams.get('mood');
  const frequency = searchParams.get('frequency');
  const tags = searchParams.get('tags');
  const duration = searchParams.get('duration');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  if (id) {
    const soundscape = soundscapes.find((s) => s.id === id);
    if (!soundscape) {
      return NextResponse.json(
        { error: 'Soundscape not found', id },
        { status: 404 }
      );
    }
    return NextResponse.json({
      ...soundscape,
      durationFormatted: formatDuration(soundscape.duration),
      sizeFormatted: formatSize(soundscape.size),
    });
  }

  let filtered = [...soundscapes];

  if (category) {
    filtered = filtered.filter(
      (s) => s.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (mood) {
    filtered = filtered.filter(
      (s) => s.mood.toLowerCase() === mood.toLowerCase()
    );
  }

  if (frequency) {
    filtered = filtered.filter(
      (s) => s.frequency.toLowerCase().includes(frequency.toLowerCase())
    );
  }

  if (tags) {
    const tagList = tags.split(',').map((t) => t.trim().toLowerCase());
    filtered = filtered.filter((s) =>
      tagList.some((tag) => s.tags.some((sTag) => sTag.toLowerCase().includes(tag)))
    );
  }

  if (duration) {
    const [min, max] = duration.split('-').map(Number);
    if (!isNaN(min)) {
      filtered = filtered.filter((s) => s.duration >= min * 60);
    }
    if (!isNaN(max)) {
      filtered = filtered.filter((s) => s.duration <= max * 60);
    }
  }

  const total = filtered.length;
  const paginated = filtered.slice(offset, offset + limit);

  const withMetadata = paginated.map((s) => ({
    ...s,
    durationFormatted: formatDuration(s.duration),
    sizeFormatted: formatSize(s.size),
  }));

  return NextResponse.json({
    soundscapes: withMetadata,
    total,
    count: withMetadata.length,
    page: Math.floor(offset / limit) + 1,
    limit,
    filters: {
      category,
      mood,
      frequency,
      tags,
      duration,
    },
  });
}