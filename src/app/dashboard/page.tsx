'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { RealtimeEnergyWidget } from '@/components/dashboard/RealtimeEnergyWidget';
import { DailyWisdomCard } from '@/components/dashboard/DailyWisdomCard';
import { QuickDivination } from '@/components/dashboard/QuickDivination';
import { AIOracleChat } from '@/components/dashboard/AIOracleChat';
import { PredictiveInsightsPanel } from '@/components/dashboard/PredictiveInsightsPanel';
import { CorrelationViz } from '@/components/dashboard/CorrelationViz';
import { MapaNatalWheel } from '@/components/dashboard/MapaNatalWheel';

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Energy + Mapa */}
        <div className="lg:col-span-2 space-y-6">
          <RealtimeEnergyWidget />
          <MapaNatalWheel 
            data={{
              planets: [
                { planeta: 'Sol', signo: 'aries', longitude: 24.5, latitude: 0, distancia: 1, velocidade: 1, casa: 1 },
                { planeta: 'Lua', signo: 'cancer', longitude: 192.3, latitude: 0, distancia: 1, velocidade: 12, casa: 4 },
                { planeta: 'Mercúrio', signo: 'touro', longitude: 72.1, latitude: 0, distancia: 1, velocidade: 2, casa: 2 },
                { planeta: 'Vênus', signo: 'peixes', longitude: 320.8, latitude: 0, distancia: 1, velocidade: 1, casa: 7 },
                { planeta: 'Marte', signo: 'escorpiao', longitude: 230.5, latitude: 0, distancia: 1, velocidade: 0.5, casa: 5 },
              ],
              ascendente: 45,
              cusps: Array(12).fill(0).map((_, i) => i * 30 + 15),
            }} 
            size="md"
          />
          <CorrelationViz />
        </div>
        
        {/* Right Column - Chat + Quick */}
        <div className="space-y-6">
          <DailyWisdomCard />
          <QuickDivination />
        </div>
      </div>
      
      {/* Second Row */}
      <div className="mt-6">
        <AIOracleChat />
      </div>
      
      {/* Insights */}
      <div className="mt-6">
        <PredictiveInsightsPanel />
      </div>
    </DashboardLayout>
  );
}