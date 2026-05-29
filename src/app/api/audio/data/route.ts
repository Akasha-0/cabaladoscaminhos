// ============================================================
// AUDIO DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for audio data access
// - Retrieve all audio tracks
// - Get specific audio by ID or name
// - Audio categories and playlists
// - Audio metadata and URLs
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ─── AUDIO INTERFACES ────────────────────────────────────────────────────────

interface AudioTrack {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  duration?: number;
  url: string;
  format: string;
  tags: string[];
  orixa?: string;
  chakra?: number;
  element?: string;
}

interface AudioCategory {
  id: string;
  name: string;
  description: string;
  subcategories: string[];
  trackCount: number;
}

// ─── AUDIO CATEGORIES DATA ────────────────────────────────────────────────────

const AUDIO_CATEGORIES: AudioCategory[] = [
  {
    id: 'meditation',
    name: 'Meditação',
    description: 'Áudios para práticas de meditação e silêncio interior',
    subcategories: ['guiada', 'sons-natureza', 'binaural', 'mantras'],
    trackCount: 0,
  },
  {
    id: 'affirmations',
    name: 'Afirmações',
    description: 'Áudios de afirmações positivas para transformação pessoal',
    subcategories: ['amor-proprio', 'prosperidade', 'saude', 'protecao'],
    trackCount: 0,
  },
  {
    id: 'ritual',
    name: 'Rituais',
    description: 'Áudios para acompanhamento de rituais e ceremonies',
    subcategories: ['abertura', 'fechamento', 'oferendas', 'invocacao'],
    trackCount: 0,
  },
  {
    id: 'astrology',
    name: 'Astrologia',
    description: 'Áudios relacionados a ciclos astrológicos',
    subcategories: ['planetas', 'aspectos', 'trânsitos', ' прогнозы'],
    trackCount: 0,
  },
  {
    id: 'sleep',
    name: 'Sono',
    description: 'Áudios para relaxamento e preparação para o sono',
    subcategories: ['relaxamento', 'historias', 'sons-ambiente', ' frequencies'],
    trackCount: 0,
  },
  {
    id: 'healing',
    name: 'Cura',
    description: 'Áudios para processos de cura energética',
    subcategories: ['reiki', 'chacras', 'cristais', 'orixás'],
    trackCount: 0,
  },
];

// ─── AUDIO TRACKS DATA ────────────────────────────────────────────────────────

