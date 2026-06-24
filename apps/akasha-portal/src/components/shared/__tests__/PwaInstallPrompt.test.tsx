/**
 * @akasha/portal — PwaInstallPrompt tests
 *
 * Wave 9.4 + Wave 10.5 polish. We mock the `beforeinstallprompt` event
 * and verify:
 *   1. The component renders nothing during the 30s minimum delay (Wave 10.5).
 *   2. The component renders nothing by default (no install prompt).
 *   3. After the event fires AND the delay elapses, the prompt becomes visible.
 *   4. Clicking "Instalar agora" calls deferredPrompt.prompt().
 *   5. Clicking "Agora não" persists a dismissal to localStorage.
 *   6. The component re-hides after dismissal.
 *   7. Wave 10.5 copy: title = "Instale para acesso rápido", subtitle =
 *      "Abre em 1 toque, funciona sem internet.", button = "Instalar agora".
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { PwaInstallPrompt, useInstallPrompt, PWA_INSTALL_MIN_DELAY_MS } from '../PwaInstallPrompt';

interface FakePromptEvent {
  prompt: ReturnType<typeof vi.fn>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  platforms: string[];
}

function fireBeforeInstallPrompt(): FakePromptEvent {
  const prompt = vi.fn().mockResolvedValue(undefined);
  const userChoice = Promise.resolve({ outcome: 'accepted' as const, platform: 'web' });
  // Minimal stand-in for the global `BeforeInstallPromptEvent`. Our component
  // only reads `.prompt()`, `.userChoice`, and `.platforms` — all defined
  // below — so we don't need to import the DOM lib type.
  const event = new Event('beforeinstallprompt') as unknown as Event & {
    prompt: ReturnType<typeof vi.fn>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    platforms: string[];
  };
  Object.defineProperty(event, 'prompt', { value: prompt });
  Object.defineProperty(event, 'userChoice', { value: userChoice });
  Object.defineProperty(event, 'platforms', { value: ['web'] });
  act(() => {
    window.dispatchEvent(event);
  });
  return { prompt, userChoice, platforms: event.platforms };
}

describe('PwaInstallPrompt', () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Ensure matchMedia returns false (not installed).
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    // Wave 10.5: the component waits PWA_INSTALL_MIN_DELAY_MS before
    // showing. We use fake timers so tests don't actually wait 30s.
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Helper: advance past the 30s delay and flush microtasks. */
  async function flushInstallDelay() {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PWA_INSTALL_MIN_DELAY_MS);
    });
  }

  it('renders nothing initially (no install event yet)', () => {
    render(<PwaInstallPrompt />);
    expect(screen.queryByTestId('pwa-install-prompt')).toBeNull();
  });

  it('does NOT render before the 30s delay elapses (Wave 10.5 timing)', async () => {
    render(<PwaInstallPrompt />);
    fireBeforeInstallPrompt();
    // Even with the prompt event fired, we should NOT render until 30s pass.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PWA_INSTALL_MIN_DELAY_MS - 1000);
    });
    expect(screen.queryByTestId('pwa-install-prompt')).toBeNull();
  });

  it('becomes visible after beforeinstallprompt fires AND delay elapses', async () => {
    render(<PwaInstallPrompt />);
    fireBeforeInstallPrompt();
    await flushInstallDelay();
    await waitFor(() => {
      expect(screen.getByTestId('pwa-install-prompt')).toBeInTheDocument();
    });
  });

  it('renders the Wave 10.5 copy (title + subtitle)', async () => {
    render(<PwaInstallPrompt />);
    fireBeforeInstallPrompt();
    await flushInstallDelay();
    await waitFor(() => {
      expect(screen.getByTestId('pwa-install-prompt')).toBeInTheDocument();
    });
    expect(screen.getByText('Instale para acesso rápido')).toBeInTheDocument();
    expect(screen.getByText('Abre em 1 toque, funciona sem internet.')).toBeInTheDocument();
  });

  it('has dialog role and aria labels', async () => {
    render(<PwaInstallPrompt />);
    fireBeforeInstallPrompt();
    await flushInstallDelay();
    await waitFor(() => {
      expect(screen.getByTestId('pwa-install-prompt')).toBeInTheDocument();
    });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'pwa-install-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'pwa-install-subtitle');
  });

  it('renders install + dismiss buttons after the event fires + delay elapses', async () => {
    render(<PwaInstallPrompt />);
    fireBeforeInstallPrompt();
    await flushInstallDelay();
    await waitFor(() => {
      expect(screen.getByTestId('pwa-install-prompt')).toBeInTheDocument();
    });
    expect(screen.getByTestId('pwa-install-button')).toBeInTheDocument();
    expect(screen.getByTestId('pwa-install-decline')).toBeInTheDocument();
    expect(screen.getByTestId('pwa-install-dismiss')).toBeInTheDocument();
  });

  it('clicking "Instalar agora" calls deferredPrompt.prompt()', async () => {
    render(<PwaInstallPrompt />);
    const { prompt } = fireBeforeInstallPrompt();
    await flushInstallDelay();
    await waitFor(() => {
      expect(screen.getByTestId('pwa-install-prompt')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('pwa-install-button'));
    await waitFor(() => {
      expect(prompt).toHaveBeenCalledTimes(1);
    });
  });

  it('clicking "Agora não" persists dismissal in localStorage', async () => {
    render(<PwaInstallPrompt />);
    fireBeforeInstallPrompt();
    await flushInstallDelay();
    await waitFor(() => {
      expect(screen.getByTestId('pwa-install-prompt')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('pwa-install-decline'));
    await waitFor(() => {
      expect(screen.queryByTestId('pwa-install-prompt')).toBeNull();
    });
    const stored = window.localStorage.getItem('akasha.pwa.install.dismissedAt');
    expect(stored).toBeTruthy();
    expect(Number.isFinite(Number(stored))).toBe(true);
  });

  it('clicking the X dismiss icon also persists dismissal', async () => {
    render(<PwaInstallPrompt />);
    fireBeforeInstallPrompt();
    await flushInstallDelay();
    await waitFor(() => {
      expect(screen.getByTestId('pwa-install-prompt')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('pwa-install-dismiss'));
    await waitFor(() => {
      expect(screen.queryByTestId('pwa-install-prompt')).toBeNull();
    });
    expect(window.localStorage.getItem('akasha.pwa.install.dismissedAt')).toBeTruthy();
  });

  it('does not render if already running standalone (installed)', async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    render(<PwaInstallPrompt />);
    fireBeforeInstallPrompt();
    await flushInstallDelay();
    expect(screen.queryByTestId('pwa-install-prompt')).toBeNull();
  });

  it('does not render when dismissal is within cooldown', async () => {
    window.localStorage.setItem(
      'akasha.pwa.install.dismissedAt',
      String(Date.now() - 1000)
    );
    render(<PwaInstallPrompt />);
    fireBeforeInstallPrompt();
    await flushInstallDelay();
    expect(screen.queryByTestId('pwa-install-prompt')).toBeNull();
  });

  it('renders again when dismissal is older than 7 days', async () => {
    const eightDays = 8 * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(
      'akasha.pwa.install.dismissedAt',
      String(Date.now() - eightDays)
    );
    render(<PwaInstallPrompt />);
    fireBeforeInstallPrompt();
    await waitFor(() => {
      expect(screen.getByTestId('pwa-install-prompt')).toBeInTheDocument();
    });
  });
});

describe('useInstallPrompt', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('starts in idle state then moves to available after event', async () => {
    const Probe = () => {
      const { state, hasDeferredPrompt } = useInstallPrompt();
      return (
        <div data-state={state} data-has-prompt={String(hasDeferredPrompt)} data-testid="probe">
          probe
        </div>
      );
    };
    render(<Probe />);
    fireBeforeInstallPrompt();
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-state', 'available');
      expect(screen.getByTestId('probe')).toHaveAttribute('data-has-prompt', 'true');
    });
  });

  it('marks installed after appinstalled event', async () => {
    const Probe = () => {
      const { state } = useInstallPrompt();
      return <div data-state={state} data-testid="probe">probe</div>;
    };
    render(<Probe />);
    fireBeforeInstallPrompt();
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-state', 'available');
    });
    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-state', 'installed');
    });
  });

  it('returns dismissed state when dismiss() is called', async () => {
    const Probe = () => {
      const { state, dismiss } = useInstallPrompt();
      return (
        <div data-state={state} data-testid="probe">
          <button onClick={dismiss} data-testid="probe-dismiss">
            dismiss
          </button>
        </div>
      );
    };
    render(<Probe />);
    fireBeforeInstallPrompt();
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-state', 'available');
    });
    fireEvent.click(screen.getByTestId('probe-dismiss'));
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveAttribute('data-state', 'dismissed');
    });
  });
});