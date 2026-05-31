import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
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
});
const SpiritAnimalsQuerySchema = z.object({
  nome: z.string().optional(),
  id: z.string().optional(),
  elemento: z.string().optional(),
});
export type SpiritAnimal = z.infer<typeof SpiritAnimalSchema>;
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
  },
  {
    id: 'cavalo',
    nome: 'Cavalo',
    nomeIngles: 'Horse',
    elemento: 'Terra',
    qualidade: 'Liberdade e jornada',
    mensagem: 'Corra livremente em direção ao seu destino',
    cor: 'Marrom',
    chakra: 'Coração',
    combinacoes: ['liberdade', 'forca', 'nobreza'],
  },
  {
    id: 'raposa',
    nome: 'Raposa',
    nomeIngles: 'Fox',
    elemento: 'Terra',
    qualidade: 'Astúcia e adaptação',
    mensagem: 'Use sua inteligência para navegar situações complexas',
    cor: 'Laranja Queimado',
    chakra: 'Plexo Solar',
    combinacoes: ['astucia', 'enganao', 'velocidade'],
  },
  {
    id: 'urso',
    nome: 'Urso',
    nomeIngles: 'Bear',
    elemento: 'Terra',
    qualidade: 'Poder interior',
    mensagem: 'Descanse em sua força interior e reconecte-se',
    cor: 'Marrom Escuro',
    chakra: 'Raiz',
    combinacoes: ['forca', 'hibernacao', 'curacao'],
  },
  {
    id: 'falcao',
    nome: 'Falcão',
    nomeIngles: 'Hawk',
    elemento: 'Ar',
    qualidade: 'Foco e percepção',
    mensagem: 'Observe os detalhes que escapam aos outros',
    cor: 'Marrom Claro',
    chakra: 'Terceiro Olho',
    combinacoes: ['visao', 'percepcao', 'magia'],
  },
  {
    id: 'pantera',
    nome: 'Pantera',
    nomeIngles: 'Panther',
    elemento: 'Fogo',
    qualidade: 'Assertividade',
    mensagem: 'Atue com precisão e sem hesitação',
    cor: 'Preto',
    chakra: 'Plexo Solar',
    combinacoes: ['poder', 'misterio', 'protecao'],
  },
  {
    id: 'bufalo',
    nome: 'Búfalo',
    nomeIngles: 'Buffalo',
    elemento: 'Terra',
    qualidade: 'Abundância e gratidão',
    mensagem: 'Agradeça pelas bênçãos e manifeste abundância',
    cor: 'Preto e Branco',
    chakra: 'Coração',
    combinacoes: ['abundancia', 'gratidao', 'sabedoria'],
  },
  {
    id: 'sapo',
    nome: 'Sapo',
    nomeIngles: 'Frog',
    elemento: 'Água',
    qualidade: 'Purificação',
    mensagem: 'Limpe suas energias e atraia prosperidade',
    cor: 'Verde Brilhante',
    chakra: 'Garganta',
    combinacoes: ['limpeza', 'transformacao', 'sorte'],
  },
  {
    id: 'mariposa',
    nome: 'Mariposa',
    nomeIngles: 'Butterfly',
    elemento: 'Ar',
    qualidade: 'Metamorfose',
    mensagem: 'Abra suas asas e libere-se do que weighs you down',
    cor: 'Multicolorido',
    chakra: 'Coração',
    combinacoes: ['transformacao', 'beleza', 'liberdade'],
  },
  {
    id: 'cobra',
    nome: 'Cobra',
    nomeIngles: 'Serpent',
    elemento: 'Fogo',
    qualidade: 'Kundalini e poder',
    mensagem: 'Desperte sua energia dormente na base da espinha',
    cor: 'Vermelho e Preto',
    chakra: 'Raiz',
    combinacoes: ['poder', 'transformacao', 'sabedoria ancestral'],
  },
  {
    id: 'elefante',
    nome: 'Elefante',
    nomeIngles: 'Elephant',
    elemento: 'Terra',
    qualidade: 'Memória e sabedoria',
    mensagem: 'Lembre-se de quem você é e carregue seu legado',
    cor: 'Cinza',
    chakra: 'Coração',
    combinacoes: ['memoria', 'familia', 'forca'],
  },
  {
    id: 'peixe',
    nome: 'Peixe',
    nomeIngles: 'Fish',
    elemento: 'Água',
    qualidade: 'Intuição profunda',
    mensagem: 'Mergulhe nas profundezas do seu ser',
    cor: 'Azul',
    chakra: 'Coroa',
    combinacoes: ['intuicao', 'espiritualidade', 'fluidez'],
  },
  {
    id: 'cruzado',
    nome: 'Cruzado',
    nomeIngles: 'Stag',
    elemento: 'Terra',
    qualidade: 'Nobreza e regeneração',
    mensagem: 'Regenere suas galhas e cresça novamente',
    cor: 'Marrom e Dourado',
    chakra: 'Coração',
    combinacoes: ['nobreza', 'regeneracao', 'crescimento'],
  },
  {
    id: 'lebre',
    nome: 'Lebre',
    nomeIngles: 'Hare',
    elemento: 'Terra',
    qualidade: 'Fertilidade erebirth',
    mensagem: 'Pule para um novo começo com agility',
    cor: 'Branco',
    chakra: 'Sexual',
    combinacoes: ['fertilidade', 'velocidade', 'esperanca'],
  },
  {
    id: 'lince',
    nome: 'Lince',
    nomeIngles: 'Lynx',
    elemento: 'Terra',
    qualidade: 'Visão interior',
    mensagem: 'Veja além do véu, acesso segredos ocultos',
    cor: 'Amarelo Mostarda',
    chakra: 'Terceiro Olho',
    combinacoes: ['visao', 'mistério', 'segredo'],
  },
  {
    id: 'boto',
    nome: 'Boto',
    nomeIngles: 'Dolphin',
    elemento: 'Água',
    qualidade: 'Harmonia e cura',
    mensagem: 'Ressonância com a frequencies da cura universal',
    cor: 'Azul e Cinza',
    chakra: 'Coração',
    combinacoes: ['cura', 'harmonia', 'alegría'],
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = SpiritAnimalsQuerySchema.safeParse({
    nome: searchParams.get('nome'),
    id: searchParams.get('id'),
    elemento: searchParams.get('elemento'),
  });
  if (!parseResult.success) {
    return NextResponse.json({
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }
  const { nome, id, elemento } = parseResult.data;
  // Filter by ID
  if (id) {
    const animal = spiritAnimals.find((a) => a.id === id);

    if (!animal) {
      return NextResponse.json(
        { animal: null, error: 'Animal espiritual não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ animal });
  }

  // Filter by nome
  if (nome) {
    const animal = spiritAnimals.find((a) =>
      a.nome.toLowerCase() === nome.toLowerCase()
    );

    if (animal) {
      return NextResponse.json({ animal });
    }

    const suggestions = spiritAnimals
      .filter(
        (a) =>
          a.nome.toLowerCase().includes(nome.toLowerCase()) ||
          a.nomeIngles.toLowerCase().includes(nome.toLowerCase())
      )
      .map((a) => a.nome);

    return NextResponse.json(
      {
        animal: null,
        error: 'Animal espiritual não encontrado',
        suggestions:
          suggestions.length > 0 ? suggestions : spiritAnimals.map((a) => a.nome),
      },
      { status: 404 }
    );
  }

  // Filter by elemento
  if (elemento) {
    const filtered = spiritAnimals.filter((a) =>
      a.elemento.toLowerCase() === elemento.toLowerCase()
    );

    return NextResponse.json({
      animais: filtered,
      meta: {
        total: filtered.length,
        filtro: elemento,
      },
    });
  }

  // Return all
  return NextResponse.json({
    animais: spiritAnimals,
    meta: {
      total: spiritAnimals.length,
    },
  });
}