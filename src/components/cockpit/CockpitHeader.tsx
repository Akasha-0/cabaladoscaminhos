// src/components/cockpit/CockpitHeader.tsx
// Header with progress indicator and quick actions (Doc 05 §4 macro).
// Tokens Ramiro v2 — laranja (progresso/ação) + royal (Odu stats).

'use client';

import { Trash2, Zap, LogOut, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCockpitStore } from '@/stores/cockpit-store';
import { SessionsList } from '@/components/operator/SessionsList';

interface CockpitHeaderProps {
  showDebug?: boolean;
  onClearAll?: () => void;
  onAutoFill?: () => void;
}

export function CockpitHeader({ showDebug = false, onClearAll, onAutoFill }: CockpitHeaderProps) {
  const router = useRouter();
  const { getFilledCount } = useCockpitStore();
  const filledCount = getFilledCount();
  const totalHouses = 36;
  const progressPercent = (filledCount / totalHouses) * 100;
  const [sessionsOpen, setSessionsOpen] = useState(false);

  async function handleLogout() {
    try {
      await fetch('/api/operator/auth/logout', { method: 'POST' });
    } finally {
      router.push('/cockpit/login');
      router.refresh();
    }
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-background/50 border-b border-border/50">
      {/* Left - Progress Indicator (laranja) */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/30 border border-primary/30 flex items-center justify-center">
              <span className="text-lg font-bold text-primary font-mono">
                {String(filledCount).padStart(2, '0')}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center">
              <span className="text-[10px] font-mono text-muted-foreground">/36</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/90">Cartas na Mesa</p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={progressPercent} className="h-1.5 w-24 bg-muted" />
              <span className="text-xs text-muted-foreground/70 font-mono">
                {Math.round(progressPercent)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center - Quick Stats (laranja/royal/muted) */}
      {filledCount > 0 && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>{filledCount} cartas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span>0 odus</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
            <span>{totalHouses - filledCount} vazias</span>
          </div>
        </div>
      )}

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {showDebug && onAutoFill && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAutoFill}
            className="text-secondary hover:text-secondary hover:bg-secondary/10"
          >
            <Zap className="w-4 h-4 mr-2" />
            Auto-preenchimento
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar Mesa
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSessionsOpen(true)}
          className="text-muted-foreground hover:text-secondary hover:bg-secondary/10"
          title="Ver e revogar sessões ativas"
        >
          <ShieldCheck className="w-4 h-4 mr-2" />
          Sessões
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-primary hover:bg-primary/10"
          title="Encerrar sessão do operador"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>

      {/* Modal de Sessões Ativas (Fase 16) — gerenciado por state local */}
      <SessionsList open={sessionsOpen} onOpenChange={setSessionsOpen} />
    </div>
  );
}
