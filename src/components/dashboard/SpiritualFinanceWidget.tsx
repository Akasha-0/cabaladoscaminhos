'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getProfileById } from '@/lib/orixa/orixa-profiles';
import { getTarotCardDoDia } from '@/lib/orixa/widget-data';
import { diasSemana } from '@/lib/data/spiritual-data';
import { Coins, TrendingUp, Sparkles, Calendar, Star, ChevronRight, DollarSign, ShieldCheck } from 'lucide-react';

interface SpiritualFinanceWidgetProps {
  userId?: string;
  userOrixa?: string;
  className?: string;
}

interface FinancialOmen {
  cardName: string;
  interpretation: string;
  luckyNumbers: number[];
  advice: string;
}

interface OrixaFinanceEnergy {
  name: string;
  namePortuguese: string;
  qualities: string[];
  financialAdvice: string;
  colors: string[];
}

interface LuckyDay {
  day: string;
  reason: string;
  quality: string;
}

const FINANCE_ORIXAS = ['oxum', 'xango', 'oxossi'];

const FINANCE_INTERPRETATIONS: Record<string, { interpretation: string; advice: string }> = {
  'The Fool': { interpretation: 'Um novo ciclo financeiro comeca. Este e um momento para agir com ousadia, mas com sabedoria.', advice: 'Conte com uma margem de erro.' },
  'The Magician': { interpretation: 'Recursos disponiveis estao ao seu alcance. Use sua criatividade para manifestar prosperidade.', advice: 'Excelente dia para iniciar novos projetos.' },
  'The Empress': { interpretation: 'Abundancia e fertilidade emocional refletem-se em abundancia material.', advice: 'Dia favoravel para investimentos em beleza e projetos criativos.' },
  'The Emperor': { interpretation: 'Estrutura e organizacao sao suas aliadas. Controle seus gastos.', advice: 'Bom dia para criar orcamento e planejar.' },
  'The Star': { interpretation: 'Esperanca e renovacao em sua vida financeira.', advice: 'Dias ideias para criar metas financeiras.' },
  'The Sun': { interpretation: 'Sucesso financeiro radiante!', advice: 'Invista em voce e em seus projetos.' },
  'The World': { interpretation: 'Completamento de ciclos financeiros.', advice: 'Perfeito para fechar acordos importantes.' },
};

const ABUNDANCE_AFFIRMATIONS = [
  'Eu abro minhas maos para receber a abundancia que o universo me oferece.',
  'Minha relacao com o dinheiro e de paz e gratidao.',
  'Eu mereco prosperidade em todas as areas.',
  'O fluxo energetico esta alinhando minhas financas com meu proposito.',
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getDayKey(date: Date): string {
  const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  return days[date.getDay()];
}

function getFinancialOmen(date: Date): FinancialOmen {
  const tarotCard = getTarotCardDoDia(date);
  const interpretationData = FINANCE_INTERPRETATIONS[tarotCard.nome] || {
    interpretation: 'Uma nova oportunidade financeira se apresenta.',
    advice: 'Mantenha-se aberto para receber prosperidade.'
  };
  
  const seed = date.getDate() + date.getMonth();
  const luckyNumbers: number[] = [7, 14, 21, 35, 42].map(n => (n + seed) % 50 + 1);
  
  return {
    cardName: tarotCard.nome,
    interpretation: interpretationData.interpretation,
    luckyNumbers: luckyNumbers.sort((a, b) => a - b),
    advice: interpretationData.advice,
  };
}

function getFinanceOrixa(orixaName?: string): OrixaFinanceEnergy {
  const defaultProfile = getProfileById('oxum');
  return {
    name: defaultProfile?.name || 'Oxum',
    namePortuguese: defaultProfile?.namePortuguese || 'Rainha das Aguas Doces',
    qualities: ['Abundancia', 'Prosperidade', 'Beleza'],
    financialAdvice: 'Oxum traz a energia da abundancia genuina. Honre suas financas como fluxo de amor proprio.',
    colors: ['#FFD700', '#FF69B4'],
  };
}

function getLuckyDays(): LuckyDay[] {
  const dayOrder = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const reasons: Record<string, string> = {
    quinta: 'Dia da fartura - o mais favoravel para financas',
    sexta: 'Dia da paz - favoravel para transacoes',
    sabado: 'Energia de abundancia nutridora',
  };
  
  return dayOrder.slice(0, 5).map((day, i) => ({
    day: day.charAt(0).toUpperCase() + day.slice(1),
    reason: reasons[day] || 'Dia neutro para financas',
    quality: 'Neutro',
  }));
}

function getDailyAffirmation(): string {
  const dayIndex = getDayOfYear();
  return ABUNDANCE_AFFIRMATIONS[dayIndex % ABUNDANCE_AFFIRMATIONS.length];
}

export function SpiritualFinanceWidget({ userOrixa, className = '' }: SpiritualFinanceWidgetProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);
  
  const omen = useMemo(() => getFinancialOmen(new Date()), []);
  const financeOrixa = useMemo(() => getFinanceOrixa(userOrixa), [userOrixa]);
  const luckyDays = useMemo(() => getLuckyDays(), []);
  const affirmation = useMemo(() => getDailyAffirmation(), []);
  
  if (!mounted) {
    return (
      <Card className={cn('card-spiritual', className)}>
        <CardHeader><CardTitle>Financas Espirituais</CardTitle></CardHeader>
        <CardContent><div className="h-48 animate-pulse bg-slate-800 rounded" /></CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn('card-spiritual overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-600/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          Portal Financeiro Espiritual
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 rounded-lg p-4 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="text-sm font-medium text-amber-400">{omen.cardName}</h4>
              <p className="text-xs text-slate-300 mt-1">{omen.interpretation}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {omen.luckyNumbers.map((num, i) => (
              <span key={i} className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs font-mono rounded">{num}</span>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/30 to-pink-500/30 flex items-center justify-center">
              <Coins className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-200">{financeOrixa.name}</h4>
              <p className="text-xs text-slate-400">{financeOrixa.namePortuguese}</p>
            </div>
          </div>
        </div>
        
        <div className="relative pl-4">
          <span className="text-3xl text-amber-500/20 absolute top-0 left-0">&ldquo;</span>
          <p className="text-sm text-slate-200 italic">{affirmation}</p>
          <div className="flex items-center gap-2 mt-2">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-slate-400">Abundancia</span>
          </div>
        </div>
        
        <div className="space-y-2">
          {luckyDays.map((day, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-200">{day.day}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default SpiritualFinanceWidget;
