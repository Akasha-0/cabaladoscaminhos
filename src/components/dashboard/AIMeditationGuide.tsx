'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Brain,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Sparkles,
  Heart,
  Shield,
  Eye,
  Zap,
  Mountain,
  Scale,
  GraduationCap,
  CircleDot,
  Wind,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface UserSpiritualData {
  nome: string;
  dataNascimento: string;
  signozodiacal?: string;
  orixa?: string;
  caminho?: string;
  numeroPessoal?: number;
}

export interface MeditationPhase {
  name: string;
  duration: number;
  script: string;
  guidance: string;
}

export interface MeditationSession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  durationMinutes: number;
  theme: MeditationTheme;
  phases: MeditationPhase[];
  completed: boolean;
  guidance?: string;
}

export type MeditationTheme =
  | 'transcendencia'
  | 'curacao'
  | 'protecao'
  | 'manifestacao'
  | 'ancestral'
  | 'equilibrio'
  | 'sabedoria'
  | 'harmonizacao'
  | 'kundalini'
  | 'movimento';

export interface AIMeditationGuideProps {
  userId: string;
  userData: UserSpiritualData;
  className?: string;
  onComplete?: (session: MeditationSession) => void;
}

// ============================================================
// CONSTANTS
// ============================================================

const DURATION_OPTIONS = [
  { value: 5, label: '5 min', seconds: 300 },
  { value: 10, label: '10 min', seconds: 600 },
  { value: 15, label: '15 min', seconds: 900 },
  { value: 20, label: '20 min', seconds: 1200 },
] as const;

const THEME_CONFIG: Record<
  MeditationTheme,
  {
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    breathPattern: string;
    mantram: string;
  }
