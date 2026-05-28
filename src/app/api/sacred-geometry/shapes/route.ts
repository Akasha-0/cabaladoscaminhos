import { NextResponse } from 'next/server';
import { FORMAS_SAGRADAS, getFormaPorSefirot, getFormaPorChakra, type FormaGeometrica } from '@/lib/geometria-sagrada/dados';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const sefirot = searchParams.get('sefirot');
  const chakra = searchParams.get('chakra');

  if (id) {
    const forma = FORMAS_SAGRADAS.find(f => f.id === id);
    if (!forma) {
      return NextResponse.json({ error: 'Forma não encontrada' }, { status: 404 });
    }
    return NextResponse.json(forma);
  }

  if (sefirot) {
    return NextResponse.json(getFormaPorSefirot(sefirot));
  }

  if (chakra) {
    const chakraNum = parseInt(chakra, 10);
    if (isNaN(chakraNum)) {
      return NextResponse.json({ error: 'Chakra inválido' }, { status: 400 });
    }
    return NextResponse.json(getFormaPorChakra(chakraNum));
  }

  return NextResponse.json(FORMAS_SAGRADAS);
}
