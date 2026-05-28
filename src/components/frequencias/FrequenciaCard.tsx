'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FrequenciaSolfeggio } from '@/lib/frequencias/dados';

interface Props {
  frequencia: FrequenciaSolfeggio;
  destacada?: boolean;
}

export function FrequenciaCard({ frequencia, destacada }: Props) {
  return (
    <Card 
      className={`bg-slate-900/50 border-purple-500/20 overflow-hidden ${
        destacada ? 'ring-2 ring-purple-500' : ''
      }`}
    >
      <div 
        className="h-24 flex items-center justify-center relative"
        style={{ 
          background: `linear-gradient(135deg, ${frequencia.cor}30, ${frequencia.cor}10)` 
        }}
      >
        <div className="text-center">
          <div className="text-5xl font-bold" style={{ color: frequencia.cor }}>
            {frequencia.hz}
          </div>
          <div className="text-sm text-slate-400">Hz</div>
        </div>
        
        {destacada && (
          <Badge className="absolute top-2 right-2 bg-purple-600">
            Recomendada
          </Badge>
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg">{frequencia.nome}</CardTitle>
        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: frequencia.cor }}>●</span>
          <span className="text-slate-400">{frequencia.chakra}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Nota: {frequencia.nota}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <p className="text-xs text-purple-400 font-medium mb-1">Efeito</p>
          <p className="text-sm text-slate-300">{frequencia.efeito}</p>
        </div>
        
        <div>
          <p className="text-xs text-purple-400 font-medium mb-2">Benefícios</p>
          <div className="flex flex-wrap gap-1">
            {frequencia.beneficios.map((b, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {b}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-400">
            <span className="text-purple-400">Recomendação:</span> {frequencia.recomendacao}
          </p>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <button className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <div className="flex-1">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-0" />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0:00</span>
              <span>3:00</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}