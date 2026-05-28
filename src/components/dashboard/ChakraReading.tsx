'use client';

import { useState } from 'react';
import { chakras } from '@/lib/data/spiritual-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Zap,
  Droplets,
  Flame,
  Heart,
  Wind,
  Eye,
  Crown,
  Activity,
  Shield,
  Sparkles,
  Volume2
} from 'lucide-react';

type ChakraState = 'balanced' | 'blocked' | 'overactive';

interface ChakraReading {
  state: ChakraState;
  level: number;
  blockagePoints: string[];
  healingSuggestions: string[];
}

const ICONES_CHAKRA: Record<number, React.ElementType> = {
  1: Zap,
  2: Droplets,
  3: Flame,
  4: Heart,
  5: Wind,
  6: Eye,
  7: Crown
};

const CORES_CHAKRA: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-500' },
  2: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-500' },
  3: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-500' },
  4: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-500' },
  5: { bg: 'bg-blue-400/20', border: 'border-blue-400/50', text: 'text-blue-400' },
  6: { bg: 'bg-indigo-500/20', border: 'border-indigo-500/50', text: 'text-indigo-500' },
  7: { bg: 'bg-violet-500/20', border: 'border-violet-500/50', text: 'text-violet-500' }
};

const STATE_BADGES: Record<ChakraState, { label: string; className: string }> = {
  balanced: { label: 'Equilibrado', className: 'bg-green-500/20 text-green-500 border-green-500/50' },
  blocked: { label: 'Bloqueado', className: 'bg-red-500/20 text-red-500 border-red-500/50' },
  overactive: { label: 'Hiperativo', className: 'bg-amber-500/20 text-amber-500 border-amber-500/50' }
};

const STATE_DESCRIPTIONS: Record<ChakraState, string> = {
  balanced: 'Energia fluindo harmoniosamente',
  blocked: 'Fluxo energético obstruído',
  overactive: 'Excesso de energia acumulada'
};

const HEALING_SUGGESTIONS: Record<number, Record<ChakraState, string[]>> = {
  1: {
    balanced: ['Manter práticas de ancoramento', 'Meditaçãoregular com mantram LAM'],
    blocked: ['Caminhar descalço na terra', 'Usar cristais vermelhos como granada', 'Praticar yoga com ênfase em.Root'],
    overactive: ['Exercícios de respiração profundos', 'Atividades de enraizamento', 'Evitar stimulantres']
  },
  2: {
    balanced: ['Expressão criativa regular', 'Água morna com limão pela manhã'],
    blocked: ['Terapia de água (banho de imersão)', 'Usar coral vermelho ou cornalina', 'Yoga focado em quadril'],
    overactive: ['Práticas de bound-setting', 'Visualização de energia fluindo para cima', 'Dieta depurativa']
  },
  3: {
    balanced: ['Exercícios de fogo interno', 'Pranayama kapalabhati'],
    blocked: ['Exposição ao sol matinal', 'Usar turmalina negra ou âmbar', 'Pranayama bhastrika'],
    overactive: ['Práticas de grounding', 'Meditação em silêncio', 'Exercícios de respiração cooling']
  },
  4: {
    balanced: ['Prática de compaixão', 'Perdoar regularmente'],
    blocked: ['Terapia com cristais rosa (quartzo rosa)', 'Prática de heart-opening yoga', 'Perdoar a si mesmo e outros'],
    overactive: ['Práticas de bound energetico', 'Respiração alternada (nadi shodhana)', 'Meditação de equanimidade']
  },
  5: {
    balanced: ['Expressão autêntica', 'Cantar mantras regularmente'],
    blocked: ['Cantos e mantras (HAM)', 'Usar turquesa ou água-marinha', 'Prática de pranayama'],
    overactive: ['Prática de silêncio (mauna)', 'Escrita expressiva', 'Respiração calmante']
  },
  6: {
    balanced: ['Meditação intuition', 'Pranayama Trataka'],
    blocked: ['Visualização criativa', 'Usar sodalita ou lapis lazuli', 'Trabalho com sonho lúcido'],
    overactive: ['Práticas de centelhamento ( Trataka )', 'Atividades analíticas', 'Yoga Nidra']
  },
  7: {
    balanced: ['Contemplação regular', 'Estudos sagrados'],
    blocked: ['Exposição à luz solar matinal', 'Usar ametista ou clear quartz', 'Pranayama Sitali'],
    overactive: ['Práticas de ancoramento', 'Atividades físicas diárias', 'Tocar a terra']
  }
};

function generateRandomReading(): Record<number, ChakraReading> {
  const states: ChakraState[] = ['balanced', 'blocked', 'overactive'];
  const readings: Record<number, ChakraReading> = {};

  chakras.forEach((chakra) => {
    const state = states[Math.floor(Math.random() * states.length)];
    const level = state === 'blocked' ? Math.floor(Math.random() * 30) + 5 :
                  state === 'overactive' ? Math.floor(Math.random() * 40) + 60 :
                  Math.floor(Math.random() * 30) + 40;

    readings[chakra.numero] = {
      state,
      level,
      blockagePoints: getBlockagePoints(chakra.numero, state),
      healingSuggestions: HEALING_SUGGESTIONS[chakra.numero][state]
    };
  });

  return readings;
}

