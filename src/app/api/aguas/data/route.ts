// ============================================================
// AGUAS DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Aguas (sacred waters) data
// - Tipos de Agua, Propriedades, Elementos, Chakras
// - Aguas Rituais, Tratamentos, Afirmacoes
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export interface TipoAgua {
  id: string;
  nome: string;
  nomePt: string;
  descricao: string;
  elemento: string;
  planeta: string;
  qualidade: string[];
  propriedades: string[];
  praticasRituais: string[];
  afirmacao: string;
}

export interface PropriedadeAgua {
  id: string;
  nome: string;
  nomePt: string;
  descricao: string;
  efeito: string;
  aplicacao: string[];
  duracaoMinima: number;
}

export interface ElementoAgua {
  id: string;
  nome: string;
  nomePt: string;
  qualidade: string;
  emocional: string[];
  spiritual: string[];
  cura: string[];
}

export interface AguaRitual {
  id: string;
  nome: string;
  nomePt: string;
  tipo: string;
  orixa: string;
  elementos: string[];
  preparation: string;
  uso: string[];
  protected: string[];
  afirmacao: string;
}

export interface TratamentoAgua {
  id: string;
  nome: string;
  nomePt: string;
  tipo: string;
  duracao: string;
  temperatura: string;
  beneficios: string[];
  contraIndicacoes: string[];
  acompanhamento: string[];
}

export interface AfirmacaoAgua {
  id: string;
  texto: string;
  idioma: string;
  contexto: string;
  tipoAguaRelacionada: string;
}

// ============================================================
// AGUAS DATA
// ============================================================

