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
 */

import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { FirstTimeTour } from './FirstTimeTour';

describe('FirstTimeTour', () => {
  it('renders a dialog with role=dialog and aria-modal=true', () => {
    render(<FirstTimeTour onComplete={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('data-testid', 'first-time-tour');
  });

  it('starts on step 1 (data-step=0) and shows the skip link', () => {
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

  it('does NOT show the skip link on step 2 or 3', () => {
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

  it('Enter key advances; Escape on step 1 skips', () => {
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

    // Escape on step 1 (after resetting) → onSkip
    fireEvent.keyDown(window, { key: 'Escape' });
    // We are now on step 2, so Escape is a no-op (per spec, only step 1).
    expect(onSkip).not.toHaveBeenCalled();

    // Jump back to step 1 and try Escape
    fireEvent.click(screen.getByTestId('first-time-tour-dot-0'));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});