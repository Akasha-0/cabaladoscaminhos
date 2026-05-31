// ============================================================
// CLEANSING API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CleansingMethodSchema = z.enum([
  'smoke', 'water', 'salt', 'sound', 'light', 'earth', 'breath', 'crystal',
]);
const CleansingQuerySchema = z.object({
  method: CleansingMethodSchema.optional(),
  type: z.enum(['energetic', 'physical', 'emotional', 'spiritual']).optional(),
  includeRituals: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
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
}
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
  },
];

const CLEANSING_RITUALS: CleansingRitual[] = [
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
      'Desligue completamente antes de sair do ambiente',
    ],
    duration: '20-30 minutos',
    materials: ['Ervas secas (alecrim, sálvia, lavanda)', 'Concha ou prato refratário', 'Fósforo ou isqueiro', 'Janelas abertas'],
    intention: 'Purificação completa de ambientes e seres, remoção de energias densas e proteção contra influências negativas.',
    aftercare: ['Ventile o ambiente por pelo menos 1 hora', 'Beba água fresca', 'Descanse alguns minutos em silêncio'],
  },
  {
    id: 'banho-ervas',
    name: 'Banho de Imersão com Ervas',
    type: 'agua',
    steps: [
      'Escolha ervas compatíveis com sua intenção: alecrim (proteção), lavanda (calma), camomila (descanso)',
      'Ferva 2 litros de água e despeje sobre as ervas, cobrindo',
      'Deixe em infusão por 15-20 minutos',
      'Coe e adicione o chá ao água morna da banheira',
      'Entre na água e visualize-se sendo purificado',
      'Permaneça imerso por 15-20 minutos',
      'Ao sair, não enxágue imediatamente; deixe as ervas secarem na pele',
      'Vista-se com roupas limpas e descanse',
    ],
    duration: '45-60 minutos',
    materials: ['Ervas secas (200g)', 'Água fervente (2L)', 'Banheira ou balde grande', 'Toalha limpa'],
    intention: 'Renovação energética completa, limpeza do corpo emocional e harmonização dos centros de força.',
    aftercare: ['Descanse pelo menos 30 minutos após o banho', 'Evite exposição ao sol forte', 'Beba água ou chá leve'],
  },
  {
    id: 'banho-sal',
    name: 'Banho de Sal',
    type: 'terra',
    steps: [
      'Escolha sal marinho grosso ou sal rosa do Himalaia',
      'Adicione 200-500g de sal à água morna',
      'Opte por adicionar ervas se desejar (alecrim para proteção)',
      'Entre na água e visualize raízes descendo da sola dos pés para a terra',
      'Imagine todas as energias densas sendo puxadas para baixo, para a terra',
      'Permaneça por 10-15 minutos',
      'Enxágue com água limpa ao sair',
      'Vista roupas limpas, preferencialmente brancas ou de cores claras',
    ],
    duration: '30-45 minutos',
    materials: ['Sal marinho ou sal rosa (200-500g)', 'Água morna', 'Ervas opcionais', 'Toalha limpa'],
    intention: 'Proteção máxima, remoção de energias negativas, ancoramento e purification profunda.',
    aftercare: ['Enxágue sempre com água limpa', 'Beba bastante água após', 'Evite contato com olhos e mucosas'],
  },
  {
    id: 'resp-purif',
    name: 'Respiração Purificadora',
    type: 'ar',
    steps: [
      'Encontre um lugar tranquilo e sente-se em posição confortável',
      'Feche os olhos e acalme a mente por alguns minutos',
      'Pratique Nadi Shodhana (respiração alternada): feche a narina direita, inspire pela esquerda, troque, expire pela direita, inspire pela direita, troque, expire pela esquerda',
      'Após 5-10 ciclos, pratique Kapalabhati (respiração de fogo): respirações curtas e vigorosas pelo nariz, contraindo o abdomen',
      'Conclua com 3 respirações profundas e conscientes',
      'Visualize a energia entrando limpa e saindo carregada de impurezas',
      'Permaneça em silêncio por alguns minutos absorvendo a energia purificada',
    ],
    duration: '15-20 minutos',
    materials: ['Ambiente tranquilo', 'Nenhuns materiais necessários', 'Óleo essencial opcional (lavanda, eucalipto)'],
    intention: 'Limpeza dos canais energéticos (nadis), aumento de prana, clareza mental e emocional.',
    aftercare: ['Beba água lentamente', 'Evite exposição ao vento frio imediatamente', 'Mantenha a respiração consciente ao longo do dia'],
  },
  {
    id: 'sahum-casa',
    name: 'Sahum Ritual de Casa',
    type: 'fogo',
    steps: [
      'Comece pelo quarto mais distante da porta de entrada e siga em direção a ela (para que as energias saiam)',
      ' carregue a concha com ervas acesas por todos os cômodos',
      'Nos cantos e áreas de stagnação de energia, pare por mais tempo',
      'Abra todas as janelas enquanto sahuma',
      'Visualize a fumaça carregando embora todas as energias indesejadas',
      'Depois de sahumar toda a casa, complete na porta de entrada, jogando um pouco de sal na soleira',
      'Desligue todas as chamas e leave as janelas abertas por pelo menos 30 minutos',
      'Faça uma oração ou affirmations de proteção para o espaço',
    ],
    duration: '45-60 minutos',
    materials: ['Ervas para sahumar', 'Concha refratária', 'Sal marinho', 'Fósforo', 'Óleo essencial opcional'],
    intention: 'Purificação completa da residência, proteção de todos os moradores e criação de um espaço sagrado.',
    aftercare: ['Mantenha ventilação por 1-2 horas', 'Lave a concha com água e sal', 'Acenda uma vela branca na entrada se desejar'],
  },
];
// GET - Retrieve cleansing types and rituals
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = CleansingQuerySchema.safeParse({
      method: searchParams.get('method'),
      type: searchParams.get('type'),
      includeRituals: searchParams.get('includeRituals'),
      limit: searchParams.get('limit'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { method, type, includeRituals, limit } = parseResult.data;
    let cleansingTypes = [...CLEANSING_TYPES];
    // Filter by method
    if (method) {
      cleansingTypes = cleansingTypes.filter(t => t.methods.includes(method));
    }
    // Apply limit
    if (limit) {
      cleansingTypes = cleansingTypes.slice(0, limit);
    }
    const response: Record<string, unknown> = {
      success: true,
      data: { types: cleansingTypes },
    };
    if (includeRituals) {
      response.data = {
        types: cleansingTypes,
        rituals: CLEANSING_RITUALS,
      };
    }
    response.meta = {
      totalTypes: cleansingTypes.length,
      totalRituals: CLEANSING_RITUALS.length,
    };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar limpeza',
    }, { status: 500 });
}