// ============================================================
// ASSINATURA DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for assinatura (subscription) data access
// - Retrieve user subscription status
// - Get subscription plans
// - Get subscription features
// - Get billing information
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  modules: {
    planets: boolean;
    letters: boolean;
    geometry: boolean;
    frequencies: boolean;
    business: boolean;
  };
}

interface SubscriptionFeatures {
  moduloPlanetas: boolean;
  moduloLetras: boolean;
  moduloGeometria: boolean;
  moduloFrequencias: boolean;
  moduloEmpresa: boolean;
}

interface SubscriptionStatus {
  id: string;
  plano: string;
  status: string;
  dataInicio: string;
  dataProximoCobro: string | null;
  features: SubscriptionFeatures;
}

interface SubscriptionData {
  status: SubscriptionStatus;
  plan: SubscriptionPlan | null;
  billing: {
    customerId: string | null;
    subscriptionId: string | null;
  };
}

// Available subscription plans
const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  iniciante: {
    id: 'iniciante',
    name: 'Iniciante',
    price: 0,
    features: [
      'Mapa Natal básico',
      'Numerologia pessoal',
      'Análise de Orixás',
    ],
    modules: {
      planets: false,
      letters: false,
      geometry: false,
      frequencies: false,
      business: false,
    },
  },
  basico: {
    id: 'basico',
    name: 'Básico',
    price: 29.9,
    features: [
      'Mapa Natal completo',
      'Numerologia avançada',
      'Análise de Orixás',
      'Trânsitos planetários',
      'Relatórios mensais',
    ],
    modules: {
      planets: true,
      letters: false,
      geometry: false,
      frequencies: false,
      business: false,
    },
  },
  intermediario: {
    id: 'intermediario',
    name: 'Intermediário',
    price: 49.9,
    features: [
      'Tudo do Básico',
      'Módulo de Letras',
      'Análise Geométrica Sagrada',
      'Relatórios semanais',
      'Alertas personalizados',
    ],
    modules: {
      planets: true,
      letters: true,
      geometry: true,
      frequencies: false,
      business: false,
    },
  },
  avançado: {
    id: 'avançado',
    name: 'Avançado',
    price: 79.9,
    features: [
      'Tudo do Intermediário',
      'Módulo de Frequências',
      'Análise de Empresa',
      'Rituais guiados',
      'Consultoria mensal',
    ],
    modules: {
      planets: true,
      letters: true,
      geometry: true,
      frequencies: true,
      business: true,
    },
  },
  mestres: {
    id: 'mestres',
    name: 'Mestres',
    price: 149.9,
    features: [
      'Tudo do Avançado',
      'Acesso completo a todos os módulos',
      'API de dados',
      'Suporte prioritário',
      'Workshop mensal',
      'Mentoria espiritual',
    ],
    modules: {
      planets: true,
      letters: true,
      geometry: true,
      frequencies: true,
      business: true,
    },
  },
};

