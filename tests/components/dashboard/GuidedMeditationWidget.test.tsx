import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuidedMeditationWidget } from '@/components/dashboard/GuidedMeditationWidget';

// Mock audio context for bell sound
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    createOscillator: () => ({
      connect: vi.fn(),
      frequency: { value: 528 },
      type: 'sine',
      start: vi.fn(),
      stop: vi.fn(),
    }),
    createGain: () => ({
      connect: vi.fn(),
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    }),
    currentTime: 0,
  })),
});

describe('GuidedMeditationWidget', () => {
  it('renders without crashing', () => {
    render(<GuidedMeditationWidget />);
    expect(screen.getByText('Meditação Guiada')).toBeTruthy();
  });

  it('displays timer tab by default', () => {
    render(<GuidedMeditationWidget />);
    expect(screen.getByText('Timer')).toBeTruthy();
  });

  it('shows timer preset options', () => {
    render(<GuidedMeditationWidget />);
    expect(screen.getByText('5 min')).toBeTruthy();
    expect(screen.getByText('10 min')).toBeTruthy();
    expect(screen.getByText('15 min')).toBeTruthy();
    expect(screen.getByText('20 min')).toBeTruthy();
  });

  it('shows start button', () => {
    render(<GuidedMeditationWidget />);
    expect(screen.getByText('Iniciar')).toBeTruthy();
  });

  it('switches to guided tab', () => {
    render(<GuidedMeditationWidget />);
    const guidedTab = screen.getByText('Guiado');
    fireEvent.click(guidedTab);
    expect(screen.getByText('Chakras')).toBeTruthy();
  });

  it('switches to breathing tab', () => {
    render(<GuidedMeditationWidget />);
    const breathingTab = screen.getByText('Respiração');
    fireEvent.click(breathingTab);
    expect(screen.getByText('Respiração 4-7-8')).toBeTruthy();
  });

  it('switches to affirmation tab', () => {
    render(<GuidedMeditationWidget />);
    const affirmationTab = screen.getByText('Afirmação');
    fireEvent.click(affirmationTab);
    expect(screen.getByText('Afirmação do dia')).toBeTruthy();
  });

  it('accepts userOrixa prop', () => {
    render(<GuidedMeditationWidget userOrixa="Oxum" />);
    const guidedTab = screen.getByText('Guiado');
    fireEvent.click(guidedTab);
    expect(screen.getByText('Meditações de Oxum')).toBeTruthy();
  });

  it('starts timer on play', () => {
    vi.useFakeTimers();
    render(<GuidedMeditationWidget />);
    const startButton = screen.getByText('Iniciar');
    fireEvent.click(startButton);
    // Timer should start (will show pause button)
    expect(screen.getByText('Pausar')).toBeTruthy();
    vi.useRealTimers();
  });
});