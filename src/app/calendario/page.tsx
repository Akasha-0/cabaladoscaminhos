'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DayEnergy {
  dayName: string;
  orixa: string;
  chakra: string;
  planeta: string;
  arcano: string;
  atividades: string[];
  cor: string;
  faseLua: string;
  mistério: string;
}

const diasDaSemana: DayEnergy[] = [
  {
    dayName: 'Segunda-feira',
    orixa: 'Omolu / Exu',
    chakra: '1º Básico / 6º Frontal',
    planeta: 'Lua / Saturno',
    arcano: 'Sacerdotisa / O Mundo',
    faseLua: 'Lua Minguante / Nova',
    cor: 'bg-red-900/30 border-red-800 text-red-200',
    mistério: 'Aterramento, limpeza espiritual, transmutação e respeito às almas e antepassados.',
    atividades: [
      'Rituais de limpeza áurica e despachos',
      'Conexão com ancestrais e eguns',
      'Trabalhos de quebra de demandas',
      'Banhos de descarrego (canela-de-velho, assa-peixe)',
      'Abertura de caminhos com Exu',
    ],
  },
  {
    dayName: 'Terça-feira',
    orixa: 'Iansã / Ogum',
    chakra: '2º Sacro',
    planeta: 'Marte / Plutão',
    arcano: 'A Torre / O Carro',
    faseLua: 'Lua Nova / Crescente',
    cor: 'bg-orange-900/30 border-orange-800 text-orange-200',
    mistério: 'Força, movimento, coragem, corte de demandas e quebra de energias paradas.',
    atividades: [
      'Rituais de proteção e banimento',
      'Cortes de amarrações e feitiçarias',
      'Banhos de guerra (pinha-roxo, guiné)',
      'Firmezas com espada-de-são-jorge',
      'Abertura de caminhos com Ogum',
    ],
  },
  {
    dayName: 'Quarta-feira',
    orixa: 'Xangô / Iansã',
    chakra: '3º Plexo Solar',
    planeta: 'Mercúrio',
    arcano: 'O Mago / O Eremita',
    faseLua: 'Lua Crescente',
    cor: 'bg-yellow-900/30 border-yellow-800 text-yellow-200',
    mistério: 'Justiça divina, estudos, mente concreta, verdade e razão.',
    atividades: [
      'Estudos e meditação sobre a Lei',
      'Rituais de prosperidade estratégica',
      'Defumações de alecrim e estoraque',
      'Ações de justiça e verdade',
      'Alinhamento mental e equilíbrio',
    ],
  },
  {
    dayName: 'Quinta-feira',
    orixa: 'Oxóssi',
    chakra: '4º Cardíaco',
    planeta: 'Júpiter',
    arcano: 'O Hierofante',
    faseLua: 'Lua Crescente / Cheia',
    cor: 'bg-emerald-900/30 border-emerald-800 text-emerald-200',
    mistério: 'Fartura, busca por conhecimento, expansão e cura através das matas.',
    atividades: [
      'Rituais de fartura e prosperidade',
      'Busca por conhecimento esotérico',
      'Banhos de cedro e eucalipto',
      'Pedidos de cura e proteção na mata',
      'Expansão de projetos e negócios',
    ],
  },
  {
    dayName: 'Sexta-feira',
    orixa: 'Oxalá',
    chakra: '7º Coronário',
    planeta: 'Vênus',
    arcano: 'O Imperador / O Louco',
    faseLua: 'Lua Cheia',
    cor: 'bg-violet-900/30 border-violet-800 text-violet-200',
    mistério: 'Paz, pureza, silêncio, gratidão e conexão direta com o Divino.',
    atividades: [
      'Rituais de paz e harmonização do Ori',
      'Práticas de gratidão e meditação',
      'Banho de boldo e manjericão branco',
      'Cerimônias de Bori espiritual',
      'Conexão com a luz divina',
    ],
  },
  {
    dayName: 'Sábado',
    orixa: 'Oxum / Iemanjá',
    chakra: '4º Cardíaco / 6º Frontal',
    planeta: 'Saturno / Urano',
    arcano: 'A Imperatriz / A Estrela',
    faseLua: 'Lua Cheia',
    cor: 'bg-pink-900/30 border-pink-800 text-pink-200',
    mistério: 'Amor incondicional, intuição, fertilidade e águas geradoras.',
    atividades: [
      'Rituais de amor e atraentee-magnettismo',
      'Banhos de mel, calda de frutas e rosas',
      'Oferendas nas águas (Oxum e Iemanjá)',
      'Ativação da inteligência emocional',
      'Práticas de feitiçaria natural',
    ],
  },
  {
    dayName: 'Domingo',
    orixa: 'Xangô (Vibração Solar)',
    chakra: '3º Plexo Solar',
    planeta: 'Sol',
    arcano: 'O Sol',
    faseLua: 'Lua Cheia / Crescente',
    cor: 'bg-amber-900/30 border-amber-800 text-amber-200',
    mistério: 'Recarregar energia vital, poder pessoal, brilho próprio e propósito de vida.',
    atividades: [
      'Rituais de reativação do poder pessoal',
      'Banhos de sol com intenção sagrada',
      'Defumações de canela e louro',
      'Consagração de amuletos de poder',
      'Alinhamento com o propósito de vida',
    ],
  },
];

export default function CalendarioPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Calendário Espiritual
            </h1>
            <p className="text-muted-foreground">
              Mapa semanal das energias espirituais — Orixás, Chakras, Arcanos e Atividades Ritualísticas
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {diasDaSemana.map((dia) => (
            <Card
              key={dia.dayName}
              className={cn(
                'border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
                dia.cor.replace('/30', '-muted/20').replace('bg-', 'bg-').replace('text-', 'text-'),
              )}
            >
              {/* Day Header */}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">
                    {dia.dayName}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {dia.faseLua}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dia.mistério}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Core Attributes */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">
                      Orixá
                    </span>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {dia.orixa}
                    </Badge>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">
                      Chakra
                    </span>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {dia.chakra}
                    </Badge>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">
                      Planeta
                    </span>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {dia.planeta}
                    </Badge>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">
                      Arcano
                    </span>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {dia.arcano}
                    </Badge>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Activities */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                    Atividades Ritualísticas
                  </p>
                  <ul className="space-y-1.5">
                    {dia.atividades.map((atividade, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <span className="text-primary mt-0.5 shrink-0">
                          ✦
                        </span>
                        <span>{atividade}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 border border-border rounded-lg bg-card/30">
          <p className="text-sm font-semibold mb-3 text-foreground">
            Legenda dos Dias
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {diasDaSemana.map((dia) => (
              <div key={dia.dayName} className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full shrink-0 border',
                    dia.cor.includes('red') && 'bg-red-600 border-red-800',
                    dia.cor.includes('orange') && 'bg-orange-600 border-orange-800',
                    dia.cor.includes('yellow') && 'bg-yellow-600 border-yellow-800',
                    dia.cor.includes('emerald') && 'bg-emerald-600 border-emerald-800',
                    dia.cor.includes('violet') && 'bg-violet-600 border-violet-800',
                    dia.cor.includes('pink') && 'bg-pink-600 border-pink-800',
                    dia.cor.includes('amber') && 'bg-amber-600 border-amber-800',
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">{dia.dayName}</span>
                  {' — '}
                  {dia.orixa.split(' / ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
