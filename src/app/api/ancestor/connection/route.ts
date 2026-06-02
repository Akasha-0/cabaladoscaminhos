import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const AncestorConnectionQuerySchema = z.object({
  type: z.enum(['records', 'types']).optional(),
  id: z.string().optional(),
});
// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = AncestorConnectionQuerySchema.safeParse({
      type: searchParams.get('type'),
      id: searchParams.get('id'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { type, id } = parseResult.data;
    const rituals = [
      {
        id: 'ancestor-invocation-morning',
        name: 'Invocação Matinal aos Ancestrais',
        type: 'invocation',
        description: 'Ritual de abertura do dia com chamados aos ancestrais Guia.',
        steps: [
          'Acenda uma vela branca ou dourada',
          'Respire profundamente três vezes',
          'Recite o chamado aos ancestrais',
          'Pida bênçãos e proteção para o dia'
        ],
        duration: '5-10 minutos'
      },
      {
        id: 'offering-water-ancestors',
        name: 'Oferenda de Água',
        type: 'offering',
        description: 'Oferta simples de água para honrar os ancestrais.',
        steps: [
          'Coloque um copo de água limpa',
          'Diga o nome de seus ancestrais',
          'Agradeça por suas bênçãos',
          'Deixe o copo por algumas horas antes de consumir'
        ],
        offerings: ['Água fresca', 'Flores brancas']
      },
      {
        id: 'meditation-lineage',
        name: 'Meditação da Linha Ancestral',
        type: 'meditation',
        description: 'Conecta com a energia de seus ancestrais através da meditação.',
        steps: [
          'Sente-se em silêncio',
          'Visualize uma linha de luz conectando você aos seus ancestrais',
          'Sinta a presença e sabedoria deles',
          'Receba suas bênçãos com gratidão'
        ],
        duration: '15-20 minutos'
      },
      {
        id: 'gratitude-ancestors',
        name: 'Ação de Graças Ancestral',
        type: 'gratitude',
        description: 'Ritual de gratidão pelos sacrifícios e legados ancestrais.',
        steps: [
          'Lembre-se de um ancestral específico',
          'Agradeça por seus ensinamentos',
          'Reconheça seus sacrifícios',
          'Prometa honrar seu legado'
        ]
      },
      {
        id: 'protection-ritual',
        name: 'Ritual de Proteção Ancestral',
        type: 'protection',
        description: 'Pede proteção e intermediação dos ancestrais.',
        steps: [
          'Visualize seus ancestrais em círculo ao seu redor',
          'Peça que eles formem uma barreira protetora',
          'Sinta a energia de segurança e pertencimento',
          'Agradeça pela proteção recebida'
        ],
        duration: '10-15 minutos'
      },
      {
        id: 'liberation-ritual',
        name: 'Ritual de Libertação Ancestral',
        type: 'liberation',
        description: 'Liberta padrões e energias densas herdadas da linhagem.',
        steps: [
          'Identifique um padrão que não lhe serve',
          'Visualize-o como uma corrente ou peso',
          'Peça aos ancestrais para ajudá-lo a soltar',
          'Sinta a libertação e o alívio'
        ],
        duration: '20-30 minutos'
      }
    ];

    // Return single ritual by ID
    if (id) {
      const ritual = rituals.find((r) => r.id === id);
      if (!ritual) {
        return NextResponse.json(
          { success: false, error: 'Ritual not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: ritual });
    }

    // Return connection types
    if (type === 'types') {
      const types = [
        { name: 'invocation', description: 'Chamados e invocações aos ancestrais', weight: 3 },
        { name: 'offering', description: 'Ofertas para honrar ancestrais', weight: 3 },
        { name: 'meditation', description: 'Meditações de conexão com a linhagem', weight: 3 },
        { name: 'gratitude', description: 'Práticas de gratidão ancestral', weight: 3 },
        { name: 'protection', description: 'Rituais de proteção mediada pelos ancestrais', weight: 2 },
        { name: 'liberation', description: 'Libertação de padrões da linhagem', weight: 2 }
      ];
      return NextResponse.json({ success: true, data: types });
    }

    // Return ritual records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: rituals });
    }

    // Default — return all ancestor connection data
    const response = {
      success: true,
      data: {
        rituals,
        types: [
          { name: 'invocation', description: 'Chamados e invocações aos ancestrais', weight: 3 },
          { name: 'offering', description: 'Ofertas para honrar ancestrais', weight: 3 },
          { name: 'meditation', description: 'Meditações de conexão com a linhagem', weight: 3 },
          { name: 'gratitude', description: 'Práticas de gratidão ancestral', weight: 3 },
          { name: 'protection', description: 'Rituais de proteção mediada pelos ancestrais', weight: 2 },
          { name: 'liberation', description: 'Libertação de padrões da linhagem', weight: 2 }
        ],
        guidance: [
          'Honre seus ancestrais com gratidão e respeito',
          'Mantenha uma prática regular de conexão',
          'Esteja aberto para receber suas bênçãos',
          'Participe de rituais coletivos quando possível'
        ]
      }
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ancestor connection data' },
      { status: 500 }
    );
  }
}
