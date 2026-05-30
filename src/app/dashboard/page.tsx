'use client';

import dynamic from 'next/dynamic';
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
const AIOracleChat = dynamic(
  () => import('@/components/dashboard/AIOracleChat').then(m => ({ default: m.AIOracleChat })),
  { ssr: false, loading: () => <WidgetSkeleton /> }
);

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

// Skeleton loader for widgets
function WidgetSkeleton() {
  return (
    <div className="rounded-2xl bg-slate-900/50 border border-slate-800/50 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-slate-800" />
        <div className="h-5 w-32 bg-slate-800 rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-slate-800 rounded" />
        <div className="h-4 w-3/4 bg-slate-800 rounded" />
        <div className="h-4 w-1/2 bg-slate-800 rounded" />
      </div>
    </div>
  );
}

// Widget grid container
function WidgetGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 ${className}`}>
      {children}
    </div>
  );
}

// Section wrapper
function Section({ 
  title, 
  description, 
  children, 
  className = '' 
}: { 
  title?: string; 
  description?: string; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <section className={`mt-6 md:mt-8 ${className}`}>
      {title && (
        <div className="mb-4">
          <h2 className="text-lg font-playfair font-semibold text-white">{title}</h2>
          {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export default function Dashboard() {
  const userData = {
    id: 'dashboard-visitor',
    nome: 'Visitante',
    dataNascimento: '',
    numeroPessoal: 1,
    orixaRegente: 'Oxala',
    odu: 'Alafia',
    arcanoPessoal: 1,
    sefirotDominante: ['Kether'],
  };

  return (
    <DashboardLayout>
      <DashboardHeader />
      
      {/* Welcome Card */}
      <WelcomeCard userName="Maria" />

      {/* Quick Stats Row */}
      <Section title="Energia do Momento">
        <WidgetGrid>
          <div className="lg:col-span-2">
            <RealtimeEnergyWidget />
          </div>
          <div className="flex flex-col gap-4">
            <DayEnergyWidget />
            <NotificationCenter />
          </div>
        </WidgetGrid>
      </Section>

      {/* Spiritual Tools Row */}
      <Section 
        title="Ferramentas Espirituais" 
        description="Explore os sistemas místicos para seu autoconhecimento"
      >
        <WidgetGrid>
          <NumerologyWidget name="Maria" birthDate="15/03/1990" />
          <AstrologyWidget />
          <LunarPhaseWidget />
        </WidgetGrid>
      </Section>

      {/* Divination Row */}
      <Section title="Divinação">
        <WidgetGrid>
          <div className="lg:col-span-2">
            <OduDivinationWidget />
          </div>
          <QuickDivination />
        </WidgetGrid>
      </Section>

      {/* Progress & Insights Row */}
      <Section title="Crescimento Espiritual">
        <WidgetGrid>
          <ProgressTracker userId="dashboard" />
          <CorrelationViz />
        </WidgetGrid>
      </Section>

      {/* Chakras & Love Row */}
      <Section title="Equilíbrio Interior">
        <WidgetGrid>
          <ChakraBalanceWidget />
          <LoveReadingsWidget userId="dashboard" />
        </WidgetGrid>
      </Section>

      {/* Daily Wisdom & AI Row */}
      <Section title="Sabedoria Diária">
        <WidgetGrid>
          <div className="lg:col-span-2">
            <DailyWisdomCard userData={userData} userId="dashboard" />
          </div>
          <AInsightWidget />
        </WidgetGrid>
      </Section>

      {/* Affirmations & Chat */}
      <Section title="Práticas Diárias">
        <WidgetGrid>
          <div className="lg:col-span-2">
            <AffirmationWidget userData={userData} />
          </div>
        </WidgetGrid>
      </Section>

      {/* AI Oracle Chat */}
      <Section title="Oráculo IA" description="Consultas personalizadas com inteligência artificial">
        <div className="mt-4">
          <AIOracleChat userData={userData} />
        </div>
      </Section>
    </DashboardLayout>
  );
}