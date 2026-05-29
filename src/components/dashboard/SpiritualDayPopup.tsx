'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Sparkles,
  Moon,
  Star,
  Flame,
  Droplets,
  Wind,
  Zap,
  Heart,
  Shield,
  Calendar,
} from 'lucide-react';
import { DAY_CORRELATIONS } from '@/lib/correlation/SpiritualCorrelationEngine';

// Moon phases data for popup
const MOON_PHASES_DATA: Record<string, {
  name: string;
  emoji: string;
  energy: string;
  recommended: string[];
}> = {
  new: {
    name: 'Lua Nova',
    emoji: '🌑',
    energy: 'Introspecção e Renovação',
    recommended: ['Definir intenções', 'Novos começos', 'Purificação'],
  },
  waxing: {
    name: 'Lua Crescente',
    emoji: '🌓',
    energy: 'Crescimento e Manifestação',
    recommended: ['Rituais de prosperidade', 'Amplificar intenções', 'Cura emocional'],
  },
  firstQuarter: {
    name: 'Quarto Crescente',
    emoji: '🌔',
    energy: 'Ação e Determinação',
    recommended: ['Decisões importantes', 'Coragem', 'Avançar projetos'],
  },
  waxingGibbous: {
    name: 'Gibosa Crescente',
    emoji: '🌔',
    energy: 'Refinamento e Paciência',
    recommended: ['Ajustar planos', 'Estudos espirituais', 'Buscar sabedoria'],
  },
  full: {
    name: 'Lua Cheia',
    emoji: '🌕',
    energy: 'Iluminação e Manifestação',
    recommended: ['Gratidão', 'Rituais de cura', 'Perdão', 'Celebração'],
  },
  waningGibbous: {
    name: 'Gibosa Minguante',
    emoji: '🌖',
    energy: 'Gratidão e Avaliação',
    recommended: ['Agradecimentos', 'Compartilhar conhecimento', 'Avaliar metas'],
  },
  lastQuarter: {
    name: 'Quarto Minguante',
    emoji: '🌗',
    energy: 'Libertação e Perdão',
    recommended: ['Limpeza', 'Perdão', 'Eliminar padrões', 'Rituais com Omolu'],
  },
  waning: {
    name: 'Lua Minguante',
    emoji: '🌘',
    energy: 'Descanso e Regeneração',
    recommended: ['Meditação', 'Autocuidado', 'Proteção espiritual'],
  },
};

// Types
interface DaySpiritualData {
  date: Date;
  dayOfWeek: string;
  orixa: string;
  orixaSymbol: string;
  element: string;
  elementEmoji: string;
  energyLevel: 'low' | 'medium' | 'high' | 'peak';
  moonPhase?: string;
  moonPhaseEmoji?: string;
  isRitualDay: boolean;
  isFullMoon: boolean;
  isNewMoon: boolean;
}

interface SpiritualDayPopupProps {
  dayData: DaySpiritualData;
  onClose: () => void;
}