> = {
  transcendencia: {
    label: 'Transcendência',
    description: 'Elevação espiritual e conexão com o divino',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/20',
    breathPattern: '4-7-8 (respiração lenta e profunda)',
    mantram: 'Aham Brahmasmi',
  },
  curacao: {
    label: 'Cura',
    description: 'Transmutação de dores e renovação interior',
    icon: <Heart className="w-5 h-5" />,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/20',
    breathPattern: '4-4-4-4 (respiração quadrada)',
    mantram: 'Om Shanti',
  },
  protecao: {
    label: 'Proteção',
    description: 'Escudo áurico e proteção espiritual',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
    breathPattern: '3-3-3-3 (respiração equilibrada)',
    mantram: 'Om Namah Shivaya',
  },
  manifestacao: {
    label: 'Manifestação',
    description: 'Materialização de intenções e desejos',
    icon: <Eye className="w-5 h-5" />,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/20',
    breathPattern: '5-5-5-5 (respiração longa)',
    mantram: 'Om Gam Ganapataye Namaha',
  },
  ancestral: {
    label: 'Ancestral',
    description: 'Conexão com linhagem e antepassados',
    icon: <Mountain className="w-5 h-5" />,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/20',
    breathPattern: '6-6-6-6 (respiração profunda ancestral)',
    mantram: 'Hum',
  },
  equilibrio: {
    label: 'Equilíbrio',
    description: 'Harmonização dos corpos energéticos',
    icon: <Scale className="w-5 h-5" />,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/20',
    breathPattern: '4-4-4-4 (harmonia respiratória)',
    mantram: 'Om Shanti',
  },
  sabedoria: {
    label: 'Sabedoria',
    description: 'Despertar da consciência e discernimento',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    breathPattern: '5-4-6 (respiração pitagórica)',
    mantram: 'Om Mani Padme Hum',
  },
  harmonizacao: {
    label: 'Harmonização',
    description: 'Alinhamento dos chakras e vórtices',
    icon: <CircleDot className="w-5 h-5" />,
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    breathPattern: '4-4-4-4 (equilíbrio dos chakras)',
    mantram: 'Om',
  },
  kundalini: {
    label: 'Kundalini',
    description: 'Despertar da energia serpentina',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
    breathPattern: 'Kapalabhati (respiração de fogo)',
    mantram: 'Kundalini',
  },
  movimento: {
    label: 'Movimento',
    description: 'Meditação ativa com consciência corporal',
    icon: <Wind className="w-5 h-5" />,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/20',
    breathPattern: '2-2-2-2 (respiração rápida)',
    mantram: 'Soham',
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

function generateSessionId(): string {
  return `meditation-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const rests = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${rests.toString().padStart(2, '0')}`;
}

function generatePhasesForDuration(
  theme: MeditationTheme,
  totalSeconds: number
): MeditationPhase[] {
  const config = THEME_CONFIG[theme];
  const phaseCount = Math.max(3, Math.min(5, Math.floor(totalSeconds / 180)));

  const phases: MeditationPhase[] = [];
  const phaseDuration = Math.floor(totalSeconds / phaseCount);

  const phaseNames = [
    'Preparação Sagrada',
    'Centro de Energia',
    'Expansão Consciencial',
    'Integração Espiritual',
    'Encerramento Luminoso',
  ];

  const phaseScripts: Record<MeditationTheme, string[]> = {
    transcendencia: [
      'Encontre um lugar tranquilo. Sente-se em conforto. Permita que seu corpo relaxe completamente.',
      'Observe sua respiração natural. Deixe os pensamentos passarem como nuvens no céu. Permita-se transcender.',
      'Mergulhe no silêncio interior. Sinta sua essência divina. Você é um ser de luz transcendental.',
      'Trazendo lentamente a consciência de volta. Sinta a paz transcendente permanecendo em você.',
      'Gradualmente, abra os olhos. Agradeça esta experiência sagrada.',
    ],
    curacao: [
      'Coloque as mãos sobre o coração. Permita que a energia de cura flua naturalmente.',
      'Visualize uma luz dourada envolvendo todo o seu corpo. Toda dor sendo transmutada em luz.',
      'Permita que a energia curativa alcance cada célula do seu ser. Você merece paz.',
      'Sinta as feridas antigas se transformando em sabedoria. Você está inteiro.',
      'Retorne ao momento presente com gratidão. A cura já operou em você.',
    ],
    protecao: [
      'Visualize um escudo de luz dourada ao seu redor. Esta luz é impenetrável e proteção absoluta.',
      'Recite mentalmente: "Eu sou um ser de luz protegido por forças superiores."',
      'Sinta a luz sagrada envolvendo cada célula do seu corpo. Nenhuma energia negativa pode penetrar.',
      'Agradeça pela proteção concedida. Você está seguro no abraço do divino.',
      'Traga sua consciência de volta ao corpo. Abra os olhos lentamente.',
    ],
    manifestacao: [
      'Prepare sua mente para receber. Visualize seu desejo manifestando na realidade.',
      'Conecte-se com a energia criadora do universo. Você é um manifestador poderoso.',
      'Permita que a intenção se cristalize em forma. A manifestação está em processo.',
      'Sinta a certeza de que seu desejo já está se materializando.',
      'Agradeça antecipadamente. Recomenda-se gratidão pela manifestação que virá.',
    ],
    ancestral: [
      'Conecte-se com sua linhagem ancestral. Sinta a presença dos que vieram antes.',
      'Peça permissão aos ancestrais para receber sua sabedoria e proteção.',
      'Permita que a sabedoria dos seus antepassados flua através de você.',
      'Sinta-se abraçado pela nuvem de testemunhas. Você não está sozinho.',
      'Lembre-se: você carrega em si o legado de todos que vieram antes.',
    ],
    equilibrio: [
      'Observe seu estado atual sem julgamento. Reconheça o que está em equilíbrio.',
      'Respire profundamente e libere as tensões acumuladas em cada inspiração.',
      'Permita que os opostos se harmonizem em você: luz e sombra, força e suavidade.',
      'Sinta o centro de seu ser ancorado na estabilidade.',
      'Retorne ao mundo restaurado em equilíbrio e harmonia.',
    ],
    sabedoria: [
      'Abra sua mente para receber insights profundos e revelações.',
      'Peça à sabedoria divina para guiar seus pensamentos e decisões.',
      'Permita que a inteligência cósmica flua através de você.',
      'Sinta as respostas emergindo do silêncio interior.',
      'Integre a sabedoria recebida em sua consciência desperta.',
    ],
    harmonizacao: [
      'Escaneie seu corpo energético. Identifique onde necesita atenção.',
      'Visualize cada chakra se equilibrando em seu centro. Comece pela base.',
      'Permita que a energia flua livremente entre todos os centros de força.',
      'Sinta os vórtices de energia ressoando em harmonia perfeita.',
      'Agradeça pelo equilíbrio alcançado. Seus chakras estão harmonizados.',
    ],
    kundalini: [
      'Prepare-se para despertar a energia vital que dorme em você.',
      'Ative a respiração de fogo. Sinta a energia se acumulando na base da coluna.',
      'Permita que a serpente de luz suba pela coluna vertebral.',
      'Sinta cada chakra se abrindo à medida que a energia passa.',
      'Integre esta força vital. Você é um ser multidimensional.',
    ],
    movimento: [
      'Tome consciência do seu corpo no espaço. Sinta cada movimento consciente.',
      'Permita que a respiração guie seus movimentos sutis.',
      'Observe sem julgamento. Você é testemunha do seu próprio corpo.',
      'Sinta a energia vital circulando através de cada dança interna.',
      'Retorne ao silêncio. O movimento sagrou sua consciência.',
    ],
  };

  for (let i = 0; i < phaseCount; i++) {
    phases.push({
      name: phaseNames[i] || `Fase ${i + 1}`,
      duration: phaseDuration,
      script: phaseScripts[theme][i] || 'Permita-se relaxar completamente nesta fase essencial.',
      guidance: `Mantenha o padrão respiratório: ${config.breathPattern}`,
    });
  }

  return phases;
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface ThemeCardProps {
  theme: MeditationTheme;
  isSelected: boolean;
  onClick: () => void;
}

function ThemeCard({ theme, isSelected, onClick }: ThemeCardProps) {
  const config = THEME_CONFIG[theme];

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-left w-full',
        isSelected
          ? 'border-primary bg-primary/10 shadow-md'
          : 'border-border/50 bg-card hover:border-primary/50 hover:bg-card/80'
      )}
    >
      <div className={cn('flex items-center gap-2', isSelected ? config.color : 'text-muted-foreground')}>
        <span className={config.bgColor + ' p-1.5 rounded-lg'}>{config.icon}</span>
        <span className="font-medium text-sm">{config.label}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{config.description}</p>
    </button>
  );
}

