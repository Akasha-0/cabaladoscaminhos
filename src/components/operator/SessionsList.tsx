'use client';
// src/components/operator/SessionsList.tsx
// Modal "Sessões Ativas" — Fase 16.
//
// Mostra ao Operator onde sua conta está logada e permite revogar
// sessões (logout remoto de outros dispositivos). A sessão atual
// fica destacada e não pode ser revogada por aqui (use o botão
// "Sair" no header para deslogar de verdade).
//
// Comportamento:
//   - Carrega a lista ao abrir
//   - Após cada revogação (single ou all-others), refaz o fetch
//   - "Sair de Todos os Outros" pede confirmação inline
//   - Mostra estado vazio se não houver outras sessões
//   - Mostra erro inline (sem toast) — degrada graciosamente
//
// Parsing de userAgent: best-effort, sem dep externa. Cobre os
// navegadores mais comuns (Chrome, Firefox, Safari, Edge) e OS
// (Windows, macOS, Linux, iOS, Android). Falha → mostra o UA cru
// truncado.

import React, { useEffect, useState, useCallback } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  MapPin,
  Clock,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOperatorAuth, type OperatorSessionInfo } from '@/components/providers/OperatorAuthProvider';
import { cn } from '@/lib/utils';

// ============================================================================
// Tipos auxiliares
// ============================================================================

interface DeviceInfo {
  /** Ícone (lucide). */
  icon: typeof Monitor;
  /** "Chrome no Windows", "Safari no iPhone", etc. */
  label: string;
  /** "Desktop" | "Mobile" | "Tablet" | "Desconhecido" */
  kind: 'desktop' | 'mobile' | 'tablet' | 'unknown';
}


/**
 * Parse best-effort de um userAgent. NÃO é uma lib completa — só
 * cobre navegadores e OS mais comuns.
 */
