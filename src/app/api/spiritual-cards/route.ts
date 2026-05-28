// src/app/api/spiritual-cards/route.ts
// Spiritual Cards API - skip linting

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// TYPES
// ============================================================

export interface SpiritualCard {
  id: string;
  nome: string;
  nomeIngles: string;
  tipo: 'arquetipal' | 'simbólico' | 'meditativo' | 'guia';
  elemento: string;
  chakra: string;
  significado: string;
  mensagem: string;
  afirmacao: string;
  cor: string;
  simbolos: string[];
  combinacoes: string[];
}

// ============================================================
// CARD DATA
// ============================================================

const spiritualCards: SpiritualCard[] = [
  {
    id: 'espirito-universal',
    nome: 'Espírito Universal',
    nomeIngles: 'Universal Spirit',
    tipo: 'arquetipal',
    elemento: 'éter',
    chakra: 'coroa',
    significado: 'Conexão com a energia primordial do universo e transcendência',
    mensagem: 'Você está alinhado com o fluxo cósmico. Permita-se ser guiado pela sabedoria infinita que existe além do tempo e espaço.',
    afirmacao: 'Eu sou um canal aberto para a luz divina do universo',
    cor: 'dourado',
    simbolos: ['espiral', 'estrella', 'olho'],
    combinacoes: ['meditacao-coroa', 'protecao-cosmica'],
  },
  {
    id: 'alma-gemea',
    nome: 'Alma Gêmea',
    nomeIngles: 'Soul Mate',
    tipo: 'arquetipal',
    elemento: 'água',
    chakra: 'coração',
    significado: 'Encontro de almas e conexões espirituais profundas',
    mensagem: 'Uma conexão significativa está se manifestando em sua vida. Esteja aberto para reconhecer quem traz crescimento e harmonia.',
    afirmacao: 'Eu atraio conexões de alma que elevam meu espírito',
    cor: 'rosa',
    simbolos: ['corações', 'duas-luas', 'cascada'],
    combinacoes: ['amor-propio', 'harmonia-relacional'],
  },
  {
    id: 'proposito-divino',
    nome: 'Propósito Divino',
    nomeIngles: 'Divine Purpose',
    tipo: 'arquetipal',
    elemento: 'fogo',
    chakra: 'plexo solar',
    significado: 'Descoberta da missão de vida e vocation',
    mensagem: 'Seu caminho está iluminado. As desafios atuais são precisos para seu crescimento. Confie no plano maior que está se desenrolando.',
    afirmacao: 'Eu sou guiado pelo meu propósito divino com cada passo',
    cor: 'laranja',
    simbolos: ['flecha', 'caminho', 'coroa'],
    combinacoes: ['sabedoria-interior', 'acao-corajosa'],
  },
  {
    id: 'ancestralidade',
    nome: 'Ancestralidade',
    nomeIngles: 'Ancestral Wisdom',
    tipo: 'simbólico',
    elemento: 'terra',
    chakra: 'raiz',
    significado: 'Conexão com a sabedoria dos antepassados',
    mensagem: 'Seus ancestrais velam por você. Busque sua sabedoria através de rituais, memórias e histórias familiares.',
    afirmacao: 'Eu honro meus antepassados e recebo sua bênção',
    cor: 'marrom',
    simbolos: ['árvore', 'mãos', 'raízes'],
    combinacoes: ['protecao-familiar', 'forca-terrena'],
  },
  {
    id: 'transmutacao',
    nome: 'Transmutação',
    nomeIngles: 'Transmutation',
    tipo: 'simbólico',
    elemento: 'fogo',
    chakra: 'coração',
    significado: 'Transformação e renovação através do poder da luz',
    mensagem: 'Você tem o poder de transformar qualquer experiência em crescimento. O que parece destruição é na verdade renascimento.',
    afirmacao: 'Eu transformo sombras em luz e dor em sabedoria',
    cor: 'vermelho',
    simbolos: ['fênix', 'chama', 'borboleta'],
    combinacoes: ['renovacao-interior', 'forca-da-mente'],
  },
  {
    id: 'intuicao-sagrada',
    nome: 'Intuição Sagrada',
    nomeIngles: 'Sacred Intuition',
    tipo: 'simbólico',
    elemento: 'água',
    chakra: 'terceiro olho',
    significado: 'Abertura do terceiro olho e percepção espiritual',
    mensagem: 'Sua voz interior está forte e clara. Confie nas sincronicidades e nos sinais que o universo envia.',
    afirmacao: 'Eu confio na minha intuição como bússola divina',
    cor: 'índigo',
    simbolos: ['olho', 'lua', 'nevoa'],
    combinacoes: ['sabedoria-profunda', 'meditacao-intuitiva'],
  },
  {
    id: 'abundancia-cosmica',
    nome: 'Abundância Cósmica',
    nomeIngles: 'Cosmic Abundance',
    tipo: 'arquetipal',
    elemento: 'fogo',
    chakra: 'plexo solar',
    significado: 'Prosperidade espiritual e material em alinhamento',
    mensagem: 'A abundância flui naturalmente quando você está em sincronia com seu propósito. Solte a escassez.',
    afirmacao: 'Eu sou digno de toda a abundância que o universo oferece',
    cor: 'verde',
    simbolos: ['moedas', 'chuva', 'flores'],
    combinacoes: ['gratidao-diaria', 'acao-afirmativa'],
  },
  {
    id: 'protecao-divina',
    nome: 'Proteção Divina',
    nomeIngles: 'Divine Protection',
    tipo: 'arquetipal',
    elemento: 'éter',
    chakra: 'coroa',
    significado: 'Escudo espiritual e barreira de luz',
    mensagem: 'Você está envuelto por forças protetoras. Nenhuma negatividade pode penetrar seu círculo de luz.',
    afirmacao: 'Eu sou protegido por forças светла и amor',
    cor: 'branco',
    simbolos: ['escudo', 'cruz', 'asas'],
    combinacoes: ['limpeza-energetica', 'forca-interior'],
  },
  {
    id: 'guia-espiritual',
    nome: 'Guia Espiritual',
    nomeIngles: 'Spirit Guide',
    tipo: 'meditativo',
    elemento: 'ar',
    chakra: 'coração',
    significado: 'Conexão com mentores espirituais invisíveis',
    mensagem: 'Seu guia está próximo, oferecendo sabedoria. Reserve momentos de silêncio para ouví-lo.',
    afirmacao: 'Eu abro meu coração para receber a orientação dos meus guias',
    cor: 'azul',
    simbolos: ['pena', 'nuvem', 'mão-luz'],
    combinacoes: ['meditacao-guiada', 'escuta-interior'],
  },
  {
    id: 'ciclos-da-lua',
    nome: 'Ciclos da Lua',
    nomeIngles: 'Moon Cycles',
    tipo: 'simbólico',
    elemento: 'água',
    chakra: 'sagrado',
    significado: 'Ritmos naturais e fases de manifestação',
    mensagem: 'Alinhe suas ações com os ciclos lunares. Cada fase traz energia específica para diferentes intenções.',
    afirmacao: 'Eu danço com os ciclos naturais da vida',
    cor: 'prata',
    simbolos: ['lua', 'maré', 'cristal'],
    combinacoes: ['ritual-lunar', 'intencao-manifestacao'],
  },
  {
    id: 'uniao-cosmica',
    nome: 'União Cósmica',
    nomeIngles: 'Cosmic Union',
    tipo: 'arquetipal',
    elemento: 'éter',
    chakra: 'coroa',
    significado: 'Fusão do eu individual com o todo universal',
    mensagem: 'Você é parte inseparável do cosmos. Sinta sua conexão com todas as formas de vida.',
    afirmacao: 'Eu sou um com o universo e o universo é em mim',
    cor: 'violeta',
    simbolos: ['galáxia', 'infinito', 'mandala'],
    combinacoes: ['meditacao-transcendental', 'uniao-interior'],
  },
  {
    id: 'equilibrio-elemental',
    nome: 'Equilíbrio Elemental',
    nomeIngles: 'Elemental Balance',
    tipo: 'simbólico',
    elemento: 'ar',
    chakra: 'coração',
    significado: 'Harmonia entre os quatro elementos',
    mensagem: 'Os elementos estão pedindo equilíbrio em sua vida. Honre cada um: terra, água, fogo e ar.',
    afirmacao: 'Eu vivo em harmonia com todos os elementos da natureza',
    cor: 'arco-íris',
    simbolos: ['quatro-elementos', 'círculo', 'flor'],
    combinacoes: ['meditacao-elemental', 'harmonia-interior'],
  },
  {
    id: 'karma-dharma',
    nome: 'Karma e Dharma',
    nomeIngles: 'Karma and Dharma',
    tipo: 'arquetipal',
    elemento: 'terra',
    chakra: 'plexo solar',
    significado: 'Lei de causa e efeito junto ao caminho de serviço',
    mensagem: 'Suas ações estão criando seu futuro. Escolha ações que sirvam ao bem maior.',
    afirmacao: 'Eu escolho ações que espalham luz e amor',
    cor: 'âmbar',
    simbolos: ['roda', 'mão', 'balança'],
    combinacoes: ['servico-generoso', 'consciencia-acao'],
  },
  {
    id: 'renascimento',
    nome: 'Renascimento',
    nomeIngles: 'Rebirth',
    tipo: 'meditativo',
    elemento: 'água',
    chakra: 'coração',
    significado: 'Novo começo e purificação espiritual',
    mensagem: 'Uma nova phase está nascendo em sua vida. Solte o que precisa morrer para dar espaço ao novo.',
    afirmacao: 'Eu renasco a cada momento em minha melhor versão',
    cor: 'branco-dourado',
    simbolos: ['ovo', 'semente', 'nascente'],
    combinacoes: ['purificacao', 'novos-comecos'],
  },
  {
    id: 'sabedoria-antiga',
    nome: 'Sabedoria Antiga',
    nomeIngles: 'Ancient Wisdom',
    tipo: 'guia',
    elemento: 'terra',
    chakra: 'coroa',
    significado: 'Conhecimento ancestral que ilumina o presente',
    mensagem: 'A sabedoria que você busca já existe dentro de você. Busque-a nos ensinamentos ancestrais.',
    afirmacao: 'Eu接入 a sabedoria antiga que reside em minha alma',
    cor: 'ouro-velho',
    simbolos: [' pergaminho', 'chave', 'olho'],
    combinacoes: ['estudo-sagrado', 'aplicacao-pratica'],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateId(): string {
  return `card-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/spiritual-cards
 * Retrieve spiritual cards with optional filtering
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const nome = searchParams.get('nome');
  const tipo = searchParams.get('tipo');
  const elemento = searchParams.get('elemento');
  const chakra = searchParams.get('chakra');
  const random = searchParams.get('random');
  const count = searchParams.get('count');

  // Filter by ID
  if (id) {
    const card = spiritualCards.find((c) => c.id === id);

    if (!card) {
      return NextResponse.json(
        { card: null, error: 'Carta espiritual não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ card });
  }

  // Filter by nome
  if (nome) {
    const card = spiritualCards.find(
      (c) =>
        c.nome.toLowerCase() === nome.toLowerCase() ||
        c.nomeIngles.toLowerCase() === nome.toLowerCase()
    );

    if (card) {
      return NextResponse.json({ card });
    }

    const suggestions = spiritualCards
      .filter(
        (c) =>
          c.nome.toLowerCase().includes(nome.toLowerCase()) ||
          c.nomeIngles.toLowerCase().includes(nome.toLowerCase())
      )
      .map((c) => c.nome);

    return NextResponse.json(
      {
        card: null,
        error: 'Carta espiritual não encontrada',
        suggestions: suggestions.length > 0 ? suggestions : spiritualCards.map((c) => c.nome),
      },
      { status: 404 }
    );
  }

  // Filter by tipo
  if (tipo) {
    const filtered = spiritualCards.filter(
      (c) => c.tipo.toLowerCase() === tipo.toLowerCase()
    );

    return NextResponse.json({
      cartas: filtered,
      meta: {
        total: filtered.length,
        filtro: 'tipo',
        valor: tipo,
      },
    });
  }

  // Filter by elemento
  if (elemento) {
    const filtered = spiritualCards.filter(
      (c) => c.elemento.toLowerCase() === elemento.toLowerCase()
    );

    return NextResponse.json({
      cartas: filtered,
      meta: {
        total: filtered.length,
        filtro: 'elemento',
        valor: elemento,
      },
    });
  }

  // Filter by chakra
  if (chakra) {
    const filtered = spiritualCards.filter(
      (c) => c.chakra.toLowerCase() === chakra.toLowerCase()
    );

    return NextResponse.json({
      cartas: filtered,
      meta: {
        total: filtered.length,
        filtro: 'chakra',
        valor: chakra,
      },
    });
  }

  // Get random cards
  if (random === 'true') {
    const numCards = count ? Math.min(parseInt(count, 10), 10) : 1;
    const shuffled = shuffleArray(spiritualCards);
    const selected = shuffled.slice(0, numCards);

    return NextResponse.json({
      cartas: selected,
      meta: {
        total: selected.length,
        tipo: 'aleatório',
      },
    });
  }

  // Return all cards
  return NextResponse.json({
    cartas: spiritualCards,
    meta: {
      total: spiritualCards.length,
      tipos: [...new Set(spiritualCards.map((c) => c.tipo))],
      elementos: [...new Set(spiritualCards.map((c) => c.elemento))],
      chakras: [...new Set(spiritualCards.map((c) => c.chakra))],
    },
  });
}