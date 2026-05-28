'use client';

import { FREQUENCIAS_SOLFEGGIO, getFrequenciaDoDia } from '@/lib/frequencias/dados';
import { FrequenciaCard } from './FrequenciaCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function FrequenciasPage() {
  const diaAtual = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  const freqRecomendada = getFrequenciaDoDia(diaAtual);
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-300 mb-2">
          ✦ Frequências Solfeggio ✦
        </h1>
        <p className="text-slate-400">
          9 frequências sagradas para cura e elevação espiritual
        </p>
      </div>
      
      <Card className="bg-gradient-to-r from-purple-900/50 to-slate-900/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>✨</span> Frequência do Dia - {diaAtual}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${freqRecomendada.cor}40, ${freqRecomendada.cor}20)`,
                border: `3px solid ${freqRecomendada.cor}`
              }}
            >
              <span className="text-3xl font-bold" style={{ color: freqRecomendada.cor }}>
                {freqRecomendada.hz}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-100">{freqRecomendada.nome}</h3>
              <p className="text-sm text-purple-400 mb-2">{freqRecomendada.efeito}</p>
              <p className="text-sm text-slate-300">{freqRecomendada.recomendacao}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📚</span> O que são as Frequências Solfeggio?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300 mb-4">
            As Frequências Solfeggio são um conjunto de 9 frequências sonoras originalmente 
            usadas em cantos gregorianos. Cada frequência possui propriedades terapêuticas 
            específicas que podem ajudar na cura física, emocional e espiritual.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-800/50 rounded">
              <div className="font-bold text-purple-400">174 Hz</div>
              <div className="text-slate-400">Base/Fundação</div>
            </div>
            <div className="p-2 bg-slate-800/50 rounded">
              <div className="font-bold text-purple-400">528 Hz</div>
              <div className="text-slate-400">Milagre</div>
            </div>
            <div className="p-2 bg-slate-800/50 rounded">
              <div className="font-bold text-purple-400">963 Hz</div>
              <div className="text-slate-400">Elevação</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FREQUENCIAS_SOLFEGGIO.map(freq => (
          <FrequenciaCard 
            key={freq.id} 
            frequencia={freq} 
            destacada={freq.id === freqRecomendada.id}
          />
        ))}
      </div>
    </div>
  );
}