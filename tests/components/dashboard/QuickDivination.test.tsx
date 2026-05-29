import { render, screen } from '@testing-library/react';
import { QuickDivination } from '@/components/dashboard/QuickDivination';

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

describe('QuickDivination', () => {
  it('renders section title', () => {
    render(<QuickDivination />);
    expect(screen.getByText('Divinação Rápida')).toBeInTheDocument();
  });

  it('renders all divination options', () => {
    render(<QuickDivination />);
    expect(screen.getByText('Tarot')).toBeInTheDocument();
    expect(screen.getByText('Mesa Real')).toBeInTheDocument();
    expect(screen.getByText('Ifá')).toBeInTheDocument();
    expect(screen.getByText('I Ching')).toBeInTheDocument();
  });

  it('renders links to correct routes', () => {
    render(<QuickDivination />);
    expect(screen.getByRole('link', { name: /Tarot/ })).toHaveAttribute('href', '/dashboard/tarot');
    expect(screen.getByRole('link', { name: /Mesa Real/ })).toHaveAttribute('href', '/dashboard/lenormand');
    expect(screen.getByRole('link', { name: /Ifá/ })).toHaveAttribute('href', '/dashboard/odu');
    expect(screen.getByRole('link', { name: /I Ching/ })).toHaveAttribute('href', '/dashboard/iching');
  });

  it('renders descriptions', () => {
    render(<QuickDivination />);
    expect(screen.getByText('Arcanos Maiores')).toBeInTheDocument();
    expect(screen.getByText('Baralho Cigano')).toBeInTheDocument();
    expect(screen.getByText('Merindilogun')).toBeInTheDocument();
    expect(screen.getByText('Hexagramas')).toBeInTheDocument();
  });

  it('renders four divination option cards', () => {
    render(<QuickDivination />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
  });
});
