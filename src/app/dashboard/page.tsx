'use client';

import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { RealtimeEnergyWidget } from '@/components/dashboard/RealtimeEnergyWidget';
import { DailyWisdomCard } from '@/components/dashboard/DailyWisdomCard';
import { NumerologyWidget } from '@/components/dashboard/NumerologyWidget';
  () => import('@/components/dashboard/AIOracleChat').then(m => ({ default: m.AIOracleChat })),
  { ssr: false }
);
const CorrelationViz = dynamic(
  () => import('@/components/dashboard/CorrelationViz').then(m => ({ default: m.CorrelationViz })),
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

      {/* Row 5: Love + Finance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <LoveReadingsWidget userId="dashboard-visitor" userOrixa="Oxalá" />
        <SpiritualFinanceWidget userId="dashboard-visitor" userOrixa="Oxalá" />
      </div>

      {/* Row 6: Journal + Meditation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <SpiritualJournalWidget userId="dashboard-visitor" userOrixa="Oxalá" />
        <GuidedMeditationWidget userId="dashboard-visitor" userOrixa="Oxalá" />
      </div>

      {/* Row 7: Wellness + Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <SpiritWellnessWidget userId="dashboard-visitor" />
        <PredictionWidget />
        <ChakraBalanceWidget />
      </div>

      {/* Row 8: Wisdom - Correlation + Wisdom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <CorrelationViz />
        <DailyWisdomCard userData={userData} userId="dashboard-visitor" />
      </div>

      {/* Row 9: Insights + Affirmations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <AInsightWidget />
        <AffirmationWidget userData={userData} />
      </div>

      {/* Row 10: Rituals */}
      <div className="mt-6">
        <RitualReminderWidget />
      </div>

      {/* Row 11: AI Oracle Chat (Lazy loaded) */}
      <div className="mt-6">
        <AIOracleChat userData={userData} />
      </div>
    </DashboardLayout>
  );
}
