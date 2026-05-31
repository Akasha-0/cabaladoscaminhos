import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const SpiritAnimalSchema = z.object({
  id: z.string(),
  nome: z.string(),
  nomeIngles: z.string(),
  elemento: z.string(),
  qualidade: z.string(),
  mensagem: z.string(),
  cor: z.string(),
  chakra: z.string(),
  combinacoes: z.array(z.string()),
  spiritualCorrelations: z.object({
    sefirot: z.array(z.string()),
    chakra: z.number(),
    element: z.string(),
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }).optional(),
});

const SpiritAnimalsQuerySchema = z.object({
  nome: z.string().optional(),
  id: z.string().optional(),
  elemento: ElementSchema.optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  orixa: z.string().optional(),
});

export type SpiritAnimal = z.infer<typeof SpiritAnimalSchema>;

// ─── Spiritual Correlations for Spirit Animals ──────────────────────────────────────────
const SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  lobo: {
    sefirot: ['Gevurah', 'Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'Confio em minha intuição e protejo minha matilha',
    frequency: '174 Hz',
  },
  aguia: {
    sefirot: ['Chokhmah', 'Kether'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'Elevo minha visão acima das ilusões',
    frequency: '963 Hz',
  },
  serpente: {
    sefirot: ['Binah', 'Yesod'],
    chakra: 1,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Mudo minha pele e renasco em sabedoria',
    frequency: '396 Hz',
  },
  coruja: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Orunmilá',
    affirmation: 'Na escuridão encontro a sabedoria oculta',
    frequency: '639 Hz',
  },
  tigre: {
    sefirot: ['Gevurah', 'Netzach'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Xangô',
    affirmation: 'Atravesso meus medos com garras de luz',
    frequency: '396 Hz',
  },
  cavalo: {
    sefirot: ['Netzach', 'Malkuth'],
    chakra: 2,
    element: 'Terra',
    orixa: 'Oxum',
    affirmation: 'Corro livremente em direção ao meu destino',
    frequency: '285 Hz',
  },
  urso: {
    sefirot: ['Chesed', 'Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Nanã',
    affirmation: 'Descanso na minha força interior',
    frequency: '174 Hz',
  },
  raposa: {
    sefirot: ['Hod', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'A astúcia me guia através dos enganos',
    frequency: '741 Hz',
  },
  cervo: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A delicadeza e força habitam em mim',
    frequency: '528 Hz',
  },
  bufalo: {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'Piso com firmeza na terra sagrada',
    frequency: '174 Hz',
  },
  golfinho: {
    sefirot: ['Netzach', 'Hod'],
    chakra: 5,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Nado nas águas da sabedoria com alegria',
    frequency: '528 Hz',
  },
  borboleta: {
    sefirot: ['Chokhmah', 'Tipheret'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'Transformo-me em beleza e leveza',
    frequency: '639 Hz',
  },
  corvo: {
    sefirot: ['Binah', 'Hod'],
    chakra: 6,
    element: 'Água',
    orixa: 'Nanã',
    affirmation: 'Carrego os segredos entre os mundos',
    frequency: '639 Hz',
  },
  falcao: {
    sefirot: ['Chokhmah', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'Vejo além do horizonte com clareza',
    frequency: '741 Hz',
  },
  lince: {
    sefirot: ['Binah', 'Yesod'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Vejo na escuridão com olhos de lince',
    frequency: '639 Hz',
  },
  salamandra: {
    sefirot: ['Gevurah', 'Malkuth'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Xangô',
    affirmation: 'Passo pelo fogo sem ser consumido',
    frequency: '396 Hz',
  },
  grou: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 4,
    element: 'Água',
    orixa: 'Oxum',
    affirmation: 'Danço entre a terra e o céu com graça',
    frequency: '528 Hz',
  },
  pavão: {
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Exibo minha beleza interior com orgulho',
    frequency: '528 Hz',
  },
  lobo: {
    sefirot: ['Gevurah', 'Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'A comunhão com a matilha me sustenta',
    frequency: '174 Hz',
  },
};

const spiritAnimals: SpiritAnimal[] = [
  {
    id: 'lobo',
    nome: 'Lobo',
    nomeIngles: 'Wolf',
    elemento: 'Terra',
    qualidade: 'Instinto e proteção',
    mensagem: 'Confie em sua intuição e proteja aqueles que ama',
    cor: 'Cinza Prateado',
    chakra: 'Coração',
    combinacoes: ['coragem', 'liderança', 'comunidade'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['lobo'],
  },
  {
    id: 'aguia',
    nome: 'Águia',
    nomeIngles: 'Eagle',
    elemento: 'Ar',
    qualidade: 'Visão e clareza',
    mensagem: 'Eleve-se acima das circunstâncias e veja a verdade',
    cor: 'Dourado',
    chakra: 'Terceiro Olho',
    combinacoes: ['sabedoria', 'coragem', 'liberdade'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['aguia'],
  },
  {
    id: 'serpente',
    nome: 'Serpente',
    nomeIngles: 'Snake',
    elemento: 'Fogo',
    qualidade: 'Transformação',
    mensagem: 'Mude sua pele, renasça e seja renewed',
    cor: 'Verde',
    chakra: 'Raiz',
    combinacoes: ['cura', 'renovacao', 'sabedoria'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['serpente'],
  },
  {
    id: 'coruja',
    nome: 'Coruja',
    nomeIngles: 'Owl',
    elemento: 'Água',
    qualidade: 'Sabedoria noturna',
    mensagem: 'Na escuridão está a resposta que procura',
    cor: 'Roxo Escuro',
    chakra: 'Terceiro Olho',
    combinacoes: ['intuicao', 'mistério', 'conhecimento'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['coruja'],
  },
  {
    id: 'tigre',
    nome: 'Tigre',
    nomeIngles: 'Tiger',
    elemento: 'Fogo',
    qualidade: 'Força e paixão',
    mensagem: 'Atravesse seus medos com garras e determination',
    cor: 'Laranja',
    chakra: 'Plexo Solar',
    combinacoes: ['poder', 'determinacao', 'coragem'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['tigre'],
  },
  {
    id: 'cavalo',
    nome: 'Cavalo',
    nomeIngles: 'Horse',
    elemento: 'Terra',
    qualidade: 'Liberdade e jornada',
    mensagem: 'Corra livremente em direção ao seu destino',
    cor: 'Marrom',
    chakra: 'Plexo Solar',
    combinacoes: ['liberdade', 'força', 'jornada'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['cavalo'],
  },
  {
    id: 'urso',
    nome: 'Urso',
    nomeIngles: 'Bear',
    elemento: 'Terra',
    qualidade: 'Força e descanso',
    mensagem: 'Descanso quando necessário, mas sempre protejo',
    cor: 'Marrom',
    chakra: 'Raiz',
    combinacoes: ['força', 'proteção', 'descanso'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['urso'],
  },
  {
    id: 'raposa',
    nome: 'Raposa',
    nomeIngles: 'Fox',
    elemento: 'Ar',
    qualidade: 'Astúcia e adaptação',
    mensagem: 'A astúcia é sua maior arma contra os enganos',
    cor: 'Laranja',
    chakra: 'Plexo Solar',
    combinacoes: ['astúcia', 'adaptação', 'engano'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['raposa'],
  },
  {
    id: 'cervo',
    nome: 'Cervo',
    nomeIngles: 'Stag',
    elemento: 'Fogo',
    qualidade: 'Graça e força',
    mensagem: 'A elegância e poder caminham juntos',
    cor: 'Marrom',
    chakra: 'Coração',
    combinacoes: ['graça', 'força', 'dignidade'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['cervo'],
  },
  {
    id: 'bufalo',
    nome: 'Búfalo',
    nomeIngles: 'Buffalo',
    elemento: 'Terra',
    qualidade: 'Abundância e gratidão',
    mensagem: 'A gratidão atrai a abundância que procura',
    cor: 'Marrom Escuro',
    chakra: 'Raiz',
    combinacoes: ['abundância', 'gratidão', 'prosperidade'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['bufalo'],
  },
  {
    id: 'golfinho',
    nome: 'Golfinho',
    nomeIngles: 'Dolphin',
    elemento: 'Água',
    qualidade: ' Alegria e inteligência',
    mensagem: 'A alegria é a linguagem da alma',
    cor: 'Azul',
    chakra: 'Garganta',
    combinacoes: ['alegria', 'inteligência', 'comunidade'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['golfinho'],
  },
  {
    id: 'borboleta',
    nome: 'Borboleta',
    nomeIngles: 'Butterfly',
    elemento: 'Ar',
    qualidade: 'Transformação e leveza',
    mensagem: 'A transformação acontece quando você aceita a mudança',
    cor: 'Colorida',
    chakra: 'Coração',
    combinacoes: ['transformação', 'leveza', 'beleza'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['borboleta'],
  },
  {
    id: 'corvo',
    nome: 'Corvo',
    nomeIngles: 'Raven',
    elemento: 'Água',
    qualidade: 'Mistério e magia',
    mensagem: 'Os corvos são mensageiros entre os mundos',
    cor: 'Preto',
    chakra: 'Terceiro Olho',
    combinacoes: ['mistério', 'magia', 'transformação'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['corvo'],
  },
  {
    id: 'falcao',
    nome: 'Falcão',
    nomeIngles: 'Hawk',
    elemento: 'Ar',
    qualidade: 'Foco e observação',
    mensagem: 'Foque sua visão e voe alto',
    cor: 'Marrom',
    chakra: 'Terceiro Olho',
    combinacoes: ['foco', 'visão', 'orientação'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['falcao'],
  },
  {
    id: 'lince',
    nome: 'Lince',
    nomeIngles: 'Lynx',
    elemento: 'Água',
    qualidade: 'Visão interior',
    mensagem: 'Os olhos do lince veem além do véu',
    cor: 'Cinza',
    chakra: 'Terceiro Olho',
    combinacoes: ['visão', 'segredo', 'discernimento'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['lince'],
  },
  {
    id: 'salamandra',
    nome: 'Salamandra',
    nomeIngles: 'Salamander',
    elemento: 'Fogo',
    qualidade: 'Sobrevivência e regeneração',
    mensagem: 'O fogo purifica mas não destrói sua essência',
    cor: 'Laranja',
    chakra: 'Raiz',
    combinacoes: ['sobrevivência', 'regeneração', 'fogo'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['salamandra'],
  },
  {
    id: 'grou',
    nome: 'Grou',
    nomeIngles: 'Crane',
    elemento: 'Água',
    qualidade: 'Longevidade e graça',
    mensagem: 'A graça está na simplicidade de ser',
    cor: 'Branco',
    chakra: 'Coração',
    combinacoes: ['longevidade', 'graça', 'meditação'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['grou'],
  },
  {
    id: 'pavao',
    nome: 'Pavão',
    nomeIngles: 'Peacock',
    elemento: 'Fogo',
    qualidade: 'Beleza e orgulho',
    mensagem: 'Exiba sua beleza interior com orgulho',
    cor: 'Azul Verde',
    chakra: 'Coração',
    combinacoes: ['beleza', 'orgulho', 'ressurreição'],
    spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS['pavao'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = SpiritAnimalsQuerySchema.safeParse({
      nome: searchParams.get('nome'),
      id: searchParams.get('id'),
      elemento: searchParams.get('elemento'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { nome, id, elemento, sefirot, chakra, orixa } = parseResult.data;

    // Filter animals
    let animals = [...spiritAnimals];

    if (nome) {
      animals = animals.filter(a =>
        a.nome.toLowerCase().includes(nome.toLowerCase()) ||
        a.nomeIngles.toLowerCase().includes(nome.toLowerCase())
      );
    }

    if (id) {
      animals = animals.filter(a => a.id === id);
    }

    if (elemento) {
      animals = animals.filter(a => a.elemento === elemento);
    }

    if (sefirot) {
      animals = animals.filter(a => a.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      animals = animals.filter(a => a.spiritualCorrelations?.chakra === chakra);
    }

    if (orixa) {
      animals = animals.filter(a => a.spiritualCorrelations?.orixa === orixa);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      bySefirot: animals.reduce((acc, a) => {
        a.spiritualCorrelations?.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: animals.reduce((acc, a) => {
        const c = a.spiritualCorrelations?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: animals.reduce((acc, a) => {
        const e = a.spiritualCorrelations?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: animals.reduce((acc, a) => {
        const o = a.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      animals,
      count: animals.length,
      spiritualCorrelations: SPIRIT_ANIMAL_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { nome, id, elemento, sefirot, chakra, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}