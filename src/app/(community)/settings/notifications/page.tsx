'use client';

// ============================================================================
// SETTINGS — /settings/notifications  (W36 Smart Notifications v2)
// ============================================================================
// UI para a matriz de preferências v2 (categorias × canais) + quiet hours
// + digest frequency + push registration + test notification.
//
// Persistência: PATCH /api/notifications/v2/preferences
// Push:         POST  /api/notifications/push (subscribe via push-server.ts)
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell, Mail, Smartphone, MessageSquare, Save, Loader2, Check,
  AlertTriangle, Clock, Calendar, Send, Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// Tipos espelhados de preferences-v2.ts (mantidos client-safe)
// ============================================================================

type NotificationCategory =
  | 'mention' | 'reply' | 'follow' | 'akasha' | 'marketplace'
  | 'mentorship' | 'event' | 'system' | 'marketing';

type NotificationChannel = 'inApp' | 'email' | 'push' | 'sms';

interface CategoryChannelMatrix {
  [cat: string]: Record<NotificationChannel, boolean>;
}

interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
}

type DigestFrequency = 'REALTIME' | 'DAILY' | 'WEEKLY' | 'OFF';

interface Preferences {
  userId: string;
  categories: CategoryChannelMatrix;
  quietHours: QuietHours;
  digestFrequency: DigestFrequency;
  updatedAt: string;
}

// ============================================================================
// Constantes visuais
// ============================================================================

const CATEGORIES: { key: NotificationCategory; label: string; emoji: string; description: string }[] = [
  { key: 'mention',     label: 'Menções',     emoji: '@', description: 'Quando alguém te @menciona em um post' },
  { key: 'reply',       label: 'Respostas',   emoji: '↩', description: 'Respostas aos seus comentários e posts' },
  { key: 'follow',      label: 'Seguidores',  emoji: '+', description: 'Novos seguidores e conexões' },
  { key: 'akasha',      label: 'Akasha',      emoji: '✺', description: 'Marcos de uso e novidades da IA Akasha' },
  { key: 'marketplace', label: 'Marketplace', emoji: '◆', description: 'Reservas de offerings e pagamentos' },
  { key: 'mentorship',  label: 'Mentoria',    emoji: '☼', description: 'Sessões e lembretes de mentoria' },
  { key: 'event',       label: 'Eventos',     emoji: '◐', description: 'Lives, rituais e calendário sagrado' },
  { key: 'system',      label: 'Sistema',     emoji: '⚙', description: 'Manutenção, segurança e moderação' },
  { key: 'marketing',   label: 'Marketing',   emoji: '✦', description: 'Novidades e promoções (opt-in)' },
];

const CHANNELS: { key: NotificationChannel; label: string; icon: React.ElementType }[] = [
  { key: 'inApp', label: 'App', icon: Bell },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'push',  label: 'Push', icon: Smartphone },
  { key: 'sms',   label: 'SMS', icon: MessageSquare },
];

const DIGEST_OPTIONS: { value: DigestFrequency; label: string; description: string }[] = [
  { value: 'REALTIME', label: 'Tempo real', description: 'Entrega imediata em cada canal habilitado' },
  { value: 'DAILY',    label: 'Diário',     description: 'Resumo consolidado às 08:00 (horário local)' },
  { value: 'WEEKLY',   label: 'Semanal',    description: 'Resumo semanal todo domingo' },
  { value: 'OFF',      label: 'Desativado', description: 'Apenas in-app, sem emails/push agregados' },
];

