/**
 * @akasha/portal — ZeladorFirstTimeTour tests — Wave 26.2
 *
 * Verifies the 3-step tour contract:
 *   - Renders a dialog with role=dialog + aria-modal=true.
 *   - Shows the step-1 welcome ("Bem-vindo ao atendimento").
 *   - Renders the 4 estados emocionais + discovery card preview on step 2.
 *   - Renders the 👍/👎 thumbs preview on step 3.
 *   - 3 dot indicators with the first one selected on mount.
 *   - Primary CTA advances; on the last step it calls onComplete.
 *   - Skip-all is shown on every step and always calls onComplete.
 *   - Enter advances; Escape skips from any step.
 *   - LocalStorage helpers (isZeladorOnboardingCompleted / setZeladorOnboardingStep
 *     / resetZeladorOnboarding) work as advertised and use the distinct
 *     `akasha.zelador.onboarding.*` namespace.
 *   - Resume banner appears when mounted with initialStep > 0.
 *   - Copy is injectable so EN locale works without code changes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  ZeladorFirstTimeTour,
  DEFAULT_COPY_PT_BR,
  ZELADOR_ONBOARDING_STORAGE_KEY,
  ZELADOR_ONBOARDING_STEP_KEY,
  ZELADOR_ONBOARDING_COMPLETED_STEP,
  isZeladorOnboardingCompleted,
  setZeladorOnboardingStep,
  resetZeladorOnboarding,
} from '../ZeladorFirstTimeTour';

describe('ZeladorFirstTimeTour — Wave 26.2 dialog contract', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders a dialog with role=dialog and aria-modal=true', () => {
    render(<ZeladorFirstTimeTour onComplete={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('data-testid', 'zelador-first-time-tour');
  });

  it('starts on step 0 and shows the step-1 welcome title', () => {
    render(<ZeladorFirstTimeTour onComplete={() => {}} />);
    const tour = screen.getByTestId('zelador-first-time-tour');
    expect(tour).toHaveAttribute('data-step', '0');
    expect(screen.getByText('Bem-vindo ao atendimento')).toBeInTheDocument();
  });

  it('renders 3 dot indicators with the first one selected', () => {
    render(<ZeladorFirstTimeTour onComplete={() => {}} />);
    for (let i = 0; i < 3; i++) {
      expect(screen.getByTestId(`zelador-tour-dot-${i}`)).toHaveAttribute('role', 'tab');
    }
    expect(screen.getByTestId('zelador-tour-dot-0')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByTestId('zelador-tour-dot-1')).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByTestId('zelador-tour-dot-2')).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('shows the step-2 estados + discovery card preview when initialStep=1', () => {
    render(<ZeladorFirstTimeTour onComplete={() => {}} initialStep={1} />);
    expect(screen.getByTestId('zelador-tour-states-preview')).toBeInTheDocument();
    expect(screen.getByText('Curioso')).toBeInTheDocument();
    expect(screen.getByText('Ansioso')).toBeInTheDocument();
    expect(screen.getByText('Perdido')).toBeInTheDocument();
    expect(screen.getByText('Centrado')).toBeInTheDocument();
    expect(screen.getByTestId('zelador-tour-discovery-preview')).toBeInTheDocument();
  });

  it('shows the thumbs preview when initialStep=2', () => {
    render(<ZeladorFirstTimeTour onComplete={() => {}} initialStep={2} />);
    expect(screen.getByTestId('zelador-tour-thumbs-preview')).toBeInTheDocument();
  });

  it('advances through dots and calls onComplete on the last step', () => {
    const onComplete = vi.fn();
    render(<ZeladorFirstTimeTour onComplete={onComplete} />);
    fireEvent.click(screen.getByTestId('zelador-tour-advance'));
    expect(screen.getByTestId('zelador-first-time-tour')).toHaveAttribute(
      'data-step',
      '1'
    );
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('zelador-tour-advance'));
    expect(screen.getByTestId('zelador-first-time-tour')).toHaveAttribute(
      'data-step',
      '2'
    );
    fireEvent.click(screen.getByTestId('zelador-tour-advance'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('skip-all is rendered on every step and always fires onComplete', () => {
    const onComplete = vi.fn();
    const { rerender } = render(<ZeladorFirstTimeTour onComplete={onComplete} />);
    expect(screen.getByTestId('zelador-tour-skip-all')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('zelador-tour-skip-all'));
    expect(onComplete).toHaveBeenCalledTimes(1);

    rerender(<ZeladorFirstTimeTour onComplete={onComplete} initialStep={2} />);
    expect(screen.getByTestId('zelador-tour-skip-all')).toBeInTheDocument();
  });

  it('Enter advances; Escape skips from any step', () => {
    const onComplete = vi.fn();
    render(<ZeladorFirstTimeTour onComplete={onComplete} />);
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByTestId('zelador-first-time-tour')).toHaveAttribute(
      'data-step',
      '1'
    );
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders the resume banner when mounted with initialStep > 0', () => {
    render(<ZeladorFirstTimeTour onComplete={() => {}} initialStep={2} />);
    expect(screen.getByTestId('zelador-tour-resume-banner')).toBeInTheDocument();
  });

  it('accepts injected EN copy without touching the component', () => {
    const enCopy = {
      ...DEFAULT_COPY_PT_BR,
      step1Title: 'Welcome to the care space',
      step1Body: 'You walk with the client.',
    };
    render(<ZeladorFirstTimeTour onComplete={() => {}} copy={enCopy} />);
    expect(screen.getByText('Welcome to the care space')).toBeInTheDocument();
    expect(screen.getByText('You walk with the client.')).toBeInTheDocument();
  });

  it('fires onStepChange with the sentinel on completion', () => {
    const onStepChange = vi.fn();
    render(
      <ZeladorFirstTimeTour
        onComplete={() => {}}
        onStepChange={onStepChange}
        initialStep={2}
      />
    );
    fireEvent.click(screen.getByTestId('zelador-tour-advance'));
    expect(onStepChange).toHaveBeenCalledWith(ZELADOR_ONBOARDING_COMPLETED_STEP);
  });
});

describe('ZeladorFirstTimeTour — localStorage contract', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('uses the distinct akasha.zelador.onboarding.* namespace', () => {
    setZeladorOnboardingStep(1);
    expect(window.localStorage.getItem(ZELADOR_ONBOARDING_STEP_KEY)).toBe('1');
    expect(window.localStorage.getItem(ZELADOR_ONBOARDING_STORAGE_KEY)).toBeNull();
    expect(isZeladorOnboardingCompleted()).toBe(false);
  });

  it('marks completion by setting the boolean flag AND step=3', () => {
    setZeladorOnboardingStep(ZELADOR_ONBOARDING_COMPLETED_STEP);
    expect(window.localStorage.getItem(ZELADOR_ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(window.localStorage.getItem(ZELADOR_ONBOARDING_STEP_KEY)).toBe('3');
    expect(isZeladorOnboardingCompleted()).toBe(true);
  });

  it('resetZeladorOnboarding clears both keys', () => {
    setZeladorOnboardingStep(ZELADOR_ONBOARDING_COMPLETED_STEP);
    resetZeladorOnboarding();
    expect(window.localStorage.getItem(ZELADOR_ONBOARDING_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(ZELADOR_ONBOARDING_STEP_KEY)).toBeNull();
    expect(isZeladorOnboardingCompleted()).toBe(false);
  });

  it('does NOT touch the Wave 13.1 end-user onboarding key', () => {
    // Distinct namespace guard — a Zelador who is also a new end-user
    // should be able to complete both tours independently.
    window.localStorage.setItem('akasha.onboarding.completed', 'true');
    setZeladorOnboardingStep(1);
    expect(window.localStorage.getItem('akasha.onboarding.completed')).toBe('true');
    expect(window.localStorage.getItem(ZELADOR_ONBOARDING_STEP_KEY)).toBe('1');
    expect(isZeladorOnboardingCompleted()).toBe(false);
  });
});
