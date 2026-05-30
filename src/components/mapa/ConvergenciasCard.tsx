'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Convergence } from '@/lib/engines/types/mapa-alma';
import { Sparkles, Zap, Star, Shield } from 'lucide-react';

interface ConvergenciasCardProps {
  convergencias: Convergence[];
  orixasDominantes: string[];
  className?: string;
}

const forcaColors = {
  forte: 'bg-emerald-400/10 border-emerald-400/50 text-emerald-400',
  medio: 'bg-slate-400/20 border-slate-400/50 text-slate-300',
  fraco: 'bg-orange-400/10 border-orange-400/50 text-orange-400',
} as const;

const forcaLabels = {
  forte: 'Forte',
  medio: 'Médio',
  fraco: 'Fraco',
} as const;

const forceBadgeColors = {
  forte: 'bg-amber-400/20 border-amber-400/50 text-amber-400',
  medio: 'bg-slate-400/20 border-slate-400/50 text-slate-300',
  fraco: 'bg-orange-700/30 border-orange-600/50 text-orange-400',
} as const;

export function ConvergenciasCard({ convergencias, orixasDominantes, className = '' }: ConvergenciasCardProps) {
  return (
    <Card className={`bg-slate-900 border-slate-700/50 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-amber-400 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Convergências Espirituais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Orixás Dominantes */}
        {orixasDominantes.length > 0 && (
          <div>
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">Orixás Dominantes</div>
            <div className="flex flex-wrap gap-2">
              {orixasDominantes.map((orixa) => (
                <Badge
                  key={orixa}
                  variant="outline"
                  className="bg-violet-400/10 border-violet-400/30 text-violet-400 px-3 py-1"
                >
                  <Star className="w-3 h-3 mr-1" />
                  {orixa}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Convergências */}
        {convergencias.length > 0 ? (
          <div className="space-y-4">
            {convergencias.map((convergencia, index) => (
              <div
                key={index}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 hover:border-amber-400/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium text-amber-400">{convergencia.energia}</span>
                  </div>
                  <Badge className={forceBadgeColors[convergencia.forca]}>
                    {forcaLabels[convergencia.forca]}
                  </Badge>
                </div>

                {/* Sistemas envolvidos */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {convergencia.sistemas.map((sistema) => (
                    <Badge
                      key={sistema}
                      variant="outline"
                      className="bg-cyan-400/10 border-cyan-400/30 text-cyan-400 text-[10px] px-2 py-0.5"
                    >
                      {sistema}
                    </Badge>
                  ))}
                </div>

                {/* Descrição */}
                <p className="text-sm text-slate-400 leading-relaxed">{convergencia.descricao}</p>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-10 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <div className="text-slate-400 text-sm">Nenhuma convergência registrada</div>
            <div className="text-slate-500 text-xs mt-1">
              As convergências espirituais aparecerão quando múltiplos sistemas revelarem padrões relacionados
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
