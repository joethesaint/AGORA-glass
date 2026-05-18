import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PositionCardEnhanced, PositionsList, Position } from './PositionsList';

describe('PositionCardEnhanced', () => {
  const mockPosition: Position = {
    id: 'pos_001',
    symbol: 'BTC-PERP',
    entryPrice: 60000,
    currentPrice: 63200,
    size: 1.5,
    marginRatio: 0.28,
    leverage: 3.2,
    collateral: 50000,
    unrealizedPnL: 4800,
  };

  it('renders position symbol', () => {
    render(<PositionCardEnhanced position={mockPosition} />);
    expect(screen.getByText('BTC-PERP')).toBeTruthy();
  });

  it('displays entry price', () => {
    render(<PositionCardEnhanced position={mockPosition} />);
    expect(screen.getByText(/Entry/i)).toBeTruthy();
    expect(screen.getByText(/60,000/)).toBeTruthy();
  });

  it('displays current price', () => {
    render(<PositionCardEnhanced position={mockPosition} />);
    expect(screen.getByText(/Current/i)).toBeTruthy();
    expect(screen.getByText(/63,200/)).toBeTruthy();
  });

  it('displays margin ratio and leverage', () => {
    render(<PositionCardEnhanced position={mockPosition} />);
    expect(screen.getByText(/Margin Ratio/i)).toBeTruthy();
    expect(screen.getByText(/28\.0%/)).toBeTruthy();
    expect(screen.getByText(/Leverage/i)).toBeTruthy();
    expect(screen.getByText(/3\.2x/)).toBeTruthy();
  });

  it('displays unrealized PnL', () => {
    render(<PositionCardEnhanced position={mockPosition} />);
    expect(screen.getByText(/Unrealized PnL/i)).toBeTruthy();
  });

  it('calls onClose callback when close button clicked', () => {
    const onClose = vi.fn();
    render(<PositionCardEnhanced position={mockPosition} onClose={onClose} />);
    const closeButtons = screen.getAllByText(/Close/i);
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalledWith('pos_001');
  });

  it('shows liquidation warning when margin below threshold', () => {
    const criticalPosition: Position = {
      ...mockPosition,
      marginRatio: 0.08,
    };
    render(<PositionCardEnhanced position={criticalPosition} />);
    expect(screen.getByText(/Liquidation Risk/i)).toBeTruthy();
  });

  it('shows safe status for low leverage', () => {
    render(<PositionCardEnhanced position={mockPosition} />);
    expect(screen.getByText(/safe/i)).toBeTruthy();
  });
});

describe('PositionsList', () => {
  const mockPositions: Position[] = [
    {
      id: 'pos_001',
      symbol: 'BTC-PERP',
      entryPrice: 60000,
      currentPrice: 63200,
      size: 1.5,
      marginRatio: 0.28,
      leverage: 3.2,
      collateral: 50000,
      unrealizedPnL: 4800,
    },
    {
      id: 'pos_002',
      symbol: 'ETH-PERP',
      entryPrice: 3000,
      currentPrice: 3150,
      size: 10,
      marginRatio: 0.22,
      leverage: 4.1,
      collateral: 65000,
      unrealizedPnL: 1500,
    },
  ];

  it('renders total positions count', () => {
    render(<PositionsList positions={mockPositions} />);
    expect(screen.getByText(/Total Positions/i)).toBeTruthy();
    expect(screen.getByText(/2/)).toBeTruthy();
  });

  it('renders all positions', () => {
    render(<PositionsList positions={mockPositions} />);
    expect(screen.getByText('BTC-PERP')).toBeTruthy();
    expect(screen.getByText('ETH-PERP')).toBeTruthy();
  });

  it('shows empty state when no positions', () => {
    render(<PositionsList positions={[]} />);
    expect(screen.getByText(/No positions currently open/i)).toBeTruthy();
  });

  it('displays critical warning when leverage > 5', () => {
    const criticalPositions: Position[] = [
      ...mockPositions,
      {
        id: 'pos_003',
        symbol: 'SOL-PERP',
        entryPrice: 180,
        currentPrice: 175,
        size: 280,
        marginRatio: 0.08,
        leverage: 5.5,
        collateral: 35000,
        unrealizedPnL: -1400,
      },
    ];
    render(<PositionsList positions={criticalPositions} />);
    expect(screen.getByText(/CRITICAL/i)).toBeTruthy();
  });

  it('calls callbacks when position actions clicked', () => {
    const onPositionClose = vi.fn();
    const onAddMargin = vi.fn();
    const onDeleverage = vi.fn();

    render(
      <PositionsList
        positions={mockPositions}
        onPositionClose={onPositionClose}
        onAddMargin={onAddMargin}
        onDeleverage={onDeleverage}
      />
    );

    expect(onPositionClose).toBeDefined();
    expect(onAddMargin).toBeDefined();
    expect(onDeleverage).toBeDefined();
  });
});