// Orixá ritual data
const ORIXAS_RITUALS: Record<string, {
  title: string;
  rituals: string[];
  offerings?: string[];
  affirmations: string[];
  colors: string[];
  chakra: string;
}> = {
  'Oxalá': {
    title: 'Dia de Oxalá - Deus da Paz e Criação',
    rituals: ['Oração da paz', 'Meditação branca', 'Rituais de reconciliação'],
    offerings: ['Flores brancas', 'Fumo branco', 'Água de cheiro'],
    affirmations: ['Que a paz me governe', 'Eu sou luz e pureza', 'Desço em paz'],
    colors: ['Branco', 'Lilás'],
    chakra: 'Coronário',
  },
  'Ogum': {
    title: 'Dia de Ogum - Deus da Guerra',
    rituals: ['Rituais de proteção', 'Desbravamento de caminhos', 'Força e coragem'],
    offerings: ['Espada', 'Mel', 'Azeite'],
    affirmations: ['Eu tenho garra', 'Nenhum obstáculo me para', 'Comigo não há derrota'],
    colors: ['Verde', 'Azul'],
    chakra: 'Plexo Solar',
  },
  'Oxóssi': {
    title: 'Dia de Oxóssi - Deus da Caça',
    rituals: ['Busca de conhecimento', 'Rituais de abundância', 'Conquistas'],
    offerings: ['Flecha', 'Fumo', 'Mel'],
    affirmations: ['A riqueza vem a mim', 'Eu caço meus objetivos', 'Sou próspero'],
    colors: ['Verde', 'Azul'],
    chakra: 'Cardíaco',
  },
  'Iemanjá': {
    title: 'Dia de Iemanjá - Rainha do Mar',
    rituals: ['Rituais de proteção materna', 'Amor e ternura', 'Saudação às águas'],
    offerings: ['Flores', 'Perfume', 'Água do mar'],
    affirmations: ['Sou amada e protegida', 'Minha mãe me abençoa', 'Fluo como as águas'],
    colors: ['Azul', 'Branco'],
    chakra: 'Cardíaco',
  },
  'Xangô': {
    title: 'Dia de Xangô - Deus da Justiça',
    rituals: ['Rituais de justiça', 'Equilíbrio e verdade', 'Força de vontade'],
    offerings: ['Aço', 'Pão', 'Vinho'],
    affirmations: ['A verdade me liberta', 'Tenho poder sobre meu destino', 'Justiça é minha lei'],
    colors: ['Vermelho', 'Branco'],
    chakra: 'Plexo Solar',
  },
  'Oxum': {
    title: 'Dia de Oxum - Deusa do Ouro',
    rituals: ['Rituais de prosperidade', 'Amor e fertilidade', 'Beleza e charme'],
    offerings: ['Ouro', 'Mel', 'Perfume'],
    affirmations: ['Sou próspera', 'Ouro flui em minha vida', 'Sou amável e estimada'],
    colors: ['Amarelo', 'Rosa'],
    chakra: 'Cardíaco',
  },
  'Iansã': {
    title: 'Dia de Iansã - Deusa dos Ventos',
    rituals: ['Rituais de transformação', 'Mudanças e coragem', 'Proteção contra mau-olhado'],
    offerings: ['Lenha', 'Pimenta', 'Fumo'],
    affirmations: ['Sou feroz e imbatível', 'Transformo tempestades em brisa', 'Não temo o perigo'],
    colors: ['Vermelho', 'Rosa'],
    chakra: 'Cardíaco',
  },
  'Omolu': {
    title: 'Dia de Omolu - Deus das Doenças',
    rituals: ['Rituais de cura', 'Proteção contra epidemias', 'Saudação à Terra'],
    offerings: ['Pau-brasil', 'Charuto', 'Agridoce'],
    affirmations: ['Sou curado de todo mal', 'Minha saúde é restaurada', 'A terra me protege'],
    colors: ['Preto', 'Vermelho'],
    chakra: 'Basic',
  },
  'Obaluaê': {
    title: 'Dia de Obaluaê - Deus das Encarnações',
    rituals: ['Rituais de renovação', 'Mortalidade e imortalidade', 'Saudação aos mortos'],
    affirmations: ['Renovo minha essência', 'Morro e renasco em luz', 'Sou eterno'],
    colors: ['Azul', 'Branco'],
    chakra: 'Basic',
  },
  'Oyá': {
    title: 'Dia de Oyá - Deusa dos Tufos',
    rituals: ['Rituais de proteção', 'Comunicação com ancestrais', 'Tempestades'],
    affirmations: ['Sou imbatível', 'Meus mortos me protegem', 'Tempestade é meu nome'],
    colors: ['Amarelo', 'Vermelho'],
    chakra: 'Cardíaco',
  },
  'Nanã': {
    title: 'Dia de Nanã - Deusa das Alianças',
    rituals: ['Rituais de matrimônio', 'União e fidelidade', 'Saudação às mucamas'],
    affirmations: ['Meus compromissos são sagrados', 'Unido pelo divino', 'Honra e lealdade'],
    colors: ['Azul', 'Rosa'],
    chakra: 'Cardíaco',
  },
  'Eshu': {
    title: 'Dia de Eshu - Deus dos Caminhos',
    rituals: ['Rituais de abertura de caminhos', 'Proteção nas viagens', 'Encontros e mediações'],
    affirmations: ['Meus caminhos se abrem', 'Eshu me protege de travessuras', 'Sorte me acompanha'],
    colors: ['Preto', 'Vermelho'],
    chakra: 'Plexo Solar',
  },
};

// Element icons
const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  'Fogo': <Flame className="w-4 h-4 text-orange-400" />,
  'Água': <Droplets className="w-4 h-4 text-blue-400" />,
  'Terra': <Shield className="w-4 h-4 text-amber-600" />,
  'Ar': <Wind className="w-4 h-4 text-cyan-300" />,
  'Éter': <Sparkles className="w-4 h-4 text-purple-400" />,
};

// Energy level config
const ENERGY_CONFIG: Record<string, {
  label: string;
  color: string;
  bg: string;
  description: string;
}> = {
  low: {
    label: 'Baixa',
    color: 'text-slate-400',
    bg: 'bg-slate-500/20',
    description: 'Dia para descanso e introspecção',
  },
  medium: {
    label: 'Média',
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    description: 'Dia propício para atividades moderadas',
  },
  high: {
    label: 'Alta',
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    description: 'Dia favorável para rituais e práticas',
  },
  peak: {
    label: 'Pico',
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    description: 'Dia de máxima energia espiritual',
  },
};

