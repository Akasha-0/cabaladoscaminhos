'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Globe,
  Clock,
  TrendingUp,
  RefreshCw,
  Server,
} from 'lucide-react';

interface RateLimitStats {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  uniqueIdentifiers: number;
  topIdentifiers: Array<{ identifier: string; count: number; blocked: number }>;
  byEndpoint: Record<string, { allowed: number; blocked: number }>;
  timeSeries: Array<{ timestamp: number; allowed: number; blocked: number }>;
}

interface RateLimitHealth {
  status: 'healthy' | 'degraded' | 'critical';
  blockRate: number;
  activeIdentifiers: number;
  recentAlerts: number;
}

export function RateLimitDashboard() {
  const [stats, setStats] = useState<RateLimitStats | null>(null);
  const [health, setHealth] = useState<RateLimitHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState(3600000); // 1 hour

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/rate-limit?window=${timeWindow}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setHealth(data.health);
      }
    } catch (error) {
      console.error('Failed to fetch rate limit stats:', error);
      // Fallback to mock data for demo
      setStats(getMockStats());
      setHealth({ status: 'healthy', blockRate: 2.5, activeIdentifiers: 47, recentAlerts: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeWindow]);

  const getStatusColor = (status: RateLimitHealth['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
    }
  };

  const getStatusBadge = (status: RateLimitHealth['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500">Saudável</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500">Degradado</Badge>;
      case 'critical':
        return <Badge className="bg-red-500">Crítico</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Monitor de Rate Limiting</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            className="px-3 py-1.5 rounded-md border bg-background text-sm"
          >
            <option value={300000}>Últimos 5 min</option>
            <option value={900000}>Últimos 15 min</option>
            <option value={3600000}>Última hora</option>
            <option value={86400000}>Últimas 24h</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Health Status */}
      {health && (
        <Card className={`border-l-4 ${health.status === 'healthy' ? 'border-l-green-500' : health.status === 'degraded' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {health.status === 'healthy' ? (
                  <Server className="w-5 h-5 text-green-500" />
                ) : health.status === 'degraded' ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
                <CardTitle>Status do Sistema</CardTitle>
              </div>
              {getStatusBadge(health.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Bloqueio</p>
                <p className={`text-2xl font-bold ${getStatusColor(health.status)}`}>
                  {health.blockRate}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Identifiers Ativos</p>
                <p className="text-2xl font-bold">{health.activeIdentifiers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas Recentes</p>
                <p className={`text-2xl font-bold ${health.recentAlerts > 0 ? 'text-red-500' : ''}`}>
                  {health.recentAlerts}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Janela</p>
                <p className="text-2xl font-bold">
                  {timeWindow === 300000 ? '5 min' : 
                   timeWindow === 900000 ? '15 min' : 
                   timeWindow === 3600000 ? '1 hora' : '24 horas'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Requisições</p>
                  <p className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Permitidas</p>
                  <p className="text-2xl font-bold text-green-500">
                    {stats.allowedRequests.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Bloqueadas</p>
                  <p className="text-2xl font-bold text-red-500">
                    {stats.blockedRequests.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Únicos</p>
                  <p className="text-2xl font-bold">{stats.uniqueIdentifiers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="endpoints">
        <TabsList>
          <TabsTrigger value="endpoints">
            <Globe className="w-4 h-4 mr-2" />
            Por Endpoint
          </TabsTrigger>
          <TabsTrigger value="identifiers">
            <Users className="w-4 h-4 mr-2" />
            Top Identifiers
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="w-4 h-4 mr-2" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Requisições por Endpoint</CardTitle>
              <CardDescription>
                Distribuição de requisições por rota da API
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="space-y-3">
                  {Object.entries(stats.byEndpoint).map(([endpoint, data]) => {
                    const total = data.allowed + data.blocked;
                    const allowedPercent = total > 0 ? (data.allowed / total) * 100 : 0;
                    return (
                      <div key={endpoint} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <code className="bg-muted px-2 py-0.5 rounded">{endpoint}</code>
                          <span className="text-muted-foreground">
                            {data.allowed} / {data.blocked}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${allowedPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identifiers">
          <Card>
            <CardHeader>
              <CardTitle>Top Identifiers</CardTitle>
              <CardDescription>
                IPs ou IDs com maior volume de requisições
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="space-y-2">
                  {stats.topIdentifiers.slice(0, 10).map((item, index) => (
                    <div
                      key={item.identifier}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground w-6">#{index + 1}</span>
                        <code className="text-sm">{item.identifier}</code>
                        {item.blocked > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {item.blocked} bloqueios
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.count.toLocaleString()} requisições
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Timeline de Atividades</CardTitle>
              <CardDescription>
                Volume de requisições ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="h-64 flex items-end gap-1">
                  {stats.timeSeries.map((bucket, index) => {
                    const maxVal = Math.max(...stats.timeSeries.map(s => s.allowed + s.blocked));
                    const height = maxVal > 0 ? ((bucket.allowed + bucket.blocked) / maxVal) * 100 : 0;
                    const allowedHeight = maxVal > 0 ? (bucket.allowed / maxVal) * 100 : 0;
                    
                    return (
                      <div
                        key={index}
                        className="flex-1 flex flex-col justify-end group relative"
                      >
                        <div
                          className="bg-red-500/50 hover:bg-red-500 transition-colors"
                          style={{ height: `${height}%` }}
                          title={`Bloqueadas: ${bucket.blocked}`}
                        />
                        <div
                          className="bg-green-500 hover:bg-green-600 transition-colors"
                          style={{ height: `${allowedHeight}%` }}
                          title={`Permitidas: ${bucket.allowed}`}
                        />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                          {new Date(bucket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Mock data for demo
function getMockStats(): RateLimitStats {
  const timeSeries = [];
  for (let i = 0; i < 12; i++) {
    timeSeries.push({
      timestamp: Date.now() - i * 300000,
      allowed: Math.floor(Math.random() * 100) + 50,
      blocked: Math.floor(Math.random() * 10),
    });
  }

  return {
    totalRequests: 1247,
    allowedRequests: 1215,
    blockedRequests: 32,
    uniqueIdentifiers: 47,
    topIdentifiers: [
      { identifier: '192.168.1.105', count: 234, blocked: 3 },
      { identifier: '10.0.0.42', count: 189, blocked: 0 },
      { identifier: '172.16.0.8', count: 156, blocked: 8 },
      { identifier: '192.168.1.203', count: 134, blocked: 1 },
      { identifier: '10.0.0.15', count: 98, blocked: 0 },
    ],
    byEndpoint: {
      '/api/chat/mensagem': { allowed: 456, blocked: 12 },
      '/api/numerologia': { allowed: 234, blocked: 0 },
      '/api/creditos': { allowed: 189, blocked: 5 },
      '/api/astrologia/mapa-natal': { allowed: 145, blocked: 2 },
      '/api/insights/diario': { allowed: 112, blocked: 8 },
    },
    timeSeries: timeSeries.reverse(),
  };
}