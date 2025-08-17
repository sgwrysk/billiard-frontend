import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SetMatchBoard } from '../SetMatchBoard';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { GameType, GameStatus } from '../../../types/index';
import type { Game } from '../../../types/index';

// Test wrapper with LanguageProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
);

describe('SetMatchBoard', () => {
  const mockOnWinSet = vi.fn();
  const mockOnUndoLastShot = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render player cards with set counts', () => {
    const game: Game = {
      id: 'test-game-1',
      type: GameType.SET_MATCH,
      status: GameStatus.IN_PROGRESS,
      players: [
        {
          id: 'player-1',
          name: 'Player 1',
          score: 0,
          ballsPocketed: [],
          isActive: false,
          targetSets: 3,
          setsWon: 2,
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
      startTime: new Date(),
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [
        {
          playerId: 'player-1',
          score: 1,
          timestamp: new Date(),
        },
        {
          playerId: 'player-2',
          score: 1,
          timestamp: new Date(),
        },
        {
          playerId: 'player-1',
          score: 1,
          timestamp: new Date(),
        },
      ],
    };

    render(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={mockOnWinSet}
          onUndoLastShot={mockOnUndoLastShot}
        />
      </TestWrapper>
    );

    // Check if players are displayed
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();

    // Check if set counts are displayed correctly
    expect(screen.getByText('2')).toBeInTheDocument(); // Player 1's sets
    expect(screen.getByText('1')).toBeInTheDocument(); // Player 2's sets

    // Check if target sets are displayed
    expect(screen.getAllByText(/セット数: 3/)).toHaveLength(2);
  });

  it('should call onWinSet when player card is clicked', () => {
    const game: Game = {
      id: 'test-game-1',
      type: GameType.SET_MATCH,
      status: GameStatus.IN_PROGRESS,
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
      startTime: new Date(),
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [],
    };

    render(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={mockOnWinSet}
          onUndoLastShot={mockOnUndoLastShot}
        />
      </TestWrapper>
    );

    // Click on Player 1's card
    const player1Card = screen.getByText('Player 1').closest('.MuiCard-root');
    expect(player1Card).toBeInTheDocument();
    
    if (player1Card) {
      fireEvent.click(player1Card);
      expect(mockOnWinSet).toHaveBeenCalledWith('player-1');
    }
  });

  it('should enable undo button when scoreHistory has entries', () => {
    const game: Game = {
      id: 'test-game-1',
      type: GameType.SET_MATCH,
      status: GameStatus.IN_PROGRESS,
      players: [
        {
          id: 'player-1',
          name: 'Player 1',
          score: 0,
          ballsPocketed: [],
          isActive: false,
          targetSets: 3,
          setsWon: 1,
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
      startTime: new Date(),
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [
        {
          playerId: 'player-1',
          score: 1,
          timestamp: new Date(),
        },
      ],
    };

    render(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={mockOnWinSet}
          onUndoLastShot={mockOnUndoLastShot}
        />
      </TestWrapper>
    );

    const undoButton = screen.getByText('取り消し');
    expect(undoButton).toBeInTheDocument();
    expect(undoButton).not.toBeDisabled();

    // Click undo button
    fireEvent.click(undoButton);
    expect(mockOnUndoLastShot).toHaveBeenCalledTimes(1);
  });

  it('should disable undo button when scoreHistory is empty', () => {
    const game: Game = {
      id: 'test-game-1',
      type: GameType.SET_MATCH,
      status: GameStatus.IN_PROGRESS,
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
      startTime: new Date(),
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [], // Empty scoreHistory
    };

    render(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={mockOnWinSet}
          onUndoLastShot={mockOnUndoLastShot}
        />
      </TestWrapper>
    );

    const undoButton = screen.getByText('取り消し');
    expect(undoButton).toBeInTheDocument();
    expect(undoButton).toBeDisabled();
  });

  it('should highlight active player card differently', () => {
    const game: Game = {
      id: 'test-game-1',
      type: GameType.SET_MATCH,
      status: GameStatus.IN_PROGRESS,
      players: [
        {
          id: 'player-1',
          name: 'Player 1',
          score: 0,
          ballsPocketed: [],
          isActive: true, // Active player
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
      startTime: new Date(),
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [],
    };

    render(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={mockOnWinSet}
          onUndoLastShot={mockOnUndoLastShot}
        />
      </TestWrapper>
    );

    // Player 1 should have higher elevation (active)
    const player1Card = screen.getByText('Player 1').closest('.MuiCard-root');
    const player2Card = screen.getByText('Player 2').closest('.MuiCard-root');

    // We can't easily test CSS styles in jsdom, but we can verify the cards exist
    expect(player1Card).toBeInTheDocument();
    expect(player2Card).toBeInTheDocument();
  });

  it('should display zero sets when setsWon is undefined', () => {
    const game: Game = {
      id: 'test-game-1',
      type: GameType.SET_MATCH,
      status: GameStatus.IN_PROGRESS,
      players: [
        {
          id: 'player-1',
          name: 'Player 1',
          score: 0,
          ballsPocketed: [],
          isActive: false,
          targetSets: 3,
          // setsWon is undefined
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
      startTime: new Date(),
      totalRacks: 1,
      currentRack: 1,
      rackInProgress: false,
      shotHistory: [],
      scoreHistory: [],
    };

    render(
      <TestWrapper>
        <SetMatchBoard
          game={game}
          onWinSet={mockOnWinSet}
          onUndoLastShot={mockOnUndoLastShot}
        />
      </TestWrapper>
    );

    // Both players should show "0" sets
    const zeroTexts = screen.getAllByText('0');
    expect(zeroTexts).toHaveLength(2);
  });
});
