'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Star } from 'lucide-react';

export function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="card-spiritual">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Total de Sessões</CardTitle>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">0</div>
          <p className="text-xs text-slate-500 mt-1">Nenhuma sessão ainda</p>
        </CardContent>
      </Card>
      <Card className="card-spiritual">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Usuários Ativos</CardTitle>
          <Users className="w-4 h-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">1</div>
          <p className="text-xs text-slate-500 mt-1">Visitante</p>
        </CardContent>
      </Card>
      <Card className="card-spiritual">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Avaliação Média</CardTitle>
          <Star className="w-4 h-4 text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">5.0</div>
          <p className="text-xs text-slate-500 mt-1">Baseado em 0 avaliações</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default StatsOverview;
