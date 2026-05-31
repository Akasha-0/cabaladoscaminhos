import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

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
  sefirot: z.array(SefirotSchema),
  chakra: ChakraSchema,
  element: ElementSchema,
  orixa: z.string(),
  affirmation: z.string(),
  mantram: z.string().optional(),
});

const SourceConnectionQuerySchema = z.object({
  type: SourceTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── Source Connections with Spiritual Correlations ──────────────────────────────────────────
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
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Eu sou um com a luz divina',
    mantram: 'Eu sou Aquele que É',
  },
  {
    id: 'cosmic-source',
    name: 'Conexão Cósmica',
    nameEn: 'Cosmic Source Connection',
    type: 'cosmic',
    description: 'Alinhamento com a energia do cosmos infinito. Conexão com estrelas, planetas e a inteligência universal.',
    practice: 'À noite, olhe para o céu estrelado. Permita que sua visão se expanda. Sinta-se parte do todo cósmico, conectado a cada estrela e planeta. Deixe a energia cósmica fluir através de você.',
    duration: '10-20 minutos',
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'Sou um com o universo infinito',
    mantram: 'Om Namo Bhagavate',
 },
  {
    id: 'ancestral-source',
    name: 'Conexão com a Fonte Ancestral',
    nameEn: 'Ancestral Source Connection',
    type: 'ancestral',
    description: 'Ressonância com a sabedoria de seus ancestrais e a corrente da vida que flui através de você.',
    practice: 'Em paz, evoque mentalmente seus ancestrais. Visualize uma linha de luz conectando você aos seus antepassados. Permita que a sabedoria deles flua através dessa linha até você.',
    duration: '20-30 minutos',
    warnings: ['Realize com respeito e gratidão', 'Evite em momentos de conflito emocional'],
    sefirot: ['Binah', 'Yesod', 'Tipheret'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'A sabedoria dos meus ancestrais me guia',
    mantram: 'Oxum, Iemanjá, Nanã',
  },
  {
    id: 'nature-source',
    name: 'Conexão com a Fonte Natural',
    nameEn: 'Nature Source Connection',
    type: 'nature',
    description: 'Comunhão com a inteligência da natureza. A consciência que anima todas as coisas vivas.',
    practice: 'Em contato com a natureza (árvores, água, terra), Feche os olhos. Sinta a presença da vida ao seu redor. Permita que a energia natural da terra ascenda por seus pés e a energia do céu desça por sua cabeça.',
    duration: '15-45 minutos',
    sefirot: ['Malkuth', 'Netzach'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Oxóssi',
    affirmation: 'Sou um com a inteligência da natureza',
    mantram: 'Pachamama,将我怀抱',
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
    sefirot: ['Tipheret', 'Kether'],
    chakra: 7,
    element: 'Fogo',
    orixa: 'Oxalá',
    affirmation: 'Eu sou minha essência verdadeira',
    mantram: 'So Ham (Eu sou Aquele)',
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
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Daat'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Eu sou o vazio que contém o tudo',
    mantram: 'Om',
  },
];

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = SourceConnectionQuerySchema.safeParse({
    type: searchParams.get('type'),
    limit: searchParams.get('limit'),
    sefirot: searchParams.get('sefirot'),
    chakra: searchParams.get('chakra'),
    element: searchParams.get('element'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { type, limit, sefirot, chakra, element } = parseResult.data;
  let connections = [...SOURCE_CONNECTIONS];

  // Filter by type
  if (type) {
    connections = connections.filter(c => c.type === type);
  }

  // Filter by spiritual correlations
  if (sefirot) {
    connections = connections.filter(c => c.sefirot.includes(sefirot));
  }
  if (chakra) {
    connections = connections.filter(c => c.chakra === chakra);
  }
  if (element) {
    connections = connections.filter(c => c.element === element);
  }

  // Apply limit
  if (limit) {
    connections = connections.slice(0, limit);
  }

  // Statistics
  const stats = {
    byType: SOURCE_CONNECTIONS.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byElement: SOURCE_CONNECTIONS.reduce((acc, c) => {
      acc[c.element] = (acc[c.element] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byChakra: SOURCE_CONNECTIONS.reduce((acc, c) => {
      acc[c.chakra] = (acc[c.chakra] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
    bySefirot: SOURCE_CONNECTIONS.reduce((acc, c) => {
      c.sefirot.forEach(sf => {
        acc[sf] = (acc[sf] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    totalConnections: SOURCE_CONNECTIONS.length,
  };

  return NextResponse.json({
    success: true,
    connections,
    total: connections.length,
    stats,
  });
}