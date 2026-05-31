import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const SourceTypeSchema = z.enum(['divine', 'cosmic', 'ancestral', 'nature', 'self']);

const SourceConnectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string(),
  type: SourceTypeSchema,
  description: z.string(),
  practice: z.string(),
  duration: z.string(),
  warnings: z.array(z.string()).optional(),
});

const SourceConnectionQuerySchema = z.object({
  type: SourceTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

const SOURCE_CONNECTIONS: z.infer<typeof SourceConnectionSchema>[] = [
  {
    id: 'divine-source',
    name: 'Conexão com a Fonte Divina',
    nameEn: 'Divine Source Connection',
    type: 'divine',
    description: 'Comunhão direta com a fonte primordial de toda existência. Única, absoluta e sem forma.',
    practice: 'Sente-se em silêncio profundo. Visualize uma luz branca infinita acima de você. Deixe-a fluir através do topo da cabeça, preenchendo cada célula. Dissolva-se nessa luz até restar apenas conexão pura.',
    duration: '15-30 minutos',
    warnings: ['Não recomendado para iniciantes sem supervisão', 'Pode provocar experiências intensas'],
  },
  {
    id: 'cosmic-source',
    name: 'Conexão Cósmica',
    nameEn: 'Cosmic Source Connection',
    type: 'cosmic',
    description: 'Alinhamento com a energia do cosmos infinito. Conexão com estrelas, planetas e a inteligência universal.',
    practice: 'À noite, olhe para o céu estrelado. Permita que sua visão se expanda. Sinta-se parte do todo cósmico, conectado a cada estrela e planeta. Deixe a energia cósmica fluir através de você.',
    duration: '10-20 minutos',
  },
  {
    id: 'ancestral-source',
    name: 'Conexão com a Fonte Ancestral',
    nameEn: 'Ancestral Source Connection',
    type: 'ancestral',
    description: 'Ressonância com a sabedoria de seus ancestrais e a corrente da vida que flui através de você.',
    practice: 'Em paz, evoque mentalmente seus ancestrais. Visualize uma linha de luz conectando você aos seus antepassados. Permita que их мудрость (sabedoria deles) flua através dessa linha até você.',
    duration: '20-30 minutos',
    warnings: ['Realize com respeito e gratidão', 'Evite em momentos de conflito emocional'],
  },
  {
    id: 'nature-source',
    name: 'Conexão com a Fonte Natural',
    nameEn: 'Nature Source Connection',
    type: 'nature',
    description: 'Comunhão com a inteligência da natureza. A consciência que anima todas as coisas vivas.',
    practice: 'Em contato com a natureza (árvores, água, terra), Feche os olhos. Sinta a presença da vida ao seu redor. Permita que a energia natural da terra ascenda por seus pés e a energia do céu desça por sua cabeça.',
    duration: '15-45 minutos',
  },
  {
    id: 'self-source',
    name: 'Conexão com o EU Superior',
    nameEn: 'Higher Self Connection',
    type: 'self',
    description: 'Alinhamento com sua essência verdadeira, oEU superior que existe além do ego e das limitações.',
    practice: 'Em meditação profunda, pergunte ao seuEU superior: "Quem sou eu além deste corpo, além desta mente?". Permaneça na quietude até que a resposta venha como compreensão, não como palavras.',
    duration: '30-60 minutos',
    warnings: ['Pode revelar verdades desconfortáveis', 'Integre os insights gradualmente'],
  },
  {
    id: 'source-of-all',
    name: 'Fonte de Tudo',
    nameEn: 'Source of All',
    type: 'divine',
    description: 'A origem de toda existência, antes de todas as formas. O vazio fértil onde tudo começa.',
    practice: 'Em meditação, observe o espaço entre seus pensamentos. Não pense em nada. Apenas exista no vazio. Lá, o tudo está contido no nada. Quando você se torna o vazio, toca a fonte.',
    duration: '20-45 minutos',
    warnings: ['Prática avançada', 'Requer mente quieta', 'Comece com técnicas mais simples'],
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = SourceConnectionQuerySchema.safeParse({
    type: searchParams.get('type'),
    limit: searchParams.get('limit'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { type, limit } = parseResult.data;
  let connections = [...SOURCE_CONNECTIONS];

  if (type) {
    connections = connections.filter(c => c.type === type);
  }

  if (limit) {
    connections = connections.slice(0, limit);
  }

  return NextResponse.json({
    success: true,
    connections,
    count: connections.length,
    total: SOURCE_CONNECTIONS.length,
  });
}