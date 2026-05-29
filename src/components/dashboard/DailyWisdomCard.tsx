'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Moon,
  Sun,
  Heart,
  Lightbulb,
  RefreshCw,
  Loader2,
  AlertCircle,
  Star,
  Flame,
  Wind,
  Droplets,
  Zap,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ============================================================
// TYPES
// ============================================================

interface DailyWisdomCardProps {
  userData: UserSpiritualData;
  userId: string;
  className?: string;
  onExpand?: () => void;
}

interface UserSpiritualData {
  nome: string;
  dataNascimento: string;
  numeroPessoal?: number;
  orixaRegente?: string;
  odu?: string;
  arcanoPessoal?: number;
  sefirotDominante?: string[];
}

interface DailyWisdom {
  // Original fields
  affirmation: string;
  mantra: string;
  spiritualTip: string;
  moonPhase: string;
  orixaMessage: string;
  // New enhanced fields
  oduOfTheDay: string;
  oduDescription: string;
  tarotCard: TarotCardInfo;
  elementalFocus: ElementalFocus;
  aiDailyMessage: string;
  luckyNumber: number;
  colorOfTheDay: string;
}

interface TarotCardInfo {
  name: string;
  meaning: string;
  advice: string;
}

interface ElementalFocus {
  element: 'Fogo' | 'Água' | 'Terra' | 'Ar' | 'Éter';
  description: string;
  practice: string;
  icon: React.ReactNode;
}

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

// ============================================================
// CONSTANTS
// ============================================================

const TAROT_CARDS = [
  { name: 'O Mago', meaning: 'Manifestação, resourceful, poder', advice: 'Use sua habilidade e vontade para criar mudanças positivas.' },
  { name: 'A Alta Sacerdotisa', meaning: 'Intuição, misticismo, sabedoria interior', advice: 'Confie em sua voz interior e nos seus sonhos.' },
  { name: 'A Imperadora', meaning: 'Fertilidade, abundância, maternidade', advice: 'Cultive seu jardim interior e celebre sua criatividade.' },
  { name: 'O Imperador', meaning: 'Autoridade, estrutura, liderança', advice: 'Estabeleça limites saudáveis e tome decisões firmes.' },
  { name: 'O Hierofante', meaning: 'Tradição, espiritualidade, ensino', advice: 'Busque orientação em figuras de sabedoria.' },
  { name: 'Os Enamorados', meaning: 'Amor, união, escolhas', advice: 'Siga seu coração em decisões importantes.' },
  { name: 'O Carro', meaning: 'Vitória, determinação, sucesso', advice: 'Mantenha o foco em seus objetivos com disciplina.' },
  { name: 'A Justiça', meaning: 'Equilíbrio, verdade, causa e efeito', advice: 'Busque a verdade e aja com integridade.' },
  { name: 'O Eremita', meaning: 'Introspecção, solitude, busca interior', advice: 'Reserve tempo para reflexão e autoconhecimento.' },
  { name: 'A Roda da Fortuna', meaning: 'Mudança, ciclos, destino', advice: 'Aceite as mudanças como parte do crescimento.' },
  { name: 'A Força', meaning: 'Coragem, perseverança, compaixão', advice: 'Use sua força interior para superar obstáculos.' },
  { name: 'O Enforcado', meaning: 'Sacrifício, nova perspectiva, pausa', advice: 'Às vezes我们需要停下脚步，重新审视我们的处境。' },
  { name: 'A Morte', meaning: 'Transformação, fim de ciclo, renovação', advice: 'Libere o que não serve mais para dar espaço ao novo.' },
  { name: 'A Temperança', meaning: 'Equilíbrio, harmonia, paciência', advice: 'Encontre o ponto médio entre extremos.' },
  { name: 'O Diabo', meaning: 'Tentação, sombra, materialismo', advice: 'Reconheça suas prisões e escolha a libertação.' },
  { name: 'A Torre', meaning: 'Mudança súbita, revelação, despertar', advice: 'Receba as mudanças com coragem e apertura.' },
  { name: 'A Estrela', meaning: 'Esperança, inspiração, serenidade', advice: 'Mantenha a esperança e permita que sua luz brilhe.' },
  { name: 'A Lua', meaning: 'Ilusão, medo, intuição', advice: 'Confie em sua intuição mesmo na escuridão.' },
  { name: 'O Sol', meaning: 'Sucesso, alegria, vitalidade', advice: 'Celebre suas conquistas e compartilhe sua luz.' },
  { name: 'O Julgamento', meaning: 'Renovação, redenção, despertar', advice: 'Accept your past and embrace your true calling.' },
  { name: 'O Mundo', meaning: 'Completude, realização, integração', advice: 'Você está próximo de completar um ciclo importante.' },
];

