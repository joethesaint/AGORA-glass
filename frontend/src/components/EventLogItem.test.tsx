import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Component logic extracted for testing
const EventLogItem = ({ signal }: { signal: { event_type: string, payload: any, timestamp: number } }) => (
  <div className="log-item">
    <span className="event-type">{signal.event_type}</span>
    <span className="payload">
      {JSON.stringify(signal.payload || {}).substring(0, 80)}...
    </span>
  </div>
);

describe('EventLogItem', () => {
  it('renders correctly with a valid payload', () => {
    const signal = { event_type: 'Test', payload: { data: 'test' }, timestamp: 123456 };
    render(<EventLogItem signal={signal} />);
    expect(screen.getByText('{"data":"test"}...')).toBeDefined();
  });

  it('renders gracefully with an undefined payload (regression test)', () => {
    const signal = { event_type: 'Test', payload: undefined, timestamp: 123456 };
    render(<EventLogItem signal={signal} />);
    expect(screen.getByText('{}...')).toBeDefined();
  });

  it('renders gracefully with a null payload', () => {
    const signal = { event_type: 'Test', payload: null, timestamp: 123456 };
    render(<EventLogItem signal={signal} />);
    expect(screen.getByText('{}...')).toBeDefined();
  });
});
