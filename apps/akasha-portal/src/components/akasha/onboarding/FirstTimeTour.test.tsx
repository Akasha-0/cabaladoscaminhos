/**
 * @akasha/portal — FirstTimeTour component tests
 *
 * Wave 13.1 First-time user onboarding. Covers:
 *   - Renders all 3 steps (title/body/dots).
 *   - Dots reflect the current step (aria-selected).
 *   - Tapping a dot jumps to that step (no completion fired).
 *   - Tapping the primary CTA advances; on the last step it calls onComplete.
 *   - Skip is shown only on step 1; tapping it calls onSkip (or onComplete).
 *   - The component is a dialog with the correct a11y wiring.
 *
 * The BreathOrb preview on step 2 is intentionally rendered (we trust
 * BreathOrb's own tests for animation behaviour) — we just assert its
 * presence here.
 *
 * Wave 18.5 additions:
 *   - `onStepChange` is called on every step change with the new step
 *     value (live steps 0|1|2), and with the completed sentinel (3)
 *     when the user finalises the tour.
 *   - A "skip-all" button (`first-time-tour-skip-all`) is rendered on
 *     EVERY step, not just step 1.
 *   - The skip-all button always calls `onComplete` (never `onSkip`)
 *     because semantically it's a "I've seen enough" dismissal, not a
 *     "I'm not ready" deferral.
 *   - Escape key skips from any step (not just step 1).
 *   - When mounted with `initialStep > 0`, the resume banner is shown.
 *   - When mounted with `initialStep > 0`, the title reflects the
 *     persisted step (resume mid-flight).
 */

import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { FirstTimeTour } from './FirstTimeTour';
import {
  ONBOARDING_COMPLETED_STEP,
  type OnboardingStep,
} from '@/lib/state/onboarding-state';