// ============================================================================
// Componente principal
// ============================================================================

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testingPush, setTestingPush] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  // ==========================================================================
  // Carrega prefs + detecta suporte a push
  // ==========================================================================
  const loadPrefs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notifications/v2/preferences', { cache: 'no-store' });
      if (!res.ok) {
        setError('Não foi possível carregar suas preferências. Tente novamente.');
        return;
      }
      const json = await res.json();
      setPrefs(json.preferences as Preferences);
    } catch {
      setError('Erro de rede. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPrefs();
  }, [loadPrefs]);

  useEffect(() => {
    if (typeof globalThis !== 'undefined') {
      setPushSupported('serviceWorker' in globalThis.navigator && 'PushManager' in globalThis);
    }
  }, []);

  // ==========================================================================
  // Toggle
  // ==========================================================================
  const toggleCell = useCallback(
    (cat: NotificationCategory, channel: NotificationChannel) => {
      if (!prefs) return;
      setSaved(false);
      setPrefs({
        ...prefs,
        categories: {
          ...prefs.categories,
          [cat]: { ...prefs.categories[cat], [channel]: !prefs.categories[cat][channel] },
        },
      });
    },
    [prefs]
  );

  // ==========================================================================
  // Master toggle (marcar/desmarcar tudo)
  // ==========================================================================
  const setAllForCategory = useCallback(
    (cat: NotificationCategory, value: boolean) => {
      if (!prefs) return;
      const channels = { inApp: value, email: value, push: value, sms: value };
      setSaved(false);
      setPrefs({
        ...prefs,
        categories: { ...prefs.categories, [cat]: channels },
      });
    },
    [prefs]
  );

  // ==========================================================================
  // Quiet hours
  // ==========================================================================
  const updateQuietHours = useCallback(
    (patch: Partial<QuietHours>) => {
      if (!prefs) return;
      setSaved(false);
      setPrefs({ ...prefs, quietHours: { ...prefs.quietHours, ...patch } });
    },
    [prefs]
  );

  // ==========================================================================
  // Digest frequency
  // ==========================================================================
  const setDigest = useCallback(
    (digestFrequency: DigestFrequency) => {
      if (!prefs) return;
      setSaved(false);
      setPrefs({ ...prefs, digestFrequency });
    },
    [prefs]
  );

  // ==========================================================================
  // Save
  // ==========================================================================
  const save = useCallback(async () => {
    if (!prefs) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/notifications/v2/preferences', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          categories: prefs.categories,
          quietHours: prefs.quietHours,
          digestFrequency: prefs.digestFrequency,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(typeof json?.error === 'string' ? json.error : 'Falha ao salvar');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError((e as Error).message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }, [prefs]);

  // ==========================================================================
  // Test push
  // ==========================================================================
  const testPush = useCallback(async () => {
    setTestingPush(true);
    try {
      const res = await fetch('/api/notifications/push/test', { method: 'POST' });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError('Falha ao enviar push de teste.');
      }
    } catch {
      setError('Push de teste falhou.');
    } finally {
      setTestingPush(false);
    }
  }, []);

  // ==========================================================================
  // Disable all push (1-tap unsub)
  // ==========================================================================
  const disableAllPush = useCallback(() => {
    if (!prefs) return;
    const next = { ...prefs.categories };
    (Object.keys(next) as NotificationCategory[]).forEach((cat) => {
      next[cat] = { ...next[cat], push: false, sms: false };
    });
    setSaved(false);
    setPrefs({ ...prefs, categories: next });
  }, [prefs]);

  // ==========================================================================
  // Render
  // ==========================================================================
  if (loading || !prefs) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8" role="status" aria-live="polite">
        <Card>
          <CardContent className="flex items-center gap-3 p-8">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>Carregando preferências…</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Bell className="h-6 w-6" aria-hidden="true" />
          Notificações
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha como e quando quer receber notificações. As mudanças são salvas quando você pressiona “Salvar”.
        </p>
      </header>

      {error && (
        <div role="alert" className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* ================================================================ */}
      {/* Matriz de preferências (categorias × canais) */}
      {/* ================================================================ */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Preferências por categoria</CardTitle>
          <CardDescription>
            Defina em quais canais você quer receber cada tipo de notificação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Versão mobile: cards empilhados */}
          <div className="md:hidden space-y-3">
            {CATEGORIES.map(({ key, label, emoji, description }) => (
              <CategoryCard
                key={key}
                catKey={key}
                label={label}
                emoji={emoji}
                description={description}
                channels={prefs.categories[key]}
                onToggle={toggleCell}
                onAllOn={() => setAllForCategory(key, true)}
                onAllOff={() => setAllForCategory(key, false)}
              />
            ))}
          </div>

          {/* Versão desktop: tabela matriz */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th scope="col" className="text-left font-medium p-2">Categoria</th>
                  {CHANNELS.map(({ key, label, icon: Icon }) => (
                    <th key={key} scope="col" className="text-center font-medium p-2">
                      <div className="flex items-center justify-center gap-1">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {label}
                      </div>
                    </th>
                  ))}
                  <th scope="col" className="text-right font-medium p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map(({ key, label, emoji, description }) => (
                  <tr key={key} className="border-b last:border-0 hover:bg-muted/30">
                    <th scope="row" className="text-left font-normal p-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-base" aria-hidden="true">{emoji}</span>
                        <span className="font-medium">{label}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </th>
                    {CHANNELS.map(({ key: ch }) => (
                      <td key={ch} className="text-center p-3">
                        <Checkbox
                          checked={prefs.categories[key][ch]}
                          onCheckedChange={() => toggleCell(key, ch)}
                          aria-label={`${label} via ${ch}`}
                        />
                      </td>
                    ))}
                    <td className="text-right p-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setAllForCategory(key, true)}>
                          Todos
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setAllForCategory(key, false)}>
                          Nenhum
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Quiet hours */}
      {/* ================================================================ */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" aria-hidden="true" />
            Horário silencioso
          </CardTitle>
          <CardDescription>
            Pausa notificações (exceto críticas) durante este intervalo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={prefs.quietHours.enabled}
              onCheckedChange={(v) => updateQuietHours({ enabled: Boolean(v) })}
              aria-label="Ativar horário silencioso"
            />
            <span className="text-sm">Ativar horário silencioso</span>
          </label>

          {prefs.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="qh-start">Início</Label>
                <Input
                  id="qh-start"
                  type="time"
                  value={prefs.quietHours.start}
                  onChange={(e) => updateQuietHours({ start: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="qh-end">Fim</Label>
                <Input
                  id="qh-end"
                  type="time"
                  value={prefs.quietHours.end}
                  onChange={(e) => updateQuietHours({ end: e.target.value })}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="qh-tz">Fuso</Label>
                <Input
                  id="qh-tz"
                  type="text"
                  value={prefs.quietHours.timezone}
                  onChange={(e) => updateQuietHours({ timezone: e.target.value })}
                  placeholder="America/Sao_Paulo"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Digest frequency */}
      {/* ================================================================ */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            Frequência de resumo
          </CardTitle>
          <CardDescription>
            Como agrupar notificações quando você não escolheu tempo real.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {DIGEST_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDigest(opt.value)}
              className={cn(
                'text-left rounded-md border p-3 transition-colors',
                prefs.digestFrequency === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/30'
              )}
              aria-pressed={prefs.digestFrequency === opt.value}
            >
              <div className="font-medium">{opt.label}</div>
              <div className="text-xs text-muted-foreground">{opt.description}</div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Push registration */}
      {/* ================================================================ */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" aria-hidden="true" />
            Push no dispositivo
          </CardTitle>
          <CardDescription>
            Receba notificações mesmo com o app fechado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={pushSupported ? 'default' : 'secondary'}>
              {pushSupported ? 'Suportado' : 'Não suportado'}
            </Badge>
            {prefs.categories.mention.push && (
              <Badge variant="default">Push ativo</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={testPush} disabled={testingPush || !pushSupported}>
              {testingPush ? <Loader2 className="h-4 w-4 animate-spin mr-1" aria-hidden="true" /> : <Send className="h-4 w-4 mr-1" aria-hidden="true" />}
              Enviar push de teste
            </Button>
            <Button variant="ghost" onClick={disableAllPush}>
              <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
              Desativar push e SMS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Sticky save */}
      {/* ================================================================ */}
      <div className="sticky bottom-4 flex items-center justify-end gap-2 bg-background/80 backdrop-blur rounded-md p-2 border">
        {saved && (
          <span className="text-sm text-green-700 flex items-center gap-1 mr-2">
            <Check className="h-4 w-4" aria-hidden="true" /> Salvo
          </span>
        )}
        <Button onClick={save} disabled={saving} aria-label="Salvar preferências">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" aria-hidden="true" /> : <Save className="h-4 w-4 mr-1" aria-hidden="true" />}
          Salvar
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Subcomponentes (privados ao file)
// ============================================================================

function CategoryCard({
  catKey,
  label,
  emoji,
  description,
  channels,
  onToggle,
  onAllOn,
  onAllOff,
}: {
  catKey: NotificationCategory;
  label: string;
  emoji: string;
  description: string;
  channels: Record<NotificationChannel, boolean>;
  onToggle: (cat: NotificationCategory, ch: NotificationChannel) => void;
  onAllOn: () => void;
  onAllOff: () => void;
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-base" aria-hidden="true">{emoji}</span>
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onAllOn}>Todos</Button>
          <Button variant="ghost" size="sm" onClick={onAllOff}>Nenhum</Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {CHANNELS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(catKey, key)}
            aria-pressed={channels[key]}
            aria-label={`${label}: ${channels[key] ? 'ligado' : 'desligado'}`}
            className={cn(
              'rounded-md border p-2 text-xs flex flex-col items-center gap-1 transition-colors',
              channels[key] ? 'border-primary bg-primary/5' : 'border-border'
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Inline Checkbox (shadcn-style props compat)
// ============================================================================

function Checkbox({
  checked,
  onCheckedChange,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'inline-flex h-5 w-5 items-center justify-center rounded border transition-colors',
        checked ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'
      )}
    >
      {checked && <Check className="h-3 w-3" aria-hidden="true" />}
    </button>
  );
}