// GET /api/assinatura/data - Get assinatura data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const plan = searchParams.get('plan');

    // Get subscription by user ID
    if (userId) {
      const assinatura = await prisma.assinatura.findUnique({
        where: { userId },
      });

      if (!assinatura) {
        return NextResponse.json(
          { success: false, error: 'Subscription not found for user' },
          { status: 404 }
        );
      }

      const subscriptionStatus: SubscriptionStatus = {
        id: assinatura.id,
        plano: assinatura.plano,
        status: assinatura.status,
        dataInicio: assinatura.dataInicio.toISOString(),
        dataProximoCobro: assinatura.dataProximoCobro?.toISOString() ?? null,
        features: {
          moduloPlanetas: assinatura.moduloPlanetas,
          moduloLetras: assinatura.moduloLetras,
          moduloGeometria: assinatura.moduloGeometria,
          moduloFrequencias: assinatura.moduloFrequencias,
          moduloEmpresa: assinatura.moduloEmpresa,
        },
      };

      const subscriptionPlan = SUBSCRIPTION_PLANS[assinatura.plano] ?? null;

      const data: SubscriptionData = {
        status: subscriptionStatus,
        plan: subscriptionPlan,
        billing: {
          customerId: assinatura.stripeCustomerId,
          subscriptionId: assinatura.stripeSubscriptionId,
        },
      };

      return NextResponse.json({ success: true, data });
    }

    // Return specific assinatura data by ID
    if (id) {
      // Check special IDs
      if (id === 'all' || id === 'todos') {
        return NextResponse.json({
          success: true,
          data: {
            plans: SUBSCRIPTION_PLANS,
            defaultPlan: SUBSCRIPTION_PLANS['iniciante'],
          },
        });
      }

      if (id === 'plans' || id === 'planos') {
        return NextResponse.json({ success: true, data: SUBSCRIPTION_PLANS });
      }

      if (id === 'features' || id === 'recursos') {
        const featuresList = Object.entries(SUBSCRIPTION_PLANS).map(
          ([key, value]) => ({
            plan: key,
            name: value.name,
            features: value.features,
            modules: value.modules,
          })
        );
        return NextResponse.json({ success: true, data: featuresList });
      }

      if (id === 'modules' || id === 'modulos') {
        const modulesList = Object.entries(SUBSCRIPTION_PLANS).map(
          ([key, value]) => ({
            plan: key,
            name: value.name,
            modules: value.modules,
          })
        );
        return NextResponse.json({ success: true, data: modulesList });
      }

      // Try finding subscription by ID
      const assinatura = await prisma.assinatura.findUnique({
        where: { id },
      });

      if (assinatura) {
        const subscriptionStatus: SubscriptionStatus = {
          id: assinatura.id,
          plano: assinatura.plano,
          status: assinatura.status,
          dataInicio: assinatura.dataInicio.toISOString(),
          dataProximoCobro: assinatura.dataProximoCobro?.toISOString() ?? null,
          features: {
            moduloPlanetas: assinatura.moduloPlanetas,
            moduloLetras: assinatura.moduloLetras,
            moduloGeometria: assinatura.moduloGeometria,
            moduloFrequencias: assinatura.moduloFrequencias,
            moduloEmpresa: assinatura.moduloEmpresa,
          },
        };

        const subscriptionPlan = SUBSCRIPTION_PLANS[assinatura.plano] ?? null;

        const data: SubscriptionData = {
          status: subscriptionStatus,
          plan: subscriptionPlan,
          billing: {
            customerId: assinatura.stripeCustomerId,
            subscriptionId: assinatura.stripeSubscriptionId,
          },
        };

        return NextResponse.json({ success: true, data });
      }

      // Try finding plan
      const planData = SUBSCRIPTION_PLANS[id];
      if (planData) {
        return NextResponse.json({ success: true, data: planData });
      }

      return NextResponse.json(
        { success: false, error: 'Subscription data not found' },
        { status: 404 }
      );
    }

    // Return specific type of assinatura data
    if (type) {
      if (type === 'all' || type === 'todos') {
        return NextResponse.json({
          success: true,
          data: {
            plans: SUBSCRIPTION_PLANS,
            defaultPlan: SUBSCRIPTION_PLANS['iniciante'],
          },
        });
      }

      if (type === 'plans' || type === 'planos') {
        return NextResponse.json({ success: true, data: SUBSCRIPTION_PLANS });
      }

      if (type === 'features' || type === 'recursos') {
        const featuresList = Object.entries(SUBSCRIPTION_PLANS).map(
          ([key, value]) => ({
            plan: key,
            name: value.name,
            features: value.features,
            modules: value.modules,
          })
        );
        return NextResponse.json({ success: true, data: featuresList });
      }

      if (type === 'modules' || type === 'modulos') {
        const modulesList = Object.entries(SUBSCRIPTION_PLANS).map(
          ([key, value]) => ({
            plan: key,
            name: value.name,
            modules: value.modules,
          })
        );
        return NextResponse.json({ success: true, data: modulesList });
      }

      if (type === 'billing' || type === 'faturamento') {
        const billingInfo = {
          currencies: ['BRL'],
          paymentMethods: ['credit_card', 'pix', 'boleto'],
          billingCycles: ['monthly', 'yearly'],
        };
        return NextResponse.json({ success: true, data: billingInfo });
      }
    }

    // Return subscription plan details
    if (plan) {
      const planData = SUBSCRIPTION_PLANS[plan];
      if (!planData) {
        return NextResponse.json(
          { success: false, error: 'Plan not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: planData });
    }

    // Default: return all assinatura data (plans overview)
    return NextResponse.json({
      success: true,
      data: {
        plans: SUBSCRIPTION_PLANS,
        defaultPlan: SUBSCRIPTION_PLANS['iniciante'],
      },
    });
  } catch (error) {
    console.error('Assinatura Data API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}