const TIPOS_AGUA: TipoAgua[] = [
  {
    id: 'agua-primordial',
    nome: 'Primordial Water',
    nomePt: 'Água Primordial',
    descricao: 'A água primordial representa a essência criadora, o princípio feminino da vida.',
    elemento: 'agua',
    planeta: 'lua',
    qualidade: ['feminino', 'criador', 'purificador'],
    propriedades: ['limpeza espiritual', 'renovação', 'hidratação da alma'],
    praticasRituais: ['ablução ritual', 'banho purificativo', 'consagração'],
    afirmacao: 'Eu permito que a água primordial lave comigo toda negatividade, renovando minha alma.',
  },
  {
    id: 'agua-fonte',
    nome: 'Source Water',
    nomePt: 'Água de Fonte',
    descricao: 'Água que brota da terra, carregada de minerais e energia terrestre.',
    elemento: 'terra-agua',
    planeta: 'terra',
    qualidade: ['nutritivo', 'estabilizador', 'enraizador'],
    propriedades: ['minerais essenciais', 'força vital', 'conexão-terra'],
    praticasRituais: ['ablução matinal', 'hidratação consciente', 'meditação aquática'],
    afirmacao: 'Com a água de fonte, eu Me conecto com a Terra e absorvo sua sabedoria ancestral.',
  },
  {
    id: 'agua-chuva',
    nome: 'Rain Water',
    nomePt: 'Água de Chuva',
    descricao: 'Água de origem celeste, portadora de energias celestiais e purificação.',
    elemento: 'ar-agua',
    planeta: 'lua',
    qualidade: ['celestial', 'purificador', 'transmutador'],
    propriedades: ['energia lunar', 'transmutação', 'libertação'],
    praticasRituais: ['colheita de chuva', 'ablução lunar', 'ritual de renascimento'],
    afirmacao: 'Como a chuva purifica a terra, eu permito que esta água limpe meus pensamentos obsoletos.',
  },
  {
    id: 'agua-mar',
    nome: 'Sea Water',
    nomePt: 'Água do Mar',
    descricao: 'Água carregada com a energia dos oceanos e a sabedoria dos ancestors marinhos.',
    elemento: 'agua-sal',
    planeta: 'netuno',
    qualidade: ['sagrado', ' ancestral', 'transmutador-salino'],
    propriedades: ['sais-minerais', 'energia-ancestral', 'purificação-profunda'],
    praticasRituais: ['banho de mar', 'ablução salgada', 'ritual de proteção'],
    afirmacao: 'Com a água do mar, eu Me uno à memória ancestral e libero o que não Me serve.',
  },
  {
    id: 'agua-floral',
    nome: 'Flower Water',
    nomePt: 'Água Floral',
    descricao: 'Água infundida com essências de flores, portadora de vibrações florais curativas.',
    elemento: 'agua-floral',
    planeta: 'venus',
    qualidade: ['amoroso', 'curativo', 'refinador'],
    propriedades: ['essências-florais', 'terapia-vibracional', 'harmonização'],
    praticasRituais: ['spray ritual', 'compressas florais', 'ablução perfumada'],
    afirmacao: 'Eu permito que a energia das flores Me banhe em amor e compaixão.',
  },
  {
    id: 'agua-sagrada',
    nome: 'Sacred Water',
    nomePt: 'Água Sagrada',
    descricao: 'Água consagrada por ritos tradicionais, portal de proteção divina.',
    elemento: 'divino-agua',
    planeta: 'jupiter',
    qualidade: ['sagrado', 'protetor', 'canalizador'],
    propriedades: ['consagração', 'proteção', '开门'],
    praticasRituais: ['ablução divina', ' Benedição de espaço', 'consagração de objetos'],
    afirmacao: 'Esta água sagrada é umportal de proteção divina que Me окружает.',
  },
  {
    id: 'agua-rio',
    nome: 'River Water',
    nomePt: 'Água de Rio',
    descricao: 'Água corrente que simboliza o fluxo da vida e a transformação contínua.',
    elemento: 'agua-corrente',
    planeta: 'mercurio',
    qualidade: ['fluido', 'transformador', 'comunicador'],
    propriedades: ['fluxo-contínuo', 'comunicação', 'adaptação'],
    praticasRituais: ['ablução em corrente', 'ritual de fluxo', 'banho de transformação'],
    afirmacao: 'Como o rio, eu flua com a vida, aceitando a transformação como caminho de evolução.',
  },
  {
    id: 'agua-rosa',
    nome: 'Rose Water',
    nomePt: 'Água de Rosa',
    descricao: 'Água destilada de pétalas de rosa, portadora do amor unconditional.',
    elemento: 'flor-agua',
    planeta: 'venus',
    qualidade: ['amoroso', 'suave', 'reconfortante'],
    propriedades: ['amor-incondicional', 'cura-emocional', 'paz-interior'],
    praticasRituais: ['lavagem facial espiritual', 'ablução de coração', 'compressa de amor'],
    afirmacao: 'Eu sou digno de amor. A água de rosa lava Meus medos e Me envolve em amor próprio.',
  },
  {
    id: 'agua-cristal',
    nome: 'Crystal Water',
    nomePt: 'Água de Cristal',
    descricao: 'Água programável carregada por cristais, condutora de intenções elevadas.',
    elemento: 'mineral-cristal',
    planeta: 'cristal',
    qualidade: ['claro', 'ordenado', 'intencional'],
    propriedades: ['programação', 'mineralização', 'frequência-elevada'],
    praticasRituais: ['programação de cristais', 'ablução luminosa', 'meditação aquática'],
    afirmacao: 'Com a água de cristal, eu programo minha mente para a clareza e a luz.',
  },
  {
    id: 'agua-infusa',
    nome: 'Infused Water',
    nomePt: 'Água Infundida',
    descricao: 'Água com ervas e especiarias intencionalmente preparada para fins terapêuticos.',
    elemento: 'erva-agua',
    planeta: 'terra',
    qualidade: ['terapêutico', 'herbáceo', 'nutritivo'],
    propriedades: ['fitoterapia', 'aromaterapia', 'nutrição-espiritual'],
    praticasRituais: ['infusões rituais', 'chás consagração', 'ablução herbácea'],
    afirmacao: 'Eu nutro meu corpo e alma com a sabedoria das ervas infundidas nesta água.',
  },
];

const PROPRIEDADES_AGUA: PropriedadeAgua[] = [
  {
    id: 'dissolucao',
    nome: 'Dissolution',
    nomePt: 'Dissolução',
    descricao: 'Capacidade de dissolver substances e energias densas.',
    efeito: 'purificação',
    aplicacao: ['banho purificativo', 'ablução de energia', 'dissolução de bloqueios'],
    duracaoMinima: 15,
  },
  {
    id: 'fluidez',
    nome: 'Fluidity',
    nomePt: 'Fluidez',
    descricao: 'Propriedade de fluir sem resistência, adaptando-se a qualquer forma.',
    efeito: 'adaptação',
    aplicacao: ['meditação em água', 'visualização fluida', 'trabalho emocional'],
    duracaoMinima: 20,
  },
  {
    id: 'reflexao',
    nome: 'Reflection',
    nomePt: 'Reflexão',
    descricao: 'Capacidade de espelhar e revelar verdades ocultas.',
    efeito: 'revelação',
    aplicacao: ['ritual de auto-conhecimento', 'meditação espelhada', 'trabalho de sombra'],
    duracaoMinima: 30,
  },
  {
    id: 'transparencia',
    nome: 'Transparency',
    nomePt: 'Transparência',
    descricao: 'clareza que permite ver além da superfície.',
    efeito: 'clarificação',
    aplicacao: ['ablução de mente', 'depuração de pensamentos', 'trabalho de clareza'],
    duracaoMinima: 10,
  },
  {
    id: 'peso',
    nome: 'Weight',
    nomePt: 'Peso',
    descricao: 'Força gravitacional que ancora e estabiliza.',
    efeito: 'enraizamento',
    aplicacao: ['ritual de aterramento', 'trabalho de presença', 'stablização emocional'],
    duracaoMinima: 25,
  },
  {
    id: 'vitalidade',
    nome: 'Vitality',
    nomePt: 'Vitalidade',
    descricao: 'Energia vital que sustenta toda forma de vida.',
    efeito: 'revitalização',
    aplicacao: ['hidratação ritual', 'banho energético', 'ablução vitalizante'],
    duracaoMinima: 15,
  },
];

const ELEMENTOS_AGUA: ElementoAgua[] = [
  {
    id: 'emocional',
    nome: 'Emotional Water',
    nomePt: 'Água Emocional',
    qualidade: 'fluidez emocional',
    emocional: ['empatia', 'compassão', 'intuição'],
    spiritual: ['ligação com o sagrado', 'sensibilidade', 'receptividade'],
    cura: ['cura emocional', 'liberação de traumas', 'abundância emocional'],
  },
  {
    id: 'purificacao',
    nome: 'Purification Water',
    nomePt: 'Água de Purificação',
    qualidade: 'dissolução de impurities',
    emocional: ['renovação', 'renascimento', 'liberdade'],
    spiritual: ['lbertação kármica', 'batismo espiritual', 'purificação áurica'],
    cura: ['desobstrução de chakras', 'remoção de energias densas', 'limpeza áurica'],
  },
  {
    id: 'sabedoria',
    nome: 'Wisdom Water',
    nomePt: 'Água da Sabedoria',
    qualidade: 'conhecimento profundo',
    emocional: ['discernimento', 'sabedoria prática', 'compreensão'],
    spiritual: ['conhecimento esotérico', 'memória cósmica', 'entendimento profundo'],
    cura: ['abertura de canal Intuitivo', 'desenvolvimento psychic', 'expansão de consciência'],
  },
  {
    id: 'amor',
    nome: 'Love Water',
    nomePt: 'Água do Amor',
    qualidade: 'amor incondicional',
    emocional: ['autoamor', 'amor-próprio', 'aceitação'],
    spiritual: ['união com o divino', 'amor universal', 'conexão coração'],
    cura: ['cura do coração', 'abertura deanjal', 'harmonização de relacionamentos'],
  },
  {
    id: 'transformacao',
    nome: 'Transformation Water',
    nomePt: 'Água de Transformação',
    qualidade: 'mutação alquímica',
    emocional: ['adaptabilidade', 'maturidade emocional', 'flexibilidade'],
    spiritual: ['metamorfose espiritual', 'transmutação', ' alquimia interior'],
    cura: ['liberação de padrões', 'transformação de sombras', 'renovação completa'],
  },
];

