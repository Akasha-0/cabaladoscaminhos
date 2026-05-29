import { render, screen } from '@testing-library/react';
import { MobileBottomNav } from '@/components/dashboard/MobileBottomNav';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('MobileBottomNav', () => {
  it('renders all navigation items', () => {
    render(<MobileBottomNav />);
    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Mapa')).toBeInTheDocument();
    expect(screen.getByText('Tarot')).toBeInTheDocument();
    expect(screen.getByText('Oráculo')).toBeInTheDocument();
  });

  it('renders links with correct hrefs', () => {
    render(<MobileBottomNav />);
    expect(screen.getByRole('link', { name: /Início/ })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /Mapa/ })).toHaveAttribute('href', '/dashboard/mapa');
  });
});