// ============================================================
// AUDIO SOUNDSCAPES API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SoundscapeCategorySchema = z.enum(['nature', 'spiritual', 'ambient', 'healing', 'meditation', 'ritual']);
const SoundscapeMoodSchema = z.enum([
  'peaceful', 'transcendent', 'expansive', 'healing', 'mysterious',
  'powerful', 'contemplative', 'serene', 'mystical', 'transformative'
]);
const FrequencySchema = z.enum(['396Hz', '417Hz', '432Hz', '528Hz', '639Hz', '741Hz', '852Hz']);

const SoundscapeQuerySchema = z.object({
  id: z.string().optional(),
  category: SoundscapeCategorySchema.optional(),
  mood: SoundscapeMoodSchema.optional(),
  frequency: z.string().optional(),
  tags: z.string().optional(),
  duration: z.string().optional(),
  orixa: z.string().optional(),
  sefirot: z.string().optional(),
  chakra: z.coerce.number().int().min(1).max(7).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const SoundscapeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  duration: z.number().int().positive(),
  category: SoundscapeCategorySchema,
  elements: z.array(z.string()),
  tags: z.array(z.string()),
  bpm: z.number().int().min(1).max(200),
  frequency: FrequencySchema,
  mood: SoundscapeMoodSchema,
  url: z.string().url().optional(),
  previewUrl: z.string().url().optional(),
  format: z.string(),
  size: z.number().int().positive(),
  createdAt: z.string(),
  // Spiritual correlations
  sefirot: z.array(z.string()).optional(),
  orixa: z.string().optional(),
  chakra: z.array(z.number()).optional(),
  tradicao: z.string().optional(),
  propsito: z.string().optional(),
});

// ─── Type Definitions ───────────────────────────────────────────────────────
interface Soundscape {
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
  // Spiritual correlations
  sefirot?: string[];
  orixa?: string;
  chakra?: number[];
  tradicao?: string;
  propsito?: string;
}

export const dynamic = 'force-dynamic';

// ─── Soundscapes Data ───────────────────────────────────────────────────────
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
    sefirot: ['Netzach', 'Hod'],
    orixa: 'Oxum',
    chakra: [2, 4],
    tradicao: 'Candomblé/Umbanda',
    propsito: 'Conexão com a natureza e paz interior',
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
    sefirot: ['Kether', 'Tipheret'],
    orixa: 'Oxalá',
    chakra: [7, 6],
    tradicao: 'Budismo Tibetano',
    propsito: 'Iluminação e transcendência espiritual',
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
    sefirot: ['Yesod', 'Chokhmah'],
    orixa: 'Iemanjá',
    chakra: [2, 6],
    tradicao: 'Tradições Aquáticas',
    propsito: 'Expansão da consciência e conexão com o inconsciente',
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
    sefirot: ['Chesed', 'Tipheret'],
    orixa: 'Oxum',
    chakra: [4, 5],
    tradicao: 'Cristaloterapia',
    propsito: 'Harmonização energética e cura vibrational',
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
    sefirot: ['Binah', 'Daat'],
    orixa: 'Oxumaré',
    chakra: [6, 7],
    tradicao: 'Astrologia Mística',
    propsito: 'Revelação de mistérios e autoconhecimento',
  },
  {
    id: 'sc-006',
    name: 'Mantras de Shiva',
    description: 'Cânticos sagrados de Shiva para prática de Kundalini',
    duration: 2100,
    category: 'ritual',
    elements: ['drums', 'chanting', 'temple', 'fire'],
    tags: ['shiva', 'kundalini', 'mantra', 'energia', 'transformação'],
    bpm: 65,
    frequency: '432Hz',
    mood: 'powerful',
    format: 'mp3',
    size: 31500000,
    createdAt: '2025-02-20T18:30:00Z',
    sefirot: ['Gevurah', 'Hod'],
    orixa: 'Ogum',
    chakra: [1, 3, 4],
    tradicao: 'Tantra/Yoga',
    propsito: 'Ativação da Kundalini e transformação de energia',
  },
  {
    id: 'sc-007',
    name: 'Deserto Interior',
    description: 'Ventos do deserto e silêncios profundos para autoexploração',
    duration: 3000,
    category: 'meditation',
    elements: ['wind', 'silence', 'dunes', 'journey'],
    tags: ['deserto', 'introspecção', 'vazio', 'transformação', 'caminho'],
    bpm: 35,
    frequency: '396Hz',
    mood: 'contemplative',
    format: 'mp3',
    size: 45000000,
    createdAt: '2025-03-01T12:00:00Z',
    sefirot: ['Malkuth', 'Binah'],
    orixa: 'Omolu',
    chakra: [1, 2],
    tradicao: 'Caminho Interior',
    propsito: 'Purificação e jornadas de autoconhecimento',
  },
  {
    id: 'sc-008',
    name: 'Jardim de Lucidez',
    description: 'Sons de jardim zen com água, pássaros e sinos de vento',
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
    sefirot: ['Tipheret', 'Netzach'],
    orixa: 'Obatalá',
    chakra: [4, 5, 6],
    tradicao: 'Zen Budismo',
    propsito: 'Equilíbrio e harmonia interior',
  },
  {
    id: 'sc-009',
    name: 'Ritual de Xangô',
    description: 'Tambores sagrados e cânticos de Xangô para proteção e justiça',
    duration: 1800,
    category: 'ritual',
    elements: ['drums', 'fire', 'chanting', 'rhythm'],
    tags: ['xango', 'ritual', 'proteção', 'justiça', 'força'],
    bpm: 80,
    frequency: '432Hz',
    mood: 'powerful',
    format: 'mp3',
    size: 27000000,
    createdAt: '2025-03-10T19:00:00Z',
    sefirot: ['Gevurah', 'Chesed'],
    orixa: 'Xangô',
    chakra: [3, 4],
    tradicao: 'Candomblé',
    propsito: 'Proteção, justiça e força de vontade',
  },
  {
    id: 'sc-010',
    name: 'Sons de Nanã',
    description: 'Águas calmas e sons de lama para purificação e humildade',
    duration: 2400,
    category: 'meditation',
    elements: ['water', 'mud', 'silence', 'rain'],
    tags: ['nana', 'purificação', 'humildade', 'sabedoria', 'ancestral'],
    bpm: 30,
    frequency: '639Hz',
    mood: 'contemplative',
    format: 'mp3',
    size: 36000000,
    createdAt: '2025-03-15T06:00:00Z',
    sefirot: ['Binah', 'Malkuth'],
    orixa: 'Nanã Buruku',
    chakra: [1, 2, 7],
    tradicao: 'Candomblé',
    propsito: 'Purificação do ego e sabedoria ancestral',
  },
];

