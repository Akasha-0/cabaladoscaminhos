// src/app/cockpit/settings/ChangePasswordSection.tsx
// Client component: formulário de alteração de senha do operator.
//
// Fluxo:
//   1. Operator clica "Alterar senha" → expande o formulário
//   2. Preenche senha atual, nova senha e confirmação
//   3. Submit → PATCH /api/operator/auth/me { currentPassword, newPassword }
//   4. Sucesso: exibe "Senha alterada com sucesso!"
//   5. Erro: exibe mensagem retornada pela API

'use client';

import { useState, useCallback } from 'react';
import { KeyRound, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ChangePasswordSection() {
  const [expanded, setExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetForm = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError(null);
    setSuccess(false);
  }, []);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => {
      if (!prev) resetForm();
      return !prev;
    });
  }, [resetForm]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(false);

      // Validações client-side
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        setError('Todos os campos são obrigatórios.');
        return;
      }
      if (newPassword.length < 8) {
        setError('A nova senha deve ter ao menos 8 caracteres.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('As senhas não coincidem.');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/operator/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? 'Erro ao alterar senha.');
          return;
        }

        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } catch {
        setError('Erro de conexão. Tente novamente.');
      } finally {
        setLoading(false);
      }
    },
    [currentPassword, newPassword, confirmNewPassword],
  );

  return (
    <section className="space-y-3">
      <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
        Segurança
      </h2>
      <div className="rounded-xl border border-border bg-card">
        {/* Collapsible header */}
        <button
          type="button"
          onClick={handleToggle}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors rounded-xl"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Alterar senha</p>
              <p className="text-xs text-muted-foreground">
                Atualize sua senha de acesso ao cockpit.
              </p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Collapsible content */}
        {expanded && (
          <div className="px-4 pb-4">
            <div className="border-t border-border pt-4">
              {success ? (
                <div className="flex items-center gap-3 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-300">
                      Senha alterada com sucesso!
                    </p>
                    <p className="text-xs text-emerald-400/70 mt-0.5">
                      Todas as outras sessões foram revogadas.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-sm text-rose-300">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha atual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Digite sua senha atual"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="current-password"
                      minLength={1}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      placeholder="Repita a nova senha"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setExpanded(false);
                        resetForm();
                      }}
                      disabled={loading}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 gap-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Alterar senha
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
