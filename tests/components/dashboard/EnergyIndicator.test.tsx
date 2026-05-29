import { render, screen } from '@testing-library/react';
import { EnergyIndicator } from '@/components/dashboard/EnergyIndicator';

describe('EnergyIndicator', () => {
  it('renders current day orixá', () => {
    render(<EnergyIndicator />);
    expect(screen.getByText(/Dia de/)).toBeInTheDocument();
  });

  it('shows orixá symbol', () => {
    render(<EnergyIndicator />);
    // Should show one of the orixá symbols
    const symbols = ['🔥', '🌊', '⚡', '✧', '🏹', '💧'];
    const symbol = screen.getByText((content) => symbols.some(s => content.includes(s)));
    expect(symbol).toBeInTheDocument();
  });

  it('is hidden on mobile (sm breakpoint)', () => {
    render(<EnergyIndicator />);
    // The indicator wrapper has hidden sm:flex classes
    const indicator = screen.getByText(/Dia de/).parentElement;
    expect(indicator).toHaveClass('hidden', 'sm:flex');
  });

  it('displays orixá name', () => {
    render(<EnergyIndicator />);
    const day = new Date().getDay();
    const orixas = ['Xangô', 'Iemanjá', 'Iansã', 'Xangô', 'Oxóssi', 'Oxalá', 'Oxum'];
    expect(screen.getByText(new RegExp(orixas[day]))).toBeInTheDocument();
  });

  it('applies styling with custom colors', () => {
    render(<EnergyIndicator />);
    const indicator = screen.getByText(/Dia de/).parentElement;
    expect(indicator).toBeInTheDocument();
    expect(indicator?.style.backgroundColor).toBeTruthy();
    expect(indicator?.style.color).toBeTruthy();
  });
});
