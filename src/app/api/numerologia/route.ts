import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SefirotSchema, ChakraSchema, ElementSchema } from '@/lib/api/spiritual-filters';
import { calcularPitagorica, calcularCaldeia, calcularCabalistica, calcularTantrica } from '@/lib/numerologia/calculos';
// ─── Spiritual filter schemas imported from @/lib/api/spiritual-filters ─────

const NumerologiaQuerySchema = z.object({
  tipo: z.enum(['pitagorica', 'caldeia', 'cabalistica', 'tantrica', 'todos']).optional(),
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(200, 'Nome muito longo'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── Number Spiritual Correlations ──────────────────────────────────────────
const NUMERO_SPIRITUAL_CORRELATIONS: Record<number, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  description: string;
}> = {
  1: { sefirot: ['Kether', 'Gevurah'], chakra: 1, element: 'Fogo', orixa: 'Ogum', affirmation: 'Eu inicio minha jornada com coragem', description: 'Início, liderança, individualidade,独立' },
  2: { sefirot: ['Chokhmah', 'Binah'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'A cooperação traz harmonia', description: 'Parceria, cooperação, diplomacia, dualidade' },
  3: { sefirot: ['Chokhmah', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A criatividade flui através de mim', description: 'Expressão, criatividade, comunicação,-socialização' },
  4: { sefirot: ['Malkuth', 'Yesod'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Construo uma base sólida', description: 'Trabalho, disciplina, organização, ordem' },
  5: { sefirot: ['Hod', 'Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'A liberdade me guia', description: 'Liberdade, mudança, aventura, flexibilidade' },
  6: { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O amor e a responsabilidade guiam meu caminho', description: 'Família, responsabilidade, harmonia, serviço' },
  7: { sefirot: ['Binah', 'Hod'], chakra: 6, element: 'Água', orixa: 'Oxalá', affirmation: 'A sabedoria interior me sustenta', description: 'Sabedoria, introspecção, espiritualidade, análise' },
  8: { sefirot: ['Gevurah', 'Malkuth'], chakra: 3, element: 'Terra', orixa: 'Ogum', affirmation: 'O poder justo flui através de mim', description: 'Poder, autoridade, realizações materiais, abundância' },
  9: { sefirot: ['Tipheret', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Sou um canal de compaixão e serviço', description: 'Compaixão, humanitarismo, conclusão, sabedoria' },
  11: { sefirot: ['Kether', 'Chokhmah'], chakra: 6, element: 'Ar', orixa: 'Oxalá', affirmation: 'Minha intuição ilumina o caminho', description: 'Número Mestre - Intuição, iluminação, inspiração, idealismo' },
  22: { sefirot: ['Chesed', 'Gevurah'], chakra: 4, element: 'Terra', orixa: 'Ogum', affirmation: 'Transformo visões em realidade', description: 'Número Mestre - Mestre Construtor, realizações práticas, manifestação' },
  33: { sefirot: ['Tipheret', 'Kether'], chakra: 7, element: 'Fogo', orixa: 'Oxalá', affirmation: 'Sou um canal de amor divino', description: 'Número Mestre - Mestre Professor, amor incondicional, cura espiritual' },
};

// ─── Method Spiritual Correlations ──────────────────────────────────────────
const METHOD_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  description: string;
}> = {
  pitagorica: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    description: 'Método Ocidental baseado na tabela pitagórica',
  },
  caldeia: {
    sefirot: ['Chokhmah', 'Yesod'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    description: 'Método caldeu que considera apenas números1-8',
  },
  cabalistica: {
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    description: 'Método cabalístico baseado na Árvore da Vida',
  },
  tantrica: {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    description: 'Método tântrico baseado na data de nascimento',
  },
};

function getSpiritualCorrelations(numero: number) {
  const n = numero % 9 === 0 ? 9 : numero % 9 || numero;
  return NUMERO_SPIRITUAL_CORRELATIONS[numero] || NUMERO_SPIRITUAL_CORRELATIONS[n] || {
    sefirot: ['Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'O número revela minha verdade',
    description: 'Energia a ser explorada',
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = NumerologiaQuerySchema.safeParse({
    tipo: searchParams.get('tipo'),
    nome: searchParams.get('nome'),
    data: searchParams.get('data'),
    sefirot: searchParams.get('sefirot'),
    chakra: searchParams.get('chakra'),
    element: searchParams.get('element'),
  });

  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { tipo, nome, data } = parseResult.data;
  const headers = new Headers();
  headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=7200');

  try {
    const pitagorica = calcularPitagorica(nome);
    const caldeia = calcularCaldeia(nome);
    const cabalistica = calcularCabalistica(nome);
    const tantrica = data ? calcularTantrica(data) : null;

    switch (tipo) {
      case 'pitagorica': {
        const corr = getSpiritualCorrelations(pitagorica);
        return NextResponse.json({
          success: true,
          tipo: 'pitagorica',
          numero: pitagorica,
          spiritualCorrelations: {
            sefirot: corr.sefirot,
            chakra: corr.chakra,
            element: corr.element,
            orixa: corr.orixa,
            affirmation: corr.affirmation,
            description: corr.description,
          },
          methodCorrelations: METHOD_CORRELATIONS.pitagorica,
          timestamp: new Date().toISOString()
        }, { headers });
      }
      case 'caldeia': {
        const corr = getSpiritualCorrelations(caldeia);
        return NextResponse.json({
          success: true,
          tipo: 'caldeia',
          numero: caldeia,
          spiritualCorrelations: {
            sefirot: corr.sefirot,
            chakra: corr.chakra,
            element: corr.element,
            orixa: corr.orixa,
            affirmation: corr.affirmation,
            description: corr.description,
          },
          methodCorrelations: METHOD_CORRELATIONS.caldeia,
          timestamp: new Date().toISOString()
        }, { headers });
      }
      case 'cabalistica': {
        const corr = getSpiritualCorrelations(cabalistica);
        return NextResponse.json({
          success: true,
          tipo: 'cabalistica',
          numero: cabalistica,
          spiritualCorrelations: {
            sefirot: corr.sefirot,
            chakra: corr.chakra,
            element: corr.element,
            orixa: corr.orixa,
            affirmation: corr.affirmation,
            description: corr.description,
          },
          methodCorrelations: METHOD_CORRELATIONS.cabalistica,
          timestamp: new Date().toISOString()
        }, { headers });
      }
      case 'tantrica': {
        const corr = getSpiritualCorrelations(tantrica || 0);
        return NextResponse.json({
          success: true,
          tipo: 'tantrica',
          numero: tantrica,
          data: data,
          spiritualCorrelations: {
            sefirot: corr.sefirot,
            chakra: corr.chakra,
            element: corr.element,
            orixa: corr.orixa,
            affirmation: corr.affirmation,
            description: corr.description,
          },
          methodCorrelations: METHOD_CORRELATIONS.tantrica,
          timestamp: new Date().toISOString()
        }, { headers });
      }
      default: {
        const allCorr = {
          pitagorica: getSpiritualCorrelations(pitagorica),
          caldeia: getSpiritualCorrelations(caldeia),
          cabalistica: getSpiritualCorrelations(cabalistica),
          tantrica: tantrica ? getSpiritualCorrelations(tantrica) : null,
        };

        return NextResponse.json({
          success: true,
          tipo: 'todos',
          pitagorica,
          caldeia,
          cabalistica,
          tantrica,
          spiritualCorrelations: allCorr,
          methods: METHOD_CORRELATIONS,
          timestamp: new Date().toISOString()
        }, { headers });
      }
    }
  } catch (error) {
    console.error('Erro no cálculo de numerologia:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar cálculo numerológico' },
      { status: 500, headers }
    );
  }
}