function getBlockagePoints(chakraNum: number, state: ChakraState): string[] {
  if (state === 'balanced') return [];

  const blockageMap: Record<number, Record<ChakraState, string[]>> = {
    1: {
      blocked: ['Medo de escassez', 'Insegurança material', 'Dificuldade em confiar na vida'],
      overactive: ['Austeridade excessiva', 'Rigidez emocional', 'Teimosia']
    },
    2: {
      blocked: ['Bloqueio criativo', 'Culpa存储', 'Memórias emocionais presas'],
      overactive: ['Excesso de emoções', 'Vulnerabilidade emocional', 'Dependência afetiva']
    },
    3: {
      blocked: ['Baixa autoestima', 'Medo de autoridade', 'Dificuldade em assertividade'],
      overactive: ['Perfeccionismo', 'Crítica severa', 'Controle excessivo']
    },
    4: {
      blocked: ['Coração fechado', 'Dificuldade em perdoar', 'Medo de vulnerabilidade'],
      overactive: ['Co-dependência', 'Pessoas prazer', 'Falta de limites']
    },
    5: {
      blocked: ['Dificuldade em se expressar', 'Medo de falar a verdade', 'Voz abafada'],
      overactive: ['Falação excessiva', 'Manipulação verbal', 'Proclamação agresiva']
    },
    6: {
      blocked: ['Falta de intuição', 'Visão limitada', 'Confusão mental'],
      overactive: ['Fantasia excessiva', 'Visão distorcida', 'Projeção indevida']
    },
    7: {
      blocked: ['Desconexão espiritual', 'Crise de sentido', 'Fechamento para o transcendente'],
      overactive: ['Fanatismo', 'Escape da realidade', 'Superioridade espiritual']
    }
  };

  return blockageMap[chakraNum]?.[state] || [];
}

function ChakraMeter({ level, state }: { level: number; state: ChakraState }) {
  const getColor = () => {
    if (state === 'blocked') return 'bg-red-500';
    if (state === 'overactive') return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-1">
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${level}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span className="font-medium">{level}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

function ChakraCard({
  chakra,
  reading
}: {
  chakra: (typeof chakras)[0];
  reading: ChakraReading;
}) {
  const Icone = ICONES_CHAKRA[chakra.numero];
  const cores = CORES_CHAKRA[chakra.numero];
  const badge = STATE_BADGES[reading.state];

  return (
    <Card className={`${cores.bg} border ${cores.border} transition-all duration-300`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icone className={`h-5 w-5 ${cores.text}`} />
            <div>
              <CardTitle className="text-sm font-semibold">{chakra.nome}</CardTitle>
              <CardDescription className="text-xs">{chakra.cor}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs ${badge.className}`}>
            {badge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ChakraMeter level={reading.level} state={reading.state} />

        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Função: </span>
          {chakra.funcao}
        </div>

        {reading.blockagePoints.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Shield className="h-3 w-3" />
              Pontos de Bloqueio
            </div>
            <ul className="text-xs space-y-1 pl-4">
              {reading.blockagePoints.map((point, i) => (
                <li key={i} className="list-disc text-destructive/80">{point}</li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs font-medium">
            <Sparkles className={`h-3 w-3 ${cores.text}`} />
            Sugestões de Cura
          </div>
          <ul className="space-y-1">
            {reading.healingSuggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <Volume2 className="h-3 w-3 mt-0.5 shrink-0" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
          <div>
            <span className="font-medium text-muted-foreground">Frequência: </span>
            <span className={cores.text}>{chakra.freqSolfeggio}</span>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Mantram: </span>
            <span className={cores.text}>{chakra.mantram}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChakraReading() {
  const [reading] = useState(() => generateRandomReading());
  const [selectedChakra, setSelectedChakra] = useState<number | null>(null);

  const selectedReading = selectedChakra ? reading[selectedChakra] : null;

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-violet-500" />
            <CardTitle>Leitura dos Chakras</CardTitle>
          </div>
          <Badge variant="outline" className="bg-violet-500/10 text-violet-500 border-violet-500/30">
            7 Chakras
          </Badge>
        </div>
        <CardDescription>
          Análise do estado energético dos seus chakras principais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {chakras.map((chakra) => (
              <ChakraCard
                key={chakra.numero}
                chakra={chakra}
                reading={reading[chakra.numero]}
              />
            ))}
          </div>
        </ScrollArea>

        {selectedReading && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-medium mb-2">Plano de Cura Personalizado</h4>
            <p className="text-sm text-muted-foreground">
              Foque nas práticas de cura para o chakra selecionado.
              Recomenda-se uma prática consistente de 21 dias para resultados notáveis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ChakraReading;