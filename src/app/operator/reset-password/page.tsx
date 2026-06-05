'use client';

import { Suspense, useState, useEffect, type FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token ausente. Solicite um novo link de recuperação.');
    }
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Token ausente. Solicite um novo link de recuperação.');
      return;
    }

    if (newPassword.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/operator/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? 'Não foi possível redefinir a senha.');
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setError('Não foi possível conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ramiro min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.55 0.18 260) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 mb-4">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold text-foreground mb-1">
            Redefinir Senha
          </h1>
          <p className="text-sm text-muted-foreground">
            Digite sua nova senha de acesso ao Cockpit
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 shadow-2xl shadow-black/20">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium">
                Senha atualizada! Redirecionando...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div
                  role="alert"
                  className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                >
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs text-muted-foreground uppercase tracking-wider">
                  Nova Senha
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                  className="bg-muted/50 border-border/50 focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground uppercase tracking-wider">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                  className="bg-muted/50 border-border/50 focus:border-primary/50"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Redefinir Senha'
                )}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Acesso restrito — operadores autorizados
        </p>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}