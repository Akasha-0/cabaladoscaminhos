 
import { NextRequest, NextResponse } from 'next/server';
import { FORMAS_SAGRADAS, getFormaPorSefirot, getFormaPorChakra, getFrequenciaRecommendations } from '@/lib/geometria-sagrada/dados';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');
  const sefirot = searchParams.get('sefirot');
  const chakra = searchParams.get('chakra');
  const id = searchParams.get('id');

  // /api/sacred-geometry?type=all
  if (type === 'all') {
    const formas = FORMAS_SAGRADAS;
    return NextResponse.json({ formas, meta: { total: formas.length } });
  }

  // /api/sacred-geometry?id=flower-of-life
  if (id) {
    const forma = FORMAS_SAGRADAS.find(f => f.id === id);
    if (!forma) {
      return NextResponse.json({ error: 'Forma geométrica não encontrada' }, { status: 404 });
    }
    const frequencias = getFrequenciaRecommendations(forma);
    return NextResponse.json({ forma, frequencias });
  }

  // /api/sacred-geometry?sefirot=Kether
  if (sefirot) {
    const formas = getFormaPorSefirot(sefirot);
    return NextResponse.json({ formas, meta: { sefirot, total: formas.length } });
  }

  // /api/sacred-geometry?chakra=7
  if (chakra) {
    const chakraNum = parseInt(chakra);
    if (isNaN(chakraNum) || chakraNum < 1 || chakraNum > 7) {
      return NextResponse.json({ error: 'Chakra inválido. Use 1-7.' }, { status: 400 });
    }
    const formas = getFormaPorChakra(chakraNum);
    return NextResponse.json({ formas, meta: { chakra: chakraNum, total: formas.length } });
  }

  // /api/sacred-geometry?type=tipos
  if (type === 'tipos') {
    const tipos = [...new Set(FORMAS_SAGRADAS.map(f => f.nome))];
    return NextResponse.json({ tipos, meta: { total: tipos.length } });
  }

  // Default: return overview
  const summary = FORMAS_SAGRADAS.map(f => ({
    id: f.id,
    nome: f.nome,
    cor: f.cor,
    sefirots: f.sefirots,
  }));

  return NextResponse.json({
    formas: summary,
    meta: {
      total: FORMAS_SAGRADAS.length,
      endpoints: ['type=all', 'type=tipos', 'id={id}', 'sefirot={sefirot}', 'chakra={1-7}'],
    },
  });
}