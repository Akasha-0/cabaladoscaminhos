import { NextRequest, NextResponse } from 'next/server';

export interface AudioTrack {
  id: string;
  name: string;
  description: string;
  duration: number;
  category: string;
  subcategory?: string;
  frequency: string;
  chakra?: string;
  orixa?: string;
  tags: string[];
  url?: string;
  previewUrl?: string;
  format: string;
  bitrate: string;
  size: number;
  createdAt: string;
}

const tracks: AudioTrack[] = [
  {
    id: 'track_001',
    name: 'Om 432Hz - Purificação Mental',
    description: 'Frequência fundamental para acalmar a mente e abrir o canal de conexão espiritual. Usada em práticas de Oxalá.',
    duration: 1800,
    category: 'meditation',
    subcategory: 'solfeggio',
    frequency: '432 Hz',
    chakra: '7',
    orixa: 'Oxalá',
    tags: ['cura', 'paz', 'meditation', 'oxala'],
    format: 'mp3',
    bitrate: '320 kbps',
    size: 72000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track_002',
    name: '528Hz - Frequência do Amor',
    description: 'A frequência do Sol que ativa o plexo solar e atrai a bênção de Oxum. Transforma a energia vital.',
    duration: 2400,
    category: 'meditation',
    subcategory: 'solfeggio',
    frequency: '528 Hz',
    chakra: '3',
    orixa: 'Oxum',
    tags: ['amor', 'abundancia', 'oxum', 'prosperidade'],
    format: 'mp3',
    bitrate: '320 kbps',
    size: 96000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track_003',
    name: '639Hz - Harmonia do Coração',
    description: 'Ressonância do elemento Ar/Fogo que desperta a compaixão. Conecta Iemanjá à energia de Binah.',
    duration: 1500,
    category: 'meditation',
    subcategory: 'solfeggio',
    frequency: '639 Hz',
    chakra: '4',
    orixa: 'Iemanjá',
    tags: ['harmonia', 'relacionamentos', 'iemanja', 'luz'],
    format: 'mp3',
    bitrate: '320 kbps',
    size: 60000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track_004',
    name: '741Hz - Despertar da Intuição',
    description: 'A frequência que abre o terceiro olho e ativa a visão espiritual. Conecta Xangô à sabedoria divina.',
    duration: 1800,
    category: 'meditation',
    subcategory: 'solfeggio',
    frequency: '741 Hz',
    chakra: '6',
    orixa: 'Xangô',
    tags: ['intuicao', 'visao', 'xango', 'verdade'],
    format: 'mp3',
    bitrate: '320 kbps',
    size: 72000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track_005',
    name: '963Hz - Frequência do Ether',
    description: 'A mais alta frequência do Solfeggio. Conecta diretamente com Kether e Oxalá na vibração suprema.',
    duration: 1200,
    category: 'meditation',
    subcategory: 'solfeggio',
    frequency: '963 Hz',
    chakra: '7',
    orixa: 'Oxalá',
    tags: ['ether', 'luz', 'coroa', 'suprema'],
    format: 'mp3',
    bitrate: '320 kbps',
    size: 48000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track_006',
    name: 'Batimento de Ogum - Força Guerreira',
    description: 'Ritmo marcial que ativa o segundo chakra e a força de vontade. Inicia rituais de Ogum.',
    duration: 900,
    category: 'meditation',
    subcategory: 'ritual',
    frequency: 'batimento',
    chakra: '2',
    orixa: 'Ogum',
    tags: ['forca', 'coragem', 'ogum', 'acao'],
    format: 'mp3',
    bitrate: '320 kbps',
    size: 36000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track_007',
    name: 'Vento de Iansã - Transformação',
    description: 'Sons de tempestade que transmutam energias pesadas. Queima demandas e abre caminhos.',
    duration: 2100,
    category: 'meditation',
    subcategory: 'transmutacao',
    frequency: 'vento',
    chakra: '2',
    orixa: 'Iansã',
    tags: ['transformacao', 'vento', 'iansan', 'quebra'],
    format: 'mp3',
    bitrate: '320 kbps',
    size: 84000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track_008',
    name: 'Água de Oxum - Prosperidade',
    description: 'Som de água corrente que atrai a energia dourada de Oxum. Banhos sonoros para fartura.',
    duration: 1800,
    category: 'meditation',
    subcategory: 'atração',
    frequency: 'agua',
    chakra: '4',
    orixa: 'Oxum',
    tags: ['prosperidade', 'agua', 'ouro', 'oxum'],
    format: 'mp3',
    bitrate: '320 kbps',
    size: 72000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track_009',
    name: 'Omolu - Cura e Aterramento',
    description: 'Frequência grave que conecta à terra e cura o corpo físico. Usada na limpeza kármica.',
    duration: 2700,
    category: 'meditation',
    subcategory: 'cura',
    frequency: '174 Hz',
    chakra: '1',
    orixa: 'Omolu',
    tags: ['cura', 'terra', 'omolu', 'limpeza'],
    format: 'mp3',
    bitrate: '320 kbps',
    size: 108000000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'track_010',
    name: 'Oxóssi - Caça na Floresta',
    description: 'Ritmo que ativa a energia de quinta-feira. Conecta com a fartura de Oxóssi nas matas.',
    duration: 1500,
    category: 'meditation',
    subcategory: 'ritual',
    frequency: 'floresta',
    chakra: '4',
    orixa: 'Oxóssi',
    tags: ['fartura', 'conhecimento', 'oxossi', 'natureza'],
    format: 'mp3',
    bitrate: '320 kbps',
    size: 60000000,
    createdAt: new Date().toISOString(),
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
  if (bytes >= 1000000000) {
    return `${(bytes / 1000000000).toFixed(1)} GB`;
  }
  if (bytes >= 1000000) {
    return `${(bytes / 1000000).toFixed(1)} MB`;
  }
  return `${(bytes / 1000).toFixed(0)} KB`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const trackId = searchParams.get('id');
  const category = searchParams.get('category');
  const orixa = searchParams.get('orixa');
  const chakra = searchParams.get('chakra');
  const frequency = searchParams.get('frequency');
  const tags = searchParams.get('tags');
  const duration = searchParams.get('duration');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  if (trackId) {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) {
      return NextResponse.json(
        { error: 'Track not found', id: trackId },
        { status: 404 }
      );
    }
    return NextResponse.json({
      ...track,
      durationFormatted: formatDuration(track.duration),
      sizeFormatted: formatSize(track.size),
    });
  }

  let filteredTracks = [...tracks];

  if (category) {
    filteredTracks = filteredTracks.filter(
      (t) => t.category.toLowerCase() === category.toLowerCase() ||
             t.subcategory?.toLowerCase() === category.toLowerCase()
    );
  }

  if (orixa) {
    filteredTracks = filteredTracks.filter(
      (t) => t.orixa?.toLowerCase() === orixa.toLowerCase()
    );
  }

  if (chakra) {
    filteredTracks = filteredTracks.filter((t) => t.chakra === chakra);
  }

  if (frequency) {
    filteredTracks = filteredTracks.filter(
      (t) => t.frequency.toLowerCase().includes(frequency.toLowerCase())
    );
  }

  if (tags) {
    const tagList = tags.split(',').map((t) => t.trim().toLowerCase());
    filteredTracks = filteredTracks.filter((t) =>
      tagList.some((tag) => t.tags.some((tTag) => tTag.toLowerCase().includes(tag)))
    );
  }

  if (duration) {
    const [min, max] = duration.split('-').map(Number);
    if (!isNaN(min)) {
      filteredTracks = filteredTracks.filter((t) => t.duration >= min * 60);
    }
    if (!isNaN(max)) {
      filteredTracks = filteredTracks.filter((t) => t.duration <= max * 60);
    }
  }

  const total = filteredTracks.length;
  const paginatedTracks = filteredTracks.slice(offset, offset + limit);

  const tracksWithMetadata = paginatedTracks.map((track) => ({
    ...track,
    durationFormatted: formatDuration(track.duration),
    sizeFormatted: formatSize(track.size),
  }));

  return NextResponse.json({
    tracks: tracksWithMetadata,
    total,
    count: tracksWithMetadata.length,
    page: Math.floor(offset / limit) + 1,
    limit,
    filters: {
      category,
      orixa,
      chakra,
      frequency,
      tags,
      duration,
    },
  });
}