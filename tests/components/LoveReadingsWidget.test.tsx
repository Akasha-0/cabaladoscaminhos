import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoveReadingsWidget } from '@/components/dashboard/LoveReadingsWidget';

describe('LoveReadingsWidget', () => {
  it('renders without crashing', () => {
    expect(() => render(<LoveReadingsWidget />)).not.toThrow();
  });

  it('renders with userOrixa prop', () => {
    expect(() => render(<LoveReadingsWidget userOrixa="oxum" />)).not.toThrow();
  });

  it('renders with partnerSign prop', () => {
    expect(() => render(<LoveReadingsWidget partnerSign="aries" />)).not.toThrow();
  });

  it('renders with all props', () => {
    expect(() => render(
      <LoveReadingsWidget 
        userId="user123"
        userOrixa="oxum"
        partnerSign="touro"
      />
    )).not.toThrow();
  });
});