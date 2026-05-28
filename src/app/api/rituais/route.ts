// ============================================================
// RITUAIS API - CABALA DOS CAMINHOS
// ============================================================
// API route for spiritual rituals management
// Includes: ebó, banho, defumação, oração, firmeza
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  successResponse, 
  errorResponse,
  validateQueryParams,
  checkRequestRateLimit,
  getAuthUser,
} from '@/lib/api/base-route';
import { ErrorCode } from '@/lib/error-handling';
import { logger } from '@/lib/logging';
import { getCorrespondenciasDia } from '@/lib/data/spiritual-data';

// ============================================================
// TYPES
// ============================================================

export type RitualType = 'ebó' | 'banho' | 'defumacao' | 'oracao' | 'firmeza';

export interface RitualInstruction {
  etapa: number;
  titulo: string;
  descricao: string;
  duracao?: string;
}

export interface Ritual {
  id: string;
  tipo: RitualType;
  nome: string;
  nomeOrisha?: string;
  diaSemana?: string;
  energia: 'limpadora' | 'protetora' | 'abundancia' | 'paz' | 'coragem' | 'amor' | 'saude' | 'sabedoria';
  cor?: string[];
  elementos?: string[];
  instrucoes: RitualInstruction[];
  oracoes?: string[];
  quandoEvitar?: string;
}

export interface RitualCompletion {
  ritualId: string;
  completedAt: string;
  notaPessoal?: string;
  ip?: string;
}

export interface RitualResponse {
  ritual: Ritual;
  disponivel: boolean;
  motivacao?: string;
}

export interface RitualListResponse {
  rituais: RitualResponse[];
  diaInfo: {
    dia: string;
    orixas: string[];
    faseLua: string;
    misterio: string;
  };
  stats?: {
    total: number;
    completados: number;
  };
}

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const completionBodySchema = z.object({
  ritualId: z.string().min(1, 'ID do ritual é obrigatório'),
  notaPessoal: z.string().max(500).optional(),
});

// ============================================================
// RITUAL DATA
// ============================================================

