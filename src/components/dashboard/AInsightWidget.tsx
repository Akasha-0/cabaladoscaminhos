'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, RefreshCw, Lightbulb, Eye, Heart } from 'lucide-react';

interface InsightItem {
  title: string;
  content: string;
  icon: React.ReactNode;
}

interface AInsightWidgetProps {
  className?: string;
}

const INSIGHTS: InsightItem[] = [
  {
    title: 'Conexão Ancestral',
    content: 'Seus antepassados estão trabalhaando para abrir caminhos em sua vida. Honre suas raízes.',
    icon: <Heart className="w-5 h-5" />,
  },
  {
    title: 'Energia do Dia',
    content: 'A lua em signo de água potencializa sua intuição. Confie em suas ersteiras.',
    icon: <Eye className="w-5 h-5" />,
  },
  {
    title: 'Orixá Regente',
    content: 'Oxum trazmessages de amor e prosperidade. Mantenha-se em harmonia com suas águas.',
    icon: <Lightbulb className="w-5 h-5" />,
  },
];

export function AInsightWidget({ className = '' }: AInsightWidgetProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const today = new Date();
  const dayIndex = today.getDate() % INSIGHTS.length;
  const insight = INSIGHTS[dayIndex];

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <Card className={`card-spiritual overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-purple-900/10 to-slate-900/50 pointer-events-none" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-lg bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
              Insight Diário
            </CardTitle>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-amber-400"
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 ${refreshKey ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div key={refreshKey} className="space-y-3 animate-fade-in">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-800/30 border border-slate-700/50">
            <div className="text-amber-400 mt-0.5">
              {insight.icon}
            </div>
            <div>
              <h4 className="font-medium text-amber-300 mb-1">{insight.title}</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{insight.content}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AInsightWidget;
