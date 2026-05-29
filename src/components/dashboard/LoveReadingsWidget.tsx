'use client';

import React, { useState, useMemo } from 'react';
import { Heart, Sparkles, Users, Crown, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { drawCards, MAJOR_ARCANA } from '@/lib/tarot/cards';
import { getProfileById, getProfiles } from '@/lib/orixa/orixa-profiles';
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
  id: number;
  name: string;
  meaning: string;
  interpretation: string;
}

interface CompatibilityResult {
  score: number;
  label: string;
  description: string;
  elements: string[];
}

interface HeartChakraState {
  energy: number;
  status: 'balanced' | 'low' | 'high';
  tip: string;
}

// ============================================================
// CONSTANTS
// ============================================================

// Love-specific tarot card interpretations
const LOVE_TAROT_INTERPRETATIONS: Record<string, { upright: string; reversed: string }> = {
  'The Lovers': { upright: 'Harmonia no amor, escolhas do coração, união sagrada', reversed: 'Desequilíbrio, conflitos internos, falta de clareza emocional' },
  'The Sun': { upright: 'Felicidade no relacionamento, luz interior refletida no outro', reversed: 'Problemas de autoestimia afetando o relacionamento' },
  'The Empress': { upright: 'Abundância emocional, fertilidade do amor, nutrição', reversed: 'Ciúmes, possessividade, negligência emocional' },
  'The Star': { upright: 'Esperança, cura emocional, renovação do amor', reversed: 'Desesperança, dificuldade de confiar' },
  'The Moon': { upright: 'Ilusão no amor, necessidade de discernimento', reversed: 'Confiança retornando, clareza emocional' },
  'The Temperance': { upright: 'Equilíbrio no relacionamento, paciência, harmonia', reversed: 'Desequilíbrio, excesso em uma direção' },
  'The Fool': { upright: 'Novos começos, amor espontâneo, pureza de sentimentos', reversed: 'Infantilidade emocional, decisões apressadas' },
};

// Zodiac to Orixá compatibility matrix (simplified)
const ZODIAC_ELEMENT_MAP: Record<string, string> = {
  aries: 'fogo', touro: 'terra', gemeos: 'ar', cancer: 'agua',
  leao: 'fogo', virgem: 'terra', libra: 'ar', escorpio: 'agua',
  sagitario: 'fogo', capricornio: 'terra', aquario: 'ar', peixes: 'agua',
};

// Element harmony for compatibility
const ELEMENT_COMPATIBILITY: Record<string, Record<string, number>> = {
  fogo: { fogo: 60, terra: 40, ar: 80, agua: 30 },
  terra: { fogo: 40, terra: 80, ar: 50, agua: 90 },
  ar: { fogo: 80, terra: 50, ar: 70, agua: 60 },
  agua: { fogo: 30, terra: 90, ar: 60, agua: 80 },
};

// Orixá to element mapping
const ORIXA_ELEMENT_MAP: Record<string, string> = {
  'oxum': 'agua', 'iemanja': 'agua', 'oxossi': 'ar', 'ogum': 'fogo',
  'oxala': 'terra', 'shango': 'fogo', 'obatala': 'terra', 'nanã': 'agua',
  'orunmila': 'ar', 'omolu': 'terra', 'oyá': 'fogo', 'ewe': 'agua',
};