const AGUAS_RITUAIS: AguaRitual[] = [
  {
    id: 'ogi',
    nome: 'Ogi',
    nomePt: 'Ogò',
    tipo: 'ablução matinal',
    orixa: 'elogbara',
    elementos: ['agua-fonte', 'folhas-sagradas'],
    preparation: 'Água de fonte purified com folhas de efigbo collhidas ao amanhecer.',
    uso: ['ablução matinal', 'abertura de caminhos', 'favorecimento de oráculos'],
    protected: ['obstáculos', 'interferências', 'comunicações bloqueadas'],
    afirmacao: 'Eu abro meus caminhos com a água sagrada do Ogò. Que minha comunicação seja clara e meus obsténulos sejam removidos.',
  },
  {
    id: 'omodo',
    nome: 'Omodó',
    nomePt: 'Omodó',
    tipo: 'banho de purificação',
    orixa: 'oshun',
    elementos: ['agua-floral', 'mel', 'flores-amarelas'],
    preparation: 'Mistura de água de flor com mel e flores amarelas, consagrada sob a luz do sol.',
    uso: ['banho de amor', 'atrair prosperidade', 'trabalho emocional'],
    protected: ['solidão pública', 'inveja', 'ser abandonado'],
    afirmacao: 'Com o Omodó, eu atraio prosperidade e amor. O mel da abundância flui na minha vida.',
  },
  {
    id: 'ipade',
    nome: 'Ipade',
    nomePt: 'Ipade',
    tipo: 'oferenda-aquática',
    orixa: 'yemoja',
    elementos: ['agua-mar', 'conchas', 'perolas'],
    preparation: 'Água do mar com conchas e pérolas, ofertada em respeito aos ancestrais.',
    uso: ['oferenda aos mortos', 'comunicação ancestral', 'proteção de enfants'],
    protected: ['mortes prematuras', 'mort-nascimentos', 'abandono'],
    afirmacao: 'Honro meus ancestrais com a água do Ipade. Peço sua bênção e proteção para toda minha linhagem.',
  },
  {
    id: 'omieru',
    nome: 'Omierú',
    nomePt: 'Omierú',
    tipo: 'shower ritual',
    orixa: 'shango',
    elementos: ['agua-chuva', 'pedras-raio', 'metal'],
    preparation: 'Água de chuva coletada durante tempestade, combinanda com pedras de raio.',
    uso: ['ativação de poder', 'coragem', 'vitória em batalhas'],
    protected: ['derrotas', 'fraqueza', 'injustiça'],
    afirmacao: 'Com Omierú, invoco o poder do raio de Shangò. Que eu tenha força, coragem e justiça em meus caminhos.',
  },
  {
    id: 'oshe',
    nome: 'Oshe',
    nomePt: 'Osè',
    tipo: 'lavagem de cabeza',
    orixa: 'obatala',
    elementos: ['agua-sagrada', 'farinha-de-inhame', 'óleo-de-dendê'],
    preparation: 'Pasta de farinha de inhame com água sagrada e óleo de dendê.',
    uso: [' lavar cabeza', 'limpeza de pensamentos', 'sabedoria'],
    protected: ['confusão mental', 'mentes-alheias', 'interferências psychicas'],
    afirmacao: 'Com Osè, lavo minha cabeza em águas puras. Que meus pensamentos sejam claros como a luz de Obatalá.',
  },
  {
    id: 'arun',
    nome: 'Arùn',
    nomePt: 'Arùn',
    tipo: 'banho de sangue frio',
    orixa: 'oya',
    elementos: ['agua-floral', 'flores-vermelhas', 'velas-negras'],
    preparation: 'Água infusionada com flores vermelhas e consagrada à Yansàn.',
    uso: ['proteção contra inimigos', 'força em batalha', 'comunicação com mortos'],
    protected: ['inimizades', 'traições', 'mortais'],
    afirmacao: 'Com Arùn, invoco a força de Yansàn. Que nenhum inimigo tenha poder sobre mim, pois eu sou protegido pela tempestade.',
  },
];

