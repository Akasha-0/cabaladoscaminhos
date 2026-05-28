'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FormaGeometrica } from '@/lib/geometria/dados';

interface Props {
  forma: FormaGeometrica;
}

export function FormaCard({ forma }: Props) {
  return (
    <Card className="bg-slate-900/50 border-purple-500/20 overflow-hidden">
      <div 
        className="h-32 flex items-center justify-center"
        style={{ 
          background: `linear-gradient(135deg, ${forma.corPrimaria}20, ${forma.corSecundaria}20)` 
        }}
      >
        <svg 
          viewBox="0 0 24 24" 
          className="w-20 h-20"
          style={{ fill: forma.corPrimaria }}
        >
          <path d={forma.svgPath} />
        </svg>
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg">{forma.nome}</CardTitle>
        <p className="text-sm text-purple-400">{forma.nomeIngles}</p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-300">{forma.descricao}</p>
        
        <div>
          <h4 className="text-xs font-medium text-purple-300 mb-1">Significado</h4>
          <p className="text-sm text-slate-400">{forma.significado}</p>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {forma.asociacoes.sefirot && (
            <Badge variant="outline" className="text-xs border-purple-500/30">
              Sefirot: {forma.asociacoes.sefirot}
            </Badge>
          )}
          {forma.asociacoes.chakra && (
            <Badge variant="outline" className="text-xs border-blue-500/30">
              Chakra: {forma.asociacoes.chakra}
            </Badge>
          )}
          {forma.asociacoes.elemento && (
            <Badge variant="outline" className="text-xs border-green-500/30">
              Elemento: {forma.asociacoes.elemento}
            </Badge>
          )}
        </div>
        
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-400">
            <span className="text-purple-400">Proporção:</span> {forma.proporcoes}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}