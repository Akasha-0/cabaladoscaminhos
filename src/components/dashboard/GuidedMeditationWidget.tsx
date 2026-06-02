'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProfileById } from '@/lib/orixa/orixa-profiles';
import { getData as getChakraData } from '@/lib/chakra/v4/chakra-v4-data';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Wind,
  Heart,
  Sparkles,
  Moon,
  Zap,
  Circle,
  Volume2,
  VolumeX,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface GuidedMeditationWidgetProps {
  userId?: string;
  userOrixa?: string;
}

type TimerDuration = 5 | 10 | 15 | 20;
type MeditationTab = 'timer' | 'guided' | 'breathing' | 'affirmation';

interface GuidedScript {
  id: string;
  title: string;
  description: string;
  duration: number;
  script: string[];
}

interface AffirmationItem {
  text: string;
  author?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const TIMER_PRESETS: TimerDuration[] = [5, 10, 15, 20];

const ORIXAS_MEDITATIONS: Record<string, GuidedScript[]> = {
  Oxum: [
    {
      id: 'oxum-love',
      title: 'Meditação do Amor de Oxum',
      description: 'Conexão com a energia do amor e da suavidade',
      duration: 10,
      script: [
        'Sente-se confortavelmente e feche os olhos...',
        'Respire profundamente e sinta a presença de Oxum...',
        'Imagine uma luz dourada emanando do seu coração...',
        'Essa luz representa o amor unconditional de Oxum...',
        'Permita que essa energia flua por todo o seu ser...',
        'Sinta-se amada, valorizada e em paz...',
        'Oxum é a sua fonte de amor e prosperidade...',
        'Receba essa bênção com gratidão...',
      ],
    },
    {
      id: 'oxum-water',
      title: 'Mergulho nas Águas de Oxum',
      description: 'Purificação e renovação emocional',
      duration: 15,
      script: [
        'Permita que o seu corpo relaxe completamente...',
        'Visualize-se às margens de um rio cristalino...',
        'Oxum está ali, emanando luz dourada sobre a água...',
        'Entre no rio lentamente, sentindo a água abraçá-lo...',
        'Cada волнаcarrega away preocupações e mágoas...',
        'Sinta a água purificando sua essência...',
        'Oxum lava suas dores com amor infinito...',
        'Quando emergir, você se sentirá renovado...',
      ],
    },
  ],
  Oxalá: [
    {
      id: 'oxala-peace',
      title: 'Paz de Oxalá',
      description: 'Calma e serenidade espiritual',
      duration: 10,
      script: [
        'Feche os olhos e permita que a luz de Oxalá o envolve...',
        'Oxalá é pureza, paz e criação Divina...',
        'Sinta sua presença branca envolvendo todo o seu ser...',
        'Em cada respiração, você absorve sua luz Divina...',
        'Suas preocupações se dissolvem na luz de Oxalá...',
        'Você é amado, protegido e abençoado...',
        'Oxalá traz paz aos que O buscam...',
        'Descanse nessa luz por todo o sempre...',
      ],
    },
    {
      id: 'oxala-creation',
      title: 'Criação com Oxalá',
      description: 'Manifestação e novas beginnings',
      duration: 15,
      script: [
        'Sinta Oxalá diante de você, senhor da criação...',
        'Ele segura a força criadora do universo...',
        'Peça a Oxalá que abençoe suas intenções...',
        'Visualize seus sonhos manifestando-se...',
        'Cada pensamento positivo é uma semente de Oxalá...',
        'Com paciência e fé, seus frutos chegarão...',
        'Oxalá é o pai de todas as possibilidade...',
        'Você foi criado para brilhar...',
      ],
    },
  ],
  Iansã: [
    {
      id: 'iansa-power',
      title: 'Poder de Iansã',
      description: 'Força e transformação',
      duration: 10,
      script: [
        'Sinta o trovão e o raio de Iansã...',
        'Ela é a deusa da tempestade e da transformação...',
        'Sua energia de fogo desperta dentro de você...',
        'Iansã dá força para superar obstáculos...',
        'Você tem o poder de transformar sua realidade...',
        'Não tema a mudança, abrace-a...',
        'Iansã está ao seu lado, dando coragem...',
        'Levante-se e conquiste seu destino...',
      ],
    },
  ],
  Ogum: [
    {
      id: 'ogum-courage',
      title: 'Coragem de Ogum',
      description: 'Determinação e superação',
      duration: 10,
      script: [
        'Ogum, deus das batalhas, está com você...',
        'Sua espada corta todo medo e dúvida...',
        'Você tem força para enfrentar qualquer desafio...',
        'Ogum abre caminhos onde não há caminhos...',
        'Sua determinação é inabalável...',
        'Cada passo que você dá é backed pela força de Ogum...',
        'Não há obstáculo que você não possa superar...',
        'Você é um guerreiro da luz...',
      ],
    },
  ],
  Xangô: [
    {
      id: 'xango-justice',
      title: 'Justiça de Xangô',
      description: 'Equilíbrio e verdade',
      duration: 10,
      script: [
        'Xangô, senhor do raio e da justiça...',
        'Ele traz equilíbrio entre luz e escuridão...',
        'Sinta sua autoridade e integridade...',
        'A justiça de Xangô protege os inocentes...',
        'Você merece ser tratado com respeito...',
        'Defenda sua verdade com coragem...',
        'Xangô traz harmonia aos que O invocam...',
        'Que a equilíbrio de Xangô guie seus passos...',
      ],
    },
  ],
  default: [
    {
      id: 'universal-peace',
      title: 'Paz Universal',
      description: 'Conexão com a energia Divina',
      duration: 10,
      script: [
        'Feche os olhos e respire profundamente...',
        'Permita que a luz Divina o envolve...',
        'Você está conectado com toda a criação...',
        'Essa paz infinita é seu direito de nascimento...',
        'Release all tensão and worry...',
        'You are worthy of love and joy...',
        'A luz Divina cura todas as feridas...',
        'Descanse na paz eterna...',
      ],
    },
  ],
};

const CHAKRA_MEDITATIONS: Record<string, GuidedScript[]> = {
  Muladhara: [
    {
      id: 'chakra-root',
      title: 'Meditação do Chakra Raiz',
      description: 'Estabilização e segurança',
      duration: 10,
      script: [
        'Sente-se com a coluna ereta...',
        'Visualize o chakra raiz na base da coluna...',
        'Ele brilha em vermelho vibrante...',
        'Imagine raízes saindo do seu corpo para a terra...',
        'Essas raízes o ancoram ao chão...',
        'Sinta-se seguro e estabilizado...',
        'O chakra raiz traz confiança e força...',
        'Permita que a energia da terra o sustenta...',
      ],
    },
  ],
  Svadhisthana: [
    {
      id: 'chakra-sacral',
      title: 'Meditação do Chakra Sacral',
      description: 'Criatividade e emoção',
      duration: 10,
      script: [
        'Localize o chakra sacral abaixo do umbigo...',
        'Ele pulsa em laranja quente...',
        'Sinta sua energia criativa fluindo...',
        'Você tem无限 posibilidades...',
        'Suas emoções são válidas e importantes...',
        'O chakra sacral governa sua criatividade...',
        'Permita que sua luz interior brilhe...',
        'Abunde em sua expressão autêntica...',
      ],
    },
  ],
  Manipura: [
    {
      id: 'chakra-solar',
      title: 'Meditação do Chakra Solar',
      description: 'Poder pessoal e transformação',
      duration: 10,
      script: [
        'Encontre o chakra do plexo solar...',
        'Ele brilha em amarelo dourado...',
        'Sinta seu poder pessoal e determinação...',
        'Você tem força para criar mudanças...',
        'O chakra solar governa sua vontade...',
        'Utilize essa energia para seus objetivos...',
        'Você é capaz de realizar grandes feitos...',
        'Queime com a luz do seu fogo interior...',
      ],
    },
  ],
  Anahata: [
    {
      id: 'chakra-heart',
      title: 'Meditação do Chakra Cardíaco',
      description: 'Amor e compaixão',
      duration: 15,
      script: [
        'Pressione suas mãos sobre o coração...',
        'Sinta o chakra cardíaco no centro do peito...',
        'Ele pulsa em verde vibrante...',
        'Imagine um verde expandindo pelo seu corpo...',
        'Você é digno de amor e respeito...',
        'O amor que você dá retorna multiplicado...',
        'Perdoe a si mesmo e aos outros...',
        'O amor é a força mais poderosa do universo...',
      ],
    },
  ],
  Vishuddha: [
    {
      id: 'chakra-throat',
      title: 'Meditação do Chakra da Garganta',
      description: 'Comunicação e verdade',
      duration: 10,
      script: [
        'Localize o chakra da garganta...',
        'Ele brilha em azul cielo...',
        'Sinta sua capacidade de se expressar...',
        'Sua voz merece ser ouvida...',
        'O chakra da garganta governa a comunicação...',
        'Fale sua verdade com amor...',
        'Você merece se expressar livremente...',
        'Que suas palavras sejam honestas e compassivas...',
      ],
    },
  ],
  Ajna: [
    {
      id: 'chakra-third-eye',
      title: 'Meditação do Terceiro Olho',
      description: 'Intuição e sabedoria',
      duration: 15,
      script: [
        'Feche os olhos e dirija sua atenção ao centro...',
        'Entre as sobrancelhas, o terceiro olho se abre...',
        'Ele brilha em indigo profundo...',
        'Sua intuição é sua bússola interior...',
        'Confie nos insights que surgem...',
        'O terceiro olho vê além do visível...',
        'Você tem acesso à sabedoria divina...',
        'Permita que a visão se abra lentamente...',
      ],
    },
  ],
  Sahasrara: [
    {
      id: 'chakra-crown',
      title: 'Meditação do Chakra Coronário',
      description: 'Conexão divina e iluminação',
      duration: 20,
      script: [
        'Imagine uma luz dourada acima da sua cabeça...',
        'O chakra coronário se abre como uma flor de lótus...',
        'Ele brilha em violeta e branco...',
        'Você está conectado com a energia Divina...',
        'Deixe a luz fluir através de você...',
        'Cada célula do seu corpo está sendo iluminada...',
        'Você é parte de algo maior...',
        'Descanse na luz infinita da consciência...',
      ],
    },
  ],
};

const MOON_MEDITATIONS: Record<string, GuidedScript[]> = {
  new: [
    {
      id: 'moon-new',
      title: 'Meditação da Lua Nova',
      description: 'Novos começos e intenções',
      duration: 15,
      script: [
        'A Lua Nova traz novos começos...',
        'É um momento de plantar sementes...',
        'Visualize suas intenções para este ciclo...',
        'O que você deseja criar?',
        'A Lua Nova favorece novos projetos...',
        'Faça seus pedidos ao universo...',
        'Esta é a hora de começar...',
        'Que esta lua traga manifestação...',
      ],
    },
  ],
  waxing: [
    {
      id: 'moon-waxing',
      title: 'Meditação da Lua Crescente',
      description: 'Crescimento eビルド',
      duration: 15,
      script: [
        'A Lua Crescente traz crescimento...',
        'Suas intenções estão se materializando...',
        'Sinta a energia de crescimento ao seu redor...',
        'Continue trabalhando em seus objetivos...',
        'A energia está a seu favor...',
        'Mantenha o foco e a determinação...',
        'Cada dia traz mais força...',
        'Você está construindo seu futuro...',
      ],
    },
  ],
  full: [
    {
      id: 'moon-full',
      title: 'Meditação da Lua Cheia',
      description: 'Culminação eGratidão',
      duration: 15,
      script: [
        'A Lua Cheia ilumina sua jornada...',
        'Celebre tudo que você alcançou...',
        'A Lua Cheia potencializa sua energia...',
        'Sinta a luz lunar envolvendo você...',
        'Agradheça por todas as bênçãos...',
        'Este é um momento de culminação...',
        'Libere o que não serve mais...',
        'A lua abençoa sua reflexão...',
      ],
    },
  ],
  waning: [
    {
      id: 'moon-waning',
      title: 'Meditação da Lua Minguante',
      description: 'Liberação e perdão',
      duration: 15,
      script: [
        'A Lua Minguante convida à liberação...',
        'É hora de deixar ir...',
        'O que você precisa soltar?',
        'Perdoe a si mesmo e aos outros...',
        'A Lua Minguante ajuda a limpiar...',
        'Libere mágoas e ressentimentos...',
        'Você merece paz e liberdade...',
        'Que a lua leve embora o peso...',
      ],
    },
  ],
};

const BREATHING_PATTERNS = {
  '478': {
    name: 'Respiração 4-7-8',
    inhale: 4,
    hold: 7,
    exhale: 8,
    description: 'Técnica para relaxamento profundo e sono',
  },
};

const DAILY_AFFIRMATIONS: AffirmationItem[] = [
  { text: 'Eu sou merecedor de amor e felicidade.' },
  { text: 'Minhas ações criam impactos positivos no mundo.' },
  { text: 'Eu confio no processo da vida.' },
  { text: 'Minha intuição me guia corretamente.' },
  { text: 'Eu sou abundante em todas as áreas da vida.' },
  { text: 'Aceito minhas imperfeições como parte da minha unicidade.' },
  { text: 'O universo conspira a meu favor.' },
  { text: 'Eu escolho pensamentos que nutrem meu bem-estar.' },
  { text: 'Sou grato por mais um dia de oportunidades.' },
  { text: 'Minha luz interior ilumina meu caminho.' },
  { text: 'Eu me perdoo por erros passados e sigo em frente.' },
  { text: 'Tenho coragem de enfrentar meus medos.' },
  { text: 'Minha energia atrai pessoas e situações positivas.' },
  { text: 'Cada dia tráz novos aprendizados e crescimentos.' },
  { text: 'Eu manifesto minha realidade com pensamentos positivos.' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getAffirmationOfDay(): AffirmationItem {
  const dayIndex = getDayOfYear();
  return DAILY_AFFIRMATIONS[dayIndex % DAILY_AFFIRMATIONS.length];
}

function getMoonPhase(): string {
  // Simple moon phase calculation
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // Simplified calculation based on known new moon dates
  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09;
  const phase = jd / 29.5305882;
  const phaseNum = phase - Math.floor(phase);
  
  if (phaseNum < 0.0625) return 'new';
  if (phaseNum < 0.3125) return 'waxing';
  if (phaseNum < 0.4375) return 'full';
  return 'waning';
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface TimerPresetProps {
  duration: TimerDuration;
  isSelected: boolean;
  onClick: () => void;
}

function TimerPreset({ duration, isSelected, onClick }: TimerPresetProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        isSelected
          ? 'bg-primary/20 text-primary border border-primary/30'
          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
      }`}
    >
      {duration} min
    </button>
  );
}

interface CircularTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
}

function CircularTimer({ remainingSeconds, totalSeconds, isRunning }: CircularTimerProps) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = remainingSeconds / totalSeconds;
  const strokeDashoffset = circumference * (1 - progress);
  
  return (
    <div className="relative w-52 h-52 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-700"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#timerGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
        <defs>
          <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold tabular-nums ${isRunning ? 'animate-pulse' : ''}`}>
          {formatTime(remainingSeconds)}
        </span>
        <span className="text-xs text-slate-500 mt-1">
          {isRunning ? 'em prática' : 'pronto'}
        </span>
      </div>
    </div>
  );
}

interface BreathingCircleProps {
  phase: 'inhale' | 'hold' | 'exhale' | 'idle';
  count: number;
}

function BreathingCircle({ phase, count }: BreathingCircleProps) {
  const getScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.2 + (count / 4) * 0.3;
      case 'exhale':
        return 1.5 - (count / 8) * 0.3;
      default:
        return 1.2;
    }
  };
  
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <div
        className={`w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-4 border-cyan-500/50 flex items-center justify-center transition-transform duration-1000 ${
          phase === 'hold' ? 'animate-pulse' : ''
        }`}
        style={{ transform: `scale(${getScale()})` }}
      >
        <span className="text-2xl font-bold text-cyan-300">
          {phase === 'idle' ? '▶' : count}
        </span>
      </div>
      <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
    </div>
  );
}

