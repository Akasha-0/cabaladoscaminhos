'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Brain, Heart } from 'lucide-react';

export function MeditationStats() {
  return (
    <Card className="card-spiritual">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Estatísticas de Meditação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-300">Tempo Total</span>
            </div>
            <span className="font-bold text-white">0 min</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-pink-400" />
              <span className="text-sm text-slate-300">Sessões Concluídas</span>
            </div>
            <span className="font-bold text-white">0</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MeditationStats;
