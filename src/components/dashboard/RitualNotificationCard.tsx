// fallow-ignore-next-line complexity
import React, { useState, useCallback } from 'react';
import {
  Sparkles,
  Moon,
  Sun,
  Clock,
  CheckCircle2,
  X,
  Bell,
  BellOff,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpiritualCard, SpiritualCardHeader, SpiritualCardTitle, SpiritualCardContent, SpiritualCardFooter } from '@/components/ui/spiritual-card';

// ============================================================
// TYPES
// ============================================================

export interface RitualNotificationCardProps {
  notificationId: string;
  title: string;
  message: string;
  ritualName?: string;
  orixa?: string;
  moonPhase?: string;
  energy?: string;
  timestamp?: number;
  onDismiss?: () => void;
  onSnooze?: (minutes: number) => void;
  onComplete?: () => void;
  onRefresh?: () => void;
  className?: string;
  variant?: 'compact' | 'expanded';
  autoSnoozeMinutes?: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const RITUAL_ICONS: Record<string, React.ReactNode> = {
  prayer: '🙏',
  meditation: '🧘',
  offering: '🕯️',
  gratitude: '🙏',
  bath: '💧',
  default: '✨',
};

const SNOOZE_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hora', value: 60 },
  { label: '3 horas', value: 180 },
  { label: 'Amanhã', value: 1440 },
];

const ENERGY_COLORS: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  purificação: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    icon: <Water className="w-4 h-4" />,
  },
  ação: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: <Sun className="w-4 h-4" />,
  },
  proteção: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    icon: <Sparkles className="w-4 h-4" />,
  },
  reflexão: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    icon: <Moon className="w-4 h-4" />,
  },
  descanso: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    icon: <Zzz className="w-4 h-4" />,
  },
  nutrição: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
    icon: <Heart className="w-4 h-4" />,
  },
};

