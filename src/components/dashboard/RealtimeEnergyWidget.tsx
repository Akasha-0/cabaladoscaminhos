'use client';

import { useSpiritualEnergy } from '@/lib/hooks/useSpiritualEnergy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun } from 'lucide-react';

const SYMBOLS: Record<string, string> = {
  'Xangô': '🔥',
  'Iemanjá': '🌊',
  'Iansã': '⚡',
  'Oxalá': '✧',
  'Oxóssi': '🏹',
  'Oxum': '💧',
  'Ogum': '⚔️',
};

export function RealtimeEnergyWidget() {
  const energy = useSpiritualEnergy();
  
  return (
    <Card className="card-spiritual">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-400" />
          Energia Espiritual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Energy Banner */}
        <div 
          className="flex items-center gap-4 p-4 rounded-lg"
          style={{ backgroundColor: `${energy.cor}20` }}
        >
          <div className="text-4xl">{SYMBOLS[energy.orixa] || '🔮'}</div>
          <div>
            <p className="text-xl font-bold" style={{ color: energy.cor }}>
              Dia de {energy.orixa}
            </p>
            <p className="text-sm text-slate-400">
              {energy.planeta} • {energy.chakra}
            </p>
          </div>
        </div>
        
        {/* Lunar Phase */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
          <Moon className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm">{energy.lunarPhase}</p>
            <p className="text-xs text-slate-500">{energy.lunarIllumination}% iluminada</p>
          </div>
        </div>
        
        {/* Activities */}
        <div>
          <p className="text-sm text-slate-400 mb-2">Atividades Favoráveis</p>
          <div className="flex flex-wrap gap-2">
            {energy.activities.map((activity) => (
              <span 
                key={activity}
                className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs"
              >
                {activity}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}