'use client';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { CalendarioEnergetico } from '@/components/mapa/CalendarioEnergetico';
import type { OduResults } from '@/lib/engines/types/mapa-alma';

// Sample OduResults for demo purposes
// Note: these are simplified objects matching the { numero, Caminho, nome, significado } shape
const sampleOdu = {
  regente: { numero: 3, Caminho: 1, nome: 'Ogundá', significado: 'Caminho da verdade e da determinação' } as OduResults['regente'],
  secundario: { numero: 5, Caminho: 5, nome: 'Ejioko', significado: 'Caminho da dualidade e escolha' } as OduResults['regente'],
  orixas: ['Ogum', 'Oxossi'],
  quizilas: ['Evitar conflitos desnecessários'],
  preceitos: ['Respeitar a verdade', 'Manter a determinação'],
  ebos: ['Banho de folhas', 'Oferenda de ferro', 'Acendimento de velas', 'Oferecer dendê'],
  elemento: 'Fogo',
  arcanoTarot: 1,
  caminhoSephirah: 'Kether - Coroa',
};

export default function CalendarioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
          ✦ Calendário Energético
        </h1>
        <p className="text-slate-400 text-sm font-raleway mt-1">
          Ritmos cósmicos e orientações cerimoniais
        </p>
      </div>

      <CalendarioEnergetico odu={sampleOdu} />

      {/* Monthly overview - placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Dias Favoráveis', count: 12, icon: '⭐', color: 'text-amber-400', bg: 'from-amber-500/10' },
          { title: 'Dias de Precaução', count: 4, icon: '⚠', color: 'text-amber-300', bg: 'from-yellow-500/10' },
          { title: 'Rituais Recomendados', count: 7, icon: '✦', color: 'text-violet-400', bg: 'from-violet-500/10' },
        ].map(stat => (
          <div key={stat.title} className={`card-spiritual p-4 bg-gradient-to-br ${stat.bg} to-slate-950/50 border-slate-800/50`}>
            <div className="flex items-center gap-2 mb-2">
              <span>{stat.icon}</span>
              <span className="text-slate-300 text-sm">{stat.title}</span>
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Ritual recommendations */}
      <div className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 p-6">
        <h2 className="text-lg font-cinzel bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent mb-4">
          ✦ Recomendações para Esta Semana
        </h2>
        <div className="space-y-3">
          {[
            { day: 'Segunda-feira', ritual: 'Banho de ervas com Oxum', orixa: 'Oxum', time: 'Manhã' },
            { day: 'Quinta-feira', ritual: 'Saudação a Oxóssi', orixa: 'Oxóssi', time: 'Pôr do sol' },
            { day: 'Domingo', ritual: 'Oferenda de mel e flores', orixa: 'Oxalá', time: 'Qualquer horário' },
          ].map(rec => (
            <div key={rec.day} className="flex items-center gap-4 p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:bg-slate-800/50 transition-all">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div>
                <p className="text-slate-100 font-medium">{rec.ritual}</p>
                <p className="text-slate-400 text-sm">
                  {rec.orixa} • {rec.day} • {rec.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}