// Love affirmations by Orixá
const ORIXA_LOVE_AFFIRMATIONS: Record<string, string[]> = {
  oxum: [
    'Meu amor flui como águas cristalinas, atraindo prosperidade emocional',
    'Sou merecedora de um amor que me nutre e me valoriza',
    'A energia sagrada do amor de Oxum me orienta em minhas relações',
  ],
  iemanja: [
    'O amor de Iemanjá me banha em compaixão e profundidade emocional',
    'Permito que as águas do amor me levem à minha verdadeira conexão',
    'Sou cercada pelo abraço amoroso da Mãe das Águas',
  ],
  oxala: [
    'A paz de Oxalá guia meu coração em todas as minhas relações',
    'Eu atraio unions sagradas e harmoniosas',
    'O amor puro de Oxalá habita no meu coração',
  ],
  oxossi: [
    'O amor surge em mim como flecha certeira, direto ao coração',
    'Permito que a caça espiritual me leve ao amor verdadeiro',
    'Minhas relações são marcadas pela leveza e alegria de Oxossi',
  ],
  ogum: [
    'Tenho coragem para lutar pelo amor que mereço',
    'A força de Ogum me protege em meus relacionamentos',
    'Transcendo conflitos com a coragem do guerreiro',
  ],
  nanã: [
    'A sabedoria de Nanã me ajuda a compreender a profundidade do amor',
    'Aceito todas as fases do amor, incluindo a transformação',
    'O amor de Nanã traz maturidade emocional',
  ],
  orunmila: [
    'A sabedoria de Orunmila me guia nas escolhas amorosas',
    'Confio no destino amoroso que foi preparado para mim',
    'O conhecimento sagrado orienta minhas relações',
  ],
  omolu: [
    'A cura de Omolu me liberta de feridas passadas no amor',
    'Permito que o novo amor cure antigas dores',
    'A transformação de Omolu renova meu coração',
  ],
  oya: [
    'A força de Oyá me ajuda a superar desafios no amor',
    'Permito que os ventos da mudança tragam novos amores',
    'A paixão de Oyá incendia meu coração',
  ],
  shango: [
    'A energia de Shango traz paixão e equilíbrio ao amor',
    'O fogo de Shango aquece meu coração',
    'Permito que a eletricidade do amor ilumine minhas relações',
  ],
  default: [
    'O amor divino flui através de mim como energia sagrada',
    'Sou merecedora de um amor verdadeiro e espiritual',
    'A força do amor ilumina meu caminho espiritual',
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
  if (!orixaName) return 'default';
  return orixaName.toLowerCase().replace(/[^a-z]/g, '') || 'default';
}

function getDailyLoveCard(): LoveTarotCard {
  const daySeed = getDayOfYear();
  const loveCards = [
    { id: 6, name: 'The Lovers', interpretation: 'Escolhas do coração, união de almas gêmeas' },
    { id: 3, name: 'The Empress', interpretation: 'Amor abundante, fertilidade emocional' },
    { id: 17, name: 'The Star', interpretation: 'Esperança no amor, cura emocional' },
    { id: 18, name: 'The Moon', interpretation: 'Intuição no amor, conexão subconscious' },
    { id: 19, name: 'The Sun', interpretation: 'Alegria, vitalidade no relacionamento' },
    { id: 0, name: 'The Fool', interpretation: 'Novos começos, amor espontâneo' },
  ];
  
  // Use day seed for consistent daily card
  const cardIndex = daySeed % loveCards.length;
  const card = loveCards[cardIndex];
  
  const meanings = LOVE_TAROT_INTERPRETATIONS[card.name] || {
    upright: 'O amor sagrado ilumina seu caminho hoje',
    reversed: 'Reflita sobre suas emoções antes de agir',
  };
  
  return {
    id: card.id,
    name: card.name,
    meaning: meanings.upright,
    interpretation: card.interpretation,
  };
}

function calculateCompatibility(userOrixa?: string, partnerSign?: string): CompatibilityResult {
  if (!userOrixa && !partnerSign) {
    return {
      score: 75,
      label: 'Harmonia Espiritual',
      description: 'A energia espiritual está favorável para relacionamentos hoje',
      elements: ['Amor universal', 'Conexão alma-a-alma'],
    };
  }
  
  let score = 50;
  const elements: string[] = [];
  
  if (userOrixa) {
    const orixaKey = getOrixaKey(userOrixa);
    const orixaElement = ORIXA_ELEMENT_MAP[orixaKey] || 'terra';
    elements.push(`Elemento: ${orixaElement.charAt(0).toUpperCase() + orixaElement.slice(1)}`);
    
    // Orixá-specific bonuses
    const profile = getProfileById(orixaKey);
    if (profile) {
      score += 15;
      elements.push(`Qualidade: ${profile.archetype}`);
    }
  }
  
  if (partnerSign) {
    const signLower = partnerSign.toLowerCase();
    const partnerElement = ZODIAC_ELEMENT_MAP[signLower] || 'terra';
    
    const userOrixaKey = getOrixaKey(userOrixa);
    const userElement = ORIXA_ELEMENT_MAP[userOrixaKey] || 'terra';
    
    const compatibilityScore = ELEMENT_COMPATIBILITY[userElement]?.[partnerElement] || 50;
    
    score = (score + compatibilityScore) / 2;
    elements.push(`Signo do parceiro: ${partnerSign}`);
  }
  
  // Get today's spiritual energy bonus
  const todayCorrelation = getTodayCorrelation();
  if (todayCorrelation) {
    score = Math.min(100, score + 10);
    elements.push(`Dia favorecido: ${todayCorrelation.orixa}`);
  }
  
  const label = score >= 80 ? 'Compatibilidade Alta' :
                score >= 60 ? 'Boa Harmonia' :
                score >= 40 ? 'Necessita Atenção' : 'Desafios no Amor';
  
  const descriptions: Record<string, string> = {
    'Compatibilidade Alta': 'As estrelas indicam uma conexão forte e harmoniosa entre vocês',
    'Boa Harmonia': 'Há potencial para um relacionamento saudável com trabalho mútuo',
    'Necessita Atenção': 'Este é um momento para comunicação e compreensão mútua',
    'Desafios no Amor': 'A jornada amorosa traz lições, mas cada desafio fortalece o vínculo',
  };
  
  return {
    score: Math.round(score),
    label,
    description: descriptions[label] || 'O amor está em constante evolução',
    elements,
  };
}

function getHeartChakraState(): HeartChakraState {
  const dayOfWeek = new Date().getDay();
  const baseEnergy = 65;
  
  // Adjust based on day - hearts are more open on certain days
  const dayModifier = dayOfWeek === 5 ? 15 : // Friday (Venus day - love)
                      dayOfWeek === 0 ? 10 : // Sunday
                      dayOfWeek === 3 ? 5 : 0; // Wednesday
  
  const energy = Math.min(100, baseEnergy + dayModifier);
  
  const status: HeartChakraState['status'] = 
    energy >= 80 ? 'balanced' :
    energy >= 50 ? 'low' : 'high';
  
  const tips: Record<string, string> = {
    balanced: 'Continue nutrindo seu coração com práticas de amor próprio',
    low: 'Pratique o perdão e abra espaço para novas conexões',
    high: 'Equilibre a energia do coração com discernment spiritual',
  };
  
  return {
    energy,
    status,
    tip: tips[status],
  };
}

function getDailyAffirmation(orixaKey: string): string {
  const affirmations = ORIXA_LOVE_AFFIRMATIONS[orixaKey] || ORIXA_LOVE_AFFIRMATIONS['default'];
  const dayIndex = getDayOfYear() % affirmations.length;
  return affirmations[dayIndex];
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function HeartChakraIndicator({ energy, status, tip }: HeartChakraState) {
  const statusColors = {
    balanced: 'text-emerald-400',
    low: 'text-rose-400',
    high: 'text-pink-400',
  };
  
  const statusBgColors = {
    balanced: 'bg-emerald-500',
    low: 'bg-rose-500',
    high: 'bg-pink-500',
  };
  
  return (
    <div className="bg-gradient-to-br from-rose-900/30 to-pink-900/20 rounded-lg p-4 border border-rose-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className={`w-4 h-4 ${statusColors[status]}`} />
          <span className="text-sm font-medium text-rose-200">Chakra do Coração</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusBgColors[status]}/20 ${statusColors[status]}`}>
          {status === 'balanced' ? 'Equilibrado' : status === 'low' ? 'Abertura' : 'Ativo'}
        </span>
      </div>
      
      <div className="mb-3">
        <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-rose-500 to-pink-400"
            style={{ width: `${energy}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-500">Bloqueado</span>
          <span className="text-sm font-bold text-rose-400">{energy}%</span>
          <span className="text-xs text-slate-500">Aberto</span>
        </div>
      </div>
      
      <p className="text-xs text-slate-400 italic">{tip}</p>
    </div>
  );
}

function LoveCardDisplay({ card }: { card: LoveTarotCard }) {
  return (
    <div className="bg-gradient-to-br from-pink-900/30 to-purple-900/20 rounded-lg p-4 border border-pink-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-pink-400" />
        <span className="text-sm font-medium text-pink-200">Carta do Amor do Dia</span>
      </div>
      
      <div className="bg-slate-800/30 rounded-lg p-4 mb-3">
        <h4 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
          {card.name}
        </h4>
        <p className="text-sm text-slate-300 mb-2">{card.interpretation}</p>
        <p className="text-sm text-rose-300 italic">{card.meaning}</p>
      </div>
      
      <div className="flex items-center justify-center gap-1 text-xs text-pink-300">
        <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
        <span>Energia do amor ativa hoje</span>
      </div>
    </div>
  );
}

function CompatibilityDisplay({ result }: { result: CompatibilityResult }) {
  const getScoreColor = (score: number) =>
    score >= 80 ? 'text-emerald-400' :
    score >= 60 ? 'text-amber-400' :
    score >= 40 ? 'text-orange-400' : 'text-rose-400';
  
  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/20 rounded-lg p-4 border border-purple-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-medium text-purple-200">Verificação de Compatibilidade</span>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32" cy="32" r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-slate-700"
            />
            <circle
              cx="32" cy="32" r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${(result.score / 100) * 175.9} 175.9`}
              className={getScoreColor(result.score)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${getScoreColor(result.score)}`}>
              {result.score}%
            </span>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-slate-200">{result.label}</h4>
          <p className="text-xs text-slate-400 mt-1">{result.description}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {result.elements.map((el, i) => (
          <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
            {el}
          </span>
        ))}
      </div>
    </div>
  );
}

