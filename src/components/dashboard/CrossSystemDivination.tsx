'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Save,
  RefreshCw,
  Loader2,
  Star,
  Moon,
  Sun,
  Eye,
  Heart,
  Zap,
} from 'lucide-react';
import { odus } from '@/lib/data/spiritual-data';
import { ODU_TAROT_CORRELATIONS } from '@/lib/correlation/correlation-types';

// ============================================================
// TYPES
// ============================================================

export interface TarotCard {
  name: string;
  arcano: 'maior' | 'menor';
  number: number;
  suit?: string;
  image_url: string;
  meaning: string;
}

export interface AstrologicalAspect {
  sun_sign: string;
  moon_phase: string;
  rising_sign: string;
  major_aspects: string[];
}

export interface DivinationResult {
  id: string;
  timestamp: Date;
  cards: TarotCard[];
  odu: string;
  numerology: number;
  astrology: AstrologicalAspect;
  combined_message: string;
  ai_interpretation: string;
}

export interface CrossSystemDivinationProps {
  userData: UserSpiritualData;
  userId: string;
  className?: string;
  onDivinationComplete?: (result: DivinationResult) => void;
}

interface UserSpiritualData {
  id?: string;
  nome?: string;
  dataNascimento?: string;
  sign?: string;
  rashi?: string;
  numeroPessoal?: number;
  odu?: string;
  orixaRegente?: string;
  sefirotDominante?: string[];
  arcoMaior?: number[];
}

interface Spread {
  id: string;
  name: string;
  positions: string[];
}

