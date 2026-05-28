'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  User,
  Settings,
  Compass,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Moon,
  Sun,
  Star,
  Eye
} from 'lucide-react';

type StepId = 'profile' | 'preferences' | 'path';

interface Step {
  id: StepId;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    id: 'profile',
    title: 'Perfil',
    description: 'Configure suas informações básicas',
    icon: <User className="w-5 h-5" />,
  },
  {
    id: 'preferences',
    title: 'Preferências',
    description: 'Personalize sua experiência',
    icon: <Settings className="w-5 h-5" />,
  },
  {
    id: 'path',
    title: 'Caminho',
    description: 'Escolha sua prática espiritual',
    icon: <Compass className="w-5 h-5" />,
  },
];

interface ProfileData {
  name: string;
  email: string;
  birthDate: string;
}

interface PreferencesData {
  theme: 'light' | 'dark' | 'mystic';
  notifications: boolean;
  weeklyInsights: boolean;
}

interface PathData {
  selectedPath: 'kabbalah' | 'ifa' | 'tarot' | 'numerology' | null;
}

const SPIRITUAL_PATHS = [
  { id: 'kabbalah', label: 'Cabalá', icon: <Star className="w-6 h-6" />, description: 'Tradição mística judaica' },
  { id: 'ifa', label: 'Ifá', icon: <Eye className="w-6 h-6" />, description: 'Sabedoria iorubá' },
  { id: 'tarot', label: 'Tarô', icon: <Moon className="w-6 h-6" />, description: 'Arcanos e símbolos' },
  { id: 'numerology', label: 'Numerologia', icon: <Sparkles className="w-6 h-6" />, description: 'Poder dos números' },
] as const;

interface OnboardingWizardProps {
  className?: string;
  onComplete?: (data: ProfileData & PreferencesData & PathData) => void;
  onSkip?: () => void;
}

export function OnboardingWizard({ className = '', onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    birthDate: '',
  });

  const [preferencesData, setPreferencesData] = useState<PreferencesData>({
    theme: 'dark',
    notifications: true,
    weeklyInsights: true,
  });

  const [pathData, setPathData] = useState<PathData>({
    selectedPath: null,
  });

  const currentStep = STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep.id) {
      case 'profile':
        return profileData.name.trim() !== '' && profileData.birthDate !== '';
      case 'preferences':
        return true;
      case 'path':
        return pathData.selectedPath !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsCompleted(true);
      onComplete?.({ ...profileData, ...preferencesData, ...pathData });
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };

  if (isCompleted) {
    return (
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        <CardContent className="pt-8 pb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 mb-6">
            <Check className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="font-cinzel text-2xl font-semibold mb-2">
            Bem-vindo ao seu caminho espiritual
          </h2>
          <p className="text-muted-foreground mb-6">
            Sua jornada de autoconhecimento está prestes a começar.
          </p>
          <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500">
            <Sparkles className="w-4 h-4 mr-2" />
            Começar Jornada
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-500">
              {currentStep.icon}
            </div>
            <div>
              <CardTitle className="font-cinzel">{currentStep.title}</CardTitle>
              <CardDescription>{currentStep.description}</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Pular
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Passo {currentStepIndex + 1} de {STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex gap-2 pt-2">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                index === currentStepIndex
                  ? 'bg-amber-500/20 text-amber-500'
                  : index < currentStepIndex
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {index < currentStepIndex ? (
                <Check className="w-3 h-3" />
              ) : (
                step.icon
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentStep.id === 'profile' && (
          <ProfileStep data={profileData} onChange={setProfileData} />
        )}
        {currentStep.id === 'preferences' && (
          <PreferencesStep data={preferencesData} onChange={setPreferencesData} />
        )}
        {currentStep.id === 'path' && (
          <PathStep data={pathData} onChange={setPathData} />
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
          >
            {currentStepIndex === STEPS.length - 1 ? (
              <>
                Concluir
                <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileStep({
  data,
  onChange,
}: {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          placeholder="Seu nome espiritual"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={data.email}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="birthDate">Data de Nascimento</Label>
        <Input
          id="birthDate"
          type="date"
          value={data.birthDate}
          onChange={(e) => onChange({ ...data, birthDate: e.target.value })}
        />
      </div>
    </div>
  );
}

function PreferencesStep({
  data,
  onChange,
}: {
  data: PreferencesData;
  onChange: (data: PreferencesData) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Tema</Label>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'mystic'] as const).map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => onChange({ ...data, theme })}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                data.theme === theme
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-muted hover:border-amber-500/50'
              )}
            >
              {theme === 'light' && <Sun className="w-6 h-6" />}
              {theme === 'dark' && <Moon className="w-6 h-6" />}
              {theme === 'mystic' && <Star className="w-6 h-6" />}
              <span className="text-sm font-medium capitalize">{theme}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Notificações</Label>
            <p className="text-sm text-muted-foreground">
              Receba lembretes de rituais e meditações
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={data.notifications}
            onClick={() => onChange({ ...data, notifications: !data.notifications })}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              data.notifications ? 'bg-amber-500' : 'bg-muted'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                data.notifications ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Insights Semanais</Label>
            <p className="text-sm text-muted-foreground">
              Mensagens espirituais personalizadas
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={data.weeklyInsights}
            onClick={() => onChange({ ...data, weeklyInsights: !data.weeklyInsights })}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              data.weeklyInsights ? 'bg-amber-500' : 'bg-muted'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                data.weeklyInsights ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function PathStep({
  data,
  onChange,
}: {
  data: PathData;
  onChange: (data: PathData) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="font-cinzel text-lg font-medium mb-2">
          Escolha seu caminho espiritual
        </h3>
        <p className="text-sm text-muted-foreground">
          Selecione a tradição que mais ressoa com sua alma
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SPIRITUAL_PATHS.map((path) => (
          <button
            key={path.id}
            type="button"
            onClick={() => onChange({ ...data, selectedPath: path.id })}
            className={cn(
              'flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center',
              data.selectedPath === path.id
                ? 'border-amber-500 bg-gradient-to-br from-amber-500/10 to-orange-500/10'
                : 'border-muted hover:border-amber-500/50 hover:bg-muted/50'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                data.selectedPath === path.id
                  ? 'bg-amber-500/20 text-amber-500'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {path.icon}
            </div>
            <div>
              <p className="font-medium mb-1">{path.label}</p>
              <p className="text-xs text-muted-foreground">{path.description}</p>
            </div>
            {data.selectedPath === path.id && (
              <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                Selecionado
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default OnboardingWizard;
