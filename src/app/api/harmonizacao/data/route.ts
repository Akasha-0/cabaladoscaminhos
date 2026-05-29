import { NextRequest, NextResponse } from 'next/server'

// GET /api/harmonizacao/data
export async function GET(request: NextRequest) {
  try {
    const data = {
      harmonizacao: {
        orixas: [
          { id: 'oxum', nome: 'Oxum', elemento: 'agua', cor: 'amarelo-dourado' },
          { id: 'ogum', nome: 'Ogum', elemento: 'ferro', cor: 'vermelho' },
          { id: 'xango', nome: 'Xangô', elemento: 'raio', cor: 'marrom' },
          { id: 'iemanja', nome: 'Iemanjá', elemento: 'mar', cor: 'branco-azulado' },
          { id: 'logun-ede', nome: 'Logun-Edé', elemento: 'agua-ferro', cor: 'verde-amarelo' },
        ],
        elementos: ['agua', 'ferro', 'raio', 'mar', 'terra', 'fogo', 'vento'],
        praticas: [
          { id: 'eboshi', nome: 'Eboshi', tipo: 'ritual', descricao: 'Oferenda preparatória' },
          { id: 'ori', nome: 'Ori', tipo: 'meditacao', descricao: 'Alinhamento com o destino' },
          { id: 'axé', nome: 'Axé', tipo: 'energia', descricao: 'Canalização vital' },
        ],
      },
    }

    return NextResponse.json(data)
} catch (_error) {
    return NextResponse.json({ error: 'Erro ao buscar dados de harmonização' }, { status: 500 })
  }
}