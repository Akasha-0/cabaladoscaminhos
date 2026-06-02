// fallow-ignore-file unused-file
'use client';

import * as React from 'react';
import {
  SpiritualCard,
  SpiritualCardHeader,
  SpiritualCardTitle,
  SpiritualCardContent,
} from '@/components/ui/spiritual-card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Compass,
  Sparkles,
  Eye,
  Star,
  Sun,
  Flame,
  Droplets,
  Wind,
  Leaf,
  Gem,
  Crown,
} from 'lucide-react';
import {
  fetchWidgetData,
  getOduDoDia,
  getOrixasDoDia,
  getTarotCardDoDia,
  type WidgetData,
} from '@/lib/orixa/widget-data';

// Element icons mapping
const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  'Fogo': <Flame className="w-4 h-4" />,
  'Água': <Droplets className="w-4 h-4" />,
  'Terra': <Leaf className="w-4 h-4" />,
  'Ar': <Wind className="w-4 h-4" />,
  'Éter': <Star className="w-4 h-4" />,
};

const ELEMENT_COLORS: Record<string, string> = {
  'Fogo': 'bg-orange-500',
  'Água': 'bg-blue-500',
  'Terra': 'bg-green-600',
  'Ar': 'bg-sky-400',
  'Éter': 'bg-violet-500',
};

// ─── Odu Explorer Widget ────────────────────────────────────────────────────────