interface BreathingPhaseLabelProps {
  phase: 'inhale' | 'hold' | 'exhale' | 'idle';
}

function BreathingPhaseLabel({ phase }: BreathingPhaseLabelProps) {
  const labels: Record<string, string> = {
    inhale: 'Inspire...',
    hold: 'Segure...',
    exhale: 'Expire...',
    idle: 'Pressione Play',
  };
  
  return (
    <span className="text-lg text-cyan-300 animate-pulse">
      {labels[phase]}
    </span>
  );
}

interface GuidedScriptCardProps {
  script: GuidedScript;
  onStart: () => void;
}

function GuidedScriptCard({ script, onStart }: GuidedScriptCardProps) {
  return (
    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-medium text-slate-200 mb-1">{script.title}</h4>
          <p className="text-sm text-slate-400 mb-2">{script.description}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>{script.duration} min</span>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={onStart}>
          <Play className="w-4 h-4 mr-1" />
          Start
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

// fallow-ignore-next-line complexity
export function GuidedMeditationWidget({ userOrixa }: GuidedMeditationWidgetProps) {
  const [activeTab, setActiveTab] = useState<MeditationTab>('timer');
  const [selectedDuration, setSelectedDuration] = useState<TimerDuration>(10);
  const [timerSeconds, setTimerSeconds] = useState(selectedDuration * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Breathing state
  const [breathingPhase, setBreathingPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathingCount, setBreathingCount] = useState(0);
  const [isBreathingRunning, setIsBreathingRunning] = useState(false);
  
  // Affirmation state
  const [currentAffirmation, setCurrentAffirmation] = useState(getAffirmationOfDay());
  const [isAffirmationPlaying, setIsAffirmationPlaying] = useState(false);
  
  // Guided meditation state
  const [selectedScript, setSelectedScript] = useState<GuidedScript | null>(null);
  const [scriptStep, setScriptStep] = useState(0);
  const [isScriptRunning, setIsScriptRunning] = useState(false);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const orixaProfile = userOrixa ? getProfileById(userOrixa) : null;
  const chakraData = getChakraData();
  const moonPhase = getMoonPhase();
  
  const playBell = useCallback((type: 'start' | 'end') => {
    if (!soundEnabled) return;
    
    // Create bell sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = type === 'start' ? 528 : 432;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 2);
    } catch (e) {
      // Fallback: just log, bell sound may not work in all browsers
      console.log(`Bell ${type} triggered`);
    }
  }, [soundEnabled]);

  
  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playBell('end');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, timerSeconds]);

  
  // Breathing logic
  useEffect(() => {
    if (!isBreathingRunning || breathingPhase === 'idle') return;
    
    const pattern = BREATHING_PATTERNS['478'];
    let targetCount: number;
    
    switch (breathingPhase) {
      case 'inhale':
        targetCount = pattern.inhale;
        break;
      case 'hold':
        targetCount = pattern.hold;
        break;
      case 'exhale':
        targetCount = pattern.exhale;
        break;
      default:
        targetCount = 0;
    }
    
    breathingIntervalRef.current = setInterval(() => {
      setBreathingCount((prev) => {
        if (prev >= targetCount) {
          // Move to next phase
          if (breathingPhase === 'exhale') {
            setBreathingPhase('inhale');
          } else if (breathingPhase === 'inhale') {
            setBreathingPhase('hold');
          } else {
            setBreathingPhase('exhale');
          }
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    
    return () => {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, [isBreathingRunning, breathingPhase]);
  
  // Affirmation rotation
  useEffect(() => {
    if (!isAffirmationPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentAffirmation((prev) => {
        const currentIndex = DAILY_AFFIRMATIONS.findIndex(a => a.text === prev.text);
        const nextIndex = (currentIndex + 1) % DAILY_AFFIRMATIONS.length;
        return DAILY_AFFIRMATIONS[nextIndex];
      });
    }, 15000); // Change every 15 seconds
    
    return () => clearInterval(interval);
  }, [isAffirmationPlaying]);
  
  const handleStartTimer = useCallback(() => {
    playBell('start');
    setIsTimerRunning(true);
  }, [playBell]);
  
  const handlePauseTimer = useCallback(() => {
    setIsTimerRunning(false);
  }, []);
  
  const handleResetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setTimerSeconds(selectedDuration * 60);
  }, [selectedDuration]);
  
  const handleDurationChange = useCallback((duration: TimerDuration) => {
    setSelectedDuration(duration);
    setTimerSeconds(duration * 60);
    setIsTimerRunning(false);
  }, []);
  
  const handleStartBreathing = useCallback(() => {
    setBreathingPhase('inhale');
    setBreathingCount(0);
    setIsBreathingRunning(true);
  }, []);
  
  const handleStopBreathing = useCallback(() => {
    setIsBreathingRunning(false);
    setBreathingPhase('idle');
    setBreathingCount(0);
  }, []);
  
  const handleStartScript = useCallback((script: GuidedScript) => {
    setSelectedScript(script);
    setScriptStep(0);
    setIsScriptRunning(true);
  }, []);
  
  const handleNextScriptStep = useCallback(() => {
    if (!selectedScript) return;
    
    if (scriptStep < selectedScript.script.length - 1) {
      setScriptStep((prev) => prev + 1);
    } else {
      setIsScriptRunning(false);
      setSelectedScript(null);
      setScriptStep(0);
    }
  }, [selectedScript, scriptStep]);
  
  const getOrixaMeditations = useCallback(() => {
    if (userOrixa && ORIXAS_MEDITATIONS[userOrixa]) {
      return ORIXAS_MEDITATIONS[userOrixa];
    }
    // Try to find by common name variations
    for (const key of Object.keys(ORIXAS_MEDITATIONS)) {
      if (userOrixa && userOrixa.toLowerCase().includes(key.toLowerCase())) {
        return ORIXAS_MEDITATIONS[key];
      }
    }
    return ORIXAS_MEDITATIONS.default;
  }, [userOrixa]);
  
  const tabs = [
    { id: 'timer' as const, label: 'Timer', icon: Clock },
    { id: 'guided' as const, label: 'Guiado', icon: Sparkles },
    { id: 'breathing' as const, label: 'Respiração', icon: Wind },
    { id: 'affirmation' as const, label: 'Afirmação', icon: Heart },
  ];
  
  return (
    <Card className="card-spiritual overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg">Meditação Guiada</CardTitle>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            title={soundEnabled ? 'Som ligado' : 'Som desligado'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-slate-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 mt-3 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {/* Timer Tab */}
        {activeTab === 'timer' && (
          <div className="space-y-4">
            {/* Duration presets */}
            <div className="flex gap-2 flex-wrap">
              {TIMER_PRESETS.map((duration) => (
                <TimerPreset
                  key={duration}
                  duration={duration}
                  isSelected={selectedDuration === duration}
                  onClick={() => handleDurationChange(duration)}
                />
              ))}
            </div>
            
            {/* Circular timer */}
            <div className="flex justify-center py-4">
              <CircularTimer
                remainingSeconds={timerSeconds}
                totalSeconds={selectedDuration * 60}
                isRunning={isTimerRunning}
              />
            </div>
            
            {/* Controls */}
            <div className="flex justify-center gap-2">
              {!isTimerRunning ? (
                <Button onClick={handleStartTimer} className="gap-2">
                  <Play className="w-4 h-4" />
                  Iniciar
                </Button>
              ) : (
                <Button onClick={handlePauseTimer} variant="outline" className="gap-2">
                  <Pause className="w-4 h-4" />
                  Pausar
                </Button>
              )}
              <Button onClick={handleResetTimer} variant="ghost" size="icon">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Guided Meditation Tab */}
        {activeTab === 'guided' && (
          <div className="space-y-4">
            {/* Orixá meditations */}
            {userOrixa && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">
                  Meditações de {userOrixa}
                </h4>
                <div className="space-y-2">
                  {getOrixaMeditations().map((script) => (
                    <GuidedScriptCard
                      key={script.id}
                      script={script}
                      onStart={() => handleStartScript(script)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Chakra meditations */}
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">Chakras</h4>
              <div className="space-y-2">
                {chakraData.slice(0, 4).map((chakra) => {
                  const meditations = CHAKRA_MEDITATIONS[chakra.name];
                  if (!meditations) return null;
                  return meditations.map((script) => (
                    <GuidedScriptCard
                      key={`chakra-${script.id}`}
                      script={script}
                      onStart={() => handleStartScript(script)}
                    />
                  ));
                })}
              </div>
            </div>
            
            {/* Moon phase meditations */}
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">
                Lua {moonPhase === 'new' ? 'Nova' : moonPhase === 'waxing' ? 'Crescente' : moonPhase === 'full' ? 'Cheia' : 'Minguante'}
              </h4>
              <div className="space-y-2">
                {MOON_MEDITATIONS[moonPhase]?.map((script) => (
                  <GuidedScriptCard
                    key={`moon-${script.id}`}
                    script={script}
                    onStart={() => handleStartScript(script)}
                  />
                )) || (
                  <p className="text-sm text-slate-500">Nenhuma meditação disponível para esta fase.</p>
                )}
              </div>
            </div>
            
            {/* Active guided meditation */}
            {isScriptRunning && selectedScript && (
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-purple-900/50 to-cyan-900/50 border border-purple-500/30">
                <h4 className="font-medium text-purple-200 mb-2">{selectedScript.title}</h4>
                <p className="text-lg text-center py-6 text-slate-200 leading-relaxed">
                  &ldquo;{selectedScript.script[scriptStep]}&rdquo;
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">
                    {scriptStep + 1} / {selectedScript.script.length}
                  </span>
                  <Button size="sm" onClick={handleNextScriptStep}>
                    {scriptStep < selectedScript.script.length - 1 ? 'Próximo' : 'Finalizar'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Breathing Tab */}
        {activeTab === 'breathing' && (
          <div className="space-y-6 py-4">
            {/* Pattern info */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-cyan-300 mb-1">
                {BREATHING_PATTERNS['478'].name}
              </h4>
              <p className="text-sm text-slate-400">
                {BREATHING_PATTERNS['478'].description}
              </p>
            </div>
            
            {/* Breathing circle */}
            <div className="flex justify-center">
              <BreathingCircle phase={breathingPhase} count={breathingCount} />
            </div>
            
            {/* Phase label */}
            <div className="text-center">
              <BreathingPhaseLabel phase={breathingPhase} />
            </div>
            
            {/* Pattern visualization */}
            <div className="flex justify-center gap-2 text-xs text-slate-500">
              <span className="px-2 py-1 rounded bg-cyan-900/30">Inspire 4s</span>
              <span className="px-2 py-1 rounded bg-purple-900/30">Segure 7s</span>
              <span className="px-2 py-1 rounded bg-blue-900/30">Expire 8s</span>
            </div>
            
            {/* Controls */}
            <div className="flex justify-center gap-2">
              {!isBreathingRunning ? (
                <Button onClick={handleStartBreathing} className="gap-2 bg-cyan-600 hover:bg-cyan-500">
                  <Play className="w-4 h-4" />
                  Iniciar Respiração
                </Button>
              ) : (
                <Button onClick={handleStopBreathing} variant="outline" className="gap-2">
                  <Pause className="w-4 h-4" />
                  Parar
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Affirmation Tab */}
        {activeTab === 'affirmation' && (
          <div className="space-y-4 py-4">
            <div className="text-center mb-4">
              <p className="text-sm text-slate-500">Afirmação do dia</p>
            </div>
            
            {/* Affirmation display */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border border-purple-500/20">
              <p className="text-lg text-center text-slate-100 leading-relaxed font-medium">
                &ldquo;{currentAffirmation.text}&rdquo;
              </p>
              {currentAffirmation.author && (
                <p className="text-sm text-slate-400 text-center mt-3">
                  — {currentAffirmation.author}
                </p>
              )}
            </div>
            
            {/* Loop controls */}
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => setIsAffirmationPlaying(!isAffirmationPlaying)}
                variant={isAffirmationPlaying ? 'outline' : 'default'}
                className="gap-2"
              >
                {isAffirmationPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pausar Loop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Iniciar Loop
                  </>
                )}
              </Button>
            </div>
            
            {/* Other affirmations */}
            <div>
              <p className="text-sm text-slate-500 mb-2">Mais afirmações</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {DAILY_AFFIRMATIONS.slice(0, 8).map((aff, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentAffirmation(aff)}
                    className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                      currentAffirmation.text === aff.text
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-slate-800/30 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    {aff.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GuidedMeditationWidget;