const TRATAMENTOS_AGUA: TratamentoAgua[] = [
  {
    id: 'hydroterapia',
    nome: 'Hydrotherapy',
    nomePt: 'Hidroterapia Ritual',
    tipo: 'termal',
    duracao: '30-60 minutos',
    temperatura: 'variável',
    beneficios: ['relaxamento muscular', 'liberação emocional', 'ativação circulatória'],
    contraIndicacoes: ['hipertensão grave', 'cardiopatias', 'feridas abertas'],
    acompanhamento: ['sais de epsom', 'óleos essenciais', 'visualizações'],
  },
  {
    id: 'ablucao',
    nome: 'Ablution',
    nomePt: 'Ablução Ritual',
    tipo: 'purificação',
    duracao: '15-20 minutos',
    temperatura: ' ambiente a morno',
    beneficios: ['limpeza áurica', 'abertura de chakras', 'descarga energética'],
    contraIndicacoes: ['feridas emocionais abertas', 'epidemia', 'ritual não consagrado'],
    acompanhamento: ['mantras', 'orixás', 'intenções claras'],
  },
  {
    id: 'banho-floral',
    nome: 'Flower Bath',
    nomePt: 'Banho Floral',
    tipo: 'energético',
    duracao: '20-30 minutos',
    temperatura: 'morno',
    beneficios: ['harmonização emocional', 'atrair amor', 'paz interior'],
    contraIndicacoes: ['alergia a flores', 'sensibilidade aodora', 'energia muito densa'],
    acompanhamento: ['flores frescas', ' cristal', ' vela'],
  },
  {
    id: 'tratamento-termico',
    nome: 'Thermal Treatment',
    nomePt: 'Tratamento Térmico',
    tipo: 'termorregulação',
    duracao: '45-90 minutos',
    temperatura: 'quente-frio alternado',
    beneficios: ['estímulo imunológico', 'revitalização', 'desintoxicação'],
    contraIndicacoes: [' varizes', ' trombose', ' inflamações agudas'],
    acompanhamento: [' saunas', ' compressas', ' chás detox'],
  },
  {
    id: 'afusao',
    nome: 'Affusion',
    nomePt: 'Afusão',
    tipo: 'derramamento',
    duracao: '15-25 minutos',
    temperatura: 'variável conforme intenção',
    beneficios: ['desobstrução energética', 'abertura de canais', 'transmutação'],
    contraIndicacoes: ['ritual incompleto', 'falta de intenção', 'sem consagração'],
    acompanhamento: ['mantras específicos', ' invocações', 'visualizações'],
  },
];

