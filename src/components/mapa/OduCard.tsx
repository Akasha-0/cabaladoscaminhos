'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import type { OduResults } from '@/lib/engines/types/mapa-alma';
import { ChevronDown, AlertTriangle, Star, Leaf, Sun } from 'lucide-react';

// ORIXÁ_COLORS from Typography component
const ORIXÁ_COLORS: Record<string, string> = {
  'Oxum': '#D4728C',      // rose
  'Iemanjá': '#1E3A5F',   // deep blue
  'Ogum': '#C45C26',      // orange-red
  'Xangô': '#D4A843',     // golden yellow
  'Oxóssi': '#2D6A4F',   // forest green
  'Oxalá': '#7C6EB3',    // violet-white
  'Iansã': '#C45C26',    // orange-red
  'Nanã': '#1e3a5f',     // deep blue
  'Omulu': '#6B1A2A',    // wine
};

// Odu name/number mapping
const ODÚ_NAMES: Record<number, { name: string; orixá: string }> = {
  1: { name: 'Ogbe', orixá: 'Obatalá' },
  2: { name: 'Okanran', orixá: 'Ogum' },
  3: { name: 'Odi', orixá: 'Oxum' },
  4: { name: 'Eji-Onko', orixá: 'Obatalá' },
  5: { name: 'Oxé', orixá: 'Xangô' },
  6: { name: 'Obá', orixá: 'Oxum' },
  7: { name: 'Lodê', orixá: 'Oxum' },
  8: { name: 'Owonrin', orixá: 'Oxóssi' },
  9: { name: 'Ogunda', orixá: 'Ogum' },
  10: { name: 'Osa', orixá: 'Iemanjá' },
  11: { name: 'Ika', orixá: 'Oxum' },
  12: { name: 'Protés', orixá: 'Obatalá' },
  13: { name: 'Nizô', orixá: 'Oxum' },
  14: { name: 'Okanran-Meji', orixá: 'Ogum' },
  15: { name: 'Ogbe-Meji', orixá: 'Obatalá' },
  16: { name: 'Metanlá', orixá: 'Oxum' },
};

// Tarot arcano names
const ARCANO_NAMES: Record<number, string> = {
  1: 'O Mago',
  2: 'A Alta Sacerdotisa',
  3: 'A Imperatriz',
  4: 'O Imperador',
  5: 'O Papa',
  6: 'Os Enamorados',
  7: 'O Carro',
  8: 'A Justiça',
  9: 'O Eremita',
  10: 'A Roda da Fortuna',
  11: 'A Força',
  12: 'O Enforcado',
  13: 'A Morte',
  14: 'A Temperança',
  15: 'O Diabo',
  16: 'A Torre',
  17: 'A Estrela',
  18: 'A Lua',
  19: 'O Sol',
  20: 'O Julgamento',
  21: 'O Mundo',
  22: 'O Louco',
};

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  iconColor: string;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  icon,
  items,
  iconColor,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  return (
    <div className="border-b border-slate-700/30 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between py-3 px-4 hover:bg-slate-800/30 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <span style={{ color: iconColor }}>{icon}</span>
          <span className="text-sm font-medium text-slate-200 uppercase tracking-wider">
            {title}
          </span>
          <span className="text-xs text-slate-500">({items.length})</span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <ul className="pb-3 px-4 space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-slate-300"
            >
              <span className="text-slate-500 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface OduCardProps {
  data: OduResults;
  className?: string;
}

export function OduCard({ data, className = '' }: OduCardProps) {
  const oduNumber = data.regente.numero;
  const oduInfo = ODÚ_NAMES[oduNumber] || { name: 'Desconhecido', orixá: 'Obatalá' };
  const arcanoName = ARCANO_NAMES[data.arcanoTarot] || `Arcana ${data.arcanoTarot}`;
  const regente = data.regente as { orixaRegente?: string };
  const regenteColor = ORIXÁ_COLORS[regente.orixaRegente || 'Ogum'] || '#C45C26';

  return (
    <div className={cn('card-spiritual rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-spiritual-gold/20 via-spiritual-gold/10 to-transparent px-4 py-3 border-b border-spiritual-gold/30">
        <div className="flex items-center gap-2">
          <span className="text-spiritual-gold">✦</span>
          <span className="text-spiritual-gold font-semibold uppercase tracking-wider text-sm">
            ODU DO DESTINO
          </span>
        </div>
      </div>

      {/* Odu Principal Info */}
      <div className="px-4 py-5 bg-gradient-to-br from-slate-800/40 to-slate-900/60">
        <div className="flex items-center gap-4">
          {/* Odu Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold border-2"
            style={{
              borderColor: regenteColor,
              backgroundColor: `${regenteColor}20`,
              color: regenteColor,
            }}
          >
            {oduNumber}
          </div>

          {/* Odu Details */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-spiritual-gold">
                {oduInfo.name}
              </span>
              <span className="text-lg text-slate-400">({oduNumber})</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Orixá:</span>
              <span
                className="font-medium px-2 py-0.5 rounded text-xs"
                style={{
                  backgroundColor: `${regenteColor}20`,
                  color: regenteColor,
                }}
              >
                {regente.orixaRegente}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <span className="text-slate-400">Elemento:</span>
              <span className="text-slate-300">{data.elemento}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Arcano Tarot Badge */}
      <div className="px-4 py-3 border-y border-slate-700/30 bg-slate-800/20">
        <div className="flex items-center gap-2">
          <span className="text-lg">☰</span>
          <span className="text-xs text-slate-400 uppercase tracking-wide">
            Arcano Tarot:
          </span>
          <span className="text-sm font-medium text-cyan-400">
            {data.arcanoTarot} — {arcanoName}
          </span>
        </div>
      </div>

      {/* Orixás Protetores */}
      {data.orixas.length > 0 && (
        <div className="px-4 py-4 border-b border-slate-700/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-spiritual-gold text-sm">▼</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              ORIXÁS PROTETORES
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.orixas.map((orixa, index) => {
              const orixaColor = ORIXÁ_COLORS[orixa] || ORIXÁ_COLORS['Ogum'] || '#C45C26';
              return (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-medium border"
                  style={{
                    backgroundColor: `${orixaColor}15`,
                    borderColor: `${orixaColor}40`,
                    color: orixaColor,
                  }}
                >
                  {orixa}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Collapsible Sections */}
      <div className="bg-slate-900/50">
        <CollapsibleSection
          title="QUIZILAS (proibições)"
          icon={<AlertTriangle className="w-4 h-4" />}
          iconColor="#F59E0B"
          items={data.quizilas}
        />
        <CollapsibleSection
          title="PRECEITOS"
          icon={<Star className="w-4 h-4" />}
          iconColor="#D4AF37"
          items={data.preceitos}
        />
        <CollapsibleSection
          title="EBÓS RECOMENDADOS"
          icon={<Leaf className="w-4 h-4" />}
          iconColor="#22C55E"
          items={data.ebos}
        />
      </div>
    </div>
  );
}
