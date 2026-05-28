'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCreditos } from '@/lib/hooks';
import {
  Sparkles,
  RotateCcw,
  Share2,
  Copy,
  Check,
  ArrowRightLeft,
  Moon,
  Sun,
  Star
} from 'lucide-react';

// Tarot cards data - major and minor arcana with upright/reversed meanings
const tarotCards = [
  { numero: 0, nome: 'O Louco', arcano: 'Maior', significadoUpright: 'Novos começos, liberdade, espontaneidade, inocência', significadoReversed: 'Irresponsabilidade, impulsividade, loucura, presa de riscos desnecessários', keywords: ['liberdade', 'aventura', 'espontaneidade'] },
  { numero: 1, nome: 'O Mago', arcano: 'Maior', significadoUpright: 'Manifestação, recursos, habilidade, propósito', significadoReversed: 'Manipulação, influências negativas, falta de direção', keywords: ['manifestação', 'poder', 'ação'] },
  { numero: 2, nome: 'A Sacerdotisa', arcano: 'Maior', significadoUpright: 'Intuição, sabedoria interior, profundezas do inconsciente', significadoReversed: 'Segredos, mistérios não revelados, superficialidade', keywords: ['intuição', 'mistério', 'conhecimento'] },
  { numero: 3, nome: 'A Imperadora', arcano: 'Maior', significadoUpright: 'Fertilidade, abundância, natureza,nutrição', significadoReversed: 'Bloqueio criativo, dependência de outros, negligência', keywords: ['abundância', 'maturidade', 'criação'] },
  { numero: 4, nome: 'O Imperador', arcano: 'Maior', significadoUpright: 'Autoridade, estrutura, controle, liderança', significadoReversed: 'Rigidez, domínio excessivo, fragilidade', keywords: ['estrutura', 'liderança', 'estabilidade'] },
  { numero: 5, nome: 'O Hierofante', arcano: 'Maior', significadoUpright: 'Tradição, espiritualidade, conformidade, ética', significadoReversed: 'Rebeldia, novos caminhos, falta de tradição', keywords: ['tradição', 'espiritualidade', 'educação'] },
  { numero: 6, nome: 'Os Enamorados', arcano: 'Maior', significadoUpright: 'Amor, harmonia, relacionamentos, escolha', significadoReversed: 'Disharmonia, desequilíbrio, má escolha', keywords: ['amor', 'união', 'decisão'] },
  { numero: 7, nome: 'O Carro', arcano: 'Maior', significadoUpright: 'Vitória, conquista, controle, vontade', significadoReversed: 'Falta de direção, agressividade, obstáculos', keywords: ['conquista', 'vitória', 'determinação'] },
  { numero: 8, nome: 'A Força', arcano: 'Maior', significadoUpright: 'Coragem, persuasão, influência, compaixão', significadoReversed: 'Interior fraco, auto doute, manipulação', keywords: ['força', 'coragem', 'compassão'] },
  { numero: 9, nome: 'O Eremita', arcano: 'Maior', significadoUpright: 'Introspecção, solitude, busca interior, autoconhecimento', significadoReversed: 'Isolamento extremo, timidez, solidão', keywords: ['introspecção', 'sabedoria', 'iluminação'] },
  { numero: 10, nome: 'A Roda da Fortuna', arcano: 'Maior', significadoUpright: 'Ciclos, destino, mudança, sorte', significadoReversed: 'Má sorte, procrastinação, ciclo vicioso', keywords: ['destino', 'sorte', 'transformação'] },
  { numero: 11, nome: 'A Justiça', arcano: 'Maior', significadoUpright: 'Justiça, verdade, lei, equidade', significadoReversed: 'Injustiça, falta de responsabilidade, desonestidade', keywords: ['equidade', 'verdade', 'justiça'] },
  { numero: 12, nome: 'O Enforcado', arcano: 'Maior', significadoUpright: 'Pausa, sacrifício, nova perspectiva, rendimento', significadoReversed: 'Resistência, estagnação, indolência', keywords: ['sacrifício', 'renovação', 'perspectiva'] },
  { numero: 13, nome: 'A Morte', arcano: 'Maior', significadoUpright: 'Fim de ciclo, transição, transformação, renaissance', significadoReversed: 'Medo de mudança, estagnação, decomposição', keywords: ['transformação', 'metamorfose', 'renascimento'] },
  { numero: 14, nome: 'A Temperança', arcano: 'Maior', significadoUpright: 'Equilíbrio, paciência, propósito, harmonia', significadoReversed: 'Desequilíbrio, excesso, falta de propósito', keywords: ['harmonia', 'equilíbrio', 'moderação'] },
  { numero: 15, nome: 'O Diabo', arcano: 'Maior', significadoUpright: 'Escravidão, vício, ilusão, materialismo', significadoReversed: 'Libertação, renúncia, recuperação do poder', keywords: ['ilusão', 'vício', 'libertação'] },
  { numero: 16, nome: 'A Torre', arcano: 'Maior', significadoUpright: 'Mudança repentina, catastrophe, revelação, upheaval', significadoReversed: 'Mudança evitada, medo de transformação, catastrophe adiada', keywords: ['catástrofe', 'revelação', 'libertação'] },
  { numero: 17, nome: 'A Estrela', arcano: 'Maior', significadoUpright: 'Esperança, fé, propósito, serenidade', significadoReversed: 'Desesperança, descrença, desespero', keywords: ['esperança', 'inspiração', 'paz'] },
  { numero: 18, nome: 'A Lua', arcano: 'Maior', significadoUpright: 'Ilusão, medo, ansiedade, inconsciente', significadoReversed: 'Medo, confusion, esclarecimento', keywords: ['ilusão', 'intuição', 'inconsciente'] },
  { numero: 19, nome: 'O Sol', arcano: 'Maior', significadoUpright: 'Alegria, sucesso, celebração, vitalidade', significadoReversed: 'Excesso de confiança, otimismo exagerado', keywords: ['alegria', 'sucesso', 'vitalidade'] },
  { numero: 20, nome: 'O Julgamento', arcano: 'Maior', significadoUpright: 'Julgamento, redenção, prova, despertar', significadoReversed: 'Autocondenação, reflexão tardia, julgamentos errôneos', keywords: ['redenção', 'renascimento', 'julgamento'] },
  { numero: 21, nome: 'O Mundo', arcano: 'Maior', significadoUpright: 'Realização, completude, integração, viagens', significadoReversed: 'Falta de progresso, sentimento de incompletude', keywords: ['realização', 'completude', 'integração'] },
];

