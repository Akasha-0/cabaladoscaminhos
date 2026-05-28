'use client';

import { useState } from 'react';
import {
  RefreshCw,
  Cloud,
  CloudOff,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

interface SyncStatusProps {
  lastSync: Date | null;
  pending: number;
  conflicts: number;
  status: SyncStatus;
  onSync?: () => void;
}

function formatLastSync(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `${minutes}m atrás`;
  if (hours < 24) return `${hours}h atrás`;
  return `${days}d atrás`;
}

export function SyncStatus({
  lastSync,
  pending,
  conflicts,
  status,
  onSync,
}: SyncStatusProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync?.();
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = () => {
    if (isSyncing || status === 'syncing') {
      return <Loader2 className="size-4 animate-spin" />;
    }
    if (status === 'error' || status === 'offline') {
      return <CloudOff className="size-4" />;
    }
    return <Cloud className="size-4" />;
  };

  const getStatusBadge = () => {
    if (isSyncing || status === 'syncing') {
      return (
        <Badge variant="secondary">
          Sincronizando
        </Badge>
      );
    }
    if (status === 'error') {
      return (
        <Badge variant="destructive">
          Erro
        </Badge>
      );
    }
    if (status === 'offline') {
      return (
        <Badge variant="secondary">
          Offline
        </Badge>
      );
    }
    return (
      <Badge variant="default">
        <CheckCircle2 className="size-3 mr-1" />
        Sincronizado
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span className="flex items-center gap-2">
            {getStatusIcon()}
            Status
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">
          Última sync:{' '}
          <span className="text-foreground">
            {lastSync ? formatLastSync(lastSync) : 'nunca'}
          </span>
        </div>

        {pending > 0 && (
          <div className="text-xs text-muted-foreground">
            Pendente:{' '}
            <span className="text-foreground font-medium">
              {pending} {pending === 1 ? 'item' : 'itens'}
            </span>
          </div>
        )}

        {conflicts > 0 && (
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertTriangle className="size-3" />
            <span>
              {conflicts} {conflicts === 1 ? 'conflito' : 'conflitos'} pendente
              {conflicts === 1 ? '' : 's'}
            </span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleSync}
          disabled={isSyncing || status === 'syncing'}
        >
          <RefreshCw className={`size-3 mr-1 ${(isSyncing || status === 'syncing') ? 'animate-spin' : ''}`} />
          Sincronizar
        </Button>
      </CardContent>
    </Card>
  );
}

export default SyncStatus;
