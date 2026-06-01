// ============================================================
// SACRED TEXTS API - CABALA DOS CAMINHOS
// Sacred texts commentary and scholarly interpretations
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCommentary, getCommentaryByText, getCommentaryBySchool, getScholars, getScholarById } from '@/lib/sacred-texts/commentary-library';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const SacredTextsQuerySchema = z.object({
  resource: z.enum(['commentary', 'scholars', 'all']).optional().default('commentary'),
  id: z.string().optional(),
  textId: z.string().optional(),
  school: z.enum(['rabbinic', 'patristic', 'sufi', 'vedic', 'zen']).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── School Spiritual Correlations ──────────────────────────────────────────
const SCHOOL_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
  description: string;
}> = {
  rabbinic: {
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A sabedoria da Torá ilumina minha alma',
    frequency: '963 Hz',
    description: 'Tradição rabínica da Cabala e escritura sagrada judaica',
  },
  patristic: {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O amor divino habita em meu coração',
    frequency: '528 Hz',
    description: 'Tradição patrística e escritura sagrada cristã',
  },
  sufi: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'O divino dança através de mim',
    frequency: '741 Hz',
    description: 'Tradição sufista e misticismo islâmico',
  },
  vedic: {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A verdade védica liberta minha consciência',
    frequency: '963 Hz',
    description: 'Tradição védica e escritura sagrada hindu',
  },
  zen: {
    sefirot: ['Kether', 'Tipheret'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Na silêncio, encontro minha verdadeira natureza',
    frequency: '963 Hz',
    description: 'Tradição Zen e ensinamentos budistas',
  },
};

// ─── Text Spiritual Correlations ──────────────────────────────────────────
const TEXT_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'torah': {
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A luz da Torá guia meus passos',
    frequency: '963 Hz',
  },
  'bible': {
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A palavra de Deus habita em meu coração',
    frequency: '528 Hz',
  },
  'quran': {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'O Alcorão ilumina minha alma',
    frequency: '741 Hz',
  },
  'bhagavad-gita': {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A presença divina sustenta todo o universo',
    frequency: '963 Hz',
  },
  'tao-te-ching': {
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 5,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'O Tao flui através de todos os seres',
    frequency: '639 Hz',
  },
  'australian-sacred': {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'A sabedoria ancestral da terra me sustenta',
    frequency: '396 Hz',
  },
  'african-sacred': {
    sefirot: ['Chesed', 'Gevurah'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Os ancestrais guiam minha jornada',
    frequency: '528 Hz',
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = SacredTextsQuerySchema.safeParse({
      resource: searchParams.get('resource'),
      id: searchParams.get('id'),
      textId: searchParams.get('textId'),
      school: searchParams.get('school'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { resource, id, textId, school, sefirot, chakra, element, orixa } = parseResult.data;

    // Return all resources with spiritual correlations
    if (resource === 'all') {
      const commentaries = getCommentary();
      const scholars = getScholars();

      // Add spiritual correlations to commentaries
      const enrichedCommentaries = commentaries.map(c => {
        const textKey = c.textId || 'torah';
        const corr = TEXT_SPIRITUAL_CORRELATIONS[textKey] || TEXT_SPIRITUAL_CORRELATIONS['torah'];
        const schoolCorr = SCHOOL_SPIRITUAL_CORRELATIONS[school || 'rabbinic'] || SCHOOL_SPIRITUAL_CORRELATIONS['rabbinic'];
        return {
          ...c,
          spiritualCorrelations: corr,
          schoolCorrelations: schoolCorr,
        };
      });

      // Calculate spiritual stats
      const spiritualStats = {
        bySchool: Object.keys(SCHOOL_SPIRITUAL_CORRELATIONS).reduce((acc, s) => {
          acc[s] = commentaries.filter(c => c.school === s).length;
          return acc;
        }, {} as Record<string, number>),
        bySefirot: commentaries.reduce((acc, c) => {
          const textKey = c.textId || 'torah';
          const corr = TEXT_SPIRITUAL_CORRELATIONS[textKey];
          if (corr) {
            corr.sefirot.forEach(s => {
              acc[s] = (acc[s] || 0) + 1;
            });
          }
          return acc;
        }, {} as Record<string, number>),
        byChakra: commentaries.reduce((acc, c) => {
          const textKey = c.textId || 'torah';
          const corr = TEXT_SPIRITUAL_CORRELATIONS[textKey];
          if (corr) {
            const ch = corr.chakra;
            acc[ch] = (acc[ch] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>),
        byElement: commentaries.reduce((acc, c) => {
          const textKey = c.textId || 'torah';
          const corr = TEXT_SPIRITUAL_CORRELATIONS[textKey];
          if (corr) {
            const e = corr.element;
            acc[e] = (acc[e] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>),
      };

      return NextResponse.json({
        success: true,
        commentaries: enrichedCommentaries,
        scholars,
        spiritualCorrelations: {
          schools: SCHOOL_SPIRITUAL_CORRELATIONS,
          texts: TEXT_SPIRITUAL_CORRELATIONS,
        },
        spiritualStats,
        meta: {
          resource: 'all',
          filters: { school, sefirot, chakra, element, orixa },
        },
      });
    }

    // Return scholars
    if (resource === 'scholars') {
      let scholars = getScholars();

      // Apply spiritual filters
      if (school) {
        scholars = scholars.filter(s => s.tradition === school);
      }

      if (sefirot) {
        const schoolCorr = SCHOOL_SPIRITUAL_CORRELATIONS[school || ''];
        if (schoolCorr && !schoolCorr.sefirot.includes(sefirot)) {
          return NextResponse.json({
            success: false,
            error: 'Nenhum texto encontrado para este filtro',
          }, { status: 404 });
        }
      }

      if (chakra) {
        const schoolCorr = SCHOOL_SPIRITUAL_CORRELATIONS[school || ''];
        if (schoolCorr && schoolCorr.chakra !== chakra) {
          return NextResponse.json({
            success: false,
            error: 'Nenhum texto encontrado para este filtro',
          }, { status: 404 });
        }
      }

      if (element) {
        const schoolCorr = SCHOOL_SPIRITUAL_CORRELATIONS[school || ''];
        if (schoolCorr && schoolCorr.element !== element) {
          return NextResponse.json({
            success: false,
            error: 'Nenhum texto encontrado para este filtro',
          }, { status: 404 });
        }
      }

      if (orixa) {
        const schoolCorr = SCHOOL_SPIRITUAL_CORRELATIONS[school || ''];
        if (schoolCorr && schoolCorr.orixa !== orixa) {
          return NextResponse.json({
            success: false,
            error: 'Nenhum texto encontrado para este filtro',
          }, { status: 404 });
        }
      }

      return NextResponse.json({
        success: true,
        scholars,
        count: scholars.length,
        spiritualCorrelations: SCHOOL_SPIRITUAL_CORRELATIONS,
        meta: {
          resource: 'scholars',
          filters: { school, sefirot, chakra, element, orixa },
        },
      });
    }

    // Default: commentary resource
    let commentaries = getCommentary();

    // Filter by ID
    if (id) {
      const filtered = getCommentaryByText(id);
      if (filtered.length === 0) {
        return NextResponse.json({ error: 'Commentary not found' }, { status: 404 });
      }
      commentaries = filtered;
    }

    if (textId) {
      commentaries = getCommentaryByText(textId);
    }

    if (school) {
      commentaries = getCommentaryBySchool(school);
    }

    // Apply spiritual filters
    if (sefirot) {
      commentaries = commentaries.filter(c => {
        const textKey = c.textId || 'torah';
        const corr = TEXT_SPIRITUAL_CORRELATIONS[textKey];
        return corr && corr.sefirot.includes(sefirot);
      });
    }

    if (chakra) {
      commentaries = commentaries.filter(c => {
        const textKey = c.textId || 'torah';
        const corr = TEXT_SPIRITUAL_CORRELATIONS[textKey];
        return corr && corr.chakra === chakra;
      });
    }

    if (element) {
      commentaries = commentaries.filter(c => {
        const textKey = c.textId || 'torah';
        const corr = TEXT_SPIRITUAL_CORRELATIONS[textKey];
        return corr && corr.element === element;
      });
    }

    if (orixa) {
      commentaries = commentaries.filter(c => {
        const textKey = c.textId || 'torah';
        const corr = TEXT_SPIRITUAL_CORRELATIONS[textKey];
        return corr && corr.orixa === orixa;
      });
    }

    // Add spiritual correlations to commentaries
    const enrichedCommentaries = commentaries.map(c => {
      const textKey = c.textId || 'torah';
      const corr = TEXT_SPIRITUAL_CORRELATIONS[textKey] || TEXT_SPIRITUAL_CORRELATIONS['torah'];
      const schoolCorr = SCHOOL_SPIRITUAL_CORRELATIONS[c.school] || SCHOOL_SPIRITUAL_CORRELATIONS['rabbinic'];
      return {
        ...c,
        spiritualCorrelations: corr,
        schoolCorrelations: schoolCorr,
      };
    });

    // Calculate spiritual stats
    const spiritualStats = {
      bySchool: commentaries.reduce((acc, c) => {
        acc[c.school] = (acc[c.school] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: commentaries.reduce((acc, c) => {
        const textKey = c.textId || 'torah';
        const corr = TEXT_SPIRITUAL_CORRELATIONS[textKey];
        if (corr) {
          corr.sefirot.forEach(s => {
            acc[s] = (acc[s] || 0) + 1;
          });
        }
        return acc;
      }, {} as Record<string, number>),
      byChakra: commentaries.reduce((acc, c) => {
        const textKey = c.textId || 'torah';
        const corr = TEXT_SPIRITUAL_CORRELATIONS[textKey];
        if (corr) {
          const ch = corr.chakra;
          acc[ch] = (acc[ch] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      byElement: commentaries.reduce((acc, c) => {
        const textKey = c.textId || 'torah';
        const corr = TEXT_SPIRITUAL_CORRELATIONS[textKey];
        if (corr) {
          const e = corr.element;
          acc[e] = (acc[e] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      byOrixa: commentaries.reduce((acc, c) => {
        const textKey = c.textId || 'torah';
        const corr = TEXT_SPIRITUAL_CORRELATIONS[textKey];
        if (corr) {
          const o = corr.orixa;
          acc[o] = (acc[o] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      commentaries: enrichedCommentaries,
      count: enrichedCommentaries.length,
      spiritualCorrelations: {
        texts: TEXT_SPIRITUAL_CORRELATIONS,
        schools: SCHOOL_SPIRITUAL_CORRELATIONS,
      },
      spiritualStats,
      meta: {
        resource: 'commentary',
        filters: { id, textId, school, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}