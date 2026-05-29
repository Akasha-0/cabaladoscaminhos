'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTodayCorrelation } from '@/lib/correlation/SpiritualCorrelationEngine';

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

interface HeartChakraState {
  energy: number;
  status: 'aberto' | 'fechado' | 'equilibrado';
  tip: string;
}

// ============================================================
// CONSTANTS
// ============================================================

// Love-specific tarot card interpretations
const LOVE_TAROT_INTERPRETATIONS: Record<string, { upright: string; reversed: string }> = {
  'Lovers': { upright: 'Escolha de amor verdadeiro e conexão profunda', reversed: 'Desequilíbrio emocional e decisões precipitadas' },
  'Two of Cups': { upright: 'Parceria harmoniosa e amor correspondido', reversed: 'Tensão em relacionamentos e comunhão incompleta' },
  'Ten of Cups': { upright: 'Felicidade conjugal e família abençoada', reversed: 'Conflitos familiares e expectativas não atendidas' },
  'Ace of Hearts': { upright: 'Novo amor surgindo no horizonte', reversed: 'Blocagem emocional e fechamento do coração' },
  'Page of Cups': { upright: 'Curiosidade emocional e novas possibilidades', reversed: 'Intuição adormecida e medos inconscientes' },
};

// Zodiac to Orixá compatibility matrix (simplified)
const ZODIAC_ELEMENT_MAP: Record<string, string> = {
  'aries': 'fire', 'leo': 'fire', 'sagittarius': 'fire',
  'taurus': 'earth', 'virgo': 'earth', 'capricorn': 'earth',
  'gemini': 'air', 'libra': 'air', 'aquarius': 'air',
  'cancer': 'water', 'scorpio': 'water', 'pisces': 'water',
};

// Element harmony for compatibility
const ELEMENT_COMPATIBILITY: Record<string, Record<string, number>> = {
  fire: { fire: 70, earth: 40, air: 90, water: 50 },
  earth: { fire: 40, earth: 80, air: 50, water: 90 },
  air: { fire: 90, earth: 50, air: 70, water: 60 },
  water: { fire: 50, earth: 90, air: 60, water: 80 },
};

// Orixá to element mapping
const ORIXA_ELEMENT_MAP: Record<string, string> = {
  'Oxum': 'water', 'Iemanjá': 'water', 'Nanã': 'water',
  'Oxalá': 'air', 'Omulu': 'earth', 'Obá': 'earth',
  'Xangô': 'fire', 'Ogum': 'fire', 'Shango': 'fire',
  'Ibeji': 'air',
};

