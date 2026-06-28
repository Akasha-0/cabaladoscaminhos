'use client';

// ============================================================================
// SETTINGS — /settings
// ============================================================================
// Tabs: Profile | Account | Privacy | Notifications | Traditions
//
// Persistência:
//   - Profile/Account/Privacy/Notifications → /api/users/me (PATCH)
//   - Traditions                            → /api/users/me/traditions
//   - Delete account                        → /api/users/me (DELETE)
//
// Tudo via fetch client-side. Falhas de validação são renderizadas inline.
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Lock, Shield, Bell, Sparkles, Save, Loader2,
  Trash2, Eye, EyeOff, AlertTriangle, Check, Plus, X,
  ExternalLink, Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useSoundEffects } from '@/hooks/useSoundEffects';

// ============================================================
// TYPES
// ============================================================

type Tab = 'profile' | 'account' | 'privacy' | 'notifications' | 'traditions';

interface UserSettings {
  // Profile
  displayName: string;
  bio: string;
  avatarUrl: string;
  location: string;
  website: string;
  // Privacy
  profileVisibility: 'public' | 'members' | 'private';
  allowDms: boolean;
  allowMentions: boolean;
  searchIndexing: boolean;
  // Notifications
  emailDigest: 'off' | 'daily' | 'weekly';
  pushEnabled: boolean;
  notifyOnLike: boolean;
  notifyOnComment: boolean;
  notifyOnFollow: boolean;
  notifyOnMention: boolean;
  notifyOnGroupPost: boolean;
  // Traditions
  traditions: string[];
}

const TRADITIONS = [
  { value: 'cabala', label: 'Cabala', emoji: '✡️' },
  { value: 'ifa', label: 'Ifá', emoji: '🪶' },
  { value: 'astrologia', label: 'Astrologia', emoji: '♈' },
  { value: 'tantra', label: 'Tantra', emoji: '🕉️' },
  { value: 'reiki', label: 'Reiki', emoji: '🔆' },
  { value: 'meditacao', label: 'Meditação', emoji: '🧘' },
  { value: 'xamanismo', label: 'Xamanismo', emoji: '🌿' },
  { value: 'cristianismo-mistico', label: 'Cristianismo Místico', emoji: '✝️' },
  { value: 'sufismo', label: 'Sufismo', emoji: '☪️' },
  { value: 'taoismo', label: 'Taoísmo', emoji: '☯️' },
  { value: 'umbanda', label: 'Umbanda', emoji: '🪘' },
  { value: 'candomble', label: 'Candomblé', emoji: '🌍' },
];

