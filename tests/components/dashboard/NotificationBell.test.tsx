import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationBell } from '@/components/dashboard/NotificationBell';

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

describe('NotificationBell', () => {
  it('renders bell button', () => {
    render(<NotificationBell />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows unread count badge', () => {
    render(<NotificationBell />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Notificações Espirituais')).toBeInTheDocument();
  });

  it('shows notification list when open', async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    await user.click(screen.getByRole('button'));
    // Use regex to match text with emoji
    expect(screen.getByText(/Lua Cheia amanhã/)).toBeInTheDocument();
    expect(screen.getByText(/Ebó recomendado/)).toBeInTheDocument();
  });

  it('closes dropdown when clicked again', async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    
    // Open dropdown
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Notificações Espirituais')).toBeInTheDocument();
    
    // Close dropdown
    await user.click(screen.getByRole('button'));
    expect(screen.queryByText('Notificações Espirituais')).not.toBeInTheDocument();
  });

  it('displays notification messages', async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    await user.click(screen.getByRole('button'));
    
    expect(screen.getByText(/Ritual de manifestação recomendado/)).toBeInTheDocument();
    expect(screen.getByText(/Odu indica necessidade de limpeza/)).toBeInTheDocument();
  });
});
