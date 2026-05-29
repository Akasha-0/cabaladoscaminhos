'use client';

import React, { useMemo } from 'react';
import {
  User,
  Sparkles,
  Crown,
  Heart,
  Shield,
  Sun,
  Moon,
  Star,
  Zap,
  Eye,
  Wind,
  Compass,
  GitBranch,
  Sparkle,
  Calendar,
  Waves,
} from 'lucide-react';
import type { UserSpiritualData } from '@/lib/ai/insight-generator';
import {
  SpiritualCard,
  SpiritualCardHeader,
  SpiritualCardTitle,
  SpiritualCardDescription,
  SpiritualCardContent,
  SpiritualCardFooter,
} from '@/components/ui/spiritual-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

export interface SpiritualProfileViewProps {
  userData: UserSpiritualData;
  userId: string;
  className?: string;
  onExplore?: (section: string) => void;
}

export interface SpiritualSystem {
  id: string;
  name: string;
  icon: string;
  color: 'amber' | 'emerald' | 'purple' | 'blue' | 'rose' | 'yellow';
  value: string | number | null;
  description: string;
  details?: string[];
  connection?: string;
}

export interface ProfileStrength {
  level: number;
  label: string;
  description: string;
}

export interface EvolutionLevel {
  level: number;
  label: string;
  description: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const SYSTEM_COLORS: Record<string, { primary: string; bg: string; border: string; glow: string; text: string }> = {
  amber: {
    primary: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    glow: 'shadow-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
  },
  emerald: {
    primary: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    glow: 'shadow-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  purple: {
    primary: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    glow: 'shadow-purple-500/20',
    text: 'text-purple-700 dark:text-purple-300',
  },
  blue: {
    primary: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    glow: 'shadow-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
  },
  rose: {
    primary: 'from-rose-500 to-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-800',
    glow: 'shadow-rose-500/20',
    text: 'text-rose-700 dark:text-rose-300',
  },
  yellow: {
    primary: 'from-yellow-500 to-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800',
    glow: 'shadow-yellow-500/20',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
};

const SYSTEM_ICONS: Record<string, React.ReactNode> = {
  kabbalah: <Sparkle className="w-5 h-5" />,
  numerology: <Star className="w-5 h-5" />,
  astrology: <Sun className="w-5 h-5" />,
  candomble: <Waves className="w-5 h-5" />,
  tarot: <Eye className="w-5 h-5" />,
  ifa: <GitBranch className="w-5 h-5" />,
};

const SPIRITUAL_TITLES: Record<number, { title: string; description: string }> = {
  1: { title: 'Iniciado', description: 'Começando a jornada espiritual' },
  2: { title: 'Explorador', description: 'Buscando conhecimento profundo' },
  3: { title: 'Praticante', description: 'Aplicando sabedoria no cotidiano' },
  4: { title: 'Devoto', description: 'Dedicado ao caminho sagrado' },
  5: { title: 'Sábio', description: 'Compartilhando luz e conhecimento' },
  6: { title: 'Mestre', description: 'Dominando múltiplos sistemas' },
  7: { title: 'Guardião', description: 'Protegendo tradições ancestrais' },
  8: { title: 'Avatar', description: 'Canal de energia divina' },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getSpiritualTitle(arcoPessoal: number): { title: string; description: string } {
  const index = Math.min(Math.max(Math.floor(arcoPessoal / 3), 0), 7);
  return SPIRITUAL_TITLES[index + 1] || SPIRITUAL_TITLES[1];
}

function calculateProfileStrength(userData: UserSpiritualData): ProfileStrength {
  let score = 0;
  const maxScore = 10;

  if (userData.numeroPessoal) score += 1.5;
  if (userData.orixaRegente) score += 1.5;
  if (userData.sign) score += 1;
  if (userData.sefirotDominante?.length) score += 2;
  if (userData.arcoMaior?.length) score += 2;
  if (userData.odu) score += 1;
  if (userData.arcoPessoal) score += 1;

  const level = Math.min(Math.round((score / maxScore) * 100) / 10, 10);

  if (level >= 9) return { level: 10, label: 'Perfeito', description: 'Perfil espiritual completo e harmonioso' };
  if (level >= 7) return { level: 8, label: 'Avançado', description: 'Desenvolvendo poderes espirituais' };
  if (level >= 5) return { level: 6, label: 'Intermediário', description: 'Caminho em constante evolução' };
  if (level >= 3) return { level: 4, label: 'Iniciante', description: 'Primeiros passos na jornada' };
  return { level: 2, label: 'Despertando', description: 'Consciência espiritual em formação' };
}

function calculateEvolutionLevel(userData: UserSpiritualData): EvolutionLevel {
  const arco = userData.arcoPessoal || 0;
  const systemsCount = [
    userData.numeroPessoal,
    userData.orixaRegente,
    userData.sign,
    userData.sefirotDominante?.length,
    userData.arcoMaior?.length,
    userData.odu,
  ].filter(Boolean).length;

  const level = Math.min(10, Math.round((arco / 10) + (systemsCount * 0.5)));

  const descriptions: Record<number, string> = {
    1: 'Consciência desperta para a jornada',
    2: 'Explorando ensinamentos ancestrais',
    3: 'Integrando práticas espirituais',
    4: 'Desenvolvendo intuição e percepção',
    5: 'Estabelecendo conexão com orixás',
    6: 'Harmonizando sistemas de conhecimento',
    7: 'Atingindo equilíbrio interior',
    8: 'Transformando energia espiritual',
    9: 'Iluminando o caminho de outros',
    10: 'Unificação com a consciência cósmica',
  };

  return {
    level,
    label: `Nível ${level}`,
    description: descriptions[level] || descriptions[1],
  };
}

function getCorrelationDescription(systemId: string, userData: UserSpiritualData): string | undefined {
  const correlations: Record<string, string> = {
    kabbalah: `Conectado às Sefirot ${userData.sefirotDominante?.join(', ') || 'N/A'}`,
    numerology: `Número pessoal: ${userData.numeroPessoal || 'N/A'}`,
    astrology: `Signo solar: ${userData.sign || 'N/A'} | Rashi: ${userData.rashi || 'N/A'}`,
    candomble: `Orixá regente: ${userData.orixaRegente || 'N/A'}`,
    tarot: `Arco pessoal: ${userData.arcoPessoal || 'N/A'}`,
    ifa: `Odu: ${userData.odu || 'N/A'}`,
  };
  return correlations[systemId];
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface SystemCardProps {
  system: SpiritualSystem;
  isActive: boolean;
  onExplore?: () => void;
}

function SystemCard({ system, isActive, onExplore }: SystemCardProps) {
  const colors = SYSTEM_COLORS[system.color];
  const iconElement = SYSTEM_ICONS[system.id] || <Star className="w-5 h-5" />;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border p-5 transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        colors.bg,
        colors.border,
        isActive && `shadow-lg ${colors.glow}`
      )}
    >
      {/* Background glow effect */}
      <div
        className={cn(
          'absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity',
          `bg-gradient-to-br ${colors.primary}`
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                `bg-gradient-to-br ${colors.primary}`,
                'text-white shadow-md'
              )}
            >
              {iconElement}
            </div>
            <div>
              <h3 className={cn('font-semibold', colors.text)}>{system.name}</h3>
              <p className="text-xs text-muted-foreground">{system.id.toUpperCase()}</p>
            </div>
          </div>
          {system.value && (
            <Badge
              variant="outline"
              className={cn('text-xs', colors.bg, colors.text)}
            >
              {typeof system.value === 'number' ? `#${system.value}` : system.value}
            </Badge>
          )}
        </div>

        {/* Value display */}
        <div className="mb-3">
          <span className={cn('text-2xl font-bold', colors.text)}>
            {system.value || 'N/A'}
          </span>
        </div>

        {/* Description */}
        <p className="mb-3 text-sm text-muted-foreground leading-relaxed">
          {system.description}
        </p>

        {/* Details */}
        {system.details && system.details.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {system.details.map((detail, index) => (
              <span
                key={index}
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs',
                  colors.bg,
                  colors.text
                )}
              >
                {detail}
              </span>
            ))}
          </div>
        )}

        {/* Connection */}
        {system.connection && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-background/50 p-2">
            <Compass className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{system.connection}</span>
          </div>
        )}

        {/* Explore button */}
        {onExplore && (
          <button
            onClick={onExplore}
            className={cn(
              'mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium',
              'transition-all duration-200',
              `bg-gradient-to-r ${colors.primary} text-white`,
              'opacity-0 group-hover:opacity-100'
            )}
          >
            Explorar {system.name}
            <Eye className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface ProfileStrengthMeterProps {
  strength: ProfileStrength;
  colors: { primary: string; bg: string; border: string; glow: string; text: string };
}

function ProfileStrengthMeter({ strength, colors }: ProfileStrengthMeterProps) {
  const percentage = (strength.level / 10) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Força do Perfil</span>
        <div className="flex items-center gap-2">
          <span className={cn('text-lg font-bold', colors.text)}>{strength.level}/10</span>
          <Badge className={cn(`bg-gradient-to-r ${colors.primary} text-white`)}>
            {strength.label}
          </Badge>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            `bg-gradient-to-r ${colors.primary}`
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{strength.description}</p>
    </div>
  );
}

interface EvolutionMeterProps {
  evolution: EvolutionLevel;
  colors: { primary: string; bg: string; border: string; glow: string; text: string };
}

function EvolutionMeter({ evolution, colors }: EvolutionMeterProps) {
  const percentage = (evolution.level / 10) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Nível de Evolução</span>
        <div className="flex items-center gap-2">
          <Sparkles className={cn('h-4 w-4', colors.text)} />
          <span className={cn('text-lg font-bold', colors.text)}>{evolution.label}</span>
        </div>
      </div>
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
          <div
            key={level}
            className={cn(
              'h-2 w-6 rounded-full transition-all duration-300',
              level <= evolution.level
                ? `bg-gradient-to-r ${colors.primary}`
                : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{evolution.description}</p>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpiritualProfileView({
  userData,
  userId,
  className = '',
  onExplore,
}: SpiritualProfileViewProps) {
  // Handle missing or invalid data
  const safeUserData = useMemo(() => {
    if (!userData) {
      return {
        id: userId,
        nome: 'Usuário',
        dataNascimento: '',
        numeroPessoal: 0,
        arcoPessoal: 0,
        odu: '',
        orixaRegente: '',
        sefirotDominante: [],
        arcoMaior: [],
        sign: '',
        houses: {},
        rashi: '',
      } as UserSpiritualData;
    }
    return userData;
  }, [userData, userId]);

  // Calculate profile metrics
  const profileStrength = useMemo(
    () => calculateProfileStrength(safeUserData),
    [safeUserData]
  );

  const evolutionLevel = useMemo(
    () => calculateEvolutionLevel(safeUserData),
    [safeUserData]
  );

  const spiritualTitle = useMemo(
    () => getSpiritualTitle(safeUserData.arcoPessoal || 0),
    [safeUserData.arcoPessoal]
  );

  // Define spiritual systems
  const systems = useMemo<SpiritualSystem[]>(() => {
    const sefirotDisplay = safeUserData.sefirotDominante?.length
      ? safeUserData.sefirotDominante.slice(0, 3).join(', ')
      : undefined;
    const arcoDisplay = safeUserData.arcoMaior?.length
      ? safeUserData.arcoMaior.slice(0, 3).join(', ')
      : undefined;

    return [
      {
        id: 'kabbalah',
        name: 'Cabala',
        icon: '🔯',
        color: 'amber',
        value: sefirotDisplay || safeUserData.sefirotDominante?.[0] || null,
        description: 'Sistema místico de iluminação divina através das Sefirot',
        details: safeUserData.sefirotDominante?.slice(0, 5),
        connection: getCorrelationDescription('kabbalah', safeUserData),
      },
      {
        id: 'numerology',
        name: 'Numerologia',
        icon: '🔢',
        color: 'emerald',
        value: safeUserData.numeroPessoal,
        description: 'Ciência dos números e sua influência no destino',
        details: [`Arco ${safeUserData.arcoPessoal || 'N/A'}`],
        connection: getCorrelationDescription('numerology', safeUserData),
      },
      {
        id: 'astrology',
        name: 'Astrologia',
        icon: '⭐',
        color: 'purple',
        value: safeUserData.sign || null,
        description: 'Leitura celestial do mapa astral e posicionamento cósmico',
        details: safeUserData.rashi ? [safeUserData.rashi] : undefined,
        connection: getCorrelationDescription('astrology', safeUserData),
      },
      {
        id: 'candomble',
        name: 'Candomblé',
        icon: '🌀',
        color: 'blue',
        value: safeUserData.orixaRegente || null,
        description: 'Tradição afro-brasileira de conexão com os orixás',
        details: safeUserData.houses ? Object.keys(safeUserData.houses).slice(0, 3) : undefined,
        connection: getCorrelationDescription('candomble', safeUserData),
      },
      {
        id: 'tarot',
        name: 'Tarot',
        icon: '🃏',
        color: 'rose',
        value: safeUserData.arcoPessoal ? `Arco ${safeUserData.arcoPessoal}` : null,
        description: 'Arcanos maiores revelando o caminho da alma',
        details: arcoDisplay ? [arcoDisplay] : undefined,
        connection: getCorrelationDescription('tarot', safeUserData),
      },
      {
        id: 'ifa',
        name: 'Ifá/Odu',
        icon: '📿',
        color: 'yellow',
        value: safeUserData.odu || null,
        description: 'Oráculo ancestral de sabedoria yorubá',
        details: safeUserData.odu ? ['Odu primário'] : undefined,
        connection: getCorrelationDescription('ifa', safeUserData),
      },
    ];
  }, [safeUserData]);

  // Handle explore action
  const handleExplore = (section: string) => {
    if (onExplore) {
      onExplore(section);
    }
  };

  // Determine dominant color for meters
  const dominantColor = 'amber';

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-gradient-to-tr from-orange-500/10 to-amber-500/10 blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {safeUserData.nome || 'Perfil Espiritual'}
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <Crown className="mr-1 h-3 w-3" />
                  {spiritualTitle.title}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {spiritualTitle.description}
                </span>
              </div>
            </div>
          </div>
          
          {safeUserData.dataNascimento && (
            <p className="mt-3 text-sm text-muted-foreground">
              <Calendar className="inline mr-1 h-3 w-3" />
              Nascido em {new Date(safeUserData.dataNascimento).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>

      {/* Systems Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {systems.map((system) => (
          <SystemCard
            key={system.id}
            system={system}
            isActive={!!system.value}
            onExplore={onExplore ? () => handleExplore(system.id) : undefined}
          />
        ))}
      </div>

      {/* Footer with metrics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl border bg-card p-5">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 blur-2xl" />
          <div className="relative z-10">
            <ProfileStrengthMeter
              strength={profileStrength}
              colors={SYSTEM_COLORS[dominantColor]}
            />
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-xl border bg-card p-5">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-2xl" />
          <div className="relative z-10">
            <EvolutionMeter
              evolution={evolutionLevel}
              colors={SYSTEM_COLORS['purple']}
            />
          </div>
        </div>
      </div>

      {/* Dominant Patterns */}
      {safeUserData.sefirotDominante?.length || safeUserData.arcoMaior?.length ? (
        <div className="relative overflow-hidden rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Padrões Dominantes</h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {safeUserData.sefirotDominante?.length ? (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Sefirot Dominantes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {safeUserData.sefirotDominante.map((sefira, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
                    >
                      {sefira}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            
            {safeUserData.arcoMaior?.length ? (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Arco Maior
                </h3>
                <div className="flex flex-wrap gap-2">
                  {safeUserData.arcoMaior.map((arc, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
                    >
                      #{arc}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Correlations Summary */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/40 dark:to-slate-900/40 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <h2 className="text-lg font-semibold">Conexões Entre Sistemas</h2>
        </div>
        
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {safeUserData.orixaRegente && (
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3">
              <Waves className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Candomblé → Cabala</p>
                <p className="text-sm font-medium">
                  {safeUserData.orixaRegente}
                </p>
              </div>
            </div>
          )}
          
          {safeUserData.numeroPessoal && (
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3">
              <Star className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-xs text-muted-foreground">Numerologia → Astrologia</p>
                <p className="text-sm font-medium">
                  #{safeUserData.numeroPessoal} • {safeUserData.sign || 'N/A'}
                </p>
              </div>
            </div>
          )}
          
          {safeUserData.odu && (
            <div className="flex items-center gap-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-3">
              <GitBranch className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-xs text-muted-foreground">Ifá → Tarot</p>
                <p className="text-sm font-medium">
                  {safeUserData.odu}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpiritualProfileView;