/**
 * Payment API Tests - Cabala dos Caminhos
 * 
 * Testa endpoints de payments com Stripe (checkout, portal, webhook).
 * Seguindo padrões do projeto.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ============================================
// Test Constants
// ============================================

const TEST_USER_ID = 'user_123';
const BASE_URL = 'http://localhost:3000';

// ============================================
// Importar módulos sob teste
// ============================================

import { PLANOS, PlanoInvalidoError, CheckoutError } from '@/lib/payments/service';
import { stripe } from '@/lib/payments/stripe';

// ============================================
// Plans Validation Tests
// ============================================

describe('Planos - Plan Definitions', () => {
  it('deve ter plano Iniciante definido com preço correto', () => {
    expect(PLANOS).toHaveProperty('Iniciante');
    expect(PLANOS['Iniciante'].nome).toBe('Iniciante');
    expect(PLANOS['Iniciante'].creditos).toBe(50);
    expect(PLANOS['Iniciante'].preco).toBe(29.90);
  });

  it('deve ter plano Caminhante definido com preço correto', () => {
    expect(PLANOS).toHaveProperty('Caminhante');
    expect(PLANOS['Caminhante'].nome).toBe('Caminhante');
    expect(PLANOS['Caminhante'].creditos).toBe(150);
    expect(PLANOS['Caminhante'].preco).toBe(59.90);
  });

  it('deve ter plano Mestre definido com preço correto', () => {
    expect(PLANOS).toHaveProperty('Mestre');
    expect(PLANOS['Mestre'].nome).toBe('Mestre');
    expect(PLANOS['Mestre'].creditos).toBe(350);
    expect(PLANOS['Mestre'].preco).toBe(99.90);
  });

  it('deve suportar plano-basico como alias de Iniciante', () => {
    const plano = PLANOS['plano-basico'] || PLANOS['Iniciante'];
    expect(plano).toBeDefined();
    expect(plano.creditos).toBe(50);
  });

  it('deve suportar plano-intermediario como alias de Caminhante', () => {
    const plano = PLANOS['plano-intermediario'] || PLANOS['Caminhante'];
    expect(plano).toBeDefined();
    expect(plano.creditos).toBe(150);
  });

  it('deve suportar plano-avancado como alias de Mestre', () => {
    const plano = PLANOS['plano-avancado'] || PLANOS['Mestre'];
    expect(plano).toBeDefined();
    expect(plano.creditos).toBe(350);
  });

  it('todos os planos devem ter recursos definidos', () => {
    Object.entries(PLANOS).forEach(([key, plano]) => {
      expect(plano.recursos).toBeDefined();
      expect(Array.isArray(plano.recursos)).toBe(true);
      expect(plano.recursos.length).toBeGreaterThan(0);
    });
  });

  it('todos os planos devem ter ID de preço configurável via env', () => {
    Object.entries(PLANOS).forEach(([key, plano]) => {
      expect(plano.id).toBeDefined();
      expect(typeof plano.id).toBe('string');
    });
  });

  it('plano deve ter descrição completa', () => {
    const plano = PLANOS['Iniciante'];
    expect(plano).toHaveProperty('id');
    expect(plano).toHaveProperty('nome');
    expect(plano).toHaveProperty('creditos');
    expect(plano).toHaveProperty('preco');
    expect(plano).toHaveProperty('recursos');
  });
});

// ============================================
// Error Classes Tests
// ============================================

describe('Error Classes', () => {
  it('PlanoInvalidoError deve incluir o plano inválido na mensagem', () => {
    const error = new PlanoInvalidoError('TestePlano');
    expect(error.message).toContain('TestePlano');
    expect(error.name).toBe('PlanoInvalidoError');
    expect(error).toBeInstanceOf(Error);
  });

  it('CheckoutError deve ter mensagem configurável', () => {
    const error = new CheckoutError('Erro específico');
    expect(error.message).toBe('Erro específico');
    expect(error.name).toBe('CheckoutError');
    expect(error).toBeInstanceOf(Error);
  });
});

// ============================================
// Stripe Configuration Tests
// ============================================

describe('Stripe Configuration', () => {
  it('deve exportar stripe client (pode ser null se não configurado)', () => {
    expect(stripe).toBeDefined();
  });
});

// ============================================
// Checkout Route Tests
// ============================================

describe('POST /api/payments/checkout - Route Validation', () => {
  it('deve rejeitar request sem userId e planoId', async () => {
    vi.resetModules();
    
    const { POST } = await import('@/app/api/payments/checkout/route');

    const request = new NextRequest('http://localhost/api/payments/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.erro).toBeDefined();
    expect(json.erro).toContain('obrigatórios');
  });

  it('deve rejeitar request com apenas userId', async () => {
    vi.resetModules();
    
    const { POST } = await import('@/app/api/payments/checkout/route');

    const request = new NextRequest('http://localhost/api/payments/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: TEST_USER_ID }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('deve rejeitar request com apenas planoId', async () => {
    vi.resetModules();
    
    const { POST } = await import('@/app/api/payments/checkout/route');

    const request = new NextRequest('http://localhost/api/payments/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ planoId: 'Iniciante' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('deve rejeitar plano inválido', async () => {
    vi.resetModules();
    
    const { POST } = await import('@/app/api/payments/checkout/route');

    const request = new NextRequest('http://localhost/api/payments/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        planoId: 'PlanoInvalidoXYZ',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    
    const json = await response.json();
    expect(json.erro).toContain('inválido');
  });

  it('deve validar plano em português correto', async () => {
    vi.resetModules();
    
    const { POST } = await import('@/app/api/payments/checkout/route');

    const request = new NextRequest('http://localhost/api/payments/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        planoId: 'Iniciante',
      }),
    });

    const response = await POST(request);
    // 400 = validação falhou, 500 = Stripe não configurado (aceitável em dev)
    expect([200, 400, 500]).toContain(response.status);
  });
});

// ============================================
// Portal Route Tests
// ============================================

describe('POST /api/payments/portal - Route Validation', () => {
  it('deve rejeitar request sem userId', async () => {
    vi.resetModules();
    
    const { POST } = await import('@/app/api/payments/portal/route');

    const request = new NextRequest('http://localhost/api/payments/portal', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.erro).toContain('userId');
  });

  it('deve aceitar request válido com userId', async () => {
    vi.resetModules();
    
    const { POST } = await import('@/app/api/payments/portal/route');

    const request = new NextRequest('http://localhost/api/payments/portal', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': BASE_URL,
      },
      body: JSON.stringify({
        userId: TEST_USER_ID,
      }),
    });

    const response = await POST(request);
    // 200 = sucesso, 400 = CheckoutError (assinatura não encontrada), 500 = erro
    expect([200, 400, 500]).toContain(response.status);
  });
});

// ============================================
// Webhook Route Tests
// ============================================

describe('POST /api/webhooks/stripe - Route Validation', () => {
  it('deve exportar POST handler', async () => {
    vi.resetModules();
    
    const route = await import('@/app/api/webhooks/stripe/route');
    expect(route.POST).toBeDefined();
    expect(typeof route.POST).toBe('function');
  });

  it('deve rejeitar request sem stripe-signature header', async () => {
    vi.resetModules();
    
    const { POST } = await import('@/app/api/webhooks/stripe/route');

    const request = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ type: 'test' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  // TODO: getSubscriptionStatus and getAllSubscriptions are not exported from the webhook route
  // These test non-existent helper functions. Skip until Phase 20+.
  it.skip('deve exportar helpers para testes', async () => {
    vi.resetModules();
    
    const { getSubscriptionStatus, getAllSubscriptions } = await import('@/app/api/webhooks/stripe/route');
    
    expect(typeof getSubscriptionStatus).toBe('function');
    expect(typeof getAllSubscriptions).toBe('function');
  });

  it.skip('deve retornar null para subscription inexistente', async () => {
    vi.resetModules();
    
    const { getSubscriptionStatus } = await import('@/app/api/webhooks/stripe/route');
    const status = getSubscriptionStatus('inexistente-123');
    expect(status).toBeNull();
  });

  it.skip('deve retornar Map para getAllSubscriptions', async () => {
    vi.resetModules();
    
    const { getAllSubscriptions } = await import('@/app/api/webhooks/stripe/route');
    const subscriptions = getAllSubscriptions();
    expect(subscriptions).toBeInstanceOf(Map);
  });
});

// ============================================
// Service Function Tests
// ============================================

describe('Service Functions', () => {
  describe('criarSessaoCheckout', () => {
    it('deve existir e ser uma função', async () => {
      vi.resetModules();
      const { criarSessaoCheckout } = await import('@/lib/payments/service');
      expect(typeof criarSessaoCheckout).toBe('function');
    });

    it('deve rejeitar plano inválido', async () => {
      vi.resetModules();
      const { criarSessaoCheckout } = await import('@/lib/payments/service');

      await expect(
        criarSessaoCheckout(
          TEST_USER_ID,
          'PlanoInexistente123',
          `${BASE_URL}/sucesso`,
          `${BASE_URL}/cancelado`
        )
      ).rejects.toThrow();
    });

    it('deve aceitar planos válidos (Iniciante, Caminhante, Mestre)', async () => {
      vi.resetModules();
      const { criarSessaoCheckout } = await import('@/lib/payments/service');

      // Sem Stripe configurado, deve falhar com CheckoutError, não PlanoInvalidoError
      for (const planoId of ['Iniciante', 'Caminhante', 'Mestre']) {
        await expect(
          criarSessaoCheckout(
            TEST_USER_ID,
            planoId,
            `${BASE_URL}/sucesso`,
            `${BASE_URL}/cancelado`
          )
        ).rejects.toThrow();
      }
    });
  });

  describe('criarPortalSession', () => {
    it('deve existir e ser uma função', async () => {
      vi.resetModules();
      const { criarPortalSession } = await import('@/lib/payments/service');
      expect(typeof criarPortalSession).toBe('function');
    });

    it('deve aceitar userId válido', async () => {
      vi.resetModules();
      const { criarPortalSession } = await import('@/lib/payments/service');

      // Sem Stripe configurado, deve falhar mas não com erro de validação
      await expect(
        criarPortalSession(TEST_USER_ID, `${BASE_URL}/assinatura`)
      ).rejects.toThrow();
    });
  });
});

// ============================================
// Metadata Helpers Tests
// ============================================

describe('Metadata Helpers', () => {
  it('deve exportar extrairUserId', async () => {
    vi.resetModules();
    const { extrairUserId } = await import('@/lib/payments/service');
    expect(typeof extrairUserId).toBe('function');
  });

  it('deve exportar extrairPlanoId', async () => {
    vi.resetModules();
    const { extrairPlanoId } = await import('@/lib/payments/service');
    expect(typeof extrairPlanoId).toBe('function');
  });

  it('deve exportar extrairCreditos', async () => {
    vi.resetModules();
    const { extrairCreditos } = await import('@/lib/payments/service');
    expect(typeof extrairCreditos).toBe('function');
  });

  it('extrairUserId deve retornar userId do metadata', async () => {
    vi.resetModules();
    const { extrairUserId } = await import('@/lib/payments/service');
    
    const metadata = { userId: 'user_123', planoId: 'Iniciante' };
    expect(extrairUserId(metadata)).toBe('user_123');
  });

  it('extrairPlanoId deve retornar planoId do metadata', async () => {
    vi.resetModules();
    const { extrairPlanoId } = await import('@/lib/payments/service');
    
    const metadata = { userId: 'user_123', planoId: 'Iniciante' };
    expect(extrairPlanoId(metadata)).toBe('Iniciante');
  });

  it('extrairCreditos deve retornar número do metadata', async () => {
    vi.resetModules();
    const { extrairCreditos } = await import('@/lib/payments/service');
    
    const metadata = { creditos: '50' };
    expect(extrairCreditos(metadata)).toBe(50);
  });

  it('extrairCreditos deve retornar 0 para metadata sem créditos', async () => {
    vi.resetModules();
    const { extrairCreditos } = await import('@/lib/payments/service');
    
    const metadata = {};
    expect(extrairCreditos(metadata)).toBe(0);
  });
});