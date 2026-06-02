// Divination API - skip linting
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const DivinationMethod = z.enum(['búzios', 'cards', 'cowries', 'opalã', 'ebós', 'geomancia']);
export type DivinationMethodType = z.infer<typeof DivinationMethod>;
const DivinationDomain = z.enum(['amor', 'trabalho', 'saúde', 'espiritual', 'financeiro', 'geral']);
const DivinationQuerySchema = z.object({
  method: DivinationMethod.optional().default('búzios'),
  domain: DivinationDomain.optional().default('geral'),
  intensity: z.coerce.number().int().min(1).max(3).optional().default(2),
  count: z.coerce.number().int().min(1).max(16).optional(),
});

// ─── Type Aliases ───────────────────────────────────────────────────────────
// fallow-ignore-next-line unused-type
export interface DivinationReading {
  id: string;
  method: DivinationMethodType;
  symbols: string[];
  interpretation: string;
  guidance: string;
  warnings?: string[];
  timestamp: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

// ─── Spiritual Correlations by Method ──────────────────────────────────────────────────
const DIVINATION_SPIRITUAL_CORRELATIONS: Record<DivinationMethodType, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  búzios: { sefirot: ['Binah', 'Chokhmah'], chakra: 6, element: 'Água', orixa: 'Orunmilá', affirmation: 'A sabedoria ancestral guia meus passos', frequency: '528 Hz' },
  cards: { sefirot: ['Tipheret', 'Hod'], chakra: 6, element: 'Ar', orixa: 'Oxalá', affirmation: 'As cartas revelam minha verdade interior', frequency: '639 Hz' },
  cowries: { sefirot: ['Chesed', 'Gevurah'], chakra: 4, element: 'Fogo', orixa: 'Ogum', affirmation: 'A energia dos cowries limpa meu caminho', frequency: '741 Hz' },
  opalã: { sefirot: ['Netzach', 'Yesod'], chakra: 5, element: 'Água', orixa: 'Oxum', affirmation: 'A opalã conecta-me com a energia feminina', frequency: '528 Hz' },
  ebós: { sefirot: ['Chesed', 'Malkuth'], chakra: 3, element: 'Terra', orixa: 'Xangô', affirmation: 'O ebó transforma minha realidade', frequency: '396 Hz' },
  geomancia: { sefirot: ['Malkuth', 'Yesod'], chakra: 1, element: 'Terra', orixa: 'Omolu', affirmation: 'A geomância revela os padrões da terra', frequency: '396 Hz' },
};

