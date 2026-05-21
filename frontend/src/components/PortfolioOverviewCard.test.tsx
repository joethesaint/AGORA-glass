import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PortfolioOverviewCard } from './PortfolioOverviewCard';

describe('PortfolioOverviewCard', () => {
  const mockProps = {
    totalValue: 150000,
    avgMarginRatio: 0.28,
    avgLeverage: 3.2,
    positionCount: 3,
    criticalPositions: 0,
  };

  it('renders portfolio overview title', () => {
    render(<PortfolioOverviewCard {...mockProps} />);
    expect(screen.getByText(/Portfolio Overview/i)).toBeTruthy();
  });

  it('displays position count', () => {
    render(<PortfolioOverviewCard {...mockProps} />);
    expect(screen.getByText(/3 active positions/i)).toBeTruthy();
  });

  it('shows healthy status when no critical positions', () => {
    render(<PortfolioOverviewCard {...mockProps} />);
    expect(screen.getByText(/HEALTHY/i)).toBeTruthy();
  });

  it('shows critical status when critical positions exist', () => {
    const criticalProps = { ...mockProps, criticalPositions: 1 };
    render(<PortfolioOverviewCard {...criticalProps} />);
    expect(screen.getAllByText(/CRITICAL/i).length).toBeGreaterThanOrEqual(1);
  });

  it('displays total portfolio value', () => {
    render(<PortfolioOverviewCard {...mockProps} />);
    expect(screen.getByText(/Total Value/i)).toBeTruthy();
    expect(screen.getByText(/150,000/)).toBeTruthy();
  });

  it('displays average margin ratio', () => {
    render(<PortfolioOverviewCard {...mockProps} />);
    expect(screen.getByText(/Avg Margin/i)).toBeTruthy();
    expect(screen.getByText(/28.0%/)).toBeTruthy();
  });

  it('displays average leverage', () => {
    render(<PortfolioOverviewCard {...mockProps} />);
    expect(screen.getByText(/Avg Leverage/i)).toBeTruthy();
    expect(screen.getByText(/3.2x/)).toBeTruthy();
  });

  it('shows active position count', () => {
    render(<PortfolioOverviewCard {...mockProps} />);
    expect(screen.getByText(/Active/i)).toBeTruthy();
    expect(screen.getAllByText(/3/)).toBeTruthy();
  });

  it('displays critical position count', () => {
    render(<PortfolioOverviewCard {...mockProps} />);
    expect(screen.getByText(/Critical/i)).toBeTruthy();
  });

  it('handles single position', () => {
    const singlePosProps = { ...mockProps, positionCount: 1 };
    render(<PortfolioOverviewCard {...singlePosProps} />);
    expect(screen.getByText(/1 active position/i)).toBeTruthy();
  });
});
