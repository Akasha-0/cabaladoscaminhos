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
        <Heading variant="mystical" size="2xl">
          ✦ Calendário Energético
        </Heading>
        <MysticDivider className="mt-3 max-w-sm" />
      </div>

      <CalendarioEnergetico odu={sampleOdu} />

      {/* Monthly overview - placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Dias Favoráveis', count: 12, icon: '⭐', color: 'text-spiritual-gold' },
          { title: 'Dias de Precaução', count: 4, icon: '⚠', color: 'text-amber-400' },
          { title: 'Rituais Recomendados', count: 7, icon: '✦', color: 'text-spiritual-violet' },
        ].map(stat => (
          <div key={stat.title} className="card-spiritual p-4">
            <div className="flex items-center gap-2 mb-2">
              <span>{stat.icon}</span>
              <span className="text-spiritual-text-secondary text-sm">{stat.title}</span>
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Ritual recommendations */}
      <div className="card-spiritual p-6">
        <Heading variant="section" size="lg" className="mb-4">
          ✦ Recomendações para Esta Semana
        </Heading>
        <div className="space-y-3">
          {[
            { day: 'Segunda-feira', ritual: 'Banho de ervas com Oxum', orixa: 'Oxum', time: 'Manhã' },
            { day: 'Quinta-feira', ritual: 'Saudação a Oxóssi', orixa: 'Oxóssi', time: 'Pôr do sol' },
            { day: 'Domingo', ritual: 'Oferenda de mel e flores', orixa: 'Oxalá', time: 'Qualquer horário' },
          ].map(rec => (
            <div key={rec.day} className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-spiritual-gold" />
              <div>
                <p className="text-spiritual-text-primary font-medium">{rec.ritual}</p>
                <p className="text-spiritual-text-muted text-sm">
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