function AffirmationDisplay({ affirmation }: { affirmation: string }) {
  return (
    <div className="bg-gradient-to-br from-rose-900/30 to-orange-900/20 rounded-lg p-4 border border-rose-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Crown className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-amber-200">Afirmação de Amor</span>
      </div>
      <blockquote className="text-sm text-slate-200 italic leading-relaxed">
        &ldquo;{affirmation}&rdquo;
      </blockquote>
    </div>
  );
}

function OrixaCompatibilityDisplay({ userOrixa }: { userOrixa?: string }) {
  const profiles = getProfiles();
  const userProfile = userOrixa ? getProfileById(getOrixaKey(userOrixa)) : null;
  
  if (!userProfile) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-lg p-4 border border-slate-600/20">
        <p className="text-xs text-slate-400 text-center">
          Conecte seu Orixá para ver compatibilidade espiritual
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-indigo-900/30 to-blue-900/20 rounded-lg p-4 border border-indigo-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-indigo-200">Orixá {userProfile.name}</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Arquétipo</span>
          <span className="text-sm text-indigo-300">{userProfile.archetype}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Elemento</span>
          <span className="text-sm text-indigo-300">{userProfile.element}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Qualidades</span>
          <span className="text-xs text-indigo-300">{userProfile.qualities[0]}, {userProfile.qualities[1]}</span>
        </div>
      </div>
      
      {userProfile.affirmation && (
        <p className="text-xs text-slate-500 mt-3 italic">
          &ldquo;{userProfile.affirmation}&rdquo;
        </p>
      )}
    </div>
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
  
  // Calculate all readings
  const dailyCard = useMemo(() => getDailyLoveCard(), [refreshKey]);
  const compatibility = useMemo(() => calculateCompatibility(userOrixa, partnerSign), [refreshKey, userOrixa, partnerSign]);
  const heartChakra = useMemo(() => getHeartChakraState(), [refreshKey]);
  const affirmation = useMemo(() => getDailyAffirmation(getOrixaKey(userOrixa)), [refreshKey, userOrixa]);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <Card className={`card-spiritual ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5 text-rose-400" />
            <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
              Leituras de Amor
            </span>
          </CardTitle>
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-full hover:bg-slate-700/50 transition-colors"
            title="Atualizar leituras"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Daily Love Card */}
        <LoveCardDisplay card={dailyCard} />
        
        {/* Compatibility Check */}
        <CompatibilityDisplay result={compatibility} />
        
        {/* Heart Chakra */}
        <HeartChakraIndicator {...heartChakra} />
        
        {/* Orixá Profile */}
        <OrixaCompatibilityDisplay userOrixa={userOrixa} />
        
        {/* Love Affirmation */}
        <AffirmationDisplay affirmation={affirmation} />
        
        {/* Footer tip */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-500">
            ✨ As leituras são baseadas na energia espiritual do momento
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default LoveReadingsWidget;