describe('FirstTimeTour — Wave 13.1 contract', () => {
  it('renders a dialog with role=dialog and aria-modal=true', () => {
    render(<FirstTimeTour onComplete={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('data-testid', 'first-time-tour');
  });

  it('starts on step 1 (data-step=0) and shows the step-1 skip link', () => {
    render(<FirstTimeTour onComplete={() => {}} />);
    const tour = screen.getByTestId('first-time-tour');
    expect(tour).toHaveAttribute('data-step', '0');
    expect(screen.getByTestId('first-time-tour-skip')).toBeInTheDocument();
  });

  it('renders the 3 dot indicators with the first one selected', () => {
    render(<FirstTimeTour onComplete={() => {}} />);
    for (let i = 0; i < 3; i++) {
      const dot = screen.getByTestId(`first-time-tour-dot-${i}`);
      expect(dot).toHaveAttribute('role', 'tab');
    }
    expect(screen.getByTestId('first-time-tour-dot-0')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByTestId('first-time-tour-dot-1')).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByTestId('first-time-tour-dot-2')).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('shows the step 1 title + body on first paint', () => {
    render(<FirstTimeTour onComplete={() => {}} />);
    // Title is associated via aria-labelledby
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'first-time-tour-title');
    expect(screen.getByText('Bem-vindo ao Akasha')).toBeInTheDocument();
  });

  it('tapping the primary CTA advances to step 2 (no completion)', () => {
    const onComplete = vi.fn();
    render(<FirstTimeTour onComplete={onComplete} />);
    fireEvent.click(screen.getByTestId('first-time-tour-advance'));
    expect(screen.getByTestId('first-time-tour')).toHaveAttribute(
      'data-step',
      '1'
    );
    expect(screen.getByText('Respire comigo')).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('renders the BreathOrb preview on step 2', () => {
    render(<FirstTimeTour onComplete={() => {}} initialStep={1} />);
    expect(
      screen.getByTestId('first-time-tour-breath-preview')
    ).toBeInTheDocument();
    expect(screen.getByTestId('breath-orb')).toBeInTheDocument();
  });

  it('renders the Mentor CTA preview on step 3', () => {
    render(<FirstTimeTour onComplete={() => {}} initialStep={2} />);
    expect(
      screen.getByTestId('first-time-tour-mentor-cta')
    ).toBeInTheDocument();
    expect(screen.getByText('/mentor')).toBeInTheDocument();
  });

  it('does NOT show the step-1-only skip link on step 2 or 3 (Wave 13.1)', () => {
    const { rerender } = render(
      <FirstTimeTour onComplete={() => {}} initialStep={1} />
    );
    expect(screen.queryByTestId('first-time-tour-skip')).toBeNull();
    rerender(<FirstTimeTour onComplete={() => {}} initialStep={2} />);
    expect(screen.queryByTestId('first-time-tour-skip')).toBeNull();
  });

  it('tapping a non-current dot jumps directly to that step', () => {
    render(<FirstTimeTour onComplete={() => {}} />);
    fireEvent.click(screen.getByTestId('first-time-tour-dot-2'));
    expect(screen.getByTestId('first-time-tour')).toHaveAttribute(
      'data-step',
      '2'
    );
    expect(screen.getByTestId('first-time-tour-dot-2')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByTestId('first-time-tour-dot-0')).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('tapping the primary CTA on the last step calls onComplete', () => {
    const onComplete = vi.fn();
    render(<FirstTimeTour onComplete={onComplete} initialStep={2} />);
    fireEvent.click(screen.getByTestId('first-time-tour-advance'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('step 1 skip button calls onSkip when provided', () => {
    const onSkip = vi.fn();
    const onComplete = vi.fn();
    render(
      <FirstTimeTour onComplete={onComplete} onSkip={onSkip} initialStep={0} />
    );
    fireEvent.click(screen.getByTestId('first-time-tour-skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('step 1 skip button falls back to onComplete when onSkip is absent', () => {
    const onComplete = vi.fn();
    render(<FirstTimeTour onComplete={onComplete} initialStep={0} />);
    fireEvent.click(screen.getByTestId('first-time-tour-skip'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('Enter key advances; Escape finalises from any step (Wave 18.5)', () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();
    render(
      <FirstTimeTour onComplete={onComplete} onSkip={onSkip} initialStep={0} />
    );

    // Enter on step 1 → step 2
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByTestId('first-time-tour')).toHaveAttribute(
      'data-step',
      '1'
    );
    expect(onComplete).not.toHaveBeenCalled();

    // Wave 18.5 — Escape now skips from ANY step (not just step 1).
    // After Enter we're on step 2, so Escape should finalise via onComplete.
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Re-mount on step 1 and verify the step-1 "Pular por agora" button
    // (not Escape) is what fires onSkip — Escape always goes through
    // handleSkipAll → onComplete in Wave 18.5.
    onComplete.mockClear();
    render(
      <FirstTimeTour onComplete={onComplete} onSkip={onSkip} initialStep={0} />
    );
    fireEvent.click(screen.getByTestId('first-time-tour-skip'));
    expect(onSkip).toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe('FirstTimeTour — Wave 18.5 persistence + skip-all', () => {
  it('renders the skip-all button on step 1', () => {
    render(<FirstTimeTour onComplete={() => {}} initialStep={0} />);
    expect(
      screen.getByTestId('first-time-tour-skip-all')
    ).toBeInTheDocument();
    expect(screen.getByText('Pular tour')).toBeInTheDocument();
  });

  it('renders the skip-all button on step 2', () => {
    render(<FirstTimeTour onComplete={() => {}} initialStep={1} />);
    expect(
      screen.getByTestId('first-time-tour-skip-all')
    ).toBeInTheDocument();
  });

  it('renders the skip-all button on step 3', () => {
    render(<FirstTimeTour onComplete={() => {}} initialStep={2} />);
    expect(
      screen.getByTestId('first-time-tour-skip-all')
    ).toBeInTheDocument();
  });

  it('skip-all from step 1 calls onComplete (not onSkip)', () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();
    render(
      <FirstTimeTour
        onComplete={onComplete}
        onSkip={onSkip}
        initialStep={0}
      />
    );
    fireEvent.click(screen.getByTestId('first-time-tour-skip-all'));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onSkip).not.toHaveBeenCalled();
  });

  it('skip-all from step 2 calls onComplete (not onSkip)', () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();
    render(
      <FirstTimeTour
        onComplete={onComplete}
        onSkip={onSkip}
        initialStep={1}
      />
    );
    fireEvent.click(screen.getByTestId('first-time-tour-skip-all'));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onSkip).not.toHaveBeenCalled();
  });

  it('skip-all from step 3 calls onComplete (not onSkip)', () => {
    const onComplete = vi.fn();
    const onSkip = vi.fn();
    render(
      <FirstTimeTour
        onComplete={onComplete}
        onSkip={onSkip}
        initialStep={2}
      />
    );
    fireEvent.click(screen.getByTestId('first-time-tour-skip-all'));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onSkip).not.toHaveBeenCalled();
  });

  it('onStepChange fires with the new live step on every advance', () => {
    const onStepChange = vi.fn();
    render(
      <FirstTimeTour
        onComplete={() => {}}
        onStepChange={onStepChange}
        initialStep={0}
      />
    );

    fireEvent.click(screen.getByTestId('first-time-tour-advance'));
    expect(onStepChange).toHaveBeenLastCalledWith<[OnboardingStep]>(1);

    fireEvent.click(screen.getByTestId('first-time-tour-advance'));
    expect(onStepChange).toHaveBeenLastCalledWith<[OnboardingStep]>(2);

    expect(onStepChange).not.toHaveBeenCalledWith(ONBOARDING_COMPLETED_STEP);
  });

  it('onStepChange fires with the completed sentinel on the final advance', () => {
    const onStepChange = vi.fn();
    const onComplete = vi.fn();
    render(
      <FirstTimeTour
        onComplete={onComplete}
        onStepChange={onStepChange}
        initialStep={2}
      />
    );
    fireEvent.click(screen.getByTestId('first-time-tour-advance'));
    expect(onStepChange).toHaveBeenLastCalledWith(ONBOARDING_COMPLETED_STEP);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('onStepChange fires with the completed sentinel when the step-1 skip is taken', () => {
    const onStepChange = vi.fn();
    const onSkip = vi.fn();
    render(
      <FirstTimeTour
        onComplete={() => {}}
        onStepChange={onStepChange}
        onSkip={onSkip}
        initialStep={0}
      />
    );
    fireEvent.click(screen.getByTestId('first-time-tour-skip'));
    expect(onStepChange).toHaveBeenCalledWith(ONBOARDING_COMPLETED_STEP);
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('onStepChange fires with the completed sentinel when skip-all is tapped from any step', () => {
    const onStepChange = vi.fn();
    for (const step of [0, 1, 2] as const) {
      onStepChange.mockClear();
      const onComplete = vi.fn();
      const { unmount } = render(
        <FirstTimeTour
          onComplete={onComplete}
          onStepChange={onStepChange}
          initialStep={step}
        />
      );
      fireEvent.click(screen.getByTestId('first-time-tour-skip-all'));
      expect(onStepChange).toHaveBeenLastCalledWith(
        ONBOARDING_COMPLETED_STEP
      );
      expect(onComplete).toHaveBeenCalledTimes(1);
      unmount();
    }
  });

  it('onStepChange fires with the new step when a dot is tapped', () => {
    const onStepChange = vi.fn();
    render(
      <FirstTimeTour
        onComplete={() => {}}
        onStepChange={onStepChange}
        initialStep={0}
      />
    );
    fireEvent.click(screen.getByTestId('first-time-tour-dot-2'));
    expect(onStepChange).toHaveBeenLastCalledWith<[OnboardingStep]>(2);
  });

  it('does NOT call onStepChange on mount when initialStep is 0', () => {
    // Mount with default step — no user action yet, so no persistence
    // write should fire. We test this so consumers (e.g. useOnboarding)
    // don't see spurious refires on first render.
    const onStepChange = vi.fn();
    render(
      <FirstTimeTour
        onComplete={() => {}}
        onStepChange={onStepChange}
        initialStep={0}
      />
    );
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it('does NOT call onStepChange on mount when initialStep > 0 (resume)', () => {
    // Same as above for the resume case. The persisted value is read
    // by the host hook; the tour only writes on user interaction.
    const onStepChange = vi.fn();
    render(
      <FirstTimeTour
        onComplete={() => {}}
        onStepChange={onStepChange}
        initialStep={1}
      />
    );
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it('shows the resume banner when mounted with initialStep > 0', () => {
    render(<FirstTimeTour onComplete={() => {}} initialStep={1} />);
    expect(
      screen.getByTestId('first-time-tour-resume-banner')
    ).toBeInTheDocument();
    // Human-readable: "Continuando do passo 2 de 3" (initialStep is 0-indexed
    // internally; the banner displays 1-indexed).
    expect(
      screen.getByText(/Continuando do passo 2 de 3/)
    ).toBeInTheDocument();
  });

  it('shows the resume banner for step 2 resume', () => {
    render(<FirstTimeTour onComplete={() => {}} initialStep={2} />);
    expect(
      screen.getByText(/Continuando do passo 3 de 3/)
    ).toBeInTheDocument();
  });

  it('does NOT show the resume banner on a fresh tour (initialStep=0)', () => {
    render(<FirstTimeTour onComplete={() => {}} initialStep={0} />);
    expect(
      screen.queryByTestId('first-time-tour-resume-banner')
    ).toBeNull();
  });

  it('hides the resume banner after the first step change', async () => {
    render(<FirstTimeTour onComplete={() => {}} initialStep={1} />);
    expect(
      screen.getByTestId('first-time-tour-resume-banner')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('first-time-tour-advance'));
    // AnimatePresence keeps the banner in the DOM during the exit
    // animation (0.2s). Wait for it to fully unmount before asserting.
    await waitFor(() => {
      expect(
        screen.queryByTestId('first-time-tour-resume-banner')
      ).toBeNull();
    });
  });

  it('clamps out-of-range initialStep values to 0', () => {
    // Wave 18.5 — persisted step may be a stale or invalid value; the
    // tour must not crash. We render with a too-large value and assert
    // it lands on step 0.
    render(<FirstTimeTour onComplete={() => {}} initialStep={5 as 0} />);
    expect(screen.getByTestId('first-time-tour')).toHaveAttribute(
      'data-step',
      '0'
    );
  });

  it('the resume banner is a polite live region', () => {
    render(<FirstTimeTour onComplete={() => {}} initialStep={1} />);
    const banner = screen.getByTestId('first-time-tour-resume-banner');
    expect(banner).toHaveAttribute('role', 'status');
    expect(banner).toHaveAttribute('aria-live', 'polite');
  });

  it('renders step-2 copy when resuming at initialStep=1', () => {
    // The most important behavioural guarantee: resume actually skips
    // forward to the persisted step's content, not just the dot indicator.
    render(<FirstTimeTour onComplete={() => {}} initialStep={1} />);
    expect(screen.getByText('Respire comigo')).toBeInTheDocument();
    expect(
      screen.getByTestId('first-time-tour-breath-preview')
    ).toBeInTheDocument();
  });

  it('renders step-3 copy when resuming at initialStep=2', () => {
    render(<FirstTimeTour onComplete={() => {}} initialStep={2} />);
    expect(screen.getByText('Converse com o Mentor')).toBeInTheDocument();
    expect(
      screen.getByTestId('first-time-tour-mentor-cta')
    ).toBeInTheDocument();
  });
});