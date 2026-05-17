import { render, screen } from '@testing-library/react';
import { PositionCard, PositionUpdate } from './PositionCard';
import { describe, it, expect } from 'vitest';

describe('PositionCard', () => {
  const mockData: PositionUpdate = {
    symbol: 'BTC-PERP',
    margin_ratio: 0.25,
    leverage: 3.0,
    account: '0x123',
  };

  it('renders correctly', () => {
    render(<PositionCard data={mockData} />);
    expect(screen.getByText('BTC-PERP')).toBeDefined();
    expect(screen.getByText('25.00%')).toBeDefined();
    expect(screen.getByText('3.0x')).toBeDefined();
  });
});