const AUDIO_TRACKS: AudioTrack[] = [
  // Meditação tracks
  {
    id: 'med-001',
    name: 'Meditação do Silêncio',
    category: 'meditation',
    subcategory: 'guiada',
    description: 'Uma jornada interior para encontrar a paz no silêncio',
    duration: 900,
    url: '/audio/meditacao-silencio.mp3',
    format: 'mp3',
    tags: ['silêncio', 'paz', 'introspecção', 'iniciantes'],
  },
  {
    id: 'med-002',
    name: 'Sons da Natureza - Floresta',
    category: 'meditation',
    subcategory: 'sons-natureza',
    description: 'Ambiente natural de floresta com pássaros e vento',
    duration: 3600,
    url: '/audio/floresta-natureza.mp3',
    format: 'mp3',
    tags: ['natureza', 'floresta', 'relaxamento', 'ambiente'],
  },
  {
    id: 'med-003',
    name: 'Frequências Binaurais - Alfa',
    category: 'meditation',
    subcategory: 'binaural',
    description: 'Ondas alfa (8-12Hz) para relaxamento e criatividade',
    duration: 1800,
    url: '/audio/binaural-alfa.mp3',
    format: 'mp3',
    tags: ['binaural', 'alfa', 'criatividade', 'frequência'],
  },
  {
    id: 'med-004',
    name: 'Om Meditation',
    category: 'meditation',
    subcategory: 'mantras',
    description: 'Canto do mantra Om para elevação espiritual',
    duration: 600,
    url: '/audio/om-mantra.mp3',
    format: 'mp3',
    tags: ['mantra', 'om', 'elevação', 'tradição'],
  },
  // Afirmações tracks
  {
    id: 'afm-001',
    name: 'Amor Próprio - manhã',
    category: 'affirmations',
    subcategory: 'amor-proprio',
    description: 'Afirmações para iniciar o dia com amor próprio',
    duration: 300,
    url: '/audio/afirmacoes-amor-proprio-manha.mp3',
    format: 'mp3',
    tags: ['amor-próprio', 'manhã', 'transformação', ' energia-positiva'],
    chakra: 4,
  },
  {
    id: 'afm-002',
    name: 'Prosperidade e Abundância',
    category: 'affirmations',
    subcategory: 'prosperidade',
    description: 'Afirmações para abrir caminhos para a prosperidade',
    duration: 420,
    url: '/audio/afirmacoes-prosperidade.mp3',
    format: 'mp3',
    tags: ['prosperidade', 'abundância', 'dinheiro', 'manifestação'],
    orixa: 'Oxum',
  },
  {
    id: 'afm-003',
    name: 'Saúde e Vitalidade',
    category: 'affirmations',
    subcategory: 'saude',
    description: 'Afirmações para fortalecer corpo e mente',
    duration: 360,
    url: '/audio/afirmacoes-saude.mp3',
    format: 'mp3',
    tags: ['saúde', 'vitalidade', 'corpo', 'energia'],
    orixa: 'Oxosse',
    chakra: 3,
  },
  {
    id: 'afm-004',
    name: 'Proteção Energética',
    category: 'affirmations',
    subcategory: 'protecao',
    description: 'Afirmações para fortalecer sua aura de proteção',
    duration: 480,
    url: '/audio/afirmacoes-protecao.mp3',
    format: 'mp3',
    tags: ['proteção', 'aura', 'segurança', 'defesa'],
    orixa: 'Ogum',
    chakra: 1,
  },
  // Rituais tracks
  {
    id: 'rit-001',
    name: 'Ritual de Abertura',
    category: 'ritual',
    subcategory: 'abertura',
    description: 'Tom de abertura para rituais e ceremonies',
    duration: 180,
    url: '/audio/ritual-abertura.mp3',
    format: 'mp3',
    tags: ['ritual', 'abertura', 'cerimônia', 'início'],
    element: 'fogo',
  },
  {
    id: 'rit-002',
    name: 'Ritual de Fechamento',
    category: 'ritual',
    subcategory: 'fechamento',
    description: 'Tom de encerramento para práticas espirituais',
    duration: 180,
    url: '/audio/ritual-fechamento.mp3',
    format: 'mp3',
    tags: ['ritual', 'fechamento', 'cerimônia', 'conclusão'],
    element: 'água',
  },
  {
    id: 'rit-003',
    name: 'Oferendas para Oxum',
    category: 'ritual',
    subcategory: 'oferendas',
    description: 'Música ceremonial para oferendas a Oxum',
    duration: 600,
    url: '/audio/oferendas-oxum.mp3',
    format: 'mp3',
    tags: ['oferendas', 'oxum', 'água', 'amor'],
    orixa: 'Oxum',
    element: 'água',
  },
  {
    id: 'rit-004',
    name: 'Invocação de Oxalá',
    category: 'ritual',
    subcategory: 'invocacao',
    description: 'Cântico sagrado para invocar Oxalá',
    duration: 420,
    url: '/audio/invocacao-oxala.mp3',
    format: 'mp3',
    tags: ['invocação', 'oxalá', 'paz', 'criação'],
    orixa: 'Obatalá',
    element: 'ar',
  },
  // Astrologia tracks
  {
    id: 'ast-001',
    name: 'Meditação do Sol',
    category: 'astrology',
    subcategory: 'planetas',
    description: 'Energia solar para vitalidade e autoconfiança',
    duration: 600,
    url: '/audio/meditacao-sol.mp3',
    format: 'mp3',
    tags: ['sol', 'planeta', 'vitalidade', 'ego'],
  },
  {
    id: 'ast-002',
    name: 'Energia Lunar',
    category: 'astrology',
    subcategory: 'planetas',
    description: 'Conexão com a energia da lua',
    duration: 720,
    url: '/audio/energia-lunar.mp3',
    format: 'mp3',
    tags: ['lua', 'planeta', 'intuição', 'emocional'],
    chakra: 6,
  },
  // Sono tracks
  {
    id: 'slp-001',
    name: 'Relaxamento Profundo',
    category: 'sleep',
    subcategory: 'relaxamento',
    description: 'Exercício de relaxamento para preparar o corpo para o sono',
    duration: 1200,
    url: '/audio/relaxamento-profundo.mp3',
    format: 'mp3',
    tags: ['relaxamento', 'sono', 'noite', 'descanso'],
  },
  {
    id: 'slp-002',
    name: 'Sons do Oceano',
    category: 'sleep',
    subcategory: 'sons-ambiente',
    description: 'Som ambiente de ondas do mar',
    duration: 3600,
    url: '/audio/sons-oceano.mp3',
    format: 'mp3',
    tags: ['oceano', 'ondas', 'ambiente', 'mar'],
  },
  // Cura tracks
  {
    id: 'heal-001',
    name: 'Cura dos Chakras',
    category: 'healing',
    subcategory: 'chacras',
    description: 'Meditação guiada para equilibrar os chakras',
    duration: 1200,
    url: '/audio/cura-chakras.mp3',
    format: 'mp3',
    tags: ['chakras', 'cura', 'equilíbrio', 'energia'],
  },
  {
    id: 'heal-002',
    name: 'Frequência de Cura - 528Hz',
    category: 'healing',
    subcategory: 'frequencies',
    description: 'A frequência do amor e da transformação',
    duration: 900,
    url: '/audio/frequencia-528hz.mp3',
    format: 'mp3',
    tags: ['528hz', 'frequência', 'cura', 'amor'],
    chakra: 4,
  },
];