export function parseUserAgent(ua: string | null | undefined): DeviceInfo {
  const raw = (ua ?? '').trim();
  if (!raw) {
    return { icon: Globe, label: 'Dispositivo desconhecido', kind: 'unknown' };
  }

  // 1) Detecta tipo (mobile/tablet/desktop)
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(raw);
  const isMobile = !isTablet && /iPhone|iPod|Android.*Mobile|Mobile/i.test(raw);
  const kind: DeviceInfo['kind'] = isTablet
    ? 'tablet'
    : isMobile
      ? 'mobile'
      : 'desktop';

  // 2) Detecta navegador (ordem importa: Edge antes de Chrome)
  let browser = 'Navegador';
  if (/Edg\//i.test(raw)) browser = 'Edge';
  else if (/OPR\//i.test(raw) || /Opera/i.test(raw)) browser = 'Opera';
  else if (/Firefox\//i.test(raw)) browser = 'Firefox';
  else if (/Chrome\//i.test(raw) && !/Chromium\//i.test(raw)) browser = 'Chrome';
  else if (/Safari\//i.test(raw) && /Version\//i.test(raw)) browser = 'Safari';
  else if (/curl|wget|httpie/i.test(raw)) browser = 'CLI/curl';

  // 3) Detecta OS (ordem importa: iOS antes de macOS, porque UAs de
  //    iPhone/iPad contêm "Mac OS X" como substring legada)
  let os = '';
  if (/Windows NT 10/i.test(raw)) os = 'Windows 10/11';
  else if (/Windows NT/i.test(raw)) os = 'Windows';
  else if (/iPhone|iPad|iPod/i.test(raw)) os = kind === 'tablet' ? 'iPadOS' : 'iOS';
  else if (/Mac OS X|Macintosh/i.test(raw)) os = 'macOS';
  else if (/Android/i.test(raw)) os = 'Android';
  else if (/Linux/i.test(raw)) os = 'Linux';
  else if (/curl|wget/i.test(raw)) os = 'CLI';

  const label = os ? `${browser} no ${os}` : browser;
  return {
    icon: kind === 'mobile' ? Smartphone : kind === 'tablet' ? Tablet : Monitor,
    label,
    kind,
  };
}

/** Formata uma data ISO para algo legível (pt-BR). */
function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ============================================================================
// Componente principal
// ============================================================================

interface SessionsListProps {
  /** Controlado pelo pai (header). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionsList({ open, onOpenChange }: SessionsListProps) {
  const { listSessions, revokeSession, revokeAllSessions } = useOperatorAuth();

  const [sessions, setSessions] = useState<OperatorSessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionOk, setActionOk] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    const res = await listSessions();
    setIsLoading(false);
    if (!res.ok) {
      setLoadError(res.error ?? 'Falha ao carregar');
      setSessions([]);
      return;
    }
    setSessions(res.sessions ?? []);
  }, [listSessions]);

  // Recarrega sempre que o modal abre
  useEffect(() => {
    if (open) {
      setActionError(null);
      setActionOk(null);
      setConfirmingAll(false);
      void reload();
    }
  }, [open, reload]);

  const handleRevoke = useCallback(
    async (id: string) => {
      setActionError(null);
      setActionOk(null);
      setRevokingId(id);
      const res = await revokeSession(id);
      setRevokingId(null);
      if (!res.ok) {
        setActionError(res.error ?? 'Falha ao revogar');
        return;
      }
      setActionOk('Sessão revogada.');
      // Refaz o fetch (a sessão revogada não deve mais aparecer)
      void reload();
    },
    [revokeSession, reload]
  );

  const handleRevokeAll = useCallback(async () => {
    setActionError(null);
    setActionOk(null);
    setIsRevokingAll(true);
    const res = await revokeAllSessions();
    setIsRevokingAll(false);
    setConfirmingAll(false);
    if (!res.ok) {
      setActionError(res.error ?? 'Falha ao revogar sessões');
      return;
    }
    const n = res.revokedCount ?? 0;
    setActionOk(
      n > 0
        ? `${n} ${n === 1 ? 'sessão revogada' : 'sessões revogadas'}.`
        : 'Nenhuma outra sessão para revogar.'
    );
    void reload();
  }, [revokeAllSessions, reload]);

  // Quantas outras sessões (não-atual)
  const otherSessions = sessions.filter((s) => !s.isCurrent);
  const currentSession = sessions.find((s) => s.isCurrent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" />
            Sessões Ativas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Descrição */}
          <p className="text-xs text-muted-foreground">
            Cada vez que você faz login, uma nova sessão é criada. Revogue sessões que
            você não reconhece para proteger sua conta.
          </p>

          {/* Erro de carregamento */}
          {loadError && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{loadError}</span>
            </div>
          )}

          {/* Erro / sucesso de ação (revoke) */}
          {actionError && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{actionError}</span>
            </div>
          )}
          {actionOk && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{actionOk}</span>
            </div>
          )}

          {/* Loading inicial */}
          {isLoading && sessions.length === 0 && !loadError && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando sessões…
            </div>
          )}

          {/* Lista vazia */}
          {!isLoading && !loadError && sessions.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm">
              <Globe className="w-6 h-6 opacity-40" />
              Nenhuma sessão ativa encontrada.
            </div>
          )}

          {/* Sessão atual (destaque) */}
          {currentSession && (
            <SessionItem
              session={currentSession}
              isCurrent
              isRevoking={revokingId === currentSession.id}
              onRevoke={handleRevoke}
            />
          )}

          {/* Demais sessões */}
          {otherSessions.length > 0 && (
            <>
              {currentSession && (
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 pt-2">
                  Outros dispositivos
                </div>
              )}
              <div className="space-y-2">
                {otherSessions.map((s) => (
                  <SessionItem
                    key={s.id}
                    session={s}
                    isRevoking={revokingId === s.id}
                    onRevoke={handleRevoke}
                  />
                ))}
              </div>
            </>
          )}

          {/* Confirmação inline do revoke-all */}
          {confirmingAll && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 space-y-2">
              <p className="text-xs text-foreground">
                Tem certeza? Isso vai revogar todas as outras sessões
                {otherSessions.length > 0 && (
                  <>
                    {' '}
                    ({otherSessions.length} {otherSessions.length === 1 ? 'dispositivo' : 'dispositivos'})
                  </>
                )}
                . A sessão atual será mantida.
              </p>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmingAll(false)}
                  disabled={isRevokingAll}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleRevokeAll}
                  disabled={isRevokingAll || otherSessions.length === 0}
                >
                  {isRevokingAll && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isRevokingAll ? 'Revogando…' : 'Sim, revogar todas'}
                </Button>
              </div>
            </div>
          )}

          {/* Botão "Sair de Todos os Outros" */}
          {!confirmingAll && otherSessions.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setActionError(null);
                  setActionOk(null);
                  setConfirmingAll(true);
                }}
                className="w-full"
              >
                <ShieldAlert className="w-4 h-4 mr-2" />
                Sair de Todos os Outros Dispositivos
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Sub-componente: item da lista
// ============================================================================

interface SessionItemProps {
  session: OperatorSessionInfo;
  isCurrent?: boolean;
  isRevoking: boolean;
  onRevoke: (id: string) => void;
}

function SessionItem({ session, isCurrent = false, isRevoking, onRevoke }: SessionItemProps) {
  const device = parseUserAgent(session.userAgent);

  return (
    <div
      data-testid="session-item"
      data-current={isCurrent ? 'true' : 'false'}
      className={cn(
        'flex items-start gap-3 p-3 rounded-md border transition-colors',
        isCurrent
          ? 'border-primary/40 bg-primary/5'
          : 'border-border/50 bg-card/30 hover:bg-card/60'
      )}
    >
      {/* Ícone do device */}
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
          isCurrent ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        )}
      >
        <device.icon className="w-4 h-4" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground truncate">
            {device.label}
          </p>
          {isCurrent && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              Esta sessão
            </Badge>
          )}
        </div>

        <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
          {session.ipAddress && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate font-mono">{session.ipAddress}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>Desde {formatDateTime(session.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Botão de revogar */}
      {!isCurrent && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRevoke(session.id)}
          disabled={isRevoking}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
          title="Revogar esta sessão"
        >
          {isRevoking ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sair deste'}
        </Button>
      )}
    </div>
  );
}

