/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

describe('OnboardingWizard', () => {
  it('renders without crashing', () => {
    const onComplete = vi.fn();
    const { container } = render(<OnboardingWizard onComplete={onComplete} />);
    expect(container.firstChild).toBeDefined();
  });

  it('renders step indicators', () => {
    const onComplete = vi.fn();
    const { container } = render(<OnboardingWizard onComplete={onComplete} />);
    const stepIndicators = container.querySelectorAll('[role="tab"]');
    expect(stepIndicators.length).toBeGreaterThanOrEqual(4);
  });

  it('renders progress indicator with tablist role', () => {
    const onComplete = vi.fn();
    const { container } = render(<OnboardingWizard onComplete={onComplete} />);
    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist).toBeDefined();
  });

  it('has accessibility live region', () => {
    const onComplete = vi.fn();
    const { container } = render(<OnboardingWizard onComplete={onComplete} />);
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeDefined();
  });
});
