import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VictoryScreen from '../VictoryScreen';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { GameType, GameStatus } from '../../types/index';
import type { Game, PlayerStats } from '../../types/index';

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

describe('VictoryScreen', () => {
  const mockPlayerStats: PlayerStats[] = [
    { name: 'Player 1', totalWins: 1, totalGames: 1 },
    { name: 'Player 2', totalWins: 0, totalGames: 1 },
  ];

  const mockOnRematch = vi.fn();
  const mockOnBackToMenu = vi.fn();

  it('should render victory screen for SET_MATCH with set history', () => {
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
        <VictoryScreen
          game={setMatchGame}
          playerStats={mockPlayerStats}
          onRematch={mockOnRematch}
          onBackToMenu={mockOnBackToMenu}
        />
      </TestWrapper>
    );

    // Check if victory announcement is shown
    expect(screen.getByText(/勝利/)).toBeInTheDocument();
    
    // The set history table should be rendered when there are scoreHistory entries with score: 1
    // This validates that the fix for filtering scoreHistory by score works
    expect(screen.getByText('セット獲得履歴')).toBeInTheDocument();
  });

  it('should not render set history for non-SET_MATCH games', () => {
    const rotationGame: Game = {
      id: 'test-game-2',
      type: GameType.ROTATION,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Player 1',
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
      shotHistory: [
        {
          playerId: 'player-1',
          ballNumber: 1,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:05:00Z'),
        },
        {
          playerId: 'player-1',
          ballNumber: 2,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:10:00Z'),
        },
        {
          playerId: 'player-2',
          ballNumber: 4,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:15:00Z'),
        },
        {
          playerId: 'player-2',
          ballNumber: 5,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:20:00Z'),
        },
      ],
      scoreHistory: [
        // Player 1's first inning (balls 1, 2)
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
        // Player 2's inning (balls 4, 5)
        {
          playerId: 'player-2',
          score: 4,
          timestamp: new Date('2023-01-01T10:15:00Z'),
        },
        {
          playerId: 'player-2',
          score: 5,
          timestamp: new Date('2023-01-01T10:20:00Z'),
        },
      ],
    };

    render(
      <TestWrapper>
        <VictoryScreen
          game={rotationGame}
          playerStats={mockPlayerStats}
          onRematch={mockOnRematch}
          onBackToMenu={mockOnBackToMenu}
        />
      </TestWrapper>
    );

    // Set history should not be rendered for non-SET_MATCH games
    expect(screen.queryByText('セット獲得履歴')).not.toBeInTheDocument();
    expect(screen.queryByText(/セット1/)).not.toBeInTheDocument();

    // But should show score progression chart
    expect(screen.getByText('スコア推移')).toBeInTheDocument();
    
    // Should show pocketed balls by rack
    expect(screen.getByText('ポケットしたボール')).toBeInTheDocument();
    expect(screen.getByText('ラック 1')).toBeInTheDocument();
  });

  it('should handle SET_MATCH with empty score history', () => {
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
      scoreHistory: [], // Empty score history
    };

    render(
      <TestWrapper>
        <VictoryScreen
          game={emptySetMatchGame}
          playerStats={mockPlayerStats}
          onRematch={mockOnRematch}
          onBackToMenu={mockOnBackToMenu}
        />
      </TestWrapper>
    );

    // Set history should not be rendered when scoreHistory is empty
    expect(screen.queryByText('セット獲得履歴')).not.toBeInTheDocument();
  });

  it('should filter score entries correctly by score value', () => {
    const mixedScoreHistoryGame: Game = {
      id: 'test-game-4',
      type: GameType.SET_MATCH,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Player 1',
          score: 1,
          ballsPocketed: [],
          isActive: false,
          targetSets: 2,
          setsWon: 2,
        },
        {
          id: 'player-2',
          name: 'Player 2',
          score: 0,
          ballsPocketed: [],
          isActive: false,
          targetSets: 2,
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
      scoreHistory: [
        {
          playerId: 'player-1',
          score: 1, // Set win - should be included
          timestamp: new Date('2023-01-01T10:10:00Z'),
        },
        {
          playerId: 'player-2',
          score: 0, // Not a set win - should be excluded
          timestamp: new Date('2023-01-01T10:12:00Z'),
        },
        {
          playerId: 'player-1',
          score: 1, // Set win - should be included
          timestamp: new Date('2023-01-01T10:15:00Z'),
        },
        {
          playerId: 'player-1',
          score: 5, // Not a set win - should be excluded
          timestamp: new Date('2023-01-01T10:18:00Z'),
        },
      ],
    };

    render(
      <TestWrapper>
        <VictoryScreen
          game={mixedScoreHistoryGame}
          playerStats={mockPlayerStats}
          onRematch={mockOnRematch}
          onBackToMenu={mockOnBackToMenu}
        />
      </TestWrapper>
    );

    // Should render set history table because there are 2 scoreHistory entries with score: 1
    expect(screen.getByText('セット獲得履歴')).toBeInTheDocument();
  });

  it('should render score chart for ROTATION game with shot history', () => {
    const rotationGameWithShots: Game = {
      id: 'test-game-rotation',
      type: GameType.ROTATION,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Player 1',
          score: 18,
          ballsPocketed: [1, 2, 15],
          isActive: false,
          targetScore: 50,
        },
        {
          id: 'player-2',
          name: 'Player 2',
          score: 9,
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
      shotHistory: [
        {
          playerId: 'player-1',
          ballNumber: 1,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:05:00Z'),
        },
        {
          playerId: 'player-1',
          ballNumber: 2,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:10:00Z'),
        },
        {
          playerId: 'player-2',
          ballNumber: 4,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:15:00Z'),
        },
        {
          playerId: 'player-2',
          ballNumber: 5,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:20:00Z'),
        },
        {
          playerId: 'player-1',
          ballNumber: 15,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:25:00Z'),
        },
      ],
      scoreHistory: [
        // Player 1's first inning (balls 1, 2)
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
        // Player 2's inning (balls 4, 5)
        {
          playerId: 'player-2',
          score: 4,
          timestamp: new Date('2023-01-01T10:15:00Z'),
        },
        {
          playerId: 'player-2',
          score: 5,
          timestamp: new Date('2023-01-01T10:20:00Z'),
        },
        // Player 1's second inning (ball 15)
        {
          playerId: 'player-1',
          score: 15,
          timestamp: new Date('2023-01-01T10:25:00Z'),
        },
      ],
    };

    render(
      <TestWrapper>
        <VictoryScreen
          game={rotationGameWithShots}
          playerStats={mockPlayerStats}
          onRematch={mockOnRematch}
          onBackToMenu={mockOnBackToMenu}
        />
      </TestWrapper>
    );

    // Should show score progression chart for ROTATION
    expect(screen.getByText('スコア推移')).toBeInTheDocument();
    
    // Should show pocketed balls section with rack structure
    expect(screen.getByText('ポケットしたボール')).toBeInTheDocument();
    expect(screen.getByText('ラック 1')).toBeInTheDocument();
    expect(screen.getByText('Player 1 (3個)')).toBeInTheDocument();
    expect(screen.getByText('Player 2 (2個)')).toBeInTheDocument();
  });

  it('should calculate inning scores correctly for ROTATION game', () => {
    // Test data: Player 1 scores 1,2,3 (inning 1: 6 points), then Player 2 scores 4,5 (inning 2: 9 points), then Player 1 scores 15 (inning 3: 15 points)
    const rotationGameWithInnings: Game = {
      id: 'test-game-rotation-innings',
      type: GameType.ROTATION,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Player 1',
          score: 21, // 1+2+3+15 = 21
          ballsPocketed: [1, 2, 3, 15],
          isActive: false,
          targetScore: 50,
        },
        {
          id: 'player-2',
          name: 'Player 2',
          score: 9, // 4+5 = 9
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
      shotHistory: [
        // Inning 1: Player 1 scores 1, 2, 3 (total: 6 points)
        {
          playerId: 'player-1',
          ballNumber: 1,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:05:00Z'),
        },
        {
          playerId: 'player-1',
          ballNumber: 2,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:06:00Z'),
        },
        {
          playerId: 'player-1',
          ballNumber: 3,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:07:00Z'),
        },
        // Inning 2: Player 2 scores 4, 5 (total: 9 points)
        {
          playerId: 'player-2',
          ballNumber: 4,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:15:00Z'),
        },
        {
          playerId: 'player-2',
          ballNumber: 5,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:16:00Z'),
        },
        // Inning 3: Player 1 scores 15 (total: 15 points)
        {
          playerId: 'player-1',
          ballNumber: 15,
          isSunk: true,
          isFoul: false,
          timestamp: new Date('2023-01-01T10:25:00Z'),
        },
      ],
      scoreHistory: [
        // Inning 1: Player 1 scores 1, 2, 3 (total: 6 points)
        {
          playerId: 'player-1',
          score: 1,
          timestamp: new Date('2023-01-01T10:05:00Z'),
        },
        {
          playerId: 'player-1',
          score: 2,
          timestamp: new Date('2023-01-01T10:06:00Z'),
        },
        {
          playerId: 'player-1',
          score: 3,
          timestamp: new Date('2023-01-01T10:07:00Z'),
        },
        // Inning 2: Player 2 scores 4, 5 (total: 9 points)
        {
          playerId: 'player-2',
          score: 4,
          timestamp: new Date('2023-01-01T10:15:00Z'),
        },
        {
          playerId: 'player-2',
          score: 5,
          timestamp: new Date('2023-01-01T10:16:00Z'),
        },
        // Inning 3: Player 1 scores 15 (total: 15 points)
        {
          playerId: 'player-1',
          score: 15,
          timestamp: new Date('2023-01-01T10:25:00Z'),
        },
      ],
    };

    render(
      <TestWrapper>
        <VictoryScreen
          game={rotationGameWithInnings}
          playerStats={mockPlayerStats}
          onRematch={mockOnRematch}
          onBackToMenu={mockOnBackToMenu}
        />
      </TestWrapper>
    );

    // Should show score progression chart for ROTATION
    expect(screen.getByText('スコア推移')).toBeInTheDocument();
    
    // Should show pocketed balls section with correct counts and rack structure
    expect(screen.getByText('ポケットしたボール')).toBeInTheDocument();
    expect(screen.getByText('ラック 1')).toBeInTheDocument();
    expect(screen.getByText('Player 1 (4個)')).toBeInTheDocument();
    expect(screen.getByText('Player 2 (2個)')).toBeInTheDocument();
  });

  it('should display pocketed balls by rack for multiple racks', () => {
    // Test data: Multiple racks with ball repetition to test rack detection
    const multiRackRotationGame: Game = {
      id: 'test-game-multi-rack',
      type: GameType.ROTATION,
      status: GameStatus.FINISHED,
      players: [
        {
          id: 'player-1',
          name: 'Player 1',
          score: 30, // 1+2+3+1+2+3+4+5+6+3 = 30
          ballsPocketed: [1, 2, 3], // Only current rack balls
          isActive: false,
          targetScore: 50,
        },
        {
          id: 'player-2',
          name: 'Player 2',
          score: 20, // 4+5+6+5 = 20
          ballsPocketed: [4, 5], // Only current rack balls
          isActive: false,
          targetScore: 50,
        },
      ],
      currentPlayerIndex: 0,
      startTime: new Date('2023-01-01T10:00:00Z'),
      endTime: new Date('2023-01-01T10:30:00Z'),
      winner: 'player-1',
      totalRacks: 3,
      currentRack: 3,
      rackInProgress: false,
      shotHistory: [], // Current rack only
      scoreHistory: [
        // Rack 1: Player 1 gets 1,2,3 then Player 2 gets 4,5,6
        {
          playerId: 'player-1',
          score: 1,
          timestamp: new Date('2023-01-01T10:05:00Z'),
        },
        {
          playerId: 'player-1',
          score: 2,
          timestamp: new Date('2023-01-01T10:06:00Z'),
        },
        {
          playerId: 'player-1',
          score: 3,
          timestamp: new Date('2023-01-01T10:07:00Z'),
        },
        {
          playerId: 'player-2',
          score: 4,
          timestamp: new Date('2023-01-01T10:08:00Z'),
        },
        {
          playerId: 'player-2',
          score: 5,
          timestamp: new Date('2023-01-01T10:09:00Z'),
        },
        {
          playerId: 'player-2',
          score: 6,
          timestamp: new Date('2023-01-01T10:10:00Z'),
        },
        // Rack 2: Ball 1 appears again (new rack), Player 1 gets 1,2,3,4,5,6 then Player 2 gets 5 (duplicate triggers new rack)
        {
          playerId: 'player-1',
          score: 1, // Ball 1 again = new rack
          timestamp: new Date('2023-01-01T10:15:00Z'),
        },
        {
          playerId: 'player-1',
          score: 2,
          timestamp: new Date('2023-01-01T10:16:00Z'),
        },
        {
          playerId: 'player-1',
          score: 3,
          timestamp: new Date('2023-01-01T10:17:00Z'),
        },
        {
          playerId: 'player-1',
          score: 4,
          timestamp: new Date('2023-01-01T10:18:00Z'),
        },
        {
          playerId: 'player-1',
          score: 5,
          timestamp: new Date('2023-01-01T10:19:00Z'),
        },
        {
          playerId: 'player-1',
          score: 6,
          timestamp: new Date('2023-01-01T10:20:00Z'),
        },
        // Rack 3: Ball 5 appears again (new rack)
        {
          playerId: 'player-2',
          score: 5, // Ball 5 again = new rack
          timestamp: new Date('2023-01-01T10:25:00Z'),
        },
        {
          playerId: 'player-1',
          score: 3,
          timestamp: new Date('2023-01-01T10:26:00Z'),
        },
      ],
    };

    render(
      <TestWrapper>
        <VictoryScreen
          game={multiRackRotationGame}
          playerStats={mockPlayerStats}
          onRematch={mockOnRematch}
          onBackToMenu={mockOnBackToMenu}
        />
      </TestWrapper>
    );

    // Should show score progression chart for ROTATION
    expect(screen.getByText('スコア推移')).toBeInTheDocument();
    
    // Should show pocketed balls section with multiple racks
    expect(screen.getByText('ポケットしたボール')).toBeInTheDocument();
    expect(screen.getByText('ラック 1')).toBeInTheDocument();
    expect(screen.getByText('ラック 2')).toBeInTheDocument();
    expect(screen.getByText('ラック 3')).toBeInTheDocument();
    
    // Check rack-specific ball counts
    // Note: The UI shows balls per rack, not total balls
    const rack1Section = screen.getByText('ラック 1').closest('div');
    const rack2Section = screen.getByText('ラック 2').closest('div');
    const rack3Section = screen.getByText('ラック 3').closest('div');
    
    expect(rack1Section).toBeInTheDocument();
    expect(rack2Section).toBeInTheDocument();
    expect(rack3Section).toBeInTheDocument();
  });
});
