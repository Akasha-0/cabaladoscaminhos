'use client';

import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { RealtimeEnergyWidget } from '@/components/dashboard/RealtimeEnergyWidget';
import { DailyWisdomCard } from '@/components/dashboard/DailyWisdomCard';
import { CorrelationViz } from '@/components/dashboard/CorrelationViz';
import { NumerologyWidget } from '@/components/dashboard/NumerologyWidget';
import { AstrologyWidget } from '@/components/dashboard/AstrologyWidget';
import { ChakraBalanceWidget } from '@/components/dashboard/ChakraBalanceWidget';
import { OduDivinationWidget } from '@/components/dashboard/OduDivinationWidget';
import { DayEnergyWidget } from '@/components/dashboard/DayEnergyWidget';
import { LunarPhaseWidget } from '@/components/dashboard/LunarPhaseWidget';
import { RitualReminderWidget } from '@/components/dashboard/RitualReminderWidget';
import { SpiritualProgressWidget } from '@/components/dashboard/SpiritualProgressWidget';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProgressTracker } from '@/components/dashboard/ProgressTracker';
import { DailyPredictionCard } from '@/components/dashboard/DailyPredictionCard';
import { QuickDivination } from '@/components/dashboard/QuickDivination';
import { SpiritWellnessWidget } from '@/components/dashboard/SpiritWellnessWidget';
import { NotificationCenter } from '@/components/dashboard/NotificationCenter';
import { PredictionWidget } from '@/components/dashboard/PredictionWidget';
import { MoonRitualPlanner } from '@/components/dashboard/MoonRitualPlanner';
import { AInsightWidget } from '@/components/dashboard/AInsightWidget';
import { LoveReadingsWidget } from '@/components/dashboard/LoveReadingsWidget';

// Lazy load heavy components
const AffirmationWidget = dynamic(
  () => import('@/components/dashboard/AffirmationWidget').then(m => ({ default: m.AffirmationWidget })),
  { ssr: false }
);
const AIOracleChat = dynamic(
  () => import('@/components/dashboard/AIOracleChat').then(m => ({ default: m.AIOracleChat })),
  { ssr: false }
);

const SAMPLE_USER = {
  name: 'Maria',
  spiritualName: 'Maria de Oxum',
  sign: 'Lua em Câncer',
  oduNumero: 3,
  birthDate: '15/03/1990',
};

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
      
      {/* Row 1: Energy - RealtimeEnergy + DayEnergy + NotificationCenter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <RealtimeEnergyWidget />
        </div>
        <div className="flex flex-col gap-6">
          <DayEnergyWidget />
          <NotificationCenter />
        </div>
      </div>

      {/* Row 2: Core - Numerology + Astrology + Lunar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <NumerologyWidget name={SAMPLE_USER.name} birthDate={SAMPLE_USER.birthDate} />
        <AstrologyWidget />
        <LunarPhaseWidget />
      </div>

      {/* Row 3: Spiritual - Odu + Predictions + QuickDivination */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <OduDivinationWidget />
        <DailyPredictionCard userData={userData} />
        <QuickDivination />
      </div>

      {/* Row 4: Progress - SpiritualProgress + ProgressTracker + MoonRitual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <SpiritualProgressWidget />
        <ProgressTracker userId="dashboard-visitor" />
        <MoonRitualPlanner />
      </div>

      {/* Row 5: Love + Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <LoveReadingsWidget userId="dashboard-visitor" userOrixa="Oxalá" />
        <PredictionWidget />
      </div>

      {/* Row 6: Wisdom - Correlation + Wisdom + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <CorrelationViz />
        <DailyWisdomCard userData={userData} userId="dashboard-visitor" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <AInsightWidget />
        <AffirmationWidget userData={userData} />
      </div>

      {/* Row 7: Wellness + Rituals + Chakra */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <SpiritWellnessWidget userId="dashboard-visitor" />
        <RitualReminderWidget />
        <ChakraBalanceWidget />
      </div>

      {/* Row 8: AI Oracle Chat (Lazy loaded) */}
      <div className="mt-6">
        <AIOracleChat userData={userData} />
      </div>
    </DashboardLayout>
  );
}
