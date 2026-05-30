'use client';

import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { CosmicFlowGrid } from '@/components/dashboard/CosmicFlowGrid';
import { GlowEffect } from '@/components/design-system/GlowEffect';
import { MoonTracker } from '@/components/dashboard/MoonTracker';
import { MeditationPlayer } from '@/components/dashboard/MeditationPlayer';
import { DailyProtection } from '@/components/dashboard/DailyProtection';
import { SacredCalendar } from '@/components/dashboard/SacredCalendar';
import { cn } from '@/lib/utils';
import { Star, Moon, Sun, Shield } from 'lucide-react';

// ============================================================
// DYNAMIC IMPORTS
// ============================================================

const AIOracleChat = dynamic(
  () => import('@/components/dashboard/AIOracleChat').then(m => ({ default: m.AIOracleChat })),
  { ssr: false, loading: () => <div className="h-64 rounded-2xl bg-slate-900/50 animate-pulse" /> }
);

// ============================================================
// TYPES
// ============================================================

interface QuickAccessCardProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick?: () => void;
}

interface CompactSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function QuickAccessCard({ icon, label, color }: QuickAccessCardProps) {
  return (
    <button
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl',
        'bg-slate-900/50 border border-slate-800/50',
        'hover:border-slate-700/80 hover:bg-slate-800/50',
        'transition-all duration-300 text-left group'
      )}
    >
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ 
          backgroundColor: `${color}20`, 
          border: `1px solid ${color}40`,
          boxShadow: `0 0 15px ${color}20`
        }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">{label}</p>
        <p className="text-xs text-slate-500">Acessar</p>
      </div>
    </button>
  );
}

function CompactSection({ title, icon, children, className = '' }: CompactSectionProps) {
  return (
    <section className={cn('mt-6 md:mt-8', className)}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-lg font-playfair font-semibold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ProtectionBanner() {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Proteção Espiritual Ativa</p>
          <p className="text-xs text-slate-400">Oxalá ilumina seu caminho hoje</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">Protegido</span>
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
      <DashboardHeader />
      
      {/* Welcome Banner */}
      <WelcomeCard userName={userData.nome} />

      {/* Main Content: Unified Cosmic Flow Grid */}
      <CompactSection 
        title="" 
        icon={null}
        className="mt-0"
      >
        <GlowEffect variant="aurora" intensity="low" className="rounded-2xl">
          <CosmicFlowGrid userData={userData} />
        </GlowEffect>
      </CompactSection>

      {/* Quick Access Section */}
      <CompactSection 
        title="Acesso Rápido" 
        icon={<Star className="w-5 h-5 text-amber-400" />}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAccessCard 
            icon={<Sun className="w-5 h-5 text-amber-400" />}
            label="Consultar Odu"
            color="#F59E0B"
          />
          <QuickAccessCard 
            icon={<Moon className="w-5 h-5 text-violet-400" />}
            label="Rituais Lunares"
            color="#8B5CF6"
          />
          <QuickAccessCard 
            icon={<Star className="w-5 h-5 text-emerald-400" />}
            label="Meditação"
            color="#22C55E"
          />
          <QuickAccessCard 
            icon={<Shield className="w-5 h-5 text-cyan-400" />}
            label="Proteção"
            color="#06B6D4"
          />
        </div>
      </CompactSection>

      {/* Practices Section */}
      <CompactSection 
        title="Práticas Espirituais" 
        icon={<Moon className="w-5 h-5 text-violet-400" />}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MoonTracker />
          <MeditationPlayer userData={userData} />
        </div>
      </CompactSection>

      {/* Protection & Calendar */}
      <CompactSection 
        title="Proteção e Calendário" 
        icon={<Shield className="w-5 h-5 text-emerald-400" />}
      >
        <div className="space-y-4">
          <ProtectionBanner />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SacredCalendar />
            <DailyProtection />
          </div>
        </div>
      </CompactSection>

      {/* AI Oracle */}
      <CompactSection 
        title="Oráculo IA" 
        icon={<Star className="w-5 h-5 text-amber-400" />}
      >
        <AIOracleChat userData={userData} />
      </CompactSection>
    </DashboardLayout>
  );
}