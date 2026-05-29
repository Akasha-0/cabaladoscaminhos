// ============================================================
// BUSCA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Busca data access
// - Search across spiritual content
// - Get search configurations
// - Retrieve search categories and filters
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface BuscaConfig {
  name: string;
  description: string;
  enabled: boolean;
  categories: string[];
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  relevance: number;
  metadata?: Record<string, unknown>;
}

interface BuscaCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

// GET /api/busca/data - Get Busca data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const query = searchParams.get('q');
    const category = searchParams.get('category');

    // Return single config by type
    if (type === 'config') {
      const config: BuscaConfig = {
        name: 'Busca',
        description: 'API de busca espiritual para conteúdo do Cabala dos Caminhos',
        enabled: true,
        categories: [
          'orixas',
          'odus',
          'rituais',
          'meditacoes',
          'afirmacoes',
          'tarot',
          'astrologia',
          'numerologia',
        ],
      };
      return NextResponse.json({ config });
    }

    // Return search categories
    if (type === 'categories') {
      const categories: BuscaCategory[] = [
        {
          id: 'orixas',
          name: 'Orixás',
          description: 'Busca por orixás, caminhos e características',
          icon: 'deus',
          count: 16,
        },
        {
          id: 'odus',
          name: 'Odús',
          description: 'Busca por odús de Ifá e suas interpretações',
          icon: 'livro',
          count: 16,
        },
        {
          id: 'rituais',
          name: 'Rituais',
          description: 'Busca por rituais, ebós e oferendas',
          icon: 'vela',
          count: 48,
        },
        {
          id: 'meditacoes',
          name: 'Meditações',
          description: 'Busca por práticas meditativas e contemplativas',
          icon: 'meditacao',
          count: 24,
        },
        {
          id: 'afirmacoes',
          name: 'Afirmações',
          description: 'Busca por afirmações e mantras espirituais',
          icon: 'palavra',
          count: 120,
        },
        {
          id: 'tarot',
          name: 'Tarô',
          description: 'Busca por cartas e interpretações de tarô',
          icon: 'cartas',
          count: 78,
        },
        {
          id: 'astrologia',
          name: 'Astrologia',
          description: 'Busca por signos, planetas e aspectos',
          icon: 'estrela',
          count: 156,
        },
        {
          id: 'numerologia',
          name: 'Numerologia',
          description: 'Busca por números e suas vibrações',
          icon: 'numero',
          count: 99,
        },
      ];
      return NextResponse.json({ categories });
    }

    // Search by category
    if (category && query) {
      const results: SearchResult[] = [];
      const lowerQuery = query.toLowerCase();

      // Simulate search results based on query
      const mockResults: SearchResult[] = [
        {
          id: `${category}-result-1`,
          type: category,
          title: `Resultado para "${query}" em ${category}`,
          relevance: 0.95,
          metadata: { category, query },
        },
        {
          id: `${category}-result-2`,
          type: category,
          title: `Resultado alternativo para "${query}"`,
          relevance: 0.78,
          metadata: { category, query },
        },
      ];

      // Filter by relevance
      const filtered = mockResults.filter((r) =>
        r.title.toLowerCase().includes(lowerQuery) || r.metadata?.query === query
      );

      return NextResponse.json({
        results: filtered.length > 0 ? filtered : mockResults,
        query,
        category,
        total: filtered.length > 0 ? filtered.length : mockResults.length,
      });
    }

    // Default — return all Busca data overview
    return NextResponse.json({
      service: 'Busca API',
      version: '1.0.0',
      description: 'API de busca espiritual para o Cabala dos Caminhos',
      capabilities: [
        {
          method: 'GET',
          endpoint: '/api/busca/data',
          description: 'Retorna visão geral da API de busca',
          params: [],
        },
        {
          method: 'GET',
          endpoint: '/api/busca/data?type=config',
          description: 'Retorna configurações da API de busca',
          params: [],
        },
        {
          method: 'GET',
          endpoint: '/api/busca/data?type=categories',
          description: 'Retorna categorias disponíveis para busca',
          params: [],
        },
        {
          method: 'GET',
          endpoint: '/api/busca/data?category={category}&q={query}',
          description: 'Executa busca em uma categoria específica',
          params: ['category', 'q'],
        },
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro ao buscar dados da API Busca' },
      { status: 500 }
    );
  }
}