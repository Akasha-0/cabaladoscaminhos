'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
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
  Target,
  Compass,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface ArchetypeDisplayProps {
  userData?: {
    odu?: string;
    orixaRegente?: string;
    numeroPessoal?: number;
    arcoPessoal?: number;
    sign?: string;
  };
  className?: string;
  onArchetypeSelect?: (archetype: Archetype) => void;
}

export interface Archetype {
  id: string;
  name: string;
  description: string;
  traits: string[];
  strengths: string[];
  challenges: string[];
  dominantOrixa?: string;
  color: string;
  icon: string;
  associatedOdu?: string;
  spiritualPath?: string;
  symbol?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const ARCHETYPE_ICONS: Record<string, React.ReactNode> = {
  'crown': <Crown className="w-5 h-5" />,
  'heart': <Heart className="w-5 h-5" />,
  'shield': <Shield className="w-5 h-5" />,
  'sun': <Sun className="w-5 h-5" />,
  'moon': <Moon className="w-5 h-5" />,
  'star': <Star className="w-5 h-5" />,
  'zap': <Zap className="w-5 h-5" />,
  'eye': <Eye className="w-5 h-5" />,
  'wind': <Wind className="w-5 h-5" />,
  'target': <Target className="w-5 h-5" />,
  'compass': <Compass className="w-5 h-5" />,
  'user': <User className="w-5 h-5" />,
};

const ARCHETYPE_COLORS: Record<string, { primary: string; bg: string; border: string; glow: string }> = {
  'gold': { primary: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/50', glow: 'shadow-amber-500/30' },
  'purple': { primary: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50', glow: 'shadow-purple-500/30' },
  'blue': { primary: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50', glow: 'shadow-blue-500/30' },
  'emerald': { primary: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/30' },
  'red': { primary: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', glow: 'shadow-red-500/30' },
  'cyan': { primary: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', glow: 'shadow-cyan-500/30' },
};

const ALL_ARCHETYPES: Archetype[] = [
  {
    id: 'healer',
    name: 'O Curador',
    description: 'Possui dom natural para cura energética e empatia profunda. Canaliza energia vital para restauração.',
    traits: ['Compaixão', 'Intuição', 'Sensibilidade', 'Paciência'],
    strengths: ['Capacidade de sentir a dor alheia', 'Intuição medicinal', 'Presença calmante'],
    challenges: ['Tendência a absorver energias negativas', 'Dificuldade em estabelecer limites'],
    dominantOrixa: 'Oxum',
    color: 'gold',
    icon: 'heart',
    associatedOdu: 'Ogbe',
    spiritualPath: 'Cura e restauração através da luz',
    symbol: '💧',
  },
  {
    id: 'warrior',
    name: 'O Guerreiro',
    description: 'Coragem inabalável e determinação. Protetor por natureza, enfrenta desafios com força e estratégia.',
    traits: ['Coragem', 'Determinação', 'Honra', 'Proteção'],
    strengths: ['Liderança em momentos de crise', 'Capacidade de proteção', 'Força de vontade'],
    challenges: ['Tendência à agressividade', 'Dificuldade em aceitar ajuda'],
    dominantOrixa: 'Ogum',
    color: 'red',
    icon: 'shield',
    symbol: '⚔️',
  },
  {
    id: 'sage',
    name: 'O Sábio',
    description: 'Buscador perpétuo de conhecimento. Guarda segredos ancestrais e transmite sabedoria via gerações.',
    traits: ['Sabedoria', 'Conhecimento', 'Meditação', 'Tradição'],
    strengths: ['Memória cultural profunda', 'Capacidade de ensino', 'Discernimento'],
    challenges: ['Isolamento social', 'Perfeccionismo intelectual'],
    dominantOrixa: 'Obatalá',
    color: 'blue',
    icon: 'crown',
    associatedOdu: 'Ogunda',
    spiritualPath: 'Iluminação através da busca',
    symbol: '📚',
  },
  {
    id: 'mystic',
    name: 'O Místico',
    description: 'Ponte entre planos físicos e espirituais. Possui percepção extrasensorial desenvolvida.',
    traits: ['Visão', 'Conexão', 'Transcendência', 'Misticismo'],
    strengths: ['Percepção espiritual aguçada', 'Capacidade de meditação profunda', 'Conectividade com o invisível'],
    challenges: ['Desconexão com o mundo material', 'Dificuldade em validar experiências'],
    dominantOrixa: 'Oxumar',
    color: 'purple',
    icon: 'eye',
    associatedOdu: 'Oyekun',
    spiritualPath: 'União com o divino',
    symbol: '🔮',
  },
  {
    id: 'nurturer',
    name: 'O Nutridor',
    description: 'Energia fertilizante e maternal. Cria, nutre e sustenta vida em todas as formas.',
    traits: ['Nutrição', 'Cuidado', 'Generosidade', 'Fertilidade'],
    strengths: ['Instinto maternal/paternal', 'Capacidade de criar ambiente seguro', 'Abundância energética'],
    challenges: ['Superproteção', 'Dificuldade em deixar partir'],
    dominantOrixa: 'Iemanjá',
    color: 'cyan',
    icon: 'heart',
    symbol: '🌊',
  },
  {
    id: 'transformer',
    name: 'O Transformador',
    description: 'Agente de mudança e evolução. Catalisador de transformações pessoais e coletivas.',
    traits: ['Transformação', 'Adaptação', 'Evolução', 'Rebirth'],
    strengths: ['Capacidade de se reinventar', 'Resiliência', 'Liderança em transição'],
    challenges: ['Medo do desconhecido', 'Dificuldade em manter estabilidade'],
    dominantOrixa: 'Xangô',
    color: 'gold',
    icon: 'zap',
    associatedOdu: 'Iwori',
    spiritualPath: 'Evolução contínua',
    symbol: '🔥',
  },
  {
    id: 'guardian',
    name: 'O Guardião',
    description: 'Protetor de tradições e sagrados. Mantém equilibrio entre mundo físico e espiritual.',
    traits: ['Guarda', 'Proteção', 'Tradição', 'Sacrifício'],
    strengths: ['Devoção inabalável', 'Capacidade de sacrifício', 'Conhecimento rituals'],
    challenges: ['Rigidez', 'Dificuldade em aceitar mudanças'],
    dominantOrixa: 'Nanã',
    color: 'emerald',
    icon: 'shield',
    symbol: '🛡️',
  },
  {
    id: 'lightbringer',
    name: 'O Portador de Luz',
    description: 'Iluminador de caminhos escuridos. Traz clareza e esperança onde há dúvida.',
    traits: ['Iluminação', 'Clareza', 'Esperança', 'Revelação'],
    strengths: ['Capacidade de ver verdades ocultas', 'Inspiração para outros', 'Discernimento'],
    challenges: ['O peso da verdade', 'Não ser compreendido'],
    dominantOrixa: 'Oxalá',
    color: 'gold',
    icon: 'sun',
    associatedOdu: 'Ogbe',
    spiritualPath: 'Iluminação universal',
    symbol: '✨',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function determineArchetype(userData?: ArchetypeDisplayProps['userData']): Archetype | null {
  if (!userData) return ALL_ARCHETYPES[0];

  // Map odu to archetype
  const oduArchetypes: Record<string, string> = {
    'Ogbe': 'lightbringer',
    'Ogunda': 'sage',
    'Oyekun': 'mystic',
    'Iwori': 'transformer',
  };

  if (userData.odu && oduArchetypes[userData.odu as keyof typeof oduArchetypes]) {
    return ALL_ARCHETYPES.find(a => a.id === oduArchetypes[userData.odu as keyof typeof oduArchetypes]) || ALL_ARCHETYPES[0];
  }

  // Map orixa to archetype
  const orixaArchetypes: Record<string, string> = {
    'Oxum': 'healer',
    'Ogum': 'warrior',
    'Obatalá': 'sage',
    'Oxumar': 'mystic',
    'Iemanjá': 'nurturer',
    'Xangô': 'transformer',
    'Nanã': 'guardian',
    'Oxalá': 'lightbringer',
  };

  if (userData.orixaRegente && orixaArchetypes[userData.orixaRegente as keyof typeof orixaArchetypes]) {
    return ALL_ARCHETYPES.find(a => a.id === orixaArchetypes[userData.orixaRegente as keyof typeof orixaArchetypes]) || ALL_ARCHETYPES[0];
  }

  // Fallback to number
  if (userData.numeroPessoal) {
    return ALL_ARCHETYPES[userData.numeroPessoal % ALL_ARCHETYPES.length];
  }

  return ALL_ARCHETYPES[0];
}

function getArchetypeComplement(archetype: Archetype): Archetype | undefined {
  const complementMap: Record<string, string> = {
    'healer': 'warrior',
    'warrior': 'nurturer',
    'sage': 'mystic',
    'mystic': 'lightbringer',
    'nurturer': 'guardian',
    'transformer': 'guardian',
  };

  return ALL_ARCHETYPES.find(a => a.id === complementMap[archetype.id]);
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface ArchetypeCardProps {
  archetype: Archetype;
  isActive: boolean;
  onClick: () => void;
  showDetails?: boolean;
}

function ArchetypeCard({ archetype, isActive, onClick, showDetails = false }: ArchetypeCardProps) {
  const colors = ARCHETYPE_COLORS[archetype.color] || ARCHETYPE_COLORS['purple'];
  const icon = ARCHETYPE_ICONS[archetype.icon] || ARCHETYPE_ICONS['user'];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-xl border transition-all duration-300',
        colors.bg,
        colors.border,
        isActive && 'ring-2 ring-white/30 shadow-lg',
        archetype.color === 'gold' && isActive && 'shadow-amber-500/30',
        archetype.color === 'purple' && isActive && 'shadow-purple-500/30'
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn('p-3 rounded-xl bg-slate-800/50', colors.primary)}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className={cn('font-bold', colors.primary)}>{archetype.name}</h4>
            {archetype.symbol && (
              <span className="text-xl">{archetype.symbol}</span>
            )}
          </div>
          {showDetails && (
            <p className="text-slate-400 text-sm mt-1">{archetype.description}</p>
          )}
        </div>
        {archetype.dominantOrixa && (
          <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
            {archetype.dominantOrixa}
          </span>
        )}
      </div>
    </button>
  );
}

interface ArchetypeDetailProps {
  archetype: Archetype;
  complement?: Archetype;
}

function ArchetypeDetail({ archetype, complement }: ArchetypeDetailProps) {
  const colors = ARCHETYPE_COLORS[archetype.color] || ARCHETYPE_COLORS['purple'];
  const icon = ARCHETYPE_ICONS[archetype.icon] || ARCHETYPE_ICONS['user'];

  return (
    <div className={cn('p-6 rounded-xl border', colors.bg, colors.border)}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className={cn('p-4 rounded-xl bg-slate-800/50', colors.primary)}>
          <div className="w-12 h-12 flex items-center justify-center text-2xl">
            {archetype.symbol}
          </div>
        </div>
        <div>
          <h3 className={cn('text-2xl font-bold', colors.primary)}>{archetype.name}</h3>
          {archetype.dominantOrixa && (
            <p className="text-slate-400 text-sm">Protegido por {archetype.dominantOrixa}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-300 leading-relaxed mb-4">{archetype.description}</p>

      {/* Traits */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-slate-400 mb-2">Traços Principais</h4>
        <div className="flex flex-wrap gap-2">
          {archetype.traits.map((trait, index) => (
            <span
              key={index}
              className={cn('px-3 py-1 rounded-full text-xs font-medium', colors.bg, colors.primary)}
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Strengths & Challenges */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-emerald-400 mb-2">Forças</h4>
          <ul className="space-y-1">
            {archetype.strengths.map((strength, index) => (
              <li key={index} className="text-slate-300 text-xs flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-amber-400 mb-2">Desafios</h4>
          <ul className="space-y-1">
            {archetype.challenges.map((challenge, index) => (
              <li key={index} className="text-slate-300 text-xs flex items-start gap-2">
                <span className="text-amber-400">!</span>
                {challenge}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Spiritual Path */}
      {archetype.spiritualPath && (
        <div className="mt-4 pt-4 border-t border-slate-600/30">
          <p className="text-slate-400 text-xs">
            <span className={colors.primary}>Caminho:</span> {archetype.spiritualPath}
          </p>
        </div>
      )}

      {/* Complement */}
      {complement && (
        <div className="mt-4 pt-4 border-t border-slate-600/30">
          <p className="text-slate-400 text-xs">
            <span className="text-purple-400">Complemento:</span> {complement.name}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function ArchetypeDisplay({
  userData,
  className = '',
  onArchetypeSelect,
}: ArchetypeDisplayProps) {
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [showAll, setShowAll] = useState(false);

  const mainArchetype = useMemo(() => {
    return determineArchetype(userData);
  }, [userData]);

  const activeArchetype = selectedArchetype || mainArchetype;
  const complement = activeArchetype ? getArchetypeComplement(activeArchetype) : undefined;

  const handleSelect = (archetype: Archetype) => {
    setSelectedArchetype(archetype);
    onArchetypeSelect?.(archetype);
  };

  return (
    <div className={cn('bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Arquetipos Espirituais</h3>
              <p className="text-slate-400 text-xs">
                {userData?.orixaRegente ? `Seu arquétipo: ${mainArchetype?.name}` : 'Descubra seu arquétipo'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-purple-400 hover:text-purple-300"
          >
            {showAll ? 'Mostrar principal' : 'Ver todos'}
          </button>
        </div>
      </div>

      {/* Archetype Grid */}
      <div className="p-4 space-y-3">
        {showAll ? (
          <>
            {ALL_ARCHETYPES.map(archetype => (
              <ArchetypeCard
                key={archetype.id}
                archetype={archetype}
                isActive={activeArchetype?.id === archetype.id}
                onClick={() => handleSelect(archetype)}
              />
            ))}
          </>
        ) : (
          <ArchetypeCard
            archetype={mainArchetype!}
            isActive={true}
            onClick={() => handleSelect(mainArchetype!)}
            showDetails={true}
          />
        )}
      </div>

      {/* Detail View */}
      {activeArchetype && !showAll && (
        <div className="p-4 border-t border-slate-700/50">
          <ArchetypeDetail archetype={activeArchetype} complement={complement} />
        </div>
      )}

      {/* Quick Selection */}
      {showAll && (
        <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
          <p className="text-slate-500 text-xs mb-2">Selecione um arquétipo para ver detalhes</p>
        </div>
      )}
    </div>
  );
}

export default ArchetypeDisplay;