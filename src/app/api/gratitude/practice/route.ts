import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const GratitudeTypeSchema = z.enum(['daily', 'manifestation', 'orixa', 'sephirot', 'journey']);
const GratitudeQuerySchema = z.object({
  type: GratitudeTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  includeRitual: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

export const dynamic = 'force-dynamic';

// ─── Practice Data ─────────────────────────────────────────────────────────
interface GratitudePractice {
  id: string;
  type: string;
  name: string;
  nameEn: string;
  description: string;
  affirmations: string[];
  sefirot: string[];
  chakra: string;
  orixa?: string;
  ritual?: {
    duration: number;
    steps: string[];
    materials?: string[];
  };
}

const GRATITUDE_PRACTICES: GratitudePractice[] = [
  {
    id: 'daily-morning',
    type: 'daily',
    name: 'Gratidão Matinal',
    nameEn: 'Morning Gratitude',
    description: 'Prática de gratidão para iniciar o dia com luz e energia positiva.',
    affirmations: [
      'Agradeço pela oportunidade de mais um dia de vida',
      'Hoje, escolho ver a beleza em tudo ao meu redor',
      'Sou grato pela energia que me sustenta',
    ],
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 'Anahata (4º)',
    ritual: {
      duration: 10,
      steps: [
        'Acorde e tome uma respiração profunda',
        'Agradeça mentalmente por 3 coisas',
        'Visualize seu dia iluminado',
        'Defina uma intenção de gratidão',
        'Sussurre palavras de agradecimento',
      ],
    },
  },
  {
    id: 'daily-evening',
    type: 'daily',
    name: 'Gratidão Vespertina',
    nameEn: 'Evening Gratitude',
    description: 'Reflexão noturna para fechar o dia com paz e reconhecimento.',
    affirmations: [
      'Agradeço por tudo que vivi hoje',
      'Libero o que não preciso mais',
      'Cada experiência me trouxe aprendizados',
    ],
    sefirot: ['Netzach', 'Yesod'],
    chakra: 'Anahata (4º)',
    ritual: {
      duration: 15,
      steps: [
        'Sente-se confortavelmente antes de dormir',
        'Reviva mentalmente o dia com gratidão',
        'Agradeça por cada aprendizado',
        'Perdoe-se por erros cometidos',
        'Solicite proteção para a noite',
      ],
    },
  },
  {
    id: 'manifestation-abundance',
    type: 'manifestation',
    name: 'Gratidão pela Abundância',
    nameEn: 'Abundance Gratitude',
    description: 'Cultivar gratidão pela abundância atrai mais prosperidade.',
    affirmations: [
      'Sou grato pela abundância que flui em minha vida',
      'A prosperidade é meu direito divino',
      'Agradeço pelas bênçãos recebidas e pelas que virão',
    ],
    sefirot: ['Chesed', 'Malkuth'],
    chakra: 'Manipura (3º)',
    ritual: {
      duration: 20,
      steps: [
        'Escreva 10 coisas pelas quais é grato',
        'Visualize sua vida em abundância',
        'Agradeça em voz alta pelas riquezas',
        'Plante uma semente como símbolo de prosperidade',
        'Compartilhe gratidão com alguém',
      ],
      materials: ['Caderno', 'Caneta', 'Uma semente ou moeda'],
    },
  },
  {
    id: 'manifestation-health',
    type: 'manifestation',
    name: 'Gratidão pelo Corpo',
    nameEn: 'Body Gratitude',
    description: 'Agradecer pelo corpo físico fortalece a conexão corpo-alma.',
    affirmations: [
      'Meu corpo é sagrado e merece amor',
      'Agradeço pela saúde que possuo',
      'Cada célula do meu corpo vibra gratidão',
    ],
    sefirot: ['Tipheret', 'Malkuth'],
    chakra: 'Sahasrara (7º)',
    ritual: {
      duration: 15,
      steps: [
        'Observe seu corpo com gratidão',
        'Toque cada parte agradecendo',
        'Respire profundamente agradecendo',
        'Visualize luz entrando em cada célula',
        'Agradeça pela vida que pulsa em você',
      ],
    },
  },
  {
    id: 'orixa-oxum',
    type: 'orixa',
    name: 'Gratidão a Oxum',
    nameEn: 'Gratitude to Oxum',
    description: 'Prática de gratidão à Orixá do amor, riqueza e águas doces.',
    affirmations: [
      'Oxum, agradeço pela água doce da vida',
      'Sou grato pelo amor que flui em meu coração',
      'A prosperidade é meu direito sagrado',
    ],
    sefirot: ['Chesed', 'Hod'],
    chakra: 'Svadhisthana (2º)',
    orixa: 'Oxum',
    ritual: {
      duration: 30,
      steps: [
        'Acenda uma vela dourada ou rosa',
        'Ofereça água doce e mel',
        'Coloque flores amarelas ou rosas',
        'Recite mantras de Oxum',
        'Dance em honra à Oxum',
        'Agradeça por suas bênçãos',
      ],
      materials: ['Vela dourada/rosa', 'Água doce', 'Mel', 'Flores', 'Perfume de Oxum'],
    },
  },
  {
    id: 'orixa-yemanja',
    type: 'orixa',
    name: 'Gratidão a Iemanjá',
    nameEn: 'Gratitude to Yemanjá',
    description: 'Prática de gratidão à Rainha do Mar, protetora e mãe divina.',
    affirmations: [
      'Iemanjá, agradeço pela proteção maternal',
      'O mar traz paz ao meu coração',
      'Sou filho/a desta energia sagrada',
    ],
    sefirot: ['Binah', 'Yesod'],
    chakra: 'Sahasrara (7º)',
    orixa: 'Iemanjá',
    ritual: {
      duration: 40,
      steps: [
        'Vá ao mar ou tenha água presente',
        'Ofereça flores brancas à água',
        'Acenda velas azuis e brancas',
        'Recite orações de proteção',
        'Peça bênçãos para sua família',
        'Agradeça pela presença dela em sua vida',
      ],
      materials: ['Velas azul e branca', 'Flores brancas', 'Perfume de Iemanjá', 'Água do mar opcional'],
    },
  },
  {
    id: 'sephirot-chesed',
    type: 'sephirot',
    name: 'Gratidão ao Chesed (Misericórdia)',
    nameEn: 'Gratitude to Chesed',
    description: 'Prática de gratidão ao Sephirah da misericórdia e compaixão divina.',
    affirmations: [
      'Sou grato pela misericórdia que me envolve',
      'A compaixão flui em meu coração',
      'A bondade é minha natureza',
    ],
    sefirot: ['Chesed'],
    chakra: 'Anahata (4º)',
    ritual: {
      duration: 25,
      steps: [
        'Visualize a luz azul de Chesed',
        'Respire compaixão infinita',
        'Agradeça pelas bênçãos recebidas',
        'Extenda gratidão aos outros',
        'Perdoe com coração grato',
      ],
    },
  },
  {
    id: 'sephirot-malkuth',
    type: 'sephirot',
    name: 'Gratidão ao Malkuth (Reino)',
    nameEn: 'Gratitude to Malkuth',
    description: 'Prática de gratidão ao Sephirah do mundo físico emanifestação.',
    affirmations: [
      'Sou grato pela beleza do mundo físico',
      'A Terra me sustenta e alimenta',
      'Cada elemento me conecta ao divino',
    ],
    sefirot: ['Malkuth'],
    chakra: 'Muladhara (1º)',
    ritual: {
      duration: 30,
      steps: [
        'Conecte-se com a Terra',
        'Agradeça pelos elementos',
        'Honre o corpo físico',
        'Perceba o sagrado no cotidiano',
        'Celebre a manifestação divina',
      ],
      materials: ['Flores', 'Frutas', 'Terra ou sal'],
    },
  },
  {
    id: 'journey-self-love',
    type: 'journey',
    name: 'Gratidão pelo Autocuidado',
    nameEn: 'Self-Love Gratitude',
    description: 'Prática de gratidão pelo amor próprio e crescimento espiritual.',
    affirmations: [
      'Ameio a mim mesmo como sou',
      'Sou digno de todo amor e respeito',
      'Minha jornada de crescimento é sagrada',
    ],
    sefirot: ['Tipheret'],
    chakra: 'Anahata (4º)',
    ritual: {
      duration: 20,
      steps: [
        'Olhe-se no espelho com amor',
        'Agradeça por quem você é',
        'Perdoe-se por falhas passadas',
        'Agradeça por sua evolução',
        'Prometa cuidar de si mesmo',
      ],
    },
  },
  {
    id: 'journey-ancestors',
    type: 'journey',
    name: 'Gratidão aos Ancestrais',
    nameEn: 'Ancestral Gratitude',
    description: 'Prática de gratidão aos ancestrais que abriram caminhos.',
    affirmations: [
      'Agradeço aos meus ancestrais pelo caminho aberto',
      'Sou herdeiro de sabedoria sagrada',
      'O sangue ancestral corre em minhas veias',
    ],
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 'Muladhara (1º)',
    ritual: {
      duration: 35,
      steps: [
        'Acenda velas brancas para os ancestrais',
        'Ofereça água e alimentos',
        'Recite nomes de ancestrais',
        'Agradeça pelos sacrifícios deles',
        'Faça uma oração de proteção',
        'Honre a linhagem familiar',
      ],
      materials: ['Velas brancas', 'Água', 'Alimentos simples', 'Fotos se disponível'],
    },
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = GratitudeQuerySchema.safeParse({
    type: searchParams.get('type'),
    limit: searchParams.get('limit'),
    includeRitual: searchParams.get('includeRitual'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { type, limit, includeRitual } = parseResult.data;
  let practices = [...GRATITUDE_PRACTICES];

  if (type) {
    practices = practices.filter(p => p.type === type);
  }

  if (limit) {
    practices = practices.slice(0, limit);
  }

  // Filter out rituals if not requested
  const response = practices.map(p => {
    if (!includeRitual) {
      const { ritual, ...rest } = p;
      return rest;
    }
    return p;
  });

  return NextResponse.json({
    success: true,
    practices: response,
    count: response.length,
    total: GRATITUDE_PRACTICES.length,
    types: {
      daily: GRATITUDE_PRACTICES.filter(p => p.type === 'daily').length,
      manifestation: GRATITUDE_PRACTICES.filter(p => p.type === 'manifestation').length,
      orixa: GRATITUDE_PRACTICES.filter(p => p.type === 'orixa').length,
      sephirot: GRATITUDE_PRACTICES.filter(p => p.type === 'sephirot').length,
      journey: GRATITUDE_PRACTICES.filter(p => p.type === 'journey').length,
    },
  });
}