// Love affirmations by Orixá
const ORIXA_LOVE_AFFIRMATIONS: Record<string, string[]> = {
  oxum: [
    'Eu sou amada e merecedora de amor verdadeiro',
    'Minha beleza interior brilha e atrai conexões sagradas',
    'Eu fluo com a energia do amor puro',
  ],
  iemanja: [
    'Eu honro meu coração e permito que o amor flua livremente',
    'Sou uma criação sagrada do amor divino',
    'Minhas emoções são válidas e minhas conexões são abençoadas',
  ],
  xango: [
    'Eu tenho poder sobre meu destino amoroso',
    'Minha verdade emocional é minha força',
    'O amor que eu busco está buscando por mim',
  ],
  ogum: [
    'Eu corro atrás do amor com coragem e determinação',
    'Supero obstáculos no caminho do amor',
    'Minha energia atrai parceiros dignos',
  ],
  oxala: [
    'A paz envolve meu coração e atrai harmonia',
    'Sou merecedor de amor tranquilo e duradouro',
    'Desvencilho-me de padrões que não me servem',
  ],
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getOrixaKey(orixaName?: string): string {
  if (!orixaName) return 'oxum';
  return orixaName.toLowerCase().replace(/[áàâã]/g, 'a')
    .replace(/[éèê]/g, 'e')
    .replace(/[íìî]/g, 'i')
    .replace(/[óòôõ]/g, 'o')
    .replace(/[úùû]/g, 'u')
    .split(' ')[0];
}

function getDailyLoveCard(): LoveTarotCard {
  const dayOfYear = getDayOfYear();
  const cards = [
    { name: 'Lovers', meaning: LOVE_TAROT_INTERPRETATIONS.Lovers.upright, element: 'Ar', emoji: '💕' },
    { name: 'Two of Cups', meaning: LOVE_TAROT_INTERPRETATIONS['Two of Cups'].upright, element: 'Água', emoji: '🤝' },
    { name: 'Ten of Cups', meaning: LOVE_TAROT_INTERPRETATIONS['Ten of Cups'].upright, element: 'Fogo', emoji: '🏡' },
    { name: 'Ace of Hearts', meaning: LOVE_TAROT_INTERPRETATIONS['Ace of Hearts'].upright, element: 'Terra', emoji: '💖' },
    { name: 'Page of Cups', meaning: LOVE_TAROT_INTERPRETATIONS['Page of Cups'].upright, element: 'Água', emoji: '🌊' },
  ];
  
  const todayIndex = dayOfYear % cards.length;
  return cards[todayIndex];
}

function calculateCompatibility(userOrixa?: string, partnerSign?: string): CompatibilityResult {
  const userElement = userOrixa ? ORIXA_ELEMENT_MAP[userOrixa] || 'water' : 'water';
  const partnerElement = partnerSign ? ZODIAC_ELEMENT_MAP[partnerSign.toLowerCase()] || 'water' : 'water';
  
  const score = ELEMENT_COMPATIBILITY[userElement]?.[partnerElement] || 50;
  
  const descriptions = {
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
    fire: '🔥',
    earth: '🌍',
    air: '💨',
    water: '💧',
  };
  
  return {
    score,
    description: desc,
    element: partnerElement,
    elementEmoji: elementEmojis[partnerElement] || '💫',
  };
}

function getHeartChakraState(): HeartChakraState {
  const dayOfYear = getDayOfYear();
  const seed = dayOfYear % 100;
  
  const energy = 50 + (seed % 40);
  const status: HeartChakraState['status'] = energy >= 80 ? 'equilibrado' : energy >= 50 ? 'aberto' : 'fechado';
  
  const tips: Record<string, string> = {
    equilibrado: 'Seu chakra está harmonizado. Continue cultivando o amor próprio.',
    aberto: 'Pratique meditação com cristais verdes para abrir mais o coração.',
    fechado: 'É hora de se perdoar e liberar antigas mágoas.',
  };
  
  return {
    energy,
    status,
    tip: tips[status],
  };
}

function getDailyAffirmation(orixaKey: string): string {
  const affirmations = ORIXA_LOVE_AFFIRMATIONS[orixaKey] || ORIXA_LOVE_AFFIRMATIONS.oxum;
  const dayOfYear = getDayOfYear();
  const index = dayOfYear % affirmations.length;
  return affirmations[index];
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function HeartChakraIndicator({ energy, status, tip }: HeartChakraState) {
  const statusColors = {
    equilibrado: 'from-emerald-500 to-teal-500',
    aberto: 'from-rose-500 to-pink-500',
    fechado: 'from-slate-600 to-slate-700',
  };
  
  const statusLabels = {
    equilibrado: 'Equilibrado',
    aberto: 'Aberto',
    fechado: 'Fechado',
  };
  
  return (
    <div className={cn(
      'p-3 rounded-lg bg-gradient-to-br border transition-all',
      status === 'equilibrado' ? 'border-emerald-500/30 from-emerald-500/10 to-teal-500/10' :
      status === 'aberto' ? 'border-rose-500/30 from-rose-500/10 to-pink-500/10' :
      'border-slate-600/30 from-slate-800/50 to-slate-900/50'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            'bg-gradient-to-br',
            statusColors[status]
          )}>
            <span className="text-sm">💚</span>
          </div>
          <div>
            <p className="text-sm font-medium">Chakra do Coração</p>
            <p className="text-xs text-muted-foreground">Energia: {energy}%</p>
          </div>
        </div>
        <span className={cn(
          'px-2 py-0.5 rounded text-xs font-medium',
          status === 'equilibrado' ? 'bg-emerald-500/20 text-emerald-300' :
          status === 'aberto' ? 'bg-rose-500/20 text-rose-300' :
          'bg-slate-600/20 text-slate-400'
        )}>
          {statusLabels[status]}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{tip}</p>
      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500 bg-gradient-to-r', statusColors[status])}
          style={{ width: `${energy}%` }}
        />
      </div>
    </div>
  );
}

function LoveCardDisplay({ card }: { card: LoveTarotCard }) {
  return (
    <div className="relative p-4 rounded-lg bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
          {card.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-rose-300">{card.name}</p>
            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-xs text-rose-300">{card.element}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{card.meaning}</p>
        </div>
      </div>
    </div>
  );
}

function CompatibilityDisplay({ result }: { result: CompatibilityResult }) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 transition-all hover:border-rose-500/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{result.elementEmoji}</span>
          <span className="text-sm font-medium">Compatibilidade</span>
        </div>
        <span className={cn(
          'text-lg font-bold',
          result.score >= 80 ? 'text-emerald-400' :
          result.score >= 60 ? 'text-amber-400' :
          'text-slate-400'
        )}>
          {result.score}%
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{result.description}</p>
      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            result.score >= 80 ? 'bg-emerald-500' :
            result.score >= 60 ? 'bg-amber-500' :
            'bg-slate-500'
          )}
          style={{ width: `${result.score}%` }}
        />
      </div>
    </div>
  );
}

