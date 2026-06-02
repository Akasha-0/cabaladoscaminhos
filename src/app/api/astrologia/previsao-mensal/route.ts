import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const ZodiacSignSchema = z.enum([
  'aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem',
  'libra', 'escorpiao', 'sagitario', 'capricornio', 'aquario', 'peixes'
]);

const MonthQuerySchema = z.object({
  mes: z.coerce.number().int().min(1).max(12).optional(),
  ano: z.coerce.number().int().min(2000).max(2100).optional(),
  signo: ZodiacSignSchema.optional(),
});

const MonthlyPredictionSchema = z.object({
  mes: z.number(),
  ano: z.number(),
  signosFavoraveis: z.array(z.string()),
  desafios: z.array(z.string()),
  oportunidades: z.array(z.string()),
  energiaDominante: z.string(),
  faseLunar: z.string(),
  sefirotTransitos: z.array(z.string()),
  orixasFavoraveis: z.array(z.string()),
});

// ─── Monthly Astrological Data ─────────────────────────────────────────────

const MONTHLY_PATTERNS: z.infer<typeof MonthlyPredictionSchema>[] = [
  {
    mes: 1,
    ano: 2024,
    signosFavoraveis: ['Capricórnio', 'Touro', 'Virgem'],
    desafios: ['Tensão entre inovação e tradição', 'Impaciência com processos lentos'],
    oportunidades: ['Novos projetos com fundamento sólido', 'Conexões profissionais duradouras'],
    energiaDominante: 'Integração entre Saturno e Urano',
    faseLunar: 'Nova Lua em Capricórnio',
    sefirotTransitos: ['Chesed', 'Gevurah'],
    orixasFavoraveis: ['Ogum', 'Xangô'],
  },
  {
    mes: 2,
    ano: 2024,
    signosFavoraveis: ['Aquário', 'Gêmeos', 'Libra'],
    desafios: ['Desordem emocional', 'Comunicação mal interpretada'],
    oportunidades: ['Colaborações criativas', 'Amizades que transformam perspectivas'],
    energiaDominante: 'Era de Aquário acelerada',
    faseLunar: 'Lua Cheia em Leão',
    sefirotTransitos: ['Chokhmah', 'Binah'],
    orixasFavoraveis: ['Iansã', 'Oxumaré'],
  },
  {
    mes: 3,
    ano: 2024,
    signosFavoraveis: ['Peixes', 'Áries', 'Escorpião'],
    desafios: ['Procrastinação', 'Sensibilidade excessiva'],
    oportunidades: ['Iniciações espirituais', 'Coragem para mudanças necessárias'],
    energiaDominante: 'Neptuno em Peixes - intuição elevada',
    faseLunar: 'Equinócio de Primavera',
    sefirotTransitos: ['Netzach', 'Hod'],
    orixasFavoraveis: ['Iemanjá', 'Oxum'],
  },
  {
    mes: 4,
    ano: 2024,
    signosFavoraveis: ['Áries', 'Leão', 'Sagitário'],
    desafios: ['Impulsividade', 'Conflitos de ego'],
    oportunidades: ['Liderança emergente', 'Projetos ambiciosos ganham impulso'],
    energiaDominante: 'Marte em Áries - energia de ação',
    faseLunar: 'Eclipse Solar',
    sefirotTransitos: ['Gevurah', 'Chesed'],
    orixasFavoraveis: ['Ogum', 'Oxalá'],
  },
  {
    mes: 5,
    ano: 2024,
    signosFavoraveis: ['Touro', 'Virgem', 'Capricórnio'],
    desafios: ['Rigidez emocional', 'Medo de mudanças'],
    oportunidades: ['Estabilidade financeira', 'Relacionamentos amadurecem'],
    energiaDominante: 'Vênus em Touro - luxo e prazer',
    faseLunar: 'Lua Cheia em Escorpião',
    sefirotTransitos: ['Netzach', 'Tipheret'],
    orixasFavoraveis: ['Oxum', 'Iemanjá'],
  },
  {
    mes: 6,
    ano: 2024,
    signosFavoraveis: ['Gêmeos', 'Libra', 'Aquário'],
    desafios: ['Indecisão', 'Dispersão de energia'],
    oportunidades: ['Comunicação clara', 'Parcerias equilibradas'],
    energiaDominante: 'Mercúrio retrógrado - revisões',
    faseLunar: 'Solstício de Verão',
    sefirotTransitos: ['Hod', 'Netzach'],
    orixasFavoraveis: ['Iansã', 'Ogum'],
  },
  {
    mes: 7,
    ano: 2024,
    signosFavoraveis: ['Câncer', 'Escorpião', 'Peixes'],
    desafios: ['Vulnerabilidade emocional', 'Memórias que limitam'],
    oportunidades: ['Transformação interior', 'Conexões profundas e autênticas'],
    energiaDominante: 'Lua em Câncer - cura emocional',
    faseLunar: 'Lua Cheia em Capricórnio',
    sefirotTransitos: ['Yesod', 'Malkuth'],
    orixasFavoraveis: ['Iemanjá', 'Nanã'],
  },
  {
    mes: 8,
    ano: 2024,
    signosFavoraveis: ['Leão', 'Áries', 'Sagitário'],
    desafios: ['Arrogância', 'Excesso de confiança'],
    oportunidades: ['Reconhecimento merecido', 'Criatividade em destaque'],
    energiaDominante: 'Sol em Leão - expressão criativa',
    faseLunar: 'Eclipse Lunar',
    sefirotTransitos: ['Tipheret', 'Kether'],
    orixasFavoraveis: ['Oxalá', 'Xangô'],
  },
  {
    mes: 9,
    ano: 2024,
    signosFavoraveis: ['Virgem', 'Touro', 'Capricórnio'],
    desafios: ['Perfeccionismo paralisante', 'Críticas destrutivas'],
    oportunidades: ['Planejamento preciso', 'Resultados tangíveis'],
    energiaDominante: 'Mercúrio em Virgem - análise detalhada',
    faseLunar: 'Equinócio de Outono',
    sefirotTransitos: ['Hod', 'Gevurah'],
    orixasFavoraveis: ['Oxóssi', 'Omulu'],
  },
  {
    mes: 10,
    ano: 2024,
    signosFavoraveis: ['Libra', 'Gêmeos', 'Aquário'],
    desafios: ['Conflitos de valores', 'Superficialidade em relações'],
    oportunidades: ['Harmonia conquistada', 'Decisões importantes'],
    energiaDominante: 'Vênus em Libra - relacionamentos harmonizados',
    faseLunar: 'Lua Cheia em Áries',
    sefirotTransitos: ['Tipheret', 'Netzach'],
    orixasFavoraveis: ['Iansã', 'Oxumaré'],
  },
  {
    mes: 11,
    ano: 2024,
    signosFavoraveis: ['Escorpião', 'Câncer', 'Peixes'],
    desafios: ['Obsessões', 'Segredos que emergem'],
    oportunidades: ['Revolução interior', 'Profundidade emocional transformadora'],
    energiaDominante: 'Plutão em Capricórnio - transformação total',
    faseLunar: 'Eclipse Solar',
    sefirotTransitos: ['Gevurah', 'Binah'],
    orixasFavoraveis: ['Oxum', 'Oxumaré'],
  },
  {
    mes: 12,
    ano: 2024,
    signosFavoraveis: ['Sagitário', 'Leão', 'Áries'],
    desafios: ['Excesso de expansão', 'Fuga de responsabilidades'],
    oportunidades: ['Visão de longo prazo', 'Sabedoria acumulada'],
    energiaDominante: 'Júpiter em Sagitário - filosofia e expansão',
    faseLunar: 'Solstício de Inverno',
    sefirotTransitos: ['Chesed', 'Kether'],
    orixasFavoraveis: ['Oxalá', 'Ogum'],
  },
];