// Custom icons for this component
function Water({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function Zzz({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12h8m0 0l-4-4m4 4l-4 4" />
      <path d="M12 20h8m0 0l-4-4m4 4l-4 4" />
      <text x="6" y="6" fontSize="6" fill="currentColor" stroke="none">z</text>
      <text x="14" y="14" fontSize="4" fill="currentColor" stroke="none">z</text>
    </svg>
  );
}

function Heart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'success' | 'danger';
  disabled?: boolean;
}

function ActionButton({
  icon,
  label,
  onClick,
  variant = 'default',
  disabled = false,
}: ActionButtonProps) {
  const variantClasses = {
    default: 'bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white',
    success: 'bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200',
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

interface SnoozeDropdownProps {
  onSnooze: (minutes: number) => void;
  onClose: () => void;
}

function SnoozeDropdown({ onSnooze, onClose }: SnoozeDropdownProps) {
  return (
    <div className="absolute bottom-full left-0 mb-2 w-40 bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden z-20">
      <div className="p-2">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 px-2">
          Adiar por
        </p>
        {SNOOZE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              onSnooze(option.value);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Clock className="w-3 h-3" />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ExpandableContentProps {
  isExpanded: boolean;
  children: React.ReactNode;
}

function ExpandableContent({ isExpanded, children }: ExpandableContentProps) {
  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-300',
        isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
      )}
    >
      {children}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

// fallow-ignore-next-line complexity
export function RitualNotificationCard({
  notificationId,
  title,
  message,
  ritualName,
  orixa,
  moonPhase,
  energy,
  timestamp,
  onDismiss,
  onSnooze,
  onComplete,
  onRefresh,
  className = '',
  variant = 'expanded',
  autoSnoozeMinutes,
}: RitualNotificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(variant === 'expanded');
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Get energy color scheme
  const energyConfig = energy ? ENERGY_COLORS[energy.toLowerCase()] : null;

  // Auto-dismiss if snoozed
  React.useEffect(() => {
    if (isSnoozed && autoSnoozeMinutes) {
      const timer = setTimeout(() => {
        setIsSnoozed(false);
      }, autoSnoozeMinutes * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, [isSnoozed, autoSnoozeMinutes]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  // Handle snooze
  const handleSnooze = useCallback((minutes: number) => {
    setIsSnoozed(true);
    setIsSnoozeOpen(false);
    onSnooze?.(minutes);
  }, [onSnooze]);

  // Handle complete
  const handleComplete = useCallback(() => {
    setIsCompleted(true);
    onComplete?.();
    // Auto-dismiss after completion
    setTimeout(() => {
      handleDismiss();
    }, 1500);
  }, [onComplete, handleDismiss]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  // Format timestamp
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  // Don't render if dismissed
  if (isDismissed) return null;

  return (
    <div
      className={cn(
        'relative group transition-all duration-300',
        isSnoozed && 'opacity-50 scale-[0.98]',
        isCompleted && 'opacity-0 scale-95',
        className
      )}
      key={notificationId}
    >
      <SpiritualCard
        variant="default"
        className={cn(
          'border-l-4 overflow-hidden',
          energyConfig?.border || 'border-l-amber-500',
          isCompleted && 'pointer-events-none'
        )}
      >
        {/* Header */}
        <SpiritualCardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Icon */}
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl',
                  energyConfig?.bg || 'bg-amber-500/10',
                  energyConfig?.text || 'text-amber-400'
                )}
              >
                {orixa ? RITUAL_ICONS[orixa.toLowerCase()] || RITUAL_ICONS.default : RITUAL_ICONS.default}
              </div>

              {/* Title and meta */}
              <div className="flex-1 min-w-0">
                <SpiritualCardTitle className="text-sm font-semibold text-white mb-0.5">
                  {title}
                </SpiritualCardTitle>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {formattedTime}
                  {orixa && (
                    <span className="flex items-center gap-1 text-amber-400/80">
                      <Sparkles className="w-3 h-3" />
                      {orixa}
                    </span>
                  )}
                  {ritualName && (
                    <span className="text-slate-400">
                      • {ritualName}
                    </span>
                  )}
                  {isSnoozed && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <BellOff className="w-3 h-3" />
                      Adiado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Expand toggle */}
            {variant === 'compact' && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-md hover:bg-slate-800 text-slate-400 transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </SpiritualCardHeader>

        <SpiritualCardContent className="pt-0">
          {/* Main message */}
          <p className="text-sm text-slate-300 leading-relaxed">
            {message}
          </p>

          {/* Expandable content */}
          {variant === 'compact' && (
            <ExpandableContent isExpanded={isExpanded}>
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                {/* Moon phase info */}
                {moonPhase && (
                  <div className="flex items-center gap-2 mb-2">
                    <Moon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400">
                      Lua atual: <span className="text-slate-300">{moonPhase}</span>
                    </span>
                  </div>
                )}
                
                {/* Energy info */}
                {energy && energyConfig && (
                  <div className={cn('flex items-center gap-2 p-2 rounded-lg', energyConfig.bg)}>
                    {energyConfig.icon}
                    <span className={cn('text-xs font-medium', energyConfig.text)}>
                      Energia de {energy.toLowerCase()}
                    </span>
                  </div>
                )}
              </div>
            </ExpandableContent>
          )}
        </SpiritualCardContent>

        {/* Actions */}
        <SpiritualCardFooter className="pt-2 pb-2 gap-2">
          {/* Primary action - Complete */}
          {!isCompleted && (
            <ActionButton
              icon={<CheckCircle2 className="w-4 h-4" />}
              label="Feito"
              onClick={handleComplete}
              variant="success"
            />
          )}

          {/* Snooze */}
          {!isCompleted && !isSnoozed && (
            <div className="relative">
              <ActionButton
                icon={<Bell className="w-4 h-4" />}
                label="Adiar"
                onClick={() => setIsSnoozeOpen(!isSnoozeOpen)}
              />
              {isSnoozeOpen && (
                <SnoozeDropdown
                  onSnooze={handleSnooze}
                  onClose={() => setIsSnoozeOpen(false)}
                />
              )}
            </div>
          )}

          {/* Refresh */}
          {onRefresh && (
            <ActionButton
              icon={<RefreshCw className="w-4 h-4" />}
              label="Atualizar"
              onClick={handleRefresh}
            />
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Dismiss */}
          {!isCompleted && (
            <ActionButton
              icon={<X className="w-4 h-4" />}
              label="Dispensar"
              onClick={handleDismiss}
              variant="danger"
            />
          )}
        </SpiritualCardFooter>

        {/* Completion overlay */}
        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-xl">
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <p className="text-sm font-medium text-green-400">Ritual concluído!</p>
            </div>
          </div>
        )}
      </SpiritualCard>
    </div>
  );
}

// ============================================================
// EXPORTS
// ============================================================

export default RitualNotificationCard;