// ─── Utility Functions ───────────────────────────────────────────────────────
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

// ─── API Routes ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const parseResult = SoundscapeQuerySchema.safeParse({
      id: searchParams.get('id'),
      category: searchParams.get('category'),
      mood: searchParams.get('mood'),
      frequency: searchParams.get('frequency'),
      tags: searchParams.get('tags'),
      duration: searchParams.get('duration'),
      orixa: searchParams.get('orixa'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const {
      id, category, mood, frequency, tags, duration,
      orixa, sefirot, chakra, limit = 50, offset = 0
    } = parseResult.data;

    // Return single soundscape
    if (id) {
      const soundscape = soundscapes.find((s) => s.id === id);
      if (!soundscape) {
        return NextResponse.json({
          success: false,
          error: 'Soundscape não encontrado',
          availableIds: soundscapes.map(s => s.id),
        }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        ...soundscape,
        durationFormatted: formatDuration(soundscape.duration),
        sizeFormatted: formatSize(soundscape.size),
      });
    }

    let filtered = [...soundscapes];

    // Apply filters
    if (category) {
      filtered = filtered.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }

    if (mood) {
      filtered = filtered.filter((s) => s.mood.toLowerCase() === mood.toLowerCase());
    }

    if (frequency) {
      filtered = filtered.filter((s) => s.frequency.toLowerCase().includes(frequency.toLowerCase()));
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

    // Spiritual filters
    if (orixa) {
      filtered = filtered.filter((s) =>
        s.orixa?.toLowerCase().includes(orixa.toLowerCase())
      );
    }

    if (sefirot) {
      filtered = filtered.filter((s) =>
        s.sefirot?.some(sf => sf.toLowerCase().includes(sefirot.toLowerCase()))
      );
    }

    if (chakra) {
      filtered = filtered.filter((s) =>
        s.chakra?.includes(chakra)
      );
    }

    // Pagination
    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    const withMetadata = paginated.map((s) => ({
      ...s,
      durationFormatted: formatDuration(s.duration),
      sizeFormatted: formatSize(s.size),
    }));

    // Statistics
    const stats = {
      byCategory: soundscapes.reduce((acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byMood: soundscapes.reduce((acc, s) => {
        acc[s.mood] = (acc[s.mood] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byFrequency: soundscapes.reduce((acc, s) => {
        acc[s.frequency] = (acc[s.frequency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: soundscapes.reduce((acc, s) => {
        if (s.orixa) acc[s.orixa] = (acc[s.orixa] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
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
        orixa,
        sefirot,
        chakra,
      },
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