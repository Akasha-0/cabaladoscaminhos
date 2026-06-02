'use client';
// src/components/operator/MfaSetup.tsx
// Componente de setup de MFA TOTP (Fase 20).
//
// Fluxo:
//   1. Chama POST /api/operator/auth/mfa/setup → recebe secret + qr + recovery codes
//   2. Mostra QR + secret em texto (alternativa) + lista de 10 recovery codes
//   3. Operator escaneia o QR no app autenticador
//   4. Operator digita o código TOTP atual no input
//   5. Chama POST /api/operator/auth/mfa/verify-setup { code }
//   6. Em sucesso, mostra confirmação. Em falha, permite tentar de novo.

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MfaSetupProps {
  /** Callback chamado após setup habilitado com sucesso. */
  onSuccess?: () => void;
  /** Callback para voltar/cancelar. */
  onCancel?: () => void;
}

interface SetupResponse {
  secret: string;
  qrDataUrl: string;
  otpauthUrl: string;
  recoveryCodes: string[];
}

export function MfaSetup({ onSuccess, onCancel }: MfaSetupProps) {
  const [step, setStep] = useState<'init' | 'verify' | 'done'>('init');
  const [setup, setSetup] = useState<SetupResponse | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // STEP 1 — chama /setup
  const handleInit = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/operator/auth/mfa/setup', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Falha ao iniciar setup');
        return;
      }
      const data: SetupResponse = await res.json();
      setSetup(data);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2 — submete código TOTP
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError('Código deve ter 6 dígitos');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/operator/auth/mfa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Código inválido');
        return;
      }
      setStep('done');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'init') {
    return (
      <div className="space-y-4 rounded-lg border border-slate-700/50 bg-slate-800/30 p-6">
        <h3 className="text-lg font-semibold text-orange-400">Ativar Autenticação em 2 Fatores (MFA)</h3>
        <p className="text-sm text-slate-300">
          Adiciona uma camada extra de segurança. Você precisará de um app autenticador
          (Google Authenticator, Authy, 1Password) para gerar códigos de 6 dígitos.
        </p>
        <p className="text-xs text-slate-500">
          Também geraremos 10 códigos de recuperação — guarde-os em local seguro. Cada um só pode ser usado uma vez.
        </p>
        {error && (
          <div className="rounded border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={handleInit} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
            {isLoading ? 'Gerando…' : 'Iniciar setup'}
          </Button>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (step === 'verify' && setup) {
    return (
      <div className="space-y-4 rounded-lg border border-slate-700/50 bg-slate-800/30 p-6">
        <h3 className="text-lg font-semibold text-orange-400">Escaneie o QR Code</h3>
        <p className="text-sm text-slate-300">
          Abra seu app autenticador e escaneie:
        </p>
        <div className="flex flex-col items-center gap-3 rounded border border-slate-700/50 bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup.qrDataUrl} alt="QR Code MFA" width={256} height={256} />
        </div>
        <details className="text-xs text-slate-400">
          <summary className="cursor-pointer">Não consegue escanear? Mostrar chave manual</summary>
          <code className="mt-2 block break-all rounded bg-slate-900 p-2 text-orange-300">
            {setup.secret}
          </code>
        </details>

        <div className="space-y-2 rounded border border-amber-500/30 bg-amber-500/5 p-3">
          <h4 className="text-sm font-semibold text-amber-300">Códigos de recuperação (guarde com segurança)</h4>
          <p className="text-xs text-slate-400">
            Estes códigos só aparecem AGORA. Cada um pode ser usado uma vez caso perca acesso ao app.
          </p>
          <ul className="grid grid-cols-2 gap-1 text-xs font-mono text-amber-200">
            {setup.recoveryCodes.map((c) => (
              <li key={c} className="rounded bg-slate-900/50 px-2 py-1">{c}</li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleVerify} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="totp-code" className="text-sm text-slate-300">Código de 6 dígitos do app</Label>
            <Input
              id="totp-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              autoComplete="one-time-code"
              className="bg-slate-800/50 border-slate-700/50 text-center tracking-widest"
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="rounded border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </div>
          )}
          <Button type="submit" disabled={isLoading || code.length !== 6} className="bg-orange-500 hover:bg-orange-600">
            {isLoading ? 'Validando…' : 'Ativar MFA'}
          </Button>
        </form>
      </div>
    );
  }

  // step === 'done'
  return (
    <div className="space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6">
      <h3 className="text-lg font-semibold text-emerald-300">MFA ativado com sucesso</h3>
      <p className="text-sm text-slate-300">
        A partir de agora, ao fazer login, será solicitado o código TOTP do seu app autenticador.
      </p>
    </div>
  );
}
