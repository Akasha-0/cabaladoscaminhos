// tests/components/operator/mfa/mfa-setup.test.tsx
// Testes do componente MfaSetup (Fase 20).
// Cobertura: renderização em cada estado do fluxo, input de 6 dígitos,
// ações de activate/disable.

import '@testing-library/jest-dom/vitest';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MfaSetup } from '@/components/operator/mfa/MfaSetup';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

vi.stubGlobal('navigator', {
  clipboard: { writeText: vi.fn() },
});

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn(),
});

// Preserva o document real do jsdom para que React 19 createRoot funcione.
const _origCreateElement = document.createElement.bind(document);
vi.stubGlobal('document', Object.assign(document, {
  createElement: (tag: string) => {
    const el = _origCreateElement(tag as keyof HTMLCollectionOf<HTMLElement>);
    if (tag === 'a') {
      el.appendChild = vi.fn((child: Node) => child);
    }
    return el;
  },
}));

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function setupFetch(status: number, data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status,
    json: async () => data,
  });
}

const defaultAdminStatus = { mfaEnabled: false, role: 'ADMIN' as const };
const defaultActiveStatus = { mfaEnabled: true, role: 'ADMIN' as const };

// ----------------------------------------------------------------------------
// Testes
// ----------------------------------------------------------------------------

