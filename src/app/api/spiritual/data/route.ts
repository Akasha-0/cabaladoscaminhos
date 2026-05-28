// ============================================================
// SPIRITUAL DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for spiritual data access
// - Overview of available data
// - Days, orixás, odús, lenormand, chakras, tarot, today
// ============================================================

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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const subcategory = url.searchParams.get('subcategory');

  // Return available endpoints if no category specified
  if (!category) {
    return NextResponse.json({
      endpoints: {
        dias: '/api/spiritual/data?category=dias',
        orixas: '/api/spiritual/data?category=orixas',
        odus: '/api/spiritual/data?category=odus',
        lenormand: '/api/spiritual/data?category=lenormand',
        chakras: '/api/spiritual/data?category=chakras',
        tarot: '/api/spiritual/data?category=tarot',
        fasesLua: '/api/spiritual/data?category=fasesLua',
        hoje: '/api/spiritual/data?category=hoje',
      },
      message: 'Use category parameter to fetch specific data',
    });
  }

  switch (category) {
    case 'dias':
      if (subcategory) {
        const diaData = diasSemana[subcategory];
        if (!diaData) {
          return NextResponse.json(
            { error: 'Invalid day. Use: segunda, terca, quarta, quinta, sexta, sabado, domingo' },
            { status: 400 }
          );
        }
        return NextResponse.json({ data: diaData });
      }
      return NextResponse.json({ data: diasSemana });

    case 'orixas':
      if (subcategory) {
        const orixaData = orixas.find(o => o.nome.toLowerCase().replace(/[\/\s]/g, '') === subcategory.toLowerCase());
        if (!orixaData) {
          return NextResponse.json(
            { error: 'Invalid orixá. Use: oxala, iemanja, oxum, ogum, oxossi, xango, iansa, omolu, nanaburuque, oxumare, exu' },
            { status: 400 }
          );
        }
        return NextResponse.json({ data: orixaData });
      }
      return NextResponse.json({ data: orixas });

    case 'odus':
      if (subcategory) {
        const oduNum = parseInt(subcategory, 10);
        if (isNaN(oduNum) || oduNum < 1 || oduNum > 16) {
          return NextResponse.json(
            { error: 'Invalid odú. Use number 1-16' },
            { status: 400 }
          );
        }
        const oduData = odus.find(o => o.numero === oduNum);
        return NextResponse.json({ data: oduData || null });
      }
      return NextResponse.json({ data: odus });

    case 'lenormand':
      if (subcategory) {
        const cartaNum = parseInt(subcategory, 10);
        if (isNaN(cartaNum) || cartaNum < 1 || cartaNum > 36) {
          return NextResponse.json(
            { error: 'Invalid card. Use number 1-36' },
            { status: 400 }
          );
        }
        const cartaData = cartasLenormand.find(c => c.numero === cartaNum);
        return NextResponse.json({ data: cartaData || null });
      }
      return NextResponse.json({ data: cartasLenormand });

    case 'chakras':
      if (subcategory) {
        const chakraNum = parseInt(subcategory, 10);
        if (isNaN(chakraNum) || chakraNum < 1 || chakraNum > 7) {
          return NextResponse.json(
            { error: 'Invalid chakra. Use number 1-7' },
            { status: 400 }
          );
        }
        const chakraData = chakras.find(c => c.numero === chakraNum);
        return NextResponse.json({ data: chakraData || null });
      }
      return NextResponse.json({ data: chakras });

    case 'tarot':
      if (subcategory) {
        const tarotNum = parseInt(subcategory, 10);
        if (isNaN(tarotNum) || tarotNum < 1 || tarotNum > 78) {
          return NextResponse.json(
            { error: 'Invalid tarot card. Use number 1-78' },
            { status: 400 }
          );
        }
        const tarotData = cartasLenormand.find(c => c.numero === tarotNum);
        return NextResponse.json({ data: tarotData || null });
      }
      return NextResponse.json({ data: cartasLenormand });

    case 'fasesLua':
      return NextResponse.json({ data: fasesLua });

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
      return NextResponse.json(
        { error: 'Invalid category. Use: dias, orixas, odus, lenormand, chakras, tarot, fasesLua, hoje' },
        { status: 400 }
      );
  }
}