// ============================================================
const divinationSymbols = {
  búzios: [
    'Ogundá', 'Eyioko', 'Opossa', 'Alosso', 'Oxê', 'Otrupá',
    'Ocá', 'Ologdede', 'Dan', 'Logunede', 'Osogbo', 'Obará'
  ],
  cards: [
    'Sorte', 'Destino', 'Caminho', 'Fortuna', 'Transformação',
    'Proteção', 'Revolução', 'Destino Cruzado', 'Energia Limpa', 'Confusão'
  ],
  cowries: [
    'Ação', 'Passividade', 'Feminino', 'Masculino', 'Equilíbrio',
    'Caos', 'Ordem', 'Início', 'Fim', 'Permanência'
  ],
  opalã: [
    'Iansã', 'Oxum', 'Iemanjá', 'Oxóssi', 'Xangô', 'Ogum',
    'Shai', 'Obatalá', 'Nanã', 'Oba', 'Ibeji', 'Logunede'
  ],
  ebós: [
    'Sacrifício Necessário', 'Limpeza Espiritual', 'Abertura de Caminho',
    'Proteção', 'Harmonização', 'Libertação', 'Gratidão', 'Renovação'
  ],
  geomancia: [
    'Terra', 'Água', 'Fogo', 'Ar', 'Éter', 'Centro',
    'Limiar', 'Sombra', 'Luz', 'Movimento', 'Estagnação', 'Fluxo'
  ]
};


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateId(): string {
  return `div-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function getSymbols(method: DivinationMethodType, count: number = 3): string[] {
  const pool = divinationSymbols[method];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function interpretSymbols(method: DivinationMethodType, symbols: string[], domain: string): string {
  const interpretations: Record<DivinationMethodType, Record<string, string>> = {
    búzios: {
      amor: 'Os búzios revelam conexões emocionais profundas. O momento favorece reconciliações e novos encontros.',
      trabalho: ' sinaliza mudança profissional. Prepare-se para oportunidades que surgirão.',
      saúde: ' harmoniza seu campo energético. Há necessidade de limpeza espiritual e física.',
      espiritual: ' traz iluminação. Seu caminho está sendo preparado pelos orixás.',
      financeiro: ' indica fluxo de energia. Atos de generosidade trarão retorno.',
      geral: ' traz respostas para suas indagações. A verdade será revelada.'
    },
    cards: {
      amor: 'As cartas indicam um ciclo de renovação amorosa. Confie no processo.',
      trabalho: ' sinaliza transformações em sua carreira. Novas habilidades serão valorizadas.',
      saúde: ' alerta para necessidade de autocuidado. Seu corpo pede atenção.',
      espiritual: ' revela uma jornada de despertar. Você está no caminho certo.',
      financeiro: ' indica necessidade de cautela, mas também oportunidades.',
      geral: ' traz uma mensagem importante que não pode ser ignorada.'
    },
    cowries: {
      amor: 'Os cowries mostram equilíbrio entre dar e receber. A paciência será recompensada.',
      trabalho: ' indica movimento no campo profissional. Flexibilidade é a chave.',
      saúde: ' aponta para necessidade de harmonia entre mente e corpo.',
      espiritual: ' revela proteção espiritual em andamento. Continue firme.',
      financeiro: ' sinaliza ciclo de investimento pessoal. Seu esforço trará frutos.',
      geral: ' traz orientações sobre seu momento atual.'
    },
    opalã: {
      amor: 'As opalã indicam influência de Oxum em seu amor. Romance está no ar.',
      trabalho: ' sinaliza proteção de Ogum em seus negócios. Aja com coragem.',
      saúde: ' revela cuidado de Iansã. Sua energia está sendo renovada.',
      espiritual: ' traz benção de Obatalá. Sua espiritualidade está crescendo.',
      financeiro: ' indica intervenção de Oxum Kare. Abundância está a caminho.',
      geral: ' revela o momento espiritual que você está vivenciando.'
    },
    ebós: {
      amor: 'O ebó indica necessidade de limpeza emocional antes de um novo amor.',
      trabalho: ' sinaliza que um sacrifício pequeno trará grande retorno.',
      saúde: ' alerta para ritual de purificação. Seu corpo precisa de atenção.',
      espiritual: ' revela que você está em período de transformação profunda.',
      financeiro: ' indica necessidade de mudança de hábitos para prosperidade.',
      geral: ' traz orientação sobre ação espiritual necessária.'
    },
    geomancia: {
      amor: 'A geomância revela linhas de conexão no seu mapa afetivo.',
      trabalho: ' sinaliza influência dos elementos no seu sucesso profissional.',
      saúde: ' aponta para equilíbrio elemental no seu corpo.',
      espiritual: ' revela символы de transformação em sua jornada.',
      financeiro: ' indica distribuição energética em suas finanças.',
      geral: ' traz análise do seu momento presente.'
    }
  };

  const mainSymbol = symbols[0];
  return `${mainSymbol}${interpretations[method][domain]}`;
}

function generateGuidance(method: DivinationMethodType, symbols: string[], domain: string): string {
  const guidanceTemplates: Record<DivinationMethodType, string> = {
    búzios: 'Realize um ebó de abertura com milho branco e mel. Candle uma vela branca ao cair da noite por 7 dias.',
    cards: 'Embaralhe suas intenções e escolha três cartas. Medite sobre cada uma antes de prosseguir.',
    cowries: 'Faça uma oração a Exu antes de manusear os cowries. Trace um círculo no chão com farinha de milharina.',
    opalã: 'Consultem o orixá indicador através de um ritual de opalã com acompanhamento de um babalorixá.',
    ebós: 'Prepare um ebó com folhas verdes, água de flor e uma vela dorada. Mantenha-o em local limpo por 3 dias.',
    geomancia: 'Observe a posição dos elementos e trace linhas entre os pontos ativos. A figura formada é sua resposta.'
  };

  return guidanceTemplates[method];
}

function generateWarnings(method: DivinationMethodType, domain: string): string[] {
  const warnings: string[] = [];

  if (domain === 'espiritual') {
    warnings.push('Evite rituais de abertura de caminho em dias de lua cheia.');
  }
  if (method === 'búzios' || method === 'opalã') {
    warnings.push('Busque orientação de um religioso experiente antes de prosseguir.');
  }
  if (Math.random() > 0.7) {
    warnings.push('Desconfie de respostas que prometen resultado imediato.');
  }

  return warnings;
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/divination
 * Perform a spiritual divination reading
 */
// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const methodParam = searchParams.get('method');
    const domainParam = searchParams.get('domain');
    const intensityParam = searchParams.get('intensity');

    // Validate method
    const method: DivinationMethodType = (methodParam as DivinationMethodType) || 'búzios';
    const validMethods: DivinationMethodType[] = ['búzios', 'cards', 'cowries', 'opalã', 'ebós', 'geomancia'];

    if (!validMethods.includes(method)) {
      return NextResponse.json(
        {
          error: 'Método inválido',
          validMethods
        },
        { status: 400 }
      );
    }

    // Validate domain
    const domain = (domainParam || 'geral') as z.infer<typeof DivinationDomain>;
    const validDomains = ['amor', 'trabalho', 'saúde', 'espiritual', 'financeiro', 'geral'];

    if (!validDomains.includes(domain)) {
      return NextResponse.json(
        {
          error: 'Domínio inválido',
          validDomains
        },
        { status: 400 }
      );
    }

    // Intensity (1-3, default 2)
    const intensity = Math.min(3, Math.max(1, parseInt(intensityParam || '2', 10)));

    // Generate reading based on method
    const symbolCount = intensity + 1;
    const symbols = getSymbols(method, symbolCount);
    const interpretation = interpretSymbols(method, symbols, domain);
    const guidance = generateGuidance(method, symbols, domain);
    const warnings = generateWarnings(method, domain);
    const spiritualCorr = DIVINATION_SPIRITUAL_CORRELATIONS[method];

    const reading: DivinationReading = {
      id: generateId(),
      method,
      symbols,
      interpretation,
      guidance,
      warnings,
      timestamp: new Date().toISOString(),
      spiritualCorrelations: {
        sefirot: spiritualCorr.sefirot,
        chakra: spiritualCorr.chakra,
        element: spiritualCorr.element,
        orixa: spiritualCorr.orixa,
        affirmation: spiritualCorr.affirmation,
        frequency: spiritualCorr.frequency,
      },
    };

    return NextResponse.json({
      success: true,
      data: reading,
      spiritualCorrelations: spiritualCorr,
      meta: {
        method,
        domain,
        intensity,
        timestamp: reading.timestamp,
        availableMethods: validMethods,
        availableDomains: validDomains,
      }
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro ao realizar divinização' },
      { status: 500 }
    );
  }
}