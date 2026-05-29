// ============================================================
// DASHBOARD DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for dashboard data retrieval
// - User profile summary
// - Mapa natal summary
// - Subscription and credits info
// - Recent readings and activities
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface DashboardUserSummary {
  id: string;
  nomeCompleto: string;
  email: string;
  dataNascimento: string;
  signoSolar: string | null;
  numeroCabalistico: number | null;
}

interface DashboardCredits {
  saldo: number;
  transacoesRecentes: Array<{
    id: string;
    tipo: 'CREDITO' | 'DEBITO';
    quantidade: number;
    descricao: string | null;
    createdAt: string;
  }>;
}

interface DashboardSubscription {
  plano: string;
  status: string;
  moduloPlanetas: boolean;
  moduloLetras: boolean;
  moduloGeometria: boolean;
  moduloFrequencias: boolean;
  moduloEmpresa: boolean;
  dataProximoCobro: string | null;
}

interface DashboardMapaNatal {
  signoSolar: string | null;
  signoLunar: string | null;
  ascendente: string | null;
  numeroCabalistico: number | null;
  numeroTantrico: number | null;
  numeroPitagorico: number | null;
  oduPrincipal: string | null;
  arcanoPessoal: number | null;
  cartaCaminho: string | null;
  sefirotDominante: string | null;
}

interface DashboardData {
  user: DashboardUserSummary;
  credits: DashboardCredits;
  subscription: DashboardSubscription;
  mapaNatal: DashboardMapaNatal | null;
  ultimaLeitura: string | null;
}

function getUserSummary(): DashboardUserSummary {
  return {
    id: 'demo-user-001',
    nomeCompleto: 'Usuário Demo',
    email: 'demo@example.com',
    dataNascimento: '1990-01-15',
    signoSolar: 'Capricórnio',
    numeroCabalistico: 7,
  };
}

function getCredits(): DashboardCredits {
  return {
    saldo: 850,
    transacoesRecentes: [
      { id: 'tx-001', tipo: 'CREDITO', quantidade: 100, descricao: 'Compra de créditos', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'tx-002', tipo: 'DEBITO', quantidade: 50, descricao: 'Leitura de tarot', createdAt: new Date(Date.now() - 172800000).toISOString() },
      { id: 'tx-003', tipo: 'DEBITO', quantidade: 25, descricao: 'Análise Mapa Natal', createdAt: new Date(Date.now() - 259200000).toISOString() },
    ],
  };
}

function getSubscription(): DashboardSubscription {
  return {
    plano: 'iniciante',
    status: 'active',
    moduloPlanetas: false,
    moduloLetras: false,
    moduloGeometria: false,
    moduloFrequencias: false,
    moduloEmpresa: false,
    dataProximoCobro: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

function getMapaNatal(): DashboardMapaNatal | null {
  return {
    signoSolar: 'Capricórnio',
    signoLunar: 'Câncer',
    ascendente: 'Leão',
    numeroCabalistico: 7,
    numeroTantrico: 14,
    numeroPitagorico: 3,
    oduPrincipal: 'Ogundá',
    arcanoPessoal: 12,
    cartaCaminho: 'O Louco',
    sefirotDominante: 'Chokmah',
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dataType = searchParams.get('type');

  try {
    let data: DashboardData;

    switch (dataType) {
      case 'user':
        return NextResponse.json({
          success: true,
          data: getUserSummary(),
        }, { status: 200 });

      case 'credits':
        return NextResponse.json({
          success: true,
          data: getCredits(),
        }, { status: 200 });

      case 'subscription':
        return NextResponse.json({
          success: true,
          data: getSubscription(),
        }, { status: 200 });

      case 'mapa-natal':
        return NextResponse.json({
          success: true,
          data: getMapaNatal(),
        }, { status: 200 });

      case null:
        data = {
          user: getUserSummary(),
          credits: getCredits(),
          subscription: getSubscription(),
          mapaNatal: getMapaNatal(),
          ultimaLeitura: new Date(Date.now() - 86400000).toISOString(),
        };
        return NextResponse.json({
          success: true,
          data,
          timestamp: new Date().toISOString(),
        }, { status: 200 });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid data type specified',
        }, { status: 400 });
    }
  } catch (_error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data',
    }, { status: 500 });
  }
}