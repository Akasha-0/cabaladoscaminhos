'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  Sparkles, 
  Moon, 
  Sun, 
  Star, 
  Zap,
  Eye
} from 'lucide-react';

interface SoulCycleData {
  phase: number;
  phaseName: string;
  description: string;
  progress: number;
  daysRemaining: number;
  totalDays: number;
}

interface SoulCycleProps {
  dataNascimento?: string;
}

const SOUL_CYCLE_PHASES = [
  { 
    phase: 1, 
    name: 'Despertar da Alma', 
    description: 'Momento de despertar para o propósito de vida. A alma busca conhecimento e significado.',
    icon: Sparkles,
    color: 'from-amber-500 to-yellow-500'
  },
  { 
    phase: 2, 
    name: 'Busca Interior', 
    description: 'Período de profunda introspecção e conexão com o EU superior.',
    icon: Moon,
    color: 'from-indigo-500 to-purple-500'
  },
  { 
    phase: 3, 
    name: 'Expressão Criativa', 
    description: 'A alma manifesta sua verdade através de criação e comunicação.',
    icon: Star,
    color: 'from-pink-500 to-rose-500'
  },
  { 
    phase: 4, 
    name: 'Construção Interior', 
    description: 'Tempo de edificação de bases sólidas para o caminho espiritual.',
    icon: Sun,
    color: 'from-orange-500 to-amber-500'
  },
  { 
    phase: 5, 
    name: 'Libertação Espiritual', 
    description: 'Desprendimento das amarras materiais para elevação da consciência.',
    icon: Zap,
    color: 'from-cyan-500 to-blue-500'
  },
  { 
    phase: 6, 
    name: 'Unificação Divina', 
    description: 'Sintonia com a energia universal e integração com o propósito maior.',
    icon: Eye,
    color: 'from-violet-500 to-purple-500'
  }
];

function calculateSoulCycle(dataNascimento: string): SoulCycleData {
  const birth = new Date(dataNascimento);
  const today = new Date();
  
  const diffMs = today.getTime() - birth.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Ciclo de alma de 9 anos (retorno numerológico)
  const cycleDay = totalDays % (9 * 365);
  const cycleProgress = cycleDay / (9 * 365);
  
  // Determinar fase (1-6) baseada na posição no ciclo
  const phasePosition = cycleProgress * 6;
  const phase = Math.min(6, Math.max(1, Math.ceil(phasePosition)));
  
  const phaseData = SOUL_CYCLE_PHASES[phase - 1];
  
  // Calcular dias restantes no ciclo atual
  const cycleEndDay = phase * (9 * 365 / 6);
  const daysRemaining = Math.max(0, Math.floor((cycleEndDay - cycleDay) % (9 * 365 / 6)));
  
  return {
    phase,
    phaseName: phaseData.name,
    description: phaseData.description,
    progress: Math.round(cycleProgress * 100),
    daysRemaining: daysRemaining || Math.floor(9 * 365 / 6),
    totalDays: Math.floor(9 * 365 / 6)
  };
}

export function SoulCycle({ dataNascimento }: SoulCycleProps) {
  const [cycleData, setCycleData] = useState<SoulCycleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dataNascimento) {
      const data = calculateSoulCycle(dataNascimento);
      setCycleData(data);
    } else {
      // Demo data when no birthdate provided
      setCycleData({
        phase: 3,
        phaseName: 'Expressão Criativa',
        description: 'A alma manifesta sua verdade através de criação e comunicação.',
        progress: 42,
        daysRemaining: 78,
        totalDays: 135
      });
    }
    setLoading(false);
  }, [dataNascimento]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-violet-950/40 to-card border-violet-500/20">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!cycleData) {
    return null;
  }

  const phaseInfo = SOUL_CYCLE_PHASES[cycleData.phase - 1];
  const IconComponent = phaseInfo.icon;
  const progressPercent = (cycleData.totalDays - cycleData.daysRemaining) / cycleData.totalDays * 100;

  return (
    <Card className={`bg-gradient-to-br from-violet-950/40 to-card border-violet-500/20 overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${phaseInfo.color} opacity-5`} />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${phaseInfo.color}`}>
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Ciclo da Alma</CardTitle>
              <CardDescription>
                Retorno numerológico de 9 anos
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-violet-500/30 text-violet-300">
            Fase {cycleData.phase}/6
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Phase Name */}
        <div className="text-center py-4">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {cycleData.phaseName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {cycleData.description}
          </p>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso do Ciclo</span>
            <span className="font-medium text-violet-300">{cycleData.progress}%</span>
          </div>
          <div className="relative">
            <Progress 
              value={progressPercent} 
              className="h-3 bg-violet-950/50"
            />
            <div 
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${phaseInfo.color} rounded-full transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-violet-950/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-violet-300">
              {cycleData.daysRemaining}
            </div>
            <div className="text-xs text-muted-foreground">
              dias restantes
            </div>
          </div>
          <div className="bg-violet-950/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-violet-300">
              {cycleData.totalDays}
            </div>
            <div className="text-xs text-muted-foreground">
              duração (dias)
            </div>
          </div>
        </div>

        {/* Cycle Indicator */}
        <div className="flex justify-center gap-1 pt-2">
          {SOUL_CYCLE_PHASES.map((p) => (
            <div
              key={p.phase}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                p.phase <= cycleData.phase
                  ? `bg-gradient-to-r ${phaseInfo.color}`
                  : 'bg-violet-950/50'
              }`}
              style={{ width: '16px' }}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
          <RefreshCw className="w-3 h-3" />
          <span>Próximo ciclo em {Math.ceil(cycleData.daysRemaining / 365)} anos</span>
        </div>
      </CardContent>
    </Card>
  );
}