// src/components/operator/mfa/MfaSetup.tsx
// Componente de setup e gestão de MFA TOTP para o operator logado.
// Apenas operators com role=ADMIN podem ativar MFA (escopo Fase 20).
//
// Fluxo de ativação:
//   1. Operator clica "Ativar MFA" → POST /api/operator/auth/mfa/setup
//   2. Exibe QR code + código manual + campo de verificação
//   3. Operator digita 6 dígitos → POST /api/operator/auth/mfa/verify-setup
//   4. Em sucesso: exibe os 10 recovery codes (uma vez só)
//   5. Operator pode baixar os códigos como .txt
//
// Fluxo de desativação:
//   1. Operator clica "Desativar MFA" → pede senha
//   2. POST /api/operator/auth/mfa/disable { password }
//   3. Em sucesso: volta ao estado "MFA desativado"
//
// Fluxo quando MFA já está ativo:
//   - Mostra badge "MFA Ativo" + data de ativação (se disponível)
//   - Oferece "Desativar MFA" com confirmação de senha

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldCheck, ShieldOff, Loader2, Download, AlertTriangle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ============================================================================
// Tipos
// ============================================================================

interface MfaSetupData {
  secret: string;
  qrDataUrl: string;
  otpauthUrl: string;
  recoveryCodes: string[];
}

type FlowState =
  | 'loading'
  | 'disabled'
  | 'setup-starting'
  | 'setup-verify'
  | 'setup-done'
  | 'active'
  | 'disabling'
  | 'error';

interface MfaStatus {
  mfaEnabled: boolean;
  role: 'ADMIN' | 'OPERATOR';
}

interface MfaSetupProps {
  /** Passado pelo parent se já souber o status (evita fetch extra). */
  initialStatus?: MfaStatus;
  /** Para re-renderizar quando o status mudar após actions. */
  onStatusChange?: (enabled: boolean) => void;
}

// ============================================================================
// Helpers
// ============================================================================

/** Formata o secret base32 em blocos de 4 para leitura humana. */
function formatSecret(secret: string): string {
  return secret.replace(/(.{4})/g, '$1 ').trim();
}