const rituaisBase: Ritual[] = [
  // EBÓS
  {
    id: 'ebo-limpeza-segunda',
    tipo: 'ebó',
    nome: 'Ebó de Aterramento e Limpeza',
    nomeOrisha: 'Omolu / Obaluaê',
    diaSemana: 'segunda',
    energia: 'limpadora',
    cor: ['Vermelho', 'Preto', 'Branco'],
    elementos: ['farinha de mandioca', 'quiabo', 'pimenta', 'vela vermelha', 'alcool'],
    instrucoes: [
      { etapa: 1, titulo: 'Preparação do Ambiente', descricao: 'Limpe o espaço com vassoura de palha, varrendo do centro para fora', duracao: '15 minutos' },
      { etapa: 2, titulo: 'Montagem do Ebó', descricao: 'Coloque os elementos em vasilha de barro: farinha no fundo, depois quiabo, pimenta e alcool', duracao: '10 minutos' },
      { etapa: 3, titulo: 'Acendimento', descricao: 'Acenda a vela vermelha e faça sua petición a Omolu pela limpeza espiritual', duracao: '5 minutos' },
      { etapa: 4, titulo: 'Oração de Encerramento', descricao: 'Recite: "Omolu, abre o caminho, tira o mau-olhado e limpa minha alma"', duracao: '5 minutos' },
      { etapa: 5, titulo: 'Descarrego', descricao: 'Enterre os elementos em terra limpa ao amanhecer do dia seguinte', duracao: '5 minutos' },
    ],
    quandoEvitar: 'Dias de festa de Exu e em período menstrual (tradição)',
  },
  {
    id: 'ebo-liberacao-terca',
    tipo: 'ebó',
    nome: 'Ebó de Corte e Liberação',
    nomeOrisha: 'Iansã',
    diaSemana: 'terca',
    energia: 'coragem',
    cor: ['Laranja', 'Vermelho'],
    elementos: ['espada de São Jorge', 'alcool', 'pimenta', 'cabaco', 'palha'],
    instrucoes: [
      { etapa: 1, titulo: 'Preparação', descricao: 'Em pe, de costas para o nordeste, segure a espada na mão direita', duracao: '5 minutos' },
      { etapa: 2, titulo: 'Corte Simbólico', descricao: 'Com a espada, faça movimentos cortantes para frente e para tras imaginando cortando cordas e correntes', duracao: '10 minutos' },
      { etapa: 3, titulo: 'Defumação com Pimenta', descricao: 'Queime pimenta dedo-de-moça e passe a fumaça pelo corpo da cabeça aos pés', duracao: '10 minutos' },
      { etapa: 4, titulo: 'Banho de Alcool', descricao: 'Misture alcool no banho e passe pelo corpo enquanto repete sua intención de liberation', duracao: '10 minutos' },
      { etapa: 5, titulo: 'Enterro', descricao: 'Enterre os elementos na terra na segunda-feira seguinte', duracao: '5 minutos' },
    ],
    quandoEvitar: 'Sexta-feira e durante a lua cheia',
  },
  {
    id: 'ebo-abundancia-quinta',
    tipo: 'ebó',
    nome: 'Ebó de Abundância e Prosperidade',
    nomeOrisha: 'Oxóssi',
    diaSemana: 'quinta',
    energia: 'abundancia',
    cor: ['Verde', 'Azul'],
    elementos: ['milho', 'feijão', 'arroz', 'coco ralado', 'mel', 'vela verde'],
    instrucoes: [
      { etapa: 1, titulo: 'Oferenda a Oxóssi', descricao: 'Em vasilha branca, monte uma oferenda com os alimentos', duracao: '15 minutos' },
      { etapa: 2, titulo: 'Conexão com a Abundância', descricao: 'Visualize Oxóssi chegando com seu arco e flecha, abrindo os caminhos', duracao: '10 minutos' },
      { etapa: 3, titulo: 'Mel e Gratidão', descricao: 'Unte as mãos com mel e faça sua solicitação de abundância', duracao: '10 minutos' },
      { etapa: 4, titulo: 'Oração', descricao: 'Recite: "Oxóssi, caçador dos caminhos, traz-me a fartura e a prosperidade"', duracao: '5 minutos' },
      { etapa: 5, titulo: 'Partilha', descricao: 'Deixe a oferenda por 24 horas e depois distribua aos mais necessitados', duracao: '5 minutos' },
    ],
    quandoEvitar: 'Dias de chuva forte',
  },
  
  // BANHOS
  {
    id: 'banho-paz-sexta',
    tipo: 'banho',
    nome: 'Banho de Paz e Harmonia',
    nomeOrisha: 'Oxalá',
    diaSemana: 'sexta',
    energia: 'paz',
    cor: ['Branco', 'Violeta'],
    elementos: ['água de cheiro branca', 'flor de laranjeira', 'álcool de cereal', 'velas brancas'],
    instrucoes: [
      { etapa: 1, titulo: 'Preparação da Água', descricao: 'Ferva água e reserve. Quando morno, adicione água de cheiro branca e flor de laranjeira', duracao: '20 minutos' },
      { etapa: 2, titulo: 'Ambiente Sagrado', descricao: 'Acenda 3 velas brancas no banheiro e faça o sinal da cruz no ar', duracao: '5 minutos' },
      { etapa: 3, titulo: 'Banho de Aspersão', descricao: 'Com a água abençoada, jogue do alto da cabeça para baixo, mentalizando paz', duracao: '10 minutos' },
      { etapa: 4, titulo: 'Oração a Oxalá', descricao: 'Recite: "Oxalá, Pai divino, limpa minha alma e traz-me a paz eterna"', duracao: '5 minutos' },
      { etapa: 5, titulo: 'Secagem', descricao: 'Seque-se com toalha limpa e vista roupas brancas', duracao: '5 minutos' },
    ],
    quandoEvitar: 'À noite e em dias de trabalho pesado',
  },
  {
    id: 'banho-amor-sabado',
    tipo: 'banho',
    nome: 'Banho de Amor de Oxum',
    nomeOrisha: 'Oxum',
    diaSemana: 'sabado',
    energia: 'amor',
    cor: ['Rosa', 'Azul Escuro'],
    elementos: ['pétalas de rosa', 'água de colônia', 'canela em pau', 'mel', 'ouroente'],
    instrucoes: [
      { etapa: 1, titulo: 'Preparação', descricao: 'Faça uma infusão de pétalas de rosa em água morna por 30 minutos', duracao: '35 minutos' },
      { etapa: 2, titulo: 'Mistura Sagrada', descricao: 'Adicione água de colônia, mel e algumas gotas de ouroente à água de rosas', duracao: '10 minutos' },
      { etapa: 3, titulo: 'Banho de Oxum', descricao: 'Tomando de pé, com os pés descalços na terra, despeje a água pelo corpo', duracao: '10 minutos' },
      { etapa: 4, titulo: 'Visualização', descricao: 'Visualize Oxum com seu espelho dourado, irradiando amor e abundância', duracao: '10 minutos' },
      { etapa: 5, titulo: 'Oração', descricao: 'Recite: "Oxum, mãe das águas, abra meu coração para o amor verdadeiro"', duracao: '5 minutos' },
    ],
    quandoEvitar: 'Durante o período menstrual (tradição)',
  },
  {
    id: 'banho-energia-domingo',
    tipo: 'banho',
    nome: 'Banho de Recarga Solar',
    nomeOrisha: 'Xangô Solar',
    diaSemana: 'domingo',
    energia: 'coragem',
    cor: ['Amarelo', 'Dourado'],
    elementos: ['água de flor de abóbora', 'cravos da Índia', 'canela', 'sol'],
    instrucoes: [
      { etapa: 1, titulo: 'Infusão Energética', descricao: 'Faça infusão de flor de abóbora com cravos e canela ao sol por 2 horas', duracao: '2 horas' },
      { etapa: 2, titulo: 'Exposição ao Sol', descricao: 'Tome sol direto por 15-30 minutos na pele ou rosto para cargar a vitamina D', duracao: '30 minutos' },
      { etapa: 3, titulo: 'Banho Carregado', descricao: 'Aplique a água energizada pelo corpo, preferencialmente às 6h da manhã', duracao: '15 minutos' },
      { etapa: 4, titulo: 'Poder Pessoal', descricao: 'Repita: "Sol de Xangô, recarga minha energia, dá-me força e poder"', duracao: '5 minutos' },
    ],
    quandoEvitar: 'Entre 10h e 16h para evitar queimaduras',
  },

  // DEFUMAÇÕES
  {
    id: 'defumacao-protetora-terca',
    tipo: 'defumacao',
    nome: 'Defumação Protetora de Ogum',
    nomeOrisha: 'Ogum',
    diaSemana: 'terca',
    energia: 'protetora',
    cor: ['Vermelho', 'Verde'],
    elementos: ['guiné', 'pimenta preta', 'cravo-da-índia', 'lavanda', 'alecrim'],
    instrucoes: [
      { etapa: 1, titulo: 'Preparação da Fogueira', descricao: 'Em recipiente metálico, faça uma base com carvão e elementos secos', duracao: '10 minutos' },
      { etapa: 2, titulo: 'Queima Sagrada', descricao: 'Acenda o carvão e adicione guiné, pimenta preta e cravo', duracao: '5 minutos' },
      { etapa: 3, titulo: 'Defumação do Espaço', descricao: 'Passe a fumaça por todos os cômodos da casa, começando pela porta', duracao: '20 minutos' },
      { etapa: 4, titulo: 'Proteção do Corpo', descricao: 'Com um leque ou prato, leve a fumaça ao redor do corpo', duracao: '10 minutos' },
      { etapa: 5, titulo: 'Oração de Proteção', descricao: 'Recite: "Ogum, guerreiro, abre meus caminhos e protege meus passos"', duracao: '5 minutos' },
    ],
    quandoEvitar: 'Em ambientes fechados sem ventilação',
  },
  {
    id: 'defumacao-sabado',
    tipo: 'defumacao',
    nome: 'Defumação de Purificação de Iemanjá',
    nomeOrisha: 'Iemanjá',
    diaSemana: 'sabado',
    energia: 'limpadora',
    cor: ['Azul', 'Branco'],
    elementos: ['arruda', 'manjericão', 'sálvia', 'cáscara de arroz', 'flor branca'],
    instrucoes: [
      { etapa: 1, titulo: 'Preparação', descricao: 'Misture arruda, manjericão e sálvia em um recipiente', duracao: '10 minutos' },
      { etapa: 2, titulo: 'Queima Controlada', descricao: 'Coloque a mistura em brasa e deixe a fumaça subir suavemente', duracao: '5 minutos' },
      { etapa: 3, titulo: 'Purificação', descricao: 'Passe a fumaça pela casa, especialmente nos cantos e janelas', duracao: '15 minutos' },
      { etapa: 4, titulo: 'Oração às Águas', descricao: 'Recite: "Iemanjá, mãe das águas, lava minhas energias e traz-me paz"', duracao: '5 minutos' },
      { etapa: 5, titulo: 'Lançamento às Águas', descricao: 'Ao amanhecer, leve um pouco da sisa (restos) ao mar ou rio', duracao: '10 minutos' },
    ],
    quandoEvitar: 'Dias de maré muito alta',
  },

  // ORAÇÕES
  {
    id: 'oracao-oxala-sexta',
    tipo: 'oracao',
    nome: 'Oração de Paz de Oxalá',
    nomeOrisha: 'Oxalá',
    diaSemana: 'sexta',
    energia: 'paz',
    instrucoes: [
      { etapa: 1, titulo: 'Postura', descricao: 'Sente-se em silêncio, de preferência usando branco', duracao: '5 minutos' },
      { etapa: 2, titulo: 'Respiração Sagrada', descricao: 'Respire profundamente 3 vezes, imaginando luz branca entrando', duracao: '5 minutos' },
      { etapa: 3, titulo: 'Oração Central', descricao: 'Recite: "Oxalá, Pai de toda luz, que a paz reine em minha vida"', duracao: '10 minutos' },
      { etapa: 4, titulo: 'Gratidão', descricao: 'Liste mentalmente 5 coisas pelas quais é grato', duracao: '10 minutos' },
      { etapa: 5, titulo: 'Encerramento', descricao: 'Visualize a luz branca envolvendo você e sua família', duracao: '5 minutos' },
    ],
    oracoes: [
      'Pai Oxalá, cria em mim um coração puro e limpo',
      'Que a paz de Oxalá governe todos os meus pensamentos',
      'Oxalá, Pai eterno, guia meus passos pela estrada da luz',
      'Abençoai-me, Oxalá, com a sabedoria dos anciãos',
    ],
  },
  {
    id: 'oracao-oxossi-quinta',
    tipo: 'oracao',
    nome: 'Oração de Abundância de Oxóssi',
    nomeOrisha: 'Oxóssi',
    diaSemana: 'quinta',
    energia: 'abundancia',
    instrucoes: [
      { etapa: 1, titulo: 'Conexão com Oxóssi', descricao: 'Visualize Oxóssi em sua mata sagrada com seu arco', duracao: '5 minutos' },
      { etapa: 2, titulo: 'Abertura dos Caminhos', descricao: 'Recite: "Oxóssi, abre os caminhos para que eu possa avançar"', duracao: '10 minutos' },
      { etapa: 3, titulo: 'Petición de Fartura', descricao: 'Peça em silêncio pela abundância que necessita', duracao: '10 minutos' },
      { etapa: 4, titulo: 'Promessa', descricao: 'Faça uma promessa de gratidão quando sua prayer for respondida', duracao: '5 minutos' },
    ],
    oracoes: [
      'Oxóssi, caçador dos bons caminhos, traz-me a fartura',
      'Que as flechas de Oxóssi abram todas as portas cerradas',
      'Oxóssi, mestre das matas, ensina-me a buscar com sabedoria',
      'Na força de Oxóssi, declaro abundância em minha vida',
    ],
  },

  // FIRMEZAS
  {
    id: 'firmeza-xango-quarta',
    tipo: 'firmeza',
    nome: 'Firmeza de Xangô pela Justiça',
    nomeOrisha: 'Xangô',
    diaSemana: 'quarta',
    energia: 'coragem',
    cor: ['Vermelho', 'Branco'],
    elementos: ['dois jarros', 'água', 'pedras de raio', 'pano branco'],
    instrucoes: [
      { etapa: 1, titulo: 'Preparação dos Jarros', descricao: 'Encha dois jarros com água limpa, representando a justiça', duracao: '10 minutos' },
      { etapa: 2, titulo: 'Simbolismo de Xangô', descricao: 'Coloque uma pedra de raio em cada jarro, symbolizando seu poder', duracao: '5 minutos' },
      { etapa: 3, titulo: 'Firmeza', descricao: 'Com as mãos nos jarros, declare sua intenção de justiça e verdade', duracao: '10 minutos' },
      { etapa: 4, titulo: 'Oração de Xangô', descricao: 'Recite: "Xangô, senhor da justiça, fazei cair o raio sobre a falsidade"', duracao: '10 minutos' },
      { etapa: 5, titulo: 'Manutenção', descricao: 'Mantenha os jarros em lugar alto por 9 dias, renovando a água', duracao: '5 minutos' },
    ],
    quandoEvitar: 'Dias de chuva (raios reais são perigosos)',
  },
  {
    id: 'firmeza-oxum-sabado',
    tipo: 'firmeza',
    nome: 'Firmeza de Oxum pelo Amor',
    nomeOrisha: 'Oxum',
    diaSemana: 'sabado',
    energia: 'amor',
    cor: ['Rosa', 'Azul'],
    elementos: ['espelho pequeno', 'ouroente', 'pétalas de rosa', 'mel', 'fita rosa'],
    instrucoes: [
      { etapa: 1, titulo: 'Preparação do Altar', descricao: 'Cubra uma mesa com pano rosa e coloque o espelho no centro', duracao: '10 minutos' },
      { etapa: 2, titulo: 'Oferenda', descricao: 'Unte o espelho com ouroente e coloque pétalas ao redor', duracao: '10 minutos' },
      { etapa: 3, titulo: 'Firmeza do Vínculo', descricao: 'Olhe no espelho e repita: "Oxum, fortalece meu amor"', duracao: '15 minutos' },
      { etapa: 4, titulo: 'Mel da Harmonia', descricao: 'Beba água com mel enquanto visualiza harmonia no relacionamento', duracao: '10 minutos' },
      { etapa: 5, titulo: 'Amarrado', descricao: 'Com fita rosa, amarre uma pequena promessa escrita', duracao: '5 minutos' },
    ],
    quandoEvitar: 'Não realizar se houver dúvida sobre o sentimento',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDayOfWeekKey(date: Date = new Date()): string {
  const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  return dias[date.getDay()];
}

function isRitualAvailableToday(ritual: Ritual, hoje: string): boolean {
  if (!ritual.diaSemana) return true;
  return ritual.diaSemana === hoje;
}

function getMotivacaoDoDia(dia: string): string {
  const motivacoes: Record<string, string> = {
    segunda: 'Hoje é dia de limpeza espiritual e aterramento. Omolu abre o caminho para novas energias.',
    terca: 'Dia de força e movimento. Iansã e Ogum trabalham juntos para cortar demandas.',
    quarta: 'Dia da justiça divina. Xangô revela a verdade e abre os caminhos da mente.',
    quinta: 'Dia da abundância e conhecimento. Oxóssi traz fartura e sabedoria das matas.',
    sexta: 'Dia de paz e pureza. Oxalá conecta você diretamente com o Divino.',
    sabado: 'Dia das Grandes Mães. Oxum e Iemanjá regem o amor e a intuição.',
    domingo: 'Dia de recarga vital. O Sol renova seu poder pessoal e propósito.',
  };
  return motivacoes[dia] || 'Aguardo a guidance dos Orixás neste dia especial.';
}

// In-memory store for completions (in production, use Redis/Prisma)
const completionStore = new Map<string, RitualCompletion>();

// ============================================================
// API ROUTE HANDLERS
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = checkRequestRateLimit(request, { maxRequests: 60, windowMs: 60000 });
    if (!rateLimit.allowed) {
      return errorResponse({ code: ErrorCode.RATE_LIMIT_EXCEEDED, message: 'Muitas requisições, tente novamente em breve' });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') as RitualType | null;
    const dia = searchParams.get('dia');

    // Get current day info
    const correspondencias = getCorrespondenciasDia();
    const hoje = getDayOfWeekKey();

    // Filter rituals
    let rituaisFiltrados = rituaisBase;

    if (tipo) {
      rituaisFiltrados = rituaisFiltrados.filter(r => r.tipo === tipo);
    }

    if (dia) {
      rituaisFiltrados = rituaisFiltrados.filter(r => r.diaSemana === dia);
    }

    // Get completions for stats
    const auth = await getAuthUser(request);
    const userId = auth.user?.id || 'anonymous';
    const todayStr = new Date().toISOString().split('T')[0];
    const completadosIds = Array.from(completionStore.entries())
      .filter(([key]) => key.startsWith(`${userId}:`))
      .filter(([, completion]) => completion.completedAt.startsWith(todayStr))
      .map(([, completion]) => completion.ritualId);

    // Build response
    const rituaisResponse: RitualResponse[] = rituaisFiltrados.map(ritual => ({
      ritual,
      disponivel: isRitualAvailableToday(ritual, hoje),
      motivacao: isRitualAvailableToday(ritual, hoje) ? getMotivacaoDoDia(hoje) : undefined,
    }));

    const response: RitualListResponse = {
      rituais: rituaisResponse,
      diaInfo: {
        dia: correspondencias.dia.dia,
        orixas: correspondencias.dia.orixas,
        faseLua: correspondencias.faseLua?.ritual || 'Não disponível',
        misterio: correspondencias.dia.misterio,
      },
      stats: {
        total: rituaisFiltrados.length,
        completados: completadosIds.length,
      },
    };

    logger.info('Rituais listados', { 
      tipo: tipo || 'todos', 
      dia: dia || hoje,
      count: rituaisResponse.length 
    });

    const { body, status } = successResponse(response);
    return NextResponse.json(body, { status });
  } catch (error) {
    logger.error('Erro ao listar rituais', error instanceof Error ? error : undefined, {});
    return errorResponse({ code: ErrorCode.INTERNAL_ERROR, message: 'Erro ao processar requisição' });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = checkRequestRateLimit(request, { maxRequests: 30, windowMs: 60000 });
    if (!rateLimit.allowed) {
      return errorResponse({ code: ErrorCode.RATE_LIMIT_EXCEEDED, message: 'Muitas requisições, tente novamente em breve' });
    }

    // Get user (optional for writing - but allow basic recording)
    const auth = await getAuthUser(request);
    const userId = auth.user?.id || 'anonymous';

    // Parse and validate body
    const body = await request.json();
    const validation = validateQueryParams(completionBodySchema, body as Record<string, string>);

    if (validation.error) {
      return errorResponse({ 
        code: ErrorCode.VALIDATION_ERROR, 
        message: validation.error.message, 
      });
    }

    const { ritualId, notaPessoal } = validation.data;

    // Verify ritual exists
    const ritual = rituaisBase.find(r => r.id === ritualId);
    if (!ritual) {
      return errorResponse({ code: ErrorCode.RESOURCE_NOT_FOUND, message: 'Ritual não encontrado' });
    }

    // Record completion
    const completion: RitualCompletion = {
      ritualId,
      completedAt: new Date().toISOString(),
      notaPessoal,
      ip: request.headers.get('x-forwarded-for') || undefined,
    };

    const key = `${userId}:${ritualId}:${new Date().toISOString().split('T')[0]}`;
    completionStore.set(key, completion);

    logger.info('Ritual completado', { 
      ritualId, 
      userId,
      tipo: ritual.tipo,
      nome: ritual.nome 
    });

    const result = successResponse({
      message: 'Ritual registrado com sucesso',
      completion: {
        ritualId,
        ritualNome: ritual.nome,
        tipo: ritual.tipo,
        completedAt: completion.completedAt,
      },
    });
    return NextResponse.json(result.body, { status: 201 });
  } catch (error) {
    logger.error('Erro ao registrar ritual', error instanceof Error ? error : undefined, {});
    return errorResponse({ code: ErrorCode.INTERNAL_ERROR, message: 'Erro ao processar requisição' });
  }
}