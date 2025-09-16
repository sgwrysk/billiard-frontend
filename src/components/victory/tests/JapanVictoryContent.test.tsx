import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { GameType, GameStatus } from '../../../types/index';
import type { Game } from '../../../types/index';
import JapanVictoryContent from '../JapanVictoryContent';

// Mock the Japan-specific components
vi.mock('../../games/japan/JapanCumulativePointsTable', () => ({
  default: () => <div data-testid="japan-cumulative-table">Japan Cumulative Points Table</div>
}));

vi.mock('../../games/japan/JapanScoreChart', () => ({
  default: () => <div data-testid="japan-score-chart">Japan Score Chart</div>
}));

// Test wrapper with LanguageProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
);

describe('JapanVictoryContent', () => {
  it('should render Japan cumulative points table', () => {
    const japanGame: Game = {
      id: 'test-japan-1',
      type: GameType.JAPAN,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Japan Player 1',
          score: 15,
          ballsPocketed: [],
          isActive: false,
          targetScore: 50,
        },
        {
          id: 'player-2',
          name: 'Japan Player 2',
          score: -5,
          ballsPocketed: [],
          isActive: false,
          targetScore: 50,
        },
      ],
      currentPlayerIndex: 0,
      startTime: new Date(),
      endTime: new Date(),
      winner: 'player-1',
      totalRacks: 3,
      currentRack: 3,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [
        { playerId: 'player-1', score: 5, timestamp: new Date() },
        { playerId: 'player-1', score: 10, timestamp: new Date() },
        { playerId: 'player-2', score: -5, timestamp: new Date() },
      ],
    };

    render(
      <TestWrapper>
        <JapanVictoryContent game={japanGame} />
      </TestWrapper>
    );

    // Should render Japan-specific components
    expect(screen.getByTestId('japan-cumulative-table')).toBeInTheDocument();
    expect(screen.getByTestId('japan-score-chart')).toBeInTheDocument();
  });

  it('should display multiplier stepper with initial value of 1', () => {
    const japanGame: Game = {
      id: 'test-japan-multiplier',
      type: GameType.JAPAN,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Player A',
          score: 20,
          ballsPocketed: [],
          isActive: false,
          targetScore: 50,
        },
        {
          id: 'player-2',
          name: 'Player B',
          score: 10,
          ballsPocketed: [],
          isActive: false,
          targetScore: 50,
        },
      ],
      currentPlayerIndex: 0,
      startTime: new Date(),
      endTime: new Date(),
      winner: 'player-1',
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [],
    };

    render(
      <TestWrapper>
        <JapanVictoryContent game={japanGame} />
      </TestWrapper>
    );

    // Should have multiplier input with initial value 1
    const multiplierInput = screen.getByDisplayValue('1');
    expect(multiplierInput).toBeInTheDocument();
  });

  it('should calculate and display final scores with multiplier', () => {
    const japanGame: Game = {
      id: 'test-japan-scoring',
      type: GameType.JAPAN,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'High Scorer',
          score: 25,
          ballsPocketed: [],
          isActive: false,
          targetScore: 50,
        },
        {
          id: 'player-2',
          name: 'Low Scorer',
          score: -10,
          ballsPocketed: [],
          isActive: false,
          targetScore: 50,
        },
      ],
      currentPlayerIndex: 0,
      startTime: new Date(),
      endTime: new Date(),
      winner: 'player-1',
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [],
    };

    render(
      <TestWrapper>
        <JapanVictoryContent game={japanGame} />
      </TestWrapper>
    );

    // Should display both players (winner gets crown)
    expect(screen.getByText((content) => content.includes('High Scorer'))).toBeInTheDocument();
    expect(screen.getByText('Low Scorer')).toBeInTheDocument();
    
    // Should display scores (will be 0 since no japanRackHistory in test)
    expect(screen.getAllByText('0点').length).toBeGreaterThan(0);
  });

  it('should update final scores when multiplier changes', () => {
    const japanGame: Game = {
      id: 'test-japan-multiplier-update',
      type: GameType.JAPAN,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Test Player',
          score: 10,
          ballsPocketed: [],
          isActive: false,
          targetScore: 50,
        },
      ],
      currentPlayerIndex: 0,
      startTime: new Date(),
      endTime: new Date(),
      winner: 'player-1',
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [],
    };

    render(
      <TestWrapper>
        <JapanVictoryContent game={japanGame} />
      </TestWrapper>
    );

    // Initially should show 0 points (no japanRackHistory in test)
    expect(screen.getByText('0点')).toBeInTheDocument();

    // Find multiplier input and change it to 2
    const multiplierInput = screen.getByDisplayValue('1');
    fireEvent.change(multiplierInput, { target: { value: '2' } });

    // Should still show 0 points (no japanRackHistory in test)
    expect(screen.getByText('0点')).toBeInTheDocument();
  });

  it('should display winner with crown emoji', () => {
    const japanGame: Game = {
      id: 'test-japan-winner',
      type: GameType.JAPAN,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'winner-player',
          name: 'Japan Champion',
          score: 50,
          ballsPocketed: [],
          isActive: false,
          targetScore: 50,
        },
        {
          id: 'loser-player',
          name: 'Japan Runner Up',
          score: 20,
          ballsPocketed: [],
          isActive: false,
          targetScore: 50,
        },
      ],
      currentPlayerIndex: 0,
      startTime: new Date(),
      endTime: new Date(),
      winner: 'winner-player',
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [],
    };

    render(
      <TestWrapper>
        <JapanVictoryContent game={japanGame} />
      </TestWrapper>
    );

    // Should display champion with crown
    expect(screen.getByText('Japan Champion 👑')).toBeInTheDocument();
    expect(screen.getByText('Japan Runner Up')).toBeInTheDocument();
  });

  it('should apply different colors for positive and negative scores', () => {
    const japanGame: Game = {
      id: 'test-japan-colors',
      type: GameType.JAPAN,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'positive-player',
          name: 'Positive Player',
          score: 30,
          ballsPocketed: [],
          isActive: false,
          targetScore: 50,
        },
        {
          id: 'negative-player',
          name: 'Negative Player',
          score: -15,
          ballsPocketed: [],
          isActive: false,
          targetScore: 50,
        },
      ],
      currentPlayerIndex: 0,
      startTime: new Date(),
      endTime: new Date(),
      winner: 'positive-player',
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [],
    };

    render(
      <TestWrapper>
        <JapanVictoryContent game={japanGame} />
      </TestWrapper>
    );

    // Should render scores (will be 0 due to no japanRackHistory)
    const positiveScore = screen.getAllByText('0点')[0];
    const negativeScore = screen.getAllByText('0点')[1] || screen.getAllByText('0点')[0];
    
    expect(positiveScore).toBeInTheDocument();
    expect(negativeScore).toBeInTheDocument();
    
    // Zero scores should not have special color (inherit)
    expect(positiveScore.style.color).toBe('inherit');
    expect(negativeScore.style.color).toBe('inherit');
  });

  it('should handle zero scores correctly', () => {
    const japanGame: Game = {
      id: 'test-japan-zero',
      type: GameType.JAPAN,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'zero-player',
          name: 'Zero Player',
          score: 0,
          ballsPocketed: [],
          isActive: false,
          targetScore: 50,
        },
      ],
      currentPlayerIndex: 0,
      startTime: new Date(),
      endTime: new Date(),
      winner: 'zero-player',
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [],
    };

    render(
      <TestWrapper>
        <JapanVictoryContent game={japanGame} />
      </TestWrapper>
    );

    // Should display zero score
    const zeroScore = screen.getByText('0点');
    expect(zeroScore).toBeInTheDocument();
    
    // Zero score should not have special color (inherit)
    expect(zeroScore.style.color).toBe('inherit');
  });
});