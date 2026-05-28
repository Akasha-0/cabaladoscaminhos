'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getSpread, getAllSpreadTypes, SpreadType, TarotSpread, SpreadPosition } from '@/lib/tarot/spreads';
import { drawCards, TarotCard } from '@/lib/tarot/cards';
import {
  Sparkles,
  RotateCcw,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  HelpCircle,
  Star
} from 'lucide-react';

interface DrawnCard {
  card: TarotCard;
  position: SpreadPosition;
  isReversed: boolean;
  index: number;
  isRevealed: boolean;
}

interface SpreadReaderProps {
  initialSpreadType?: SpreadType;
}

export function SpreadReader({ initialSpreadType = 'three-card' }: SpreadReaderProps) {
  const [spreadType, setSpreadType] = useState<SpreadType>(initialSpreadType);
  const [spread, setSpread] = useState<TarotSpread | null>(null);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize spread
  useEffect(() => {
    const s = getSpread(spreadType);
    setSpread(s);
  }, [spreadType]);

  // Draw cards for the spread
  const handleDrawCards = useCallback(() => {
    if (!spread) return;

    setIsDrawing(true);
    setHasDrawn(false);
    setSelectedPosition(null);

    // Simulate drawing animation
    setTimeout(() => {
      const cards = drawCards(spread.totalCards);
      const drawn: DrawnCard[] = cards.map((card, index) => ({
        card,
        position: spread.positions[index],
        isReversed: Math.random() > 0.7, // ~30% chance of reversal
        index,
        isRevealed: false
      }));

      setDrawnCards(drawn);
      setIsDrawing(false);
      setHasDrawn(true);

      // Reveal cards one by one
      drawn.forEach((_, i) => {
        setTimeout(() => {
          setDrawnCards(prev =>
            prev.map((c, idx) =>
              idx === i ? { ...c, isRevealed: true } : c
            )
          );
        }, (i + 1) * 600);
      });
    }, 500);
  }, [spread]);

  // Reset the spread
  const handleReset = useCallback(() => {
    setDrawnCards([]);
    setHasDrawn(false);
    setSelectedPosition(null);
  }, []);

  // Change spread type
  const handleSpreadChange = useCallback((type: SpreadType) => {
    setSpreadType(type);
    setDrawnCards([]);
    setHasDrawn(false);
    setSelectedPosition(null);
  }, []);

  const getMeaning = (drawnCard: DrawnCard): string => {
    const meanings = drawnCard.isReversed
      ? drawnCard.card.reversed
      : drawnCard.card.upright;
    return meanings.join(' ');
  };

  const getOrientationLabel = (isReversed: boolean): string => {
    return isReversed ? 'Invertido' : 'Ereto';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-950/50 to-orange-950/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-2xl text-amber-100">
                  Leitor de Espelhos
                </CardTitle>
                <p className="text-sm text-amber-200/70">
                  Descubra mensagens dos cosmos através dos arcanos
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Spread Type Selector */}
      <Card className="border-orange-500/20 bg-orange-950/30">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            {getAllSpreadTypes().map((type) => (
              <Button
                key={type}
                variant={spreadType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSpreadChange(type)}
                className={`${
                  spreadType === type
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'border-amber-500/30 text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                {type === 'celtic-cross' && 'Cruz Celta'}
                {type === 'three-card' && 'Três Cartas'}
                {type === 'single-card' && 'Carta Única'}
              </Button>
            ))}
          </div>

          {spread && (
            <div className="mt-4 text-sm text-orange-200/80">
              <p>{spread.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Draw Button */}
      {!hasDrawn && (
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-orange-950/30">
          <CardContent className="pt-6 pb-6 flex flex-col items-center gap-4">
            <Button
              onClick={handleDrawCards}
              disabled={isDrawing}
              size="lg"
              className="bg-amber-600 hover:bg-amber-500 text-white gap-2 px-8"
            >
              {isDrawing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Desembaralhando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Desenhar Cartas
                </>
              )}
            </Button>
            <p className="text-sm text-amber-200/60">
              {spread ? `${spread.totalCards} cartas serão reveladas` : 'Selecione um espelho'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cards Grid */}
      {hasDrawn && drawnCards.length > 0 && (
        <>
          {/* Spread Layout */}
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-950/40 to-orange-950/40">
            <CardContent className="pt-6">
              {/* Celtic Cross Layout */}
              {spreadType === 'celtic-cross' && (
                <div className="relative">
                  <div className="grid grid-cols-5 gap-4">
                    {/* Row 1: Positions 1-5 */}
                    {[0, 1, 2, 3, 4].map((idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center"
                      >
                        <CardFlip
                          card={drawnCards[idx]}
                          isRevealed={drawnCards[idx].isRevealed}
                          onClick={() => setSelectedPosition(idx)}
                          isSelected={selectedPosition === idx}
                          size="md"
                        />
                        <div className="mt-2 text-center">
                          <p className="text-xs font-medium text-amber-300">
                            {drawnCards[idx].position.name}
                          </p>
                          <p className="text-[10px] text-amber-500/60 line-clamp-1">
                            #{drawnCards[idx].position.position}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Row 2: Positions 6-10 */}
                    {[5, 6, 7, 8, 9].map((idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center"
                      >
                        <CardFlip
                          card={drawnCards[idx]}
                          isRevealed={drawnCards[idx].isRevealed}
                          onClick={() => setSelectedPosition(idx)}
                          isSelected={selectedPosition === idx}
                          size="md"
                        />
                        <div className="mt-2 text-center">
                          <p className="text-xs font-medium text-amber-300">
                            {drawnCards[idx].position.name}
                          </p>
                          <p className="text-[10px] text-amber-500/60 line-clamp-1">
                            #{drawnCards[idx].position.position}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Three Card Layout */}
              {spreadType === 'three-card' && (
                <div className="flex flex-col items-center gap-6">
                  <div className="flex gap-8 justify-center">
                    {drawnCards.map((drawn, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <CardFlip
                          card={drawn}
                          isRevealed={drawn.isRevealed}
                          onClick={() => setSelectedPosition(idx)}
                          isSelected={selectedPosition === idx}
                          size="lg"
                        />
                        <div className="mt-3 text-center">
                          <Badge
                            variant="outline"
                            className="border-amber-500/30 text-amber-300 mb-1"
                          >
                            {drawn.position.name}
                          </Badge>
                          <p className="text-xs text-amber-500/60">
                            {drawn.position.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Single Card Layout */}
              {spreadType === 'single-card' && (
                <div className="flex flex-col items-center gap-6">
                  <CardFlip
                    card={drawnCards[0]}
                    isRevealed={drawnCards[0].isRevealed}
                    onClick={() => setSelectedPosition(0)}
                    isSelected={selectedPosition === 0}
                    size="xl"
                  />
                  <div className="text-center">
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 text-amber-300"
                    >
                      {drawnCards[0].position.name}
                    </Badge>
                    <p className="text-sm text-amber-500/60 mt-2">
                      {drawnCards[0].position.description}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Card Details */}
          {selectedPosition !== null && drawnCards[selectedPosition] && (
            <Card className="border-amber-500/20 bg-gradient-to-br from-amber-950/50 to-orange-950/50">
              <CardHeader>
                <CardTitle className="text-amber-100 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  {drawnCards[selectedPosition].card.name}
                  <Badge
                    variant={drawnCards[selectedPosition].isReversed ? 'destructive' : 'default'}
                    className={drawnCards[selectedPosition].isReversed ? 'bg-red-900/50' : 'bg-amber-600/50'}
                  >
                    {getOrientationLabel(drawnCards[selectedPosition].isReversed)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-amber-300 mb-2">
                    Posição: {drawnCards[selectedPosition].position.name}
                  </p>
                  <p className="text-sm text-amber-200/70">
                    {drawnCards[selectedPosition].position.description}
                  </p>
                </div>

                <Separator className="bg-amber-500/20" />

                <div>
                  <p className="text-sm font-medium text-amber-300 mb-2">
                    Significado {drawnCards[selectedPosition].isReversed ? 'Invertido' : 'Ereto'}:
                  </p>
                  <p className="text-amber-100/90 leading-relaxed">
                    {getMeaning(drawnCards[selectedPosition])}
                  </p>
                </div>

                {drawnCards[selectedPosition].card.arcana === 'major' && (
                  <div className="flex items-center gap-2 mt-4">
                    <Badge className="bg-amber-600/30 text-amber-200 border-amber-500/30">
                      Arcano Maior
                    </Badge>
                    {drawnCards[selectedPosition].card.element && (
                      <Badge variant="outline" className="border-orange-500/30 text-orange-300">
                        {drawnCards[selectedPosition].card.element}
                      </Badge>
                    )}
                    {drawnCards[selectedPosition].card.astro && (
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                        {drawnCards[selectedPosition].card.astro}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* All Positions Overview */}
          <Card className="border-orange-500/20 bg-orange-950/30">
            <CardHeader>
              <CardTitle className="text-lg text-amber-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                Visão Geral das Posições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {drawnCards.map((drawn, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedPosition === idx
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-amber-500/20 bg-amber-950/20 hover:bg-amber-500/5'
                    }`}
                    onClick={() => setSelectedPosition(idx)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-10 rounded border border-amber-500/30 bg-gradient-to-br from-amber-900/50 to-orange-900/50 flex items-center justify-center">
                        {drawn.isRevealed ? (
                          <span className="text-xs font-bold text-amber-300">
                            {drawn.card.id}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-500">?</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-amber-200">
                            {drawn.position.name}
                          </p>
                          {drawn.isRevealed && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1 py-0 ${
                                drawn.isReversed
                                  ? 'border-red-500/30 text-red-300'
                                  : 'border-green-500/30 text-green-300'
                              }`}
                            >
                              {drawn.isReversed ? 'Inv' : 'Eret'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-amber-300/60 line-clamp-1">
                          {drawn.position.description}
                        </p>
                        {drawn.isRevealed && (
                          <p className="text-xs text-amber-400/80 mt-1 line-clamp-2">
                            {drawn.card.name} — {drawn.isReversed ? drawn.card.reversed[0] : drawn.card.upright[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Nova Leitura
            </Button>
            <Button
              variant="outline"
              onClick={handleDrawCards}
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Reembaralhar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// Card Flip Component with Animation
interface CardFlipProps {
  card: DrawnCard;
  isRevealed: boolean;
  onClick: () => void;
  isSelected: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

function CardFlip({ card, isRevealed, onClick, isSelected, size = 'md' }: CardFlipProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [showFront, setShowFront] = useState(false);

  useEffect(() => {
    if (isRevealed && !showFront) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setShowFront(true);
        setIsFlipping(false);
      }, 500);
      return () => clearTimeout(timer);
    } else if (!isRevealed) {
      setShowFront(false);
    }
  }, [isRevealed, showFront]);

  const sizeClasses = {
    sm: 'w-16 h-24',
    md: 'w-24 h-36',
    lg: 'w-32 h-48',
    xl: 'w-40 h-60'
  };

  const numberSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div
      className={`relative cursor-pointer perspective-1000 ${sizeClasses[size]}`}
      onClick={onClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipping ? 'rotate-y-180' : ''
        } ${showFront ? 'rotate-0' : 'rotate-y-180'}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: card.isReversed && showFront ? 'rotateY(180deg)' : showFront ? 'rotateY(0deg)' : 'rotateY(180deg)'
        }}
      >
        {/* Card Back */}
        <div
          className={`absolute w-full h-full rounded-xl bg-gradient-to-br from-amber-900 via-orange-900 to-amber-950 border-2 border-amber-500/30 shadow-lg flex items-center justify-center backface-hidden transition-opacity duration-300 ${
            showFront ? 'opacity-0' : 'opacity-100'
          } ${isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-amber-950' : ''}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute inset-2 rounded-lg border border-amber-500/20 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-400/50" />
            </div>
          </div>
          {/* Card pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-2 w-4 h-4 border border-amber-400" />
            <div className="absolute top-2 right-2 w-4 h-4 border border-amber-400" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border border-amber-400" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border border-amber-400" />
          </div>
        </div>

        {/* Card Front */}
        <div
          className={`absolute w-full h-full rounded-xl bg-gradient-to-br from-amber-950 via-orange-950 to-red-950 border-2 shadow-lg flex flex-col items-center justify-center backface-hidden transition-opacity duration-300 overflow-hidden ${
            showFront ? 'opacity-100' : 'opacity-0'
          } ${isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-amber-950' : ''} ${
            card.isReversed ? 'border-red-500/50' : 'border-amber-500/50'
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Decorative corner elements */}
          <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-amber-400/30" />
          <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-amber-400/30" />
          <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-amber-400/30" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-amber-400/30" />

          {/* Card number */}
          <div className={`font-bold ${numberSizeClasses[size]} text-amber-300`}>
            {card.card.id}
          </div>

          {/* Card name */}
          <p className={`text-center px-2 text-amber-200/90 font-medium leading-tight ${
            size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-[10px]' : 'text-xs'
          }`}>
            {card.card.name}
          </p>

          {/* Orientation indicator */}
          {card.isReversed && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="bg-red-900/50 text-red-200 text-[8px] px-1 py-0">
                ↓
              </Badge>
            </div>
          )}

          {/* Arcana indicator */}
          <div className="absolute bottom-2">
            <p className={`text-[8px] text-amber-500/60 ${
              card.card.arcana === 'major' ? 'font-bold' : ''
            }`}>
              {card.card.arcana === 'major' ? 'MAIOR' : card.card.suit?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpreadReader;