export function SpiritualDayPopup({ dayData, onClose }: SpiritualDayPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const formattedDate = dayData.date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const orixaData = ORIXAS_RITUALS[dayData.orixa] || {
    title: `Dia de ${dayData.orixa}`,
    rituals: ['Rituais gerais'],
    affirmations: ['Bênçãos sobre mim'],
    colors: ['Branco'],
    chakra: 'Coronário',
  };

  const moonData = dayData.moonPhase ? MOON_PHASES_DATA[dayData.moonPhase] : null;
  const energyConfig = ENERGY_CONFIG[dayData.energyLevel];

  const getEnergyWidth = () => {
    switch (dayData.energyLevel) {
      case 'low': return '25%';
      case 'medium': return '50%';
      case 'high': return '75%';
      case 'peak': return '100%';
      default: return '50%';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        ref={popupRef}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-purple-500/30 max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl shadow-purple-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 p-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 capitalize">{formattedDate}</p>
              <h3 className="text-lg font-semibold text-slate-100">
                {dayData.date.getDate()} de {dayData.date.toLocaleDateString('pt-BR', { month: 'long' })}
              </h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Orixá of the Day */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{dayData.orixaSymbol}</span>
              <div>
                <p className="text-xs text-amber-400 font-medium">Orixá do Dia</p>
                <h4 className="text-lg font-semibold text-slate-100">{dayData.orixa}</h4>
              </div>
            </div>
            <p className="text-sm text-slate-300">{orixaData.title}</p>
            
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-amber-500/20">
              <div className="flex items-center gap-2">
                {ELEMENT_ICONS[dayData.element]}
                <span className="text-xs text-slate-400">{dayData.element}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-400">{orixaData.chakra}</span>
              </div>
              <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                {orixaData.colors.join(' / ')}
              </Badge>
            </div>
          </div>

          {/* Energy Level */}
          <div className={cn('p-4 rounded-xl border', energyConfig.bg, 'border-slate-500/20')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className={cn('w-5 h-5', energyConfig.color)} />
                <span className="font-medium text-slate-100">Nível de Energia</span>
              </div>
              <Badge className={cn(energyConfig.bg, energyConfig.color)}>
                {energyConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mt-1">{energyConfig.description}</p>
            
            <div className="mt-3 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', energyConfig.color.replace('text-', 'bg-'))}
                style={{ width: getEnergyWidth() }}
              />
            </div>
          </div>

          {/* Moon Phase */}
          {moonData && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{moonData.emoji}</span>
                <div>
                  <p className="text-xs text-blue-400 font-medium">Fase Lunar</p>
                  <h4 className="text-base font-semibold text-slate-100">{moonData.name}</h4>
                </div>
                {(dayData.isFullMoon || dayData.isNewMoon) && (
                  <Badge className="ml-auto bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                    {dayData.isFullMoon ? '🌕 Pico' : '🌑 Portal'}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-300">{moonData.energy}</p>
              
              <div className="mt-3 pt-3 border-t border-blue-500/20">
                <p className="text-xs text-blue-400 font-medium mb-2">Recomendado</p>
                <div className="flex flex-wrap gap-1">
                  {moonData.recommended.map((item, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recommended Rituals */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-100">Rituais Recomendados</span>
              {dayData.isRitualDay && (
                <Badge className="ml-auto bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  ✧ Dia de Ritual
                </Badge>
              )}
            </div>
            <ul className="space-y-2">
              {orixaData.rituals.map((ritual, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-purple-400 mt-0.5">✧</span>
                  {ritual}
                </li>
              ))}
            </ul>
            
            {orixaData.affirmations && (
              <div className="mt-4 pt-3 border-t border-purple-500/20">
                <p className="text-xs text-purple-400 font-medium mb-2">Afirmações</p>
                <div className="space-y-1">
                  {orixaData.affirmations.slice(0, 2).map((aff, i) => (
                    <p key={i} className="text-xs text-slate-400 italic">&ldquo;{aff}&rdquo;</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Offerings */}
          {orixaData.offerings && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-100">Oferendas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {orixaData.offerings.map((offering, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-300"
                  >
                    {offering}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Tips */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-slate-100">Dica do Dia</span>
            </div>
            <p className="text-sm text-slate-400">
              {dayData.energyLevel === 'peak'
                ? `Hoje é um dia de alta energia! Aproveite para práticas espirituais intensas e rituais importantes. A energia de ${dayData.orixa} está forte.`
                : dayData.energyLevel === 'high'
                ? `Bom dia para atividades espirituais. Conecte-se com ${dayData.orixa} através dos rituais recomendados.`
                : dayData.energyLevel === 'medium'
                ? `Dia equilibrado para práticas moderadas. Mantenha-se em paz e faça escolhas conscientes.`
                : `Dia de descanso e recuperação. Cuide de si mesmo e evite atividades extenuantes.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpiritualDayPopup;
