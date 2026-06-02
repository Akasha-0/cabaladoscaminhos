'use client';
// src/components/operator/MfaChallenge.tsx
// Componente de challenge MFA (step 2 do login) — Fase 20.
//
// Recebido do /login:
//   { mfaRequired: true, mfaToken: string, operator: { ... } }
//
// O componente oferece dois caminhos:
//   1. Código TOTP (input 6 dígitos)
//   2. Recovery code (input 16 chars hex) — mostrado em toggle
//
// Em sucesso, chama onVerified() para o parent (OperatorLoginForm)
// avançar para o cockpit.

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MfaChallengeProps {
  mfaToken: string;
  onVerified: () => void;
  onCancel: () => void;
}

// fallow-ignore-next-line complexity
export function MfaChallenge({ mfaToken, onVerified, onCancel }: MfaChallengeProps) {
  const [mode, setMode] = useState<'totp' | 'recovery'>('totp');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const endpoint = mode === 'totp'
        ? '/api/operator/auth/mfa/verify'
        : '/api/operator/auth/mfa/recovery-code';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mfaToken, code: code.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Código inválido');
        return;
      }
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4" noValidate>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-400">Verificação em 2 Fatores</h2>
        <p className="mt-1 text-sm text-slate-400">
          {mode === 'totp'
            ? 'Abra seu app autenticador e digite o código de 6 dígitos.'
            : 'Digite um dos seus códigos de recuperação salvos.'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mfa-code" className="text-sm text-slate-300">
          {mode === 'totp' ? 'Código TOTP' : 'Recovery code'}
        </Label>
        <Input
          id="mfa-code"
          type="text"
          inputMode={mode === 'totp' ? 'numeric' : 'text'}
          maxLength={mode === 'totp' ? 6 : 16}
          value={code}
          onChange={(e) => setCode(mode === 'totp' ? e.target.value.replace(/\D/g, '') : e.target.value.trim().toLowerCase())}
          placeholder={mode === 'totp' ? '000000' : 'abcdef0123456789'}
          autoComplete="one-time-code"
          className="bg-slate-800/50 border-slate-700/50 text-center font-mono tracking-widest"
          disabled={isLoading}
          autoFocus
        />
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Button
          type="submit"
          disabled={isLoading || (mode === 'totp' ? code.length !== 6 : code.length !== 16)}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {isLoading ? 'Validando…' : 'Verificar'}
        </Button>
        <div className="flex justify-between text-xs">
          <button
            type="button"
            onClick={() => { setMode(mode === 'totp' ? 'recovery' : 'totp'); setCode(''); setError(null); }}
            className="text-slate-400 hover:text-orange-300"
          >
            {mode === 'totp' ? 'Usar recovery code' : 'Usar código TOTP'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-300"
          >
            Voltar ao login
          </button>
        </div>
      </div>
    </form>
  );
}