// Zodiac sign correlations
const SIGN_CORRELATIONS: Record<string, { element: string; orixa: string; sefirot: string[]; chakra: string }> = {
  aries: { element: 'Fogo', orixa: 'Ogum', sefirot: ['Gevurah'], chakra: 'Manipura (3º)' },
  touro: { element: 'Terra', orixa: 'Oxum', sefirot: ['Malkuth'], chakra: 'Muladhara (1º)' },
  gemeos: { element: 'Ar', orixa: 'Iansã', sefirot: ['Hod'], chakra: 'Vishuddha (5º)' },
  cancer: { element: 'Água', orixa: 'Iemanjá', sefirot: ['Yesod'], chakra: 'Svadhisthana (2º)' },
  leao: { element: 'Fogo', orixa: 'Xangô', sefirot: ['Tipheret'], chakra: 'Manipura (3º)' },
  virgem: { element: 'Terra', orixa: 'Oxóssi', sefirot: ['Hod'], chakra: 'Anahata (4º)' },
  libra: { element: 'Ar', orixa: 'Iansã', sefirot: ['Netzach'], chakra: 'Anahata (4º)' },
  escorpiao: { element: 'Água', orixa: 'Oxum', sefirot: ['Gevurah', 'Yesod'], chakra: 'Svadhisthana (2º)' },
  sagitario: { element: 'Fogo', orixa: 'Ogum', sefirot: ['Chesed'], chakra: 'Ajna (6º)' },
  capricornio: { element: 'Terra', orixa: 'Omulu', sefirot: ['Malkuth', 'Yesod'], chakra: 'Muladhara (1º)' },
  aquario: { element: 'Ar', orixa: 'Oxumaré', sefirot: ['Chokhmah'], chakra: 'Sahasrara (7º)' },
  peixes: { element: 'Água', orixa: 'Iemanjá', sefirot: ['Binah', 'Netzach'], chakra: 'Ajna (6º)' },
};

