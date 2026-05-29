// ============================================================
// INTEGRACAO DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for integracao data access
// - Retrieve integration settings
// - Get available integrations
// - Access integration status and configurations
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ─── INTEGRACAO TYPES ────────────────────────────────────────────────────────

interface IntegracaoProvider {
  id: string;
  nome: string;
  tipo: 'pagamento' | 'comunicacao' | 'armazenamento' | 'analitico';
  status: 'active' | 'inactive' | 'pending';
  endpoints: {
    autenticacao: string;
    callback?: string;
  };
  configuracoes: Record<string, string>;
}

interface IntegracaoConfig {
  id: string;
  providerId: string;
  apiKey?: string;
  webhookSecret?: string;
  ambiente: 'producao' | 'homologacao' | 'desenvolvimento';
  permicoes: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── INTEGRACAO PROVIDERS DATA ───────────────────────────────────────────────

const INTEGRACAO_PROVIDERS: IntegracaoProvider[] = [
  {
    id: 'stripe',
    nome: 'Stripe',
    tipo: 'pagamento',
    status: 'active',
    endpoints: {
      autenticacao: 'https://api.stripe.com/v1',
      callback: '/api/integracao/callbacks/stripe',
    },
    configuracoes: {
      versao: '2024-06-20',
      moeda: 'BRL',
    },
  },
  {
    id: 'sendgrid',
    nome: 'SendGrid',
    tipo: 'comunicacao',
    status: 'active',
    endpoints: {
      autenticacao: 'https://api.sendgrid.com/v3',
      callback: '/api/integracao/callbacks/sendgrid',
    },
    configuracoes: {
     Templates: 'true',
      webhooks: 'true',
    },
  },
  {
    id: 'supabase',
    nome: 'Supabase',
    tipo: 'armazenamento',
    status: 'active',
    endpoints: {
      autenticacao: 'https://supabase.com/docs',
      callback: '/api/integracao/callbacks/supabase',
    },
    configuracoes: {
      realtime: 'true',
      storage: 'true',
    },
  },
  {
    id: 'analytics',
    nome: 'Analytics',
    tipo: 'analitico',
    status: 'active',
    endpoints: {
      autenticacao: '/api/integracao/analytics',
    },
    configuracoes: {
      eventos: 'all',
      agregacao: 'daily',
    },
  },
];

// ─── GET HANDLER ─────────────────────────────────────────────────────────────

// GET /api/integracao/data - Get integracao data
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipo = searchParams.get('tipo');
  const providerId = searchParams.get('provider');
  const incluirConfig = searchParams.get('config') === 'true';

  try {
    // Filter by provider
    if (providerId) {
      const provider = INTEGRACAO_PROVIDERS.find(p => p.id === providerId);
      if (!provider) {
        return NextResponse.json(
          { error: 'Provider not found', providerId },
          { status: 404 }
        );
      }
      return NextResponse.json({
        provider,
        config: incluirConfig ? null : undefined,
      });
    }

    // Filter by tipo
    let providers = INTEGRACAO_PROVIDERS;
    if (tipo) {
      providers = providers.filter(p => p.tipo === tipo);
    }

    // Get configs if requested
    let configs: IntegracaoConfig[] | undefined;
    if (incluirConfig) {
      configs = providers.map(p => ({
        id: `config-${p.id}`,
        providerId: p.id,
        ambiente: 'producao' as const,
        permicoes: ['read', 'write'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    return NextResponse.json({
      providers,
      total: providers.length,
      configs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Integracao API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}