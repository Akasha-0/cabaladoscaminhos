'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon } from 'lucide-react';

const SIGNOS = [
  'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
];

const LUA_FASES = [
  'Lua Nova', 'Crescente', 'Quarto Crescente', 'Gibosa',
  'Cheia', 'Gibosa Minguante', 'Quarto Minguante', 'Minguante'
];

export function AstrologyWidget() {
  const today = new Date();
  
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const signIndex = Math.floor(dayOfYear / 30.4) % 12;
  const currentSign = SIGNOS[signIndex];
  
  const lunarCycle = 29.53;
  const knownNewMoon = new Date(2024, 0, 11).getTime();
  const daysSinceNew = (today.getTime() - knownNewMoon) / 86400000;
  const phaseIndex = Math.floor((daysSinceNew % lunarCycle) / (lunarCycle / 8)) % 8;
  const moonPhase = LUA_FASES[phaseIndex];
  
  const dayPlanets = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno', 'Lua'];
  const currentPlanet = dayPlanets[today.getDay()];

  return (
    <Card className="card-spiritual">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Moon className="w-5 h-5 text-violet-400" />
          <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Astrologia
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
          <span className="text-slate-400">Signo Solar</span>
          <span className="text-xl font-bold text-violet-300">{currentSign}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
          <span className="text-slate-400">Fase da Lua</span>
          <span className="text-lg font-semibold text-slate-200">{moonPhase}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
          <span className="text-slate-400">Planeta Regente</span>
          <span className="text-lg font-semibold text-amber-300">{currentPlanet}</span>
        </div>
      </CardContent>
    </Card>
  );
}
