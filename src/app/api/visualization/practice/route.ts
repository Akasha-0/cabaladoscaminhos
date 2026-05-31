import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const VisualizationTypeSchema = z.enum(['manifestation', 'healing', 'protection', 'ascension', 'love', 'abundance', 'clarity', 'ancestral']);
const TraditionSchema = z.enum(['cabala', 'yoga', 'shamanic', 'taoist', 'mystic']);
const VisualizationQuerySchema = z.object({
  type: VisualizationTypeSchema.optional(),
  tradition: TraditionSchema.optional(),
  duration: z.coerce.number().int().positive().optional(),
  includeSteps: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export const dynamic = 'force-dynamic';

// ─── Practice Data ─────────────────────────────────────────────────────────
interface VisualizationPractice {
  id: string;
  type: string;
  name: string;
  nameEn: string;
  description: string;
  tradition: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps?: string[];
  affirmations?: string[];
  colors: string[];
  sefirot: string[];
  chakra: string;
  orixa?: string;
}

const VISUALIZATION_PRACTICES: VisualizationPractice[] = [
  {
    id: 'tree-of-life',
    type: 'ascension',
    name: 'Visualização da Árvore da Vida',
    nameEn: 'Tree of Life Visualization',
    description: 'Conexão com as Dez Sephirot através da visualização da Árvore Cabalística.',
    tradition: 'cabala',
    duration: 30,
    difficulty: 'intermediate',
    steps: [
      'Feche os olhos e respire profundamente',
      'Visualize o ponto de luz infinita (Kether) acima de você',
      'A luz desce formando três colunas: esquerda (misericórdia), centro (equilíbrio), direita (severidade)',
      'Observe as Sephirot iluminando uma a uma: Kether, Chokhmah, Binah, Chesed, Gevurah, Tiferet, Netzach, Hod, Yesod, Malkuth',
      'Permita que a energia flua pelos caminhos entre as Sephirot',
      'Sinta-se conectado com toda a árvore',
      'Retorne gradualmente, mantendo a consciência da árvore dentro de você',
    ],
    affirmations: [
      'Eu sou parte da árvore divina',
      'A sabedoria flui através de mim',
      'Sou canal para a energia das Sephirot',
    ],
    colors: ['Branco', 'Azul', 'Vermelho', 'Amarelo', 'Verde'],
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
    chakra: 'Sahasrara (7º)',
  },
  {
    id: 'manifestation-abundance',
    type: 'manifestation',
    name: 'Visualização da Abundância',
    nameEn: 'Abundance Manifestation',
    description: 'Técnica de visualização criativa para manifestar prosperidade e abundância.',
    tradition: 'mystic',
    duration: 20,
    difficulty: 'beginner',
    steps: [
      'Sente-se relaxado com os olhos fechados',
      'Visualize uma bola de luz dourada no centro do seu peito (área do coração)',
      'A luz cresce e se expande, preenchendo todo o seu corpo',
      'Imagine-se no futuro desejado: moradia, trabalho, experiências',
      'Sinta as emoções como se já estivesse vivendo essa realidade',
      'Visualize detalhes: cores, sons, sensações táteis',
      'Permita que o sentimento de gratidão acompanhe a visualização',
      'Agradeça como se já tivesse recebido',
    ],
    affirmations: [
      'Eu mereço abundância infinita',
      'A prosperidade flui naturalmente para mim',
      'Sou grato pela riqueza que se manifesta em minha vida',
    ],
    colors: ['Dourado', 'Verde', 'Branco'],
    sefirot: ['Chesed', 'Malkuth'],
    chakra: 'Manipura (3º)',
  },
  {
    id: 'heart-healing',
    type: 'healing',
    name: 'Curação do Coração',
    nameEn: 'Heart Healing Visualization',
    description: 'Libertação de mágoas e cura emocional através da visualização de luz.',
    tradition: 'yoga',
    duration: 25,
    difficulty: 'beginner',
    steps: [
      'Sente-se com coluna ereta, mãos sobre o coração',
      'Respire profundamente, liberando tensão',
      'Visualize uma esfera de luz verde esmeralda no centro do peito',
      'A luz pulsa com cada batida do coração',
      'Identifique uma mágoa ou dor antiga',
      'Permita que a luz verde a dissolva suavemente',
      'Observe a dor transformando em compaixão',
      'Encha o espaço vazio com amor incondicional',
      'Selle a ferida healed com luz dourada',
    ],
    affirmations: [
      'Meu coração é forte e compassivo',
      'Eu libero todas as mágoas do passado',
      'O amor é minha natureza fundamental',
    ],
    colors: ['Verde', 'Rosa', 'Dourado'],
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 'Anahata (4º)',
  },
  {
    id: 'protective-shield',
    type: 'protection',
    name: 'Escudo de Proteção',
    nameEn: 'Protective Shield Visualization',
    description: 'Criação de um escudo de luz para proteção energética.',
    tradition: 'shamanic',
    duration: 15,
    difficulty: 'beginner',
    steps: [
      'Feche os olhos e imagine-se em seu espaço seguro',
      'Visualize uma bolha de luz dourada envolvendo todo o seu corpo',
      'A bolha se expande, criando múltiplas camadas protetoras',
      'Camada externa: fogo azul protetor',
      'Camada média: vento branco purificador',
      'Camada interna: terra verde estabilizadora',
      'Declare mentalmente: "Apenas luz e amor podem entrar"',
      'Sinta a segurança e proteção completas',
      'Desbloqueie lentamente, mantendo a consciência do escudo',
    ],
    affirmations: [
      'Sou protegido por luz divina',
      'Nenhuma energia negativa pode me alcançar',
      'Meu campo áurico está selado com proteção',
    ],
    colors: ['Azul', 'Branco', 'Verde', 'Dourado'],
    sefirot: ['Gevurah', 'Malkuth'],
    chakra: 'Muladhara (1º)',
  },
  {
    id: 'lotus-opening',
    type: 'ascension',
    name: 'Abertura do Lótus Espiritual',
    nameEn: 'Lotus Opening',
    description: 'Abertura progressiva dos chakras como pétalas de lótus.',
    tradition: 'yoga',
    duration: 35,
    difficulty: 'intermediate',
    steps: [
      'Deite-se ou sente-se confortavelmente',
      'Comece na raiz (vermelho): visualize uma flor vermelha se abrindo',
      'Suba ao sacral (laranja): pétalas laranja se desdobram',
      'Plexo solar (amarelo): luz amarela irradia das pétalas',
      'Coração (verde): abra as pétalas verdes com compaixão',
      'Garganta (azul): expressão criativa flui da flor azul',
      'Terceiro olho (índigo): percepção clara emerge da flor índigo',
      'Coroa (violeta/branco): mil pétalas se abrem para o divino',
      'Permaneça na consciência do lótus completo aberto',
    ],
    affirmations: [
      'Cada chakra é uma pétala de luz que se abre',
      'Minha energia espiritual flui livremente',
      'Sou um ser de luz multidimencional',
    ],
    colors: ['Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul', 'Índigo', 'Violeta'],
    sefirot: ['Kether', 'Tipheret', 'Malkuth'],
    chakra: 'Todos (Sete chakras)',
  },
  {
    id: 'loving-kindness',
    type: 'love',
    name: 'Metta — Amor Bondoso',
    nameEn: 'Loving Kindness Visualization',
    description: 'Cultivo de amor e compaixão direcionado a si mesmo e a outros.',
    tradition: 'mystic',
    duration: 25,
    difficulty: 'beginner',
    steps: [
      'Sente-se em paz, com as mãos sobre o coração',
      'Visualize-se como uma esfera de luz rosa quente',
      'Envia amor a si mesmo: "Que eu seja feliz, saudável, em paz"',
      'Amplie a esfera para incluir sua família',
      'Adicione amigos e pessoas queridas',
      'Inclua conhecidos e colegas',
      'Abra para todos os seres: humanos, animais, natureza',
      'Permita que ondas de amor se expandam infinitamente',
    ],
    affirmations: [
      'O amor é minha essência',
      'Eu envio amor a todos os seres',
      'Compassão flui naturalmente de mim',
    ],
    colors: ['Rosa', 'Branco', 'Dourado'],
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 'Anahata (4º)',
  },
  {
    id: 'oxum-river',
    type: 'manifestation',
    name: 'Rio de Oxum — Prosperidade',
    nameEn: 'Oxum River Visualization',
    description: 'Conexão com a energia de Oxum para prosperidade e amor.',
    tradition: 'cabala',
    duration: 20,
    difficulty: 'beginner',
    steps: [
      'Visualize um rio de água doce e cristalina',
      'Observe Oxum banhando-se nas águas, irradiando luz dourada',
      'Entre no rio e sinta a água abençoada tocando sua pele',
      'A água entra em você, preenchendo cada célula com brilho dourado',
      'Visualize suas necessidades sendo atendidas: dinheiro, amor, saúde',
      'Oxum sorri para você e diz palavras de bênção',
      'Colete a água dourada em um frasco para levar consigo',
      'Agradeça a Oxum e permita que ela continue abençoando você',
    ],
    affirmations: [
      'Oxum me abençoa com prosperidade',
      'O amor e a riqueza fluem para mim',
      'Sou digno de todas as bênçãos',
    ],
    colors: ['Dourado', 'Azul claro', 'Rosa'],
    sefirot: ['Chesed', 'Hod'],
    chakra: 'Svadhisthana (2º)',
    orixa: 'Oxum',
  },
  {
    id: 'ancestral-connection',
    type: 'ancestral',
    name: 'Conexão com os Ancestrais',
    nameEn: 'Ancestral Connection',
    description: 'Visualização para conectar com a sabedoria ancestral.',
    tradition: 'shamanic',
    duration: 30,
    difficulty: 'intermediate',
    steps: [
      'Visualize uma árvore genealógica iluminada acima de você',
      ' Seus ancestrais aparecem como esferas de luz em cada ramo',
      'Conecte-se com ancestrais recentes (pais, avós)',
      'Expanda para ancestrais antigos (gerações)',
      'Permita que eles compartilhem sabedoria através de imagens',
      'Receba bênçãos e proteção de cada ancestral',
      'Visualize raízes descendo para a terra, conectando com toda a linhagem',
      'Agradeça e prometa honrar a ancestralidade',
      'Retorne sabendo que os ancestrais sempre estão com você',
    ],
    affirmations: [
      'Eu honro meus ancestrais',
      'A sabedoria ancestral flui através de mim',
      'Sou protegido pela linhagem familiar',
    ],
    colors: ['Branco', 'Azul', 'Dourado'],
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 'Muladhara (1º)',
  },
  {
    id: 'third-eye-expansion',
    type: 'clarity',
    name: 'Expansão do Terceiro Olho',
    nameEn: 'Third Eye Expansion',
    description: 'Desenvolvimento da visão interna e clareza mental.',
    tradition: 'yoga',
    duration: 20,
    difficulty: 'intermediate',
    steps: [
      'Sente-se com os olhos fechados, focando entre as sobrancelhas',
      'Visualize um olho indigo brilhante no centro da testa',
      'O olho se abre, revelando uma visão além do físico',
      'Observe cores, símbolos e mensagens da intuição',
      'Permita que conhecimento antigo se revele',
      'Veja sua vida com clareza total: propósito, direção, verdades ocultas',
      'Receba compreensão sobre questões atuais',
      'Feche suavemente o terceiro olho, selando a visão',
      'Agradeça pela sabedoria recebida',
    ],
    affirmations: [
      'Minha intuição é clara e confiável',
      'Eu vejo além das ilusões',
      'A sabedoria verdadeira habita em mim',
    ],
    colors: ['Índigo', 'Violeta', 'Branco'],
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 'Ajna (6º)',
  },
  {
    id: 'cosmic-egg',
    type: 'ascension',
    name: 'Ovo Cósmico — Evolução Espiritual',
    nameEn: 'Cosmic Egg Visualization',
    description: 'Transformação através da visualização do ovo cósmico.',
    tradition: 'taoist',
    duration: 25,
    difficulty: 'advanced',
    steps: [
      'Visualize-se dentro de um enorme ovo de luz prateada',
      'O ovo flutua no espaço cósmico, cercado de estrelas',
      'Dentro do ovo, você está em um estado de potencial puro',
      'Sinta sua essência expandindo para além dos limites',
      'Visualize seu eu superior iluminado e eterno',
      'Observe seu caminho espiritual brilhando como uma trilha de luz',
      'Permita que velha versões de você se dissolvam na luz',
      'Renova-se como ser espiritual evoluído',
      'Beba o ovo de volta ao seu coração, tornando-se uno com a luz cósmica',
    ],
    affirmations: [
      'Eu sou um ser de luz infinito',
      'Minha essência transcende o físico',
      'A evolução espiritual é meu caminho',
    ],
    colors: ['Prata', 'Branco', 'Azul cristal'],
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 'Sahasrara (7º)',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = VisualizationQuerySchema.safeParse({
    type: searchParams.get('type'),
    tradition: searchParams.get('tradition'),
    duration: searchParams.get('duration'),
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

  const { type, tradition, duration, includeSteps, limit } = parseResult.data;
  let practices = [...VISUALIZATION_PRACTICES];

  if (type) {
    practices = practices.filter(p => p.type === type);
  }

  if (tradition) {
    practices = practices.filter(p => p.tradition === tradition);
  }

  if (duration) {
    practices = practices.filter(p => p.duration <= duration);
  }

  if (limit) {
    practices = practices.slice(0, limit);
  }

  // Filter out steps if not requested
  const response = practices.map(p => {
    if (!includeSteps) {
      const { steps, ...rest } = p;
      return rest;
    }
    return p;
  });

  return NextResponse.json({
    success: true,
    practices: response,
    count: response.length,
    total: VISUALIZATION_PRACTICES.length,
    types: {
      manifestation: VISUALIZATION_PRACTICES.filter(p => p.type === 'manifestation').length,
      healing: VISUALIZATION_PRACTICES.filter(p => p.type === 'healing').length,
      protection: VISUALIZATION_PRACTICES.filter(p => p.type === 'protection').length,
      ascension: VISUALIZATION_PRACTICES.filter(p => p.type === 'ascension').length,
      love: VISUALIZATION_PRACTICES.filter(p => p.type === 'love').length,
      ancestral: VISUALIZATION_PRACTICES.filter(p => p.type === 'ancestral').length,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const bodySchema = z.object({
      practiceId: z.string().optional(),
      type: VisualizationTypeSchema.optional(),
      visualization: z.string().optional(),
      duration: z.number().int().positive().optional(),
    });

    const parseResult = bodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      practice: {
        id: crypto.randomUUID(),
        ...parseResult.data,
        timestamp: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar prática de visualização',
    }, { status: 500 });
  }
}