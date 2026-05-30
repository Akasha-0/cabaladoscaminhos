'use client';

import React, { useState, useMemo } from 'react';
import { Database, Globe, Link2, Plus, Search, Filter, ChevronDown, ChevronRight, Settings, RefreshCw, CheckCircle2, XCircle, Clock, Zap, BarChart3, AlertTriangle, ExternalLink, Copy, Trash2, Edit, MoreVertical, Shield, Cloud, Cpu, HardDrive, Network, Server, Smartphone, Monitor } from 'lucide-react';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'syncing';
export type IntegrationCategory = 'database' | 'api' | 'cloud' | 'analytics' | 'communication' | 'storage' | 'ai' | 'spiritual';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  logo?: string;
  createdAt: Date;
  lastSync?: Date;
  syncFrequency?: string;
  config: { key: string; value: string; encrypted?: boolean }[];
  metrics?: { requests: number; errors: number; latency: number; uptime: number };
  health?: { status: 'healthy' | 'degraded' | 'down'; lastCheck: Date };
  credentials?: { type: string; username?: string };
}

interface IntegrationHubProps {
  integrations?: Integration[];
  onIntegrationClick?: (integration: Integration) => void;
  className?: string;
}

// Default integrations
const DEFAULT_INTEGRATIONS: Integration[] = [
  { id: 'i1', name: 'PostgreSQL', description: 'Banco de dados principal para dashboard', category: 'database', status: 'connected', createdAt: new Date('2024-01-15'), lastSync: new Date(Date.now() - 5 * 60 * 1000), syncFrequency: 'Real-time', config: [{ key: 'host', value: 'db.cabala.io' }, { key: 'port', value: '5432' }, { key: 'database', value: 'cabala_prod' }], metrics: { requests: 12500, errors: 2, latency: 45, uptime: 99.9 }, health: { status: 'healthy', lastCheck: new Date() } },
  { id: 'i2', name: 'Redis Cache', description: 'Cache em memória para performance', category: 'storage', status: 'connected', createdAt: new Date('2024-01-15'), lastSync: new Date(Date.now() - 1 * 60 * 1000), syncFrequency: 'Real-time', config: [{ key: 'host', value: 'redis.cabala.io' }, { key: 'port', value: '6379' }], metrics: { requests: 45000, errors: 0, latency: 2, uptime: 99.99 }, health: { status: 'healthy', lastCheck: new Date() } },
  { id: 'i3', name: 'OpenAI API', description: 'Motor de IA para correlações', category: 'ai', status: 'connected', createdAt: new Date('2024-02-01'), lastSync: new Date(Date.now() - 30 * 60 * 1000), syncFrequency: 'On-demand', config: [{ key: 'api_key', value: 'sk-xxx', encrypted: true }], metrics: { requests: 890, errors: 12, latency: 1234, uptime: 99.5 }, health: { status: 'healthy', lastCheck: new Date() } },
  { id: 'i4', name: 'Stripe Payments', description: 'Processamento de pagamentos', category: 'api', status: 'connected', createdAt: new Date('2024-01-20'), lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), syncFrequency: '15min', config: [{ key: 'webhook_secret', value: 'whsec_xxx', encrypted: true }], metrics: { requests: 456, errors: 1, latency: 567, uptime: 99.8 }, health: { status: 'healthy', lastCheck: new Date() } },
  { id: 'i5', name: 'Slack Notifications', description: 'Notificações para equipe', category: 'communication', status: 'connected', createdAt: new Date('2024-03-01'), lastSync: new Date(Date.now() - 15 * 60 * 1000), syncFrequency: 'Real-time', config: [{ key: 'webhook_url', value: 'https://hooks.slack.com/...' }], metrics: { requests: 234, errors: 0, latency: 89, uptime: 99.9 }, health: { status: 'healthy', lastCheck: new Date() } },
  { id: 'i6', name: 'AWS S3', description: 'Armazenamento de arquivos', category: 'cloud', status: 'connected', createdAt: new Date('2024-02-15'), lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000), syncFrequency: '1h', config: [{ key: 'bucket', value: 'cabala-assets' }, { key: 'region', value: 'us-east-1' }], metrics: { requests: 1567, errors: 0, latency: 78, uptime: 99.95 }, health: { status: 'healthy', lastCheck: new Date() } },
  { id: 'i7', name: 'Supabase', description: 'Backend as a service', category: 'database', status: 'syncing', createdAt: new Date('2024-04-01'), lastSync: new Date(Date.now() - 10 * 60 * 1000), syncFrequency: 'Real-time', config: [{ key: 'url', value: 'https://xxx.supabase.co' }], metrics: { requests: 890, errors: 5, latency: 234, uptime: 99.7 }, health: { status: 'degraded', lastCheck: new Date() } },
  { id: 'i8', name: 'Google Analytics', description: 'Analytics para website', category: 'analytics', status: 'connected', createdAt: new Date('2024-01-15'), lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000), syncFrequency: '4h', config: [{ key: 'property_id', value: 'GA4-xxx' }], metrics: { requests: 3456, errors: 0, latency: 123, uptime: 99.9 }, health: { status: 'healthy', lastCheck: new Date() } },
  { id: 'i9', name: 'Odu Oracle API', description: 'API de Odu Ifá para divinação', category: 'spiritual', status: 'connected', createdAt: new Date('2024-03-15'), lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), syncFrequency: 'On-demand', config: [{ key: 'api_key', value: 'odu-api-key', encrypted: true }], metrics: { requests: 156, errors: 3, latency: 2345, uptime: 98.5 }, health: { status: 'healthy', lastCheck: new Date() } },
  { id: 'i10', name: 'PagerDuty', description: 'Alertas de emergência', category: 'communication', status: 'disconnected', createdAt: new Date('2024-04-15'), config: [{ key: 'integration_key', value: 'xxx' }], metrics: { requests: 0, errors: 0, latency: 0, uptime: 0 }, health: { status: 'down', lastCheck: new Date() } },
  { id: 'i11', name: 'Minimax AI', description: 'Motor de IA para chatbot', category: 'ai', status: 'connected', createdAt: new Date('2024-05-01'), lastSync: new Date(Date.now() - 5 * 60 * 1000), syncFrequency: 'On-demand', config: [{ key: 'api_key', value: 'minimax-key', encrypted: true }], metrics: { requests: 567, errors: 8, latency: 890, uptime: 99.2 }, health: { status: 'healthy', lastCheck: new Date() } },
  { id: 'i12', name: 'Cloudflare', description: 'CDN e segurança', category: 'cloud', status: 'error', createdAt: new Date('2024-02-20'), lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000), config: [{ key: 'zone_id', value: 'zone-xxx' }], metrics: { requests: 0, errors: 45, latency: 0, uptime: 0 }, health: { status: 'down', lastCheck: new Date() } },
];

