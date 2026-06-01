'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Sparkles, Star, Moon, Sun, Shield, Compass, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { CosmicFlowGrid } from '@/components/dashboard/CosmicFlowGrid';
import { GlowEffect } from '@/components/design-system/GlowEffect';
import { cn } from '@/lib/utils';

// ============================================================
// DYNAMIC IMPORTS
// ============================================================

const AIOracleChat = dynamic(
  () => import('@/components/dashboard/AIOracleChat').then(m => ({ default: m.AIOracleChat })),
  { ssr: false, loading: () => <div className="h-64 rounded-2xl bg-slate-900/50 animate-pulse" /> }
);

const MoonTracker = dynamic(
  () => import('@/components/dashboard/MoonTracker'),
  { ssr: false, loading: () => <div className="h-48 rounded-xl bg-slate-900/50 animate-pulse" /> }
);

const MeditationPlayer = dynamic(
  () => import('@/components/dashboard/MeditationPlayer'),
  { ssr: false, loading: () => <div className="h-48 rounded-xl bg-slate-900/50 animate-pulse" /> }
);

const SacredCalendar = dynamic(
  () => import('@/components/dashboard/SacredCalendar'),
  { ssr: false, loading: () => <div className="h-48 rounded-xl bg-slate-900/50 animate-pulse" /> }
);

const DailyProtection = dynamic(
  () => import('@/components/dashboard/DailyProtection'),
  { ssr: false, loading: () => <div className="h-48 rounded-xl bg-slate-900/50 animate-pulse" /> }
);

// ============================================================
// TYPES
// ============================================================

interface QuickAccessCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  href?: string;
}

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function SectionHeader({ title, icon, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-xs text-slate-500">Clique para explorar</p>
        </div>
      </div>
      {action && (
        <Link
          href={action.href}
          className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >
          <span>{action.label}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function QuickAccessCard({ icon, label, description, color, href }: QuickAccessCardProps) {
  const content = (
    <button
      className={cn(
        'flex items-center gap-4 p-4 rounded-2xl w-full',
        'bg-gradient-to-br from-slate-900/90 to-slate-950/90',
        'border border-slate-800/50',
        'hover:border-slate-700/80 hover:scale-[1.02]',
        'transition-all duration-300 text-left group'
      )}
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ 
          backgroundColor: `${color}15`, 
          border: `1px solid ${color}30`,
          boxShadow: `0 0 20px ${color}10`
        }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors truncate">
          {label}
        </p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 transition-colors" />
    </button>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}

function ProtectionBanner() {
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 border border-emerald-500/20">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <Shield className="w-7 h-7 text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold text-white">Proteção Espiritual Ativa</p>
          <p className="text-sm text-slate-400">Oxalá ilumina seu caminho hoje</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Protegido</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Dashboard() {
  const userData = {
    id: 'dashboard-user',
    nome: 'Maria',
    dataNascimento: '',
    numeroPessoal: 5,
    orixaRegente: 'Oxalá',
    odu: 'Alafia',
    arcanoPessoal: 7,
    sefirotDominante: ['Hokhmah', 'Kether'],
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <DashboardHeader />
      
      {/* Welcome Section */}
      <section className="mt-0">
        <WelcomeCard userName={userData.nome} />
      </section>

      {/* Cosmic Flow Grid */}
      <section className="mt-6">
        <SectionHeader
          title="Fluxo Cósmico"
          icon={<Sparkles className="w-5 h-5 text-amber-400" />}
          action={{ label: 'Ver mapa completo', href: '/dashboard/mapa' }}
        />
        <GlowEffect variant="aurora" intensity="low" className="rounded-2xl">
          <CosmicFlowGrid userData={userData} />
        </GlowEffect>
      </section>

      {/* Quick Access */}
      <section className="mt-8">
        <SectionHeader
          title="Acesso Rápido"
          icon={<Compass className="w-5 h-5 text-violet-400" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAccessCard 
            icon={<Sun className="w-5 h-5" />}
            label="Consultar Odu"
            description="Descubra seu destino"
            color="#F59E0B"
            href="/dashboard/oraculo"
          />
          <QuickAccessCard 
            icon={<Moon className="w-5 h-5" />}
            label="Rituais Lunares"
            description="Calendário de luas"
            color="#8B5CF6"
            href="/dashboard/rituais"
          />
          <QuickAccessCard 
            icon={<Star className="w-5 h-5" />}
            label="Meditação"
            description="Práticas de paz"
            color="#22C55E"
            href="/dashboard/meditacao"
          />
          <QuickAccessCard 
            icon={<Shield className="w-5 h-5" />}
            label="Proteção"
            description="Escudo espiritual"
            color="#06B6D4"
            href="/dashboard/protecao"
          />
        </div>
      </section>

      {/* Daily Practices */}
      <section className="mt-8">
        <SectionHeader
          title="Práticas Diárias"
          icon={<Moon className="w-5 h-5 text-violet-400" />}
          action={{ label: 'Ver todas', href: '/dashboard/praticas' }}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MoonTracker />
          <MeditationPlayer userData={userData} />
        </div>
      </section>

      {/* Protection & Calendar */}
      <section className="mt-8">
        <SectionHeader
          title="Proteção & Calendário"
          icon={<Shield className="w-5 h-5 text-emerald-400" />}
        />
        <div className="space-y-4">
          <ProtectionBanner />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SacredCalendar />
            <DailyProtection />
          </div>
        </div>
      </section>

      {/* AI Oracle */}
      <section className="mt-8 mb-6">
        <SectionHeader
          title="Oráculo IA"
          icon={<Star className="w-5 h-5 text-amber-400" />}
          action={{ label: 'Configurar', href: '/dashboard/oraculo/config' }}
        />
        <AIOracleChat userData={userData} />
      </section>
    </DashboardLayout>
  );
}
