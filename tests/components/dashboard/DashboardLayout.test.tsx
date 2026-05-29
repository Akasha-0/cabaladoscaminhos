import { render, screen } from '@testing-library/react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

describe('DashboardLayout', () => {
  it('renders children content', () => {
    render(
      <DashboardLayout>
        <div data-testid="child">Test Content</div>
      </DashboardLayout>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders sidebar with logo on desktop', () => {
    render(<DashboardLayout><div /></DashboardLayout>);
    expect(screen.getByText('✦ Cabala')).toBeInTheDocument();
  });

  it('renders greeting based on time of day', () => {
    render(<DashboardLayout><div /></DashboardLayout>);
    const greeting = screen.getByText(/(Bom dia|Boa tarde|Boa noite)/);
    expect(greeting).toBeInTheDocument();
  });
});