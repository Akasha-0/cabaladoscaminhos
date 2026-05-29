'use client';

import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RealtimeEnergyWidget } from '@/components/dashboard/RealtimeEnergyWidget';
import { DayEnergyWidget } from '@/components/dashboard/DayEnergyWidget';
import { NumerologyWidget } from '@/components/dashboard/NumerologyWidget';
import { AstrologyWidget } from '@/components/dashboard/AstrologyWidget';
import { LunarPhaseWidget } from '@/components/dashboard/LunarPhaseWidget';
import { OduDivinationWidget } from '@/components/dashboard/OduDivinationWidget';
import { ChakraBalanceWidget } from '@/components/dashboard/ChakraBalanceWidget';
import { QuickDivination } from '@/components/dashboard/QuickDivination';
import { DailyWisdomCard } from '@/components/dashboard/DailyWisdomCard';

const AIOracleChat = dynamic(
  () => import('@/components/dashboard/AIOracleChat').then(m => ({ default: m.AIOracleChat })),
  { ssr: false }
);

const AffirmationWidget = dynamic(
  () => import('@/components/dashboard/AffirmationWidget').then(m => ({ default: m.AffirmationWidget })),
  { ssr: false }
);

const NotificationCenter = dynamic(
  () => import('@/components/dashboard/NotificationCenter').then(m => ({ default: m.NotificationCenter })),
  { ssr: false }
);

const CorrelationViz = dynamic(
  () => import('@/components/dashboard/CorrelationViz').then(m => ({ default: m.CorrelationViz })),
  { ssr: false }
);

const ProgressTracker = dynamic(
  () => import('@/components/dashboard/ProgressTracker').then(m => ({ default: m.ProgressTracker })),
  { ssr: false }
);

const LoveReadingsWidget = dynamic(
  () => import('@/components/dashboard/LoveReadingsWidget').then(m => ({ default: m.LoveReadingsWidget })),
  { ssr: false }
);

const AInsightWidget = dynamic(
  () => import('@/components/dashboard/AInsightWidget').then(m => ({ default: m.AInsightWidget })),
  { ssr: false }
);

const SAMPLE_USER = {
  name: 'Maria',
  spiritualName: 'Maria de Oxum',
  sign: 'Lua em Cancer',
  oduNumero: 3,
  birthDate: '15/03/1990',
};

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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <RealtimeEnergyWidget />
        </div>
        <div className="flex flex-col gap-6">
          <DayEnergyWidget />
          <NotificationCenter />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <NumerologyWidget name={SAMPLE_USER.name} birthDate={SAMPLE_USER.birthDate} />
        <AstrologyWidget />
        <LunarPhaseWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <OduDivinationWidget />
        <QuickDivination />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ProgressTracker userId="dashboard" />
        <CorrelationViz />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <LoveReadingsWidget userId="dashboard" />
        <ChakraBalanceWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <DailyWisdomCard userData={userData} userId="dashboard" />
        <AInsightWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <AffirmationWidget userData={userData} />
      </div>

      <div className="mt-6">
        <AIOracleChat userData={userData} />
      </div>
    </DashboardLayout>
  );
}
