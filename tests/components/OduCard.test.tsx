import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OduCard } from '@/components/dashboard/OduCard';

describe('OduCard', () => {
  const mockOdu = {
    nome: 'Ogbe',
    numero: 1,
    orixas: ['Obatalá', 'Oxum'],
    quizilas: ['Não mexa com fogo à noite', 'Evite说有谎话'],
    preceitos: 'Fale sempre a verdade e respeite os mais velhos',
    ebó: 'Faça uma oferenda de dendê e akará',
  };

  describe('renders odu information correctly', () => {
    it('displays the odu name', () => {
      render(<OduCard odu={mockOdu} />);
      expect(screen.getByText('Ogbe')).toBeInTheDocument();
    });

    it('displays the odu number', () => {
      render(<OduCard odu={mockOdu} />);
      expect(screen.getByText('Odú #01')).toBeInTheDocument();
    });

    it('displays all associated orixás', () => {
      render(<OduCard odu={mockOdu} />);
      expect(screen.getByText('Obatalá')).toBeInTheDocument();
      expect(screen.getByText('Oxum')).toBeInTheDocument();
    });

    it('displays all quizilas with warning styling', () => {
      render(<OduCard odu={mockOdu} />);
      expect(screen.getByText('Não mexa com fogo à noite')).toBeInTheDocument();
      expect(screen.getByText('Evite说有谎话')).toBeInTheDocument();
    });

    it('displays preceitos', () => {
      render(<OduCard odu={mockOdu} />);
      expect(screen.getByText('Fale sempre a verdade e respeite os mais velhos')).toBeInTheDocument();
    });

    it('displays ebó when provided', () => {
      render(<OduCard odu={mockOdu} />);
      expect(screen.getByText(/Faça uma oferenda de dendê/)).toBeInTheDocument();
    });

    it('does not display ebó section when not provided', () => {
      const oduWithoutEbo = { ...mockOdu, ebó: undefined };
      render(<OduCard odu={oduWithoutEbo} />);
      expect(screen.queryByText(/Ebó/)).not.toBeInTheDocument();
    });
  });

  describe('section headers', () => {
    it('shows Quizilas header', () => {
      render(<OduCard odu={mockOdu} />);
      expect(screen.getByText('Quizilas')).toBeInTheDocument();
    });

    it('shows Preceitos header', () => {
      render(<OduCard odu={mockOdu} />);
      expect(screen.getByText('Preceitos')).toBeInTheDocument();
    });

    it('shows Orixás Associados header', () => {
      render(<OduCard odu={mockOdu} />);
      expect(screen.getByText('Orixás Associados')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('renders with empty orixás array', () => {
      const oduNoOrixas = { ...mockOdu, orixas: [] };
      render(<OduCard odu={oduNoOrixas} />);
      expect(screen.getByText('Ogbe')).toBeInTheDocument();
    });

    it('renders with empty quizilas array', () => {
      const oduNoQuizilas = { ...mockOdu, quizilas: [] };
      render(<OduCard odu={oduNoQuizilas} />);
      expect(screen.queryByText('Quizilas')).not.toBeInTheDocument();
    });

    it('renders with single orixá', () => {
      const oduSingleOrixa = { ...mockOdu, orixas: ['Oxum'] };
      render(<OduCard odu={oduSingleOrixa} />);
      expect(screen.getByText('Oxum')).toBeInTheDocument();
    });

    it('renders with single quizila', () => {
      const oduSingleQuizila = { ...mockOdu, quizilas: ['Evite说吧'] };
      render(<OduCard odu={oduSingleQuizila} />);
      expect(screen.getByText('Evite说吧')).toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      const { container } = render(<OduCard odu={mockOdu} className="my-custom-class" />);
      expect(container.firstChild).toHaveClass('my-custom-class');
    });
  });
});