function OduExplorerWidget({ data }: { data: WidgetData }) {
  const odu = data.oduDoDia;
  
  return (
    <SpiritualCard variant="glow" size="default" className="h-full">
      <SpiritualCardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20">
            <Compass className="w-5 h-5 text-amber-500" />
          </div>
          <SpiritualCardTitle className="text-lg">Odú do Dia</SpiritualCardTitle>
        </div>
      </SpiritualCardHeader>
      <SpiritualCardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <span className="font-cinzel text-2xl font-bold text-white">{odu.numero}</span>
          </div>
          <div>
            <h4 className="font-cinzel text-xl font-semibold text-amber-400">{odu.nome}</h4>
            <p className="text-sm text-muted-foreground">Odú {odu.numero} • {odu.elementos}</p>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-950/50 to-indigo-950/50 border border-violet-500/20">
          <p className="text-sm text-foreground/80 mb-3">{odu.significado}</p>
          
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground mr-1">Orixás:</span>
              {odu.orixas.map((o, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-violet-500/10">
                  {o}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/20">
          <p className="text-xs text-amber-400 font-medium mb-1">Ebó Recomendado</p>
          <p className="text-xs text-amber-400/80">{odu.ebo}</p>
        </div>
        
        <div className="p-3 rounded-lg bg-black/20 border border-violet-500/10">
          <p className="text-xs text-violet-400/80">&ldquo;{odu.preceitos.substring(0, 100)}...&rdquo;</p>
        </div>
      </SpiritualCardContent>
    </SpiritualCard>
  );
}

// ─── Orixá Connection Widget ──────────────────────────────────────────────────

function OrixaConnectionWidget({ data }: { data: WidgetData }) {
  const orixasDoDia = data.orixasDoDia;
  const orixa = orixasDoDia[0] || {
    nome: 'Oxalá',
    dia: 'Sexta-feira',
    cores: ['Branco', 'Marfim'],
    chakra: '7º Coronário',
    planeta: 'Sol',
    elemento: 'Ar',
    ervas: ['Boldo', 'Manjericão'],
    quizilas: ['Bebidas alcoólicas'],
    saudacao: 'Epà Babá!',
    misterio: 'Paz e criação.',
  };
  
  const elementColor = orixa.elemento === 'Fogo' ? 'from-amber-500 to-orange-600' :
                      orixa.elemento === 'Água' ? 'from-blue-400 to-cyan-500' :
                      orixa.elemento === 'Terra' ? 'from-green-500 to-emerald-600' :
                      orixa.elemento === 'Ar' ? 'from-sky-400 to-blue-500' :
                      'from-violet-500 to-purple-600';
  
  return (
    <SpiritualCard variant="default" size="default" className="h-full">
      <SpiritualCardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <SpiritualCardTitle className="text-lg">Orixá Regente</SpiritualCardTitle>
        </div>
      </SpiritualCardHeader>
      <SpiritualCardContent className="space-y-4">
        <div className="text-center">
          <div className={cn(
            'w-20 h-20 mx-auto rounded-full bg-gradient-to-br mb-3 flex items-center justify-center shadow-lg',
            elementColor
          )}>
            <Gem className="w-10 h-10 text-white" />
          </div>
          <h4 className="font-cinzel text-2xl font-semibold text-violet-400">{orixa.nome}</h4>
          <div className="flex gap-2 justify-center mt-2">
            <Badge variant="outline">{orixa.elemento}</Badge>
            <Badge variant="outline">{orixa.dia}</Badge>
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-violet-950/30 border border-violet-500/20">
          <p className="text-xs text-muted-foreground mb-1">Saúdação</p>
          <p className="text-sm text-violet-400 font-medium">{orixa.saudacao}</p>
        </div>
        
        <div className="p-3 rounded-lg bg-violet-950/20 border border-violet-500/10">
          <p className="text-xs text-muted-foreground mb-1">Missão</p>
          <p className="text-xs text-foreground/80">{orixa.misterio}</p>
        </div>
        
        <div className="p-3 rounded-lg bg-violet-950/20 border border-violet-500/10">
          <p className="text-xs text-muted-foreground mb-1">Cores</p>
          <div className="flex gap-2">
            {orixa.cores.map((cor, i) => (
              <span key={i} className="text-xs bg-violet-500/10 px-2 py-1 rounded">
                {cor}
              </span>
            ))}
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-violet-950/20 border border-violet-500/10">
          <p className="text-xs text-muted-foreground mb-1">Chakra</p>
          <p className="text-sm text-violet-400">{orixa.chakra}</p>
        </div>
      </SpiritualCardContent>
    </SpiritualCard>
  );
}

// ─── Tarot Daily Card Widget ──────────────────────────────────────────────────

function TarotDailyCardWidget({ data }: { data: WidgetData }) {
  const card = data.tarotDoDia;
  
  // Roman numeral mapping
  const romanNumerals: Record<number, string> = {
    0: '0', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII',
    8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV',
    15: 'XV', 16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX', 21: 'XXI',
  };
  
  return (
    <SpiritualCard variant="glow" size="default" className="h-full">
      <SpiritualCardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-600/20">
            <Eye className="w-5 h-5 text-purple-400" />
          </div>
          <SpiritualCardTitle className="text-lg">Carta do Dia</SpiritualCardTitle>
        </div>
      </SpiritualCardHeader>
      <SpiritualCardContent className="space-y-4">
        <div className="relative p-6 rounded-xl bg-gradient-to-br from-purple-900/50 via-indigo-900/50 to-violet-900/50 border border-purple-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-xl" />
          <div className="relative">
            <div className="w-24 h-36 mx-auto mb-4 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[2px] shadow-lg shadow-amber-500/30">
              <div className="w-full h-full rounded-md bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-center p-2">
                  <Crown className="w-8 h-8 text-amber-400 mx-auto mb-1" />
                  <span className="text-[10px] font-cinzel text-amber-400">
                    {romanNumerals[card.numero] || card.numero.toString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Badge variant="outline" className="mb-2 bg-purple-500/10">
                {card.arcano === 'major' ? 'Arcana Maior' : card.arcano}
              </Badge>
              <h4 className="font-cinzel text-lg font-semibold text-amber-400">{card.nome}</h4>
              <p className="text-sm text-purple-300 mt-2">{card.significado}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Palavras-chave</p>
          <div className="flex flex-wrap gap-1">
            {card.keywords.map((kw, i) => (
              <span key={i} className="text-xs bg-pink-500/10 text-pink-400 px-2 py-1 rounded">
                {kw}
              </span>
            ))}
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-pink-950/30 border border-pink-500/20">
          <p className="text-xs text-muted-foreground mb-1">Interpretação</p>
          <p className="text-xs text-pink-400/80">&ldquo;{card.upright}&rdquo;</p>
        </div>
      </SpiritualCardContent>
    </SpiritualCard>
  );
}

// ─── Numerology Breakdown Widget ─────────────────────────────────────────────

function NumerologyBreakdownWidget({ data }: { data: WidgetData }) {
  const { numerologia } = data;
  const numData = numerologia.details;
  
  const numbers = [
    { label: 'Caminho', value: numerologia.lifePath },
    { label: 'Expressão', value: numerologia.expression },
    { label: 'Oportunidade', value: numerologia.soulUrge },
    { label: 'Personalidade', value: numerologia.personality },
  ];
  
  return (
    <SpiritualCard variant="golden" size="default" className="h-full">
      <SpiritualCardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20">
            <Gem className="w-5 h-5 text-emerald-400" />
          </div>
          <SpiritualCardTitle className="text-lg">Numerologia</SpiritualCardTitle>
        </div>
      </SpiritualCardHeader>
      <SpiritualCardContent className="space-y-4">
        <div className="flex gap-2 justify-center">
          {numbers.map((num) => (
            <div
              key={num.label}
              className="flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-cinzel text-sm font-bold shadow-lg shadow-emerald-500/30">
                {num.value}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1">{num.label}</span>
            </div>
          ))}
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-teal-950/40 border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-cinzel text-xl font-bold">
              {numerologia.lifePath}
            </div>
            <div>
              <h4 className="font-cinzel font-semibold text-emerald-400">{numData.nome}</h4>
              <p className="text-xs text-muted-foreground">Número de Vida</p>
            </div>
          </div>
          <p className="text-sm text-foreground/80 mb-3">{numData.significado}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-emerald-500/10">
              <span className="text-emerald-400 font-medium">Elemento:</span> {numData.elemento}
            </div>
            <div className="p-2 rounded bg-emerald-500/10">
              <span className="text-emerald-400 font-medium">Planeta:</span> {numData.planeta}
            </div>
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
          <p className="text-xs text-emerald-400 font-medium mb-1">Força</p>
          <p className="text-xs text-emerald-400/80">{numData.forca}</p>
        </div>
        
        <div className="p-3 rounded-lg bg-black/20 border border-emerald-500/10">
          <p className="text-xs text-emerald-400/80">&ldquo;{numData.affirmation}&rdquo;</p>
        </div>
      </SpiritualCardContent>
    </SpiritualCard>
  );
}

// ─── Element Balance Widget ────────────────────────────────────────────────────

const ElementBalanceWidget = React.memo(function ElementBalanceWidget({ data }: { data: WidgetData }) {
  const elementData = data.elementos;
  const elementos = elementData.elementos;
  
  return (
    <SpiritualCard variant="glow" size="default" className="h-full">
      <SpiritualCardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-600/20">
            <Sun className="w-5 h-5 text-sky-400" />
          </div>
          <SpiritualCardTitle className="text-lg">Equilíbrio dos Elementos</SpiritualCardTitle>
        </div>
      </SpiritualCardHeader>
      <SpiritualCardContent className="space-y-4">
        {elementData.dominante && (
          <div className="text-center p-2 rounded-lg bg-sky-950/30 border border-sky-500/20">
            <p className="text-xs text-muted-foreground">Elemento Dominante</p>
            <p className="text-lg font-semibold text-sky-400">{elementData.dominante}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          {elementos.map((element) => (
            <div
              key={element.nome}
              className="p-3 rounded-xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('p-1.5 rounded-md', ELEMENT_COLORS[element.nome] || 'bg-slate-500', 'text-white')}>
                  {ELEMENT_ICONS[element.nome] || <Star className="w-4 h-4" />}
                </div>
                <span className="text-sm font-medium">{element.nome}</span>
              </div>
              <div className="space-y-1">
                <Progress value={element.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">{element.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-500/20">
          <div className="flex items-center gap-2 text-center justify-center">
            <Flame className="w-4 h-4 text-orange-400" />
            <Wind className="w-4 h-4 text-sky-400" />
            <Droplets className="w-4 h-4 text-blue-400" />
            <Leaf className="w-4 h-4 text-green-400" />
            <Star className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-xs text-muted-foreground/80 mt-2 text-center">
            {elementData.equilibrado 
              ? 'Seus elementos estão bem equilibrados.' 
              : 'Trabalhe para harmonizar seus elementos.'}
          </p>
        </div>
      </SpiritualCardContent>
    </SpiritualCard>
  );
});
// ─── Main Component ────────────────────────────────────────────────────────────

interface SpiritualAnalysisWidgetsProps {
  className?: string;
  userData?: {
    birthDate?: string;
    name?: string;
    oduNumero?: number;
    orixaName?: string;
  };
}

export function SpiritualAnalysisWidgets({ className = '', userData = {} }: SpiritualAnalysisWidgetsProps) {
  const [widgetData, setWidgetData] = React.useState<WidgetData | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchWidgetData(userData);
        setWidgetData(data);
      } catch (error) {
        console.error('Error loading widget data:', error);
        // Fallback to basic data
        setWidgetData({
          oduDoDia: getOduDoDia(),
          oduUsuario: null,
          orixasDoDia: getOrixasDoDia(),
          tarotDoDia: getTarotCardDoDia(),
          numerologia: {
            lifePath: 1,
            expression: 1,
            soulUrge: 1,
            personality: 1,
            details: {
              numero: 1,
              nome: 'Um',
              significado: 'Iniciativa e liderança.',
              elemento: 'Fogo',
              planeta: 'Sol',
              forca: 'Determinação',
              desafio: 'Impaciência',
              caminhoVida: 'Ser pioneiro.',
              affirmation: 'Eu sou a luz que guia meu caminho.',
            },
          },
          elementos: {
            elementos: [
              { nome: 'Fogo', percentage: 30, description: '', recommendations: [] },
              { nome: 'Água', percentage: 25, description: '', recommendations: [] },
              { nome: 'Terra', percentage: 20, description: '', recommendations: [] },
              { nome: 'Ar', percentage: 15, description: '', recommendations: [] },
              { nome: 'Éter', percentage: 10, description: '', recommendations: [] },
            ],
            dominante: 'Fogo',
            equilibrado: false,
          },
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [userData]);
  
  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <SpiritualCard key={i} variant="default" size="default" className="h-64 animate-pulse">
            <SpiritualCardContent className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-muted" />
            </SpiritualCardContent>
          </SpiritualCard>
        ))}
      </div>
    );
  }
  
  if (!widgetData) {
    return null;
  }
  
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      <OduExplorerWidget data={widgetData} />
      <OrixaConnectionWidget data={widgetData} />
      <TarotDailyCardWidget data={widgetData} />
      <NumerologyBreakdownWidget data={widgetData} />
      <ElementBalanceWidget data={widgetData} />
    </div>
  );
}

export default SpiritualAnalysisWidgets;