function AffirmationDisplay({ affirmation }: { affirmation: string }) {
  return (
    <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 transition-all hover:from-purple-500/20 hover:to-indigo-500/20">
      <div className="flex items-start gap-2">
        <span className="text-purple-400 text-lg">✨</span>
        <p className="text-sm text-purple-200 leading-relaxed italic">&ldquo;{affirmation}&rdquo;</p>
      </div>
    </div>
  );
}

function OrixaCompatibilityDisplay({ userOrixa }: { userOrixa?: string }) {
  if (!userOrixa) return null;
  
  const dayOfYear = getDayOfYear();
  const compatibleSigns = ['Touro', 'Câncer', 'Escorpião', 'Peixes'];
  const compatibleIndex = dayOfYear % compatibleSigns.length;
  const sign = compatibleSigns[compatibleIndex];
  
  return (
    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-all hover:border-amber-500/30">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-amber-400">🪬</span>
        <span className="text-sm font-medium text-amber-300">Energia de {userOrixa}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Hoje você vibra em harmonia com signos {sign === 'Touro' ? 'de Terra 🌍' : sign === 'Câncer' ? 'de Água 💧' : sign === 'Escorpião' ? 'de Água 💧' : 'de Água 💧'}
      </p>
    </div>
  );
}

function LoveReadingsLoadingSkeleton() {
  return (
    <Card className={cn(
      'card-spiritual overflow-hidden animate-fade-in',
    )}>
      <div className="h-0.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 animate-shimmer" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 animate-pulse" />
            <div className="h-5 w-32 rounded bg-slate-700 animate-pulse" />
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-slate-700/50 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </CardContent>
    </Card>
  );
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
  const [isLoaded, setIsLoaded] = useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 150);
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate all readings
  const dailyCard = useMemo(() => getDailyLoveCard(), [refreshKey]);
  const compatibility = useMemo(() => calculateCompatibility(userOrixa, partnerSign), [refreshKey, userOrixa, partnerSign]);
  const heartChakra = useMemo(() => getHeartChakraState(), [refreshKey]);
  const affirmation = useMemo(() => getDailyAffirmation(getOrixaKey(userOrixa)), [refreshKey, userOrixa]);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  if (!isLoaded) {
    return <LoveReadingsLoadingSkeleton />;
  }
  
  return (
    <Card className={cn(
      'card-spiritual overflow-hidden transition-all duration-300',
      'hover:shadow-lg hover:shadow-rose-500/10 hover:border-rose-500/30',
      'animate-fade-in',
      className
    )}>
      <div className="h-0.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500" />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
              Leituras de Amor
            </span>
          </CardTitle>
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-full hover:bg-slate-700/50 transition-all hover:rotate-180"
            title="Atualizar leituras"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Daily Love Card */}
        <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <LoveCardDisplay card={dailyCard} />
        </div>
        
        {/* Compatibility Check */}
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CompatibilityDisplay result={compatibility} />
        </div>
        
        {/* Heart Chakra */}
        <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <HeartChakraIndicator {...heartChakra} />
        </div>
        
        {/* Orixá Profile */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <OrixaCompatibilityDisplay userOrixa={userOrixa} />
        </div>
        
        {/* Love Affirmation */}
        <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <AffirmationDisplay affirmation={affirmation} />
        </div>
        
        {/* Footer tip */}
        <div className="text-center pt-2 border-t border-slate-700/50 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <p className="text-xs text-slate-500">
            ✨ As leituras são baseadas na energia espiritual do momento
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default LoveReadingsWidget;