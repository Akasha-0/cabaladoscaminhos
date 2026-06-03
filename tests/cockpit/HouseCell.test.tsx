// tests/cockpit/HouseCell.test.tsx
// Tests for HouseCell component
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HouseCell } from '@/components/cockpit/HouseCell';
import type { HouseDefinition } from '@/lib/divination/house-types';
import type { FilledHouse } from '@/stores/cockpit-store';

beforeEach(cleanup);

const mockHouse: HouseDefinition = {
  number: 1,
  cartaCigana: 'O Cavaleiro',
  keyword: 'ação',
  bloco: 'A',
  tema: 'A Ação, A Força, A Iniciativa',
  significado: 'O cavaleiro representa movimento, velocidade e ação imediata.',
  astrologia: ['marte_natal'],
  numerologia: [],
  corPrimaria: '#dc2626',
  corSecundaria: '#991b1c',
  icone: 'Zap',
};

describe('HouseCell', () => {
  it('renders empty state correctly', () => {
    render(
      <HouseCell
        house={mockHouse}
        filledData={undefined}
        isActive={false}
        onClick={() => {}}
        onClear={() => {}}
      />
    );

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('O Cavaleiro')).toBeInTheDocument();
    // Plus icon renders as SVG with lucide class
    const plusIcon = document.querySelector('[class*="lucide"]');
    expect(plusIcon).toBeInTheDocument();
  });

  it('renders filled state correctly', () => {
    const filledData: FilledHouse = {
      casaNumero: 1,
      carta: { numero: 4, nome: 'A Casa', significado: 'Família' },
      odu: {
        numero: 1,
        nome: 'Okaran',
        significado: 'O começo',
        elementos: 'Terra / Fogo',
        orixas: ['Exu', 'Omolu'],
        quizilas: [],
        preceitos: '',
        ebo: '',
      },
    };

    render(
      <HouseCell
        house={mockHouse}
        filledData={filledData}
        isActive={false}
        onClick={() => {}}
        onClear={() => {}}
      />
    );

    expect(screen.getByText('04. A Casa')).toBeInTheDocument();
    expect(screen.getByText(/Odu 1 - Okaran/)).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();

    render(
      <HouseCell
        house={mockHouse}
        filledData={undefined}
        isActive={false}
        onClick={handleClick}
        onClear={() => {}}
      />
    );

    fireEvent.click(screen.getByText('01'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows active state styling', () => {
    const { container } = render(
      <HouseCell
        house={mockHouse}
        filledData={undefined}
        isActive={true}
        onClick={() => {}}
        onClear={() => {}}
      />
    );

    const cell = container.firstChild as HTMLElement;
    expect(cell.className).toContain('ring-2');
    // Active state uses ring-primary per Doc 13 §4.1
    expect(cell.className).toContain('ring-primary');
  });

  // T7.1 a11y: hover-transform gated on motion-safe (prefers-reduced-motion)
  it('gates hover translate on motion-safe (a11y)', () => {
    const { container: emptyContainer } = render(
      <HouseCell
        house={mockHouse}
        filledData={undefined}
        isActive={false}
        onClick={() => {}}
        onClear={() => {}}
      />
    );
    const emptyCell = emptyContainer.firstChild as HTMLElement;
    expect(emptyCell.className).toContain('motion-safe:hover:-translate-y-1');

    const filledData: FilledHouse = {
      casaNumero: 1,
      carta: { numero: 4, nome: 'A Casa', significado: 'Família' },
      odu: {
        numero: 1,
        nome: 'Okaran',
        significado: 'O começo',
        elementos: 'Terra / Fogo',
        orixas: ['Exu', 'Omolu'],
        quizilas: [],
        preceitos: '',
        ebo: '',
      },
    };
    const { container: filledContainer } = render(
      <HouseCell
        house={mockHouse}
        filledData={filledData}
        isActive={false}
        onClick={() => {}}
        onClear={() => {}}
      />
    );
    const filledCell = filledContainer.firstChild as HTMLElement;
    expect(filledCell.className).toContain('motion-safe:hover:-translate-y-1');
  });
});