interface DurationButtonProps {
  value: number;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function DurationButton({ label, isSelected, onClick }: DurationButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
        isSelected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
    </button>
  );
}

interface TimerDisplayProps {
  remainingSeconds: number;
  totalSeconds: number;
  currentPhase: number;
  totalPhases: number;
}

function TimerDisplay({ remainingSeconds, totalSeconds, currentPhase, totalPhases }: TimerDisplayProps) {
  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none" className="text-border/30" />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="text-primary transition-all duration-1000 ease-linear"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-mono font-bold tabular-nums">{formatTime(remainingSeconds)}</span>
          <span className="text-xs text-muted-foreground mt-1">
            Fase {currentPhase + 1}/{totalPhases}
          </span>
        </div>
      </div>
    </div>
  );
}

interface PhaseGuideProps {
  phase: MeditationPhase;
}

function PhaseGuide({ phase }: PhaseGuideProps) {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-card border border-border/50">
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-primary" />
        <span className="font-medium text-sm">{phase.name}</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{phase.script}</p>
      <div className="flex items-start gap-2 text-xs text-muted-foreground/80">
        <Clock className="w-3 h-3 mt-0.5 shrink-0" />
        <span>{phase.guidance}</span>
      </div>
    </div>
  );
}

function MeditationSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="flex gap-2 justify-center">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-16 h-10 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-32 rounded-xl bg-muted" />
    </div>
  );
}

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-destructive/10 border border-destructive/20">
      <AlertCircle className="w-8 h-8 text-destructive" />
      <p className="text-sm text-center text-muted-foreground">{message}</p>
      <button onClick={onRetry} className="flex items-center gap-2 text-sm text-primary hover:underline">
        <RefreshCw className="w-4 h-4" />
        Tentar novamente
      </button>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

type MeditationState = 'setup' | 'loading' | 'ready' | 'meditating' | 'paused' | 'completed' | 'error';

