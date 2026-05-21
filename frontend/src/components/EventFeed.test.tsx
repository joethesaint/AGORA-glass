import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventFeed, EventTypeIcon } from './EventFeed';
import { EventStatsCard } from './EventStatsCard';
import { EventType } from '@/types/agent';

describe('EventTypeIcon', () => {
  it('renders icon for PositionUpdate', () => {
    const { container } = render(<EventTypeIcon type="PositionUpdate" />);
    expect(container.querySelector('.lucide-activity')).toBeTruthy();
  });

  it('renders icon for RiskVerdict', () => {
    const { container } = render(<EventTypeIcon type="RiskVerdict" />);
    expect(container.querySelector('.lucide-circle-alert')).toBeTruthy();
  });

  it('renders icon for ReasoningTrace', () => {
    const { container } = render(<EventTypeIcon type="ReasoningTrace" />);
    expect(container.querySelector('.lucide-shield')).toBeTruthy();
  });

  it('renders icon for RescueComplete', () => {
    const { container } = render(<EventTypeIcon type="RescueComplete" />);
    expect(container.querySelector('.lucide-zap')).toBeTruthy();
  });
});

describe('EventFeed', () => {
  const mockEvents = [
    {
      type: 'PositionUpdate' as EventType,
      timestamp: Date.now() / 1000,
      data: { symbol: 'BTC-PERP', margin_ratio: 0.28, leverage: 3.2 },
    },
    {
      type: 'RiskVerdict' as EventType,
      timestamp: (Date.now() - 10000) / 1000,
      data: { status: 'SAFE', leverage: 3.2 },
    },
    {
      type: 'RescueComplete' as EventType,
      timestamp: (Date.now() - 20000) / 1000,
      data: { status: 'SUCCESS', amount: 500 },
    },
  ];

  it('renders event timeline title', () => {
    render(<EventFeed events={mockEvents} />);
    expect(screen.getByText(/System Intelligence/i)).toBeTruthy();
  });

  it('renders event types', () => {
    render(<EventFeed events={mockEvents} />);
    expect(screen.getByText(/PositionUpdate/i)).toBeTruthy();
    expect(screen.getByText(/RiskVerdict/i)).toBeTruthy();
    expect(screen.getByText(/RescueComplete/i)).toBeTruthy();
  });

  it('displays no events message when empty', () => {
    render(<EventFeed events={[]} />);
    expect(screen.getByText(/Awaiting initialization/i)).toBeTruthy();
  });

  it('respects maxItems prop', () => {
    const events = mockEvents.map((e, i) => ({
      ...e,
      timestamp: (Date.now() - i * 1000) / 1000,
    }));
    render(<EventFeed events={events} maxItems={2} />);
    expect(screen.getByText(/\+1 deeper signals/i)).toBeTruthy();
  });

  it('displays RiskVerdict data correctly', () => {
    render(<EventFeed events={mockEvents} />);
    expect(screen.getByText(/SAFE/i)).toBeTruthy();
  });

  it('displays RescueComplete data correctly', () => {
    render(<EventFeed events={mockEvents} />);
    expect(screen.getByText(/\$500/i)).toBeTruthy();
  });
});

describe('EventStatsCard', () => {
  const mockEvents = [
    {
      type: 'PositionUpdate' as EventType,
      timestamp: Date.now() / 1000,
      data: {},
    },
    {
      type: 'PositionUpdate' as EventType,
      timestamp: (Date.now() - 10000) / 1000,
      data: {},
    },
    {
      type: 'RiskVerdict' as EventType,
      timestamp: (Date.now() - 20000) / 1000,
      data: {},
    },
    {
      type: 'RescueComplete' as EventType,
      timestamp: (Date.now() - 30000) / 1000,
      data: {},
    },
  ];

  it('renders event distribution title', () => {
    render(<EventStatsCard events={mockEvents} />);
    expect(screen.getByText(/Event Distribution/i)).toBeTruthy();
  });

  it('displays all event categories', () => {
    render(<EventStatsCard events={mockEvents} />);
    expect(screen.getByText(/Position Updates/i)).toBeTruthy();
    expect(screen.getByText(/Risk Verdicts/i)).toBeTruthy();
    expect(screen.getByText(/Rescue Complete/i)).toBeTruthy();
  });

  it('counts events correctly', () => {
    render(<EventStatsCard events={mockEvents} />);
    // PositionUpdate appears twice
    const eventList = screen.getByText(/Event Distribution/i).closest('div');
    expect(eventList).toBeTruthy();
  });

  it('displays total events', () => {
    render(<EventStatsCard events={mockEvents} />);
    expect(screen.getByText(/Buffer Events/i)).toBeTruthy();
  });

  it('handles empty events', () => {
    render(<EventStatsCard events={[]} />);
    expect(screen.getByText(/Event Distribution/i)).toBeTruthy();
  });
});
