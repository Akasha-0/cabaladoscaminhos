import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpiritWellnessWidget } from '@/components/dashboard/SpiritWellnessWidget';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    getStore: () => store,
    setStore: (s: Record<string, string>) => { store = s; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true });

describe('SpiritWellnessWidget', () => {
  beforeEach(() => {
    mockLocalStorage.setStore({});
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => render(<SpiritWellnessWidget />)).not.toThrow();
  });

  it('displays the widget title', () => {
    render(<SpiritWellnessWidget />);
    expect(screen.getByText('Bienestar Espiritual')).toBeTruthy();
  });

  it('displays all five dimensions', () => {
    render(<SpiritWellnessWidget />);
    expect(screen.getByText('Física')).toBeTruthy();
    expect(screen.getByText('Emocional')).toBeTruthy();
    expect(screen.getByText('Mental')).toBeTruthy();
    expect(screen.getByText('Espiritual')).toBeTruthy();
    expect(screen.getByText('Energética')).toBeTruthy();
  });

  it('shows overall score', () => {
    render(<SpiritWellnessWidget />);
    expect(screen.getByText('Pontuação Geral')).toBeTruthy();
  });

  it('has a check-in button', () => {
    render(<SpiritWellnessWidget />);
    expect(screen.getByText('Registrar Check-in de Hoje')).toBeTruthy();
  });

  it('saves check-in to localStorage', async () => {
    render(<SpiritWellnessWidget />);
    
    const button = screen.getByText('Registrar Check-in de Hoje');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'cabala_wellness_data',
        expect.stringContaining('"history"')
      );
    });
  });
});