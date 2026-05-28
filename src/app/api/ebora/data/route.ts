import { NextResponse } from 'next/server';
import { odusData, getQuizilasPorOdu, getPreceitosPorOdu, getEbósPorOdu } from '@/lib/odus/calculos';

/**
 * GET /api/ebora/data
 * Returns Ebora-related data including Ejilsebora and associated Odus
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const numero = url.searchParams.get('numero');
  const nome = url.searchParams.get('nome');

  // Get single Odu by number
  if (numero) {
    const num = parseInt(numero, 10);
    const odu = odusData[num];

    if (!odu) {
      return NextResponse.json(
        { error: 'Odu não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...odu,
        quizilas: getQuizilasPorOdu(num),
        preceitos: getPreceitosPorOdu(num),
        ebós: getEbósPorOdu(num),
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
        { error: 'Odu não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...odu,
        quizilas: getQuizilasPorOdu(odu.numero),
        preceitos: getPreceitosPorOdu(odu.numero),
        ebós: getEbósPorOdu(odu.numero),
      },
    });
  }

  const odus = Object.values(odusData);

  switch (type) {
    case 'all':
      return NextResponse.json({
        data: odus.map((odu) => ({
          numero: odu.numero,
          nome: odu.nome,
          significado: odu.significado,
          elementos: odu.elementos,
          orixaRegente: odu.orixaRegente,
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
          orixaRegente: o.orixaRegente,
        })),
      });

    case 'rituals':
      return NextResponse.json({
        data: odus.map((o) => ({
          numero: o.numero,
          nome: o.nome,
          quizilas: o.quizilas,
          ebós: o.ebos,
        })),
      });

    case 'quizilas':
      return NextResponse.json({
        data: odus.map((o) => ({
          numero: o.numero,
          nome: o.nome,
          quizilas: o.quizilas,
        })),
      });

    case 'ebos':
      return NextResponse.json({
        data: odus.map((o) => ({
          numero: o.numero,
          nome: o.nome,
          ebós: o.ebos,
        })),
      });

    default:
      return NextResponse.json({
        data: odus,
        meta: {
          total: odus.length,
          types: ['all', 'names', 'elements', 'rituals', 'quizilas', 'ebos'],
        },
      });
  }
}
