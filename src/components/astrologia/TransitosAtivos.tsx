'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import type { Transito } from '@/hooks/useMapaNatal';

interface TransitosAtivosProps {
  transitos: Transito[];
}

export function TransitosAtivos({ transitos }: TransitosAtivosProps) {
  const impactoCores = {
    alto: 'bg-red-500/20 border-red-500/50 text-red-300',
    medio: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
    baixo: 'bg-green-500/20 border-green-500/50 text-green-300',
  };
  
  const impactoBades = {
    alto: { text: 'Alto Impacto', color: 'bg-red-500' },
    medio: { text: 'Médio Impacto', color: 'bg-yellow-500' },
    baixo: { text: 'Baixo Impacto', color: 'bg-green-500' },
  };
  
  return (
    <Card className="bg-slate-900/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🪐</span> Trânsitos Ativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transitos.length === 0 ? (
          <EmptyState 
            title="Nenhum trânsito significativo"
            description="Continue acompanhando suas orientações astrais. Os astros revelarão novas influências em breve."
            icon={<span className="text-4xl">🌌</span>}
          />
        ) : (
          <div className="space-y-3">
            {transitos.slice(0, 5).map((t, i) => (
              <div 
                key={i}
                className={`p-3 rounded-lg border ${impactoCores[t.impacto]}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-sm">
                    {capitalize(t.planeta)} {t.aspecto} {capitalize(t.planetaNatal)}
                  </div>
                  <span className={`w-2 h-2 rounded-full ${impactoBades[t.impacto]?.color ?? 'bg-slate-500'}`} />
                </div>
                <p className="text-xs opacity-80">{t.descricao}</p>
              </div>
            ))}
            
            {transitos.length > 5 && (
              <p className="text-center text-slate-500 text-xs">
                +{transitos.length - 5} mais trânsitos
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}