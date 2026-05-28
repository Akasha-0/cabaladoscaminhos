'use client';

import { useState, useCallback } from 'react';
import {
  RefreshCw,
  Download,
  Upload,
  Database,
  Cloud,
  CloudOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  FileJson,
  History,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TooltipInfo } from '@/components/ui/tooltip-info';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
type BackupStatus = 'idle' | 'creating' | 'restoring' | 'success' | 'error';

interface SyncState {
  status: SyncStatus;
  lastSync: Date | null;
  error: string | null;
  autoSyncEnabled: boolean;
}

interface BackupMetadata {
  id: string;
  timestamp: Date;
  size: string;
  type: 'full' | 'partial';
  description: string;
}

const DEFAULT_SYNC_STATE: SyncState = {
  status: 'idle',
  lastSync: null,
  error: null,
  autoSyncEnabled: true,
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generateBackupId(): string {
  return `backup_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function SyncManager() {
  const [syncState, setSyncState] = useState<SyncState>(DEFAULT_SYNC_STATE);
  const [backupState, setBackupState] = useState<BackupStatus>('idle');
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupHistory, setBackupHistory] = useState<BackupMetadata[]>([]);
  const [exportFormat, setExportFormat] = useState<'json' | 'full'>('json');

  const handleSync = useCallback(async () => {
    setSyncState(prev => ({ ...prev, status: 'syncing', error: null }));
    setBackupProgress(0);

    try {
      // Simulate sync progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setBackupProgress(i);
      }

      // Get all user data
      const userData: Record<string, unknown> = {};
      const keys = [
        'mapa_natal_data',
        'favoritos_data',
        'rituais_data',
        'meditacoes_data',
        'afirmacoes_data',
        'insights_data',
        'numerologia_data',
        'tarot_data',
        'relatorios_data',
        'spiritual_reminders',
      ];

      for (const key of keys) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            userData[key] = JSON.parse(item);
          } catch {
            userData[key] = item;
          }
        }
      }

      // Store sync metadata
      const syncMetadata = {
        lastSync: new Date().toISOString(),
        dataVersion: '1.0',
        itemCount: Object.keys(userData).length,
      };
      localStorage.setItem('sync_metadata', JSON.stringify(syncMetadata));

      setSyncState(prev => ({
        ...prev,
        status: 'success',
        lastSync: new Date(),
        error: null,
      }));

      setTimeout(() => {
        setSyncState(prev => ({ ...prev, status: 'idle' }));
      }, 3000);
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  }, []);

  const handleBackup = useCallback(async () => {
    setBackupState('creating');
    setBackupProgress(0);

    try {
      // Gather all data
      const allData: Record<string, unknown> = {};

      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setBackupProgress(i);
      }

      // Collect localStorage data
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            allData[key] = JSON.parse(value);
          }
        } catch {
          allData[key] = localStorage.getItem(key);
        }
      }

      const backup: BackupMetadata = {
        id: generateBackupId(),
        timestamp: new Date(),
        size: formatFileSize(JSON.stringify(allData).length),
        type: 'full',
        description: `Backup completo - ${formatDate(new Date())}`,
      };

      // Save backup to history (keep last 10)
      setBackupHistory(prev => [backup, ...prev].slice(0, 10));
      localStorage.setItem('backup_history', JSON.stringify([backup, ...backupHistory].slice(0, 10)));

      // Create download
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cabala-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupState('success');
      setBackupProgress(100);

      setTimeout(() => {
        setBackupState('idle');
        setBackupProgress(0);
      }, 2000);
    } catch (error) {
      setBackupState('error');
      setTimeout(() => setBackupState('idle'), 3000);
    }
  }, [backupHistory]);

  const handleRestore = useCallback(async (file: File) => {
    setBackupState('restoring');
    setBackupProgress(0);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      setBackupProgress(30);

      // Validate backup structure
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid backup file format');
      }

      // Clear existing data
      localStorage.clear();
      setBackupProgress(50);

      // Restore all data
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }

      setBackupProgress(100);
      setBackupState('success');

      // Trigger page reload after short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setBackupState('error');
      setTimeout(() => setBackupState('idle'), 3000);
    }
  }, []);

  const handleExport = useCallback(async () => {
    const allData: Record<string, unknown> = {};

    const keys = Object.keys(localStorage);
    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          allData[key] = JSON.parse(value);
        }
      } catch {
        allData[key] = localStorage.getItem(key);
      }
    }

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cabala-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleClearData = useCallback(() => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  const getStatusIcon = (status: SyncStatus | BackupStatus) => {
    switch (status) {
      case 'syncing':
      case 'creating':
      case 'restoring':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Cloud className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Gerenciador de Sincronização</CardTitle>
          </div>
          <Badge
            variant={syncState.status === 'success' ? 'default' : syncState.status === 'error' ? 'destructive' : 'secondary'}
            className="flex items-center gap-1"
          >
            {getStatusIcon(syncState.status)}
            {syncState.status === 'idle' && 'Pronto'}
            {syncState.status === 'syncing' && 'Sincronizando'}
            {syncState.status === 'success' && 'Sincronizado'}
            {syncState.status === 'error' && 'Erro'}
          </Badge>
        </div>
        <CardDescription>
          Gerencie backups, restauração e exportação dos seus dados astrológicos
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sync Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sincronização</span>
            </div>
            {syncState.lastSync && (
              <span className="text-xs text-muted-foreground">
                Última sync: {formatDate(syncState.lastSync)}
              </span>
            )}
          </div>

          {syncState.error && (
            <div className="flex items-center gap-2 p-2 text-sm text-red-500 bg-red-500/10 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {syncState.error}
            </div>
          )}

          <Button
            onClick={handleSync}
            disabled={syncState.status === 'syncing'}
            variant="outline"
            className="w-full"
          >
            {syncState.status === 'syncing' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar Dados
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Backup Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Backup</span>
          </div>

          {backupState === 'creating' && (
            <div className="space-y-2">
              <Progress value={backupProgress} />
              <span className="text-xs text-muted-foreground">
                Criando backup... {backupProgress}%
              </span>
            </div>
          )}

          <Button
            onClick={handleBackup}
            disabled={backupState === 'creating' || backupState === 'restoring'}
            variant="outline"
            className="w-full"
          >
            {backupState === 'creating' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Criando Backup...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Criar Backup
              </>
            )}
          </Button>

          {backupHistory.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <History className="h-3 w-3" />
                Backups anteriores
              </span>
              <div className="text-xs text-muted-foreground space-y-1 pl-4">
                {backupHistory.slice(0, 3).map((backup) => (
                  <div key={backup.id} className="flex justify-between">
                    <span>{backup.description}</span>
                    <span>{backup.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Restore Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Restaurar</span>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              id="restore-file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleRestore(file);
              }}
              disabled={backupState === 'restoring'}
            />
            <Button
              variant="outline"
              className="w-full"
              disabled={backupState === 'restoring'}
            >
              {backupState === 'restoring' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Restaurando... {backupProgress}%
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo de Backup
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Selecione um arquivo .json válido para restaurar seus dados
          </p>
        </div>

        <Separator />

        {/* Export Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Exportar Dados</span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              className="flex-1"
            >
              <FileJson className="h-4 w-4 mr-2" />
              Exportar JSON
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Exporta todos os seus dados em formato JSON para archival ou transferência
          </p>
        </div>

        <Separator />

        {/* Danger Zone */}
        <div className="space-y-3 p-3 border border-red-500/20 rounded-lg bg-red-500/5">
          <div className="flex items-center gap-2">
            <CloudOff className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-500">Zona de Perigo</span>
          </div>

          <TooltipInfo
            titulo="Aviso"
            descricao="Esta ação remove permanentemente todos os dados armazenados"
          >
            <Button
              onClick={handleClearData}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Todos os Dados
            </Button>
          </TooltipInfo>
        </div>
      </CardContent>
    </Card>
  );
}

export default SyncManager;