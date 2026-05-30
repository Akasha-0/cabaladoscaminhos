'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OduResults } from '@/lib/engines/types/mapa-alma';
import { AlertTriangle, CheckCircle2, Flame, Star, Crown } from 'lucide-react';

interface OduCardFullProps {
  odu: OduResults;
  className?: string;
}

export function OduCardFull({ odu, className = '' }: OduCardFullProps) {
  return (
    <Card className={`bg-slate-900 border-slate-700/50 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-amber-400 flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Odu do Destino
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Odu Regente Principal */}
        <div className="text-center py-6 bg-gradient-to-br from-slate-800/50 to-slate-900 rounded-xl border border-amber-400/20">
          <div className="text-2xl font-bold text-amber-400 mb-1">{odu.regente.nome}</div>
          <div className="text-lg text-slate-400">#{odu.regente.numero}</div>
          {odu.secundario && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <div className="text-sm text-slate-500 mb-1">Odu Secundário</div>
              <div className="text-lg font-semibold text-cyan-400">{odu.secundario.nome}</div>
            </div>
          )}
        </div>

        {/* Orixás Regentes */}
        <div>
          <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">Oixás Regentes</div>
          <div className="flex flex-wrap gap-2">
            {odu.orixas.map((orixa) => (
              <Badge
                key={orixa}
                variant="outline"
                className="bg-emerald-400/10 border-emerald-400/30 text-emerald-400 px-3 py-1"
              >
                <Star className="w-3 h-3 mr-1" />
                {orixa}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quizilas (EVITAR) */}
        {odu.quizilas.length > 0 && (
          <div>
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Quizilas (Evitar)
            </div>
            <div className="flex flex-wrap gap-2">
              {odu.quizilas.map((quizila) => (
                <Badge
                  key={quizila}
                  variant="destructive"
                  className="bg-amber-500/10 border-amber-500/30 text-amber-500 px-3 py-1"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {quizila}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Preceitos (FAZER) */}
        {odu.preceitos.length > 0 && (
          <div>
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Preceitos (Fazer)
            </div>
            <div className="flex flex-wrap gap-2">
              {odu.preceitos.map((preceito) => (
                <Badge
                  key={preceito}
                  variant="outline"
                  className="bg-emerald-400/10 border-emerald-400/30 text-emerald-400 px-3 py-1"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {preceito}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Ebós Sugeridos */}
        {odu.ebos.length > 0 && (
          <div>
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Ebós Sugeridos
            </div>
            <div className="flex flex-wrap gap-2">
              {odu.ebos.map((ebo) => (
                <Badge
                  key={ebo}
                  variant="outline"
                  className="bg-orange-400/10 border-orange-400/30 text-orange-400 px-3 py-1"
                >
                  {ebo}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Arcano Tarot + Sephirah Path */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Arcano Tarot</div>
            <div className="text-xl font-semibold text-cyan-400">#{odu.arcanoTarot}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Caminho Sephirah</div>
            <div className="text-sm font-medium text-violet-400">{odu.caminhoSephirah}</div>
          </div>
        </div>

        {/* Elemento */}
        <div className="text-center">
          <Badge variant="outline" className="bg-slate-800/50 border-slate-600 text-slate-300">
            Elemento: {odu.elemento}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
