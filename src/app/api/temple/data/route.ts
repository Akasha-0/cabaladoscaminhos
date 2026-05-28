import { NextRequest, NextResponse } from 'next/server';

const TEMPLE_DATA = {
  locations: [
    { id: 'temple-1', name: 'Santuário Central', latitude: -23.5505, longitude: -46.6333, description: 'Centro espiritual principal' },
    { id: 'temple-2', name: 'Templo da Serra', latitude: -22.9068, longitude: -43.1729, description: 'Refúgio montanhoso para meditação profunda' },
    { id: 'temple-3', name: 'Altar do Amanhecer', latitude: -23.4505, longitude: -46.5233, description: 'Portal para práticas ao amanhecer' },
  ],
  rituals: [
    { id: 'ritual-1', name: 'Iniciação Sagrada', duration: 120, requirements: ['idade_minima', 'preparacao_7_dias'], type: 'iniciacao' },
    { id: 'ritual-2', name: 'Caminho das Sombras', duration: 60, requirements: ['despertar_1'], type: 'caminho' },
    { id: 'ritual-3', name: 'Unificação dos Mundos', duration: 90, requirements: ['despertar_2', 'ritual-2'], type: 'unificacao' },
  ],
  teachings: [
    { id: 'teaching-1', title: 'Fundamentos do Caminho', level: 1, chapters: 12 },
    { id: 'teaching-2', title: 'Aprofundamento Espiritual', level: 2, chapters: 24 },
    { id: 'teaching-3', title: 'Maestria Interior', level: 3, chapters: 36 },
  ],
  symbols: [
    { id: 'symbol-1', name: 'Caminho Único', geometry: 'path', meaning: 'Trajetória individual rumo à iluminação' },
    { id: 'symbol-2', name: 'Três Mundos', geometry: 'triangle', meaning: 'Unificação do céu, terra e underworld' },
    { id: 'symbol-3', name: 'Estrela de Daví', geometry: 'star', meaning: 'Proteção e orientação espiritual' },
  ],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource');
  const id = searchParams.get('id');

  if (resource === 'locations') {
    if (id) {
      const location = TEMPLE_DATA.locations.find((l) => l.id === id);
      if (!location) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
      }
      return NextResponse.json(location);
    }
    return NextResponse.json(TEMPLE_DATA.locations);
  }

  if (resource === 'rituals') {
    if (id) {
      const ritual = TEMPLE_DATA.rituals.find((r) => r.id === id);
      if (!ritual) {
        return NextResponse.json({ error: 'Ritual not found' }, { status: 404 });
      }
      return NextResponse.json(ritual);
    }
    return NextResponse.json(TEMPLE_DATA.rituals);
  }

  if (resource === 'teachings') {
    if (id) {
      const teaching = TEMPLE_DATA.teachings.find((t) => t.id === id);
      if (!teaching) {
        return NextResponse.json({ error: 'Teaching not found' }, { status: 404 });
      }
      return NextResponse.json(teaching);
    }
    return NextResponse.json(TEMPLE_DATA.teachings);
  }

  if (resource === 'symbols') {
    if (id) {
      const symbol = TEMPLE_DATA.symbols.find((s) => s.id === id);
      if (!symbol) {
        return NextResponse.json({ error: 'Symbol not found' }, { status: 404 });
      }
      return NextResponse.json(symbol);
    }
    return NextResponse.json(TEMPLE_DATA.symbols);
  }

  return NextResponse.json(TEMPLE_DATA);
}