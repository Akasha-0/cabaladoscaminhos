import { describe, it, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import { CalendarioEspiritual } from '@/components/dashboard/CalendarioEspiritual';
import {
  SpiritualCard,
  SpiritualCardHeader,
  SpiritualCardTitle,
  SpiritualCardDescription,
  SpiritualCardContent,
  SpiritualCardFooter,
} from '@/components/ui/spiritual-card';
import { SpiritualButton } from '@/components/ui/spiritual-button';

describe('CalendarioEspiritual', () => {
  it('should render the spiritual calendar', () => {
    const { container } = render(<CalendarioEspiritual />);
    expect(container).toMatchSnapshot();
  });

  it('should render with custom className', () => {
    const { container } = render(<CalendarioEspiritual className="custom-class" />);
    expect(container).toMatchSnapshot();
  });

  it('should render in loading state', () => {
    const { container } = render(<CalendarioEspiritual loading />);
    expect(container).toMatchSnapshot();
  });
});
describe('SpiritualCard', () => {
  const variants = ['default', 'elevated', 'golden', 'glow'] as const;
  const sizes = ['default', 'sm', 'lg'] as const;

  test.each(variants)('should render with variant: %s', (variant: typeof variants[number]) => {
    const { container } = render(
      <SpiritualCard variant={variant}>
        <SpiritualCardHeader>
          <SpiritualCardTitle>Card Title</SpiritualCardTitle>
          <SpiritualCardDescription>Card Description</SpiritualCardDescription>
        </SpiritualCardHeader>
        <SpiritualCardContent>Card Content</SpiritualCardContent>
        <SpiritualCardFooter>Card Footer</SpiritualCardFooter>
      </SpiritualCard>
    );
    expect(container).toMatchSnapshot();
  });

  test.each(sizes)('should render with size: %s', (size: typeof sizes[number]) => {
    const { container } = render(
      <SpiritualCard size={size}>
        <SpiritualCardContent>Card Content</SpiritualCardContent>
      </SpiritualCard>
    );
    expect(container).toMatchSnapshot();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <SpiritualCard className="custom-class">
        <SpiritualCardContent>Custom Card</SpiritualCardContent>
      </SpiritualCard>
    );
    expect(container).toMatchSnapshot();
  });
});

describe('SpiritualButton', () => {
  const variants = [
    'default',
    'outline',
    'secondary',
    'ghost',
    'destructive',
    'link',
    'golden',
    'golden-outline',
    'ghost-sacred',
    'glow-violet',
  ] as const;

  const sizes = ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'] as const;

  test.each(variants)('should render with variant: %s', (variant: typeof variants[number]) => {
    const { container } = render(<SpiritualButton variant={variant}>Click me</SpiritualButton>);
    expect(container).toMatchSnapshot();
  });

  test.each(sizes)('should render with size: %s', (size: typeof sizes[number]) => {
    const { container } = render(<SpiritualButton size={size}>Click me</SpiritualButton>);
    expect(container).toMatchSnapshot();
  });

  it('should render as disabled', () => {
    const { container } = render(<SpiritualButton disabled>Disabled</SpiritualButton>);
    expect(container).toMatchSnapshot();
  });

  it('should render icon button', () => {
    const { container } = render(<SpiritualButton size="icon">+</SpiritualButton>);
    expect(container).toMatchSnapshot();
  });
});