'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Crown, Zap, AlertCircle } from 'lucide-react';

interface SubscriptionStatus {
  plan: 'free' | 'basic' | 'premium';
  status: 'active' | 'inactive' | 'canceled';
  currentPeriodEnd: string | null;
  credits: number;
}

const PLAN_LABELS = {
  free: 'Gratuito',
  basic: 'Básico',
  premium: 'Premium',
};

const PLAN_COLORS = {
  free: 'secondary',
  basic: 'default',
  premium: 'default',
} as const;

export function SubscriptionManager() {
  const [data, setData] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/subscription/status');
        if (!res.ok) throw new Error('Erro ao carregar status');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardContent className="flex items-center gap-3 py-6 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const isActive = data.status === 'active';
  const isPremium = data.plan === 'premium';
  const isFree = data.plan === 'free';

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <CardTitle>Assinatura</CardTitle>
          </div>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
        <CardDescription>
          Gerencie seu plano e créditos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Info */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{PLAN_LABELS[data.plan]}</p>
              {data.currentPeriodEnd && (
                <p className="text-xs text-muted-foreground">
                  Renovação: {new Date(data.currentPeriodEnd).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
          <Badge variant={PLAN_COLORS[data.plan]}>
            {PLAN_LABELS[data.plan]}
          </Badge>
        </div>

        {/* Credits Balance */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Créditos</p>
              <p className="text-xs text-muted-foreground">
                Disponíveis para uso
              </p>
            </div>
          </div>
          <p className="text-2xl font-bold text-primary">{data.credits}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!isPremium && (
            <Button className="flex-1" variant="default">
              <Crown className="w-4 h-4 mr-2" />
              Fazer Upgrade
            </Button>
          )}
          {!isFree && isActive && (
            <Button variant="destructive" className="flex-1">
              Cancelar Assinatura
            </Button>
          )}
          {isFree && (
            <Button variant="outline" className="flex-1">
              Ver Planos
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
