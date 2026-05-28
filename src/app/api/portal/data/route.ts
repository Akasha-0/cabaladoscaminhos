import { NextResponse } from 'next/server';

/**
 * GET /api/portal/data
 * Returns portal-related data for the Cabala Dos Caminhos application
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const name = url.searchParams.get('name');

  const portalData = [
    {
      id: 'entrada',
      nome: 'Porta de Entrada',
      descricao: 'Portal de iniciação e abertura de caminhos',
      simbolismo: 'Transição entre estados de consciência',
    },
    {
      id: 'mediunidade',
      nome: 'Porta da Mediunidade',
      descricao: 'Portal de desenvolvimento mediúnico',
      simbolismo: 'Conexão entre mundos',
    },
    {
      id: 'ancestral',
      nome: 'Porta Ancestral',
      descricao: 'Portal de conexão com ancestrais',
      simbolismo: 'Linhagem e tradições',
    },
    {
      id: 'sagrado',
      nome: 'Porta do Sagrado',
      descricao: 'Portal de elevação espiritual',
      simbolismo: 'Pureza e devoção',
    },
    {
      id: 'transformacao',
      nome: 'Porta de Transformação',
      descricao: 'Portal de metamorfose interior',
      simbolismo: 'Renascimento e evolução',
    },
    {
      id: 'cura',
      nome: 'Porta da Cura',
      descricao: 'Portal de cura energética',
      simbolismo: 'Restabelecimento e equilíbrio',
    },
    {
      id: 'visao',
      nome: 'Porta da Visão',
      descricao: 'Portal de clareza e percepção',
      simbolismo: 'Sabedoria e entendimento',
    },
    {
      id: 'integracao',
      nome: 'Porta da Integração',
      descricao: 'Portal de integração dos aspectos',
      simbolismo: 'Unidade e wholeness',
    },
  ];

  if (name) {
    const portal = portalData.find((p) =>
      p.nome.toLowerCase().includes(name.toLowerCase())
    );

    if (!portal) {
      return NextResponse.json(
        { error: 'Porta não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: portal });
  }

  switch (type) {
    case 'all':
      return NextResponse.json({ data: portalData });

    case 'names':
      return NextResponse.json({
        data: portalData.map((p) => ({ id: p.id, nome: p.nome })),
      });

    case 'ids':
      return NextResponse.json({
        data: portalData.map((p) => p.id),
      });

    case 'count':
      return NextResponse.json({
        data: { total: portalData.length },
      });

    default:
      return NextResponse.json({
        data: portalData,
        meta: {
          total: portalData.length,
          types: ['all', 'names', 'ids', 'count'],
        },
      });
  }
}
