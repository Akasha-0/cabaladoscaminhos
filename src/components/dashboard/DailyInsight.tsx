'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Lightbulb, Sparkles, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTodayCorrelation } from '@/lib/correlation/useTodayCorrelation';

interface DailyInsightProps {
  caminhoDeVida: number;
  signoElemento: string;
  odu: string;
  className?: string;
}

/**
 * Gera insight contextualizado combinando:
 * - Dia da semana
 * - Elemento pessoal
 * - Elemento do dia
 * - Correlações espirituais
 */
function generateInsight(
  caminhoDeVida: number,
  signoElemento: string,
  odu: string,
  correlation: ReturnType<typeof useTodayCorrelation>
): string {
  const { 
    dayNamePt, 
    elemento: elementoDoDia, 
    chakra, 
    planeta,
    numerologia 
  } = correlation;

  const insights: string[] = [];

  // Insight baseado no elemento pessoal vs elemento do dia
  if (signoElemento === elementoDoDia) {
    insights.push(
      `Hoje seu signo de ${signoElemento} está em ressonância com a energia do dia. ` +
      `Astro de ${planeta} favorece atividades relacionadas ao ${chakra}.`
    );
  } else {
    insights.push(
      `O dia traz energia de ${elementoDoDia}, diferente do seu ${signoElemento}. ` +
      `Use esta diversidade para equilibrar aspectos do seu ser.`
    );
  }

  // Insight baseado no caminho de vida
  const caminhoInsights: Record<number, string> = {
    1: "Dia propício para iniciar novos projetos. Sua energia de liderança está fortalecida.",
    2: "Conecte-se com pessoas importantes. Parcerias e colaborações trazem bons frutos.",
    3: "Expresse sua criatividade. Arte, comunicação e alegria amplificam sua energia.",
    4: "Foque em fundamentos e organização. Trabalho consistente rende hoje.",
    5: "Mudanças e adaptações são bem-vindas. Flexibilidade traz oportunidades.",
    6: "Dedique tempo à família e ao lar. Harmonia nos relacionamentos é prioritaria.",
    7: "Pratique reflexão e silêncio interior. A sabedoria surge na quietude.",
    8: "Assertividade potencializa seus esforços. Recupere o que é seu.",
    9: "Libere o que não serve mais. O encerramento de ciclos traz paz.",
    11: "Intuição elevada está ativa. Confie em suas visões e percepções.",
    22: "Capacidade de manifestar grandes projetos. Use sua força com sabedoria.",
    33: "Amor incondicional flui naturalmente. Sirva aos outros com compaixão.",
  };
  
  if (caminhoInsights[caminhoDeVida]) {
    insights.push(caminhoInsights[caminhoDeVida]);
  }

  // Insight baseado no Odu
  const oduInsights: Record<string, string> = {
    alafia: "Paz e gratidão marcam seu dia. Odu de Alafia confirma que tudo está bem.",
    ogbe: "Novos começos se manifestam. Abre-te para oportunidades inesperadas.",
    oyeku: "Momento de introspecção. Revelações surgem no silêncio.",
    iwori: "Adaptação necessária. A flexibilidade supera obstáculos.",
    odi: "Renovação e transformação. O que era difícil pode se tornar fácil.",
    owonrin: "Mudanças rápidas. Mantenha o equilíbrio interno.",
  };
  
  const oduLower = odu.toLowerCase();
  const matchedOduInsight = Object.entries(oduInsights).find(([key]) => 
    oduLower.includes(key)
  );
  
  if (matchedOduInsight) {
    insights.push(matchedOduInsight[1]);
  }

  // Insight baseado no dia
  const dayInsights: Record<string, string> = {
    'Domingo': "Energia solar favorece recarregar a alma e celebrar a vida.",
    'Segunda-feira': "A Lua traz sensibilidade. Honre suas emoções.",
    'Terça-feira': "Marte ativa sua coragem. Aja com determinação.",
    'Quarta-feira': "Mercúrio favorece comunicação. Expresse-se com clareza.",
    'Quinta-feira': "Júpiter expande sua sabedoria. Busque conhecimento.",
    'Sexta-feira': "Vênus traz amor e harmonia. Conecte-se com beleza.",
    'Sábado': "Saturno pede disciplina. O trabalho constante traz frutos.",
  };
  
  if (dayInsights[dayNamePt]) {
    insights.push(dayInsights[dayNamePt]);
  }

  // Combine into one cohesive insight
  return insights.join(' ');
}

/**
 * Gera conselho prático do dia
 */
function getPracticalAdvice(
  caminhoDeVida: number,
  elementoDoDia: string
): string[] {
  const advice: string[] = [];
  
  // Baseado no elemento do dia
  const elementAdvice: Record<string, string[]> = {
    'Fogo': ['Pratique atividade física', 'Evite discussões', 'Aqueça-se com bebidas quentes'],
    'Água': ['Beba bastante água', 'Permita-se chorar se precisar', 'Evite ambientes agressivos'],
    'Terra': ['Conecte-se com a natureza', 'Organize seu espaço', 'Coma alimentos nutritivos'],
    'Ar': ['Pratique respirações', 'Evite fofocas', 'Permita-se pensar antes de agir'],
    'Éter': ['Medite em silêncio', 'Agradeça pelas bênçãos', 'Evite excesso de stimulation'],
  };
  
  advice.push(...(elementAdvice[elementoDoDia] || []));
  
  return advice;
}

export function DailyInsight({ 
  caminhoDeVida, 
  signoElemento, 
  odu,
  className = '' 
}: DailyInsightProps) {
  const correlation = useTodayCorrelation();
  
  const insight = useMemo(() => 
    generateInsight(caminhoDeVida, signoElemento, odu, correlation),
    [caminhoDeVida, signoElemento, odu, correlation]
  );
  
  const practicalAdvice = useMemo(() => 
    getPracticalAdvice(caminhoDeVida, correlation.elemento),
    [caminhoDeVida, correlation.elemento]
  );

  return (
    <Card className={cn(
      'p-5 bg-gradient-to-br from-amber-900/20 to-slate-900 border-amber-500/20',
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Insight do Dia</h3>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>{correlation.dayNamePt}</span>
            <span>•</span>
            <span>{correlation.elemento}</span>
            <span className="text-lg ml-1">{correlation.elementEmoji}</span>
          </div>
        </div>
      </div>

      {/* Insight Principal */}
      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 mb-4">
        <p className="text-sm text-slate-200 leading-relaxed">
          {insight}
        </p>
      </div>

      {/* Conselhos Práticos */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400 uppercase tracking-wide">Dica prática</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {practicalAdvice.map((advice, index) => (
            <span 
              key={index}
              className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300"
            >
              {advice}
            </span>
          ))}
        </div>
      </div>

      {/* Elemento e Chakra do Dia */}
      <div className="mt-4 pt-4 border-t border-slate-700/30">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-lg bg-slate-800/40">
            <p className="text-xs text-slate-500 uppercase mb-1">Chakra do Dia</p>
            <p className="text-sm font-medium text-cyan-400">{correlation.chakra}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40">
            <p className="text-xs text-slate-500 uppercase mb-1">Número Tântrico</p>
            <p className="text-sm font-medium text-violet-400">{correlation.numerologia.tantric.value}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
