'use client';

import { useMemo } from 'react';
import { useTodayCorrelation } from '@/lib/correlation/useTodayCorrelation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { useUserContext } from '@/components/providers/UserProvider';

const ORIXAS_SYMBOLS: Record<string, string> = {
  'Omolu': '🕷️',
  'Obaluaê': '🕷️',
  'Iansã': '⚡',
  'Oyá': '⚡',
  'Xangô': '🔥',
  'Xangô (Solar)': '☀️',
  'Oxóssi': '🏹',
  'Oxalá': '✧',
  'Oxum': '🌊',
  'Iemanjá': '🌊',
};

const ELEMENT_ICONS: Record<string, string> = {
  'Terra': '🌍',
  'Água': '💧',
  'Fogo': '🔥',
  'Ar': '💨',
  'Éter': '✨',
};

interface DayEnergyWidgetProps {
  /** User's orixá (overrides context) */
  userOrixa?: string;
}

export function DayEnergyWidget({ userOrixa }: DayEnergyWidgetProps) {
  const correlation = useTodayCorrelation();
  const userContext = useUserContext();
  
  // Use prop if provided, otherwise use context
  const userOrixaEffective = userOrixa ?? userContext.orixaRegente;

  // Check compatibility between user's orixá and day's orixá
  const orixaCompatibility = useMemo(() => {
    if (!userOrixaEffective) return null;
    
    const dayOrixa = correlation.orixa;
    const userOrixa = userOrixaEffective;
    
    // Define compatibility relationships
    const compatibleOrixas: Record<string, string[]> = {
      'Oxalá': ['Oxum', 'Iemanjá', 'Ogum', 'Oxóssi'],
      'Iemanjá': ['Oxalá', 'Oxum', 'Yansã'],
      'Oxum': ['Oxalá', 'Iemanjá', 'Xangô', 'Lansã'],
      'Xangô': ['Oxum', 'Ogum', 'Oxóssi', 'Obaluaiê'],
      'Ogum': ['Oxalá', 'Xangô', 'Iansã', 'Omolu'],
      'Oxóssi': ['Oxalá', 'Xangô', 'Iemanjá'],
      'Iansã': ['Ogum', 'Xangô', 'Oxum', 'Omolu'],
      'Omolu': ['Ogum', 'Iansã', 'Xangô', 'Oxum'],
      'Obaluaiê': ['Omolu', 'Xangô'],
    };
    
    const isCompatible = compatibleOrixas[userOrixa]?.includes(dayOrixa) || 
                         compatibleOrixas[dayOrixa]?.includes(userOrixa) ||
                         userOrixa === dayOrixa;
    
    let relationship = '';
    if (userOrixa === dayOrixa) {
      relationship = 'Mesma energia — seu Orixá rege este dia';
    } else if (isCompatible) {
      relationship = 'Energias complementares — dia favorável';
    } else {
      relationship = 'Dias de energia diferente — seja cauteloso';
    }
    
    return {
      isCompatible,
      relationship,
      dayOrixa,
      userOrixa,
    };
  }, [userOrixaEffective, correlation.orixa]);

  return (
    <Card className="card-spiritual overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Energia do Dia
          </span>
        </CardTitle>
        <p className="text-sm text-slate-400">{correlation.dayNamePt}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Energy Banner */}
        <div
          className="p-4 rounded-lg text-center"
          style={{
            background: `linear-gradient(135deg, ${correlation.primaryColor}20, ${correlation.secondaryColor}20)`,
            borderLeft: `4px solid ${correlation.primaryColor}`,
          }}
        >
          <p className="text-2xl mb-1">{correlation.elementEmoji}</p>
          <p className="text-lg font-bold" style={{ color: correlation.primaryColor }}>
            {correlation.orixa}
          </p>
          <p className="text-xs text-slate-400 mt-1">{correlation.mystery}</p>
        </div>

        {/* User's Orixá & Compatibility */}
        {orixaCompatibility && (
          <div
            className="p-3 rounded-lg text-center"
            style={{
              background: orixaCompatibility.isCompatible ? 'rgba(34, 197, 94, 0.1)' : 'rgba(251, 191, 36, 0.1)',
              border: `1px solid ${orixaCompatibility.isCompatible ? 'rgba(34, 197, 94, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
            }}
          >
            <p className="text-xs text-slate-400 mb-1">Seu Orixá Regente</p>
            <p className="text-lg font-bold text-cyan-300">
              {ORIXAS_SYMBOLS[orixaCompatibility.userOrixa] || '✨'} {orixaCompatibility.userOrixa}
            </p>
            <p className={`text-xs mt-1 ${orixaCompatibility.isCompatible ? 'text-green-400' : 'text-amber-400'}`}>
              {orixaCompatibility.relationship}
            </p>
          </div>
        )}

        {/* Element & Chakra */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{ELEMENT_ICONS[correlation.element]}</span>
              <p className="text-xs text-slate-400">Elemento</p>
            </div>
            <p className="text-sm font-medium text-slate-200">{correlation.element}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔮</span>
              <p className="text-xs text-slate-400">Chakra</p>
            </div>
            <p className="text-sm font-medium text-slate-200">{correlation.chakra}</p>
          </div>
        </div>

        {/* Planet & Sefirah */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🌍</span>
              <p className="text-xs text-slate-400">Planeta</p>
            </div>
            <p className="text-sm font-medium text-slate-200">{correlation.planet}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">✡️</span>
              <p className="text-xs text-slate-400">Sefirá</p>
            </div>
            <p className="text-sm font-medium text-slate-200">{correlation.sefirah}</p>
          </div>
        </div>

        {/* Color Indicator */}
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-400">Cor:</p>
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: correlation.primaryColor }}
          />
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: correlation.secondaryColor }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
