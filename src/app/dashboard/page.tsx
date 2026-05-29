'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { RealtimeEnergyWidget } from '@/components/dashboard/RealtimeEnergyWidget';
import { DailyWisdomCard } from '@/components/dashboard/DailyWisdomCard';
import { QuickDivination } from '@/components/dashboard/QuickDivination';
import { CorrelationViz } from '@/components/dashboard/CorrelationViz';
import { NumerologyWidget } from '@/components/dashboard/NumerologyWidget';
import { AstrologyWidget } from '@/components/dashboard/AstrologyWidget';
import { ChakraBalanceWidget } from '@/components/dashboard/ChakraBalanceWidget';
import { OduDivinationWidget } from '@/components/dashboard/OduDivinationWidget';
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="space-y-6">
          <RealtimeEnergyWidget />
          <NumerologyWidget name={SAMPLE_USER.name} birthDate={SAMPLE_USER.birthDate} />
          <CorrelationViz />
        </div>
        
        <div className="space-y-6">
          <DailyWisdomCard userData={userData} userId="dashboard-visitor" />
          <AstrologyWidget />
          <OduDivinationWidget />
        </div>
      </div>
      
      <div className="mt-6">
        <ChakraBalanceWidget />
      </div>
    </DashboardLayout>
  );
}
