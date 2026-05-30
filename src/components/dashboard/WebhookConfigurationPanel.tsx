'use client';

import React, { useState, useCallback } from 'react';
import { Webhook, Plus, Trash2, Play, Pause, Copy, Check, Settings, Bell, AlertCircle, Clock, RefreshCw } from 'lucide-react';

export type WebhookEvent = 'widget.added' | 'widget.removed' | 'correlation.detected' | 'anomaly.alert' | 'ai.recommendation' | 'user.login' | 'system.error';
export type WebhookStatus = 'active' | 'paused' | 'error' | 'pending';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  status: WebhookStatus;
  secret?: string;
  lastTrigger?: string;
  successCount: number;
  errorCount: number;
  createdAt: string;
}

interface WebhookConfigurationPanelProps {
  webhooks?: WebhookConfig[];
  onCreate?: (webhook: Omit<WebhookConfig, 'id' | 'createdAt'>) => void;
  onUpdate?: (id: string, config: Partial<WebhookConfig>) => void;
  onDelete?: (id: string) => void;
  onTest?: (id: string) => void;
  className?: string;
}

// Default webhooks
const DEFAULT_WEBHOOKS: WebhookConfig[] = [
  {
    id: 'wh-1',
    name: 'Notificações Slack',
    url: 'https://hooks.slack.com/services/xxx',
    events: ['anomaly.alert', 'correlation.detected'],
    status: 'active',
    secret: 'whsec_abc123',
    lastTrigger: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    successCount: 156,
    errorCount: 2,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'wh-2',
    name: 'Analytics Pipeline',
    url: 'https://api.analytics.com/webhook/dashboard',
    events: ['widget.added', 'widget.removed'],
    status: 'active',
    lastTrigger: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    successCount: 89,
    errorCount: 0,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'wh-3',
    name: 'Backup Service',
    url: 'https://backup.internal/hooks/dashboard',
    events: ['system.error'],
    status: 'paused',
    lastTrigger: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    successCount: 23,
    errorCount: 5,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'wh-4',
    name: 'AI Alerts',
    url: 'https://alerts.internal/webhook',
    events: ['ai.recommendation'],
    status: 'active',
    lastTrigger: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    successCount: 234,
    errorCount: 1,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Get event label
function getEventLabel(event: WebhookEvent): string {
  const labels: Record<WebhookEvent, string> = {
    'widget.added': 'Widget adicionado',
    'widget.removed': 'Widget removido',
    'correlation.detected': 'Correlação detectada',
    'anomaly.alert': 'Alerta de anomalia',
    'ai.recommendation': 'Recomendação AI',
    'user.login': 'Login de utilizador',
    'system.error': 'Erro de sistema',
  };
  return labels[event];
}

// Get status style
function getStatusStyle(status: WebhookStatus): { color: string; label: string; bg: string } {
  switch (status) {
    case 'active':
      return { color: 'text-emerald-400', label: 'Ativo', bg: 'bg-emerald-500/20' };
    case 'paused':
      return { color: 'text-amber-400', label: 'Pausado', bg: 'bg-amber-500/20' };
    case 'error':
      return { color: 'text-red-400', label: 'Erro', bg: 'bg-red-500/20' };
    case 'pending':
      return { color: 'text-cyan-400', label: 'Pendente', bg: 'bg-cyan-500/20' };
  }
}

// Format time ago
function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  return `${diffDays}d atrás`;
}

// Available events
const AVAILABLE_EVENTS: WebhookEvent[] = [
  'widget.added',
  'widget.removed',
  'correlation.detected',
  'anomaly.alert',
  'ai.recommendation',
  'user.login',
  'system.error',
];

export function WebhookConfigurationPanel({
  webhooks = DEFAULT_WEBHOOKS,
  onCreate,
  onUpdate,
  onDelete,
  onTest,
  className = ''
}: WebhookConfigurationPanelProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as WebhookEvent[],
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Stats
  const stats = {
    total: webhooks.length,
    active: webhooks.filter(w => w.status === 'active').length,
    paused: webhooks.filter(w => w.status === 'paused').length,
    errors: webhooks.filter(w => w.status === 'error').length,
  };

  // Handle create
  const handleCreate = useCallback(() => {
    if (!newWebhook.name || !newWebhook.url) return;

    onCreate?.({
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      status: 'pending',
      successCount: 0,
      errorCount: 0,
    });

    setNewWebhook({ name: '', url: '', events: [] });
    setShowCreateForm(false);
  }, [newWebhook, onCreate]);

  // Handle toggle event
  const handleToggleEvent = useCallback((event: WebhookEvent) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }));
  }, []);

  // Handle copy URL
  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`bg-slate-900/80 rounded-xl border border-slate-800/60 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-slate-100">Configuração de Webhooks</h3>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 rounded-lg transition-colors"
          >
            <Plus className="w-3 h-3" />
            Novo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-800/60 flex items-center gap-4 text-xs">
        <div>
          <span className="text-slate-500">Total:</span>
          <span className="ml-1 text-slate-300 font-medium">{stats.total}</span>
        </div>
        <div>
          <span className="text-slate-500">Ativos:</span>
          <span className="ml-1 text-emerald-400 font-medium">{stats.active}</span>
        </div>
        <div>
          <span className="text-slate-500">Pausados:</span>
          <span className="ml-1 text-amber-400 font-medium">{stats.paused}</span>
        </div>
        <div>
          <span className="text-slate-500">Erros:</span>
          <span className="ml-1 text-red-400 font-medium">{stats.errors}</span>
        </div>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-800/30 space-y-3">
          <input
            type="text"
            value={newWebhook.name}
            onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nome do webhook"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 placeholder-slate-500 focus:outline-none"
          />
          <input
            type="url"
            value={newWebhook.url}
            onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://seu-webhook.com/endpoint"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 placeholder-slate-500 focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_EVENTS.map(event => (
              <button
                key={event}
                onClick={() => handleToggleEvent(event)}
                className={`
                  px-2 py-1 text-xs rounded-lg transition-colors
                  ${newWebhook.events.includes(event)
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                  }
                `}
              >
                {getEventLabel(event)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newWebhook.name || !newWebhook.url}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm text-white"
            >
              Criar
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Webhooks list */}
      <div className="max-h-[400px] overflow-y-auto">
        {webhooks.map(webhook => {
          const statusStyle = getStatusStyle(webhook.status);

          return (
            <div
              key={webhook.id}
              className="p-4 border-b border-slate-800/60 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusStyle.bg} ${statusStyle.color}`}>
                  <Webhook className="w-5 h-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-slate-100 truncate">{webhook.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.color}`}>
                      {statusStyle.label}
                    </span>
                  </div>

                  {/* URL */}
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs text-cyan-400 bg-slate-800/50 px-2 py-0.5 rounded truncate max-w-[200px]">
                      {webhook.url}
                    </code>
                    <button
                      onClick={() => handleCopyUrl(webhook.url, webhook.id)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-300"
                    >
                      {copiedId === webhook.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Events */}
                  <div className="flex items-center gap-1 flex-wrap mb-2">
                    {webhook.events.map(event => (
                      <span key={event} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400">
                        {getEventLabel(event)}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Bell className="w-3 h-3" />
                      {webhook.successCount} sucesso
                    </span>
                    {webhook.errorCount > 0 && (
                      <span className="flex items-center gap-1 text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        {webhook.errorCount} erros
                      </span>
                    )}
                    {webhook.lastTrigger && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(webhook.lastTrigger)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onTest?.(webhook.id)}
                    className="p-1.5 hover:bg-emerald-500/20 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Testar webhook"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onUpdate?.(webhook.id, {
                      status: webhook.status === 'active' ? 'paused' : 'active'
                    })}
                    className="p-1.5 hover:bg-amber-500/20 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                    title={webhook.status === 'active' ? 'Pausar' : 'Retomar'}
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete?.(webhook.id)}
                    className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-800/50 border-t border-slate-800/60">
        <p className="text-xs text-slate-500">
          {webhooks.length} webhook(s) configurado(s)
        </p>
      </div>
    </div>
  );
}

export default WebhookConfigurationPanel;