function getMonthlyData(mes: number, ano: number) {
  const existingData = MONTHLY_PATTERNS.find(m => m.mes === mes && m.ano === ano);
  if (existingData) return existingData;

  const currentData = MONTHLY_PATTERNS.find(m => m.mes === mes);
  return { ...currentData, ano };
}

// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = MonthQuerySchema.safeParse({
    mes: searchParams.get('mes') ?? undefined,
    ano: searchParams.get('ano') ?? undefined,
    signo: searchParams.get('signo') ?? undefined,
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const now = new Date();
  const mes = parseResult.data.mes || (now.getMonth() + 1);
  const ano = parseResult.data.ano || now.getFullYear();
  const signo = parseResult.data.signo;

  const monthlyData = getMonthlyData(mes, ano);
  const response: Record<string, unknown> = {
    success: true,
    previsao: {
      mes: monthlyData.mes,
      ano: monthlyData.ano,
      signosFavoraveis: monthlyData.signosFavoraveis,
      desafios: monthlyData.desafios,
      oportunidades: monthlyData.oportunidades,
      energiaDominante: monthlyData.energiaDominante,
      faseLunar: monthlyData.faseLunar,
      sefirotTransitos: monthlyData.sefirotTransitos,
      orixasFavoraveis: monthlyData.orixasFavoraveis,
    },
  };

  if (signo && SIGN_CORRELATIONS[signo]) {
    const signInfo = SIGN_CORRELATIONS[signo];
    const isFavorable = (monthlyData.signosFavoraveis || []).some(s => 
      s.toLowerCase().includes(signo) || 
      (signo === 'escorpiao' && s === 'Escorpião') ||
      (signo === 'touro' && s === 'Touro')
    );

    response.signoInfo = {
      signo,
      elemento: signInfo.element,
      orixa: signInfo.orixa,
      sefirot: signInfo.sefirot,
      chakra: signInfo.chakra,
      tendencia: isFavorable ? 'favorável' : 'requer atenção',
      recomendacoes: isFavorable
        ? ['Abrace novas oportunidades', 'Confie na sua intuição', 'Cultive relacionamentos']
        : ['Pratique paciência', 'Evite decisões precipitadas', 'Cuide da sua energia'],
    };
  }

  return NextResponse.json(response);
}