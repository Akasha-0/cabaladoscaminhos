'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetProgress } from './SpiritualWidgetSystem';
import { Sparkles, Heart, Moon, Sun, Star, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface DailyWisdomCardProps {
  userData: {
    nome: string;
    orixaRegente?: string;
    numeroPessoal?: number;
  };
  userId: string;
  className?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const DAILY_MESSAGES = [
  'O caminho se revela para quem caminha com coração aberto.',
  'A sabedoria está dentro de você — apenas precisa lembrar.',
  'Cada passo na jornada espiritual fortalece sua conexão com o cosmos.',
  'Hoje é um dia propício para iniciar novas práticas de autoconhecimento.',
  'Permaneça em paz, pois o universo conspira a seu favor.',
];

const TAROT_CARDS = [
  { name: 'O Mago', meaning: 'Manifestação e poder pessoal', advice: 'Use sua criatividade para criar mudanças positivas.' },
  { name: 'A Estrela', meaning: 'Esperança e inspiração', advice: 'Mantenha a esperança e permita que sua luz brilhe.' },
  { name: 'O Sol', meaning: 'Sucesso e vitalidade', advice: 'Celebre suas conquistas e compartilhe sua luz.' },
  { name: 'A Lua', meaning: 'Intuição e transformação', advice: 'Confie em sua intuição mesmo na escuridão.' },
  { name: 'O Eremita', meaning: 'Introspecção e sabedoria', advice: 'Reserve tempo para reflexão e autoconhecimento.' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDailyContent(): {
  affirmation: string;
  tarot: typeof TAROT_CARDS[0];
  message: string;
  luckyNumber: number;
  color: string;
} {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  
  return {
    affirmation: 'Eu declaro que hoje é um dia de alinhamento espiritual e paz interior.',
    tarot: TAROT_CARDS[dayOfYear % TAROT_CARDS.length],
    message: DAILY_MESSAGES[dayOfYear % DAILY_MESSAGES.length],
    luckyNumber: ((dayOfYear * 7) % 9) + 1,
    color: ['Dourado', 'Azul Celestial', 'Verde Esperanza', 'Roxo Místico', 'Rosa Amor'][dayOfYear % 5],
  };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function DailyWisdomCard({ userData, userId, className }: DailyWisdomCardProps) {
  const [loading, setLoading] = React.useState(false);
  const content = React.useMemo(() => getDailyContent(), []);
  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
              Sabedoria Diária
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{dateStr}</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Message from Orixá */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Sun className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-amber-400 font-medium mb-1">
                {userData.orixaRegente || 'Oxum'} fala contigo
              </p>
              <p className="text-sm text-slate-200 leading-relaxed">
                {content.message}
              </p>
            </div>
          </div>
        </div>

        {/* Daily Affirmation */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-xs text-pink-400 font-medium">Afirmação do Dia</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed italic">
            &ldquo;{content.affirmation}&rdquo;
          </p>
          <p className="text-xs text-slate-500 mt-2">— {userData.nome}</p>
        </div>

        {/* Tarot Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-violet-400 font-medium">Carta do Dia</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-violet-600/30 to-purple-600/30 border border-violet-500/30 flex items-center justify-center">
              <span className="text-2xl">🃏</span>
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-white">{content.tarot.name}</p>
              <p className="text-xs text-violet-400">{content.tarot.meaning}</p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{content.tarot.advice}</p>
            </div>
          </div>
        </div>

        {/* Lucky Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Lucky Number */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <p className="text-2xl font-bold text-amber-400">{content.luckyNumber}</p>
            <p className="text-xs text-amber-400/70">Número da Sorte</p>
          </div>

          {/* Color */}
          <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-pink-400" />
              <span className="text-sm font-medium text-pink-400">{content.color}</span>
            </div>
            <p className="text-xs text-pink-400/70 mt-1">Cor do Dia</p>
          </div>
        </div>

        {/* Moon Phase */}
        <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-200">Fase Lunar Atual</p>
              <p className="text-xs text-slate-400">Buena para introspecção y rituales</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <WidgetProgress label="Alinhamento spiritual" value={85} max={100} color="amber" />
      </CardContent>
    </Card>
  );
}

export default DailyWisdomCard;