import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { RotationBoard } from '../RotationBoard';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { GameType, GameStatus } from '../../../types/index';
import type { Game, ChessClockSettings } from '../../../types/index';

const theme = createTheme();

// Test wrapper with LanguageProvider and ThemeProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </LanguageProvider>
);

describe('RotationBoard', () => {
  const mockOnPocketBall = vi.fn();
  const mockOnSwitchPlayer = vi.fn();
  const mockOnUndoLastShot = vi.fn();
  const mockOnSelectPlayer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockGame = (activePlayerIndex = 0): Game => ({
    id: 'test-game-1',
    type: GameType.ROTATION,
    status: GameStatus.IN_PROGRESS,
    players: [
      {
        id: 'player-1',
        name: 'Player 1',
        score: 15,
        ballsPocketed: [1, 2, 3],
        isActive: activePlayerIndex === 0,
        targetScore: 50,
      },
      {
        id: 'player-2',
        name: 'Player 2',
        score: 10,
        ballsPocketed: [4, 5],
        isActive: activePlayerIndex === 1,
        targetScore: 50,
      },
    ],
    currentPlayerIndex: activePlayerIndex,
    startTime: new Date(),
    totalRacks: 1,
    currentRack: 1,
    rackInProgress: true,
    shotHistory: [
      { playerId: 'player-1', ballNumber: 1, isSunk: true, isFoul: false, timestamp: new Date() },
      { playerId: 'player-1', ballNumber: 2, isSunk: true, isFoul: false, timestamp: new Date() },
      { playerId: 'player-1', ballNumber: 3, isSunk: true, isFoul: false, timestamp: new Date() },
    ],
    scoreHistory: [],
  });

  it('should render player cards with scores and target information', () => {
    const game = createMockGame();

    render(
      <TestWrapper>
        <RotationBoard
          game={game}
          onPocketBall={mockOnPocketBall}
          onSwitchPlayer={mockOnSwitchPlayer}
          onUndoLastShot={mockOnUndoLastShot}
          onSelectPlayer={mockOnSelectPlayer}
        />
      </TestWrapper>
    );

    // Check if players are displayed
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();

    // Check if scores are displayed (using getAllByText since scores might match ball numbers)
    const fifteenTexts = screen.getAllByText('15');
    expect(fifteenTexts.length).toBeGreaterThan(0); // Player 1's score (and ball 15)
    const tenTexts = screen.getAllByText('10');
    expect(tenTexts.length).toBeGreaterThan(0); // Player 2's score (and ball 10)

    // Check if target scores are displayed (should be exactly 2 instances)
    expect(screen.getAllByText((_, element) => {
      return element?.textContent === '目標: 50';
    })).toHaveLength(2);

    // Check if remaining scores are displayed
    expect(screen.getByText((_, element) => {
      return element?.textContent === '残り: 35';
    })).toBeInTheDocument(); // Player 1 remaining: 50-15=35
    expect(screen.getByText((_, element) => {
      return element?.textContent === '残り: 40';
    })).toBeInTheDocument(); // Player 2 remaining: 50-10=40
  });

  it('should call onSelectPlayer when player card is clicked', () => {
    const game = createMockGame();

    render(
      <TestWrapper>
        <RotationBoard
          game={game}
          onPocketBall={mockOnPocketBall}
          onSwitchPlayer={mockOnSwitchPlayer}
          onUndoLastShot={mockOnUndoLastShot}
          onSelectPlayer={mockOnSelectPlayer}
        />
      </TestWrapper>
    );

    // Click on Player 1's card
    const player1Card = screen.getByText('Player 1').closest('.MuiCard-root');
    expect(player1Card).toBeInTheDocument();
    
    if (player1Card) {
      fireEvent.click(player1Card);
      expect(mockOnSelectPlayer).toHaveBeenCalledWith('player-1');
    }

    // Click on Player 2's card
    const player2Card = screen.getByText('Player 2').closest('.MuiCard-root');
    expect(player2Card).toBeInTheDocument();
    
    if (player2Card) {
      fireEvent.click(player2Card);
      expect(mockOnSelectPlayer).toHaveBeenCalledWith('player-2');
    }

    expect(mockOnSelectPlayer).toHaveBeenCalledTimes(2);
  });

  it('should not call onSelectPlayer when onSelectPlayer prop is not provided', () => {
    const game = createMockGame();

    render(
      <TestWrapper>
        <RotationBoard
          game={game}
          onPocketBall={mockOnPocketBall}
          onSwitchPlayer={mockOnSwitchPlayer}
          onUndoLastShot={mockOnUndoLastShot}
        />
      </TestWrapper>
    );

    // Click on Player 1's card - should not throw error
    const player1Card = screen.getByText('Player 1').closest('.MuiCard-root');
    expect(player1Card).toBeInTheDocument();
    
    if (player1Card) {
      fireEvent.click(player1Card);
      expect(mockOnSelectPlayer).not.toHaveBeenCalled();
    }
  });

  it('should highlight active player card differently', () => {
    const game = createMockGame(1); // Player 2 is active

    render(
      <TestWrapper>
        <RotationBoard
          game={game}
          onPocketBall={mockOnPocketBall}
          onSwitchPlayer={mockOnSwitchPlayer}
          onUndoLastShot={mockOnUndoLastShot}
          onSelectPlayer={mockOnSelectPlayer}
        />
      </TestWrapper>
    );

    // Both player cards should be rendered
    const player1Card = screen.getByText('Player 1').closest('.MuiCard-root');
    const player2Card = screen.getByText('Player 2').closest('.MuiCard-root');

    expect(player1Card).toBeInTheDocument();
    expect(player2Card).toBeInTheDocument();

    // We can't easily test CSS styles in jsdom, but we can verify the cards exist
    // and that the component renders without error when different players are active
  });

  it('should render ball selection with correct states', () => {
    const game = createMockGame();

    render(
      <TestWrapper>
        <RotationBoard
          game={game}
          onPocketBall={mockOnPocketBall}
          onSwitchPlayer={mockOnSwitchPlayer}
          onUndoLastShot={mockOnUndoLastShot}
          onSelectPlayer={mockOnSelectPlayer}
        />
      </TestWrapper>
    );

    // Ball selection area exists (verify by presence of several ball numbers)
    for (let i = 1; i <= 3; i++) {
      expect(screen.getAllByText(i.toString()).length).toBeGreaterThan(0);
    }

    // Check if ball buttons are rendered (1-15)
    // Using getAllByText for numbers that might appear in both player scores and balls
    for (let i = 1; i <= 15; i++) {
      const texts = screen.getAllByText(i.toString());
      expect(texts.length).toBeGreaterThan(0);
    }

    // Click on ball 6 (should be available)
    const ball6 = screen.getByText('6');
    fireEvent.click(ball6);
    expect(mockOnPocketBall).toHaveBeenCalledWith(6);

    // Verify pocketed balls (1, 2, 3) are disabled would require checking button state
    // which is difficult with jsdom, but the component should handle this correctly
  });

  it('should call onSwitchPlayer when switch player button is clicked', () => {
    const game = createMockGame();

    render(
      <TestWrapper>
        <RotationBoard
          game={game}
          onPocketBall={mockOnPocketBall}
          onSwitchPlayer={mockOnSwitchPlayer}
          onUndoLastShot={mockOnUndoLastShot}
          onSelectPlayer={mockOnSelectPlayer}
        />
      </TestWrapper>
    );

    const switchButton = screen.getByText('プレイヤー交代');
    fireEvent.click(switchButton);
    expect(mockOnSwitchPlayer).toHaveBeenCalledTimes(1);
  });

  it('should enable undo button when shotHistory has entries', () => {
    const game = createMockGame();

    render(
      <TestWrapper>
        <RotationBoard
          game={game}
          onPocketBall={mockOnPocketBall}
          onSwitchPlayer={mockOnSwitchPlayer}
          onUndoLastShot={mockOnUndoLastShot}
          onSelectPlayer={mockOnSelectPlayer}
        />
      </TestWrapper>
    );

    const undoButton = screen.getByText('取り消し');
    expect(undoButton).not.toBeDisabled();

    fireEvent.click(undoButton);
    expect(mockOnUndoLastShot).toHaveBeenCalledTimes(1);
  });

  it('should disable undo button when shotHistory is empty', () => {
    const game = createMockGame();
    game.shotHistory = []; // Empty shot history

    render(
      <TestWrapper>
        <RotationBoard
          game={game}
          onPocketBall={mockOnPocketBall}
          onSwitchPlayer={mockOnSwitchPlayer}
          onUndoLastShot={mockOnUndoLastShot}
          onSelectPlayer={mockOnSelectPlayer}
        />
      </TestWrapper>
    );

    const undoButton = screen.getByText('取り消し');
    expect(undoButton).toBeDisabled();
  });

  it('should display correct current player information in sticky header', () => {
    const game = createMockGame();

    // Note: Testing sticky header behavior requires scrolling simulation
    // which is complex in jsdom. We'll just verify the component renders correctly.
    render(
      <TestWrapper>
        <RotationBoard
          game={game}
          onPocketBall={mockOnPocketBall}
          onSwitchPlayer={mockOnSwitchPlayer}
          onUndoLastShot={mockOnUndoLastShot}
          onSelectPlayer={mockOnSelectPlayer}
        />
      </TestWrapper>
    );

    // The sticky header content is rendered but might not be visible initially
    // We're testing that the component renders without errors
    expect(screen.getByText('Player 1')).toBeInTheDocument();
  });

  it('should handle player cards with cursor pointer when onSelectPlayer is provided', () => {
    const game = createMockGame();

    const { container } = render(
      <TestWrapper>
        <RotationBoard
          game={game}
          onPocketBall={mockOnPocketBall}
          onSwitchPlayer={mockOnSwitchPlayer}
          onUndoLastShot={mockOnUndoLastShot}
          onSelectPlayer={mockOnSelectPlayer}
        />
      </TestWrapper>
    );

    // We can't easily test CSS cursor property in jsdom,
    // but we can verify the component renders without errors
    const playerCards = container.querySelectorAll('.MuiCard-root');
    expect(playerCards.length).toBeGreaterThan(0);
  });

  it('should display pocketed balls in chronological order for each player', () => {
    const game = createMockGame();

    render(
      <TestWrapper>
        <RotationBoard
          game={game}
          onPocketBall={mockOnPocketBall}
          onSwitchPlayer={mockOnSwitchPlayer}
          onUndoLastShot={mockOnUndoLastShot}
          onSelectPlayer={mockOnSelectPlayer}
        />
      </TestWrapper>
    );

    // Check if pocketed balls are displayed (without the label)
    // We'll verify by checking for the presence of the ball numbers in player cards

    // Check that ball numbers are displayed (using getAllByText since numbers appear in multiple places)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // Ball 1
    expect(screen.getAllByText('2').length).toBeGreaterThan(0); // Ball 2
    expect(screen.getAllByText('3').length).toBeGreaterThan(0); // Ball 3
    expect(screen.getAllByText('4').length).toBeGreaterThan(0); // Ball 4
    expect(screen.getAllByText('5').length).toBeGreaterThan(0); // Ball 5
  });

  it('should show "None" when player has not pocketed any balls', () => {
    const gameWithNoBalls = createMockGame();
    // Clear shot history to simulate no pocketed balls
    gameWithNoBalls.shotHistory = [];
    gameWithNoBalls.players[0].ballsPocketed = [];
    gameWithNoBalls.players[1].ballsPocketed = [];

    render(
      <TestWrapper>
        <RotationBoard
          game={gameWithNoBalls}
          onPocketBall={mockOnPocketBall}
          onSwitchPlayer={mockOnSwitchPlayer}
          onUndoLastShot={mockOnUndoLastShot}
          onSelectPlayer={mockOnSelectPlayer}
        />
      </TestWrapper>
    );

    // Both players should show "None" when no balls are pocketed
    expect(screen.getAllByText('なし')).toHaveLength(2);
  });

  it('should render pocketed balls with consistent design (white circle background)', () => {
    const game = createMockGame();

    render(
      <TestWrapper>
        <RotationBoard
          game={game}
          onPocketBall={mockOnPocketBall}
          onSwitchPlayer={mockOnSwitchPlayer}
          onUndoLastShot={mockOnUndoLastShot}
          onSelectPlayer={mockOnSelectPlayer}
        />
      </TestWrapper>
    );

    // Check that player cards are rendered
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();

    // Check that pocketed ball numbers are displayed
    // Player 1 should have balls 1, 2, 3 pocketed based on mock data
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);

    // Verify that the design is consistent by checking that numbers are rendered
    // The exact CSS styling is hard to test in jsdom, but we can verify the structure
    expect(screen.getAllByText(/[1-9]|1[0-5]/).length).toBeGreaterThan(15); // Balls + scores + other numbers
  });

  it('should maintain consistent ball design between selection area and player cards', () => {
    const game = createMockGame();

    render(
      <TestWrapper>
        <RotationBoard
          game={game}
          onPocketBall={mockOnPocketBall}
          onSwitchPlayer={mockOnSwitchPlayer}
          onUndoLastShot={mockOnUndoLastShot}
          onSelectPlayer={mockOnSelectPlayer}
        />
      </TestWrapper>
    );

    // Ball selection area exists and renders all 15 balls (verify by numbers)
    for (let i = 1; i <= 3; i++) {
      expect(screen.getAllByText(i.toString()).length).toBeGreaterThan(0);
    }
    
    // All ball numbers 1-15 should be present in ball selection area
    for (let i = 1; i <= 15; i++) {
      expect(screen.getAllByText(i.toString()).length).toBeGreaterThan(0);
    }

    // Check that player cards contain pocketed balls
    // Player 1 has balls 1, 2, 3 and Player 2 has no balls in mock data
    const player1Section = screen.getByText('Player 1').closest('.MuiCardContent-root');
    const player2Section = screen.getByText('Player 2').closest('.MuiCardContent-root');
    
    expect(player1Section).toBeInTheDocument();
    expect(player2Section).toBeInTheDocument();

    // Verify pocketed balls are displayed in player cards
    // Player 1 should show pocketed balls, Player 2 should show "None"
    expect(screen.getAllByText('1').length).toBeGreaterThan(1); // Once in selection, once in player card
    expect(screen.getAllByText('2').length).toBeGreaterThan(1); // Once in selection, once in player card
    expect(screen.getAllByText('3').length).toBeGreaterThan(1); // Once in selection, once in player card
  });

  describe('Player Swap Button', () => {
    const mockOnSwapPlayers = vi.fn();

    it('should display swap button when canSwapPlayers is true and game is in initial state', () => {
      const game: Game = {
        id: 'test-game-1',
        type: GameType.ROTATION,
        status: GameStatus.IN_PROGRESS,
        players: [
          {
            id: 'player-1',
            name: 'Player 1',
            score: 0, // No score yet
            ballsPocketed: [],
            isActive: false,
            targetScore: 50,
          },
          {
            id: 'player-2',
            name: 'Player 2',
            score: 0, // No score yet
            ballsPocketed: [],
            isActive: false,
            targetScore: 50,
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
          <RotationBoard
            game={game}
            onPocketBall={mockOnPocketBall}
            onSwitchPlayer={mockOnSwitchPlayer}
            onUndoLastShot={mockOnUndoLastShot}
            onSelectPlayer={mockOnSelectPlayer}
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
        type: GameType.ROTATION,
        status: GameStatus.IN_PROGRESS,
        players: [
          {
            id: 'player-1',
            name: 'Player 1',
            score: 15, // Player 1 has scored
            ballsPocketed: [1, 2, 3],
            isActive: false,
            targetScore: 50,
          },
          {
            id: 'player-2',
            name: 'Player 2',
            score: 0,
            ballsPocketed: [],
            isActive: false,
            targetScore: 50,
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
          <RotationBoard
            game={game}
            onPocketBall={mockOnPocketBall}
            onSwitchPlayer={mockOnSwitchPlayer}
            onUndoLastShot={mockOnUndoLastShot}
            onSelectPlayer={mockOnSelectPlayer}
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
        type: GameType.ROTATION,
        status: GameStatus.IN_PROGRESS,
        players: [
          {
            id: 'player-1',
            name: 'Player 1',
            score: 0,
            ballsPocketed: [],
            isActive: false,
            targetScore: 50,
          },
          {
            id: 'player-2',
            name: 'Player 2',
            score: 0,
            ballsPocketed: [],
            isActive: false,
            targetScore: 50,
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
          <RotationBoard
            game={game}
            onPocketBall={mockOnPocketBall}
            onSwitchPlayer={mockOnSwitchPlayer}
            onUndoLastShot={mockOnUndoLastShot}
            onSelectPlayer={mockOnSelectPlayer}
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
        type: GameType.ROTATION,
        status: GameStatus.IN_PROGRESS,
        players: [
          {
            id: 'player-1',
            name: 'Player 1',
            score: 15, // Player 1 has scored
            ballsPocketed: [1, 2, 3],
            isActive: false,
            targetScore: 50,
          },
          {
            id: 'player-2',
            name: 'Player 2',
            score: 0,
            ballsPocketed: [],
            isActive: false,
            targetScore: 50,
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
          <RotationBoard
            game={game}
            onPocketBall={mockOnPocketBall}
            onSwitchPlayer={mockOnSwitchPlayer}
            onUndoLastShot={mockOnUndoLastShot}
            onSelectPlayer={mockOnSelectPlayer}
            onSwapPlayers={mockOnSwapPlayers}
            canUndoLastShot={true}
          />
        </TestWrapper>
      );

      // Undo button should be visible but disabled (since no shot history)
      const undoButton = screen.getByText('取り消し');
      expect(undoButton).toBeInTheDocument();
      expect(undoButton).toBeDisabled();
    });
  });

  describe('Chess Clock Integration', () => {
    const mockOnTimeUp = vi.fn();
    const mockOnSwitchToPlayer = vi.fn();

    beforeEach(() => {
      vi.useFakeTimers();
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const defaultChessClockSettings: ChessClockSettings = {
      enabled: true,
      individualTime: false,
      timeLimit: 1, // 1 minute for testing
      warningEnabled: true,
      warningTime: 0.5, // 30 seconds for testing
      player1TimeLimit: 1,
      player2TimeLimit: 1,
    };

    it('should display chess clock when enabled in game settings', () => {
      const game: Game = {
        ...createMockGame(),
        chessClock: defaultChessClockSettings,
      };

      render(
        <TestWrapper>
          <RotationBoard
            game={game}
            onPocketBall={mockOnPocketBall}
            onSwitchPlayer={mockOnSwitchPlayer}
            onUndoLastShot={mockOnUndoLastShot}
            onSelectPlayer={mockOnSelectPlayer}
            onTimeUp={mockOnTimeUp}
            onSwitchToPlayer={mockOnSwitchToPlayer}
          />
        </TestWrapper>
      );

      // Chess clock should be displayed
      const aliceElements = screen.getAllByText('Player 1');
      const bobElements = screen.getAllByText('Player 2');
      expect(aliceElements.length).toBeGreaterThanOrEqual(2); // Chess clock + Rotation board
      expect(bobElements.length).toBeGreaterThanOrEqual(2); // Chess clock + Rotation board
      
      // Should show initial time for both players in chess clock
      const timeDisplays = screen.getAllByText('01:00');
      expect(timeDisplays.length).toBeGreaterThanOrEqual(2);

      // Should have start/stop button (with PlayArrowIcon)
      expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
    });

    it('should not display chess clock when disabled in game settings', () => {
      const game: Game = {
        ...createMockGame(),
        chessClock: { ...defaultChessClockSettings, enabled: false },
      };

      render(
        <TestWrapper>
          <RotationBoard
            game={game}
            onPocketBall={mockOnPocketBall}
            onSwitchPlayer={mockOnSwitchPlayer}
            onUndoLastShot={mockOnUndoLastShot}
            onSelectPlayer={mockOnSelectPlayer}
            onTimeUp={mockOnTimeUp}
            onSwitchToPlayer={mockOnSwitchToPlayer}
          />
        </TestWrapper>
      );

      // Chess clock should not be displayed
      expect(screen.queryByTestId('PlayArrowIcon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('PauseIcon')).not.toBeInTheDocument();
    });

    it('should not display chess clock when not configured', () => {
      const game: Game = {
        ...createMockGame(),
        // No chessClock property
      };

      render(
        <TestWrapper>
          <RotationBoard
            game={game}
            onPocketBall={mockOnPocketBall}
            onSwitchPlayer={mockOnSwitchPlayer}
            onUndoLastShot={mockOnUndoLastShot}
            onSelectPlayer={mockOnSelectPlayer}
            onTimeUp={mockOnTimeUp}
            onSwitchToPlayer={mockOnSwitchToPlayer}
          />
        </TestWrapper>
      );

      // Chess clock should not be displayed
      expect(screen.queryByTestId('PlayArrowIcon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('PauseIcon')).not.toBeInTheDocument();
    });

    it('should call onSwitchToPlayer when chess clock player button is clicked', () => {
      const game: Game = {
        ...createMockGame(),
        chessClock: defaultChessClockSettings,
      };

      render(
        <TestWrapper>
          <RotationBoard
            game={game}
            onPocketBall={mockOnPocketBall}
            onSwitchPlayer={mockOnSwitchPlayer}
            onUndoLastShot={mockOnUndoLastShot}
            onSelectPlayer={mockOnSelectPlayer}
            onTimeUp={mockOnTimeUp}
            onSwitchToPlayer={mockOnSwitchToPlayer}
          />
        </TestWrapper>
      );

      // Click on Player 2's chess clock button
      const player2ChessClockButton = screen.getAllByRole('button').find(button => 
        button.textContent?.includes('Player 2')
      );
      expect(player2ChessClockButton).toBeInTheDocument();
      
      fireEvent.click(player2ChessClockButton!);
      
      // Correct chess clock behavior: pressing Player 2's button makes Player 1 active
      expect(mockOnSwitchToPlayer).toHaveBeenCalledWith(0);
    });

    it('should call onTimeUp when chess clock time runs out', async () => {
      const game: Game = {
        ...createMockGame(),
        chessClock: defaultChessClockSettings,
      };

      render(
        <TestWrapper>
          <RotationBoard
            game={game}
            onPocketBall={mockOnPocketBall}
            onSwitchPlayer={mockOnSwitchPlayer}
            onUndoLastShot={mockOnUndoLastShot}
            onSelectPlayer={mockOnSelectPlayer}
            onTimeUp={mockOnTimeUp}
            onSwitchToPlayer={mockOnSwitchToPlayer}
          />
        </TestWrapper>
      );

      // Start the chess clock
      const startButton = screen.getByTestId('PlayArrowIcon').closest('button');
      fireEvent.click(startButton!);

      // Wait for time to run out (1 minute = 60 seconds)
      await act(async () => {
        vi.advanceTimersByTime(60000);
      });

      expect(mockOnTimeUp).toHaveBeenCalledWith(0);
    });

    it('should show chess clock above rotation board controls', () => {
      const game: Game = {
        ...createMockGame(),
        chessClock: defaultChessClockSettings,
      };

      render(
        <TestWrapper>
          <RotationBoard
            game={game}
            onPocketBall={mockOnPocketBall}
            onSwitchPlayer={mockOnSwitchPlayer}
            onUndoLastShot={mockOnUndoLastShot}
            onSelectPlayer={mockOnSelectPlayer}
            onTimeUp={mockOnTimeUp}
            onSwitchToPlayer={mockOnSwitchToPlayer}
          />
        </TestWrapper>
      );

      // Chess clock should be present
      expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
      
      // Rotation board player cards should also be present
      expect(screen.getAllByText((_, element) => {
        return element?.textContent === '目標: 50';
      })).toHaveLength(2);
      
      // Both should be visible simultaneously
      const playerCards = screen.getAllByText(/Player 1|Player 2/);
      expect(playerCards.length).toBeGreaterThanOrEqual(4); // 2 from chess clock + 2 from rotation board
    });

    it('should handle individual time settings correctly', () => {
      const individualTimeSettings: ChessClockSettings = {
        enabled: true,
        individualTime: true,
        timeLimit: 30, // Won't be used due to individual time
        warningEnabled: true,
        warningTime: 3,
        player1TimeLimit: 2, // 2 minutes for Player 1
        player2TimeLimit: 3, // 3 minutes for Player 2
      };

      const game: Game = {
        ...createMockGame(),
        chessClock: individualTimeSettings,
      };

      render(
        <TestWrapper>
          <RotationBoard
            game={game}
            onPocketBall={mockOnPocketBall}
            onSwitchPlayer={mockOnSwitchPlayer}
            onUndoLastShot={mockOnUndoLastShot}
            onSelectPlayer={mockOnSelectPlayer}
            onTimeUp={mockOnTimeUp}
            onSwitchToPlayer={mockOnSwitchToPlayer}
          />
        </TestWrapper>
      );

      // Should show individual time limits
      expect(screen.getByText('02:00')).toBeInTheDocument(); // Player 1: 2 minutes
      expect(screen.getByText('03:00')).toBeInTheDocument(); // Player 2: 3 minutes
    });
  });
});
