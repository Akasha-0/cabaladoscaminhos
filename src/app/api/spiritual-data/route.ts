import { NextResponse } from 'next/server';
import {
  diasSemana,
  orixas,
  odus,
  cartasLenormand,
  chakras,
  fasesLua,
  getDiaSemanaAtual,
  getOrixasDoDia,
  getFaseLuaAtual,
  getCorrespondenciasDia,
} from '@/lib/data/spiritual-data';

export function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  const spiritualData = {
    endpoints: ['dias', 'orixas', 'odus', 'lenormand', 'chakras', 'tarot', 'hoje'],
    categories: {
      dias: '/api/spiritual-data?category=dias',
      orixas: '/api/spiritual-data?category=orixas',
      odus: '/api/spiritual-data?category=odus',
      lenormand: '/api/spiritual-data?category=lenormand',
      chakras: '/api/spiritual-data?category=chakras',
      tarot: '/api/spiritual-data?category=tarot',
      hoje: '/api/spiritual-data?category=hoje',
    },
  };

  if (!category) {
    return NextResponse.json(spiritualData);
  }

  switch (category) {
    case 'dias':
      return NextResponse.json({ data: getDiaSemanaAtual() });
    case 'orixas':
      return NextResponse.json({ data: getOrixasDoDia() });
    case 'hoje':
      return NextResponse.json({
        data: {
          dia: getDiaSemanaAtual(),
          orixas: getOrixasDoDia(),
          fase: getFaseLuaAtual(),
          correspondencias: getCorrespondenciasDia(),
        },
      });
    default:
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }
}
