import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { GameType, GameStatus } from '../../../types/index';
import type { Game } from '../../../types/index';
import RotationVictoryContent from '../RotationVictoryContent';

// Mock Chart.js
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="chart">Chart</div>,
}));

// Test wrapper with LanguageProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
);

describe('RotationVictoryContent', () => {
  it('should render victory announcement with winner', () => {
    const rotationGame: Game = {
      id: 'test-rotation-1',
      type: GameType.ROTATION,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Rotation Winner',
          score: 50,
          ballsPocketed: [1, 2, 3],
          isActive: false,
          targetScore: 50,
        },
        {
          id: 'player-2',
          name: 'Player 2',
          score: 30,
          ballsPocketed: [4, 5],
          isActive: false,
          targetScore: 50,
        },
      ],
      currentPlayerIndex: 0,
      startTime: new Date('2023-01-01T10:00:00Z'),
      endTime: new Date('2023-01-01T10:30:00Z'),
      winner: 'player-1',
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [
        {
          playerId: 'player-1',
          score: 1,
          timestamp: new Date('2023-01-01T10:05:00Z'),
        },
        {
          playerId: 'player-1',
          score: 2,
          timestamp: new Date('2023-01-01T10:10:00Z'),
        },
        {
          playerId: 'player-2',
          score: 4,
          timestamp: new Date('2023-01-01T10:15:00Z'),
        },
      ],
    };

    render(
      <TestWrapper>
        <RotationVictoryContent game={rotationGame} />
      </TestWrapper>
    );

    // Check if victory announcement is shown
    expect(screen.getByTestId('EmojiEventsIcon')).toBeInTheDocument();
    expect(screen.getAllByText('Rotation Winner').length).toBeGreaterThan(0);
  });

  it('should display pocketed balls by rack', () => {
    const rotationGame: Game = {
      id: 'test-rotation-balls',
      type: GameType.ROTATION,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Player A',
          score: 18,
          ballsPocketed: [1, 2, 15],
          isActive: false,
          targetScore: 50,
        },
        {
          id: 'player-2',
          name: 'Player B',
          score: 9,
          ballsPocketed: [4, 5],
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
      scoreHistory: [
        { playerId: 'player-1', score: 1, timestamp: new Date() },
        { playerId: 'player-1', score: 2, timestamp: new Date() },
        { playerId: 'player-2', score: 4, timestamp: new Date() },
        { playerId: 'player-2', score: 5, timestamp: new Date() },
        { playerId: 'player-1', score: 15, timestamp: new Date() },
      ],
    };

    render(
      <TestWrapper>
        <RotationVictoryContent game={rotationGame} />
      </TestWrapper>
    );

    // Should show pocketed balls section
    expect(screen.getByText('ポケットしたボール')).toBeInTheDocument();
    expect(screen.getByText((_, node) => {
      return node?.textContent === 'ラック 1';
    })).toBeInTheDocument();
    
    // Should show player names and ball counts
    expect(screen.getByText((_, node) => {
      return node?.textContent === 'Player A (3個)';
    })).toBeInTheDocument();
    expect(screen.getByText((_, node) => {
      return node?.textContent === 'Player B (2個)';
    })).toBeInTheDocument();
  });

  it('should display score progression chart', () => {
    const rotationGameWithChart: Game = {
      id: 'test-rotation-chart',
      type: GameType.ROTATION,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Chart Player 1',
          score: 21,
          ballsPocketed: [1, 2, 3, 15],
          isActive: false,
          targetScore: 50,
        },
        {
          id: 'player-2',
          name: 'Chart Player 2',
          score: 9,
          ballsPocketed: [4, 5],
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
      scoreHistory: [
        // Player 1's first inning (balls 1, 2, 3)
        { playerId: 'player-1', score: 1, timestamp: new Date() },
        { playerId: 'player-1', score: 2, timestamp: new Date() },
        { playerId: 'player-1', score: 3, timestamp: new Date() },
        // Player 2's inning (balls 4, 5)
        { playerId: 'player-2', score: 4, timestamp: new Date() },
        { playerId: 'player-2', score: 5, timestamp: new Date() },
        // Player 1's second inning (ball 15)
        { playerId: 'player-1', score: 15, timestamp: new Date() },
      ],
    };

    render(
      <TestWrapper>
        <RotationVictoryContent game={rotationGameWithChart} />
      </TestWrapper>
    );

    // Should show chart
    expect(screen.getByTestId('chart')).toBeInTheDocument();
    expect(screen.getByText('スコア推移')).toBeInTheDocument();
  });

  it('should handle multiple racks correctly', () => {
    const multiRackGame: Game = {
      id: 'test-multi-rack',
      type: GameType.ROTATION,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Multi Player 1',
          score: 30,
          ballsPocketed: [1, 2, 3],
          isActive: false,
          targetScore: 50,
        },
        {
          id: 'player-2',
          name: 'Multi Player 2',
          score: 20,
          ballsPocketed: [4, 5],
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
        // Rack 1: Player 1 gets 1,2,3 then Player 2 gets 4,5,6
        { playerId: 'player-1', score: 1, timestamp: new Date() },
        { playerId: 'player-1', score: 2, timestamp: new Date() },
        { playerId: 'player-1', score: 3, timestamp: new Date() },
        { playerId: 'player-2', score: 4, timestamp: new Date() },
        { playerId: 'player-2', score: 5, timestamp: new Date() },
        { playerId: 'player-2', score: 6, timestamp: new Date() },
        // Rack 2: Ball 1 appears again (new rack)
        { playerId: 'player-1', score: 1, timestamp: new Date() },
        { playerId: 'player-1', score: 2, timestamp: new Date() },
        { playerId: 'player-2', score: 5, timestamp: new Date() },
      ],
    };

    render(
      <TestWrapper>
        <RotationVictoryContent game={multiRackGame} />
      </TestWrapper>
    );

    // Should show multiple racks
    expect(screen.getByText('ポケットしたボール')).toBeInTheDocument();
    expect(screen.getByText((_, node) => {
      return node?.textContent === 'ラック 1';
    })).toBeInTheDocument();
    expect(screen.getByText((_, node) => {
      return node?.textContent === 'ラック 2';
    })).toBeInTheDocument();
  });

  it('should handle empty score history gracefully', () => {
    const emptyRotationGame: Game = {
      id: 'test-empty',
      type: GameType.ROTATION,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Empty Player 1',
          score: 0,
          ballsPocketed: [],
          isActive: false,
          targetScore: 50,
        },
        {
          id: 'player-2',
          name: 'Empty Player 2',
          score: 0,
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
        <RotationVictoryContent game={emptyRotationGame} />
      </TestWrapper>
    );

    // Should still render victory announcement and balls section
    expect(screen.getByTestId('EmojiEventsIcon')).toBeInTheDocument();
    expect(screen.getByText('ポケットしたボール')).toBeInTheDocument();
    expect(screen.getAllByText('ポケットしたボールなし').length).toBeGreaterThan(0);
  });
});