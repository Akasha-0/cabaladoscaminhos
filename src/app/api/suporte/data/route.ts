// ============================================================
// SUPORTE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for suporte (support) data access
// - Retrieve support ticket categories
// - Get FAQ topics
// - Access knowledge base
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface SupportCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  priority: number;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  relatedTopics: string[];
}

const SUPPORT_CATEGORIES: SupportCategory[] = [
  { id: 'account', name: 'Conta e Perfil', description: 'Gerenciamento de conta, preferências e configurações', icon: 'user', priority: 1 },
  { id: 'rituals', name: 'Rituais e Práticas', description: 'Dúvidas sobre rituais,日历 e práticas espirituais', icon: 'sparkles', priority: 2 },
  { id: 'astrology', name: 'Astrologia', description: 'Mapas natais, trânsitos e previsões', icon: 'star', priority: 3 },
  { id: 'numerology', name: 'Numerologia', description: 'Cálculos e interpretações numéricas', icon: 'hash', priority: 4 },
  { id: 'tarot', name: 'Tarô e Divinação', description: 'Cartas, leituras e interpretações', icon: 'book-open', priority: 5 },
  { id: 'orixa', name: 'Orixás', description: 'Consultas sobre orixás e tradições', icon: 'sun', priority: 6 },
  { id: 'technical', name: 'Problemas Técnicos', description: 'Erros, bugs e dificuldades de uso', icon: 'bug', priority: 7 },
  { id: 'billing', name: 'Pagamentos', description: 'Assinaturas, planos e reembolsos', icon: 'credit-card', priority: 8 },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-001',
    question: 'Como fazer meu mapa natal?',
    answer: 'Acesse a seção de Astrologia no menu principal. Você precisará informar sua data de nascimento, horário exato e local de nascimento para calcular um mapa preciso.',
    category: 'astrology',
    tags: ['mapa-natal', 'astrologia', 'nascimento']
  },
  {
    id: 'faq-002',
    question: 'Como funciona o calendário de rituais?',
    answer: 'O calendário de rituais mostra os eventos espirituais baseados no calendário egípcio-astrológico. Você pode filtrar por tipo de ritual e receber notificações para eventos importantes.',
    category: 'rituals',
    tags: ['calendário', 'rituais', 'egípcio']
  },
  {
    id: 'faq-003',
    question: 'Posso consultar sobre qualquer orixá?',
    answer: 'Sim! Nossa base de conhecimento inclui informações sobre todos os orixás do panteão Yorubá. Você pode explorar artigos detalhados sobre cada orixá, seus pedidos, ebós e energias.',
    category: 'orixa',
    tags: ['orixás', 'consulta', 'tradição']
  },
  {
    id: 'faq-004',
    question: 'Como interpretar minha numerologia?',
    answer: 'Acesse a seção de Numerologia para calcular seu número de caminho, número de destino e número de alma. Cada número possui significados específicos e influências em sua jornada.',
    category: 'numerology',
    tags: ['numerologia', 'cálculo', 'interpretação']
  },
  {
    id: 'faq-005',
    question: 'O que são os Odu de Ifá?',
    answer: 'Os Odu são as 16 principais combinações do sistema de Ifá, cada um contendo 256 Meyi (combinações menores). Representam diferentes energias e orientações para decisões e consultas espirituais.',
    category: 'orixa',
    tags: ['ifá', 'odu', 'oráculos']
  },
  {
    id: 'faq-006',
    question: 'Como funciona a análise energética?',
    answer: 'A análise energética avalia seu campo sutil, chakras, aura e conexões ancestrais. Baseia-se em cálculos astrológicos e tradicionais para fornecer insights sobre sua energia atual.',
    category: 'technical',
    tags: ['energia', 'chakras', 'aura']
  },
];

const KNOWLEDGE_BASE: KnowledgeBaseArticle[] = [
  {
    id: 'kb-001',
    title: 'Introdução aos Orixás',
    content: 'Os orixás são entidades espirituais da tradição Yorubá que representam forças da natureza e princípios divinos. Cada orixá possui características, preferências e energias específicas.',
    category: 'orixa',
    relatedTopics: ['obatala', 'shango', 'yemoja', 'oxossi', 'ogun']
  },
  {
    id: 'kb-002',
    title: 'Entendendo o Mapa Natal',
    content: 'O mapa natal é um mapa celestial no momento do seu nascimento. Mostra a posição dos planetas nos signos e casas, revelando sua personalidade, desafios e potenciais.',
    category: 'astrology',
    relatedTopics: ['planetas', 'signos', 'casas', 'aspectos']
  },
  {
    id: 'kb-003',
    title: 'Cálculo do Número de Vida',
    content: 'O número de vida é calculado reduzindo sua data de nascimento a um dígito (1-9) ou número principal (11, 22, 33). Cada número carrega significados e influências específicas.',
    category: 'numerology',
    relatedTopics: ['caminho-de-vida', 'destino', 'alma']
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const category = searchParams.get('category');

    // Return support categories
    if (type === 'categories') {
      return NextResponse.json({
        success: true,
        data: SUPPORT_CATEGORIES
      });
    }

    // Return FAQ items
    if (type === 'faq') {
      let faqs = FAQ_ITEMS;
      if (category) {
        faqs = FAQ_ITEMS.filter(faq => faq.category === category);
      }
      return NextResponse.json({
        success: true,
        data: faqs
      });
    }

    // Return knowledge base
    if (type === 'knowledge') {
      let articles = KNOWLEDGE_BASE;
      if (category) {
        articles = KNOWLEDGE_BASE.filter(article => article.category === category);
      }
      return NextResponse.json({
        success: true,
        data: articles
      });
    }

    // Return single FAQ item by ID
    if (id && type === 'faq') {
      const faq = FAQ_ITEMS.find(f => f.id === id);
      if (!faq) {
        return NextResponse.json(
          { success: false, error: 'FAQ item not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: faq
      });
    }

    // Return single knowledge base article by ID
    if (id && type === 'knowledge') {
      const article = KNOWLEDGE_BASE.find(a => a.id === id);
      if (!article) {
        return NextResponse.json(
          { success: false, error: 'Article not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: article
      });
    }

    // Default — return all support data
    return NextResponse.json({
      success: true,
      data: {
        categories: SUPPORT_CATEGORIES,
        faqs: FAQ_ITEMS,
        knowledgeBase: KNOWLEDGE_BASE
      }
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch support data' },
      { status: 500 }
    );
  }
}