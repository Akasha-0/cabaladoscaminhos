/**
 * ResetPasswordForm — Wave 11
 * ----------------------------------------------------------------------------
 * Testa:
 *  - Validação client-side (email vazio / inválido)
 *  - Estado de sucesso após POST
 *  - Mensagem de erro quando 4xx
 *  - Anti-enumeração: estado de sucesso mesmo em 5xx silencioso
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockFetch = vi.fn();

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

global.fetch = mockFetch;

import { ResetPasswordForm } from '../ResetPasswordForm';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ResetPasswordForm', () => {
  it('renderiza título e input de email', () => {
    render(<ResetPasswordForm />);
    expect(screen.getByRole('heading', { name: /recuperar senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('mostra erro quando email é vazio', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await user.click(screen.getByRole('button', { name: /enviar link/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/email/i);
    });
  });

  it('mostra erro quando email é inválido', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /enviar link/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/inválido/i);
    });
  });

  it('mostra estado de sucesso após POST bem-sucedido', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /enviar link/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /email enviado/i })).toBeInTheDocument();
    });
  });

  it('mostra erro 4xx retornado pelo backend', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Email não cadastrado' }),
    });
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /enviar link/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/não cadastrado/i);
    });
  });

  it('mascarra erro 5xx mostrando estado de sucesso (anti-enumeração)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'internal' }),
    });
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /enviar link/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /email enviado/i })).toBeInTheDocument();
    });
  });
});
