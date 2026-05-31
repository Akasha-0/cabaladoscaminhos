// src/app/api/spiritual-cards/route.ts
// Spiritual Cards API - skip linting

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CardTypeSchema = z.enum(['arquetipal', 'simbólico', 'meditativo', 'guia']);
const ElementSchema = z.enum(['fogo', 'água', 'terra', 'ar', 'éter']);
const ChakraSchema = z.enum(['raiz', 'sacro', 'plexo solar', 'coração', 'garganta', 'terceiro olho', 'coroa']);

const SpiritualCardSchema = z.object({
  id: z.string(),
  nome: z.string(),
  nomeIngles: z.string(),
  tipo: CardTypeSchema,
  elemento: ElementSchema,
  chakra: ChakraSchema,
  significado: z.string(),
  mensagem: z.string(),
  afirmacao: z.string(),
  cor: z.string(),
  simbolos: z.array(z.string()),
  combinacoes: z.array(z.string()),
  // Spiritual correlations
  sefirot: z.array(z.string()).optional(),
  orixa: z.string().optional(),
  numeroSagrado: z.number().optional(),
  tradicao: z.string().optional(),
});

const SpiritualCardsQuerySchema = z.object({
  id: z.string().optional(),
  nome: z.string().optional(),
  tipo: CardTypeSchema.optional(),
  elemento: ElementSchema.optional(),
  chakra: ChakraSchema.optional(),
  random: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  count: z.coerce.number().int().positive().max(10).optional(),
  orixa: z.string().optional(),
  sefirot: z.string().optional(),
});

export type SpiritualCard = z.infer<typeof SpiritualCardSchema>;
export const dynamic = 'force-dynamic';

