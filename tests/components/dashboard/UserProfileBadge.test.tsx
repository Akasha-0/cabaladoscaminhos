import { render, screen } from '@testing-library/react';
import { UserProfileBadge } from '@/components/dashboard/UserProfileBadge';
import { useUserProfileStore } from '@/lib/store/user-profile';

vi.mock('@/lib/store/user-profile', () => ({
  useUserProfileStore: () => ({
    profile: {
      id: '1',
      nome: 'Maria Silva',
      email: 'maria@example.com',
      numeroVida: 7,
      orixaRegente: 'Iemanjá',
    },
    isLoading: false,
  }),
}));

describe('UserProfileBadge', () => {
  it('renders user name', () => {
    render(<UserProfileBadge />);
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
  });

  it('renders user email', () => {
    render(<UserProfileBadge />);
    expect(screen.getByText('maria@example.com')).toBeInTheDocument();
  });

  it('displays vida number', () => {
    render(<UserProfileBadge />);
    expect(screen.getByText('Vida 7')).toBeInTheDocument();
  });

  it('shows orixá regente', () => {
    render(<UserProfileBadge />);
    expect(screen.getByText('Iemanjá')).toBeInTheDocument();
  });
  it('shows profile avatar container', () => {
    render(<UserProfileBadge />);
    const avatarContainer = document.querySelector('.rounded-full');
    expect(avatarContainer).toBeInTheDocument();
  });
});
