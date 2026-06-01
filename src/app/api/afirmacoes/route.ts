// ============================================================
// AFIRMAÇÕES API - CABALA DOS CAMINHOS
// Daily affirmations by spiritual tradition
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);
const CategoriaSchema = z.enum(['cabala', 'numerologia', 'orixas', 'all']);
const OrixaSchema = z.enum(['Oxalá', 'Iemanjá', 'Ogum', 'Xangô', 'Oxum', 'Iansã', 'Oxóssi', 'Orunmilá', 'Omolu', 'Ibeji', 'Oxumaré', 'Nanã', 'Eshu', 'Logun Edé', 'Pomba Gira']);

const AfirmacaoQuerySchema = z.object({
  categoria: CategoriaSchema.optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: OrixaSchema.optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

const AfirmacaoResponseSchema = z.object({
  texto: z.string(),
  fonte: z.string(),
  categoria: z.string(),
  spiritualCorrelations: z.object({
    sefirot: z.array(z.string()),
    chakra: z.number(),
    element: z.string(),
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }),
});

const CATEGORIAS_VALIDAS = ['cabala', 'numerologia', 'orixas'] as const;
type Categoria = 'cabala' | 'numerologia' | 'orixas';

// ─── Spiritual Correlations by Category ──────────────────────────────────────────
const CATEGORY_SPIRITUAL_CORRELATIONS: Record<Categoria, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  cabala: {
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Eu sou luz, eu sou amor, eu sou uno com o divino',
    frequency: '963 Hz',
  },
  numerologia: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'A vibração do número guia minha jornada de alma',
    frequency: '741 Hz',
  },
  orixas: {
    sefirot: ['Tipheret', 'Chesed', 'Gevurah', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A energia do Orixá flui através de mim em harmonia',
    frequency: '528 Hz',
  },
};

// ─── Affirmations Data with Spiritual Correlations ──────────────────────────────────────────
const AFIRMACOES_POR_CATEGORIA: Record<Categoria, Array<{
  texto: string;
  fonte: string;
  categoria: Categoria;
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}>> = {
  cabala: [
    { texto: 'Eu sou parte da luz divina que ilumina o universo inteiro.', fonte: 'Séfer Yetzirá', categoria: 'cabala', sefirot: ['Kether'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Eu sou luz', frequency: '963 Hz' },
    { texto: 'Minhas palavras carregam poder sagrado quando alinhadas à verdade.', fonte: 'Zohar', categoria: 'cabala', sefirot: ['Hod', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Xangô', affirmation: 'A verdade me liberta', frequency: '741 Hz' },
    { texto: 'Através da árvore da vida, declaro minha expansão consciente.', fonte: 'Cabala Moderna', categoria: 'cabala', sefirot: ['Tipheret', 'Yesod'], chakra: 6, element: 'Fogo', orixa: 'Oxum', affirmation: 'Eu me expando', frequency: '528 Hz' },
    { texto: 'Cada Sephirah é um portal de transformação na minha jornada.', fonte: 'Meditação Cabalística', categoria: 'cabala', sefirot: ['Chokhmah', 'Binah', 'Chesed', 'Gevurah'], chakra: 6, element: 'Fogo', orixa: 'Orunmilá', affirmation: 'Cada portal se abre', frequency: '639 Hz' },
    { texto: 'Eu me conecto às energias superiores para guiá-lo em meu caminho.', fonte: 'Oração Cabalística', categoria: 'cabala', sefirot: ['Kether', 'Tipheret'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Guia-me, ó luz', frequency: '963 Hz' },
  ],
  numerologia: [
    { texto: 'Meu número de vida é a vibração que guia meus passos.', fonte: 'Pitágoras', categoria: 'numerologia', sefirot: ['Chokhmah'], chakra: 6, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Minha vibração é pura', frequency: '741 Hz' },
    { texto: 'A energia do número 1 me dá força para iniciar novas jornadas.', fonte: 'Numerologia', categoria: 'numerologia', sefirot: ['Kether', 'Gevurah'], chakra: 1, element: 'Fogo', orixa: 'Ogum', affirmation: 'Eu inicio com poder', frequency: '528 Hz' },
    { texto: 'Cada dígito carrega sabedoria ancestral que me transforma.', fonte: 'Cálculo Vibracional', categoria: 'numerologia', sefirot: ['Binah', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'A sabedoria me transforma', frequency: '639 Hz' },
    { texto: 'Minhas ciclos pessoais estão alinhados com o propósito divino.', fonte: 'Análise Numérica', categoria: 'numerologia', sefirot: ['Tipheret', 'Netzach'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Meus ciclos servem ao divino', frequency: '528 Hz' },
    { texto: 'A soma dos meus dias revela o caminho da minha alma.', fonte: 'Numerologia Espiritual', categoria: 'numerologia', sefirot: ['Chokhmah', 'Binah'], chakra: 6, element: 'Ar', orixa: 'Orunmilá', affirmation: 'O caminho se revela', frequency: '741 Hz' },
  ],
  orixas: [
    { texto: 'Xangô me concede a força da justiça e o equilíbrio das emoções.', fonte: 'Tradição Iorubá', categoria: 'orixas', sefirot: ['Gevurah', 'Tipheret'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'Justiça e equilíbrio me guiam', frequency: '528 Hz' },
    { texto: 'Iemanjá abençoa minha jornada com proteção e fluidez.', fonte: 'Louvação a Iemanjá', categoria: 'orixas', sefirot: ['Binah', 'Yesod'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'Fluo como as águas sagradas', frequency: '639 Hz' },
    { texto: 'Ogum abre os caminhos quando minha determinação é firme.', fonte: 'Oração a Ogum', categoria: 'orixas', sefirot: ['Malkuth', 'Gevurah'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Ogum abre meu caminho', frequency: '396 Hz' },
    { texto: 'Oxum revela a beleza interior e a prosperidade consciente.', fonte: 'Saudação a Oxum', categoria: 'orixas', sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Beleza e prosperidade me adornam', frequency: '528 Hz' },
    { texto: 'Olorum sincroniza minha alma com a energia criadora do universo.', fonte: 'Oração Ancestral', categoria: 'orixas', sefirot: ['Kether', 'Chokhmah'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Sincronizo-me com o Criador', frequency: '963 Hz' },
  ],
};

function getDiaDoAno(): number {
  const agora = new Date();
  return Math.floor(
    (agora.getTime() - new Date(agora.getFullYear(), 0, 0).getTime()) / 86400000
  );
}

function selectAfirmacao(categoria: Categoria) {
  const afirmacoes = AFIRMACOES_POR_CATEGORIA[categoria];
  const indice = getDiaDoAno() % afirmacoes.length;
  return afirmacoes[indice];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = AfirmacaoQuerySchema.safeParse({
      categoria: searchParams.get('categoria'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
      limit: searchParams.get('limit'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { categoria, sefirot, chakra, element, orixa, limit } = parseResult.data;
    const catCorr = CATEGORY_SPIRITUAL_CORRELATIONS[categoria as Categoria];

    // If category is 'all', return all affirmations from all categories
    if (categoria === 'all' || !categoria) {
      let allAfirmacoes: ReturnType<typeof selectAfirmacao>[] = [];

      for (const cat of CATEGORIAS_VALIDAS) {
        for (const af of AFIRMACOES_POR_CATEGORIA[cat]) {
          allAfirmacoes.push({ ...af, categoria: cat });
        }
      }

      // Apply spiritual filters
      if (sefirot) {
        allAfirmacoes = allAfirmacoes.filter(a => a.sefirot.includes(sefirot));
      }
      if (chakra) {
        allAfirmacoes = allAfirmacoes.filter(a => a.chakra === chakra);
      }
      if (element) {
        allAfirmacoes = allAfirmacoes.filter(a => a.element === element);
      }
      if (orixa) {
        allAfirmacoes = allAfirmacoes.filter(a => a.orixa === orixa);
      }

      // Apply limit
      if (limit && limit < allAfirmacoes.length) {
        allAfirmacoes = allAfirmacoes.slice(0, limit);
      }

      // Add spiritual correlations
      const enriched = allAfirmacoes.map(af => ({
        texto: af.texto,
        fonte: af.fonte,
        categoria: af.categoria,
        spiritualCorrelations: {
          sefirot: af.sefirot,
          chakra: af.chakra,
          element: af.element,
          orixa: af.orixa,
          affirmation: af.affirmation,
          frequency: af.frequency,
        },
      }));

      // Calculate spiritual stats
      const spiritualStats = {
        bySefirot: allAfirmacoes.reduce((acc, af) => {
          af.sefirot.forEach(s => {
            acc[s] = (acc[s] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>),
        byChakra: allAfirmacoes.reduce((acc, af) => {
          acc[af.chakra] = (acc[af.chakra] || 0) + 1;
          return acc;
        }, {} as Record<number, number>),
        byElement: allAfirmacoes.reduce((acc, af) => {
          acc[af.element] = (acc[af.element] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byOrixa: allAfirmacoes.reduce((acc, af) => {
          acc[af.orixa] = (acc[af.orixa] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byCategoria: CATEGORIAS_VALIDAS.reduce((acc, cat) => {
          acc[cat] = AFIRMACOES_POR_CATEGORIA[cat].length;
          return acc;
        }, {} as Record<string, number>),
      };

      return NextResponse.json({
        success: true,
        affirmations: enriched,
        count: enriched.length,
        spiritualCorrelations: {
          categories: CATEGORY_SPIRITUAL_CORRELATIONS,
        },
        spiritualStats,
        meta: {
          filters: { sefirot, chakra, element, orixa, limit },
        },
      });
    }

    // Validate category
    if (!CATEGORIAS_VALIDAS.includes(categoria as Categoria)) {
      return NextResponse.json({
        success: false,
        error: 'Categoria inválida',
        categories: [...CATEGORIAS_VALIDAS, 'all'],
      }, { status: 400 });
    }

    const afirmacao = selectAfirmacao(categoria as Categoria);

    // Apply spiritual filters
    if (sefirot && !afirmacao.sefirot.includes(sefirot)) {
      return NextResponse.json({
        success: false,
        error: 'Nenhuma afirmação encontrada para este filtro',
      }, { status: 404 });
    }
    if (chakra && afirmacao.chakra !== chakra) {
      return NextResponse.json({
        success: false,
        error: 'Nenhuma afirmação encontrada para este filtro',
      }, { status: 404 });
    }
    if (element && afirmacao.element !== element) {
      return NextResponse.json({
        success: false,
        error: 'Nenhuma afirmação encontrada para este filtro',
      }, { status: 404 });
    }
    if (orixa && afirmacao.orixa !== orixa) {
      return NextResponse.json({
        success: false,
        error: 'Nenhuma afirmação encontrada para este filtro',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      affirmation: {
        texto: afirmacao.texto,
        fonte: afirmacao.fonte,
        categoria,
        spiritualCorrelations: {
          sefirot: afirmacao.sefirot,
          chakra: afirmacao.chakra,
          element: afirmacao.element,
          orixa: afirmacao.orixa,
          affirmation: afirmacao.affirmation,
          frequency: afirmacao.frequency,
        },
      },
      categoryCorrelations: catCorr,
      spiritualCorrelations: {
        categories: CATEGORY_SPIRITUAL_CORRELATIONS,
      },
      meta: {
        diaDoAno: getDiaDoAno(),
        data: new Date().toISOString().split('T')[0],
        filters: { sefirot, chakra, element, orixa },
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