/** Baixa os recovery codes como arquivo .txt. */
function downloadRecoveryCodes(codes: string[]): void {
  const content = [
    'CÓDIGOS DE RECUPERAÇÃO — Cabala dos Caminhos',
    '==========================================',
    '',
    'GUARDE ESTES CÓDIGOS EM LOCAL SEGURO.',
    'Cada código pode ser usado UMA vez para fazer login.',
    '',
    ...codes.map((code, i) => `  ${String(i + 1).padStart(2, '0')}.  ${code}`),
    '',
    'Se perder o app autenticador, use um destes códigos.',
    'Após usar todos, regenerate seu MFA imediatamente.',
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cabala-dos-caminhos-recovery-codes.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// Sub-componentes
// ============================================================================

function QrCodeDisplay({ dataUrl, secret }: { dataUrl: string; secret: string }) {
  const [copied, setCopied] = useState(false);

  async function copySecret() {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code */}
      <div className="p-4 bg-white rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt="QR Code para app autenticador"
          width={180}
          height={180}
          className="w-[180px] h-[180px]"
        />
      </div>

      {/* Instrução */}
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        Escaneie com Google Authenticator, Authy ou 1Password.
      </p>

      {/* Código manual */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Código manual
          </Label>
          <button
            onClick={copySecret}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            title="Copiar código"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        <code className="block w-full px-3 py-2 bg-muted rounded-lg text-xs font-mono text-center tracking-widest select-all break-all">
          {formatSecret(secret)}
        </code>
      </div>
    </div>
  );
}

function RecoveryCodesDisplay({ codes }: { codes: string[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-200">
          <strong>Anote ou baixe estes códigos agora.</strong> Eles só serão
          mostrados uma vez. Cada um pode ser usado uma única vez para fazer
          login se perder o app autenticador.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {codes.map((code, i) => (
          <code
            key={i}
            className="px-3 py-2 bg-muted rounded-lg text-sm font-mono text-center select-all"
          >
            {code}
          </code>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={() => downloadRecoveryCodes(codes)}
        className="w-full gap-2"
      >
        <Download className="w-4 h-4" />
        Baixar códigos de recuperação
      </Button>
    </div>
  );
}

// ============================================================================
// Componente principal
// ============================================================================

export function MfaSetup({ initialStatus, onStatusChange }: MfaSetupProps) {
  const [state, setState] = useState<FlowState>('loading');
  const [error, setError] = useState<string | null>(null);

  // Setup flow data
  const [setupData, setSetupData] = useState<MfaSetupData | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Disable flow data
  const [disablePassword, setDisablePassword] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  // Admin check
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // ---------------------------------------------------------------------------
  // Carrega status inicial
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (initialStatus) {
      setIsAdmin(initialStatus.role === 'ADMIN');
      setState(initialStatus.mfaEnabled ? 'active' : 'disabled');
      return;
    }

    async function loadStatus() {
      try {
        const res = await fetch('/api/operator/auth/mfa/status');
        if (!res.ok) throw new Error('Falha ao carregar status');
        const data: MfaStatus = await res.json();
        setIsAdmin(data.role === 'ADMIN');
        setState(data.mfaEnabled ? 'active' : 'disabled');
      } catch {
        setError('Não foi possível carregar o status de MFA.');
        setState('error');
      }
    }

    loadStatus();
  }, [initialStatus]);

  // ---------------------------------------------------------------------------
  // Iniciar setup
  // ---------------------------------------------------------------------------
  const startSetup = useCallback(async () => {
    setState('setup-starting');
    setError(null);
    try {
      const res = await fetch('/api/operator/auth/mfa/setup', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? 'Erro desconhecido');
      }
      const data: MfaSetupData = await res.json();
      setSetupData(data);
      setState('setup-verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar setup');
      setState('error');
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Verificar primeiro código
  // ---------------------------------------------------------------------------
  const handleVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (verifyCode.length !== 6 || !/^\d{6}$/.test(verifyCode)) {
        setError('Digite o código de 6 dígitos do seu app.');
        return;
      }

      setIsVerifying(true);
      setError(null);
      try {
        const res = await fetch('/api/operator/auth/mfa/verify-setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: verifyCode }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? 'Código inválido');
        }
        setState('setup-done');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao verificar código');
      } finally {
        setIsVerifying(false);
      }
    },
    [verifyCode]
  );

  // ---------------------------------------------------------------------------
  // Concluir setup (após ver recovery codes)
  // ---------------------------------------------------------------------------
  const finishSetup = useCallback(() => {
    setState('active');
    onStatusChange?.(true);
  }, [onStatusChange]);

  // ---------------------------------------------------------------------------
  // Desativar MFA
  // ---------------------------------------------------------------------------
  const handleDisable = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!disablePassword) {
        setDisableError('Informe sua senha para confirmar.');
        return;
      }
      setIsDisabling(true);
      setDisableError(null);
      try {
        const res = await fetch('/api/operator/auth/mfa/disable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: disablePassword }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? 'Erro desconhecido');
        }
        setState('disabled');
        setDisablePassword('');
        onStatusChange?.(false);
      } catch (err) {
        setDisableError(err instanceof Error ? err.message : 'Erro ao desativar MFA');
      } finally {
        setIsDisabling(false);
      }
    },
    [disablePassword, onStatusChange]
  );

  // ---------------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------------
  const handleReset = useCallback(() => {
    setSetupData(null);
    setVerifyCode('');
    setDisablePassword('');
    setError(null);
    setDisableError(null);
    setState('disabled');
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state === 'error' && !setupData) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-sm text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error ?? 'Erro desconhecido'}
        </div>
        <Button variant="outline" onClick={handleReset}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (state === 'setup-done' && setupData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/10">
          <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
          <div>
            <h3 className="font-medium text-foreground">MFA ativado com sucesso!</h3>
            <p className="text-sm text-muted-foreground">
              A partir do próximo login, você precisará do código do app autenticador.
            </p>
          </div>
        </div>

        <RecoveryCodesDisplay codes={setupData.recoveryCodes} />

        <div className="flex justify-end">
          <Button onClick={finishSetup} className="gap-2">
            Entendi — salvar
          </Button>
        </div>
      </div>
    );
  }

  if (state === 'setup-verify' && setupData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-medium">Configure seu app autenticador</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Escaneie o QR code ou digite o código manual, depois informe o
            código de 6 dígitos.
          </p>
        </div>

        <QrCodeDisplay dataUrl={setupData.qrDataUrl} secret={setupData.secret} />

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-sm text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="totp-code">Código de verificação</Label>
            <Input
              id="totp-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="000000"
              value={verifyCode}
              onChange={(e) =>
                setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              className="text-center text-2xl font-mono tracking-[0.3em] max-w-[200px] mx-auto"
              disabled={isVerifying}
            />
            <p className="text-xs text-center text-muted-foreground">
              Abra o app e digite o código de 6 dígitos.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={isVerifying}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isVerifying || verifyCode.length !== 6}
              className="flex-1 gap-2"
            >
              {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
              Verificar e ativar
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (state === 'active') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <h3 className="font-medium text-foreground">MFA Ativo</h3>
            <p className="text-sm text-muted-foreground">
              Sua conta está protegida com autenticação de dois fatores.
            </p>
          </div>
        </div>

        {/* Disable form */}
        {isAdmin === true && (
          <DisableMfaForm
            password={disablePassword}
            onPasswordChange={setDisablePassword}
            onSubmit={handleDisable}
            isDisabling={isDisabling}
            error={disableError}
          />
        )}
      </div>
    );
  }

  // state === 'disabled'
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-xl border border-muted bg-muted/20">
        <ShieldOff className="w-8 h-8 text-muted-foreground shrink-0" />
        <div>
          <h3 className="font-medium text-muted-foreground">MFA não ativado</h3>
          <p className="text-sm text-muted-foreground/70">
            Adicione uma camada extra de segurança à sua conta.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-sm text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {isAdmin === false && (
        <p className="text-sm text-muted-foreground italic">
          Apenas operators com role=ADMIN podem ativar MFA.
        </p>
      )}

      {isAdmin !== false && (
        <Button onClick={startSetup} className="w-full gap-2">
          <Shield className="w-4 h-4" />
          Ativar autenticação em dois fatores
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Sub-componente: Disable MFA Form
// ============================================================================

interface DisableMfaFormProps {
  password: string;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isDisabling: boolean;
  error: string | null;
}

function DisableMfaForm({
  password,
  onPasswordChange,
  onSubmit,
  isDisabling,
  error,
}: DisableMfaFormProps) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        variant="outline"
        onClick={() => setConfirming(true)}
        className="w-full gap-2 text-muted-foreground hover:text-rose-400 hover:border-rose-400/50"
      >
        <ShieldOff className="w-4 h-4" />
        Desativar MFA
      </Button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 p-4 rounded-xl border border-rose-500/30 bg-rose-500/5" noValidate>
      <p className="text-sm text-rose-200">
        <strong>Tem certeza?</strong> Sua conta ficará menos protegida.
      </p>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-sm text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="disable-password">Confirme com sua senha</Label>
        <Input
          id="disable-password"
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          disabled={isDisabling}
          autoComplete="current-password"
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setConfirming(false);
            onPasswordChange('');
          }}
          disabled={isDisabling}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="destructive"
          disabled={isDisabling || !password}
          className="flex-1 gap-2"
        >
          {isDisabling && <Loader2 className="w-4 h-4 animate-spin" />}
          Desativar MFA
        </Button>
      </div>
    </form>
  );
}
