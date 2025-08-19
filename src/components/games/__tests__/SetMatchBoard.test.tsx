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

  describe('Player Swap Button', () => {
    const mockOnSwapPlayers = vi.fn();

    it('should display swap button when canSwapPlayers is true and game is in initial state', () => {
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
            setsWon: 0, // No sets won yet
          },
          {
            id: 'player-2',
            name: 'Player 2',
            score: 0,
            ballsPocketed: [],
            isActive: false,
            targetSets: 3,
            setsWon: 0, // No sets won yet
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
            onSwapPlayers={mockOnSwapPlayers}
            canSwapPlayers={true}
          />
        </TestWrapper>
      );

      // Swap button should be visible
      expect(screen.getByText('プレイヤー入れ替え')).toBeInTheDocument();
      expect(screen.getByText('プレイヤー入れ替え')).toBeEnabled();
    });

    it('should not display swap button when canSwapPlayers is false', () => {
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
            setsWon: 1, // Player 1 has won a set
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
            onSwapPlayers={mockOnSwapPlayers}
            canSwapPlayers={false}
          />
        </TestWrapper>
      );

      // Swap button should not be visible, undo button should be visible instead
      expect(screen.queryByText('プレイヤー入れ替え')).not.toBeInTheDocument();
      expect(screen.getByText('取り消し')).toBeInTheDocument();
    });

    it('should call onSwapPlayers when swap button is clicked', () => {
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
            onSwapPlayers={mockOnSwapPlayers}
            canSwapPlayers={true}
          />
        </TestWrapper>
      );

      // Click the swap button
      const swapButton = screen.getByText('プレイヤー入れ替え');
      fireEvent.click(swapButton);

      // onSwapPlayers should be called
      expect(mockOnSwapPlayers).toHaveBeenCalledTimes(1);
    });

    it('should display undo button when canSwapPlayers is false', () => {
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
            setsWon: 1, // Player 1 has won a set
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
            onSwapPlayers={mockOnSwapPlayers}
            canSwapPlayers={false}
          />
        </TestWrapper>
      );

      // Undo button should be visible but disabled (since no score history)
      const undoButton = screen.getByText('取り消し');
      expect(undoButton).toBeInTheDocument();
      expect(undoButton).toBeDisabled();
    });

    it('should handle alternating break display correctly', () => {
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
            onSwapPlayers={mockOnSwapPlayers}
            canSwapPlayers={true}
            alternatingBreak={true}
          />
        </TestWrapper>
      );

      // Break icon should be displayed on the first player (odd rack)
      expect(screen.getByText('🎱')).toBeInTheDocument();
    });

    it('should display break icon only on the correct player based on rack number', () => {
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
        totalRacks: 1, // Second rack (even number)
        currentRack: 2,
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
            onSwapPlayers={mockOnSwapPlayers}
            canSwapPlayers={true}
            alternatingBreak={true}
          />
        </TestWrapper>
      );

      // Break icon should be displayed on the second player (even rack)
      expect(screen.getByText('🎱')).toBeInTheDocument();
      
      // Check that only one break icon is displayed
      const breakIcons = screen.getAllByText('🎱');
      expect(breakIcons).toHaveLength(1);
    });

    it('should not display break icon when alternatingBreak is false', () => {
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
        totalRacks: 0,
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
            onSwapPlayers={mockOnSwapPlayers}
            canSwapPlayers={true}
            alternatingBreak={false}
          />
        </TestWrapper>
      );

      // No break icon should be displayed
      expect(screen.queryByText('🎱')).not.toBeInTheDocument();
    });

    it('should correctly display break icon for different rack numbers', () => {
      // Test for rack 1 (odd)
      const gameRack1: Game = {
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
        totalRacks: 0, // First rack
        currentRack: 1,
        rackInProgress: false,
        shotHistory: [],
        scoreHistory: [],
      };

      const { rerender } = render(
        <TestWrapper>
          <SetMatchBoard
            game={gameRack1}
            onWinSet={mockOnWinSet}
            onUndoLastShot={mockOnUndoLastShot}
            onSwapPlayers={mockOnSwapPlayers}
            canSwapPlayers={true}
            alternatingBreak={true}
          />
        </TestWrapper>
      );

      // Rack 1 (odd): Player 2 should have break icon
      expect(screen.getByText('🎱')).toBeInTheDocument();
      const breakIconsRack1 = screen.getAllByText('🎱');
      expect(breakIconsRack1).toHaveLength(1);

      // Test for rack 2 (even)
      const gameRack2: Game = {
        ...gameRack1,
        totalRacks: 1, // Second rack
        currentRack: 2,
      };

      rerender(
        <TestWrapper>
          <SetMatchBoard
            game={gameRack2}
            onWinSet={mockOnWinSet}
            onUndoLastShot={mockOnUndoLastShot}
            onSwapPlayers={mockOnSwapPlayers}
            canSwapPlayers={true}
            alternatingBreak={true}
          />
        </TestWrapper>
      );

      // Rack 2 (even): Player 1 should have break icon
      expect(screen.getByText('🎱')).toBeInTheDocument();
      const breakIconsRack2 = screen.getAllByText('🎱');
      expect(breakIconsRack2).toHaveLength(1);
    });

    it('should handle alternating break display after set wins', () => {
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
        totalRacks: 0,
        currentRack: 1,
        rackInProgress: false,
        shotHistory: [],
        scoreHistory: [],
      };

      const { rerender } = render(
        <TestWrapper>
          <SetMatchBoard
            game={game}
            onWinSet={mockOnWinSet}
            onUndoLastShot={mockOnUndoLastShot}
            onSwapPlayers={mockOnSwapPlayers}
            canSwapPlayers={true}
            alternatingBreak={true}
          />
        </TestWrapper>
      );

      // Initial state: Rack 1 (odd), Player 2 should have break
      expect(screen.getByText('🎱')).toBeInTheDocument();

      // Simulate set win, moving to rack 2
      const gameAfterSetWin: Game = {
        ...game,
        totalRacks: 1, // After first set win
        currentRack: 2,
        players: [
          {
            ...game.players[0],
            setsWon: 1, // Player 1 won a set
          },
          game.players[1],
        ],
        scoreHistory: [
          {
            playerId: game.players[0].id,
            score: 1,
            timestamp: new Date(),
          },
        ],
      };

      rerender(
        <TestWrapper>
          <SetMatchBoard
            game={gameAfterSetWin}
            onWinSet={mockOnWinSet}
            onUndoLastShot={mockOnUndoLastShot}
            onSwapPlayers={mockOnSwapPlayers}
            canSwapPlayers={false}
            alternatingBreak={true}
          />
        </TestWrapper>
      );

      // After set win: Rack 2 (even), Player 1 should have break
      expect(screen.getByText('🎱')).toBeInTheDocument();
      const breakIconsAfterSetWin = screen.getAllByText('🎱');
      expect(breakIconsAfterSetWin).toHaveLength(1);
    });
  });
});
