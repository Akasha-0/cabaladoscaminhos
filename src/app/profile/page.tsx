'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { 
  Settings,
  Palette,
  Bell,
  Globe,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Mail,
  Calendar,
  Clock,
  MessageSquare,
  Check,
  Sparkles
} from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';
type Language = 'pt-BR' | 'en-US' | 'es-ES';

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  weekly: boolean;
  promotions: boolean;
}

// fallow-ignore-next-line complexity
export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>('system');
  const [language, setLanguage] = useState<Language>('pt-BR');
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    weekly: true,
    promotions: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setSaved(false);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setSaved(false);
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSalvar = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    setSaved(true);
  };

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor }
  ] as const;

  const languageOptions = [
    { value: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
    { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
    { value: 'es-ES', label: 'Español', flag: '🇪🇸' }
  ] as const;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-cinzel text-text-primary">Configurações de Perfil</h1>
          <p className="text-text-secondary font-raleway">
            Personalize sua experiência na Cabala dos Caminhos
          </p>
        </div>

        {user && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="font-cinzel">Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl">{user.email?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-raleway text-text-primary">
                    {user.email}
                  </p>
                  {user.created_at && (
                    <p className="text-sm text-text-secondary font-raleway">
                      Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-primary" />
              <CardTitle className="font-cinzel">Tema</CardTitle>
            </div>
            <CardDescription className="font-raleway">
              Escolha a aparência da interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleThemeChange(opt.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                      theme === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 text-text-secondary'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-raleway text-sm">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle className="font-cinzel">Notificações</CardTitle>
            </div>
            <CardDescription className="font-raleway">
              Gerencie como deseja receber informações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-text-secondary" />
                  <div>
                    <Label className="font-raleway">Notificações por Email</Label>
                    <p className="text-sm text-text-secondary font-raleway">
                      Alertas importantes e atualizações
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('email')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.email ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      notifications.email ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-text-secondary" />
                  <div>
                    <Label className="font-raleway">Notificações Push</Label>
                    <p className="text-sm text-text-secondary font-raleway">
                      Mensagens no navegador
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('push')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.push ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      notifications.push ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-text-secondary" />
                  <div>
                    <Label className="font-raleway">SMS</Label>
                    <p className="text-sm text-text-secondary font-raleway">
                      Mensagens de texto
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('sms')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.sms ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      notifications.sms ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-text-secondary" />
                  <div>
                    <Label className="font-raleway">Resumo Semanal</Label>
                    <p className="text-sm text-text-secondary font-raleway">
                      Resumo do seu progresso semanal
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('weekly')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.weekly ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      notifications.weekly ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-text-secondary" />
                  <div>
                    <Label className="font-raleway">Promoções</Label>
                    <p className="text-sm text-text-secondary font-raleway">
                      Ofertas e novidades
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('promotions')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.promotions ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      notifications.promotions ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <CardTitle className="font-cinzel">Idioma</CardTitle>
            </div>
            <CardDescription className="font-raleway">
              Selecione o idioma da interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {languageOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleLanguageChange(opt.value)}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                    language === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 text-text-secondary'
                  }`}
                >
                  <span className="text-2xl">{opt.flag}</span>
                  <span className="font-raleway text-sm text-left">{opt.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          {saved && (
            <div className="flex items-center gap-2 text-primary">
              <Check className="w-5 h-5" />
              <span className="font-raleway">Salvo!</span>
            </div>
          )}
          <Button
            onClick={handleSalvar}
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
