// ============================================================
// CLEANSING API - CABALA DOS CAMINHOS
// Enhanced with spiritual correlations
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CleansingMethodSchema = z.enum([
  'smoke', 'water', 'salt', 'sound', 'light', 'earth', 'breath', 'crystal',
]);
const CleansingTypeSchema = z.enum(['energetic', 'physical', 'emotional', 'spiritual']);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const CleansingQuerySchema = z.object({
  method: CleansingMethodSchema.optional(),
  type: CleansingTypeSchema.optional(),
  includeRituals: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  chakra: ChakraSchema.optional(),
  sefirot: SefirotSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const CleansingRitualSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  steps: z.array(z.string()),
  duration: z.string(),
  materials: z.array(z.string()).optional(),
  intention: z.string().optional(),
  aftercare: z.array(z.string()).optional(),
  sefirot: z.array(SefirotSchema).optional(),
  chakra: z.number().int().min(1).max(7).optional(),
  orixa: z.string().optional(),
  spiritualCorrelations: z.object({
    sefirot: z.array(z.string()),
    chakra: z.number(),
    element: z.string(),
    orixa: z.string(),
    affirmation: z.string(),
    frequency: z.string(),
  }).optional(),
});

interface CleansingType {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  methods: string[];
  duration: string;
  frequency: string;
  precautions: string[];
  sefirot: string[];
  chakras: string[];
  benefits: string[];
  orixa: string[];
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

export type CleansingRitual = z.infer<typeof CleansingRitualSchema>;
export const dynamic = 'force-dynamic';

// ─── Cleansing Type Spiritual Correlations ──────────────────────────────────────────
const CLEANSING_TYPE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'fogo': { sefirot: ['Gevurah', 'Hod'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'O fogo purifica e transforma minha energia', frequency: '417 Hz' },
  'agua': { sefirot: ['Yesod', 'Malkuth'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'A água sagrada lava minhas preocupações', frequency: '639 Hz' },
  'terra': { sefirot: ['Malkuth', 'Yesod'], chakra: 1, element: 'Terra', orixa: 'Omolu', affirmation: 'A terra me ancora e protege', frequency: '396 Hz' },
  'ar': { sefirot: ['Chokhmah', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Oxalá', affirmation: 'O ar limpo traz clareza mental', frequency: '741 Hz' },
  'eter': { sefirot: ['Kether', 'Tipheret'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'A luz divina me purifica completamente', frequency: '963 Hz' },
};

// ─── Cleansing Ritual Spiritual Correlations ──────────────────────────────────────────
const CLEANSING_RITUAL_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  'defumacao': { sefirot: ['Gevurah', 'Hod'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'A fumaça sagrada limpa todos os espaços', frequency: '417 Hz' },
  'banho-sagrado': { sefirot: ['Yesod', 'Malkuth'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'O banho sagrado renova meu ser', frequency: '639 Hz' },
  'resp-purif': { sefirot: ['Chokhmah', 'Chesed'], chakra: 5, element: 'Ar', orixa: 'Iansã', affirmation: 'Cada respiração limpa meu ser', frequency: '741 Hz' },
  'sahum-casa': { sefirot: ['Gevurah', 'Hod', 'Netzach'], chakra: 4, element: 'Fogo', orixa: 'Ogum', affirmation: 'Minha casa é um espaço sagrado e protegido', frequency: '528 Hz' },
  'banho-de-sal': { sefirot: ['Malkuth', 'Yesod'], chakra: 1, element: 'Terra', orixa: 'Omolu', affirmation: 'O sal purifica e protege meu campo áurico', frequency: '396 Hz' },
};

// ─── Cleansing Types ──────────────────────────────────────────────────────────
const CLEANSING_TYPES: CleansingType[] = [
  {
    id: 'fogo',
    name: 'Limpeza por Fogo',
    nameEn: 'Fire Cleansing',
    description: 'Purificação através de elementos ígneos, utilizada para banir energias negativas e proteger contra influências nocivas.',
    methods: ['Defumação com ervas', 'Velas ritualísticas', 'Queima de incenso'],
    duration: '15-30 minutos',
    frequency: 'Semanal ou quando necessário',
    precautions: ['Use em área ventilada', 'Nunca deixe chamas sem supervisão', 'Afaste materiais inflamáveis'],
    sefirot: ['Gevurah', 'Hod'],
    chakras: ['Muladhara', 'Manipura'],
    benefits: ['Proteção', 'Renovação', 'Poder pessoal'],
    orixa: ['Ogum', 'Xangô'],
    spiritualCorrelations: CLEANSING_TYPE_SPIRITUAL_CORRELATIONS['fogo'],
  },
  {
    id: 'agua',
    name: 'Limpeza por Água',
    nameEn: 'Water Cleansing',
    description: 'Purificação através do elemento água para dissolver energias densas e trazer renovação emocional.',
    methods: ['Banho de ervas', 'Aspersão ritual', 'Água salgada', 'Flores de bach'],
    duration: '20-45 minutos',
    frequency: 'Diário ou semanal',
    precautions: ['Verifique temperatura da água', 'Hidrate-se após o ritual', 'Não use em feridas abertas'],
    sefirot: ['Yesod', 'Malkuth'],
    chakras: ['Svadhisthana', 'Anahata'],
    benefits: ['Dissolução de energias densas', 'Renovação emocional', 'Fluidez'],
    orixa: ['Iemanjá', 'Oxum'],
    spiritualCorrelations: CLEANSING_TYPE_SPIRITUAL_CORRELATIONS['agua'],
  },
  {
    id: 'terra',
    name: 'Limpeza por Terra',
    nameEn: 'Earth Cleansing',
    description: 'Ancoramento e purificação através do elemento terra para estabilizar energias e proteger o campo áurico.',
    methods: ['Banho de sal', 'Cristais e pedras', 'Grounding meditation', 'Sahumerio de solo'],
    duration: '30-60 minutos',
    frequency: 'Semanal ou quinzenal',
    precautions: ['Use sal marinho natural', 'Evite contato com olhos', 'Enxágue bem após banhos de sal'],
    sefirot: ['Malkuth', 'Yesod'],
    chakras: ['Muladhara'],
    benefits: ['Ancoramento', 'Estabilidade', 'Proteção do campo áurico'],
    orixa: ['Oxóssi', 'Omolu'],
    spiritualCorrelations: CLEANSING_TYPE_SPIRITUAL_CORRELATIONS['terra'],
  },
  {
    id: 'ar',
    name: 'Limpeza por Ar',
    nameEn: 'Air Cleansing',
    description: 'Purificação através do elemento ar para abrir espaço mental, trazer clareza e dissipar energias densas.',
    methods: ['Respiração pranayama', 'Fumação de ervas', 'Ventilação ritual', 'Sons e mantras'],
    duration: '15-30 minutos',
    frequency: 'Diário',
    precautions: ['Pratique em local arejado', 'Não fume cigarros ou outras substâncias', 'Comece gradualmente com pranayama'],
    sefirot: ['Chesed', 'Chokhmah'],
    chakras: ['Vishuddha', 'Ajna'],
    benefits: ['Clareza mental', 'Abertura de espaço mental', 'Dissipação de energias densas'],
    orixa: ['Iansã', 'Oxalá'],
    spiritualCorrelations: CLEANSING_TYPE_SPIRITUAL_CORRELATIONS['ar'],
  },
  {
    id: 'eter',
    name: 'Limpeza de Éter',
    nameEn: 'Ether Cleansing',
    description: 'Purificação espiritual avançada que trabalha com o quinto elemento para limpar o corpo causal e harmonizar os veículos superiores.',
    methods: ['Meditação transcendental', 'Visualização criativa', 'Reiki', 'Oração estruturada'],
    duration: '45-90 minutos',
    frequency: 'Semanal ou mensal',
    precautions: ['Requer prática de meditação', 'Faça em estado calmo', 'Evite após refeições pesadas'],
    sefirot: ['Kether', 'Tipheret', 'Binah'],
    chakras: ['Sahasrara', 'Ajna'],
    benefits: ['Limpeza do corpo causal', 'Harmonização dos veículos superiores', 'Transcendência'],
    orixa: ['Oxalá', 'Nanã'],
    spiritualCorrelations: CLEANSING_TYPE_SPIRITUAL_CORRELATIONS['eter'],
  },
];

// ─── Cleansing Rituals ──────────────────────────────────────────────────────────
const CLEANSING_RITUALS: Array<CleansingRitual & { spiritualCorrelations?: object }> = [
  {
    id: 'defumacao',
    name: 'Ritual de Defumação',
    type: 'fogo',
    steps: [
      'Escolha ervas adequadas: alecrim, palo santo, sálvia branca ou lavanda',
      'Coloque as ervas em um recipiente refratário (concha de metal ou cerâmica)',
      'Acenda a ponta das ervas e sopre suavemente para criar fumaça',
      'Com a intenção clara, passe a fumaça ao redor do corpo de baixo para cima',
      'Foque nas áreas com maior acúmulo energético (ombros, peito, cabeça)',
      'Permita que a fumaça preencha cada cômodo da casa',
      'Agradeça aos elementos e às ervas pelo trabalho realizado',
    ],
    duration: '30-45 minutos',
    materials: ['Ervas secas (alecrim, sálvia, lavanda)', 'Concha refratária', 'Fósforo', 'Prancha de defumação'],
    intention: 'Purificação de ambientes e campos energéticos, remoção de energias densas e proteção',
    aftercare: ['Ventile o ambiente por 30 minutos', 'Beba água purificada', 'Descanse em silêncio'],
    sefirot: ['Gevurah', 'Hod'],
    chakra: 3,
    orixa: 'Ogum',
    spiritualCorrelations: CLEANSING_RITUAL_SPIRITUAL_CORRELATIONS['defumacao'],
  },
  {
    id: 'banho-sagrado',
    name: 'Banho de Ervas Sagradas',
    type: 'agua',
    steps: [
      'Escolha ervas conforme sua intenção: alecrim (proteção), arruda (limpeza), manjericão (amor)',
      'Ferva 1 litro de água e despeje sobre as ervas, deixando em infusão por 15 minutos',
      'Coe e adicione ao água do banho, preferencialmente morna',
      'Entre na banheira e visualize-se sendo purificado pela água',
      'Recite uma oração ou affirmation de purificação',
      'Permaneça por 15-20 minutos em contemplação',
      'Saia do banho e vista roupas limpas, preferencialmente brancas',
    ],
    duration: '30-45 minutos',
    materials: ['Ervas sagradas', 'Água fervente', 'Panela para infusão', 'Banheira ou balde'],
    intention: 'Purificação do corpo físico e energético, renovação de energias, preparação para rituais',
    aftercare: ['Vista roupas limpas', 'Evite exposição ao frio', 'Descanse por 30 minutos'],
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 2,
    orixa: 'Iemanjá',
    spiritualCorrelations: CLEANSING_RITUAL_SPIRITUAL_CORRELATIONS['banho-sagrado'],
  },
  {
    id: 'resp-purif',
    name: 'Respiração Purificadora',
    type: 'ar',
    steps: [
      'Encontre um lugar tranquilo e sente-se em posição confortável',
      'Feche os olhos e acalme a mente por alguns minutos',
      'Pratique Nadi Shodhana (respiração alternada): feche a narina direita, inspire pela esquerda, troque, expire pela direita',
      'Após 5-10 ciclos, pratique Kapalabhati (respiração de fogo): respirações curtas e vigorosas pelo nariz',
      'Conclua com 3 respirações profundas e conscientes',
      'Visualize a energia entrando limpa e saindo carregada de impurezas',
    ],
    duration: '15-20 minutos',
    materials: ['Ambiente tranquilo', 'Nenhum material necessário', 'Óleo essencial opcional (lavanda, eucalipto)'],
    intention: 'Limpeza dos canais energéticos (nadis), aumento de prana, clareza mental e emocional',
    aftercare: ['Beba água lentamente', 'Evite exposição ao vento frio imediatamente', 'Mantenha respiração consciente'],
    sefirot: ['Chesed', 'Chokhmah'],
    chakra: 5,
    orixa: 'Iansã',
    spiritualCorrelations: CLEANSING_RITUAL_SPIRITUAL_CORRELATIONS['resp-purif'],
  },
  {
    id: 'sahum-casa',
    name: 'Sahum Ritual de Casa',
    type: 'fogo',
    steps: [
      'Comece pelo quarto mais distante da porta de entrada e siga em direção a ela',
      'Carregue a concha com ervas acesas por todos os cômodos',
      'Nos cantos e áreas de estagnação de energia, pare por mais tempo',
      'Abra todas as janelas enquanto sahuma',
      'Visualize a fumaça carregando embora todas as energias indesejadas',
      'Depois de sahumar toda a casa, complete na porta de entrada, jogando um pouco de sal na soleira',
      'Faça uma oração ou affirmations de proteção para o espaço',
    ],
    duration: '45-60 minutos',
    materials: ['Ervas para sahumar', 'Concha refratária', 'Sal marinho', 'Fósforo'],
    intention: 'Purificação completa da residência, proteção de todos os moradores e criação de um espaço sagrado',
    aftercare: ['Mantenha ventilação por 1-2 horas', 'Lave a concha com água e sal', 'Acenda uma vela branca na entrada'],
    sefirot: ['Gevurah', 'Hod', 'Netzach'],
    chakra: 4,
    orixa: 'Ogum',
    spiritualCorrelations: CLEANSING_RITUAL_SPIRITUAL_CORRELATIONS['sahum-casa'],
  },
  {
    id: 'banho-de-sal',
    name: 'Banho de Sal Integral',
    type: 'terra',
    steps: [
      'Dissolva 200g de sal marinho em água morna',
      'Adicione 5 gotas de óleo essencial de alecrim ou lavanda (opcional)',
      'Despeje a solução sobre o corpo, da cabeça aos pés, em movimentos amplos',
      'Massajeie o corpo com as mãos, focando em áreas de tensão',
      'Enxágue com água corrente',
      'Visualize o sal absorvendo todas as energias densas e negativas',
    ],
    duration: '20-30 minutos',
    materials: ['Sal marinho (200g)', 'Água morna', 'Óleo essencial (opcional)', 'Toalha limpa'],
    intention: 'Purificação profunda do campo áurico, remoção de energias negativas, proteção',
    aftercare: ['Enxágue bem o corpo', 'Vista roupas limpas', 'Beba água com limão'],
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    orixa: 'Omolu',
    spiritualCorrelations: CLEANSING_RITUAL_SPIRITUAL_CORRELATIONS['banho-de-sal'],
  },
];

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const parseResult = CleansingQuerySchema.safeParse({
      method: searchParams.get('method'),
      type: searchParams.get('type'),
      includeRituals: searchParams.get('includeRituals'),
      limit: searchParams.get('limit'),
      chakra: searchParams.get('chakra'),
      sefirot: searchParams.get('sefirot'),
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

    const { method, type, includeRituals, limit, chakra, sefirot, element, orixa } = parseResult.data;

    let cleansingTypes = [...CLEANSING_TYPES];

    // Filter by method
    if (method) {
      cleansingTypes = cleansingTypes.filter(t => t.methods.includes(method));
    }

    // Filter by type
    if (type) {
      const typeMethods: Record<string, string[]> = {
        energetic: ['smoke', 'sound', 'breath'],
        physical: ['water', 'salt', 'earth'],
        emotional: ['water', 'breath', 'light'],
        spiritual: ['smoke', 'light', 'breath', 'crystal'],
      };
      const allowedMethods = typeMethods[type] || [];
      cleansingTypes = cleansingTypes.filter(t =>
        t.methods.some(m => allowedMethods.includes(m))
      );
    }

    // Filter by chakra
    if (chakra) {
      cleansingTypes = cleansingTypes.filter(t =>
        t.chakras.some(c => c.includes(String(chakra)))
      );
    }

    // Filter by sefirot
    if (sefirot) {
      cleansingTypes = cleansingTypes.filter(t =>
        t.sefirot.includes(sefirot)
      );
    }

    // Filter by element
    if (element) {
      cleansingTypes = cleansingTypes.filter(t =>
        t.spiritualCorrelations?.element === element
      );
    }

    // Filter by orixa
    if (orixa) {
      cleansingTypes = cleansingTypes.filter(t =>
        t.orixa.some(o => o.toLowerCase().includes(orixa.toLowerCase()))
      );
    }

    // Apply limit
    if (limit) {
      cleansingTypes = cleansingTypes.slice(0, limit);
    }

    // Filter rituals
    let rituals = [...CLEANSING_RITUALS];
    if (chakra) {
      rituals = rituals.filter(r => r.chakra === chakra);
    }
    if (sefirot) {
      rituals = rituals.filter(r => r.sefirot?.includes(sefirot));
    }
    if (element) {
      rituals = rituals.filter(r => r.spiritualCorrelations?.element === element);
    }
    if (orixa) {
      rituals = rituals.filter(r =>
        r.orixa?.toLowerCase().includes(orixa.toLowerCase())
      );
    }

    // Calculate spiritual stats
    const spiritualStats = {
      bySefirot: cleansingTypes.reduce((acc, t) => {
        const sc = t.spiritualCorrelations;
        if (sc) {
          sc.sefirot.forEach(s => { acc[s] = (acc[s] || 0) + 1; });
        }
        return acc;
      }, {} as Record<string, number>),
      byChakra: cleansingTypes.reduce((acc, t) => {
        const ch = t.spiritualCorrelations?.chakra;
        if (ch) acc[ch] = (acc[ch] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: cleansingTypes.reduce((acc, t) => {
        const el = t.spiritualCorrelations?.element;
        if (el) acc[el] = (acc[el] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: cleansingTypes.reduce((acc, t) => {
        const sc = t.spiritualCorrelations?.orixa;
        if (sc) acc[sc] = (acc[sc] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    const stats = {
      byMethod: CLEANSING_TYPES.reduce((acc, t) => {
        t.methods.forEach(m => { acc[m] = (acc[m] || 0) + 1; });
        return acc;
      }, {} as Record<string, number>),
      byChakra: CLEANSING_TYPES.reduce((acc, t) => {
        t.chakras.forEach(c => { acc[c] = (acc[c] || 0) + 1; });
        return acc;
      }, {} as Record<string, number>),
      bySefirot: CLEANSING_TYPES.reduce((acc, t) => {
        t.sefirot.forEach(s => { acc[s] = (acc[s] || 0) + 1; });
        return acc;
      }, {} as Record<string, number>),
      byOrixa: CLEANSING_TYPES.reduce((acc, t) => {
        t.orixa.forEach(o => { acc[o] = (acc[o] || 0) + 1; });
        return acc;
      }, {} as Record<string, number>),
    };

    const response: Record<string, unknown> = {
      success: true,
      data: { types: cleansingTypes },
      meta: {
        totalTypes: cleansingTypes.length,
        totalRituals: rituals.length,
      },
      spiritualCorrelations: {
        types: CLEANSING_TYPE_SPIRITUAL_CORRELATIONS,
        rituals: CLEANSING_RITUAL_SPIRITUAL_CORRELATIONS,
      },
      spiritualStats,
    };

    if (includeRituals) {
      response.data = {
        types: cleansingTypes,
        rituals,
      };
    }

    response.stats = stats;

    return NextResponse.json(response);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro ao processar limpeza: ${err.message}`,
    }, { status: 500 });
  }
}