'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useMapaNatal } from '@/hooks/useMapaNatal';

const SIGNOS_ICONS: Record<string, string> = {
  aries: '♈', touro: '♉', gemeos: '♊', cancer: '♋',
  leao: '♌', virgem: '♍', libra: '♎', escorpio: '♏',
  sagitario: '♐', capricornio: '♑', aquario: '♒', peixes: '♓',
};

export function MapaNatalCard() {
  const { data, loading, error } = useMapaNatal();
  
  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🪐</span> Mapa Natal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-800 rounded-lg" />
              ))}
            </div>
            <div className="h-16 bg-slate-800 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🪐</span> Mapa Natal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState 
            variant="error"
            title="Erro ao carregar Mapa Natal"
            description="Não foi possível consultar os astros. Tente novamente."
            action={{
              label: 'Tentar novamente',
              onClick: () => window.location.reload(),
            }}
          />
        </CardContent>
      </Card>
    );
  }
  
  if (!data) {
    return (
      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🪐</span> Mapa Natal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState 
            variant="no-data"
            title="Mapa Natal não disponível"
            description="Complete seu perfil com data e hora de nascimento para revelar seu mapa astral."
            icon={<span className="text-4xl">🪐</span>}
          />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-slate-900/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🪐</span> Mapa Natal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <InfoItem 
            label="Sol" 
            value={capitalize(data.solSigno)} 
            icon={SIGNOS_ICONS[data.solSigno]} 
          />
          <InfoItem 
            label="Lua" 
            value={capitalize(data.luaSigno)} 
            icon={SIGNOS_ICONS[data.luaSigno]} 
          />
          <InfoItem 
            label="Ascendente" 
            value={capitalize(data.ascendente)} 
            icon="↑"
            subtext={`${data.ascendenteGrau.toFixed(0)}°`}
          />
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-purple-300 mb-2">Planetas</h4>
          <div className="flex flex-wrap gap-1">
            {Object.entries(data.planetas).map(([planeta, info]) => (
              <Badge 
                key={planeta} 
                variant="outline" 
                className="text-xs border-purple-500/30"
              >
                {SIGNOS_ICONS[info.signo]} {capitalize(planeta)}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-purple-300 mb-2">
            Aspectos Principais
          </h4>
          <div className="space-y-1">
            {data.aspectos.slice(0, 3).map((aspecto, i) => (
              <div key={i} className="text-sm text-slate-300">
                <span className="text-purple-400">{capitalize(aspecto.planeta1)}</span>
                <span className="text-slate-500"> {aspecto.tipo} </span>
                <span className="text-purple-400">{capitalize(aspecto.planeta2)}</span>
                <span className="text-slate-500 text-xs ml-1">({aspecto.orb.toFixed(1)}°)</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value, icon, subtext }: { label: string; value: string; icon: string; subtext?: string }) {
  return (
    <div className="text-center p-2 bg-purple-950/30 rounded-lg">
      <div className="text-2xl">{icon}</div>
      <div className="text-xs text-purple-300">{label}</div>
      <div className="font-medium text-slate-100">{value}</div>
      {subtext && <div className="text-xs text-slate-400">{subtext}</div>}
    </div>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}