// Seeded random based on date for consistent daily card
function getDailyCard(): typeof tarotCards[0] & { isReversed: boolean } {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  const cardIndex = seed % tarotCards.length;
  const reversed = (seed * 7) % 2 === 1;
  
  return {
    ...tarotCards[cardIndex],
    isReversed: reversed
  };
}

export function TarotDoDia() {
  useCreditos();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const dailyCard = getDailyCard();
  
  const handleFlip = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(prev => !prev);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);
  
  useEffect(() => {
    // Auto-flip on mount after a short delay
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  
  const handleShare = async () => {
    const text = `🃏 Carta do Dia - Tarot Cabala dos Caminhos\n\n${dailyCard.nome} (${dailyCard.isReversed ? 'Invertida' : 'Posição Normal'})\n\nSignificado: ${dailyCard.isReversed ? dailyCard.significadoReversed : dailyCard.significadoUpright}\n\nPalavras-chave: ${dailyCard.keywords.join(', ')}\n\n#Tarot #CabalaDosCaminhos #Espiritualidade`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Carta do Dia: ${dailyCard.nome}`,
          text: text
        });
      } catch (err) {
        // User cancelled or error - try clipboard fallback
        copyToClipboard(text);
      }
    } else {
      copyToClipboard(text);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const meaning = dailyCard.isReversed ? dailyCard.significadoReversed : dailyCard.significadoUpright;
  
  return (
    <Card className="bg-gradient-to-br from-purple-950/60 via-card to-indigo-950/40 border-purple-500/30 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-lg">Carta do Dia</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${dailyCard.isReversed ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'}`}
            >
              {dailyCard.isReversed ? (
                <><Moon className="w-3 h-3 mr-1" /> Invertida</>
              ) : (
                <><Sun className="w-3 h-3 mr-1" /> Normal</>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Flip Card Container */}
        <div 
          className="relative w-full aspect-[2/3] cursor-pointer perspective-1000 mx-auto max-w-[280px]"
          onClick={handleFlip}
        >
          {/* Card Wrapper with 3D Transform */}
          <div 
            className={`
              relative w-full h-full transition-transform duration-500 ease-in-out
              transform-style-preserve-3d
              ${isFlipped ? 'rotate-y-180' : ''}
            `}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front of Card */}
            <div 
              className="absolute inset-0 backface-hidden rounded-xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-900/40 via-amber-800/30 to-amber-900/50 flex flex-col items-center justify-center p-4 shadow-lg"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Card Back Design */}
              <div className="absolute inset-2 rounded-lg border border-amber-400/30 bg-gradient-to-br from-amber-950/80 to-amber-900/60 flex items-center justify-center">
                <div className="text-amber-400/60 flex flex-col items-center">
                  <Star className="w-16 h-16 mb-2" />
                  <span className="text-xs font-serif tracking-widest uppercase">Tarot</span>
                </div>
              </div>
              
              {/* Tap hint */}
              <div className="absolute bottom-3 text-xs text-amber-400/50 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                Toque para revelar
              </div>
            </div>
            
            {/* Back of Card (Revealed) */}
            <div 
              className={`absolute inset-0 backface-hidden rounded-xl border-2 bg-gradient-to-br flex flex-col items-center justify-center p-4 shadow-lg ${
                dailyCard.isReversed 
                  ? 'border-orange-500/50 from-orange-950/60 to-red-950/40' 
                  : 'border-emerald-500/50 from-emerald-950/60 to-teal-950/40'
              }`}
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              {/* Card Number */}
              <div className={`
                absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${dailyCard.isReversed ? 'bg-orange-500/30 text-orange-300' : 'bg-emerald-500/30 text-emerald-300'}
              `}>
                {dailyCard.numero}
              </div>
              
              {/* Card Arcano Badge */}
              <Badge 
                className={`absolute top-3 right-3 text-xs ${
                  dailyCard.arcano === 'Maior' 
                    ? 'bg-amber-500/30 text-amber-300 border-amber-500/50' 
                    : 'bg-purple-500/30 text-purple-300 border-purple-500/50'
                }`}
              >
                {dailyCard.arcano}
              </Badge>
              
              {/* Card Art Symbol */}
              <div className={`
                w-20 h-20 rounded-full flex items-center justify-center mb-3
                ${dailyCard.isReversed 
                  ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30' 
                  : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30'
                }
              `}>
                {dailyCard.isReversed ? (
                  <Moon className={`w-10 h-10 ${dailyCard.isReversed ? 'text-orange-400' : 'text-emerald-400'}`} />
                ) : (
                  <Sun className={`w-10 h-10 text-emerald-400`} />
                )}
              </div>
              
              {/* Card Name */}
              <h3 className={`
                text-xl font-serif font-bold text-center mb-1
                ${dailyCard.isReversed ? 'text-orange-200' : 'text-emerald-200'}
              `}>
                {dailyCard.nome}
              </h3>
              
              {/* Reversed Indicator */}
              {dailyCard.isReversed && (
                <div className="flex items-center gap-1 text-xs text-orange-400/70 mb-2">
                  <ArrowRightLeft className="w-3 h-3" />
                  Invertida
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Separator className="bg-purple-500/20" />
        
        {/* Meaning Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${dailyCard.isReversed ? 'text-orange-400' : 'text-emerald-400'}`}>
              {dailyCard.isReversed ? 'Significado Invertido' : 'Significado Normal'}
            </span>
            <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/40">
              #{dailyCard.numero}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {meaning}
          </p>
          
          {/* Keywords */}
          <div className="flex flex-wrap gap-2 pt-1">
            {dailyCard.keywords.map((kw, i) => (
              <span 
                key={i}
                className={`
                  text-xs px-2 py-1 rounded-full
                  ${dailyCard.isReversed 
                    ? 'bg-orange-500/20 text-orange-300/80' 
                    : 'bg-emerald-500/20 text-emerald-300/80'
                  }
                `}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
        
        {/* Share Button */}
        <Button 
          onClick={handleShare}
          variant="outline"
          className={`
            w-full gap-2 transition-all
            ${dailyCard.isReversed 
              ? 'border-orange-500/40 hover:bg-orange-500/20 hover:text-orange-300' 
              : 'border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-300'
            }
          `}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copiado!
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Compartilhar Carta
            </>
          )}
        </Button>
        
        {/* Daily Note */}
        <p className="text-xs text-center text-muted-foreground/60 italic">
          A carta do dia é calculada com base na data de hoje e permanece a mesma até meia-noite.
        </p>
      </CardContent>
    </Card>
  );
}