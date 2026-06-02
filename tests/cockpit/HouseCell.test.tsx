// tests/cockpit/HouseCell.test.tsx
// Tests for HouseCell component

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { HouseCell } from '@/components/cockpit/HouseCell';
import type { HouseDefinition } from '@/lib/divination/house-types';
import type { FilledHouse } from '@/stores/cockpit-store';

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

    // Should show house number
    expect(screen.getByText('01')).toBeInTheDocument();
    
    // Should show house original name
    expect(screen.getByText('O Cavaleiro')).toBeInTheDocument();
    
    // Should show plus icon (empty state indicator)
    const plusIcon = document.querySelector('[class*="lucide"]');
    expect(plusIcon).toBeInTheDocument();
  });

  it('renders filled state correctly', () => {
    const filledData: FilledHouse = {
      casaNumero: 1,
      carta: { numero: 4, nome: 'A Casa', significado: 'Família' },
      odu: { numero: 1, nome: 'Okaran', significado: 'O começo', elementos: 'Terra / Fogo', orixas: ['Exu', 'Omolu'], quizilas: [], preceitos: '', ebo: '' },
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

    // Should show carta number and name
    expect(screen.getByText('04. A Casa')).toBeInTheDocument();
    
    // Should show odu badge
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

    // Check for ring class (active state indicator)
    const cell = container.firstChild as HTMLElement;
    expect(cell.className).toContain('ring-2');
    expect(cell.className).toContain('ring-orange-500');
  });
});