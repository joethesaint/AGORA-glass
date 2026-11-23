import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RescuePath } from './RescuePath';

describe('RescuePath Component', () => {
  it('renders correctly in idle stage', () => {
    render(<RescuePath stage="idle" />);
    expect(screen.getByText('Rescue Pipeline')).toBeDefined();
    // All steps should be inactive (not have the verified text)
    expect(screen.queryByText('VERIFIED')).toBeNull();
  });

  it('highlights the pinning stage when active', () => {
    render(<RescuePath stage="pinning" />);
    const verifiedLabels = screen.getAllByText('VERIFIED');
    expect(verifiedLabels.length).toBe(1);
    expect(screen.getByText('Arc Pinning').parentElement?.textContent).toContain('VERIFIED');
  });

  it('highlights all stages when complete', () => {
    render(<RescuePath stage="complete" />);
    const verifiedLabels = screen.getAllByText('VERIFIED');
    expect(verifiedLabels.length).toBe(3); // Pinning, Releasing, Bridging
  });

  it('shows bridging stage and previous stages', () => {
    render(<RescuePath stage="bridging" />);
    const verifiedLabels = screen.getAllByText('VERIFIED');
    expect(verifiedLabels.length).toBe(3); // Pinning, Releasing, Bridging should all be active
    expect(screen.getByText('Arc Pinning').parentElement?.textContent).toContain('VERIFIED');
    expect(screen.getByText('Vault Release').parentElement?.textContent).toContain('VERIFIED');
    expect(screen.getByText('Circle Transfer').parentElement?.textContent).toContain('VERIFIED');
  });

  it('shows releasing stage and previous stages', () => {
    render(<RescuePath stage="releasing" />);
    const verifiedLabels = screen.getAllByText('VERIFIED');
    expect(verifiedLabels.length).toBe(2); // Pinning and Releasing
    expect(screen.getByText('Arc Pinning').parentElement?.textContent).toContain('VERIFIED');
    expect(screen.getByText('Vault Release').parentElement?.textContent).toContain('VERIFIED');
    expect(screen.getByText('Circle Transfer').parentElement?.textContent).not.toContain('VERIFIED');
  });
});
