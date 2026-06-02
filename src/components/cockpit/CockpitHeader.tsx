// src/components/cockpit/CockpitHeader.tsx
// Header with progress indicator, quick actions e info do Operator logado
// (Fase 11 — UI de auth).

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Trash2,
  Zap,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useCockpitStore } from '@/stores/cockpit-store';
import { useOperatorAuth } from '@/components/providers/OperatorAuthProvider';

interface CockpitHeaderProps {
  showDebug?: boolean;
  onClearAll?: () => void;
  onAutoFill?: () => void;
}

export function CockpitHeader({ showDebug = false, onClearAll, onAutoFill }: CockpitHeaderProps) {
  const { getFilledCount } = useCockpitStore();
  const { operator, signOut } = useOperatorAuth();
  const filledCount = getFilledCount();
  const totalHouses = 36;
  const progressPercent = (filledCount / totalHouses) * 100;

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-slate-900/50 border-b border-slate-800/50">
      {/* Left - Progress Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center">
              <span className="text-lg font-bold text-orange-400">
                {String(filledCount).padStart(2, '0')}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              <span className="text-[10px] font-mono text-slate-400">/36</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">
              Cartas na Mesa
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Progress
                value={progressPercent}
                className="h-1.5 w-24 bg-slate-800"
              />
              <span className="text-xs text-slate-500">
                {Math.round(progressPercent)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center - Quick Stats */}
      {filledCount > 0 && (
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>{filledCount} cartas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>0 odus</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>{totalHouses - filledCount} vazias</span>
          </div>
        </div>
      )}

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {showDebug && onAutoFill && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAutoFill}
            className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
          >
            <Zap className="w-4 h-4 mr-2" />
            Auto-preenchimento
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar Mesa
        </Button>

        {/* Operator info + Logout */}
        {operator && (
          <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-800">
            <div className="text-right hidden md:block">
              <p className="text-xs font-medium text-slate-200 leading-tight">
                {operator.name}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                {operator.email}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-royal/20 border border-orange-500/30 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-orange-400" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void signOut()}
              className="text-slate-400 hover:text-orange-300 hover:bg-orange-500/10"
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CockpitHeader;