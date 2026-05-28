'use client';

import { useState } from 'react';
import { useJourney, JourneyMilestone, JourneyProgress } from '@/hooks/useJourney';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  Circle,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Flame
} from 'lucide-react';

interface SpiritualJourneyProps {
  className?: string;
}

const MILESTONE_ICONS: Record<string, React.ReactNode> = {
  awakening: <Sparkles className="w-5 h-5" />,
  'self-discovery': <Target className="w-5 h-5" />,
  transformation: <Flame className="w-5 h-5" />,
  mastery: <Award className="w-5 h-5" />,
};

const MILESTONE_COLORS: Record<string, string> = {
  awakening: 'text-yellow-500 bg-yellow-500/10',
  'self-discovery': 'text-blue-500 bg-blue-500/10',
  transformation: 'text-purple-500 bg-purple-500/10',
  mastery: 'text-emerald-500 bg-emerald-500/10',
};

function ProgressOverview({ progress }: { progress: JourneyProgress }) {
  const getStatusMessage = () => {
    if (progress.percentage === 0) {
      return 'Seu caminho espiritual está começando...';
    }
    if (progress.percentage < 50) {
      return 'Continue sua jornada de despertar';
    }
    if (progress.percentage < 100) {
      return 'Você está progredindo na transformação';
    }
    return 'Você alcançou a Maestria Espiritual!';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Progresso da Jornada
        </span>
        <span className="text-lg font-bold text-primary">
          {progress.percentage}%
        </span>
      </div>
      <Progress value={progress.percentage} className="h-2" />
      <p className="text-sm text-muted-foreground text-center">
        {getStatusMessage()}
      </p>
      <div className="flex justify-center gap-4 text-xs text-muted-foreground">
        <span>Etapa {progress.currentStep} de {progress.totalSteps}</span>
      </div>
    </div>
  );
}

function MilestoneCard({
  milestone,
  index,
  onComplete,
  canComplete
}: {
  milestone: JourneyMilestone;
  index: number;
  onComplete: () => void;
  canComplete: boolean;
}) {
  const isCompleted = milestone.completed;
  const colorClass = MILESTONE_COLORS[milestone.id] || 'text-gray-500 bg-gray-500/10';
  const icon = MILESTONE_ICONS[milestone.id] || <BookOpen className="w-5 h-5" />;

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div
      className={`
        relative p-4 rounded-lg border transition-all duration-300
        ${isCompleted
          ? 'border-green-500/50 bg-green-500/5'
          : 'border-muted bg-card hover:border-primary/30'
        }
      `}
    >
      {index > 0 && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center
            ${isCompleted ? 'bg-green-500/20' : 'bg-muted'}
          `}>
            <TrendingUp className={`w-3 h-3 ${isCompleted ? 'text-green-500' : 'text-muted-foreground'}`} />
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${colorClass}`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{milestone.title}</h4>
            {isCompleted && (
              <Badge variant="default" className="text-xs bg-green-500">
                Completo
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            {milestone.description}
          </p>

          {isCompleted && milestone.completedAt && (
            <p className="text-xs text-green-600 dark:text-green-400">
              Concluído em {formatDate(milestone.completedAt)}
            </p>
          )}

          {!isCompleted && canComplete && (
            <Button
              size="sm"
              variant="outline"
              onClick={onComplete}
              className="mt-2 h-7 text-xs"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Marcar como completo
            </Button>
          )}
        </div>

        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <Circle className="w-6 h-6 text-muted-foreground/50" />
          )}
        </div>
      </div>
    </div>
  );
}

function JourneyTimeline({ milestones }: { milestones: JourneyMilestone[] }) {
  return (
    <div className="space-y-6 relative">
      {milestones.map((milestone, index) => (
        <div key={milestone.id} className="relative">
          {index < milestones.length - 1 && (
            <div
              className={`
                absolute left-5 top-10 w-0.5 h-10
                ${milestone.completed ? 'bg-green-500/50' : 'bg-muted'}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-muted-foreground" />
      </div>
      <div>
        <h4 className="font-semibold">Jornada Espiritual</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Sua jornada de crescimento interior
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onReset}>
        <RotateCcw className="w-4 h-4 mr-2" />
        Iniciar Jornada
      </Button>
    </div>
  );
}

export function SpiritualJourney({ className = '' }: SpiritualJourneyProps) {
  const { milestones, progress, isLoading, completeMilestone, resetJourney } = useJourney();
  const [activeMilestone, setActiveMilestone] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedMilestones = milestones.filter(m => m.completed);
  const nextIncomplete = milestones.find(m => !m.completed);

  const handleComplete = (id: string) => {
    completeMilestone(id);
    setActiveMilestone(null);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Jornada Espiritual</CardTitle>
          </div>
          {milestones.some(m => m.completed) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetJourney}
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Recomeçar
            </Button>
          )}
        </div>
        <CardDescription>
          Acompanhe seu progresso na jornada de autoconhecimento
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <ProgressOverview progress={progress} />

        {milestones.length === 0 ? (
          <EmptyState onReset={resetJourney} />
        ) : (
          <>
            {nextIncomplete && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs font-medium text-primary mb-1">
                  Próximo passo:
                </p>
                <p className="text-sm font-semibold">
                  {nextIncomplete.title}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Marcos da Jornada
              </h4>

              {milestones.map((milestone, index) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  index={index}
                  onComplete={() => handleComplete(milestone.id)}
                  canComplete={activeMilestone === milestone.id || (!milestones.slice(0, index).every(m => m.completed) ? false : true)}
                />
              ))}
            </div>

            {progress.percentage === 100 && (
              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30">
                <Award className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Parabéns! Você completou sua jornada.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Continue crescendo e buscando novos desafios.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}