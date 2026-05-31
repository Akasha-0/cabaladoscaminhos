import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const RitualTypeSchema = z.enum(['daily', 'weekly', 'monthly', 'seasonal', 'crisis', 'celebration']);
const TraditionSchema = z.enum(['candomble', 'umbanda', 'cabala', 'yoruba', 'taoist', 'sufi', 'shamanic']);
const RitualQuerySchema = z.object({
  type: RitualTypeSchema.optional(),
  tradition: TraditionSchema.optional(),
  day: z.string().optional(),
  includeSteps: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export const dynamic = 'force-dynamic';

// ─── Practice Data ─────────────────────────────────────────────────────────
interface RitualPractice {
  id: string;
  type: string;
  name: string;
  nameEn: string;
  description: string;
  tradition: string;
  duration: string;
  frequency: string;
  steps?: string[];
  materials?: string[];
  sefirot: string[];
  orixa?: string;
  chakra: string;
  time: string;
}

const RITUAL_PRACTICES: RitualPractice[] = [
  {
    id: 'dawn-light',
    type: 'daily',
    name: 'Ritual do Amanhecer — Saudar o Sol',
    nameEn: 'Dawn Ritual',
    description: 'Prática matinal para saudar a luz do dia e estabelecer intenções sagradas.',
    tradition: 'cabala',
    duration: '20-30 minutos',
    frequency: 'Diário ao amanhecer',
    steps: [
      'Acorde e vá para local com luz natural',
      'Face o leste (direção do sol nascente)',
      'Feche os olhos e tome 3 respirações profundas',
      'Visualize o sol nascendo em seu coração',
      'Recite: "A luz de Kether ilumina meu caminho"',
      'Agradeça por mais um dia de vida',
      'Defina uma intenção para o dia',
      'Abracinho de Oxalá (3 minutos)',
    ],
    materials: ['Vela branca', 'Água', 'Incienso opcional'],
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 'Sahasrara (7º)',
    time: 'Amanhecer',
  },
  {
    id: 'oxum-daily',
    type: 'daily',
    name: 'Ritual Diário de Oxum',
    nameEn: 'Daily Oxum Ritual',
    description: 'Oração matinal à Oxum para prosperidade e amor.',
    tradition: 'candomble',
    duration: '15 minutos',
    frequency: 'Diário',
    steps: [
      'Acenda vela dourada ou rosa',
      'Coloque água doce em copo transparente',
      'Adicione flores amarelas ou rosas',
      'Pingue mel na água',
      'Recite: "Oxum, mãe das águas, abençoe meu dia"',
      'Agradeça pela proteção e amor',
      'Pida prosperidade e saúde',
      'Beba a água abençoada (opcional)',
    ],
    materials: ['Vela dourada/rosa', 'Água doce', 'Flores amarelas', 'Mel'],
    sefirot: ['Chesed', 'Hod'],
    orixa: 'Oxum',
    chakra: 'Svadhisthana (2º)',
    time: 'Manhã',
  },
  {
    id: 'oxalá-friday',
    type: 'weekly',
    name: 'Ritual de Sexta-feira — Oxalá',
    nameEn: 'Friday Oxalá Ritual',
    description: 'Prática semanal para paz e conexão com Oxalá no dia dedicado.',
    tradition: 'candomble',
    duration: '45 minutos',
    frequency: 'Sexta-feira',
    steps: [
      'Vista roupas brancas',
      'Limpe o ambiente com sal e água',
      'Acenda velas brancas (3 ou 7)',
      'Coloque canjica branca em prato',
      'Recite orações a Oxalá',
      'Cante ou dance suavemente',
      'Pratique silêncio interior',
      'Acabou: agradeça e descanse',
    ],
    materials: ['Velas brancas', 'Roupas brancas', 'Canjica', 'Algodão', 'Vinho branco opcional'],
    sefirot: ['Kether', 'Tipheret'],
    orixa: 'Oxalá',
    chakra: 'Sahasrara (7º)',
    time: 'Sexta-feira à noite',
  },
  {
    id: 'egungun-ancestors',
    type: 'weekly',
    name: 'Ritual dos Ancestrais — Egungun',
    nameEn: 'Ancestral Ritual',
    description: 'Conexão com os ancestrais para proteção e sabedoria.',
    tradition: 'yoruba',
    duration: '1 hora',
    frequency: 'Segunda-feira',
    steps: [
      'Acenda velas brancas para cada ancestral',
      'Coloque água e alimentos simples',
      'Recite nomes dos ancestrais conhecidos',
      'Peça proteção e orientação',
      'Fique em silêncio, ouvindo intuição',
      'Agradeça pelos sacrifícios deles',
      'Jogue sal na soleira da porta',
      'Desligue velas e guarde a água',
    ],
    materials: ['Velas brancas', 'Água', 'Pipoca ou quirera', 'Sal', 'Alimentos simples'],
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 'Muladhara (1º)',
    time: 'Segunda-feira à noite',
  },
  {
    id: 'xango-wednesday',
    type: 'weekly',
    name: 'Ritual de Quarta-feira — Xangô',
    nameEn: 'Wednesday Xangô Ritual',
    description: 'Honrar Xangô para justiça, equilíbrio e força.',
    tradition: 'candomble',
    duration: '40 minutos',
    frequency: 'Quarta-feira',
    steps: [
      'Acenda velas douradas ou laranja',
      'Coloque amalá (quiabo cozido com camarão)',
      'Adicione folhas de fumo (opcional)',
      'Recite orações de Xangô',
      'Pida equilíbrio entre força e justiça',
      'Quebre um galho seco simbolizando demandas',
      'Acabe com gratidão pela força recebida',
    ],
    materials: ['Velas douradas/laranja', 'Amalá', 'Folhas de fumo', 'Galho seco'],
    sefirot: ['Gevurah', 'Hod'],
    orixa: 'Xangô',
    chakra: 'Manipura (3º)',
    time: 'Quarta-feira',
  },
  {
    id: 'yemanjá-sea',
    type: 'monthly',
    name: 'Ritual de Iemanjá — Rainha do Mar',
    nameEn: 'Yemanjá Monthly Ritual',
    description: 'Cerimônia mensal para proteção, fertilidade e conexão com o mar.',
    tradition: 'umbanda',
    duration: '1-2 horas',
    frequency: '2ª-feira de cada mês ou véspera de lua cheia',
    steps: [
      'Vá ao mar ou tenha água do mar presente',
      'Vista roupas azul e branco',
      'Acenda velas azul e branca',
      'Ofereça flores brancas à água',
      'Recite orações de proteção',
      'Peça bênçãos para família e filhos',
      'Solte as flores na água do mar',
      'Agradeça pela presença maternal de Iemanjá',
    ],
    materials: ['Velas azul e branca', 'Flores brancas', 'Roupas azul/branco', 'Perfume de Iemanjá', 'Água do mar'],
    sefirot: ['Binah', 'Yesod'],
    orixa: 'Iemanjá',
    chakra: 'Sahasrara (7º)',
    time: 'Noite (lua cheia)',
  },
  {
    id: 'ogum-mardi',
    type: 'weekly',
    name: 'Ritual de Terça-feira — Ogum',
    nameEn: 'Tuesday Ogum Ritual',
    description: 'Honrar Ogum para proteção, trabalho e conquista.',
    tradition: 'candomble',
    duration: '30 minutos',
    frequency: 'Terça-feira',
    steps: [
      'Acenda velas vermelhas e verdes',
      'Coloque espada-de-são-jorge (se disponível)',
      'Ofereça inhame assado ou pipoca',
      'Recite orações de Ogum',
      'Pida proteção no trabalho e travels',
      'Faça um nó com barbante vermelho (proteger against negativity)',
      'Desenterrar (cortar) o nó depois de 7 dias',
    ],
    materials: ['Velas vermelho/verde', 'Espada-de-são-jorge', 'Inhame assado', 'Guiné para defumação', 'Barbante vermelho'],
    sefirot: ['Gevurah'],
    orixa: 'Ogum',
    chakra: 'Muladhara (1º)',
    time: 'Terça-feira',
  },
  {
    id: 'full-moon-ritual',
    type: 'seasonal',
    name: 'Ritual da Lua Cheia',
    nameEn: 'Full Moon Ritual',
    description: 'Prática poderosa de limpar e carregar energias sob a lua cheia.',
    tradition: 'sufi',
    duration: '1 hora',
    frequency: 'Lua cheia mensal',
    steps: [
      'Planeje fora à noite com vista para a lua',
      'Acenda incenso de sálvia ou lavanda',
      'Sente ou fique em pé, rosto para lua',
      'Visualize luz lunar preenchendo seu corpo',
      'Recite: "Eu sou luz, eu sou amor, eu sou paz"',
      'Permita emoções fluírem naturalmente',
      'Escreva intenções e depois queime (seguro)',
      'Agradeça e volte para dentro gradualmente',
    ],
    materials: ['Sálvia ou lavanda', 'Velas', 'Papel e caneta', 'Recipiente seguro para queimar'],
    sefirot: ['Yesod', 'Tipheret'],
    chakra: 'Ajna (6º)',
    time: 'Noite de lua cheia',
  },
  {
    id: 'obatalá-monday',
    type: 'weekly',
    name: 'Ritual de Oxalá — Pureza e Paz',
    nameEn: 'Oxalá Monday Ritual',
    description: 'Honrar Oxalá para pureza, paz e conexão com o divino.',
    tradition: 'yoruba',
    duration: '45 minutos',
    frequency: 'Domingo ou segunda-feira',
    steps: [
      'Vista apenas roupas brancas',
      'Limpe seu espaço com água e sal',
      'Acenda múltiplas velas brancas',
      'Coloque canjica branca em prato branco',
      'Recite orações de paz a Oxalá',
      'Pratique 5 minutos de silêncio total',
      'Visualize-se em paz absoluta',
      'Acabou: coma um pouco da canjica',
    ],
    materials: ['Velas brancas', 'Roupas brancas', 'Canjica branca', 'Prato branco', 'Algodão'],
    sefirot: ['Kether', 'Tipheret'],
    orixa: 'Oxalá',
    chakra: 'Sahasrara (7º)',
    time: 'Domingo ou segunda-feira',
  },
  {
    id: 'iansan-fire',
    type: 'weekly',
    name: 'Ritual de Iansã — Fogo e Transformação',
    nameEn: 'Iansã Fire Ritual',
    description: 'Queimar demandas, ativa coragem e transformação através do fogo.',
    tradition: 'candomble',
    duration: '50 minutos',
    frequency: 'Terça-feira',
    steps: [
      'Acenda velas laranja e vermelha',
      'Coloque alecrim e guiné para defumar',
      'Recite orações de Iansã',
      'Pida coragem para quebrar demandas',
      'Visualize demandas sendo queimadas',
      'Queime papel com escrito demandas (seguro)',
      'Sinta a energia de transformação',
      'Agradeça pela força de Iansã',
    ],
    materials: ['Velas laranja/vermelha', 'Alecrim', 'Guiné', 'Papel para queimar', 'Prato refratário'],
    sefirot: ['Gevurah', 'Chesed'],
    orixa: 'Iansã',
    chakra: 'Manipura (3º)',
    time: 'Terça-feira à noite',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = RitualQuerySchema.safeParse({
    type: searchParams.get('type'),
    tradition: searchParams.get('tradition'),
    day: searchParams.get('day'),
    includeSteps: searchParams.get('includeSteps'),
    limit: searchParams.get('limit'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { type, tradition, day, includeSteps, limit } = parseResult.data;
  let practices = [...RITUAL_PRACTICES];

  if (type) {
    practices = practices.filter(p => p.type === type);
  }

  if (tradition) {
    practices = practices.filter(p => p.tradition === tradition);
  }

  if (day) {
    practices = practices.filter(p => p.time.toLowerCase().includes(day.toLowerCase()));
  }

  if (limit) {
    practices = practices.slice(0, limit);
  }

  // Filter out steps/materials if not requested
  const response = practices.map(p => {
    if (!includeSteps) {
      const { steps, materials, ...rest } = p;
      return rest;
    }
    return p;
  });

  return NextResponse.json({
    success: true,
    practices: response,
    count: response.length,
    total: RITUAL_PRACTICES.length,
    types: {
      daily: RITUAL_PRACTICES.filter(p => p.type === 'daily').length,
      weekly: RITUAL_PRACTICES.filter(p => p.type === 'weekly').length,
      monthly: RITUAL_PRACTICES.filter(p => p.type === 'monthly').length,
      seasonal: RITUAL_PRACTICES.filter(p => p.type === 'seasonal').length,
    },
    traditions: {
      candomble: RITUAL_PRACTICES.filter(p => p.tradition === 'candomble').length,
      umbanda: RITUAL_PRACTICES.filter(p => p.tradition === 'umbanda').length,
      cabala: RITUAL_PRACTICES.filter(p => p.tradition === 'cabala').length,
      yoruba: RITUAL_PRACTICES.filter(p => p.tradition === 'yoruba').length,
    },
  });
}