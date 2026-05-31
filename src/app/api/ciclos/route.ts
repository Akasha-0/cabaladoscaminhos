import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCiclosTemporais, calcularAnoPessoal, calcularMesPessoal, calcularDiaPessoal } from '@/lib/numerologia/ciclos';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const CiclosQuerySchema = z.object({
  tipo: z.enum(['ano', 'mes', 'dia', 'todos']).optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── Cycle Spiritual Correlations ──────────────────────────────────────────
const NUMERO_SPIRITUAL_CORRELATIONS: Record<number, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  description: string;
}> = {
  1: { sefirot: ['Kether', 'Gevurah'], chakra: 1, element: 'Fogo', orixa: 'Ogum', affirmation: 'Eu inicio minha jornada com coragem', description: 'Início, liderança, individualidade' },
  2: { sefirot: ['Chokhmah', 'Binah'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'A cooperação traz harmonia', description: 'Parceria, cooperação, diplomacia' },
  3: { sefirot: ['Chokhmah', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A criatividade flui através de mim', description: 'Expressão, criatividade, comunicação' },
  4: { sefirot: ['Malkuth', 'Yesod'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Construo uma base sólida', description: 'Trabalho, disciplina, organização' },
  5: { sefirot: ['Hod', 'Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'A liberdade me guia', description: 'Liberdade, mudança, aventura' },
  6: { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O amor e a responsabilidade guiam meu caminho', description: 'Família, responsabilidade, harmonia' },
  7: { sefirot: ['Binah', 'Hod'], chakra: 6, element: 'Água', orixa: 'Oxalá', affirmation: 'A sabedoria interior me sustenta', description: 'Sabedoria, introspecção, espiritualidade' },
  8: { sefirot: ['Gevurah', 'Malkuth'], chakra: 3, element: 'Terra', orixa: 'Ogum', affirmation: 'O poder justo flui através de mim', description: 'Poder, autoridade, realizações materiais' },
  9: { sefirot: ['Tipheret', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Sou um canal de compaixão e serviço', description: 'Compaixão, humanitarismo, conclusão' },
  11: { sefirot: ['Kether', 'Chokhmah'], chakra: 6, element: 'Ar', orixa: 'Oxalá', affirmation: 'Minha intuição ilumina o caminho', description: 'Número Mestre - Intuição, iluminação, inspiração' },
  22: { sefirot: ['Chesed', 'Gevurah'], chakra: 4, element: 'Terra', orixa: 'Ogum', affirmation: 'Transformo visões em realidade', description: 'Número Mestre - Mestre Construtor, realizações práticas' },
  33: { sefirot: ['Tipheret', 'Kether'], chakra: 7, element: 'Fogo', orixa: 'Oxalá', affirmation: 'Sou um canal de amor divino', description: 'Número Mestre - Mestre Professor, amor incondicional' },
};

// ─── Element Correlations by Number ──────────────────────────────────────────
const ELEMENT_BY_NUMBER: Record<number, string> = {
  1: 'Fogo', 2: 'Água', 3: 'Ar', 4: 'Terra', 5: 'Fogo',
  6: 'Fogo', 7: 'Água', 8: 'Terra', 9: 'Água',
  11: 'Ar', 22: 'Terra', 33: 'Fogo',
};

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = CiclosQuerySchema.safeParse({
    tipo: searchParams.get('tipo'),
    data: searchParams.get('data'),
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

  const { tipo, data: dataNascimento, sefirot, chakra, element } = parseResult.data;
  const headers = new Headers();
  headers.set('Cache-Control', 'private, max-age=43200, stale-while-revalidate=86400');

  const date = new Date(dataNascimento);
  if (isNaN(date.getTime())) {
    return NextResponse.json(
      { success: false, error: 'Data inválida' },
      { status: 400, headers }
    );
  }

  try {
    switch (tipo?.toLowerCase()) {
      case 'ano': {
        const anoInfo = calcularAnoPessoal(dataNascimento);
        const corr = NUMERO_SPIRITUAL_CORRELATIONS[anoInfo.numero] || NUMERO_SPIRITUAL_CORRELATIONS[anoInfo.numero % 9 + 1];
        return NextResponse.json({
          success: true,
          tipo: 'ano',
          ...anoInfo,
          spiritualCorrelations: {
            sefirot: corr?.sefirot || [],
            chakra: corr?.chakra,
            element: corr?.element || ELEMENT_BY_NUMBER[anoInfo.numero] || 'Ar',
            orixa: corr?.orixa,
            affirmation: corr?.affirmation,
            description: corr?.description,
          },
          timestamp: new Date().toISOString()
        }, { headers });
      }
      case 'mes': {
        const anoInfo = calcularAnoPessoal(dataNascimento);
        const mesInfo = calcularMesPessoal(anoInfo.numero);
        const corr = NUMERO_SPIRITUAL_CORRELATIONS[mesInfo.numero] || NUMERO_SPIRITUAL_CORRELATIONS[mesInfo.numero % 9 + 1];
        return NextResponse.json({
          success: true,
          tipo: 'mes',
          ...mesInfo,
          spiritualCorrelations: {
            sefirot: corr?.sefirot || [],
            chakra: corr?.chakra,
            element: corr?.element || ELEMENT_BY_NUMBER[mesInfo.numero] || 'Ar',
            orixa: corr?.orixa,
            affirmation: corr?.affirmation,
            description: corr?.description,
          },
          timestamp: new Date().toISOString()
        }, { headers });
      }
      case 'dia': {
        const anoInfo = calcularAnoPessoal(dataNascimento);
        const diaInfo = calcularDiaPessoal(dataNascimento, anoInfo.numero);
        const corr = NUMERO_SPIRITUAL_CORRELATIONS[diaInfo.numero] || NUMERO_SPIRITUAL_CORRELATIONS[diaInfo.numero % 9 + 1];
        return NextResponse.json({
          success: true,
          tipo: 'dia',
          ...diaInfo,
          spiritualCorrelations: {
            sefirot: corr?.sefirot || [],
            chakra: corr?.chakra,
            element: corr?.element || ELEMENT_BY_NUMBER[diaInfo.numero] || 'Ar',
            orixa: corr?.orixa,
            affirmation: corr?.affirmation,
            description: corr?.description,
          },
          timestamp: new Date().toISOString()
        }, { headers });
      }
      case 'todos':
      case undefined: {
        const ciclos = getCiclosTemporais(dataNascimento);
        const enrichedCiclos = ciclos.map(ciclo => {
          const num = ciclo.numero;
          const corr = NUMERO_SPIRITUAL_CORRELATIONS[num] || NUMERO_SPIRITUAL_CORRELATIONS[num % 9 + 1];
          return {
            ...ciclo,
            spiritualCorrelations: {
              sefirot: corr?.sefirot || [],
              chakra: corr?.chakra,
              element: corr?.element || ELEMENT_BY_NUMBER[num] || 'Ar',
              orixa: corr?.orixa,
              affirmation: corr?.affirmation,
              description: corr?.description,
            },
          };
        });

        // Filter by spiritual correlations if requested
        let filteredCiclos = enrichedCiclos;
        if (sefirot) {
          filteredCiclos = filteredCiclos.filter(c =>
            c.spiritualCorrelations.sefirot.includes(sefirot)
          );
        }
        if (chakra) {
          filteredCiclos = filteredCiclos.filter(c =>
            c.spiritualCorrelations.chakra === chakra
          );
        }
        if (element) {
          filteredCiclos = filteredCiclos.filter(c =>
            c.spiritualCorrelations.element === element
          );
        }

        // Statistics
        const stats = {
          byElement: enrichedCiclos.reduce((acc, c) => {
            const el = c.spiritualCorrelations.element;
            if (el) {
              acc[el] = (acc[el] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>),
          byChakra: enrichedCiclos.reduce((acc, c) => {
            const ch = c.spiritualCorrelations.chakra;
            if (ch) {
              acc[ch] = (acc[ch] || 0) + 1;
            }
            return acc;
          }, {} as Record<number, number>),
          bySefirot: enrichedCiclos.reduce((acc, c) => {
            c.spiritualCorrelations.sefirot.forEach(sf => {
              acc[sf] = (acc[sf] || 0) + 1;
            });
            return acc;
          }, {} as Record<string, number>),
          byOrixa: enrichedCiclos.reduce((acc, c) => {
            const o = c.spiritualCorrelations.orixa;
            if (o) {
              acc[o] = (acc[o] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>),
        };

        return NextResponse.json({
          success: true,
          tipo: 'todos',
          ciclos: filteredCiclos,
          stats,
          timestamp: new Date().toISOString()
        }, { headers });
      }
      default:
        return NextResponse.json(
          { success: false, error: `Tipo "${tipo}" não reconhecido. Tipos disponíveis: ano, mes, dia, todos` },
          { status: 400, headers }
        );
    }
  } catch (error) {
    console.error('Erro no cálculo de ciclos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar cálculo de ciclos temporais' },
      { status: 500, headers }
    );
  }
}