interface CardRevealState {
  index: number;
  isRevealing: boolean;
  isRevealed: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const SPREADS: Spread[] = [
  { 
    id: 'three-card', 
    name: 'Três Cartas', 
    positions: ['Passado', 'Presente', 'Futuro'] 
  },
  { 
    id: 'five-card', 
    name: 'Cinco Cartas', 
    positions: ['Situação', 'Obstáculo', 'Base', 'Passado', 'Futuro'] 
  },
  { 
    id: 'celtic-cross', 
    name: 'Cruz Celta', 
    positions: [
      'Situação atual', 
      'Desafio', 
      'Base', 
      'Passado', 
      'Coroa', 
      'Futuro', 
      'Você', 
      'Ambiente', 
      'Esperanças', 
      'Resultado final'
    ] 
  }
];

const TAROT_MAJOR_ARCANA = [
  { number: 0, name: 'O Louco', meaning: 'Iniciação, liberdade, spontaneous new beginnings' },
  { number: 1, name: 'O Mago', meaning: 'Manifestação, recursos, habilidade, vontade' },
  { number: 2, name: 'A Sacerdotisa', meaning: 'Intuição, mistério, conhecimento inner' },
  { number: 3, name: 'A Imperatriz', meaning: 'Fertilidade, abundância, natureza, criatividade' },
  { number: 4, name: 'O Imperador', meaning: 'Autoridade, estrutura, liderança, estabilidade' },
  { number: 5, name: 'O Papa', meaning: 'Tradição, fé, espiritualidade, ensinamentos' },
  { number: 6, name: 'Os Enamorados', meaning: 'Escolha, união, relacionamentos, valores' },
  { number: 7, name: 'O Carro', meaning: 'Conquista, vitória, determinação, controle' },
  { number: 8, name: 'A Justiça', meaning: 'Verdade, lei, equilíbrio, causa e efeito' },
  { number: 9, name: 'O Eremita', meaning: 'Iluminação interior, solitude, sabedoria' },
  { number: 10, name: 'A Roda da Fortuna', meaning: 'Ciclos, destino, mudança, sorte' },
  { number: 11, name: 'A Força', meaning: 'Coragem, perseverança, compaixão, força interior' },
  { number: 12, name: 'O Enforcado', meaning: 'Sacrifício, nova perspectiva, inversão' },
  { number: 13, name: 'A Morte', meaning: 'Transformação, fim de ciclo, renascimento' },
  { number: 14, name: 'A Temperança', meaning: 'Equilíbrio, paciência, harmonia, moderação' },
  { number: 15, name: 'O Diabo', meaning: 'Tentação,.Materialismo, sombras, vícios' },
  { number: 16, name: 'A Torre', meaning: 'Mudança repentina, revelação, crise' },
  { number: 17, name: 'A Estrela', meaning: 'Esperança, inspiração, serenidade, renovação' },
  { number: 18, name: 'A Lua', meaning: 'Ilusão, intuição, inconsciente, medo' },
  { number: 19, name: 'O Sol', meaning: 'Sucesso, alegria, vitalidade, verdade' },
  { number: 20, name: 'O Julgamento', meaning: 'Renovação, redenção, julgamento, despertar' },
  { number: 21, name: 'O Mundo', meaning: 'Completude, realização, integração, viajes' },
];

const ASTROLOGICAL_SIGNS = [
  'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
];

const MOON_PHASES = [
  'Lua Nova', 'Lua Crescente', 'Lua Cheia', 'Lua Minguante'
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateId(): string {
  return `div-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function selectRandomCards(count: number): TarotCard[] {
  const shuffled = shuffleArray(TAROT_MAJOR_ARCANA);
  return shuffled.slice(0, count).map(card => ({
    name: card.name,
    arcano: 'maior' as const,
    number: card.number,
    image_url: `/tarot/${card.number.toString().padStart(2, '0')}.jpg`,
    meaning: card.meaning,
  }));
}

function selectRandomOdu(): string {
  const oduIndex = Math.floor(Math.random() * odus.length);
  return odus[oduIndex]?.nome || 'Ogbe';
}

function getUserNumerology(userData: UserSpiritualData): number {
  if (userData.numeroPessoal) return userData.numeroPessoal;
  
  // Calculate from date if available
  if (userData.dataNascimento) {
    const digits = userData.dataNascimento.replace(/\D/g, '');
    const sum = digits.split('').reduce((acc, d) => acc + parseInt(d), 0);
    return sum > 9 ? Math.floor(sum / 9) + (sum % 9) : sum;
  }
  
  return Math.floor(Math.random() * 9) + 1;
}

function getUserAstrology(userData: UserSpiritualData): AstrologicalAspect {
  const sunSign = userData.sign || ASTROLOGICAL_SIGNS[Math.floor(Math.random() * 12)];
  const moonPhase = MOON_PHASES[Math.floor(Math.random() * 4)];
  
  // Derive rising sign from sun sign
  const risingIndex = (ASTROLOGICAL_SIGNS.indexOf(sunSign) + Math.floor(Math.random() * 12)) % 12;
  const risingSign = ASTROLOGICAL_SIGNS[risingIndex];
  
  return {
    sun_sign: sunSign,
    moon_phase: moonPhase,
    rising_sign: risingSign,
    major_aspects: [
      `${sunSign}-${moonPhase}`,
      `Ascendente em ${risingSign}`,
    ],
  };
}

function findOduTarotCorrelation(oduName: string): string | null {
  const odu = odus.find(o => o.nome.toLowerCase() === oduName.toLowerCase());
  if (odu && ODU_TAROT_CORRELATIONS[odu.numero]) {
    return ODU_TAROT_CORRELATIONS[odu.numero];
  }
  return null;
}

function generateCombinedMessage(
  cards: TarotCard[],
  odu: string,
  numerology: number,
  astrology: AstrologicalAspect,
  userData: UserSpiritualData
): string {
  const cardNames = cards.map(c => c.name).join(', ');
  const oduInfo = odus.find(o => o.nome === odu);
  const oduMeaning = oduInfo?.significado || 'Um caminho de transformação';
  
  return `Pelos Arcanos do Tarot: ${cardNames}. ` +
    `O Odú ${odu} traz: ${oduMeaning}. ` +
    `Seu número pessoal ${numerology} revela sua essência vibracional. ` +
    `Com Sol em ${astrology.sun_sign}, Lua em ${astrology.moon_phase} e Ascendente em ${astrology.rising_sign}, ` +
    `seu mapa cósmico completa-se nesta leitura.`;
}

function generateAIInterpretation(result: DivinationResult): string {
  const primaryCard = result.cards[0];
  const oduData = odus.find(o => o.nome === result.odu);
  
  const interpretations = [
    `Os Arcanos revelam que ${primaryCard?.name} abre o caminho espiritual. `,
    oduData 
      ? `O Odú ${result.odu} traz ${oduData.significado.substring(0, 50)}... `
      : '',
    `Seu número pessoal ${result.numerology} pulsa em sintonia com ${result.astrology.sun_sign}. `,
    `A fase lunar ${result.astrology.moon_phase} amplifica a energia desta leitura.`,
  ].join('');

  
  return interpretations;
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface SpreadSelectorProps {
  spreads: Spread[];
  selectedSpread: Spread | null;
  onSelect: (spread: Spread) => void;
}

function SpreadSelector({ spreads, selectedSpread, onSelect }: SpreadSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 rounded-lg',
          'bg-slate-800/50 border border-slate-700/50',
          'hover:bg-slate-800/70 hover:border-slate-600/50',
          'transition-all duration-200'
        )}
      >
        <span className="text-slate-200 font-medium">
          {selectedSpread?.name || 'Selecione uma abertura'}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      
      {isOpen && (
        <div className={cn(
          'absolute z-10 w-full mt-2 py-2 rounded-lg',
          'bg-slate-800 border border-slate-700/50',
          'shadow-xl shadow-black/20'
        )}>
          {spreads.map((spread) => (
            <button
              key={spread.id}
              onClick={() => {
                onSelect(spread);
                setIsOpen(false);
              }}
              className={cn(
                'w-full px-4 py-2 text-left text-sm',
                'hover:bg-slate-700/50 transition-colors',
                selectedSpread?.id === spread.id && 'text-spiritual-gold'
              )}
            >
              {spread.name}
              <span className="ml-2 text-slate-500 text-xs">
                ({spread.positions.length} cartas)
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface CardProps {
  card: TarotCard | null;
  position: string;
  index: number;
  revealState: CardRevealState;
  onReveal: () => void;
}

function DivinationCard({ card, position, index, revealState, onReveal }: CardProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-slate-400 mb-2">{position}</span>
      <div
        onClick={!revealState.isRevealed ? onReveal : undefined}
        className={cn(
          'relative w-32 h-48 rounded-lg cursor-pointer',
          'transition-all duration-500 transform',
          revealState.isRevealing && 'animate-pulse scale-105',
          revealState.isRevealed && 'shadow-lg shadow-spiritual-gold/20'
        )}
        style={{
          transform: revealState.isRevealed 
            ? 'rotateY(180deg)' 
            : 'rotateY(0deg)',
          perspective: '1000px',
        }}
      >
        {/* Card Back */}
        <div
          className={cn(
            'absolute inset-0 rounded-lg',
            'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800',
            'border-2 border-spiritual-gold/30',
            'flex items-center justify-center',
            'backface-hidden'
          )}
        >
          <div className="w-16 h-16 rounded-full bg-spiritual-gold/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-spiritual-gold/40" />
          </div>
        </div>
        
        {/* Card Front */}
        <div
          className={cn(
            'absolute inset-0 rounded-lg',
            'bg-gradient-to-br from-slate-700 to-slate-800',
            'border-2 border-spiritual-violet/40',
            'flex flex-col items-center justify-center p-3',
            'backface-hidden',
            revealState.isRevealed ? 'rotateY(180deg)' : ''
          )}
        >
          <div className="text-2xl mb-2">
            {card?.number !== undefined ? (
              <span className="text-spiritual-gold font-bold">{card.number}</span>
            ) : '?'}
          </div>
          <div className="text-sm text-center font-medium text-slate-200">
            {card?.name || 'Carta'}
          </div>
          <div className="text-xs text-slate-400 mt-2 text-center line-clamp-2">
            {card?.meaning || ''}
          </div>
        </div>
      </div>
      
      {card && revealState.isRevealed && (
        <span className="text-xs text-spiritual-violet mt-2">#{index + 1}</span>
      )}
    </div>
  );
}

interface CorrelationBadgeProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}

function CorrelationBadge({ label, value, icon, color = 'slate' }: CorrelationBadgeProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg',
      `bg-${color === 'gold' ? 'spiritual-gold/10' : color === 'violet' ? 'spiritual-violet/10' : 'slate-800/50'}`,
      `border border-${color === 'gold' ? 'spiritual-gold/20' : color === 'violet' ? 'spiritual-violet/20' : 'slate-700/50'}`
    )}>
      <span className={cn(
        'text-sm',
        color === 'gold' ? 'text-spiritual-gold' : color === 'violet' ? 'text-spiritual-violet' : 'text-slate-400'
      )}>
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-sm text-slate-200">{value}</span>
      </div>
    </div>
  );
}

interface ResultPanelProps {
  result: DivinationResult;
  onSave: () => void;
  onReset: () => void;
}

function ResultPanel({ result, onSave, onReset }: ResultPanelProps) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className={cn(
      'rounded-xl p-6',
      'bg-gradient-to-br from-slate-800/80 to-slate-900/80',
      'border border-spiritual-gold/20',
      'animate-fadeIn'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-spiritual-gold" />
          <h3 className="text-lg font-semibold text-slate-200">Leitura Concluída</h3>
        </div>
        <span className="text-xs text-slate-500">
          {new Date(result.timestamp).toLocaleString('pt-BR')}
        </span>
      </div>
      
      {/* Cross-System Correlations */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CorrelationBadge 
          label="Odú"
          value={result.odu}
          icon={<Moon className="w-4 h-4" />}
          color="violet"
        />
        <CorrelationBadge 
          label="Número"
          value={result.numerology.toString()}
          icon={<Star className="w-4 h-4" />}
          color="gold"
        />
        <CorrelationBadge 
          label="Sol"
          value={result.astrology.sun_sign}
          icon={<Sun className="w-4 h-4" />}
        />
        <CorrelationBadge 
          label="Lua"
          value={result.astrology.moon_phase}
          icon={<Moon className="w-4 h-4" />}
        />
      </div>
      
      {/* Odu-Tarot Correlation */}
      {findOduTarotCorrelation(result.odu) && (
        <div className="mb-4 p-3 rounded-lg bg-spiritual-gold/5 border border-spiritual-gold/20">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-spiritual-gold" />
            <span className="text-xs text-spiritual-gold font-medium">Correlação Odu-Tarot</span>
          </div>
          <p className="text-sm text-slate-300">
            {result.odu} se correlaciona com <span className="text-spiritual-gold">{findOduTarotCorrelation(result.odu)}</span>
          </p>
        </div>
      )}
      
      {/* Combined Message */}
      <div className="mb-4">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full text-left"
        >
          <Eye className="w-4 h-4 text-spiritual-violet" />
          <span className="text-sm text-slate-300">Mensagem Combinada</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400 ml-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" />
          )}
        </button>
        
        {expanded && (
          <p className="mt-2 text-sm text-slate-400 leading-relaxed pl-6">
            {result.combined_message}
          </p>
        )}
      </div>
      
      {/* AI Interpretation */}
      <div className="p-4 rounded-lg bg-spiritual-violet/5 border border-spiritual-violet/20 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-spiritual-violet" />
          <span className="text-sm text-spiritual-violet font-medium">Interpretação do Oráculo</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {result.ai_interpretation}
        </p>
      </div>
      
      {/* Cards */}
      <div className="flex flex-wrap gap-2 mb-6">
        {result.cards.map((card, idx) => (
          <div 
            key={idx}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs',
              'bg-slate-700/50 border border-slate-600/50',
              'text-slate-300'
            )}
          >
            {card.name}
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onSave}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
            'bg-spiritual-gold/20 text-spiritual-gold',
            'hover:bg-spiritual-gold/30 transition-colors'
          )}
        >
          <Save className="w-4 h-4" />
          <span className="text-sm font-medium">Salvar Leitura</span>
        </button>
        <button
          onClick={onReset}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
            'bg-slate-700/50 text-slate-400',
            'hover:bg-slate-700 transition-colors'
          )}
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Nova Leitura</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

// fallow-ignore-next-line complexity
export function CrossSystemDivination({
  userData,
  userId,
  className,
  onDivinationComplete,
}: CrossSystemDivinationProps) {
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null);
  const [isDivining, setIsDivining] = useState(false);
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [revealStates, setRevealStates] = useState<CardRevealState[]>([]);
  
  const handleSpreadSelect = useCallback((spread: Spread) => {
    setSelectedSpread(spread);
    setResult(null);
    setRevealStates([]);
  }, []);
  
  const startDivination = useCallback(() => {
    if (!selectedSpread) return;
    
    setIsDivining(true);
    setResult(null);
    
    // Generate cards
    const cards = selectRandomCards(selectedSpread.positions.length);
    
    // Select Odu
    const odu = userData.odu || selectRandomOdu();
    
    // Get numerology
    const numerology = getUserNumerology(userData);
    
    // Get astrology
    const astrology = getUserAstrology(userData);
    
    // Generate combined message
    const combinedMessage = generateCombinedMessage(cards, odu, numerology, astrology, userData);
    
    // Create result
    const newResult: DivinationResult = {
      id: generateId(),
      timestamp: new Date(),
      cards,
      odu,
      numerology,
      astrology,
      combined_message: combinedMessage,
      ai_interpretation: '',
    };
    
    // Generate AI interpretation
    newResult.ai_interpretation = generateAIInterpretation(newResult);
    
    // Initialize reveal states
    setRevealStates(
      selectedSpread.positions.map(() => ({
        index: 0,
        isRevealing: false,
        isRevealed: false,
      }))
    );
    
    // Simulate async operation
    setTimeout(() => {
      setResult(newResult);
      setIsDivining(false);
      onDivinationComplete?.(newResult);
    }, 1500);
  }, [selectedSpread, userData, onDivinationComplete]);
  
  const revealCard = useCallback((index: number) => {
    setRevealStates(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isRevealing: true };
      return updated;
    });
    
    // After reveal animation, mark as revealed
    setTimeout(() => {
      setRevealStates(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], isRevealing: false, isRevealed: true };
        return updated;
      });
    }, 800);
  }, []);
  
  const revealAllCards = useCallback(() => {
    revealStates.forEach((state, index) => {
      if (!state.isRevealed && !state.isRevealing) {
        setTimeout(() => revealCard(index), index * 300);
      }
    });
  }, [revealStates, revealCard]);
  
  const resetDivination = useCallback(() => {
    setSelectedSpread(null);
    setResult(null);
    setRevealStates([]);
  }, []);
  
  const saveReading = useCallback(() => {
    // In a real app, this would save to a backend
    console.log('Saving reading:', result);
  }, [result]);
  
  // Auto-reveal cards when result is ready
  useEffect(() => {
    if (result && revealStates.length > 0) {
      const timer = setTimeout(() => {
        revealAllCards();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [result, revealStates.length, revealAllCards]);
  
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-spiritual-gold/20 to-spiritual-violet/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-spiritual-gold" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-200">Divinação Cruzada</h2>
          <p className="text-sm text-slate-400">Integração Tarot, Ifá, Numerologia e Astrologia</p>
        </div>
      </div>
      
      {/* Spread Selection */}
      {!result && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Escolha a Abertura
            </label>
            <SpreadSelector
              spreads={SPREADS}
              selectedSpread={selectedSpread}
              onSelect={handleSpreadSelect}
            />
          </div>
          
          {selectedSpread && (
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Posições da Abertura</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSpread.positions.map((pos, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs bg-slate-700/50 text-slate-400 border border-slate-600/30"
                  >
                    {idx + 1}. {pos}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Start Button */}
          <button
            onClick={startDivination}
            disabled={!selectedSpread || isDivining}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg',
              'bg-gradient-to-r from-spiritual-gold-dark via-spiritual-gold to-spiritual-gold-dark',
              'text-slate-900 font-semibold',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'hover:shadow-[var(--shadow-glow-gold)] transition-shadow',
              isDivining && 'animate-pulse'
            )}
          >
            {isDivining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Consultando os Arcanos...</span>
              </>
            ) : (
              <>
                <Shuffle className="w-4 h-4" />
                <span>Iniciar Divinação</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Cards Display */}
      {result && revealStates.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-300">
              {selectedSpread?.name}
            </h3>
            <span className="text-xs text-slate-500">
              {selectedSpread?.positions.length} cartas
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {selectedSpread?.positions.map((position, index) => (
              <DivinationCard
                key={index}
                card={result.cards[index] || null}
                position={position}
                index={index}
                revealState={revealStates[index] || { index, isRevealing: false, isRevealed: false }}
                onReveal={() => revealCard(index)}
              />
            ))}
          </div>
          
          {/* Result Panel */}
          {revealStates.every(s => s.isRevealed) && (
            <ResultPanel
              result={result}
              onSave={saveReading}
              onReset={resetDivination}
            />
          )}
        </div>
      )}
      
      {/* User Context Info */}
      {userData && (
        <div className={cn(
          'p-4 rounded-lg',
          'bg-slate-800/30 border border-slate-700/30'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-spiritual-violet" />
            <span className="text-sm font-medium text-slate-300">Seus Dados Espirituais</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {userData.nome && (
              <span className="text-slate-400">Nome: <span className="text-slate-300">{userData.nome}</span></span>
            )}
            {userData.sign && (
              <span className="text-slate-400">Signo: <span className="text-slate-300">{userData.sign}</span></span>
            )}
            {userData.odu && (
              <span className="text-slate-400">Odú: <span className="text-slate-300">{userData.odu}</span></span>
            )}
            {userData.numeroPessoal && (
              <span className="text-slate-400">Número: <span className="text-slate-300">{userData.numeroPessoal}</span></span>
            )}
          </div>
        </div>
      )}
    </div>
);
}
