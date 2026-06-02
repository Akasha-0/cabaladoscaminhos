// fallow-ignore-file unused-file
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Calendar, Moon, Star, Compass, Heart, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOduDoDia, getOrixasDoDia, getTarotCardDoDia } from '@/lib/orixa/widget-data';
import { calculateLifePath } from '@/lib/numerologia/calculos';
import { getProfileById } from '@/lib/orixa/orixa-profiles';

// ============================================================
// TYPES
// ============================================================

interface DailyPredictionCardProps {
  userData?: {
    id?: string;
    nome?: string;
    dataNascimento?: string;
    orixaRegente?: string;
    odu?: string;
  };
  className?: string;
}

interface Prediction {
  area: string;
  icon: React.ReactNode;
  prediction: string;
  intensity: number; // 1-3
  color: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const ELEMENT_PREDICTIONS: Record<string, Prediction[]> = {
  Fogo: [
    { area: 'Paixão', icon: <Zap className="w-4 h-4" />, prediction: 'Sua energia de fogo traz coragem para novos inícios. Aqueça corações ao seu redor.', intensity: 3, color: 'text-orange-400' },
    { area: 'Transformação', icon: <Star className="w-4 h-4" />, prediction: 'O fogo purifica e transforma. Libere o que precisa ser queimado.', intensity: 2, color: 'text-amber-400' },
  ],
  Água: [
    { area: 'Intuição', icon: <Moon className="w-4 h-4" />, prediction: 'As águas da sua alma estão calmas. Permita que a intuição flua naturalmente.', intensity: 3, color: 'text-blue-400' },
    { area: 'Emoções', icon: <Heart className="w-4 h-4" />, prediction: 'Suas emoções são como ondas - observe-as sem resistir.', intensity: 2, color: 'text-cyan-400' },
  ],
  Terra: [
    { area: 'Estabilidade', icon: <Shield className="w-4 h-4" />, prediction: 'A energia da terra traz grounding. Conecte-se com a natureza para fortalecer sua âncora.', intensity: 3, color: 'text-emerald-400' },
    { area: 'Abundância', icon: <Star className="w-4 h-4" />, prediction: 'Suas sementes estão germinando. Continue nutridor seu jardim interior.', intensity: 2, color: 'text-green-400' },
  ],
  Ar: [
    { area: 'Comunicação', icon: <Sparkles className="w-4 h-4" />, prediction: 'O vento traz novas ideias. Expresse sua verdade com clareza e compaixão.', intensity: 3, color: 'text-sky-400' },
    { area: 'Conexões', icon: <Heart className="w-4 h-4" />, prediction: 'Novos arcos de pensamentos conectam você a pessoas e ideias valiosas.', intensity: 2, color: 'text-violet-400' },
  ],
  Éter: [
    { area: 'Espiritualidade', icon: <Star className="w-4 h-4" />, prediction: 'A energia do éter abre portais para dimensões superiores. Medite com intenção.', intensity: 3, color: 'text-purple-400' },
    { area: 'Sincronicidades', icon: <Sparkles className="w-4 h-4" />, prediction: 'Preste atenção aos sinais - o universo está falando diretamente com você.', intensity: 2, color: 'text-fuchsia-400' },
  ],
};

const LIFE_PATH_INSIGHTS: Record<number, { tema: string; conselha: string }> = {
  1: { tema: 'Liderança', conselha: 'Este é seu momento de liderança. Dê o primeiro passo com confiança.' },
  2: { tema: 'Parceria', conselha: 'A colaboração traz resultados extraordinários hoje. Aceite ajuda.' },
  3: { tema: 'Expressão', conselha: 'Sua voz é necessária. Compartilhe suas ideias criativas.' },
  4: { tema: 'Fundação', conselha: 'Construa algo duradouro. A estabilidade que você busca está ao alcance.' },
  5: { tema: 'Mudança', conselha: 'Abrace a liberdade. Novas experiências aguardam além da zona de conforto.' },
  6: { tema: 'Harmonia', conselha: 'Cuide das suas relações. O amor e a família são seu fortaleza hoje.' },
  7: { tema: 'Sabedoria Interior', conselha: 'Recolha-se em silêncio. As respostas que busca estão dentro de você.' },
  8: {'tema': 'Abundância', conselha: 'Suas ações estão alinhadas com prosperidade. Continue firme no propósito.' },
  9: { tema: 'Completude', conselha: 'Um ciclo está se encerrando. Honre as lições aprendidas e siga em frente.' },
  11: { tema: 'Iluminação', conselha: 'Você é um canal de luz. Permita que sua intuição guie outros.' },
  22: { tema: ' Mestre', conselha: 'Grandes realizações são possíveis quando você se conecta com algo maior.' },
  33: { tema: 'Serviço Espiritual', conselha: 'Sua presença cura naturalmente. Esteja disponível para quem precisa.' },
};

const DAY_THEMES = [
  { name: 'Domingo', element: 'Éter', orixa: 'Oxalá', color: 'from-amber-500/20 to-yellow-600/20' },
  { name: 'Segunda', element: 'Água', orixa: 'Yemanjá', color: 'from-blue-500/20 to-cyan-600/20' },
  { name: 'Terça', element: 'Fogo', orixa: 'Xangô', color: 'from-orange-500/20 to-red-600/20' },
  { name: 'Quarta', element: 'Ar', orixa: 'Iansã', color: 'from-purple-500/20 to-violet-600/20' },
  { name: 'Quinta', element: 'Fogo', orixa: 'Oxóssi', color: 'from-green-500/20 to-emerald-600/20' },
  { name: 'Sexta', element: 'Água', orixa: 'Oxum', color: 'from-pink-500/20 to-rose-600/20' },
  { name: 'Sábado', element: 'Terra', orixa: 'Omolu', color: 'from-slate-500/20 to-gray-600/20' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDayElement(): typeof DAY_THEMES[0] {
  const dayIndex = new Date().getDay();
  return DAY_THEMES[dayIndex];
}

function getUserElement(userData?: DailyPredictionCardProps['userData']): string {
  if (userData?.dataNascimento) {
    try {
      const lifePath = calculateLifePath(userData.dataNascimento);
      const elements = ['Fogo', 'Água', 'Terra', 'Ar', 'Éter', 'Fogo', 'Água', 'Terra', 'Ar'];
      return elements[(lifePath - 1) % 5] || 'Éter';
    } catch {
      // Fall through to day element
    }
  }
  return getDayElement().element;
}

function getLifePathInsight(lifePath: number): { tema: string; conselha: string } {
  return LIFE_PATH_INSIGHTS[lifePath] || LIFE_PATH_INSIGHTS[7];
}

// fallow-ignore-next-line complexity
function generatePrediction(
  dayElement: string,
  userElement: string,
  moonPhase: string,
  lifePath?: number
): Prediction[] {
  const combinedElement = dayElement === userElement ? dayElement : 
    ['Fogo', 'Água'].includes(dayElement) && ['Fogo', 'Água'].includes(userElement) ? 'Água' :
    ['Terra', 'Ar'].includes(dayElement) && ['Terra', 'Ar'].includes(userElement) ? 'Ar' :
    'Éter';

  const basePredictions = ELEMENT_PREDICTIONS[combinedElement] || ELEMENT_PREDICTIONS['Éter'];
  
  // Add moon phase influence
  const moonInfluences: Record<string, string> = {
    'Lua Nova': 'A lua nova traz renovação. Novos começos são favorecidos.',
    'Lua Crescente': 'A energia crescente fortalece suas intenções. Comece projetos agora.',
    'Lua Cheia': 'A lua cheia amplifica tudo. Este é um momento de iluminação e completude.',
    'Lua Minguante': 'A energia diminui, mas não desapareceu. Reflita e libere.',
  };

  const moonPrediction: Prediction = {
    area: 'Ciclo Lunar',
    icon: <Moon className="w-4 h-4" />,
    prediction: moonInfluences[moonPhase] || 'A lua continua seu ciclo eterno.',
    intensity: 2,
    color: 'text-slate-300',
  };

  return [...basePredictions, moonPrediction];
}

function getIntensityColor(intensity: number): string {
  switch (intensity) {
    case 3: return 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-amber-500/50';
    case 2: return 'bg-slate-800/40 border-slate-600/40';
    default: return 'bg-slate-800/20 border-slate-700/30';
  }
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function PredictionItem({ prediction }: { prediction: Prediction }) {
  return (
    <div className={cn('rounded-lg p-3 border transition-all hover:scale-[1.02]', getIntensityColor(prediction.intensity))}>
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg bg-slate-800/50', prediction.color)}>
          {prediction.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{prediction.area}</span>
            {prediction.intensity === 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Forte</span>
            )}
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{prediction.prediction}</p>
        </div>
      </div>
    </div>
  );
}

function DayHeader({ dayInfo, orixa, lifePathInsight }: { 
  dayInfo: typeof DAY_THEMES[0];
  orixa?: string;
  lifePathInsight?: { tema: string; conselha: string };
}) {
  return (
    <div className="relative">
      <div className={cn('absolute inset-0 rounded-t-xl bg-gradient-to-r', dayInfo.color)} />
      <div className="relative p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{dayInfo.name}</h3>
            <p className="text-xs text-white/70">Elemento: {dayInfo.element}</p>
          </div>
        </div>
        {orixa && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-white/60">Orixá do dia:</span>
            <span className="text-sm font-medium text-white/90">{orixa}</span>
          </div>
        )}
        {lifePathInsight && (
          <div className="mt-2 p-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-3 h-3 text-amber-300" />
              <span className="text-xs font-medium text-amber-300">{lifePathInsight.tema}</span>
            </div>
            <p className="text-xs text-white/80">{lifePathInsight.conselha}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OduOfDayBadge({ odu }: { odu: { nome: string; significado: string } }) {
  return (
    <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
      <span className="text-xs text-amber-300">Odu: {odu.nome}</span>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

// fallow-ignore-next-line complexity
export function DailyPredictionCard({ userData, className = '' }: DailyPredictionCardProps) {
  const dayInfo = getDayElement();
  const today = new Date();
  
  // Get spiritual data
  const oduDoDia = React.useMemo(() => getOduDoDia(today), [today]);
  const tarotDoDia = React.useMemo(() => getTarotCardDoDia(today), [today]);
  const orixasDoDia = React.useMemo(() => getOrixasDoDia(today), [today]);
  
  const userElement = React.useMemo(() => getUserElement(userData), [userData]);
  
  // Calculate life path if we have birth date
  const lifePath = React.useMemo(() => {
    if (userData?.dataNascimento) {
      try {
        return calculateLifePath(userData.dataNascimento);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }, [userData]);
  
  const lifePathInsight = React.useMemo(() => {
    return lifePath ? getLifePathInsight(lifePath) : undefined;
  }, [lifePath]);

  // Get user's orixá profile for affirmation
  const userOrixaProfile = React.useMemo(() => {
    if (userData?.orixaRegente) {
      return getProfileById(userData.orixaRegente.toLowerCase());
    }
    return undefined;
  }, [userData]);

  // Generate predictions
  const predictions = React.useMemo(() => {
    return generatePrediction(dayInfo.element, userElement, 'Lua Crescente', lifePath);
  }, [dayInfo.element, userElement, lifePath]);

  const dayOrixa = orixasDoDia[0]?.nome || dayInfo.orixa;

  return (
    <Card className={cn('card-spiritual overflow-hidden', className)}>
      {/* Day Header with gradient */}
      <DayHeader 
        dayInfo={dayInfo} 
        orixa={dayOrixa}
        lifePathInsight={lifePathInsight}
      />
      
      {/* Odu of the day */}
      {oduDoDia && (
        <div className="px-4 py-2 border-b border-slate-700/30">
          <OduOfDayBadge odu={{ nome: oduDoDia.nome, significado: oduDoDia.significado }} />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Previsões Personalizadas
          </CardTitle>
          {lifePath && (
            <span className="text-xs text-slate-500">Caminho: {lifePath}</span>
          )}
        </div>
        {userData?.nome && (
          <p className="text-xs text-slate-400 mt-1">
            Para {userData.nome}
            {userOrixaProfile && <span className="ml-1">• {userOrixaProfile.namePortuguese}</span>}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {predictions.map((prediction, index) => (
          <PredictionItem key={index} prediction={prediction} />
        ))}

        {/* Tarot card hint */}
        {tarotDoDia && (
          <div className="mt-4 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Carta do Tarot</span>
            </div>
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-purple-300">{tarotDoDia.nome}</span>
              {' — '}
              {tarotDoDia.significado}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DailyPredictionCard;