// ─── GET HANDLER ─────────────────────────────────────────────────────────────

// GET /api/audio/data - Get audio data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const track = searchParams.get('track');
    const name = searchParams.get('name');
    const orixa = searchParams.get('orixa');
    const element = searchParams.get('element');
    const chakra = searchParams.get('chakra');

    // Return specific track by ID
    if (track) {
      const trackData = AUDIO_TRACKS.find((t) => t.id === track);
      if (trackData) {
        return NextResponse.json({ success: true, data: trackData });
      }
      return NextResponse.json(
        { success: false, error: 'Track not found' },
        { status: 404 }
      );
    }

    // Return track by name
    if (name) {
      const trackName = name.toLowerCase().replace(/[^a-záéíóúàèìòùâêîôûãõç\s]/g, '').trim();
      const foundTrack = AUDIO_TRACKS.find((t) =>
        t.name.toLowerCase().includes(trackName) ||
        trackName.includes(t.name.toLowerCase())
      );
      if (foundTrack) {
        return NextResponse.json({ success: true, data: foundTrack });
      }
      return NextResponse.json(
        { success: false, error: 'Track not found' },
        { status: 404 }
      );
    }

    // Return tracks filtered by orixá
    if (orixa) {
      const filteredTracks = AUDIO_TRACKS.filter((t) =>
        t.orixa?.toLowerCase() === orixa.toLowerCase()
      );
      return NextResponse.json({ success: true, data: filteredTracks });
    }

    // Return tracks filtered by element
    if (element) {
      const filteredTracks = AUDIO_TRACKS.filter((t) =>
        t.element?.toLowerCase() === element.toLowerCase()
      );
      return NextResponse.json({ success: true, data: filteredTracks });
    }

    // Return tracks filtered by chakra
    if (chakra) {
      const chakraNum = parseInt(chakra, 10);
      if (!isNaN(chakraNum)) {
        const filteredTracks = AUDIO_TRACKS.filter((t) => t.chakra === chakraNum);
        return NextResponse.json({ success: true, data: filteredTracks });
      }
    }

    // Return specific audio data by ID
    if (id) {
      // Check for categories
      if (id === 'categories' || id === 'categorias') {
        return NextResponse.json({ success: true, data: AUDIO_CATEGORIES });
      }
      if (id === 'all' || id === 'todos') {
        return NextResponse.json({
          success: true,
          data: {
            categories: AUDIO_CATEGORIES,
            tracks: AUDIO_TRACKS,
            total: AUDIO_TRACKS.length,
            totalCategories: AUDIO_CATEGORIES.length,
          },
        });
      }
      if (id === 'elements') {
        return NextResponse.json({
          success: true,
          data: ['fogo', 'água', 'ar', 'terra'],
        });
      }
      if (id === 'orixas') {
        const uniqueOrixas = [...new Set(AUDIO_TRACKS.filter(t => t.orixa).map(t => t.orixa))];
        return NextResponse.json({ success: true, data: uniqueOrixas });
      }

      // Try finding track by ID
      const trackData = AUDIO_TRACKS.find((t) => t.id === id);
      if (trackData) {
        return NextResponse.json({ success: true, data: trackData });
      }

      // Try finding by name
      const trackName = id.toLowerCase().replace(/[^a-záéíóúàèìòùâêîôûãõç\s]/g, '').trim();
      const foundTrack = AUDIO_TRACKS.find((t) =>
        t.name.toLowerCase().includes(trackName) ||
        trackName.includes(t.name.toLowerCase())
      );
      if (foundTrack) {
        return NextResponse.json({ success: true, data: foundTrack });
      }

      return NextResponse.json(
        { success: false, error: 'Audio data not found' },
        { status: 404 }
      );
    }

    // Return specific type of audio data
    if (type) {
      if (type === 'categories' || type === 'categorias') {
        return NextResponse.json({ success: true, data: AUDIO_CATEGORIES });
      }
      if (type === 'all' || type === 'todos') {
        return NextResponse.json({
          success: true,
          data: {
            categories: AUDIO_CATEGORIES,
            tracks: AUDIO_TRACKS,
            total: AUDIO_TRACKS.length,
            totalCategories: AUDIO_CATEGORIES.length,
          },
        });
      }
      if (type === 'elements') {
        return NextResponse.json({
          success: true,
          data: ['fogo', 'água', 'ar', 'terra'],
        });
      }
      if (type === 'orixas') {
        const uniqueOrixas = [...new Set(AUDIO_TRACKS.filter(t => t.orixa).map(t => t.orixa))];
        return NextResponse.json({ success: true, data: uniqueOrixas });
      }
      if (type === 'names' || type === 'nomes') {
        return NextResponse.json({
          success: true,
          data: AUDIO_TRACKS.map((t) => ({ id: t.id, name: t.name, category: t.category })),
        });
      }
    }

    // Return tracks by category
    if (category) {
      const categoryTracks = AUDIO_TRACKS.filter((t) => t.category === category);
      const categoryInfo = AUDIO_CATEGORIES.find((c) => c.id === category);
      return NextResponse.json({
        success: true,
        data: {
          category: categoryInfo || { id: category, name: category },
          tracks: categoryTracks,
          total: categoryTracks.length,
        },
      });
    }

    // Default: return all audio data
    return NextResponse.json({
      success: true,
      data: {
        categories: AUDIO_CATEGORIES,
        tracks: AUDIO_TRACKS,
        total: AUDIO_TRACKS.length,
        totalCategories: AUDIO_CATEGORIES.length,
      },
    });
  } catch (error) {
    console.error('Audio Data API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}