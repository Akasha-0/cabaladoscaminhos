'use client';

import React from 'react';
import { Link2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getTodayCorrelation, DayCorrelation } from '@/lib/correlation/SpiritualCorrelationEngine';

type CorrelationType = 'orixa-odu' | 'chakra-planet' | 'element-sefirah' | 'day-energy';

interface CorrelationCardProps {
  correlation: DayCorrelation;
  type: CorrelationType;
}

function CorrelationCard({ correlation, type }: CorrelationCardProps) {
  const getContent = () => {
    switch (type) {
      case 'orixa-odu':
        return (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: correlation.primaryColor + '20' }}>
                🔮
              </div>
              <div>
                <p className="text-lg font-semibold" style={{ color: correlation.primaryColor }}>
                  {correlation.orixa}
                </p>
                <p className="text-sm text-slate-400">Conexão Espiritual</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-2">
              Orixá regente do dia
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-1 rounded bg-slate-800/50">
                Dia: {correlation.dayNamePt}
              </span>
            </div>
          </>
        );
      case 'chakra-planet':
        return (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: correlation.secondaryColor + '20' }}>
                ⚡
              </div>
              <div>
                <p className="text-lg font-semibold" style={{ color: correlation.secondaryColor }}>
                  {correlation.chakra}
                </p>
                <p className="text-sm text-slate-400">{correlation.planet}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-2">
              Chakra em ressonância com {correlation.planet}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-slate-800/50 text-slate-400">
                {correlation.sefirah}
              </span>
            </div>
          </>
        );
      case 'element-sefirah':
        return (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                {correlation.elementEmoji}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-100">
                  {correlation.element}
                </p>
                <p className="text-sm text-slate-400">{correlation.sefirah}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-2">
              Elemento em harmonia com a Sefirá
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full overflow-hidden bg-slate-800">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '70%',
                    background: `linear-gradient(90deg, ${correlation.primaryColor}, ${correlation.secondaryColor})`,
                  }}
                />
              </div>
            </div>
          </>
        );
      case 'day-energy':
        return (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: correlation.primaryColor + '30' }}>
                ☀️
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-100">
                  Energia do Dia
                </p>
                <p className="text-sm" style={{ color: correlation.primaryColor }}>
                  {correlation.dayNamePt}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-3">
              {correlation.mystery}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-1 rounded bg-slate-800/50">
                {correlation.elementEmoji} {correlation.element}
              </span>
              <span className="px-2 py-1 rounded bg-slate-800/50">
                {correlation.chakra}
              </span>
            </div>
          </>
        );
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-all">
      {getContent()}
    </div>
  );
}

export function CrossCorrelationWidget({ className = '' }: { className?: string }) {
  const todayCorrelation = getTodayCorrelation();

  return (
    <Card className={`card-spiritual ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="w-5 h-5 text-purple-400" />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Correlações Espirituais
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <CorrelationCard
            correlation={todayCorrelation}
            type="orixa-odu"
          />
          <CorrelationCard
            correlation={todayCorrelation}
            type="chakra-planet"
          />
          <CorrelationCard
            correlation={todayCorrelation}
            type="element-sefirah"
          />
          <CorrelationCard
            correlation={todayCorrelation}
            type="day-energy"
          />
        </div>
      </CardContent>
    </Card>
  );
}