// ─── Card Data ──────────────────────────────────────────────────────────────
const spiritualCards: SpiritualCard[] = [
  {
    id: 'espirito-universal',
    nome: 'Espírito Universal',
    nomeIngles: 'Universal Spirit',
    tipo: 'arquetipal',
    elemento: 'éter',
    chakra: 'coroa',
    significado: 'Conexão com a energia primordial do universo e transcendência',
    mensagem: 'Você está alinhado com o fluxo cósmico. Permita-se ser guiado pela sabedoria infinita que existe além do tempo e espaço.',
    afirmacao: 'Eu sou um canal aberto para a luz divina do universo',
    cor: 'dourado',
    simbolos: ['espiral', 'estrela', 'olho'],
    combinacoes: ['meditacao-coroa', 'protecao-cosmica'],
    sefirot: ['Kether', 'Chokhmah'],
    orixa: 'Oxalá',
    numeroSagrado: 1,
    tradicao: 'Cabala/Neo-Espiritualidade',
  },
  {
    id: 'alma-gemea',
    nome: 'Alma Gêmea',
    nomeIngles: 'Soul Mate',
    tipo: 'arquetipal',
    elemento: 'água',
    chakra: 'coração',
    significado: 'Encontro de almas e conexões espirituais profundas',
    mensagem: 'Uma conexão significativa está se manifestando em sua vida. Esteja aberto para reconhecer quem traz crescimento e harmonia.',
    afirmacao: 'Eu atraio conexões de alma que elevam meu espírito',
    cor: 'rosa',
    simbolos: ['corações', 'duas-luas', 'cascata'],
    combinacoes: ['amor-proprio', 'harmonia-relacional'],
    sefirot: ['Netzach', 'Tipheret'],
    orixa: 'Oxum',
    numeroSagrado: 6,
    tradicao: 'Spiritualidade Universal',
  },
  {
    id: 'proposito-divino',
    nome: 'Propósito Divino',
    nomeIngles: 'Divine Purpose',
    tipo: 'arquetipal',
    elemento: 'fogo',
    chakra: 'plexo solar',
    significado: 'Descoberta da missão de vida e vocação',
    mensagem: 'Seu caminho está iluminado. Os desafios atuais são precisos para seu crescimento. Confie no plano maior que está se desenrolando.',
    afirmacao: 'Eu sou guiado pelo meu propósito divino com cada passo',
    cor: 'laranja',
    simbolos: ['flecha', 'caminho', 'coroa'],
    combinacoes: ['sabedoria-interior', 'acao-corajosa'],
    sefirot: ['Chesed', 'Gevurah'],
    orixa: 'Ogum',
    numeroSagrado: 10,
    tradicao: 'Neo-Espiritualidade',
  },
  {
    id: 'ancestralidade',
    nome: 'Ancestralidade',
    nomeIngles: 'Ancestral Wisdom',
    tipo: 'simbólico',
    elemento: 'terra',
    chakra: 'raiz',
    significado: 'Conexão com a sabedoria dos antepassados',
    mensagem: 'Seus ancestrais velam por você. Busque sua sabedoria através de rituais, memórias e histórias familiares.',
    afirmacao: 'Eu honro meus antepassados e recebo sua bênção',
    cor: 'marrom',
    simbolos: ['árvore', 'mãos', 'raízes'],
    combinacoes: ['protecao-familiar', 'forca-terrena'],
    sefirot: ['Malkuth', 'Yesod'],
    orixa: 'Iemanjá',
    numeroSagrado: 8,
    tradicao: 'Tradições Afro-Brasileiras',
  },
  {
    id: 'transmutacao',
    nome: 'Transmutação',
    nomeIngles: 'Transmutation',
    tipo: 'simbólico',
    elemento: 'fogo',
    chakra: 'coração',
    significado: 'Transformação e renovação através do poder da luz',
    mensagem: 'Você tem o poder de transformar qualquer experiência em crescimento. O que parece destruição é na verdade renascimento.',
    afirmacao: 'Eu transformo sombras em luz e dor em sabedoria',
    cor: 'vermelho',
    simbolos: ['fênix', 'chama', 'borboleta'],
    combinacoes: ['renovacao-interior', 'forca-da-mente'],
    sefirot: ['Gevurah', 'Tipheret'],
    orixa: 'Xangô',
    numeroSagrado: 22,
    tradicao: 'Alquimia Espiritual',
  },
  {
    id: 'intuicao-sagrada',
    nome: 'Intuição Sagrada',
    nomeIngles: 'Sacred Intuition',
    tipo: 'meditativo',
    elemento: 'água',
    chakra: 'terceiro olho',
    significado: 'Despertar da sabedoria interior e percepção espiritual',
    mensagem: 'Sua voz interior está clara. Confie na percepção que vem do silêncio. A resposta que você busca já está dentro de você.',
    afirmacao: 'Eu confio em minha intuição sagrada que me guia com clareza',
    cor: 'índigo',
    simbolos: ['olho', 'espelho', 'lua'],
    combinacoes: ['meditacao-profunda', 'sabedoria-interior'],
    sefirot: ['Binah', 'Chokhmah'],
    orixa: 'Oxalá',
    numeroSagrado: 3,
    tradicao: 'Mistérios Antigos',
  },
  {
    id: 'abundancia-cosmica',
    nome: 'Abundância Cósmica',
    nomeIngles: 'Cosmic Abundance',
    tipo: 'guia',
    elemento: 'terra',
    chakra: 'sacro',
    significado: 'Manifestação de prosperidade e abundância em todas as formas',
    mensagem: 'A abundância é seu direito de nascimento. Abra-se para receber as bênçãos que o universo deseja lhe dar.',
    afirmacao: 'Eu sou digno de abundância e abro espaço para recebê-la',
    cor: 'verde',
    simbolos: ['moeda', 'chuva', 'flores'],
    combinacoes: ['manifestacao', 'gratidao'],
    sefirot: ['Chesed', 'Netzach'],
    orixa: 'Oxum',
    numeroSagrado: 10,
    tradicao: 'Law of Attraction',
  },
  {
    id: 'protecao-divina',
    nome: 'Proteção Divina',
    nomeIngles: 'Divine Protection',
    tipo: 'guia',
    elemento: 'éter',
    chakra: 'coroa',
    significado: 'Escudo espiritual contra energias negativas',
    mensagem: 'Você está envolto em luz protetora. Nada de baixa vibração pode tocar sua essência verdadeira.',
    afirmacao: 'Sou protegido pela luz divina que ilumina meu caminho',
    cor: 'branco',
    simbolos: ['escudo', 'cruz', 'manto'],
    combinacoes: ['purificacao', 'forca-interior'],
    sefirot: ['Gevurah', 'Kether'],
    orixa: 'Ogum',
    numeroSagrado: 7,
    tradicao: 'Tradições Universais',
  },
  {
    id: 'cura-emocional',
    nome: 'Cura Emocional',
    nomeIngles: 'Emotional Healing',
    tipo: 'meditativo',
    elemento: 'água',
    chakra: 'coração',
    significado: 'Liberação de feridas emocionales e renovação do coração',
    mensagem: 'É hora de soltar o que não serve mais. Seu coração está pronto para se abrir para uma nova forma de amar.',
    afirmacao: 'Eu libero o passado e abro espaço para novo amor',
    cor: 'rosa claro',
    simbolos: ['água', 'flor', 'lágrima'],
    combinacoes: ['auto-compaixao', 'forca-interior'],
    sefirot: ['Tipheret', 'Netzach'],
    orixa: 'Oxum',
    numeroSagrado: 11,
    tradicao: 'Terapia Holística',
  },
  {
    id: 'integracao-shadow',
    nome: 'Integração da Sombra',
    nomeIngles: 'Shadow Integration',
    tipo: 'meditativo',
    elemento: 'terra',
    chakra: 'raiz',
    significado: 'Abraçando os aspectos ocultos de si mesmo para wholeness',
    mensagem: 'Seus pontos cegos são portais de crescimento. Ao integrar sua sombra, você se torna inteiro.',
    afirmacao: 'Eu abraço todas as partes de mim, incluindo minha sombra',
    cor: 'roxo',
    simbolos: ['sombra', 'espelho', 'mascara'],
    combinacoes: ['auto-conhecimento', 'transformacao'],
    sefirot: ['Binah', 'Malkuth'],
    orixa: 'Omolu',
    numeroSagrado: 13,
    tradicao: 'Psicologia Junguiana',
  },
  {
    id: 'luz-interior',
    nome: 'Luz Interior',
    nomeIngles: 'Inner Light',
    tipo: 'arquetipal',
    elemento: 'fogo',
    chakra: 'plexo solar',
    significado: 'Despertar da centelha divina dentro de você',
    mensagem: 'Sua luz interior nunca foi apagada. Agora é hora de deixá-la brilhar plenamente.',
    afirmacao: 'Eu sou luz, eu sou amor, eu sou verdade',
    cor: 'amarelo',
    simbolos: ['sol', 'vela', 'diamante'],
    combinacoes: ['despertar', 'auto-realizacao'],
    sefirot: ['Tipheret', 'Kether'],
    orixa: 'Oxalá',
    numeroSagrado: 33,
    tradicao: 'Cabala/Neo-Espiritualidade',
  },
  {
    id: 'harmonia-chakras',
    nome: 'Harmonia dos Chakras',
    nomeIngles: 'Chakra Harmony',
    tipo: 'simbólico',
    elemento: 'éter',
    chakra: 'coroa',
    significado: 'Equilíbrio e alinhamento dos centros de energia',
    mensagem: 'Seus chakras estão se harmonizando. Sinta o fluxo de energia vital percorrendo todo o seu ser.',
    afirmacao: 'Meus chakras estão harmonizados e minha energia flui livremente',
    cor: 'arco-íris',
    simbolos: ['lotus', 'espiral', 'sete-cores'],
    combinacoes: ['meditacao-chakra', 'cura-energetica'],
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    orixa: 'Oxalá',
    numeroSagrado: 7,
    tradicao: 'Yoga/Tantra',
  },
];

