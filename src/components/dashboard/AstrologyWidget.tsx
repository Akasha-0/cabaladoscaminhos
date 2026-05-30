'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetInfoRow, WidgetTagList, WidgetProgress } from './SpiritualWidgetSystem';
import { Moon, Sun, Planet } from 'lucide-react';

const SIGNOS = [
  { emoji: '♈', name: 'Áries', planeta: 'Marte', elemento: 'Fogo' },
  { emoji: '♉', name: 'Touro', planeta: 'Vênus', elemento: 'Terra' },
  { emoji: '♊', name: 'Gêmeos', planeta: 'Mercúrio', elemento: 'Ar' },
  { emoji: '♋', name: 'Câncer', planeta: 'Lua', elemento: 'Água' },
  { emoji: '♌', name: 'Leão', planeta: 'Sol', elemento: 'Fogo' },
  { emoji: '♍', name: 'Virgem', planeta: 'Mercúrio', elemento: 'Terra' },
  { emoji: '♎', name: 'Libra', planeta: 'Vênus', elemento: 'Ar' },
  { emoji: '♏', name: 'Escorpião', planeta: 'Plutão', elemento: 'Água' },
  { emoji: '♐', name: 'Sagitário', planeta: 'Júpiter', elemento: 'Fogo' },
  { emoji: '♑', name: 'Capricórnio', planeta: 'Saturno', elemento: 'Terra' },
  { emoji: '♒', name: 'Aquário', planeta: 'Urano', elemento: 'Ar' },
  { emoji: '♓', name: 'Peixes', planeta: 'Netuno', elemento: 'Água' },
];

const PLANETAS_DO_DIA = [
  { nome: 'Sol', dia: 'Domingo', cor: 'text-amber-400' },
  { nome: 'Lua', dia: 'Segunda', cor: 'text-slate-300' },
  { nome: 'Marte', dia: 'Terça', cor: 'text-red-400' },
  { nome: 'Mercúrio', dia: 'Quarta', cor: 'text-cyan-400' },
  { nome: 'Júpiter', dia: 'Quinta', cor: 'text-blue-400' },
  { nome: 'Vênus', dia: 'Sexta', cor: 'text-pink-400' },
  { nome: 'Saturno', dia: 'Sábado', cor: 'text-violet-400' },
];

function getSignoAtual(): typeof SIGNOS[0] {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return SIGNOS[dayOfYear % 12];
}

function getPlanetaRegente(): typeof PLANETAS_DO_DIA[0] {
  const today = new Date();
  return PLANETAS_DO_DIA[today.getDay()];
}

function getFaseLua(): string {
  const today = new Date();
  const knownNewMoon = new Date(2024, 0, 11).getTime();
  const lunarCycle = 29.53058867 * 24 * 60 * 60 * 1000;
  const daysSinceNew = (today.getTime() - knownNewMoon) / 86400000;
  const phaseAge = daysSinceNew % lunarCycle;
  
  if (phaseAge < 1.85) return 'Lua Nova 🌑';
  if (phaseAge < 7.38) return 'Crescente 🌓';
  if (phaseAge < 14.77) return 'Gibosa 🌔';
  if (phaseAge < 18.41) return 'Lua Cheia 🌕';
  if (phaseAge < 22.06) return 'Gibosa Minguante 🌖';
  if (phaseAge < 25.7) return 'Quarto Minguante 🌗';
  if (phaseAge < 29.53) return 'Minguante 🌘';
  return 'Lua Nova 🌑';
}

export function AstrologyWidget() {
  const signoAtual = getSignoAtual();
  const planetaRegente = getPlanetaRegente();
  const faseLua = getFaseLua();

  const elementosEmojis: Record<string, string> = {
    'Fogo': '🔥',
    'Terra': '🌍',
    'Ar': '💨',
    'Água': '💧',
  };

  return (
    <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50">
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Moon className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Astrologia
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {/* Signo atual */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <span className="text-3xl">{signoAtual.emoji}</span>
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold text-white">{signoAtual.nome}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-violet-400">{elementosEmojis[signoAtual.elemento]} {signoAtual.planeta}</span>
                <span className="text-xs text-slate-500">|</span>
                <span className="text-sm text-slate-400">{signoAtual.elemento}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fase da Lua */}
        <WidgetInfoRow 
          label="Fase da Lua" 
          value={faseLua} 
          icon={<Moon className="w-4 h-4" />}
          valueColor="text-slate-200"
        />

        {/* Planeta do dia */}
        <WidgetInfoRow 
          label={`Regente de ${planetaRegente.dia}`} 
          value={planetaRegente.nome} 
          icon={<Sun className="w-4 h-4" />}
          valueColor={planetaRegente.cor}
        />

        {/* Progresso de energia */}
        <div className="pt-3 border-t border-slate-800/50">
          <WidgetProgress label="Energia astral" value={72} max={100} color="violet" />
        </div>
      </CardContent>
    </Card>
  );
}