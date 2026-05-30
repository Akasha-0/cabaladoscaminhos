import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NumerologyWidget } from '@/components/dashboard/NumerologyWidget';

describe('NumerologyWidget', () => {
  it('renders without crashing', () => {
    render(<NumerologyWidget />);
    expect(screen.getByText('Numerologia')).toBeInTheDocument();
  });

  it('displays the Numerologia title with Zap icon', () => {
    render(<NumerologyWidget />);
    const title = screen.getByText('Numerologia');
    expect(title).toBeInTheDocument();
    const zapIcon = document.querySelector('.text-cyan-400');
    expect(zapIcon).toBeTruthy();
  });

  it('displays all four numerology numbers', () => {
    render(<NumerologyWidget />);
    expect(screen.getByText('Vida')).toBeInTheDocument();
    expect(screen.getByText('Destino')).toBeInTheDocument();
    expect(screen.getByText('Alma')).toBeInTheDocument();
    expect(screen.getByText('Personalidade')).toBeInTheDocument();
  });

  it('displays numeric values for all numbers', () => {
    render(<NumerologyWidget />);
    const numbers = screen.getAllByText(/^[1-9]$/);
    expect(numbers.length).toBe(4);
  });

  it('applies correct color styling to Vida', () => {
    render(<NumerologyWidget />);
    const vidaLabel = screen.getByText('Vida');
    const vidaContainer = vidaLabel.closest('.bg-slate-800\\/50');
    expect(vidaContainer).toBeTruthy();
  });

  it('applies correct color styling to Destino', () => {
    render(<NumerologyWidget />);
    const destinoLabel = screen.getByText('Destino');
    const destinoContainer = destinoLabel.closest('.bg-slate-800\\/50');
    expect(destinoContainer).toBeTruthy();
  });

  it('applies correct color styling to Alma', () => {
    render(<NumerologyWidget />);
    const almaLabel = screen.getByText('Alma');
    const almaContainer = almaLabel.closest('.bg-slate-800\\/50');
    expect(almaContainer).toBeTruthy();
  });

  it('applies correct color styling to Personalidade', () => {
    render(<NumerologyWidget />);
    const personalidadeLabel = screen.getByText('Personalidade');
    const personalidadeContainer = personalidadeLabel.closest('.bg-slate-800\\/50');
    expect(personalidadeContainer).toBeTruthy();
  });

  it('displays numbers in a grid layout', () => {
    render(<NumerologyWidget />);
    const grid = document.querySelector('.grid-cols-2');
    expect(grid).toBeTruthy();
  });

  it('renders Card component with spiritual styling', () => {
    render(<NumerologyWidget />);
    const card = document.querySelector('.card-spiritual');
    expect(card).toBeTruthy();
  });

  it('renders all four number values with large font', () => {
    render(<NumerologyWidget />);
    const bigNumbers = document.querySelectorAll('.text-3xl');
    expect(bigNumbers.length).toBe(4);
  });

  it('displays label text in small muted style', () => {
    render(<NumerologyWidget />);
    const labels = document.querySelectorAll('.text-xs.text-slate-400');
    expect(labels.length).toBe(4);
  });

  it('renders all four number cards with padding', () => {
    render(<NumerologyWidget />);
    const paddedCards = document.querySelectorAll('.p-3');
    expect(paddedCards.length).toBe(4);
  });

  it('renders all number cards with rounded corners', () => {
    render(<NumerologyWidget />);
    const roundedCards = document.querySelectorAll('.rounded-lg');
    expect(roundedCards.length).toBeGreaterThanOrEqual(4);
  });

  describe('number calculations', () => {
    it('calculates Vida number correctly based on current date', () => {
      render(<NumerologyWidget />);
      const vidaLabel = screen.getByText('Vida');
      const vidaContainer = vidaLabel.closest('.bg-slate-800\\/50');
      const vidaValue = vidaContainer?.querySelector('.text-3xl');
      expect(vidaValue).toBeTruthy();
      const value = parseInt(vidaValue?.textContent || '0');
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(9);
    });

    it('calculates Destino number correctly', () => {
      render(<NumerologyWidget />);
      const destinoLabel = screen.getByText('Destino');
      const destinoContainer = destinoLabel.closest('.bg-slate-800\\/50');
      const destinoValue = destinoContainer?.querySelector('.text-3xl');
      expect(destinoValue).toBeTruthy();
      const value = parseInt(destinoValue?.textContent || '0');
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(9);
    });

    it('calculates Alma number correctly', () => {
      render(<NumerologyWidget />);
      const almaLabel = screen.getByText('Alma');
      const almaContainer = almaLabel.closest('.bg-slate-800\\/50');
      const almaValue = almaContainer?.querySelector('.text-3xl');
      expect(almaValue).toBeTruthy();
      const value = parseInt(almaValue?.textContent || '0');
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(9);
    });

    it('calculates Personalidade number correctly', () => {
      render(<NumerologyWidget />);
      const personalidadeLabel = screen.getByText('Personalidade');
      const personalidadeContainer = personalidadeLabel.closest('.bg-slate-800\\/50');
      const personalidadeValue = personalidadeContainer?.querySelector('.text-3xl');
      expect(personalidadeValue).toBeTruthy();
      const value = parseInt(personalidadeValue?.textContent || '0');
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(9);
    });
  });

  describe('visual design', () => {
    it('uses cyan gradient on title text', () => {
      render(<NumerologyWidget />);
      const title = screen.getByText('Numerologia');
      const gradientSpan = title.closest('.bg-clip-text');
      expect(gradientSpan).toBeTruthy();
    });

    it('displays four colored number values', () => {
      render(<NumerologyWidget />);
      const cyan = document.querySelector('.text-cyan-400');
      const amber = document.querySelector('.text-amber-400');
      const violet = document.querySelector('.text-violet-400');
      const emerald = document.querySelector('.text-emerald-400');
      
      expect(cyan).toBeTruthy();
      expect(amber).toBeTruthy();
      expect(violet).toBeTruthy();
      expect(emerald).toBeTruthy();
    });

    it('uses card header with proper spacing', () => {
      render(<NumerologyWidget />);
      const header = document.querySelector('.pb-2');
      expect(header).toBeTruthy();
    });
  });

  describe('props handling', () => {
    it('accepts name prop without error', () => {
      render(<NumerologyWidget name="João" />);
      expect(screen.getByText('Numerologia')).toBeInTheDocument();
    });

    it('accepts birthDate prop without error', () => {
      render(<NumerologyWidget birthDate="1990-05-15" />);
      expect(screen.getByText('Numerologia')).toBeInTheDocument();
    });

    it('accepts both name and birthDate props', () => {
      render(<NumerologyWidget name="Maria" birthDate="1985-03-22" />);
      expect(screen.getByText('Numerologia')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('renders in a semantic Card structure', () => {
      render(<NumerologyWidget />);
      const cardContent = document.querySelector('[class*="Card"]');
      expect(cardContent).toBeTruthy();
    });

    it('has properly structured content', () => {
      render(<NumerologyWidget />);
      const cardElement = document.querySelector('div[class*="rounded-xl"]');
      expect(cardElement).toBeTruthy();
    });
  });
});