// ─── Utility Functions ──────────────────────────────────────────────────────────────
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const parseResult = SpiritualCardsQuerySchema.safeParse({
      id: searchParams.get('id'),
      nome: searchParams.get('nome'),
      tipo: searchParams.get('tipo'),
      elemento: searchParams.get('elemento'),
      chakra: searchParams.get('chakra'),
      random: searchParams.get('random') as 'true' | 'false' | null,
      count: searchParams.get('count'),
      orixa: searchParams.get('orixa'),
      sefirot: searchParams.get('sefirot'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { id, nome, tipo, elemento, chakra, random, count, orixa, sefirot } = parseResult.data;

    // Filter by ID
    if (id) {
      const card = spiritualCards.find((c) => c.id === id);

      if (!card) {
        return NextResponse.json({
          success: false,
          card: null,
          error: 'Carta espiritual não encontrada',
          availableIds: spiritualCards.map(c => c.id),
        }, { status: 404 });
      }

      return NextResponse.json({ success: true, card });
    }

    // Filter by nome
    if (nome) {
      const card = spiritualCards.find(
        (c) =>
          c.nome.toLowerCase() === nome.toLowerCase() ||
          c.nomeIngles.toLowerCase() === nome.toLowerCase()
      );

      if (card) {
        return NextResponse.json({ success: true, card });
      }

      const suggestions = spiritualCards
        .filter(
          (c) =>
            c.nome.toLowerCase().includes(nome.toLowerCase()) ||
            c.nomeIngles.toLowerCase().includes(nome.toLowerCase())
        )
        .map((c) => c.nome);

      return NextResponse.json({
        success: false,
        card: null,
        error: 'Carta espiritual não encontrada',
        suggestions: suggestions.length > 0 ? suggestions : spiritualCards.map((c) => c.nome),
      }, { status: 404 });
    }

    let filtered = [...spiritualCards];

    // Apply filters
    if (tipo) {
      filtered = filtered.filter((c) => c.tipo === tipo);
    }

    if (elemento) {
      filtered = filtered.filter((c) => c.elemento === elemento);
    }

    if (chakra) {
      filtered = filtered.filter((c) => c.chakra === chakra);
    }

    // Spiritual filters
    if (orixa) {
      filtered = filtered.filter((c) =>
        c.orixa?.toLowerCase().includes(orixa.toLowerCase())
      );
    }

    if (sefirot) {
      filtered = filtered.filter((c) =>
        c.sefirot?.some(sf => sf.toLowerCase().includes(sefirot.toLowerCase()))
      );
    }

    // Get random cards
    if (random) {
      const numCards = count || 1;
      const shuffled = shuffleArray(spiritualCards);
      const selected = shuffled.slice(0, numCards);

      return NextResponse.json({
        success: true,
        cartas: selected,
        meta: {
          total: selected.length,
          tipo: 'aleatório',
        },
      });
    }

    // Statistics
    const stats = {
      byTipo: spiritualCards.reduce((acc, c) => {
        acc[c.tipo] = (acc[c.tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElemento: spiritualCards.reduce((acc, c) => {
        acc[c.elemento] = (acc[c.elemento] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byChakra: spiritualCards.reduce((acc, c) => {
        acc[c.chakra] = (acc[c.chakra] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: spiritualCards.reduce((acc, c) => {
        if (c.orixa) acc[c.orixa] = (acc[c.orixa] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // Return filtered or all cards
    return NextResponse.json({
      success: true,
      cartas: filtered,
      total: spiritualCards.length,
      count: filtered.length,
      filters: { tipo, elemento, chakra, orixa, sefirot },
      stats,
      meta: {
        tipos: [...new Set(spiritualCards.map((c) => c.tipo))],
        elementos: [...new Set(spiritualCards.map((c) => c.elemento))],
        chakras: [...new Set(spiritualCards.map((c) => c.chakra))],
      },
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}