// Category config
function getCategoryConfig(category: IntegrationCategory): { color: string; bg: string; icon: React.ReactNode; label: string } {
  switch (category) {
    case 'database': return { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: <Database className="w-4 h-4" />, label: 'Banco de Dados' };
    case 'api': return { color: 'text-cyan-400', bg: 'bg-cyan-500/20', icon: <Link2 className="w-4 h-4" />, label: 'API' };
    case 'cloud': return { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: <Cloud className="w-4 h-4" />, label: 'Cloud' };
    case 'analytics': return { color: 'text-violet-400', bg: 'bg-violet-500/20', icon: <BarChart3 className="w-4 h-4" />, label: 'Analytics' };
    case 'communication': return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: <Zap className="w-4 h-4" />, label: 'Comunicação' };
    case 'storage': return { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: <HardDrive className="w-4 h-4" />, label: 'Armazenamento' };
    case 'ai': return { color: 'text-pink-400', bg: 'bg-pink-500/20', icon: <Cpu className="w-4 h-4" />, label: 'IA' };
    case 'spiritual': return { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: <Zap className="w-4 h-4" />, label: 'Espiritual' };
  }
}

// Status config
function getStatusConfig(status: IntegrationStatus): { color: string; bg: string; icon: React.ReactNode; label: string } {
  switch (status) {
    case 'connected': return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Conectado' };
    case 'disconnected': return { color: 'text-slate-400', bg: 'bg-slate-500/20', icon: <XCircle className="w-4 h-4" />, label: 'Desconectado' };
    case 'error': return { color: 'text-red-400', bg: 'bg-red-500/20', icon: <AlertTriangle className="w-4 h-4" />, label: 'Erro' };
    case 'syncing': return { color: 'text-cyan-400', bg: 'bg-cyan-500/20', icon: <RefreshCw className="w-4 h-4 animate-spin" />, label: 'Sincronizando' };
  }
}