const ODUS = [
  { id: 'Eji-Okwonla', meaning: 'Destino e sabedoria', practice: 'Ritual de proteção e开门.' },
  { id: 'Ogbe', meaning: 'Começo e expansão', practice: 'Oração para novos projetos.' },
  { id: 'Oyeku', meaning: ' Transformação e equilíbrio', practice: 'Meditação de harmonia.' },
  { id: 'Iwori', meaning: 'Paciência e aprendizado', practice: 'Escuta ativa e observação.' },
  { id: 'Odi', meaning: 'Comunicação e união', practice: 'Ritual de conexão.' },
  { id: 'Osí', meaning: 'Segurança e proteção', practice: 'Oração de proteção.' },
];

const ELEMENTS: Record<string, { icon: React.ReactNode; color: string; description: string }> = {
  'Fogo': { icon: <Flame className="w-4 h-4" />, color: 'text-orange-400', description: 'Energia de transformação e paixão' },
  'Água': { icon: <Droplets className="w-4 h-4" />, color: 'text-blue-400', description: 'Fluxo emocional e purificação' },
  'Terra': { icon: <Target className="w-4 h-4" />, color: 'text-emerald-400', description: 'Fundação e estabilidade' },
  'Ar': { icon: <Wind className="w-4 h-4" />, color: 'text-slate-400', description: 'Comunicação e clareza mental' },
  'Éter': { icon: <Zap className="w-4 h-4" />, color: 'text-purple-400', description: 'Transcendência espiritual' },
};

const LUCKY_COLORS = ['Ouro', 'Azul Royale', 'Verde Esperanza', 'Roxo Místico', 'Rosa Amor'];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getCachedWisdom(userId: string): DailyWisdom | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(`daily-wisdom-${userId}`);
    if (!cached) return null;
    
    const { data, dayKey } = JSON.parse(cached);
    
    if (dayKey !== getTodayKey()) {
      localStorage.removeItem(`daily-wisdom-${userId}`);
      return null;
    }
    
    return data as DailyWisdom;
  } catch {
    return null;
  }
}

function setCachedWisdom(userId: string, wisdom: DailyWisdom): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`daily-wisdom-${userId}`, JSON.stringify({
      data: wisdom,
      timestamp: Date.now(),
      dayKey: getTodayKey(),
    }));
  } catch {
    // Storage full or unavailable
  }
}

