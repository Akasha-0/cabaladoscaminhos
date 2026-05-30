'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { RealtimeEnergyWidget } from '@/components/dashboard/RealtimeEnergyWidget';
import { DayEnergyWidget } from '@/components/dashboard/DayEnergyWidget';
import { NumerologyWidget } from '@/components/dashboard/NumerologyWidget';
import { AstrologyWidget } from '@/components/dashboard/AstrologyWidget';
import { LunarPhaseWidget } from '@/components/dashboard/LunarPhaseWidget';
import { OduDivinationWidget } from '@/components/dashboard/OduDivinationWidget';
import { ChakraBalanceWidget } from '@/components/dashboard/ChakraBalanceWidget';
import { QuickDivination } from '@/components/dashboard/QuickDivination';
import { DailyWisdomCard } from '@/components/dashboard/DailyWisdomCard';

// Dynamic imports for heavy components
const AffirmationWidget = dynamic(
  () => import('@/components/dashboard/AffirmationWidget').then(m => ({ default: m.AffirmationWidget })),
  { ssr: false, loading: () => <WidgetSkeleton /> }
);

const NotificationCenter = dynamic(
  () => import('@/components/dashboard/NotificationCenter').then(m => ({ default: m.NotificationCenter })),
  { ssr: false, loading: () => <WidgetSkeleton /> }
);

const CorrelationViz = dynamic(
  () => import('@/components/dashboard/CorrelationViz').then(m => ({ default: m.CorrelationViz })),
  { ssr: false, loading: () => <WidgetSkeleton /> }
);

const ProgressTracker = dynamic(
  () => import('@/components/dashboard/ProgressTracker').then(m => ({ default: m.ProgressTracker })),
  { ssr: false, loading: () => <WidgetSkeleton /> }
);

const LoveReadingsWidget = dynamic(
  () => import('@/components/dashboard/LoveReadingsWidget').then(m => ({ default: m.LoveReadingsWidget })),
  { ssr: false, loading: () => <WidgetSkeleton /> }
);

const AInsightWidget = dynamic(
  () => import('@/components/dashboard/AInsightWidget').then(m => ({ default: m.AInsightWidget })),
  { ssr: false, loading: () => <WidgetSkeleton /> }
);

// ============================================================
// LAYOUT UTILITIES
// ============================================================

interface WidgetSkeletonProps {
  rows?: number;
}

function WidgetSkeleton({ rows = 3 }: WidgetSkeletonProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/50 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-slate-800" />
        <div className="h-5 w-24 bg-slate-800 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 w-full bg-slate-800/70 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

interface DashboardSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

function DashboardSection({ title, description, children, className = '' }: DashboardSectionProps) {
  return (
    <section className={`mt-6 md:mt-8 ${className}`}>
      {title && (
        <div className="mb-4">
          <h2 className="text-lg font-playfair font-semibold text-white">{title}</h2>
          {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Dashboard() {
  const userData = {
    id: 'dashboard-visitor',
    nome: 'Visitante',
    dataNascimento: '',
    numeroPessoal: 1,
    orixaRegente: 'Oxalá',
    odu: 'Alafia',
    arcanoPessoal: 1,
    sefirotDominante: ['Kether'],
  };

  return (
    <DashboardLayout>
      <DashboardHeader />
      
      {/* Welcome Card - Full width */}
      <WelcomeCard userName="Maria" />

      {/* Energy Section */}
      <DashboardSection title="Energia do Momento">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main energy - large */}
          <div className="lg:col-span-2">
            <RealtimeEnergyWidget />
          </div>
          
          {/* Side widgets - stacked */}
          <div className="flex flex-col gap-4 md:gap-6">
            <DayEnergyWidget />
            <NotificationCenter />
          </div>
        </div>
      </DashboardSection>

      {/* Spiritual Tools Section */}
      <DashboardSection 
        title="Ferramentas Espirituais" 
        description="Explore os sistemas místicos para seu autoconhecimento"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          <NumerologyWidget name="Maria" birthDate="15/03/1990" />
          <AstrologyWidget />
          <LunarPhaseWidget />
        </div>
      </DashboardSection>

      {/* Divination Section */}
      <DashboardSection title="Divinação">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          {/* Odu - large */}
          <div className="xl:col-span-2">
            <OduDivinationWidget />
          </div>
          
          {/* Quick Divination */}
          <QuickDivination />
        </div>
      </DashboardSection>

      {/* Balance & Progress Section */}
      <DashboardSection title="Crescimento Espiritual">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <ProgressTracker userId="dashboard" />
          <CorrelationViz />
        </div>
      </DashboardSection>

      {/* Chakra & Love Section */}
      <DashboardSection title="Equilíbrio Interior">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <ChakraBalanceWidget />
          <LoveReadingsWidget userId="dashboard" userOrixa={userData.orixaRegente} />
        </div>
      </DashboardSection>

      {/* Wisdom Section */}
      <DashboardSection title="Sabedoria Diária">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          <div className="xl:col-span-2">
            <DailyWisdomCard userData={userData} userId="dashboard" />
          </div>
          <AInsightWidget />
        </div>
      </DashboardSection>

      {/* Affirmations Section */}
      <DashboardSection title="Práticas Diárias">
        <AffirmationWidget userData={userData} />
      </DashboardSection>

      {/* Affirmations Section */}
      <DashboardSection title="Práticas Diárias">
        <AffirmationWidget userData={userData} />
      </DashboardSection>

      {/* Oracle CTA */}
      <DashboardSection title="Oráculo IA">
        <div className="rounded-2xl bg-gradient-to-br from-violet-900/30 to-purple-900/30 border border-violet-500/20 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Consultar o Oráculo</h3>
                <p className="text-sm text-slate-400">Receba orientações personalizadas da inteligência artificial</p>
              </div>
            </div>
            <Link href="/dashboard/oraculo">
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Abrir Chat
              </Button>
            </Link>
          </div>
        </div>
      </DashboardSection>
    </DashboardLayout>
  );
}