const AFRIMACOES_AGUA: AfirmacaoAgua[] = [
  {
    id: 'afirm-pureza',
    texto: 'Eu sou puro como a água crystalline. Toda impureza dissolve-se à medida que ela flui através de mim.',
    idioma: 'pt-BR',
    contexto: 'purificação',
    tipoAguaRelacionada: 'agua-cristal',
  },
  {
    id: 'afirm-fluxo',
    texto: 'Eu permito que a vida flua através de mim como um rio Sereno, sem resistência e sem medo.',
    idioma: 'pt-BR',
    contexto: 'fluidez',
    tipoAguaRelacionada: 'agua-rio',
  },
  {
    id: 'afirm-amor',
    texto: 'Eu sou digno de amor. A água do amor lava Meus medos e Me envolve em compaixão.',
    idioma: 'pt-BR',
    contexto: 'amor',
    tipoAguaRelacionada: 'agua-rosa',
  },
  {
    id: 'afirm-transform',
    texto: 'Eu me permito transformar como a água que muda de Forma, abraçando minha evolução.',
    idioma: 'pt-BR',
    contexto: 'transformação',
    tipoAguaRelacionada: 'agua-chuva',
  },
  {
    id: 'afirm-ancestral',
    texto: 'Com a água sagrada, eu honro meus ancestrais e peço sua sabedoria e proteção.',
    idioma: 'pt-BR',
    contexto: 'ancestralidade',
    tipoAguaRelacionada: 'agua-mar',
  },
  {
    id: 'afirm-intuicao',
    texto: 'Minha intuição é clara como água de fonte. Eu confio em minha sabedoria interior.',
    idioma: 'pt-BR',
    contexto: 'intuição',
    tipoAguaRelacionada: 'agua-fonte',
  },
  {
    id: 'afirm-abundancia',
    texto: 'A abundância flui para mim como água corrente, e eu a aceito com gratidão.',
    idioma: 'pt-BR',
    contexto: 'abundância',
    tipoAguaRelacionada: 'agua-floral',
  },
  {
    id: 'afirm-protecao',
    texto: 'A água sagrada cria um escudo de luz ao meu redor, protegendo-me de toda negatividade.',
    idioma: 'pt-BR',
    contexto: 'proteção',
    tipoAguaRelacionada: 'agua-sagrada',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getTipoById(id: string): TipoAgua | undefined {
  return TIPOS_AGUA.find((t) => t.id === id);
}

function getPropriedadeById(id: string): PropriedadeAgua | undefined {
  return PROPRIEDADES_AGUA.find((p) => p.id === id);
}

function getElementoById(id: string): ElementoAgua | undefined {
  return ELEMENTOS_AGUA.find((e) => e.id === id);
}

function getRitualById(id: string): AguaRitual | undefined {
  return AGUAS_RITUAIS.find((r) => r.id === id);
}

function getTratamentoById(id: string): TratamentoAgua | undefined {
  return TRATAMENTOS_AGUA.find((t) => t.id === id);
}

function getAfirmacaoById(id: string): AfirmacaoAgua | undefined {
  return AFRIMACOES_AGUA.find((a) => a.id === id);
}

function getTiposByElemento(elemento: string): TipoAgua[] {
  return TIPOS_AGUA.filter((t) => t.elemento === elemento);
}

function getAfirmacoesByContexto(contexto: string): AfirmacaoAgua[] {
  return AFRIMACOES_AGUA.filter((a) => a.contexto === contexto);
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/aguas/data
 * Retrieve Aguas data with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const elemento = searchParams.get('elemento');
    const contexto = searchParams.get('contexto');
    const format = searchParams.get('format');

    // Single resource by ID
    if (id) {
      const resourceType = searchParams.get('resourceType');

      if (!resourceType) {
        return NextResponse.json(
          { error: 'resourceType is required when id is provided' },
          { status: 400 }
        );
      }
      let resource: unknown;
      switch (resourceType) {
        case 'tipo':
          resource = getTipoById(id);
          break;
        case 'propriedade':
          resource = getPropriedadeById(id);
          break;
        case 'elemento':
          resource = getElementoById(id);
          break;
        case 'ritual':
          resource = getRitualById(id);
          break;
        case 'tratamento':
          resource = getTratamentoById(id);
          break;
        case 'afirmacao':
          resource = getAfirmacaoById(id);
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid resourceType', validTypes: ['tipo', 'propriedade', 'elemento', 'ritual', 'tratamento', 'afirmacao'] },
            { status: 400 }
          );
      }

      if (!resource) {
        return NextResponse.json(
          { error: 'Resource not found', resourceType, id },
          { status: 404 }
        );
      }

      if (format === 'summary') {
        const summary: Record<string, unknown> = { id: (resource as { id: string }).id };
        const obj = resource as Record<string, unknown>;
        if (obj.nome !== undefined) summary.nome = obj.nome as string;
        if (obj.nomePt !== undefined) summary.nomePt = obj.nomePt as string;
        if (obj.descricao !== undefined) summary.descricao = (obj.descricao as string).substring(0, 100);
        return NextResponse.json(summary);
      }

      return NextResponse.json(resource);
    }

    // Filter by type
    if (type) {
      switch (type) {
        case 'tipos':
          return NextResponse.json({ type: 'tipos', count: TIPOS_AGUA.length, tipos: TIPOS_AGUA });
        case 'propriedades':
          return NextResponse.json({ type: 'propriedades', count: PROPRIEDADES_AGUA.length, propriedades: PROPRIEDADES_AGUA });
        case 'elementos':
          return NextResponse.json({ type: 'elementos', count: ELEMENTOS_AGUA.length, elementos: ELEMENTOS_AGUA });
        case 'rituais':
          return NextResponse.json({ type: 'rituais', count: AGUAS_RITUAIS.length, rituais: AGUAS_RITUAIS });
        case 'tratamentos':
          return NextResponse.json({ type: 'tRATAMENTOS', count: TRATAMENTOS_AGUA.length, tratamentos: TRATAMENTOS_AGUA });
        case 'afirmacoes':
          return NextResponse.json({ type: 'afirmacoes', count: AFRIMACOES_AGUA.length, afirmacoes: AFRIMACOES_AGUA });
        default:
          return NextResponse.json(
            { error: 'Invalid type', validTypes: ['tipos', 'propriedades', 'elementos', 'rituais', 'tratamentos', 'afirmacoes'] },
            { status: 400 }
          );
      }
    }

    // Filter tipos by elemento
    if (elemento) {
      const filtered = getTiposByElemento(elemento);
      if (filtered.length === 0) {
        return NextResponse.json(
          { error: 'No água types found for this elemento' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        elemento,
        tipos: filtered,
        count: filtered.length,
      });
    }

    // Filter afirmacoes by contexto
    if (contexto) {
      const filtered = getAfirmacoesByContexto(contexto);
      if (filtered.length === 0) {
        return NextResponse.json(
          { error: 'No affirmations found for this contexto' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        contexto,
        afirmacoes: filtered,
        count: filtered.length,
      });
    }

    // Return all Aguas data
    return NextResponse.json({
      version: 'v1',
      types: {
        tipos: { count: TIPOS_AGUA.length, fields: ['id', 'nome', 'nomePt', 'elemento', 'planeta', 'qualidade', 'propriedades', 'praticasRituais', 'afirmacao'] },
        propriedades: { count: PROPRIEDADES_AGUA.length, fields: ['id', 'nome', 'nomePt', 'descricao', 'efeito', 'aplicacao', 'duracaoMinima'] },
        elementos: { count: ELEMENTOS_AGUA.length, fields: ['id', 'nome', 'nomePt', 'qualidade', 'emocional', 'spiritual', 'cura'] },
        rituais: { count: AGUAS_RITUAIS.length, fields: ['id', 'nome', 'nomePt', 'tipo', 'orixa', 'elementos', 'preparation', 'uso', 'protected', 'afirmacao'] },
        tratamentos: { count: TRATAMENTOS_AGUA.length, fields: ['id', 'nome', 'nomePt', 'tipo', 'duracao', 'temperatura', 'beneficios', 'contraIndicacoes', 'acompanhamento'] },
        afirmacoes: { count: AFRIMACOES_AGUA.length, fields: ['id', 'texto', 'idioma', 'contexto', 'tipoAguaRelacionada'] },
      },
      summary: {
        tipos: TIPOS_AGUA.length,
        propriedades: PROPRIEDADES_AGUA.length,
        elementos: ELEMENTOS_AGUA.length,
        rituais: AGUAS_RITUAIS.length,
        tratamentos: TRATAMENTOS_AGUA.length,
        afirmacoes: AFRIMACOES_AGUA.length,
      },
    });
  } catch (error) {
    console.error('Aguas data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