// Health config
function getHealthConfig(status: 'healthy' | 'degraded' | 'down'): { color: string; label: string } {
  switch (status) {
    case 'healthy': return { color: 'text-emerald-400', label: 'Saudável' };
    case 'degraded': return { color: 'text-amber-400', label: 'Degradado' };
    case 'down': return { color: 'text-red-400', label: 'Fora do ar' };
  }
}

// Format time ago
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function IntegrationHub({
  integrations = DEFAULT_INTEGRATIONS,
  onIntegrationClick,
  className = ''
}: IntegrationHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<IntegrationCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<IntegrationStatus | 'all'>('all');
  const [expandedIntegrations, setExpandedIntegrations] = useState<Set<string>>(new Set());

  // Stats
  const stats = useMemo(() => {
    const total = integrations.length;
    const connected = integrations.filter(i => i.status === 'connected').length;
    const errors = integrations.filter(i => i.status === 'error').length;
    const totalRequests = integrations.reduce((sum, i) => sum + (i.metrics?.requests || 0), 0);
    const avgUptime = integrations.filter(i => i.metrics?.uptime).reduce((sum, i) => sum + (i.metrics?.uptime || 0), 0) / integrations.filter(i => i.metrics?.uptime).length;
    return { total, connected, errors, totalRequests, avgUptime };
  }, [integrations]);

  // Filter integrations
  const filteredIntegrations = useMemo(() => {
    return integrations.filter(integration => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!integration.name.toLowerCase().includes(q) && !integration.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (filterCategory !== 'all' && integration.category !== filterCategory) return false;
      if (filterStatus !== 'all' && integration.status !== filterStatus) return false;
      return true;
    });
  }, [integrations, searchQuery, filterCategory, filterStatus]);

  // Toggle expanded
  const toggleExpanded = (id: string) => {
    setExpandedIntegrations(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={`bg-slate-900/80 rounded-xl border border-slate-800/60 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100">Hub de Integrações</h3>
              <p className="text-xs text-slate-400">Gerencie todas as suas integrações</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-2 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Sincronizar tudo
            </button>
            <button className="flex items-center gap-1 px-3 py-2 bg-violet-500 hover:bg-violet-600 rounded-lg text-sm text-white transition-colors">
              <Plus className="w-4 h-4" />
              Nova integração
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-100">{stats.total}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">{stats.connected}</p>
            <p className="text-xs text-slate-500">Conectadas</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-400">{stats.errors}</p>
            <p className="text-xs text-slate-500">Com erros</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-cyan-400">{stats.totalRequests.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Requisições</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-violet-400">{stats.avgUptime.toFixed(1)}%</p>
            <p className="text-xs text-slate-500">Uptime médio</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar integrações..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as IntegrationCategory | 'all')}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none"
          >
            <option value="all">Todas categorias</option>
            <option value="database">Banco de Dados</option>
            <option value="api">API</option>
            <option value="cloud">Cloud</option>
            <option value="analytics">Analytics</option>
            <option value="communication">Comunicação</option>
            <option value="storage">Armazenamento</option>
            <option value="ai">IA</option>
            <option value="spiritual">Espiritual</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as IntegrationStatus | 'all')}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none"
          >
            <option value="all">Todos status</option>
            <option value="connected">Conectado</option>
            <option value="disconnected">Desconectado</option>
            <option value="error">Erro</option>
            <option value="syncing">Sincronizando</option>
          </select>
        </div>
      </div>

      {/* Integrations list */}
      <div className="max-h-[500px] overflow-y-auto">
        {filteredIntegrations.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma integração encontrada</p>
          </div>
        ) : (
          filteredIntegrations.map(integration => {
            const categoryConfig = getCategoryConfig(integration.category);
            const statusConfig = getStatusConfig(integration.status);
            const healthConfig = integration.health ? getHealthConfig(integration.health.status) : null;
            const isExpanded = expandedIntegrations.has(integration.id);

            return (
              <div key={integration.id} className="border-b border-slate-800/30 last:border-b-0">
                <div
                  onClick={() => toggleExpanded(integration.id)}
                  className="p-4 hover:bg-slate-800/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Status icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${statusConfig.bg}`}>
                        {statusConfig.icon}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-slate-200">{integration.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${categoryConfig.bg} ${categoryConfig.color}`}>
                            {categoryConfig.icon}
                            {categoryConfig.label}
                          </span>
                          {healthConfig && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${healthConfig.color}`}>
                              {healthConfig.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{integration.description}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          {integration.lastSync && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(integration.lastSync)}
                            </span>
                          )}
                          {integration.syncFrequency && (
                            <span>{integration.syncFrequency}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Metrics */}
                      {integration.metrics && integration.status === 'connected' && (
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-100">{integration.metrics.requests.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500">Requisições</p>
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-bold ${integration.metrics.errors === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {integration.metrics.errors}
                            </p>
                            <p className="text-[10px] text-slate-500">Erros</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-cyan-400">{integration.metrics.latency}ms</p>
                            <p className="text-[10px] text-slate-500">Latência</p>
                          </div>
                        </div>
                      )}

                      {/* Expand */}
                      <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-slate-800/20">
                    {/* Config */}
                    <div className="mb-4">
                      <h5 className="text-xs text-slate-500 mb-2">Configurações:</h5>
                      <div className="space-y-1">
                        {integration.config.map((c, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400 font-mono w-32">{c.key}:</span>
                            <span className="text-slate-300 font-mono">
                              {c.encrypted ? '•'.repeat(16) : c.value}
                            </span>
                            {c.encrypted && (
                              <Shield className="w-3 h-3 text-emerald-400" title="Criptografado" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metrics detail */}
                    {integration.metrics && (
                      <div className="mb-4">
                        <h5 className="text-xs text-slate-500 mb-2">Métricas detalhadas:</h5>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="p-2 bg-slate-800/50 rounded-lg text-center">
                            <p className="text-sm font-bold text-slate-100">{integration.metrics.requests.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500">Total requests</p>
                          </div>
                          <div className="p-2 bg-slate-800/50 rounded-lg text-center">
                            <p className={`text-sm font-bold ${integration.metrics.errors === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {integration.metrics.errors}
                            </p>
                            <p className="text-[10px] text-slate-500">Erros</p>
                          </div>
                          <div className="p-2 bg-slate-800/50 rounded-lg text-center">
                            <p className="text-sm font-bold text-cyan-400">{integration.metrics.latency}ms</p>
                            <p className="text-[10px] text-slate-500">Latência avg</p>
                          </div>
                          <div className="p-2 bg-slate-800/50 rounded-lg text-center">
                            <p className={`text-sm font-bold ${integration.metrics.uptime >= 99 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {integration.metrics.uptime.toFixed(2)}%
                            </p>
                            <p className="text-[10px] text-slate-500">Uptime</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {integration.status === 'connected' ? (
                        <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300">
                          <RefreshCw className="w-3 h-3 inline mr-1" />
                          Sincronizar
                        </button>
                      ) : (
                        <button className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 rounded text-xs text-emerald-300">
                          <Zap className="w-3 h-3 inline mr-1" />
                          Conectar
                        </button>
                      )}
                      <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300">
                        <Edit className="w-3 h-3 inline mr-1" />
                        Editar
                      </button>
                      <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300">
                        <ExternalLink className="w-3 h-3 inline mr-1" />
                        Documentação
                      </button>
                      <button className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-xs text-red-400">
                        <Trash2 className="w-3 h-3 inline mr-1" />
                        Remover
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-800/50 border-t border-slate-800/60">
        <p className="text-xs text-slate-500 text-center">
          {filteredIntegrations.length} integrações • {stats.connected} conectadas
</p>
      </div>
    </div>
  );
}

export default IntegrationHub;