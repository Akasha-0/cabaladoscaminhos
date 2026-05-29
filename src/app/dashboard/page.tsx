'use client';

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

const SAMPLE_USER = {
  name: 'Maria',
  spiritualName: 'Maria de Oxum',
  sign: 'Lua em Câncer',
  oduNumero: 3,
  birthDate: '15/03/1990',
};

export default function Dashboard() {
  const userData = {
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
      <DashboardHeader userData={SAMPLE_USER} />
      
      {/* Top Row - Energy + Day Correlation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <RealtimeEnergyWidget />
        </div>
        <div>
          <DayEnergyWidget />
        </div>
      </div>

      {/* Second Row - Numerology + Astrology + Lunar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <NumerologyWidget name={SAMPLE_USER.name} birthDate={SAMPLE_USER.birthDate} />
        <AstrologyWidget />
        <LunarPhaseWidget />
      </div>

      {/* Third Row - Orixá + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <OduDivinationWidget />
        <SpiritualProgressWidget />
      </div>

      {/* Fourth Row - Rituals + Chakra */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RitualReminderWidget />
        <ChakraBalanceWidget />
      </div>

      {/* Fifth Row - Correlation + Wisdom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <CorrelationViz />
        <DailyWisdomCard userData={userData} userId="dashboard-visitor" />
      </div>
    </DashboardLayout>
  );
}
