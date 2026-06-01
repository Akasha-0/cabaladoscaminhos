'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { HarmonicProfileCard } from '@/components/dashboard/HarmonicProfileCard';
import { DailyInsight } from '@/components/dashboard/DailyInsight';
import { DailyOrientations } from '@/components/dashboard/DailyOrientations';
import { Card } from '@/components/ui/card';
import { Calendar, Map, ChevronRight, Shield } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Dados mockados do usuário - em produção viriam do contexto/banco
 * Estes dados seriam substituídos pelos dados reais do usuário logado
 */
const MOCK_USER_DATA = {
  nome: 'Maria',
  caminhoDeVida: 11,
  signo: 'Escorpião',
  signoElemento: 'Água',
  signoPlaneta: 'Plutão',
  odu: 'Alafia',
  oduNumero: 16,
};

// ============================================================
// HEADER SIMPLES
// ============================================================

function SimpleHeader({ userName }: { userName: string }) {
  const saudacoes: Record<string, string> = {
    manhã: 'Bom dia',
    tarde: 'Boa tarde',
    noite: 'Boa noite',
  };

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? saudacoes.manhã : hora < 18 ? saudacoes.tarde : saudacoes.noite;

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-white">
        {saudacao}, {userName}
      </h1>
      <p className="text-sm text-slate-500 mt-1">
        Seu mapa pessoal está pronto para consulta
      </p>
    </div>
  );
}

// ============================================================
// QUICK ACTIONS
// ============================================================

function QuickActions() {
  return (
    <div className="flex gap-3 mt-6 overflow-x-auto pb-2 -mx-1 px-1">
      <Link 
        href="/dashboard/mapa"
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl flex-shrink-0',
          'bg-slate-800/60 border border-slate-700/50',
          'hover:bg-slate-800 hover:border-slate-600',
          'transition-all duration-200'
        )}
      >
        <Map className="w-4 h-4 text-amber-400" />
        <span className="text-sm text-slate-200">Ver Mapa Completo</span>
      </Link>
      
      <Link 
        href="/dashboard/oraculo"
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl flex-shrink-0',
          'bg-slate-800/60 border border-slate-700/50',
          'hover:bg-slate-800 hover:border-slate-600',
          'transition-all duration-200'
        )}
      >
        <Calendar className="w-4 h-4 text-emerald-400" />
        <span className="text-sm text-slate-200">Consultar Odu</span>
      </Link>

      <Link 
        href="/dashboard/perfil"
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl flex-shrink-0',
          'bg-slate-800/60 border border-slate-700/50',
          'hover:bg-slate-800 hover:border-slate-600',
          'transition-all duration-200'
        )}
      >
        <Shield className="w-4 h-4 text-violet-400" />
        <span className="text-sm text-slate-200">Meu Perfil</span>
      </Link>
    </div>
  );
}

// ============================================================
// PROTECTION BANNER
// ============================================================

function ProtectionBanner() {
  return (
    <Card className="p-4 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 border-emerald-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Proteção Espiritual Ativa</p>
            <p className="text-xs text-slate-400">Oxalá ilumina seu caminho</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Ativa</span>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Dashboard() {
  const { 
    nome, 
    caminhoDeVida, 
    signo, 
    signoElemento,
    odu 
  } = MOCK_USER_DATA;

  return (
    <DashboardLayout>
      {/* Header */}
      <DashboardHeader />
      
      {/* Saudação */}
      <SimpleHeader userName={nome} />

      {/* Ações Rápidas */}
      <QuickActions />

      {/* Mapa Pessoal - 3 Pilares */}
      <section className="mt-8">
        <HarmonicProfileCard
          caminhoDeVida={caminhoDeVida}
          signo={signo}
          signoElemento={signoElemento}
          odu={odu}
        />
      </section>

      {/* Grid: Insight + Orientações */}
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insight do Dia */}
        <DailyInsight
          caminhoDeVida={caminhoDeVida}
          signoElemento={signoElemento}
          odu={odu}
        />

        {/* Orientações e Preceitos */}
        <DailyOrientations
          odu={odu}
          caminhoDeVida={caminhoDeVida}
          signo={signo}
        />
      </section>

      {/* Banner de Proteção */}
      <section className="mt-8">
        <ProtectionBanner />
      </section>

      {/* Footer minimalista */}
      <section className="mt-8 mb-6">
        <Link 
          href="/dashboard/mapa"
          className={cn(
            'flex items-center justify-between p-4 rounded-xl',
            'bg-slate-800/40 border border-slate-700/30',
            'hover:bg-slate-800/60 hover:border-slate-600/50',
            'transition-all duration-200'
          )}
        >
          <div className="flex items-center gap-3">
            <Map className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-white">Explorar Mapa Completo</p>
              <p className="text-xs text-slate-500">Todas as correlações e insights detalhados</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </Link>
      </section>
    </DashboardLayout>
  );
}
