import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { GameType, GameStatus } from '../../../types/index';
import type { Game } from '../../../types/index';
import SetMatchVictoryContent from '../SetMatchVictoryContent';

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

describe('SetMatchVictoryContent', () => {
  it('should render victory announcement with winner', () => {
    const setMatchGame: Game = {
      id: 'test-game-1',
      type: GameType.SET_MATCH,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Player 1',
          score: 1,
          ballsPocketed: [],
          isActive: false,
          targetSets: 3,
          setsWon: 3,
        },
        {
          id: 'player-2',
          name: 'Player 2',
          score: 0,
          ballsPocketed: [],
          isActive: false,
          targetSets: 3,
          setsWon: 1,
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
          timestamp: new Date('2023-01-01T10:10:00Z'),
        },
        {
          playerId: 'player-2',
          score: 1,
          timestamp: new Date('2023-01-01T10:15:00Z'),
        },
        {
          playerId: 'player-1',
          score: 1,
          timestamp: new Date('2023-01-01T10:20:00Z'),
        },
        {
          playerId: 'player-1',
          score: 1,
          timestamp: new Date('2023-01-01T10:25:00Z'),
        },
      ],
    };

    render(
      <TestWrapper>
        <SetMatchVictoryContent game={setMatchGame} />
      </TestWrapper>
    );

    // Check if victory announcement is shown
    expect(screen.getByTestId('EmojiEventsIcon')).toBeInTheDocument();
    expect(screen.getAllByText('Player 1').length).toBeGreaterThan(0);
    
    // Check if SetHistory table is rendered
    const tables = screen.getAllByRole('table');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('should display set history table', () => {
    const setMatchGame: Game = {
      id: 'test-game-2',
      type: GameType.SET_MATCH,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Test Player 1',
          score: 2,
          ballsPocketed: [],
          isActive: false,
          targetSets: 5,
          setsWon: 3,
        },
        {
          id: 'player-2',
          name: 'Test Player 2',
          score: 1,
          ballsPocketed: [],
          isActive: false,
          targetSets: 5,
          setsWon: 2,
        },
      ],
      currentPlayerIndex: 0,
      startTime: new Date('2023-01-01T10:00:00Z'),
      endTime: new Date('2023-01-01T10:45:00Z'),
      winner: 'player-1',
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [
        { playerId: 'player-1', score: 1, timestamp: new Date('2023-01-01T10:10:00Z') },
        { playerId: 'player-1', score: 1, timestamp: new Date('2023-01-01T10:20:00Z') },
        { playerId: 'player-2', score: 1, timestamp: new Date('2023-01-01T10:25:00Z') },
        { playerId: 'player-2', score: 1, timestamp: new Date('2023-01-01T10:35:00Z') },
        { playerId: 'player-1', score: 1, timestamp: new Date('2023-01-01T10:40:00Z') },
      ],
    };

    render(
      <TestWrapper>
        <SetMatchVictoryContent game={setMatchGame} />
      </TestWrapper>
    );

    // Should render set history table
    const tables = screen.getAllByRole('table');
    expect(tables.length).toBeGreaterThan(0);
    
    // Should display both players
    expect(screen.getAllByText('Test Player 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Test Player 2').length).toBeGreaterThan(0);
  });

  it('should handle empty score history', () => {
    const emptySetMatchGame: Game = {
      id: 'test-game-3',
      type: GameType.SET_MATCH,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Player 1',
          score: 0,
          ballsPocketed: [],
          isActive: false,
          targetSets: 3,
          setsWon: 0,
        },
        {
          id: 'player-2',
          name: 'Player 2',
          score: 0,
          ballsPocketed: [],
          isActive: false,
          targetSets: 3,
          setsWon: 0,
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
      scoreHistory: [],
    };

    render(
      <TestWrapper>
        <SetMatchVictoryContent game={emptySetMatchGame} />
      </TestWrapper>
    );

    // Should still render victory announcement and table
    expect(screen.getByTestId('EmojiEventsIcon')).toBeInTheDocument();
    const tables = screen.getAllByRole('table');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('should display winner with crown emoji', () => {
    const setMatchGame: Game = {
      id: 'test-crown',
      type: GameType.SET_MATCH,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'winner-player',
          name: 'Champion',
          score: 1,
          ballsPocketed: [],
          isActive: false,
          targetSets: 3,
          setsWon: 3,
        },
        {
          id: 'loser-player',
          name: 'Runner Up',
          score: 0,
          ballsPocketed: [],
          isActive: false,
          targetSets: 3,
          setsWon: 2,
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
      scoreHistory: [
        { playerId: 'winner-player', score: 1, timestamp: new Date() },
        { playerId: 'winner-player', score: 1, timestamp: new Date() },
        { playerId: 'winner-player', score: 1, timestamp: new Date() },
      ],
    };

    render(
      <TestWrapper>
        <SetMatchVictoryContent game={setMatchGame} />
      </TestWrapper>
    );

    // Should display champion name in victory announcement
    expect(screen.getAllByText('Champion').length).toBeGreaterThan(0);
    expect(screen.getByTestId('EmojiEventsIcon')).toBeInTheDocument();
  });
});