export function AIMeditationGuide({
  userData,
  className = '',
  onComplete,
}: AIMeditationGuideProps) {
  // State
  const [state, setState] = useState<MeditationState>('setup');
  const [selectedTheme, setSelectedTheme] = useState<MeditationTheme>('curacao');
  const [selectedDuration, setSelectedDuration] = useState<5 | 10 | 15 | 20>(10);
  const [phases, setPhases] = useState<MeditationPhase[]>([]);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Timer ref using useRef for mutable values
  const timerRef = useRef<{ interval: ReturnType<typeof setInterval> | null; startTime: number; pausedAt: number }>({
    interval: null,
    startTime: 0,
    pausedAt: 0,
  });

  // Computed values
  const currentPhase = phases[currentPhaseIndex];
  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  // Start meditation
  const handleStartMeditation = useCallback(async () => {
    setState('loading');
    setErrorMessage('');

    try {
      const durationConfig = DURATION_OPTIONS.find((d) => d.value === selectedDuration);
      const seconds = durationConfig?.seconds ?? 600;
      const generatedPhases = generatePhasesForDuration(selectedTheme, seconds);

      setPhases(generatedPhases);
      setTotalSeconds(seconds);
      setRemainingSeconds(seconds);
      setCurrentPhaseIndex(0);
      setSessionId(generateSessionId());

      setState('ready');
      await new Promise((resolve) => setTimeout(resolve, 500));
      setState('meditating');
    } catch (error) {
      console.error('Failed to initialize meditation:', error);
      setErrorMessage('Erro ao inicializar a meditação. Tente novamente.');
      setState('error');
    }
  }, [selectedTheme, selectedDuration]);

  // Timer effect
  useEffect(() => {
    if (state !== 'meditating') return;

    timerRef.current.startTime = Date.now();
    timerRef.current.interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerRef.current.startTime) / 1000);
      const currentPhaseStart = phases.slice(0, currentPhaseIndex).reduce((sum, p) => sum + p.duration, 0);
      const phaseElapsed = elapsed - currentPhaseStart;

      if (currentPhaseIndex < phases.length) {
        const phaseDuration = phases[currentPhaseIndex]?.duration ?? 0;
        if (phaseElapsed >= phaseDuration) {
          if (currentPhaseIndex < phases.length - 1) {
            setCurrentPhaseIndex((prev) => prev + 1);
          } else {
            const session: MeditationSession = {
              id: sessionId,
              startedAt: new Date(Date.now() - totalSeconds * 1000),
              endedAt: new Date(),
              durationMinutes: Math.round(totalSeconds / 60),
              theme: selectedTheme,
              phases,
              completed: true,
            };
            onComplete?.(session);
            setState('completed');
          }
        } else {
          const totalRemaining = phases.slice(currentPhaseIndex).reduce((sum, p) => sum + p.duration, 0) - phaseElapsed;
          setRemainingSeconds(totalRemaining);
        }
      }
    }, 100);

    return () => {
      if (timerRef.current.interval) clearInterval(timerRef.current.interval);
    };
  }, [state, currentPhaseIndex, phases, sessionId, totalSeconds, selectedTheme, onComplete]);

  // Pause/Resume
  const handlePauseResume = useCallback(() => {
    if (state === 'meditating') {
      timerRef.current.pausedAt = Date.now();
      setState('paused');
    } else if (state === 'paused') {
      const pauseDuration = Date.now() - timerRef.current.pausedAt;
      timerRef.current.startTime += pauseDuration;
      setState('meditating');
    }
  }, [state]);

  // Skip phase
  const handleSkipPhase = useCallback(() => {
    if (currentPhaseIndex < phases.length - 1) {
      setRemainingSeconds((prev) => prev - phases[currentPhaseIndex].duration);
      setCurrentPhaseIndex((prev) => prev + 1);
    } else {
      if (timerRef.current.interval) clearInterval(timerRef.current.interval);
      const session: MeditationSession = {
        id: sessionId,
        startedAt: new Date(Date.now() - totalSeconds * 1000),
        endedAt: new Date(),
        durationMinutes: Math.round(totalSeconds / 60),
        theme: selectedTheme,
        phases,
        completed: true,
      };
      onComplete?.(session);
      setState('completed');
    }
  }, [currentPhaseIndex, phases, sessionId, totalSeconds, selectedTheme, onComplete]);

  // Stop
  const handleStop = useCallback(() => {
    if (timerRef.current.interval) clearInterval(timerRef.current.interval);
    setState('setup');
    setPhases([]);
    setRemainingSeconds(0);
    setCurrentPhaseIndex(0);
  }, []);
  // Retry
  const handleRetry = useCallback(() => {
    setState('setup');
    setErrorMessage('');
  }, []);

  // New session
  const handleNewSession = useCallback(() => {
    setState('setup');
    setPhases([]);
    setRemainingSeconds(0);
    setCurrentPhaseIndex(0);
    setSessionId('');
  }, []);

  // Theme grid
  const themeGrid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {(Object.keys(THEME_CONFIG) as MeditationTheme[]).map((theme) => (
        <ThemeCard key={theme} theme={theme} isSelected={selectedTheme === theme} onClick={() => setSelectedTheme(theme)} />
      ))}
    </div>
  );

  // === RENDER STATES ===

  if (state === 'setup') {
    return (
      <div className={cn('flex flex-col gap-6', className)}>
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary" />
          <div>
            <h2 className="font-semibold">Guia de Meditação IA</h2>
            <p className="text-sm text-muted-foreground">Personalizado para {userData.nome}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Selecione o Tema</h3>
          {themeGrid}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Duração da Sessão</h3>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((option) => (
              <DurationButton
                key={option.value}
                value={option.value}
                label={option.label}
                isSelected={selectedDuration === option.value}
                onClick={() => setSelectedDuration(option.value as 5 | 10 | 15 | 20)}
              />
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            {THEME_CONFIG[selectedTheme].icon}
            <span className="font-medium text-sm">{THEME_CONFIG[selectedTheme].label}</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              <strong>Respiração:</strong> {THEME_CONFIG[selectedTheme].breathPattern}
            </p>
            <p>
              <strong>Mantram:</strong> {THEME_CONFIG[selectedTheme].mantram}
            </p>
          </div>
        </div>

        <button
          onClick={handleStartMeditation}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Play className="w-5 h-5" />
          Iniciar Meditação
        </button>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className={cn('flex flex-col gap-6', className)}>
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary animate-pulse" />
          <h2 className="font-semibold">Preparando sua Meditação...</h2>
        </div>
        <MeditationSkeleton />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={cn('flex flex-col gap-6', className)}>
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary" />
          <h2 className="font-semibold">Guia de Meditação IA</h2>
        </div>
        <ErrorDisplay message={errorMessage} onRetry={handleRetry} />
      </div>
    );
  }

  if (state === 'ready') {
    return (
      <div className={cn('flex flex-col gap-6', className)}>
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary" />
          <h2 className="font-semibold">Preparado para Meditar</h2>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className={cn('p-4 rounded-full', THEME_CONFIG[selectedTheme].bgColor)}>
            {THEME_CONFIG[selectedTheme].icon}
          </div>
          <h3 className="font-medium">{THEME_CONFIG[selectedTheme].label}</h3>
          <p className="text-sm text-muted-foreground text-center">
            Encontre um lugar confortável, feche os olhos e prepare-se para a jornada espiritual.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleStop}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <XCircle className="w-5 h-5" />
            Cancelar
          </button>
          <button
            onClick={handleStartMeditation}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Play className="w-5 h-5" />
            Começar
          </button>
        </div>
      </div>
    );
  }

  if (state === 'meditating' || state === 'paused') {
    return (
      <div className={cn('flex flex-col gap-6', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">{THEME_CONFIG[selectedTheme].label}</span>
          </div>
          <span className="text-xs text-muted-foreground">{Math.round(progress)}% completo</span>
        </div>

        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <TimerDisplay remainingSeconds={remainingSeconds} totalSeconds={totalSeconds} currentPhase={currentPhaseIndex} totalPhases={phases.length} />

        {currentPhase && <PhaseGuide phase={currentPhase} />}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border/50 text-muted-foreground hover:text-foreground hover:border-destructive/50 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Parar
          </button>

          <button
            onClick={handlePauseResume}
            className={cn(
              'flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors',
              state === 'meditating' ? 'bg-amber-500/20 text-amber-600 hover:bg-amber-500/30' : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {state === 'meditating' ? <><Pause className="w-4 h-4" /> Pausar</> : <><Play className="w-4 h-4" /> Continuar</>}
          </button>

          <button
            onClick={handleSkipPhase}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            Próxima Fase
          </button>
        </div>

        <div className="flex justify-center">
          <span className="text-xs text-muted-foreground">
            Mantram: <strong>{THEME_CONFIG[selectedTheme].mantram}</strong>
          </span>
        </div>
      </div>
    );
  }

  if (state === 'completed') {
    return (
      <div className={cn('flex flex-col gap-6', className)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-full bg-green-500/20">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Meditação Completa</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Parabéns, {userData.nome}! Você completou sua sessão de meditação.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-card border border-border/50">
          <div className="text-center">
            <p className="text-2xl font-bold">{Math.round(totalSeconds / 60)}</p>
            <p className="text-xs text-muted-foreground">minutos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{phases.length}</p>
            <p className="text-xs text-muted-foreground">fases</p>
          </div>
          <div className="text-center">
            <span className={THEME_CONFIG[selectedTheme].color}>
              <p className="text-sm font-medium">{THEME_CONFIG[selectedTheme].label}</p>
            </span>
            <p className="text-xs text-muted-foreground">tema</p>
          </div>
        </div>

        <center>
          <p className="text-sm text-center leading-relaxed">
            Que a paz desta prática permaneça em você. Que a luz sagrada ilumine seu caminho.
          </p>
        </center>

        <button
          onClick={handleNewSession}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Nova Meditação
        </button>
      </div>
    );
  }

  // Default/fallback
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex items-center gap-3">
        <Brain className="w-6 h-6 text-primary" />
        <h2 className="font-semibold">Guia de Meditação IA</h2>
      </div>
      <MeditationSkeleton />
    </div>
  );
}

export default AIMeditationGuide;
