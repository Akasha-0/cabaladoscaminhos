'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { getSpread, SpreadPosition } from '@/lib/tarot/spreads';
import { drawCards, TarotCard } from '@/lib/tarot/cards';
import {
  Sparkles,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Star,
  Eye,
  EyeOff,
  AlignCenter,
  Target,
  TrendingUp,
  Clock,
  User,
  Users,
  Heart,
  Crown,
  Zap
} from 'lucide-react';

interface DrawnCard {
  card: TarotCard;
  position: SpreadPosition;
  isReversed: boolean;
  index: number;
  isRevealed: boolean;
  animationDelay: number;
}

interface CelticCrossReaderProps {
  onClose?: () => void;
}

export function CelticCrossReader({ onClose }: CelticCrossReaderProps) {
  const [spread, setSpread] = useState(getSpread('celtic-cross'));
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [expandedPositions, setExpandedPositions] = useState<Set<number>>(new Set());
  const [question, setQuestion] = useState('');
  const [showAllRevealed, setShowAllRevealed] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'drawing' | 'complete'>('idle');

  // Draw cards for the spread
  const handleDrawCards = useCallback(() => {
    if (!spread) return;
    setIsDrawing(true);
    setAnimationPhase('drawing');
    setShowAllRevealed(false);
    setSelectedPosition(null);
    setExpandedPositions(new Set());

    const cards = drawCards(spread.totalCards);
    const newDrawnCards: DrawnCard[] = cards.map((card, index) => ({
      card,
      position: spread.positions[index],
      isReversed: Math.random() < 0.25,
      index,
      isRevealed: false,
      animationDelay: index * 400
    }));

    // Animate cards one by one
    setDrawnCards(newDrawnCards);
    
    newDrawnCards.forEach((drawnCard, idx) => {
      setTimeout(() => {
        setDrawnCards(prev => prev.map((dc, i) => 
          i === idx ? { ...dc, isRevealed: true } : dc
        ));
      }, drawnCard.animationDelay);
    });

    setTimeout(() => {
      setIsDrawing(false);
      setAnimationPhase('complete');
    }, spread.totalCards * 400 + 600);
  }, [spread]);

  // Reset the spread
  const handleReset = useCallback(() => {
    setDrawnCards([]);
    setSelectedPosition(null);
    setExpandedPositions(new Set());
    setShowAllRevealed(false);
    setAnimationPhase('idle');
    setIsDrawing(false);
  }, []);

  // Toggle position expansion
  const togglePosition = (position: number) => {
    setExpandedPositions(prev => {
      const next = new Set(prev);
      if (next.has(position)) {
        next.delete(position);
      } else {
        next.add(position);
      }
      return next;
    });
  };

  // Reveal all cards at once
  const revealAll = () => {
    setShowAllRevealed(true);
    setDrawnCards(prev => prev.map(dc => ({ ...dc, isRevealed: true })));
  };

  // Get card meaning based on orientation
  const getMeaning = (drawnCard: DrawnCard): string => {
    const meanings = drawnCard.isReversed ? drawnCard.card.reversed : drawnCard.card.upright;
    return meanings[0];
  };

  // Get detailed interpretation for each position
  const getPositionInterpretation = (drawnCard: DrawnCard): string => {
    const position = drawnCard.position.position;
    const baseMeaning = getMeaning(drawnCard);
    const orientation = drawnCard.isReversed ? 'invertida' : 'ereta';
    
    const interpretations: Record<number, string> = {
      1: `A carta ${drawnCard.card.name} (${orientation}) representa sua situação atual. ${baseMeaning}`,
      2: `O obstáculo revelado por ${drawnCard.card.name} (${orientation}) indica ${baseMeaning}`,
      3: `A fundação representada por ${drawnCard.card.name} (${orientation}) mostra ${baseMeaning}`,
      4: `Seu passado recente, segundo ${drawnCard.card.name} (${orientation}): ${baseMeaning}`,
      5: `Seguindo o caminho atual, ${drawnCard.card.name} (${orientation}) indica ${baseMeaning}`,
      6: `No futuro próximo, ${drawnCard.card.name} (${orientation}) sugere ${baseMeaning}`,
      7: `Sua postura atual frente à situação, refletida por ${drawnCard.card.name} (${orientation}): ${baseMeaning}`,
      8: `As influências externas mostradas por ${drawnCard.card.name} (${orientation}): ${baseMeaning}`,
      9: `Suas esperanças e medos, iluminados por ${drawnCard.card.name} (${orientation}): ${baseMeaning}`,
      10: `O resultado final revelado por ${drawnCard.card.name} (${orientation}): ${baseMeaning}`
    };
    
    return interpretations[position] || baseMeaning;
  };

  // Position icon mapping
  const getPositionIcon = (position: number) => {
    const icons: Record<number, React.ReactElement> = {
      1: <Target className="w-4 h-4" />,
      2: <Zap className="w-4 h-4" />,
      3: <TrendingUp className="w-4 h-4" />,
      4: <Clock className="w-4 h-4" />,
      5: <TrendingUp className="w-4 h-4" />,
      6: <Clock className="w-4 h-4" />,
      7: <User className="w-4 h-4" />,
      8: <Users className="w-4 h-4" />,
      9: <Heart className="w-4 h-4" />,
      10: <Crown className="w-4 h-4" />
    };
    return icons[position] || <Star className="w-4 h-4" />;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-900/50 to-orange-900/50">
            <AlignCenter className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-100">Cruz Celta</h2>
            <p className="text-sm text-amber-200/60">Leitura completa de 10 posições</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>
        )}
      </div>

      {/* Question Input */}
      <Card className="border-amber-800/50 bg-gradient-to-br from-amber-950/50 to-orange-950/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-amber-200">
            <HelpCircle className="w-4 h-4" />
            Qual é a sua pergunta?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Faça uma pergunta específica ao tarot sobre a situação que deseja explorar..."
            className="min-h-[80px] bg-amber-950/30 border-amber-700/50 text-amber-100 placeholder:text-amber-200/40 resize-none"
          />
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!showAllRevealed && drawnCards.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={revealAll}
              className="border-amber-700/50 text-amber-300 hover:bg-amber-900/30"
            >
              <Eye className="w-4 h-4 mr-2" />
              Revelar Todas
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {drawnCards.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleReset}
              className="text-amber-300/70 hover:text-amber-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
          )}
          <Button 
            onClick={handleDrawCards}
            disabled={isDrawing}
            className="bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-600 hover:to-orange-600 text-amber-100"
          >
            {isDrawing ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Distribuindo...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Consultar as Cartas
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Spread Visualization */}
      {drawnCards.length > 0 && (
        <div className="relative">
          {/* Celtic Cross Layout */}
          <div className="relative flex items-center justify-center min-h-[500px]">
            {/* Cross Pattern SVG Background */}
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 800 600">
              <line x1="400" y1="50" x2="400" y2="550" stroke="currentColor" strokeWidth="2" className="text-amber-400" />
              <line x1="200" y1="250" x2="600" y2="250" stroke="currentColor" strokeWidth="2" className="text-amber-400" />
              <circle cx="400" cy="250" r="80" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-400" />
            </svg>

            {/* Cards Grid */}
            <div className="relative grid grid-cols-5 gap-8">
              {/* Row 1 */}
              <div />
              <PositionCard
                card={drawnCards[3]}
                isSelected={selectedPosition === 4}
                onSelect={() => setSelectedPosition(selectedPosition === 4 ? null : 4)}
                positionIndex={4}
              />
              <PositionCard
                card={drawnCards[1]}
                isSelected={selectedPosition === 2}
                onSelect={() => setSelectedPosition(selectedPosition === 2 ? null : 2)}
                positionIndex={2}
              />
              <PositionCard
                card={drawnCards[4]}
                isSelected={selectedPosition === 5}
                onSelect={() => setSelectedPosition(selectedPosition === 5 ? null : 5)}
                positionIndex={5}
              />
              <div />

              {/* Row 2 */}
              <div />
              <div />
              <PositionCard
                card={drawnCards[0]}
                isSelected={selectedPosition === 1}
                onSelect={() => setSelectedPosition(selectedPosition === 1 ? null : 1)}
                positionIndex={1}
                isCentral
              />
              <div />
              <div />

              {/* Row 3 */}
              <div />
              <PositionCard
                card={drawnCards[6]}
                isSelected={selectedPosition === 7}
                onSelect={() => setSelectedPosition(selectedPosition === 7 ? null : 7)}
                positionIndex={7}
              />
              <PositionCard
                card={drawnCards[2]}
                isSelected={selectedPosition === 3}
                onSelect={() => setSelectedPosition(selectedPosition === 3 ? null : 3)}
                positionIndex={3}
              />
              <PositionCard
                card={drawnCards[5]}
                isSelected={selectedPosition === 6}
                onSelect={() => setSelectedPosition(selectedPosition === 6 ? null : 6)}
                positionIndex={6}
              />
              <div />

              {/* Row 4 - Result */}
              <div />
              <div />
              <PositionCard
                card={drawnCards[9]}
                isSelected={selectedPosition === 10}
                onSelect={() => setSelectedPosition(selectedPosition === 10 ? null : 10)}
                positionIndex={10}
                isResult
              />
              <div />
              <div />

              {/* Row 5 - Bottom row */}
              <div />
              <div />
              <PositionCard
                card={drawnCards[7]}
                isSelected={selectedPosition === 8}
                onSelect={() => setSelectedPosition(selectedPosition === 8 ? null : 8)}
                positionIndex={8}
              />
              <div />
              <PositionCard
                card={drawnCards[8]}
                isSelected={selectedPosition === 9}
                onSelect={() => setSelectedPosition(selectedPosition === 9 ? null : 9)}
                positionIndex={9}
              />
            </div>
          </div>
        </div>
      )}

      {/* Interpretation Panel */}
      {selectedPosition !== null && drawnCards[selectedPosition - 1] && (
        <InterpretationPanel
          card={drawnCards[selectedPosition - 1]}
          interpretation={getPositionInterpretation(drawnCards[selectedPosition - 1])}
          onClose={() => setSelectedPosition(null)}
        />
      )}

      {/* All Positions List (Collapsible) */}
      {drawnCards.length > 0 && (
        <Card className="border-amber-800/50 bg-gradient-to-br from-amber-950/50 to-orange-950/50">
          <CardHeader>
            <Button
              variant="ghost"
              onClick={() => setExpandedPositions(prev => {
                const next = new Set(prev);
                if (next.size === 10) {
                  next.clear();
                } else {
                  [1,2,3,4,5,6,7,8,9,10].forEach(n => next.add(n));
                }
                return next;
              })}
              className="w-full justify-between text-amber-200 hover:text-amber-100"
            >
              <span className="flex items-center gap-2">
                <AlignCenter className="w-4 h-4" />
                Interpretações Detalhadas
              </span>
              <span className="text-sm text-amber-300/60">
                {expandedPositions.size === 10 ? 'Recolher' : 'Expandir'} Todas
              </span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {drawnCards.map((drawnCard, idx) => (
              <PositionAccordion
                key={idx}
                card={drawnCard}
                isExpanded={expandedPositions.has(drawnCard.position.position)}
                onToggle={() => togglePosition(drawnCard.position.position)}
                icon={getPositionIcon(drawnCard.position.position)}
                interpretation={getPositionInterpretation(drawnCard)}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Position Card Component
interface PositionCardProps {
  card: DrawnCard;
  isSelected: boolean;
  onSelect: () => void;
  positionIndex: number;
  isCentral?: boolean;
  isResult?: boolean;
}

function PositionCard({ card, isSelected, onSelect, positionIndex, isCentral, isResult }: PositionCardProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [showFront, setShowFront] = useState(false);

  useEffect(() => {
    if (card.isRevealed && !showFront) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setShowFront(true);
        setIsFlipping(false);
      }, 500);
      return () => clearTimeout(timer);
    } else if (!card.isRevealed) {
      setShowFront(false);
    }
  }, [card.isRevealed, showFront]);

  const sizeClasses = isCentral 
    ? 'w-28 h-40' 
    : isResult 
    ? 'w-32 h-44' 
    : 'w-20 h-28';

  return (
    <div
      className={`relative cursor-pointer perspective-1000 transition-transform ${
        isSelected ? 'scale-110 z-10' : 'hover:scale-105'
      }`}
      onClick={onSelect}
    >
      {/* Position Number */}
      <div className="absolute -top-2 -left-2 z-20 w-6 h-6 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg">
        <span className="text-xs font-bold text-amber-100">{positionIndex}</span>
      </div>

      <div
        className={`relative w-full h-full transition-transform duration-500 ${
          isFlipping ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: showFront 
            ? card.isReversed 
              ? 'rotate(180deg)' 
              : 'rotateY(0deg)'
            : 'rotateY(180deg)'
        }}
      >
        {/* Card Back */}
        <div
          className={`absolute w-full h-full rounded-xl bg-gradient-to-br from-amber-900 via-orange-900 to-amber-950 border-2 border-amber-500/30 shadow-lg flex items-center justify-center ${
            isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-amber-950' : ''
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute inset-2 rounded-lg border border-amber-500/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-400/50" />
            </div>
          </div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-2 w-4 h-4 border border-amber-400" />
            <div className="absolute top-2 right-2 w-4 h-4 border border-amber-400" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border border-amber-400" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border border-amber-400" />
          </div>
        </div>

        {/* Card Front */}
        <div
          className={`absolute w-full h-full rounded-xl bg-gradient-to-br from-amber-950 via-orange-950 to-red-950 border-2 shadow-lg flex flex-col items-center justify-center ${
            isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-amber-950' : ''
          } ${
            card.isReversed ? 'border-red-500/50' : 'border-amber-500/50'
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-amber-400/30" />
          <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-amber-400/30" />
          <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-amber-400/30" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-amber-400/30" />

          <div className="text-lg font-bold text-amber-300">
            {card.card.id}
          </div>

          <p className="text-[9px] text-center px-1 text-amber-200/90 font-medium leading-tight mt-1">
            {card.card.name}
          </p>

          {card.isReversed && (
            <div className="absolute top-1 right-1 bg-red-900/50 text-red-200 text-[8px] px-1 rounded">
              ↓
            </div>
          )}

          <div className="absolute bottom-1">
            <p className="text-[7px] text-amber-500/60">
              {card.card.arcana === 'major' ? 'MAIOR' : card.card.suit?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Interpretation Panel Component
interface InterpretationPanelProps {
  card: DrawnCard;
  interpretation: string;
  onClose: () => void;
}

function InterpretationPanel({ card, interpretation, onClose }: InterpretationPanelProps) {
  return (
    <Card className="border-amber-600/50 bg-gradient-to-br from-amber-950/80 to-orange-950/80 animate-in slide-in-from-bottom-4 duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-amber-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-700 to-orange-700 flex items-center justify-center">
              <span className="text-sm font-bold text-amber-100">{card.position.position}</span>
            </div>
            {card.position.name}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-amber-300/70">
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge 
              variant="outline" 
              className={`${
                card.isReversed 
                  ? 'bg-red-900/30 border-red-600/50 text-red-200' 
                  : 'bg-amber-900/30 border-amber-600/50 text-amber-200'
              }`}
            >
              {card.card.name}
            </Badge>
            <Badge variant="outline" className="border-amber-600/50 text-amber-200/70">
              {card.isReversed ? 'Invertido' : 'Ereto'}
            </Badge>
            <Badge variant="outline" className="border-amber-600/50 text-amber-200/70">
              {card.card.arcana === 'major' ? 'Arcanos Maiores' : card.card.suit}
            </Badge>
          </div>
          
          <p className="text-amber-100/90 leading-relaxed">{interpretation}</p>
          
          <Separator className="bg-amber-800/30" />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-amber-300/60 mb-1">Palavras-chave</p>
              <div className="flex flex-wrap gap-1">
                {(card.isReversed ? card.card.reversed : card.card.upright).slice(0, 4).map((kw, i) => (
                  <Badge key={i} variant="secondary" className="bg-amber-900/30 text-amber-200/80 text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-amber-300/60 mb-1">Elemento</p>
              <p className="text-amber-200/80">{card.card.element || 'N/A'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Position Accordion Component
interface PositionAccordionProps {
  card: DrawnCard;
  isExpanded: boolean;
  onToggle: () => void;
  icon: React.ReactElement;
  interpretation: string;
}

function PositionAccordion({ card, isExpanded, onToggle, icon, interpretation }: PositionAccordionProps) {
  return (
    <div className="border border-amber-800/30 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-amber-900/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            card.isReversed ? 'bg-red-900/30' : 'bg-amber-900/30'
          }`}>
            {icon}
          </div>
          <div className="text-left">
            <p className="font-medium text-amber-200">{card.position.name}</p>
            <p className="text-sm text-amber-300/60">
              {card.card.name} • {card.isReversed ? 'Invertido' : 'Ereto'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-amber-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-sm text-amber-100/80 leading-relaxed">
            {interpretation}
          </p>
        </div>
      )}
    </div>
  );
}

export default CelticCrossReader;