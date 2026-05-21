import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarginHistoryChart } from './MarginHistoryChart';
import { LeverageChart } from './LeverageChart';

describe('MarginHistoryChart', () => {
  const mockData = [
    { timestamp: Date.now() - 60000, ratio: 0.25 },
    { timestamp: Date.now() - 30000, ratio: 0.30 },
    { timestamp: Date.now(), ratio: 0.28 },
  ];

  it('renders chart title', () => {
    render(<MarginHistoryChart data={mockData} />);
    expect(screen.getByText(/Margin Ratio History/i)).toBeTruthy();
  });

  it('displays current margin ratio', () => {
    render(<MarginHistoryChart data={mockData} />);
    expect(screen.getAllByText(/Current/i).length).toBeGreaterThanOrEqual(1);
  });

  it('displays average margin ratio', () => {
    render(<MarginHistoryChart data={mockData} />);
    expect(screen.getByText(/Average/i)).toBeTruthy();
  });

  it('shows safety threshold warning', () => {
    render(<MarginHistoryChart data={mockData} />);
    expect(screen.getByText(/Safety threshold: 12%/i)).toBeTruthy();
  });

  it('handles empty data gracefully', () => {
    render(<MarginHistoryChart data={[]} />);
    expect(screen.getByText(/Margin Ratio History/i)).toBeTruthy();
  });
});

describe('LeverageChart', () => {
  const mockData = [
    { timestamp: Date.now() - 60000, leverage: 3.5 },
    { timestamp: Date.now() - 30000, leverage: 3.2 },
    { timestamp: Date.now(), leverage: 3.0 },
  ];

  it('renders chart title', () => {
    render(<LeverageChart data={mockData} />);
    expect(screen.getByText(/Leverage Trend/i)).toBeTruthy();
  });

  it('displays current leverage', () => {
    render(<LeverageChart data={mockData} />);
    expect(screen.getAllByText(/Current/i).length).toBeGreaterThanOrEqual(1);
  });

  it('displays max leverage', () => {
    render(<LeverageChart data={mockData} />);
    expect(screen.getAllByText(/Max/i).length).toBeGreaterThanOrEqual(1);
  });

  it('shows safety threshold warning', () => {
    render(<LeverageChart data={mockData} />);
    expect(screen.getByText(/Safety threshold: 5x/i)).toBeTruthy();
  });

  it('handles critical leverage', () => {
    const criticalData = [
      { timestamp: Date.now() - 30000, leverage: 5.5 },
      { timestamp: Date.now(), leverage: 5.8 },
    ];
    render(<LeverageChart data={criticalData} />);
    expect(screen.getByText(/Leverage Trend/i)).toBeTruthy();
  });
});
