'use client';

import { useState, useEffect } from 'react';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UserProfile {
  name: string;
  email: string;
  dob: string;
}

interface SubscriptionInfo {
  plan: string;
  status: 'active' | 'inactive';
  renewalDate?: string;
}

interface UserSettings {
  notifications: boolean;
  darkTheme: boolean;
}

const MOCK_SUBSCRIPTION: SubscriptionInfo = {
  plan: '探索者 (Explorador)',
  status: 'active',
  renewalDate: '2026-06-30',
};

export default function PerfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription] = useState<SubscriptionInfo>(MOCK_SUBSCRIPTION);
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true,
    darkTheme: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load profile from localStorage
    try {
      const stored = localStorage.getItem('mapa_perfil');
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile({
          name: parsed.name || parsed.nome || 'Usuário Espiritual',
          email: parsed.email || parsed.emailUsuario || 'usuario@cabala.pt',
          dob: parsed.dob || parsed.dataNascimento || parsed.data_nascimento || '1990-01-01',
        });
      } else {
        // Default profile if nothing in localStorage
        setProfile({
          name: 'Usuário Espiritual',
          email: 'usuario@cabala.pt',
          dob: '1990-01-01',
        });
      }
    } catch {
      setProfile({
        name: 'Usuário Espiritual',
        email: 'usuario@cabala.pt',
        dob: '1990-01-01',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleToggleNotifications = () => {
    setSettings(prev => ({ ...prev, notifications: !prev.notifications }));
  };

  const handleToggleTheme = () => {
    setSettings(prev => ({ ...prev, darkTheme: !prev.darkTheme }));
  };

  const handleLogout = () => {
    localStorage.removeItem('mapa_perfil');
    localStorage.removeItem('user_session');
    window.location.href = '/login';
  };

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <CosmicBackground>
        <div className="min-h-screen p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="h-10 w-48 bg-muted animate-pulse rounded" />
            <div className="h-px bg-muted" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-muted/50 animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <Heading variant="section" size="2xl" className="text-spiritual-gold mb-2">
            ✦ Meu Perfil
          </Heading>
          <MysticDivider symbol="star" variant="default" className="mb-8" />

          {/* Profile Info Card */}
          <Card className="card-spiritual mb-6">
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="profile-name" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Nome
                  </label>
                  <p id="profile-name" className="text-foreground font-medium">
                    {profile?.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <label htmlFor="profile-email" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Email
                  </label>
                  <p id="profile-email" className="text-foreground font-medium">
                    {profile?.email}
                  </p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label htmlFor="profile-dob" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Data de Nascimento
                  </label>
                  <p id="profile-dob" className="text-foreground font-medium">
                    {profile?.dob ? formatDate(profile.dob) : 'Não informada'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="card-spiritual mb-6">
            <CardHeader>
              <CardTitle>Minha Assinatura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold text-lg">
                    {subscription.plan}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status:{' '}
                    <span className={subscription.status === 'active' ? 'text-green-500' : 'text-red-500'}>
                      {subscription.status === 'active' ? 'Ativa' : 'Inativa'}
                    </span>
                    {subscription.renewalDate && (
                      <> • Renova em {formatDate(subscription.renewalDate)}</>
                    )}
                  </p>
                </div>
                <Button
                  variant="golden"
                  size="sm"
                  onClick={handleUpgrade}
                  aria-label="Fazer upgrade do plano"
                >
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className="card-spiritual">
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Notifications Toggle */}
              <div className="flex items-center justify-between">
                <label htmlFor="notifications-toggle" className="text-foreground cursor-pointer">
                  Notificações
                </label>
                <button
                  id="notifications-toggle"
                  role="switch"
                  aria-checked={settings.notifications}
                  onClick={handleToggleNotifications}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggleNotifications();
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    settings.notifications ? 'bg-spiritual-gold' : 'bg-muted'
                  }`}
                  aria-label="Alternar notificações"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <label htmlFor="theme-toggle" className="text-foreground cursor-pointer">
                  Tema Escuro
                </label>
                <button
                  id="theme-toggle"
                  role="switch"
                  aria-checked={settings.darkTheme}
                  onClick={handleToggleTheme}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggleTheme();
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    settings.darkTheme ? 'bg-spiritual-gold' : 'bg-muted'
                  }`}
                  aria-label="Alternar tema escuro"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
                      settings.darkTheme ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <MysticDivider symbol="diamond" variant="subtle" className="my-4" />

              {/* Logout Button */}
              <div className="pt-2">
                <Button
                  variant="destructive"
                  size="default"
                  onClick={handleLogout}
                  aria-label="Sair da conta"
                  className="w-full md:w-auto"
                >
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CosmicBackground>
  );
}