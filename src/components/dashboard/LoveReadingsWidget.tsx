'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetProgress } from './SpiritualWidgetSystem';
import { Heart, RefreshCw, Sparkles, Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface LoveReadingsWidgetProps {
  userId?: string;
  userOrixa?: string;
  partnerSign?: string;
  className?: string;
}

interface LoveTarotCard {
  name: string;
  meaning: string;
  element: string;
  emoji: string;
}

interface CompatibilityResult {
  score: number;
  description: string;
  element: string;
  elementEmoji: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const LOVE_TAROT_CARDS = [
  { name: 'Lovers', meaning: 'Escolha de amor verdadeiro e conexão profunda', element: 'Ar', emoji: '💕' },
  { name: 'Two of Cups', meaning: 'Parceria harmoniosa e amor correspondido', element: 'Água', emoji: '🤝' },
  { name: 'Ten of Cups', meaning: 'Felicidade conjugal e família abençoada', element: 'Fogo', emoji: '🏡' },
  { name: 'Ace of Hearts', meaning: 'Novo amor surgindo no horizonte', element: 'Terra', emoji: '💖' },
  { name: 'Page of Cups', meaning: 'Curiosidade emocional e novas possibilidades', element: 'Água', emoji: '🌊' },
];

const ELEMENT_COMPATIBILITY: Record<string, Record<string, number>> = {
  fire: { fire: 70, earth: 40, air: 90, water: 50 },
  earth: { fire: 40, earth: 80, air: 50, water: 90 },
  air: { fire: 90, earth: 50, air: 70, water: 60 },
  water: { fire: 50, earth: 90, air: 60, water: 80 },
};

const ORIXA_ELEMENT_MAP: Record<string, string> = {
  'Oxum': 'water', 'Iemanjá': 'water',
  'Oxalá': 'air', 'Omolu': 'earth', 'Obá': 'earth',
  'Xangô': 'fire', 'Ogum': 'fire',
  'Iansã': 'fire', 'Oxóssi': 'earth',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getDailyLoveCard(): LoveTarotCard {
  const dayOfYear = getDayOfYear();
  return LOVE_TAROT_CARDS[dayOfYear % LOVE_TAROT_CARDS.length];
}

function calculateCompatibility(userOrixa?: string, partnerSign?: string): CompatibilityResult {
  const userElement = userOrixa ? ORIXA_ELEMENT_MAP[userOrixa] || 'water' : 'water';
  const partnerElement = 'water'; // Default
  
  const score = ELEMENT_COMPATIBILITY[userElement]?.[partnerElement] || 50;
  
  const descriptions: Record<string, string> = {
    90: 'Conexão muito forte! Vocês se complementam perfeitamente.',
    80: 'Ótima compatibilidade. Há harmonia natural entre vocês.',
    70: 'Boa conexão. Trabalhem juntos para fortalecer o vínculo.',
    60: 'Compatibilidade moderada. Precisam de comunicação e paciência.',
    50: 'Compatibilidade em desenvolvimento. A jornada exige paciência.',
    40: 'Compatibilidade desafiadora. Mas o amor pode superar qualquer barreira.',
  };
  
  const desc = Object.entries(descriptions)
    .sort(([a], [b]) => Number(b) - Number(a))
    .find(([threshold]) => score >= Number(threshold))?.[1] || descriptions[50];
  
  const elementEmojis: Record<string, string> = {
    fire: '🔥', earth: '🌍', air: '💨', water: '💧',
  };
  
  return {
    score,
    description: desc,
    element: partnerElement,
    elementEmoji: elementEmojis[partnerElement] || '💫',
  };
}

function getHeartChakraState(): { energy: number; status: string; tip: string } {
  const dayOfYear = getDayOfYear();
  const seed = dayOfYear % 100;
  
  const energy = 50 + (seed % 40);
  const status = energy >= 80 ? 'Equilibrado' : energy >= 50 ? 'Aberto' : 'Fechado';
  
  const tips: Record<string, string> = {
    Equilibrado: 'Seu chakra está harmonizado. Continue cultivando o amor próprio.',
    Aberto: 'Pratique meditação com cristais verdes para abrir mais o coração.',
    Fechado: 'É hora de se perdoar e liberar antigas mágoas.',
  };
  
  return {
    energy,
    status,
    tip: tips[status],
  };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function LoveReadingsWidget({ 
  userId,
  userOrixa,
  partnerSign,
  className = '',
}: LoveReadingsWidgetProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Calculate all readings
  const dailyCard = useMemo(() => getDailyLoveCard(), [refreshKey]);
  const compatibility = useMemo(() => calculateCompatibility(userOrixa, partnerSign), [refreshKey, userOrixa, partnerSign]);
  const heartChakra = useMemo(() => getHeartChakraState(), [refreshKey]);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-pink-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Leituras de Amor
            </span>
          </CardTitle>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-pink-400 hover:bg-slate-700/50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Daily Love Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 overflow-hidden relative">
          <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 100% 0%, rgba(236,72,153,0.5), transparent 50%)' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/30 to-rose-500/30 flex items-center justify-center text-xl">
                {dailyCard.emoji}
              </div>
              <div>
                <p className="text-sm font-bold text-pink-400">{dailyCard.name}</p>
                <p className="text-xs text-pink-400/70">{dailyCard.element}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{dailyCard.meaning}</p>
          </div>
        </div>

        {/* Compatibility */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{compatibility.elementEmoji}</span>
              <span className="text-sm font-medium text-slate-200">Compatibilidade</span>
            </div>
            <span className={cn(
              'text-lg font-bold',
              compatibility.score >= 80 ? 'text-emerald-400' :
              compatibility.score >= 60 ? 'text-amber-400' :
              'text-slate-400'
            )}>
              {compatibility.score}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">{compatibility.description}</p>
          <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full rounded-full transition-all duration-500',
                compatibility.score >= 80 ? 'bg-emerald-500' :
                compatibility.score >= 60 ? 'bg-amber-500' :
                'bg-slate-500'
              )}
              style={{ width: `${compatibility.score}%` }}
            />
          </div>
        </div>

        {/* Heart Chakra */}
        <div className={cn(
          'p-4 rounded-xl border transition-all',
          heartChakra.status === 'Equilibrado' ? 'bg-emerald-500/10 border-emerald-500/20' :
          heartChakra.status === 'Aberto' ? 'bg-rose-500/10 border-rose-500/20' :
          'bg-slate-800/50 border-slate-700/30'
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">💚</span>
              <div>
                <p className="text-sm font-medium text-slate-200">Chakra do Coração</p>
                <p className="text-xs text-slate-400">Energia: {heartChakra.energy}%</p>
              </div>
            </div>
            <span className={cn(
              'px-2 py-0.5 rounded text-xs font-medium',
              heartChakra.status === 'Equilibrado' ? 'bg-emerald-500/20 text-emerald-400' :
              heartChakra.status === 'Aberto' ? 'bg-rose-500/20 text-rose-400' :
              'bg-slate-600/20 text-slate-400'
            )}>
              {heartChakra.status}
            </span>
          </div>
          <p className="text-xs text-slate-400">{heartChakra.tip}</p>
          <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden mt-3">
            <div 
              className={cn(
                'h-full rounded-full transition-all duration-500',
                heartChakra.status === 'Equilibrado' ? 'bg-emerald-500' :
                heartChakra.status === 'Aberto' ? 'bg-rose-500' :
                'bg-slate-500'
              )}
              style={{ width: `${heartChakra.energy}%` }}
            />
          </div>
        </div>

        {/* Orixá Energy */}
        {userOrixa && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Energia de {userOrixa}</span>
            </div>
            <p className="text-xs text-slate-400">
              Hoje você vibra em harmonia com a energia do amor e da conexão.
            </p>
          </div>
        )}

        {/* Quick Tips */}
        <WidgetProgress 
          label="Amor próprio" 
          value={heartChakra.energy} 
          max={100} 
          color={heartChakra.status === 'Equilibrado' ? 'emerald' : 'pink'} 
        />
      </CardContent>
    </Card>
  );
}

export default LoveReadingsWidget;