function generateFallbackWisdom(userData: UserSpiritualData): DailyWisdom {
  const dayOfYear = getDayOfYear();
  
  // Select tarot card based on day
  const tarotIndex = (dayOfYear + (userData.numeroPessoal ?? 1)) % TAROT_CARDS.length;
  const tarotCard = TAROT_CARDS[tarotIndex];
  
  // Select Odu based on day
  const oduIndex = (dayOfYear + (userData.arcanoPessoal ?? 1)) % ODUS.length;
  const odu = ODUS[oduIndex];
  
  // Select element based on day
  const elements: Array<'Fogo' | 'Água' | 'Terra' | 'Ar' | 'Éter'> = ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'];
  const elementIndex = (dayOfYear + (userData.numeroPessoal ?? 1)) % elements.length;
  const element = elements[elementIndex];
  const elementInfo = ELEMENTS[element];
  
  // Generate lucky number
  const luckyNumber = ((dayOfYear * (userData.numeroPessoal ?? 1)) % 9) + 1;
  
  // Generate color of the day
  const colorIndex = (dayOfYear + (userData.arcanoPessoal ?? 1)) % LUCKY_COLORS.length;
  const colorOfTheDay = LUCKY_COLORS[colorIndex];
  
  // Generate AI daily message
  const aiMessages = [
    `Hoje, ${userData.orixaRegente || 'seus guias'} pedem que você mantenha o coração aberto para novas possibilidades. Sua energia está propícia para iniciações e recomeços.`,
    `A sabedoria de ${userData.orixaRegente || 'seus ancestrais'} flui através de você hoje. Confie em sua intuição e permita que a luz guie seus passos.`,
    `Este é um dia de transformação. As estrelas alinham-se para seu crescimento espiritual. Aceite as mudanças com coragem e gratidão.`,
    `${userData.orixaRegente || 'O universo'} traz mensagens importantes hoje. Preste atenção aos sinais e sincronicidades ao seu redor.`,
  ];
  const aiDailyMessage = aiMessages[dayOfYear % aiMessages.length];
  
  return {
    affirmation: `Eu, ${userData.nome}, declaro que hoje é um dia de renovação espiritual e alinhamento com minha verdade interior.`,
    mantra: 'Eu sou a luz que ilumina meu caminho',
    spiritualTip: 'Pratique a gratidão intensa hoje, reconhecendo as bênçãos em sua vida.',
    moonPhase: 'Lua Cheia - energia de completude e iluminação',
    orixaMessage: `${userData.orixaRegente || 'Oxum'} traz sabedoria e amor neste dia. Permaneça em paz.`,
    oduOfTheDay: odu.id,
    oduDescription: odu.meaning,
    tarotCard: {
      name: tarotCard.name,
      meaning: tarotCard.meaning,
      advice: tarotCard.advice,
    },
    elementalFocus: {
      element,
      description: elementInfo.description,
      practice: odu.practice,
      icon: elementInfo.icon,
    },
    aiDailyMessage,
    luckyNumber,
    colorOfTheDay: colorOfTheDay,
  };
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface WisdomItemProps {
  icon: React.ReactNode;
  label: string;
  content: string;
  variant?: 'default' | 'highlight' | 'accent' | 'cosmic';
}

function WisdomItem({ icon, label, content, variant = 'default' }: WisdomItemProps) {
  return (
    <div className={cn(
      'flex gap-3 p-3 rounded-lg transition-colors',
      variant === 'highlight' && 'bg-amber-500/10 border border-amber-500/20',
      variant === 'accent' && 'bg-purple-500/10 border border-purple-500/20',
      variant === 'cosmic' && 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20',
      variant === 'default' && 'bg-slate-500/5'
    )}>
      <div className="flex-shrink-0 mt-0.5 text-spiritual-500">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}

interface MoonPhaseBadgeProps {
  phase: string;
}

function MoonPhaseBadge({ phase }: MoonPhaseBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
      <Moon className="size-3.5" />
      <span>{phase}</span>
    </div>
  );
}

interface OrixaBadgeProps {
  name: string;
}

function OrixaBadge({ name }: OrixaBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-600 dark:text-purple-400">
      <Sun className="size-3.5" />
      <span>{name}</span>
    </div>
  );
}

interface OduBadgeProps {
  odu: string;
}

function OduBadge({ odu }: OduBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400">
      <Star className="size-3.5" />
      <span>{odu}</span>
    </div>
  );
}

interface TarotCardDisplayProps {
  card: TarotCardInfo;
}

function TarotCardDisplay({ card }: TarotCardDisplayProps) {
  return (
    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Star className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{card.name}</p>
          <p className="text-xs text-purple-400 mt-0.5">{card.meaning}</p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{card.advice}</p>
        </div>
      </div>
    </div>
  );
}

interface ElementalBadgeProps {
  element: ElementalFocus;
}

function ElementalBadge({ element }: ElementalBadgeProps) {
  const elementInfo = ELEMENTS[element.element];
  
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/30">
      <div className={cn('p-1.5 rounded-lg bg-slate-600', elementInfo.color)}>
        {element.icon}
      </div>
      <div>
        <p className="text-xs font-medium text-white">{element.element}</p>
        <p className="text-xs text-slate-400">{element.description}</p>
      </div>
    </div>
  );
}

interface LuckyInfoProps {
  number: number;
  color: string;
}

function LuckyInfo({ number, color }: LuckyInfoProps) {
  return (
    <div className="flex items-center gap-4 p-2">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-amber-500/20 rounded-lg">
          <span className="text-lg font-bold text-amber-400">{number}</span>
        </div>
        <div>
          <p className="text-xs text-slate-400">Número da Sorte</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
        <div>
          <p className="text-xs text-slate-400">Cor do Dia</p>
          <p className="text-xs text-white">{color}</p>
        </div>
      </div>
    </div>
  );
}

interface AIMessageCardProps {
  message: string;
  orixaRegente?: string;
}

