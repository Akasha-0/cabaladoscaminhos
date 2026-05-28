import { NextResponse } from 'next/server';
import { odusData, getQuizilasPorOdu, getPreceitosPorOdu, getEbósPorOdu } from '@/lib/odus/calculos';

/**
 * GET /api/odi/data
 * Returns Odi-related data including Odu Odi and associated practices
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const numero = url.searchParams.get('numero');
  const nome = url.searchParams.get('nome');

  // Odi is Odu number 7
  const ODI_NUMERO = 7;

  // Get single Odu by number
  if (numero) {
    const num = parseInt(numero, 10);
    const odu = odusData[num];

    if (!odu) {
      return NextResponse.json(
        { error: 'Odu not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...odu,
        quizilas: getQuizilasPorOdu(num),
        preceitos: getPreceitosPorOdu(num),
        ebos: getEbósPorOdu(num),
      },
    });
  }

  // Get single Odu by name
  if (nome) {
    const odu = Object.values(odusData).find((o) =>
      o.nome.toLowerCase() === nome.toLowerCase()
    );

    if (!odu) {
      return NextResponse.json(
        { error: 'Odu not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...odu,
        quizilas: getQuizilasPorOdu(odu.numero),
        preceitos: getPreceitosPorOdu(odu.numero),
        ebos: getEbósPorOdu(odu.numero),
      },
    });
  }

  const odus = Object.values(odusData);

  switch (type) {
    case 'all':
      return NextResponse.json({
        data: odus.map((o) => ({
          ...o,
          quizilas: getQuizilasPorOdu(o.numero),
          preceitos: getPreceitosPorOdu(o.numero),
          ebos: getEbósPorOdu(o.numero),
        })),
      });

    case 'names':
      return NextResponse.json({
        data: odus.map((o) => ({ numero: o.numero, nome: o.nome })),
      });

    case 'elements':
      return NextResponse.json({
        data: odus.map((o) => ({
          numero: o.numero,
          nome: o.nome,
          elementos: o.elementos,
        })),
      });

    case 'rituals':
      return NextResponse.json({
        data: odus.map((o) => ({
          numero: o.numero,
          nome: o.nome,
          ebos: getEbósPorOdu(o.numero),
        })),
      });

    case 'quizilas':
      return NextResponse.json({
        data: odus.map((o) => ({
          numero: o.numero,
          nome: o.nome,
          quizilas: getQuizilasPorOdu(o.numero),
        })),
      });

    case 'ebos':
      return NextResponse.json({
        data: odus.map((o) => ({
          numero: o.numero,
          nome: o.nome,
          ebos: getEbósPorOdu(o.numero),
        })),
      });

    case 'odi':
      // Return specifically the Odi Odu
      const odi = odusData[ODI_NUMERO];
      return NextResponse.json({
        data: {
          ...odi,
          quizilas: getQuizilasPorOdu(ODI_NUMERO),
          preceitos: getPreceitosPorOdu(ODI_NUMERO),
          ebos: getEbósPorOdu(ODI_NUMERO),
        },
      });

    default:
      // Return Odi by default or when no type specified
      const defaultOdi = odusData[ODI_NUMERO];
      return NextResponse.json({
        data: {
          ...defaultOdi,
          quizilas: getQuizilasPorOdu(ODI_NUMERO),
          preceitos: getPreceitosPorOdu(ODI_NUMERO),
          ebos: getEbósPorOdu(ODI_NUMERO),
        },
      });
  }
}
