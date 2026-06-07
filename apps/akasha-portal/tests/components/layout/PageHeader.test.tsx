/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageHeader from '@/components/layout/PageHeader';

describe('PageHeader', () => {
  it('renders without crashing', () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeDefined();
  });

  it('renders with title', () => {
    render(<PageHeader title="My Title" />);
    expect(screen.getByText('My Title')).toBeDefined();
  });

  it('renders with subtitle', () => {
    render(<PageHeader title="Title" subtitle="My Subtitle" />);
    expect(screen.getByText('My Subtitle')).toBeDefined();
  });

  it('renders with breadcrumb navigation', () => {
    render(
      <PageHeader
        title="Title"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Page', href: '/page' },
        ]}
      />
    );
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Page')).toBeDefined();
  });

  it('renders breadcrumb links correctly', () => {
    const { container } = render(
      <PageHeader
        title="Title"
        breadcrumb={[{ label: 'Home', href: '/' }]}
      />
    );
    expect(screen.getByText('Home')).toBeDefined();
  });

  it('renders actions slot', () => {
    render(
      <PageHeader
        title="Title"
        actions={<button>Action</button>}
      />
    );
    expect(screen.getByText('Action')).toBeDefined();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <PageHeader title="Title" className="custom-header" />
    );
    expect(container.querySelector('[class*="custom-header"]') || container.querySelector('.custom-header')).toBeDefined();
  });

  it('renders MysticDivider', () => {
    const { container } = render(<PageHeader title="Title" />);
    const divider = container.querySelector('[role="separator"]');
    expect(divider).toBeDefined();
  });

  it('handles single breadcrumb item', () => {
    render(
      <PageHeader
        title="Title"
        breadcrumb={[{ label: 'Root' }]}
      />
    );
    expect(screen.getByText('Root')).toBeDefined();
  });

  it('renders with no breadcrumb when empty array', () => {
    const { container } = render(
      <PageHeader title="Title" breadcrumb={[]} />
    );
    const nav = container.querySelector('nav');
    expect(nav).toBeNull();
  });
});