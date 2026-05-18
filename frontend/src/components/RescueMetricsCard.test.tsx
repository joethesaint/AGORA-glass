import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RescueMetricsCard } from './RescueMetricsCard';

describe('RescueMetricsCard', () => {
  const mockProps = {
    totalRescued: 5000,
    avgLatency: 450,
    successRate: 99.2,
    totalRescues: 100,
  };

  it('renders total rescued amount', () => {
    render(<RescueMetricsCard {...mockProps} />);
    expect(screen.getByText(/Total Rescued/i)).toBeTruthy();
    expect(screen.getByText(/5,000/)).toBeTruthy();
  });

  it('renders average latency', () => {
    render(<RescueMetricsCard {...mockProps} />);
    expect(screen.getByText(/Avg Latency/i)).toBeTruthy();
    expect(screen.getByText(/450ms/)).toBeTruthy();
  });

  it('renders success rate', () => {
    render(<RescueMetricsCard {...mockProps} />);
    expect(screen.getByText(/Success Rate/i)).toBeTruthy();
    expect(screen.getByText(/99.2%/)).toBeTruthy();
  });

  it('shows status as LIVE', () => {
    render(<RescueMetricsCard {...mockProps} />);
    expect(screen.getByText(/LIVE/)).toBeTruthy();
  });

  it('displays rescue count correctly', () => {
    render(<RescueMetricsCard {...mockProps} />);
    expect(screen.getByText(/100 rescues/)).toBeTruthy();
  });

  it('formats large numbers with commas', () => {
    render(<RescueMetricsCard totalRescued={1000000} avgLatency={487} successRate={98.5} totalRescues={500} />);
    expect(screen.getByText(/1,000,000/)).toBeTruthy();
  });
});