describe('MfaSetup — renderização e interação', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(cleanup);

  // ── disabled ──────────────────────────────────────────────────────────────

  it('mostra "MFA não ativado" quando MFA está desabilitado', async () => {
    setupFetch(200, defaultAdminStatus);
    render(<MfaSetup />);

    await waitFor(() => {
      expect(screen.getByText('MFA não ativado')).toBeInTheDocument();
    });
  });

  it('mostra botão "Ativar autenticação em dois fatores" quando não há MFA', async () => {
    setupFetch(200, defaultAdminStatus);
    render(<MfaSetup />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /ativar autenticação em dois fatores/i })
      ).toBeInTheDocument();
    });
  });

  it('mostra aviso para OPERATOR — não mostra botão', async () => {
    setupFetch(200, { mfaEnabled: false, role: 'OPERATOR' });
    render(<MfaSetup />);

    await waitFor(() => {
      expect(
        screen.getByText(/apenas operators com role=admin podem ativar mfa/i)
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('button', { name: /ativar/i })
    ).not.toBeInTheDocument();
  });

  // ── active ────────────────────────────────────────────────────────────────

  it('mostra "MFA Ativo" quando MFA já está habilitado', async () => {
    setupFetch(200, defaultActiveStatus);
    render(<MfaSetup />);

    await waitFor(() => {
      expect(screen.getByText('MFA Ativo')).toBeInTheDocument();
    });
  });

  it('mostra botão "Desativar MFA" quando MFA está ativo', async () => {
    setupFetch(200, defaultActiveStatus);
    render(<MfaSetup />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /desativar mfa/i })
      ).toBeInTheDocument();
    });
  });

  // ── input de 6 dígitos ───────────────────────────────────────────────────

  it('input de código aceita apenas 6 dígitos numéricos', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => defaultAdminStatus })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          secret: 'JBSWY3DPEHPK3PXP',
          qrDataUrl: 'data:image/png;base64,abc',
          otpauthUrl: 'otpauth://totp/Test:admin@test.com?secret=JBSWY3DPEHPK3PXP',
          recoveryCodes: ['aabbccddeeff0011', 'aabbccddeeff0022'],
        }),
      });

    const user = userEvent.setup();
    render(<MfaSetup />);

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: /ativar autenticação em dois fatores/i })
      ).toBeInTheDocument()
    );

    await user.click(
      screen.getByRole('button', { name: /ativar autenticação em dois fatores/i })
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/código de verificação/i)).toBeInTheDocument();
    });

    const input = screen.getByLabelText(/código de verificação/i);

    // Digita letras — devem ser filtradas
    await user.type(input, 'abc');
    expect(input).toHaveValue('');

    // Digita 6 dígitos
    await user.type(input, '123456');
    expect(input).toHaveValue('123456');

    // Digita mais — deve ser cortado em 6
    await user.type(input, '7890');
    expect(input).toHaveValue('123456');
  });

  // ── fluxo completo: activate → verify → recovery codes ─────────────────────

  it('fluxo completo: activate → verify → mostra recovery codes', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => defaultAdminStatus })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          secret: 'JBSWY3DPEHPK3PXP',
          qrDataUrl: 'data:image/png;base64,abc',
          otpauthUrl: 'otpauth://totp/Test:admin@test.com?secret=JBSWY3DPEHPK3PXP',
          recoveryCodes: ['aabbccddeeff0011', 'aabbccddeeff0022'],
        }),
      })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true, enabled: true }) });

    const user = userEvent.setup();
    render(<MfaSetup />);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /ativar autenticação em dois fatores/i })
      ).toBeInTheDocument()
    );

    await user.click(
      screen.getByRole('button', { name: /ativar autenticação em dois fatores/i })
    );

    await waitFor(() => {
      expect(screen.getByAltText(/qr code/i)).toBeInTheDocument();
    });

    const input = screen.getByLabelText(/código de verificação/i);
    await user.type(input, '123456');
    await user.click(screen.getByRole('button', { name: /verificar e ativar/i }));

    await waitFor(() => {
      expect(screen.getByText('aabbccddeeff0011')).toBeInTheDocument();
      expect(screen.getByText('aabbccddeeff0022')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /baixar códigos de recuperação/i })
      ).toBeInTheDocument();
    });
  });

  // ── erro na verificação ──────────────────────────────────────────────────

  it('mostra erro quando o código de verificação é inválido', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => defaultAdminStatus })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          secret: 'JBSWY3DPEHPK3PXP',
          qrDataUrl: 'data:image/png;base64,abc',
          otpauthUrl: 'otpauth://totp/Test:admin@test.com?secret=JBSWY3DPEHPK3PXP',
          recoveryCodes: ['aabbccddeeff0011'],
        }),
      })
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: 'Código inválido' }) });

    const user = userEvent.setup();
    render(<MfaSetup />);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /ativar autenticação em dois fatores/i })
      ).toBeInTheDocument()
    );

    await user.click(
      screen.getByRole('button', { name: /ativar autenticação em dois fatores/i })
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/código de verificação/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/código de verificação/i), '000000');
    await user.click(screen.getByRole('button', { name: /verificar e ativar/i }));

    await waitFor(() => {
      expect(screen.getByText(/código inválido/i)).toBeInTheDocument();
    });
  });

  // ── disable ─────────────────────────────────────────────────────────────

  it('pede confirmação de senha antes de desativar', async () => {
    setupFetch(200, defaultActiveStatus);

    const user = userEvent.setup();
    render(<MfaSetup />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /desativar mfa/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /desativar mfa/i }));

    await waitFor(() => {
      expect(screen.getByText(/tem certeza\?/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirme com sua senha/i)).toBeInTheDocument();
    });
  });

  it('chama endpoint disable com senha correta', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => defaultActiveStatus })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true, disabled: true }) });

    const user = userEvent.setup();
    render(<MfaSetup />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /desativar mfa/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /desativar mfa/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/confirme com sua senha/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/confirme com sua senha/i), 'minhasenha123');

    const form = screen.getByLabelText(/confirme com sua senha/i).closest('form') as HTMLFormElement;
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/operator/auth/mfa/disable',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ password: 'minhasenha123' }),
        })
      );
    });
  });

  // ── initialStatus prop ───────────────────────────────────────────────────

  it('não faz fetch quando initialStatus é fornecido', async () => {
    render(<MfaSetup initialStatus={{ mfaEnabled: false, role: 'ADMIN' }} />);

    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
      expect(screen.getByText('MFA não ativado')).toBeInTheDocument();
    });
  });
});
