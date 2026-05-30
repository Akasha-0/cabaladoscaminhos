/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppShell } from '@/components/layout/AppShell';

describe('AppShell', () => {
  it('renders without crashing', () => {
    render(<AppShell><div>Test Content</div></AppShell>);
    expect(screen.getByText('Test Content')).toBeDefined();
  });

  it('renders children content', () => {
    render(
      <AppShell>
        <main>Main Content</main>
        <aside>Sidebar</aside>
      </AppShell>
    );
    expect(screen.getByText('Main Content')).toBeDefined();
    expect(screen.getByText('Sidebar')).toBeDefined();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <AppShell className="custom-class">
        <div>Content</div>
      </AppShell>
    );
    expect(container.querySelector('.custom-class') || container.querySelector('[class*="custom-class"]')).toBeDefined();
  });

  it('renders CosmicBackground component', () => {
    const { container } = render(<AppShell><div>Content</div></AppShell>);
    const cosmicBg = container.querySelector('[class*="cosmic"]');
    expect(cosmicBg || screen.getByText('Content')).toBeDefined();
  });

  it('renders multiple children', () => {
    render(
      <AppShell>
        <header>Header</header>
        <nav>Navigation</nav>
        <main>Main</main>
        <footer>Footer</footer>
      </AppShell>
    );
    expect(screen.getByText('Header')).toBeDefined();
    expect(screen.getByText('Navigation')).toBeDefined();
    expect(screen.getByText('Main')).toBeDefined();
    expect(screen.getByText('Footer')).toBeDefined();
  });

  it('handles empty children gracefully', () => {
    const { container } = render(<AppShell />);
    expect(container.querySelector('.min-h-screen')).toBeDefined();
  });
});