function AIMessageCard({ message, orixaRegente }: AIMessageCardProps) {
  return (
    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-purple-500/20">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-medium text-purple-400 uppercase tracking-wide">Mensagem Divina</p>
            {orixaRegente && (
              <span className="text-xs text-amber-400">de {orixaRegente}</span>
            )}
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function DailyWisdomCard({ userData, userId, className, onExpand }: DailyWisdomCardProps) {
  const [wisdom, setWisdom] = React.useState<DailyWisdom | null>(null);
  const [loadingState, setLoadingState] = React.useState<LoadingState>('idle');
  const [error, setError] = React.useState<string | null>(null);

  // Load cached wisdom or generate new one on mount
  React.useEffect(() => {
    const loadWisdom = async () => {
      // Try to load from cache first
      const cached = getCachedWisdom(userId);
      if (cached) {
        setWisdom(cached);
        setLoadingState('loaded');
        return;
      }

      // Generate new wisdom if no cache
      setLoadingState('loading');
      setError(null);

      try {
        // Simulate AI generation delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newWisdom = generateFallbackWisdom(userData);
        setWisdom(newWisdom);
        setCachedWisdom(userId, newWisdom);
        setLoadingState('loaded');
      } catch (err) {
        console.error('Failed to generate daily wisdom:', err);
        setError('Não foi possível carregar a sabedoria diária. Tente novamente.');
        setLoadingState('error');
      }
    };

    loadWisdom();
  }, [userId, userData]);

  const handleRefresh = async () => {
    setLoadingState('loading');
    setError(null);

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`daily-wisdom-${userId}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      const newWisdom = generateFallbackWisdom(userData);
      setWisdom(newWisdom);
      setCachedWisdom(userId, newWisdom);
      setLoadingState('loaded');
    } catch (err) {
      console.error('Failed to refresh daily wisdom:', err);
      setError('Não foi possível atualizar a sabedoria diária.');
      setLoadingState('error');
    }
  };

  return (
    <Card 
      className={cn(
        'relative overflow-hidden border border-slate-700/50 bg-slate-800/50',
        onExpand && 'cursor-pointer hover:bg-slate-800/70 transition-colors',
        className
      )}
      onClick={onExpand}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            <CardTitle className="text-lg">
              Sabedoria Diária
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {wisdom && <OduBadge odu={wisdom.oduOfTheDay} />}
            {wisdom && <MoonPhaseBadge phase="Lua Cheia" />}
            {wisdom && <OrixaBadge name={userData.orixaRegente || 'Oxum'} />}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              disabled={loadingState === 'loading'}
              className="h-8 w-8 p-0"
              title="Atualizar sabedoria"
            >
              {loadingState === 'loading' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loadingState === 'loading' && !wisdom && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-spiritual-500" />
            <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
              Gerando sua sabedoria diária...
            </span>
          </div>
        )}

        {loadingState === 'error' && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle className="size-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {wisdom && (
          <div className="space-y-3">
            {/* AI Daily Message - Most prominent */}
            <AIMessageCard message={wisdom.aiDailyMessage} orixaRegente={userData.orixaRegente} />

            {/* Lucky Info */}
            <LuckyInfo number={wisdom.luckyNumber} color={wisdom.colorOfTheDay} />

            {/* Daily Affirmation */}
            <WisdomItem
              icon={<Heart className="size-4" />}
              label="Afirmação do Dia"
              content={wisdom.affirmation}
              variant="highlight"
            />

            {/* Tarot Card of the Day */}
            <TarotCardDisplay card={wisdom.tarotCard} />

            {/* Elemental Focus */}
            <ElementalBadge element={wisdom.elementalFocus} />

            {/* Mantra */}
            <WisdomItem
              icon={<Sparkles className="size-4" />}
              label="Mantra"
              content={wisdom.mantra}
              variant="accent"
            />

            {/* Odu of the Day */}
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Star className="size-4 text-amber-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Odu do Dia
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-400">{wisdom.oduOfTheDay}</p>
                  <p className="text-xs text-slate-400 mt-1">{wisdom.oduDescription}</p>
                </div>
                <p className="text-xs text-slate-500">Prática: {wisdom.elementalFocus.practice}</p>
              </div>
            </div>

            {/* Orixá of the Day Message */}
            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="size-4 text-purple-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Mensagem do Orixá
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {wisdom.orixaMessage}
              </p>
            </div>

            {/* Spiritual Tip */}
            <WisdomItem
              icon={<Lightbulb className="size-4" />}
              label="Dica Espiritual"
              content={wisdom.spiritualTip}
            />

            {/* Moon Phase Influence */}
            <div className="p-3 rounded-lg bg-slate-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="size-4 text-blue-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Influência da Lua
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {wisdom.moonPhase}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DailyWisdomCard;