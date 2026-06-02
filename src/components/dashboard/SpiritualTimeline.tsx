// fallow-ignore-file unused-file
'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Clock,
  Calendar,
  Star,
  Sparkles,
  Moon,
  Sun,
  ChevronRight,
  ChevronLeft,
  Filter,
  MapPin,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface SpiritualTimelineProps {
  events?: TimelineEvent[];
  className?: string;
  viewMode?: 'horizontal' | 'vertical';
  onEventClick?: (event: TimelineEvent) => void;
}

export interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'milestone' | 'practice' | 'insight' | 'ritual' | 'awakening';
  spiritualSystems?: string[];
  orixa?: string;
  impact?: 'high' | 'medium' | 'low';
  duration?: string;
  location?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const EVENT_COLORS = {
  milestone: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500',
    text: 'text-amber-400',
    icon: <Star className="w-4 h-4" />,
  },
  practice: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500',
    text: 'text-emerald-400',
    icon: <Moon className="w-4 h-4" />,
  },
  insight: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500',
    text: 'text-purple-400',
    icon: <Sparkles className="w-4 h-4" />,
  },
  ritual: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500',
    text: 'text-blue-400',
    icon: <Sun className="w-4 h-4" />,
  },
  awakening: {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500',
    text: 'text-cyan-400',
    icon: <Clock className="w-4 h-4" />,
  },
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// ============================================================
// DEFAULT DATA
// ============================================================

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    id: '1',
    date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    title: 'Despertar Espiritual',
    description: 'Primeiro contato consciente com práticas espirituais e numerologia',
    type: 'awakening',
    spiritualSystems: ['Numerologia'],
    orixa: 'Oxalá',
    impact: 'high',
  },
  {
    id: '2',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    title: 'Identificação do Odu',
    description: 'Descoberta do Odu personal e início da prática Ifá',
    type: 'milestone',
    spiritualSystems: ['Ifá/Odu'],
    orixa: 'Ogum',
    impact: 'high',
  },
  {
    id: '3',
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    title: 'Primeira Meditação Guiada',
    description: 'Prática inicial de meditação com foco em alinhamento oracular',
    type: 'practice',
    spiritualSystems: ['Cabala'],
    impact: 'medium',
  },
  {
    id: '4',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    title: 'Insight sobre Arcos Pessoais',
    description: 'Compreensão profunda dos arcos numerológicos e sua aplicação',
    type: 'insight',
    spiritualSystems: ['Numerologia'],
    impact: 'medium',
  },
  {
    id: '5',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    title: 'Ritual de Conexão Ancestral',
    description: 'Prática de ritual para fortalecimento da conexão com ancestrais',
    type: 'ritual',
    spiritualSystems: ['Candomblé', 'Ifá/Odu'],
    orixa: 'Iemanjá',
    impact: 'high',
  },
  {
    id: '6',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    title: 'Avanço na Compreensão Cabalística',
    description: 'Progresso significativo no estudo das sefirot e caminhos',
    type: 'milestone',
    spiritualSystems: ['Cabala'],
    impact: 'medium',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function groupEventsByMonth(events: TimelineEvent[]): Map<string, TimelineEvent[]> {
  const grouped = new Map<string, TimelineEvent[]>();
  
  events.forEach(event => {
    const monthKey = `${event.date.getFullYear()}-${String(event.date.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(event);
  });
  
  return grouped;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface TimelineItemProps {
  event: TimelineEvent;
  isLast?: boolean;
  onClick?: () => void;
}

// fallow-ignore-next-line complexity
function TimelineItem({ event, isLast, onClick }: TimelineItemProps) {
  const colors = EVENT_COLORS[event.type];
  
  return (
    <div className="relative pl-8 pb-8">
      {/* Timeline Connector */}
      {!isLast && (
        <div className="absolute left-3 top-6 w-0.5 h-full bg-gradient-to-b from-slate-600 to-slate-700" />
      )}
      
      {/* Timeline Node */}
      <div className={cn(
        'absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2',
        colors.bg,
        colors.border,
        'border-opacity-50'
      )}>
        <span className={colors.text}>{colors.icon}</span>
      </div>
      
      {/* Event Card */}
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 hover:border-slate-500/50 transition-all',
          `border-l-4 ${colors.border}`
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn('font-semibold', colors.text)}>{event.title}</h4>
              {event.impact && (
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  event.impact === 'high' && 'bg-amber-500/20 text-amber-400',
                  event.impact === 'medium' && 'bg-blue-500/20 text-blue-400',
                  event.impact === 'low' && 'bg-slate-700/50 text-slate-400'
                )}>
                  {event.impact === 'high' ? 'Alto Impacto' : event.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm">{event.description}</p>
            
            <div className="flex items-center gap-4 mt-3">
              <span className="text-slate-500 text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(event.date)}
              </span>
              {event.orixa && (
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full bg-slate-700/50',
                  colors.text
                )}>
                  {event.orixa}
                </span>
              )}
            </div>
            
            {event.spiritualSystems && event.spiritualSystems.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {event.spiritualSystems.map(system => (
                  <span key={system} className="text-xs text-slate-500">
                    {system}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
        </div>
      </button>
    </div>
  );
}

interface YearSeparatorProps {
  year: number;
}

function YearSeparator({ year }: YearSeparatorProps) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
      <span className="text-slate-400 font-semibold text-sm">{year}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpiritualTimeline({
  events = DEFAULT_EVENTS,
  className = '',
  viewMode = 'vertical',
  onEventClick,
}: SpiritualTimelineProps) {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const filteredEvents = useMemo(() => {
    let result = events;
    
    if (filterType) {
      result = result.filter(e => e.type === filterType);
    }
    
    if (selectedYear) {
      result = result.filter(e => e.date.getFullYear() === selectedYear);
    }
    
    return result.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [events, filterType, selectedYear]);

  const groupedEvents = useMemo(() => {
    return groupEventsByMonth(filteredEvents);
  }, [filteredEvents]);

  const years = useMemo(() => {
    const uniqueYears = new Set(events.map(e => e.date.getFullYear()));
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [events]);

  const eventTypes = Object.keys(EVENT_COLORS) as (keyof typeof EVENT_COLORS)[];

  return (
    <div className={cn('bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Linha do Tempo Espiritual</h3>
              <p className="text-slate-400 text-xs">{events.length} eventos registrados</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType(null)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-lg transition-colors',
              !filterType ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
            )}
          >
            Todos
          </button>
          {eventTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? null : type)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1',
                filterType === type ? EVENT_COLORS[type].bg + ' ' + EVENT_COLORS[type].text : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
              )}
            >
              {EVENT_COLORS[type].icon}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Year Filter */}
        {years.length > 1 && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-slate-500 text-xs">Ano:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedYear(null)}
                className={cn(
                  'px-2 py-1 text-xs rounded transition-colors',
                  !selectedYear ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                )}
              >
                Todos
              </button>
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                  className={cn(
                    'px-2 py-1 text-xs rounded transition-colors',
                    selectedYear === year ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timeline Content */}
      <div className="p-4 max-h-96 overflow-y-auto scrollbar-thin">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Nenhum evento encontrado</p>
          </div>
        ) : viewMode === 'vertical' ? (
          <div>
            {Array.from(groupedEvents.entries()).map(([monthKey, monthEvents], index) => {
              const [year, month] = monthKey.split('-').map(Number);
              const date = new Date(year, month - 1);
              
              return (
                <div key={monthKey}>
                  {index > 0 && <YearSeparator year={year} />}
                  {monthEvents.map((event, eventIndex) => (
                    <TimelineItem
                      key={event.id}
                      event={event}
                      isLast={eventIndex === monthEvents.length - 1 && index === groupedEvents.size - 1}
                      onClick={() => onEventClick?.(event)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          // Horizontal view placeholder
          <div className="flex gap-4 overflow-x-auto pb-4">
            {filteredEvents.map(event => (
              <div key={event.id} className="flex-shrink-0 w-64">
                <TimelineItem
                  event={event}
                  onClick={() => onEventClick?.(event)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="grid grid-cols-4 gap-4 text-center">
          {eventTypes.map(type => {
            const count = events.filter(e => e.type === type).length;
            return (
              <div key={type}>
                <div className="flex items-center justify-center gap-1">
                  {EVENT_COLORS[type].icon}
                  <span className="text-lg font-bold text-white">{count}</span>
                </div>
                <p className="text-slate-500 text-xs capitalize">{type}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SpiritualTimeline;