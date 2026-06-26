'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { SessionInsightsPanel } from '@/components/dashboard/SessionInsightsPanel';
import { MeditationStats } from '@/components/dashboard/MeditationStats';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Sample user data
const SAMPLE_USER = {
  name: 'Buscador',
  email: 'buscador@cabala.com',
  memberSince: new Date('2024-01-01'),
};

// Collapsible section component for mobile
function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-700/50 rounded-xl overflow-hidden md:border-0 md:rounded-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-800/30 md:hidden touch-manipulation min-h-[48px]"
      >
        <span className="font-medium text-slate-200">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      <div className={isOpen ? 'block' : 'hidden md:block'}>
        {children}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <DashboardHeader />
      
      <main className="p-4 md:p-6 space-y-6">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Estatísticas Espirituais
          </h2>
          <p className="text-slate-400">
            Acompanhe sua jornada espiritual
          </p>
        </div>

        {/* Top Row: StatsOverview + Quick Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            <CollapsibleSection title="Visão Geral das Estatísticas">
              <StatsOverview />
            </CollapsibleSection>
          </div>
          <div>
            <CollapsibleSection title="Resumo Rápido">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 md:p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Resumo da Semana</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Sessões</span>
                    <span className="text-white font-medium">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tempo Total</span>
                    <span className="text-white font-medium">3h 45m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Streak</span>
                    <span className="text-amber-400 font-medium">7 dias 🔥</span>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </div>

        {/* Middle Row: ProgressChart (full width) */}
        <CollapsibleSection title="Gráfico de Progresso">
          <ProgressChart />
        </CollapsibleSection>

        {/* Bottom Row: SessionInsightsPanel + MeditationStats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <CollapsibleSection title="Insights de Sessões">
            <SessionInsightsPanel />
          </CollapsibleSection>
          <CollapsibleSection title="Estatísticas de Meditação">
            <MeditationStats />
          </CollapsibleSection>
        </div>
      </main>
    </DashboardLayout>
  );
}