// ============================================================
// MAIN
// ============================================================

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  const [tab, setTab] = useState<Tab>('profile');

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [email, setEmail] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);

  // Redirect se deslogado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirectTo=/settings');
    }
  }, [authLoading, user, router]);

  // Carrega settings
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/users/me/settings', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`settings ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setSettings(data.settings ?? defaultsFromUser(user));
        setEmail(data.email ?? user.email ?? '');
      } catch (err) {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.warn('[settings] load falhou:', err);
        setSettings(defaultsFromUser(user!));
        setEmail(user?.email ?? '');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // ============================================================
  // Handlers
  // ============================================================

  const update = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const handleSave = useCallback(async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/users/me/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }
      setSavedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar');
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const handleDeleteAccount = useCallback(async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`delete ${res.status}`);
      await signOut();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao deletar');
      setSaving(false);
    }
  }, [confirmDelete, router, signOut]);

  // ============================================================
  // Render
  // ============================================================

  if (authLoading || !user) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        data-testid="settings-auth-loading"
      >
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" aria-label="Carregando" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-testid="settings-page">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-spiritual-gold font-cinzel">
            sua conta
          </p>
          <h1 className="text-3xl md:text-4xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            ⚙️ Configurações
          </h1>
          <p className="text-sm text-slate-400 font-raleway">
            Personalize seu perfil, privacidade e notificações
          </p>
        </header>

        {/* Tabs */}
        <nav
          className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800/50"
          role="tablist"
          aria-label="Configurações"
        >
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              aria-controls={`tab-panel-${t.value}`}
              onClick={() => setTab(t.value)}
              data-testid={`settings-tab-${t.value}`}
              className={cn(
                'min-h-[44px] px-4 py-2 rounded-lg text-sm font-cinzel whitespace-nowrap inline-flex items-center gap-2 transition-colors',
                tab === t.value
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </nav>

        {error && (
          <div
            className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3"
            role="alert"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300 flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-300 hover:text-red-200 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
              aria-label="Fechar erro"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Panel */}
        {loading || !settings ? (
          <div className="space-y-3">
            <div className="h-32 rounded-xl skeleton" />
            <div className="h-48 rounded-xl skeleton" />
          </div>
        ) : (
          <div
            id={`tab-panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`settings-tab-${tab}`}
            className="space-y-4"
          >
            {tab === 'profile' && (
              <ProfilePanel
                settings={settings}
                onChange={update}
              />
            )}
            {tab === 'account' && (
              <AccountPanel
                email={email}
                onDelete={handleDeleteAccount}
                confirming={confirmDelete}
                onCancelDelete={() => setConfirmDelete(false)}
                saving={saving}
              />
            )}
            {tab === 'privacy' && (
              <PrivacyPanel settings={settings} onChange={update} />
            )}
            {tab === 'notifications' && (
              <NotificationsPanel settings={settings} onChange={update} />
            )}
            {tab === 'traditions' && (
              <TraditionsPanel settings={settings} onChange={update} />
            )}
          </div>
        )}

        {/* Footer save bar — sticky mobile */}
        {settings && (
          <footer
            className="sticky bottom-3 z-20 rounded-2xl bg-slate-900/95 backdrop-blur border border-slate-800/70 p-3 flex items-center justify-between gap-3 shadow-2xl"
            data-testid="settings-save-bar"
          >
            <div className="text-xs text-slate-400">
              {savedAt ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  Salvo às {savedAt.toLocaleTimeString('pt-BR')}
                </span>
              ) : (
                <span>Alterações não salvas</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              data-testid="settings-save"
              className={cn(
                'min-h-[44px] px-5 rounded-xl text-sm font-semibold inline-flex items-center gap-2',
                'bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600',
                'text-white border-0',
                (saving || loading) && 'opacity-60 cursor-not-allowed'
              )}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TAB CONFIG
// ============================================================

const TABS: Array<{ value: Tab; label: string; icon: React.ElementType }> = [
  { value: 'profile', label: 'Perfil', icon: User },
  { value: 'account', label: 'Conta', icon: Lock },
  { value: 'privacy', label: 'Privacidade', icon: Shield },
  { value: 'notifications', label: 'Notificações', icon: Bell },
  { value: 'traditions', label: 'Tradições', icon: Sparkles },
];

// ============================================================
// PANELS
// ============================================================

function ProfilePanel({
  settings,
  onChange,
}: {
  settings: UserSettings;
  onChange: <K extends keyof UserSettings>(k: K, v: UserSettings[K]) => void;
}) {
  return (
    <Panel title="Perfil público" description="Como você aparece para outras pessoas na comunidade.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nome de exibição" htmlFor="displayName">
          <input
            id="displayName"
            type="text"
            value={settings.displayName}
            onChange={(e) => onChange('displayName', e.target.value)}
            maxLength={60}
            data-testid="settings-displayName"
            className="w-full min-h-[44px] px-3 rounded-lg bg-slate-950/60 border border-slate-700 focus:border-amber-500/60 focus:outline-none text-sm text-slate-100"
          />
        </Field>

        <Field label="Localização" htmlFor="location">
          <input
            id="location"
            type="text"
            value={settings.location}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="Cidade, país"
            maxLength={80}
            data-testid="settings-location"
            className="w-full min-h-[44px] px-3 rounded-lg bg-slate-950/60 border border-slate-700 focus:border-amber-500/60 focus:outline-none text-sm text-slate-100 placeholder:text-slate-500"
          />
        </Field>
      </div>

      <Field label="URL do avatar" htmlFor="avatarUrl">
        <input
          id="avatarUrl"
          type="url"
          value={settings.avatarUrl}
          onChange={(e) => onChange('avatarUrl', e.target.value)}
          placeholder="https://…"
          data-testid="settings-avatarUrl"
          className="w-full min-h-[44px] px-3 rounded-lg bg-slate-950/60 border border-slate-700 focus:border-amber-500/60 focus:outline-none text-sm text-slate-100 placeholder:text-slate-500"
        />
        {settings.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.avatarUrl}
            alt="Pré-visualização"
            className="mt-2 w-16 h-16 rounded-full object-cover border border-slate-800/60"
          />
        )}
      </Field>

      <Field label="Website" htmlFor="website">
        <input
          id="website"
          type="url"
          value={settings.website}
          onChange={(e) => onChange('website', e.target.value)}
          placeholder="https://seusite.com"
          data-testid="settings-website"
          className="w-full min-h-[44px] px-3 rounded-lg bg-slate-950/60 border border-slate-700 focus:border-amber-500/60 focus:outline-none text-sm text-slate-100 placeholder:text-slate-500"
        />
      </Field>

      <Field label="Biografia" htmlFor="bio">
        <textarea
          id="bio"
          value={settings.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Compartilhe um pouco do seu caminho espiritual…"
          data-testid="settings-bio"
          className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-700 focus:border-amber-500/60 focus:outline-none text-sm text-slate-100 placeholder:text-slate-500 resize-y"
        />
        <p className="text-xs text-slate-500 mt-1 text-right">
          {settings.bio.length} / 500
        </p>
      </Field>
    </Panel>
  );
}

function AccountPanel({
  email,
  onDelete,
  confirming,
  onCancelDelete,
  saving,
}: {
  email: string;
  onDelete: () => void;
  confirming: boolean;
  onCancelDelete: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-4">
      <Panel title="Conta" description="Email, senha e gerenciamento da conta.">
        <Field label="Email" htmlFor="email">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              id="email"
              type="email"
              value={email}
              readOnly
              data-testid="settings-email"
              className="w-full min-h-[44px] pl-10 pr-3 rounded-lg bg-slate-950/60 border border-slate-700 text-sm text-slate-300 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Para trocar de email, entre em contato com o suporte.
          </p>
        </Field>

        <Field label="Senha" htmlFor="password">
          <button
            type="button"
            className="min-h-[44px] px-4 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-amber-500/40 text-sm text-slate-200 inline-flex items-center gap-2"
            data-testid="settings-change-password"
          >
            <Lock className="w-4 h-4" />
            Solicitar troca de senha
            <ExternalLink className="w-3 h-3 opacity-60" />
          </button>
        </Field>
      </Panel>

      {/* Danger zone */}
      <Panel
        title="Zona perigosa"
        description="Ações irreversíveis. Proceda com cuidado."
        tone="danger"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            Deletar sua conta remove permanentemente todos os seus posts,
            comentários, grupos e preferências. Esta ação não pode ser
            desfeita.
          </p>
          {!confirming ? (
            <button
              type="button"
              onClick={onDelete}
              data-testid="settings-delete-start"
              className="min-h-[44px] px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-sm text-red-300 font-semibold inline-flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Deletar conta permanentemente
            </button>
          ) : (
            <div
              className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 space-y-3"
              role="alertdialog"
              aria-labelledby="delete-confirm-title"
            >
              <p
                id="delete-confirm-title"
                className="text-sm text-red-300 font-semibold"
              >
                Tem certeza absoluta?
              </p>
              <p className="text-xs text-slate-300">
                Esta ação é irreversível. Considere apenas desativar as
                notificações antes.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={saving}
                  data-testid="settings-delete-confirm"
                  className="min-h-[44px] px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Sim, deletar agora
                </button>
                <button
                  type="button"
                  onClick={onCancelDelete}
                  className="min-h-[44px] px-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 text-sm font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}

function PrivacyPanel({
  settings,
  onChange,
}: {
  settings: UserSettings;
  onChange: <K extends keyof UserSettings>(k: K, v: UserSettings[K]) => void;
}) {
  return (
    <Panel title="Privacidade" description="Controle quem vê seu conteúdo e como você pode ser contatado.">
      <Field label="Visibilidade do perfil" htmlFor="profileVisibility">
        <select
          id="profileVisibility"
          value={settings.profileVisibility}
          onChange={(e) =>
            onChange(
              'profileVisibility',
              e.target.value as UserSettings['profileVisibility']
            )
          }
          data-testid="settings-profileVisibility"
          className="w-full min-h-[44px] px-3 rounded-lg bg-slate-950/60 border border-slate-700 focus:border-amber-500/60 text-sm text-slate-100"
        >
          <option value="public">
            Público — qualquer pessoa na internet
          </option>
          <option value="members">
            Membros — apenas logados na comunidade
          </option>
          <option value="private">
            Privado — apenas seguidores aprovados
          </option>
        </select>
      </Field>

      <Toggle
        label="Permitir mensagens diretas"
        description="Outros membros podem iniciar uma conversa com você."
        checked={settings.allowDms}
        onChange={(v) => onChange('allowDms', v)}
        testId="settings-allowDms"
      />

      <Toggle
        label="Permitir menções (@voce)"
        description="Outros podem marcar você em posts e comentários."
        checked={settings.allowMentions}
        onChange={(v) => onChange('allowMentions', v)}
        testId="settings-allowMentions"
      />

      <Toggle
        label="Indexação por motores de busca"
        description="Seu perfil público pode aparecer em Google, Bing etc."
        checked={settings.searchIndexing}
        onChange={(v) => onChange('searchIndexing', v)}
        testId="settings-searchIndexing"
      />
    </Panel>
  );
}

function NotificationsPanel({
  settings,
  onChange,
}: {
  settings: UserSettings;
  onChange: <K extends keyof UserSettings>(k: K, v: UserSettings[K]) => void;
}) {
  return (
    <Panel title="Notificações & Feedback" description="Como e quando você quer ser notificado, e que tipo de feedback quer receber ao interagir.">
      <Field label="Resumo por email" htmlFor="emailDigest">
        <select
          id="emailDigest"
          value={settings.emailDigest}
          onChange={(e) =>
            onChange(
              'emailDigest',
              e.target.value as UserSettings['emailDigest']
            )
          }
          data-testid="settings-emailDigest"
          className="w-full min-h-[44px] px-3 rounded-lg bg-slate-950/60 border border-slate-700 focus:border-amber-500/60 text-sm text-slate-100"
        >
          <option value="off">Desligado</option>
          <option value="daily">Diário (manhã)</option>
          <option value="weekly">Semanal (segunda)</option>
        </select>
      </Field>

      <Toggle
        label="Notificações push"
        description="Avisos mesmo com a aba em segundo plano."
        checked={settings.pushEnabled}
        onChange={(v) => onChange('pushEnabled', v)}
        testId="settings-pushEnabled"
      />

      <div className="pt-3 border-t border-slate-800/50 space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-slate-500 font-cinzel">
          Por tipo de evento
        </h3>
        <Toggle
          label="Curtidas"
          checked={settings.notifyOnLike}
          onChange={(v) => onChange('notifyOnLike', v)}
          testId="settings-notifyOnLike"
        />
        <Toggle
          label="Comentários"
          checked={settings.notifyOnComment}
          onChange={(v) => onChange('notifyOnComment', v)}
          testId="settings-notifyOnComment"
        />
        <Toggle
          label="Novos seguidores"
          checked={settings.notifyOnFollow}
          onChange={(v) => onChange('notifyOnFollow', v)}
          testId="settings-notifyOnFollow"
        />
        <Toggle
          label="Menções (@voce)"
          checked={settings.notifyOnMention}
          onChange={(v) => onChange('notifyOnMention', v)}
          testId="settings-notifyOnMention"
        />
        <Toggle
          label="Posts em grupos que participo"
          checked={settings.notifyOnGroupPost}
          onChange={(v) => onChange('notifyOnGroupPost', v)}
          testId="settings-notifyOnGroupPost"
        />
      </div>

      <SoundEffectsToggle />
    </Panel>
  );
}

// ============================================================================
// SoundEffectsToggle — Wave 24 microinteractions
// ============================================================================
// Toggle opt-in para efeitos sonoros (WebAudio, zero assets). Estado
// persistido em localStorage via useSoundEffects. Mostra preview no toggle.
// ============================================================================
function SoundEffectsToggle() {
  const { enabled, setEnabled, isSupported, play } = useSoundEffects();
  if (!isSupported) return null;
  return (
    <div className="pt-3 border-t border-slate-800/50 space-y-3">
      <h3 className="text-xs uppercase tracking-wider text-slate-500 font-cinzel">
        Feedback ao interagir
      </h3>
      <Toggle
        label="Sons de feedback"
        description="Toques sutis em ações (like, comentário, submit). Toca um exemplo ao ativar."
        checked={enabled}
        onChange={(v) => {
          setEnabled(v);
          if (v) {
            // Toca um sample para confirmar
            window.setTimeout(() => play('success'), 60);
          }
        }}
        testId="settings-soundEnabled"
      />
      <p className="text-xs text-slate-500">
        Sons são opcionais e respeitam WCAG 1.4.2 (volume baixo, dispensáveis). Haptic continua ativo independentemente.
      </p>
    </div>
  );
}

function TraditionsPanel({
  settings,
  onChange,
}: {
  settings: UserSettings;
  onChange: <K extends keyof UserSettings>(k: K, v: UserSettings[K]) => void;
}) {
  const toggleTradition = useCallback(
    (value: string) => {
      const current = settings.traditions;
      const next = current.includes(value)
        ? current.filter((t) => t !== value)
        : [...current, value];
      onChange('traditions', next);
    },
    [settings.traditions, onChange]
  );

  const moveTradition = useCallback(
    (value: string, direction: -1 | 1) => {
      const arr = [...settings.traditions];
      const idx = arr.indexOf(value);
      if (idx < 0) return;
      const target = idx + direction;
      if (target < 0 || target >= arr.length) return;
      [arr[idx], arr[target]] = [arr[target]!, arr[idx]!];
      onChange('traditions', arr);
    },
    [settings.traditions, onChange]
  );

  const sortedTraditions = useMemo(
    () =>
      settings.traditions
        .map((v) => TRADITIONS.find((t) => t.value === v))
        .filter(Boolean) as typeof TRADITIONS,
    [settings.traditions]
  );

  return (
    <Panel
      title="Tradições"
      description="Selecione até 6 tradições. A ordem define a prioridade das recomendações no feed."
    >
      {/* Selected (priority order) */}
      <div className="space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-slate-500 font-cinzel">
          Suas tradições ({sortedTraditions.length}/6)
        </h3>
        {sortedTraditions.length === 0 ? (
          <p className="text-xs text-slate-500">
            Nenhuma tradição selecionada. Escolha abaixo.
          </p>
        ) : (
          <ul className="space-y-2" data-testid="settings-traditions-selected">
            {sortedTraditions.map((t, i) => (
              <li
                key={t.value}
                className="flex items-center gap-2 rounded-lg bg-slate-950/60 border border-slate-800/60 p-2"
                data-testid={`settings-tradition-selected-${t.value}`}
              >
                <span className="text-xs text-slate-500 w-6 text-center font-mono">
                  {i + 1}
                </span>
                <span className="text-base">{t.emoji}</span>
                <span className="text-sm text-slate-100 flex-1">{t.label}</span>
                <button
                  type="button"
                  onClick={() => moveTradition(t.value, -1)}
                  disabled={i === 0}
                  aria-label="Subir prioridade"
                  className="min-h-[44px] min-w-[44px] rounded-md text-slate-400 hover:text-amber-300 hover:bg-slate-800/50 disabled:opacity-30 inline-flex items-center justify-center"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveTradition(t.value, 1)}
                  disabled={i === sortedTraditions.length - 1}
                  aria-label="Baixar prioridade"
                  className="min-h-[44px] min-w-[44px] rounded-md text-slate-400 hover:text-amber-300 hover:bg-slate-800/50 disabled:opacity-30 inline-flex items-center justify-center"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => toggleTradition(t.value)}
                  aria-label={`Remover ${t.label}`}
                  className="min-h-[44px] min-w-[44px] rounded-md text-red-300 hover:text-red-200 hover:bg-red-500/10 inline-flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Available */}
      <div className="pt-3 border-t border-slate-800/50 space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-slate-500 font-cinzel">
          Adicionar
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TRADITIONS.filter((t) => !settings.traditions.includes(t.value)).map(
            (t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleTradition(t.value)}
                disabled={settings.traditions.length >= 6}
                data-testid={`settings-tradition-add-${t.value}`}
                className={cn(
                  'min-h-[44px] px-3 rounded-lg border text-sm inline-flex items-center gap-2 text-left',
                  'bg-slate-950/40 border-slate-800/60 text-slate-300',
                  'hover:border-amber-500/40 hover:text-amber-200',
                  settings.traditions.length >= 6 && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span>{t.emoji}</span>
                <span className="flex-1 truncate">{t.label}</span>
                <Plus className="w-3 h-3 opacity-60" />
              </button>
            )
          )}
        </div>
      </div>
    </Panel>
  );
}

// ============================================================
// PRIMITIVES
// ============================================================

function Panel({
  title,
  description,
  children,
  tone = 'default',
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: 'default' | 'danger';
}) {
  return (
    <section
      className={cn(
        'rounded-xl border p-5 space-y-4',
        tone === 'danger'
          ? 'bg-red-500/5 border-red-500/20'
          : 'bg-slate-900/50 border-slate-800/50'
      )}
    >
      <header className="space-y-1">
        <h2
          className={cn(
            'font-cinzel text-base',
            tone === 'danger' ? 'text-red-300' : 'text-slate-100'
          )}
        >
          {title}
        </h2>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs uppercase tracking-wider text-slate-400 font-cinzel"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  testId,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  testId?: string;
}) {
  return (
    <label
      className="flex items-start gap-3 cursor-pointer min-h-[44px] py-2"
      data-testid={testId}
    >
      <span className="relative inline-block w-10 h-6 flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
          aria-label={label}
        />
        <span
          className={cn(
            'absolute inset-0 rounded-full transition-colors',
            checked ? 'bg-amber-500/70' : 'bg-slate-700'
          )}
        />
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-4'
          )}
        />
      </span>
      <span className="flex-1">
        <span className="text-sm text-slate-100 block">{label}</span>
        {description && (
          <span className="text-xs text-slate-500 block mt-0.5">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

// ============================================================
// HELPERS
// ============================================================

function defaultsFromUser(user: { email?: string | null; id: string }): UserSettings {
  return {
    displayName: user.email?.split('@')[0] ?? 'Membro',
    bio: '',
    avatarUrl: '',
    location: '',
    website: '',
    profileVisibility: 'public',
    allowDms: true,
    allowMentions: true,
    searchIndexing: true,
    emailDigest: 'weekly',
    pushEnabled: false,
    notifyOnLike: true,
    notifyOnComment: true,
    notifyOnFollow: true,
    notifyOnMention: true,
    notifyOnGroupPost: false,
    traditions: [],
  };
}