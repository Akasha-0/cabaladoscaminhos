'use client';

import { cn } from '@/lib/utils';
import { Heading } from '@/components/design-system/Typography';
import { ChakraResults, ChakraInfo } from '@/lib/engines/types/mapa-alma';

interface ChakraPanelProps {
  data: ChakraResults;
  className?: string;
}

const CHAKRA_DATA = [
  { num: 1, nome: 'Muladhara', pt: 'Raiz', cor: '#EF4444', elemento: 'Terra', mantra: 'LAM', freq: '396 Hz' },
  { num: 2, nome: 'Svadhisthana', pt: 'Sacro', cor: '#F97316', elemento: 'Água', mantra: 'VAM', freq: '417 Hz' },
  { num: 3, nome: 'Manipura', pt: 'Plexo Solar', cor: '#EAB308', elemento: 'Fogo', mantra: 'RAM', freq: '528 Hz' },
  { num: 4, nome: 'Anahata', pt: 'Coração', cor: '#22C55E', elemento: 'Ar', mantra: 'YAM', freq: '639 Hz' },
  { num: 5, nome: 'Vishuddha', pt: 'Garganta', cor: '#38BDF8', elemento: 'Éter', mantra: 'HAM', freq: '741 Hz' },
  { num: 6, nome: 'Ajna', pt: 'Terceiro Olho', cor: '#6366F1', elemento: 'Luz', mantra: 'OM/AUM', freq: '852 Hz' },
  { num: 7, nome: 'Sahasrara', pt: 'Coroa', cor: '#A855F7', elemento: 'Consciência', mantra: 'Silence', freq: '963 Hz' },
];

const ESTADO_CONFIG = {
  equilibrado: {
    label: 'Equilibrado',
    cor: '#22C55E',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.4)',
  },
  hiperativo: {
    label: 'Hiperativo',
    cor: '#EAB308',
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'rgba(234, 179, 8, 0.4)',
  },
  bloqueado: {
    label: 'Bloqueado',
    cor: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
  },
  desbalanceado: {
    label: 'Desbalanceado',
    cor: '#F97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.4)',
  },
};

function getChakraData(numero: number) {
  return CHAKRA_DATA.find(c => c.num === numero) || CHAKRA_DATA[0];
}

function StateBadge({ estado }: { estado: ChakraInfo['estado'] }) {
  const config = ESTADO_CONFIG[estado];
  return (
    <span
      className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium"
      style={{
        color: config.cor,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      {config.label}
    </span>
  );
}

function IntensityBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="relative w-full h-2 bg-slate-800/60 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}40`,
        }}
      />
    </div>
  );
}

function ChakraItem({ chakra }: { chakra: ChakraInfo }) {
  const chakraInfo = getChakraData(chakra.numero);

  return (
    <div
      className="chakra-item p-4 rounded-xl border border-slate-700/40 bg-slate-800/20 transition-all duration-300"
      style={{ '--chakra-color': chakraInfo.cor } as React.CSSProperties}
    >
      {/* Header Row */}
      <div className="flex items-start gap-3 mb-3">
        {/* Color Dot */}
        <div
          className="w-5 h-5 rounded-full shrink-0 mt-0.5"
          style={{
            backgroundColor: chakraInfo.cor,
            boxShadow: `0 0 12px ${chakraInfo.cor}60`,
          }}
        />

        {/* Name + State */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-slate-100">
              {chakra.nome}
            </span>
            <span className="text-xs text-slate-400">— {chakraInfo.pt}</span>
          </div>
          <div className="mt-1">
            <StateBadge estado={chakra.estado} />
          </div>
        </div>
      </div>

      {/* Intensity Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Intensidade</span>
          <span className="text-xs font-mono text-slate-400">{chakra.intensidade}%</span>
        </div>
        <IntensityBar value={chakra.intensidade} color={chakraInfo.cor} />
      </div>

      {/* Mantra + Frequency */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="font-medium" style={{ color: chakraInfo.cor }}>
          {chakraInfo.mantra}
        </span>
        <span className="text-slate-500">|</span>
        <span className="font-mono">{chakraInfo.freq}</span>
        <span className="text-slate-500">|</span>
        <span>{chakraInfo.elemento}</span>
      </div>

      {/* Hover Glow Effect */}
      <style jsx>{`
        .chakra-item:hover {
          box-shadow: 0 0 20px var(--chakra-color, #888)30;
          border-color: var(--chakra-color, #888)40;
        }
      `}</style>
    </div>
  );
}

export function ChakraPanel({ data, className = '' }: ChakraPanelProps) {
  return (
    <div className={cn('card-spiritual p-5', className)}>
      {/* Title */}
      <div className="mb-6">
        <Heading variant="mystical" className="text-amber-400">
          ✦ CHAKRAS
        </Heading>
      </div>

      {/* Mobile: vertical column */}
      <div className="grid grid-cols-1 gap-3 lg:hidden">
        {data.chakras.map((chakra) => (
          <ChakraItem key={chakra.numero} chakra={chakra} />
        ))}
      </div>

      {/* Desktop: horizontal row */}
      <div className="hidden lg:grid grid-cols-7 gap-3">
        {data.chakras.map((chakra) => (
          <ChakraItem key={chakra.numero} chakra={chakra} />
        ))}
      </div>
    </div>
  );
}